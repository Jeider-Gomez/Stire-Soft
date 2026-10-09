// Qué tan fuerte es la clave al registrarse (JEIDER-S08-12, 09/10: «era más dinámica antes, con colores y una barra que
// se llenaba; ahora solo marca listo»). Las 4 reglas son las mismas que exige el servidor
// (src/common/validators/password-complexity.ts) y siempre se ven; la barra suma lo que la hace más difícil de adivinar:
// el largo y mezclar números con símbolos. Color Y texto: el color solo no basta (WCAG 1.4.1).

export interface ReglaClave { texto: string; cumple: boolean }
export interface FuerzaClave { nivel: 0 | 1 | 2 | 3 | 4; texto: string; consejo: string }

export function reglasDeClave(clave: string): ReglaClave[] {
  return [
    { texto: '6 o más caracteres', cumple: clave.length >= 6 },
    { texto: 'Una mayúscula', cumple: /[A-Z]/.test(clave) },
    { texto: 'Una minúscula', cumple: /[a-z]/.test(clave) },
    { texto: 'Un número o un símbolo', cumple: /[\d\W]/.test(clave) },
  ]
}

export function fuerzaDeClave(clave: string): FuerzaClave {
  if (!clave) return { nivel: 0, texto: '', consejo: '' }
  const reglas = reglasDeClave(clave)
  if (!reglas.every((r) => r.cumple)) {
    const faltan = reglas.filter((r) => !r.cumple).length
    return { nivel: 1, texto: 'Débil', consejo: faltan === 1 ? 'Le falta 1 regla.' : `Le faltan ${faltan} reglas.` }
  }
  const extra = (clave.length >= 10 ? 1 : 0) + (/\d/.test(clave) && /[^\w\s]/.test(clave) ? 1 : 0)
  if (extra === 0) return { nivel: 2, texto: 'Aceptable', consejo: 'Ya sirve. Con 10 o más caracteres, o con un número y un símbolo, es más fuerte.' }
  if (extra === 1) return { nivel: 3, texto: 'Buena', consejo: clave.length >= 10 ? 'Con un número y un símbolo, queda fuerte.' : 'Con 10 o más caracteres, queda fuerte.' }
  return { nivel: 4, texto: 'Fuerte', consejo: 'Difícil de adivinar.' }
}
