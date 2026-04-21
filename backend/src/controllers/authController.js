const { registerUserProfile, getUserProfile, updateUserProfile, getUsersWithEnrolledCourses } = require("../services/AuthServices");

/**
 * POST /api/auth/register
 * Registra el perfil del usuario en Firestore.
 * Requiere que el usuario ya esté autenticado (token Firebase válido).
 */
async function register(req, res, next) {
  try {
    const { uid, email } = req.user; // Viene del authMiddleware
    const { firstName, lastName, rol } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "Nombre y apellido son obligatorios",
      });
    }

    const userProfile = await registerUserProfile(uid, {
      firstName,
      lastName,
      email,
      rol,
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      data: userProfile,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * GET /api/auth/profile
 * Obtiene el perfil completo del usuario autenticado.
 */
async function getProfile(req, res, next) {
  try {
    const { uid } = req.user;
    const profile = await getUserProfile(uid);

    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.json({
      message: "Perfil del usuario",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 * Actualiza el perfil del usuario autenticado.
 * Campos editables: firstName, lastName, email.
 * El rol no se permite modificar desde este endpoint.
 */
async function updateProfile(req, res, next) {
  try {
    const { uid } = req.user;
    const { firstName, lastName, email, rol } = req.body;

    if (rol !== undefined) {
      return res.status(400).json({ error: "El rol no se puede modificar" });
    }

    const hasEditableFields = [firstName, lastName, email].some((value) => value !== undefined) || !!req.file;
    if (!hasEditableFields) {
      return res.status(400).json({
        error: "Debes enviar al menos un campo para actualizar: firstName, lastName, email o fotoPerfil",
      });
    }

    const updatedProfile = await updateUserProfile(uid, { firstName, lastName, email }, req.file || null);

    res.json({
      message: "Perfil actualizado exitosamente",
      data: updatedProfile,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * GET /api/auth/admin/users
 * Lista usuarios y sus cursos inscritos. Solo admin.
 */
async function getAdminUsers(req, res, next) {
  try {
    const users = await getUsersWithEnrolledCourses();

    res.json({
      message: "Usuarios obtenidos",
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  getProfile,
  updateProfile,
  getAdminUsers,
};
