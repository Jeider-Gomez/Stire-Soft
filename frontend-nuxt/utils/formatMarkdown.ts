function escapeHtml(t: string) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Formateador ligero de lecciones Markdown en STIRE
 * Compatible con pages/estudiante/unidad/[id].vue
 *
 * `escapeHtml: true` escapa también el texto fuera de los bloques de código. Se usa con texto que TODAVÍA no pasó
 * por el saneado del servidor (la vista previa del docente, que se pinta con v-html sobre el borrador); el texto ya
 * guardado se sigue mostrando como antes.
 */
export function formatMarkdown(raw: string, options: { escapeHtml?: boolean } = {}): string {
  if (!raw) return ''
  const codeBlocks: string[] = []
  const withoutCode = raw.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_m, code: string) => {
    codeBlocks.push(
      `<pre class="bg-base-bg-secundario border border-base-borde-sutil rounded-md p-3 overflow-x-auto"><code class="font-codigo text-[11px] text-base-texto-primario">${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`
    )
    return `\u0000${codeBlocks.length - 1}\u0000`
  })
  const text = (options.escapeHtml ? escapeHtml(withoutCode) : withoutCode)
    .replace(/^## (.*?)$/gm, '<h4 class="font-bold text-sm text-base-texto-primario mt-3 mb-1">$1</h4>')
    .replace(/^# (.*?)$/gm, '<h3 class="font-bold text-base text-base-texto-primario mt-1 mb-2">$1</h3>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-base-bg-secundario px-1.5 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px] border border-base-borde-sutil">$1</code>')
    .replace(/^[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/(?:<li>.*<\/li>\n?)+/g, (list) => `<ul class="list-disc pl-5 space-y-1">${list.replace(/\n/g, '')}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
  return text.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => codeBlocks[Number(i)])
}
