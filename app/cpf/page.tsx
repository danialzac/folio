"use client"

import { useState, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

// ENG: CPF contribution and allocation rates by age bracket (2024 rates)
// MAL: peratusan caruman CPF ikut umur — ini kadar rasmi 2024
// WHY: rates change at 55, 60, 65, 70 — must step through each bracket during projection
const CPF_BRACKETS = [
  { upTo: 55, employee: 0.20, employer: 0.17, oa: 0.23, sa: 0.06, ma: 0.08 },
  { upTo: 60, employee: 0.15, employer: 0.14, oa: 0.21, sa: 0.03, ma: 0.055 },
  { upTo: 65, employee: 0.095, employer: 0.11, oa: 0.165, sa: 0.015, ma: 0.025 },
  { upTo: 70, employee: 0.07, employer: 0.085, oa: 0.12, sa: 0.035, ma: 0.000 },
  { upTo: 999, employee: 0.05, employer: 0.075, oa: 0.09, sa: 0.015, ma: 0.02 },
]

// ENG: ordinary wage ceiling — CPF contributions only apply up to this monthly amount
// MAL: batas gaji biasa yang dikenakan caruman CPF — lebih dari ni tak kena
const OW_CEILING = 6800

// CPF interest rates (annual)
const INT_OA = 0.025
const INT_SA = 0.04
const INT_MA = 0.04

// CPF thresholds 2024
const BRS = 99400
const FRS = 198800
const ERS = 298200

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  return `$${Math.round(n).toLocaleString()}`
}

function bracket(age: number) {
  return CPF_BRACKETS.find(b => age < b.upTo) ?? CPF_BRACKETS[CPF_BRACKETS.length - 1]
}

export default function CpfPage() {
  const [age,        setAge]        = useState(28)
  const [salary,     setSalary]     = useState(4500)
  const [oaBal,      setOaBal]      = useState(12000)
  const [saBal,      setSaBal]      = useState(6000)
  const [maBal,      setMaBal]      = useState(4000)

  const projection = useMemo(() => {
    const rows = []
    let oa = oaBal, sa = saBal, ma = maBal

    for (let a = age; a <= 65; a++) {
      const b      = bracket(a)
      const wage   = Math.min(salary, OW_CEILING)
      const annualOa = wage * b.oa * 12
      const annualSa = wage * b.sa * 12
      const annualMa = wage * b.ma * 12

      // interest first, then contributions
      oa = oa * (1 + INT_OA) + annualOa
      sa = sa * (1 + INT_SA) + annualSa
      ma = ma * (1 + INT_MA) + annualMa

      rows.push({ age: a + 1, oa: Math.round(oa), sa: Math.round(sa), ma: Math.round(ma), total: Math.round(oa + sa + ma) })
    }
    return rows
  }, [age, salary, oaBal, saBal, maBal])

  const final     = projection[projection.length - 1] ?? { oa: 0, sa: 0, ma: 0, total: 0 }
  const retireSA  = final.sa
  const threshold = retireSA >= ERS ? "ERS" : retireSA >= FRS ? "FRS" : retireSA >= BRS ? "BRS" : "Below BRS"
  const thresholdColour = threshold === "ERS" || threshold === "FRS" ? "text-emerald-400" : threshold === "BRS" ? "text-amber-400" : "text-red-400"

  const frsHitAge = projection.find(r => r.sa >= FRS)?.age ?? null

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
  const labelClass = "text-xs text-zinc-500 uppercase tracking-widest mb-1 block"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">CPF Predictor</h1>
        <p className="text-sm text-zinc-500 mt-1">Project your OA, SA, and MA balances to retirement at 65</p>
      </div>

      {/* inputs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Current Age</label>
          <input type="number" className={inputClass} value={age} min={18} max={64}
            onChange={e => setAge(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Monthly Salary ($)</label>
          <input type="number" className={inputClass} value={salary} min={0}
            onChange={e => setSalary(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>OA Balance ($)</label>
          <input type="number" className={inputClass} value={oaBal} min={0}
            onChange={e => setOaBal(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>SA Balance ($)</label>
          <input type="number" className={inputClass} value={saBal} min={0}
            onChange={e => setSaBal(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>MA Balance ($)</label>
          <input type="number" className={inputClass} value={maBal} min={0}
            onChange={e => setMaBal(Number(e.target.value))} />
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">OA at 65</span>
          <p className="text-2xl font-bold text-white mt-1">{fmt(final.oa)}</p>
          <p className="text-xs text-zinc-500 mt-1">Ordinary Account</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">SA at 65</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{fmt(final.sa)}</p>
          <p className="text-xs text-zinc-500 mt-1">Special Account</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">MA at 65</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(final.ma)}</p>
          <p className="text-xs text-zinc-500 mt-1">MediSave Account</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Retirement Tier</span>
          <p className={`text-2xl font-bold mt-1 ${thresholdColour}`}>{threshold}</p>
          {frsHitAge && <p className="text-xs text-zinc-500 mt-1">FRS hit at age {frsHitAge}</p>}
        </div>
      </div>

      {/* chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest mb-6">Projected Balances</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={projection} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="age" tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={v => `${v}`} label={{ value: "Age", position: "insideBottom", offset: -2, fill: "#52525b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={v => fmt(v)} width={70} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
              labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
              formatter={(val, name) => [fmt(Number(val)), name === "oa" ? "OA" : name === "sa" ? "SA" : "MA"]}
              labelFormatter={v => `Age ${v}`}
            />
            <Area type="monotone" dataKey="ma" stackId="1" stroke="#10b981" fill="#10b98120" strokeWidth={1.5} />
            <Area type="monotone" dataKey="sa" stackId="1" stroke="#6366f1" fill="#6366f120" strokeWidth={1.5} />
            <Area type="monotone" dataKey="oa" stackId="1" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4 justify-center">
          {[["#f59e0b","OA"],["#6366f1","SA"],["#10b981","MA"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
              <span className="text-xs text-zinc-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* threshold reference */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest mb-4">CPF Retirement Sum Thresholds (2024)</h2>
        <div className="space-y-3">
          {[
            { label: "Basic Retirement Sum (BRS)",    amount: BRS, desc: "Provides basic monthly payouts" },
            { label: "Full Retirement Sum (FRS)",     amount: FRS, desc: "Provides standard monthly payouts" },
            { label: "Enhanced Retirement Sum (ERS)", amount: ERS, desc: "Provides higher monthly payouts" },
          ].map(({ label, amount, desc }) => {
            const pct = Math.min(100, (retireSA / amount) * 100)
            const hit = retireSA >= amount
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={hit ? "text-emerald-400" : "text-zinc-400"}>{label}</span>
                  <span className="text-zinc-500">{fmt(amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className={`h-2 rounded-full ${hit ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-zinc-600">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
