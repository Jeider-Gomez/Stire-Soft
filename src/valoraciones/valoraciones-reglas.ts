/** Resumen por lección para el docente (función pura; el servicio le pasa los datos ya leídos). */
export interface VotoLeccion {
  learningUnitId: number;
  util: boolean;
  comentario: string | null;
  updatedAt: Date;
}

export interface ResumenLeccion {
  learningUnitId: number;
  titulo: string;
  si: number;
  no: number;
  /** Porcentaje de «Sí» (null sin votos). */
  porcentajeUtil: number | null;
  /** Hasta 5 comentarios de quienes dijeron «No», los más recientes primero, sin nombre. */
  comentarios: string[];
  /** Con suficientes votos y más «No» que «Sí»: vale la pena revisar la explicación. */
  revisar: boolean;
}

/** Mínimo de votos para marcar una lección como «revisar»: con 1 o 2 votos un «No» no dice mucho. */
export const MINIMO_VOTOS_REVISAR = 3;

export function resumenPorLeccion(lecciones: Array<{ id: number; title: string }>, votos: VotoLeccion[]): ResumenLeccion[] {
  return lecciones
    .map((l) => {
      const v = votos.filter((x) => x.learningUnitId === l.id);
      const si = v.filter((x) => x.util).length;
      const no = v.length - si;
      const comentarios = v
        .filter((x) => !x.util && x.comentario && x.comentario.trim())
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
        .map((x) => (x.comentario as string).trim());
      const porcentajeUtil = v.length ? Math.round((si / v.length) * 100) : null;
      return { learningUnitId: l.id, titulo: l.title, si, no, porcentajeUtil, comentarios, revisar: v.length >= MINIMO_VOTOS_REVISAR && no > si };
    })
    .filter((r) => r.si + r.no > 0)
    .sort((a, b) => Number(b.revisar) - Number(a.revisar) || (a.porcentajeUtil ?? 100) - (b.porcentajeUtil ?? 100));
}
