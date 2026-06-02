import { OptimalPortfolio, StrategyMeta } from "@/types/portfolio"
import { pct } from "@/lib/metrics"

interface Props {
  strategy: StrategyMeta
  minVol: OptimalPortfolio
  maxSharpe: OptimalPortfolio
}

// ENG: card showing one strategy's best portfolios side by side
// MAL: kad yang tunjuk dua portfolio terbaik untuk satu strategi
// WHY: strategy comparison page needs this to show all 3 strategies cleanly
export default function StrategyCard({ strategy, minVol, maxSharpe }: Props) {
  return (
    <div className="rounded-xl border bg-zinc-900 overflow-hidden" style={{ borderColor: strategy.color + "33" }}>
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strategy.color }} />
        <h3 className="font-semibold text-white">{strategy.label}</h3>
      </div>

      <div className="p-5 grid grid-cols-2 gap-4">
        {/* Min Volatility */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">★</span>
            <span className="text-xs text-zinc-400 uppercase tracking-widest">Min Volatility</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Return</span>
              <span className="text-emerald-400 font-medium">{pct(minVol.point.returns)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Volatility</span>
              <span className="text-zinc-300">{pct(minVol.point.volatility)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Sharpe</span>
              <span className="text-zinc-300">{minVol.sharpe.toFixed(3)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800 space-y-1">
            {Object.entries(minVol.point.weights).map(([sym, w]) => (
              <div key={sym} className="flex justify-between text-xs">
                <span className="font-mono text-zinc-400">{sym}</span>
                <span className="text-zinc-300">{pct(w)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Max Sharpe */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-lg">★</span>
            <span className="text-xs text-zinc-400 uppercase tracking-widest">Max Sharpe</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Return</span>
              <span className="text-emerald-400 font-medium">{pct(maxSharpe.point.returns)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Volatility</span>
              <span className="text-zinc-300">{pct(maxSharpe.point.volatility)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Sharpe</span>
              <span className="text-zinc-300">{maxSharpe.sharpe.toFixed(3)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800 space-y-1">
            {Object.entries(maxSharpe.point.weights).map(([sym, w]) => (
              <div key={sym} className="flex justify-between text-xs">
                <span className="font-mono text-zinc-400">{sym}</span>
                <span className="text-zinc-300">{pct(w)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
