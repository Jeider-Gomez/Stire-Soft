import { Difficulty } from '../enums/difficulty.enum';
import { QuestionType } from '../enums/question-type.enum';

// Práctica adaptativa (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.2-§3.3). Dos actividades son «hermanas» si son de la
// misma unidad, el mismo tipo de pregunta y la misma dificultad: ocupan la misma «casilla». Las casillas se recorren
// de reconocer a crear (predecir → ordenar/emparejar/clasificar → completar código → programar), nivel por nivel.

export const NIVELES: Difficulty[] = [Difficulty.BASICO, Difficulty.INTERMEDIO, Difficulty.AVANZADO];

const RANGO_TIPO: Record<QuestionType, number> = {
  [QuestionType.MCQ]: 0,
  [QuestionType.ORDERING]: 1,
  [QuestionType.MATCHING]: 1,
  [QuestionType.DRAG_DROP]: 1,
  [QuestionType.FILL_CODE]: 2,
  [QuestionType.CODING]: 3,
  [QuestionType.HTML_CSS]: 3,
  [QuestionType.AI_EVALUATED]: 4,
};

export function rangoTipo(tipo: QuestionType | null | undefined): number {
  return tipo ? RANGO_TIPO[tipo] ?? 4 : 4;
}

export function rangoNivel(nivel: Difficulty | null | undefined): number {
  const i = NIVELES.indexOf(nivel ?? Difficulty.BASICO);
  return i === -1 ? 0 : i;
}

/**
 * Clave de la casilla de una actividad. Sin tipo de pregunta conocido, cada actividad es su propia casilla: así se
 * comportan igual que antes las actividades sin preguntas (y los datos de prueba que no traen tipo).
 */
export function claveCasilla(actividad: { id: number; difficulty?: Difficulty | null; questionType?: QuestionType | null }): string {
  if (!actividad.questionType) return `actividad-${actividad.id}`;
  return `${actividad.difficulty ?? Difficulty.BASICO}|${actividad.questionType}`;
}
