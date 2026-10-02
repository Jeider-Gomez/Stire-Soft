// Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): textos y formatos compartidos por las pantallas del docente
// y del estudiante.
import { algoritmoDeEjemplo } from '~/utils/pseudocodigo'
import { diagramaInicial } from '~/utils/diagramaFlujo'

export type EstadoEntrega = 'sin_entregar' | 'por_revisar' | 'revisada'

export type TipoEntrega = 'web' | 'javascript' | 'pseudocodigo' | 'diagrama' | 'cualquiera'

/** Un archivo de un proyecto o del código inicial de una entrega. */
export interface ArchivoCodigo { nombre: string; contenido: string }

/** Lo que el docente edita de una entrega (EntregaForm). */
export interface EntregaEditable {
  id: number; titulo: string; consigna: string; learningUnitId: number | null; tipoProyecto: TipoEntrega
  /** Código inicial: «Empezar desde la plantilla» le crea al estudiante un proyecto con estos archivos. */
  plantilla?: ArchivoCodigo[] | null
  abreAt: string | null; cierraAt: string | null; aceptaTarde: boolean; maxVersiones: number; conNota: boolean
  cuentaParaDominio: boolean; dificultad: string; publicada: boolean; asignadaA: number[] | null
}

/**
 * Punto de partida del código inicial, el mismo que crea el servidor para un proyecto nuevo
 * (src/proyectos/proyecto-reglas.ts, plantillaInicial). El docente lo cambia a su gusto.
 */
export function codigoInicialPorDefecto(tipo: 'web' | 'javascript' | 'pseudocodigo' | 'diagrama'): ArchivoCodigo[] {
  if (tipo === 'diagrama') {
    return [{ nombre: 'diagrama.json', contenido: JSON.stringify(diagramaInicial(), null, 2) }]
  }
  if (tipo === 'pseudocodigo') return [{ nombre: 'algoritmo.psc', contenido: algoritmoDeEjemplo() }]
  if (tipo === 'javascript') {
    return [{ nombre: 'main.js', contenido: '// Lee la entrada con leerEntrada() y muestra resultados con console.log().\nconst entrada = leerEntrada();\nconsole.log(entrada);\n' }]
  }
  return [
    { nombre: 'index.html', contenido: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" href="estilos.css">\n  <title>Mi página</title>\n</head>\n<body>\n  <h1>Mi página</h1>\n  <script src="script.js"></script>\n</body>\n</html>\n' },
    { nombre: 'estilos.css', contenido: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n' },
    { nombre: 'script.js', contenido: '// Tu código aquí\n' },
  ]
}

/** Lenguaje del editor según la extensión del archivo. */
export function lenguajeDeArchivo(nombre: string): 'html' | 'css' | 'javascript' | 'pseudocodigo' | 'text' {
  const ext = nombre.split('.').pop()?.toLowerCase()
  return ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'js' ? 'javascript' : ext === 'psc' ? 'pseudocodigo' : 'text'
}

export const ESTADO_ENTREGA: Record<EstadoEntrega, string> = {
  sin_entregar: 'Sin entregar',
  por_revisar: 'Por revisar',
  revisada: 'Revisada',
}

export const TIPO_ENTREGA: Record<TipoEntrega, string> = {
  cualquiera: 'Cualquier proyecto',
  web: 'Página web',
  javascript: 'Programa de JavaScript',
  pseudocodigo: 'Algoritmo en pseudocódigo',
  diagrama: 'Diagrama de flujo',
}

/** «30 sept, 19:35» */
export function fechaCorta(iso: string | Date | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Nota con coma decimal: 4.5 → «4,5». */
export function notaTexto(nota: number | null | undefined): string {
  return nota === null || nota === undefined ? '' : nota.toFixed(1).replace('.', ',')
}

/** Valor para un <input type="datetime-local"> en la hora local del navegador; '' si no hay fecha. */
export function aFechaLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`
}

/** De un <input type="datetime-local"> a ISO (con la zona del navegador); null si está vacío. */
export function deFechaLocal(valor: string): string | null {
  return valor ? new Date(valor).toISOString() : null
}

export interface EventoHistorial {
  id: number
  tipo: 'enviada' | 'revisada' | 'nota_cambiada' | 'comentario_editado' | 'revision_borrada' | 'reabierta'
  detalle: Record<string, unknown> | null
  actor: string
  createdAt: string
}

/** Una línea del historial en palabras: «Versión 2 enviada (tarde)», «Nota cambiada: 4,0 → 4,5». */
export function textoEvento(e: EventoHistorial): string {
  const d = e.detalle ?? {}
  switch (e.tipo) {
    case 'enviada': return `Versión ${d.version} enviada${d.tarde ? ' (tarde)' : ''}`
    case 'revisada': return typeof d.nota === 'number' ? `Revisada · nota ${notaTexto(d.nota)}` : 'Revisada con comentario'
    case 'nota_cambiada': return `Nota cambiada: ${notaTexto(d.antes as number | null) || 'sin nota'} → ${notaTexto(d.despues as number | null) || 'sin nota'}`
    case 'comentario_editado': return 'Comentario editado'
    case 'revision_borrada': return 'Revisión borrada: vuelve a «sin revisar»'
    case 'reabierta': return 'El docente dio una versión más'
  }
}
