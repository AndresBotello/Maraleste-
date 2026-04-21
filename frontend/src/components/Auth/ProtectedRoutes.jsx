import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Protege rutas que requieren autenticación.
 * Si el usuario no está logueado, redirige a /login.
 */
export function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f3]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

/**
 * Protege rutas exclusivas para administradores y docentes.
 * Si el usuario no tiene rol admin o docente, redirige a /customer/dashboard.
 */
export function AdminRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()
  const normalizedRole = String(profile?.rol || '').trim().toLowerCase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f3]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (profile && normalizedRole !== 'admin' && normalizedRole !== 'docente') {
    return <Navigate to="/customer/dashboard" replace />
  }

  return children
}

/**
 * Protege rutas exclusivas para administradores.
 * Si el usuario no es admin, redirige al dashboard correspondiente.
 */
export function AdminOnlyRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()
  const normalizedRole = String(profile?.rol || '').trim().toLowerCase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f3]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (profile && normalizedRole !== 'admin') {
    return <Navigate to="/customer/dashboard" replace />
  }

  return children
}

/**
 * Redirige usuarios ya autenticados fuera de login/register.
 * Admin → /admin/dashboard, Cliente → /customer/dashboard.
 * Espera a que el perfil esté disponible para decidir la ruta correcta.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()

  // Esperar mientras carga auth O mientras ya está autenticado pero el perfil aún no llega
  if (loading || (isAuthenticated && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f3]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">Cargando...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && profile) {
    const rol = String(profile?.rol || '').trim().toLowerCase()
    if (rol === 'admin' || rol === 'docente') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/customer/dashboard" replace />
  }

  return children
}

/**
 * Protege rutas exclusivas para clientes.
 * Admin/docente se redirige a /admin/dashboard.
 */
export function CustomerRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()
  const normalizedRole = String(profile?.rol || '').trim().toLowerCase()

  if (loading || (isAuthenticated && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f3]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (normalizedRole === 'admin' || normalizedRole === 'docente') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}
