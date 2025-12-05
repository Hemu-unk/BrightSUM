import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type TopicSummary = {
  id: number
  slug: string
  name: string
  description?: string
  estimated_time_min?: number
  total_questions: number
  completed_questions: number
  mastery?: number | null
}

const PracticePage: React.FC = () => {
  const [topics, setTopics] = useState<TopicSummary[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
          // include Authorization header when a token is present (most frontend calls use Bearer token)
          const token = localStorage.getItem('token')
          const headers: Record<string,string> = {}
          if (token) headers['Authorization'] = `Bearer ${token}`
          const resp = await fetch('/api/practice/topics', { credentials: 'include', headers })
          if (!resp.ok) {
            // try to read response body for better diagnostics
            const text = await resp.text()
            throw new Error(`Failed to load topics: ${resp.status} ${text.slice(0, 200)}`)
          }
          const ct = resp.headers.get('content-type') || ''
          if (!ct.includes('application/json')) {
            // backend/dev-server served HTML (likely the front-end index.html) or an error page
            const text = await resp.text()
            throw new Error(`Expected JSON but got: ${text.slice(0, 200)}`)
          }
          const data = await resp.json()
          setTopics(data)
        } catch (e: any) {
        console.error(e)
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getProgressPercentage = (topic: TopicSummary) => {
    // Prefer mastery when available (0.0-1.0), otherwise use completed/total
    if (typeof topic.mastery === 'number' && topic.mastery !== null) {
      return Math.round((topic.mastery || 0) * 100)
    }
    if (topic.total_questions > 0) {
      return Math.round((topic.completed_questions / topic.total_questions) * 100)
    }
    return 0
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 40) return 'bg-amber-500'
    return 'bg-slate-600'
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">

      {/* Title and Description */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Practice Problems</h2>
        <p className="text-slate-700 font-medium">Choose a topic to practice. Work through problems to master each skill.</p>
      </div>

      {loading && <div className="text-slate-700">Loading topics…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && topics && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Half */}
          <div>
            <div className="space-y-8">
              {topics.slice(0, Math.ceil(topics.length / 2)).map((topic) => (
                <div key={topic.slug} className="border-3 border-slate-900 rounded-3xl bg-white p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{topic.name}</h3>
                  <p className="text-slate-700 font-medium mb-6">{topic.description}</p>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {typeof topic.mastery === 'number' && topic.mastery !== null
                        ? `Mastery: ${(topic.mastery * 100).toFixed(0)}%`
                        : `${topic.completed_questions}/${topic.total_questions} Problems`}
                    </p>
                  </div>

                  <div className="w-full bg-slate-300 rounded-full h-4 overflow-hidden mb-6">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressBarColor(getProgressPercentage(topic))}`}
                      style={{ width: `${getProgressPercentage(topic)}%` }}
                    />
                  </div>

                  <Link
                    to={`/practice/${topic.slug}`}
                    className="w-full inline-flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 no-underline"
                  >
                    Start Practicing
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Half */}
          <div>
            <div className="space-y-8">
              {topics.slice(Math.ceil(topics.length / 2)).map((topic) => (
                <div key={topic.slug} className="border-3 border-slate-900 rounded-3xl bg-white p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{topic.name}</h3>
                  <p className="text-slate-700 font-medium mb-6">{topic.description}</p>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {typeof topic.mastery === 'number' && topic.mastery !== null
                        ? `Mastery: ${(topic.mastery * 100).toFixed(0)}%`
                        : `${topic.completed_questions}/${topic.total_questions} Problems`}
                    </p>
                  </div>

                  <div className="w-full bg-slate-300 rounded-full h-4 overflow-hidden mb-6">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressBarColor(getProgressPercentage(topic))}`}
                      style={{ width: `${getProgressPercentage(topic)}%` }}
                    />
                  </div>

                  <Link
                    to={`/practice/${topic.slug}`}
                    className="w-full inline-flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 no-underline"
                  >
                    Start Practicing
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default PracticePage
