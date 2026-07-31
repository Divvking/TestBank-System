import { useFetch } from '../hooks'
import { testApi, attemptApi } from '../services/api'
import { LoadingState, ErrorState } from '../components/common/UI'
import { Link } from 'react-router-dom'
import { Play, CheckCircle, Clock, BookOpen, Hash } from 'lucide-react'

export default function MyTestsPage() {
  const { data: tests,    loading: l1, error: e1, refetch } = useFetch(testApi.getAll)
  const { data: attempts, loading: l2 }                      = useFetch(attemptApi.getMy)

  if (l1 || l2) return <LoadingState />
  if (e1)       return <ErrorState message={e1} onRetry={refetch} />

  // FIX: prefer latest submitted attempt; fall back to in-progress
  const getBestAttempt = (testId) => {
    const all = (attempts ?? []).filter(a => a.testId === testId)
    return (
      all.find(a => a.status === 'SUBMITTED' || a.status === 'AUTO_SUBMITTED') ||
      all.find(a => a.status === 'IN_PROGRESS') ||
      null
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Tests</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {tests?.length ?? 0} tests available
        </p>
      </div>

      {!tests?.length
        ? <div className="card p-20 text-center text-gray-400">No tests available right now.</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tests.map(t => {
              const attempt = getBestAttempt(t.testId)
              const done    = attempt && (attempt.status === 'SUBMITTED' || attempt.status === 'AUTO_SUBMITTED')
              const inProg  = attempt?.status === 'IN_PROGRESS'

              return (
                <div key={t.testId} className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 leading-snug">{t.testName}</h3>
                    {done   && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 shrink-0"><CheckCircle size={11}/>Done</span>}
                    {inProg && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 shrink-0"><Clock size={11}/>In Progress</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Hash size={14} className="text-teal-500 mb-1" />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{t.questionCount}</span>
                      <span className="text-gray-400 text-xs">Questions</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Clock size={14} className="text-blue-500 mb-1" />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{t.duration}</span>
                      <span className="text-gray-400 text-xs">Minutes</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <BookOpen size={14} className="text-purple-500 mb-1" />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{t.totalMarks}</span>
                      <span className="text-gray-400 text-xs">Marks</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">Created by {t.createdBy}</p>

                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                    {done ? (
                      <div className="flex gap-2">
                        <Link to={`/results/${attempt.attemptId}`}
                          className="btn-secondary text-xs flex-1 justify-center">
                          View Result
                        </Link>
                        <Link to={`/results/leaderboard/${t.testId}`}
                          className="btn-secondary text-xs flex-1 justify-center">
                          Leaderboard
                        </Link>
                      </div>
                    ) : inProg ? (
                      <Link to={`/take-test/${t.testId}`}
                        className="btn-primary w-full text-xs justify-center">
                        <Clock size={13}/> Continue Test
                      </Link>
                    ) : (
                      <Link to={`/take-test/${t.testId}`}
                        className="btn-primary w-full text-xs justify-center">
                        <Play size={13}/> Start Test
                      </Link>
                    )}
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
