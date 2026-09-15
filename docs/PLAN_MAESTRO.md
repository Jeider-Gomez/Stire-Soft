# STIRE — Plan Maestro de Implementación y Seguimiento

**Documento vivo. Última actualización: 2026-09-15 (segunda pasada del día).**

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
- **Libertad de diseño ampliada desde la Fase 16 (decisión del dueño del proyecto, 15/09):** cuando
  una ficha de diseño (`docs/modesec/ventanas/3.3.1_FICHAS_VENTANAS.md` o un README de
  `docs/modesec/usuarios/`) especifica en texto un formulario/pantalla que nadie dibujó como frame de
  Figma, Antigravity puede diseñarlo directamente — reutilizando tokens (`tailwind.config.ts`) y el
  patrón de componente más parecido que ya funcione, nunca inventando ambos a la vez. Sigue sin poder
  inventar contenido que ni la ficha ni el README especifican — ver
  `docs/antigravity/PLAN_IMPLEMENTACION.md` §16.0b para el criterio completo (mismo patrón que ya
  funcionó con `DOC-V03`/`DOC-V04`).
- **Libertad de backend ampliada, mismo día:** puede hacer ediciones **sencillas** de `src/` cuando
  las necesita para su propia pantalla (campo opcional aditivo, `GET` nuevo de solo lectura sobre
  datos ya calculados, fix aislado de forma de respuesta) — siempre con test propio y
  `npm run build`/`npm test` en verde, declarado aparte en su informe. Sigue sin poder tocar
  `src/submissions/`, `src/auth/`, `src/enrollment/`, migraciones, ni lógica de cálculo pedagógico —
  eso sigue siendo de Codex o de Claude Code sin excepción. Criterio completo en
  `docs/antigravity/PLAN_IMPLEMENTACION.md` §16.0c.

### Codex — fases delegadas de backend + frontend, invocado por criterio de Claude Code

- Ejecuta fases completas (backend y frontend) descritas en `docs/codex/PLAN_IMPLEMENTACION.md`, con
  mayor autonomía de implementación dentro del alcance y las restricciones que el plan fija.
- Su entrega se audita igual que la de Antigravity antes de aceptarse — ver
  `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` para un ejemplo completo del proceso
  (incluyendo un caso donde la entrega cumplía la estructura pedida pero no la intención).
- **Cuándo se invoca (decisión del dueño del proyecto, 15/09):** no en cada ronda, ni con una
  cadencia fija — queda a criterio de Claude Code, cuando aparece trabajo que de verdad amerita su
  autonomía y alcance (backend con reglas de negocio nuevas, migraciones, algo que cruza varios
  módulos) y que no cabe en la libertad sencilla que ahora tiene Antigravity (ver arriba). Si Claude
  Code decide que algo lo amerita, lo declara con evidencia — igual que cualquier otra fase — no se
  invoca "porque tocaba".

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
| Restricción real contra intentos activos duplicados (`submissions`) | ✅ | **Cerrado por Codex, 14/09** (Fase D). Migración `1789100000000-AddActiveSubmissionConstraint.ts` — columna generada + índice único condicional sobre `(studentId, activityId)` solo para `in_progress`. `startSubmission` captura `ER_DUP_ENTRY`/`23000` y relee el intento activo real en vez de fallar. Verificado por Claude Code el 14/09: código real presente, migración aplicada (`migration:show` la lista), suite de `submissions.service.spec.ts` en verde (24/24) — cierra `P1-07`. Commit `d5a481e` |
| Emisión de `submission.graded` — orden correcto + aislada de fallos de listeners | ✅ | **Cerrado por Codex, 14/09** (Fase F, mitigación ligera). `submitAnswers` (`submissions.service.ts`) ya comita la transacción antes de emitir (orden correcto — el hallazgo `P1-08` del QA de Jorge lo describía al revés); ahora además el `emitAsync` está en `try/catch` con logging, así que un listener que falle no convierte una calificación ya persistida en un error 500 para el estudiante. No implementa un outbox completo (decisión explícita, documentada en el propio código). Commit `d5a481e` |

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
| Pantalla de creación de clase para el docente | ✅ | **Cerrado por Antigravity, 14/09** (Fase 14). Modal en `pages/docente/index.vue` conectado a `POST /class` real. Verificado por Claude Code el 14/09 en navegador real (login docente, abrir modal, campos presentes) — cierra `FE-02`. El toggle `requiresApproval` sigue solo en la pantalla de gestión de una clase ya creada, no en el formulario de creación — no bloqueante. Commit `71360b7` |
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
| `POST /submissions/start` verifica matrícula activa antes de crear el intento | ✅ | **Cerrado por Codex, 14/09** (Fase E). `assertActiveEnrollment()` (`submissions.service.ts:358-365`) resuelve `activity→learningUnit→topic→section→classId` y exige `EnrollmentStatus.ACTIVE`; aplicado tanto en `startSubmission` (línea 51) como en el ensayo de código (línea 231). Verificado por Claude Code el 14/09 leyendo el código real (no solo el informe) — cierra `P2-R3`. Commit `d5a481e` |
| Chat del Tutor IA sanitiza el contenido antes de renderizarlo | ✅ | **Cerrado por Antigravity, 14/09** (Fase 14). `escapeHtml()` (`TutorChatDrawer.vue:176-183`) corre primero dentro de `formatMessage`, antes de los reemplazos de markdown. Verificado por Claude Code el 14/09 leyendo el código real — cierra `P2-R4`. Commit `71360b7` |
| Repositorio público — sin secretos en el historial | ✅ | `CLAUDE.md`, sección Seguridad y Datos |

### 4.6 Frontend

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Workspace de ejercicio — todos los tipos de pregunta implementados | ✅ | `frontend-nuxt/pages/estudiante/evaluacion/[activityId].vue` |
| "Probar código" y "Entregar solución" usan el sandbox/backend real, sin simulación en cliente | ✅ | `frontend-nuxt/stores/workspace.ts` — `runIsolatedCode()` llama a `POST /submissions/:id/run` real vía `useApi()`, `submitSolution()` a `POST /submissions/:id/submit` con `pollSubmissionStatus()` para calificación asíncrona real. **Nota (14/09):** el QA de Jorge (`docs/ReportesQA/`, 12/09) reportó `FE-01` (usa `new Function()`) y `FE-03` (sin polling) como abiertos — verificado contra el código real el 14/09, **ambos ya estaban resueltos desde el 09-10/09/2026** (commits `715b43b`, `29575e6`, `5310967`), antes de la fecha del propio reporte. Probablemente auditado contra un ZIP desactualizado, no contra `main`. Se corrige acá para que no se reabra por error. |
| Pantalla de Inicio del estudiante conectada a datos reales | ✅ | `frontend-nuxt/pages/estudiante/index.vue` |
| Pantalla de unidad conectada a datos reales (contenido + recomendación) | ✅ | `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` §4.2 |
| Panel de docente — 7 ventanas nuevas construidas | ⚠️ | **Antigravity** construyó `DOC-V02` (contenidos), `DOC-V03` (crear ejercicio), `DOC-V04` (rendimiento), `DOC-V05` (detalle de estudiante), `DOC-V06` (mensajes) (Fase 14, commit `71360b7`), y corrigió el bug de `DOC-V04` + auditó `DOC-V03`/`ADM-V03` con escritura real + selector de estudiante real en `DOC-V06` (Fase 15, commit `d6120ed`). Verificado en navegador real por Claude Code (14 y 15/09): `DOC-V02`, `DOC-V04`, `DOC-V05`, `DOC-V06` funcionan end-to-end con datos/mutaciones reales. `DOC-V03` verificado por el propio informe de Antigravity con creación real (`POST /activities` → 201 #60) — no re-verificado en navegador por Claude Code todavía. Sigue ⚠️ (no ✅) porque falta **edición** de contenido/actividades ya creadas — ver fila siguiente. |
| Editar (no solo crear) secciones, unidades y actividades desde la UI docente | ❌ | El backend ya expone `PATCH`/`DELETE` completos: `topic.controller.ts:71` (`PATCH /topic/:id`), `learning-unit.controller.ts:50` (`PATCH /learning-unit/:id`), `activities.controller.ts:50,60,69` (`PATCH /activities/:id`, `/publish`, `/archive`). Ninguno tiene UI todavía — `DOC-V02` solo publica/despublica secciones (`PATCH /sections/:id/publish`), `DOC-V03` solo crea. Verificado contra el código real el 15/09. Plan: `docs/antigravity/PLAN_IMPLEMENTACION.md` §16 |
| Panel de administrador | ⚠️ | `ADM-V02` (`pages/admin/index.vue`, gestión de usuarios real) sin cambios. **Antigravity, 14/09** construyó `ADM-V01` y `ADM-V03` como mockups explícitos — verificado en navegador real por Claude Code el 14/09: banner "Ejemplo — sin backend (D-03)" presente y visible en `ADM-V01`, tal como exige el plan. Siguen sin backend real detrás (decisión D-03, sin cambios). |
| Middleware de protección de rutas por rol en el frontend | ✅ | **Ya existía antes de la Fase 14** — `frontend-nuxt/middleware/auth.global.ts` (comentario propio: "Insumo 15 §5"), protege `/estudiante`, `/docente` y `/admin` por rol y redirige. Verificado en navegador real por Claude Code el 14/09: con sesión de docente, navegar a `/admin/dashboard` redirige a `/docente` automáticamente. **Corrección de récord:** el informe de Antigravity (`INFORME_2026-09-14_SESION_01.md` §6, punto 5) recomienda "añadir" este middleware como próximo paso — ya existe y ya funciona; no es trabajo pendiente, Antigravity no verificó su propio supuesto antes de recomendarlo. |

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
| 2026-09-14 (2ª pasada) | **Auditoría en vivo de las entregas de Antigravity (Fase 14, commit `71360b7`) y Codex (Fases D-F, commit `d5a481e`)** — backend y frontend reales levantados, login real como docente/admin/estudiante, navegación real, `curl` directo a los endpoints, y `npm test` completo. Cerrados y verificados: `P1-07`, `P1-08`, `P2-R3`, `P2-R4`, `FE-02` (ver filas de §4). Suite completa: 306/309 verdes; 3 fallos son `e2e-spec` no relacionados con submissions (auth rate-limit, escalada de privilegios, PATCH de actividades), los tres por timeout de 5000ms con dos servidores de desarrollo corriendo en paralelo en la misma máquina — mismo patrón de degradación bajo carga ya documentado en `CLAUDE.md`, no repetido en aislado por límite de tiempo de esta sesión. **Hallazgo nuevo real:** `DOC-V04` (Rendimiento) no funciona — desajuste de forma de datos entre `rendimiento.vue` y la respuesta real de `GET /analytics/class/:classId` (detalle en §4.6). **Corrección de récord:** la recomendación #5 del informe de Antigravity ("agregar middleware de rol") ya estaba resuelta antes de que empezara la Fase 14 (`middleware/auth.global.ts`) — verificado en navegador real. Ninguno de los dos informes de sesión se edita (regla de "nunca se editan después de escritos"); la corrección queda aquí. Se escribió `docs/antigravity/PLAN_IMPLEMENTACION.md` §15 a partir de esta auditoría. | Claude Code (Sonnet 5) |
| 2026-09-15 | **Auditoría en vivo de la Fase 15 de Antigravity (commit `d6120ed`, informe `INFORME_2026-09-14_SESION_02.md`).** Verificado contra el código real de `rendimiento.vue`: el fix de `DOC-V04` es correcto (`metrics.metrics.avgClassMastery`, `metrics.studentRankings`, `st.fullName` — coincide exactamente con el contrato real del backend). §4.6 actualizado: `DOC-V04` cierra ✅. Dueño del proyecto indicó que Codex se reserva para trabajo de mayor complejidad, después de 2-3 planes más de Antigravity — **no se escribieron fases nuevas de Codex esta pasada** (corrige la fila anterior, que mencionaba fases de Codex que nunca llegaron a redactarse). Se identificó un gap real y verificado contra código (`topic.controller.ts:71`, `learning-unit.controller.ts:50`, `activities.controller.ts:50,60,69` — todos con `PATCH`/`DELETE` reales sin UI): falta editar/archivar contenido ya creado desde la UI docente, no solo crearlo. Se escribió `docs/antigravity/PLAN_IMPLEMENTACION.md` §16. | Claude Code (Sonnet 5) |
| 2026-09-15 (2ª pasada) | **Reorganización y dos ampliaciones de libertad, pedidas por el dueño del proyecto.** (1) Se archivaron las Fases 1-15 de `docs/antigravity/PLAN_IMPLEMENTACION.md` a `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md` (regla ya existente en `docs/_archivo/README.md`, no aplicada hasta ahora) — el plan vigente queda corto, solo con la Fase 16 en adelante; numeración no reiniciada para no romper citas. (2) Antigravity puede ahora hacer ediciones sencillas de backend (campo opcional, `GET` de solo lectura sobre datos ya calculados, fix aislado de forma de respuesta) sin esperar una fase de Codex — con límites explícitos (`src/submissions/`, `src/auth/`, `src/enrollment/`, migraciones y lógica de cálculo siguen fuera, sin excepción) — ver `docs/antigravity/PLAN_IMPLEMENTACION.md` §16.0c. (3) Se corrige la fila anterior: no hay una cadencia fija de "2-3 rondas de Antigravity antes de Codex" — el dueño del proyecto delegó esa decisión al criterio de Claude Code, caso por caso (§6.2). | Claude Code (Sonnet 5) |

---

## 6. Hoja de ruta hacia el cierre del proyecto

Lo que falta, agrupado por quién lo ejecuta — no una lista plana. Cada fase referenciada aquí tiene
su propio plan detallado (evidencia, contratos, criterio de cierre); esta tabla es el índice, no el
reemplazo de esos documentos.

### 6.0 Fases cerradas y verificadas — ya no son trabajo pendiente

| Fase | Qué | Verificación |
|---|---|---|
| Antigravity §14 | 7 ventanas de Docente/Admin, fix XSS, fix "Crear Nueva Clase" | ✅ Auditado en vivo por Claude Code, 14/09 |
| Antigravity §15 | Fix `DOC-V04`, auditoría con escritura real de `DOC-V03`/`ADM-V03`, selector de estudiante en `DOC-V06`, limpieza de clases de prueba | ✅ Auditado en vivo por Claude Code, 15/09 — ver §5 |
| Codex D/E/F | Intentos duplicados, matrícula, evento de calificación | ✅ Auditado en vivo por Claude Code — código real + suite de tests en verde. Ver §5 |

### 6.1 Antigravity — frontend (siguiente entrega)

| Fase | Qué | Plan detallado |
|---|---|---|
| §16.1 | Editar/archivar secciones, unidades y actividades desde la UI docente (el backend ya lo soporta; hoy solo se puede crear) | `docs/antigravity/PLAN_IMPLEMENTACION.md` §16.1 |
| §16.2 | Verificar el enlace "Ver detalle" de `DOC-V04` hacia `DOC-V05` (pendiente desde el informe de la propia Antigravity) | `docs/antigravity/PLAN_IMPLEMENTACION.md` §16.2 |
| §16.3 | Auditoría de accesibilidad (WCAG 2.1 AA) de las 7 ventanas nuevas — el pie de página lo declara, nadie lo verificó todavía | `docs/antigravity/PLAN_IMPLEMENTACION.md` §16.3 |

### 6.2 Codex — se invoca por criterio, no por cadencia fija

**Decisión explícita del dueño del proyecto (15/09, ajustada el mismo día):** no hay un número fijo
de rondas de Antigravity antes de Codex — queda a criterio de Claude Code, cuando aparece trabajo de
backend que de verdad amerita la autonomía y el alcance de Codex (reglas de negocio nuevas,
migraciones, algo que cruza varios módulos) y que no cabe en la libertad de ediciones sencillas que
ahora tiene Antigravity (§3, "Libertad de backend ampliada"). No hay fases nuevas de Codex escritas
todavía. Candidatos ya identificados para cuando el criterio de Claude Code determine que amerita una
fase (sin plan redactado, solo el gap real detectado): cobertura de tests para `src/message/` (no
tiene ninguna hoy) y sembrar la progresión de 3 pasos para actividades de Nivel 2
(`drag_drop`→`ordering`→`matching`, §4.4) — ninguno de los dos es una "edición sencilla" porque
tocan alcance más amplio que una sola pantalla.

### 6.3 Orden de ejecución recomendado

**Antigravity, en el orden §16.1 → §16.2 → §16.3.** Razón: §16.1 (editar/archivar contenido) es la
pieza de mayor valor real — sin ella el docente no puede corregir un error en una actividad ya
creada, solo crear una nueva; §16.2 es una verificación de 5 minutos que ya estaba pendiente;
§16.3 es la más nueva y la que menos urge (nadie reportó un problema de accesibilidad todavía, es una
verificación preventiva). Codex sigue fuera de esta ronda (§6.2).

### 6.4 Claude Code — pendientes sin plan delegable todavía

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

> **Actualización 14/09:** "Progresión de 3 pasos para Nivel 2" salió de esta lista — ya tiene
> alcance definido y es la Fase H de Codex (§6.2). Las pantallas ya existen (§4.2); lo que faltaba
> era contenido sembrado en la secuencia correcta, que sí es delegable.

### 6.5 Regla de coordinación (histórica, para cuando Codex vuelva a estar activo)

En la ronda de las Fases 14/15 (Antigravity) y D/E/F (Codex), ambas herramientas trabajaron en
paralelo sobre superficies distintas (frontend de Docente/Admin + Tutor IA vs. backend de
`submissions`), y cada plan declaró explícitamente esa frontera para que ninguna pisara el trabajo de
la otra. Con Codex reservado (§6.2), esta ronda de Antigravity no tiene una contraparte corriendo en
paralelo — pero cuando Codex retome, la misma regla aplica: el plan que se le escriba debe declarar
qué archivos no toca.

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
