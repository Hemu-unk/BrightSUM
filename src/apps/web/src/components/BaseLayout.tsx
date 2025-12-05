import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import { HeaderActionsProvider } from './HeaderActionsContext'

interface BaseLayoutProps {
  children: React.ReactNode
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const location = useLocation()
  const hideHeaderOn = ['/', '/login', '/signup', '/verify', '/password-reset']
  const shouldHideHeader = hideHeaderOn.includes(location.pathname)
  return (
    <HeaderActionsProvider>
      <div className="min-h-screen">
        {!shouldHideHeader && <Header />}
        {children}
      </div>
    </HeaderActionsProvider>
  )
}

export default BaseLayout
