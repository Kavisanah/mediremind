import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.data, res.data.data.token)   // AuthContext expects (userData, jwtToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh-primary flex items-center justify-center p-4">

      {/* Decorative circles */}
      <div className="fixed top-[-80px] right-[-80px] w-72 h-72 rounded-full
                      bg-primary-900/50/60 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-80px] left-[-80px] w-72 h-72 rounded-full
                      bg-amber-900/50/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">

        {/* Logo block */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl
                          bg-gradient-to-br from-primary-400 to-primary-700
                          shadow-card-md mb-4 animate-float">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-50">
            Medi<span className="text-gradient">Remind</span>
          </h1>
          <p className="text-slate-300 mt-1 text-sm">Your personal medicine companion</p>
        </div>

        {/* Card */}
        <div className="card animate-slide-up delay-1">
          <h2 className="text-xl font-bold text-slate-50 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-300 mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="alert alert-danger mb-5 animate-fade-in">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input type="email" name="email" required autoFocus
                className="input-field" placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} name="password" required
                  className="input-field pr-11" placeholder="••••••••"
                  value={form.password} onChange={handleChange} />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300
                             hover:text-slate-300 transition-colors text-sm">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary btn w-full btn-lg mt-2">
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : 'Sign in →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-300 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-300 mt-5 animate-fade-in delay-4">
          Built for elderly care & family health management 💙
        </p>
      </div>
    </div>
  )
}




