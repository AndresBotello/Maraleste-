import { createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../api/apiClient";

function unwrapData(payload) {
  if (!payload || typeof payload !== "object") return payload;
  return payload.data !== undefined ? payload.data : payload;
}

/**
 * Registra un nuevo usuario:
 * 1. Crea la cuenta en Firebase Auth (email + password)
 * 2. Envía los datos de perfil al backend para guardarlos en Firestore
 *
 * @param {Object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} [data.rol] - "cliente" | "docente" | "admin"
 * @returns {Promise<Object>} { firebaseUser, profile }
 */
export async function registerUser({ firstName, lastName, email, password, rol = "cliente" }) {
  // 1. Crear usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // 2. Actualizar displayName en Firebase Auth
  await updateProfile(firebaseUser, {
    displayName: `${firstName} ${lastName}`,
  });

  // 3. Obtener token para autenticar la petición al backend
  const token = await firebaseUser.getIdToken();

  // 4. Registrar perfil en Firestore vía el backend
  const response = await api.post(
    "/auth/register",
    { firstName, lastName, rol },
    { token }
  );

  return {
    firebaseUser,
    profile: unwrapData(response.data),
  };
}

/**
 * Envía un correo de recuperación de contraseña con Firebase Auth.
 *
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function requestPasswordReset(email) {
  const actionCodeSettings = {
    url: `${window.location.origin}/reset-password`,
    handleCodeInApp: true,
  };

  await sendPasswordResetEmail(auth, email.trim().toLowerCase(), actionCodeSettings);
}

/**
 * Actualiza el perfil del usuario autenticado en el backend.
 * El rol es ineditable por diseño del sistema.
 *
 * @param {Object} data
 * @param {string} [data.firstName]
 * @param {string} [data.lastName]
 * @param {string} [data.email]
 * @returns {Promise<Object>} Perfil actualizado
 */
export async function updateUserProfile(data, fotoPerfilFile = null) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No hay un usuario autenticado");
  }

  const token = await currentUser.getIdToken();
  const hasFile = !!fotoPerfilFile;
  const payload = hasFile ? new FormData() : data;

  if (hasFile) {
    payload.append("firstName", data.firstName ?? "");
    payload.append("lastName", data.lastName ?? "");
    payload.append("email", data.email ?? "");
    payload.append("fotoPerfil", fotoPerfilFile);
  }

  const response = await api.put("/auth/profile", payload, { token });
  return unwrapData(response.data);
}

/**
 * Obtiene los usuarios registrados y sus cursos inscritos.
 * Solo para administradores.
 *
 * @returns {Promise<Object>}
 */
export async function getAdminUsersWithCourses() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No hay un usuario autenticado");
  }

  const token = await currentUser.getIdToken();
  const response = await api.get("/auth/admin/users", { token });
  return unwrapData(response.data);
}
