# Plan de la segunda versión de STIRE (v2.0.0) con las listas de chequeo del profesor

> **Estado:** aprobado por Jeider el 04/10/2026, con sus cambios.
> **Punto de partida:** revisión del «antes» ([`2026-10-04_antes/`](2026-10-04_antes/)): interfaz **20/32 (62,5 %)** y
> Sistemas Tutores Inteligentes **14/24 (58,3 %)**.
> **Entrega:** la v2.0.0 se presenta al profesor el **martes 06/10/2026**, con la revisión del «después» ya verificada
> por el equipo.

## 1. El principio: cumplir la intención, no el ejemplo

Cada criterio de las dos listas trae una intención (por qué importa) y un ejemplo (una forma de hacerlo). STIRE cumple
**la intención**. Copia el ejemplo solo cuando es la mejor manera de lograrla. Si un ejemplo, aplicado tal cual, le
quitaría libertad al estudiante o al docente, metería fricción o no tiene respaldo en la evidencia, se hace una versión
mejor y se explica por qué en la revisión. Esto sigue dos decisiones que ya tomamos: STIRE es **una herramienta flexible
que ayuda, no que limita**, y **cada decisión de diseño tiene respaldo teórico** (`docs/investigacion/BASE_TEORICA.md`).

| Ítem | El ejemplo de la lista | El problema de aplicarlo tal cual | Lo que hace STIRE |
|---|---|---|---|
| **UI-01, MOD-02** | Diagnosticar el estilo Felder-Silverman y mostrar a cada uno «su» formato | No hay evidencia de que adaptar el formato al «estilo» mejore el aprendizaje (Pashler et al., 2008; Kirschner, 2017). Además encasilla al estudiante. | La lección ofrece el algoritmo en **texto, diagrama de flujo y código**. El estudiante cambia de formato y STIRE **recuerda cuál prefiere**: adapta según lo que elige, no según una etiqueta. |
| **UI-02** | Bloquear temas al estudiante «secuencial» hasta que apruebe | Bloquear por perfil quita libertad para repasar o adelantarse. | **Bloqueo suave por módulo**, igual para todos. El módulo siguiente se abre con un dominio razonable del anterior (50 % por defecto). Se avisa antes y se muestra cuánto falta. El **reto** abre antes a quien ya sabe. El docente cambia el umbral o lo apaga. Dentro del módulo la navegación es libre. |
| **META-02** | Un deslizador de confianza antes de **cada** envío | Si se pregunta siempre, se vuelve fricción y se contesta sin pensar. | Se pregunta «¿Qué tan seguro estás?» en el primer envío de cada ejercicio, y se puede omitir. Al calificar, STIRE muestra la calibración. El Tutor la usa: si el estudiante estaba muy seguro y falló, le pregunta más; si dudaba y acertó, refuerza su confianza. |
| **UI-05** | Atenuar la pantalla y cambiar a «modo guiado» tras 3 fallos | Interrumpe y quita el control. | La pausa tras 3 fallos ya existe y avisa al docente. Se agrega **«Resolverlo por pasos con el Tutor»**, que divide el problema en subpreguntas. Se ofrece, no se impone. |
| **UI-04** | Recomendación por pares con k-NN | Con 5 a 30 estudiantes por clase, la proximidad entre perfiles es ruido. | **«¿Te sirvió esta explicación? Sí / No»** al final de cada lección. Con «No», el Tutor la explica de otra forma. El docente ve qué lecciones no se entienden y las mejora: **el curso se mejora con el uso**. La recomendación por pares usa una regla que sirve con pocos datos y solo aparece cuando hay datos suficientes. |

**Sobre «No Aplica»:** la escala del profesor solo acepta NA si se acuerda con él. No se marca ningún NA por cuenta
propia: las adaptaciones de arriba se le presentan el martes, con su justificación, buscando la valoración C.

## 2. Qué trae la v2.0.0

**P1** es obligatorio para el martes. **P2** entra si alcanza el tiempo; si no alcanza, queda escrito como compromiso
para después y la revisión lo dice.

### Línea A · Interfaz (Pressman, caps. 12–14) · hoy 20/32

| Ítem | Hoy | Meta | Qué se hace | Por qué mejora STIRE | Prioridad | Verifica |
|---|---|---|---|---|---|---|
| UX-01 | C | C | Migas también en el ejercicio | Saber dónde está sin volver atrás | P1 | José |
| UX-02 | CP | C | Diálogo propio en lugar de `confirm()`; autoguardado con reintento (ya hecho) | Menos sustos y errores sin vuelta atrás | P1 | José |
| UX-03 | C | C | Se mantiene | — | — | José |
| UX-04 | CP | C | Quitar los 93 emojis; títulos en estilo de oración; «Dashboard» → «Inicio» | Se lee como una sola aplicación | P1 | José |
| UX-05 | CP | C | Dos Personas (estudiante y docente) y el análisis de tareas (HTA) de «resolver un ejercicio» y «preparar una clase» | Decisiones pensadas para un usuario concreto | P1 | Julio |
| UX-06 | CP | C | Botones de acción de 44 px como mínimo | Menos clics fallidos | P1 | Jorge |
| UX-07 | CP | C | Contraste AA, etiquetas en «Mi perfil», «Saltar al contenido», `aria-current` y reporte Lighthouse | Sirve a todos, también con lector de pantalla | P1 | Jorge |
| UX-08 | CP | C | SUS respondido por el equipo durante la verificación (5 personas) | Medir la usabilidad, no suponerla | P1 | Pedro |
| MOB-01 | C | C | Se mantiene | — | — | José |
| MOB-02 | CP | C | En el celular, Probar y Entregar en una barra inferior fija; controles de 44–48 px | Se usa con una mano | P1 | José |
| MOB-03 | CP | C | `autocapitalize` en el código de clase; modo oscuro con José (toca `tailwind.config.ts` y `main.css`, su territorio) | Estudiar de noche sin cansar la vista | P1 · oscuro P2 | José |
| MOB-04 | CP | C | Aviso «Sin conexión: tu código se guardará al volver»; copia local del código mientras no hay red | No perder trabajo con mala señal | P1 | Jorge |
| PAT-01 | CP | C | Pasar las llamadas a la API de las páginas grandes a composables | Código más fácil de probar | P2 | Jorge |
| PAT-02 | C | C | Se mantiene | — | — | José |
| PAT-03 | CP | C | Mensaje bajo el campo en el inicio de sesión; formato asistido del código de clase | El error se ve donde ocurre | P1 | Jorge |
| PAT-04 | CP | C | Dividir `admin/index.vue` (1532 líneas), `docente/contenidos.vue` (1126) y `EditorDiagrama.vue` (1322) | Menos fallos al cambiar algo | P2 | Jorge |

### Línea B · Sistemas Tutores Inteligentes (Caro, 2015) · hoy 14/24

| Ítem | Hoy | Meta | Qué se hace | Por qué mejora el Tutor | Prioridad | Verifica |
|---|---|---|---|---|---|---|
| MOD-01 | CP | C | Prerrequisitos visibles en el plan («Antes conviene: …») y **bloqueo suave por módulo** con aviso y progreso hacia el umbral | El estudiante entiende el camino y avanza con base | P1 | Julio |
| MOD-02 | CP | C | Corregir la racha (1 vs 0) y la lección no vista que aparece «para repasar»; **detectar errores conceptuales** en la salida (espacios o puntos, mayúsculas, número corrido en uno, salida vacía) y explicarlos | El Tutor responde a la idea equivocada, no solo a la salida | P1 | Julio |
| MOD-03 | C | C | Se mantiene | — | — | Julio |
| MOD-04 | C | C | Mensaje del evaluador que orienta («Tu programa mostró 53 y se esperaba 8. ¿Qué operación falta?») | La retroalimentación enseña | P1 | Pedro |
| UI-01 | NC | C | Algoritmo de la lección en texto, diagrama de flujo y código, con el formato preferido recordado | Cada uno elige cómo entiende mejor | P1 | Julio |
| UI-02 | CP | C | Bloqueo suave por módulo (en MOD-01) + ruta guiada «Tu siguiente paso» + reto para adelantarse | Autonomía con guía | P1 | Pedro |
| UI-03 | C | C | Se mantiene | — | — | Jorge |
| UI-04 | NC | C | «¿Te sirvió esta explicación?»; con «No», el Tutor la explica de otra forma; el docente ve el resultado por lección; recurso alternativo si uno externo falla | El curso se mejora con el uso | P1 | Pedro |
| UI-05 | C | C | «Resolverlo por pasos con el Tutor» en la pausa | Destrabar sin dar la solución | P1 | Jorge |
| META-01 | CP | C | «Mi autorregulación» en Mi progreso: una reflexión según sus datos de la semana | Aprender a aprender | P1 | Pedro |
| META-02 | NC | C | Juicio de confianza en el primer envío, con calibración; el Tutor lo usa | Combate la ilusión de saber | P1 | Julio |
| META-03 | C | C | «¿Por qué veo esto?» junto a la recomendación | Recomendaciones transparentes | P1 | Pedro |

**Proyección:** con todo P1 hecho y verificado, la interfaz llega a **≈ 29/32 (91 %)**: faltan los 3 P2, que quedan en
CP. Tutores Inteligentes llega a **24/24 (100 %)**, si el profesor acepta las adaptaciones de §1. Con los P2, la
interfaz llega a 32/32.

## 3. Cronograma hasta el martes

| Cuándo | Qué | Quién |
|---|---|---|
| **Domingo 04/10** | Construir la v2.0.0: Línea A y Línea B (P1), cada cambio con su prueba | Jeider con Claude Code |
| **Lunes 05/10, temprano** | Publicar la v2.0.0 (Vercel y Azure, etiqueta `v2.0.0`); revisión automática del «después»; publicar `VERIFICACION_v2.0.0.md` y una tarjeta de Trello por integrante con sus ítems y la encuesta SUS | Jeider |
| **Lunes 05/10, durante el día** | Cada integrante verifica sus ítems como usuario, en computador y celular, y marca ✅, ⚠️ o ❌; responde el SUS | José, Jorge, Julio, Pedro |
| **Lunes 05/10, noche** | Corregir lo marcado con ❌ y volver a pedir su revisión; llenar los Word del «después» con los resultados verificados | Jeider |
| **Martes 06/10** | Presentar al profesor: antes y después, adaptaciones de §1 y visto bueno del equipo | Equipo |

La prueba de dos semanas con el equipo empieza el lunes 05/10 sobre la v2.0.0, así que la verificación se hace dentro
de esa prueba.

## 4. Verificación por el equipo (el visto bueno)

- **José:** interfaz, celular y consistencia.
- **Jorge:** accesibilidad, rendimiento y Tutor.
- **Julio:** lo pedagógico del curso y del modelo del estudiante.
- **Pedro:** metacognición, mensajes y documentación.

Cada uno lee su ítem, lo prueba en stire-soft.vercel.app y marca en `VERIFICACION_v2.0.0.md`: ✅ de acuerdo ·
⚠️ de acuerdo con observaciones · ❌ no se cumple. Agrega una frase y, si hace falta, una captura. **Un ítem cuenta como
cumplido solo con el ✅ de quien lo verifica.** Jeider coordina y no verifica sus propios cambios. Además, los cinco
responden el **SUS** (10 preguntas, Brooke, 1996): es la evidencia de UX-08.

## 5. Seguimiento

| Fecha | Versión | Interfaz | Tutores | Verificado por el equipo | Carpeta |
|---|---|---|---|---|---|
| 04/10/2026 | v1.1.0 + ajustes (antes) | 20/32 · 62,5 % | 14/24 · 58,3 % | — (revisión inicial) | [`2026-10-04_antes/`](2026-10-04_antes/) |
| 04/10/2026 | v2.0.0 candidata (después), `main @ 4d41b8d` | 28/32 · 87,5 % | 24/24 · 100 % | pendiente (05/10) | [`2026-10-04_despues/`](2026-10-04_despues/) |
| 05/10/2026 | **v2.0.0** (etiqueta) | 29/32 · 90,6 % con el SUS | 24/24 · 100 % | — | se completa en la misma carpeta |

## Referencias

- Brooke, J. (1996). SUS: A «quick and dirty» usability scale. En P. W. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.
- Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using metacognition in Intelligent Tutoring Systems* (tesis doctoral). Universidad Nacional de Colombia, Medellín.
- Kirschner, P. A. (2017). Stop propagating the learning styles myth. *Computers & Education, 106*, 166–171.
- Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest, 9*(3), 105–119.
- Pressman, R. S., & Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9.ª ed.). McGraw-Hill.
