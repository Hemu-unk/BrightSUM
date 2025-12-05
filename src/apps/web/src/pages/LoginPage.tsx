import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const logo = new URL('../assets/brightsumlogo.svg', import.meta.url).href

export default function LoginPage(): React.ReactElement {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      // @ts-ignore
      [name]: value
    }))
    setError('')
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')

      // show success and then navigate shortly after so user sees the message
      setSuccess('Login successful! Redirecting...')
      setFormData({ email: '', password: '' })
      localStorage.setItem('token', data.access_token)
      setLoading(false)
      // fetch the current user to decide where to route next (teacher -> teacher dashboard)
      try {
        const meRes = await fetch('http://localhost:8000/api/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` } })
        if (meRes.ok) {
          const me = await meRes.json()
          const isTeacher = me.role && me.role.toLowerCase() === 'teacher'
          setTimeout(() => navigate(isTeacher ? '/teacher/dashboard' : '/dashboard', { replace: true }), 600)
        } else {
          // fallback
          setTimeout(() => navigate('/dashboard', { replace: true }), 600)
        }
      } catch (e) {
        setTimeout(() => navigate('/dashboard', { replace: true }), 600)
      }
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff, #fffaf6)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="BrightSUM logo" className="h-16 w-auto" />
        </div>

        {/* Form Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-8 text-center">Login to your account</h1>

        {/* Form Container */}
        <section className="mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200 p-6 sm:p-10 max-w-md">
          <div className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm font-medium">
                {success}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link to="/password-reset" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Forgot your password?
                </Link>
            </div>
          </div>
        </section>

        {/* Switch to Signup */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account?{' '}
          <Link to="/signup" className="font-semibold text-slate-900 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  )
}
