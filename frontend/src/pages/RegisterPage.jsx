import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import { Spinner } from '../components/common/UI'
import { BookOpen, Mail, Lock, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: 3 })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.register({ ...form, roleId: Number(form.roleId) })
      login(data)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-teal-600" />
          <span className="text-lg font-bold text-teal-700">TestBank</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Already have one?{' '}
            <Link to="/login" className="text-teal-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" name="name" placeholder="Jane Smith"
                value={form.name} onChange={handleChange} required minLength={2} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" type="password" name="password"
                placeholder="Min. 6 characters" value={form.password}
                onChange={handleChange} required minLength={6} />
            </div>
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" name="roleId" value={form.roleId} onChange={handleChange}>
              <option value={3}>Student</option>
              <option value={2}>Faculty</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
