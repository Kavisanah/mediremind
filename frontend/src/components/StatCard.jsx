import { useEffect, useRef, useState } from 'react'

const colorMap = {
  primary:  { bg: 'bg-primary-950/40',  ring: 'ring-primary-100',  text: 'text-primary-400',  icon: 'bg-primary-900/50' },
  sage:     { bg: 'bg-sage-950/40',     ring: 'ring-sage-100',     text: 'text-sage-400',     icon: 'bg-sage-900/50' },
  coral:    { bg: 'bg-coral-950/40',    ring: 'ring-coral-100',    text: 'text-coral-400',    icon: 'bg-coral-900/50' },
  amber:    { bg: 'bg-amber-950/40',    ring: 'ring-amber-100',    text: 'text-amber-400',    icon: 'bg-amber-900/50' },
  lavender: { bg: 'bg-lavender-50', ring: 'ring-lavender-100', text: 'text-lavender-700', icon: 'bg-lavender-100' },
}

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start   = performance.now()
    const animate = now => {
      const progress = Math.min((now - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)  // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}

function StatCard({ title, value = 0, icon, color = 'primary', subtitle, trend }) {
  const theme    = colorMap[color] || colorMap.primary
  const displayed = useCountUp(value)

  return (
    <div className={`stat-card ring-1 ${theme.ring} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${theme.icon} flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${trend >= 0 ? 'bg-sage-950/40 text-sage-400' : 'bg-coral-950/40 text-coral-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className={`text-3xl font-bold ${theme.text} mb-0.5`}
         style={{ fontFamily: 'Sora, sans-serif' }}>
        {displayed}
      </p>

      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{title}</p>

      {subtitle && (
        <p className="text-xs text-slate-300 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default StatCard




