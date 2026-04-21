import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService'

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
    <div className="bg-[#f2f2f0] min-h-screen text-[#1a1a1a]">
      <header className="border-b border-black/5 sticky top-0 bg-[#f2f2f0]/95 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/customer/dashboard" className="text-xl font-light tracking-[0.4em] text-black hover:text-gray-600 transition">
            MARALESTE
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/customer/dashboard" className="text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-black">Notificaciones</h1>
            <p className="text-gray-500 mt-2">Te avisamos cuando se publica un nuevo curso en la plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex px-3 py-1 rounded-full border border-black/10 bg-white text-xs uppercase tracking-wider text-gray-600">
              Sin leer: {unreadCount}
            </span>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markingAll || unreadCount === 0}
              className="px-4 py-2 rounded-xl border border-black/15 text-xs uppercase tracking-wider text-black hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              Marcar todas leídas
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg shadow-black/5">
          {loading ? (
            <p className="text-sm text-gray-500">Cargando notificaciones...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No tienes notificaciones por ahora.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-2xl border p-4 ${notification.read ? 'border-black/10 bg-white' : 'border-blue-200 bg-blue-50/50'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">{notification.type || 'Notificación'}</p>
                      <h3 className="text-lg font-medium text-black">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="mt-2 flex items-center gap-3">
                        {notification.type === 'nuevo_curso' && notification.courseId && (
                          <Link
                            to={`/course/${notification.courseId}?from=dashboard`}
                            className="inline-block text-xs uppercase tracking-wider text-blue-700 underline"
                          >
                            Ver curso
                          </Link>
                        )}
                        {notification.type === 'nuevo_mensaje' && (
                          <Link
                            to="/customer/messages"
                            className="inline-block text-xs uppercase tracking-wider text-blue-700 underline"
                          >
                            Ir a mensajes
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(notification.id)}
                          className="px-3 py-2 rounded-lg border border-blue-200 text-[10px] uppercase tracking-wider text-blue-700 hover:bg-blue-700 hover:text-white transition"
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
