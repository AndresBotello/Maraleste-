import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkCourseAccess, getCourseById, submitQuizResult } from '../../services/courseService'
import { useAuth } from '../../context/AuthContext'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">📝</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {error || 'Quiz no disponible'}
          </h2>
          <p className="text-gray-600 mb-8">No pudimos cargar esta evaluación.</p>
          <Link 
            to={coursePath}
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
          >
            ← Volver al curso
          </Link>
        </div>
      </div>
    )
  }

  const preguntas = quiz.preguntas || []
  const totalPreguntas = preguntas.length

  if (totalPreguntas === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">📝</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sin preguntas</h2>
          <p className="text-gray-600 mb-8">Este quiz aún no tiene preguntas configuradas.</p>
          <Link to={coursePath} className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium">
            ← Volver al curso
          </Link>
        </div>
      </div>
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('¿Deseas salir? Tu progreso en este intento se perderá.')) 
                  navigate(coursePath)
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
            >
              ← Volver al curso
            </button>
            {fromDashboard && (
              <button
                onClick={() => {
                  if (window.confirm('¿Deseas salir? Tu progreso en este intento se perderá.')) 
                    navigate('/customer/dashboard')
                }}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Dashboard
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className={`text-7xl mb-6 ${isPassed ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isPassed ? '🎉' : '📝'}
            </div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-3">
              {isPassed ? '¡Excelente trabajo!' : 'Intento completado'}
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              {isPassed 
                ? 'Has aprobado el módulo y desbloqueado el siguiente contenido.' 
                : `Necesitas ${((quiz.puntajeMinimo || 70) - score)} puntos más para aprobar.`}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 mb-12 text-center">
            <div className="mb-8">
              <div className="text-8xl font-light text-gray-900 mb-2">{score}</div>
              <div className="text-2xl text-gray-500 font-medium">/ 100</div>
            </div>

            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-10">
              <div 
                className={`h-full transition-all duration-700 ${isPassed ? 'bg-emerald-600' : 'bg-amber-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-semibold text-gray-900">{Object.keys(answers).length}</div>
                <div className="text-sm text-gray-500 mt-1">Respondidas</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-emerald-600">
                  {Math.round((score / 100) * totalPreguntas)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Correctas</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-red-600">
                  {totalPreguntas - Math.round((score / 100) * totalPreguntas)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Incorrectas</div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Revisión detallada</h2>
            <div className="space-y-8">
              {preguntas.map((pregunta, index) => {
                const userAnswer = answers[index]
                const isCorrect = pregunta.tipo === 'verdadero_falso'
                  ? userAnswer === pregunta.correcta.toString()
                  : pregunta.opciones.find(o => o.id === userAnswer)?.correcta

                return (
                  <div key={pregunta.id} className="bg-white rounded-2xl border border-gray-200 p-8">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 text-2xl ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isCorrect ? '✓' : '✕'}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-900 mb-6">{pregunta.texto}</p>

                        <div className={`p-5 rounded-xl mb-6 text-sm ${isCorrect 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'}`}>
                          <strong>Tu respuesta:</strong> {
                            pregunta.tipo === 'verdadero_falso'
                              ? (userAnswer === 'true' ? 'Verdadero' : 'Falso')
                              : pregunta.opciones.find(o => o.id === userAnswer)?.texto
                          }
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-sm">
                          <strong className="text-blue-900">Explicación:</strong>
                          <p className="text-blue-800 mt-1">{pregunta.explicacion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={coursePath}
              className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition text-center"
            >
              Volver al curso
            </Link>

            {!isPassed && (quiz.intentos || 3) > 1 && (
              <button
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers({})
                  setQuizCompleted(false)
                  setShowResults(false)
                }}
                className="px-10 py-4 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-100 transition"
              >
                Intentar nuevamente
              </button>
            )}

            {isPassed && nextModuleEnabled && (
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition"
              >
                Continuar al siguiente módulo →
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  // ====================== QUIZ EN CURSO ======================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que quieres salir? Tu progreso en este intento se perderá.'))
                navigate(coursePath)
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
          >
            ← Volver al curso
          </button>
          {fromDashboard && (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que quieres salir? Tu progreso en este intento se perderá.'))
                  navigate('/customer/dashboard')
              }}
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Dashboard
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Quiz Info */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">{quiz.titulo}</h1>
          <p className="text-gray-600 text-lg">{quiz.descripcion}</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-gray-700">
              Pregunta {currentQuestion + 1} de {totalPreguntas}
            </span>
            <span className="text-sm text-gray-500 font-medium">{porcentajeProgreso}% completado</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-300"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 mb-10">
          <h2 className="text-2xl leading-relaxed text-gray-900 font-medium mb-10">
            {preguntaActual.texto}
          </h2>

          <div className="space-y-4">
            {preguntaActual.tipo === 'verdadero_falso' ? (
              <>
                {['true', 'false'].map((value, idx) => (
                  <label 
                    key={idx}
                    className={`flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all hover:border-gray-300 ${answers[currentQuestion] === value ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={value}
                      checked={answers[currentQuestion] === value}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      className="w-5 h-5 accent-gray-900"
                    />
                    <span className="text-lg font-medium text-gray-800">
                      {value === 'true' ? 'Verdadero' : 'Falso'}
                    </span>
                  </label>
                ))}
              </>
            ) : (
              preguntaActual.opciones.map((opcion) => (
                <label
                  key={opcion.id}
                  className={`flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all hover:border-gray-300 ${answers[currentQuestion] === opcion.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={opcion.id}
                    checked={answers[currentQuestion] === opcion.id}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-5 h-5 accent-gray-900"
                  />
                  <span className="text-lg font-medium text-gray-800">{opcion.texto}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <button
            disabled={currentQuestion === 0}
            onClick={handlePreviousQuestion}
            className="px-8 py-4 border border-gray-300 rounded-2xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
          >
            ← Anterior
          </button>

          <div className="flex gap-3 flex-wrap justify-center">
            {preguntas.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-11 h-11 rounded-2xl font-medium transition-all flex items-center justify-center text-sm
                  ${currentQuestion === index 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : answers[index] 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-white border border-gray-200 hover:border-gray-400 text-gray-700'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === totalPreguntas - 1 ? (
            <button
              disabled={submitting || Object.keys(answers).length < totalPreguntas}
              onClick={handleSubmitQuiz}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-medium transition disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Finalizar evaluación'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-10 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-medium transition"
            >
              Siguiente →
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          Puntaje mínimo para aprobar: <span className="font-medium text-gray-700">{quiz.puntajeMinimo || 70}%</span> • 
          Intentos disponibles: <span className="font-medium text-gray-700">{quiz.intentos || 3}</span>
        </div>
      </main>
    </div>
  )
}

export default CourseQuiz