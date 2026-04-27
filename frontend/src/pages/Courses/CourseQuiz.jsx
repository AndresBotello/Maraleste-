import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkCourseAccess, getCourseById, submitQuizResult } from '../../services/courseService'
import { useAuth } from '../../context/AuthContext'
import globalStyles from './CourseQuizStyle.js'

function CourseQuiz() {
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromDashboard = searchParams.get('from') === 'dashboard'
  const coursePath = `/course/${courseId}${fromDashboard ? '?from=dashboard' : ''}`
  
  const { isAuthenticated } = useAuth()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [moduloTitulo, setModuloTitulo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [nextModuleEnabled, setNextModuleEnabled] = useState(false)

  // Prevención de salida (mantengo tu lógica)
  useEffect(() => {
    if (loading || showResults) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const handlePopState = (e) => {
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [loading, showResults])

  // Fetch del quiz (sin cambios en lógica)
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true)
        setError(null)

        if (isAuthenticated) {
          const access = await checkCourseAccess(courseId)
          if (access?.acceso?.tipo === 'pago' && !access?.acceso?.disponible) {
            navigate(coursePath, { replace: true })
            return
          }
        }

        const data = await getCourseById(courseId)
        if (!data) { 
          setError('Curso no encontrado'); 
          return 
        }

        if (data?.acceso?.tipo === 'pago' && !data?.acceso?.disponible) {
          navigate(coursePath, { replace: true })
          return
        }

        const mod = (data.modulos_detalle || []).find(m => m.id === moduleId)
        if (!mod) { 
          setError('Módulo no encontrado'); 
          return 
        }
        
        setModuloTitulo(mod.titulo)
        if (!mod.quiz) { 
          setError('Este módulo no tiene quiz'); 
          return 
        }
        setQuiz(mod.quiz)
      } catch (err) {
        console.error('Error al cargar quiz:', err)
        setError('No se pudo cargar el quiz.')
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [courseId, moduleId, isAuthenticated, navigate, coursePath])

  // ── Loading / Error States ─────────────────────────────
  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="cq-loading-screen">
          <div className="cq-loading-inner">
            <div className="cq-spinner" />
            <p className="cq-loading-text">Preparando evaluación</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !quiz) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="cq-loading-screen">
          <div className="cq-empty-state">
            <span className="cq-error-icon">📝</span>
            <h2 className="cq-error-title">{error || 'Quiz no disponible'}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>No pudimos cargar esta evaluación.</p>
            <Link 
              to={coursePath}
              className="cq-btn cq-btn-primary"
              style={{ marginTop: '16px' }}
            >
              ← Volver al curso
            </Link>
          </div>
        </div>
      </>
    )
  }

  const preguntas = quiz.preguntas || []
  const totalPreguntas = preguntas.length

  if (totalPreguntas === 0) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="cq-loading-screen">
          <div className="cq-empty-state">
            <span className="cq-empty-icon">📝</span>
            <h2 className="cq-empty-title">Sin preguntas</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>Este quiz aún no tiene preguntas configuradas.</p>
            <Link to={coursePath} className="cq-btn cq-btn-primary" style={{ marginTop: '16px' }}>
              ← Volver al curso
            </Link>
          </div>
        </div>
      </>
    )
  }

  const preguntaActual = preguntas[currentQuestion]
  const porcentajeProgreso = Math.round(((currentQuestion + 1) / totalPreguntas) * 100)

  const handleAnswerSelect = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalPreguntas - 1) setCurrentQuestion(currentQuestion + 1)
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
  }

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const score = calculateScore()
      const isPassed = score >= (quiz.puntajeMinimo || 70)

      await submitQuizResult(courseId, moduleId, {
        score,
        answers,
        totalPreguntas,
        puntajeMinimo: quiz.puntajeMinimo || 70,
        aprobado: isPassed
      })

      setNextModuleEnabled(isPassed)
      setQuizCompleted(true)
      setShowResults(true)
    } catch (err) {
      console.error('Error al enviar quiz:', err)
      setError('Error al guardar el resultado. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateScore = () => {
    let correctCount = 0
    preguntas.forEach((pregunta, index) => {
      const userAnswer = answers[index]
      if (pregunta.tipo === 'verdadero_falso') {
        if (userAnswer === pregunta.correcta.toString()) correctCount++
      } else {
        const opcionSeleccionada = pregunta.opciones.find(o => o.id === userAnswer)
        if (opcionSeleccionada?.correcta) correctCount++
      }
    })
    return Math.round((correctCount / totalPreguntas) * 100)
  }

  const score = calculateScore()
  const isPassed = score >= (quiz.puntajeMinimo || 70)

  // ====================== RESULTADOS ======================
  if (showResults) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="cq-root">
          {/* Header */}
          <header className="cq-header">
            <div className="cq-header-inner">
              <div className="cq-header-left">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas salir? Tu progreso en este intento se perderá.')) 
                      navigate(coursePath)
                  }}
                  className="cq-nav-link"
                >
                  ← Volver
                </button>
              </div>
              <div className="cq-header-right">
                {fromDashboard && (
                  <button type="button" onClick={() => {
                    if (window.confirm('¿Deseas salir? Tu progreso en este intento se perderá.')) 
                      navigate('/customer/dashboard')
                  }} className="cq-nav-link">
                    Dashboard
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="cq-main">
            <div className="cq-content-area">
              {/* Results Heading */}
              <div className="cq-results-heading">
                <div className="cq-result-emoji">
                  {isPassed ? '🎉' : '📝'}
                </div>
                <h1 className="cq-result-title">
                  {isPassed ? '¡Excelente trabajo!' : 'Intento completado'}
                </h1>
                <p className="cq-result-subtitle">
                  {isPassed 
                    ? 'Has aprobado el módulo y desbloqueado el siguiente contenido.' 
                    : `Necesitas ${((quiz.puntajeMinimo || 70) - score)} puntos más para aprobar.`}
                </p>
              </div>

              {/* Score Card */}
              <div className="cq-score-card">
                <div className="cq-score-value">{score}</div>
                <div className="cq-score-max">/ 100</div>

                <div className="cq-score-bar">
                  <div 
                    className="cq-score-bar-fill"
                    style={{ 
                      width: `${score}%`,
                      background: isPassed ? 'var(--green)' : 'var(--amber)'
                    }}
                  />
                </div>

                <div className="cq-score-stats">
                  <div className="cq-stat">
                    <div className="cq-stat-value">{Object.keys(answers).length}</div>
                    <div className="cq-stat-label">Respondidas</div>
                  </div>
                  <div className="cq-stat">
                    <div className="cq-stat-value" style={{ color: 'var(--green)' }}>
                      {Math.round((score / 100) * totalPreguntas)}
                    </div>
                    <div className="cq-stat-label">Correctas</div>
                  </div>
                  <div className="cq-stat">
                    <div className="cq-stat-value" style={{ color: 'var(--red)' }}>
                      {totalPreguntas - Math.round((score / 100) * totalPreguntas)}
                    </div>
                    <div className="cq-stat-label">Incorrectas</div>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              <div className="cq-review-section">
                <h2 className="cq-review-title">Revisión detallada</h2>
                <div className="cq-review-items">
                  {preguntas.map((pregunta, index) => {
                    const userAnswer = answers[index]
                    const isCorrect = pregunta.tipo === 'verdadero_falso'
                      ? userAnswer === pregunta.correcta.toString()
                      : pregunta.opciones.find(o => o.id === userAnswer)?.correcta

                    return (
                      <div key={pregunta.id} className="cq-review-item">
                        <div className="cq-review-item-header">
                          <div className="cq-review-item-icon">
                            {isCorrect ? '✓' : '✕'}
                          </div>
                          <div>
                            <div className="cq-review-item-number">Pregunta {index + 1}</div>
                          </div>
                        </div>
                        <p className="cq-review-item-text">{pregunta.texto}</p>

                        <div className={`cq-review-answer-block ${isCorrect ? 'cq-review-answer-correct' : 'cq-review-answer-incorrect'}`}>
                          <strong>Tu respuesta:</strong> {
                            pregunta.tipo === 'verdadero_falso'
                              ? (userAnswer === 'true' ? 'Verdadero' : 'Falso')
                              : pregunta.opciones.find(o => o.id === userAnswer)?.texto
                          }
                        </div>

                        {pregunta.explicacion && (
                          <div className="cq-review-explanation">
                            <strong>Explicación:</strong>
                            <p style={{ marginTop: '6px' }}>{pregunta.explicacion}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="cq-actions">
                <Link
                  to={coursePath}
                  className="cq-btn cq-btn-primary"
                >
                  Volver al curso
                </Link>

                {!isPassed && (quiz.intentos || 3) > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestion(0)
                      setAnswers({})
                      setQuizCompleted(false)
                      setShowResults(false)
                    }}
                    className="cq-btn cq-btn-ghost"
                  >
                    Intentar nuevamente
                  </button>
                )}

                {isPassed && nextModuleEnabled && (
                  <button
                    type="button"
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="cq-btn cq-btn-primary green"
                  >
                    Continuar al siguiente módulo →
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  // ====================== QUIZ EN CURSO ======================
  return (
    <>
      <style>{globalStyles}</style>
      <div className="cq-root">
        {/* Header */}
        <header className="cq-header">
          <div className="cq-header-inner">
            <div className="cq-header-left">
              <Link to={coursePath} className="cq-logo">MARALESTE</Link>
              <div className="cq-header-divider" />
              <div className="cq-header-meta">
                <span className="cq-meta-label">Evaluación del módulo</span>
                <span className="cq-meta-title">{quiz.titulo}</span>
              </div>
            </div>
            <div className="cq-header-right">
              {fromDashboard && (
                <button type="button" onClick={() => {
                  if (window.confirm('¿Seguro que quieres salir? Tu progreso se perderá.'))
                    navigate('/customer/dashboard')
                }} className="cq-nav-link">
                  Dashboard
                </button>
              )}
              <button type="button" onClick={() => {
                if (window.confirm('¿Seguro que quieres salir? Tu progreso se perderá.'))
                  navigate(coursePath)
              }} className="cq-nav-link">
                ← Volver
              </button>
            </div>
          </div>
        </header>

        <main className="cq-main">
          <div className="cq-content-area">
            {/* Quiz Info */}
            <div className="cq-quiz-info">
              <h1 className="cq-quiz-title">{quiz.titulo}</h1>
              {quiz.descripcion && (
                <p className="cq-quiz-desc">{quiz.descripcion}</p>
              )}
            </div>

            {/* Progress */}
            <div className="cq-progress-strip">
              <div className="cq-progress-strip-left">
                <div className="cq-progress-bar-wrap">
                  <div 
                    className="cq-progress-bar-fill"
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
                <span className="cq-progress-label">
                  Pregunta {currentQuestion + 1} de {totalPreguntas}
                </span>
              </div>
              <span className="cq-progress-pct">{porcentajeProgreso}%</span>
            </div>

            {/* Question Card */}
            <div className="cq-question-card">
              <h2 className="cq-question-text">
                {preguntaActual.texto}
              </h2>

              <div className="cq-options">
                {preguntaActual.tipo === 'verdadero_falso' ? (
                  <>
                    {['true', 'false'].map((value, idx) => (
                      <label 
                        key={idx}
                        className={`cq-option-label ${answers[currentQuestion] === value ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={value}
                          checked={answers[currentQuestion] === value}
                          onChange={(e) => handleAnswerSelect(e.target.value)}
                          className="cq-option-input"
                        />
                        <span className="cq-option-text">
                          {value === 'true' ? 'Verdadero' : 'Falso'}
                        </span>
                      </label>
                    ))}
                  </>
                ) : (
                  preguntaActual.opciones.map((opcion) => (
                    <label
                      key={opcion.id}
                      className={`cq-option-label ${answers[currentQuestion] === opcion.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={opcion.id}
                        checked={answers[currentQuestion] === opcion.id}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        className="cq-option-input"
                      />
                      <span className="cq-option-text">{opcion.texto}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Question Navigation */}
            <div className="cq-question-nav">
              {preguntas.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentQuestion(index)}
                  className={`cq-question-btn ${
                    currentQuestion === index 
                      ? 'active'
                      : answers[index] 
                        ? 'answered'
                        : ''
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Navigation Bar */}
            <div className="cq-nav-bar">
              <button
                type="button"
                disabled={currentQuestion === 0}
                onClick={handlePreviousQuestion}
                className={`cq-nav-btn ${currentQuestion === 0 ? 'disabled' : ''}`}
              >
                ← Anterior
              </button>

              {currentQuestion === totalPreguntas - 1 ? (
                <button
                  type="button"
                  disabled={submitting || Object.keys(answers).length < totalPreguntas}
                  onClick={handleSubmitQuiz}
                  className="cq-submit-btn"
                >
                  {submitting ? 'Enviando...' : 'Finalizar evaluación'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="cq-nav-btn"
                >
                  Siguiente →
                </button>
              )}
            </div>

            {/* Footer Info */}
            <div className="cq-footer">
              Puntaje mínimo para aprobar: <span className="cq-footer-note">{quiz.puntajeMinimo || 70}%</span> • 
              Intentos disponibles: <span className="cq-footer-note">{quiz.intentos || 3}</span>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default CourseQuiz