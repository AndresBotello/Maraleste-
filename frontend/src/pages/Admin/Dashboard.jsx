import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { getCourses } from '../../services/courseService'
import { getWorkshops } from '../../services/workshopService'
import { getArtworks } from '../../services/artworkService'
import { useFetch } from '../../hooks/useFetch'

function Dashboard() {
  const { profile, user } = useAuth()

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : user?.displayName || 'Usuario'

  // ─── Datos reales desde el backend ───
  const { data: cursos, loading: loadingCursos } = useFetch(() => getCourses())
  const { data: talleres, loading: loadingTalleres } = useFetch(() => getWorkshops())
  const { data: obras, loading: loadingObras } = useFetch(() => getArtworks())

  const listaCursos = cursos || []
  const listaTalleres = talleres || []
  const listaObras = obras || []

  // ─── KPIs calculados ───
  const kpis = useMemo(() => {
    const totalEstudiantes = listaCursos.reduce((acc, c) => acc + (c.estudiantesInscritos || 0), 0)
    const talleresVirtuales = listaTalleres.filter(t => t.linkReunion).length
    const totalParticipantes = listaTalleres.reduce((acc, t) => acc + (t.participantes || 0), 0)
    const cuposOcupados = listaTalleres.reduce((acc, t) => {
      const total = t.cuposTotal || 0
      const disponibles = t.cuposDisponibles ?? total
      return acc + (total - disponibles)
    }, 0)

    return [
      {
        label: 'Cursos publicados',
        value: listaCursos.length,
        context: `${totalEstudiantes} estudiantes inscritos en total`,
        icon: '📚',
      },
      {
        label: 'Talleres activos',
        value: listaTalleres.length,
        context: `${talleresVirtuales} con sesión virtual · ${totalParticipantes} participantes`,
        icon: '🎨',
      },
      {
        label: 'Cupos ocupados',
        value: cuposOcupados,
        context: `De ${listaTalleres.reduce((a, t) => a + (t.cuposTotal || 0), 0)} cupos totales en talleres`,
        icon: '👥',
      },
      {
        label: 'Obras en galería',
        value: listaObras.length,
        context: `${[...new Set(listaObras.map(o => o.modalidad))].length} modalidades distintas`,
        icon: '🖼️',
      },
    ]
  }, [listaCursos, listaTalleres, listaObras])

  // ─── Actividad reciente: últimos items creados ───
  const activityFeed = useMemo(() => {
    const items = []

    listaCursos.forEach(c => {
      items.push({
        title: c.titulo,
        type: 'Curso',
        owner: c.instructor || 'Sin instructor',
        categoria: c.categoria,
        createdAt: c.creadoEn || c.createdAt || null,
        link: `/admin/cursos`,
      })
    })

    listaTalleres.forEach(t => {
      items.push({
        title: t.titulo,
        type: t.linkReunion ? 'Taller virtual' : 'Taller',
        owner: t.instructor || 'Sin instructor',
        categoria: t.categoria,
        createdAt: t.creadoEn || t.createdAt || null,
        link: `/admin/talleres`,
      })
    })

    listaObras.forEach(o => {
      items.push({
        title: o.titulo,
        type: 'Obra',
        owner: o.autor || 'Sin autor',
        categoria: o.modalidad,
        createdAt: o.creadoEn || o.createdAt || null,
        link: `/admin/obras`,
      })
    })

    // Ordenar por fecha de creación (más reciente primero)
    items.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt._seconds ? a.createdAt._seconds * 1000 : a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt._seconds ? b.createdAt._seconds * 1000 : b.createdAt) : new Date(0)
      return dateB - dateA
    })

    return items.slice(0, 8)
  }, [listaCursos, listaTalleres, listaObras])

  // ─── Próximos talleres (por fecha más cercana) ───
  const upcomingWorkshops = useMemo(() => {
    const now = new Date()
    return [...listaTalleres]
      .filter(t => {
        if (!t.fecha) return false
        try { return new Date(t.fecha) >= now } catch { return true }
      })
      .sort((a, b) => {
        try { return new Date(a.fecha) - new Date(b.fecha) } catch { return 0 }
      })
      .slice(0, 3)
  }, [listaTalleres])

  // ─── Formato de fecha relativa ───
  const formatRelativeDate = (timestamp) => {
    if (!timestamp) return ''
    try {
      const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMin = Math.floor(diffMs / 60000)
      const diffH = Math.floor(diffMs / 3600000)
      const diffD = Math.floor(diffMs / 86400000)

      if (diffMin < 1) return 'Justo ahora'
      if (diffMin < 60) return `Hace ${diffMin} min`
      if (diffH < 24) return `Hace ${diffH}h`
      if (diffD < 7) return `Hace ${diffD}d`
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    } catch {
      return ''
    }
  }

  const isLoading = loadingCursos || loadingTalleres || loadingObras

  return (
    <>
      <AdminLayout activeSection="dashboard">
        <div className="space-y-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Panel ejecutivo</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900">
              Bienvenido, {displayName}
            </h1>
            <p className="text-base text-gray-600 max-w-xl">
              Gestiona contenido, ventas y formación desde un tablero centralizado con métricas en tiempo real.
            </p>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="rounded-3xl border border-black/5 bg-white px-6 py-7 shadow-sm shadow-black/5 animate-pulse">
                <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-16 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </article>
            ))
          ) : (
            kpis.map(({ label, value, context, icon }) => (
              <article key={label} className="rounded-3xl border border-black/5 bg-white px-6 py-7 shadow-sm shadow-black/5 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{label}</p>
                  <span className="text-lg">{icon}</span>
                </div>
                <p className="text-3xl font-light text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-4">{context}</p>
              </article>
            ))
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          {/* Actividad reciente */}
          <article className="rounded-3xl border border-black/5 bg-white px-4 md:px-6 py-6 md:py-7 shadow-sm shadow-black/5">
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Actividad reciente</p>
                <h2 className="text-lg md:text-xl font-medium text-gray-900">Últimos registros</h2>
              </div>
            </header>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 md:gap-4 rounded-2xl border border-black/5 px-3 md:px-4 py-4 animate-pulse">
                    <div className="h-10 w-10 rounded-xl bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-4 w-32 md:w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-20 md:w-24 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No hay registros aún. Crea tu primer curso o taller.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {activityFeed.map(({ title, type, owner, categoria, createdAt, link }) => (
                  <Link
                    key={`${title}-${type}`}
                    to={link}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 rounded-2xl border border-black/5 px-3 md:px-4 py-3 md:py-4 transition hover:bg-black/5"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-white flex-shrink-0 ${
                      type === 'Curso' ? 'bg-indigo-500' : type === 'Taller virtual' ? 'bg-blue-500' : type === 'Obra' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}>
                      {type === 'Curso' ? '📚' : type === 'Taller virtual' ? '📹' : type === 'Obra' ? '🖼️' : '🎨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words">{title}</p>
                      <p className="text-xs text-gray-500 truncate">{type} · {categoria}</p>
                      <p className="text-xs text-gray-500 truncate sm:hidden mt-1">{owner}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                      <p>{formatRelativeDate(createdAt)}</p>
                      <p className="text-gray-500 truncate max-w-[100px]">{owner}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-6">
            {/* Próximos talleres */}
            <article className="rounded-3xl border border-black/5 bg-white px-4 md:px-6 py-6 md:py-7 shadow-sm shadow-black/5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 md:mb-4">Agenda</p>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Próximos talleres</h3>

              {isLoading ? (
                <div className="space-y-3 md:space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-black/5 px-3 md:px-4 py-3 md:py-4 animate-pulse">
                      <div className="h-4 w-32 md:w-40 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-24 md:w-28 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : upcomingWorkshops.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No hay talleres programados próximamente.</p>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {upcomingWorkshops.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-black/5 px-3 md:px-4 py-3 md:py-4">
                      <p className="text-sm font-medium text-gray-900 break-words">{t.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">📅 {t.fecha} {t.hora && `· ${t.hora}`}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                        <p className="text-xs font-medium text-gray-600">
                          👥 {t.cuposDisponibles ?? t.cuposTotal} / {t.cuposTotal} cupos
                        </p>
                        {t.linkReunion && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Virtual
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/admin/talleres" className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.3em] text-black hover:underline underline-offset-4">
                Gestionar talleres →
              </Link>
            </article>

          </aside>
        </section>
        
      </div>
    </AdminLayout>
    </>
    
  )
}


export default Dashboard
