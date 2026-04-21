/**
 * Middleware global de manejo de errores.
 * Captura errores lanzados en controllers/services y devuelve JSON consistente.
 */
const errorHandler = (err, req, res, _next) => {
  console.error("❌ Error:", err.message);

  // Errores de validación personalizados
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Error de validación",
      details: err.message,
    });
  }

  // Errores de Firebase
  if (err.code && err.code.startsWith("auth/")) {
    return res.status(401).json({
      error: "Error de autenticación",
      details: err.message,
    });
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Wrapper para funciones async en controllers.
 * Evita tener try/catch repetitivo — captura errores y los pasa a errorHandler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
