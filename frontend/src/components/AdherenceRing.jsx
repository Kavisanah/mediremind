import { useEffect, useState } from 'react'

/**
 * Circular SVG progress ring showing medicine adherence %.
 * Color shifts from coral (low) → amber (mid) → sage (high) via color theory.
 */
function AdherenceRing({ taken = 0, total = 0, size = 120 }) {
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0

  // Interpolate color: 0–50% coral, 50–80% amber, 80–100% sage
  const getColor = p => {
    if (p >= 80) return '#22c55e'   // sage
    if (p >= 50) return '#f59e0b'   // amber
    return '#ef4444'                // coral
  }

  const radius      = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)
  const color = getColor(pct)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (pct / 100) * circumference)
    }, 200)
    return () => clearTimeout(timer)
  }, [pct, circumference])

  const label = pct >= 80 ? 'Excellent' : pct >= 50 ? 'Good' : 'Needs care'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="drop-shadow-sm">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e7e5e4" strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring-circle"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ fontFamily: 'Sora,sans-serif', color }}>
            {pct}%
          </span>
          <span className="text-[10px] text-slate-300 font-medium mt-0.5">Adherence</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color }}>{label}</p>
        <p className="text-[10px] text-slate-300">{taken} of {total} taken</p>
      </div>
    </div>
  )
}

export default AdherenceRing




