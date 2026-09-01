"use client"

import { useState, useEffect } from "react"
import { Cpu, TrendingDown, TrendingUp } from "lucide-react"

export function SITSpotTicker({ initialPrice = 0.00142 }: { initialPrice?: number }) {
  const [spotPrice, setSpotPrice] = useState(initialPrice)
  const [change24h] = useState(-3.45)

  // Simulates real-time telemetry updates from Rust pricing cron jobs
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.00002
      setSpotPrice((prev) => Math.max(0.0001, Number((prev + delta).toFixed(6))))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-700/60 bg-slate-950/60 text-sm">
      <div className="flex items-center gap-2.5">
        <Cpu className="h-4 w-4 text-[#00CED1] animate-pulse" />
        <span className="font-semibold text-slate-200">Kronova SIT Spot Index:</span>
        <span className="font-mono text-sm font-bold text-[#00CED1]">
          ${spotPrice.toFixed(6)} / SIT
        </span>
      </div>
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-slate-400">24h Volatility:</span>
        <span className={`flex items-center font-semibold ${change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
          {change24h >= 0 ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
          {change24h > 0 ? `+${change24h}` : change24h}%
        </span>
      </div>
    </div>
  )
}