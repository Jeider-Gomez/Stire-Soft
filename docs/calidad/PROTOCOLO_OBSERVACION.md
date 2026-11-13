# Protocolo de observación de la prueba con usuarios finales

Este protocolo dice **cómo se observa** a cada persona en la prueba con usuarios finales. La logística (a quién buscar,
fechas, tareas y hoja) está en [`PRUEBA_CON_PERSONAS.md`](PRUEBA_CON_PERSONAS.md); este documento la completa con el
método, para que los cinco observadores registren lo mismo y los datos sirvan en el artículo.

## 1. Lo que pidió el profesor

Este protocolo no inventa un método: junta lo que el profesor Toscano pidió en cuatro lugares.

| Fuente | Lo que pide | Dónde se cumple aquí |
|---|---|---|
| Audio del 20/10 | **Observar qué hace la persona con la herramienta**; el observador mira y anota, no enseña. **Unas 10 personas reales** (amigos, primos; no tiene que ser en un colegio): no es exhaustivo, pero alcanza para sacar conclusiones | §3, §4 y §6 |
| [Lista de chequeo Pressman](../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx), ítem «Prototipado validado y métricas de usabilidad» | **Regla de los 5 usuarios** (Nielsen), **índice SUS** y un documento con los resultados de las pruebas que **justifique los ajustes de la interfaz** | §4 (dos grupos de 5), §6 (SUS) y §9 (informe) |
| [Cronograma del curso](../curso-ddse3/guias/Cronograma_DDSE3_2026-2.docx), Reto 5 | «Pruebas con usuarios, depuración y reporte de validación»; semana del 9 al 14 de noviembre | §9 y fecha en [`PRUEBA_CON_PERSONAS.md`](PRUEBA_CON_PERSONAS.md) |
| [Plantilla IMRyD V2](../curso-ddse3/guias/Plantilla_Articulo_IMRyD_V2.docx) | En Metodología: enfoque, diseño, participantes y herramientas; en el caso de validación, tablas y las fórmulas de las métricas | §3 a §5 y §9 |

Los resultados van al **artículo de implementación y evaluación**, del que se escriben primero el resumen y los
resultados (audio del 20/10).

**Enfoque, para la Metodología del artículo:** mixto. Cuantitativo (tareas logradas, tiempos, errores y SUS) y
cualitativo (lo que la persona dice en voz alta y las tres preguntas finales).

## 2. Qué se quiere saber

| # | Pregunta de observación | Tareas que la responden |
|---|---|---|
| P1 | ¿Una persona nueva logra entrar y unirse a una clase sin ayuda? | T1, T2 |
| P2 | ¿Entiende la lección y el primer ejercicio sin que nadie le explique? | T3, T4 |
| P3 | Cuando se equivoca al programar, ¿entiende el mensaje y lo arregla? | T5 |
| P4 | ¿Busca al Tutor, lo encuentra y le sirve sin que le dé la solución? | T6 |
| P5 | ¿Entiende cómo va y qué tiene que repasar? | T7, T8 |

## 3. Tipo de observación

- **Directa y no participante:** el observador está al lado, mira la pantalla y anota. No toca el equipo de la persona.
- **Pensando en voz alta:** se le pide a la persona que diga lo que piensa mientras usa STIRE. Si se queda callada más de
  30 segundos, el observador solo pregunta «¿qué estás pensando?».
- **Sin ayuda:** el observador no explica, no señala ni dice «ahí está». Ver la regla de ayuda en el §6.
- **Un observador por persona.** Si va un segundo integrante, solo toma el tiempo; no habla.

## 4. Participantes

- 10 personas: **2 por integrante** (5 que no saben programar y 5 de primero a tercer semestre de la Licenciatura en
  Informática), según [`PRUEBA_CON_PERSONAS.md`](PRUEBA_CON_PERSONAS.md). Son **dos grupos de 5**, así que cada perfil
  cumple por sí solo la regla de los 5 usuarios que pide la lista de chequeo del profesor.
- Mayores de 18 años, que no hayan usado STIRE y que no sean del equipo.
- Cada persona se identifica solo con un código: `INICIALES-1`, `INICIALES-2` (por ejemplo `JOSE-1`).

## 5. Materiales

- Celular o computador de la persona, con internet. Se anota cuál y el navegador.
- El código de una clase del observador con el curso de Fundamentos.
- La hoja de observación (§8), impresa o en un documento, y un reloj o cronómetro.
- Si la persona acepta: grabación **solo de la pantalla**, nunca de la cara.

## 6. Procedimiento (unos 40 minutos)

| Momento | Minutos | Qué hace el observador |
|---|---|---|
| 1. Bienvenida y consentimiento | 5 | Explica que se prueba STIRE y no a la persona, que su nombre no aparece, que puede parar cuando quiera y que la pantalla solo se graba si dice que sí. Texto completo: `docs/legal/CONSENTIMIENTO_INVESTIGACION.md`. |
| 2. Datos de la persona | 2 | Edad, carrera y semestre, si sabe programar (nada, un poco, sí) y el equipo que usa. |
| 3. Práctica de voz alta | 1 | «Mientras usas la aplicación, dime en voz alta lo que piensas, lo que buscas y lo que esperas que pase». |
| 4. Tareas T1 a T8 | 25 | Lee cada tarea **tal cual** (§7), arranca el tiempo, observa y anota con los códigos del §8. |
| 5. Encuesta SUS | 3 | La persona responde la encuesta de STIRE. Se anota el puntaje que muestra al final. |
| 6. Tres preguntas | 4 | ¿Qué fue lo más confuso? ¿Qué te gustó? ¿Lo usarías para aprender a programar? ¿Por qué? |

**Regla de ayuda:**
1. Si la persona lleva **2 minutos** sin avanzar, el observador pregunta «¿qué estás buscando?».
2. Si después de **1 minuto** más sigue igual, le da **una sola pista** («mira el menú de la izquierda») y la tarea queda
   «con ayuda».
3. Si con la pista no lo logra en **2 minutos**, se pasa a la siguiente tarea y queda «no la logró». Si la tarea
   siguiente depende de esa, el observador la deja lista sin explicar y lo anota.

## 7. Tareas y cuándo se cuentan como logradas

| # | Tarea (se lee tal cual) | Se logró cuando… |
|---|---|---|
| T1 | Crea tu cuenta en https://stire-soft.vercel.app | Entra a su inicio con la cuenta nueva. |
| T2 | Únete a la clase con este código: (el de tu clase) | Ve la clase en su inicio. |
| T3 | Abre la primera lección y léela hasta el final | Llega al final de la lección. |
| T4 | Resuelve el primer ejercicio que te proponga STIRE | Entrega y STIRE lo da por bueno. |
| T5 | Resuelve un ejercicio de programar. Si te equivocas, intenta arreglarlo | Entrega una solución que pasa los casos. |
| T6 | Pide ayuda al Tutor con ese ejercicio | Abre el Tutor y recibe una respuesta, o entiende qué necesita para usarlo (la clave de Google). |
| T7 | Abre «Mi progreso» y dime con tus palabras cómo vas | Lo encuentra y lo explica con sus palabras sin equivocarse. |
| T8 | Busca qué tienes que repasar hoy | Encuentra sus repasos o entiende que no tiene ninguno. |

## 8. Qué se anota: los códigos

Durante cada tarea el observador anota **lo que ve**, no lo que interpreta. Cada anotación lleva el minuto, un código y,
si la persona habló, sus palabras entre comillas.

| Código | Significa | Ejemplo |
|---|---|---|
| **D** | Duda: se queda quieta o vuelve atrás más de 10 segundos | «D 03:20 vuelve al inicio sin saber dónde está la clase» |
| **E** | Error: hace algo que no la lleva a la tarea | «E 05:10 toca "Perfil" buscando la lección» |
| **R** | Se recupera sola de un error | «R 05:40 vuelve y encuentra "Lecciones"» |
| **P** | Pregunta o pide ayuda | «P "¿esto es para escribir el código?"» |
| **A** | El observador ayudó (según la regla del §6) | «A 07:00 pista: el menú de la izquierda» |
| **+** | Comentario o gesto positivo | «+ "ah, qué bueno que me dice dónde está el error"» |
| **−** | Comentario o gesto de frustración | «− "no entiendo qué me pide"» |

### La hoja de cada persona

Se sube a `docs/calidad/prueba-personas/` con el código como nombre (por ejemplo `JOSE-1.md`). Sin nombres, correos ni
fotos de la cara.

```markdown
# JOSE-1 · <fecha> · <celular o computador> · <navegador>

Edad: · Carrera y semestre: · ¿Sabe programar? (nada / un poco / sí):
Observador: · ¿Grabación de pantalla? (sí / no):

| Tarea | Resultado (sola / con ayuda / no) | Tiempo (mm:ss) | Errores (E) | Anotaciones con código |
|---|---|---|---|---|
| T1 Crear cuenta | | | | |
| T2 Unirse a la clase | | | | |
| T3 Leer la lección | | | | |
| T4 Primer ejercicio | | | | |
| T5 Ejercicio de programar | | | | |
| T6 Tutor | | | | |
| T7 Mi progreso | | | | |
| T8 Repasos | | | | |

Puntaje del SUS:
1. Lo más confuso:
2. Lo que le gustó:
3. ¿Lo usaría? ¿Por qué?

Problemas que vi (uno por línea, con la tarea y la gravedad 1, 2 o 3):
-
```

**Gravedad de cada problema:**
- **3 · Bloquea:** no pudo terminar la tarea, o solo con ayuda.
- **2 · Demora:** la terminó sola, pero con errores o dudas largas.
- **1 · Molesta:** la terminó sin problema, pero lo comentó o se frustró.

## 9. Cómo se analizan los datos

Jeider junta las 10 hojas en `docs/calidad/prueba-personas/INFORME.md` con:

1. **Por tarea:** cuántas personas la lograron solas, con ayuda o no la lograron, y el tiempo mediano.
2. **Errores:** el promedio de errores por tarea.
3. **SUS:** el promedio y la mediana, leídos con los rangos de aceptabilidad (Brooke, 1996; Bangor, Kortum y Miller,
   2008), y comparados entre quienes saben programar y quienes no.
4. **Problemas:** la lista de problemas, juntando los que son el mismo, ordenada por cuántas personas lo vivieron y por
   su gravedad. Cada problema lleva la heurística que incumple (Nielsen, 1994) y una frase textual de una persona.
5. **Respuesta a las preguntas P1 a P5** del §2, en una o dos frases cada una.
6. **Ajustes:** qué se cambió en la interfaz por cada problema de gravedad 3 y 2, con su commit. Es la parte del
   «reporte de validación» que pide el Reto 5.

**Fórmulas (para el caso de validación del artículo):**

- Tasa de éxito de la tarea *t*: $E_t = \dfrac{\text{personas que la lograron solas}}{\text{personas que la intentaron}} \times 100$.
  Aparte se reporta cuántas la lograron con ayuda.
- Puntaje SUS de una persona (Brooke, 1996), con las respuestas $r_1 \dots r_{10}$ de 1 a 5:
  $SUS = 2{,}5 \left[ \sum_{i \in \{1,3,5,7,9\}} (r_i - 1) + \sum_{i \in \{2,4,6,8,10\}} (5 - r_i) \right]$.
  STIRE ya lo calcula al final de la encuesta.
- Errores por tarea: $\bar{e}_t = \dfrac{\text{total de códigos E en la tarea } t}{\text{personas que la intentaron}}$.

Esos resultados van al apartado de **Resultados** del artículo de implementación y evaluación, y los problemas de
gravedad 3 y 2 entran a [`../PENDIENTES.md`](../PENDIENTES.md).

## 10. Cuidado de las personas

- Autorización antes de empezar, con el texto de `docs/legal/CONSENTIMIENTO_INVESTIGACION.md`.
- Solo códigos en las hojas y el informe; nunca nombres, correos ni caras.
- La persona puede parar cuando quiera, sin dar razones.
- La grabación, si la hubo, se borra cuando el informe esté listo.
