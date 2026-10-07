/** El docente revisó un envío de una entrega (nota, valoración o comentario): se le avisa al estudiante. */
export class EnvioRevisadoEvent {
  constructor(
    public readonly studentId: number,
    public readonly entregaId: number,
    public readonly titulo: string,
    public readonly nota: number | null,
    public readonly valoracion: string | null,
    public readonly comentario: string | null,
  ) {}
}

/** El docente puso o cambió una nota del libro de calificaciones, y la clase muestra las notas a los estudiantes. */
export class NotaRegistradaEvent {
  constructor(
    public readonly classId: number,
    public readonly studentId: number,
    public readonly nombre: string,
    public readonly nota: number,
  ) {}
}
