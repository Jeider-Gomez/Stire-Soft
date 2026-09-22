---
estado:     pendiente — Fase 23 (sin ejecutar)
verificado: 2026-09-21 contra frontend-nuxt/ y src/ reales
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    EST-V05 (repasos) · ADM-V02 (usuarios) · COMP-V00 (registro)
---

# Plan de implementación para Antigravity — Fase 23

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 22 ya están hechas y archivadas en
[`docs/_archivo/`](../_archivo/). **No las leas para ejecutar esta fase.** La numeración continúa en 23.

---

## 23. Fase 23 — repasos que funcionan, roles de usuario y solicitud de rol docente

### 23.0 En una línea

Cuatro tareas (T1 a T4), **solo en `frontend-nuxt/`**. El backend de T2, T3 y T4 ya está hecho y probado
(Claude Code, 21/09); no lo toques. José está rediseñando la identidad visual en ramas aparte, así que
**no edites `tailwind.config.ts` ni `assets/css/main.css`** y usa clases y tokens que ya existen.

### 23.1 Reglas

1. **No inventes datos:** un dato que no llega se muestra «—», nunca `0` ni un estado positivo.
2. **Un commit por tarea**, en español, sin `--no-verify`. Trabaja en la rama `feat/fase-23` y no subas a `main`
   hasta terminar; se une con Pull Request.
3. **Cambios mínimos en cada archivo:** José también toca `pages/` y `components/`. Cambia solo lo que la tarea
   pide; no reformatees ni reordenes lo demás (así los dos trabajos se unen sin conflicto).
4. **Verifica en navegador real con el backend levantado**, no solo con `npx nuxi typecheck`. Cada tarea trae su
   prueba en §23.3.
5. **En tu informe cuenta solo lo que viste.** Cita únicamente endpoints que hayas visto en la pestaña Red.
6. Cuentas de prueba: solo las demo del [`README.md`](../../README.md) raíz. Las pruebas de T3 y T4 crean usuarios
   nuevos: usa correos que terminen en `@unicor.edu.co` con un sufijo tuyo (por ejemplo `prueba-agy-1@unicor.edu.co`).

---

### T1 — «Iniciar Refuerzo» en `/estudiante/repasos` no lleva a ninguna parte

**Defecto.** `pages/estudiante/repasos.vue`, función `completeReview(id)`, solo **quita el repaso de la lista en
memoria**: no navega, no envía nada al backend y el repaso vuelve al recargar. El estudiante pulsa el botón y no
pasa nada útil.

**Cómo funciona el backend (ya hecho).** `GET /review-schedules/due` devuelve cada repaso con su `learningUnitId`.
El repaso se reprograma **solo**, cuando el estudiante resuelve una actividad de esa unidad y se califica
(`submission.graded` → SM-2). No hay endpoint para «marcar como repasado».

**Qué hacer.**
- Agrega `learningUnitId: number` a `SpacedReviewItem` (`types/index.ts`) y guárdalo en el mapeo de
  `stores/student.ts` (hoy se descarta).
- «Iniciar Refuerzo» navega a `/estudiante/unidad/${learningUnitId}` (esa pantalla ya lista las actividades de la unidad).
- **Elimina `completeReview`**: un repaso desaparece de la lista únicamente cuando el backend deja de devolverlo.
- No cambies el texto «Objetivo de retención»; solo el comportamiento del botón.

### T2 — El administrador no puede cambiar el rol de un usuario

**Contexto.** En `/admin` (`pages/admin/index.vue`) la lista de usuarios solo muestra el rol como etiqueta.

**Contrato del backend (ya hecho).** `PATCH /users/:id/role` con `{ "role": "estudiante" | "docente" | "admin" }`.
- `200` → `{ message }`. `400` si el rol no es uno de esos tres. `403` si intentas cambiar **tu propia** cuenta
  (mensaje: «No puedes cambiar tu propio rol ni desactivar o eliminar tu propia cuenta»). `404` si no existe.
- Solo el rol `admin` puede llamarlo.

**Qué hacer.**
- Por fila, un control para elegir el nuevo rol y un botón «Cambiar rol» que abre un **diálogo de confirmación**
  que diga qué cambia («Ana Pérez pasará de estudiante a docente. Podrá crear clases y ver a los estudiantes de
  sus clases.»). Cancelar no envía nada; `Escape` cancela; el foco entra al diálogo y vuelve al botón.
- En la fila del propio administrador, el control va **deshabilitado** con una explicación visible (no solo un tooltip).
- Tras el `200`, actualiza la fila sin recargar toda la lista. Si falla, muestra el mensaje real del servidor.
- Mientras la petición está en curso, el botón se deshabilita (sin doble envío).

### T3 — Registro: elegir «Estudiante» o «Docente»

**Contrato del backend (ya hecho).** `POST /auth/register` acepta, además de `email`, `password` y `fullName`, dos
campos **opcionales**: `requestedRole` (`"estudiante"` o `"docente"`) y `roleRequestReason` (texto, máximo 300).
- La cuenta **siempre** nace como estudiante. Pedir `"docente"` solo crea una **solicitud pendiente**; un
  administrador debe aprobarla. La respuesta trae `roleRequest` (`null` si no pidió docente, o `{ id, status: "pending", … }`).
- **Sin restricción de dominio de correo:** cualquier correo puede pedir el rol docente (decisión explícita del dueño); lo único
  que evita un abuso masivo es que solo un admin puede aprobar cada solicitud, una por una.
- Un valor distinto de `estudiante`/`docente` (por ejemplo `admin`) da `400`. Nunca envíes un campo `role`: el servidor lo rechaza.

**Qué hacer** en `pages/auth/register.vue`:
- Una elección visible entre **Estudiante** (por defecto) y **Docente**, accesible con teclado (dos opciones de radio con etiqueta).
- Si elige Docente: un campo opcional «¿Qué materia o dependencia?» (máximo 300 caracteres, con contador) y un aviso
  claro: «Tu cuenta se crea como estudiante. Un administrador revisará tu solicitud y, si la aprueba, podrás
  iniciar sesión como docente.»
- Envía `requestedRole` solo si eligió Docente.
- Tras registrarse con solicitud, muestra un aviso persistente (no un `alert`) de que la solicitud quedó pendiente, y sigue el flujo normal de estudiante.
- Deja intacto el flujo actual de la clave opcional de Google.

### T4 — El administrador ve y resuelve las solicitudes de rol docente

**Contrato del backend (ya hecho).**
- `GET /role-requests?status=pending|approved|rejected` (solo admin; sin `status` devuelve todas). Cada elemento:
  `{ id, status, requestedRole: "docente", reason, createdAt, reviewedAt, reviewNote, user: { id, email, fullName, role } }`.
- `PATCH /role-requests/:id` con `{ "decision": "approve" | "reject", "note"?: string }` (máximo 300). Aprobar convierte
  al solicitante en docente; rechazar no cambia su rol. `409` si la solicitud ya fue resuelta.
- `GET /role-requests/me` (cualquier usuario autenticado) devuelve `{ request: {...} | null }` con su solicitud más reciente.

**Qué hacer** en `pages/admin/` (una sección o pestaña «Solicitudes de docente» dentro de la gestión de usuarios,
sin crear una pantalla fuera del menú actual):
- Lista de **pendientes** con nombre, correo, motivo (o «Sin motivo indicado») y fecha; botones «Aprobar» y «Rechazar».
- Cada decisión abre un diálogo de confirmación con un campo opcional de nota. Tras el `200`, la solicitud sale de pendientes sin recargar.
- Un contador de pendientes visible junto al nombre de la sección.
- Estado vacío («No hay solicitudes pendientes») y estado de error con el mensaje del servidor.
- Un interruptor para ver también aprobadas y rechazadas (solo lectura).
- En `/estudiante`, si `GET /role-requests/me` devuelve una solicitud `pending`, muestra un aviso discreto
  «Tu solicitud para ser docente está pendiente»; si está `approved`, «Aprobada: cierra sesión y vuelve a entrar para usar el rol docente»;
  si `rejected`, muestra la nota si existe.

---

### 23.3 Cómo verificar

| Tarea | Prueba |
|---|---|
| T1 | Como Pedro Romero (`pedro.estudiante@unicor.edu.co`), abre `/estudiante/repasos` y pulsa «Iniciar Refuerzo» en un repaso: llega a `/estudiante/unidad/<id>` de esa unidad. Vuelve a `/estudiante/repasos` y recarga: el repaso **sigue ahí** (nadie lo marcó como hecho). En la pestaña Red no debe haber ninguna petición de «completar». |
| T2 | Como administrador, en `/admin`: cambia el rol de un usuario de prueba a docente y confírmalo (fila actualizada; `PATCH /users/<id>/role` → 200 en Red). Cancela otro cambio: no hay petición. La fila del propio admin tiene el control deshabilitado. Fuerza un 403 llamando al endpoint sobre tu propio id desde la consola y comprueba que la pantalla muestra el mensaje del servidor. |
| T3 | Registra `prueba-agy-1@unicor.edu.co` como **Estudiante**: la respuesta trae `roleRequest: null`. Registra `prueba-agy-2@unicor.edu.co` como **Docente** con un motivo: cuenta creada como estudiante, aviso de solicitud pendiente y en Red `POST /auth/register` con `requestedRole: "docente"`. Repite con un correo `@gmail.com` como Docente: se comporta igual que con `@unicor.edu.co` (sin restricción de dominio). |
| T4 | Como administrador, la solicitud de `prueba-agy-2` aparece en pendientes con su motivo. Apruébala con una nota: sale de pendientes, y el usuario pasa a docente en la lista de usuarios. Repite con otra solicitud y recházala: su rol sigue siendo estudiante. Intenta resolver dos veces la misma (dos pestañas): la segunda muestra el `409`. Inicia sesión con `prueba-agy-2` tras aprobarla: entra como docente. |

`npx nuxi typecheck` debe terminar en código 0 tras cada tarea.

**Antes de empezar:** la base de datos necesita la migración nueva (`npm run migration:run`, tabla `role_requests`).

### 23.4 Criterios de cierre

- [ ] Las pruebas de §23.3 hechas en navegador real, con lo observado anotado en el informe.
- [ ] `npx nuxi typecheck` en código 0.
- [ ] Cuatro commits, uno por tarea, en la rama `feat/fase-23`, y Pull Request abierto.
- [ ] Informe en `docs/antigravity/informes/` con `TEMPLATE_INFORME.md`, **solo con lo que hiciste y viste**.

### 23.5 Fuera de alcance

Cambios en el backend · rediseño visual · verificación de correo por enlace · edición de más datos del usuario
(nombre, estado activo) desde el panel · un botón para iniciar el repaso directamente desde el chat del Tutor.
