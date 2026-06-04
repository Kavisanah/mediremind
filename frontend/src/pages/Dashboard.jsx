import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import TodayMedicineItem from '../components/TodayMedicineItem'
import AdherenceRing from '../components/AdherenceRing'
import AdherenceChart from '../components/AdherenceChart'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDateTime } from '../utils/helpers'
import useAuth from '../hooks/useAuth'
import api from '../api/axios'
import { Pill, CheckCircle2, XCircle, Clock, TrendingUp, Calendar, Stethoscope, Sparkles, ClipboardList, Shield } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard')
      setDashboard(res.data.data)
    } catch {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleMarkTaken = async logId => {
    try {
      await api.put(`/logs/${logId}/taken`)
      fetchDashboard()
    } catch {
      alert('Failed to mark medicine as taken')
    }
  }

  if (loading) return <LoadingSpinner />

  const weeklyTotal = (dashboard?.weeklyTaken || 0) + (dashboard?.weeklyMissed || 0)

  return (
    <div className="min-h-screen bg-slate-900 pb-20 md:pb-8">
      <Navbar />

      {/* Hero header */}
      <div className="bg-mesh-primary relative overflow-hidden border-b border-slate-800/50 shadow-sm">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 relative z-10">
          <div className="animate-slide-up">
            <p className="text-sm font-bold text-primary-400 tracking-wide mb-2 uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-50 tracking-tight">
              {getGreeting()}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-300 mt-3 text-lg font-medium max-w-xl">Here's your comprehensive health overview for today. Keep tracking to maintain your streak!</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 relative z-10">

        {error && (
          <div className="alert alert-danger animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {dashboard && (
          <>
             {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="animate-slide-up delay-1">
                <StatCard title="Total Medicines" value={dashboard.totalMedicines} icon={<Pill className="w-5 h-5 text-primary-400" />} color="primary" />
              </div>
              <div className="animate-slide-up delay-2">
                <StatCard title="Taken Today"     value={dashboard.todayTaken}     icon={<CheckCircle2 className="w-5 h-5 text-sage-400" />} color="sage" />
              </div>
              <div className="animate-slide-up delay-3">
                <StatCard title="Missed Today"    value={dashboard.todayMissed}    icon={<XCircle className="w-5 h-5 text-coral-400" />} color="coral" />
              </div>
              <div className="animate-slide-up delay-4">
                <StatCard title="Pending"         value={dashboard.todayPending}   icon={<Clock className="w-5 h-5 text-amber-400" />} color="amber" />
              </div>
            </div>

            {/* ── Weekly summary + adherence ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

               {/* Adherence ring card */}
              <div className="card animate-slide-up delay-2">
                <div className="section-header">
                  <h2 className="section-title flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" /> Weekly Adherence
                  </h2>
                  <span className="badge badge-primary text-xs">This week</span>
                </div>
                <div className="flex items-center gap-6">
                  <AdherenceRing
                    taken={dashboard.weeklyTaken}
                    total={weeklyTotal}
                    size={120}
                  />
                  <div className="flex-1">
                    <AdherenceChart taken={dashboard.weeklyTaken} missed={dashboard.weeklyMissed} />
                  </div>
                </div>
              </div>

              {/* Upcoming appointments */}
              <div className="card animate-slide-up delay-3">
                <div className="section-header">
                  <h2 className="section-title flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" /> Upcoming Appointments
                  </h2>
                  <a href="/appointments" className="text-xs text-primary-600 hover:underline font-medium">
                    View all →
                  </a>
                </div>

                {dashboard.upcomingAppointments?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboard.upcomingAppointments.slice(0, 3).map((apt, i) => (
                      <div key={apt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-amber-950/40/60
                                    border border-amber-100 animate-fade-in delay-${i + 1}`}>
                        <div className="w-9 h-9 rounded-xl bg-amber-900/50 flex items-center justify-center
                                        text-slate-200 flex-shrink-0">
                          <Stethoscope className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            Dr. {apt.doctorName}
                          </p>
                          {apt.location && (
                            <p className="text-xs text-slate-300 truncate">{apt.location}</p>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-400 flex-shrink-0 text-right">
                          {formatDateTime(apt.appointmentDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Calendar className="w-10 h-10 text-slate-500 mb-2 animate-float" />
                    <p className="text-sm text-slate-300">No upcoming appointments</p>
                    <a href="/appointments/add" className="mt-3 text-xs text-primary-600 font-semibold hover:underline">
                      + Add appointment
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ── Today's schedule ── */}
            <div className="card animate-slide-up delay-4">
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary-400" /> Today's Schedule
                </h2>
                {dashboard.todayLogs?.length > 0 && (
                  <span className="text-xs text-slate-300">
                    {dashboard.todayTaken}/{dashboard.todayLogs.length} done
                  </span>
                )}
              </div>

              {dashboard.todayLogs?.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.todayLogs.map((log, i) => (
                    <div key={log.id} className={`delay-${Math.min(i + 1, 6)}`}>
                      <TodayMedicineItem log={log} onMarkTaken={handleMarkTaken} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <Sparkles className="w-12 h-12 text-amber-400 mb-3 animate-float" />
                  <p className="text-sm font-semibold text-slate-300">All clear for today!</p>
                  <p className="text-xs text-slate-300 mt-1">No medicines scheduled right now.</p>
                </div>
              )}
            </div>

             {/* ── Quick actions ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up delay-5">
              {[
                { href: '/medicines/add',    icon: <Pill className="w-5 h-5" />, label: 'Add Medicine',    color: 'bg-primary-950/40 hover:bg-primary-900/50 text-primary-400 border-primary-100' },
                { href: '/appointments/add', icon: <Calendar className="w-5 h-5" />, label: 'Add Appointment Reminder', color: 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 border-amber-100' },
                { href: '/history',          icon: <ClipboardList className="w-5 h-5" />, label: 'Medicine History', color: 'bg-slate-900 hover:bg-slate-700 text-slate-300 border-slate-700' },
                { href: '/observers',        icon: <Shield className="w-5 h-5" />, label: 'Manage Guardians', color: 'bg-lavender-50 hover:bg-lavender-100 text-lavender-700 border-lavender-100' },
              ].map(action => (
                <a key={action.href} href={action.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border
                              font-semibold text-sm transition-all duration-200 hover:shadow-sm ${action.color}`}>
                  {action.icon}
                  {action.label}
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard




