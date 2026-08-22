import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { LoginPage } from '@/components/Auth/LoginPage'
import { DashboardPage } from '@/components/Dashboard/DashboardPage'
import { CardCapturePage } from '@/components/CardCapture/CardCapturePage'
import { LanguageSelector } from '@/components/Learning/LanguageSelector'
import { MediumSelector } from '@/components/Learning/MediumSelector'
import { QuizPage } from '@/components/Learning/QuizPage'
import { ResultsPage } from '@/components/Learning/ResultsPage'
import { CollectionsPage } from '@/components/Collections/CollectionsPage'
import { AdminLoginPage } from '@/components/Admin/AdminLoginPage'
import { AdminDashboard } from '@/components/Admin/AdminDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Lädt...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/capture"
            element={
              <ProtectedRoute>
                <CardCapturePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LanguageSelector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/medium/:mediumId/:language"
            element={
              <ProtectedRoute>
                <MediumSelector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/quiz/:mediumId/:language/:mode"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/results/:sessionId"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <CollectionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
