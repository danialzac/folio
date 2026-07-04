import { findMinVol, findMaxSharpe, pct, computeHealthScore } from "@/lib/metrics"
import { RISK_FREE_RATE } from "@/types/portfolio"
import MetricCard from "@/components/MetricCard"
import HoldingsTable from "@/components/HoldingsTable"
import PortfolioHealth from "@/components/PortfolioHealth"
import capmData from "@/data/capm.json"

// ENG: fallback stats if live fetch fails — keeps dashboard usable offline
// MAL: data backup kalau fetch harga gagal — dashboard tak rosak
// WHY: API can fail (rate limit, no internet) — hardcoded fallback prevents blank page
const FALLBACK_STATS: Record<string, { returns: number; volatility: number }> = {
  AAPL:  { returns:  0.094429, volatility: 0.108564 },
  FB:    { returns:  0.030680, volatility: 0.078412 },
  GOOGL: { returns: -0.013609, volatility: 0.106286 },
  MSFT:  { returns: -0.009967, volatility: 0.135513 },
  PG:    { returns:  0.044105, volatility: 0.041105 },
  SBUX:  { returns:  0.031732, volatility: 0.066192 },
}

async function getLiveStats(): Promise<{
  stats: Record<string, { returns: number; volatility: number }>
  updatedAt: string | null
  isLive: boolean
}> {
  try {
    // ENG: absolute URL needed for server-side fetch in Next.js
    // MAL: kena guna URL penuh sebab ini fetch dari server, bukan browser
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const res  = await fetch(`${base}/api/prices`, { next: { revalidate: 3600 } })

    if (!res.ok) throw new Error("bad response")

    const data = await res.json()
    return { stats: data.stats, updatedAt: data.updatedAt, isLive: true }
  } catch {
    return { stats: FALLBACK_STATS, updatedAt: null, isLive: false }
  }
}

const points = capmData as { returns: number; volatility: number; weights: Record<string, number> }[]
const minVol  = findMinVol(points)
const optimal = findMaxSharpe(points)

export default async function DashboardPage() {
  const { stats, updatedAt, isLive } = await getLiveStats()

  const holdings = Object.entries(optimal.point.weights).map(([symbol, weight]) => {
    const s      = stats[symbol] ?? { returns: 0, volatility: 0 }
    const sharpe = (s.returns - RISK_FREE_RATE) / s.volatility
    return { symbol, weight, ...s, sharpe }
  })

  const bestAsset  = holdings.reduce((a, b) => a.returns > b.returns ? a : b)
  const worstAsset = holdings.reduce((a, b) => a.returns < b.returns ? a : b)

  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString("en-SG", { timeZone: "Asia/Singapore", hour12: false })
    : null

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">CAPM strategy · Max Sharpe optimal portfolio</p>
        </div>
        <div className="text-right">
          {isLive && lastUpdated ? (
            <span className="text-xs text-emerald-400">Live · updated {lastUpdated} SGT</span>
          ) : (
            <span className="text-xs text-zinc-600">Using cached data</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Portfolio Return" value={pct(optimal.point.returns)} sub="annualised" positive={optimal.point.returns >= 0} />
        <MetricCard label="Volatility"       value={pct(optimal.point.volatility)} sub="annualised" />
        <MetricCard label="Sharpe Ratio"     value={optimal.sharpe.toFixed(3)} sub={`rf = ${pct(RISK_FREE_RATE)} SSB`} positive={optimal.sharpe > 1} />
        <MetricCard label="Min Vol Sharpe"   value={minVol.sharpe.toFixed(3)} sub={`vol: ${pct(minVol.point.volatility)}`} positive={minVol.sharpe > 1} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Best Performer"  value={bestAsset.symbol}  sub={pct(bestAsset.returns) + " return"}  positive />
        <MetricCard label="Worst Performer" value={worstAsset.symbol} sub={pct(worstAsset.returns) + " return"} positive={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <HoldingsTable holdings={holdings} title="Optimal Holdings (Max Sharpe · CAPM)" />
        </div>
        <PortfolioHealth {...computeHealthScore(optimal.sharpe, optimal.point.returns, optimal.point.volatility, optimal.point.weights)} />
      </div>
    </div>
  )
}
