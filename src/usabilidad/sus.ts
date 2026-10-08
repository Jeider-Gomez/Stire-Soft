// Escala de usabilidad de sistemas, SUS (Brooke, 1996): 10 afirmaciones de 1 (muy en desacuerdo) a 5 (muy de acuerdo).
// Las impares son positivas y las pares negativas. Es la métrica que pide UX-08 de la lista de interfaz (Pressman, cap.
// 12) y la más usada para comparar productos; tiene versiones validadas en español (Sevilla-Gonzalez et al., 2020;
// Castilla et al., 2024). docs/DISENO_ENCUESTA_USABILIDAD.md.

export const PREGUNTAS_SUS = 10;

/**
 * Segunda parte, distinta para cada rol (pedido del dueño, 04/10: «que sea diferente para estudiantes y docentes y que
 * de verdad aporte»). El SUS se mantiene igual para todos, porque solo así se compara con otros sistemas y entre roles;
 * después, «¿Qué tan fácil o difícil te resultó…?» para las tareas clave de su rol, de 1 (muy difícil) a 7 (muy fácil):
 * la pregunta única de facilidad (Single Ease Question; Sauro y Dumas, 2009). El SUS dice CUÁNTO; estas, DÓNDE.
 * Una tarea sin respuesta es «no la he hecho» y no cuenta.
 */
export const TAREAS_POR_ROL: Record<string, ReadonlyArray<{ clave: string; texto: string }>> = {
  estudiante: [
    { clave: 'entender-leccion', texto: 'Entender una lección (leerla, escucharla o ver su diagrama)' },
    { clave: 'resolver-ejercicio', texto: 'Resolver un ejercicio y entender por qué pasó o falló' },
    { clave: 'pedir-ayuda', texto: 'Pedir ayuda al Tutor cuando te atascas' },
    { clave: 'saber-que-sigue', texto: 'Saber qué estudiar o repasar después' },
    { clave: 'entregar-proyecto', texto: 'Hacer y entregar un proyecto' },
  ],
  docente: [
    { clave: 'crear-leccion', texto: 'Crear o editar una lección' },
    { clave: 'crear-ejercicio', texto: 'Crear un ejercicio con sus casos de prueba' },
    { clave: 'revisar-entregas', texto: 'Revisar y calificar entregas' },
    { clave: 'seguir-clase', texto: 'Ver quién va bien y quién necesita ayuda' },
    { clave: 'configurar-clase', texto: 'Configurar la clase (Tutor, logros, notas)' },
  ],
};
export const FACILIDAD_MINIMA = 1;
export const FACILIDAD_MAXIMA = 7;

export class EncuestaInvalidaError extends Error {}

/** Las respuestas de facilidad que vale guardar: solo tareas de su rol, de 1 a 7; sin ninguna, null. */
export function validarTareas(rol: string, tareas: unknown): Record<string, number> | null {
  if (tareas === undefined || tareas === null) return null;
  if (typeof tareas !== 'object' || Array.isArray(tareas)) throw new EncuestaInvalidaError('Las respuestas de las tareas no son válidas.');
  const claves = new Set((TAREAS_POR_ROL[rol] ?? []).map((t) => t.clave));
  const limpias: Record<string, number> = {};
  for (const [clave, valor] of Object.entries(tareas)) {
    if (!claves.has(clave)) throw new EncuestaInvalidaError('Una de las tareas no es de tu rol.');
    if (valor === null) continue;
    if (!Number.isInteger(valor) || (valor as number) < FACILIDAD_MINIMA || (valor as number) > FACILIDAD_MAXIMA) {
      throw new EncuestaInvalidaError('La facilidad de cada tarea va de 1 (muy difícil) a 7 (muy fácil).');
    }
    limpias[clave] = valor as number;
  }
  return Object.keys(limpias).length ? limpias : null;
}

/** Puntaje de 0 a 100: impares, respuesta − 1; pares, 5 − respuesta; la suma × 2,5. */
export function puntajeSus(respuestas: number[]): number {
  if (respuestas.length !== PREGUNTAS_SUS || respuestas.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) {
    throw new Error('El SUS tiene 10 respuestas de 1 a 5.');
  }
  const suma = respuestas.reduce((s, r, i) => s + (i % 2 === 0 ? r - 1 : 5 - r), 0);
  return suma * 2.5;
}

/** Rangos de aceptabilidad de Bangor, Kortum y Miller (2008): menos de 50, no aceptable; 50 a 70, marginal; 70 o más, aceptable. */
export type Aceptabilidad = 'no-aceptable' | 'marginal' | 'aceptable';
export function aceptabilidadSus(puntaje: number): Aceptabilidad {
  return puntaje >= 70 ? 'aceptable' : puntaje >= 50 ? 'marginal' : 'no-aceptable';
}

export interface RespuestaSus {
  rol: string;
  respuestas: number[];
  puntaje: number;
  comentario: string | null;
  /** Facilidad de las tareas de su rol (1 a 7); null o ausente si no respondió esa parte. */
  tareas?: Record<string, number> | null;
  fecha: Date;
}

export interface FacilidadTarea { clave: string; texto: string; promedio: number | null; n: number }

export interface ResumenSus {
  n: number;
  promedio: number | null;
  aceptabilidad: Aceptabilidad | null;
  porRol: Record<string, { n: number; promedio: number }>;
  /** Promedio de cada afirmación (1 a 5), para ver qué arrastra el puntaje. */
  porPregunta: number[];
  comentarios: Array<{ rol: string; texto: string; fecha: Date }>;
  /** Por rol, la facilidad promedio de cada tarea, de la más difícil a la más fácil (las sin respuestas, al final). */
  tareas: Record<string, FacilidadTarea[]>;
}

const redondear = (x: number) => Math.round(x * 10) / 10;

/** Resumen sin nombres: lo que ve el admin. Recibe solo la última respuesta de cada persona. */
export function resumirSus(respuestas: RespuestaSus[]): ResumenSus {
  const n = respuestas.length;
  const promedio = n ? redondear(respuestas.reduce((s, r) => s + r.puntaje, 0) / n) : null;
  const sumas: Record<string, { n: number; suma: number }> = {};
  for (const r of respuestas) {
    const g = (sumas[r.rol] ??= { n: 0, suma: 0 });
    g.n++;
    g.suma += r.puntaje;
  }
  const porRol: ResumenSus['porRol'] = Object.fromEntries(Object.entries(sumas).map(([rol, g]) => [rol, { n: g.n, promedio: redondear(g.suma / g.n) }]));
  const porPregunta = Array.from({ length: PREGUNTAS_SUS }, (_, i) => (n ? redondear(respuestas.reduce((s, r) => s + r.respuestas[i], 0) / n) : 0));
  const comentarios = respuestas
    .flatMap((r) => (r.comentario && r.comentario.trim() ? [{ rol: r.rol, texto: r.comentario.trim(), fecha: r.fecha }] : []))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  const tareas: ResumenSus['tareas'] = {};
  for (const [rol, lista] of Object.entries(TAREAS_POR_ROL)) {
    const delRol = respuestas.filter((r) => r.rol === rol);
    if (!delRol.length) continue;
    tareas[rol] = lista
      .map((t) => {
        const valores = delRol.flatMap((r) => (typeof r.tareas?.[t.clave] === 'number' ? [r.tareas[t.clave]] : []));
        return { clave: t.clave, texto: t.texto, n: valores.length, promedio: valores.length ? redondear(valores.reduce((s, v) => s + v, 0) / valores.length) : null };
      })
      .sort((a, b) => (a.promedio ?? Infinity) - (b.promedio ?? Infinity));
  }
  return { n, promedio, aceptabilidad: promedio === null ? null : aceptabilidadSus(promedio), porRol, porPregunta, comentarios, tareas };
}

/**
 * Cada cuánto se puede volver a responder: medir de nuevo después de cambios, sin cansar con encuestas. 08/10, Jeider:
 * 7 días mientras dure la prueba con el equipo (antes 90), porque STIRE cambia cada semana y así se compara la semana 1
 * con la 2. Al terminar la prueba conviene volver a un plazo largo.
 */
export const DIAS_ENTRE_RESPUESTAS = 7;
/** No se invita a quien acaba de llegar: para opinar de la usabilidad hay que haber usado la plataforma. */
export const DIAS_DE_USO_PARA_INVITAR = 3;
const DIA = 86_400_000;

export function puedeResponder(ultima: Date | null, ahora: Date): boolean {
  return !ultima || ahora.getTime() - ultima.getTime() >= DIAS_ENTRE_RESPUESTAS * DIA;
}

export function debeInvitar(cuentaCreada: Date, ultima: Date | null, ahora: Date): boolean {
  return puedeResponder(ultima, ahora) && ahora.getTime() - cuentaCreada.getTime() >= DIAS_DE_USO_PARA_INVITAR * DIA;
}
