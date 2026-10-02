// Proyectos se ejecutan en el navegador del estudiante (docs/DISENO_PROYECTOS.md §9): no ocupan el servidor.

export interface ArchivoProyecto { nombre: string; contenido: string }

/** Tipos de proyecto (src/proyectos/proyecto-reglas.ts). «pseudocodigo» es para el curso sin tanto código (fase 4). */
export type TipoProyecto = 'web' | 'javascript' | 'pseudocodigo' | 'diagrama'
export const TIPO_PROYECTO: Record<TipoProyecto, string> = { web: 'Página web', javascript: 'JavaScript', pseudocodigo: 'Pseudocódigo', diagrama: 'Diagrama de flujo' }
/**
 * Los tipos que se ofrecen al crear un proyecto.
 */
export const TIPOS_QUE_SE_CREAN: TipoProyecto[] = ['web', 'javascript', 'pseudocodigo', 'diagrama']
/** Extensiones que admite cada tipo, en el orden en que se sugieren. */
export const EXTENSIONES_PROYECTO: Record<TipoProyecto, string[]> = { web: ['html', 'css', 'js', 'txt'], javascript: ['js', 'txt'], pseudocodigo: ['psc', 'txt'], diagrama: ['json', 'txt'] }

/**
 * Código que corre dentro de un Web Worker: no ve la página, y si se cuelga, se termina el Worker. `leerEntrada()` y
 * `require('fs').readFileSync(0)` devuelven la entrada (así el código de los ejercicios de programar funciona igual).
 */
export function fuenteDelWorker(codigo: string, entrada: string): string {
  return `
const __entrada = ${JSON.stringify(entrada)};
const __texto = (v) => typeof v === 'string' ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
const __enviar = (tipo, args) => self.postMessage({ tipo, texto: Array.from(args).map(__texto).join(' ') });
const console = { log: (...a) => __enviar('log', a), info: (...a) => __enviar('log', a), warn: (...a) => __enviar('warn', a), error: (...a) => __enviar('error', a) };
const leerEntrada = () => __entrada;
const require = (m) => { if (m === 'fs') return { readFileSync: () => __entrada }; throw new Error('En Proyectos solo está disponible el módulo fs para leer la entrada.'); };
const process = { stdout: { write: (t) => __enviar('log', [String(t).replace(/\\n$/, '')]) } };
try {
  (function () {
${codigo}
  })();
  self.postMessage({ tipo: 'fin' });
} catch (e) {
  self.postMessage({ tipo: 'error', texto: (e && e.name ? e.name + ': ' : '') + (e && e.message ? e.message : String(e)) });
  self.postMessage({ tipo: 'fin' });
}
`
}

export interface ResultadoEjecucion { lineas: Array<{ tipo: 'log' | 'warn' | 'error'; texto: string }>; tiempoAgotado: boolean; ms: number }

/** Ejecuta en un Worker con tiempo límite. Solo funciona en el navegador. */
export function ejecutarEnNavegador(codigo: string, entrada: string, limiteMs = 3000): Promise<ResultadoEjecucion> {
  return new Promise((resolver) => {
    const url = URL.createObjectURL(new Blob([fuenteDelWorker(codigo, entrada)], { type: 'text/javascript' }))
    const worker = new Worker(url)
    const lineas: ResultadoEjecucion['lineas'] = []
    const t0 = performance.now()
    const terminar = (tiempoAgotado: boolean) => {
      clearTimeout(reloj)
      worker.terminate()
      URL.revokeObjectURL(url)
      resolver({ lineas, tiempoAgotado, ms: Math.round(performance.now() - t0) })
    }
    const reloj = setTimeout(() => terminar(true), limiteMs)
    worker.onmessage = (e: MessageEvent<{ tipo: string; texto?: string }>) => {
      if (e.data.tipo === 'fin') return terminar(false)
      if (lineas.length < 500) lineas.push({ tipo: e.data.tipo === 'error' ? 'error' : e.data.tipo === 'warn' ? 'warn' : 'log', texto: String(e.data.texto ?? '').slice(0, 2000) })
    }
    worker.onerror = (e) => {
      lineas.push({ tipo: 'error', texto: e.message || 'Error al ejecutar' })
      e.preventDefault()
      terminar(false)
    }
  })
}

/** Evita que un texto cierre la etiqueta en la que se inserta (`</style>`, `</script>`). */
const sinCierre = (texto: string, etiqueta: string) => texto.replace(new RegExp(`</(${etiqueta})`, 'gi'), '<\\/$1')

/** Páginas HTML del proyecto, con index.html primero. */
export function paginasHtml(archivos: ArchivoProyecto[]): string[] {
  const html = archivos.filter((a) => a.nombre.toLowerCase().endsWith('.html')).map((a) => a.nombre)
  return html.sort((a, b) => (a.toLowerCase() === 'index.html' ? -1 : b.toLowerCase() === 'index.html' ? 1 : 0))
}

/** «./tema1.html?x#y» → «tema1.html», para buscar el archivo del proyecto que nombra un enlace o una etiqueta. */
export function archivoReferido(ruta: string): string {
  return ruta.trim().split('#')[0].split('?')[0].replace(/^\.\//, '').toLowerCase()
}

/**
 * Lo que la vista previa le agrega a la página (solo en la vista previa, no en la descarga). La página corre aislada
 * (sandbox sin allow-same-origin: no puede tocar STIRE), y eso rompe tres cosas que todo estudiante usa; aquí se reponen
 * SIN abrir el aislamiento:
 * - console.log llega a la consola de la vista previa;
 * - localStorage y sessionStorage existen (en memoria; localStorage se conserva al cambiar de página);
 * - un enlace a otra página del proyecto (tema1.html) la abre en la vista previa, en vez de cargar otra dirección;
 *   uno externo se abre en otra pestaña;
 * - un formulario se puede enviar sin que la vista previa se recargue y borre lo que pasó.
 */
function arranqueDeVistaPrevia(almacen: Record<string, string>, ancla: string): string {
  const datos = JSON.stringify(almacen).replace(/</g, '\\u003c')
  return `<script>(function(){
var envia=function(m){try{parent.postMessage(Object.assign({stireProyecto:true},m),'*')}catch(_){}};
var txt=function(x){if(typeof x==='string')return x;try{return JSON.stringify(x)}catch(_){return String(x)}};
var e=function(t,a){envia({tipo:t,texto:Array.prototype.map.call(a,txt).join(' ')})};
console.log=function(){e('log',arguments)};console.info=console.log;console.warn=function(){e('warn',arguments)};console.error=function(){e('error',arguments)};
window.addEventListener('error',function(ev){e('error',[ev.message])});
var datos=${datos};
function almacen(guardar){var d=guardar?datos:{};var g=function(){if(guardar)envia({tipo:'almacen',datos:d})};
var a={getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null},setItem:function(k,v){d[String(k)]=String(v);g()},removeItem:function(k){delete d[String(k)];g()},clear:function(){Object.keys(d).forEach(function(k){delete d[k]});g()},key:function(i){var k=Object.keys(d)[i];return k===undefined?null:k}};
Object.defineProperty(a,'length',{get:function(){return Object.keys(d).length}});return a}
try{Object.defineProperty(window,'localStorage',{value:almacen(true),configurable:true})}catch(_){}
try{Object.defineProperty(window,'sessionStorage',{value:almacen(false),configurable:true})}catch(_){}
document.addEventListener('click',function(ev){var t=ev.target;var a=t&&t.closest?t.closest('a[href]'):null;if(!a||ev.defaultPrevented)return;var h=(a.getAttribute('href')||'').trim();
if(!h||h.charAt(0)==='#'||/^(mailto|tel|javascript):/i.test(h))return;
if(/^(https?:)?\\/\\//i.test(h)){a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer');return}
ev.preventDefault();var p=h.split('#');envia({tipo:'navegar',pagina:p[0].split('?')[0].replace(/^\\.\\//,''),ancla:p[1]||''})});
window.addEventListener('submit',function(ev){if(!ev.defaultPrevented){ev.preventDefault();e('log',['(Vista previa) Se envió el formulario. Aquí la página no se recarga: usa preventDefault() y muestra el resultado con JavaScript.'])}});
var ancla=${JSON.stringify(ancla)};if(ancla)document.addEventListener('DOMContentLoaded',function(){var el=document.getElementById(ancla);if(el)el.scrollIntoView()});
})();</script>`
}

/**
 * Arma una página del proyecto como un solo documento. Cada `<link href="x.css">` y `<script src="x.js">` que nombra un
 * archivo del proyecto se reemplaza por su contenido, en su lugar (un `defer` o `type="module"` va al final del body).
 * Si la página no nombra ningún CSS (o ningún JS), se agregan todos los del proyecto, como antes: así funcionan también
 * los proyectos que nunca los enlazaron.
 * `conConsola` es la vista previa: agrega el arranque de arriba. `pagina` elige qué HTML (por defecto index.html).
 */
export function documentoWeb(
  archivos: ArchivoProyecto[],
  conConsola = false,
  opciones: { pagina?: string; almacen?: Record<string, string>; ancla?: string } = {},
): string {
  const porNombre = new Map(archivos.map((a) => [a.nombre.toLowerCase(), a]))
  const paginas = paginasHtml(archivos)
  const elegida = (opciones.pagina && porNombre.get(archivoReferido(opciones.pagina))) || porNombre.get((paginas[0] ?? '').toLowerCase())
  let doc = elegida?.contenido ?? '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head><body></body></html>'
  let usoCss = false
  let usoJs = false
  const alFinal: string[] = []

  doc = doc.replace(/<link\b[^>]*>/gi, (etiqueta) => {
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(etiqueta)?.[1]
    const f = href ? porNombre.get(archivoReferido(href)) : undefined
    if (!f || !f.nombre.toLowerCase().endsWith('.css')) return etiqueta
    usoCss = true
    return `<style>/* ${f.nombre} */\n${sinCierre(f.contenido, 'style')}\n</style>`
  })
  doc = doc.replace(/<script\b([^>]*)>\s*<\/script>/gi, (etiqueta, atributos: string) => {
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(atributos)?.[1]
    const f = src ? porNombre.get(archivoReferido(src)) : undefined
    if (!f || !f.nombre.toLowerCase().endsWith('.js')) return etiqueta
    usoJs = true
    const modulo = /\btype\s*=\s*["']module["']/i.test(atributos)
    const enLinea = `<script${modulo ? ' type="module"' : ''}>/* ${f.nombre} */\n${sinCierre(f.contenido, 'script')}\n</script>`
    if (modulo || /\bdefer\b/i.test(atributos)) { alFinal.push(enLinea); return '' }
    return enLinea
  })

  const estilos = usoCss ? '' : archivos.filter((a) => a.nombre.toLowerCase().endsWith('.css')).map((a) => `<style>/* ${a.nombre} */\n${sinCierre(a.contenido, 'style')}\n</style>`).join('\n')
  const scripts = [
    ...alFinal,
    ...(usoJs ? [] : archivos.filter((a) => a.nombre.toLowerCase().endsWith('.js')).map((a) => `<script>/* ${a.nombre} */\n${sinCierre(a.contenido, 'script')}\n</script>`)),
  ].join('\n')
  const arranque = conConsola ? arranqueDeVistaPrevia(opciones.almacen ?? {}, opciones.ancla ?? '') : ''

  // El arranque va lo primero del <head>, antes de cualquier script del estudiante.
  if (/<head[^>]*>/i.test(doc)) doc = doc.replace(/<head[^>]*>/i, (h) => `${h}${arranque}`)
  else doc = arranque + doc
  if (estilos) doc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, `${estilos}\n</head>`) : `${estilos}\n${doc}`
  if (scripts) doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${scripts}\n</body>`) : `${doc}\n${scripts}`
  return doc
}
