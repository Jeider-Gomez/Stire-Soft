---
fecha:      2026-09-09
herramienta: Claude Code
estado:     ejecutado
resultado:  Bloques 0-4 cerrados, más una verificación de autenticación adicional pedida en la
            misma sesión de ejecución. Commits: c44498e (Bloque 1 — POST /submissions/:id/run +
            GET /review-schedules/due), 07de0f7 (Bloque 2 — diagnóstico del modelo
            Section-Topic-LearningUnit), 81bbef9 (Bloque 3 — login falso eliminado),
            f4f1cae (Bloque 3 — parpadeo de recarga), 4eb2246 (verificación de auth —
            @Roles en 4 rutas de estudiante), 45ac307 (Bloque 4 — pantalla de Registro en Figma).
            Todo local, sin push.
---

# Prompt entregado a Claude Code — FASE CC-09

> Archivado tal como se entregó. No se edita después — si algo quedó desactualizado, el prompt
> siguiente lo hereda corregido, no se reescribe este.

```
# AUDITORÍA + CIERRE DE BACKEND — STIRE-Soft

## Herramientas disponibles — úsalas, no re-inventes el trabajo que ya hacen
- Skill `playwright-cli`: para el Bloque 0 y el Bloque 3, úsala para levantar el frontend-nuxt
  y el backend juntos y verificar en un navegador real (no solo con curl) que: (a) el login real
  funciona end-to-end con una cuenta sembrada, y (b) tras gatear el acceso-demo, esos botones ya
  NO aparecen con la variable de entorno en modo producción. Evidencia = capturas o el log de la
  sesión de Playwright, no solo "debería funcionar".
- Agente `Explore` (subagente de búsqueda): para el Bloque 2 y el Bloque 3, úsalo para localizar
  TODAS las referencias a `switchRoleForDemo`, a los props/variantes de "Topic", y a cualquier otro
  lugar que dependa de lo que vas a tocar, antes de tocar nada — no confíes en un solo grep manual.
- MCP de Figma (`use_figma`) para el Bloque 4: carga primero el skill `figma-use` (obligatorio
  antes de cualquier llamada a `use_figma`, es una regla dura del proyecto) y sigue su receta
  canónica para edición de texto (cargar fuente → await → mutar → return de IDs).
- No uses ninguna otra skill/plugin fuera de estas tres para este prompt.

## Contexto (arrastrar)
- Proyecto NestJS + TypeORM (MariaDB) en la raíz, frontend Nuxt 3 en frontend-nuxt/.
- La sesión Antigravity del 2026-09-07 (docs/informes-antigravity/INFORME_2026-09-07_SESION_01.md)
  ya dejó login real, Tutor con Gemini real, y un composable useApi() funcionando — no repitas esto.
- Antigravity tiene una Sesión 02 en cola que depende de que tú cierres el Bloque 1 de abajo.
- Modelo de contenido real (verificado en src/): Section 1—N Topic 1—N LearningUnit, y
  Activity/ActivityQuestion/ActivityType para evaluaciones. No asumas un modelo distinto.
- CLAUDE.md de este repo es la fuente de verdad de cómo se trabaja aquí (Regla de Oro, un commit
  por punto, prohibido `as any`/`@ts-ignore`, sin push sin confirmación explícita "PUSH AUTORIZADO").

## Bloque 0 — Auditoría de conexión real a la base de datos
- `npm run migration:run` + `npm run db:seed:demo` contra una BD real; si la memoria libre del
  sistema es baja, sigue la nota de diagnóstico de CLAUDE.md antes de sospechar del código.
- Con `playwright-cli`, haz login real en el navegador contra una cuenta sembrada y confirma en la
  pestaña de red que la respuesta viene de una fila real, no de un valor por defecto.
- Reporta con evidencia (captura + petición/respuesta) qué endpoints están genuinamente conectados
  hoy — no "el endpoint existe".

## Bloque 1 — Los dos endpoints que bloquean la demo del 15/17 de septiembre
**`POST /submissions/:id/run`** — ejecuta SOLO los casos `isPublic: true` reutilizando
`JudgeExecutionService`. NO crea intento, NO modifica `attemptsCount`, NO dispara
`submission.graded`, NO toca `mastery`. `@Roles('estudiante')` + verificación de propiedad de la
submission. Test: tras llamar `/run` N veces, `attemptsCount` no cambia y ningún caso oculto
aparece en la respuesta.

**`GET /review-schedules/due`** — repasos vencidos/del día por estudiante con urgencia (al día ·
mañana · vencido · crítico), `@Roles('estudiante')`, alcance al propio estudiante. Persiste
`easeFactor` (hoy se calcula y no se guarda). Test: un estudiante no puede ver los repasos de otro.

Actualiza `docs/modesec/02_CATALOGO_ENDPOINTS.md`, `07_REPETICION_ESPACIADA.md` y
`12_CONTRATO_FRONTEND_BACKEND.md` — retira `PROPUESTO — NO IMPLEMENTADO` de lo que ahora existe.
Documenta la forma exacta de respuesta con precisión — Antigravity la consume literal.

## Bloque 2 — Auditoría del modelo de contenido (Section → Topic → LearningUnit → Activity)
El dueño del proyecto percibe los "Topics" como "un poco complejos" y los quiere "más escalables y
más didácticos" — el esquema real (`src/topic/entities/topic.entity.ts`) es simple: título,
descripción, orden, isActive, sectionId. Antes de tocar nada:
1. Usa `Explore` para localizar TODOS los lugares donde este modelo se define o se presenta: las 3
   entidades reales, el seeder, la documentación MODESEC de contenidos, y la vista DOC-V02 del
   frontend si ya existe.
2. Determina si la complejidad percibida viene del ESQUEMA, del CONTENIDO sembrado, o de la
   DOCUMENTACIÓN — son problemas distintos.
3. NO apliques un cambio de esquema todavía. Devuelve un diagnóstico corto y una propuesta — el
   dueño del proyecto la aprueba antes de implementarse.

## Bloque 3 — Retirar el bypass de autenticación del uso normal (ÚNICO dueño de esta tarea)
`frontend-nuxt/components/layout/HeaderNav.vue` (selector Estudiante/Docente/Admin, llama
`authStore.switchRoleForDemo(...)`) y `frontend-nuxt/pages/auth/login.vue` (tres botones de "Acceso
rápido de demostración") bypasean el login real. Usa `Explore` primero para confirmar que no hay
más lugares que dependan de `switchRoleForDemo`. Gátialos detrás de `NUXT_PUBLIC_DEMO_MODE=true`
(solo desarrollo) — no los borres. Verifica con `playwright-cli`, en modo producción simulado, que
ya no son visibles ni alcanzables. NO toques las etiquetas de código MODESEC visibles en la UI
(badge "ADM-V02", etc.) — esas se quedan, son correctas y así lo pidió el dueño del proyecto.

## Bloque 4 — Pantalla de Registro en Figma
`COMP-V00` en Figma (fileKey 1MjKiDrjU65ezO3ztO0v4m) solo tiene 4 estados de Login — no existe un
frame de Registro, aunque el backend ya expone `POST /auth/register`. Carga el skill `figma-use` y
construye `COMP-V00 · Registro` reutilizando el layout y los tokens exactos del Login existente.
Wíralo: Login → "Registrarse" → Registro, y Registro → éxito → redirección por rol.

## Regla de Oro
`npm run build` + `npm test` tras cada bloque. Un commit por bloque. Flaky conocido de timing:
repetir antes de reportarlo como regresión.

## Al terminar cada bloque
DETENTE y reporta: qué se verificó/implementó, la forma exacta de respuesta de los endpoints nuevos,
y — Bloque 2 — el diagnóstico sin aplicar el cambio. No avances sin confirmación del dueño.
```

## Qué pasó después de entregarlo (no forma parte del prompt, es el registro de ejecución)

Durante la ejecución, dentro de la misma sesión, el dueño del proyecto pidió explícitamente
verificar el sistema de autenticación de punta a punta antes de seguir ("quiero que verifiques el
sistema de autenticación... no quiero que vayamos dejando cabos sueltos"). Esa verificación,
ejecutada como extensión natural del Bloque 3, encontró y cerró dos hallazgos que no estaban en el
prompt original:
- 4 rutas de estudiante sin `@Roles()` (`/submissions/start`, `/submissions/:id/submit`,
  `/submissions/:id/autosave`, `/tutor/chat`) — un docente o admin autenticado podía llamarlas.
- Una condición de carrera real entre la hidratación de sesión y el middleware de rutas, que
  producía un parpadeo visible a `/auth/login` en cada recarga de página.

Ver `docs/antigravity/README.md` y `MONITOREO_SEMANAL.md` para el detalle completo de ambos.
