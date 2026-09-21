/**
 * Barrera en código contra respuestas que entregan la solución del ejercicio. La regla 1 del prompt
 * ("nunca des el código completo") es solo una instrucción; esto la verifica sin gastar una llamada
 * extra al LLM y sin estorbar a quien de verdad quiere aprender.
 *
 * Solo actúa dentro de una actividad (fuera de ella el estudiante estudia teoría y puede recibir
 * cualquier ejemplo). Un bloque de código se omite únicamente si:
 *   a) es larguísimo (más de MAX_CODE_BLOCK_LINES líneas útiles: es un volcado, no una explicación), o
 *   b) tiene forma de programa completo de un ejercicio de STIRE (lee la entrada estándar Y la imprime,
 *      ver `seed-runner.ts`: todas las actividades de código son programas stdin → stdout), y NO es el
 *      propio código del estudiante citado ni el estudiante pegó código en su mensaje pidiendo que se lo
 *      expliquen.
 * Ejemplos cortos, fragmentos y explicaciones del código del propio estudiante pasan sin problema.
 */
export const MAX_CODE_BLOCK_LINES = 20;
export const MIN_SOLUTION_LIKE_LINES = 5;
const QUOTED_SHARE_THRESHOLD = 0.7;

export const REDACTED_CODE_NOTICE =
  '[Bloque de código omitido: se parece a la solución completa del ejercicio, y esa la escribes tú. Puedo explicarte el concepto con un ejemplo corto o explicarte tu propio código.]';

export interface GuardOptions {
  /** Código que el estudiante tiene en el editor. */
  studentCode?: string;
  /** Mensaje del estudiante que originó la respuesta. */
  studentMessage?: string;
}

export interface GuardResult {
  text: string;
  redactedBlocks: number;
}

const FENCE = /```[^\n]*\n([\s\S]*?)(?:```|$)/g;
const READS_STDIN = /readFileSync\(\s*(?:0|['"]\/dev\/stdin['"])|process\.stdin/;
const PRINTS_OUTPUT = /console\.log\(|process\.stdout\.write\(/;
const LOOKS_LIKE_CODE = /[;{}]\s*$|=>|\b(?:const|let|var|function|return|if|for|while)\b|console\./;

const meaningfulLines = (code: string): string[] =>
  code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

function studentPastedCode(message: string | undefined): boolean {
  if (!message) return false;
  if (message.includes('```')) return true;
  return message.split('\n').filter(line => LOOKS_LIKE_CODE.test(line)).length >= 3;
}

function isMostlyStudentsOwnCode(blockLines: string[], studentCode: string | undefined): boolean {
  if (!studentCode || blockLines.length === 0) return false;
  const own = new Set(meaningfulLines(studentCode));
  const shared = blockLines.filter(line => own.has(line)).length;
  return shared / blockLines.length >= QUOTED_SHARE_THRESHOLD;
}

function isCompleteExerciseProgram(body: string, lineCount: number): boolean {
  return lineCount >= MIN_SOLUTION_LIKE_LINES && READS_STDIN.test(body) && PRINTS_OUTPUT.test(body);
}

export function limitCodeBlocks(text: string, options: GuardOptions = {}): GuardResult {
  const explainingOwnCode = studentPastedCode(options.studentMessage);
  let redactedBlocks = 0;

  const guarded = text.replace(FENCE, (block: string, body: string) => {
    const lines = meaningfulLines(body);
    const tooLong = lines.length > MAX_CODE_BLOCK_LINES;
    const looksLikeSolution =
      isCompleteExerciseProgram(body, lines.length) &&
      !explainingOwnCode &&
      !isMostlyStudentsOwnCode(lines, options.studentCode);

    if (!tooLong && !looksLikeSolution) return block;
    redactedBlocks++;
    return REDACTED_CODE_NOTICE;
  });

  return { text: guarded, redactedBlocks };
}
