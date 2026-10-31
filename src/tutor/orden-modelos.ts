/**
 * En qué orden se prueban los modelos de Gemini (17/10, registro del servidor: una respuesta tardó unos 30 s porque los
 * dos primeros modelos se cayeron por tiempo de espera, 15 s cada uno, y solo el tercero respondió en 0,9 s). Antes el
 * orden era fijo y cada pregunta volvía a esperar a los mismos modelos caídos. Ahora:
 * - el último modelo que respondió va primero;
 * - un modelo que se cae (tiempo de espera, red o error 5xx) pasa al final durante `castigoMs`.
 * Lo que depende de la clave del estudiante (cuota, clave inválida) no castiga al modelo: es de esa clave, no del modelo.
 */
/** El modelo que responde en menos de un segundo (31/10, registro del servidor: tras cada despliegue la primera pregunta esperaba 30 s a los otros dos). */
export const MODELO_RAPIDO = 'gemini-3.5-flash-lite';

/** Los modelos en el orden inicial: el rápido primero, luego el configurado y los demás. Sin repetir y sin el prefijo «models/». */
export function modelosCandidatos(configurado: string): string[] {
  return Array.from(new Set([MODELO_RAPIDO, configurado, 'gemini-flash-latest', 'gemini-3.8-flash'].map((m) => m.replace(/^models\//, ''))));
}

export class OrdenDeModelos {
  private ultimoQueRespondio: string | null = null;
  private readonly castigadoHasta = new Map<string, number>();

  constructor(private readonly castigoMs = 10 * 60 * 1000) {}

  orden(candidatos: string[], ahora = Date.now()): string[] {
    const disponibles = candidatos.filter((m) => (this.castigadoHasta.get(m) ?? 0) <= ahora);
    const castigados = candidatos.filter((m) => !disponibles.includes(m));
    const primero = this.ultimoQueRespondio && disponibles.includes(this.ultimoQueRespondio) ? [this.ultimoQueRespondio] : [];
    return [...primero, ...disponibles.filter((m) => !primero.includes(m)), ...castigados];
  }

  respondio(modelo: string): void {
    this.ultimoQueRespondio = modelo;
    this.castigadoHasta.delete(modelo);
  }

  fallo(modelo: string, ahora = Date.now()): void {
    this.castigadoHasta.set(modelo, ahora + this.castigoMs);
    if (this.ultimoQueRespondio === modelo) this.ultimoQueRespondio = null;
  }
}
