import { findMinVol, findMaxSharpe } from "@/lib/metrics"
import { STRATEGIES, PortfolioPoint } from "@/types/portfolio"
import StrategyCard from "@/components/StrategyCard"
import capmData     from "@/data/capm.json"
import momentumData from "@/data/momentum.json"
import cryptoData   from "@/data/crypto.json"

// ENG: load all strategy data at build time — no client JS needed for this page
// MAL: load semua data masa build — page ni tak perlukan JavaScript kat browser
// WHY: server component = faster load, no hydration cost for a static comparison view
const DATA_MAP = {
  capm:     capmData     as PortfolioPoint[],
  momentum: momentumData as PortfolioPoint[],
  crypto:   cryptoData   as PortfolioPoint[],
}

export default function StrategiesPage() {
  const strategies = STRATEGIES.map(s => ({
    strategy: s,
    minVol:   findMinVol(DATA_MAP[s.id]),
    maxSharpe: findMaxSharpe(DATA_MAP[s.id]),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Strategy Comparison</h1>
        <p className="text-sm text-zinc-500 mt-1">
          CAPM · Momentum MPT · Crypto RSI — optimal portfolios side by side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map(({ strategy, minVol, maxSharpe }) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            minVol={minVol}
            maxSharpe={maxSharpe}
          />
        ))}
      </div>
    </div>
  )
}
