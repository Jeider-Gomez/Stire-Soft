# Hallazgos de José en la prueba de la semana 8 (05 – 07/10/2026)

José probó STIRE como estudiante de Fundamentos de Algoritmia (tarjeta S08-E01 de Trello: la Unidad 1, sus 6 lecciones,
en computador y celular). Respondió las tres preguntas de la prueba el 05/10, subió siete capturas (lecciones 1 a 6 y el
plan del curso) y el 07/10 mandó, por medio de Jeider, sus observaciones sobre las notificaciones. Aquí queda cada
hallazgo con lo que se decidió, su estado y dónde está el cambio. Sus capturas están en la tarjeta S08-E01.

| ID | Lo que encontró (en sus palabras, resumido) | Decisión | Estado |
|---|---|---|---|
| JOSE-S08-1 | **La pantalla del ejercicio tiene demasiado a la vez:** enunciado y casos de prueba, editor, consola y Tutor «compitiendo por la atención» de quien apenas aprende a descomponer un problema. Propone el Tutor y las reglas como paneles flotantes o plegables. | El Tutor ya es un botón flotante abajo a la derecha (03/10, `fdb5b4a`). Ahora el enunciado y los casos se pliegan con «Plegar» y se vuelven a abrir con «Ver el enunciado»; el editor ocupa el resto y la elección se recuerda. | **Hecho** (07/10, «el enunciado del ejercicio se puede plegar») |
| JOSE-S08-2 | **Las métricas de progreso del inicio no resaltan:** con más contraste, estudiante y docente verían más rápido dónde se estanca alguien. | Es de su territorio (colores y jerarquía visual). Queda como su tarea de identidad, con la regla de que el color nunca sea la única señal. | **Pendiente (José)** |
| JOSE-S08-3 | **Las notificaciones no dejan leer el texto completo**, sobre todo en el celular. | La campana muestra todo el texto, ocupa el ancho del celular, tiene un ícono por tipo y lleva a donde se resuelve cada aviso. | **Hecho** (07/10, `85f9dce`) |
| JOSE-S08-4 | **Llega una notificación por cada ejercicio**; propone avisar al llegar al 50, 75 y 100 % de dominio. | Jeider: «no saturar al estudiante; notificar lo importante». Se avisa el avance **por módulo** al 50, 75 y 100 % de lecciones dominadas, una vez por hito. El resultado de cada ejercicio ya no se notifica, porque lo dice la pantalla del ejercicio. | **Hecho** (07/10, `85f9dce`) |
| JOSE-S08-5 | **Al fallar, que la retroalimentación quede en la notificación**, para tenerla también fuera del ejercicio. | Una notificación por cada fallo volvería a saturar. Al tercer fallo seguido en una lección (cuando STIRE ya propone parar), llega **una** sugerencia de qué hacer que lleva a la lección, una vez por racha. | **Hecho** (07/10, `85f9dce`) |
| JOSE-S08-6 | **¿Lo usarías? «Definitivamente».** El dominio continuo, los intentos y la confianza antes de entregar sirven como datos para modelos que anticipen el rendimiento. | Idea para la tesis (`docs/investigacion/`), no para esta versión. | **Registrado** |

## Qué le llega ahora al estudiante (y qué ya no)

| Le llega | Ya no le llega |
|---|---|
| Su avance por módulo: 50 %, 75 % y 100 % de lecciones dominadas | Un aviso por cada ejercicio calificado |
| Una sugerencia cuando se atasca en una lección (una vez por racha) | Un aviso por cada cambio de estado de una lección («¡En marcha!», «¡Gran avance!»…) |
| Un solo aviso al día con sus repasos pendientes | Un aviso por cada repaso vencido |
| La revisión de una entrega (nota y comentario), una nota del libro, un mensaje y los avisos de la clase | — |

Las reglas están en `src/notifications/notificacion-reglas.ts`, con sus pruebas en `notifications.service.spec.ts`.

## Relacionado

- Hallazgos anteriores de José sobre el Tutor: [`docs/material-visual/01-tutor-ia/HALLAZGOS.md`](../../material-visual/01-tutor-ia/HALLAZGOS.md)
  (tarjetas de sugerencia con aspecto de botón, corregido el 03/10 en `b7e979d`).
- Prueba del equipo: [`PRUEBA_DOS_SEMANAS.md`](../PRUEBA_DOS_SEMANAS.md).
