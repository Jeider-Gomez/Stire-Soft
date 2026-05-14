# Modelo Entidad-Relación y Diccionario de Datos de STIRE

Este documento detalla exhaustivamente el modelo Entidad-Relación y todas las tablas del sistema STIRE con sus campos, tipos de datos, llaves foráneas y descripciones funcionales.

## 1. Modelo Entidad-Relación (ERD)

```mermaid
erDiagram
    %% Core Entities
    USER ||--o{ ACADEMIC_PROFILE : has
    USER ||--o{ ENROLLMENT : enrolls_in
    USER ||--o{ CLASS : teaches
    CLASS ||--o{ ENROLLMENT : contains_student
    
    CLASS ||--o{ SECTION : structured_in
    SECTION ||--o{ TOPIC : contains
    TOPIC ||--o{ LEARNING_UNIT : divides_into
    
    LEARNING_UNIT ||--o{ CONTENT : has_theory
    LEARNING_UNIT ||--o{ ACTIVITY : has_practice
    
    ACTIVITY }|--|| ACTIVITY_TYPE : is_of_type
    ACTIVITY ||--o{ ACTIVITY_QUESTION : contains
    
    %% Repositorio de preguntas (Bancos)
    USER ||--o{ QUESTION_BANK : creates
    QUESTION_BANK ||--o{ BANK_QUESTION : contains
    
    %% Evaluaciones y Submissions
    USER ||--o{ SUBMISSION : attempts
    ACTIVITY ||--o{ SUBMISSION : receives
    SUBMISSION ||--o{ SUBMISSION_ANSWER : answers
    ACTIVITY_QUESTION ||--o{ SUBMISSION_ANSWER : validates
    
    %% Code Execution
    SUBMISSION_ANSWER ||--o| EXECUTION_RESULT : outputs
    
    %% Inteligencia y Progreso
    USER ||--o{ LEARNING_PROGRESS : tracks
    LEARNING_UNIT ||--o{ LEARNING_PROGRESS : measured_by
    USER ||--o{ REVIEW_SCHEDULE : schedules
    LEARNING_UNIT ||--o{ REVIEW_SCHEDULE : scheduled_for
    USER ||--o{ TUTOR_CONVERSATION : chats
    LEARNING_UNIT ||--o{ TUTOR_CONVERSATION : contextualizes
    LEARNING_UNIT ||--o{ PREREQUISITE : requires
    
    %% Gamificación
    USER ||--o{ ACHIEVEMENT : unlocks
```

---

## 2. Diccionario de Datos Exhaustivo

### 2.1 Usuarios e Identidad

#### `users` (Usuarios del sistema)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `email` | VARCHAR | Correo para inicio de sesión | Unique, No Null |
| `password` | VARCHAR | Hash bcrypt de la contraseña | No Null |
| `fullName` | VARCHAR | Nombre completo a mostrar | No Null |
| `role` | ENUM | Rol del usuario (`estudiante`, `docente`, `admin`) | Default: estudiante |
| `createdAt` | TIMESTAMP | Fecha de creación del registro | Automático |
| `updatedAt` | TIMESTAMP | Fecha de última modificación | Automático |

#### `academic_profiles` (Datos adicionales del estudiante)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `userId` | INT | FK hacia `users` (Relación 1:1) | Unique, No Null |
| `studentId` | VARCHAR | Código interno de estudiante de la universidad | Nullable |
| `career` | VARCHAR | Programa académico | Nullable |
| `semester` | INT | Semestre actual | Nullable |

---

### 2.2 Estructura Académica

#### `classes` (Cursos/Materias)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `name` | VARCHAR | Nombre de la clase (Ej: Lógica de Programación) | No Null |
| `description`| TEXT | Detalles del curso | Nullable |
| `joinCode` | VARCHAR | Código único para que los estudiantes se unan | Unique, No Null |
| `teacherId` | INT | FK hacia `users` (Docente dueño de la clase) | No Null |

#### `enrollments` (Inscripciones - Entidad Puente Explícita)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `studentId` | INT | FK hacia `users` (El estudiante) | No Null |
| `classId` | INT | FK hacia `classes` (El curso) | No Null |
| `status` | ENUM | Estado (`active`, `dropped`, `completed`) | Default: active |
| `joinedAt` | TIMESTAMP | Cuándo se inscribió usando el código | Automático |
| `lastActivityAt`| TIMESTAMP | Última vez que interactuó con la clase | Nullable |

#### `sections` (Módulos / Cortes de la clase)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `title` | VARCHAR | Nombre del corte | No Null |
| `description`| TEXT | Detalles | Nullable |
| `order` | INT | Orden de aparición | Default: 0 |
| `isActive` | BOOLEAN | Si está visible para estudiantes | Default: true |
| `classId` | INT | FK hacia `classes` | No Null |

#### `topics` (Temas de una sección)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `title` | VARCHAR | Nombre del tema (Ej: Condicionales) | No Null |
| `description`| TEXT | Breve introducción | Nullable |
| `order` | INT | Orden dentro de la sección | Default: 0 |
| `isActive` | BOOLEAN | Visible o no | Default: true |
| `sectionId` | INT | FK hacia `sections` | No Null |

#### `learning_units` (Bloque Atómico de Aprendizaje)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `title` | VARCHAR | Nombre (Ej: if-else anidados) | No Null |
| `description`| TEXT | Objetivo de aprendizaje | Nullable |
| `difficulty` | ENUM | Dificultad (`BASICO`, `INTERMEDIO`, `AVANZADO`) | Default: BASICO |
| `order` | INT | Orden dentro del Topic | Default: 0 |
| `isActive` | BOOLEAN | Visible o no | Default: true |
| `topicId` | INT | FK hacia `topics` | No Null |

---

### 2.3 Contenido y Actividades (Evaluaciones)

#### `contents` (Material Teórico)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `title` | VARCHAR | Nombre del material | No Null |
| `type` | ENUM | Tipo (`text`, `video`, `link`, `pdf`) | No Null |
| `data` | TEXT | El contenido markdown, la URL o ruta | No Null |
| `order` | INT | Orden de lectura | Default: 0 |
| `learningUnitId`| INT | FK hacia `learning_units` | No Null |

#### `activity_types` (Categorías de Actividades)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `name` | VARCHAR | Ej: Práctica de Código, Taller, Parcial | No Null |
| `description`| TEXT | Explicación del tipo | Nullable |
| `isEvaluative`| BOOLEAN | Si afecta nota final o es solo formativo | Default: true |

#### `activities` (El Contenedor del Taller/Examen)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `title` | VARCHAR | Nombre del examen/taller | No Null |
| `description`| TEXT | Instrucciones de la actividad | Nullable |
| `order` | INT | Orden en la unidad | Default: 0 |
| `passingScore`| FLOAT | Puntuación mínima para aprobar (sobre 100) | Default: 60 |
| `maxAttempts` | INT | Intentos máximos permitidos (0 = infinitos) | Default: 0 |
| `status` | ENUM | Estado de publicación (`draft`, `published`) | Default: draft |
| `typeId` | INT | FK hacia `activity_types` | Nullable |
| `learningUnitId`| INT | FK hacia `learning_units` | No Null |

#### `activity_questions` (Las preguntas dentro de la Actividad)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `type` | ENUM | Tipo (`MCQ`, `CODING`, `DRAG_DROP`, `MATCHING`) | No Null |
| `question` | TEXT | Enunciado principal de la pregunta | No Null |
| `points` | INT | Cuánto vale esta pregunta sobre el 100% | Default: 10 |
| `order` | INT | Posición en el examen | Default: 0 |
| `config` | JSON | La estructura variable (respuestas correctas, testcases) | No Null |
| `activityId` | INT | FK hacia `activities` | No Null |

#### `question_banks` / `bank_questions` (Repositorio reutilizable de profesores)
Poseen la misma estructura interna que `Activity` y `ActivityQuestion`, pero atadas a un `authorId` en lugar de a un `learningUnitId`, permitiendo reutilizar la pregunta en múltiples evaluaciones importándolas.

---

### 2.4 Resolución (Submissions) y Motor de Juez

#### `submissions` (Intentos del Estudiante)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | UUID | PK Generada | Unique |
| `studentId` | INT | FK hacia `users` | No Null |
| `activityId` | INT | FK hacia `activities` | No Null |
| `score` | FLOAT | Nota obtenida (0-100) calculada por sistema | Default: 0 |
| `attemptNumber`| INT | Número de intento | Default: 1 |
| `status` | ENUM | Estado (`IN_PROGRESS`, `SUBMITTED`, `GRADED`) | Default: IN_PROGRESS |
| `startedAt` | TIMESTAMP | Cuándo dio click a "Iniciar" | Nullable |
| `submittedAt` | TIMESTAMP | Cuándo envió las respuestas finales | Nullable |
| `timeSpentSeconds`| INT| Tiempo total en el intento | Default: 0 |
| `autosaveData`| JSON | Datos parciales en caso de desconexión | Nullable |

#### `submission_answers` (Las respuestas del estudiante)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `submissionId`| UUID | FK hacia `submissions` | No Null |
| `questionId` | INT | FK hacia `activity_questions` | No Null |
| `answer` | JSON | La respuesta seleccionada o código escrito | No Null |
| `isCorrect` | BOOLEAN | Calculado por el EvaluationEngine | Nullable |
| `score` | FLOAT | Puntos otorgados a esta pregunta | Default: 0 |
| `teacherFeedback`|TEXT| Retroalimentación manual opcional | Nullable |

#### `execution_results` (Output del código - Sandbox)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | UUID | PK | Unique |
| `submissionAnswerId`| INT | FK hacia `submission_answers` | No Null |
| `status` | VARCHAR | Ej: `accepted`, `wrong_answer`, `time_limit` | No Null |
| `stdout` | TEXT | Lo que imprimió el código del estudiante | Nullable |
| `stderr` | TEXT | Los errores de compilación o ejecución | Nullable |
| `executionTimeMs`| INT | Tiempo que tardó el Docker en procesar | Default: 0 |
| `memoryUsedKB`| INT | Ram gastada | Default: 0 |
| `testCaseLabel`|VARCHAR| Etiqueta del test ejecutado (si aplica) | Nullable |

---

### 2.5 Inteligencia: Mastery y Repaso Espaciado

#### `learning_progress` (Dominio del Estudiante)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `studentId` | INT | FK hacia `users` | No Null |
| `learningUnitId`| INT | FK hacia `learning_units` | No Null |
| `mastery` | FLOAT | Nivel de dominio actual (0-100) | Default: 0 |
| `consecutiveCorrect`| INT| Racha de preguntas correctas en esta unidad | Default: 0 |
| `totalAttempts`| INT | Cuántas veces ha intentado actividades de aquí | Default: 0 |
| `lastAttemptAt`| TIMESTAMP | Fecha de la última actividad evaluada | Nullable |

#### `review_schedules` (Sistema SM-2 de Repaso)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `studentId` | INT | FK hacia `users` | No Null |
| `learningUnitId`| INT | FK hacia `learning_units` | No Null |
| `nextReviewDate`| TIMESTAMP | Cuándo debe el estudiante volver a repasar | No Null |
| `interval` | INT | Días hasta el próximo repaso | Default: 1 |
| `easeFactor` | FLOAT | Factor de facilidad SM-2 (2.5 inicial) | Default: 2.5 |
| `repetitions` | INT | Veces repasadas con éxito consecutivo | Default: 0 |

---

### 2.6 Bloqueos y Dependencias

#### `prerequisites` (Bloqueo secuencial lógico)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `targetUnitId`| INT | FK: Unidad a la que se quiere entrar | No Null |
| `requiredUnitId`| INT | FK: Unidad que se debe completar primero | No Null |
| `minMasteryRequired`| FLOAT | Mastery mínimo para desbloquear targetUnit | Default: 60 |

---

### 2.7 Tutor e Interacciones

#### `tutor_conversations`
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `studentId` | INT | FK hacia `users` | No Null |
| `learningUnitId`| INT | FK hacia `learning_units` (Contexto de la charla)| Nullable |
| `messages` | JSON | Array de historial `[{role: 'user', text: '...'}]`| Default: [] |
| `startedAt` | TIMESTAMP | Inicio de la conversación | Automático |
| `endedAt` | TIMESTAMP | Fin (si aplica) | Nullable |

#### `achievements` (Gamificación)
| Campo | Tipo SQL | Propósito | Reglas |
|-------|----------|-----------|--------|
| `id` | INT | PK Autoincremental | Unique |
| `name` | VARCHAR | Nombre de la insignia | No Null |
| `description`| TEXT | Razón ("Lograste 100% al primer intento") | Nullable |
| `iconUrl` | VARCHAR | URL del asset gráfico | No Null |
| `points` | INT | Puntos de experiencia otorgados | Default: 10 |
| `unlockedById`| INT | FK hacia `users` | Nullable |
