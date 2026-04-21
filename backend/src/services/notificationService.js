const { db, admin } = require("../config/firebase");

const USER_COLLECTION = "usuarios";
const USER_NOTIFICATION_SUBCOLLECTION = "notificaciones";

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function notifyNewCoursePublished({ courseId, title, instructor }, creatorUid) {
  const usersSnap = await db.collection(USER_COLLECTION).get();
  const users = usersSnap.docs.filter((doc) => doc.id !== creatorUid && doc.data()?.activo !== false);

  if (!users.length) return 0;

  const chunkSize = 400;
  let notified = 0;

  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    const batch = db.batch();

    chunk.forEach((userDoc) => {
      const ref = db
        .collection(USER_COLLECTION)
        .doc(userDoc.id)
        .collection(USER_NOTIFICATION_SUBCOLLECTION)
        .doc();

      batch.set(ref, {
        type: "nuevo_curso",
        title: "Nuevo curso disponible",
        message: `Se publicó ${title} por ${instructor || "el instructor"}.`,
        courseId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      notified += 1;
    });

    await batch.commit();
  }

  return notified;
}

async function createUserNotification(uid, payload = {}) {
  const userDoc = await db.collection(USER_COLLECTION).doc(uid).get();
  if (!userDoc.exists || userDoc.data()?.activo === false) {
    return null;
  }

  const ref = db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_NOTIFICATION_SUBCOLLECTION)
    .doc();

  const data = {
    type: payload.type || "general",
    title: payload.title || "Nueva notificación",
    message: payload.message || "Tienes una nueva notificación.",
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (payload.courseId) data.courseId = payload.courseId;
  if (payload.conversationId) data.conversationId = payload.conversationId;

  await ref.set(data);
  return ref.id;
}

async function getUserNotifications(uid, options = {}) {
  const limit = Math.max(1, Math.min(Number(options.limit) || 30, 100));

  const notificationsSnap = await db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_NOTIFICATION_SUBCOLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const unreadSnap = await db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_NOTIFICATION_SUBCOLLECTION)
    .where("read", "==", false)
    .get();

  return {
    unreadCount: unreadSnap.size,
    notifications: notificationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}

async function markNotificationAsRead(uid, notificationId) {
  const ref = db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_NOTIFICATION_SUBCOLLECTION)
    .doc(notificationId);

  const doc = await ref.get();
  if (!doc.exists) {
    throw buildError("Notificación no encontrada", 404);
  }

  await ref.update({
    read: true,
    readAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: notificationId, ...doc.data(), read: true };
}

async function markAllNotificationsAsRead(uid) {
  const unreadSnap = await db
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(USER_NOTIFICATION_SUBCOLLECTION)
    .where("read", "==", false)
    .get();

  if (unreadSnap.empty) return { updated: 0 };

  const chunkSize = 400;
  const docs = unreadSnap.docs;

  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + chunkSize);

    chunk.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  }

  return { updated: docs.length };
}

module.exports = {
  notifyNewCoursePublished,
  createUserNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
