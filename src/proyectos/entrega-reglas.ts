/**
 * Reglas de las «Entregas» (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): el docente crea un espacio dentro de su clase
 * (opcionalmente en una lección) donde los estudiantes envían un proyecto. Funciones puras: el servicio las aplica.
 */
import { Difficulty } from '../common/enums/difficulty.enum';
import { ProyectoInvalidoError, TIPOS_PROYECTO, validarArchivos, type ArchivoProyecto, type TipoProyecto } from './proyecto-reglas';

export const TIPOS_ENTREGA = [...TIPOS_PROYECTO, 'cualquiera'] as const;
export type TipoEntrega = (typeof TIPOS_ENTREGA)[number];

/**
 * Cómo califica el docente cada entrega (pedido del dueño, 04/10: «nota, aprobado o no aprobado… distintas opciones
 * según se haya configurado la actividad»):
 * - `comentario`: solo retroalimentación (por defecto: en lo formativo el comentario sirve más que la nota; Butler, 1988);
 * - `aprobacion`: aprobado o no aprobado, con comentario;
 * - `desempeno`: Superior, Alto, Básico o Bajo (la escala nacional de desempeño, Decreto 1290 de 2009, que conocen los
 *   futuros licenciados);
 * - `nota`: de 0,0 a 5,0. Es la única que entra al libro de notas y al dominio de la lección, porque es numérica.
 */
export const ESCALAS_ENTREGA = ['comentario', 'aprobacion', 'desempeno', 'nota'] as const;
export type EscalaEntrega = (typeof ESCALAS_ENTREGA)[number];

export const LIMITES_ENTREGA = {
  largoTitulo: 150,
  largoConsigna: 20000,
  versionesPorDefecto: 3,
  versionesMaximas: 10,
} as const;

export interface DatosEntrega {
  titulo: string;
  consigna: string;
  learningUnitId: number | null;
  tipoProyecto: TipoEntrega;
  plantilla: ArchivoProyecto[] | null;
  abreAt: Date | null;
  cierraAt: Date | null;
  aceptaTarde: boolean;
  maxVersiones: number;
  escala: EscalaEntrega;
  /** Derivado de `escala` (= 'nota'); se conserva porque lo leen el libro de notas y el dominio. */
  conNota: boolean;
  cuentaParaDominio: boolean;
  dificultad: Difficulty;
  publicada: boolean;
  asignadaA: number[] | null;
}

const VALORES_POR_DEFECTO: Omit<DatosEntrega, 'titulo'> = {
  consigna: '',
  learningUnitId: null,
  tipoProyecto: 'cualquiera',
  plantilla: null,
  abreAt: null,
  cierraAt: null,
  aceptaTarde: true,
  maxVersiones: LIMITES_ENTREGA.versionesPorDefecto,
  // Comentario primero: la nota es opcional (decisión del dueño, §10; Butler, 1988).
  escala: 'comentario',
  conNota: false,
  cuentaParaDominio: false,
  dificultad: Difficulty.BASICO,
  publicada: false,
  asignadaA: null,
};

function fecha(valor: unknown, campo: string): Date | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const d = new Date(String(valor));
  if (Number.isNaN(d.getTime())) throw new ProyectoInvalidoError(`La fecha de ${campo} no es válida.`);
  return d;
}

function booleano(valor: unknown, campo: string): boolean {
  if (typeof valor !== 'boolean') throw new ProyectoInvalidoError(`«${campo}» debe ser sí o no.`);
  return valor;
}

/**
 * Valida lo que manda el docente. Con `actual`, es una edición: solo cambia lo que llega y el resultado se valida
 * completo (por ejemplo, contar para el dominio exige lección y nota aunque solo cambie una de las dos).
 */
export function validarEntrega(entrada: Record<string, unknown>, actual?: DatosEntrega): DatosEntrega {
  const base: DatosEntrega = actual ?? { titulo: '', ...VALORES_POR_DEFECTO };
  const r: DatosEntrega = { ...base };
  const tiene = (k: string) => Object.prototype.hasOwnProperty.call(entrada, k) && entrada[k] !== undefined;

  if (tiene('titulo') || !actual) {
    if (typeof entrada.titulo !== 'string' || !entrada.titulo.trim()) throw new ProyectoInvalidoError('Ponle un título a la entrega.');
    if (entrada.titulo.trim().length > LIMITES_ENTREGA.largoTitulo) {
      throw new ProyectoInvalidoError(`El título admite como máximo ${LIMITES_ENTREGA.largoTitulo} caracteres.`);
    }
    r.titulo = entrada.titulo.trim();
  }
  if (tiene('consigna')) {
    if (typeof entrada.consigna !== 'string') throw new ProyectoInvalidoError('La consigna debe ser texto.');
    if (entrada.consigna.length > LIMITES_ENTREGA.largoConsigna) throw new ProyectoInvalidoError('La consigna es demasiado larga.');
    r.consigna = entrada.consigna;
  }
  if (tiene('learningUnitId')) {
    const v = entrada.learningUnitId;
    if (v === null || v === '') r.learningUnitId = null;
    else if (Number.isInteger(Number(v)) && Number(v) > 0) r.learningUnitId = Number(v);
    else throw new ProyectoInvalidoError('La lección elegida no es válida.');
  }
  if (tiene('tipoProyecto')) {
    if (!(TIPOS_ENTREGA as readonly unknown[]).includes(entrada.tipoProyecto)) {
      throw new ProyectoInvalidoError('Elige qué se entrega: página web, JavaScript o cualquier proyecto.');
    }
    r.tipoProyecto = entrada.tipoProyecto as TipoEntrega;
  }
  if (tiene('plantilla')) {
    const v = entrada.plantilla;
    if (v === null || (Array.isArray(v) && v.length === 0)) r.plantilla = null;
    else {
      if (r.tipoProyecto === 'cualquiera') throw new ProyectoInvalidoError('El código inicial necesita un tipo de proyecto (página web, JavaScript, pseudocódigo o diagrama de flujo).');
      r.plantilla = validarArchivos(r.tipoProyecto as TipoProyecto, v);
    }
  }
  if (r.plantilla && r.tipoProyecto === 'cualquiera') throw new ProyectoInvalidoError('El código inicial necesita un tipo de proyecto (página web, JavaScript, pseudocódigo o diagrama de flujo).');
  if (tiene('abreAt')) r.abreAt = fecha(entrada.abreAt, 'apertura');
  if (tiene('cierraAt')) r.cierraAt = fecha(entrada.cierraAt, 'cierre');
  if (r.abreAt && r.cierraAt && r.cierraAt <= r.abreAt) throw new ProyectoInvalidoError('La entrega debe cerrar después de abrir.');
  if (tiene('aceptaTarde')) r.aceptaTarde = booleano(entrada.aceptaTarde, 'Aceptar entregas tarde');
  if (tiene('maxVersiones')) {
    const n = Number(entrada.maxVersiones);
    if (!Number.isInteger(n) || n < 1 || n > LIMITES_ENTREGA.versionesMaximas) {
      throw new ProyectoInvalidoError(`El máximo de versiones va de 1 a ${LIMITES_ENTREGA.versionesMaximas}.`);
    }
    r.maxVersiones = n;
  }
  if (tiene('escala')) {
    if (!(ESCALAS_ENTREGA as readonly unknown[]).includes(entrada.escala)) {
      throw new ProyectoInvalidoError('Elige cómo se califica: solo comentario, aprobado o no, desempeño o nota.');
    }
    r.escala = entrada.escala as EscalaEntrega;
  } else if (tiene('conNota')) {
    // Pantallas anteriores mandaban «con nota» sí o no.
    const conNota = booleano(entrada.conNota, 'Con nota');
    r.escala = conNota ? 'nota' : r.escala === 'nota' ? 'comentario' : r.escala;
  }
  r.conNota = r.escala === 'nota';
  if (tiene('cuentaParaDominio')) r.cuentaParaDominio = booleano(entrada.cuentaParaDominio, 'Cuenta para el dominio');
  if (tiene('dificultad')) {
    if (!Object.values(Difficulty).includes(entrada.dificultad as Difficulty)) throw new ProyectoInvalidoError('La dificultad no es válida.');
    r.dificultad = entrada.dificultad as Difficulty;
  }
  if (tiene('publicada')) r.publicada = booleano(entrada.publicada, 'Publicada');
  if (tiene('asignadaA')) {
    const v = entrada.asignadaA;
    if (v === null || (Array.isArray(v) && v.length === 0)) r.asignadaA = null;
    else if (Array.isArray(v) && v.every((x) => Number.isInteger(x) && x > 0)) r.asignadaA = [...new Set(v as number[])];
    else throw new ProyectoInvalidoError('La lista de estudiantes no es válida.');
  }
  if (r.cuentaParaDominio && (!r.learningUnitId || !r.conNota)) {
    throw new ProyectoInvalidoError('Para contar en el dominio, la entrega necesita una lección y nota de 0,0 a 5,0.');
  }
  return r;
}

/** ¿La ve este estudiante? Publicada y, si está asignada a algunos, solo a ellos. */
export function visibleParaEstudiante(entrega: { publicada: boolean; asignadaA: number[] | null }, studentId: number): boolean {
  return entrega.publicada && (!entrega.asignadaA || entrega.asignadaA.includes(studentId));
}

/**
 * Número de la versión que toca enviar y si llega tarde, o el motivo por el que no se puede, en palabras del estudiante.
 * El límite es el máximo de la entrega más las reaperturas que el docente le dio a ese estudiante.
 */
export function siguienteVersionDeEntrega(
  entrega: { abreAt: Date | null; cierraAt: Date | null; aceptaTarde: boolean; maxVersiones: number },
  anteriores: Array<{ version: number; titulo: string; archivos: ArchivoProyecto[] }>,
  actual: { titulo: string; archivos: ArchivoProyecto[] },
  reaperturas: number,
  ahora: Date,
): { version: number; tarde: boolean } {
  if (entrega.abreAt && ahora < entrega.abreAt) throw new ProyectoInvalidoError('Esta entrega todavía no está abierta.');
  const tarde = !!entrega.cierraAt && ahora > entrega.cierraAt;
  if (tarde && !entrega.aceptaTarde) throw new ProyectoInvalidoError('Esta entrega ya cerró.');
  const limite = entrega.maxVersiones + reaperturas;
  if (anteriores.length >= limite) {
    throw new ProyectoInvalidoError(`Ya enviaste ${limite} ${limite === 1 ? 'versión' : 'versiones'}, el máximo. Si necesitas otra, pídesela a tu docente.`);
  }
  const ultima = [...anteriores].sort((a, b) => b.version - a.version)[0];
  if (ultima && ultima.titulo === actual.titulo && JSON.stringify(ultima.archivos) === JSON.stringify(actual.archivos)) {
    throw new ProyectoInvalidoError('El proyecto no ha cambiado desde tu última versión.');
  }
  return { version: (ultima?.version ?? 0) + 1, tarde };
}

export type EstadoEntrega = 'sin_entregar' | 'por_revisar' | 'revisada';

/** Estado de un estudiante en una entrega: según su última versión. */
export function estadoDeEntrega(versiones: Array<{ version: number; revisadoAt: Date | null }>): EstadoEntrega {
  const ultima = [...versiones].sort((a, b) => b.version - a.version)[0];
  if (!ultima) return 'sin_entregar';
  return ultima.revisadoAt ? 'revisada' : 'por_revisar';
}

/**
 * La notificación que reciben los estudiantes cuando una entrega queda publicada para ellos (sugerencia n.º 10 de Pedro,
 * 09/10: «los estudiantes no ven que se subió una entrega y la pasan por alto»). Dice la clase y hasta cuándo.
 */
export function notificacionDeEntrega(
  entrega: { id: number; titulo: string; cierraAt: Date | null },
  nombreClase: string,
): { titulo: string; mensaje: string; enlace: string; clave: string } {
  const cierre = entrega.cierraAt
    ? ` Cierra el ${new Date(entrega.cierraAt).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}.`
    : '';
  return {
    titulo: `Nueva entrega: «${entrega.titulo}»`,
    mensaje: `Tu docente de «${nombreClase}» publicó una entrega.${cierre}`,
    enlace: `/estudiante/entregas/${entrega.id}`,
    clave: `entrega:${entrega.id}`,
  };
}
