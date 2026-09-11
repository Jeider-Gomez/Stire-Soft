# STIRE — Informe de Sesión Claude Code

**Código de Documento:** INF-CC-2026-09-11-01
**Fecha:** 2026-09-11
**Agente / Asistente:** Claude Code (Sonnet 5)
**Ambiente:** Desarrollo Local (`localhost`) — backend `:3001` + frontend `:3000` levantados en
vivo durante la verificación final
**Stack Verificado:** NestJS + MariaDB (`basestire`) + Nuxt 3

---

## 1. Resumen Ejecutivo

Codex ejecutó las 3 fases de `docs/codex/PLAN_IMPLEMENTACION.md` (motor de selección por dominio,
moderación de matrícula, currículo real para Castro/Ali) y las dejó en 4 commits sobre `main`. Antes
de darlas por buenas, esta sesión auditó cada fase contra el código real — mismo criterio aplicado
toda la sesión anterior con los informes de Antigravity — usando 3 subagentes de exploración en
paralelo, uno por fase, cada uno corriendo `npm run build`/`npm test` reales, no solo leyendo
código. La auditoría encontró que Fase A estaba sólida, Fase B tenía dos gaps de terminación
(un test de regresión faltante y una página huérfana sin forma de llegar a ella), y **Fase C
cumplía la letra del plan pero no el espíritu**: contenido de relleno genérico, idéntico entre las
dos clases salvo el nombre — exactamente el patrón de "funcionalidad que aparenta pero no cumple"
que este proyecto viene cerrando desde el inicio. Los 3 hallazgos se corrigieron, y verificando esas
correcciones en el navegador se encontraron y corrigieron 2 bugs más que ningún informe anterior
había reportado. Al cierre, el dueño del proyecto autorizó explícitamente el push y los 6 commits
de la sesión quedaron publicados en `origin/main`.

**Regla de Oro en cada punto de cierre:** `npm run build` sin errores + `npm test` en 298/299 (la
única falla es `validate-pre-frontend.spec.ts`, un test de sandbox ya documentado en `CLAUDE.md`
como sensible a la carga de memoria del sistema — pasa 13/13 en aislado) + `npx nuxi typecheck` en
0 errores. Todo verificado también en navegador real, no solo con tests.

---

## 2. Auditoría de las 3 Fases de Codex (3 subagentes en paralelo)

| Fase | Commit de Codex | Veredicto | Hallazgos |
| :--- | :--- | :--- | :--- |
| A — recomendación por dominio | `7284492` | ✅ Sólida | Reutiliza la fórmula de aprobación ya normalizada (extraída a `isSubmissionPassed` compartida, no reimplementada distinta); 3 tests reales que pasan; frontend conectado de verdad al endpoint nuevo. Sin hallazgos serios. |
| B — moderación de matrícula | `7aa51e8` | ⚠️ Backend sólido, 2 gaps de terminación | (1) Sin test de regresión para el camino SIN `requiresApproval` — solo se probó el camino con el flag activado. (2) La página `/docente/clase/[classId]` quedaba huérfana: sin link de navegación ni forma de activar `requiresApproval` (no existe pantalla de creación de clase). Backend en sí correcto: migración real, BOLA sin huecos, reject/remove es soft-delete real. |
| C — currículo Castro/Ali | `5788201` | ⚠️ Cumple la letra, no el espíritu | Estructura correcta (progresión mcq→fill_code→coding, `findOrCreate` idempotente, `config` que el evaluador sí califica, `passingScore` normalizado) pero el contenido era relleno genérico e **idéntico entre las dos clases** salvo el nombre ("La opción correcta"/"Una opción alternativa", `2+2`, el mismo desafío de eco copiado en ambas). El plan pedía explícitamente no repetir contenido entre clases. |

---

## 3. Correcciones de los 3 Hallazgos

### 3.1 Fase C — currículo real, no relleno

Reemplazado `seedClassCurriculum()` (plantilla genérica con el nombre de la materia interpolado)
por contenido real y distinto por dominio: Castro (algoritmos, condicionales, búsqueda lineal vs.
binaria, números primos), Ali (validación de formularios, `filter`/`map` sobre listas, ordenamiento
para renderizar). Como los títulos cambiaron, el contenido de relleno anterior quedó huérfano en la
BD de desarrollo (`findOrCreate` matchea por título) — se limpió a mano con un script de un solo uso
(no versionado). Verificado: `npm run seed` corrido 2 veces seguidas sin duplicar filas, y en
navegador el Tutor recomendando la actividad real de Castro.

**Commit:** `d1fdf19`.

### 3.2 Fase B — conectar la UI y cubrir la regresión

Agregado el botón "Gestionar matrícula" en cada tarjeta de clase de `/docente/index.vue`, y un
toggle de `requiresApproval` en la propia página de gestión (hace `PATCH /class/:id`, reusa el DTO
que ya lo soportaba). Agregados 2 tests que confirman que `joinClass()` sigue dando `ACTIVE` de
inmediato para clases sin el flag (Toscano, Castro, Ali — cero regresión). De paso, corregido un bug
menor en la misma función: la ruta de "remove" armaba `/enrollment/:id/` con slash final.

**Verificado en navegador real:** toggle activado → estudiante nuevo que se matricula queda
`pending` → aparece en "Solicitudes pendientes" → Aprobar lo mueve a "Estudiantes activos".

**Commit:** `3306212`.

---

## 4. Hallazgos Nuevos, Encontrados Verificando lo Anterior

### 4.1 `GET /activities?learningUnitId=` devolvía 400 pese a estar documentado

- **Síntoma:** al construir la lista de "elegir yo mismo" en la pantalla de unidad, la llamada al
  endpoint que el propio `@ApiQuery` del controller documenta como válido fallaba con
  `400 Bad Request`.
- **Causa raíz:** el `ValidationPipe` global corre con `whitelist:true` + `forbidNonWhitelisted:true`
  (`src/main.ts`). `learningUnitId` llegaba por un `@Query('learningUnitId')` aparte del binding
  `@Query() paginationQuery: PaginationQueryDto` — pero ese segundo binding ve el query string
  **completo** y rechaza cualquier propiedad no declarada en el DTO: *"property learningUnitId
  should not exist"*. El filtro nunca funcionó vía HTTP, solo parecía existir por la anotación
  Swagger.
- **Corrección:** `FindActivitiesQueryDto extends PaginationQueryDto` declara `learningUnitId` como
  campo propio. 20/20 tests de `activities` pasan.
- **Commit:** `82abd9c`.

### 4.2 `/estudiante/unidad/[id].vue`: crash 500 y contenido fabricado

- **Síntoma:** navegar directo a la URL de una unidad (no vía clic interno de la SPA) daba
  `500 — Cannot read properties of undefined (reading 'units')`.
- **Causa raíz:** `unitData` dependía de `studentStore.modules[0].units[0]` sin ninguna guarda
  cuando la unidad buscada no estaba en ese store local. Además — **esto no era el bug que se
  buscaba, se encontró leyendo el resto del archivo** — el cuerpo entero de la lección (texto
  teórico, ejemplo de código, "Trazado de Memoria" interactivo) era una plantilla fija idéntica sin
  importar la unidad real: para el quiz "¿Qué es un algoritmo?" mostraba un ejemplo de bucles que no
  tenía nada que ver.
- **Corrección:** la página ahora carga datos reales — `GET /learning-unit/:id` (título/descripción)
  y `GET /content/unit/:id` (el Markdown ya sembrado para cada unidad, renderizado con la misma
  función `formatMarkdown` que ya usa `evaluacion/[activityId].vue`). Estado de carga y de error
  explícitos en vez de indexar a ciegas en un array que puede estar vacío.
- **Hallazgo relacionado:** la tarjeta "Continuar Ejercicio" de `/estudiante/index.vue` recomendaba
  una actividad **distinta** a la que mostraba esta misma pantalla para la misma unidad — usaba un
  heurístico local (`studentStore`, "primera actividad cuyo título contenga 'código'/'desafío'") que
  salta cualquier MCQ sin importar su `order`, porque un quiz nunca calza esas palabras. Unificado:
  ambas pantallas ahora llaman al mismo motor real (`GET .../next-activity`, Fase A).
- **Verificado en navegador real:** navegación directa a `/estudiante/unidad/24` ya no revienta,
  muestra el contenido real de Castro, "Tu siguiente paso" recomienda el MCQ correcto (actividad 42,
  `order:1`), y la tarjeta de Inicio ahora coincide con esa misma recomendación.
- **Commit:** `32c12e9`.

---

## 5. Commits de la Sesión y Push

| Commit | Descripción |
| :--- | :--- |
| `d1fdf19` | Reemplaza el currículo de relleno de Castro/Ali por contenido real |
| `3306212` | Conecta la moderación de matrícula a la UI y cubre el camino sin regresión |
| `82abd9c` | Fix del 400 en `GET /activities?learningUnitId=` |
| `32c12e9` | Conecta `/estudiante/unidad/[id].vue` a datos reales y corrige la recomendación de Inicio |

**Push a `origin/main` autorizado explícitamente por el dueño del proyecto** (`15b0bec..32c12e9`),
incluyendo también los 2 commits de la sesión anterior (`741b18f`, `228393e`) que seguían solo
locales.

---

## 6. Método de Auditoría (para reutilizar con la próxima entrega de Codex o Antigravity)

1. Nunca confiar en el mensaje de commit ni en un informe propio de la herramienta — verificar
   contra el código real, citando archivo:línea.
2. Correr `npm run build`/`npm test` de verdad, no asumir que "debería funcionar".
3. Reproducir el flujo en navegador real contra backend + BD reales — varios de los hallazgos de
   esta sesión (el 400 de `activities`, el 500 de `unidad/[id].vue`) solo aparecen así, nunca en un
   `curl` aislado ni leyendo el código.
4. Cuando el plan que gobernó la entrega tenía una restricción explícita (p. ej. "no repitas
   contenido entre clases"), verificar esa restricción puntualmente — cumplir la estructura no es lo
   mismo que cumplir la intención.

---

## 7. Próximos Pasos y Pendientes Reales

Ver el checklist maestro en `docs/PLAN_MAESTRO.md` para el estado consolidado de todo el proyecto.
Pendientes identificados en esta sesión, no resueltos todavía:

1. El sandbox de "Probar código" solo acepta JavaScript (§9.2, punto 4 de
   `docs/00_VISION_FUNCIONAL.md`) — sigue sin resolver.
2. `GET /learning-unit/:id` no verifica matrícula/propiedad de clase (a diferencia de
   `GET /content/unit/:id`, que sí lo hace) — encontrado de paso, no explotado, no corregido en esta
   sesión.
3. Despliegue (Vercel para el frontend; el backend necesita un host con proceso persistente y
   MariaDB real) sigue bloqueado en autorización del dueño del proyecto.
