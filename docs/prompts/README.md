# Los prompts del Tutor: cómo se arman y qué ha cambiado

> Primer paso del **laboratorio de prompts** (P41, `PLAN_TUTOR_Y_ASISTENTE.md`): que cada cambio a lo que le decimos al
> Tutor quede escrito, con su porqué. Pedido por Jeider el 31/10/2026.

## Cómo funciona: el prompt es dinámico

El Tutor **no tiene un prompt fijo**. En cada mensaje, `src/tutor/tutor-context.service.ts` (`buildSystemPrompt`) lo arma con
piezas que entran o no según dónde está el estudiante:

| Pieza | Entra cuando | Dónde está |
|---|---|---|
| Identidad y nivel del estudiante en el tema | siempre | `buildSystemPrompt` |
| Dónde está: lección, ejercicio, enunciado, código, última prueba | según la pantalla | `buildSystemPrompt` (el servidor pone la lección y el enunciado; el navegador, el código) |
| Últimos progresos | siempre que haya | `buildSystemPrompt` |
| Nivel de ayuda (pista, pregunta guía, guía paso a paso) | solo dentro de un ejercicio | `tutor-guidance.ts` |
| Refuerzo asignado por el docente | solo si el ejercicio está en un refuerzo | `buildSystemPrompt` |
| Proyecto propio | solo en un proyecto | `buildSystemPrompt` |
| **Ejercicio de completar huecos** | `tipoEjercicio = completar` | `completarSection` |
| **Ejercicio de programar** | hay código en pantalla y no es completar | `programarSection` |
| Estilo del docente (equilibrado, directo…) | si el docente lo configuró | `tutor-settings.ts` |
| Reglas pedagógicas (13) | siempre | `buildSystemPrompt` |
| Señales (error probable, confianza, modo por pasos) | si el navegador las manda | `tutor-senales.ts` |

Además, en un ejercicio de completar, **al mensaje del estudiante se le agrega** un dato corto con los huecos vacíos y lo
escrito (`tutor-huecos.ts`). Va ahí, y no en el prompt, porque lo último que lee el modelo pesa más que el historial.

**Tamaño (31/10, versión 9):** entre ~1.440 tokens (leyendo una lección) y ~1.850 (ejercicio de completar), sin contar la
lección ni el historial. Lo que más tarda en una respuesta es lo que el modelo escribe y piensa, no estos tokens; aun así,
cada regla nueva diluye a las demás: **al agregar una instrucción, buscar otra que se pueda quitar o unir.**

## Instantáneas: ver qué cambió

`docs/prompts/instantaneas/` guarda el prompt **ya armado** para tres situaciones (leyendo una lección, ejercicio de completar,
ejercicio de programar), con datos de ejemplo. Las genera la prueba `src/tutor/tutor-prompt-registro.spec.ts`:

- Si alguien cambia el prompt sin actualizarlas, la prueba falla.
- Para actualizarlas a propósito: `UPDATE_PROMPTS=1 npx jest src/tutor/tutor-prompt-registro`.
- Al verlas en un commit se ve, línea por línea, qué cambió exactamente.

## Cómo cambiar el prompt (la receta)

1. Cambiar el texto en `tutor-context.service.ts` (o `tutor-guidance.ts`).
2. Subir `VERSION_PROMPT_TUTOR` en `tutor-context.service.ts`.
3. Añadir una fila abajo, en el historial: fecha, qué cambió y **por qué** (qué vio quien probó).
4. Regenerar las instantáneas (comando de arriba) y correr `npm test`.
5. El servidor escribe la versión en su registro junto al tiempo de cada respuesta:
   `Tutor en vivo: … respondió en 900 ms (primer trozo a los 700 ms; prompt v10 · 2026-10-31)`.

## Historial de versiones

| Versión | Qué cambió | Por qué (quién lo vio y qué pasó) |
|---|---|---|
| v1 · 2026-10-28 | Una pregunta de concepto («¿qué es una variable?») se explica **primero y de una vez**; en su ejercicio, se guía sin dar la solución y sin responder solo con preguntas. | Jeider, probando como estudiante: el Tutor respondía con preguntas antes de explicar, y eso enreda al principiante. |
| v2 · 2026-10-28 | Tras explicar, cierra con **una** comprobación (pregunta ligera o práctica de 1 o 2 líneas). «Estoy perdido» deja las preguntas y explica con otro ejemplo, más simple. | Jeider: «como un buen tutor», como el modo estudio de ChatGPT o el aprendizaje guiado de Gemini. |
| v3 · 2026-10-29 | El ejemplo de un concepto **no reutiliza** los nombres ni los datos del ejercicio; nunca se escribe la línea o fórmula que resuelve el ejercicio. | En «Completa la presentación», «¿qué es una variable?» dio `let edad = 19;` (el hueco del ejercicio), y «no sé cómo sacar el perímetro» dio `2 * (base + altura)`. |
| v4 · 2026-10-29 | El cierre es una práctica o pregunta **concreta**, nunca un ofrecimiento («¿te gustaría practicar o repasar la teoría?»). La regla 11 queda solo para cuando un concepto ya quedó claro. | El Tutor cerraba con el ofrecimiento: dejaba la decisión al estudiante y no comprobaba nada. La regla 11 lo pedía. |
| v5 · 2026-10-29 | Nueva pieza para **ejercicios de completar**: la pantalla manda la plantilla y el Tutor sabe que es de huecos, sin leer entrada ni escribir un programa. | En «Completa la presentación» habló de leer la entrada con `lineas[0]`: no veía la plantilla y se inventó el programa. |
| v6 · 2026-10-30 | Cada hueco escrito llega al Tutor (antes solo con todos llenos). Un hueco vacío nunca está bien; lo escrito se juzga contra el enunciado. | Con un hueco escrito y otro vacío, preguntó «¿está bien?» y el Tutor dijo «perfecto» sin ver nada. |
| v7 · 2026-10-30 | Lo que escribió el estudiante llega entre ⟦ ⟧; todo lo demás es plantilla fija y nunca se le pide cambiarlo. | Con los dos huecos bien, le pidió cambiar el `let` de la edad, que era texto de la plantilla. |
| v8 · 2026-10-31 | La pantalla **manda sobre el historial** del chat; el estado de los huecos va también en el mensaje del estudiante (`tutor-huecos.ts`). | Con el hueco vacío dijo «tienes `const`, es correcto» por lo que se había dicho antes en el chat: una regla del prompt no bastó, un dato en el mensaje sí. |
| v9 · 2026-10-31 | Se acortan las reglas más largas (explicar un concepto, lenguaje sencillo, datos internos, sugerencia, recurso que no carga): **−15 %** de tokens, sin cambiar lo que piden. | Jeider: «cada palabra más afecta; queremos prompts precisos y eficientes». |
| v10 · 2026-10-31 | En ejercicios de programar, el Tutor sabe dónde se ve el resultado de «Probar código» (pestaña «Casos de prueba») y, si el estudiante no sabe mostrar algo en pantalla, le explica `console.log` antes de seguir corrigiendo. | Jeider en «Saludo personalizado»: no sabía que hacía falta `console.log`, ni dónde se mostraba el resultado, y el Tutor solo le fue corrigiendo línea por línea durante diez mensajes. |
| v11 · 2026-10-31 | La señal «leer la entrada» le dice al Tutor que `leerTexto()` y `leerNumero()` dan la siguiente línea cada vez que se llaman (con `lineas`, la posición). | Los ejercicios básicos ya no traen `lineas` (juez con funciones de lectura listas): el Tutor no debe mandar al estudiante a `lineas[0]`. |

## Lo que sigue (P41)

- Casos de oro: preguntas y situaciones fijas con el resultado esperado, para comparar versiones con ejemplos y no a ojo.
- Mover cada pieza a su propio archivo (`src/tutor/prompts/`), con la misma receta.
- Lo mismo para el Asistente del docente, cuando exista.
