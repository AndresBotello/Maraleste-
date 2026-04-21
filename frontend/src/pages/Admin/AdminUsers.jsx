import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/Layouts/AdminLayout'
import { getAdminUsersWithCourses } from '../../services/authService'

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
    <AdminLayout activeSection="usuarios">
      <section className="space-y-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Administración</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Usuarios registrados</h1>
          <p className="text-lg text-gray-500 font-light max-w-2xl">
            Revisa quiénes están registrados en la plataforma y en qué cursos y talleres están inscritos.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
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
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-3xl border border-black/5 bg-white p-5 shadow-lg shadow-black/5">
            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
                Buscar usuario
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, correo o rol"
                className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
                Filtrar por rol
              </label>
              <div className="flex flex-wrap gap-2">
                {['todos', 'admin', 'docente', 'cliente'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-2 rounded-xl text-xs uppercase tracking-wider border transition ${
                      roleFilter === role
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 bg-white text-gray-600 hover:bg-black/5'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Resultados</p>
              <span className="text-xs text-gray-500">{filteredUsers.length}</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
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
                      className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg shadow-black/10'
                          : 'border-black/5 bg-white hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider border ${
                            user.rol === 'admin'
                              ? isSelected
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-blue-200 bg-blue-50 text-blue-700'
                              : user.rol === 'docente'
                              ? isSelected
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                              : isSelected
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                          }`}>
                            {user.rol}
                          </span>
                          <p className={`mt-2 text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            {user.totalCursos || 0} cursos · {user.totalTalleres || 0} talleres
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </aside>

          <article className="rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-lg shadow-black/5">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-64 bg-gray-100 rounded" />
                <div className="h-4 w-40 bg-gray-100 rounded" />
                <div className="h-32 bg-gray-100 rounded-2xl" />
              </div>
            ) : selectedUser ? (
              <div className="space-y-8">
                <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Detalle del usuario</p>
                    <h2 className="text-3xl font-light text-black">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-black/10 text-gray-700 bg-black/[0.02]">
                      {selectedUser.rol}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider border ${
                      selectedUser.activo !== false
                        ? 'border-green-200 text-green-700 bg-green-50'
                        : 'border-red-200 text-red-700 bg-red-50'
                    }`}>
                      {selectedUser.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </header>

                <section className="grid md:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Cursos inscritos</p>
                    <p className="text-3xl font-light text-black">{selectedUser.totalCursos || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Talleres inscritos</p>
                    <p className="text-3xl font-light text-black">{selectedUser.totalTalleres || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Registro</p>
                    <p className="text-sm text-gray-700 font-light">{formatDate(selectedUser.creadoEn)}</p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Última Actividad</p>
                    <p className="text-sm text-gray-700 font-light">{formatDate(selectedUser.actualizadoEn)}</p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Cursos del usuario</p>
                      <h3 className="text-xl font-medium text-black">Inscripciones en cursos</h3>
                    </div>
                  </div>

                  {(selectedUser.cursos || []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-gray-500">
                      Este usuario todavía no está inscrito en ningún curso.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(selectedUser.cursos || []).map((course) => (
                        <div key={course.courseId} className="rounded-2xl border border-black/5 p-4 bg-white shadow-sm shadow-black/5">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-medium text-black">{course.courseTitle}</h4>
                              <p className="text-sm text-gray-500 mt-1">ID: {course.courseId}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider border border-black/10 text-gray-600 bg-black/[0.02]">
                                {course.courseType}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider border ${
                                course.courseStatus === 'publicado'
                                  ? 'border-green-200 text-green-700 bg-green-50'
                                  : 'border-amber-200 text-amber-700 bg-amber-50'
                              }`}>
                                {course.courseStatus}
                              </span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-3 mt-4 text-sm text-gray-600">
                            <p>Precio: {course.currency} {Number(course.coursePrice || 0).toLocaleString('es-CO')}</p>
                            <p>Inscrito: {formatDate(course.registeredAt)}</p>
                            <p>Moneda: {course.currency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Talleres del usuario</p>
                      <h3 className="text-xl font-medium text-black">Inscripciones en talleres</h3>
                    </div>
                  </div>

                  {(selectedUser.talleres || []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-gray-500">
                      Este usuario todavía no está inscrito en ningún taller.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(selectedUser.talleres || []).map((workshop) => (
                        <div key={workshop.workshopId} className="rounded-2xl border border-black/5 p-4 bg-white shadow-sm shadow-black/5">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-medium text-black">{workshop.workshopTitle}</h4>
                              <p className="text-sm text-gray-500 mt-1">ID: {workshop.workshopId}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider border border-black/10 text-gray-600 bg-black/[0.02]">
                                {workshop.workshopType}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider border ${
                                workshop.workshopStatus === 'publicado'
                                  ? 'border-green-200 text-green-700 bg-green-50'
                                  : 'border-amber-200 text-amber-700 bg-amber-50'
                              }`}>
                                {workshop.workshopStatus}
                              </span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-3 mt-4 text-sm text-gray-600">
                            <p>Precio: {workshop.currency} {Number(workshop.workshopPrice || 0).toLocaleString('es-CO')}</p>
                            <p>Inscrito: {formatDate(workshop.registeredAt)}</p>
                            <p>Moneda: {workshop.currency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-16 text-center text-gray-500">
                <p>Selecciona un usuario para ver sus cursos y talleres registrados.</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminUsers
