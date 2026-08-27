-- Fix numeric field overflow errors by expanding precision for all percentage and time fields
-- This migration fixes two issues:
-- 1. payback_months and time_to_value_months: INTEGER -> DECIMAL(10, 2) for decimal precision
-- 2. Risk and performance metrics: DECIMAL(5, 4) -> DECIMAL(10, 4) to prevent overflow

-- Fix payback and time fields (support decimal months like 3.45)
ALTER TABLE public.roi_public_assessments 
  ALTER COLUMN payback_months TYPE DECIMAL(10, 2),
  ALTER COLUMN time_to_value_months TYPE DECIMAL(10, 2);

-- Fix risk factor fields (expand from DECIMAL(5,4) to DECIMAL(10,4) to support values up to 999.9999)
ALTER TABLE public.roi_public_assessments 
  ALTER COLUMN implementation_risk TYPE DECIMAL(10, 4),
  ALTER COLUMN data_quality_risk TYPE DECIMAL(10, 4),
  ALTER COLUMN adoption_risk TYPE DECIMAL(10, 4);

-- Fix performance metric fields (expand from DECIMAL(5,4) to DECIMAL(10,4) to support percentage values)
ALTER TABLE public.roi_public_assessments 
  ALTER COLUMN productivity_gain TYPE DECIMAL(10, 4),
  ALTER COLUMN error_reduction TYPE DECIMAL(10, 4);

-- Add comments for documentation
COMMENT ON COLUMN public.roi_public_assessments.payback_months IS 'Payback period in months with 2 decimal precision (e.g., 3.45 months)';
COMMENT ON COLUMN public.roi_public_assessments.time_to_value_months IS 'Time to value in months with 2 decimal precision (e.g., 2.75 months)';
COMMENT ON COLUMN public.roi_public_assessments.implementation_risk IS 'Implementation risk score as decimal (0-100 with 4 decimal places)';
COMMENT ON COLUMN public.roi_public_assessments.productivity_gain IS 'Productivity gain percentage as decimal (0-100 with 4 decimal places)';
COMMENT ON COLUMN public.roi_public_assessments.error_reduction IS 'Error reduction percentage as decimal (0-100 with 4 decimal places)';
