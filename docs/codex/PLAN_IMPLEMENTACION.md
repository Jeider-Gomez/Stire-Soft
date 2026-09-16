# Plan de implementación para Codex — pendientes reales de STIRE-Soft

**Fecha:** 2026-09-11 (Fases A-C) · **actualizado 2026-09-14** (Fases D-F) · **actualizado 2026-09-16** (Fase G)
**Herramienta objetivo:** Codex (CLI / IDE)
**Autor del plan:** Claude Code, tras verificar en vivo (backend real, MariaDB real, navegador
real) el estado del proyecto en la misma sesión que lo redactó.

**Documento vivo, mismo criterio que `docs/antigravity/PLAN_IMPLEMENTACION.md`:** las Fases A-C ya
se ejecutaron y verificaron (ver `docs/antigravity/INFORME_CODEX_PENDIENTES_2026-09-11.md` y
`docs/PLAN_MAESTRO.md` §4.3/§4.4). Las Fases D-F (14/09) también, ver checkpoint 2026-09-14 (2ª
pasada) de `docs/PLAN_MAESTRO.md` §5. La Fase G (16/09) es la siguiente entrega.

> **Coordinación con Antigravity (leer antes de empezar las Fases D-F):** Antigravity trabaja en
> paralelo sobre `frontend-nuxt/pages/docente/`, `frontend-nuxt/pages/admin/` y
> `frontend-nuxt/components/tutor/TutorChatDrawer.vue` (`docs/antigravity/PLAN_IMPLEMENTACION.md`
> §14). Las Fases D-F de este documento **no tocan esos archivos** — son exclusivamente
> `src/submissions/`. Si algo pareciera requerir tocar frontend de Docente/Administrador o el Tutor
> IA, es de Antigravity, no de esta entrega.

---

## 0. Cómo usar este documento

Este archivo agrupa **tres piezas de trabajo independientes** que quedaron pendientes tras cerrar
el ciclo de "tipos de actividad" (`docs/antigravity/PLAN_TIPOS_DE_ACTIVIDAD.md`, ya ejecutado y
verificado). Son independientes entre sí — puedes ejecutarlas en cualquier orden, o una sola si así
se te pide — pero cada una está descrita completa, con evidencia de código real (archivo:línea), no
como una idea suelta.

**Antes de tocar código, lee `CLAUDE.md` en la raíz del repositorio — es la fuente de verdad de las
reglas de ingeniería de este proyecto.** Las que más importan para este trabajo:

- **Regla de Oro:** `npm run build` + `npm test` (backend) y `npx nuxi typecheck` (frontend, dentro
  de `frontend-nuxt/`) después de cada bloque de trabajo. El contador de errores nunca sube.
- **Prohibido** `as any`, `@ts-ignore`, o relajar `tsconfig`/reglas de lint para hacer pasar un build.
- **Sin test, un fix no está terminado.** Cada endpoint o regla de negocio nueva necesita su test.
- **Sin commit sin mensaje aprobado. Sin push sin confirmación explícita del dueño del proyecto.**
  Trabaja sobre un branch propio; no hagas push a `main` ni abras PR sin que te lo pidan.
- **Verificación real, no solo compilación.** Para cualquier cambio de UI o de flujo end-to-end,
  levanta `npm run start:dev` (backend, puerto 3001) y `npm run dev` (frontend, puerto 3000) y
  reproduce el flujo en un navegador real contra datos reales — el patrón ya usado en todo este
  proyecto para no repetir el error de "funcionalidad que aparenta pero no cumple" (ver
  `docs/antigravity/PLAN_IMPLEMENTACION.md`, motivo de la Fase 13).
- Un commit por fase de este plan (A, B, C) — no las mezcles en un solo commit.

Credenciales de desarrollo (`npm run seed`, `src/seeds/seed-runner.ts`):
`pedro.estudiante@unicor.edu.co` / `Test1234!` (estudiante),
`roberto.toscano@unicor.edu.co` / `Test1234!` (docente, clase con contenido real),
`victor.castro@unicor.edu.co` y `ali.docente@unicor.edu.co` / `Test1234!` (docentes, clases vacías —
ver Fase C).

---

## Fase A — Motor de selección de actividad por dominio

### A.1 Qué existe hoy (evidencia)

- Cada unidad de aprendizaje sembrada tiene 3 actividades en progresión de tipo: 1 `mcq` (peso
  bajo) → 1 `fill_code` (peso medio) → 1 `coding` (peso alto) — ver p. ej.
  `src/seeds/seed-runner.ts:320-460` (Unidad 1). Las unidades de Nivel 2 (`drag_drop`, `ordering`,
  `matching`, `seed-runner.ts:1045-1200`) están fuera de esa progresión de 3 pasos — son ejemplos
  sueltos, no una progresión completa todavía.
- El peso real de cada actividad ya existe: `Activity.adaptiveWeight` (`src/activities/entities/
  activity.entity.ts:63-64`, float, default `1.0`) multiplicado por `ActivityType.baseWeight` en
  `src/common/utils/mastery.calculator.ts:14` — esta función (`calculateUnitMastery`) ya calcula un
  `mastery` real (0-100) por unidad, ponderado, no un promedio simple.
- El estudiante ya puede consultar su propio mastery real: `GET /learning-progress/student/:
  studentId/unit/:unitId` (`src/learning-progress/learning-progress.controller.ts:57-70`) y
  `GET /learning-progress/student/:studentId` para todas sus unidades — con control BOLA ya
  implementado (un estudiante solo ve el suyo).
- Hoy el estudiante elige la actividad manualmente navegando la lista del curso — no hay ninguna
  lógica de "la próxima actividad recomendada según tu dominio" en ningún lado del frontend
  (`grep` de `recommendNext`/`selectNextActivity`/`selección de actividad` no encontró nada además
  de las referencias en el plan de Antigravity, que documentan que esta fase se dejó pendiente a
  propósito — ver `docs/antigravity/PLAN_IMPLEMENTACION.md:565-571`, escrito por Claude Code
  cuando pausó esta misma feature esperando a que existieran las pantallas de todos los tipos de
  pregunta, que ya existen).

### A.2 Qué construir

**Backend — nuevo endpoint, sin tocar el motor de evaluación ni el de mastery:**

`GET /learning-progress/student/:studentId/unit/:unitId/next-activity`

- Con control BOLA idéntico al de las rutas hermanas del mismo controller (estudiante solo consulta
  lo suyo; docente solo si comparte clase — reusa `AuthorizationService` ya inyectado en
  `LearningProgressController`).
- Lógica: de las actividades `PUBLISHED` de esa unidad (mismo query que ya usa
  `LearningProgressService.recalculateMastery`, `src/learning-progress/learning-progress.service.ts:
  29-32`), elegir la de **menor `order`** entre las que el estudiante **no ha aprobado todavía**
  (usa la misma comparación normalizada que ya corregiste tú — ver `learning-progress.service.ts`,
  función `isPassed` — **no la reimplementes distinta, impórtala o replica exactamente la misma
  fórmula**: `(score / activity.totalPoints) * 100 >= activity.passingScore`). Si ya aprobó todas,
  devolver la de mayor `order` (para que pueda seguir practicando) con un campo `allCompleted: true`.
- Respuesta: `{ activityId, title, questionType, order, allCompleted }`.

**Selector de autopercepción (override manual):**

- El estudiante debe poder decir "sé que ya domino esto" o "quiero repasar desde el principio" y que
  eso anule la recomendación automática — tal como está descrito en
  `docs/antigravity/PLAN_IMPLEMENTACION.md:568-570` ("selector opcional de autopercepción que lo
  sobreescribe"). Esto es **puramente de UI/estado de sesión** — no hace falta persistirlo en el
  backend ni crear una columna nueva: un simple selector en la pantalla de la unidad
  ("Recomendado para ti" / "Elegir yo mismo") que, si el estudiante activa "elegir yo mismo", muestra
  la lista completa de actividades de la unidad en vez de saltar directo a la recomendada.

**Frontend:**

- En la pantalla donde el estudiante ve las unidades de una clase (`frontend-nuxt/pages/estudiante/
  clases.vue` o la página que liste unidades — verifica el nombre real navegando la app antes de
  asumir), agregar una llamada a `GET .../next-activity` y un botón destacado "Continuar donde
  quedaste" que lleve directo a `/estudiante/evaluacion/:activityId` con la actividad recomendada.
- El toggle de autopercepción descrito arriba, junto a ese botón.

### A.3 Explícitamente fuera de esta fase

- No cambies `calculateUnitMastery` ni la fórmula de `isPassed` — ya están correctas y ya tienen
  tests (`src/learning-progress/__tests__/learning-progress.service.spec.ts`, incluye los casos
  `[FIX]` de regresión del `passingScore` normalizado).
- No construyas progresión de 3 pasos para las actividades de Nivel 2 (`drag_drop`/`ordering`/
  `matching`) — hoy son ejemplos sueltos por unidad, no una secuencia; el endpoint de "siguiente
  actividad" debe funcionar igual con 1 sola actividad en la unidad (caso trivial: es esa misma).
- No toques `ai_evaluated` — sigue sin evaluador registrado en el backend
  (`src/evaluation-engine/evaluation-engine.service.ts`, lanza `BadRequestException`).

### A.4 Criterio de cierre

- Nuevo endpoint con al menos 3 tests: unidad sin actividades aprobadas (recomienda la de menor
  `order`), unidad con la primera aprobada (recomienda la segunda), unidad completa
  (`allCompleted: true`).
- Verificado en navegador real: estudiante nuevo entra a una unidad de Toscano (clase con contenido
  real), ve la recomendación, la resuelve, y al volver ve que ahora recomienda la siguiente.
- `npm run build`, `npm test`, `npx nuxi typecheck` en verde.

---

## Fase B — Moderación de matrícula por el docente

### B.1 Qué existe hoy (evidencia)

- `POST /enrollment/join` (`src/enrollment/enrollment.controller.ts:20-27`) matricula al estudiante
  **inmediatamente en `EnrollmentStatus.ACTIVE`** (`src/enrollment/enrollment.service.ts:26-83`) —
  no hay ningún paso de aprobación del docente entre que el estudiante ingresa el código y queda
  activo en la clase.
- `EnrollmentStatus` (`src/enrollment/enums/enrollment-status.enum.ts`) solo tiene `ACTIVE`,
  `INACTIVE`, `WITHDRAWN`, `COMPLETED` — **no existe un estado `PENDING`**.
- El único endpoint que el docente tiene sobre matrículas es de solo lectura:
  `GET /enrollment/class/:classId` (`enrollment.controller.ts:42-48`). No hay forma de rechazar una
  solicitud, ni de remover a un estudiante ya matriculado.
- `frontend-nuxt/pages/docente/` solo tiene `index.vue` — no hay ninguna pantalla de gestión de
  clase/estudiantes del lado docente todavía.

### B.2 Qué construir

**Backend:**

1. Agregar `PENDING = 'pending'` a `EnrollmentStatus`.
2. Cambiar `EnrollmentService.joinClass` para que, si la clase tiene un flag de moderación activado
   (ver punto 3), la matrícula nueva se cree en `PENDING` en vez de `ACTIVE`. Si la clase NO tiene
   moderación activada, mantén el comportamiento actual (auto-`ACTIVE`) — **no rompas el flujo de
   las clases existentes sin este flag**.
3. Agregar `requiresApproval: boolean` (default `false`) a `Class` (`src/class/entities/
   class.entity.ts`) — nueva columna, requiere una migración TypeORM nueva (revisa
   `src/migrations/` para el patrón exacto ya usado en este proyecto antes de escribirla a mano).
4. Nuevos endpoints en `EnrollmentController`, todos con `@Roles('docente', 'admin')` y verificando
   que el docente sea dueño de la clase (mismo patrón que `AuthorizationService.assertTeacherOwnsClass`,
   ya usado en `findByClass`):
   - `GET /enrollment/class/:classId/pending` — lista matrículas en `PENDING`.
   - `PATCH /enrollment/:enrollmentId/approve` — pasa a `ACTIVE`.
   - `PATCH /enrollment/:enrollmentId/reject` — pasa a `WITHDRAWN` (no elimines la fila; conserva
     el historial).
   - `DELETE /enrollment/:enrollmentId` — remueve a un estudiante ya `ACTIVE` (pasa a `WITHDRAWN`,
     mismo criterio: no borrar la fila).
5. **BOLA:** todos estos 4 endpoints deben rechazar con 403 si el `classId` de la matrícula no
   pertenece al docente autenticado — sigue el mismo patrón que ya usa `findByClass`, no inventes uno
   nuevo.
6. `AuthorizationService.assertTeacherSharesClassWithStudent` / `assertTeacherOwnsClass` ya existen
   (usados en `learning-progress.controller.ts` y `enrollment.service.ts`) — revísalos antes de
   escribir tu propia verificación de propiedad, es casi seguro que ya cubren este caso.

**Frontend:**

- Nueva página `frontend-nuxt/pages/docente/clase/[classId].vue` (o el nombre que sea consistente
  con el resto de `pages/docente/`) con: lista de matrículas `PENDING` (botones Aprobar/Rechazar) y
  lista de matrículas `ACTIVE` (botón Remover). Reusa los componentes de tabla/lista que ya existen
  en el resto del proyecto — no crees un sistema de diseño nuevo para esto.
- Un toggle en la edición de la clase (`requiresApproval`) — solo si ya existe una pantalla de
  edición de clase del docente; si no existe, un campo simple en el formulario de creación de clase
  basta, no construyas una pantalla de "configuración de clase" completa para esto.

### B.3 Explícitamente fuera de esta fase

- No cambies el flujo de estudiantes ya `ACTIVE` en clases sin `requiresApproval` — cero regresión
  para las 3 clases ya sembradas (Toscano, Castro, Ali).
- No construyas notificaciones push/email para "tu solicitud fue aprobada" — con que quede reflejado
  en `GET /enrollment/my` (ya existente) al recargar es suficiente para esta fase.

### B.4 Criterio de cierre

- Tests nuevos en `enrollment.service.spec.ts` (o el que corresponda): join con `requiresApproval=true`
  crea `PENDING`, no `ACTIVE`; approve/reject cambian el estado correcto; un docente no puede
  aprobar/rechazar/remover sobre una clase que no es suya (403).
- Verificado en navegador real: crear una clase con `requiresApproval=true`, matricular un estudiante
  de prueba (queda `PENDING`, sin acceso a las actividades — confirma que
  `EnrollmentService.validateEnrollment` sigue exigiendo `ACTIVE`, ya lo hace hoy en
  `enrollment.service.ts:112`), aprobarlo desde la pantalla del docente, confirmar que ahora sí entra.
- `npm run build`, `npm test`, `npx nuxi typecheck` en verde.

---

## Fase C — Contenido curricular real para las clases de Castro y Ali

### C.1 Qué existe hoy (evidencia)

- `src/seeds/seed-runner.ts` crea 3 clases: `classToscano` (línea ~165), `classCastro` (~165-178),
  `classAli` (~178-185) — pero **todo el contenido real (módulos, temas, unidades, actividades,
  preguntas)** de las líneas ~247 en adelante se crea únicamente bajo `classToscano`. `classCastro`
  y `classAli` no tienen ni un solo `Module`/`Topic`/`LearningUnit`/`Activity` propio en el seed —
  quedan como clases vacías con solo su nombre, código y docente.
- Pedro (`studentPedro`) ya está auto-matriculado en `classCastro` (`seed-runner.ts:209-213`) —
  entra a esa clase y no encuentra nada que estudiar.

### C.2 Qué construir

Sembrar contenido real para **ambas** clases, siguiendo exactamente el mismo patrón anidado que ya
usa `classToscano` (Module → Topic → LearningUnit → Activity → ActivityQuestion, con
`findOrCreate` para que el seed siga siendo idempotente — no dupliques filas en corridas repetidas).

- No inventes un dominio distinto sin sentido: usa el nombre/descripción real de cada clase
  (revísalos en el seed) para decidir el tema. Si el nombre de la clase ya sugiere el dominio
  (ej. una clase de bases de datos, de estructuras de datos, etc.), el contenido debe corresponder
  a eso — no repitas literalmente el contenido de JavaScript de Toscano con otro nombre.
- Por cada clase: al menos 1 módulo, con al menos 2 unidades de aprendizaje, cada una con la misma
  progresión de 3 actividades (`mcq` → `fill_code` → `coding`) que ya usa Toscano — reutiliza los
  mismos `config`/`answer` exactos por tipo que ya validaste en
  `docs/antigravity/PLAN_TIPOS_DE_ACTIVIDAD.md` (sección de contratos por tipo) para no introducir
  un formato de config distinto que el `EvaluationEngineService` no sepa calificar.
- `totalPoints` y `passingScore` de cada actividad nueva: sigue el patrón ya corregido en esta
  sesión — `passingScore` es un **porcentaje** (usa `60` como en el resto del seed), y `totalPoints`
  puede variar libremente por actividad (10, 15, 20... como ya hace Toscano) porque la normalización
  ya está arreglada en el backend — no necesitas compensar nada por eso.

### C.3 Explícitamente fuera de esta fase

- No toques el contenido de `classToscano` — es el que ya está verificado end-to-end en todas las
  sesiones anteriores.
- No agregues actividades de Nivel 2 (`drag_drop`/`ordering`/`matching`) a estas clases nuevas salvo
  que se te pida explícitamente — el foco es que dejen de estar vacías con la progresión básica de 3
  tipos, no paridad completa con los ejemplos de Nivel 2.

### C.4 Criterio de cierre

- `npm run seed` corre limpio (idempotente: correrlo dos veces seguidas no duplica filas).
- Verificado en navegador real: login como `pedro.estudiante@unicor.edu.co`, entrar a la clase de
  Castro, confirmar que ahora hay contenido real y que se puede resolver y calificar al menos una
  actividad de cada tipo nuevo, igual que ya se verificó para Toscano.
- `npm run build` y `npm test` en verde (el seed no tiene tests unitarios propios, pero no debe
  romper ninguno existente).

---

## Fase D — Restricción real contra intentos activos duplicados

### D.1 Qué existe hoy (evidencia, verificada 2026-09-14)

- `startSubmission` (`src/submissions/submissions.service.ts:38-62`) comprueba si ya existe un
  intento activo con `submissionsRepo.findActiveSubmission(studentId, activity.id)` **antes** de
  crear uno nuevo — es un patrón *leer-luego-escribir* (check-then-act), no una restricción a nivel
  de base de datos.
- `submission.entity.ts` (`src/submissions/entities/submission.entity.ts:8-9`) solo tiene
  `@Index(['studentId','activityId'])` y `@Index(['studentId','status'])` — índices normales para
  acelerar consultas, ninguno con `@Unique`.
- Consecuencia real: dos requests concurrentes de `POST /submissions/start` para la misma actividad
  (doble clic, red lenta con reintento del cliente, dos pestañas) pueden ambas pasar la comprobación
  antes de que la primera termine de guardar, y terminar creando dos filas `IN_PROGRESS` para el
  mismo `(studentId, activityId)`. Esto es el hallazgo `P1-07` del QA de Jorge Cervantes
  (`docs/ReportesQA/`) — verificado contra el código real, es real.

### D.2 Qué construir

- Nueva migración TypeORM (revisa `src/migrations/` para el patrón exacto ya usado, p. ej.
  `1789000000000-AddApprovalToClasses.ts` de la Fase B) que agregue un **índice único parcial/
  condicional** sobre `(studentId, activityId)` donde `status = 'in_progress'` — MariaDB soporta
  índices funcionales/generados o, más simple y portable, una columna generada booleana
  (`isActiveAttempt`) que sea `true` solo cuando `status='in_progress'` y un índice único sobre
  `(studentId, activityId, isActiveAttempt)` con `isActiveAttempt` como parte de la clave (el valor
  `false` no colisiona porque MariaDB no aplica unicidad sobre múltiples `NULL`, pero si se usa un
  booleano en vez de `NULL` hay que verificarlo con una prueba real de dos inserciones — no asumir
  el comportamiento de memoria).
- Ajustar `startSubmission` para que, si el `INSERT` falla por violar esa restricción (captura el
  error de MariaDB, código `ER_DUP_ENTRY`/`23000`), la reintente como una simple relectura +
  devolución del intento activo real (mismo resultado que el `return active` de hoy) — el usuario
  nunca debe ver un 500 por esto, la restricción es una defensa adicional, no un nuevo error visible.
- **No** cambies la firma de `startSubmission` ni el contrato de `POST /submissions/start` — el
  frontend (`workspace.ts`) sigue esperando exactamente la misma respuesta de siempre.

### D.3 Explícitamente fuera de esta fase

- No toques `findActiveSubmission` ni el resto de `submissions.repository.ts` más allá de lo
  necesario para el manejo del error de duplicado.
- No apliques la misma restricción a otras entidades — el hallazgo es específico de `submissions`.

### D.4 Criterio de cierre

- Test nuevo que dispare dos `startSubmission` concurrentes (p. ej. `Promise.all` de dos llamadas al
  servicio con el mismo `studentId`/`activityId` contra una BD de test real, no mockeada) y verifique
  que solo existe una fila `IN_PROGRESS` al final, sin que la segunda llamada lance un error visible
  al usuario.
- `npm run build`, `npm test` en verde. Migración corrida contra una BD real de desarrollo
  (`npm run migration:run`), no solo generada.

---

## Fase E — Verificar matrícula activa en `POST /submissions/start`

### E.1 Qué existe hoy (evidencia, verificada 2026-09-14)

- `startSubmission` (`src/submissions/submissions.service.ts:38-62`) solo verifica que la actividad
  exista (`activitiesRepo.findOne`) y el límite de intentos — **nunca** verifica que el
  `studentId` esté matriculado (`EnrollmentStatus.ACTIVE`) en la clase que contiene esa actividad.
  Un estudiante autenticado que conozca o adivine un `activityId` de una clase en la que no está
  inscrito puede iniciar un intento igual. Hallazgo `P2-R3` del QA de Jorge — verificado, es real.
- Ya existe el mecanismo para esta verificación en otro lugar del código: revisa
  `AuthorizationService` (usado en `enrollment.service.ts`, `learning-progress.controller.ts` y
  `learning-unit.service.ts` — este último cerrado por Claude Code el 11/09, commit `b1bc096`, mismo
  tipo de hallazgo). **No reimplementes la verificación de matrícula distinta a la que ya existe** —
  localiza el método equivalente a `assertEnrolledInClass`/`assertCanReadClass` y reutilízalo, o
  replica exactamente su misma consulta si el método no es directamente inyectable aquí.

### E.2 Qué construir

- En `startSubmission`, después de cargar `activity` y antes de crear la submission: obtener la
  clase propietaria de la actividad (`activity.learningUnit.topic.section.classId` o el camino real
  que uses en otros servicios — verifica la relación exacta en `activity.entity.ts` antes de asumir
  la ruta) y verificar que el estudiante tenga una matrícula `ACTIVE` en esa clase. Si no,
  `ForbiddenException` (403), igual que el patrón ya usado en las rutas hermanas.
- Verifica también `POST /submissions/:id/run` (mismo servicio, función de ejecución libre) — si
  comparte la falta de verificación, corrígela ahí también; si ya la tiene (por ejemplo porque
  reutiliza `ensureActiveSubmission` de una submission ya creada con matrícula válida), no dupliques
  la comprobación innecesariamente.

### E.3 Explícitamente fuera de esta fase

- No cambies el comportamiento para las 3 clases ya sembradas con estudiantes ya matriculados
  (Toscano, Castro, Ali) — cero regresión, deben seguir pudiendo iniciar submissions con normalidad.
- No toques `submitAnswers` ni `runIsolatedCode` del lado backend más allá de la verificación de
  matrícula si aplica — su lógica de calificación no cambia.

### E.4 Criterio de cierre

- Test nuevo: un estudiante NO matriculado en la clase de una actividad recibe 403 al intentar
  `POST /submissions/start` con esa `activityId`; un estudiante SÍ matriculado sigue funcionando
  igual que antes (regresión cero, reutiliza los tests existentes de `submissions.service.spec.ts`).
- Verificado en navegador real: `pedro.estudiante@unicor.edu.co` (matriculado en Castro y Toscano)
  no puede iniciar una actividad de una clase en la que no está inscrito, aunque conozca el
  `activityId` por URL directa.
- `npm run build`, `npm test` en verde.

---

## Fase F — Endurecer la emisión de `submission.graded` (mitigación ligera, no outbox completo)

### F.1 Qué existe hoy (evidencia, verificada 2026-09-14)

- `submitAnswers` (`submissions.service.ts:140-163`) ya hace lo correcto en el orden: comita la
  transacción de BD (`queryRunner.commitTransaction()`) **antes** de emitir `submission.graded` vía
  `eventEmitter.emitAsync(...)` — el comentario en el propio código lo llama "COMMIT PRIMERO". Esto
  contradice la descripción literal del hallazgo `P1-08` del QA de Jorge ("se pierde si la
  transacción falla") — con este orden, si la transacción falla, el evento nunca se emite y no hay
  inconsistencia. **No repitas el hallazgo como está escrito en el reporte de Jorge; el riesgo real
  es más angosto**, ver abajo.
- El riesgo real que sí queda abierto: el `await this.eventEmitter.emitAsync(...)` en sí mismo no
  está en un `try/catch`. Si ese `emitAsync` lanza (un listener con un bug, una excepción no
  controlada en el cálculo de mastery), la promesa de `submitAnswers` se rechaza **después** de que
  la submission ya quedó `GRADED` en BD — el estudiante puede recibir un error 500 en la respuesta
  aunque su calificación ya se guardó correctamente, y no hay ningún reintento ni registro de que el
  procesamiento de mastery/repasos no terminó.

### F.2 Qué construir (mitigación acotada, no un patrón Outbox completo)

- Envolver el `emitAsync('submission.graded', ...)` en un `try/catch` dentro de `submitAnswers`: si
  falla, registrar el error con suficiente contexto para diagnosticarlo (`submission.id`,
  `studentId`, `activityId`) usando el logger que ya use el resto del servicio — **y responder al
  cliente con la submission ya calificada igual** (el `GRADED` en BD es el resultado que importa;
  que el estudiante lo vea es más importante que ocultarlo por un fallo del post-proceso).
- No implementes un patrón Outbox completo (tabla de eventos pendientes + reintentos automáticos) —
  es sobre-ingeniería para el tamaño actual de este proyecto; deja explícito en el código (comentario)
  que esta es una mitigación ligera y que un outbox real sería el siguiente paso si el problema se
  vuelve frecuente en producción.

### F.3 Explícitamente fuera de esta fase

- No cambies el orden commit-luego-emit que ya es correcto.
- No agregues colas, tablas de eventos, ni infraestructura nueva — un `try/catch` con logging basta
  para el alcance de esta fase.

### F.4 Criterio de cierre

- Test nuevo: forzar que `eventEmitter.emitAsync` lance dentro de `submitAnswers` (mock) y verificar
  que el método de todas formas retorna la submission ya calificada (no relanza el error al
  controller) y que se registró el error.
- `npm run build`, `npm test` en verde.

---

## Fase G — Auditoría sistemática de BOLA y de rate-limiting (2026-09-16)

**Contexto:** Jorge Cervantes (QA) hace una nueva auditoría pronto (ver
`docs/ReportesQA/GUIA_AUDITORIA_2026-09-16.md`). Esta fase existe para que su auditoría encuentre
menos — no para competir con ella, sino para hacer el trabajo de código que un QA manual no puede
hacer bien (leer cada servicio, no solo probar la app por fuera). No depende de que Jorge termine
primero; son complementarias.

**Por qué esta fase y no otra:** varios módulos ya tuvieron un hallazgo real de BOLA (autorización
que revisa el rol pero no la propiedad del recurso específico) — `learning-unit.service.ts`
(`assertCanReadClass`), `submissions.service.ts` (`assertActiveEnrollment`),
`enrollment.service.ts` (`assertTeacherOwnsClass`). Esos ya están cerrados. Lo que nadie ha hecho es
el mismo ejercicio, sistemático, sobre **todos** los módulos restantes — algunos ya se revisaron en
esta misma sesión y salieron limpios (`message`, `review-schedules`, `learning-progress`), quedan
sin revisar: `activities`, `activity-questions`, `activity-types`, `analytics`, `class`, `content`,
`institution`, `notifications`, `section`, `topic`, `user`.

### G.1 Qué existe hoy (evidencia, verificada 2026-09-16)

El patrón correcto ya existe en el código y hay que replicarlo, no inventarlo:
- `AuthorizationService.assertTeacherOwnsClass(user, classId)` (`src/common/authorization/`) —
  usado por `enrollment.service.ts:95,103,116`.
- `AuthorizationService.assertCanReadClass(...)` — usado por `learning-unit.service.ts`.
- `AuthorizationService.assertTeacherSharesClassWithStudent(...)` — usado por
  `learning-progress.controller.ts:46,71,90`.
- `SubmissionsService.assertActiveEnrollment()` (`submissions.service.ts:358-365`).

**Ya verificado limpio en esta sesión (no lo repitas, es evidencia real):** `message.controller.ts`
(todo se filtra por `user.id` del JWT, sin parámetro de ID ajeno explotable),
`review-schedules.controller.ts` (`/due` solo devuelve lo del usuario autenticado),
`learning-progress.controller.ts` (ya usa `assertTeacherSharesClassWithStudent` en sus 3 endpoints
con `:studentId`), `enrollment.controller.ts`/`enrollment.service.ts` (ya usa
`assertTeacherOwnsClass` en las 5 mutaciones/consultas por clase).

### G.2 Qué construir

Para cada uno de los módulos sin revisar (`activities`, `activity-questions`, `analytics`, `class`,
`content`, `institution`, `notifications`, `section`, `topic`, `user`):

1. Lista cada endpoint que recibe un `:id` de un recurso específico (no una lista general) y que un
   estudiante o docente autenticado de **otra** clase podría intentar leer o mutar.
2. Para cada uno, confirma si el service que lo maneja verifica que el recurso pertenece a una clase
   que el usuario autenticado enseña (docente) o donde está matriculado (estudiante) — no solo que
   el usuario tenga el rol correcto.
3. Si encuentras un hueco real: ciérralo con el mismo patrón que ya usa el proyecto (reutiliza
   `AuthorizationService` si el chequeo es genérico, o un método `assertXxx` dedicado en el propio
   service si es específico al módulo — mismo estilo que `assertActiveEnrollment`). No inventes un
   mecanismo nuevo de autorización.
4. `activity-types` es la única excepción deliberada — es un catálogo de referencia sin concepto de
   dueño, documentado así en el propio código (`activity-types.controller.ts:17-20,31-34`). No le
   agregues un chequeo de propiedad que no le corresponde.
5. Documenta cada módulo revisado en tu informe, **incluidos los que salen limpios** — "revisado,
   sin hallazgo" es tan valioso como un fix, evita que se vuelva a revisar sin necesidad.

**Rate-limiting, mismo criterio:** revisa cada controller y confirma que los endpoints que disparan
trabajo real (llamadas a LLM, escritura en BD con lógica de negocio, ejecución de sandbox) tienen
`@Throttle` acorde a su costo, no solo el límite global de 100 req/min. Ya se corrigió `GET
/tutor/greeting` (sin `@Throttle`, cerrado el 16/09) — revisa si queda algún caso similar,
especialmente en `maintenance.controller.ts` (`POST /maintenance/cleanup`, admin-only pero
destructivo).

### G.3 Explícitamente fuera de esta fase

- No toques `mastery.calculator.ts`, `tutor-recommendation.service.ts`, ni ningún archivo de
  `src/tutor/` o `frontend-nuxt/` — es una auditoría de autorización de backend, no una fase de
  frontend ni de lógica pedagógica.
- No le agregues un mecanismo de "propiedad" a `activity-types` (G.2, punto 4) — es una decisión de
  diseño ya tomada, no un hallazgo.
- No inventes un framework de autorización nuevo (decoradores custom, guards genéricos) si el hueco
  se puede cerrar con el mismo patrón `assertXxx` que ya usa el resto del proyecto — consistencia
  sobre elegancia.

### G.4 Criterio de cierre

- Los 11 módulos listados en G.2 quedan revisados, cada uno con su resultado documentado en el
  informe (limpio, o hallazgo + fix + test).
- Cada hallazgo real cerrado tiene su propio test de regresión (mismo criterio que `D.4`/`E.4`/`F.4`
  de este documento) probando que el usuario sin permiso recibe `403`/`404` y que el usuario correcto
  sigue funcionando igual.
- Barrido de `@Throttle` completado, con cualquier gap real corregido y declarado.
- `npm run build`, `npm test` en verde — pega la salida completa, no un resumen.

---

## 1. Verificación final (todas las fases, si se hacen todas)

Corre, en este orden, y pega la salida real (no un resumen) como evidencia de cierre:

```
npm run build
npm test
cd frontend-nuxt && npx nuxi typecheck
```

Y al menos un recorrido en navegador real por fase, como se describe en cada criterio de cierre
arriba — "compiló" no es lo mismo que "funciona", regla que gobierna todo este proyecto.

**Informe de sesión obligatorio al terminar**, siguiendo `docs/codex/informes/TEMPLATE_INFORME.md`,
guardado como `docs/codex/informes/INFORME_YYYY-MM-DD_SESION_NN.md`, con fila agregada al índice de
`docs/codex/README.md` — mismo criterio que ya usa Antigravity. Un commit por fase (D, E, F) — no las
mezcles en un solo commit, igual que se pidió para las Fases A-C.
