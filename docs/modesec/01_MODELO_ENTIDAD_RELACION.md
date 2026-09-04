---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    no aplica (modelo de datos)
---

# 🧱 Insumo 01 — Modelo de Entidad-Relación y Catálogo de Datos

**Proyecto:** STIRE-Soft  
**Fuente de Verdad:** Entidades TypeORM en `src/**/entities/*.entity.ts`  
**Base de Datos:** MySQL 8 (`basestire`)  
**Fecha:** 30 de agosto de 2026  

---

## 1. Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : "se matricula en"
    USER ||--o{ CLASS : "crea / dicta como docente"
    USER ||--o{ LEARNING_PROGRESS : "posee historial cognitivo"
    USER ||--o{ REVIEW_SCHEDULE : "tiene programados repasos"
    USER ||--o{ SUBMISSION : "realiza entregas"
    USER ||--o{ TUTOR_CONVERSATION : "mantiene diálogos con"
    USER ||--o{ USER_AFFILIATION : "pertenece a"

    INSTITUTION ||--o{ PROGRAM : "ofrece"
    PROGRAM ||--o{ USER_AFFILIATION : "vincula a"

    CLASS ||--o{ ENROLLMENT : "contiene estudiantes"
    CLASS ||--o{ SECTION : "se divide en secciones"
    
    TOPIC ||--o{ LEARNING_UNIT : "agrupa unidades"
    
    LEARNING_UNIT ||--o{ ACTIVITY : "contiene actividades"
    LEARNING_UNIT ||--o{ CONTENT : "aloja bloques de contenido"
    LEARNING_UNIT ||--o{ LEARNING_PROGRESS : "es rastreada por"
    LEARNING_UNIT ||--o{ REVIEW_SCHEDULE : "repasada mediante SM-2"

    ACTIVITY_TYPE ||--o{ ACTIVITY : "tipifica a"
    ACTIVITY ||--o{ ACTIVITY_QUESTION : "contiene preguntas / retos"
    ACTIVITY ||--o{ SUBMISSION : "recibe intentos de"

    ACTIVITY_QUESTION ||--o{ SUBMISSION_ANSWER : "recibe respuesta"
    SUBMISSION ||--o{ SUBMISSION_ANSWER : "compila respuestas de"
    SUBMISSION_ANSWER ||--o{ EXECUTION_RESULT : "genera veredicto sandbox"
```

---

## 2. Catálogo Detallado de Entidades Principales

### 2.1 `User` (Tabla: `users`)
* **Propósito:** Representa a los usuarios del sistema (estudiantes, docentes y administradores).
* **Atributos:**
  * `id` (INT, PK, Auto-increment): Identificador único.
  * `email` (VARCHAR, UNIQUE, Obligatorio): Correo institucional.
  * `password` (VARCHAR, Obligatorio, `select: false`): Hash bcrypt de la contraseña.
  * `fullName` (VARCHAR, Obligatorio): Nombre completo del usuario.
  * `role` (ENUM: `'estudiante'`, `'docente'`, `'admin'`, Default: `'estudiante'`): Rol de seguridad.
  * `isActive` (BOOLEAN, Default: `true`): Estado de la cuenta.
  * `createdAt` / `updatedAt` / `deletedAt` (TIMESTAMP, Soft delete).
* **Relaciones:** 1:N con `Enrollment`, 1:N con `Class` (como teacher), 1:N con `UserAffiliation`.
* **Reglas de Acceso:**
  * Creación: Público vía `/auth/register` (asigna rol estudiante por defecto) o `Admin` vía `/users`.
  * Modificación: El propio usuario (perfil básico) o `Admin` (rol, estado activo).
  * Consulta: Autenticado (propio perfil) o `Admin` (listado completo).

### 2.2 `Class` (Tabla: `classes`)
* **Propósito:** Representa un aula o grupo académico gestionado por un docente.
* **Atributos:**
  * `id` (INT, PK, Auto-increment): Identificador de la clase.
  * `name` (VARCHAR, Obligatorio): Nombre de la asignatura o grupo (ej. "Algoritmia I - G1").
  * `description` (TEXT, Opcional): Descripción temática.
  * `code` (VARCHAR, UNIQUE, Obligatorio): Código alfanumérico único para auto-matrícula.
  * `teacherId` (INT, FK -> `users.id`, Obligatorio): Docente titular.
  * `isActive` (BOOLEAN, Default: `true`): Disponibilidad de la clase.
  * `startDate` / `endDate` (DATE, Opcionales): Vigencia temporal.
  * `maxStudents` (INT, Opcional): Límite de cupos.
* **Relaciones:** N:1 con `User` (Docente), 1:N con `Enrollment`, 1:N con `Section`.
* **Reglas de Negocio:**
  * Un docente solo puede modificar o eliminar sus propias clases (o un `Admin`).

### 2.3 `Enrollment` (Tabla: `enrollments`)
* **Propósito:** Registro formal de matrícula de un estudiante en una clase específica.
* **Atributos:**
  * `id` (UUID, PK): Identificador único de matrícula.
  * `classId` (INT, FK -> `classes.id`, Obligatorio): Clase asociada.
  * `studentId` (INT, FK -> `users.id`, Obligatorio): Estudiante matriculado.
  * `status` (ENUM: `'active'`, `'withdrawn'`, `'completed'`, Default: `'active'`).
  * `joinedAt` (TIMESTAMP, Default: `now()`): Fecha de inscripción.
  * `leftAt` (TIMESTAMP, Nullable): Fecha de retiro.
  * `lastActivityAt` (TIMESTAMP, Nullable): Última interacción en la clase.
* **Restricciones:** UNIQUE(`classId`, `studentId`). Un docente NO puede matricularse como estudiante.

### 2.4 `Topic` (Tabla: `topics`)
* **Propósito:** Eje temático o módulo conceptual que agrupa unidades de aprendizaje.
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `name` (VARCHAR, Obligatorio): Título del tema (ej. "Estructuras de Control Condicional").
  * `description` (TEXT, Opcional).
  * `order` (INT, Default: `0`): Posición en la secuencia didáctica.
  * `isActive` (BOOLEAN, Default: `true`).
* **Relaciones:** 1:N con `LearningUnit`.

### 2.5 `LearningUnit` (Tabla: `learning_units`)
* **Propósito:** Unidad fundamental de aprendizaje (*mastery unit*) donde residen teoría, prácticas y evaluaciones.
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `title` (VARCHAR, Obligatorio): Título de la unidad (ej. "Ciclos While y Variables de Control").
  * `description` (TEXT, Opcional).
  * `difficulty` (ENUM: `'basico'`, `'intermedio'`, `'avanzado'`, Default: `'basico'`).
  * `order` (INT, Default: `0`): Orden relativo.
  * `isActive` (BOOLEAN, Default: `true`): Visibilidad pedagógica.
  * `topicId` (INT, FK -> `topics.id`, Nullable).
* **Relaciones:** 1:N con `Activity`, 1:N con `Content`, 1:N con `LearningProgress`.

### 2.6 `Activity` (Tabla: `activities`)
* **Propósito:** Tarea, ejercicio práctico o evaluación interactiva dentro de una unidad.
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `learningUnitId` (INT, FK -> `learning_units.id`).
  * `activityTypeId` (INT, FK -> `activity_types.id`).
  * `title` (VARCHAR, Obligatorio).
  * `description` (TEXT, Opcional).
  * `status` (ENUM: `'draft'`, `'published'`, `'archived'`, Default: `'published'`).
  * `totalPoints` (FLOAT, Default: `100`).
  * `passingScore` (FLOAT, Default: `60`).
  * `adaptiveWeight` (FLOAT, Default: `1.0`): Ponderación para el cálculo de maestría.
  * `attemptsAllowed` (INT, Default: `0`): 0 indica intentos ilimitados.

### 2.7 `ActivityQuestion` (Tabla: `activity_questions`)
* **Propósito:** Reactivo, pregunta o reto de programación individual dentro de una actividad.
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `activityId` (INT, FK -> `activities.id`).
  * `type` (ENUM: `'mcq'`, `'code_sandbox'`, `'fill_code'`, `'drag_drop'`, `'matching'`, `'ordering'`).
  * `prompt` (TEXT, Obligatorio): Enunciado de la pregunta.
  * `config` (JSON, Obligatorio): Opciones, solución de referencia, código base y casos de prueba (públicos y privados).
  * `points` (FLOAT, Default: `10`).

### 2.8 `Submission` (Tabla: `submissions`)
* **Propósito:** Intento formal de resolución de una actividad por parte de un estudiante.
* **Atributos:**
  * `id` (UUID, PK): Identificador único del intento.
  * `activityId` (INT, FK -> `activities.id`).
  * `studentId` (INT, FK -> `users.id`).
  * `attemptNumber` (INT, Default: `1`).
  * `status` (ENUM: `'in_progress'`, `'submitted'`, `'graded'`, `'failed'`, Default: `'in_progress'`).
  * `score` (FLOAT, Default: `0`).
  * `timeSpentSeconds` (INT, Default: `0`).
  * `autosaveData` (JSON, Nullable): Respaldo en tiempo real del editor.
  * `startedAt` / `submittedAt` (TIMESTAMP).

### 2.9 `SubmissionAnswer` (Tabla: `submission_answers`)
* **Propósito:** Respuesta específica a una pregunta dentro de un intento de entrega.
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `submissionId` (UUID, FK -> `submissions.id`).
  * `questionId` (INT, FK -> `activity_questions.id`).
  * `answer` (JSON, Obligatorio): Código o selección del estudiante.
  * `isCorrect` (BOOLEAN, Nullable): Null mientras se evalúa en sandbox asíncrono.
  * `score` (FLOAT, Default: `0`).
  * `feedback` (TEXT, Nullable, Sanitizeado PLAIN): Retroalimentación de la prueba.

### 2.10 `LearningProgress` (Tabla: `learning_progress`)
* **Propósito:** Registro cognitivo y de dominio del estudiante sobre una unidad de aprendizaje específica (*Mastery Record*).
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `studentId` (INT, FK -> `users.id`, Obligatorio).
  * `learningUnitId` (INT, FK -> `learning_units.id`, Obligatorio).
  * `mastery` (FLOAT, Default: `0`): Nivel de dominio computado [0, 100].
  * `status` (ENUM: `'no_visto'`, `'explorado'`, `'en_practica'`, `'comprension_parcial'`, `'dominado'`).
  * `successRate` (FLOAT, Default: `0`): Porcentaje de actividades aprobadas vs enviadas.
  * `attemptsCount` (INT, Default: `0`): Total de envíos realizados.
  * `completedActivities` (INT, Default: `0`): Conteo único de actividades superadas.
  * `lastActivityId` (INT, FK -> `activities.id`, Nullable).
* **Restricciones:** UNIQUE(`studentId`, `learningUnitId`).

### 2.11 `ReviewSchedule` (Tabla: `review_schedules`)
* **Propósito:** Programación de repetición espaciada según el algoritmo SuperMemo-2 (SM-2).
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `studentId` (INT, FK -> `users.id`).
  * `learningUnitId` (INT, FK -> `learning_units.id`).
  * `easeFactor` (FLOAT, Default: `2.5`): Factor de facilidad SM-2.
  * `intervalDays` (INT, Default: `1`): Días hasta la siguiente sesión.
  * `repetitionsCount` (INT, Default: `0`): Rachas de repaso exitosas.
  * `nextReviewDate` (TIMESTAMP, Indexado): Fecha límite calculada para el repaso.

### 2.12 `TutorConversation` (Tabla: `tutor_conversations`)
* **Propósito:** Historial de interacción pedagógica entre el estudiante y el Tutor IA.
* **Atributos:**
  * `id` (INT, PK, Auto-increment).
  * `studentId` (INT, FK -> `users.id`).
  * `role` (ENUM: `'user'`, `'assistant'`).
  * `content` (TEXT, Sanitizado PLAIN sin HTML malicioso).
  * `createdAt` (TIMESTAMP, Default: `now()`).
