import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth()
  const location = useLocation()

  if (!token || !user)
    return <Navigate to="/login" state={{ from: location }} replace />

  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />

  return children
}
