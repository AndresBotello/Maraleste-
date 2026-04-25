import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getWorkshops, getMyWorkshopAccesses, registerWorkshopAccess } from '../../services/workshopService'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'

function Workshops() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [enrolledWorkshopIds, setEnrolledWorkshopIds] = useState(new Set())
  const [enrollingWorkshopId, setEnrollingWorkshopId] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryMenuRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Cargar talleres reales desde el backend
  const { data: talleres, loading, error } = useFetch(() => getWorkshops())
  const isAdminLike = ['admin', 'docente'].includes(String(profile?.rol || '').toLowerCase())

  const categorias = [
    { id: 'todos', nombre: 'Todos los Talleres' },
    { id: 'pintura', nombre: 'Pintura' },
    { id: 'escultura', nombre: 'Escultura' },
    { id: 'acuarela', nombre: 'Acuarela' },
    { id: 'fotografia', nombre: 'Fotografía' },
    { id: 'ceramica', nombre: 'Cerámica' },
    { id: 'caligrafia', nombre: 'Caligrafía' },
    { id: 'tecnicas-mixtas', nombre: 'Técnicas Mixtas' },
    { id: 'grabado', nombre: 'Grabado' },
    { id: 'diseño', nombre: 'Diseño' },
    { id: 'ilustracion', nombre: 'Ilustración' },
  ]
  const categoriaActiva = categorias.find((cat) => cat.id === selectedCategory)

  useEffect(() => {
    let isMounted = true

    async function loadWorkshopAccesses() {
      if (!isAuthenticated) {
        if (isMounted) setEnrolledWorkshopIds(new Set())
        return
      }

      try {
        const accesses = await getMyWorkshopAccesses()
        if (!isMounted) return

        const nextIds = new Set((accesses || []).map((a) => a.workshopId || a.id).filter(Boolean))
        setEnrolledWorkshopIds(nextIds)
      } catch {
        if (isMounted) setEnrolledWorkshopIds(new Set())
      }
    }

    loadWorkshopAccesses()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar talleres
  const talleresFiltrados = (talleres || []).filter(taller => {
    const matchCategoria = selectedCategory === 'todos' || taller.categoria === selectedCategory
    const matchBusqueda = taller.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          taller.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  // Helper para nombre de plataforma
  const getNombrePlataforma = (plataforma) => {
    const map = {
      'jitsi-meet': 'Jitsi Meet',
      'google-meet': 'Google Meet',
      'zoom': 'Zoom',
      'microsoft-teams': 'Microsoft Teams',
      'discord': 'Discord',
      'otra': 'Reunión Online',
    }
    return map[plataforma] || 'Reunión Virtual'
  }

  const isWorkshopEnrolled = (tallerId) => isAdminLike || enrolledWorkshopIds.has(tallerId)
  const hasWorkshopSpots = (taller) => Number(taller?.cuposDisponibles ?? taller?.cuposTotal ?? 0) > 0
  const source = searchParams.get('from')
  const showBackToDashboard = source === 'customer-dashboard' || source === 'admin-dashboard'
  const dashboardPath = source === 'admin-dashboard' ? '/admin/dashboard' : '/customer/dashboard'

  const handleEnrollWorkshop = async (taller, { goToSession = false } = {}) => {
    if (!taller?.id) return

    const alreadyEnrolled = isWorkshopEnrolled(taller.id)
    if (alreadyEnrolled) {
      if (goToSession && taller.linkReunion) {
        navigate(`/workshop/${taller.id}/session`)
      }
      return
    }

    if (!isAuthenticated) {
      navigate('/login?redirect=/workshops')
      return
    }

    if (!hasWorkshopSpots(taller)) {
      window.alert('Este taller ya no tiene cupos disponibles.')
      return
    }

    const isPaid = (taller.tipoAcceso || (Number(taller.precio || 0) > 0 ? 'pago' : 'gratis')) === 'pago'
    if (isPaid) {
      const confirmed = window.confirm(`Este taller es de pago (${Number(taller.precio || 0).toLocaleString('es-CO')} COP). ¿Deseas confirmar la inscripción?`)
      if (!confirmed) return
    }

    try {
      setEnrollingWorkshopId(taller.id)
      await registerWorkshopAccess(taller.id, { confirmarPago: isPaid })

      setEnrolledWorkshopIds((prev) => {
        const next = new Set(prev)
        next.add(taller.id)
        return next
      })

      if (goToSession && taller.linkReunion) {
        navigate(`/workshop/${taller.id}/session`)
      }
    } catch (err) {
      window.alert(err.message || 'No se pudo registrar tu inscripción al taller.')
    } finally {
      setEnrollingWorkshopId('')
    }
  }

  return (
    <div className="bg-[#f2f2f0] text-[#1a1a1a] min-h-screen">
      {/* Navigation Bar */}
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#f2f2f0] via-[#ecece9] to-[#e8e8e6] py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-black rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-gray-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-black/10 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-600 tracking-wide">🎭 EXPERIENCIAS PRESENCIALES</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-light mb-6 tracking-tight text-black">
              Catálogo de Talleres
            </h1>
            <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
              Participa en experiencias artísticas presenciales guiadas por expertos. 
              Talleres prácticos diseñados para todos los niveles.
            </p>
          </div>


        </div>
      </section>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-8 py-20">
        {/* Filters */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 mb-2">Filtrar Talleres</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-gray-400 to-gray-300 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-8">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold mb-2">
                Búsqueda
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Buscar por nombre o instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-black/20 rounded-2xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-300 shadow-lg shadow-black/5"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 bg-black/10 p-2 rounded-xl group-focus-within:bg-black group-focus-within:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold mb-2">
                Categoría
              </label>
              <div ref={categoryMenuRef} className="relative rounded-2xl p-[1px] bg-gradient-to-r from-black/15 via-black/10 to-black/15 shadow-md shadow-black/5">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6" />
                  </svg>
                </div>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryOpen}
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                  className="w-full h-12 pl-11 pr-12 bg-gradient-to-b from-white to-[#f8f8f7] backdrop-blur-sm border border-black/10 rounded-2xl text-sm font-medium text-black text-left focus:outline-none focus:ring-2 focus:ring-black/20 hover:border-black/20 transition-all duration-300"
                >
                  {categoriaActiva?.nombre || 'Todos los Talleres'}
                </button>
                <div className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isCategoryOpen && (
                  <div className="absolute left-0 right-0 mt-2 p-2 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-2xl shadow-black/10 z-30">
                    <ul role="listbox" className="max-h-64 overflow-y-auto">
                      {categorias.map((cat) => {
                        const isSelected = selectedCategory === cat.id

                        return (
                          <li key={cat.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.id)
                                setIsCategoryOpen(false)
                              }}
                              className={`w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-200 flex items-center justify-between ${
                                isSelected
                                  ? 'bg-black text-white shadow-md shadow-black/20'
                                  : 'text-gray-700 hover:bg-black/5'
                              }`}
                            >
                              <span>{cat.nombre}</span>
                              {isSelected && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-black/40" />
                Mostrando: {categoriaActiva?.nombre || 'Todos los Talleres'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full border border-black/10">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-500 font-medium">
              {talleresFiltrados.length} {talleresFiltrados.length === 1 ? 'taller encontrado' : 'talleres encontrados'}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <svg className="w-10 h-10 animate-spin text-black mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500 font-light">Cargando talleres...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 mx-auto mb-8 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-black mb-4">Error al cargar los talleres</h3>
            <p className="text-gray-500 mb-4">{error}</p>
          </div>
        )}

        {/* Workshops Grid */}
        {!loading && !error && talleresFiltrados.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {talleresFiltrados.map((taller) => (
              <div
                key={taller.id}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg shadow-black/8 border border-black/10 hover:shadow-2xl hover:shadow-black/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="h-52 overflow-hidden bg-gradient-to-br from-[#f2f2f0] to-[#ecece9] relative">
                  {taller.imagenPortada ? (
                    <img src={taller.imagenPortada} alt={taller.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <div className="text-center text-gray-600">
                        <div className="text-3xl mb-2">🎨</div>
                        <p className="text-sm font-light">Taller Presencial</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm ${
                        taller.nivel === 'Principiante'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          : taller.nivel === 'Intermedio'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-80"></div>
                      {taller.nivel}
                    </span>
                  </div>
                  
                  {/* Available Spots Badge */}
                  <div className="absolute top-4 left-4 px-3 py-2 bg-black text-white rounded-xl text-xs font-semibold shadow-lg backdrop-blur-sm">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                      {taller.cuposDisponibles ?? taller.cuposTotal} cupos
                    </span>
                  </div>

                  {/* Virtual Badge */}
                  {taller.linkReunion && (
                    <div className="absolute bottom-4 left-4 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-lg backdrop-blur-sm">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Virtual disponible
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-7">
                  {/* Date Badge */}
                  <div className="inline-flex items-center px-3 py-1 bg-black/10 text-gray-600 rounded-lg text-xs font-semibold mb-4">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {taller.fecha}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-medium text-black mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300 leading-snug">
                    {taller.titulo}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{taller.instructor}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    {taller.descripcion}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {taller.duracion}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {taller.cuposTotal} max
                    </div>
                    {taller.ubicacion && (
                      <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {taller.ubicacion}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {taller.hora}
                    </div>
                  </div>

                  {/* Materials Info */}
                  {taller.materiales && (
                    <div className="mb-4 p-3 bg-black/5 rounded-lg border border-black/10">
                      <div className="flex items-center text-xs text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">Materiales: {taller.materiales}</span>
                      </div>
                    </div>
                  )}

                  {/* Meeting Link */}
                  {taller.linkReunion && isWorkshopEnrolled(taller.id) && (
                    <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-blue-700">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="font-semibold">{getNombrePlataforma(taller.plataformaReunion)}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/workshop/${taller.id}/session`)
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {taller.plataformaReunion === 'jitsi-meet' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            )}
                          </svg>
                          {taller.plataformaReunion === 'jitsi-meet' ? 'Entrar a sesión' : 'Unirse'}
                        </button>
                      </div>
                      {taller.plataformaReunion === 'jitsi-meet' && (
                        <p className="text-[10px] text-blue-500 mt-1.5 ml-6">Se abrirá dentro de la página</p>
                      )}
                    </div>
                  )}

                  {taller.linkReunion && !isWorkshopEnrolled(taller.id) && (
                    <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center text-xs text-amber-700">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 0v2m-7 7h14a2 2 0 002-2v-3a7 7 0 10-14 0v3a2 2 0 002 2z" />
                          </svg>
                          <span className="font-semibold">Reunión bloqueada</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEnrollWorkshop(taller, { goToSession: false })}
                          disabled={enrollingWorkshopId === taller.id || !hasWorkshopSpots(taller)}
                          className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {enrollingWorkshopId === taller.id
                            ? 'Procesando...'
                            : hasWorkshopSpots(taller)
                            ? 'Inscribirme'
                            : 'Cupos agotados'}
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-700/80 mt-1.5 ml-6">Debes inscribirte para ver y usar el enlace de reunión.</p>
                    </div>
                  )}

                  {/* Price and Button */}
                  <div className="flex justify-between items-center pt-6 border-t border-black/10">
                    <div className="flex flex-col">
                      <span className="text-2xl font-semibold text-black">
                        {(taller.tipoAcceso || (Number(taller.precio || 0) > 0 ? 'pago' : 'gratis')) === 'pago'
                          ? `$ ${Number(taller.precio || 0).toLocaleString('es-CO')} COP`
                          : 'Gratis'}
                      </span>
                      <span className="text-xs text-gray-500 opacity-70">
                        {(taller.tipoAcceso || (Number(taller.precio || 0) > 0 ? 'pago' : 'gratis')) === 'pago' ? 'acceso con pago' : 'acceso gratuito'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEnrollWorkshop(taller, { goToSession: false })}
                      disabled={enrollingWorkshopId === taller.id || (!isWorkshopEnrolled(taller.id) && !hasWorkshopSpots(taller))}
                      className="px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl shadow-lg shadow-black/25 hover:shadow-xl hover:scale-105 transition-all duration-300 group-hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center">
                        {enrollingWorkshopId === taller.id
                          ? 'Procesando...'
                          : isWorkshopEnrolled(taller.id)
                          ? 'Inscrito'
                          : !hasWorkshopSpots(taller)
                          ? 'Cupos agotados'
                          : 'Inscribirse'}
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && talleresFiltrados.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-black/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-medium text-black mb-4">No se encontraron talleres</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                No hay talleres que coincidan con tus criterios de búsqueda. 
                Intenta con otros términos o explora todas las categorías.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('todos')
                  }}
                  className="w-full px-8 py-4 bg-black text-white font-semibold rounded-2xl shadow-lg shadow-black/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Limpiar Filtros
                  </span>
                </button>
                
                <p className="text-sm text-gray-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ¿Necesitas ayuda? Contacta a nuestro equipo de soporte
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Workshops
