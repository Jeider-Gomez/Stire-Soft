// Fase 26 — lenguajes de código de los ejercicios.
//
// Hay DOS listas distintas y no deben confundirse:
//   · EXECUTABLE_LANGUAGES: los que el juez (sandbox endurecido) sabe EJECUTAR. Solo JavaScript: `hardened-process-sandbox.adapter.ts`
//     responde «solo JavaScript» a cualquier otro. Una pregunta `coding` en otro lenguaje fallaría en CADA intento de CADA estudiante,
//     así que se rechaza al crearla.
//   · HIGHLIGHT_LANGUAGES: los que el editor del frontend sabe RESALTAR (CodeMirror 6; C, C++ y Java quedan fuera del alcance gratuito, PLAN_MAESTRO §6.4). Sirve para mostrar código (p. ej. la plantilla
//     de `fill_code`), no implica que se pueda ejecutar.
// Si añades un lenguaje al juez, añádelo a EXECUTABLE_LANGUAGES y al adaptador; si añades uno al editor, a HIGHLIGHT_LANGUAGES y al frontend.

export const EXECUTABLE_LANGUAGES = ['javascript', 'js'] as const;

export const HIGHLIGHT_LANGUAGES = ['javascript', 'python', 'html', 'css', 'sql', 'text'] as const;

export function isExecutableLanguage(language: unknown): boolean {
  return typeof language === 'string' && (EXECUTABLE_LANGUAGES as readonly string[]).includes(language);
}

export function isHighlightLanguage(language: unknown): boolean {
  return typeof language === 'string' && (HIGHLIGHT_LANGUAGES as readonly string[]).includes(language);
}
