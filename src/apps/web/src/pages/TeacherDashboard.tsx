import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Topic = { id: number; slug: string; name: string }
type Question = { id: number; topic_id: number; stem: string; answer: string; base_difficulty: string; is_quiz_only?: boolean; hints?: string[] }

export default function TeacherDashboard(): React.ReactElement {
  const [topics, setTopics] = useState<Topic[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importResults, setImportResults] = useState<any | null>(null)
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const [deletingTopicIds, setDeletingTopicIds] = useState<number[]>([])
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const tkn = localStorage.getItem('token')
    if (!tkn) { window.location.href = '/login'; return }
    const fd = new FormData()
    fd.append('file', file)
    fetch('http://localhost:8000/api/teacher/questions/import', { method: 'POST', headers: { Authorization: `Bearer ${tkn}` }, body: fd })
      .then(r => r.json())
      .then((data) => {
        setImportResults(data)
        // refresh questions list
        // keep the page rather than force reload so user can download failures
        // but refresh the questions asynchronously
        fetch('http://localhost:8000/api/teacher/questions', { headers: { Authorization: `Bearer ${tkn}` } }).then(r => r.ok ? r.json().then(js => setQuestions(js)) : null)
      })
      .catch(() => alert('Import failed — check the CSV format and your permissions.'))
  }

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { navigate('/login', { replace: true }); return }
    // fetch topics and questions in parallel
    Promise.all([
      fetch('http://localhost:8000/api/teacher/topics', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : Promise.reject('topics')),
      fetch('http://localhost:8000/api/teacher/questions', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : Promise.reject('questions'))
    ]).then(([topicsData, questionsData]) => {
      setTopics(topicsData || [])
      setQuestions(questionsData || [])
    }).catch((e) => {
      console.error('Failed to load teacher data', e)
      setError('Failed to load teacher data. Ensure you are logged in as a teacher.')
    }).finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="p-8">Loading teacher dashboard…</div>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
  <div className="mb-6 flex gap-3">
          <button
            onClick={async () => {
              const t = localStorage.getItem('token')
              if (!t) { window.location.href = '/login'; return }
              try {
                const res = await fetch('http://localhost:8000/api/teacher/questions/template.csv', { headers: { Authorization: `Bearer ${t}` } })
                if (!res.ok) throw new Error('Failed to download template')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'question_import_template.csv'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              } catch (e) {
                alert('Failed to download template. Ensure you are logged in as a teacher.')
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Download CSV template
          </button>

          <label className="flex items-center gap-2 bg-white border rounded-md px-3 py-2">
            <input id="csvfile" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <span className="text-sm text-slate-700">Upload CSV</span>
          </label>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Topics</h2>
          {topics.length === 0 ? (
            <div className="text-sm text-slate-600">No topics yet. Create topics via the API or use the import tool.</div>
          ) : (
            <ul className="space-y-2">
              {topics.map(t => (
                <li key={t.id} className="p-3 border rounded-md bg-white flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.slug}</div>
                    <div className="text-xs text-slate-600 mt-1">Questions: <span className="font-medium">{questions.filter(q => q.topic_id === t.id).length}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/lessons/${t.slug}`)} className="text-sm text-blue-600 hover:underline">View lesson</button>
                    <button onClick={() => navigate(`/teacher/topics/${t.id}/edit`)} className="text-sm text-slate-700 hover:underline">Edit topic</button>
                    <button
                      onClick={async () => {
                        const count = questions.filter(q => q.topic_id === t.id).length
                        if (!confirm(`Delete topic "${t.name}"? This will delete ${count} question${count === 1 ? '' : 's'}. Continue?`)) return
                        const token = localStorage.getItem('token')
                        if (!token) { window.location.href = '/login'; return }
                        setDeletingTopicIds(prev => [...prev, t.id])
                        try {
                          const res = await fetch(`http://localhost:8000/api/teacher/topics/${t.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                          if (!res.ok) {
                            const txt = await res.text()
                            throw new Error(txt || 'Delete failed')
                          }
                          // on success remove topic and its questions from UI
                          setTopics(prev => prev.filter(x => x.id !== t.id))
                          setQuestions(prev => prev.filter(q => q.topic_id !== t.id))
                        } catch (e) {
                          alert('Failed to delete topic: ' + (e instanceof Error ? e.message : String(e)))
                        } finally {
                          setDeletingTopicIds(prev => prev.filter(id => id !== t.id))
                        }
                      }}
                      disabled={deletingTopicIds.includes(t.id)}
                      className={`text-sm ${deletingTopicIds.includes(t.id) ? 'text-gray-400' : 'text-red-600 hover:underline'}`}
                    >
                      {deletingTopicIds.includes(t.id) ? 'Deleting…' : 'Delete topic'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {importResults && (
          <section className="mt-6 p-4 border rounded-md bg-white">
            <h3 className="font-semibold mb-2">Import Results</h3>
            <div className="text-sm">Created: {importResults.created ?? 0} · Duplicates: {importResults.duplicate ?? 0} · Failed: {importResults.failed ?? 0}</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  // build CSV of rows that are not created
                  const rows = Array.isArray(importResults.rows) ? importResults.rows.filter((r: any) => r.status !== 'created') : []
                  if (rows.length === 0) { alert('No failed or duplicate rows to download.'); return }
                  const header = ['row','status','id','error']
                  const csv = [header.join(',')].concat(rows.map((r: any) => [r.row, r.status, r.id ?? '', (r.error || '').replace(/\n/g, ' ')].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'import_failures.csv'
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(url)
                }}
                className="px-3 py-1 bg-slate-200 rounded-md text-sm"
              >
                Download failed/duplicate rows CSV
              </button>
              <button onClick={() => setImportResults(null)} className="px-3 py-1 bg-white border rounded-md text-sm">Clear</button>
            </div>
            <div className="mt-3 text-xs text-slate-600 max-h-40 overflow-auto">
              {Array.isArray(importResults.rows) ? importResults.rows.slice(0,50).map((r: any) => (
                <div key={r.row}>Row {r.row}: {r.status}{r.error ? ` — ${r.error}` : r.id ? ` (id=${r.id})` : ''}</div>
              )) : <div>No row details available.</div>}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold mb-2">Recent Questions</h2>
            <div className="text-sm text-slate-600">Total questions: <span className="font-medium">{questions.length}</span></div>
          </div>
            {questions.length === 0 ? (
              <div className="text-sm text-slate-600">No questions yet. Use the create API or the import tool to add questions.</div>
            ) : (
              <ul className="space-y-2">
                {questions.map(q => {
                  const hintCount = Array.isArray(q.hints) ? q.hints.length : 0
                  const hasThree = hintCount === 3
                  return (
                  <li key={q.id} className="p-3 border rounded-md bg-white flex justify-between items-start">
                    <div>
                      <div className="font-medium">{q.stem}</div>
                      <div className="text-sm text-slate-600">Answer: {q.answer} · Difficulty: {q.base_difficulty}</div>
                      <div className="mt-1 text-sm">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${hasThree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          Hints: {hintCount}
                        </span>
                        {!hasThree && (
                          <span className="ml-2 text-xs text-red-700">(should have 3 hints)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/teacher/questions/${q.id}/edit`)} className="text-sm text-slate-700 hover:underline">Edit</button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this question?')) return
                          const t = localStorage.getItem('token')
                          if (!t) { window.location.href = '/login'; return }
                          // optimistic: mark as deleting and disable button
                          setDeletingIds(prev => [...prev, q.id])
                          try {
                            const res = await fetch(`http://localhost:8000/api/teacher/questions/${q.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } })
                            if (!res.ok) throw new Error('Delete failed')
                            setQuestions(prev => prev.filter(p => p.id !== q.id))
                          } catch (e) {
                            alert('Failed to delete question')
                          } finally {
                            setDeletingIds(prev => prev.filter(id => id !== q.id))
                          }
                        }}
                        disabled={deletingIds.includes(q.id)}
                        className={`text-sm ${deletingIds.includes(q.id) ? 'text-gray-400' : 'text-red-600 hover:underline'}`}
                      >
                        {deletingIds.includes(q.id) ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </li>
                )
                })
              }
              </ul>
            )}
        </section>
      </div>
    </main>
  )
}
