import { NextResponse } from "next/server"

// ENG: FB was rebranded — Yahoo uses META, but we display it as FB to match our data
// MAL: FB dah tukar nama jadi META kat Yahoo, tapi kita simpan nama lama supaya match data
const SYMBOLS: { display: string; yahoo: string }[] = [
  { display: "AAPL",  yahoo: "AAPL" },
  { display: "FB",    yahoo: "META" },
  { display: "GOOGL", yahoo: "GOOGL" },
  { display: "MSFT",  yahoo: "MSFT" },
  { display: "PG",    yahoo: "PG" },
  { display: "SBUX",  yahoo: "SBUX" },
]

async function fetchStats(display: string, yahoo: string) {
  const now     = Math.floor(Date.now() / 1000)
  const oneYear = now - 365 * 24 * 60 * 60

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahoo}` +
    `?period1=${oneYear}&period2=${now}&interval=1d`

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next:    { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Yahoo fetch failed for ${yahoo}: ${res.status}`)

  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`No data for ${yahoo}`)

  // ENG: prefer adjClose (split/dividend adjusted) over raw close
  // MAL: guna harga yang dah adjust split dan dividen — lebih tepat untuk return tahunan
  const closes: number[] =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ??
    []

  if (closes.length < 2) throw new Error(`Insufficient data for ${yahoo}`)

  const dailyReturns: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] && closes[i - 1]) {
      dailyReturns.push(Math.log(closes[i] / closes[i - 1]))
    }
  }

  const n       = dailyReturns.length
  const mean    = dailyReturns.reduce((a, b) => a + b, 0) / n
  const variance = dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)

  // ENG: 252 = trading days in a year — standard annualisation factor
  // MAL: 252 hari dagangan setahun — cara standard dalam finance
  return {
    symbol:     display,
    returns:    mean * 252,
    volatility: Math.sqrt(variance * 252),
  }
}

export const revalidate = 3600

export async function GET() {
  try {
    const results = await Promise.all(
      SYMBOLS.map(({ display, yahoo }) => fetchStats(display, yahoo))
    )

    const stats: Record<string, { returns: number; volatility: number }> = {}
    for (const r of results) {
      stats[r.symbol] = { returns: r.returns, volatility: r.volatility }
    }

    return NextResponse.json({ stats, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error("price fetch failed:", err)
    return NextResponse.json({ error: "fetch failed" }, { status: 500 })
  }
}
