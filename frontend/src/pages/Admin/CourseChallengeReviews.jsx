import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import {
  getCourseChallengeProgress,
  getMyCourses,
  reviewChallengeSubmission,
} from '../../services/courseService'
import adminSharedStyles from './AdminSharedStyles'
import globalStyles from './DashboardStyles'

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
    <>
      <style>{adminSharedStyles + globalStyles}</style>
      <AdminLayout activeSection="retos">
        <div className="ad-root db-root">
          {/* ── Header ── */}
          <header className="db-header">
            <div className="db-header-text">
              <p className="db-eyebrow">Revisión y evaluación</p>
              <h1 className="db-title">Revisión de Retos</h1>
              <p className="db-subtitle">Revisa evidencias por estudiante, aprueba o rechaza y monitorea el progreso del curso.</p>
            </div>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Course Selection ── */}
          <div className="db-card">
            <p className="db-kpi-label mb-3">Selecciona un curso</p>
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

          {/* ── Content ── */}
          {loadingProgress ? (
            <div className="db-card">
              <p className="text-sm text-gray-500">Cargando progreso de retos...</p>
            </div>
          ) : challengeProgress ? (
            <div className="space-y-6">
              {/* ── Summary Card ── */}
              <div className="db-card">
                <div className="db-card-head">
                  <div>
                    <p className="db-eyebrow">Resumen del curso</p>
                    <h2 className="db-card-title">{challengeProgress.course?.titulo}</h2>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Retos activos: {challengeProgress.totalRetos || 0} · Estudiantes inscritos: {students.length}
                </p>
              </div>

              {/* ── Students List ── */}
              {students.length === 0 ? (
                <div className="db-card">
                  <div className="db-empty">
                    <p>No hay estudiantes inscritos en este curso.</p>
                  </div>
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.uid} className="db-card">
                    <div className="db-card-head">
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {student.firstName} {student.lastName}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{student.email}</p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <p>Progreso: {student.progresoCurso?.porcentaje || 0}%</p>
                        <p style={{ fontSize: '12px' }}>
                          Lecciones: {student.progresoCurso?.completadas || 0}/{student.progresoCurso?.totalLecciones || 0}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '20px' }}>
                      {student.retos.map((reto) => {
                        const key = `${reto.moduleId}-${student.uid}`
                        const stateStyles =
                          reto.estado === 'aprobado'
                            ? { color: '#047857', background: '#ecfdf5', border: '1px solid #d1fae5' }
                            : reto.estado === 'rechazado'
                            ? { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }
                            : reto.estado === 'pendiente'
                            ? { color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a' }
                            : { color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)' }

                        return (
                          <div
                            key={key}
                            style={{
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '16px',
                              background: 'var(--surface)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}
                          >
                            <div>
                              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                {reto.moduloTitulo}
                              </p>
                              <p style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-primary)' }}>
                                {reto.retoTitulo}
                              </p>
                            </div>

                            <span
                              style={{
                                display: 'inline-flex',
                                alignSelf: 'flex-start',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: 600,
                                ...stateStyles
                              }}
                            >
                              {reto.estado === 'sin_entrega' ? 'Sin entrega' : reto.estado}
                            </span>

                            {reto.evidenciaUrl && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <img
                                  src={reto.evidenciaUrl}
                                  alt={`Evidencia de ${student.firstName}`}
                                  style={{
                                    width: '100%',
                                    height: '176px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface-2)'
                                  }}
                                  loading="lazy"
                                />
                                <a
                                  href={reto.evidenciaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '11px',
                                    color: '#1e40af',
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Abrir imagen completa
                                </a>
                              </div>
                            )}

                            {reto.comentario && (
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '8px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                                {reto.comentario}
                              </p>
                            )}

                            {reto.estado !== 'sin_entrega' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <textarea
                                  rows={2}
                                  value={feedbackByKey[key] ?? reto.feedback ?? ''}
                                  onChange={(e) => setFeedbackByKey((prev) => ({ ...prev, [key]: e.target.value }))}
                                  placeholder="Feedback para el estudiante"
                                  style={{
                                    padding: '8px 12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                  }}
                                />

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleReview(reto.moduleId, student.uid, 'aprobado')}
                                    disabled={actionLoadingKey === `aprobado-${key}`}
                                    style={{
                                      flex: 1,
                                      padding: '8px 12px',
                                      fontSize: '10px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.08em',
                                      borderRadius: 'var(--radius-sm)',
                                      border: '1px solid #86efac',
                                      color: '#16a34a',
                                      background: 'transparent',
                                      cursor: actionLoadingKey === `aprobado-${key}` ? 'not-allowed' : 'pointer',
                                      opacity: actionLoadingKey === `aprobado-${key}` ? 0.5 : 1,
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (actionLoadingKey !== `aprobado-${key}`) {
                                        e.target.style.background = '#16a34a'
                                        e.target.style.color = '#fff'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = 'transparent'
                                      e.target.style.color = '#16a34a'
                                    }}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReview(reto.moduleId, student.uid, 'rechazado')}
                                    disabled={actionLoadingKey === `rechazado-${key}`}
                                    style={{
                                      flex: 1,
                                      padding: '8px 12px',
                                      fontSize: '10px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.08em',
                                      borderRadius: 'var(--radius-sm)',
                                      border: '1px solid #fca5a5',
                                      color: '#dc2626',
                                      background: 'transparent',
                                      cursor: actionLoadingKey === `rechazado-${key}` ? 'not-allowed' : 'pointer',
                                      opacity: actionLoadingKey === `rechazado-${key}` ? 0.5 : 1,
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (actionLoadingKey !== `rechazado-${key}`) {
                                        e.target.style.background = '#dc2626'
                                        e.target.style.color = '#fff'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = 'transparent'
                                      e.target.style.color = '#dc2626'
                                    }}
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </AdminLayout>
    </>
  )
}

export default CourseChallengeReviews
