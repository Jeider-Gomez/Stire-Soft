// Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): textos y formatos compartidos por las pantallas del docente
// y del estudiante.
import { algoritmoDeEjemplo } from '~/utils/pseudocodigo'
import { diagramaInicial } from '~/utils/diagramaFlujo'

export type EstadoEntrega = 'sin_entregar' | 'por_revisar' | 'revisada'

export type TipoEntrega = 'web' | 'javascript' | 'pseudocodigo' | 'diagrama' | 'cualquiera'

/** Cómo se califica la entrega (src/proyectos/entrega-reglas.ts). */
export type EscalaEntrega = 'comentario' | 'aprobacion' | 'desempeno' | 'nota'
export type Valoracion = 'aprobado' | 'no_aprobado' | 'superior' | 'alto' | 'basico' | 'bajo'

/** Las cuatro formas de calificar, en el orden en que se ofrecen (la primera es la de por defecto). */
export const ESCALAS: Array<{ valor: EscalaEntrega; titulo: string; ayuda: string }> = [
  { valor: 'comentario', titulo: 'Solo comentario', ayuda: 'Retroalimentación para mejorar. En lo formativo suele servir más que la nota.' },
  { valor: 'aprobacion', titulo: 'Aprobado o no aprobado', ayuda: 'Con comentario. Para entregas de práctica o de cumplimiento.' },
  { valor: 'desempeno', titulo: 'Desempeño: Superior, Alto, Básico o Bajo', ayuda: 'El nivel sin un número, con la escala nacional (Decreto 1290 de 2009).' },
  { valor: 'nota', titulo: 'Nota de 0,0 a 5,0', ayuda: 'La única que entra al libro de notas y puede contar para el dominio de la lección.' },
]

/** Las valoraciones de cada escala sin número, con lo que significan. */
export const VALORACIONES_DE: Record<'aprobacion' | 'desempeno', Array<{ valor: Valoracion; texto: string; ayuda: string }>> = {
  aprobacion: [
    { valor: 'aprobado', texto: 'Aprobado', ayuda: 'Cumple lo pedido' },
    { valor: 'no_aprobado', texto: 'No aprobado', ayuda: 'Todavía no cumple' },
  ],
  desempeno: [
    { valor: 'superior', texto: 'Superior', ayuda: 'Va más allá de lo pedido' },
    { valor: 'alto', texto: 'Alto', ayuda: 'Cumple bien lo pedido' },
    { valor: 'basico', texto: 'Básico', ayuda: 'Cumple lo mínimo' },
    { valor: 'bajo', texto: 'Bajo', ayuda: 'No alcanza lo mínimo' },
  ],
}

export const NOMBRE_VALORACION: Record<Valoracion, string> = {
  aprobado: 'Aprobado', no_aprobado: 'No aprobado', superior: 'Superior', alto: 'Alto', basico: 'Básico', bajo: 'Bajo',
}

/** La escala de una entrega; las respuestas de antes de las escalas solo traían «con nota». */
export function escalaDe(e: { escala?: EscalaEntrega | null; conNota?: boolean } | null | undefined): EscalaEntrega {
  return e?.escala ?? (e?.conNota ? 'nota' : 'comentario')
}

/** «4,5», «Aprobado», «Superior» o '' si no tiene calificación. */
export function calificacionTexto(v: { nota: number | null; valoracion?: Valoracion | null } | null | undefined): string {
  if (!v) return ''
  if (v.valoracion) return NOMBRE_VALORACION[v.valoracion] ?? ''
  return notaTexto(v.nota)
}

/** Un archivo de un proyecto o del código inicial de una entrega. */
export interface ArchivoCodigo { nombre: string; contenido: string }

/** Lo que el docente edita de una entrega (EntregaForm). */
export interface EntregaEditable {
  id: number; titulo: string; consigna: string; learningUnitId: number | null; tipoProyecto: TipoEntrega
  /** Código inicial: «Empezar desde la plantilla» le crea al estudiante un proyecto con estos archivos. */
  plantilla?: ArchivoCodigo[] | null
  abreAt: string | null; cierraAt: string | null; aceptaTarde: boolean; maxVersiones: number; conNota: boolean
  escala?: EscalaEntrega
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
  tipo: 'enviada' | 'revisada' | 'nota_cambiada' | 'valoracion_cambiada' | 'comentario_editado' | 'revision_borrada' | 'reabierta'
  detalle: Record<string, unknown> | null
  actor: string
  createdAt: string
}

/** Una línea del historial en palabras: «Versión 2 enviada (tarde)», «Nota cambiada: 4,0 → 4,5». */
export function textoEvento(e: EventoHistorial): string {
  const d = e.detalle ?? {}
  switch (e.tipo) {
    case 'enviada': return `Versión ${d.version} enviada${d.tarde ? ' (tarde)' : ''}`
    case 'revisada':
      if (typeof d.valoracion === 'string') return `Revisada · ${NOMBRE_VALORACION[d.valoracion as Valoracion] ?? d.valoracion}`
      return typeof d.nota === 'number' ? `Revisada · nota ${notaTexto(d.nota)}` : 'Revisada con comentario'
    case 'nota_cambiada': return `Nota cambiada: ${notaTexto(d.antes as number | null) || 'sin nota'} → ${notaTexto(d.despues as number | null) || 'sin nota'}`
    case 'valoracion_cambiada': return `Valoración cambiada: ${NOMBRE_VALORACION[d.antes as Valoracion] ?? 'sin valorar'} → ${NOMBRE_VALORACION[d.despues as Valoracion] ?? 'sin valorar'}`
    case 'comentario_editado': return 'Comentario editado'
    case 'revision_borrada': return 'Revisión borrada: vuelve a «sin revisar»'
    case 'reabierta': return 'El docente dio una versión más'
  }
}
