import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

const frequencies = [
  { value: 'ONCE_DAILY', label: 'Once Daily' },
  { value: 'TWICE_DAILY', label: 'Twice Daily' },
  { value: 'THREE_TIMES_DAILY', label: 'Three Times Daily' },
  { value: 'FOUR_TIMES_DAILY', label: 'Four Times Daily' },
  { value: 'EVERY_8_HOURS', label: 'Every 8 Hours' },
  { value: 'EVERY_12_HOURS', label: 'Every 12 Hours' },
  { value: 'AS_NEEDED', label: 'As Needed' },
]

function EditMedicine() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/medicines/${id}`)
        const m = res.data.data
        setForm({
          name: m.name || '',
          dosage: m.dosage || '',
          frequency: m.frequency || 'ONCE_DAILY',
          startDate: m.startDate || '',
          endDate: m.endDate || '',
          notes: m.notes || '',
          reminderTimes: m.reminderTimes?.map(t => t.substring(0, 5)) || ['08:00'],
        })
      } catch (err) {
        setError('Failed to load medicine')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addReminderTime = () => setForm({ ...form, reminderTimes: [...form.reminderTimes, '08:00'] })

  const removeReminderTime = (index) => {
    setForm({ ...form, reminderTimes: form.reminderTimes.filter((_, i) => i !== index) })
  }

  const updateReminderTime = (index, value) => {
    const updated = [...form.reminderTimes]
    updated[index] = value
    setForm({ ...form, reminderTimes: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put(`/medicines/${id}`, { ...form, endDate: form.endDate || null })
      
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/medicines/${id}/prescription`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      navigate('/medicines')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medicine')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-80 h-80 bg-amber-200/30 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-300 hover:text-slate-200 mb-4 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight">Edit Medicine</h1>
          <p className="text-slate-300 mt-2 font-medium text-lg">Update your prescription details below.</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-coral-950/40 border border-coral-800/50 text-coral-300 text-sm font-medium rounded-2xl px-5 py-4 mb-6 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-coral-400 flex-shrink-0 mt-0.5" /> 
              <div className="mt-0.5">{error}</div>
            </div>
          )}

          {form && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Medicine Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Dosage</label>
                  <input name="dosage" value={form.dosage} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Frequency *</label>
                <select name="frequency" value={form.frequency} onChange={handleChange} className="input-field">
                  {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Start Date *</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">End Date (optional)</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Reminder Times *</label>
                  <button type="button" onClick={addReminderTime} className="text-xs text-primary-600 font-semibold hover:underline">+ Add Time</button>
                </div>
                <div className="space-y-2">
                  {form.reminderTimes.map((time, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="time" value={time} onChange={(e) => updateReminderTime(i, e.target.value)} className="input-field flex-1" />
                      {form.reminderTimes.length > 1 && (
                        <button type="button" onClick={() => removeReminderTime(i)} className="text-coral-400 hover:text-coral-400 text-lg font-bold">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="input-field resize-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Update Prescription (optional)</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-300
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-900/50 file:text-primary-300
                  hover:file:bg-primary-800/50
                  border border-slate-700/50 rounded-2xl bg-slate-800/50 p-2 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50" />
                <p className="text-xs text-slate-400 mt-1.5">Max 5MB. Leave blank to keep current file.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

export default EditMedicine




