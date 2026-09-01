"use client";

interface Platform {
  name: string;
  estimatedAnnualCost: number;
  tcoScore: number;
  infrastructureType: string;
}

export function PlatformComparisonTable({
  platforms,
  sitSpotPrice = 0.00142,
}: {
  platforms: Platform[];
  sitSpotPrice?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3">Platform / Architecture</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Estimated Annual Cost (USD)</th>
            <th className="px-4 py-3 text-right text-cyan-400">Annual Compute Volume (SITs)</th>
            <th className="px-4 py-3 text-right">TCO Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {platforms.map((platform) => {
            // Converts USD total cost into equivalent SIT units based on live index
            const annualSITs = Math.round(platform.estimatedAnnualCost / sitSpotPrice);
            return (
              <tr key={platform.name} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-sans font-medium text-slate-100">{platform.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{platform.infrastructureType}</td>
                <td className="px-4 py-3 text-right text-slate-200">
                  ${platform.estimatedAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right font-bold text-cyan-400">
                  {annualSITs.toLocaleString()} SIT
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-400">{platform.tcoScore}/100</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}