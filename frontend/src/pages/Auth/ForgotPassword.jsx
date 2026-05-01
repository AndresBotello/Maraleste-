import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../services/authService'
import Footer from '../../components/layouts/Footer'
import authSharedStyles from './AuthSharedStyles'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      setSuccess('Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña.')
      setEmail('')
    } catch (err) {
      const firebaseErrors = {
        'auth/invalid-email': 'El correo electrónico no es válido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/unauthorized-continue-uri': 'La URL de recuperación no está autorizada en Firebase.',
        'auth/invalid-continue-uri': 'La URL de recuperación no es válida.',
        'auth/unauthorized-domain': 'El dominio desplegado no está autorizado en Firebase Auth.',
      }
      const firebaseMessage = err?.code ? `${err.code}${err.message ? `: ${err.message}` : ''}` : ''
      setError(firebaseErrors[err.code] || firebaseMessage || 'No pudimos procesar la solicitud de recuperación.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-root bg-gradient-to-br from-[#f6f6f3] via-[#eceae4] to-[#fafafa] text-[#1a1a1a] min-h-screen selection:bg-gray-200/70">
      <style>{authSharedStyles}</style>
      <nav className="auth-header border-b border-black/5 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="auth-shell max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="auth-brand text-xl lg:text-2xl font-light tracking-[0.4em] text-black">MARALESTE</div>
          <Link to="/login" className="auth-link text-[11px] uppercase tracking-[0.4em] font-medium text-black/70 hover:text-black transition">
            Volver a iniciar sesión
          </Link>
        </div>
      </nav>

      <section className="relative px-6 lg:px-12 py-16 lg:py-24 min-h-[calc(100vh-80px)] flex items-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/80 via-white/40 to-transparent blur-3xl" />
          <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="auth-panel rounded-3xl border border-black/10 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-xl shadow-black/10">
            <div className="text-center mb-10">
              <h1 className="auth-section-title text-3xl font-light text-black mb-3">Recuperar contraseña</h1>
              <p className="auth-muted text-sm text-gray-500">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="auth-error rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-success rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="email" className="auth-label block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="auth-input w-full h-12 rounded-xl border border-black/10 bg-white px-5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="auth-btn auth-btn--solid w-full h-12 rounded-xl bg-black text-white text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-gray-900 transition shadow-lg shadow-black/10 disabled:pointer-events-none disabled:opacity-70"
              >
                {isLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
              </button>
            </form>

            <div className="mt-10 text-center text-xs text-gray-500">
              <p>
                ¿Recordaste tu contraseña?{' '}
                <Link to="/login" className="auth-link font-medium text-black hover:underline underline-offset-4">
                  Volver al login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ForgotPassword
