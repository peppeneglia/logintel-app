import { Outlet } from 'react-router-dom'
// TODO: Riabilitare auth guard quando Supabase è configurato
// import { Navigate } from 'react-router-dom'
// import { useAuthStore } from '../../stores/authStore'

export function ProtectedRoute() {
  // TODO: Riabilitare controllo autenticazione
  // const user = useAuthStore((s) => s.user)
  // if (!user) {
  //   return <Navigate to="/login" replace />
  // }

  return <Outlet />
}
