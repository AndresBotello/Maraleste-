/**
 * Controller de Cursos — Manejo de peticiones HTTP.
 * Recibe requests, valida, llama al servicio y devuelve respuestas.
 */
const courseService = require("../services/courseService");
const { validateCourse } = require("../models/courseModel");
const { asyncHandler } = require("../middlewares/errorHandler");
const { admin } = require("../config/firebase");

async function getOptionalUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

// ==================== CREAR CURSO ====================

const create = asyncHandler(async (req, res) => {
  // Validar datos
  const validation = validateCourse(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: validation.errors,
    });
  }

  // req.user viene del authMiddleware (contiene uid del creador)
  const course = await courseService.createCourse(
    req.body,
    req.file || null,
    req.user.uid
  );

  res.status(201).json({
    message: "Curso creado exitosamente",
    data: course,
  });
});

// ==================== OBTENER TODOS ====================

const getAll = asyncHandler(async (req, res) => {
  const { categoria } = req.query;
  const courses = await courseService.getCourses(categoria || null);

  res.json({
    message: "Cursos obtenidos",
    count: courses.length,
    data: courses,
  });
});

// ==================== OBTENER CURSOS DEL CREADOR ====================

const getMine = asyncHandler(async (req, res) => {
  const courses = await courseService.getCoursesByCreator(req.user.uid);

  res.json({
    message: "Cursos del creador obtenidos",
    count: courses.length,
    data: courses,
  });
});

const getMyAccesses = asyncHandler(async (req, res) => {
  const accesses = await courseService.getUserCourseAccesses(req.user.uid);

  res.json({
    message: "Inscripciones del usuario obtenidas",
    count: accesses.length,
    data: accesses,
  });
});

// ==================== OBTENER POR ID ====================

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const optionalUser = await getOptionalUserFromToken(req);

  const course = await courseService.getCourseByIdWithAccess(id, {
    requesterUid: optionalUser?.uid || null,
    includeProtectedContent: true,
  });

  if (!course) {
    return res.status(404).json({ error: "Curso no encontrado" });
  }

  res.json({
    message: "Curso obtenido",
    data: course,
  });
});

// ==================== REGISTRAR ACCESO (COMPRA/INSCRIPCION) ====================

const registerAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { confirmarPago = false } = req.body || {};

  const result = await courseService.registerCourseAccess(id, req.user.uid, {
    confirmarPago: Boolean(confirmarPago),
  });

  res.json({
    message: "Acceso al curso registrado exitosamente",
    data: result,
  });
});

// ==================== VERIFICAR ACCESO ====================

const checkAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await courseService.getCourseByIdWithAccess(id, {
    requesterUid: req.user.uid,
    includeProtectedContent: false,
  });

  if (!course) {
    return res.status(404).json({ error: "Curso no encontrado" });
  }

  res.json({
    message: "Estado de acceso obtenido",
    data: {
      courseId: id,
      acceso: course.acceso,
    },
  });
});

// ==================== SUSCRIPTORES ====================

const getSubscribers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscribers = await courseService.getCourseSubscribers(id, req.user.uid);

  res.json({
    message: "Suscriptores obtenidos",
    count: subscribers.length,
    data: subscribers,
  });
});

const getChallengeProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await courseService.getCourseChallengeProgress(id, req.user.uid);

  res.json({
    message: "Progreso de retos obtenido",
    data,
  });
});

const getMyChallengeSubmission = asyncHandler(async (req, res) => {
  const { id, moduleId } = req.params;
  const submission = await courseService.getMyModuleChallengeSubmission(id, moduleId, req.user.uid);

  res.json({
    message: "Entrega de reto obtenida",
    data: submission,
  });
});

const submitChallenge = asyncHandler(async (req, res) => {
  const { id, moduleId } = req.params;
  const submission = await courseService.submitModuleChallenge(
    id,
    moduleId,
    req.user.uid,
    req.file || null,
    req.body || {}
  );

  res.status(201).json({
    message: "Reto entregado exitosamente",
    data: submission,
  });
});

const reviewChallengeSubmission = asyncHandler(async (req, res) => {
  const { id, moduleId, studentUid } = req.params;
  const submission = await courseService.reviewModuleChallengeSubmission(
    id,
    moduleId,
    studentUid,
    req.user.uid,
    req.body || {}
  );

  res.json({
    message: "Entrega revisada exitosamente",
    data: submission,
  });
});

// ==================== PROGRESO ====================

const getProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const progress = await courseService.getCourseProgress(id, req.user.uid);

  res.json({
    message: "Progreso obtenido",
    data: progress,
  });
});

const saveProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const progress = await courseService.saveCourseProgress(id, req.user.uid, req.body || {});

  res.json({
    message: "Progreso guardado",
    data: progress,
  });
});

// ==================== ACTUALIZAR ====================

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await courseService.updateCourse(
    id,
    req.body,
    req.file || null,
    req.user.uid
  );

  res.json({
    message: "Curso actualizado exitosamente",
    data: course,
  });
});

// ==================== ELIMINAR ====================

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await courseService.deleteCourse(id, req.user.uid);

  res.json({ message: "Curso eliminado exitosamente" });
});

// ==================== ESTADO ====================

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body || {};

  const updatedCourse = await courseService.updateCourseStatus(id, req.user.uid, estado);

  res.json({
    message: "Estado del curso actualizado",
    data: updatedCourse,
  });
});

module.exports = {
  create,
  getAll,
  getMine,
  getMyAccesses,
  getById,
  registerAccess,
  checkAccess,
  getSubscribers,
  getChallengeProgress,
  getMyChallengeSubmission,
  getProgress,
  submitChallenge,
  reviewChallengeSubmission,
  saveProgress,
  update,
  updateStatus,
  remove,
};
