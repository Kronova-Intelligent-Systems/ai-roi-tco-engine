-- Migration: Add Nebius, Perplexity, Fireworks and Link ai_models to roi_calc_comparable_plans
-- Description: Adds missing providers and creates a junction table to link models with plans
-- Date: 2026-01-22
-- Sources: nebius.com/token-factory/prices, fireworks.ai/pricing, perplexity.ai/pricing

-- ============================================================================
-- PART 0: Ensure trigger function and constraints exist
-- ============================================================================

-- Ensure update_updated_at_column trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Ensure plan_id in roi_calc_comparable_plans has UNIQUE constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'roi_calc_comparable_plans_plan_id_key' 
        AND conrelid = 'public.roi_calc_comparable_plans'::regclass
    ) THEN
        ALTER TABLE public.roi_calc_comparable_plans 
        ADD CONSTRAINT roi_calc_comparable_plans_plan_id_key UNIQUE (plan_id);
        RAISE NOTICE 'Added UNIQUE constraint on roi_calc_comparable_plans.plan_id';
    END IF;
END $$;

-- Ensure ai_models table has UNIQUE constraint on model_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ai_models_model_id_key' 
        AND conrelid = 'public.ai_models'::regclass
    ) THEN
        ALTER TABLE public.ai_models 
        ADD CONSTRAINT ai_models_model_id_key UNIQUE (model_id);
        RAISE NOTICE 'Added UNIQUE constraint on ai_models.model_id';
    END IF;
END $$;

-- ============================================================================
-- PART 1: Create junction table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roi_calc_plan_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(100) NOT NULL REFERENCES public.roi_calc_comparable_plans(plan_id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    included_in_plan BOOLEAN DEFAULT true,
    usage_limit_tokens_per_month BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_roi_calc_plan_models_plan_id ON public.roi_calc_plan_models(plan_id);
CREATE INDEX IF NOT EXISTS idx_roi_calc_plan_models_model_id ON public.roi_calc_plan_models(model_id);

DROP TRIGGER IF EXISTS update_roi_calc_plan_models_updated_at ON public.roi_calc_plan_models;
CREATE TRIGGER update_roi_calc_plan_models_updated_at BEFORE UPDATE ON public.roi_calc_plan_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.roi_calc_plan_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plan models" ON public.roi_calc_plan_models;
CREATE POLICY "Anyone can view plan models" ON public.roi_calc_plan_models FOR SELECT USING (true);

GRANT SELECT ON public.roi_calc_plan_models TO anon, authenticated;

-- Add supported_model_ids column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roi_calc_comparable_plans' AND column_name = 'supported_model_ids') THEN
        ALTER TABLE public.roi_calc_comparable_plans ADD COLUMN supported_model_ids TEXT[];
    END IF;
END $$;

-- ============================================================================
-- PART 2: Add Nebius AI Models (nebius.com pricing Jan 2026)
-- ============================================================================

INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('nebius-qwen3-235b-instruct', 'Qwen3-235B-A22B-Instruct', 'Nebius', 'completion', 'text', 'Qwen3 235B Instruct model on Nebius', 0.40, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-qwen3-235b-thinking', 'Qwen3-235B-A22B-Thinking', 'Nebius', 'completion', 'text', 'Qwen3 235B Thinking model on Nebius', 0.50, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-qwen3-32b', 'Qwen3-32B', 'Nebius', 'completion', 'text', 'Qwen3 32B on Nebius', 0.40, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-qwq-32b', 'QwQ-32B', 'Nebius', 'completion', 'text', 'QwQ 32B on Nebius', 1.0, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-deepseek-r1', 'DeepSeek-R1-0528', 'Nebius', 'completion', 'text', 'DeepSeek R1 reasoning model on Nebius', 4.0, '{"context_length": 128000, "supports_reasoning": true}'::jsonb, '{}'::jsonb, true),
    ('nebius-deepseek-v3', 'DeepSeek-V3-0324', 'Nebius', 'completion', 'text', 'DeepSeek V3 on Nebius', 1.5, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-llama-3.3-70b', 'Llama-3.3-70B-Instruct', 'Nebius', 'completion', 'text', 'Llama 3.3 70B on Nebius', 0.50, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-llama-3.1-405b', 'Llama-3.1-405B-Instruct', 'Nebius', 'completion', 'text', 'Llama 3.1 405B on Nebius', 2.0, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-glm-4.5', 'GLM-4.5', 'Nebius', 'completion', 'text', 'GLM 4.5 on Nebius', 1.4, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true),
    ('nebius-kimi-k2', 'Kimi-K2-Instruct', 'Nebius', 'completion', 'text', 'Kimi K2 on Nebius', 1.45, '{"context_length": 128000}'::jsonb, '{}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    updated_at = NOW();

-- Nebius Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active, supported_model_ids
)
VALUES
    ('nebius-payg-2026', 'Token Factory Pay-as-you-go', 'Nebius', NULL, NULL,
     '{"free_credits": 1, "requests_per_min": 1000}'::jsonb,
     ARRAY['$1 free credits', 'Qwen3, DeepSeek, Llama, GLM models', 'Fast & Base flavors', 'Batch API 50% discount', '50% cached token discount'],
     true, false, false, 'competitor', true,
     ARRAY['nebius-qwen3-235b-instruct', 'nebius-deepseek-v3', 'nebius-llama-3.3-70b']),
    ('nebius-enterprise-2026', 'Token Factory Enterprise', 'Nebius', NULL, 75000,
     '{"dedicated_capacity": true, "requests_per_min": -1}'::jsonb,
     ARRAY['Dedicated inference capacity', 'All models access', 'Custom deployment', 'SLA guarantees', 'Priority support'],
     false, true, false, 'competitor', true,
     ARRAY['nebius-llama-3.1-405b', 'nebius-deepseek-r1', 'nebius-kimi-k2'])
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    pay_as_you_go = EXCLUDED.pay_as_you_go,
    custom_pricing = EXCLUDED.custom_pricing,
    supported_model_ids = EXCLUDED.supported_model_ids,
    active = EXCLUDED.active,
    updated_at = NOW();

-- ============================================================================
-- PART 3: Add Fireworks AI Models (fireworks.ai pricing Jan 2026)
-- ============================================================================

INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('fireworks-deepseek-v3', 'DeepSeek V3', 'Fireworks', 'completion', 'text', 'DeepSeek V3 on Fireworks', 1.12, '{"context_length": 128000, "input_price": 0.56, "output_price": 1.68}'::jsonb, '{}'::jsonb, true),
    ('fireworks-deepseek-r1', 'DeepSeek R1 0528', 'Fireworks', 'completion', 'text', 'DeepSeek R1 reasoning on Fireworks', 3.375, '{"context_length": 128000, "input_price": 1.35, "output_price": 5.40, "supports_reasoning": true}'::jsonb, '{}'::jsonb, true),
    ('fireworks-glm-4.7', 'GLM-4.7', 'Fireworks', 'completion', 'text', 'GLM 4.7 on Fireworks', 1.40, '{"context_length": 128000, "input_price": 0.60, "output_price": 2.20}'::jsonb, '{}'::jsonb, true),
    ('fireworks-qwen3-235b', 'Qwen3 235B Family', 'Fireworks', 'completion', 'text', 'Qwen3 235B on Fireworks', 0.55, '{"context_length": 128000, "input_price": 0.22, "output_price": 0.88}'::jsonb, '{}'::jsonb, true),
    ('fireworks-qwen3-coder-480b', 'Qwen3 Coder 480B', 'Fireworks', 'completion', 'text', 'Qwen3 Coder 480B on Fireworks', 1.125, '{"context_length": 128000, "input_price": 0.45, "output_price": 1.80}'::jsonb, '{}'::jsonb, true),
    ('fireworks-kimi-k2', 'Kimi K2 Instruct', 'Fireworks', 'completion', 'text', 'Kimi K2 on Fireworks', 1.55, '{"context_length": 128000, "input_price": 0.60, "output_price": 2.50}'::jsonb, '{}'::jsonb, true),
    ('fireworks-gpt-oss-120b', 'OpenAI gpt-oss-120B', 'Fireworks', 'completion', 'text', 'OpenAI OSS 120B on Fireworks', 0.375, '{"context_length": 128000, "input_price": 0.15, "output_price": 0.60}'::jsonb, '{}'::jsonb, true),
    ('fireworks-gpt-oss-20b', 'OpenAI gpt-oss-20B', 'Fireworks', 'completion', 'text', 'OpenAI OSS 20B on Fireworks', 0.185, '{"context_length": 128000, "input_price": 0.07, "output_price": 0.30}'::jsonb, '{}'::jsonb, true),
    ('fireworks-minimax-m2', 'MiniMax M2', 'Fireworks', 'completion', 'text', 'MiniMax M2 on Fireworks', 0.75, '{"context_length": 128000, "input_price": 0.30, "output_price": 1.20}'::jsonb, '{}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    updated_at = NOW();

-- Fireworks Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active, supported_model_ids
)
VALUES
    ('fireworks-serverless-2026', 'Serverless Inference', 'Fireworks', NULL, NULL,
     '{"free_credits": 1, "requests_per_min": 600}'::jsonb,
     ARRAY['$1 free credits', 'Per-token pricing', 'Zero setup', 'No cold starts', '50% cached token discount', '50% batch API discount'],
     true, false, false, 'competitor', true,
     ARRAY['fireworks-deepseek-v3', 'fireworks-qwen3-235b', 'fireworks-gpt-oss-120b']),
    ('fireworks-ondemand-2026', 'On-Demand Deployments', 'Fireworks', NULL, NULL,
     '{"gpu_types": ["A100", "H100", "H200", "B200"], "billing": "per_second"}'::jsonb,
     ARRAY['A100: $2.90/hr', 'H100: $4.00/hr', 'H200: $6.00/hr', 'B200: $9.00/hr', 'Faster speeds', 'Higher rate limits'],
     true, false, false, 'competitor', true,
     ARRAY['fireworks-deepseek-r1', 'fireworks-kimi-k2', 'fireworks-qwen3-coder-480b']),
    ('fireworks-enterprise-2026', 'Enterprise', 'Fireworks', NULL, 80000,
     '{"dedicated_gpus": true, "requests_per_min": -1}'::jsonb,
     ARRAY['Dedicated GPU capacity', 'Custom model fine-tuning', 'Priority support', 'SLA guarantees'],
     false, true, false, 'competitor', true,
     ARRAY['fireworks-deepseek-v3', 'fireworks-deepseek-r1', 'fireworks-qwen3-coder-480b'])
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    pay_as_you_go = EXCLUDED.pay_as_you_go,
    custom_pricing = EXCLUDED.custom_pricing,
    supported_model_ids = EXCLUDED.supported_model_ids,
    active = EXCLUDED.active,
    updated_at = NOW();

-- ============================================================================
-- PART 4: Add Perplexity AI Models (perplexity.ai pricing Jan 2026)
-- ============================================================================

INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('perplexity-sonar-pro', 'Sonar Pro', 'Perplexity', 'completion', 'text', 'Perplexity Sonar Pro with web search', 3.0, '{"context_length": 128000, "web_search": true, "citations": true}'::jsonb, '{}'::jsonb, true),
    ('perplexity-sonar', 'Sonar', 'Perplexity', 'completion', 'text', 'Perplexity Sonar with web search', 1.0, '{"context_length": 128000, "web_search": true, "citations": true}'::jsonb, '{}'::jsonb, true),
    ('perplexity-sonar-reasoning', 'Sonar Reasoning', 'Perplexity', 'completion', 'text', 'Perplexity Sonar with advanced reasoning', 5.0, '{"context_length": 128000, "web_search": true, "citations": true, "supports_reasoning": true}'::jsonb, '{}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    updated_at = NOW();

-- Perplexity Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active, supported_model_ids
)
VALUES
    ('perplexity-api-2026', 'API Pay-as-you-go', 'Perplexity', NULL, NULL,
     '{"requests_per_min": 500}'::jsonb,
     ARRAY['Sonar, Sonar Pro models', 'Real-time web search', 'Citations included', 'Usage-based pricing'],
     true, false, false, 'competitor', true,
     ARRAY['perplexity-sonar', 'perplexity-sonar-pro']),
    ('perplexity-pro-2026', 'Perplexity Pro', 'Perplexity', 20, 200,
     '{"pro_searches_per_day": 600, "file_uploads": true}'::jsonb,
     ARRAY['600+ Pro searches/day', 'Unlimited Quick searches', 'File upload & analysis', 'API access included', 'Priority support'],
     false, false, false, 'competitor', true,
     ARRAY['perplexity-sonar-pro', 'perplexity-sonar-reasoning']),
    ('perplexity-enterprise-2026', 'Enterprise Pro', 'Perplexity', NULL, 50000,
     '{"seats": -1, "requests_per_min": -1}'::jsonb,
     ARRAY['Unlimited seats', 'SSO & SCIM', 'Admin console', 'Data privacy controls', 'Dedicated support', 'Custom integrations'],
     false, true, false, 'competitor', true,
     ARRAY['perplexity-sonar-pro', 'perplexity-sonar-reasoning'])
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    pay_as_you_go = EXCLUDED.pay_as_you_go,
    custom_pricing = EXCLUDED.custom_pricing,
    supported_model_ids = EXCLUDED.supported_model_ids,
    active = EXCLUDED.active,
    updated_at = NOW();

-- ============================================================================
-- PART 5: Link plans with models
-- ============================================================================

INSERT INTO public.roi_calc_plan_models (plan_id, model_id, included_in_plan)
SELECT 'nebius-payg-2026', model_id, true
FROM public.ai_models WHERE provider = 'Nebius' AND is_active = true
ON CONFLICT (plan_id, model_id) DO NOTHING;

INSERT INTO public.roi_calc_plan_models (plan_id, model_id, included_in_plan)
SELECT 'fireworks-serverless-2026', model_id, true
FROM public.ai_models WHERE provider = 'Fireworks' AND is_active = true
ON CONFLICT (plan_id, model_id) DO NOTHING;

INSERT INTO public.roi_calc_plan_models (plan_id, model_id, included_in_plan)
SELECT 'perplexity-api-2026', model_id, true
FROM public.ai_models WHERE provider = 'Perplexity' AND is_active = true
ON CONFLICT (plan_id, model_id) DO NOTHING;

-- ============================================================================
-- Summary
-- ============================================================================

DO $$
DECLARE
    model_count INTEGER;
    plan_count INTEGER;
    link_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO model_count FROM public.ai_models WHERE provider IN ('Nebius', 'Fireworks', 'Perplexity');
    SELECT COUNT(*) INTO plan_count FROM public.roi_calc_comparable_plans WHERE provider IN ('Nebius', 'Fireworks', 'Perplexity');
    SELECT COUNT(*) INTO link_count FROM public.roi_calc_plan_models WHERE plan_id IN (
        SELECT plan_id FROM public.roi_calc_comparable_plans WHERE provider IN ('Nebius', 'Fireworks', 'Perplexity')
    );
    
    RAISE NOTICE '✓ Migration 022 completed successfully';
    RAISE NOTICE '  - Added/updated % AI models', model_count;
    RAISE NOTICE '  - Added/updated % subscription plans', plan_count;
    RAISE NOTICE '  - Created % model-plan links', link_count;
END $$;
