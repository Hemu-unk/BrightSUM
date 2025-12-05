import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type Question = { id: number; topic_id: number; stem: string; answer: string; base_difficulty: string; is_quiz_only: boolean; hints?: string[] }
type Topic = { id: number; slug: string; name: string }

export default function EditQuestion(): React.ReactElement {
  const { id } = useParams()
  const qid = id ? parseInt(id, 10) : null
  const [question, setQuestion] = useState<Question | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ stem?: string; answer?: string }>( {})
  const navigate = useNavigate()

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { navigate('/login'); return }
    Promise.all([
      fetch(`http://localhost:8000/api/teacher/questions/${qid}`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : Promise.reject('question')),
      fetch('http://localhost:8000/api/teacher/topics', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : Promise.reject('topics'))
    ]).then(([q, ts]) => {
      // ensure hints array exists for editing
      if (q && !q.hints) q.hints = []
      setQuestion(q)
      setTopics(ts || [])
    }).catch(() => setError('Failed to load question or topics')).finally(() => setLoading(false))
  }, [id, navigate, qid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question) return
    setError(null)
    setFieldErrors({})

    // client-side validation
    const stem = question.stem?.toString() ?? ''
    const answer = question.answer?.toString() ?? ''
    const newFieldErrors: typeof fieldErrors = {}
    if (!stem.trim()) newFieldErrors.stem = 'Prompt is required.'
    if (!answer.trim()) newFieldErrors.answer = 'Answer is required.'
    if (Object.keys(newFieldErrors).length) {
      setFieldErrors(newFieldErrors)
      return
    }

    const tkn = localStorage.getItem('token')
    if (!tkn) { navigate('/login'); return }
    setSubmitting(true)
    try {
      const body = {
        topic_slug: topics.find(t => t.id === question.topic_id)?.slug ?? '',
        stem: stem,
        answer: answer,
        base_difficulty: question.base_difficulty,
        is_quiz_only: question.is_quiz_only,
        hints: question.hints || []
      }
      const res = await fetch(`http://localhost:8000/api/teacher/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const js = await res.json().catch(() => ({}))
        // server-side validation / duplicate handling
        if (res.status === 409) throw new Error(js.detail || 'Duplicate question')
        throw new Error(js.detail || 'Failed to update question')
      }
      navigate('/teacher/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to update question')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8">Loading…</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!question) return <div className="p-8">No question found</div>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md border">
        <h1 className="text-2xl font-semibold mb-4">Edit Question</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Topic</label>
            <select value={question.topic_id} onChange={e => setQuestion({...question, topic_id: parseInt(e.target.value, 10)})} className="mt-1 block w-full border rounded-md px-3 py-2">
              {topics.map(t => <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Prompt</label>
            <textarea value={question.stem} onChange={e => setQuestion({...question, stem: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
            {fieldErrors.stem ? <p className="text-sm text-red-600 mt-1">{fieldErrors.stem}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Answer</label>
            <input value={question.answer} onChange={e => setQuestion({...question, answer: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
            {fieldErrors.answer ? <p className="text-sm text-red-600 mt-1">{fieldErrors.answer}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium">Difficulty</label>
            <select value={question.base_difficulty} onChange={e => setQuestion({...question, base_difficulty: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2">
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input id="quiz_only" type="checkbox" checked={question.is_quiz_only} onChange={e => setQuestion({...question, is_quiz_only: e.target.checked})} />
            <label htmlFor="quiz_only" className="text-sm">Quiz only</label>
          </div>

          <div>
            <label className="block text-sm font-medium">Hints</label>
            <div className="space-y-2 mt-1">
              {(question.hints || []).map((h, idx) => (
                <div key={idx} className="flex gap-2">
                  <input value={h} onChange={e => setQuestion({...question, hints: question.hints ? question.hints.map((hh, i) => i === idx ? e.target.value : hh) : [e.target.value]})} className="flex-1 border rounded-md px-3 py-2" />
                  <button type="button" onClick={() => setQuestion({...question, hints: (question.hints || []).filter((_, i) => i !== idx)})} className="px-2 py-1 bg-red-100 text-red-700 rounded-md">Remove</button>
                </div>
              ))}
              <div>
                <button type="button" onClick={() => setQuestion({...question, hints: [...(question.hints || []), '']})} className="px-3 py-1 bg-slate-100 rounded-md text-sm">Add hint</button>
              </div>
              <div className="text-xs text-slate-500">Hints may be provided as multiple lines; when importing via CSV you can supply hints as a JSON array or as a '||' delimited string.</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">{submitting ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => navigate('/teacher/dashboard')} className="px-4 py-2 border rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </main>
  )
}
