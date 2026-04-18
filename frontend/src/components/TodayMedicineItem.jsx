import { useState } from 'react'

const statusConfig = {
  TAKEN:   { dot: 'taken',   label: 'Taken',   badge: 'badge-sage',  bg: 'bg-sage-950/40/60' },
  MISSED:  { dot: 'missed',  label: 'Missed',  badge: 'badge-coral', bg: 'bg-coral-950/40/40' },
  PENDING: { dot: 'pending', label: 'Pending', badge: 'badge-amber', bg: 'bg-amber-950/40/40' },
}

function TodayMedicineItem({ log, onMarkTaken }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const cfg = statusConfig[log.status] || statusConfig.PENDING
  const isPending = log.status === 'PENDING' || log.status === 'MISSED'

  const handleTaken = async () => {
    if (!isPending || loading || done) return
    setLoading(true)
    await onMarkTaken(log.id)
    setDone(true)
    setLoading(false)
  }

  return (
    <div className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300
                     animate-fade-in border ${log.status === 'TAKEN' ? 'border-sage-100' : 'border-slate-800'}
                     ${cfg.bg}`}>

      {/* Status dot */}
      <span className={`status-dot ${cfg.dot} mt-0.5 flex-shrink-0`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-200 truncate">{log.medicineName}</p>
          <span className={`badge ${cfg.badge} text-[10px]`}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {log.dosage && (
            <span className="text-xs text-slate-300">{log.dosage}</span>
          )}
          <span className="text-xs text-slate-300 font-mono">
            🕐 {log.scheduledTime?.slice(11, 16)}
          </span>
        </div>
      </div>

      {/* Action */}
      {isPending && !done && (
        <button onClick={handleTaken} disabled={loading}
          className="btn-primary btn btn-sm flex-shrink-0 animate-pulse-ring">
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : '✓ Taken'}
        </button>
      )}

      {(log.status === 'TAKEN' || done) && (
        <span className="text-lg animate-bounce-soft">✅</span>
      )}
    </div>
  )
}

export default TodayMedicineItem




