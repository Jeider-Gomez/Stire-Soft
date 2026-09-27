# STIRE — Informe de Sesión Claude Code

**Código de Documento:** INF-CC-2026-09-10-01
**Fecha:** 2026-09-10
**Agente / Asistente:** Claude Code (Sonnet 5)
**Ambiente:** Desarrollo Local (`localhost`) — backend `:3001` + frontend `:3000` levantados en
vivo durante toda la sesión (ver `.claude/launch.json`)
**Stack Verificado:** NestJS + MariaDB (`basestire`) + Nuxt 3 + Google Gemini AI (vía
`generativelanguage.googleapis.com`)

---

## 1. Resumen Ejecutivo

El dueño del proyecto pidió revisar los informes de Antigravity, decir qué seguía, y ser
riguroso probando el sistema real (no solo leyendo código) porque había encontrado problemas de
uso real: un 404 en el sandbox, matrícula automática a una sola clase, un Tutor lento y sin
contexto, credenciales de demo no documentadas, y dudas sobre si la autenticación real era segura
frente a los accesos rápidos de demostración. Esta sesión verificó cada punto contra el árbol de
trabajo real y el backend/frontend corriendo — no contra lo que decían los documentos — y encontró
tres hallazgos que ningún informe anterior había reportado: un bug de enrutamiento por tipo de
pregunta, una calificación asíncrona que nunca llegaba al estudiante, y una regresión pedagógica
real en el Tutor introducida esa misma mañana. Todos quedaron cerrados y verificados en vivo, no
solo con tests.

**Regla de Oro en cada punto de cierre:** `npm run build` sin errores + `npm test` en 284/284 al
final de la sesión (dos fallas preexistentes de esa misma mañana, no causadas por esta sesión,
también se corrigieron — ver §3.6).

---

## 2. Verificación Ejecutada (contra código real, no contra informes)

| # | Tema | Estado verificado | Evidencia |
| :--- | :--- | :--- | :--- |
| 1 | 404 en `POST /submissions/start` | ✅ Ya resuelto por un commit de esa misma mañana (`c989c15`, anterior a esta sesión) | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 2 | Admin sin datos reales | ✅ Ya resuelto (`GET /users` real) | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 3 | Tutor sin contexto de ubicación | ✅ Ya resuelto (`ChatContextDto`, `tutor-context.service.ts`) | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 4 | Código de clase / unirse a clase | ⚠️ Parcial: mecanismo (`POST /enrollment/join`) y campo opcional en registro ya existen; Castro y Ali tienen clases sin contenido sembrado | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 5 | Aceptar/rechazar estudiante, quitar de clase | ❌ No existe (`EnrollmentStatus` sin estado `PENDING`, sin endpoint de expulsión); cerrar curso sí existe | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 6 | Evaluación ponderada / selección adaptativa | ⚠️ Parcial: `adaptiveWeight` real y usado en `mastery.calculator.ts`; no existe motor de recomendación previo | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 7 | Docente crea actividades | ✅ Ya resuelto vía API (`POST /activities`, `@Roles('docente','admin')`); falta UI | `docs/00_VISION_FUNCIONAL.md` §9.2 |
| 8 | Sandbox asume solo JavaScript | ❌ No resuelto — UI fija a JS y `hardened-process-sandbox.adapter.ts` rechaza cualquier otro lenguaje | `docs/00_VISION_FUNCIONAL.md` §9.2 |

---

## 3. Hallazgos Nuevos, Causa Raíz y Corrección

### 3.1. Bug de enrutamiento FILL_CODE → sandbox de CODING

- **Síntoma:** al reproducir en vivo el flujo del punto 1 (probar código), una actividad distinta
  (`Completar Código: Validador de Formulario de Registro`) respondía `400` — *"Esta actividad no
  tiene una pregunta de código para ensayar"*.
- **Causa raíz:** esa actividad es de tipo `fill_code`, no `coding`, pero
  `frontend-nuxt/stores/workspace.ts` trataba cualquier pregunta como código libre
  (`questions.find(q => q.type === 'CODING') || questions[0]`, con el nombre del enum en
  mayúsculas — el valor real del backend es `'coding'` en minúscula).
- **Autocorrección durante la sesión:** el primer intento de arreglo comparó igual contra
  `'CODING'` y desactivó por error **todas** las actividades, incluida la que sí funcionaba —
  detectado probando explícitamente el caso que debía seguir funcionando, no solo el reportado.
- **Corrección:** `workspace.ts` registra el tipo real de la pregunta; "Probar código" y "Entregar
  solución" se deshabilitan con aviso explícito cuando no es `coding`, sin gastar el intento. De
  paso se corrigió el modal de "Entrega Exitosa", que mostraba siempre `100/100 pts` y `85% de
  dominio` fabricados sin mirar el resultado real.
- **Commit:** `29575e6`.

### 3.2. Calificación asíncrona de CODING nunca llegaba al estudiante

- **Síntoma:** al entregar una solución real de tipo `coding` que ya había pasado 2/2 casos en
  "Probar código", `POST /submissions/:id/submit` respondía `{totalScore:0, status:'submitted'}` —
  sin nota real.
- **Causa raíz:** la calificación de preguntas `coding` es asíncrona a propósito (arquitectura
  event-driven: `judge.answer-graded` → `consolidateSubmission()` → `submission.graded`). El
  backend no tenía ningún `GET /submissions/:id` para consultar el resultado después, ni el
  frontend ningún mecanismo (polling, websocket) para recogerlo. Se investigó explícitamente si
  existía push por socket — no existe ninguno en todo `src/`.
- **Corrección:** se agregó `GET /submissions/:id` (status/totalScore/passedCount/totalCount) y
  `submitSolution()` en el frontend sondea ese endpoint cada 1.2s (hasta ~12s) cuando el submit
  inmediato no viene ya calificado, mostrando el resultado real solo cuando el backend termina.
- **Verificado en vivo:** `POST submit` → `GET /submissions/:id` (un solo sondeo en modo inline) →
  modal con nota real (40/100, 1/1 correcta).
- **Commit:** `5310967`.

### 3.3. Regresión pedagógica en el Tutor IA (no reportada por nadie hasta esta sesión)

- **Síntoma:** al arreglar 2 tests rotos del Tutor a pedido del dueño del proyecto, se comparó el
  prompt actual contra `git show c989c15 -- src/tutor/tutor-context.service.ts` antes de tocar los
  tests.
- **Causa raíz confirmada por el diff:** el commit de esa misma mañana, al agregar contexto de
  ubicación en pantalla, **reemplazó** la regla de adaptación pedagógica por nivel de dominio
  ("si es principiante usa metáforas del mundo real; si es avanzado enfócate en Big O Notation")
  por una regla genérica de Método Socrático — perdiendo el Pilar 3 de
  `docs/00_VISION_FUNCIONAL.md` §2.3 ("adaptando su lenguaje y profundidad según el nivel de
  dominio"). No fue un cambio documentado en ningún lado.
- **Corrección:** se restauró la regla de nivel como su propio punto, conservando el nuevo
  contexto de pantalla; solo se actualizaron en los tests las 3 aserciones que sí eran redacción
  cambiada a propósito ("Tutor IA" → "Tutor Inteligente", etc.), no las que revelaban contenido
  perdido.
- **Commit:** `098ffc8`.

### 3.4. Selector de rol en el header — hallazgo de seguridad señalado por el dueño del proyecto

- **Síntoma:** el dueño del proyecto, viendo capturas del header con el selector
  Estudiante/Docente/Admin, señaló que ese patrón no debería ser posible en una aplicación real
  con seguridad JWT — que ya no se quería, ahora que el sistema deja de ser un mockup.
- **Estado antes de esta sesión:** `switchRoleForDemo()` ya hacía login real (no fabricaba JWT), y
  ya estaba gateado por `NUXT_PUBLIC_DEMO_MODE` — pero solo con un `v-if` en la plantilla; la
  función en sí era invocable desde la consola del navegador incluso con el modo demo apagado
  (cerrado antes, en el commit `4692ea0`, más temprano en la sesión).
- **Corrección de esta vuelta:** se eliminó el selector de `HeaderNav.vue` por completo — un
  usuario real logueado ya no ve ningún control de cambio de rol. El acceso rápido de
  `login.vue` se conserva (es un login real, no un bypass) pero se blindó con una segunda capa:
  `demoMode` ahora exige `NUXT_PUBLIC_DEMO_MODE=true` **y** `NODE_ENV !== 'production'`.
- **Commit:** `1bf95f2`.

### 3.5. Latencia del Tutor IA (~95s), reportada por el dueño del proyecto

- **Causa raíz con evidencia de logs:** `callGeminiApi()` ya prueba hasta 4 modelos candidatos con
  4s de timeout cada uno, pero se envolvía en `callWithRetry(..., openAiRetryCount=3)` —
  repitiendo la cascada completa de 4 modelos hasta 4 veces, con backoff de 2s/4s/8s entre cada
  una. Los `429` observados eran de cuota real agotada de la API key de Gemini ("exceeded your
  current quota"), que un retry de segundos no resuelve.
- **Corrección:** se redujo a 1 solo retry del ciclo completo.
- **Verificado en vivo, antes/después:** ~95s → 26s (11:10:39 → 11:11:05) hasta caer al mock
  socrático local. La causa de fondo (cuota de la API key) sigue sin poder resolverse desde el
  código — esto acota la espera del estudiante, no elimina los fallos de Gemini en sí.
- **Commit:** `0879f9d`.

### 3.6. Regla de Oro: 2 tests preexistentes en rojo, no causados por esta sesión

- Al correr la suite completa se encontraron `tutor.e2e-spec.ts` y `validate-pre-frontend.spec.ts`
  en rojo. Se verificó con `git stash` que ya fallaban en el árbol commiteado **antes** de
  cualquier cambio de esta sesión — venían del mismo commit `c989c15` de esa mañana. Se corrigieron
  como parte del hallazgo 3.3 (no era solo actualizar aserciones, sino restaurar contenido
  pedagógico real perdido).

---

## 4. Estado de Conectividad y Endpoints Verificados en Vivo

| Método | Endpoint | Código HTTP | Resultado Verificado |
| :--- | :--- | :--- | :--- |
| `POST` | `/submissions/start` | `201 Created` | Ya no 404; usa el `activityId` real del backend |
| `POST` | `/submissions/:id/run` (actividad `coding` real) | `201 Created` | 2/2 casos públicos superados |
| `POST` | `/submissions/:id/run` (actividad `fill_code`) | — (bloqueado en el frontend) | Ya no llega a pegarle mal a este endpoint |
| `POST` | `/submissions/:id/submit` | `201 Created` | `status:'submitted'`, nota real llega después por sondeo |
| `GET` | `/submissions/:id` **(nuevo)** | `200 OK` | `{status:'graded', totalScore:40, passedCount:1, totalCount:1}` |
| `POST` | `/tutor/chat` (con contexto de actividad) | `200 OK` | Responde en ~26s en fallas de Gemini (antes ~95s); usa el contexto real en la respuesta |

---

## 5. Commits de la Sesión (todos locales — sin push, sin autorización pedida)

| Commit | Descripción |
| :--- | :--- |
| `4692ea0` | Guard de `switchRoleForDemo` a nivel de función, no solo de plantilla |
| `e52b931` | `.claude/launch.json` — separa config de backend (3001) y frontend (3000) |
| `4bc557d` / `b586ede` | `docs/00_VISION_FUNCIONAL.md` §9 — checkpoints de verificación en vivo |
| `29575e6` | Fix bug FILL_CODE → sandbox de CODING + modal de entrega honesto |
| `5310967` | `GET /submissions/:id` + sondeo de calificación asíncrona en el frontend |
| `098ffc8` | Restaura adaptación pedagógica por nivel en el Tutor IA |
| `1bf95f2` | Elimina selector de rol del header + blinda `demoMode` contra producción |
| `0879f9d` | Reduce retraso del Tutor IA de ~95s a ~26s |

---

## 6. Próximos Pasos & Recomendaciones

1. Sembrar contenido curricular real para las clases del Prof. Castro y del Prof. Ali (hoy vacías)
   para poder demostrar "distintos docentes, distinto contenido" con datos reales.
2. Backend: estado `PENDING` en `EnrollmentStatus` + endpoint de aprobación/rechazo docente +
   endpoint para quitar un estudiante puntual de una clase.
3. Investigar en profundidad qué tan armado está el "peso por unidad de aprendizaje" antes de
   proponer un motor de recomendación de actividad por dominio — `adaptiveWeight` ya es real, pero
   no hay selección previa.
4. La causa de fondo de la latencia del Tutor (cuota de la API key de Gemini) no se puede arreglar
   desde el código — evaluar si conviene una key de mayor cuota o un modelo de respaldo distinto
   antes de la sustentación.
