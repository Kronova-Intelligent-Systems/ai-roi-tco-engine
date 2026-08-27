-- ROI Calculator Tables for Supabase
-- Uses profiles table with auth.uid instead of separate users table

-- Create profiles table if it doesn't exist (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roi_calculations table to store calculation history
CREATE TABLE IF NOT EXISTS public.roi_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Organization Profile
  employees INTEGER NOT NULL,
  avg_salary DECIMAL(12, 2) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  
  -- Current AI Usage
  current_monthly_ai_spend DECIMAL(12, 2) DEFAULT 0,
  current_ai_tools_count INTEGER DEFAULT 0,
  current_automation_level VARCHAR(50) DEFAULT 'none',
  
  -- AI Implementation Details
  processes_to_automate INTEGER NOT NULL,
  avg_process_time_hours DECIMAL(10, 2) NOT NULL,
  process_frequency_per_month INTEGER NOT NULL,
  error_rate_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Cost Factors
  data_preparation_costs DECIMAL(12, 2) DEFAULT 0,
  training_costs DECIMAL(12, 2) DEFAULT 0,
  maintenance_costs DECIMAL(12, 2) DEFAULT 0,
  
  -- Quality Metrics
  current_customer_satisfaction DECIMAL(5, 2) DEFAULT 0,
  target_customer_satisfaction DECIMAL(5, 2) DEFAULT 0,
  compliance_requirements BOOLEAN DEFAULT false,
  
  -- Strategic Factors
  time_to_market_days INTEGER DEFAULT 0,
  innovation_priority VARCHAR(50) DEFAULT 'medium',
  competitive_pressure VARCHAR(50) DEFAULT 'medium',
  
  -- Risk Assessment
  data_quality_score DECIMAL(5, 2) DEFAULT 0,
  team_ai_readiness VARCHAR(50) DEFAULT 'medium',
  integration_complexity VARCHAR(50) DEFAULT 'medium',
  
  -- Selected Plan
  selected_plan_id VARCHAR(50) NOT NULL,
  
  -- Calculation Results (stored as JSONB for flexibility)
  results JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roi_calc_comparable_plans table for AI SaaS subscription plans
-- Updated schema to use is_kronova_plan and brand columns instead of is_resend_it_plan
CREATE TABLE IF NOT EXISTS public.roi_calc_comparable_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(100) NOT NULL,
  plan_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  
  -- Pricing
  monthly_price DECIMAL(10, 2),
  yearly_price DECIMAL(10, 2),
  monthly_standard_price DECIMAL(10, 2), -- For promotional pricing
  yearly_standard_price DECIMAL(10, 2),  -- For promotional pricing
  custom_pricing BOOLEAN DEFAULT false,
  pay_as_you_go BOOLEAN DEFAULT false,
  is_introductory BOOLEAN DEFAULT false,
  
  -- Features (stored as array)
  features TEXT[] NOT NULL,
  
  -- Limits (stored as JSONB for flexibility)
  limits JSONB NOT NULL,
  
  -- Metadata
  recommended BOOLEAN DEFAULT false,
  is_kronova_plan BOOLEAN DEFAULT false,  -- True for Kronova-branded plans
  brand VARCHAR(50) DEFAULT 'competitor', -- 'kronova', 'competitor', or 'legacy_resendit'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create industry_benchmarks table
CREATE TABLE IF NOT EXISTS public.industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry VARCHAR(100) UNIQUE NOT NULL,
  
  -- Benchmark Metrics
  automation_potential INTEGER NOT NULL, -- Percentage
  avg_roi INTEGER NOT NULL, -- Percentage
  implementation_time INTEGER NOT NULL, -- Months
  
  -- Use Cases and Challenges (stored as arrays)
  top_use_cases TEXT[] NOT NULL,
  challenges TEXT[] NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_user_id ON public.roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_created_at ON public.roi_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_industry ON public.roi_calculations(industry);
CREATE INDEX IF NOT EXISTS idx_roi_calc_comparable_plans_provider ON public.roi_calc_comparable_plans(provider);
CREATE INDEX IF NOT EXISTS idx_roi_calc_comparable_plans_active ON public.roi_calc_comparable_plans(active);
-- Updated index to use is_kronova_plan instead of is_resend_it_plan
CREATE INDEX IF NOT EXISTS idx_roi_calc_comparable_plans_is_kronova ON public.roi_calc_comparable_plans(is_kronova_plan);
CREATE INDEX IF NOT EXISTS idx_roi_calc_comparable_plans_brand ON public.roi_calc_comparable_plans(brand);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_industry ON public.industry_benchmarks(industry);

-- Add updated_at triggers
-- Made triggers idempotent by dropping before creating to avoid "already exists" errors
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roi_calculations_updated_at ON public.roi_calculations;
CREATE TRIGGER update_roi_calculations_updated_at BEFORE UPDATE ON public.roi_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roi_calc_comparable_plans_updated_at ON public.roi_calc_comparable_plans;
CREATE TRIGGER update_roi_calc_comparable_plans_updated_at BEFORE UPDATE ON public.roi_calc_comparable_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_industry_benchmarks_updated_at ON public.industry_benchmarks;
CREATE TRIGGER update_industry_benchmarks_updated_at BEFORE UPDATE ON public.industry_benchmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_calc_comparable_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Made policies idempotent by dropping before creating
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ROI calculations policies
DROP POLICY IF EXISTS "Users can view own calculations" ON public.roi_calculations;
CREATE POLICY "Users can view own calculations" ON public.roi_calculations 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calculations" ON public.roi_calculations;
CREATE POLICY "Users can insert own calculations" ON public.roi_calculations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own calculations" ON public.roi_calculations;
CREATE POLICY "Users can update own calculations" ON public.roi_calculations 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own calculations" ON public.roi_calculations;
CREATE POLICY "Users can delete own calculations" ON public.roi_calculations 
  FOR DELETE USING (auth.uid() = user_id);

-- Updated RLS policy to filter by brand, excluding legacy_resendit plans
DROP POLICY IF EXISTS "Anyone can view comparable plans" ON public.roi_calc_comparable_plans;
CREATE POLICY "Anyone can view comparable plans" ON public.roi_calc_comparable_plans 
  FOR SELECT USING (
    active = true 
    AND (brand = 'kronova' OR brand = 'competitor')
  );

DROP POLICY IF EXISTS "Anyone can view industry benchmarks" ON public.industry_benchmarks;
CREATE POLICY "Anyone can view industry benchmarks" ON public.industry_benchmarks 
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.roi_calc_comparable_plans TO anon, authenticated;
GRANT SELECT ON public.industry_benchmarks TO anon, authenticated;
GRANT ALL ON public.roi_calculations TO authenticated;

-- Insert default industry benchmarks
INSERT INTO public.industry_benchmarks (industry, automation_potential, avg_roi, implementation_time, top_use_cases, challenges) VALUES
  ('Technology', 75, 320, 6, ARRAY['Code automation', 'DevOps automation', 'Customer support'], ARRAY['Integration complexity', 'Legacy systems', 'Skills gap']),
  ('Finance', 68, 285, 8, ARRAY['Fraud detection', 'Risk assessment', 'Document processing'], ARRAY['Regulatory compliance', 'Data security', 'System integration']),
  ('Healthcare', 62, 245, 10, ARRAY['Patient scheduling', 'Claims processing', 'Diagnostic support'], ARRAY['HIPAA compliance', 'Data privacy', 'Change management']),
  ('Manufacturing', 80, 340, 7, ARRAY['Quality control', 'Predictive maintenance', 'Supply chain optimization'], ARRAY['Equipment integration', 'Worker training', 'Initial investment']),
  ('Retail', 70, 290, 6, ARRAY['Inventory management', 'Demand forecasting', 'Customer service'], ARRAY['Seasonal variability', 'Omnichannel integration', 'Customer acceptance']),
  ('Logistics', 72, 295, 7, ARRAY['Route optimization', 'Warehouse automation', 'Demand forecasting'], ARRAY['Integration complexity', 'Legacy systems', 'Change management']),
  ('General', 65, 250, 8, ARRAY['Process automation', 'Data analysis', 'Customer engagement'], ARRAY['Change management', 'ROI measurement', 'Skills development'])
ON CONFLICT (industry) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON TABLE public.roi_calculations IS 'Historical record of all ROI calculations performed by users';
COMMENT ON TABLE public.roi_calc_comparable_plans IS 'AI SaaS subscription plans for comparison in ROI calculations - Kronova branded';
COMMENT ON TABLE public.industry_benchmarks IS 'Industry-specific benchmarks for ROI calculations';
COMMENT ON COLUMN public.roi_calc_comparable_plans.brand IS 'Plan brand: kronova, competitor, or legacy_resendit (hidden from users)';
COMMENT ON COLUMN public.roi_calc_comparable_plans.is_kronova_plan IS 'True for Kronova-branded subscription plans';
