"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

// ENG: HDB concessionary rate is always 0.1% above CPF OA rate (2.5%)
// MAL: kadar pinjaman HDB sentiasa 0.1% lebih dari kadar CPF OA — peraturan kerajaan
const HDB_RATE    = 0.026
function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function monthlyPayment(principal: number, annualRate: number, months: number) {
  if (annualRate === 0) return principal / months
  const r = annualRate / 12
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export default function HdbPage() {
  const [flatPrice,    setFlatPrice]    = useState(450000)
  const [downPct,      setDownPct]      = useState(20)
  const [loanType,     setLoanType]     = useState<"hdb" | "bank">("hdb")
  const [bankRate,     setBankRate]     = useState(3.8)
  const [tenureYears,  setTenureYears]  = useState(25)

  const rate    = loanType === "hdb" ? HDB_RATE : bankRate / 100
  const minDown = loanType === "bank" ? 25 : 20

  const downAmount  = flatPrice * (downPct / 100)
  const loanAmount  = flatPrice - downAmount
  const months      = tenureYears * 12
  const monthly     = monthlyPayment(loanAmount, rate, months)
  const totalPaid   = monthly * months
  const totalInt    = totalPaid - loanAmount

  // ENG: build yearly principal vs interest breakdown for the bar chart
  // MAL: kira berapa setahun pergi ke pokok vs faedah — tunjuk dalam carta
  const chartData = useMemo(() => {
    const r = rate / 12
    let balance = loanAmount
    const data = []
    for (let yr = 1; yr <= tenureYears; yr++) {
      let prinYear = 0, intYear = 0
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break
        const intMonth = balance * r
        const prinMonth = Math.min(monthly - intMonth, balance)
        intYear  += intMonth
        prinYear += prinMonth
        balance  -= prinMonth
      }
      data.push({ year: `Y${yr}`, principal: Math.round(prinYear), interest: Math.round(intYear) })
    }
    return data
  }, [loanAmount, rate, monthly, tenureYears])

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
  const labelClass = "text-xs text-zinc-500 uppercase tracking-widest mb-1 block"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">HDB Loan Calculator</h1>
        <p className="text-sm text-zinc-500 mt-1">Compare HDB concessionary loan vs bank loan</p>
      </div>

      {/* loan type toggle */}
      <div className="flex gap-3">
        {(["hdb","bank"] as const).map(t => (
          <button key={t} onClick={() => setLoanType(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              loanType === t ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}>
            {t === "hdb" ? `HDB Loan (${(HDB_RATE*100).toFixed(1)}% p.a.)` : "Bank Loan"}
          </button>
        ))}
      </div>

      {/* inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Flat Price ($)</label>
          <input type="number" className={inputClass} value={flatPrice} min={100000} step={10000}
            onChange={e => setFlatPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Downpayment ({downPct}%) — min {minDown}%</label>
          <input type="range" className="w-full accent-indigo-500" value={downPct} min={minDown} max={90} step={1}
            onChange={e => setDownPct(Number(e.target.value))} />
          <span className="text-xs text-zinc-400">{fmt(downAmount)}</span>
        </div>
        <div>
          <label className={labelClass}>Loan Tenure (years)</label>
          <input type="number" className={inputClass} value={tenureYears} min={5} max={loanType === "hdb" ? 25 : 30}
            onChange={e => setTenureYears(Number(e.target.value))} />
        </div>
        {loanType === "bank" && (
          <div>
            <label className={labelClass}>Bank Rate (% p.a.)</label>
            <input type="number" className={inputClass} value={bankRate} min={1} max={10} step={0.1}
              onChange={e => setBankRate(Number(e.target.value))} />
          </div>
        )}
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Loan Amount</span>
          <p className="text-2xl font-bold text-white mt-1">{fmt(loanAmount)}</p>
          <p className="text-xs text-zinc-500 mt-1">{(100 - downPct)}% LTV · {loanType === "hdb" ? "max 80%" : "max 75%"}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Monthly Payment</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{fmt(monthly)}</p>
          <p className="text-xs text-zinc-500 mt-1">over {tenureYears} years</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Total Interest</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{fmt(totalInt)}</p>
          <p className="text-xs text-zinc-500 mt-1">{((totalInt / loanAmount) * 100).toFixed(1)}% of principal</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Total Cost</span>
          <p className="text-2xl font-bold text-white mt-1">{fmt(totalPaid + downAmount)}</p>
          <p className="text-xs text-zinc-500 mt-1">incl. downpayment</p>
        </div>
      </div>

      {/* HDB vs bank quick compare */}
      {loanType === "bank" && (() => {
        const hdbMonthly = monthlyPayment(flatPrice * 0.80, HDB_RATE, 25 * 12)
        const hdbTotal   = hdbMonthly * 25 * 12 + flatPrice * 0.20
        const bankTotal  = totalPaid + downAmount
        const diff       = bankTotal - hdbTotal
        return (
          <div className="rounded-xl border border-amber-800/40 bg-amber-950/30 p-5">
            <p className="text-sm text-amber-400 font-medium">HDB vs Bank Comparison</p>
            <p className="text-xs text-zinc-400 mt-1">
              HDB loan (80% LTV, 25yr): <span className="text-white font-mono">{fmt(hdbMonthly)}/mo</span> · Total {fmt(hdbTotal)}<br />
              Your bank loan: <span className="text-white font-mono">{fmt(monthly)}/mo</span> · Total {fmt(bankTotal)}<br />
              <span className={diff > 0 ? "text-amber-400" : "text-emerald-400"}>
                {diff > 0 ? `Bank costs ${fmt(diff)} more overall` : `Bank saves ${fmt(Math.abs(diff))} overall`}
              </span>
            </p>
          </div>
        )
      })()}

      {/* amortisation chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest mb-6">Annual Principal vs Interest</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={52} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
              formatter={(val, name) => [fmt(Number(val)), name === "principal" ? "Principal" : "Interest"]}
            />
            <Bar dataKey="principal" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
            <Bar dataKey="interest"  stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-indigo-500" /><span className="text-xs text-zinc-500">Principal</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500" /><span className="text-xs text-zinc-500">Interest</span></div>
        </div>
      </div>
    </div>
  )
}
