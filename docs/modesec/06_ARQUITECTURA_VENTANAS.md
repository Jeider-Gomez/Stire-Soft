# 🏛️ Insumo 06 — Arquitectura Funcional de Ventanas MODESEC

> **Proyecto:** STIRE-Soft  
> **Norma:** MODESEC §3.3 / Especificación Técnica de Pantallas  
> **Nomenclatura Oficial:** Estandarizada según [NAMING_STIRE.md](./NAMING_STIRE.md) (Código Técnico $\to$ Nombre Documental $\to$ Nombre Visible)  
> **Total de Ventanas:** 15 (1 Común + 6 Estudiante + 5 Docente + 3 Administrador)  
> **Fecha de Actualización:** 2 de septiembre de 2026 | **Versión:** 2.0 Multi-Rol

---

## 🔑 PARTE 0: VISTA COMÚN

### VENTANA: Acceso y Autenticación
* **CÓDIGO TÉCNICO:** `COMP-V00`
* **NOMBRE DOCUMENTAL:** Acceso y Autenticación Multi-Rol
* **NOMBRE VISIBLE EN UI:** **Iniciar Sesión / Crear Cuenta**
* **ROL:** Público / Todos los roles (`estudiante`, `docente`, `admin`)
* **OBJETIVO:** Permitir el acceso seguro al sistema y registrar nuevos estudiantes.
* **ENTRADA:** Ruta raíz `/` o `/auth/login`.
* **DATOS MOSTRADOS:** Formulario de credenciales (email y password), selector de pestañas (Ingresar / Registrarse), mensajes de error en línea.
* **ACCIONES:** `[Iniciar Sesión]`, `[Crear Cuenta]`, `[Alternar Pestañas]`.
* **COMPONENTES:** `AuthCard`, `InputField`, `ButtonPrimary`, `AlertMessage`.
* **ENDPOINTS:** `POST /auth/login`, `POST /auth/register`.
* **ESTADOS:**
  * **Carga:** Botón con spinner, inputs deshabilitados.
  * **Error:** Alerta roja en línea ("Credenciales inválidas" o "Usuario inactivo").
  * **Éxito:** Redirección automática a la vista correspondiente según el rol del token JWT.
* **NAVEGACIÓN:**
  * Estudiante -> `EST-V01` (Inicio)
  * Docente -> `DOC-V01` (Mis Clases)
  * Admin -> `ADM-V01` (Estado del Sistema)
* **REGLAS DE NEGOCIO:** Throttling estricto a 5 intentos/minuto. La contraseña jamás se expone en la respuesta.

---

## 🎓 PARTE 1: VISTAS DEL ESTUDIANTE

### VENTANA: Dashboard del Estudiante
* **CÓDIGO TÉCNICO:** `EST-V01`
* **NOMBRE DOCUMENTAL:** Dashboard del Estudiante
* **NOMBRE VISIBLE EN UI:** **Inicio**
* **ROL:** `estudiante`
* **OBJETIVO:** Servir como panel central de control, orientando al alumno con la acción de aprendizaje prioritaria del día.
* **ENTRADA:** `/estudiante/dashboard`
* **DATOS:** Saludo, tarjeta Hero dinámica ("Continuar lección" o "Repaso prioritario"), badge de repasos pendientes hoy, barra de dominio global, grid de clases matriculadas.
* **ACCIONES:** `[Continuar lección]`, `[Iniciar repaso (5 min)]`, `[+ Unirse a una clase]`, `[Ver Mi Progreso]`.
* **COMPONENTES:** `StudentHeader`, `MasterySummaryCard`, `SpacedRepetitionBadge`, `ClassCardList`, `JoinClassModal`.
* **ENDPOINTS:** `GET /enrollment/my`, `GET /analytics/student/:id`, `POST /enrollment/join`.
* **ESTADOS:**
  * **Vacío:** "No estás matriculado en ninguna clase. Ingresa el código provisto por tu docente [+ Unirse a una clase]".
  * **Carga:** Skeletons de tarjetas y barra de progreso.
  * **Con Repasos Críticos:** Tarjeta Hero prioriza el mantenimiento de la memoria.
  * **Al Día:** Tarjeta Hero prioriza avanzar a la siguiente unidad.
* **NAVEGACIÓN:** A `EST-V02` (Lección), `EST-V05` (Repasos), `EST-V06` (Mi Progreso), `EST-V04` (Tutor IA).

---

### VENTANA: Unidad de Aprendizaje (Teoría)
* **CÓDIGO TÉCNICO:** `EST-V02`
* **NOMBRE DOCUMENTAL:** Unidad de Aprendizaje (Teoría y Trazado)
* **NOMBRE VISIBLE EN UI:** **Lección: [Título de Unidad]**
* **ROL:** `estudiante`
* **OBJETIVO:** Presentar la base conceptual, ejemplos de código y trazados de escritorio interactivos de una unidad temática.
* **ENTRADA:** `/estudiante/unidad/:id`
* **DATOS:** Título de la unidad, bloques Markdown de lectura, diagrama conceptual SVG, tabla de variables paso a paso, badge de dificultad.
* **ACCIONES:** `[Ir al ejercicio ➔]`, `[💡 Pedir pista al Tutor]`, `[Marcar como leído]` *(Requerida - Pendiente backend)*.
* **COMPONENTES:** `MarkdownViewer`, `CodeHighlighter`, `ConceptualDiagramViewer`, `StartExerciseButton`.
* **ENDPOINTS:** `GET /learning-unit/:id`, `GET /content/unit/:id`.
* **ESTADOS:**
  * **Vacío:** "Esta unidad aún no tiene bloques de contenido publicados".
  * **Carga:** Skeleton de lectura de texto y código.
* **NAVEGACIÓN:** A `EST-V03` (Práctica/Ejercicio), `EST-V01` (Inicio).

---

### VENTANA: Entorno de Programación (Sandbox)
* **CÓDIGO TÉCNICO:** `EST-V03`
* **NOMBRE DOCUMENTAL:** Entorno de Programación y Evaluación en Sandbox
* **NOMBRE VISIBLE EN UI:** **Ejercicio: [Nombre]** *(Navbar: Práctica)*
* **ROL:** `estudiante`
* **OBJETIVO:** Proveer un entorno de codificación interactivo donde el estudiante implementa algoritmos y los valida contra pruebas del juez seguro.
* **ENTRADA:** `/estudiante/evaluacion/:activityId`
* **DATOS:** Enunciado estructurado (colapsable), editor de código Monaco, consola de ejecución con pestañas (Casos Públicos con diff, Casos Privados ciegos, Errores), contador de intentos.
* **ACCIONES:** `[▶ Probar código]` (prueba libre gratuita sin consumir intentos), `[🚀 Entregar solución]` (evaluación formal calificada), `[💡 Pedir pista al Tutor]`, `[Reiniciar código]`.
* **COMPONENTES:** `CodeEditorMonaco`, `ProblemStatement`, `TestCasesPanel`, `ConsoleOutput`, `AutosaveIndicator`.
* **ENDPOINTS:** `POST /submissions/start`, `PUT /submissions/:id/autosave`, `POST /submissions/:id/submit`.
* **ESTADOS:**
  * **Ejecutando Sandbox:** Spinner en consola "Ejecutando pruebas aisladas en entorno seguro...".
  * **Éxito (Accepted):** Tarjeta de felicitación verde + actualización de dominio (+X%).
  * **Fallo (Wrong Answer):** Resaltado de diferencias en casos públicos sin revelar casos privados.
  * **Límite de Intentos:** Botón de entrega deshabilitado con mensaje de retroalimentación final.
* **REGLAS DE NEGOCIO:** Autoguardado cada 15 segundos (`autosave`).

---

### VENTANA: Tutor Socrático Adaptativo
* **CÓDIGO TÉCNICO:** `EST-V04`
* **NOMBRE DOCUMENTAL:** Tutor Socrático Adaptativo con IA
* **NOMBRE VISIBLE EN UI:** **Tutor IA**
* **ROL:** `estudiante`
* **OBJETIVO:** Brindar andamiaje pedagógico personalizado mediante diálogo socrático guiado por el estado cognitivo del estudiante sin entregar código.
* **ENTRADA:** Drawer lateral flotante global o `/estudiante/tutor`.
* **DATOS:** Historial de conversación tipo chat, badge de nivel cognitivo (Principiante / Intermedio / Avanzado), aviso visible de IA.
* **ACCIONES:** `[Enviar pregunta]`, `[Adjuntar mi código actual]`, `[Pistas rápidas: Pista conceptual / Pregunta orientadora / Ubicación de falla]`.
* **COMPONENTES:** `TutorChatDrawer`, `ChatMessageItem`, `PromptInput`, `ThinkingIndicator`.
* **ENDPOINTS:** `POST /tutor/chat`.
* **ESTADOS:**
  * **Pensando:** Indicador de 3 puntos titilantes.
  * **Límite de Consultas:** "Has alcanzado el límite de 20 consultas por minuto".

---

### VENTANA: Módulo de Repetición Espaciada (SM-2)
* **CÓDIGO TÉCNICO:** `EST-V05`
* **NOMBRE DOCUMENTAL:** Módulo de Repetición Espaciada (SM-2)
* **NOMBRE VISIBLE EN UI:** **Repasos**
* **ROL:** `estudiante`
* **OBJETIVO:** Listar y ejecutar las actividades de repaso recomendadas por la curva del olvido para consolidar la retención a largo plazo.
* **ENTRADA:** `/estudiante/repasos`
* **DATOS:** Tarjetas de unidades vencidas con badges de urgencia accesible (■ Crítico, ▲ Toca repasar hoy, ⬤ Al día), justificación en lenguaje natural, gráfico de salud de la memoria.
* **ACCIONES:** `[Iniciar repaso (5 min)]`, `[Posponer 24h]`.
* **COMPONENTES:** `SpacedRepetitionCard`, `UrgencyTag`, `EmptyState`, `MemoryHealthChart`.
* **ENDPOINTS:** `GET /analytics/student/:id`.
* **ESTADOS:**
  * **Al día (Sin deuda):** Empty state de felicitación "¡Excelente memoria! No tienes conceptos vencidos hoy".
  * **Con Repasos:** Tarjetas ordenadas de mayor a menor urgencia.

---

### VENTANA: Analítica y Bitácora de Aprendizaje
* **CÓDIGO TÉCNICO:** `EST-V06`
* **NOMBRE DOCUMENTAL:** Analítica y Bitácora de Aprendizaje
* **NOMBRE VISIBLE EN UI:** **Mi Progreso**
* **ROL:** `estudiante`
* **OBJETIVO:** Visualizar el progreso histórico, distribución de dominio por tema y habilitar rutas de refuerzo directo.
* **ENTRADA:** `/estudiante/progreso`
* **DATOS:** Barras de dominio por tema (0 a 100%) con estados cualitativos (`no_visto` $\to$ `dominado`), historial tabular de entregas, visor de código en modal.
* **ACCIONES:** `[Reforzar este tema]`, `[Inspeccionar código de entrega pasada]`, `[Filtrar por asignatura]`.
* **COMPONENTES:** `MasteryBarChart`, `StreakCounter`, `SubmissionsHistoryTable`, `CognitiveStateBadge`.
* **ENDPOINTS:** `GET /learning-progress/student/:id`, `GET /analytics/student/:id`.

---

## 👨‍🏫 PARTE 2: VISTAS DEL DOCENTE

### VENTANA: Panel de Gestión de Clases
* **CÓDIGO TÉCNICO:** `DOC-V01`
* **NOMBRE DOCUMENTAL:** Panel de Gestión de Clases Docente
* **NOMBRE VISIBLE EN UI:** **Mis Clases**
* **ROL:** `docente`
* **OBJETIVO:** Administrar las aulas activas, crear nuevas cohortes y consultar códigos de invitación.
* **ENTRADA:** `/docente/dashboard` o `/docente/clases`
* **DATOS:** Tarjetas de clases con nombre, código de acceso, conteo de estudiantes y promedio de dominio del grupo.
* **ACCIONES:** `[Crear clase]`, `[Copiar código de acceso]`, `[Ver rendimiento del grupo]`, `[Archivar]`.
* **COMPONENTES:** `ClassCardGrid`, `CreateClassModal`, `CopyAccessCodeButton`.
* **ENDPOINTS:** `GET /class/my-classes`, `POST /class`, `PATCH /class/:id`.

---

### VENTANA: Gestor Curricular de Unidades
* **CÓDIGO TÉCNICO:** `DOC-V02`
* **NOMBRE DOCUMENTAL:** Gestor Curricular de Módulos y Unidades
* **NOMBRE VISIBLE EN UI:** **Contenidos y Temas**
* **ROL:** `docente`
* **OBJETIVO:** Organizar la estructura didáctica en módulos, temas y unidades de aprendizaje, regulando su publicación.
* **ENTRADA:** `/docente/contenidos`
* **DATOS:** Árbol jerárquico desplegable (Módulo > Tema > Unidad), interruptor de estado (Borrador / Publicado).
* **ACCIONES:** `[Crear tema]`, `[Crear unidad]`, `[Publicar / Guardar borrador]`, `[Editar contenido]`.
* **COMPONENTES:** `TopicTreeAccordion`, `LearningUnitRow`, `PublishToggle`, `UnitEditModal`.
* **ENDPOINTS:** `GET /topic`, `POST /topic`, `POST /learning-unit`, `PATCH /learning-unit/:id`.

---

### VENTANA: Diseñador de Ejercicios y Casos de Prueba
* **CÓDIGO TÉCNICO:** `DOC-V03`
* **NOMBRE DOCUMENTAL:** Diseñador de Ejercicios y Casos de Prueba
* **NOMBRE VISIBLE EN UI:** **Crear Ejercicio**
* **ROL:** `docente`
* **OBJETIVO:** Crear problemas prácticos con enunciados Markdown, rúbricas de puntaje y casos de prueba para el Sandbox.
* **ENTRADA:** `/docente/ejercicios/crear`
* **DATOS:** Formulario de enunciado, editor de solución modelo, tabla de casos de prueba (públicos y privados).
* **ACCIONES:** `[Agregar caso de prueba]`, `[Validar solución en Sandbox]`, `[Guardar ejercicio]`.
* **COMPONENTES:** `ExerciseForm`, `TestCasesEditorTable`, `SandboxTestButton`.
* **ENDPOINTS:** `POST /activities`, `POST /activity-questions`.

---

### VENTANA: Analítica de Cohorte y Alertas
* **CÓDIGO TÉCNICO:** `DOC-V04`
* **NOMBRE DOCUMENTAL:** Analítica de Cohorte y Alertas de Rendimiento
* **NOMBRE VISIBLE EN UI:** **Rendimiento del Grupo**
* **ROL:** `docente`
* **OBJETIVO:** Monitorear el rendimiento grupal, detectar estudiantes en rezago cognitivo (< 50% dominio) y consultar el roster.
* **ENTRADA:** `/docente/clase/:id/analitica`
* **DATOS:** Promedio de dominio de la clase, ranking de estudiantes, alertas de riesgo (`RiskAlertBadge`), tabla de roster matriculado.
* **ACCIONES:** `[Filtrar por riesgo]`, `[Ver detalle de estudiante]`, `[Exportar reporte CSV]`.
* **COMPONENTES:** `CohortMetricsCard`, `StudentRankingsTable`, `RiskAlertBadge`.
* **ENDPOINTS:** `GET /analytics/class/:id`, `GET /enrollment/class/:id`.

---

### VENTANA: Seguimiento Individual de Estudiante
* **CÓDIGO TÉCNICO:** `DOC-V05`
* **NOMBRE DOCUMENTAL:** Seguimiento Individual de Estudiante
* **NOMBRE VISIBLE EN UI:** **Detalle de Estudiante**
* **ROL:** `docente`
* **OBJETIVO:** Inspeccionar en profundidad el desempeño, código entregado y evolución SM-2 de un estudiante específico.
* **ENTRADA:** `/docente/estudiante/:id`
* **DATOS:** Historial de envíos con visor de código fuente entregado, gráfico de dominio individual por tema, registro de actividad.
* **ACCIONES:** `[Inspeccionar código de entrega]`, `[Ver evolución SM-2]`, `[Volver a Rendimiento del Grupo]`.
* **COMPONENTES:** `StudentDetailCard`, `SubmissionCodeInspector`, `MasteryBarChart`.
* **ENDPOINTS:** `GET /learning-progress/student/:id`, `GET /analytics/student/:id`.

---

## 🛡️ PARTE 3: VISTAS DEL ADMINISTRADOR

### VENTANA: Panel de Control y Salud del Sistema
* **CÓDIGO TÉCNICO:** `ADM-V01`
* **NOMBRE DOCUMENTAL:** Panel de Control y Salud del Sistema
* **NOMBRE VISIBLE EN UI:** **Estado del Sistema**
* **ROL:** `admin`
* **OBJETIVO:** Supervisión general del estado operativo, disponibilidad de base de datos y sandbox en STIRE.
* **ENTRADA:** `/admin/dashboard`
* **DATOS:** Usuarios registrados por rol, total de clases activas, volumen de ejecuciones en sandbox hoy, uptime.
* **COMPONENTES:** `KpiGrid`, `ServiceHealthCard`, `RecentActivitySummary`.
* **ENDPOINTS:** `GET /maintenance`.

---

### VENTANA: Directorio y Gestión de Usuarios
* **CÓDIGO TÉCNICO:** `ADM-V02`
* **NOMBRE DOCUMENTAL:** Directorio y Gestión de Usuarios y Roles
* **NOMBRE VISIBLE EN UI:** **Usuarios y Roles**
* **ROL:** `admin`
* **OBJETIVO:** Administrar cuentas de usuario, asignación de roles y estados de actividad.
* **ENTRADA:** `/admin/usuarios`
* **DATOS:** Tabla paginada con nombre, email institucional, rol asignado, estado activo/inactivo, fecha de creación.
* **ACCIONES:** `[Buscar usuario]`, `[Cambiar rol]`, `[Activar / Desactivar cuenta]`.
* **COMPONENTES:** `UsersTable`, `ChangeRoleModal`, `UserStatusToggle`.
* **ENDPOINTS:** `GET /users`, `PATCH /users/:id`.

---

### VENTANA: Auditoría Técnica y Parámetros
* **CÓDIGO TÉCNICO:** `ADM-V03`
* **NOMBRE DOCUMENTAL:** Auditoría Técnica y Parámetros del Entorno
* **NOMBRE VISIBLE EN UI:** **Logs y Mantenimiento**
* **ROL:** `admin`
* **OBJETIVO:** Consultar logs de auditoría técnica, eventos de seguridad y configuración del sandbox seguro.
* **ENTRADA:** `/admin/sistema`
* **DATOS:** Visor de logs técnicos con filtros por nivel, constantes globales (límites de memoria, timeout de 2s, throttles).
* **COMPONENTES:** `SystemLogsViewer`, `SandboxConfigCard`.
* **ENDPOINTS:** `GET /maintenance`.
