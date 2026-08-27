-- Migration: Seed AI Models with 2026 Pricing
-- Description: Adds latest AI models and providers with current pricing data for ROI calculator
-- Date: 2026-01-22

-- Create ai_models table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    type TEXT NOT NULL,
    model_type TEXT NOT NULL DEFAULT 'text',
    description TEXT,
    cost_per_1k_tokens DECIMAL(10,6),
    capabilities JSONB DEFAULT '{}'::jsonb,
    parameters JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON public.ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_model_id ON public.ai_models(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON public.ai_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON public.ai_models(type);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "ai_models_read_policy" ON public.ai_models;

-- Create RLS policy for public read access
CREATE POLICY "ai_models_read_policy" ON public.ai_models
    FOR SELECT
    USING (is_active = true);

-- Upsert AI models with latest 2026 pricing
-- OpenAI Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('gpt-4-turbo', 'GPT-4 Turbo', 'OpenAI', 'completion', 'text', 'Most capable GPT-4 model with 128k context, optimized for complex tasks', 0.01, '{"context_length": 128000, "supports_function_calling": true, "supports_vision": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('gpt-4', 'GPT-4', 'OpenAI', 'completion', 'text', 'High-intelligence flagship model for complex tasks', 0.03, '{"context_length": 8192, "supports_function_calling": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('gpt-4o', 'GPT-4o', 'OpenAI', 'completion', 'multimodal', 'Flagship multimodal model with vision and audio capabilities', 0.0025, '{"context_length": 128000, "supports_function_calling": true, "supports_vision": true, "supports_audio": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI', 'completion', 'text', 'Fast, cost-effective model for simpler tasks', 0.0005, '{"context_length": 16385, "supports_function_calling": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('gpt-4o-mini', 'GPT-4o Mini', 'OpenAI', 'completion', 'text', 'Affordable small model for lightweight tasks', 0.00015, '{"context_length": 128000, "supports_function_calling": true}'::jsonb, '{"max_tokens": 16384, "temperature": 0.7}'::jsonb, true),
    ('o1-preview', 'o1 Preview', 'OpenAI', 'completion', 'reasoning', 'Advanced reasoning model with extended thinking', 0.015, '{"context_length": 128000, "reasoning_tokens": 32768}'::jsonb, '{"max_tokens": 32768}'::jsonb, true),
    ('o1-mini', 'o1 Mini', 'OpenAI', 'completion', 'reasoning', 'Faster reasoning model for code and STEM', 0.003, '{"context_length": 128000, "reasoning_tokens": 65536}'::jsonb, '{"max_tokens": 65536}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Anthropic Claude Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('claude-3-opus', 'Claude 3 Opus', 'Anthropic', 'completion', 'text', 'Most capable Claude model for complex analysis and tasks', 0.015, '{"context_length": 200000, "supports_vision": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('claude-3-sonnet', 'Claude 3 Sonnet', 'Anthropic', 'completion', 'text', 'Balanced performance and cost for enterprise workloads', 0.003, '{"context_length": 200000, "supports_vision": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('claude-3-haiku', 'Claude 3 Haiku', 'Anthropic', 'completion', 'text', 'Fastest, most compact model for near-instant responses', 0.00025, '{"context_length": 200000, "supports_vision": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'Anthropic', 'completion', 'text', 'Enhanced Claude model with improved reasoning', 0.003, '{"context_length": 200000, "supports_vision": true, "supports_computer_use": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('claude-3.5-haiku', 'Claude 3.5 Haiku', 'Anthropic', 'completion', 'text', 'Next-generation fast model with enhanced capabilities', 0.0004, '{"context_length": 200000, "supports_vision": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Google Gemini Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Google', 'completion', 'multimodal', 'Advanced multimodal model with 1M token context', 0.00125, '{"context_length": 1000000, "supports_vision": true, "supports_audio": true, "supports_video": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('gemini-1.5-flash', 'Gemini 1.5 Flash', 'Google', 'completion', 'multimodal', 'Fast multimodal model for high-volume tasks', 0.000075, '{"context_length": 1000000, "supports_vision": true, "supports_audio": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('gemini-2.0-flash', 'Gemini 2.0 Flash', 'Google', 'completion', 'multimodal', 'Next-gen multimodal model with native tool use', 0.0001, '{"context_length": 1000000, "supports_vision": true, "supports_audio": true, "native_tool_use": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('gemini-1.0-pro', 'Gemini 1.0 Pro', 'Google', 'completion', 'text', 'Production-ready text model for wide range of tasks', 0.0005, '{"context_length": 32000}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Meta Llama Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('llama-3.1-405b', 'Llama 3.1 405B', 'Meta', 'completion', 'text', 'Largest open-source model for complex reasoning', 0.003, '{"context_length": 128000, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('llama-3.1-70b', 'Llama 3.1 70B', 'Meta', 'completion', 'text', 'Powerful open model for diverse tasks', 0.0009, '{"context_length": 128000, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('llama-3.1-8b', 'Llama 3.1 8B', 'Meta', 'completion', 'text', 'Efficient small model for on-device and edge', 0.0002, '{"context_length": 128000, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('llama-3.2-90b-vision', 'Llama 3.2 90B Vision', 'Meta', 'completion', 'multimodal', 'Large multimodal model with vision capabilities', 0.0012, '{"context_length": 128000, "supports_vision": true, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('llama-3.2-11b-vision', 'Llama 3.2 11B Vision', 'Meta', 'completion', 'multimodal', 'Efficient vision model for edge deployment', 0.0003, '{"context_length": 128000, "supports_vision": true, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('llama-3.2-3b', 'Llama 3.2 3B', 'Meta', 'completion', 'text', 'Compact model optimized for mobile and edge', 0.0001, '{"context_length": 128000, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('llama-3.2-1b', 'Llama 3.2 1B', 'Meta', 'completion', 'text', 'Ultra-lightweight model for resource-constrained environments', 0.00005, '{"context_length": 128000, "open_source": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Mistral AI Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('mistral-large', 'Mistral Large', 'Mistral', 'completion', 'text', 'Top-tier reasoning for high-complexity tasks', 0.003, '{"context_length": 128000, "supports_function_calling": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('mistral-small', 'Mistral Small', 'Mistral', 'completion', 'text', 'Cost-effective model for simple tasks', 0.0002, '{"context_length": 32000, "supports_function_calling": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('mixtral-8x7b', 'Mixtral 8x7B', 'Mistral', 'completion', 'text', 'Mixture of experts for efficient high-quality outputs', 0.0006, '{"context_length": 32000, "open_source": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('mixtral-8x22b', 'Mixtral 8x22B', 'Mistral', 'completion', 'text', 'Larger mixture of experts for advanced reasoning', 0.0012, '{"context_length": 64000, "open_source": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- DeepSeek Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('deepseek-v3', 'DeepSeek V3', 'DeepSeek', 'completion', 'text', 'Advanced reasoning model with 671B parameters', 0.00027, '{"context_length": 128000, "open_source": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('deepseek-coder-v2', 'DeepSeek Coder V2', 'DeepSeek', 'completion', 'code', 'Specialized coding model with strong performance', 0.00014, '{"context_length": 128000, "supports_fill_in_middle": true, "open_source": true}'::jsonb, '{"max_tokens": 8192, "temperature": 0.7}'::jsonb, true),
    ('deepseek-chat', 'DeepSeek Chat', 'DeepSeek', 'completion', 'text', 'General-purpose chat model', 0.00014, '{"context_length": 64000}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Cohere Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('command-r-plus', 'Command R+', 'Cohere', 'completion', 'text', 'Most performant model for RAG and tool use', 0.003, '{"context_length": 128000, "supports_tool_use": true, "optimized_for_rag": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('command-r', 'Command R', 'Cohere', 'completion', 'text', 'Balanced model for conversational AI', 0.0005, '{"context_length": 128000, "supports_tool_use": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('command-light', 'Command Light', 'Cohere', 'completion', 'text', 'Lightweight model for simple tasks', 0.0003, '{"context_length": 4096}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Amazon Bedrock Models  
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('amazon-titan-text-premier', 'Titan Text Premier', 'Amazon', 'completion', 'text', 'Enterprise-grade model for business applications', 0.0008, '{"context_length": 32000, "pii_redaction": true}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('amazon-titan-text-express', 'Titan Text Express', 'Amazon', 'completion', 'text', 'Fast model for interactive applications', 0.0002, '{"context_length": 8000}'::jsonb, '{"max_tokens": 4096, "temperature": 0.7}'::jsonb, true),
    ('amazon-nova-pro', 'Amazon Nova Pro', 'Amazon', 'completion', 'multimodal', 'High-performance multimodal model', 0.0008, '{"context_length": 300000, "supports_vision": true, "supports_video": true}'::jsonb, '{"max_tokens": 5000, "temperature": 0.7}'::jsonb, true),
    ('amazon-nova-lite', 'Amazon Nova Lite', 'Amazon', 'completion', 'multimodal', 'Fast, cost-effective multimodal model', 0.00006, '{"context_length": 300000, "supports_vision": true}'::jsonb, '{"max_tokens": 5000, "temperature": 0.7}'::jsonb, true),
    ('amazon-nova-micro', 'Amazon Nova Micro', 'Amazon', 'completion', 'text', 'Ultra-low latency text model', 0.000035, '{"context_length": 128000}'::jsonb, '{"max_tokens": 5000, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- xAI Grok Models
INSERT INTO public.ai_models (model_id, name, provider, type, model_type, description, cost_per_1k_tokens, capabilities, parameters, is_active)
VALUES
    ('grok-2', 'Grok 2', 'xAI', 'completion', 'text', 'Advanced reasoning model with real-time knowledge', 0.002, '{"context_length": 131072, "real_time_info": true}'::jsonb, '{"max_tokens": 16384, "temperature": 0.7}'::jsonb, true),
    ('grok-beta', 'Grok Beta', 'xAI', 'completion', 'text', 'Experimental model with cutting-edge features', 0.005, '{"context_length": 131072, "real_time_info": true}'::jsonb, '{"max_tokens": 32768, "temperature": 0.7}'::jsonb, true)
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    cost_per_1k_tokens = EXCLUDED.cost_per_1k_tokens,
    capabilities = EXCLUDED.capabilities,
    parameters = EXCLUDED.parameters,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_ai_models_updated_at ON public.ai_models;
CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.ai_models TO anon, authenticated;

-- Output summary
DO $$
DECLARE
    model_count INTEGER;
    provider_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO model_count FROM public.ai_models WHERE is_active = true;
    SELECT COUNT(DISTINCT provider) INTO provider_count FROM public.ai_models WHERE is_active = true;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total active AI models: %', model_count;
    RAISE NOTICE 'Total providers: %', provider_count;
END $$;
