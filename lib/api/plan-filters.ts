/**
 * Enterprise-grade plan filtering utilities for Kronova ROI Calculator
 * Ensures legacy Resend-It branded plans are never displayed to users
 */

export type PlanBrand = "kronova" | "competitor" | "legacy_resendit"

export interface ComparablePlan {
  id: string
  provider: string
  plan_id: string
  name: string
  monthly_price: number | null
  yearly_price: number | null
  monthly_standard_price?: number | null
  yearly_standard_price?: number | null
  features: string[]
  limits: Record<string, number | string>
  recommended?: boolean
  is_kronova_plan?: boolean
  brand?: PlanBrand
  active?: boolean
  custom_pricing?: boolean
  pay_as_you_go?: boolean
  is_introductory?: boolean
}

/**
 * Filter plans to only show Kronova and competitor plans
 * Excludes any legacy Resend-It branded plans
 */
export function filterDisplayablePlans(plans: ComparablePlan[]): ComparablePlan[] {
  return plans.filter((plan) => {
    // Exclude inactive plans
    if (plan.active === false) return false

    // Exclude legacy Resend-It plans by brand
    if (plan.brand === "legacy_resendit") return false

    // Exclude plans with Resend-It in provider name (case-insensitive)
    if (plan.provider?.toLowerCase().includes("resend")) return false

    // Exclude plans with Resend-It in plan_id (case-insensitive)
    if (plan.plan_id?.toLowerCase().includes("resend")) return false

    return true
  })
}

/**
 * Filter to only show Kronova-branded plans
 */
export function filterKronovaPlans(plans: ComparablePlan[]): ComparablePlan[] {
  return filterDisplayablePlans(plans).filter((plan) => plan.is_kronova_plan === true || plan.brand === "kronova")
}

/**
 * Filter to only show competitor plans (non-Kronova)
 */
export function filterCompetitorPlans(plans: ComparablePlan[]): ComparablePlan[] {
  return filterDisplayablePlans(plans).filter((plan) => plan.is_kronova_plan !== true && plan.brand !== "kronova")
}

/**
 * Sort plans by recommendation status and price
 */
export function sortPlansByRecommendation(plans: ComparablePlan[]): ComparablePlan[] {
  return [...plans].sort((a, b) => {
    // Recommended plans first
    if (a.recommended && !b.recommended) return -1
    if (!a.recommended && b.recommended) return 1

    // Then sort by yearly price (ascending)
    const priceA = a.yearly_price ?? a.yearly_standard_price ?? Number.POSITIVE_INFINITY
    const priceB = b.yearly_price ?? b.yearly_standard_price ?? Number.POSITIVE_INFINITY

    return priceA - priceB
  })
}

/**
 * Get all displayable plans sorted appropriately
 */
export function getDisplayablePlans(plans: ComparablePlan[]): {
  kronovaPlans: ComparablePlan[]
  competitorPlans: ComparablePlan[]
  allPlans: ComparablePlan[]
} {
  const displayable = filterDisplayablePlans(plans)

  return {
    kronovaPlans: sortPlansByRecommendation(filterKronovaPlans(displayable)),
    competitorPlans: sortPlansByRecommendation(filterCompetitorPlans(displayable)),
    allPlans: sortPlansByRecommendation(displayable),
  }
}
