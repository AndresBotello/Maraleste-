/**
 * Modelo / Schema de Obra de Arte.
 *
 * Estructura en Firestore:
 *   obras/{obraId} → Documento principal
 */

const ARTWORK_COLLECTION = "obras";

// ==================== VALIDACIÓN ====================

/**
 * Valida los datos básicos de una obra.
 * @param {Object} data - Datos de la obra
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateArtwork(data) {
  const errors = [];

  if (!data.titulo || typeof data.titulo !== "string" || data.titulo.trim().length < 2) {
    errors.push("El título es obligatorio y debe tener al menos 2 caracteres.");
  }
  if (!data.autor || typeof data.autor !== "string") {
    errors.push("El autor es obligatorio.");
  }
  if (!data.modalidad || typeof data.modalidad !== "string") {
    errors.push("La modalidad es obligatoria.");
  }
  if (!data.tecnica || typeof data.tecnica !== "string") {
    errors.push("La técnica es obligatoria.");
  }
  if (!data.medidas || typeof data.medidas !== "string") {
    errors.push("Las medidas son obligatorias.");
  }
  if (!data.anio || isNaN(Number(data.anio))) {
    errors.push("El año es obligatorio y debe ser un número válido.");
  }
  if (!data.descripcion || typeof data.descripcion !== "string") {
    errors.push("La descripción es obligatoria.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== BUILDER ====================

/**
 * Construye el documento de obra listo para Firestore.
 * @param {Object} data - Datos crudos del request
 * @param {string|null} imagenUrl - URL de la imagen subida a Cloudinary
 * @param {string|null} imagenPublicId - Public ID de Cloudinary
 * @param {string} uid - UID del usuario creador
 * @returns {Object} Obra lista para Firestore
 */
function buildArtworkData(data, imagenUrl, imagenPublicId, uid) {
  return {
    titulo: data.titulo.trim(),
    autor: data.autor.trim(),
    modalidad: data.modalidad.trim(),
    tecnica: data.tecnica.trim(),
    medidas: data.medidas.trim(),
    anio: Number(data.anio),
    descripcion: data.descripcion.trim(),
    procesoObra: (data.procesoObra || "").trim(),
    historiaObra: (data.historiaObra || "").trim(),
    videoURL: (data.videoURL || "").trim() || null,
    imagenPortada: imagenUrl,
    imagenPublicId: imagenPublicId,
    estado: data.estado || "disponible",
    precio: data.precio ? Number(data.precio) : null,
    creadoPor: uid,
  };
}

module.exports = {
  ARTWORK_COLLECTION,
  validateArtwork,
  buildArtworkData,
};
