import { useFetch } from '../hooks'
import { useParams, Link } from 'react-router-dom'
import { resultApi } from '../services/api'
import { LoadingState, ErrorState } from '../components/common/UI'
import { Trophy, CheckCircle, XCircle, Clock, Target, Award } from 'lucide-react'

export default function ResultPage() {
  const { attemptId } = useParams()
  const { data: result, loading, error, refetch } = useFetch(
    () => resultApi.getByAttempt(attemptId), [attemptId]
  )

  if (loading) return <LoadingState message="Loading results…" />
  if (error)   return <ErrorState message={error} onRetry={refetch} />
  if (!result) return null

  const pct = result.totalMarks > 0
    ? Math.round((result.score / result.totalMarks) * 100) : 0

  const grade = pct >= 90 ? { label: 'A+', color: 'text-green-600'  }
              : pct >= 75 ? { label: 'A',  color: 'text-teal-600'   }
              : pct >= 60 ? { label: 'B',  color: 'text-blue-600'   }
              : pct >= 45 ? { label: 'C',  color: 'text-yellow-600' }
              :             { label: 'F',  color: 'text-red-600'     }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Score card */}
      <div className="card p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/20 mb-2">
          <Trophy size={36} className="text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{result.testName}</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Submitted {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '—'}
          </p>
        </div>

        <div className="flex items-end justify-center gap-2">
          <span className={`text-7xl font-black ${grade.color}`}>{pct}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { icon: Target, label: 'Score', value: `${result.score} / ${result.totalMarks}`, color: 'text-teal-600' },
            { icon: CheckCircle, label: 'Correct', value: `${result.correctAnswers} / ${result.totalQuestions}`, color: 'text-green-600' },
            { icon: Award, label: 'Grade', value: grade.label, color: grade.color },
            { icon: Trophy, label: 'Rank', value: result.rankPosition ? `#${result.rankPosition}` : '—', color: 'text-amber-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-3 text-center">
              <Icon size={18} className={`${color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Answer breakdown */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Answer Breakdown</h2>
        <div className="space-y-3">
          {(result.responses ?? []).map((r, i) => (
            <div key={r.responseId}
              className={`p-4 rounded-xl border-l-4 ${r.isCorrect
                ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                : 'border-red-400 bg-red-50 dark:bg-red-900/10'}`}>
              <div className="flex items-start gap-3">
                {r.isCorrect
                  ? <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
                  : <XCircle    size={18} className="text-red-500 mt-0.5 shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <span className="text-gray-400 mr-2">Q{i+1}.</span>{r.questionText}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded ${r.isCorrect
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      Your answer: {r.selectedOption ?? 'Not answered'}
                    </span>
                    {!r.isCorrect && (
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        Correct: {r.correctOption}
                      </span>
                    )}
                    <span className="text-gray-400">{r.marksAwarded} marks</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3 pb-4">
        <Link to="/my-tests" className="btn-secondary">Back to Tests</Link>
        <Link to="/dashboard" className="btn-primary">Dashboard</Link>
      </div>
    </div>
  )
}
