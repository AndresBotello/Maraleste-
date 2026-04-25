const { db, admin } = require("../config/firebase");
const { createUserNotification } = require("./notificationService");

const COURSE_COLLECTION = "cursos";
const USER_COLLECTION = "usuarios";
const USER_COURSE_ACCESS_SUBCOLLECTION = "cursosAdquiridos";
const CONVERSATION_COLLECTION = "conversaciones";
const MESSAGE_SUBCOLLECTION = "mensajes";
const USER_NOTIFICATION_SUBCOLLECTION = "notificaciones";

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeText(text) {
  return String(text || "").trim();
}

async function getUserBasicProfile(uid) {
  const doc = await db.collection(USER_COLLECTION).doc(uid).get();
  if (!doc.exists) return { uid, firstName: "", lastName: "", email: "" };
  const data = doc.data();
  return {
    uid,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || "",
  };
}

function buildConversationId(courseId, studentUid) {
  return `${courseId}_${studentUid}`;
}

function displayName(profile) {
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  return fullName || profile.email || "Usuario";
}

async function ensureCourseExists(courseId) {
  const courseDoc = await db.collection(COURSE_COLLECTION).doc(courseId).get();
  if (!courseDoc.exists) {
    throw buildError("Curso no encontrado", 404);
  }
  return { id: courseDoc.id, ...courseDoc.data() };
}

async function ensureStudentEnrollment(courseId, studentUid) {
  const enrollmentDoc = await db
    .collection(USER_COLLECTION)
    .doc(studentUid)
    .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
    .doc(courseId)
    .get();

  if (!enrollmentDoc.exists) {
    throw buildError("Debes estar inscrito en el curso para contactar al instructor", 403);
  }
}

async function ensureConversationParticipant(conversationData, uid) {
  const isParticipant = conversationData.studentUid === uid || conversationData.instructorUid === uid;
  if (!isParticipant) {
    throw buildError("No tienes permisos para acceder a esta conversación", 403);
  }
}

async function sendMessageToCourseInstructor(courseId, studentUid, text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) {
    throw buildError("El mensaje no puede estar vacío", 400);
  }

  const course = await ensureCourseExists(courseId);
  await ensureStudentEnrollment(courseId, studentUid);

  const instructorUid = course.creadoPor;
  const conversationId = buildConversationId(courseId, studentUid);
  const conversationRef = db.collection(CONVERSATION_COLLECTION).doc(conversationId);

  const [studentProfile, instructorProfile, conversationDoc] = await Promise.all([
    getUserBasicProfile(studentUid),
    getUserBasicProfile(instructorUid),
    conversationRef.get(),
  ]);

  const messageRef = conversationRef.collection(MESSAGE_SUBCOLLECTION).doc();

  const conversationPayload = {
    conversationId,
    courseId,
    courseTitle: course.titulo || "Curso",
    studentUid,
    instructorUid,
    studentName: displayName(studentProfile),
    instructorName: displayName(instructorProfile),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: normalizedText,
    lastMessageSenderUid: studentUid,
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!conversationDoc.exists) {
    conversationPayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
  }

  const messagePayload = {
    conversationId,
    courseId,
    senderUid: studentUid,
    senderName: displayName(studentProfile),
    text: normalizedText,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(conversationRef, conversationPayload, { merge: true });
  batch.set(messageRef, messagePayload);
  await batch.commit();

  // Notificar al instructor cuando llega un nuevo mensaje del estudiante.
  try {
    await createUserNotification(instructorUid, {
      type: "nuevo_mensaje",
      title: "Nuevo mensaje de estudiante",
      message: `${displayName(studentProfile)} te escribió sobre ${course.titulo || "tu curso"}.`,
      courseId,
      conversationId,
    });
  } catch (error) {
    console.error("No se pudo crear notificación de mensaje:", error.message);
  }

  return {
    conversationId,
    courseId,
    messageId: messageRef.id,
  };
}

async function sendMessageInConversation(conversationId, senderUid, text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) {
    throw buildError("El mensaje no puede estar vacío", 400);
  }

  const conversationRef = db.collection(CONVERSATION_COLLECTION).doc(conversationId);
  const conversationDoc = await conversationRef.get();

  if (!conversationDoc.exists) {
    throw buildError("Conversación no encontrada", 404);
  }

  const conversationData = conversationDoc.data();
  await ensureConversationParticipant(conversationData, senderUid);

  const senderProfile = await getUserBasicProfile(senderUid);
  const messageRef = conversationRef.collection(MESSAGE_SUBCOLLECTION).doc();

  const messagePayload = {
    conversationId,
    courseId: conversationData.courseId,
    senderUid,
    senderName: displayName(senderProfile),
    text: normalizedText,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(messageRef, messagePayload);
  batch.set(conversationRef, {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: normalizedText,
    lastMessageSenderUid: senderUid,
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await batch.commit();

  const recipientUid = senderUid === conversationData.studentUid
    ? conversationData.instructorUid
    : conversationData.studentUid;

  try {
    await createUserNotification(recipientUid, {
      type: "nuevo_mensaje",
      title: "Tienes un nuevo mensaje",
      message: `${displayName(senderProfile)} respondió en ${conversationData.courseTitle || "una conversación"}.`,
      courseId: conversationData.courseId,
      conversationId,
    });
  } catch (error) {
    console.error("No se pudo crear notificación de respuesta:", error.message);
  }

  return {
    conversationId,
    messageId: messageRef.id,
  };
}

async function getUserConversations(uid) {
  const [studentSnap, instructorSnap] = await Promise.all([
    db.collection(CONVERSATION_COLLECTION).where("studentUid", "==", uid).get(),
    db.collection(CONVERSATION_COLLECTION).where("instructorUid", "==", uid).get(),
  ]);

  const map = new Map();
  [...studentSnap.docs, ...instructorSnap.docs].forEach((doc) => {
    map.set(doc.id, { id: doc.id, ...doc.data() });
  });

  return [...map.values()].sort((a, b) => {
    const timeA = a.lastMessageAt?._seconds || a.lastMessageAt?.seconds || 0;
    const timeB = b.lastMessageAt?._seconds || b.lastMessageAt?.seconds || 0;
    return timeB - timeA;
  });
}

async function getConversationMessages(conversationId, uid) {
  const conversationRef = db.collection(CONVERSATION_COLLECTION).doc(conversationId);
  const conversationDoc = await conversationRef.get();

  if (!conversationDoc.exists) {
    throw buildError("Conversación no encontrada", 404);
  }

  const conversationData = conversationDoc.data();
  await ensureConversationParticipant(conversationData, uid);

  const messagesSnap = await conversationRef
    .collection(MESSAGE_SUBCOLLECTION)
    .orderBy("createdAt", "asc")
    .get();

  return {
    conversation: { id: conversationDoc.id, ...conversationData },
    messages: messagesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}

async function startConversationFromInstructor(courseId, instructorUid, studentUid, text) {
  const normalizedText = normalizeText(text)
  if (!normalizedText) throw buildError('El mensaje no puede estar vacío', 400)

  const course = await ensureCourseExists(courseId)

  // Verificar que quien llama es efectivamente el instructor del curso
  if (course.creadoPor !== instructorUid) {
    throw buildError('No eres el instructor de este curso', 403)
  }

  // Verificar que el estudiante esté inscrito
  await ensureStudentEnrollment(courseId, studentUid)

  const conversationId = buildConversationId(courseId, studentUid)
  const conversationRef = db.collection(CONVERSATION_COLLECTION).doc(conversationId)

  const [studentProfile, instructorProfile, conversationDoc] = await Promise.all([
    getUserBasicProfile(studentUid),
    getUserBasicProfile(instructorUid),
    conversationRef.get(),
  ])

  const messageRef = conversationRef.collection(MESSAGE_SUBCOLLECTION).doc()

  const conversationPayload = {
    conversationId,
    courseId,
    courseTitle: course.titulo || 'Curso',
    studentUid,
    instructorUid,
    studentName: displayName(studentProfile),
    instructorName: displayName(instructorProfile),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: normalizedText,
    lastMessageSenderUid: instructorUid,
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  if (!conversationDoc.exists) {
    conversationPayload.createdAt = admin.firestore.FieldValue.serverTimestamp()
  }

  const messagePayload = {
    conversationId,
    courseId,
    senderUid: instructorUid,
    senderName: displayName(instructorProfile),
    text: normalizedText,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  const batch = db.batch()
  batch.set(conversationRef, conversationPayload, { merge: true })
  batch.set(messageRef, messagePayload)
  await batch.commit()

  // Notificar al estudiante
  try {
    await createUserNotification(studentUid, {
      type: 'nuevo_mensaje',
      title: 'Mensaje de tu instructor',
      message: `${displayName(instructorProfile)} te escribió sobre ${course.titulo || 'tu curso'}.`,
      courseId,
      conversationId,
    })
  } catch (err) {
    console.error('No se pudo crear notificación:', err.message)
  }

  return { conversationId, courseId, messageId: messageRef.id }
}

async function deleteConversation(conversationId, uid) {
  const conversationRef = db.collection(CONVERSATION_COLLECTION).doc(conversationId);
  const conversationDoc = await conversationRef.get();

  if (!conversationDoc.exists) {
    throw buildError("Conversación no encontrada", 404);
  }

  const conversationData = conversationDoc.data();
  await ensureConversationParticipant(conversationData, uid);

  const [messagesSnap, studentNotificationsSnap, instructorNotificationsSnap] = await Promise.all([
    conversationRef.collection(MESSAGE_SUBCOLLECTION).get(),
    db
      .collection(USER_COLLECTION)
      .doc(conversationData.studentUid)
      .collection(USER_NOTIFICATION_SUBCOLLECTION)
      .where("conversationId", "==", conversationId)
      .get(),
    db
      .collection(USER_COLLECTION)
      .doc(conversationData.instructorUid)
      .collection(USER_NOTIFICATION_SUBCOLLECTION)
      .where("conversationId", "==", conversationId)
      .get(),
  ]);

  const docsToDelete = [
    ...messagesSnap.docs,
    ...studentNotificationsSnap.docs,
    ...instructorNotificationsSnap.docs,
  ];

  const chunkSize = 400;
  for (let i = 0; i < docsToDelete.length; i += chunkSize) {
    const batch = db.batch();
    const chunk = docsToDelete.slice(i, i + chunkSize);

    chunk.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  await conversationRef.delete();

  return {
    conversationId,
    deletedMessages: messagesSnap.size,
    deletedNotifications: studentNotificationsSnap.size + instructorNotificationsSnap.size,
  };
}

async function getInstructorCourses(instructorUid) {
  const snap = await db
    .collection(COURSE_COLLECTION)
    .where('creadoPor', '==', instructorUid)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getCourseStudents(courseId, instructorUid) {
  // Verificar que el instructor es dueño del curso
  const course = await ensureCourseExists(courseId);
  if (course.creadoPor !== instructorUid) {
    throw buildError('No tienes acceso a este curso', 403);
  }

  // Buscar todos los usuarios que tienen este courseId en su subcolección cursosAdquiridos
  const usersSnap = await db.collection(USER_COLLECTION).get();

  const results = await Promise.all(
    usersSnap.docs.map(async (userDoc) => {
      const enrollmentDoc = await db
        .collection(USER_COLLECTION)
        .doc(userDoc.id)
        .collection(USER_COURSE_ACCESS_SUBCOLLECTION)
        .doc(courseId)
        .get();

      if (!enrollmentDoc.exists) return null;

      const data = userDoc.data();
      return {
        uid: userDoc.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
      };
    })
  );

  return results.filter(Boolean);
}

module.exports = {
  sendMessageToCourseInstructor,
  sendMessageInConversation,
  getUserConversations,
  getConversationMessages,
  deleteConversation,
  startConversationFromInstructor,
  getCourseStudents,
  getInstructorCourses,

};
