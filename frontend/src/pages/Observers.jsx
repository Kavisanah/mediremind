import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmModal from '../components/ConfirmModal'
import api from '../api/axios'
import { Pill, AlertTriangle, Calendar, TrendingUp, Shield, Users, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { extractErrorMessage } from '../utils/helpers'

const NOTIFY_OPTIONS = [
  { key: 'notifyMedicineReminder', label: 'Medicine reminders',  icon: Pill },
  { key: 'notifyMissedDose',       label: 'Missed dose alerts',  icon: AlertTriangle },
  { key: 'notifyAppointment',      label: 'Appointment reminders', icon: Calendar },
  { key: 'notifyWeeklyReport',     label: 'Weekly reports',       icon: TrendingUp },
]

function StatusBadge({ status }) {
  const map = {
    PENDING: 'badge-amber',
    ACTIVE:  'badge-sage',
    REVOKED: 'badge-stone',
  }
  return <span className={`badge ${map[status] || 'badge-stone'}`}>{status}</span>
}

export default function ObserversPage() {
  const [observers, setObservers]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [revokeId, setRevokeId]     = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg]     = useState('')

  const [form, setForm] = useState({
    observerEmail: '',
    relationshipLabel: '',
    notifyMedicineReminder: true,
    notifyMissedDose: true,
    notifyAppointment: true,
    notifyWeeklyReport: true,
  })

  const fetchObservers = async () => {
    try {
      const res = await api.get('/observers')
      setObservers(res.data.data || [])
    } catch {
      setErrorMsg('Failed to load guardians.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchObservers() }, [])

  const handleInvite = async e => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    try {
      await api.post('/observers/invite', form)
      setSuccessMsg(`Invite sent to ${form.observerEmail}! They'll receive an email shortly.`)
      setShowForm(false)
      setForm({ observerEmail: '', relationshipLabel: '', notifyMedicineReminder: true,
                notifyMissedDose: true, notifyAppointment: true, notifyWeeklyReport: true })
      fetchObservers()
    } catch (err) {
      setErrorMsg(extractErrorMessage(err, 'Failed to send invite.'))
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async () => {
    try {
      await api.delete(`/observers/${revokeId}`)
      fetchObservers()
      setSuccessMsg('Guardian removed successfully.')
    } catch {
      setErrorMsg('Failed to remove guardian.')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-8">
      <Navbar />

      {/* Header */}
      <div className="bg-mesh-lavender border-b border-lavender-900/50 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-lavender-900/50 flex items-center justify-center text-slate-200">
              <Shield className="w-5 h-5 text-lavender-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-50">Health Guardians</h1>
              <p className="text-sm text-slate-300">
                Invite family members or caregivers to stay informed about your health.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-7 space-y-5">

        {/* Alerts */}
        {successMsg && (
          <div className="alert alert-success animate-fade-in flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sage-600 flex-shrink-0" />
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="ml-auto text-sage-500 hover:text-sage-400 text-lg leading-none">×</button>
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-danger animate-fade-in flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-coral-600 flex-shrink-0" />
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="ml-auto text-coral-500 hover:text-coral-700 text-lg leading-none">×</button>
          </div>
        )}

        {/* Explainer banner */}
        <div className="observer-card animate-slide-up">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-lavender-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-200 mb-1">How Guardians Work</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                When you add a guardian, they receive an email invitation. Once they accept,
                they'll be notified about your medicines, missed doses, and appointments —
                exactly as you configure below. Perfect for elderly patients or children
                who need extra care.
              </p>
            </div>
          </div>
        </div>

        {/* Invite button */}
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="btn-primary btn w-full md:w-auto animate-fade-in">
            + Invite a Guardian
          </button>
        )}

        {/* Invite form */}
        {showForm && (
          <div className="card border border-lavender-100 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-200" style={{ fontFamily: 'Sora,sans-serif' }}>
                New Guardian Invite
              </h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost btn text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Guardian's Email *</label>
                  <input type="email" required placeholder="parent@email.com"
                    className="input-field"
                    value={form.observerEmail}
                    onChange={e => setForm(f => ({ ...f, observerEmail: e.target.value }))} />
                </div>

                <div className="input-group">
                  <label className="input-label">Relationship *</label>
                  <input type="text" required placeholder="e.g. Mom, Dad, My Son Ravi"
                    className="input-field" maxLength={60}
                    value={form.relationshipLabel}
                    onChange={e => setForm(f => ({ ...f, relationshipLabel: e.target.value }))} />
                </div>
              </div>

              {/* Notification toggles */}
              <div>
                <label className="input-label mb-3">Notify them about…</label>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIFY_OPTIONS.map(opt => (
                    <label key={opt.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                                  transition-all duration-150 select-none
                                  ${form[opt.key]
                                    ? 'bg-lavender-50 border-lavender-200 text-lavender-800'
                                    : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                      <input type="checkbox" className="sr-only"
                        checked={form[opt.key]}
                        onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))} />
                      <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                                        border transition-all
                                        ${form[opt.key] ? 'bg-lavender-600 border-lavender-600' : 'border-stone-300'}`}>
                        {form[opt.key] && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span className="text-sm font-medium flex items-center gap-1.5 select-none">
                        <opt.icon className="w-4 h-4 text-lavender-700" /> {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="btn-primary btn flex-1 md:flex-none md:px-8">
                  {saving ? 'Sending…' : 'Send Invite'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="btn-secondary btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guardians list */}
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-lavender-400" /> Your Guardians
            {observers.length > 0 && (
              <span className="badge badge-lavender ml-2">{observers.length}</span>
            )}
          </h2>

          {observers.length === 0 ? (
            <div className="card flex flex-col items-center py-12 text-center animate-fade-in">
              <Shield className="w-12 h-12 text-slate-500 mb-3 animate-float" />
              <p className="font-semibold text-slate-300 mb-1">No guardians yet</p>
              <p className="text-sm text-slate-300">
                Invite a family member or caregiver to keep them in the loop.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {observers.map((obs, i) => (
                <div key={obs.id}
                  className={`observer-card flex items-start gap-4 animate-slide-up delay-${Math.min(i + 1, 6)}`}>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-lavender-900/50 flex items-center
                                  justify-center text-lavender-400 font-bold text-sm flex-shrink-0">
                    {(obs.observerName || obs.observerEmail)[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-200 text-sm">
                        {obs.observerName || obs.observerEmail}
                      </p>
                      <StatusBadge status={obs.status} />
                    </div>
                    {obs.observerName && (
                      <p className="text-xs text-slate-300 mt-0.5">{obs.observerEmail}</p>
                    )}
                    <p className="text-xs text-lavender-400 font-medium mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {obs.relationshipLabel}
                    </p>
 
                    {/* Notification chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {NOTIFY_OPTIONS.filter(o => obs[o.key]).map(o => (
                        <span key={o.key} className="badge badge-lavender text-[10px] flex items-center gap-1">
                          <o.icon className="w-3 h-3 text-lavender-400" /> {o.label}
                        </span>
                      ))}
                    </div>
 
                    {obs.status === 'PENDING' && (
                      <p className="text-[11px] text-amber-600 mt-2 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Waiting for them to accept the invite…
                      </p>
                    )}
                  </div>

                  {/* Revoke */}
                  <button onClick={() => setRevokeId(obs.id)}
                    className="btn-ghost btn text-xs text-coral-500 hover:text-coral-700
                               hover:bg-coral-950/40 flex-shrink-0">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={revokeId !== null}
        onClose={() => setRevokeId(null)}
        onConfirm={handleRevoke}
        title="Remove Guardian?"
        message="They will no longer receive notifications about your health. You can re-invite them anytime."
        confirmLabel="Remove"
        danger
      />
    </div>
  )
}




