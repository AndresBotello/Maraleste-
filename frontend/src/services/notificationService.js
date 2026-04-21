import api from '../api/apiClient'
import { apiFetch } from '../api/apiClient'
import { auth } from '../config/firebase'

async function getToken() {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

export async function getMyNotifications(limit = 30) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver notificaciones')

  const response = await api.get(`/notifications/mine?limit=${limit}`, { token })
  return response.data
}

export async function markNotificationAsRead(notificationId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para actualizar notificaciones')

  const response = await apiFetch(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token,
  })
  return response.data
}

export async function markAllNotificationsAsRead() {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para actualizar notificaciones')

  const response = await apiFetch('/notifications/read-all', {
    method: 'PATCH',
    token,
  })
  return response.data
}
