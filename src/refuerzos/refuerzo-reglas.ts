/**
 * Reglas de los refuerzos y retos (docs/DISENO_INTERVENCION_DOCENTE.md §4 y §10.4). Si un estudiante falla, la
 * actividad normal no le está funcionando: el refuerzo presenta el concepto de otra forma (Bloom y Guskey, 2007), con una
 * secuencia corta de pasos que arma el docente. Funciones puras: el servicio las aplica.
 */
import { normalizarRecurso, RecursoInvalidoError } from '../content/recursos/normalizar-recurso';

export class RefuerzoInvalidoError extends Error {}

export const TIPOS_REFUERZO = ['refuerzo', 'reto'] as const;
export type TipoRefuerzo = (typeof TIPOS_REFUERZO)[number];

export const LIMITES_REFUERZO = { pasos: 5, largoTitulo: 150, largoTexto: 10000, largoMensaje: 2000 } as const;

export type Paso =
  | { tipo: 'explicacion'; titulo: string; texto: string }
  | { tipo: 'recurso'; titulo: string; url: string; provider: string; embedUrl: string | null }
  | { tipo: 'ejercicio'; activityId: number }
  | { tipo: 'entrega'; entregaId: number };

const texto = (v: unknown, campo: string, max: number, obligatorio = true): string => {
  if (typeof v !== 'string' || (obligatorio && !v.trim())) throw new RefuerzoInvalidoError(`Falta ${campo}.`);
  if (v.length > max) throw new RefuerzoInvalidoError(`${campo[0].toUpperCase()}${campo.slice(1)} es demasiado largo.`);
  return v.trim();
};

const listaDeIds = (v: unknown, campo: string): number[] => {
  if (!Array.isArray(v) || v.length === 0 || !v.every((x) => Number.isInteger(x) && x > 0)) {
    throw new RefuerzoInvalidoError(`Elige al menos ${campo}.`);
  }
  return [...new Set(v as number[])];
};

/** Valida lo que manda el docente y normaliza los recursos (solo de la lista blanca, como en las lecciones). */
export function validarRefuerzo(d: Record<string, unknown>) {
  if (!(TIPOS_REFUERZO as readonly unknown[]).includes(d.tipo)) throw new RefuerzoInvalidoError('Elige si es un refuerzo o un reto.');
  const titulo = texto(d.titulo, 'el título', LIMITES_REFUERZO.largoTitulo);
  const mensaje = d.mensaje === undefined || d.mensaje === null ? null : texto(d.mensaje, 'el mensaje', LIMITES_REFUERZO.largoMensaje, false) || null;
  const learningUnitIds = listaDeIds(d.learningUnitIds, 'una lección');
  const estudiantes = listaDeIds(d.estudiantes, 'un estudiante');
  let fechaLimite: Date | null = null;
  if (d.fechaLimite) {
    fechaLimite = new Date(String(d.fechaLimite));
    if (Number.isNaN(fechaLimite.getTime())) throw new RefuerzoInvalidoError('La fecha límite no es válida.');
  }
  if (!Array.isArray(d.pasos) || d.pasos.length === 0) throw new RefuerzoInvalidoError('Agrega al menos un paso.');
  if (d.pasos.length > LIMITES_REFUERZO.pasos) throw new RefuerzoInvalidoError(`Un refuerzo tiene como máximo ${LIMITES_REFUERZO.pasos} pasos: corto se termina.`);
  const pasos: Paso[] = d.pasos.map((p: unknown, i: number) => {
    const x = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>;
    const n = `el paso ${i + 1}`;
    switch (x.tipo) {
      case 'explicacion':
        return { tipo: 'explicacion', titulo: texto(x.titulo, `el título de ${n}`, LIMITES_REFUERZO.largoTitulo), texto: texto(x.texto, `el texto de ${n}`, LIMITES_REFUERZO.largoTexto) };
      case 'recurso': {
        try {
          const r = normalizarRecurso(String(x.url ?? ''));
          return { tipo: 'recurso', titulo: texto(x.titulo, `el título de ${n}`, LIMITES_REFUERZO.largoTitulo), url: r.url, provider: r.proveedor, embedUrl: r.embedUrl };
        } catch (e) {
          if (e instanceof RecursoInvalidoError) throw new RefuerzoInvalidoError(`${n[0].toUpperCase()}${n.slice(1)}: ${e.message}`);
          throw e;
        }
      }
      case 'ejercicio':
        if (!Number.isInteger(x.activityId)) throw new RefuerzoInvalidoError(`Elige el ejercicio de ${n}.`);
        return { tipo: 'ejercicio', activityId: x.activityId as number };
      case 'entrega':
        if (!Number.isInteger(x.entregaId)) throw new RefuerzoInvalidoError(`Elige la entrega de ${n}.`);
        return { tipo: 'entrega', entregaId: x.entregaId as number };
      default:
        throw new RefuerzoInvalidoError(`${n[0].toUpperCase()}${n.slice(1)} no tiene un tipo válido.`);
    }
  });
  return { tipo: d.tipo as TipoRefuerzo, titulo, mensaje, learningUnitIds, estudiantes, fechaLimite, pasos };
}

/** La lista de estudiantes a los que queda asignada una actividad o entrega al sumarla a un refuerzo. */
export function asignacionTrasRefuerzo(actual: number[] | null, publicada: boolean, estudiantes: number[]): number[] | null {
  // Ya era de toda la clase: sigue siéndolo. Si era un borrador, queda solo para estos estudiantes.
  if (publicada && actual === null) return null;
  return [...new Set([...(actual ?? []), ...estudiantes])];
}

/**
 * Qué pasos hizo un estudiante. Un ejercicio cuenta cuando lo intentó (calificado) después de crearse el refuerzo; una
 * entrega, cuando envió una versión; una explicación o un recurso, cuando marcó «Ya lo vi».
 */
export function pasosHechos(
  pasos: Paso[],
  datos: { intentados: Set<number>; entregados: Set<number>; marcados: Set<number> },
): boolean[] {
  return pasos.map((p, i) => {
    if (p.tipo === 'ejercicio') return datos.intentados.has(p.activityId);
    if (p.tipo === 'entrega') return datos.entregados.has(p.entregaId);
    return datos.marcados.has(i);
  });
}

/**
 * Sugerencias de ejercicios (§4.2): para un refuerzo, primero los que los estudiantes elegidos aún no aprueban y de menor
 * nivel; para un reto, los de mayor nivel. El docente decide: esto solo ordena.
 */
export function ordenarSugerencias<T extends { nivel: number; aprobadosPor: number }>(lista: T[], tipo: TipoRefuerzo, estudiantes: number): T[] {
  return [...lista].sort((a, b) => {
    const pendienteA = a.aprobadosPor < estudiantes ? 0 : 1;
    const pendienteB = b.aprobadosPor < estudiantes ? 0 : 1;
    if (pendienteA !== pendienteB) return pendienteA - pendienteB;
    return tipo === 'refuerzo' ? a.nivel - b.nivel : b.nivel - a.nivel;
  });
}

/**
 * Un ejercicio que el docente manda en un refuerzo da UN intento propio (sugerencia n.º 11 de José, 10/10: «cuando se
 * acaban los intentos haciéndolos en la lección, ya no se puede realizar el ejercicio en el refuerzo»). El docente pidió
 * hacerlo: el límite de intentos de la lección no puede impedirlo. El intento vale hasta que lo hace después de creado el
 * refuerzo (el paso queda hecho, pasosHechos); un refuerzo archivado ya no lo da.
 */
export function intentoDeRefuerzo(
  refuerzos: Array<{ createdAt: Date; archivado: boolean; estudiantes: number[]; pasos: Paso[] }>,
  activityId: number,
  studentId: number,
  fechasDeIntentos: Date[],
): boolean {
  return refuerzos.some(
    (r) =>
      !r.archivado &&
      r.estudiantes.includes(studentId) &&
      r.pasos.some((p) => p.tipo === 'ejercicio' && p.activityId === activityId) &&
      !fechasDeIntentos.some((f) => f.getTime() >= new Date(r.createdAt).getTime()),
  );
}
