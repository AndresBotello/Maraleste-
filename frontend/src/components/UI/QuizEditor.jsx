import { useState } from 'react'

function QuizEditor({ quiz, onChange }) {
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  // Actualizar config general del quiz
  const updateConfig = (field, value) => {
    onChange({ ...quiz, [field]: value })
  }

  // --- Preguntas ---
  const addQuestion = (tipo = 'opcion_multiple') => {
    const nuevaPregunta = {
      id: Date.now(),
      texto: '',
      tipo,
      explicacion: '',
      ...(tipo === 'opcion_multiple'
        ? {
            opciones: [
              { id: `${Date.now()}-a`, texto: '', correcta: false },
              { id: `${Date.now()}-b`, texto: '', correcta: false },
              { id: `${Date.now()}-c`, texto: '', correcta: false },
              { id: `${Date.now()}-d`, texto: '', correcta: false }
            ]
          }
        : {
            correcta: false // para verdadero/falso
          }
      )
    }
    const updatedPreguntas = [...quiz.preguntas, nuevaPregunta]
    onChange({ ...quiz, preguntas: updatedPreguntas })
    setExpandedQuestion(nuevaPregunta.id)
  }

  const updateQuestion = (questionId, field, value) => {
    const updated = quiz.preguntas.map(p =>
      p.id === questionId ? { ...p, [field]: value } : p
    )
    onChange({ ...quiz, preguntas: updated })
  }

  const removeQuestion = (questionId) => {
    const updated = quiz.preguntas.filter(p => p.id !== questionId)
    onChange({ ...quiz, preguntas: updated })
    if (expandedQuestion === questionId) setExpandedQuestion(null)
  }

  const duplicateQuestion = (questionId) => {
    const original = quiz.preguntas.find(p => p.id === questionId)
    if (!original) return
    const duplicada = {
      ...JSON.parse(JSON.stringify(original)),
      id: Date.now(),
      texto: `${original.texto} (copia)`
    }
    // Reasignar IDs a opciones si existen
    if (duplicada.opciones) {
      duplicada.opciones = duplicada.opciones.map((o, i) => ({ ...o, id: `${Date.now()}-${i}` }))
    }
    const index = quiz.preguntas.findIndex(p => p.id === questionId)
    const updated = [...quiz.preguntas]
    updated.splice(index + 1, 0, duplicada)
    onChange({ ...quiz, preguntas: updated })
  }

  // --- Opciones de opción múltiple ---
  const updateOption = (questionId, optionId, field, value) => {
    const updated = quiz.preguntas.map(p => {
      if (p.id === questionId) {
        return {
          ...p,
          opciones: p.opciones.map(o => {
            if (field === 'correcta' && o.id === optionId) {
              // Solo una opción puede ser correcta
              return { ...o, correcta: true }
            } else if (field === 'correcta') {
              return { ...o, correcta: false }
            }
            return o.id === optionId ? { ...o, [field]: value } : o
          })
        }
      }
      return p
    })
    onChange({ ...quiz, preguntas: updated })
  }

  const addOption = (questionId) => {
    const updated = quiz.preguntas.map(p => {
      if (p.id === questionId && p.opciones.length < 6) {
        return {
          ...p,
          opciones: [...p.opciones, { id: `${Date.now()}-new`, texto: '', correcta: false }]
        }
      }
      return p
    })
    onChange({ ...quiz, preguntas: updated })
  }

  const removeOption = (questionId, optionId) => {
    const updated = quiz.preguntas.map(p => {
      if (p.id === questionId && p.opciones.length > 2) {
        return {
          ...p,
          opciones: p.opciones.filter(o => o.id !== optionId)
        }
      }
      return p
    })
    onChange({ ...quiz, preguntas: updated })
  }

  // Mover pregunta arriba/abajo
  const moveQuestion = (questionId, direction) => {
    const index = quiz.preguntas.findIndex(p => p.id === questionId)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === quiz.preguntas.length - 1)) return
    const updated = [...quiz.preguntas]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    onChange({ ...quiz, preguntas: updated })
  }

  const totalPreguntas = quiz.preguntas.length
  const preguntasCompletas = quiz.preguntas.filter(p => {
    if (!p.texto) return false
    if (p.tipo === 'opcion_multiple') {
      return p.opciones.some(o => o.correcta) && p.opciones.every(o => o.texto)
    }
    return true
  }).length

  return (
    <div className="space-y-4">
      {/* Configuración general del quiz */}
      <div className="p-5 bg-white rounded-xl border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-semibold">
            Configuración del Quiz
          </h5>
          <span className="text-[10px] text-gray-400">
            {preguntasCompletas}/{totalPreguntas} preguntas completas
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
              Título
            </label>
            <input
              type="text"
              value={quiz.titulo}
              onChange={(e) => updateConfig('titulo', e.target.value)}
              placeholder="Título del quiz"
              className="w-full px-3 py-2 border border-black/5 rounded-lg text-sm font-light focus:outline-none focus:border-black transition"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
              Puntaje Mínimo (%)
            </label>
            <input
              type="number"
              value={quiz.puntajeMinimo}
              onChange={(e) => updateConfig('puntajeMinimo', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-black/5 rounded-lg text-sm font-light focus:outline-none focus:border-black transition text-center"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
              Intentos
            </label>
            <input
              type="number"
              value={quiz.intentos}
              onChange={(e) => updateConfig('intentos', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-black/5 rounded-lg text-sm font-light focus:outline-none focus:border-black transition text-center"
            />
          </div>
        </div>

        {/* Barra de progreso */}
        {totalPreguntas > 0 && (
          <div>
            <div className="w-full bg-black/5 rounded-full h-1.5">
              <div
                className="bg-black h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalPreguntas > 0 ? (preguntasCompletas / totalPreguntas) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de preguntas */}
      {quiz.preguntas.map((pregunta, index) => (
        <div
          key={pregunta.id}
          className={`bg-white rounded-xl border overflow-hidden transition-all ${
            expandedQuestion === pregunta.id ? 'border-black/20 shadow-md' : 'border-black/5'
          }`}
        >
          {/* Header pregunta */}
          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition"
            onClick={() => setExpandedQuestion(expandedQuestion === pregunta.id ? null : pregunta.id)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveQuestion(pregunta.id, 'up') }}
                  className={`p-0.5 rounded text-gray-400 hover:text-black transition ${index === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <span className="text-xs font-semibold text-gray-400 w-5 text-center">{index + 1}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveQuestion(pregunta.id, 'down') }}
                  className={`p-0.5 rounded text-gray-400 hover:text-black transition ${index === totalPreguntas - 1 ? 'opacity-30 pointer-events-none' : ''}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                    pregunta.tipo === 'opcion_multiple'
                      ? 'bg-black/5 text-gray-500'
                      : 'bg-black/5 text-gray-500'
                  }`}>
                    {pregunta.tipo === 'opcion_multiple' ? 'Opción Múltiple' : 'V / F'}
                  </span>
                  {/* Estado de completitud */}
                  {pregunta.texto && (
                    pregunta.tipo === 'opcion_multiple'
                      ? pregunta.opciones.some(o => o.correcta) && pregunta.opciones.every(o => o.texto)
                        ? <span className="text-[9px] text-green-600 font-medium">✓ Completa</span>
                        : <span className="text-[9px] text-orange-500 font-medium">⚠ Incompleta</span>
                      : <span className="text-[9px] text-green-600 font-medium">✓ Completa</span>
                  )}
                </div>
                <p className="text-sm font-light text-black truncate">
                  {pregunta.texto || <span className="text-gray-300 italic">Sin enunciado...</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); duplicateQuestion(pregunta.id) }}
                className="p-1.5 text-gray-400 hover:text-black hover:bg-black/5 rounded-lg transition"
                title="Duplicar"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeQuestion(pregunta.id) }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Eliminar"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span
                className="text-gray-400 text-xs ml-1 transition-transform duration-300"
                style={{ transform: expandedQuestion === pregunta.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </div>
          </div>

          {/* Contenido de la pregunta expandida */}
          {expandedQuestion === pregunta.id && (
            <div className="border-t border-black/5 p-5 bg-black/[0.01] space-y-5">
              {/* Enunciado */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                  Enunciado de la Pregunta *
                </label>
                <textarea
                  value={pregunta.texto}
                  onChange={(e) => updateQuestion(pregunta.id, 'texto', e.target.value)}
                  placeholder="Escribe la pregunta aquí..."
                  rows="2"
                  className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-black placeholder-gray-300 focus:outline-none focus:border-black transition font-light text-sm resize-none"
                />
              </div>

              {/* Opciones según tipo */}
              {pregunta.tipo === 'opcion_multiple' ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">
                      Opciones (selecciona la correcta)
                    </label>
                    {pregunta.opciones.length < 6 && (
                      <button
                        type="button"
                        onClick={() => addOption(pregunta.id)}
                        className="text-[10px] text-black font-medium hover:text-gray-600 transition flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Opción
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {pregunta.opciones.map((opcion, opIdx) => (
                      <div key={opcion.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateOption(pregunta.id, opcion.id, 'correcta', true)}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            opcion.correcta
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-black/15 hover:border-black/30 text-transparent'
                          }`}
                          title={opcion.correcta ? 'Respuesta correcta' : 'Marcar como correcta'}
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="text-xs text-gray-400 font-semibold w-5">
                          {String.fromCharCode(65 + opIdx)}
                        </span>
                        <input
                          type="text"
                          value={opcion.texto}
                          onChange={(e) => updateOption(pregunta.id, opcion.id, 'texto', e.target.value)}
                          placeholder={`Opción ${String.fromCharCode(65 + opIdx)}...`}
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm font-light focus:outline-none transition ${
                            opcion.correcta
                              ? 'border-green-300 bg-green-50 focus:border-green-500'
                              : 'border-black/5 bg-white focus:border-black'
                          }`}
                        />
                        {pregunta.opciones.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(pregunta.id, opcion.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {!pregunta.opciones.some(o => o.correcta) && (
                    <p className="mt-2 text-[10px] text-orange-500 font-light flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Selecciona una respuesta correcta
                    </p>
                  )}
                </div>
              ) : (
                /* Verdadero / Falso */
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-3 block">
                    Respuesta Correcta
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuestion(pregunta.id, 'correcta', true)}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                        pregunta.correcta === true
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-black/5 text-gray-600 hover:bg-black/10'
                      }`}
                    >
                      ✓ Verdadero
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuestion(pregunta.id, 'correcta', false)}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                        pregunta.correcta === false
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-black/5 text-gray-600 hover:bg-black/10'
                      }`}
                    >
                      ✗ Falso
                    </button>
                  </div>
                </div>
              )}

              {/* Explicación */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                  Explicación (se muestra al revisar resultados)
                </label>
                <textarea
                  value={pregunta.explicacion}
                  onChange={(e) => updateQuestion(pregunta.id, 'explicacion', e.target.value)}
                  placeholder="Explica por qué esta es la respuesta correcta..."
                  rows="2"
                  className="w-full px-4 py-3 border border-black/5 rounded-lg bg-white text-black placeholder-gray-300 focus:outline-none focus:border-black transition font-light text-sm resize-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Botones para agregar preguntas */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => addQuestion('opcion_multiple')}
          className="flex-1 py-4 border-2 border-dashed border-black/10 rounded-xl text-sm font-medium text-gray-500 hover:border-black/25 hover:text-black hover:bg-black/[0.02] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Opción Múltiple
        </button>
        <button
          type="button"
          onClick={() => addQuestion('verdadero_falso')}
          className="flex-1 py-4 border-2 border-dashed border-black/10 rounded-xl text-sm font-medium text-gray-500 hover:border-black/25 hover:text-black hover:bg-black/[0.02] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Verdadero / Falso
        </button>
      </div>

      {/* Info */}
      {totalPreguntas > 0 && (
        <div className="p-3 bg-black/[0.02] rounded-lg border border-black/5">
          <p className="text-[10px] text-gray-400 font-light flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Los estudiantes necesitarán {quiz.puntajeMinimo}% para aprobar. Tendrán {quiz.intentos} intento{quiz.intentos !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>
  )
}

export default QuizEditor
