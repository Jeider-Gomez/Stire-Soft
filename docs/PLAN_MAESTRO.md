# STIRE — Plan Maestro de Implementación y Seguimiento

**Documento vivo. Última actualización: 2026-09-14.**

> ## ⚠️ Regla de edición — leer antes de tocar este archivo
>
> **Solo Claude Code edita este documento**, específicamente el Checklist Maestro (§4) y el
> Registro de Checkpoints (§5). Si eres Antigravity, Codex, o cualquier otra herramienta de IA
> trabajando en STIRE: **no edites este archivo directamente**. Reporta tu avance en tu propio
> informe de sesión (`docs/antigravity/informes/`, o el que corresponda a tu herramienta) y deja
> que Claude Code actualice el checklist a partir de una verificación real contra el código — el
> mismo criterio de "el código manda" que gobierna todo este proyecto (ver `CLAUDE.md`). Esto no es
> arbitrario: dos veces ya (informes de Antigravity, y una entrega de Codex) un ítem se dio por
> cerrado y no lo estaba del todo — este documento existe para que haya un solo lugar donde el
> estado marcado ya fue verificado por alguien que lo comprobó, no por quien lo construyó.
>
> Las secciones §1-§3 (contexto, visión, modelo de colaboración) sí pueden proponerse por
> cualquiera, pero su versión final la aprueba el dueño del proyecto.

---

## 1. Qué es este documento y para qué sirve

STIRE-Soft es un Sistema Tutor Inteligente construido con varias herramientas de IA trabajando en
paralelo (Claude Code, Antigravity, Codex), cada una con planes propios y detallados para su parte
del trabajo. Antes de este documento, no existía **un solo lugar** que explicara cómo esas
herramientas se coordinan entre sí y qué tan avanzado está el proyecto en conjunto — cada plan
(`docs/antigravity/PLAN_IMPLEMENTACION.md`, `docs/codex/PLAN_IMPLEMENTACION.md`) cubre su propio
alcance, y `docs/00_VISION_FUNCIONAL.md` §9 registra hallazgos y su estado pero no es un roadmap.

Este documento cierra ese hueco. No repite el detalle técnico de cada plan — lo referencia — y se
concentra en tres cosas:

1. **La visión** de qué se está construyendo y por qué (referencia corta; el detalle vive en
   `docs/00_VISION_FUNCIONAL.md`).
2. **El modelo de colaboración multi-IA**: quién hace qué, y cómo se pasa el trabajo entre
   herramientas sin perder contexto ni calidad.
3. **El checklist maestro**: una sola tabla, verificada contra el código real, que dice qué está
   hecho, qué está a medias, y qué falta — en todo el proyecto, no solo en la parte de una
   herramienta.

---

## 2. La visión, en una página

STIRE es un tutor adaptativo para un curso de algoritmia básica en web (HTML5/CSS/JavaScript). Tres
pilares pedagógicos gobiernan toda decisión técnica (detalle completo:
`docs/00_VISION_FUNCIONAL.md` §2):

1. **Evaluación adaptativa y dominio (Mastery):** cada actividad tiene un peso (`adaptiveWeight` ×
   `ActivityType.baseWeight`); el dominio de una unidad es un promedio ponderado real de esos pesos,
   no un promedio simple ni un número decorativo.
2. **Repetición espaciada (SM-2):** lo que el estudiante ya domina se repasa cada vez más espaciado;
   lo que le cuesta, más seguido.
3. **Tutor IA socrático y contextualizado:** adapta su lenguaje según el nivel de dominio del
   estudiante y conoce en qué actividad/unidad está, sin que el estudiante tenga que explicárselo.

Actores: **Estudiante** (resuelve actividades, consulta al Tutor, repasa), **Docente** (crea
clases/contenido/actividades, modera matrícula), **Administrador** (gestión global de usuarios).

---

## 3. Modelo de colaboración multi-IA

Este proyecto usa **tres herramientas de IA con roles distintos**, no intercambiables:

### Claude Code — integrador, auditor, y dueño del checklist

- Hace el trabajo de backend más delicado (arquitectura, seguridad, bugs de fondo que afectan varios
  módulos a la vez — p. ej. el fix de `passingScore` que tocó 3 servicios distintos).
- Redacta los planes rigurosos que Antigravity y Codex ejecutan (`PLAN_TIPOS_DE_ACTIVIDAD.md`,
  `docs/codex/PLAN_IMPLEMENTACION.md`) — con evidencia de código real, contratos de datos exactos, y
  alcance explícito, para que la herramienta que lo ejecute no tenga que adivinar el contexto.
- **Audita lo que las otras herramientas entregan antes de darlo por cerrado.** Nunca confía en un
  mensaje de commit o un informe propio de la herramienta — verifica contra el código real,
  reproduce en navegador contra backend+BD reales, y solo entonces actualiza este checklist. Esto ya
  encontró y corrigió hallazgos reales dos veces (ver `docs/claude-code/informes/`).
- Es la única herramienta que edita §4 y §5 de este documento.

### Antigravity — construcción de frontend guiada por plan

- Construye pantallas y componentes de Nuxt 3 siguiendo un plan que Claude Code le entrega, con el
  contrato de datos exacto contra el que debe integrar (`docs/antigravity/PLAN_IMPLEMENTACION.md`,
  `PLAN_TIPOS_DE_ACTIVIDAD.md`).
- Deja su propio informe de sesión en `docs/antigravity/informes/` — registro de punto en el tiempo,
  nunca editado después.

### Codex — fases delegadas de backend + frontend

- Ejecuta fases completas (backend y frontend) descritas en `docs/codex/PLAN_IMPLEMENTACION.md`, con
  mayor autonomía de implementación dentro del alcance y las restricciones que el plan fija.
- Su entrega se audita igual que la de Antigravity antes de aceptarse — ver
  `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` para un ejemplo completo del proceso
  (incluyendo un caso donde la entrega cumplía la estructura pedida pero no la intención).

### El ciclo, en resumen

```
Dueño del proyecto reporta algo / pide algo
        │
        ▼
Claude Code investiga contra el código real (nunca contra memoria ni documentos viejos)
        │
        ├── Si es backend crítico / cruza varios módulos → Claude Code lo hace directamente
        │
        └── Si es una pieza de frontend o una fase delegable → Claude Code escribe un plan
            riguroso (evidencia, contratos, alcance, constraints, criterio de cierre)
                    │
                    ▼
            Antigravity o Codex ejecuta el plan
                    │
                    ▼
            Claude Code AUDITA la entrega contra el código real (nunca confía en el reporte)
                    │
                    ├── Hallazgos → se corrigen (por Claude Code o devolviendo el plan corregido)
                    │
                    ▼
            Claude Code actualiza el Checklist Maestro (§4) y registra el checkpoint (§5)
```

---

## 4. Checklist Maestro

Estado verificado contra el código real, última pasada 2026-09-14 (ver checkpoints en §5 para qué
cambió en cada fecha). `✅` = verificado en código y, cuando aplica,
en navegador real. `⚠️` = parcial, con el detalle de qué falta. `❌` = no existe. `🕐` = en pausa a
propósito (decisión del dueño del proyecto, no olvido).

### 4.1 Backend Core

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Auth, User, Class, Submissions, EvaluationEngine, Analytics | ✅ | `docs/00_VISION_FUNCIONAL.md` §8, Fase 1 |
| Tutor IA (Gemini) + contexto de ubicación (unidad/actividad actual) | ✅ | `src/tutor/`, `docs/claude-code/informes/INFORME_2026-09-10_SESION_01.md` §3.3 |
| LearningProgress (mastery ponderado real) + ReviewSchedules (SM-2) | ✅ | `src/common/utils/mastery.calculator.ts`, `src/review-schedules/` |
| `passingScore` normalizado como porcentaje del `totalPoints` de cada actividad | ✅ | `docs/claude-code/informes/INFORME_2026-09-10_SESION_02.md` |
| Sandbox de ejecución de código endurecido (child process, no Docker/`vm`) | ✅ | `src/judge-engine/hardened-process-sandbox.adapter.ts` |
| Sandbox soporta lenguajes más allá de JavaScript | ❌ | `docs/00_VISION_FUNCIONAL.md` §9.2, punto 4 — sin resolver |
| Gamificación (badges, puntos, tablas de clasificación) | 🕐 | En pausa, decisión de alcance — `docs/00_VISION_FUNCIONAL.md` §8, Fase 3 |
| Bancos de preguntas reutilizables entre clases | 🕐 | En pausa, decisión de alcance — `docs/00_VISION_FUNCIONAL.md` §8, Fase 4 |
| Restricción real contra intentos activos duplicados (`submissions`) | ❌ | `startSubmission` (`src/submissions/submissions.service.ts:38-62`) solo comprueba en aplicación (`findActiveSubmission`) antes de crear — es un *check-then-act*, no hay índice único condicional en BD. `submission.entity.ts` solo tiene `@Index(['studentId','activityId'])`, no `@Unique`. Hallazgo `P1-07` del QA de Jorge (`docs/ReportesQA/`, 12/09) — verificado contra el código real el 14/09, es real. Plan: `docs/codex/PLAN_IMPLEMENTACION.md` Fase D |
| Emisión de `submission.graded` tras commit — orden correcto, sin outbox/retry | ⚠️ | `submitAnswers` (`submissions.service.ts:140-163`) ya comita la transacción **antes** de emitir el evento (comentario en código: "COMMIT PRIMERO"), así que el hallazgo `P1-08` del QA de Jorge ("se pierde si la transacción falla") describe el problema al revés de como está el código hoy. El riesgo real y más angosto que sigue abierto: si `emitAsync` falla o el proceso cae justo después del commit, no hay outbox/reintento — la submission queda `GRADED` en BD pero mastery/repasos pueden no haberse recalculado. Mitigación ligera (no outbox completo): `docs/codex/PLAN_IMPLEMENTACION.md` Fase F |

### 4.2 Tipos de Actividad y Evaluación

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| `mcq`, `fill_code`, `coding` — evaluador + pantalla real | ✅ | `src/evaluation-engine/strategies/`, `frontend-nuxt/components/exercise/` |
| `drag_drop`, `ordering`, `matching` — evaluador + pantalla real | ✅ | Construido por Antigravity, `docs/antigravity/PLAN_TIPOS_DE_ACTIVIDAD.md` |
| `ai_evaluated` — evaluador backend | ❌ | Sin evaluador registrado (`EvaluationEngineService` lanza `BadRequestException`); explícitamente fuera de alcance hasta que exista uno real |
| UX de resultado: puntaje real (`maxScore`) + dominio antes/después | ✅ | `docs/claude-code/informes/INFORME_2026-09-10_SESION_02.md` |

### 4.3 Multi-Docente y Matrícula

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Código de clase, unirse por código (`POST /enrollment/join`) | ✅ | `src/enrollment/` |
| Currículo real sembrado para las 3 clases (Toscano, Castro, Ali) | ✅ | `src/seeds/seed-runner.ts`, `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` §3.1 |
| Moderación de matrícula: `PENDING` + aprobar/rechazar + remover estudiante | ✅ | `EnrollmentStatus.PENDING`, `Class.requiresApproval`, endpoints en `enrollment.controller.ts`, UI en `/docente/clase/[classId].vue` |
| Pantalla de creación de clase para el docente (con toggle de `requiresApproval`) | ❌ | El botón "+ Crear Nueva Clase" en `/docente/index.vue` no tiene acción — no existe el formulario. El toggle de `requiresApproval` hoy solo se puede activar desde la página de gestión, sobre una clase ya creada por seed/API |
| Cerrar/terminar un curso | ✅ | `PATCH /class/:id` con `isActive:false` |

### 4.4 Motor de Recomendación por Dominio

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| `GET .../next-activity`: recomienda la actividad de menor `order` no aprobada | ✅ | `src/learning-progress/learning-progress.service.ts`, reutiliza `isSubmissionPassed` (misma fórmula que el mastery, no una reimplementación distinta) |
| Selector de autopercepción ("Elegir yo mismo") | ✅ | `frontend-nuxt/pages/estudiante/unidad/[id].vue` |
| Todas las pantallas de estudiante usan el mismo motor (sin heurísticos locales sueltos) | ✅ | Unificado en `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` §4.2 (Inicio usaba uno distinto; ya corregido) |
| Progresión de 3 pasos (mcq→fill_code→coding) también para actividades de Nivel 2 (`drag_drop`/`ordering`/`matching`) | ⚠️ | Hoy son ejemplos sueltos por unidad, no una secuencia — el motor de recomendación funciona igual con 1 sola actividad, pero no hay paridad de progresión con Nivel 1 |

### 4.5 Seguridad

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Selector de rol solo en modo demo, blindado a nivel de función (no solo de plantilla) | ✅ | `docs/claude-code/informes/INFORME_2026-09-10_SESION_01.md` §3.4 |
| BOLA en matrícula, progreso, y actividades por unidad | ✅ | `AuthorizationService.assertTeacherOwnsClass` / `assertEnrolledInClass`, usado consistentemente |
| `GET /learning-unit/:id` verifica matrícula/propiedad antes de responder | ✅ | `src/learning-unit/learning-unit.service.ts` (`findOne`/`assertCanReadClass`, mismo patrón que `ContentService`), cubierto por `learning-unit.service.spec.ts` — commit `b1bc096` |
| `POST /submissions/start` verifica matrícula activa antes de crear el intento | ❌ | `startSubmission` (`submissions.service.ts:38-62`) solo verifica que la actividad exista y el límite de intentos — nunca llama a `assertEnrolledInClass` ni equivalente. Un estudiante no matriculado que conozca un `activityId` puede iniciar un intento. Hallazgo `P2-R3` del QA de Jorge — verificado contra el código real el 14/09, es real. Plan: `docs/codex/PLAN_IMPLEMENTACION.md` Fase E |
| Chat del Tutor IA sanitiza el contenido antes de renderizarlo | ❌ | `TutorChatDrawer.vue:81` usa `v-html="formatMessage(msg.text)"`; `formatMessage` (líneas 176-182) solo hace reemplazos de markdown, nunca escapa el texto original — Self-XSS real. Hallazgo `P2-R4` del QA de Jorge — verificado contra el código real el 14/09. Plan: `docs/antigravity/PLAN_IMPLEMENTACION.md` §14 |
| Repositorio público — sin secretos en el historial | ✅ | `CLAUDE.md`, sección Seguridad y Datos |

### 4.6 Frontend

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Workspace de ejercicio — todos los tipos de pregunta implementados | ✅ | `frontend-nuxt/pages/estudiante/evaluacion/[activityId].vue` |
| "Probar código" y "Entregar solución" usan el sandbox/backend real, sin simulación en cliente | ✅ | `frontend-nuxt/stores/workspace.ts` — `runIsolatedCode()` llama a `POST /submissions/:id/run` real vía `useApi()`, `submitSolution()` a `POST /submissions/:id/submit` con `pollSubmissionStatus()` para calificación asíncrona real. **Nota (14/09):** el QA de Jorge (`docs/ReportesQA/`, 12/09) reportó `FE-01` (usa `new Function()`) y `FE-03` (sin polling) como abiertos — verificado contra el código real el 14/09, **ambos ya estaban resueltos desde el 09-10/09/2026** (commits `715b43b`, `29575e6`, `5310967`), antes de la fecha del propio reporte. Probablemente auditado contra un ZIP desactualizado, no contra `main`. Se corrige acá para que no se reabra por error. |
| Pantalla de Inicio del estudiante conectada a datos reales | ✅ | `frontend-nuxt/pages/estudiante/index.vue` |
| Pantalla de unidad conectada a datos reales (contenido + recomendación) | ✅ | `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` §4.2 |
| Panel de docente | ⚠️ | `DOC-V01` (`pages/docente/index.vue`) y la gestión de matrícula (`pages/docente/clase/[classId].vue`, Fase B de Codex) reales. Falta: creación de clase vía UI (ver 4.3, `FE-02`) y el resto de las ventanas ya diseñadas en Figma (`DOC-V02..V06`) — sin código todavía. Plan: `docs/antigravity/PLAN_IMPLEMENTACION.md` §14 |
| Panel de administrador | ⚠️ | Solo `ADM-V02` (`pages/admin/index.vue`, gestión de usuarios real, `GET /users`). `ADM-V01`/`ADM-V03` ya diseñadas en Figma, sin código. Plan: `docs/antigravity/PLAN_IMPLEMENTACION.md` §14 |

### 4.7 Despliegue

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Diagnóstico de viabilidad (frontend en Vercel, backend necesita proceso persistente + MariaDB real) | ✅ | El sandbox necesita spawnear procesos hijo reales (incompatible con serverless); NestJS corre `app.listen()` persistente, no handlers serverless |
| Autorización y ejecución del despliegue | ❌ | Bloqueado en autorización OAuth del dueño del proyecto (conector Vercel) |

---

## 5. Registro de Checkpoints

Cada vez que Claude Code actualiza el Checklist Maestro (§4) a partir de una verificación real,
queda un renglón aquí — mismo criterio de checkpoints fechados, sin borrar, que
`docs/00_VISION_FUNCIONAL.md` §9.

| Fecha | Qué cambió | Verificado por |
|---|---|---|
| 2026-09-11 | Creación de este documento. Checklist inicial construido a partir del estado real verificado en `docs/00_VISION_FUNCIONAL.md` §9.2-§9.4 y los informes de sesión de Claude Code del 2026-09-10 y 2026-09-11. | Claude Code (Sonnet 5) |
| 2026-09-11 | §4.5: `GET /learning-unit/:id` ahora verifica matrícula/propiedad (BOLA cerrado) — mismo patrón que `ContentService.assertCanReadClass`. `npm run build` limpio, suite completa 302/305 (3 fallos preexistentes en `hardened-process-sandbox.adapter.spec.ts`, flaky por contención de recursos al correr en paralelo — pasan 18/18 en aislado, no relacionados con este cambio). Commit `b1bc096`. | Claude Code (Sonnet 5) |
| 2026-09-14 | Cruce en frío de los hallazgos de la auditoría QA de Jorge Cervantes (`docs/ReportesQA/`, 12/09) contra el código real de `main`, hallazgo por hallazgo, antes de aceptarlos (regla de "hipótesis hasta verificar", `CLAUDE.md`). Confirmados reales y agregados al checklist: `P1-07` (§4.1, sin restricción real contra intentos activos duplicados), `P2-R3` (§4.5, `/submissions/start` sin verificar matrícula), `P2-R4` (§4.5, Self-XSS en `TutorChatDrawer.vue`). Matizado: `P1-08` (§4.1 — el commit de BD ya ocurre antes del evento, orden correcto; el riesgo real es más angosto, sin outbox/reintento). **Refutados** — verificado que ya estaban resueltos desde el 09-10/09, antes de la fecha del propio reporte de Jorge: `FE-01` y `FE-03` (§4.6) — probablemente un ZIP desactualizado, no `main`. `FE-02` confirma un hallazgo que este documento ya tenía registrado desde el 11/09 (creación de clase). `BE-01` ya estaba registrado (§4.2, `ai_evaluated`). Se agregó §6 "Hoja de ruta hacia el cierre" y se escribieron `docs/antigravity/PLAN_IMPLEMENTACION.md` §14 y nuevas fases en `docs/codex/PLAN_IMPLEMENTACION.md` a partir de este cruce. | Claude Code (Sonnet 5) |

---

## 6. Hoja de ruta hacia el cierre del proyecto

Lo que falta, agrupado por quién lo ejecuta — no una lista plana. Cada fase referenciada aquí tiene
su propio plan detallado (evidencia, contratos, criterio de cierre); esta tabla es el índice, no el
reemplazo de esos documentos.

### 6.1 Antigravity — frontend

| Fase | Qué | Plan detallado |
|---|---|---|
| §14.2 | Construir las ventanas de Docente/Administrador que ya existen en Figma pero no en código (`DOC-V02..V06`, `ADM-V01`, `ADM-V03`) | `docs/antigravity/PLAN_IMPLEMENTACION.md` §14.2 |
| §14.3 | Corregir el Self-XSS del chat del Tutor IA (`P2-R4`) | `docs/antigravity/PLAN_IMPLEMENTACION.md` §14.3 |
| §14.4 | Construir el formulario de "Crear Nueva Clase" (`FE-02`) | `docs/antigravity/PLAN_IMPLEMENTACION.md` §14.4 |

### 6.2 Codex — backend

| Fase | Qué | Plan detallado |
|---|---|---|
| D | Restricción real contra intentos activos duplicados (`P1-07`) | `docs/codex/PLAN_IMPLEMENTACION.md` Fase D |
| E | Verificar matrícula en `POST /submissions/start` (`P2-R3`) | `docs/codex/PLAN_IMPLEMENTACION.md` Fase E |
| F | Endurecer la emisión de `submission.graded` sin outbox completo (`P1-08`, mitigación ligera) | `docs/codex/PLAN_IMPLEMENTACION.md` Fase F |

### 6.3 Claude Code — pendientes sin plan delegable todavía

Estos ítems siguen sin un plan de ejecución porque su alcance no está definido, o la decisión no es
técnica sino del dueño del proyecto — no se le delega a otra herramienta un alcance que ni Claude
Code ha terminado de acotar:

- **Despliegue real** (§4.7) — bloqueado en autorización OAuth del dueño del proyecto (conector
  Vercel), no en código.
- **`ai_evaluated` sin evaluador** (§4.2, `BE-01`) — explícitamente fuera de alcance hasta que el
  equipo decida qué significa "evaluado por IA" en este proyecto; no se improvisa un evaluador solo
  para cerrar el hallazgo.
- **Sandbox en otros lenguajes además de JavaScript** — sin alcance definido (¿cuáles lenguajes?
  ¿por qué?); no es una tarea lista para delegar todavía.
- **Progresión de 3 pasos para Nivel 2** (`drag_drop`/`ordering`/`matching`, §4.4) — decisión de
  alcance pendiente, no una implementación bloqueada.

### 6.4 Regla de coordinación mientras las dos fases corren

Antigravity y Codex trabajan sobre superficies distintas esta vez (frontend de Docente/Admin +
Tutor IA vs. backend de `submissions`), pero **ambos planes lo declaran explícitamente** para que
ninguno pise el trabajo del otro por asumir que estaba solo en el repo. Ver la nota de coordinación
al inicio de cada plan.

---

## 7. Cómo usar este documento

- **Dueño del proyecto:** lee §4 para saber en qué estado real está el proyecto sin tener que
  preguntar. Si algo marcado ✅ no funciona en la práctica, repórtalo — se trata como hipótesis a
  verificar, no como un error de este documento a corregir a mano.
- **Al delegarle trabajo a Antigravity o Codex:** referencia este documento en el prompt para que la
  herramienta entienda el panorama completo, pero el plan de ejecución detallado sigue siendo un
  documento aparte (`docs/antigravity/PLAN_IMPLEMENTACION.md` o `docs/codex/PLAN_IMPLEMENTACION.md`)
  — este archivo no reemplaza esos planes, los indexa.
- **Al recibir una entrega de Antigravity o Codex:** el checklist no se actualiza hasta que Claude
  Code audite la entrega contra el código real (§3, "El ciclo, en resumen").
