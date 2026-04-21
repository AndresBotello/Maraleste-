const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const messageController = require("../controllers/messageController");

router.get("/conversations", authMiddleware, messageController.getMyConversations);
router.get("/conversations/:conversationId/messages", authMiddleware, messageController.getConversationMessages);
router.post("/courses/:courseId/messages", authMiddleware, messageController.sendToCourseInstructor);
router.post("/conversations/:conversationId/messages", authMiddleware, messageController.sendInConversation);
router.delete("/conversations/:conversationId", authMiddleware, messageController.deleteConversation);

module.exports = router;
