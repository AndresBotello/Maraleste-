import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { useAuth } from '../../context/AuthContext'

function AdminProfile() {
  const { user, profile, updateProfileData, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || user?.email || '',
    })
  }, [profile, user])

  const isDirty = useMemo(() => {
    return (
      formData.firstName.trim() !== (profile?.firstName || '').trim() ||
      formData.lastName.trim() !== (profile?.lastName || '').trim() ||
      formData.email.trim().toLowerCase() !== (profile?.email || user?.email || '').trim().toLowerCase()
    )
  }, [formData, profile, user])

  const roleLabel = profile?.rol === 'admin'
    ? 'Administrador'
    : profile?.rol === 'docente'
      ? 'Docente'
      : 'Cliente'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
    }

    if (!payload.firstName || !payload.lastName || !payload.email) {
      setErrorMessage('Completa nombre, apellido y correo para guardar los cambios.')
      return
    }

    try {
      setSaving(true)
      await updateProfileData(payload)
      await refreshProfile()
      setSuccessMessage('Tu perfil se actualizo correctamente.')
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo actualizar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout activeSection="profile">
      <div className="space-y-10">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Perfil</p>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900">Editar informacion de la cuenta</h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Puedes actualizar tu nombre, apellido y correo. El rol es informativo y no se puede modificar.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-start">
          <aside className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-lg shadow-black/5 backdrop-blur-sm space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Rol actual</p>
              <p className="mt-2 text-lg font-medium text-black">{roleLabel}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-gray-600">
              Este dato se administra por permisos del sistema y no esta disponible para edicion desde este formulario.
            </div>
          </aside>

          <section className="rounded-3xl border border-black/10 bg-white p-8 lg:p-10 shadow-xl shadow-black/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Nombre</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    placeholder="Tu nombre"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Apellido</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    placeholder="Tu apellido"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Correo</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                  placeholder="correo@ejemplo.com"
                />
              </label>

              {errorMessage && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
              )}

              {successMessage && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="inline-flex items-center justify-center rounded-xl border border-black px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white"
                >
                  Volver
                </button>
              </div>
            </form>
          </section>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminProfile
