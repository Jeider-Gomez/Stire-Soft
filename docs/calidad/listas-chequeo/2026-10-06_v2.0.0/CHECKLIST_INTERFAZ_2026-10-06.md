# Lista de chequeo de interfaz gráfica (Pressman & Maxim, caps. 12, 13 y 14) — revisión del 06/10/2026 (v2.0.0, evaluación con IA actualizada)

> **Formato:** el del profesor ([`../../../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx`](../../../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx)), llenado en [`CHECKLIST_INTERFAZ_2026-10-06.docx`](CHECKLIST_INTERFAZ_2026-10-06.docx). El «antes» está en [`CHECKLIST_INTERFAZ_2026-10-04.md`](../2026-10-04_antes/CHECKLIST_INTERFAZ_2026-10-04.md).

> **Estado:** evaluación hecha con IA (Claude Code) sobre el código y la aplicación desplegada. Actualiza la del 04/10 ([`../2026-10-04_despues/`](../2026-10-04_despues/)) en los 6 criterios que cambiaron. La revisión humana del equipo, criterio por criterio, cierra el viernes 09/10.

## Antes y después

| | Antes (04/10) | Hoy (06/10) |
|---|---|---|
| **Total** | 20/32 · 62.5 % · Básico con observaciones | **31/32 · 96.9 % · Sobresaliente** (actualizado el 07/10) |
| Bloque 1: Experiencia de Usuario (Capítulo 12) | 10/16 | 15/16 |
| Bloque 2: Diseño para la Movilidad (Capítulo 13) | 5/8 | 8/8 |
| Bloque 3: Diseño Basado en Patrones (Capítulo 14) | 5/8 | 8/8 |

## 1. Datos generales

| Campo | Valor |
|---|---|
| Asignatura / Curso | Diseño y Desarrollo de Software Educativo III (203457) — Semana 9 del curso (Reto 3) · 2026-2 |
| Fecha de Evaluación | 06 / 10 / 2026 (actualización de la evaluación con IA; la revisión humana del equipo cierra el 09/10/2026) |
| Versión / Rama Git | v2.0.0 (la etiqueta se pone tras la revisión humana) / main @ 80f63d6, desplegada el 06/10/2026 |
| Integrantes del Equipo | Jeider Gómez · Pedro Romero · José López · Julio Galvis · Jorge Iván Cervantes García (códigos: completar) |
| URL Demo / Repositorio | https://stire-soft.vercel.app · https://github.com/Jeider-Gomez/Stire-Soft |
| Docente / Evaluador | Prof. Raúl Toscano Miranda · Autoevaluación del equipo STIRE-Soft (revisión con apoyo de Claude Code) |
| Nombre de la Aplicación / Frontend | STIRE-Soft — Sistema Tutor Inteligente con Repetición Espaciada (frontend Nuxt 3) |
| Calificación final | **31 / 32 puntos = 96.9 / 100 · Sobresaliente** (actualizada el 07/10, PAT-04) |

Escala del profesor: **C** cumple totalmente (2) · **CP** cumple parcialmente (1) · **NC** no cumple (0) · **NA** no aplica.

## 2. Bloque 1: Experiencia de Usuario (Capítulo 12)

| ID | Criterio | Antes (04/10) | Hoy (06/10) | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **UX-01** | Los 5 planos de Garrett y arquitectura de información | C | **C** | Se mantiene la organización Unidad › Tema › Lección. Ahora el ejercicio también tiene migas: «Inicio › Variables y tipos de datos › Ejercicio · Básico» (layouts/workspace.vue:24, medido en producción). El inicio avisa qué módulo sigue y cuánto falta para abrirlo. Captura pc_est_ejercicio.webp. | — |
| **UX-02** | Regla de oro 1 de Mandel: poner al usuario en control | CP | **C** ↑ | Las confirmaciones del navegador se cambiaron por un diálogo propio (components/DialogoConfirmar.vue, role="alertdialog") que dice qué se pierde y deja el foco en «Cancelar». El autoguardado reintenta solo y guarda una copia en el equipo: con un F5 el código vuelve y lo avisa. Nuevo (06/10): el docente publica, oculta, archiva y restaura módulos, temas, lecciones y clases; «Ocultar» pide confirmación, y publicar u ocultar se deshace desde el aviso. Antes de eliminar, la ventana dice exactamente qué se pierde y no deja borrar el trabajo de estudiantes (ofrece «Archivar en su lugar»); eliminar una clase exige escribir su nombre y esperar 8 s para leer las consecuencias. | — |
| **UX-03** | Regla de oro 2 de Mandel: reducir la carga de memoria | C | **C** | Se mantiene: «Cómo se califica», casos de prueba y límite de tiempo siempre visibles; registro en 2 pasos con las reglas de la clave a la vista. Nuevo: el diagnóstico de la salida dice qué revisar sin tener que comparar a ojo («Casi: cambia alguna mayúscula o minúscula»). Captura pc_est_diagnostico.webp. | — |
| **UX-04** | Regla de oro 3 de Mandel: consistencia integral | CP | **C** ↑ | Se quitaron los 107 emojis de las pantallas y se cambiaron por íconos Lucide: 0 emojis medidos en el contenido de todas las pantallas recorridas. Títulos en estilo de oración en todas las pantallas («Iniciar sesión», «Mis clases») y sin anglicismos («Volver al inicio» en lugar de «Dashboard»). Queda pendiente aplicar la identidad visual completa de José (docs/identidad-visual/), que no cambia estos criterios. Prueba automática UX-04 en src/content-rendering/__tests__/listas-chequeo-v2-linea-a.frontend.spec.ts. | — |
| **UX-05** | Modelado de usuarios, personas y análisis de tareas | CP | **C** ↑ | Dos Personas (estudiante de 3.er semestre y docente de Fundamentos de Algoritmia) y el análisis jerárquico de tareas (HTA) de «resolver un ejercicio» y «preparar una clase», con las decisiones de la interfaz que salen de cada uno: docs/modesec/usuarios/PERSONAS_Y_TAREAS.md. | — |
| **UX-06** | Directrices ergonómicas de Tognazzini (Fitts, retroalimentación, estado) | CP | **C** ↑ | Fitts: «Probar código» y «Entregar solución» miden 48 px de alto en el celular y 44 px en el computador; los demás controles miden 44 px o más (390×844). Estado siempre visible: «Guardado a las…», «Sin conexión: tu código queda en este equipo; reintentando…». Nuevo (06/10): toda acción del docente termina con un aviso (components/AvisosPantalla.vue; role="status", o "alert" si es un error) que se cierra solo a los 6 s; el botón de publicar mide 44 px en el celular. | — |
| **UX-07** | Accesibilidad universal y WCAG 2.1 (POUR) | CP | **C** ↑ | axe-core 4.10 (WCAG 2.1 A/AA) en producción: 0 problemas en las 20 pantallas medidas (estudiante, docente y públicas, en computador y celular), contra 5 a 24 problemas de contraste por pantalla en el «antes». Lighthouse 12 en el inicio de sesión: Accesibilidad 100, Buenas prácticas 100, SEO 100 (celular y computador). Enlace «Saltar al contenido» (Tab al entrar) y aria-current="page" en el menú y las migas. Única marca de axe: «scrollable-region-focusable» en el editor de código del celular, que es un falso positivo de CodeMirror 6 (el área se recorre con el teclado desde el propio editor). Reportes lighthouse_login_mobile.html y lighthouse_login_desktop.html; captura pc_est_saltar_contenido.webp. | — |
| **UX-08** | Prototipado validado y métricas de usabilidad | CP | **CP** | Prototipo en Figma, evaluación heurística de Nielsen y auditorías QA. La encuesta SUS (Brooke, 1996) está dentro de STIRE (/estudiante/encuesta y /docente/encuesta) y se calcula sola; el admin ve los resultados sin nombres. Los 5 integrantes la responden en la revisión humana, que cierra el viernes 09/10. Hasta tener esas respuestas el ítem queda en CP. | Calcular el SUS con las respuestas del equipo (pasa a C con el resultado). |

## 3. Bloque 2: Diseño para la Movilidad (Capítulo 13)

| ID | Criterio | Antes (04/10) | Hoy (06/10) | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **MOB-01** | Pirámide de diseño móvil / web | C | **C** | Sin desplazamiento horizontal en ninguna pantalla medida, en vertical (390×844) ni en horizontal (844×390). Las tarjetas pasan a una columna y la lección se divide en bloques cortos. Capturas cel_est_inicio.webp, cel_est_unidad.webp y cel_est_horizontal.webp. | — |
| **MOB-02** | Ergonomía táctil y zona del pulgar | CP | **C** ↑ | En el celular, «Probar código» y «Entregar solución» van en una barra fija abajo (y = 784 de 844 px, 48 px de alto), en la zona del pulgar; el botón del Tutor sube para no taparlos. Controles de 44 px o más en todas las pantallas del estudiante y del docente medidas en el celular; quedan por debajo solo los enlaces dentro de un texto (exentos en WCAG 2.5.8) y el botón «Mostrar contraseña» dentro del campo (32 px, sobre el mínimo de 24 px de WCAG 2.5.8). Captura cel_est_barra_inferior.webp. | — |
| **MOB-03** | Sensibilidad al contexto y adaptabilidad | CP | **C** ↑ | Rotación sin perder el código (844×390); correo con type="email"; el código de clase pide mayúsculas y se formatea mientras se escribe («algo 2034» → «ALGO-2034»). Modo oscuro y más (desde la noche del 04/10): tema claro, oscuro o «como mi dispositivo», alto contraste, texto grande y más espacio entre líneas, en Mi perfil → «Apariencia y lectura» (docs/DISENO_APARIENCIA.md); 0 problemas de contraste de axe-core en 20 pantallas con el tema oscuro. | — |
| **MOB-04** | Resiliencia de red y rendimiento en movilidad | CP | **C** ↑ | Sin red aparece «Sin conexión. Puedes seguir: tu código queda en este equipo y se enviará al volver la red» y el estado del editor lo repite; al volver la red se guarda solo («Guardado a las 12:20»). Probado en producción cortando la conexión en el celular. Imágenes con loading="lazy"; la calificación es asíncrona. Lighthouse Rendimiento: 79 en celular y 92 en computador. Captura cel_est_sin_conexion.webp. | — |

## 4. Bloque 3: Diseño Basado en Patrones (Capítulo 14)

| ID | Criterio | Antes (04/10) | Hoy (06/10) | Evidencia | Lo que queda |
|---|---|---|---|---|---|
| **PAT-01** | Patrones arquitectónicos y de presentación (MVC / componentes) | CP | **C** ↑ | Ninguna página llama a la API desde la vista: 0 de 45 (eran 31 de 40 el 04/10). Cada pantalla organiza y pide sus datos a un composable por dominio (useUnidadEstudiante, useAsistenciaClase, useAjustesClase, useContenidosCurso y otros 25 nuevos); las reglas viven en utilidades puras con prueba. Una prueba automática impide que una página vuelva a llamar a la API (src/content-rendering/__tests__/pat01-paginas-sin-api.frontend.spec.ts). Queda: 26 componentes todavía llaman a la API; siguen el mismo camino, sin cambiar lo que ve el usuario. | — |
| **PAT-02** | Patrones de navegación de interfaz (Tidwell, van Welie) | C | **C** | Menú lateral con la opción activa (aria-current), pestañas en la clase del docente y en el ejercicio, migas en la lección y ahora también en el ejercicio, y barra de acciones inferior en el celular. | — |
| **PAT-03** | Patrones de entrada de datos y formularios | CP | **C** ↑ | El inicio de sesión valida sin el globo del navegador: el error aparece bajo el campo y el foco va al primero que falta (utils/registro.ts, faltantesDelIngreso). El código de clase tiene formato asistido (utils/codigoClase.ts): mayúsculas y guion mientras se escribe. El registro ya validaba campo a campo. Captura cel_validacion_login.webp. | — |
| **PAT-04** | Prevención de antipatrones de UI | CP | **C** ↑ | Sin «Mystery Meat» (0 botones sin nombre) ni ventanas encimadas: todas las ventanas usan la misma base accesible. «The Blob» se atacó por responsabilidad, no por longitud: se dividieron los cinco archivos que mezclaban responsabilidades (panel del admin 1532 → 93 líneas, Contenidos 1131 → 338, Ajustes de la clase 604 → 153, las tres ventanas de crear contenido 429 → una sola ventana, el constructor de ejercicios HTML/CSS 645 → 174 con su lógica en una utilidad con prueba). Quedan 20 de 159 archivos de más de 300 líneas, cada uno con su motivo escrito (una sola herramienta: editor de diagramas, editor de código, cajón del Tutor…); la prueba pat04-componentes-grandes no deja que crezcan ni que aparezcan nuevos (actualizado el 07/10). | — |

## 5. Consolidación

| Bloque | Ítems | Posibles | Antes (04/10) | Hoy (06/10) | % hoy |
|---|---|---|---|---|---|
| Bloque 1: Experiencia de Usuario (Capítulo 12) | 8 | 16 | 10 | 15 | 93.8 % |
| Bloque 2: Diseño para la Movilidad (Capítulo 13) | 4 | 8 | 5 | 8 | 100.0 % |
| Bloque 3: Diseño Basado en Patrones (Capítulo 14) | 4 | 8 | 5 | 8 | 100.0 % |
| **Total** | | **32** | **20** | **31** | **96.9 % · Sobresaliente** |

## 6. Fortalezas

Accesibilidad medida: 0 problemas de axe-core WCAG 2.1 AA en 20 pantallas y Lighthouse Accesibilidad 100 (UX-07). Uso con una mano en el celular: barra inferior de 48 px y controles de 44 px (MOB-02, UX-06). El trabajo no se pierde: copia local, recuperación tras F5 y aviso sin conexión (UX-02, MOB-04). Una sola apariencia: 0 emojis y títulos uniformes (UX-04). Migas en todo el recorrido (UX-01, PAT-02), errores bajo el campo y formato asistido (PAT-03), y Personas con HTA (UX-05). El docente organiza su curso sin miedo (06/10): ve qué se pierde antes de eliminar, no puede borrar el trabajo de sus estudiantes, puede archivar y restaurar, y cada acción confirma que salió bien (UX-02, UX-06). Ninguna página llama a la API desde la vista (PAT-01).

## 7. Lo que queda

1) Falta el SUS del equipo: se responde en la revisión humana, hasta el viernes 09/10 (UX-08). Con él, 32/32. (07/10: PAT-04 pasó a C al dividir Ajustes de la clase, las ventanas de crear contenido y el constructor HTML/CSS.)

## 8. Método

mismo método sobre la v2.0.0 (main @ 80f63d6), desplegada en stire-soft.vercel.app. Solo se reevaluaron los criterios que cambiaron desde el 04/10 (interfaz: UX-02, UX-06, UX-08, MOB-03, PAT-01 y PAT-04); los demás conservan la evidencia del 04/10. Mediciones del código (páginas que llaman a la API, archivos de más de 300 líneas) y recorrido en el navegador de la gestión de contenidos del docente (14 pasos, 0 errores). Es una evaluación hecha con IA (Claude Code): la revisión humana del equipo, criterio por criterio, cierra el viernes 09/10 (tarjetas S08-V-* en Trello). Revisiones anteriores en docs/calidad/listas-chequeo/.

**Evidencia nueva:** capturas del recorrido de la gestión de contenidos del docente en [`capturas/`](capturas/) (backend y base locales, con datos de prueba): publicar, archivar, módulo protegido por el trabajo de sus estudiantes, ventana de eliminar clase con la cuenta de 8 s y Contenido en el celular. Las demás capturas y mediciones siguen en [`../2026-10-04_despues/`](../2026-10-04_despues/).
