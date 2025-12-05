/**
 * Header renders the brand + a slot for page-provided actions (via HeaderActionsContext),
 * then a Log Out button. To inject actions from a page, see `HeaderActionsContext.tsx`.
 */
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHeaderActions } from './HeaderActionsContext'

const logo = new URL('../assets/brightsumlogo.svg', import.meta.url).href

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { actions } = useHeaderActions()
  const [isTeacher, setIsTeacher] = useState<boolean>(false)

  const onLogout = () => {
    localStorage.removeItem('token') // added so user can't modify the URL back to the dashboard 
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) return
    fetch('http://localhost:8000/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : null)
      .then(js => {
        if (js && js.role && typeof js.role === 'string' && js.role.toLowerCase() === 'teacher') setIsTeacher(true)
      })
      .catch(() => {})
  }, [])

  return (
    <header className="py-5 px-8 bg-white border-b border-slate-200">
      <div className="flex justify-between items-center">
        <Link
          to="/dashboard"
          className="group flex items-center gap-3 no-underline rounded-lg px-2 py-1 transition-all cursor-pointer hover:bg-yellow-200 hover:shadow-sm hover:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <img src={logo} alt="BrightSUM" className="h-10 w-auto transition-transform group-hover:scale-[1.06]" />
          <span className="text-3xl font-bold text-slate-900 group-hover:underline">BrightSUM</span>
        </Link>
        <div className="flex items-center gap-3">
          {actions}
          {isTeacher ? (
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="border-2 border-amber-500 bg-amber-400 text-slate-900 px-8 py-2 rounded-xl font-semibold transition-all cursor-pointer hover:bg-amber-600 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98]"
              aria-label="Teacher Dashboard"
            >
              Teacher
            </button>
          ) : null}
          <button
            onClick={onLogout}
            className="border-2 border-slate-900 text-slate-900 px-8 py-2 rounded-xl font-semibold transition-all cursor-pointer hover:bg-slate-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
