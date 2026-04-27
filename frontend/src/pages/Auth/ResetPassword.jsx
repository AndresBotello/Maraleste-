import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '../../config/firebase'
import Footer from '../../components/layouts/Footer'
import authSharedStyles from './AuthSharedStyles'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingCode, setIsCheckingCode] = useState(true)
  const [isCodeValid, setIsCodeValid] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams])

  useEffect(() => {
    const validateCode = async () => {
      if (!oobCode) {
        navigate('/login')
        return
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode)
        setEmail(userEmail)
        setIsCodeValid(true)
      } catch {
        navigate('/login')
      } finally {
        setIsCheckingCode(false)
      }
    }

    validateCode()
  }, [oobCode, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isCodeValid) {
      setError('No se puede restablecer la contraseña con un enlace inválido.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setIsLoading(true)

    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess('Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.')
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError('No se pudo restablecer la contraseña. Solicita un nuevo enlace.')
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
            Ir a login
          </Link>
        </div>
      </nav>


      <Footer />
    </div>
  )
}

export default ResetPassword
