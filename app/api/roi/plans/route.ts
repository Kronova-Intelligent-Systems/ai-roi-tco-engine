import { NextResponse } from "next/server"
import { getSubscriptionPlans } from "@/lib/api/roi-api"
import { filterDisplayablePlans } from "@/lib/api/plan-filters"

export async function GET() {
  try {
    const result = await getSubscriptionPlans()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const filteredPlans = filterDisplayablePlans(result.data || [])

    return NextResponse.json({
      success: true,
      plans: filteredPlans,
    })
  } catch (error) {
    console.error("Subscription plans API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
