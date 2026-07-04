"use client"

import { useEffect, useState } from "react"

type Factor = {
  label: string
  score: number
  max: number
  status: "excellent" | "good" | "fair" | "poor"
}

interface Props {
  total: number
  factors: Factor[]
}

const GAUGE_W   = 180
const GAUGE_H   = 110
const ARC_R     = 70
const ARC_CX    = GAUGE_W / 2
const ARC_CY    = 95
const STROKE    = 12
const HALF_CIRC = Math.PI * ARC_R

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a1 = { x: cx + r * Math.cos((start * Math.PI) / 180), y: cy + r * Math.sin((start * Math.PI) / 180) }
  const a2 = { x: cx + r * Math.cos((end   * Math.PI) / 180), y: cy + r * Math.sin((end   * Math.PI) / 180) }
  return `M ${a1.x} ${a1.y} A ${r} ${r} 0 0 1 ${a2.x} ${a2.y}`
}

function scoreColour(total: number) {
  if (total >= 80) return { stroke: "#10b981", text: "text-emerald-400", label: "Excellent" }
  if (total >= 60) return { stroke: "#6366f1", text: "text-indigo-400",  label: "Good" }
  if (total >= 40) return { stroke: "#f59e0b", text: "text-amber-400",   label: "Fair" }
  return                  { stroke: "#ef4444", text: "text-red-400",     label: "Needs Work" }
}

function statusDot(s: Factor["status"]) {
  return s === "excellent" ? "bg-emerald-400" : s === "good" ? "bg-indigo-400" : s === "fair" ? "bg-amber-400" : "bg-red-400"
}

// ENG: animated counter that counts up from 0 to target on mount
// MAL: nombor naik sikit-sikit bila page load — nampak lebih hidup
// WHY: pure CSS can't do counting — need requestAnimationFrame in a client component
function Counter({ target }: { target: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const dur   = 1200
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setN(Math.round(e * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return <>{n}</>
}

export default function PortfolioHealth({ total, factors }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const col      = scoreColour(total)
  const trackPath = arcPath(ARC_CX, ARC_CY, ARC_R, -180, 0)

  // ENG: dashoffset starts at HALF_CIRC (empty), transitions to scoreGap on mount
  // MAL: gauge mula kosong, pastu animate isi sendiri — CSS transition buat kerja
  const scoreGap  = HALF_CIRC - (total / 100) * HALF_CIRC
  const offset    = mounted ? scoreGap : HALF_CIRC

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400 uppercase tracking-widest">Portfolio Health</span>
        <span className={`text-xs font-medium ${col.text}`}>{col.label}</span>
      </div>

      {/* gauge */}
      <div className="relative flex justify-center">
        <svg width={GAUGE_W} height={GAUGE_H} viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`} className="overflow-visible">
          {/* track */}
          <path d={trackPath} fill="none" stroke="#27272a" strokeWidth={STROKE} strokeLinecap="round" />
          {/* filled arc */}
          <path
            d={trackPath}
            fill="none"
            stroke={col.stroke}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={HALF_CIRC}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${col.stroke}88)` }}
          />
          {/* scale labels */}
          <text x={ARC_CX - ARC_R - 2} y={ARC_CY + 14} textAnchor="middle" fontSize="9" fill="#52525b">0</text>
          <text x={ARC_CX}             y={ARC_CY - ARC_R - 6} textAnchor="middle" fontSize="9" fill="#52525b">50</text>
          <text x={ARC_CX + ARC_R + 2} y={ARC_CY + 14} textAnchor="middle" fontSize="9" fill="#52525b">100</text>
        </svg>
        {/* centre score */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-3xl font-bold tabular-nums ${col.text}`}>
            <Counter target={total} />
          </span>
          <span className="text-xs text-zinc-500">/100</span>
        </div>
      </div>

      {/* factor bars */}
      <div className="space-y-2.5">
        {factors.map((f, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot(f.status)}`} />
                {f.label}
              </span>
              <span className="text-zinc-500 tabular-nums">{f.score}/{f.max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${statusDot(f.status)}`}
                style={{ width: mounted ? `${(f.score / f.max) * 100}%` : "0%", transitionDelay: `${i * 80 + 400}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
