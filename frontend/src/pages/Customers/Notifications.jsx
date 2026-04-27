import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService'
import notificationsStyles from './NotificationsStyles'
import customerSharedStyles from './CustomerSharedStyles'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError('')
      const payload = await getMyNotifications(50)
      setNotifications(payload?.notifications || [])
      setUnreadCount(payload?.unreadCount || 0)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las notificaciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const formatDate = (value) => {
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

  const handleMarkOne = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) => prev.map((item) => item.id === notificationId ? { ...item, read: true } : item))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la notificación.')
    }
  }

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true)
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
      setUnreadCount(0)
    } catch (err) {
      setError(err.message || 'No se pudieron marcar todas como leídas.')
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="nt-root bg-[#f2f2f0] min-h-screen text-[#1a1a1a]">
      <style>{customerSharedStyles + notificationsStyles}</style>
      <header className="nt-header border-b border-black/5 sticky top-0 bg-[#f2f2f0]/95 backdrop-blur-md z-40">
        <div className="nt-shell px-4 md:px-8 lg:px-12 py-4 md:py-6 flex justify-between items-center">
          <Link to="/customer/dashboard" className="nt-brand text-lg md:text-xl font-light tracking-[0.3em] md:tracking-[0.4em] text-black hover:text-gray-600 transition">
            MARALESTE
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/customer/dashboard" className="text-xs md:text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="nt-shell px-4 md:px-8 lg:px-12 py-8 md:py-10 space-y-6 md:space-y-8">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="nt-title text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-black">Notificaciones</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Te avisamos cuando se publica un nuevo curso en la plataforma.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="nt-pill inline-flex px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-black/10 bg-white text-[10px] md:text-xs uppercase tracking-wider text-gray-600">
              Sin leer: {unreadCount}
            </span>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markingAll || unreadCount === 0}
              className="nt-btn px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-black/15 text-[10px] md:text-xs uppercase tracking-wider text-black hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              Marcar todas leídas
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-700">{error}</div>}

        <section className="nt-panel rounded-3xl border border-black/5 bg-white p-4 md:p-6 shadow-lg shadow-black/5">
          {loading ? (
            <p className="text-xs md:text-sm text-gray-500">Cargando notificaciones...</p>
          ) : notifications.length === 0 ? (
            <p className="text-xs md:text-sm text-gray-500">No tienes notificaciones por ahora.</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`nt-item rounded-2xl border p-3 md:p-4 ${notification.read ? 'border-black/10 bg-white' : 'is-unread border-blue-200 bg-blue-50/50'}`}
                >
                  <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">{notification.type || 'Notificación'}</p>
                      <h3 className="text-base md:text-lg font-medium text-black">{notification.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 md:gap-3">
                        {notification.type === 'nuevo_curso' && notification.courseId && (
                          <Link
                            to={`/course/${notification.courseId}?from=dashboard`}
                            className="inline-block text-[10px] md:text-xs uppercase tracking-wider text-blue-700 underline"
                          >
                            Ver curso
                          </Link>
                        )}
                        {notification.type === 'nuevo_mensaje' && (
                          <Link
                            to="/customer/messages"
                            className="inline-block text-[10px] md:text-xs uppercase tracking-wider text-blue-700 underline"
                          >
                            Ir a mensajes
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-shrink-0">
                      <p className="text-[10px] md:text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(notification.id)}
                          className="nt-mini-btn px-2 md:px-3 py-1 md:py-2 rounded-lg border border-blue-200 text-[10px] uppercase tracking-wider text-blue-700 hover:bg-blue-700 hover:text-white transition"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Notifications
