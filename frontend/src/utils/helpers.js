/**
 * Funciones de utilidad reutilizables del frontend.
 */

/**
 * Formatea un precio a formato USD.
 * @param {number|string} precio
 * @returns {string}
 */
export function formatPrice(precio) {
  const num = typeof precio === 'number' ? precio : parseFloat(precio || 0)
  return `$${num.toFixed(2)}`
}

/**
 * Formatea un número con separador de miles.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return (num || 0).toLocaleString()
}

/**
 * Trunca un texto a un máximo de caracteres.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
