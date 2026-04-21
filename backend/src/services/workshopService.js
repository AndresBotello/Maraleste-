/**
 * Servicio de Talleres — Lógica de negocio.
 *
 * Estructura Firestore:
 *   talleres/{workshopId}  → Documento principal
 */
const { db } = require("../config/firebase");
const {
  WORKSHOP_COLLECTION,
  buildWorkshopData,
} = require("../models/workshopModel");
const admin = require("firebase-admin");
const { uploadImage, deleteResource } = require("./uploadService");

const USER_COLLECTION = "usuarios";
const USER_WORKSHOP_ACCESS_SUBCOLLECTION = "talleresInscritos";
const WORKSHOP_SUBSCRIBERS_SUBCOLLECTION = "inscritos";

async function isUserAdmin(uid) {
  if (!uid) return false;
  const userDoc = await db.collection(USER_COLLECTION).doc(uid).get();
  return userDoc.exists && userDoc.data().rol === "admin";
}

async function hasWorkshopAccess(workshopData, requesterUid = null) {
  if (!workshopData || !requesterUid) return false;
  if (workshopData.creadoPor === requesterUid) return true;
  if (await isUserAdmin(requesterUid)) return true;

  const accessDoc = await db
    .collection(USER_COLLECTION)
    .doc(requesterUid)
    .collection(USER_WORKSHOP_ACCESS_SUBCOLLECTION)
    .doc(workshopData.id)
    .get();

  return accessDoc.exists;
}

// ==================== CREAR TALLER ====================

/**
 * Crea un nuevo taller.
 * @param {Object} data - Datos del taller
 * @param {Object|null} file - Archivo de imagen (de multer)
 * @param {string} uid - UID del usuario creador
 * @returns {Promise<{id: string, ...Object}>}
 */
async function createWorkshop(data, file = null, uid) {
  let imagenUrl = null;
  let imagenPublicId = null;

  // Subir imagen a Cloudinary si se proporcionó
  if (file) {
    const result = await uploadImage(file, "maraleste/talleres");
    imagenUrl = result.url;
    imagenPublicId = result.publicId;
  }

  const workshopData = buildWorkshopData(data, imagenUrl, imagenPublicId, uid);
  workshopData.creadoEn = admin.firestore.FieldValue.serverTimestamp();
  workshopData.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();

  const workshopRef = await db.collection(WORKSHOP_COLLECTION).add(workshopData);

  return { id: workshopRef.id, ...workshopData };
}

// ==================== OBTENER TODOS ====================

/**
 * Obtiene todos los talleres publicados.
 * @param {string|null} categoria - Filtrar por categoría
 * @returns {Promise<Array>}
 */
async function getWorkshops(categoria = null) {
  // Query simple sin índice compuesto: traer todos y filtrar/ordenar en memoria
  const snapshot = await db.collection(WORKSHOP_COLLECTION).get();
  let workshops = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((w) => w.estado === "publicado");

  workshops.sort((a, b) => {
    const dateA = a.creadoEn?._seconds || a.creadoEn?.seconds || 0;
    const dateB = b.creadoEn?._seconds || b.creadoEn?.seconds || 0;
    return dateB - dateA;
  });

  if (categoria && categoria !== "todos") {
    workshops = workshops.filter((w) => w.categoria === categoria);
  }

  return workshops;
}

// ==================== OBTENER POR ID ====================

/**
 * Obtiene un taller por su ID.
 * @param {string} workshopId
 * @returns {Promise<Object|null>}
 */
async function getWorkshopById(workshopId) {
  const doc = await db.collection(WORKSHOP_COLLECTION).doc(workshopId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getWorkshopByIdWithAccess(workshopId, requesterUid = null) {
  const workshop = await getWorkshopById(workshopId);
  if (!workshop) return null;

  const accessGranted = await hasWorkshopAccess(workshop, requesterUid);
  const sanitizedWorkshop = accessGranted
    ? workshop
    : {
      ...workshop,
      linkReunion: null,
      plataformaReunion: null,
    };

  return {
    ...sanitizedWorkshop,
    acceso: {
      tipo: workshop.tipoAcceso || (Number(workshop.precio || 0) > 0 ? "pago" : "gratis"),
      moneda: workshop.moneda || "COP",
      disponible: accessGranted,
    },
  };
}

async function getUserWorkshopAccesses(uid) {
  const accessSnap = await db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_WORKSHOP_ACCESS_SUBCOLLECTION)
    .orderBy("registradoEn", "desc")
    .get();

  return accessSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function registerWorkshopAccess(workshopId, uid, options = {}) {
  const { confirmarPago = false } = options;

  const workshopRef = db.collection(WORKSHOP_COLLECTION).doc(workshopId);
  const userAccessRef = db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_WORKSHOP_ACCESS_SUBCOLLECTION)
    .doc(workshopId);
  const subscriberRef = workshopRef
    .collection(WORKSHOP_SUBSCRIBERS_SUBCOLLECTION)
    .doc(uid);

  const workshopDoc = await workshopRef.get();
  if (!workshopDoc.exists) {
    const error = new Error("Taller no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const workshopData = { id: workshopDoc.id, ...workshopDoc.data() };
  const tipoAcceso = workshopData.tipoAcceso || (Number(workshopData.precio || 0) > 0 ? "pago" : "gratis");
  const isPaid = tipoAcceso === "pago";

  if (workshopData.estado === "inactivo") {
    const error = new Error("Este taller está inactivo y no admite nuevas inscripciones");
    error.statusCode = 403;
    throw error;
  }

  if (isPaid && !confirmarPago) {
    const error = new Error("Este taller es de pago. Debes confirmar la compra para habilitar acceso.");
    error.statusCode = 400;
    throw error;
  }

  const existingAccess = await userAccessRef.get();
  if (existingAccess.exists) {
    return {
      workshopId,
      uid,
      yaRegistrado: true,
      tipoAcceso,
    };
  }

  await db.runTransaction(async (tx) => {
    const [workshopSnap, accessSnap] = await Promise.all([
      tx.get(workshopRef),
      tx.get(userAccessRef),
    ]);

    if (!workshopSnap.exists) {
      throw new Error("Taller no encontrado");
    }

    if (accessSnap.exists) {
      return;
    }

    const liveWorkshop = workshopSnap.data();
    const cuposDisponibles = Number(liveWorkshop.cuposDisponibles ?? liveWorkshop.cuposTotal ?? 0);
    if (cuposDisponibles <= 0) {
      const error = new Error("No hay cupos disponibles para este taller");
      error.statusCode = 400;
      throw error;
    }

    tx.set(userAccessRef, {
      workshopId,
      uid,
      tipoAcceso,
      moneda: liveWorkshop.moneda || "COP",
      precio: Number(liveWorkshop.precio || 0),
      registradoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.set(subscriberRef, {
      workshopId,
      uid,
      tipoAcceso,
      moneda: liveWorkshop.moneda || "COP",
      precio: Number(liveWorkshop.precio || 0),
      registradoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(workshopRef, {
      cuposDisponibles: admin.firestore.FieldValue.increment(-1),
      participantes: admin.firestore.FieldValue.increment(1),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return {
    workshopId,
    uid,
    yaRegistrado: false,
    tipoAcceso,
  };
}

// ==================== ACTUALIZAR ====================

/**
 * Actualiza un taller existente.
 * @param {string} workshopId
 * @param {Object} data
 * @param {Object|null} file - Nueva imagen (opcional)
 * @param {string} uid - UID del usuario que actualiza
 * @returns {Promise<Object>}
 */
async function updateWorkshop(workshopId, data, file = null, uid) {
  const workshopRef = db.collection(WORKSHOP_COLLECTION).doc(workshopId);
  const existing = await workshopRef.get();

  if (!existing.exists) {
    const error = new Error("Taller no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Verificar permisos
  const existingData = existing.data();
  if (existingData.creadoPor !== uid) {
    const { db: fireDb } = require("../config/firebase");
    const userDoc = await fireDb.collection("usuarios").doc(uid).get();
    if (!userDoc.exists || userDoc.data().rol !== "admin") {
      const error = new Error("No tienes permisos para editar este taller");
      error.statusCode = 403;
      throw error;
    }
  }

  let updateData = {};

  // Campos que se pueden actualizar
  const allowedFields = [
    "titulo", "instructor", "categoria", "nivel",
    "descripcion", "descripcionLarga", "fecha", "hora",
    "duracion", "precio", "ubicacion", "materiales",
    "contacto", "resultados", "linkReunion", "plataformaReunion",
    "cuposTotal", "cuposDisponibles", "estado",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  // Parsear tipos
  if (updateData.precio !== undefined) updateData.precio = Number(updateData.precio);
  if (updateData.cuposTotal !== undefined) updateData.cuposTotal = Number(updateData.cuposTotal);
  
  // Si se actualiza cuposTotal, recalcular cuposDisponibles basado en participantes actuales
  if (updateData.cuposTotal !== undefined) {
    const participantesActuales = existingData.participantes || 0;
    updateData.cuposDisponibles = Math.max(0, updateData.cuposTotal - participantesActuales);
  } else if (updateData.cuposDisponibles !== undefined) {
    updateData.cuposDisponibles = Number(updateData.cuposDisponibles);
  }

  // Limpiar linkReunion vacío
  if (updateData.linkReunion !== undefined) {
    updateData.linkReunion = updateData.linkReunion.trim() || null;
  }
  if (updateData.plataformaReunion !== undefined) {
    updateData.plataformaReunion = updateData.plataformaReunion.trim() || null;
  }

  // Si viene nueva imagen, subirla
  if (file) {
    if (existingData.imagenPublicId) {
      await deleteResource(existingData.imagenPublicId, "image");
    }
    const result = await uploadImage(file, "maraleste/talleres");
    updateData.imagenPortada = result.url;
    updateData.imagenPublicId = result.publicId;
  }

  updateData.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();
  await workshopRef.update(updateData);

  return getWorkshopById(workshopId);
}

// ==================== ELIMINAR ====================

/**
 * Elimina un taller.
 * @param {string} workshopId
 * @param {string} uid - UID del usuario que elimina
 * @returns {Promise<void>}
 */
async function deleteWorkshop(workshopId, uid) {
  const workshopRef = db.collection(WORKSHOP_COLLECTION).doc(workshopId);
  const existing = await workshopRef.get();

  if (!existing.exists) {
    const error = new Error("Taller no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Verificar permisos
  const existingData = existing.data();
  if (existingData.creadoPor !== uid) {
    const { db: fireDb } = require("../config/firebase");
    const userDoc = await fireDb.collection("usuarios").doc(uid).get();
    if (!userDoc.exists || userDoc.data().rol !== "admin") {
      const error = new Error("No tienes permisos para eliminar este taller");
      error.statusCode = 403;
      throw error;
    }
  }

  // Eliminar imagen de Cloudinary
  if (existingData.imagenPublicId) {
    await deleteResource(existingData.imagenPublicId, "image");
  }

  await workshopRef.delete();
}

module.exports = {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  getWorkshopByIdWithAccess,
  getUserWorkshopAccesses,
  registerWorkshopAccess,
  hasWorkshopAccess,
  updateWorkshop,
  deleteWorkshop,
};
