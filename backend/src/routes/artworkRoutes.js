/**
 * Rutas de Obras de Arte.
 * Define los endpoints REST para CRUD de obras.
 *
 * GET son públicas (galería).
 * POST, PUT, DELETE requieren autenticación.
 */
const express = require("express");
const router = express.Router();
const artworkController = require("../controllers/artworkController");
const { upload } = require("../middlewares/uploadMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---- Rutas públicas ----
// GET    /api/artworks          → Obtener todas las obras (galería)
// GET    /api/artworks/:id      → Obtener una obra por ID
router.get("/", artworkController.getAll);
router.get("/:id", artworkController.getById);

// ---- Rutas protegidas (requieren autenticación) ----
// POST   /api/artworks          → Crear una nueva obra (con imagen)
// PUT    /api/artworks/:id      → Actualizar una obra
// PATCH  /api/artworks/:id/visibility → Cambiar visibilidad de una obra
// DELETE /api/artworks/:id      → Eliminar una obra
router.post("/", authMiddleware, upload.single("imagen"), artworkController.create);
router.put("/:id", authMiddleware, upload.single("imagen"), artworkController.update);
router.patch("/:id/visibility", authMiddleware, artworkController.toggleVisibility);
router.delete("/:id", authMiddleware, artworkController.remove);

module.exports = router;
