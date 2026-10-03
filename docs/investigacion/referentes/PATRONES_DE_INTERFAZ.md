# Patrones de interfaz (P-UI)

Disposición de pantalla, navegación, el tutor dentro de la interfaz y formularios. Método y estados en
[`README.md`](README.md). La observación del 03/10/2026 está en [`OBSERVACION_2026-10-03.md`](OBSERVACION_2026-10-03.md).

**Evidencia:** **[obs]** observado y medido por nosotros con el navegador, con fecha; **[doc]** documentación o blog
oficial de la plataforma; **[inv]** artículo verificado en Crossref (ver `../BASE_TEORICA.md`); **[guía]** guía de UX
profesional (Nielsen Norman Group y similares). Una guía de UX no es evidencia científica, pero sí una práctica
contrastada.

---

## Navegación siempre a mano

### P-UI-01 · Encabezado fijo y semitransparente

- **Referentes:** Coursera **[obs]**: `position: sticky`, z-index 3000; al bajar oculta la franja superior
  («para individuos / negocios…») y deja la del buscador. Platzi, en el área de estudiantes **[descripción del dueño
  del proyecto]**: fijo y semitransparente. LeetCode **[obs]**: barra superior de 48 px siempre visible con las
  acciones del problema.
- **Principio:** la navegación visible evita recordar dónde estaba algo (reconocer antes que recordar; Nielsen,
  1994). La transparencia con desenfoque deja ver que hay contenido debajo sin competir con él.
- **Guía [guía]:** NN/g recomienda encabezados fijos **solo si son compactos** y advierte que el que se esconde al
  bajar y vuelve al subir puede distraer.
- **Decisión:** adoptar. 64 px, blanco al 80 % con desenfoque de 12 px.
- **Estado:** hecho, `f785dd7`. El encabezado ya era fijo, pero al 95 % de opacidad no se notaba.

### P-UI-02 · Barra lateral fija con su propio scroll

- **Referentes:** Coursera **[obs]**: el panel lateral del curso usa `position: fixed` y conserva su altura al bajar
  (795 → 900 px). Platzi (lista de clases), Udemy y Open edX (índice del curso) **[doc]**.
- **STIRE antes [obs]:** al bajar 1200 px, la barra lateral subía 1136 px. Solo el botón del menú quedaba a la vista.
- **Principio:** el índice a la vista responde «dónde estoy y qué sigue» sin buscarlo (Nielsen, 1994: visibilidad
  del estado del sistema).
- **Decisión:** adoptar. Desde 768 px la barra es `sticky`, del alto de la pantalla menos el encabezado, y se
  desplaza sola si es larga.
- **Estado:** hecho, `f785dd7`. Verificado: la barra queda en su sitio al bajar.

### P-UI-03 · Contraer el menú con un solo ícono

- **Referentes:** Platzi **[descripción del dueño]**; ChatGPT, Claude y Gemini **[obs, uso diario]**: ícono de panel
  arriba, sin texto ni borde.
- **STIRE antes:** un botón a lo ancho con borde y el texto «Ocultar el menú», primero abajo y luego arriba
  (`c70c543`). Ocupaba una fila entera.
- **Decisión:** adoptar. Ícono de 36 px arriba a la derecha (centrado si está contraído); el nombre queda para el
  lector de pantalla y como título al pasar el ratón.
- **Estado:** hecho, `f785dd7` y `455cb12`.

### P-UI-04 · El lanzador del tutor, siempre visible y reconocible

- **Referentes:**
  - **Encabezado.** Coursera **[obs]**: ícono de destello en el encabezado global, junto a «Iniciar sesión»; abre
    *Coach* en un panel a la derecha. LeetCode **[obs]**: ícono de destello en la barra superior, al lado de
    «Run» y «Submit».
  - **Esquina inferior derecha.** Es el lugar que la mayoría de los usuarios espera para un chat **[guía]**.
  - **Lo que no funciona.** Khanmigo **[doc]**: cuando había que abrirlo con un ícono en la esquina, los
    estudiantes casi no lo usaban. Khan Academy lo está llevando al momento del error (ver P-UI-08).
- **STIRE antes [obs]:**
  - **Computador:** botón «Tutor IA» en el encabezado. Bien.
  - **Celular:** solo un ícono morado con un punto, sin nombre. Dentro del ejercicio el encabezado se iba con el
    scroll y el Tutor desaparecía. Es el «a veces no se encuentra» que reportó el dueño.
- **Decisión:** adaptar.
  - **Computador:** queda en el encabezado, con texto, como Coursera y LeetCode.
  - **Celular:** botón flotante «Tutor» abajo a la derecha, con texto, en la zona del pulgar. Se oculta con el
    Tutor abierto y no se duplica en el encabezado.
- **Estado:** hecho, `f785dd7`. Verificado en 390×844: visible arriba y abajo en inicio, lección, progreso y
  ejercicio.

### P-UI-05 · Las acciones principales del ejercicio no se pierden

- **Referentes:** LeetCode **[obs]**: «Run» y «Submit» en la barra superior, fija. Codecademy **[doc]**: «Run»
  pegado al editor.
- **STIRE antes [obs]:** en el celular, al bajar al editor desaparecían «Probar código» y «Entregar solución».
- **Decisión:** adoptar. La barra del ejercicio es fija en el celular y translúcida.
- **Estado:** hecho, `f785dd7`.
- **Pendiente:** en el celular esa barra ocupa dos líneas. Si la prueba lo reporta, compactarla: solo íconos para
  «Volver» y nombres cortos.

---

## El tutor dentro de la pantalla

### P-UI-06 · En computador, el tutor es un panel al lado, no una ventana encima

- **Referentes:** Coursera Coach **[obs]**: panel a la derecha de 416 px con el contenido visible al lado.
  ChatGPT Canvas y Lovable **[guía]**: panel lateral para conversaciones largas mientras se trabaja.
- **Principio:** ver el problema y la ayuda a la vez evita la atención dividida (Sweller, van Merriënboer y Paas,
  1998, matriz #14; Mayer y Moreno, 2003).
- **Decisión:** adoptar.
- **Estado:** hecho, `cb897d7` (recomendación de José, 02/10). 400 px, la página le deja espacio y en el celular
  sigue siendo un cajón.

### P-UI-07 · Sugerencias para arrancar, no una botonera fija

- **Referentes:** Coursera Coach **[obs]**: tres preguntas sugeridas solo al abrirse. ChatGPT y Gemini **[obs,
  uso diario]**: las sugerencias desaparecen cuando empieza la conversación.
- **STIRE antes:** tres atajos con título, siempre visibles en dos líneas. Además, «caso borde» y «condición de
  parada» salían en lecciones donde no tenían sentido.
- **Principio:** lo que no sirve en ese momento es carga extraña (Sweller et al., 1998); conviene quitar lo
  accesorio (Mayer y Moreno, 2003).
- **Decisión:** adaptar.
  - Al empezar un ejercicio, los atajos se ven solos.
  - Después de preguntar, quedan detrás de un bombillo junto al campo de escribir.
  - Los atajos de código solo aparecen en ejercicios de código.
- **Estado:** hecho, `84fbf44`.

### P-UI-08 · Ofrecer ayuda en el momento del error

- **Referentes:** Duolingo Max **[doc]**: «Explain My Answer» aparece tras responder y explica por qué estuvo mal.
  Khan Academy **[doc]**: prueba que Khanmigo aparezca tras una respuesta incorrecta. Codecademy **[doc]**: el
  asistente explica el error del código que se está escribiendo.
- **Principio:** la ayuda sirve más cuando llega en el momento de la dificultad y a pedido (Koedinger y Aleven,
  2007, matriz #6: el dilema de la asistencia).
- **Decisión:** adaptar como **oferta, no imposición**.
  - Al fallar un caso de prueba: «¿No te sale lo esperado?», con «Pedir una pista al Tutor» y «Ahora no».
  - Al no aprobar un intento: «Repasar lo que falló con el Tutor».
- **Estado:** hecho, `47cce51`. Verificado con una clave real: el Tutor leyó el código y respondió con una pista.

---

## Formularios y avisos

### P-UI-09 · Lo obligatorio cabe sin bajar; lo opcional, aparte

- **Referentes y guías [guía]:**
  - Para pocos campos conviene una sola página; los formularios largos van en pasos (NN/g).
  - Quitar «confirmar contraseña» y dar el ojo para ver la clave reduce errores y abandono.
- **Decisión:** adaptar.
  - **Paso 1:** tipo de cuenta, nombre, correo y contraseña, con «Crear cuenta» a la vista.
  - **Paso 2, opcional:** código de clase y clave del Tutor, o la materia del docente.
- **Estado:** hecho, `00e383b`. Verificado en 1366×657, 390×844 y 360×740.

### P-UI-10 · Las ventanas emergentes nunca esconden su botón

- **STIRE antes [obs]:** 19 ventanas sin alto máximo. Al crear un curso con una descripción larga no se llegaba a
  «Crear Clase».
- **Decisión:** toda ventana tiene alto máximo y scroll interno. Dentro de una ventana, las cajas de texto crecen
  hasta el 35 % de la pantalla.
- **Estado:** hecho, `c70c543`. Una prueba revisa todas las ventanas del código.

### P-UI-11 · Lo importante se ve como importante

- **STIRE antes:** «Tu solicitud para ser docente está pendiente» era una línea azul pequeña, y quien la veía
  creía que la app había fallado.
- **Decisión:** los estados que bloquean al usuario van en rojo, grandes y con la causa: «El administrador todavía
  no ha cambiado tu rol a docente».
- **Estado:** hecho, `c70c543`.

---

## Ya presentes en STIRE (confirmados por los referentes)

| Patrón | Referentes | En STIRE |
|---|---|---|
| P-UI-12 · Pantalla dividida: enunciado y editor, con pestañas (enunciado, casos, registro) | LeetCode **[obs]**, Codecademy **[doc]** | `pages/estudiante/evaluacion/[activityId].vue` |
| P-UI-13 · Índice del curso con el avance de cada lección | Coursera, Udemy, Open edX **[doc]** | «Plan del curso» en el inicio del estudiante |

## Propuestos

### P-UI-14 · «Explicar este error» junto al error

- **Referente:** Codecademy **[doc]**: se resalta el código y se pulsa «Explain code»; el asistente explica errores
  dentro de la lección.
- **Decisión:** adoptar después de la prueba. Botón junto al mensaje de error de la consola que abre el Tutor con el
  error y el código.
- **Prioridad:** 1.

### P-UI-15 · Historial de intentos dentro del ejercicio

- **Referente:** LeetCode **[obs]**: pestaña *Submissions* junto a *Description*.
- **Decisión:** adoptar después de la prueba. Pestaña «Mis envíos» con fecha, resultado y código de cada intento.
- **Prioridad:** 3.

## Descartados por ahora

### P-UI-16 · Encabezado que se esconde al bajar y vuelve al subir (celular)

- **Referentes [guía]:** frecuente en sitios móviles.
- **Por qué no:** en el ejercicio, el encabezado lleva «Probar» y «Entregar». NN/g advierte que un encabezado que
  aparece y desaparece distrae y que subir no siempre significa querer el menú. Se revisa si la prueba muestra que
  la barra fija estorba.

---

## Fuentes de esta página

**Observación propia:** ver `OBSERVACION_2026-10-03.md`.

**Guías:**
- Nielsen Norman Group, *Sticky Headers: 5 Ways to Make Them Better*: https://www.nngroup.com/articles/sticky-headers/
- NN/g, *4 Principles to Reduce Cognitive Load in Forms*: https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/
- LogRocket, *Where should AI go in your UI?*: https://blog.logrocket.com/ux-design/ai-ui-placement/
- UX Collective, *Where should AI sit in your UI?*: https://uxdesign.cc/where-should-ai-sit-in-your-ui-1710a258390e

**Plataformas (documentación oficial):**
- Codecademy, *Behind the Build: AI Learning Assistant*: https://www.codecademy.com/resources/blog/behind-the-build-ai-learning-assistant
- Duolingo, *Explain My Answer*: https://blog.duolingo.com/explain-my-answer-now-free
- Khanmigo, estudio de uso (Chalkbeat, 25/08/2026): https://www.chalkbeat.org/2026/08/25/ai-tutoring-students-khanmigo-khan-academy-engagement-study/

**Artículos (verificados en Crossref, detalle en `../BASE_TEORICA.md`):**
- Nielsen (1994).
- Mayer y Moreno (2003).
- Sweller, van Merriënboer y Paas (1998).
- Koedinger y Aleven (2007).
