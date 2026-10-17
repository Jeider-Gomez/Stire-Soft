/**
 * En qué orden se prueban los modelos de Gemini (17/10, registro del servidor: una respuesta tardó unos 30 s porque los
 * dos primeros modelos se cayeron por tiempo de espera, 15 s cada uno, y solo el tercero respondió en 0,9 s). Antes el
 * orden era fijo y cada pregunta volvía a esperar a los mismos modelos caídos. Ahora:
 * - el último modelo que respondió va primero;
 * - un modelo que se cae (tiempo de espera, red o error 5xx) pasa al final durante `castigoMs`.
 * Lo que depende de la clave del estudiante (cuota, clave inválida) no castiga al modelo: es de esa clave, no del modelo.
 */
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
