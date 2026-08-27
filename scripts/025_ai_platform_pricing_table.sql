-- =============================================================================
-- Migration 025: AI Platform Pricing Table
-- Stores live and cached pricing data for top 50 enterprise AI platforms.
-- Refreshed hourly by the Rust API pricing service.
-- =============================================================================

-- Create enum types for categorisation
DO $$ BEGIN
  CREATE TYPE ai_platform_category AS ENUM (
    'foundation_model',
    'enterprise_suite',
    'developer_api',
    'productivity',
    'vertical_ai',
    'infrastructure',
    'open_source_hosted'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pricing_model_type AS ENUM (
    'per_token',
    'per_request',
    'subscription_monthly',
    'subscription_annual',
    'consumption_based',
    'hybrid',
    'free_tier_then_paid',
    'enterprise_custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Core platform pricing table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_platform_pricing (
  -- Identity
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_slug             TEXT NOT NULL UNIQUE,        -- stable machine key e.g. "openai-gpt4o"
  platform_name             TEXT NOT NULL,
  vendor                    TEXT NOT NULL,
  category                  ai_platform_category NOT NULL,

  -- Pricing
  pricing_model             pricing_model_type NOT NULL,
  price_input_per_1m_tokens NUMERIC(12, 6),              -- USD, null for non-token models
  price_output_per_1m_tokens NUMERIC(12, 6),             -- USD, null for non-token models
  price_per_request         NUMERIC(12, 6),              -- USD, null for token/sub models
  monthly_base_price        NUMERIC(12, 2),              -- USD, null for pure consumption
  annual_base_price         NUMERIC(12, 2),              -- USD, null for pure consumption
  free_tier_included        BOOLEAN NOT NULL DEFAULT false,
  free_tier_details         TEXT,
  enterprise_pricing_available BOOLEAN NOT NULL DEFAULT true,

  -- Capabilities & fit scores (0–100 normalised)
  roi_score                 SMALLINT NOT NULL CHECK (roi_score BETWEEN 0 AND 100),
  ease_of_integration       SMALLINT NOT NULL CHECK (ease_of_integration BETWEEN 0 AND 100),
  time_to_value_score       SMALLINT NOT NULL CHECK (time_to_value_score BETWEEN 0 AND 100),
  scalability_score         SMALLINT NOT NULL CHECK (scalability_score BETWEEN 0 AND 100),
  security_compliance_score SMALLINT NOT NULL CHECK (security_compliance_score BETWEEN 0 AND 100),
  support_score             SMALLINT NOT NULL CHECK (support_score BETWEEN 0 AND 100),

  -- Metadata
  context_window_tokens     BIGINT,
  supported_modalities      TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'text','image','audio'}
  regions_available         TEXT[] NOT NULL DEFAULT '{}',
  soc2_compliant            BOOLEAN NOT NULL DEFAULT false,
  hipaa_eligible            BOOLEAN NOT NULL DEFAULT false,
  gdpr_compliant            BOOLEAN NOT NULL DEFAULT false,

  -- Source & freshness
  pricing_page_url          TEXT,
  data_source               TEXT NOT NULL DEFAULT 'seed', -- 'seed' | 'api' | 'scrape'
  last_verified_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active                 BOOLEAN NOT NULL DEFAULT true,
  notes                     TEXT,

  -- Audit
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_platform_pricing_category
  ON public.ai_platform_pricing (category);

CREATE INDEX IF NOT EXISTS idx_ai_platform_pricing_roi_score
  ON public.ai_platform_pricing (roi_score DESC);

CREATE INDEX IF NOT EXISTS idx_ai_platform_pricing_active
  ON public.ai_platform_pricing (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ai_platform_pricing_updated
  ON public.ai_platform_pricing (updated_at DESC);

-- ---------------------------------------------------------------------------
-- Auto-update updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_ai_platform_pricing_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_platform_pricing_updated_at ON public.ai_platform_pricing;
CREATE TRIGGER trg_ai_platform_pricing_updated_at
  BEFORE UPDATE ON public.ai_platform_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_platform_pricing_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.ai_platform_pricing ENABLE ROW LEVEL SECURITY;

-- Public can read active platforms (powers the UI)
CREATE POLICY "public_read_active_platforms"
  ON public.ai_platform_pricing
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Only service role (Rust API) can insert/update/delete
CREATE POLICY "service_role_full_access"
  ON public.ai_platform_pricing
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Seed data: top 50 enterprise AI platforms (current as of 2026)
-- ---------------------------------------------------------------------------
INSERT INTO public.ai_platform_pricing (
  platform_slug, platform_name, vendor, category, pricing_model,
  price_input_per_1m_tokens, price_output_per_1m_tokens,
  monthly_base_price, annual_base_price,
  free_tier_included, enterprise_pricing_available,
  roi_score, ease_of_integration, time_to_value_score,
  scalability_score, security_compliance_score, support_score,
  context_window_tokens, supported_modalities, regions_available,
  soc2_compliant, hipaa_eligible, gdpr_compliant,
  pricing_page_url, data_source, notes
) VALUES

-- OpenAI
('openai-gpt4o',           'GPT-4o',                   'OpenAI',        'foundation_model',    'per_token',             2.50,   10.00,  NULL,    NULL,    true,  true,  82, 90, 85, 92, 78, 75, 128000,  '{text,image,audio}',       '{us,eu,ap}',    true,  true,  true,  'https://openai.com/pricing',                         'seed', NULL),
('openai-gpt4o-mini',      'GPT-4o mini',              'OpenAI',        'foundation_model',    'per_token',             0.15,    0.60,  NULL,    NULL,    true,  true,  78, 90, 88, 92, 78, 75, 128000,  '{text,image}',             '{us,eu,ap}',    true,  true,  true,  'https://openai.com/pricing',                         'seed', NULL),
('openai-o3',              'o3',                        'OpenAI',        'foundation_model',    'per_token',            10.00,   40.00,  NULL,    NULL,    false, true,  88, 85, 80, 90, 78, 75, 200000,  '{text,image}',             '{us,eu,ap}',    true,  true,  true,  'https://openai.com/pricing',                         'seed', 'Advanced reasoning model'),
('openai-o4-mini',         'o4-mini',                   'OpenAI',        'foundation_model',    'per_token',             1.10,    4.40,  NULL,    NULL,    false, true,  85, 88, 84, 90, 78, 75, 200000,  '{text,image}',             '{us,eu,ap}',    true,  true,  true,  'https://openai.com/pricing',                         'seed', 'Cost-efficient reasoning'),

-- Anthropic
('anthropic-claude-opus-4',   'Claude Opus 4',          'Anthropic',     'foundation_model',    'per_token',            15.00,   75.00,  NULL,    NULL,    false, true,  86, 87, 82, 88, 82, 78, 200000,  '{text,image}',             '{us,eu}',       true,  true,  true,  'https://anthropic.com/pricing',                      'seed', NULL),
('anthropic-claude-sonnet-4', 'Claude Sonnet 4',        'Anthropic',     'foundation_model',    'per_token',             3.00,   15.00,  NULL,    NULL,    true,  true,  84, 88, 84, 88, 82, 78, 200000,  '{text,image}',             '{us,eu}',       true,  true,  true,  'https://anthropic.com/pricing',                      'seed', NULL),
('anthropic-claude-haiku-3',  'Claude Haiku 3.5',       'Anthropic',     'foundation_model',    'per_token',             0.80,    4.00,  NULL,    NULL,    true,  true,  79, 89, 88, 88, 82, 78, 200000,  '{text,image}',             '{us,eu}',       true,  true,  true,  'https://anthropic.com/pricing',                      'seed', NULL),

-- Google
('google-gemini-2-flash',    'Gemini 2.0 Flash',        'Google',        'foundation_model',    'per_token',             0.10,    0.40,  NULL,    NULL,    true,  true,  80, 86, 87, 95, 80, 80, 1048576, '{text,image,audio,video}', '{us,eu,ap}',    true,  true,  true,  'https://ai.google.dev/pricing',                      'seed', NULL),
('google-gemini-2-pro',      'Gemini 2.0 Pro',          'Google',        'foundation_model',    'per_token',             1.25,    5.00,  NULL,    NULL,    false, true,  83, 85, 84, 95, 80, 80, 2000000, '{text,image,audio,video}', '{us,eu,ap}',    true,  true,  true,  'https://ai.google.dev/pricing',                      'seed', NULL),
('google-vertex-ai',         'Vertex AI Platform',      'Google',        'enterprise_suite',    'consumption_based',     NULL,    NULL,  300.00, 3000.00, false, true,  85, 75, 72, 97, 90, 85, NULL,    '{text,image,audio,video}', '{us,eu,ap,me}', true,  true,  true,  'https://cloud.google.com/vertex-ai/pricing',         'seed', 'Full MLOps platform'),

-- Microsoft / Azure
('azure-openai',             'Azure OpenAI Service',    'Microsoft',     'enterprise_suite',    'per_token',             2.50,   10.00,  NULL,    NULL,    false, true,  85, 80, 76, 95, 95, 88, 128000,  '{text,image}',             '{us,eu,ap,me}', true,  true,  true,  'https://azure.microsoft.com/pricing/ai-services',    'seed', 'Enterprise OpenAI on Azure'),
('azure-ai-foundry',         'Azure AI Foundry',        'Microsoft',     'enterprise_suite',    'consumption_based',     NULL,    NULL,  NULL,    NULL,    false, true,  86, 78, 74, 95, 95, 88, NULL,    '{text,image,audio}',       '{us,eu,ap,me}', true,  true,  true,  'https://azure.microsoft.com/products/ai-foundry',    'seed', 'End-to-end AI dev platform'),
('ms-copilot-365',           'Microsoft 365 Copilot',   'Microsoft',     'productivity',        'subscription_monthly',  NULL,    NULL,   30.00,  360.00, false, true,  80, 92, 90, 88, 95, 88, NULL,    '{text,image}',             '{us,eu,ap}',    true,  true,  true,  'https://www.microsoft.com/en-us/microsoft-365/copilot', 'seed', 'Per user/month'),

-- AWS
('aws-bedrock',              'Amazon Bedrock',          'Amazon',        'enterprise_suite',    'consumption_based',     NULL,    NULL,  NULL,    NULL,    false, true,  84, 72, 70, 97, 95, 82, NULL,    '{text,image}',             '{us,eu,ap}',    true,  true,  true,  'https://aws.amazon.com/bedrock/pricing',             'seed', 'Multi-model managed service'),
('aws-sagemaker',            'Amazon SageMaker',        'Amazon',        'infrastructure',      'consumption_based',     NULL,    NULL,  NULL,    NULL,    false, true,  78, 60, 58, 97, 95, 80, NULL,    '{text}',                   '{us,eu,ap}',    true,  true,  true,  'https://aws.amazon.com/sagemaker/pricing',           'seed', 'Full MLOps platform'),

-- Meta
('meta-llama-3-1-405b',      'Llama 3.1 405B',         'Meta',          'open_source_hosted',  'per_token',             3.00,    3.00,  NULL,    NULL,    true,  false, 74, 65, 68, 85, 65, 50, 128000,  '{text}',                   '{us}',          false, false, false, 'https://llama.meta.com',                             'seed', 'Self-hosted or via partners'),
('meta-llama-3-2',           'Llama 3.2 Vision',       'Meta',          'open_source_hosted',  'per_token',             0.18,    0.18,  NULL,    NULL,    true,  false, 72, 65, 70, 82, 60, 45, 128000,  '{text,image}',             '{us}',          false, false, false, 'https://llama.meta.com',                             'seed', 'Via Groq / Together AI'),

-- Cohere
('cohere-command-r-plus',    'Command R+',              'Cohere',        'developer_api',       'per_token',             2.50,   10.00,  NULL,    NULL,    false, true,  78, 82, 80, 85, 78, 75, 128000,  '{text}',                   '{us,eu}',       true,  false, true,  'https://cohere.com/pricing',                         'seed', 'RAG-optimised enterprise LLM'),
('cohere-embed-v3',          'Embed v3',                'Cohere',        'developer_api',       'per_token',             0.10,    NULL,  NULL,    NULL,    true,  true,  76, 85, 82, 88, 78, 75, NULL,    '{text}',                   '{us,eu}',       true,  false, true,  'https://cohere.com/pricing',                         'seed', 'Embeddings model'),

-- Mistral AI
('mistral-large-2',          'Mistral Large 2',         'Mistral AI',    'foundation_model',    'per_token',             2.00,    6.00,  NULL,    NULL,    false, true,  77, 82, 80, 84, 72, 68, 128000,  '{text}',                   '{us,eu}',       true,  false, true,  'https://mistral.ai/pricing',                         'seed', NULL),
('mistral-small-3',          'Mistral Small 3',         'Mistral AI',    'foundation_model',    'per_token',             0.10,    0.30,  NULL,    NULL,    false, true,  73, 84, 83, 84, 72, 68, 32000,   '{text}',                   '{us,eu}',       true,  false, true,  'https://mistral.ai/pricing',                         'seed', 'Low-latency tasks'),

-- Groq
('groq-llama-3-70b',         'Groq LLaMA 3 70B',       'Groq',          'developer_api',       'per_token',             0.59,    0.79,  NULL,    NULL,    true,  true,  75, 88, 90, 80, 68, 65, 8192,    '{text}',                   '{us}',          false, false, false, 'https://console.groq.com/docs/openai',               'seed', 'Ultra-low latency inference'),

-- xAI
('xai-grok-2',               'Grok 2',                  'xAI',           'foundation_model',    'per_token',             2.00,   10.00,  NULL,    NULL,    false, true,  75, 80, 78, 82, 65, 62, 131072,  '{text,image}',             '{us}',          false, false, false, 'https://x.ai/api',                                   'seed', NULL),

-- Perplexity
('perplexity-pro',           'Perplexity Pro',          'Perplexity',    'productivity',        'subscription_monthly',  NULL,    NULL,   20.00,  200.00, true,  true,  72, 92, 92, 78, 65, 62, NULL,    '{text}',                   '{us}',          false, false, false, 'https://www.perplexity.ai/pro',                      'seed', 'AI search with citations'),
('perplexity-api',           'Perplexity API (sonar)',  'Perplexity',    'developer_api',       'per_token',             1.00,    1.00,  NULL,    NULL,    false, true,  70, 85, 85, 78, 65, 60, 127072,  '{text}',                   '{us}',          false, false, false, 'https://docs.perplexity.ai/docs/pricing',            'seed', 'Online search-augmented LLM'),

-- Salesforce
('salesforce-einstein-ai',   'Salesforce Einstein AI',  'Salesforce',    'enterprise_suite',    'subscription_monthly',  NULL,    NULL,   75.00,  900.00, false, true,  82, 78, 80, 85, 88, 90, NULL,    '{text,image}',             '{us,eu,ap}',    true,  true,  true,  'https://www.salesforce.com/products/einstein',       'seed', 'Embedded CRM AI'),
('salesforce-agentforce',    'Agentforce',              'Salesforce',    'enterprise_suite',    'per_request',           NULL,    NULL,  NULL,    NULL,    false, true,  80, 72, 74, 85, 88, 90, NULL,    '{text}',                   '{us,eu,ap}',    true,  true,  true,  'https://www.salesforce.com/agentforce',               'seed', '$2/conversation'),

-- SAP
('sap-business-ai',          'SAP Business AI',         'SAP',           'enterprise_suite',    'subscription_annual',   NULL,    NULL,  NULL,   1500.00, false, true,  78, 60, 58, 82, 90, 85, NULL,    '{text}',                   '{us,eu,ap}',    true,  true,  true,  'https://www.sap.com/products/artificial-intelligence', 'seed', 'ERP-embedded AI'),

-- ServiceNow
('servicenow-now-assist',    'Now Assist',              'ServiceNow',    'enterprise_suite',    'subscription_annual',   NULL,    NULL,  NULL,    NULL,    false, true,  79, 70, 72, 84, 88, 86, NULL,    '{text}',                   '{us,eu}',       true,  true,  true,  'https://www.servicenow.com/now-platform/now-assist',  'seed', 'ITSM/HRSD AI'),

-- Workday
('workday-illuminate',       'Workday Illuminate',      'Workday',       'vertical_ai',         'subscription_annual',   NULL,    NULL,  NULL,    NULL,    false, true,  76, 65, 65, 80, 88, 84, NULL,    '{text}',                   '{us,eu}',       true,  true,  true,  'https://www.workday.com/illuminate',                 'seed', 'HR & Finance AI platform'),

-- HubSpot
('hubspot-ai',               'HubSpot AI',              'HubSpot',       'vertical_ai',         'subscription_monthly',  NULL,    NULL,   50.00,  540.00, true,  true,  74, 90, 88, 78, 75, 82, NULL,    '{text,image}',             '{us,eu,ap}',    true,  false, true,  'https://www.hubspot.com/products/artificial-intelligence', 'seed', 'CRM + marketing AI'),

-- Zendesk
('zendesk-ai',               'Zendesk AI (Sunshine)',   'Zendesk',       'vertical_ai',         'subscription_monthly',  NULL,    NULL,   55.00,  600.00, false, true,  73, 85, 84, 78, 78, 84, NULL,    '{text}',                   '{us,eu,ap}',    true,  false, true,  'https://www.zendesk.com/service/ai',                 'seed', 'CX & support AI'),

-- Writer
('writer-palmyra',           'Writer Palmyra',          'Writer',        'enterprise_suite',    'subscription_monthly',  NULL,    NULL,  200.00, 2000.00, false, true,  78, 80, 80, 82, 85, 80, NULL,    '{text}',                   '{us,eu}',       true,  true,  true,  'https://writer.com/pricing',                         'seed', 'Enterprise LLM stack'),

-- Databricks
('databricks-dbrx',          'Databricks DBRX',         'Databricks',    'infrastructure',      'consumption_based',     NULL,    NULL,  NULL,    NULL,    false, true,  78, 65, 64, 90, 85, 80, NULL,    '{text}',                   '{us,eu,ap}',    true,  true,  true,  'https://www.databricks.com/product/machine-learning', 'seed', 'Lakehouse-native AI'),

-- Snowflake
('snowflake-cortex',         'Snowflake Cortex AI',     'Snowflake',     'infrastructure',      'consumption_based',     NULL,    NULL,  NULL,    NULL,    false, true,  77, 68, 68, 88, 86, 78, NULL,    '{text}',                   '{us,eu,ap}',    true,  true,  true,  'https://www.snowflake.com/en/data-cloud/cortex',     'seed', 'SQL-accessible AI functions'),

-- Together AI
('together-ai',              'Together AI',             'Together AI',   'developer_api',       'per_token',             0.20,    0.20,  NULL,    NULL,    true,  true,  73, 82, 82, 84, 65, 65, 32768,   '{text,image}',             '{us}',          false, false, false, 'https://www.together.ai/pricing',                    'seed', 'Open-source model hosting'),

-- Replicate
('replicate',                'Replicate',               'Replicate',     'developer_api',       'consumption_based',     NULL,    NULL,  NULL,    NULL,    true,  false, 68, 85, 84, 80, 55, 55, NULL,    '{text,image,audio,video}', '{us}',          false, false, false, 'https://replicate.com/pricing',                      'seed', 'Model-as-a-service'),

-- Fireworks AI
('fireworks-ai',             'Fireworks AI',            'Fireworks',     'developer_api',       'per_token',             0.20,    0.20,  NULL,    NULL,    true,  true,  72, 86, 86, 82, 62, 60, 128000,  '{text}',                   '{us}',          false, false, false, 'https://fireworks.ai/pricing',                       'seed', 'Fast open-source inference'),

-- Nvidia
('nvidia-nim',               'NVIDIA NIM',              'NVIDIA',        'infrastructure',      'consumption_based',     NULL,    NULL,  NULL,    NULL,    false, true,  80, 62, 60, 92, 80, 78, NULL,    '{text,image}',             '{us,eu,ap}',    true,  false, true,  'https://build.nvidia.com',                           'seed', 'Optimised inference microservices'),

-- Stability AI
('stability-ai',             'Stability AI API',        'Stability AI',  'developer_api',       'per_request',           NULL,    NULL,   20.00,  200.00, true,  false, 65, 80, 82, 76, 58, 55, NULL,    '{image,video}',            '{us,eu}',       false, false, true,  'https://platform.stability.ai/pricing',              'seed', 'Image/video generation'),

-- Midjourney
('midjourney',               'Midjourney',              'Midjourney',    'productivity',        'subscription_monthly',  NULL,    NULL,   30.00,  288.00, false, false, 62, 90, 92, 72, 52, 50, NULL,    '{image}',                  '{us}',          false, false, false, 'https://www.midjourney.com/account',                 'seed', 'Creative image generation'),

-- Runway
('runway-gen3',              'Runway Gen-3 Alpha',      'Runway',        'developer_api',       'subscription_monthly',  NULL,    NULL,   76.00,  816.00, true,  false, 65, 82, 84, 74, 58, 58, NULL,    '{image,video}',            '{us}',          false, false, false, 'https://runwayml.com/pricing',                       'seed', 'AI video generation'),

-- Eleven Labs
('elevenlabs',               'ElevenLabs',              'ElevenLabs',    'developer_api',       'subscription_monthly',  NULL,    NULL,   22.00,  240.00, true,  true,  70, 88, 90, 80, 68, 70, NULL,    '{audio}',                  '{us,eu}',       true,  false, true,  'https://elevenlabs.io/pricing',                      'seed', 'AI voice synthesis'),

-- AssemblyAI
('assemblyai',               'AssemblyAI',              'AssemblyAI',    'developer_api',       'per_request',           NULL,    NULL,  NULL,    NULL,    true,  true,  72, 88, 88, 82, 72, 70, NULL,    '{audio}',                  '{us,eu}',       true,  true,  true,  'https://www.assemblyai.com/pricing',                 'seed', 'Enterprise speech-to-text + LLM'),

-- Scale AI
('scale-ai-enterprise',      'Scale AI Enterprise',     'Scale AI',      'enterprise_suite',    'enterprise_custom',     NULL,    NULL,  NULL,    NULL,    false, true,  80, 65, 62, 86, 82, 80, NULL,    '{text,image}',             '{us,eu}',       true,  true,  true,  'https://scale.com',                                  'seed', 'Data labelling + RLHF'),

-- Weights & Biases
('wandb-enterprise',         'W&B Enterprise',          'Weights & Biases', 'infrastructure',  'subscription_monthly',  NULL,    NULL,  50.00,  540.00, false, true,  72, 70, 70, 84, 78, 78, NULL,    '{text}',                   '{us,eu}',       true,  false, true,  'https://wandb.ai/pricing',                           'seed', 'MLOps experiment tracking'),

-- Hugging Face
('huggingface-enterprise',   'HF Enterprise Hub',       'Hugging Face',  'infrastructure',      'subscription_monthly',  NULL,    NULL,  20.00,  200.00, true,  true,  74, 78, 76, 85, 68, 70, NULL,    '{text,image,audio}',       '{us,eu}',       false, false, true,  'https://huggingface.co/pricing',                     'seed', 'Model hub + Inference Endpoints'),

-- Abacus AI
('abacus-ai',                'Abacus.AI',               'Abacus AI',     'enterprise_suite',    'subscription_monthly',  NULL,    NULL,  99.00,  990.00, false, true,  76, 72, 73, 82, 78, 74, NULL,    '{text}',                   '{us,eu}',       true,  true,  true,  'https://abacus.ai/pricing',                          'seed', 'AutoML + LLM orchestration'),

-- C3.ai
('c3-ai-enterprise',         'C3 AI Enterprise',        'C3.ai',         'enterprise_suite',    'enterprise_custom',     NULL,    NULL,  NULL,    NULL,    false, true,  76, 58, 56, 80, 85, 80, NULL,    '{text}',                   '{us,eu,ap}',    true,  true,  true,  'https://c3.ai/pricing',                              'seed', 'Industry-specific AI apps')

ON CONFLICT (platform_slug) DO UPDATE SET
  platform_name             = EXCLUDED.platform_name,
  vendor                    = EXCLUDED.vendor,
  category                  = EXCLUDED.category,
  pricing_model             = EXCLUDED.pricing_model,
  price_input_per_1m_tokens = EXCLUDED.price_input_per_1m_tokens,
  price_output_per_1m_tokens = EXCLUDED.price_output_per_1m_tokens,
  price_per_request         = EXCLUDED.price_per_request,
  monthly_base_price        = EXCLUDED.monthly_base_price,
  annual_base_price         = EXCLUDED.annual_base_price,
  free_tier_included        = EXCLUDED.free_tier_included,
  enterprise_pricing_available = EXCLUDED.enterprise_pricing_available,
  roi_score                 = EXCLUDED.roi_score,
  ease_of_integration       = EXCLUDED.ease_of_integration,
  time_to_value_score       = EXCLUDED.time_to_value_score,
  scalability_score         = EXCLUDED.scalability_score,
  security_compliance_score = EXCLUDED.security_compliance_score,
  support_score             = EXCLUDED.support_score,
  context_window_tokens     = EXCLUDED.context_window_tokens,
  supported_modalities      = EXCLUDED.supported_modalities,
  soc2_compliant            = EXCLUDED.soc2_compliant,
  hipaa_eligible            = EXCLUDED.hipaa_eligible,
  gdpr_compliant            = EXCLUDED.gdpr_compliant,
  pricing_page_url          = EXCLUDED.pricing_page_url,
  last_verified_at          = now(),
  notes                     = EXCLUDED.notes,
  updated_at                = now();

COMMENT ON TABLE public.ai_platform_pricing IS
  'Live + cached pricing and capability scores for top 50 enterprise AI platforms. Refreshed hourly by the Rust pricing service.';
