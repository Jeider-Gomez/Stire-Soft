# Patrones pedagógicos (P-PED)

Cómo se enseña a programar, cómo guía una IA educativa y cómo se repasa. Método y estados en [`README.md`](README.md).
Evidencia: **[obs]** observado por nosotros, **[doc]** documentación oficial, **[inv]** artículo verificado en Crossref
(referencias completas en `../BASE_TEORICA.md`), **[prensa]** periodismo o estudio citado por prensa.

---

## El tutor de IA

### P-PED-01 · Guiar sin dar la respuesta

- **Referentes:**
  - Khanmigo **[doc]**: método socrático.
  - CS50 Duck **[inv: Liu et al., 2024]**: «barreras pedagógicas» para guiar como un buen asistente de cátedra.
  - Codecademy **[doc]**: «primero una pista; si el estudiante insiste, la respuesta».
  - Modo de estudio de ChatGPT y Guided Learning de Gemini **[doc/prensa]**: preguntas guía y comprobar que se
    entendió antes de seguir.
- **Evidencia:**
  - **Sin barreras, daña.** La IA mejora la práctica pero empeora el examen sin ella; un tutor con pistas mitiga
    el daño (Bastani et al., 2025, PNAS).
  - **Bien diseñada, ayuda.** Un tutor de IA con principios pedagógicos superó a una clase activa en un ensayo
    aleatorio (Kestin et al., 2025, *Scientific Reports*).
- **STIRE:** sí. Tres niveles por intentos fallidos y la solución nunca se entrega (`src/tutor/tutor-guidance.ts`).
- **Diferencia con Codecademy:** Codecademy entrega la respuesta si el estudiante insiste. STIRE no, y es una
  decisión deliberada (BT del tutor socrático).

### P-PED-02 · La guía no debe abandonar al que más le cuesta

- **Referente:** Khanmigo **[prensa]**. Los estudiantes abandonaban cuando no recibían la respuesta, y el
  interrogatorio socrático confundía más a los de bajo desempeño que a los demás.
- **Principio [inv]:** el efecto de reversión de la experticia. La guía que sirve a un experto estorba a un novato
  y al revés (Kalyuga, Ayres, Chandler y Sweller, 2003).
- **STIRE:**
  - La ayuda sube de nivel con los intentos fallidos y con un refuerzo del docente (`tutor-guidance.ts`).
  - Desde `386ef8d`, el lenguaje es sencillo en todos los niveles (ver P-PED-05).
- **Propuesto:** medir en la prueba cuántas conversaciones se abandonan tras la primera respuesta del Tutor.

### P-PED-03 · Ayuda en el momento del error

- **Referentes:** Duolingo Max «Explain My Answer» **[doc]**; Khan Academy **[prensa]**; Codecademy explica
  errores **[doc]**.
- **Principio [inv]:** el dilema de la asistencia (Koedinger y Aleven, 2007, matriz #6). La ayuda llega cuando hay
  evidencia de dificultad, no antes.
- **STIRE:** sí. Ver P-UI-08; hecho en `47cce51`.

### P-PED-04 · El tutor conoce el contexto: la lección, el ejercicio y el código

- **Referentes:** Codecademy **[doc]** («sabe en qué punto de qué lección estamos»); Coursera Coach **[doc]**
  (usa los materiales del curso); Platzi Answers **[doc]** (se pregunta desde la clase).
- **STIRE:** sí. Recibe el código del editor, el ejercicio y el texto de la lección (`tutor-context.service.ts`).

### P-PED-05 · Hablarle al estudiante a su nivel en el tema que tiene abierto

- **Problema observado [obs, 03/10]:** un estudiante con dos lecciones del principio dominadas quedaba «avanzado»
  por el promedio. En un ejercicio básico, el Tutor le hablaba de «deserializar» y «stdout» y le dijo «dado tu
  perfil avanzado».
- **Principio [inv]:** Kalyuga et al. (2003). La experticia es por tema: se puede ser experto en variables y novato
  en ciclos.
- **Decisión:**
  - El nivel se mide en la unidad abierta.
  - Todos los niveles reciben lenguaje sencillo.
  - Al avanzado se le propone un reto, no jerga.
- **Estado:** hecho, `386ef8d`. Pendiente desplegar el backend.

### P-PED-06 · El docente decide cuánta ayuda da la IA

- **Referentes:** Coursera Coach **[doc]**: el instructor arma diálogos socráticos con rúbricas. Khanmigo para
  docentes **[doc]**.
- **STIRE:** sí. El docente puede limitar el nivel de ayuda o apagar el Tutor en una parte del curso
  (`tutor-settings`).

---

## Enseñar a programar

### P-PED-07 · Leer, probar y ver el resultado en la misma pantalla

- **Referentes:** Codecademy **[doc]**, LeetCode **[obs]**, freeCodeCamp **[doc]**.
- **Principio [inv]:** la atención dividida (Sweller et al., 1998).
- **STIRE:** sí, con la pantalla dividida y los casos de prueba públicos y ocultos.

### P-PED-08 · Pistas en escalera antes de cualquier solución

- **Referentes:** LeetCode **[obs]**: botón *Hint* en el problema y *Editorial* (explicación oficial) en otra
  pestaña. Codecademy **[doc]**: *Get Unstuck* con repaso del concepto y luego la solución. Khan Academy **[doc]**:
  pistas paso a paso.
- **STIRE hoy:** las pistas las da el Tutor; el ejercicio no tiene pistas escritas por el docente.
- **Propuesto:** pistas opcionales que el docente escribe por ejercicio y se revelan de a una. El Tutor sigue
  disponible. **Prioridad 2.**

### P-PED-09 · Un camino con orden, y la opción de practicar libre

- **Referentes:** Exercism **[doc]**: un árbol de conceptos que se van desbloqueando («modo aprendizaje») y un
  «modo práctica» que abre todo. Duolingo **[doc]**: una sola ruta. Coursera **[obs]**: módulos por semana.
- **STIRE:** existe la estructura de prerrequisitos (`src/prerequisites`). El estudiante ve «Tu siguiente paso».
- **Decisión:** mantener el camino sugerido sin bloquear. Encaja con la regla de herramienta flexible: el docente
  decide.

### P-PED-10 · Problema primero, explicación después

- **Referente:** Brilliant **[doc]**. Cada lección es una serie de problemas pequeños; si se falla, retrocede, y
  si se acierta, sube la dificultad. La empresa afirma que es «6 veces más eficaz» que el video; es una
  afirmación de la empresa, no evidencia.
- **Propuesto:** una pregunta corta al inicio de la lección, antes de la explicación. **Prioridad 5.**

### P-PED-11 · Retroalimentación humana además de la automática

- **Referentes:** Exercism **[doc]**: mentores voluntarios comentan el código. Platzi y Sololearn **[doc]**:
  comentarios y preguntas por clase.
- **STIRE:** el docente comenta las entregas (BT-01) y hay mensajes. **Propuesto:** preguntas por lección visibles
  para la clase. **Prioridad 6.**

### P-PED-12 · Lo del estudiante, a su manera: proyectos

- **Referentes:** freeCodeCamp **[doc]** (proyectos para certificar), Codecademy **[doc]** (proyectos guiados).
- **STIRE:** sí, «Mis proyectos». El Tutor guía y no escribe el proyecto (BT-19).

---

## Repasar para no olvidar

### P-PED-13 · Repetición espaciada con lo que el estudiante falló

- **Referentes:** Anki **[doc]**: SM-2 y, desde 2023, FSRS. Duolingo **[inv: Settles y Meeder, 2016]**: modelo de
  vida media del recuerdo. Quizlet **[doc]**: ordena las tarjetas de la sesión por probabilidad de recordarlas.
- **STIRE:** SM-2. La calidad sale del resultado real del repaso, como los botones de Anki
  (`src/common/utils/spaced-repetition.ts`).

### P-PED-14 · Elegir cuánto se quiere recordar (retención deseada)

- **Referente:** Anki con FSRS **[doc]**.
  - Se elige la probabilidad de recordar, por ejemplo 90 %, y el intervalo se calcula para ella.
  - Pasar del 90 % al 95 % duplica los repasos.
  - Según sus autores, FSRS logra la misma retención con 20 a 30 % menos repasos que SM-2.
  - Base científica: Ye, Su y Cao (2022) **[inv]**.
- **Propuesto:** retención deseada configurable por el docente y migración a FSRS cuando haya datos de uso real
  para ajustarlo. **Prioridad 4** (ya estaba en la hoja de ruta, #9).

### P-PED-15 · El repaso aparece donde el estudiante ya está

- **Referentes:** Duolingo **[doc]**: práctica personalizada dentro de cada unidad. Khan Academy **[doc]**: retos de
  dominio que mezclan habilidades.
- **STIRE:** los repasos tienen su pantalla, el inicio muestra «Repasar (5 para hoy)» y el Tutor los recuerda en
  una franja que se puede ocultar (`9e2feec`). **Pendiente:** repaso mixto de varias unidades (hoja de ruta #6).

---

## Fuentes de esta página

**Artículos verificados** (detalle en `../BASE_TEORICA.md`):
- Bastani et al. (2025).
- Kestin et al. (2025).
- Liu et al. (2024).
- Kalyuga et al. (2003).
- Koedinger y Aleven (2007).
- Sweller et al. (1998).
- Settles y Meeder (2016).
- Ye, Su y Cao (2022).

**Plataformas:** fichas con enlaces en `ENSENANZA_DE_PROGRAMACION.md`, `IA_EDUCATIVA.md` y `REPETICION_ESPACIADA.md`.
