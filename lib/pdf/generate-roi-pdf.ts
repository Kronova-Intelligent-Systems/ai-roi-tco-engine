import { format } from "date-fns"

// jsPDF is loaded dynamically to avoid SSR issues with fflate/Worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jsPDFModule: any = null

async function getJsPDF() {
  if (typeof window === "undefined") {
    throw new Error("PDF generation is only available in the browser")
  }
  if (!jsPDFModule) {
    const mod = await import("jspdf")
    jsPDFModule = mod.jsPDF
  }
  return jsPDFModule
}

interface ROIReportData {
  // Organization Profile
  industry: string
  companySize: string
  employees: number
  avgSalary: number
  
  // Current Operations (Form Inputs)
  manualHours?: number
  errorRate?: number
  systemDowntime?: number
  complianceCosts?: number
  
  // Data & Infrastructure (Form Inputs)
  dataQuality?: number
  integrationComplexity?: number
  legacySystemAge?: number
  cloudReadiness?: number
  
  // Strategic Factors (Form Inputs)
  aiMaturity?: number
  changeReadiness?: number
  executiveSupport?: number
  competitivePressure?: number
  
  // Hidden Costs (Form Inputs)
  dataPreparationCosts?: number
  trainingCosts?: number
  maintenanceCosts?: number
  securityCosts?: number
  
  // Calculated Results
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
  selectedPlan: string
  
  // Assessment Reference
  assessmentReference?: string
}

const COLORS = {
  primary: [0, 71, 171], // #0047AB
  accent: [0, 206, 209], // #00CED1
  dark: [10, 22, 40], // #0a1628
  success: [5, 150, 105], // #059669
  warning: [234, 88, 12], // #EA580C
  text: [26, 26, 46], // #1a1a2e
  muted: [100, 116, 139], // #64748B
}

export async function generateROIPDF(data: ROIReportData): Promise<void> {
  const JsPDF = await getJsPDF()
  const doc = new JsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`
  
  const formatPayback = (months: number) => {
    // Round to 2 decimal places
    return (Math.round(months * 100) / 100).toFixed(2)
  }

  // Watermark function
  const addWatermark = () => {
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.03 }))
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.setFontSize(80)
    doc.setFont("helvetica", "bold")
    const watermarkText = "KRONOVA"
    const textWidth = doc.getTextWidth(watermarkText)
    doc.text(watermarkText, (pageWidth - textWidth) / 2, pageHeight / 2, {
      angle: 45,
    })
    doc.restoreGraphicsState()
  }

  // Check page break
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos > pageHeight - requiredSpace) {
      doc.addPage()
      addWatermark()
      yPos = margin
      return true
    }
    return false
  }

  // Load and add logo
  try {
    const logoResponse = await fetch("/icon-192x192.png")
    if (logoResponse.ok) {
      const logoBlob = await logoResponse.blob()
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(logoBlob)
      })

      // Add logo with rounded background
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, yPos, 15, 15, 2, 2, "F")
      doc.addImage(logoBase64, "PNG", margin + 1, yPos + 1, 13, 13)
      
      // Logo text
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
      doc.text("KRONOVA", margin + 18, yPos + 8)
      
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
      doc.text("INTELLIGENT SYSTEMS", margin + 18, yPos + 12)
      
      yPos += 20
    }
  } catch (error) {
    console.error("[v0] Logo loading error:", error)
    yPos += 5
  }

  // Add watermark
  addWatermark()

  // Title
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("AI ROI Assessment Report", margin, yPos)
  yPos += 8

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
  doc.text(`Generated: ${format(new Date(), "PPpp")}`, margin, yPos)
  yPos += 15

  // Hero Stats Banner
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.roundedRect(margin, yPos, contentWidth, 28, 3, 3, "F")
  
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  const labelY = yPos + 8
  doc.text("PROJECTED ANNUAL SAVINGS", pageWidth / 2, labelY, { align: "center" })
  
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  const savingsY = yPos + 18
  doc.text(formatCurrency(data.annualSavings), pageWidth / 2, savingsY, { align: "center" })
  
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  const subY = yPos + 24
  doc.text(`ROI: ${formatPercent(data.roi)} | Payback: ${formatPayback(data.paybackMonths)} months`, pageWidth / 2, subY, {
  align: "center",
  })
  
  yPos += 35

  // Executive Summary Cards
  const cardWidth = (contentWidth - 8) / 3
  const cardHeight = 22
  const cardGap = 4

  const summaryCards = [
  { label: "Annual Savings", value: formatCurrency(data.annualSavings), color: [219, 234, 254] },
  { label: "Return on Investment", value: formatPercent(data.roi), color: [220, 252, 231] },
  { label: "Payback Period", value: `${formatPayback(data.paybackMonths)} mo`, color: [255, 237, 213] },
  ]

  summaryCards.forEach((card, i) => {
    const x = margin + i * (cardWidth + cardGap)
    
    // Card background
    doc.setFillColor(card.color[0], card.color[1], card.color[2])
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, "F")
    
    // Top accent line
    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.setLineWidth(1.5)
    doc.line(x, yPos, x + cardWidth, yPos)
    
    // Label
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(card.label.toUpperCase(), x + cardWidth / 2, yPos + 6, { align: "center" })
    
    // Value
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.text(card.value, x + cardWidth / 2, yPos + 15, { align: "center" })
  })
  
  yPos += cardHeight + 12

  // Organization Profile Section
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("ORGANIZATION PROFILE", margin, yPos)
  
  // Underline with gradient effect
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + 60, yPos + 1)
  yPos += 8

  const profileData = [
    ["Industry", data.industry, "Company Size", data.companySize],
    ["Number of Employees", data.employees.toLocaleString(), "Average Annual Salary", formatCurrency(data.avgSalary)],
  ]

  profileData.forEach((row) => {
    const itemWidth = (contentWidth - 4) / 2
    
    for (let i = 0; i < 2; i++) {
      const x = margin + i * (itemWidth + 4)
      
      // Background
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(x, yPos, itemWidth, 12, 1, 1, "F")
      
      // Left border accent
      doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
      doc.setLineWidth(1)
      doc.line(x, yPos, x, yPos + 12)
      
      // Label
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
      doc.text(row[i * 2].toUpperCase(), x + 3, yPos + 4)
      
      // Value
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
      doc.text(String(row[i * 2 + 1]), x + 3, yPos + 9)
    }
    
    yPos += 15
  })

  // Selected Plan
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, yPos, contentWidth, 12, 1, 1, "F")
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.setLineWidth(1)
  doc.line(margin, yPos, margin, yPos + 12)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
  doc.text("SELECTED PLAN", margin + 3, yPos + 4)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.text(data.selectedPlan, margin + 3, yPos + 9)
  yPos += 18

  // Financial Analysis Section
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("FINANCIAL ANALYSIS", margin, yPos)
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + 60, yPos + 1)
  yPos += 8

  const financialData = [
    ["Current Annual Cost (Legacy Systems)", formatCurrency(data.currentAnnualCost), false],
    ["Kronova Annual Cost", formatCurrency(data.kronovaAnnualCost), false],
    ["Net Annual Savings", formatCurrency(data.annualSavings), true],
    ["3-Year Projected Savings", formatCurrency(data.threeYearSavings), false],
    ["5-Year Total Value", formatCurrency(data.fiveYearValue), false],
  ]

  financialData.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos, contentWidth, 8, "F")
    }
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(String(item[0]), margin + 2, yPos + 5)
    
    doc.setFont("helvetica", "bold")
    if (item[2]) {
      doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2])
      doc.setFontSize(9)
    } else {
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    }
    doc.text(String(item[1]), pageWidth - margin - 2, yPos + 5, { align: "right" })
    
    yPos += 8
  })
  yPos += 8

  // Savings Breakdown
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("SAVINGS BREAKDOWN", margin, yPos)
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + 60, yPos + 1)
  yPos += 8

  const savingsData = [
    ["Operational Efficiency Savings", formatCurrency(data.operationalSavings)],
    ["Quality Improvement Savings", formatCurrency(data.qualitySavings)],
    ["Strategic Value Creation", formatCurrency(data.strategicValue)],
    ["Hidden Cost Reduction", formatCurrency(data.hiddenCostReduction)],
  ]

  savingsData.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos, contentWidth, 8, "F")
    }
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(item[0], margin + 2, yPos + 5)
    
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.text(item[1], pageWidth - margin - 2, yPos + 5, { align: "right" })
    
    yPos += 8
  })
  yPos += 8

  // Performance Metrics
  checkPageBreak(30)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("PERFORMANCE METRICS", margin, yPos)
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + 60, yPos + 1)
  yPos += 8

  const metricsCardWidth = (contentWidth - 8) / 3
  const metricsCardHeight = 20

  const metrics = [
    { label: "Productivity Gain", value: formatPercent(data.productivityGain) },
    { label: "Error Reduction", value: formatPercent(data.errorReduction) },
    { label: "Time to Value", value: `${data.timeToValue}mo` },
  ]

  metrics.forEach((metric, i) => {
    const x = margin + i * (metricsCardWidth + 4)
    
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(x, yPos, metricsCardWidth, metricsCardHeight, 2, 2, "F")
    doc.setDrawColor(219, 234, 254)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, yPos, metricsCardWidth, metricsCardHeight, 2, 2, "S")
    
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(metric.label.toUpperCase(), x + metricsCardWidth / 2, yPos + 6, { align: "center" })
    
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.text(metric.value, x + metricsCardWidth / 2, yPos + 15, { align: "center" })
  })
  yPos += metricsCardHeight + 10

  // Risk Assessment
  checkPageBreak(35)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("RISK ASSESSMENT", margin, yPos)
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + 60, yPos + 1)
  yPos += 8

  const riskData = [
    { label: "Implementation Risk", value: data.implementationRisk, level: "Low" },
    { label: "Data Quality Risk", value: data.dataQualityRisk, level: "Medium" },
    { label: "Adoption Risk", value: data.adoptionRisk, level: "Low" },
  ]

  riskData.forEach((risk, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, yPos, contentWidth, 8, "F")
    }
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(risk.label, margin + 2, yPos + 5)
    
    // Risk badge
    const badgeX = pageWidth - margin - 35
    const badgeColor = risk.level === "Low" ? [220, 252, 231] : [254, 243, 199]
    const textColor = risk.level === "Low" ? [22, 101, 52] : [146, 64, 14]
    
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2])
    doc.roundedRect(badgeX, yPos + 1, 33, 6, 3, 3, "F")
    
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(`${risk.level} (${formatPercent(risk.value)})`, badgeX + 16.5, yPos + 4.5, { align: "center" })
    
    yPos += 8
  })
  yPos += 10

  // Recommended Next Steps
  checkPageBreak(50)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("RECOMMENDED NEXT STEPS", margin, yPos)
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + 60, yPos + 1)
  yPos += 8

  const steps = [
    "Schedule a personalized demo with our AI transformation specialists",
    "Conduct a detailed technical assessment of your current infrastructure",
    "Develop a phased implementation roadmap aligned with your business goals",
    "Identify quick-win opportunities for immediate ROI realization",
    "Establish KPIs and success metrics for ongoing optimization",
  ]

  steps.forEach((step, i) => {
    checkPageBreak(12)
    
    // Background
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, yPos, contentWidth, 10, 1, 1, "F")
    
    // Left accent
    doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
    doc.setLineWidth(1)
    doc.line(margin, yPos, margin, yPos + 10)
    
    // Number badge
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.circle(margin + 6, yPos + 5, 3, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(String(i + 1), margin + 6, yPos + 6, { align: "center" })
    
    // Step text
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    const stepLines = doc.splitTextToSize(step, contentWidth - 20)
    doc.text(stepLines, margin + 12, yPos + 6)
    
    yPos += 12
  })
  yPos += 5

  // CTA Box
  checkPageBreak(25)
  doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.roundedRect(margin, yPos, contentWidth, 22, 3, 3, "F")
  
  // Top gradient line
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(1)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("Ready to Transform Your Business?", pageWidth / 2, yPos + 8, { align: "center" })
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("Contact us: sales@kronova.io | Visit: roi.kronova.io", pageWidth / 2, yPos + 14, { align: "center" })
  doc.text("Schedule a demo today and see your custom ROI projection", pageWidth / 2, yPos + 18, { align: "center" })
  
  yPos += 25

  // ============================================================================
  // PAGE 2: Assessment Input Summary
  // ============================================================================
  doc.addPage()
  addWatermark()
  yPos = margin

  // Page 2 Header
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2])
  doc.text("Assessment Input Summary", margin, yPos)
  yPos += 6

  // Assessment Reference (if available)
  if (data.assessmentReference) {
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.roundedRect(margin, yPos, 55, 6, 3, 3, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(`Reference: ${data.assessmentReference}`, margin + 27.5, yPos + 4, { align: "center" })
    yPos += 10
  }

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
  doc.text("This section contains all data entered into the ROI assessment form for your reference.", margin, yPos)
  yPos += 10

  // Helper function to draw input section
  const drawInputSection = (title: string, items: { label: string; value: string; score?: number }[], x: number, width: number) => {
    const sectionHeight = 10 + items.length * 10
    
    // Section background
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, yPos, width, sectionHeight, 2, 2, "F")
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, yPos, width, sectionHeight, 2, 2, "S")
    
    // Section title
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.text(title.toUpperCase(), x + 3, yPos + 5)
    
    // Title underline
    doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
    doc.setLineWidth(0.5)
    doc.line(x + 3, yPos + 7, x + 40, yPos + 7)
    
    // Items
    let itemY = yPos + 12
    items.forEach((item) => {
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
      doc.text(item.label, x + 3, itemY)
      
      // Value badge
      doc.setFillColor(255, 255, 255)
      const valueWidth = Math.max(doc.getTextWidth(item.value) + 4, 20)
      doc.roundedRect(x + width - valueWidth - 3, itemY - 3.5, valueWidth, 5, 1, 1, "F")
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(x + width - valueWidth - 3, itemY - 3.5, valueWidth, 5, 1, 1, "S")
      
      doc.setFont("helvetica", "bold")
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
      doc.text(item.value, x + width - valueWidth / 2 - 3, itemY, { align: "center" })
      
      // Score bar if available
      if (item.score !== undefined) {
        const barX = x + 50
        const barWidth = 25
        const barY = itemY - 2
        
        doc.setFillColor(226, 232, 240)
        doc.roundedRect(barX, barY, barWidth, 3, 1.5, 1.5, "F")
        
        const fillWidth = (item.score / 100) * barWidth
        const scoreColor = item.score >= 70 ? [34, 197, 94] : item.score >= 40 ? [234, 179, 8] : [239, 68, 68]
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2])
        doc.roundedRect(barX, barY, Math.max(fillWidth, 2), 3, 1.5, 1.5, "F")
      }
      
      itemY += 10
    })
    
    return sectionHeight
  }

  // Organization Profile Section
  const orgItems = [
    { label: "Industry", value: data.industry },
    { label: "Company Size", value: data.companySize },
    { label: "Employees", value: data.employees.toLocaleString() },
    { label: "Avg. Salary", value: formatCurrency(data.avgSalary) },
    { label: "Selected Plan", value: data.selectedPlan },
  ]
  
  // Current Operations Section
  const opsItems = [
    { label: "Manual Hours/Week", value: `${data.manualHours ?? "N/A"} hrs` },
    { label: "Error Rate", value: `${data.errorRate ?? "N/A"}%` },
    { label: "System Downtime", value: `${data.systemDowntime ?? "N/A"}%` },
    { label: "Compliance Costs", value: data.complianceCosts ? formatCurrency(data.complianceCosts) : "N/A" },
  ]

  const halfWidth = (contentWidth - 4) / 2
  
  // Draw Organization Profile (left column)
  const orgHeight = drawInputSection("Organization Profile", orgItems, margin, halfWidth)
  
  // Draw Current Operations (right column)
  const opsStartY = yPos
  yPos = opsStartY
  drawInputSection("Current Operations", opsItems, margin + halfWidth + 4, halfWidth)
  
  yPos += Math.max(orgHeight, 50) + 8

  // Data & Infrastructure Section
  checkPageBreak(60)
  const infraItems = [
    { label: "Data Quality", value: `${data.dataQuality ?? "N/A"}%`, score: data.dataQuality },
    { label: "Integration Complexity", value: `${data.integrationComplexity ?? "N/A"}%`, score: data.integrationComplexity },
    { label: "Legacy System Age", value: `${data.legacySystemAge ?? "N/A"} years` },
    { label: "Cloud Readiness", value: `${data.cloudReadiness ?? "N/A"}%`, score: data.cloudReadiness },
  ]
  
  // Strategic Factors Section
  const stratItems = [
    { label: "AI Maturity", value: `${data.aiMaturity ?? "N/A"}%`, score: data.aiMaturity },
    { label: "Change Readiness", value: `${data.changeReadiness ?? "N/A"}%`, score: data.changeReadiness },
    { label: "Executive Support", value: `${data.executiveSupport ?? "N/A"}%`, score: data.executiveSupport },
    { label: "Competitive Pressure", value: `${data.competitivePressure ?? "N/A"}%`, score: data.competitivePressure },
  ]

  const infraStartY = yPos
  drawInputSection("Data & Infrastructure", infraItems, margin, halfWidth)
  yPos = infraStartY
  drawInputSection("Strategic Factors", stratItems, margin + halfWidth + 4, halfWidth)
  
  yPos += 52

  // Hidden Costs Section (full width)
  checkPageBreak(40)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "S")
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.text("HIDDEN COST FACTORS (AUTO-CALCULATED)", margin + 3, yPos + 5)
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2])
  doc.setLineWidth(0.5)
  doc.line(margin + 3, yPos + 7, margin + 80, yPos + 7)

  const hiddenCostData = [
    { label: "Data Preparation", value: data.dataPreparationCosts ? formatCurrency(data.dataPreparationCosts) : "N/A" },
    { label: "Training Costs", value: data.trainingCosts ? formatCurrency(data.trainingCosts) : "N/A" },
    { label: "Maintenance Costs", value: data.maintenanceCosts ? formatCurrency(data.maintenanceCosts) : "N/A" },
    { label: "Security Costs", value: data.securityCosts ? formatCurrency(data.securityCosts) : "N/A" },
  ]

  const costColWidth = contentWidth / 4
  hiddenCostData.forEach((cost, i) => {
    const x = margin + i * costColWidth + 10
    
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(cost.label, x, yPos + 18)
    
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.text(cost.value, x, yPos + 26)
  })
  
  yPos += 45

  // Methodology Note
  checkPageBreak(35)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, "S")
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.text("CALCULATION METHODOLOGY", margin + 3, yPos + 5)
  
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
  const methodologyText = "ROI calculations are based on industry benchmarks from McKinsey, Deloitte, and SAP research (2025-2026). AI productivity gains assume 40-60 minutes saved per employee daily (217 hours annually). Token utilization efficiency accounts for coverage ratio based on selected plan limits. Strategic factors use weighted multipliers to adjust for organizational readiness and industry complexity."
  const methodologyLines = doc.splitTextToSize(methodologyText, contentWidth - 6)
  doc.text(methodologyLines, margin + 3, yPos + 11)
  
  yPos += 35

  // Disclaimer
  checkPageBreak(30)
  doc.setFillColor(254, 243, 199)
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "F")
  doc.setDrawColor(252, 211, 77)
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "S")
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(146, 64, 14)
  doc.text("IMPORTANT DISCLAIMER", margin + 3, yPos + 5)
  
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(120, 53, 15)
  const disclaimerText = "This assessment provides projected estimates based on the information provided and industry benchmarks. Actual ROI may differ based on implementation specifics, organizational factors, and market conditions. These projections do not constitute financial advice."
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 6)
  doc.text(disclaimerLines, margin + 3, yPos + 11)

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.text("KRONOVA", pageWidth / 2, pageHeight - 12, { align: "center" })
    
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
    doc.text(
      `© ${new Date().getFullYear()} Kronova Intelligent Systems. All rights reserved.`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    )
    doc.text("This document contains confidential ROI projections. For internal use only.", pageWidth / 2, pageHeight - 5, {
      align: "center",
    })
    
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" })
  }

  // Save the PDF
  doc.save(`kronova-roi-assessment-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}
