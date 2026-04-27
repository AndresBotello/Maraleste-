import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses, getMyCourseAccesses } from '../../services/courseService'
import {
  getConversationMessages,
  getMyConversations,
  sendMessageInConversation,
  sendMessageToCourseInstructor,
} from '../../services/messageService'
import messagesStyles from './MessagesStyles'
import customerSharedStyles from './CustomerSharedStyles'

function Messages() {
  const [courses, setCourses] = useState([])
  const [accesses, setAccesses] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [newCourseMessage, setNewCourseMessage] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [conversationMessages, setConversationMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const [coursesData, accessData, conversationsData] = await Promise.all([
          getCourses(),
          getMyCourseAccesses(),
          getMyConversations(),
        ])

        setCourses(coursesData || [])
        setAccesses(accessData || [])
        setConversations(conversationsData || [])

        if ((accessData || []).length > 0) {
          setSelectedCourseId(accessData[0].courseId)
        }

        if ((conversationsData || []).length > 0) {
          setSelectedConversationId(conversationsData[0].id)
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar tus mensajes.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) {
        setConversationMessages([])
        return
      }

      try {
        const payload = await getConversationMessages(selectedConversationId)
        setConversationMessages(payload?.messages || [])
      } catch (err) {
        setError(err.message || 'No se pudo cargar la conversación.')
      }
    }

    loadMessages()
  }, [selectedConversationId])

  const enrolledCourses = useMemo(() => {
    const accessSet = new Set((accesses || []).map((item) => item.courseId))
    return (courses || []).filter((course) => accessSet.has(course.id))
  }, [courses, accesses])

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) || null

  const refreshConversations = async (nextConversationId = null) => {
    const data = await getMyConversations()
    setConversations(data || [])

    if (nextConversationId) {
      setSelectedConversationId(nextConversationId)
      return
    }

    if ((data || []).length > 0 && !selectedConversationId) {
      setSelectedConversationId(data[0].id)
    }
  }

  const handleSendCourseMessage = async () => {
    if (!selectedCourseId || !newCourseMessage.trim()) return

    try {
      setSending(true)
      const payload = await sendMessageToCourseInstructor(selectedCourseId, newCourseMessage.trim())
      setNewCourseMessage('')
      await refreshConversations(payload?.conversationId)
    } catch (err) {
      setError(err.message || 'No se pudo enviar el mensaje al instructor.')
    } finally {
      setSending(false)
    }
  }

  const handleSendReply = async () => {
    if (!selectedConversationId || !replyMessage.trim()) return

    try {
      setSending(true)
      await sendMessageInConversation(selectedConversationId, replyMessage.trim())
      setReplyMessage('')
      const payload = await getConversationMessages(selectedConversationId)
      setConversationMessages(payload?.messages || [])
      await refreshConversations(selectedConversationId)
    } catch (err) {
      setError(err.message || 'No se pudo enviar la respuesta.')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return ''
    try {
      const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value)
      return date.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="ms-root bg-[#f2f2f0] min-h-screen text-[#1a1a1a]">
      <style>{customerSharedStyles + messagesStyles}</style>
      <header className="ms-header border-b border-black/5 sticky top-0 bg-[#f2f2f0]/95 backdrop-blur-md z-40">
        <div className="ms-shell px-4 md:px-8 lg:px-12 py-4 md:py-6 flex justify-between items-center">
          <Link to="/customer/dashboard" className="ms-brand text-lg md:text-xl font-light tracking-[0.3em] md:tracking-[0.4em] text-black hover:text-gray-600 transition">
            MARALESTE
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/customer/dashboard" className="text-xs md:text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="ms-shell px-4 md:px-8 lg:px-12 py-8 md:py-10 space-y-6 md:space-y-8">
        <div>
          <h1 className="ms-title text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-black">Mensajes con instructores</h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">Escribe a los instructores de los cursos donde ya estás inscrito.</p>
        </div>

        {error && <div className="ms-error rounded-xl border border-red-200 bg-red-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-700">{error}</div>}

        <section className="ms-layout grid gap-4 md:gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[360px_1fr]">
          <aside className="ms-side rounded-3xl border border-black/5 bg-white p-4 md:p-5 shadow-lg shadow-black/5 space-y-4 md:space-y-6 md:row-start-1">
            <div>
              <h2 className="ms-section-title text-xs md:text-sm uppercase tracking-[0.3em] text-gray-500 mb-2 md:mb-3">Nuevo mensaje</h2>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="ms-field w-full px-3 py-2 border border-black/10 rounded-lg text-xs md:text-sm mb-2 md:mb-3 focus:outline-none focus:border-black min-w-0 overflow-hidden"
              >
                {(enrolledCourses || []).map((course) => (
                  <option key={course.id} value={course.id}>{course.titulo.length > 50 ? course.titulo.substring(0, 50) + '...' : course.titulo}</option>
                ))}
              </select>
              <textarea
                rows={3}
                value={newCourseMessage}
                onChange={(e) => setNewCourseMessage(e.target.value)}
                placeholder="Escribe tu mensaje para el instructor"
                className="ms-textarea w-full px-3 py-2 border border-black/10 rounded-lg text-xs md:text-sm resize-y focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleSendCourseMessage}
                disabled={sending || !selectedCourseId || !newCourseMessage.trim()}
                className="ms-btn ms-btn--solid mt-2 md:mt-3 w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-black text-white text-xs uppercase tracking-wider disabled:opacity-50 transition"
              >
                Enviar al instructor
              </button>
            </div>

            <div>
              <h2 className="ms-section-title text-xs md:text-sm uppercase tracking-[0.3em] text-gray-500 mb-2 md:mb-3">Conversaciones</h2>
              {loading ? (
                <p className="text-xs md:text-sm text-gray-500">Cargando...</p>
              ) : conversations.length === 0 ? (
                <p className="text-xs md:text-sm text-gray-500">Aún no tienes conversaciones.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] md:max-h-[52vh] overflow-auto pr-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`ms-conversation w-full text-left p-2 md:p-3 rounded-xl border transition text-xs md:text-sm min-w-0 overflow-hidden ${
                        selectedConversationId === conversation.id
                          ? 'is-active bg-black text-white border-black'
                          : 'bg-white border-black/10 hover:bg-black/5'
                      }`}
                    >
                      <p className="font-medium line-clamp-2 break-words">{conversation.courseTitle}</p>
                      <p className={`text-[11px] md:text-xs mt-1 truncate ${
                        selectedConversationId === conversation.id ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        Instructor: {conversation.instructorName}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <article className="ms-main rounded-3xl border border-black/5 bg-white p-4 md:p-6 shadow-lg shadow-black/5">
            {!selectedConversation ? (
              <div className="h-full min-h-[300px] flex items-center justify-center text-xs md:text-base text-gray-500 text-center">
                Selecciona una conversación o crea una nueva.
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <header className="border-b border-black/10 pb-3 md:pb-4">
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500">Curso</p>
                  <h3 className="text-xl md:text-2xl font-light text-black mt-1">{selectedConversation.courseTitle}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Instructor: {selectedConversation.instructorName}</p>
                </header>

                <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[420px] overflow-auto pr-1">
                  {conversationMessages.map((message) => {
                    const isOwn = message.senderUid === selectedConversation.studentUid
                    return (
                      <div
                        key={message.id}
                        className={`ms-msg rounded-2xl px-3 md:px-4 py-2 md:py-3 border text-xs md:text-sm ${
                          isOwn ? 'is-own bg-black text-white border-black ml-6 md:ml-10' : 'is-other bg-gray-50 text-black border-black/10 mr-6 md:mr-10'
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{message.senderName}</p>
                        <p className="whitespace-pre-line break-words">{message.text}</p>
                        <p className="text-[10px] mt-1 md:mt-2 opacity-70">{formatDate(message.createdAt)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 md:pt-3">
                  <textarea
                    rows={2}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Responder en esta conversación"
                    className="ms-textarea w-full px-3 py-2 border border-black/10 rounded-lg text-xs md:text-sm resize-y focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="ms-btn ms-btn--solid mt-2 md:mt-3 px-4 md:px-5 py-2 md:py-3 rounded-xl bg-black text-white text-xs uppercase tracking-wider disabled:opacity-50 transition w-full md:w-auto"
                  >
                    Enviar respuesta
                  </button>
                </div>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  )
}

export default Messages
