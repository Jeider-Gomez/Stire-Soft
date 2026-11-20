# Diagnóstico de competencias y análisis de exámenes · propuesta del 20/11/2026

**Estado:** propuesta para aprobar. No hay nada construido.

## De dónde sale

- **Toscano, recomendación 5** (`RETROALIMENTACION_TOSCANO_2026-10-28.md`): definir las competencias, aplicar un
  **test inicial** y llevar una confianza por competencia. Lo de las competencias y la ecuación ya existe; **el test
  inicial no**. Hoy solo hay un reto de entrada por lección, para saltarse lo que ya sabe.
- **Jeider, 20/11:**
  - que el docente lo haga para **los estudiantes que entran nuevos al curso**;
  - o que sea **una herramienta de análisis de los exámenes que el docente asigna**.
- **Regla del proyecto:** toda función del docente es opcional y configurable.

Son dos herramientas con la misma base: STIRE ya sabe a qué competencias apunta cada pregunta. En la literatura de
diagnóstico cognitivo esa tabla de «pregunta → competencias» se llama **matriz Q**, y la suelen armar expertos del
área (de la Torre y Chiu, 2016; Chiu, 2013). En STIRE la armaron las etiquetas del curso
(`src/common/utils/competencias.ts`) y la prueba `competencias-cursos.spec.ts` comprueba que ningún ejercicio quede sin
competencia.

## Herramienta 1 · Diagnóstico de entrada para los estudiantes nuevos

**Para qué:** hoy todos llegan en «Sin evidencia», y el docente no sabe nada del grupo hasta varias lecciones
después. Con el diagnóstico, el primer día ve qué traen flojo los que entran y puede ajustar la clase. Sirve sobre
todo en un curso como Fundamentos, donde llegan estudiantes sin haber programado nunca (8 de los 9 de la prueba con
usuarios finales).

| Decisión | Propuesta | Por qué |
|---|---|---|
| ¿Quién lo activa? | El docente, en Ajustes de la clase. Apagado por defecto | Función opcional |
| ¿A quién le sale? | A cada estudiante **al unirse a la clase** (también a los que llegan tarde), una sola vez, y lo puede dejar para después | «Para los que entran nuevos» |
| ¿Qué competencias? | Las que el docente marque; por defecto, las de las primeras lecciones | Que no pregunte por arreglos el primer día |
| ¿Cuántas preguntas? | 2 por competencia, unas 10 a 12, de 10 a 15 minutos | Corto |
| ¿De qué tipo? | Opción múltiple y completar código, del banco ya etiquetado; nada de programar | Sin juez de código y sin clave de Gemini |
| ¿Nota? | No. Sin rojo y sin «reprobaste» (Toscano 4) | Diagnosticar, no calificar |
| ¿Confianza? | Cada pregunta con «¿Qué tan seguro estás?» (ya existe en las entregas) | La confianza que pidió Toscano |
| ¿Qué ve el estudiante? | «Esto ya lo traes» / «Esto lo vamos a practicar», sin porcentajes | Palabras humanas |
| ¿Qué ve el docente? | La columna «Cómo llegó» en Competencias de la clase, y una sugerencia: «8 de 25 llegan sin Operadores: ¿asignar un refuerzo?» | Para ajustar la clase |
| ¿Cuenta en la ecuación? | **No**: se muestra aparte | La simulación del 20/11 mostró que la ecuación ya tarda en reconocer a quien mejora; los fallos del primer día pesarían todo el semestre |
| ¿Cambia el recorrido? | Solo con la clase en «recomendar»: quien ya trae una competencia empieza en el intermedio | El modo que ya existe |

## Herramienta 2 · Análisis de los exámenes que asigna el docente

**Para qué:** después de un parcial (tipo de actividad «Parcial / Evaluación», que ya existe y se califica solo), el
docente ve qué tan bien funcionó cada pregunta y qué competencias quedaron flojas en el grupo. Es el **análisis de
ítems** de la teoría clásica de los tests. Se usa justamente para revisar exámenes hechos por el propio docente
(Quaigrain et al., 2017; Khairani et al., 2016).

| Medida | Qué es | Cómo se lee | Fuente |
|---|---|---|---|
| **Dificultad** (p) | Porcentaje que la acertó | Muy fácil o muy difícil: no dice mucho del grupo | Quaigrain et al. (2017) |
| **Discriminación** (D) | Cuánto más la acierta el 27 % de mejor nota que el 27 % de menor nota | Cerca de 0 o negativa: hay que revisarla (quizá está mal redactada o mal la clave) | Rezigalla et al. (2024) |
| **Distractores que no funcionan** | Opciones incorrectas que eligió menos del 5 % | Sobran o son obvias; mejor cambiarlas | Rezigalla et al. (2024); Chauhan et al. (2023) |
| **Confiabilidad** (KR-20) | Qué tan consistente es el examen completo | Solo con suficientes estudiantes; con menos, no se muestra | Quaigrain et al. (2017) |
| **Por competencia** | Porcentaje de acierto del grupo en las preguntas de cada competencia | «El grupo falló en Operadores (38 %)» | Matriz Q de STIRE |

- **Con palabras del docente, no de psicometría:**
  - «Esta pregunta casi todos la aciertan.»
  - «Esta la aciertan más los que van peor: revísala.»
  - «Nadie eligió la opción C.»
  - Los nombres técnicos quedan en un «¿Qué significa?».
- **Bonus que sale casi gratis:** si una pregunta discrimina mal pero su competencia está bien en el resto del examen,
  quizá esté mal etiquetada. Es la idea de validar la matriz Q con los datos (de la Torre y Chiu, 2016), en versión
  sencilla: STIRE solo la señala y el docente decide.
- **No hace falta cambiar la base:** cada respuesta ya guarda si fue correcta y qué opción eligió.
- **Puede ser el mismo diagnóstico:** el examen de entrada de la herramienta 1 se analiza igual.

## Lo que cuesta construirlo

| | Herramienta 1 · Diagnóstico | Herramienta 2 · Análisis de exámenes |
|---|---|---|
| Servidor | Un tipo de actividad «diagnóstico» que la ecuación no cuenta, y que salga al unirse; requiere una migración | Una ruta que calcula las medidas desde las respuestas guardadas; sin migración |
| Frontend | El interruptor en Ajustes, la pantalla de una pregunta a la vez y la columna «Cómo llegó» | Una pestaña «Cómo funcionó» en cada parcial |
| Contenido | 2 o 3 preguntas por competencia de las primeras lecciones | Ninguno |
| Tamaño | Mediano | Pequeño: **se puede hacer primero** |

## Para el artículo

- **Análisis de exámenes:** se puede describir como función del sistema y probarse con la simulación (los estudiantes
  simulados contestan un parcial). Con personas, haría falta un parcial real de Pedro o Julio.
- **Diagnóstico de entrada, más uno de cierre:** daría el único dato de aprendizaje del artículo (un antes y un después
  por competencia). Si el semestre no alcanza, queda como trabajo futuro: «el test inicial que propuso el experto está
  diseñado y no construido».

## Fuentes (encontradas en Consensus el 20/11; datos tomados de sus resúmenes)

- Chauhan, G. et al. (2023). Relations of the number of functioning distractors with the item difficulty index and
  the item discrimination power in the multiple choice questions. *Cureus*.
- Chiu, C.-Y. (2013). Statistical refinement of the Q-matrix in cognitive diagnosis. *Applied Psychological
  Measurement*.
- de la Torre, J. y Chiu, C.-Y. (2016). A general method of empirical Q-matrix validation. *Psychometrika*.
- Khairani, A. Z. et al. (2016). Assessing item difficulty and discrimination indices of teacher-developed
  multiple-choice tests. Springer.
- Quaigrain, K. et al. (2017). Using reliability and item analysis to evaluate a teacher-developed test in
  educational measurement and evaluation. *Cogent Education*.
- Rezigalla, A. A. et al. (2024). Item analysis: the impact of distractor efficiency on the difficulty index and
  discrimination power of multiple-choice items. *BMC Medical Education*.

**Antes de citarlas en el artículo:** abrir cada una y comprobar los coautores completos (algunos aparecen como «et
al.» en el buscador), el volumen y las páginas.

## Decide Jeider

1. ¿Se empieza por el análisis de exámenes, que es más pequeño y sirve aunque no haya diagnóstico?
2. ¿El diagnóstico sale al unirse a la clase, o el docente lo abre cuando quiera?
3. ¿Entra también un diagnóstico de cierre, para el antes y el después?
