import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/layouts/Footer'

function Profile() {
	const { user, profile, updateProfileData, refreshProfile } = useAuth()
	const navigate = useNavigate()
	const fileInputRef = useRef(null)

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
	})
	const [saving, setSaving] = useState(false)
	const [photoFile, setPhotoFile] = useState(null)
	const [photoPreview, setPhotoPreview] = useState('')
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
			formData.email.trim().toLowerCase() !== (profile?.email || user?.email || '').trim().toLowerCase() ||
			!!photoFile
		)
	}, [formData, profile, user, photoFile])

	const initials = useMemo(() => {
		const first = (formData.firstName || profile?.firstName || user?.displayName || 'U').trim()
		const last = (formData.lastName || profile?.lastName || '').trim()
		return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
	}, [formData.firstName, formData.lastName, profile, user])

	const avatarSrc = useMemo(() => {
		return photoPreview || profile?.fotoPerfil || user?.photoURL || ''
	}, [photoPreview, profile, user])

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handlePhotoChange = (event) => {
		const file = event.target.files?.[0]
		if (!file) return

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
		if (!allowedTypes.includes(file.type)) {
			setErrorMessage('Solo se permiten imágenes JPG, PNG, WEBP o GIF.')
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			setErrorMessage('La imagen no debe superar los 5MB.')
			return
		}

		if (photoPreview) {
			URL.revokeObjectURL(photoPreview)
		}

		setPhotoFile(file)
		setPhotoPreview(URL.createObjectURL(file))
		setErrorMessage('')
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
			await updateProfileData(payload, photoFile)
			await refreshProfile()
			if (photoPreview) {
				URL.revokeObjectURL(photoPreview)
			}
			setPhotoFile(null)
			setPhotoPreview('')
			if (fileInputRef.current) fileInputRef.current.value = ''
			setSuccessMessage('Tu perfil se actualizó correctamente.')
		} catch (error) {
			setErrorMessage(error.message || 'No se pudo actualizar el perfil.')
		} finally {
			setSaving(false)
		}
	}

	useEffect(() => {
		return () => {
			if (photoPreview) URL.revokeObjectURL(photoPreview)
		}
	}, [photoPreview])

	return (
		<div className="bg-gradient-to-br from-[#f6f6f3] via-[#eceae4] to-[#fafafa] text-[#1a1a1a] min-h-screen">
			<header className="border-b border-black/5 sticky top-0 z-40 bg-white/70 backdrop-blur-xl">
				<div className="px-4 md:px-8 lg:px-12 py-4 md:py-5 flex items-center justify-between gap-3 md:gap-4">
					<Link to="/" className="text-lg md:text-xl lg:text-2xl font-light tracking-[0.3em] md:tracking-[0.4em] text-black">
						MARALESTE
					</Link>
					<button
						type="button"
						onClick={() => navigate('/customer/dashboard')}
						className="rounded-xl border border-black px-3 md:px-5 py-2 md:py-2 text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition"
					>
						Volver
					</button>
				</div>
			</header>

			<main className="px-4 md:px-8 lg:px-12 py-10 md:py-14 lg:py-20">
				<section className="grid gap-6 md:gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
					<aside className="rounded-3xl border border-black/10 bg-white/80 p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur-sm">
						<div className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-4">
							<div className="h-16 w-16 flex-shrink-0 rounded-full border border-black/10 bg-black/5 overflow-hidden flex items-center justify-center">
								{avatarSrc ? (
									<img src={avatarSrc} alt="Foto de perfil" className="h-full w-full object-cover" />
								) : (
									<span className="text-lg font-semibold tracking-wide text-black">{initials || 'U'}</span>
								)}
							</div>
							<div className="text-center md:text-left">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="rounded-lg border border-black/15 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white transition"
								>
									Cambiar foto
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/png,image/webp,image/gif"
									onChange={handlePhotoChange}
									className="hidden"
								/>
								<p className="mt-2 text-xs text-gray-500">JPG, PNG, WEBP o GIF · Máx. 5MB</p>
							</div>
						</div>

						<p className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Perfil de usuario</p>
						<h1 className="mt-4 text-2xl md:text-3xl font-light text-black leading-tight">Edita tu información personal</h1>
						<p className="mt-4 text-xs md:text-sm text-gray-600 leading-relaxed">
							Puedes actualizar tus datos de contacto para mantener tu cuenta al día y sincronizar tu cuenta con la plataforma.
						</p>
					</aside>

					<section className="rounded-3xl border border-black/10 bg-white/90 p-6 md:p-8 lg:p-10 shadow-xl shadow-black/10">
						<form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
							<div className="grid gap-4 md:gap-5 md:grid-cols-2">
								<label className="space-y-2">
									<span className="text-[10px] md:text-[10px] uppercase tracking-[0.3em] text-gray-500">Nombre</span>
									<input
										type="text"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
										required
										className="w-full rounded-xl border border-black/10 bg-white px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
										placeholder="Tu nombre"
									/>
								</label>

								<label className="space-y-2">
									<span className="text-[10px] md:text-[10px] uppercase tracking-[0.3em] text-gray-500">Apellido</span>
									<input
										type="text"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
										required
										className="w-full rounded-xl border border-black/10 bg-white px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
										placeholder="Tu apellido"
									/>
								</label>
							</div>

							<label className="space-y-2 block">
								<span className="text-[10px] md:text-[10px] uppercase tracking-[0.3em] text-gray-500">Correo</span>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="w-full rounded-xl border border-black/10 bg-white px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
									placeholder="correo@ejemplo.com"
								/>
							</label>

							{errorMessage && (
								<p className="rounded-xl border border-red-200 bg-red-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-600">{errorMessage}</p>
							)}

							{successMessage && (
								<p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-emerald-700">{successMessage}</p>
							)}

							<div className="flex flex-col gap-2 md:gap-3 md:flex-row">
								<button
									type="submit"
									disabled={saving || !isDirty}
									className="inline-flex items-center justify-center rounded-xl bg-black px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition"
								>
									{saving ? 'Guardando...' : 'Guardar cambios'}
								</button>
								<button
									type="button"
									onClick={() => navigate('/customer/dashboard')}
									className="inline-flex items-center justify-center rounded-xl border border-black px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition"
								>
									Cancelar
								</button>
							</div>
						</form>
					</section>
				</section>
			</main>

			<Footer />
		</div>
	)
}

export default Profile
