const express = require("express");
const cors = require("cors");
const path = require("path");

// Importar rutas
const courseRoutes = require("./routes/courseRoutes");
const workshopRoutes = require("./routes/workshopRoutes");
const authRoutes = require("./routes/authRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Importar middlewares
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// ==================== MIDDLEWARES GLOBALES ====================

// CORS - permitir múltiples orígenes
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(',').map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS no permitido'));
      }
    },
    credentials: true,
  })
);

// Parsear JSON y formularios
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== RUTAS ====================

// Raíz - para UptimeRobot y verificación de disponibilidad
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});


console.log('🔍 Cargando rutas...')
console.log('messageRoutes:', require('./routes/messageRoutes'))
// Rutas de la API
app.use("/api/courses", courseRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de errores global
app.use(errorHandler);

module.exports = app;
