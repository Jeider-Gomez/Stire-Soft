// Escala de usabilidad de sistemas, SUS (Brooke, 1996): 10 afirmaciones de 1 (muy en desacuerdo) a 5 (muy de acuerdo).
// Las impares son positivas y las pares negativas. Es la métrica que pide UX-08 de la lista de interfaz (Pressman, cap.
// 12) y la más usada para comparar productos; tiene versiones validadas en español (Sevilla-Gonzalez et al., 2020;
// Castilla et al., 2024). docs/DISENO_ENCUESTA_USABILIDAD.md.

export const PREGUNTAS_SUS = 10;

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
  fecha: Date;
}

export interface ResumenSus {
  n: number;
  promedio: number | null;
  aceptabilidad: Aceptabilidad | null;
  porRol: Record<string, { n: number; promedio: number }>;
  /** Promedio de cada afirmación (1 a 5), para ver qué arrastra el puntaje. */
  porPregunta: number[];
  comentarios: Array<{ rol: string; texto: string; fecha: Date }>;
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
  return { n, promedio, aceptabilidad: promedio === null ? null : aceptabilidadSus(promedio), porRol, porPregunta, comentarios };
}

/** Cada cuánto se puede volver a responder: medir de nuevo después de cambios, sin cansar con encuestas. */
export const DIAS_ENTRE_RESPUESTAS = 90;
/** No se invita a quien acaba de llegar: para opinar de la usabilidad hay que haber usado la plataforma. */
export const DIAS_DE_USO_PARA_INVITAR = 3;
const DIA = 86_400_000;

export function puedeResponder(ultima: Date | null, ahora: Date): boolean {
  return !ultima || ahora.getTime() - ultima.getTime() >= DIAS_ENTRE_RESPUESTAS * DIA;
}

export function debeInvitar(cuentaCreada: Date, ultima: Date | null, ahora: Date): boolean {
  return puedeResponder(ultima, ahora) && ahora.getTime() - cuentaCreada.getTime() >= DIAS_DE_USO_PARA_INVITAR * DIA;
}
