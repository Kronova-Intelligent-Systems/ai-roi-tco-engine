"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { z } from "zod"
import { allAISaasPlans, getMockIndustryBenchmark } from "@/lib/api/mock-data"
import { filterDisplayablePlans, filterKronovaPlans } from "@/lib/api/plan-filters"

const ROICalculationInputSchema = z.object({
  organizationProfile: z.object({
    employees: z.number().min(1),
    avgSalary: z.number().min(0),
    industry: z.string().min(2),
    companySize: z.string().min(2),
  }),
  operationsMetrics: z.object({
    manualHours: z.number().min(0).max(40),
    errorRate: z.number().min(0).max(100),
    systemDowntime: z.number().min(0).max(100),
    complianceCosts: z.number().min(0),
  }),
  infrastructureData: z.object({
    dataQuality: z.number().min(0).max(100),
    integrationComplexity: z.number().min(0).max(100),
    legacySystemAge: z.number().min(0),
    cloudReadiness: z.number().min(0).max(100),
  }),
  strategicFactors: z.object({
    aiMaturity: z.number().min(0).max(100),
    changeReadiness: z.number().min(0).max(100),
    executiveSupport: z.number().min(0).max(100),
    competitivePressure: z.number().min(0).max(100),
  }),
  selectedPlan: z.string().min(1),
})

export type ROICalculationInput = z.infer<typeof ROICalculationInputSchema>

const RUST_API_URL = process.env.RUST_API_URL || "http://127.0.0.1:3003"
const USE_FALLBACK = !process.env.RUST_API_URL || process.env.USE_MOCK_DATA === "true"

// Industry benchmarks based on McKinsey, Deloitte, and SAP 2025-2026 research
const industryMultipliers: Record<string, { complexity: number; savings: number; risk: number; aiAdoptionRate: number }> = {
  manufacturing: { complexity: 1.3, savings: 1.4, risk: 1.2, aiAdoptionRate: 0.72 },
  retail: { complexity: 1.0, savings: 1.2, risk: 0.9, aiAdoptionRate: 0.68 },
  healthcare: { complexity: 1.5, savings: 1.6, risk: 1.4, aiAdoptionRate: 0.65 },
  finance: { complexity: 1.4, savings: 1.5, risk: 1.3, aiAdoptionRate: 0.78 },
  logistics: { complexity: 1.2, savings: 1.7, risk: 1.1, aiAdoptionRate: 0.70 },
  technology: { complexity: 0.8, savings: 1.1, risk: 0.7, aiAdoptionRate: 0.85 },
  other: { complexity: 1.0, savings: 1.0, risk: 1.0, aiAdoptionRate: 0.60 },
}

// Token value calculation representing the Standard Inference Token (SIT) baseline
function calculateTokenValue(monthlyTokens: number, employees: number, avgSalary: number): number {
  const hourlyRate = avgSalary / 2080
  const hoursPerYear = 217 // 50 min/day * 260 working days / 60
  const baseProductivityValue = hourlyRate * hoursPerYear
  
  const tokensPerEmployeePerMonth = 400000
  const coverageRatio = Math.min(1, monthlyTokens / (employees * tokensPerEmployeePerMonth))
  const effectiveCoverage = monthlyTokens === -1 ? 1 : coverageRatio
  
  return baseProductivityValue * employees * effectiveCoverage * 1.8
}

const KRONOVA_FEATURE_VALUES = {
  proprietaryTools: { count: 18, valuePerTool: 0.04 },
  voicePlatform: { adoptionRate: 0.35, productivityBoost: 0.15 },
  assetTokenization: { 
    relevantIndustries: ["finance", "manufacturing", "logistics", "retail"],
    valueMultiplier: 0.12 
  },
  stablecoinIntegration: { 
    relevantIndustries: ["finance", "retail", "technology"],
    costReduction: 0.08 
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function universalResultsMapper(apiData: any) {
  if (!apiData) return {}

  // Enterprise Fix: Safely parse numbers to prevent NaN or stringified-decimal crashes
  // Rust `Decimal` types often serialize to JSON as strings (e.g., "150000.00") to preserve precision.
  // When React attempts math on these strings, they break and result in $0.00.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseNum = (val: any) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  return {
    currentAnnualCost: parseNum(apiData.currentAnnualCost ?? apiData.current_annual_cost),
    kronovaAnnualCost: parseNum(apiData.kronovaAnnualCost ?? apiData.kronova_annual_cost ?? apiData.resenditAnnualCost ?? apiData.resendit_annual_cost),
    annualSavings: parseNum(apiData.annualSavings ?? apiData.annual_savings),
    roi: parseNum(apiData.roi),
    paybackMonths: parseNum(apiData.paybackMonths ?? apiData.payback_months),
    threeYearSavings: parseNum(apiData.threeYearSavings ?? apiData.three_year_savings),
    fiveYearValue: parseNum(apiData.fiveYearValue ?? apiData.five_year_value),
    operationalSavings: parseNum(apiData.operationalSavings ?? apiData.operational_savings),
    qualitySavings: parseNum(apiData.qualitySavings ?? apiData.quality_savings),
    strategicValue: parseNum(apiData.strategicValue ?? apiData.strategic_value),
    hiddenCostReduction: parseNum(apiData.hiddenCostReduction ?? apiData.hidden_cost_reduction),
    implementationRisk: parseNum(apiData.implementationRisk ?? apiData.implementation_risk),
    dataQualityRisk: parseNum(apiData.dataQualityRisk ?? apiData.data_quality_risk),
    adoptionRisk: parseNum(apiData.adoptionRisk ?? apiData.adoption_risk),
    productivityGain: parseNum(apiData.productivityGain ?? apiData.productivity_gain),
    errorReduction: parseNum(apiData.errorReduction ?? apiData.error_reduction),
    timeToValue: parseNum(apiData.timeToValue ?? apiData.time_to_value),
  }
}

// ENTERPRISE FIX: Dual-Mode "Build vs Buy" ROI Engine
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateROIFallback(input: ROICalculationInput, dynamicPlans: any[]) {
  const { organizationProfile, operationsMetrics, infrastructureData, strategicFactors, selectedPlan } = input
  
  const industryData = industryMultipliers[organizationProfile.industry.toLowerCase()] || industryMultipliers.other
  
  // Search dynamically fetched plans first, then mock plans
  const plan = dynamicPlans.find((p) => p.name === selectedPlan || p.id === selectedPlan) || 
               allAISaasPlans.find((p) => p.name === selectedPlan || p.id === selectedPlan)
               
  // DUAL-MODE DETECTION: Is this a raw Pay-As-You-Go API model or a packaged SaaS Platform?
  const isAPIModel = plan && ('input_price_per_1k' in plan) && plan.input_price_per_1k !== null;

  // Raw API Models scale infinitely (-1), SaaS platforms have limits
  const monthlyTokens = isAPIModel ? -1 : (plan?.limits?.ai_tokens ?? plan?.ai_tokens_monthly ?? 100000);
  const maxTeamMembers = isAPIModel ? -1 : (plan?.limits?.team_members ?? plan?.team_members ?? 1);

  const coveredEmployees = maxTeamMembers === -1 ? organizationProfile.employees : Math.min(organizationProfile.employees, maxTeamMembers);
  const employeeCoverageRatio = coveredEmployees / organizationProfile.employees;
  
  let kronovaSubscription = 0;

  // ============================================================================
  // PART 1: Subscription vs API Consumption Cost Calculation
  // ============================================================================
  if (isAPIModel) {
    // API CONSUMPTION MATH (Powered by Rust Cron Job Data)
    const inputPrice = Number(plan.input_price_per_1k) || 0;
    const outputPrice = Number(plan.output_price_per_1k) || 0;
    const monthlyFlatRate = Number(plan.monthly_price) || 0; // i.e., $20/mo flat fees

    // Enterprise Token Assumption: ~500 meaningful interactions per employee/month
    // ~600 input tokens / 200 output tokens per interaction
    const inputTokensPerMo = 300000;
    const outputTokensPerMo = 100000;

    const apiCostPerMo = coveredEmployees * ((inputTokensPerMo / 1000) * inputPrice + (outputTokensPerMo / 1000) * outputPrice);
    const flatCostPerMo = monthlyFlatRate > 0 ? (monthlyFlatRate * coveredEmployees) : 0;

    kronovaSubscription = (apiCostPerMo + flatCostPerMo) * 12;
  } else {
    // STANDARD KRONOVA SAAS MATH
    kronovaSubscription = plan ? (plan.yearly ?? plan.yearly_price ?? plan.yearlyStandard ?? ((plan.monthly ?? plan.monthly_price ?? 0) * 12)) : 0;
  }

  const additionalSeatsNeeded = maxTeamMembers === -1 ? 0 : Math.max(0, organizationProfile.employees - maxTeamMembers);
  const additionalSeatCost = additionalSeatsNeeded > 0 ? additionalSeatsNeeded * (kronovaSubscription / Math.max(1, maxTeamMembers)) : 0;

  // ============================================================================
  // PART 2: Current System Costs
  // ============================================================================
  const hourlyRate = organizationProfile.avgSalary / 2080
  const manualLaborCost = (organizationProfile.employees * organizationProfile.avgSalary * (operationsMetrics.manualHours / 40)) / 52
  const errorCosts = (organizationProfile.avgSalary * organizationProfile.employees * (operationsMetrics.errorRate / 100)) / 12
  const downtimeCosts = (organizationProfile.avgSalary * organizationProfile.employees * (operationsMetrics.systemDowntime / 100)) / 12
  const dataQualityCosts = 100000 * (1 - infrastructureData.dataQuality / 100)
  const integrationPenalty = (infrastructureData.integrationComplexity / 100) * 50000 * industryData.complexity

  const currentAnnualCost = (manualLaborCost + errorCosts + downtimeCosts) * 12 +
    operationsMetrics.complianceCosts + 75000 + 25000 + dataQualityCosts + integrationPenalty

  // ============================================================================
  // PART 3: Readiness Factors & Base Token Utility
  // ============================================================================
  const aiReadinessFactor = (strategicFactors.aiMaturity + strategicFactors.changeReadiness + strategicFactors.executiveSupport) / 300
  const dataReadinessFactor = infrastructureData.dataQuality / 100
  const cloudReadinessFactor = infrastructureData.cloudReadiness / 100
  const organizationalReadiness = (aiReadinessFactor + dataReadinessFactor + cloudReadinessFactor) / 3

  // Base AI productivity (SIT Utility) applies to BOTH APIs and SaaS
  const tokenProductivityValue = calculateTokenValue(monthlyTokens, coveredEmployees, organizationProfile.avgSalary)
  const readinessMultiplier = 0.5 + (organizationalReadiness * 0.5)

  // ============================================================================
  // PART 4: Kronova Proprietary UI/UX Features (Zeroed out for Raw APIs)
  // ============================================================================
  const effectiveToolCount = isAPIModel ? 0 : KRONOVA_FEATURE_VALUES.proprietaryTools.count * organizationalReadiness;
  const toolsEfficiencyMultiplier = 1 + (effectiveToolCount * KRONOVA_FEATURE_VALUES.proprietaryTools.valuePerTool * 0.6);
  
  const getAdoptionScaling = (employees: number) => {
    if (employees <= 5) return 0.7 + (employees * 0.06)
    if (employees <= 25) return 0.85 + ((employees - 5) / 200)
    if (employees <= 100) return 0.75 + ((100 - employees) / 750)
    return 0.70 + (Math.min(employees, 500) - 100) / 8000
  }
  const adoptionScaling = getAdoptionScaling(coveredEmployees)
  
  const effectiveTokenValue = tokenProductivityValue * readinessMultiplier * industryData.aiAdoptionRate * adoptionScaling
  
  const voiceScaleFactor = Math.min(1, coveredEmployees / 10)
  
  // Advanced features are exclusive to orchestration platforms
  const voicePlatformValue = isAPIModel ? 0 : coveredEmployees * hourlyRate * 2080 * KRONOVA_FEATURE_VALUES.voicePlatform.adoptionRate * KRONOVA_FEATURE_VALUES.voicePlatform.productivityBoost * organizationalReadiness * voiceScaleFactor
  const companyScaleFactor = Math.min(1, coveredEmployees / 25)
  const assetTokenizationValue = isAPIModel ? 0 : (KRONOVA_FEATURE_VALUES.assetTokenization.relevantIndustries.includes(organizationProfile.industry.toLowerCase())
    ? currentAnnualCost * KRONOVA_FEATURE_VALUES.assetTokenization.valueMultiplier * organizationalReadiness * employeeCoverageRatio * companyScaleFactor * 0.5
    : 0)
  const stablecoinValue = isAPIModel ? 0 : (KRONOVA_FEATURE_VALUES.stablecoinIntegration.relevantIndustries.includes(organizationProfile.industry.toLowerCase())
    ? operationsMetrics.complianceCosts * KRONOVA_FEATURE_VALUES.stablecoinIntegration.costReduction * organizationalReadiness * employeeCoverageRatio * companyScaleFactor * 0.5
    : 0)

  // ============================================================================
  // PART 5: Traditional Operational Savings
  // ============================================================================
  const baseEfficiencyGain = (0.2 + aiReadinessFactor * 0.4) * toolsEfficiencyMultiplier
  const operationalSavings = manualLaborCost * 12 * baseEfficiencyGain * industryData.savings * employeeCoverageRatio * adoptionScaling

  const errorReductionRate = 0.4 + dataReadinessFactor * 0.35
  const qualitySavings = errorCosts * 12 * errorReductionRate * toolsEfficiencyMultiplier * employeeCoverageRatio * adoptionScaling

  const strategicMultiplier = strategicFactors.competitivePressure / 100
  const strategicValue = (organizationProfile.avgSalary * coveredEmployees * 0.03 * strategicMultiplier * organizationalReadiness * companyScaleFactor) +
    voicePlatformValue + assetTokenizationValue + stablecoinValue

  const baseCosts = { dataPrep: 5000, training: 2000, maintenance: 3000 }
  const scaleFactor = 1 + Math.log10(organizationProfile.employees) * 1.2
  const scaledDataPrep = baseCosts.dataPrep * scaleFactor
  const scaledTraining = baseCosts.training * scaleFactor
  const scaledMaintenance = baseCosts.maintenance * scaleFactor
  
  const cappedToolsMultiplier = Math.min(toolsEfficiencyMultiplier, 1.3)
  const hiddenCostReduction = (scaledDataPrep * 0.4 + scaledTraining * 0.3 + scaledMaintenance * 0.2) * cappedToolsMultiplier * employeeCoverageRatio * organizationalReadiness

  // ============================================================================
  // PART 6: Implementation Costs ("Build vs Buy" Differential)
  // ============================================================================
  let implementationCosts = 0;
  let ongoingOperationalCosts = 0;
  
  if (isAPIModel) {
    // RAW API APPROACH: Cheap token cost, but massive custom software engineering costs.
    // Minimum $45k custom UI build + scaling integration complexity
    implementationCosts = 45000 + (kronovaSubscription * 1.5);
    ongoingOperationalCosts = 12000 + (kronovaSubscription * 0.25); // High maintenance for custom code
  } else {
    // SAAS ORCHESTRATION APPROACH: Ready out of the box
    const implementationMultiplier = kronovaSubscription >= 9990 ? 0.3 : kronovaSubscription >= 2990 ? 0.4 : 0.5
    implementationCosts = kronovaSubscription * implementationMultiplier
    ongoingOperationalCosts = kronovaSubscription * 0.15
  }

  const totalSavings = operationalSavings + qualitySavings + strategicValue + hiddenCostReduction + effectiveTokenValue
  const kronovaAnnualCost = kronovaSubscription + ongoingOperationalCosts + additionalSeatCost
  const annualSavings = totalSavings - kronovaAnnualCost

  const totalInvestment = kronovaSubscription + implementationCosts
  const roi = kronovaAnnualCost > 0 ? (annualSavings / kronovaAnnualCost) * 100 : 0
  const paybackMonths = annualSavings > 0 ? Math.max(0.1, totalInvestment / (annualSavings / 12)) : 0
  
  const threeYearSavings = annualSavings + (annualSavings * 1.05) + (annualSavings * 1.1) - implementationCosts
  const fiveYearValue = annualSavings * (1 + 1.05 + 1.1 + 1.15 + 1.2) - implementationCosts

  // ============================================================================
  // PART 7: Risk Assessment
  // ============================================================================
  let implementationRisk = ((100 - strategicFactors.aiMaturity) * industryData.risk) / 100
  if (isAPIModel) {
    // Building custom software on raw APIs has a significantly higher failure rate
    implementationRisk = Math.min(95, implementationRisk * 1.4); 
  }
  
  const dataQualityRisk = ((100 - infrastructureData.dataQuality) / 100) * 50
  const adoptionRisk = ((100 - strategicFactors.changeReadiness) / 100) * 30

  const productivityGain = Math.min(95, baseEfficiencyGain * 100)
  const errorReduction = Math.min(95, errorReductionRate * 100)
  const timeToValue = Math.max(2, 10 - aiReadinessFactor * 6 - (kronovaSubscription >= 9990 ? 2 : 0))

  return {
    current_annual_cost: currentAnnualCost,
    resendit_annual_cost: kronovaAnnualCost,
    annual_savings: annualSavings,
    roi,
    payback_months: paybackMonths,
    three_year_savings: threeYearSavings,
    five_year_value: fiveYearValue,
    operational_savings: operationalSavings,
    quality_savings: qualitySavings,
    strategic_value: strategicValue,
    hidden_cost_reduction: hiddenCostReduction,
    implementation_risk: implementationRisk,
    data_quality_risk: dataQualityRisk,
    adoption_risk: adoptionRisk,
    productivity_gain: productivityGain,
    error_reduction: errorReduction,
    time_to_value: timeToValue,
  }
}

export async function calculateROI(input: ROICalculationInput) {
  try {
    const validated = ROICalculationInputSchema.parse(input)

    if (!USE_FALLBACK) {
      try {
        console.log(`[API DEBUG] Attempting to connect to Rust API at: ${RUST_API_URL}/rspc/calculateROI`);
        
        const response = await fetch(`${RUST_API_URL}/rspc/calculateROI`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // ENTERPRISE FIX: Send both camelCase and snake_case to guarantee Rust
            // deserializes perfectly regardless of which macro it has applied!
            organizationProfile: validated.organizationProfile,
            operationsMetrics: validated.operationsMetrics,
            infrastructureData: validated.infrastructureData,
            strategicFactors: validated.strategicFactors,
            selectedPlan: validated.selectedPlan,
            
            organization_profile: validated.organizationProfile,
            operations_metrics: validated.operationsMetrics,
            infrastructure_data: validated.infrastructureData,
            strategic_factors: validated.strategicFactors,
            selected_plan: validated.selectedPlan,
          }),
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          console.log(`[API DEBUG] Rust API calculated successfully!`);
          const json = await response.json()
          console.log("RUST RAW RESPONSE:", JSON.stringify(json, null, 2));

          // ENTERPRISE FIX: Catch JSON-RPC internal backend errors
          if (json?.result?.type === "error") {
            console.error("Rust Backend Error:", json.result.data.message);
            throw new Error(`Backend Calculation Failed: ${json.result.data.message}`);
          }
          
          // 1. Target the exact nested results object from the successful Rust response
          const finalResults = json?.result?.data?.results;

          if (!finalResults) {
            throw new Error("Invalid response structure from Rust backend: Missing 'results' object.");
          }

          // 2. Map the snake_case Rust output directly to the camelCase Next.js UI state
          const mappedData = {
            annualSavings: finalResults.annual_savings,
            roiPercentage: finalResults.roi,
            paybackMonths: finalResults.payback_months,
            estimatedAnnualCost: finalResults.kronova_annual_cost, 
            currentAnnualCost: finalResults.current_annual_cost,
            threeYearSavings: finalResults.three_year_savings,
            fiveYearValue: finalResults.five_year_value,
            operationalSavings: finalResults.operational_savings,
            qualitySavings: finalResults.quality_savings,
            productivityGain: finalResults.productivity_gain,
            timeToValue: finalResults.time_to_value,
            rawRustData: finalResults 
          };

          // Return the explicitly mapped data, bypassing the old universalResultsMapper
          return { success: true, data: mappedData, source: "rust-api" }
          
        } else {
          const errorText = await response.text();
          console.error(`[API DEBUG] Rust API responded with status ${response.status}:`, errorText);
        }
      } catch (error) {
        console.error(`[API DEBUG] Rust API fetch failed entirely. Make sure the server is running on ${RUST_API_URL}`, error);
      }
    } else {
        console.log(`[API DEBUG] Skipping Rust API because USE_FALLBACK is true.`);
    }

    console.log("[v0] Falling back to offline JS calculation...");
    const plansResponse = await getSubscriptionPlans();
    const dynamicPlans = plansResponse.success && Array.isArray(plansResponse.data) ? plansResponse.data : [];
    
    // We leave the fallback utilizing the universalResultsMapper since the JS fallback outputs differently than Rust
    const rawData = calculateROIFallback(validated, dynamicPlans);
    const mappedData = universalResultsMapper(rawData);
    
    return { success: true, data: mappedData, source: "fallback" }
  } catch (error) {
    console.error("ROI calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

export async function getSubscriptionPlans() {
  try {
    if (!USE_FALLBACK) {
      try {
        console.log(`[API DEBUG] Attempting to fetch plans from: ${RUST_API_URL}/rspc/subscriptionPlans`);
        const response = await fetch(`${RUST_API_URL}/rspc/subscriptionPlans`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          const json = await response.json()
          
          let rawData = json;
          if (Array.isArray(json)) {
            rawData = json[0]?.result?.data ?? json[0]?.data ?? json[0];
          } else {
            rawData = json?.result?.data ?? json?.data ?? json?.result ?? json;
          }

          const plansData = Array.isArray(rawData) ? rawData : [];
          
          if (plansData.length > 0) {
            const filteredPlans = filterDisplayablePlans(plansData)
            return { success: true, data: filteredPlans, source: "rust-api" }
          } else {
             console.error(`[API DEBUG] Plans data was empty or invalid. Falling back.`);
          }
        } else {
          const errorText = await response.text();
          console.error(`[API DEBUG] Fetch Plans failed with status ${response.status}:`, errorText);
        }
      } catch (error) {
        console.error(`[API DEBUG] Fetch Plans fetch failed entirely:`, error);
      }
    }

    console.log("[v0] Rust unavailable. Fetching dynamic AI models directly from Supabase...");
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      });

      const { data: dbPlans, error } = await supabase
        .from("roi_calc_plan_models")
        .select("*")
        .order("monthly_price", { ascending: true, nullsFirst: false });

      if (!error && dbPlans && dbPlans.length > 0) {
        const mappedPlans = dbPlans.map((plan: any) => ({
          ...plan,
          limits: {
             ai_tokens: plan.ai_tokens_monthly ?? plan.ai_tokens ?? 100000,
             team_members: plan.team_members ?? plan.max_users ?? 1,
             managed_assets: plan.managed_assets ?? 0,
          }
        }));
        return { success: true, data: filterDisplayablePlans(mappedPlans), source: "supabase" };
      }
    } catch (sbError) {
      console.error("[API DEBUG] Supabase direct plan fetch failed:", sbError);
    }

    return { success: true, data: allAISaasPlans, source: "mock" }
  } catch (error) {
    console.error("Failed to fetch subscription plans:", error)
    return { success: true, data: allAISaasPlans, source: "mock" }
  }
}

export async function getKronovaPlans() {
  const result = await getSubscriptionPlans()
  if (result.success && result.data) {
    return {
      success: true,
      data: filterKronovaPlans(result.data),
      source: result.source,
    }
  }
  return result
}

export async function getIndustryBenchmark(industry: string) {
  try {
    if (!USE_FALLBACK) {
      try {
        console.log(`[API DEBUG] Fetching benchmark from: ${RUST_API_URL}/rspc/industryBenchmark?industry=${encodeURIComponent(industry)}`);
        const response = await fetch(
          `${RUST_API_URL}/rspc/industryBenchmark?industry=${encodeURIComponent(industry)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            next: { revalidate: 86400 },
            signal: AbortSignal.timeout(5000),
          },
        )

        if (response.ok) {
          const json = await response.json()
          
          let benchmarkData = json;
          if (Array.isArray(json)) {
              benchmarkData = json[0]?.result?.data ?? json[0]?.data ?? json[0];
          } else {
              benchmarkData = json?.result?.data ?? json?.data ?? json?.result ?? json;
          }

          return { success: true, data: benchmarkData, source: "rust-api" }
        } else {
          const errorText = await response.text();
          console.error(`[API DEBUG] Fetch Benchmark failed with status ${response.status}:`, errorText);
        }
      } catch (error) {
         console.error(`[API DEBUG] Fetch Benchmark failed entirely:`, error);
      }
    }

    const benchmark = getMockIndustryBenchmark(industry)
    return { success: true, data: benchmark, source: "mock" }
  } catch (error) {
    console.error("Failed to fetch industry benchmark:", error)
    const benchmark = getMockIndustryBenchmark("default")
    return { success: true, data: benchmark, source: "mock" }
  }
}

export async function saveCalculationToSupabase(calculation: any, userId?: string) {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const orgProfile = calculation.organizationProfile || calculation.organization_profile || calculation;
    const opsMetrics = calculation.operationsMetrics || calculation.operations_metrics || calculation;
    const infraData = calculation.infrastructureData || calculation.infrastructure_data || calculation;
    const stratFactors = calculation.strategicFactors || calculation.strategic_factors || calculation;
    const results = calculation.results || {};

    const { data, error } = await supabase
      .from("roi_calculations")
      .insert({
        user_id: userId || null,
        
        employees: orgProfile.employees,
        avg_salary: orgProfile.avgSalary ?? orgProfile.avg_salary,
        industry: orgProfile.industry,
        company_size: orgProfile.companySize ?? orgProfile.company_size,

        manual_hours: opsMetrics.manualHours ?? opsMetrics.manual_hours,
        error_rate: opsMetrics.errorRate ?? opsMetrics.error_rate,
        system_downtime: opsMetrics.systemDowntime ?? opsMetrics.system_downtime,
        compliance_costs: opsMetrics.complianceCosts ?? opsMetrics.compliance_costs,

        data_quality: infraData.dataQuality ?? infraData.data_quality,
        integration_complexity: infraData.integrationComplexity ?? infraData.integration_complexity,
        legacy_system_age: infraData.legacySystemAge ?? infraData.legacy_system_age,
        cloud_readiness: infraData.cloudReadiness ?? infraData.cloud_readiness,

        ai_maturity: stratFactors.aiMaturity ?? stratFactors.ai_maturity,
        change_readiness: stratFactors.changeReadiness ?? stratFactors.change_readiness,
        executive_support: stratFactors.executiveSupport ?? stratFactors.executive_support,
        competitive_pressure: stratFactors.competitivePressure ?? stratFactors.competitive_pressure,
        
        selected_plan: calculation.selectedPlan ?? calculation.selected_plan,

        current_annual_cost: results.currentAnnualCost ?? results.current_annual_cost,
        kronova_annual_cost: results.kronovaAnnualCost ?? results.resendit_annual_cost ?? results.kronova_annual_cost,
        annual_savings: results.annualSavings ?? results.annual_savings,
        roi: results.roi,
        payback_months: results.paybackMonths ?? results.payback_months,
        three_year_savings: results.threeYearSavings ?? results.three_year_savings,
        five_year_value: results.fiveYearValue ?? results.five_year_value,
        operational_savings: results.operationalSavings ?? results.operational_savings,
        quality_savings: results.qualitySavings ?? results.quality_savings,
        strategic_value: results.strategicValue ?? results.strategic_value,
        hidden_cost_reduction: results.hiddenCostReduction ?? results.hidden_cost_reduction,
        implementation_risk: results.implementationRisk ?? results.implementation_risk,
        data_quality_risk: results.dataQualityRisk ?? results.data_quality_risk,
        adoption_risk: results.adoptionRisk ?? results.adoption_risk,
        productivity_gain: results.productivityGain ?? results.productivity_gain,
        error_reduction: results.errorReduction ?? results.error_reduction,
        time_to_value: results.timeToValue ?? results.time_to_value,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Failed to save calculation:", error)
    return {
      success: false,
      error: "Failed to save calculation",
    }
  }
}

export async function getUserCalculations(userId: string) {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const { data, error } = await supabase
      .from("roi_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedCalculations = data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
      organizationProfile: {
        employees: row.employees,
        avgSalary: row.avg_salary,
        industry: row.industry,
        companySize: row.company_size,
      },
      operationsMetrics: {
        manualHours: row.manual_hours,
        errorRate: row.error_rate,
        systemDowntime: row.system_downtime,
        complianceCosts: row.compliance_costs,
      },
      infrastructureData: {
        dataQuality: row.data_quality,
        integrationComplexity: row.integration_complexity,
        legacySystemAge: row.legacy_system_age,
        cloudReadiness: row.cloud_readiness,
      },
      strategicFactors: {
        aiMaturity: row.ai_maturity,
        changeReadiness: row.change_readiness,
        executiveSupport: row.executive_support,
        competitivePressure: row.competitive_pressure,
      },
      selectedPlan: row.selected_plan,
      results: {
        currentAnnualCost: row.current_annual_cost,
        kronovaAnnualCost: row.kronova_annual_cost,
        annualSavings: row.annual_savings,
        roi: row.roi,
        paybackMonths: row.payback_months,
        threeYearSavings: row.three_year_savings,
        fiveYearValue: row.five_year_value,
        operationalSavings: row.operational_savings,
        qualitySavings: row.quality_savings,
        strategicValue: row.strategic_value,
        hiddenCostReduction: row.hidden_cost_reduction,
        implementationRisk: row.implementation_risk,
        dataQualityRisk: row.data_quality_risk,
        adoptionRisk: row.adoption_risk,
        productivityGain: row.productivity_gain,
        errorReduction: row.error_reduction,
        timeToValue: row.time_to_value,
      }
    }))

    return { success: true, data: mappedCalculations }
  } catch (error) {
    console.error("Failed to fetch calculations:", error)
    return {
      success: false,
      error: "Failed to load calculations",
    }
  }
}

const smallCompanyRealityFactor = 1;