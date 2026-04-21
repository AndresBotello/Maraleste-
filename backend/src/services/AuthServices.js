const { auth, db } = require("../config/firebase");
const { uploadImage, deleteResource } = require("./uploadService");
const USER_COLLECTION = "usuarios";
const COURSE_COLLECTION = "cursos";
const WORKSHOP_COLLECTION = "talleres";
const USER_COURSE_ACCESS_SUBCOLLECTION = "cursosAdquiridos";
const USER_WORKSHOP_ACCESS_SUBCOLLECTION = "talleresInscritos";

/**
 * Roles válidos del sistema.
 */
const VALID_ROLES = ["cliente", "docente", "admin"];

/**
 * Registra el perfil de un usuario en Firestore después de que
 * Firebase Auth ya lo creó en el frontend.
 *
 * @param {string} uid - UID del usuario (de Firebase Auth)
 * @param {Object} data - Datos del perfil
 * @param {string} data.firstName - Nombre
 * @param {string} data.lastName - Apellido
 * @param {string} data.email - Correo electrónico
 * @param {string} [data.rol] - Rol del usuario (cliente | docente | admin)
 * @returns {Promise<Object>} Perfil guardado
 */
async function registerUserProfile(uid, data) {
  const { firstName, lastName, email, rol = "cliente" } = data;

  // Validar rol
  if (!VALID_ROLES.includes(rol)) {
    const error = new Error(`Rol inválido: "${rol}". Roles válidos: ${VALID_ROLES.join(", ")}`);
    error.status = 400;
    throw error;
  }

  // Verificar que no exista ya un perfil para este uid
  const existingDoc = await db.collection(USER_COLLECTION).doc(uid).get();
  if (existingDoc.exists) {
    const error = new Error("El perfil de usuario ya existe");
    error.status = 409;
    throw error;
  }

  const userProfile = {
    uid,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    rol,
    activo: true,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };

  // Guardar en Firestore
  await db.collection(USER_COLLECTION).doc(uid).set(userProfile);

  // Asignar custom claims en Firebase Auth (para autorización en el frontend)
  await auth.setCustomUserClaims(uid, { rol });

  return userProfile;
}

/**
 * Obtiene el perfil de un usuario desde Firestore.
 *
 * @param {string} uid - UID del usuario
 * @returns {Promise<Object|null>} Perfil del usuario o null
 */
async function getUserProfile(uid) {
  const doc = await db.collection(USER_COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return doc.data();
}

/**
 * Actualiza el perfil del usuario en Firestore.
 * Campos permitidos: firstName, lastName, email.
 * El campo rol se conserva siempre con el valor actual.
 *
 * @param {string} uid - UID del usuario
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
async function updateUserProfile(uid, data, fotoPerfilFile = null) {
  const { firstName, lastName, email } = data;

  const docRef = db.collection(USER_COLLECTION).doc(uid);
  const existingDoc = await docRef.get();

  if (!existingDoc.exists) {
    const error = new Error("Perfil no encontrado");
    error.status = 404;
    throw error;
  }

  const currentProfile = existingDoc.data();
  const updates = {
    actualizadoEn: new Date().toISOString(),
  };

  if (firstName !== undefined) {
    const normalizedFirstName = String(firstName).trim();
    if (!normalizedFirstName) {
      const error = new Error("El nombre no puede estar vacío");
      error.status = 400;
      throw error;
    }
    updates.firstName = normalizedFirstName;
  }

  if (lastName !== undefined) {
    const normalizedLastName = String(lastName).trim();
    if (!normalizedLastName) {
      const error = new Error("El apellido no puede estar vacío");
      error.status = 400;
      throw error;
    }
    updates.lastName = normalizedLastName;
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      const error = new Error("El email no puede estar vacío");
      error.status = 400;
      throw error;
    }
    updates.email = normalizedEmail;
  }

  if (fotoPerfilFile) {
    const uploadedImage = await uploadImage(fotoPerfilFile, "perfiles");
    updates.fotoPerfil = uploadedImage.url;
    updates.fotoPerfilPublicId = uploadedImage.publicId;

    if (currentProfile.fotoPerfilPublicId && currentProfile.fotoPerfilPublicId !== uploadedImage.publicId) {
      try {
        await deleteResource(currentProfile.fotoPerfilPublicId, "image");
      } catch (error) {
        // Evita bloquear la actualización del perfil si falla la limpieza en Cloudinary.
        console.error("No se pudo eliminar la foto anterior de perfil:", error.message);
      }
    }
  }

  await docRef.update(updates);

  return {
    ...currentProfile,
    ...updates,
    rol: currentProfile.rol,
  };
}

module.exports = {
  registerUserProfile,
  getUserProfile,
  updateUserProfile,
  VALID_ROLES,
  async getUsersWithEnrolledCourses() {
    const usersSnap = await db.collection(USER_COLLECTION).get();
    const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const [courseAccessSnapshots, workshopAccessSnapshots] = await Promise.all([
      Promise.all(
        users.map((user) =>
          db
            .collection(USER_COLLECTION)
            .doc(user.id)
            .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
            .orderBy("registradoEn", "desc")
            .get()
        )
      ),
      Promise.all(
        users.map((user) =>
          db
            .collection(USER_COLLECTION)
            .doc(user.id)
            .collection(USER_WORKSHOP_ACCESS_SUBCOLLECTION)
            .orderBy("registradoEn", "desc")
            .get()
        )
      ),
    ]);

    const uniqueCourseIds = new Set();
    courseAccessSnapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.courseId) uniqueCourseIds.add(data.courseId);
      });
    });

    const uniqueWorkshopIds = new Set();
    workshopAccessSnapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.workshopId) uniqueWorkshopIds.add(data.workshopId);
      });
    });

    const [courseDocs, workshopDocs] = await Promise.all([
      Promise.all(
        [...uniqueCourseIds].map(async (courseId) => {
          const courseDoc = await db.collection(COURSE_COLLECTION).doc(courseId).get();
          return courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null;
        })
      ),
      Promise.all(
        [...uniqueWorkshopIds].map(async (workshopId) => {
          const workshopDoc = await db.collection(WORKSHOP_COLLECTION).doc(workshopId).get();
          return workshopDoc.exists ? { id: workshopDoc.id, ...workshopDoc.data() } : null;
        })
      ),
    ]);

    const courseMap = new Map(courseDocs.filter(Boolean).map((course) => [course.id, course]));
    const workshopMap = new Map(workshopDocs.filter(Boolean).map((workshop) => [workshop.id, workshop]));

    return users
      .map((user, index) => {
        const courseAccesses = courseAccessSnapshots[index].docs.map((doc) => {
          const access = doc.data();
          const course = courseMap.get(access.courseId) || null;

          return {
            courseId: access.courseId,
            courseTitle: course?.titulo || "Curso eliminado o no disponible",
            courseStatus: course?.estado || "desconocido",
            courseType: course?.tipoAcceso || access.tipoAcceso || "gratis",
            coursePrice: course?.precio ?? access.precio ?? 0,
            currency: course?.moneda || access.moneda || "COP",
            registeredAt: access.registradoEn || null,
          };
        });

        const workshopAccesses = workshopAccessSnapshots[index].docs.map((doc) => {
          const access = doc.data();
          const workshop = workshopMap.get(access.workshopId) || null;

          return {
            workshopId: access.workshopId,
            workshopTitle: workshop?.titulo || "Taller eliminado o no disponible",
            workshopStatus: workshop?.estado || "desconocido",
            workshopType: workshop?.tipoAcceso || access.tipoAcceso || "gratis",
            workshopPrice: workshop?.precio ?? access.precio ?? 0,
            currency: workshop?.moneda || access.moneda || "COP",
            registeredAt: access.registradoEn || null,
          };
        });

        return {
          uid: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          rol: user.rol || "cliente",
          activo: user.activo !== false,
          creadoEn: user.creadoEn || null,
          actualizadoEn: user.actualizadoEn || null,
          cursos: courseAccesses,
          totalCursos: courseAccesses.length,
          talleres: workshopAccesses,
          totalTalleres: workshopAccesses.length,
          totalInscripciones: courseAccesses.length + workshopAccesses.length,
        };
      })
      .sort((a, b) => {
        const dateA = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
        const dateB = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
        return dateB - dateA;
      });
  },
};
