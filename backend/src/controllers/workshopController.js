/**
 * Controller de Talleres — Manejo de peticiones HTTP.
 */
const workshopService = require("../services/workshopService");
const { validateWorkshop } = require("../models/workshopModel");
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

// ==================== CREAR TALLER ====================

const create = asyncHandler(async (req, res) => {
  const validation = validateWorkshop(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: validation.errors,
    });
  }

  const workshop = await workshopService.createWorkshop(
    req.body,
    req.file || null,
    req.user.uid
  );

  res.status(201).json({
    message: "Taller creado exitosamente",
    data: workshop,
  });
});

// ==================== OBTENER TODOS ====================

const getAll = asyncHandler(async (req, res) => {
  const { categoria } = req.query;
  const workshops = await workshopService.getWorkshops(categoria || null);

  res.json({
    message: "Talleres obtenidos",
    count: workshops.length,
    data: workshops,
  });
});

// ==================== OBTENER POR ID ====================

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const optionalUser = await getOptionalUserFromToken(req);
  const workshop = await workshopService.getWorkshopByIdWithAccess(id, optionalUser?.uid || null);

  if (!workshop) {
    return res.status(404).json({ error: "Taller no encontrado" });
  }

  res.json({
    message: "Taller obtenido",
    data: workshop,
  });
});

const getMyAccesses = asyncHandler(async (req, res) => {
  const accesses = await workshopService.getUserWorkshopAccesses(req.user.uid);

  res.json({
    message: "Inscripciones a talleres obtenidas",
    count: accesses.length,
    data: accesses,
  });
});

const checkAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workshop = await workshopService.getWorkshopByIdWithAccess(id, req.user.uid);

  if (!workshop) {
    return res.status(404).json({ error: "Taller no encontrado" });
  }

  res.json({
    message: "Estado de acceso obtenido",
    data: {
      workshopId: id,
      acceso: workshop.acceso,
    },
  });
});

const registerAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { confirmarPago = false } = req.body || {};

  const result = await workshopService.registerWorkshopAccess(id, req.user.uid, {
    confirmarPago: Boolean(confirmarPago),
  });

  res.json({
    message: "Inscripción al taller registrada exitosamente",
    data: result,
  });
});

// ==================== ACTUALIZAR ====================

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workshop = await workshopService.updateWorkshop(
    id,
    req.body,
    req.file || null,
    req.user.uid
  );

  res.json({
    message: "Taller actualizado exitosamente",
    data: workshop,
  });
});

// ==================== ELIMINAR ====================

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await workshopService.deleteWorkshop(id, req.user.uid);

  res.json({ message: "Taller eliminado exitosamente" });
});

module.exports = {
  create,
  getAll,
  getById,
  getMyAccesses,
  checkAccess,
  registerAccess,
  update,
  remove,
};
