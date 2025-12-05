// web/src/App.tsx
// React import not required with the new JSX transform
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

import BaseLayout from './components/BaseLayout'
import Home from './pages/Home'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import VerifyPage from './pages/VerifyPage'
import PasswordResetPage from './pages/PasswordResetPage'
import Dashboard from './pages/Dashboard'
import LessonsPage from './pages/LessonsPage'
import PracticePage from './pages/PracticePage'
import ExpressionsPractice from './pages/ExpressionsPractice'
import ExpressionsLesson from './pages/ExpressionsLesson'
import ExponentsLesson from './pages/ExponentsLesson'
import InequalitiesLesson from './pages/InequalitiesLesson'
import IntegersLesson from './pages/IntegersLesson'
import QuizzesPage from './pages/QuizzesPage'
import ExpressionsQuiz from './components/quizzes/ExpressionsQuiz'
import ReviewMistakes from './pages/ReviewMistakes'
import AdminApi from './pages/AdminApi'
import TeacherDashboard from './pages/TeacherDashboard'
import EditTopic from './pages/EditTopic'
import EditQuestion from './pages/EditQuestion'
import TeacherProtected from './components/TeacherProtected'

// One guard for all protected pages, still uses your BaseLayout
function ProtectedLayout() {
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { setOk(false); return }
    fetch('http://localhost:8000/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => setOk(r.ok))
      .catch(() => setOk(false))
  }, [])

  if (ok === null) return null
  if (!ok) return <Navigate to="/login" replace />
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route
          path="/"
          element={
            <BaseLayout>
              <Home />
            </BaseLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <BaseLayout>
              <SignupPage />
            </BaseLayout>
          }
        />
        <Route
          path="/verify"
          element={
            <BaseLayout>
              <VerifyPage />
            </BaseLayout>
          }
        />
        <Route
          path="/login"
          element={
            <BaseLayout>
              <LoginPage />
            </BaseLayout>
          }
        />
        <Route
          path="/password-reset"
          element={
            <BaseLayout>
              <PasswordResetPage />
            </BaseLayout>
          }
        />

        {/* protected group (everything inside requires a valid JWT/a valid login) */}
        <Route element={<ProtectedLayout />}>
          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />
          <Route element={<TeacherProtected />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/topics/:id/edit" element={<EditTopic />} />
            <Route path="/teacher/questions/:id/edit" element={<EditQuestion />} />
          </Route>
          <Route
            path="/lessons"
            element={
              <LessonsPage />
            }
          />
          <Route
            path="/lessons/expressions"
            element={
              <ExpressionsLesson />
            }
          />
          <Route
            path="/lessons/exponents"
            element={
              <ExponentsLesson />
            }
          />
          <Route
            path="/lessons/inequalities"
            element={
              <InequalitiesLesson />
            }
          />
          <Route
            path="/lessons/integers"
            element={
              <IntegersLesson />
            }
          />
          <Route
            path="/practice"
            element={
              <PracticePage />
            }
          />
          <Route
            path="/practice/:topic_slug"
            element={
              <ExpressionsPractice />
            }
          />
          <Route
            path="/quizzes"
            element={
              <QuizzesPage />
            }
          />
          <Route
            path="/quizzes/:topic_slug"
            element={
              <ExpressionsQuiz />
            }
          />
          <Route
            path="/review-mistakes"
            element={
              <ReviewMistakes />
            }
          />
          <Route
            path="/admin/api"
            element={
              <AdminApi />
            }
          />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
