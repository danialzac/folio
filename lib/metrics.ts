import { PortfolioPoint, OptimalPortfolio, RISK_FREE_RATE } from "@/types/portfolio"

// ENG: finds the portfolio with the lowest volatility in the dataset
// MAL: cari portfolio yang paling rendah risiko dari senarai
// WHY: this is the "safe" optimal point on the efficient frontier
export function findMinVol(points: PortfolioPoint[]): OptimalPortfolio {
  const point = points.reduce((min, p) => p.volatility < min.volatility ? p : min)
  return {
    point,
    type: "minVol",
    sharpe: (point.returns - RISK_FREE_RATE) / point.volatility,
  }
}

// ENG: finds the portfolio with the best risk-adjusted return (Sharpe ratio)
// MAL: cari portfolio yang paling bagus kalau kira return vs risiko
// WHY: this is the "sweet spot" — most return per unit of risk taken
export function findMaxSharpe(points: PortfolioPoint[]): OptimalPortfolio {
  const point = points.reduce((best, p) => {
    const s = (p.returns - RISK_FREE_RATE) / p.volatility
    const bestS = (best.returns - RISK_FREE_RATE) / best.volatility
    return s > bestS ? p : best
  })
  return {
    point,
    type: "maxSharpe",
    sharpe: (point.returns - RISK_FREE_RATE) / point.volatility,
  }
}

// ENG: format a decimal as a percentage string, e.g. 0.045 → "4.50%"
// MAL: tukar nombor jadi peratus yang senang baca
// WHY: all returns and volatility values are decimals, not percentages
export function pct(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + "%"
}

export function fmt(value: number, decimals = 4): string {
  return value.toFixed(decimals)
}

// ENG: score the portfolio 0-100 across four dimensions
// MAL: bagi markah portfolio dari 0-100 ikut empat faktor
// WHY: gives a single intuitive number a non-quant can understand at a glance
export function computeHealthScore(
  sharpe: number,
  returns: number,
  volatility: number,
  weights: Record<string, number>
): { total: number; factors: { label: string; score: number; max: number; status: "excellent" | "good" | "fair" | "poor" }[] } {
  const sharpeScore = sharpe >= 1.5 ? 35 : sharpe >= 1.0 ? 28 : sharpe >= 0.5 ? 18 : sharpe >= 0 ? 8 : 0
  const returnScore = returns >= 0.10 ? 25 : returns >= 0.05 ? 18 : returns >= 0 ? 10 : 0
  const volScore    = volatility <= 0.08 ? 20 : volatility <= 0.12 ? 15 : volatility <= 0.18 ? 8 : 2

  // ENG: Herfindahl index — lower means more diversified
  // MAL: HHI rendah = portfolio lebih seimbang, tak tertumpu kat satu aset je
  const hhi = Object.values(weights).reduce((a, w) => a + w * w, 0)
  const divScore = hhi <= 0.15 ? 20 : hhi <= 0.20 ? 15 : hhi <= 0.30 ? 10 : 5

  const status = (s: number, max: number): "excellent" | "good" | "fair" | "poor" => {
    const r = s / max
    return r >= 0.8 ? "excellent" : r >= 0.6 ? "good" : r >= 0.3 ? "fair" : "poor"
  }

  return {
    total: Math.min(100, sharpeScore + returnScore + volScore + divScore),
    factors: [
      { label: "Sharpe Quality",     score: sharpeScore, max: 35, status: status(sharpeScore, 35) },
      { label: "Return Strength",    score: returnScore, max: 25, status: status(returnScore, 25) },
      { label: "Volatility Control", score: volScore,    max: 20, status: status(volScore, 20) },
      { label: "Diversification",    score: divScore,    max: 20, status: status(divScore, 20) },
    ],
  }
}
