import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import '~/assets/css/recorrido.css'
import { useAuthStore } from '~/stores/auth'
import { claveVisto, recorridoDeRuta, type Recorrido } from '~/utils/recorridos'

/** Espera a que la pantalla cargue sus datos antes de señalar sus partes. */
const ESPERA_PRIMERA_VEZ_MS = 1500

/** Sin selector (la bienvenida) siempre se muestra, en el centro. */
function seVe(selector: string | undefined): boolean {
  if (!selector) return true
  const el = document.querySelector(selector)
  return !!el && el.getClientRects().length > 0
}

/** «Ver en el manual» al pie del globo: abre la tarea en otra pestaña para no perder el recorrido. */
function enlaceAlManual(tarea: string): HTMLAnchorElement {
  const a = document.createElement('a')
  a.href = `/ayuda#${tarea}`
  a.target = '_blank'
  a.rel = 'noopener'
  a.className = 'recorrido-manual'
  a.textContent = 'Ver en el manual'
  a.setAttribute('aria-label', 'Ver en el manual (se abre en otra pestaña)')
  return a
}

/**
 * «Saltar recorrido» y «No volver a mostrar recorridos» (23/10, pedido del dueño), debajo del texto de cada globo.
 * Saltar cierra el de esta pantalla; la casilla apaga los automáticos en todas (Apariencia › Ayuda los vuelve a encender).
 */
function opcionesDelGlobo(alSaltar: (() => void) | null, apagados: boolean, alMarcar: (apagar: boolean) => void): HTMLDivElement {
  const fila = document.createElement('div')
  fila.className = 'recorrido-opciones'
  const etiqueta = document.createElement('label')
  const casilla = document.createElement('input')
  casilla.type = 'checkbox'
  casilla.checked = apagados
  casilla.addEventListener('change', () => alMarcar(casilla.checked))
  etiqueta.append(casilla, document.createTextNode('No volver a mostrar recorridos'))
  fila.appendChild(etiqueta)
  if (alSaltar) {
    const saltar = document.createElement('button')
    saltar.type = 'button'
    saltar.className = 'recorrido-saltar'
    saltar.textContent = 'Saltar recorrido'
    saltar.addEventListener('click', alSaltar)
    fila.appendChild(saltar)
  }
  return fila
}

/**
 * El recorrido guiado de la pantalla actual (utils/recorridos.ts). `primeraVez` lo muestra solo si esa persona no lo ha
 * visto en esa pantalla y no apagó los recorridos; `mostrar` lo repite (botón «?» de la cabecera), aunque estén apagados.
 */
export function useRecorrido() {
  const route = useRoute()
  const authStore = useAuthStore()
  const { apariencia, cambiar } = useApariencia()
  const actual = computed(() => recorridoDeRuta(route.path, authStore.currentRole))

  function yaVisto(r: Recorrido): boolean {
    // Sin almacenamiento no se sabe si ya lo vio: mejor no aparecer solo en cada visita (sigue el botón «?»).
    try { return localStorage.getItem(claveVisto(r.id, authStore.user?.id)) === '1' } catch { return true }
  }

  function marcarVisto(r: Recorrido) {
    try { localStorage.setItem(claveVisto(r.id, authStore.user?.id), '1') } catch { /* solo se pierde el recuerdo */ }
  }

  /** Dibuja el recorrido con los pasos cuyo elemento se ve. Devuelve false si no había nada que señalar. */
  function dibujar(r: Recorrido): boolean {
    const pasos: DriveStep[] = r.pasos
      .filter((p) => seVe(p.elemento))
      // «Hazlo tú»: tocar el elemento lleva al paso siguiente (Driver.js deja tocar lo señalado).
      .map((p) => ({ element: p.elemento, advanceOnClick: p.hazloTu ?? false, popover: { title: p.titulo, description: p.texto } }))
    if (!pasos.length) return false
    const recorrido = driver({
      steps: pasos,
      showProgress: pasos.length > 1,
      // Con un solo paso, «← Anterior» no lleva a ningún lado.
      showButtons: pasos.length > 1 ? ['next', 'previous', 'close'] : ['next', 'close'],
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Entendido',
      animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      popoverClass: 'recorrido-stire',
      overlayClickBehavior: 'close',
      // Driver.js nombra en inglés el botón de cerrar; el lector de pantalla debe decirlo en español.
      onPopoverRender: (globo) => {
        globo.closeButton.setAttribute('aria-label', 'Cerrar el recorrido')
        globo.closeButton.setAttribute('title', 'Cerrar el recorrido')
        if (r.manual) globo.description.appendChild(enlaceAlManual(r.manual))
        globo.footer.before(opcionesDelGlobo(
          pasos.length > 1 ? () => recorrido.destroy() : null,
          !apariencia.value.recorridosAutomaticos,
          (apagar) => cambiar({ recorridosAutomaticos: !apagar }),
        ))
      },
      onDestroyed: () => marcarVisto(r),
    })
    recorrido.drive()
    return true
  }

  function mostrar() {
    if (actual.value) dibujar(actual.value)
  }

  function primeraVez() {
    const r = actual.value
    if (!r || yaVisto(r) || !apariencia.value.recorridosAutomaticos) return
    setTimeout(() => {
      if (actual.value?.id === r.id && !yaVisto(r) && apariencia.value.recorridosAutomaticos) dibujar(r)
    }, ESPERA_PRIMERA_VEZ_MS)
  }

  return { actual, mostrar, primeraVez }
}
