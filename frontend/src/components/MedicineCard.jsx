import { Link } from 'react-router-dom'
import { formatDate, formatTime, frequencyLabel } from '../utils/helpers'
import { Clock, Bot, FileText } from 'lucide-react'

import api from '../api/axios'

function MedicineCard({ medicine, onDelete, onAiInfo }) {
  const handleViewPrescription = async () => {
    try {
      const res = await api.get(`/medicines/${medicine.id}/prescription`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err) {
      alert('Failed to load prescription. It may not exist.');
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-3xl border border-slate-800 shadow-card hover:shadow-card-md transition-all duration-300 p-6 flex flex-col h-full group relative overflow-hidden">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-950/40 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-200 tracking-tight group-hover:text-primary-400 transition-colors">{medicine.name}</h3>
          <p className="text-sm font-medium text-slate-300 mt-1">{medicine.dosage} · {frequencyLabel(medicine.frequency)}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${medicine.isActive ? 'bg-sage-950/40 text-sage-400 border border-sage-100' : 'bg-slate-900 text-slate-300 border border-slate-700'}`}>
          {medicine.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {medicine.reminderTimes && medicine.reminderTimes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 relative z-10">
          {medicine.reminderTimes.map((time, i) => (
            <span key={i} className="text-xs bg-primary-950/40 text-primary-400 border border-primary-100 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 shadow-sm">
              <Clock className="w-3 h-3 text-primary-400" /> {formatTime(time)}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs font-medium text-slate-300 mb-6 bg-slate-900 px-3 py-2 rounded-xl inline-block self-start relative z-10">
        From {formatDate(medicine.startDate)}
        {medicine.endDate ? ` → ${formatDate(medicine.endDate)}` : ' · Ongoing'}
      </div>

      <div className="mt-auto space-y-2 relative z-10">
        {onAiInfo && (
          <button
            onClick={() => onAiInfo(medicine.name)}
            className="w-full bg-gradient-to-r from-lavender-50 to-lavender-100 hover:from-lavender-100 hover:to-lavender-200 text-lavender-700 text-sm font-bold py-2.5 rounded-2xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm border border-lavender-200/50"
          >
            <Bot className="w-4 h-4 text-lavender-700" /> AI Guide
          </button>
        )}

        {medicine.prescriptionFile && (
          <button
            onClick={handleViewPrescription}
            className="w-full bg-slate-900 hover:bg-slate-700 text-slate-300 text-sm font-bold py-2.5 rounded-2xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm border border-slate-700"
          >
            <FileText className="w-4 h-4 text-slate-300" /> View Prescription
          </button>
        )}
        
        <div className="flex gap-2">
          <Link
            to={`/medicines/edit/${medicine.id}`}
            className="flex-1 text-center bg-slate-900 hover:bg-slate-700 text-slate-300 text-sm font-bold py-2.5 rounded-2xl transition-all duration-200 border border-slate-700"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(medicine.id)}
            className="flex-1 bg-coral-950/40 hover:bg-coral-900/50 text-coral-400 text-sm font-bold py-2.5 rounded-2xl transition-all duration-200 border border-coral-800/50 shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default MedicineCard




