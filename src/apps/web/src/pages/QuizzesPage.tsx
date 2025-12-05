import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_PREFIX = '/api'

type TopicSummary = {
  id: number
  slug: string
  name: string
  description?: string
  estimated_time_min?: number
  total_questions: number
  completed_questions: number
  mastery?: number | null
  // Number of quiz questions available for this topic (null while checking)
  quiz_total_questions?: number | null
}

const QuizzesPage: React.FC = () => {
  const [topics, setTopics] = useState<TopicSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadTopics()
  }, [])

  const DEFAULT_QUIZ_SIZE = 10

  const loadTopics = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) { navigate('/login'); return }

      const res = await fetch(`${API_PREFIX}/practice/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const body = await res.text().catch(() => 'Failed to load topics')
        throw new Error(typeof body === 'string' ? body : 'Failed to load topics')
      }

      const data: TopicSummary[] = await res.json()
      // initialize with quiz metadata placeholders; show the default quiz size
      const withQuizMeta = data.map(t => ({ ...t, quiz_total_questions: DEFAULT_QUIZ_SIZE }))
      setTopics(withQuizMeta)
    } catch (err: any) {
      setError(err.message || 'Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 p-8">
      {/* Title and Description */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quizzes</h2>
        <p className="text-slate-700 font-medium">Fast, timed quizzes to test your mastery. Try the quick checks to earn badges.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-3xl">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-slate-700 font-medium mb-6">Loading topics...</div>
      )}

      {/* Quizzes Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {topics.map((t) => (
          <div key={t.id} className="border-3 border-slate-900 rounded-3xl bg-white p-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-black text-slate-900">{t.name}</h3>
              <span className="text-sm text-slate-500">{t.estimated_time_min ? `${t.estimated_time_min} min` : '25 min'}</span>
            </div>

            <p className="text-slate-700 font-medium mb-6">{t.description}</p>

            {/* Progress / Topics */}
            <div className="mb-6">
              <p className="text-slate-600 text-sm mb-2">Practice progress</p>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${t.total_questions ? (t.completed_questions / t.total_questions) * 100 : 0}%` }} />
              </div>
              <p className="text-slate-600 text-sm">{t.completed_questions}/{t.total_questions} practice completed {t.mastery !== null && t.mastery !== undefined ? `• Mastery ${Math.round((t.mastery || 0) * 100)}%` : ''}</p>

              {/* Quiz availability */}
              <div className="mt-3 text-sm text-slate-600">
                {t.quiz_total_questions === null ? (
                  <span>Checking quiz availability…</span>
                ) : t.quiz_total_questions === 0 ? (
                  <span className="text-slate-500">No quiz questions available</span>
                ) : (
                  <span className="font-semibold">Quiz questions: {t.quiz_total_questions}</span>
                )}
              </div>
            </div>

            {/* Action */}
            {t.quiz_total_questions === 0 ? (
              <button className="w-full py-4 rounded-xl font-bold text-lg bg-slate-400 text-white cursor-not-allowed" disabled>
                No Quiz
              </button>
            ) : (
              <Link to={`/quizzes/${t.slug}`} className="w-full inline-flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-pink-500 text-white hover:bg-pink-600 active:scale-95 no-underline">
                Start Quiz
              </Link>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}

export default QuizzesPage
