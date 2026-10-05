// Geometría del editor de diagramas de flujo (antes dentro de components/proyectos/EditorDiagrama.vue): cómo se parte
// el texto de una figura, su tamaño, por dónde va cada flecha y dónde cae una figura nueva. Sin Vue ni DOM: se prueba
// sola en src/content-rendering/__tests__/editor-diagrama-dividido.frontend.spec.ts.
import { TIPO_FIGURA, type Figura, type TipoFigura } from './diagramaFlujo'

export type Salida = 'siguiente' | 'si' | 'no'

export interface Flecha {
  origenId: string
  destinoId: string
  salida: Salida
  ruta: string
  etiqueta?: 'Sí' | 'No'
  etiquetaX: number
  etiquetaY: number
}

/** El texto de la figura en líneas (16 caracteres en un rombo, 20 en el resto), cortando por palabras; hasta 5. */
export function lineasTexto(fig: Figura): string[] {
  if (fig.tipo === 'inicio') return ['Inicio']
  if (fig.tipo === 'fin') return ['Fin']
  const texto = fig.texto.trim()
  if (!texto) return ['…']
  const max = fig.tipo === 'decision' ? 16 : 20
  const lineas: string[] = []
  for (const parrafo of texto.split('\n')) {
    if (parrafo.length <= max) { lineas.push(parrafo); continue }
    let actual = ''
    for (const palabra of parrafo.split(' ')) {
      if (!actual) actual = palabra
      else if ((actual + ' ' + palabra).length <= max) actual += ' ' + palabra
      else { lineas.push(actual); actual = palabra }
    }
    if (actual) lineas.push(actual)
  }
  return lineas.slice(0, 5)
}

/** Ancho y alto de la figura según su forma y su texto. */
export function geometriaFigura(fig: Figura): { w: number; h: number } {
  const lineas = lineasTexto(fig)
  const maxChars = Math.max(...lineas.map((l) => l.length), 4)
  if (fig.tipo === 'inicio' || fig.tipo === 'fin') return { w: 140, h: 48 }
  if (fig.tipo === 'decision') {
    return { w: Math.max(150, Math.min(260, 48 + maxChars * 9)), h: Math.max(68, Math.min(130, 36 + lineas.length * 18)) }
  }
  if (fig.tipo === 'entrada' || fig.tipo === 'salida') {
    return { w: Math.max(140, Math.min(260, 44 + maxChars * 8)), h: Math.max(50, Math.min(120, 24 + lineas.length * 16)) }
  }
  return { w: Math.max(140, Math.min(250, 36 + maxChars * 8)), h: Math.max(50, Math.min(130, 26 + lineas.length * 16)) }
}

/** Altura de la primera línea para que el bloque de texto quede centrado en la figura. */
export function posicionInicialTexto(fig: Figura): number {
  return (geometriaFigura(fig).h - (lineasTexto(fig).length - 1) * 16) / 2 + 4
}

/** Puntos de la forma (paralelogramo o rombo) para `<polygon points>`. */
export function puntosForma(fig: Figura): string {
  const { w, h } = geometriaFigura(fig)
  return TIPO_FIGURA[fig.tipo].forma === 'rombo'
    ? `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`
    : `18,0 ${w},0 ${w - 18},${h} 0,${h}`
}

/** De dónde sale una flecha: «No» por la derecha; «Sí» y la salida normal, por abajo. */
export function puntoDeSalida(fig: Figura, salida: Salida): { x: number; y: number } {
  const { w, h } = geometriaFigura(fig)
  return salida === 'no' ? { x: fig.x + w, y: fig.y + h / 2 } : { x: fig.x + w / 2, y: fig.y + h }
}

/** La ruta SVG de una flecha y dónde va su etiqueta: recta, curva hacia abajo o un rodeo por el lado si sube. */
export function calcularRuta(orig: Figura, salida: Salida, dest: Figura): { path: string; labelX: number; labelY: number } {
  const geoDest = geometriaFigura(dest)
  const { x: x1, y: y1 } = puntoDeSalida(orig, salida)
  const llegaPorLaIzquierda = dest.y < y1 && salida === 'no' && dest.x > orig.x
  const x2 = llegaPorLaIzquierda ? dest.x : dest.x + geoDest.w / 2
  const y2 = llegaPorLaIzquierda ? dest.y + geoDest.h / 2 : dest.y
  if (Math.abs(x1 - x2) < 4 && y2 >= y1) return { path: `M ${x1} ${y1} L ${x2} ${y2}`, labelX: x1 + 14, labelY: (y1 + y2) / 2 }
  if (y2 >= y1 + 20) {
    const d = (y2 - y1) * 0.5
    return { path: `M ${x1} ${y1} C ${x1} ${y1 + d}, ${x2} ${y2 - d}, ${x2} ${y2}`, labelX: (x1 + x2) / 2, labelY: (y1 + y2) / 2 }
  }
  const lado = Math.max(x1, x2) + 60
  return { path: `M ${x1} ${y1} C ${lado} ${y1}, ${lado} ${y2 - 30}, ${x2} ${y2}`, labelX: lado - 10, labelY: (y1 + y2) / 2 }
}

/** Todas las flechas del diagrama; las que apuntan a una figura que ya no existe no se dibujan. */
export function listaDeFlechas(figuras: Figura[]): Flecha[] {
  const flechas: Flecha[] = []
  const porId = new Map(figuras.map((f) => [f.id, f]))
  for (const f of figuras) {
    const salidas: Salida[] = f.tipo === 'decision' ? ['si', 'no'] : f.tipo === 'fin' ? [] : ['siguiente']
    for (const salida of salidas) {
      const dest = f[salida] ? porId.get(f[salida] as string) : undefined
      if (!dest) continue
      const r = calcularRuta(f, salida, dest)
      flechas.push({
        origenId: f.id, destinoId: dest.id, salida, ruta: r.path, etiquetaX: r.labelX, etiquetaY: r.labelY,
        ...(salida === 'si' ? { etiqueta: 'Sí' as const } : salida === 'no' ? { etiqueta: 'No' as const } : {}),
      })
    }
  }
  return flechas
}

/** El lienzo crece con el diagrama (mínimo 750 × 550) para desplazarse con su propia barra. */
export function dimensionesLienzo(figuras: Figura[]): { ancho: number; alto: number } {
  let ancho = 750
  let alto = 550
  for (const f of figuras) {
    const { w, h } = geometriaFigura(f)
    ancho = Math.max(ancho, f.x + w + 120)
    alto = Math.max(alto, f.y + h + 120)
  }
  return { ancho, alto }
}

/** «inicio» y «fin» la primera vez; si no, f1, f2… el primero libre. */
export function nuevoId(tipo: TipoFigura, figuras: Figura[]): string {
  if ((tipo === 'inicio' || tipo === 'fin') && !figuras.some((f) => f.id === tipo)) return tipo
  let n = 1
  while (figuras.some((f) => f.id === `f${n}`)) n++
  return `f${n}`
}

/** Una figura nueva cae debajo de la más baja, alineada con la última agregada. */
export function lugarLibre(figuras: Figura[]): { x: number; y: number } {
  if (figuras.length === 0) return { x: 160, y: 30 }
  return { x: figuras[figuras.length - 1].x, y: Math.max(...figuras.map((f) => f.y)) + 100 }
}

export const TEXTO_INICIAL: Record<TipoFigura, string> = {
  inicio: 'Inicio', fin: 'Fin', entrada: 'variable', proceso: 'x <- 1', decision: 'x >= 0', salida: '"Listo"',
}

/** Quita las flechas que llegaban a una figura borrada. */
export function quitarReferencias(figuras: Figura[], id: string): void {
  for (const f of figuras) {
    if (f.siguiente === id) f.siguiente = null
    if (f.si === id) f.si = null
    if (f.no === id) f.no = null
  }
}

/** Cómo se nombra una figura para una persona: «Proceso: x <- 1», no «Proceso (f3)». */
export function nombreFigura(fig: Figura): string {
  const nombre = TIPO_FIGURA[fig.tipo].nombre
  if (fig.tipo === 'inicio' || fig.tipo === 'fin') return nombre
  const texto = fig.texto.trim().split('\n')[0]
  if (!texto) return `${nombre} sin texto`
  return `${nombre}: ${texto.length > 28 ? texto.slice(0, 27) + '…' : texto}`
}
