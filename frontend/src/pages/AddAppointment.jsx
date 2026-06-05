import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { extractErrorMessage } from '../utils/helpers'

function AddAppointment() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    doctorName: '', location: '', appointmentDate: '', notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Get today's date-time as the minimum value (allows same-day appointments)
  // Format: "2026-03-25T00:00" — this allows any time today onwards
  const todayMin = () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm   = String(now.getMonth() + 1).padStart(2, '0')
    const dd   = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T00:00`   // start of today, not current time
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Convert "2026-03-25T14:30" → "2026-03-25T14:30:00"
      // Backend @FutureOrPresent expects LocalDateTime — ISO without Z
      const localIso = form.appointmentDate.length === 16
        ? form.appointmentDate + ':00'
        : form.appointmentDate

      await api.post('/appointments', {
        ...form,
        appointmentDate: localIso,
      })
      navigate('/appointments')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to add appointment'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-80 h-80 bg-lavender-200/30 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-300 hover:text-slate-200 mb-4 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight">Add Appointment Reminder</h1>
          <p className="text-slate-300 mt-2 font-medium text-lg">Schedule your next doctor visit.</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-coral-950/40 border border-coral-800/50 text-coral-300 text-sm font-medium rounded-2xl px-5 py-4 mb-6 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-coral-400 flex-shrink-0 mt-0.5" /> 
              <div className="mt-0.5">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Doctor Name *</label>
              <input name="doctorName" value={form.doctorName} onChange={handleChange}
                required placeholder="e.g. Dr. Perera" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Location</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Colombo General Hospital" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Date & Time *</label>
              {/* min set to start of today so same-day appointments are allowed */}
              <input
                type="datetime-local"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
                required
                min={todayMin()}
                className="input-field"
              />
              <p className="text-xs text-slate-300 mt-1">You can add appointment reminders for today or any future date.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="e.g. Bring previous reports, fasting required" rows={3}
                className="input-field resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Adding...' : 'Add Reminder'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AddAppointment




