// Gestión de usuarios del admin (pages/admin/index.vue): tipos y reglas puras, con prueba. Antes vivían dentro de una
// página de 1532 líneas («The Blob», PAT-04 de la lista de interfaz); docs/DISENO_ARQUITECTURA_FRONTEND.md.

export interface UsuarioAdmin {
  id: number
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt?: string
}

export interface SolicitudRol {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  requestedRole: string
  reason?: string | null
  createdAt: string
  reviewedAt?: string | null
  reviewNote?: string | null
  user: { id: number; email: string; fullName: string; role: string }
}

export type Rol = 'estudiante' | 'docente' | 'admin'

export const OPCIONES_ROL: ReadonlyArray<{ value: Rol; label: string }> = [
  { value: 'estudiante', label: 'estudiante' },
  { value: 'docente', label: 'docente' },
  { value: 'admin', label: 'administrador' },
]

/** «administrador» y «admin» son el mismo rol (el servidor guarda «admin»). */
export function normalizarRol(rol: string): string {
  return rol === 'administrador' ? 'admin' : rol
}

/** Los roles a los que se puede pasar a alguien: todos menos el que ya tiene. */
export function otrosRoles(u: Pick<UsuarioAdmin, 'role'>) {
  const actual = normalizarRol(u.role)
  return OPCIONES_ROL.filter((r) => r.value !== actual)
}

/** Qué significa el cambio, en una frase, para confirmarlo sabiendo lo que se hace. */
export function explicacionCambioRol(u: Pick<UsuarioAdmin, 'fullName' | 'email' | 'role'>, nuevo: Rol): string {
  const nombre = u.fullName || u.email
  const actual = u.role === 'admin' ? 'administrador' : u.role
  if (nuevo === 'docente') return `${nombre} pasará de ${actual} a docente. Podrá crear clases, diseñar actividades y ver a los estudiantes de sus clases.`
  if (nuevo === 'admin') return `${nombre} pasará de ${actual} a administrador. Tendrá acceso global a la gestión del sistema, usuarios y métricas.`
  return `${nombre} pasará de ${actual} a estudiante. Tendrá acceso a las clases en las que se matricule y no podrá gestionar clases.`
}

/** Búsqueda por nombre o correo y filtro por rol («administrador» filtra también «admin»). */
export function filtrarUsuarios(usuarios: UsuarioAdmin[], busqueda: string, filtroRol: string): UsuarioAdmin[] {
  const q = busqueda.toLowerCase()
  return usuarios.filter((u) => {
    const coincide = (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    const rol = u.role === 'admin' ? 'administrador' : u.role
    return coincide && (filtroRol === 'todos' || rol === filtroRol || u.role === filtroRol)
  })
}

/**
 * Una contraseña que cumple la política (mayúscula, minúscula, número y símbolo): 11 caracteres, sin los que se
 * confunden (I, l, O, 0, 1). `azar` se puede cambiar en las pruebas.
 */
export function generarClaveSegura(azar: () => number = Math.random): string {
  const tomar = (de: string, n: number) => Array.from({ length: n }, () => de[Math.floor(azar() * de.length)]).join('')
  return 'S!' + tomar('ABCDEFGHJKLMNPQRSTUVWXYZ', 3) + tomar('abcdefghijkmnopqrstuvwxyz', 3) + tomar('23456789', 2) + tomar('!@#$%&*', 1)
}
