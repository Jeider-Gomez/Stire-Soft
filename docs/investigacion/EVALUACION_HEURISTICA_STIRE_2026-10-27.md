# Evaluación heurística de STIRE v2.4.0 · 27/10/2026 (grado 10 a tercer semestre)

**Qué es:** STIRE calificado otra vez con el instrumento de evaluación heurística del curso (Empower-peque-chef adaptado,
el mismo Excel que llena el equipo), sobre el código de la **v2.4.0** (`main` del 27/10), después del rediseño del
docente, el Asistente y los ejercicios de programar.

**Público:** estudiantes de **grado 10 y 11** hasta **tercer semestre de la Licenciatura en Informática**. Cada ítem se
califica con el **más exigente**, que casi siempre es el de colegio; la columna «3.er sem.» dice cuánto daría para un
universitario cuando cambia. Ante la duda, la nota más baja.

**Cómo:** evaluación experta de una sola persona (la IA), contra el código, sin estudiantes. El Excel lleno está fuera
del repositorio, en una carpeta de OneDrive que no se comparte (`Evaluacion heuristica STIRE - IA (privado, no compartir)/`). **El equipo no lo lee antes
de entregar su evaluación** (`docs/calidad/EVALUACION_HEURISTICA_HUMANA_S11.md`).

## Resultado

| Indicador | Grado 10–11 (el más exigente) | Tercer semestre | 22/10, v2.1.0, mayores de 18 |
|---|---|---|---|
| Promedio Likert, ítems 1 a 34 | **3,94 / 5** | 4,21 / 5 | 4,21 / 5 |
| Severidad total (frecuencia × impacto) | **37** | — | 23 |
| Problemas graves (severidad ≥ 4) | **1: ítem 33, privacidad de menores (6)** | 0 | 0 |
| Ítems en 5 | 1, 14, 23, 30 y 32 | | |
| Ítems en 3 o menos | 4, 15, 17, 18, 33 y 34 | | |
| Usabilidad general (35) y potencial educativo (36) | 4 y 4 | 4 y 4 | 4 y 4 |

**Lectura:**
- **Para un universitario, STIRE sigue igual que el 22/10 (4,21).** La baja viene del público de colegio.
- **Lo que más pesa con los de colegio:** la privacidad de menores (33) y el Tutor que exige una clave de Google solo para
  mayores de 18 (15). Las dos se resuelven con el plan de menores (P33).
- **El lenguaje (4):** «dominio» aparece unas 100 veces en las pantallas del estudiante y solo 3 lugares lo explican.
- **Contenido (17 y 18):** casi todo es texto y no hay nada para explorar por cuenta propia. No es un problema de la
  interfaz sino de los cursos y de la remodelación.
- **Severidad 23 → 37:** no es que STIRE empeorara. Esta vez se calificó más duro (ningún 4 sin su frecuencia × impacto,
  como pide el instrumento) y con un público más joven.

## Por ítem

| N.º | Ítem | Likert | 3.er sem. | F × I | Evidencia en STIRE |
|---|---|---|---|---|---|
| 1 | Retroalimentación del estado | 5 | 5 | 0 | Cargando, guardado, «Detener» mientras corre la prueba, sonido opcional, resultado por caso. |
| 2 | Respuesta en menos de 5 s | 4 | 4 | 1 | Pantallas y «Probar» en 1–2 s; el Tutor (Gemini gratuito) puede pasar de 5 s. Muestra la mascota pensando, pero no la respuesta a medida que llega. |
| 3 | Errores sencillos con sugerencia | 4 | 4 | 1 | El juez explica el error y qué repasar; los errores de JavaScript (TypeError, ReferenceError) siguen apareciendo con su nombre técnico. |
| 4 | Lenguaje cotidiano | 3 | 4 | 2 | «Dominio» aparece unas 100 veces en las pantallas del estudiante y solo 3 lugares lo explican; «casos de prueba», «consola» y «calibración» sin explicación en la mayoría. Para grado 10–11 pesa; en tercer semestre menos. |
| 5 | Íconos comprensibles | 4 | 4 | 1 | Botones con texto casi siempre; algunos solo con ícono dependen de la descripción al pasar el ratón, que no existe en el celular. |
| 6 | Organización anticipable | 4 | 4 | 1 | Clase → módulo → lección → ejercicio se entiende; la lección es la pantalla más cargada (P09). |
| 7 | Sin instrucciones, ≤ 2 clics | 4 | 5 | 1 | «Tu siguiente paso» lleva al ejercicio en un clic. Pero usar el Tutor exige crear una clave en Google AI Studio, con instrucciones externas. |
| 8 | Deshacer, detener, cancelar | 4 | 4 | 1 | «Detener» y deshacer al ocultar o publicar en el docente; borrar pide confirmación pero no ofrece deshacer; la entrega no se deshace (a propósito). |
| 9 | Lo básico en < 15 min | 4 | 4 | 1 | Bienvenida, «Primeros pasos» y recorridos; no medido con estudiantes de colegio. |
| 10 | Consistencia visual | 4 | 4 | 1 | El docente tiene un aspecto propio; quedan colores fijos fuera de los tokens (por ejemplo en el chat del Tutor). |
| 11 | Convenciones web y móvil | 4 | 4 | 1 | Menú lateral, ventanas con Escape, diseño adaptable; por revisar en todas las ventanas. |
| 12 | Navegación predecible | 4 | 4 | 1 | Predecible en el estudiante; en el docente conviven ventanas viejas y el panel nuevo. |
| 13 | Validación y confirmación | 4 | 4 | 1 | Confirmación antes de borrar y validación en el registro; el aviso de salir sin guardar solo existe en proyectos. |
| 14 | Errores que orientan | 5 | 5 | 0 | Los errores del servidor dicen qué hacer (esperar, reintentar, contarlo). |
| 15 | Tarea con ≤ 2 ayudas | 3 | 4 | 2 | Para grado 10–11: el Tutor exige una clave de Google AI Studio (solo mayores de 18) y la confirmación de 18 años; sin Tutor, la ayuda depende del docente. En tercer semestre basta crear la clave. |
| 16 | Entender los conceptos | 4 | 4 | 1 | Algoritmo en pseudocódigo, diagrama y código, con ejecución paso a paso; sin bloques para quien no sabe JavaScript. |
| 17 | Invita a explorar | 3 | 3 | 1 | Solo los retos que pone el docente y los logros; nada para explorar por cuenta propia. |
| 18 | Imágenes, video, animación | 3 | 3 | 1 | Las lecciones admiten imagen y video, pero los dos cursos tienen unas 15 imágenes y 4 videos en total: casi todo es texto. |
| 19 | Mantiene la atención | 4 | 4 | 1 | Ejercicios variados, Tutor con voz, logros; ganar un logro no se celebra en el momento y el Tutor no saluda. |
| 20 | Carga < 5 s, respuesta < 3 s | 4 | 4 | 1 | Sin medición con un salón completo ni con datos móviles. |
| 21 | Atajos | 4 | 5 | 1 | Ctrl+Enter, Ctrl+K, «Tu siguiente paso» y la lista de atajos en el menú de ayuda; el estudiante de colegio casi no usa atajos de teclado y en el celular no hay equivalentes. |
| 22 | Configuración | 4 | 4 | 1 | Tema, contraste, tamaño de letra, movimiento y sonido; los avisos no se pueden apagar por tipo. |
| 23 | Información contextual | 5 | 5 | 0 | Recorridos y «Ayuda sobre esta pantalla». |
| 24 | Diseño limpio | 4 | 4 | 1 | Sin anuncios; varios botones flotantes (Tutor, asistencia) y el Inicio del docente denso. |
| 25 | Lo esencial destacado | 4 | 4 | 1 | «Mi progreso» muestra todo en una columna; lo esencial no está arriba. |
| 26 | Metáforas reconocibles | 4 | 4 | 1 | Un solo juego de íconos con texto; el logo y la mascota se repiten (por revisar con José). |
| 27 | Errores visualmente claros | 4 | 4 | 1 | Borde rojo, ícono y texto en formularios; no todos los errores llevan ícono. |
| 28 | Errores sin jerga | 4 | 5 | 1 | Mensajes del servidor en lenguaje claro; los del intérprete de JavaScript siguen en jerga. |
| 29 | Soluciones en el mensaje | 4 | 4 | 1 | «Pedir ayuda al Tutor» con el error cargado y enlace al concepto; pocos errores tienen botón de reintentar. |
| 30 | Ayuda contextual | 5 | 5 | 0 | Menú «?» en todas las pantallas. |
| 31 | Sección de ayuda | 4 | 5 | 1 | Manual con buscador y glosario; no está al día con los nombres nuevos del menú del docente. |
| 32 | Canales de soporte | 5 | 5 | 0 | Mensajes al docente, «Contar un problema o una idea», Tutor. |
| 33 | Privacidad de menores | 2 | 4 | 6 | Grado 10–11: no hay autorización del acudiente, el registro exige declarar 18 años y el Tutor usa la API de Gemini, que Google prohíbe con menores. Problema grave. Para mayores de 18 se cumple (términos, política, Tutor sin nombre ni correo). |
| 34 | Datos protegidos y anonimizados | 3 | 4 | 2 | Exportación con código irreversible solo de quienes consintieron; con menores falta la autorización del acudiente para usar sus datos; sin plazo de borrado. |

## Limitaciones

La hizo una sola persona sobre el código, sin estudiantes de colegio ni universitarios; los ítems 9, 15 y 20 solo se
confirman con personas. Sirve para priorizar el plan para llegar a 5 (`docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md`),
no como medida de usabilidad.
