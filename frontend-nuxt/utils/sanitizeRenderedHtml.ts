import DOMPurify from 'dompurify'

/**
 * Última línea de defensa al pintar lecciones y enunciados con v-html (Fase 25, A7).
 *
 * POR QUÉ HACE FALTA: el servidor sanea el texto al guardarlo, pero `formatMarkdown` aplica después reemplazos de texto
 * (código en línea, títulos, listas…) sobre ese HTML ya saneado. Esos reemplazos insertan HTML con comillas (`<code class="…">`)
 * y, si caían dentro del valor de un atributo (por ejemplo `<b title="…`x`…">`), abrían el atributo y colaban otros
 * (onclick, onload…). Sanear con reglas de texto no es fiable; lo fiable es sanear el DOM resultante.
 *
 * Esta función ejecuta DOMPurify sobre el HTML FINAL con la MISMA lista blanca que el servidor
 * (src/content-rendering/content-rendering.service.ts, RICH_CONFIG) más las etiquetas que genera el propio formatMarkdown
 * (todas ya están en esa lista). Protege también los datos ya guardados antes de esta defensa. Si cambias la lista en el servidor,
 * cámbiala aquí.
 */
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'strong', 'em', 'b', 'i', 'u', 's', 'blockquote',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'a', 'pre', 'code', 'span', 'div', 'iframe',
]
const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class',
  'colspan', 'rowspan', 'target', 'rel',
  'width', 'height', 'allow', 'allowfullscreen', 'frameborder',
]
const ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com']

let hookInstalled = false

function installIframeHook() {
  if (hookInstalled) return
  hookInstalled = true
  // Igual que el servidor: un iframe solo se admite contra hosts embebibles permitidos; cualquier otro se elimina del árbol.
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return
    const src = (node as Element).getAttribute?.('src')
    let host: string | null = null
    try {
      host = src ? new URL(src, 'https://invalid.local').hostname : null
    } catch {
      host = null
    }
    if (!host || !ALLOWED_IFRAME_HOSTS.includes(host)) node.parentNode?.removeChild(node)
  })
}

export function sanitizeRenderedHtml(html: string, opciones: { parrafos?: boolean } = {}): string {
  if (!html) return ''
  installIframeHook()
  if (!opciones.parrafos) return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
  const fragmento = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, RETURN_DOM_FRAGMENT: true })
  envolverParrafos(fragmento)
  const caja = fragmento.ownerDocument.createElement('div')
  caja.appendChild(fragmento)
  return caja.innerHTML
}

// Lo que ya es un bloque: no va dentro de un párrafo.
const BLOQUES = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'PRE', 'TABLE', 'DIV', 'BLOCKQUOTE', 'HR', 'IFRAME'])

/**
 * El texto suelto entre bloques, partido por líneas en blanco (`<br><br>`), pasa a `<p>`. Antes cada párrafo era texto
 * pelado entre saltos: «Escuchar» solo leía títulos, listas y tablas (se saltaba todos los párrafos) y un lector de
 * pantalla no podía ir de párrafo en párrafo. Se hace sobre el DOM ya saneado: no se crea nada que no sea un `<p>`.
 */
function envolverParrafos(raiz: DocumentFragment) {
  const doc = raiz.ownerDocument
  let tramo: ChildNode[] = []
  const vacio = (n: ChildNode) => n.nodeName === 'BR' || (n.nodeType === 3 && !(n.textContent ?? '').trim())
  const cerrar = () => {
    while (tramo.length && vacio(tramo[0])) tramo.shift()!.remove()
    while (tramo.length && vacio(tramo[tramo.length - 1])) tramo.pop()!.remove()
    if (tramo.length) {
      const p = doc.createElement('p')
      p.className = 'my-3'
      tramo[0].before(p)
      for (const n of tramo) p.appendChild(n)
    }
    tramo = []
  }
  for (const n of Array.from(raiz.childNodes)) {
    if (n.nodeType === 1 && BLOQUES.has(n.nodeName)) { cerrar(); continue }
    if (n.nodeName === 'BR') {
      // Dos saltos seguidos (con espacios entre ellos o no) cierran el párrafo.
      let siguiente = n.nextSibling
      while (siguiente && siguiente.nodeType === 3 && !(siguiente.textContent ?? '').trim()) siguiente = siguiente.nextSibling
      if (siguiente?.nodeName === 'BR' || tramo.length && tramo[tramo.length - 1].nodeName === 'BR') {
        tramo.push(n)
        cerrar()
        continue
      }
    }
    tramo.push(n)
  }
  cerrar()
}
