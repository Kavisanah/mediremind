import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import { LayoutDashboard, Pill, Calendar, Shield, User, LogOut } from 'lucide-react'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/medicines',    label: 'Medicines',    icon: Pill },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/observers',    label: 'Guardians',    icon: Shield },
  { path: '/profile',      label: 'Profile',      icon: User },
]

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <>
      {/* Desktop / tablet navbar */}
      <nav className="bg-slate-800/80/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800"
           style={{ boxShadow: '0 1px 0 rgba(14,82,89,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-6">

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center
                              bg-gradient-to-br from-primary-500 to-primary-700
                              shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-50"
                    style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>
                Medi<span className="text-gradient">Remind</span>
              </span>
            </Link>

            {/* Nav items — desktop */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navItems.map(item => {
                const active = location.pathname.startsWith(item.path)
                return (
                  <Link key={item.path} to={item.path}
                    className={`nav-pill ${active ? 'active' : ''} text-[0.8125rem]`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Avatar + name */}
              <div className="hidden md:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700
                                flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <span className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">{user?.name?.split(' ')[0]}</span>
                </span>
              </div>

              <button onClick={handleLogout}
                className="btn-danger btn text-xs px-3 py-1.5 hidden md:flex">
                Sign out
              </button>

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(o => !o)}
                className="md:hidden btn-icon btn"
                aria-label="Menu">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  {menuOpen
                    ? <><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
                    : <><rect y="3"  width="18" height="1.6" rx="0.8" fill="currentColor"/>
                        <rect y="8.2" width="18" height="1.6" rx="0.8" fill="currentColor"/>
                        <rect y="13.4" width="14" height="1.6" rx="0.8" fill="currentColor"/></>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-800/80 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                const active = location.pathname.startsWith(item.path)
                return (
                  <Link key={item.path} to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active ? 'bg-primary-950/40 text-primary-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'}`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
              <div className="pt-2 border-t border-slate-800 mt-2">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700
                                  flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
                </div>
                <button onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl
                             text-sm font-medium text-coral-400 hover:bg-coral-950/40 transition-all">
                  <LogOut className="w-5 h-5 flex-shrink-0" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-800/80/95 backdrop-blur-md
                      border-t border-slate-800 pb-safe"
           style={{ boxShadow: '0 -1px 0 rgba(14,82,89,0.06), 0 -8px 20px rgba(0,0,0,0.04)' }}>
        <div className="flex">
          {navItems.slice(0, 5).map(item => {
            const active = location.pathname.startsWith(item.path)
            return (
              <Link key={item.path} to={item.path}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium
                            transition-all duration-200
                            ${active ? 'text-primary-400' : 'text-slate-400'}`}>
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110 text-primary-400' : 'text-slate-400'}`} />
                {item.label}
                {active && (
                  <span className="w-1 h-1 rounded-full bg-primary-400 mt-0.5"/>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Navbar




