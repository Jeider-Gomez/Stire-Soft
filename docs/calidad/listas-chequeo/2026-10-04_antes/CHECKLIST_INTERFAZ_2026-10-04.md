# Lista de chequeo de interfaz gráfica (Pressman & Maxim, caps. 12, 13 y 14) — revisión del 04/10/2026 (antes)

> **Formato:** el del profesor ([`../../../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx`](../../../curso-ddse3/guias/Checklist_Interfaz_Pressman.docx)), llenado en [`CHECKLIST_INTERFAZ_2026-10-04.docx`](CHECKLIST_INTERFAZ_2026-10-04.docx). Esta página es la misma revisión para leer en GitHub.

## 1. Datos generales

| Campo | Valor |
|---|---|
| Asignatura / Curso | Diseño y Desarrollo de Software Educativo III (203457) — Semana 9 del curso (Reto 3) · 2026-2 |
| Fecha de Evaluación | 04 / 10 / 2026 (análisis del «antes») |
| Versión / Rama Git | v1.1.0 + ajustes de UI/UX del 02 y 03/10 / main @ 7c9977b (versión desplegada el 04/10/2026) |
| Integrantes del Equipo | Jeider Gómez · Pedro Romero · José López · Julio Galvis · Jorge Iván Cervantes García (códigos: completar) |
| URL Demo / Repositorio | https://stire-soft.vercel.app · https://github.com/Jeider-Gomez/Stire-Soft |
| Docente / Evaluador | Prof. Raúl Toscano Miranda · Autoevaluación del equipo STIRE-Soft (revisión con apoyo de Claude Code) |
| Nombre de la Aplicación / Frontend | STIRE-Soft — Sistema Tutor Inteligente con Repetición Espaciada (frontend Nuxt 3) |
| Calificación final | **20 / 32 puntos = 62.5 / 100 · Básico con observaciones** |

Escala del profesor: **C** cumple totalmente (2) · **CP** cumple parcialmente (1) · **NC** no cumple (0) · **NA** no aplica.

## 2. Bloque 1: Experiencia de Usuario (Capítulo 12)

| ID | Criterio | Valoración | Pts | Evidencia | Ajuste para la v1.2.0 |
|---|---|---|---|---|---|
| **UX-01** | Los 5 planos de Garrett y arquitectura de información | **C** | 2 / 2 | Contenido organizado en Unidad › Tema › Lección con rótulos únicos en el menú lateral «Plan de estudio» y en «Plan del curso» del inicio. La lección muestra migas de pan «Inicio › Unidad 3 › Construir un OVA interactivo › Lección» (nav aria-label="Ubicación", pages/estudiante/unidad/[id].vue:4). Sin callejones sin salida: cada lección termina en «Practica» y «Volver al plan del curso». La tarjeta «Tu siguiente paso» concentra la acción principal. Capturas pc_est_inicio.png y pc_est_unidad.png. | — |
| **UX-02** | Regla de oro 1 de Mandel: poner al usuario en control | **CP** | 1 / 2 | Hay control: «Elegir yo el ejercicio» e «Intentar otro ejercicio de todas formas», Ctrl+Z en el editor (CodeMirror), cancelar en las ventanas, registro en 2 pasos con «Atrás». El código se autoguarda en el servidor como borrador. Fallas: 4 confirmaciones usan confirm() nativo del navegador (asistencia.vue:267, notas.vue:469, TutorChatDrawer.vue:412, TutorKeyPanel.vue:117), que es invasivo; y el autoguardado fallaba sin reintentar (hallazgo QA-07 de Jorge, «No se pudo autoguardar»). | Reemplazar confirm() por un diálogo propio; publicar el arreglo de QA-07 (ya hecho en local, falta desplegar). |
| **UX-03** | Regla de oro 2 de Mandel: reducir la carga de memoria | **C** | 2 / 2 | Reconocimiento antes que recuerdo: el ejercicio muestra siempre «Cómo se califica», los casos de prueba y el límite de tiempo; el registro va en 2 pasos (lo obligatorio cabe sin bajar) con las reglas de la contraseña visibles y ejemplos en los campos («Ej: Pedro Romero Mendoza»). La plantilla inicial del código ya trae la lectura de la entrada. Captura cel_est_ejercicio.png y pc_register.png. | — |
| **UX-04** | Regla de oro 3 de Mandel: consistencia integral | **CP** | 1 / 2 | La paleta, la tipografía y los íconos Lucide son comunes, pero quedan 93 emojis en 25 pantallas (sobre todo admin/dashboard.vue, docente/contenidos.vue, estudiante/clases.vue) mezclados con íconos de línea. Los títulos mezclan mayúsculas («Iniciar Sesión», «Mis Clases y Grupos Académicos») con el estilo de oración («Mi progreso»), y quedan anglicismos («← Volver al Dashboard»). La identidad visual de José (docs/identidad-visual/) todavía no está aplicada. | Quitar los emojis restantes, unificar el estilo de los títulos y aplicar la identidad visual. |
| **UX-05** | Modelado de usuarios, personas y análisis de tareas | **CP** | 1 / 2 | Las tareas frecuentes están optimizadas: el inicio del estudiante pone una sola acción destacada («Tu siguiente paso», un clic para continuar) y el docente entra a «Hoy en tu clase». Hay especificación por rol (docs/modesec/usuarios/, códigos EST-V01…V06, DOC-V01…V06) y el perfil del curso (3.er semestre). Falta un documento de Persona formal y el análisis jerárquico de tareas (HTA) escrito. | Redactar 2 Personas (estudiante y docente) y el HTA de «resolver un ejercicio» y «crear una clase». |
| **UX-06** | Directrices ergonómicas de Tognazzini (Fitts, retroalimentación, estado) | **CP** | 1 / 2 | Retroalimentación inmediata: indicadores de carga en 37 pantallas, botones que se desactivan al enviar, notificaciones. El código sobrevive a un F5 porque se guarda en el servidor. Pero los botones de acción del ejercicio son pequeños: «Probar código» 128×32 px y «Entregar solución» 151×30 px (medido en producción), y sin conexión el estado no se conserva con aviso claro. | Botones del ejercicio a 44 px de alto como mínimo. |
| **UX-07** | Accesibilidad universal y WCAG 2.1 (POUR) | **CP** | 1 / 2 | Bien: lang="es", landmarks header/nav/main en todas las pantallas, 0 botones de ícono sin nombre accesible, foco visible al tabular, mensajes con aria-invalid en el registro. axe-core 4.10 (WCAG 2.1 AA) en producción: contraste insuficiente en 5 a 24 elementos por pantalla (24 en el inicio del docente, 15 en «Mi progreso»); 2 campos sin etiqueta en «Mi perfil» (crítico). No hay enlace «Saltar al contenido» y el menú activo no usa aria-current. No se corrió Lighthouse en esta revisión. | Corregir contraste y etiquetas, agregar «Saltar al contenido», aria-current y un reporte Lighthouse. |
| **UX-08** | Prototipado validado y métricas de usabilidad | **CP** | 1 / 2 | Hay prototipo previo en Figma (sistema visual y ventana estándar, docs/curso-ddse3/semana-03/GUI_MOCKUPS_Y_NAVEGACION.md), evaluación heurística de Nielsen (docs/calidad/auditorias/EVALUACION_HEURISTICA_2026-09-30.md) y auditorías QA. Faltan la prueba con 5 usuarios y el SUS: la prueba de dos semanas con el equipo (5 personas) empieza el 05/10. | Aplicar el SUS al final de la prueba de dos semanas (docs/calidad/PRUEBA_DOS_SEMANAS.md). |

## 3. Bloque 2: Diseño para la Movilidad (Capítulo 13)

| ID | Criterio | Valoración | Pts | Evidencia | Ajuste para la v1.2.0 |
|---|---|---|---|---|---|
| **MOB-01** | Pirámide de diseño móvil / web | **C** | 2 / 2 | Medido a 390×844: ninguna pantalla tiene desplazamiento horizontal (inicio, lección, ejercicio, progreso, clases, docente). El menú lateral pasa a menú deslizable; las tarjetas pasan a una columna; la lección se divide en bloques cortos (La idea, Un ejemplo, Error común, Pruébalo). Capturas cel_est_inicio.png, cel_est_unidad.png, cel_doc_clase.png. | — |
| **MOB-02** | Ergonomía táctil y zona del pulgar | **CP** | 1 / 2 | El botón flotante «Tutor» está abajo a la derecha (zona del pulgar) y las acciones del inicio ocupan todo el ancho. Pero en el ejercicio «Probar código» y «Entregar solución» quedan ARRIBA (y = 50 de 844 px) y miden 30-32 px de alto; los íconos del encabezado miden 34×34 px. 24 de 29 controles del inicio en el celular miden menos de 44 px. | Barra inferior fija con Probar y Entregar en el celular; controles de 44-48 px. |
| **MOB-03** | Sensibilidad al contexto y adaptabilidad | **CP** | 1 / 2 | Rotación: al girar a 844×390 el ejercicio se reorganiza en dos columnas (enunciado | editor) sin perder el código (captura cel_est_ejercicio_horizontal.png). Correo con type="email" (teclado de correo). Pero no hay modo oscuro: con prefers-color-scheme: dark el fondo sigue claro; y el campo del código de clase no pide mayúsculas (inputmode/autocapitalize ausentes). El modo oscuro exige tocar tailwind.config.ts y main.css, que son territorio de la identidad visual de José. | autocapitalize="characters" en el código de clase; modo oscuro con José. |
| **MOB-04** | Resiliencia de red y rendimiento en movilidad | **CP** | 1 / 2 | Se simuló «sin conexión» en producción escribiendo en el editor: solo aparece «No se pudo autoguardar», sin explicar que no hay red ni reintentar al volver (captura cel_est_sin_conexion.png). Bien: las imágenes y recursos de la lección usan loading="lazy" (LessonResource.vue, AvatarUsuario.vue, EjemploEnVivo.vue) y la calificación del código es asíncrona (sondeo, no bloquea la pantalla). | Aviso «Sin conexión: tu código se guardará al volver» y reintento automático (el reintento ya está hecho en local). |

## 4. Bloque 3: Diseño Basado en Patrones (Capítulo 14)

| ID | Criterio | Valoración | Pts | Evidencia | Ajuste para la v1.2.0 |
|---|---|---|---|---|---|
| **PAT-01** | Patrones arquitectónicos y de presentación (MVC / componentes) | **CP** | 1 / 2 | Hay separación: 4 stores de Pinia (auth, student, tutor, workspace), 5 composables, 37 utilidades puras con pruebas y componentes reutilizables (CodeEditor, LessonResource, TutorChatDrawer…). Pero 31 de 40 páginas llaman a la API directamente con useApi() desde la vista, en vez de pasar por un store o servicio. | Mover las llamadas de las páginas grandes a stores o composables por dominio. |
| **PAT-02** | Patrones de navegación de interfaz (Tidwell, van Welie) | **C** | 2 / 2 | Menú lateral deslizable con la opción activa resaltada; pestañas en la clase del docente (Hoy, Contenido, Estudiantes, Asistencia, Entregas, Refuerzos, Notas, Ajustes) y en el ejercicio (Enunciado, Casos de prueba, Registro); migas de pan en la lección. Observación: el ejercicio no tiene migas (solo «Volver a la lección» y el nombre del tema). | Agregar migas al ejercicio. |
| **PAT-03** | Patrones de entrada de datos y formularios | **CP** | 1 / 2 | El registro valida campo a campo con aria-invalid, marca el campo y muestra las reglas de la clave; los formularios largos se agrupan (registro en 2 pasos, ajustes plegables). Pero el inicio de sesión depende de la validación nativa del navegador (globo «Incluye un signo @…», sin mensaje bajo el campo) y no hay máscaras de entrada (el código de clase acepta cualquier formato). | Mensaje bajo el campo en el login y formato asistido del código de clase. |
| **PAT-04** | Prevención de antipatrones de UI | **CP** | 1 / 2 | Sin «Mystery Meat»: 0 botones de ícono sin nombre accesible, con aria-label o title. Pero hay «The Blob»: 27 de 95 componentes pasan de 300 líneas; los mayores son admin/index.vue (1532), proyectos/EditorDiagrama.vue (1322) y docente/contenidos.vue (1126). No se encontró una ventana abierta encima de otra en los recorridos, pero no se verificó en las 18 pantallas con ventanas. | Dividir admin/index.vue y docente/contenidos.vue por secciones. |

## 5. Consolidación

| Bloque | Ítems | Posibles | Logrados | % |
|---|---|---|---|---|
| Bloque 1: Experiencia de Usuario (Capítulo 12) | 8 | 16 | 10 | 62.5 % |
| Bloque 2: Diseño para la Movilidad (Capítulo 13) | 4 | 8 | 5 | 62.5 % |
| Bloque 3: Diseño Basado en Patrones (Capítulo 14) | 4 | 8 | 5 | 62.5 % |
| **Total** | | **32** | **20** | **62.5 % · Básico con observaciones** |

## 6. Fortalezas

Arquitectura de información clara (Unidad › Tema › Lección, migas en la lección, «Tu siguiente paso»); responsive real sin desplazamiento horizontal y con reorganización al girar; carga de memoria baja en el ejercicio y en el registro; navegación con pestañas y menú deslizable; 0 botones de ícono sin nombre; prototipo en Figma, evaluación heurística y auditorías QA documentadas.

## 7. Debilidades críticas y ajustes

1) Botones de Probar y Entregar arriba y pequeños en el celular (MOB-02, UX-06). 2) Sin aviso de conexión ni reintento del autoguardado (MOB-04, QA-07). 3) Contraste y 2 campos sin etiqueta según axe-core (UX-07). 4) Consistencia: 93 emojis y títulos con estilos distintos (UX-04). 5) Componentes de más de 300 líneas y llamadas a la API desde las vistas (PAT-01, PAT-04). 6) Falta SUS y prueba con 5 usuarios (UX-08), Personas y HTA (UX-05). Compromiso: corregir 1 a 4 en la v1.2.0 y volver a aplicar esta lista («después»).

## 8. Método

- **Código:** cada afirmación cita el archivo y, cuando importa, la línea, en `main @ 7c9977b`.
- **Aplicación desplegada** (stire-soft.vercel.app), 04/10/2026, con cuentas de prueba `@example.com` (estudiante y docente): computador 1440×900, celular 390×844 y horizontal 844×390; navegación con Tab; `prefers-color-scheme: dark`; conexión cortada en el editor; medición del tamaño de cada control; **axe-core 4.10** con las reglas WCAG 2.1 A/AA.
- **Evidencia:** capturas en [`capturas/`](capturas/) y mediciones en [`evidencia-automatica.json`](evidencia-automatica.json).
- **Nota sobre la plantilla:** el cuadro de consolidación del profesor dice «7 ítems» en el bloque 1 de la lista de interfaz, pero el bloque tiene 8 (UX-01 a UX-08) y 16 puntos posibles; se calificaron los 8.
- **Límites:** no se corrió Lighthouse; axe-core se aplicó en computador; la verificación de ventanas superpuestas (PAT-04) se hizo solo en los recorridos.
