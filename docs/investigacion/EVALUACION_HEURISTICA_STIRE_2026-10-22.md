# Evaluación heurística de STIRE con el instrumento de Empower-peque-chef · 22/10/2026

**Qué es:** STIRE calificado con el instrumento de evaluación heurística del curso (39 ítems: heurísticas de Nielsen,
protección de datos, evaluación general y preguntas abiertas). El instrumento se hizo para una app de cocina para niños
de 8 a 12 años; aquí se adaptó a **jóvenes de 13 a 18 años (de octavo grado a primer semestre)**.

**Cómo se calificó:** cada ítem se revisó contra el código de STIRE en el commit `577a7fb` (versión `v2.1.0`), no de
memoria ni con estudiantes. Es una evaluación experta de una sola persona; antes de usarla en el informe, alguien del
equipo debe revisar las notas, y lo ideal es repetirla con estudiantes reales.

**Dónde está el Excel diligenciado:** fuera del repositorio, junto al original del curso
(`Semetre 10/soft 3/Evaluación Heurística - STIRE.xlsx`). No se sube porque el instrumento es de otro grupo.

## Actualización del mismo día: público de 18 años o más

Tras la evaluación se decidió que STIRE y el estudio son para personas de 18 años o más. Se implementaron:
- la confirmación de edad y la aceptación de términos y política de datos en el registro;
- las páginas `/terminos` y `/privacidad`;
- el bloqueo del Tutor sin esa confirmación;
- la investigación opcional y revocable.

Detalle en `docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md` §4. Con eso se recalificaron cuatro ítems. La segunda copia del
Excel es `Evaluación Heurística - STIRE (mayores de 18).xlsx`.

| Ítem | Antes | Después | Por qué |
|---|---|---|---|
| 4 Lenguaje | 3 | 4 | El público ya no incluye octavo grado |
| 15 Tarea con ≤ 2 ayudas | 3 (F×I 2) | 4 (F×I 1) | Sin código de acudiente ni bloqueo por edad; solo crear la clave gratuita |
| 33 Privacidad | 2 (F×I 6) | 4 (F×I 1) | Términos y política públicos, edad y aceptación con prueba, investigación aparte y revocable, el Tutor no envía nombre ni correo |
| 34 Datos protegidos | 3 (F×I 2) | 3 (F×I 1) | Se registra quién consintió; falta la exportación con códigos |

**Resultado actualizado:**
- **Likert promedio: 3,97 / 5.**
- **Severidad total: 28** (antes 35).
- **Ningún problema grave** (antes 1).
- Usabilidad general y potencial educativo siguen en 4.

## Resultado de la primera calificación

| Indicador | Resultado |
|---|---|
| Promedio Likert, ítems 1 a 34 | **3,85 / 5** |
| Usabilidad general (ítem 35) | **4, alta** |
| Potencial educativo (ítem 36) | **4, buen potencial** |
| Ítems con algún problema | 28 de 34; casi todos con severidad 1 (frecuencia 1 × impacto 1) |
| Problemas graves (severidad ≥ 4) | **1: privacidad de menores (ítem 33, severidad 6)** |

## Por ítem

| N.º | Ítem (adaptado) | Likert | F × I | Evidencia en STIRE |
|---|---|---|---|---|
| 1 | Retroalimentación del estado | 4 | 1 | Avisos, «Primeros pasos», resultado por caso de prueba. Sin sonidos; la calificación en el servidor solo muestra espera |
| 2 | Respuesta en menos de 5 s | 4 | 1 | Pantallas y «Probar» en 1–2 s; el Tutor (Gemini gratuito) puede pasar de 5 s |
| 3 | Errores en lenguaje sencillo con sugerencia | 4 | 1 | `frontend-nuxt/utils/diagnosticoSalida.ts`: explica el error y qué repasar, sin dar la solución |
| 4 | Lenguaje cotidiano | 3 | 1 | Bien para universidad; en octavo sobran «dominio», «casos de prueba», «consola», «repetición espaciada» |
| 5 | Íconos comprensibles | 4 | 1 | Siempre con texto; recorrido guiado la primera vez |
| 6 | Organización anticipable | 4 | 1 | Clase → unidad → lección → ejercicio |
| 7 | Sin instrucciones, ≤ 2 clics | 4 | 1 | Un ejercicio concreto queda a 2–3 clics |
| 8 | Deshacer, detener, cancelar | 3 | 1 | Hay confirmación al borrar y Ctrl+Z; no se detiene una ejecución ni se deshace una entrega |
| 9 | Entender lo básico en < 15 min | 4 | 1 | Bienvenida + «Primeros pasos» + menú «?»; no medido con estudiantes |
| 10 | Consistencia visual | 4 | 1 | Quedan colores fijos fuera de los tokens (rediseño en curso) |
| 11 | Convenciones web y móvil | 4 | 1 | Menú lateral, modales con Escape, diseño adaptable |
| 12 | Navegación predecible | 4 | 1 | Las pestañas de la clase del docente cambian el menú |
| 13 | Validación y confirmación | 4 | 1 | Registro con error bajo el campo, aviso de borrador sin guardar |
| 14 | Errores que orientan | 4 | 1 | Bien en ejercicios; en errores de conexión no siempre dice qué hacer |
| 15 | Completar una tarea con ≤ 2 ayudas | 3 | 2 | En colegio: código de clase y clave de Gemini por estudiante (un menor no puede tenerla) |
| 16 | Facilita entender los conceptos | 4 | 1 | Pseudocódigo, diagrama y código del mismo algoritmo; Tutor socrático |
| 17 | Invita a explorar | 3 | 1 | Proyectos (en prueba), retos del docente, medallas; sin sugerencias por interés |
| 18 | Imágenes, video, animación | 3 | 1 | Se admiten (video, imagen, PDF, Genially, Scratch), pero los cursos cargados son casi solo texto |
| 19 | Mantiene la atención | 4 | 1 | Arrastrar, ordenar, emparejar, código, medallas, voz con el Tutor |
| 20 | Carga < 5 s, respuesta < 3 s | 4 | 1 | Sin prueba de carga con un salón completo |
| 21 | Atajos | 3 | 1 | Atajos del Tutor; sin lista visible ni «Continuar donde quedé» en todas partes |
| 22 | Configuración | 4 | 1 | Tema, contraste, tamaño de texto, menos movimiento; la dificultad la pone el docente |
| 23 | Información contextual | 5 | 0 | Recorrido en 30 pantallas, «Ayuda sobre esta pantalla» |
| 24 | Diseño limpio | 4 | 1 | Sin anuncios; botones flotantes y «Hoy» del docente denso |
| 25 | Lo esencial destacado | 4 | 1 | Bien en el estudiante; denso en el docente |
| 26 | Metáforas reconocibles | 4 | 0 | Un solo juego de íconos, siempre con texto |
| 27 | Errores visualmente claros | 4 | 0 | Borde rojo, ícono, `aria-invalid`; no solo color |
| 28 | Errores sin jerga | 4 | 1 | Algunos mensajes del servidor siguen siendo técnicos |
| 29 | Soluciones en el mensaje | 4 | 1 | Enlace al concepto y «Pedir ayuda al Tutor» con el error cargado |
| 30 | Ayuda contextual | 5 | 0 | Menú «?» en todas las pantallas |
| 31 | Sección de ayuda | 5 | 0 | `/ayuda`: buscador, 27 tareas, preguntas frecuentes, glosario, PDF |
| 32 | Canales de soporte | 5 | 0 | Mensajes al docente, «Contar un problema o una idea», Tutor |
| 33 | **Privacidad de menores** | **2** | **6** | Sin política de datos ni autorización del acudiente; el Tutor usa la API de Gemini, que no se puede usar con menores (ver `docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md`) |
| 34 | Datos protegidos y anonimizados | 3 | 2 | Contraseñas con hash, clave cifrada, HTTPS, permisos por rol; sin exportación anónima para investigación ni plazo de borrado |

## Lectura

- **Lo más fuerte es la ayuda** (ítems 23, 30, 31 y 32 con 5) y los errores de código explicados en palabras de
  estudiante. Eso es lo que se trabajó en octubre.
- **Lo que separa a STIRE de un colegio no es la usabilidad, es la privacidad:** con el Tutor tal como está, no se puede
  usar con menores (ítem 33). El plan está en `docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md`.
- **El lenguaje** es adecuado para primer semestre y exigente para octavo. Por eso el plan propone empezar en noveno.

## Limitaciones

La hizo una sola persona, sobre el código y no con usuarios; el instrumento original está escrito para niños de
primaria y algunos ítems (sonidos, metáforas de cocina) se adaptaron. Los resultados sirven para priorizar, no como
medida de usabilidad: para eso está el SUS dentro de STIRE (BT-31).
