---
estado:     nuevo — plan independiente, no reemplaza ni edita PLAN_IMPLEMENTACION.md (Insumo 15)
fecha:      2026-09-10
fuente:     normativo (insumo de arranque para Google Antigravity), escrito por Claude Code
origen:     motivado por la §13 de PLAN_IMPLEMENTACION.md — se separa a un documento propio porque
            es una pieza de arquitectura completa en sí misma (5 tipos de pregunta, no 2 pantallas)
relacion:   una vez cerrado, Claude Code retoma el motor de selección de actividad por dominio
            descrito en PLAN_IMPLEMENTACION.md §13.4 — ese documento no se toca desde aquí
---

# Plan de Implementación — Pantallas de Tipos de Actividad

**Propósito de este documento:** que Antigravity entienda cómo funciona el sistema completo de
tipos de pregunta en STIRE — no solo qué pantallas construir, sino por qué el modelo de datos, el
motor de calificación y la capa de seguridad ya están armados así, para que lo que se construya
encaje en la arquitectura real del proyecto y no sea una pieza aislada. STIRE dejó de ser un
mockup esta semana: cada pantalla que se agregue debe calificar contra el backend real, con datos
reales, verificado en el navegador — no una maqueta que aparenta funcionar.

---

## 1. Por qué existe este documento

El dueño del proyecto pidió, en uso real de la plataforma, poder calcular o elegir la actividad
según el dominio del estudiante ("si se siente experto, dale la actividad de mayor peso"). Antes
de construir eso, se verificó contra `src/seeds/seed-runner.ts` cómo está armado el contenido real
y se encontró que **cada unidad de aprendizaje tiene siempre 3 actividades de tipo distinto**, en
orden de peso creciente: Quiz (`MCQ`) → Completar Código (`FILL_CODE`) → Desafío de Código
(`CODING`). No hay dos actividades del mismo tipo a distinto nivel — es una progresión de tipos.

El problema real: **hoy solo `CODING` tiene pantalla.** `pages/estudiante/evaluacion/[activityId].vue`
y `stores/workspace.ts` (corregidos hoy, commit `29575e6`) ya no fingen que cualquier pregunta es
código libre — si la actividad es de otro tipo, muestran un aviso honesto de "este editor no lo
soporta todavía" en vez de un sandbox que no le corresponde. Eso evita el error, pero no resuelve
nada: un estudiante que necesita el Quiz o el Completar Código sigue sin poder resolverlos. Sin
esas pantallas, tampoco tiene sentido construir un selector de dominio — no habría a dónde mandar
a un estudiante que no está listo para el desafío de código.

**Esta fase existe para cerrar esa brecha de raíz**, no solo para los 2 tipos que ya tienen
contenido sembrado, sino explicando el sistema completo de 6 tipos de pregunta que el backend ya
soporta, para que Antigravity pueda ubicar cada pieza nueva dentro del proyecto en general.

---

## 2. Cómo funciona el sistema de tipos de pregunta hoy (arquitectura real, verificada)

### 2.1 Modelo de datos

```
Activity (1) ──── (1) ActivityQuestion
                        ├─ type: QuestionType         ("mcq" | "coding" | "drag_drop" |
                        │                               "matching" | "fill_code" | "ordering" |
                        │                               "ai_evaluated")
                        └─ config: JSON                (forma distinta según `type`)
```

`src/common/enums/question-type.enum.ts` — los valores reales son **minúscula** (`'mcq'`,
`'fill_code'`, etc.), no el nombre del enum en mayúscula. Esto ya causó un bug real hoy mismo
(commit `29575e6` de esta sesión comparaba mal contra `'CODING'` en mayúscula) — verificar siempre
contra el enum, no asumir.

Cada `Activity` tiene exactamente **una** `ActivityQuestion` en el contenido sembrado actual (no
hay actividades con múltiples preguntas hoy, aunque el modelo lo permitiría).

### 2.2 Contrato de API — ya existe, no hay que tocarlo

| Método | Endpoint | Qué hace | Tocar? |
|---|---|---|---|
| `GET` | `/activities/:id` | Metadatos de la actividad (título, dificultad, intentos) | No |
| `GET` | `/activity-questions/activity/:activityId` | Devuelve la(s) pregunta(s), **ya saneadas** (ver §2.3) | No |
| `POST` | `/submissions/start` | Inicia/retoma un intento | No |
| `POST` | `/submissions/:id/submit` | Califica — recibe `{answers: [{questionId, answer}]}`, `answer` cambia de forma según el `type` (ver §3) | No |
| `POST` | `/submissions/:id/run` | Solo para `coding`: ensayo libre contra casos públicos | No — no aplica a otros tipos |
| `GET` | `/submissions/:id` | Estado/nota de un intento (nuevo hoy, commit `5310967`, para calificación asíncrona de `coding`) | No |

**Ningún endpoint nuevo hace falta para esta fase.** El motor de calificación ya es genérico por
tipo (§2.4) — el trabajo es 100% de pantalla, conectando contra lo que ya existe.

### 2.3 Seguridad ya resuelta: nunca se sanea "quitando el campo", se sanea por tipo

`src/activity-questions/dto/student-question.dto.ts` (`StudentQuestionDto.fromEntity`, ya cableado
en `activity-questions.controller.ts:49`) transforma cada pregunta antes de mandarla al estudiante.
**Esto es importante para el diseño de cada pantalla: el frontend NUNCA recibe la respuesta
correcta**, y para los tipos donde el orden de la lista podría delatarla (`DRAG_DROP`, `MATCHING`,
`ORDERING`), las listas llegan barajadas server-side. La tabla exacta de qué se oculta está en
§3, por tipo — es la fuente de verdad de qué campos existen realmente en el `config` que cada
pantalla va a recibir.

### 2.4 Motor de calificación — Strategy Pattern, ya completo para 5 de 6 tipos

`src/evaluation-engine/evaluation-engine.service.ts` ya tiene una estrategia registrada y
**probada con tests** para: `MCQ`, `CODING`, `DRAG_DROP`, `FILL_CODE`, `ORDERING`, `MATCHING`. Solo
`AI_EVALUATED` no está registrado — llamar `evaluateAnswer('ai_evaluated', ...)` lanza
`BadRequestException`. **Nada de esto se toca en esta fase** — ya funciona, ya tiene sus propios
tests en `src/evaluation-engine/__tests__/evaluation-engine.service.spec.ts`, y ese archivo es la
fuente autoritativa del `answer` exacto que cada estrategia espera (citado por tipo en §3).

### 2.5 El punto de extensión ya existe en el frontend — no es un layout nuevo desde cero

`stores/workspace.ts` (`loadActivity()`, corregido hoy) ya expone
`currentExercise.questionType` con el valor real y minúscula del tipo. `layouts/workspace.vue`
(cabecera con título, intentos, autoguardado, botón Tutor IA) y el patrón de panel izquierdo con
pestañas (Enunciado / Casos / Consola, en
`pages/estudiante/evaluacion/[activityId].vue`) son el lenguaje visual que ya existe para `coding`
— **esta fase adapta y reutiliza ese lenguaje por tipo, no inventa una pantalla nueva sin relación
con la que ya funciona.**

---

## 3. Estado real por tipo de pregunta — la tabla que ordena el trabajo

| Tipo | Evaluador backend | Contenido sembrado hoy | Pantalla hoy | Prioridad |
|---|---|---|---|---|
| `mcq` | ✅ `McqEvaluator` | ✅ sí (ver Actividad 1, `seed-runner.ts:344-365`) | ❌ | **Nivel 1** |
| `fill_code` | ✅ `FillCodeEvaluator` | ✅ sí (`seed-runner.ts:538-578`) | ❌ | **Nivel 1** |
| `coding` | ✅ `CodingEvaluator` | ✅ sí | ✅ ya construida, no tocar | — |
| `drag_drop` | ✅ `DragDropEvaluator` | ❌ no hay ninguna sembrada | ❌ | **Nivel 2** |
| `ordering` | ✅ `OrderingEvaluator` | ❌ no hay ninguna sembrada | ❌ | **Nivel 2** |
| `matching` | ✅ `MatchingEvaluator` | ❌ no hay ninguna sembrada | ❌ | **Nivel 2** |
| `ai_evaluated` | ❌ no registrado en el backend | ❌ | ❌ | **Excluido (§6)** |

**Nivel 1 primero, y verificado de punta a punta, antes de tocar Nivel 2.** Nivel 1 tiene contenido
real ya sembrado — se puede construir y probar en el navegador contra datos reales hoy mismo.
Nivel 2 requiere sembrar contenido de ejemplo primero (parte del alcance de esta fase, no un paso
aparte) precisamente para poder verificarlo igual de en serio, no solo compilar.

---

## 4. Nivel 1 — `mcq` y `fill_code` (contenido real, prioridad inmediata)

### 4.1 `mcq` (Quiz)

**`config` que realmente llega al frontend** (después de `StudentQuestionDto`, `correctAnswerId` y
`explanation` ya NO están presentes):
```json
{ "options": [{ "id": "a", "text": "..." }, { "id": "b", "text": "..." }, ...] }
```

**`answer` que el backend espera al entregar** (`POST /submissions/:id/submit`,
`answers: [{ questionId, answer }]`) — verificado contra
`evaluation-engine.service.spec.ts:15-24`:
```json
{ "selectedId": "a" }
```
(Si `config.isMultipleChoice` fuera `true` en el futuro, sería un array — hoy el contenido
sembrado es siempre single-choice; no construir UI de selección múltiple sin verificar primero que
exista una pregunta `isMultipleChoice:true` real para probarla contra.)

**UI:** opciones de selección única (radio, no checkbox). Reusa el panel izquierdo con pestaña
"Enunciado" para el texto de la pregunta. Solo tiene sentido **"Entregar solución"** — nunca
"Probar código" (no hay nada que ensayar en un quiz).

### 4.2 `fill_code` (Completar Código)

**`config` saneado:**
```json
{ "codeTemplate": "if (edad ___b1___ 18) {...}", "blanks": [{ "id": "b1", "regexMode": false }, { "id": "b2", "regexMode": false }] }
```
(`answer` de cada blank NUNCA llega al frontend — solo `id` y `regexMode`.)

**`answer` esperado** (verificado contra `evaluation-engine.service.spec.ts:26-34`):
```json
{ "blanks": { "b1": ">=", "b2": "else" } }
```

**UI:** el `codeTemplate` se muestra como bloque de código de solo lectura (mismo estilo
monoespaciado que ya usa el editor de `coding`), con un campo de texto editable insertado en cada
posición `___id___`. No es un editor Monaco libre — son huecos puntuales dentro de código fijo.
Solo "Entregar solución" tiene sentido (no hay casos de prueba que ensayar).

---

## 5. Nivel 2 — `drag_drop`, `ordering`, `matching` (backend listo, sin contenido sembrado todavía)

Para estos tres, el motor de calificación ya existe y ya está probado — lo único que falta,
además de la pantalla, es **contenido real para poder verificarla de verdad**. Como parte de esta
fase (no un paso aparte, no delegado a otra sesión): agregar **una actividad de ejemplo de cada
tipo** a `src/seeds/seed-runner.ts`, siguiendo exactamente el mismo patrón (`findOrCreate`,
`activityTypeId: autoType.id`, `adaptiveWeight` razonable, `PublicationStatus.PUBLISHED`) que ya
usan las actividades `mcq`/`fill_code`/`coding` existentes — sin eso, cualquier pantalla construida
para estos tipos sería, otra vez, algo que aparenta funcionar sin poder probarlo contra datos
reales.

### 5.1 `drag_drop`

**`config` saneado** (`mappings` nunca llega; `items`/`targets` llegan barajados):
```json
{ "items": [{ "id": "item_1", "content": "..." }], "targets": [{ "id": "zone_a", "label": "..." }] }
```
**`answer` esperado** (`evaluation-engine.service.spec.ts:36-44`):
```json
{ "mappings": { "item_1": "zone_a" } }
```
**UI:** arrastrar cada `item` a su `target` correspondiente (o, si el tiempo no alcanza para una
interacción de arrastre real, un `<select>` por item como alternativa funcional — mejor una
interacción simple que funciona que un drag-and-drop a medias).

### 5.2 `ordering`

**`config` saneado** (`correctOrder` nunca llega; `blocks` llega barajado):
```json
{ "blocks": [{ "id": "a", "content": "..." }, { "id": "b", "content": "..." }] }
```
**`answer` esperado** (`evaluation-engine.service.spec.ts:46-54`):
```json
{ "order": ["a", "b"] }
```
**UI:** lista reordenable (arrastrar para reordenar, o botones subir/bajar como alternativa
simple).

### 5.3 `matching`

**`config` saneado** (`pairs` nunca llega; `rightColumn` llega barajado, `leftColumn` no):
```json
{ "leftColumn": [{ "id": "left_1", "content": "..." }], "rightColumn": [{ "id": "right_a", "content": "..." }] }
```
**`answer` esperado** (`evaluation-engine.service.spec.ts:56-64`):
```json
{ "pairs": { "left_1": "right_a" } }
```
**UI:** cada elemento de `leftColumn` con un `<select>` de opciones de `rightColumn` (más simple y
más confiable que arrastrar-para-emparejar; ambas cumplen el contrato).

---

## 6. Explícitamente excluido de esta fase: `ai_evaluated`

`EvaluationEngineService` no tiene ninguna estrategia registrada para `ai_evaluated` — llamarlo
lanza `BadRequestException`. No hay backend que conectar. **No construir pantalla ni sembrar
contenido para este tipo en esta fase** — sin evaluador real detrás, cualquier pantalla sería
necesariamente una simulación, exactamente lo que este proyecto viene eliminando toda la semana
(fallbacks y resultados fabricados en `auth.ts`, `workspace.ts`, el Tutor). Si en el futuro se
decide implementarlo, es un backend nuevo primero — no entra por esta puerta.

---

## 7. Mecanismo de enrutamiento a implementar

Hoy, `pages/estudiante/evaluacion/[activityId].vue` es una sola plantilla que asume `coding` y
solo sabe decir "no soportado" para el resto (parche honesto de hoy, no la solución final). Esta
fase reemplaza ese aviso por una vista real por tipo:

- `stores/workspace.ts` ya expone `currentExercise.questionType` — úsalo para decidir qué
  sub-componente renderizar dentro de la misma estructura de `layouts/workspace.vue` (cabecera,
  Tutor IA) y del panel de pestañas ya existente.
- Patrón sugerido: un componente por tipo (`components/exercise/McqExercise.vue`,
  `FillCodeExercise.vue`, `DragDropExercise.vue`, etc.), y que la página elija cuál montar según
  `questionType` — evita una plantilla gigante con `v-if` anidados por los 5 tipos.
- El botón "Probar código" del header (`layouts/workspace.vue`) debe seguir deshabilitado para
  todo lo que no sea `coding` — no tiene sentido fuera de ese tipo, no se agrega un "probar" falso
  para los demás.
- "Entregar solución" siempre pasa por el mismo `POST /submissions/:id/submit` real que ya usa
  `coding` — la única diferencia entre tipos es la forma del `answer` que arma cada componente,
  documentada en §4 y §5.

---

## 8. Reglas no negociables (por qué, no solo qué)

Esta semana se cerraron, uno por uno, varios casos de "la interfaz aparenta un resultado que el
backend no dio de verdad": el login con roles falsos, la calificación de 100/100 fabricada al
fallar la red, el Tutor con una respuesta enlatada, el modal de entrega con "85% de dominio"
hardcodeado. **Esta fase no puede reabrir ese patrón con un tipo de pregunta nuevo.**

1. **Ninguna pantalla muestra "correcto" o un puntaje sin que la respuesta del backend real lo
   confirme.** Si `POST /submissions/:id/submit` falla (red, timeout, error del servidor), se
   muestra el error tal cual — nunca un resultado inventado.
2. **Ningún `config` con la respuesta correcta se hardcodea en el frontend como atajo.** Si algo
   parece faltarle al `config` saneado que llega del backend para poder renderizar la pregunta,
   es un hueco real que hay que resolver en el backend (o reportar), no rellenar a ciegas del lado
   del cliente.
3. **Cada pantalla nueva se verifica en el navegador real, contra el backend real, con el
   contenido sembrado real** (Nivel 1: ya existe. Nivel 2: se siembra como parte de esta fase) —
   no alcanza con que compile o pase el typecheck.
4. **No se toca la rama `coding`** de `workspace.ts`, `evaluacion/[activityId].vue`, ni nada de
   `src/submissions`, `src/judge-engine`, `src/evaluation-engine` — ya está correcto y ya tiene
   tests; el riesgo de romperlo sin necesidad es mayor que el beneficio de "aprovechar" para
   tocarlo.

---

## 9. Explícitamente fuera de esta fase

- El motor de selección de actividad por dominio (mastery + autopercepción del estudiante) — lo
  retoma Claude Code después de esta fase, ya descrito en `PLAN_IMPLEMENTACION.md` §13.4. No
  construir nada de eso aquí.
- Vistas de Docente/Administrador — sin cambios, siguen fuera por prioridad (ver §1/§7.3/§12.3-E
  de `PLAN_IMPLEMENTACION.md`).
- `ai_evaluated` (§6).
- Cualquier endpoint nuevo de backend — no hace falta ninguno para esta fase (§2.2).

---

## 10. Entregables y criterio de cierre

- [ ] `mcq` y `fill_code` (Nivel 1) abren una pantalla real y "Entregar solución" califica de
      verdad contra el backend existente — verificado en el navegador contra al menos una
      actividad real ya sembrada de cada tipo.
- [ ] Una actividad de ejemplo sembrada para `drag_drop`, `ordering` y `matching` (Nivel 2), y sus
      3 pantallas correspondientes, verificadas igual que Nivel 1 — en el navegador, contra el
      backend real.
- [ ] `ai_evaluated`: sin pantalla, sin contenido sembrado (verificación negativa: confirmar que no
      se agregó nada para este tipo).
- [ ] La rama `coding` de `workspace.ts` y `evaluacion/[activityId].vue` sin cambios de
      comportamiento (regresión cero — reproducir el flujo de `docs/00_VISION_FUNCIONAL.md` §9.3
      sin diferencias).
- [ ] `npx nuxi typecheck` y el typecheck/build del backend (si se tocó algo de `src/`, que no
      debería hacer falta) sin errores nuevos.
- [ ] Informe de sesión nuevo en `docs/antigravity/informes/`, mismo formato que
      `TEMPLATE_INFORME.md`, con fila agregada al índice de `docs/antigravity/README.md` — que
      incluya, por cada tipo, el `activityId` real usado para verificarlo, para que Claude Code
      pueda repetir la verificación sin tener que buscarlo.
