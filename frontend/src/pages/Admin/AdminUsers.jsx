import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/Layouts/AdminLayout'
import { getAdminUsersWithCourses } from '../../services/authService'
import adminSharedStyles from './AdminSharedStyles'
import globalStyles from './DashboardStyles'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true)
        setError('')
        const response = await getAdminUsersWithCourses()
        const list = Array.isArray(response) ? response : response?.data || []
        setUsers(list)
        if (list.length > 0) {
          setSelectedUserId(list[0].uid)
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los usuarios.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    const role = roleFilter.trim().toLowerCase()

    return users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
      const matchesSearch =
        !term
        || fullName.includes(term)
        || (user.email || '').toLowerCase().includes(term)
        || (user.rol || '').toLowerCase().includes(term)

      const matchesRole = role === 'todos' || (user.rol || '').toLowerCase() === role

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  useEffect(() => {
    if (filteredUsers.length === 0) {
      setSelectedUserId('')
      return
    }

    const selectedStillExists = filteredUsers.some((user) => user.uid === selectedUserId)
    if (!selectedStillExists) {
      setSelectedUserId(filteredUsers[0].uid)
    }
  }, [filteredUsers, selectedUserId])

  const selectedUser = filteredUsers.find((user) => user.uid === selectedUserId) || null
  const totalUsers = users.length

  const roleCounts = useMemo(() => ({
    todos: users.length,
    admin: users.filter((user) => user.rol === 'admin').length,
    docente: users.filter((user) => user.rol === 'docente').length,
    cliente: users.filter((user) => user.rol === 'cliente').length,
  }), [users])

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'
    try {
      const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value)
      return date.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Sin fecha'
    }
  }

  return (
    <>
      <style>{adminSharedStyles + globalStyles}</style>
      <AdminLayout activeSection="usuarios">
        <div className="ad-root db-root">
          {/* ── Header ── */}
          <header className="db-header">
            <div className="db-header-text">
              <p className="db-eyebrow">Administración</p>
              <h1 className="db-title">Usuarios registrados</h1>
              <p className="db-subtitle">Revisa quiénes están registrados en la plataforma y en qué cursos y talleres están inscritos.</p>
            </div>
          </header>

          {/* ── Stats Pills ── */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-wider text-gray-600">
              Total: {totalUsers}
            </span>
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-wider text-gray-600">
              Admin: {roleCounts.admin}
            </span>
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-wider text-gray-600">
              Docente: {roleCounts.docente}
            </span>
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-wider text-gray-600">
              Cliente: {roleCounts.cliente}
            </span>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Content Grid ── */}
          <div className="db-content-grid">
            {/* ── Sidebar ── */}
            <aside className="db-card">
              <div className="mb-4">
                <p className="db-kpi-label mb-2">Buscar usuario</p>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre, correo o rol"
                  className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                />
              </div>

              <div className="mb-4">
                <p className="db-kpi-label mb-2">Filtrar por rol</p>
                <div className="flex flex-wrap gap-2">
                  {['todos', 'admin', 'docente', 'cliente'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRoleFilter(role)}
                      className={`ad-chip-btn ${
                        roleFilter === role
                          ? 'border-black bg-black text-white'
                          : ''
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="db-kpi-label">Resultados</p>
                <span className="text-xs text-gray-500">{filteredUsers.length}</span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="db-skeleton db-skeleton--lg" style={{ height: '64px' }} />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-500 py-6">No hay usuarios que coincidan con la búsqueda.</p>
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUserId === user.uid
                    return (
                      <button
                        key={user.uid}
                        type="button"
                        onClick={() => setSelectedUserId(user.uid)}
                        className="db-feed-item w-full text-left"
                        style={{
                          background: isSelected ? 'var(--text-primary)' : 'var(--surface)',
                          color: isSelected ? 'var(--surface)' : 'var(--text-primary)',
                          borderColor: isSelected ? 'var(--text-primary)' : 'var(--border)',
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p style={{ fontSize: '13px', fontWeight: 400 }}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
                            {user.email}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '10px', whiteSpace: 'nowrap' }}>
                          <p>{user.totalCursos || 0} cursos</p>
                          <p>{user.totalTalleres || 0} talleres</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </aside>

            {/* ── Main Content ── */}
            <div className="db-card">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="db-skeleton db-skeleton--lg" />
                  <div className="db-skeleton db-skeleton--sm" style={{ width: '40%' }} />
                  <div className="db-skeleton" style={{ height: '128px' }} />
                </div>
              ) : selectedUser ? (
                <div className="space-y-8">
                  <header>
                    <p className="db-eyebrow">Detalle del usuario</p>
                    <h2 className="db-card-title" style={{ fontSize: '24px' }}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="db-subtitle" style={{ marginTop: '8px' }}>
                      {selectedUser.email}
                    </p>
                  </header>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <p className="db-kpi-label">Cursos inscritos</p>
                      <p className="db-kpi-value">{selectedUser.totalCursos || 0}</p>
                    </div>
                    <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <p className="db-kpi-label">Talleres inscritos</p>
                      <p className="db-kpi-value">{selectedUser.totalTalleres || 0}</p>
                    </div>
                    <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <p className="db-kpi-label">Registro</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>
                        {formatDate(selectedUser.creadoEn)}
                      </p>
                    </div>
                    <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <p className="db-kpi-label">Última actividad</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>
                        {formatDate(selectedUser.actualizadoEn)}
                      </p>
                    </div>
                  </div>

                  <section>
                    <div className="db-card-head">
                      <div>
                        <p className="db-eyebrow">Cursos del usuario</p>
                        <h3 className="db-card-title">Inscripciones en cursos</h3>
                      </div>
                    </div>

                    {(selectedUser.cursos || []).length === 0 ? (
                      <div className="db-empty">
                        <p className="db-empty p">Este usuario todavía no está inscrito en ningún curso.</p>
                      </div>
                    ) : (
                      <div className="db-feed">
                        {(selectedUser.cursos || []).map((course) => (
                          <div
                            key={course.courseId}
                            style={{
                              padding: '16px',
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              marginBottom: '8px'
                            }}
                          >
                            <p className="db-feed-title">{course.courseTitle}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                              ID: {course.courseId}
                            </p>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <p>Precio: {course.currency} {Number(course.coursePrice || 0).toLocaleString('es-CO')}</p>
                              <p>Inscrito: {formatDate(course.registeredAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="db-card-head">
                      <div>
                        <p className="db-eyebrow">Talleres del usuario</p>
                        <h3 className="db-card-title">Inscripciones en talleres</h3>
                      </div>
                    </div>

                    {(selectedUser.talleres || []).length === 0 ? (
                      <div className="db-empty">
                        <p className="db-empty p">Este usuario todavía no está inscrito en ningún taller.</p>
                      </div>
                    ) : (
                      <div className="db-feed">
                        {(selectedUser.talleres || []).map((workshop) => (
                          <div
                            key={workshop.workshopId}
                            style={{
                              padding: '16px',
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              marginBottom: '8px'
                            }}
                          >
                            <p className="db-feed-title">{workshop.workshopTitle}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                              ID: {workshop.workshopId}
                            </p>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <p>Precio: {workshop.currency} {Number(workshop.workshopPrice || 0).toLocaleString('es-CO')}</p>
                              <p>Inscrito: {formatDate(workshop.registeredAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div className="db-empty">
                  <p>Selecciona un usuario para ver sus cursos y talleres registrados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

export default AdminUsers
