/**
 * Servicio de Obras de Arte — Lógica de negocio.
 *
 * Estructura Firestore:
 *   obras/{obraId} → Documento principal
 */
const { db } = require("../config/firebase");
const admin = require("firebase-admin");
const {
  ARTWORK_COLLECTION,
  buildArtworkData,
} = require("../models/artworkModel");
const { uploadImage, deleteResource } = require("./uploadService");

// ==================== CREAR OBRA ====================

/**
 * Crea una nueva obra de arte.
 * @param {Object} data - Datos de la obra
 * @param {Object|null} file - Archivo de imagen (de multer)
 * @param {string} uid - UID del usuario creador
 * @returns {Promise<{id: string, ...Object}>}
 */
async function createArtwork(data, file = null, uid) {
  let imagenUrl = null;
  let imagenPublicId = null;

  // Subir imagen a Cloudinary si se proporcionó
  if (file) {
    const result = await uploadImage(file, "maraleste/obras");
    imagenUrl = result.url;
    imagenPublicId = result.publicId;
  }

  // Construir datos del documento
  const artworkData = buildArtworkData(data, imagenUrl, imagenPublicId, uid);
  artworkData.creadoEn = admin.firestore.FieldValue.serverTimestamp();
  artworkData.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();

  // Guardar en Firestore
  const docRef = await db.collection(ARTWORK_COLLECTION).add(artworkData);

  return {
    id: docRef.id,
    ...artworkData,
  };
}

// ==================== OBTENER TODAS LAS OBRAS ====================

/**
 * Obtiene todas las obras, opcionalmente filtradas por modalidad y visibilidad.
 * @param {string|null} modalidad - Filtro por modalidad (opcional)
 * @param {boolean|null} visibleOnly - Si es true, solo devuelve obras visibles (opcional)
 * @returns {Promise<Array>}
 */
async function getArtworks(modalidad = null, visibleOnly = false) {
  let query = db.collection(ARTWORK_COLLECTION).orderBy("creadoEn", "desc");

  // Solo aplicar filtro de modalidad en el query
  if (modalidad) {
    query = query.where("modalidad", "==", modalidad);
  }

  const snapshot = await query.get();

  let artworks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filtrar por visibilidad en memoria (evita problemas con índices compuestos)
  if (visibleOnly) {
    artworks = artworks.filter(art => art.visible !== false);
  }

  // Normalizar: obras sin visible son consideradas visibles
  artworks = artworks.map(art => ({
    ...art,
    visible: art.visible !== false ? true : false
  }));

  return artworks;
}

// ==================== OBTENER OBRA POR ID ====================

/**
 * Obtiene una obra por su ID.
 * @param {string} id - ID del documento
 * @returns {Promise<Object|null>}
 */
async function getArtworkById(id) {
  const doc = await db.collection(ARTWORK_COLLECTION).doc(id).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  };
}

// ==================== ACTUALIZAR OBRA ====================

/**
 * Actualiza una obra existente.
 * @param {string} id - ID de la obra
 * @param {Object} data - Datos actualizados
 * @param {Object|null} file - Nueva imagen (opcional)
 * @param {string} uid - UID del usuario que actualiza
 * @returns {Promise<Object>}
 */
async function updateArtwork(id, data, file = null, uid) {
  const docRef = db.collection(ARTWORK_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    const error = new Error("Obra no encontrada");
    error.statusCode = 404;
    throw error;
  }

  let imagenUrl = existing.data().imagenPortada;
  let imagenPublicId = existing.data().imagenPublicId;

  // Si se sube nueva imagen, eliminar la anterior de Cloudinary y subir la nueva
  if (file) {
    if (imagenPublicId) {
      await deleteResource(imagenPublicId, "image");
    }
    const result = await uploadImage(file, "maraleste/obras");
    imagenUrl = result.url;
    imagenPublicId = result.publicId;
  }

  const updatedData = buildArtworkData(data, imagenUrl, imagenPublicId, uid);
  updatedData.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();
  // Mantener la fecha de creación original
  updatedData.creadoEn = existing.data().creadoEn;
  // Mantener la visibilidad original si no se especifica
  if (data.visible === undefined) {
    updatedData.visible = existing.data().visible !== undefined ? existing.data().visible : true;
  }

  await docRef.update(updatedData);

  return {
    id,
    ...updatedData,
  };
}

// ==================== ELIMINAR OBRA ====================

/**
 * Elimina una obra y su imagen de Cloudinary.
 * @param {string} id - ID de la obra
 * @param {string} uid - UID del usuario que elimina
 */
async function deleteArtwork(id, uid) {
  const docRef = db.collection(ARTWORK_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    const error = new Error("Obra no encontrada");
    error.statusCode = 404;
    throw error;
  }

  // Eliminar imagen de Cloudinary
  const imagenPublicId = existing.data().imagenPublicId;
  if (imagenPublicId) {
    await deleteResource(imagenPublicId, "image");
  }

  // Eliminar documento de Firestore
  await docRef.delete();
}

// ==================== ACTUALIZAR VISIBILIDAD ====================

/**
 * Actualiza la visibilidad de una obra.
 * @param {string} id - ID de la obra
 * @param {boolean} visible - Estado de visibilidad
 * @returns {Promise<Object>} Obra actualizada
 */
async function updateArtworkVisibility(id, visible) {
  const docRef = db.collection(ARTWORK_COLLECTION).doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    const error = new Error("Obra no encontrada");
    error.statusCode = 404;
    throw error;
  }

  await docRef.update({
    visible: Boolean(visible),
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();
  return {
    id,
    ...updated.data(),
  };
}

module.exports = {
  createArtwork,
  getArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
  updateArtworkVisibility,
};
