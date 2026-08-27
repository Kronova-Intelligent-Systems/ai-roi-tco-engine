-- Safe Migration: Rebrand ROI Calculator Plans from Resend-It to Kronova
-- This script safely migrates existing plans WITHOUT overwriting any data
-- Version: 1.0
-- Date: 2026-01-16

-- Step 1: Add brand column if it doesn't exist (allows tracking both brands)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roi_calc_comparable_plans' 
                   AND column_name = 'brand') THEN
        ALTER TABLE public.roi_calc_comparable_plans 
        ADD COLUMN brand VARCHAR(50) DEFAULT 'competitor';
        
        RAISE NOTICE 'Added brand column to roi_calc_comparable_plans';
    ELSE
        RAISE NOTICE 'brand column already exists';
    END IF;
END $$;

-- Step 2: Add is_kronova_plan column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roi_calc_comparable_plans' 
                   AND column_name = 'is_kronova_plan') THEN
        ALTER TABLE public.roi_calc_comparable_plans 
        ADD COLUMN is_kronova_plan BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added is_kronova_plan column to roi_calc_comparable_plans';
    ELSE
        RAISE NOTICE 'is_kronova_plan column already exists';
    END IF;
END $$;

-- Step 3: Migrate is_resend_it_plan values to is_kronova_plan (if is_resend_it_plan exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'roi_calc_comparable_plans' 
               AND column_name = 'is_resend_it_plan') THEN
        -- Update is_kronova_plan based on is_resend_it_plan values
        UPDATE public.roi_calc_comparable_plans 
        SET is_kronova_plan = is_resend_it_plan,
            brand = CASE WHEN is_resend_it_plan = true THEN 'legacy_resendit' ELSE 'competitor' END
        WHERE is_kronova_plan IS NULL OR is_kronova_plan = false;
        
        RAISE NOTICE 'Migrated is_resend_it_plan values to is_kronova_plan';
    END IF;
END $$;

-- Step 4: Update brand to 'kronova' for all plans marked as is_kronova_plan
UPDATE public.roi_calc_comparable_plans 
SET brand = 'kronova' 
WHERE is_kronova_plan = true AND brand != 'kronova';

-- Step 5: Mark legacy Resend-It plans as inactive (soft delete - data preserved)
UPDATE public.roi_calc_comparable_plans 
SET active = false,
    brand = 'legacy_resendit'
WHERE brand = 'legacy_resendit' OR (is_kronova_plan = true AND provider ILIKE '%resend%');

-- Step 6: Create index for efficient brand filtering
CREATE INDEX IF NOT EXISTS idx_roi_calc_comparable_plans_brand 
ON public.roi_calc_comparable_plans(brand);

CREATE INDEX IF NOT EXISTS idx_roi_calc_comparable_plans_is_kronova 
ON public.roi_calc_comparable_plans(is_kronova_plan) 
WHERE is_kronova_plan = true;

-- Step 7: Update RLS policy to filter by brand (drop and recreate for safety)
DO $$ 
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Anyone can view comparable plans" ON public.roi_calc_comparable_plans;
    
    -- Create new policy that only shows active Kronova or competitor plans
    CREATE POLICY "Anyone can view comparable plans" ON public.roi_calc_comparable_plans 
    FOR SELECT USING (
        active = true 
        AND (brand = 'kronova' OR brand = 'competitor')
    );
    
    RAISE NOTICE 'Updated RLS policy to filter out legacy Resend-It plans';
END $$;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN public.roi_calc_comparable_plans.brand IS 'Plan brand: kronova, competitor, or legacy_resendit (hidden from users)';
COMMENT ON COLUMN public.roi_calc_comparable_plans.is_kronova_plan IS 'True for Kronova-branded subscription plans';

-- Verification query (run manually to verify migration)
-- SELECT brand, is_kronova_plan, active, COUNT(*) 
-- FROM public.roi_calc_comparable_plans 
-- GROUP BY brand, is_kronova_plan, active 
-- ORDER BY brand;
