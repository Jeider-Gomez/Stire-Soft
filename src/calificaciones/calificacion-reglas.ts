/**
 * Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6; BASE_TEORICA.md BT-14). Todo es OPCIONAL y lo arma el
 * docente a su manera (el dueño, 01/10: «una herramienta flexible que ayuda al profe, no que lo limita… la idea es que
 * él haga las cosas a su manera»):
 * - cada nota sale del dominio de unas lecciones, de unas entregas o la pone él (también actividades presenciales);
 * - cada nota es del curso entero o de un módulo; un módulo con notas tiene su propia nota de módulo;
 * - en cada nivel decide si usa porcentajes (no tienen que sumar 100: se reparten en proporción; 0 = se registra pero
 *   no cuenta) o promedia; y si quiere, no calcula ninguna nota final y solo registra.
 * STIRE propone la final con su desglose y el docente la ajusta con un motivo que queda en el historial. Escala de 0,0 a
 * 5,0. Funciones puras: el servicio las aplica.
 */

export class CalificacionInvalidaError extends Error {}

/**
 * - `dominio`: promedio del dominio de las lecciones (las del módulo, todas las publicadas o las que elija).
 * - `entregas`: promedio de las notas de las entregas con nota (todas o las elegidas).
 * - `manual`: nota que pone el docente (un parcial, una exposición, una actividad en el salón).
 */
export const TIPOS_COMPONENTE = ['dominio', 'entregas', 'manual'] as const;
export type TipoComponente = (typeof TIPOS_COMPONENTE)[number];

/** Cómo se combinan las notas: con porcentajes, promediando o (solo la final) sin calcular nada. */
export const MODOS_CALCULO = ['porcentajes', 'promedio', 'ninguno'] as const;
export type ModoCalculo = (typeof MODOS_CALCULO)[number];
export type ModoGrupo = Exclude<ModoCalculo, 'ninguno'>;

export interface Componente {
  clave: string;
  nombre: string;
  tipo: TipoComponente;
  /** Porcentaje (0 a 100) dentro de su nivel, si ese nivel usa porcentajes. 0 = se registra pero no cuenta. */
  peso: number;
  /** null = del curso entero; si no, el módulo al que pertenece. */
  moduloId: number | null;
  /** Solo `dominio`: lecciones que cuentan; null = las del módulo (o todas las publicadas si es del curso). */
  lecciones: number[] | null;
  /** Solo `entregas`: entregas que cuentan; null = todas las que llevan nota. */
  entregas: number[] | null;
}

/** La nota de un módulo: cómo combina sus notas y cuánto pesa en la final. */
export interface GrupoModulo {
  moduloId: number;
  calculo: ModoGrupo;
  peso: number;
}

export interface Esquema {
  componentes: Componente[];
  /** Cómo se calcula la nota final (o no se calcula). */
  calculo: ModoCalculo;
  grupos: GrupoModulo[];
  notaAprobatoria: number;
  visibleParaEstudiantes: boolean;
}

/** La clave del ajuste de la nota final; no puede ser la de un componente. */
export const CLAVE_FINAL = 'final';

export const LIMITES_CALIFICACION = {
  componentesMaximos: 40,
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

function porcentaje(valor: unknown, quien: string): number {
  if (valor === null || valor === undefined || valor === '') return 0;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new CalificacionInvalidaError(`El porcentaje de «${quien}» es un entero de 0 a 100.`);
  return n;
}

const CLAVE_VALIDA = /^[a-z0-9_-]{1,30}$/;

export function validarEsquema(entrada: Record<string, unknown>): Esquema {
  const crudos = entrada.componentes;
  if (!Array.isArray(crudos) || crudos.length === 0) throw new CalificacionInvalidaError('Agrega al menos una nota.');
  if (crudos.length > LIMITES_CALIFICACION.componentesMaximos) {
    throw new CalificacionInvalidaError(`Máximo ${LIMITES_CALIFICACION.componentesMaximos} notas.`);
  }

  // Compatibilidad: la primera versión mandaba `usarPesos`.
  const calculo = (entrada.calculo ?? (entrada.usarPesos === true ? 'porcentajes' : 'promedio')) as ModoCalculo;
  if (!(MODOS_CALCULO as readonly string[]).includes(calculo)) throw new CalificacionInvalidaError('Elige cómo se calcula la nota final.');

  const usadas = new Set<string>();
  const componentes: Componente[] = crudos.map((c: unknown, i: number) => {
    if (typeof c !== 'object' || c === null) throw new CalificacionInvalidaError(`La nota ${i + 1} no es válida.`);
    const d = c as Record<string, unknown>;
    const nombre = String(d.nombre ?? '').trim();
    if (!nombre) throw new CalificacionInvalidaError(`Ponle nombre a la nota ${i + 1}.`);
    if (nombre.length > LIMITES_CALIFICACION.largoNombre) throw new CalificacionInvalidaError(`El nombre «${nombre.slice(0, 20)}…» es muy largo.`);
    const tipo = d.tipo as TipoComponente;
    if (!(TIPOS_COMPONENTE as readonly string[]).includes(tipo)) throw new CalificacionInvalidaError(`El tipo de «${nombre}» no es válido.`);
    const moduloId = d.moduloId === null || d.moduloId === undefined ? null : Number(d.moduloId);
    if (moduloId !== null && (!Number.isInteger(moduloId) || moduloId <= 0)) throw new CalificacionInvalidaError(`El módulo de «${nombre}» no es válido.`);

    // La clave se conserva entre ediciones (las notas manuales se guardan con ella); si no viene, se crea una.
    let clave = typeof d.clave === 'string' && CLAVE_VALIDA.test(d.clave) && d.clave !== CLAVE_FINAL ? d.clave : '';
    if (!clave || usadas.has(clave)) {
      let n = i + 1;
      while (usadas.has(`c${n}`)) n++;
      clave = `c${n}`;
    }
    usadas.add(clave);

    return {
      clave, nombre, tipo, moduloId,
      peso: porcentaje(d.peso, nombre),
      lecciones: tipo === 'dominio' ? listaDeIds(d.lecciones, `Lecciones de «${nombre}»`) : null,
      entregas: tipo === 'entregas' ? listaDeIds(d.entregas, `Entregas de «${nombre}»`) : null,
    };
  });

  // Un grupo por cada módulo que tenga notas; lo que no venga, promedia y no pesa hasta que el docente diga.
  const crudosGrupos = Array.isArray(entrada.grupos) ? (entrada.grupos as Array<Record<string, unknown>>) : [];
  const modulos = [...new Set(componentes.map((c) => c.moduloId).filter((m): m is number => m !== null))];
  const grupos: GrupoModulo[] = modulos.map((moduloId) => {
    const g = crudosGrupos.find((x) => Number(x?.moduloId) === moduloId) ?? {};
    const modo = (g.calculo ?? 'promedio') as ModoGrupo;
    if (modo !== 'porcentajes' && modo !== 'promedio') throw new CalificacionInvalidaError('Una nota de módulo se calcula con porcentajes o promediando.');
    return { moduloId, calculo: modo, peso: porcentaje(g.peso, 'el módulo') };
  });

  const aprobatoria = entrada.notaAprobatoria === undefined ? LIMITES_CALIFICACION.notaAprobatoriaPorDefecto : validarNota(entrada.notaAprobatoria);
  if (aprobatoria === null) throw new CalificacionInvalidaError('Indica la nota aprobatoria.');
  if (entrada.visibleParaEstudiantes !== undefined && typeof entrada.visibleParaEstudiantes !== 'boolean') {
    throw new CalificacionInvalidaError('«Visible para los estudiantes» debe ser sí o no.');
  }

  return { componentes, calculo, grupos, notaAprobatoria: aprobatoria, visibleParaEstudiantes: entrada.visibleParaEstudiantes === true };
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
  /** Módulos de la clase con sus lecciones (para «las lecciones del módulo» y el nombre de la nota del módulo). */
  modulos: Array<{ id: number; titulo: string; lecciones: number[] }>;
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
  /** Nota de cada módulo que tiene notas, por id de módulo. */
  modulos: Record<string, { nota: number | null; faltan: string[] }>;
  /** La final que propone STIRE con lo ya calificado; null si no hay nada o si el docente no calcula final. */
  propuesta: number | null;
  /** Lo que aún no tiene nota en la final. */
  faltan: string[];
  ajuste: { nota: number; motivo: string | null; fecha: Date } | null;
  final: number | null;
  aprueba: boolean | null;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function notaDominio(c: Componente, e: EntradaLibro, studentId: number): NotaComponente {
  const delModulo = c.moduloId !== null ? e.modulos.find((m) => m.id === c.moduloId)?.lecciones : undefined;
  const lecciones = c.lecciones ?? delModulo ?? e.lecciones;
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
 * Combina notas con lo que ya tiene nota. Con porcentajes, cada una pesa su porcentaje y se reparte en proporción entre
 * las que tienen nota (no hace falta que sumen 100; con 0 se registra pero no cuenta). Promediando, todas pesan igual.
 */
export function combinar(items: Array<{ nombre: string; nota: number | null; peso: number }>, calculo: ModoGrupo): { nota: number | null; faltan: string[] } {
  const conNota = items.filter((i) => i.nota !== null);
  const faltan = items.filter((i) => i.nota === null).map((i) => i.nombre);
  if (calculo === 'promedio') {
    return { nota: conNota.length ? redondear(conNota.reduce((s, i) => s + (i.nota as number), 0) / conNota.length) : null, faltan };
  }
  const peso = conNota.reduce((s, i) => s + i.peso, 0);
  if (peso === 0) return { nota: null, faltan };
  return { nota: redondear(conNota.reduce((s, i) => s + i.peso * (i.nota as number), 0) / peso), faltan };
}

/** Nombre de la nota de un módulo: «Nota de Módulo 1 · …». */
export function nombreNotaModulo(e: Pick<EntradaLibro, 'modulos'>, moduloId: number): string {
  return `Nota de ${e.modulos.find((m) => m.id === moduloId)?.titulo ?? 'módulo'}`;
}

export function construirLibro(e: EntradaLibro): { filas: FilaLibro[]; resumen: { promedio: number | null; aprueban: number; reprueban: number; sinNota: number } } {
  const { esquema } = e;
  const filas = e.estudiantes.map((est): FilaLibro => {
    const componentes: Record<string, NotaComponente> = {};
    for (const c of esquema.componentes) {
      componentes[c.clave] = c.tipo === 'dominio' ? notaDominio(c, e, est.id) : c.tipo === 'entregas' ? notaEntregas(c, e, est.id) : notaManual(c, e, est.id);
    }
    const modulos: FilaLibro['modulos'] = {};
    for (const g of esquema.grupos) {
      const items = esquema.componentes.filter((c) => c.moduloId === g.moduloId).map((c) => ({ nombre: c.nombre, nota: componentes[c.clave].nota, peso: c.peso }));
      modulos[String(g.moduloId)] = combinar(items, g.calculo);
    }
    let propuesta: number | null = null;
    let faltan: string[] = [];
    if (esquema.calculo !== 'ninguno') {
      const delCurso = esquema.componentes.filter((c) => c.moduloId === null).map((c) => ({ nombre: c.nombre, nota: componentes[c.clave].nota, peso: c.peso }));
      const deModulos = esquema.grupos.map((g) => ({ nombre: nombreNotaModulo(e, g.moduloId), nota: modulos[String(g.moduloId)].nota, peso: g.peso }));
      ({ nota: propuesta, faltan } = combinar([...deModulos, ...delCurso], esquema.calculo));
    }
    const r = e.registradas.find((x) => x.studentId === est.id && x.clave === CLAVE_FINAL);
    const ajuste = r ? { nota: r.nota, motivo: r.motivo, fecha: r.updatedAt } : null;
    const final = ajuste ? ajuste.nota : propuesta;
    return {
      studentId: est.id, nombre: est.nombre, email: est.email, componentes, modulos, propuesta, faltan, ajuste, final,
      aprueba: final === null ? null : final >= esquema.notaAprobatoria,
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
