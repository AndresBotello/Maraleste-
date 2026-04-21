/**
 * Controller de Obras de Arte — Manejo de peticiones HTTP.
 * Recibe requests, valida, llama al servicio y devuelve respuestas.
 */
const artworkService = require("../services/artworkService");
const { validateArtwork } = require("../models/artworkModel");
const { asyncHandler } = require("../middlewares/errorHandler");

// ==================== CREAR OBRA ====================

const create = asyncHandler(async (req, res) => {
  // Validar datos
  const validation = validateArtwork(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: validation.errors,
    });
  }

  const artwork = await artworkService.createArtwork(
    req.body,
    req.file || null,
    req.user.uid
  );

  res.status(201).json({
    message: "Obra creada exitosamente",
    data: artwork,
  });
});

// ==================== OBTENER TODAS ====================

const getAll = asyncHandler(async (req, res) => {
  const { modalidad } = req.query;
  const artworks = await artworkService.getArtworks(modalidad || null);

  res.json({
    message: "Obras obtenidas",
    count: artworks.length,
    data: artworks,
  });
});

// ==================== OBTENER POR ID ====================

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artwork = await artworkService.getArtworkById(id);

  if (!artwork) {
    return res.status(404).json({ error: "Obra no encontrada" });
  }

  res.json({
    message: "Obra obtenida",
    data: artwork,
  });
});

// ==================== ACTUALIZAR ====================

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artwork = await artworkService.updateArtwork(
    id,
    req.body,
    req.file || null,
    req.user.uid
  );

  res.json({
    message: "Obra actualizada exitosamente",
    data: artwork,
  });
});

// ==================== ELIMINAR ====================

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await artworkService.deleteArtwork(id, req.user.uid);

  res.json({ message: "Obra eliminada exitosamente" });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
