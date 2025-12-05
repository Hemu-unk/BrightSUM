import React, { useEffect, useState } from 'react'

type Todo = {
  id: string
  text: string
  done: boolean
}

const STORAGE_KEY = 'brightsum_todos_v1'

export default function TodoChecklist(): JSX.Element {
  const [items, setItems] = useState<Todo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Todo[]
    } catch (e) {
      // ignore
    }
    // default items (matches dashboard example)
    return [
      { id: 't1', text: "Finish Lesson 3", done: false },
      { id: 't2', text: "Practice 5 fraction problems", done: true },
      { id: 't3', text: "Review yesterday's mistakes", done: true },
      { id: 't4', text: "Finish Today's Goal", done: false }
    ]
  })

  const [newText, setNewText] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  const toggle = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  const add = () => {
    const t = newText.trim()
    if (!t) return
    setItems(prev => [{ id: String(Date.now()), text: t, done: false }, ...prev])
    setNewText('')
  }

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const doneCount = items.filter(i => i.done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-3xl font-black text-slate-900">To Do</h4>
        <span className="text-sm text-slate-600">{doneCount}/{items.length} done</span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 border border-slate-200 rounded-md"
            placeholder="Add a task"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add() }}
          />
          <button onClick={add} className="px-4 py-2 bg-slate-900 text-white rounded-md">Add</button>
        </div>

        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(item.id)}
                  className="w-5 h-5"
                />
                <span className={`font-semibold ${item.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.text}</span>
              </label>
              <button onClick={() => remove(item.id)} className="text-sm text-red-500 hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
