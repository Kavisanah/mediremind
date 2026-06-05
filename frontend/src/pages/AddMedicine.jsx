import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { extractErrorMessage } from '../utils/helpers'
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

function AddMedicine() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'ONCE_DAILY',
    startDate: '', endDate: '', notes: '', reminderTimes: ['08:00'],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [aiInstruction, setAiInstruction] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAiParseSchedule = async () => {
    if (!aiInstruction.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await api.get('/ai/parse-schedule', {
        params: { instruction: aiInstruction }
      })
      if (res.data && res.data.data) {
        setForm(prev => ({ ...prev, reminderTimes: res.data.data }))
      } else {
        setAiError('Failed to parse schedule times.')
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Error parsing schedule.')
    } finally {
      setAiLoading(false)
    }
  }

  const addReminderTime = () => {
    setForm({ ...form, reminderTimes: [...form.reminderTimes, '08:00'] })
  }

  const removeReminderTime = (index) => {
    const updated = form.reminderTimes.filter((_, i) => i !== index)
    setForm({ ...form, reminderTimes: updated })
  }

  const updateReminderTime = (index, value) => {
    const updated = [...form.reminderTimes]
    updated[index] = value
    setForm({ ...form, reminderTimes: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/medicines', {
        ...form,
        endDate: form.endDate || null,
      })

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/medicines/${res.data.data.id}/prescription`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      navigate('/medicines')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to add medicine'))
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight">Add Medicine</h1>
          <p className="text-slate-300 mt-2 font-medium text-lg">Input your prescription details below.</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-coral-950/40 border border-coral-800/50 text-coral-300 text-sm font-medium rounded-2xl px-5 py-4 mb-6 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-coral-400 flex-shrink-0 mt-0.5" /> 
              <div className="mt-0.5">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Medicine Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="e.g. Paracetamol" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Dosage</label>
                <input name="dosage" value={form.dosage} onChange={handleChange}
                  placeholder="e.g. 500mg" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Frequency *</label>
              <select name="frequency" value={form.frequency} onChange={handleChange} className="input-field">
                {frequencies.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Start Date *</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                  required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">End Date (optional)</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                  className="input-field" />
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-slate-200">AI Smart Scheduler</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Type natural schedule details (e.g. "three times a day starting at 9am", "every 8 hours") to generate reminder times automatically.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiInstruction} 
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder="e.g. morning, afternoon, and night" 
                  className="input-field flex-1"
                />
                <button 
                  type="button" 
                  onClick={handleAiParseSchedule}
                  disabled={aiLoading || !aiInstruction.trim()}
                  className="btn-primary py-2 px-4 text-xs font-semibold whitespace-nowrap"
                >
                  {aiLoading ? 'Generating...' : 'Generate Times'}
                </button>
              </div>
              {aiError && (
                <p className="text-xs text-coral-400 mt-1.5">{aiError}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">Reminder Times *</label>
                <button type="button" onClick={addReminderTime}
                  className="text-xs text-primary-600 font-semibold hover:underline">
                  + Add Time
                </button>
              </div>
              <div className="space-y-2">
                {form.reminderTimes.map((time, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="time" value={time}
                      onChange={(e) => updateReminderTime(i, e.target.value)}
                      className="input-field flex-1" />
                    {form.reminderTimes.length > 1 && (
                      <button type="button" onClick={() => removeReminderTime(i)}
                        className="text-coral-400 hover:text-coral-400 text-lg font-bold">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="e.g. Take after food" rows={3} className="input-field resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Upload Prescription (optional)</label>
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
              <p className="text-xs text-slate-400 mt-1.5">Max 5MB. Images or PDFs.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Adding...' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AddMedicine




