const { admin } = require("../config/firebase");

/**
 * Middleware para verificar token de Firebase Auth.
 * Protege rutas que requieren autenticación.
 *
 * Uso: router.post("/ruta", authMiddleware, controller)
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticación no proporcionado" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

/**
 * Middleware para verificar que el usuario sea admin.
 * Debe usarse DESPUÉS de authMiddleware.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const { db } = require("../config/firebase");
    const userDoc = await db.collection("usuarios").doc(req.user.uid).get();

    if (!userDoc.exists || userDoc.data().rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
    }

    req.userProfile = userDoc.data();
    next();
  } catch (error) {
    console.error("Error al verificar rol:", error.message);
    return res.status(500).json({ error: "Error al verificar permisos" });
  }
};

module.exports = { authMiddleware, adminMiddleware };
