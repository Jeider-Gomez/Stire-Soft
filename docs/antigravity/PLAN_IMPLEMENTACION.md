---
estado:     completado — Fase 21 completada y verificada
verificado: 2026-09-20 contra frontend-nuxt/ y src/ reales
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    ADM-V01 · ADM-V03 · EST-V01 · EST-V02 · Tutor IA (chat)
---

# Plan de implementación para Antigravity — Fase 21

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 20 ya están hechas y se archivaron
completas en
[`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md`](../_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md)
(§16 a §20) y en
[`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md`](../_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md)
(Fases 1 a 15). **No las leas para ejecutar esta fase**: nada de lo que dicen hay que rehacerlo.
La numeración continúa en 21 para no romper citas.

---

## 21. Fase 21 — datos reales en el panel de administración, "Ir al contenido" y repasos en el chat

### 21.0 En una línea

Cuatro tareas (T1 a T4), **solo en `frontend-nuxt/`**. El backend ya está terminado y verificado: los endpoints
de esta fase existen y responden. **No lo toques.** Si un endpoint no responde como dice este
documento, para y repórtalo en el informe; no lo compenses inventando datos en el frontend.

### 21.1 Reglas de esta fase

1. **No inventes datos.** Si el backend devuelve `null`, muestra "—" o "Sin datos". Nunca `0`, nunca
   un valor de ejemplo. El motivo de toda la fase es que dos pantallas mostraban cifras falsas.
2. **No cambies estilos.** No edites `tailwind.config.ts` ni `assets/css/main.css`, y usa las clases y
   tokens que ya existen. Otra persona rediseñará la identidad visual en una rama aparte; tus cambios
   de estilo chocarían con los suyos.
3. **Un commit por tarea** (T1 a T4), mensaje en español, sin `--no-verify`. No agrupes tareas.
4. Verifica en **navegador real** con el backend levantado, no solo con `npx nuxi typecheck`.
5. Cuentas de prueba: solo las demo del [`README.md`](../../README.md) raíz.

### 21.2 Contrato del backend (ya implementado)

Todas las rutas usan el token de sesión de siempre (`useApi()`).

**`GET /admin/system/status`** — solo rol `admin` (docente y estudiante reciben 403). Límite:
30 peticiones por minuto por usuario.

```ts
interface SystemStatus {
  generatedAt: string                       // ISO
  api: {
    version: string; nodeVersion: string; environment: string
    uptimeSeconds: number
    memory: { rssMb: number; heapUsedMb: number }
    requests: {                             // últimas 500 peticiones del servidor
      sampled: number; windowSeconds: number | null
      p50Ms: number | null; p95Ms: number | null
      serverErrorRatePct: number | null     // solo respuestas 5xx
    }
  }
  database: { ok: boolean; latencyMs: number | null }
  sandbox: {
    adapter: string; timeoutMs: number; maxHeapMb: number; maxOutputKb: number
    executionsLast24h: number | null; avgExecutionMs: number | null
  }
  judgeQueue: { driver: 'inline' | 'redis'; submissionsInProgress: number | null }
  tutor: {
    provider: string; model: string
    studentsWithKey: number | null; studentMessagesLast24h: number | null
  }
  users: { total: number; byRole: Record<string, number> } | null
  submissionsLast24h: number | null
}
```

Si la base de datos está caída, `database.ok` es `false` y todo lo que dependía de ella llega `null`;
el endpoint igual responde 200.

**`GET /admin/system/logs?level=todos|error|warn|info&limit=1..500`** — solo `admin`.

```ts
interface SystemLogs {
  entries: Array<{ timestamp: string; level: 'error' | 'warn' | 'log' | 'debug' | 'verbose' | 'fatal';
                   context: string | null; message: string }>   // más recientes primero
  capacity: number                           // 500
  note: string                               // "…se vacía al reiniciar el servidor."
}
```

Un `level` o `limit` fuera de rango responde 400.

**`GET /tutor/guidance?activityId=`** — solo `estudiante`. `activityId` es opcional. **Cambió:** ahora
trae dos campos más.

```ts
interface TutorGuidance {
  success: boolean
  guidanceLevel: 1 | 2 | 3 | null           // null sin actividad
  tutorEnabled: boolean
  maxGuideLevel: 1 | 2 | 3
  dueReviews: {                             // null si el docente desactivó el Tutor
    overdueCount: number                    // repasos que tocan hoy o están atrasados
    scheduledCount: number
    oldest: { learningUnitId: number; learningUnitTitle: string | null; daysOverdue: number } | null
  } | null
  contentLink: { learningUnitId: number; title: string } | null
                                            // unidad de la actividad actual; null sin actividad
                                            // o si el estudiante no puede leerla
}
```

`daysOverdue` vale `0` cuando el repaso toca hoy.

**Ya existe y no cambia:** `POST /maintenance/cleanup` (solo admin).

---

### T1 — ADM-V01 «Estado del Sistema» con datos reales

Archivo: `pages/admin/dashboard.vue`.

- **Quita** el aviso «Ejemplo — sin backend (D-03)» (líneas 3 a 9), el botón «Simular Estado Error»
  con su estado `isSimulatedError`, y **todos los valores escritos a mano**.
- Llama a `GET /admin/system/status` al entrar y **cada 30 s** mientras la pestaña esté visible
  (`document.visibilityState`); limpia el intervalo al salir de la página. No bajes de 15 s: el
  servidor limita a 30 peticiones por minuto.
- **Cuatro tarjetas**, con este mapeo:

| Tarjeta | Valor principal | Detalle |
|---|---|---|
| API | `api.requests.p95Ms` en ms | `p50Ms`, `serverErrorRatePct` % y «sobre las últimas `sampled` peticiones». Si `sampled` es 0: «Sin peticiones aún» |
| Sandbox | `sandbox.avgExecutionMs` en ms | `executionsLast24h` ejecuciones en 24 h. Si es `null`: «Sin ejecuciones en 24 h» |
| Base de datos | `database.latencyMs` en ms | Si `database.ok` es `false`: estado de error visible y «Sin conexión» |
| Tutor | `tutor.model` | `studentsWithKey` estudiantes con clave y `studentMessagesLast24h` mensajes en 24 h |

- **Tabla «Subsistemas»** con filas reales: API (versión, entorno, tiempo activo legible, memoria
  `rssMb`), Base de datos, Sandbox (`adapter`, `timeoutMs`, `maxHeapMb`), Cola del juez (`driver` y
  `submissionsInProgress` en curso) y Tutor. Elimina la columna «Último latido»; en su lugar muestra
  «Actualizado a las HH:MM:SS» con `generatedAt`.
- Agrega una línea con `users.byRole` (por ejemplo «18 estudiantes · 12 docentes · 2 administradores»)
  y `submissionsLast24h`.
- Estados: cargando, error de red o 403 (mensaje claro y botón «Reintentar») y datos parciales
  (cada `null` se pinta «—»). El estado de cada tarjeta se distingue por texto o ícono, no solo por
  color.

### T2 — ADM-V03 «Logs y Mantenimiento» con datos reales

Archivo: `pages/admin/sistema.vue`.

- **Quita** el aviso «Ejemplo — sin backend (D-03)» (líneas 3 a 9), el arreglo fijo `systemLogs`, el
  «Gemini 1.5 Flash» escrito a mano (línea ~65) y la frase «cola BullMQ, caché Redis» del subtítulo
  (línea ~24; no es cierto). Subtítulo nuevo: «Parámetros del sandbox y eventos recientes del
  servidor».
- **Parámetros globales, solo lectura**, desde `GET /admin/system/status`: `sandbox.timeoutMs`,
  `sandbox.maxHeapMb`, `sandbox.maxOutputKb` y `tutor.model`. Indica que los fija el servidor y no se
  editan aquí.
- **Visor de eventos** con `GET /admin/system/logs`:
  - Filtro «Todos / Errores / Advertencias / Info» (`level`) y `limit=100`.
  - Botón «Actualizar» y refresco cada 30 s mientras la pestaña esté visible.
  - Cada fila: hora local, nivel (**con texto**, no solo color), `context` y `message`.
  - Muestra el `note` que devuelve el servidor, visible, para que quede claro que es una ventana en
    memoria.
  - Sin resultados: «Sin eventos con este filtro».
  - Contenedor con `role="log"` y `aria-live="off"` (que no interrumpa a un lector de pantalla cada
    30 s).
  - **Quita** el enlace «Limpiar visor»: no existe endpoint para borrar eventos.
- **Mantenimiento** (`POST /maintenance/cleanup`, ya conectado): quita el mensaje de éxito
  «(simulación completada)» que se muestra cuando la llamada **falla** (línea ~136): si falla, muestra
  el error real. Quita también el evento falso que se agrega al visor tras ejecutarlo (línea ~133).
  Antes de ejecutarlo, pide **confirmación** (es una escritura masiva).

### T3 — Dos defectos visibles del estudiante

**3a. «Inscrito el fecha reciente».** `pages/estudiante/clases.vue` (líneas ~125, ~153 y ~238). La
fecha de matrícula llega del backend como **`joinedAt`**, no como `createdAt` ni `enrolledAt` (esos
campos no existen). Lee `item.joinedAt`, tipa `joinedAt?: string` en `EnrollmentItem`, y muestra
«Inscrito el 12 sep 2026». Si de verdad falta, no muestres la frase (en vez del texto «fecha
reciente»).

**3b. Píldora vacía «•» en la cabecera.** En `/estudiante/clases` y en `/estudiante/unidad/:id`, el
centro de `components/layout/HeaderNav.vue` (líneas ~28 a 30) muestra un punto sin nombre de clase ni
docente. Causa: `studentStore.currentClassName` y `currentTeacher` solo se llenan cuando se ejecuta
`fetchStudentData()`, y hoy solo la llama `pages/estudiante/index.vue`. Cárgalos desde
`layouts/student.vue` cuando el store esté vacío (una sola vez, sin repetir peticiones). Si aun así no
hay clase, no dibujes la píldora.

### T4 — Tutor: «Ir al contenido» y repasos vencidos dentro del chat

**4a. `stores/tutor.ts`, `fetchGuidanceLevel()`.** Hoy sale sin llamar al servidor cuando no hay
actividad (`if (!id)`, líneas ~140 a 145). Cámbialo: **siempre** llama a `GET /tutor/guidance` al
abrir el chat, con `?activityId=` solo si hay actividad. Guarda `dueReviews` y `contentLink` en el
store, además de lo que ya guarda. Sin actividad, `guidanceLevel` sigue siendo `null`, como hoy. Si la
llamada falla, `dueReviews` y `contentLink` quedan `null` y el chat sigue funcionando, como hoy.
No uses `GET /tutor/greeting` para esto: **escribe un mensaje en el historial cada vez que se llama**.

**4b. `types/index.ts`.** Actualiza `TutorGuidance` con la forma de §21.2.

**4c. `components/tutor/TutorChatDrawer.vue`.** Nada de esto se muestra si `tutorEnabled` es `false`.

- **Aviso de repasos.** Si `dueReviews.overdueCount > 0`, un bloque **encima del área de mensajes**
  (no dentro del historial): «Tienes N repaso(s) vencido(s)» con el plural correcto. Si hay `oldest`,
  agrega «El más atrasado: «{learningUnitTitle}» ({`toca hoy` si `daysOverdue` es 0, o `hace N
  día(s)`})»; si `learningUnitTitle` es `null`, omite el nombre. Botón «Ir a mis repasos» que cierra el
  chat y navega a `/estudiante/repasos`.
- **Botón «Ir al contenido».** Si `contentLink` no es `null`, un botón junto a las acciones rápidas del
  chat (las de «Pedir pista conceptual…»): «Ir al contenido de la unidad», con el `title` de la unidad
  en su `aria-label`. Cierra el chat y navega a `/estudiante/unidad/{learningUnitId}`. Si
  `contentLink` es `null`, **no lo muestres** (ni deshabilitado).
- Accesibilidad: ambos son controles reales (`button` o `NuxtLink`), alcanzables con teclado, y el
  aviso de repasos **no roba el foco** al abrirse el chat.
- Al salir de una actividad, comprueba que el código quedó guardado (el editor muestra
  «Autoguardado sincronizado»). Si hay cambios sin sincronizar, pide confirmación antes de navegar.

---

### 21.3 Cómo verificar

Levanta el backend y el frontend como siempre. Para el Tutor no necesitas una clave de Google:
`guidance` no llama a Google.

| Tarea | Prueba |
|---|---|
| T1 | Entra como `admin.sistema@unicor.edu.co`. Compara cada cifra de la pantalla con la salida de `GET /admin/system/status` (que puedes ver en la pestaña Red). Interceptando la respuesta con `database.ok: false`, la tarjeta muestra «Sin conexión» y la página no falla. Como docente, `/admin/dashboard` sigue redirigiendo a `/docente`. |
| T2 | Filtra por Errores y por Advertencias. Ejecuta el mantenimiento: pide confirmación y muestra el resultado real. Detén el backend y vuelve a pulsar «Actualizar»: se ve un error, no un éxito falso. |
| T3 | Como `pedro.estudiante@unicor.edu.co`, `/estudiante/clases` muestra fechas reales; recarga `/estudiante/unidad/24` con F5 y la cabecera muestra la clase y el docente. |
| T4 | Con Pedro, abre el chat en `/estudiante`: aparece el aviso de repasos (hoy tiene 7 vencidos; el número varía con la fecha) y **no** hay botón de contenido. Abre el chat dentro de la actividad `44` («Máximo de una Lista»): aparece el botón y lleva a `/estudiante/unidad/24`. Como docente, desactiva el Tutor de la clase en el panel de Fase 20: en el chat del estudiante desaparecen aviso y botón (devuélvelo a su estado). |

**Búsqueda final, debe dar cero resultados:**
`grep -rnE "99\.98|1\.5 Flash|BullMQ|Simular Estado|systemLogs|fecha reciente" frontend-nuxt/pages frontend-nuxt/components`

### 21.4 Criterios de cierre

- [ ] `npx nuxi typecheck` termina con código 0.
- [ ] La búsqueda final no encuentra nada.
- [ ] Las tablas de §21.3 se probaron en navegador real, con lo observado anotado en el informe.
- [ ] Cuatro commits, uno por tarea.
- [ ] Informe en `docs/antigravity/informes/` siguiendo `TEMPLATE_INFORME.md`, **solo con lo que hiciste y
      verificaste**. Si algo no se pudo probar, dilo.
- [ ] Capturas nuevas (opcionales) en `docs/material-visual/` con la convención de su README, **sin
      datos personales**: usa solo cuentas demo y evita las pantallas del docente que listan a todos
      los estudiantes matriculados.

### 21.5 Fuera de alcance

Cambios en el backend · rediseño visual · editar los parámetros del sandbox desde la pantalla ·
gráficas históricas · logs persistentes · iniciar un repaso directamente desde el chat · nuevos
endpoints.
