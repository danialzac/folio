"use client"

import { useState, useMemo } from "react"
import FrontierChart from "@/components/FrontierChart"
import MetricCard from "@/components/MetricCard"
import { findMinVol, findMaxSharpe, pct } from "@/lib/metrics"
import { Strategy, STRATEGIES, PortfolioPoint } from "@/types/portfolio"
import capmData     from "@/data/capm.json"
import momentumData from "@/data/momentum.json"
import cryptoData   from "@/data/crypto.json"

// ENG: maps strategy id to its pre-loaded data
// MAL: sambungkan nama strategi dengan data JSON dia
// WHY: switching tabs just swaps the reference, no re-fetch needed
const DATA_MAP: Record<Strategy, PortfolioPoint[]> = {
  capm:     capmData     as PortfolioPoint[],
  momentum: momentumData as PortfolioPoint[],
  crypto:   cryptoData   as PortfolioPoint[],
}

export default function FrontierPage() {
  const [active, setActive] = useState<Strategy>("capm")

  const strategy = STRATEGIES.find(s => s.id === active)!
  const points   = DATA_MAP[active]
  const minVol   = useMemo(() => findMinVol(points),   [points])
  const maxSharpe = useMemo(() => findMaxSharpe(points), [points])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Efficient Frontier</h1>
        <p className="text-sm text-zinc-500 mt-1">2,000 simulated portfolios per strategy</p>
      </div>

      {/* Strategy tabs */}
      <div className="flex gap-2">
        {STRATEGIES.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === s.id
                ? "text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
            style={active === s.id ? { backgroundColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <FrontierChart
          points={points}
          minVol={minVol}
          maxSharpe={maxSharpe}
          color={strategy.color}
        />
      </div>

      {/* Optimal portfolio callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Min Vol */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xl">★</span>
            <h2 className="font-semibold text-white">Minimum Volatility</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Return"     value={pct(minVol.point.returns)}    positive={minVol.point.returns >= 0} />
            <MetricCard label="Volatility" value={pct(minVol.point.volatility)} />
            <MetricCard label="Sharpe"     value={minVol.sharpe.toFixed(3)}     positive={minVol.sharpe > 1} />
          </div>
          <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-2">
            {Object.entries(minVol.point.weights).map(([sym, w]) => (
              <div key={sym} className="flex justify-between text-sm">
                <span className="font-mono text-zinc-400">{sym}</span>
                <span className="text-zinc-200">{pct(w)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Max Sharpe */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xl">★</span>
            <h2 className="font-semibold text-white">Max Sharpe Ratio</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Return"     value={pct(maxSharpe.point.returns)}    positive={maxSharpe.point.returns >= 0} />
            <MetricCard label="Volatility" value={pct(maxSharpe.point.volatility)} />
            <MetricCard label="Sharpe"     value={maxSharpe.sharpe.toFixed(3)}     positive={maxSharpe.sharpe > 1} />
          </div>
          <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-2">
            {Object.entries(maxSharpe.point.weights).map(([sym, w]) => (
              <div key={sym} className="flex justify-between text-sm">
                <span className="font-mono text-zinc-400">{sym}</span>
                <span className="text-zinc-200">{pct(w)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
