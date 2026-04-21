const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/mine", authMiddleware, notificationController.getMine);
router.patch("/read-all", authMiddleware, notificationController.markAllRead);
router.patch("/:notificationId/read", authMiddleware, notificationController.markRead);

module.exports = router;
