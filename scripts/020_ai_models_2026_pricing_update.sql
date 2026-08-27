-- Migration: Update AI Models with Verified 2026 Pricing
-- Description: Updates existing ai_models with current January 2026 pricing from official sources
-- Date: 2026-01-22
-- Sources: openai.com/api/pricing, anthropic.com/pricing, cloud.google.com/vertex-ai/pricing

-- This migration ONLY updates pricing for existing models and adds NEW models not already in the database
-- It does NOT duplicate existing entries

-- ============================================================================
-- OPENAI MODELS - January 2026 Pricing (from openai.com/api/pricing)
-- ============================================================================

-- GPT-5.2 (Flagship) - $1.75/1M input, $14/1M output -> avg $7.875/1M = $0.007875/1K
UPDATE public.ai_models SET
    cost_per_1k_tokens = 0.007875,
    capabilities = '{"context_length": 128000, "supports_function_calling": true, "supports_vision": true, "flagship": true}'::jsonb,
    description = 'Best model for coding and agentic tasks across industries (2026 flagship)',
    updated_at = now()
WHERE model_id = 'gpt-5.2' AND is_active = true;

-- GPT-5.2 Pro - $21/1M input, $168/1M output -> avg $94.50/1M = $0.0945/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gpt-5.2-pro', 'GPT-5.2 Pro', 'OpenAI', 'completion', 'reasoning', 'Smartest and most precise model for complex tasks', 0.0945, 
    '{"context_length": 128000, "reasoning": true, "flagship": true}'::jsonb, 
    '{"max_tokens": 32768}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- GPT-5 Mini - $0.25/1M input, $2/1M output -> avg $1.125/1M = $0.001125/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gpt-5-mini', 'GPT-5 Mini', 'OpenAI', 'completion', 'text', 'Faster, cheaper version of GPT-5 for well-defined tasks', 0.001125, 
    '{"context_length": 128000, "supports_function_calling": true}'::jsonb, 
    '{"max_tokens": 16384}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- GPT-4.1 (Fine-tuning) - $3/1M input, $12/1M output -> avg $7.50/1M = $0.0075/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gpt-4.1', 'GPT-4.1', 'OpenAI', 'completion', 'text', 'Fine-tunable model with 128K context for custom applications', 0.0075, 
    '{"context_length": 128000, "supports_function_calling": true, "fine_tunable": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- GPT-4.1 Mini - $0.80/1M input, $3.20/1M output -> avg $2/1M = $0.002/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gpt-4.1-mini', 'GPT-4.1 Mini', 'OpenAI', 'completion', 'text', 'Cost-effective fine-tunable model', 0.002, 
    '{"context_length": 128000, "supports_function_calling": true, "fine_tunable": true}'::jsonb, 
    '{"max_tokens": 16384}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- GPT-4.1 Nano - $0.20/1M input, $0.80/1M output -> avg $0.50/1M = $0.0005/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gpt-4.1-nano', 'GPT-4.1 Nano', 'OpenAI', 'completion', 'text', 'Ultra-lightweight fine-tunable model', 0.0005, 
    '{"context_length": 128000, "supports_function_calling": true, "fine_tunable": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- o4-mini (Reasoning) - $4/1M input, $16/1M output -> avg $10/1M = $0.01/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('o4-mini', 'o4 Mini', 'OpenAI', 'completion', 'reasoning', 'Reinforcement fine-tunable reasoning model for STEM', 0.01, 
    '{"context_length": 128000, "reasoning": true, "fine_tunable": true}'::jsonb, 
    '{"max_tokens": 65536}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- gpt-realtime - $4/1M text input, $16/1M text output -> avg $10/1M = $0.01/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gpt-realtime', 'GPT Realtime', 'OpenAI', 'completion', 'multimodal', 'Low-latency multimodal including speech-to-speech', 0.01, 
    '{"context_length": 128000, "supports_audio": true, "supports_vision": true, "realtime": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- ============================================================================
-- ANTHROPIC MODELS - January 2026 Pricing (from anthropic.com/pricing)
-- ============================================================================

-- Claude Opus 4.5 - $5/1M input, $25/1M output -> avg $15/1M = $0.015/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('claude-opus-4.5', 'Claude Opus 4.5', 'Anthropic', 'completion', 'text', 'Most intelligent model for building agents and coding', 0.015, 
    '{"context_length": 200000, "supports_vision": true, "supports_computer_use": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Claude Sonnet 4.5 - $3/1M input, $15/1M output -> avg $9/1M = $0.009/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('claude-sonnet-4.5', 'Claude Sonnet 4.5', 'Anthropic', 'completion', 'text', 'Optimal balance of intelligence, cost, and speed', 0.009, 
    '{"context_length": 200000, "supports_vision": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Claude Haiku 4.5 - $1/1M input, $5/1M output -> avg $3/1M = $0.003/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('claude-haiku-4.5', 'Claude Haiku 4.5', 'Anthropic', 'completion', 'text', 'Fastest, most cost-efficient Claude model', 0.003, 
    '{"context_length": 200000, "supports_vision": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Claude Opus 4.1 (Legacy) - $15/1M input, $75/1M output -> avg $45/1M = $0.045/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('claude-opus-4.1', 'Claude Opus 4.1', 'Anthropic', 'completion', 'text', 'Previous generation high-capability model', 0.045, 
    '{"context_length": 200000, "supports_vision": true}'::jsonb, 
    '{"max_tokens": 4096}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Claude Sonnet 4 - $3/1M input, $15/1M output -> avg $9/1M = $0.009/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('claude-sonnet-4', 'Claude Sonnet 4', 'Anthropic', 'completion', 'text', 'Balanced legacy model for general use', 0.009, 
    '{"context_length": 200000, "supports_vision": true}'::jsonb, 
    '{"max_tokens": 4096}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Claude Haiku 3 - $0.25/1M input, $1.25/1M output -> avg $0.75/1M = $0.00075/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('claude-haiku-3', 'Claude Haiku 3', 'Anthropic', 'completion', 'text', 'Legacy fast model at lowest cost', 0.00075, 
    '{"context_length": 200000, "supports_vision": true}'::jsonb, 
    '{"max_tokens": 4096}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- ============================================================================
-- GOOGLE MODELS - January 2026 Pricing (from cloud.google.com/vertex-ai/pricing)
-- ============================================================================

-- Gemini 3 Pro Preview - $2/1M input, $12/1M output -> avg $7/1M = $0.007/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gemini-3-pro', 'Gemini 3 Pro', 'Google', 'completion', 'multimodal', 'Latest flagship multimodal model with extended context', 0.007, 
    '{"context_length": 2000000, "supports_vision": true, "supports_audio": true, "supports_video": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Gemini 3 Flash Preview - $0.50/1M input, $1/1M output -> avg $0.75/1M = $0.00075/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('gemini-3-flash', 'Gemini 3 Flash', 'Google', 'completion', 'multimodal', 'Fast and cost-effective multimodal model', 0.00075, 
    '{"context_length": 1000000, "supports_vision": true, "supports_audio": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- ============================================================================
-- DEEPSEEK MODELS - January 2026 Pricing (from api-docs.deepseek.com)
-- ============================================================================

-- DeepSeek V3 - $0.28/1M input (cache miss), $1.10/1M output -> avg $0.69/1M = $0.00069/1K
UPDATE public.ai_models SET
    cost_per_1k_tokens = 0.00069,
    description = 'Advanced 671B parameter model with ultra-competitive pricing',
    updated_at = now()
WHERE model_id = 'deepseek-v3' AND is_active = true;

-- DeepSeek V3 (insert if not exists)
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('deepseek-v3', 'DeepSeek V3', 'DeepSeek', 'completion', 'text', 'Advanced 671B parameter model with ultra-competitive pricing', 0.00069, 
    '{"context_length": 128000, "open_source": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- ============================================================================
-- MISTRAL MODELS - January 2026 Pricing (from mistral.ai/pricing)
-- ============================================================================

-- Mistral Large 2411 - $2/1M input, $6/1M output -> avg $4/1M = $0.004/1K
UPDATE public.ai_models SET
    cost_per_1k_tokens = 0.004,
    description = 'Top-tier reasoning for high-complexity enterprise tasks',
    updated_at = now()
WHERE model_id = 'mistral-large' AND is_active = true;

INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('mistral-large-2411', 'Mistral Large 2411', 'Mistral', 'completion', 'text', 'Latest Mistral Large with enhanced reasoning', 0.004, 
    '{"context_length": 128000, "supports_function_calling": true}'::jsonb, 
    '{"max_tokens": 8192}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- ============================================================================
-- XAI GROK MODELS - January 2026 Pricing (from x.ai/api)
-- ============================================================================

-- Grok 4 - $3/1M input, $15/1M output -> avg $9/1M = $0.009/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('grok-4', 'Grok 4', 'xAI', 'completion', 'text', 'Flagship Grok model with real-time knowledge', 0.009, 
    '{"context_length": 131072, "real_time_info": true}'::jsonb, 
    '{"max_tokens": 16384}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- Grok 4.1 Fast - $0.20/1M input, $0.80/1M output -> avg $0.50/1M = $0.0005/1K
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES ('grok-4.1-fast', 'Grok 4.1 Fast', 'xAI', 'completion', 'text', 'Fast and affordable Grok model', 0.0005, 
    '{"context_length": 131072, "real_time_info": true}'::jsonb, 
    '{"max_tokens": 16384}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    updated_at = now();

-- ============================================================================
-- Update existing models with verified 2026 pricing
-- ============================================================================

-- Update GPT-4 Turbo pricing ($10/1M input, $30/1M output -> avg $20/1M = $0.02/1K)
UPDATE public.ai_models SET cost_per_1k_tokens = 0.02, updated_at = now()
WHERE model_id IN ('gpt-4-turbo', 'gpt-4-turbo-preview') AND is_active = true;

-- Update Claude 3.5 Sonnet pricing ($3/1M input, $15/1M output -> avg $9/1M = $0.009/1K)
UPDATE public.ai_models SET cost_per_1k_tokens = 0.009, updated_at = now()
WHERE model_id IN ('claude-3.5-sonnet', 'claude-3-5-sonnet') AND is_active = true;

-- Update Claude 3 Opus pricing ($15/1M input, $75/1M output -> avg $45/1M = $0.045/1K)
UPDATE public.ai_models SET cost_per_1k_tokens = 0.045, updated_at = now()
WHERE model_id IN ('claude-3-opus') AND is_active = true;

-- ============================================================================
-- Output summary
-- ============================================================================
DO $$
DECLARE
    model_count INTEGER;
    provider_count INTEGER;
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO model_count FROM public.ai_models WHERE is_active = true;
    SELECT COUNT(DISTINCT provider) INTO provider_count FROM public.ai_models WHERE is_active = true;
    SELECT COUNT(*) INTO updated_count FROM public.ai_models WHERE updated_at > now() - interval '1 minute';
    
    RAISE NOTICE '=== AI Models 2026 Pricing Update Complete ===';
    RAISE NOTICE 'Total active AI models: %', model_count;
    RAISE NOTICE 'Total providers: %', provider_count;
    RAISE NOTICE 'Models updated/added: %', updated_count;
END $$;
