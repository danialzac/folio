import { findMinVol, findMaxSharpe, pct } from "@/lib/metrics"
import { RISK_FREE_RATE } from "@/types/portfolio"
import MetricCard from "@/components/MetricCard"
import HoldingsTable from "@/components/HoldingsTable"
import capmData from "@/data/capm.json"

// ENG: compute optimal CAPM portfolio to use as dashboard holdings baseline
// MAL: kira portfolio CAPM terbaik untuk jadikan asas dashboard
// WHY: dashboard needs a "current" portfolio snapshot — we use max Sharpe as default
const points = capmData as { returns: number; volatility: number; weights: Record<string, number> }[]
const minVol  = findMinVol(points)
const optimal = findMaxSharpe(points)

const ASSET_STATS: Record<string, { returns: number; volatility: number }> = {
  AAPL:  { returns:  0.094429, volatility: 0.108564 },
  FB:    { returns:  0.030680, volatility: 0.078412 },
  GOOGL: { returns: -0.013609, volatility: 0.106286 },
  MSFT:  { returns: -0.009967, volatility: 0.135513 },
  PG:    { returns:  0.044105, volatility: 0.041105 },
  SBUX:  { returns:  0.031732, volatility: 0.066192 },
}

const holdings = Object.entries(optimal.point.weights).map(([symbol, weight]) => {
  const stats = ASSET_STATS[symbol] ?? { returns: 0, volatility: 0 }
  const sharpe = (stats.returns - RISK_FREE_RATE) / stats.volatility
  return { symbol, weight, ...stats, sharpe }
})

const bestAsset  = holdings.reduce((a, b) => a.returns > b.returns ? a : b)
const worstAsset = holdings.reduce((a, b) => a.returns < b.returns ? a : b)

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">CAPM strategy · Max Sharpe optimal portfolio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Portfolio Return" value={pct(optimal.point.returns)} sub="annualised" positive={optimal.point.returns >= 0} />
        <MetricCard label="Volatility" value={pct(optimal.point.volatility)} sub="annualised" />
        <MetricCard label="Sharpe Ratio" value={optimal.sharpe.toFixed(3)} sub={`rf = ${pct(RISK_FREE_RATE)} SSB`} positive={optimal.sharpe > 1} />
        <MetricCard label="Min Vol Sharpe" value={minVol.sharpe.toFixed(3)} sub={`vol: ${pct(minVol.point.volatility)}`} positive={minVol.sharpe > 1} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Best Performer" value={bestAsset.symbol} sub={pct(bestAsset.returns) + " return"} positive />
        <MetricCard label="Worst Performer" value={worstAsset.symbol} sub={pct(worstAsset.returns) + " return"} positive={false} />
      </div>

      <HoldingsTable holdings={holdings} title="Optimal Holdings (Max Sharpe · CAPM)" />
    </div>
  )
}
