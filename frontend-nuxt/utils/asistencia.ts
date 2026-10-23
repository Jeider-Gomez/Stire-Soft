// Asistencia con QR (src/asistencia): el estudiante muestra un QR personal que cambia cada 20 s y el docente lo
// escanea; o el docente marca a mano. Aquí: estados, el identificador del celular, el sorteo para llamar a lista y
// la planilla CSV.

export type EstadoAsistencia = 'presente' | 'tarde' | 'excusa' | 'ausente'

export const ESTADOS: Array<{ id: EstadoAsistencia; texto: string; clase: string }> = [
  { id: 'presente', texto: 'Presente', clase: 'bg-semantico-pasa/15 text-semantico-pasa border-semantico-pasa' },
  { id: 'tarde', texto: 'Tarde', clase: 'bg-acento-ambar/15 text-acento-ambar-fuerte border-acento-ambar-fuerte' },
  { id: 'excusa', texto: 'Excusa', clase: 'bg-semantico-info/15 text-semantico-info border-semantico-info' },
  { id: 'ausente', texto: 'Ausente', clase: 'bg-semantico-falla/15 text-semantico-falla border-semantico-falla' },
]

export const PREFIJO_QR_ASISTENCIA = 'STIRE-ASIS:'

export function esQrDeAsistencia(texto: string): boolean {
  return texto.trim().startsWith(PREFIJO_QR_ASISTENCIA)
}

export function textoEstado(estado: EstadoAsistencia | null): string {
  return ESTADOS.find((e) => e.id === estado)?.texto ?? 'Sin marcar'
}

const CLAVE_DISPOSITIVO = 'stire-dispositivo'

/**
 * Un identificador al azar de este navegador, guardado una vez. No dice nada de la persona: solo permite avisar al
 * docente si un mismo celular marcó a dos cuentas. Sin almacenamiento (modo privado) se crea uno por visita.
 */
export function idDeDispositivo(almacen: Pick<Storage, 'getItem' | 'setItem'> | null = guardado()): string {
  try {
    const previo = almacen?.getItem(CLAVE_DISPOSITIVO)
    if (previo && /^[a-z0-9]{8,32}$/.test(previo)) return previo
  } catch { /* sin acceso al almacenamiento */ }
  const nuevo = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')
  try { almacen?.setItem(CLAVE_DISPOSITIVO, nuevo) } catch { /* se usa sin guardar */ }
  return nuevo
}

function guardado(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

/** Llamar a lista al azar: n de los que marcaron presente, para confirmar en voz alta que son ellos. */
export function elegirAlAzar<T>(lista: T[], n: number, azar: () => number = Math.random): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia.slice(0, n)
}

export interface ResumenAsistencia {
  sesiones: Array<{ id: number; fecha: string; tema: string | null; abierta: boolean }>
  filas: Array<{ id: number; nombre: string; email: string; estados: Record<string, EstadoAsistencia | null>; porcentaje: number | null }>
}

function celda(valor: string): string {
  return /[",\n\r]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor
}

/** Planilla para Excel o Moodle: correo, nombre, una columna por sesión (fecha y tema) y el porcentaje. Con BOM para las tildes. */
export function csvAsistencia(resumen: ResumenAsistencia): string {
  const encabezado = ['Correo electrónico', 'Nombre', ...resumen.sesiones.map((s) => (s.tema ? `${s.fecha} ${s.tema}` : s.fecha)), 'Asistencia (%)']
  const filas = resumen.filas.map((f) => [
    f.email, f.nombre,
    ...resumen.sesiones.map((s) => (f.estados[String(s.id)] ? textoEstado(f.estados[String(s.id)]) : '')),
    f.porcentaje === null ? '' : String(f.porcentaje),
  ])
  return '\uFEFF' + [encabezado, ...filas].map((fila) => fila.map(celda).join(',')).join('\r\n') + '\r\n'
}

/** «2026-10-02» → «vie 2 oct» */
export function fechaSesion(fecha: string): string {
  const [a, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '')
}

/** Lo que ve el docente tras escanear: a quién marcó (para comparar la foto) o por qué no se pudo. */
export type ResultadoEscaneo =
  | { ok: true; nombre: string; fotoId: string | null; yaEstaba: boolean; alerta: string | null }
  | { ok: false; mensaje: string }

/** Lo que le queda al código QR de «Mi asistencia», en palabras (hallazgo de José, 09/10: con la barra sola no se notaba). */
export function textoCuentaQr(segundos: number): string {
  if (segundos <= 0) return 'Cambiando el código…'
  return `Cambia en ${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`
}

/**
 * La clase en la que el estudiante está trabajando va primero; las demás conservan su orden. José (S09-JO01, 14/10):
 * con varias clases de nombres parecidos no se sabía cuál era la de ahora.
 */
export function claseActualPrimero<T extends { classId: number }>(clases: T[], actual: number | null | undefined): T[] {
  const i = clases.findIndex((c) => c.classId === actual)
  return i <= 0 ? clases : [clases[i], ...clases.slice(0, i), ...clases.slice(i + 1)]
}

// ── Asistencia activa (stores/asistenciaActiva.ts): el panel flotante que sigue a la vista mientras se usa STIRE ──

export interface MarcaEnSesion { id: number; nombre: string; estado: EstadoAsistencia | null; hora: string | null }

/** Los últimos que llegaron (presente o tarde), del más reciente al más antiguo. */
export function llegadasRecientes<T extends MarcaEnSesion>(estudiantes: T[], n = 5): T[] {
  return estudiantes
    .filter((e) => (e.estado === 'presente' || e.estado === 'tarde') && e.hora)
    .sort((a, b) => String(b.hora).localeCompare(String(a.hora)))
    .slice(0, n)
}

const llego = (e: MarcaEnSesion) => e.estado === 'presente' || e.estado === 'tarde'

/** Los ids de quienes ya llegaron: lo que el docente «ya vio» al abrir el panel. */
export function idsQueLlegaron(estudiantes: MarcaEnSesion[]): number[] {
  return estudiantes.filter(llego).map((e) => e.id)
}

/** Cuántos llegaron que el docente todavía no vio: el número del panel plegado. Por id, no por hora (el reloj del computador puede no coincidir con el del servidor). */
export function llegadosNoVistos(estudiantes: MarcaEnSesion[], vistos: readonly number[]): number {
  return estudiantes.filter((e) => llego(e) && !vistos.includes(e.id)).length
}

/** Quienes faltan por marcar y coinciden con lo escrito, sin importar tildes ni mayúsculas (para marcar a mano). */
export function sinMarcarQueCoinciden<T extends MarcaEnSesion>(estudiantes: T[], texto: string, n = 6): T[] {
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const q = norm(texto.trim())
  return estudiantes.filter((e) => e.estado === null && (!q || norm(e.nombre).includes(q))).slice(0, n)
}
