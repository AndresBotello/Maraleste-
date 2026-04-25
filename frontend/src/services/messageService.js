import api from '../api/apiClient'
import { auth } from '../config/firebase'

async function getToken() {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

export async function getMyConversations() {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver mensajes')

  const response = await api.get('/messages/conversations', { token })
  return response.data
}

export async function getConversationMessages(conversationId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver mensajes')

  const response = await api.get(`/messages/conversations/${conversationId}/messages`, { token })
  return response.data
}

export async function sendMessageToCourseInstructor(courseId, text) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para enviar mensajes')

  const response = await api.post(`/messages/courses/${courseId}/messages`, { text }, { token })
  return response.data
}

export async function sendMessageInConversation(conversationId, text) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para enviar mensajes')

  const response = await api.post(`/messages/conversations/${conversationId}/messages`, { text }, { token })
  return response.data
}

export async function deleteConversation(conversationId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para eliminar mensajes')

  const response = await api.delete(`/messages/conversations/${conversationId}`, { token })
  return response.data
}



export async function getCourseEnrolledStudents(courseId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver los estudiantes')

  const response = await api.get(`/messages/courses/${courseId}/students`, { token })
  return response.data
}

export async function getInstructorCourses() {
  const token = await getToken()
  console.log('🔑 Token obtenido:', token ? 'SÍ tiene token' : 'NO tiene token')
  if (!token) throw new Error('Debes iniciar sesión para ver tus cursos')

  const response = await api.get('/messages/instructor/courses', { token })
  return response.data
}

export async function startConversationAsInstructor(courseId, studentUid, text) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para iniciar una conversación')

  const response = await api.post('/messages/instructor/start', { courseId, studentUid, text }, { token })
  return response.data
}