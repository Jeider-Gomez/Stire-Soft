---
estado:     vigente
verificado: 2026-09-09 contra commit HEAD (FASE CC-09) — añade POST /submissions/:id/run y GET /review-schedules/due
fuente:     normativo
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 📡 Insumo 02 — Catálogo Maestro de Endpoints API

**Proyecto:** STIRE-Soft Backend  
**Base URL:** `http://localhost:3001` (o proxy `/api`)  
**Seguridad Global:** `JwtAuthGuard` + `RolesGuard` + `ThrottlerGuard` aplicados por defecto a todas las rutas salvo `@Public()`.  
**Fecha:** 30 de agosto de 2026  

---

## 1. Módulo de Autenticación (`/auth`)

| Método | Endpoint | Roles Permitidos | Throttle | Request Body / Params | Respuesta / Código | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `POST` | `/auth/register` | `@Public()` | 100/min | `RegisterDto` `{ email, password, fullName }` | `201 Created` `{ user, token }` | `COMP-V00` | ✅ Activo |
| `POST` | `/auth/login` | `@Public()` | **5/min** | `LoginDto` `{ email, password }` | `200 OK` `{ user, token }` | `COMP-V00` | ✅ Activo |
| `GET` | `/auth/profile` | `estudiante`, `docente`, `admin` | 100/min | Header Bearer Token | `200 OK` `{ user }` | `Header (Todas)` | ✅ Activo |

---

## 2. Módulo de Clases (`/class`)

| Método | Endpoint | Roles Permitidos | Throttle | Request Body / Params | Respuesta / Código | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `POST` | `/class` | `docente` | 100/min | `CreateClassDto` `{ name, description, code, maxStudents, startDate, endDate }` | `201 Created` `Class` | `DOC-V01` | ✅ Activo |
| `GET` | `/class` | `estudiante`, `docente`, `admin` | 100/min | Ninguno | `200 OK` `Class[]` | `EST-V01`, `DOC-V01` | ✅ Activo |
| `GET` | `/class/my-classes` | `docente`, `estudiante` | 100/min | Ninguno (Docente: sus clases creadas; Estudiante: catálogo) | `200 OK` `Class[]` | `DOC-V01` | ✅ Activo |
| `GET` | `/class/:id` | `estudiante`, `docente`, `admin` | 100/min | `id: number` | `200 OK` `Class` | `EST-V01`, `DOC-V01` | ✅ Activo |
| `PATCH`| `/class/:id` | `docente` | 100/min | `id: number`, `UpdateClassDto` | `200 OK` `Class` | `DOC-V01` | ✅ Activo |
| `DELETE`| `/class/:id`| `docente`, `admin` | 100/min | `id: number` | `200 OK` `void` | `DOC-V01` | ✅ Activo |

---

## 3. Módulo de Matrícula (`/enrollment`)

| Método | Endpoint | Roles Permitidos | Throttle | Request Body / Params | Respuesta / Código | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `POST` | `/enrollment/join` | `estudiante` | 100/min | `{ code: string }` | `201 Created` `Enrollment` | `EST-V01` | ✅ Activo |
| `GET` | `/enrollment/my` | `estudiante` | 100/min | Ninguno (usa token de estudiante) | `200 OK` `Enrollment[]` con clase y docente | `EST-V01` | ✅ Activo |
| `GET` | `/enrollment/class/:classId` | `docente`, `admin` | 100/min | `classId: number` | `200 OK` `Enrollment[]` con datos de estudiantes | `DOC-V01`, `DOC-V04` | ✅ Activo |

---

## 4. Módulo de Temas y Unidades (`/topic`, `/learning-unit`, `/content`)

| Método | Endpoint | Roles Permitidos | Throttle | Parámetros / Body | Respuesta | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `GET` | `/topic/section/:sectionId` | `estudiante`, `docente`, `admin` | 100/min | `sectionId: number` | `Topic[]` con unidades | `EST-V01`, `DOC-V02` | ✅ Activo |
| `POST` | `/topic` | `docente`, `admin` | 100/min | `CreateTopicDto` | `Topic` | `DOC-V02` | ✅ Activo |
| `GET` | `/learning-unit/:id` | `estudiante`, `docente`, `admin` | 100/min | `id: number` | `LearningUnit` con contenidos | `EST-V02` | ✅ Activo |
| `POST` | `/learning-unit` | `docente`, `admin` | 100/min | `CreateLearningUnitDto` | `LearningUnit` | `DOC-V02` | ✅ Activo |
| `GET` | `/content/unit/:unitId` | `estudiante`, `docente`, `admin` | 100/min | `unitId: number` | `Content[]` bloques ordenados | `EST-V02` | ✅ Activo |

---

## 5. Módulo de Evaluaciones y Entregas (`/activities`, `/submissions`)

| Método | Endpoint | Roles Permitidos | Throttle | Parámetros / Body | Respuesta | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `GET` | `/activities/unit/:unitId` | `estudiante`, `docente`, `admin` | 100/min | `unitId: number` | `Activity[]` | `EST-V02`, `EST-V03` | ✅ Activo |
| `POST` | `/submissions/start` | `estudiante` | 100/min | `StartSubmissionDto` `{ activityId }` | `Submission` (`in_progress`) | `EST-V03` | ✅ Activo |
| `PUT` | `/submissions/:id/autosave` | `estudiante` | 100/min | `SubmitAnswersDto` (respuestas en borrador) | `Submission` | `EST-V03` | ✅ Activo |
| `POST` | `/submissions/:id/submit` | `estudiante` | **10/min** | `SubmitAnswersDto` `{ answers: [...] }` | `{ submissionId, totalScore, status }` | `EST-V03` | ✅ Activo |
| `POST` | `/submissions/:id/run` | `estudiante` (dueño de la submission) | 100/min | `RunCodeDto` `{ code: string }` | `{ submissionId, results: [{label, passed, actualOutput, expectedOutput}], allPassed }` — solo casos `isPublic:true`, ninguno oculto se ejecuta ni se serializa | `EST-V03` | ✅ Activo (FASE CC-09, 2026-09-09) |

**`POST /submissions/:id/run` — contrato exacto (FASE CC-09 Bloqueo 1):** ejecuta el `code` del body SOLO
contra los casos de la pregunta CODING de la actividad con `isPublic:true`, reutilizando el mismo
sandbox endurecido de `JudgeExecutionService` (`runPublicCases()`). NO crea intento, NO modifica
`attemptsCount`/`attemptNumber`, NO cambia el `status` de la submission, NO emite `submission.graded`,
NO toca `mastery` — verificado en vivo: 3 llamadas consecutivas dejan `attemptNumber` sin cambios.
`404` si la submission no existe o no pertenece al estudiante autenticado (ownership por
`where: {id, studentId}`, verificado en vivo: `estudiante2` sobre la submission de `estudiante1` → 404).
`400` si la actividad no tiene pregunta CODING.

---

## 6. Módulo de Progreso, Repasos y Analítica (`/learning-progress`, `/analytics`, `/tutor`)

| Método | Endpoint | Roles Permitidos | Throttle | Parámetros / Body | Respuesta | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `GET` | `/learning-progress/student/:studentId` | `estudiante` (propio), `docente` (su clase), `admin` | 100/min | `studentId: number` | `LearningProgress[]` | `EST-V06`, `DOC-V05` | ✅ Activo |
| `GET` | `/analytics/student/:studentId` | `estudiante` (propio), `docente` (su clase), `admin` | 100/min | `studentId: number` | Dashboard consolidado con métricas, racha y envíos | `EST-V01`, `EST-V06` | ✅ Activo |
| `GET` | `/analytics/class/:classId` | `docente` (propietario), `admin` | 100/min | `classId: number` | Métricas de cohorte, promedios y ranking | `DOC-V04` | ✅ Activo |
| `POST` | `/tutor/chat` | `estudiante` | **20/min** | `ChatDto` `{ message: string }` | `{ success: true, message: string }` | `EST-V04` | ✅ Activo |
| `GET` | `/review-schedules/due` | `estudiante` (propio) | 100/min | Ninguno (usa token) | `200 OK` `Array<{id, learningUnitId, learningUnitTitle, nextReviewDate, urgency, intervalDays, easeFactor, repetitions}>` | `EST-V05` | ✅ Activo (FASE CC-09, 2026-09-09) |

**`GET /review-schedules/due` — contrato exacto (FASE CC-09 Bloqueo 2):** repasos del estudiante
autenticado (nunca de otro — verificado en vivo, no acepta `studentId` como parámetro, sale del JWT),
ordenados del más próximo/vencido al más lejano. `urgency` se calcula en vivo a partir de
`nextReviewDate` (no del `urgencyLevel` persistido, que el cron diario solo refresca una vez al día):
`vencido` = hoy, `manana` = mañana, `al-dia` = 2+ días, `critico` = ya pasó. `easeFactor` ahora se
persiste (antes `calculateNextReview()` lo calculaba y se descartaba — ver
`src/migrations/1788999128282-AddEaseFactorToReviewSchedules.ts`).

---

## 7. Endpoints Necesarios para MODESEC pendientes de Implementar `[BACKEND PENDIENTE]`

| Endpoint Deseado | Rol | Justificación MODESEC | Estado Actual | Solución Transitoria Frontend |
|---|---|---|---|---|
| ~~`GET /review-schedules/today`~~ | `estudiante` | ~~Obtener directamente la lista de repasos vencidos del día (`EST-V05`).~~ | ✅ Implementado como `GET /review-schedules/due` (ver §6, FASE CC-09) | — |
| `POST /users/bulk-import` | `admin` | Carga masiva de estudiantes por archivo CSV en `ADM-V02`. | `[FUTURO]` | Registro individual en MVP. |
| `GET /maintenance/health` | `admin` | Tacómetro visual de salud del sandbox y base de datos (`ADM-V01`, `ADM-V03`). | `[BACKEND PENDIENTE]` | Consultar endpoints de prueba con ping local. |
