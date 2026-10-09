# Práctica adaptativa y reutilización: confianza, ejercicios hermanos, dominio vivo y banco del docente

**Estado:** aprobado por el dueño del proyecto el 2026-09-27. Pasos 1 y 2 del backend hechos (ver `PLAN_MAESTRO.md` §6.00).
**Relación con otros documentos:**
- Desarrolla los pilares 1, 2 y 3 de la visión y el punto 6 de la hoja de ruta de
  `investigacion/REFERENTES_PLATAFORMAS_Y_STI.md`.
- Cuando se apruebe, sus fases pasan al Plan Maestro (`PLAN_MAESTRO.md` §6).

**Pedido del dueño (2026-09-27).**
1. Recomendar al estudiante un ejercicio, o preguntarle en una escala cómo se siente con el tema, para
   darle uno con el peso adecuado a su confianza.
2. Que haya **varias actividades del mismo tipo y nivel**, para que al volver a encontrarse con ese tipo
   de actividad tenga otra parecida.
3. Que el aumento del dominio tenga **un orden lógico**, como en las plataformas con repetición espaciada
   (Duolingo, Anki).
4. **No saturar al estudiante:** que se sienta libre pero siga un flujo como Duolingo, con una sola
   pregunta de confianza de tres opciones.
5. **Reutilizar lo ya hecho:** copiar el contenido de una clase a otra (dos salones de la misma materia) y
   un banco para no crear ejercicios constantemente.

---

## 1. Cómo funciona hoy (código revisado el 2026-09-27)

| Pieza | Qué hace | Dónde | Problema |
|---|---|---|---|
| Recomendación | La primera actividad publicada, por `order`, que el estudiante no ha aprobado | `learning-progress.service.ts` → `getNextActivity` | No mira la dificultad, ni la confianza, ni el tipo de ejercicio. Todos reciben el mismo orden |
| «Elegir yo mismo» | Botón que muestra la lista de actividades de la unidad | `pages/estudiante/unidad/[id].vue` | El Plan Maestro §4.4 lo llama «selector de autopercepción», pero **no hay ninguna escala**: es una lista |
| Dominio | Mejor nota de cada actividad × peso del tipo; lo básico repetido pesa menos | `common/utils/mastery.calculator.ts` | Como usa la **mejor** nota, **nunca baja**, aunque el estudiante falle un repaso meses después |
| Repasos (SM-2) | Programa el repaso de la **unidad** según el dominio | `review-schedules.service.ts`, `common/utils/spaced-repetition.ts` | La calidad de la respuesta sale del dominio, que nunca baja. Así un repaso fallado no reinicia el intervalo. Además, el repaso lleva a la misma unidad y a los **mismos** ejercicios, que ya se saben de memoria o ya no tienen intentos (`attemptsAllowed`, 3 por defecto) |
| Banco de preguntas | Entidades `QuestionBank` y `BankQuestion` (con etiquetas) | `src/question-banks/` | Existe en la base, pero **no hay servicio, ni API, ni pantalla**: nadie lo usa |
| Reutilización | Nada: no se puede copiar una clase, ni traer unidades de otra, ni duplicar un ejercicio | `src/class/`, `src/activities/` | Cada salón o semestre obliga a crear todo otra vez |
| Dificultad | Cada actividad tiene `difficulty`: básico, intermedio o avanzado | `activities/entities/activity.entity.ts` | Solo se usa para que lo básico repetido pese menos; la recomendación la ignora |

**En resumen:** las piezas existen (dificultad, tipos, SM-2, peso justo, banco), pero no están conectadas
entre sí ni con lo que el estudiante siente.

---

## 2. Qué dice la evidencia

- **Preguntarle al estudiante cómo se siente es útil, pero no basta.**
  - Los estudiantes sobreestiman lo que saben. Quien se sobreestima deja de estudiar antes y retiene menos
    (Dunlosky y Rawson, 2012).
  - Los menos hábiles son los que peor se evalúan (Kruger y Dunning, 1999).
  - **Regla:** la confianza decide **qué ejercicio sigue** y **cuándo repasar**; **nunca** sube el dominio
    por sí sola. El dominio solo lo mueven los resultados.
- **Los errores cometidos con seguridad son los más valiosos de corregir.** Se corrigen mejor que los
  errores con duda: es el efecto de hipercorrección (Butterfield y Metcalfe, 2001). Un error con seguridad
  señala un **concepto erróneo**. Merece una explicación del tutor, no solo «inténtalo otra vez».
- **Anki hace exactamente esto después de cada tarjeta.** Tiene cuatro botones: *Again* (no lo recordé),
  *Hard* (acerté con dudas o me costó), *Good* (acerté con esfuerzo normal) y *Easy* (sin esfuerzo). Cada
  uno programa el siguiente repaso a una fecha distinta. Es la misma idea que la «calidad de respuesta
  0-5» del SM-2 original (Woźniak, matriz #2).
- **La dificultad ideal no es ni muy fácil ni muy difícil.**
  - Un modelo teórico de aprendizaje con retroalimentación encuentra el punto óptimo cerca de un **85 % de
    aciertos** (Wilson et al., 2019).
  - Duolingo (Birdbrain) estima a la vez la habilidad del estudiante y la dificultad de cada ejercicio.
    Cuando alguien falla, baja la estimación de su habilidad y sube la de la dificultad del ejercicio.
  - En sistemas educativos, el método Elo hace lo mismo con muy poco cálculo (Pelánek, 2016).
- **Repasar con un ejercicio nuevo del mismo tipo es mejor que repetir el mismo.** La práctica de
  recuperación funciona cuando hay que *recuperar* el concepto, no la respuesta memorizada (matriz #4;
  Dunlosky et al., 2013). En programación hay precedente de ejercicios parametrizados individuales
  (QuizPACK, Brusilovsky y Sosnovsky, 2005). Khan Academy mezcla varias habilidades en sus retos de dominio.
- **El dominio puede bajar.** En Khan Academy, el nivel de una habilidad baja si después se fallan
  preguntas de ella.

---

## 3. El diseño propuesto

### 3.0 Principio: libre, pero con un camino claro (como Duolingo)

El estudiante **no se debe saturar**. Hay siempre un camino evidente, y todo lo demás es opcional.

- **Un solo botón principal:** «Continuar». Lleva al siguiente paso recomendado: lección, ejercicio o
  repaso.
- **Todo lo demás queda a un clic y nunca bloquea:** «Elegir yo mismo», el tutor, los repasos.
- **Como máximo una pregunta de confianza por unidad**, de tres opciones, que se puede saltar. Nunca
  aparece una ventana que obligue a responder.
- **La recomendación se explica en una línea.** No hay pantallas intermedias.

### 3.1 Una sola pregunta de confianza, de tres opciones

> **¿Cómo te sientes con «Ciclos mientras»?**
> `Es nuevo para mí` · `Tengo dudas` · `Me siento seguro`

**Cuándo aparece (y solo entonces):**
1. La **primera vez** que el estudiante abre la unidad, como una tarjeta encima del botón «Continuar».
   Si no responde y pulsa «Continuar», no pasa nada: se asume «Es nuevo para mí».
2. Cuando **llega el repaso** de esa unidad. Así el estudiante ve si su sensación cambió.

**Qué hace con la respuesta:**
- **Decide el punto de partida** (§3.3):
  - «Es nuevo»: nivel básico.
  - «Tengo dudas»: nivel básico, saltando la lección si ya la leyó.
  - «Me siento seguro»: se ofrece un **reto** de nivel más alto.
- **Ajusta el repaso.**
  - Si dice «seguro» y falla, hay una posible idea equivocada. El tutor explica primero, y el docente lo
    ve en su panel. La investigación muestra que estos errores son los que mejor se corrigen.
  - Si dice «dudas» y acierta, el conocimiento es frágil y el repaso queda más cerca.
- **Nunca sube el dominio por sí sola.** El dominio solo lo mueven los resultados.

**Lo que no se pregunta (para no saturar):** no hay una pregunta después de cada ejercicio. La seguridad
dentro del ejercicio se estima con lo que ya se mide:
- acertó al primer intento;
- usó «Probar» antes de entregar;
- pidió ayuda al tutor.

**Calibración, para el estudiante que quiera verla.** En la pantalla de Progreso aparece, sin ventanas
emergentes: «Cuando dices que te sientes seguro, aciertas el 80 %».

### 3.2 Ejercicios hermanos: varios del mismo tipo y nivel

**Definición, sin cambiar la base de datos.** Dos actividades son **hermanas** si son de la **misma
unidad**, el **mismo tipo de pregunta** (ordenar, completar código, programar…) y la **misma
dificultad**. Cada combinación (tipo, nivel) de una unidad es una **casilla**, y la meta es que cada
casilla usada tenga **2 o 3 hermanas**.

**Para qué sirven.**
1. **Reintento real.** Si el estudiante agota los intentos o falla, se le ofrece una hermana: otra
   versión del mismo reto, no la misma respuesta memorizada.
2. **Repaso real.** El repaso usa una hermana que no ha hecho, o la que hizo hace más tiempo.
3. **Justicia (pilar 3).** Resolver varias hermanas no infla el dominio. Cada casilla cuenta con su mejor
   evidencia reciente, no con la suma de todas.

**El docente no tiene que escribirlas desde cero.** Salen de la reutilización (§3.5):
- «Duplicar como variante»;
- traerlas de su banco;
- más adelante, un borrador de variante con IA que el docente revisa.

La unidad muestra un aviso discreto: «El nivel intermedio de *Completar código* tiene 1 ejercicio; añade
una variante para los repasos».

### 3.3 El orden: cómo sube el dominio

**Orden dentro de una unidad.** Va de reconocer a crear (PRIMM y ejemplos desvanecidos, ver el documento
de referentes §6):

```
Nivel:  básico ─────────────▶ intermedio ─────────────▶ avanzado
Tipo:   predecir (mcq) → ordenar/emparejar/clasificar → completar código → programar / HTML-CSS
```

**Reglas del recomendador (versión 1: simples, explicables y probadas):**

1. **Repaso primero.** Si esta unidad tiene un repaso vencido, el siguiente paso es una **hermana** de
   una casilla ya aprobada.
2. **Dónde empieza.** Según la respuesta de §3.1:
   - «Es nuevo», «Tengo dudas» o sin respuesta: básico.
   - «Me siento seguro»: un **reto** del nivel siguiente. Si lo acierta al primer intento, las casillas
     básicas quedan como «saltadas»: no hace falta hacerlas, pero siguen disponibles. Así funciona el
     «saltar adelante» de Duolingo.
3. **Siguiente casilla.** La primera casilla sin aprobar del nivel actual, en el orden de tipos de
   arriba. Dentro de la casilla, la hermana que no ha intentado.
4. **Subir de nivel.** Al aprobar todas las casillas del nivel **o** al acertar dos seguidas al primer
   intento.
5. **Bajar de nivel.** Tras dos fallos seguidos en el mismo nivel, se recomienda una casilla del nivel
   anterior y el tutor ofrece ayuda.
6. **Zona justa.** Si en los últimos 6 intentos acierta más del 90 % al primer intento, se sugiere subir.
   Si acierta menos del 50 %, se sugiere bajar. La meta es rondar entre 70 y 85 % (Wilson et al., 2019).
7. **Siempre con explicación, en una línea.** Por ejemplo: «Acertaste dos seguidas: probemos el nivel
   intermedio».
8. **«Elegir yo mismo» sigue existiendo.** La recomendación nunca encierra al estudiante.

**Versión 2, cuando haya datos del piloto:** estimar la habilidad del estudiante y la dificultad real de
cada ejercicio con Elo (Pelánek, 2016), como Birdbrain de Duolingo. La dificultad que marcó el docente
pasa a ser el punto de partida, no la verdad fija.

### 3.4 Dominio y repasos que se mantienen vivos

> **Desde el 10/10/2026 el dominio se calcula con el motor por evidencia** (`docs/DISENO_DOMINIO.md`): cada casilla es
> una estimación que se mueve con cada intento (sube rápido con ejercicios nuevos, poco al repetir y baja poco al
> fallar), y los intentos se reabren a las 24 horas para que siempre se pueda llegar al 100 %. Lo de abajo sigue
> valiendo para los repasos (la calidad sale del resultado); «la casilla cuenta con su mejor nota» es la regla de
> antes del corte.

1. **La calidad del repaso sale del resultado**, no del dominio acumulado. Se traduce como los botones de
   Anki, sin preguntarle nada al estudiante:

   | Resultado | Anki | Calidad SM-2 |
   |---|---|---|
   | Falló | *Again* | 1: reinicia el intervalo |
   | Acertó con varios intentos o con ayuda del tutor | *Hard* | 3 |
   | Acertó al primer intento | *Good* | 4 |
   | Acertó al primer intento y había dicho «Me siento seguro» | *Easy* | 5 |

2. **Un repaso fallado baja el dominio de la unidad**, de forma moderada. La casilla repasada cuenta con su
   nota más reciente, no con la mejor. Así el estado puede volver de «Dominado» a «Comprensión parcial»,
   como el nivel que baja en Khan Academy.
3. **Dominio y memoria se muestran por separado:**
   - **Dominio:** cuánto demostró.
   - **Memoria:** qué tan fresco está; es «Se está olvidando» cuando el repaso está vencido.
4. **Repaso mixto (práctica intercalada).** Una sesión corta de 5 ejercicios hermanos de 2 o 3 unidades
   con repaso vencido. Entra al «Continuar» como un paso más de la ruta, no como una obligación aparte.

### 3.5 Reutilizar lo que ya se hizo: no crear ejercicios constantemente

**El caso del docente:** dicta la misma materia en dos salones, o la repite cada semestre. No debería
volver a crear nada. Las plataformas grandes lo resuelven así:
- **Moodle:** *Import course data* (traer secciones y actividades de otro curso propio) y *bancos de
  preguntas compartidos* entre cursos.
- **Canvas:** *Course Import* (copiar un curso entero o solo algunos módulos) y *Blueprint* (un curso
  maestro que sincroniza cambios con sus copias).

**Propuesta para STIRE, de lo más simple a lo más completo:**

| # | Función | Cómo se ve | Por dentro |
|---|---|---|---|
| R1 | **Crear una clase a partir de otra** | Al crear una clase: «Empezar vacía» o «Copiar el contenido de…» (lista de sus clases) | Copia secciones, temas, unidades, lecciones y ejercicios **como borrador**. No copia estudiantes, entregas ni progreso. Código de clase nuevo |
| R2 | **Importar partes de otra clase** | En Contenidos: «Traer de otra clase» y marcar las secciones, temas o unidades que quiere | La misma copia, pero parcial y dentro de una clase existente |
| R3 | **Mi banco de ejercicios** | Pestaña «Mi banco» con todos los ejercicios de sus clases, con filtros por tipo, nivel y texto | **Implementado (27/09) como una vista** de los ejercicios de todas sus clases, no como una copia aparte: siempre está al día con lo que el docente edita y no hay que «guardar en el banco». `QuestionBank` y `BankQuestion` quedan para compartir entre docentes (R6) |
| R4 | **Agregar desde el banco** | En una unidad: «Agregar ejercicio» → «Desde mi banco» | Copia el ejercicio del banco a la unidad |
| R5 | **Duplicar como variante** | En cada ejercicio: «Duplicar como variante», que copia tipo, nivel y configuración para cambiar solo los datos | Crea la hermana en la misma unidad y en el banco |
| R6 | **Compartir con colegas** (después) | «Hacer público» un banco; otros docentes lo ven y copian | `QuestionBank.isPublic` ya existe |

**Decisión técnica: siempre copiar, nunca enlazar.** Si dos salones comparten *el mismo* ejercicio y el
docente lo corrige en uno, cambian las notas del otro, que ya tenía entregas. Copiar es más simple y más
seguro. Cada copia guarda de dónde salió, para poder decir «este ejercicio viene de *Algoritmia
2026-1*». Una sincronización tipo Blueprint queda para más adelante, si hace falta.

---

## 4. Cambios en el software

| Capa | Cambio |
|---|---|
| Base de datos | `learning_progress.entryConfidence` (1-3, opcional). Columna de origen (`copiedFromId`, opcional) en actividades, contenidos y unidades. Todo en una migración, con columnas opcionales |
| Backend: recomendador | Función pura `recomendarSiguiente(actividades, entregas, confianza, repasoVencido)` que devuelve actividad y motivo. `getNextActivity` la usa |
| Backend: repasos | `calculateNextReview` recibe la **calidad** (§3.4) en lugar del dominio; la casilla repasada cuenta con su nota más reciente |
| Backend: reutilización | Servicio de copia de clase y de partes de clase (en una transacción, todo como borrador); servicio y API del banco (`src/question-banks/`) con guardado automático; «duplicar como variante» |
| API (implementada) | `PUT /learning-progress/unit/:unitId/confidence`; `POST /reuse/classes/:classId/import` (`sourceClassId`, `sectionIds` opcional); `GET /reuse/bank` (`type`, `difficulty`, `q`); `POST /reuse/activities/:activityId/copy` (`learningUnitId`, `variant`) |
| Frontend (estudiante) | Tarjeta de confianza de tres opciones; «Continuar» con el motivo en una línea; «Dominio» y «Memoria» por unidad; repaso mixto dentro de la ruta; calibración en Progreso |
| Frontend (docente) | «Copiar el contenido de…» al crear una clase; «Traer de otra clase»; pestaña «Mi banco»; «Desde mi banco»; «Duplicar como variante»; aviso de casillas con una sola hermana |
| Contenido | ALGO-203413 y PENSAR-ALGO con **al menos 2 hermanas por casilla**; la prueba `cursos-pedagogicos.spec.ts` lo exige y califica cada variante con el motor real |
| Simulación | Perfiles de confianza en las personas (Andrés sobreconfiado, Camila insegura), y un segundo salón de Laura creado **copiando** ALGO-203413 |

**Pruebas que prueban la propiedad y no la intención:**
- tabla de casos del recomendador, una por regla de §3.3;
- «la confianza sola no sube el dominio»;
- «un repaso fallado reinicia el intervalo y baja el estado»;
- «el repaso ofrece una hermana no intentada»;
- «copiar una clase no copia estudiantes ni entregas, y la copia queda en borrador»;
- «un docente no puede copiar la clase ni el banco privado de otro docente» (autorización, igual que el
  resto del sistema);
- «editar la copia no cambia el original».

---

## 5. Decisiones que tiene que tomar el dueño del proyecto

1. **¿Un repaso fallado baja el dominio?** *Recomendación: sí, de forma moderada* (§3.4.2).
2. **¿Copiar o enlazar entre salones?** *Recomendación: copiar* (§3.5).
3. **¿Compartir bancos entre docentes en la primera versión?** *Recomendación: no.* Primero el banco
   propio; compartir después.

Ya decidido por el dueño (2026-09-27): una sola pregunta de confianza, de tres opciones, sin saturar;
flujo libre pero guiado, como Duolingo; reutilizar contenido entre clases y un banco de ejercicios.

## 6. Referencias nuevas (verificadas en Crossref el 2026-09-27)

Las demás obras citadas están en `investigacion/REFERENTES_PLATAFORMAS_Y_STI.md` §13 o en la matriz.

- Dunlosky, J. y Rawson, K. A. (2012). Overconfidence produces underachievement: Inaccurate self evaluations undermine students' learning and retention. *Learning and Instruction, 22*, 271-280. https://doi.org/10.1016/j.learninstruc.2011.08.003
- Kruger, J. y Dunning, D. (1999). Unskilled and unaware of it. *Journal of Personality and Social Psychology, 77*, 1121-1134. https://doi.org/10.1037/0022-3514.77.6.1121
- Butterfield, B. y Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. *JEP: Learning, Memory, and Cognition, 27*, 1491-1494. https://doi.org/10.1037/0278-7393.27.6.1491
- Wilson, R. C., Shenhav, A., Straccia, M. y Cohen, J. D. (2019). The Eighty Five Percent Rule for optimal learning. *Nature Communications, 10*. https://doi.org/10.1038/s41467-019-12552-4
- Pelánek, R. (2016). Applications of the Elo rating system in adaptive educational systems. *Computers & Education, 98*, 169-179. https://doi.org/10.1016/j.compedu.2016.03.017
- Brusilovsky, P. y Sosnovsky, S. (2005). Individualized exercises for self-assessment of programming knowledge: An evaluation of QuizPACK. *Journal on Educational Resources in Computing, 5*(3), Art. 6. https://doi.org/10.1145/1163405.1163411
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J. et al. (2013). Improving Students' Learning With Effective Learning Techniques. *Psychological Science in the Public Interest, 14*, 4-58. https://doi.org/10.1177/1529100612453266

Plataformas (consultadas el 2026-09-27):
- Anki, botones de respuesta: https://docs.ankiweb.net/studying.html
- Duolingo, Birdbrain: https://blog.duolingo.com/learning-how-to-help-you-learn-introducing-birdbrain/
- Khan Academy, niveles de dominio: https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work
- Moodle, importar contenido de otro curso: https://docs.moodle.org/502/en/Import_course_data
- Moodle, bancos de preguntas: https://docs.moodle.org/501/en/Question_banks
- Canvas, importar contenido de otro curso: https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-copy-content-from-another-Canvas-course-using-the/ta-p/1012
- Canvas, cursos Blueprint: https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-sync-course-content-in-a-blueprint-course-as-an/ta-p/1271
