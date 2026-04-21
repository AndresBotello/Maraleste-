import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { registerUser, updateUserProfile } from '../services/authService'
import api from '../api/apiClient'

function normalizeProfileResponse(response) {
  if (!response || typeof response !== 'object') return null
  return response.data !== undefined ? response.data : response
}

const fallbackAuthContext = {
  user: null,
  profile: null,
  loading: true,
  getToken: async () => null,
  register: async () => ({ firebaseUser: null, profile: null }),
  logout: async () => {},
  refreshProfile: async () => null,
  updateProfileData: async () => null,
  isAuthenticated: false,
}

const AuthContext = createContext(fallbackAuthContext)

/**
 * Provider de autenticación.
 * Envuelve la app y expone el usuario actual, perfil, registro y logout.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshProfile(firebaseUser = user) {
    if (!firebaseUser) {
      setProfile(null)
      return null
    }

    const token = await firebaseUser.getIdToken()
    const res = await api.get('/auth/profile', { token })
    const profileData = normalizeProfileResponse(res)
    setProfile(profileData)
    return profileData
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // Cargar perfil desde el backend
        try {
          await refreshProfile(firebaseUser)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  /**
   * Obtiene el token JWT del usuario actual (para enviar al backend).
   * @returns {Promise<string|null>}
   */
  async function getToken() {
    if (!user) return null
    return user.getIdToken()
  }

  /**
   * Registra un nuevo usuario (Firebase Auth + Firestore).
   * @param {Object} data - { firstName, lastName, email, password, rol }
   */
  async function register(data) {
    const result = await registerUser(data)
    const profileData = normalizeProfileResponse(result.profile)
    setProfile(profileData)
    return result
  }

  /**
   * Cierra sesión.
   */
  async function logout() {
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  /**
   * Actualiza datos del perfil en backend y sincroniza el estado local.
   * El rol no puede modificarse por API.
   */
  async function updateProfileData(data, fotoPerfilFile = null) {
    const updatedProfile = await updateUserProfile(data, fotoPerfilFile)
    const normalized = normalizeProfileResponse(updatedProfile)
    setProfile((prev) => {
      if (!normalized) return prev
      return {
        ...(prev || {}),
        ...normalized,
        rol: normalized.rol || prev?.rol,
      }
    })
    return updatedProfile
  }

  const value = {
    user,
    profile,
    loading,
    getToken,
    register,
    logout,
    refreshProfile,
    updateProfileData,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de autenticación.
 * @returns {{ user: Object|null, loading: boolean, getToken: Function, isAuthenticated: boolean }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context || typeof context !== 'object') {
    console.error('useAuth se ejecuto sin <AuthProvider>; usando contexto de respaldo temporal.')
    return fallbackAuthContext
  }
  return context
}
