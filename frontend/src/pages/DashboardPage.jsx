import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks'
import { analyticsApi, testApi, attemptApi } from '../services/api'
import { StatCard, LoadingState } from '../components/common/UI'
import { Link } from 'react-router-dom'
import { BookOpen, Users, ClipboardList, BarChart2, Play, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user, canManage } = useAuth()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {canManage
            ? 'Manage your question bank and tests.'
            : 'View and take your assigned tests.'}
        </p>
      </div>

      {canManage ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  )
}

/* ================= ADMIN ================= */

function AdminDashboard() {
  const { data: stats, loading } = useFetch(analyticsApi.dashboard)

  if (loading) return <LoadingState />

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tests" value={stats?.totalTests} icon={ClipboardList} color="teal" />
        <StatCard label="Questions" value={stats?.totalQuestions} icon={BookOpen} color="blue" />
        <StatCard label="Students" value={stats?.totalStudents} icon={Users} color="purple" />
        <StatCard
          label="Avg Score"
          value={stats?.averageScore != null ? Number(stats.averageScore).toFixed(1) : '—'}
          icon={BarChart2}
          color="orange"
        />
      </div>
    </div>
  )
}

/* ================= STUDENT ================= */

function StudentDashboard() {
  const { data: attempts, loading } = useFetch(attemptApi.getMy)
  const { data: tests }             = useFetch(testApi.getAll)

  if (loading) return <LoadingState />

  const submittedTestIds = new Set()
  const inProgressTestIds = new Set()

  ;(attempts ?? []).forEach(a => {
    if (a.status === 'IN_PROGRESS') {
      inProgressTestIds.add(a.testId)
    } else {
      submittedTestIds.add(a.testId)
    }
  })

  const submitted = submittedTestIds.size
  const inProgress = inProgressTestIds.size

  const now = new Date()

  // 🔥 FILTERED TESTS (FINAL LOGIC)
  const visibleTests = (tests ?? []).filter(t => {
    const start = t.startTime ? new Date(t.startTime) : null
    const end = t.endTime ? new Date(t.endTime) : null

    // ❌ Remove submitted tests
    if (submittedTestIds.has(t.testId)) return false

    // ✅ Upcoming tests
    if (start && now < start) return true

    // ✅ Active tests
    if ((!start || now >= start) && (!end || now <= end)) return true

    // ✅ Recently ended (within 24 hours)
    if (end) {
      const diffHours = (now - end) / (1000 * 60 * 60)
      if (diffHours <= 24) return true
    }

    return false
  })

  const getTestState = (test) => {
    const start = test.startTime ? new Date(test.startTime) : null
    const end = test.endTime ? new Date(test.endTime) : null

    if (start && now < start) {
      return { status: 'upcoming', label: `Starts at ${start.toLocaleString()}` }
    }

    if (end && now > end) {
      return { status: 'ended', label: 'Quiz Ended' }
    }

    return { status: 'active', label: 'Start' }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Tests Available" value={visibleTests.length} icon={ClipboardList} color="teal" />
        <StatCard label="Completed" value={submitted} icon={CheckCircle} color="blue" />
        <StatCard label="In Progress" value={inProgress} icon={Play} color="orange" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Available Tests</h2>
          <Link to="/my-tests" className="text-sm text-teal-600 hover:underline">View all</Link>
        </div>

        <div className="space-y-2">
          {visibleTests.slice(0, 6).map(t => {
            const attempt = (attempts ?? []).find(a => a.testId === t.testId)
            const state = getTestState(t)

            return (
              <div key={t.testId}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.testName}</p>
                  <p className="text-xs text-gray-400">
                    {t.questionCount} questions · {t.duration} min · {t.totalMarks} marks
                  </p>

                  <p className="text-xs text-gray-400">
                    {t.startTime && `Starts: ${new Date(t.startTime).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.endTime && `Ends: ${new Date(t.endTime).toLocaleString()}`}
                  </p>
                </div>

                {attempt?.status === 'IN_PROGRESS'
                  ? (
                    <Link to={`/take-test/${t.testId}`}
                      className="btn-primary text-xs px-2 py-1 gap-1">
                      <Play size={12} />Continue
                    </Link>
                  )
                  : state.status === 'active'
                  ? (
                    <Link to={`/take-test/${t.testId}`}
                      className="btn-primary text-xs px-2 py-1 gap-1">
                      <Play size={12} />Start
                    </Link>
                  )
                  : (
                    <button
                      disabled
                      className="btn-primary text-xs px-2 py-1 opacity-50 cursor-not-allowed">
                      {state.label}
                    </button>
                  )
                }
              </div>
            )
          })}

          {!visibleTests.length && (
            <p className="text-sm text-gray-400 text-center py-6">No tests available</p>
          )}
        </div>
      </div>
    </div>
  )
}