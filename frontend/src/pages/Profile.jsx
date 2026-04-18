import Navbar from '../components/Navbar'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
              {user?.name?.[0]?.toUpperCase() || '👤'}
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
              { to: '/medicines', icon: '💊', label: 'My Medicines' },
              { to: '/appointments', icon: '📅', label: 'My Appointments' },
              { to: '/history', icon: '📋', label: 'Medicine History' },
              { to: '/observers', icon: '🛡️', label: 'Manage Guardians' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="flex justify-between items-center py-4 px-5 rounded-2xl hover:bg-slate-900 hover:shadow-sm border border-transparent hover:border-slate-800 transition-all duration-200">
                <span className="text-[15px] font-bold text-slate-300 flex items-center gap-3">
                  <span className="text-xl">{link.icon}</span> {link.label}
                </span>
                <span className="text-slate-300 font-bold text-xl">→</span>
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-coral-950/40 hover:bg-coral-900/50 text-coral-400 font-bold tracking-wide py-4 rounded-2xl transition-all duration-200 shadow-sm border border-coral-800/50/50 flex justify-center items-center gap-2"
        >
          <span className="text-xl">🚪</span> Sign Out
        </button>
      </main>
    </div>
  )
}

export default Profile




