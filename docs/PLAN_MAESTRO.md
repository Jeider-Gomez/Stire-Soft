# STIRE — Plan Maestro de Implementación y Seguimiento

**Documento vivo. Última actualización: 2026-09-19 (2ª pasada).**

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
  `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` §16.0b para el criterio completo (mismo patrón que ya
  funcionó con `DOC-V03`/`DOC-V04`).
- **Libertad de backend ampliada, mismo día:** puede hacer ediciones **sencillas** de `src/` cuando
  las necesita para su propia pantalla (campo opcional aditivo, `GET` nuevo de solo lectura sobre
  datos ya calculados, fix aislado de forma de respuesta) — siempre con test propio y
  `npm run build`/`npm test` en verde, declarado aparte en su informe. Sigue sin poder tocar
  `src/submissions/`, `src/auth/`, `src/enrollment/`, migraciones, ni lógica de cálculo pedagógico —
  eso sigue siendo de Codex o de Claude Code sin excepción. Criterio completo en
  `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` §16.0c.

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
| Tutor IA — acompañante proactivo (saludo real, sugerencia de ejercicios, detección de intención) | ✅ | **Cerrado por Claude Code, 15-16/09** (pausa técnica, `docs/00_VISION_FUNCIONAL.md` §9.5). `TutorRecommendationService` (nuevo) convierte repasos vencidos y mastery por unidad en una sugerencia real; `GET /tutor/greeting` saluda primero citando datos reales; `POST /tutor/chat` detecta intención explícita de practicar (regex, sin costo de LLM) y adjunta una tarjeta de actividad. El diseño inicial (marcador oculto `[[LISTO_PARA_PRACTICAR]]` interpretado por el backend) se descartó tras feedback del dueño del proyecto por sentirse rígido/"evaluativo" y gastar tokens de más — se reemplazó por una sugerencia conversacional natural del propio LLM, sin parsing. Verificado en navegador real (login estudiante, saludo con repaso vencido real, tarjeta clicable que navega al ejercicio). 31/31 tests, build y typecheck limpios. |
| Tutor IA — Gemini con la clave gratuita de Google AI Studio de cada estudiante; sin respuesta simulada; historial legible | ✅ | **Backend hecho y verificado por Claude Code, 19/09** (ADR 10): tabla `tutor_credentials` (migración `1789200000000`, aplicada en la BD local), clave cifrada AES-256-GCM con `TUTOR_KEY_ENCRYPTION_SECRET` (falla cerrado), verificación contra Google al guardarla; `GET/PUT/DELETE /tutor/api-key` y `GET /tutor/history`; errores `428/422/429/503`; se retiró OpenAI y `mockLlmInference`; corregidos el mensaje duplicado que veía el LLM (historial leído antes de guardar) y la sugerencia que confiaba en el `learningUnitId` del cliente (ahora exige lectura de la unidad, igual que `GET /learning-unit/:id`). Build limpio y 47/47 suites, 365/365 tests; en vivo contra el backend real: `GET api-key` → `hasKey:false`, `PUT` con clave falsa → 422 real de Google, `chat` sin clave → 428, `history`/`greeting` OK, sin token → 401. **No verificado:** el camino feliz con una clave real de Google (nadie del equipo la había pegado aún) — lo cubre el criterio de cierre de la §19 del plan de Antigravity. Interfaz pendiente: Fase 19. **Actualización 20/09 (Claude Code):** la interfaz de la Fase 19 la entregó Antigravity (commit `8e385c3`) y se vio funcionando en navegador real: sin clave el Tutor muestra los pasos para conseguirla, y una clave inventada la rechaza Google con un mensaje claro (`docs/material-visual/00-primera-version/`, capturas 08 y 09). **Camino feliz verificado con una clave real de Google el 20/09**, a nivel de API: la clave se acepta (formato `AQ.…`, no solo `AIza…`), el Tutor responde en español y de forma socrática, el historial se lee y la clave se borró después sin dejar rastro. **Actualización 21/09 (Claude Code): recorrido completo desde la interfaz, en navegador real, con la clave de prueba del dueño** (no se guardó en ningún archivo y se borró al terminar). Sin clave se ve el panel con los pasos; una clave inventada muestra «Google no reconoce esa clave…»; una demasiado corta, «La clave tiene una longitud inválida»; la real se guarda (el campo es de tipo `password` y la pantalla solo muestra «••••wC9Q»), el panel se cierra y aparece el chat; el Tutor responde en español y de forma socrática; «Mi clave» → «Quitar mi clave» la borra y vuelve el formulario. **Defecto hallado y corregido:** el `.env` local del dueño **no tenía `TUTOR_KEY_ENCRYPTION_SECRET`**, así que guardar una clave válida daba 503 y la pantalla decía «inténtalo de nuevo en un minuto» aunque nunca iba a funcionar. Ahora el backend avisa **al arrancar** si el secreto falta o es inválido, el mensaje al estudiante ya no menciona variables de entorno («reintentar no lo arregla») y la interfaz muestra el mensaje real del servidor en el 503; se agregó un secreto local al `.env` (no versionado). **Observación, sin cambiar (decisión del dueño):** el Tutor tardó de 7 a 31 s en responder; es Google Gemini gratuito con carga: `gemini-flash-latest` da timeout a los 15 s y el backend reintenta con el siguiente modelo, mientras que `gemini-3.5-flash-lite` contestó en 0,5–1 s. Ponerlo primero lo haría casi instantáneo a cambio de una calidad que no se ha medido. |
| Tutor IA — experiencia de chat (errores legibles, accesibilidad, scroll, Markdown, espera, móvil, historial) | ⚠️ | Auditado contra código real el 19/09: `stores/tutor.ts:110` lee `err.data.message` pero el filtro global responde `error` (el estudiante ve texto crudo de ofetch); cero manejadores de Escape en todo el frontend aunque el botón promete "(Esc)"; drawer sin `role="dialog"`/`aria-*`; scroll solo al enviar; bloques ``` rotos; input de 12 px (zoom en iOS). Plan: `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` §18. **Actualización 20/09:** entregado por Antigravity en la Fase 18 (commit `8e385c3`). Claude Code solo confirmó en navegador que el panel se abre como `dialog` con nombre accesible y muestra los chips de nivel; **sin auditar aún:** Escape, scroll, Markdown, estados de espera y móvil. |
| Tutor IA — nivel de guía automático, configuración del docente (clase/unidad/actividad) y barrera anti-solución | ✅ backend / ⚠️ interfaz | **Backend hecho y verificado por Claude Code, 19/09** (ADR 11): `tutor-guidance.ts` (0–1 intentos fallidos → nivel 1, 2–3 → 2, 4+ → 3, calculado con `learning-progress.service.ts` `countFailedAttempts`); tabla `tutor_settings` (migración `1789300000000`, aplicada en la BD local) con `GET/PUT /tutor/settings/:scopeType/:scopeId` — activar/desactivar, tope de ayuda 1–3 y estilo cerrado (sin texto libre), el más específico manda, y en el chat general lo más estricto entre las clases del estudiante; `tutor-solution-guard.ts` (solo dentro de una actividad: omite volcados de más de 20 líneas y programas que leen y escriben la entrada estándar, salvo el propio código del estudiante). **En vivo contra el backend real:** un docente ajeno recibe 403 al tocar la clase de otro; el estudiante recibe 403 en los endpoints de docente; un estilo libre da 400; clase y unidad respetan la precedencia; con la unidad desactivada el chat de esa actividad da 403 *antes* de pedir la clave mientras el chat general sigue; la limpieza dejó la BD como estaba. Build limpio, 385+ tests. **No verificado:** el efecto real de la barrera sobre respuestas de un Gemini de verdad (probada solo con respuestas simuladas). Interfaces: Fases 18 (§18.4) y 20. **Actualización 20/09:** el panel del docente (Fase 20) se ve funcionando en navegador real y calcula el «Resultado para tus estudiantes» (captura 13). **Barrera anti-solución verificada con Gemini real:** de 4 peticiones agresivas («ignora tus instrucciones», «soy el docente», «un ejemplo idéntico», programa largo) el modelo se negó a 3 y a la 4.ª escribió un programa completo con la estructura de la solución, que la barrera cortó («[Bloque de código omitido…]»). Matiz: cortó un ejemplo *análogo* (contar números), posible falso positivo — costo aceptado de una heurística. |
| Tutor IA — "Ir al contenido" y repasos vencidos dentro del chat | ✅ | **Dentro del alcance del "100% del Tutor"** por decisión del dueño (19/09). **Actualización 20/09:** diseñado e implementado en el backend, ampliando `GET /tutor/guidance` (sin efectos secundarios, a diferencia del saludo) con `dueReviews` (repasos vencidos, sin LLM) y `contentLink` (unidad de la actividad, decidida en el servidor y solo si el estudiante puede leerla). Verificado en vivo: unidad ajena, ids basura y Tutor desactivado devuelven `null` sin error. Interfaz: Fase 21 de Antigravity (T4). **Auditoría de la interfaz (Fase 21, 20/09, navegador real):** funciona con clave guardada — el aviso sale con el texto correcto y «Ir al contenido de la unidad» lleva a `/estudiante/unidad/24` desde la actividad 44. **Defecto:** ambos están dentro del bloque del chat, que no se dibuja mientras se muestra el panel de la clave, así que un estudiante sin clave (el estado inicial de todos) no los ve; y el contenido de una actividad anterior se arrastra al inicio al navegar sin recargar. Ambos pasan a la Fase 22 (T1 y T3). **Fase 22 (21/09), auditada en navegador real:** el aviso de repasos sale encima del formulario de la clave y el botón de la unidad (ahora «Ver unidad», con el nombre completo en su `aria-label`) aparece sin clave y lleva a `/estudiante/unidad/24`; al volver a `/estudiante` sin recargar ya no se pide `activityId`; con clave no se duplica el aviso; con el Tutor desactivado por el docente desaparecen aviso y botón y sale «Tu docente desactivó el Tutor…». |
| LearningProgress (mastery ponderado real, con penalización por repetición trivial) + ReviewSchedules (SM-2) | ✅ | **Ampliado por Claude Code, 15-16/09** (misma pausa técnica). `mastery.calculator.ts`: una actividad `Difficulty.BASICO` repetida más de 2 veces descuenta el score que cuenta para el Mastery (piso 50%, nunca cero); `INTERMEDIO`/`AVANZADO` no se penaliza. 6 tests nuevos (`mastery.calculator.spec.ts`), suite completa en verde. |
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
| Categorías reales de peso examen vs. práctica (`ActivityType.baseWeight` distinto por tipo) | ✅ | **Cerrado por Antigravity, 16/09** (Fase 17, commit `4f02b4d`). `TALLER` (1.5×) y `PARCIAL` (3.0×) sembrados de forma aditiva junto a `AUTO-EVAL` (1.0×, renombrado cosméticamente a "Práctica Formativa"); selector visible en crear/editar actividad (`crear.vue`). Verificado por Claude Code: diff real del seed confirma que las 15 actividades preexistentes no fueron reasignadas; fix necesario en `activities.service.ts` (TypeORM priorizaba `activity.activityType` cacheado sobre el `activityTypeId` nuevo en `PATCH`) es real y correcto, 32/32 tests reproducidos de forma independiente. |
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
| BOLA sistemático en los ~11 módulos backend restantes + rate-limiting específico | ✅ | **Cerrado por Codex, 16/09** (Fase G, commit `899b2e0`). Hallazgo real cerrado: `GET /activity-questions/activity/:id` no exigía matrícula activa del estudiante — cualquier autenticado podía enumerar preguntas de una clase ajena (redactadas, pero visibles). Ahora exige `assertEnrolledInClass` + actividad `PUBLISHED` (403/404 según corresponda). Rate-limiting específico agregado en registro, matrícula por código, mensajería, inicio de submission, sandbox y limpieza admin. 9 módulos restantes revisados sin hallazgo nuevo (documentado, no repetir). Verificado por Claude Code: diff real revisado, build limpio, 49/49 tests reproducidos de forma independiente. |

### 4.6 Frontend

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Workspace de ejercicio — todos los tipos de pregunta implementados | ✅ | `frontend-nuxt/pages/estudiante/evaluacion/[activityId].vue` |
| "Probar código" y "Entregar solución" usan el sandbox/backend real, sin simulación en cliente | ✅ | `frontend-nuxt/stores/workspace.ts` — `runIsolatedCode()` llama a `POST /submissions/:id/run` real vía `useApi()`, `submitSolution()` a `POST /submissions/:id/submit` con `pollSubmissionStatus()` para calificación asíncrona real. **Nota (14/09):** el QA de Jorge (`docs/ReportesQA/`, 12/09) reportó `FE-01` (usa `new Function()`) y `FE-03` (sin polling) como abiertos — verificado contra el código real el 14/09, **ambos ya estaban resueltos desde el 09-10/09/2026** (commits `715b43b`, `29575e6`, `5310967`), antes de la fecha del propio reporte. Probablemente auditado contra un ZIP desactualizado, no contra `main`. Se corrige acá para que no se reabra por error. |
| Pantalla de Inicio del estudiante conectada a datos reales | ✅ | `frontend-nuxt/pages/estudiante/index.vue` |
| Pantalla de unidad conectada a datos reales (contenido + recomendación) | ✅ | `docs/claude-code/informes/INFORME_2026-09-11_SESION_01.md` §4.2 |
| Panel de docente — 7 ventanas nuevas construidas | ⚠️ | **Antigravity** construyó `DOC-V02` (contenidos), `DOC-V03` (crear ejercicio), `DOC-V04` (rendimiento), `DOC-V05` (detalle de estudiante), `DOC-V06` (mensajes) (Fase 14, commit `71360b7`), y corrigió el bug de `DOC-V04` + auditó `DOC-V03`/`ADM-V03` con escritura real + selector de estudiante real en `DOC-V06` (Fase 15, commit `d6120ed`). Verificado en navegador real por Claude Code (14 y 15/09): `DOC-V02`, `DOC-V04`, `DOC-V05`, `DOC-V06` funcionan end-to-end con datos/mutaciones reales. `DOC-V03` verificado por el propio informe de Antigravity con creación real (`POST /activities` → 201 #60) — no re-verificado en navegador por Claude Code todavía. Sigue ⚠️ (no ✅) porque falta **edición** de contenido/actividades ya creadas — ver fila siguiente. |
| Editar (no solo crear) secciones, unidades y actividades desde la UI docente | ✅ | **Cerrado por Antigravity, 15/09** (Fase 16, commit `04c9911`). `DOC-V02` (`contenidos.vue`): modales de edición de Topic (`PATCH /topic/:id`) y LearningUnit (`PATCH /learning-unit/:id`), archivar Topic (`DELETE /topic/:id`) con confirmación — `DELETE /learning-unit/:id` deliberadamente no expuesto (solo admin). `DOC-V03` (`ejercicios/crear.vue`): tabla de actividades existentes con Editar/Publicar/Archivar (`PATCH /activities/:id`, `/publish`, `/archive`). Verificado por Claude Code el 15/09: `grep` confirma las llamadas reales a `api.patch`/`api.del` en ambos archivos (líneas 465, 508 de `contenidos.vue`; 592, 634, 676 de `crear.vue`), `npx nuxi typecheck` exit code 0 reproducido de forma independiente. No re-verificado en navegador por Claude Code (el informe de Antigravity sí lo hizo, con capturas de los banners de confirmación reales) — grep + typecheck fue suficiente porque el patrón (llamada a `api.patch`/`api.del` con el endpoint correcto) es el mismo que ya se verificó en navegador para Fases 14/15. |
| Enlace `DOC-V04` → `DOC-V05` con `studentId` real | ✅ | **Cerrado por Antigravity, 15/09** (Fase 16, commit `04c9911`). Verificado por Claude Code: `rendimiento.vue:213` usa `:to="\`/docente/estudiante/${st.studentId}\`"`, consistente con `[studentId].vue` consumiendo `GET /analytics/student/:studentId`. |
| Accesibilidad WCAG 2.1 AA en las 7 ventanas nuevas de Docente/Admin | ✅ | **Auditado y corregido por Antigravity, 15/09** (Fase 16, commit `04c9911`). Hallazgos y correcciones documentados en `docs/antigravity/informes/INFORME_2026-09-15_SESION_03.md` §3 (labels sin `for`/`id`, modales sin `role="dialog"`/`aria-modal`, botones sin `aria-label`, tablas sin `scope="col"`). Verificado por Claude Code con grep dirigido sobre 2 de los 8 hallazgos reportados (`role="dialog"`/`aria-modal`/`aria-labelledby` en los 3 modales de `contenidos.vue`, `for`/`id` del selector de clase en `rendimiento.vue`) — coinciden exactamente con lo declarado. Los otros 6 hallazgos (DOC-V06, ADM-V01, ADM-V03, DOC-V01) no se re-verificaron línea por línea, solo se aceptó el patrón por consistencia con los verificados. |
| Panel de administrador | ✅ | `ADM-V02` (`pages/admin/index.vue`, gestión de usuarios real) sin cambios. **Antigravity, 14/09** construyó `ADM-V01` y `ADM-V03` como mockups explícitos — verificado en navegador real por Claude Code el 14/09: banner "Ejemplo — sin backend (D-03)" presente y visible en `ADM-V01`, tal como exige el plan. Siguen sin backend real detrás (decisión D-03, sin cambios). **Actualización 20/09:** ya hay backend real detrás — `GET /admin/system/status` (latencia real, BD, sandbox, cola, Tutor, usuarios) y `GET /admin/system/logs` (últimos 500 eventos con secretos redactados), solo `admin`, verificados en vivo (401/403/200). Las dos pantallas siguen mostrando las cifras falsas hasta que Antigravity las conecte: Fase 21, T1 y T2. **Fase 21 entregada y auditada (20/09):** `ADM-V01` y `ADM-V03` muestran ya lo que devuelve la API (verificado: usuarios, versión, modelo y límites del sandbox coinciden; refresco de 30 s; filtro de eventos; cancelar no ejecuta; una limpieza que falla muestra el error real). Corregidos por Claude Code (`e6f4296`, `cd16613`): el diálogo de limpieza mentía sobre lo que hace (**la limpieza real pone nota 0 a respuestas y entregas de estudiantes**), un `null` se mostraba como «0», y una alarma de degradación aparecía sin datos. **Fase 22 (21/09):** las insignias «✔» dependen ahora de `database.ok` (verificado con la base caída simulada: desaparecen y salen «— Sin datos»); el diálogo de limpieza atrapa Tab, `Escape` cierra sin enviar nada y el foco vuelve al botón. **Backend corregido (21/09):** `POST /maintenance/cleanup` ya no responde éxito si la limpieza falla: devuelve 500 con un mensaje claro y, si funciona, cuántas respuestas y entregas tocó (`runCleanup` lanza; el cron sigue sin propagar el error). Con tests. |
| Middleware de protección de rutas por rol en el frontend | ✅ | **Ya existía antes de la Fase 14** — `frontend-nuxt/middleware/auth.global.ts` (comentario propio: "Insumo 15 §5"), protege `/estudiante`, `/docente` y `/admin` por rol y redirige. Verificado en navegador real por Claude Code el 14/09: con sesión de docente, navegar a `/admin/dashboard` redirige a `/docente` automáticamente. **Corrección de récord:** el informe de Antigravity (`INFORME_2026-09-14_SESION_01.md` §6, punto 5) recomienda "añadir" este middleware como próximo paso — ya existe y ya funciona; no es trabajo pendiente, Antigravity no verificó su propio supuesto antes de recomendarlo. |

### 4.7 Despliegue

| Ítem | Estado | Evidencia / detalle |
|---|:---:|---|
| Diagnóstico de viabilidad (frontend en Vercel, backend necesita proceso persistente + MariaDB real) | ✅ | El sandbox necesita spawnear procesos hijo reales (incompatible con serverless); NestJS corre `app.listen()` persistente, no handlers serverless |
| Decisión de arquitectura de hosting (19/09) | ✅ | `docs/ADR_DECISIONES_ARQUITECTURA.md` ADR 09 — frontend sigue en Vercel; backend + MariaDB se despliegan en una plataforma con proceso persistente (Railway recomendado, VM gratuita con el `docker-compose.yml` existente como alternativa sin costo); el sandbox se mantiene local (`HardenedProcessSandboxAdapter`, ADR 06), no se reemplaza por una API externa de terceros; Redis/BullMQ no se activa en producción (`InlineJudgeQueueAdapter`, ADR 08, sigue siendo suficiente) |
| Endurecimiento HTTP previo al despliegue (20/09) | ✅ | `helmet` (X-Content-Type-Options, HSTS, X-Frame-Options, Referrer-Policy, sin X-Powered-By) y Swagger `/docs` apagado cuando `NODE_ENV=production` (`SWAGGER_ENABLED=true|false` lo fuerza). Commit `0ab0f0f`. **Verificado en vivo con el backend en modo producción:** `/docs` responde 404, llegan las cabeceras y CORS sigue intacto. Se retiró también la dependencia `openai` (`5c464fc`). Se subió también `mysql2` 3.19.1 → 3.24.4 (`b369243`), que cerraba dos avisos de `npm audit` (degradación de autenticación que puede filtrar la contraseña de la base ante un servidor falso, y bomba de descompresión). **`npm run verify:clean` pasó con código 0 el 20/09 tras el último cambio del lockfile** (salida literal en `CHANGELOG.md`; la primera corrida de la ola había fallado por un arranque en frío de 73,9 s contra un límite de 60 s, causa medida y documentada ahí). **Vulnerabilidades que quedan (`npm audit --omit=dev`, 18):** ninguna alcanzable en tiempo de ejecución que se haya identificado — `tar` viene de herramientas de compilación de `sqlite3` (solo desarrollo) y no se descomprime nada no confiable; `multer` está instalado pero la app no recibe archivos; los avisos de `@nestjs/*` derivan de ahí y solo se cierran con Nest 12 (cambio mayor, fuera de la beta). Es una lectura, no una auditoría independiente. |
| Ejecución del despliegue | ❌ | Tarea de esta semana, `S06-J03` (Jeider) — crear la cuenta elegida, configurar variables de entorno, desplegar backend real y verificar login contra el entorno desplegado. Autorización OAuth del conector de Vercel sigue pendiente, ahora acotada solo al frontend |

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
| 2026-09-15 | **Auditoría en vivo de la Fase 15 de Antigravity (commit `d6120ed`, informe `INFORME_2026-09-14_SESION_02.md`).** Verificado contra el código real de `rendimiento.vue`: el fix de `DOC-V04` es correcto (`metrics.metrics.avgClassMastery`, `metrics.studentRankings`, `st.fullName` — coincide exactamente con el contrato real del backend). §4.6 actualizado: `DOC-V04` cierra ✅. Dueño del proyecto indicó que Codex se reserva para trabajo de mayor complejidad, después de 2-3 planes más de Antigravity — **no se escribieron fases nuevas de Codex esta pasada** (corrige la fila anterior, que mencionaba fases de Codex que nunca llegaron a redactarse). Se identificó un gap real y verificado contra código (`topic.controller.ts:71`, `learning-unit.controller.ts:50`, `activities.controller.ts:50,60,69` — todos con `PATCH`/`DELETE` reales sin UI): falta editar/archivar contenido ya creado desde la UI docente, no solo crearlo. Se escribió `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` §16. | Claude Code (Sonnet 5) |
| 2026-09-15 (2ª pasada) | **Reorganización y dos ampliaciones de libertad, pedidas por el dueño del proyecto.** (1) Se archivaron las Fases 1-15 de `docs/antigravity/PLAN_IMPLEMENTACION.md` a `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md` (regla ya existente en `docs/_archivo/README.md`, no aplicada hasta ahora) — el plan vigente queda corto, solo con la Fase 16 en adelante; numeración no reiniciada para no romper citas. (2) Antigravity puede ahora hacer ediciones sencillas de backend (campo opcional, `GET` de solo lectura sobre datos ya calculados, fix aislado de forma de respuesta) sin esperar una fase de Codex — con límites explícitos (`src/submissions/`, `src/auth/`, `src/enrollment/`, migraciones y lógica de cálculo siguen fuera, sin excepción) — ver `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` §16.0c. (3) Se corrige la fila anterior: no hay una cadencia fija de "2-3 rondas de Antigravity antes de Codex" — el dueño del proyecto delegó esa decisión al criterio de Claude Code, caso por caso (§6.2). | Claude Code (Sonnet 5) |
| 2026-09-15 (3ª pasada) | **Auditoría de la Fase 16 de Antigravity (commit `04c9911`, informe `INFORME_2026-09-15_SESION_03.md`) y decisión de invocar Codex.** Verificado contra código real: llamadas `api.patch`/`api.del` reales en `contenidos.vue` (líneas 465, 508) y `crear.vue` (líneas 592, 634, 676), enlace `DOC-V04`→`DOC-V05` con `studentId` real (`rendimiento.vue:213`), `npx nuxi typecheck` exit 0 reproducido de forma independiente, y spot-check de 2 de 8 hallazgos WCAG declarados (coinciden). §4.6 actualizado: la fila "editar contenido" cierra ✅, se agregan filas para el enlace y la auditoría WCAG. **Hallazgo de proceso:** el commit de Antigravity incluyó `src/message/message.service.spec.ts` — un borrador que Claude Code había escrito antes de que se pidiera reservar Codex, nunca comiteado a propósito; quedó dentro del commit de Antigravity de todas formas (probablemente un `git add` amplio de su parte). El archivo en sí es correcto (7/7 tests en verde, verificado con `npx jest`), así que no se revierte, pero deja sin efecto uno de los dos candidatos de Codex que este documento tenía pendientes ("cobertura de tests de `src/message/`" ya no es un gap). Se investigó también el otro candidato (progresión de 3 pasos de Nivel 2, §4.4) hasta el fondo: las 3 actividades existentes no están sueltas al azar, cada una vive en la unidad de su propio tema (arreglos/bucles/funciones) — una secuencia real de 3 pasos exige una decisión de diseño instruccional (mezclar contenido que no encaja, o escribir contenido nuevo para 3 unidades), no una tarea de ingeniería lista para Codex. Se exploró de paso un tercer candidato no listado antes, `ADM-V01`/`ADM-V03` (D-03, "REQUERIDO — PENDIENTE DE BACKEND"): tampoco está listo — falta una fuente de datos para "ejecuciones en sandbox hoy" y no existe ninguna infraestructura de logging técnico persistente para el visor de logs de `ADM-V03`. **Conclusión: ninguna fase nueva se escribe hoy, ni para Antigravity ni para Codex** — los tres candidatos existentes necesitan una decisión de alcance (instruccional o de arquitectura) antes de convertirse en un plan, no una ejecución inmediata. Ver §6.2/§6.3 para el detalle completo de cada uno. | Claude Code (Sonnet 5) |
| 2026-09-16 | **Pausa técnica del Tutor IA, pedida por el dueño del proyecto — investigación, implementación y ajuste tras feedback, todo en la misma sesión.** Contraste completo de la visión (`docs/00_VISION_FUNCIONAL.md` §9.5, nueva) contra el código real: el Tutor no tenía ningún camino hacia el banco de actividades (solo texto libre), y `mastery.calculator.ts` no penalizaba repetir una actividad fácil. Implementado y verificado en navegador real: `TutorRecommendationService` (nuevo), `GET /tutor/greeting` (saludo proactivo con datos reales), detección de intención de práctica en `POST /tutor/chat`, y decaimiento de score por repetición de actividades `BASICO` en `mastery.calculator.ts`. **Ajustado tras feedback del dueño del proyecto en la misma sesión:** se descartó el diseño inicial (marcador oculto `[[LISTO_PARA_PRACTICAR]]`) por sentirse rígido y gastar tokens de más — la oferta de practicar ahora es conversacional (el propio LLM la ofrece con palabras, sin parsing), y se quitó la tarjeta automática que se adjuntaba en cada respuesta dentro de una unidad de mastery bajo (saturaba). 31/31 tests, build y typecheck limpios. §4.1 actualizado con 2 filas nuevas. Se identificó un gap real y bien acotado que sí es delegable (categorías reales de `ActivityType` con peso examen/práctica, §4.2) y se escribió `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` §17. **Nota de mantenimiento:** la fila anterior (3ª pasada, 2026-09-15) tenía su celda partida en varias líneas físicas por un error de edición previo — se corrigió a una sola línea en este mismo checkpoint para que la tabla renderice bien en Markdown; el contenido no cambió. | Claude Code (Sonnet 5) |
| 2026-09-16 (2ª pasada) | **Auditoría de la Fase 17 de Antigravity (commit `4f02b4d`) + 2 documentos nuevos pedidos por el dueño del proyecto: guía de auditoría para Jorge y plan de implementación para Codex.** Fase 17 verificada real: diff de `seed-runner.ts` confirma `findOrCreate` aditivo (`TALLER` 1.5×, `PARCIAL` 3.0×) sin reasignar las 15 actividades existentes; el fix de `activities.service.ts` (TypeORM priorizaba la relación cacheada sobre el `activityTypeId` nuevo en `PATCH`) es real, 32/32 tests reproducidos. §6.1 cierra Fase 17. Hallazgo propio, no de Antigravity: `GET /tutor/greeting` (agregado el 16/09 en la pausa técnica) había quedado sin `@Throttle` — corregido, commit `1faf230`. Se escribió `docs/ReportesQA/GUIA_AUDITORIA_2026-09-16.md` (qué no repetir de la auditoría anterior de Jorge, qué es genuinamente nuevo desde el 12/09, y ángulos que normalmente no se cubren: BOLA sistemático, adversarial contra el Tutor/Mastery nuevos, concurrencia, accesibilidad real, `verify:clean` desde cero, estados de error). Se investigó y verificó a mano que 4 módulos (`message`, `review-schedules`, `learning-progress`, `enrollment`) ya están bien guardados contra BOLA — con esa evidencia se escribió `docs/codex/PLAN_IMPLEMENTACION.md` Fase G (auditoría sistemática de los ~11 módulos restantes + barrido de rate-limiting), la primera fase de Codex que sí estaba lista para delegar desde la pasada del 15/09. | Claude Code (Sonnet 5) |
| 2026-09-18 (2ª pasada) | **Auditoría y cierre de la Fase G de Codex (commit `899b2e0`).** Verificado contra código real antes de comitear: diff de `activity-questions.service.ts` confirma un hallazgo BOLA real y bien cerrado (`assertEnrolledInClass` + chequeo de `PublicationStatus.PUBLISHED`, con regresión en su spec); 5 rate-limits específicos agregados con justificación explícita en comentario; 9 módulos restantes revisados sin hallazgo, documentados para no re-auditar. Build limpio, 49/49 tests (`activity-questions` + `authorization`) reproducidos de forma independiente antes de comitear — no se confió en el informe de Codex. §4.5 y §6 actualizados. También se cerró la Bitácora N.5 (`docs/seguimiento/MONITOREO_SEMANAL_05.md`) contra Trello real y el QA entregado por Jorge (`docs/ReportesQA/REPORTE_AUDITORIA_QA_STIRE_18-09.md`: 331/331 tests, "APTO CON CONDICIONES", 80% de avance) — con dos precisiones registradas ahí: el fallo de `verify:clean` que reportó es un MySQL local ausente, no un defecto de STIRE, y el reporte no cubrió los ángulos específicos de `GUIA_AUDITORIA_2026-09-16.md` (BOLA sistemático, adversarial Tutor/Mastery, Fases 16/17, accesibilidad real) aunque sí completa el checklist base de su propia tarjeta de Trello. | Claude Code (Sonnet 5) |
| 2026-09-19 | **Decisión de arquitectura de despliegue, pedida por el dueño del proyecto (ADR 09, `docs/ADR_DECISIONES_ARQUITECTURA.md`).** Dos preguntas abiertas desde §4.7: dónde corre el backend, y si el sandbox de ejecución debía cambiar de arquitectura para encajar en esa decisión. Verificado contra código antes de decidir: `HardenedProcessSandboxAdapter` usa `child_process.spawn` real (línea 2 del archivo) y `InlineJudgeQueueAdapter` (ADR 08) es el adaptador por defecto, sin Redis. Decisión: frontend sin cambios en Vercel; backend + MariaDB se despliegan en una plataforma con proceso persistente (Railway recomendado tras verificar en vivo que soporta MySQL/MariaDB gestionado y no restringe `child_process`; VM gratuita con el `docker-compose.yml` ya existente como alternativa sin costo — condiciones de precio verificadas en la fecha de este checkpoint, sujetas a cambio); el sandbox se mantiene local, sin reemplazo por una API externa de terceros (razón: ya está auditado en varias rondas — ADR 06, hallazgo P2-R1 — y cambiarlo no resuelve el problema real, que es de hosting, no de seguridad del sandbox); Redis no se activa en producción. §4.7 y §6.4 actualizados. Se creó `S06-J03` (Jeider) para la ejecución. Se aprovechó la misma sesión para aflojar el registro de "Los 7 Hábitos" del Reto 3 en Trello (checklists reales de 7 ítems por integrante en vez de texto simulado, sin exigir cubrir los 7 cada semana) y para retirar de la bitácora activa el lenguaje de "cambio de responsabilidad" sobre José — su tarea de esta semana (`S06-JO01`) queda descrita como su responsabilidad actual, sin narrar el antes/después. | Claude Code (Sonnet 5) |
| 2026-09-19 (2ª pasada) | **Reorganización de `docs/`, auditoría del Tutor IA y backend de la clave por estudiante, pedidos por el dueño del proyecto.** (1) `docs/`: los 15 insumos numerados 00–14 salen de la raíz de `modesec/` a `modesec/insumos/` (su numeración chocaba con `00_QUE_ES_MODESEC` y `01_GAP_Y_PLAN`); las rutas de los formatos oficiales de MODESEC que se entregaron (`contenidos/`, `guiones/`, `ventanas/`, `entregables/`) no cambian; `backend-audit.md`, `PLAN_IMPLEMENTACION_JORGE_QA.md` y el reporte QA sin extensión (`..._18-09`, ahora `.md`) pasan a `ReportesQA/`, con índice; nuevos `docs/README.md` completo, `modesec/insumos/README.md`, `material-visual/` (esqueleto para José). Verificado con un revisor de enlaces propio (300 enlaces): **40 rotos antes → 1 después** — incluidos 10 del documento consolidado de Fase II de MODESEC (`../` mal puesto) y los de las bitácoras 03/04; el que queda está dentro de un informe de sesión de Antigravity, que por regla no se edita. (2) Auditoría del Tutor (subagente de solo lectura + verificación propia de las afirmaciones decisivas contra el código): confirmados en código el desajuste `error` vs `err.data.message`, el mensaje duplicado al LLM, la reserva simulada silenciosa, cero manejadores de Escape en el frontend y la sugerencia que confiaba en el `learningUnitId` del cliente. **No reproducidos** (solo leídos): el renderizado roto de bloques de código, el contraste y el zoom en iOS. (3) **Decisiones del dueño** (visión §9.6, ADR 10): solo Gemini con la clave gratuita de cada estudiante; el alcance del "100% del Tutor" incluye "Ir al contenido", repasos vencidos en el chat, configuración por el docente y barrera contra dar la solución; el nivel de guía es automático y visible (por intentos fallidos) y el docente podrá activar/desactivar el Tutor, fijar un tope de ayuda y elegir un estilo acotado. (4) Backend implementado y verificado en vivo (ver §4.1) — incluido, en la misma sesión, el nivel de guía automático, la configuración del docente por clase/unidad/actividad (ADR 11) y la barrera anti-solución, esta última refinada por una observación del dueño (un tope fijo bloquearía explicaciones legítimas: ahora solo actúa dentro de una actividad y solo sobre volcados o programas con forma de solución). (5) Se escribieron las Fases 18, 19 y 20 de Antigravity. **Pendiente y declarado:** camino feliz con una clave real de Google sin probar; quitar la dependencia `openai` de `package.json` exige `npm run verify:clean` al cierre de ola; nada de esto está comiteado todavía. | Claude Code (Sonnet 5) |
| 2026-09-20 | **Primera versión registrada, camino feliz del Tutor verificado con Gemini real, endurecimiento previo al despliegue y backend real para el panel de administración.** Tag `v1.0.0-beta.1` (`docs/FLUJO_GIT.md`, capturas en `docs/material-visual/00-primera-version/`, 20 pantallas tomadas con script contra el sistema real; las dos vistas de administración de sistema eran maquetas con cifras inventadas). Con la clave de Google AI Studio del dueño: se acepta, el Tutor responde en español y de forma socrática, y la barrera anti-solución cortó un programa completo escrito por Gemini real (§4.1). Cuatro commits de código: `helmet` y Swagger apagado en producción (`0ab0f0f`), retiro de `openai` (`5c464fc`), `GET /admin/system/status` y `/logs` con secretos redactados y 27 tests (`4627e65`), y `dueReviews`/`contentLink` en `GET /tutor/guidance` con 10 tests (`df840bb`). **Build limpio, 57/57 suites, 478/478 tests.** Hallazgos reales que salieron de mirar el sistema: la fecha de matrícula llega como `joinedAt` pero la pantalla lee `createdAt`/`enrolledAt` (de ahí «Inscrito el fecha reciente»); la píldora vacía de la cabecera es el store sin hidratar fuera de `/estudiante`; dos capturas mostraban el nombre y el correo reales de una persona y se anonimizaron antes de publicarlas. Se archivaron las Fases 16-20 del plan de Antigravity y se escribió la Fase 21. `npm run verify:clean` queda para el cierre de la ola. | Claude Code (Sonnet 5) |
| 2026-09-20 (2ª pasada) | **Auditoría de la Fase 21 de Antigravity y cierre de la subida de `mysql2`.** Verificado contra código y en navegador real (backend y base reales; Chrome con guion propio): `typecheck` código 0, búsqueda final en cero, 4 commits atómicos sin tocar backend ni estilos. **Hallado y corregido por Claude Code:** el diálogo de la limpieza de mantenimiento describía «datos temporales, sesiones obsoletas y archivos residuales» cuando `MaintenanceService.handleDeadlockCleanup` marca con nota 0 respuestas huérfanas y cierra con nota 0 entregas atascadas más de 10 min — modifica resultados de estudiantes (`e6f4296`); la cola mostraba «En progreso: 0» ante un `null`, el encabezado decía «Degradación Detectada» sin datos y la etiqueta «Envíos evaluados» era «iniciados» (`cd16613`); `GET /enrollment/my` salía dos veces porque el layout comprobaba `isLoading`, que nunca se activa (`1611b48`; ahora 1 petición). **Hallado y trasladado a la Fase 22:** el aviso de repasos y «Ir al contenido» no se ven sin clave de Google guardada (Pedro, sin clave, solo ve el formulario); Escape no cierra el panel del Tutor ni el diálogo de limpieza; el contenido de la actividad anterior se arrastra al inicio; estados «✔» fijos. **Autocorrección del propio auditor:** mi contador de peticiones contó dos veces por las peticiones previas de CORS (`OPTIONS`) y mi simulación de base caída falló por lo mismo; el refresco de 30 s es correcto y se descartó como defecto. `mysql2` 3.19.1 → 3.24.4 (`b369243`), `verify:clean` en código 0 tras el último cambio del lockfile, salida en `CHANGELOG.md`. **Pendiente conocido en el backend, no corregido:** la limpieza responde «ejecutada exitosamente» aunque capture un error interno. Se archivó la Fase 21 (con nota de auditoría) y se escribió la Fase 22. | Claude Code (Sonnet 5) |
| 2026-09-21 | **Fase 22 de Antigravity auditada y archivada; backend y clave del Tutor verificados; carpeta y guardia para el rediseño visual de José.** (1) **Fase 22, auditoría en navegador real:** T1, T3 y T4 correctos; **T2 tenía un defecto** que el informe da por resuelto (sin clave guardada el foco caía al `<body>` y `Escape` no cerraba el panel del Tutor), corregido por Claude Code (`Escape` escuchado en el documento y foco reasignado cuando cambia el panel de la clave); el diálogo de `sistema.vue` estaba bien. (2) **Backend:** `POST /maintenance/cleanup` ya no informa éxito si falla y devuelve los conteos; **`GET /enrollment/my` devolvía también matrículas retiradas y pendientes** (su descripción dice «activas»; la interfaz no filtra por estado y las mostraba como clases cuyo contenido respondía 403): ahora solo `active`. Ambos con tests. (3) **Clave del Tutor con Gemini real, recorrido completo desde la interfaz** (detalle en la fila del Tutor de §4.1): faltaba `TUTOR_KEY_ENCRYPTION_SECRET` en el `.env` local y el error se presentaba como reintentable; corregido. (4) **Identidad visual (José):** `docs/identidad-visual/`, `npm run check:identidad` y `FLUJO_GIT.md` actualizado (§6.1.1). (5) Fase 22 archivada; el plan vigente de Antigravity queda sin fase pendiente. **Autocorrección del auditor:** mi primera prueba de «Tutor desactivado» dio un falso positivo porque la matrícula demo de Pedro en la clase 14 está en `withdrawn` desde la noche del 20/09 (quedó de una prueba anterior) y desactivar esa clase no lo afecta; repetida con la clase 15 dio el resultado correcto. **No se restauró esa matrícula:** el clasificador denegó la escritura en la base, decide el dueño. **Pendiente conocido, no corregido:** al unirse a una clase que exige aprobación, la pantalla dice «¡Te has matriculado exitosamente!» aunque la matrícula quede pendiente. `verify:clean` y la suite completa: ver `CHANGELOG.md`. | Claude Code (Sonnet 5) |

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
| Antigravity §16 | Editar/archivar contenido (`DOC-V02`/`DOC-V03`), enlace `DOC-V04`→`DOC-V05`, auditoría WCAG 2.1 AA | ✅ Auditado por Claude Code, 15/09 (grep + typecheck) — ver §5 |
| Codex D/E/F | Intentos duplicados, matrícula, evento de calificación | ✅ Auditado en vivo por Claude Code — código real + suite de tests en verde. Ver §5 |
| Codex G | Auditoría BOLA sistemática + rate-limiting específico | ✅ Auditado por Claude Code, 16/09 — código real + 49/49 tests reproducidos. Ver §5 |

### 6.1 Antigravity — sin fase pendiente; Fases 21 y 22 entregadas y auditadas; Fases 18 a 20 con auditoría parcial

**Vigente: ninguna.** `docs/antigravity/PLAN_IMPLEMENTACION.md` ya no tiene fase pendiente; cuando la haya, la numeración sigue en 23.

**Fase 22: entregada por Antigravity (commits `3ceb77b`, `ac4458d`, `37a8238`, `9f23d0c`) y auditada por Claude Code el 21/09** en navegador real, con backend y base reales (guion propio; respuestas interceptadas para simular la base caída). Archivada en `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-21.md`, con la nota de la auditoría. T1, T3 y T4 funcionan. **T2 tenía un defecto que el informe da por resuelto:** sin clave guardada (el estado inicial de todos) el foco caía al `<body>` y `Escape` no cerraba el panel del Tutor; corregido por Claude Code. **Imprecisiones del informe** (`INFORME_2026-09-21_SESION_01.md`, no se edita): afirma que `Escape` cierra el panel y devuelve el foco (falso sin clave, antes de la corrección) y lista `POST /maintenance/cleanup → 200 OK` como verificado cuando dice que Escape lo cancela sin invocarlo.

**Fase 21: entregada por Antigravity (commits `fc0d350`, `c6adae8`, `bad2197`, `788b599`) y auditada por Claude
Code el 20/09.** Reproducidos: `npx nuxi typecheck` en código 0, búsqueda final en cero, alcance respetado (solo
`frontend-nuxt/`, un commit por tarea). Probado en navegador real con backend y base reales (guion propio, con
respuestas interceptadas para simular la base caída y un 500 en la limpieza). Tres commits de Claude Code
corrigieron cinco defectos el mismo día (`e6f4296`, `cd16613`, `1611b48`); cuatro más pasan a la Fase 22.
**Imprecisiones del informe de Antigravity** (`INFORME_2026-09-20_SESION_01.md`, no se edita): cita
`GET /class/my-enrollments`, que no existe (la pantalla usa `/enrollment/my`), y repite «Inscrito el 12 sep
2026», que era el ejemplo del plan; la pantalla real muestra «Inscrito el 10 de sept de 2026». La Fase 22 le
pide que cuente solo lo que vio.

**Fases 18, 19 y 20: entregadas por Antigravity el 19/09** (commit `8e385c3`, informe
`INFORME_2026-09-19_SESION_01.md`). Auditoría de Claude Code **parcial** (20/09, navegador real): el
panel de la clave, el rechazo de una clave falsa y el panel del docente funcionan contra el backend
real; el drawer se abre como `dialog` con chips de nivel. **Sin auditar:** Escape, scroll, Markdown,
estados de espera y móvil. **Auditado después (21/09):** Escape y foco del Tutor (con un defecto, corregido) y el estado «desactivado por tu docente» visto desde el estudiante.


**Fase 17 — cerrada y auditada, 16/09** (commit `4f02b4d`, informe `INFORME_2026-09-16_SESION_01.md`):
categorías reales de `ActivityType` (`TALLER` 1.5×, `PARCIAL` 3.0×, aditivo, `AUTO-EVAL` intacto) +
selector visible en crear/editar actividad. Verificado por Claude Code: diff real de
`seed-runner.ts` confirma el patrón `findOrCreate` correcto sin reasignar las 15 actividades
existentes; el fix declarado en `activities.service.ts` (TypeORM priorizaba la relación
`activity.activityType` en caché sobre el `activityTypeId` nuevo al hacer `PATCH`) es real y
correcto — 32/32 tests (`src/activities`, `src/tutor`) en verde, reproducidos de forma
independiente. No hay un gap de frontend nuevo, verificado contra código, que amerite otra fase
todavía.

### 6.1.1 Identidad visual — José (humano, trabajo autónomo)

No es un plan de implementación: José decide el diseño y su carpeta (`docs/identidad-visual/`) solo fija el territorio y el orden. Contiene una **guía de trabajo** (qué es libre, qué se avisa y qué no se toca; ramas por etapa: tokens → componentes → páginas; cómo probar y entregar), los **primeros pasos** (las 14 decisiones globales que hay que tomar antes de tocar código para que toda la página quede coherente) y una **plantilla de propuesta** que José llena. Con esa propuesta, Claude Code revisa el contraste, traduce los valores a `tailwind.config.ts` y ajusta la guía. Protección: `npm run check:identidad` compara la rama contra `main` y falla si toca algo fuera del estilo y las plantillas de `frontend-nuxt/`; avisa si cambia un `<script>`, pierde una directiva de comportamiento o un `id`/`aria-label`. Hallazgos que ya se le entregan: el estilo sale casi todo de `tailwind.config.ts` (solo 4 de 37 archivos `.vue` tienen colores escritos a mano, 32 usos), los iconos son emojis en 28 archivos y `lucide-vue-next` está instalado pero sin uso. **Estado:** José aún no entrega su propuesta.

### 6.2 Codex — Fase G cerrada el 16/09; los dos candidatos anteriores siguen sin estar listos

**Decisión explícita del dueño del proyecto (15/09):** no hay un número fijo de rondas de
Antigravity antes de Codex — queda a criterio de Claude Code, cuando aparece trabajo de backend que
de verdad amerita la autonomía y el alcance de Codex (reglas de negocio nuevas, migraciones, algo que
cruza varios módulos) y que no cabe en la libertad de ediciones sencillas que ahora tiene Antigravity
(§3, "Libertad de backend ampliada").

**Candidato 1 — cerrado sin fase (hallazgo, no trabajo pendiente):** "cobertura de tests para
`src/message/`" ya no es un gap. Verificado el 15/09: `src/message/message.service.spec.ts` existe
(100 líneas, 7 casos: `create`, `getInbox`, `getSent`, `getConversation`, `markAsRead` con sus dos
ramas, `getUnreadCount`) y pasa 7/7 (`npx jest src/message/message.service.spec.ts`). **Nota de
proceso:** este archivo lo escribió Claude Code como borrador exploratorio antes de que el dueño del
proyecto pidiera reservar Codex — quedó sin comitear a propósito. El commit `04c9911` de Antigravity
(Fase 16) lo incluyó de todas formas (`git log --all -- src/message/message.service.spec.ts` lo
confirma), probablemente por un `git add` amplio de su parte — no es un cambio de backend que
Antigravity haya escrito, y no contradice su declaración de "zona Codex respetada" en cuanto a
código nuevo, pero sí significa que un archivo ajeno a su fase terminó en su commit sin que nadie lo
revisara antes. No bloqueante (el archivo es correcto y pasa), pero queda registrado como el tipo de
cosa a vigilar si vuelve a pasar. `message.controller.ts` (68 líneas, solo enrutamiento con
`@Roles`/`@Req`) sigue sin test — no amerita una fase de Codex por sí solo, es trabajo menor que
Claude Code puede hacer directo si hace falta.

**Candidato 2 — progresión de 3 pasos para Nivel 2 (§4.4): investigado a fondo, resultó ser una
decisión de contenido, no de ingeniería.** Verificado el 15/09 contra `src/seeds/seed-runner.ts`
(líneas 1045-1196): las 3 actividades (`DRAG_DROP`, `ORDERING`, `MATCHING`) no están sueltas al
azar — cada una vive en la unidad cuyo tema le corresponde: `DRAG_DROP` (métodos de arreglos) en
`unit4` ("Arreglos y Búsqueda de Información"), `ORDERING` (fases de un bucle `for`) en `unit3`
("Bucles for y while"), `MATCHING` (conceptos de funciones) en `unit5` ("Funciones Puras"). Una
secuencia real de 3 pasos dentro de una sola unidad, al estilo Nivel 1, exigiría una de dos cosas:
mover contenido de un tema a otro sin que encaje (p. ej. una pregunta sobre bucles dentro de la
unidad de arreglos), o escribir contenido pedagógico nuevo para que las 3 unidades tengan su propia
secuencia completa — que es trabajo de diseño instruccional (rol de Julio Galvis en el equipo, ver
`docs/seguimiento/MONITOREO_SEMANAL_04.md` §1), no una tarea de ingeniería que Codex pueda resolver
solo con el contrato de datos. **No se escribe una fase todavía** — falta que el equipo decida la
forma pedagógica antes de que valga la pena convertirlo en un plan de implementación.

**Hallazgo nuevo explorado el 15/09, tampoco listo:** `ADM-V01`/`ADM-V03` (§4.6) siguen como
mockups explícitos por decisión D-03 ("REQUERIDO — PENDIENTE DE BACKEND", no en pausa como
Gamificación). Se investigó qué tan cerca está de ser delegable: 2 de las 3 KPI de `ADM-V01`
(total de usuarios por rol, total de clases activas) son consultas triviales sobre tablas que ya
existen; pero la tercera ("Ejecuciones en Sandbox Hoy") no tiene fuente de datos — `POST
/submissions/:id/run` ("Probar código") deliberadamente no crea una fila de `Submission` (no
consume intento), así que hoy no hay ningún conteo de esas ejecuciones en ningún lado. `ADM-V03`
(visor de logs técnicos) es más grande de lo que parecía: `src/activity-log/` existe pero es un log
**pedagógico** para el Tutor IA (acciones del estudiante), no un log técnico con niveles
`INFO`/`WARN`/`ERROR` y módulo emisor — no hay ninguna infraestructura de logging persistente hoy.
Construir eso es una decisión de arquitectura (¿se persiste en BD? ¿qué volumen/retención?), no una
edición de backend acotada. **Tampoco se escribe una fase todavía** — falta decidir si vale la pena
la infraestructura nueva solo para un panel de administrador que el propio D-03 ya marcó como de
menor prioridad.

**Candidato 3 — cerrado, 16/09: auditoría sistemática de BOLA + rate-limiting (Fase G).** A
diferencia de los dos anteriores, este no dependía de una decisión de alcance de
nadie fuera del equipo técnico — es trabajo de código puro. Motivado por la próxima auditoría de
Jorge Cervantes (`docs/ReportesQA/GUIA_AUDITORIA_2026-09-16.md`): en vez de que Codex y Jorge
encuentren lo mismo por separado, Codex hace la revisión de código (leer cada service, no solo
probar la app por fuera) que un QA manual no puede hacer bien. Se verificó primero a mano, esta
misma sesión, que 4 de los ~15 módulos del proyecto (`message`, `review-schedules`,
`learning-progress`, `enrollment`) ya están bien guardados — quedan ~11 sin revisar
sistemáticamente. De paso se encontró y cerró un hallazgo real chico (`GET /tutor/greeting` sin
`@Throttle`, commit `1faf230`). Plan: `docs/codex/PLAN_IMPLEMENTACION.md` Fase G. **Ejecutada y
cerrada el 16/09** (commit `899b2e0`): de los ~11 módulos restantes, 9 salieron limpios y 1
(`activity-questions`) tenía un hallazgo BOLA real — un estudiante autenticado podía enumerar
preguntas de una actividad de otra clase (redactadas, pero visibles sin estar matriculado). Cerrado
con `assertEnrolledInClass` + chequeo de publicación, con test de regresión. Ver §4.5 y §5.

### 6.3 Qué hace cada herramienta esta ronda y por qué

La Fase 17 de Antigravity (§6.1) ya cerró — fue aditiva y de frontend con un toque de seed, encajaba
en su perfil. La Fase G de Codex (§6.2) es la siguiente entrega activa: cruza ~11 módulos y es
trabajo de autorización/seguridad — exactamente el tipo de alcance que amerita la autonomía de
Codex, no una edición sencilla de Antigravity. Los otros dos candidatos de Codex (progresión de
Nivel 2, backend del panel de admin) siguen sin estar listos por las mismas razones de fondo
(decisión de alcance pendiente, no de ingeniería) — no cambiaron desde la pasada anterior. Cuando el
equipo decida la forma de la progresión de Nivel 2, o si se decide construir el backend real del
panel de admin, se escribe la
fase de Codex correspondiente con esa decisión ya tomada — no antes.

### 6.4 Claude Code — pendientes sin plan delegable todavía

**Tutor IA — camino al 100% (decisión del dueño, 19/09, `docs/00_VISION_FUNCIONAL.md` §9.6).** De las
cuatro piezas incluidas en el alcance, **la configuración del docente y la barrera anti-solución ya tienen
backend (§4.1, ADR 11); quedan sin diseño** las otras dos, y las cuatro se describen abajo tal como
estaban planteadas: (1) botón estructurado **"Ir al contenido"** de la
unidad; (2) **repasos vencidos dentro del chat** con contexto de unidad (hoy solo el saludo los mira);
(3) **configuración del Tutor por el docente** (hoy no existe nada en backend y `ChatDto.classId` está
declarado pero sin uso — falta que el dueño defina *qué* puede configurar); (4) **barrera en código**
contra respuestas que den la solución completa (hoy la regla 1 es solo texto del prompt). Más el
**nivel de guía real** (ya hecho en backend, 19/09). Configuración por el docente: el dueño ya eligió *qué* (activar/desactivar, tope de ayuda, estilo acotado); falta decidir qué clase manda cuando el estudiante chatea fuera de una unidad. Cada una necesita primero una decisión de alcance
—no se delega a ciegas— y, según toque `src/tutor/`, será de Claude Code o de Codex.

Estos ítems siguen sin un plan de ejecución porque su alcance no está definido, o la decisión no es
técnica sino del dueño del proyecto — no se le delega a otra herramienta un alcance que ni Claude
Code ha terminado de acotar:

- **Ejecución del despliegue** (§4.7) — la arquitectura ya se decidió (ADR 09: backend+MariaDB
  fuera de Vercel, sandbox se mantiene local); lo que queda es la ejecución (`S06-J03`), gatekeeped
  por que el dueño del proyecto cree la cuenta en la plataforma elegida, no por código.
- **`ai_evaluated` sin evaluador** (§4.2, `BE-01`) — explícitamente fuera de alcance hasta que el
  equipo decida qué significa "evaluado por IA" en este proyecto; no se improvisa un evaluador solo
  para cerrar el hallazgo.
- **Sandbox en otros lenguajes además de JavaScript** — sin alcance definido (¿cuáles lenguajes?
  ¿por qué?); no es una tarea lista para delegar todavía. ADR 09 ya deja anotado que, si esto se
  llega a decidir, una API externa tipo Judge0 es la vía más rápida frente a escribir un adaptador
  propio por lenguaje — pero la decisión de alcance de producto sigue sin tomarse.
- **Progresión de 3 pasos para Nivel 2** (§4.4, `drag_drop`/`ordering`/`matching`) — de vuelta en
  esta lista el 15/09: se creía lista para delegar (ver checkpoint 14/09), pero al investigar el
  contenido real (`src/seeds/seed-runner.ts:1045-1196`) resultó que cada actividad pertenece al
  tema de una unidad distinta (arreglos/bucles/funciones) — una secuencia real de 3 pasos es una
  decisión de diseño instruccional, no una tarea de ingeniería. Falta que el equipo (Julio Galvis,
  rol de Diseño Instruccional) decida la forma antes de escribirle un plan a Codex. Ver §6.2.
- **`ADM-V01`/`ADM-V03` con backend real** (§4.6, decisión D-03: "REQUERIDO", no en pausa) —
  2 de 3 KPI de `ADM-V01` son triviales, pero "ejecuciones en sandbox hoy" no tiene fuente de datos
  (`POST /submissions/:id/run` no persiste nada), y `ADM-V03` (visor de logs técnicos) no tiene
  ninguna infraestructura de logging persistente detrás — `src/activity-log/` es un log pedagógico
  para el Tutor IA, no un log técnico. Decisión de arquitectura pendiente, no una edición acotada.
  Ver §6.2.

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
