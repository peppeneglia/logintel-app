import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const isDemo = useAuthStore((s) => s.isDemo)

  if (!user && !isDemo) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
