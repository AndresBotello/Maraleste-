import { useState } from 'react'
import QuizEditor from './QuizEditor'

const ICONOS_MODULO = ['🎨', '🌈', '⚖️', '✍️', '🎯', '📐', '💡', '🔥', '🎭', '📸', '🖌️', '🎪']

function ModuleEditor({ modulos, setModulos }) {
  const [expandedModule, setExpandedModule] = useState(null)

  // --- Módulos ---
  const addModule = () => {
    const nuevoModulo = {
      id: Date.now(),
      numero: modulos.length + 1,
      titulo: '',
      descripcion: '',
      duracion: '',
      icono: '🎨',
      lecciones: [],
      quiz: null
    }
    setModulos([...modulos, nuevoModulo])
    setExpandedModule(nuevoModulo.id)
  }

  const updateModule = (moduleId, field, value) => {
    setModulos(modulos.map(m => m.id === moduleId ? { ...m, [field]: value } : m))
  }

  const removeModule = (moduleId) => {
    const updated = modulos.filter(m => m.id !== moduleId).map((m, i) => ({ ...m, numero: i + 1 }))
    setModulos(updated)
    if (expandedModule === moduleId) setExpandedModule(null)
  }

  const [expandedLesson, setExpandedLesson] = useState(null)
  const [imagenPreview, setImagenPreview] = useState({})

  // --- Lecciones ---
  const addLesson = (moduleId) => {
    const newId = Date.now()
    setModulos(modulos.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lecciones: [...m.lecciones, {
            id: newId,
            titulo: '',
            descripcion: '',
            objetivo: '',
            contenido: '',
            conceptosClave: '',
            ejemplosPracticos: '',
            casoEstudio: '',
            recursos: '',
            duracion: '',
            tipo: 'video',
            videoUrl: '',
            imagen: null,
            descripcionImagen: ''
          }]
        }
      }
      return m
    }))
    setExpandedLesson(newId)
  }

  const updateLesson = (moduleId, lessonId, field, value) => {
    setModulos(modulos.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lecciones: m.lecciones.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
        }
      }
      return m
    }))
  }

  const removeLesson = (moduleId, lessonId) => {
    setModulos(modulos.map(m => {
      if (m.id === moduleId) {
        return { ...m, lecciones: m.lecciones.filter(l => l.id !== lessonId) }
      }
      return m
    }))
  }

  // --- Quiz ---
  const toggleQuiz = (moduleId, moduloNumero) => {
    setModulos(modulos.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          quiz: m.quiz ? null : {
            titulo: `Quiz Módulo ${moduloNumero}`,
            puntajeMinimo: 70,
            intentos: 3,
            preguntas: []
          }
        }
      }
      return m
    }))
  }

  const updateQuiz = (moduleId, quizData) => {
    setModulos(modulos.map(m => {
      if (m.id === moduleId) {
        return { ...m, quiz: quizData }
      }
      return m
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg shadow-black/5 border border-black/5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-light text-black mb-2">Módulos y Contenido</h2>
            <p className="text-sm text-gray-400 font-light">
              Estructura el curso en módulos con lecciones y evaluaciones
            </p>
          </div>
          <button
            type="button"
            onClick={addModule}
            className="px-6 py-3 bg-black text-white text-xs uppercase tracking-wider font-medium rounded-xl hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Módulo
          </button>
        </div>

        {modulos.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-black/10 rounded-2xl">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-light text-black mb-2">Aún no hay módulos</h3>
            <p className="text-sm text-gray-400 font-light mb-6">
              Agrega módulos para estructurar el contenido de tu curso
            </p>
            <button
              type="button"
              onClick={addModule}
              className="px-6 py-3 bg-black/5 text-black text-xs uppercase tracking-wider font-medium rounded-xl hover:bg-black/10 transition"
            >
              + Crear primer módulo
            </button>
          </div>
        )}
      </div>

      {/* Módulos */}
      {modulos.map((modulo) => (
        <div key={modulo.id} className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-black/5 overflow-hidden">
          {/* Cabecera del módulo */}
          <div
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition"
            onClick={() => setExpandedModule(expandedModule === modulo.id ? null : modulo.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-2xl">
                {modulo.icono}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Módulo {modulo.numero}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {modulo.lecciones.length} {modulo.lecciones.length === 1 ? 'lección' : 'lecciones'}
                    {modulo.quiz && ` • ${modulo.quiz.preguntas.length} preguntas`}
                  </span>
                </div>
                <h3 className="text-lg font-light text-black">
                  {modulo.titulo || <span className="text-gray-300 italic">Sin título</span>}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeModule(modulo.id) }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Eliminar módulo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span
                className="text-gray-400 text-sm transition-transform duration-300"
                style={{ transform: expandedModule === modulo.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </div>
          </div>

          {/* Contenido expandido */}
          {expandedModule === modulo.id && (
            <div className="border-t border-black/5 p-6 bg-black/[0.01]">
              {/* Info del módulo */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-2">
                    Título del Módulo *
                  </label>
                  <input
                    type="text"
                    value={modulo.titulo}
                    onChange={(e) => updateModule(modulo.id, 'titulo', e.target.value)}
                    placeholder="Ej: Introducción al Diseño"
                    className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-black placeholder-gray-300 focus:outline-none focus:border-black transition font-light text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-2">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={modulo.duracion}
                    onChange={(e) => updateModule(modulo.id, 'duracion', e.target.value)}
                    placeholder="Ej: 45 min"
                    className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-black placeholder-gray-300 focus:outline-none focus:border-black transition font-light text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={modulo.descripcion}
                    onChange={(e) => updateModule(modulo.id, 'descripcion', e.target.value)}
                    placeholder="Breve descripción del módulo"
                    className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-black placeholder-gray-300 focus:outline-none focus:border-black transition font-light text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-2">
                    Icono
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONOS_MODULO.map(icono => (
                      <button
                        key={icono}
                        type="button"
                        onClick={() => updateModule(modulo.id, 'icono', icono)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
                          modulo.icono === icono
                            ? 'bg-black text-white shadow-md'
                            : 'bg-black/5 hover:bg-black/10'
                        }`}
                      >
                        {icono}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reto del módulo */}
              <div className="mb-8 rounded-xl border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-semibold">Reto del Módulo</h4>
                  <button
                    type="button"
                    onClick={() => updateModule(modulo.id, 'reto', {
                      ...(modulo.reto || {}),
                      habilitado: !(modulo.reto?.habilitado),
                    })}
                    className={`px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition ${
                      modulo.reto?.habilitado
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-gray-600 hover:bg-black/10'
                    }`}
                  >
                    {modulo.reto?.habilitado ? 'Reto activo' : 'Activar reto'}
                  </button>
                </div>

                {modulo.reto?.habilitado ? (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                        Título del reto
                      </label>
                      <input
                        type="text"
                        value={modulo.reto?.titulo || ''}
                        onChange={(e) => updateModule(modulo.id, 'reto', {
                          ...(modulo.reto || {}),
                          habilitado: true,
                          titulo: e.target.value,
                        })}
                        placeholder="Ej: Composición final del módulo"
                        className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                        Descripción del reto
                      </label>
                      <textarea
                        value={modulo.reto?.descripcion || ''}
                        onChange={(e) => updateModule(modulo.id, 'reto', {
                          ...(modulo.reto || {}),
                          habilitado: true,
                          descripcion: e.target.value,
                        })}
                        rows={4}
                        placeholder="Describe qué debe entregar el estudiante en imagen para completar este módulo"
                        className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 font-light">Sin reto para este módulo.</p>
                )}
              </div>

              {/* Lecciones */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold">
                    Lecciones ({modulo.lecciones.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => addLesson(modulo.id)}
                    className="text-xs text-black font-medium hover:text-gray-600 transition flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Lección
                  </button>
                </div>

                {modulo.lecciones.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-black/10 rounded-xl">
                    <p className="text-sm text-gray-400 font-light">Agrega lecciones a este módulo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modulo.lecciones.map((leccion, idx) => {
                      const isExpanded = expandedLesson === leccion.id
                      const hasContent = leccion.titulo || leccion.contenido || leccion.videoUrl
                      return (
                        <div key={leccion.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          isExpanded ? 'border-black/20 shadow-md' : 'border-black/5'
                        }`}>
                          {/* Header de la lección (siempre visible) */}
                          <div
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-black/[0.02] transition"
                            onClick={() => setExpandedLesson(isExpanded ? null : leccion.id)}
                          >
                            <span className="text-xs text-gray-400 font-semibold w-6 text-center">{idx + 1}</span>
                            <span className="text-lg">
                              {leccion.tipo === 'video' ? '▶️' : leccion.tipo === 'lectura' ? '📖' : '📥'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-light text-black truncate">
                                {leccion.titulo || <span className="text-gray-300 italic">Sin título...</span>}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {leccion.duracion && (
                                  <span className="text-[10px] text-gray-400">⏱ {leccion.duracion}</span>
                                )}
                                {leccion.videoUrl && (
                                  <span className="text-[10px] text-blue-500">🔗 Video enlazado</span>
                                )}
                                {hasContent ? (
                                  <span className="text-[10px] text-green-600 font-medium">✓ Con contenido</span>
                                ) : (
                                  <span className="text-[10px] text-orange-500 font-medium">⚠ Vacía</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeLesson(modulo.id, leccion.id) }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar lección"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span
                              className="text-gray-400 text-xs transition-transform duration-300"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                              ▼
                            </span>
                          </div>

                          {/* Panel expandido de la lección */}
                          {isExpanded && (
                            <div className="border-t border-black/5 p-5 bg-black/[0.01] space-y-4">
                              {/* Fila 1: Título + Tipo + Duración */}
                              <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-6">
                                  <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                    Título de la Lección *
                                  </label>
                                  <input
                                    type="text"
                                    value={leccion.titulo}
                                    onChange={(e) => updateLesson(modulo.id, leccion.id, 'titulo', e.target.value)}
                                    placeholder="Ej: Introducción a la teoría del color"
                                    className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                    Tipo
                                  </label>
                                  <select
                                    value={leccion.tipo}
                                    onChange={(e) => updateLesson(modulo.id, leccion.id, 'tipo', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition appearance-none cursor-pointer"
                                  >
                                    <option value="video">▶ Video</option>
                                    <option value="lectura">📖 Lectura</option>
                                    <option value="recurso">📥 Recurso</option>
                                  </select>
                                </div>
                                <div className="col-span-3">
                                  <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                    Duración
                                  </label>
                                  <input
                                    type="text"
                                    value={leccion.duracion}
                                    onChange={(e) => updateLesson(modulo.id, leccion.id, 'duracion', e.target.value)}
                                    placeholder="Ej: 15 min"
                                    className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition text-center"
                                  />
                                </div>
                              </div>

                              {/* Descripción breve */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Descripción Breve
                                </label>
                                <input
                                  type="text"
                                  value={leccion.descripcion || ''}
                                  onChange={(e) => updateLesson(modulo.id, leccion.id, 'descripcion', e.target.value)}
                                  placeholder="¿De qué trata esta lección?"
                                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition"
                                />
                              </div>

                              {/* Objetivo de aprendizaje */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Objetivo de la Lección
                                </label>
                                <input
                                  type="text"
                                  value={leccion.objetivo || ''}
                                  onChange={(e) => updateLesson(modulo.id, leccion.id, 'objetivo', e.target.value)}
                                  placeholder="Ej: Comprender la armonía cromática para aplicarla en composiciones"
                                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition"
                                />
                              </div>

                              {/* Contenido / Información de la lección */}
                              <div className="border-t border-black/10 pt-4 mt-4">
                                <h5 className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-4">📚 CONTENIDO DE LA LECCIÓN</h5>
                                
                                <div>
                                  <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                    Contenido Principal
                                  </label>
                                  <textarea
                                    value={leccion.contenido || ''}
                                    onChange={(e) => updateLesson(modulo.id, leccion.id, 'contenido', e.target.value)}
                                    placeholder="Escribe aquí la información, apuntes o instrucciones de la lección. Puede incluir texto explicativo, pasos a seguir, referencias, etc."
                                    rows={10}
                                    className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y min-h-[200px]"
                                  />
                                  <p className="mt-1 text-[10px] text-gray-400 font-light">📝 Contenido largo: teoría, pasos detallados, ejercicios y notas para el estudiante.</p>
                                </div>
                              </div>

                              {/* Conceptos Clave */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Conceptos Clave
                                </label>
                                <textarea
                                  value={leccion.conceptosClave || ''}
                                  onChange={(e) => updateLesson(modulo.id, leccion.id, 'conceptosClave', e.target.value)}
                                  placeholder="Enumera los conceptos principales (uno por línea). Ej:&#10;- Teoría del color primario&#10;- Combinación de colores&#10;- Contraste cromático"
                                  rows={5}
                                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                                />
                                <p className="mt-1 text-[10px] text-gray-400 font-light">🎯 Puntos principales que el estudiante debe recordar.</p>
                              </div>

                              {/* Ejemplos Prácticos */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Ejemplos Prácticos
                                </label>
                                <textarea
                                  value={leccion.ejemplosPracticos || ''}
                                  onChange={(e) => updateLesson(modulo.id, leccion.id, 'ejemplosPracticos', e.target.value)}
                                  placeholder="Proporciona ejemplos reales o ejercicios prácticos que ilustren el concepto. Ej:&#10;- Ejemplo 1: Armonía complementaria...&#10;- Ejemplo 2: Paleta análoga..."
                                  rows={6}
                                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                                />
                                <p className="mt-1 text-[10px] text-gray-400 font-light">💡 Casos de uso y ejercicios para aplicar los conceptos.</p>
                              </div>

                              {/* Caso de Estudio */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Caso de Estudio (opcional)
                                </label>
                                <textarea
                                  value={leccion.casoEstudio || ''}
                                  onChange={(e) => updateLesson(modulo.id, leccion.id, 'casoEstudio', e.target.value)}
                                  placeholder="Incluye un caso de estudio real, proyecto destacado o situación profesional que ilustre el aprendizaje de la lección."
                                  rows={6}
                                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                                />
                                <p className="mt-1 text-[10px] text-gray-400 font-light">📊 Proyecto real o situación profesional relevante.</p>
                              </div>

                              {/* Recursos complementarios */}
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Recursos y Referencias
                                </label>
                                <textarea
                                  value={leccion.recursos || ''}
                                  onChange={(e) => updateLesson(modulo.id, leccion.id, 'recursos', e.target.value)}
                                  placeholder="Incluye enlaces, bibliografía, materiales descargables o tareas (uno por línea)."
                                  rows={5}
                                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                                />
                                <p className="mt-1 text-[10px] text-gray-400 font-light">Sugerencia: usa saltos de línea para organizar mejor los recursos.</p>
                              </div>

                              {/* Imagen de la lección */}
                              <div className="border-t border-black/10 pt-4 mt-4">
                                <h5 className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-4">🖼️ RECURSOS VISUALES</h5>
                                
                                <div>
                                  <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
                                    Imagen de la Lección (opcional)
                                  </label>
                                  <div className="space-y-3">
                                    {/* Preview de imagen */}
                                    {(imagenPreview[leccion.id] || leccion.imagen) && (
                                      <div className="relative rounded-xl overflow-hidden border border-black/10 bg-black/5">
                                        <img 
                                          src={imagenPreview[leccion.id] || leccion.imagen} 
                                          alt="Preview"
                                          className="w-full h-48 object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updateLesson(modulo.id, leccion.id, 'imagen', null)
                                            setImagenPreview({ ...imagenPreview, [leccion.id]: null })
                                          }}
                                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Input de archivo */}
                                    <div className="relative">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]
                                          if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (event) => {
                                              const preview = event.target?.result
                                              setImagenPreview({ ...imagenPreview, [leccion.id]: preview })
                                              updateLesson(modulo.id, leccion.id, 'imagen', preview)
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                        }}
                                        className="hidden"
                                        id={`img-upload-${leccion.id}`}
                                      />
                                      <label
                                        htmlFor={`img-upload-${leccion.id}`}
                                        className="block w-full p-4 border-2 border-dashed border-black/10 rounded-xl text-center cursor-pointer hover:border-black/20 hover:bg-black/[0.01] transition"
                                      >
                                        <div className="text-lg mb-2">🖼️</div>
                                        <p className="text-xs font-medium text-gray-600">Haz clic para cargar una imagen</p>
                                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, GIF (máx. 10MB)</p>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Descripción de la imagen */}
                                <div className="mt-4">
                                  <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                    Descripción de la Imagen
                                  </label>
                                  <textarea
                                    value={leccion.descripcionImagen || ''}
                                    onChange={(e) => updateLesson(modulo.id, leccion.id, 'descripcionImagen', e.target.value)}
                                    placeholder="Explica qué muestra la imagen, por qué es importante para la lección y cómo se relaciona con el contenido."
                                    rows={4}
                                    className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition resize-y"
                                  />
                                  <p className="mt-1 text-[10px] text-gray-400 font-light">📖 Contexto y significado de la imagen para los estudiantes.</p>
                                </div>
                              </div>

                              {/* Enlace de video (opcional) */}
                              <div className="mt-4">
                                <label className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                                  Enlace de Video
                                  <span className="text-gray-300 font-normal ml-1">(opcional)</span>
                                </label>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                  </div>
                                  <input
                                    type="url"
                                    value={leccion.videoUrl || ''}
                                    onChange={(e) => updateLesson(modulo.id, leccion.id, 'videoUrl', e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... o enlace directo al video"
                                    className="w-full pl-10 pr-3 py-2.5 border border-black/10 rounded-lg text-sm font-light focus:outline-none focus:border-black transition"
                                  />
                                </div>
                                <p className="mt-1 text-[10px] text-gray-400 font-light">Pega un enlace de YouTube, Vimeo o cualquier URL de video. Déjalo vacío si no hay video.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quiz */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold">
                    Evaluación (Quiz)
                  </h4>
                  <button
                    type="button"
                    onClick={() => toggleQuiz(modulo.id, modulo.numero)}
                    className={`text-xs font-medium transition flex items-center gap-1 ${
                      modulo.quiz ? 'text-red-500 hover:text-red-600' : 'text-black hover:text-gray-600'
                    }`}
                  >
                    {modulo.quiz ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Quitar Quiz
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Quiz
                      </>
                    )}
                  </button>
                </div>

                {modulo.quiz ? (
                  <QuizEditor
                    quiz={modulo.quiz}
                    onChange={(quizData) => updateQuiz(modulo.id, quizData)}
                  />
                ) : (
                  <div className="text-center py-6 border border-dashed border-black/10 rounded-xl">
                    <p className="text-sm text-gray-400 font-light">Sin evaluación para este módulo</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ModuleEditor
