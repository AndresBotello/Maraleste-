/**
 * Servicio de Talleres — Conexión Frontend → Backend API.
 * Todas las operaciones pasan por el backend Express.
 */
import api from '../api/apiClient'
import { auth } from '../config/firebase'

/**
 * Obtiene el token actual del usuario autenticado.
 * @returns {Promise<string|null>}
 */
async function getToken() {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

// ==================== CREAR TALLER ====================

/**
 * Crea un nuevo taller enviando los datos al backend.
 * Usa FormData para enviar imagen y datos JSON juntos.
 * Requiere autenticación.
 *
 * @param {Object} formData - Datos del formulario
 * @returns {Promise<Object>} Taller creado con su ID
 */
export async function createWorkshop(formData) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para crear un taller')

  const payload = new FormData()

  // Campos simples
  payload.append('titulo', formData.titulo)
  payload.append('instructor', formData.instructor)
  payload.append('categoria', formData.categoria)
  payload.append('nivel', formData.nivel)
  payload.append('descripcion', formData.descripcion)
  payload.append('descripcionLarga', formData.descripcionLarga || '')
  payload.append('fecha', formData.fecha)
  payload.append('hora', formData.hora)
  payload.append('duracion', formData.duracion)
  payload.append('tipoAcceso', formData.tipoAcceso || 'gratis')
  payload.append('precio', formData.precio)
  payload.append('ubicacion', formData.ubicacion || '')
  payload.append('materiales', formData.materiales || 'Incluidos')
  payload.append('contacto', formData.contacto || '')
  payload.append('resultados', formData.resultados || '')
  payload.append('linkReunion', formData.linkReunion || '')
  payload.append('plataformaReunion', formData.plataformaReunion || '')
  payload.append('cuposTotal', formData.cuposTotal || '12')

  // Imagen de portada
  if (formData.imagenPortada) {
    payload.append('imagenPortada', formData.imagenPortada)
  }

  const response = await api.post('/workshops', payload, { token })
  return response.data
}

// ==================== OBTENER TODOS LOS TALLERES ====================

/**
 * Obtiene todos los talleres publicados desde el backend.
 * Ruta pública — no requiere token.
 * @param {string|null} categoria - Filtro por categoría (opcional)
 * @returns {Promise<Array>} Lista de talleres
 */
export async function getWorkshops(categoria = null) {
  const query = categoria && categoria !== 'todos' ? `?categoria=${categoria}` : ''
  const response = await api.get(`/workshops${query}`)
  return response.data
}

// ==================== OBTENER UN TALLER POR ID ====================

/**
 * Obtiene un taller por su ID.
 * Ruta pública — no requiere token.
 * @param {string} workshopId - ID del taller
 * @returns {Promise<Object|null>} Datos del taller
 */
export async function getWorkshopById(workshopId) {
  const token = await getToken()
  const response = await api.get(`/workshops/${workshopId}`, token ? { token } : {})
  return response.data
}

export async function getMyWorkshopAccesses() {
  const token = await getToken()
  if (!token) return []

  const response = await api.get('/workshops/my-accesses', { token })
  return response.data
}

export async function checkWorkshopAccess(workshopId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para verificar acceso al taller')

  const response = await api.get(`/workshops/${workshopId}/access`, { token })
  return response.data
}

export async function registerWorkshopAccess(workshopId, options = {}) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para inscribirte al taller')

  const response = await api.post(`/workshops/${workshopId}/access`, {
    confirmarPago: Boolean(options.confirmarPago),
  }, { token })

  return response.data
}

// ==================== ACTUALIZAR TALLER ====================

/**
 * Actualiza un taller existente.
 * Requiere autenticación.
 * @param {string} workshopId - ID del taller
 * @param {Object} data - Campos a actualizar
 * @returns {Promise<Object>} Taller actualizado
 */
export async function updateWorkshop(workshopId, data) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para editar un taller')

  const payload = new FormData()
  const fields = [
    'titulo', 'instructor', 'categoria', 'nivel',
    'descripcion', 'descripcionLarga', 'fecha', 'hora',
    'duracion', 'tipoAcceso', 'precio', 'ubicacion',
    'materiales', 'contacto', 'resultados', 'linkReunion',
    'plataformaReunion', 'cuposTotal', 'cuposDisponibles', 'estado',
  ]

  fields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(field, data[field])
    }
  })

  if (data.imagenPortada instanceof File) {
    payload.append('imagenPortada', data.imagenPortada)
  }

  const response = await api.put(`/workshops/${workshopId}`, payload, { token })
  return response.data
}

// ==================== ELIMINAR TALLER ====================

/**
 * Elimina un taller.
 * Requiere autenticación.
 * @param {string} workshopId - ID del taller
 * @returns {Promise<void>}
 */
export async function deleteWorkshop(workshopId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para eliminar un taller')

  await api.delete(`/workshops/${workshopId}`, { token })
}
