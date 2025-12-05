import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHeaderActions } from '../components/HeaderActionsContext'

// Use relative API paths so Vite dev proxy can forward to backend
const API_PREFIX = '/api'

type PracticeQuestion = {
  question_id: number
  stem: string
  base_difficulty: string
  shown_difficulty: string
}

const ExpressionsPractice: React.FC = () => {
  const navigate = useNavigate()
  const { setActions } = useHeaderActions()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Practice session state
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null)
  // When server provides the next question after a submit, hold it here until
  // the user explicitly advances. This keeps the just-answered question
  // visible so the user can review feedback before moving on.
  const [pendingNextQuestion, setPendingNextQuestion] = useState<PracticeQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [questionsCompleted, setQuestionsCompleted] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)

  // Question feedback state
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState('')
  // Track when the current question was presented so we can calculate time spent
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)

  // Hint state
  const [hints, setHints] = useState<string[]>([])
  const [_currentHintLevel, setCurrentHintLevel] = useState(0)
  const [hintsRemaining, setHintsRemaining] = useState(0)
  const [loadingHint, setLoadingHint] = useState(false)

  // Header actions
  useEffect(() => {
    setActions(
      <button
        onClick={() => navigate('/practice', { replace: true })}
        className="border-2 border-slate-900 text-slate-900 px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer hover:bg-slate-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]"
      >
        Exit Practice
      </button>
    )
    return () => setActions(null)
  }, [navigate, setActions])

  // derive topic slug from the route (if present) — default to expressions
  const params = useParams<{ topic_slug?: string }>()
  const topicSlug = params.topic_slug || 'expressions'

  // Start practice session on mount
  useEffect(() => {
    startPractice()
  }, [topicSlug])

  const startPractice = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const res = await fetch(`${API_PREFIX}/practice/${topicSlug}/attempt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to start practice' }))
        throw new Error(data.detail || 'Failed to start practice')
      }

      const data = await res.json()
      setAttemptId(data.attempt_id)
      setCurrentQuestion(data.current_question)
  setQuestionStartTime(Date.now())
  setPendingNextQuestion(null)
      setScore(data.score)
      setQuestionsCompleted(data.questions_completed)

    } catch (err: any) {
      setError(err.message || 'Failed to start practice session')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please enter an answer')
      return
    }

    if (!attemptId) {
      setError('No active practice session')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const res = await fetch(`${API_PREFIX}/practice/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answer_submitted: userAnswer,
          time_seconds: questionStartTime ? (Date.now() - questionStartTime) / 1000 : undefined
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to submit answer' }))
        throw new Error(data.detail || 'Failed to submit answer')
      }

      const data = await res.json()
      
      setIsCorrect(data.is_correct)
      setCorrectAnswer(data.correct_answer)
      setAnswered(true)
      setScore(data.score)
      setQuestionsCompleted(data.questions_completed)

      // Check if session is complete
      if (data.session_complete) {
        setSessionComplete(true)
        setPendingNextQuestion(null)
      } else if (data.next_question) {
        // Store next question but don't swap it in yet — wait for the user
        // to click Next so they can view the feedback for the current one.
        setPendingNextQuestion(data.next_question)
      } else {
        setPendingNextQuestion(null)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to submit answer')
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = () => {
    // Reset state for next question
    setUserAnswer('')
    setAnswered(false)
    setIsCorrect(false)
    setCorrectAnswer('')
    setHints([])
    setCurrentHintLevel(0)
    setHintsRemaining(0)
    // Advance to the pending question (if the server provided one). This
    // ensures the previous question stays visible until the student advances.
    if (pendingNextQuestion) {
      setCurrentQuestion(pendingNextQuestion)
      setPendingNextQuestion(null)
      setQuestionStartTime(Date.now())
    } else {
      // No pending question; clear the start time to avoid sending stale values.
      setQuestionStartTime(null)
    }
  }

  const handleRequestHint = async () => {
    if (!attemptId) return

    setLoadingHint(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const res = await fetch(`${API_PREFIX}/practice/${attemptId}/hint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to get hint' }))
        throw new Error(data.detail || 'No more hints available')
      }

      const data = await res.json()
      
      setHints(prev => [...prev, data.hint_text])
      setCurrentHintLevel(data.hint_level)
      setHintsRemaining(data.hints_remaining)

    } catch (err: any) {
      setError(err.message || 'Failed to get hint')
    } finally {
      setLoadingHint(false)
    }
  }

  const handleReset = () => {
    // Restart practice
    setAttemptId(null)
    setCurrentQuestion(null)
    setUserAnswer('')
    setScore(0)
    setQuestionsCompleted(0)
    setSessionComplete(false)
    setAnswered(false)
    setIsCorrect(false)
    setCorrectAnswer('')
    setHints([])
    setCurrentHintLevel(0)
    setHintsRemaining(0)
    setError(null)
    setPendingNextQuestion(null)
    
    startPractice()
  }

  // Loading state
  if (loading && !currentQuestion) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-xl font-semibold text-slate-700">Starting practice session...</div>
      </main>
    )
  }

  // Error state
  if (error && !currentQuestion) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700 font-semibold mb-4">{error}</p>
            <button
              onClick={startPractice}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Session complete
  if (sessionComplete) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto mt-20">
          <div className="bg-white rounded-3xl border-3 border-slate-900 p-12 shadow-lg text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Practice Complete! 🎉</h2>
            
            <div className="mb-8">
              <p className="text-slate-600 font-semibold text-lg mb-4">Your Score</p>
              <p className="text-6xl font-black text-green-600">{score}/{questionsCompleted}</p>
              <p className="text-slate-600 font-semibold mt-2">
                {questionsCompleted > 0 ? Math.round((score / questionsCompleted) * 100) : 0}% Correct
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded mb-8">
              <p className="text-green-900 font-bold text-xl">Great work!</p>
              <p className="text-green-900 mt-2">You've completed all available practice questions for this topic.</p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all"
              >
                Practice Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-xl font-semibold text-slate-700">Loading question...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 mb-8 flex justify-between items-center">
          <div>
            <p className="text-slate-600 font-semibold">Score</p>
            <p className="text-3xl font-black text-green-600">{score}/{questionsCompleted}</p>
          </div>
          <div>
            <p className="text-slate-600 font-semibold">Questions Completed</p>
            <p className="text-3xl font-black text-slate-900">{questionsCompleted}</p>
          </div>
          <div>
            <p className="text-slate-600 font-semibold">Difficulty</p>
            <p className={`text-2xl font-black ${
              currentQuestion.shown_difficulty === 'easy' ? 'text-green-600' : 
              currentQuestion.shown_difficulty === 'medium' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {currentQuestion.shown_difficulty}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-10 shadow-lg mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">{currentQuestion.stem}</h2>

          <div className="mb-6">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !answered && handleSubmitAnswer()}
              placeholder="Enter your answer here..."
              disabled={answered}
              className="w-full px-6 py-4 border-2 border-slate-300 rounded-xl text-lg font-semibold disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Hints Section */}
          {!answered && hints.length === 0 && (
            <button 
              onClick={handleRequestHint}
              disabled={loadingHint}
              className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {loadingHint ? 'Loading...' : '💡 Show Hint'}
            </button>
          )}

          {hints.length > 0 && !answered && (
            <div className="mb-6 space-y-3">
              {hints.map((hint, index) => (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="font-semibold text-yellow-900">Hint {index + 1}:</p>
                  <p className="text-yellow-900">{hint}</p>
                </div>
              ))}
              
              {hintsRemaining > 0 && (
                <button 
                  onClick={handleRequestHint}
                  disabled={loadingHint}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {loadingHint ? 'Loading...' : `💡 Next Hint (${hintsRemaining} remaining)`}
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          {isCorrect && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
              <p className="font-bold text-green-900 text-lg">✅ Correct!</p>
            </div>
          )}

          {answered && !isCorrect && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <p className="font-bold text-red-900">❌ Incorrect</p>
              <p className="text-red-900 mt-2">The correct answer is: <span className="font-bold text-lg">{correctAnswer}</span></p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded mb-6">
              <p className="font-bold text-orange-900">{error}</p>
            </div>
          )}

          {/* Submit or Next button */}
          {!answered ? (
            <button 
              onClick={handleSubmitAnswer}
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all"
            >
              Next Question →
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default ExpressionsPractice