---
estado:     vigente — Fases 18, 19 y 20 (Tutor IA: experiencia de chat, clave de Google AI Studio y configuración del docente) pendientes; Fase 17 completada
verificado: 2026-09-19
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    COMP-V00 · EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03
---

# 🚀 Insumo 15 — Plan de Implementación en Nuxt para Google Antigravity

**Este archivo contiene solo la fase vigente.** Las Fases 1-15 (scaffold inicial, tokens de diseño,
las 9 ventanas de Estudiante, Fases A-F de estabilización, MCQ/FILL_CODE, y las 7 ventanas de
Docente/Administrador) ya se ejecutaron, se verificaron en navegador real, y se archivaron completas
en [`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md`](../_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md)
— regla de archivado en [`docs/_archivo/README.md`](../_archivo/README.md#regla-para-archivar-versiones-del-plan-de-antigravity).
Para el panorama completo del proyecto (qué está hecho, qué falta, quién lo hace), ver
[`docs/PLAN_MAESTRO.md`](../PLAN_MAESTRO.md). Para el historial de sesiones ejecutadas, ver
[`docs/antigravity/README.md`](./README.md).

**Se sigue numerando a partir de §16** (no se reinicia en §1) para que las citas ya hechas en
`PLAN_MAESTRO.md` y en informes de sesión sigan apuntando al lugar correcto.

---

## 16. Fase siguiente — editar/archivar contenido, enlace pendiente y accesibilidad (2026-09-15)

### 16.0 Contexto

La Fase 15 se ejecutó y se cerró (commit `d6120ed`, informe
`docs/antigravity/informes/INFORME_2026-09-14_SESION_02.md`) — auditada en vivo por Claude Code el
15/09, el fix de `DOC-V04` es correcto. **Codex no participa en esta ronda por ahora** — el dueño del
proyecto decidió que Codex se invoca por criterio de complejidad, no en cada ronda (ver
`docs/PLAN_MAESTRO.md` §3 y §6.2). Si en el curso de esta fase encuentras algo que de verdad requiere
Codex (ver §16.0c abajo, los límites de lo que SÍ puedes tocar tú en backend), decláralo en tu
informe en vez de intentarlo o de dejarlo sin decir nada.

### 16.0b Más libertad de diseño frontend — leer antes de empezar

Hasta la Fase 15, este plan te pedía replicar **exactamente** lo ya dibujado en Figma, sin decidir
nada de diseño por tu cuenta (regla histórica: "No rediseña ninguna vista ni propone un token o
color nuevo"). Eso seguía teniendo sentido mientras existía un frame de Figma específico que copiar.
**Para lo que la ficha de diseño ya especifica en texto pero nadie dibujó como frame, tienes permiso
explícito de diseñar tú la pantalla/modal/formulario** — no es una excepción a la regla, es la regla
aplicada al mismo caso que ya se resolvió así con éxito en `DOC-V03` y `DOC-V04`: ninguna de las dos
tenía ficha en formato de 7 categorías tampoco, y se construyeron bien igual, verificado en vivo.

**Ejemplo concreto que motiva esto — la ficha de `DOC-V02`** (`docs/modesec/ventanas/
3.3.1_FICHAS_VENTANAS.md:191,195`) ya dice, en texto, exactamente qué construir para editar una
unidad: *"Formularios de edición para título, descripción, nivel de dificultad, orden y
prerrequisitos de cada unidad"*, con el endpoint real `[PATCH /learning-unit/:id]`. Nadie dibujó ese
formulario como frame en Figma — pero no hace falta que alguien lo dibuje antes de que tú lo
construyas, porque el contenido (qué campos, qué endpoint, qué reglas) ya está decidido por escrito.
Eso es exactamente lo que estabas pidiendo permiso para hacer en §16.1.

**Los límites de diseño siguen firmes, no se relajan:**
- **Reutiliza, nunca inventes, los tokens de diseño** (`tailwind.config.ts`: color, tipografía,
  espaciado, radio, sombra) — cero hex nuevos, cero tamaños de fuente nuevos.
- **Reutiliza el patrón de componente más parecido que ya existe y funciona** — para un modal de
  edición, el patrón es el mismo que "Crear Nueva Clase" (`docente/index.vue`) o "Redactar Mensaje"
  (`docente/mensajes.vue`), no un layout nuevo desde cero.
- Si la ficha/README **no** dice qué campos o qué comportamiento tiene algo (a diferencia de
  `DOC-V02`, que sí lo dice completo), no lo inventes — declara el vacío en tu informe en vez de
  rellenarlo a criterio propio. La libertad es para *construir lo ya decidido sin frame*, no para
  *decidir tú qué construir*.
- Todo sigue verificándose en navegador real contra datos reales antes de darlo por cerrado.

### 16.0c Libertad nueva — ediciones sencillas de backend (decisión del dueño del proyecto, 15/09)

Hasta ahora tenías prohibido tocar `src/` por completo. Eso cambia parcialmente: **puedes hacer
ediciones sencillas de backend cuando las necesites para que una de tus propias pantallas funcione**
— ya no tienes que parar y esperar una fase de Codex para un cambio pequeño y aislado. El criterio de
"sencillo" es concreto, no una sensación:

**SÍ puedes, sin pedir permiso:**
- Agregar un campo **opcional** a un DTO o entidad ya existente (aditivo, no rompe nada que ya
  funcione).
- Agregar un endpoint `GET` nuevo, de solo lectura, en un módulo con el que ya estás integrando
  (`topic`, `section`, `learning-unit`, `activities`, `message`, `class`), que exponga datos que el
  backend **ya calcula o ya guarda** — sin lógica de negocio nueva, con el mismo patrón de `@Roles`
  que ya usa ese controller.
- Corregir un bug aislado y obvio en la forma de una respuesta (serialización, nombre de campo) que
  bloquea tu propia pantalla — mismo tipo de hallazgo que ya hiciste en frontend con `DOC-V04`, pero
  del lado del backend, si el bug resulta estar ahí en vez de en el consumo.

**NO — sigue siendo de Codex o de Claude Code, sin excepción:**
- `src/submissions/`, `src/auth/`, `src/enrollment/` — módulos de integridad de datos y seguridad,
  cerrados a esta libertad aunque el cambio parezca chico. Si tu pantalla necesita algo de ahí,
  decláralo, no lo edites.
- Cualquier **migración** (cambio de esquema de base de datos) — eso pasa por el proceso más
  cuidadoso que ya usó Codex en su Fase D (migración + prueba de concurrencia real), no por una
  edición directa.
- Cualquier cambio a lógica de cálculo (`mastery.calculator.ts`, `evaluation-engine/`,
  `review-schedules/`) — motor pedagógico del sistema, no se toca por una necesidad de pantalla.
- Un endpoint que **escribe** datos nuevos con reglas de negocio propias (no solo expone algo que ya
  existe) — eso sí es una pieza para planear, no una edición sencilla.

**Si dudas si algo es "sencillo":** no lo es. Detente, escríbelo en tu informe como algo que
encontraste y que requiere una fase de Codex o de Claude Code, con la misma evidencia (archivo:línea,
qué falta) que ya usas para todo lo demás — Claude Code decide desde ahí si amerita una fase de Codex
o si lo resuelve directamente. La libertad de esta sección es para no bloquearte por algo trivial, no
para que asumas tú solo dónde está la línea de lo delicado.

**Todo cambio de backend que hagas bajo esta libertad:**
- Lleva su propio test (regla de oro del proyecto: sin test, un fix no está terminado) — mismo
  criterio que ya exige `CLAUDE.md` para cualquier cambio de `src/`.
- Corre `npm run build` y `npm test` (backend) después del cambio, no solo `nuxi typecheck`
  (frontend) — pégalo en tu informe.
- Se declara explícitamente en tu informe de sesión como "cambio de backend, Fase 16.0c" — no se
  mezcla en silencio con el resto de cambios de frontend, para que quien audite sepa exactamente qué
  tocaste fuera de tu superficie habitual.

### 16.1 Editar y archivar contenido ya creado — la pieza de mayor valor de esta fase

**El gap, con evidencia exacta:** el backend ya expone edición completa, pero ninguna pantalla la usa
todavía. Hoy `DOC-V02`/`DOC-V03` solo *crean* contenido — si un docente comete un error en una
actividad o quiere archivar una unidad vieja, no tiene cómo hacerlo desde la interfaz.

| Recurso | Endpoint real, ya existente | Rol requerido |
|---|---|---|
| Topic | `PATCH /topic/:id` (`topic.controller.ts:71`) | docente, admin |
| Topic | `DELETE /topic/:id` — soft delete (`topic.controller.ts:87`) | docente, admin |
| Unidad de aprendizaje | `PATCH /learning-unit/:id` (`learning-unit.controller.ts:65`) | docente, admin |
| Unidad de aprendizaje | `DELETE /learning-unit/:id` (`learning-unit.controller.ts:75`) | **solo admin** — no lo expongas como acción de docente |
| Actividad | `PATCH /activities/:id` (`activities.controller.ts:50`) | docente, admin |
| Actividad | `PATCH /activities/:id/publish` (`activities.controller.ts:60`) | docente, admin |
| Actividad | `PATCH /activities/:id/archive` (`activities.controller.ts:69`) | docente, admin |
| Actividad | `DELETE /activities/:id` (`activities.controller.ts:78`) | docente, admin |

**Qué construir en `DOC-V02` (`contenidos.vue`):**
- Cada topic del árbol ya renderizado: agregar acciones "Editar" (abre un formulario/modal con
  título/descripción/orden, `PATCH /topic/:id`) y "Archivar" (`DELETE /topic/:id` — es soft delete,
  no destructivo; confirma con el usuario antes de llamarlo, mismo patrón que ya usarías para
  cualquier acción irreversible en la UI).
- Cada unidad de aprendizaje listada: acción "Editar" (`PATCH /learning-unit/:id`). **No** agregues
  un botón de eliminar para unidades — el endpoint es solo-admin, no la expongas al docente
  (mostrarla y que el backend la rechace con 403 es peor UX que no mostrarla).

**Qué construir en `DOC-V03` (`ejercicios/crear.vue`) o una vista hermana:**
- Falta una forma de listar y editar actividades ya creadas de una unidad (hoy la página solo tiene
  el flujo de creación). Puede ser una pestaña/sección nueva en la misma vista, o una tabla que
  aparezca al elegir una unidad: por cada actividad, "Editar" (`PATCH /activities/:id`),
  "Publicar/Despublicar" (`PATCH /activities/:id/publish`), "Archivar"
  (`PATCH /activities/:id/archive`). No dupliques el formulario de creación entero para editar si el
  cambio es solo de metadatos — confirma primero, contra `GET /activities/:id`, qué campos trae la
  actividad real antes de decidir cuánto del formulario de creación reutilizar.

**Antes de escribir código:** confirma contra `GET /activities/:id` real (no contra el DTO de
creación) qué forma tiene una actividad ya creada, igual que hiciste en §15.2 con `activity-types` —
ahí fue donde apareció el bug de `data` vs. `items`, mismo tipo de descuido es fácil de repetir aquí.
Si al confirmar encuentras que falta un campo del lado backend para que la edición funcione bien,
esa es exactamente la clase de caso que cubre §16.0c.

### 16.2 Verificar el enlace `DOC-V04` → `DOC-V05`

Tu propio informe de la Fase 15 (§6, punto 2) señaló esto como pendiente: confirmar que la columna
"Acción → Ver detalle" del roster de `rendimiento.vue` navega correctamente a
`pages/docente/estudiante/[studentId].vue` con el `studentId` correcto, y que esa vista carga los
datos reales de ese estudiante (ya verificado funcionando por Claude Code para un acceso directo por
URL — falta confirmar el enlace en sí). Si ya funciona, esto es una verificación de 5 minutos, no una
construcción nueva.

### 16.3 Auditoría de accesibilidad (WCAG 2.1 AA) de las 7 ventanas nuevas

El pie de página de la aplicación declara "Accesibilidad WCAG 2.1 AA ✔" en todas las vistas,
incluidas las 7 que construiste en la Fase 14 — nadie verificó ese punto específicamente para ellas
todavía. Revisa, para cada una de `DOC-V02` a `DOC-V06`, `ADM-V01` y `ADM-V03`:
- Contraste real de texto/fondo (mismo criterio que ya se aplicó en Figma para `texto-secundario` y
  `ambar-fuerte` — no repitas un color que ya falló contraste antes en este proyecto).
- Navegación por teclado: cada acción (editar, publicar, archivar, enviar mensaje, toggle) debe ser
  alcanzable y operable sin mouse.
- Los formularios/modales nuevos (crear clase, redactar mensaje, y los que agregues en §16.1) tienen
  `label` asociado a cada campo, no solo `placeholder`.

Si encuentras una falla real, corrígela con la misma referencia de tokens que usa el resto del
proyecto (`tailwind.config.ts`) — no un color nuevo inventado para el caso.

### 16.4 Explícitamente fuera de esta fase

- `src/submissions/`, `src/auth/`, `src/enrollment/`, migraciones, y lógica de cálculo pedagógico —
  ver §16.0c, siguen sin ser tu superficie bajo ninguna circunstancia.
- `DELETE /learning-unit/:id` no se expone al docente (§16.1) — es una restricción real del backend,
  no un olvido a corregir.
- Backend nuevo para `ADM-V01`/`ADM-V03` — sigue "pendiente de backend (D-03)", sin cambios.

### 16.5 Criterio de cierre de esta fase

- Un docente puede editar y archivar un topic, una unidad y una actividad ya existentes, verificado
  en navegador real contra datos reales (no solo `typecheck`) — mismo estándar que dejó la Fase 15.
- El enlace `DOC-V04` → `DOC-V05` confirmado funcionando con un `studentId` real.
- Auditoría de accesibilidad completada para las 7 ventanas, con hallazgos corregidos o declarados
  explícitamente si no se alcanzan a corregir en esta fase.
- Si usaste la libertad de §16.0c, cada cambio de backend está declarado por separado en el informe,
  con su propio test y con `npm run build`/`npm test` en verde.
- **Informe de sesión obligatorio**, mismo criterio que las fases anteriores — evidencia en navegador
  real, no solo compilación.

---

## 17. Categorías reales de tipo de actividad — peso examen vs. práctica (2026-09-16)

### 17.0 Contexto

Pausa técnica del dueño del proyecto (15-16/09, documentada completa en
`docs/00_VISION_FUNCIONAL.md` §9.5): el Tutor se estaba pareciendo a un chat genérico. Claude Code
ya cerró la parte de backend pedagógico de esa pausa (penalización de Mastery por repetición trivial,
`TutorRecommendationService`, saludo proactivo) — eso **no es tuyo, no lo toques**. Lo que queda
abierto de esa misma conversación, y que sí es tuyo, es el punto 5 de la visión: *"control de pesos:
las actividades evaluativas deben valer más que los ejercicios de práctica formativa"*.

**El gap, con evidencia exacta:** en todo el sistema existe un solo `ActivityType`
(`AUTO-EVAL`, `baseWeight: 1.0`, sembrado en `src/seeds/seed-runner.ts` líneas 222-232). El ejemplo
de tres categorías con peso distinto que ya documenta `docs/03_MOTOR_Y_TUTOR.md` §3.2 (Quiz=1.0,
Taller=1.5, Parcial=3.0) es un ejemplo aspiracional — **nunca se implementó como categorías reales**.
Peor: el formulario de crear actividad (`frontend-nuxt/pages/docente/ejercicios/crear.vue:532,758`)
ni siquiera tiene un `<select>` visible — asigna `activityTypeId` en silencio al primer tipo que
devuelve `GET /activity-types`, sin que el docente sepa que existe ese concepto.

### 17.1 Backend — 2 tipos nuevos, aditivo, sin tocar los 15 existentes

El endpoint ya existe completo (`src/activity-types/activity-types.controller.ts`):
`GET /activity-types` (cualquier rol autenticado), `POST /activity-types` (docente/admin). No hace
falta escribir ningún endpoint nuevo — solo sembrar 2 tipos adicionales, mismo patrón `findOrCreate`
que ya usa el seed para `AUTO-EVAL` (`src/seeds/seed-runner.ts:222-232`):

```ts
const tallerType = await findOrCreate(
  actTypeRepo,
  { code: 'TALLER' },
  () => ({ name: 'Taller de Código', code: 'TALLER', autoGradable: true, baseWeight: 1.5 }),
  'Tipo de Actividad: TALLER',
);
const parcialType = await findOrCreate(
  actTypeRepo,
  { code: 'PARCIAL' },
  () => ({ name: 'Parcial / Evaluación', code: 'PARCIAL', autoGradable: true, baseWeight: 3.0 }),
  'Tipo de Actividad: PARCIAL',
);
```

**No reasignes el `activityTypeId` de ninguna de las ~15 actividades ya sembradas** — se quedan en
`AUTO-EVAL` (equivalente a "Práctica", `baseWeight: 1.0`). Esto es aditivo puro: cero riesgo sobre el
Mastery ya calculado de cualquier estudiante con datos reales. Si quieres renombrar internamente
`AUTO-EVAL` como "Práctica" en su campo `name` (no en `code`, eso rompería el `findOrCreate` de
sesiones futuras), puedes hacerlo — es cosmético, no reasigna nada.

### 17.2 Frontend — el selector que hoy no existe

**En `docente/ejercicios/crear.vue`** (formulario de creación): agrega un `<select>` visible
enlazado a `activityTypeId` (ya existe la variable, `crear.vue:532`), poblado desde `typesList`
(ya se obtiene, `crear.vue:756-758` — no agregues una llamada nueva). Junto a cada opción, muestra
el peso para que el docente entienda la implicación real, no solo un nombre — por ejemplo:
`"Taller de Código (peso 1.5×)"`, usando el `baseWeight` real de cada tipo devuelto por
`GET /activity-types`, nunca un número inventado en el frontend.

Agrega debajo del selector un texto de ayuda corto y honesto, en la línea de: *"Los talleres y
parciales pesan más en el dominio del estudiante que la práctica libre — úsalo para reflejar
evaluaciones reales, no para inflar el Mastery."* — cita el mecanismo real, no una promesa vaga.

**En el modal de editar actividad** (`crear.vue`, construido en la Fase 16, `PATCH /activities/:id`):
confirma primero contra el DTO real (`UpdateActivityDto` extiende `CreateActivityDto` con
`PartialType`, así que `activityTypeId` ya es un campo válido para `PATCH`) y agrega el mismo
selector ahí — un docente debe poder recategorizar una actividad ya creada, no solo elegir la
categoría al crearla.

### 17.3 Explícitamente fuera de esta fase

- No toques `mastery.calculator.ts`, `tutor-recommendation.service.ts`, ni ningún archivo de
  `src/tutor/` — la lógica que consume `activityType.baseWeight` ya existe y ya funciona
  (`mastery.calculator.ts:14`), esta fase solo le da datos reales que consumir, no cambia cómo se
  usan.
- No reasignes el tipo de ninguna actividad ya sembrada (§17.1) — solo las que se creen o editen a
  partir de ahora usan un tipo distinto de `AUTO-EVAL`.
- No inventes una cuarta categoría ni pesos distintos a 1.0/1.5/3.0 — son los mismos que ya
  documenta `03_MOTOR_Y_TUTOR.md` §3.2, no una decisión nueva tuya.

### 17.4 Criterio de cierre

- `GET /activity-types` devuelve 3 tipos reales (`AUTO-EVAL`, `TALLER`, `PARCIAL`) con sus
  `baseWeight` correctos — verificado con `curl`/Swagger, no solo leyendo el seed.
- Un docente puede elegir la categoría al crear una actividad nueva, y cambiarla al editar una
  existente — verificado en navegador real, con el peso visible en el selector.
- Las ~15 actividades sembradas previamente conservan su `activityTypeId` original — verificado
  contra la base de datos real, no asumido.
- `npx nuxi typecheck` exit code 0; si tocaste el seed, `npm run build` y `npm test` (backend) en
  verde, pegados en el informe (mismo criterio que exige §16.0c para cualquier cambio de `src/`).
- **Informe de sesión obligatorio**, mismo criterio que las fases anteriores.


---

## 18. Tutor IA — cierre de la experiencia de chat (2026-09-19)

### 18.0 Contexto

Con la Fase 17 cerrada no había ninguna fase abierta para ti. Esta sale de una auditoría del Tutor IA
contra el código real (no contra los documentos) hecha el 19/09 para llegar a "Tutor cerrado": la
lógica pedagógica del Tutor (saludo proactivo, sugerencia de ejercicio, decaimiento de Mastery) ya
funciona; lo que queda abierto es **la experiencia del chat** — errores que se ven feos, un drawer
que no cumple accesibilidad básica y un chat que se siente roto. Todo lo de abajo se verificó leyendo
el archivo indicado (o, para el backend, contra el servidor real), no se asume.

**Reparto — para que no pises trabajo ajeno:**

| Pieza | Dueño |
|---|---|
| Todo lo de esta §18 y de la §19 (frontend del drawer, su store, el registro) | **Tú** |
| `src/tutor/*` (el Tutor no está en la lista de módulos de §16.0c; no lo edites aunque te parezca chico) | **Claude Code** — ya entregado el 19/09: `GET /tutor/history`, códigos HTTP reales de error, clave del estudiante (`/tutor/api-key`), historial sin duplicar |
| Decisiones de comportamiento del Tutor (§18.4) | **Dueño del proyecto** — no las asumas |

**Dos cambios de backend que ya están hechos y que cambian tu trabajo** (verificados contra el
servidor real el 19/09):
1. El Tutor **ya no responde con un texto de reserva** cuando falla el LLM: responde con un error real
   (`422`, `428`, `429`, `503`, ver §18.1) y tu interfaz debe manejarlo.
2. Existe `GET /tutor/history` (§18.7) — ya no depende de nadie.

Reglas de §16.0b (reutilizar tokens y patrones, no inventar) y de §16.0c (declarar aparte cualquier
edición de `src/`) siguen vigentes. Para el patrón de modal accesible reutiliza el que ya existe en
`frontend-nuxt/pages/docente/contenidos.vue` (`role="dialog"`, línea ~185) y para avisos el de
`role="status"`/`role="alert"` de la misma página — no inventes uno distinto.

### 18.1 Errores legibles — la pieza de mayor valor

**El bug, con evidencia:** el filtro global del backend (`src/common/filters/http-exception.filter.ts:15-20`)
responde `{ statusCode, timestamp, path, error }` — el texto va en **`error`**, no en `message`. Pero
`frontend-nuxt/stores/tutor.ts:110` lee `err?.data?.message`, que nunca existe, y cae a `err?.message`:
el texto crudo de ofetch (`[POST] "http://localhost:3001/tutor/chat": 429 Too Many Requests`). Eso es lo
que hoy ve el estudiante dentro de "⚠ Tutor Temporalmente Indisponible: …". (El patrón correcto ya
existe en `stores/auth.ts:47`: `err?.data?.error || err?.data?.message`.)

**Contrato real de errores de `POST /tutor/chat`** (el campo `error` puede ser `string` o `string[]`):

| Estado | Significa | Qué debe pasar en la interfaz |
|---|---|---|
| `428` | El estudiante no configuró su clave de Google AI Studio | Abrir el panel de clave de §19.2 **dentro del chat** (no un mensaje de error) |
| `422` | Google rechazó la clave (inválida o revocada) | Mensaje claro + abrir el panel de clave para cambiarla |
| `403` | El docente desactivó el Tutor en esa clase, unidad o actividad (§20.3) | Mostrar el texto del backend, **sin** "Reintentar", sin abrir el panel de clave. **No es cierre de sesión.** |
| `429` | Cuota gratuita de Google agotada, o demasiadas preguntas seguidas | *"Llegaste al límite gratuito por ahora. Espera un momento e inténtalo de nuevo."* |
| `503` | Google no disponible / el servidor no puede cifrar claves | *"El tutor no está disponible en este momento. Inténtalo de nuevo en un minuto."* |
| sin respuesta (red caída) | — | *"No pude conectarme. Revisa tu conexión e inténtalo de nuevo."* |
| cualquier otro | — | *"Algo salió mal al consultar al tutor. Inténtalo de nuevo."* |

**Qué hacer:**
- Crea un helper pequeño (p. ej. `frontend-nuxt/composables/useApiErrorMessage.ts`) que, dado el error
  capturado, devuelva `{ status, detail }`: `status` de `err.response?.status ?? err.statusCode ?? err.status`;
  `detail` de `err.data?.error ?? err.data?.message` (si es arreglo, únelo con `. `). Sin librerías nuevas.
- Para `422`, `428`, `429` y `503` el backend ya manda un texto en español pensado para el estudiante:
  puedes usarlo tal cual (`detail`) o el de la tabla; para todo lo demás usa el texto fijo de la tabla —
  nunca `err.message`, nunca URLs.
- El mensaje de error debe verse distinto de una respuesta del tutor (tokens semánticos que ya existen,
  como `semantico-falla`), llevar `role="alert"` y, salvo `428`/`422`, ofrecer un botón **"Reintentar"**
  que reenvía el último mensaje del estudiante sin volver a escribirlo. Marca el mensaje con una bandera
  (p. ej. `isError: true` en `TutorMessage`, `frontend-nuxt/types/index.ts`) para que el botón solo
  aparezca ahí. Un fallo ya no deja el mensaje del estudiante guardado en el backend: reintentar no
  duplica nada.
- El `console.warn` para depuración se queda.

**Nota, sin refactorizar:** el mismo patrón `err.data.message` aparece en otras partes del frontend y
tiene el mismo defecto. **No lo cambies fuera del Tutor en esta fase**: anótalo en tu informe con la
lista de archivos donde lo encuentres, y Claude Code decide si se arregla de forma central en `useApi`.

### 18.2 El chat baja solo

`TutorChatDrawer.vue:175` llama `scrollToBottom()` solo dentro de `handleSend`, es decir, *antes* de que
llegue la respuesta — la respuesta del tutor, el saludo proactivo y las solicitudes rápidas no
disparan ningún scroll, así que el estudiante tiene que bajar a mano. Haz que baje cuando cambie
`tutorStore.messages.length` y cuando aparezca/desaparezca el indicador de pensamiento (un `watch`
sobre ambos). Verifica con una conversación larga, no con dos mensajes.

### 18.3 Accesibilidad del drawer (WCAG 2.1 AA)

Estado real hoy: ni `role="dialog"`, ni `aria-modal`, ni `aria-label`, ni `aria-live`; el botón cerrar
promete *"Cerrar Tutor (Esc)"* (`TutorChatDrawer.vue:31`) pero **no existe ningún manejador de Escape en
todo `frontend-nuxt/`** (búsqueda hecha, cero resultados). Corrige:
- Contenedor del drawer: `role="dialog"`, `aria-modal="true"`, `aria-label="Tutor IA"`.
- **Escape cierra el drawer** (un listener en `document` mientras esté abierto, retirado al cerrar o
  desmontar — sin fugas).
- Al abrir, el foco va al campo de pregunta (o al campo de clave si el panel de §19.2 está visible); al
  cerrar, vuelve al elemento que lo abrió.
- Trampa de foco simple mientras esté abierto (Tab y Shift+Tab no se escapan al fondo).
- El contenedor de mensajes con `aria-live="polite"` para que el lector de pantalla anuncie las
  respuestas nuevas; el indicador de pensamiento con `role="status"`.
- El botón ✕ con `aria-label="Cerrar Tutor"` (el `title` solo no basta). El campo de pregunta con
  `aria-label`; los emoji decorativos de los botones con `aria-hidden="true"`.
- Contraste: revisa el texto `text-[10px]`/`text-[11px]` sobre `bg-acento-ambar/10` — si no llega a
  4.5:1 con los tokens existentes, ajusta a otro token existente, nunca a un color nuevo.

### 18.4 Nivel de guía — decidido: automático y visible

**Decisión del dueño (19/09):** el nivel de ayuda lo decide el sistema, no el estudiante, y se ve en la
interfaz. Es el principio P03 (andamiaje progresivo): 1 · pista conceptual → 2 · pregunta guía → 3 ·
localizar la falla, sin entregar nunca el código. **El backend ya lo calcula** (Claude Code, 19/09): cuenta
los intentos calificados de la actividad que no aprobaron (0–1 → nivel 1; 2–3 → nivel 2; 4 o más → nivel
3), se lo indica al LLM en el prompt y te lo devuelve:

- `POST /tutor/chat` responde ahora `{ success, message, response, suggestedActivity, guidanceLevel }` con
  `guidanceLevel` = `1 | 2 | 3`, o `null` si el estudiante no está en una actividad.
- `GET /tutor/guidance?activityId=N` → `{ success, guidanceLevel, tutorEnabled, maxGuideLevel }` (mismo
  cálculo, para mostrarlo antes del primer mensaje). El nivel ya viene **limitado por el tope que fijó el
  docente** (§20) y `tutorEnabled` es `false` si el docente desactivó el Tutor ahí: en ese caso deshabilita el
  campo de pregunta y muestra el aviso de §20.3.

**Qué hacer en la interfaz:**
- Los tres chips de `TutorChatDrawer.vue:36-56` pasan a reflejar `guidanceLevel` (el activo resaltado,
  como hoy). **Siguen sin ser botones** — nadie elige el nivel — pero dales un texto accesible: p. ej.
  `role="status"` con *"Nivel de ayuda actual: 2 de 3 — pregunta guía"*. Los nombres de los chips (Pista /
  Pregunta / Falla) se pueden mantener; solo asegúrate de que la etiqueta larga es la que anuncia el lector.
- Pídelo con `GET /tutor/guidance` al abrir el drawer cuando exista `workspaceStore.currentExercise?.activityId`,
  y actualízalo con cada respuesta de `POST /tutor/chat`. Si es `null`, **oculta** el bloque de chips (no hay
  actividad, no hay nivel que mostrar). El nivel también sube cuando el estudiante envía la actividad fuera
  del chat: refréscalo al reabrir el drawer.
- Elimina `activeScaffoldingLevel` del store y `scaffoldingLevel` de `TutorMessage`: eran el estado
  decorativo. Reemplázalo por `guidanceLevel` (`1|2|3|null`) tomado del backend.
- Los tres botones de "Solicitudes rápidas" (`requestQuickHint`) **se quedan como atajos de texto**, pero ya
  no cambian ningún nivel (hoy hacen `activeScaffoldingLevel = N`). Cambia el rótulo *"Solicitudes rápidas
  de andamiaje"* por algo como *"Atajos"*: ya no pretenden fijar el nivel, y el nivel real puede ser distinto
  del que sugiere el botón que pulses.

### 18.5 Markdown del chat

`formatMessage` (`TutorChatDrawer.vue:195-203`) solo entiende `**negrita**`, `` `código` `` y saltos de
línea, y sus expresiones regulares no cruzan líneas: un bloque de código de varias líneas (```…```) se
rompe. El Tutor devuelve código con frecuencia, así que:
- **Mantén el orden que ya es seguro: escapar HTML primero, formatear después.** Es la defensa contra
  XSS de este componente (`escapeHtml`, línea 186) — no la reordenes ni la debilites.
- Soporta bloques ```…``` (renderizados en `<pre><code>` con los tokens de código que ya usa el
  proyecto, `font-codigo`, con `overflow-x-auto` para que no rompan el ancho del drawer) y listas simples
  (`- ` y `1. `).
- Extrae la función a un módulo propio (p. ej. `frontend-nuxt/utils/formatTutorMessage.ts`) para poder
  probarla. **El frontend no tiene framework de pruebas** (`package.json` sin `vitest`) y no debes
  agregar uno en esta fase: verifica con cadenas de ejemplo en el navegador — código con `<script>` y
  `<img onerror=…>` dentro, un bloque sin cerrar, texto con `**` sueltos — y pega lo que viste en tu
  informe.

### 18.6 Espera del LLM (DIS-03) y móvil

- **Espera:** hoy hay un solo texto fijo (*"El tutor está analizando tu contexto de código..."*,
  `TutorChatDrawer.vue:101`) sin importar cuánto tarde. Haz que escale con el tiempo (un temporizador
  simple en el store, que se limpia siempre en `finally`): al inicio el actual; pasados ~8 s, *"Sigo
  trabajando en tu respuesta…"*; pasados ~20 s, *"Está tardando más de lo normal. Puedes seguir
  esperando."*. **Sin botón de cancelar:** `useApi` no acepta `AbortSignal` y es un composable
  compartido por todo el frontend — no lo modifiques aquí. (El backend ya prueba hasta 3 modelos de
  Google con 15 s cada uno, así que esperas de 20–40 s son posibles.)
- **Móvil (375 px):** el campo de pregunta usa `text-xs` (12 px) — en iOS cualquier `input` por debajo
  de 16 px hace zoom automático al enfocarlo. Súbelo a ≥ 16 px con los tokens existentes; los botones de
  solicitud rápida y el de Enviar deben tener un área táctil razonable (~44 px de alto) y los botones
  rápidos deben envolver sin desbordar.

### 18.7 Historial visible tras recargar

El backend guardaba cada mensaje pero no había forma de leerlos, así que al recargar la página el chat
volvía vacío aunque el tutor "recordara". **Ya existe** `GET /tutor/history?limit=N` (solo rol
estudiante, solo los mensajes del propio estudiante, del más antiguo al más reciente; `limit` por
defecto 20, máximo 50):

```json
{ "success": true,
  "messages": [ { "id": 41, "role": "user" | "assistant", "content": "…", "createdAt": "2026-09-19T14:02:11.000Z" } ] }
```

`stores/tutor.ts` lo pide **una vez al abrir el drawer por primera vez en la sesión**, antes de
`fetchGreeting()`, y convierte cada fila a `TutorMessage` (`assistant` → `sender: 'tutor'`, `user` →
`'student'`). El contenido llega ya saneado por el backend; pasa igual por `formatMessage` (escapa de
nuevo — es la regla). El saludo proactivo se muestra siempre después del historial: **no intentes
deduplicarlo** en el cliente. Si la petición falla, el chat abre vacío como hoy (no bloquees el drawer).

### 18.8 Explícitamente fuera de esta fase

- `src/tutor/*`, `mastery.calculator.ts` y cualquier archivo de `src/` (§18.0, reparto).
- Cambiar cómo se calcula el nivel de guía o el comportamiento del Tutor (§18.4: ya viene del backend).
- Agregar librerías (Markdown, framework de pruebas, iconos) o cambiar `useApi`.
- Streaming de la respuesta del LLM y botón de cancelar (requieren cambios de backend y de `useApi`).
- La configuración del docente (es la §20). Botón "Ir al contenido" y repasos vencidos dentro del chat:
  están en el alcance del Tutor pero aún **sin diseño** — no los inventes; llegarán como fases propias. La
  barrera contra respuestas con solución ya está en el backend: si el Tutor responde con el aviso
  *"[Bloque de código omitido…]"* es correcto, se muestra como cualquier otro texto.

### 18.9 Criterio de cierre

Todo verificado en navegador real contra backend y base de datos reales, no leyendo el código:
- Con el backend detenido, enviar un mensaje muestra "No pude conectarme…" con botón **Reintentar**, sin
  ningún fragmento de URL ni de mensaje de ofetch. Con el backend arriba, el botón reenvía el mismo
  mensaje. Provoca un `429` real enviando más de 20 mensajes en un minuto (el límite de `POST /tutor/chat`)
  y muestra el texto correspondiente.
- En una conversación de 10+ mensajes el chat queda siempre al final tras cada respuesta.
- Solo con teclado: abrir el drawer, el foco cae en el campo; Tab no sale del drawer; Escape lo cierra y
  el foco vuelve al botón que lo abrió. Con lector de pantalla (o el árbol de accesibilidad del
  navegador) el drawer se anuncia como diálogo y las respuestas nuevas se anuncian.
- Con una actividad abierta, los chips muestran el nivel que devuelve el backend (comprueba con `curl` `GET /tutor/guidance?activityId=…`); fuera de una actividad no aparecen.
- Un mensaje del tutor con un bloque de código de varias líneas se ve como bloque; una cadena con
  `<script>`/`<img onerror>` se ve como texto inerte (prueba pegada en el informe).
- Recargar la página (F5) con una conversación previa muestra el historial al abrir el drawer.
- A 375 px no hay desborde horizontal ni zoom al enfocar el campo.
- `npx nuxi typecheck` con exit code 0, pegado en el informe.
- **Informe de sesión obligatorio** (`docs/antigravity/informes/`), con lo declarado en §18.1 (archivos
  con el mismo patrón `err.data.message`).

---

## 19. Clave gratuita de Google AI Studio del estudiante (2026-09-19)

### 19.0 Contexto

Decisión del dueño del proyecto (ADR 10, `docs/ADR_DECISIONES_ARQUITECTURA.md`): el Tutor funciona solo
con Gemini y **con la clave gratuita de Google AI Studio que cada estudiante aporta** — así la
escalabilidad sigue siendo gratuita. El backend ya está hecho y verificado contra el servidor real; tu
parte es toda la interfaz para conseguirla y gestionarla. **Esta fase puede ir en la misma sesión que la
§18 o justo después; comparte el drawer y el patrón de errores de §18.1.**

**Contrato de backend** (todos requieren sesión de estudiante; ninguno devuelve jamás la clave completa):

| Petición | Respuesta / errores |
|---|---|
| `GET /tutor/api-key` | `{ success, hasKey: boolean, last4: string \| null }` |
| `PUT /tutor/api-key` `{ "apiKey": "…" }` | `{ success, hasKey: true, last4 }`. Errores: `400` (formato inválido; `error` es un arreglo de textos en español), `422` (Google no reconoce la clave), `503` (no se pudo verificar con Google, reintentar), `429` (más de 5 intentos por minuto) |
| `DELETE /tutor/api-key` | `{ success, hasKey: false, last4: null }` |

La clave se verifica contra Google **al guardarla**: si el `PUT` responde `200`, ya sabes que funciona.

### 19.1 Registro: campo opcional con "Omitir"

En la página de registro (`frontend-nuxt/pages/auth/`, junto al resto del formulario), **después de la
contraseña**, agrega la sección *"Clave de Google AI Studio (para usar el Tutor)"*:
- Un campo de texto para la clave (`type="password"` con botón para mostrarla, `autocomplete="off"`) y
  una opción visible y equivalente en peso para **omitir por ahora** — omitir es el estado por defecto,
  el registro nunca se bloquea por esto.
- Un texto corto y honesto: por qué se pide (el Tutor usa tu propia cuenta gratuita de Google, sin costo
  para ti ni para el proyecto) y el aviso de privacidad de §19.3.
- Un enlace *"¿Cómo consigo mi clave?"* que abre el mismo bloque de pasos de §19.2 (componente
  compartido, no dos textos distintos).
- **Cómo se envía:** `POST /auth/register` **no cambia** (`src/auth/` está fuera de tu alcance y no
  recibe la clave). Sigue el mismo patrón que ya usa el código de clase en `stores/auth.ts` (`register`,
  ~líneas 63-100): tras el registro exitoso —que ya deja la sesión abierta— llama a `PUT /tutor/api-key`
  y, si falla, **no revientes el registro**: devuelve un aviso no bloqueante (análogo a
  `enrollmentWarning`, p. ej. `tutorKeyWarning`) que la página muestre como *"Tu cuenta se creó, pero
  no pude guardar tu clave: puedes configurarla luego desde el Tutor."* La clave no se guarda en
  `localStorage`, ni en el store, ni se imprime en consola.

### 19.2 Panel de la clave dentro del drawer del Tutor

Un componente propio (p. ej. `frontend-nuxt/components/tutor/TutorKeyPanel.vue`), visible **dentro del
chat** en estos casos: (a) al abrir el drawer, si `GET /tutor/api-key` dice `hasKey: false` — en lugar del
campo de pregunta, que queda deshabilitado con un texto que explique por qué; (b) cuando `POST /tutor/chat`
responde `428` o `422` (§18.1); (c) cuando el estudiante lo abre a propósito desde un enlace discreto
*"Mi clave"* del encabezado del drawer.

Contenido, en este orden:
1. **Pasos para conseguir la clave gratuita** (numerados, en lenguaje simple, sin jerga):
   1. Abre Google AI Studio: **https://aistudio.google.com/apikey** (enlace que abra en pestaña nueva).
   2. Inicia sesión con tu cuenta de Google (la misma de tu correo institucional o personal).
   3. Pulsa **"Create API key"** (Crear clave de API).
   4. Copia la clave que aparece y pégala aquí abajo.
   Aclara que **no pide tarjeta de crédito** y que la capa gratuita tiene un límite de uso por minuto y
   por día (si lo alcanzas, el Tutor te lo dirá y podrás seguir un momento después).
2. **El campo de la clave** (`type="password"`, mostrar/ocultar) y el botón **"Guardar y verificar"**;
   mientras responde, el botón queda deshabilitado con texto de progreso. Errores por estado:
   `400` → los textos del propio backend (uno por línea); `422` → *"Google no reconoce esa clave. Revisa
   que la copiaste completa."*; `503` → *"No pude verificar la clave ahora. Inténtalo de nuevo en un
   minuto."*; `429` → *"Demasiados intentos. Espera un minuto."*
3. **El aviso de privacidad de §19.3.**
4. Si ya hay clave (`hasKey: true`): muestra **"Clave configurada · termina en `••••{last4}`"** y dos
   acciones: **Cambiar** (vuelve al campo) y **Quitar mi clave** (con confirmación; hace `DELETE`).

Al guardar con éxito el panel se cierra, el campo de pregunta se habilita y, si el guardado venía de un
`428`/`422`, el último mensaje del estudiante se reenvía solo (mismo mecanismo que "Reintentar" de §18.1).

### 19.3 Aviso de privacidad (obligatorio, visible antes de pegar la clave)

Texto base, ajústalo de redacción pero no le quites ninguna idea: *"Tu clave se guarda cifrada y solo
sirve para hablar con el Tutor; nadie del equipo puede verla. Las preguntas que le haces al Tutor (y el
código que tengas abierto en el editor) se envían a Google usando **tu** cuenta. En la capa gratuita,
Google puede usar ese contenido para mejorar sus productos: no escribas datos personales ni contraseñas
en el chat."*

### 19.4 Explícitamente fuera de esta fase

- `src/` completo (el backend de la clave ya está hecho) y `POST /auth/register`.
- Guardar, mostrar o registrar la clave completa en cualquier lugar del cliente después del `PUT`.
- Una página de "perfil" nueva: la gestión de la clave vive en el panel del drawer.
- Cualquier otro proveedor de IA: es solo Google Gemini.

### 19.5 Criterio de cierre

Verificado en navegador real contra backend y base de datos reales. **Ojo:** probar el camino feliz
requiere una clave real de Google AI Studio (créala tú con los pasos de §19.2, es gratis); no la pegues
en el informe ni en capturas.
- Registrar un estudiante nuevo **omitiendo** la clave funciona y al abrir el Tutor aparece el panel de §19.2.
- Registrar otro **con** clave real la guarda: `GET /tutor/api-key` devuelve `hasKey: true` y el Tutor
  responde sin pedirla. Con una clave falsa el registro **no falla** y muestra el aviso no bloqueante.
- Con la clave falsa `AIzaSyFAKE-KEY_1234567890abcdefghijklmnoZ9x2` el panel muestra el error de `422`.
- **Cambiar** y **Quitar** funcionan; tras quitar, el siguiente mensaje vuelve a pedir la clave (`428`).
- Verifica en la pestaña de red que la clave completa **solo** aparece en el cuerpo del `PUT`, nunca en
  una respuesta, ni en la URL, ni en `localStorage`/`sessionStorage`.
- Solo teclado y lector de pantalla: el panel se puede completar sin ratón; los errores se anuncian
  (`role="alert"`); el campo tiene etiqueta visible.
- `npx nuxi typecheck` con exit code 0, pegado en el informe.
- **Informe de sesión obligatorio.**


---

## 20. Configuración del Tutor por el docente (2026-09-19)

### 20.0 Contexto

Decisión del dueño (ADR 11, `docs/ADR_DECISIONES_ARQUITECTURA.md`): cada docente decide qué quiere lograr con el Tutor **en cada parte de su curso** — activar o desactivar, hasta qué nivel de ayuda dar y en qué estilo — a nivel de **clase**, de **unidad** y de **actividad**; el más específico manda. Cada clase tiene sus propias unidades, así que lo que configura un docente nunca afecta a la clase de otro. El backend ya está hecho y verificado contra el servidor real (con dos docentes distintos); tu parte es toda la interfaz.

**Contrato de backend** (roles `docente` y `admin`; el docente solo puede tocar clases que dicta, si no `403 "No dictas esta clase"`):

| Petición | Respuesta |
|---|---|
| `GET /tutor/settings/:scopeType/:scopeId` | `{ scopeType, scopeId, own: { enabled, maxGuideLevel, style }, effective: { enabled, maxGuideLevel, style } }` |
| `PUT /tutor/settings/:scopeType/:scopeId` con cualquiera de `{ enabled?, maxGuideLevel?, style? }` | La misma forma que el `GET`, ya actualizada |

- `:scopeType` es `class`, `unit` o `activity`; `:scopeId` es el id de esa clase, unidad o actividad.
- `own` son los valores propios de ese ámbito; **`null` significa "hereda del ámbito superior"**. `effective` es el resultado final que verá el estudiante (actividad → unidad → clase → valores por defecto: activo, hasta el nivel 3, estilo equilibrado).
- Para volver a heredar un campo, envíalo como `null`. Solo lo que envíes cambia; lo demás se conserva.
- `enabled`: `true` | `false` | `null`. `maxGuideLevel`: `1` | `2` | `3` | `null`. `style`: `"equilibrado"` | `"motivador"` | `"tecnico"` | `"breve"` | `null`. Cualquier otro valor responde `400` con el texto del error en español (`error` es un arreglo). **No hay texto libre** y no lo agregues.

### 20.1 Dónde vive cada configuración (reutiliza los patrones existentes, §16.0b)

- **Clase:** en la vista de la clase del docente (`frontend-nuxt/pages/docente/`, donde ya se gestiona la clase), una sección *"Tutor IA de esta clase"*. Es la configuración por defecto de toda la clase.
- **Unidad:** dentro del modal de edición de unidad que ya existe en `docente/contenidos.vue` (Fase 16), una sección plegable *"Tutor IA en esta unidad"*.
- **Actividad:** dentro del modal de edición de actividad de `docente/ejercicios/crear.vue`, la misma sección *"Tutor IA en esta actividad"*.

Los tres usan **un solo componente compartido** (p. ej. `frontend-nuxt/components/docente/TutorSettingsPanel.vue`) que recibe `scopeType` y `scopeId`; no escribas tres versiones. Se carga con `GET` al abrir la sección y guarda con `PUT`.

### 20.2 Qué muestra el componente

Para cada uno de los tres ajustes, un selector con una primera opción **"Heredar (…)"** que muestra entre paréntesis el valor que se hereda hoy (sale de `effective` cuando `own` es `null`; en el ámbito *clase* la herencia son los valores por defecto):

1. **Tutor:** Heredar · Activado · Desactivado. Texto de ayuda: *"Si lo desactivas, los estudiantes no podrán usar el Tutor en esta parte del curso y verán un aviso."*
2. **Nivel máximo de ayuda:** Heredar · 1 (solo pistas conceptuales) · 2 (hasta preguntas guía) · 3 (hasta señalar dónde está la falla). Texto de ayuda: *"El Tutor sube de nivel solo cuando el estudiante lleva varios intentos fallidos. Aquí decides hasta dónde puede llegar. Nunca entrega la solución completa."* — usa estos nombres y no inventes otros; son los del principio pedagógico del proyecto.
3. **Estilo:** Heredar · Equilibrado · Motivador · Técnico · Breve (60 palabras o menos).

Debajo, una línea de resumen con lo **efectivo** (*"Resultado para tus estudiantes: activado, hasta nivel 2, estilo breve"*) que se actualiza al guardar. Un botón **Guardar**; al terminar, `role="status"` con *"Configuración guardada"*. Errores: `403` → *"No puedes configurar el Tutor de una clase que no dictas."*; `400` → los textos del propio backend; cualquier otro → mensaje genérico en español (mismo criterio de §18.1: nunca texto crudo de ofetch; el patrón correcto de leer el error es `err.data.error ?? err.data.message`).

### 20.3 El lado del estudiante cuando el docente desactiva el Tutor

Esto se apoya en la §18: `GET /tutor/guidance?activityId=N` devuelve ahora también `tutorEnabled` y `maxGuideLevel`, y `POST /tutor/chat` responde **`403`** con el texto *"Tu docente desactivó el Tutor en esta parte del curso."* cuando está desactivado.
- Si `tutorEnabled` es `false`, el drawer deshabilita el campo de pregunta y los atajos y muestra ese aviso (con `role="status"`), en vez de dejar escribir y fallar.
- Si un `POST /tutor/chat` responde `403`, muestra el mensaje del backend, **sin** botón "Reintentar" (no se arregla reintentando) y sin abrir el panel de clave.
- Un `403` **no** es cierre de sesión: no lo trates como sesión vencida.

### 20.4 Explícitamente fuera de esta fase

- `src/` completo (todo está hecho) y cualquier campo de texto libre para el docente.
- Configuración por estudiante, por grupo dentro de una clase o por fecha/hora.
- Un panel de "uso del Tutor" o estadísticas para el docente (no existen en backend).

### 20.5 Criterio de cierre

Verificado en navegador real con dos docentes y un estudiante matriculado en ambas clases (las cuentas demo de `README.md`: Prof. Toscano, Prof. Castro y Pedro):
- Un docente configura su clase, una de sus unidades y una de sus actividades; al recargar, `own` y el resumen efectivo coinciden con lo guardado; volver a **Heredar** en los tres selectores elimina la configuración.
- La configuración más específica manda: con la clase en *nivel máximo 2* y la unidad en *nivel máximo 1*, el estudiante en una actividad de esa unidad ve el nivel limitado a 1 (`GET /tutor/guidance`).
- El **otro** docente no puede leer ni cambiar la configuración de una clase ajena (la interfaz muestra el `403` sin romperse), y la configuración de una clase no cambia nada en la del otro docente.
- Con el Tutor desactivado en una unidad, el estudiante entra a una actividad de esa unidad, ve el campo deshabilitado con el aviso, y en otra unidad (o en el chat general) el Tutor sigue funcionando.
- Todo el componente se usa solo con teclado; los selectores tienen etiqueta visible; los avisos se anuncian.
- `npx nuxi typecheck` con exit code 0, pegado en el informe.
- **Informe de sesión obligatorio.**
