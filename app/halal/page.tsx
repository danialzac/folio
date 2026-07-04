"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

// ENG: Murabaha = bank buys asset, sells to you at cost + fixed profit margin
// ENG: Diminishing Musharakah = co-ownership; you buy bank's share progressively
// MAL: dua kontrak halal utama — tiada riba, semua kos dah tetapkan dari awal
// WHY: Islamic finance prohibits riba (interest) — profit is permissible but must be fixed upfront

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function monthlyConventional(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export default function HalalPage() {
  const [assetPrice,    setAssetPrice]    = useState(450000)
  const [downPct,       setDownPct]       = useState(20)
  const [tenureYears,   setTenureYears]   = useState(25)
  const [profitRate,    setProfitRate]    = useState(3.8)   // Murabaha profit rate (%)
  const [convRate,      setConvRate]      = useState(3.8)   // conventional interest rate (%)
  const [mode,          setMode]          = useState<"murabaha" | "musharakah">("murabaha")

  const principal  = assetPrice * (1 - downPct / 100)
  const months     = tenureYears * 12
  const downAmount = assetPrice * (downPct / 100)

  // ENG: Murabaha — total cost is fixed on day 1: cost price + agreed profit margin
  // MAL: harga jual dah tetap dari awal — tak akan naik walaupun market rate berubah
  const murabahaProfit  = principal * (profitRate / 100) * tenureYears
  const murabahaTotal   = principal + murabahaProfit
  const murabahaMonthly = murabahaTotal / months

  // ENG: Diminishing Musharakah — bank owns share, you pay rent + buyout each month
  // MAL: bank dan kau sama-sama pegang rumah tu. setiap bulan kau beli bahagian bank sikit-sikit
  const musharakahData = useMemo(() => {
    const r = (profitRate / 100) / 12
    let bankShare = principal
    const rows = []
    for (let m = 1; m <= months; m++) {
      const rent     = bankShare * r                       // rental on bank's share
      const buyout   = principal / months                  // fixed monthly buyout
      const payment  = rent + buyout
      bankShare     -= buyout
      if (m % 12 === 0 || m === months) {
        rows.push({ month: m, bankShare: Math.round(bankShare), payment: Math.round(payment) })
      }
    }
    return rows
  }, [principal, profitRate, months])

  const musharakahMonthlyStart = musharakahData[0]?.payment ?? 0
  const musharakahMonthlyEnd   = musharakahData[musharakahData.length - 1]?.payment ?? 0
  const musharakahTotalCost    = useMemo(() => {
    const r = (profitRate / 100) / 12
    let bankShare = principal, total = 0
    for (let m = 0; m < months; m++) {
      const rent    = bankShare * r
      const buyout  = principal / months
      total        += rent + buyout
      bankShare    -= buyout
    }
    return total
  }, [principal, profitRate, months])

  // conventional comparison
  const convMonthly = monthlyConventional(principal, convRate / 100, months)
  const convTotal   = convMonthly * months
  const convInt     = convTotal - principal

  const activeTotal   = mode === "murabaha" ? murabahaTotal   : musharakahTotalCost
  const activeMonthly = mode === "murabaha" ? murabahaMonthly : musharakahMonthlyStart
  const activeProfit  = mode === "murabaha" ? murabahaProfit  : musharakahTotalCost - principal
  const savings       = convTotal - activeTotal

  // comparison chart
  const chartData = useMemo(() => {
    const rows = []
    let convBal = principal, halalBal = principal
    const r    = (convRate / 100) / 12
    let bankSh = principal

    for (let yr = 1; yr <= tenureYears; yr++) {
      for (let m = 0; m < 12; m++) {
        // conventional: reducing balance
        const intM  = convBal * r
        const prinM = Math.min(convMonthly - intM, convBal)
        convBal    -= prinM

        // murabaha: straight-line reduction (fixed payment)
        halalBal = Math.max(0, principal - (principal / months) * (yr * 12 + m))
        // musharakah: bank share reduces
        bankSh   -= principal / months
      }
      rows.push({
        year: yr,
        conventional: Math.round(Math.max(0, convBal)),
        halal:         Math.round(Math.max(0, mode === "murabaha" ? halalBal : Math.max(0, bankSh))),
      })
    }
    return rows
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal, convRate, profitRate, convMonthly, months, tenureYears, mode])


  const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
  const labelClass = "text-xs text-zinc-500 uppercase tracking-widest mb-1 block"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Islamic Finance Calculator</h1>
        <p className="text-sm text-zinc-500 mt-1">Murabaha &amp; Diminishing Musharakah vs conventional loan</p>
      </div>

      {/* mode toggle */}
      <div className="flex gap-3">
        {([["murabaha","Murabaha"],["musharakah","Diminishing Musharakah"]] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* explainer */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400 leading-relaxed">
        {mode === "murabaha" ? (
          <p><span className="text-emerald-400 font-medium">Murabaha:</span> The bank purchases the property at cost price and sells it to you at a pre-agreed higher price (cost + profit). The total amount you pay is fixed on day one — it does not change if market rates rise or fall. No riba (interest). The profit is the bank&apos;s compensation for taking ownership risk.</p>
        ) : (
          <p><span className="text-emerald-400 font-medium">Diminishing Musharakah:</span> You and the bank co-own the property. You pay monthly rent on the bank&apos;s share, plus a fixed buyout amount. As you buy out the bank&apos;s share, your rental decreases each month. Fully Shariah-compliant — no interest, co-ownership transfers gradually to you.</p>
        )}
      </div>

      {/* inputs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Asset Price ($)</label>
          <input type="number" className={inputClass} value={assetPrice} min={50000} step={10000}
            onChange={e => setAssetPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Downpayment ({downPct}%)</label>
          <input type="range" className="w-full accent-emerald-500 mt-2" value={downPct} min={20} max={80}
            onChange={e => setDownPct(Number(e.target.value))} />
          <span className="text-xs text-zinc-400">{fmt(downAmount)}</span>
        </div>
        <div>
          <label className={labelClass}>Tenure (years)</label>
          <input type="number" className={inputClass} value={tenureYears} min={5} max={35}
            onChange={e => setTenureYears(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Halal Profit Rate (%)</label>
          <input type="number" className={inputClass} value={profitRate} min={0.5} max={15} step={0.1}
            onChange={e => setProfitRate(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Conventional Rate (%)</label>
          <input type="number" className={inputClass} value={convRate} min={0.5} max={15} step={0.1}
            onChange={e => setConvRate(Number(e.target.value))} />
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-5">
          <span className="text-xs text-emerald-600 uppercase tracking-widest">Halal Monthly</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(activeMonthly)}</p>
          {mode === "musharakah" && <p className="text-xs text-zinc-500 mt-1">starts at, decreases monthly</p>}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Conventional Monthly</span>
          <p className="text-2xl font-bold text-zinc-300 mt-1">{fmt(convMonthly)}</p>
          <p className="text-xs text-zinc-500 mt-1">fixed over tenure</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Halal Total Cost</span>
          <p className="text-2xl font-bold text-white mt-1">{fmt(activeTotal + downAmount)}</p>
          <p className="text-xs text-zinc-500 mt-1">profit: {fmt(activeProfit)}</p>
        </div>
        <div className={`rounded-xl border p-5 ${savings >= 0 ? "border-emerald-800/40 bg-emerald-950/20" : "border-red-800/40 bg-red-950/20"}`}>
          <span className={`text-xs uppercase tracking-widest ${savings >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {savings >= 0 ? "Halal Saves" : "Halal Costs More"}
          </span>
          <p className={`text-2xl font-bold mt-1 ${savings >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(Math.abs(savings))}
          </p>
          <p className="text-xs text-zinc-500 mt-1">vs conventional over {tenureYears}yr</p>
        </div>
      </div>

      {/* side by side breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-800/40 bg-zinc-900 p-5 space-y-3">
          <h3 className="text-sm font-medium text-emerald-400">{mode === "murabaha" ? "Murabaha" : "Diminishing Musharakah"}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Financing Amount</span><span className="text-white font-mono">{fmt(principal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Profit Rate</span><span className="text-white font-mono">{profitRate}% p.a.</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Total Profit</span><span className="text-emerald-400 font-mono">{fmt(activeProfit)}</span></div>
            <div className="flex justify-between border-t border-zinc-800 pt-2"><span className="text-zinc-400">Total Payable</span><span className="text-white font-bold font-mono">{fmt(activeTotal)}</span></div>
            {mode === "musharakah" && (
              <div className="flex justify-between text-xs"><span className="text-zinc-600">Monthly reduces from</span><span className="text-zinc-400 font-mono">{fmt(musharakahMonthlyStart)} → {fmt(musharakahMonthlyEnd)}</span></div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">Conventional Loan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Loan Amount</span><span className="text-white font-mono">{fmt(principal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Interest Rate</span><span className="text-white font-mono">{convRate}% p.a.</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Total Interest</span><span className="text-amber-400 font-mono">{fmt(convInt)}</span></div>
            <div className="flex justify-between border-t border-zinc-800 pt-2"><span className="text-zinc-400">Total Payable</span><span className="text-white font-bold font-mono">{fmt(convTotal)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-zinc-600">Interest compounds monthly</span><span className="text-zinc-400 font-mono">reducing balance</span></div>
          </div>
        </div>
      </div>

      {/* outstanding balance chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm text-zinc-400 uppercase tracking-widest mb-6">Outstanding Balance Over Time</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="year" tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={v => `Y${v}`} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={60} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
              formatter={(val, name) => [fmt(Number(val)), name === "halal" ? (mode === "murabaha" ? "Murabaha" : "Musharakah") : "Conventional"]}
              labelFormatter={v => `Year ${v}`}
            />
            <Line type="monotone" dataKey="halal"         stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="conventional"  stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-emerald-500" /><span className="text-xs text-zinc-500">{mode === "murabaha" ? "Murabaha" : "Musharakah"} balance</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-amber-500 border-dashed" style={{borderTop:"2px dashed #f59e0b",height:0}} /><span className="text-xs text-zinc-500">Conventional balance</span></div>
        </div>
      </div>
    </div>
  )
}
