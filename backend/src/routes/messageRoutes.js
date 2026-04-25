const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const messageController = require("../controllers/messageController");

router.get("/conversations", authMiddleware, messageController.getMyConversations);
router.get("/conversations/:conversationId/messages", authMiddleware, messageController.getConversationMessages);
router.post("/courses/:courseId/messages", authMiddleware, messageController.sendToCourseInstructor);
router.post("/conversations/:conversationId/messages", authMiddleware, messageController.sendInConversation);
router.delete("/conversations/:conversationId", authMiddleware, messageController.deleteConversation);
router.post('/instructor/start', authMiddleware, messageController.startInstructorConversation);
router.get('/courses/:courseId/students', authMiddleware, messageController.getCourseStudents);
router.get('/instructor/courses', authMiddleware, messageController.getInstructorCourses);

router.stack.forEach((r) => {
  if (r.route) {
    console.log('📨 Ruta registrada:', Object.keys(r.route.methods)[0].toUpperCase(), r.route.path)
  }
})

module.exports = router;
