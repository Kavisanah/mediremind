import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AppointmentCard from '../components/AppointmentCard'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments')
      setAppointments(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleDelete = async () => {
    try {
      await api.delete(`/appointments/${deleteId}`)
      setDeleteId(null)
      fetchAppointments()
    } catch (err) {
      alert('Failed to delete appointment')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status?status=${status}`)
      fetchAppointments()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 bg-amber-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-80 h-80 bg-lavender-200/20 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight">Appointments</h1>
            <p className="text-slate-300 mt-2 font-medium">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} currently scheduled</p>
          </div>
          <Link to="/appointments/add" className="bg-amber-950/400 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-300 border border-amber-400">
            + Add Appointment Reminder
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {appointments.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onDelete={(id) => setDeleteId(id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800/80 rounded-[2rem] border border-slate-800 shadow-sm mt-4">
            <div className="w-24 h-24 bg-amber-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl drop-shadow-sm">📅</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-200">No appointments yet</h3>
            <p className="text-slate-300 mt-3 font-medium max-w-sm mx-auto">Keep track of your doctor visits and schedule your next appointment.</p>
            <Link to="/appointments/add" className="bg-amber-950/400 hover:bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-300 inline-block mt-8 border border-amber-400">
              + Book First Appointment
            </Link>
          </div>
        )}

        {deleteId && (
          <ConfirmModal
            message="Are you sure you want to delete this appointment?"
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </main>
    </div>
  )
}

export default Appointments




