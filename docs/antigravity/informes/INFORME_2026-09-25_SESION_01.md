# STIRE — Formato de Informe de Sesión Antigravity

**Código de Documento:** INF-AGY-2026-09-25-01  
**Fecha:** 2026-09-25  
**Hora de Ejecución:** 12:45 (UTC-5)  
**Agente / Asistente:** Antigravity (Google DeepMind)  
**Ambiente:** Desarrollo Local (`localhost`)  
**Stack Activo:** Nuxt 3 (Frontend `:3000`) + NestJS (Backend `:3001`) + MariaDB (`basestire`) + Google Gemini AI  
**Rama:** `feat/fase-25`

---

## 1. Resumen Ejecutivo

Durante esta sesión se ejecutó íntegramente la **Fase 25 — Parte B (Frontend)** especificada en `docs/antigravity/PLAN_IMPLEMENTACION.md`, correspondiente a la integración y experiencia de usuario del nuevo tipo de ejercicio `html_css` (HTML y CSS calificados por reglas en servidor, ADR 13).

Se implementaron las 4 tareas programadas (B0, B1, B3, B2):
1. **B0 (Unificación de Markdown):** Se centralizó el renderizado en `utils/formatMarkdown.ts`, asegurando el escape de código en línea (\`code\`) e inline HTML, y se eliminaron las copias redundantes en páginas.
2. **B1 (Constructor Docente):** Se creó el componente `HtmlCssExerciseBuilder.vue` con soporte completo para los 6 tipos de comprobaciones (`element_exists`, `element_count`, `text`, `attribute`, `css_property`, `a11y`), gestión de reglas públicas/ocultas con reordenamiento, solución modelo y validación estricta sin atributos `required`.
3. **B3 (Store Pinia Workspace):** Se extendió `stores/workspace.ts` para soportar `html_css` en `loadActivity()`, agregando `htmlCode`, `cssCode`, `runHtmlCss()`, `htmlCssResults`, armado de respuesta `{ html, css }` en `submitSolution()`, autoguardado pasivo con debounce y extracción segura de errores mediante `useApiErrorMessage()`.
4. **B2 (Pantalla del Estudiante):** Se desarrolló `components/exercise/HtmlCssExercise.vue` con pestañas HTML y CSS monoespaciadas, vista previa en tiempo real en un `<iframe>` estrictamente aislado con `sandbox=""` (sin permisos) y política CSP (`default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:`), panel reactivo de reglas con estado neutral «—» antes de probar y retroalimentación de fallos, y se integró como tercera rama `isHtmlCssActivity` en `pages/estudiante/evaluacion/[activityId].vue`.

---

## 2. Plan de Implementación Ejecutado

| Tarea | Módulo / Componente | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| **B0** | `utils/formatMarkdown.ts`, `pages/estudiante/unidad/[id].vue`, `pages/estudiante/evaluacion/[activityId].vue` | Unificación de `formatMarkdown` en `utils/`, escape de código en línea e inline scripts, eliminación de copias en páginas | ✅ Completado (`6bfd086`) |
| **B1** | `components/docente/exercise-builders/HtmlCssExerciseBuilder.vue`, `pages/docente/ejercicios/crear.vue` | Constructor docente de `html_css` con las 6 comprobaciones, ordenamiento ▲▼, peso 1–100, aviso de alcance e integración en selector de creación | ✅ Completado (`e5e6b6a`) |
| **B3** | `stores/workspace.ts`, `types/index.ts`, `layouts/workspace.vue` | Soporte `html_css` en store Pinia (`htmlCode`, `cssCode`, `runHtmlCss`, `htmlCssResults`, `submit`, `autosave`) y habilitación en layout | ✅ Completado (`0e7bc56`) |
| **B2** | `components/exercise/HtmlCssExercise.vue`, `pages/estudiante/evaluacion/[activityId].vue` | Interfaz del estudiante: editor con pestañas, iframe con `sandbox=""` + CSP, evaluación con `POST /submissions/:id/run` y rama `isHtmlCssActivity` a altura completa | ✅ Completado (`7437042`) |

---

## 3. Verificaciones de Seguridad y Robustez

### 3.1. Aislamiento de Ejecución y Previews (XSS / Inyección)
- El elemento `<iframe>` de vista previa en `HtmlCssExercise.vue` tiene asignado `sandbox=""` completamente vacío. No contiene ninguna directiva permisiva (`allow-scripts`, `allow-same-origin`, etc.).
- La cabecera CSP inyectada en el documento embebido bloquea solicitudes de red no autorizadas:
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">`
- Si el estudiante introduce etiquetas `<script>`, manipuladores `onerror` o enlaces `javascript:`, estos no se ejecutan en el navegador ni afectan el contexto de la aplicación STIRE.

### 3.2. Gestión de Errores y Límites de Tasa (Rate Limiting)
- Se integró `useApiErrorMessage()` en lugar de accesos directos frágiles a `err?.data?.message`.
- En caso de recibir código HTTP `429` (límite de 20 ensayos por minuto en `POST /submissions/:id/run`), la interfaz muestra un mensaje explicativo y amigable indicando la razón al estudiante.
- Se previene el envío de documentos HTML vacíos o compuestos únicamente por espacios en blanco.

---

## 4. Pruebas de Calidad (QA) y Verificación de Build

1. **Typecheck TypeScript (`npx nuxi typecheck`):**  
   - Exit code: `0` (Cero errores de tipado en TypeScript/Nuxt).
2. **Generación Estática de Producción (`npm run generate`):**  
   - Exit code: `0` (Compilación exitosa con Nitro y prerenderizado de las 25 rutas del proyecto).
3. **Búsquedas de Control (§25.7):**  
   - `grep -rn "allow-scripts\|allow-same-origin" frontend-nuxt/components frontend-nuxt/pages`: **0 coincidencias**.  
   - `grep -rn "function formatMarkdown" frontend-nuxt/pages`: **0 coincidencias**.  

---

## 5. Historial de Commits en `feat/fase-25`

```
7437042 feat(ejercicio): pantalla html_css del estudiante con editor y vista previa (B2)
0e7bc56 feat(store): soporte html_css en workspace (B3)
e5e6b6a feat(ejercicios): agregar constructor html_css para el docente (B1)
6bfd086 refactor(markdown): unificar formatMarkdown en utils con código en línea escapado (B0)
0bbf83f feat(fase-25): tipo de pregunta html_css, HTML y CSS calificados por reglas (Parte A, backend)
```

---

## 6. Próximos Pasos

1. Crear Pull Request desde `feat/fase-25` hacia `main`.
2. Habilitar la auditoría en Chrome real por parte de Claude Code antes de la integración final a `main`.

