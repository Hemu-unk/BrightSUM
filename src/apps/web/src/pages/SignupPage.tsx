import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Use project logo instead of inline svg namespace
const logo = new URL('../assets/brightsumlogo.svg', import.meta.url).href

export default function SignupPage(): React.ReactElement {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'student'
  })

  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      // @ts-ignore - name is one of the keys
      [name]: value
    }))
    setError('')
  }

  const handleAccountTypeSelect = (type: string) => {
    setFormData(prev => ({
      ...prev,
      accountType: type // keep lowercase to match backend: "student" | "teacher"
    }))
    setShowDropdown(false)
  }

  // turn FastAPI/Pydantic errors into a readable string
  const prettyError = (data: any): string => {
    if (!data) return 'Signup failed'
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      const msgs = data.detail.map((d: any) => d?.msg || String(d)).filter(Boolean)
      if (msgs.length) return msgs.join('; ')
    }
    if (typeof data.message === 'string') return data.message
    return 'Signup failed'
  }

  const handleCreateAccount = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.accountType
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(prettyError(data))

      // If backend requires email verification, navigate to verify page
      if (data.verification_required) {
        // keep email in case frontend wants to prefill
        navigate('/verify', { state: { email: formData.email } })
        return
      }

      setSuccess('Account created successfully!')
      setFormData({ email: '', password: '', confirmPassword: '', accountType: 'student' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff, #fffaf6)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header (use project logo instead of light bulb) */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="BrightSUM logo" className="h-16 w-auto" />
        </div>

        {/* Form Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-8 text-center">Create your account</h1>

        {/* Form Container */}
        <section className="mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200 p-6 sm:p-10 max-w-md">
          <div className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
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

            {/* Re-enter Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Re-enter Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Account Type Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Account Type</label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md font-medium text-slate-900 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <span className="capitalize">{formData.accountType}</span>
                  <img src={logo} alt="BrightSUM" className="h-4 w-auto" />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => handleAccountTypeSelect('student')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-900 hover:bg-slate-50 transition"
                    >
                      Student
                    </button>
                    <button
                      onClick={() => handleAccountTypeSelect('teacher')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-900 hover:bg-slate-50 transition border-t border-slate-200"
                    >
                      Teacher
                    </button>
                  </div>
                )}
              </div>
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

            {/* Create Account Button */}
            <div className="pt-2">
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </div>
        </section>

        {/* Switch to Login */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}
