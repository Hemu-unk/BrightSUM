/*
How to use HeaderActions in pages

The purpose of this context is to allow any page to inject action buttons (e.g., “Exit Lesson”) 
into the global Header without duplicating header markup.

Basic Example (place in a page component):

  import React, { useEffect } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { useHeaderActions } from '../components/HeaderActionsContext'

  export default function MyPage() {
    const navigate = useNavigate()
    const { setActions } = useHeaderActions()

    useEffect(() => {
      // Inject a button in the header when this page is active
      setActions(
        <button
          onClick={() => navigate('/somewhere', { replace: true })}
          className="border-2 border-slate-900 text-slate-900 px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer hover:bg-slate-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]"
        >
          Exit
        </button>
      )

      // Cleanup on unmount so other pages can set their own actions
      return () => setActions(null)
    }, [navigate, setActions])

    return (
      <main>
        // page content
      </main>
    )
  }

  Notes:
- Only pages that render under BaseLayout can use this (HeaderActionsProvider is created there).
- Keep actions small and concise (e.g., inline buttons).
*/

import React, { createContext, useContext, useState, useMemo } from 'react'

type Ctx = {
  actions: React.ReactNode | null
  setActions: (node: React.ReactNode | null) => void
}

const HeaderActionsContext = createContext<Ctx | undefined>(undefined)

export const HeaderActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<React.ReactNode | null>(null)
  const value = useMemo(() => ({ actions, setActions }), [actions])
  return (
    <HeaderActionsContext.Provider value={value}>
      {children}
    </HeaderActionsContext.Provider>
  )
}

export function useHeaderActions() {
  const ctx = useContext(HeaderActionsContext)
  if (!ctx) throw new Error('useHeaderActions must be used within HeaderActionsProvider')
  return ctx
}
