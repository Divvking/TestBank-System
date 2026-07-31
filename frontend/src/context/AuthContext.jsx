import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'tb_token'
const USER_KEY  = 'tb_user'

function parseUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(parseUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? null)

  const login = useCallback((authData) => {
    const { token: t, ...userData } = authData
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(t)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin   = user?.role === 'ADMIN'
  const isFaculty = user?.role === 'FACULTY'
  const isStudent = user?.role === 'STUDENT'
  const canManage = isAdmin || isFaculty

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAdmin, isFaculty, isStudent, canManage }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
