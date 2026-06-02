interface Props {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
}

// ENG: single stat card — shows one metric with label and optional colour signal
// MAL: kotak kecik untuk tunjuk satu angka penting
// WHY: reused on dashboard and strategy pages for all KPI callouts
export default function MetricCard({ label, value, sub, positive }: Props) {
  const colour =
    positive === true  ? "text-emerald-400" :
    positive === false ? "text-red-400"      :
                         "text-white"

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-1">
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-bold ${colour}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  )
}
