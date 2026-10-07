// Apariencia y lectura (MOB-03 y pedido del dueño, 04/10: «mejorar la inclusividad»). Como Canvas («Usar interfaz de
// alto contraste»), GitHub o YouTube (tema claro, oscuro o el del sistema), cada persona elige en su perfil:
// - tema: claro (por defecto), oscuro o el del sistema. El claro es el de partida porque el texto oscuro sobre fondo
//   claro se lee mejor (Piepenbrock et al., 2013); el oscuro es una opción para quien lo prefiere o le molesta la luz;
// - aumentar el contraste: texto casi negro (o blanco en oscuro), bordes marcados, enlaces subrayados y foco grueso,
//   como Canvas y GitHub. Si nunca se ha elegido nada y el dispositivo pide más contraste (prefers-contrast: more),
//   empieza activado;
// - tema de contraste (07/10, pedido del dueño tras comparar con Windows): Acuático, Desierto, Anochecer o Cielo
//   nocturno, con los mismos colores que los «Temas de contraste» de Windows 11. No es «un oscuro más»: es una paleta
//   reducida de ocho colores con significado (fondo, texto, enlace, deshabilitado, seleccionado y botón), con 7 a 1 o
//   más entre cada par (Microsoft, «Contrast themes»). Cuando hay uno, manda sobre el tema y el contraste;
// - tamaño del texto: normal, grande o muy grande (el texto grande ayuda a leer con dislexia; Rello et al., 2013);
// - espaciado: más aire entre líneas y letras (WCAG 1.4.12);
// - reducir el movimiento: quita animaciones y desplazamientos suaves, como Khan Academy (WCAG 2.3.3). También se
//   respeta «reducir movimiento» del dispositivo aunque aquí no se marque.
// No se ofrece una «fuente para dislexia»: OpenDyslexic no mejoró la lectura en un estudio controlado (Wery y Diliberto,
// 2017). Las preferencias viven en este navegador, como la velocidad de la voz.
// «Como mi dispositivo» se resuelve aquí (temaEfectivo) y no en el CSS: así el contraste y todo lo demás funcionan
// igual en los dos caminos al oscuro, y el CSS no repite el tema oscuro dos veces.

export type Tema = 'claro' | 'oscuro' | 'sistema'
export type TamanoTexto = 'normal' | 'grande' | 'muy-grande'
export type TemaContraste = 'ninguno' | 'acuatico' | 'desierto' | 'anochecer' | 'cielo-nocturno'

export interface Apariencia {
  tema: Tema
  altoContraste: boolean
  temaContraste: TemaContraste
  texto: TamanoTexto
  espaciado: boolean
  menosMovimiento: boolean
}

export const APARIENCIA_POR_DEFECTO: Apariencia = {
  tema: 'claro', altoContraste: false, temaContraste: 'ninguno', texto: 'normal', espaciado: false, menosMovimiento: false,
}
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

/**
 * Paleta de un tema de contraste: los ocho colores de sistema de Windows (Microsoft Learn, «Contrast themes»).
 * fondo = Window · texto = WindowText · enlace = Hotlight · inactivo = GrayText (solo lo deshabilitado) ·
 * resalte / resalteTexto = Highlight / HighlightText (lo seleccionado, el botón principal y el foco) ·
 * botonTexto = ButtonText (bordes y controles).
 * correcto / error / aviso / progreso no existen en Windows: STIRE los necesita para «aprobado», «no pasa», «vence hoy»
 * y «en progreso», y se eligieron con 7 a 1 o más sobre el fondo (lo comprueba apariencia.frontend.spec.ts).
 */
export interface PaletaContraste {
  fondo: string
  texto: string
  enlace: string
  inactivo: string
  resalte: string
  resalteTexto: string
  botonTexto: string
  correcto: string
  error: string
  aviso: string
  progreso: string
}

export const TEMAS_CONTRASTE: Array<{ valor: Exclude<TemaContraste, 'ninguno'>; texto: string; ayuda: string; oscuro: boolean; paleta: PaletaContraste }> = [
  {
    valor: 'acuatico', texto: 'Acuático', ayuda: 'Blanco y celeste sobre gris muy oscuro.', oscuro: true,
    paleta: { fondo: '#202020', texto: '#FFFFFF', enlace: '#75E9FC', inactivo: '#A6A6A6', resalte: '#8EE3F0', resalteTexto: '#263B50', botonTexto: '#FFFFFF',
      correcto: '#86EFAC', error: '#FECACA', aviso: '#FDE68A', progreso: '#E9D5FF' },
  },
  {
    valor: 'desierto', texto: 'Desierto', ayuda: 'Gris oscuro y café sobre crema: claro, sin blanco que encandile.', oscuro: false,
    paleta: { fondo: '#FFFAEF', texto: '#3D3D3D', enlace: '#1C5E75', inactivo: '#676767', resalte: '#903909', resalteTexto: '#FFFAEF', botonTexto: '#202020', // Windows usa #FFF5E3 sobre el café: 6,98 a 1; el crema del fondo da 7,3
      correcto: '#14532D', error: '#7F1D1D', aviso: '#713F12', progreso: '#581C87' },
  },
  {
    valor: 'anochecer', texto: 'Anochecer', ayuda: 'Blanco y turquesa sobre gris azulado.', oscuro: true,
    paleta: { fondo: '#2D3236', texto: '#FFFFFF', enlace: '#70EBDE', inactivo: '#A6A6A6', resalte: '#A6D8FF', resalteTexto: '#212D3B', botonTexto: '#B6F6F0',
      correcto: '#A7F3D0', error: '#FECACA', aviso: '#FDE68A', progreso: '#E9D5FF' },
  },
  {
    valor: 'cielo-nocturno', texto: 'Cielo nocturno', ayuda: 'Blanco, amarillo y lila sobre negro.', oscuro: true,
    paleta: { fondo: '#000000', texto: '#FFFFFF', enlace: '#8080FF', inactivo: '#A6A6A6', resalte: '#D6B4FD', resalteTexto: '#2B2B2B', botonTexto: '#FFEE32',
      correcto: '#86EFAC', error: '#FCA5A5', aviso: '#FFEE32', progreso: '#D6B4FD' },
  },
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

/** ¿Windows ya tiene puesto un tema de contraste? Entonces sus colores mandan sobre los de STIRE (forced-colors). */
export function sistemaConColoresForzados(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(forced-colors: active)').matches
}

export function paletaDe(t: TemaContraste) {
  return TEMAS_CONTRASTE.find((x) => x.valor === t)
}

/** El tema que se ve: un tema de contraste manda; «Como mi dispositivo» sigue al sistema. */
export function temaEfectivo(tema: Tema, sistema: PreferenciasSistema = SIN_PREFERENCIAS, temaContraste: TemaContraste = 'ninguno'): 'claro' | 'oscuro' {
  const tc = paletaDe(temaContraste)
  if (tc) return tc.oscuro ? 'oscuro' : 'claro'
  if (tema === 'sistema') return sistema.oscuro ? 'oscuro' : 'claro'
  return tema
}

/**
 * Lo guardado, validado campo por campo: un valor dañado vuelve al de por defecto sin perder los demás. Si no hay nada
 * guardado, el contraste aumentado empieza como lo pida el dispositivo.
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
    temaContraste: paletaDe(p.temaContraste as TemaContraste) ? (p.temaContraste as TemaContraste) : 'ninguno',
    texto: TAMANOS_TEXTO.some((t) => t.valor === p.texto) ? (p.texto as TamanoTexto) : APARIENCIA_POR_DEFECTO.texto,
    espaciado: p.espaciado === true,
    menosMovimiento: p.menosMovimiento === true,
  }
}

/** Los atributos de <html> que leen los estilos (assets/css/temas.css). */
export function atributosApariencia(a: Apariencia, sistema: PreferenciasSistema = SIN_PREFERENCIAS): Record<string, string> {
  const conTema = !!paletaDe(a.temaContraste)
  return {
    'data-tema': temaEfectivo(a.tema, sistema, a.temaContraste),
    'data-tema-elegido': a.tema,
    // Un tema de contraste trae consigo todo lo del contraste aumentado (enlaces subrayados, foco grueso, sin sombras).
    'data-contraste': a.altoContraste || conTema ? 'alto' : 'normal',
    'data-tema-contraste': a.temaContraste,
    'data-texto': a.texto,
    'data-espaciado': a.espaciado ? 'amplio' : 'normal',
    'data-movimiento': a.menosMovimiento ? 'reducido' : 'normal',
  }
}

/** «#8EE3F0» → «142 227 240»: los canales que leen las variables de temas.css (para las transparencias de Tailwind). */
export function canales(hex: string): string {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')
}

/**
 * Las variables de color de un tema de contraste. Todos los tokens de la app se reducen a la paleta: el fondo de la
 * página, de las tarjetas y de los paneles es el mismo (se separan por el borde, como pide Microsoft), el texto
 * secundario es el mismo texto (nunca el gris de «deshabilitado») y el botón principal usa el color de selección.
 */
export function variablesDeContraste(t: TemaContraste): Record<string, string> {
  const tc = paletaDe(t)
  if (!tc) return {}
  const p = tc.paleta
  const v: Record<string, string> = {
    'base-blanco': p.fondo, 'base-bg-primario': p.fondo, 'base-bg-secundario': p.fondo, 'stire-canvas': p.fondo,
    'base-texto-primario': p.texto, 'base-texto-secundario': p.texto,
    'base-borde-sutil': p.botonTexto, 'base-borde-fuerte': p.botonTexto,
    'acento-ambar': p.resalte, 'acento-ambar-fuerte': p.resalte,
    'semantico-info': p.enlace, 'semantico-pasa': p.correcto, 'semantico-falla': p.error,
    'unidad-dominado': p.correcto, 'unidad-en-progreso': p.progreso, 'unidad-por-iniciar': p.enlace, 'unidad-bloqueado': p.inactivo,
    'repaso-al-dia': p.correcto, 'repaso-manana': p.progreso, 'repaso-vencido': p.aviso, 'repaso-critico': p.error,
    'ct-enlace': p.enlace, 'ct-inactivo': p.inactivo, 'ct-resalte': p.resalte, 'ct-resalte-texto': p.resalteTexto, 'ct-boton-texto': p.botonTexto,
  }
  return Object.fromEntries(Object.entries(v).map(([k, hex]) => [`--c-${k}`, canales(hex)]))
}

const TODAS_LAS_VARIABLES = Object.keys(variablesDeContraste('acuatico'))

/** Pone los atributos y, con un tema de contraste, sus colores en la página (guardar es de composables/useApariencia.ts). */
export function aplicarApariencia(a: Apariencia, raiz: HTMLElement = document.documentElement, sistema = preferenciasDelSistema()): void {
  for (const [k, v] of Object.entries(atributosApariencia(a, sistema))) raiz.setAttribute(k, v)
  for (const k of TODAS_LAS_VARIABLES) raiz.style.removeProperty(k)
  for (const [k, v] of Object.entries(variablesDeContraste(a.temaContraste))) raiz.style.setProperty(k, v)
}

/** Contraste WCAG entre dos colores «#RRGGBB» (para las pruebas y para elegir colores con criterio). */
export function razonDeContraste(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
