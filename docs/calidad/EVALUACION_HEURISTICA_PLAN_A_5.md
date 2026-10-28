# Plan para llevar cada ítem de la evaluación heurística a 5

**Para qué:** que cada uno de los 34 ítems del instrumento del curso (Empower-peque-chef adaptado a STIRE) llegue a
«5, totalmente de acuerdo» antes de la evaluación humana, que es más dura que la de la IA. Este documento es el
**registro de avance**: cada mejora se anota abajo con su commit y su prueba.

**El equipo no lee este documento hasta entregar su evaluación** (`EVALUACION_HEURISTICA_HUMANA_S11.md`, regla 1).

**Punto de partida:** la calificación de la IA del 27/10 sobre la v2.4.0, con el público de **grado 10 y 11 hasta tercer
semestre** y la nota del más exigente (`docs/investigacion/EVALUACION_HEURISTICA_STIRE_2026-10-27.md`): Likert
**3,94/5** (4,21 para tercer semestre), severidad total 37, un problema grave (ítem 33).

## Qué falta en cada ítem

Bloques: **A** = correcciones de esta semana, antes de la evaluación humana · **R** = en la remodelación (Fase 2–3) ·
**M** = menores de edad (P33) · **P** = se demuestra solo con personas reales (P17).

| N.º | Ítem | IA 27/10 | Qué falta para 5 | Bloque |
|---|---|---|---|---|
| 1 | Retroalimentación del estado | 5 | Mantener | |
| 2 | Respuesta en menos de 5 s | 4 | El Tutor (Gemini gratuito) puede pasar de 5 s: mostrar que está pensando y la respuesta a medida que llega | A |
| 3 | Errores sencillos con sugerencia | 4 | Revisar todos los mensajes del juez y del servidor con la meta de lectura de grado 10 | A |
| 4 | Lenguaje cotidiano | 3 | Con grados 10–11: glosario en línea en todas las palabras técnicas, no solo en tres | A y M |
| 5 | Íconos comprensibles | 4 | Ningún botón solo con ícono; descripción al pasar el ratón; la mascota con un gesto por intención | A |
| 6 | Organización anticipable | 4 | Ordenar la lección y «Mi progreso» (P08, P09) | R |
| 7 | Sin instrucciones, ≤ 2 clics | 4 | «Tu siguiente paso» ya lleva al ejercicio en un clic; falta que activar el Tutor no exija instrucciones de fuera (guía de la clave dentro de STIRE, paso a paso) | A |
| 8 | Deshacer, detener, cancelar | 4 | «Deshacer» unos segundos después de borrar, en vez de solo confirmar; la entrega sigue sin deshacerse a propósito y debe decirlo antes | A |
| 9 | Lo básico en < 15 min | 4 | Medirlo con estudiantes reales | P |
| 10 | Consistencia visual | 4 | Colores fijos fuera de los tokens | R |
| 11 | Convenciones web y móvil | 4 | Revisar ventanas que no cierran con Escape o no devuelven el foco | A |
| 12 | Navegación predecible | 4 | Las pestañas de la clase del docente cambian el menú | R |
| 13 | Validación y confirmación | 4 | Validación en vivo en todos los formularios; aviso de salir sin guardar en todos los editores | A |
| 14 | Errores que orientan | 5 | Mantener | |
| 15 | Tarea con ≤ 2 ayudas | 3 | Con menores: la clave de Gemini por estudiante no sirve (Google lo prohíbe). Tutor sin clave propia o con otro proveedor | M |
| 16 | Entender los conceptos | 4 | Escalera en cada lección (P14) y bloques antes del código (P31) | R |
| 17 | Invita a explorar | 3 | Retos opcionales, sugerencias según el avance, «¿Sabías qué?» | R |
| 18 | Imágenes, video, animación | 3 | Ejecución paso a paso del algoritmo en la lección; cursos con imágenes y videos cortos | R |
| 19 | Mantiene la atención | 4 | El Tutor felicita al ganar un logro (P07), con interruptor | R |
| 20 | Carga < 5 s, respuesta < 3 s | 4 | Medir con un salón completo (prueba de carga) y con la conexión de un celular | A y P |
| 21 | Atajos | 4 | Equivalentes táctiles de los atajos en el celular («Probar» fijo abajo, ir a cualquier lección sin teclado) | A |
| 22 | Configuración | 4 | Interruptores para cada tipo de aviso (P07) | R |
| 23 | Información contextual | 5 | Mantener | |
| 24 | Diseño limpio | 4 | Botones flotantes y «Hoy» del docente denso | R |
| 25 | Lo esencial destacado | 4 | Panel del docente denso | R |
| 26 | Metáforas reconocibles | 4 | Revisar el juego de íconos completo | R |
| 27 | Errores visualmente claros | 4 | Ícono de advertencia en todos los mensajes de error, no solo en formularios | A |
| 28 | Errores sin jerga | 4 | Traducir los errores del intérprete de JavaScript (TypeError, ReferenceError…) a palabras de estudiante | A |
| 29 | Soluciones en el mensaje | 4 | Botón de acción en cada error («Reintentar», «Pedir ayuda al Tutor», «Ir a…») | A |
| 30 | Ayuda contextual | 5 | Mantener | |
| 31 | Sección de ayuda | 4 | Actualizar el manual con los nombres nuevos del docente | A |
| 32 | Canales de soporte | 5 | Mantener | |
| 33 | Privacidad de menores | 2 | Fase A de `docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md`: autorización del acudiente, asentimiento, cuenta en espera | M |
| 34 | Datos protegidos y anonimizados | 3 | Plazo de borrado; con menores, nada para investigación sin autorización | M |

**Lo que no se puede prometer:** los ítems 9 y 20 solo llegan a 5 con una prueba con personas; los del bloque M dependen
de la Fase A y B del plan de menores, que es trabajo de semanas; y los del bloque R se hacen en la remodelación. El
bloque A es lo que cabe antes de la evaluación humana.

## Registro de avance

| Fecha | Ítems | Qué se hizo | Commit | Prueba |
|---|---|---|---|---|
| 27/10 | 4 | «Dominio» se explica con el glosario en cada pantalla del estudiante donde aparece (lección, Inicio, progreso, meta del módulo, aviso del parecido); la pestaña de casos de prueba dice qué son a la vista, sin «casos públicos de verificación» | `8d9a018e` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
| 27/10 | 3 y 28 | Cuatro errores frecuentes más en palabras de estudiante («no es una función», «antes de crearla», una función que se llama sin parar, recorrer algo que no es lista); los raros avisan que el detalle viene en inglés | `8d9a018e` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
| 28/10 | 8 | Borrar un módulo, un tema, una lección o un aviso de clase ofrece «Deshacer» durante 6 s: desaparece al instante y el servidor lo borra al cerrarse el aviso; si falla, vuelve a su lugar | `ea9699a2` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
| 28/10 | 13 | Salir sin guardar pregunta antes («¿Salir sin guardar?» · «Seguir editando»): en las ventanas de editar lección, módulo, tema y ejercicio (también sus respuestas), en la de crear, en el editor de la explicación y en las páginas de crear ejercicio y refuerzo; con la X, Escape, el fondo, «Cancelar», al cambiar de página o al cerrar la pestaña | `231ff6d3` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
| 28/10 | 27 y 29 | Todo mensaje de error lleva ícono y role="alert" (componente `MensajeError`, 70 mensajes en 55 archivos); las cargas que fallan ofrecen «Reintentar» (ejercicio, asistencia, proyectos, ejercicios de la lección, panel de ejercicios, mapa de calor, entregas) y el caso que falla en un ejercicio de programar ofrece «Pedir ayuda al Tutor» | `aa2ba84e` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
| 28/10 | 7 | Activar el Tutor y el Asistente sin instrucciones de fuera: guía de 5 pasos dentro de STIRE (`GuiaClaveGoogle`), con el botón para abrir Google AI Studio, qué hacer si algo falla, y la forma de la clave revisada antes de enviarla | `0181ada0` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
| 28/10 | 31 | El manual suma las tareas del docente que faltaban: «¿Qué veo al entrar?» (Inicio y «Por revisar»), la Biblioteca y el Asistente; versión 2.2. El PDF descargable se regenera aparte | `c46b97bd` | `evaluacion-heuristica-bloque-a.frontend.spec.ts` |
