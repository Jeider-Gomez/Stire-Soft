# Fichas: plataformas para aprender a programar

Cada ficha tiene las tres lentes (pedagogía, UX, UI) y termina en **Para STIRE**, con los patrones que generó.
Las plataformas cambian: esto vale como «así eran en octubre de 2026». Marcas de evidencia como en
[`README.md`](README.md).

**Cuál se parece más a STIRE.** Coursera, como dijo el dueño del proyecto: curso, módulos y lecciones con
lecturas, ejercicios calificados y un asistente de IA que conoce el material. En el ejercicio, el modelo es
LeetCode. En la sencillez de la pantalla, Platzi.

---

## Coursera

| Lente | Qué hace |
|---|---|
| Pedagogía | **Curso → Módulo (casi siempre una semana) → Lecciones → Ítems** (video, lectura, cuestionario) **[doc]**. Tareas calificadas con fechas. *Coach*: tutor de IA con los materiales del curso; los instructores pueden armar diálogos socráticos con rúbricas **[doc]**. |
| UX | Al abrir un curso, *Coach* aparece solo con tres preguntas sugeridas y un aviso de privacidad que se acepta una vez **[obs]**. El curso dice su nivel («Principiante: no se requiere experiencia previa») y el tiempo («3 semanas, 10 horas a la semana») **[obs]**. |
| UI | Encabezado fijo (`sticky`, 105 px en computador, 65 en celular) que al bajar oculta su franja superior y deja el buscador **[obs]**. *Coach* en un panel derecho de 416 px, `fixed`, que conserva su altura al bajar **[obs]**. Lanzador de *Coach*: ícono de destello en el encabezado **[obs]**. Pestañas del curso («Acerca de», «Módulos», «Reseñas») en una barra que también queda fija **[obs]**. |

**Para STIRE:**
- P-UI-01: encabezado fijo.
- P-UI-02: panel fijo.
- P-UI-04: lanzador en el encabezado en computador.
- P-UI-06: tutor en panel lateral.
- P-UI-07: sugerencias solo al empezar.
- P-PED-04: el tutor conoce el material.
- P-PED-06: el docente define cómo guía.
- **Propuesto:** decir el nivel y el tiempo estimado de cada unidad en el «Plan del curso».

## Platzi

| Lente | Qué hace |
|---|---|
| Pedagogía | **Escuela → Ruta → Curso → Clase** **[doc]**. Cada clase es un video corto con recursos, comentarios y retos. Examen por curso con preguntas abiertas y cerradas y resultado al instante **[doc]**. *Platzi Answers*: preguntar sobre la clase desde el reproductor **[doc]**. |
| UX | Clases optimizadas para el formato vertical del celular y zoom durante la clase **[doc]**. La comunidad responde en los comentarios de cada clase **[doc]**. |
| UI | En el área de estudiantes, según el dueño del proyecto, que la usa: **barra lateral que se queda fija al bajar**, **encabezado fijo y semitransparente** y **contraer la barra con un solo ícono** que no estorba. No se pudo medir: la página pública del curso no cargó en 60 s desde el navegador automatizado y la experiencia de clase pide iniciar sesión **[obs]**. La portada pública usa un encabezado oscuro de 80 px **no** fijo **[obs]**. |

**Para STIRE:**
- P-UI-01, P-UI-02 y P-UI-03 (lo que el dueño destacó).
- P-PED-11: preguntas por clase.
- **Propuesto:** que alguien del equipo con cuenta de Platzi mida la pantalla de clase con el procedimiento de
  `OBSERVACION_2026-10-03.md`.

## LeetCode

| Lente | Qué hace |
|---|---|
| Pedagogía | Problemas con dificultad (*Easy*, *Medium*, *Hard*), temas y ejemplos. *Hint* opcional en el problema. *Editorial* con la explicación oficial y *Solutions* de la comunidad en otras pestañas **[obs]**. |
| UX | Todo el trabajo en una pantalla: enunciado, editor, casos de prueba y resultado. «Run» prueba sin enviar y «Submit» envía; ambos siempre a la vista **[obs]**. Pide iniciar sesión para ejecutar **[obs]**. |
| UI | Barra superior de 48 px: lista de problemas, anterior y siguiente, «Run» y «Submit» al centro, y el ícono de IA (destello) al lado **[obs]**. Paneles redimensionables: enunciado a la izquierda con pestañas *Description*, *Editorial*, *Solutions* y *Submissions*; editor a la derecha; *Testcase* y *Test Result* abajo **[obs]**. En el celular, una columna con las pestañas arriba **[obs]**. |

**Para STIRE:**
- P-UI-05: acciones fijas.
- P-UI-12: pantalla dividida, ya presente.
- P-UI-15: historial de intentos (propuesto).
- P-PED-08: pistas en escalera (propuesto).

## Codecademy

| Lente | Qué hace |
|---|---|
| Pedagogía | Lecciones con *checkpoints* que se marcan al cumplirse; proyectos guiados. *Get Unstuck*: repaso del concepto y luego la solución **[doc]**. El asistente de IA conoce la lección, las instrucciones y el código; da primero una pista y solo si el estudiante insiste da la respuesta **[doc]**. |
| UX | El asistente explica el código resaltado («Explain code») y los errores, sin salir de la lección **[doc]**. Los usuarios gratuitos tienen un límite de preguntas **[doc]**. |
| UI | Pantalla en tres partes: instrucciones, editor y salida **[doc]**. |

**Para STIRE:**
- P-PED-01, con la diferencia de que STIRE no entrega la respuesta.
- P-PED-04 y P-PED-07.
- P-UI-14: «Explicar este error» (propuesto, prioridad 1).

## freeCodeCamp

| Lente | Qué hace |
|---|---|
| Pedagogía | Currículo por certificaciones: muchos pasos pequeños y luego proyectos que se entregan para certificar **[doc]**. Gratuito. |
| UX | Cada paso valida el código al instante con pruebas visibles **[doc]**. |
| UI | Enunciado a la izquierda, editor y vista previa a la derecha **[doc]**. |

**Para STIRE:** P-PED-07 y P-PED-12. Confirma el modelo de pasos pequeños con pruebas visibles.

## Exercism

| Lente | Qué hace |
|---|---|
| Pedagogía | Un **árbol de conceptos** por lenguaje: cada concepto se aprende con un ejercicio y desbloquea los siguientes. «Modo aprendizaje» con el árbol o «modo práctica» con todo abierto **[doc]**. Mentores voluntarios revisan el código y comentan cómo mejorarlo **[doc]**. Analizadores automáticos que comentan el estilo **[doc]**. |
| UX | El estudiante elige entre seguir el camino o practicar libre **[doc]**. |
| UI | El árbol de conceptos como mapa navegable **[doc]**. |

**Para STIRE:** P-PED-09 (camino sugerido sin bloquear) y P-PED-11 (retroalimentación humana).

## Khan Academy

| Lente | Qué hace |
|---|---|
| Pedagogía | Niveles de dominio visibles (Intentado → Familiar → Competente → Dominado) que pueden **bajar** si se falla después; retos de dominio que mezclan habilidades cada 12 h **[doc]** (ver `../REFERENTES_PLATAFORMAS_Y_STI.md` §4). |
| UX | Pistas paso a paso dentro del ejercicio **[doc]**. Khanmigo (ver `IA_EDUCATIVA.md`). |
| UI | Ruta del curso con el estado de cada habilidad **[doc]**. |

**Para STIRE:** P-PED-08, P-PED-15 y los estados de dominio, que ya existen (`learning-progress`).

## CS50 (Harvard)

| Lente | Qué hace |
|---|---|
| Pedagogía | Curso introductorio con conferencias, problemas semanales y el «pato» de IA como asistente de cátedra que guía sin resolver **[inv: Liu et al., 2024]** (ver `IA_EDUCATIVA.md`). |
| UX | El pato está en el mismo entorno donde se programa (VS Code en la nube) **[doc]**. |
| UI | Entorno de desarrollo completo; no es una plataforma de cursos. |

**Para STIRE:** P-PED-01. Es un curso introductorio, como el nuestro, que demuestra que un tutor de IA con
barreras funciona a gran escala.

## Brilliant

| Lente | Qué hace |
|---|---|
| Pedagogía | **Problema primero:** cada lección es una cadena de problemas pequeños e interactivos; si se falla, retrocede, y si se acierta, sube **[doc]**. Sin videos. *Koji*, un tutor de IA que hace preguntas guía y pistas visuales **[doc]**. |
| UX | Sesiones cortas pensadas para el celular **[doc]**. |
| UI | Una tarea por pantalla, con mucha interacción visual **[doc]**. |

**Para STIRE:** P-PED-10 (pregunta antes de la explicación, propuesto).

## Udemy, Sololearn y Mimo

Ya están en `../REFERENTES_PLATAFORMAS_Y_STI.md` §3 y §4:
- **Udemy:** índice lateral del curso con marcas de completado.
- **Sololearn:** lecciones cortas con práctica inmediata y comentarios por lección.
- **Mimo:** lecciones de pocos minutos en el celular.

**Para STIRE:** P-UI-02, P-UI-13 y P-PED-11.

---

## Enlaces

- Coursera Coach: https://blog.coursera.org/coursera-coach-providing-essential-learner-support
- Platzi, novedades: https://platzi.com/blog/whats-new/
- Platzi, exámenes: https://platzi.com/blog/nuevos-examenes/
- LeetCode, problema observado: https://leetcode.com/problems/two-sum/description/
- Codecademy, asistente de IA: https://www.codecademy.com/resources/blog/behind-the-build-ai-learning-assistant
- Codecademy, funciones de IA: https://help.codecademy.com/hc/en-us/articles/23400751016859-AI-Features-available-on-Codecademy
- Exercism, *Syllabus*: https://exercism.org/docs/building/tracks/syllabus
- Exercism, novedades v3: https://exercism.org/blog/whats-new-in-v3-with-angelika
- CS50 y la IA: https://cs50.harvard.edu/x/notes/ai/
- Brilliant: https://brilliant.org/faq/
