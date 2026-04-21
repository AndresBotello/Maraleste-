/**
 * Rutas de Talleres.
 * Define los endpoints REST para CRUD de talleres.
 *
 * GET son públicas (catálogo).
 * POST, PUT, DELETE requieren autenticación.
 */
const express = require("express");
const router = express.Router();
const workshopController = require("../controllers/workshopController");
const { upload } = require("../middlewares/uploadMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---- Rutas públicas ----
router.get("/", workshopController.getAll);
router.get("/my-accesses", authMiddleware, workshopController.getMyAccesses);
router.get("/:id", workshopController.getById);
router.get("/:id/access", authMiddleware, workshopController.checkAccess);

// ---- Rutas protegidas ----
router.post("/", authMiddleware, upload.single("imagenPortada"), workshopController.create);
router.post("/:id/access", authMiddleware, workshopController.registerAccess);
router.put("/:id", authMiddleware, upload.single("imagenPortada"), workshopController.update);
router.delete("/:id", authMiddleware, workshopController.remove);

module.exports = router;
