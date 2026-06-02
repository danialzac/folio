"use client"

import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceDot, CartesianGrid
} from "recharts"
import { PortfolioPoint, OptimalPortfolio } from "@/types/portfolio"
import { pct } from "@/lib/metrics"

interface Props {
  points: PortfolioPoint[]
  minVol: OptimalPortfolio
  maxSharpe: OptimalPortfolio
  color: string
}

// ENG: efficient frontier scatter plot — each dot is one simulated portfolio
// MAL: graf titik-titik yang tunjuk semua kombinasi portfolio yang mungkin
// WHY: this is the core visual — shows the return/risk tradeoff curve
export default function FrontierChart({ points, minVol, maxSharpe, color }: Props) {
  const data = points.map(p => ({ x: p.volatility, y: p.returns }))

  return (
    <ResponsiveContainer width="100%" height={480}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="x"
          type="number"
          name="Volatility"
          tickFormatter={v => pct(v, 1)}
          tick={{ fill: "#71717a", fontSize: 11 }}
          label={{ value: "Volatility", position: "insideBottom", offset: -10, fill: "#71717a", fontSize: 12 }}
        />
        <YAxis
          dataKey="y"
          type="number"
          name="Return"
          tickFormatter={v => pct(v, 1)}
          tick={{ fill: "#71717a", fontSize: 11 }}
          label={{ value: "Return", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 shadow-xl">
                <div>Return: <span className="text-emerald-400 font-medium">{pct(d.y)}</span></div>
                <div>Volatility: <span className="text-white font-medium">{pct(d.x)}</span></div>
              </div>
            )
          }}
        />
        <Scatter data={data} fill={color} opacity={0.25} r={2} />

        {/* Red star = minimum volatility portfolio */}
        <ReferenceDot
          x={minVol.point.volatility}
          y={minVol.point.returns}
          r={8}
          fill="#ef4444"
          stroke="#fff"
          strokeWidth={1.5}
          label={{ value: "★", position: "top", fill: "#ef4444", fontSize: 16 }}
        />

        {/* Blue star = maximum Sharpe ratio portfolio */}
        <ReferenceDot
          x={maxSharpe.point.volatility}
          y={maxSharpe.point.returns}
          r={8}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={1.5}
          label={{ value: "★", position: "top", fill: "#3b82f6", fontSize: 16 }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
