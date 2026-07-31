import { useState } from 'react'
import { useFetch } from '../hooks'
import { questionApi, categoryApi } from '../services/api'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import { LoadingState, ErrorState } from '../components/common/UI'
import { useAuth } from '../context/AuthContext'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  questionText: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctOption: 'A', difficulty: 'easy', defaultMarks: 1, categoryId: ''
}

export default function QuestionsPage() {
  const { canManage } = useAuth()
  // Paginated endpoint — unwrap .content for the array
  const { data: raw, loading, error, refetch } = useFetch(
    () => questionApi.getAll({ page: 0, size: 500 })
  )
  const questions = Array.isArray(raw) ? raw : (raw?.content ?? [])
  const { data: categories } = useFetch(categoryApi.getAll)

  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [filter,  setFilter]  = useState({ categoryId: '', difficulty: '' })

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (q)  => {
    setEditing(q.questionId)
    setForm({
      questionText: q.questionText, optionA: q.optionA, optionB: q.optionB,
      optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption,
      difficulty: q.difficulty, defaultMarks: q.defaultMarks,
      categoryId: q.categoryId || ''
    })
    setModal(true)
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, defaultMarks: Number(form.defaultMarks),
        categoryId: form.categoryId ? Number(form.categoryId) : null }
      if (editing) await questionApi.update(editing, payload)
      else         await questionApi.create(payload)
      toast.success(editing ? 'Question updated' : 'Question created')
      setModal(false)
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    try {
      await questionApi.delete(id)
      toast.success('Deleted')
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = questions.filter(q =>
    (!filter.categoryId || q.categoryId === Number(filter.categoryId)) &&
    (!filter.difficulty  || q.difficulty === filter.difficulty)
  )

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Question Bank</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{filtered.length} questions</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} />Add Question</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={filter.difficulty}
          onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select className="input w-auto" value={filter.categoryId}
          onChange={e => setFilter(f => ({ ...f, categoryId: e.target.value }))}>
          <option value="">All Categories</option>
          {(categories ?? []).map(c => (
            <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
          ))}
        </select>
      </div>

      <Table
        columns={[
          { key: 'questionId',   label: '#',          sortable: true },
          { key: 'questionText', label: 'Question',   sortable: true,
            render: v => <span className="max-w-xs block truncate" title={v}>{v}</span> },
          { key: 'categoryName', label: 'Category',   sortable: true,
            render: v => v || <span className="text-gray-300">—</span> },
          { key: 'difficulty',   label: 'Difficulty', sortable: true,
            render: v => <span className={`badge-${v}`}>{v}</span> },
          { key: 'defaultMarks', label: 'Marks',      sortable: true },
          { key: 'correctOption',label: 'Answer',
            render: v => <span className="font-mono font-bold text-teal-600">{v}</span> },
          { key: 'createdBy',    label: 'Created by' },
        ]}
        data={filtered}
        searchKeys={['questionText', 'categoryName', 'createdBy']}
        actions={row => (
          <>
            <button onClick={() => openEdit(row)}
              className="p-1.5 rounded text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition">
              <Pencil size={15} />
            </button>
            {canManage && (
              <button onClick={() => handleDelete(row.questionId)}
                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                <Trash2 size={15} />
              </button>
            )}
          </>
        )}
      />

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)}
        title={editing ? 'Edit Question' : 'New Question'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Question Text</label>
            <textarea className="input min-h-[80px] resize-none" name="questionText"
              value={form.questionText} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['A','B','C','D'].map(opt => (
              <div key={opt}>
                <label className="label">Option {opt}</label>
                <input className="input" name={`option${opt}`}
                  value={form[`option${opt}`]} onChange={handleChange} required />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Correct Answer</label>
              <select className="input" name="correctOption" value={form.correctOption} onChange={handleChange}>
                {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Default Marks</label>
              <input className="input" type="number" min="0.5" step="0.5" name="defaultMarks"
                value={form.defaultMarks} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" name="categoryId" value={form.categoryId} onChange={handleChange}>
              <option value="">— None —</option>
              {(categories ?? []).map(c => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
