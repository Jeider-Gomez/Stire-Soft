// Calibración del juicio de confianza (META-02 de la lista de Sistemas Tutores, Caro 2015; docs/DISENO_CONFIANZA.md).
// Antes de la primera entrega de cada ejercicio el estudiante dice qué tan seguro está; aquí se contrasta, con el
// tiempo, lo que dijo con lo que obtuvo. Ver la propia calibración con retroalimentación mejora la precisión del
// monitoreo (Nietfeld, Cao y Osborne, 2006). Reglas simples y explicables, no un índice opaco.

export const NIVELES_CONFIANZA = ['seguro', 'dudo', 'adivino'] as const;
export type NivelConfianza = (typeof NIVELES_CONFIANZA)[number];

export interface JuicioCalificado {
  confianza: NivelConfianza;
  acerto: boolean;
}

export type Sesgo = 'pocos-datos' | 'sobreconfianza' | 'subconfianza' | 'calibrado';

export interface ResumenCalibracion {
  total: number;
  porNivel: Record<NivelConfianza, { total: number; aciertos: number }>;
  sesgo: Sesgo;
}

/** Desde cuántos juicios se dice algo (con menos, una sola entrega cambiaría el mensaje). */
export const MINIMO_JUICIOS = 5;
/** Con «seguro» se espera acertar casi siempre; por debajo de esto, la seguridad no está respaldada. */
export const UMBRAL_SEGURO = 0.6;
/** Con «dudo» o «adivino» se espera fallar a menudo; si acierta tanto, sabe más de lo que cree. */
export const UMBRAL_DUDA = 0.7;
/** Cuántos juicios de un tipo hacen falta para decir algo de ese tipo. */
const MINIMO_POR_NIVEL = 3;

export function esNivelConfianza(v: unknown): v is NivelConfianza {
  return typeof v === 'string' && (NIVELES_CONFIANZA as readonly string[]).includes(v);
}

export function resumirCalibracion(juicios: JuicioCalificado[]): ResumenCalibracion {
  const porNivel = { seguro: { total: 0, aciertos: 0 }, dudo: { total: 0, aciertos: 0 }, adivino: { total: 0, aciertos: 0 } };
  for (const j of juicios) {
    porNivel[j.confianza].total++;
    if (j.acerto) porNivel[j.confianza].aciertos++;
  }
  const total = juicios.length;
  const dudas = { total: porNivel.dudo.total + porNivel.adivino.total, aciertos: porNivel.dudo.aciertos + porNivel.adivino.aciertos };

  let sesgo: Sesgo = 'pocos-datos';
  if (total >= MINIMO_JUICIOS) {
    // Primero la sobreconfianza: es la ilusión de saber, la que más daño hace al estudiar (deja de practicar lo que cree
    // dominar).
    if (porNivel.seguro.total >= MINIMO_POR_NIVEL && porNivel.seguro.aciertos / porNivel.seguro.total < UMBRAL_SEGURO) sesgo = 'sobreconfianza';
    else if (dudas.total >= MINIMO_POR_NIVEL && dudas.aciertos / dudas.total >= UMBRAL_DUDA) sesgo = 'subconfianza';
    else sesgo = 'calibrado';
  }
  return { total, porNivel, sesgo };
}
