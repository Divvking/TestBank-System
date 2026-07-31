import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import QuestionsPage from './pages/QuestionsPage'
import TestsPage from './pages/TestsPage'
import TestBuilderPage from './pages/TestBuilderPage'
import TakeTestPage from './pages/TakeTestPage'
import ResultPage from './pages/ResultPage'
import AnalyticsPage from './pages/AnalyticsPage'
import MyTestsPage from './pages/MyTestsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminUsers from './pages/AdminUsers'

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>

          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/questions" element={
            <ProtectedRoute roles={['ADMIN','FACULTY']}>
              <QuestionsPage />
            </ProtectedRoute>
          }/>

          <Route path="/tests" element={
            <ProtectedRoute roles={['ADMIN','FACULTY']}>
              <TestsPage />
            </ProtectedRoute>
          }/>

          <Route path="/tests/new" element={
            <ProtectedRoute roles={['ADMIN','FACULTY']}>
              <TestBuilderPage />
            </ProtectedRoute>
          }/>

          <Route path="/tests/:id/edit" element={
            <ProtectedRoute roles={['ADMIN','FACULTY']}>
              <TestBuilderPage />
            </ProtectedRoute>
          }/>

          <Route path="/analytics" element={
            <ProtectedRoute roles={['ADMIN','FACULTY']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }/>

          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }/>

          <Route path="/my-tests" element={<MyTestsPage />} />

          <Route path="/take-test/:testId" element={
            <ProtectedRoute roles={['STUDENT']}>
              <TakeTestPage />
            </ProtectedRoute>
          }/>

          <Route path="/results/:attemptId" element={<ResultPage />} />
          <Route path="/results/leaderboard/:testId" element={<LeaderboardPage />} />

        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </AuthProvider>
  )
}