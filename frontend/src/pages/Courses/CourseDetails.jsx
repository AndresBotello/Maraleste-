import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCourseById, getCourseProgress, registerCourseAccess } from '../../services/courseService'
import { useAuth } from '../../context/AuthContext'

function parseResources(resourceText = '') {
  return String(resourceText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function isUrl(value = '') {
  return /^https?:\/\//i.test(value)
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
        }
      } catch {
        if (isMounted) setCourseProgress(0)
      } finally {
        if (isMounted) setProgressLoading(false)
      }
    }

    fetchProgress()

    return () => {
      isMounted = false
    }
  }, [courseId, isAuthenticated, hasAccess])

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
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (isPaidCourse && !hasAccess) {
      setPurchaseModal(true)
      return
    }

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

  const progresoCurso = courseProgress

  return (
    <div className="bg-[#f2f2f0] text-[#1a1a1a] min-h-screen">
      {/* Header */}
      <header className="border-b border-black/5 sticky top-0 bg-[#f2f2f0]/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
          <Link to="/courses" className="text-lg md:text-xl font-light tracking-[0.3em] md:tracking-[0.4em] text-black hover:text-gray-600 transition">
            MARALESTE
          </Link>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
            {fromDashboard && (
              <Link to="/customer/dashboard" className="text-xs md:text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">
                Dashboard
              </Link>
            )}
            <Link to="/courses" className="text-xs md:text-sm uppercase tracking-wider text-gray-500 hover:text-black transition">
              ← Volver al Catálogo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 md:py-32">
            <svg className="w-8 md:w-10 h-8 md:h-10 animate-spin text-black mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs md:text-sm text-gray-500 font-light">Cargando curso...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 md:py-32">
            <div className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-6 md:mb-8 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 md:w-12 h-8 md:h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-2xl font-medium text-black mb-3 md:mb-4">{error}</h3>
            <Link to="/courses" className="px-4 md:px-8 py-2 md:py-4 bg-black text-white text-xs md:text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all">
              Volver al Catálogo
            </Link>
          </div>
        )}

        {/* Course Content */}
        {!loading && curso && (
        <>
        {/* Hero Section */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-12 mb-8 md:mb-12 lg:mb-16">
          {/* Left Content */}
          <div className="md:col-span-2">
            {/* Title and Instructor */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-2 md:mb-3 lg:mb-4 tracking-tight text-black">
              {curso.titulo}
            </h1>
            <p className="text-xs md:text-sm lg:text-lg text-gray-500 font-light mb-4 md:mb-6">
              Por {curso.instructor}
            </p>

            {/* Image */}
            <div className="h-32 md:h-48 lg:h-64 mb-4 md:mb-6 lg:mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 shadow-lg flex items-center justify-center">
              {curso.imagenPortada ? (
                <img src={curso.imagenPortada} alt={curso.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-700 px-4">
                  <div className="text-3xl md:text-5xl mb-2 md:mb-4">🎨</div>
                  <p className="text-sm md:text-lg font-light">{curso.titulo}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Imagen del Curso</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6 md:mb-8 lg:mb-12">
              <h2 className="text-lg md:text-xl lg:text-2xl font-light mb-2 md:mb-3 lg:mb-4 text-black">Acerca de este curso</h2>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 font-light leading-relaxed whitespace-pre-line">
                {curso.descripcionLarga || curso.descripcion}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 md:mb-12 lg:mb-12">
              <h3 className="text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 md:mb-3 lg:mb-4">Tu Progreso</h3>
              <div className="w-full bg-black/10 rounded-full h-2 md:h-3">
                <div
                  className="bg-black h-2 md:h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, progresoCurso)}%` }}
                ></div>
              </div>
              <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 mt-2 font-light">
                {isCourseCompleted ? 'Completado' : `${progresoCurso}% completado`}
              </p>
              {progressLoading && (
                <p className="text-[9px] md:text-xs text-gray-400 mt-1 font-light">Actualizando progreso...</p>
              )}
            </div>

            {/* Modules Section */}
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-light mb-4 md:mb-6 tracking-tight text-black">Módulos del Curso</h2>

              {shouldLockContent && (
                <div className="mb-4 md:mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-3 md:px-4 lg:px-5 py-2 md:py-3 lg:py-4 text-xs md:text-sm text-amber-800">
                  Este es un curso de pago. El contenido completo se habilita cuando registras la compra.
                </div>
              )}

              <div className="space-y-3 md:space-y-4">
                {(curso.modulos_detalle || []).map((modulo) => (
                  <div key={modulo.id} className="bg-white/70 rounded-3xl border border-black/10 shadow-lg">
                    {/* Module Header */}
                    <button
                      onClick={() => setExpandedModule(expandedModule === modulo.id ? null : modulo.id)}
                      className="w-full p-3 md:p-4 lg:p-6 flex justify-between items-start md:items-center gap-3 md:gap-4 hover:bg-white/80 transition rounded-3xl"
                    >
                      <div className="flex items-start gap-2 md:gap-3 lg:gap-4 flex-1 text-left min-w-0">
                        <span className="text-2xl md:text-3xl flex-shrink-0">{modulo.icono}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[9px] md:text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Módulo {modulo.numero}
                            </span>
                            {modulo.estado === 'bloqueado' && (
                              <span className="text-[8px] md:text-[9px] lg:text-xs px-2 py-1 bg-black/10 text-gray-600 rounded-lg font-medium">
                                🔒 Bloqueado
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm md:text-base lg:text-lg font-light text-black mb-1 truncate">{modulo.titulo}</h3>
                          <p className="text-xs md:text-sm text-gray-500 font-light line-clamp-2">{modulo.descripcion}</p>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-[9px] md:text-xs lg:text-sm text-gray-500 font-light mb-2">⏱️ {modulo.duracion}</p>
                        <span className="text-gray-500">
                          {expandedModule === modulo.id ? '▼' : '▶'}
                        </span>
                      </div>
                    </button>

                    {/* Module Content */}
                    {expandedModule === modulo.id && (
                      <div className="border-t border-black/10 p-3 md:p-4 lg:p-6 bg-white/50">
                        {/* Lessons */}
                        <div className="mb-4 md:mb-6">
                          <h4 className="text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 md:mb-3 lg:mb-4">
                            Lecciones ({modulo.lecciones.length})
                          </h4>
                          <div className="space-y-2 md:space-y-3 lg:space-y-4">
                            {modulo.lecciones.map((leccion) => (
                              <div 
                                key={leccion.id} 
                                className={`rounded-2xl border transition overflow-hidden ${
                                  shouldLockContent 
                                    ? 'border-black/5 bg-white/50' 
                                    : 'border-black/10 bg-white hover:shadow-lg'
                                }`}
                              >
                                {/* Header de la lección */}
                                <div className="p-3 md:p-4 lg:p-5 border-b border-black/5">
                                  <div className="flex items-start justify-between gap-2 md:gap-3 mb-2 md:mb-3">
                                    <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                                      <span className="text-lg md:text-2xl flex-shrink-0 mt-0.5">
                                        {leccion.tipo === 'video' ? '▶️' : leccion.tipo === 'lectura' ? '📖' : '📥'}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-sm md:text-base lg:text-lg font-light text-black mb-1 break-words">{leccion.titulo}</h5>
                                        {leccion.duracion && (
                                          <p className="text-[9px] md:text-xs lg:text-xs text-gray-500">⏱ {leccion.duracion}</p>
                                        )}
                                      </div>
                                    </div>
                                    {shouldLockContent ? (
                                      <span className="text-[8px] md:text-[9px] lg:text-xs uppercase tracking-wider text-gray-400 font-medium px-2 md:px-3 py-1 bg-black/5 rounded-lg flex-shrink-0">
                                        🔒 Bloqueado
                                      </span>
                                    ) : (
                                      <Link
                                        to={withDashboardOrigin(`/course/${curso.id}/module/${modulo.id}?leccion=${leccion.id}`, true)}
                                        className="text-[8px] md:text-[9px] lg:text-xs uppercase tracking-wider text-white bg-black hover:bg-gray-800 transition font-medium px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-2 rounded-lg flex-shrink-0 whitespace-nowrap"
                                      >
                                        Ir a Lección
                                      </Link>
                                    )}
                                  </div>
                                  
                                  {/* Descripción breve */}
                                  {leccion.descripcion && (
                                    <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 font-light line-clamp-2">{leccion.descripcion}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quiz */}
                        {modulo.quiz && (
                          <div className="mb-4 md:mb-6">
                            <h4 className="text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 md:mb-3 lg:mb-4">
                              Evaluación
                            </h4>
                            <div className="p-3 md:p-4 lg:p-5 bg-black/5 rounded-lg border border-black/20">
                              <div className="flex justify-between items-start mb-2 md:mb-3 flex-col md:flex-row gap-2 md:gap-0">
                                <div className="min-w-0">
                                  <p className="text-[10px] md:text-xs lg:text-sm font-light text-black mb-1 break-words">📝 {modulo.quiz.titulo}</p>
                                  <p className="text-[9px] md:text-xs text-gray-500 font-light">
                                    {modulo.quiz.preguntas?.length || modulo.quiz.preguntas} preguntas • Puntaje mínimo: {modulo.quiz.puntajeMinimo}% • {modulo.quiz.intentos} intentos
                                  </p>
                                </div>
                              </div>
                              {shouldLockContent ? (
                                <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-black/10 text-gray-500 text-[8px] md:text-[9px] lg:text-xs uppercase tracking-wider font-medium rounded-lg">
                                  Quiz bloqueado
                                </span>
                              ) : (
                                <Link
                                  to={withDashboardOrigin(`/course/${curso.id}/module/${modulo.id}/quiz`)}
                                  className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-black text-white text-[8px] md:text-[9px] lg:text-xs uppercase tracking-wider font-medium rounded-lg hover:bg-gray-800 transition"
                                >
                                  Comenzar Quiz
                                </Link>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {modulo.estado === 'desbloqueado' && !shouldLockContent && (
                          <div className="mt-4 md:mt-6 lg:mt-6">
                            <Link
                              to={withDashboardOrigin(`/course/${curso.id}/module/${modulo.id}`)}
                              className="inline-block px-4 md:px-6 py-2 md:py-3 lg:py-3 bg-black text-white text-[10px] md:text-xs lg:text-sm uppercase tracking-wider font-medium rounded-xl hover:bg-gray-800 transition shadow-lg"
                            >
                              📚 Comenzar Módulo
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg shadow-black/8 border border-black/10 md:sticky md:top-24">
              {/* Stats */}
              <div className="space-y-4 md:space-y-5 lg:space-y-6 mb-4 md:mb-6 lg:mb-8">
                <div>
                  <p className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 md:mb-2">Nivel</p>
                  <p className="text-base md:text-lg font-light text-black">{curso.nivel}</p>
                </div>

                <div>
                  <p className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 md:mb-2">Duración</p>
                  <p className="text-base md:text-lg font-light text-black">{curso.duracion}</p>
                </div>

                <div>
                  <p className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 md:mb-2">Módulos</p>
                  <p className="text-base md:text-lg font-light text-black">{curso.totalModulos || curso.modulos_detalle?.length || 0} módulos</p>
                </div>

                <div>
                  <p className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 md:mb-2">Estudiantes</p>
                  <p className="text-base md:text-lg font-light text-black">{(curso.estudiantes || 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 md:mb-2">Calificación</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg text-yellow-500">★</span>
                    <span className="text-base md:text-lg font-light text-black">{curso.calificacion || '—'}</span>
                  </div>
                </div>

                {curso.certificado && (
                  <div>
                    <p className="text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 md:mb-2">Certificado</p>
                    <p className="text-base md:text-lg font-light text-black">✓ Disponible</p>
                  </div>
                )}
              </div>

              <hr className="border-black/10 mb-4 md:mb-6 lg:mb-8" />

              {/* Requisitos */}
              <div className="mb-4 md:mb-6 lg:mb-8">
                <h4 className="text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 md:mb-3">Requisitos</h4>
                <p className="text-xs md:text-sm font-light text-gray-600 line-clamp-3">{curso.requisitos || 'Ninguno'}</p>
              </div>

              {/* Price and Button */}
              <div className="space-y-3 md:space-y-4">
                <div className="text-2xl md:text-3xl font-light text-black">
                  {priceLabel}
                </div>
                <button
                  onClick={handleContinueLearning}
                  disabled={actionLoading || accessLoading}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 lg:py-4 bg-black text-white text-xs md:text-sm uppercase tracking-wider font-medium rounded-xl hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
                >
                  {actionLoading
                    ? 'Procesando...'
                    : shouldLockContent
                    ? 'Comprar y Acceder'
                    : 'Continuar Aprendiendo'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Purchase Modal */}
      {purchaseModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setPurchaseModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl z-50 w-11/12 md:w-96 border border-black/20 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl md:text-2xl font-light text-black mb-3 md:mb-4">Acceso al Curso</h3>
            <p className="text-xs md:text-sm text-gray-600 font-light mb-4 md:mb-6">
              Para este curso de pago, confirma el registro de compra para desbloquear módulos y lecciones.
            </p>
            <p className="text-xl md:text-2xl font-light text-black mb-4 md:mb-6">{priceLabel}</p>
            <div className="flex gap-2 md:gap-4 flex-col md:flex-row">
              <button
                onClick={() => setPurchaseModal(false)}
                className="flex-1 px-4 py-2 md:py-3 border border-black/30 text-black text-xs md:text-sm rounded-xl hover:bg-black/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 md:py-3 bg-black text-white text-xs md:text-sm rounded-xl hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CourseDetails
