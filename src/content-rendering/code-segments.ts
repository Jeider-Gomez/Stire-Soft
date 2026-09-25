// Fase 25, A7 — no sanear el código de las lecciones como si fuera HTML.
//
// PROBLEMA (F24-07): `sanitizeRichText` pasaba TODO el Markdown por DOMPurify. Un ejemplo de código como
//   ```html
//   <script>console.log(1)</script><button onclick="x()">Clic</button>
//   ```
// perdía el <script>, dejaba el <button> como texto suelto, codificaba `<`, `>` y `&`, y añadía cierres de etiqueta. Un curso de
// HTML no puede mostrar sus propios ejemplos.
//
// SOLUCIÓN: el código (bloques ``` y código en línea) se guarda TAL CUAL y solo se sanea el resto. Es seguro porque el frontend
// (frontend-nuxt/utils/formatMarkdown.ts, única copia desde la Fase 25 B0) escapa el contenido de esos segmentos antes de pintarlo
// con v-html; el texto que NO es código llega como HTML ya saneado.
//
// LA REGLA QUE HAY QUE CUIDAR: los segmentos que el servidor deja sin sanear deben ser EXACTAMENTE los que el frontend trata como
// código. Si el servidor protegiera algo que el frontend considera texto, ese HTML llegaría sin sanear al navegador (XSS). Por eso:
//   1. las expresiones regulares y el ORDEN de las dos pasadas son idénticos a los de formatMarkdown (primero los bloques ```,
//      después el código en línea sobre el texto ya enmascarado);
//   2. después de componer el resultado se vuelve a segmentar (como lo haría el frontend) y se COMPRUEBA que los segmentos de
//      código sean los mismos; si no coinciden, el llamador cae al saneado completo de siempre;
//   3. code-segments.consistency.spec.ts ejecuta la función REAL del frontend sobre miles de entradas adversariales.
// Si cambias cualquiera de las dos expresiones regulares, cámbialas también en formatMarkdown.ts (y viceversa).

const FENCE = /```[\w-]*\n?([\s\S]*?)```/g;
const INLINE = /`([^`\n]+)`/g;
const PLACEHOLDER = /\u0000(\d+)\u0000/g;

interface Piece {
  code: boolean;
  text: string;
}

/** Parte `input` en trozos de texto y de código con la misma lógica de dos pasadas que formatMarkdown. */
function splitPieces(input: string): Piece[] {
  const fences: string[] = [];
  const masked = input.replace(FENCE, (match) => {
    fences.push(match);
    return `\u0000${fences.length - 1}\u0000`;
  });
  const restoreFences = (text: string) => text.replace(PLACEHOLDER, (_m, index: string) => fences[Number(index)] ?? '');

  const pieces: Piece[] = [];
  const pushText = (text: string) => {
    let last = 0;
    for (const placeholder of text.matchAll(PLACEHOLDER)) {
      const start = placeholder.index ?? 0;
      if (start > last) pieces.push({ code: false, text: text.slice(last, start) });
      pieces.push({ code: true, text: fences[Number(placeholder[1])] ?? '' });
      last = start + placeholder[0].length;
    }
    if (last < text.length) pieces.push({ code: false, text: text.slice(last) });
  };

  let last = 0;
  for (const inline of masked.matchAll(INLINE)) {
    const start = inline.index ?? 0;
    pushText(masked.slice(last, start));
    // Un código en línea puede contener bloques ``` ya enmascarados: se restauran dentro del mismo segmento.
    pieces.push({ code: true, text: restoreFences(inline[0]) });
    last = start + inline[0].length;
  }
  pushText(masked.slice(last));
  return pieces;
}

function codeSegments(pieces: Piece[]): string[] {
  return pieces.filter((piece) => piece.code).map((piece) => piece.text);
}

/**
 * Sanea con `sanitizeProse` todo lo que NO es código y deja el código intacto. Devuelve `null` si no puede garantizar que el
 * frontend segmentará el resultado igual que el servidor (el llamador debe entonces sanear el texto completo).
 */
export function sanitizeAroundCode(text: string, sanitizeProse: (prose: string) => string): string | null {
  // Los NUL se descartan: el frontend usa \u0000 como marcador interno y no deben existir en el texto.
  const input = text.replace(/\u0000/g, '');
  const pieces = splitPieces(input);
  const composed = pieces.map((piece) => (piece.code || piece.text === '' ? piece.text : sanitizeProse(piece.text))).join('');

  const before = codeSegments(pieces);
  const after = codeSegments(splitPieces(composed));
  if (before.length !== after.length || before.some((segment, i) => segment !== after[i])) return null;
  return composed;
}
