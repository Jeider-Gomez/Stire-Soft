> **ARCHIVADO el 2026-09-25 — Fase 25 ejecutada (Parte A: Claude Code; Parte B: Antigravity), auditada y corregida por Claude Code.**
> Es un documento histórico; el plan vigente es `docs/antigravity/PLAN_IMPLEMENTACION.md` (Fase 26).
> **Resultado de la auditoría** (`docs/ReportesQA/REPORTE_AUDITORIA_QA_FASE25B_2026-09-25.md`): la seguridad de la vista previa y los flujos del docente y del estudiante
> estaban bien. Dos fallos reales, corregidos el mismo día: (1) la pantalla del ejercicio tenía alto fijo y en un celular el editor quedaba fuera de pantalla y «Entregar»
> cortado; (2) «Probar» de la barra superior fallaba en silencio ante un 429. Además, al hacer A7 el fuzzing destapó un defecto **anterior a la fase**: `formatMarkdown`
> podía colar atributos (`onclick`…) en HTML ya saneado; se cerró pasando el HTML final por DOMPurify en el navegador (`utils/sanitizeRenderedHtml.ts`).
> **Lecciones para los planes siguientes:** un control de cierre («cero `err?.data?.message`») se escribe contra lo que el árbol realmente contiene (había 15 en páginas antiguas,
> no tocadas por la fase); una pantalla con altura fija (`h-screen`) se comprueba en 375 px; el HTML que se inserta con `v-html` termina siempre en un saneador, no en reglas de texto.

---

---
estado:     Fase 25 CERRADA el 25/09 — Parte A (backend, 24/09), Parte B (frontend, auditada y corregida 25/09) y A7 (25/09) en main. Sin fase nueva escrita: la Fase 26 (editor con resaltado) se escribe aparte
verificado: 2026-09-24 contra src/ y frontend-nuxt/ reales (rutas y líneas citadas comprobadas en esa fecha)
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    DOC-V03 (crear ejercicio) · EST-V03 (ejercicio del estudiante)
---

# Plan de implementación para Antigravity — Fase 25

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 24 ya están hechas y archivadas en
[`docs/_archivo/`](../_archivo/). **No las leas para ejecutar esta fase.** La numeración continúa en 25.
Decisión de fondo (ADR 13, ya tomada, no se reabre): [`docs/ADR_DECISIONES_ARQUITECTURA.md`](../ADR_DECISIONES_ARQUITECTURA.md).

---

## 25. Fase 25 — ejercicios de HTML y CSS calificados por reglas

### 25.0 En una línea

El curso enseña HTML5, CSS y JavaScript, pero hoy solo se puede crear y calificar **código JavaScript por entrada/salida**, que evalúa mal el
marcado. Esta fase agrega un tipo de pregunta nuevo, **`html_css`**: el estudiante escribe HTML y CSS, ve una **vista previa** en el navegador y el
**servidor** lo califica con **reglas** que define el docente («hay un `<h1>` con el texto…», «los `<img>` tienen `alt`», «`.tarjeta` tiene
`display: flex`»). Nunca se ejecuta JavaScript del estudiante.

**Son dos partes y van en orden:**

| Parte | Quién | Qué | Duración |
|---|---|---|---|
| **A — Backend** | **Claude Code** (no la hagas tú) | Tipo `html_css`, migración, evaluador con jsdom, vista del estudiante, «probar» sin gastar intento, arreglo del saneado de bloques de código | 2 a 3 días |
| **B — Frontend** | **Antigravity** | Constructor de reglas del docente, pantalla del estudiante con editor + vista previa + reglas, mejoras al renderizador de Markdown | 3 días |

**Estado (24/09): la Parte A está hecha y verificada** (excepto A7, ver 25.4), así que **Antigravity ya puede empezar la Parte B**. Antes de empezar, comprueba en
`http://localhost:3001/docs-json` que existe `html_css` en el enum de tipos de `POST /activity-questions`. Si algo del contrato de abajo difiere de lo que
responde el backend, **manda el backend**: avisa y no lo «arregles» en el frontend.

### 25.1 Reglas (aprendidas de auditar la Fase 24)

1. **No inventes datos:** un dato que no llega se muestra «—», nunca `0` ni un estado positivo. Un texto que describe el sistema («2 reglas ocultas»)
   sale de un dato real (`hiddenRuleCount`) o no se escribe.
2. **La vista previa NUNCA ejecuta código del estudiante:** `<iframe sandbox="">` **vacío** (sin `allow-scripts`, sin `allow-same-origin`, sin `allow-forms`,
   sin `allow-top-navigation`). Es un requisito de seguridad, no de estilo.
3. **Errores del servidor:** siempre `const { messageOf } = useApiErrorMessage()`; el backend responde el motivo en `error`, no en `message`.
4. **Diálogos:** cierran con `useEscapeToClose` y el foco entra al abrirlos (`composables/useEscapeToClose.ts`).
5. **Formularios con constructores ocultos (`v-show`): sin `required`** en los campos del constructor y con `novalidate` en el `<form>`; la validación va en
   `validateAndGetConfig()`. (El creador de ejercicios ya tiene `novalidate`; no lo quites.)
6. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-25`; no subas a `main` hasta terminar; se une con Pull Request (Squash and merge).
7. **No edites `tailwind.config.ts` ni `assets/css/main.css`** (identidad visual de José): usa clases y tokens que ya existen.
8. **«Verificado» = probado en Chrome real** (25.6), no «el endpoint responde 200». Corre `npx nuxi typecheck` (exit 0) antes de cada commit.

### 25.2 Lo que ya existe y NO debes rehacer

| Qué | Dónde |
|---|---|
| Patrón de constructor del docente (`defineExpose({ validateAndGetConfig, reset })`) | `components/docente/exercise-builders/OrderingExerciseBuilder.vue` (copia su estructura) |
| Creador de ejercicios, selector de tipo `#create-exercise-type`, `getActiveBuilderConfig()` y flujo atómico (crea actividad → crea pregunta → si falla, borra la actividad) | `pages/docente/ejercicios/crear.vue` |
| Pantalla del ejercicio: rama de código (`isCodingActivity`, editor + «Casos de Prueba» + «Registro») y rama de tipos interactivos (`ExerciseMcqExercise`, etc.) | `pages/estudiante/evaluacion/[activityId].vue` |
| Store: carga del ejercicio, `pendingAnswer`, `submit()`, `runPublicCases`, autoguardado con debounce (`PUT /submissions/:id/autosave`, guarda `answers` de forma genérica) | `stores/workspace.ts` |
| Componentes de ejercicios interactivos | `components/exercise/*.vue` (auto-importados como `ExerciseNombre`) |
| Helpers | `useApiErrorMessage().messageOf`, `useEscapeToClose`, `utils/formatMarkdown.ts` |

### 25.3 Contrato (construido y verificado en la Parte A; compruébalo en `/docs-json`)

**Pregunta** — `POST /activity-questions` con `type: "html_css"` (solo docente dueño de la clase; el resto de campos como los otros tipos):

```ts
type HtmlCssCheck =
  | { kind: 'element_exists'; selector: string; min?: number }                          // por defecto min = 1
  | { kind: 'element_count';  selector: string; equals?: number; min?: number; max?: number }
  | { kind: 'text';           selector: string; mode: 'contains' | 'equals'; value: string; caseSensitive?: boolean } // algún elemento que coincida
  | { kind: 'attribute';      selector: string; name: string; mode: 'exists' | 'equals' | 'contains'; value?: string }
  | { kind: 'css_property';   selector: string; property: string; oneOf: string[] }    // valor calculado, normalizado
  | { kind: 'a11y';           check: 'img_alt' | 'form_labels' | 'html_lang' | 'document_title' | 'single_h1' }

interface HtmlCssRule {
  id: string            // ^[a-z0-9_-]{1,40}$, único dentro de la pregunta
  label: string         // ≤ 160 caracteres; lo que ve el estudiante («Hay un <h1> con el texto "Hola"»)
  hint?: string         // ≤ 240; pista opcional
  isPublic: boolean     // pública: el estudiante ve su etiqueta y si pasa; oculta: solo cuántas hay
  weight: number        // entero 1..100
  check: HtmlCssCheck
}

interface HtmlCssConfig {                       // = body.config de POST /activity-questions
  starterHtml: string                           // ≤ 50 000 caracteres
  starterCss: string                            // ≤ 50 000
  rules: HtmlCssRule[]                          // 1..30, al menos una isPublic
  modelSolution: { html: string; css: string }  // OBLIGATORIA; el servidor comprueba que cumple el 100 % de las reglas
}
```

Al crear, el backend responde `400` con el motivo en `error` si: falta una regla pública, un `selector` no es válido, hay ids repetidos, se pasa algún límite, o
**la solución modelo no cumple una regla** (el mensaje nombra la regla: «La solución modelo no cumple la regla "titulo": …»).

**Lo que recibe el estudiante** — `GET /activity-questions/activity/:activityId` (nunca `rules[].check`, ni reglas ocultas, ni `modelSolution`):

```ts
interface HtmlCssStudentConfig {
  starterHtml: string
  starterCss: string
  publicRules: { id: string; label: string; hint?: string }[]
  hiddenRuleCount: number
}
```

**Respuesta del estudiante** (en `POST /submissions/:id/submit` y en `PUT /submissions/:id/autosave`): `answer: { html: string, css: string }` (cada uno ≤ 50 000).

**«Probar» sin gastar intento** — `POST /submissions/:id/run` con `{ html, css }` (mismo límite de 20/min). Solo evalúa las reglas **públicas**:

```ts
interface HtmlCssRunResult {
  results: { id: string; label: string; passed: boolean; detail?: string }[]  // solo públicas
  allPassed: boolean                 // todas las públicas
  passedWeight: number; totalWeight: number   // solo de las públicas
}
```

**Al entregar**, la nota es proporcional al peso de las reglas que pasan (públicas y ocultas), sobre los puntos de la pregunta; el `feedback` dice «Cumpliste X de
Y reglas» y lista las etiquetas de las públicas que fallaron y **cuántas** ocultas fallaron (nunca cuáles).

**Alcance de lo que se puede calificar** (ADR 13): presencia y jerarquía de etiquetas, atributos, textos, propiedades CSS declaradas y accesibilidad básica.
**No** se califica posición, tamaño renderizado, `@media`/responsive ni animaciones: eso queda como criterio del docente. Díselo al docente en el constructor (B1).

### 25.4 Parte A — Backend (Claude Code): estado

| # | Tarea | Estado |
|---|---|---|
| A1 | `QuestionType.HTML_CSS` + migración `1789700000000-AddHtmlCssQuestionType` (**las dos tablas** que repiten el enum: `activity_questions` y `bank_questions`) | ✅ `migration:run` y `migration:revert` probados en una base vacía; `verify:clean` en verde |
| A2 | Validación de `config` al crear (`src/evaluation-engine/html-css/html-css.validator.ts`): esquema de 25.3, límites, selectores válidos, y **la solución modelo debe cumplir todas las reglas** (públicas y ocultas) | ✅ 400 con el motivo en `error` |
| A3 | `HtmlCssEvaluator` + verificador jsdom sin ejecutar scripts ni cargar recursos (`html-css.checker.ts`); nota proporcional al peso | ✅ 41 pruebas de reglas y validador + 9 del evaluador |
| A4 | `StudentQuestionDto`: solo `starterHtml`, `starterCss`, `publicRules`, `hiddenRuleCount` | ✅ probado que ni `check`, ni ocultas, ni solución modelo salen |
| A5 | `POST /submissions/:id/run` acepta `{ html, css }` (y `code` sigue siendo obligatorio solo para código) | ✅ probado que no consume intento ni cambia el estado |
| A6 | Ejercicio de demostración «Página de bienvenida (HTML y CSS)» en el seed (2 públicas, 3 ocultas) | ✅ idempotente (2 pasadas = 1 actividad) |
| **A7** | **Saneado de bloques de código** (F24-07): `ContentRenderingService.sanitizeRichText` deja intactos los bloques ``` (y luego el código en línea) en `content.body`, `activity.description` y `activity_question.question` | ✅ **Hecha el 25/09, después de B0** (motivo: la pantalla del ejercicio tenía su propia copia de `formatMarkdown` que no escapaba nada). Además del servidor (`code-segments.ts`), el HTML final del navegador pasa ahora por DOMPurify (`sanitizeRenderedHtml.ts`): las pruebas adversariales mostraron que `formatMarkdown` podía colar atributos en HTML ya saneado. Ver `CHANGELOG.md` |

**Verificado de punta a punta por la API (24/09, base desechable):** 25/25 comprobaciones, incluidas: pregunta válida → 201; solución modelo que incumple una regla → 400 que nombra la regla; sin regla pública / selector inválido / config vacía / HTML de más de 50 000 caracteres → 400 (nunca 500); el estudiante recibe la config sin criterios ni ocultas; «probar» no gasta intento; notas 8/20 (parcial), 20/20 (solución con color `#FF0000`), 0 (vacío o excedido); un `<script>` o un `onerror` no cuentan. Una entrega con 32 000 caracteres de HTML tarda ~0,6 s.

**Cosas que Antigravity debe saber del backend ya construido:**
- **`a11y` sobre algo que no existe pasa** (sin imágenes, `img_alt` se cumple; sin campos, `form_labels`). Para exigir imágenes el docente combina una regla `element_exists` sobre `img` con `img_alt`. El constructor (B1) debe decirlo junto al selector de `a11y`.
- **`html_lang` y `document_title` solo pueden cumplirse con un documento completo** (`<!doctype html><html lang="es"><head><title>…`); con un fragmento fallan. Díselo al docente en B1.
- **Colores:** `#F00`, `red` y `rgb(255,0,0)` se consideran iguales; para otras propiedades (`margin`, `padding`) el docente lista las variantes que acepta en `oneOf` (`0 auto`, `0px auto`).
- **Requiere Node ≥ 22.12** (jsdom carga un módulo ESM con `require()`); el proyecto usa Node 24 (`Dockerfile`). `docs/testing/html-css-color-check.cjs` lo comprueba en Node real.

### 25.5 Parte B — Frontend (Antigravity; empieza cuando la Parte A esté cerrada)

#### B0 — Renderizador de Markdown: una sola copia y código en línea escapado
- Hoy hay **tres** `formatMarkdown`: `utils/formatMarkdown.ts` y copias locales en `pages/estudiante/unidad/[id].vue` y `pages/estudiante/evaluacion/[activityId].vue`
  (`function formatMarkdown`, esta última no aplica negrita en el enunciado). Deja **solo** la de `utils/` y bórralas de las páginas.
- En `utils/formatMarkdown.ts` el código **en línea** (`` `x` ``) se inserta sin escapar: escapa su contenido igual que los bloques ```. (Es lo que permite que la Parte A7
  deje pasar `<b>` dentro de un ejemplo.) Conserva la opción `{ escapeHtml: true }` de la vista previa.
- La copia de `pages/estudiante/evaluacion/[activityId].vue` **no escapa nada ni reconoce bloques ```** (hoy toda la seguridad de ese texto depende del saneado del servidor): al dejar la de `utils/` queda cubierto, y es lo que permite que Claude Code haga después la tarea A7.
- **Cierre:** una lección **y un enunciado de ejercicio** con `` `<div>` `` y un bloque ```html con `<script>` se ven como texto, en la vista del estudiante y en la vista previa del docente. **Avisa a Claude Code cuando B0 esté en `main`** para que haga A7.

#### B1 — Constructor del docente: `HtmlCssExerciseBuilder.vue`
- Archivo nuevo `components/docente/exercise-builders/HtmlCssExerciseBuilder.vue` con la estructura de `OrderingExerciseBuilder.vue` (`defineExpose({ validateAndGetConfig, reset })`).
- En `pages/docente/ejercicios/crear.vue`: opción **`html_css` — «HTML y CSS (calificado por reglas)»** en `#create-exercise-type` (línea ~241), el tipo en la unión de
  `exerciseType`, su `ref`, el `switch` de `getActiveBuilderConfig()` y `reset()`, y el `v-show` junto a los otros constructores.
- Contenido: (1) **Código inicial** HTML y CSS (dos `<textarea>` monoespaciados); (2) **Solución modelo** HTML y CSS (dos `<textarea>`; aviso: «no se muestra al estudiante; el
  sistema comprueba que cumple todas tus reglas»); (3) **Lista de reglas** (agregar, quitar, reordenar ▲▼): etiqueta, pista, interruptor público/oculta, peso, y un `<select>`
  de tipo (`kind`) que muestra solo los campos de ese tipo (25.3); `a11y` muestra un `<select>` con las 5 comprobaciones y una nota: «sobre algo que no existe se cumple (sin imágenes, `img_alt` pasa): combínala con «existe `img`»; `html_lang` y `document_title` exigen un documento completo»; `css_property` pide propiedad y valores aceptados separados por
  coma (`oneOf`). (4) Un aviso fijo con el **alcance** de 25.3 («no se califica posición, tamaño ni responsive»).
- `validateAndGetConfig`: exige ≥ 1 regla pública, etiqueta y selector no vacíos, peso 1–100, ≤ 30 reglas, solución modelo no vacía; devuelve `config` con la forma **exacta** de `HtmlCssConfig`.
  Los errores del servidor (p. ej. «La solución modelo no cumple la regla…») se muestran con `messageOf` en el `submitError` que ya existe.
- **Sin `required`** en los campos (regla 5).

#### B2 — Pantalla del estudiante: editor, vista previa y reglas
- Componente nuevo `components/exercise/HtmlCssExercise.vue`. En `pages/estudiante/evaluacion/[activityId].vue` agrega una **tercera rama** `isHtmlCssActivity`
  (`questionType === 'html_css'`) que ocupa toda la altura, como la de código (no en el contenedor angosto de los interactivos). `typeBadgeLabel`: «HTML / CSS».
- Distribución (escritorio): izquierda, **pestañas «HTML» y «CSS»** con un `<textarea>` cada una (monoespaciado; el editor con resaltado es la Fase 26, no lo hagas);
  derecha, **«Vista previa»** arriba y **«Reglas»** abajo. En móvil (375 px) se apilan: editor, vista previa, reglas.
- **Vista previa:** `<iframe sandbox="" title="Vista previa del ejercicio" :srcdoc="previewDoc">` con actualización con debounce de ~300 ms. `previewDoc` = documento con
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">`, el `<style>` con el CSS del
  estudiante y su HTML (si ya trae `<head>`, inserta ahí; si no, envuélvelo). Nada de `allow-*`.
- **Reglas:** lista de `publicRules` (etiqueta y pista); antes de probar, marca neutra «—»; tras «▶ Probar», ✔ / ✘ por regla con `detail` si viene; debajo, «N reglas ocultas
  se evalúan al entregar» solo si `hiddenRuleCount` es un número (si no, «—»).
- **Botones:** «▶ Probar» llama `POST /submissions/:id/run` con `{ html, css }` (no gasta intento; si falta el intento activo usa el mismo `ensureActiveSubmission()` que el código) y
  «🚀 Entregar solución» usa el `submit()` de siempre con `answer = { html, css }`. Autoguardado con el mismo debounce que el código.
- Errores con `messageOf`; el 429 del límite de «probar» se explica en pantalla; un HTML vacío no se envía.

#### B3 — Store: `stores/workspace.ts`
- `questionType` acepta `'html_css'`; el cargador (`loadExercise`, hoy elige `questions.find(q => q.type === 'coding') || questions[0]`) toma `starterHtml`/`starterCss` de `config`
  en dos `ref` nuevos (`htmlCode`, `cssCode`); `runHtmlCss()` y `htmlCssResults`; `submit()` (línea ~317) arma `answer = { html, css }` para este tipo; el autoguardado (línea ~391, hoy
  «solo aplica a coding») también lo cubre. **No cambies el comportamiento de los otros tipos.**

### 25.6 Cómo verificar (Chrome real, base desechable — método de `docs/ReportesQA/GUIA_AUDITORIA_MAESTRA.md`)

1. **Docente, desde la pantalla, sin atajos:** crear un ejercicio `html_css` con 5 reglas (3 públicas, 2 ocultas; una de cada `kind` relevante) y solución modelo correcta → aparece «creado». Con una solución
   modelo que incumple una regla → se ve el motivo del servidor, no se crea nada (sin actividad huérfana).
2. **Estudiante:** abrir el ejercicio, escribir HTML/CSS; la vista previa se actualiza; «Probar» marca ✔/✘ solo las públicas; entregar da una nota proporcional; con la solución modelo da el máximo.
3. **Seguridad:** en el HTML del estudiante escribir `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` y `<a href="javascript:alert(1)">`: **nada se ejecuta** en la vista previa; el nodo `<iframe>`
   tiene `sandbox=""`; un `<img src="https://…">` no hace petición externa (CSP). El estudiante **no** ve `modelSolution` ni las reglas ocultas en ninguna respuesta de red (pestaña Network).
4. **Móvil 375 px:** editor, vista previa y reglas apilados, sin desborde horizontal de la página.
5. **Regresión:** los otros 6 tipos de ejercicio se siguen creando y resolviendo; el modal de lecciones y las lecciones con código HTML se ven bien (B0).
6. `npx nuxi typecheck` exit 0 y `npm run generate` sin errores.

### 25.7 Criterios de cierre

1. Los puntos 1 a 6 de 25.6, con capturas o salida literal en el informe de sesión.
2. Búsquedas finales que deben dar **cero** resultados (excluye `node_modules`, `.nuxt`, `.output`):
   `grep -rn "allow-scripts\|allow-same-origin" frontend-nuxt/components frontend-nuxt/pages` · `grep -rn "err?.data?.message" frontend-nuxt` · `grep -rn "function formatMarkdown" frontend-nuxt/pages`.
3. Un commit por tarea (B0 a B3), informe en `docs/antigravity/informes/` con el `TEMPLATE_INFORME.md`, y Pull Request de `feat/fase-25` a `main`.
4. Claude Code audita antes de fusionar (Chrome real); no se fusiona sin ese reporte.

### 25.8 Fuera de alcance

- Ejecutar **JavaScript del estudiante** en HTML/CSS (el curso de JS sigue en los ejercicios de código por entrada/salida).
- Editor con resaltado de sintaxis y selector de lenguaje → **Fase 26** (CodeMirror 6). Python → después del MVP.
- Calificar posición, tamaño renderizado, `@media`/responsive o animaciones (criterio del docente).
- Cambiar estilos globales, tokens o el `tailwind.config.ts`.
