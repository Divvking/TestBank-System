import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import { Spinner } from '../components/common/UI'
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data)
      toast.success(`Welcome back, ${data.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-teal-800 to-teal-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <BookOpen size={28} />
          <span className="text-xl font-bold">TestBank</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Manage tests.<br />Track progress.<br />Drive results.
          </h1>
          <p className="text-teal-100 text-lg">
            A complete platform for question banks, test creation, and performance analytics.
          </p>
        </div>
        <p className="text-teal-300 text-sm">For once you have tasted flight you will walk the earth with your eyes turned skywards.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="flex items-center gap-2 lg:hidden">
            <BookOpen size={22} className="text-teal-600" />
            <span className="text-lg font-bold text-teal-700">TestBank</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 hover:underline font-medium">Register</Link>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}