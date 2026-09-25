# Reporte de auditoría QA — Fase 25, Parte B (frontend de Antigravity) · 25/09/2026

**Auditor:** Claude Code · **Método:** [`GUIA_AUDITORIA_MAESTRA.md`](GUIA_AUDITORIA_MAESTRA.md) (Chrome real, base desechable, todo ejecutado hoy).
**Alcance:** las tareas B0 a B3 del plan de la Fase 25 (`feat/fase-25`, commits `6bfd086`, `e5e6b6a`, `0e7bc56`, `7437042`), sobre el backend de la Parte A ya en `main`.
**No cubre:** el Tutor con este tipo de ejercicio, otros navegadores, lector de pantalla.

## Entorno

| Dato | Valor |
|---|---|
| Commit auditado | `bf2c01a` (rama `feat/fase-25`, sobre `main` = `0bbf83f`) |
| Árbol | `git worktree` aparte (no se tocó tu árbol ni `basestire`) |
| Base de datos | MySQL nativa, base desechable `stire_qa25b` (10 migraciones + seed + admin), borrada al terminar |
| Backend / frontend | `nest build` en :3098 · `nuxt generate` servido como SPA estática en :3100 |
| Navegador | Chrome real, escritorio 1366×850 y móvil 375×667 |
| `npx nuxi typecheck` / `nuxt generate` | exit 0 / sin errores (antes y después de las correcciones) |

## Veredicto

**Apta para fusionar tras las correcciones que se hicieron en esta auditoría.** La seguridad, el flujo del docente y el del estudiante están bien y coinciden con el contrato. Había **dos fallos reales** (el ejercicio no se podía usar en un celular, y «Probar» de la barra superior fallaba en silencio) que se corrigieron y verificaron; queda una **dependencia** (A7) que se resuelve en el backend.

## Cobertura

| Tarea | Estado | Resultado |
|---|---|---|
| B0 — `formatMarkdown` único y código en línea escapado | ✅ con una dependencia | Una sola copia; el `<img onerror>` no se ejecuta; `**x**` dentro de un código en línea no se formatea. **Pero** el código con `<`, `>` o `&` se ve con entidades (`a &lt; b`) hasta que el servidor deje de codificarlo (F25-04, A7) |
| B1 — constructor del docente | ✅ | Sin `required`; aviso de alcance; nota de `a11y`; crea desde la pantalla con 5 reglas (3 públicas, 2 ocultas) y la config enviada tiene la forma exacta del contrato; una solución modelo incorrecta muestra el motivo del servidor, **no deja actividad huérfana** y conserva lo escrito; formulario vacío no envía y explica |
| B2 — pantalla del estudiante | ✅ tras corregir F25-01 y F25-02 | Vista previa en vivo (HTML y CSS), «Probar» marca ✔/✖ solo las públicas y dice cuántas hay ocultas sin revelarlas, no consume intento; entregas 8/20 y 20/20 (con color `#FF0000`), HTML vacío no se entrega |
| B3 — store | ✅ | Autoguardado (`PUT`), respuesta `{ html, css }`, límites |
| Seguridad de la vista previa | ✅ | `sandbox=""` vacío y CSP; un `<script>`, un `onerror`, un enlace `javascript:` (también con clic), una imagen, hoja de estilo, iframe o formulario remotos **no ejecutan nada ni salen a la red**; la página de STIRE no puede leer el contenido del iframe |
| Regresión de los otros tipos | ✅ | mcq, coding y fill_code cargan sin errores en escritorio y móvil |

## Hallazgos

| ID | Sev. | Dónde | Observado | Estado |
|---|---|---|---|---|
| **F25-01** | Medio | «▶ Probar» de la **barra superior** (`layouts/workspace.vue`) | Ante un error (un 429, la red, un 500) no muestra nada y lanza `FetchError` sin capturar. El informe dice que el 429 se explica: solo lo hacía el botón del **panel de reglas**. Causa: `runHtmlCss()` relanzaba el error y solo el componente lo capturaba | ✅ Corregido: el error queda en el store (`htmlCssRunError`, `htmlCssRateLimited`) y el panel lo muestra se pulse el botón que se pulse. Verificado con ambos botones |
| **F25-02** | **Alto** | Pantalla del ejercicio en **móvil 375 px** | El estudiante **no podía usar el ejercicio**: la página tenía alto fijo (667 px), el editor quedaba fuera de pantalla (y de solo 24 px de alto) y «Entregar solución» de la barra quedaba cortado a la derecha (x = 459). El plan pedía «editor, vista previa y reglas apilados». **Causa de fondo:** `layouts/workspace.vue` (alto fijo y `overflow-hidden`) no tenía comportamiento móvil para **ningún** tipo (el «Entregar» de la pantalla de código también quedaba en x = 414) | ✅ Corregido con clases responsive (en móvil la página se desplaza; editor de 60 % de la pantalla; barra superior que se ajusta). Verificado: sin desborde, editor de 331 px, botones dentro del ancho, «Probar» y «Entregar» del panel alcanzables y funcionando; **escritorio sin cambios** (la página no se desplaza, editor y vista lado a lado); mcq, coding y fill_code sin regresión |
| **F25-03** | Bajo | Constructor del docente | Textos sin tildes: «solucion», «comprobacion», «numero», «imagenes» | ✅ Corregido (7 textos) |
| **F25-04** | Medio | Lecciones y enunciados con código | El servidor saneaba el código como HTML (codifica `<`→`&lt;`, borra `"<hola>"`, añade un `</b>`) y B0 ahora escapa otra vez: el código en línea con `<`, `>` o `&` se ve `a &lt; b &amp;&amp; c` | ✅ **A7** hecha el 25/09 (ver `CHANGELOG.md`): el código se guarda tal cual y se ve literal; verificado en Chrome real |
| F25-05 | Info | Plan §25.7, control 2 | «`err?.data?.message` debe dar cero» estaba mal planteado (**es del plan, no de Antigravity**): dan 15, todos **ya en `main`**, en páginas anteriores (mensajes, rendimiento, `docente/index`, `clases`, `[studentId]`, `useApi.ts`, `auth.ts:116`); muestran el texto genérico en vez del motivo del servidor | **Cerrado el 25/09:** 11 sitios migrados a `messageOf`; `auth.ts` y `useApi.ts` leen `error` primero (ver `CHANGELOG.md`) |
| F25-06 | Info | Escritorio | El editor queda estrecho (369 px) porque se conserva la columna del enunciado (40 %) junto a editor y vista previa | Para la Fase 26 (editor) |
| F25-07 | Info | Toda la aplicación | Carga las fuentes desde Google Fonts (una dependencia externa y un dato de privacidad; el contenido del estudiante **no** hace ninguna petición) | Ya existía |

**Hallazgo de seguridad posterior (F25-08, corregido el mismo día):** al construir A7, el fuzzing mostró que `formatMarkdown` —anterior a esta fase— aplicaba reemplazos de texto sobre HTML ya saneado y podía insertar comillas dentro de un valor de atributo, colando otros atributos. Se corrigió pasando el HTML final por DOMPurify en el navegador (protege también los datos ya guardados); detalle en el `CHANGELOG.md`. Los hallazgos de la Parte B en sí no eran de seguridad. Se comprobó también que el estudiante no recibe `modelSolution`, criterios ni reglas ocultas (Parte A, 25/25 por la API) y que la interfaz no las muestra.

## Lo que funcionó (probado hoy)

- **Docente, desde la pantalla, sin atajos:** los 6 tipos de regla, orden ▲▼, público/oculta, pesos; `oneOf` se envía como lista (`["red","#ff0000"]`).
- **Estudiante:** vista previa con lo que escribe (y su CSS de la otra pestaña), «Probar» sin gastar intento, notas y feedback correctos, 429 explicado.
- **Móvil (tras corregir):** escribir, ver la vista previa, probar y entregar desde el panel.
- Autoguardado: 7 peticiones `PUT` con `{ html, css }` durante la prueba.

## No cubierto

Tutor con un ejercicio `html_css`; Firefox y Safari; lector de pantalla; despliegue real.
