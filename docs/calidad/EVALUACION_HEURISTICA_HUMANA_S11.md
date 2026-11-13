# Evaluación heurística humana de STIRE (Semana 11)

**Objetivo:** que los 5 integrantes califiquen STIRE con el **instrumento de evaluación heurística del curso** (el de
Empower-peque-chef, adaptado a STIRE), repartido entre todos, para saber qué tan cerca está cada ítem de 5 y qué falta.
Después de la remodelación se repite igual, y esa segunda evaluación abre la v3.0.0.

**Resultado esperado:** cada uno entrega **su pestaña de la hoja** con sus filas llenas (Likert, frecuencia, impacto y
observaciones con una captura cuando haya un problema), más las filas 35 a 39, que responden todos.

**Cuándo:** desde ya (semana autónoma). **Plazo: jueves 5 de noviembre, 8:00 p. m.**

## El instrumento

- **Hoja de Google:** «Evaluación heurística STIRE · Semana 11 (equipo)», en el Drive de Jeider (el enlace va en el
  grupo y en Trello). No se sube al repositorio porque el instrumento es de otro grupo.
- **Cada uno duplica la pestaña «Evaluación»** (clic derecho › Duplicar), le pone su nombre y llena **solo las filas con
  su nombre** en la columna «Responsable». Las filas 35 a 39 (evaluación general y preguntas abiertas) las responden
  todos.
- **Escalas:** Likert de 1 a 5; si hay un problema, frecuencia (0 a 2) e impacto (0 a 3). La severidad (frecuencia ×
  impacto) la calcula la hoja. Si pones 5, frecuencia e impacto van en 0.

## Reglas

1. **Es una revisión humana, como la vez pasada.** Evalúa solo: no abras las pestañas de los demás ni ninguna
   evaluación anterior de STIRE (tampoco la de la IA) hasta entregar. Lo valioso es lo que ves tú.
2. **Como usuario**, por lo que ves y haces; no por el código. Si dudas, compara con Moodle, Google Classroom, Canvas o
   Khan Academy.
3. **Ponte en el lugar de** un estudiante de **grado 10 u 11, o de primer semestre, que no sabe programar**. En las
   tareas del docente, un docente que no conoce STIRE.
4. **Sé exigente.** Un 5 es «totalmente de acuerdo, no le encuentro ningún problema». Ante la duda, la nota más baja,
   y en «Observaciones» por qué.
5. En **https://stire-soft.vercel.app**, con tu cuenta de docente de la prueba (o `laura.martinez.docente@example.com`)
   y tu cuenta de estudiante. En el computador y una pasada en el celular.
6. Capturas en `docs/calidad/evidencias/he-s11/`, con tu nombre y el número del ítem (por ejemplo `HE-JOSE-24.png`).
7. Como dice el instrumento, en **dos sesiones** de unos 30 minutos.

## Las tareas (las hacen todos, antes de calificar)

**Como estudiante (unos 20 minutos):** únete a una clase, mira el Inicio, haz una lección completa, resuelve un
ejercicio de programar (falla una vez a propósito), pregúntale algo al Tutor, mira Mi progreso y Logros, y cambia algo en
Apariencia.

**Como docente (unos 20 minutos):**
1. Lee «Por revisar» en el Inicio y abre una clase.
2. En Contenido del curso: crea un tema y una lección, escribe una explicación corta, muévela y mírala con «Ver como
   estudiante».
3. Crea un ejercicio de opción múltiple y uno de programar; pídele ejercicios al Asistente (sin clave, evalúa lo que te
   dice).
4. Publica un aviso a la clase, deja la asistencia activa y sigue trabajando en otra pantalla.

## Quién califica qué

| Persona | Ítems | Heurísticas |
|---|---|---|
| **Jeider** | 1–3 y 15–17 (6) | Visibilidad del estado del sistema; reconocer en lugar de recordar (aprendizaje y autonomía) |
| **Pedro** | 4–6, 23 y 30–32 (7) | Correspondencia con el mundo real; ayuda en el momento justo; ayuda y documentación |
| **Julio** | 7–9 y 20–22 (6) | Control y libertad; flexibilidad y eficiencia |
| **José** | 10–12, 18 y 24–26 (7) | Coherencia y estándares; imágenes y video; diseño estético y minimalista. **Además:** un párrafo con su opinión de la identidad (logo, mascota, letra, pie, lanzador del Tutor) y del aspecto del panel del docente |
| **Jorge** | 13–14, 19, 27–29 y 33–34 (8) | Prevención de errores; atención del estudiante; recuperarse de errores; protección de datos. **Además:** QA libre (doble clic, recargar a mitad de algo, celular, teclado, tema oscuro), en «Observaciones» o en una hoja aparte |
| **Todos** | 35–39 | Usabilidad general, potencial educativo y las tres preguntas abiertas |

## Después de entregar

Jeider junta las cinco copias en una tabla por ítem (Likert, severidad, observación) y la pega al final de este
documento. Lo de severidad 4 o más se corrige de inmediato; lo demás entra al plan para llegar a 5
(`docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md`) y al diseño de la Fase 2. Recién entonces se compara con la
evaluación de la IA.

## Resultados (tabla por ítem, 10/11)

Leída la hoja el martes 10/11. Entregaron completas Jeider, Pedro, José y Jorge. **A Julio le faltan la nota del
ítem 9 y las filas 35 a 39.** José dejó en blanco la frecuencia y el impacto de sus siete ítems, pero los calificó
todos con 5, y la regla del instrumento dice que con 5 los dos van en 0. Por eso su severidad es 0.

**En números:** 33 de 34 ítems calificados, con un promedio Likert de **4,21**. Hubo 13 ítems con 5, 15 con 4, 4 con 3 y
1 con 2. Usabilidad general (fila 35): **4,25**, y potencial educativo (fila 36): **4,25**. Los dos promedios son de
4 personas, porque falta Julio.

| N.º | Heurística | Quién | Likert | Sev. (F×I) | Lo que vio |
|---|---|---|---|---|---|
| 1 | Visibilidad del estado | Jeider | 4 | 1 | El estado al probar y entregar es claro. El sonido viene apagado y no cambia según el resultado, y los intentos no transmiten su importancia. No queda claro dónde está lo que asignó el docente |
| 2 | Visibilidad del estado | Jeider | 5 | 0 | Todo responde en menos de 1,8 s y el Tutor tarda entre 1,8 y 3,5 s, con aviso mientras tanto (P59) |
| 3 | Visibilidad del estado | Jeider | 3 | 2 | 7 de 8 errores se explican en español, pero el error en inglés sigue encima. Con un bucle infinito pregunta por `console.log`, y al entregar no dice en qué falló (P61) |
| 4 | Mundo real | Pedro | 4 | 1 | El glosario ayuda, pero faltan explicaciones para «pseudocódigo», «Todo o nada», «calibración», «autorregulación» y «Anki» |
| 5 | Mundo real | Pedro | 4 | 1 | La campana no tiene texto al pasar el cursor. La medalla de ejercicio avanzado sale antes de tiempo, y en Inicio el botón del Tutor tapa «Continuar» |
| 6 | Mundo real | Pedro | 3 | **4** | **Los números se contradicen:** Inicio dice «0 de 10 dominadas», Repasos y Mi progreso muestran lecciones al 100 % y el perfil dice «8 dominadas». Además, los logros no están en el menú, «Mi asistencia» trae otro nombre de clase y una lección sin empezar dice «Continuar» |
| 7 | Control y libertad | Julio | 4 | 1 | La lección queda a 1 clic y el ejercicio a 2. Los «Cómo» abren otra pestaña y la guía de cada pantalla molesta un poco |
| 8 | Control y libertad | Julio | 4 | 0 | Esc cierra todo y «Volver a la lección» siempre está a la vista. No probó deshacer en el código (nota provisional) |
| 9 | Control y libertad | Julio | **falta** | 0 | Dos personas nuevas lograron lo básico solas en unos 8 minutos |
| 10 | Coherencia | José | 5 | 0 | Misma línea gráfica en los dos roles |
| 11 | Coherencia | José | 5 | 0 | Sigue las convenciones: menú plegable, ventanas estándar |
| 12 | Coherencia | José | 5 | 0 | La navegación es predecible |
| 13 | Prevención de errores | Jorge | 5 | 0 | Pide confirmación antes de entregar |
| 14 | Prevención de errores | Jorge | 4 | 2 | Los errores salen con un mensaje claro y una sugerencia |
| 15 | Aprendizaje y autonomía | Jeider | 3 | 2 | Tres ejercicios de la Unidad 2 usan `lineas[i]` antes de que se enseñe el arreglo. El Tutor no siempre evita dar la solución |
| 16 | Aprendizaje y autonomía | Jeider | 4 | 1 | Solo 3 de 27 lecciones tienen un ejemplo en vivo, y no se puede editar (P50) |
| 17 | Aprendizaje y autonomía | Jeider | 3 | 1 | Las medallas son sobrias y no tienen celebración. No hay sección de descubrimiento, y «11 repasos para hoy» junto a «8 pendientes» confunde |
| 18 | Imágenes y animación | José | 5 | 0 | El simulador y los diagramas ayudan |
| 19 | Atención | Jorge | 4 | 0 | Los ejercicios son claros, y el Tutor y el progreso acompañan bien |
| 20 | Eficiencia | Julio | 5 | 0 | Inicio carga en unos 2,3 s y la lección casi al instante |
| 21 | Eficiencia | Julio | 4 | 1 | Ctrl+K no aparece en «Atajos de teclado», e ir al inicio y abrir el Tutor no tienen tecla |
| 22 | Eficiencia | Julio | 4 | 1 | Hay tema, contraste, letra, movimiento y sonido, pero los avisos no se configuran |
| 23 | Ayuda en el momento | Pedro | 5 | 0 | Hay recorridos, «¿Por qué veo esto?», glosario, menú «?» y Tutor con contexto |
| 24 | Estética | José | 5 | 0 | La interfaz es despejada |
| 25 | Estética | José | 5 | 0 | Lo esencial está destacado |
| 26 | Estética | José | 5 | 0 | Los íconos son homogéneos |
| 27 | Recuperarse de errores | Jorge | 5 | 0 | Los errores son identificables sin depender solo del color |
| 28 | Recuperarse de errores | Jorge | 4 | 2 | La jerga de JavaScript (`SyntaxError`, `TypeError`) sigue a la vista |
| 29 | Recuperarse de errores | Jorge | 4 | 1 | Falta un botón «Explicar este error» junto al caso que falló |
| 30 | Ayuda y documentación | Pedro | 4 | 1 | Hay ayudas según la pantalla. La campana no tiene ayuda, y una notificación dice «hoy» con fecha del 19/10 |
| 31 | Ayuda y documentación | Pedro | 4 | 1 | Al manual se llega en 1 o 2 clics, pero la búsqueda no entiende frases y «Mi clave» no se explica |
| 32 | Ayuda y documentación | Pedro | 4 | 1 | Hay tres canales, pero no dice cuál usar ni cuánto tarda la respuesta |
| 33 | Protección de datos | Jorge | 2 | **6** | **Solo se pueden registrar mayores de 18**, y eso deja fuera a los colegios |
| 34 | Protección de datos | Jorge | 5 | 0 | Términos y política de datos declarados |

### Severidad 4 o más

1. **Ítem 6 (severidad 4): los números del avance se contradicen.** Es un defecto y se corrige: Inicio, Repasos, Mi
   progreso y el perfil deben contar lo mismo y decir de qué clase hablan. En la misma tanda caben el nombre de la clase
   en «Mi asistencia», «Empezar» en vez de «Continuar» en una lección sin empezar y los logros en el menú.
2. **Ítem 33 (severidad 6): solo mayores de 18.** No es un defecto, es una decisión del 22/10: el Tutor usa Gemini y sus
   términos no permiten menores. Se deja así y queda registrado. Abrirlo a colegios exige la autorización del acudiente
   y otro proveedor para el Tutor, y va como trabajo futuro, no como arreglo de esta semana.

### Lo que más se repitió

- **Errores de programación aún técnicos** (ítems 3, 28 y 29, de Jeider y Jorge): el texto en inglés encima, ningún
  botón «Explicar este error» junto al caso y el caso del bucle infinito.
- **Ayudas sin texto o fuera de la pantalla** (ítems 5, 7, 30 y 31, de Pedro y Julio): la campana, los «Cómo» que abren
  otra pestaña y la búsqueda del manual.
- **Motivación sobria** (ítems 1 y 17): sonidos y medallas sin celebración.

Lo de severidad 1 a 3 entra al plan para llegar a 5 y al diseño de la Fase 2. Recién ahora se puede comparar con la
evaluación de la IA.
