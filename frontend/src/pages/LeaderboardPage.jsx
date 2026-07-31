import { useFetch } from '../hooks'
import { useParams, Link } from 'react-router-dom'
import { resultApi, testApi } from '../services/api'
import { LoadingState, ErrorState } from '../components/common/UI'
import { ArrowLeft } from 'lucide-react'

export default function LeaderboardPage() {
  const { testId } = useParams()
  const { data: board, loading, error, refetch } = useFetch(
    () => resultApi.leaderboard(testId), [testId]
  )
  // FIX: useFetch already unwraps res.data — so `test` is the TestDTO directly
  const { data: test } = useFetch(() => testApi.getById(testId), [testId])

  if (loading) return <LoadingState message="Loading leaderboard…" />
  if (error)   return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/my-tests" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leaderboard</h1>
          {/* FIX: was test.data?.testName — double unwrap bug */}
          {test && <p className="text-gray-500 dark:text-gray-400 text-sm">{test.testName}</p>}
        </div>
      </div>

      {!board?.length
        ? <div className="card p-16 text-center text-gray-400">No submissions yet.</div>
        : (
          <div className="card divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
            {board.map((entry, i) => {
              const pct    = entry.totalMarks > 0
                ? Math.round((entry.score / entry.totalMarks) * 100) : 0
              const medal  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
              const topThree = i < 3

              return (
                <div key={`${entry.email}-${i}`}
                  className={`flex items-center gap-4 px-5 py-4
                    ${topThree ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-white dark:bg-gray-900'}`}>
                  <div className="w-10 text-center">
                    {medal
                      ? <span className="text-2xl">{medal}</span>
                      : <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${topThree ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {entry.studentName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{entry.email}</p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className={`text-lg font-bold ${topThree ? 'text-amber-700 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {entry.score}
                      <span className="text-sm font-normal text-gray-400">/{entry.totalMarks}</span>
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 75 ? '#14b8a6' : pct >= 50 ? '#f59e0b' : '#ef4444'
                          }} />
                      </div>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
