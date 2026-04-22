/**
 * Servicio de Obras de Arte — Conexión Frontend → Backend API.
 * Todas las operaciones pasan por el backend Express.
 * Las operaciones de escritura requieren autenticación (token Firebase).
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

// ==================== CREAR OBRA ====================

/**
 * Crea una nueva obra enviando los datos al backend.
 * Usa FormData para enviar imagen y datos juntos.
 * @param {Object} formData - Datos del formulario
 * @param {File|null} imagenFile - Archivo de imagen seleccionado
 * @returns {Promise<Object>} Obra creada con su ID
 */
export async function createArtwork(formData, imagenFile = null) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para crear una obra')

  const payload = new FormData()

  // Campos de la obra
  payload.append('titulo', formData.titulo)
  payload.append('autor', formData.autor)
  payload.append('modalidad', formData.modalidad)
  payload.append('tecnica', formData.tecnica)
  payload.append('medidas', formData.medidas)
  payload.append('anio', formData.anio)
  payload.append('descripcion', formData.descripcion)
  payload.append('procesoObra', formData.procesoObra || '')
  payload.append('historiaObra', formData.historiaObra || '')
  payload.append('videoURL', formData.videoURL || '')
  // Enviar visible como string explícitamente
  payload.append('visible', String(formData.visible !== undefined ? formData.visible : true))

  // Imagen — archivo real, se sube a Cloudinary en el backend
  if (imagenFile) {
    payload.append('imagen', imagenFile)
  }

  const response = await api.post('/artworks', payload, { token })
  return response.data
}

// ==================== OBTENER TODAS LAS OBRAS ====================

/**
 * Obtiene todas las obras desde el backend.
 * Ruta pública — no requiere token.
 * @param {Object} options - Opciones de filtrado
 * @param {string|null} options.modalidad - Filtro opcional
 * @param {boolean} options.visibleOnly - Si true, devuelve solo obras visibles (default: false)
 * @returns {Promise<Array>}
 */
export async function getArtworks(options = {}) {
  const { modalidad = null, visibleOnly = false } = options;
  const params = new URLSearchParams();
  
  if (modalidad) params.append('modalidad', modalidad);
  if (visibleOnly) params.append('visibleOnly', 'true');
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/artworks${query}`)
  
  // Normalizar: obras sin visible son consideradas visibles
  return (response.data || []).map(obra => ({
    ...obra,
    visible: obra.visible !== false
  }));
}

// ==================== OBTENER OBRA POR ID ====================

/**
 * Obtiene una obra por su ID.
 * @param {string} artworkId - ID de la obra
 * @returns {Promise<Object>}
 */
export async function getArtworkById(artworkId) {
  const response = await api.get(`/artworks/${artworkId}`)
  return response.data
}

// ==================== ACTUALIZAR OBRA ====================

/**
 * Actualiza una obra existente.
 * @param {string} artworkId - ID de la obra
 * @param {Object} formData - Datos actualizados
 * @param {File|null} imagenFile - Nueva imagen (opcional)
 * @returns {Promise<Object>}
 */
export async function updateArtwork(artworkId, formData, imagenFile = null) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para actualizar una obra')

  const payload = new FormData()

  payload.append('titulo', formData.titulo)
  payload.append('autor', formData.autor)
  payload.append('modalidad', formData.modalidad)
  payload.append('tecnica', formData.tecnica)
  payload.append('medidas', formData.medidas)
  payload.append('anio', formData.anio)
  payload.append('descripcion', formData.descripcion)
  payload.append('procesoObra', formData.procesoObra || '')
  payload.append('historiaObra', formData.historiaObra || '')
  payload.append('videoURL', formData.videoURL || '')
  // Enviar visible como string explícitamente si está definido
  if (formData.visible !== undefined) {
    payload.append('visible', String(formData.visible))
  }

  if (imagenFile) {
    payload.append('imagen', imagenFile)
  }

  const response = await api.put(`/artworks/${artworkId}`, payload, { token })
  return response.data
}

// ==================== ELIMINAR OBRA ====================

/**
 * Elimina una obra.
 * @param {string} artworkId - ID de la obra
 * @returns {Promise<Object>}
 */
export async function deleteArtwork(artworkId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para eliminar una obra')

  const response = await api.delete(`/artworks/${artworkId}`, { token })
  return response
}

// ==================== CAMBIAR VISIBILIDAD ====================

/**
 * Cambia la visibilidad de una obra.
 * @param {string} artworkId - ID de la obra
 * @param {boolean} visible - Estado de visibilidad
 * @returns {Promise<Object>} Obra actualizada
 */
export async function toggleArtworkVisibility(artworkId, visible) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para cambiar la visibilidad')

  const response = await api.patch(`/artworks/${artworkId}/visibility`, { visible }, { token })
  return response.data
}
