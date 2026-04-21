/**
 * Servicio de Cursos — Lógica de negocio con subcolecciones.
 *
 * Estructura Firestore:
 *   cursos/{courseId}
 *   cursos/{courseId}/modulos/{moduloId}
 *   cursos/{courseId}/modulos/{moduloId}/lecciones/{leccionId}
 *   cursos/{courseId}/modulos/{moduloId}/quiz/{quizId}
 */
const { db } = require("../config/firebase");
const {
  COURSE_COLLECTION,
  buildCourseData,
  buildModuleData,
  buildLessonData,
  buildQuizData,
} = require("../models/courseModel");
const admin = require("firebase-admin");
const { uploadImage, deleteResource } = require("./uploadService");
const { notifyNewCoursePublished } = require("./notificationService");

const USER_COLLECTION = "usuarios";
const USER_COURSE_ACCESS_SUBCOLLECTION = "cursosAdquiridos";
const COURSE_SUBSCRIBERS_SUBCOLLECTION = "suscriptores";
const USER_COURSE_PROGRESS_SUBCOLLECTION = "progresoCursos";
const MODULE_CHALLENGE_SUBMISSIONS_SUBCOLLECTION = "retosEntregas";

// ==================== HELPERS ====================

/**
 * Elimina recursivamente todas las subcolecciones de un curso.
 * @param {FirebaseFirestore.DocumentReference} courseRef
 */
async function deleteSubcollections(courseRef) {
  // Obtener todos los módulos
  const modulosSnap = await courseRef.collection("modulos").get();

  const batch = db.batch();

  for (const moduloDoc of modulosSnap.docs) {
    // Eliminar lecciones del módulo
    const leccionesSnap = await moduloDoc.ref.collection("lecciones").get();
    leccionesSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Eliminar quiz del módulo
    const quizSnap = await moduloDoc.ref.collection("quiz").get();
    quizSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Eliminar el módulo
    batch.delete(moduloDoc.ref);
  }

  await batch.commit();
}

/**
 * Guarda módulos, lecciones y quizzes como subcolecciones del curso.
 * @param {FirebaseFirestore.DocumentReference} courseRef
 * @param {Array} modulos - Array de módulos desde el frontend
 */
/**
 * Procesa una imagen en base64 y la sube a Cloudinary si es necesario.
 * @param {string|null} imagen - Data URL o URL existente
 * @param {string} courseId - ID del curso
 * @returns {Promise<string|null>} URL de Cloudinary o null
 */
async function processLessonImage(imagen, courseId) {
  if (!imagen) return null;
  
  // Si ya es una URL de Cloudinary, devolverla como está
  if (typeof imagen === 'string' && imagen.startsWith('http')) {
    return imagen;
  }
  
  // Si es una data URL, convertir a buffer y subir a Cloudinary
  if (typeof imagen === 'string' && imagen.startsWith('data:image')) {
    try {
      const base64Data = imagen.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Crear un archivo temporal
      const tempFile = {
        buffer: buffer,
        mimetype: 'image/jpeg'
      };
      
      const result = await uploadImage(tempFile, `maraleste/cursos/${courseId}/lecciones`);
      return result.url;
    } catch (error) {
      console.error('Error subiendo imagen de lección:', error);
      return null;
    }
  }
  
  return null;
}

async function saveModulesWithSubcollections(courseRef, modulos) {
  if (!Array.isArray(modulos) || modulos.length === 0) return;

  const batch = db.batch();
  const courseId = courseRef.id;

  for (let moduloIndex = 0; moduloIndex < modulos.length; moduloIndex++) {
    const modulo = modulos[moduloIndex];
    const orden = moduloIndex + 1;
    const moduloRef = courseRef.collection("modulos").doc();

    // Documento del módulo
    const moduloData = buildModuleData(modulo, orden);
    moduloData.creadoEn = admin.firestore.FieldValue.serverTimestamp();
    batch.set(moduloRef, moduloData);

    // Lecciones del módulo (procesar imágenes)
    if (Array.isArray(modulo.lecciones)) {
      for (let leccionIndex = 0; leccionIndex < modulo.lecciones.length; leccionIndex++) {
        const leccion = modulo.lecciones[leccionIndex];
        
        // Procesar imagen de la lección
        if (leccion.imagen) {
          leccion.imagen = await processLessonImage(leccion.imagen, courseId);
        }
        
        const leccionRef = moduloRef.collection("lecciones").doc();
        const leccionData = buildLessonData(leccion, leccionIndex + 1);
        leccionData.creadoEn = admin.firestore.FieldValue.serverTimestamp();
        batch.set(leccionRef, leccionData);
      }
    }

    // Quiz del módulo (máximo 1 por módulo)
    if (modulo.quiz) {
      const quizRef = moduloRef.collection("quiz").doc();
      const quizData = buildQuizData(modulo.quiz);
      quizData.creadoEn = admin.firestore.FieldValue.serverTimestamp();
      batch.set(quizRef, quizData);
    }
  }

  await batch.commit();
}

/**
 * Verifica si el usuario es admin.
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
async function isUserAdmin(uid) {
  if (!uid) return false;
  const userDoc = await db.collection(USER_COLLECTION).doc(uid).get();
  return userDoc.exists && userDoc.data().rol === "admin";
}

/**
 * Verifica que el usuario sea el creador del curso.
 * @param {Object} courseData
 * @param {string} uid
 */
function assertCourseOwner(courseData, uid) {
  if (!courseData || courseData.creadoPor !== uid) {
    const error = new Error("Solo el administrador creador del curso puede realizar esta acción");
    error.statusCode = 403;
    throw error;
  }
}

/**
 * Verifica si un usuario tiene acceso a un curso.
 * Reglas:
 * - Cursos gratis: acceso para todos.
 * - Cursos de pago: acceso para admin, creador o usuario con compra registrada.
 *
 * @param {Object} courseData
 * @param {string|null} requesterUid
 * @returns {Promise<boolean>}
 */
async function hasCourseAccess(courseData, requesterUid = null) {
  if (!courseData) return false;
  let accessDoc = null;

  if (courseData.estado === "inactivo") {
    if (!requesterUid) return false;
    if (courseData.creadoPor === requesterUid) return true;

    accessDoc = await db
      .collection(USER_COLLECTION)
      .doc(requesterUid)
      .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
      .doc(courseData.id)
      .get();

    return accessDoc.exists;
  }

  if (courseData.tipoAcceso !== "pago") return true;
  if (!requesterUid) return false;
  if (courseData.creadoPor === requesterUid) return true;

  if (await isUserAdmin(requesterUid)) {
    return true;
  }

  if (!accessDoc) {
    accessDoc = await db
      .collection(USER_COLLECTION)
      .doc(requesterUid)
      .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
      .doc(courseData.id)
      .get();
  }

  return accessDoc.exists;
}

// ==================== CREAR CURSO ====================

/**
 * Crea un nuevo curso con subcolecciones para módulos, lecciones y quizzes.
 * @param {Object} data - Datos del curso
 * @param {Object|null} file - Archivo de imagen (de multer)
 * @param {string} uid - UID del usuario creador
 * @returns {Promise<{id: string, ...Object}>}
 */
async function createCourse(data, file = null, uid) {
  let imagenUrl = null;
  let imagenPublicId = null;

  // Subir imagen a Cloudinary si se proporcionó
  if (file) {
    const result = await uploadImage(file, "maraleste/cursos");
    imagenUrl = result.url;
    imagenPublicId = result.publicId;
  }

  // Parsear modulos_detalle si viene como string (multipart/form-data)
  let modulos = [];
  if (typeof data.modulos_detalle === "string") {
    try {
      modulos = JSON.parse(data.modulos_detalle);
    } catch {
      modulos = [];
    }
  } else if (Array.isArray(data.modulos_detalle)) {
    modulos = data.modulos_detalle;
  }

  // Parsear certificado si viene como string
  if (typeof data.certificado === "string") {
    data.certificado = data.certificado === "true";
  }

  // 1. Crear documento principal del curso
  const courseData = buildCourseData(data, imagenUrl, imagenPublicId, uid, modulos.length);
  courseData.creadoEn = admin.firestore.FieldValue.serverTimestamp();
  courseData.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();

  const courseRef = await db.collection(COURSE_COLLECTION).add(courseData);

  // 2. Crear subcolecciones (módulos → lecciones + quiz)
  await saveModulesWithSubcollections(courseRef, modulos);

  // 3. Notificar usuarios activos sobre nuevo curso publicado
  try {
    await notifyNewCoursePublished(
      {
        courseId: courseRef.id,
        title: courseData.titulo,
        instructor: courseData.instructor,
      },
      uid
    );
  } catch (error) {
    console.error("No se pudieron crear notificaciones de nuevo curso:", error.message);
  }

  return { id: courseRef.id, ...courseData };
}

// ==================== OBTENER TODOS ====================

/**
 * Obtiene todos los cursos publicados (sin subcolecciones).
 * Para el listado/catálogo solo necesitamos el documento principal.
 * @param {string|null} categoria - Filtrar por categoría
 * @returns {Promise<Array>}
 */
async function getCourses(categoria = null) {
  // Query simple sin índice compuesto: traer todos y filtrar/ordenar en memoria
  const snapshot = await db.collection(COURSE_COLLECTION).get();
  let courses = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((c) => c.estado === "publicado");

  // Ordenar por fecha de creación (más recientes primero)
  courses.sort((a, b) => {
    const dateA = a.creadoEn?._seconds || a.creadoEn?.seconds || 0;
    const dateB = b.creadoEn?._seconds || b.creadoEn?.seconds || 0;
    return dateB - dateA;
  });

  if (categoria && categoria !== "todos") {
    courses = courses.filter((c) => c.categoria === categoria);
  }

  return courses;
}

/**
 * Obtiene todos los cursos creados por un administrador (incluye inactivos).
 * @param {string} uid
 * @returns {Promise<Array>}
 */
async function getCoursesByCreator(uid) {
  const snapshot = await db.collection(COURSE_COLLECTION).where("creadoPor", "==", uid).get();

  const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  courses.sort((a, b) => {
    const dateA = a.creadoEn?._seconds || a.creadoEn?.seconds || 0;
    const dateB = b.creadoEn?._seconds || b.creadoEn?.seconds || 0;
    return dateB - dateA;
  });

  return courses;
}

/**
 * Obtiene cursos a los que el usuario está suscrito.
 * @param {string} uid
 * @returns {Promise<Array>}
 */
async function getUserCourseAccesses(uid) {
  const accessSnap = await db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
    .orderBy("registradoEn", "desc")
    .get();

  return accessSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ==================== OBTENER POR ID (CON SUBCOLECCIONES) ====================

/**
 * Obtiene un curso completo con sus módulos, lecciones y quizzes.
 * @param {string} courseId
 * @returns {Promise<Object|null>}
 */
async function getCourseById(courseId) {
  const courseDoc = await db.collection(COURSE_COLLECTION).doc(courseId).get();
  if (!courseDoc.exists) return null;

  const courseData = { id: courseDoc.id, ...courseDoc.data() };

  return enrichCourseWithModules(courseDoc, courseData);
}

/**
 * Carga módulos, lecciones y quiz de un curso en paralelo.
 * @param {FirebaseFirestore.DocumentSnapshot} courseDoc
 * @param {Object} courseData
 * @returns {Promise<Object>}
 */
async function enrichCourseWithModules(courseDoc, courseData) {
  if (!courseDoc?.exists) return courseData;

  // Obtener módulos ordenados
  const modulosSnap = await courseDoc.ref
    .collection("modulos")
    .orderBy("orden", "asc")
    .get();

  const modulesWithContent = await Promise.all(
    modulosSnap.docs.map(async (moduloDoc) => {
      const [leccionesSnap, quizSnap] = await Promise.all([
        moduloDoc.ref.collection("lecciones").orderBy("orden", "asc").get(),
        moduloDoc.ref.collection("quiz").get(),
      ]);

      return {
        id: moduloDoc.id,
        ...moduloDoc.data(),
        lecciones: leccionesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        quiz: quizSnap.empty
          ? null
          : { id: quizSnap.docs[0].id, ...quizSnap.docs[0].data() },
      };
    })
  );

  courseData.modulos_detalle = modulesWithContent;

  return courseData;
}

/**
 * Obtiene un curso con control de acceso al contenido protegido.
 * @param {string} courseId
 * @param {{ requesterUid?: string|null, includeProtectedContent?: boolean }} options
 * @returns {Promise<Object|null>}
 */
async function getCourseByIdWithAccess(courseId, options = {}) {
  const { requesterUid = null, includeProtectedContent = true } = options;
  const courseDoc = await db.collection(COURSE_COLLECTION).doc(courseId).get();
  if (!courseDoc.exists) return null;

  const course = { id: courseDoc.id, ...courseDoc.data() };

  const accessGranted = await hasCourseAccess(course, requesterUid);

  // Curso inactivo: invisible para usuarios no suscritos/no autorizados.
  if (course.estado === "inactivo" && !accessGranted) {
    return null;
  }

  course.acceso = {
    tipo: course.tipoAcceso || "gratis",
    moneda: course.moneda || "COP",
    disponible: accessGranted,
  };

  if (!includeProtectedContent || !accessGranted) {
    course.modulos_detalle = [];
    return course;
  }

  return enrichCourseWithModules(courseDoc, course);
}

/**
 * Registra acceso de un usuario a un curso.
 * - Cursos gratis: acceso inmediato.
 * - Cursos de pago: requiere confirmación explícita desde frontend.
 *
 * @param {string} courseId
 * @param {string} uid
 * @param {Object} options
 * @param {boolean} [options.confirmarPago=false]
 * @returns {Promise<Object>}
 */
async function registerCourseAccess(courseId, uid, options = {}) {
  const { confirmarPago = false } = options;

  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const userAccessRef = db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
    .doc(courseId);
  const courseSubscriberRef = courseRef
    .collection(COURSE_SUBSCRIBERS_SUBCOLLECTION)
    .doc(uid);

  const courseDoc = await courseRef.get();
  if (!courseDoc.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const courseData = { id: courseDoc.id, ...courseDoc.data() };
  const isPaid = courseData.tipoAcceso === "pago";

  if (courseData.estado === "inactivo") {
    const existingAccess = await userAccessRef.get();
    if (!existingAccess.exists) {
      const error = new Error("Este curso está inactivo y no admite nuevas suscripciones");
      error.statusCode = 403;
      throw error;
    }
  }

  if (isPaid && !confirmarPago) {
    const error = new Error("Este curso es de pago. Debes confirmar la compra para habilitar acceso.");
    error.statusCode = 400;
    throw error;
  }

  const alreadyHasAccess = await userAccessRef.get();
  if (alreadyHasAccess.exists) {
    return {
      courseId,
      uid,
      yaRegistrado: true,
      tipoAcceso: courseData.tipoAcceso || "gratis",
    };
  }

  await db.runTransaction(async (tx) => {
    const [courseSnap, accessSnap] = await Promise.all([
      tx.get(courseRef),
      tx.get(userAccessRef),
    ]);
    if (!courseSnap.exists) {
      throw new Error("Curso no encontrado");
    }
    if (accessSnap.exists) {
      return;
    }

    tx.set(userAccessRef, {
      courseId,
      uid,
      tipoAcceso: courseData.tipoAcceso || "gratis",
      moneda: courseData.moneda || "COP",
      precio: Number(courseData.precio || 0),
      registradoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.set(courseSubscriberRef, {
      courseId,
      uid,
      tipoAcceso: courseData.tipoAcceso || "gratis",
      moneda: courseData.moneda || "COP",
      precio: Number(courseData.precio || 0),
      registradoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(courseRef, {
      estudiantes: admin.firestore.FieldValue.increment(1),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return {
    courseId,
    uid,
    yaRegistrado: false,
    tipoAcceso: courseData.tipoAcceso || "gratis",
  };
}

/**
 * Obtiene los usuarios suscritos a un curso.
 * Solo disponible para el creador del curso.
 *
 * @param {string} courseId
 * @param {string} uid
 * @returns {Promise<Array>}
 */
async function getCourseSubscribers(courseId, uid) {
  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const existing = await courseRef.get();

  if (!existing.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const courseData = existing.data();
  assertCourseOwner(courseData, uid);

  const subscribersSnap = await courseRef
    .collection(COURSE_SUBSCRIBERS_SUBCOLLECTION)
    .orderBy("registradoEn", "desc")
    .get();

  const subscribers = await Promise.all(
    subscribersSnap.docs.map(async (doc) => {
      const subscriber = doc.data();
      const userDoc = await db.collection(USER_COLLECTION).doc(subscriber.uid).get();
      const userProfile = userDoc.exists ? userDoc.data() : null;

      return {
        uid: subscriber.uid,
        firstName: userProfile?.firstName || "",
        lastName: userProfile?.lastName || "",
        email: userProfile?.email || "",
        tipoAcceso: subscriber.tipoAcceso,
        precio: subscriber.precio,
        moneda: subscriber.moneda || "COP",
        registradoEn: subscriber.registradoEn,
      };
    })
  );

  return subscribers;
}

/**
 * Obtiene el progreso del usuario en un curso.
 * @param {string} courseId
 * @param {string} uid
 * @returns {Promise<Object>}
 */
async function getCourseProgress(courseId, uid) {
  const course = await getCourseByIdWithAccess(courseId, {
    requesterUid: uid,
    includeProtectedContent: true,
  });

  if (!course) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!course.acceso?.disponible) {
    const error = new Error("No tienes acceso a este curso");
    error.statusCode = 403;
    throw error;
  }

  const progressRef = db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_COURSE_PROGRESS_SUBCOLLECTION)
    .doc(courseId);

  const progressDoc = await progressRef.get();

  const totalLessons = (course.modulos_detalle || []).reduce(
    (sum, modulo) => sum + ((modulo.lecciones || []).length),
    0
  );

  const progressData = progressDoc.exists
    ? progressDoc.data()
    : {
        courseId,
        uid,
        ultimaSesion: {
          moduloId: null,
          leccionId: null,
        },
        progresoPorModulo: {},
      };

  const completedCount = Object.values(progressData.progresoPorModulo || {}).reduce((sum, moduleProgress) => {
    const completedLessons = Array.isArray(moduleProgress?.leccionesCompletadas)
      ? moduleProgress.leccionesCompletadas.length
      : 0;
    return sum + completedLessons;
  }, 0);

  const porcentajeCurso = totalLessons > 0
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  return {
    ...progressData,
    resumen: {
      leccionesCompletadas: completedCount,
      totalLecciones: totalLessons,
      porcentajeCurso,
      completado: totalLessons > 0 && completedCount >= totalLessons,
    },
  };
}

/**
 * Obtiene una entrega de reto del usuario en un módulo.
 * @param {string} courseId
 * @param {string} moduleId
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
async function getMyModuleChallengeSubmission(courseId, moduleId, uid) {
  const course = await getCourseByIdWithAccess(courseId, {
    requesterUid: uid,
    includeProtectedContent: false,
  });

  if (!course || !course.acceso?.disponible) {
    const error = new Error("No tienes acceso a este curso");
    error.statusCode = 403;
    throw error;
  }

  const moduleRef = db.collection(COURSE_COLLECTION).doc(courseId).collection("modulos").doc(moduleId);
  const moduleDoc = await moduleRef.get();

  if (!moduleDoc.exists) {
    const error = new Error("Módulo no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const submissionDoc = await moduleRef
    .collection(MODULE_CHALLENGE_SUBMISSIONS_SUBCOLLECTION)
    .doc(uid)
    .get();

  if (!submissionDoc.exists) return null;
  return { id: submissionDoc.id, ...submissionDoc.data() };
}

/**
 * Registra o reemplaza la entrega de reto del estudiante.
 * @param {string} courseId
 * @param {string} moduleId
 * @param {string} uid
 * @param {Object} file
 * @param {{ comentario?: string }} data
 * @returns {Promise<Object>}
 */
async function submitModuleChallenge(courseId, moduleId, uid, file, data = {}) {
  if (!file) {
    const error = new Error("Debes subir una imagen para entregar el reto");
    error.statusCode = 400;
    throw error;
  }

  const course = await getCourseByIdWithAccess(courseId, {
    requesterUid: uid,
    includeProtectedContent: false,
  });

  if (!course || !course.acceso?.disponible) {
    const error = new Error("No tienes acceso a este curso");
    error.statusCode = 403;
    throw error;
  }

  const moduleRef = db.collection(COURSE_COLLECTION).doc(courseId).collection("modulos").doc(moduleId);
  const moduleDoc = await moduleRef.get();

  if (!moduleDoc.exists) {
    const error = new Error("Módulo no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const moduleData = moduleDoc.data();
  if (!moduleData?.reto?.habilitado) {
    const error = new Error("Este módulo no tiene reto habilitado");
    error.statusCode = 400;
    throw error;
  }

  const submissionRef = moduleRef
    .collection(MODULE_CHALLENGE_SUBMISSIONS_SUBCOLLECTION)
    .doc(uid);

  const existingSubmission = await submissionRef.get();
  if (existingSubmission.exists && existingSubmission.data()?.evidenciaPublicId) {
    await deleteResource(existingSubmission.data().evidenciaPublicId, "image");
  }

  const uploadResult = await uploadImage(file, `maraleste/cursos/${courseId}/retos`);

  const payload = {
    courseId,
    moduleId,
    uid,
    evidenciaUrl: uploadResult.url,
    evidenciaPublicId: uploadResult.publicId,
    comentario: (data.comentario || "").trim(),
    estado: "pendiente",
    feedback: "",
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!existingSubmission.exists) {
    payload.entregadoEn = admin.firestore.FieldValue.serverTimestamp();
  }

  await submissionRef.set(payload, { merge: true });

  await saveCourseProgress(courseId, uid, {
    moduloId: moduleId,
    leccionId: null,
  });

  return getMyModuleChallengeSubmission(courseId, moduleId, uid);
}

/**
 * Aprueba o rechaza entrega de reto.
 * Solo el creador del curso puede revisar.
 * @param {string} courseId
 * @param {string} moduleId
 * @param {string} studentUid
 * @param {string} reviewerUid
 * @param {{ estado: 'aprobado'|'rechazado', feedback?: string }} data
 * @returns {Promise<Object>}
 */
async function reviewModuleChallengeSubmission(courseId, moduleId, studentUid, reviewerUid, data = {}) {
  const estado = data.estado;
  if (!["aprobado", "rechazado"].includes(estado)) {
    const error = new Error("El estado de revisión debe ser 'aprobado' o 'rechazado'");
    error.statusCode = 400;
    throw error;
  }

  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const courseDoc = await courseRef.get();
  if (!courseDoc.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const courseData = courseDoc.data();
  assertCourseOwner(courseData, reviewerUid);

  const submissionRef = courseRef
    .collection("modulos")
    .doc(moduleId)
    .collection(MODULE_CHALLENGE_SUBMISSIONS_SUBCOLLECTION)
    .doc(studentUid);

  const submissionDoc = await submissionRef.get();
  if (!submissionDoc.exists) {
    const error = new Error("No existe entrega para este estudiante en el reto seleccionado");
    error.statusCode = 404;
    throw error;
  }

  await submissionRef.update({
    estado,
    feedback: (data.feedback || "").trim(),
    revisadoPor: reviewerUid,
    revisadoEn: admin.firestore.FieldValue.serverTimestamp(),
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });

  const progressRef = db
    .collection(USER_COLLECTION)
    .doc(studentUid)
    .collection(USER_COURSE_PROGRESS_SUBCOLLECTION)
    .doc(courseId);

  await progressRef.set({
    progresoPorModulo: {
      [moduleId]: {
        retoEstado: estado,
        retoFeedback: (data.feedback || "").trim(),
        retoRevisadoEn: admin.firestore.FieldValue.serverTimestamp(),
      },
    },
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  const updatedSubmission = await submissionRef.get();
  return { id: updatedSubmission.id, ...updatedSubmission.data() };
}

/**
 * Obtiene avance de retos por curso para revisión del creador.
 * @param {string} courseId
 * @param {string} reviewerUid
 * @returns {Promise<Object>}
 */
async function getCourseChallengeProgress(courseId, reviewerUid) {
  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const courseDoc = await courseRef.get();

  if (!courseDoc.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const courseData = { id: courseDoc.id, ...courseDoc.data() };
  assertCourseOwner(courseData, reviewerUid);

  const modulosSnap = await courseRef.collection("modulos").orderBy("orden", "asc").get();
  const modulosConReto = modulosSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((m) => m?.reto?.habilitado);

  const subscribersSnap = await courseRef
    .collection(COURSE_SUBSCRIBERS_SUBCOLLECTION)
    .orderBy("registradoEn", "desc")
    .get();

  const submissionsByModule = {};
  await Promise.all(
    modulosConReto.map(async (modulo) => {
      const submissionsSnap = await courseRef
        .collection("modulos")
        .doc(modulo.id)
        .collection(MODULE_CHALLENGE_SUBMISSIONS_SUBCOLLECTION)
        .get();

      submissionsByModule[modulo.id] = submissionsSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});
    })
  );

  const totalLessons = await (async () => {
    let count = 0;
    for (const moduleDoc of modulosSnap.docs) {
      const lessonsSnap = await moduleDoc.ref.collection("lecciones").get();
      count += lessonsSnap.size;
    }
    return count;
  })();

  const students = await Promise.all(
    subscribersSnap.docs.map(async (subscriberDoc) => {
      const subscriber = subscriberDoc.data();
      const userDoc = await db.collection(USER_COLLECTION).doc(subscriber.uid).get();
      const userProfile = userDoc.exists ? userDoc.data() : {};

      const progressDoc = await db
        .collection(USER_COLLECTION)
        .doc(subscriber.uid)
        .collection(USER_COURSE_PROGRESS_SUBCOLLECTION)
        .doc(courseId)
        .get();

      const progressData = progressDoc.exists ? progressDoc.data() : { progresoPorModulo: {} };
      const completedLessons = Object.values(progressData.progresoPorModulo || {}).reduce((sum, moduleProgress) => {
        const completed = Array.isArray(moduleProgress?.leccionesCompletadas)
          ? moduleProgress.leccionesCompletadas.length
          : 0;
        return sum + completed;
      }, 0);

      const porcentajeCurso = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const retos = modulosConReto.map((modulo) => {
        const submission = submissionsByModule[modulo.id]?.[subscriber.uid] || null;
        return {
          moduleId: modulo.id,
          moduloTitulo: modulo.titulo,
          retoTitulo: modulo?.reto?.titulo || "Reto del módulo",
          retoDescripcion: modulo?.reto?.descripcion || "",
          estado: submission?.estado || "sin_entrega",
          evidenciaUrl: submission?.evidenciaUrl || null,
          comentario: submission?.comentario || "",
          feedback: submission?.feedback || "",
          entregadoEn: submission?.entregadoEn || null,
          revisadoEn: submission?.revisadoEn || null,
        };
      });

      const resumenRetos = retos.reduce((acc, reto) => {
        if (reto.estado === "aprobado") acc.aprobados += 1;
        else if (reto.estado === "rechazado") acc.rechazados += 1;
        else if (reto.estado === "pendiente") acc.pendientes += 1;
        else acc.sinEntrega += 1;
        return acc;
      }, { aprobados: 0, rechazados: 0, pendientes: 0, sinEntrega: 0 });

      return {
        uid: subscriber.uid,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        progresoCurso: {
          porcentaje: porcentajeCurso,
          completadas: completedLessons,
          totalLecciones: totalLessons,
        },
        resumenRetos,
        retos,
      };
    })
  );

  return {
    course: {
      id: courseData.id,
      titulo: courseData.titulo,
    },
    totalRetos: modulosConReto.length,
    students,
  };
}

/**
 * Guarda progreso del usuario en un curso.
 * @param {string} courseId
 * @param {string} uid
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function saveCourseProgress(courseId, uid, data = {}) {
  const { moduloId, leccionId, leccionesCompletadas = [] } = data;

  if (!moduloId) {
    const error = new Error("El moduloId es obligatorio para guardar progreso");
    error.statusCode = 400;
    throw error;
  }

  const course = await getCourseByIdWithAccess(courseId, {
    requesterUid: uid,
    includeProtectedContent: true,
  });

  if (!course) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!course.acceso?.disponible) {
    const error = new Error("No tienes acceso a este curso");
    error.statusCode = 403;
    throw error;
  }

  const progressRef = db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_COURSE_PROGRESS_SUBCOLLECTION)
    .doc(courseId);

  const existingProgress = await progressRef.get();
  const current = existingProgress.exists ? existingProgress.data() : { progresoPorModulo: {} };
  const currentModuleProgress = current.progresoPorModulo?.[moduloId] || {};

  const normalizedCompleted = Array.isArray(leccionesCompletadas)
    ? [...new Set(leccionesCompletadas.filter(Boolean))]
    : (Array.isArray(currentModuleProgress.leccionesCompletadas) ? currentModuleProgress.leccionesCompletadas : []);

  const newProgress = {
    courseId,
    uid,
    ultimaSesion: {
      moduloId,
      leccionId: leccionId || current.ultimaSesion?.leccionId || null,
    },
    progresoPorModulo: {
      ...(current.progresoPorModulo || {}),
      [moduloId]: {
        ...currentModuleProgress,
        ultimaLeccionId: leccionId || currentModuleProgress.ultimaLeccionId || null,
        leccionesCompletadas: normalizedCompleted,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      },
    },
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!existingProgress.exists) {
    newProgress.creadoEn = admin.firestore.FieldValue.serverTimestamp();
  }

  await progressRef.set(newProgress, { merge: true });

  return getCourseProgress(courseId, uid);
}

// ==================== ACTUALIZAR ====================

/**
 * Actualiza un curso existente. Si se envían módulos, reemplaza las subcolecciones.
 * @param {string} courseId
 * @param {Object} data
 * @param {Object|null} file - Nueva imagen (opcional)
 * @param {string} uid - UID del usuario que actualiza
 * @returns {Promise<Object>}
 */
async function updateCourse(courseId, data, file = null, uid) {
  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const existing = await courseRef.get();

  if (!existing.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Verificar que el usuario sea el creador
  const existingData = existing.data();
  assertCourseOwner(existingData, uid);

  let updateData = {};

  // Campos simples que se pueden actualizar
  const allowedFields = [
    "titulo", "instructor", "categoria", "nivel", "idioma",
    "descripcion", "descripcionLarga", "duracion", "precio",
    "tipoAcceso", "certificado", "requisitos", "estado",
  ];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  // Parsear precio y certificado
  if (updateData.precio !== undefined) updateData.precio = Number(updateData.precio);
  if (updateData.tipoAcceso !== undefined && !["gratis", "pago"].includes(updateData.tipoAcceso)) {
    const error = new Error("El tipo de acceso debe ser 'gratis' o 'pago'");
    error.statusCode = 400;
    throw error;
  }

  if (updateData.tipoAcceso === "gratis") {
    updateData.precio = 0;
    updateData.moneda = "COP";
  }

  if (updateData.tipoAcceso === "pago") {
    const paidPrice = updateData.precio !== undefined ? updateData.precio : Number(existingData.precio || 0);
    if (!paidPrice || paidPrice <= 0) {
      const error = new Error("Los cursos de pago deben tener un precio mayor a 0");
      error.statusCode = 400;
      throw error;
    }
    updateData.precio = paidPrice;
    updateData.moneda = "COP";
  }

  if (updateData.tipoAcceso === undefined && updateData.precio !== undefined && existingData.tipoAcceso !== "gratis") {
    updateData.moneda = "COP";
  }

  if (typeof updateData.certificado === "string") updateData.certificado = updateData.certificado === "true";

  // Si viene nueva imagen, subirla a Cloudinary
  if (file) {
    if (existingData.imagenPublicId) {
      await deleteResource(existingData.imagenPublicId, "image");
    }
    const result = await uploadImage(file, "maraleste/cursos");
    updateData.imagenPortada = result.url;
    updateData.imagenPublicId = result.publicId;
  }

  // Si vienen módulos, reemplazar subcolecciones
  let modulos = null;
  if (data.modulos_detalle !== undefined) {
    if (typeof data.modulos_detalle === "string") {
      try {
        modulos = JSON.parse(data.modulos_detalle);
      } catch {
        modulos = null;
      }
    } else if (Array.isArray(data.modulos_detalle)) {
      modulos = data.modulos_detalle;
    }

    if (modulos) {
      // Eliminar subcolecciones anteriores y crear nuevas
      await deleteSubcollections(courseRef);
      await saveModulesWithSubcollections(courseRef, modulos);
      updateData.totalModulos = modulos.length;
    }
  }

  updateData.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();
  await courseRef.update(updateData);

  // Retornar curso actualizado con subcolecciones
  return getCourseById(courseId);
}

// ==================== ELIMINAR ====================

/**
 * Elimina un curso con todas sus subcolecciones.
 * @param {string} courseId
 * @param {string} uid - UID del usuario que elimina
 * @returns {Promise<void>}
 */
async function deleteCourse(courseId, uid) {
  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const existing = await courseRef.get();

  if (!existing.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Verificar permisos
  const existingData = existing.data();
  assertCourseOwner(existingData, uid);

  // Eliminar imagen de Cloudinary
  if (existingData.imagenPublicId) {
    await deleteResource(existingData.imagenPublicId, "image");
  }

  // Eliminar subcolecciones (módulos → lecciones + quiz)
  await deleteSubcollections(courseRef);

  // Eliminar documento principal
  await courseRef.delete();
}

/**
 * Cambia el estado de un curso (publicado/inactivo).
 * Solo el creador puede cambiar su estado.
 *
 * @param {string} courseId
 * @param {string} uid
 * @param {"publicado"|"inactivo"} estado
 * @returns {Promise<Object>}
 */
async function updateCourseStatus(courseId, uid, estado) {
  if (!["publicado", "inactivo"].includes(estado)) {
    const error = new Error("Estado inválido. Debe ser 'publicado' o 'inactivo'");
    error.statusCode = 400;
    throw error;
  }

  const courseRef = db.collection(COURSE_COLLECTION).doc(courseId);
  const existing = await courseRef.get();

  if (!existing.exists) {
    const error = new Error("Curso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const existingData = existing.data();
  assertCourseOwner(existingData, uid);

  await courseRef.update({
    estado,
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });

  return getCourseById(courseId);
}

module.exports = {
  createCourse,
  getCourses,
  getCoursesByCreator,
  getUserCourseAccesses,
  getCourseById,
  getCourseByIdWithAccess,
  hasCourseAccess,
  registerCourseAccess,
  getCourseSubscribers,
  getCourseChallengeProgress,
  getMyModuleChallengeSubmission,
  getCourseProgress,
  submitModuleChallenge,
  reviewModuleChallengeSubmission,
  saveCourseProgress,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
};
