"use client"

import { useState } from "react"
import { pct } from "@/lib/metrics"
import { RISK_FREE_RATE } from "@/types/portfolio"

const SYMBOLS = ["AAPL", "FB", "GOOGL", "MSFT", "PG", "SBUX"]

// ENG: pulled at module level so the page still works without a server fetch
// MAL: data statik sebagai backup, bukan sebagai ciri utama
// WHY: compare page is client-only (needs useState) — can't do async server fetch here
const STATIC_STATS: Record<string, { returns: number; volatility: number }> = {
  AAPL:  { returns:  0.094429, volatility: 0.108564 },
  FB:    { returns:  0.030680, volatility: 0.078412 },
  GOOGL: { returns: -0.013609, volatility: 0.106286 },
  MSFT:  { returns: -0.009967, volatility: 0.135513 },
  PG:    { returns:  0.044105, volatility: 0.041105 },
  SBUX:  { returns:  0.031732, volatility: 0.066192 },
}

function StatRow({ label, a, b, higherIsBetter = true }: {
  label: string
  a: number
  b: number
  higherIsBetter?: boolean
}) {
  const aWins = higherIsBetter ? a > b : a < b
  const bWins = higherIsBetter ? b > a : b < a

  return (
    <div className="grid grid-cols-3 items-center py-4 border-b border-zinc-800 last:border-0">
      <span className={`text-sm font-mono font-bold text-right pr-4 ${aWins ? "text-emerald-400" : "text-zinc-400"}`}>
        {pct(a)}
      </span>
      <span className="text-xs text-zinc-500 uppercase tracking-widest text-center">{label}</span>
      <span className={`text-sm font-mono font-bold text-left pl-4 ${bWins ? "text-emerald-400" : "text-zinc-400"}`}>
        {pct(b)}
      </span>
    </div>
  )
}

export default function ComparePage() {
  const [symA, setSymA] = useState("AAPL")
  const [symB, setSymB] = useState("MSFT")
  const [stats, setStats] = useState(STATIC_STATS)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loadLive() {
    setLoading(true)
    try {
      const res = await fetch("/api/prices")
      const data = await res.json()
      setStats(data.stats)
      setIsLive(true)
    } catch {
      // keep static
    } finally {
      setLoading(false)
    }
  }

  // ENG: fetch live on first render
  // MAL: ambil data terkini bila page mula load
  if (!isLive && !loading) loadLive()

  const a = { symbol: symA, ...stats[symA], sharpe: (stats[symA].returns - RISK_FREE_RATE) / stats[symA].volatility }
  const b = { symbol: symB, ...stats[symB], sharpe: (stats[symB].returns - RISK_FREE_RATE) / stats[symB].volatility }

  const selectClass = "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500"

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compare</h1>
          <p className="text-sm text-zinc-500 mt-1">Head-to-head asset comparison</p>
        </div>
        {isLive && <span className="text-xs text-emerald-400">Live data</span>}
      </div>

      {/* pickers */}
      <div className="flex items-center gap-6">
        <select className={selectClass} value={symA} onChange={e => setSymA(e.target.value)}>
          {SYMBOLS.filter(s => s !== symB).map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-zinc-600 text-sm">vs</span>
        <select className={selectClass} value={symB} onChange={e => setSymB(e.target.value)}>
          {SYMBOLS.filter(s => s !== symA).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* comparison panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        {/* headers */}
        <div className="grid grid-cols-3 mb-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-indigo-400">{symA}</span>
          </div>
          <div />
          <div className="text-center">
            <span className="text-2xl font-bold text-emerald-400">{symB}</span>
          </div>
        </div>

        <StatRow label="Annual Return"   a={a.returns}    b={b.returns}    higherIsBetter />
        <StatRow label="Volatility"      a={a.volatility} b={b.volatility} higherIsBetter={false} />

        {/* sharpe — manual because it's not a pct */}
        <div className="grid grid-cols-3 items-center py-4 border-b border-zinc-800">
          <span className={`text-sm font-mono font-bold text-right pr-4 ${a.sharpe > b.sharpe ? "text-emerald-400" : "text-zinc-400"}`}>
            {a.sharpe.toFixed(3)}
          </span>
          <span className="text-xs text-zinc-500 uppercase tracking-widest text-center">Sharpe Ratio</span>
          <span className={`text-sm font-mono font-bold text-left pl-4 ${b.sharpe > a.sharpe ? "text-emerald-400" : "text-zinc-400"}`}>
            {b.sharpe.toFixed(3)}
          </span>
        </div>

        {/* verdict */}
        <div className="mt-6 pt-4">
          {(() => {
            const aScore = (a.sharpe > b.sharpe ? 1 : 0) + (a.returns > b.returns ? 1 : 0) + (a.volatility < b.volatility ? 1 : 0)
            const winner = aScore >= 2 ? symA : symB
            const winnerColour = aScore >= 2 ? "text-indigo-400" : "text-emerald-400"
            return (
              <p className="text-sm text-zinc-400 text-center">
                On a risk-adjusted basis, <span className={`font-bold ${winnerColour}`}>{winner}</span> wins {aScore >= 2 ? aScore : 3 - aScore}/3 metrics.
              </p>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
