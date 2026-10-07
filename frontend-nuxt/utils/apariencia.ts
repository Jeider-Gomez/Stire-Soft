// Apariencia y lectura (MOB-03 y pedido del dueño, 04/10: «mejorar la inclusividad»). Como Canvas («Usar interfaz de
// alto contraste»), GitHub o YouTube (tema claro, oscuro o el del sistema), cada persona elige en su perfil:
// - tema: claro (por defecto), oscuro o el del sistema. El claro es el de partida porque el texto oscuro sobre fondo
//   claro se lee mejor (Piepenbrock et al., 2013); el oscuro es una opción para quien lo prefiere o le molesta la luz;
// - alto contraste: texto casi negro (o blanco en oscuro), bordes marcados, enlaces subrayados y foco grueso, como
//   Canvas y GitHub (07/10: antes solo oscurecía un poco los grises y casi no se notaba). Si nunca se ha elegido nada y
//   el dispositivo pide más contraste (prefers-contrast: more), empieza activado;
// - tamaño del texto: normal, grande o muy grande (el texto grande ayuda a leer con dislexia; Rello et al., 2013);
// - espaciado: más aire entre líneas y letras (WCAG 1.4.12).
// No se ofrece una «fuente para dislexia»: OpenDyslexic no mejoró la lectura en un estudio controlado (Wery y Diliberto,
// 2017). Las preferencias viven en este navegador, como la velocidad de la voz.
// «Como mi dispositivo» se resuelve aquí (temaEfectivo) y no en el CSS: así el alto contraste y todo lo demás funcionan
// igual en los dos caminos al oscuro, y el CSS no repite el tema oscuro dos veces.

export type Tema = 'claro' | 'oscuro' | 'sistema'
export type TamanoTexto = 'normal' | 'grande' | 'muy-grande'

export interface Apariencia {
  tema: Tema
  altoContraste: boolean
  texto: TamanoTexto
  espaciado: boolean
}

export const APARIENCIA_POR_DEFECTO: Apariencia = { tema: 'claro', altoContraste: false, texto: 'normal', espaciado: false }
export const CLAVE_APARIENCIA = 'stire.apariencia'

export const TEMAS: Array<{ valor: Tema; texto: string; ayuda: string }> = [
  { valor: 'claro', texto: 'Claro', ayuda: 'El de siempre: se lee mejor con buena luz.' },
  { valor: 'oscuro', texto: 'Oscuro', ayuda: 'Menos brillo, para la noche o si te molesta la luz.' },
  { valor: 'sistema', texto: 'Como mi dispositivo', ayuda: 'Cambia solo según tu celular o computador.' },
]
export const TAMANOS_TEXTO: Array<{ valor: TamanoTexto; texto: string }> = [
  { valor: 'normal', texto: 'Normal' },
  { valor: 'grande', texto: 'Grande' },
  { valor: 'muy-grande', texto: 'Muy grande' },
]

/** Lo que el dispositivo pide (Windows, macOS, Android, iOS): tema oscuro y más contraste. */
export interface PreferenciasSistema {
  oscuro: boolean
  masContraste: boolean
}
const SIN_PREFERENCIAS: PreferenciasSistema = { oscuro: false, masContraste: false }

export function preferenciasDelSistema(): PreferenciasSistema {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return SIN_PREFERENCIAS
  return {
    oscuro: window.matchMedia('(prefers-color-scheme: dark)').matches,
    masContraste: window.matchMedia('(prefers-contrast: more)').matches,
  }
}

/** El tema que se ve: «Como mi dispositivo» sigue al sistema. */
export function temaEfectivo(tema: Tema, sistema: PreferenciasSistema = SIN_PREFERENCIAS): 'claro' | 'oscuro' {
  if (tema === 'sistema') return sistema.oscuro ? 'oscuro' : 'claro'
  return tema
}

/**
 * Lo guardado, validado campo por campo: un valor dañado vuelve al de por defecto sin perder los demás. Si no hay nada
 * guardado, el alto contraste empieza como lo pida el dispositivo.
 */
export function leerApariencia(crudo: string | null, sistema: PreferenciasSistema = SIN_PREFERENCIAS): Apariencia {
  if (crudo === null) return { ...APARIENCIA_POR_DEFECTO, altoContraste: sistema.masContraste }
  let p: Record<string, unknown> = {}
  try {
    const v = crudo ? JSON.parse(crudo) : null
    if (v && typeof v === 'object' && !Array.isArray(v)) p = v
  } catch {
    /* dañado: por defecto */
  }
  return {
    tema: TEMAS.some((t) => t.valor === p.tema) ? (p.tema as Tema) : APARIENCIA_POR_DEFECTO.tema,
    altoContraste: p.altoContraste === true,
    texto: TAMANOS_TEXTO.some((t) => t.valor === p.texto) ? (p.texto as TamanoTexto) : APARIENCIA_POR_DEFECTO.texto,
    espaciado: p.espaciado === true,
  }
}

/** Los atributos de <html> que leen los estilos (assets/css/temas.css). */
export function atributosApariencia(a: Apariencia, sistema: PreferenciasSistema = SIN_PREFERENCIAS): Record<string, string> {
  return {
    'data-tema': temaEfectivo(a.tema, sistema),
    'data-tema-elegido': a.tema,
    'data-contraste': a.altoContraste ? 'alto' : 'normal',
    'data-texto': a.texto,
    'data-espaciado': a.espaciado ? 'amplio' : 'normal',
  }
}

/** Pone los atributos en la página (guardar es de composables/useApariencia.ts). */
export function aplicarApariencia(a: Apariencia, raiz: HTMLElement = document.documentElement, sistema = preferenciasDelSistema()): void {
  for (const [k, v] of Object.entries(atributosApariencia(a, sistema))) raiz.setAttribute(k, v)
}
