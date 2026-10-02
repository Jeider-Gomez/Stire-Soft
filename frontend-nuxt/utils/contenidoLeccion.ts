// El texto de una lección con imágenes, recursos y ejemplos en vivo EN SU LUGAR (no como bloques aparte). Las mismas
// marcas que valida el servidor (src/content/recursos/insertados.ts), cada una sola en su línea:
//
//   ![Descripción](https://… o /media/<uuid> "Pie opcional")   imagen
//   @[Título](https://youtu.be/…)                              video, documento, presentación o actividad
//   ```vivo … ```                                              ejemplo de HTML, CSS y JavaScript que corre en la lección
//
// Lo que está dentro de otro bloque de código no se toca: es un ejemplo para leer.

export const IMAGEN_EN_LINEA = /^!\[([^\]\n]*)\]\(\s*(\S+?)(?:\s+"([^"\n]*)")?\s*\)$/
export const RECURSO_EN_LINEA = /^@\[([^\]\n]*)\]\(\s*(\S+?)\s*\)$/

export type Segmento =
  | { tipo: 'texto'; markdown: string }
  | { tipo: 'imagen'; alt: string; url: string; pie: string | null }
  | { tipo: 'recurso'; titulo: string; url: string }
  | { tipo: 'vivo'; codigo: string }

/** Cómo se inserta cada recurso, armado por el servidor al guardar (`metadata.insertados`). */
export type Insertados = Record<string, { url: string; provider: string; embedUrl: string | null }>

export function partirContenido(texto: string): Segmento[] {
  const segmentos: Segmento[] = []
  let parrafo: string[] = []
  const cerrarTexto = () => {
    if (parrafo.join('\n').trim()) segmentos.push({ tipo: 'texto', markdown: parrafo.join('\n') })
    parrafo = []
  }
  const lineas = (texto ?? '').split(/\r?\n/)
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i]
    const valla = /^\s*```\s*([\w-]*)/.exec(linea)
    if (valla) {
      // Un bloque de código entero, hasta su cierre: «vivo» se ejecuta; cualquier otro se muestra como texto.
      let fin = i + 1
      while (fin < lineas.length && !/^\s*```/.test(lineas[fin])) fin++
      if (valla[1].toLowerCase() === 'vivo') {
        cerrarTexto()
        segmentos.push({ tipo: 'vivo', codigo: lineas.slice(i + 1, fin).join('\n') })
      } else {
        parrafo.push(...lineas.slice(i, fin + 1))
      }
      i = fin
      continue
    }
    const limpia = linea.trim()
    const img = IMAGEN_EN_LINEA.exec(limpia)
    const rec = img ? null : RECURSO_EN_LINEA.exec(limpia)
    if (img) {
      cerrarTexto()
      // El servidor guarda «&» como «&amp;» al sanear el texto; la dirección de la imagen necesita el «&».
      segmentos.push({ tipo: 'imagen', alt: img[1].trim(), url: img[2].replace(/&amp;/g, '&'), pie: img[3]?.trim() || null })
    } else if (rec) {
      cerrarTexto()
      segmentos.push({ tipo: 'recurso', titulo: rec[1].trim(), url: rec[2] })
    } else parrafo.push(linea)
  }
  cerrarTexto()
  return segmentos
}

/** Lo que inserta cada botón del editor, en su propia línea. Quita lo que rompería la marca (corchetes, comillas). */
export function marcaDeImagen(alt: string, url: string, pie = ''): string {
  const limpio = (t: string) => t.replace(/[[\]\n]/g, ' ').trim()
  const p = pie.replace(/["\n]/g, ' ').trim()
  return `![${limpio(alt)}](${url.trim()}${p ? ` "${p}"` : ''})`
}
export function marcaDeRecurso(titulo: string, url: string): string {
  return `@[${titulo.replace(/[[\]\n]/g, ' ').trim()}](${url.trim()})`
}

/** Punto de partida de un ejemplo en vivo: HTML, CSS y JavaScript en un solo documento. */
export const EJEMPLO_EN_VIVO = `\`\`\`vivo
<button id="saludo">Pulsa aquí</button>
<p id="mensaje"></p>

<style>
  button { padding: 0.5rem 1rem; font-size: 1rem; }
</style>

<script>
  document.getElementById('saludo').addEventListener('click', () => {
    document.getElementById('mensaje').textContent = '¡Hola! Esto lo hizo JavaScript.';
  });
</script>
\`\`\``

/** `metadata.insertados` de una lección, si tiene la forma esperada (llega del servidor como JSON sin tipo). */
export function insertadosDe(metadata: Record<string, unknown> | null | undefined): Insertados | null {
  const valor = metadata?.insertados
  return valor && typeof valor === 'object' && !Array.isArray(valor) ? (valor as Insertados) : null
}
