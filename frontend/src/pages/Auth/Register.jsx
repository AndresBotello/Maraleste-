import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/layouts/Footer'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const sellingPoints = useMemo(
    () => [
      {
        title: 'Itinerarios guiados',
        description: 'Aprende paso a paso con módulos que combinan teoría, práctica y retroalimentación personalizada.',
      },
      {
        title: 'Comunidad creativa',
        description: 'Conecta con artistas emergentes, comparte tus avances y recibe mentoría en vivo cada semana.',
      },
      {
        title: 'Experiencia premium',
        description: 'Acceso ilimitado a bibliotecas de recursos, certificaciones digitales y eventos exclusivos.',
      },
    ],
    []
  )

  const contactInfo = useMemo(
    () => ({
      email: 'soporte@maraleste.com',
      schedule: 'Lunes a viernes · 9:00 - 18:00 (GMT-3)',
    }),
    []
  )

  const handleThirdPartyRegister = (provider) => {
    console.log(`Register with ${provider}`)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Validar longitud mínima de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      })

      navigate('/customer/dashboard')
    } catch (err) {
      const firebaseErrors = {
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email': 'El correo electrónico no es válido',
        'auth/weak-password': 'La contraseña es demasiado débil',
      }
      setError(firebaseErrors[err.code] || err.message || 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-gradient-to-br from-[#f6f6f3] via-[#eceae4] to-[#fafafa] text-[#1a1a1a] min-h-screen selection:bg-gray-200/70">
      <header className="border-b border-black/5 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="text-xl lg:text-2xl font-light tracking-[0.4em] text-black hover:text-gray-700 transition">
            MARALESTE
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.4em] text-gray-500">
            <Link to="/about" className="hover:text-black transition font-medium">Estudios</Link>
            <Link to="/workshops" className="hover:text-black transition font-medium">Talleres</Link>
            <Link to="/courses" className="hover:text-black transition font-medium">Cursos</Link>
            <Link to="/works" className="hover:text-black transition font-medium">Obras</Link>
          </nav>
          <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-medium">
            <Link to="/" className="text-black/70 hover:text-black transition">Volver al inicio</Link>
            <Link to="/login" className="text-black hover:underline underline-offset-4">Iniciar sesión</Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-sm font-medium uppercase tracking-[0.3em] text-black"
          >
            {menuOpen ? 'Cerrar' : 'Menú'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-black/5 bg-white/90 px-6 py-6 space-y-6 text-[11px] uppercase tracking-[0.3em] text-gray-600">
            <Link to="/about" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Estudios</Link>
            <Link to="/workshops" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Talleres</Link>
            <Link to="/courses" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Cursos</Link>
            <Link to="/works" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Obras</Link>
            <Link to="/" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Volver al inicio</Link>
            <Link to="/login" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
          </div>
        )}
      </header>

      <section className="relative px-6 lg:px-12 py-16 lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/80 via-white/40 to-transparent blur-3xl" />
          <div className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_1fr] items-start">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Bienvenido a Maraleste</span>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-black leading-tight">
                Formación artística sin fronteras
              </h1>
              <p className="text-base lg:text-lg text-gray-600 max-w-xl leading-relaxed">
                Diseñamos experiencias inmersivas para artistas contemporáneos. Desarrolla tu portfolio, afianza tu estilo y abre nuevas oportunidades profesionales junto a expertos de la industria.
              </p>
              <div className="grid gap-6 sm:grid-cols-3">
                <article className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-5 py-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">Comunidad</p>
                  <p className="text-3xl font-light text-black">+6K</p>
                  <p className="text-xs text-gray-500 mt-2">Artistas activos compartiendo proyectos cada mes.</p>
                </article>
                <article className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-5 py-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">Mentores</p>
                  <p className="text-3xl font-light text-black">40+</p>
                  <p className="text-xs text-gray-500 mt-2">Profesionales del arte visual y digital a tu disposición.</p>
                </article>
                <article className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-5 py-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">Programas</p>
                  <p className="text-3xl font-light text-black">18</p>
                  <p className="text-xs text-gray-500 mt-2">Rutas de aprendizaje con certificados avalados.</p>
                </article>
              </div>
            </header>
          </div>

          <div className="w-full">
            <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-xl shadow-black/10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-black mb-4">Crear cuenta</h2>
                <p className="text-sm text-gray-500">Regístrate para comenzar tu recorrido. Podrás editar tus datos más adelante.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Tu apellido"
                      className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition pr-16"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-2 flex items-center px-3 text-[11px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition"
                      >
                        {showPassword ? 'Ocultar' : 'Ver'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                      Confirmar
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition pr-16"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-2 flex items-center px-3 text-[11px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition"
                      >
                        {showConfirmPassword ? 'Ocultar' : 'Ver'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-light">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border border-black/30 cursor-pointer"
                      required
                    />
                    <span className="text-gray-600 group-hover:text-black transition">
                      Acepto los <a href="#" className="font-medium underline underline-offset-4">términos y condiciones</a> de Maraleste.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="privacyAccepted"
                      checked={formData.privacyAccepted}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border border-black/30 cursor-pointer"
                      required
                    />
                    <span className="text-gray-600 group-hover:text-black transition">
                      Acepto la <a href="#" className="font-medium underline underline-offset-4">política de privacidad</a> y el uso de mis datos.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-black text-white text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-gray-900 transition shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-black/10" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400">O continúa con</span>
                <div className="flex-1 h-px bg-black/10" />
              </div>

              <div className="mt-10 text-center text-xs text-gray-500">
                <p>
                  ¿Ya tienes una cuenta?{' '}
                  <a href="/login" className="font-medium text-black hover:underline underline-offset-4">
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Register
