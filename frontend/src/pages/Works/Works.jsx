import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArtworks } from '../../services/artworkService'
import { useFetch } from '../../hooks/useFetch'

function Works() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedObra, setSelectedObra] = useState(null)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryMenuRef = useRef(null)

  // Cargar obras reales desde el backend
  const { data: obras, loading, error } = useFetch(() => getArtworks())

  const categorias = [
    { id: 'todos', nombre: 'Todas las Obras' },
    { id: 'Pintura', nombre: 'Pintura' },
    { id: 'Escultura', nombre: 'Escultura' },
    { id: 'Instalación', nombre: 'Instalación' },
    { id: 'Fotografía', nombre: 'Fotografía' },
    { id: 'Grabado', nombre: 'Grabado' },
    { id: 'Dibujo', nombre: 'Dibujo' },
    { id: 'Técnicas Mixtas', nombre: 'Técnicas Mixtas' },
  ]

  const categoriaActiva = categorias.find((cat) => cat.id === selectedCategory)

  // Filtrar obras
  const obrasFiltradas = (obras || []).filter((obra) => {
    const matchCategoria =
      selectedCategory === 'todos' || obra.modalidad === selectedCategory
    const matchBusqueda =
      obra.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obra.autor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obra.tecnica?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  // Extraer embed de YouTube
  const getYouTubeEmbed = (url) => {
    if (!url) return null
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    )
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
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
    <div className="bg-[#f2f2f0] text-[#1a1a1a] min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-[#f2f2f0]/95 backdrop-blur-md border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="group text-black hover:text-gray-600 transition-colors duration-300"
            >
              <div className="text-xl font-light tracking-[0.4em] text-black">
                MARALESTE <br /> Arte y Expansión
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-6 py-2 text-sm font-medium text-gray-500 hover:text-black transition-colors duration-300"
              >
                ← Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#f2f2f0] via-[#ecece9] to-[#e8e8e6] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-black rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-gray-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-black/10 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-600 tracking-wide">
                🎨 COLECCIÓN DE OBRAS
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-light mb-6 tracking-tight text-black">
              Galería de Obras
            </h1>
            <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
              Explora nuestra colección de obras de arte. Cada pieza cuenta una
              historia única de creatividad, técnica y expresión artística.
            </p>
          </div>


        </div>
      </section>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-8 py-20">
        {/* Filters */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 mb-2">Filtrar Obras</h2>
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
                  placeholder="Buscar por título, autor o técnica..."
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
                  {categoriaActiva?.nombre || 'Todas las Obras'}
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
                Mostrando: {categoriaActiva?.nombre || 'Todas las Obras'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center px-5 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-black/10">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-gray-500 font-medium">
              {obrasFiltradas.length} {obrasFiltradas.length === 1 ? 'obra encontrada' : 'obras encontradas'}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <svg
              className="w-10 h-10 animate-spin text-black mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-gray-500 font-light">Cargando obras...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 mx-auto mb-8 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-black mb-4">
              Error al cargar las obras
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
          </div>
        )}

        {/* Works Grid */}
        {!loading && !error && obrasFiltradas.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {obrasFiltradas.map((obra) => (
              <div
                key={obra.id}
                onClick={() => setSelectedObra(obra)}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg shadow-black/8 border border-black/10 hover:shadow-2xl hover:shadow-black/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
              >
                {/* Image */}
                <div className="h-64 overflow-hidden bg-gradient-to-br from-[#f2f2f0] to-[#ecece9] relative">
                  {obra.imagenPortada ? (
                    <img
                      src={obra.imagenPortada}
                      alt={obra.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <div className="text-center text-gray-600">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="text-sm font-light">Sin imagen</p>
                      </div>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Modalidad Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm bg-gradient-to-r from-black/70 to-black/50">
                      {obra.modalidad}
                    </span>
                  </div>

                  {/* Año Badge */}
                  <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 text-black rounded-xl text-xs font-semibold shadow-lg backdrop-blur-sm">
                    {obra.anio}
                  </div>

                  {/* View button on hover */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <span className="inline-flex items-center px-5 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Ver Detalles
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-7">
                  {/* Title */}
                  <h3 className="text-xl font-medium text-black mb-2 line-clamp-1 group-hover:text-gray-600 transition-colors duration-300 leading-snug">
                    {obra.titulo}
                  </h3>

                  {/* Autor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {obra.autor}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    {obra.descripcion}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                      {obra.tecnica}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-black/5 px-3 py-2 rounded-lg">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      {obra.medidas}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && obrasFiltradas.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-black/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-medium text-black mb-4">
                No se encontraron obras
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                No hay obras que coincidan con tus criterios de búsqueda. Intenta
                con otros términos o explora todas las modalidades.
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
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Limpiar Filtros
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== MODAL DETALLE DE OBRA ==================== */}
      {selectedObra && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedObra(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative bg-[#f2f2f0] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedObra(null)}
              className="absolute top-5 right-5 z-10 w-10 h-10 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            {selectedObra.imagenPortada && (
              <div className="w-full h-72 md:h-96 overflow-hidden rounded-t-3xl">
                <img
                  src={selectedObra.imagenPortada}
                  alt={selectedObra.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-black text-white">
                    {selectedObra.modalidad}
                  </span>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/10 text-gray-600">
                    {selectedObra.anio}
                  </span>
                  {selectedObra.estado && (
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        selectedObra.estado === 'disponible'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {selectedObra.estado}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-3">
                  {selectedObra.titulo}
                </h2>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-medium text-black">
                      {selectedObra.autor}
                    </p>
                    <p className="text-xs text-gray-500">Artista</p>
                  </div>
                </div>
              </div>

              {/* Datos técnicos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-1">
                    Técnica
                  </p>
                  <p className="text-sm font-medium text-black">
                    {selectedObra.tecnica}
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-1">
                    Medidas
                  </p>
                  <p className="text-sm font-medium text-black">
                    {selectedObra.medidas}
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold mb-1">
                    Modalidad
                  </p>
                  <p className="text-sm font-medium text-black">
                    {selectedObra.modalidad}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed font-light">
                  {selectedObra.descripcion}
                </p>
              </div>

              {/* Proceso de la Obra */}
              {selectedObra.procesoObra && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">
                    Proceso de la Obra
                  </h3>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-black/5">
                    <p className="text-gray-700 leading-relaxed font-light whitespace-pre-line">
                      {selectedObra.procesoObra}
                    </p>
                  </div>
                </div>
              )}

              {/* Historia de la Obra */}
              {selectedObra.historiaObra && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">
                    Historia de la Obra
                  </h3>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-black/5">
                    <p className="text-gray-700 leading-relaxed font-light whitespace-pre-line">
                      {selectedObra.historiaObra}
                    </p>
                  </div>
                </div>
              )}

              {/* Video */}
              {selectedObra.videoURL && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">
                    Video del Proceso
                  </h3>
                  {getYouTubeEmbed(selectedObra.videoURL) ? (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-black/10 shadow-lg">
                      <iframe
                        src={getYouTubeEmbed(selectedObra.videoURL)}
                        title="Video del proceso"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a
                      href={selectedObra.videoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Ver Video Externo
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Works