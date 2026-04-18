import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDateTime } from '../utils/helpers'
import api from '../api/axios'

function MedicineHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/logs/history?from=${from}&to=${to}`)
      setLogs(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const taken = logs.filter(l => l.status === 'TAKEN').length
  const missed = logs.filter(l => l.status === 'MISSED').length
  const rate = logs.length > 0 ? Math.round((taken / logs.length) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 bg-primary-200/30 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight mb-8">Medicine History</h1>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field" />
            </div>
            <button onClick={fetchLogs} className="btn-primary">Search</button>
          </div>
        </div>

        {/* Stats */}
        {!loading && logs.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-2xl font-bold text-sage-400">{taken}</p>
              <p className="text-sm text-slate-300 mt-1">Taken</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-coral-500">{missed}</p>
              <p className="text-sm text-slate-300 mt-1">Missed</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-primary-600">{rate}%</p>
              <p className="text-sm text-slate-300 mt-1">Adherence</p>
            </div>
          </div>
        )}

        {/* Logs */}
        {loading ? <LoadingSpinner /> : (
          <div className="card">
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className={`flex justify-between items-center p-4 rounded-xl border ${
                    log.status === 'TAKEN' ? 'bg-sage-950/40 border-sage-800/50' : 'bg-coral-950/40 border-coral-800/50'
                  }`}>
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">{log.medicineName}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{log.dosage} · {formatDateTime(log.scheduledTime)}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      log.status === 'TAKEN' ? 'bg-sage-900/50 text-sage-400' : 'bg-coral-900/50 text-coral-400'
                    }`}>
                      {log.status === 'TAKEN' ? '✅ Taken' : '❌ Missed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-5xl">📋</span>
                <p className="text-slate-300 mt-3">No logs found for this period</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default MedicineHistory




