// Fase 26 (B5) — Resaltado de código bajo demanda para trozos de plantilla en fill_code.
// Utiliza el analizador de @codemirror/language + @lezer/highlight (highlightTree).
// Es asíncrono y seguro: mientras carga o si falla, devuelve el texto plano.

export interface HighlightedSpan {
  text: string
  cls: string
}

let highlightStyleInstance: any = null
let highlightTreeFn: any = null
const parserCache: Record<string, any> = {}

async function getParser(language: string) {
  if (parserCache[language]) return parserCache[language]

  switch (language) {
    case 'javascript':
    case 'js': {
      const { javascriptLanguage } = await import('@codemirror/lang-javascript')
      parserCache[language] = javascriptLanguage.parser
      break
    }
    case 'python':
    case 'py': {
      const { pythonLanguage } = await import('@codemirror/lang-python')
      parserCache[language] = pythonLanguage.parser
      break
    }
    case 'html': {
      const { htmlLanguage } = await import('@codemirror/lang-html')
      parserCache[language] = htmlLanguage.parser
      break
    }
    case 'css': {
      const { cssLanguage } = await import('@codemirror/lang-css')
      parserCache[language] = cssLanguage.parser
      break
    }
    case 'sql': {
      const { StandardSQL } = await import('@codemirror/lang-sql')
      parserCache[language] = StandardSQL.language.parser
      break
    }
    default:
      return null
  }
  return parserCache[language]
}

async function getHighlighter() {
  if (highlightStyleInstance && highlightTreeFn) {
    return { highlightStyle: highlightStyleInstance, highlightTree: highlightTreeFn }
  }

  const [{ HighlightStyle }, { tags: t, highlightTree }] = await Promise.all([
    import('@codemirror/language'),
    import('@lezer/highlight')
  ])

  // Colores idénticos a CodeEditor.vue (#1e1e1e oscuro)
  highlightStyleInstance = HighlightStyle.define([
    { tag: [t.keyword, t.operatorKeyword, t.modifier], class: 'text-[#569cd6]' },
    { tag: [t.string, t.special(t.string)], class: 'text-[#ce9178]' },
    { tag: [t.number, t.integer, t.float], class: 'text-[#b5cea8]' },
    { tag: [t.comment, t.lineComment, t.blockComment], class: 'text-[#6a9955] italic' },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], class: 'text-[#dcdcaa]' },
    { tag: [t.tagName], class: 'text-[#569cd6]' },
    { tag: [t.attributeName], class: 'text-[#9cdcfe]' },
    { tag: [t.variableName, t.propertyName], class: 'text-[#9cdcfe]' },
    { tag: [t.className, t.typeName], class: 'text-[#4ec9b0]' },
    { tag: [t.operator], class: 'text-[#d4d4d4]' },
    { tag: [t.punctuation, t.bracket], class: 'text-[#d4d4d4]' }
  ])
  highlightTreeFn = highlightTree

  return { highlightStyle: highlightStyleInstance, highlightTree: highlightTreeFn }
}

/**
 * Resalta un fragmento o línea de código devolviendo una lista de spans con su clase CSS.
 * Si el lenguaje es 'text' o no está soportado, o si la carga falla, devuelve el texto sin clase.
 */
export async function highlightCode(text: string, language?: string): Promise<HighlightedSpan[]> {
  if (!text) return []
  if (!language || language === 'text') {
    return [{ text, cls: '' }]
  }

  try {
    const [parser, highlighter] = await Promise.all([
      getParser(language),
      getHighlighter()
    ])

    if (!parser || !highlighter) {
      return [{ text, cls: '' }]
    }

    const { highlightStyle, highlightTree } = highlighter
    const tree = parser.parse(text)

    const charClasses = new Array<string>(text.length).fill('')

    highlightTree(tree, highlightStyle, (from: number, to: number, classes: string) => {
      const start = Math.max(0, from)
      const end = Math.min(text.length, to)
      for (let i = start; i < end; i++) {
        charClasses[i] = classes
      }
    })

    const spans: HighlightedSpan[] = []
    let currentSpan: HighlightedSpan | null = null

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const cls = charClasses[i]

      if (!currentSpan || currentSpan.cls !== cls) {
        if (currentSpan) spans.push(currentSpan)
        currentSpan = { text: char, cls }
      } else {
        currentSpan.text += char
      }
    }

    if (currentSpan) {
      spans.push(currentSpan)
    }

    return spans.length > 0 ? spans : [{ text, cls: '' }]
  } catch (err) {
    console.warn('[STIRE highlightCode] Error al resaltar código:', err)
    return [{ text, cls: '' }]
  }
}
