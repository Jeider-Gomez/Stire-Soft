// Fase 26 — lenguajes de código soportados para resaltado en el frontend (CodeMirror 6).
// Debe coincidir exactamente con HIGHLIGHT_LANGUAGES de src/common/code-languages.ts (backend).

export const HIGHLIGHT_LANGUAGES = [
  'javascript',
  'python',
  'html',
  'css',
  'sql',
  'text'
] as const

export type HighlightLanguage = (typeof HIGHLIGHT_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<HighlightLanguage, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
  text: 'Texto sin colores'
}

export function getLanguageLabel(lang: string | null | undefined): string {
  if (!lang) return 'Texto sin colores'
  return LANGUAGE_LABELS[lang as HighlightLanguage] || lang
}

