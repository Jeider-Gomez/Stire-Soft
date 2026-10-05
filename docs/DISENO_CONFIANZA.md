---
estado: vigente (04/10/2026)
criterio: META-02 de la lista de Sistemas Tutores Inteligentes (Caro, 2015) — juicios metacognitivos y calibración
pedido del dueño: «en juicios de confianza definitivamente debemos mejorar; que de verdad sea útil pedagógicamente»
---

# Juicio de confianza y calibración

## 1. Qué había y qué faltaba

Antes de la primera entrega de cada ejercicio STIRE preguntaba «¿Qué tan seguro estás?» y, al calificar, decía si el juicio
coincidió. Pero **el juicio no se guardaba**: vivía en la pantalla y se perdía al salir. Ni el estudiante ni el docente
podían ver, con el tiempo, si la seguridad del estudiante coincide con sus resultados. Eso es justo lo que enseña:
un solo contraste se olvida; un patrón («cuando digo seguro, acierto 2 de 5») cambia la forma de estudiar.

## 2. Qué dice la evidencia

| Hallazgo | Fuente | Qué tomamos |
|---|---|---|
| Ejercicios de monitoreo **con retroalimentación**, repetidos, mejoran la precisión del juicio, el rendimiento y la autoeficacia. | Nietfeld, Cao y Osborne (2006) | Mostrar la calibración **acumulada**, no solo la de una entrega. |
| La calibración se puede medir con índices simples (exactitud, sesgo) y conviene distinguir **sobreconfianza** de **subconfianza**. | Schraw (2009) | Dos lecturas distintas, con una regla explicable (no un índice opaco). |
| Los errores cometidos **con mucha seguridad** se corrigen y recuerdan **mejor** si se da retroalimentación: la sorpresa atrae la atención (efecto de hipercorrección). | Butterfield y Metcalfe (2001) | «Estabas seguro y no acertó» se presenta como **el error que más enseña**, invitando a mirar la diferencia caso por caso. |

## 3. Qué hace STIRE ahora

- **Se guarda** el juicio de la primera entrega de cada ejercicio (`submissions.confianza`: seguro, dudo o adivino; nulo si
  lo omitió). Se sigue preguntando solo la primera vez, y se puede omitir: preguntarlo siempre lo vuelve rutina.
- **«Mi calibración: ¿sé cuándo sé?»** en Mi progreso: cuántas veces acertó con cada nivel («Estoy seguro: acertaste 4 de 5»)
  y **una** lectura con **una** acción:

  | Lectura | Regla (desde 5 juicios) | Acción que se propone |
  |---|---|---|
  | Sobreconfianza | Con «seguro» acierta menos del 60 % (3 o más juicios de ese nivel) | Antes de entregar, inventar un caso y **predecir** qué debe mostrar el programa; si no puede, todavía no está seguro |
  | Subconfianza | Con «dudo» o «adivino» acierta el 70 % o más | Fijarse en lo que hizo bien; puede pasar a ejercicios de nivel más alto |
  | Calibrado | Lo demás | Seguir diciendo qué tan seguro está |
  | Pocos datos | Menos de 5 juicios | Explica cómo se llena |

  La sobreconfianza pesa más: es la ilusión de saber, la que hace dejar de practicar.
- **El docente** ve la misma calibración en la ficha del estudiante, con una lectura para ayudarlo («Pídele que prediga la
  salida de un caso antes de entregar»).
- **El Tutor** ya recibía la calibración de la entrega (`src/tutor/tutor-senales.ts`) y orienta su pregunta con ella.
- La pregunta es concreta: «¿qué tan seguro estás de que **pasa todos los casos**?». Un juicio sobre algo preciso es más
  fácil de calibrar que uno vago.

## 4. Lo que cumple de META-02 y lo que no copia

El criterio pide juicios antes o después de responder, el contraste entre confianza y resultado, y que el tutor elija sus
tácticas con eso. Los tres se cumplen. El ejemplo de la lista (un deslizador antes de **cada** envío) no se copia, por la
fricción; se pregunta en el primer envío de cada ejercicio y la calibración se acumula.

## 5. Dónde está

`src/analytics/calibracion.ts` (reglas, con prueba), `GET /analytics/student/:id/calibracion`,
`src/migrations/1792200000000-ConfianzaEntrega.ts`, `frontend-nuxt/utils/confianza.ts`,
`components/estudiante/MiCalibracion.vue`, `components/JuicioConfianza.vue`. Base teórica: BT-30.

## Referencias

- Butterfield, B. y Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 27*(6), 1491-1494. https://doi.org/10.1037/0278-7393.27.6.1491
- Nietfeld, J. L., Cao, L. y Osborne, J. W. (2006). The effect of distributed monitoring exercises and feedback on performance, monitoring accuracy, and self-efficacy. *Metacognition and Learning, 1*(2), 159-179. https://doi.org/10.1007/s10409-006-9595-6
- Schraw, G. (2009). A conceptual analysis of five measures of metacognitive monitoring. *Metacognition and Learning, 4*(1), 33-45. https://doi.org/10.1007/s11409-008-9031-3
