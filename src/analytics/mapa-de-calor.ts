/**
 * Mapa de calor del docente (paso 6; docs/investigacion/REFERENTES_PLATAFORMAS_Y_STI.md §9, pilar 4). Función pura:
 * recibe las unidades de la clase, sus estudiantes, su progreso y sus entregas calificadas, y devuelve la matriz
 * estudiantes × unidades y cuatro listas que responden «¿a quién ayudo ahora?». Cada regla tiene su caso en
 * `mapa-de-calor.spec.ts`.
 */

export interface UnidadDelMapa { id: number; title: string; sectionTitle: string }
export interface EstudianteDelMapa { id: number; fullName: string }
export interface ProgresoDelMapa { studentId: number; learningUnitId: number; mastery: number; status: string; entryConfidence: number | null }
export interface EntregaDelMapa {
  studentId: number;
  activityId: number;
  learningUnitId: number;
  /** Aprobó según el porcentaje de aprobación de su actividad. */
  aprobada: boolean;
  fecha: Date;
}

export interface CeldaDelMapa {
  studentId: number;
  unitId: number;
  mastery: number;
  status: string;
  /** Respuesta a «¿Cómo te sientes con este tema?» (1, 2 o 3); null si no respondió. */
  confianza: number | null;
  entregas: number;
}

export interface MapaDeCalor {
  unidades: UnidadDelMapa[];
  estudiantes: EstudianteDelMapa[];
  celdas: CeldaDelMapa[];
  /** Tres o más entregas falladas seguidas en una unidad, la última en los últimos 7 días. */
  bloqueados: Array<{ studentId: number; fullName: string; unitId: number; unitTitle: string; fallosSeguidos: number }>;
  /** Unidades con menor dominio promedio (entre quienes ya las trabajaron); desempate: más entregas por acierto. */
  temasDificiles: Array<{ unitId: number; unitTitle: string; dominioPromedio: number; entregasPorAcierto: number | null; estudiantes: number }>;
  /**
   * Dominio de 85 % o más en todas las unidades que ya trabajó (al menos 3) y más del 90 % de sus ejercicios acertados al
   * primer intento (la «zona justa» del recomendador, docs/DISENO_PRACTICA_ADAPTATIVA.md §3.3 regla 6). Sin lo segundo,
   * quien reintenta hasta aprobar también salía «listo»: el dominio cuenta la mejor nota.
   */
  listosParaMas: Array<{ studentId: number; fullName: string; unidades: number; dominioMinimo: number; aciertoAlPrimerIntento: number }>;
  /** Dijo «Me siento seguro» y falló el primer intento de algún ejercicio de esa unidad: posible idea equivocada. */
  segurosQueFallan: Array<{ studentId: number; fullName: string; unitId: number; unitTitle: string; fallosAlPrimerIntento: number }>;
}

export const FALLOS_PARA_BLOQUEO = 3;
export const DIAS_BLOQUEO = 7;
export const DOMINIO_LISTO = 85;
export const UNIDADES_MINIMAS_LISTO = 3;
/** Porcentaje de ejercicios acertados al primer intento por encima del cual está «listo para más». */
export const PRIMER_INTENTO_LISTO = 90;
const CONFIANZA_SEGURO = 3;
const MAX_TEMAS_DIFICILES = 3;

export function construirMapaDeCalor(entrada: {
  unidades: UnidadDelMapa[];
  estudiantes: EstudianteDelMapa[];
  progresos: ProgresoDelMapa[];
  entregas: EntregaDelMapa[];
  ahora: Date;
}): MapaDeCalor {
  const { unidades, estudiantes, ahora } = entrada;
  const idsUnidad = new Set(unidades.map((u) => u.id));
  const idsEstudiante = new Set(estudiantes.map((e) => e.id));
  const nombre = new Map(estudiantes.map((e) => [e.id, e.fullName]));
  const titulo = new Map(unidades.map((u) => [u.id, u.title]));
  // Solo lo de esta clase: un estudiante puede tener progreso en unidades de otras clases.
  const progresos = entrada.progresos.filter((p) => idsUnidad.has(p.learningUnitId) && idsEstudiante.has(p.studentId));
  const entregas = entrada.entregas
    .filter((e) => idsUnidad.has(e.learningUnitId) && idsEstudiante.has(e.studentId))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  const clave = (s: number, u: number) => `${s}|${u}`;
  const entregasPorCelda = new Map<string, EntregaDelMapa[]>();
  for (const e of entregas) {
    const k = clave(e.studentId, e.learningUnitId);
    entregasPorCelda.set(k, [...(entregasPorCelda.get(k) ?? []), e]);
  }

  const celdas: CeldaDelMapa[] = progresos.map((p) => ({
    studentId: p.studentId,
    unitId: p.learningUnitId,
    mastery: Math.round(p.mastery),
    status: p.status,
    confianza: p.entryConfidence,
    entregas: entregasPorCelda.get(clave(p.studentId, p.learningUnitId))?.length ?? 0,
  }));

  const bloqueados: MapaDeCalor['bloqueados'] = [];
  const segurosQueFallan: MapaDeCalor['segurosQueFallan'] = [];
  const limiteBloqueo = ahora.getTime() - DIAS_BLOQUEO * 24 * 60 * 60 * 1000;
  for (const [k, lista] of entregasPorCelda) {
    const [studentId, unitId] = k.split('|').map(Number);
    let seguidos = 0;
    for (let i = lista.length - 1; i >= 0 && !lista[i].aprobada; i--) seguidos++;
    if (seguidos >= FALLOS_PARA_BLOQUEO && lista[lista.length - 1].fecha.getTime() >= limiteBloqueo) {
      bloqueados.push({ studentId, fullName: nombre.get(studentId) ?? '—', unitId, unitTitle: titulo.get(unitId) ?? '—', fallosSeguidos: seguidos });
    }

    const progreso = progresos.find((p) => p.studentId === studentId && p.learningUnitId === unitId);
    if (progreso?.entryConfidence === CONFIANZA_SEGURO) {
      const primeros = new Map<number, EntregaDelMapa>();
      for (const e of lista) if (!primeros.has(e.activityId)) primeros.set(e.activityId, e);
      const fallos = [...primeros.values()].filter((e) => !e.aprobada).length;
      if (fallos > 0) {
        segurosQueFallan.push({ studentId, fullName: nombre.get(studentId) ?? '—', unitId, unitTitle: titulo.get(unitId) ?? '—', fallosAlPrimerIntento: fallos });
      }
    }
  }
  bloqueados.sort((a, b) => b.fallosSeguidos - a.fallosSeguidos);
  segurosQueFallan.sort((a, b) => b.fallosAlPrimerIntento - a.fallosAlPrimerIntento);

  const temasDificiles: MapaDeCalor['temasDificiles'] = unidades
    .map((u) => {
      const deUnidad = celdas.filter((c) => c.unitId === u.id && c.entregas > 0);
      if (deUnidad.length === 0) return null;
      const suyas = entregas.filter((e) => e.learningUnitId === u.id);
      const aciertos = suyas.filter((e) => e.aprobada).length;
      return {
        unitId: u.id,
        unitTitle: u.title,
        dominioPromedio: Math.round(deUnidad.reduce((s, c) => s + c.mastery, 0) / deUnidad.length),
        entregasPorAcierto: aciertos > 0 ? Math.round((suyas.length / aciertos) * 10) / 10 : null,
        estudiantes: deUnidad.length,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)
    // Sin ningún acierto cuenta como lo más difícil (un número grande, no Infinity: Infinity - Infinity da NaN).
    .sort((a, b) => a.dominioPromedio - b.dominioPromedio || (b.entregasPorAcierto ?? 1e9) - (a.entregasPorAcierto ?? 1e9))
    .slice(0, MAX_TEMAS_DIFICILES);

  const listosParaMas: MapaDeCalor['listosParaMas'] = estudiantes
    .map((e) => {
      const suyas = celdas.filter((c) => c.studentId === e.id && c.entregas > 0);
      const minimo = suyas.length > 0 ? Math.min(...suyas.map((c) => c.mastery)) : 0;
      const primeros = new Map<number, boolean>();
      for (const en of entregas) if (en.studentId === e.id && !primeros.has(en.activityId)) primeros.set(en.activityId, en.aprobada);
      const acierto = primeros.size > 0 ? Math.round(([...primeros.values()].filter(Boolean).length / primeros.size) * 100) : 0;
      return { studentId: e.id, fullName: e.fullName, unidades: suyas.length, dominioMinimo: minimo, aciertoAlPrimerIntento: acierto };
    })
    .filter((l) => l.unidades >= UNIDADES_MINIMAS_LISTO && l.dominioMinimo >= DOMINIO_LISTO && l.aciertoAlPrimerIntento > PRIMER_INTENTO_LISTO)
    .sort((a, b) => b.unidades - a.unidades || b.dominioMinimo - a.dominioMinimo);

  return { unidades, estudiantes, celdas, bloqueados, temasDificiles, listosParaMas, segurosQueFallan };
}
