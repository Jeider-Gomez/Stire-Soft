export class SubmissionGradedEvent {
  constructor(
    public readonly submissionId: string,
    public readonly studentId: number,
    public readonly activityId: number,
    public readonly learningUnitId: number,
    public readonly score: number,
    // passingScore es un PORCENTAJE (0-100) del puntaje máximo de la actividad,
    // no un puntaje crudo — la actividad puede valer 10, 15, 20... puntos según
    // su tipo/dificultad, y comparar score crudo contra un umbral fijo (p.ej.
    // 60) hacía que ninguna actividad de menos de 60 puntos totales pudiera
    // aprobarse nunca, sin importar qué tan bien la resolviera el estudiante.
    public readonly passingScore: number,
    public readonly totalPoints: number,
  ) {}
}
