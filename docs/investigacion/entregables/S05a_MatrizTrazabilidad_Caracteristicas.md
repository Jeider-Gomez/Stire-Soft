---
estado:     borrador — pendiente de verificación contra fuente original antes de incorporar al informe
verificado: 2026-09-14
fuente:     entregable 01 de docs/investigacion/PLAN_ENTREGABLES_INFORME.md
codigos:    no aplica (investigación, no ventanas)
---

# S05a — Matriz de trazabilidad de las características del tutor inteligente

> **Versión legible (Google Doc, con tabla real y el Gráfico 1 embebido, actualizada
> 2026-09-14):** https://docs.google.com/document/d/1nOpceXZHsO-xFxJOapTU-9B78Hd3Qh5kW17AjCGwe9E/edit
> — en la misma carpeta de Drive que `Análisis y diseño actual.docx`. Ver
> `PLAN_ENTREGABLES_INFORME.md` §7 para qué copiar de ahí y dónde pegarlo en el informe.

> Va en el apartado **§5.4.1** del informe, a continuación del texto ya redactado sobre las seis
> características. **Matriz completa desde el 2026-09-14**: las columnas 6 (etapa) y 7
> (componente de arquitectura) ya se llenaron con los entregables 02 y 03, respectivamente — ver
> Nota 1 al pie de la tabla.
>
> **Antes de pegar esto en el informe:** contrastar cada cifra contra `SESIÓN 2.docx` y la
> encuesta/entrevista originales, y cada referencia bibliográfica contra
> `MATRIZ_ARTICULOS_AMPLIADA.md`. Ningún dato de este documento fue inventado; todos provienen de
> `CONTEXTO_STIRE.md` §3-§4 y de la matriz bibliográfica ya verificada del proyecto.

---

## Producto 1 — Matriz de trazabilidad

| ID | Característica definida | Necesidad o hallazgo que la origina | Evidencia y fuente | Referente que la respalda | Etapa del modelo pedagógico | Componente de la arquitectura |
|---|---|---|---|---|---|---|
| **CAR-01** | Adaptación al nivel y ritmo de aprendizaje del estudiante | La cohorte ingresó con niveles de partida heterogéneos, y la autopercepción del estudiante no coincide con su desempeño real, por lo que un ritmo único de avance no correspondería a ninguno de los subgrupos reales de la muestra. | Encuesta diagnóstica: más de la mitad de los estudiantes inició el curso sin experiencia previa en programación. Test STIRE: contraste entre autopercepción y desempeño — 11 estudiantes se autoubicaron en nivel medio y obtuvieron en promedio 5.27/7, mientras que 5 estudiantes (25%) se autoubicaron en nivel bajo y obtuvieron en promedio 4.2/7. | Khan Academy / Khanmigo (personalización del nivel de ayuda según desempeño); MATHia (seguimiento continuo del dominio por competencia). Respaldo bibliográfico: Bloom (1984), "The 2 Sigma Problem", que atribuye la ventaja de la tutoría uno a uno frente a la instrucción grupal precisamente al ajuste continuo del ritmo y la retroalimentación al estudiante individual — verificado en `MATRIZ_ARTICULOS_AMPLIADA.md`. | Exploración — el rol del tutor en esta etapa incluiría priorizar y organizar los contenidos según el nivel de dominio previo del estudiante (S05b, apartado 3). | Procesamiento y adaptación (principal); Entrada de información (apoyo, provee los datos de partida) — S06b, apartado 7. |
| **CAR-02** | Retroalimentación inmediata y explicativa | El docente identificó la retroalimentación inmediata como una necesidad explícita para el tutor, y una porción relevante de los errores del diagnóstico se debió a fallas operacionales —no conceptuales— que una retroalimentación en el momento podría corregir antes de que se consoliden como hábito. | Entrevista al docente: necesidades identificadas incluyen "retroalimentación inmediata" y "seguimiento continuo del progreso". Test STIRE: el 50% de la muestra atribuyó sus fallas a lectura apresurada, distracción o decisiones impulsivas, no a desconocimiento del concepto. Encuesta diagnóstica: disposición favorable unánime al uso de un tutor con retroalimentación inmediata. | Khan Academy / Khanmigo (retroalimentación inmediata y contextualizada); MATHia (retroalimentación centrada en el paso exacto del procedimiento). Respaldo bibliográfico: Hattie y Timperley (2007), sobre el poder formativo de la retroalimentación oportuna, y Becker et al. (2019), sobre mensajes de error explicativos en programación — ambos verificados en `MATRIZ_ARTICULOS_AMPLIADA.md`. | Práctica y retroalimentación — el rol del tutor en esta etapa sería evaluar cada intento y generar retroalimentación explicativa (S05b, apartado 3). | Generación de respuestas (principal); Procesamiento y adaptación (apoyo, decide el contenido) — S06b, apartado 7. |
| **CAR-03** | Orientación mediante pistas progresivas | El docente reportó que los estudiantes omiten pasos de la secuencia por asumirlos implícitos y tienen dificultad para transferir una estructura de control a un contexto nuevo; el propio test STIRE halló que el 30% de la muestra no puede seguir el rastro mental de cómo se transforma una variable en cada iteración, lo que apunta a un problema de modelo mental antes que de memoria. | Entrevista al docente: "omisión de pasos en la secuencia por asumirlos implícitos"; "dificultad para decidir cuándo usar cada estructura de control y transferirla a contextos nuevos". Test STIRE (hallazgo cualitativo): 30% declaró textualmente dificultad para seguir el rastro mental de la transformación de una variable en cada iteración. | Khan Academy / Khanmigo (tutoría socrática mediante preguntas orientadoras); MATHia (descomposición de problemas en subhabilidades). Respaldo bibliográfico: VanLehn (2011) y Koedinger y Aleven (2007), sobre el *assistance dilemma* y la superioridad del andamiaje guiado frente a la entrega directa de la respuesta; Sorva (2013), sobre el trazado de memoria paso a paso como recurso frente a dificultades de modelo mental en programación introductoria — verificados en `MATRIZ_ARTICULOS_AMPLIADA.md`. | Práctica y retroalimentación — el escalamiento de pistas (S05b, apartado 5) operaría dentro de esta etapa. | Generación de respuestas (principal); Procesamiento y adaptación (apoyo, decide el nivel de escalamiento) — S06b, apartado 7. |
| **CAR-04** | Repetición espaciada para reforzar conceptos con dificultades | Los conceptos de secuenciación, ciclos y acumuladores concentraron el mayor número de fallas en el test diagnóstico, y solo una fracción menor de los errores respondió a un olvido del concepto: la mayoría ocurrió al operacionalizarlo, lo que indica un aprendizaje inicial frágil que requeriría consolidación en el tiempo, no una sola explicación adicional. | Test STIRE: conceptos con más fallas — secuenciación (8 menciones), ciclos o bucles (7 menciones), acumuladores (5 menciones). Test STIRE (hallazgo cualitativo): solo alrededor del 15% de los errores se debió a no recordar el concepto; el resto ocurrió al operacionalizarlo. | Duolingo (repetición espaciada como componente central, con estimación de la fuerza de memoria para programar repasos en intervalos crecientes). Respaldo bibliográfico: Woźniak y Gorzelańczyk (1994), base matemática de los algoritmos de repaso espaciado; Cepeda et al. (2006), meta-análisis del efecto de espaciamiento en tareas de recuerdo; Roediger y Karpicke (2006), sobre la práctica de recuperación como complemento del espaciado — los tres verificados en `MATRIZ_ARTICULOS_AMPLIADA.md`. | Dominio y revisión — el cálculo del intervalo de repaso (S05b, apartado 4) ocurriría en esta etapa. | Procesamiento y adaptación (principal, calcula el intervalo); Seguimiento del aprendizaje (apoyo, mantiene la agenda) — S06b, apartado 7. |
| **CAR-05** | Seguimiento del dominio de los conceptos y del progreso | La misma brecha entre autopercepción y desempeño que origina CAR-01 exige, además de adaptar el nivel de entrada, un mecanismo continuo de verificación objetiva del dominio en el tiempo; el docente identificó explícitamente la necesidad de seguimiento continuo e identificación temprana de dificultades. | Test STIRE: contraste autopercepción-desempeño (ver evidencia de CAR-01). Entrevista al docente: necesidades identificadas de "seguimiento continuo del progreso" e "identificación temprana de dificultades". | MATHia (seguimiento continuo del dominio por competencia, visualización del progreso); Duolingo (progreso visible). Respaldo bibliográfico: Bloom (1968), marco original del aprendizaje por dominio (*mastery learning*) que sostiene el seguimiento por etapas — sin que esto fundamente un umbral numérico específico, que queda declarado como decisión propia del proyecto; Verbert et al. (2013), sobre paneles de analítica de aprendizaje para visualizar el progreso — ambos verificados en `MATRIZ_ARTICULOS_AMPLIADA.md`. | Dominio y revisión — los indicadores de seguimiento del dominio (S05b, apartado 6) se calcularían en esta etapa. | Seguimiento del aprendizaje (principal, sin componente de apoyo) — S06b, apartado 7. |
| **CAR-06** | Recomendaciones personalizadas y elementos de motivación | La mayoría de los estudiantes dedica muy poco tiempo a la práctica autónoma fuera de clase, y el docente identificó explícitamente el fortalecimiento de hábitos de estudio como una necesidad no cubierta por la metodología actual. | Encuesta diagnóstica: la mayoría dedica entre una y dos horas semanales a práctica autónoma fuera de clase. Entrevista al docente: necesidad identificada de "fortalecimiento de hábitos de estudio". | Duolingo (sesiones breves, progreso visible como mecanismo de retorno a la práctica). Respaldo bibliográfico: Zimmerman (2002), "Becoming a Self-Regulated Learner: An Overview", sobre los procesos de autorregulación que sostienen el hábito de estudio autónomo — verificado en `MATRIZ_ARTICULOS_AMPLIADA.md`. | Exploración — el rol del tutor de priorizar y organizar contenidos (S05b, apartado 3) incluiría orientar qué revisar a continuación. | Generación de respuestas (principal); Procesamiento y adaptación (apoyo, decide la recomendación) — S06b, apartado 7. |

**Nota 1 — matriz completa.** La columna 6 (etapa) se completó con el criterio de salida definido
en el entregable 02 (`S05b_ModeloPedagogico_Especificacion`, apartado 3). La columna 7 (componente
de arquitectura) se completó el 2026-09-14 con la tabla de correspondencia del entregable 03
(`S06b_ArquitecturaFuncional_Especificacion`, apartado 7), que es la que cierra formalmente este
círculo — cada característica queda ahora trazada de punta a punta: hallazgo diagnóstico →
evidencia → referente → etapa del modelo → componente de arquitectura.

---

## Producto 2 — Texto para el informe

### Párrafo de presentación (previo a la tabla)

Las seis características que integrarían la propuesta del tutor inteligente surgirían de un
ejercicio de triangulación entre dos fuentes de evidencia, ninguna suficiente por separado. Por un
lado, el diagnóstico aplicado a los veinte estudiantes de tercer semestre —mediante el Test
Digital de Diagnóstico Algorítmico, la encuesta diagnóstica y la entrevista semiestructurada al
docente— reveló dificultades cognitivas, metodológicas y motivacionales concretas, no
generalidades sobre la enseñanza de la algoritmia. Por otro lado, el análisis de Khan Academy,
Duolingo y MATHia mostró qué mecanismos de personalización, repetición y retroalimentación habrían
demostrado sostenerse en contextos afines, aunque ninguno de los tres cubriría de manera
simultánea la especialización en algoritmia universitaria y la repetición espaciada explícita. En
consecuencia, cada característica presentada a continuación no se derivaría de una sola de esas
fuentes, sino del cruce entre ambas: una necesidad diagnosticada que habría encontrado, en al
menos un referente analizado, un mecanismo capaz de atenderla. La matriz que sigue documentaría
ese cruce fila por fila, con la evidencia y la fuente exactas de cada vínculo, de modo que la
relación entre lo que el diagnóstico mostró y lo que la propuesta plantea permanezca trazable y no
dependa de una afirmación general no verificable.

*(174 palabras)*

### Párrafo de cierre (posterior a la tabla)

Del cruce anterior, la característica que resultaría más determinante para la propuesta sería la
repetición espaciada para reforzar conceptos con dificultades (CAR-04), porque operaría
directamente sobre el hallazgo más específico del diagnóstico: los conceptos de secuenciación,
ciclos y acumuladores concentraron el mayor número de fallas, y solo una fracción menor de los
errores respondió a un desconocimiento del concepto, mientras que la mayoría habría ocurrido al
operacionalizarlo. Reforzar esos conceptos una sola vez mediante una explicación adicional no
atendería ese patrón; hacerlo en intervalos crecientes sí lo haría, por ser la estrategia que la
literatura consultada y el referente de Duolingo asocian de manera directa con la consolidación de
un aprendizaje ya practicado pero todavía frágil. Además, CAR-04 sería la característica que da
nombre al problema de investigación, de modo que su justificación diagnóstica sostendría la
pertinencia del proyecto en su conjunto. Los apartados siguientes desarrollarían, en ese orden, el
modelo pedagógico preliminar que precisaría cómo operaría esa repetición y las demás
características, y la arquitectura funcional preliminar que identificaría qué componente del
tutor las soportaría.

*(179 palabras)*

---

## Producto 3 — Especificación del gráfico

> **Producido 2026-09-14.** El gráfico ya existe como imagen (`docs/investigacion/figuras/S05a_grafico1_familias.png`)
> y ya está embebido en el Google Doc de este entregable (enlace arriba). La especificación que
> sigue documenta cómo se construyó, para trazabilidad.

**Tipo de gráfico.** Diagrama de bloques agrupados, de exactamente dos niveles jerárquicos
(familia → característica). No añadir un tercer nivel.

**Nivel 1 — tres contenedores de familia**, dispuestos en una sola fila horizontal, del mismo
tamaño y tratamiento visual entre sí, sin flechas entre ellos (las tres familias son paralelas,
no secuenciales; agruparlas ya comunica esa relación):

1. **Adaptación** — contiene CAR-01 y CAR-05.
2. **Acompañamiento** — contiene CAR-02 y CAR-03.
3. **Consolidación** — contiene CAR-04 y CAR-06.

**Nivel 2 — dentro de cada contenedor de familia**, dos bloques del mismo tamaño (uno por
característica), cada uno con dos líneas de texto: el ID en la línea superior (`CAR-01`) y el
enunciado abreviado a un máximo de seis palabras en la línea inferior (por ejemplo, para CAR-01:
"Adaptación al nivel y ritmo").

**Relación opcional.** Si se desea una única marca transversal, puede añadirse una llave o nota al
pie del gráfico que indique que las tres familias, en conjunto, corresponden a las seis
características ya definidas en el apartado 5.4.1 — sin conectar los bloques entre sí con flechas.

**Restricción.** No subdividir cada característica en su evidencia o su fuente dentro del gráfico:
esa información ya está en la tabla del Producto 1 y duplicarla en la imagen violaría el límite de
dos niveles de jerarquía visual.

---

## Pendientes de este entregable

- Ninguno. La matriz quedó completa el 2026-09-14 tras producir el entregable 03 (ver Nota 1).

## Respaldo bibliográfico añadido en esta sesión (2026-09-14)

Las columnas 5 de CAR-01 y CAR-06 no tenían, en la matriz bibliográfica del proyecto, una obra que
tratara específicamente el ritmo individualizado o la motivación/autorregulación. Se buscaron
candidatos y se verificaron uno por uno contra Crossref antes de citarlos —siguiendo el mismo
criterio ya vigente en `MATRIZ_ARTICULOS_AMPLIADA.md`, nunca mediante investigación automática de
NotebookLM (ver `docs/investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md` §9, punto 4)—:

- Bloom, B. S. (1984). *The 2 Sigma Problem: The Search for Methods of Group Instruction as
  Effective as One-to-One Tutoring*. Educational Researcher, 13(6), 4-16.
  DOI 10.3102/0013189X013006004 — verificado contra Crossref, título y autor coinciden.
- Zimmerman, B. J. (2002). *Becoming a Self-Regulated Learner: An Overview*. Theory Into
  Practice, 41(2), 64-70. DOI 10.1207/s15430421tip4102_2 — verificado contra Crossref, título y
  autor coinciden.

Ambas quedaron agregadas como obras #30 y #31 de `MATRIZ_ARTICULOS_AMPLIADA.md`, con su nivel de
evidencia y la decisión que fundamentan, para que cualquier entregable futuro del informe (o del
software) pueda reutilizarlas sin repetir la búsqueda.
