const { asyncHandler } = require("../middlewares/errorHandler");
const notificationService = require("../services/notificationService");

const getMine = asyncHandler(async (req, res) => {
  const payload = await notificationService.getUserNotifications(req.user.uid, {
    limit: req.query.limit,
  });

  res.json({
    message: "Notificaciones obtenidas",
    data: payload,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const updated = await notificationService.markNotificationAsRead(req.user.uid, notificationId);

  res.json({
    message: "Notificación actualizada",
    data: updated,
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsAsRead(req.user.uid);

  res.json({
    message: "Notificaciones marcadas como leídas",
    data: result,
  });
});

module.exports = {
  getMine,
  markRead,
  markAllRead,
};
