/**
 * Seed de datos iniciales para cursos.
 * Ejecutar: node src/seeds/courseSeed.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { db } = require("../config/firebase");
const admin = require("firebase-admin");

const CURSOS_SEED = [
  {
    titulo: "Fundamentos del Diseño",
    instructor: "Laura Martínez",
    categoria: "diseño",
    nivel: "Principiante",
    idioma: "Español",
    descripcion: "Aprende los principios básicos del diseño gráfico y composición visual.",
    descripcionLarga:
      "Este curso completo te enseñará todo lo necesario sobre diseño gráfico. Exploraremos teoría del color, composición, tipografía y más.",
    duracion: "6 semanas",
    precio: 49.99,
    certificado: true,
    requisitos: "Ninguno",
    imagenPortada: null,
    modulos: 3,
    modulos_detalle: [
      {
        id: 1,
        numero: 1,
        titulo: "Introducción al Diseño",
        descripcion: "Conceptos básicos",
        duracion: "45 min",
        icono: "🎨",
        lecciones: [
          { id: 1, titulo: "Qué es el diseño", duracion: "15 min", tipo: "video" },
          { id: 2, titulo: "Historia del diseño", duracion: "20 min", tipo: "video" },
        ],
        quiz: {
          titulo: "Quiz Módulo 1",
          puntajeMinimo: 70,
          intentos: 3,
          preguntas: [
            {
              id: 1,
              texto: "¿Cuál es el principio básico del diseño?",
              tipo: "opcion_multiple",
              explicacion: "La composición es la base del diseño.",
              opciones: [
                { id: "a", texto: "Composición", correcta: true },
                { id: "b", texto: "Programación", correcta: false },
                { id: "c", texto: "Matemáticas", correcta: false },
              ],
            },
          ],
        },
      },
    ],
    estudiantes: 0,
    calificacion: 0,
    estado: "publicado",
    creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function seed() {
  console.log("🌱 Sembrando cursos...");

  for (const curso of CURSOS_SEED) {
    const ref = await db.collection("cursos").add(curso);
    console.log(`  ✅ Curso "${curso.titulo}" creado con ID: ${ref.id}`);
  }

  console.log("🌱 Seed completado.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
