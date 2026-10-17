/**
 * Perfil de aprendizaje del estudiante (MOD-02, Caro 2015; revisión de Pedro, 16/10: «no hay un panel con el perfil del
 * estudiante ni una clasificación que diferencie las concepciones erróneas de los errores de escritura»).
 *
 * Tres partes, todas con datos reales del estudiante y sin encasillarlo:
 * - Errores que se repiten: cada caso que falló en un ejercicio de programar se clasifica con las mismas reglas que la
 *   pantalla usa para explicar la salida (frontend-nuxt/utils/diagnosticoSalida.ts) y se separan los de CONCEPTO (juntar
 *   números como texto, pasarse por uno en un ciclo…) de los DESCUIDOS de escritura (paréntesis, mayúsculas, espacios).
 * - Cómo recorre el curso: si empieza las lecciones en el orden del plan (secuencial) o salta entre ellas (global).
 * - Qué formatos usa: diagrama o video (visual) frente a pseudocódigo, paso a paso o escuchar (verbal).
 * Las dos últimas son las dimensiones de Felder y Silverman que pide el criterio, pero DESCRIPTIVAS: dicen lo que el
 * estudiante hace para que lo piense, y no cambian lo que STIRE le muestra (los estilos de aprendizaje no tienen evidencia
 * para adaptar la enseñanza: BT-42).
 */

export type TipoError =
  | 'sintaxis' | 'no-existe' | 'indefinido' | 'error' | 'nan' | 'vacia' | 'eco' | 'concatena'
  | 'espacios' | 'mayusculas' | 'puntuacion' | 'por-uno' | 'redondeo' | 'numero' | 'linea';

export type GrupoError = 'concepto' | 'escritura' | 'otro';

export const GRUPO_ERROR: Record<TipoError, GrupoError> = {
  concatena: 'concepto', 'por-uno': 'concepto', nan: 'concepto', indefinido: 'concepto', eco: 'concepto',
  vacia: 'concepto', redondeo: 'concepto', numero: 'concepto',
  sintaxis: 'escritura', 'no-existe': 'escritura', espacios: 'escritura', mayusculas: 'escritura', puntuacion: 'escritura',
  error: 'otro', linea: 'otro',
};

/** La confusión de fondo detrás de cada error de concepto, en palabras de estudiante. */
export const CONFUSION: Partial<Record<TipoError, string>> = {
  concatena: 'Juntas los números como texto («5» + «3» da «53»): lo que llega de la entrada es texto y hay que convertirlo a número antes de operar.',
  'por-uno': 'Te pasas o te quedas corto por 1: suele ser dónde empieza o termina un ciclo (¿< o <=?).',
  nan: 'Haces cuentas con algo que no es número: falta convertir con Number(...) o se lee la posición equivocada de la entrada.',
  indefinido: 'Usas un dato que no existe: la primera línea de la entrada es lineas[0], no lineas[1].',
  eco: 'Muestras la misma entrada que recibes: falta el paso que la procesa.',
  vacia: 'El programa no muestra el resultado: falta escribirlo con console.log o no llega a esa línea.',
  redondeo: 'El número sale cercano pero no igual: revisa la división, los decimales o el redondeo.',
  numero: 'El resultado es otro número: falta, sobra o está en otro orden una operación.',
};

const lineas = (t: string) => t.replace(/\r\n/g, '\n').split('\n');
const sinEspacios = (t: string) => lineas(t).map((l) => l.trim().replace(/[ \t]+/g, ' ')).filter((l) => l !== '').join('\n');
const sinPuntuacion = (t: string) => t.replace(/[.,;:¡!¿?«»"'()]/g, '').replace(/\s+/g, ' ').trim();
const numero = (t: string): number | null => {
  const s = t.trim().replace(',', '.');
  return s !== '' && /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};

/** Qué tipo de error explica la diferencia entre la salida esperada y la obtenida (o el error que mostró el programa). */
export function tipoDeError(esperada: string, obtenida: string, entrada = ''): TipoError | null {
  const e = esperada.trim();
  const o = obtenida.trim();
  if (e === o) return null;
  if (o === '') return 'vacia';
  const err = /^([A-Za-z]*Error): ?(.*?)(?: \(línea \d+\))?$/.exec(o.split('\n')[0].trim());
  if (err) {
    const [, tipo, detalle] = err;
    if (tipo === 'SyntaxError') return 'sintaxis';
    if (tipo === 'ReferenceError' && /is not defined$/.test(detalle)) return 'no-existe';
    if (tipo === 'TypeError' && /undefined|null/.test(detalle)) return 'indefinido';
    return 'error';
  }
  if (/\bNaN\b/.test(o) && !/\bNaN\b/.test(e)) return 'nan';
  if (/\bundefined\b/.test(o) && !/\bundefined\b/.test(e)) return 'indefinido';
  const datos = entrada.split(/\s+/).map((x) => x.trim()).filter(Boolean);
  if (datos.length > 0 && o === entrada.trim()) return 'eco';
  const ne = numero(e);
  if (ne !== null && datos.length >= 2 && datos.every((d) => numero(d) !== null) && o === datos.join('')) return 'concatena';
  if (sinEspacios(e) === sinEspacios(o)) return 'espacios';
  if (e.toLowerCase() === o.toLowerCase()) return 'mayusculas';
  if (sinPuntuacion(e).toLowerCase() === sinPuntuacion(o).toLowerCase()) return 'puntuacion';
  const no = numero(o);
  if (ne !== null && no !== null) {
    if (Math.abs(ne - no) === 1) return 'por-uno';
    if (Math.round(ne) === Math.round(no) || Math.trunc(ne) === Math.trunc(no)) return 'redondeo';
    return 'numero';
  }
  return 'linea';
}

export interface FalloClasificado { tipo: TipoError; entregaId: string; fecha: Date }

export interface ErroresDelEstudiante {
  /** Errores de concepto que aparecieron en 2 entregas o más, el más frecuente primero. */
  seRepiten: Array<{ tipo: TipoError; veces: number; explicacion: string; ultima: string }>;
  /** Errores de concepto vistos una sola vez (todavía no son un patrón). */
  conceptoUnaVez: number;
  /** Descuidos de escritura (sintaxis, mayúsculas, espacios, puntuación), en cuántas entregas. */
  descuidos: number;
}

/** Cada entrega cuenta una vez por tipo (un ejercicio con 4 casos fallidos por lo mismo no son 4 errores). */
export function erroresQueSeRepiten(fallos: FalloClasificado[]): ErroresDelEstudiante {
  const porTipo = new Map<TipoError, { entregas: Set<string>; ultima: Date }>();
  for (const f of fallos) {
    const t = porTipo.get(f.tipo) ?? { entregas: new Set<string>(), ultima: f.fecha };
    t.entregas.add(f.entregaId);
    if (f.fecha > t.ultima) t.ultima = f.fecha;
    porTipo.set(f.tipo, t);
  }
  const concepto = [...porTipo].filter(([tipo]) => GRUPO_ERROR[tipo] === 'concepto');
  const descuidos = new Set(fallos.filter((f) => GRUPO_ERROR[f.tipo] === 'escritura').map((f) => f.entregaId)).size;
  return {
    seRepiten: concepto
      .filter(([, v]) => v.entregas.size >= 2)
      .map(([tipo, v]) => ({ tipo, veces: v.entregas.size, explicacion: CONFUSION[tipo] ?? '', ultima: v.ultima.toISOString() }))
      .sort((a, b) => b.veces - a.veces),
    conceptoUnaVez: concepto.filter(([, v]) => v.entregas.size === 1).length,
    descuidos,
  };
}

export type EtiquetaOrden = 'secuencial' | 'global' | 'equilibrado';

/**
 * Cómo recorre el curso: de una lección empezada a la siguiente que empieza, ¿va a la que sigue en el plan? Con menos de
 * 3 pasos todavía no se dice nada.
 */
export function ordenDeEstudio(plan: number[], inicios: Array<{ unitId: number; fecha: Date }>):
  { enOrden: number; saltos: number; pctEnOrden: number | null; etiqueta: EtiquetaOrden | null } {
  const posicion = new Map(plan.map((id, i) => [id, i]));
  const recorrido = [...inicios].filter((x) => posicion.has(x.unitId)).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  let enOrden = 0;
  let saltos = 0;
  for (let i = 1; i < recorrido.length; i++) {
    if (posicion.get(recorrido[i].unitId)! - posicion.get(recorrido[i - 1].unitId)! === 1) enOrden++;
    else saltos++;
  }
  const total = enOrden + saltos;
  if (total < 3) return { enOrden, saltos, pctEnOrden: null, etiqueta: null };
  const pct = Math.round((100 * enOrden) / total);
  return { enOrden, saltos, pctEnOrden: pct, etiqueta: pct >= 65 ? 'secuencial' : pct <= 35 ? 'global' : 'equilibrado' };
}

export const FORMATOS = ['diagrama', 'video', 'vivo', 'pseudocodigo', 'pasos', 'escuchar'] as const;
export type Formato = (typeof FORMATOS)[number];
const VISUAL = new Set<Formato>(['diagrama', 'video', 'vivo']);

export type EtiquetaFormato = 'visual' | 'verbal' | 'equilibrado';

/** Qué formatos elige de verdad: diagrama, video o ejemplo en vivo (visual) frente a pseudocódigo, pasos o escuchar (verbal). */
export function preferenciaDeFormatos(uso: Array<{ formato: string; veces: number }>):
  { visual: number; verbal: number; pctVisual: number | null; etiqueta: EtiquetaFormato | null } {
  let visual = 0;
  let verbal = 0;
  for (const u of uso) {
    if (!(FORMATOS as readonly string[]).includes(u.formato)) continue;
    if (VISUAL.has(u.formato as Formato)) visual += u.veces;
    else verbal += u.veces;
  }
  const total = visual + verbal;
  if (total < 3) return { visual, verbal, pctVisual: null, etiqueta: null };
  const pct = Math.round((100 * visual) / total);
  return { visual, verbal, pctVisual: pct, etiqueta: pct >= 65 ? 'visual' : pct <= 35 ? 'verbal' : 'equilibrado' };
}
