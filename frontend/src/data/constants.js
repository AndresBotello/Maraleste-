/**
 * Datos estáticos reutilizables en toda la aplicación.
 * Categorías, niveles, idiomas y otra información que no cambia frecuentemente.
 */

export const CATEGORIAS = [
  { id: 'diseño', nombre: 'Diseño' },
  { id: 'animacion', nombre: 'Animación' },
  { id: 'fotografia', nombre: 'Fotografía' },
  { id: 'ilustracion', nombre: 'Ilustración' },
  { id: 'pintura', nombre: 'Pintura' },
  { id: 'escultura', nombre: 'Escultura' },
  { id: 'ceramica', nombre: 'Cerámica' },
  { id: 'otro', nombre: 'Otro' },
]

export const CATEGORIAS_CON_TODOS = [
  { id: 'todos', nombre: 'Todos los Cursos' },
  ...CATEGORIAS,
]

export const NIVELES = ['Principiante', 'Intermedio', 'Avanzado']

export const IDIOMAS = ['Español', 'Inglés', 'Portugués']

export const ICONOS_MODULO = ['🎨', '🌈', '⚖️', '✍️', '🎯', '📐', '💡', '🔥', '🎭', '📸', '🖌️', '🎪']
