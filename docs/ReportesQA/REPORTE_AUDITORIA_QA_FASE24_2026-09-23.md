# Reporte de auditoría QA — Fase 24 (Antigravity) · 23/09/2026

**Auditor:** Claude Code · **Método:** [`GUIA_AUDITORIA_MAESTRA.md`](GUIA_AUDITORIA_MAESTRA.md) (navegador real, base desechable, todo ejecutado hoy).
**Alcance:** las 5 tareas de la Fase 24 (T1 currículo, T2 creador de ejercicios, T3 administración de usuarios, T4 «Mi perfil», T5 clase) y la
autorización de los endpoints que ahora usa la interfaz. **No** cubre el resto de la aplicación ni el Tutor.

## Entorno

| Dato | Valor |
|---|---|
| Commit auditado | `cb6aba5` (rama `feat/fase-24`, 5 commits de funciones + informe; **`src/` no se tocó**: solo frontend) |
| Árbol | `git worktree` aparte (no se tocó el árbol del dueño ni la base `basestire`) |
| Base de datos | MySQL nativa, base desechable `stire_qa24` (9 migraciones + seed demo + admin), borrada al terminar |
| Backend | `npm run build` (0 errores) · `node dist/main` en :3098 |
| Frontend | `nuxt generate` (0 errores) servido como SPA estática en :3100 (misma regla de reescritura que Cloudflare/Vercel) |
| Navegador | Chrome real automatizado (puppeteer-core), escritorio 1366×850 y móvil 375×667 |
| `npx nuxi typecheck` | **exit 0** (ejecutado hoy, 1 min 51 s) |
| No ejecutado | Jest del backend (el backend no cambió), Tutor con clave real, lector de pantalla, carga concurrente |

## Veredicto

**No fusionar `feat/fase-24` a `main` todavía.** La parte de servidor y de autorización es sólida, y T3, T4 y T5 funcionan. Pero **el creador de
ejercicios (T2) no puede enviar ningún ejercicio desde un navegador real**, el reordenamiento de lecciones (T1) no funciona, los mensajes de
error del servidor no se muestran, y la fase **quitó** el enlace de recuperación de contraseña por correo. Los cuatro son de corrección corta
(frontend); ver el plan de corrección al final.

## Cobertura de la Fase 24

| Tarea | Estado | Resultado |
|---|---|---|
| T1 Currículo (módulo → tema → unidad → lección) | ⚠ parcial | Crear, publicar, ocultar, eliminar con confirmación, vista del estudiante: ✅. **Reordenar: ❌ (F24-02)** |
| T2 Creador de ejercicios (6 tipos) | ❌ bloqueado | **No envía desde la pantalla (F24-01).** Con la validación del navegador neutralizada, los 6 tipos se crean, califican bien y no filtran respuestas ✅ |
| T3 Administración de usuarios | ✅ con observaciones | Registrar, duplicado, clave débil, desactivar (cierra la sesión abierta al instante), reactivar, restablecer clave (se muestra una vez, cierra sesiones), autoprotección: ✅. Errores ilegibles (F24-03), Escape (F24-05) |
| T4 Mi perfil | ✅ con observaciones | Nombre reactivo, validaciones, cambio de clave: ✅; no hay escalada de privilegios. Errores ilegibles (F24-03) |
| T5 Clase | ✅ | Edición parcial (solo envía lo que cambió), botón deshabilitado sin cambios, validación, copiar código: ✅ |
| Autorización de los endpoints usados | ✅ | 27/28 como se esperaba (28.º = 409 en vez de 403, F24-09) |
| Móvil 375 px (8 pantallas nuevas) | ✅ | Sin desborde de página; en `/admin` la tabla se desplaza dentro de su tarjeta |

## Hallazgos

Severidad: **Crítico** / **Alto** / **Medio** / **Bajo**. Todos reproducidos hoy.

| ID | Sev. | Dónde | Pasos | Esperado | Observado | Causa verificada |
|---|---|---|---|---|---|---|
| **F24-01** | **Crítico** | `/docente/ejercicios/crear` | Elegir unidad y tipo (cualquiera de los 6), llenar todo lo visible, pulsar «Guardar y Publicar» | Se crea el ejercicio | **Nada ocurre**: cero peticiones al servidor; consola: `An invalid form control with name='' is not focusable` | Los constructores de los otros tipos siguen en el DOM (ocultos) con campos `required` vacíos (`#tc-expected-0/1` del tipo código; opciones del tipo MCQ). El formulario tiene `novalidate=false`, así que el navegador bloquea el envío. Listado de `:invalid` con el tipo MCQ elegido: solo esos dos, `visible=false`. El informe de Antigravity dice haberlo probado con los 6 tipos |
| **F24-02** | **Alto** | Modal «Lecciones» (`UnitLessonsModal.vue`) | Con 2 lecciones, pulsar ▼ en la primera | Se intercambian | No cambia ni en pantalla ni en la base. La petición enviada es `POST /content/reorder [{"id":4,"order":1},{"id":5,"order":2}]`, **idéntica al orden anterior** | `moveLesson` intercambia el campo `order` pero arma el envío con `list.map((item, idx) => idx + 1)` sobre un arreglo **que nunca se intercambió**. No puede funcionar nunca |
| **F24-03** | **Alto** | Todas las pantallas nuevas (~25 sitios) | Registrar un correo repetido; cambiar la clave con la actual incorrecta; contraseña débil | Mensaje claro («El email ya está registrado») | El usuario ve `[POST] "http://localhost:3098/users": 409 Conflict` o `[PATCH] "…/users/me/password": 401 Unauthorized`, o un texto genérico | El backend responde el motivo en `error` (`{"statusCode":409,…,"error":"El email ya está registrado"}`; en validación, un arreglo). Las pantallas leen `err.data.message`, que no existe. El proyecto ya tiene `composables/useApiErrorMessage.ts` (lee `error` y `message`) y la fase no lo usa. Contradice el informe («401 con mensaje del servidor») |
| **F24-04** | **Alto** (regresión) | `/auth/login` | Abrir el login | «¿Olvidaste tu clave?» lleva a la recuperación por correo | El enlace **ya no existe**; las pantallas `/auth/forgot-password` y `/auth/reset-password` siguen ahí pero **inalcanzables** | El plan de la Fase 24 (§T3) lo pedía: **defecto del plan**, escrito el 23/09 antes de construir la recuperación por correo. Antigravity lo ejecutó tal cual. Decisión de producto pendiente (ver abajo) |
| **F24-05** | Medio | Modal «Lecciones»; diálogo «Registrar usuario» tras un error | Abrir «Lecciones» y pulsar Escape. O provocar un error al registrar y pulsar Escape | Se cierra | El modal de lecciones **no recibe el foco** (`activeElement` queda en el botón de detrás) y Escape no lo cierra. En el registro, tras un error, Escape tampoco cierra y el overlay sigue **absorbiendo los clics** (`elementFromPoint` devuelve el overlay) | Escape depende de que el foco esté dentro del diálogo; se pierde al deshabilitarse el botón durante el envío. Sí funciona con el diálogo recién abierto |
| F24-06 | Bajo | Vista previa de lección (docente) | Escribir `<img src=x onerror=…>` y pulsar «Vista Previa» | HTML escapado | **Se ejecuta** (solo en el navegador del propio autor) | `formatMarkdown` no escapa el texto fuera de bloques de código y se usa con `v-html` sobre el borrador. El servidor **sí sanea al guardar** y la vista del estudiante no ejecutó nada |
| F24-07 | Medio (preexistente) | Guardado de lecciones | Lección con un bloque ```html que contenga `<script>` y `<button onclick>` | Se conserva el ejemplo | El servidor elimina `<script>…</script>`, deja `<button …>` como texto suelto y añade un `</b>` de cierre. **Estropea las lecciones de HTML** | El saneado se aplica al texto Markdown completo como si fuera HTML. Relevante para el curso de HTML/CSS y para la Fase 25 |
| F24-08 | Bajo | Ejercicio del estudiante | Abrir un ejercicio cuyo enunciado tenga `**negrita**` | Negrita en ambos paneles | El panel izquierdo la muestra con asteriscos | Hay **dos copias** de `formatMarkdown` (página y `utils/`) |
| F24-09 | Bajo (preexistente) | `PATCH /class/:id` | Docente ajeno; o cambiar `code` a uno repetido | 403; 409 | Docente ajeno → **409**; el `code` sí se puede cambiar por API aunque la pantalla lo declara solo lectura; duplicado → **500** con el texto SQL (solo en desarrollo) | Ya estaba en la lista de pendientes |
| F24-10 | Medio (preexistente, ahora expuesto en pantalla) | «Mi perfil» → Cambiar contraseña | Cambiar la propia clave con otra sesión abierta | Las demás sesiones se cierran | El token anterior **sigue válido (200)**. (La recuperación por correo y el restablecimiento por admin sí cierran sesiones) | `changePassword` no marca `passwordChangedAt`. Hacerlo cerraría también la sesión actual: habría que emitir un token nuevo |

**Sin hallazgos de seguridad graves.** Nada de esta fase permite acceso indebido; por eso este reporte se puede publicar en el repositorio.

## Lo que funcionó (probado hoy)

- **Autorización:** un estudiante y un docente **ajeno** reciben 403 en todos los endpoints de escritura de currículo, contenido, actividades y preguntas (y en `GET` de las respuestas correctas); `POST /users`, `PATCH /users/:id` y `/role` son solo de admin; `PATCH /users/me` con `role`/`isActive`/`email` → 400 sin cambiar nada; un admin no puede desactivarse a sí mismo.
- **Calificación de los 6 tipos** (con los ejercicios creados por la propia interfaz): correcta 20/20 en todos; incorrecta 0 (MCQ, ordenar), 10 (completar), 15 (arrastrar), 7 (emparejar). Código: 20 / 10 (solo pasa el público) / 0 (error de sintaxis).
- **Sin filtración de respuestas al estudiante** en ninguno de los 6 tipos; el caso oculto de código no llega (`hiddenTestCaseCount: 1`).
- **Saneado:** contenido con `<script>`/`onerror` guardado por el servidor sin ejecutarse en la vista del estudiante; nombres y descripciones con HTML (usuario, clase) no se ejecutan en ninguna vista.
- Un módulo nuevo nace como **borrador** y el estudiante no lo ve hasta publicarlo; una lección **oculta** no llega al estudiante (`/content/unit/:id` la omite; `/all` da 403).
- **Sesión:** desactivar cierra la sesión abierta al instante; restablecer clave la cierra y la temporal se muestra **una sola vez** (no queda en la página tras cerrar).
- Accesibilidad de los diálogos recién abiertos: `role="dialog"`, `aria-modal`, Escape.
- Sin errores de consola ni respuestas ≥ 400 inesperadas en el recorrido normal de T3, T4 y T5.

## No cubierto

Tutor con clave real; lector de pantalla (NVDA); carga concurrente; despliegue real; `Jest` del backend (no cambió); otros navegadores (todo se probó solo en
Chrome; F24-01 depende de la validación nativa de formularios, que no se comprobó en Firefox ni Safari).

## Estado tras la Fase 24b (24/09, verificado)

Corregidos en `feat/fase-24` y **verificados en Chrome real** contra una base desechable nueva (25/25 comprobaciones; `nuxi typecheck` exit 0;
`nuxt generate` sin errores):

| ID | Resultado de la verificación |
|---|---|
| F24-01 | Los 6 tipos se crean **desde la pantalla, sin atajos** (`POST /activities` y `/activity-questions` → 201). Con datos incompletos no se envía nada y aparece el motivo («La opción #1 no puede estar vacía», «El hueco "b1" no tiene una respuesta esperada», «El caso de prueba #1 no tiene salida esperada») |
| F24-02 | ▼ intercambia y se guarda (`Lección A,Lección B` → `Lección B,Lección A` en la base); ▲ lo devuelve; la pantalla lo refleja |
| F24-03 | Correo repetido → «El email ya está registrado»; clave débil → el texto del servidor; clave actual incorrecta → «La contraseña actual es incorrecta». Ya no aparece `[POST] "http://…"` |
| F24-04 | El login tiene «¿Olvidaste tu clave?» → `/auth/forgot-password` |
| F24-05 | El modal de lecciones toma el foco; Escape cierra primero la confirmación de borrar y luego el modal; tras un error de registro Escape cierra y los clics llegan a la tabla; un diálogo recién abierto sigue cerrándose con Escape |
| F24-06 | La vista previa no ejecuta el HTML del borrador, formatea el Markdown y muestra el HTML como texto |

**Sin corregir (no bloquean la fusión):** F24-07 (saneado del servidor sobre bloques de código con HTML; **hacerlo antes de la Fase 25**), F24-08, F24-09, F24-10.

## Corrección propuesta (Fase 24b, frontend, cambios pequeños) — ya aplicada

1. **F24-01:** renderizar solo el constructor del tipo elegido (`v-if`) o poner `:required` solo al activo; agregar prueba de envío por tipo.
2. **F24-02:** intercambiar las posiciones en el arreglo antes de calcular el orden; comprobar en la base.
3. **F24-03:** usar `useApiErrorMessage` en todos los `catch` de la fase (los ~25 sitios).
4. **F24-04:** devolver «¿Olvidaste tu clave?» al login → `/auth/forgot-password`; conservar el texto del admin como alternativa. Actualizar el plan.
5. **F24-05:** manejar Escape a nivel de `document`/ventana mientras el diálogo esté abierto y llevar el foco al abrirlo.
6. F24-06/08: escapar HTML del texto fuera de bloques de código en `formatMarkdown` y dejar **una sola** copia.
7. Decisión aparte (backend, no bloquea): F24-07 (sanear después de convertir el Markdown, no antes) — recomendable antes de la Fase 25; F24-10.
