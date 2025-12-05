import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const logo = new URL('../assets/brightsumlogo.svg', import.meta.url).href

export default function PasswordResetPage(): React.ReactElement {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [stage, setStage] = useState<'request' | 'confirm'>('request')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/password-reset/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error('Request failed')
      setStage('confirm')
      setSuccess('If an account exists for that email, a reset code has been sent')
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally { setLoading(false) }
  }

  const confirmReset = async () => {
    if (!email || !code || !newPassword) { setError('All fields are required'); return }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/password-reset/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, new_password: newPassword })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || data.message || 'Reset failed')
      setSuccess('Password reset — redirecting to login...')
      setTimeout(() => nav('/login', { replace: true }), 900)
    } catch (err: any) {
      setError(err.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff, #fffaf6)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="BrightSUM logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-8 text-center">Reset your password</h1>

        <section className="mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200 p-6 sm:p-10 max-w-md">
          <div className="space-y-5">
            {stage === 'request' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} className="w-full px-4 py-3 border border-slate-200 rounded-md" />
                </div>

                {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">{error}</div>}
                {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm font-medium">{success}</div>}

                <div className="pt-2">
                  <button onClick={requestReset} disabled={loading} className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Sending…' : 'Send reset code'}</button>
                </div>
              </>
            )}

            {stage === 'confirm' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} className="w-full px-4 py-3 border border-slate-200 rounded-md" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">6‑digit code</label>
                  <input type="text" value={code} onChange={e => { setCode(e.target.value); setError('') }} maxLength={6} className="w-full px-4 py-3 border border-slate-200 rounded-md" placeholder="123456" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New password</label>
                  <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError('') }} className="w-full px-4 py-3 border border-slate-200 rounded-md" placeholder="••••••••" />
                </div>

                {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">{error}</div>}
                {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm font-medium">{success}</div>}

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button onClick={confirmReset} disabled={loading} className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2">{loading ? 'Resetting…' : 'Reset password'}</button>
                  <button onClick={() => setStage('request')} disabled={loading} className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2">Back</button>
                </div>

              </>
            )}

            <div className="text-center text-sm text-slate-600">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">Log in</Link>
            </div>

          </div>
        </section>
      </div>
    </main>
  )
}
