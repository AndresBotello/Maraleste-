import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { createWorkshop, getWorkshops, deleteWorkshop, updateWorkshop } from '../../services/workshopService'
import { NIVELES } from '../../data/constants'
import adminSharedStyles from './AdminSharedStyles'
import globalStyles from './DashboardStyles'

const CATEGORIAS_TALLER = [
  { id: 'pintura', nombre: 'Pintura' },
  { id: 'escultura', nombre: 'Escultura' },
  { id: 'acuarela', nombre: 'Acuarela' },
  { id: 'fotografia', nombre: 'Fotografía' },
  { id: 'ceramica', nombre: 'Cerámica' },
  { id: 'caligrafia', nombre: 'Caligrafía' },
  { id: 'tecnicas-mixtas', nombre: 'Técnicas Mixtas' },
  { id: 'grabado', nombre: 'Grabado' },
  { id: 'diseño', nombre: 'Diseño' },
  { id: 'ilustracion', nombre: 'Ilustración' },
  { id: 'otro', nombre: 'Otro' },
]

const PLATAFORMAS_REUNION = [
  { id: '', nombre: 'Sin link de reunión' },
  { id: 'jitsi-meet', nombre: 'Jitsi Meet (embebido en la página)' },
  { id: 'google-meet', nombre: 'Google Meet' },
  { id: 'zoom', nombre: 'Zoom' },
  { id: 'microsoft-teams', nombre: 'Microsoft Teams' },
  { id: 'discord', nombre: 'Discord' },
  { id: 'otra', nombre: 'Otra plataforma' },
]

function CreateWorkshops() {
  const navigate = useNavigate()
  const [activeSection] = useState('talleres')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingWorkshopId, setEditingWorkshopId] = useState('')
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submitMessage, setSubmitMessage] = useState('')
  const [previewImage, setPreviewImage] = useState(null)

  // Lista de talleres existentes
  const [talleres, setTalleres] = useState([])
  const [loadingTalleres, setLoadingTalleres] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const [formData, setFormData] = useState({
    titulo: '',
    instructor: '',
    categoria: '',
    nivel: '',
    descripcion: '',
    descripcionLarga: '',
    fecha: '',
    hora: '',
    duracion: '',
    tipoAcceso: 'gratis',
    precio: '0',
    ubicacion: '',
    materiales: 'Incluidos',
    contacto: '',
    resultados: '',
    linkReunion: '',
    plataformaReunion: '',
    cuposTotal: '12',
    imagenPortada: null,
    estado: 'publicado',
  })

  // Cargar talleres existentes
  const fetchTalleres = async () => {
    try {
      setLoadingTalleres(true)
      const data = await getWorkshops()
      setTalleres(data || [])
    } catch (err) {
      console.error('Error cargando talleres:', err)
    } finally {
      setLoadingTalleres(false)
    }
  }

  useEffect(() => {
    fetchTalleres()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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
      const payload = {
        ...formData,
        precio: formData.tipoAcceso === 'gratis' ? '0' : formData.precio,
      }

      if (editingWorkshopId) {
        await updateWorkshop(editingWorkshopId, payload)
      } else {
        await createWorkshop(payload)
      }

      setSubmitStatus('success')
      setSubmitMessage(
        editingWorkshopId
          ? `Taller "${formData.titulo}" actualizado exitosamente.`
          : `Taller "${formData.titulo}" creado exitosamente.`
      )

      // Resetear formulario
      setFormData({
        titulo: '', instructor: '', categoria: '', nivel: '',
        descripcion: '', descripcionLarga: '', fecha: '', hora: '',
        duracion: '', tipoAcceso: 'gratis', precio: '0', ubicacion: '', materiales: 'Incluidos',
        contacto: '', resultados: '', linkReunion: '', plataformaReunion: '',
        cuposTotal: '12', imagenPortada: null,
      })
      setEditingWorkshopId('')
      setPreviewImage(null)

      // Recargar lista
      fetchTalleres()

      // Scroll arriba
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error al crear el taller:', error)
      setSubmitStatus('error')
      let errorMsg = `Error al crear el taller: ${error.message}`
      if (error.status === 401) errorMsg = 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
      else if (error.status === 403) errorMsg = 'No tienes permisos para crear talleres.'
      setSubmitMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el taller "${titulo}"?`)) return
    try {
      setDeletingId(id)
      await deleteWorkshop(id)
      setTalleres(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error eliminando taller:', err)
      alert('Error al eliminar el taller: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditWorkshop = (taller) => {
    setEditingWorkshopId(taller.id)
    setSubmitStatus(null)
    setSubmitMessage('')

    setFormData({
      titulo: taller.titulo || '',
      instructor: taller.instructor || '',
      categoria: taller.categoria || '',
      nivel: taller.nivel || '',
      descripcion: taller.descripcion || '',
      descripcionLarga: taller.descripcionLarga || '',
      fecha: taller.fecha || '',
      hora: taller.hora || '',
      duracion: taller.duracion || '',
      tipoAcceso: taller.tipoAcceso || (Number(taller.precio || 0) > 0 ? 'pago' : 'gratis'),
      precio: String(Number(taller.precio || 0)),
      ubicacion: taller.ubicacion || '',
      materiales: taller.materiales || 'Incluidos',
      contacto: taller.contacto || '',
      resultados: taller.resultados || '',
      linkReunion: taller.linkReunion || '',
      plataformaReunion: taller.plataformaReunion || '',
      cuposTotal: String(taller.cuposTotal || 12),
      imagenPortada: null,
      estado: taller.estado || 'publicado',
    })

    setPreviewImage(taller.imagenPortada || null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingWorkshopId('')
    setSubmitStatus(null)
    setSubmitMessage('')
    setPreviewImage(null)
    setFormData({
      titulo: '', instructor: '', categoria: '', nivel: '',
      descripcion: '', descripcionLarga: '', fecha: '', hora: '',
      tipoAcceso: 'gratis', precio: '0', duracion: '', ubicacion: '', materiales: 'Incluidos',
      contacto: '', resultados: '', linkReunion: '', plataformaReunion: '',
      cuposTotal: '12', imagenPortada: null, estado: 'publicado',
    })
  }

  const isPaidWorkshop = formData.tipoAcceso === 'pago'

  const detectarPlataforma = (url) => {
    if (!url) return ''
    if (url.includes('meet.jit.si') || url.includes('jitsi')) return 'jitsi-meet'
    if (url.includes('meet.google')) return 'google-meet'
    if (url.includes('zoom.us')) return 'zoom'
    if (url.includes('teams.microsoft') || url.includes('teams.live')) return 'microsoft-teams'
    if (url.includes('discord.gg') || url.includes('discord.com')) return 'discord'
    return 'otra'
  }

  return (
    <>
      <style>{adminSharedStyles + globalStyles}</style>
      <AdminLayout activeSection={activeSection}>
        <div className="ad-root db-root">
          {/* ── Header ── */}
          <header className="db-header">
            <div className="db-header-text">
              <p className="db-eyebrow">Creación de contenido</p>
              <h1 className="db-title">
                {editingWorkshopId ? 'Editar Taller' : 'Crear Talleres'}
              </h1>
              <p className="db-subtitle">
                {editingWorkshopId
                  ? 'Actualiza la información del taller seleccionado'
                  : 'Organiza y gestiona los talleres presenciales y virtuales de Maraleste'}
              </p>
            </div>
          </header>

        {/* Status Messages */}
        {submitStatus && (
          <div className={`mb-8 p-6 rounded-sm border ${
            submitStatus === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {submitStatus === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              )}
              <p className="font-light">{submitMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-sm p-12 shadow-lg shadow-black/5 border border-black/5 mb-16">
          {/* Sección: Información Básica */}
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-[0.4em] text-gray-400 font-semibold mb-6 pb-3 border-b border-black/10">
              Información Básica
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Título del Taller *
                </label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange}
                  placeholder="Ej: Pintura al Óleo - Técnicas Clásicas"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Instructor *
                </label>
                <input type="text" name="instructor" value={formData.instructor} onChange={handleChange}
                  placeholder="Nombre del instructor"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Categoría *
                </label>
                <select name="categoria" value={formData.categoria} onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required>
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIAS_TALLER.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Nivel *
                </label>
                <select name="nivel" value={formData.nivel} onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required>
                  <option value="">Seleccionar nivel</option>
                  {NIVELES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Fecha, Hora y Logística */}
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-[0.4em] text-gray-400 font-semibold mb-6 pb-3 border-b border-black/10">
              Fecha, Hora y Logística
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Fecha *
                </label>
                <input type="date" name="fecha" value={formData.fecha} onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Hora *
                </label>
                <input type="text" name="hora" value={formData.hora} onChange={handleChange}
                  placeholder="Ej: 10:00 AM - 2:00 PM"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Duración *
                </label>
                <input type="text" name="duracion" value={formData.duracion} onChange={handleChange}
                  placeholder="Ej: 4 horas"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Ubicación
                </label>
                <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange}
                  placeholder="Ej: Estudio Principal / Virtual"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Tipo de Acceso *
                </label>
                <select
                  name="tipoAcceso"
                  value={formData.tipoAcceso}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      tipoAcceso: value,
                      precio: value === 'gratis' ? '0' : (prev.precio === '0' ? '' : prev.precio),
                    }))
                  }}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                >
                  <option value="gratis">Gratuito</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Precio (COP) {isPaidWorkshop ? '*' : ''}
                </label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange}
                  placeholder={isPaidWorkshop ? '45000' : '0'} min="0" step="1"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required={isPaidWorkshop}
                  disabled={!isPaidWorkshop}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Cupos Totales *
                </label>
                <input type="number" name="cuposTotal" value={formData.cuposTotal} onChange={handleChange}
                  placeholder="12" min="1"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Estado del Taller
                </label>
                <select name="estado" value={formData.estado} onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light">
                  <option value="publicado">🟢 Publicado</option>
                  <option value="inactivo">🔴 Inactivo</option>
                </select>
                <p className="text-xs text-gray-500 font-light mt-2">Los talleres inactivos no aparecerán en la búsqueda pública ni en los dashboards.</p>
              </div>
            </div>
          </div>

          {/* Sección: Link de Reunión Virtual */}
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-[0.4em] text-gray-400 font-semibold mb-6 pb-3 border-b border-black/10">
              🔗 Link de Reunión Virtual
            </h2>
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-sm p-6 mb-6">
              <p className="text-sm text-blue-700 font-light">
                Agrega un enlace de Google Meet, Zoom, Teams u otra plataforma para que los participantes puedan unirse al taller de forma virtual.
                Este link se mostrará a los inscritos en los detalles del taller.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Plataforma de Reunión
                </label>
                <select name="plataformaReunion" value={formData.plataformaReunion} onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light">
                  {PLATAFORMAS_REUNION.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Link de la Reunión
                </label>
                <input type="url" name="linkReunion" value={formData.linkReunion}
                  onChange={(e) => {
                    const url = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      linkReunion: url,
                      plataformaReunion: prev.plataformaReunion || detectarPlataforma(url),
                    }))
                  }}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light" />
              </div>
            </div>
            {formData.linkReunion && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-sm">
                <div className="flex items-center gap-3 text-sm text-green-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-light">Link configurado: <a href={formData.linkReunion} target="_blank" rel="noopener noreferrer" className="underline font-medium">{formData.linkReunion}</a></span>
                </div>
              </div>
            )}
          </div>

          {/* Sección: Contenido y Materiales */}
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-[0.4em] text-gray-400 font-semibold mb-6 pb-3 border-b border-black/10">
              Contenido y Materiales
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Contacto del Instructor
                </label>
                <input type="text" name="contacto" value={formData.contacto} onChange={handleChange}
                  placeholder="Email o teléfono de contacto"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Materiales
                </label>
                <input type="text" name="materiales" value={formData.materiales} onChange={handleChange}
                  placeholder="Ej: Incluidos, Trae tu smartphone..."
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Descripción Corta *
                </label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                  placeholder="Describe brevemente el taller..."
                  rows="3"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Descripción Larga
                </label>
                <textarea name="descripcionLarga" value={formData.descripcionLarga} onChange={handleChange}
                  placeholder="Detalles completos del taller, metodología, qué aprenderán..."
                  rows="5"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Resultados a Obtener
                </label>
                <textarea name="resultados" value={formData.resultados} onChange={handleChange}
                  placeholder="Describe qué aprenderán y lograrán los participantes..."
                  rows="4"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light" />
              </div>
            </div>
          </div>

          {/* Sección: Imagen de Portada */}
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-[0.4em] text-gray-400 font-semibold mb-6 pb-3 border-b border-black/10">
              Imagen de Portada
            </h2>
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Subir Imagen
                </label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black transition font-light file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-black file:text-white file:cursor-pointer" />
                <p className="mt-2 text-xs text-gray-400">JPG, PNG, WEBP o GIF. Máximo 5MB.</p>
              </div>
              {previewImage && (
                <div className="w-40 h-28 rounded-sm overflow-hidden border border-black/10">
                  <img src={previewImage} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-10 py-4 bg-black text-white hover:bg-gray-800 transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {editingWorkshopId ? 'Actualizando taller...' : 'Creando taller...'}
                </>
              ) : (editingWorkshopId ? 'Guardar cambios' : 'Crear Taller')}
            </button>

            {editingWorkshopId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-8 py-4 border border-black/20 text-black hover:bg-black hover:text-white transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        {/* Lista de Talleres Existentes */}
        <div>
          <h3 className="text-2xl font-light mb-8 tracking-tight text-black">Talleres Programados</h3>

          {loadingTalleres && (
            <div className="flex items-center justify-center py-12">
              <svg className="w-6 h-6 animate-spin text-black mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-gray-500 font-light">Cargando talleres...</span>
            </div>
          )}

          {!loadingTalleres && talleres.length === 0 && (
            <div className="text-center py-12 bg-white rounded-sm border border-black/5">
              <div className="text-4xl mb-4">🎭</div>
              <p className="text-gray-500 font-light">No hay talleres programados aún. ¡Crea el primero!</p>
            </div>
          )}

          <div className="space-y-4">
            {talleres.map((taller) => (
              <div key={taller.id} className="bg-white rounded-sm p-6 shadow-md shadow-black/5 border border-black/5 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                  <div className="flex flex-1 items-center gap-3 mb-2">
                    <h4 className="font-light text-lg text-black">{taller.titulo}</h4>
                    {taller.estado === 'inactivo' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] uppercase tracking-wider rounded-sm border border-red-200">
                        🔴 Inactivo
                      </span>
                    )}
                    {taller.linkReunion && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase tracking-wider rounded-sm border border-blue-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Virtual
                      </span>
                    )}
                  </div>
                    <p className="text-sm text-gray-500 font-light">
                      {taller.fecha} • {taller.hora} • {taller.instructor} • {taller.cuposDisponibles}/{taller.cuposTotal} cupos
                      {taller.linkReunion && (
                        <> • <a href={taller.linkReunion} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link de reunión</a></>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/workshops`)}
                      className="px-6 py-2 border border-black/20 text-[10px] uppercase tracking-wider font-medium hover:bg-black hover:text-white transition">
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditWorkshop(taller)}
                      className="px-6 py-2 border border-amber-300 text-amber-700 text-[10px] uppercase tracking-wider font-medium hover:bg-amber-50 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(taller.id, taller.titulo)}
                      disabled={deletingId === taller.id}
                      className="px-6 py-2 border border-red-300 text-red-600 text-[10px] uppercase tracking-wider font-medium hover:bg-red-50 transition disabled:opacity-50">
                      {deletingId === taller.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </AdminLayout>
    </>
  )
}

export default CreateWorkshops
