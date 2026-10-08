// Guía para que el docente arme un buen ejercicio de programar (08/10, Jeider: «guiar al docente para que haga unos
// ejercicios buenos»). Revisa en vivo lo que ya escribió y dice qué falta, sin bloquear: la herramienta es flexible y el
// docente decide. Cada punto viene de lo que se aprendió en la prueba del equipo (un estudiante que todavía no sabe
// JavaScript necesita un ejemplo, una plantilla que ya lea la entrada y casos que le digan qué revisar).

export interface CasoGuia { input: string; expected: string; isPublic: boolean }
export interface PuntoGuia { ok: boolean; texto: string; porque: string }

export function revisarEjercicioCodigo(e: { enunciado: string; plantilla: string; casos: CasoGuia[] }): PuntoGuia[] {
  const enunciado = e.enunciado.trim()
  const plantilla = e.plantilla.trim()
  const llenos = e.casos.filter((c) => c.input.trim() !== '' || c.expected.trim() !== '')
  const publicos = llenos.filter((c) => c.isPublic)
  const ocultos = llenos.filter((c) => !c.isPublic)
  return [
    {
      ok: /ejemplo|`[^`]+`|```/i.test(enunciado),
      texto: 'El enunciado trae un ejemplo: qué entra y qué debe salir',
      porque: 'Con un ejemplo el estudiante puede hacerlo primero a mano; los pasos que ve en su pantalla salen de él.',
    },
    {
      ok: /readFileSync|\blineas\b|\binput\b|prompt\(/.test(plantilla),
      texto: 'La plantilla ya lee la entrada',
      porque: 'Quien empieza no sabe leer datos en JavaScript: así se concentra en el algoritmo. Ej.: const lineas = require(\'fs\').readFileSync(0, \'utf8\').trim().split(\'\\n\');',
    },
    {
      ok: plantilla !== '' && !/console\.log\s*\(\s*[^)\s]/.test(plantilla),
      texto: 'La plantilla deja el trabajo al estudiante',
      porque: 'Que no traiga el console.log con la respuesta; un comentario como «// Escribe el resultado con console.log» basta.',
    },
    {
      ok: publicos.length >= 1 && publicos.every((c) => c.expected.trim() !== ''),
      texto: 'Al menos un caso público, con su salida esperada',
      porque: 'Es el que el estudiante prueba con «Probar código» (sin gastar intentos) y el que le muestra qué cambia.',
    },
    {
      ok: ocultos.length >= 1,
      texto: 'Al menos un caso oculto con un valor límite',
      porque: 'Comprueba que entendió y no solo copió el ejemplo: 0, negativos, un texto con espacios o con tildes.',
    },
    {
      ok: llenos.length > 0 && llenos.every((c) => c.expected === c.expected.trimEnd()),
      texto: 'Las salidas esperadas no terminan en espacio',
      porque: 'Un espacio invisible al final hace fallar una solución correcta y frustra.',
    },
  ]
}

/** Consejos fijos para el enunciado (no se revisan solos). */
export const CONSEJOS_EJERCICIO_CODIGO = [
  'Una sola idea por ejercicio: si pide leer, calcular y decidir, divídelo en dos.',
  'Pide la salida exacta y dila completa en el enunciado (mayúsculas, espacios, puntos).',
  'Del más fácil al más difícil: primero uno básico de la lección, después el intermedio.',
]
