import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Pill, AlertTriangle, ArrowLeft, Mail } from 'lucide-react'
import { extractErrorMessage } from '../utils/helpers'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data?.message || 'Password reset link sent successfully.')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to request password reset.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh-primary flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="fixed top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-primary-900/50/60 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-80px] left-[-80px] w-72 h-72 rounded-full bg-amber-900/50/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-card-md mb-4 text-white">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-50">
            Medi<span className="text-gradient">Remind</span>
          </h1>
          <p className="text-slate-300 mt-1 text-sm">Your personal medicine companion</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-50 mb-1">Forgot Password</h2>
          <p className="text-sm text-slate-300 mb-6">Enter your email and we'll send you a password reset link.</p>

          {error && (
            <div className="alert alert-danger mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-coral-600 flex-shrink-0" /> {error}
            </div>
          )}

          {message && (
            <div className="bg-sage-950/40 border border-sage-500/20 text-sage-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sage-400 flex-shrink-0" /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input 
                type="email" 
                required 
                autoFocus
                className="input-field" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn w-full btn-lg mt-2">
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-300 mt-5">
            <Link to="/login" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
