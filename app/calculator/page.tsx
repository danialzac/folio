"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

// ENG: default rate pulled from max Sharpe CAPM portfolio (~5.7% net of risk-free)
// MAL: guna kadar return portfolio terbaik kita sebagai default
const DEFAULT_RATE = 5.7

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export default function CalculatorPage() {
  const [principal,    setPrincipal]    = useState(10000)
  const [monthly,      setMonthly]      = useState(500)
  const [annualRate,   setAnnualRate]   = useState(DEFAULT_RATE)
  const [years,        setYears]        = useState(10)

  const data = useMemo(() => {
    const r = annualRate / 100 / 12
    const points = []
    let balance = principal
    let contributed = principal

    for (let m = 1; m <= years * 12; m++) {
      balance = balance * (1 + r) + monthly
      contributed += monthly
      if (m % 12 === 0) {
        points.push({
          year:        m / 12,
          value:       Math.round(balance),
          contributed: Math.round(contributed),
          gains:       Math.round(balance - contributed),
        })
      }
    }
    return points
  }, [principal, monthly, annualRate, years])

  const final       = data[data.length - 1]
  const totalGains  = final?.gains ?? 0
  const totalValue  = final?.value ?? 0
  const contributed = final?.contributed ?? 0

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
  const labelClass = "text-xs text-zinc-500 uppercase tracking-widest mb-1 block"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Calculator</h1>
        <p className="text-sm text-zinc-500 mt-1">Project your portfolio growth over time</p>
      </div>

      {/* inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Starting Amount</label>
          <input type="number" className={inputClass} value={principal}
            onChange={e => setPrincipal(Number(e.target.value))} min={0} />
        </div>
        <div>
          <label className={labelClass}>Monthly Contribution</label>
          <input type="number" className={inputClass} value={monthly}
            onChange={e => setMonthly(Number(e.target.value))} min={0} />
        </div>
        <div>
          <label className={labelClass}>Annual Return (%)</label>
          <input type="number" className={inputClass} value={annualRate} step={0.1}
            onChange={e => setAnnualRate(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Years</label>
          <input type="number" className={inputClass} value={years}
            onChange={e => setYears(Math.max(1, Math.min(40, Number(e.target.value))))} min={1} max={40} />
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Final Value</span>
          <p className="text-2xl font-bold text-white mt-1">{fmt(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Total Contributed</span>
          <p className="text-2xl font-bold text-zinc-300 mt-1">{fmt(contributed)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Investment Gains</span>
          <p className={`text-2xl font-bold mt-1 ${totalGains >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(totalGains)}
          </p>
        </div>
      </div>

      {/* chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest mb-6">Growth Projection</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" tick={{ fill: "#71717a", fontSize: 11 }}
              tickFormatter={v => `Y${v}`} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }}
              tickFormatter={v => fmt(v)} width={64} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
              labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
              formatter={(val, name) => [
                fmt(Number(val)),
                name === "value" ? "Total Value" : name === "contributed" ? "Contributed" : "Gains"
              ]}
              labelFormatter={v => `Year ${v}`}
            />
            <Line type="monotone" dataKey="contributed" stroke="#52525b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="value"       stroke="#6366f1" strokeWidth={2}   dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-indigo-500" />
            <span className="text-xs text-zinc-500">Total Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-zinc-600 border-dashed" style={{borderTop: "2px dashed #52525b", height: 0}} />
            <span className="text-xs text-zinc-500">Contributed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
