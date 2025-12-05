import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

const logo = new URL('../assets/brightsumlogo.svg', import.meta.url).href

export default function VerifyPage(): React.ReactElement {
  const nav = useNavigate()
  const loc = useLocation()
  const prefillEmail = (loc.state as any)?.email || ''

  const [email, setEmail] = useState(prefillEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!email || !code) { setError('Email and code are required'); return }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || data.message || 'Verification failed')
      setSuccess('Email verified — redirecting to login...')
      setTimeout(() => nav('/login', { replace: true }), 800)
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (!email) { setError('Enter your email to resend code'); return }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || data.message || 'Resend failed')
      setSuccess('Verification code resent — check your email')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Resend failed')
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff, #fffaf6)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="BrightSUM logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-8 text-center">Verify your email</h1>

        <section className="mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200 p-6 sm:p-10 max-w-md">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} className="w-full px-4 py-3 border border-slate-200 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">6‑digit code</label>
              <input type="text" value={code} onChange={e => { setCode(e.target.value); setError('') }} maxLength={6} className="w-full px-4 py-3 border border-slate-200 rounded-md" placeholder="123456" />
            </div>

            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">{error}</div>}
            {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm font-medium">{success}</div>}

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button onClick={handleVerify} disabled={loading} className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2">{loading ? 'Verifying…' : 'Verify'}</button>
              <button onClick={handleResend} disabled={loading} className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2">Resend code</button>
            </div>

            <div className="text-center text-sm text-slate-600">
              After verification you will be redirected to <span className="font-semibold text-slate-900">Log in</span>.
            </div>

          </div>
          
        </section>
        <div className="mt-6 text-center text-sm text-slate-600">
              Already verified?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                Log in
              </Link>
            </div>
      </div>
    </main>
  )
}
