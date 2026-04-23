import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../config/firebase'
import api from '../../api/apiClient'
import Footer from '../../components/layouts/Footer'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleThirdPartyLogin = (provider) => {
    console.log(`Login with ${provider}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()

      // 2. Obtener perfil del backend para conocer el rol
      const res = await api.get('/auth/profile', { token })
      const profileData = res?.data || res || {}
      const rol = String(profileData?.rol || 'cliente').trim().toLowerCase()

      const redirectParam = searchParams.get('redirect')
      const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null
      const fromPath = location.state?.from?.pathname
      const fromSearch = location.state?.from?.search || ''
      const stateRedirect = fromPath ? `${fromPath}${fromSearch}` : null
      const targetPath = safeRedirect || stateRedirect

      // 3. Redirigir según el rol
      const redirectMap = {
        admin: '/admin/dashboard',
        docente: '/admin/dashboard',
        cliente: '/customer/dashboard',
      }

      const isAdminLike = rol === 'admin' || rol === 'docente'
      const isCustomerPath = Boolean(targetPath && targetPath.startsWith('/customer'))

      if (targetPath && !targetPath.startsWith('/login') && !(isAdminLike && isCustomerPath)) {
        navigate(targetPath, { replace: true })
        return
      }

      navigate(redirectMap[rol] || '/')
    } catch (err) {
      const firebaseErrors = {
        'auth/user-not-found': 'No existe una cuenta con este correo',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-credential': 'Correo o contraseña incorrectos',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/invalid-email': 'El correo electrónico no es válido',
      }
      setError(firebaseErrors[err.code] || err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#f6f6f3] via-[#eceae4] to-[#fafafa] text-[#1a1a1a] min-h-screen selection:bg-gray-200/70">
      <nav className="border-b border-black/5 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="text-xl font-light tracking-[0.4em] text-black hover:text-gray-700 transition-colors">
            MARALESTE <br/> Arte y Expansión
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.4em] text-gray-500">
            <a href="/" className="hover:text-black transition font-medium">Inicio</a>
          </div>
          <a href="/register" className="hidden md:inline-flex text-[11px] uppercase tracking-[0.4em] font-medium text-black/70 hover:text-black transition">
            Crear cuenta
          </a>
        </div>
      </nav>

      <section className="relative px-6 lg:px-12 py-16 lg:py-24 min-h-[calc(100vh-80px)] flex items-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/80 via-white/40 to-transparent blur-3xl" />
          <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto grid gap-16 lg:grid-cols-2 items-center w-full">
          {/* Panel izquierdo — branding y resumen */}
          <div className="space-y-10 hidden lg:block">
            <header className="space-y-5">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Plataforma creativa</span>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-black leading-tight">
                Bienvenido de vuelta
              </h1>
              <p className="text-base text-gray-500 max-w-md leading-relaxed">
                Gestiona cursos, talleres y tu portafolio desde un solo lugar.
              </p>
            </header>

            <div className="space-y-5">
              {[
                { icon: '◈', text: 'Cursos y talleres en un solo panel' },
                { icon: '◈', text: 'Métricas y reportes en tiempo real' },
                { icon: '◈', text: 'Seguridad con cifrado de extremo a extremo' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <span className="text-black/30 text-lg">{icon}</span>
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-black/5">
              <p className="text-xs text-gray-400">
                ¿Necesitas ayuda? <a href="mailto:soporte@maraleste.com" className="text-black/60 hover:text-black transition underline underline-offset-4">soporte@maraleste.com</a>
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-xl shadow-black/10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-black mb-3">Iniciar sesión</h2>
                <p className="text-sm text-gray-500">Accede a tu cuenta para continuar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition pr-16"
                      autoComplete="current-password"
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

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <Link to="/forgot-password" className="uppercase tracking-[0.3em] font-medium text-gray-500 hover:text-black transition">
                    Recuperar clave
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-black text-white text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-gray-900 transition shadow-lg shadow-black/10 disabled:pointer-events-none disabled:opacity-70"
                >
                  {isLoading ? 'Validando…' : 'Acceder al panel'}
                </button>
              </form>

              <div className="mt-10 text-center text-xs text-gray-500">
                <p>
                  ¿Aún no formas parte de Maraleste?{' '}
                  <a href="/register" className="font-medium text-black hover:underline underline-offset-4">
                    Crea tu cuenta
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

export default Login
