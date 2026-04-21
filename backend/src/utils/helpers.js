/**
 * Funciones de utilidad reutilizables.
 */

/**
 * Genera un slug a partir de un texto.
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/**
 * Formatea una fecha Firestore Timestamp a string legible.
 * @param {Object} timestamp - Firestore Timestamp
 * @returns {string}
 */
function formatTimestamp(timestamp) {
  if (!timestamp || !timestamp.toDate) return null;
  return timestamp.toDate().toISOString();
}

module.exports = { slugify, formatTimestamp };
