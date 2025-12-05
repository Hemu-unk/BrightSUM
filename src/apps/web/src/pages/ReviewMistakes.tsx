import React, { useState, useEffect } from 'react'
import { formatDate } from '../utils/dateUtils'

const ReviewMistakes: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('All topics')
  const [selectedSource, setSelectedSource] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [dateRange, setDateRange] = useState('Last 7 days')
  const [onlyWrong, setOnlyWrong] = useState(false)

  // Data loaded from backend
  const [topicsToReview, setTopicsToReview] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any>({ quizzes: [], practice: [] })
  const [overall, setOverall] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionDetails, setSessionDetails] = useState<Record<string, any>>({})

  

  useEffect(() => {
    const tkn = localStorage.getItem('token')
    setLoading(true)
    
    // Build query params from filters
    const params = new URLSearchParams()
    if (selectedTopic !== 'All topics') params.append('topic', selectedTopic)
    if (selectedSource !== 'All') params.append('source', selectedSource)
    if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty)
    if (dateRange !== 'All time') params.append('date_range', dateRange)
    
    const url = `http://localhost:8000/api/review/summary?${params.toString()}`
    
    fetch(url, { headers: tkn ? { Authorization: `Bearer ${tkn}` } : {} })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch review summary')
        return r.json()
      })
      .then((js) => {
        setOverall(js.overall || null)
        setTopicsToReview(js.topics || [])
        setRecentSessions(js.recent_sessions || { quizzes: [], practice: [] })
        setError(null)
      })
      .catch((e) => {
        console.error(e)
        setError(String(e))
      })
      .finally(() => setLoading(false))
  }, [selectedTopic, selectedSource, selectedDifficulty, dateRange])

  const fetchSessionDetails = async (type: 'practice' | 'quiz', id: number) => {
    const key = `${type}-${id}`
    // toggle if already fetched (keep data but toggle visibility)
    if (sessionDetails[key] && sessionDetails[key].visible) {
      setSessionDetails(prev => ({ ...prev, [key]: { ...prev[key], visible: false } }))
      return
    }
    // if already fetched but hidden, just show it
    if (sessionDetails[key] && !sessionDetails[key].visible) {
      setSessionDetails(prev => ({ ...prev, [key]: { ...prev[key], visible: true } }))
      return
    }
    // otherwise fetch
    setSessionDetails(prev => ({ ...prev, [key]: { loading: true, visible: true, data: null } }))
    const tkn = localStorage.getItem('token')
    const url = type === 'practice'
      ? `http://localhost:8000/api/review/practice_attempts/${id}/mistakes`
      : `http://localhost:8000/api/review/quiz_attempts/${id}/mistakes`
    try {
      const res = await fetch(url, { headers: tkn ? { Authorization: `Bearer ${tkn}` } : {} })
      if (!res.ok) throw new Error('Failed to load details')
      const js = await res.json()
      setSessionDetails(prev => ({ ...prev, [key]: { loading: false, visible: true, data: js } }))
    } catch (e) {
      setSessionDetails(prev => ({ ...prev, [key]: { loading: false, visible: true, data: { error: String(e) } } }))
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="inline-block">
          <h1 className="text-5xl font-black bg-yellow-300 px-6 py-3 rounded-2xl">
            Review Mistakes
          </h1>
        </div>
        <p className="mt-4 text-slate-700 font-medium">
          See the questions you missed, spot patterns, and practice the skills you need most.
        </p>
        {error ? (
          <div className="mt-4 text-sm text-red-600">Could not load review data: {error}</div>
        ) : null}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overall Performance */}
          <div className="border-3 border-slate-900 rounded-3xl p-8 bg-white shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Overall Performance</h2>
                <p className="text-sm text-slate-600">How you've been doing across all quizzes and practice.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Accuracy: <span className="font-bold">{loading ? '—' : `${overall?.accuracy ?? 0}%`}</span></p>
                <p className="text-sm text-slate-600">Total Mistakes: <span className="font-bold">{loading ? '—' : overall?.total_mistakes ?? 0}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-600 mb-1">Questions Answered</p>
                <p className="text-2xl font-bold text-slate-900">{loading ? '—' : overall?.questions_answered ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">This Week's Accuracy</p>
                <p className="text-2xl font-bold text-slate-900">{loading ? '—' : `${overall?.week_accuracy ?? 0}%`}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Avg. Difficulty Reached</p>
                <p className="text-2xl font-bold text-slate-900">{loading ? '—' : overall?.avg_difficulty ?? 'Medium'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Avg. Hints / Question</p>
                <p className="text-2xl font-bold text-slate-900">{loading ? '—' : overall?.avg_hints_per_question ?? 0}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Goal Progress (Problems Today)</p>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${(overall?.goal_progress ?? 0) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-600 mt-1">{overall?.problems_today ?? 0} / {overall?.daily_goal ?? 10} problems completed</p>
            </div>
          </div>

          {/* Topics to Review */}
          <div className="border-3 border-slate-900 rounded-3xl p-8 bg-white shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Topics to Review</h2>
            <p className="text-sm text-slate-600 mb-6">Your weakest skills based on past mistakes.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topicsToReview.map((topic: any, idx: number) => (
                <div key={idx} className="border-2 border-slate-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{topic.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Accuracy {topic.accuracy}% · {topic.mistakes} mistakes
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="bg-red-400 h-full rounded-full transition-all" 
                      style={{ width: `${topic.accuracy}%` }} 
                    />
                  </div>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-bold text-sm transition-all active:scale-95">
                    Review Mistakes
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="border-3 border-slate-900 rounded-3xl p-8 bg-white shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Recent Sessions</h2>
            <p className="text-sm text-slate-600 mb-6">Jump back into your latest quizzes and practice.</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Quizzes</h3>
                <div className="space-y-3">
                  {recentSessions.quizzes.map((quiz: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2 border-2 border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <p className="font-bold text-slate-900">{quiz.name}</p>
                          <p className="text-sm text-slate-600">{formatDate(quiz.date)} · Score {quiz.score}</p>
                        </div>
                        <div>
                          <button onClick={() => fetchSessionDetails('quiz', quiz.id)} className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline">
                            View mistakes
                          </button>
                        </div>
                      </div>
                      {/* details panel */}
                      {sessionDetails[`quiz-${quiz.id}`]?.visible ? (
                        <div className="bg-slate-50 border rounded p-3 text-sm">
                          {sessionDetails[`quiz-${quiz.id}`].loading ? (
                            <div>Loading...</div>
                          ) : sessionDetails[`quiz-${quiz.id}`].data?.error ? (
                            <div className="text-red-600">{sessionDetails[`quiz-${quiz.id}`].data.error}</div>
                          ) : (
                            <div>
                              <div className="font-semibold">Quiz details</div>
                              <div>Topic: {sessionDetails[`quiz-${quiz.id}`].data.quiz?.topic_name ?? '—'}</div>
                              <div>Score: {sessionDetails[`quiz-${quiz.id}`].data.quiz?.score_percent ?? '—'}</div>
                              <div>Started: {sessionDetails[`quiz-${quiz.id}`].data.quiz?.started_at ? formatDate(sessionDetails[`quiz-${quiz.id}`].data.quiz.started_at) : '—'}</div>
                              <div className="text-xs text-slate-600 mt-2">{sessionDetails[`quiz-${quiz.id}`].data.note}</div>

                              {/* Per-question details when available */}
                              {sessionDetails[`quiz-${quiz.id}`].data.mistakes?.length ? (
                                <div className="mt-3 space-y-2">
                                  <div className="font-semibold">Question-level results</div>
                                  {sessionDetails[`quiz-${quiz.id}`].data.mistakes.map((m: any, i: number) => (
                                    <div key={i} className="p-3 border rounded bg-white">
                                      <div className="font-semibold text-slate-900 mb-1">{m.question_stem ?? `Question ID: ${m.question_id}`}</div>
                                      <div className="text-sm space-y-1">
                                        <div className={m.is_correct ? 'text-green-600' : 'text-red-600'}>
                                          {m.is_correct ? 'Correct' : 'Your answer:'} {m.given_answer ?? '(no answer)'}
                                        </div>
                                        <div className="text-green-600">Correct answer: {m.correct_answer ?? '—'}</div>
                                        <div className="text-slate-600">Position: {m.position ?? '—'} · Info score: {m.info_score ? m.info_score.toFixed(3) : '—'}</div>
                                        <div className="text-slate-600">Time: {m.time_seconds ?? '—'}s · Hints: {m.hints ?? 0}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Practice Problems</h3>
                <div className="space-y-3">
                  {recentSessions.practice.map((practice: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2 border-2 border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <p className="font-bold text-slate-900">{practice.name}</p>
                          <p className="text-sm text-slate-600">{practice.problems} problems · {practice.correct}</p>
                        </div>
                        <div>
                          <button onClick={() => fetchSessionDetails('practice', practice.id)} className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline">
                            View mistakes
                          </button>
                        </div>
                      </div>
                      {sessionDetails[`practice-${practice.id}`]?.visible ? (
                        <div className="bg-slate-50 border rounded p-3 text-sm">
                          {sessionDetails[`practice-${practice.id}`].loading ? (
                            <div>Loading...</div>
                          ) : sessionDetails[`practice-${practice.id}`].data?.error ? (
                            <div className="text-red-600">{sessionDetails[`practice-${practice.id}`].data.error}</div>
                          ) : (
                            <div>
                              {sessionDetails[`practice-${practice.id}`].data.mistakes?.length ? (
                                <div className="space-y-2">
                                  {sessionDetails[`practice-${practice.id}`].data.mistakes.map((m: any, i: number) => (
                                    <div key={i} className="p-3 border rounded bg-white">
                                      <div className="font-semibold text-slate-900 mb-1">{m.question_stem ?? `Question ID: ${m.question_id}`}</div>
                                      <div className="text-sm space-y-1">
                                        <div className="text-red-600">Your answer: {m.submitted ?? '(no answer)'}</div>
                                        <div className="text-green-600">Correct answer: {m.correct_answer ?? '—'}</div>
                                        <div className="text-slate-600">Hints used: {m.hints} · Time: {m.time_seconds}s</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-600">No recorded mistakes for this attempt.</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Filters & Tip */}
        <div className="space-y-8">
          {/* Filters */}
          <div className="border-3 border-slate-900 rounded-3xl p-6 bg-white shadow-xl">
            <h2 className="text-xl font-black text-slate-900 mb-6">Filters</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Topic</label>
                <select 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>All topics</option>
                  {topicsToReview.map((t, idx) => (
                    <option key={idx}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Source</label>
                <div className="flex gap-2">
                  {['All', 'Practice', 'Quizzes'].map((source) => (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        selectedSource === source
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Difficulty</label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Date range</label>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-bold text-slate-900">Only show questions I got wrong</label>
                <button
                  onClick={() => setOnlyWrong(!onlyWrong)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    onlyWrong ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all absolute top-0.5 ${
                    onlyWrong ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="border-3 border-slate-900 rounded-3xl p-6 bg-white shadow-xl">
            <h2 className="text-xl font-black text-slate-900 mb-3">Tip</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Start with topics where your accuracy is the lowest, then try a new practice session to check your progress.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReviewMistakes
