-- Migration: Update ROI Comparable Plans with AI Model Integration
-- Description: Adds AI model provider plans to roi_calc_comparable_plans for ROI calculator
-- Date: 2026-01-22

-- Insert/Update AI provider plans into roi_calc_comparable_plans
-- These are enterprise API pricing tiers, not individual model costs

-- OpenAI Enterprise Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features, 
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('openai-pay-as-you-go', 'Pay-as-you-go', 'OpenAI', 'usage', NULL, NULL, 
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["GPT-4, GPT-3.5, DALL-E, Whisper", "Usage-based pricing", "Standard rate limits", "Community support"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('openai-tier-1', 'Tier 1', 'OpenAI', 'paid', 100, 1000,
     '{"ai_tokens": 1000000, "api_calls": 500000, "rate_limit": "500 RPM"}'::jsonb,
     '["All models access", "Higher rate limits", "Email support", "Usage analytics"]'::jsonb,
     false, false, false, 'competitor', true),
     
    ('openai-tier-5', 'Tier 5 Enterprise', 'OpenAI', 'enterprise', NULL, 50000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "10000 RPM"}'::jsonb,
     '["Unlimited access", "Priority support", "Custom models", "Dedicated account manager", "SLA guarantees"]'::jsonb,
     false, false, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Anthropic Claude Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('anthropic-pay-as-you-go', 'Pay-as-you-go', 'Anthropic', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["Claude 3 Opus, Sonnet, Haiku", "Usage-based pricing", "Standard rate limits", "Community support"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('anthropic-team', 'Team Plan', 'Anthropic', 'paid', 500, 5000,
     '{"ai_tokens": 5000000, "api_calls": 1000000, "rate_limit": "1000 RPM"}'::jsonb,
     '["All Claude models", "Higher rate limits", "Priority support", "Usage analytics", "Team collaboration"]'::jsonb,
     false, false, false, 'competitor', true),
     
    ('anthropic-enterprise', 'Enterprise', 'Anthropic', 'enterprise', NULL, 100000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Unlimited Claude access", "24/7 support", "Custom training", "Dedicated infrastructure", "SLA guarantees", "SOC2 compliance"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Google AI Studio / Vertex AI Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('google-ai-free', 'AI Studio Free', 'Google', 'free', 0, 0,
     '{"ai_tokens": 60000, "api_calls": 1500, "rate_limit": "15 RPM"}'::jsonb,
     '["Gemini 1.5 Flash, Pro", "Limited free quota", "Rate limits", "Community support"]'::jsonb,
     false, false, false, 'competitor', true),
     
    ('google-vertex-pay-as-you-go', 'Vertex AI Pay-as-you-go', 'Google', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["All Gemini models", "Usage-based pricing", "Standard rate limits", "Cloud console access"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('google-vertex-enterprise', 'Vertex AI Enterprise', 'Google', 'enterprise', NULL, 75000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Enterprise Gemini access", "Custom models", "Dedicated support", "SLA guarantees", "Advanced security", "Model Garden access"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Meta Llama (Via cloud providers - e.g., Together AI, Replicate)
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('meta-llama-hosted-free', 'Llama Free Tier', 'Meta/Together', 'free', 0, 0,
     '{"ai_tokens": 50000, "api_calls": 1000, "rate_limit": "10 RPM"}'::jsonb,
     '["Llama 3.1 8B, 70B", "Limited free quota", "Community support", "Open source models"]'::jsonb,
     false, false, false, 'competitor', true),
     
    ('meta-llama-hosted-payg', 'Llama Pay-as-you-go', 'Meta/Together', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["All Llama models", "Usage-based pricing", "Self-hosting option", "Commercial license"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('meta-llama-enterprise', 'Llama Enterprise', 'Meta/Together', 'enterprise', NULL, 60000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Dedicated infrastructure", "Custom fine-tuning", "Priority support", "SLA guarantees", "On-premise deployment"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Mistral AI Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('mistral-pay-as-you-go', 'Pay-as-you-go', 'Mistral', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["Mistral Large, Small, Mixtral", "Usage-based pricing", "Standard rate limits", "API access"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('mistral-pro', 'Pro Plan', 'Mistral', 'paid', 300, 3000,
     '{"ai_tokens": 3000000, "api_calls": 500000, "rate_limit": "500 RPM"}'::jsonb,
     '["All Mistral models", "Higher rate limits", "Email support", "Usage analytics"]'::jsonb,
     false, false, false, 'competitor', true),
     
    ('mistral-enterprise', 'Enterprise', 'Mistral', 'enterprise', NULL, 50000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Unlimited access", "Custom deployment", "Dedicated support", "SLA guarantees", "EU data residency"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- DeepSeek Plans  
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('deepseek-pay-as-you-go', 'Pay-as-you-go', 'DeepSeek', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["DeepSeek V3, Coder", "Ultra-low pricing", "Standard rate limits", "API access"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('deepseek-pro', 'Pro Plan', 'DeepSeek', 'paid', 200, 2000,
     '{"ai_tokens": 10000000, "api_calls": 1000000, "rate_limit": "1000 RPM"}'::jsonb,
     '["All DeepSeek models", "Higher rate limits", "Email support", "Priority access"]'::jsonb,
     false, false, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Cohere Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('cohere-trial', 'Trial', 'Cohere', 'free', 0, 0,
     '{"ai_tokens": 5000000, "api_calls": 100, "rate_limit": "10 RPM"}'::jsonb,
     '["Command R, R+", "Trial quota", "Community support", "API access"]'::jsonb,
     false, false, false, 'competitor', true),
     
    ('cohere-pay-as-you-go', 'Pay-as-you-go', 'Cohere', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["All Cohere models", "Usage-based pricing", "Standard rate limits", "RAG optimization"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('cohere-enterprise', 'Enterprise', 'Cohere', 'enterprise', NULL, 80000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Unlimited access", "Custom models", "Dedicated support", "SLA guarantees", "On-premise deployment", "Advanced RAG"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Amazon Bedrock Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('aws-bedrock-payg', 'Bedrock Pay-as-you-go', 'Amazon', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["Nova, Titan, Claude, Llama access", "Usage-based pricing", "AWS integration", "Standard rate limits"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('aws-bedrock-enterprise', 'Bedrock Enterprise', 'Amazon', 'enterprise', NULL, 120000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["All Bedrock models", "Custom provisioned throughput", "AWS enterprise support", "SLA guarantees", "Advanced security", "Model customization"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- xAI Grok Plans
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('xai-pay-as-you-go', 'Pay-as-you-go', 'xAI', 'usage', NULL, NULL,
     '{"ai_tokens": -1, "api_calls": -1}'::jsonb,
     '["Grok 2, Grok Beta", "Usage-based pricing", "Real-time info access", "Standard rate limits"]'::jsonb,
     true, false, false, 'competitor', true),
     
    ('xai-enterprise', 'Enterprise', 'xAI', 'enterprise', NULL, 90000,
     '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Unlimited Grok access", "Real-time knowledge", "Dedicated support", "SLA guarantees", "Custom deployment"]'::jsonb,
     false, true, false, 'competitor', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Kronova Platform Plans (Updated with competitive positioning)
INSERT INTO public.roi_calc_comparable_plans (
    plan_id, name, provider, tier, monthly, yearly, limits, features,
    payAsYouGo, customPricing, is_kronova_plan, brand, is_active
)
VALUES
    ('kronova-starter', 'Starter', 'Kronova', 'free', 0, 0,
     '{"ai_tokens": 100000, "api_calls": 10000, "providers": 3, "rate_limit": "100 RPM"}'::jsonb,
     '["3 AI providers", "100K tokens/month", "Basic orchestration", "Community support", "Cost optimization"]'::jsonb,
     false, false, true, 'kronova', true),
     
    ('kronova-growth', 'Growth', 'Kronova', 'paid', 299, 2999,
     '{"ai_tokens": 5000000, "api_calls": 500000, "providers": 8, "rate_limit": "1000 RPM"}'::jsonb,
     '["8 AI providers", "5M tokens/month", "Intelligent routing", "Email support", "30% cost savings", "Analytics dashboard"]'::jsonb,
     false, false, true, 'kronova', true),
     
    ('kronova-business', 'Business', 'Kronova', 'paid', 799, 7999,
     '{"ai_tokens": 20000000, "api_calls": 2000000, "providers": 15, "rate_limit": "5000 RPM"}'::jsonb,
     '["15+ AI providers", "20M tokens/month", "Advanced orchestration", "Priority support", "40% cost savings", "Custom routing", "SLA guarantees"]'::jsonb,
     false, false, true, 'kronova', true),
     
    ('kronova-enterprise', 'Enterprise', 'Kronova', 'enterprise', NULL, 50000,
     '{"ai_tokens": -1, "api_calls": -1, "providers": -1, "rate_limit": "Unlimited"}'::jsonb,
     '["Unlimited providers", "Unlimited usage", "Custom orchestration", "24/7 dedicated support", "50-60% cost savings", "On-premise option", "Custom SLA", "White-label", "SOC2 + HIPAA"]'::jsonb,
     false, true, true, 'kronova', true)
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly = EXCLUDED.monthly,
    yearly = EXCLUDED.yearly,
    limits = EXCLUDED.limits,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Output summary
DO $$
DECLARE
    plan_count INTEGER;
    provider_count INTEGER;
    kronova_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM public.roi_calc_comparable_plans WHERE is_active = true;
    SELECT COUNT(DISTINCT provider) INTO provider_count FROM public.roi_calc_comparable_plans WHERE is_active = true;
    SELECT COUNT(*) INTO kronova_count FROM public.roi_calc_comparable_plans WHERE is_kronova_plan = true AND is_active = true;
    
    RAISE NOTICE 'ROI Plans migration completed successfully!';
    RAISE NOTICE 'Total active plans: %', plan_count;
    RAISE NOTICE 'Total providers: %', provider_count;
    RAISE NOTICE 'Kronova plans: %', kronova_count;
END $$;
