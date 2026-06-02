export type Strategy = "capm" | "momentum" | "crypto"

export interface PortfolioPoint {
  returns: number
  volatility: number
  weights: Record<string, number>
}

export interface OptimalPortfolio {
  point: PortfolioPoint
  type: "minVol" | "maxSharpe"
  sharpe: number
}

export interface StrategyMeta {
  id: Strategy
  label: string
  assets: string[]
  color: string
}

export const STRATEGIES: StrategyMeta[] = [
  { id: "capm",     label: "CAPM",        assets: ["AAPL","FB","GOOGL","MSFT","PG","SBUX"], color: "#6366f1" },
  { id: "momentum", label: "Momentum",    assets: ["AAPL","FB","GOOGL","MSFT","PG","SBUX"], color: "#10b981" },
  { id: "crypto",   label: "Crypto RSI",  assets: ["BTCUSD","ETHUSD"],                      color: "#f59e0b" },
]

// SGX Singapore Savings Bonds 10-year average
export const RISK_FREE_RATE = 0.0161
