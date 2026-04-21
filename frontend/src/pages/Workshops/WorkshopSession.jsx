import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { checkWorkshopAccess, getWorkshopById } from '../../services/workshopService'

/**
 * WorkshopSession — Página que embebe Jitsi Meet dentro de la app.
 *
 * Ruta: /workshop/:workshopId/session
 *
 * Para talleres con plataformaReunion === 'jitsi-meet', la sesión se muestra
 * embebida directamente en un iframe. Para otras plataformas, redirige al link externo.
 */
function WorkshopSession() {
  const { workshopId } = useParams()
  const navigate = useNavigate()
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth()
  const jitsiContainerRef = useRef(null)

  const [workshop, setWorkshop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cargar datos del taller
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/workshop/${workshopId}/session`)}`)
      return
    }

    const fetchWorkshop = async () => {
      try {
        setLoading(true)
        const data = await getWorkshopById(workshopId)

        const isAdminLike = ['admin', 'docente'].includes(String(profile?.rol || '').toLowerCase())
        if (!isAdminLike) {
          const accessData = await checkWorkshopAccess(workshopId)
          if (!accessData?.acceso?.disponible) {
            setError('Debes inscribirte al taller antes de entrar a la sesión.')
            setLoading(false)
            return
          }
        }

        setWorkshop(data)

        // Si no es jitsi-meet y tiene link, redirigir directamente
        if (data.plataformaReunion !== 'jitsi-meet' && data.linkReunion) {
          window.open(data.linkReunion, '_blank')
        }
      } catch (err) {
        console.error('Error cargando taller:', err)
        setError(err.message || 'Error al cargar el taller')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkshop()
  }, [workshopId, isAuthenticated, authLoading, navigate, profile?.rol])

  // Extraer el nombre de sala de un link de Jitsi
  const getJitsiRoomName = (link) => {
    if (!link) return null
    try {
      const url = new URL(link)
      // meet.jit.si/MiSala → pathname = /MiSala
      return url.pathname.replace(/^\//, '') || null
    } catch {
      // Si no es URL válida, usar el link como nombre de sala
      return link
    }
  }

  // Construir el src del iframe de Jitsi
  const getJitsiEmbedUrl = () => {
    if (!workshop?.linkReunion) return null

    const roomName = getJitsiRoomName(workshop.linkReunion)
    if (!roomName) return null

    const displayName = profile
      ? `${profile.firstName} ${profile.lastName}`
      : user?.displayName || 'Participante'

    // URL del iframe con configuración
    const params = new URLSearchParams({
      'userInfo.displayName': displayName,
    })

    // Determinar el dominio de Jitsi
    try {
      const url = new URL(workshop.linkReunion)
      return `https://${url.hostname}/${roomName}#${params.toString()}`
    } catch {
      return `https://meet.jit.si/${roomName}#${params.toString()}`
    }
  }

  const isJitsi = workshop?.plataformaReunion === 'jitsi-meet'
  const jitsiUrl = isJitsi ? getJitsiEmbedUrl() : null

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-white mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white/60 text-sm">Cargando sesión del taller...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !workshop) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-light text-white mb-2">No se pudo cargar la sesión</h2>
          <p className="text-white/50 text-sm mb-6">{error || 'Taller no encontrado'}</p>
          <button
            onClick={() => navigate('/workshops')}
            className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Volver a talleres
          </button>
        </div>
      </div>
    )
  }

  // No es Jitsi → mostrar página con link externo
  if (!isJitsi) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-white mb-2">{workshop.titulo}</h2>
          <p className="text-white/50 text-sm mb-2">Por {workshop.instructor}</p>
          <p className="text-white/40 text-xs mb-8">
            Esta sesión usa una plataforma externa. Se abrirá en una nueva pestaña.
          </p>
          {workshop.linkReunion && (
            <a
              href={workshop.linkReunion}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Abrir en {
                workshop.plataformaReunion === 'google-meet' ? 'Google Meet' :
                workshop.plataformaReunion === 'zoom' ? 'Zoom' :
                workshop.plataformaReunion === 'microsoft-teams' ? 'Microsoft Teams' :
                workshop.plataformaReunion === 'discord' ? 'Discord' :
                'plataforma externa'
              }
            </a>
          )}
          <div className="mt-6">
            <button
              onClick={() => navigate('/workshops')}
              className="text-white/50 text-xs uppercase tracking-[0.3em] hover:text-white transition"
            >
              ← Volver a talleres
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Jitsi embebido
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/workshops')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-[0.3em] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Salir
          </button>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <h1 className="text-white text-sm font-medium truncate max-w-[300px] lg:max-w-none">{workshop.titulo}</h1>
            <p className="text-white/40 text-xs">Por {workshop.instructor}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">En vivo</span>
          </div>

          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Info</span>
          </button>
        </div>
      </header>

      {/* Main content: iframe + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Jitsi iframe */}
        <div ref={jitsiContainerRef} className="flex-1 relative bg-black">
          {jitsiUrl ? (
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              title={`Sesión virtual: ${workshop.titulo}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-white/40 text-sm">No se pudo cargar la sesión de video</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar con info del taller */}
        {sidebarOpen && (
          <aside className="w-80 bg-[#1a1a1a] border-l border-white/10 overflow-y-auto shrink-0">
            <div className="p-6 space-y-6">
              {/* Workshop image */}
              {workshop.imagenPortada && (
                <div className="rounded-xl overflow-hidden">
                  <img src={workshop.imagenPortada} alt={workshop.titulo} className="w-full h-40 object-cover" />
                </div>
              )}

              {/* Title & instructor */}
              <div>
                <h2 className="text-white text-lg font-light">{workshop.titulo}</h2>
                <p className="text-white/50 text-sm mt-1">Por {workshop.instructor}</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{workshop.fecha}</span>
                </div>
                {workshop.hora && (
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{workshop.hora}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{workshop.duracion}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{workshop.cuposDisponibles ?? workshop.cuposTotal} cupos disponibles</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{workshop.categoria} · {workshop.nivel}</span>
                </div>
              </div>

              {/* Description */}
              {workshop.descripcion && (
                <div>
                  <h3 className="text-white/40 text-[10px] uppercase tracking-[0.4em] mb-2">Descripción</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{workshop.descripcion}</p>
                </div>
              )}

              {/* Materials */}
              {workshop.materiales && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/50 text-xs">
                    <span className="font-semibold text-white/70">Materiales:</span> {workshop.materiales}
                  </p>
                </div>
              )}

              {/* Tips */}
              <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <h3 className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wider">Consejos</h3>
                <ul className="space-y-2 text-xs text-white/50">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Asegúrate de tener cámara y micrófono habilitados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Usa auriculares para mejor calidad de audio
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Si tienes problemas, recarga la página
                  </li>
                </ul>
              </div>

              {/* Open in new tab */}
              {workshop.linkReunion && (
                <a
                  href={workshop.linkReunion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs uppercase tracking-[0.2em] rounded-lg border border-white/10 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir en pestaña nueva
                </a>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default WorkshopSession
