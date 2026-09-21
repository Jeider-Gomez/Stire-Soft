/**
 * formatTutorMessage — convierte markdown sencillo a HTML seguro para el chat del Tutor.
 *
 * ORDEN CRÍTICO (no cambiar): escapar HTML primero, formatear después.
 * Esto previene XSS incluso si el backend enviara contenido malicioso.
 * Ver TutorChatDrawer.vue — función original `formatMessage` / `escapeHtml`.
 *
 * Soporta:
 *  - Bloques de código multilinea:  ```\n...\n```  → <pre><code>…</code></pre>
 *  - Código en línea: `código`  → <code>…</code>
 *  - Negrita: **texto**  → <strong>…</strong>
 *  - Listas simples: líneas que empiezan con "- " o "N. "
 *  - Saltos de línea → <br/>
 *
 * Verificación manual recomendada (pegar en consola del navegador):
 *   formatTutorMessage('**hola**\n```\nconsole.log("hi")\n```\n- item 1\n- item 2')
 *   formatTutorMessage('<script>alert(1)</script>')   // debe salir como texto inerte
 *   formatTutorMessage('<img onerror="alert(1)">')    // ídem
 */
export function formatTutorMessage(rawText: string): string {
  if (!rawText) return ''

  // 1. Escapar HTML (protección XSS)
  const escaped = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // 2. Bloques de código multilinea: ```...``` (después del escape, los backticks son seguros)
  const withCodeBlocks = escaped.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_match, code) =>
      `<pre class="bg-base-bg-secundario border border-base-borde-sutil rounded p-2 my-1 overflow-x-auto font-codigo text-[11px] leading-relaxed"><code>${code.trimEnd()}</code></pre>`
  )

  // 3. Código en línea: `código` (solo si no estamos ya dentro de un bloque <pre>)
  const withInlineCode = withCodeBlocks.replace(
    /`([^`\n]+)`/g,
    '<code class="bg-base-blanco px-1 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px]">$1</code>'
  )

  // 4. Negrita **texto**
  const withBold = withInlineCode.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 5. Listas: líneas que comienzan con "- " o "N. " (captura en bloque)
  const withLists = withBold.replace(
    /((?:^|\n)(?:- |\d+\. ).+)+/g,
    (block) => {
      const isOrdered = /^\d+\. /.test(block.trimStart())
      const items = block
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `<li class="ml-4 list-disc">${l.replace(/^(\d+\. |- )/, '')}</li>`)
        .join('')
      return isOrdered
        ? `<ol class="list-decimal pl-4 my-1 space-y-0.5">${items}</ol>`
        : `<ul class="list-disc pl-4 my-1 space-y-0.5">${items}</ul>`
    }
  )

  // 6. Saltos de línea restantes → <br/> (los bloques <pre> ya preservan sus saltos internos)
  const withBreaks = withLists.replace(/\n/g, '<br/>')

  return withBreaks
}
