import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import {
  getCourseChallengeProgress,
  getMyCourses,
  reviewChallengeSubmission,
} from '../../services/courseService'

function CourseChallengeReviews() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [challengeProgress, setChallengeProgress] = useState(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [actionLoadingKey, setActionLoadingKey] = useState('')
  const [feedbackByKey, setFeedbackByKey] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true)
        setError('')
        const result = await getMyCourses()
        const courseList = result || []
        setCourses(courseList)
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0].id)
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar tus cursos.')
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [])

  useEffect(() => {
    async function loadProgress() {
      if (!selectedCourseId) {
        setChallengeProgress(null)
        return
      }

      try {
        setLoadingProgress(true)
        setError('')
        const data = await getCourseChallengeProgress(selectedCourseId)
        setChallengeProgress(data || null)
      } catch (err) {
        setError(err.message || 'No se pudo cargar el progreso de retos.')
        setChallengeProgress(null)
      } finally {
        setLoadingProgress(false)
      }
    }

    loadProgress()
  }, [selectedCourseId])

  const students = useMemo(() => challengeProgress?.students || [], [challengeProgress])

  const handleReview = async (moduleId, studentUid, estado) => {
    const key = `${moduleId}-${studentUid}`
    try {
      setActionLoadingKey(`${estado}-${key}`)
      await reviewChallengeSubmission(selectedCourseId, moduleId, studentUid, {
        estado,
        feedback: feedbackByKey[key] || '',
      })

      const refreshed = await getCourseChallengeProgress(selectedCourseId)
      setChallengeProgress(refreshed || null)
    } catch (err) {
      setError(err.message || 'No se pudo revisar la entrega.')
    } finally {
      setActionLoadingKey('')
    }
  }

  return (
    <AdminLayout activeSection="retos">
      <section className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight text-black">Revisión de Retos</h1>
          <p className="text-lg text-gray-500 font-light">
            Revisa evidencias por estudiante, aprueba o rechaza y monitorea el progreso del curso.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-black/5 shadow-lg shadow-black/5 p-6">
          <label className="block text-[11px] uppercase tracking-[0.4em] text-gray-500 font-semibold mb-3">
            Curso
          </label>
          {loadingCourses ? (
            <p className="text-sm text-gray-500">Cargando cursos...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-500">No tienes cursos creados.</p>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full md:max-w-xl px-4 py-3 border border-black/10 rounded-xl bg-white text-black focus:outline-none focus:border-black"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.titulo}
                </option>
              ))}
            </select>
          )}
        </div>

        {loadingProgress ? (
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-sm text-gray-500">Cargando progreso de retos...</div>
        ) : challengeProgress ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-lg shadow-black/5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Resumen</p>
              <h2 className="text-2xl font-light text-black mb-2">{challengeProgress.course?.titulo}</h2>
              <p className="text-sm text-gray-500">
                Retos activos: {challengeProgress.totalRetos || 0} · Estudiantes inscritos: {students.length}
              </p>
            </div>

            {students.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500">
                No hay estudiantes inscritos en este curso.
              </div>
            ) : (
              students.map((student) => (
                <article key={student.uid} className="rounded-2xl border border-black/5 bg-white p-6 shadow-lg shadow-black/5 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-light text-black">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Progreso curso: {student.progresoCurso?.porcentaje || 0}%</p>
                      <p>
                        Lecciones: {student.progresoCurso?.completadas || 0}/{student.progresoCurso?.totalLecciones || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {student.retos.map((reto) => {
                      const key = `${reto.moduleId}-${student.uid}`
                      const stateStyles =
                        reto.estado === 'aprobado'
                          ? 'text-green-700 bg-green-50 border-green-200'
                          : reto.estado === 'rechazado'
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : reto.estado === 'pendiente'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-gray-600 bg-gray-50 border-gray-200'

                      return (
                        <div key={key} className="rounded-xl border border-black/10 bg-black/[0.02] p-4 space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500">{reto.moduloTitulo}</p>
                            <p className="text-sm font-medium text-black">{reto.retoTitulo}</p>
                          </div>

                          <span className={`inline-flex px-2 py-1 rounded-lg text-xs uppercase tracking-wider border ${stateStyles}`}>
                            {reto.estado === 'sin_entrega' ? 'Sin entrega' : reto.estado}
                          </span>

                          {reto.evidenciaUrl && (
                            <div className="space-y-2">
                              <img
                                src={reto.evidenciaUrl}
                                alt={`Evidencia de ${student.firstName || 'estudiante'} en ${reto.moduloTitulo}`}
                                className="w-full h-44 object-cover rounded-lg border border-black/10 bg-white"
                                loading="lazy"
                              />
                              <a
                                href={reto.evidenciaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                Abrir imagen completa
                              </a>
                            </div>
                          )}

                          {reto.comentario && (
                            <p className="text-sm text-gray-600">Comentario: {reto.comentario}</p>
                          )}

                          {reto.estado !== 'sin_entrega' && (
                            <>
                              <textarea
                                rows={2}
                                value={feedbackByKey[key] ?? reto.feedback ?? ''}
                                onChange={(e) => setFeedbackByKey((prev) => ({ ...prev, [key]: e.target.value }))}
                                placeholder="Feedback para el estudiante"
                                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-black"
                              />

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReview(reto.moduleId, student.uid, 'aprobado')}
                                  disabled={actionLoadingKey === `aprobado-${key}`}
                                  className="px-3 py-2 text-xs uppercase tracking-wider rounded-lg border border-green-300 text-green-700 hover:bg-green-700 hover:text-white transition disabled:opacity-50"
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReview(reto.moduleId, student.uid, 'rechazado')}
                                  disabled={actionLoadingKey === `rechazado-${key}`}
                                  className="px-3 py-2 text-xs uppercase tracking-wider rounded-lg border border-red-300 text-red-700 hover:bg-red-700 hover:text-white transition disabled:opacity-50"
                                >
                                  Rechazar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>
    </AdminLayout>
  )
}

export default CourseChallengeReviews
