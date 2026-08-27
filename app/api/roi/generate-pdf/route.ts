import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

interface ROIAssessmentData {
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
  
  // Assessment Reference (for saved assessments)
  assessmentReference?: string
}

function generatePDFHTML(data: ROIAssessmentData): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => `${Math.round(value)}%`
  const formatPayback = (months: number) => {
    // Round to 2 decimal places
    return (Math.round(months * 100) / 100).toFixed(2)
  }
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a2e;
      line-height: 1.5;
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-size: 13px;
    }
    
    /* Header with gradient bar */
    .header {
      position: relative;
      margin-bottom: 25px;
      padding: 25px 30px;
      background: linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%);
      border-radius: 12px;
      color: white;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 206, 209, 0.3) 0%, rgba(0, 71, 171, 0.1) 100%);
      border-radius: 0 12px 12px 0;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: white;
      padding: 4px;
      box-shadow: 0 4px 15px rgba(0, 206, 209, 0.4);
    }
    
    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: white;
      letter-spacing: 3px;
    }
    
    .tagline {
      color: #00CED1;
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 500;
    }
    
    h1 {
      color: white;
      font-size: 26px;
      margin: 10px 0 5px 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      font-weight: 400;
    }
    
    /* Sections */
    .section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    
    .section-title {
      color: #0a1628;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid transparent;
      background: linear-gradient(white, white) padding-box, 
                  linear-gradient(90deg, #0047AB 0%, #00CED1 100%) border-box;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, #0047AB, #00CED1) 1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Hero Stats Banner */
    .hero-banner {
      background: linear-gradient(135deg, #0047AB 0%, #0066CC 50%, #00CED1 100%);
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 71, 171, 0.25);
    }
    
    .hero-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
    }
    
    .hero-label {
      color: rgba(255,255,255,0.85);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .hero-value {
      color: white;
      font-size: 48px;
      font-weight: 800;
      letter-spacing: -1px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      margin-bottom: 10px;
    }
    
    .hero-subtext {
      color: rgba(255,255,255,0.9);
      font-size: 13px;
      font-weight: 500;
    }
    
    /* Executive Summary Cards */
    .executive-summary-boxes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    
    .summary-box {
      padding: 18px 15px;
      border-radius: 10px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .summary-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    
    .summary-box.blue {
      background: linear-gradient(180deg, #EBF4FF 0%, #DBEAFE 100%);
      border: 1px solid #BFDBFE;
    }
    .summary-box.blue::before {
      background: linear-gradient(90deg, #0047AB, #3B82F6);
    }
    
    .summary-box.green {
      background: linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%);
      border: 1px solid #A7F3D0;
    }
    .summary-box.green::before {
      background: linear-gradient(90deg, #059669, #10B981);
    }
    
    .summary-box.orange {
      background: linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%);
      border: 1px solid #FED7AA;
    }
    .summary-box.orange::before {
      background: linear-gradient(90deg, #EA580C, #F97316);
    }
    
    .summary-box-label {
      font-size: 9px;
      color: #64748B;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    
    .summary-box-value {
      font-size: 24px;
      font-weight: 800;
    }
    
    .summary-box-value.blue-text { color: #0047AB; }
    .summary-box-value.green-text { color: #059669; }
    .summary-box-value.orange-text { color: #EA580C; }
    
    /* Info Grid - Organization Profile */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .info-item {
      padding: 12px 15px;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-radius: 8px;
      border-left: 3px solid #0047AB;
    }
    
    .info-label {
      font-size: 9px;
      color: #64748B;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .info-value {
      font-size: 14px;
      font-weight: 700;
      color: #0a1628;
    }
    
    /* Data Rows */
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-row {
      border-bottom: 1px solid #E2E8F0;
    }
    
    .data-row:nth-child(odd) {
      background: #F8FAFC;
    }
    
    .data-row td {
      padding: 10px 12px;
      font-size: 12px;
    }
    
    .data-row td:first-child {
      color: #475569;
      font-weight: 500;
    }
    
    .data-row td:last-child {
      text-align: right;
      font-weight: 700;
      color: #0a1628;
    }
    
    .data-row.highlight td:last-child {
      color: #059669;
      font-size: 14px;
    }
    
    /* Metric Cards */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }
    
    .metric-card {
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      border: 1px solid #DBEAFE;
      position: relative;
    }
    
    .metric-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 2px;
      background: linear-gradient(90deg, #0047AB, #00CED1);
      border-radius: 2px;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 800;
      color: #0047AB;
      margin: 8px 0;
    }
    
    .metric-label {
      font-size: 9px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    /* Risk Badges */
    .risk-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .risk-low {
      background: #DCFCE7;
      color: #166534;
    }
    
    .risk-medium {
      background: #FEF3C7;
      color: #92400E;
    }
    
    .risk-high {
      background: #FEE2E2;
      color: #991B1B;
    }
    
    /* Next Steps */
    .steps-list {
      padding-left: 0;
      counter-reset: step;
      list-style: none;
    }
    
    .steps-list li {
      position: relative;
      padding: 10px 15px 10px 45px;
      margin-bottom: 8px;
      background: #F8FAFC;
      border-radius: 8px;
      font-size: 12px;
      color: #334155;
      border-left: 3px solid #00CED1;
    }
    
    .steps-list li::before {
      counter-increment: step;
      content: counter(step);
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      background: linear-gradient(135deg, #0047AB, #00CED1);
      color: white;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* CTA Box */
    .cta-box {
      background: linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%);
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin-top: 25px;
      position: relative;
      overflow: hidden;
    }
    
    .cta-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #0047AB, #00CED1, #0047AB);
    }
    
    .cta-title {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin-bottom: 10px;
    }
    
    .cta-text {
      font-size: 12px;
      color: rgba(255,255,255,0.8);
      margin: 5px 0;
    }
    
    .cta-contact {
      display: inline-block;
      margin-top: 12px;
      padding: 10px 25px;
      background: linear-gradient(135deg, #00CED1 0%, #0047AB 100%);
      color: white;
      border-radius: 25px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 9px;
      color: #94A3B8;
    }
    
    .footer-logo {
      font-weight: 700;
      color: #0047AB;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0, 71, 171, 0.03);
      font-weight: 800;
      z-index: -1;
      white-space: nowrap;
      letter-spacing: 20px;
    }
    
    /* Page break for Assessment Inputs section */
    .page-break {
      page-break-before: always;
      margin-top: 40px;
    }
    
    /* Assessment Reference Badge */
    .reference-badge {
      display: inline-block;
      padding: 6px 16px;
      background: linear-gradient(135deg, #0047AB 0%, #00CED1 100%);
      color: white;
      border-radius: 25px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    
    /* Input Section Grid */
    .input-section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .input-category {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-radius: 10px;
      padding: 18px;
      border: 1px solid #E2E8F0;
    }
    
    .input-category-title {
      font-size: 11px;
      font-weight: 700;
      color: #0047AB;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #00CED1;
    }
    
    .input-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .input-item:last-child {
      border-bottom: none;
    }
    
    .input-item-label {
      font-size: 11px;
      color: #475569;
      font-weight: 500;
    }
    
    .input-item-value {
      font-size: 12px;
      font-weight: 700;
      color: #0a1628;
      background: white;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
    }
    
    /* Score indicator */
    .score-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .score-bar {
      width: 60px;
      height: 6px;
      background: #E2E8F0;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .score-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    
    .score-fill.low { background: linear-gradient(90deg, #EF4444, #F97316); }
    .score-fill.medium { background: linear-gradient(90deg, #F97316, #EAB308); }
    .score-fill.high { background: linear-gradient(90deg, #22C55E, #10B981); }
    
    /* Full width input category */
    .input-category.full-width {
      grid-column: span 2;
    }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .header, .hero-banner, .summary-box, .metric-card, .cta-box, .input-category { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="watermark">KRONOVA</div>
  
  <div class="header">
    <div class="header-content">
      <div class="logo-section">
        <div class="logo-icon">
          <img src="/icon-192x192.png" alt="Kronova Logo" />
        </div>
        <div class="logo-text-wrapper">
          <div class="logo-text">KRONOVA</div>
          <div class="tagline">Intelligent Systems</div>
        </div>
      </div>
      <h1>AI ROI Assessment Report</h1>
      <div class="subtitle">Generated on ${currentDate}</div>
    </div>
  </div>

  <!-- Hero Stats Banner -->
  <div class="hero-banner">
  <div class="hero-content">
  <div class="hero-label">Projected Annual Savings</div>
  <div class="hero-value">${formatCurrency(data.annualSavings)}</div>
  <div class="hero-subtext">ROI: ${formatPercent(data.roi)} | Payback: ${formatPayback(data.paybackMonths)} months</div>
  </div>
  </div>

  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="executive-summary-boxes">
      <div class="summary-box blue">
        <div class="summary-box-label">Annual Savings</div>
        <div class="summary-box-value blue-text">${formatCurrency(data.annualSavings)}</div>
      </div>
      <div class="summary-box green">
        <div class="summary-box-label">Return on Investment</div>
        <div class="summary-box-value green-text">${formatPercent(data.roi)}</div>
      </div>
  <div class="summary-box orange">
  <div class="summary-box-label">Payback Period</div>
  <div class="summary-box-value orange-text">${formatPayback(data.paybackMonths)} mo</div>
  </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Organization Profile</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Industry</div>
        <div class="info-value">${data.industry}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Company Size</div>
        <div class="info-value">${data.companySize}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Number of Employees</div>
        <div class="info-value">${data.employees.toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Average Annual Salary</div>
        <div class="info-value">${formatCurrency(data.avgSalary)}</div>
      </div>
    </div>
    <div class="info-item" style="margin-top: 10px;">
      <div class="info-label">Selected Plan</div>
      <div class="info-value" style="color: #0047AB;">${data.selectedPlan}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Financial Analysis</div>
    <table class="data-table">
      <tr class="data-row">
        <td>Current Annual Cost (Legacy Systems)</td>
        <td>${formatCurrency(data.currentAnnualCost)}</td>
      </tr>
      <tr class="data-row">
        <td>Kronova Annual Cost</td>
        <td>${formatCurrency(data.kronovaAnnualCost)}</td>
      </tr>
      <tr class="data-row highlight">
        <td>Net Annual Savings</td>
        <td>${formatCurrency(data.annualSavings)}</td>
      </tr>
      <tr class="data-row">
        <td>3-Year Projected Savings</td>
        <td>${formatCurrency(data.threeYearSavings)}</td>
      </tr>
      <tr class="data-row">
        <td>5-Year Total Value</td>
        <td>${formatCurrency(data.fiveYearValue)}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Savings Breakdown</div>
    <table class="data-table">
      <tr class="data-row">
        <td>Operational Efficiency Savings</td>
        <td>${formatCurrency(data.operationalSavings)}</td>
      </tr>
      <tr class="data-row">
        <td>Quality Improvement Savings</td>
        <td>${formatCurrency(data.qualitySavings)}</td>
      </tr>
      <tr class="data-row">
        <td>Strategic Value Creation</td>
        <td>${formatCurrency(data.strategicValue)}</td>
      </tr>
      <tr class="data-row">
        <td>Hidden Cost Reduction</td>
        <td>${formatCurrency(data.hiddenCostReduction)}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Performance Metrics</div>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Productivity Gain</div>
        <div class="metric-value">${formatPercent(data.productivityGain)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Error Reduction</div>
        <div class="metric-value">${formatPercent(data.errorReduction)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Time to Value</div>
        <div class="metric-value">${data.timeToValue}mo</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Risk Assessment</div>
    <table class="data-table">
      <tr class="data-row">
        <td>Implementation Risk</td>
        <td><span class="risk-badge risk-low">Low (${formatPercent(data.implementationRisk)})</span></td>
      </tr>
      <tr class="data-row">
        <td>Data Quality Risk</td>
        <td><span class="risk-badge risk-medium">Medium (${formatPercent(data.dataQualityRisk)})</span></td>
      </tr>
      <tr class="data-row">
        <td>Adoption Risk</td>
        <td><span class="risk-badge risk-low">Low (${formatPercent(data.adoptionRisk)})</span></td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Recommended Next Steps</div>
    <ol class="steps-list">
      <li>Schedule a personalized demo with our AI transformation specialists</li>
      <li>Conduct a detailed technical assessment of your current infrastructure</li>
      <li>Develop a phased implementation roadmap aligned with your business goals</li>
      <li>Identify quick-win opportunities for immediate ROI realization</li>
      <li>Establish KPIs and success metrics for ongoing optimization</li>
    </ol>
  </div>

  <div class="cta-box">
    <div class="cta-title">Ready to Transform Your Business?</div>
    <div class="cta-text">Contact us: sales@kronova.io | Visit: roi.kronova.io</div>
    <div class="cta-contact">Schedule a Demo Today</div>
  </div>

  <!-- Page 2: Assessment Inputs -->
  <div class="page-break">
    <div class="section">
      <div class="section-title">Assessment Input Summary</div>
      ${data.assessmentReference ? `<div class="reference-badge">Reference: ${data.assessmentReference}</div>` : ""}
      <p style="font-size: 11px; color: #64748B; margin-bottom: 20px;">
        This section contains all the data entered into the ROI assessment form. Use this as a reference to verify your inputs and for future assessments.
      </p>
      
      <div class="input-section-grid">
        <!-- Organization Profile -->
        <div class="input-category">
          <div class="input-category-title">Organization Profile</div>
          <div class="input-item">
            <span class="input-item-label">Industry</span>
            <span class="input-item-value">${data.industry}</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Company Size</span>
            <span class="input-item-value">${data.companySize}</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Number of Employees</span>
            <span class="input-item-value">${data.employees.toLocaleString()}</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Average Annual Salary</span>
            <span class="input-item-value">${formatCurrency(data.avgSalary)}</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Selected Plan</span>
            <span class="input-item-value" style="background: #0047AB; color: white;">${data.selectedPlan}</span>
          </div>
        </div>

        <!-- Current Operations -->
        <div class="input-category">
          <div class="input-category-title">Current Operations</div>
          <div class="input-item">
            <span class="input-item-label">Manual Hours/Week</span>
            <span class="input-item-value">${data.manualHours ?? "N/A"} hrs</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Error Rate</span>
            <span class="input-item-value">${data.errorRate ?? "N/A"}%</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">System Downtime</span>
            <span class="input-item-value">${data.systemDowntime ?? "N/A"}%</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Compliance Costs</span>
            <span class="input-item-value">${data.complianceCosts ? formatCurrency(data.complianceCosts) : "N/A"}</span>
          </div>
        </div>

        <!-- Data & Infrastructure -->
        <div class="input-category">
          <div class="input-category-title">Data & Infrastructure</div>
          <div class="input-item">
            <span class="input-item-label">Data Quality</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.dataQuality ?? 0) >= 70 ? "high" : (data.dataQuality ?? 0) >= 40 ? "medium" : "low"}" style="width: ${data.dataQuality ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.dataQuality ?? "N/A"}%</span>
            </div>
          </div>
          <div class="input-item">
            <span class="input-item-label">Integration Complexity</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.integrationComplexity ?? 0) <= 30 ? "high" : (data.integrationComplexity ?? 0) <= 60 ? "medium" : "low"}" style="width: ${data.integrationComplexity ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.integrationComplexity ?? "N/A"}%</span>
            </div>
          </div>
          <div class="input-item">
            <span class="input-item-label">Legacy System Age</span>
            <span class="input-item-value">${data.legacySystemAge ?? "N/A"} years</span>
          </div>
          <div class="input-item">
            <span class="input-item-label">Cloud Readiness</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.cloudReadiness ?? 0) >= 70 ? "high" : (data.cloudReadiness ?? 0) >= 40 ? "medium" : "low"}" style="width: ${data.cloudReadiness ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.cloudReadiness ?? "N/A"}%</span>
            </div>
          </div>
        </div>

        <!-- Strategic Factors -->
        <div class="input-category">
          <div class="input-category-title">Strategic Factors</div>
          <div class="input-item">
            <span class="input-item-label">AI Maturity</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.aiMaturity ?? 0) >= 70 ? "high" : (data.aiMaturity ?? 0) >= 40 ? "medium" : "low"}" style="width: ${data.aiMaturity ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.aiMaturity ?? "N/A"}%</span>
            </div>
          </div>
          <div class="input-item">
            <span class="input-item-label">Change Readiness</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.changeReadiness ?? 0) >= 70 ? "high" : (data.changeReadiness ?? 0) >= 40 ? "medium" : "low"}" style="width: ${data.changeReadiness ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.changeReadiness ?? "N/A"}%</span>
            </div>
          </div>
          <div class="input-item">
            <span class="input-item-label">Executive Support</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.executiveSupport ?? 0) >= 70 ? "high" : (data.executiveSupport ?? 0) >= 40 ? "medium" : "low"}" style="width: ${data.executiveSupport ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.executiveSupport ?? "N/A"}%</span>
            </div>
          </div>
          <div class="input-item">
            <span class="input-item-label">Competitive Pressure</span>
            <div class="score-indicator">
              <div class="score-bar">
                <div class="score-fill ${(data.competitivePressure ?? 0) >= 70 ? "high" : (data.competitivePressure ?? 0) >= 40 ? "medium" : "low"}" style="width: ${data.competitivePressure ?? 0}%"></div>
              </div>
              <span class="input-item-value">${data.competitivePressure ?? "N/A"}%</span>
            </div>
          </div>
        </div>

        <!-- Hidden Costs -->
        <div class="input-category full-width">
          <div class="input-category-title">Hidden Cost Factors (Auto-Calculated Based on Organization Size)</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div class="input-item" style="flex-direction: column; align-items: flex-start; border: none;">
              <span class="input-item-label">Data Preparation</span>
              <span class="input-item-value">${data.dataPreparationCosts ? formatCurrency(data.dataPreparationCosts) : "N/A"}</span>
            </div>
            <div class="input-item" style="flex-direction: column; align-items: flex-start; border: none;">
              <span class="input-item-label">Training Costs</span>
              <span class="input-item-value">${data.trainingCosts ? formatCurrency(data.trainingCosts) : "N/A"}</span>
            </div>
            <div class="input-item" style="flex-direction: column; align-items: flex-start; border: none;">
              <span class="input-item-label">Maintenance Costs</span>
              <span class="input-item-value">${data.maintenanceCosts ? formatCurrency(data.maintenanceCosts) : "N/A"}</span>
            </div>
            <div class="input-item" style="flex-direction: column; align-items: flex-start; border: none;">
              <span class="input-item-label">Security Costs</span>
              <span class="input-item-value">${data.securityCosts ? formatCurrency(data.securityCosts) : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Methodology Note -->
      <div style="background: #F8FAFC; border-radius: 10px; padding: 18px; border: 1px solid #E2E8F0; margin-top: 20px;">
        <div style="font-size: 11px; font-weight: 700; color: #0047AB; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Calculation Methodology</div>
        <p style="font-size: 10px; color: #475569; margin: 0; line-height: 1.6;">
          ROI calculations are based on industry benchmarks from McKinsey, Deloitte, and SAP research (2025-2026). 
          AI productivity gains assume 40-60 minutes saved per employee daily (217 hours annually). 
          Token utilization efficiency accounts for coverage ratio based on selected plan limits.
          Strategic factors use weighted multipliers to adjust for organizational readiness and industry complexity.
          All projections are estimates and actual results may vary based on implementation quality and adoption rates.
        </p>
      </div>

      <!-- Disclaimer -->
      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 10px; padding: 18px; border: 1px solid #FCD34D; margin-top: 15px;">
        <div style="font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Important Disclaimer</div>
        <p style="font-size: 10px; color: #78350F; margin: 0; line-height: 1.6;">
          This assessment provides projected estimates based on the information provided and industry benchmarks. 
          Actual ROI may differ based on implementation specifics, organizational factors, and market conditions.
          These projections do not constitute financial advice. We recommend consulting with your financial advisors before making investment decisions.
        </p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-logo">KRONOVA</div>
    <p>&copy; ${new Date().getFullYear()} Kronova Intelligent Systems. All rights reserved.</p>
    <p>This document contains confidential ROI projections. For internal use only.</p>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const data: ROIAssessmentData = await request.json()

    // Generate HTML content
    const htmlContent = generatePDFHTML(data)

    // For now, return HTML that will be rendered as PDF by the browser
    // In production, you can use a service like Puppeteer or a PDF API
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="Kronova-ROI-Assessment-${new Date().toISOString().split("T")[0]}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
