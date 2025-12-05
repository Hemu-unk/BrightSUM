import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useHeaderActions } from '../../components/HeaderActionsContext'

const API_PREFIX = '/api'

type QuizQuestion = {
  id: number
  stem: string
  base_difficulty: string
}

type QuizResult = {
  question_id: number
  stem: string
  your_answer: string
  correct_answer: string
  is_correct: boolean
  base_difficulty: string
}

const ExpressionsQuiz: React.FC = () => {
  const navigate = useNavigate()
  const { setActions } = useHeaderActions()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})

  // Timer state
  const [timeLeft, setTimeLeft] = useState(1500) // 25 minutes in seconds
  const [timerActive, setTimerActive] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  // Results state
  const [results, setResults] = useState<QuizResult[]>([])
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [scorePercent, setScorePercent] = useState(0)
  const [passed, setPassed] = useState(false)
  const [timeTaken, setTimeTaken] = useState(0)

  // Header actions
  useEffect(() => {
    setActions(
      <button
        onClick={() => navigate('/quizzes', { replace: true })}
        className="border-2 border-slate-900 text-slate-900 px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer hover:bg-slate-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]"
      >
        Exit Quiz
      </button>
    )
    return () => setActions(null)
  }, [navigate, setActions])

  // derive topic slug from the route
  const params = useParams<{ topic_slug?: string }>()
  const topicSlug = params.topic_slug || 'expressions'

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      // Time's up - auto submit
      submitQuiz()
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const startQuiz = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Start quiz for the requested topic slug
      const res = await fetch(`${API_PREFIX}/quiz/${topicSlug}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to start quiz' }))
        throw new Error(data.detail || 'Failed to start quiz')
      }

      const data = await res.json()
      setAttemptId(data.attempt_id)
      setQuestions(data.questions)
      setExpiresAt(new Date(data.expires_at))
      setTimeLeft(data.time_limit_minutes * 60)
      // If backend returns topic_name include it in header display
      if ((data as any).topic_name) {
        // replace document title etc by using a stateful title; we'll rely on render-time strings
      }
      setQuizStarted(true)
      setTimerActive(true)

      // Initialize empty answers
      const initialAnswers: { [key: number]: string } = {}
      data.questions.forEach((q: QuizQuestion) => {
        initialAnswers[q.id] = ''
      })
      setUserAnswers(initialAnswers)

    } catch (err: any) {
      setError(err.message || 'Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (answer: string) => {
    if (!questions[currentQuestion]) return
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuiz = async () => {
    if (!attemptId) return

    setLoading(true)
    setTimerActive(false)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Prepare answers submission
      const answers = questions.map(q => ({
        question_id: q.id,
        answer_submitted: userAnswers[q.id] || ''
      }))

      const res = await fetch(`${API_PREFIX}/quiz/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to submit quiz' }))
        throw new Error(data.detail || 'Failed to submit quiz')
      }

  const data = await res.json()
      setResults(data.results)
      setScore(data.score)
      setTotalQuestions(data.total_questions)
      setScorePercent(data.score_percent)
      setPassed(data.passed)
      setTimeTaken(data.time_taken_seconds)
      setShowResults(true)

    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: 'A', color: 'text-green-600' }
    if (percent >= 80) return { grade: 'B', color: 'text-blue-600' }
    if (percent >= 70) return { grade: 'C', color: 'text-yellow-600' }
    if (percent >= 60) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'F', color: 'text-red-600' }
  }

  const gradeInfo = getGrade(scorePercent)

  // Results screen
  if (showResults) {
    return (
      <main className="min-h-screen bg-pink-50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{topicSlug.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Quiz</h1>
            <p className="text-slate-700 font-medium mt-2">Test your mastery of {topicSlug.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border-3 border-slate-900 p-12 shadow-lg text-center mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Quiz Complete!</h2>
            
            <div className="mb-10">
              <p className="text-slate-600 font-semibold text-lg mb-4">Your Score</p>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className={`text-6xl font-black ${gradeInfo.color}`}>{score}/{totalQuestions}</p>
                  <p className="text-slate-600 font-semibold mt-2">{scorePercent.toFixed(0)}%</p>
                </div>
                <div className={`text-8xl font-black ${gradeInfo.color}`}>{gradeInfo.grade}</div>
              </div>
            </div>

            <div className="text-sm text-slate-600 mb-6">
              Time taken: {formatTime(Math.round(timeTaken))}
            </div>

            {passed && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded mb-8">
                <p className="text-green-900 font-bold text-xl">🎉 Great Job!</p>
                <p className="text-green-900 mt-2">You passed the quiz! You can now move on to the next topic.</p>
              </div>
            )}

            {!passed && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded mb-8">
                <p className="text-orange-900 font-bold text-xl">⚠️ Keep Practicing</p>
                <p className="text-orange-900 mt-2">Review the lesson and try again to improve your score.</p>
              </div>
            )}

            {/* Answer Review */}
            <div className="mt-10 text-left max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Answer Review</h3>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.question_id} className={`p-4 rounded-lg border-l-4 ${result.is_correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <p className="font-semibold text-slate-900 mb-2">Q{index + 1}: {result.stem}</p>
                    <p className={`font-semibold ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                      Your answer: {result.your_answer || '(No answer)'}
                    </p>
                    {!result.is_correct && (
                      <p className="text-red-700 mt-1">
                        Correct answer: <span className="font-bold">{result.correct_answer}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/quizzes')}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all"
              >
                Return to Quizzes
              </button>
              <button
                onClick={() => navigate(`/lessons/${topicSlug}`)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                Review Lesson
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Start screen
  if (!quizStarted) {
    return (
      <main className="min-h-screen bg-pink-50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{topicSlug.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Quiz</h1>
            <p className="text-slate-700 font-medium mt-2">Test your mastery of {topicSlug.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border-3 border-slate-900 p-12 shadow-lg text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Expressions Quiz</h2>
            
            <div className="space-y-6 mb-10 text-left">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-900">⏱️ Time Limit: 25 minutes</p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="font-semibold text-yellow-900">⚠️ No Hints Available</p>
                <p className="text-yellow-900 text-sm mt-2">This is a test of your knowledge. Use your best judgment for each answer.</p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="font-semibold text-green-900">✅ Passing Score: 70%</p>
                <p className="text-green-900 text-sm mt-2">You need at least 70% to pass the quiz.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full py-4 bg-pink-500 text-white rounded-xl font-bold text-lg hover:bg-pink-600 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Quiz in progress
  const currentQ = questions[currentQuestion]
  if (!currentQ) return <div className="p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{topicSlug.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Quiz</h1>
          <p className="text-slate-700 font-medium mt-2">Test your mastery of {topicSlug.replace('_', ' ')}</p>
        </div>
        <div className={`px-6 py-3 rounded-xl font-bold text-lg ${
          timeLeft < 300 ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-900'
        }`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 mb-8 flex justify-between items-center">
          <div>
            <p className="text-slate-600 font-semibold">Question</p>
            <p className="text-3xl font-black text-slate-900">{currentQuestion + 1}/{questions.length}</p>
          </div>
          <div className="flex-1 mx-8">
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-slate-600 font-semibold">Difficulty</p>
            <p className={`text-2xl font-black ${
              currentQ.base_difficulty === 'easy' ? 'text-green-600' :
              currentQ.base_difficulty === 'medium' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {currentQ.base_difficulty}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-10 shadow-lg mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">{currentQ.stem}</h2>

          <div className="mb-6">
            <input
              type="text"
              value={userAnswers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && currentQuestion < questions.length - 1 && handleNextQuestion()}
              placeholder="Enter your answer here..."
              className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl text-lg font-semibold focus:outline-none focus:border-slate-900"
            />
          </div>

          <p className="text-slate-600 text-sm">Answer saved automatically</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${
              currentQuestion === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={loading}
              className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold text-lg hover:bg-pink-600 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default ExpressionsQuiz