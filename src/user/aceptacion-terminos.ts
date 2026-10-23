/**
 * Público de STIRE: personas de 18 años o más (decisión del 22/10/2026, docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md).
 * La API de Gemini exige 18 años o más y prohíbe servicios que probablemente usen menores, y el Decreto 1377 de 2013
 * (art. 12) pide la autorización del acudiente para tratar datos de menores. Por eso, al registrarse, cada persona
 * confirma su mayoría de edad y acepta los términos y la política de datos; la participación en la investigación es
 * aparte y opcional. Se guarda la versión aceptada y la fecha como prueba (Decreto 1377, arts. 7 y 8).
 */

/** Versión vigente de los términos y la política (frontend-nuxt/utils/legal.ts debe decir la misma). */
export const VERSION_TERMINOS = '2026-10-22';

export interface DecisionTerminos {
  confirmaMayorDeEdad: boolean;
  aceptaTerminos: boolean;
  consienteInvestigacion?: boolean;
}

export interface CamposAceptacion {
  mayorDeEdadConfirmadoEn: Date;
  terminosVersion: string;
  terminosAceptadosEn: Date;
  investigacionConsentida?: boolean;
  investigacionDecididaEn?: Date;
}

/** Lo que se guarda en el usuario al aceptar. Sin las dos confirmaciones no hay aceptación (el silencio no autoriza). */
export function camposDeAceptacion(decision: DecisionTerminos, ahora: Date): CamposAceptacion | null {
  if (decision.confirmaMayorDeEdad !== true || decision.aceptaTerminos !== true) return null;
  const campos: CamposAceptacion = {
    mayorDeEdadConfirmadoEn: ahora,
    terminosVersion: VERSION_TERMINOS,
    terminosAceptadosEn: ahora,
  };
  if (typeof decision.consienteInvestigacion === 'boolean') {
    campos.investigacionConsentida = decision.consienteInvestigacion;
    campos.investigacionDecididaEn = ahora;
  }
  return campos;
}

/** ¿Aceptó la versión vigente? Si los términos cambian, se vuelven a pedir. */
export function terminosAlDia(user: { terminosVersion?: string | null; mayorDeEdadConfirmadoEn?: Date | null }): boolean {
  return user.terminosVersion === VERSION_TERMINOS && !!user.mayorDeEdadConfirmadoEn;
}

/** El Tutor con Gemini solo para quien confirmó tener 18 años o más. */
export const MENSAJE_SIN_MAYORIA_DE_EDAD =
  'Para usar el Tutor con IA debes confirmar que tienes 18 años o más y aceptar los términos de STIRE.';
