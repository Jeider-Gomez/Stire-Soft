/**
 * Número con su palabra en singular o plural: «1 día», «3 días».
 * Las pantallas decían «1 días» y «1 administradores».
 */
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}
