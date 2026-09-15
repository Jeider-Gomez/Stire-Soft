---
estado:     vigente — Fase 16 en curso
verificado: 2026-09-15
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
