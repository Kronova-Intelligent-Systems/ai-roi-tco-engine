import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Supabase clients
// Use the publishable anon key for reads (RLS enforced on the table).
// The service-role key is only used if an admin-scoped write is needed.
// ---------------------------------------------------------------------------
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ---------------------------------------------------------------------------
// GET /api/ai-platforms
// Query params:
//   category        — filter by platform category
//   min_roi_score   — minimum ROI score (0-100)
//   require_soc2    — "true" | "false"
//   require_hipaa   — "true" | "false"
//   require_gdpr    — "true" | "false"
//   employees       — number of employees (used for cost estimation)
//   annual_cost     — current annual AI/ops cost baseline (USD)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")
    const minRoi = searchParams.get("min_roi_score")
    const requireSoc2 = searchParams.get("require_soc2") === "true"
    const requireHipaa = searchParams.get("require_hipaa") === "true"
    const requireGdpr = searchParams.get("require_gdpr") === "true"
    const employees = parseInt(searchParams.get("employees") ?? "0", 10) || 0
    const currentAnnualCost = parseFloat(searchParams.get("annual_cost") ?? "0") || 0

    // Build query using anon key (RLS: public read for is_active = true)
    let query = supabaseAnon
      .from("ai_platform_pricing")
      .select("*")
      .eq("is_active", true)
      .order("roi_score", { ascending: false })

    if (category) query = query.eq("category", category)
    if (minRoi) query = query.gte("roi_score", parseInt(minRoi, 10))
    if (requireSoc2) query = query.eq("soc2_compliant", true)
    if (requireHipaa) query = query.eq("hipaa_eligible", true)
    if (requireGdpr) query = query.eq("gdpr_compliant", true)

    const { data: platforms, error } = await query

    if (error) {
      console.error("[AI Platforms API] Supabase error:", error.message)
      return NextResponse.json(
        { error: "Failed to fetch platform data", details: error.message },
        { status: 500 },
      )
    }

    // Enrich each platform with ROI comparison data if user inputs are available
    const enriched = (platforms ?? []).map((p) =>
      enrichWithRoiComparison(p, employees, currentAnnualCost),
    )

    // Sort by composite fit score descending
    enriched.sort((a, b) => b.compositeFitScore - a.compositeFitScore)

    return NextResponse.json({
      platforms: enriched,
      total: enriched.length,
      kronova: buildKronovaBaseline(employees, currentAnnualCost),
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[AI Platforms API] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Kronova reference baseline constants
// ---------------------------------------------------------------------------
const KRONOVA_ROI_SCORE = 95
const KRONOVA_COST_PER_EMPLOYEE_YEAR = 1_800 // $150/employee/month

function buildKronovaBaseline(employees: number, currentAnnualCost: number) {
  const estimatedAnnualCost = employees > 0
    ? employees * KRONOVA_COST_PER_EMPLOYEE_YEAR
    : 0
  const estimatedSavings = currentAnnualCost > 0
    ? Math.max(0, currentAnnualCost - estimatedAnnualCost)
    : 0
  const paybackMonths =
    estimatedSavings > 0
      ? Math.min(120, (estimatedAnnualCost / estimatedSavings) * 12)
      : 0

  return {
    platformName: "Kronova",
    vendor: "Kronova Intelligent Systems",
    roiScore: KRONOVA_ROI_SCORE,
    estimatedAnnualCost,
    estimatedAnnualSavings: estimatedSavings,
    estimatedPaybackMonths: Math.round(paybackMonths * 100) / 100,
    compositeFitScore: 97, // Kronova's weighted composite
    isKronova: true,
  }
}

// ---------------------------------------------------------------------------
// Per-platform ROI comparison enrichment
// ---------------------------------------------------------------------------
function enrichWithRoiComparison(
  platform: Record<string, unknown>,
  employees: number,
  currentAnnualCost: number,
) {
  const estimated = estimateAnnualCost(platform, employees)
  const savings = currentAnnualCost > 0 ? Math.max(0, currentAnnualCost - estimated) : 0
  const paybackMonths =
    savings > 0 ? Math.min(120, (estimated / savings) * 12) : 120

  // Weighted composite fit score
  const compositeFitScore =
    Number(platform.roi_score ?? 0) * 0.35 +
    Number(platform.ease_of_integration ?? 0) * 0.20 +
    Number(platform.time_to_value_score ?? 0) * 0.15 +
    Number(platform.security_compliance_score ?? 0) * 0.15 +
    Number(platform.scalability_score ?? 0) * 0.10 +
    Number(platform.support_score ?? 0) * 0.05

  return {
    ...platform,
    estimatedAnnualCost: Math.round(estimated),
    estimatedAnnualSavings: Math.round(savings),
    estimatedPaybackMonths: Math.round(paybackMonths * 100) / 100,
    compositeFitScore: Math.round(compositeFitScore * 10) / 10,
    roiScoreVsKronova: Number(platform.roi_score ?? 0) - KRONOVA_ROI_SCORE,
    isKronova: false,
  }
}

function estimateAnnualCost(
  platform: Record<string, unknown>,
  employees: number,
): number {
  if (employees <= 0) return 0

  const inputPrice = Number(platform.price_input_per_1m_tokens ?? 0)
  const outputPrice = Number(platform.price_output_per_1m_tokens ?? 0)
  const monthlyBase = Number(platform.monthly_base_price ?? 0)
  const annualBase = Number(platform.annual_base_price ?? 0)
  const pricingModel = platform.pricing_model as string

  if (inputPrice > 0 || outputPrice > 0) {
    // Token-based: 15k tokens/day × 220 working days
    const tokensMPerYear = (employees * 15_000 * 220) / 1_000_000
    const tokenCost = tokensMPerYear * (0.4 * inputPrice + 0.6 * outputPrice)
    return tokenCost + monthlyBase * 12
  }

  if (monthlyBase > 0) {
    const isPerSeat =
      pricingModel === "subscription_monthly" && monthlyBase < 200
    return isPerSeat ? monthlyBase * employees * 12 : monthlyBase * 12
  }

  if (annualBase > 0) return annualBase

  // Enterprise custom: conservative floor $500/employee/year
  return employees * 500
}
