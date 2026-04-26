const { asyncHandler } = require("../middlewares/errorHandler");
const messageService = require("../services/messageService");
const courseService = require("../services/courseService"); 

const sendToCourseInstructor = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { text } = req.body || {};
  const payload = await messageService.sendMessageToCourseInstructor(courseId, req.user.uid, text);
  res.status(201).json({ message: "Mensaje enviado al instructor", data: payload });
});

const sendInConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body || {};
  const payload = await messageService.sendMessageInConversation(conversationId, req.user.uid, text);
  res.status(201).json({ message: "Mensaje enviado", data: payload });
});

const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getUserConversations(req.user.uid);
  res.json({ message: "Conversaciones obtenidas", count: conversations.length, data: conversations });
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const payload = await messageService.getConversationMessages(conversationId, req.user.uid);
  res.json({ message: "Mensajes obtenidos", data: payload });
});

const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const payload = await messageService.deleteConversation(conversationId, req.user.uid);
  res.json({ message: "Conversación eliminada", data: payload });
});

const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getCoursesByCreator(req.user.uid);
  res.json({ message: "Cursos del instructor obtenidos", count: courses.length, data: courses });
});

const getCourseStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const students = await messageService.getCourseStudents(courseId, req.user.uid);
  res.json({ message: "Estudiantes obtenidos", count: students.length, data: students });
});

const startInstructorConversation = asyncHandler(async (req, res) => {
  const { courseId, studentUid, text } = req.body;
  const result = await messageService.startConversationFromInstructor(courseId, req.user.uid, studentUid, text);
  res.json(result);
});

// Un solo module.exports al final con todo
module.exports = {
  sendToCourseInstructor,
  sendInConversation,
  getMyConversations,
  getConversationMessages,
  deleteConversation,
  getInstructorCourses,
  getCourseStudents,
  startInstructorConversation,
};