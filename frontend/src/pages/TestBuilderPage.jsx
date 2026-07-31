import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { testApi, questionApi, categoryApi } from '../services/api'
import { LoadingState } from '../components/common/UI'
import { Plus, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    testName: '',
    duration: 60,
    isRandomized: false,
    startTime: '',
    endTime: ''
  })

  const [selected, setSelected] = useState([])
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState({ categoryId: '', difficulty: '', q: '' })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data))

    questionApi.getAll({ page: 0, size: 500 }).then(r => {
      const data = r.data
      setQuestions(Array.isArray(data) ? data : (data?.content ?? []))
    })

    if (isEdit) {
      testApi.getById(id)
        .then(r => {
          const t = r.data
          setForm({
            testName: t.testName,
            duration: t.duration,
            isRandomized: t.isRandomized,
            startTime: t.startTime ? t.startTime.slice(0, 16) : '',
            endTime: t.endTime ? t.endTime.slice(0, 16) : ''
          })
          setSelected((t.questions ?? []).map(q => ({
            questionId: q.questionId,
            marks: q.marks,
            sequenceOrder: q.sequenceOrder,
            questionText: q.questionText,
            difficulty: q.difficulty
          })))
        })
        .catch(() => {
          toast.error('Failed to load test')
          navigate('/tests')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEdit, navigate])

  const filteredQ = questions.filter(q => {
    const inSelected = selected.some(s => s.questionId === q.questionId)
    if (inSelected) return false
    if (filter.categoryId && String(q.categoryId) !== String(filter.categoryId)) return false
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false
    if (filter.q && !q.questionText.toLowerCase().includes(filter.q.toLowerCase())) return false
    return true
  })

  const addQuestion = (q) => {
    setSelected(s => [
      ...s,
      {
        questionId: q.questionId,
        marks: Number(q.defaultMarks),
        sequenceOrder: s.length + 1,
        questionText: q.questionText,
        difficulty: q.difficulty
      }
    ])
  }

  const removeQuestion = (qId) => {
    setSelected(s =>
      s.filter(x => x.questionId !== qId)
        .map((x, i) => ({ ...x, sequenceOrder: i + 1 }))
    )
  }

  const updateMarks = (qId, marks) => {
    setSelected(s =>
      s.map(x => x.questionId === qId ? { ...x, marks: Number(marks) } : x)
    )
  }

  const totalMarks = selected.reduce((sum, s) => sum + Number(s.marks || 0), 0)

  const handleSave = async () => {
    if (!form.testName.trim()) return toast.error('Test name required')
    if (!selected.length) return toast.error('Add at least one question')
    if (form.startTime && form.endTime && form.endTime < form.startTime) {
      return toast.error('End time must be after start time')
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        questions: selected.map(s => ({
          questionId: s.questionId,
          marks: s.marks,
          sequenceOrder: s.sequenceOrder
        }))
      }

      if (isEdit) await testApi.update(id, payload)
      else await testApi.create(payload)

      toast.success(isEdit ? 'Test updated' : 'Test created')
      navigate('/tests')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Edit Test' : 'Create Test'}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/tests')} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : (isEdit ? 'Update Test' : 'Create Test')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Test Settings</h2>

            <div>
              <label className="label">Test Name</label>
              <input
                className="input"
                value={form.testName}
                placeholder="e.g. Midterm Exam"
                onChange={e => setForm(f => ({ ...f, testName: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Duration (minutes)</label>
              <input
                className="input"
                type="number"
                min={5}
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Start Time</label>
              <input
                type="datetime-local"
                className="input"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">End Time</label>
              <input
                type="datetime-local"
                className="input"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRandomized}
                onChange={e => setForm(f => ({ ...f, isRandomized: e.target.checked }))}
                className="rounded text-teal-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Randomize question order</span>
            </label>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              Question Pool ({filteredQ.length})
            </h2>

            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-8 text-xs"
                  placeholder="Search questions…"
                  value={filter.q}
                  onChange={e => setFilter(f => ({ ...f, q: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="input text-xs"
                  value={filter.difficulty}
                  onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  className="input text-xs"
                  value={filter.categoryId}
                  onChange={e => setFilter(f => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {filteredQ.map(q => (
                <div
                  key={q.questionId}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                      {q.questionText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge-${q.difficulty} text-xs`}>{q.difficulty}</span>
                      <span className="text-xs text-gray-400">{q.defaultMarks} marks</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addQuestion(q)}
                    className="shrink-0 p-1 rounded text-gray-400 hover:text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-800 transition"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              ))}
              {!filteredQ.length && (
                <p className="text-xs text-gray-400 text-center py-4">No matching questions</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                Selected Questions ({selected.length})
              </h2>
              <div className="text-sm font-medium text-teal-600">
                Total: {totalMarks} marks
              </div>
            </div>

            {!selected.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Plus size={28} className="mb-2 opacity-40" />
                <p className="text-sm">Add questions from the pool</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selected.map((s, idx) => (
                  <div
                    key={s.questionId}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                        {s.questionText}
                      </p>
                      <span className={`badge-${s.difficulty} text-xs mt-0.5`}>{s.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        className="input w-20 text-xs text-center py-1"
                        value={s.marks}
                        onChange={e => updateMarks(s.questionId, e.target.value)}
                      />
                      <span className="text-xs text-gray-400">marks</span>
                      <button
                        onClick={() => removeQuestion(s.questionId)}
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}