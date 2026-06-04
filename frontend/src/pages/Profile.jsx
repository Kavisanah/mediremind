import { useState } from 'react'
import Navbar from '../components/Navbar'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { User, Pill, Calendar, ClipboardList, Shield, LogOut, ArrowRight, Settings, RefreshCw, Mail, AlertTriangle } from 'lucide-react'
import api from '../api/axios'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loadingCleanup, setLoadingCleanup] = useState(false)
  const [loadingApts, setLoadingApts] = useState(false)
  const [loadingMissed, setLoadingMissed] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const handleTriggerCleanup = async () => {
    setLoadingCleanup(true)
    try {
      const res = await api.post('/jobs/trigger-cleanup')
      showFeedback(res.data?.message || 'Daily record cleanup triggered successfully!', 'success')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to trigger daily cleanup.', 'error')
    } finally {
      setLoadingCleanup(false)
    }
  }

  const handleTriggerAppointments = async () => {
    setLoadingApts(true)
    try {
      const res = await api.post('/jobs/trigger-appointments')
      showFeedback(res.data?.message || 'Appointment reminders dispatched successfully!', 'success')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to trigger appointment reminders.', 'error')
    } finally {
      setLoadingApts(false)
    }
  }

  const handleTriggerMissedDoses = async () => {
    setLoadingMissed(true)
    try {
      const res = await api.post('/jobs/trigger-missed-doses')
      showFeedback(res.data?.message || 'Missed dose alerts checked successfully!', 'success')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to trigger missed dose checks.', 'error')
    } finally {
      setLoadingMissed(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 right-[-10%] w-96 h-96 bg-primary-200/40 rounded-full blur-[120px] pointer-events-none" />
      
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight mb-8">Profile & Settings</h1>

        <div className="card mb-8">
          <div className="flex items-center gap-6 mb-8 mt-2">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-[1.25rem] shadow-md flex items-center justify-center text-4xl text-white font-display font-bold">
              {user?.name?.[0]?.toUpperCase() || <User className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-200 tracking-tight">{user?.name}</h2>
              <p className="text-slate-300 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div className="flex justify-between items-center py-3 px-4 bg-slate-900/50 rounded-2xl border border-slate-800">
              <span className="text-[15px] text-slate-300 font-bold uppercase tracking-wide">Account Type</span>
              <span className="text-sm font-bold bg-primary-900/50 text-primary-400 px-4 py-1.5 rounded-full shadow-sm">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h3 className="text-lg font-display font-bold text-slate-200 mb-5">Quick Access</h3>
          <div className="space-y-3">
            {[
              { to: '/medicines', icon: Pill, label: 'My Medicines' },
              { to: '/appointments', icon: Calendar, label: 'My Appointments' },
              { to: '/history', icon: ClipboardList, label: 'Medicine History' },
              { to: '/observers', icon: Shield, label: 'Manage Guardians' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="flex justify-between items-center py-4 px-5 rounded-2xl hover:bg-slate-900 hover:shadow-sm border border-transparent hover:border-slate-800 transition-all duration-200">
                <span className="text-[15px] font-bold text-slate-300 flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-slate-400" /> {link.label}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {isLocal && (
          <div className="card mb-8 border border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-950/40 border border-primary-500/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary-400 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-slate-200">Developer & Recruiter Console</h3>
                <p className="text-xs text-slate-300">Simulate daily background scheduler routines on-demand.</p>
              </div>
            </div>

            {message.text && (
              <div className={`p-3.5 mb-5 rounded-xl text-xs font-semibold border animate-fade-in ${
                message.type === 'success' 
                  ? 'bg-sage-950/40 text-sage-400 border-sage-500/20' 
                  : 'bg-coral-950/40 text-coral-400 border-coral-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleTriggerCleanup}
                disabled={loadingCleanup || loadingApts || loadingMissed}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 transition-all duration-200 text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className={`w-4 h-4 text-primary-400 ${loadingCleanup ? 'animate-spin' : ''}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Deactivate Expired Records</p>
                    <p className="text-xs text-slate-300">Turns off medicines whose end dates have passed.</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={handleTriggerAppointments}
                disabled={loadingCleanup || loadingApts || loadingMissed}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 transition-all duration-200 text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Mail className={`w-4 h-4 text-amber-400 ${loadingApts ? 'animate-pulse' : ''}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Dispatch Appointment Reminders</p>
                    <p className="text-xs text-slate-300">Sends email alerts for appointments in the next 24h.</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={handleTriggerMissedDoses}
                disabled={loadingCleanup || loadingApts || loadingMissed}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 transition-all duration-200 text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 text-coral-400 ${loadingMissed ? 'animate-bounce' : ''}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Check Missed Doses</p>
                    <p className="text-xs text-slate-300">Alerts guardians for doses missed 30+ minutes ago.</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            
            <div className="mt-4 border-t border-slate-800/80 pt-3 text-[10px] text-slate-300 flex justify-between">
              <span>Environment: Localhost</span>
              <span>API Path: /api/jobs/*</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-coral-950/40 hover:bg-coral-900/50 text-coral-400 font-bold tracking-wide py-4 rounded-2xl transition-all duration-200 shadow-sm border border-coral-800/50/50 flex justify-center items-center gap-2"
        >
          <LogOut className="w-5 h-5 text-coral-400" /> Sign Out
        </button>
      </main>
    </div>
  )
}

export default Profile




