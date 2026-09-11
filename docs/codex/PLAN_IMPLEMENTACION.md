# Plan de implementación para Codex — pendientes reales de STIRE-Soft

**Fecha:** 2026-09-11
**Herramienta objetivo:** Codex (CLI / IDE)
**Autor del plan:** Claude Code, tras verificar en vivo (backend real, MariaDB real, navegador
real) el estado del proyecto en la misma sesión que lo redactó.

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

## 1. Verificación final (las 3 fases, si se hacen todas)

Corre, en este orden, y pega la salida real (no un resumen) como evidencia de cierre:

```
npm run build
npm test
cd frontend-nuxt && npx nuxi typecheck
```

Y al menos un recorrido en navegador real por fase, como se describe en cada criterio de cierre
arriba — "compiló" no es lo mismo que "funciona", regla que gobierna todo este proyecto.
