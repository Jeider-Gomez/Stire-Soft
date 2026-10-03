// Ofrecer el Tutor justo cuando el estudiante falla (02/10). En Khan Academy casi nadie abría a Khanmigo desde un ícono en
// la esquina; por eso lo están llevando al momento del error. Aquí se ofrece, no se impone: el estudiante decide si lo
// abre y puede cerrar la oferta.

/** Tras «Probar código»: se ofrece si terminó de correr y algún caso público falló. */
export function debeOfrecerTutor(casos: ReadonlyArray<{ passed?: boolean }>, corriendo: boolean, cerrada: boolean): boolean {
  return !corriendo && !cerrada && casos.some((c) => c.passed === false)
}

/** La pista rápida que se pide: en código, por qué no sale lo esperado; en lo demás, la idea que hay detrás. */
export function pistaSegunTipo(tipo: string | undefined): 'parada' | 'conceptual' {
  return tipo === 'coding' || tipo === 'html_css' ? 'parada' : 'conceptual'
}
