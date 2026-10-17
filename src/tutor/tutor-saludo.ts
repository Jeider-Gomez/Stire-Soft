const SALUDOS_SEGUN_HORA = ['¡Buenos días!', '¡Buenas tardes!', '¡Buenas noches!'] as const;

/**
 * Buenos días, tardes o noches según la hora de Colombia. El servidor corre en UTC: a las 2 p. m. de Colombia son las
 * 7 p. m. en UTC y el Tutor decía «¡Buenas noches!» (02/10).
 */
export function saludoSegunHora(ahora: Date = new Date()): string {
  const hora = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', hour: 'numeric', hourCycle: 'h23' }).format(ahora));
  if (hora < 12) return SALUDOS_SEGUN_HORA[0];
  if (hora < 19) return SALUDOS_SEGUN_HORA[1];
  return SALUDOS_SEGUN_HORA[2];
}

export function esSaludo(texto: string): boolean {
  return SALUDOS_SEGUN_HORA.some((s) => texto.startsWith(s));
}
