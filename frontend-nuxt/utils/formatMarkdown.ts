import { sanitizeRenderedHtml } from './sanitizeRenderedHtml'

function escapeHtml(t: string) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const TABLE_ROW = /^\s*\|.*\|\s*$/
const TABLE_SEPARATOR = /^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/

/** Celdas de una fila `| a | b |`; `\|` es una barra literal dentro de la celda. */
function tableCells(row: string): string[] {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim())
}

/**
 * Tablas al estilo de GitHub: fila de encabezado, fila separadora (`|---|---|`) y filas de datos. Cada tabla queda en una sola
 * línea para que los reemplazos posteriores (párrafos, listas) no la partan.
 */
function renderTables(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!TABLE_ROW.test(lines[i]) || !TABLE_SEPARATOR.test(lines[i + 1] ?? '')) {
      out.push(lines[i])
      continue
    }
    const head = tableCells(lines[i])
    const rows: string[][] = []
    i += 2
    while (i < lines.length && TABLE_ROW.test(lines[i])) rows.push(tableCells(lines[i++]))
    i--
    const th = head.map((c) => `<th class="text-left font-semibold px-2 py-1.5 border-b border-base-borde-fuerte">${c}</th>`).join('')
    const trs = rows
      .map((r) => `<tr>${head.map((_, j) => `<td class="px-2 py-1.5 border-b border-base-borde-sutil align-top">${r[j] ?? ''}</td>`).join('')}</tr>`)
      .join('')
    out.push(`<div class="overflow-x-auto my-2"><table class="w-full text-xs border-collapse"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`)
  }
  return out.join('\n')
}

/**
 * Formateador ligero de lecciones y enunciados Markdown en STIRE.
 * Única fuente de verdad compartida entre lecciones, ejercicios y previsualizaciones.
 *
 * `escapeHtml: true` escapa también el texto fuera de los bloques de código. Se usa con texto que TODAVÍA no pasó
 * por el saneado del servidor (la vista previa del docente); el texto ya guardado se muestra como HTML enriquecido.
 */
export function formatMarkdown(raw: string, options: { escapeHtml?: boolean } = {}): string {
  if (!raw) return ''
  const codeBlocks: string[] = []

  // 1. Bloques de código preformateado (```)
  let withoutCode = raw.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_m, code: string) => {
    codeBlocks.push(
      `<pre class="bg-base-bg-secundario border border-base-borde-sutil rounded-md p-3 my-2 overflow-x-auto"><code class="font-codigo text-[11px] text-base-texto-primario">${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`
    )
    return `\u0000${codeBlocks.length - 1}\u0000`
  })

  // 2. Código en línea (`x`): se extrae y escapa para que su contenido se muestre literal y seguro
  withoutCode = withoutCode.replace(/`([^`\n]+)`/g, (_m, inlineCode: string) => {
    codeBlocks.push(
      `<code class="bg-base-bg-secundario px-1.5 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px] border border-base-borde-sutil">${escapeHtml(inlineCode)}</code>`
    )
    return `\u0000${codeBlocks.length - 1}\u0000`
  })

  const text = renderTables(options.escapeHtml ? escapeHtml(withoutCode) : withoutCode)
    .replace(/^#### (.*?)$/gm, '<h5 class="font-bold text-xs text-base-texto-primario mt-2 mb-1">$1</h5>')
    .replace(/^### (.*?)$/gm, '<h4 class="font-bold text-xs text-base-texto-primario mt-2 mb-1">$1</h4>')
    .replace(/^## (.*?)$/gm, '<h4 class="font-bold text-sm text-base-texto-primario mt-3 mb-1">$1</h4>')
    .replace(/^# (.*?)$/gm, '<h3 class="font-bold text-base text-base-texto-primario mt-1 mb-2">$1</h3>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, '$1<em>$2</em>')
    .replace(/^[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/(?:<li>.*<\/li>\n?)+/g, (list) => `<ul class="list-disc pl-5 space-y-1">${list.replace(/\n/g, '')}</ul>`)
    // Listas numeradas (1. 2. 3.): se marcan aparte para que el paso anterior no las agrupe como viñetas.
    .replace(/^\d+\. (.*)$/gm, '\u0001$1\u0002')
    .replace(/(?:\u0001.*\u0002\n?)+/g, (list) => `<ol class="list-decimal pl-5 space-y-1">${list.replace(/\n/g, '').replace(/\u0001/g, '<li>').replace(/\u0002/g, '</li>')}</ol>`)
    .replace(/\n\n/g, '<br/><br/>')
    // Títulos, listas y tablas ya tienen su propio margen: sin saltos vacíos pegados a ellos.
    .replace(/(<\/h[3-5]>|<\/ul>|<\/ol>|<\/table><\/div>)\n*(?:<br\/>\n*)+/g, '$1')
    .replace(/(?:<br\/>\n*)+(?=<h[3-5] |<ul |<ol |<div class="overflow-x-auto)/g, '')

  const html = text
    .replace(/\u0000(\d+)\u0000/g, (_m, i: string) => codeBlocks[Number(i)])
    // Igual con los bloques de código: el <pre> lleva su propio margen.
    .replace(/(?:<br\/>\s*)+(?=<pre )/g, '')
    .replace(/(<\/pre>)(?:\s*<br\/>)+/g, '$1')

  // El HTML final pasa siempre por DOMPurify: los reemplazos de arriba trabajan sobre texto y podían insertar comillas dentro de un
  // atributo del HTML ya saneado por el servidor (ver sanitizeRenderedHtml.ts).
  return sanitizeRenderedHtml(html)
}
