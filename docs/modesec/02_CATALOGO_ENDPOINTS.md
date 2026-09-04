---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
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

---

## 6. Módulo de Progreso, Repasos y Analítica (`/learning-progress`, `/analytics`, `/tutor`)

| Método | Endpoint | Roles Permitidos | Throttle | Parámetros / Body | Respuesta | Ventana MODESEC | Estado |
|---|---|---|---|---|---|---|---|
| `GET` | `/learning-progress/student/:studentId` | `estudiante` (propio), `docente` (su clase), `admin` | 100/min | `studentId: number` | `LearningProgress[]` | `EST-V06`, `DOC-V05` | ✅ Activo |
| `GET` | `/analytics/student/:studentId` | `estudiante` (propio), `docente` (su clase), `admin` | 100/min | `studentId: number` | Dashboard consolidado con métricas, racha y envíos | `EST-V01`, `EST-V06` | ✅ Activo |
| `GET` | `/analytics/class/:classId` | `docente` (propietario), `admin` | 100/min | `classId: number` | Métricas de cohorte, promedios y ranking | `DOC-V04` | ✅ Activo |
| `POST` | `/tutor/chat` | `estudiante` | **20/min** | `ChatDto` `{ message: string }` | `{ success: true, message: string }` | `EST-V04` | ✅ Activo |

---

## 7. Endpoints Necesarios para MODESEC pendientes de Implementar `[BACKEND PENDIENTE]`

| Endpoint Deseado | Rol | Justificación MODESEC | Estado Actual | Solución Transitoria Frontend |
|---|---|---|---|---|
| `GET /review-schedules/today` | `estudiante` | Obtener directamente la lista de repasos vencidos del día (`EST-V05`). | `[BACKEND PENDIENTE]` | Filtrar el array de `GET /analytics/student/:id` en cliente. |
| `POST /users/bulk-import` | `admin` | Carga masiva de estudiantes por archivo CSV en `ADM-V02`. | `[FUTURO]` | Registro individual en MVP. |
| `GET /maintenance/health` | `admin` | Tacómetro visual de salud del sandbox y base de datos (`ADM-V01`, `ADM-V03`). | `[BACKEND PENDIENTE]` | Consultar endpoints de prueba con ping local. |
