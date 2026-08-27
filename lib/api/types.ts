export interface OrganizationProfile {
  employees: number
  avgSalary: number
  industry: string
  companySize: string
}

export interface OperationsMetrics {
  manualHours: number
  errorRate: number
  systemDowntime: number
  complianceCosts: number
}

export interface InfrastructureData {
  dataQuality: number
  integrationComplexity: number
  legacySystemAge: number
  cloudReadiness: number
}

export interface StrategicFactors {
  aiMaturity: number
  changeReadiness: number
  executiveSupport: number
  competitivePressure: number
}

export interface ROIResults {
  currentAnnualCost: number
  kronovaAnnualCost: number
  annualSavings: number
  roi: number
  paybackMonths: number
  threeYearSavings: number
  fiveYearValue: number
  operationalSavings: number
  qualitySavings: number
  strategicValue: number
  hiddenCostReduction: number
  implementationRisk: number
  dataQualityRisk: number
  adoptionRisk: number
  productivityGain: number
  errorReduction: number
  timeToValue: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  aiTokensMonthly: number
  managedAssets: number
  storageGb: number
  teamMembers: number
  apiCallsMonthly: number
  features: string[]
  isIntroductory: boolean
}

export interface IndustryBenchmark {
  id: string
  industry: string
  complexityMultiplier: number
  savingsMultiplier: number
  riskMultiplier: number
  avgImplementationMonths: number
  avgRoiPercentage: number
  dataQualityBaseline: number
}

export interface ROICalculation {
  id: string
  userId: string | null
  organizationProfile: OrganizationProfile
  operationsMetrics: OperationsMetrics
  infrastructureData: InfrastructureData
  strategicFactors: StrategicFactors
  results: ROIResults
  selectedPlan: string
  createdAt: string
  updatedAt: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}
