// ---------------------------------------------------------------------------
// AI Platform Pricing API client
// Used by the UI to fetch + cache platform comparison data.
// ---------------------------------------------------------------------------

export type AiPlatformCategory =
  | "foundation_model"
  | "enterprise_suite"
  | "developer_api"
  | "productivity"
  | "vertical_ai"
  | "infrastructure"
  | "open_source_hosted"

export type PricingModelType =
  | "per_token"
  | "per_request"
  | "subscription_monthly"
  | "subscription_annual"
  | "consumption_based"
  | "hybrid"
  | "free_tier_then_paid"
  | "enterprise_custom"

export interface AiPlatformRecord {
  id: string
  platform_slug: string
  platform_name: string
  vendor: string
  category: AiPlatformCategory
  pricing_model: PricingModelType
  price_input_per_1m_tokens: number | null
  price_output_per_1m_tokens: number | null
  price_per_request: number | null
  monthly_base_price: number | null
  annual_base_price: number | null
  free_tier_included: boolean
  free_tier_details: string | null
  enterprise_pricing_available: boolean
  roi_score: number
  ease_of_integration: number
  time_to_value_score: number
  scalability_score: number
  security_compliance_score: number
  support_score: number
  context_window_tokens: number | null
  supported_modalities: string[]
  regions_available: string[]
  soc2_compliant: boolean
  hipaa_eligible: boolean
  gdpr_compliant: boolean
  pricing_page_url: string | null
  data_source: string
  last_verified_at: string
  notes: string | null
  // Enriched fields added by the API route
  estimatedAnnualCost: number
  estimatedAnnualSavings: number
  estimatedPaybackMonths: number
  compositeFitScore: number
  roiScoreVsKronova: number
  isKronova: boolean
}

export interface KronovaBaseline {
  platformName: "Kronova"
  vendor: "Kronova Intelligent Systems"
  roiScore: number
  estimatedAnnualCost: number
  estimatedAnnualSavings: number
  estimatedPaybackMonths: number
  compositeFitScore: number
  isKronova: true
}

export interface AiPlatformsResponse {
  platforms: AiPlatformRecord[]
  total: number
  kronova: KronovaBaseline
  fetchedAt: string
}

export interface AiPlatformFilters {
  category?: AiPlatformCategory
  minRoiScore?: number
  requireSoc2?: boolean
  requireHipaa?: boolean
  requireGdpr?: boolean
}

export interface AiPlatformQueryParams {
  employees?: number
  annualCost?: number
  filters?: AiPlatformFilters
}

export const CATEGORY_LABELS: Record<AiPlatformCategory, string> = {
  foundation_model: "Foundation Model",
  enterprise_suite: "Enterprise Suite",
  developer_api: "Developer API",
  productivity: "Productivity",
  vertical_ai: "Vertical AI",
  infrastructure: "Infrastructure",
  open_source_hosted: "Open Source",
}

export async function fetchAiPlatforms(
  params: AiPlatformQueryParams = {},
): Promise<AiPlatformsResponse> {
  const { employees = 0, annualCost = 0, filters = {} } = params

  const searchParams = new URLSearchParams()
  if (employees > 0) searchParams.set("employees", employees.toString())
  if (annualCost > 0) searchParams.set("annual_cost", annualCost.toString())
  if (filters.category) searchParams.set("category", filters.category)
  if (filters.minRoiScore) searchParams.set("min_roi_score", filters.minRoiScore.toString())
  if (filters.requireSoc2) searchParams.set("require_soc2", "true")
  if (filters.requireHipaa) searchParams.set("require_hipaa", "true")
  if (filters.requireGdpr) searchParams.set("require_gdpr", "true")

  const url = `/api/ai-platforms?${searchParams.toString()}`
  const res = await fetch(url, { next: { revalidate: 3600 } }) // cache 1 hour

  if (!res.ok) {
    throw new Error(`Failed to fetch AI platforms: ${res.statusText}`)
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatPlatformPrice(platform: AiPlatformRecord): string {
  if (platform.price_input_per_1m_tokens != null) {
    return `$${platform.price_input_per_1m_tokens}/1M tokens`
  }
  if (platform.monthly_base_price != null) {
    return `$${platform.monthly_base_price}/mo`
  }
  if (platform.annual_base_price != null) {
    return `$${platform.annual_base_price}/yr`
  }
  return "Custom pricing"
}

export function getRoiScoreColor(score: number): string {
  if (score >= 85) return "text-green-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-500"
}

export function getScoreBarColor(score: number): string {
  if (score >= 85) return "bg-green-500"
  if (score >= 70) return "bg-yellow-500"
  return "bg-red-500"
}

export function formatDeltaScore(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`
}
