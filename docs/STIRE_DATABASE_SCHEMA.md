# STIRE — Esquema de Base de Datos y Diccionario de Datos
**Versión basada en código fuente real · Motor: MySQL · ORM: TypeORM**

---

## Reglas Inquebrantables de Base de Datos

Antes de leer cualquier tabla, estas reglas gobiernan **todo** el modelo de datos de STIRE. Cualquier PR que las viole debe rechazarse:

> **REGLA #1 — Sin ManyToMany Automático**
> Está absolutamente prohibido usar `@ManyToMany()` con `@JoinTable()` de TypeORM. TypeORM crearía una tabla invisible en el código que no puede ser auditada, que no acepta columnas extra y que genera JOINs implícitos difíciles de controlar. Toda relación N:M en STIRE es una **Entidad Puente Explícita**.

> **REGLA #2 — Entidades Puente Obligatorias**
> Cada vez que dos entidades se relacionan de forma N:M, se crea una clase TypeScript completa con `@Entity()`, PK propia, las dos FKs explícitas como `@Column()` nombradas, y al menos un campo de auditoría (`joinedAt`, `isCorrect`, `score`, etc.). Ejemplo canónico: `Enrollment`, `SubmissionAnswer`.

> **REGLA #3 — Soft Delete en Entidades Core**
> Las entidades del núcleo pedagógico (`activities`, `submissions`, `learning_units`, etc.) usan `@DeleteDateColumn()` (`deletedAt`). El borrado físico está prohibido. La excepción son tablas de log append-only (`activity_logs`).

> **REGLA #4 — Cascadas Explícitas**
> El `onDelete` de cada `@ManyToOne` debe ser declarado explícitamente. No confiar en el comportamiento por defecto. Omitir una cascada genera registros huérfanos en producción.

---

## 1. Modelo Entidad-Relación Completo

```mermaid
erDiagram
    %% Identidad
    USER ||--o{ USER_AFFILIATION : "tiene (1:N)"
    USER ||--o{ ENROLLMENT : "se inscribe (1:N)"
    USER ||--o{ CLASS : "dicta (1:N)"
    INSTITUTION ||--o{ PROGRAM : "ofrece (1:N)"
    PROGRAM ||--o{ USER_AFFILIATION : "afilia (1:N)"

    %% Jerarquía Académica
    CLASS ||--o{ ENROLLMENT : "contiene estudiantes (1:N)"
    CLASS ||--o{ SECTION : "se divide en (1:N)"
    SECTION ||--o{ TOPIC : "agrupa (1:N)"
    TOPIC ||--o{ LEARNING_UNIT : "contiene (1:N)"

    %% Contenido y Actividades
    LEARNING_UNIT ||--o{ CONTENT : "tiene teoría (1:N)"
    LEARNING_UNIT ||--o{ ACTIVITY : "tiene práctica (1:N)"
    ACTIVITY_TYPE ||--o{ ACTIVITY : "categoriza (1:N)"
    ACTIVITY ||--o{ ACTIVITY_QUESTION : "contiene (1:N)"

    %% Evaluación (Entidad Puente: SubmissionAnswer)
    USER ||--o{ SUBMISSION : "realiza intentos (1:N)"
    ACTIVITY ||--o{ SUBMISSION : "recibe intentos (1:N)"
    SUBMISSION ||--o{ SUBMISSION_ANSWER : "registra respuestas (1:N)"
    ACTIVITY_QUESTION ||--o{ SUBMISSION_ANSWER : "es respondida por (1:N)"
    SUBMISSION_ANSWER ||--o| EXECUTION_RESULT : "genera output código (1:0..1)"

    %% Inteligencia Adaptativa
    USER ||--o{ LEARNING_PROGRESS : "tiene dominio en (1:N)"
    LEARNING_UNIT ||--o{ LEARNING_PROGRESS : "es medida por (1:N)"
    USER ||--o{ REVIEW_SCHEDULE : "tiene repaso programado (1:N)"
    LEARNING_UNIT ||--o{ REVIEW_SCHEDULE : "genera repaso en (1:N)"

    %% Prerequisitos
    LEARNING_UNIT ||--o{ PREREQUISITE : "es requerida por (targetUnitId)"
    LEARNING_UNIT ||--o{ PREREQUISITE : "requiere (requiredUnitId)"

    %% Tutor IA
    USER ||--o{ TUTOR_CONVERSATION : "conversa (1:N)"

    %% Logs y Gamificación
    USER ||--o{ ACTIVITY_LOG : "genera eventos (1:N)"
    USER ||--o{ ACHIEVEMENT : "desbloquea (1:N — pendiente refactor)"
```

---

## 2. Jerarquía Académica (La Columna Vertebral)

```
CLASS (Materia/Curso dictada por un Docente)
  └── SECTION (Corte o Módulo — ej: "Corte 1")
        └── TOPIC (Tema — ej: "Estructuras Condicionales")
              └── LEARNING_UNIT (Bloque atómico — ej: "if-else anidados")
                    ├── CONTENT (Teoría: texto, video, PDF, link)
                    └── ACTIVITY (Evaluación: Quiz, Taller, Parcial)
                          └── ACTIVITY_QUESTION (Pregunta: MCQ, Coding, DragDrop, FillCode)
```

Esta jerarquía es **estrictamente lineal y secuencial**. No existen atajos ni relaciones cruzadas entre niveles.

---

## 3. Diccionario de Datos Completo

### 3.1 Identidad y Usuarios

#### `users`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador único |
| `email` | VARCHAR | UNIQUE, NOT NULL | Credencial de acceso |
| `password` | VARCHAR | NOT NULL, `select: false` | Hash bcrypt — nunca se devuelve en queries |
| `fullName` | VARCHAR | NOT NULL | Nombre a mostrar en la UI |
| `role` | ENUM(`admin`, `docente`, `estudiante`) | DEFAULT: `estudiante` | Control de acceso RBAC |
| `isActive` | BOOLEAN | DEFAULT: `true` | Soft-disable sin borrar el registro |
| `createdAt` | TIMESTAMP | AUTO | Auditoría de creación |
| `updatedAt` | TIMESTAMP | AUTO | Auditoría de modificación |

#### `user_affiliations` _(Entidad Puente: User ↔ Program)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador único |
| `userId` | INT | FK → `users` ON DELETE CASCADE | El usuario afiliado |
| `programId` | INT | FK → `programs` | El programa académico |
| `roleType` | VARCHAR | NOT NULL | Rol en la institución (ej: "estudiante", "docente") |
| `currentSemester` | INT | NULLABLE | Semestre cursado actualmente |
| `isActive` | BOOLEAN | DEFAULT: `true` | Afiliación vigente o histórica |

#### `institutions`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador |
| `name` | VARCHAR | UNIQUE | Nombre de la institución educativa |

#### `programs`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador |
| `name` | VARCHAR | NOT NULL | Nombre del programa (ej: "Ingeniería de Sistemas") |
| `maxSemesters` | INT | NOT NULL | Duración máxima en semestres |
| `institutionId` | INT | FK → `institutions` | Universidad a la que pertenece |

---

### 3.2 Estructura Académica

#### `classes`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador |
| `name` | VARCHAR | NOT NULL | Nombre del curso (ej: "Lógica de Programación") |
| `description` | TEXT | NULLABLE | Descripción del curso |
| `code` | VARCHAR | UNIQUE, NOT NULL | Código de unión (joinCode). Docente lo comparte con estudiantes |
| `teacherId` | INT | FK → `users`, INDEX | El docente dueño del curso |
| `isActive` | BOOLEAN | DEFAULT: `true` | Si el curso está activo |
| `startDate` | DATE | NULLABLE | Inicio del semestre |
| `endDate` | DATE | NULLABLE | Fin del semestre |
| `maxStudents` | INT | NULLABLE | Capacidad máxima de inscripción |
| `createdAt` | TIMESTAMP | AUTO | Auditoría |
| `updatedAt` | TIMESTAMP | AUTO | Auditoría |

#### `enrollments` _(Entidad Puente Explícita: User ↔ Class)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | UUID | PK | Identificador único |
| `classId` | INT | FK → `classes` ON DELETE CASCADE | La clase |
| `studentId` | INT | FK → `users` ON DELETE CASCADE | El estudiante |
| `status` | ENUM(`active`, `dropped`, `completed`) | DEFAULT: `active` | Estado de la inscripción |
| `joinedAt` | TIMESTAMP | AUTO (CreateDateColumn) | Cuándo se unió |
| `leftAt` | TIMESTAMP | NULLABLE | Cuándo abandonó (si `dropped`) |
| `lastActivityAt` | TIMESTAMP | NULLABLE | Última interacción con la clase |
| **UNIQUE** | (`classId`, `studentId`) | — | Un estudiante no puede inscribirse dos veces en la misma clase |

#### `sections`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `title` | VARCHAR | NOT NULL | Nombre del corte (ej: "Corte 1 — Fundamentos") |
| `description` | TEXT | NULLABLE | Descripción del módulo |
| `order` | INT | DEFAULT: `0` | Posición dentro de la clase |
| `isActive` | BOOLEAN | DEFAULT: `true` | Visibilidad para estudiantes |
| `classId` | INT | FK → `classes` | Clase padre |

#### `topics`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `title` | VARCHAR | NOT NULL | Nombre del tema (ej: "Condicionales") |
| `description` | TEXT | NULLABLE | Breve introducción al tema |
| `order` | INT | DEFAULT: `0` | Posición dentro de la sección |
| `isActive` | BOOLEAN | DEFAULT: `true` | Visibilidad |
| `sectionId` | INT | FK → `sections` | Sección padre |

#### `learning_units` _(El bloque atómico)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `title` | VARCHAR | NOT NULL | Nombre (ej: "if-else anidados") |
| `description` | TEXT | NULLABLE | Objetivo de aprendizaje de la unidad |
| `difficulty` | ENUM(`BASICO`, `INTERMEDIO`, `AVANZADO`) | DEFAULT: `BASICO` | Nivel de dificultad declarativo |
| `order` | INT | DEFAULT: `0` | Posición dentro del Topic |
| `isActive` | BOOLEAN | DEFAULT: `true` | Visibilidad |
| `topicId` | INT | FK → `topics` | Topic padre |

---

### 3.3 Contenido y Actividades

#### `contents`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `title` | VARCHAR | NOT NULL | Nombre del material (ej: "Slides: Variables en Python") |
| `type` | ENUM(`text`, `video`, `link`, `pdf`) | NOT NULL | Formato del contenido |
| `data` | TEXT | NOT NULL | El contenido: Markdown, URL de video, ruta de PDF |
| `order` | INT | DEFAULT: `0` | Orden de lectura recomendado |
| `learningUnitId` | INT | FK → `learning_units` | Unidad a la que pertenece |

#### `activity_types`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador |
| `name` | VARCHAR | NOT NULL | Ej: "Práctica Formativa", "Parcial Evaluativo" |
| `description` | TEXT | NULLABLE | Descripción del tipo |
| `isEvaluative` | BOOLEAN | DEFAULT: `true` | Si afecta nota final o es solo formativo |
| `baseWeight` | FLOAT | DEFAULT: `1.0` | Multiplicador de peso en el cálculo de Mastery |

#### `activities`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `learningUnitId` | INT | FK → `learning_units`, INDEX | Unidad a la que pertenece |
| `activityTypeId` | INT | FK → `activity_types` | Tipo de evaluación |
| `createdBy` | INT | FK → `users` | Docente creador |
| `title` | VARCHAR(200) | NOT NULL | Nombre del examen/taller |
| `description` | TEXT | NULLABLE | Instrucciones para el estudiante |
| `difficulty` | ENUM(`BASICO`, `INTERMEDIO`, `AVANZADO`) | DEFAULT: `BASICO` | Nivel |
| `totalPoints` | INT | DEFAULT: `100` | Base de puntuación máxima |
| `passingScore` | INT | DEFAULT: `60` | Mínimo para aprobar |
| `attemptsAllowed` | INT | DEFAULT: `3` | Intentos máximos permitidos |
| `timeLimit` | INT | NULLABLE | Tiempo límite en minutos (null = sin límite) |
| `order` | INT | DEFAULT: `0` | Orden en la unidad |
| `status` | ENUM(`draft`, `review`, `published`, `archived`) | DEFAULT: `draft` | Ciclo de vida de publicación |
| `isRequired` | BOOLEAN | DEFAULT: `false` | Si es obligatoria para el progreso de la unidad |
| `adaptiveWeight` | FLOAT | DEFAULT: `1.0` | Peso en el cálculo de Mastery ponderado |
| `publishedAt` | TIMESTAMP | NULLABLE | Cuándo fue publicada |

#### `activity_questions`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `activityId` | INT | FK → `activities` ON DELETE CASCADE | Actividad contenedora |
| `type` | ENUM(`MCQ`, `CODING`, `DRAG_DROP`, `FILL_CODE`, `MATCHING`) | NOT NULL | Tipo de pregunta |
| `question` | TEXT | NOT NULL | Enunciado de la pregunta |
| `points` | INT | DEFAULT: `10` | Puntos que vale esta pregunta |
| `order` | INT | DEFAULT: `0` | Posición en el examen |
| `config` | JSON | NOT NULL | **Estructura variable por tipo** (ver sección 4) |

---

### 3.4 Submissions y Resolución _(Entidades Puente Críticas)_

#### `submissions`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | UUID | PK | Identificador — UUID para evitar IDs predecibles en URLs |
| `activityId` | INT | FK → `activities` (⚠️ falta CASCADE) | Actividad intentada |
| `studentId` | INT | FK → `users` (⚠️ falta CASCADE) | Estudiante que intentó |
| `score` | FLOAT | DEFAULT: `0` | Puntaje final calculado (0-100) |
| `feedback` | TEXT | NULLABLE | Retroalimentación del docente (manual) |
| `attemptNumber` | INT | DEFAULT: `1` | Número de intento (1, 2, 3...) |
| `status` | ENUM(`IN_PROGRESS`, `SUBMITTED`, `GRADED`) | DEFAULT: `IN_PROGRESS` | Estado del intento |
| `startedAt` | TIMESTAMP | NULLABLE | Cuándo el estudiante dio click en "Iniciar" |
| `submittedAt` | TIMESTAMP | NULLABLE | Cuándo envió definitivamente |
| `timeSpentSeconds` | INT | DEFAULT: `0` | Tiempo total invertido |
| `lastSavedAt` | TIMESTAMP | NULLABLE | Último autosave exitoso |
| `autosaveData` | JSON | NULLABLE | Respuestas parciales en caso de desconexión |
| `isAbandoned` | BOOLEAN | DEFAULT: `false` | Si el estudiante abandonó sin enviar |
| `deletedAt` | TIMESTAMP | NULLABLE | Soft Delete |
| INDEX | (`studentId`, `activityId`) | — | Búsqueda de intentos por estudiante |
| INDEX | (`studentId`, `status`) | — | Búsqueda de intentos activos |

#### `submission_answers` _(Entidad Puente: Submission ↔ ActivityQuestion)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT AUTO_INCREMENT | PK | Identificador |
| `submissionId` | UUID | FK → `submissions` ON DELETE CASCADE | Intento al que pertenece |
| `questionId` | INT | FK → `activity_questions` | Pregunta respondida |
| `answer` | JSON | NOT NULL | La respuesta del estudiante (estructura depende del tipo) |
| `isCorrect` | BOOLEAN | NULLABLE | `null` = pendiente de juez asíncrono; `true/false` = calificado |
| `score` | FLOAT | DEFAULT: `0` | Puntos otorgados a esta respuesta específica |
| `feedback` | TEXT | NULLABLE | Feedback generado por el evaluador o el docente |

#### `execution_results` _(Output del Judge Engine)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | UUID | PK | Identificador |
| `submissionAnswerId` | INT | FK → `submission_answers` ON DELETE CASCADE | Respuesta que originó la ejecución |
| `status` | VARCHAR(50) | NOT NULL | `accepted`, `wrong_answer`, `time_limit`, `memory_limit`, `compile_error` |
| `stdout` | TEXT | NULLABLE | Lo que imprimió el código del estudiante |
| `stderr` | TEXT | NULLABLE | Errores de compilación o runtime |
| `executionTimeMs` | INT | DEFAULT: `0` | Tiempo de ejecución en milisegundos |
| `memoryUsedKB` | INT | DEFAULT: `0` | RAM consumida en KB |
| `testCaseLabel` | VARCHAR(255) | NULLABLE | Etiqueta del caso de prueba (ej: "Test público 1") |
| `deletedAt` | TIMESTAMP | NULLABLE | Soft Delete |

---

### 3.5 Inteligencia Adaptativa

#### `learning_progress`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `studentId` | INT | FK → `users` (⚠️ falta CASCADE) | El estudiante |
| `learningUnitId` | INT | FK → `learning_units` (⚠️ falta CASCADE) | La unidad medida |
| `mastery` | FLOAT | DEFAULT: `0` | Nivel de dominio calculado (0-100). **Ver sección de Mastery** |
| `successRate` | FLOAT | DEFAULT: `0` | % de actividades aprobadas sobre intentadas |
| `attemptsCount` | INT | DEFAULT: `0` | Total de intentos realizados en esta unidad |
| `completedActivities` | INT | DEFAULT: `0` | Actividades con score ≥ passingScore |
| `lastActivityId` | INT | FK → `activities` NULLABLE | Última actividad evaluada |
| UNIQUE INDEX | (`studentId`, `learningUnitId`) | — | Un registro de progreso por estudiante por unidad |

#### `review_schedules` _(Sistema SM-2)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `studentId` | INT | FK → `users` (⚠️ falta CASCADE) | El estudiante |
| `learningUnitId` | INT | FK → `learning_units` (⚠️ falta CASCADE) | La unidad a repasar |
| `nextReviewDate` | TIMESTAMP | NOT NULL | Cuándo debe repasar (calculado por SM-2) |
| `urgencyLevel` | INT | DEFAULT: `0` | `0`=ninguna, `1`=baja, `2`=media, `3`=alta (vencida) |
| `intervalDays` | INT | DEFAULT: `1` | Días hasta el próximo repaso |
| `repetitions` | INT | DEFAULT: `0` | Número de repasos exitosos consecutivos |
| `lastReviewedAt` | TIMESTAMP | NULLABLE | Cuándo repasó por última vez |
| ⚠️ FALTANTE | `easeFactor` FLOAT | — | Coeficiente SM-2 (1.3–2.5). Pendiente de agregar. |
| UNIQUE INDEX | (`studentId`, `learningUnitId`) | — | Un schedule por estudiante por unidad |

#### `prerequisites`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `targetUnitId` | INT | FK → `learning_units` ON DELETE CASCADE | La unidad que se quiere desbloquear |
| `requiredUnitId` | INT | FK → `learning_units` ON DELETE CASCADE | La unidad que se debe dominar primero |
| `minMasteryRequired` | FLOAT | DEFAULT: `60` | Mastery mínimo requerido (0-100) para desbloquear |
| UNIQUE INDEX | (`targetUnitId`, `requiredUnitId`) | — | No duplicar la misma regla de prerequisito |

---

### 3.6 Tutor IA y Logs

#### `tutor_conversations`
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | INT (via StireBaseEntity) | PK | Identificador |
| `studentId` | INT | FK → `users` (⚠️ falta CASCADE) | El estudiante que habla |
| `role` | ENUM(`user`, `assistant`, `system`) | NOT NULL | Quién emitió el mensaje |
| `content` | TEXT | NOT NULL | El texto del mensaje |
| `metadata` | JSON | NULLABLE | Datos extra: `detectedTopic`, `emotion`, `masteryAtTime` |
| INDEX | (`studentId`) | — | Búsqueda rápida del historial de un estudiante |

#### `activity_logs` _(Append-Only — No tiene Soft Delete)_
| Campo | Tipo SQL | Restricciones | Propósito |
|-------|----------|---------------|-----------|
| `id` | UUID | PK | Identificador único |
| `studentId` | INT | ⚠️ SIN FK FORMAL (bug conocido) | El estudiante |
| `action` | ENUM(`content_read`, `activity_started`, `submission_graded`, `unit_completed`) | NOT NULL | Tipo de evento pedagógico |
| `referenceId` | VARCHAR(100) | NOT NULL | ID de la entidad referenciada (UUID o INT como string) |
| `referenceType` | VARCHAR(50) | NOT NULL | Tipo de entidad: `content`, `activity`, `submission` |
| `metadata` | JSON | NULLABLE | Datos contextuales: `learningUnitId`, `score`, `timeSpentSeconds` |
| `createdAt` | TIMESTAMP | AUTO | Timestamp del evento |
| INDEX | (`studentId`, `createdAt`) | — | Historial cronológico |
| INDEX | (`studentId`, `action`) | — | Filtro por tipo de acción |
| INDEX | (`referenceId`, `action`) | — | Búsqueda por recurso específico |

---

### 3.7 Gamificación _(Pendiente Refactor)_

#### `achievements` _(⚠️ Diseño actual roto — requiere división en 2 tablas)_
| Campo | Tipo SQL | Estado | Propósito |
|-------|----------|--------|-----------|
| `id` | INT (via StireBaseEntity) | Actual | Identificador |
| `name` | VARCHAR | Actual | Nombre del logro |
| `description` | TEXT | Actual | Descripción del mérito |
| `iconUrl` | VARCHAR | Actual | URL del asset gráfico |
| `points` | INT | Actual | Puntos XP otorgados |
| `unlockedById` | INT | ⚠️ MEZCLA CONCEPTOS | FK hacia users — confunde definición con asignación |

**Diseño correcto (pendiente implementación):**
- `achievement_definitions (id, name, description, iconUrl, points)` — Catálogo maestro
- `user_achievements (id, userId, achievementDefinitionId, unlockedAt)` — Registro de quién desbloqueó qué

---

## 4. Estructura del Campo `config` en `activity_questions`

El campo `config` es un JSON que varía según el `type` de la pregunta. Esta es la interfaz tipada real del código:

### MCQ (Multiple Choice Question)
```json
{
  "options": ["var", "let", "const", "def"],
  "correct": ["let", "const"]
}
```

### CODING (Evaluación de Código)
```json
{
  "language": "javascript",
  "starterCode": "function suma(a, b) { }",
  "testCases": [
    { "input": "2 3", "expected": "5", "isPublic": true },
    { "input": "10 20", "expected": "30", "isPublic": false }
  ]
}
```

### FILL_CODE (Completar espacios en código)
```json
{
  "template": "for (let i = __A__; i < __B__; i++) { }",
  "blanks": [
    { "id": "__A__", "answer": "0", "regexMode": false },
    { "id": "__B__", "answer": "\\d+", "regexMode": true }
  ]
}
```

### DRAG_DROP (Ordenar elementos)
```json
{
  "items": ["Declare variable", "Initialize loop", "Check condition", "Print result"],
  "correctOrder": [0, 1, 2, 3]
}
```

---

## 5. Política de Primary Keys

| Tipo PK | Cuándo usarlo | Ejemplo |
|---------|--------------|---------|
| `INT AUTO_INCREMENT` | Entidades de catálogo, jerarquía académica, entidades que no se exponen en URLs públicas | `users`, `classes`, `activities`, `learning_units` |
| `UUID` | Entidades con alta concurrencia, expuestas en URLs públicas, o datos sensibles cuya ID no debe ser predecible | `submissions`, `enrollments`, `activity_logs`, `execution_results` |

> **Regla:** No mezclar tipos de PK sin documentarlo. Una FK desde una tabla UUID hacia una tabla INT (o viceversa) debe estar explícitamente justificada y comentada en el código.
