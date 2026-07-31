import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDarkMode } from '../../hooks'
import { Moon, Sun, LogOut, BookOpen, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout, canManage } = useAuth()
  const navigate = useNavigate()
  const [dark, toggleDark] = useDarkMode()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-100 bg-white/80 backdrop-blur dark:bg-gray-900/80 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400 text-lg">
          <BookOpen size={22} />
          <span>TestBank</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard">Dashboard</NavLink>
          {canManage && <NavLink to="/questions">Questions</NavLink>}
          {canManage && <NavLink to="/tests">Tests</NavLink>}
          {!canManage && <NavLink to="/my-tests">My Tests</NavLink>}
          {canManage && <NavLink to="/analytics">Analytics</NavLink>}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button onClick={toggleDark}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <User size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
            <span className={`badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          </div>

          <button onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({ to, children }) {
  return (
    <Link to={to}
      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50
                 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-900/20 transition">
      {children}
    </Link>
  )
}
