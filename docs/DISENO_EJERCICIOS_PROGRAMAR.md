# Ejercicios de programar que enseñan: qué ve el estudiante y cómo se le ayuda al docente

> 10/10/2026 · Origen: la prueba de Jeider en «Área y perímetro de un rectángulo» (Fundamentos, Operadores y
> expresiones). Entrada de la tesis: BT-44 en `investigacion/BASE_TEORICA.md`.

## 1. Lo que pasó

Jeider, licenciado y con la materia vista, no pudo resolver un ejercicio básico. Su código:

```js
const base = Number(lineas[3]);    // la base era 3: confundió la posición con el valor
const altura = Number(lineas[4]);
let area = base * altura
let perimetro = 2 * area           // error de concepto
const resultado = area + /* tu cálculo */;   // copiado de los pasos: no es JavaScript válido
```

| Lo que vio | Por qué |
|---|---|
| No sabía qué había en `lineas` | La tarjeta del caso no mostraba la entrada; tras «Probar código» el título decía «Ejemplo 1». |
| Copió código inválido | Los pasos eran una receta única con `const resultado = /* tu cálculo */;`, y el ejercicio pedía dos salidas. |
| «La primera diferencia está en la línea 1» | La pista comparaba salidas; no reconocía un `SyntaxError` ni sabía su línea. |
| «Salida esperada: 12 14» | Eran dos líneas, pero se mostraban juntas. |
| El Tutor dijo «¡Exacto!» | Veía el código, pero no el enunciado ni el resultado de la prueba. |

Ninguno de estos es un error del estudiante. Son de diseño: la pantalla no le dio lo que necesitaba para empezar.

## 2. Qué hacen los referentes

**Plataformas** (observación de cada producto; no son citas para la tesis):

| Plataforma | Lo que hace que funcione |
|---|---|
| Codecademy | Instrucciones numeradas a la izquierda; cada una se marca con ✓ cuando el código la cumple; una pista por instrucción; la solución solo si se pide. |
| freeCodeCamp | Cientos de pasos diminutos; cada paso tiene una sola prueba y, si falla, un mensaje que dice qué falta. |
| Khan Academy | Primero se ve a alguien programar y explicar; los retos van por pasos; los errores los explica un personaje en lenguaje sencillo. |
| CS50 (Harvard) | El «pato» de IA conoce el ejercicio y no da la solución; las pruebas dicen qué esperaban y qué recibieron. |
| Exercism | Pruebas con nombres que se leen como frases; mentoría humana sobre el código. |

**Investigación** (verificada en Crossref):

| Idea | Qué dice | Fuente |
|---|---|---|
| Predecir antes de escribir | Leer, predecir y ejecutar un programa antes de modificarlo y luego crear uno propio mejora a quien empieza (PRIMM: predecir, ejecutar, investigar, modificar, crear). | Sentance, Waite y Kallia (2019) |
| Usar, modificar, crear | Primero se usa un programa hecho, después se cambia, al final se crea. | Lee et al. (2011) |
| Submetas con nombre | Partir el procedimiento en pasos con una etiqueta que dice para qué sirve cada uno mejora la resolución de problemas nuevos. | Margulieux y Catrambone (2016) |
| Retirar la ayuda poco a poco | Del ejemplo resuelto al problema propio, completando cada vez más partes. | Renkl y Atkinson (2003) |
| Problemas de Parsons | Ordenar líneas ya escritas es más rápido que escribir desde cero, con aprendizaje comparable. | Ericson et al. (2022) |
| Mensajes de error mejorados | Explicar el error en lenguaje claro bajó los errores repetidos en un curso inicial (la evidencia posterior es mixta). | Becker (2016) |
| Tutor de IA que guía | Un asistente que conoce el curso y no entrega la solución. | Liu et al. (2024) |

## 3. Principios para STIRE

1. **Antes de escribir, ver.** El estudiante ve qué recibe su programa (`lineas[0]` = "3") y qué debe salir, línea por línea.
2. **Una meta por cosa que se pide**, con su ✓ cuando ya sale bien. Nunca una receta genérica que no encaje.
3. **El código de ejemplo siempre funciona** si se pega. Un ejemplo roto enseña un error.
4. **Cada error dice dónde y qué revisar**, en palabras de estudiante, sin dar la solución.
5. **El Tutor ve lo mismo que el estudiante**: el enunciado, su código y el resultado de su última prueba.
6. **La ayuda se va retirando**: básico es completar, intermedio es un esqueleto, avanzado es la hoja en blanco.
7. **El docente decide** (herramienta flexible): todo lo que se le propone es opcional y editable.

## 4. Hecho el 10/10 (fase A, sin pedirle nada al docente)

| Qué | Dónde |
|---|---|
| El error dice su línea: `SyntaxError: … (línea 8)` | `src/judge-engine/hardened-process-sandbox.adapter.ts` (`limpiarErrorDelEstudiante`) |
| La pista explica `SyntaxError`, variable que no existe, `undefined`, `NaN` y `const`, y recuerda que `lineas[0]` es la primera línea | `frontend-nuxt/utils/diagnosticoSalida.ts` |
| Pasos: «Lo que recibe tu programa» con cada posición de `lineas`; una meta por línea de la salida con ✓/✗ tras probar; código de ejemplo válido | `frontend-nuxt/utils/pasosCodigo.ts`, `components/exercise/PasosCodigo.vue` |
| La tarjeta del caso muestra «Entra», «Debe salir» y «Lo que mostró tu código» respetando los saltos de línea; la entrada ya no se pierde al probar | `components/exercise/CasoPrueba.vue`, `stores/workspace.ts` |
| El Tutor recibe el enunciado (lo busca el servidor) y el resultado de la última prueba; no felicita un programa que no puede funcionar | `src/tutor/tutor.service.ts`, `tutor-context.service.ts`, `frontend-nuxt/utils/contextoTutor.ts` |
| Se mide cuánto tarda cada respuesta del Tutor (registro del servidor) | `src/tutor/tutor.service.ts` |
| **«Lo que vas a usar»**: los conceptos de JavaScript que pide el ejercicio (leer la entrada, convertir a número, operaciones, división entera, armar un texto, varias líneas, if, for), cada uno con una frase y un ejemplo de OTRO problema, y el enlace para repasar la lección. Se deducen del enunciado, la plantilla y el ejemplo: el docente no hace nada | `frontend-nuxt/utils/conceptosEjercicio.ts`, `components/exercise/ConceptosEjercicio.vue` |
| Cada pista de error dice **qué repasar** y muestra su ejemplo | `utils/diagnosticoSalida.ts` (`repasar`), `components/exercise/CasoPrueba.vue` |
| **Tutor para quien empieza a programar**: un problema a la vez (primero lo que impide que el programa arranque), dice la línea, explica el concepto con un ejemplo de otro problema si el estudiante no sabe JavaScript, termina con una sola acción; recibe los conceptos del ejercicio; con un ejercicio abierto lee menos de la lección (responde antes) | `src/tutor/tutor-context.service.ts`, `tutor-senales.ts`, `tutor-guidance.ts`, `tutor.service.ts` |

## 5. Propuesta para el docente (fase B, en espera)

> **Decisión de Jeider (10/10):** primero mejorar lo que ya existe en el ejercicio y en el Tutor, no agregar funciones
> nuevas al docente. B4 («si sale ___, dile ___») se descarta por exagerada. Lo demás queda como idea para después de
> la prueba.

Todo opcional: si el docente no lo usa, el ejercicio sigue funcionando como hoy, con los pasos automáticos.

| # | Qué | Cómo se ve para el docente | Por qué |
|---|---|---|---|
| B1 | **Pasos propios del ejercicio** | Un campo «Pasos para el estudiante» con 2 a 5 frases cortas (p. ej. «Calcula el área», «Calcula el perímetro», «Muestra cada uno en su línea»). La guía los propone a partir de la salida, y él los edita. | Submetas con nombre (Margulieux y Catrambone, 2016); Codecademy. |
| B2 | **Salida esperada de varias líneas** | El campo pasa de una línea a un área de texto, con una vista «así lo verá el estudiante». | Hoy escribir `12` y `14` en dos líneas es incómodo. |
| B3 | **Comprobar con la solución** | Pega su solución (no la ve el estudiante) y el servidor la corre contra todos los casos antes de publicar. Si un caso no coincide, avisa. | Evita ejercicios con una salida esperada equivocada, que frustran sin culpa del estudiante. |
| B4 | **Errores comunes con su pista** | «Si sale ___, dile ___» (p. ej. «si sale 34 → estás uniendo textos: convierte con Number»). | Retroalimentación específica, como los mensajes de freeCodeCamp. |
| B5 | **Plantilla según el nivel** | La guía sugiere: básico, la plantilla trae una parte resuelta para imitar; intermedio, solo comentarios; avanzado, solo la lectura de la entrada. | Retirar la ayuda (Renkl y Atkinson, 2003). |
| B6 | **Orden de la lección** | La guía de lección sugiere, antes del primer ejercicio de programar: uno de opción múltiple que pide predecir qué muestra un programa, uno de ordenar líneas y uno de completar código. Los tres tipos ya existen. | PRIMM; problemas de Parsons; usar → modificar → crear. |
| B7 | **Vista previa como estudiante** | Botón «Ver como estudiante» antes de publicar. | El docente ve lo que vio Jeider. |

Orden sugerido: B2 y B3 (corrigen errores), después B1 y B4 (lo que más ayuda al estudiante), al final B5 a B7 (guía).

## 6. El Tutor: más rápido sin perder calidad

| Medida | Efecto | Estado |
|---|---|---|
| Medir cuánto tarda cada respuesta, por modelo | Saber dónde se va el tiempo antes de cambiar nada | Hecho (registro del servidor) |
| Enunciado y resultado de la prueba en el contexto | Más acertado; casi no suma tiempo | Hecho |
| Respuesta en streaming (el texto aparece mientras se escribe) | La espera percibida baja de ~10 s a 1 o 2 s, sin cambiar el modelo ni cuánto piensa | Propuesto. Exige revisar la barrera anti-solución bloque por bloque. |
| Si el primer modelo no responde en ~8 s, pasar al siguiente (hoy 15 s cada uno, hasta 4 modelos) | Evita esperas de casi un minuto | Propuesto |
| Lección más corta cuando hay un ejercicio abierto (hoy hasta 3000 caracteres) | Menos texto que leer en cada mensaje | Propuesto |

Pensar menos (`thinkingLevel: low`) no está en la lista: Jeider pidió explícitamente no bajar la calidad. Gemini 3.8 Flash ya usa
`medium` por defecto.
