import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyNotifications, markNotificationAsRead } from '../../services/notificationService'
import Footer from './Footer'

function AdminLayout({ children, activeSection }) {
  const { profile, user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadMessageNotifications, setUnreadMessageNotifications] = useState(0)
  const [messageNotifications, setMessageNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [markingNotificationId, setMarkingNotificationId] = useState('')

  const userData = {
    nombre: profile ? `${profile.firstName} ${profile.lastName}` : user?.displayName || 'Usuario',
    email: profile?.email || user?.email || '',
    rol: profile?.rol === 'admin' ? 'Administrador' : profile?.rol === 'docente' ? 'Docente' : profile?.rol === 'cliente' ? 'Cliente' : 'Sin rol',
    imagen: profile?.fotoPerfil || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.firstName || 'U')}&background=000&color=fff&size=80`,
  }
  const isAdmin = profile?.rol === 'admin'

  const refreshMessageNotifications = async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setLoadingNotifications(true)
    }

    try {
      setNotificationError('')
      const payload = await getMyNotifications(30)
      const onlyMessageNotifications = (payload?.notifications || []).filter(
        (notification) => notification?.type === 'nuevo_mensaje'
      )
      const unreadMessages = onlyMessageNotifications.filter((notification) => !notification?.read).length

      setMessageNotifications(onlyMessageNotifications)
      setUnreadMessageNotifications(unreadMessages)
    } catch {
      if (showLoader) {
        setNotificationError('No se pudieron cargar las notificaciones de mensajes.')
      }
      // Evita romper la navegación del panel si falla esta consulta.
    } finally {
      if (showLoader) {
        setLoadingNotifications(false)
      }
    }
  }

  useEffect(() => {
    refreshMessageNotifications()

    const intervalId = setInterval(() => {
      refreshMessageNotifications()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  const formatNotificationDate = (value) => {
    if (!value) return ''
    try {
      const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value)
      return date.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleOpenNotificationsModal = () => {
    setProfileModalOpen(false)
    setNotificationsModalOpen(true)
    refreshMessageNotifications({ showLoader: true })
  }

  const handleGoToMessages = () => {
    setNotificationsModalOpen(false)
    navigate('/admin/messages')
  }

  const handleMarkMessageNotificationAsRead = async (notificationId) => {
    try {
      setMarkingNotificationId(notificationId)
      await markNotificationAsRead(notificationId)

      setMessageNotifications((prev) => {
        const updated = prev.map((item) => item.id === notificationId ? { ...item, read: true } : item)
        const unread = updated.filter((item) => !item.read).length
        setUnreadMessageNotifications(unread)
        return updated
      })
    } catch {
      setNotificationError('No se pudo marcar la notificacion como leida.')
    } finally {
      setMarkingNotificationId('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sections = [
    { id: 'obras', label: 'Gestionar Obras', path: '/admin/obras' },
    { id: 'talleres', label: 'Crear Talleres', path: '/admin/talleres' },
    { id: 'cursos', label: 'Crear Cursos', path: '/admin/cursos' },
    { id: 'retos', label: 'Revisar Retos', path: '/admin/cursos/retos' },
    { id: 'mensajes', label: 'Mensajes', path: '/admin/messages' },
    { id: 'usuarios', label: 'Usuarios Registrados', path: '/admin/usuarios' },
    { id: 'ventas', label: 'Registrar Ventas', path: '/admin/ventas' },
  ].filter((section) => section.id !== 'usuarios' || isAdmin)

  return (
    <div className="bg-[#f2f2f0] text-[#1a1a1a] min-h-screen selection:bg-gray-200">
      {/* Header */}
      <header className="border-b border-black/5 sticky top-0 bg-[#f2f2f0]/95 backdrop-blur-md z-40">
        <div className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
          <Link to="/admin/dashboard" className="text-lg md:text-xl font-light tracking-[0.3em] md:tracking-[0.4em] text-black hover:opacity-75 transition">
            MARALESTE
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6">
            {/* Desktop Navigation */}
            <Link 
              to="/" 
              className="hidden md:block text-[11px] uppercase tracking-[0.5em] text-gray-500 hover:text-black transition font-medium"
            >
              Inicio
            </Link>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={handleOpenNotificationsModal}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/70 text-black hover:border-black/20"
              aria-label="Mensajes"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75zm1.5.75l7.5 5.25 7.5-5.25" />
              </svg>
              {unreadMessageNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center font-semibold">
                  {unreadMessageNotifications > 99 ? '99+' : unreadMessageNotifications}
                </span>
              )}
            </button>
            
            {/* Profile Button */}
            <button
              onClick={() => setProfileModalOpen(!profileModalOpen)}
              className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black/10 hover:border-black transition overflow-hidden"
            >
              <img 
                src={userData.imagen} 
                alt="Perfil" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white/70 text-black hover:border-black/20 transition"
              aria-label="Menú"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-180px)] relative">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed md:relative w-64 border-r border-black/5 bg-white/50 backdrop-blur-sm top-[73px] md:top-auto md:sticky md:h-auto h-[calc(100vh-73px)] overflow-y-auto z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <nav className="p-6 md:p-8 space-y-4 pr-6">
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-6">Gestión</h3>
            
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-6 py-4 rounded-sm transition-all duration-300 text-[12px] uppercase tracking-[0.2em] font-medium ${
                activeSection === 'dashboard'
                  ? 'bg-black text-white shadow-lg shadow-black/10'
                  : 'text-gray-600 hover:text-black hover:bg-black/5'
              }`}
            >
              Dashboard
            </Link>
            
            {sections.map((section) => (
              <Link
                key={section.id}
                to={section.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-6 py-4 rounded-sm transition-all duration-300 text-[12px] uppercase tracking-[0.2em] font-medium ${
                  activeSection === section.id
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-gray-600 hover:text-black hover:bg-black/5'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {section.label}
                  {section.id === 'mensajes' && unreadMessageNotifications > 0 && (
                    <span className="inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-[18px] text-white normal-case tracking-normal">
                      {unreadMessageNotifications > 99 ? '99+' : unreadMessageNotifications}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-12 w-full md:w-auto">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setProfileModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl shadow-black/10 z-50 overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-black transition text-2xl"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="p-6 md:p-12 pt-16">
              {/* Profile Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-black/10 mx-auto mb-6 overflow-hidden">
                  <img
                    src={userData.imagen}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-light text-black mb-2">{userData.nombre}</h2>
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold">
                  {userData.rol}
                </p>
              </div>

              {/* User Info */}
              <div className="space-y-8">
                <div className="border-t border-black/10 pt-8">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-4">
                    Información
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-2">
                        Correo
                      </p>
                      <p className="text-sm text-gray-600 font-light break-all">{userData.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-2">
                        Rol
                      </p>
                      <p className="text-sm text-gray-600 font-light">{userData.rol}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-black/10 pt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileModalOpen(false)
                      navigate('/admin/profile')
                    }}
                    className="w-full px-6 py-3 border border-black/10 text-black hover:bg-black hover:text-white transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase rounded-sm"
                  >
                    Editar Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-6 py-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase rounded-sm"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notifications Modal */}
      {notificationsModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setNotificationsModalOpen(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6 pt-20 md:pt-24">
            <section className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white shadow-2xl shadow-black/10">
              <header className="flex items-center justify-between border-b border-black/10 px-4 md:px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Notificaciones</p>
                  <h3 className="mt-1 text-lg md:text-xl font-medium text-black">Mensajes nuevos</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsModalOpen(false)}
                  className="rounded-lg border border-black/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-gray-600 hover:text-black"
                >
                  Cerrar
                </button>
              </header>

              <div className="max-h-[65vh] overflow-y-auto p-4 md:p-6 space-y-4">
                {notificationError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{notificationError}</p>
                )}

                {loadingNotifications ? (
                  <p className="text-sm text-gray-500">Cargando notificaciones...</p>
                ) : messageNotifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes notificaciones de mensajes por ahora.</p>
                ) : (
                  messageNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      className={`rounded-2xl border p-4 ${notification.read ? 'border-black/10 bg-white' : 'border-blue-200 bg-blue-50/60'}`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Mensaje nuevo</p>
                          <h4 className="text-base font-medium text-black">{notification.title || 'Tienes un nuevo mensaje'}</h4>
                          <p className="text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatNotificationDate(notification.createdAt)}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkMessageNotificationAsRead(notification.id)}
                              disabled={markingNotificationId === notification.id}
                              className="rounded-lg border border-blue-200 px-2 md:px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-blue-700 hover:bg-blue-700 hover:text-white disabled:opacity-60 whitespace-nowrap"
                            >
                              {markingNotificationId === notification.id ? 'Marcando...' : 'Marcar leida'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleGoToMessages}
                            className="rounded-lg border border-black/10 px-2 md:px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white whitespace-nowrap"
                          >
                            Ir a mensajes
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminLayout
