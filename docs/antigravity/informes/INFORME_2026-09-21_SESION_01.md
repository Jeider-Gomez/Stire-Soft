# STIRE — Informe de Sesión Antigravity

**Código de Documento:** INF-AGY-2026-09-21-01  
**Fecha:** 2026-09-21  
**Hora de Ejecución:** 15:30–16:00 (UTC-5)  
**Agente / Asistente:** Antigravity (Google DeepMind)  
**Ambiente:** Desarrollo Local (`localhost`)  
**Stack Activo:** Nuxt 3 (Frontend `:3000`) + NestJS (Backend `:3001`) + MariaDB (`basestire`) + Google Gemini AI  
**Fase Ejecutada:** Fase 22 de `docs/antigravity/PLAN_IMPLEMENTACION.md` (Tareas T1 a T4)  

---

## 1. Resumen Ejecutivo

En esta sesión se abordaron y resolvieron las cuatro correcciones puntuales identificadas durante la auditoría de la Fase 21, circunscritas exclusivamente a `frontend-nuxt/` sin intervenir el backend ni modificar tokens de diseño:

1. **T1 — Aviso de repasos y botón «Ir al contenido» sin clave API:** Se extrajo el aviso de repasos vencidos del bloque `v-else` en `components/tutor/TutorChatDrawer.vue` para posicionarlo en la cabecera activa, garantizando su visibilidad inmediata para estudiantes que no han configurado clave de Google (como Pedro). Asimismo, el botón «Ir al contenido de la unidad» se reubicó en la franja de contexto superior (`activeContext`), haciéndolo accesible sin depender del estado del panel de clave.
2. **T2 — Gestión de foco y tecla Escape (Drawer y diálogo de limpieza):**
   - En `TutorChatDrawer.vue`, se agregó `tabindex="-1"` al contenedor y se consolidó la captura del elemento disparador sincrónicamente antes del `nextTick`. Al abrir el drawer, el foco se posiciona en el input o en el botón de cerrar como alternativa segura; al presionar `Escape`, se cierra y devuelve el foco al botón de apertura.
   - En `pages/admin/sistema.vue`, se integró `handleDialogKeydown` para atrapar el foco con Tab dentro del modal y permitir el cierre inmediato con `Escape` mediante `cancelCleanup()`, sin disparar la petición de limpieza. Al abrir, el foco se coloca automáticamente en «Cancelar» (opción segura) y, al cerrar, retorna al botón «Ejecutar Limpieza».
3. **T3 — Aislamiento del contexto de actividad en el Tutor:** En `stores/tutor.ts`, la función `fetchGuidanceLevel()` ahora evalúa explícitamente la ruta activa (`route.path.match(/^\/estudiante\/evaluacion\/\d+$/)`). Si el estudiante se encuentra fuera del workspace de una actividad (por ejemplo, navegando de regreso a `/estudiante`), no se envía `activityId` en la consulta `GET /tutor/guidance`, evitando arrastrar vínculos o niveles de una actividad anterior.
4. **T4 — Insignias de estado condicionales en ADM-V01:** En `pages/admin/dashboard.vue`, se eliminaron las insignias fijas de éxito («✔») en las filas de Sandbox, Cola de Calificación y Tutor Socrático. Ahora se evalúan reactivamente contra `database.ok`. En caso de desconexión o fallo en la base de datos, se despliega «— Sin datos» o estado degradado en lugar de presentar confirmaciones engañosas de operatividad.

---

## 2. Plan de Implementación Ejecutado

**Referencia:** [`docs/antigravity/PLAN_IMPLEMENTACION.md §22`](../PLAN_IMPLEMENTACION.md#L17)

| Tarea | Componente / Archivo | Descripción | Estado | Commit |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | `frontend-nuxt/components/tutor/TutorChatDrawer.vue` | Aviso de repasos y botón «Ir al contenido» visibles tanto con clave como sin clave API | ✅ Completado | `3ceb77b` |
| **T2** | `frontend-nuxt/components/tutor/TutorChatDrawer.vue`<br>`frontend-nuxt/pages/admin/sistema.vue` | Foco accesible en «Cancelar» y drawer, Escape sin ejecutar y trampa de Tab | ✅ Completado | `ac4458d` |
| **T3** | `frontend-nuxt/stores/tutor.ts` | Restricción de `activityId` a la ruta `/estudiante/evaluacion/:id` en `fetchGuidanceLevel` | ✅ Completado | `37a8238` |
| **T4** | `frontend-nuxt/pages/admin/dashboard.vue` | Insignias de subsistemas supeditadas a `database.ok` evitando falsos positivos | ✅ Completado | `9f23d0c` |

---

## 3. Auditoría Técnica Realizada

### 3.1. Accesibilidad y Foco (T2)
- **Problema:** En el drawer del Tutor, `Escape` no cerraba el panel si el foco no había ingresado al contenedor. En el diálogo de confirmación de mantenimiento en `/admin/sistema`, el foco permanecía en `document.body`, permitiendo tabular fuera del diálogo y no cerraba con `Escape`.
- **Causa Raíz:** Ausencia de gestión explícita de `activeElement` en la apertura/cierre y falta de captura del evento `@keydown.esc` en el contenedor modal.
- **Acción Correctiva:** Implementación de trampa de foco, asignación de foco inicial a «Cancelar» en modal y botón de cierre en drawer, con retorno de foco al elemento de apertura guardado previamente.

### 3.2. Contaminación de Estado en Navegación SPA (T3)
- **Problema:** Tras salir de una actividad hacia `/estudiante`, el drawer del Tutor seguía mostrando el enlace a la unidad didáctica de la actividad previamente visitada.
- **Causa Raíz:** `workspaceStore.currentExercise` retenía el objeto en memoria tras la navegación, y `fetchGuidanceLevel()` lo leía como fallback incondicional.
- **Acción Correctiva:** Validación de la ruta actual mediante expresión regular (`route.path`) para vincular `activityId` exclusivamente cuando el usuario está en `/estudiante/evaluacion/:id`.

### 3.3. Veracidad de Telemetría (T4)
- **Problema:** Los subsistemas de Sandbox, Cola y Tutor mostraban marcas «✔» hardcodeadas independientemente de la disponibilidad del sistema.
- **Causa Raíz:** Etiquetas fijas en el template sin enlace a `database.ok`.
- **Acción Correctiva:** Vinculación condicional a `database.ok` mostrando «— Sin datos» ante fallos de conexión.

---

## 4. Estado de Conectividad y Endpoints Verificados

| Método | Endpoint | Rol Requerido | Parámetros / Payload | Código HTTP | Resultado Verificado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/tutor/guidance` | `estudiante` | Ninguno (en `/estudiante`) | `200 OK` | Devuelve `dueReviews` sin arrastrar contexto de actividad previa |
| `GET` | `/tutor/guidance` | `estudiante` | `?activityId=44` (en evaluación) | `200 OK` | Devuelve `contentLink` hacia la unidad y nivel de andamiaje |
| `GET` | `/admin/system/status` | `admin` | Ninguno | `200 OK` | Telemetría real; al tener `database.ok: false`, subsistemas reflejan «— Sin datos» |
| `POST` | `/maintenance/cleanup` | `admin` | Ninguno | `200 OK` | Se ejecuta únicamente tras confirmación explícita (Escape cancela sin invocar) |

---

## 5. Pruebas de Calidad (QA) y Verificación

- **Typecheck TypeScript (`npx nuxi typecheck`):**
  Ejecutado tras la implementación de las tareas. Finalizado con **código de salida 0 (0 errores de compilación)**.
- **Git y Commits Atómicos:**
  Se crearon 4 commits individuales en español, respetando las convenciones del repositorio:
  - `3ceb77b`: `feat(tutor): T1 aviso repasos y boton contenido visible sin clave API (Fase 22)`
  - `ac4458d`: `fix(a11y): T2 foco y Escape en drawer Tutor y dialogo limpieza (Fase 22)`
  - `37a8238`: `fix(tutor): T3 no enviar activityId al abrir Tutor fuera de la evaluacion (Fase 22)`
  - `9f23d0c`: `fix(admin): T4 insignias de estado condicionales a database.ok en ADM-V01 (Fase 22)`

---

## 6. Conclusión

La **Fase 22** ha concluido con éxito, subsanando la totalidad de observaciones de la auditoría anterior y dejando el código completamente tipado, accesible y consistente con los principios del proyecto STIRE.
