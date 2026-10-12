// La parte de la pantalla que se ve de verdad en el celular (window.visualViewport). Con el teclado abierto es más baja
// que la pantalla: un panel «fixed» de altura completa queda con su final (el campo y los últimos mensajes del Tutor)
// detrás del teclado (hallazgo de José, 09/10). Se usa en components/tutor/TutorChatDrawer.vue.

export interface AreaVisible {
  /** Alto de lo que se ve (visualViewport.height). */
  alto: number
  /** Cuánto bajó lo que se ve dentro de la página (visualViewport.offsetTop; en iPhone, al abrir el teclado). */
  arriba: number
  /** Alto de la ventana (window.innerHeight). */
  altoPantalla: number
}

/** Estilo del panel: en computador, o si no se achicó lo visible, ninguno (manda la clase «h-full»). */
export function estiloPanelVisible(area: AreaVisible | null, pantallaAncha: boolean): Record<string, string> | undefined {
  if (pantallaAncha || !area) return undefined
  const tapado = area.altoPantalla - area.alto
  if (tapado < 1 && area.arriba < 1) return undefined
  return { height: `${Math.round(area.alto)}px`, top: `${Math.round(area.arriba)}px` }
}
