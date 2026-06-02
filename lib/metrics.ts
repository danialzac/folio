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
