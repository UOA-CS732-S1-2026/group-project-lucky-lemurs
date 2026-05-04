import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requireGuest = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (requireGuest) {
    if (user) {
      return <Navigate to="/" state={{ from: location }} replace />
    }
    return children
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  return <ProtectedRoute requireGuest>{children}</ProtectedRoute>
}