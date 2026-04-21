/**
 * Rutas de Autenticación.
 * Endpoints de auth (registro, perfil, etc.)
 */
const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");
const { register, getProfile, updateProfile, getAdminUsers } = require("../controllers/authController");

// POST /api/auth/register — registrar perfil de usuario en Firestore
router.post("/register", authMiddleware, register);

// GET /api/auth/profile — obtener perfil del usuario autenticado
router.get("/profile", authMiddleware, getProfile);

// GET /api/auth/admin/users — usuarios registrados y sus cursos
router.get("/admin/users", authMiddleware, adminMiddleware, getAdminUsers);

// PUT /api/auth/profile — actualizar perfil (sin editar rol)
router.put("/profile", authMiddleware, upload.single("fotoPerfil"), updateProfile);

module.exports = router;
