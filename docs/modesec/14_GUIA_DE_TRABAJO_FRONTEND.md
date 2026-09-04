---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     derivado de las fichas de ventanas y NAMING_STIRE.md
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 🚀 Insumo 14 — Guía Maestra de Implementación Frontend (Vue 3 + Nuxt 3)

> **Proyecto:** STIRE-Soft Frontend  
> **Destinatarios:** Equipo de Desarrollo (José López, Pedro Romero, Julio Galvis, Jeider Gómez, Jorge Cervantes)  
> **Stack Oficial:** Nuxt 3 (SSR/SSG Híbrido) + Vue 3 (Composition API `<script setup>`) + TypeScript + Pinia + Vanilla / Tailwind CSS  
> **Nomenclatura Oficial:** Sincronizada con [NAMING_STIRE.md](./NAMING_STIRE.md) y [MARCO_UX_PEDAGOGICO_STIRE.md](./MARCO_UX_PEDAGOGICO_STIRE.md)  
> **Fecha de Actualización:** 2 de septiembre de 2026 | **Versión:** 2.0 Multi-Rol

---

## 1. Asignación de Vistas y Especificación de Trabajo por Rol

---

### 🔑 VISTA COMÚN

#### `COMP-V00` · Acceso y Autenticación *(Nombre visible: Iniciar Sesión / Registro)*
* **Responsable:** José López (UI) & Jeider Gómez (Auth Flow)
* **Ruta Nuxt:** `/auth/login` y `/auth/register`
* **Layout:** `layouts/auth.vue`
* **Componentes:** `AuthCard.vue`, `LoginForm.vue`, `RegisterForm.vue`, `ErrorAlert.vue`.
* **Endpoints Backend:** `POST /auth/login`, `POST /auth/register`.
* **Datos y Estado:** Guardar JWT en cookie de sesión y poblar `useAuthStore()`. Redirección automática según `user.role`.

---

### 🎓 VISTAS DEL ESTUDIANTE

#### `EST-V01` · Dashboard del Estudiante *(Nombre visible: Inicio)*
* **Responsable:** José López (Diseño) & Julio Galvis (Pedagogía)
* **Ruta Nuxt:** `/estudiante/dashboard`
* **Layout:** `layouts/student.vue`
* **Componentes:** `StudentHeader.vue`, `MasteryCard.vue`, `SpacedRepetitionBadge.vue`, `EnrolledClassList.vue`, `JoinClassModal.vue`.
* **Endpoints:** `GET /enrollment/my`, `GET /analytics/student/:id`, `POST /enrollment/join`.

#### `EST-V02` · Unidad de Aprendizaje *(Nombre visible: Lección: [Título de Unidad])*
* **Responsable:** Julio Galvis (Diseño Instruccional)
* **Ruta Nuxt:** `/estudiante/unidad/:id`
* **Layout:** `layouts/student.vue`
* **Componentes:** `MarkdownViewer.vue`, `CodeHighlighter.vue`, `ConceptualDiagramViewer.vue`, `StartExerciseButton.vue`.
* **Endpoints:** `GET /learning-unit/:id`, `GET /content/unit/:id`.

#### `EST-V03` · Entorno de Programación en Sandbox *(Nombre visible: Ejercicio: [Nombre] / Práctica)*
* **Responsable:** Jeider Gómez (Sandbox & Editor) & José López (UI)
* **Ruta Nuxt:** `/estudiante/evaluacion/:activityId`
* **Layout:** `layouts/workspace.vue` (Pantalla completa sin distracciones)
* **Componentes:** `CodeEditorMonaco.vue`, `ProblemStatement.vue`, `TestCasesPanel.vue`, `ConsoleOutput.vue`, `AutosaveIndicator.vue`.
* **Endpoints:** `POST /submissions/start`, `PUT /submissions/:id/autosave`, `POST /submissions/:id/submit`.

#### `EST-V04` · Tutor Socrático Adaptativo *(Nombre visible: Tutor IA)*
* **Responsable:** Jeider Gómez (LLM Integration) & Pedro Romero (Doc)
* **Ruta Nuxt:** Drawer lateral flotante global o `/estudiante/tutor`
* **Componentes:** `TutorChatDrawer.vue`, `ChatMessageItem.vue`, `PromptInput.vue`, `ThinkingIndicator.vue`.
* **Endpoints:** `POST /tutor/chat`.

#### `EST-V05` · Módulo de Repetición Espaciada SM-2 *(Nombre visible: Repasos)*
* **Responsable:** Julio Galvis (Pedagogía) & José López (UI)
* **Ruta Nuxt:** `/estudiante/repasos`
* **Componentes:** `SpacedRepetitionCard.vue`, `UrgencyTag.vue`, `EmptyState.vue`, `MemoryHealthChart.vue`.
* **Endpoints:** `GET /analytics/student/:id`.

#### `EST-V06` · Analítica y Bitácora de Aprendizaje *(Nombre visible: Mi Progreso)*
* **Responsable:** Pedro Romero (Documentación) & José López (UI)
* **Ruta Nuxt:** `/estudiante/progreso`
* **Componentes:** `MasteryBarChart.vue`, `StreakCounter.vue`, `SubmissionsHistoryTable.vue`, `CognitiveStateBadge.vue`.
* **Endpoints:** `GET /learning-progress/student/:id`, `GET /analytics/student/:id`.

---

### 👨‍🏫 VISTAS DEL DOCENTE

#### `DOC-V01` · Panel de Gestión de Clases *(Nombre visible: Mis Clases)*
* **Responsable:** José López (UI) & Jorge Cervantes (QA)
* **Ruta Nuxt:** `/docente/dashboard` o `/docente/clases`
* **Componentes:** `ClassCardGrid.vue`, `CreateClassModal.vue`, `CopyAccessCodeButton.vue`.
* **Endpoints:** `GET /class/my-classes`, `POST /class`, `PATCH /class/:id`.

#### `DOC-V02` · Gestor Curricular de Unidades *(Nombre visible: Contenidos y Temas)*
* **Responsable:** Julio Galvis (Diseño Instruccional)
* **Ruta Nuxt:** `/docente/contenidos`
* **Componentes:** `TopicTreeAccordion.vue`, `LearningUnitRow.vue`, `PublishToggle.vue`, `UnitEditModal.vue`.
* **Endpoints:** `GET /topic/section/:sectionId`, `POST /topic`, `POST /learning-unit`, `PATCH /learning-unit/:id`.

#### `DOC-V03` · Diseñador de Ejercicios y Casos de Prueba *(Nombre visible: Crear Ejercicio)*
* **Responsable:** Jeider Gómez (Backend) & José López (UI)
* **Ruta Nuxt:** `/docente/ejercicios/crear`
* **Componentes:** `ExerciseForm.vue`, `TestCasesEditorTable.vue`, `SandboxTestButton.vue`.
* **Endpoints:** `POST /activities`, `POST /activity-questions`.

#### `DOC-V04` · Analítica de Cohorte y Alertas *(Nombre visible: Rendimiento del Grupo)*
* **Responsable:** Pedro Romero & Jorge Cervantes (QA)
* **Ruta Nuxt:** `/docente/clase/:id/analitica`
* **Componentes:** `CohortMetricsCard.vue`, `StudentRankingsTable.vue`, `RiskAlertBadge.vue`.
* **Endpoints:** `GET /analytics/class/:id`, `GET /enrollment/class/:id`.

#### `DOC-V05` · Seguimiento Individual de Estudiante *(Nombre visible: Detalle de Estudiante)*
* **Responsable:** Julio Galvis & Pedro Romero
* **Ruta Nuxt:** `/docente/estudiante/:id`
* **Componentes:** `StudentDetailCard.vue`, `SubmissionCodeInspector.vue`, `MasteryBarChart.vue`.
* **Endpoints:** `GET /learning-progress/student/:id`, `GET /analytics/student/:id`.

---

### 🛡️ VISTAS DEL ADMINISTRADOR

#### `ADM-V01` · Panel de Control y Salud *(Nombre visible: Estado del Sistema)* — ⚠️ REQUERIDO — PENDIENTE DE BACKEND (D-03)
* **Responsable:** Jeider Gómez & Jorge Cervantes
* **Ruta Nuxt:** `/admin/dashboard`
* **Componentes:** `KpiGrid.vue`, `ServiceHealthCard.vue`, `RecentActivitySummary.vue`.
* **Endpoints:** ⚠️ PROPUESTO — NO IMPLEMENTADO. Solo existe `POST /maintenance/cleanup`.

#### `ADM-V02` · Directorio y Gestión de Usuarios *(Nombre visible: Usuarios y Roles)*
* **Responsable:** Pedro Romero & Jeider Gómez
* **Ruta Nuxt:** `/admin/usuarios`
* **Componentes:** `UsersTable.vue`, `ChangeRoleModal.vue`, `UserStatusToggle.vue`.
* **Endpoints:** `GET /users`, `PATCH /users/:id`.

#### `ADM-V03` · Auditoría Técnica y Parámetros *(Nombre visible: Logs y Mantenimiento)* — ⚠️ REQUERIDO — PENDIENTE DE BACKEND (D-03)
* **Responsable:** Jorge Cervantes (QA) & Jeider Gómez
* **Ruta Nuxt:** `/admin/sistema`
* **Componentes:** `SystemLogsViewer.vue`, `SandboxConfigCard.vue`.
* **Endpoints:** ⚠️ PROPUESTO — NO IMPLEMENTADO. Solo existe `POST /maintenance/cleanup`.
