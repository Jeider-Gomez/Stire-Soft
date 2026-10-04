# Lista de chequeo de Sistemas Tutores Inteligentes (Caro Piñeres, 2015) — revisión del 04/10/2026 (después, v2.0.0 candidata)

> **Formato:** el del profesor ([`../../../curso-ddse3/guias/Checklist_ITS_Caro.docx`](../../../curso-ddse3/guias/Checklist_ITS_Caro.docx)), llenado en [`CHECKLIST_ITS_2026-10-04_DESPUES.docx`](CHECKLIST_ITS_2026-10-04_DESPUES.docx). El «antes» está en [`CHECKLIST_ITS_2026-10-04.md`](../2026-10-04_antes/CHECKLIST_ITS_2026-10-04.md).

> **Estado:** revisión hecha con el código y con la aplicación desplegada. La versión pasa a llamarse v2.0.0 cuando el equipo la verifique ([`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md)).

## Antes y después

| | Antes | Después |
|---|---|---|
| **Total** | 14/24 · 58.3 % · Insuficiente / Requiere rehacer | **24/24 · 100.0 % · Sobresaliente** |
| Bloque 1: Reflejo de los 4 Módulos Canónicos en la UI | 6/8 | 8/8 |
| Bloque 2: Características que Reflejan la Inteligencia del Tutor | 5/10 | 10/10 |
| Bloque 3: Metacognición Computacional y Prototipo FUNPRO | 3/6 | 6/6 |

## 1. Datos generales

| Campo | Valor |
|---|---|
| Asignatura / Curso | Diseño y Desarrollo de Software Educativo III (203457) — Semana 9 del curso (Reto 3) · 2026-2 |
| Fecha de Evaluación | 04 / 10 / 2026 (análisis del «después»; verificación del equipo el 05/10/2026) |
| Versión / Rama Git | v2.0.0 candidata (la etiqueta se pone tras el visto bueno del equipo) / main @ 4d41b8d, desplegada el 04/10/2026 |
| Integrantes del Equipo | Jeider Gómez · Pedro Romero · José López · Julio Galvis · Jorge Iván Cervantes García (códigos: completar) |
| URL Demo / Repositorio | https://stire-soft.vercel.app · https://github.com/Jeider-Gomez/Stire-Soft |
| Docente / Evaluador | Prof. Raúl Toscano Miranda · Autoevaluación del equipo STIRE-Soft (revisión con apoyo de Claude Code) |
| Nombre de la Aplicación / Frontend | STIRE-Soft — Sistema Tutor Inteligente con Repetición Espaciada (Fundamentos de Algoritmia) |
| Calificación final | **24 / 24 puntos = 100.0 / 100 · Sobresaliente** |

Escala del profesor: **C** cumple totalmente (2) · **CP** cumple parcialmente (1) · **NC** no cumple (0) · **NA** no aplica.

## 2. Bloque 1: Reflejo de los 4 Módulos Canónicos en la UI

| ID | Criterio | Antes | Después | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **MOD-01** | Módulo del experto / dominio en la UI | CP | **C** ↑ | Prerrequisitos visibles: cada módulo dice con qué se abre («Se abre con 50 % de dominio en …») en el menú y en el plan del curso, y el inicio avisa cuánto falta. Bloqueo suave, igual para todos: el siguiente módulo se abre con 50 % de dominio del anterior; dentro del módulo la navegación es libre; el docente cambia el umbral o lo apaga (Ajustes de la clase, «Avance entre módulos»). Se mantienen las lecciones atómicas y la verificación del código contra casos visibles y ocultos. Captura pc_doc_ajustes_umbral.webp. | — |
| **MOD-02** | Módulo del estudiante (overlay y perfil cognitivo) | CP | **C** ↑ | El modelo ya no se contradice: la racha cuenta solo las entregas terminadas y da lo mismo en el inicio y en «Mi progreso»; una lección empezada dice «Empezada», no «Toca repasarla». Concepciones erróneas: STIRE reconoce 10 tipos de error en la salida (vacía, eco de la entrada, textos pegados sin espacio, espacios, mayúsculas, puntuación, número corrido en uno, redondeo, número distinto, línea de más o de menos) y los explica (utils/diagnosticoSalida.ts); el Tutor recibe el tipo de error para orientar su pregunta (src/tutor/tutor-senales.ts). Adaptación: en lugar del perfil Felder-Silverman, STIRE recuerda el formato que el estudiante elige (ver UI-01). Es una decisión con respaldo (Pashler et al., 2008), que se presenta al profesor. Captura pc_est_diagnostico.webp. | — |
| **MOD-03** | Módulo del tutor / pedagógico (tácticas y planes) | C | **C** | Se mantiene: analogía, pregunta socrática, localizar la falla, ejemplo resuelto y reto; dificultad dinámica. Nuevo: «Resolverlo por pasos con el Tutor» (subpreguntas) y «Que el Tutor me lo explique de otra forma». | — |
| **MOD-04** | Interfaz como traductor ergonómico y afectivo | C | **C** | El mensaje del evaluador ahora orienta: «Casi: cambia alguna mayúscula o minúscula. La salida debe ser exactamente igual» en lugar de «Falla en salida». Se mantiene el lenguaje no punitivo de la pausa y del Tutor. Captura pc_est_diagnostico.webp. | — |

## 3. Bloque 2: Características que Reflejan la Inteligencia del Tutor

| ID | Criterio | Antes | Después | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **UI-01** | Adaptación multimodal de contenidos (verbal / visual) | NC | **C** ↑ | Cada algoritmo de las lecciones se ve en 4 formatos que el estudiante elige con pestañas: código, pseudocódigo, diagrama de flujo y paso a paso en palabras; STIRE recuerda el formato preferido. Funciona con pseudocódigo y con JavaScript: 7 de los 13 bloques de código de Fundamentos de Algoritmia se dibujan; los demás se muestran solo como código para no dibujar un diagrama equivocado. Adaptación al estudiante por lo que elige, no por una etiqueta de estilo (decisión con respaldo: Pashler et al., 2008; Kirschner, 2017). Capturas pc_est_algoritmo_diagrama.webp y pc_est_algoritmo_pasos.webp. | — |
| **UI-02** | Modelo de navegación adaptativo (global / secuencial) | CP | **C** ↑ | Global y secuencial a la vez, para todos: navegación libre dentro del módulo, ruta guiada de «Tu siguiente paso» y bloqueo suave entre módulos con aviso y progreso hacia el umbral. El reto deja adelantarse a quien ya sabe. El docente decide el umbral (0 = sin bloqueo). No se bloquea por perfil: se presenta al profesor como adaptación. | — |
| **UI-03** | Andamiaje proactivo y asesor inteligente (advisor) | C | **C** | Se mantiene el Tutor en 3 niveles que nunca da la solución y se ofrece al fallar. Ahora recibe señales del estudiante (tipo de error, confianza declarada, modo «por pasos» u «otra explicación») por una lista cerrada (src/tutor/tutor-senales.ts) y ajusta su pregunta. | — |
| **UI-04** | Curaduría dinámica y resiliencia de recursos | NC | **C** ↑ | «¿Te sirvió esta explicación? Sí / No» al final de cada lección, con comentario opcional; con «No» se ofrece «Que el Tutor me lo explique de otra forma». El docente ve en «Hoy» qué lecciones no sirvieron, con los comentarios y sin nombres («¿Les sirvieron las explicaciones?»), y abre la lección para mejorarla. Si una imagen no carga, la lección lo dice y ofrece abrirla; si un recurso externo no carga, ofrece abrirlo en otra pestaña o «Pedirle al Tutor que lo explique» (components/LessonResource.vue). La recomendación por pares (k-NN) se cambió por esta regla, que sirve con pocos estudiantes. Capturas pc_est_valorar.webp y pc_doc_clase.webp. | — |
| **UI-05** | Replanificación instruccional ante bloqueos | C | **C** | Se mantiene la pausa tras 3 fallos con aviso al docente. Nuevo: «Resolverlo por pasos con el Tutor», que divide el problema en subpreguntas; se ofrece, no se impone. | — |

## 4. Bloque 3: Metacognición Computacional y Prototipo FUNPRO

| ID | Criterio | Antes | Después | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **META-01** | Doble lazo de razonamiento en la interfaz | CP | **C** ↑ | «Mi autorregulación» en «Mi progreso»: una reflexión según sus datos de la semana (días con práctica, repasos vencidos, retención en los repasos y lecciones en práctica o dominadas) con una pregunta para pensar la estrategia (utils/autorregulacion.ts). Captura pc_est_progreso.webp. | — |
| **META-02** | Juicios metacognitivos y metamemoria | NC | **C** ↑ | «¿Qué tan seguro estás?» antes del primer envío de cada ejercicio, que se puede omitir; al calificar, STIRE muestra la calibración (estabas muy seguro y falló, o dudabas y acertaste) y el Tutor la usa para orientar su pregunta. No se pregunta en cada envío para que no se vuelva rutina. | — |
| **META-03** | Transparencia algorítmica y agencia compartida | C | **C** | «¿Por qué veo esto?» junto a «Tu siguiente paso» explica la regla de la recomendación. Se mantienen «Elegir yo el ejercicio» y el Tutor opcional. Captura pc_est_inicio.webp. | — |

## 5. Consolidación

| Bloque | Ítems | Posibles | Antes | Después | % después |
|---|---|---|---|---|---|
| Bloque 1: Reflejo de los 4 Módulos Canónicos en la UI | 4 | 8 | 6 | 8 | 100.0 % |
| Bloque 2: Características que Reflejan la Inteligencia del Tutor | 5 | 10 | 5 | 10 | 100.0 % |
| Bloque 3: Metacognición Computacional y Prototipo FUNPRO | 3 | 6 | 3 | 6 | 100.0 % |
| **Total** | | **24** | **14** | **24** | **100.0 % · Sobresaliente** |

## 6. Fortalezas

El Tutor ahora responde a la idea equivocada: diagnóstico de 10 tipos de error en la salida, confianza declarada y modos «por pasos» y «otra explicación» (MOD-02, UI-03, UI-05, META-02). El algoritmo de la lección en 4 formatos que el estudiante elige (UI-01). El curso se mejora con el uso: valoración de cada lección que el docente ve (UI-04). Avance con base y sin perder libertad: bloqueo suave por módulo, configurable por el docente (MOD-01, UI-02). Reflexión semanal y recomendaciones explicadas (META-01, META-03).

## 7. Lo que queda

1) Las adaptaciones de UI-01, UI-02, UI-04, UI-05 y META-02 cumplen la intención del criterio, no el ejemplo literal; se presentan al profesor el 06/10 con su respaldo (PLAN_DE_MEJORA.md §1). 2) 6 de los 13 bloques de código no se dibujan como diagrama (usan funciones o estructuras que el intérprete no lee con fidelidad) y se muestran solo como código. 3) La valoración por lección empieza vacía: se llena con el uso del equipo desde el 05/10.

## 8. Método

- **Código:** cada afirmación cita el archivo en `main @ 4d41b8d`; cada cambio de la v2.0.0 tiene su prueba automática (`src/content-rendering/__tests__/listas-chequeo-v2*.frontend.spec.ts`, `src/tutor/tutor-senales.spec.ts`, `src/valoraciones/valoraciones.service.spec.ts`).
- **Aplicación desplegada** (stire-soft.vercel.app y la API en Azure), 04/10/2026, con las cuentas de prueba `@example.com` (estudiante y docente): computador 1440×900, celular 390×844 y horizontal 844×390; Tab y «Saltar al contenido»; `prefers-color-scheme: dark`; conexión cortada en el editor; F5 con código sin entregar; medición del tamaño de cada control; **axe-core 4.10** con las reglas WCAG 2.1 A/AA en 20 pantallas (también en el celular, a diferencia del «antes»); **Lighthouse 12** en el inicio de sesión.
- **Evidencia:** capturas en [`capturas/`](capturas/), mediciones en [`evidencia-automatica.json`](evidencia-automatica.json) y reportes de Lighthouse ([celular](lighthouse_login_mobile.html), [computador](lighthouse_login_desktop.html)).
- **Verificación humana:** cada ítem lo revisa un integrante distinto de quien lo hizo, el 05/10, en [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md). Si alguno marca ❌, esta revisión se corrige antes de la presentación.
- **Límites:** Lighthouse se corrió solo en una pantalla pública (las demás piden sesión; para ellas está axe-core). El SUS (UX-08) depende de las respuestas del equipo.
