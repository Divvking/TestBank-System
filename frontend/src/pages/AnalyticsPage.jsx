import { useState } from 'react'
import { useFetch } from '../hooks'
import { analyticsApi, resultApi, testApi } from '../services/api'
import { LoadingState, ErrorState } from '../components/common/UI'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { Trophy, TrendingUp, Target } from 'lucide-react'

const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']

export default function AnalyticsPage() {
  const { data: stats,   loading: l1, error: e1, refetch: r1 } = useFetch(analyticsApi.dashboard)
  const { data: qPerf,   loading: l2, error: e2, refetch: r2 } = useFetch(analyticsApi.questionPerformance)
  const { data: tests,   loading: l3 }                          = useFetch(testApi.getAll)
  const [selectedTest, setSelectedTest] = useState('')
  const { data: board, loading: l4 }    = useFetch(
    () => selectedTest ? resultApi.leaderboard(selectedTest) : Promise.resolve({ data: [] }),
    [selectedTest]
  )

  if (l1 || l2 || l3) return <LoadingState />
  if (e1) return <ErrorState message={e1} onRetry={r1} />
  if (e2) return <ErrorState message={e2} onRetry={r2} />

  // Difficulty breakdown from question performance
  const diffData = ['easy','medium','hard'].map(d => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    questions: (qPerf ?? []).filter(q => q.difficulty === d).length,
    accuracy:  (qPerf ?? []).filter(q => q.difficulty === d)
                 .reduce((s, q) => s + Number(q.accuracyPct || 0), 0) /
               Math.max(1, (qPerf ?? []).filter(q => q.difficulty === d).length)
  }))

  // Top 10 hardest questions (lowest accuracy)
  const hardest = [...(qPerf ?? [])]
    .filter(q => q.totalAttempts > 0)
    .sort((a, b) => Number(a.accuracyPct) - Number(b.accuracyPct))
    .slice(0, 10)

  // Category accuracy pie
  const catMap = {}
  ;(qPerf ?? []).forEach(q => {
    const cat = q.categoryName || 'Uncategorized'
    if (!catMap[cat]) catMap[cat] = { name: cat, total: 0, correct: 0 }
    catMap[cat].total   += Number(q.totalAttempts || 0)
    catMap[cat].correct += Number(q.correctCount  || 0)
  })
  const catData = Object.values(catMap).map(c => ({
    name:     c.name,
    accuracy: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          System-wide performance and insights
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tests',         value: stats?.totalTests,     color: 'bg-teal-500'   },
          { label: 'Questions',     value: stats?.totalQuestions, color: 'bg-blue-500'   },
          { label: 'Students',      value: stats?.totalStudents,  color: 'bg-purple-500' },
          { label: 'Avg Score',     value: stats?.averageScore != null
              ? Number(stats.averageScore).toFixed(1) : '—',      color: 'bg-amber-500'  },
        ].map(k => (
          <div key={k.label} className="card p-5 flex items-center gap-4">
            <div className={`w-2 h-12 rounded-full ${k.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{k.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty accuracy bar */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp size={18} className="text-teal-500" /> Accuracy by Difficulty
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={diffData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" radius={[6,6,0,0]}>
                {diffData.map((_, i) => (
                  <Cell key={i} fill={['#10b981','#f59e0b','#ef4444'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category accuracy pie */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Target size={18} className="text-blue-500" /> Accuracy by Category
          </h2>
          {catData.length === 0
            ? <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catData} dataKey="accuracy" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} label={({ name, accuracy }) => `${name}: ${accuracy}%`}
                    labelLine={false}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Hardest questions table */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Hardest Questions (by accuracy)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Question','Category','Difficulty','Attempts','Correct','Accuracy'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {hardest.length === 0
                ? <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">No attempt data yet</td></tr>
                : hardest.map(q => (
                  <tr key={q.questionId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-3 max-w-xs">
                      <span className="block truncate text-gray-700 dark:text-gray-300" title={q.questionText}>
                        {q.questionText}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{q.categoryName || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`badge-${q.difficulty}`}>{q.difficulty}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{q.totalAttempts}</td>
                    <td className="px-3 py-3 text-green-600 whitespace-nowrap">{q.correctCount}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full w-20">
                          <div className="h-full bg-red-400 rounded-full"
                            style={{ width: `${q.accuracyPct}%` }} />
                        </div>
                        <span className="text-red-600 font-medium text-xs">{Number(q.accuracyPct).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard section */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Leaderboard
          </h2>
          <select className="input w-auto text-sm" value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}>
            <option value="">Select a test…</option>
            {(tests ?? []).map(t => (
              <option key={t.testId} value={t.testId}>{t.testName}</option>
            ))}
          </select>
        </div>

        {!selectedTest
          ? <p className="text-sm text-gray-400 text-center py-8">Select a test to view its leaderboard</p>
          : l4
          ? <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
          : !(board ?? []).length
          ? <p className="text-sm text-gray-400 text-center py-8">No submissions yet for this test</p>
          : (
            <div className="space-y-2">
              {(board ?? []).map((entry, i) => {
                const pct = entry.totalMarks > 0
                  ? Math.round((entry.score / entry.totalMarks) * 100) : 0
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <div key={i}
                    className={`flex items-center gap-4 p-3 rounded-xl transition
                      ${i < 3 ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <span className="w-8 text-center font-bold text-gray-500 dark:text-gray-400">
                      {medal || `#${entry.rank}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.studentName}</p>
                      <p className="text-xs text-gray-400">{entry.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {entry.score} / {entry.totalMarks}
                      </p>
                      <p className="text-xs text-teal-600">{pct}%</p>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}
