# Prompt entregado a Codex — 2026-09-11

**Estado:** pendiente de ejecutar
**Herramienta:** Codex (CLI/IDE)

Prompt entregado tal cual, sin editar después (misma regla que el resto de esta carpeta):

---

## Goal

Cerrar tres pendientes reales de STIRE-Soft (backend NestJS + frontend Nuxt 3 + MariaDB), cada uno
ya especificado en detalle, con evidencia de código, en `docs/codex/PLAN_IMPLEMENTACION.md`:

1. **Fase A** — motor de selección de la siguiente actividad según el dominio (`mastery`) del
   estudiante, con un selector opcional de autopercepción que lo sobreescribe.
2. **Fase B** — moderación de matrícula: que un docente pueda exigir aprobación antes de que un
   estudiante entre a su clase, y pueda remover a uno ya matriculado.
3. **Fase C** — sembrar contenido curricular real (módulos, unidades, actividades) para las dos
   clases del seed que hoy están vacías (Castro y Ali).

## Context

- Lee `docs/codex/PLAN_IMPLEMENTACION.md` completo antes de escribir código — trae la especificación
  exacta de cada fase, con archivo:línea de la evidencia y los contratos de datos a respetar.
- Lee `CLAUDE.md` en la raíz del repo — reglas de ingeniería obligatorias de este proyecto (Regla de
  Oro, prohibición de `as any`, disciplina de commits, verificación en navegador real).
- Esta sesión (Claude Code) acaba de cerrar, en el commit inmediatamente anterior a este prompt, un
  bug real de `passingScore` (se comparaba como puntaje crudo contra un umbral fijo, en vez de como
  porcentaje del `totalPoints` de cada actividad) — la Fase A depende de esa normalización ya
  corregida; no la reimplementes distinto, reusa la misma fórmula.

## Scope

Trabaja únicamente dentro de los archivos y patrones que `docs/codex/PLAN_IMPLEMENTACION.md`
describe para cada fase. Las tres fases son independientes — puedes hacerlas en cualquier orden, o
una sola si así se te indica en el momento.

## Constraints

- No toques el motor de evaluación (`src/evaluation-engine/`) ni el cálculo de mastery
  (`src/common/utils/mastery.calculator.ts`) — ya están correctos y ya tienen tests.
- No agregues pantallas ni datos para el tipo `ai_evaluated` — sigue sin evaluador backend.
- No rompas el comportamiento de las clases/matrículas/actividades ya sembradas y verificadas
  (clase de Toscano, tipos de pregunta ya construidos) — cero regresión.
- Prohibido `as any`, `@ts-ignore`, o relajar `tsconfig`/lint para hacer pasar un build.
- Un commit por fase (A, B, C) — no las mezcles.

## Approval Boundaries

- Migraciones de base de datos (Fase B necesita una columna nueva en `Class`): sigue el patrón ya
  usado en `src/migrations/`, pero pide confirmación antes de correr `migration:run` contra una base
  de datos que no sea la tuya de desarrollo local.
- No hagas push a `main` ni abras un PR sin que se te pida explícitamente.
- Si algo de lo que describe el plan ya no coincide con el código real que encuentres (el código
  manda, no el documento), detente y repórtalo en vez de improvisar una solución distinta.

## Done

Por cada fase que completes: `npm run build`, `npm test` y (si tocaste frontend)
`cd frontend-nuxt && npx nuxi typecheck` en verde, más los tests nuevos que pide el criterio de
cierre de esa fase en el plan, más una verificación real en navegador (login real, flujo completo)
contra el backend real — no basta con que compile. Reporta con evidencia real de esos comandos, no
un resumen.

---

🎯 Target: Codex (CLI/IDE)
💡 Estructura Goal/Context/Scope/Constraints/Approval Boundaries/Done para que Codex tenga límites
de acción explícitos en un repo real con reglas de ingeniería propias (`CLAUDE.md`), delegando el
detalle técnico exhaustivo al documento referenciado en vez de sobrecargar el prompt en sí.
