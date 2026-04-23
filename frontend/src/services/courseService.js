/**
 * Servicio de Cursos — Conexión Frontend → Backend API.
 * Todas las operaciones pasan por el backend Express.
 * Las operaciones de escritura requieren autenticación (token Firebase).
 */
import api, { apiFetch } from '../api/apiClient'
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

// ==================== CREAR CURSO ====================

/**
 * Crea un nuevo curso enviando los datos al backend.
 * Usa FormData para enviar imagen y datos JSON juntos.
 * Requiere autenticación — el backend guarda el UID del creador.
 *
 * @param {Object} formData - Datos del formulario
 * @param {Array} modulos - Array de módulos con lecciones y quizzes
 * @returns {Promise<Object>} Curso creado con su ID
 */
export async function createCourse(formData, modulos) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para crear un curso')

  const payload = new FormData()

  // Campos simples
  payload.append('titulo', formData.titulo)
  payload.append('instructor', formData.instructor)
  payload.append('categoria', formData.categoria)
  payload.append('nivel', formData.nivel)
  payload.append('idioma', formData.idioma || 'Español')
  payload.append('descripcion', formData.descripcion)
  payload.append('descripcionLarga', formData.descripcionLarga || '')
  payload.append('duracion', formData.duracion)
  payload.append('tipoAcceso', formData.tipoAcceso)
  payload.append('precio', formData.precio)
  payload.append('certificado', formData.certificado)
  payload.append('requisitos', formData.requisitos || 'Ninguno')

  // Módulos con TODOS los campos incluyendo imagen, conceptosClave, etc.
  const modulosConDetalles = (modulos || []).map(modulo => ({
    ...modulo,
    lecciones: (modulo.lecciones || []).map(leccion => ({
      id: leccion.id,
      titulo: leccion.titulo || '',
      descripcion: leccion.descripcion || '',
      objetivo: leccion.objetivo || '',
      contenido: leccion.contenido || '',
      conceptosClave: leccion.conceptosClave || '',
      ejemplosPracticos: leccion.ejemplosPracticos || '',
      casoEstudio: leccion.casoEstudio || '',
      recursos: leccion.recursos || '',
      duracion: leccion.duracion || '',
      tipo: leccion.tipo || 'video',
      videoUrl: leccion.videoUrl || '',
      imagen: leccion.imagen || null, // Data URL o URL de imagen
      descripcionImagen: leccion.descripcionImagen || ''
    }))
  }))

  payload.append('modulos_detalle', JSON.stringify(modulosConDetalles))

  // Imagen de portada (archivo → se sube a Cloudinary en el backend)
  if (formData.imagenPortada) {
    payload.append('imagenPortada', formData.imagenPortada)
  }

  const response = await api.post('/courses', payload, { token })
  return response.data
}

// ==================== OBTENER TODOS LOS CURSOS ====================

/**
 * Obtiene todos los cursos publicados desde el backend.
 * Ruta pública — no requiere token.
 * @param {string|null} categoria - Filtro por categoría (opcional)
 * @returns {Promise<Array>} Lista de cursos
 */
export async function getCourses(categoria = null) {
  const query = categoria && categoria !== 'todos' ? `?categoria=${categoria}` : ''
  const response = await api.get(`/courses${query}`)
  return response.data
}

// ==================== OBTENER UN CURSO POR ID ====================

/**
 * Obtiene un curso por su ID (con módulos, lecciones y quiz).
 * Ruta pública — no requiere token.
 * @param {string} courseId - ID del curso
 * @returns {Promise<Object|null>} Datos del curso completo
 */
export async function getCourseById(courseId) {
  const token = await getToken()
  const response = await api.get(`/courses/${courseId}`, token ? { token } : {})
  return response.data
}

/**
 * Verifica si el usuario autenticado tiene acceso al curso.
 * @param {string} courseId
 * @returns {Promise<{courseId: string, acceso: {tipo: string, moneda: string, disponible: boolean}}>} Estado de acceso
 */
export async function checkCourseAccess(courseId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para verificar acceso al curso')

  const response = await api.get(`/courses/${courseId}/access`, { token })
  return response.data
}

/**
 * Registra el acceso al curso para el usuario autenticado.
 * Para cursos pagos, confirmarPago debe ser true.
 * @param {string} courseId
 * @param {{confirmarPago?: boolean}} options
 * @returns {Promise<Object>} Registro de acceso
 */
export async function registerCourseAccess(courseId, options = {}) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para acceder al curso')

  const response = await api.post(`/courses/${courseId}/access`, {
    confirmarPago: Boolean(options.confirmarPago),
  }, { token })

  return response.data
}

// ==================== ACTUALIZAR CURSO ====================

/**
 * Actualiza un curso existente.
 * Requiere autenticación.
 * @param {string} courseId - ID del curso
 * @param {Object} data - Campos a actualizar
 * @returns {Promise<Object>} Curso actualizado
 */
/**
 * Actualiza un curso existente.
 * Envía todos los datos del formulario incluyendo módulos con todas sus lecciones.
 * Requiere autenticación.
 *
 * @param {string} courseId - ID del curso a actualizar
 * @param {Object} data - Datos del curso (incluyendo modulos)
 * @returns {Promise<Object>} Curso actualizado
 */
export async function updateCourse(courseId, data) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para editar un curso')

  const payload = new FormData()
  
  // Campos simples
  payload.append('titulo', data.titulo)
  payload.append('instructor', data.instructor)
  payload.append('categoria', data.categoria)
  payload.append('nivel', data.nivel)
  payload.append('idioma', data.idioma || 'Español')
  payload.append('descripcion', data.descripcion)
  payload.append('descripcionLarga', data.descripcionLarga || '')
  payload.append('duracion', data.duracion)
  payload.append('tipoAcceso', data.tipoAcceso || 'gratis')
  payload.append('precio', data.precio)
  payload.append('certificado', data.certificado)
  payload.append('requisitos', data.requisitos || 'Ninguno')
  
  // Módulos con TODOS los campos incluyendo imagen, conceptosClave, etc.
  const modulosConDetalles = (data.modulos || []).map(modulo => ({
    ...modulo,
    lecciones: (modulo.lecciones || []).map(leccion => ({
      id: leccion.id,
      titulo: leccion.titulo || '',
      descripcion: leccion.descripcion || '',
      objetivo: leccion.objetivo || '',
      contenido: leccion.contenido || '',
      conceptosClave: leccion.conceptosClave || '',
      ejemplosPracticos: leccion.ejemplosPracticos || '',
      casoEstudio: leccion.casoEstudio || '',
      recursos: leccion.recursos || '',
      duracion: leccion.duracion || '',
      tipo: leccion.tipo || 'video',
      videoUrl: leccion.videoUrl || '',
      imagen: leccion.imagen || null, // Data URL o URL de imagen
      descripcionImagen: leccion.descripcionImagen || ''
    }))
  }))
  
  payload.append('modulos_detalle', JSON.stringify(modulosConDetalles))

  // Imagen de portada (archivo)
  if (data.imagenPortada instanceof File) {
    payload.append('imagenPortada', data.imagenPortada)
  }

  const response = await api.put(`/courses/${courseId}`, payload, { token })
  return response.data
}

// ==================== ELIMINAR CURSO ====================

/**
 * Elimina un curso.
 * Requiere autenticación.
 * @param {string} courseId - ID del curso
 * @returns {Promise<void>}
 */
export async function deleteCourse(courseId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para eliminar un curso')

  await api.delete(`/courses/${courseId}`, { token })
}

/**
 * Obtiene cursos creados por el administrador autenticado.
 * @returns {Promise<Array>}
 */
export async function getMyCourses() {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver tus cursos')

  const response = await api.get('/courses/mine', { token })
  return response.data
}

/**
 * Obtiene inscripciones del usuario autenticado.
 * @returns {Promise<Array>}
 */
export async function getMyCourseAccesses() {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver tus inscripciones')

  const response = await api.get('/courses/my-accesses', { token })
  return response.data
}

/**
 * Cambia estado del curso entre publicado e inactivo.
 * @param {string} courseId
 * @param {'publicado'|'inactivo'} estado
 * @returns {Promise<Object>}
 */
export async function updateCourseStatus(courseId, estado) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para cambiar estado del curso')

  const response = await apiFetch(`/courses/${courseId}/status`, {
    method: 'PATCH',
    token,
    body: { estado },
  })

  return response.data
}

/**
 * Obtiene suscriptores de un curso.
 * @param {string} courseId
 * @returns {Promise<Array>}
 */
export async function getCourseSubscribers(courseId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver suscriptores')

  const response = await api.get(`/courses/${courseId}/subscribers`, { token })
  return response.data
}

/**
 * Obtiene progreso del usuario en un curso.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseProgress(courseId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver progreso')

  const response = await api.get(`/courses/${courseId}/progress`, { token })
  return response.data
}

/**
 * Guarda progreso del usuario en un curso.
 * @param {string} courseId
 * @param {{moduloId: string, leccionId?: string, leccionesCompletadas?: string[]}} data
 * @returns {Promise<Object>}
 */
export async function saveCourseProgress(courseId, data) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para guardar progreso')

  const response = await api.put(`/courses/${courseId}/progress`, data, { token })
  return response.data
}

/**
 * Obtiene la entrega de reto del usuario autenticado para un módulo.
 * @param {string} courseId
 * @param {string} moduleId
 * @returns {Promise<Object|null>}
 */
export async function getMyChallengeSubmission(courseId, moduleId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver tu entrega')

  const response = await api.get(`/courses/${courseId}/modules/${moduleId}/challenge-submission/me`, { token })
  return response.data
}

/**
 * Envía o reemplaza la entrega de reto del usuario.
 * @param {string} courseId
 * @param {string} moduleId
 * @param {{evidencia: File, comentario?: string}} data
 * @returns {Promise<Object>}
 */
export async function submitChallengeSubmission(courseId, moduleId, data) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para entregar el reto')

  const payload = new FormData()
  payload.append('evidencia', data.evidencia)
  payload.append('comentario', data.comentario || '')

  const response = await api.post(`/courses/${courseId}/modules/${moduleId}/challenge-submission`, payload, { token })
  return response.data
}

/**
 * Obtiene el avance y entregas de retos por curso para revisión admin.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseChallengeProgress(courseId) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para ver progreso de retos')

  const response = await api.get(`/courses/${courseId}/challenges/progress`, { token })
  return response.data
}

/**
 * Aprueba o rechaza entrega de reto.
 * @param {string} courseId
 * @param {string} moduleId
 * @param {string} studentUid
 * @param {{estado:'aprobado'|'rechazado', feedback?: string}} data
 * @returns {Promise<Object>}
 */
export async function reviewChallengeSubmission(courseId, moduleId, studentUid, data) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para revisar entregas')

  const response = await apiFetch(`/courses/${courseId}/modules/${moduleId}/challenge-submissions/${studentUid}`, {
    method: 'PATCH',
    token,
    body: data,
  })

  return response.data
}

/**
 * Envía el resultado del quiz del usuario.
 * @param {string} courseId
 * @param {string} moduleId
 * @param {{score: number, answers: Object, totalPreguntas: number}} data
 * @returns {Promise<Object>} Resultado guardado
 */
export async function submitQuizResult(courseId, moduleId, data) {
  const token = await getToken()
  if (!token) throw new Error('Debes iniciar sesión para guardar resultado del quiz')

  const response = await api.post(`/courses/${courseId}/modules/${moduleId}/quiz-result`, data, { token })
  return response.data
}
