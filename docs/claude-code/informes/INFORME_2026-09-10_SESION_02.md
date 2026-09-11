# STIRE — Informe de Sesión Claude Code

**Código de Documento:** INF-CC-2026-09-10-02
**Fecha:** 2026-09-10 (tarde/noche)
**Agente / Asistente:** Claude Code (Sonnet 5)
**Ambiente:** Desarrollo Local (`localhost`) — backend `:3011` + frontend `:3010` (puertos
alternos para no chocar con otra sesión activa en el mismo checkout), verificado también contra
`:3001`/`:3000` en una segunda pasada
**Stack Verificado:** NestJS + MariaDB (`basestire`) + Nuxt 3

---

## 1. Resumen Ejecutivo

El dueño del proyecto reportó, usando la aplicación real como estudiante, que la puntuación
mostrada tras resolver un ejercicio no tenía sentido ("me sale 8 de 100") y pidió pensar en una
manera de comunicar el resultado ligada a la experiencia de usuario, no solo a un número crudo.
Investigar esto llevó a un bug real de fondo — `passingScore` se trataba como puntaje absoluto
contra un umbral fijo, sin normalizar por el puntaje máximo real de cada actividad — y a construir,
sobre el arreglo, la primera versión de la UX de "dominio" (mastery) que el proyecto necesitaba.
Cerrada esa parte, esta misma sesión redactó el plan de implementación que Codex ejecutaría después
para los tres pendientes reales que quedaban abiertos (§9.2 de `docs/00_VISION_FUNCIONAL.md`,
puntos 9 y 10, más el contenido de Castro/Ali).

**Regla de Oro en el cierre:** `npm run build` sin errores + `npm test` en 291/291 (backend) +
`npx nuxi typecheck` en 0 errores (frontend). Verificado en navegador real contra backend + MariaDB
reales, no solo con tests.

---

## 2. Hallazgo Principal: `passingScore` sin normalizar

### 2.1 Síntoma

El dueño del proyecto vio "8 de 100" al resolver una actividad `fill_code` de 15 puntos totales, y
señaló que además de la confusión del número, el sistema debería poder tener **distintas formas de
evaluación por unidad, cada una con su propio peso** — sin saber que ese mecanismo (`adaptiveWeight`
+ `mastery.calculator.ts`) ya existía en el backend desde antes.

### 2.2 Investigación y causa raíz

- El "8/100" venía de dos sitios: (a) un `/100` **hardcodeado** en 3 lugares del frontend
  (`stores/workspace.ts` en dos logs de consola, y el modal de resultado en
  `pages/estudiante/evaluacion/[activityId].vue`), que nunca miraba el `totalPoints` real de la
  actividad; (b) un bug más serio y ya existente: `passingScore` (sembrado como `60` en absolutamente
  todas las actividades, `src/seeds/seed-runner.ts`) se comparaba como **puntaje crudo** contra el
  score real (`s.score >= act.passingScore`) en 3 sitios — `learning-progress.service.ts`,
  `submissions.service.ts` y la notificación al estudiante — sin importar que `totalPoints` varía
  por actividad (10, 15, 20, 25, 30). Cualquier actividad con menos de 60 puntos totales —
  **todas las de tipo `mcq`/`fill_code`/`drag_drop`/`ordering`/`matching`** — no podía "aprobarse"
  nunca, sin importar qué tan bien la resolviera el estudiante. Confirmado en la BD real antes del
  fix: `completedActivities:0` y `successRate:0` pese a intentos con score perfecto.
- El mecanismo de peso por tipo de evaluación que el dueño del proyecto pidió **ya existía**:
  `Activity.adaptiveWeight` × `ActivityType.baseWeight`, agregado en
  `src/common/utils/mastery.calculator.ts:14` — no hacía falta construirlo, solo estaba roto por
  el bug de `passingScore` de arriba.

### 2.3 Corrección

- `passingScore` ahora se trata como **porcentaje** del `totalPoints` de cada actividad en los 3
  sitios que lo comparaban.
- `submission.graded` pasó de `emit` (fire-and-forget) a `emitAsync`: el `mastery` queda recalculado
  antes de responder al frontend, no en una carrera de fondo.
- `POST /submissions/:id/submit` y `GET /submissions/:id` ahora devuelven `maxScore` (el
  `totalPoints` real) y `passed` (booleano ya normalizado) — el frontend deja de asumir `/100`.
- El modal de resultado ahora muestra el **dominio real de la unidad, antes y después** ("Tu dominio
  de esta unidad subió en X% (+Y%)"), usando el endpoint de mastery ya existente — en vez de solo un
  puntaje crudo sobre un denominador fabricado.
- `HeaderNav.vue` ya no muestra la barra de "clase actual" a docente/administrador (solo tiene
  sentido para el estudiante).
- 7 tests nuevos cubriendo la regresión exacta (actividad de 20 puntos con score perfecto → antes no
  podía "aprobar", ahora sí).

**Verificado en navegador real:** login como estudiante nuevo, entrega de un `drag_drop` perfecto
(20/20), modal mostrando `20/20 pts`, `¡Actividad Completada con Éxito!` y `dominio subió en 26%
(+26%)`.

**Commit:** `741b18f`.

---

## 3. Plan de Implementación para Codex

Con el bug de fondo cerrado, se le pidió a Claude Code un plan de implementación para que Codex
ejecutara los tres pendientes reales que seguían abiertos (§9.2 de `docs/00_VISION_FUNCIONAL.md`):

1. **Fase A** — motor de selección de la siguiente actividad según el dominio del estudiante, con
   un selector opcional de autopercepción que lo sobreescribe.
2. **Fase B** — moderación de matrícula: que un docente pueda exigir aprobación antes de que un
   estudiante entre a su clase, y pueda remover a uno ya matriculado.
3. **Fase C** — sembrar contenido curricular real para las clases de Castro y Ali (hoy vacías).

El plan se redactó con el mismo estándar de evidencia que
`docs/antigravity/PLAN_TIPOS_DE_ACTIVIDAD.md`: citas de archivo:línea contra el código real (no
contra memoria de sesiones anteriores), contratos de datos exactos, alcance explícito por fase,
constraints ("no toques `evaluation-engine`, no reimplementes la fórmula de `passingScore` ya
corregida"), y criterio de cierre con verificación en navegador real — no solo compilación.

**Documento:** `docs/codex/PLAN_IMPLEMENTACION.md`.
**Prompt archivado:** `docs/prompts/CODEX_2026-09-11_PENDIENTES.md`.
**Commit:** `228393e`.

---

## 4. Commits de la Sesión (todos locales — sin push, sin autorización pedida en este punto)

| Commit | Descripción |
| :--- | :--- |
| `741b18f` | Normaliza `passingScore` como porcentaje y muestra el dominio real al estudiante |
| `228393e` | Plan de implementación para Codex — motor de dominio, moderación de matrícula, contenido Castro/Ali |

---

## 5. Próximos Pasos

1. Entregar el prompt de `docs/prompts/CODEX_2026-09-11_PENDIENTES.md` a Codex.
2. Cuando Codex reporte cierre, auditar su entrega contra el código real antes de darla por buena —
   mismo criterio aplicado toda la sesión con Antigravity (ver §6 de
   `INFORME_2026-09-11_SESION_01.md`).
