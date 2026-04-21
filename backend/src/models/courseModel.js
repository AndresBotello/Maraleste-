/**
 * Modelo / Schema de Curso (estructura con subcolecciones).
 *
 * Estructura en Firestore:
 *   cursos/{courseId}                                          → Documento principal
 *   cursos/{courseId}/modulos/{moduloId}                       → Módulos
 *   cursos/{courseId}/modulos/{moduloId}/lecciones/{leccionId} → Lecciones
 *   cursos/{courseId}/modulos/{moduloId}/quiz/{quizId}         → Quiz (1 por módulo)
 */

const COURSE_COLLECTION = "cursos";

// ==================== VALIDACIÓN ====================

/**
 * Valida los datos básicos de un curso.
 * @param {Object} data - Datos del curso
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateCourse(data) {
  const errors = [];

  if (!data.titulo || typeof data.titulo !== "string" || data.titulo.trim().length < 3) {
    errors.push("El título es obligatorio y debe tener al menos 3 caracteres.");
  }
  if (!data.instructor || typeof data.instructor !== "string") {
    errors.push("El instructor es obligatorio.");
  }
  if (!data.categoria || typeof data.categoria !== "string") {
    errors.push("La categoría es obligatoria.");
  }
  if (!data.nivel || !["Principiante", "Intermedio", "Avanzado"].includes(data.nivel)) {
    errors.push("El nivel debe ser Principiante, Intermedio o Avanzado.");
  }
  if (!data.descripcion || typeof data.descripcion !== "string") {
    errors.push("La descripción corta es obligatoria.");
  }
  if (!data.duracion || typeof data.duracion !== "string") {
    errors.push("La duración es obligatoria.");
  }
  if (!data.tipoAcceso || !["gratis", "pago"].includes(data.tipoAcceso)) {
    errors.push("El tipo de acceso debe ser 'gratis' o 'pago'.");
  }

  if (data.tipoAcceso === "pago") {
    if (data.precio === undefined || data.precio === null || isNaN(Number(data.precio)) || Number(data.precio) <= 0) {
      errors.push("El precio debe ser mayor a 0 para cursos de pago.");
    }
  } else if (data.tipoAcceso === "gratis") {
    if (data.precio !== undefined && data.precio !== null && Number(data.precio) < 0) {
      errors.push("El precio no puede ser negativo.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== BUILDERS ====================

/**
 * Construye el documento principal del curso (sin módulos embebidos).
 * Los módulos, lecciones y quizzes se guardan en subcolecciones.
 *
 * @param {Object} data - Datos crudos del request
 * @param {string|null} imagenUrl - URL de la imagen subida
 * @param {string|null} imagenPublicId - Public ID de Cloudinary
 * @param {string} uid - UID del usuario creador
 * @param {number} totalModulos - Cantidad de módulos
 * @returns {Object} Curso listo para Firestore
 */
function buildCourseData(data, imagenUrl, imagenPublicId, uid, totalModulos = 0) {
  const tipoAcceso = data.tipoAcceso === "pago" ? "pago" : "gratis";
  const precio = tipoAcceso === "gratis" ? 0 : Number(data.precio || 0);

  return {
    titulo: data.titulo.trim(),
    instructor: data.instructor.trim(),
    categoria: data.categoria,
    nivel: data.nivel,
    idioma: data.idioma || "Español",
    descripcion: data.descripcion.trim(),
    descripcionLarga: (data.descripcionLarga || "").trim(),
    duracion: data.duracion.trim(),
    tipoAcceso,
    precio,
    moneda: "COP",
    certificado: Boolean(data.certificado),
    requisitos: (data.requisitos || "Ninguno").trim(),
    imagenPortada: imagenUrl,
    imagenPublicId: imagenPublicId,
    totalModulos,
    estudiantes: 0,
    calificacion: 0,
    estado: "publicado",
    creadoPor: uid,
  };
}

/**
 * Construye el documento de un módulo.
 * @param {Object} m - Datos del módulo desde el frontend
 * @param {number} orden - Posición del módulo en el curso
 * @returns {Object} Módulo listo para Firestore
 */
function buildModuleData(m, orden) {
  const reto = m.reto || {};

  return {
    numero: orden,
    titulo: (m.titulo || "").trim(),
    descripcion: (m.descripcion || "").trim(),
    duracion: (m.duracion || "").trim(),
    icono: m.icono || "🎨",
    totalLecciones: Array.isArray(m.lecciones) ? m.lecciones.length : 0,
    tieneQuiz: Boolean(m.quiz),
    reto: {
      habilitado: Boolean(reto.habilitado),
      titulo: (reto.titulo || "").trim(),
      descripcion: (reto.descripcion || "").trim(),
    },
    orden,
  };
}

/**
 * Construye el documento de una lección.
 * Incluye TODOS los campos de contenido enriquecido.
 * @param {Object} l - Datos de la lección
 * @param {number} orden - Posición de la lección en el módulo
 * @returns {Object} Lección lista para Firestore
 */
function buildLessonData(l, orden) {
  return {
    // Campos básicos
    titulo: (l.titulo || "").trim(),
    descripcion: (l.descripcion || "").trim(),
    objetivo: (l.objetivo || "").trim(),
    duracion: (l.duracion || "").trim(),
    tipo: l.tipo || "video",
    
    // Campos de contenido principal
    contenido: (l.contenido || "").trim(),
    conceptosClave: (l.conceptosClave || "").trim(),
    ejemplosPracticos: (l.ejemplosPracticos || "").trim(),
    casoEstudio: (l.casoEstudio || "").trim(),
    
    // Recursos
    recursos: (l.recursos || "").trim(),
    videoUrl: (l.videoUrl || "").trim() || null,
    
    // Imagen y su descripción
    imagen: l.imagen || null, // Data URL o URL de Cloudinary
    descripcionImagen: (l.descripcionImagen || "").trim(),
    
    // Campos adicionales
    contenidoUrl: l.contenidoUrl || null,
    orden,
  };
}

/**
 * Construye el documento de un quiz.
 * Las preguntas se almacenan como array dentro del documento quiz.
 * @param {Object} quiz - Datos del quiz
 * @returns {Object} Quiz listo para Firestore
 */
function buildQuizData(quiz) {
  return {
    titulo: (quiz.titulo || "").trim(),
    puntajeMinimo: Number(quiz.puntajeMinimo) || 70,
    intentos: Number(quiz.intentos) || 3,
    preguntas: Array.isArray(quiz.preguntas)
      ? quiz.preguntas.map((p) => ({
          id: p.id,
          texto: (p.texto || "").trim(),
          tipo: p.tipo || "opcion_multiple",
          explicacion: (p.explicacion || "").trim(),
          ...(p.tipo === "opcion_multiple"
            ? {
                opciones: Array.isArray(p.opciones)
                  ? p.opciones.map((o) => ({
                      id: o.id,
                      texto: (o.texto || "").trim(),
                      correcta: Boolean(o.correcta),
                    }))
                  : [],
              }
            : { correcta: Boolean(p.correcta) }),
        }))
      : [],
  };
}

module.exports = {
  COURSE_COLLECTION,
  validateCourse,
  buildCourseData,
  buildModuleData,
  buildLessonData,
  buildQuizData,
};
