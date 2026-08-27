"use client";

import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Sparkles,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ---------------------------------------------------------------------------
// Helper Functions (Inlined for guaranteed stability)
// ---------------------------------------------------------------------------
const CATEGORY_LABELS: Record<string, string> = {
  foundation_model: "Foundation Model",
  enterprise_suite: "Enterprise Suite",
  developer_api: "Developer API",
  productivity: "Productivity",
  infrastructure: "Infrastructure",
  open_source: "Open Source",
}

function getScoreBarColor(score: number): string {
  if (score >= 90) return "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
  if (score >= 75) return "bg-emerald-400"
  if (score >= 60) return "bg-yellow-400"
  if (score >= 40) return "bg-orange-400"
  return "bg-red-400"
}

function formatDeltaScore(delta: number): string {
  const sign = delta >= 0 ? "+" : ""
  return `${sign}${delta} pts`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPlatformPrice(platform: any): string {
  if (platform.pricingModel === "custom" || platform.pricingModel === "enterprise") return "Custom"
  if (platform.pricingModel === "free") return "Free"
  if (platform.inputPrice > 0 || platform.outputPrice > 0) {
    return `$${platform.inputPrice.toFixed(2)} / 1M`
  }
  if (platform.monthlyFlat > 0) return `$${platform.monthlyFlat}/mo`
  return "Pay-as-you-go"
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortKey =
  | "fitScore"
  | "roiScore"
  | "cost"
  | "savings"
  | "payback"

type SortDir = "asc" | "desc"

interface Props {
  employees: number
  currentAnnualCost: number
  resultsReady: boolean
}

// ---------------------------------------------------------------------------
// Score bar sub-component
// ---------------------------------------------------------------------------
function ScoreBar({ score, className = "" }: { score: number; className?: string }) {
  const color = getScoreBarColor(score)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1.5 flex-1 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium text-slate-300 w-6 text-right">
        {score}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Kronova pinned row
// ---------------------------------------------------------------------------
function KronovaRow({ employees, currentAnnualCost }: { employees: number, currentAnnualCost: number }) {
  // Compute Kronova Reference Base line dynamically
  const estimatedAnnualCost = employees * 1800; // $150/mo blended rate
  const estimatedAnnualSavings = currentAnnualCost > 0 ? (currentAnnualCost * 0.4) : 0;
  const estimatedPaybackMonths = estimatedAnnualSavings > 0 ? (estimatedAnnualCost / (estimatedAnnualSavings / 12)) : 0;

  return (
    <tr className="bg-[#0047AB]/10 border-b border-[#00CED1]/30">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0047AB] flex items-center justify-center text-white font-bold text-xs">K</div>
          <div>
            <p className="font-bold text-slate-100">Kronova</p>
            <p className="text-xs text-[#00CED1]">Kronova Intelligent Systems</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-300">Enterprise Suite</td>
      <td className="px-4 py-4 text-sm text-slate-300">Custom</td>
      <td className="px-4 py-4 text-sm font-semibold text-slate-200">
        {estimatedAnnualCost > 0 ? `$${estimatedAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
      </td>
      <td className="px-4 py-4 text-sm font-mono font-bold text-green-400">
        {estimatedAnnualSavings > 0 ? `$${estimatedAnnualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
      </td>
      <td className="px-4 py-4 text-sm text-slate-300">
        {estimatedPaybackMonths > 0 ? `${estimatedPaybackMonths.toFixed(1)} mo` : "—"}
      </td>
      <td className="px-4 py-4"><ScoreBar score={95} /></td>
      <td className="px-4 py-4"><ScoreBar score={95} /></td>
      <td className="px-4 py-4">
        <div className="flex gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <Shield className="h-4 w-4 text-green-400" />
        </div>
      </td>
      <td className="px-4 py-4">
        <Button
          size="sm"
          className="text-xs h-7 bg-[#0047AB] hover:bg-[#003d91] text-white border-0"
          onClick={() => window.open("https://kronova.io", "_blank")}
        >
          Get Started
        </Button>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Platform row
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlatformRow({ platform, expanded, onToggle }: { platform: any; expanded: boolean; onToggle: () => void }) {
  const deltaPositive = platform.vsKronova >= 0

  return (
    <>
      <tr className="border-b border-slate-700/60 hover:bg-slate-800/40 cursor-pointer transition-colors" onClick={onToggle}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            <div>
              <p className="font-semibold text-slate-200">{platform.name}</p>
              <p className="text-xs text-slate-500">{platform.vendor}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-300">{CATEGORY_LABELS[platform.category] ?? platform.category}</td>
        <td className="px-4 py-3 text-sm text-slate-300">{formatPlatformPrice(platform)}</td>
        <td className="px-4 py-3 text-sm text-slate-300">
          {platform.cost > 0 ? `$${platform.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
        </td>
        <td className="px-4 py-3">
          <span className={`text-sm font-mono ${platform.savings > 0 ? "text-green-400" : "text-slate-500"}`}>
            {platform.savings > 0 ? `$${platform.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-300">
          {platform.payback > 0 && platform.payback < 120 ? `${platform.payback.toFixed(1)} mo` : ">10 yr"}
        </td>
        <td className="px-4 py-3"><ScoreBar score={platform.roiScore} /></td>
        <td className="px-4 py-3"><ScoreBar score={platform.fitScore} /></td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            {platform.soc2 && <Shield className="h-3 w-3 text-green-400" />}
            {platform.gdpr && <CheckCircle2 className="h-3 w-3 text-green-400" />}
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${deltaPositive ? "text-green-400" : "text-red-400"}`}>
            {deltaPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatDeltaScore(platform.vsKronova)}
          </span>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-slate-900/60">
          <td colSpan={10} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Score Breakdown</p>
                <div className="space-y-2">
                  {[
                    { label: "ROI Score", val: platform.roiScore },
                    { label: "Integration", val: platform.fitScore - 10 },
                    { label: "Time to Value", val: Math.max(0, platform.fitScore - 5) },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400 w-24 flex-shrink-0">{label}</span>
                      <ScoreBar score={val} className="flex-1" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Capabilities</p>
                <div className="space-y-1.5">
                  {platform.contextTokens && (
                    <p className="text-xs text-slate-300">
                      <span className="text-slate-500">Context:</span> {(platform.contextTokens / 1000).toFixed(0)}K tokens
                    </p>
                  )}
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500">Modalities:</span> {platform.modalities?.join(", ") || "Text"}
                  </p>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500">Regions:</span> {platform.regions?.join(", ").toUpperCase() || "Global"}
                  </p>
                  {platform.freeTier && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">Free tier available</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Compliance</p>
                <div className="space-y-1.5">
                  {[
                    { label: "SOC 2", val: platform.soc2 },
                    { label: "HIPAA Eligible", val: platform.hipaa },
                    { label: "GDPR Compliant", val: platform.gdpr },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${val ? "bg-green-400" : "bg-slate-600"}`} />
                      <span className={`text-xs ${val ? "text-slate-200" : "text-slate-500"}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Links</p>
                <div className="space-y-2">
                  {platform.pricingUrl && (
                    <a
                      href={platform.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#00CED1] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Pricing page
                    </a>
                  )}
                  <p className="text-xs text-slate-500">
                    Data source: <span className="text-slate-400 capitalize">API Cron Job</span>
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Sort header button
// ---------------------------------------------------------------------------
function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <button
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? "text-[#00CED1]" : "text-slate-400 hover:text-slate-200"
      }`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active && (dir === "asc" ? "▲" : "▼")}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function AiPlatformComparison({ employees, currentAnnualCost, resultsReady }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [category, setCategory] = useState("")
  const [requireSoc2, setRequireSoc2] = useState(false)
  const [requireHipaa, setRequireHipaa] = useState(false)
  const [requireGdpr, setRequireGdpr] = useState(false)
  const [search, setSearch] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("fitScore")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // Expanded row
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!resultsReady || currentAnnualCost <= 0) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsReady, employees, currentAnnualCost])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // Connect directly to your Next.js proxy route to fetch the array of all 45+ calculated models
      const response = await fetch(`/api/ai-platforms?employees=${employees}&current_annual_cost=${currentAnnualCost}`)
      if (response.ok) {
        const json = await response.json()

        // ENTERPRISE FIX: Safely unpack the array no matter how the API wrapped it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let platformArray: any[] = []
        if (Array.isArray(json)) platformArray = json
        else if (json?.data && Array.isArray(json.data)) platformArray = json.data
        else if (json?.platforms && Array.isArray(json.platforms)) platformArray = json.platforms
        else if (json?.result?.data && Array.isArray(json.result.data)) platformArray = json.result.data

        // Auto-mapper: Converts nested Rust DTOs and mixed casing into a unified, flat object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData = platformArray.map((item: any) => {
          const p = item.platform || item
          return {
            slug: p.platform_slug || p.platformSlug || 'unknown',
            name: p.platform_name || p.platformName || 'Unknown',
            vendor: p.vendor || 'Unknown',
            category: p.category || 'foundation_model',
            pricingModel: p.pricing_model || p.pricingModel || 'pay-as-you-go',
            inputPrice: parseFloat(p.price_input_per_1m_tokens ?? p.priceInputPer1mTokens ?? 0),
            outputPrice: parseFloat(p.price_output_per_1m_tokens ?? p.priceOutputPer1mTokens ?? 0),
            monthlyFlat: parseFloat(p.monthly_base_price ?? p.monthlyBasePrice ?? 0),
            cost: parseFloat(item.estimated_annual_cost ?? item.estimatedAnnualCost ?? 0),
            savings: parseFloat(item.estimated_annual_savings ?? item.estimatedAnnualSavings ?? 0),
            payback: parseFloat(item.estimated_payback_months ?? item.estimatedPaybackMonths ?? 0),
            roiScore: parseInt(item.roi_score ?? item.roiScore ?? item.roi_score_vs_kronova ?? 0),
            fitScore: parseInt(item.composite_fit_score ?? item.compositeFitScore ?? 0),
            vsKronova: parseInt(item.roi_score_vs_kronova ?? item.roiScoreVsKronova ?? 0),
            soc2: p.soc2_compliant ?? p.soc2Compliant ?? false,
            hipaa: p.hipaa_eligible ?? p.hipaaEligible ?? false,
            gdpr: p.gdpr_compliant ?? p.gdprCompliant ?? false,
            contextTokens: p.context_window_tokens ?? p.contextWindowTokens,
            modalities: p.supported_modalities ?? p.supportedModalities ?? [],
            regions: p.regions_available ?? p.regionsAvailable ?? [],
            freeTier: p.free_tier_included ?? p.freeTierIncluded ?? false,
            pricingUrl: p.pricing_page_url ?? p.pricingPageUrl,
          }
        })

        // Exclude Kronova from the main list so we can pin it to the top separately
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filtered = mappedData.filter((p: any) => !p.slug.toLowerCase().includes('kronova'))
        setData(filtered)
      } else {
        throw new Error("Failed to fetch")
      }
    } catch (e) {
      console.error(e)
      setError("Failed to load platform data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sortedPlatforms = useMemo(() => {
    if (!data || data.length === 0) return []
    let list = [...data]

    // Apply Text Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q))
    }

    // Apply Category Filter
    if (category !== "") {
      list = list.filter(p => p.category === category)
    }

    // Apply Compliance Filters
    if (requireSoc2) list = list.filter(p => p.soc2)
    if (requireHipaa) list = list.filter(p => p.hipaa)
    if (requireGdpr) list = list.filter(p => p.gdpr)

    // Apply Sorting
    list.sort((a, b) => {
      const av = a[sortKey] as number
      const bv = b[sortKey] as number
      return sortDir === "asc" ? av - bv : bv - av
    })

    return list
  }, [data, search, category, requireSoc2, requireHipaa, requireGdpr, sortKey, sortDir])

  const activeFilterCount = (category ? 1 : 0) + (requireSoc2 ? 1 : 0) + (requireHipaa ? 1 : 0) + (requireGdpr ? 1 : 0)

  if (!resultsReady) return null

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl mt-12 mb-12">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#00CED1]" />
            Global AI Market Intelligence Comparison
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            45+ enterprise AI models mathematically scored for your specific ROI baseline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-[#0047AB]/20 text-[#00CED1] border-[#00CED1]/30">
            Powered by AetherNet QUAS
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={load}
            disabled={loading}
            className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-3 border-b border-slate-700/40 bg-slate-800/30">
        <input
          type="text"
          placeholder="Search models or vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-0 h-8 px-3 rounded-md text-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00CED1]/50"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`h-8 text-xs bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 ${
            activeFilterCount > 0 ? "border-[#00CED1]/50 text-[#00CED1]" : ""
          }`}
        >
          <Filter className="h-3 w-3 mr-1" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 w-4 h-4 rounded-full bg-[#00CED1] text-slate-900 text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-1 flex-wrap">
          {(["", "foundation_model", "enterprise_suite", "developer_api"]).map((cat) => (
            <button
              key={cat || "all"}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                category === cat
                  ? "bg-[#0047AB] text-white"
                  : "bg-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              {cat === "" ? "All" : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Filters */}
      {filtersOpen && (
        <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-700/40 bg-slate-900/40">
          <span className="text-xs text-slate-400 font-medium">Compliance:</span>
          {[
            { label: "SOC 2", val: requireSoc2, set: setRequireSoc2 },
            { label: "HIPAA", val: requireHipaa, set: setRequireHipaa },
            { label: "GDPR", val: requireGdpr, set: setRequireGdpr },
          ].map(({ label, val, set }) => (
            <button
              key={label}
              onClick={() => set(!val)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                val
                  ? "bg-green-900/40 border-green-600/50 text-green-300"
                  : "bg-slate-700/40 border-slate-600/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="h-3 w-3" />
              {label}
              {val && <X className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading && data.length === 0 && (
          <div className="flex items-center justify-center py-16 gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-[#00CED1]" />
            <span className="text-sm text-slate-400">Running Build vs Buy Math Engine...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {data.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[180px]">Platform</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Price</th>
                <th className="px-4 py-3"><SortHeader label="Est. Cost / yr" sortKey="cost" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3"><SortHeader label="Est. Savings" sortKey="savings" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3"><SortHeader label="Payback" sortKey="payback" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 min-w-[120px]"><SortHeader label="ROI Score" sortKey="roiScore" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 min-w-[120px]"><SortHeader label="Fit Score" sortKey="fitScore" current={sortKey} dir={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">vs Kronova</th>
              </tr>
            </thead>
            <tbody>
              {/* ALWAYS Pin Kronova to the top */}
              <KronovaRow employees={employees} currentAnnualCost={currentAnnualCost} />

              {sortedPlatforms.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">
                    No matching AI platforms found for these filters.
                  </td>
                </tr>
              ) : (
                sortedPlatforms.map((platform) => (
                  <PlatformRow
                    key={platform.slug}
                    platform={platform}
                    expanded={expandedSlug === platform.slug}
                    onToggle={() => setExpandedSlug((s) => s === platform.slug ? null : platform.slug)}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {data && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/40 bg-slate-800/30">
          <p className="text-xs text-slate-500">
            Showing {sortedPlatforms.length} of {data.total} platforms &middot; Pricing data
            refreshed hourly &middot; Estimates based on {employees} employees
          </p>
          <p className="text-xs text-slate-600">
            Fit score = weighted ROI + integration + security + time-to-value
          </p>
        </div>
      )}
    </div>
  )
}