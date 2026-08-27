-- Insert Kronova Subscription Plans (Safe Upsert)
-- This script inserts new Kronova-branded plans without affecting existing data
-- Uses ON CONFLICT to prevent duplicates
-- Version: 1.0
-- Date: 2026-01-16

-- Insert Kronova Lite Plan
INSERT INTO public.roi_calc_comparable_plans (
    provider, plan_id, name, monthly_price, yearly_price, 
    monthly_standard_price, yearly_standard_price,
    features, limits, recommended, is_kronova_plan, brand, active,
    is_introductory
) VALUES (
    'Kronova', 'kronova-lite', 'Lite',
    9, 108, 19, 228,
    ARRAY['100,000 AI tokens/month', '100 managed assets', '1 team member', 'Basic support'],
    '{"ai_tokens": 100000, "managed_assets": 100, "storage": 1, "team_members": 1, "api_calls": 1000}'::jsonb,
    false, true, 'kronova', true, true
)
ON CONFLICT (plan_id) DO UPDATE SET
    provider = EXCLUDED.provider,
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    monthly_standard_price = EXCLUDED.monthly_standard_price,
    yearly_standard_price = EXCLUDED.yearly_standard_price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    is_kronova_plan = EXCLUDED.is_kronova_plan,
    brand = EXCLUDED.brand,
    active = EXCLUDED.active,
    is_introductory = EXCLUDED.is_introductory,
    updated_at = NOW();

-- Insert Kronova Starter Plan
INSERT INTO public.roi_calc_comparable_plans (
    provider, plan_id, name, monthly_price, yearly_price,
    features, limits, recommended, is_kronova_plan, brand, active
) VALUES (
    'Kronova', 'kronova-starter', 'Starter',
    99, 990,
    ARRAY['1,000,000 AI tokens/month', '1,000 managed assets', '5 team members', 'Basic analytics'],
    '{"ai_tokens": 1000000, "managed_assets": 1000, "storage": 5, "team_members": 5, "api_calls": 10000}'::jsonb,
    false, true, 'kronova', true
)
ON CONFLICT (plan_id) DO UPDATE SET
    provider = EXCLUDED.provider,
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    is_kronova_plan = EXCLUDED.is_kronova_plan,
    brand = EXCLUDED.brand,
    active = EXCLUDED.active,
    updated_at = NOW();

-- Insert Kronova Professional Plan
INSERT INTO public.roi_calc_comparable_plans (
    provider, plan_id, name, monthly_price, yearly_price,
    features, limits, recommended, is_kronova_plan, brand, active
) VALUES (
    'Kronova', 'kronova-professional', 'Professional',
    299, 2990,
    ARRAY['10,000,000 AI tokens/month', '10,000 managed assets', '25 team members', 'Advanced analytics', 'API access'],
    '{"ai_tokens": 10000000, "managed_assets": 10000, "storage": 50, "team_members": 25, "api_calls": 100000}'::jsonb,
    true, true, 'kronova', true
)
ON CONFLICT (plan_id) DO UPDATE SET
    provider = EXCLUDED.provider,
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    recommended = EXCLUDED.recommended,
    is_kronova_plan = EXCLUDED.is_kronova_plan,
    brand = EXCLUDED.brand,
    active = EXCLUDED.active,
    updated_at = NOW();

-- Insert Kronova Enterprise Plan
INSERT INTO public.roi_calc_comparable_plans (
    provider, plan_id, name, monthly_price, yearly_price,
    features, limits, recommended, is_kronova_plan, brand, active, custom_pricing
) VALUES (
    'Kronova', 'kronova-enterprise', 'Enterprise',
    999, 9990,
    ARRAY['Unlimited AI tokens', 'Unlimited managed assets', 'Unlimited team members', 'Custom integrations', 'Dedicated support', '24/7 priority support', 'Custom SLA'],
    '{"ai_tokens": -1, "managed_assets": -1, "storage": 500, "team_members": -1, "api_calls": -1}'::jsonb,
    false, true, 'kronova', true, false
)
ON CONFLICT (plan_id) DO UPDATE SET
    provider = EXCLUDED.provider,
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    is_kronova_plan = EXCLUDED.is_kronova_plan,
    brand = EXCLUDED.brand,
    active = EXCLUDED.active,
    updated_at = NOW();

-- Deactivate any legacy Resend-It branded plans (preserve data, just hide from users)
UPDATE public.roi_calc_comparable_plans 
SET active = false, brand = 'legacy_resendit'
WHERE provider ILIKE '%resend%' 
   OR plan_id ILIKE '%resendit%'
   OR plan_id ILIKE '%resend-it%';

-- Log the migration result
DO $$
DECLARE
    kronova_count INTEGER;
    competitor_count INTEGER;
    legacy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO kronova_count FROM public.roi_calc_comparable_plans WHERE brand = 'kronova' AND active = true;
    SELECT COUNT(*) INTO competitor_count FROM public.roi_calc_comparable_plans WHERE brand = 'competitor' AND active = true;
    SELECT COUNT(*) INTO legacy_count FROM public.roi_calc_comparable_plans WHERE brand = 'legacy_resendit';
    
    RAISE NOTICE 'Migration complete: % Kronova plans, % competitor plans, % legacy plans (hidden)', 
        kronova_count, competitor_count, legacy_count;
END $$;
