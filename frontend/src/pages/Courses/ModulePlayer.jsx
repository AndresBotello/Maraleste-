import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  checkCourseAccess,
  getCourseById,
  getCourseProgress,
  getMyChallengeSubmission,
  saveCourseProgress,
  submitChallengeSubmission,
} from '../../services/courseService'
import { useAuth } from '../../context/AuthContext'

/**
 * Detecta YouTube / Vimeo y devuelve URL de embed.
 */
function getEmbedUrl(url) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

function parseResources(resourceText = '') {
  return String(resourceText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function isUrl(value = '') {
  return /^https?:\/\//i.test(value)
}

function ModulePlayer() {
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const leccionParam = searchParams.get('leccion')
  const fromDashboard = searchParams.get('from') === 'dashboard'
  const coursePath = `/course/${courseId}${fromDashboard ? '?from=dashboard' : ''}`

  const [curso, setCurso] = useState(null)
  const [modulo, setModulo] = useState(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [challengeFile, setChallengeFile] = useState(null)
  const [challengeComment, setChallengeComment] = useState('')
  const [challengeSubmission, setChallengeSubmission] = useState(null)
  const [challengeSubmitting, setChallengeSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        if (isAuthenticated) {
          const access = await checkCourseAccess(courseId)
          if (!access?.acceso?.disponible) {
            navigate(coursePath, { replace: true })
            return
          }
        }

        const data = await getCourseById(courseId)
        if (!data) { setError('Curso no encontrado'); return }

        if (data?.acceso && !data?.acceso?.disponible) {
          navigate(coursePath, { replace: true })
          return
        }

        setCurso(data)
        const mod = (data.modulos_detalle || []).find(m => m.id === moduleId)
        if (!mod) { setError('Módulo no encontrado'); return }
        setModulo(mod)


        if (isAuthenticated) {
          try {
            const progress = await getCourseProgress(courseId)
            const moduleProgress = progress?.progresoPorModulo?.[moduleId]

            if (moduleProgress?.ultimaLeccionId && Array.isArray(mod.lecciones)) {
              const savedLessonIndex = mod.lecciones.findIndex((lesson) => lesson.id === moduleProgress.ultimaLeccionId)
              if (savedLessonIndex >= 0) {
                setCurrentLessonIndex(savedLessonIndex)
              }
            }

            if (Array.isArray(moduleProgress?.leccionesCompletadas)) {
              setCompletedLessons(moduleProgress.leccionesCompletadas)
            }
          } catch {
            // Si falla progreso, el módulo igual debe cargar.
          }

          try {
            const submission = await getMyChallengeSubmission(courseId, moduleId)
            setChallengeSubmission(submission || null)
            setChallengeComment(submission?.comentario || '')
          } catch {
            setChallengeSubmission(null)
          }
        }

        if (leccionParam && mod.lecciones) {
          const idx = mod.lecciones.findIndex(l => l.id === leccionParam)
          if (idx >= 0) setCurrentLessonIndex(idx)
        }
      } catch (err) {
        console.error('Error al cargar módulo:', err)
        setError('No se pudo cargar el módulo.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId, moduleId, leccionParam, isAuthenticated, navigate, coursePath])

  useEffect(() => {
   window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentLessonIndex])

  const lecciones = modulo?.lecciones || []
  const currentLesson = lecciones[currentLessonIndex] || null
  const isFirstLesson = currentLessonIndex === 0
  const isLastLesson = currentLessonIndex === lecciones.length - 1
  const progressPercentage = lecciones.length > 0 ? Math.round((completedLessons.length / lecciones.length) * 100) : 0
  const isModuleCompleted = lecciones.length > 0 && completedLessons.length >= lecciones.length

  const persistCurrentProgress = async (nextCompletedLessons, nextLessonId = currentLesson?.id) => {
    if (!isAuthenticated || !modulo || !nextLessonId) return

    await saveCourseProgress(courseId, {
      moduloId: modulo.id,
      leccionId: nextLessonId,
      leccionesCompletadas: nextCompletedLessons,
    }).catch(() => {
      // No bloquea la experiencia si falla la persistencia.
    })
  }

  const markCurrentLessonCompleted = (lessonList = completedLessons) => {
    if (!currentLesson) return lessonList
    return lessonList.includes(currentLesson.id) ? lessonList : [...lessonList, currentLesson.id]
  }

  const goToLesson = async (nextIndex) => {
    const updatedCompletedLessons = markCurrentLessonCompleted()
    setCompletedLessons(updatedCompletedLessons)
    await persistCurrentProgress(updatedCompletedLessons, lecciones[nextIndex]?.id || currentLesson?.id)
    setCurrentLessonIndex(nextIndex)
  }

  const toggleLessonCompletion = (lessonId) => {
    setCompletedLessons(prev => prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId])
  }

  const embedUrl = currentLesson ? getEmbedUrl(currentLesson.videoUrl) : null
  const hasVideo = currentLesson && currentLesson.videoUrl && currentLesson.tipo === 'video'

  useEffect(() => {
    if (!isAuthenticated || !modulo || !currentLesson) return

    saveCourseProgress(courseId, {
      moduloId: modulo.id,
      leccionId: currentLesson.id,
      leccionesCompletadas: completedLessons,
    }).catch(() => {
      // No bloquea la experiencia de reproducción si falla persistencia.
    })
  }, [courseId, isAuthenticated, modulo, currentLesson, completedLessons])

  const handleReturnToCourse = async () => {
    const updatedCompletedLessons = markCurrentLessonCompleted()
    setCompletedLessons(updatedCompletedLessons)
    await persistCurrentProgress(updatedCompletedLessons)
    navigate(coursePath)
  }

  const handleGoToDashboard = () => {
    navigate('/customer/dashboard')
  }

  const handleStartQuiz = async () => {
    const updatedCompletedLessons = markCurrentLessonCompleted()
    setCompletedLessons(updatedCompletedLessons)
    await persistCurrentProgress(updatedCompletedLessons)
    navigate(`/course/${courseId}/module/${moduleId}/quiz${fromDashboard ? '?from=dashboard' : ''}`)
  }

  const handleChallengeSubmit = async () => {
    if (!modulo?.reto?.habilitado) return
    if (!challengeFile) return

    try {
      setChallengeSubmitting(true)
      const submission = await submitChallengeSubmission(courseId, modulo.id, {
        evidencia: challengeFile,
        comentario: challengeComment,
      })
      setChallengeSubmission(submission)
      setChallengeFile(null)
    } catch (err) {
      setError(err.message || 'No se pudo enviar la evidencia del reto.')
    } finally {
      setChallengeSubmitting(false)
    }
  }

  // ── Loading / Error states ─────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#f2f2f0] min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-black mb-4 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 font-light text-sm md:text-base">Cargando módulo...</p>
        </div>
      </div>
    )
  }

  if (error || !modulo) {
    return (
      <div className="bg-[#f2f2f0] min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl md:text-5xl mb-4 md:mb-6">😕</div>
          <h2 className="text-xl md:text-2xl font-light text-black mb-3 md:mb-4 px-4">{error || 'Módulo no encontrado'}</h2>
          <Link to={coursePath} className="inline-block px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition text-sm md:text-base">Volver al Curso</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f2f2f0] text-[#1a1a1a] min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-black/5 bg-[#f2f2f0]/95 backdrop-blur-md z-40 sticky top-0">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-3 md:py-3 lg:py-4 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <Link to={coursePath} className="text-sm md:text-lg lg:text-xl font-light tracking-[0.3em] md:tracking-[0.4em] text-black hover:text-gray-600 transition whitespace-nowrap flex-shrink-0">MARALESTE</Link>
            <span className="text-gray-400 hidden sm:inline flex-shrink-0">•</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 uppercase tracking-wider truncate">Módulo {modulo.numero}</p>
              <p className="text-xs md:text-sm lg:text-base font-light text-black truncate">{modulo.titulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-2 lg:gap-4 flex-shrink-0">
            {fromDashboard && (
              <button type="button" onClick={handleGoToDashboard} className="hidden lg:inline text-xs lg:text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">Dashboard</button>
            )}
            <button type="button" onClick={handleReturnToCourse} className="hidden sm:inline text-xs lg:text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">Volver</button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-black hover:text-gray-600 transition text-xl lg:hidden p-2 rounded-lg hover:bg-black/5 flex-shrink-0">
              {sidebarOpen ? '✕' : '≡'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto">
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {!currentLesson ? (
            <div className="p-4 md:p-8 text-center py-16 md:py-32">
              <div className="text-4xl md:text-5xl mb-4 md:mb-6">📭</div>
              <h2 className="text-xl md:text-2xl font-light text-black mb-3 md:mb-4 px-4">Este módulo no tiene lecciones aún</h2>
              <Link to={`/course/${courseId}`} className="text-gray-500 hover:text-black transition underline text-sm md:text-base">Volver al curso</Link>
            </div>
          ) : (
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
              {/* Lesson Header */}
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">
                    {currentLesson.tipo === 'video' ? '▶️' : currentLesson.tipo === 'lectura' ? '📖' : '📥'}
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-gray-500 bg-white/80 px-2 md:px-3 py-1 rounded-full border border-black/10">
                    {currentLesson.tipo === 'video' ? 'Video Lección' : currentLesson.tipo === 'lectura' ? 'Lectura' : 'Recurso'}
                  </span>
                  <span className="text-[10px] md:text-xs text-gray-500 font-light">{currentLesson.duracion}</span>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-light mb-3 md:mb-4 tracking-tight text-black">{currentLesson.titulo}</h1>
                {currentLesson.descripcion && (
                  <p className="text-base md:text-lg text-gray-500 font-light">{currentLesson.descripcion}</p>
                )}
              </div>

              {/* Progress */}
              <div className="mb-6 md:mb-6 lg:mb-8 bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-4 lg:p-6 border border-black/10 shadow-lg">
                <div className="flex justify-between items-center mb-3 md:mb-4 gap-2">
                  <h3 className="text-xs md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-500">Progreso del Módulo</h3>
                  <span className="text-xs md:text-xs lg:text-sm text-gray-500 font-light">
                    {isModuleCompleted ? 'Completado' : `${progressPercentage}%`}
                  </span>
                </div>
                <div className="w-full bg-black/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-gray-600 to-black h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progressPercentage)}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3 md:mt-4 text-xs md:text-xs text-gray-500 gap-2">
                  <span>{completedLessons.length} de {lecciones.length} lecciones</span>
                  <span className="hidden md:inline">Instructor: {curso?.instructor || '—'}</span>
                </div>
              </div>

              {/* Video Embed */}
              {hasVideo && embedUrl && (
                <div className="mb-6 md:mb-8 bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-black/10">
                  {embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com') ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentLesson.titulo}
                      />
                    </div>
                  ) : (
                    <video controls className="w-full" src={embedUrl}>
                      Tu navegador no soporta reproducción de video.
                    </video>
                  )}
                </div>
              )}

              {/* Video Link fallback */}
              {currentLesson.tipo === 'video' && currentLesson.videoUrl && !embedUrl && (
                <div className="mb-6 md:mb-8 bg-blue-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-blue-200">
                  <p className="text-blue-900 font-light mb-2 text-sm md:text-base">🔗 Enlace del video:</p>
                  <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900 transition break-all text-sm md:text-base">
                    {currentLesson.videoUrl}
                  </a>
                </div>
              )}

              {/* Lesson Text Content */}
              {(currentLesson.objetivo || currentLesson.descripcion || currentLesson.contenido || 
                currentLesson.conceptosClave || currentLesson.ejemplosPracticos || currentLesson.casoEstudio ||
                currentLesson.imagen) && (
                <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                  {currentLesson.descripcion && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-black/10">
                      <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">{currentLesson.descripcion}</p>
                    </div>
                  )}

                  {/* Objetivo */}
                  {currentLesson.objetivo && (
                    <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-black/10">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-2 md:mb-3">🎯 Objetivo de Aprendizaje</p>
                      <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">{currentLesson.objetivo}</p>
                    </div>
                  )}

                  {/* Conceptos Clave */}
                  {currentLesson.conceptosClave && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-black/10">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-3 md:mb-4">🎯 Conceptos Clave</p>
                      <div className="space-y-2 md:space-y-3">
                        {parseResources(currentLesson.conceptosClave).map((concepto, idx) => (
                          <div key={idx} className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-black/[0.02] rounded-xl border border-black/5">
                            <span className="text-base md:text-lg font-bold text-black/30 mt-0.5">•</span>
                            <span className="text-sm md:text-base text-gray-700 font-light leading-relaxed flex-1">{concepto}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contenido Principal */}
                  {currentLesson.contenido && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-black/10">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-3 md:mb-4">📚 Contenido Principal</p>
                      <div className="prose prose-sm md:prose-lg max-w-none text-gray-700 font-light leading-relaxed whitespace-pre-wrap">
                        {currentLesson.contenido}
                      </div>
                    </div>
                  )}

                  {/* Ejemplos Prácticos */}
                  {currentLesson.ejemplosPracticos && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-blue-200">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-blue-600 font-bold mb-3 md:mb-4">💡 Ejemplos Prácticos</p>
                      <div className="prose prose-sm md:prose-lg max-w-none text-gray-700 font-light leading-relaxed whitespace-pre-wrap">
                        {currentLesson.ejemplosPracticos}
                      </div>
                    </div>
                  )}

                  {/* Imagen - Full Width */}
                  {currentLesson.imagen && (
                    <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-black/10 bg-white/70 backdrop-blur-sm shadow-lg">
                      <img 
                        src={currentLesson.imagen} 
                        alt={currentLesson.titulo}
                        className="w-full h-64 md:h-96 object-cover"
                      />
                      {currentLesson.descripcionImagen && (
                        <div className="p-5 md:p-8 border-t border-black/5 bg-white/50">
                          <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-2 md:mb-3">📸 Sobre la Imagen</p>
                          <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">{currentLesson.descripcionImagen}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Caso de Estudio */}
                  {currentLesson.casoEstudio && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-purple-200">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-purple-600 font-bold mb-3 md:mb-4">📊 Caso de Estudio</p>
                      <div className="prose prose-sm md:prose-lg max-w-none text-gray-700 font-light leading-relaxed whitespace-pre-wrap">
                        {currentLesson.casoEstudio}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Resources and References */}
              {parseResources(currentLesson?.recursos).length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg border border-black/10 mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-light text-black mb-3 md:mb-4">Recursos y Referencias</h3>
                  <ul className="space-y-2 md:space-y-3">
                    {parseResources(currentLesson.recursos).map((resource, idx) => (
                      <li key={`resource-${idx}`} className="text-sm md:text-base text-gray-700 font-light break-words">
                        {isUrl(resource) ? (
                          <a
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 transition"
                          >
                            {resource}
                          </a>
                        ) : (
                          resource
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback vacío */}
              {!currentLesson.contenido && !hasVideo && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-black/10 mb-6 md:mb-8 text-center">
                  <div className="text-4xl md:text-5xl mb-3 md:mb-4">📄</div>
                  <p className="text-gray-500 font-light text-base md:text-lg">Esta lección aún no tiene contenido cargado.</p>
                </div>
              )}

              {/* Challenge */}
              {modulo?.reto?.habilitado && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-black/10 mb-6 md:mb-8">
                  <h3 className="text-base md:text-lg font-light text-black mb-2">Reto del módulo</h3>
                  <p className="text-sm text-gray-600 mb-2">{modulo.reto?.titulo || 'Reto práctico'}</p>
                  {modulo.reto?.descripcion && (
                    <p className="text-sm text-gray-500 mb-4 whitespace-pre-line">{modulo.reto.descripcion}</p>
                  )}

                  {challengeSubmission && (
                    <div className="mb-4 rounded-xl border border-black/10 bg-black/[0.02] p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Estado de entrega</p>
                      <p className="text-sm text-black capitalize">{challengeSubmission.estado || 'pendiente'}</p>
                      {challengeSubmission.evidenciaUrl && (
                        <div className="mt-3 space-y-2">
                          <img
                            src={challengeSubmission.evidenciaUrl}
                            alt="Evidencia enviada"
                            className="w-full max-w-md h-48 md:h-56 object-cover rounded-lg border border-black/10 bg-white"
                            loading="lazy"
                          />
                          <a
                            href={challengeSubmission.evidenciaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline inline-block"
                          >
                            Abrir imagen completa
                          </a>
                        </div>
                      )}
                      {challengeSubmission.feedback && (
                        <p className="mt-2 text-sm text-gray-700">Feedback: {challengeSubmission.feedback}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setChallengeFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs md:text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-2 file:text-white file:text-xs md:file:text-sm"
                    />

                    {/* Vista previa de la imagen seleccionada */}
                    {challengeFile && (
                      <div className="border border-black/10 rounded-xl overflow-hidden bg-white/50">
                        <img 
                          src={URL.createObjectURL(challengeFile)} 
                          alt="Vista previa"
                          className="w-full h-40 md:h-48 object-cover"
                        />
                        <div className="p-3 md:p-4 border-t border-black/10">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">📸 Imagen Seleccionada</p>
                              <p className="text-xs md:text-sm text-gray-700 font-light truncate">{challengeFile.name}</p>
                              <p className="text-[10px] md:text-xs text-gray-500 font-light mt-1">
                                {(challengeFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setChallengeFile(null)}
                              className="px-3 md:px-4 py-2 rounded-lg bg-red-100 text-red-700 text-[10px] md:text-xs uppercase tracking-wider font-medium hover:bg-red-200 transition flex-shrink-0"
                            >
                              ✕ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <textarea
                      value={challengeComment}
                      onChange={(e) => setChallengeComment(e.target.value)}
                      rows={3}
                      placeholder="Comentario opcional para tu entrega"
                      className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                    />

                    <button
                      type="button"
                      onClick={handleChallengeSubmit}
                      disabled={challengeSubmitting || !challengeFile}
                      className="w-full md:w-auto px-5 py-3 rounded-xl bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {challengeSubmitting ? 'Enviando...' : 'Enviar reto'}
                    </button>
                  </div>
                </div>
              )}

              {/* Lesson Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-4 lg:p-6 border border-black/10 shadow-lg mb-6 md:mb-8 gap-2 sm:gap-4">
                <button
                  disabled={isFirstLesson}
                  onClick={() => goToLesson(currentLessonIndex - 1)}
                  className={`flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                    isFirstLesson
                      ? 'opacity-50 cursor-not-allowed border-2 border-gray-300 text-gray-400'
                      : 'border-2 border-black/20 text-black hover:bg-black hover:text-white hover:shadow-lg'
                  }`}
                >
                  <span className="text-base">←</span>
                  <span>Anterior</span>
                </button>

                <button
                  onClick={() => toggleLessonCompletion(currentLesson.id)}
                  className={`px-5 py-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-all hover:scale-105 flex-shrink-0 ${
                    completedLessons.includes(currentLesson.id)
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                      : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20'
                  }`}
                >
                  <span className="flex items-center gap-2 justify-center">
                    {completedLessons.includes(currentLesson.id) ? '✅ Completado' : '☑️ Marcar'}
                  </span>
                </button>

                <button
                  disabled={isLastLesson}
                  onClick={() => goToLesson(currentLessonIndex + 1)}
                  className={`flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                    isLastLesson
                      ? 'opacity-50 cursor-not-allowed border-2 border-gray-300 text-gray-400'
                      : 'border-2 border-black/20 text-black hover:bg-black hover:text-white hover:shadow-lg'
                  }`}
                >
                  <span>Siguiente</span>
                  <span className="text-base">→</span>
                </button>
              </div>

              {/* Quiz CTA */}
              {isLastLesson && modulo.tieneQuiz && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-purple-200 text-center">
                  <div className="text-4xl md:text-5xl mb-4 md:mb-6">🎯</div>
                  <h3 className="text-xl md:text-2xl font-light text-purple-900 mb-3 md:mb-4">¡Excelente Progreso!</h3>
                  <p className="text-sm md:text-base text-purple-700 font-light mb-5 md:mb-6 max-w-2xl mx-auto px-4">
                    Has completado todas las lecciones. Es momento de poner a prueba tus conocimientos.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                    <button type="button" onClick={handleStartQuiz} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-purple-600 text-white rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-wider font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                      📝 Comenzar Quiz
                    </button>
                    <Link to={`/course/${courseId}`} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-purple-300 text-purple-700 rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-wider font-medium hover:bg-purple-100 transition text-center">
                      Volver al Curso
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className={`w-full md:w-80 lg:w-96 border-l border-black/10 bg-white/40 backdrop-blur-md overflow-auto transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:static right-0 top-0 h-full lg:h-auto z-50`}>
          <div className="p-4 md:p-4 lg:p-6 border-b border-black/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-light text-black">Contenido del Módulo</h3>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-black text-xl p-2 rounded-lg hover:bg-black/5">✕</button>
            </div>
            <div className="text-xs md:text-xs text-gray-500 space-y-1">
              <p><strong>{completedLessons.length}</strong> de <strong>{lecciones.length}</strong> lecciones completadas</p>
              <p>Duración: {modulo.duracion}</p>
            </div>
          </div>

          <div className="p-3 md:p-3 lg:p-4 space-y-2 md:space-y-3">
            {lecciones.map((leccion, index) => {
              const isActive = currentLessonIndex === index
              const isCompleted = completedLessons.includes(leccion.id)
              return (
                <button
                  key={leccion.id}
                  onClick={() => { goToLesson(index); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                  className={`w-full text-left p-3 md:p-3 lg:p-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-sm border-2 ${
                    isActive ? 'bg-black text-white shadow-lg shadow-black/25 scale-[1.02] border-black'
                    : isCompleted ? 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100'
                    : 'bg-white/80 border-black/10 text-black hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? <span className="text-green-600 text-base md:text-lg">✅</span> : (
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${isActive ? 'bg-white text-black border-white' : 'border-gray-400 text-gray-500'}`}>
                          {leccion.orden || index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <span className="text-base md:text-lg flex-shrink-0">{leccion.tipo === 'video' ? '▶️' : leccion.tipo === 'lectura' ? '📖' : '📥'}</span>
                        <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium truncate ${isActive ? 'bg-white/20 text-white/80' : isCompleted ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {leccion.tipo}
                        </span>
                      </div>
                      <p className={`font-light mb-1.5 md:mb-2 line-clamp-2 text-xs md:text-sm ${isActive ? 'text-white' : isCompleted ? 'text-green-900' : 'text-black'}`}>{leccion.titulo}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] md:text-xs font-light ${isActive ? 'text-white/70' : isCompleted ? 'text-green-700' : 'text-gray-500'}`}>⏱️ {leccion.duracion}</span>
                        {isActive && <span className="text-[10px] md:text-xs text-white/70">• Actual</span>}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="p-4 md:p-4 lg:p-6 border-t border-black/10 bg-white/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-14 md:w-14 lg:w-16 h-14 md:h-14 lg:h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3"><span className="text-xl md:text-2xl">🎓</span></div>
              <h4 className="text-xs md:text-sm font-medium text-black mb-2">Progreso del Módulo</h4>
              <div className="w-full bg-black/10 rounded-full h-2 mb-2">
                <div className="bg-black h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
              </div>
              <p className="text-xs md:text-xs text-gray-500 font-light">{progressPercentage}% completado</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ModulePlayer