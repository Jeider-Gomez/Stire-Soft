# Inventario de STIRE: qué hay, dónde está y qué choca

Base para la remodelación (`docs/PLAN_REMODELACION.md`). Es un **inventario vivo**: cada vez que se agrega, se mueve o
se quita una función, se cambia aquí en el mismo commit. Sirve para no repetir lo del panel del docente, que se
diseñó sin tener a la vista todas sus funciones y el diseño terminó chocando con ellas.

Última actualización: 27/10/2026 (v2.4.0 desplegada). Tamaño: 49 pantallas, 169 componentes, 49 tablas, 51
migraciones.

**Cómo leer la columna «Choca o satura»:** lo que ya se sabe que molesta. Lo marcado «por revisar» lo confirma o lo
descarta la auditoría de la Fase 1; hasta entonces es **hipótesis**.

---

## 1. Estudiante

| Pantalla | Ruta | Qué hace | Choca o satura |
|---|---|---|---|
| Inicio | `/estudiante` | Saludo, siguiente paso recomendado («¿Por qué veo esto?»), repasos de hoy, clases, avisos del docente, racha | La frase del saludo y el logo se repiten con la barra y el pie (por revisar) |
| Mis clases | `/estudiante/clases` | Unirse con código o QR, presentación de cada clase con la bienvenida del docente | |
| Lección | `/estudiante/unidad/[id]` | Explicación (Markdown, video, recursos), algoritmo en tres formatos, «Escuchar la lección», «No me quedó claro» con la explicación alternativa, ejercicios, anterior/siguiente, ir a cualquier lección (Ctrl+K), valorar la lección | La pantalla más cargada: hay que ordenar qué va primero |
| Ejercicio / evaluación | `/estudiante/evaluacion/[activityId]` | Ocho tipos: opción múltiple, programar (juez JavaScript), arrastrar, emparejar, completar código, ordenar, evaluado por IA, HTML/CSS. Probar antes de entregar, intentos, retroalimentación en el globo de la mascota, «¿qué tan seguro estás?» | **Programar en JavaScript desde cero es un salto grande** (lo vivió Jeider) |
| Repasos | `/estudiante/repasos` | Repetición espaciada del día | |
| Mi progreso | `/estudiante/progreso` | Cifras, lecciones, «Mi perfil de aprendizaje» (MOD-02), «Cómo avanzas» (calibración), autorregulación | Satura: todo en una columna (ya visto el 23/10, sin arreglar) |
| Logros | `/estudiante/logros` | Insignias y racha | No avisa en el momento en que se gana un logro |
| Refuerzos y retos | `/estudiante/refuerzos/[id]` | Lo que el docente asigna a un estudiante | |
| Proyectos | `/estudiante/proyectos` | Proyecto con diagrama (editor de 791 líneas) y entregas | |
| Entregas | `/estudiante/entregas/[id]` | Talleres con archivo y nota | |
| Asistencia | `/estudiante/asistencia` | Marcar con QR, historial | |
| Mensajes | `/estudiante/mensajes` | Mensajes con el docente | |
| Encuesta | `/estudiante/encuesta` | SUS cada cierto tiempo | |
| Perfil | `/estudiante/perfil` | Datos, foto, clave de Gemini para el Tutor, apariencia (temas, alto contraste, reducir movimiento) | |
| **Tutor** (en todas) | lanzador flotante | Chat con Gemini y la clave del estudiante, voz (dictado o grabación), pistas, mascota con expresiones | 535 líneas; **no saluda ni felicita por iniciativa propia** |

## 2. Docente

| Pantalla | Ruta | Qué hace | Choca o satura |
|---|---|---|---|
| Inicio | `/docente` | Saludo, «Por revisar» de todas las clases (rezago, bloqueados, error más repetido, mensajes), clases en tarjetas o lista | El Asistente se volvió a sumar aquí: definir su lugar |
| Biblioteca | `/docente/biblioteca` | Cursos compartidos para reutilizar | |
| Hoy en tu clase | `/docente/clase/[id]` | Resumen del día de una clase | |
| Contenido del curso | `/docente/contenidos` | Árbol (módulo, tema, lección) con estados, mapa «Para completar», lección con pestañas Lección / Actividades / Ajustes, reordenar, crear sin ventanas, duplicar tema, mover lección, «Ver como estudiante», explicaciones alternativas | Quedan ventanas viejas (`UnitLessonsModal`, 403 líneas) mezcladas con el panel nuevo |
| Nuevo ejercicio | `/docente/ejercicios/crear` | Constructor de los ocho tipos | Vive aparte del panel de contenidos |
| Entregas | `/docente/entregas` | Talleres, revisión y nota | |
| Notas | `/docente/clase/[id]/notas` | Notas de la clase | |
| Asistencia | `/docente/clase/[id]/asistencia` | QR, asistencia activa | |
| Ajustes de la clase | `/docente/clase/[id]/ajustes` | Solicitudes para entrar, portada (color), avance, compartir, datos, logros | |
| Ficha del estudiante | `/docente/estudiante/[id]` | Perfil de aprendizaje, progreso, intervención | |
| Refuerzos y retos | `/docente/refuerzos` | Asignar a un estudiante | |
| Rendimiento | `/docente/rendimiento` | Analítica de la clase | Se cruza con «Por revisar» del Inicio (por revisar) |
| Mensajes | `/docente/mensajes` | Con los estudiantes | |
| Encuesta | `/docente/encuesta` | SUS del docente | |
| **Asistente STIRE** (panel lateral) | botón «Asistente», Ctrl+. | Borradores con IA: estructura, explicación, explicación alternativa, opción múltiple, programación (salidas calculadas por el juez), «Analizar mi clase». Editable y reordenable antes de crear | La mascota aparece en la cabecera del panel (34 px), pero el botón que lo abre es solo texto; no se siente como el Tutor |

## 3. Administrador

| Pantalla | Ruta | Qué hace | Choca o satura |
|---|---|---|---|
| Usuarios y roles | `/admin` | Lista, cambiar rol, solicitudes de rol, historial | `/admin/usuarios` es un archivo de 12 líneas que solo redirige: sobra |
| Panel | `/admin/dashboard` | Cifras del sistema | |
| Sistema | `/admin/sistema` | Mantenimiento y limpieza | |
| Catálogo | `/admin/catalogo` | Instituciones y programas duplicados o agregados por docentes | |
| Sugerencias | `/admin/sugerencias` | Resolver o archivar sugerencias | |
| Usabilidad | `/admin/usabilidad` | Resultados del SUS por rol | |
| Exportar investigación | componente | Datos anónimos para la tesis | |
| **Falta** | | Desactivar y reactivar cuentas a la vista, borrado definitivo, «borrar usuarios de prueba», ver la app como un usuario | Ver P15 en `docs/PENDIENTES.md` |

## 4. Público y comunes

Portada (`/`), iniciar sesión, crear cuenta (18+ y una casilla de términos), recuperar contraseña, términos,
privacidad, aceptar términos, manual de usuario (`/ayuda`), recorridos guiados, menú «?», atajos de teclado.

## 5. Servidor (NestJS, 49 tablas)

| Bloque | Módulos |
|---|---|
| Cuentas | `auth`, `user`, `role-requests`, `institution` |
| Clases | `class`, `enrollment`, `asistencia`, `avisos-clase`, `message` |
| Contenido | `section` (módulo), `topic`, `learning-unit` (lección), `content`, `content-rendering`, `media`, `reuse`, `prerequisites` |
| Ejercicios y juez | `activities`, `activity-questions`, `activity-types`, `question-banks`, `submissions`, `submission-answers`, `judge-engine` (solo JavaScript, aislado), `evaluation-engine` |
| Adaptación | `learning-progress`, `review-schedules` (repetición espaciada), `refuerzos`, `analytics` |
| IA | `tutor` (Gemini con la clave del estudiante), `asistente-docente` (con la clave del docente) |
| Otros | `gamification`, `proyectos`, `calificaciones`, `reportes`, `usabilidad`, `valoraciones`, `notifications`, `mail`, `maintenance`, `admin-system`, `health` |

Documentación de la API: Swagger (`src/main.ts`).

## 6. Identidad en pantalla

| Elemento | Dónde aparece hoy | Regla propuesta (Fase 2) |
|---|---|---|
| Logo «stire_» | Barra lateral, pie de página, pestaña | **Un logo por vista**: el de la barra. El pie solo con texto |
| Mascota | Lanzador del Tutor, chat (3 lugares), resultado de la entrega, cabecera del Asistente | Es un **personaje**, no el logo: aparece cuando habla (Tutor, Asistente, logro), no como adorno |
