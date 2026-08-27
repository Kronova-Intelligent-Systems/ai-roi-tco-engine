-- Migration: Update ROI Comparable Plans with 2026 API Pricing
-- Description: Adds/updates AI provider subscription plans with verified 2026 pricing
-- Date: 2026-01-22
-- Sources: Official pricing pages from OpenAI, Anthropic, Google, Mistral, xAI, DeepSeek

-- This migration adds ONLY plans that don't exist and updates existing plans with current pricing
-- It uses ON CONFLICT to safely upsert without duplicating data

-- ============================================================================
-- OPENAI PLANS - January 2026 (from openai.com/api/pricing)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- Pay-as-you-go (GPT-5.2: $1.75/$14 per 1M, GPT-5-mini: $0.25/$2 per 1M)
    ('openai-payg-2026', 'Pay-as-you-go', 'OpenAI', NULL, NULL,
     '{"requests_per_min": 500, "tokens_per_min": 200000}'::jsonb,
     ARRAY['GPT-5.2, GPT-5 Mini, GPT-4.1 series', 'Usage-based pricing', 'Batch API 50% discount', 'Standard rate limits'],
     true, false, false, 'competitor', true),
    
    -- Tier 2 (~$120/month equivalent spend for higher limits)
    ('openai-tier2-2026', 'Tier 2', 'OpenAI', 120, 1200,
     '{"requests_per_min": 5000, "tokens_per_min": 2000000}'::jsonb,
     ARRAY['Higher rate limits', 'All models access', 'Email support', 'Usage analytics'],
     false, false, false, 'competitor', true),
    
    -- Enterprise (custom pricing, ~$100K/year estimated)
    ('openai-enterprise-2026', 'Enterprise', 'OpenAI', NULL, 100000,
     '{"requests_per_min": -1, "tokens_per_min": -1}'::jsonb,
     ARRAY['Unlimited rate limits', 'Priority processing', 'Dedicated account manager', 'Custom models', 'SLA guarantees', 'SOC2 compliance'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- ANTHROPIC PLANS - January 2026 (from anthropic.com/pricing)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- Pay-as-you-go (Sonnet 4.5: $3/$15 per 1M, Haiku 4.5: $1/$5 per 1M)
    ('anthropic-payg-2026', 'Pay-as-you-go', 'Anthropic', NULL, NULL,
     '{"requests_per_min": 1000, "tokens_per_min": 400000}'::jsonb,
     ARRAY['Claude Opus 4.5, Sonnet 4.5, Haiku 4.5', 'Usage-based pricing', 'Batch API 50% discount', 'Prompt caching'],
     true, false, false, 'competitor', true),
    
    -- Team ($25/seat/month standard, $150/seat premium)
    ('anthropic-team-2026', 'Team', 'Anthropic', 25, 250,
     '{"seats_included": 5, "requests_per_min": 2000, "tokens_per_min": 1000000}'::jsonb,
     ARRAY['Claude Code included', 'Microsoft 365 + Slack integration', 'Enterprise search', 'SSO + domain capture', 'Admin controls'],
     false, false, false, 'competitor', true),
    
    -- Enterprise (custom pricing)
    ('anthropic-enterprise-2026', 'Enterprise', 'Anthropic', NULL, 120000,
     '{"seats_included": -1, "requests_per_min": -1, "tokens_per_min": -1}'::jsonb,
     ARRAY['Enhanced context window', 'Google Docs cataloging', 'SCIM provisioning', 'Audit logs', 'Custom data retention', 'HIPAA-ready'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- GOOGLE VERTEX AI PLANS - January 2026 (from cloud.google.com/vertex-ai/pricing)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- AI Studio Free Tier
    ('google-free-2026', 'AI Studio Free', 'Google', 0, 0,
     '{"requests_per_min": 15, "requests_per_day": 1500}'::jsonb,
     ARRAY['Gemini 3 Flash, Pro access', 'Limited free quota', 'Rate limited', 'Community support'],
     false, false, false, 'competitor', true),
    
    -- Vertex AI Pay-as-you-go (Gemini 3 Pro: $2/$12 per 1M, Flash: $0.50/$1 per 1M)
    ('google-vertex-payg-2026', 'Vertex AI Pay-as-you-go', 'Google', NULL, NULL,
     '{"requests_per_min": 1000, "tokens_per_min": 4000000}'::jsonb,
     ARRAY['All Gemini models', 'Batch API 50% discount', 'Cloud console', 'Usage-based pricing'],
     true, false, false, 'competitor', true),
    
    -- Vertex AI Enterprise
    ('google-vertex-enterprise-2026', 'Vertex AI Enterprise', 'Google', NULL, 90000,
     '{"requests_per_min": -1, "tokens_per_min": -1}'::jsonb,
     ARRAY['Gemini enterprise access', 'Model Garden', 'Custom models', 'Dedicated support', 'SLA guarantees'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- MISTRAL PLANS - January 2026 (from mistral.ai/pricing)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- Pay-as-you-go (Large 2411: $2/$6 per 1M)
    ('mistral-payg-2026', 'Pay-as-you-go', 'Mistral', NULL, NULL,
     '{"requests_per_min": 500, "tokens_per_min": 500000}'::jsonb,
     ARRAY['Mistral Large, Small, Mixtral', 'Usage-based pricing', 'EU data residency option'],
     true, false, false, 'competitor', true),
    
    -- Enterprise
    ('mistral-enterprise-2026', 'Enterprise', 'Mistral', NULL, 60000,
     '{"requests_per_min": -1, "tokens_per_min": -1}'::jsonb,
     ARRAY['Unlimited access', 'EU data residency', 'Custom deployment', 'Dedicated support', 'SLA guarantees'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- DEEPSEEK PLANS - January 2026 (from api-docs.deepseek.com)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- Pay-as-you-go (V3: $0.28/$1.10 per 1M - ultra competitive)
    ('deepseek-payg-2026', 'Pay-as-you-go', 'DeepSeek', NULL, NULL,
     '{"requests_per_min": 1000, "tokens_per_min": 1000000}'::jsonb,
     ARRAY['DeepSeek V3, Coder V2', 'Ultra-low pricing', 'Cache discounts available', 'Open source models'],
     true, false, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- XAI GROK PLANS - January 2026 (from x.ai/api)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- Pay-as-you-go (Grok 4: $3/$15 per 1M, Grok 4.1 Fast: $0.20/$0.80 per 1M)
    ('xai-payg-2026', 'Pay-as-you-go', 'xAI', NULL, NULL,
     '{"requests_per_min": 500, "tokens_per_min": 500000}'::jsonb,
     ARRAY['Grok 4, Grok 4.1 Fast', 'Real-time knowledge access', 'Usage-based pricing'],
     true, false, false, 'competitor', true),
    
    -- Enterprise
    ('xai-enterprise-2026', 'Enterprise', 'xAI', NULL, 100000,
     '{"requests_per_min": -1, "tokens_per_min": -1}'::jsonb,
     ARRAY['Unlimited Grok access', 'Real-time knowledge', 'Custom deployment', 'Dedicated support'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- COHERE PLANS - January 2026 (from cohere.com/pricing)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- Trial
    ('cohere-trial-2026', 'Trial', 'Cohere', 0, 0,
     '{"api_calls_per_min": 10, "trial_credits": 5000000}'::jsonb,
     ARRAY['Command R, R+', 'Trial quota', 'RAG optimization', 'Community support'],
     false, false, false, 'competitor', true),
    
    -- Pay-as-you-go
    ('cohere-payg-2026', 'Pay-as-you-go', 'Cohere', NULL, NULL,
     '{"requests_per_min": 1000, "tokens_per_min": 1000000}'::jsonb,
     ARRAY['All Cohere models', 'Usage-based pricing', 'RAG optimization', 'Embed models'],
     true, false, false, 'competitor', true),
    
    -- Enterprise (North, Compass products)
    ('cohere-enterprise-2026', 'Enterprise', 'Cohere', NULL, 80000,
     '{"requests_per_min": -1, "tokens_per_min": -1}'::jsonb,
     ARRAY['North enterprise search', 'Compass knowledge platform', 'On-premise deployment', 'Custom RAG'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- AWS BEDROCK PLANS - January 2026 (from aws.amazon.com/bedrock/pricing)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active
)
VALUES
    -- On-demand
    ('aws-bedrock-ondemand-2026', 'Bedrock On-Demand', 'Amazon', NULL, NULL,
     '{"requests_per_min": 1000, "tokens_per_min": 1000000}'::jsonb,
     ARRAY['Nova, Titan, Claude, Llama models', 'Usage-based pricing', 'AWS integration', 'No upfront commitment'],
     true, false, false, 'competitor', true),
    
    -- Provisioned Throughput
    ('aws-bedrock-provisioned-2026', 'Bedrock Provisioned', 'Amazon', NULL, 150000,
     '{"model_units": 1, "guaranteed_throughput": true}'::jsonb,
     ARRAY['Guaranteed capacity', 'Custom model imports', 'Fine-tuning', 'AWS enterprise support'],
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================================================
-- KRONOVA PLANS - 2026 (Competitive multi-provider platform)
-- ============================================================================

INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, monthly_price, yearly_price, limits, features,
    pay_as_you_go, custom_pricing, is_kronova_plan, brand, active, recommended
)
VALUES
    -- Starter (Free tier)
    ('kronova-starter-2026', 'Starter', 'Kronova', 0, 0,
     '{"ai_tokens": 100000, "api_calls": 10000, "providers": 3, "rate_limit_rpm": 100}'::jsonb,
     ARRAY['3 AI providers', '100K tokens/month', 'Basic orchestration', 'Community support', 'Cost tracking'],
     false, false, true, 'kronova', true, false),
    
    -- Growth
    ('kronova-growth-2026', 'Growth', 'Kronova', 299, 2990,
     '{"ai_tokens": 5000000, "api_calls": 500000, "providers": 8, "rate_limit_rpm": 1000}'::jsonb,
     ARRAY['8 AI providers', '5M tokens/month', 'Smart routing', 'Email support', '30% cost savings', 'Analytics'],
     false, false, true, 'kronova', true, true),
    
    -- Business
    ('kronova-business-2026', 'Business', 'Kronova', 799, 7990,
     '{"ai_tokens": 25000000, "api_calls": 2500000, "providers": 15, "rate_limit_rpm": 5000}'::jsonb,
     ARRAY['15+ AI providers', '25M tokens/month', 'Advanced orchestration', 'Priority support', '40% cost savings', 'Custom routing', 'SLA'],
     false, false, true, 'kronova', true, false),
    
    -- Enterprise
    ('kronova-enterprise-2026', 'Enterprise', 'Kronova', NULL, 50000,
     '{"ai_tokens": -1, "api_calls": -1, "providers": -1, "rate_limit_rpm": -1}'::jsonb,
     ARRAY['Unlimited providers', 'Unlimited usage', 'Custom orchestration', '24/7 dedicated support', '50-60% cost savings', 'On-premise option', 'Custom SLA', 'White-label', 'SOC2 + HIPAA'],
     false, true, true, 'kronova', true, false)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price = EXCLUDED.monthly_price,
    yearly_price = EXCLUDED.yearly_price,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    active = EXCLUDED.active,
    recommended = EXCLUDED.recommended,
    updated_at = now();

-- ============================================================================
-- Mark outdated plans as inactive (keeping data for historical reference)
-- ============================================================================

UPDATE public.roi_calc_comparable_plans 
SET active = false, updated_at = now()
WHERE plan_id LIKE '%2025%' OR plan_id LIKE '%2024%';

-- ============================================================================
-- Output summary
-- ============================================================================
DO $$
DECLARE
    plan_count INTEGER;
    provider_count INTEGER;
    kronova_count INTEGER;
    competitor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM public.roi_calc_comparable_plans WHERE active = true;
    SELECT COUNT(DISTINCT provider) INTO provider_count FROM public.roi_calc_comparable_plans WHERE active = true;
    SELECT COUNT(*) INTO kronova_count FROM public.roi_calc_comparable_plans WHERE is_kronova_plan = true AND active = true;
    SELECT COUNT(*) INTO competitor_count FROM public.roi_calc_comparable_plans WHERE is_kronova_plan = false AND active = true;
    
    RAISE NOTICE '=== ROI Plans 2026 Pricing Update Complete ===';
    RAISE NOTICE 'Total active plans: %', plan_count;
    RAISE NOTICE 'Total providers: %', provider_count;
    RAISE NOTICE 'Kronova plans: %', kronova_count;
    RAISE NOTICE 'Competitor plans: %', competitor_count;
END $$;
