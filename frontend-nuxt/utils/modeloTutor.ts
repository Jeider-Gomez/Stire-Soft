// El nombre del modelo del Tutor en palabras (José, UX-04, 09/10: «gemini-flash-latest» y otros términos técnicos en
// inglés en Administración). El nombre técnico queda en el título, para quien lo necesite.

export function nombreModelo(modelo: string | null | undefined): string {
  if (!modelo) return '—'
  const m = modelo.toLowerCase()
  const version = /(\d+(?:\.\d+)?)/.exec(m)?.[1]
  const tipo = m.includes('flash-lite') ? 'ligero' : m.includes('flash') ? 'rápido' : m.includes('pro') ? 'avanzado' : null
  if (!m.includes('gemini')) return modelo
  return `Gemini${version ? ` ${version}` : ''}${tipo ? ` (modelo ${tipo})` : ''}`
}
