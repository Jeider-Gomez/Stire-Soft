---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    no aplica (seguridad, no ventanas)
---

# 🔐 Insumo 04 — Matriz de Permisos y Control de Acceso (RBAC + BOLA)

**Proyecto:** STIRE-Soft Backend
**Modelo de Seguridad:** Rol-Based Access Control (`RolesGuard` + `@Roles(...)`) + Object-Level
Authorization (chequeo de dueño dentro del propio servicio, sin decorador — `AuthorizationService`
u otro guard de instancia)
**Verificado contra:** `src/**/*.controller.ts` y `src/common/authorization/route-role-metadata.spec.ts`
**Última actualización:** 2026-09-03 (FASE CC-04) — reescrita desde cero: la versión anterior
describía restricciones que ningún decorador ni chequeo real impone.

---

## 0. Cómo leer esta matriz

Cada fila dice **el mecanismo real**, no el que "debería" existir:

- 🔵 **Autorización por rol** — el controller tiene `@Roles(...)`; `RolesGuard` rechaza antes de
  llegar al método si el rol no coincide.
- 🟢 **Autorización por dueño** — no hay `@Roles`, pero el servicio compara `user.id` (o una
  relación de propiedad) contra el recurso solicitado, y devuelve `403`/filtra si no coincide.
- 🔴 **Sin restricción de rol, solo JWT** — la ruta exige `@UseGuards(JwtAuthGuard)` (estar
  autenticado) pero no exige un rol específico ni hay chequeo de propiedad visible en el
  controller. Cualquier usuario autenticado, de cualquier rol, puede llamarla.

Las rutas 🟢 y algunas 🔴 están en la lista de excepciones de
[`route-role-metadata.spec.ts`](../../src/common/authorization/route-role-metadata.spec.ts)
(`JUSTIFIED_EXCEPTIONS` para mutaciones, `JUSTIFIED_GET_EXCEPTIONS` para lecturas) — ese test
falla si alguien agrega una ruta mutante sin `@Roles` y sin registrarla ahí, así que la ausencia
de `@Roles` en las rutas de abajo es intencional y está bajo control de CI, no es un descuido.

---

## 1. Users (`UserController`, base `/users`)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /users` | 🔵 Rol | `@Roles('admin')`. Crear cuentas de rol arbitrario es exclusivo de admin — el auto-registro de estudiante es `POST /auth/register` (`@Public()`, controller distinto). |
| `GET /users` | 🔵 Rol | `@Roles('admin', 'docente')`. |
| `GET /users/:id` | 🟢 Dueño | Sin `@Roles`. El servicio compara `requester.id !== id` → `403` salvo que el requester sea admin. |
| `PATCH /users/:id` | 🔵 Rol | `@Roles('admin')`. |
| `PATCH /users/:id/role` | 🔵 Rol | `@Roles('admin')`. |
| `DELETE /users/:id` | 🔵 Rol | `@Roles('admin')` (soft-delete). |
| `PATCH /users/me` | 🟢 Dueño | Sin `@Roles`. Actualiza siempre `user.id` del token — no recibe un `:id` de otro usuario, así que no hay superficie de BOLA que chequear. |
| `PATCH /users/me/password` | 🟢 Dueño | Igual que arriba, más `@Throttle(5/min)`. |
| `POST /users/me/affiliations` | 🟢 Dueño | Igual mecanismo — siempre sobre `user.id`. |

**Escalamiento de privilegios:** ningún DTO de `PATCH /users/me` expone el campo `role`; cambiar
rol solo es posible vía `PATCH /users/:id/role`, exclusivo de `@Roles('admin')`.

---

## 2. Classes (`ClassController`, base `/class`)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /class` | 🔵 Rol | `@Roles('docente')`. |
| `GET /class` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')` — es decir, cualquier rol autenticado; en la práctica no restringe nada, solo excluye anónimos. |
| `GET /class/my-classes` | 🔵 Rol | `@Roles('docente', 'estudiante')`. |
| `GET /class/:id` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')`. |
| `PATCH /class/:id` | 🔵 Rol | `@Roles('docente')` — el decorador no distingue dueño; verificar en servicio si un docente puede editar clases de otro docente (ver nota abajo). |
| `DELETE /class/:id` | 🔵 Rol | `@Roles('docente', 'admin')` — misma observación que arriba. |

> **NO VERIFICADO en esta fase:** el decorador `@Roles('docente')` en `PATCH`/`DELETE /class/:id`
> no distingue "el dueño de esta clase" de "cualquier docente" — eso, si existe, vive dentro del
> servicio (`AuthorizationService.assertTeacherOwnsClass` u equivalente) y no se verificó línea
> por línea en esta fase. Queda como hallazgo para una auditoría de seguridad dedicada, no para
> FASE CC-04 (documentación).

> **No existe endpoint para que el docente añada o retire estudiantes de una clase** (`POST`/`DELETE
> /class/:id/students/:id`). La fila "el docente puede expulsar estudiante" de la versión anterior
> de esta matriz se elimina — no describe ninguna funcionalidad real. El enrolamiento es siempre
> iniciativa del estudiante vía `POST /enrollment/join` con el código de la clase.

---

## 3. Enrollment (`EnrollmentController`, base `/enrollment`)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /enrollment/join` | 🔵 Rol | `@Roles('estudiante')`. |
| `GET /enrollment/my` | 🟢 Dueño | Sin `@Roles`. Siempre `user.id` del token. |
| `GET /enrollment/class/:classId` | 🔵 Rol | `@Roles('docente', 'admin')`. |

---

## 4. Topic / Section / LearningUnit / Content (gestión curricular)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /topic` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /topic/section/:sectionId`, `GET /topic/:id` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')`. |
| `PATCH`/`DELETE /topic/:id` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `POST /sections` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /sections/*` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')`. |
| `PATCH`/`PATCH .../publish`/`DELETE /sections/:id` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `POST /learning-unit` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /learning-unit`, `GET /learning-unit/:id` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')`. `GET /learning-unit/:id` además pasa por `PrerequisitesGuard`. |
| `GET /learning-unit/all` | 🔵 Rol | `@Roles('docente', 'admin')` — a diferencia de `GET /learning-unit`, aquí el estudiante no tiene acceso. |
| `PATCH /learning-unit/:id` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `DELETE /learning-unit/:id` | 🔵 Rol | `@Roles('admin')` — **solo admin, no docente**, a diferencia de crear/editar. |
| `POST /content` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /content/unit/:unitId`, `GET /content/:id` | 🟢 Dueño* | Sin `@Roles` (excepción justificada de lectura). *No es "dueño" en sentido estricto — es contenido público a cualquier autenticado; la excepción existe porque no hay razón de negocio para restringir por rol una lectura de contenido ya publicado. |
| `GET /content/unit/:unitId/all`, `PATCH /content/:id`, `PATCH /content/:id/visibility`, `POST /content/reorder`, `DELETE /content/:id` | 🔵 Rol | `@Roles('docente', 'admin')`. |

---

## 5. Activities / ActivityQuestions / ActivityTypes (banco de ejercicios)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /activities`, `PATCH /activities/:id`, `PATCH .../publish`, `PATCH .../archive`, `DELETE /activities/:id` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /activities`, `GET /activities/:id` | 🟢 Sin restricción por rol | Excepción justificada de lectura — cualquier autenticado. |
| `POST /activity-questions` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /activity-questions/activity/:activityId` | 🟢 Sin restricción por rol | Excepción justificada de lectura. |
| `POST/PATCH/DELETE /activity-types` | 🔵 Rol | `@Roles('docente', 'admin')`. |
| `GET /activity-types`, `GET /activity-types/:id` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')`. |

---

## 6. Submissions (`SubmissionsController`, base `/submissions`)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /submissions/start` | 🔴 **Sin restricción de rol, solo JWT** | Solo `@UseGuards(JwtAuthGuard)`. `studentId` se toma de `@GetUser()`, así que en la práctica queda asociado a quien llama — pero **nada en el decorador impide que un docente o un admin autenticado llame esta ruta** y genere un "submission" a su propio nombre. La versión anterior de esta matriz afirmaba "Solo estudiantes pueden iniciar intentos" — **eso no es lo que el código aplica**. |
| `POST /submissions/:id/submit` | 🔴 Sin restricción de rol, solo JWT | Mismo mecanismo. `@Throttle(10/min)`. El servicio filtra por `id + studentId` al buscar la entrega, así que un docente no puede *entregar a nombre de otro*, pero sí podría crear y entregar sus propias submissions si conociera el flujo — la restricción real es "solo puedes tocar lo tuyo", no "solo estudiantes". |
| `PUT /submissions/:id/autosave` | 🔴 Sin restricción de rol, solo JWT | Mismo mecanismo. |

> **Hallazgo, no corregido en esta fase (documentación, no código):** las tres rutas de
> Submissions no tienen `@Roles('estudiante')`. Si de verdad se quiere restringir a estudiantes,
> falta el decorador — eso es una decisión de código para una fase futura, no algo que esta fase
> de documentación resuelva.

---

## 7. LearningProgress y Analytics

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `GET /learning-progress/student/:studentId` | 🟢 Dueño | Sin `@Roles`. Servicio aplica `assertTeacherSharesClassWithStudent` — estudiante solo ve lo propio, docente solo ve estudiantes de sus clases, admin ve todo. |
| `GET /learning-progress/student/:studentId/unit/:unitId` | 🟢 Dueño | Mismo mecanismo. |
| `GET /analytics/student/:studentId` | 🟢 Dueño | Sin `@Roles`, excepción justificada de lectura. |
| `GET /analytics/class/:classId` | 🟢 Dueño | Sin `@Roles`, excepción justificada de lectura — filtra por clase del docente/admin solicitante. |

---

## 8. Tutor IA (`TutorController`, base `/tutor`)

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `POST /tutor/chat` | 🔴 **Sin restricción de rol, solo JWT** | `@Throttle(20/min)`, sin `@Roles`. La versión anterior de esta matriz afirmaba "Exclusivo para estudiantes" — **el código no aplica esa exclusividad**: un docente o admin autenticado puede llamar esta ruta igual que un estudiante. |

---

## 9. Notifications, Message, ActivityLog

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `GET /notifications`, `GET /notifications/all` | 🟢 Dueño | Sin `@Roles`, siempre `user.id`. |
| `PATCH /notifications/:id/read` | 🟢 Dueño | Sin `@Roles`, WHERE por `id + userId`. |
| `POST /message` | 🟢 Dueño | Sin `@Roles`. `senderId` siempre `user.id` — cualquier rol autenticado puede enviar mensajes (no hay restricción estudiante↔docente en el decorador). |
| `GET /message/inbox`, `GET /message/sent`, `GET /message/unread-count`, `GET /message/conversation/:userId` | 🟢 Dueño | Sin `@Roles`, siempre `user.id`. |
| `PATCH /message/:id/read` | 🟢 Dueño | Sin `@Roles`, WHERE por `id + receiverId`. |
| `GET /activity-log/student/:studentId` | 🔵 Rol | `@Roles('docente', 'admin')`. |

---

## 10. Institution / Program, Maintenance

| Ruta | Mecanismo | Detalle |
|---|---|---|
| `GET /institutions`, `GET /programs` | 🔵 Rol | `@Roles('estudiante', 'docente', 'admin')`. |
| `POST /institutions`, `POST /programs` | 🔵 Rol | `@Roles('admin')`. |
| `POST /maintenance/cleanup` | 🔵 Rol | `@Roles('admin')` a nivel de clase completa (`@UseGuards(JwtAuthGuard, RolesGuard)` en `MaintenanceController`). Es el **único** endpoint del controller — no existe `GET /maintenance` ni `GET /maintenance/health` (ver `02_CATALOGO_ENDPOINTS.md`, ambos marcados `[BACKEND PENDIENTE]`). |

---

## 11. Las 10 rutas mutantes sin `@Roles` (excepciones registradas en CI)

Estas son exactamente las que `route-role-metadata.spec.ts` permite explícitamente vía
`JUSTIFIED_EXCEPTIONS` — el test falla si alguien agrega una mutación sin `@Roles` que no esté en
esta lista, así que su ausencia de rol es una decisión verificada, no un descuido:

`TutorController.chat` · `SubmissionsController.startSubmission` ·
`SubmissionsController.submitAnswers` · `SubmissionsController.autosave` ·
`NotificationsController.markRead` · `MessageController.create` ·
`MessageController.markAsRead` · `UserController.addAffiliation` ·
`UserController.updateProfile` · `UserController.changePassword`

Todas controlan su alcance dentro del servicio (comparando `user.id` contra el registro, o sin
comparar nada porque el registro no puede pertenecer a otro — como `Message.senderId`), nunca con
un decorador de rol.

---

## 12. Garantías de seguridad verificadas (sin cambios respecto a la versión anterior)

1. **Aislamiento horizontal (BOLA) en LearningProgress:** un docente solo ve estudiantes de sus
   propias clases (`assertTeacherSharesClassWithStudent`); un estudiante que pide el progreso de
   otro recibe `403`.
2. **Escalamiento de privilegios:** `PATCH /users/me` no expone `role` en su DTO; cambiar de rol
   exige `PATCH /users/:id/role`, exclusivo de `@Roles('admin')`.
3. **Integridad de evaluaciones:** `POST /submissions/:id/submit` procesa la calificación en una
   transacción SQL atómica.
