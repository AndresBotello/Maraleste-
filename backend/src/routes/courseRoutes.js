/**
 * Rutas de Cursos.
 * Define los endpoints REST para CRUD de cursos.
 *
 * GET son públicas (catálogo).
 * POST, PUT, DELETE requieren autenticación (solo el creador o admin).
 */
const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { upload } = require("../middlewares/uploadMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---- Rutas públicas ----
// GET    /api/courses          → Obtener todos los cursos (catálogo)
// GET    /api/courses/:id      → Obtener un curso por ID (con módulos, lecciones, quiz)
router.get("/", courseController.getAll);
router.get("/mine", authMiddleware, courseController.getMine);
router.get("/my-accesses", authMiddleware, courseController.getMyAccesses);
router.get("/:id", courseController.getById);
router.get("/:id/access", authMiddleware, courseController.checkAccess);
router.get("/:id/subscribers", authMiddleware, courseController.getSubscribers);
router.get("/:id/challenges/progress", authMiddleware, courseController.getChallengeProgress);
router.get("/:id/progress", authMiddleware, courseController.getProgress);
router.get("/:id/modules/:moduleId/challenge-submission/me", authMiddleware, courseController.getMyChallengeSubmission);

// ---- Rutas protegidas (requieren autenticación) ----
// POST   /api/courses          → Crear un nuevo curso (con imagen opcional)
// PUT    /api/courses/:id      → Actualizar un curso
// DELETE /api/courses/:id      → Eliminar un curso
router.post("/", authMiddleware, upload.single("imagenPortada"), courseController.create);
router.post("/:id/access", authMiddleware, courseController.registerAccess);
router.post("/:id/modules/:moduleId/challenge-submission", authMiddleware, upload.single("evidencia"), courseController.submitChallenge);
router.put("/:id/progress", authMiddleware, courseController.saveProgress);
router.put("/:id", authMiddleware, upload.single("imagenPortada"), courseController.update);
router.patch("/:id/modules/:moduleId/challenge-submissions/:studentUid", authMiddleware, courseController.reviewChallengeSubmission);
router.patch("/:id/status", authMiddleware, courseController.updateStatus);
router.delete("/:id", authMiddleware, courseController.remove);

module.exports = router;
