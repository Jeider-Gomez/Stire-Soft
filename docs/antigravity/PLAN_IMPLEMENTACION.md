---
estado:     completada — Fase 26 (Parte A, backend, entregada el 25/09; Parte B, frontend, completada el 25/09)
verificado: 2026-09-25 contra src/ y frontend-nuxt/ reales (rutas y líneas citadas comprobadas en esa fecha)
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    DOC-V03 (crear ejercicio) · EST-V03 (ejercicio del estudiante)
---

# Plan de implementación para Antigravity — Fase 26

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 25 ya están hechas y archivadas en
[`docs/_archivo/`](../_archivo/). **No las leas para ejecutar esta fase.** La numeración continúa en 26.
Decisión de fondo (ADR 13, ya tomada, no se reabre): [`docs/ADR_DECISIONES_ARQUITECTURA.md`](../ADR_DECISIONES_ARQUITECTURA.md).

---

## 26. Fase 26 — un editor de código de verdad (resaltado, sangría, teclado) y selector de lenguaje

### 26.0 En una línea

Hoy el código se escribe en un `<textarea>` sin colores: **no resalta la sintaxis, no sangra al pulsar Enter, `Tab` saca el foco del editor y los números de línea se
desalinean al desplazarse**. Esta fase pone **CodeMirror 6** en los lugares donde se escribe código (9 editores en 8 sitios), cargado **bajo demanda** (no infla la carga inicial de la aplicación), y
agrega el **selector de lenguaje** donde tiene sentido. **Solo `frontend-nuxt/`.** El backend que hace falta **ya está** (Parte A).

| Parte | Quién | Qué |
|---|---|---|
| **A — Backend** | Claude Code — **hecha el 25/09** | Validar `language` al crear: `coding` solo `javascript` (el juez no ejecuta otro); `fill_code` acepta un `language` opcional de resaltado |
| **B — Frontend** | **Antigravity** | Componente `CodeEditor`, usarlo en los 8 sitios de 26.2, selector de lenguaje, editor más ancho en escritorio, resaltado de la plantilla de `fill_code` |

### 26.1 Reglas

1. **No inventes datos:** un dato que no llega se muestra «—», nunca `0` ni un estado positivo.
2. **El código del estudiante y del docente NUNCA se inserta como HTML** (`v-html`). CodeMirror pinta con el DOM; el resaltado de `fill_code` (B5) escapa cada trozo. La vista
   previa de `html_css` sigue siendo `<iframe sandbox="">` **vacío** (Fase 25): no la toques.
3. **Errores del servidor:** `const { messageOf } = useApiErrorMessage()`; el backend responde el motivo en `error`, no en `message`.
4. **Diálogos** cierran con `useEscapeToClose` y el foco entra al abrirlos. **Formularios con constructores ocultos (`v-show`): sin `required`**, con `novalidate` (el
   creador de ejercicios ya lo tiene; no lo quites).
5. **Accesibilidad de teclado (WCAG 2.1.2, sin trampa de foco):** si `Tab` sangra dentro del editor, **`Esc` y luego `Tab`** debe sacar el foco, y la pantalla lo dice en una
   línea visible («Esc y luego Tab para salir del editor»). Cada editor tiene un nombre accesible (`aria-label`).
6. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-26`; no subas a `main` hasta terminar; se une con Pull Request (Squash and merge).
7. **No edites `tailwind.config.ts` ni `assets/css/main.css`** (identidad visual de José). El tema del editor va como extensión de CodeMirror (colores fijos oscuros, los mismos
   que ya usan los editores: fondo `#1e1e1e`, texto `#d4d4d4`); no hace falta tocar CSS global.
8. **«Verificado» = probado en Chrome real** (26.6). Corre `npx nuxi typecheck` (exit 0) y `npm run generate` antes de cada commit.
9. **Dependencias:** solo las de 26.3, con `npm install` **dentro de `frontend-nuxt/`** (que `package-lock.json` quede consistente: `npm ci` debe funcionar). Nada más.

### 26.2 Dónde se escribe código hoy (9 editores en 8 sitios)

| # | Sitio | Archivo | Lenguaje |
|---|---|---|---|
| 1 | Estudiante — ejercicio de código (`workspaceStore.code`, con su contador de líneas `lineCount`) | `pages/estudiante/evaluacion/[activityId].vue`, rama `isCodingActivity` (~línea 155-185) | siempre `javascript` |
| 2 | Estudiante — HTML | `components/exercise/HtmlCssExercise.vue` (~línea 38, `workspaceStore.htmlCode`) | `html` |
| 3 | Estudiante — CSS | `components/exercise/HtmlCssExercise.vue` (~línea 50, `workspaceStore.cssCode`) | `css` |
| 4 | Docente — código inicial (coding) | `components/docente/exercise-builders/CodingExerciseBuilder.vue` (`#coding-starter`) | `javascript` fijo |
| 5 | Docente — plantilla de fill_code | `components/docente/exercise-builders/FillCodeExerciseBuilder.vue` (`#fillcode-template`) | **elegible** (B4) |
| 6-7 | Docente — HTML y CSS inicial de html_css | `components/docente/exercise-builders/HtmlCssExerciseBuilder.vue` (`#hc-starter-html`, `#hc-starter-css`) | `html`, `css` |
| 8 | Docente — solución modelo html_css (HTML y CSS) | `components/docente/exercise-builders/HtmlCssExerciseBuilder.vue` (`#hc-model-html`, `#hc-model-css`) | `html`, `css` |

(El sitio 8 son dos editores, HTML y CSS; los sitios 6-7 también.) **No** cambies el editor de lecciones Markdown (`UnitLessonsModal.vue`) ni los cuadros de texto de enunciados: no son código.

### 26.3 Dependencias y contrato

```
npm install @codemirror/state @codemirror/view @codemirror/commands @codemirror/language \
            @codemirror/lang-javascript @codemirror/lang-html @codemirror/lang-css @codemirror/lang-python @codemirror/lang-sql \
            @lezer/highlight
```

**Contrato del backend (construido y verificado en la Parte A; compruébalo en `/docs-json`):**

| Tipo | Campo | Regla |
|---|---|---|
| `coding` | `config.language` | opcional; si viene, **solo `javascript` o `js`**; otro → `400` con el motivo en `error` («El juez solo ejecuta JavaScript por ahora…»). El juez **no ejecuta** Python ni ningún otro lenguaje. El estudiante recibe `config.language` tal cual |
| `fill_code` | `config.language` | opcional; uno de `javascript`, `python`, `html`, `css`, `sql`, `text`; otro → `400`. Solo sirve para **resaltar**; no se ejecuta. El estudiante lo recibe tal cual; **si no viene, no se resalta** (`text`) |

Lista de lenguajes en un solo lugar del frontend: `utils/codeLanguages.ts` con `HIGHLIGHT_LANGUAGES = ['javascript','python','html','css','sql','text']` y sus etiquetas en español
(«JavaScript», «Python», «HTML», «CSS», «SQL», «Texto sin colores»). **Es la misma lista que `src/common/code-languages.ts` del backend**: si difieren, manda el backend.

### 26.4 Tareas

#### B0 — Componente `components/CodeEditor.vue` (todo lo demás depende de él)
- Props: `modelValue: string`, `language: 'javascript'|'python'|'html'|'css'|'sql'|'text'`, `ariaLabel: string`, `placeholder?: string`, `readOnly?: boolean`,
  `minHeight?: string` (por defecto `12rem`). Emite `update:modelValue` en cada cambio. Uso: `<CodeEditor v-model="workspaceStore.code" language="javascript" aria-label="Solución en JavaScript" />`.
- **Carga bajo demanda:** el componente importa CodeMirror con `import()` dinámico dentro de `onMounted` (y cada lenguaje con su propio `import()` solo cuando se necesita). Mientras carga (o si
  el `import()` falla) se muestra un `<textarea>` **funcional** con el mismo `v-model` (no un hueco vacío): el estudiante nunca se queda sin poder escribir.
- Debe incluir: números de línea, resaltado de sintaxis, sangría automática al Enter, `Tab` / `Shift+Tab` sangran (keymap `indentWithTab`), cierre automático de `()`, `[]`, `{}`, comillas y — en
  `html` — de etiquetas, deshacer/rehacer, coincidencia de paréntesis, ajuste de línea desactivado con desplazamiento horizontal, selección con el color `#264f78`.
- **Sincronización:** si `modelValue` cambia desde fuera (p. ej. `reset()` del constructor o carga del intento guardado), el editor lo refleja **sin perder el cursor cuando el cambio vino de él mismo**
  (compara antes de reemplazar; sin bucles de `update:modelValue`).
- `language` reactivo: al cambiarlo se reconfigura el lenguaje (`Compartment`) **sin** recrear el editor ni perder el contenido.
- Se destruye limpiamente en `onBeforeUnmount` (`view.destroy()`), sin fugas al navegar entre ejercicios.
- La línea «Esc y luego Tab para salir del editor» va **fuera** del componente (en la barra de estado de cada pantalla) para no repetirla 9 veces cuando hay varios editores en una página.
- Tema propio (extensión `EditorView.theme` + `HighlightStyle`): fondo `#1e1e1e`, texto `#d4d4d4`, números `#5a5a5a`, colores de la paleta ya usada en las pantallas de ejercicio (palabras clave
  `#569cd6`, cadenas `#ce9178`, números `#b5cea8`, comentarios `#6a9955`, funciones `#dcdcaa`, etiquetas HTML `#569cd6`, atributos `#9cdcfe`). Fuente `font-codigo` (la que ya existe).
- La altura la manda quien lo usa: en las pantallas de ejercicio ocupa todo el alto disponible (`height: 100%`, `overflow: auto` **dentro** del editor); en los constructores, `minHeight` y crece hasta ~24 rem.

#### B1 — Estudiante, ejercicio de código (sitio 1)
- En `pages/estudiante/evaluacion/[activityId].vue`, sustituye el `<textarea>` y su columna de números de línea por `<CodeEditor v-model="workspaceStore.code" language="javascript" ...>`; **conserva** el
  autoguardado (`workspaceStore.triggerAutosave` en cada cambio: escucha `@update:modelValue`) y la barra de estado («Líneas», «Caracteres», autoguardado). Borra `lineCount` si queda sin uso.
- La etiqueta de la barra superior («JS», «solucion.js», «JavaScript (ES2024)») sale de `config.language` si llega; si no llega, «—» (no un JavaScript inventado).
- En la barra de estado agrega la línea de la regla 5.

#### B2 — Estudiante, HTML y CSS (sitios 2 y 3) y el ancho del editor
- En `components/exercise/HtmlCssExercise.vue` reemplaza los dos `<textarea>` (y sus columnas de números) por dos `<CodeEditor>` (`language="html"` y `"css"`), uno por pestaña. **Usa `v-if` en cada pestaña,
  no `v-show`**, o al volver a la pestaña el editor debe recalcular su tamaño (`view.requestMeasure()`): comprueba que el editor oculto y vuelto a mostrar no queda en blanco. Conserva `onCodeInput` (autoguardado
  y debounce de la vista previa) y los contadores de la barra de estado.
- **Ancho (hallazgo F25-06 de la auditoría):** en escritorio (≥ 1024 px) el editor quedaba en ~369 px porque la pantalla conserva la columna del enunciado al 40 %. En el ejercicio `html_css`, haz que el panel
  del enunciado sea **plegable** (botón «◀ Enunciado» / «▶»; estado en `localStorage` con `try/catch`, por usuario, no en el servidor) y que, plegado, el editor y la vista previa se repartan el ancho. Por
  defecto el enunciado ocupa **320 px** (`w-80`) en escritorio (visible pero estrecho) y se puede plegar del todo; en móvil sigue apilado a ancho completo (no cambies el móvil).

#### B3 — Docente, constructores sin selector (sitios 4, 6, 7 y 8)
- `CodingExerciseBuilder.vue`: `#coding-starter` → `<CodeEditor language="javascript">`. Debajo, una nota fija: «El juez ejecuta solo JavaScript; otros lenguajes se ofrecerán cuando el juez los soporte.» **No** hay
  selector aquí (con una sola opción sería un adorno): `config.language` se sigue enviando como `'javascript'`.
- `HtmlCssExerciseBuilder.vue`: los cuatro `<textarea>` → `<CodeEditor>` (`html`, `css`, `html`, `css`). Sin `required` (regla 4). `reset()` y `validateAndGetConfig()` siguen leyendo/escribiendo los mismos
  `ref` (`starterHtml`, `starterCss`, `modelHtml`, `modelCss`); solo cambia el control.
- Las etiquetas `<label for="…">` existentes deben seguir asociadas al editor (pasa el `id` al contenido editable de CodeMirror, `EditorView.contentAttributes.of({ id, 'aria-label': … })`) para que los
  selectores de prueba y los lectores de pantalla sigan encontrándolo.

#### B4 — Docente, `fill_code` con selector de lenguaje (sitio 5)
- `FillCodeExerciseBuilder.vue`: sobre la plantilla, un `<select id="fillcode-language">` con `HIGHLIGHT_LANGUAGES` (etiquetas en español; por defecto «Texto sin colores»); `#fillcode-template` →
  `<CodeEditor :language="language">` que cambia de colores al cambiar el `<select>` sin perder lo escrito.
- `validateAndGetConfig()` agrega `language` a `config` **solo si no es `text`** (si es `text`, no lo envíes: el backend lo trata como sin resaltado). Un `400` del servidor por lenguaje inválido se muestra con
  `messageOf` (no debería pasar con el `<select>`, pero no se traga).
- `reset()` devuelve el `<select>` a «Texto sin colores».

#### B5 — Estudiante, `fill_code`: resaltado de la plantilla
- `components/exercise/FillCodeExercise.vue` pinta la plantilla por líneas con huecos `___id___` (`parsedLines`). Con `config.language` presente y distinto de `text`, los **trozos de texto** de cada línea se resaltan;
  los huecos siguen siendo los `<input>` de siempre. Crea `utils/highlightCode.ts`: `highlightCode(text, language) → { text: string, cls: string }[]` (trozos con la clase de estilo), usando el analizador de
  `@codemirror/language` + `@lezer/highlight` (`highlightTree`) cargado con `import()` dinámico; se llama **por línea**, es asíncrono, y **mientras no ha cargado (o si falla) se muestra el texto plano** — nada
  de pantalla en blanco.
- **Seguridad (regla 2):** cada trozo se pinta como **texto** (`{{ trozo.text }}` dentro de un `<span :class>`), **nunca** con `v-html`. Para una plantilla como `` `<img src=x onerror=alert(1)>` `` el navegador
  debe mostrar el texto literal y no ejecutar nada.
- El resaltado por línea es una aproximación (una cadena de varias líneas puede no colorearse): está bien; no lo compliques.

### 26.5 Lo que ya existe y NO debes rehacer

| Qué | Dónde |
|---|---|
| Autoguardado con debounce (`PUT /submissions/:id/autosave`), `pendingAnswer`, `submit()`, `runPublicCases`, `runHtmlCss` | `stores/workspace.ts` — **no lo modifiques** (el editor solo cambia el control, no el flujo de datos) |
| Vista previa de `html_css` en `<iframe sandbox="">` con CSP | `components/exercise/HtmlCssExercise.vue` (parte derecha) — **no la toques** |
| Diseño responsive de la pantalla del ejercicio (`min-h-screen md:h-screen`…) | `layouts/workspace.vue` y `pages/estudiante/evaluacion/[activityId].vue` — **no lo rompas**: en 375 px el editor sigue apilado con altura razonable |
| `useApiErrorMessage`, `useEscapeToClose` | `composables/` |

### 26.6 Cómo verificar (Chrome real, base desechable — método de `docs/ReportesQA/GUIA_AUDITORIA_MAESTRA.md`)

1. **Resaltado y sangría, estudiante (código):** abrir un ejercicio de código; escribir `function f(a) {` + Enter → la línea siguiente queda sangrada y se cierra `}`; palabras clave, cadenas y comentarios con colores distintos; los números
   de línea **no se desalinean** al desplazar un archivo de 200 líneas; `Tab` sangra; `Esc` y `Tab` saca el foco.
2. **Autoguardado y entrega intactos:** escribir, recargar la página → el código reaparece; «Probar» y «Entregar» dan el mismo resultado que antes con una solución correcta.
3. **HTML/CSS:** pestañas HTML y CSS con colores; volver a una pestaña oculta **no** la deja en blanco; la vista previa se actualiza; al plegar/desplegar el enunciado el editor cambia de ancho (≥ 600 px con el enunciado plegado en 1440 px).
4. **Docente:** crear los tres tipos (coding, html_css, fill_code con lenguaje Python) desde la pantalla; el ejercicio se crea; con `fill_code` en Python la plantilla se ve coloreada tanto al crear como al resolver. Con la API directa,
   `POST /activity-questions` con un `coding` y `language: "python"` → **400** (ya lo hace el backend).
5. **Seguridad:** plantilla de `fill_code` con `` `<img src=x onerror=alert(1)>` `` y `<script>alert(1)</script>`: se ven como texto y **no se ejecuta nada** (ni en el editor ni en la vista del estudiante); el `<iframe>` de `html_css` sigue con `sandbox=""`.
6. **Falla del `import()`:** con la red desconectada solo para los archivos del editor (DevTools → bloquear el patrón del chunk), el `<textarea>` de reserva aparece y se puede escribir y entregar.
7. **Móvil 375 px:** editor, sin desborde horizontal de la página; se puede escribir con el teclado táctil (probar en el emulador de dispositivo).
8. **Peso:** `npm run generate`; el chunk de CodeMirror **no** está en la carga inicial de `/` ni de `/auth/login` (Network, «JS» transferido); anota el tamaño de la entrada principal antes y después (no debe crecer más de ~20 KB).
9. `npx nuxi typecheck` exit 0; `npm ci --dry-run` en `frontend-nuxt/` consistente.

### 26.7 Criterios de cierre

1. Los puntos 1 a 9 de 26.6 con capturas o salida literal en el informe de sesión.
2. Búsquedas finales que deben dar **cero** resultados (excluye `node_modules`, `.nuxt`, `.output`):
   `grep -rn "<textarea" frontend-nuxt/components/exercise frontend-nuxt/components/docente/exercise-builders` (todos los editores de código pasan a `CodeEditor`; el `<textarea>` de reserva está **dentro** de `CodeEditor.vue`, que no cuenta)
   · `grep -rn "v-html" frontend-nuxt/components/CodeEditor.vue frontend-nuxt/components/exercise/FillCodeExercise.vue` · `grep -rn "allow-scripts\|allow-same-origin" frontend-nuxt/components frontend-nuxt/pages`.
3. Un commit por tarea (B0 a B5), informe en `docs/antigravity/informes/` con el `TEMPLATE_INFORME.md`, y Pull Request de `feat/fase-26` a `main`.
4. Claude Code audita antes de fusionar (Chrome real); no se fusiona sin ese reporte.

### 26.8 Fuera de alcance

- **Ejecutar Python u otro lenguaje** en el juez (hoy solo JavaScript; Python con Pyodide es una fase aparte, después del MVP). El selector de lenguaje del ejercicio de código **no existe** hasta entonces.
- Resaltado de los bloques de código de las **lecciones** (`formatMarkdown` es síncrono; queda para otra fase si se pide).
- Autocompletado, linter, mapa mínimo, temas claros/oscuros, atajos configurables.
- C, C++ y Java (fuera del alcance gratuito, `docs/PLAN_MAESTRO.md` §6.4).
- Cambiar estilos globales, tokens o el `tailwind.config.ts`.
