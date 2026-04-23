import { useEffect, useState } from 'react'
import AdminLayout from '../../components/Layouts/AdminLayout'
import {
  deleteConversation,
  getConversationMessages,
  getMyConversations,
  sendMessageInConversation,
} from '../../services/messageService'

function InstructorMessages() {
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [messages, setMessages] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

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
      if (!selectedConversationId) {
        setMessages([])
        return
      }

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

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) || null

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

      const nextSelectedId = nextConversations[0]?.id || ''
      setSelectedConversationId(nextSelectedId)
      setMessages([])
      setReplyMessage('')
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la conversación.')
    } finally {
      setDeleting(false)
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
    <AdminLayout activeSection="mensajes">
      <section className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-black">Mensajes de estudiantes</h1>
          <p className="text-xs md:text-sm lg:text-lg text-gray-500 font-light mt-2">
            Revisa y responde los mensajes que te envían los usuarios de tus cursos.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[360px_1fr]">
          <aside className="rounded-3xl border border-black/5 bg-white p-3 md:p-5 shadow-lg shadow-black/5 h-fit md:h-auto min-w-0 overflow-hidden">
            <h2 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 mb-3 md:mb-4">Conversaciones</h2>

            {loading ? (
              <p className="text-xs md:text-sm text-gray-500">Cargando conversaciones...</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs md:text-sm text-gray-500">Todavía no tienes mensajes de estudiantes.</p>
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

          <article className="rounded-3xl border border-black/5 bg-white p-4 md:p-6 shadow-lg shadow-black/5">
            {!selectedConversation ? (
              <div className="h-full min-h-[300px] md:min-h-[320px] flex items-center justify-center text-xs md:text-sm text-gray-500">
                Selecciona una conversación para ver los mensajes.
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <header className="border-b border-black/10 pb-3 md:pb-4">
                  <p className="text-[9px] md:text-xs uppercase tracking-[0.3em] text-gray-500">Curso</p>
                  <h3 className="text-lg md:text-2xl font-light text-black">{selectedConversation.courseTitle}</h3>
                  <p className="text-[11px] md:text-sm text-gray-500 mt-1">Estudiante: {selectedConversation.studentName}</p>
                  <div className="mt-3 md:mt-4">
                    <button
                      type="button"
                      onClick={handleDeleteConversation}
                      disabled={deleting}
                      className="px-3 md:px-4 py-2 md:py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[9px] md:text-xs font-semibold uppercase tracking-wider hover:bg-red-100 disabled:opacity-50"
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
                          isOwn ? 'bg-black text-white border-black ml-4 md:ml-10' : 'bg-gray-50 text-black border-black/10 mr-4 md:mr-10'
                        }`}
                      >
                        <p className="text-[8px] md:text-xs uppercase tracking-wider opacity-70 mb-1">{message.senderName}</p>
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
                    Enviar respuesta
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </AdminLayout>
  )
}

export default InstructorMessages
