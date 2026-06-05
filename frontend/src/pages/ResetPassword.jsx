import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { Pill, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { extractErrorMessage } from '../utils/helpers'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!token) {
      setError("Missing or invalid password reset token.")
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', {
        token,
        password: form.password
      })
      setSuccess(true)
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to reset password.'))
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
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-sage-950/40 border border-sage-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sage-400">
                <CheckCircle className="w-6 h-6 text-sage-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-50 mb-2">Password Reset Successful</h2>
              <p className="text-sm text-slate-300 mb-6">Your password has been successfully updated. You can now log in with your new password.</p>
              <Link to="/login" className="btn-primary btn w-full inline-block text-center py-3 rounded-2xl font-bold">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-50 mb-1">Reset Password</h2>
              <p className="text-sm text-slate-300 mb-6">Enter your new password below.</p>

              {error && (
                <div className="alert alert-danger mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-coral-600 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPwd ? 'text' : 'password'} 
                      name="password" 
                      required 
                      className="input-field pr-11" 
                      placeholder="••••••••"
                      value={form.password} 
                      onChange={handleChange} 
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-300 transition-colors text-sm">
                      {showPwd ? (
                        <EyeOff className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPwd ? 'text' : 'password'} 
                      name="confirmPassword" 
                      required 
                      className="input-field pr-11" 
                      placeholder="••••••••"
                      value={form.confirmPassword} 
                      onChange={handleChange} 
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowConfirmPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-300 transition-colors text-sm">
                      {showConfirmPwd ? (
                        <EyeOff className="w-5 h-5 text-slate-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary btn w-full btn-lg mt-2">
                  {loading ? 'Resetting password...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
