import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// Create Supabase client with service role for public inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const assessmentSchema = z.object({
  // Optional identification
  email: z.string().email().optional().nullable(),
  companyName: z.string().max(255).optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  
  // Organization Profile
  employees: z.number().int().min(1).max(1000000),
  avgSalary: z.number().min(0).max(10000000),
  industry: z.string().max(100),
  companySize: z.string().max(50),
  
  // Current Operations
  manualHours: z.number().min(0).max(168),
  errorRate: z.number().min(0).max(100),
  systemDowntime: z.number().min(0).max(100),
  complianceCosts: z.number().min(0),
  
  // Data & Infrastructure
  dataQuality: z.number().int().min(0).max(100),
  integrationComplexity: z.number().int().min(0).max(100),
  legacySystemAge: z.number().int().min(0).max(50),
  cloudReadiness: z.number().int().min(0).max(100),
  
  // Strategic Factors
  aiMaturity: z.number().int().min(0).max(100),
  changeReadiness: z.number().int().min(0).max(100),
  executiveSupport: z.number().int().min(0).max(100),
  competitivePressure: z.number().int().min(0).max(100),
  
  // Hidden Costs
  dataPreparationCosts: z.number().min(0).optional(),
  trainingCosts: z.number().min(0).optional(),
  maintenanceCosts: z.number().min(0).optional(),
  securityCosts: z.number().min(0).optional(),
  
  // Selected Plan
  selectedPlan: z.string().max(100),
  
  // Calculation Results
  results: z.object({
    currentAnnualCost: z.number(),
    kronovaAnnualCost: z.number(),
    annualSavings: z.number(),
    roi: z.number(),
    paybackMonths: z.number(), // Accept float, will round in display
    threeYearSavings: z.number(),
    fiveYearValue: z.number(),
    operationalSavings: z.number(),
    qualitySavings: z.number(),
    strategicValue: z.number(),
    hiddenCostReduction: z.number(),
    implementationRisk: z.number(),
    dataQualityRisk: z.number(),
    adoptionRisk: z.number(),
    productivityGain: z.number(),
    errorReduction: z.number(),
    timeToValue: z.number(), // Accept float, will round in display
  }),
  
  // Consent flags
  consentMarketing: z.boolean().optional(),
  consentFollowUp: z.boolean().optional(),
  
  // Analytics
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(100).optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = assessmentSchema.parse(body)
    
    // Get client info
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : request.headers.get("x-real-ip")
    const userAgent = request.headers.get("user-agent")
    
    // Insert assessment into database
    const { data, error } = await supabase
      .from("roi_public_assessments")
      .insert({
        user_id: validated.userId || null,
        email: validated.email || null,
        company_name: validated.companyName || null,
        
        // Organization Profile
        employees: validated.employees,
        avg_salary: validated.avgSalary,
        industry: validated.industry,
        company_size: validated.companySize,
        
        // Current Operations
        manual_hours_per_week: validated.manualHours,
        error_rate_percentage: validated.errorRate,
        system_downtime_percentage: validated.systemDowntime,
        compliance_costs: validated.complianceCosts,
        
        // Data & Infrastructure
        data_quality_score: validated.dataQuality,
        integration_complexity: validated.integrationComplexity,
        legacy_system_age_years: validated.legacySystemAge,
        cloud_readiness_score: validated.cloudReadiness,
        
        // Strategic Factors
        ai_maturity_score: validated.aiMaturity,
        change_readiness_score: validated.changeReadiness,
        executive_support_score: validated.executiveSupport,
        competitive_pressure_score: validated.competitivePressure,
        
        // Hidden Costs
        data_preparation_costs: validated.dataPreparationCosts || 0,
        training_costs: validated.trainingCosts || 0,
        maintenance_costs: validated.maintenanceCosts || 0,
        security_costs: validated.securityCosts || 0,
        
        // Selected Plan
        selected_plan: validated.selectedPlan,
        
        // Calculation Results
        current_annual_cost: validated.results.currentAnnualCost,
        kronova_annual_cost: validated.results.kronovaAnnualCost,
        annual_savings: validated.results.annualSavings,
        roi_percentage: validated.results.roi,
        payback_months: validated.results.paybackMonths,
        three_year_savings: validated.results.threeYearSavings,
        five_year_value: validated.results.fiveYearValue,
        
        // Savings Breakdown
        operational_savings: validated.results.operationalSavings,
        quality_savings: validated.results.qualitySavings,
        strategic_value: validated.results.strategicValue,
        hidden_cost_reduction: validated.results.hiddenCostReduction,
        
        // Risk Factors
        implementation_risk: validated.results.implementationRisk,
        data_quality_risk: validated.results.dataQualityRisk,
        adoption_risk: validated.results.adoptionRisk,
        
        // Performance Metrics
        productivity_gain: validated.results.productivityGain,
        error_reduction: validated.results.errorReduction,
        time_to_value_months: validated.results.timeToValue,
        
        // Metadata
        source: "web_calculator",
        ip_address: ipAddress,
        user_agent: userAgent,
        utm_source: validated.utmSource || null,
        utm_medium: validated.utmMedium || null,
        utm_campaign: validated.utmCampaign || null,
        
        // Consent
        consent_marketing: validated.consentMarketing || false,
        consent_follow_up: validated.consentFollowUp || false,
      })
      .select("id, assessment_reference, created_at")
      .single()
    
    if (error) {
      console.error("[ROI Assessment] Database error:", error)
      return NextResponse.json(
        { error: "Failed to save assessment", details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      assessment: {
        id: data.id,
        reference: data.assessment_reference,
        createdAt: data.created_at,
      },
    })
  } catch (error) {
    console.error("[ROI Assessment] API error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve assessment by reference
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")
    const id = searchParams.get("id")
    
    if (!reference && !id) {
      return NextResponse.json(
        { error: "Assessment reference or ID required" },
        { status: 400 }
      )
    }
    
    let query = supabase
      .from("roi_public_assessments")
      .select("*")
    
    if (reference) {
      query = query.eq("assessment_reference", reference)
    } else if (id) {
      query = query.eq("id", id)
    }
    
    const { data, error } = await query.single()
    
    if (error || !data) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }
    
    // Map database columns to API response format
    return NextResponse.json({
      success: true,
      assessment: {
        id: data.id,
        reference: data.assessment_reference,
        email: data.email,
        companyName: data.company_name,
        
        // Organization Profile
        employees: data.employees,
        avgSalary: data.avg_salary,
        industry: data.industry,
        companySize: data.company_size,
        
        // Current Operations
        manualHours: data.manual_hours_per_week,
        errorRate: data.error_rate_percentage,
        systemDowntime: data.system_downtime_percentage,
        complianceCosts: data.compliance_costs,
        
        // Data & Infrastructure
        dataQuality: data.data_quality_score,
        integrationComplexity: data.integration_complexity,
        legacySystemAge: data.legacy_system_age_years,
        cloudReadiness: data.cloud_readiness_score,
        
        // Strategic Factors
        aiMaturity: data.ai_maturity_score,
        changeReadiness: data.change_readiness_score,
        executiveSupport: data.executive_support_score,
        competitivePressure: data.competitive_pressure_score,
        
        // Hidden Costs
        dataPreparationCosts: data.data_preparation_costs,
        trainingCosts: data.training_costs,
        maintenanceCosts: data.maintenance_costs,
        securityCosts: data.security_costs,
        
        // Selected Plan
        selectedPlan: data.selected_plan,
        
        // Results
        results: {
          currentAnnualCost: data.current_annual_cost,
          kronovaAnnualCost: data.kronova_annual_cost,
          annualSavings: data.annual_savings,
          roi: data.roi_percentage,
          paybackMonths: data.payback_months,
          threeYearSavings: data.three_year_savings,
          fiveYearValue: data.five_year_value,
          operationalSavings: data.operational_savings,
          qualitySavings: data.quality_savings,
          strategicValue: data.strategic_value,
          hiddenCostReduction: data.hidden_cost_reduction,
          implementationRisk: data.implementation_risk,
          dataQualityRisk: data.data_quality_risk,
          adoptionRisk: data.adoption_risk,
          productivityGain: data.productivity_gain,
          errorReduction: data.error_reduction,
          timeToValue: data.time_to_value_months,
        },
        
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error("[ROI Assessment] GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
