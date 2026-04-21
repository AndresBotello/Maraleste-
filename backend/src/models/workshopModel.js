/**
 * Modelo / Schema de Taller (Workshop).
 *
 * Estructura en Firestore:
 *   talleres/{workshopId}  → Documento principal
 *
 * Incluye campo "linkReunion" para enlace de Google Meet, Zoom, Jitsi Meet, etc.
 */

const WORKSHOP_COLLECTION = "talleres";
const ACCESS_TYPES = ["gratis", "pago"];

// ==================== CATEGORÍAS VÁLIDAS ====================

const CATEGORIAS_TALLER = [
  "pintura",
  "escultura",
  "acuarela",
  "fotografia",
  "ceramica",
  "caligrafia",
  "tecnicas-mixtas",
  "grabado",
  "diseño",
  "ilustracion",
  "otro",
];

// ==================== VALIDACIÓN ====================

/**
 * Valida los datos básicos de un taller.
 * @param {Object} data - Datos del taller
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateWorkshop(data) {
  const errors = [];
  const tipoAcceso = String(data.tipoAcceso || (Number(data.precio || 0) > 0 ? "pago" : "gratis")).toLowerCase();

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
    errors.push("La descripción es obligatoria.");
  }
  if (!data.fecha || typeof data.fecha !== "string") {
    errors.push("La fecha es obligatoria.");
  }
  if (!data.hora || typeof data.hora !== "string") {
    errors.push("La hora es obligatoria.");
  }
  if (!data.duracion || typeof data.duracion !== "string") {
    errors.push("La duración es obligatoria.");
  }
  if (!ACCESS_TYPES.includes(tipoAcceso)) {
    errors.push("El tipo de acceso debe ser gratis o pago.");
  }
  if (tipoAcceso === "pago" && (data.precio === undefined || data.precio === null || isNaN(Number(data.precio)) || Number(data.precio) <= 0)) {
    errors.push("El precio debe ser un número mayor a 0 para talleres de pago.");
  }
  if (tipoAcceso === "gratis" && (data.precio !== undefined && data.precio !== null && (isNaN(Number(data.precio)) || Number(data.precio) < 0))) {
    errors.push("El precio debe ser mayor o igual a 0.");
  }
  if (data.cuposTotal === undefined || isNaN(Number(data.cuposTotal)) || Number(data.cuposTotal) < 1) {
    errors.push("Los cupos totales deben ser al menos 1.");
  }

  // linkReunion es opcional pero si se proporciona debe ser una URL válida
  if (data.linkReunion && typeof data.linkReunion === "string" && data.linkReunion.trim().length > 0) {
    try {
      new URL(data.linkReunion.trim());
    } catch {
      errors.push("El link de reunión debe ser una URL válida (ej: https://meet.google.com/xxx).");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== BUILDER ====================

/**
 * Construye el documento principal del taller.
 *
 * @param {Object} data - Datos crudos del request
 * @param {string|null} imagenUrl - URL de la imagen subida a Cloudinary
 * @param {string|null} imagenPublicId - Public ID de Cloudinary
 * @param {string} uid - UID del usuario creador
 * @returns {Object} Taller listo para Firestore
 */
function buildWorkshopData(data, imagenUrl, imagenPublicId, uid) {
  const cuposTotal = Number(data.cuposTotal) || 12;
  const tipoAcceso = String(data.tipoAcceso || (Number(data.precio || 0) > 0 ? "pago" : "gratis")).toLowerCase();
  const precio = tipoAcceso === "gratis" ? 0 : Number(data.precio || 0);

  return {
    titulo: data.titulo.trim(),
    instructor: data.instructor.trim(),
    categoria: data.categoria,
    nivel: data.nivel,
    descripcion: data.descripcion.trim(),
    descripcionLarga: (data.descripcionLarga || "").trim(),
    fecha: data.fecha.trim(),
    hora: data.hora.trim(),
    duracion: data.duracion.trim(),
    tipoAcceso,
    moneda: "COP",
    precio,
    ubicacion: (data.ubicacion || "").trim(),
    materiales: (data.materiales || "Incluidos").trim(),
    contacto: (data.contacto || "").trim(),
    resultados: (data.resultados || "").trim(),
    linkReunion: (data.linkReunion || "").trim() || null,
    plataformaReunion: (data.plataformaReunion || "").trim() || null,
    imagenPortada: imagenUrl,
    imagenPublicId: imagenPublicId,
    cuposTotal,
    cuposDisponibles: Number(data.cuposDisponibles) || cuposTotal,
    participantes: 0,
    calificacion: 0,
    estado: "publicado",
    creadoPor: uid,
  };
}

module.exports = {
  WORKSHOP_COLLECTION,
  ACCESS_TYPES,
  CATEGORIAS_TALLER,
  validateWorkshop,
  buildWorkshopData,
};
