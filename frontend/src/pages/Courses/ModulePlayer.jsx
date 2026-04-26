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
import globalStyles from './ModulePlayerStyle.js'

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

function ModulePlayerstyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'module-player-styles'
    style.textContent = globalStyles
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById('module-player-styles')
      if (el) el.remove()
    }
  }, [])
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
          } catch { }

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
    }).catch(() => { })
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
    }).catch(() => { })
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

  const lessonTypeConfig = {
    video: { icon: '▶', label: 'Video', color: 'var(--accent-video)' },
    lectura: { icon: '◈', label: 'Lectura', color: 'var(--accent-read)' },
    recurso: { icon: '⬡', label: 'Recurso', color: 'var(--accent-resource)' },
  }

  const getLessonConfig = (tipo) => lessonTypeConfig[tipo] || lessonTypeConfig.recurso

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="mp-loading-screen">
          <div className="mp-loading-inner">
            <div className="mp-spinner" />
            <p className="mp-loading-text">Preparando módulo</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !modulo) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="mp-loading-screen">
          <div className="mp-error-inner">
            <span className="mp-error-icon">⊗</span>
            <h2 className="mp-error-title">{error || 'Módulo no encontrado'}</h2>
            <Link to={coursePath} className="mp-btn mp-btn-primary">Volver al Curso</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="mp-root">

        {/* ── Header ── */}
        <header className="mp-header">
          <div className="mp-header-inner">
            <div className="mp-header-left">
              <Link to={coursePath} className="mp-logo">MARALESTE</Link>
              <div className="mp-header-divider" />
              <div className="mp-header-meta">
                <span className="mp-meta-label">Módulo {modulo.numero}</span>
                <span className="mp-meta-title">{modulo.titulo}</span>
              </div>
            </div>
            <div className="mp-header-right">
              {fromDashboard && (
                <button type="button" onClick={handleGoToDashboard} className="mp-nav-link mp-hide-mobile">
                  Dashboard
                </button>
              )}
              <button type="button" onClick={handleReturnToCourse} className="mp-nav-link mp-hide-xs">
                ← Volver
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mp-sidebar-toggle mp-show-mobile">
                <span className="mp-toggle-icon">{sidebarOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Progress bar under header */}
          <div className="mp-header-progress">
            <div className="mp-header-progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
        </header>

        <div className="mp-layout">

          {/* ── Main Content ── */}
          <main className="mp-main">
            {!currentLesson ? (
              <div className="mp-empty-state">
                <span className="mp-empty-icon">◯</span>
                <h2 className="mp-empty-title">Este módulo no tiene lecciones aún</h2>
                <Link to={`/course/${courseId}`} className="mp-btn mp-btn-ghost">Volver al curso</Link>
              </div>
            ) : (
              <div className="mp-content-area">

                {/* Lesson Header */}
                <div className="mp-lesson-header">
                  <div className="mp-lesson-meta-row">
                    <span
                      className="mp-lesson-badge"
                      style={{ '--badge-color': getLessonConfig(currentLesson.tipo).color }}
                    >
                      <span className="mp-badge-icon">{getLessonConfig(currentLesson.tipo).icon}</span>
                      {getLessonConfig(currentLesson.tipo).label}
                    </span>
                    {currentLesson.duracion && (
                      <span className="mp-lesson-duration">
                        <span className="mp-duration-dot" />
                        {currentLesson.duracion}
                      </span>
                    )}
                    <span className="mp-lesson-number">
                      {currentLessonIndex + 1} / {lecciones.length}
                    </span>
                  </div>
                  <h1 className="mp-lesson-title">{currentLesson.titulo}</h1>
                </div>

                {/* Video */}
                {hasVideo && embedUrl && (
                  <div className="mp-video-wrap">
                    {embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com') ? (
                      <div className="mp-video-ratio">
                        <iframe
                          src={embedUrl}
                          className="mp-video-iframe"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={currentLesson.titulo}
                        />
                      </div>
                    ) : (
                      <video controls className="mp-video-native" src={embedUrl}>
                        Tu navegador no soporta reproducción de video.
                      </video>
                    )}
                  </div>
                )}

                {/* Video link fallback */}
                {currentLesson.tipo === 'video' && currentLesson.videoUrl && !embedUrl && (
                  <div className="mp-card mp-card-info">
                    <span className="mp-card-icon">🔗</span>
                    <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="mp-link">
                      {currentLesson.videoUrl}
                    </a>
                  </div>
                )}

                {/* Progress strip */}
                <div className="mp-progress-strip">
                  <div className="mp-progress-strip-left">
                    <div className="mp-progress-bar-wrap">
                      <div className="mp-progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <span className="mp-progress-label">
                      {isModuleCompleted
                        ? '✦ Módulo completado'
                        : `${completedLessons.length} de ${lecciones.length} lecciones`}
                    </span>
                  </div>
                  <span className="mp-progress-pct">{progressPercentage}%</span>
                </div>

                {/* Lesson Content Blocks */}
                <div className="mp-blocks">

                  {currentLesson.objetivo && (
                    <div className="mp-block mp-block-objetivo">
                      <p className="mp-block-label">⬡ Objetivo de Aprendizaje</p>
                      <p className="mp-block-body">{currentLesson.objetivo}</p>
                    </div>
                  )}

                  {currentLesson.conceptosClave && (
                    <div className="mp-block mp-block-default">
                      <p className="mp-block-label">◈ Conceptos Clave</p>
                      <ul className="mp-concept-list">
                        {parseResources(currentLesson.conceptosClave).map((concepto, idx) => (
                          <li key={idx} className="mp-concept-item">
                            <span className="mp-concept-bullet">—</span>
                            <span>{concepto}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentLesson.contenido && (
                    <div className="mp-block mp-block-default">
                      <p className="mp-block-label">▤ Contenido Principal</p>
                      <div className="mp-prose">{currentLesson.contenido}</div>
                    </div>
                  )}

                  {currentLesson.ejemplosPracticos && (
                    <div className="mp-block mp-block-ejemplos">
                      <p className="mp-block-label">◎ Ejemplos Prácticos</p>
                      <div className="mp-prose">{currentLesson.ejemplosPracticos}</div>
                    </div>
                  )}

                  {currentLesson.imagen && (
                    <div className="mp-image-block">
                      <img
                        src={currentLesson.imagen}
                        alt={currentLesson.titulo}
                        className="mp-lesson-img"
                      />
                      {currentLesson.descripcionImagen && (
                        <div className="mp-image-caption">
                          <p className="mp-block-label">▣ Sobre la Imagen</p>
                          <p className="mp-caption-body">{currentLesson.descripcionImagen}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson.casoEstudio && (
                    <div className="mp-block mp-block-caso">
                      <p className="mp-block-label">⬡ Caso de Estudio</p>
                      <div className="mp-prose">{currentLesson.casoEstudio}</div>
                    </div>
                  )}
                </div>

                {/* Resources */}
                {parseResources(currentLesson?.recursos).length > 0 && (
                  <div className="mp-resources-block">
                    <h3 className="mp-resources-title">Recursos y Referencias</h3>
                    <ul className="mp-resource-list">
                      {parseResources(currentLesson.recursos).map((resource, idx) => (
                        <li key={idx} className="mp-resource-item">
                          {isUrl(resource) ? (
                            <a href={resource} target="_blank" rel="noopener noreferrer" className="mp-resource-link">
                              <span className="mp-resource-arrow">↗</span>
                              {resource}
                            </a>
                          ) : (
                            <span className="mp-resource-text">
                              <span className="mp-resource-arrow">·</span>
                              {resource}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Empty fallback */}
                {!currentLesson.contenido && !hasVideo && (
                  <div className="mp-empty-lesson">
                    <span className="mp-empty-lesson-icon">◻</span>
                    <p>Esta lección aún no tiene contenido cargado.</p>
                  </div>
                )}

                {/* Challenge */}
                {modulo?.reto?.habilitado && (
                  <div className="mp-challenge-block">
                    <div className="mp-challenge-header">
                      <span className="mp-challenge-badge">Reto</span>
                      <h3 className="mp-challenge-title">{modulo.reto?.titulo || 'Reto práctico'}</h3>
                    </div>
                    {modulo.reto?.descripcion && (
                      <p className="mp-challenge-desc">{modulo.reto.descripcion}</p>
                    )}

                    {challengeSubmission && (
                      <div className="mp-submission-status">
                        <p className="mp-submission-label">Estado de entrega</p>
                        <p className="mp-submission-state">{challengeSubmission.estado || 'pendiente'}</p>
                        {challengeSubmission.evidenciaUrl && (
                          <div className="mp-submission-img-wrap">
                            <img
                              src={challengeSubmission.evidenciaUrl}
                              alt="Evidencia enviada"
                              className="mp-submission-img"
                              loading="lazy"
                            />
                            <a href={challengeSubmission.evidenciaUrl} target="_blank" rel="noopener noreferrer" className="mp-link mp-link-sm">
                              Abrir imagen completa ↗
                            </a>
                          </div>
                        )}
                        {challengeSubmission.feedback && (
                          <p className="mp-feedback-text">Feedback: {challengeSubmission.feedback}</p>
                        )}
                      </div>
                    )}

                    <div className="mp-challenge-form">
                      <label className="mp-file-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setChallengeFile(e.target.files?.[0] || null)}
                          className="mp-file-input"
                        />
                        <span className="mp-file-btn">
                          {challengeFile ? '✓ Imagen seleccionada' : '+ Adjuntar evidencia'}
                        </span>
                      </label>

                      {challengeFile && (
                        <div className="mp-preview-wrap">
                          <img src={URL.createObjectURL(challengeFile)} alt="Vista previa" className="mp-preview-img" />
                          <div className="mp-preview-meta">
                            <div>
                              <p className="mp-preview-name">{challengeFile.name}</p>
                              <p className="mp-preview-size">{(challengeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button type="button" onClick={() => setChallengeFile(null)} className="mp-remove-btn">✕</button>
                          </div>
                        </div>
                      )}

                      <textarea
                        value={challengeComment}
                        onChange={(e) => setChallengeComment(e.target.value)}
                        rows={3}
                        placeholder="Comentario opcional para tu entrega..."
                        className="mp-textarea"
                      />

                      <button
                        type="button"
                        onClick={handleChallengeSubmit}
                        disabled={challengeSubmitting || !challengeFile}
                        className="mp-btn mp-btn-primary mp-challenge-submit"
                      >
                        {challengeSubmitting ? 'Enviando...' : 'Enviar evidencia →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="mp-nav-bar">
                  <button
                    disabled={isFirstLesson}
                    onClick={() => goToLesson(currentLessonIndex - 1)}
                    className={`mp-nav-btn ${isFirstLesson ? 'mp-nav-btn--disabled' : ''}`}
                  >
                    ← Anterior
                  </button>

                  <button
                    onClick={() => toggleLessonCompletion(currentLesson.id)}
                    className={`mp-complete-btn ${completedLessons.includes(currentLesson.id) ? 'mp-complete-btn--done' : ''}`}
                  >
                    {completedLessons.includes(currentLesson.id) ? '✓ Completada' : 'Marcar completa'}
                  </button>

                  <button
                    disabled={isLastLesson}
                    onClick={() => goToLesson(currentLessonIndex + 1)}
                    className={`mp-nav-btn ${isLastLesson ? 'mp-nav-btn--disabled' : ''}`}
                  >
                    Siguiente →
                  </button>
                </div>

                {/* Quiz CTA */}
                {isLastLesson && modulo.tieneQuiz && (
                  <div className="mp-quiz-cta">
                    <div className="mp-quiz-cta-content">
                      <p className="mp-quiz-eyebrow">Módulo completado</p>
                      <h3 className="mp-quiz-heading">¿Listo para el quiz?</h3>
                      <p className="mp-quiz-sub">Pon a prueba lo que aprendiste en este módulo.</p>
                    </div>
                    <div className="mp-quiz-actions">
                      <button type="button" onClick={handleStartQuiz} className="mp-btn mp-btn-primary">
                        Comenzar Quiz →
                      </button>
                      <button type="button" onClick={handleReturnToCourse} className="mp-btn mp-btn-ghost">
                        Volver al Curso
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>

          {/* ── Sidebar ── */}
          {sidebarOpen && (
            <div className="mp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}
          <aside className={`mp-sidebar ${sidebarOpen ? 'mp-sidebar--open' : ''}`}>
            <div className="mp-sidebar-head">
              <div>
                <p className="mp-sidebar-module-label">Módulo {modulo.numero}</p>
                <h3 className="mp-sidebar-module-title">{modulo.titulo}</h3>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="mp-sidebar-close mp-show-mobile">✕</button>
            </div>

            <div className="mp-sidebar-progress">
              <div className="mp-sidebar-bar">
                <div className="mp-sidebar-bar-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="mp-sidebar-stats">
                <span>{completedLessons.length} / {lecciones.length} lecciones</span>
                <span>{progressPercentage}%</span>
              </div>
            </div>

            <div className="mp-lesson-list">
              {lecciones.map((leccion, index) => {
                const isActive = currentLessonIndex === index
                const isCompleted = completedLessons.includes(leccion.id)
                const cfg = getLessonConfig(leccion.tipo)
                return (
                  <button
                    key={leccion.id}
                    onClick={() => { goToLesson(index); if (window.innerWidth < 1024) setSidebarOpen(false) }}
                    className={`mp-lesson-item ${isActive ? 'mp-lesson-item--active' : ''} ${isCompleted && !isActive ? 'mp-lesson-item--done' : ''}`}
                  >
                    <div className="mp-lesson-item-num">
                      {isCompleted ? <span className="mp-check">✓</span> : <span className="mp-num">{leccion.orden || index + 1}</span>}
                    </div>
                    <div className="mp-lesson-item-body">
                      <div className="mp-lesson-item-top">
                        <span className="mp-lesson-item-type" style={{ '--badge-color': cfg.color }}>{cfg.label}</span>
                        {leccion.duracion && <span className="mp-lesson-item-dur">{leccion.duracion}</span>}
                      </div>
                      <p className="mp-lesson-item-title">{leccion.titulo}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mp-sidebar-instructor">
              {curso?.instructor && (
                <p className="mp-instructor-text">Instructor: <strong>{curso.instructor}</strong></p>
              )}
              {modulo.duracion && (
                <p className="mp-instructor-text">Duración total: <strong>{modulo.duracion}</strong></p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}




export default ModulePlayer