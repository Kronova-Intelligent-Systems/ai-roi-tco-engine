-- Seed AI SaaS Competitor Subscription Plans
-- This migration adds a comprehensive library of competitor plans for comparison

-- Insert Kronova subscription plans
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, monthly_standard_price, yearly_standard_price, is_introductory, features, limits, is_kronova_plan, recommended) VALUES
  ('Kronova', 'kronova-lite', 'Lite', 9, 108, 19, 228, true, 
   ARRAY['100,000 AI tokens/month', '100 managed assets', '1 team member', 'Basic support'],
   '{"ai_tokens": 100000, "managed_assets": 100, "storage": 1, "team_members": 1, "api_calls": 1000}'::jsonb,
   true, false),
  ('Kronova', 'kronova-starter', 'Starter', 99, 990, null, null, false,
   ARRAY['1,000,000 AI tokens/month', '1,000 managed assets', '5 team members', 'Basic analytics'],
   '{"ai_tokens": 1000000, "managed_assets": 1000, "storage": 5, "team_members": 5, "api_calls": 10000}'::jsonb,
   true, false),
  ('Kronova', 'kronova-professional', 'Professional', 299, 2990, null, null, false,
   ARRAY['10,000,000 AI tokens/month', '10,000 managed assets', '25 team members', 'Advanced analytics', 'API access'],
   '{"ai_tokens": 10000000, "managed_assets": 10000, "storage": 50, "team_members": 25, "api_calls": 100000}'::jsonb,
   true, true),
  ('Kronova', 'kronova-enterprise', 'Enterprise', 999, 9990, null, null, false,
   ARRAY['Unlimited AI tokens', 'Unlimited managed assets', 'Unlimited team members', 'Custom integrations', 'Dedicated support'],
   '{"ai_tokens": -1, "managed_assets": -1, "storage": 500, "team_members": -1, "api_calls": -1}'::jsonb,
   true, false)
ON CONFLICT (plan_id) DO NOTHING;

-- Insert Resend-It subscription plans
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, monthly_standard_price, yearly_standard_price, is_introductory, features, limits, is_resend_it_plan, recommended) VALUES
  ('Resend-It', 'resend-it-lite', 'Lite', 9, 108, 19, 228, true, 
   ARRAY['100,000 AI tokens/month', '100 managed assets', '1 team member', 'Basic support'],
   '{"ai_tokens": 100000, "managed_assets": 100, "storage": 1, "team_members": 1, "api_calls": 1000}'::jsonb,
   true, false),
  ('Resend-It', 'resend-it-starter', 'Starter', 99, 990, null, null, false,
   ARRAY['1,000,000 AI tokens/month', '1,000 managed assets', '5 team members', 'Basic analytics'],
   '{"ai_tokens": 1000000, "managed_assets": 1000, "storage": 5, "team_members": 5, "api_calls": 10000}'::jsonb,
   true, false),
  ('Resend-It', 'resend-it-professional', 'Professional', 299, 2990, null, null, false,
   ARRAY['10,000,000 AI tokens/month', '10,000 managed assets', '25 team members', 'Advanced analytics', 'API access'],
   '{"ai_tokens": 10000000, "managed_assets": 10000, "storage": 50, "team_members": 25, "api_calls": 100000}'::jsonb,
   true, true),
  ('Resend-It', 'resend-it-enterprise', 'Enterprise', 999, 9990, null, null, false,
   ARRAY['Unlimited AI tokens', 'Unlimited managed assets', 'Unlimited team members', 'Custom integrations', 'Dedicated support'],
   '{"ai_tokens": -1, "managed_assets": -1, "storage": 500, "team_members": -1, "api_calls": -1}'::jsonb,
   true, false)
ON CONFLICT (plan_id) DO NOTHING;

-- Insert OpenAI Plans
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, custom_pricing) VALUES
  ('OpenAI', 'openai-free', 'Free Tier', 0, 0, 
   ARRAY['GPT-4o mini', 'Limited requests', 'Standard support'],
   '{"ai_tokens": 200000, "api_calls": 3000, "rate_limit": "3 RPM"}'::jsonb, false),
  ('OpenAI', 'openai-plus', 'ChatGPT Plus', 20, 240,
   ARRAY['GPT-4', 'Faster response times', 'Priority access'],
   '{"ai_tokens": 25000000, "api_calls": 50000, "rate_limit": "50 RPM"}'::jsonb, false),
  ('OpenAI', 'openai-team', 'Team', 25, 300,
   ARRAY['GPT-4 Turbo', 'Collaboration tools', 'Admin controls', 'Team workspace'],
   '{"ai_tokens": 100000000, "api_calls": 100000, "rate_limit": "100 RPM"}'::jsonb, false),
  ('OpenAI', 'openai-enterprise', 'Enterprise', null, null,
   ARRAY['Custom models', 'Dedicated support', 'SLA guarantees', 'Security compliance'],
   '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Custom"}'::jsonb, true)
ON CONFLICT (plan_id) DO NOTHING;

-- Insert Anthropic Claude Plans
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, custom_pricing) VALUES
  ('Anthropic', 'anthropic-free', 'Free Tier', 0, 0,
   ARRAY['Claude 3 Haiku', 'Limited usage', 'Standard support'],
   '{"ai_tokens": 100000, "api_calls": 1000, "rate_limit": "5 RPM"}'::jsonb, false),
  ('Anthropic', 'anthropic-pro', 'Pro', 20, 240,
   ARRAY['Claude 3 Opus', 'Priority access', 'Extended context', '5x more usage'],
   '{"ai_tokens": 50000000, "api_calls": 100000, "rate_limit": "100 RPM"}'::jsonb, false),
  ('Anthropic', 'anthropic-team', 'Team', 30, 360,
   ARRAY['Claude 3.5 Sonnet', 'Collaboration features', 'Admin dashboard', 'Team billing'],
   '{"ai_tokens": 150000000, "api_calls": 250000, "rate_limit": "200 RPM"}'::jsonb, false)
ON CONFLICT (plan_id) DO NOTHING;

-- Insert Google AI Plans
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, pay_as_you_go) VALUES
  ('Google AI', 'google-free', 'Free Tier', 0, 0,
   ARRAY['Gemini 1.5 Flash', '60 requests per minute', 'Community support'],
   '{"ai_tokens": 1000000, "api_calls": 5000, "rate_limit": "60 RPM"}'::jsonb, false),
  ('Google AI', 'google-pro', 'Pay as you go', null, null,
   ARRAY['Gemini 1.5 Pro', 'Higher rate limits', 'Priority support'],
   '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "1000 RPM"}'::jsonb, true)
ON CONFLICT (plan_id) DO NOTHING;

-- Insert Microsoft Azure Plans
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, pay_as_you_go) VALUES
  ('Microsoft Azure', 'azure-payg', 'Pay-As-You-Go', null, null,
   ARRAY['GPT-4 Turbo', 'Enterprise security', 'Azure integration', 'Global availability'],
   '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Custom"}'::jsonb, true)
ON CONFLICT (plan_id) DO NOTHING;

-- Insert remaining competitor plans (Hugging Face, Cohere, Midjourney, Jasper AI, Copy.ai, Stability AI, Grammarly)
INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, custom_pricing) VALUES
  ('Hugging Face', 'huggingface-free', 'Free', 0, 0,
   ARRAY['Inference API', 'Community models', 'Basic compute'],
   '{"ai_tokens": 500000, "api_calls": 30000, "rate_limit": "1000 requests/day"}'::jsonb, false),
  ('Hugging Face', 'huggingface-pro', 'Pro', 9, 108,
   ARRAY['Faster inference', 'Private models', 'Priority support', 'Higher limits'],
   '{"ai_tokens": 10000000, "api_calls": 100000, "rate_limit": "10000 requests/day"}'::jsonb, false),
  ('Hugging Face', 'huggingface-enterprise', 'Enterprise', null, null,
   ARRAY['Dedicated infrastructure', 'Custom models', 'SLA', 'Advanced security'],
   '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "Unlimited"}'::jsonb, true)
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, pay_as_you_go) VALUES
  ('Cohere', 'cohere-trial', 'Trial', 0, 0,
   ARRAY['Command models', 'Trial usage', 'Standard support'],
   '{"ai_tokens": 1000000, "api_calls": 5000, "rate_limit": "10 RPM"}'::jsonb, false),
  ('Cohere', 'cohere-production', 'Production', null, null,
   ARRAY['Command R+', 'Higher limits', 'Production support'],
   '{"ai_tokens": -1, "api_calls": -1, "rate_limit": "100 RPM"}'::jsonb, true)
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits) VALUES
  ('Midjourney', 'midjourney-basic', 'Basic', 10, 96,
   ARRAY['200 images/month', 'General commercial terms', 'Optional credit top-ups'],
   '{"images_generated": 200, "fast_hours": 3.3, "relaxed_hours": -1}'::jsonb),
  ('Midjourney', 'midjourney-standard', 'Standard', 30, 288,
   ARRAY['Unlimited relaxed', '15 fast hours', 'Stealth mode available'],
   '{"images_generated": -1, "fast_hours": 15, "relaxed_hours": -1}'::jsonb),
  ('Midjourney', 'midjourney-pro', 'Pro', 60, 576,
   ARRAY['30 fast hours', 'Unlimited relaxed', 'Stealth mode', 'Max queue'],
   '{"images_generated": -1, "fast_hours": 30, "relaxed_hours": -1}'::jsonb)
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits, custom_pricing) VALUES
  ('Jasper AI', 'jasper-creator', 'Creator', 49, 468,
   ARRAY['1 user', '100,000 words/month', '50+ templates', 'SEO mode'],
   '{"words_per_month": 100000, "users": 1, "brand_voices": 1}'::jsonb, false),
  ('Jasper AI', 'jasper-pro', 'Pro', 125, 1200,
   ARRAY['Unlimited words', '5 users', 'Collaboration tools', 'API access'],
   '{"words_per_month": -1, "users": 5, "brand_voices": 3}'::jsonb, false),
  ('Jasper AI', 'jasper-business', 'Business', null, null,
   ARRAY['Custom users', 'Dedicated support', 'Custom AI training', 'Advanced security'],
   '{"words_per_month": -1, "users": -1, "brand_voices": -1}'::jsonb, true)
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits) VALUES
  ('Copy.ai', 'copyai-free', 'Free', 0, 0,
   ARRAY['2,000 words/month', '90+ tools', '25+ languages'],
   '{"words_per_month": 2000, "users": 1}'::jsonb),
  ('Copy.ai', 'copyai-pro', 'Pro', 49, 420,
   ARRAY['Unlimited words', 'Priority support', 'Plagiarism checker'],
   '{"words_per_month": -1, "users": 1}'::jsonb),
  ('Copy.ai', 'copyai-team', 'Team', 249, 2148,
   ARRAY['5 users', 'Workflow builder', 'Brand voice', 'Team collaboration'],
   '{"words_per_month": -1, "users": 5}'::jsonb)
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits) VALUES
  ('Stability AI', 'stability-free', 'Free', 0, 0,
   ARRAY['25 credits', 'Community access', 'Standard models'],
   '{"credits_per_month": 25, "api_calls": 100}'::jsonb),
  ('Stability AI', 'stability-pro', 'Professional', 20, 240,
   ARRAY['3,000 credits', 'Priority generation', 'Commercial license'],
   '{"credits_per_month": 3000, "api_calls": 10000}'::jsonb)
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO public.roi_calc_comparable_plans (provider, plan_id, name, monthly_price, yearly_price, features, limits) VALUES
  ('Grammarly', 'grammarly-free', 'Free', 0, 0,
   ARRAY['Basic writing suggestions', 'Tone detection', '100 prompts/month'],
   '{"prompts": 100, "users": 1}'::jsonb),
  ('Grammarly', 'grammarly-premium', 'Premium', 12, 144,
   ARRAY['Advanced suggestions', 'Plagiarism detection', '500 prompts/month'],
   '{"prompts": 500, "users": 1}'::jsonb),
  ('Grammarly', 'grammarly-business', 'Business', 15, 180,
   ARRAY['Team analytics', 'Brand tones', 'Centralized billing', '2000 prompts/month'],
   '{"prompts": 2000, "users": -1}'::jsonb)
ON CONFLICT (plan_id) DO NOTHING;

COMMENT ON TABLE public.roi_calc_comparable_plans IS 'Comprehensive library of AI SaaS subscription plans for ROI comparison';
