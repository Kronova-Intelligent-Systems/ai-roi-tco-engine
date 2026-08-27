import { type NextRequest, NextResponse } from "next/server"
import { calculateROI, saveCalculationToSupabase } from "@/lib/api/roi-api"
import { z } from "zod"

const requestSchema = z.object({
  organizationProfile: z.object({
    employees: z.number(),
    avgSalary: z.number(),
    industry: z.string(),
    companySize: z.string(),
  }),
  operationsMetrics: z.object({
    manualHours: z.number(),
    errorRate: z.number(),
    systemDowntime: z.number(),
    complianceCosts: z.number(),
  }),
  infrastructureData: z.object({
    dataQuality: z.number(),
    integrationComplexity: z.number(),
    legacySystemAge: z.number(),
    cloudReadiness: z.number(),
  }),
  strategicFactors: z.object({
    aiMaturity: z.number(),
    changeReadiness: z.number(),
    executiveSupport: z.number(),
    competitivePressure: z.number(),
  }),
  selectedPlan: z.string(),
  saveToDatabase: z.boolean().optional(),
  userId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = requestSchema.parse(body)

    // Calculate ROI using Rust backend
    const result = await calculateROI(validated)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Optionally save to Supabase
    if (validated.saveToDatabase) {
      await saveCalculationToSupabase(result.data, validated.userId)
    }

    return NextResponse.json({
      success: true,
      calculation: result.data,
    })
  } catch (error) {
    console.error("ROI calculation API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
