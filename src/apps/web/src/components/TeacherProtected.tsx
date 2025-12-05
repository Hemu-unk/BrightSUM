import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

// A route guard for teacher-only pages
export default function TeacherProtected(): React.ReactElement | null {
  const [status, setStatus] = useState<'loading' | 'teacher' | 'not-teacher'>('loading')

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { setStatus('not-teacher'); return }
    fetch('http://localhost:8000/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : null)
      .then(js => {
        if (js && js.role && typeof js.role === 'string' && js.role.toLowerCase() === 'teacher') setStatus('teacher')
        else setStatus('not-teacher')
      })
      .catch(() => setStatus('not-teacher'))
  }, [])

  if (status === 'loading') return null
  if (status === 'not-teacher') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
