/**
 * Cómo se reconoce que dos asignaturas son la misma aunque se escriban distinto (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md
 * §2.2.1): «Fundamentos de Algoritmia», «fundamentos  algoritmia» y «Fund. de Algoritmia» se guardan igual.
 */

// Palabras que no distinguen una asignatura de otra.
const VACIAS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'a', 'al', 'para', 'con', 'por', 'un', 'una']);

// Abreviaturas frecuentes en planes de estudio, escritas sin punto (el punto ya se quitó).
const ABREVIATURAS: Record<string, string> = {
  fund: 'fundamentos',
  fundam: 'fundamentos',
  intro: 'introduccion',
  introd: 'introduccion',
  prog: 'programacion',
  progr: 'programacion',
  algo: 'algoritmia',
  matem: 'matematicas',
  mat: 'matematicas',
  ia: 'inteligencia artificial',
  tic: 'tecnologias informacion comunicacion',
  tics: 'tecnologias informacion comunicacion',
  educ: 'educacion',
  ed: 'educacion',
};

/** Nombre canónico para comparar y para el índice único: sin tildes, mayúsculas, signos ni palabras vacías. */
export function normalizarNombre(nombre: string): string {
  const palabras = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((p) => (ABREVIATURAS[p] ?? p).split(' '))
    .filter((p) => !VACIAS.has(p));
  return palabras.join(' ').slice(0, 150);
}

/** Dónde vive una asignatura, como una sola clave para el índice único: «p:7» (programa), «i:1» (institución) o «libre». */
export function ambitoDe(programId: number | null | undefined, institutionId: number | null | undefined): string {
  if (programId) return `p:${programId}`;
  if (institutionId) return `i:${institutionId}`;
  return 'libre';
}

/** Distancia de edición (Levenshtein): cuántas letras hay que cambiar para pasar de una a otra. */
export function distancia(a: string, b: string): number {
  if (a === b) return 0;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const fila = [i];
    for (let j = 1; j <= b.length; j++) {
      fila[j] = Math.min(previa[j] + 1, fila[j - 1] + 1, previa[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previa = fila;
  }
  return previa[b.length];
}

/**
 * ¿Son probablemente la misma asignatura? Recibe nombres ya normalizados. Sí cuando:
 * - difieren en 1 o 2 letras (erratas: «algoritimia»), o en hasta el 15 % de las letras si son largos; o
 * - comparten casi todas sus palabras (una contiene a la otra, como «fundamentos algoritmia» y
 *   «fundamentos algoritmia i»), con al menos dos palabras en común.
 */
export function sonParecidas(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const d = distancia(a, b);
  if (d <= 2 || d / Math.max(a.length, b.length) <= 0.15) return true;
  const pa = new Set(a.split(' '));
  const pb = new Set(b.split(' '));
  const comunes = [...pa].filter((p) => pb.has(p)).length;
  return comunes >= 2 && comunes / Math.min(pa.size, pb.size) >= 1 && Math.abs(pa.size - pb.size) <= 1;
}
