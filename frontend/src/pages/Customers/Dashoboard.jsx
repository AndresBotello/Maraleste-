import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getCourses, getMyCourseAccesses, registerCourseAccess } from '../../services/courseService'
import { getWorkshops } from '../../services/workshopService'
import { getArtworks } from '../../services/artworkService'
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../services/notificationService'
import { useFetch } from '../../hooks/useFetch'
import { CATEGORIAS_CON_TODOS } from '../../data/constants'
import Footer from '../../components/layouts/Footer'

function CustomerDashboard() {
  const { profile, user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('catalogo')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedObra, setSelectedObra] = useState(null)
  const [enrollingCourseId, setEnrollingCourseId] = useState('')
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [markingNotificationId, setMarkingNotificationId] = useState('')
  const [markingAllNotifications, setMarkingAllNotifications] = useState(false)

  const userData = useMemo(
    () => ({
      nombre: profile ? `${profile.firstName} ${profile.lastName}` : user?.displayName || 'Usuario',
      email: profile?.email || user?.email || '',
      imagen: profile?.fotoPerfil || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.firstName || 'U')}&background=000&color=fff&size=120`,
    }),
    [profile, user]
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const refreshNotifications = async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setLoadingNotifications(true)
    }

    try {
      setNotificationError('')
      const payload = await getMyNotifications(20)
      setNotifications(payload?.notifications || [])
      setUnreadNotifications(payload?.unreadCount || 0)
    } catch {
      if (showLoader) {
        setNotificationError('No se pudieron cargar tus notificaciones.')
      }
      // No interrumpe la experiencia del dashboard si falla.
    } finally {
      if (showLoader) {
        setLoadingNotifications(false)
      }
    }
  }

  useEffect(() => {
    refreshNotifications()

    const intervalId = setInterval(() => {
      refreshNotifications()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  const formatNotificationDate = (value) => {
    if (!value) return ''
    try {
      const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value)
      return date.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleOpenNotificationsModal = () => {
    setProfileModalOpen(false)
    setNotificationsModalOpen(true)
    refreshNotifications({ showLoader: true })
  }

  const handleGoFromNotification = (notification) => {
    setNotificationsModalOpen(false)

    if (notification?.type === 'nuevo_curso' && notification?.courseId) {
      navigate(`/course/${notification.courseId}?from=dashboard`)
      return
    }

    if (notification?.type === 'nuevo_mensaje') {
      navigate('/customer/messages')
      return
    }

    navigate('/customer/notifications')
  }

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      setMarkingNotificationId(notificationId)
      await markNotificationAsRead(notificationId)

      setNotifications((prev) => {
        const updated = prev.map((item) => item.id === notificationId ? { ...item, read: true } : item)
        const unread = updated.filter((item) => !item.read).length
        setUnreadNotifications(unread)
        return updated
      })
    } catch {
      setNotificationError('No se pudo marcar la notificacion como leida.')
    } finally {
      setMarkingNotificationId('')
    }
  }

  const handleMarkAllNotifications = async () => {
    try {
      setMarkingAllNotifications(true)
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
      setUnreadNotifications(0)
    } catch {
      setNotificationError('No se pudieron marcar todas como leidas.')
    } finally {
      setMarkingAllNotifications(false)
    }
  }

  // Cargar cursos reales desde el backend
  const { data: courseCatalog, loading: loadingCourses, error: errorCourses } = useFetch(() => getCourses())

  // Cargar cursos inscritos del usuario
  const { data: enrolledAccesses, loading: loadingEnrollments, refetch: refetchEnrollments } = useFetch(() => getMyCourseAccesses())

  // Cargar talleres reales desde el backend
  const { data: workshopCatalog, loading: loadingWorkshops, error: errorWorkshops } = useFetch(() => getWorkshops())

  // Cargar obras reales desde el backend (solo visibles)
  const { data: obrasCatalog, loading: loadingObras, error: errorObras } = useFetch(() => getArtworks({ visibleOnly: true }))

  const catalogCategories = CATEGORIAS_CON_TODOS

  const galleryPieces = obrasCatalog || []

  const enrolledCourseIds = useMemo(() => {
    const accesses = enrolledAccesses || []
    return new Set(accesses.map((a) => a.courseId))
  }, [enrolledAccesses])

  const filteredCourses = useMemo(() => {
    return (courseCatalog || []).filter((course) => {
      const matchCategory = selectedCategory === 'todos' || course.categoria === selectedCategory
      const matchSearch = [course.titulo, course.instructor]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
      return matchCategory && matchSearch
    })
  }, [courseCatalog, selectedCategory, searchTerm])

  const libraryCourses = useMemo(() => {
    return (courseCatalog || []).filter((course) => enrolledCourseIds.has(course.id))
  }, [courseCatalog, enrolledCourseIds])

  const handleEnrollCourse = async (course) => {
    if (!course?.id) return

    if (enrolledCourseIds.has(course.id)) {
      navigate(`/course/${course.id}?from=dashboard`)
      return
    }

    if (course.tipoAcceso === 'pago') {
      navigate(`/course/${course.id}?from=dashboard`)
      return
    }

    try {
      setEnrollingCourseId(course.id)
      await registerCourseAccess(course.id)
      await refetchEnrollments()
      navigate(`/course/${course.id}?from=dashboard`)
    } catch (error) {
      console.error('Error al inscribirse al curso:', error)
    } finally {
      setEnrollingCourseId('')
    }
  }

  const metrics = useMemo(
    () => [
      {
        title: 'Cursos disponibles',
        value: (courseCatalog || []).length,
        detail: `${[...new Set((courseCatalog || []).map(c => c.categoria))].length} categorías`,
      },
      {
        title: 'Talleres disponibles',
        value: (workshopCatalog || []).length,
        detail: 'Catálogo actualizado',
      },
      {
        title: 'Obras en galería',
        value: galleryPieces.length,
        detail: `${[...new Set(galleryPieces.map(o => o.modalidad))].length} modalidades`,
      },
    ],
    [courseCatalog, workshopCatalog, galleryPieces]
  )

  return (
    <div className="bg-gradient-to-br from-[#f6f6f3] via-[#eceae4] to-[#fafafa] text-[#1a1a1a] min-h-screen">
      <header className="border-b border-black/5 sticky top-0 z-40 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="text-xl lg:text-2xl font-light tracking-[0.4em] text-black">
            MARALESTE
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenNotificationsModal}
              className="relative flex items-center justify-center h-11 w-11 rounded-xl border border-black/10 bg-white/60 text-black hover:border-black/20"
              aria-label="Ver notificaciones"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center font-semibold">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs uppercase tracking-[0.3em] text-black hover:border-black/20"
            >
              Perfil
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80">
                {userData.imagen ? (
                  <img src={userData.imagen} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-medium">MG</span>
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Panel de aprendizaje</span>
            <h1 className="text-4xl lg:text-5xl font-light text-black leading-tight">
              Hola {userData.nombre}, retoma tu recorrido creativo cuando quieras.
            </h1>
            <p className="text-base lg:text-lg text-gray-600 max-w-xl leading-relaxed">
              Accede a tus cursos, talleres y colecciones desde un mismo espacio. Descubre nuevas propuestas curadas según tus intereses.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('catalogo')}
                className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-gray-900"
              >
                Explorar catálogo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('biblioteca')}
                className="inline-flex items-center justify-center rounded-xl border border-black px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white"
              >
                Ver mi biblioteca
              </button>
              <Link
                to="/customer/messages"
                className="inline-flex items-center justify-center rounded-xl border border-black px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white"
              >
                Mensajes
              </Link>
              <button
                type="button"
                onClick={() => navigate('/customer/notifications')}
                className="inline-flex items-center justify-center rounded-xl border border-black px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white"
              >
                Notificaciones
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur-xl px-8 py-10 shadow-xl shadow-black/10">
            <div className="text-sm uppercase tracking-[0.3em] text-gray-400">Resumen</div>
            <div className="mt-6 grid gap-4">
              {metrics.map(({ title, value, detail }) => (
                <article key={title} className="rounded-2xl border border-black/10 px-5 py-4 bg-white/90">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{title}</p>
                  <p className="text-2xl font-light text-black mt-2">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Navegación</p>
              <h2 className="text-3xl font-light text-black">Explora tu contenido</h2>
            </div>
            <div className="inline-flex rounded-2xl border border-black/10 bg-white/70 p-2 text-sm font-medium text-gray-500">
              <button
                type="button"
                onClick={() => setActiveTab('catalogo')}
                className={`rounded-xl px-4 py-2 uppercase tracking-[0.3em] transition ${
                  activeTab === 'catalogo' ? 'bg-black text-white' : 'hover:text-black'
                }`}
              >
                Catálogo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('biblioteca')}
                className={`rounded-xl px-4 py-2 uppercase tracking-[0.3em] transition ${
                  activeTab === 'biblioteca' ? 'bg-black text-white' : 'hover:text-black'
                }`}
              >
                Mi biblioteca
              </button>
            </div>
          </div>
        </section>

        {activeTab === 'catalogo' && (
          <section className="space-y-14">
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="space-y-3">
                  <h3 className="text-2xl font-light text-black">Catálogo de cursos</h3>
                  <p className="text-sm text-gray-600">Seleccionamos rutas de aprendizaje actualizadas semanalmente.</p>
                </div>
                <div className="text-sm text-gray-500">{filteredCourses.length} resultados</div>
              </div>
              <div className="grid gap-4 md:grid-cols-[minmax(0,0.5fr)_1fr]">
                <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-3">Categorías</p>
                  <div className="grid gap-2 text-sm">
                    {catalogCategories.map(({ id, nombre }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedCategory(id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2 text-left transition ${
                          selectedCategory === id
                            ? 'border-black bg-black text-white'
                            : 'border-transparent bg-white hover:border-black/10'
                        }`}
                      >
                        {nombre}
                        {selectedCategory === id && <span>●</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar cursos por nombre o instructor"
                      className="w-full rounded-2xl border border-black/10 bg-white/80 px-6 py-4 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    />
                    <span className="absolute right-6 top-4 text-gray-400">⌕</span>
                  </div>
                  {loadingCourses && (
                    <div className="flex flex-col items-center justify-center py-16 col-span-full">
                      <svg className="w-8 h-8 animate-spin text-black mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-sm text-gray-500">Cargando cursos...</p>
                    </div>
                  )}

                  {!loadingCourses && errorCourses && (
                    <div className="flex flex-col items-center justify-center py-16 col-span-full">
                      <div className="w-16 h-16 mb-4 bg-red-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">{errorCourses}</p>
                    </div>
                  )}

                  {!loadingCourses && !errorCourses && filteredCourses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 col-span-full">
                      <p className="text-sm text-gray-500">No se encontraron cursos.</p>
                    </div>
                  )}

                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {!loadingCourses && !errorCourses && filteredCourses.map((course) => (
                      <article
                        key={course.id}
                        className="flex h-full flex-col rounded-3xl border border-black/10 bg-white/90 overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        {/* Imagen de portada */}
                        <div className="h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                          {course.imagenPortada ? (
                            <img src={course.imagenPortada} alt={course.titulo} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                          ) : (
                            <span className="text-4xl">🎨</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] uppercase tracking-[0.28em] text-gray-400 line-clamp-1">{course.categoria}</div>
                            <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                              {course.nivel}
                            </span>
                          </div>
                          <h4 className="mt-2 text-base font-medium text-black line-clamp-2 leading-snug">{course.titulo}</h4>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-1">Por {course.instructor}</p>
                          <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">{course.descripcion}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
                            <span className="rounded-full bg-black/5 px-2.5 py-1">⏱ {course.duracion}</span>
                            <span className="rounded-full bg-black/5 px-2.5 py-1">📚 {course.totalModulos || 0} módulos</span>
                          </div>
                          <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/10 text-sm gap-3">
                            <span className="text-base font-medium text-black">
                              {course.tipoAcceso === 'pago'
                                ? `$ ${Number(course.precio || 0).toLocaleString('es-CO')} COP`
                                : 'Gratis'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEnrollCourse(course)}
                              disabled={enrollingCourseId === course.id || loadingEnrollments}
                              className="rounded-lg border border-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-black hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {enrollingCourseId === course.id
                                ? 'Inscribiendo...'
                                : enrolledCourseIds.has(course.id)
                                ? 'Ir al curso'
                                : course.tipoAcceso === 'pago'
                                ? 'Ver detalle'
                                : 'Inscribirse'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-light text-black">Próximos talleres</h3>
                  <p className="text-sm text-gray-600">Modalidades presenciales e híbridas con cupos limitados.</p>
                </div>
                {!loadingWorkshops && !errorWorkshops && (
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-500">{(workshopCatalog || []).length} talleres activos</span>
                )}
              </div>

              {loadingWorkshops && (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="w-8 h-8 animate-spin text-black mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-gray-500">Cargando talleres...</p>
                </div>
              )}

              {!loadingWorkshops && errorWorkshops && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 bg-red-50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">{errorWorkshops}</p>
                </div>
              )}

              {!loadingWorkshops && !errorWorkshops && (workshopCatalog || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-sm text-gray-500">No hay talleres disponibles por el momento.</p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {!loadingWorkshops && !errorWorkshops && (workshopCatalog || []).map((workshop) => (
                  <div
                    key={workshop.id}
                    className="flex flex-col rounded-3xl border border-black/10 bg-white/85 overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Imagen de portada */}
                    <div className="h-40 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center">
                      {workshop.imagenPortada ? (
                        <img src={workshop.imagenPortada} alt={workshop.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">🎨</span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-gray-400">{workshop.categoria}</span>
                        {workshop.linkReunion && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Virtual
                          </span>
                        )}
                      </div>
                      <h4 className="mt-3 text-lg font-light text-black">{workshop.titulo}</h4>
                      <p className="mt-2 text-sm text-gray-500">Facilitado por {workshop.instructor}</p>
                      <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                        <p>📅 {workshop.fecha} {workshop.horario && `· ${workshop.horario}`}</p>
                        <p>⏱ {workshop.duracion}</p>
                        <p>👥 {workshop.cuposDisponibles ?? '—'} / {workshop.cuposTotal ?? '—'} cupos</p>
                      </div>

                      {workshop.linkReunion && (
                        <div className="mt-3">
                          <button
                            onClick={() => navigate(`/workshop/${workshop.id}/session`)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
                          >
                            {workshop.plataformaReunion === 'jitsi-meet' ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Entrar a sesión en vivo
                              </>
                            ) : (
                              <>
                                🔗 {workshop.plataformaReunion ? workshop.plataformaReunion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Reunión virtual'}
                              </>
                            )}
                          </button>
                          {workshop.plataformaReunion === 'jitsi-meet' && (
                            <p className="text-[10px] text-blue-400 mt-1">Se abre dentro de la página</p>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-black/10 text-sm">
                        <span className="text-lg font-light text-black">${Number(workshop.precio || 0).toFixed(2)}</span>
                        <Link to="/workshops?from=customer-dashboard" className="uppercase tracking-[0.3em] text-gray-500 hover:text-black transition">Ver detalles →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-light text-black">Galería de Obras</h3>
                  <p className="text-sm text-gray-600">Obras disponibles de artistas residentes y colaboradores.</p>
                </div>
                <div className="flex items-center gap-4">
                  {!loadingObras && !errorObras && (
                    <span className="text-xs uppercase tracking-[0.3em] text-gray-500">{galleryPieces.length} obras disponibles</span>
                  )}
                  <Link to="/works" className="text-xs uppercase tracking-[0.3em] text-black hover:underline underline-offset-4">Ver todas →</Link>
                </div>
              </div>

              {loadingObras && (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="w-8 h-8 animate-spin text-black mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-gray-500">Cargando obras...</p>
                </div>
              )}

              {!loadingObras && errorObras && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 bg-red-50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">{errorObras}</p>
                </div>
              )}

              {!loadingObras && !errorObras && galleryPieces.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-sm text-gray-500">No hay obras disponibles por el momento.</p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {!loadingObras && !errorObras && galleryPieces.slice(0, 8).map((piece) => (
                  <article
                    key={piece.id}
                    onClick={() => setSelectedObra(piece)}
                    className="group rounded-3xl border border-black/10 bg-white/85 overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    {/* Imagen */}
                    <div className="h-44 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative">
                      {piece.imagenPortada ? (
                        <img src={piece.imagenPortada} alt={piece.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl">🖼️</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-white bg-black/60 backdrop-blur-sm">
                          {piece.modalidad}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{piece.tecnica}</p>
                      <h4 className="mt-2 text-base font-medium text-black line-clamp-1">{piece.titulo}</h4>
                      <p className="text-sm text-gray-500">Por {piece.autor}</p>
                      <p className="mt-1 text-xs text-gray-400">{piece.anio} · {piece.medidas}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{piece.estado || 'Disponible'}</span>
                        <span className="text-xs uppercase tracking-[0.3em] text-black group-hover:underline">Ver detalles</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'biblioteca' && (
          <section className="space-y-16">
            {/* Cursos disponibles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-light text-black">Cursos</h3>
                <Link to="/courses" className="text-xs uppercase tracking-[0.3em] text-black hover:underline underline-offset-4">Ver todos →</Link>
              </div>
              {loadingCourses && (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-6 h-6 animate-spin text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              )}
              {!loadingCourses && errorCourses && (
                <p className="text-sm text-red-500 py-8 text-center">{errorCourses}</p>
              )}
              {!loadingCourses && !errorCourses && libraryCourses.length === 0 && (
                <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-12 text-center">
                  <p className="text-sm text-gray-500">Aún no estás inscrito en cursos. Ve al catálogo y pulsa Inscribirse.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalogo')}
                    className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-black hover:underline"
                  >
                    Explorar catálogo
                  </button>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {!loadingCourses && !errorCourses && libraryCourses.slice(0, 6).map((course) => (
                  <Link key={course.id} to={`/course/${course.id}?from=dashboard`} className="flex flex-col rounded-3xl border border-black/10 bg-white/85 overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="h-36 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                      {course.imagenPortada ? (
                        <img src={course.imagenPortada} alt={course.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📚</span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{course.categoria}</p>
                      <h4 className="mt-2 text-base font-light text-black">{course.titulo}</h4>
                      <p className="text-sm text-gray-500">Por {course.instructor}</p>
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/10 text-sm">
                        <span className="font-light text-black">
                          {course.tipoAcceso === 'pago'
                            ? `$ ${Number(course.precio || 0).toLocaleString('es-CO')} COP`
                            : 'Gratis'}
                        </span>
                        <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Ver →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Talleres disponibles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-light text-black">Talleres</h3>
                <Link to="/workshops?from=customer-dashboard" className="text-xs uppercase tracking-[0.3em] text-black hover:underline underline-offset-4">Ver todos →</Link>
              </div>
              {loadingWorkshops && (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-6 h-6 animate-spin text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              )}
              {!loadingWorkshops && errorWorkshops && (
                <p className="text-sm text-red-500 py-8 text-center">{errorWorkshops}</p>
              )}
              {!loadingWorkshops && !errorWorkshops && (workshopCatalog || []).length === 0 && (
                <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-12 text-center">
                  <p className="text-sm text-gray-500">No hay talleres disponibles por el momento.</p>
                  <Link to="/workshops?from=customer-dashboard" className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-black hover:underline">Explorar talleres</Link>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {!loadingWorkshops && !errorWorkshops && (workshopCatalog || []).slice(0, 6).map((workshop) => (
                  <div key={workshop.id} className="flex flex-col rounded-3xl border border-black/10 bg-white/85 overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="h-36 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center">
                      {workshop.imagenPortada ? (
                        <img src={workshop.imagenPortada} alt={workshop.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🎨</span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{workshop.categoria}</p>
                        {workshop.linkReunion && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Virtual
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-base font-light text-black">{workshop.titulo}</h4>
                      <p className="text-sm text-gray-500">Por {workshop.instructor}</p>
                      <p className="mt-2 text-xs text-gray-500">📅 {workshop.fecha} {workshop.horario && `· ${workshop.horario}`}</p>
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/10 text-sm">
                        <span className="font-light text-black">${Number(workshop.precio || 0).toFixed(2)}</span>
                        <Link to="/workshops?from=customer-dashboard" className="text-xs uppercase tracking-[0.3em] text-gray-500 hover:text-black">Ver →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Obras disponibles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-light text-black">Obras</h3>
                <Link to="/works" className="text-xs uppercase tracking-[0.3em] text-black hover:underline underline-offset-4">Ver galería →</Link>
              </div>
              {loadingObras && (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-6 h-6 animate-spin text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              )}
              {!loadingObras && errorObras && (
                <p className="text-sm text-red-500 py-8 text-center">{errorObras}</p>
              )}
              {!loadingObras && !errorObras && galleryPieces.length === 0 && (
                <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-12 text-center">
                  <p className="text-sm text-gray-500">No hay obras en la galería por el momento.</p>
                  <Link to="/works" className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-black hover:underline">Explorar galería</Link>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {!loadingObras && !errorObras && galleryPieces.slice(0, 8).map((piece) => (
                  <article
                    key={piece.id}
                    onClick={() => setSelectedObra(piece)}
                    className="group rounded-3xl border border-black/10 bg-white/85 overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    <div className="h-40 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative">
                      {piece.imagenPortada ? (
                        <img src={piece.imagenPortada} alt={piece.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-3xl">🖼️</span></div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-white bg-black/60 backdrop-blur-sm">{piece.modalidad}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-black line-clamp-1">{piece.titulo}</h4>
                      <p className="text-xs text-gray-500">Por {piece.autor} · {piece.anio}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-black group-hover:underline">Ver detalles</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {profileModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setProfileModalOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-white/90 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Perfil</p>
                <h2 className="text-xl font-light text-black">{userData.nombre}</h2>
              </div>
              <button type="button" onClick={() => setProfileModalOpen(false)} className="text-sm uppercase tracking-[0.3em] text-gray-500 hover:text-black">
                Cerrar
              </button>
            </div>
            <div className="px-6 py-8 space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-black/10">
                  {userData.imagen ? (
                    <img src={userData.imagen} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-medium text-gray-500">
                      {userData.nombre.slice(0, 1)}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
              <div className="space-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false)
                    navigate('/customer/profile')
                  }}
                  className="w-full rounded-xl border border-black px-4 py-3 uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white"
                >
                  Editar perfil
                </button>
                <button type="button" className="w-full rounded-xl border border-black px-4 py-3 uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white">
                  Cambiar contraseña
                </button>
                <button type="button" onClick={handleLogout} className="w-full rounded-xl border border-black px-4 py-3 uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {notificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setNotificationsModalOpen(false)}
          />
          <section className="relative w-full max-w-3xl rounded-3xl border border-black/10 bg-white shadow-2xl">
            <header className="flex flex-col gap-3 border-b border-black/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Notificaciones</p>
                <h3 className="text-xl font-light text-black mt-1">Tu actividad reciente</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex px-3 py-2 rounded-xl border border-black/10 bg-white text-[10px] uppercase tracking-[0.2em] text-gray-600">
                  Sin leer: {unreadNotifications}
                </span>
                <button
                  type="button"
                  onClick={handleMarkAllNotifications}
                  disabled={markingAllNotifications || unreadNotifications === 0}
                  className="rounded-xl border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {markingAllNotifications ? 'Marcando...' : 'Marcar todas'}
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationsModalOpen(false)}
                  className="rounded-xl border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </header>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-3">
              {notificationError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{notificationError}</p>
              )}

              {loadingNotifications ? (
                <p className="text-sm text-gray-500">Cargando notificaciones...</p>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No tienes notificaciones por ahora.</p>
              ) : (
                notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`rounded-2xl border p-4 ${notification.read ? 'border-black/10 bg-white' : 'border-blue-200 bg-blue-50/50'}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">{notification.type || 'Notificacion'}</p>
                        <h4 className="text-base font-medium text-black">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatNotificationDate(notification.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                            disabled={markingNotificationId === notification.id}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-blue-700 hover:bg-blue-700 hover:text-white disabled:opacity-60"
                          >
                            {markingNotificationId === notification.id ? 'Marcando...' : 'Marcar leida'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleGoFromNotification(notification)}
                          className="rounded-lg border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Modal de detalle de obra */}
      {selectedObra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedObra(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Imagen header */}
            {selectedObra.imagenPortada && (
              <div className="h-64 w-full overflow-hidden rounded-t-3xl">
                <img src={selectedObra.imagenPortada} alt={selectedObra.titulo} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-8 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-1">{selectedObra.modalidad} · {selectedObra.tecnica}</p>
                  <h2 className="text-2xl font-light text-black">{selectedObra.titulo}</h2>
                  <p className="text-sm text-gray-500 mt-1">Por {selectedObra.autor} · {selectedObra.anio}</p>
                </div>
                <button onClick={() => setSelectedObra(null)} className="text-sm uppercase tracking-[0.3em] text-gray-400 hover:text-black transition">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 mb-1">Medidas</p>
                  <p className="text-black">{selectedObra.medidas || 'No especificadas'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 mb-1">Estado</p>
                  <p className="text-black">{selectedObra.estado || 'Disponible'}</p>
                </div>
              </div>

              {selectedObra.descripcion && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Descripción</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedObra.descripcion}</p>
                </div>
              )}

              {selectedObra.procesoObra && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Proceso de la obra</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedObra.procesoObra}</p>
                </div>
              )}

              {selectedObra.historiaObra && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Historia de la obra</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedObra.historiaObra}</p>
                </div>
              )}

              {selectedObra.videoURL && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Video</p>
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={selectedObra.videoURL.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video de la obra"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-black/10">
                <Link to="/works" className="flex-1 text-center rounded-xl border border-black px-4 py-3 text-xs uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition">
                  Ver galería completa
                </Link>
                <button onClick={() => setSelectedObra(null)} className="flex-1 rounded-xl bg-black px-4 py-3 text-xs uppercase tracking-[0.3em] text-white hover:bg-gray-800 transition">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CustomerDashboard
