/**
 * Estadísticas de un estudiante al estilo de Anki (docs/DISENO_INTERVENCION_DOCENTE.md §10.3): calendario de actividad,
 * próximos repasos, estado de las lecciones (con «dominio firme» como las tarjetas maduras de Anki) y retención.
 * Función pura: el servicio le pasa los datos ya leídos.
 */
import { diaDe } from '../common/utils/dia-colombia';

/** Umbral de «dominada», el mismo del cálculo de estados (learning-progress.service.ts). */
export const DOMINADO = 85;
/** Un repaso a 21 días o más es un dominio firme, como las tarjetas «maduras» de Anki. */
export const DIAS_FIRME = 21;
export const SEMANAS_CALENDARIO = 16;
export const DIAS_PRONOSTICO = 14;
export const DIAS_RETENCION = 30;
/** Los días se cuentan en la hora de Colombia, no en la del servidor. */
export { diaDe };

function sumarDias(dia: string, n: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface DatosEstadisticas {
  /** Ejercicios entregados (calificados), con si aprobaron y si fueron repaso. */
  envios: Array<{ fecha: Date; aprobado: boolean; esRepaso: boolean }>;
  /** Calendario de repasos de las lecciones de la clase. */
  repasos: Array<{ learningUnitId: number; nextReviewDate: Date; intervalDays: number }>;
  /** Progreso de las lecciones de la clase que ya trabajó. */
  progresos: Array<{ learningUnitId: number; mastery: number }>;
  /** Todas las lecciones publicadas de la clase. */
  lecciones: number[];
  ahora: Date;
}

export function construirEstadisticas(d: DatosEstadisticas) {
  const hoy = diaDe(d.ahora);

  // Calendario: 16 semanas completas que terminan hoy, con los ejercicios de cada día.
  const totalDias = SEMANAS_CALENDARIO * 7;
  const primero = sumarDias(hoy, -(totalDias - 1));
  const porDia = new Map<string, number>();
  for (const e of d.envios) {
    const dia = diaDe(e.fecha);
    if (dia >= primero && dia <= hoy) porDia.set(dia, (porDia.get(dia) ?? 0) + 1);
  }
  const calendario = Array.from({ length: totalDias }, (_, i) => {
    const dia = sumarDias(primero, i);
    return { dia, ejercicios: porDia.get(dia) ?? 0 };
  });
  const diasActivos = calendario.filter((c) => c.ejercicios > 0).length;

  // Pronóstico: cuántos repasos tocan cada uno de los próximos 14 días; lo vencido se suma a hoy.
  const lecciones = new Set(d.lecciones);
  const repasos = d.repasos.filter((r) => lecciones.has(r.learningUnitId));
  const pronostico = Array.from({ length: DIAS_PRONOSTICO }, (_, i) => ({ dia: sumarDias(hoy, i), repasos: 0 }));
  let vencidos = 0;
  for (const r of repasos) {
    const dia = diaDe(r.nextReviewDate);
    if (dia < hoy) {
      vencidos++;
      pronostico[0].repasos++;
    } else {
      const i = pronostico.findIndex((p) => p.dia === dia);
      if (i >= 0) pronostico[i].repasos++;
    }
  }

  // Estado de las lecciones: sin empezar, en práctica, dominada reciente y dominada firme (repaso a 21 días o más).
  const intervalo = new Map(repasos.map((r) => [r.learningUnitId, r.intervalDays]));
  const progreso = new Map(d.progresos.filter((p) => lecciones.has(p.learningUnitId)).map((p) => [p.learningUnitId, p.mastery]));
  const estado = { sinEmpezar: 0, enPractica: 0, dominadaReciente: 0, dominadaFirme: 0 };
  for (const id of lecciones) {
    const m = progreso.get(id);
    if (m === undefined) estado.sinEmpezar++;
    else if (m < DOMINADO) estado.enPractica++;
    else if ((intervalo.get(id) ?? 0) >= DIAS_FIRME) estado.dominadaFirme++;
    else estado.dominadaReciente++;
  }

  // Retención: de los repasos de los últimos 30 días, cuántos aprobó (la «retención real» de Anki).
  const desde = sumarDias(hoy, -(DIAS_RETENCION - 1));
  const repasosHechos = d.envios.filter((e) => e.esRepaso && diaDe(e.fecha) >= desde);
  const aprobados = repasosHechos.filter((e) => e.aprobado).length;

  return {
    hoy,
    calendario,
    diasActivos,
    pronostico,
    vencidos,
    lecciones: { total: lecciones.size, ...estado },
    retencion: {
      repasos: repasosHechos.length,
      aprobados,
      porcentaje: repasosHechos.length ? Math.round((aprobados / repasosHechos.length) * 100) : null,
    },
  };
}
