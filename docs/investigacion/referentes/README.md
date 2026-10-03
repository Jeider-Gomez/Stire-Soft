---
estado:  vivo (se actualiza cada vez que se estudia un referente o se toma una decisión con base en uno)
creado:  2026-10-03
---

# Referentes de STIRE: qué aprendemos de las plataformas exitosas y dónde quedó

## Por qué existe esta carpeta

El 03/10/2026 el dueño del proyecto preguntó dónde estaba el análisis de las plataformas de referencia y por qué
no se había tomado nada relevante de él. Tenía razón. `../REFERENTES_PLATAFORMAS_Y_STI.md` (27/09) es una buena
investigación de **funciones y pedagogía**, pero:

1. **No miraba la pantalla.** No decía dónde está el encabezado, si la barra lateral se queda al bajar, dónde se
   abre el tutor ni cuánto ocupa cada cosa. Lo que más nota un estudiante quedó fuera.
2. **Su evidencia era de segunda mano**: blogs y documentación oficial. Nadie abrió las páginas para medirlas.
3. **Terminaba en una lista de ideas sin dueño ni estado.** Ningún hallazgo llevaba a una decisión con fecha,
   ni la decisión a un cambio en el código. Por eso «se analizó» y no pasó nada.

Esta carpeta cambia el método. **Cada hallazgo termina en una decisión, y cada decisión en un estado verificable**:
hecho (con su commit), propuesto (con prioridad) o descartado (con la razón).

## El método: tres lentes, una decisión

Cada referente se estudia con tres lentes:

| Lente | Pregunta | Ejemplo |
|---|---|---|
| **Pedagogía** | ¿Cómo hace que se aprenda? | Brilliant: cada lección es una serie de problemas pequeños; si fallas, retrocede |
| **UX (experiencia)** | ¿Qué tan fácil es hacer lo que uno vino a hacer? | LeetCode: «Run» y «Submit» siempre en la barra de arriba |
| **UI (interfaz)** | ¿Cómo está dispuesta la pantalla? | Coursera: el asistente se abre en un panel a la derecha sin tapar el contenido |

Cada hallazgo se registra como **patrón** con este formato:

- **Referentes:** qué plataformas lo usan.
- **Evidencia:** observación propia fechada (medición o captura con el navegador), documentación oficial o
  artículo verificado. Se dice cuál de las tres es.
- **Principio:** la teoría que lo explica, si existe. Las obras citadas están verificadas en Crossref.
- **Decisión para STIRE:** adoptar, adaptar o descartar, y por qué.
- **Estado:** hecho (commit), propuesto (prioridad) o descartado (razón).

Las decisiones con fundamento teórico pasan a `../BASE_TEORICA.md` como entrada BT, que es lo que se anexa a la
tesis. Así la base teórica explica **por qué STIRE está diseñado así**, y este catálogo dice **de dónde salió la
idea**.

## Qué hay aquí

| Archivo | Contenido |
|---|---|
| [`PATRONES_DE_INTERFAZ.md`](PATRONES_DE_INTERFAZ.md) | Catálogo **P-UI**: disposición de pantalla, navegación, el tutor en la interfaz, formularios |
| [`PATRONES_PEDAGOGICOS.md`](PATRONES_PEDAGOGICOS.md) | Catálogo **P-PED**: cómo se enseña programación, cómo guía una IA educativa, cómo se repasa |
| [`ENSENANZA_DE_PROGRAMACION.md`](ENSENANZA_DE_PROGRAMACION.md) | Fichas: Coursera, Platzi, LeetCode, Codecademy, freeCodeCamp, Exercism, Khan Academy, CS50, Brilliant, Udemy, Sololearn y Mimo |
| [`IA_EDUCATIVA.md`](IA_EDUCATIVA.md) | Fichas: Khanmigo, CS50 Duck, Coursera Coach, asistente de Codecademy, Duolingo Max, modo de estudio de ChatGPT, Guided Learning de Gemini y Koji de Brilliant |
| [`REPETICION_ESPACIADA.md`](REPETICION_ESPACIADA.md) | Fichas: Anki (SM-2 y FSRS), Duolingo, Quizlet, RemNote y SuperMemo |
| [`OBSERVACION_2026-10-03.md`](OBSERVACION_2026-10-03.md) | Qué se midió en las páginas reales y en STIRE ese día, y cómo |

`../REFERENTES_PLATAFORMAS_Y_STI.md` se conserva. Las fichas lo citan donde ya decía algo bien fundamentado (qué es
un STI, la evidencia sobre IA generativa, gamificación). No se repite aquí.

## Lo que salió de esta ronda (03/10/2026)

**Hecho y en producción.** Cada uno se verificó en stire-soft.vercel.app con el navegador automatizado.

| Patrón | Qué cambió | Commit |
|---|---|---|
| P-UI-01 | Encabezado fijo y semitransparente con desenfoque | `f785dd7` |
| P-UI-02 | Barra lateral fija al bajar, con su propio scroll (antes se iba ~1100 px) | `f785dd7` |
| P-UI-03 | «Ocultar el menú»: un solo ícono arriba a la derecha | `f785dd7`, `455cb12` |
| P-UI-04 | Lanzador del Tutor siempre visible: en el encabezado en computador, flotante con texto en el celular | `f785dd7` |
| P-UI-05 | En el celular, «Probar» y «Entregar» se quedan arriba al bajar al editor | `f785dd7` |
| P-UI-07 | Atajos del Tutor solo al empezar un ejercicio; después, con el bombillo | `84fbf44` |
| P-UI-08 / P-PED-03 | El Tutor se ofrece justo cuando falla un caso de prueba o un intento | `47cce51` |
| P-UI-09 | Registro en dos pasos: lo obligatorio cabe sin bajar | `00e383b` |
| P-PED-05 | El Tutor mide el nivel en el tema abierto y habla sencillo a todos | `386ef8d` |

**Propuesto, por prioridad.** Se hace después de la prueba con el equipo, con lo que reporten.

| # | Patrón | Qué | Referente |
|---|---|---|---|
| 1 | P-UI-14 | «Explicar este error» junto al error de la consola del ejercicio | Codecademy |
| 2 | P-PED-08 | Pistas en escalera visibles (pista → ejemplo parecido → paso) antes de la solución del docente | Codecademy, Khan Academy, LeetCode (*Hint*, *Editorial*) |
| 3 | P-UI-15 | Pestaña «Mis envíos» dentro del ejercicio, con cada intento y su resultado | LeetCode (*Submissions*) |
| 4 | P-PED-14 | Retención deseada configurable y planificación estilo FSRS en lugar de intervalos fijos de SM-2 | Anki |
| 5 | P-PED-10 | Lección «problema primero»: una pregunta corta antes de la explicación | Brilliant |
| 6 | P-PED-11 | Comentarios y preguntas por lección, visibles para la clase | Platzi, Sololearn |

## Cómo agregar un referente

1. Ábrelo y míralo, en computador y en celular. Si se puede, mídelo con el navegador automatizado; el script de
   esta ronda está descrito en `OBSERVACION_2026-10-03.md`. Anota la fecha.
2. Escribe su ficha en el archivo de su familia, con las tres lentes.
3. Cada hallazgo nuevo es un patrón en `PATRONES_*.md` con su decisión. Si ya existe, agrega el referente.
4. Si la decisión tiene fundamento teórico verificado, abre o actualiza su entrada en `../BASE_TEORICA.md`.
5. Cuando se implemente, cambia el estado a «hecho» con el commit.

**Reglas.** No se copian diseños ni marcas de nadie: se toma el patrón, no la apariencia (la identidad visual es
de José, `docs/identidad-visual/`). Las capturas de terceros no se suben al repositorio, que es público; se
describen con sus medidas. Lo que una plataforma afirma de sí misma («6 veces más eficaz») se cita como afirmación
de la empresa, no como evidencia.
