import { GRUPO_ERROR, type TipoError } from './perfil-aprendizaje';

/**
 * «Errores que más se repiten esta semana» en «Hoy» del docente (MOD-02; propuesta de Pedro, 19/10: «identificar rápidamente
 * las dificultades comunes del grupo y diferenciar los errores conceptuales de los de escritura, para decidir cuáles requieren
 * una explicación adicional en clase y cuáles pueden trabajarse mediante práctica»). Usa la misma clasificación que el perfil
 * de cada estudiante (perfil-aprendizaje.ts) y dice quién tiene cada error, para ir a su ficha o armarle un refuerzo.
 * Función pura.
 */

/** Cada error en palabras del docente (el perfil le habla al estudiante; aquí se habla del grupo). */
export const ERROR_PARA_DOCENTE: Partial<Record<TipoError, { nombre: string; detalle: string }>> = {
  concatena: { nombre: 'Juntan números como texto', detalle: 'Operan con lo que leen de la entrada sin convertirlo a número: «5» + «3» da «53».' },
  'por-uno': { nombre: 'Se pasan o se quedan cortos por 1', detalle: 'Casi siempre es dónde empieza o termina un ciclo (< o <=).' },
  nan: { nombre: 'Operan con algo que no es número', detalle: 'Falta convertir con Number(...) o leen la posición equivocada de la entrada.' },
  indefinido: { nombre: 'Usan un dato que no existe', detalle: 'Leen una línea de la entrada que no está, como lineas[1] cuando hay una sola.' },
  eco: { nombre: 'Repiten la entrada sin procesarla', detalle: 'Muestran lo mismo que reciben: falta el paso que lo procesa.' },
  vacia: { nombre: 'No muestran el resultado', detalle: 'Falta el console.log o el programa no llega a esa línea.' },
  redondeo: { nombre: 'Decimales o redondeo', detalle: 'El número sale cercano pero no igual: la división, los decimales o el redondeo.' },
  numero: { nombre: 'Otra operación u otro orden', detalle: 'El resultado es otro número: falta, sobra o está en otro orden una operación.' },
  sintaxis: { nombre: 'Sintaxis', detalle: 'Paréntesis, llaves o comillas sin cerrar, o un signo de más.' },
  'no-existe': { nombre: 'Nombres mal escritos', detalle: 'Usan una variable o función con otro nombre del que declararon.' },
  espacios: { nombre: 'Espacios y saltos de línea', detalle: 'La salida tiene espacios o líneas de más o de menos.' },
  mayusculas: { nombre: 'Mayúsculas', detalle: 'La salida cambia mayúsculas por minúsculas o al revés.' },
  puntuacion: { nombre: 'Puntuación', detalle: 'La salida tiene puntos, comas o signos distintos a los pedidos.' },
};

/** Un error cuenta como «se repite» desde 2 entregas, igual que en el perfil del estudiante. */
export const MIN_ENTREGAS = 2;

export interface FalloDeLaClase { tipo: TipoError; studentId: number; entregaId: string; unitId: number }

export interface ErrorDeLaClase {
  tipo: TipoError;
  nombre: string;
  detalle: string;
  /** En cuántas entregas apareció (una entrega con varios casos fallidos por lo mismo cuenta una vez). */
  entregas: number;
  /** Quiénes lo tienen, primero quien más veces. */
  estudiantes: Array<{ studentId: number; nombre: string; veces: number }>;
  /** Lecciones donde apareció, para armar el refuerzo con ellas. */
  lecciones: number[];
}

export interface ErroresDeLaSemana {
  /** Para explicar en clase: confusiones de fondo. */
  concepto: ErrorDeLaClase[];
  /** Se corrigen practicando: descuidos al escribir. */
  escritura: ErrorDeLaClase[];
}

export function erroresDeLaClase(fallos: FalloDeLaClase[], nombres: Map<number, string>): ErroresDeLaSemana {
  const porTipo = new Map<TipoError, { entregas: Set<string>; porEstudiante: Map<number, Set<string>>; lecciones: Set<number> }>();
  for (const f of fallos) {
    if (GRUPO_ERROR[f.tipo] === 'otro' || !ERROR_PARA_DOCENTE[f.tipo]) continue;
    const t = porTipo.get(f.tipo) ?? { entregas: new Set<string>(), porEstudiante: new Map<number, Set<string>>(), lecciones: new Set<number>() };
    t.entregas.add(f.entregaId);
    t.porEstudiante.set(f.studentId, (t.porEstudiante.get(f.studentId) ?? new Set<string>()).add(f.entregaId));
    t.lecciones.add(f.unitId);
    porTipo.set(f.tipo, t);
  }
  const errores: ErrorDeLaClase[] = [...porTipo]
    .filter(([, t]) => t.entregas.size >= MIN_ENTREGAS)
    .map(([tipo, t]) => ({
      tipo,
      nombre: ERROR_PARA_DOCENTE[tipo]!.nombre,
      detalle: ERROR_PARA_DOCENTE[tipo]!.detalle,
      entregas: t.entregas.size,
      estudiantes: [...t.porEstudiante]
        .map(([studentId, e]) => ({ studentId, nombre: nombres.get(studentId) ?? '—', veces: e.size }))
        .sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre, 'es')),
      lecciones: [...t.lecciones],
    }))
    // Primero lo que afecta a más estudiantes: eso es lo que vale la pena llevar a la clase.
    .sort((a, b) => b.estudiantes.length - a.estudiantes.length || b.entregas - a.entregas);
  return {
    concepto: errores.filter((e) => GRUPO_ERROR[e.tipo] === 'concepto'),
    escritura: errores.filter((e) => GRUPO_ERROR[e.tipo] === 'escritura'),
  };
}
