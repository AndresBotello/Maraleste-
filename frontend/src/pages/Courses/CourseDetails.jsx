import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCourseById, getCourseProgress, registerCourseAccess } from '../../services/courseService'
import { useAuth } from '../../context/AuthContext'
import globalStyles from './courseDetailStyles'

function parseResources(resourceText = '') {
  return String(resourceText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function isUrl(value = '') {
  return /^https?:\/\//i.test(value)
}


function CourseDetailsstyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'course-detail-styles'
    style.textContent = globalStyles
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById('course-detail-styles')
      if (el) el.remove()
    }
  }, [])
}


function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromDashboard = searchParams.get('from') === 'dashboard'
  const dashboardQuery = fromDashboard ? 'from=dashboard' : ''
  const withDashboardOrigin = (basePath, hasQuery = false) => {
    if (!dashboardQuery) return basePath
    return `${basePath}${hasQuery ? '&' : '?'}${dashboardQuery}`
  }
  const { isAuthenticated } = useAuth()
  const [expandedModule, setExpandedModule] = useState(null)
  const [purchaseModal, setPurchaseModal] = useState(false)
  const [curso, setCurso] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessLoading, setAccessLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [courseProgress, setCourseProgress] = useState(0)
  const [progressLoading, setProgressLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progressData, setProgressData] = useState(null)

  const isCourseCompleted = courseProgress >= 100

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        setError(null)
        const data = await getCourseById(courseId)
        if (!data) {
          setError('Curso no encontrado')
        } else {
          setCurso(data)
          setHasAccess(Boolean(data.acceso?.disponible))
        }
      } catch (err) {
        console.error('Error al cargar el curso:', err)
        setError('No se pudo cargar el curso. Intenta de nuevo más tarde.')
      } finally {
        setLoading(false)
        setAccessLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  useEffect(() => {
    if (!isAuthenticated || !courseId || !hasAccess) {
      setCourseProgress(0)
      return
    }
    let isMounted = true
    async function fetchProgress() {
      try {
        setProgressLoading(true)
        const progress = await getCourseProgress(courseId)
        if (isMounted) {
          setCourseProgress(progress?.resumen?.porcentajeCurso || 0)
          setProgressData(progress)
        }
      } catch {
        if (isMounted) setCourseProgress(0)
      } finally {
        if (isMounted) setProgressLoading(false)
      }
    }
    fetchProgress()
    return () => { isMounted = false }
  }, [courseId, isAuthenticated, hasAccess])

  const isModuleComplete = (moduloId, lecciones = []) => {
    if (!progressData || lecciones.length === 0) return false
    const completadas = progressData?.progresoPorModulo?.[moduloId]?.leccionesCompletadas || []
    return completadas.length >= lecciones.length
  }

  const isPaidCourse = curso?.tipoAcceso === 'pago'
  const shouldLockContent = isPaidCourse && !hasAccess
  const priceLabel = isPaidCourse
    ? `$ ${Number(curso?.precio || 0).toLocaleString('es-CO')} COP`
    : 'Gratis'

  const goToFirstLesson = () => {
    const firstModule = (curso?.modulos_detalle || [])[0]
    if (!firstModule) return
    const firstLesson = (firstModule.lecciones || [])[0]
    const params = new URLSearchParams()
    if (firstLesson?.id) params.set('leccion', firstLesson.id)
    if (fromDashboard) params.set('from', 'dashboard')
    const query = params.toString() ? `?${params.toString()}` : ''
    navigate(`/course/${curso.id}/module/${firstModule.id}${query}`)
  }

  const handleContinueLearning = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (isPaidCourse && !hasAccess) { setPurchaseModal(true); return }
    if (!isPaidCourse && !hasAccess) {
      try {
        setActionLoading(true)
        await registerCourseAccess(courseId)
        setHasAccess(true)
      } catch (err) {
        setError(err.message || 'No se pudo registrar tu acceso al curso.')
      } finally {
        setActionLoading(false)
      }
    }
    goToFirstLesson()
  }

  const handleConfirmPurchase = async () => {
    try {
      setActionLoading(true)
      await registerCourseAccess(courseId, { confirmarPago: true })
      const updatedCourse = await getCourseById(courseId)
      setCurso(updatedCourse)
      setHasAccess(true)
      setPurchaseModal(false)
      goToFirstLesson()
    } catch (err) {
      setError(err.message || 'No se pudo registrar la compra del curso.')
    } finally {
      setActionLoading(false)
    }
  }

  const lessonTypeConfig = {
    video: { icon: '▶', label: 'Video', color: 'var(--accent-video)' },
    lectura: { icon: '◈', label: 'Lectura', color: 'var(--accent-read)' },
    recurso: { icon: '⬡', label: 'Recurso', color: 'var(--accent-resource)' },
  }
  const getLessonConfig = (tipo) => lessonTypeConfig[tipo] || lessonTypeConfig.recurso

  // ── Loading ──
  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="cd-loading-screen">
          <div className="cd-loading-inner">
            <div className="cd-spinner" />
            <p className="cd-loading-text">Cargando curso</p>
          </div>
        </div>
      </>
    )
  }

  if (error && !curso) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="cd-loading-screen">
          <div className="cd-error-inner">
            <span className="cd-error-icon">⊗</span>
            <h2 className="cd-error-title">{error}</h2>
            <Link to="/courses" className="cd-btn cd-btn-primary">Volver al Catálogo</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="cd-root">

        {/* ── Header ── */}
        <header className="cd-header">
          <div className="cd-header-inner">
            <Link to="/courses" className="cd-logo">MARALESTE</Link>
            <div className="cd-header-nav">
              {fromDashboard && (
                <Link to="/customer/dashboard" className="cd-nav-link">Dashboard</Link>
              )}
              <Link to="/courses" className="cd-nav-link">← Catálogo</Link>
            </div>
          </div>
          {curso && (
            <div className="cd-header-progress">
              <div className="cd-header-progress-fill" style={{ width: `${Math.min(100, courseProgress)}%` }} />
            </div>
          )}
        </header>

        {/* ── Main ── */}
        {curso && (
          <main className="cd-main">
            <div className="cd-grid">

              {/* ── Left Column ── */}
              <div className="cd-left">

                {/* Hero */}
                <div className="cd-hero">
                  <div className="cd-hero-meta">
                    {curso.nivel && (
                      <span className="cd-level-badge">{curso.nivel}</span>
                    )}
                    {isPaidCourse && (
                      <span className="cd-paid-badge">Curso de pago</span>
                    )}
                  </div>
                  <h1 className="cd-course-title">{curso.titulo}</h1>
                  <p className="cd-instructor">Por {curso.instructor}</p>
                </div>

                {/* Cover Image */}
                <div className="cd-cover">
                  {curso.imagenPortada ? (
                    <img src={curso.imagenPortada} alt={curso.titulo} className="cd-cover-img" />
                  ) : (
                    <div className="cd-cover-placeholder">
                      <span className="cd-cover-icon">◎</span>
                      <p className="cd-cover-name">{curso.titulo}</p>
                    </div>
                  )}
                </div>

                {/* About */}
                <div className="cd-section">
                  <h2 className="cd-section-title">Acerca del curso</h2>
                  <p className="cd-about-text">
                    {curso.descripcionLarga || curso.descripcion}
                  </p>
                </div>

                {/* Progress */}
                {hasAccess && (
                  <div className="cd-progress-card">
                    <div className="cd-progress-top">
                      <span className="cd-progress-label">Tu Progreso</span>
                      <span className="cd-progress-pct">
                        {isCourseCompleted ? '✦ Completado' : `${courseProgress}%`}
                      </span>
                    </div>
                    <div className="cd-progress-bar-wrap">
                      <div className="cd-progress-bar-fill" style={{ width: `${Math.min(100, courseProgress)}%` }} />
                    </div>
                    {progressLoading && (
                      <p className="cd-progress-updating">Actualizando progreso...</p>
                    )}
                  </div>
                )}

                {/* Modules */}
                <div className="cd-section">
                  <h2 className="cd-section-title">Módulos del Curso</h2>

                  {shouldLockContent && (
                    <div className="cd-lock-notice">
                      <span className="cd-lock-icon">⚑</span>
                      El contenido completo se habilita al registrar la compra.
                    </div>
                  )}

                  <div className="cd-module-list">
                    {(curso.modulos_detalle || []).map((modulo, modIdx) => {
                      const isExpanded = expandedModule === modulo.id
                      const modComplete = isModuleComplete(modulo.id, modulo.lecciones)
                      const completedCount = progressData?.progresoPorModulo?.[modulo.id]?.leccionesCompletadas?.length || 0

                      return (
                        <div key={modulo.id} className={`cd-module ${isExpanded ? 'cd-module--open' : ''}`}>
                          {/* Module Header */}
                          <button
                            onClick={() => setExpandedModule(isExpanded ? null : modulo.id)}
                            className="cd-module-btn"
                          >
                            <div className="cd-module-left">
                              <div className="cd-module-num-wrap">
                                {modComplete ? (
                                  <span className="cd-module-check">✓</span>
                                ) : (
                                  <span className="cd-module-num">{modulo.numero || modIdx + 1}</span>
                                )}
                              </div>
                              <div className="cd-module-info">
                                <div className="cd-module-badges">
                                  <span className="cd-module-label">Módulo {modulo.numero || modIdx + 1}</span>
                                  {modulo.estado === 'bloqueado' && (
                                    <span className="cd-module-locked">Bloqueado</span>
                                  )}
                                  {modComplete && (
                                    <span className="cd-module-done">Completado</span>
                                  )}
                                </div>
                                <h3 className="cd-module-title">{modulo.titulo}</h3>
                                {modulo.descripcion && (
                                  <p className="cd-module-desc">{modulo.descripcion}</p>
                                )}
                              </div>
                            </div>
                            <div className="cd-module-right">
                              {modulo.duracion && (
                                <span className="cd-module-dur">{modulo.duracion}</span>
                              )}
                              <span className={`cd-module-chevron ${isExpanded ? 'cd-module-chevron--open' : ''}`}>
                                ›
                              </span>
                            </div>
                          </button>

                          {/* Module Body */}
                          {isExpanded && (
                            <div className="cd-module-body">

                              {/* Lessons */}
                              <div className="cd-lessons-wrap">
                                <p className="cd-sub-label">
                                  Lecciones
                                  {hasAccess && modulo.lecciones.length > 0 && (
                                    <span className="cd-lessons-count">
                                      {completedCount} / {modulo.lecciones.length}
                                    </span>
                                  )}
                                </p>
                                <div className="cd-lesson-list">
                                  {modulo.lecciones.map((leccion) => {
                                    const cfg = getLessonConfig(leccion.tipo)
                                    return (
                                      <div key={leccion.id} className={`cd-lesson ${shouldLockContent ? 'cd-lesson--locked' : ''}`}>
                                        <div className="cd-lesson-left">
                                          <span
                                            className="cd-lesson-type-icon"
                                            style={{ color: cfg.color }}
                                          >
                                            {cfg.icon}
                                          </span>
                                          <div className="cd-lesson-info">
                                            <p className="cd-lesson-title">{leccion.titulo}</p>
                                            <div className="cd-lesson-meta">
                                              <span
                                                className="cd-lesson-badge"
                                                style={{ '--badge-color': cfg.color }}
                                              >
                                                {cfg.label}
                                              </span>
                                              {leccion.duracion && (
                                                <span className="cd-lesson-dur">{leccion.duracion}</span>
                                              )}
                                            </div>
                                            {leccion.descripcion && (
                                              <p className="cd-lesson-desc">{leccion.descripcion}</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="cd-lesson-action">
                                          {shouldLockContent ? (
                                            <span className="cd-lesson-lock">⊘</span>
                                          ) : (
                                            <Link
                                              to={withDashboardOrigin(`/course/${curso.id}/module/${modulo.id}?leccion=${leccion.id}`, true)}
                                              className="cd-btn cd-btn-sm"
                                            >
                                              Ir →
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Quiz */}
                              {modulo.quiz && (
                                <div className="cd-quiz-card">
                                  <div className="cd-quiz-info">
                                    <p className="cd-sub-label">Evaluación</p>
                                    <p className="cd-quiz-title">{modulo.quiz.titulo}</p>
                                    <p className="cd-quiz-meta">
                                      {modulo.quiz.preguntas?.length || modulo.quiz.preguntas} preguntas
                                      {' · '}Mínimo {modulo.quiz.puntajeMinimo}%
                                      {' · '}{modulo.quiz.intentos} intentos
                                    </p>
                                  </div>
                                  <div className="cd-quiz-action">
                                    {shouldLockContent ? (
                                      <span className="cd-status-tag cd-status-tag--locked">Bloqueado</span>
                                    ) : !isModuleComplete(modulo.id, modulo.lecciones) ? (
                                      <span className="cd-status-tag cd-status-tag--pending">
                                        Completa las lecciones primero
                                      </span>
                                    ) : (
                                      <Link
                                        to={withDashboardOrigin(`/course/${curso.id}/module/${modulo.id}/quiz`)}
                                        className="cd-btn cd-btn-primary"
                                      >
                                        Comenzar Quiz →
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Module CTA */}
                              {modulo.estado === 'desbloqueado' && !shouldLockContent && (
                                <div className="cd-module-cta">
                                  <Link
                                    to={withDashboardOrigin(`/course/${curso.id}/module/${modulo.id}`)}
                                    className="cd-btn cd-btn-primary"
                                  >
                                    Comenzar Módulo →
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── Right Sidebar ── */}
              <aside className="cd-sidebar">
                <div className="cd-sidebar-card">

                  {/* Stats grid */}
                  <div className="cd-stats-grid">
                    {[
                      { label: 'Nivel', value: curso.nivel },
                      { label: 'Duración', value: curso.duracion },
                      { label: 'Módulos', value: `${curso.totalModulos || curso.modulos_detalle?.length || 0}` },
                      { label: 'Estudiantes', value: (curso.estudiantes || 0).toLocaleString() },
                      {
                        label: 'Calificación',
                        value: curso.calificacion ? `★ ${curso.calificacion}` : '—',
                      },
                      curso.certificado ? { label: 'Certificado', value: '✓ Disponible' } : null,
                    ].filter(Boolean).map((stat) => (
                      <div key={stat.label} className="cd-stat">
                        <p className="cd-stat-label">{stat.label}</p>
                        <p className="cd-stat-value">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="cd-sidebar-divider" />

                  {/* Requisitos */}
                  {curso.requisitos && (
                    <>
                      <div className="cd-sidebar-section">
                        <p className="cd-stat-label">Requisitos</p>
                        <p className="cd-requisitos-text">{curso.requisitos}</p>
                      </div>
                      <div className="cd-sidebar-divider" />
                    </>
                  )}

                  {/* Price + CTA */}
                  <div className="cd-price-block">
                    <div className="cd-price">{priceLabel}</div>
                    <button
                      onClick={handleContinueLearning}
                      disabled={actionLoading || accessLoading}
                      className="cd-btn cd-btn-primary cd-btn-full"
                    >
                      {actionLoading
                        ? 'Procesando...'
                        : shouldLockContent
                        ? 'Comprar y Acceder →'
                        : 'Continuar Aprendiendo →'}
                    </button>
                    {isCourseCompleted && (
                      <p className="cd-completed-note">✦ Has completado este curso</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </main>
        )}

        {/* ── Purchase Modal ── */}
        {purchaseModal && (
          <>
            <div className="cd-modal-overlay" onClick={() => setPurchaseModal(false)} />
            <div className="cd-modal">
              <p className="cd-modal-eyebrow">Acceso al Curso</p>
              <h3 className="cd-modal-title">{curso?.titulo}</h3>
              <p className="cd-modal-desc">
                Confirma el registro de compra para desbloquear todos los módulos y lecciones.
              </p>
              <div className="cd-modal-price">{priceLabel}</div>
              <div className="cd-modal-actions">
                <button onClick={() => setPurchaseModal(false)} className="cd-btn cd-btn-ghost">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={actionLoading}
                  className="cd-btn cd-btn-primary"
                >
                  {actionLoading ? 'Procesando...' : 'Confirmar compra →'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}




export default CourseDetails