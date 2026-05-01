import { useEffect, useState } from 'react'
import AdminLayout from '../../components/Layouts/AdminLayout'
import {
  deleteConversation,
  getConversationMessages,
  getMyConversations,
  sendMessageInConversation,
  getInstructorCourses,
  getCourseEnrolledStudents,
  startConversationAsInstructor,
} from '../../services/messageService'
import adminSharedStyles from './AdminSharedStyles'
import globalStyles from './DashboardStyles'

function InstructorMessages() {
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Estado del modal nueva conversación
  const [showNewModal, setShowNewModal] = useState(false)
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudentUid, setSelectedStudentUid] = useState('')
  const [newMessageText, setNewMessageText] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [startingConversation, setStartingConversation] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true)
        setError('')
        const data = await getMyConversations()
        const list = data || []
        setConversations(list)
        if (list.length > 0) {
          setSelectedConversationId((prev) => prev || list[0].id)
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los mensajes.')
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) { setMessages([]); return }
      try {
        setError('')
        const payload = await getConversationMessages(selectedConversationId)
        setMessages(payload?.messages || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar la conversación.')
      }
    }
    loadMessages()
  }, [selectedConversationId])

  // Cuando se abre el modal, carga los cursos del instructor
  useEffect(() => {
    if (!showNewModal) return
    async function loadCourses() {
      try {
        setModalError('')
        const data = await getInstructorCourses()
        setCourses(data || [])
      } catch (err) {
        setModalError(err.message || 'No se pudieron cargar los cursos.')
      }
    }
    loadCourses()
  }, [showNewModal])

  // Cuando se selecciona un curso en el modal, carga sus estudiantes
  useEffect(() => {
    if (!selectedCourseId) { setStudents([]); setSelectedStudentUid(''); return }
    async function loadStudents() {
      try {
        setLoadingStudents(true)
        setModalError('')
        setSelectedStudentUid('')
        const data = await getCourseEnrolledStudents(selectedCourseId)
        setStudents(data || [])
        if (!data || data.length === 0) setModalError('Este curso no tiene estudiantes inscritos.')
      } catch (err) {
        setModalError(err.message || 'No se pudieron cargar los estudiantes.')
      } finally {
        setLoadingStudents(false)
      }
    }
    loadStudents()
  }, [selectedCourseId])

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null

  const refreshConversations = async (keepId = selectedConversationId) => {
    const list = await getMyConversations()
    setConversations(list || [])
    if (keepId) setSelectedConversationId(keepId)
  }

  const handleSendReply = async () => {
    if (!selectedConversationId || !replyMessage.trim()) return
    try {
      setSending(true)
      await sendMessageInConversation(selectedConversationId, replyMessage.trim())
      setReplyMessage('')
      const payload = await getConversationMessages(selectedConversationId)
      setMessages(payload?.messages || [])
      await refreshConversations(selectedConversationId)
    } catch (err) {
      setError(err.message || 'No se pudo enviar la respuesta.')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteConversation = async () => {
    if (!selectedConversationId || deleting) return
    const confirmed = window.confirm('Esta acción eliminará toda la conversación y sus mensajes relacionados. ¿Deseas continuar?')
    if (!confirmed) return
    try {
      setDeleting(true)
      setError('')
      await deleteConversation(selectedConversationId)
      const list = await getMyConversations()
      const nextConversations = list || []
      setConversations(nextConversations)
      setSelectedConversationId(nextConversations[0]?.id || '')
      setMessages([])
      setReplyMessage('')
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la conversación.')
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenModal = () => {
    setShowNewModal(true)
    setSelectedCourseId('')
    setSelectedStudentUid('')
    setNewMessageText('')
    setModalError('')
    setStudents([])
    setCourses([])
  }

  const handleCloseModal = () => {
    setShowNewModal(false)
  }

  const handleStartConversation = async () => {
    if (!selectedCourseId || !selectedStudentUid || !newMessageText.trim()) return
    try {
      setStartingConversation(true)
      setModalError('')
      const result = await startConversationAsInstructor(
        selectedCourseId,
        selectedStudentUid,
        newMessageText.trim()
      )
      handleCloseModal()
      const list = await getMyConversations()
      setConversations(list || [])
      setSelectedConversationId(result.conversationId)
    } catch (err) {
      setModalError(err.message || 'No se pudo iniciar la conversación.')
    } finally {
      setStartingConversation(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return ''
    try {
      const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value)
      return date.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  return (
    <>
      <style>{adminSharedStyles + globalStyles}</style>
      <AdminLayout activeSection="mensajes">
        <div className="ad-root db-root">
          {/* ── Header ── */}
          <header className="db-header">
            <div className="db-header-text">
              <p className="db-eyebrow">Comunicación</p>
              <h1 className="db-title">Mensajes de estudiantes</h1>
              <p className="db-subtitle">Revisa y responde los mensajes que te envían los usuarios de tus cursos.</p>
            </div>
            {/* BOTÓN NUEVA CONVERSACIÓN */}
            <button
              type="button"
              onClick={handleOpenModal}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'var(--text-primary)',
                color: '#fff',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              + Nueva conversación
            </button>
          </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[360px_1fr]">
          {/* SIDEBAR CONVERSACIONES */}
          <aside className="rounded-3xl border border-black/5 bg-white p-3 md:p-5 shadow-lg shadow-black/5 h-fit md:h-auto min-w-0 overflow-hidden">
            <h2 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 mb-3 md:mb-4">
              Conversaciones
            </h2>
            {loading ? (
              <p className="text-xs md:text-sm text-gray-500">Cargando conversaciones...</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs md:text-sm text-gray-500">
                Todavía no tienes mensajes. Inicia una nueva conversación con un estudiante.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] md:max-h-[65vh] overflow-auto pr-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full text-left p-2 md:p-3 rounded-xl border transition text-[11px] md:text-sm ${
                      selectedConversationId === conversation.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-black/10 hover:bg-black/5'
                    }`}
                  >
                    <p className="font-medium line-clamp-2 break-words">{conversation.courseTitle}</p>
                    <p className={`text-[9px] md:text-xs mt-1 truncate ${selectedConversationId === conversation.id ? 'text-white/70' : 'text-gray-500'}`}>
                      Estudiante: {conversation.studentName}
                    </p>
                    <p className={`text-[8px] md:text-[10px] mt-1 truncate ${selectedConversationId === conversation.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {conversation.lastMessage || 'Sin mensajes'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* PANEL DE MENSAJES */}
          <article className="rounded-3xl border border-black/5 bg-white p-4 md:p-6 shadow-lg shadow-black/5">
            {!selectedConversation ? (
              <div className="h-full min-h-[300px] md:min-h-[320px] flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-xs md:text-sm text-gray-500">
                  Selecciona una conversación o inicia una nueva.
                </p>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs uppercase tracking-wider hover:bg-black/80 transition"
                >
                  + Nueva conversación
                </button>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <header className="border-b border-black/10 pb-3 md:pb-4">
                  <p className="text-[9px] md:text-xs uppercase tracking-[0.3em] text-gray-500">Curso</p>
                  <h3 className="text-lg md:text-2xl font-light text-black">{selectedConversation.courseTitle}</h3>
                  <p className="text-[11px] md:text-sm text-gray-500 mt-1">
                    Estudiante: {selectedConversation.studentName}
                  </p>
                  <div className="mt-3 md:mt-4">
                    <button
                      type="button"
                      onClick={handleDeleteConversation}
                      disabled={deleting}
                      className="px-3 md:px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[9px] md:text-xs font-semibold uppercase tracking-wider hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleting ? 'Eliminando...' : 'Eliminar conversación'}
                    </button>
                  </div>
                </header>

                <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[420px] overflow-auto pr-1">
                  {messages.map((message) => {
                    const isOwn = message.senderUid === selectedConversation.instructorUid
                    return (
                      <div
                        key={message.id}
                        className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 border text-[11px] md:text-sm ${
                          isOwn
                            ? 'bg-black text-white border-black ml-4 md:ml-10'
                            : 'bg-gray-50 text-black border-black/10 mr-4 md:mr-10'
                        }`}
                      >
                        <p className="text-[8px] md:text-xs uppercase tracking-wider opacity-70 mb-1">
                          {message.senderName}
                        </p>
                        <p className="whitespace-pre-line break-words">{message.text}</p>
                        <p className="text-[9px] md:text-[10px] mt-2 opacity-70">{formatDate(message.createdAt)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 md:pt-3 space-y-2">
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Escribe tu respuesta al estudiante"
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-black/10 rounded-lg text-xs md:text-sm resize-y focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="w-full md:w-auto px-4 md:px-5 py-2 md:py-3 rounded-xl bg-black text-white text-xs md:text-sm uppercase tracking-wider disabled:opacity-50"
                  >
                    {sending ? 'Enviando...' : 'Enviar respuesta'}
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>

      {/* ===================== MODAL NUEVA CONVERSACIÓN ===================== */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal() }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light tracking-tight text-black">Nueva conversación</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-black text-xl leading-none"
              >
                ×
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {modalError}
              </div>
            )}

            {/* SELECT CURSO */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Curso</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-black"
              >
                <option value="">Selecciona un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.titulo || course.title || course.id}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECT ESTUDIANTE */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Estudiante</label>
              {loadingStudents ? (
                <p className="text-xs text-gray-500 py-2">Cargando estudiantes...</p>
              ) : (
                <select
                  value={selectedStudentUid}
                  onChange={(e) => setSelectedStudentUid(e.target.value)}
                  disabled={!selectedCourseId || students.length === 0}
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-black disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">
                    {!selectedCourseId
                      ? 'Primero selecciona un curso'
                      : students.length === 0
                      ? 'Sin estudiantes inscritos'
                      : 'Selecciona un estudiante'}
                  </option>
                  {students.map((student) => (
                    <option key={student.uid} value={student.uid}>
                      {student.firstName && student.lastName
                        ? `${student.firstName} ${student.lastName}`
                        : student.email || student.uid}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* MENSAJE INICIAL */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Mensaje</label>
              <textarea
                rows={4}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Escribe tu primer mensaje al estudiante..."
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm resize-none focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartConversation}
                disabled={
                  startingConversation ||
                  !selectedCourseId ||
                  !selectedStudentUid ||
                  !newMessageText.trim()
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-black text-white text-sm uppercase tracking-wider hover:bg-black/80 disabled:opacity-50 transition"
              >
                {startingConversation ? 'Enviando...' : 'Iniciar conversación'}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </AdminLayout>
    </>
  )
}

export default InstructorMessages