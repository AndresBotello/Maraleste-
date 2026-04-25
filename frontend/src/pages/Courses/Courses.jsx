import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../../services/courseService'
import { CATEGORIAS_CON_TODOS } from '../../data/constants'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/layouts/Footer'

function Courses() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryMenuRef = useRef(null)
  const { isAuthenticated } = useAuth()

  // Cargar cursos desde el backend
  const { data: cursos, loading, error } = useFetch(() => getCourses())

  const categorias = CATEGORIAS_CON_TODOS
  const categoriaActiva = categorias.find((cat) => cat.id === selectedCategory)

  // Filtrar cursos
  const cursosFiltrados = (cursos || []).filter(curso => {
    const matchCategoria = selectedCategory === 'todos' || curso.categoria === selectedCategory
    const matchBusqueda = curso.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          curso.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  const getDetailsPath = (courseId) => {
    if (isAuthenticated) return `/course/${courseId}`
    return `/login?redirect=${encodeURIComponent(`/course/${courseId}`)}`
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-[#f2f2f0] text-[#1a1a1a] min-h-screen selection:bg-gray-200/70">
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
      <section className="relative bg-gradient-to-br from-[#f2f2f0] via-[#ecece9] to-[#e8e8e6] py-10 md:py-12 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-black rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-gray-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-4 py-1.5 bg-black/10 rounded-full mb-4">
              <span className="text-sm font-medium text-gray-600 tracking-wide">✨ EDUCACIÓN CREATIVA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-black">
              Catálogo de Cursos
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
              Descubre y aprende nuevas habilidades artísticas con cursos diseñados por profesionales de la industria. 
              Desde conceptos básicos hasta técnicas avanzadas.
            </p>
          </div>

        </div>
      </section>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-8 py-12 md:py-14">
        {/* Filters */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 mb-2">Filtrar Cursos</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-gray-400 to-gray-300 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
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
                  {categoriaActiva?.nombre || 'Todos los Cursos'}
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
                Mostrando: {categoriaActiva?.nombre || 'Todos los Cursos'}
              </p>
            </div>

            <div>
              <label htmlFor="course-search" className="block text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold mb-2">
                Búsqueda
              </label>
              <div className="relative group">
                <input
                  id="course-search"
                  type="text"
                  placeholder="Buscar cursos por nombre o instructor..."
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
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-5 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-black/10">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-gray-500 font-medium">
              {cursosFiltrados.length} {cursosFiltrados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
            </span>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-10 h-10 animate-spin text-black mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500 font-light">Cargando cursos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-black mb-4">Error al cargar cursos</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-black text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Reintentar
            </button>
          </div>
        ) : cursosFiltrados.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursosFiltrados.map((curso) => (
              <article
                key={curso.id}
                className="group relative bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg shadow-black/8 border border-black/10 hover:shadow-2xl hover:shadow-black/15 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Image */}
                <div className="h-52 overflow-hidden bg-gradient-to-br from-[#f2f2f0] to-[#ecece9] relative">
                  {curso.imagenPortada ? (
                    <img
                      src={curso.imagenPortada}
                      alt={curso.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <div className="text-center text-gray-600">
                        <div className="text-3xl mb-2">🎨</div>
                        <p className="text-sm font-light">Imagen del Curso</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm ${
                        curso.nivel === 'Principiante'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          : curso.nivel === 'Intermedio'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-80"></div>
                      {curso.nivel}
                    </span>
                  </div>
                  
                  {/* Certificate Badge */}
                  {curso.certificado && (
                    <div className="absolute top-4 left-4 px-3 py-2 bg-black text-white rounded-xl text-xs font-semibold shadow-lg backdrop-blur-sm">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Certificado
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-7">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 bg-black/5 px-3 py-1.5 rounded-full">
                      {curso.categoria || 'General'}
                    </span>
                    <span className="text-xs text-gray-400">Actualizado recientemente</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-medium text-black mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300 leading-snug">
                    {curso.titulo}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{curso.instructor}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                    {curso.descripcion}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {curso.duracion}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {curso.estudiantes || 0}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {curso.totalModulos || 0} módulos
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {curso.calificacion || '—'}
                    </div>
                  </div>

                  {/* Price and Button */}
                  <div className="flex justify-between items-center pt-6 border-t border-black/10">
                    <div className="flex flex-col">
                      <span className="text-2xl font-semibold text-black">
                        {curso.tipoAcceso === 'pago'
                          ? `$ ${Number(curso.precio || 0).toLocaleString('es-CO')} COP`
                          : 'Gratis'}
                      </span>
                      <span className="text-xs text-gray-500 opacity-70">
                        {curso.tipoAcceso === 'pago' ? 'acceso completo' : 'acceso libre'}
                      </span>
                    </div>
                    <Link
                      to={getDetailsPath(curso.id)}
                      className="px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl shadow-lg shadow-black/25 hover:shadow-xl hover:scale-105 transition-all duration-300 group-hover:bg-gray-800"
                    >
                      <span className="flex items-center">
                        Ver Detalles
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              {/* Empty state illustration */}
              <div className="w-24 h-24 mx-auto mb-8 bg-black/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-medium text-black mb-4">No se encontraron cursos</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                No hay cursos que coincidan con tus criterios de búsqueda. 
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
      <Footer />
    </div>
  )
}

export default Courses
