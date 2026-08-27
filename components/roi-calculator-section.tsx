"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  TrendingUp,
  Clock,
  Shield,
  Target,
  BarChart3,
  AlertTriangle,
  Building2,
  Loader2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROIAssessmentDialog } from "@/components/roi-assessment-dialog"
import { AiPlatformComparison } from "@/components/ai-platform-comparison"
import { useROICalculator } from "@/hooks/use-roi-calculator"

interface ComprehensiveROIInputs {
  // Organization Profile
  employees: number
  avgSalary: number
  industry: string
  companySize: string

  // Current Operations
  manualHours: number
  errorRate: number
  systemDowntime: number
  complianceCosts: number

  // Data & Infrastructure
  dataQuality: number
  integrationComplexity: number
  legacySystemAge: number
  cloudReadiness: number

  // Strategic Factors
  aiMaturity: number
  changeReadiness: number
  executiveSupport: number
  competitivePressure: number

  // Hidden Costs
  dataPreparationCosts: number
  trainingCosts: number
  maintenanceCosts: number
  securityCosts: number
}

interface ComprehensiveROIResults {
  currentAnnualCost: number
  kronovaAnnualCost: number
  annualSavings: number
  roi: number
  paybackMonths: number
  threeYearSavings: number
  fiveYearValue: number

  // Detailed savings breakdown
  operationalSavings: number
  qualitySavings: number
  strategicValue: number
  hiddenCostReduction: number

  // Risk factors
  implementationRisk: number
  dataQualityRisk: number
  adoptionRisk: number

  // Performance metrics
  productivityGain: number
  errorReduction: number
  timeToValue: number
}

// Industry benchmarks based on McKinsey, Deloitte, and SAP 2025-2026 research
// AI productivity gains: 40-60 min/day saved per employee
// Enterprise AI ROI: median 10-31%, high performers achieve 10-25x
const industryMultipliers = {
  manufacturing: { complexity: 1.3, savings: 1.4, risk: 1.2, aiAdoptionRate: 0.72 },
  retail: { complexity: 1.0, savings: 1.2, risk: 0.9, aiAdoptionRate: 0.68 },
  healthcare: { complexity: 1.5, savings: 1.6, risk: 1.4, aiAdoptionRate: 0.65 },
  finance: { complexity: 1.4, savings: 1.5, risk: 1.3, aiAdoptionRate: 0.78 },
  logistics: { complexity: 1.2, savings: 1.7, risk: 1.1, aiAdoptionRate: 0.70 },
  technology: { complexity: 0.8, savings: 1.1, risk: 0.7, aiAdoptionRate: 0.85 },
  other: { complexity: 1.0, savings: 1.0, risk: 1.0, aiAdoptionRate: 0.60 },
}

// Token value calculation based on enterprise productivity research
// Average employee saves 50 min/day with AI = ~217 hours/year
// At avg salary of $75k, hourly rate = $36, savings = $7,812/year per AI-enabled employee
// Estimated 1M tokens = 500 meaningful AI interactions = supports ~2 employees intensively
const calculateTokenValue = (monthlyTokens: number, employees: number, avgSalary: number) => {
  const hourlyRate = avgSalary / 2080 // 52 weeks * 40 hours
  const hoursPerYear = 217 // 50 min/day * 260 working days / 60
  const baseProductivityValue = hourlyRate * hoursPerYear
  
  // Token utilization efficiency: how well tokens translate to productivity
  // 1M tokens/month supports intensive use for ~2-3 employees
  // CRITICAL: Only covered employees benefit from AI tokens
  const tokensPerEmployeePerMonth = 400000 // optimal token allocation per employee
  const coverageRatio = Math.min(1, (monthlyTokens / (employees * tokensPerEmployeePerMonth)))
  
  // Enterprise unlimited tokens (-1) get full coverage
  const effectiveCoverage = monthlyTokens === -1 ? 1 : coverageRatio
  
  // Multiply by 1.8x to account for AI automation value beyond direct time savings
  // (quality improvements, decision support, innovation acceleration)
  // More conservative multiplier to prevent unrealistic projections
  return baseProductivityValue * employees * effectiveCoverage * 1.8
}

// Kronova proprietary feature value multipliers
// Based on comprehensive platform capabilities vs standalone AI tools
const KRONOVA_FEATURE_VALUES = {
  // 18 Proprietary AI Tools - each tool adds incremental value
  proprietaryTools: {
    count: 18,
    valuePerTool: 0.04, // 4% efficiency gain per specialized tool
    maxMultiplier: 1.72, // 18 * 0.04 = 72% max improvement
  },
  // Voice Platform - enables hands-free operations, accessibility
  voicePlatform: {
    adoptionRate: 0.35, // 35% of users leverage voice
    productivityBoost: 0.15, // 15% additional productivity for voice users
  },
  // Asset Tokenization - operational asset management efficiency
  relevantIndustries: ["finance", "manufacturing", "logistics", "retail"],
  assetTokenization: {
    relevantIndustries: ["finance", "manufacturing", "logistics", "retail"],
    valueMultiplier: 0.12, // 12% operational efficiency in asset management
  },
  // Stablecoin/Payment Integration - reduced transaction friction
  stablecoinIntegration: {
    relevantIndustries: ["finance", "retail", "technology"],
    costReduction: 0.08, // 8% reduction in payment/settlement costs
  },
}

const subscriptionPlans = [
  {
    name: "Lite",
    monthly: 9,
    yearly: 108,
    monthlyStandard: 19,
    yearlyStandard: 228,
    features: ["100,000 AI tokens/month", "100 managed assets", "1 team member", "Basic support"],
    limits: { ai_tokens: 100000, managed_assets: 100, storage: 1, team_members: 1, api_calls: 1000 },
    isIntroductory: true,
  },
  {
    name: "Starter",
    monthly: 99,
    yearly: 990,
    features: ["1,000,000 AI tokens/month", "1,000 managed assets", "5 team members", "Basic analytics"],
    limits: { ai_tokens: 1000000, managed_assets: 1000, storage: 5, team_members: 5, api_calls: 10000 },
  },
  {
    name: "Professional",
    monthly: 299,
    yearly: 2990,
    features: [
      "10,000,000 AI tokens/month",
      "10,000 managed assets",
      "25 team members",
      "Advanced analytics",
      "API access",
    ],
    limits: { ai_tokens: 10000000, managed_assets: 10000, storage: 50, team_members: 25, api_calls: 100000 },
  },
  {
    name: "Enterprise",
    monthly: 999,
    yearly: 9990,
    features: [
      "Unlimited AI tokens",
      "Unlimited managed assets",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated support",
    ],
    limits: { ai_tokens: -1, managed_assets: -1, storage: 500, team_members: -1, api_calls: -1 },
  },
]

// Helper function to calculate realistic hidden costs based on company size
const calculateHiddenCosts = (employees: number) => {
  // Base costs for a 1-person company, then scale logarithmically
  // Small companies have lower per-employee costs but higher proportional costs
  const baseCosts = {
    dataPrep: 5000,      // Base $5k for data preparation
    training: 2000,      // Base $2k for training
    maintenance: 3000,   // Base $3k for maintenance
    security: 1500,      // Base $1.5k for security
  }
  
  // Logarithmic scaling: costs grow slower than linear with employee count
  // At 1 employee: 1x base, at 10: ~2.3x base, at 50: ~3.9x base, at 100: ~4.6x base
  const scaleFactor = 1 + Math.log10(employees) * 1.2
  
  return {
    dataPreparationCosts: Math.round(baseCosts.dataPrep * scaleFactor),
    trainingCosts: Math.round(baseCosts.training * scaleFactor),
    maintenanceCosts: Math.round(baseCosts.maintenance * scaleFactor),
    securityCosts: Math.round(baseCosts.security * scaleFactor),
  }
}

export function ROICalculatorSection() {
  // Separate state for raw input strings to allow free editing
  const [rawInputs, setRawInputs] = useState({
    employees: "50",
    avgSalary: "75000",
    complianceCosts: "50000",
  })

  const initialEmployeeCount = 50
  const initialHiddenCosts = calculateHiddenCosts(initialEmployeeCount)

  const [inputs, setInputs] = useState<ComprehensiveROIInputs>({
    // Organization Profile
    employees: initialEmployeeCount,
    avgSalary: 75000,
    industry: "manufacturing",
    companySize: "medium",

    // Current Operations
    manualHours: 20,
    errorRate: 5,
    systemDowntime: 2,
    complianceCosts: 50000,

    // Data & Infrastructure
    dataQuality: 60,
    integrationComplexity: 70,
    legacySystemAge: 5,
    cloudReadiness: 40,

    // Strategic Factors
    aiMaturity: 30,
    changeReadiness: 60,
    executiveSupport: 70,
    competitivePressure: 80,

    // Hidden Costs - dynamically scaled based on employee count
    ...initialHiddenCosts,
  })

  const [selectedPlan, setSelectedPlan] = useState(0)
  
  // Update hidden costs whenever employee count changes
  useEffect(() => {
    const updatedHiddenCosts = calculateHiddenCosts(inputs.employees)
    setInputs(prev => ({
      ...prev,
      ...updatedHiddenCosts,
    }))
  }, [inputs.employees])
  
  const [results, setResults] = useState<ComprehensiveROIResults>({
    currentAnnualCost: 0,
    kronovaAnnualCost: 0,
    annualSavings: 0,
    roi: 0,
    paybackMonths: 0,
    threeYearSavings: 0,
    fiveYearValue: 0,
    operationalSavings: 0,
    qualitySavings: 0,
    strategicValue: 0,
    hiddenCostReduction: 0,
    implementationRisk: 0,
    dataQualityRisk: 0,
    adoptionRisk: 0,
    productivityGain: 0,
    errorReduction: 0,
    timeToValue: 0,
  })
  const [activeTab, setActiveTab] = useState("organization")
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false)
  const [savedReference, setSavedReference] = useState<string | null>(null)

  const { calculate, isCalculating, error: apiError } = useROICalculator()

  const activePlans = subscriptionPlans

  const calculateComprehensiveROI = async () => {
    try {
      const payload = {
        organizationProfile: {
          employees: inputs.employees,
          avgSalary: inputs.avgSalary,
          industry: inputs.industry,
          companySize: inputs.companySize,
        },
        operationsMetrics: {
          manualHours: inputs.manualHours,
          errorRate: inputs.errorRate,
          systemDowntime: inputs.systemDowntime,
          complianceCosts: inputs.complianceCosts,
        },
        infrastructureData: {
          dataQuality: inputs.dataQuality,
          integrationComplexity: inputs.integrationComplexity,
          legacySystemAge: inputs.legacySystemAge,
          cloudReadiness: inputs.cloudReadiness,
        },
        strategicFactors: {
          aiMaturity: inputs.aiMaturity,
          changeReadiness: inputs.changeReadiness,
          executiveSupport: inputs.executiveSupport,
          competitivePressure: inputs.competitivePressure,
        },
        selectedPlan: activePlans[selectedPlan]?.name || "Unknown",
      }

      const result = await calculate(payload)

      if (result.success && result.data) {
        const apiData = result.data
        // Values are returned cleanly mapped from our API universal mapper
        setResults({
          currentAnnualCost: apiData.currentAnnualCost || 0,
          kronovaAnnualCost: apiData.kronovaAnnualCost || apiData.resenditAnnualCost || 0,
          annualSavings: apiData.annualSavings || 0,
          roi: apiData.roi || 0,
          paybackMonths: apiData.paybackMonths || 0,
          threeYearSavings: apiData.threeYearSavings || 0,
          fiveYearValue: apiData.fiveYearValue || 0,
          operationalSavings: apiData.operationalSavings || 0,
          qualitySavings: apiData.qualitySavings || 0,
          strategicValue: apiData.strategicValue || 0,
          hiddenCostReduction: apiData.hiddenCostReduction || 0,
          implementationRisk: apiData.implementationRisk || 0,
          dataQualityRisk: apiData.dataQualityRisk || 0,
          adoptionRisk: apiData.adoptionRisk || 0,
          productivityGain: apiData.productivityGain || 0,
          errorReduction: apiData.errorReduction || 0,
          timeToValue: apiData.timeToValue || 0,
        })
      } else if (result.error) {
        calculateClientSideROI()
      }
    } catch (err) {
      calculateClientSideROI()
    }
  }

  const calculateClientSideROI = () => {
    const industryData = industryMultipliers[inputs.industry as keyof typeof industryMultipliers] || industryMultipliers.other
    const selectedPlanData = activePlans[selectedPlan]
    
    // Get plan limits for token-based calculations
    const planLimits = selectedPlanData?.limits || { ai_tokens: 100000, managed_assets: 100, team_members: 1 }
    const monthlyTokens = planLimits.ai_tokens || 100000
    const maxTeamMembers = planLimits.team_members || 1
    const kronovaSubscription = selectedPlanData?.yearly || selectedPlanData?.yearlyStandard || 108
    
    // ============================================================================
    // CRITICAL: User Coverage Calculation
    // ============================================================================
    // Only employees covered by the plan's team_members limit can use AI
    // Enterprise plan (-1) = unlimited, covers all employees
    const coveredEmployees = maxTeamMembers === -1 ? inputs.employees : Math.min(inputs.employees, maxTeamMembers)
    const employeeCoverageRatio = coveredEmployees / inputs.employees
    
    // If plan doesn't cover all employees, need to account for cost to cover everyone
    const additionalSeatsNeeded = maxTeamMembers === -1 ? 0 : Math.max(0, inputs.employees - maxTeamMembers)
    const additionalSeatCost = additionalSeatsNeeded > 0 ? additionalSeatsNeeded * (kronovaSubscription / Math.max(1, maxTeamMembers)) : 0

    // ============================================================================
    // PART 1: Current System Costs (What they're spending now)
    // ============================================================================
    const hourlyRate = inputs.avgSalary / 2080
    const manualLaborCost = (inputs.employees * inputs.avgSalary * (inputs.manualHours / 40)) / 52
    const errorCosts = (inputs.avgSalary * inputs.employees * (inputs.errorRate / 100)) / 12
    const downtimeCosts = (inputs.avgSalary * inputs.employees * (inputs.systemDowntime / 100)) / 12
    const dataQualityCosts = inputs.dataPreparationCosts * (1 - inputs.dataQuality / 100)
    const integrationPenalty = (inputs.integrationComplexity / 100) * 50000 * industryData.complexity

    const currentAnnualCost =
      (manualLaborCost + errorCosts + downtimeCosts) * 12 +
      inputs.complianceCosts +
      inputs.maintenanceCosts +
      inputs.securityCosts +
      dataQualityCosts +
      integrationPenalty

    // ============================================================================
    // PART 2: AI Readiness & Data Quality Factors
    // ============================================================================
    const aiReadinessFactor = (inputs.aiMaturity + inputs.changeReadiness + inputs.executiveSupport) / 300
    const dataReadinessFactor = inputs.dataQuality / 100
    const cloudReadinessFactor = inputs.cloudReadiness / 100
    const organizationalReadiness = (aiReadinessFactor + dataReadinessFactor + cloudReadinessFactor) / 3

    // ============================================================================
    // PART 3: Token-Based Productivity Value (KEY DIFFERENTIATOR BY PLAN)
    // ============================================================================
    // Based on research: employees save 40-60 min/day with AI = 217 hours/year
    // 1M tokens/month supports intensive use for 2-3 employees
    // CRITICAL: Only covered employees benefit from AI tokens
    const tokenProductivityValue = calculateTokenValue(monthlyTokens, coveredEmployees, inputs.avgSalary)
    
    // ============================================================================
    // PART 4: Kronova Proprietary Feature Values
    // ============================================================================
    // 18 Proprietary Tools - compound efficiency gains
    // Apply diminishing returns: not all tools benefit all organizations equally
    const effectiveToolCount = KRONOVA_FEATURE_VALUES.proprietaryTools.count * organizationalReadiness
    const toolsEfficiencyMultiplier = 1 + (effectiveToolCount * KRONOVA_FEATURE_VALUES.proprietaryTools.valuePerTool * 0.6) // 60% effectiveness factor
    
    // Calculate adoption scaling before using it
    // Apply adoption scaling based on company size - larger companies face organizational friction
    // 1-5 employees: 76-100%, 6-25: 85-95%, 26-100: 75-85%, 101+: 70-75%
    const getAdoptionScaling = (employees: number) => {
      if (employees <= 5) return 0.7 + (employees * 0.06) // 76-100%
      if (employees <= 25) return 0.85 + ((employees - 5) / 200) // 85-95%
      if (employees <= 100) return 0.75 + ((100 - employees) / 750) // 75-85% (decreasing)
      return 0.70 + (Math.min(employees, 500) - 100) / 8000 // 70-75%
    }
    const adoptionScaling = getAdoptionScaling(coveredEmployees)
    
    // Scale token value by readiness (organizations need readiness to capture value)
    // Use a gentler scaling factor (50% minimum) to ensure base value shows through
    const readinessMultiplier = 0.5 + (organizationalReadiness * 0.5)
    const effectiveTokenValue = tokenProductivityValue * readinessMultiplier * industryData.aiAdoptionRate * adoptionScaling
    
    // Voice Platform value (35% adoption, 15% productivity boost)
    // CRITICAL: Only covered employees can use voice platform
    // Scale down for small teams (less benefit at small scale)
    const voiceScaleFactor = Math.min(1, coveredEmployees / 10) // Full value at 10+ employees
    const voicePlatformValue = coveredEmployees * hourlyRate * 2080 * KRONOVA_FEATURE_VALUES.voicePlatform.adoptionRate * KRONOVA_FEATURE_VALUES.voicePlatform.productivityBoost *
      organizationalReadiness * voiceScaleFactor
    
    // Asset Tokenization value (relevant industries only)
    // These are speculative/strategic benefits that scale with company maturity and size
    // Small companies get minimal benefit; larger companies with high maturity get more
    const companyScaleFactor = Math.min(1, coveredEmployees / 25) // Full value at 25+ employees
    const assetTokenizationValue = KRONOVA_FEATURE_VALUES.assetTokenization.relevantIndustries.includes(inputs.industry)
      ? currentAnnualCost * KRONOVA_FEATURE_VALUES.assetTokenization.valueMultiplier * organizationalReadiness * employeeCoverageRatio * companyScaleFactor * 0.5
      : 0
    
    // Stablecoin/Payment Integration value
    // Also speculative - only mature companies in relevant industries realize this value
    const stablecoinValue = KRONOVA_FEATURE_VALUES.stablecoinIntegration.relevantIndustries.includes(inputs.industry)
      ? inputs.complianceCosts * KRONOVA_FEATURE_VALUES.stablecoinIntegration.costReduction * organizationalReadiness * employeeCoverageRatio * companyScaleFactor * 0.5
      : 0

    // ============================================================================
    // PART 5: Traditional Operational Savings (Enhanced by Tools Multiplier)
    // ============================================================================
    // Base efficiency: 20-60% based on readiness, amplified by Kronova tools (more realistic)
    // CRITICAL: Savings scale with employee coverage ratio and adoption scaling
    const baseEfficiencyGain = (0.2 + aiReadinessFactor * 0.4) * toolsEfficiencyMultiplier
    const operationalSavings = manualLaborCost * 12 * baseEfficiencyGain * industryData.savings * employeeCoverageRatio * adoptionScaling

    // Quality improvements: 40-75% error reduction (more realistic)
    const errorReductionRate = 0.4 + dataReadinessFactor * 0.35
    const qualitySavings = errorCosts * 12 * errorReductionRate * toolsEfficiencyMultiplier * employeeCoverageRatio * adoptionScaling

    // Strategic value: competitive advantage, market positioning
    // This is long-term/speculative value, not immediate operational savings
    // Reduce multiplier significantly and scale with company size
    const strategicMultiplier = inputs.competitivePressure / 100
    const competitiveAdvantageValue = inputs.avgSalary * coveredEmployees * 0.03 * strategicMultiplier * organizationalReadiness * companyScaleFactor
    const strategicValue = competitiveAdvantageValue + voicePlatformValue + assetTokenizationValue + stablecoinValue

    // Hidden cost reductions scale with coverage
    // Use actual input values, not hardcoded assumptions
    // For companies that use AI tools: 40-60% reduction in data prep, 30% in training, 20% in maintenance
    const cappedToolsMultiplier = Math.min(toolsEfficiencyMultiplier, 1.3) // Max 30% improvement
    const hiddenCostReduction =
      (inputs.dataPreparationCosts * 0.4 + inputs.trainingCosts * 0.3 + inputs.maintenanceCosts * 0.2) *
      cappedToolsMultiplier * employeeCoverageRatio * organizationalReadiness

    // ============================================================================
    // PART 6: Total Savings & ROI Calculation
    // ============================================================================
    // Implementation costs scale with plan complexity
    const implementationMultiplier = kronovaSubscription >= 9990 ? 0.3 : kronovaSubscription >= 2990 ? 0.4 : 0.5
    const implementationCosts = kronovaSubscription * implementationMultiplier
    const ongoingOperationalCosts = kronovaSubscription * 0.15 // 15% for ongoing ops

    // Total savings = traditional + token productivity + Kronova features
    const totalSavings = operationalSavings + qualitySavings + strategicValue + hiddenCostReduction + effectiveTokenValue
    
    // CRITICAL: Total cost includes base subscription + additional seats if needed
    const kronovaAnnualCost = kronovaSubscription + ongoingOperationalCosts + additionalSeatCost
    const annualSavings = totalSavings - kronovaAnnualCost

    // ROI calculations
    // Use standard SaaS ROI formula: compare annual net benefit to annual subscription cost
    // This is the industry standard and most meaningful for recurring subscription products
    const totalInvestment = kronovaSubscription + implementationCosts
    const roi = kronovaAnnualCost > 0 ? (annualSavings / kronovaAnnualCost) * 100 : 0
    const paybackMonths = annualSavings > 0 ? Math.max(0.1, totalInvestment / (annualSavings / 12)) : 0

    // Multi-year projections with compound efficiency gains (5% annual improvement)
    const year2Savings = annualSavings * 1.05
    const year3Savings = annualSavings * 1.1
    const threeYearSavings = annualSavings + year2Savings + year3Savings - implementationCosts
    const fiveYearValue = annualSavings * (1 + 1.05 + 1.1 + 1.15 + 1.2) - implementationCosts

    // ============================================================================
    // PART 7: Risk Assessment
    // ============================================================================
    const implementationRisk = ((100 - inputs.aiMaturity) * industryData.risk) / 100
    const dataQualityRisk = ((100 - inputs.dataQuality) / 100) * 50
    const adoptionRisk = ((100 - inputs.changeReadiness) / 100) * 30

    // ============================================================================
    // PART 8: Performance Metrics
    // ============================================================================
    const productivityGain = Math.min(95, baseEfficiencyGain * 100)
    const errorReduction = Math.min(95, errorReductionRate * 100)
    const timeToValue = Math.max(2, 10 - aiReadinessFactor * 6 - (kronovaSubscription >= 9990 ? 2 : 0))

    setResults({
      currentAnnualCost,
      kronovaAnnualCost,
      annualSavings,
      roi,
      paybackMonths,
      threeYearSavings,
      fiveYearValue,
      operationalSavings,
      qualitySavings,
      strategicValue,
      hiddenCostReduction,
      implementationRisk,
      dataQualityRisk,
      adoptionRisk,
      productivityGain,
      errorReduction,
      timeToValue,
    })
  }

  useEffect(() => {
    calculateComprehensiveROI()
  }, [inputs, selectedPlan])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskColor = (risk: number) => {
    if (risk < 20) return "text-green-600 bg-green-50"
    if (risk < 40) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const handleDownloadPDF = async () => {
    const selectedPlanData = activePlans[selectedPlan]
    try {
      // First save the assessment to Supabase silently
      let reference: string | null = savedReference
      if (!reference) {
        try {
          const assessmentPayload = {
            // Organization Profile
            employees: inputs.employees,
            avgSalary: inputs.avgSalary,
            industry: inputs.industry,
            companySize: inputs.companySize,
            
            // Current Operations
            manualHours: inputs.manualHours,
            errorRate: inputs.errorRate,
            systemDowntime: inputs.systemDowntime,
            complianceCosts: inputs.complianceCosts,
            
            // Data & Infrastructure
            dataQuality: inputs.dataQuality,
            integrationComplexity: inputs.integrationComplexity,
            legacySystemAge: inputs.legacySystemAge,
            cloudReadiness: inputs.cloudReadiness,
            
            // Strategic Factors
            aiMaturity: inputs.aiMaturity,
            changeReadiness: inputs.changeReadiness,
            executiveSupport: inputs.executiveSupport,
            competitivePressure: inputs.competitivePressure,
            
            // Hidden Costs
            dataPreparationCosts: inputs.dataPreparationCosts,
            trainingCosts: inputs.trainingCosts,
            maintenanceCosts: inputs.maintenanceCosts,
            securityCosts: inputs.securityCosts,
            
            // Selected Plan
            selectedPlan: selectedPlanData?.name || "Unknown",
            
            // Results
            results: {
              currentAnnualCost: results.currentAnnualCost,
              kronovaAnnualCost: results.kronovaAnnualCost,
              annualSavings: results.annualSavings,
              roi: results.roi,
              paybackMonths: results.paybackMonths,
              threeYearSavings: results.threeYearSavings,
              fiveYearValue: results.fiveYearValue,
              operationalSavings: results.operationalSavings,
              qualitySavings: results.qualitySavings,
              strategicValue: results.strategicValue,
              hiddenCostReduction: results.hiddenCostReduction,
              implementationRisk: results.implementationRisk,
              dataQualityRisk: results.dataQualityRisk,
              adoptionRisk: results.adoptionRisk,
              productivityGain: results.productivityGain,
              errorReduction: results.errorReduction,
              timeToValue: results.timeToValue,
            },
          }
          
          const response = await fetch("/api/roi/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assessmentPayload),
          })
          
          const data = await response.json()
        
          if (data.success && data.assessment?.reference) {
            reference = data.assessment.reference
            setSavedReference(reference)
          }
        } catch (saveError) {
          // Continue with PDF generation even if save fails
        }
      }
      
      const { generateROIPDF } = await import("../lib/pdf/generate-roi-pdf")
      generateROIPDF({
        // Organization Profile
        industry: inputs.industry,
        companySize: inputs.companySize,
        employees: inputs.employees,
        avgSalary: inputs.avgSalary,
        
        // Current Operations (Form Inputs)
        manualHours: inputs.manualHours,
        errorRate: inputs.errorRate,
        systemDowntime: inputs.systemDowntime,
        complianceCosts: inputs.complianceCosts,
        
        // Data & Infrastructure (Form Inputs)
        dataQuality: inputs.dataQuality,
        integrationComplexity: inputs.integrationComplexity,
        legacySystemAge: inputs.legacySystemAge,
        cloudReadiness: inputs.cloudReadiness,
        
        // Strategic Factors (Form Inputs)
        aiMaturity: inputs.aiMaturity,
        changeReadiness: inputs.changeReadiness,
        executiveSupport: inputs.executiveSupport,
        competitivePressure: inputs.competitivePressure,
        
        // Hidden Costs
        dataPreparationCosts: inputs.dataPreparationCosts,
        trainingCosts: inputs.trainingCosts,
        maintenanceCosts: inputs.maintenanceCosts,
        securityCosts: inputs.securityCosts,
        
        // Calculated Results
        currentAnnualCost: results.currentAnnualCost,
        kronovaAnnualCost: results.kronovaAnnualCost,
        annualSavings: results.annualSavings,
        roi: results.roi,
        paybackMonths: results.paybackMonths,
        threeYearSavings: results.threeYearSavings,
        fiveYearValue: results.fiveYearValue,
        operationalSavings: results.operationalSavings,
        qualitySavings: results.qualitySavings,
        strategicValue: results.strategicValue,
        hiddenCostReduction: results.hiddenCostReduction,
        implementationRisk: results.implementationRisk,
        dataQualityRisk: results.dataQualityRisk,
        adoptionRisk: results.adoptionRisk,
        productivityGain: results.productivityGain,
        errorReduction: results.errorReduction,
        timeToValue: results.timeToValue,
        selectedPlan: selectedPlanData?.name || "Unknown",
        
        // Assessment Reference
        assessmentReference: reference || undefined,
      })
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <section id="roi-calculator" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <Badge className="mb-3 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-300">
            <Calculator className="mr-1 h-3 w-3" />
            AI Transformation ROI Calculator
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
            Calculate Your <span className="text-gradient">AI Transformation ROI</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive analysis of your transition from traditional systems to AI-powered platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <Card className="h-full w-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-lg md:text-xl">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5 text-cyan-600" />
                  AI Transformation Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <Tabs defaultValue="organization" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full mb-4 h-auto">
                    <TabsTrigger value="organization" className="text-xs px-1 py-2">
                      Organization
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="text-xs px-1 py-2">
                      Operations
                    </TabsTrigger>
                    <TabsTrigger value="infrastructure" className="text-xs px-1 py-2">
                      Infrastructure
                    </TabsTrigger>
                    <TabsTrigger value="strategy" className="text-xs px-1 py-2">
                      Strategy
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="organization" className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employees" className="text-sm md:text-base">
                          Number of Employees
                        </Label>
                        <Input
                          id="employees"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={rawInputs.employees}
                          onChange={(e) => {
                            const rawValue = e.target.value
                            setRawInputs((prev) => ({ ...prev, employees: rawValue }))
                            const numValue = Number.parseInt(rawValue)
                            if (!Number.isNaN(numValue) && numValue >= 1) {
                              setInputs((prev) => ({ ...prev, employees: numValue }))
                            }
                          }}
                          onBlur={(e) => {
                            const numValue = Number.parseInt(e.target.value)
                            if (e.target.value === "" || Number.isNaN(numValue) || numValue < 1) {
                              setRawInputs((prev) => ({ ...prev, employees: String(inputs.employees) }))
                            }
                          }}
                          placeholder="e.g., 50"
                          className="text-base md:text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary" className="text-sm md:text-base">
                          Average Annual Salary
                        </Label>
                        <Input
                          id="salary"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={rawInputs.avgSalary}
                          onChange={(e) => {
                            const rawValue = e.target.value
                            setRawInputs((prev) => ({ ...prev, avgSalary: rawValue }))
                            const numValue = Number.parseInt(rawValue)
                            if (!Number.isNaN(numValue) && numValue >= 1) {
                              setInputs((prev) => ({ ...prev, avgSalary: numValue }))
                            }
                          }}
                          onBlur={(e) => {
                            const numValue = Number.parseInt(e.target.value)
                            if (e.target.value === "" || Number.isNaN(numValue) || numValue < 1) {
                              setRawInputs((prev) => ({ ...prev, avgSalary: String(inputs.avgSalary) }))
                            }
                          }}
                          placeholder="e.g., 75000"
                          className="text-base md:text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm md:text-base">Industry</Label>
                        <Select
                          value={inputs.industry}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, industry: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail & E-commerce</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance & Banking</SelectItem>
                            <SelectItem value="logistics">Logistics & Supply Chain</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm md:text-base">Company Size</Label>
                        <Select
                          value={inputs.companySize}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, companySize: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (1-50 employees)</SelectItem>
                            <SelectItem value="medium">Medium (51-500 employees)</SelectItem>
                            <SelectItem value="large">Large (500+ employees)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="operations" className="space-y-4 md:space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">
                          Manual Asset Management Hours/Week: {inputs.manualHours}
                        </Label>
                        <Slider
                          value={[inputs.manualHours]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, manualHours: value[0] }))}
                          max={40}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">Error Rate (%): {inputs.errorRate}%</Label>
                        <Slider
                          value={[inputs.errorRate]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, errorRate: value[0] }))}
                          max={20}
                          min={1}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">System Downtime (%): {inputs.systemDowntime}%</Label>
                        <Slider
                          value={[inputs.systemDowntime]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, systemDowntime: value[0] }))}
                          max={10}
                          min={0.1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compliance" className="text-sm md:text-base">
                          Annual Compliance Costs
                        </Label>
                        <Input
                          id="compliance"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={rawInputs.complianceCosts}
                          onChange={(e) => {
                            const rawValue = e.target.value
                            setRawInputs((prev) => ({ ...prev, complianceCosts: rawValue }))
                            const numValue = Number.parseInt(rawValue)
                            if (!Number.isNaN(numValue) && numValue >= 0) {
                              setInputs((prev) => ({ ...prev, complianceCosts: numValue }))
                            }
                          }}
                          onBlur={(e) => {
                            const numValue = Number.parseInt(e.target.value)
                            if (e.target.value === "" || Number.isNaN(numValue) || numValue < 0) {
                              setRawInputs((prev) => ({ ...prev, complianceCosts: String(inputs.complianceCosts) }))
                            }
                          }}
                          placeholder="e.g., 50000"
                          className="text-base md:text-lg"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="infrastructure" className="space-y-4 md:space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">Data Quality Score: {inputs.dataQuality}%</Label>
                        <Slider
                          value={[inputs.dataQuality]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, dataQuality: value[0] }))}
                          max={100}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">
                          Integration Complexity: {inputs.integrationComplexity}%
                        </Label>
                        <Slider
                          value={[inputs.integrationComplexity]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, integrationComplexity: value[0] }))}
                          max={100}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">
                          Legacy System Age (years): {inputs.legacySystemAge}
                        </Label>
                        <Slider
                          value={[inputs.legacySystemAge]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, legacySystemAge: value[0] }))}
                          max={20}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">Cloud Readiness: {inputs.cloudReadiness}%</Label>
                        <Slider
                          value={[inputs.cloudReadiness]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, cloudReadiness: value[0] }))}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="strategy" className="space-y-4 md:space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">AI Maturity Level: {inputs.aiMaturity}%</Label>
                        <Slider
                          value={[inputs.aiMaturity]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, aiMaturity: value[0] }))}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">Change Readiness: {inputs.changeReadiness}%</Label>
                        <Slider
                          value={[inputs.changeReadiness]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, changeReadiness: value[0] }))}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">Executive Support: {inputs.executiveSupport}%</Label>
                        <Slider
                          value={[inputs.executiveSupport]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, executiveSupport: value[0] }))}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base">
                          Competitive Pressure: {inputs.competitivePressure}%
                        </Label>
                        <Slider
                          value={[inputs.competitivePressure]}
                          onValueChange={(value) => setInputs((prev) => ({ ...prev, competitivePressure: value[0] }))}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-3 mt-6 pt-6 border-t">
                  <Label className="text-sm md:text-base">Select Kronova Plan </Label>
                  <Select
                    value={selectedPlan.toString()}
                    onValueChange={(value) => setSelectedPlan(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePlans.map((plan, index) => {
                        const yearlyPrice = plan.yearly ?? 0
                        const monthlyPrice = plan.monthly ?? 0
                        const aiTokens = plan.limits?.ai_tokens ?? 0
                        const provider = plan.provider ? `${plan.provider} - ` : ""

                        return (
                          <SelectItem key={index} value={index.toString()}>
                            <div className="flex justify-between items-center w-full gap-4">
                              <span className="font-medium">
                                {provider}
                                {plan.name}
                              </span>
                              <span className="text-blue-600 font-semibold">
                                {plan.customPricing
                                  ? "Custom"
                                  : plan.payAsYouGo
                                    ? "Pay-as-you-go"
                                    : yearlyPrice > 0
                                      ? formatCurrency(yearlyPrice) + "/yr"
                                      : "Free"}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {/* Display selected plan details */}
                  {activePlans[selectedPlan] && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm">
                            {activePlans[selectedPlan].provider && (
                              <span className="text-gray-600">{activePlans[selectedPlan].provider} - </span>
                            )}
                            {activePlans[selectedPlan].name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {activePlans[selectedPlan].limits?.ai_tokens === -1
                              ? "Unlimited AI tokens"
                              : activePlans[selectedPlan].limits?.ai_tokens
                                ? `${activePlans[selectedPlan].limits.ai_tokens.toLocaleString()} AI tokens/month`
                                : "AI capabilities included"}
                          </div>
                        </div>
                        <div className="text-right">
                          {activePlans[selectedPlan].customPricing ? (
                            <span className="text-blue-600 font-bold text-sm">Custom Pricing</span>
                          ) : activePlans[selectedPlan].payAsYouGo ? (
                            <span className="text-blue-600 font-bold text-sm">Pay-as-you-go</span>
                          ) : (
                            <>
                              <span className="text-blue-600 font-bold text-sm block">
                                {formatCurrency(activePlans[selectedPlan].yearly ?? 0)}/yr
                              </span>
                              {activePlans[selectedPlan].monthly && (
                                <span className="text-xs text-gray-500">
                                  {formatCurrency(activePlans[selectedPlan].monthly ?? 0)}/mo
                                </span>
                              )}
                            </>
                          )}
                        </div>
                  </div>
                </div>
              )}
              
              {/* Plan validation warning */}
              {(() => {
                const selectedPlanData = activePlans[selectedPlan]
                const maxTeamMembers = selectedPlanData?.limits?.team_members || 1
                const isUnlimited = maxTeamMembers === -1
                
                // Check if plan is inappropriate for employee count
                if (!isUnlimited && inputs.employees > maxTeamMembers) {
                  const recommendedPlan = inputs.employees <= 5 ? "Starter" : inputs.employees <= 25 ? "Professional" : "Enterprise"
                  return (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900">Plan Mismatch Detected</p>
                          <p className="text-xs text-amber-800 mt-1">
                            The {selectedPlanData?.name} plan supports up to {maxTeamMembers} team member{maxTeamMembers !== 1 ? 's' : ''}, but you have {inputs.employees} employees. 
                            {inputs.employees > maxTeamMembers && (
                              <> Only {maxTeamMembers} employee{maxTeamMembers !== 1 ? 's' : ''} will be covered in this calculation, and additional seat costs will be added.</>
                            )}
                          </p>
                          <p className="text-xs text-amber-800 mt-2">
                            <strong>Recommended:</strong> Consider the {recommendedPlan} plan for full coverage.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

          {/* Enhanced Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <Card className="h-full w-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-lg md:text-xl">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  Comprehensive ROI Analysis
                  {isCalculating && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {apiError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Using offline calculation. {apiError}
                    </p>
                  </div>
                )}

                {results && (
                  <div className="space-y-4 md:space-y-6 w-full">
                    {/* Key Metrics */}
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
                      <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 break-all">
                        {formatCurrency(results.annualSavings)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {results.roi > 0 ? `${results.roi.toFixed(0)}% ROI` : "Investment Required"}
                      </div>
                    </div>

                    {/* Performance Indicators */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Productivity Gain</div>
                        <div className="text-lg font-bold text-green-600">{results.productivityGain.toFixed(0)}%</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Error Reduction</div>
                        <div className="text-lg font-bold text-blue-600">{results.errorReduction.toFixed(0)}%</div>
                      </div>
                    </div>

                    {/* Savings Breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Savings Breakdown:</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Operational Efficiency:</span>
                          <span className="font-semibold">{formatCurrency(results.operationalSavings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality Improvements:</span>
                          <span className="font-semibold">{formatCurrency(results.qualitySavings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Strategic Value:</span>
                          <span className="font-semibold">{formatCurrency(results.strategicValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hidden Cost Reduction:</span>
                          <span className="font-semibold">{formatCurrency(results.hiddenCostReduction)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Risk Assessment:
                      </h4>
                      <div className="space-y-1">
                        <div className={`text-xs p-2 rounded ${getRiskColor(results.implementationRisk)}`}>
                          Implementation Risk: {results.implementationRisk.toFixed(0)}%
                        </div>
                        <div className={`text-xs p-2 rounded ${getRiskColor(results.dataQualityRisk)}`}>
                          Data Quality Risk: {results.dataQualityRisk.toFixed(0)}%
                        </div>
                        <div className={`text-xs p-2 rounded ${getRiskColor(results.adoptionRisk)}`}>
                          Adoption Risk: {results.adoptionRisk.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Time to Value</div>
                        <div className="text-sm font-bold text-purple-600">{results.timeToValue.toFixed(0)} months</div>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <Target className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Payback Period</div>
                        <div className="text-sm font-bold text-indigo-600">
                          {results.paybackMonths.toFixed(1)} months
                        </div>
                      </div>
                    </div>

                    {/* Long-term Value */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Long-term Value:</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>3-Year Savings:</span>
                          <span className="font-semibold">{formatCurrency(results.threeYearSavings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>5-Year Value:</span>
                          <span className="font-semibold">{formatCurrency(results.fiveYearValue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={handleDownloadPDF}
                        className="w-full bg-gradient-to-r from-[#0047AB] to-[#00CED1] hover:from-[#003d91] hover:to-[#00b8b8] text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        onClick={() => setShowAssessmentDialog(true)}
                        variant="outline"
                        className="w-full border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB] hover:text-white bg-transparent"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Request Analysis
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Platform Market Comparison — shown once the calculator has been run */}
        {results.currentAnnualCost > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4"
          >
            <AiPlatformComparison
              employees={inputs.employees}
              currentAnnualCost={results.currentAnnualCost}
              resultsReady={results.currentAnnualCost > 0}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8 px-4"
        >
          <p className="text-xs md:text-sm text-gray-600 max-w-4xl mx-auto">
            Calculations based on comprehensive AI ROI research, industry benchmarks, and platform capabilities. Results incorporate factors from data quality, organizational readiness, and industry-specific multipliers. Actual results may vary based on implementation approach and organizational factors.
          </p>
        </motion.div>
      </div>

      <ROIAssessmentDialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog} />
    </section>
  )
}