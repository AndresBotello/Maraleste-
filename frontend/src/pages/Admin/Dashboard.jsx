import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layouts/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { getCourses } from '../../services/courseService'
import { getWorkshops } from '../../services/workshopService'
import { getArtworks } from '../../services/artworkService'
import { useFetch } from '../../hooks/useFetch'
import globalStyles from './dashboardStyles'


function DashboardStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'dashboard-styles'
    style.textContent = globalStyles
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById('dashboard-styles')
      if (el) el.remove()
    }
  }, [])
  return null
}

function Dashboard() {
  const { profile, user } = useAuth()
  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : user?.displayName || 'Usuario'

  const { data: cursos, loading: loadingCursos } = useFetch(() => getCourses())
  const { data: talleres, loading: loadingTalleres } = useFetch(() => getWorkshops())
  const { data: obras, loading: loadingObras } = useFetch(() => getArtworks())

  const listaCursos = cursos || []
  const listaTalleres = talleres || []
  const listaObras = obras || []

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
        context: `${totalEstudiantes} estudiantes inscritos`,
        icon: '◈',
        color: 'var(--accent-read)',
      },
      {
        label: 'Talleres activos',
        value: listaTalleres.length,
        context: `${talleresVirtuales} virtuales · ${totalParticipantes} participantes`,
        icon: '⬡',
        color: 'var(--accent-resource)',
      },
      {
        label: 'Cupos ocupados',
        value: cuposOcupados,
        context: `De ${listaTalleres.reduce((a, t) => a + (t.cuposTotal || 0), 0)} cupos totales`,
        icon: '▣',
        color: 'var(--accent-video)',
      },
      {
        label: 'Obras en galería',
        value: listaObras.length,
        context: `${[...new Set(listaObras.map(o => o.modalidad))].length} modalidades distintas`,
        icon: '◎',
        color: '#7C5CBF',
      },
    ]
  }, [listaCursos, listaTalleres, listaObras])

  const activityFeed = useMemo(() => {
    const items = []
    listaCursos.forEach(c => items.push({
      title: c.titulo, type: 'Curso',
      owner: c.instructor || 'Sin instructor',
      categoria: c.categoria,
      createdAt: c.creadoEn || c.createdAt || null,
      link: `/admin/cursos`,
    }))
    listaTalleres.forEach(t => items.push({
      title: t.titulo,
      type: t.linkReunion ? 'Taller virtual' : 'Taller',
      owner: t.instructor || 'Sin instructor',
      categoria: t.categoria,
      createdAt: t.creadoEn || t.createdAt || null,
      link: `/admin/talleres`,
    }))
    listaObras.forEach(o => items.push({
      title: o.titulo, type: 'Obra',
      owner: o.autor || 'Sin autor',
      categoria: o.modalidad,
      createdAt: o.creadoEn || o.createdAt || null,
      link: `/admin/obras`,
    }))
    items.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt._seconds ? a.createdAt._seconds * 1000 : a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt._seconds ? b.createdAt._seconds * 1000 : b.createdAt) : new Date(0)
      return dateB - dateA
    })
    return items.slice(0, 8)
  }, [listaCursos, listaTalleres, listaObras])

  const upcomingWorkshops = useMemo(() => {
    const now = new Date()
    return [...listaTalleres]
      .filter(t => { if (!t.fecha) return false; try { return new Date(t.fecha) >= now } catch { return true } })
      .sort((a, b) => { try { return new Date(a.fecha) - new Date(b.fecha) } catch { return 0 } })
      .slice(0, 3)
  }, [listaTalleres])

  const formatRelativeDate = (timestamp) => {
    if (!timestamp) return ''
    try {
      const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMin = Math.floor(diffMs / 60000)
      const diffH = Math.floor(diffMs / 3600000)
      const diffD = Math.floor(diffMs / 86400000)
      if (diffMin < 1) return 'Ahora'
      if (diffMin < 60) return `${diffMin}m`
      if (diffH < 24) return `${diffH}h`
      if (diffD < 7) return `${diffD}d`
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    } catch { return '' }
  }

  const typeConfig = {
    'Curso': { icon: '◈', color: 'var(--accent-read)' },
    'Taller virtual': { icon: '▶', color: 'var(--accent-video)' },
    'Taller': { icon: '⬡', color: 'var(--accent-resource)' },
    'Obra': { icon: '◎', color: '#7C5CBF' },
  }

  const isLoading = loadingCursos || loadingTalleres || loadingObras

  return (
    <>
      <style>{globalStyles}</style>
      <AdminLayout activeSection="dashboard">
        <div className="db-root">

          {/* ── Hero header ── */}
          <header className="db-header">
            <div className="db-header-text">
              <p className="db-eyebrow">Panel ejecutivo</p>
              <h1 className="db-title">
                Bienvenido, <em>{displayName.split(' ')[0]}</em>
              </h1>
              <p className="db-subtitle">
                Gestiona contenido, ventas y formación desde un tablero centralizado.
              </p>
            </div>
            <div className="db-header-date">
              <p className="db-date-day">{new Date().toLocaleDateString('es-ES', { weekday: 'long' })}</p>
              <p className="db-date-full">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </header>

          {/* ── KPIs ── */}
          <section className="db-kpi-grid">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="db-kpi db-kpi--skeleton">
                    <div className="db-skeleton db-skeleton--sm" />
                    <div className="db-skeleton db-skeleton--lg" />
                    <div className="db-skeleton db-skeleton--sm" style={{ width: '60%' }} />
                  </div>
                ))
              : kpis.map(({ label, value, context, icon, color }) => (
                  <article key={label} className="db-kpi">
                    <div className="db-kpi-top">
                      <p className="db-kpi-label">{label}</p>
                      <span className="db-kpi-icon" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                        {icon}
                      </span>
                    </div>
                    <p className="db-kpi-value">{value.toLocaleString()}</p>
                    <p className="db-kpi-context">{context}</p>
                    <div className="db-kpi-bar">
                      <div className="db-kpi-bar-fill" style={{ width: `${Math.min(100, (value / Math.max(...kpis.map(k => k.value), 1)) * 100)}%`, background: color }} />
                    </div>
                  </article>
                ))}
          </section>

          {/* ── Activity + Agenda ── */}
          <section className="db-content-grid">

            {/* Activity Feed */}
            <div className="db-card">
              <div className="db-card-head">
                <div>
                  <p className="db-eyebrow">Actividad reciente</p>
                  <h2 className="db-card-title">Últimos registros</h2>
                </div>
                <span className="db-record-count">
                  {isLoading ? '—' : activityFeed.length}
                </span>
              </div>

              {isLoading ? (
                <div className="db-feed">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="db-feed-item db-feed-item--skeleton">
                      <div className="db-skeleton db-skeleton--circle" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="db-skeleton db-skeleton--sm" style={{ width: '55%' }} />
                        <div className="db-skeleton db-skeleton--sm" style={{ width: '35%' }} />
                      </div>
                      <div className="db-skeleton db-skeleton--sm" style={{ width: 40 }} />
                    </div>
                  ))}
                </div>
              ) : activityFeed.length === 0 ? (
                <div className="db-empty">
                  <span className="db-empty-icon">◯</span>
                  <p>Sin registros aún. Crea tu primer curso o taller.</p>
                </div>
              ) : (
                <div className="db-feed">
                  {activityFeed.map(({ title, type, owner, categoria, createdAt, link }) => {
                    const cfg = typeConfig[type] || typeConfig['Taller']
                    return (
                      <Link key={`${title}-${type}`} to={link} className="db-feed-item">
                        <span
                          className="db-feed-icon"
                          style={{
                            color: cfg.color,
                            background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                          }}
                        >
                          {cfg.icon}
                        </span>
                        <div className="db-feed-body">
                          <p className="db-feed-title">{title}</p>
                          <p className="db-feed-meta">
                            <span
                              className="db-type-pill"
                              style={{
                                '--pill-color': cfg.color,
                              }}
                            >
                              {type}
                            </span>
                            {categoria && <span>{categoria}</span>}
                          </p>
                        </div>
                        <div className="db-feed-right">
                          <p className="db-feed-time">{formatRelativeDate(createdAt)}</p>
                          <p className="db-feed-owner">{owner}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Agenda */}
            <aside className="db-aside">
              <div className="db-card">
                <div className="db-card-head">
                  <div>
                    <p className="db-eyebrow">Agenda</p>
                    <h3 className="db-card-title">Próximos talleres</h3>
                  </div>
                </div>

                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="db-workshop-item">
                        <div className="db-skeleton db-skeleton--sm" style={{ width: '70%' }} />
                        <div className="db-skeleton db-skeleton--sm" style={{ width: '45%', marginTop: 6 }} />
                      </div>
                    ))}
                  </div>
                ) : upcomingWorkshops.length === 0 ? (
                  <div className="db-empty">
                    <span className="db-empty-icon">◷</span>
                    <p>Sin talleres próximos.</p>
                  </div>
                ) : (
                  <div className="db-workshop-list">
                    {upcomingWorkshops.map((t) => (
                      <div key={t.id} className="db-workshop-item">
                        <div className="db-workshop-top">
                          <p className="db-workshop-title">{t.titulo}</p>
                          {t.linkReunion && (
                            <span className="db-virtual-badge">
                              <span className="db-virtual-dot" />
                              Virtual
                            </span>
                          )}
                        </div>
                        <p className="db-workshop-date">
                          {t.fecha}{t.hora && ` · ${t.hora}`}
                        </p>
                        <div className="db-workshop-cupos">
                          <div className="db-cupos-bar-wrap">
                            <div
                              className="db-cupos-bar-fill"
                              style={{
                                width: `${t.cuposTotal ? ((t.cuposTotal - (t.cuposDisponibles ?? t.cuposTotal)) / t.cuposTotal) * 100 : 0}%`
                              }}
                            />
                          </div>
                          <span className="db-cupos-text">
                            {t.cuposDisponibles ?? t.cuposTotal} / {t.cuposTotal} disponibles
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link to="/admin/talleres" className="db-card-link">
                  Gestionar talleres →
                </Link>
              </div>

            </aside>
          </section>
        </div>
      </AdminLayout>
    </>
  )
}



export default Dashboard