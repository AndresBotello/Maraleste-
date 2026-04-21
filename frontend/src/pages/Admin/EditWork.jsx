import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { getArtworkById, updateArtwork } from '../../services/artworkService'

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
}

function EditWork() {
  const { artworkId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [currentImage, setCurrentImage] = useState('')
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    let isMounted = true

    async function loadArtwork() {
      if (!artworkId) {
        setMessage({ text: 'No se encontró la obra a editar.', type: 'error' })
        setLoadingInitial(false)
        return
      }

      try {
        setLoadingInitial(true)
        const artwork = await getArtworkById(artworkId)
        if (!isMounted) return

        setFormData({
          titulo: artwork.titulo || '',
          autor: artwork.autor || '',
          modalidad: artwork.modalidad || '',
          tecnica: artwork.tecnica || '',
          medidas: artwork.medidas || '',
          anio: artwork.anio ? String(artwork.anio) : '',
          descripcion: artwork.descripcion || '',
          procesoObra: artwork.procesoObra || '',
          historiaObra: artwork.historiaObra || '',
          videoURL: artwork.videoURL || '',
        })
        setCurrentImage(artwork.imagenPortada || '')
      } catch (err) {
        if (!isMounted) return
        setMessage({ text: err.message || 'No se pudo cargar la obra.', type: 'error' })
      } finally {
        if (isMounted) setLoadingInitial(false)
      }
    }

    loadArtwork()

    return () => {
      isMounted = false
    }
  }, [artworkId])

  useEffect(() => {
    return () => {
      if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    }
  }, [imagenPreview])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Solo se permiten imágenes JPG, PNG, WEBP o GIF.', type: 'error' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'La imagen no debe superar los 5MB.', type: 'error' })
      return
    }

    if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
    setMessage({ text: '', type: '' })
  }

  const removeSelectedImage = () => {
    if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    setImagenFile(null)
    setImagenPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!artworkId) return

    try {
      setSaving(true)
      setMessage({ text: '', type: '' })
      await updateArtwork(artworkId, formData, imagenFile)
      setMessage({ text: 'Obra actualizada exitosamente.', type: 'success' })
      removeSelectedImage()
    } catch (err) {
      const errorMsg = err.details
        ? (Array.isArray(err.details) ? err.details.join(', ') : err.details)
        : err.message || 'Error al actualizar la obra.'
      setMessage({ text: errorMsg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const imageToDisplay = imagenPreview || currentImage

  return (
    <AdminLayout activeSection="obras">
      <section>
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-2 tracking-tight text-black">Editar Obra</h1>
            <p className="text-lg text-gray-500 font-light">Actualiza la información y la imagen de esta obra.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/obras"
              className="px-4 py-2 border border-black/15 text-black text-xs uppercase tracking-wider hover:bg-black/5 transition"
            >
              Volver
            </Link>
            <button
              type="button"
              onClick={() => navigate('/admin/obras')}
              className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition"
            >
              Ver listado
            </button>
          </div>
        </div>

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

        {loadingInitial ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-black" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-gray-500 font-light">Cargando obra...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-sm p-12 shadow-lg shadow-black/5 border border-black/5">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Título de la Obra
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Autor
                </label>
                <input
                  type="text"
                  name="autor"
                  value={formData.autor}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Modalidad
                </label>
                <input
                  type="text"
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Técnica
                </label>
                <input
                  type="text"
                  name="tecnica"
                  value={formData.tecnica}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Medidas
                </label>
                <input
                  type="text"
                  name="medidas"
                  value={formData.medidas}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Año
                </label>
                <input
                  type="number"
                  name="anio"
                  value={formData.anio}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Proceso de la Obra
                </label>
                <textarea
                  name="procesoObra"
                  value={formData.procesoObra}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Historia de la Obra
                </label>
                <textarea
                  name="historiaObra"
                  value={formData.historiaObra}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  URL del Video (Explicación del Proceso)
                </label>
                <input
                  type="url"
                  name="videoURL"
                  value={formData.videoURL}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                  Imagen de la Obra
                </label>

                {!imageToDisplay ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-black/20 rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer hover:border-black/40 hover:bg-gray-50 transition"
                  >
                    <p className="text-sm text-gray-500 font-light mb-1">Haz clic para seleccionar una imagen</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP o GIF — Máximo 5MB</p>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={imageToDisplay}
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
                      {imagenFile && (
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className="px-4 py-2 bg-red-600 text-white text-xs uppercase tracking-wider font-medium hover:bg-red-700 transition"
                        >
                          Quitar nueva
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagenFile && (
                  <p className="mt-2 text-xs text-gray-500 font-light">
                    Nueva imagen: {imagenFile.name} — {(imagenFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`mt-10 w-full px-10 py-4 text-white transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/10 ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        )}
      </section>
    </AdminLayout>
  )
}

export default EditWork
