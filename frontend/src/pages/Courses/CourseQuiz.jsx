import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkCourseAccess, getCourseById } from '../../services/courseService'
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
        if (!data) { setError('Curso no encontrado'); return }

        if (data?.acceso?.tipo === 'pago' && !data?.acceso?.disponible) {
          navigate(coursePath, { replace: true })
          return
        }

        const mod = (data.modulos_detalle || []).find(m => m.id === moduleId)
        if (!mod) { setError('Módulo no encontrado'); return }
        setModuloTitulo(mod.titulo)
        if (!mod.quiz) { setError('Este módulo no tiene quiz'); return }
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

  // ── Loading / Error ─────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#f2f2f0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-black mb-4 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 font-light">Cargando quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="bg-[#f2f2f0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-6">📝</div>
          <h2 className="text-2xl font-light text-black mb-4">{error || 'Quiz no disponible'}</h2>
          <Link to={coursePath} className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition">
            Volver al Curso
          </Link>
        </div>
      </div>
    )
  }

  const preguntas = quiz.preguntas || []
  const totalPreguntas = preguntas.length

  if (totalPreguntas === 0) {
    return (
      <div className="bg-[#f2f2f0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-6">📝</div>
          <h2 className="text-2xl font-light text-black mb-4">Este quiz no tiene preguntas aún</h2>
          <Link to={coursePath} className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition">
            Volver al Curso
          </Link>
        </div>
      </div>
    )
  }

  const preguntaActual = preguntas[currentQuestion]
  const porcentajeProgreso = Math.round(((currentQuestion + 1) / totalPreguntas) * 100)

  const handleAnswerSelect = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalPreguntas - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = () => {
    setQuizCompleted(true)
    setShowResults(true)
  }

  const calculateScore = () => {
    let correctCount = 0
    preguntas.forEach((pregunta, index) => {
      const userAnswer = answers[index]
      if (pregunta.tipo === 'verdadero_falso') {
        if (userAnswer === pregunta.correcta.toString()) {
          correctCount++
        }
      } else {
        const opcionSeleccionada = pregunta.opciones.find(o => o.id === userAnswer)
        if (opcionSeleccionada?.correcta) {
          correctCount++
        }
      }
    })
    return Math.round((correctCount / totalPreguntas) * 100)
  }

  const score = calculateScore()
  const isPassed = score >= (quiz.puntajeMinimo || 70)

  if (showResults) {
    return (
      <div className="bg-[#f5ede3] text-[#3d2817] min-h-screen">
        {/* Header */}
        <header className="border-b border-[#8b6f47]/10 bg-[#f5ede3]/95 backdrop-blur-md z-40">
          <div className="max-w-3xl mx-auto px-8 py-6 flex items-center justify-between">
            <Link to={coursePath} className="text-sm uppercase tracking-wider text-[#8b6f47] hover:text-[#3d2817] transition">
              ← Volver al Curso
            </Link>
            {fromDashboard && (
              <button
                type="button"
                onClick={() => navigate('/customer/dashboard')}
                className="text-sm uppercase tracking-wider text-[#8b6f47] hover:text-[#3d2817] transition"
              >
                Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Results */}
        <main className="max-w-3xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <div className={`inline-block text-6xl mb-6 ${isPassed ? '😊' : '😌'}`}>
            </div>
            <h1 className="text-4xl font-light text-[#3d2817] mb-4">
              {isPassed ? '¡Felicidades!' : 'Buen intento'}
            </h1>
            <p className="text-xl text-[#8b6f47] font-light mb-8">
              {isPassed ? 'Has aprobado el quiz y desbloqueado el siguiente módulo.' : 'Necesitas ' + ((quiz.puntajeMinimo || 70) - score) + ' puntos más para aprobar.'}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-[#fef9f3] rounded-sm p-12 shadow-md shadow-[#8b6f47]/10 border border-[#8b6f47]/10 mb-12 text-center">
            <h2 className="text-xl font-semibold uppercase tracking-wider text-[#8b6f47] mb-8">Tu Puntuación</h2>
            <div className="mb-8">
              <div className="text-7xl font-light text-[#8b6f47] mb-4">{score}%</div>
              <div className="w-64 mx-auto bg-[#e8dccf] rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${isPassed ? 'bg-green-600' : 'bg-orange-500'}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <p className="text-3xl font-light text-[#8b6f47] mb-2">{Object.keys(answers).length}</p>
                <p className="text-sm text-[#8b6f47] font-light">Respondidas</p>
              </div>
              <div>
                <p className="text-3xl font-light text-green-600 mb-2">{Math.round((score / 100) * totalPreguntas)}</p>
                <p className="text-sm text-[#8b6f47] font-light">Correctas</p>
              </div>
              <div>
                <p className="text-3xl font-light text-red-600 mb-2">{totalPreguntas - Math.round((score / 100) * totalPreguntas)}</p>
                <p className="text-sm text-[#8b6f47] font-light">Incorrectas</p>
              </div>
            </div>
          </div>

          {/* Review Answers */}
          <div className="mb-12">
            <h2 className="text-2xl font-light text-[#3d2817] mb-8">Revisión de Respuestas</h2>
            <div className="space-y-6">
              {preguntas.map((pregunta, index) => {
                const userAnswer = answers[index]
                let isCorrect = false
                if (pregunta.tipo === 'verdadero_falso') {
                  isCorrect = userAnswer === pregunta.correcta.toString()
                } else {
                  const opcion = pregunta.opciones.find(o => o.id === userAnswer)
                  isCorrect = opcion?.correcta
                }

                return (
                  <div key={pregunta.id} className={`p-6 rounded-sm border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex gap-3 mb-4">
                      <span className="text-2xl">{isCorrect ? '✓' : '✗'}</span>
                      <div className="flex-1">
                        <p className="font-light text-[#3d2817] mb-3">{pregunta.texto}</p>
                        <div className={`text-sm font-light p-3 rounded mb-3 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <strong>Tu respuesta: </strong>
                          {pregunta.tipo === 'verdadero_falso'
                            ? (userAnswer === 'true' ? 'Verdadero' : 'Falso')
                            : pregunta.opciones.find(o => o.id === userAnswer)?.texto}
                        </div>
                        <div className="bg-blue-100 text-blue-800 p-3 rounded text-sm font-light">
                          <strong>Explicación: </strong>{pregunta.explicacion}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              to={`/course/${courseId}`}
              className="px-8 py-4 bg-[#8b6f47] text-white text-sm uppercase tracking-wider font-medium rounded hover:bg-[#6b5637] transition"
            >
              Volver al Curso
            </Link>
            {!isPassed && (quiz.intentos || 3) > 1 && (
              <button
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers({})
                  setQuizCompleted(false)
                  setShowResults(false)
                }}
                className="px-8 py-4 border border-[#8b6f47] text-[#3d2817] text-sm uppercase tracking-wider font-medium rounded hover:bg-[#8b6f47] hover:text-white transition"
              >
                Intentar de Nuevo
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-[#f5ede3] text-[#3d2817] min-h-screen">
      {/* Header */}
      <header className="border-b border-[#8b6f47]/10 bg-[#f5ede3]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link to={`/course/${courseId}`} className="text-sm uppercase tracking-wider text-[#8b6f47] hover:text-[#3d2817] transition">
            ← Volver al Curso
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-8 py-12">
        {/* Quiz Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-[#3d2817] mb-4">{quiz.titulo}</h1>
          <p className="text-lg text-[#8b6f47] font-light mb-6">{quiz.descripcion}</p>

          {/* Progress Bar */}
          <div className="bg-[#fef9f3] rounded-sm p-6 border border-[#8b6f47]/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#8b6f47]">
                Pregunta {currentQuestion + 1} de {totalPreguntas}
              </span>
              <span className="text-sm text-[#8b6f47] font-light">{porcentajeProgreso}%</span>
            </div>
            <div className="w-full bg-[#e8dccf] rounded-full h-2">
              <div
                className="bg-[#8b6f47] h-2 rounded-full transition-all"
                style={{ width: `${porcentajeProgreso}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-[#fef9f3] rounded-sm p-8 shadow-md shadow-[#8b6f47]/10 border border-[#8b6f47]/10 mb-8">
          {/* Question Text */}
          <h2 className="text-2xl font-light text-[#3d2817] mb-8">{preguntaActual.texto}</h2>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {preguntaActual.tipo === 'verdadero_falso' ? (
              <>
                <label className="flex items-center p-4 border-2 border-[#8b6f47]/20 rounded-sm cursor-pointer hover:bg-[#f5ede3] transition group">
                  <input
                    type="radio"
                    name="answer"
                    value="true"
                    checked={answers[currentQuestion] === 'true'}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-5 h-5 accent-[#8b6f47]"
                  />
                  <span className="ml-4 text-lg font-light text-[#3d2817] group-hover:text-[#8b6f47]">Verdadero</span>
                </label>
                <label className="flex items-center p-4 border-2 border-[#8b6f47]/20 rounded-sm cursor-pointer hover:bg-[#f5ede3] transition group">
                  <input
                    type="radio"
                    name="answer"
                    value="false"
                    checked={answers[currentQuestion] === 'false'}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-5 h-5 accent-[#8b6f47]"
                  />
                  <span className="ml-4 text-lg font-light text-[#3d2817] group-hover:text-[#8b6f47]">Falso</span>
                </label>
              </>
            ) : (
              preguntaActual.opciones.map((opcion) => (
                <label
                  key={opcion.id}
                  className="flex items-center p-4 border-2 border-[#8b6f47]/20 rounded-sm cursor-pointer hover:bg-[#f5ede3] transition group"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={opcion.id}
                    checked={answers[currentQuestion] === opcion.id}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-5 h-5 accent-[#8b6f47]"
                  />
                  <span className="ml-4 text-lg font-light text-[#3d2817] group-hover:text-[#8b6f47]">{opcion.texto}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4 mb-12">
          <button
            disabled={currentQuestion === 0}
            onClick={handlePreviousQuestion}
            className={`px-6 py-3 rounded-sm text-sm uppercase tracking-wider font-medium transition ${
              currentQuestion === 0
                ? 'opacity-50 cursor-not-allowed border border-[#8b6f47]/30 text-[#8b6f47]'
                : 'border border-[#8b6f47]/30 text-[#3d2817] hover:bg-[#8b6f47] hover:text-white'
            }`}
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
            {preguntas.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-sm font-light text-sm transition ${
                  currentQuestion === index
                    ? 'bg-[#8b6f47] text-white'
                    : answers[index]
                    ? 'bg-green-500 text-white'
                    : 'bg-[#e8dccf] text-[#3d2817] hover:bg-[#8b6f47] hover:text-white'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === totalPreguntas - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-3 bg-green-600 text-white rounded-sm text-sm uppercase tracking-wider font-medium hover:bg-green-700 transition"
            >
              Enviar Quiz
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 border border-[#8b6f47]/30 text-[#3d2817] rounded-sm text-sm uppercase tracking-wider font-medium hover:bg-[#8b6f47] hover:text-white transition"
            >
              Siguiente →
            </button>
          )}
        </div>

        {/* Quiz Info */}
        <div className="bg-blue-50 border border-blue-300 rounded-sm p-4 text-sm font-light text-blue-900">
          <strong>Información del Quiz:</strong> Puntaje mínimo para aprobar: {quiz.puntajeMinimo || 70}% • Intentos disponibles: {quiz.intentos || 3}
        </div>
      </main>
    </div>
  )
}

export default CourseQuiz
