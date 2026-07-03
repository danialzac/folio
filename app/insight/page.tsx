import MetricCard from "@/components/MetricCard"
import { RISK_FREE_RATE } from "@/types/portfolio"
import { pct } from "@/lib/metrics"

const FALLBACK: Record<string, { returns: number; volatility: number }> = {
  AAPL:  { returns:  0.094429, volatility: 0.108564 },
  FB:    { returns:  0.030680, volatility: 0.078412 },
  GOOGL: { returns: -0.013609, volatility: 0.106286 },
  MSFT:  { returns: -0.009967, volatility: 0.135513 },
  PG:    { returns:  0.044105, volatility: 0.041105 },
  SBUX:  { returns:  0.031732, volatility: 0.066192 },
}

async function getStats() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const res  = await fetch(`${base}/api/prices`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error()
    const data = await res.json()
    return { stats: data.stats as Record<string, { returns: number; volatility: number }>, isLive: true }
  } catch {
    return { stats: FALLBACK, isLive: false }
  }
}

export default async function InsightPage() {
  const { stats, isLive } = await getStats()

  const assets = Object.entries(stats).map(([symbol, s]) => ({
    symbol,
    ...s,
    sharpe: (s.returns - RISK_FREE_RATE) / s.volatility,
  }))

  const byReturn   = [...assets].sort((a, b) => b.returns   - a.returns)
  const byVol      = [...assets].sort((a, b) => a.volatility - b.volatility)
  const bySharpe   = [...assets].sort((a, b) => b.sharpe    - a.sharpe)

  const best  = byReturn[0]
  const worst = byReturn[byReturn.length - 1]
  const avgReturn = assets.reduce((a, b) => a + b.returns, 0) / assets.length
  const avgVol    = assets.reduce((a, b) => a + b.volatility, 0) / assets.length

  const bars = (val: number, max: number, colour: string) => {
    const w = Math.max(4, Math.abs(val / max) * 100)
    return (
      <div className="h-2 rounded-full bg-zinc-800 w-full">
        <div className={`h-2 rounded-full ${colour}`} style={{ width: `${w}%` }} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Insight</h1>
          <p className="text-sm text-zinc-500 mt-1">Live snapshot of your equity universe</p>
        </div>
        {isLive && <span className="text-xs text-emerald-400">Live data</span>}
      </div>

      {/* summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Best Return"    value={best.symbol}  sub={pct(best.returns)}           positive />
        <MetricCard label="Worst Return"   value={worst.symbol} sub={pct(worst.returns)}           positive={false} />
        <MetricCard label="Avg Return"     value={pct(avgReturn)} sub="across 6 equities"          positive={avgReturn >= 0} />
        <MetricCard label="Avg Volatility" value={pct(avgVol)}    sub="annualised"                 positive={null} />
      </div>

      {/* return ranking */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest">Return Ranking</h2>
        <div className="space-y-3">
          {byReturn.map((a) => (
            <div key={a.symbol} className="flex items-center gap-4">
              <span className="text-sm font-mono text-zinc-300 w-12">{a.symbol}</span>
              <div className="flex-1">
                {bars(a.returns, Math.max(...assets.map(x => Math.abs(x.returns))),
                  a.returns >= 0 ? "bg-emerald-500" : "bg-red-500")}
              </div>
              <span className={`text-sm font-mono w-16 text-right ${a.returns >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {pct(a.returns)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* volatility ranking */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest">Volatility (lowest = safest)</h2>
        <div className="space-y-3">
          {byVol.map((a) => (
            <div key={a.symbol} className="flex items-center gap-4">
              <span className="text-sm font-mono text-zinc-300 w-12">{a.symbol}</span>
              <div className="flex-1">
                {bars(a.volatility, Math.max(...assets.map(x => x.volatility)), "bg-indigo-500")}
              </div>
              <span className="text-sm font-mono text-zinc-300 w-16 text-right">{pct(a.volatility)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* sharpe league table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest">Sharpe League Table</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800">
              <th className="text-left pb-3">Rank</th>
              <th className="text-left pb-3">Symbol</th>
              <th className="text-right pb-3">Return</th>
              <th className="text-right pb-3">Volatility</th>
              <th className="text-right pb-3">Sharpe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {bySharpe.map((a, i) => (
              <tr key={a.symbol} className="text-zinc-300">
                <td className="py-3 text-zinc-600">#{i + 1}</td>
                <td className="py-3 font-mono font-medium text-white">{a.symbol}</td>
                <td className={`py-3 text-right font-mono ${a.returns >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {pct(a.returns)}
                </td>
                <td className="py-3 text-right font-mono">{pct(a.volatility)}</td>
                <td className={`py-3 text-right font-mono font-bold ${a.sharpe > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {a.sharpe.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
