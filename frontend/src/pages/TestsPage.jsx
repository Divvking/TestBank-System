import { useFetch } from '../hooks'
import { testApi } from '../services/api'
import { LoadingState, ErrorState } from '../components/common/UI'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, Clock, BookOpen, Hash, Shuffle, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestsPage() {
  const { canManage } = useAuth()
  const { data: tests, loading, error, refetch } = useFetch(testApi.getAll)

  const handleDelete = async (id) => {
    if (!confirm('Delete this test? All attempts will be removed.')) return
    try { await testApi.delete(id); toast.success('Test deleted'); refetch() }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tests</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{tests?.length ?? 0} tests</p>
        </div>
        {canManage && (
          <Link to="/tests/new" className="btn-primary"><Plus size={16} />Create Test</Link>
        )}
      </div>

      {!tests?.length
        ? <div className="card p-16 text-center text-gray-400">No tests created yet.</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tests.map(t => (
              <div key={t.testId} className="card p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 leading-snug">{t.testName}</h3>
                  {t.isRandomized && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                      <Shuffle size={11} /> Random
                    </span>
                  )}
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

                <div className="text-xs text-gray-400">
                  By {t.createdBy} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                  {canManage ? (
                    <>
                      <Link to={`/tests/${t.testId}/edit`} className="btn-secondary text-xs flex-1 justify-center">
                        <Pencil size={13} /> Edit
                      </Link>
                      <Link to={`/results/leaderboard/${t.testId}`} className="btn-secondary text-xs flex-1 justify-center">
                        Leaderboard
                      </Link>
                      <button onClick={() => handleDelete(t.testId)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <Link to={`/take-test/${t.testId}`} className="btn-primary text-xs flex-1 justify-center">
                      Start Test
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
