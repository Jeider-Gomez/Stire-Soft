export const JUDGE_QUEUE = 'JUDGE_QUEUE';

export interface JudgeJobData {
  submissionAnswerId: number;
  code: string;
  language: string;
  testCases: any[];
  // Puntos de la pregunta: la nota se escala a este máximo (ver gradeAnswer).
  maxPoints?: number;
}

// Puerto del pipeline de calificacion asincrona. SubmissionsService depende
// SOLO de esta interfaz, nunca de BullMQ directamente (ADR 08) — antes
// @InjectQueue('judge') acoplaba el servicio a Redis incluso para arrancar.
export interface JudgeQueue {
  enqueue(data: JudgeJobData): Promise<void>;
}
