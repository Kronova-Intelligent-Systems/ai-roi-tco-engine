"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Admin API route to compare ai_models with roi_calc_comparable_plans
 * Returns providers/models that exist in ai_models but not in plans table
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all ai_models
    const { data: aiModels, error: modelsError } = await supabase
      .from("ai_models")
      .select("*")
      .eq("is_active", true)
      .order("provider", { ascending: true })

    if (modelsError) {
      console.error("[v0] Error fetching ai_models:", modelsError)
      return NextResponse.json({ error: modelsError.message }, { status: 500 })
    }

    // Fetch all roi_calc_comparable_plans
    const { data: plans, error: plansError } = await supabase
      .from("roi_calc_comparable_plans")
      .select("*")
      .eq("active", true)
      .order("provider", { ascending: true })

    if (plansError) {
      console.error("[v0] Error fetching plans:", plansError)
      return NextResponse.json({ error: plansError.message }, { status: 500 })
    }

    // Extract unique providers from ai_models
    const modelProviders = [...new Set(aiModels?.map((m) => m.provider.toLowerCase()) || [])]

    // Extract unique providers from plans
    const planProviders = [...new Set(plans?.map((p) => p.provider.toLowerCase()) || [])]

    // Find providers in ai_models that don't have plans
    const missingProviders = modelProviders.filter((p) => !planProviders.includes(p))

    // Group models by provider
    const modelsByProvider: Record<string, typeof aiModels> = {}
    aiModels?.forEach((model) => {
      const provider = model.provider.toLowerCase()
      if (!modelsByProvider[provider]) {
        modelsByProvider[provider] = []
      }
      modelsByProvider[provider].push(model)
    })

    // Group plans by provider
    const plansByProvider: Record<string, typeof plans> = {}
    plans?.forEach((plan) => {
      const provider = plan.provider.toLowerCase()
      if (!plansByProvider[provider]) {
        plansByProvider[provider] = []
      }
      plansByProvider[provider].push(plan)
    })

    return NextResponse.json({
      summary: {
        totalModels: aiModels?.length || 0,
        totalPlans: plans?.length || 0,
        modelProviders: modelProviders.sort(),
        planProviders: planProviders.sort(),
        missingProviders: missingProviders.sort(),
      },
      aiModels: aiModels || [],
      plans: plans || [],
      modelsByProvider,
      plansByProvider,
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
