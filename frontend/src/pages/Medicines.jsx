import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MedicineCard from '../components/MedicineCard'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'
import MedicineAiSearch from '../components/MedicineAiSearch'
import api from '../api/axios'

function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [aiMedicineSearch, setAiMedicineSearch] = useState(null)

  const filteredMedicines = useMemo(() => {
    if (!search.trim()) return medicines
    return medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
  }, [medicines, search])

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines')
      setMedicines(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMedicines() }, [])

  const handleDelete = async () => {
    try {
      await api.delete(`/medicines/${deleteId}`)
      setDeleteId(null)
      fetchMedicines()
    } catch (err) {
      alert('Failed to delete medicine')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-50 tracking-tight">Active Medications</h1>
            <p className="text-slate-300 mt-2 font-medium">{medicines.length} medicine{medicines.length !== 1 ? 's' : ''} currently tracked in your regimen</p>
          </div>
          <Link to="/medicines/add" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-300">
            + Add Medicine
          </Link>
        </div>

        {medicines.length > 0 ? (
          <>
            <div className="mb-8 relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-300">🔍</span>
              </div>
              <input 
                type="text" 
                placeholder="Search medication by name..." 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-medium text-slate-200 placeholder-stone-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {filteredMedicines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {filteredMedicines.map(medicine => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    onDelete={(id) => setDeleteId(id)}
                    onAiInfo={(name) => setAiMedicineSearch(name)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-800/80 rounded-3xl border border-slate-800 shadow-sm mt-6">
                <span className="text-5xl opacity-40 filter grayscale">🔍</span>
                <p className="text-slate-300 mt-6 font-medium text-lg">No active medicines found matching "{search}"</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-slate-800/80 rounded-[2rem] border border-slate-800 shadow-sm mt-4">
            <div className="w-24 h-24 bg-primary-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl drop-shadow-sm">💊</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-200">Your regimen is empty</h3>
            <p className="text-slate-300 mt-3 font-medium max-w-sm mx-auto">Start tracking your medication schedule to get timely reminders.</p>
            <Link to="/medicines/add" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-300 inline-block mt-8">
              + Add First Medicine
            </Link>
          </div>
        )}

        {deleteId && (
          <ConfirmModal
            message="Are you sure you want to delete this medicine?"
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        )}

        {aiMedicineSearch && (
          <MedicineAiSearch 
            initialMedicineName={aiMedicineSearch}
            onClose={() => setAiMedicineSearch(null)}
          />
        )}
      </main>
    </div>
  )
}

export default Medicines




