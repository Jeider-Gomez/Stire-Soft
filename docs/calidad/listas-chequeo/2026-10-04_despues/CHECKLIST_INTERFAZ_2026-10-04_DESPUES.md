# Lista de chequeo de interfaz gráfica (Pressman & Maxim, caps. 12, 13 y 14) — revisión del 04/10/2026 (después, v2.0.0 candidata)

> **Formato:** el del profesor ([`../../../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx`](../../../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx)), llenado en [`CHECKLIST_INTERFAZ_2026-10-04_DESPUES.docx`](CHECKLIST_INTERFAZ_2026-10-04_DESPUES.docx). El «antes» está en [`CHECKLIST_INTERFAZ_2026-10-04.md`](../2026-10-04_antes/CHECKLIST_INTERFAZ_2026-10-04.md).

> **Estado:** revisión hecha con el código y con la aplicación desplegada. La versión pasa a llamarse v2.0.0 cuando el equipo la verifique ([`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md)).

## Antes y después

| | Antes | Después |
|---|---|---|
| **Total** | 20/32 · 62.5 % · Básico con observaciones | **28/32 · 87.5 % · Aceptable / Competente** |
| Bloque 1: Experiencia de Usuario (Capítulo 12) | 10/16 | 15/16 |
| Bloque 2: Diseño para la Movilidad (Capítulo 13) | 5/8 | 7/8 |
| Bloque 3: Diseño Basado en Patrones (Capítulo 14) | 5/8 | 6/8 |

## 1. Datos generales

| Campo | Valor |
|---|---|
| Asignatura / Curso | Diseño y Desarrollo de Software Educativo III (203457) — Semana 9 del curso (Reto 3) · 2026-2 |
| Fecha de Evaluación | 04 / 10 / 2026 (análisis del «después»; verificación del equipo el 05/10/2026) |
| Versión / Rama Git | v2.0.0 candidata (la etiqueta se pone tras el visto bueno del equipo) / main @ 4d41b8d, desplegada el 04/10/2026 |
| Integrantes del Equipo | Jeider Gómez · Pedro Romero · José López · Julio Galvis · Jorge Iván Cervantes García (códigos: completar) |
| URL Demo / Repositorio | https://stire-soft.vercel.app · https://github.com/Jeider-Gomez/Stire-Soft |
| Docente / Evaluador | Prof. Raúl Toscano Miranda · Autoevaluación del equipo STIRE-Soft (revisión con apoyo de Claude Code) |
| Nombre de la Aplicación / Frontend | STIRE-Soft — Sistema Tutor Inteligente con Repetición Espaciada (frontend Nuxt 3) |
| Calificación final | **28 / 32 puntos = 87.5 / 100 · Aceptable / Competente** |

Escala del profesor: **C** cumple totalmente (2) · **CP** cumple parcialmente (1) · **NC** no cumple (0) · **NA** no aplica.

## 2. Bloque 1: Experiencia de Usuario (Capítulo 12)

| ID | Criterio | Antes | Después | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **UX-01** | Los 5 planos de Garrett y arquitectura de información | C | **C** | Se mantiene la organización Unidad › Tema › Lección. Ahora el ejercicio también tiene migas: «Inicio › Variables y tipos de datos › Ejercicio · Básico» (layouts/workspace.vue:24, medido en producción). El inicio avisa qué módulo sigue y cuánto falta para abrirlo. Captura pc_est_ejercicio.webp. | — |
| **UX-02** | Regla de oro 1 de Mandel: poner al usuario en control | CP | **C** ↑ | Las 4 confirmaciones con confirm() del navegador se cambiaron por un diálogo propio (components/DialogoConfirmar.vue, role="alertdialog") que dice qué se pierde y deja el foco en «Cancelar». El autoguardado reintenta solo y guarda una copia en el equipo: con un F5 el código vuelve y lo avisa («Recuperamos el código que estabas escribiendo»). Probado en producción. Capturas pc_est_dialogo_confirmar.webp y pc_est_recuperado_f5.webp. | — |
| **UX-03** | Regla de oro 2 de Mandel: reducir la carga de memoria | C | **C** | Se mantiene: «Cómo se califica», casos de prueba y límite de tiempo siempre visibles; registro en 2 pasos con las reglas de la clave a la vista. Nuevo: el diagnóstico de la salida dice qué revisar sin tener que comparar a ojo («Casi: cambia alguna mayúscula o minúscula»). Captura pc_est_diagnostico.webp. | — |
| **UX-04** | Regla de oro 3 de Mandel: consistencia integral | CP | **C** ↑ | Se quitaron los 107 emojis de las pantallas y se cambiaron por íconos Lucide: 0 emojis medidos en el contenido de todas las pantallas recorridas. Títulos en estilo de oración en todas las pantallas («Iniciar sesión», «Mis clases») y sin anglicismos («Volver al inicio» en lugar de «Dashboard»). Queda pendiente aplicar la identidad visual completa de José (docs/identidad-visual/), que no cambia estos criterios. Prueba automática UX-04 en src/content-rendering/__tests__/listas-chequeo-v2-linea-a.frontend.spec.ts. | — |
| **UX-05** | Modelado de usuarios, personas y análisis de tareas | CP | **C** ↑ | Dos Personas (estudiante de 3.er semestre y docente de Fundamentos de Algoritmia) y el análisis jerárquico de tareas (HTA) de «resolver un ejercicio» y «preparar una clase», con las decisiones de la interfaz que salen de cada uno: docs/modesec/usuarios/PERSONAS_Y_TAREAS.md. | — |
| **UX-06** | Directrices ergonómicas de Tognazzini (Fitts, retroalimentación, estado) | CP | **C** ↑ | Fitts: «Probar código» y «Entregar solución» miden 48 px de alto en el celular y 44 px en el computador; los demás controles del estudiante y del docente miden 44 px o más (medido en producción a 390×844). Estado siempre visible: «Guardado a las 12:19», «Sin conexión: tu código queda en este equipo; reintentando…», y el código sobrevive a un F5. Captura cel_est_barra_inferior.webp. | — |
| **UX-07** | Accesibilidad universal y WCAG 2.1 (POUR) | CP | **C** ↑ | axe-core 4.10 (WCAG 2.1 A/AA) en producción: 0 problemas en las 20 pantallas medidas (estudiante, docente y públicas, en computador y celular), contra 5 a 24 problemas de contraste por pantalla en el «antes». Lighthouse 12 en el inicio de sesión: Accesibilidad 100, Buenas prácticas 100, SEO 100 (celular y computador). Enlace «Saltar al contenido» (Tab al entrar) y aria-current="page" en el menú y las migas. Única marca de axe: «scrollable-region-focusable» en el editor de código del celular, que es un falso positivo de CodeMirror 6 (el área se recorre con el teclado desde el propio editor). Reportes lighthouse_login_mobile.html y lighthouse_login_desktop.html; captura pc_est_saltar_contenido.webp. | — |
| **UX-08** | Prototipado validado y métricas de usabilidad | CP | **CP** | Prototipo en Figma, evaluación heurística de Nielsen y auditorías QA (sin cambios). El SUS ya está preparado (docs/calidad/listas-chequeo/VERIFICACION_v2.0.0.md §3, Brooke 1996) y lo responden los 5 integrantes durante la verificación del 05/10. Hasta tener esas respuestas el ítem queda en CP. | Calcular el SUS con las 5 respuestas (pasa a C con el resultado). |

## 3. Bloque 2: Diseño para la Movilidad (Capítulo 13)

| ID | Criterio | Antes | Después | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **MOB-01** | Pirámide de diseño móvil / web | C | **C** | Sin desplazamiento horizontal en ninguna pantalla medida, en vertical (390×844) ni en horizontal (844×390). Las tarjetas pasan a una columna y la lección se divide en bloques cortos. Capturas cel_est_inicio.webp, cel_est_unidad.webp y cel_est_horizontal.webp. | — |
| **MOB-02** | Ergonomía táctil y zona del pulgar | CP | **C** ↑ | En el celular, «Probar código» y «Entregar solución» van en una barra fija abajo (y = 784 de 844 px, 48 px de alto), en la zona del pulgar; el botón del Tutor sube para no taparlos. Controles de 44 px o más en todas las pantallas del estudiante y del docente medidas en el celular; quedan por debajo solo los enlaces dentro de un texto (exentos en WCAG 2.5.8) y el botón «Mostrar contraseña» dentro del campo (32 px, sobre el mínimo de 24 px de WCAG 2.5.8). Captura cel_est_barra_inferior.webp. | — |
| **MOB-03** | Sensibilidad al contexto y adaptabilidad | CP | **CP** | Rotación sin perder el código (844×390); correo con type="email"; el código de clase pide mayúsculas (autocapitalize="characters") y se formatea mientras se escribe («algo 2034» → «ALGO-2034»). Sigue sin modo oscuro: con prefers-color-scheme: dark el fondo sigue claro. Hacerlo exige cambiar tailwind.config.ts y main.css, que son de la identidad visual de José. | Modo oscuro con José (después del martes). |
| **MOB-04** | Resiliencia de red y rendimiento en movilidad | CP | **C** ↑ | Sin red aparece «Sin conexión. Puedes seguir: tu código queda en este equipo y se enviará al volver la red» y el estado del editor lo repite; al volver la red se guarda solo («Guardado a las 12:20»). Probado en producción cortando la conexión en el celular. Imágenes con loading="lazy"; la calificación es asíncrona. Lighthouse Rendimiento: 79 en celular y 92 en computador. Captura cel_est_sin_conexion.webp. | — |

## 4. Bloque 3: Diseño Basado en Patrones (Capítulo 14)

| ID | Criterio | Antes | Después | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **PAT-01** | Patrones arquitectónicos y de presentación (MVC / componentes) | CP | **CP** | Lo nuevo de esta versión sigue el patrón: la lógica vive en utilidades puras con prueba (utils/diagnosticoSalida.ts, bloqueoModulos.ts, confianza.ts, autoguardado.ts, algoritmoMultiformato.ts) y en composables (useConfirmar, useConexion). Pero 31 de 40 páginas todavía llaman a la API desde la vista; moverlas no cambia nada para el usuario y tiene riesgo, así que no se hizo antes del martes. | Pasar las llamadas de las páginas grandes a composables por dominio (prioridad 2 del plan). |
| **PAT-02** | Patrones de navegación de interfaz (Tidwell, van Welie) | C | **C** | Menú lateral con la opción activa (aria-current), pestañas en la clase del docente y en el ejercicio, migas en la lección y ahora también en el ejercicio, y barra de acciones inferior en el celular. | — |
| **PAT-03** | Patrones de entrada de datos y formularios | CP | **C** ↑ | El inicio de sesión valida sin el globo del navegador: el error aparece bajo el campo y el foco va al primero que falta (utils/registro.ts, faltantesDelIngreso). El código de clase tiene formato asistido (utils/codigoClase.ts): mayúsculas y guion mientras se escribe. El registro ya validaba campo a campo. Captura cel_validacion_login.webp. | — |
| **PAT-04** | Prevención de antipatrones de UI | CP | **CP** | Sin «Mystery Meat»: 0 botones sin nombre accesible en todas las pantallas medidas. Sin ventanas encima de otras: el diálogo de confirmación es único y modal. Pero sigue «The Blob»: 26 de 103 componentes pasan de 300 líneas (admin/index.vue 1532, EditorDiagrama.vue 1322, docente/contenidos.vue 1126). | Dividir esos tres por secciones (prioridad 2 del plan). |

## 5. Consolidación

| Bloque | Ítems | Posibles | Antes | Después | % después |
|---|---|---|---|---|---|
| Bloque 1: Experiencia de Usuario (Capítulo 12) | 8 | 16 | 10 | 15 | 93.8 % |
| Bloque 2: Diseño para la Movilidad (Capítulo 13) | 4 | 8 | 5 | 7 | 87.5 % |
| Bloque 3: Diseño Basado en Patrones (Capítulo 14) | 4 | 8 | 5 | 6 | 75.0 % |
| **Total** | | **32** | **20** | **28** | **87.5 % · Aceptable / Competente** |

## 6. Fortalezas

Accesibilidad medida: 0 problemas de axe-core WCAG 2.1 AA en 20 pantallas y Lighthouse Accesibilidad 100 (UX-07). Uso con una mano en el celular: barra inferior de 48 px y controles de 44 px (MOB-02, UX-06). El trabajo no se pierde: copia local, recuperación tras F5 y aviso sin conexión (UX-02, MOB-04). Una sola apariencia: 0 emojis y títulos uniformes (UX-04). Migas en todo el recorrido (UX-01, PAT-02), errores bajo el campo y formato asistido (PAT-03), y Personas con HTA (UX-05).

## 7. Lo que queda

1) Falta el SUS: lo responden los 5 integrantes el 05/10 (UX-08). 2) Sin modo oscuro: es de la identidad visual de José (MOB-03). 3) 31 de 40 páginas llaman a la API desde la vista (PAT-01). 4) 26 componentes de más de 300 líneas (PAT-04). Compromiso: 1 antes del martes; 2 a 4 después de la presentación, sin cambiar lo que ve el usuario.

## 8. Método

- **Código:** cada afirmación cita el archivo en `main @ 4d41b8d`; cada cambio de la v2.0.0 tiene su prueba automática (`src/content-rendering/__tests__/listas-chequeo-v2*.frontend.spec.ts`, `src/tutor/tutor-senales.spec.ts`, `src/valoraciones/valoraciones.service.spec.ts`).
- **Aplicación desplegada** (stire-soft.vercel.app y la API en Azure), 04/10/2026, con las cuentas de prueba `@example.com` (estudiante y docente): computador 1440×900, celular 390×844 y horizontal 844×390; Tab y «Saltar al contenido»; `prefers-color-scheme: dark`; conexión cortada en el editor; F5 con código sin entregar; medición del tamaño de cada control; **axe-core 4.10** con las reglas WCAG 2.1 A/AA en 20 pantallas (también en el celular, a diferencia del «antes»); **Lighthouse 12** en el inicio de sesión.
- **Evidencia:** capturas en [`capturas/`](capturas/), mediciones en [`evidencia-automatica.json`](evidencia-automatica.json) y reportes de Lighthouse ([celular](lighthouse_login_mobile.html), [computador](lighthouse_login_desktop.html)).
- **Verificación humana:** cada ítem lo revisa un integrante distinto de quien lo hizo, el 05/10, en [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md). Si alguno marca ❌, esta revisión se corrige antes de la presentación.
- **Límites:** Lighthouse se corrió solo en una pantalla pública (las demás piden sesión; para ellas está axe-core). El SUS (UX-08) depende de las respuestas del equipo.
