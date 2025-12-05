import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type Topic = { id: number; slug: string; name: string; description?: string; estimated_time_min?: number; objectives?: string }

export default function EditTopic(): React.ReactElement {
  const { id } = useParams()
  const topicId = id ? parseInt(id, 10) : null
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { navigate('/login'); return }
    fetch('http://localhost:8000/api/teacher/topics', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : Promise.reject('failed'))
      .then((data: Topic[]) => {
        const found = data.find(d => d.id === topicId)
        if (!found) { setError('Topic not found'); return }
        setTopic(found)
      })
      .catch(() => setError('Failed to load topic'))
      .finally(() => setLoading(false))
  }, [id, navigate, topicId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic) return
    const tkn = localStorage.getItem('token')
    if (!tkn) { navigate('/login'); return }
    try {
      const res = await fetch(`http://localhost:8000/api/teacher/topics/${topic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ slug: topic.slug, name: topic.name, description: topic.description, estimated_time_min: topic.estimated_time_min, objectives: topic.objectives })
      })
      if (!res.ok) {
        const js = await res.json().catch(() => ({}))
        throw new Error(js.detail || 'Failed to update topic')
      }
      navigate('/teacher/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to update topic')
    }
  }

  if (loading) return <div className="p-8">Loading…</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!topic) return <div className="p-8">No topic selected</div>

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md border">
        <h1 className="text-2xl font-semibold mb-4">Edit Topic</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Slug (machine key)</label>
            <input value={topic.slug} onChange={e => setTopic({...topic, slug: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Name (display)</label>
            <input value={topic.name} onChange={e => setTopic({...topic, name: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description (optional)</label>
            <textarea value={topic.description || ''} onChange={e => setTopic({...topic, description: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Estimated time (minutes)</label>
            <input type="number" value={topic.estimated_time_min ?? ''} onChange={e => setTopic({...topic, estimated_time_min: e.target.value === '' ? undefined : parseInt(e.target.value, 10)})} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Objectives (one per line or paragraph)</label>
            <textarea value={topic.objectives || ''} onChange={e => setTopic({...topic, objectives: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            <button type="button" onClick={() => navigate('/teacher/dashboard')} className="px-4 py-2 border rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </main>
  )
}
