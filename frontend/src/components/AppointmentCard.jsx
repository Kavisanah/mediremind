import { formatDateTime } from '../utils/helpers'
import { MapPin, Clock } from 'lucide-react'

const statusColors = {
  SCHEDULED: 'bg-primary-950/40 text-primary-400',
  COMPLETED: 'bg-sage-950/40 text-sage-400',
  CANCELLED: 'bg-coral-950/40 text-coral-400',
}

function AppointmentCard({ appointment, onDelete, onStatusChange }) {
  return (
    <div className="bg-slate-800/80 rounded-3xl border border-slate-800 shadow-card hover:shadow-card-md transition-all duration-300 p-6 flex flex-col h-full group relative overflow-hidden">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-950/40 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-lg font-display font-bold text-slate-200 tracking-tight group-hover:text-amber-400 transition-colors">Dr. {appointment.doctorName}</h3>
        <span className={`text-[#1c1917] bg-opacity-[85%] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${statusColors[appointment.status]}`}>
          {appointment.status}
        </span>
      </div>

      {appointment.location && (
        <p className="text-sm font-medium text-slate-300 mb-2 relative z-10 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {appointment.location}
        </p>
      )}

      <div className="text-sm font-medium text-slate-300 mb-6 bg-amber-950/40 text-amber-400 px-3 py-2 rounded-xl inline-block self-start relative z-10 border border-amber-100/50 shadow-sm flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-400" /> {formatDateTime(appointment.appointmentDate)}
      </div>

      {appointment.notes && (
        <p className="text-xs text-slate-300 mb-6 italic relative z-10 bg-slate-900 p-3 rounded-xl border border-slate-800">{appointment.notes}</p>
      )}

      <div className="mt-auto space-y-2 relative z-10">
        <div className="flex gap-2">
          {appointment.status === 'SCHEDULED' && (
            <button
              onClick={() => onStatusChange(appointment.id, 'COMPLETED')}
              className="flex-1 bg-sage-950/40 border border-sage-800/50 hover:bg-sage-900/50 text-sage-400 text-sm font-bold py-2.5 rounded-2xl transition-all duration-200 shadow-sm"
            >
              Mark Done
            </button>
          )}
          <button
            onClick={() => onDelete(appointment.id)}
            className="flex-1 bg-coral-950/40 hover:bg-coral-900/50 text-coral-400 text-sm font-bold py-2.5 rounded-2xl transition-all duration-200 border border-coral-800/50 shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCard




