/**
 * Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6; BASE_TEORICA.md BT-14). Todo es OPCIONAL y lo arma el
 * docente a su manera (decisión del dueño, 01/10: «una herramienta flexible que ayuda al profe, no que lo limita»):
 * una sola nota que pone él, una nota por módulo, práctica + entregas + parcial, con porcentajes o sin ellos. STIRE
 * calcula lo que puede (dominio, entregas), propone la final con su desglose y el docente la ajusta con un motivo que
 * queda en el historial. Escala de 0,0 a 5,0. Funciones puras: el servicio las aplica.
 */

export class CalificacionInvalidaError extends Error {}

/**
 * - `dominio`: promedio del dominio de las lecciones (todas las de módulos publicados, o las que elija el docente).
 * - `entregas`: promedio de las notas de las entregas con nota (todas o las elegidas).
 * - `manual`: nota que pone el docente (un parcial, una exposición).
 */
export const TIPOS_COMPONENTE = ['dominio', 'entregas', 'manual'] as const;
export type TipoComponente = (typeof TIPOS_COMPONENTE)[number];

export interface Componente {
  clave: string;
  nombre: string;
  tipo: TipoComponente;
  /** Porcentaje entero; con `usarPesos` los del esquema suman 100. Sin porcentajes es 0 y todos pesan igual. */
  peso: number;
  /** Solo `dominio`: lecciones que cuentan; null = todas las de módulos publicados. */
  lecciones: number[] | null;
  /** Solo `entregas`: entregas que cuentan; null = todas las que llevan nota. */
  entregas: number[] | null;
}

export interface Esquema {
  componentes: Componente[];
  /** Con porcentajes (suman 100) o sin ellos: la final es el promedio simple de lo que tiene nota. */
  usarPesos: boolean;
  notaAprobatoria: number;
  visibleParaEstudiantes: boolean;
}

/** La clave del ajuste de la nota final; no puede ser la de un componente. */
export const CLAVE_FINAL = 'final';

export const LIMITES_CALIFICACION = {
  componentesMaximos: 8,
  largoNombre: 60,
  largoMotivo: 500,
  motivoMinimo: 5,
  notaMaxima: 5,
  /** Aprobatoria por defecto. Hay que confirmarla con el reglamento de la Universidad; el docente la cambia. */
  notaAprobatoriaPorDefecto: 3,
} as const;


/** Una cifra decimal, redondeando la mitad hacia arriba (4,25 → 4,3). */
export function redondear(n: number): number {
  return Math.round(n * 10 + 1e-9) / 10;
}

/** Nota de 0,0 a 5,0 con una cifra decimal; acepta «4,5». null o '' = sin nota. */
export function validarNota(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > LIMITES_CALIFICACION.notaMaxima) {
    throw new CalificacionInvalidaError('La nota va de 0,0 a 5,0.');
  }
  return redondear(n);
}

function listaDeIds(valor: unknown, campo: string): number[] | null {
  if (valor === null || valor === undefined) return null;
  if (!Array.isArray(valor) || valor.some((v) => !Number.isInteger(v) || (v as number) <= 0)) {
    throw new CalificacionInvalidaError(`«${campo}» debe ser una lista de identificadores.`);
  }
  const ids = [...new Set(valor as number[])];
  if (ids.length === 0) throw new CalificacionInvalidaError(`Elige al menos una opción en «${campo}», o deja «todas».`);
  return ids;
}

const CLAVE_VALIDA = /^[a-z0-9_-]{1,30}$/;

export function validarEsquema(entrada: Record<string, unknown>): Esquema {
  const crudos = entrada.componentes;
  if (!Array.isArray(crudos) || crudos.length === 0) throw new CalificacionInvalidaError('El esquema necesita al menos un componente.');
  if (crudos.length > LIMITES_CALIFICACION.componentesMaximos) {
    throw new CalificacionInvalidaError(`Máximo ${LIMITES_CALIFICACION.componentesMaximos} componentes.`);
  }

  if (entrada.usarPesos !== undefined && typeof entrada.usarPesos !== 'boolean') throw new CalificacionInvalidaError('«Usar porcentajes» debe ser sí o no.');
  const usarPesos = entrada.usarPesos !== false;

  const usadas = new Set<string>();
  const componentes: Componente[] = crudos.map((c: unknown, i: number) => {
    if (typeof c !== 'object' || c === null) throw new CalificacionInvalidaError(`El componente ${i + 1} no es válido.`);
    const d = c as Record<string, unknown>;
    const nombre = String(d.nombre ?? '').trim();
    if (!nombre) throw new CalificacionInvalidaError(`Ponle nombre al componente ${i + 1}.`);
    if (nombre.length > LIMITES_CALIFICACION.largoNombre) throw new CalificacionInvalidaError(`El nombre «${nombre.slice(0, 20)}…» es muy largo.`);
    const tipo = d.tipo as TipoComponente;
    if (!(TIPOS_COMPONENTE as readonly string[]).includes(tipo)) throw new CalificacionInvalidaError(`El tipo de «${nombre}» no es válido.`);
    const peso = usarPesos ? Number(d.peso) : 0;
    if (usarPesos && (!Number.isInteger(peso) || peso < 1 || peso > 100)) throw new CalificacionInvalidaError(`El peso de «${nombre}» es un porcentaje entero de 1 a 100.`);

    // La clave se conserva entre ediciones (las notas manuales se guardan con ella); si no viene, se crea una.
    let clave = typeof d.clave === 'string' && CLAVE_VALIDA.test(d.clave) && d.clave !== CLAVE_FINAL ? d.clave : '';
    if (!clave || usadas.has(clave)) {
      let n = i + 1;
      while (usadas.has(`c${n}`)) n++;
      clave = `c${n}`;
    }
    usadas.add(clave);

    return {
      clave, nombre, tipo, peso,
      lecciones: tipo === 'dominio' ? listaDeIds(d.lecciones, `Lecciones de «${nombre}»`) : null,
      entregas: tipo === 'entregas' ? listaDeIds(d.entregas, `Entregas de «${nombre}»`) : null,
    };
  });

  const suma = componentes.reduce((s, c) => s + c.peso, 0);
  if (usarPesos && suma !== 100) throw new CalificacionInvalidaError(`Los pesos suman ${suma} %; deben sumar 100 %, o quita los porcentajes.`);

  const aprobatoria = entrada.notaAprobatoria === undefined ? LIMITES_CALIFICACION.notaAprobatoriaPorDefecto : validarNota(entrada.notaAprobatoria);
  if (aprobatoria === null) throw new CalificacionInvalidaError('Indica la nota aprobatoria.');
  if (entrada.visibleParaEstudiantes !== undefined && typeof entrada.visibleParaEstudiantes !== 'boolean') {
    throw new CalificacionInvalidaError('«Visible para los estudiantes» debe ser sí o no.');
  }

  return { componentes, usarPesos, notaAprobatoria: aprobatoria, visibleParaEstudiantes: entrada.visibleParaEstudiantes === true };
}

/** Motivo del ajuste de la nota final: obligatorio al poner una nota, para que el historial diga por qué. */
export function validarMotivo(valor: unknown, obligatorio: boolean): string | null {
  const motivo = typeof valor === 'string' ? valor.trim() : '';
  if (!motivo) {
    if (obligatorio) throw new CalificacionInvalidaError('Escribe el motivo del ajuste: queda en el historial.');
    return null;
  }
  if (obligatorio && motivo.length < LIMITES_CALIFICACION.motivoMinimo) throw new CalificacionInvalidaError('Escribe el motivo del ajuste con un poco más de detalle.');
  if (motivo.length > LIMITES_CALIFICACION.largoMotivo) throw new CalificacionInvalidaError(`El motivo admite hasta ${LIMITES_CALIFICACION.largoMotivo} caracteres.`);
  return motivo;
}

// ───────────────────────── Cálculo del libro ─────────────────────────

export interface EntradaLibro {
  esquema: Esquema;
  estudiantes: Array<{ id: number; nombre: string; email: string }>;
  /** Lecciones de módulos publicados, en el orden del curso. */
  lecciones: number[];
  /** Dominio (0 a 100) por estudiante y lección; lo que falta cuenta 0. */
  dominio: Map<number, Map<number, number>>;
  entregas: Array<{ id: number; titulo: string; conNota: boolean; publicada: boolean; asignadaA: number[] | null; cierraAt: Date | null; aceptaTarde: boolean }>;
  envios: Array<{ entregaId: number; studentId: number; version: number; nota: number | null; revisadoAt: Date | null }>;
  /** Notas que puso el docente: componentes manuales y el ajuste final. */
  registradas: Array<{ studentId: number; clave: string; nota: number; motivo: string | null; updatedAt: Date }>;
  ahora: Date;
}

export interface NotaComponente {
  nota: number | null;
  detalle: string;
}

export interface FilaLibro {
  studentId: number;
  nombre: string;
  email: string;
  componentes: Record<string, NotaComponente>;
  /** Promedio ponderado de los componentes que ya tienen nota; null si ninguno tiene. */
  propuesta: number | null;
  /** Nombres de los componentes que aún no tienen nota. */
  faltan: string[];
  ajuste: { nota: number; motivo: string | null; fecha: Date } | null;
  final: number | null;
  aprueba: boolean | null;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function notaDominio(c: Componente, e: EntradaLibro, studentId: number): NotaComponente {
  const lecciones = c.lecciones ?? e.lecciones;
  if (lecciones.length === 0) return { nota: null, detalle: 'Sin lecciones publicadas' };
  const propio = e.dominio.get(studentId) ?? new Map<number, number>();
  const valores = lecciones.map((id) => Math.max(0, Math.min(100, propio.get(id) ?? 0)));
  const dominadas = valores.filter((v) => v >= 85).length;
  const promedio = valores.reduce((s, v) => s + v, 0) / valores.length;
  return { nota: redondear((promedio / 100) * 5), detalle: `${Math.round(promedio)} % de dominio en ${plural(lecciones.length, 'lección', 'lecciones')} · ${dominadas} dominadas` };
}

/**
 * Promedio de las entregas con nota que le tocan al estudiante. Por revisar o aún abierta: no cuenta todavía. Cerrada
 * sin entregar y sin aceptar tarde: cuenta 0 (el docente puede ajustar la final con su motivo).
 */
function notaEntregas(c: Componente, e: EntradaLibro, studentId: number): NotaComponente {
  const elegidas = c.entregas ? new Set(c.entregas) : null;
  const suyas = e.entregas.filter((x) => x.conNota && x.publicada && (elegidas ? elegidas.has(x.id) : true) && (!x.asignadaA || x.asignadaA.includes(studentId)));
  if (suyas.length === 0) return { nota: null, detalle: 'Sin entregas con nota' };
  const notas: number[] = [];
  let porRevisar = 0;
  let sinEntregar = 0;
  let abiertas = 0;
  for (const entrega of suyas) {
    const versiones = e.envios.filter((v) => v.entregaId === entrega.id && v.studentId === studentId);
    const calificadas = versiones.filter((v) => v.revisadoAt !== null && v.nota !== null).sort((a, b) => b.version - a.version);
    if (calificadas.length) notas.push(calificadas[0].nota as number);
    else if (versiones.length) porRevisar++;
    else if (entrega.cierraAt && entrega.cierraAt.getTime() < e.ahora.getTime() && !entrega.aceptaTarde) { notas.push(0); sinEntregar++; }
    else abiertas++;
  }
  const partes = [plural(notas.length - sinEntregar, 'calificada', 'calificadas')];
  if (porRevisar) partes.push(`${porRevisar} por revisar`);
  if (sinEntregar) partes.push(`${sinEntregar} sin entregar (0,0)`);
  if (abiertas) partes.push(plural(abiertas, 'abierta', 'abiertas'));
  return { nota: notas.length ? redondear(notas.reduce((s, n) => s + n, 0) / notas.length) : null, detalle: partes.join(' · ') };
}

function notaManual(c: Componente, e: EntradaLibro, studentId: number): NotaComponente {
  const r = e.registradas.find((x) => x.studentId === studentId && x.clave === c.clave);
  return r ? { nota: r.nota, detalle: r.motivo ?? 'Nota del docente' } : { nota: null, detalle: 'Sin nota' };
}

/**
 * Con lo que ya tiene nota: promedio ponderado (los pesos se reparten entre esos componentes) o, sin porcentajes,
 * promedio simple.
 */
export function notaPropuesta(componentes: Componente[], notas: Record<string, NotaComponente>, usarPesos = true): { propuesta: number | null; faltan: string[] } {
  const conNota = componentes.filter((c) => notas[c.clave]?.nota !== null && notas[c.clave]?.nota !== undefined);
  const faltan = componentes.filter((c) => !conNota.includes(c)).map((c) => c.nombre);
  if (!usarPesos) {
    return { propuesta: conNota.length ? redondear(conNota.reduce((s, c) => s + (notas[c.clave].nota as number), 0) / conNota.length) : null, faltan };
  }
  const peso = conNota.reduce((s, c) => s + c.peso, 0);
  if (peso === 0) return { propuesta: null, faltan };
  return { propuesta: redondear(conNota.reduce((s, c) => s + c.peso * (notas[c.clave].nota as number), 0) / peso), faltan };
}

export function construirLibro(e: EntradaLibro): { filas: FilaLibro[]; resumen: { promedio: number | null; aprueban: number; reprueban: number; sinNota: number } } {
  const filas = e.estudiantes.map((est): FilaLibro => {
    const componentes: Record<string, NotaComponente> = {};
    for (const c of e.esquema.componentes) {
      componentes[c.clave] = c.tipo === 'dominio' ? notaDominio(c, e, est.id) : c.tipo === 'entregas' ? notaEntregas(c, e, est.id) : notaManual(c, e, est.id);
    }
    const { propuesta, faltan } = notaPropuesta(e.esquema.componentes, componentes, e.esquema.usarPesos);
    const r = e.registradas.find((x) => x.studentId === est.id && x.clave === CLAVE_FINAL);
    const ajuste = r ? { nota: r.nota, motivo: r.motivo, fecha: r.updatedAt } : null;
    const final = ajuste ? ajuste.nota : propuesta;
    return {
      studentId: est.id, nombre: est.nombre, email: est.email, componentes, propuesta, faltan, ajuste, final,
      aprueba: final === null ? null : final >= e.esquema.notaAprobatoria,
    };
  });
  const finales = filas.map((f) => f.final).filter((n): n is number => n !== null);
  return {
    filas,
    resumen: {
      promedio: finales.length ? redondear(finales.reduce((s, n) => s + n, 0) / finales.length) : null,
      aprueban: filas.filter((f) => f.aprueba === true).length,
      reprueban: filas.filter((f) => f.aprueba === false).length,
      sinNota: filas.filter((f) => f.aprueba === null).length,
    },
  };
}
