import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'
import ModuleEditor from '../../components/UI/ModuleEditor'
import CoursePreview from '../../components/UI/CoursePreview'
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourseSubscribers,
  getMyCourses,
  updateCourse,
  updateCourseStatus,
} from '../../services/courseService'
import { CATEGORIAS, NIVELES, IDIOMAS } from '../../data/constants'

function CreateCourses() {
  const [activeSection] = useState('cursos')
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [submitMessage, setSubmitMessage] = useState('')
  const [editingCourseId, setEditingCourseId] = useState(null)

  const [myCourses, setMyCourses] = useState([])
  const [loadingMyCourses, setLoadingMyCourses] = useState(false)
  const [activeCourseAction, setActiveCourseAction] = useState('')
  const [subscribersByCourse, setSubscribersByCourse] = useState({})
  const [statusFilter, setStatusFilter] = useState('todos')
  const [currentCoursesPage, setCurrentCoursesPage] = useState(1)

  const COURSES_PAGE_SIZE = 5

  const [formData, setFormData] = useState({
    titulo: '',
    instructor: '',
    categoria: '',
    nivel: '',
    idioma: 'Español',
    descripcion: '',
    descripcionLarga: '',
    duracion: '',
    tipoAcceso: 'gratis',
    precio: '0',
    certificado: true,
    requisitos: '',
    imagenPortada: null,
  })

  const [modulos, setModulos] = useState([])
  const [previewImage, setPreviewImage] = useState(null)

  async function loadMyCourses() {
    try {
      setLoadingMyCourses(true)
      const courses = await getMyCourses()
      setMyCourses(courses || [])
    } catch {
      setMyCourses([])
    } finally {
      setLoadingMyCourses(false)
    }
  }

  useEffect(() => {
    loadMyCourses()
  }, [])

  const categorias = CATEGORIAS
  const niveles = NIVELES
  const idiomas = IDIOMAS

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, imagenPortada: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitStatus(null)
    setSubmitMessage('')

    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, {
          ...formData,
          modulos,
        })
      } else {
        await createCourse(formData, modulos)
      }

      setSubmitStatus('success')
      setSubmitMessage(
        editingCourseId
          ? `Curso "${formData.titulo}" actualizado exitosamente.`
          : `Curso "${formData.titulo}" creado exitosamente.`
      )

      setEditingCourseId(null)
      setFormData({
        titulo: '',
        instructor: '',
        categoria: '',
        nivel: '',
        idioma: 'Español',
        descripcion: '',
        descripcionLarga: '',
        duracion: '',
        tipoAcceso: 'gratis',
        precio: '0',
        certificado: true,
        requisitos: '',
        imagenPortada: null,
      })
      setModulos([])
      setPreviewImage(null)
      setCurrentStep(1)
      await loadMyCourses()
    } catch (error) {
      console.error('Error al crear el curso:', error)
      setSubmitStatus('error')

      let errorMsg = `Error al crear el curso: ${error.message}`
      if (error.status === 401) {
        errorMsg = 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
      } else if (error.status === 403) {
        errorMsg = 'No tienes permisos para crear cursos.'
      }

      setSubmitMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const isStepValid = (step) => {
    switch (step) {
      case 1: return formData.titulo && formData.instructor && formData.categoria && formData.nivel
      case 2:
        return (
          formData.descripcion &&
          formData.duracion &&
          formData.tipoAcceso &&
          (formData.tipoAcceso === 'gratis' || Number(formData.precio) > 0)
        )
      case 3: return modulos.length > 0 && modulos.every(m => m.titulo)
      case 4: return true
      default: return false
    }
  }

  const stepLabels = ['Información Básica', 'Detalles del Curso', 'Módulos y Contenido', 'Vista Previa']

  const filteredMyCourses = useMemo(() => {
    if (statusFilter === 'todos') return myCourses
    return myCourses.filter((course) => (course.estado || 'publicado') === statusFilter)
  }, [myCourses, statusFilter])

  const totalCoursePages = Math.max(1, Math.ceil(filteredMyCourses.length / COURSES_PAGE_SIZE))

  const paginatedMyCourses = useMemo(() => {
    const start = (currentCoursesPage - 1) * COURSES_PAGE_SIZE
    const end = start + COURSES_PAGE_SIZE
    return filteredMyCourses.slice(start, end)
  }, [filteredMyCourses, currentCoursesPage])

  useEffect(() => {
    setCurrentCoursesPage(1)
  }, [statusFilter, myCourses.length])

  const handleEditCourse = async (courseId) => {
    try {
      setActiveCourseAction(`edit-${courseId}`)
      const course = await getCourseById(courseId)
      if (!course) return

      setEditingCourseId(course.id)
      setFormData({
        titulo: course.titulo || '',
        instructor: course.instructor || '',
        categoria: course.categoria || '',
        nivel: course.nivel || '',
        idioma: course.idioma || 'Español',
        descripcion: course.descripcion || '',
        descripcionLarga: course.descripcionLarga || '',
        duracion: course.duracion || '',
        tipoAcceso: course.tipoAcceso || 'gratis',
        precio: String(course.precio || 0),
        certificado: Boolean(course.certificado),
        requisitos: course.requisitos || '',
        imagenPortada: null,
      })
      setModulos(course.modulos_detalle || [])
      setPreviewImage(course.imagenPortada || null)
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error.message || 'No se pudo cargar el curso para editar.')
    } finally {
      setActiveCourseAction('')
    }
  }

  const handleToggleCourseStatus = async (courseId, currentStatus) => {
    try {
      setActiveCourseAction(`status-${courseId}`)
      const nextStatus = currentStatus === 'inactivo' ? 'publicado' : 'inactivo'
      await updateCourseStatus(courseId, nextStatus)
      await loadMyCourses()
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error.message || 'No se pudo actualizar el estado del curso.')
    } finally {
      setActiveCourseAction('')
    }
  }

  const handleDeleteCourse = async (courseId) => {
    const confirmed = window.confirm('Esta acción eliminará el curso de forma permanente. ¿Deseas continuar?')
    if (!confirmed) return

    try {
      setActiveCourseAction(`delete-${courseId}`)
      await deleteCourse(courseId)
      if (editingCourseId === courseId) {
        setEditingCourseId(null)
      }
      await loadMyCourses()
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error.message || 'No se pudo eliminar el curso.')
    } finally {
      setActiveCourseAction('')
    }
  }

  const handleLoadSubscribers = async (courseId) => {
    try {
      setActiveCourseAction(`subs-${courseId}`)
      const subscribers = await getCourseSubscribers(courseId)
      setSubscribersByCourse((prev) => ({ ...prev, [courseId]: subscribers || [] }))
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error.message || 'No se pudieron cargar los suscriptores.')
    } finally {
      setActiveCourseAction('')
    }
  }

  return (
    <AdminLayout activeSection={activeSection}>
      <section>
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-light mb-2 md:mb-4 tracking-tight text-black">
            {editingCourseId ? 'Editar Curso' : 'Crear Curso'}
          </h1>
          <p className="text-xs md:text-sm lg:text-lg text-gray-500 font-light">
            {editingCourseId
              ? 'Actualiza contenido y configuración del curso que creaste'
              : 'Diseña cursos educativos para la comunidad Maraleste'}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto overflow-x-auto px-2">
            {stepLabels.map((label, index) => {
              const stepNum = index + 1
              const isActive = currentStep === stepNum
              const isCompleted = currentStep > stepNum
              return (
                <div key={stepNum} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(stepNum)}
                    className="flex flex-col items-center group"
                  >
                    <div className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-black text-white shadow-lg shadow-black/20'
                        : isCompleted
                        ? 'bg-black text-white'
                        : 'bg-black/10 text-gray-500 group-hover:bg-black/20'
                    }`}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <span className={`mt-1 md:mt-2 text-[8px] md:text-[10px] uppercase tracking-wider font-medium hidden lg:block ${
                      isActive ? 'text-black' : 'text-gray-400'
                    }`}>
                      {label}
                    </span>
                  </button>
                  {stepNum < totalSteps && (
                    <div className={`w-8 md:w-12 lg:w-24 h-px mx-1 md:mx-2 transition-colors ${
                      currentStep > stepNum ? 'bg-black' : 'bg-black/10'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ==================== PASO 1: Información Básica ==================== */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 xl:p-12 shadow-lg shadow-black/5 border border-black/5">
              <div className="mb-6 md:mb-8 lg:mb-10">
                <h2 className="text-lg md:text-xl lg:text-2xl font-light text-black mb-1 md:mb-2">Información Básica</h2>
                <p className="text-[11px] md:text-xs lg:text-sm text-gray-400 font-light">Comienza con los datos principales del curso</p>
              </div>

              {/* Título del Curso - Campo principal destacado */}
              <div className="mb-6 md:mb-8 lg:mb-10">
                <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Fundamentos del Diseño"
                  className="w-full px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 border-2 border-black/10 rounded-xl bg-white text-black text-base md:text-lg lg:text-xl font-light placeholder-gray-300 focus:outline-none focus:border-black transition-all duration-300"
                  required
                />
                <p className="mt-2 text-[10px] md:text-xs lg:text-xs text-gray-400 font-light">
                  Elige un título claro y atractivo que describa el contenido del curso
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                {/* Instructor */}
                <div>
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Instructor *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="Nombre completo del instructor"
                    className="w-full px-3 md:px-4 py-2 md:py-3 lg:py-4 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm placeholder-gray-300 focus:outline-none focus:border-black transition font-light"
                    required
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 lg:py-4 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm focus:outline-none focus:border-black transition font-light appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Nivel */}
                <div>
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Nivel *
                  </label>
                  <div className="flex gap-2 md:gap-3">
                    {niveles.map(nivel => (
                      <button
                        key={nivel}
                        type="button"
                        onClick={() => setFormData({ ...formData, nivel })}
                        className={`flex-1 py-2 md:py-3 lg:py-4 rounded-xl text-[10px] md:text-xs lg:text-sm font-medium transition-all duration-300 ${
                          formData.nivel === nivel
                            ? 'bg-black text-white shadow-lg shadow-black/20'
                            : 'bg-black/5 text-gray-600 hover:bg-black/10'
                        }`}
                      >
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Idioma */}
                <div>
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Idioma
                  </label>
                  <select
                    name="idioma"
                    value={formData.idioma}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 lg:py-4 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm focus:outline-none focus:border-black transition font-light appearance-none cursor-pointer"
                  >
                    {idiomas.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PASO 2: Detalles ==================== */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 xl:p-12 shadow-lg shadow-black/5 border border-black/5">
              <div className="mb-6 md:mb-8 lg:mb-10">
                <h2 className="text-lg md:text-xl lg:text-2xl font-light text-black mb-1 md:mb-2">Detalles del Curso</h2>
                <p className="text-[11px] md:text-xs lg:text-sm text-gray-400 font-light">Describe el contenido, define acceso gratis o pago y recursos del curso</p>
              </div>

              {/* Descripción Corta */}
              <div className="mb-6 md:mb-8">
                <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                  Descripción Corta *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Resumen breve del curso (se muestra en la tarjeta del catálogo)..."
                  rows="3"
                  maxLength={200}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm placeholder-gray-300 focus:outline-none focus:border-black transition font-light resize-none"
                  required
                />
                <p className="mt-1 text-[10px] md:text-xs text-gray-400 font-light text-right">{formData.descripcion.length}/200</p>
              </div>

              {/* Descripción Larga */}
              <div className="mb-6 md:mb-8">
                <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                  Descripción Completa
                </label>
                <textarea
                  name="descripcionLarga"
                  value={formData.descripcionLarga}
                  onChange={handleChange}
                  placeholder="Descripción detallada del curso. Puedes incluir objetivos, temario general, qué aprenderán los estudiantes..."
                  rows="6"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm placeholder-gray-300 focus:outline-none focus:border-black transition font-light resize-none"
                />
              </div>

              {/* Imagen de Portada */}
              <div className="mb-6 md:mb-8">
                <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                  Imagen de Portada
                </label>
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  <div className="flex-1 w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-black/30 hover:bg-black/[0.02] transition-all duration-300">
                      <svg className="w-6 md:w-8 h-6 md:h-8 text-gray-400 mb-1 md:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[11px] md:text-sm text-gray-400 font-light">Haz clic para subir imagen</span>
                      <span className="text-[9px] md:text-xs text-gray-300 mt-1">PNG, JPG hasta 5MB</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  {previewImage && (
                    <div className="relative w-32 md:w-40 h-32 md:h-40 rounded-xl overflow-hidden border border-black/10 flex-shrink-0">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setPreviewImage(null); setFormData({ ...formData, imagenPortada: null }) }}
                        className="absolute top-2 right-2 w-5 md:w-6 h-5 md:h-6 bg-black/70 text-white rounded-full flex items-center justify-center text-xs hover:bg-black transition"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
                {/* Tipo de Acceso */}
                <div className="md:col-span-2">
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Tipo de Acceso *
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipoAcceso: 'gratis', precio: '0' })}
                      className={`rounded-xl border px-3 md:px-5 py-2 md:py-3 lg:py-4 text-xs md:text-sm transition-all duration-300 ${
                        formData.tipoAcceso === 'gratis'
                          ? 'border-black bg-black text-white shadow-lg shadow-black/20'
                          : 'border-black/10 bg-white text-gray-600 hover:border-black/30'
                      }`}
                    >
                      Gratis
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipoAcceso: 'pago', precio: Number(formData.precio) > 0 ? formData.precio : '' })}
                      className={`rounded-xl border px-3 md:px-5 py-2 md:py-3 lg:py-4 text-xs md:text-sm transition-all duration-300 ${
                        formData.tipoAcceso === 'pago'
                          ? 'border-black bg-black text-white shadow-lg shadow-black/20'
                          : 'border-black/10 bg-white text-gray-600 hover:border-black/30'
                      }`}
                    >
                      Pago
                    </button>
                  </div>
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Duración *
                  </label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    placeholder="Ej: 6 semanas"
                    className="w-full px-3 md:px-4 py-2 md:py-3 lg:py-4 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm placeholder-gray-300 focus:outline-none focus:border-black transition font-light"
                    required
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Precio (COP) {formData.tipoAcceso === 'pago' ? '*' : ''}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-light text-xs md:text-sm">$</span>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      placeholder="120000"
                      step="1"
                      min="0"
                      disabled={formData.tipoAcceso === 'gratis'}
                      className="w-full pl-7 md:pl-9 pr-3 md:pr-4 py-2 md:py-3 lg:py-4 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm placeholder-gray-300 focus:outline-none focus:border-black transition font-light disabled:bg-gray-100 disabled:text-gray-400"
                      required={formData.tipoAcceso === 'pago'}
                    />
                  </div>
                  <p className="mt-2 text-[10px] md:text-xs text-gray-400 font-light">
                    {formData.tipoAcceso === 'gratis'
                      ? 'Curso gratuito: el precio se registra automáticamente en 0 COP.'
                      : 'Define el valor en pesos colombianos (COP).'}
                  </p>
                </div>

                {/* Certificado */}
                <div className="md:col-span-2">
                  <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                    Certificado
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, certificado: !formData.certificado })}
                    className={`w-full py-2 md:py-3 lg:py-4 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      formData.certificado
                        ? 'bg-black text-white shadow-lg shadow-black/20'
                        : 'bg-black/5 text-gray-500 hover:bg-black/10'
                    }`}
                  >
                    {formData.certificado ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Con Certificado
                      </>
                    ) : 'Sin Certificado'}
                  </button>
                </div>
              </div>

              {/* Requisitos */}
              <div>
                <label className="block text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-semibold mb-2 md:mb-3">
                  Requisitos Previos
                </label>
                <input
                  type="text"
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  placeholder="Ej: Ninguno, Conocimientos básicos de diseño..."
                  className="w-full px-3 md:px-4 py-2 md:py-3 lg:py-4 border border-black/10 rounded-xl bg-white text-black text-xs md:text-sm placeholder-gray-300 focus:outline-none focus:border-black transition font-light"
                />
              </div>
            </div>
          )}

          {/* ==================== PASO 3: Módulos ==================== */}
          {currentStep === 3 && (
            <ModuleEditor modulos={modulos} setModulos={setModulos} />
          )}

          {/* ==================== PASO 4: Vista Previa ==================== */}
          {currentStep === 4 && (
            <CoursePreview
              formData={formData}
              modulos={modulos}
              categorias={categorias}
              previewImage={previewImage}
            />
          )}

          {/* ==================== Notificación de estado ==================== */}
          {submitStatus && (
            <div className={`mt-4 md:mt-6 p-3 md:p-4 lg:p-5 rounded-xl border flex items-start gap-2 md:gap-3 text-xs md:text-sm ${
              submitStatus === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {submitStatus === 'success' ? (
                <svg className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <p className="font-medium">{submitMessage}</p>
                {submitStatus === 'success' && (
                  <p className="text-[10px] md:text-xs mt-1 opacity-70">La lista de tus cursos fue actualizada.</p>
                )}
              </div>
            </div>
          )}

          {/* ==================== Navegación entre pasos ==================== */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 mt-6 md:mt-8">
            <button
              type="button"
              onClick={prevStep}
              className={`px-4 md:px-8 py-2 md:py-4 border border-black/20 text-black text-[10px] md:text-xs uppercase tracking-wider font-medium rounded-xl hover:bg-black hover:text-white transition-all duration-300 w-full md:w-auto ${
                currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
              }`}
            >
              ← Paso Anterior
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className={`px-4 md:px-8 py-2 md:py-4 bg-black text-white text-[10px] md:text-xs uppercase tracking-wider font-medium rounded-xl transition-all duration-300 shadow-lg shadow-black/10 w-full md:w-auto ${
                  !isStepValid(currentStep) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800 hover:shadow-xl'
                }`}
              >
                Siguiente Paso →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 md:px-10 py-2 md:py-4 bg-black text-white text-[10px] md:text-xs uppercase tracking-wider font-medium rounded-xl transition-all duration-300 shadow-lg shadow-black/10 flex items-center justify-center gap-2 w-full md:w-auto ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-800 hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-3 md:w-4 h-3 md:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creando Curso...
                  </>
                ) : (
                  <>
                    <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingCourseId ? 'Guardar Cambios' : 'Crear Curso'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="mt-10 md:mt-14 bg-white rounded-2xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-lg shadow-black/5 border border-black/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-light text-black">Tus Cursos Creados</h2>
              <p className="text-[11px] md:text-xs lg:text-sm text-gray-500">Solo tú puedes editar, desactivar o eliminar los cursos que creaste.</p>
            </div>
            <button
              type="button"
              onClick={loadMyCourses}
              className="px-3 md:px-4 py-2 md:py-2 border border-black/20 rounded-xl text-[10px] md:text-xs uppercase tracking-wider hover:bg-black hover:text-white transition w-full md:w-auto"
            >
              Recargar
            </button>
          </div>

          <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-2 md:gap-3">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'publicado', label: 'Publicados' },
              { id: 'inactivo', label: 'Inactivos' },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs uppercase tracking-wider border transition ${
                  statusFilter === filter.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-black/20 hover:border-black/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
            <span className="ml-auto text-[9px] md:text-xs text-gray-500 uppercase tracking-wider">
              {filteredMyCourses.length} curso{filteredMyCourses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingMyCourses ? (
            <p className="text-xs md:text-sm text-gray-500">Cargando cursos...</p>
          ) : myCourses.length === 0 ? (
            <p className="text-xs md:text-sm text-gray-500">Aún no has creado cursos.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {paginatedMyCourses.map((course) => (
                <article key={course.id} className="rounded-xl border border-black/10 p-3 md:p-4 lg:p-5 bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-base lg:text-lg font-medium text-black line-clamp-2">{course.titulo}</h3>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                        Estado: {course.estado || 'publicado'} · Acceso: {course.tipoAcceso || 'gratis'} · {course.tipoAcceso === 'pago' ? `$ ${Number(course.precio || 0).toLocaleString('es-CO')} COP` : 'Gratis'}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1">Suscritos: {course.estudiantes || 0}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCourse(course.id)}
                        disabled={activeCourseAction === `edit-${course.id}`}
                        className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-black/20 text-[9px] md:text-xs uppercase tracking-wider hover:bg-black hover:text-white transition disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCourseStatus(course.id, course.estado || 'publicado')}
                        disabled={activeCourseAction === `status-${course.id}`}
                        className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-black/20 text-[9px] md:text-xs uppercase tracking-wider hover:bg-black hover:text-white transition disabled:opacity-50"
                      >
                        {course.estado === 'inactivo' ? 'Publicar' : 'Desactivar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={activeCourseAction === `delete-${course.id}`}
                        className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-red-300 text-red-600 text-[9px] md:text-xs uppercase tracking-wider hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSubscribers(course.id)}
                        disabled={activeCourseAction === `subs-${course.id}`}
                        className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-black/20 text-[9px] md:text-xs uppercase tracking-wider hover:bg-black hover:text-white transition disabled:opacity-50"
                      >
                        Ver Suscriptores
                      </button>
                    </div>
                  </div>

                  {Array.isArray(subscribersByCourse[course.id]) && (
                    <div className="mt-3 md:mt-4 border-t border-black/10 pt-3 md:pt-4">
                      <p className="text-[9px] md:text-xs uppercase tracking-wider text-gray-500 mb-2 md:mb-3">Suscriptores registrados</p>
                      {subscribersByCourse[course.id].length === 0 ? (
                        <p className="text-xs md:text-sm text-gray-500">Aún no hay suscripciones en este curso.</p>
                      ) : (
                        <div className="space-y-1 md:space-y-2">
                          {subscribersByCourse[course.id].map((subscriber) => (
                            <div key={`${course.id}-${subscriber.uid}`} className="flex flex-col md:flex-row md:items-center md:justify-between text-[10px] md:text-sm bg-black/[0.02] rounded-lg px-2 md:px-3 py-1.5 md:py-2 gap-1 md:gap-0">
                              <span className="text-black truncate">
                                {subscriber.firstName || ''} {subscriber.lastName || ''} {subscriber.email ? `(${subscriber.email})` : ''}
                              </span>
                              <span className="text-gray-500 text-[9px] md:text-xs uppercase tracking-wider">
                                {subscriber.tipoAcceso} · {subscriber.tipoAcceso === 'pago' ? `$ ${Number(subscriber.precio || 0).toLocaleString('es-CO')} COP` : 'Gratis'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}              </article>
              ))}

              {filteredMyCourses.length > COURSES_PAGE_SIZE && (
                <div className="pt-2 md:pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wider">
                    Página {currentCoursesPage} de {totalCoursePages}
                  </p>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentCoursesPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentCoursesPage === 1}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2 md:py-2 rounded-lg border border-black/20 text-[10px] md:text-xs uppercase tracking-wider hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentCoursesPage((prev) => Math.min(totalCoursePages, prev + 1))}
                      disabled={currentCoursesPage === totalCoursePages}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2 md:py-2 rounded-lg border border-black/20 text-[10px] md:text-xs uppercase tracking-wider hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}

export default CreateCourses
