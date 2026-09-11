# STIRE — Plan Maestro de Implementación y Seguimiento

**Documento vivo. Última actualización: 2026-09-11.**

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

Estado verificado contra el código real al 2026-09-11. `✅` = verificado en código y, cuando aplica,
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
| `GET /learning-unit/:id` verifica matrícula/propiedad antes de responder | ❌ | Hallazgo reciente, no explotado ni corregido todavía — `GET /content/unit/:id` sí lo hace, este endpoint hermano no |
| Repositorio público — sin secretos en el historial | ✅ | `CLAUDE.md`, sección Seguridad y Datos |

### 4.6 Frontend

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Workspace de ejercicio — todos los tipos de pregunta implementados | ✅ | `frontend-nuxt/pages/estudiante/evaluacion/[activityId].vue` |
| Pantalla de Inicio del estudiante conectada a datos reales | ✅ | `frontend-nuxt/pages/estudiante/index.vue` |
| Pantalla de unidad conectada a datos reales (contenido + recomendación) | ✅ | `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` §4.2 |
| Panel de docente | ⚠️ | Lista de clases y gestión de matrícula reales; falta creación de clase (ver 4.3) y edición de contenido/actividades vía UI (existe por API) |
| Panel de administrador | ⚠️ | Gestión de usuarios real (`GET /users`); no auditado más allá de eso en esta pasada |

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

---

## 6. Cómo usar este documento

- **Dueño del proyecto:** lee §4 para saber en qué estado real está el proyecto sin tener que
  preguntar. Si algo marcado ✅ no funciona en la práctica, repórtalo — se trata como hipótesis a
  verificar, no como un error de este documento a corregir a mano.
- **Al delegarle trabajo a Antigravity o Codex:** referencia este documento en el prompt para que la
  herramienta entienda el panorama completo, pero el plan de ejecución detallado sigue siendo un
  documento aparte (`docs/antigravity/PLAN_IMPLEMENTACION.md` o `docs/codex/PLAN_IMPLEMENTACION.md`)
  — este archivo no reemplaza esos planes, los indexa.
- **Al recibir una entrega de Antigravity o Codex:** el checklist no se actualiza hasta que Claude
  Code audite la entrega contra el código real (§3, "El ciclo, en resumen").
