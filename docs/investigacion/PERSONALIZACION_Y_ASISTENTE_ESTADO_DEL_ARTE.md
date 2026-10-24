---
estado: primera pasada (23/10/2026) con búsquedas web; **ninguna obra se abrió completa**, solo resúmenes y fragmentos
regla del proyecto: una obra nueva se verifica en Crossref (o en su repositorio) **antes** de citarla en la tesis o el artículo (`BASE_TEORICA.md`)
sirve a: `docs/PLAN_ASISTENTE_DOCENTE.md` (§5 ejercicios personalizados) y `docs/DISENO_PROMPTS_ASISTENTE.md`
---

# Cómo perfilan otros sistemas, cómo se generan ejercicios con IA y cómo se diseñan los prompts

## 1. Cómo otras aplicaciones saben «qué sabe y qué no sabe» un estudiante

| Sistema | Idea central | Qué usa como dato |
|---|---|---|
| **Seguimiento bayesiano del conocimiento (BKT)** | Un estado oculto «lo sabe o no lo sabe» por habilidad, que se actualiza con cada respuesta (un modelo oculto de Markov). Es de los más usados en tutores adaptativos | Aciertos y fallos por habilidad |
| **Teoría de respuesta al ítem (IRT)** | La probabilidad de acertar depende de la habilidad del estudiante y de la dificultad del ejercicio. Supone que la habilidad no cambia con el tiempo | Aciertos y fallos, dificultad del ítem |
| **Seguimiento profundo (DKT)** | Redes recurrentes que representan más estados de conocimiento. Más potentes y menos explicables | Secuencias largas de respuestas |
| **ALEKS (teoría de espacios de conocimiento)** | Modela **qué temas domina** el estudiante, no una nota única. Una evaluación adaptativa estima el conjunto de temas conocidos y de ahí saca **«qué está listo para aprender»**. Repite evaluaciones espaciadas | Respuestas a una evaluación adaptativa |
| **Duolingo (Birdbrain)** | Estima, tras cada ejercicio, la **dificultad del ejercicio** y la **habilidad del estudiante**, con una lógica parecida a la del ajedrez (si falla, baja la habilidad y sube la dificultad). Con eso evita ejercicios muy fáciles o muy difíciles. Una versión posterior usa redes recurrentes | Cada ejercicio completado |
| **Khanmigo** | Guía con preguntas y pistas progresivas y **se ancla a las lecciones y ejercicios de Khan Academy**. No se basa solo en un modelo abierto | La lección en curso y la conversación |

**Lo que comparten:** ninguno perfila por «estilo». Todos usan **qué responde el estudiante, y con qué resultado**.
Eso coincide con la decisión de STIRE de personalizar por dominio, errores y nivel (BT-42 y BT-45).

**Dónde está STIRE frente a ellos:**
- Dominio como estimación que sube y baja (BT-43) y repasos con SM-2 ajustado a un semestre.
- **Errores de concepto clasificados con reglas** (`diagnosticoSalida.ts`), no por un modelo de lenguaje. Esto es una
  ventaja: ver §3, sobre diagnósticos inventados.
- **Calibración de confianza:** lo que el estudiante cree saber frente a lo que acierta. Ninguno de los sistemas de
  arriba lo reporta en lo que encontré.

## 2. Qué implica para «ejercicios personalizados»

La idea de Jeider: si todos reciben los mismos ejercicios, no hay personalización; hay que perfilar al estudiante
(qué sabe, qué no) y darle un ejercicio hecho para él. Y como **muchos estudiantes comparten perfil**, el mismo
ejercicio sirve a todos los de ese perfil.

Eso lleva a pensar el perfil como una **celda**, no como una persona:

> celda de perfil = (lección, error de concepto que repite, banda de nivel)

- Un ejercicio generado para una celda sirve a **todos** los estudiantes que caen en ella: se busca en el banco
  primero y solo se genera si falta.
- Mientras más estudiantes, más celdas llenas y **menos generación**: la cuota de Gemini se gasta menos con el uso.
- Dentro de una celda se varía lo superficial (el tema del ejemplo, los números) para que no se repita el mismo
  enunciado.
- **Cuándo aparece** un ejercicio personalizado es una regla aparte (por ejemplo, el mismo error de concepto en dos
  ejercicios seguidos, o un repaso vencido que sigue fallando). Se define en el plan, no en el prompt.

## 3. Qué dice la literatura sobre generar ejercicios con modelos de lenguaje

Todo lo siguiente salió de resúmenes de búsqueda y no está verificado en el texto completo.

| Hallazgo | Fuente (por verificar) |
|---|---|
| Con Codex, **la mayoría** de los ejercicios de programación generados (con solución y casos de prueba) eran **novedosos y razonables**, y algunos servían tal cual. Se puede **controlar el concepto y el tema** dándole palabras clave. Los autores piden **supervisión** antes de entregarlos a estudiantes | Sarsa, Denny, Hellas y Leinonen, *Automatic Generation of Programming Exercises and Code Explanations using Large Language Models*, ICER 2022, arXiv 2206.11861 |
| Una revisión de 2024 describe el paso de **recomendar** ejercicios a **generarlos** con modelos de lenguaje (ExGen) | arXiv 2402.01666 (revisión sobre aprendizaje personalizado) |
| En un tutor inteligente, GPT-4 a veces **inventó una concepción errónea** que el estudiante no tenía | *Generating In-Context, Personalized Feedback for Intelligent Tutors with LLMs*, Int. J. of AI in Education, 2025 |
| Para distractores de programación, la variable clave fue **darle al modelo las concepciones erróneas** en el prompt | ACM 10.1145/3706468.3706529 (distractores: modelos frente a humanos) |
| **Poner el texto fuente dentro del prompt** reduce las alucinaciones y le da control al docente sobre el material | Biancini et al., generación de preguntas de opción múltiple, arXiv 2506.04851 |
| Algunos modelos **ignoran el formato pedido** (por ejemplo, devuelven una pregunta de completar cuando se pidió de opción múltiple), así que la revisión debe comprobar el formato | COLING 2025, preguntas sobre resoluciones universitarias |
| Los errores que simula un modelo de lenguaje son **más variados pero menos fieles** que los de estudiantes reales | EDM 2026, errores de Java simulados |

**Lo que no encontré:** un estudio que mida **resultados de aprendizaje** con ejercicios de programación
personalizados, generados por un modelo a partir de un estado de conocimiento seguido en el tiempo. Eso es un hueco
real y una posible contribución, **si** STIRE lo mide.

**Qué decisiones de diseño salen de aquí:**
1. **El diagnóstico lo hacen las reglas, no el modelo.** El modelo recibe «este estudiante repite este error de
   concepto» ya clasificado y **solo escribe el ejercicio**. Así no puede inventar la concepción errónea.
2. **La solución y los casos de prueba se validan en el juez** antes de guardar nada.
3. **Palabras clave controlan concepto y tema** (como en Sarsa et al.), y el texto de la lección va dentro del prompt
   como fuente.
4. **Se comprueba el formato de lo que devuelve el modelo,** con un esquema fijo y validación en el servidor.
5. **Supervisión humana disponible:** el modo de revisión del docente (ver §4).

## 4. Qué hace Khanmigo con los docentes (referencia para el «modo revisión»)

Fuentes de segunda mano (blogs y guías de universidades), no la documentación de Khan Academy completa:
- Las herramientas para docentes son: **gancho de la lección, generador de preguntas, evaluación de opción múltiple y
  generador de rúbricas** (blog de Khan Academy sobre las funciones para docentes).
- Piden **pocos datos**: el nivel del curso, la edad, el tema y el contexto. Con eso producen un borrador.
- Los materiales **se pueden ajustar y exportar** (guía de la Universidad de St. Thomas).
- Sobre las preguntas generadas, una cita de Khan Academy dice que el docente las **«desliza a izquierda o derecha»**,
  es decir, **acepta o descarta una por una**. Esa cita la encontré en un resumen, no en la fuente original.

**Para STIRE:** el «modo revisión» es una **cola de tarjetas** con aceptar, editar o descartar, igual que en el
panel «Hechos con IA» de `PLAN_ASISTENTE_DOCENTE.md`. Y los datos que se piden al docente son pocos, con valores por
defecto.

## 5. Ingeniería de prompts para un asistente educativo

| Idea | Fuente (por verificar) |
|---|---|
| Pedir JSON en el prompt **no garantiza** que salga solo JSON. Con **`responseSchema`** la estructura es más determinista, y los **enums** acotan clasificaciones | Documentación de Gemini sobre modo JSON (ai.google.dev) |
| Nombres de campo claros y descripciones ayudan al modelo; la respuesta se trata como **dato no confiable** hasta validarla | Guía de salida estructurada de Firebase y nota de PromptLayer (esta última es de terceros) |
| Las plantillas de prompt tienen **huecos** (`{{tipo_de_pregunta}}`) que se llenan al generar | Holmes et al. 2026, *LLM Prompt Evaluation for Educational Applications*, arXiv 2601.16134 |
| Seis plantillas distintas para preguntas de seguimiento dieron resultados **claramente distintos**; la ganadora combinaba **personaje y gestor de contexto** y apoyaba estrategias metacognitivas. Se compararon por **torneo** con jueces | Holmes et al. 2026 (mismo) |
| Una biblioteca de plantillas por **componente de la lección**, llenada con los datos del docente, más un submódulo que evalúa la calidad | TriQuest, arXiv 2510.03369 |
| Plantillas con marcadores como [TEMA] y [NIVEL] para docentes | Plantillas de la Universidad de Liverpool (guía, no evaluación) |
| Una patente describe prompts con **restricciones duras**: ninguna llamada lleva instrucciones libres | USPTO 12705997. Es una afirmación de diseño, no un resultado |

**Lo que no encontré:** un estudio controlado que compare entradas del docente en huecos frente a un prompt libre,
midiendo la calidad de planes de clase. El diseño de `DISENO_PROMPTS_ASISTENTE.md` se apoya en estas pistas y en
sentido común, y **se mide con los datos del propio Asistente** (cuántos borradores se aplican, editan o descartan).

## 6. Pendientes de verificación antes de citar

| Qué | Cómo |
|---|---|
| Todas las obras de las secciones 3 a 5 | Abrir cada una; confirmar autores, año y datos en Crossref o arXiv; leer la sección de resultados |
| Birdbrain y ALEKS | Leer la entrada del blog de Duolingo y el artículo de Cosyn et al. (2021) que mencionó la búsqueda |
| La cita de Khan Academy sobre «deslizar» | Buscarla en la fuente original |
| Que ningún sistema reporte calibración de confianza | Es una afirmación de **ausencia**: hay que buscar de forma dirigida antes de escribirla en un artículo |
