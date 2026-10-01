// Proyectos se ejecutan en el navegador del estudiante (docs/DISENO_PROYECTOS.md §9): no ocupan el servidor.

export interface ArchivoProyecto { nombre: string; contenido: string }

/** Tipos de proyecto (src/proyectos/proyecto-reglas.ts). «pseudocodigo» es para el curso sin tanto código (fase 4). */
export type TipoProyecto = 'web' | 'javascript' | 'pseudocodigo'
export const TIPO_PROYECTO: Record<TipoProyecto, string> = { web: 'Página web', javascript: 'JavaScript', pseudocodigo: 'Pseudocódigo' }
/** Extensiones que admite cada tipo, en el orden en que se sugieren. */
export const EXTENSIONES_PROYECTO: Record<TipoProyecto, string[]> = { web: ['html', 'css', 'js', 'txt'], javascript: ['js', 'txt'], pseudocodigo: ['psc', 'txt'] }

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

/**
 * Une los archivos de un proyecto web en un solo documento: el CSS en <style> y el JS en <script>, en el orden de los
 * archivos. `conConsola` agrega un aviso a la página padre de lo que el código escribe con console.log (vista previa).
 */
export function documentoWeb(archivos: ArchivoProyecto[], conConsola = false): string {
  const html = archivos.find((a) => a.nombre.toLowerCase() === 'index.html') ?? archivos.find((a) => a.nombre.toLowerCase().endsWith('.html'))
  const estilos = archivos.filter((a) => a.nombre.toLowerCase().endsWith('.css')).map((a) => `<style>/* ${a.nombre} */\n${sinCierre(a.contenido, 'style')}\n</style>`).join('\n')
  const consola = conConsola
    ? `<script>(function(){var e=function(t,a){try{parent.postMessage({stireProyecto:true,tipo:t,texto:Array.prototype.map.call(a,function(x){return typeof x==='string'?x:JSON.stringify(x)}).join(' ')},'*')}catch(_){}};console.log=function(){e('log',arguments)};console.warn=function(){e('warn',arguments)};console.error=function(){e('error',arguments)};window.addEventListener('error',function(ev){e('error',[ev.message])});})();</script>`
    : ''
  const scripts = archivos.filter((a) => a.nombre.toLowerCase().endsWith('.js')).map((a) => `<script>/* ${a.nombre} */\n${sinCierre(a.contenido, 'script')}\n</script>`).join('\n')
  let doc = html?.contenido ?? '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head><body></body></html>'
  doc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, `${consola}${estilos}\n</head>`) : `${consola}${estilos}\n${doc}`
  doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${scripts}\n</body>`) : `${doc}\n${scripts}`
  return doc
}
