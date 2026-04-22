import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { createArtwork, getArtworks, deleteArtwork, toggleArtworkVisibility } from '../../services/artworkService'

const INITIAL_FORM = {
  titulo: '',
  autor: '',
  modalidad: '',
  tecnica: '',
  medidas: '',
  anio: '',
  descripcion: '',
  procesoObra: '',
  historiaObra: '',
  videoURL: '',
  visible: true,
}

function ManageWorks() {
  const [activeSection] = useState('obras')
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingObras, setLoadingObras] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loadingVisibility, setLoadingVisibility] = useState({})
  const fileInputRef = useRef(null)

  // Cargar obras al montar
  useEffect(() => {
    fetchObras()
  }, [])

  async function fetchObras() {
    setLoadingObras(true)
    try {
      const data = await getArtworks()
      setObras(data || [])
    } catch (err) {
      console.error('Error al cargar obras:', err)
      setObras([])
    } finally {
      setLoadingObras(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Solo se permiten imágenes JPG, PNG, WEBP o GIF.', type: 'error' })
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'La imagen no debe superar los 5MB.', type: 'error' })
      return
    }

    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
    setMessage({ text: '', type: '' })
  }

  const removeImage = () => {
    setImagenFile(null)
    setImagenPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      await createArtwork(formData, imagenFile)
      setMessage({ text: '¡Obra creada exitosamente!', type: 'success' })
      setFormData(INITIAL_FORM)
      removeImage()
      fetchObras()
    } catch (err) {
      const errorMsg = err.details
        ? (Array.isArray(err.details) ? err.details.join(', ') : err.details)
        : err.message || 'Error al crear la obra'
      setMessage({ text: errorMsg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta obra?')) return

    try {
      await deleteArtwork(id)
      setMessage({ text: 'Obra eliminada correctamente.', type: 'success' })
      fetchObras()
    } catch (err) {
      setMessage({ text: err.message || 'Error al eliminar la obra', type: 'error' })
    }
  }

  const handleToggleVisibility = async (id, currentVisible) => {
    setLoadingVisibility((prev) => ({ ...prev, [id]: true }))
    try {
      const updatedObra = await toggleArtworkVisibility(id, !currentVisible)
      setObras((prevObras) =>
        prevObras.map((obra) => (obra.id === id ? updatedObra : obra))
      )
      setMessage({
        text: `Obra ${updatedObra.visible ? 'visible' : 'oculta'} correctamente.`,
        type: 'success',
      })
    } catch (err) {
      setMessage({ text: err.message || 'Error al cambiar visibilidad', type: 'error' })
    } finally {
      setLoadingVisibility((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Helper para normalizar visibilidad (obras sin el campo son visibles por defecto)
  const isObraVisible = (obra) => obra.visible !== false

  // Limpiar URL de preview al desmontar
  useEffect(() => {
    return () => {
      if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    }
  }, [imagenPreview])

  return (
    <AdminLayout activeSection={activeSection}>
      <section>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-black">
            Gestionar Obras
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Administra las obras que aparecerán en la galería de la página principal
          </p>
        </div>

        {/* Mensaje de estado */}
        {message.text && (
          <div
            className={`mb-8 px-6 py-4 rounded-sm text-sm font-light ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-sm p-12 shadow-lg shadow-black/5 border border-black/5 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Título */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Título de la Obra
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Flores Marchitas II"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Autor */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Autor
              </label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                placeholder="Nombre del autor"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Modalidad */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Modalidad
              </label>
              <input
                type="text"
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                placeholder="Ej: Pintura, Escultura, Instalación..."
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Técnica */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Técnica
              </label>
              <input
                type="text"
                name="tecnica"
                value={formData.tecnica}
                onChange={handleChange}
                placeholder="Ej: Óleo sobre lienzo, Acuarela..."
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Medidas */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Medidas
              </label>
              <input
                type="text"
                name="medidas"
                value={formData.medidas}
                onChange={handleChange}
                placeholder="Ej: 100 x 80 cm"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Año */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Año
              </label>
              <input
                type="number"
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                placeholder="Ej: 2024"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe la obra, su contexto y significado..."
                rows="4"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Proceso de la Obra */}
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Proceso de la Obra
              </label>
              <textarea
                name="procesoObra"
                value={formData.procesoObra}
                onChange={handleChange}
                placeholder="Describe paso a paso cómo se realizó la obra..."
                rows="4"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
              />
            </div>

            {/* Historia de la Obra */}
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Historia de la Obra
              </label>
              <textarea
                name="historiaObra"
                value={formData.historiaObra}
                onChange={handleChange}
                placeholder="Cuéntanos la historia, inspiración y contexto detrás de esta obra..."
                rows="4"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
              />
            </div>

            {/* URL del Video */}
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                URL del Video (Explicación del Proceso)
              </label>
              <input
                type="url"
                name="videoURL"
                value={formData.videoURL}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=... o URL de video"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
              />
            </div>

            {/* Visibilidad */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="visible"
                  checked={formData.visible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, visible: e.target.checked }))}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm text-gray-700 font-light">
                  Mostrar esta obra en la galería (hacerla visible para los clientes)
                </span>
              </label>
            </div>

            {/* Subida de Imagen */}
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Imagen de la Obra
              </label>

              {!imagenPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-black/20 rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer hover:border-black/40 hover:bg-gray-50 transition"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-light mb-1">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG, WEBP o GIF — Máximo 5MB
                  </p>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="w-full max-h-80 object-cover rounded-sm border border-black/10"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-black text-xs uppercase tracking-wider font-medium hover:bg-gray-100 transition"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-4 py-2 bg-red-600 text-white text-xs uppercase tracking-wider font-medium hover:bg-red-700 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 font-light">
                    {imagenFile?.name} — {(imagenFile?.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-10 w-full px-10 py-4 text-white transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/10 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creando obra...
              </span>
            ) : (
              'Crear Obra'
            )}
          </button>
        </form>

        {/* Lista de Obras */}
        <div>
          <h3 className="text-2xl font-light mb-8 tracking-tight text-black">Obras Recientes</h3>

          {loadingObras ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-black" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="ml-3 text-gray-500 font-light">Cargando obras...</span>
            </div>
          ) : obras.length === 0 ? (
            <div className="bg-white rounded-sm p-12 shadow-md shadow-black/5 border border-black/5 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-light">No hay obras registradas aún.</p>
              <p className="text-sm text-gray-400 font-light mt-1">Crea tu primera obra usando el formulario de arriba.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {obras.map((obra) => (
                <div key={obra.id} className="bg-white rounded-sm shadow-md shadow-black/5 border border-black/5 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {obra.imagenPortada ? (
                    <img
                      src={obra.imagenPortada}
                      alt={obra.titulo}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-light text-lg text-black">{obra.titulo}</h4>
                      <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full whitespace-nowrap ${
                        isObraVisible(obra)
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isObraVisible(obra) ? 'Visible' : 'Oculta'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      {obra.autor} · {obra.anio} · {obra.modalidad}
                    </p>
                    <p className="text-sm text-gray-500 font-light mb-1">{obra.tecnica}</p>
                    <p className="text-sm text-gray-500 font-light mb-4 line-clamp-2">{obra.descripcion}</p>
                    <div className="flex gap-3">
                      <Link
                        to={`/admin/obras/${obra.id}/editar`}
                        className="flex-1 px-4 py-2 border border-black/20 text-black text-[10px] uppercase tracking-wider font-medium hover:bg-black/5 transition text-center"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleVisibility(obra.id, isObraVisible(obra))}
                        disabled={loadingVisibility[obra.id]}
                        className={`flex-1 px-4 py-2 border text-[10px] uppercase tracking-wider font-medium transition ${
                          isObraVisible(obra)
                            ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50 disabled:bg-yellow-100'
                            : 'border-green-300 text-green-600 hover:bg-green-50 disabled:bg-green-100'
                        }`}
                      >
                        {loadingVisibility[obra.id] ? (
                          <span className="flex items-center justify-center gap-1">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </span>
                        ) : isObraVisible(obra) ? (
                          'Ocultar'
                        ) : (
                          'Mostrar'
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(obra.id)}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 text-[10px] uppercase tracking-wider font-medium hover:bg-red-50 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}

export default ManageWorks
