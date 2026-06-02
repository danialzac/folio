import { pct } from "@/lib/metrics"

interface Holding {
  symbol: string
  weight: number
  returns: number
  volatility: number
  sharpe: number
}

interface Props {
  holdings: Holding[]
  title?: string
}

// ENG: table of portfolio holdings — shows each asset with its key stats
// MAL: jadual pegang saham — tunjuk berat, return, risiko, dan sharpe tiap aset
// WHY: main data view on the dashboard, must match the optimal portfolio weights
export default function HoldingsTable({ holdings, title = "Holdings" }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
            <th className="px-5 py-3 text-left">Symbol</th>
            <th className="px-5 py-3 text-right">Weight</th>
            <th className="px-5 py-3 text-right">Return</th>
            <th className="px-5 py-3 text-right">Volatility</th>
            <th className="px-5 py-3 text-right">Sharpe</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => (
            <tr key={h.symbol} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${i === holdings.length - 1 ? "border-0" : ""}`}>
              <td className="px-5 py-3 font-mono font-medium text-white">{h.symbol}</td>
              <td className="px-5 py-3 text-right text-zinc-300">{pct(h.weight)}</td>
              <td className={`px-5 py-3 text-right font-medium ${h.returns >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {pct(h.returns)}
              </td>
              <td className="px-5 py-3 text-right text-zinc-400">{pct(h.volatility)}</td>
              <td className="px-5 py-3 text-right text-zinc-300">{h.sharpe.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
