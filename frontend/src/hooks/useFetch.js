import { useState, useEffect, useCallback } from 'react'

/**
 * Hook reutilizable para hacer fetch de datos.
 * Maneja estado de carga, error y reintento.
 *
 * @param {Function} fetchFn - Función async que retorna datos
 * @param {Array} deps - Dependencias para re-ejecutar
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: Function }}
 *
 * @example
 * const { data: cursos, loading, error, refetch } = useFetch(() => getCourses())
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error('useFetch error:', err)
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}
