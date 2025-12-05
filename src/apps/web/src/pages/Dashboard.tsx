import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TodoChecklist from '../components/TodoChecklist'

type Me = { id: number; email: string; role: string }

type ReviewSummary = {
  overall: {
    accuracy: number
    total_mistakes: number
    questions_answered: number
    week_accuracy: number
    avg_difficulty: string
    avg_hints_per_question: number
    goal_progress: number
    problems_today: number
    daily_goal: number
  }
  topics?: Array<{ name: string; accuracy: number; mistakes: number }>
  recent_sessions?: { quizzes: any[]; practice: any[] }
}

const Dashboard: React.FC = () => {
  // --- Auth gate (inline) ---
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    fetch('http://localhost:8000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data: Me) => setMe(data))
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [navigate])

  // --- Review summary state ---
  const [summary, setSummary] = useState<ReviewSummary | null>(null)

  useEffect(() => {
    if (!me) return
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('http://localhost:8000/api/review/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data: ReviewSummary) => setSummary(data))
      .catch(() => {
        // keep defaults if summary fails
      })
  }, [me])

  // Tip of the day: deterministic rotation by UTC day
  const TIPS: string[] = [
    'Remember to show your work!',
    'Break complex problems into smaller steps.',
    'Try a simple example to check your approach.',
    'Explain your solution out loud to find gaps.',
    'Use estimation to sanity-check numeric answers.',
    'Draw a diagram to make the problem concrete.',
    'Check units and labels on your final answer.',
    'Review similar examples before starting.'
  ]
  // Use UTC day index so tip flips once per calendar day globally
  const utcDayIndex = Math.floor(Date.now() / 86400000)
  const tipOfTheDay = TIPS[utcDayIndex % TIPS.length]

  const displayName = me ? me.email.split('@')[0] : '' // used to split email for 'Welcome, ' message
  if (loading) return null // or a small spinner

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">

      {/* Welcome Title */}
      <div className="text-center mb-16">
        <h2 className="text-6xl font-black tracking-tight">
          <span className="bg-yellow-300 px-6 py-3 rounded-2xl inline-block">
            Welcome{me ? `, ${displayName}` : ''}
          </span>
        </h2>
        {/* small badge for role */}
        {me && (
          <div className="mt-3 inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200">
            ROLE: {me.role.toUpperCase()}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column - Tip & Action Buttons */}
        <div className="border-3 border-slate-900 rounded-4xl p-10 bg-white/95 backdrop-blur-sm shadow-xl flex flex-col justify-between order-2 lg:order-1">
          {/* Today's Goal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Today's Goal:</h3>
              <p className="text-sm font-semibold text-slate-600 mb-3">{summary ? `${summary.overall.problems_today}/${summary.overall.daily_goal} Problems` : '0/10 Problems'}</p>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-sm">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.round((summary?.overall.goal_progress ?? 0) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Quiz Average Score Section */}
          <div className="space-y-6 pb-4 mb-2 mt-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quiz Average Score:</h3>
              <p className="text-sm font-semibold text-slate-600 mb-3">{summary ? `${summary.overall.accuracy}%` : '—'}</p>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-sm">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${summary ? summary.overall.accuracy : 0}%` }} />
              </div>
            </div>
          </div>

          {/* To Do Box */}
          <div className="border-3 border-slate-900 rounded-4xl p-10 bg-white/95 backdrop-blur-sm shadow-xl">
            {/* Interactive TodoChecklist component replaces static list */}
            <div className="max-w-full">
              <TodoChecklist />
            </div>
          </div>
        </div>

        {/* Right Column - Tip & Action Buttons */}
        <div className="border-3 border-slate-900 rounded-4xl p-10 bg-white/95 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div className="mb-12">
            <h4 className="text-3xl font-black text-slate-900 mb-3 text-center">Tip of the Day</h4>
            <p className="text-center text-slate-700 font-semibold text-lg">{tipOfTheDay}</p>
          </div>

          <div className="space-y-4 flex flex-col">
            <Link to="/lessons" aria-label="Lessons" className="w-full inline-flex bg-linear-to-r from-blue-500 to-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-lg active:scale-95 items-center justify-between px-8 shadow-md no-underline">
              <span>Lessons</span>
              <div className="w-16 h-2 bg-green-300 rounded-full" />
            </Link>

            <Link to="/practice" aria-label="Practice Problems" className="w-full inline-flex bg-linear-to-r from-purple-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all hover:shadow-lg active:scale-95 shadow-md items-center justify-between px-8 no-underline">
              <span>Practice Problems</span>
              <div className="w-16 h-2 bg-purple-300 rounded-full" />
            </Link>

            <button aria-label="Continue Practice" className="w-full bg-linear-to-r from-green-500 to-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg active:scale-95 flex items-center justify-between px-8 shadow-md">
              <span>Continue Practice</span>
              <div className="w-16 h-2 bg-green-200 rounded-full" />
            </button>

            <Link to="/quizzes" className="w-full inline-flex bg-pink-500 hover:bg-pink-600 text-white py-5 rounded-2xl font-bold text-lg transition-all hover:shadow-lg active:scale-95 items-center justify-between px-8 no-underline">
              <span>Quizzes</span>
              <div className="w-16 h-2 bg-pink-300 rounded-full" />
            </Link>

            <Link to="/review-mistakes" className="w-full inline-flex bg-linear-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-lg active:scale-95 items-center justify-between px-8 shadow-md no-underline">
              <span>Review Mistakes</span>
              <div className="w-16 h-2 bg-yellow-300 rounded-full" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}

export default Dashboard
