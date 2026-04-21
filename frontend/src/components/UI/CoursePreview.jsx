function CoursePreview({ formData, modulos, categorias, previewImage }) {
  const precioCOP = Number(formData.precio || 0)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg shadow-black/5 border border-black/5">
        <div className="mb-10">
          <h2 className="text-2xl font-light text-black mb-2">Vista Previa del Curso</h2>
          <p className="text-sm text-gray-400 font-light">Revisa que toda la información sea correcta antes de crear el curso</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Info principal */}
          <div className="md:col-span-2 space-y-8">
            {/* Título */}
            <div>
              <h1 className="text-4xl font-light text-black mb-2">{formData.titulo || 'Sin título'}</h1>
              <p className="text-lg text-gray-500 font-light">Por {formData.instructor || 'Sin instructor'}</p>
            </div>

            {/* Imagen */}
            <div className="h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-2">🎨</div>
                  <p className="text-sm font-light">Sin imagen de portada</p>
                </div>
              )}
            </div>

            {/* Descripción */}
            {formData.descripcion && (
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-3">Descripción</h3>
                <p className="text-gray-600 font-light leading-relaxed">{formData.descripcion}</p>
              </div>
            )}

            {formData.descripcionLarga && (
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-3">Descripción Completa</h3>
                <p className="text-gray-600 font-light leading-relaxed whitespace-pre-line">{formData.descripcionLarga}</p>
              </div>
            )}

            {/* Módulos */}
            {modulos.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-4">
                  Módulos ({modulos.length})
                </h3>
                <div className="space-y-3">
                  {modulos.map((m) => {
                    const totalPreguntas = m.quiz?.preguntas?.length || 0
                    return (
                      <div key={m.id} className="p-4 bg-black/[0.02] rounded-xl border border-black/5">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{m.icono}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-black">
                              Módulo {m.numero}: {m.titulo || 'Sin título'}
                            </p>
                            <p className="text-xs text-gray-400 font-light">
                              {m.lecciones.length} lecciones
                              {m.duracion && ` • ${m.duracion}`}
                              {m.quiz && ` • Quiz: ${totalPreguntas} preguntas`}
                            </p>
                          </div>
                        </div>

                        {/* Lecciones del módulo */}
                        {m.lecciones.length > 0 && (
                          <div className="mt-3 ml-12 space-y-1">
                            {m.lecciones.map((l, i) => (
                              <div key={l.id} className="flex items-center gap-2 text-xs text-gray-500 font-light">
                                <span>{l.tipo === 'video' ? '▶️' : l.tipo === 'lectura' ? '📖' : '📥'}</span>
                                <span>{i + 1}. {l.titulo || 'Sin título'}</span>
                                {l.duracion && <span className="text-gray-400">({l.duracion})</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quiz preview */}
                        {m.quiz && totalPreguntas > 0 && (
                          <div className="mt-3 ml-12 p-3 bg-black/[0.03] rounded-lg">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                              📝 {m.quiz.titulo}
                            </p>
                            <div className="space-y-1">
                              {m.quiz.preguntas.map((p, i) => (
                                <p key={p.id} className="text-xs text-gray-500 font-light truncate">
                                  {i + 1}. {p.texto || 'Sin enunciado'}
                                  <span className="text-gray-400 ml-1">
                                    ({p.tipo === 'opcion_multiple' ? 'Opción múltiple' : 'V/F'})
                                  </span>
                                </p>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                              Puntaje mínimo: {m.quiz.puntajeMinimo}% • {m.quiz.intentos} intento{m.quiz.intentos !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-black/[0.02] rounded-2xl p-6 border border-black/5 space-y-5 sticky top-24">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Acceso</p>
                <p className="text-base font-light text-black mb-3 capitalize">{formData.tipoAcceso || 'gratis'}</p>

                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Precio</p>
                <p className="text-3xl font-light text-black">
                  {formData.tipoAcceso === 'gratis'
                    ? 'Gratis'
                    : `$ ${precioCOP.toLocaleString('es-CO')} COP`}
                </p>
              </div>
              <hr className="border-black/5" />
              <div className="space-y-4">
                {[
                  ['Categoría', categorias.find(c => c.id === formData.categoria)?.nombre || '—'],
                  ['Nivel', formData.nivel || '—'],
                  ['Duración', formData.duracion || '—'],
                  ['Moneda', 'COP'],
                  ['Idioma', formData.idioma],
                  ['Módulos', `${modulos.length} módulo${modulos.length !== 1 ? 's' : ''}`],
                  ['Lecciones', `${modulos.reduce((sum, m) => sum + m.lecciones.length, 0)} en total`],
                  ['Quizzes', `${modulos.filter(m => m.quiz).length} evaluaciones`],
                  ['Certificado', formData.certificado ? '✓ Incluido' : '✗ No incluido'],
                  ['Requisitos', formData.requisitos || 'Ninguno']
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{label}</p>
                    <p className="text-sm font-light text-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePreview
