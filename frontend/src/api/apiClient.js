/**
 * Configuración base de la API.
 * Centraliza la URL del backend y los headers comunes.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Función base para hacer fetch al backend.
 * Maneja JSON automáticamente, errores y autenticación.
 *
 * @param {string} endpoint - Ruta relativa (ej: "/courses")
 * @param {Object} options - Opciones del fetch
 * @returns {Promise<Object>} Respuesta parseada como JSON
 */
async function apiFetch(endpoint, options = {}) {
  const { body, headers: customHeaders, token, ...restOptions } = options;

  const headers = {
    ...customHeaders,
  };

  // Si el body NO es FormData, agregar Content-Type JSON
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Si hay token de autenticación, agregarlo
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...restOptions,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Parsear respuesta
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Error ${response.status}`);
    error.status = response.status;
    error.details = data?.details || null;
    throw error;
  }

  return data;
}

// ==================== MÉTODOS CONVENIENTES ====================

const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: "GET", ...options }),

  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { method: "POST", body, ...options }),

  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { method: "PUT", body, ...options }),

  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { method: "PATCH", body, ...options }),

  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: "DELETE", ...options }),
};

export default api;
export { API_BASE_URL, apiFetch };
