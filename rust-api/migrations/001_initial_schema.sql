-- Initial Schema for AI ROI Calculator Microservice
-- This migration creates all necessary tables for the ROI calculator backend

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roi_users table
CREATE TABLE IF NOT EXISTS roi_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Create industry_benchmarks table
CREATE TABLE IF NOT EXISTS industry_benchmarks (
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


-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';



-- Insert default industry benchmarks
INSERT INTO industry_benchmarks (industry, automation_potential, avg_roi, implementation_time, top_use_cases, challenges) VALUES
    ('Technology', 75, 320, 6, ARRAY['Code automation', 'DevOps automation', 'Customer support'], ARRAY['Integration complexity', 'Legacy systems', 'Skills gap']),
    ('Finance', 68, 285, 8, ARRAY['Fraud detection', 'Risk assessment', 'Document processing'], ARRAY['Regulatory compliance', 'Data security', 'System integration']),
    ('Healthcare', 62, 245, 10, ARRAY['Patient scheduling', 'Claims processing', 'Diagnostic support'], ARRAY['HIPAA compliance', 'Data privacy', 'Change management']),
    ('Manufacturing', 80, 340, 7, ARRAY['Quality control', 'Predictive maintenance', 'Supply chain optimization'], ARRAY['Equipment integration', 'Worker training', 'Initial investment']),
    ('Retail', 70, 290, 6, ARRAY['Inventory management', 'Demand forecasting', 'Customer service'], ARRAY['Seasonal variability', 'Omnichannel integration', 'Customer acceptance']),
    ('General', 65, 250, 8, ARRAY['Process automation', 'Data analysis', 'Customer engagement'], ARRAY['Change management', 'ROI measurement', 'Skills development'])
ON CONFLICT (industry) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE roi_users IS 'User accounts for ROI calculator access';
COMMENT ON TABLE industry_benchmarks IS 'Industry-specific benchmarks for ROI calculations';
