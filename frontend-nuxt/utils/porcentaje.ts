/** «97 %»: entero y con espacio, como se escribe en español. El servidor manda decimales (97.36) que no aportan nada. */
export function porcentaje(valor: number | null | undefined): string {
  return typeof valor === 'number' && Number.isFinite(valor) ? `${Math.round(valor)} %` : '—'
}
