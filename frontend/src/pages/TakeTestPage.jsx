import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi, attemptApi, responseApi, resultApi } from '../services/api'
import { LoadingState } from '../components/common/UI'
import Timer from '../components/common/Timer'
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TakeTestPage() {
  const { testId }   = useParams()
  const navigate     = useNavigate()

  const [test,       setTest]       = useState(null)
  const [attempt,    setAttempt]    = useState(null)
  const [current,    setCurrent]    = useState(0)
  const [answers,    setAnswers]    = useState({})
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)   // guard against double-fire from timer

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [testRes, attemptRes] = await Promise.all([
          testApi.getById(testId),
          attemptApi.start(testId),   // returns existing IN_PROGRESS or creates new
        ])
        if (cancelled) return
        setTest(testRes.data)
        setAttempt(attemptRes.data)

        // Rehydrate already-saved answers for this attempt
        try {
          const savedRes = await responseApi.getByAttempt(attemptRes.data.attemptId)
          if (!cancelled && savedRes.data?.length) {
            const saved = {}
            savedRes.data.forEach(r => {
              if (r.selectedOption) saved[r.questionId] = r.selectedOption
            })
            setAnswers(saved)
          }
        } catch { /* ignore — non-critical */ }
      } catch (err) {
        if (cancelled) return
        toast.error(err?.response?.data?.message || 'Could not start test')
        navigate('/my-tests')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [testId])  // eslint-disable-line react-hooks/exhaustive-deps

  const saveAnswer = useCallback(async (questionId, option) => {
    if (!attempt) return
    setAnswers(prev => ({ ...prev, [questionId]: option }))
    try {
      await responseApi.save(attempt.attemptId, { questionId, selectedOption: option })
    } catch { /* silently ignore — answer stored in state */ }
  }, [attempt])

  const handleSubmit = useCallback(async (auto = false) => {
    if (!attempt || submittingRef.current) return
    if (!auto) {
      const answered = Object.keys(answers).length
      const total    = test?.questions?.length ?? 0
      if (!window.confirm(
        `Submit test? You've answered ${answered}/${total} question${total !== 1 ? 's' : ''}.`
      )) return
    }
    submittingRef.current = true
    setSubmitting(true)
    try {
      await attemptApi.submit(attempt.attemptId, auto ? 'auto' : 'manual')
      await resultApi.compute(attempt.attemptId)
      toast.success('Test submitted!')
      navigate(`/results/${attempt.attemptId}`)
    } catch (err) {
      // If already submitted (e.g. race between timer and manual submit), still navigate
      const msg = err?.response?.data?.message ?? ''
      if (msg.includes('already submitted')) {
        try { await resultApi.compute(attempt.attemptId) } catch { /* already computed */ }
        navigate(`/results/${attempt.attemptId}`)
        return
      }
      toast.error(msg || 'Submit failed — please try again.')
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [attempt, answers, test, navigate])

  if (loading) return <LoadingState message="Starting test…" />
  if (!test || !attempt) return null

  const questions = test.questions ?? []
  const q         = questions[current]
  const answered  = Object.keys(answers).length
  const progress  = questions.length > 0
    ? Math.round((answered / questions.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* Header bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center
                      justify-between gap-3">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
            {test.testName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {answered} / {questions.length} answered
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Timer durationMinutes={test.duration} onExpire={() => handleSubmit(true)} />
          <button
            onClick={() => handleSubmit(false)}
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Question navigator sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Questions
            </p>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
              {questions.map((qq, i) => {
                const done = Boolean(answers[qq.questionId])
                return (
                  <button
                    key={qq.questionId}
                    onClick={() => setCurrent(i)}
                    className={`w-full aspect-square rounded-lg text-xs font-semibold transition
                      ${i === current
                        ? 'bg-teal-600 text-white shadow-sm'
                        : done
                          ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="space-y-1 pt-1 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-teal-100 dark:bg-teal-900/40 inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 inline-block" />
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="lg:col-span-3">
          {q ? (
            <div className="card p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                    Question {current + 1} of {questions.length}
                  </span>
                  <span className={`badge-${q.difficulty}`}>{q.difficulty}</span>
                  <span className="text-xs text-gray-400">{q.marks} marks</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium text-lg leading-relaxed">
                  {q.questionText}
                </p>
              </div>

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const text     = q[`option${opt}`]
                  const selected = answers[q.questionId] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => saveAnswer(q.questionId, opt)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2
                                  text-left transition-all duration-150
                        ${selected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-teal-200 ' +
                            'hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
                        }`}
                    >
                      {selected
                        ? <CheckCircle size={20} className="text-teal-600 shrink-0" />
                        : <Circle     size={20} className="text-gray-300 shrink-0" />
                      }
                      <span className={`text-sm ${
                        selected
                          ? 'text-teal-700 dark:text-teal-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        <span className="font-bold mr-2">{opt}.</span>{text}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center justify-between pt-2
                              border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                  disabled={current === questions.length - 1}
                  className="btn-secondary"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center text-gray-400">
              No questions in this test.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
