-- Public ROI Assessments Table
-- Allows storing ROI calculations without requiring authentication
-- Links to user accounts when available for enhanced features

-- Create the public assessments table
CREATE TABLE IF NOT EXISTS public.roi_public_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Optional user reference (nullable for anonymous submissions)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Identification
  assessment_reference VARCHAR(20) UNIQUE NOT NULL, -- Human-readable reference like "ROI-2026-ABC123"
  email VARCHAR(255), -- Optional email for follow-up
  company_name VARCHAR(255), -- Optional company name
  
  -- Organization Profile
  employees INTEGER NOT NULL,
  avg_salary DECIMAL(12, 2) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  
  -- Current Operations Metrics
  manual_hours_per_week DECIMAL(10, 2) NOT NULL,
  error_rate_percentage DECIMAL(5, 2) NOT NULL,
  system_downtime_percentage DECIMAL(5, 2) NOT NULL,
  compliance_costs DECIMAL(12, 2) NOT NULL,
  
  -- Data & Infrastructure Assessment
  data_quality_score INTEGER NOT NULL CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  integration_complexity INTEGER NOT NULL CHECK (integration_complexity >= 0 AND integration_complexity <= 100),
  legacy_system_age_years INTEGER NOT NULL,
  cloud_readiness_score INTEGER NOT NULL CHECK (cloud_readiness_score >= 0 AND cloud_readiness_score <= 100),
  
  -- Strategic Factors
  ai_maturity_score INTEGER NOT NULL CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
  change_readiness_score INTEGER NOT NULL CHECK (change_readiness_score >= 0 AND change_readiness_score <= 100),
  executive_support_score INTEGER NOT NULL CHECK (executive_support_score >= 0 AND executive_support_score <= 100),
  competitive_pressure_score INTEGER NOT NULL CHECK (competitive_pressure_score >= 0 AND competitive_pressure_score <= 100),
  
  -- Hidden Costs (auto-calculated but stored for reference)
  data_preparation_costs DECIMAL(12, 2) DEFAULT 0,
  training_costs DECIMAL(12, 2) DEFAULT 0,
  maintenance_costs DECIMAL(12, 2) DEFAULT 0,
  security_costs DECIMAL(12, 2) DEFAULT 0,
  
  -- Selected Plan
  selected_plan VARCHAR(100) NOT NULL,
  
  -- Calculation Results
  current_annual_cost DECIMAL(14, 2) NOT NULL,
  kronova_annual_cost DECIMAL(14, 2) NOT NULL,
  annual_savings DECIMAL(14, 2) NOT NULL,
  roi_percentage DECIMAL(10, 2) NOT NULL,
  payback_months DECIMAL(10, 2) NOT NULL, -- Changed from INTEGER to support decimal precision
  three_year_savings DECIMAL(14, 2) NOT NULL,
  five_year_value DECIMAL(14, 2) NOT NULL,
  
  -- Detailed Savings Breakdown
  operational_savings DECIMAL(14, 2) NOT NULL,
  quality_savings DECIMAL(14, 2) NOT NULL,
  strategic_value DECIMAL(14, 2) NOT NULL,
  hidden_cost_reduction DECIMAL(14, 2) NOT NULL,
  
  -- Risk Factors (stored as decimal percentages 0-100)
  implementation_risk DECIMAL(10, 4) NOT NULL,
  data_quality_risk DECIMAL(10, 4) NOT NULL,
  adoption_risk DECIMAL(10, 4) NOT NULL,
  
  -- Performance Metrics (stored as decimal percentages 0-100)
  productivity_gain DECIMAL(10, 4) NOT NULL,
  error_reduction DECIMAL(10, 4) NOT NULL,
  time_to_value_months DECIMAL(10, 2) NOT NULL, -- Changed from INTEGER to support decimal precision
  
  -- Metadata
  source VARCHAR(50) DEFAULT 'web_calculator', -- 'web_calculator', 'api', 'admin', etc.
  ip_address INET, -- For analytics and rate limiting
  user_agent TEXT, -- Browser info for analytics
  utm_source VARCHAR(100), -- Marketing attribution
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- PDF Generation tracking
  pdf_generated_count INTEGER DEFAULT 0,
  last_pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Flags
  is_demo BOOLEAN DEFAULT false, -- True for demo/test calculations
  consent_marketing BOOLEAN DEFAULT false, -- Email marketing consent
  consent_follow_up BOOLEAN DEFAULT false, -- Sales follow-up consent
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_reference ON public.roi_public_assessments(assessment_reference);
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_user_id ON public.roi_public_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_email ON public.roi_public_assessments(email);
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_created_at ON public.roi_public_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_industry ON public.roi_public_assessments(industry);
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_company_size ON public.roi_public_assessments(company_size);
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_source ON public.roi_public_assessments(source);

-- Partial index for assessments with email (for follow-up queries)
CREATE INDEX IF NOT EXISTS idx_roi_public_assessments_has_email ON public.roi_public_assessments(email) WHERE email IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.roi_public_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can insert (public form submissions)
DROP POLICY IF EXISTS "Anyone can create assessment" ON public.roi_public_assessments;
CREATE POLICY "Anyone can create assessment" ON public.roi_public_assessments 
  FOR INSERT 
  WITH CHECK (true);

-- Anyone can view their own assessment by reference
DROP POLICY IF EXISTS "Anyone can view by reference" ON public.roi_public_assessments;
CREATE POLICY "Anyone can view by reference" ON public.roi_public_assessments 
  FOR SELECT 
  USING (true); -- Will filter by reference in application layer

-- Authenticated users can view all their assessments
DROP POLICY IF EXISTS "Users can view own assessments" ON public.roi_public_assessments;
CREATE POLICY "Users can view own assessments" ON public.roi_public_assessments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Authenticated users can update their own assessments
DROP POLICY IF EXISTS "Users can update own assessments" ON public.roi_public_assessments;
CREATE POLICY "Users can update own assessments" ON public.roi_public_assessments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_roi_public_assessments_updated_at ON public.roi_public_assessments;
CREATE TRIGGER update_roi_public_assessments_updated_at 
  BEFORE UPDATE ON public.roi_public_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique assessment reference
CREATE OR REPLACE FUNCTION generate_assessment_reference()
RETURNS TEXT AS $$
DECLARE
  new_ref TEXT;
  year_part TEXT;
  random_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  new_ref := 'ROI-' || year_part || '-' || random_part;
  RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference on insert if not provided
CREATE OR REPLACE FUNCTION set_assessment_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assessment_reference IS NULL OR NEW.assessment_reference = '' THEN
    NEW.assessment_reference := generate_assessment_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_assessment_reference ON public.roi_public_assessments;
CREATE TRIGGER trigger_set_assessment_reference
  BEFORE INSERT ON public.roi_public_assessments
  FOR EACH ROW EXECUTE FUNCTION set_assessment_reference();

-- Grant permissions
GRANT SELECT, INSERT ON public.roi_public_assessments TO anon;
GRANT SELECT, INSERT, UPDATE ON public.roi_public_assessments TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.roi_public_assessments IS 'Public ROI assessment submissions - supports both anonymous and authenticated users';
COMMENT ON COLUMN public.roi_public_assessments.assessment_reference IS 'Human-readable unique reference code for retrieving assessments';
COMMENT ON COLUMN public.roi_public_assessments.user_id IS 'Optional link to authenticated user account';
COMMENT ON COLUMN public.roi_public_assessments.source IS 'Where the assessment was created: web_calculator, api, admin, etc.';
COMMENT ON COLUMN public.roi_public_assessments.consent_marketing IS 'User consent for marketing communications';
COMMENT ON COLUMN public.roi_public_assessments.consent_follow_up IS 'User consent for sales follow-up';
