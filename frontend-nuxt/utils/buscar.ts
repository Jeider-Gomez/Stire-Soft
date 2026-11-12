// «Buscar» (Ctrl K) del docente y del administrador (v3, Fase B; barra de arriba de los cuadros D3-… y A-…).
// El del estudiante es «Ir a una lección» (components/estudiante/IrALeccion.vue). Aquí, como en el cuadro E-Buscar,
// se busca con palabras sueltas o una frase entre las pantallas del menú, las clases del docente y las tareas del
// manual. Sin tildes ni mayúsculas: «asistencia» encuentra «Asistencia y notas».

import { enlacePestana, type PestanaClase } from './pestanasClase'
import type { SeccionManual } from './manual'

export type TipoResultado = 'pantalla' | 'clase' | 'ayuda'

export interface Resultado {
  id: string
  titulo: string
  /** Debajo del título: dónde está o qué es. */
  detalle: string
  ir: string
  tipo: TipoResultado
  /** Otras palabras con que la gente lo busca. */
  claves?: string
}

/** Minúsculas y sin tildes, para comparar como lo escribe la gente. */
export function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'a', 'en', 'como', 'mi', 'mis', 'que', 'para', 'por', 'con', 'se', 'lo', 'al'])

/** Las palabras que cuentan de lo que se escribió (sin «cómo», «de», «la»…). */
export function palabras(texto: string): string[] {
  return normalizar(texto).replace(/[¿?¡!.,;:«»"()]/g, ' ').split(/\s+/).filter((p) => p.length > 1 && !VACIAS.has(p))
}

/**
 * Busca entre los resultados posibles. Gana lo que tiene todas las palabras; entre esos, primero lo que las tiene en el
 * título, luego las pantallas, luego las clases y al final la ayuda. Sin texto, las pantallas, para empezar.
 */
export function buscar(items: Resultado[], texto: string, maximo = 8): Resultado[] {
  const p = palabras(texto)
  if (!p.length) return items.filter((r) => r.tipo === 'pantalla').slice(0, maximo)
  const ORDEN: Record<TipoResultado, number> = { pantalla: 0, clase: 1, ayuda: 2 }
  return items
    .map((r) => {
      const titulo = normalizar(r.titulo)
      const todo = `${titulo} ${normalizar(r.detalle)} ${normalizar(r.claves ?? '')}`
      if (!p.every((w) => todo.includes(w))) return null
      const enTitulo = p.filter((w) => titulo.includes(w)).length
      const empieza = titulo.startsWith(p[0]) ? 1 : 0
      return { r, puntos: enTitulo * 10 + empieza * 5 - ORDEN[r.tipo] }
    })
    .filter((x): x is { r: Resultado; puntos: number } => x !== null)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, maximo)
    .map((x) => x.r)
}

/** Las pantallas del menú de cada rol, con los nombres del menú v3 (SidebarNav.vue) y cómo las busca la gente. */
export function pantallasDeRol(rol: string): Resultado[] {
  const p = (id: string, titulo: string, ir: string, detalle: string, claves = ''): Resultado => ({ id: `p-${id}`, titulo, ir, detalle, tipo: 'pantalla', claves })
  if (rol === 'docente') {
    return [
      p('clases', 'Mis clases', '/docente', 'Todas tus clases', 'inicio crear clase nueva'),
      p('biblioteca', 'Biblioteca', '/docente/biblioteca', 'Cursos que compartieron otros docentes', 'copiar curso plantilla compartido'),
      p('mensajes', 'Avisos y mensajes', '/docente/mensajes', 'Escribir a tus estudiantes', 'mensaje aviso comunicar escribir'),
      p('perfil', 'Mi cuenta', '/docente/perfil', 'Tus datos, la apariencia y la clave', 'perfil contraseña clave apariencia tema oscuro'),
    ]
  }
  if (rol === 'administrador') {
    return [
      p('usuarios', 'Usuarios y roles', '/admin', 'Personas', 'personas cuentas rol docente solicitudes registrar desactivar'),
      p('catalogo', 'Catálogo académico', '/admin/catalogo', 'Académico', 'instituciones programas asignaturas duplicados'),
      p('sugerencias', 'Sugerencias', '/admin/sugerencias', 'Opiniones', 'reportes problemas ideas'),
      p('sus', 'Encuesta de usabilidad', '/admin/usabilidad', 'Opiniones', 'sus encuesta puntaje'),
      p('estado', 'Estado del sistema', '/admin/dashboard', 'Sistema', 'salud servidor funciona'),
      p('registros', 'Registros y mantenimiento', '/admin/sistema', 'Sistema', 'logs registros mantenimiento'),
      p('perfil', 'Mi perfil', '/admin/perfil', 'Tus datos y la clave', 'cuenta contraseña clave apariencia'),
    ]
  }
  return []
}

/** Lo que el docente busca de una clase: su resumen y cada sección, con la clase ya elegida. */
export function clasesComoResultados(clases: Array<{ id: number; name: string; code?: string }>): Resultado[] {
  const SECCIONES: Array<[PestanaClase, string, string]> = [
    ['hoy', 'Resumen', 'resumen necesitan ayuda'],
    ['contenido', 'Contenido', 'lecciones temas modulos ejercicios'],
    ['estudiantes', 'Estudiantes', 'alumnos dominio avance'],
    ['asistencia', 'Asistencia', 'qr lista asistencia'],
    ['notas', 'Notas', 'calificaciones moodle'],
    ['entregas', 'Entregas', 'revisar calificar'],
    ['refuerzos', 'Refuerzos y retos', 'refuerzo reto'],
    ['ajustes', 'Ajustes de la clase', 'configurar codigo'],
  ]
  return clases.flatMap((c) => SECCIONES.map(([pestana, nombre, claves]) => ({
    id: `c-${c.id}-${pestana}`,
    titulo: pestana === 'hoy' ? c.name : `${nombre} · ${c.name}`,
    detalle: pestana === 'hoy' ? `Clase${c.code ? ` · ${c.code}` : ''}` : 'Clase',
    ir: enlacePestana(pestana, c.id),
    tipo: 'clase' as const,
    claves: `${claves} ${c.code ?? ''}`,
  })))
}

/** Las tareas del manual para ese rol y las de todos, como en E-Buscar («También te puede servir · Ayuda»). */
export function ayudaDeRol(manual: SeccionManual[], rol: string): Resultado[] {
  return manual
    .filter((s) => s.rol === 'todos' || s.rol === rol)
    .flatMap((s) => s.tareas.map((t) => ({ id: `a-${t.id}`, titulo: t.titulo, detalle: `Ayuda · ${s.titulo}`, ir: `/ayuda#${t.id}`, tipo: 'ayuda' as const, claves: t.paraQue })))
}
