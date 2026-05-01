import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { getArtworkById, updateArtwork } from '../../services/artworkService'
import adminSharedStyles from './AdminSharedStyles'
import globalStyles from './DashboardStyles'

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
    <>
      <style>{adminSharedStyles + globalStyles}</style>
      <AdminLayout activeSection="obras">
        <div className="ad-root db-root">
        </div>
      </AdminLayout>
    </>
  )
}

export default EditWork
