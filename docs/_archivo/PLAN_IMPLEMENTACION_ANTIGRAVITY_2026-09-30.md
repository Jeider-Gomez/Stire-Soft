---
estado:     ejecutada y archivada el 2026-09-30 (la ejecutó Claude Code en feat/fase-28; informe en docs/agentes-ia/antigravity/informes/INFORME_FASE_28.md)
verificado: 2026-09-29 contra src/ y frontend-nuxt/ reales
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    DOC-V02 (contenidos: panel de ejercicios de la unidad)
---

# Plan de implementación para Antigravity — Fase 28

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 27 están hechas y archivadas en
[`docs/_archivo/`](../../_archivo/). **No las leas para ejecutar esta fase.**

**Contexto que sí debes leer (corto):** [`docs/DISENO_PRACTICA_ADAPTATIVA.md`](../../DISENO_PRACTICA_ADAPTATIVA.md) §3.2
(ejercicios hermanos) y §3.5 (reutilización).

---

## 28. Fase 28 — editar las respuestas de un ejercicio (y que las variantes sirvan)

### 28.0 En una línea

Hoy «Editar» en el panel de ejercicios de la unidad solo cambia título, enunciado, dificultad, puntos y tipo de actividad.
**Las respuestas no se pueden cambiar** (opciones, respuesta correcta, casos de prueba, plantilla, pares, orden, reglas
HTML/CSS). Por eso «Duplicar como variante» deja una copia idéntica, y una variante idéntica no le sirve al estudiante en
un reintento. El backend ya permite editarlas. Esta fase lo pone en pantalla. **Solo `frontend-nuxt/`.**

### 28.1 Reglas

1. **No inventes datos.** Un dato que no llega se muestra «—», nunca un valor por defecto que parezca real.
2. **Errores del servidor:** `const { messageOf } = useApiErrorMessage()`. El motivo llega en `error`, no en `message`.
   Muestra ese texto: el 409 ya explica qué hacer.
3. **Diálogos:** cierran con `useEscapeToClose`, el foco entra al abrirlos y vuelve al botón que los abrió.
4. **Sin `v-html`** con datos del usuario, salvo el `formatMarkdown(..., { escapeHtml: true })` que ya existe.
5. **No edites `tailwind.config.ts` ni `assets/css/main.css`** (identidad visual). Usa las clases que ya existen.
6. **Iconos con `lucide-vue-next`**, nunca emojis.
7. **Sin dependencias nuevas.** Sin `any` ni `@ts-ignore`.
8. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-28`; se une a `main` con Pull Request.
9. **«Verificado» = probado en Chrome real** contra el backend (28.4). Antes de cada commit: `npx nuxi typecheck`
   (exit 0) y `npm run generate` (debe terminar sin error: la Fase 27 llegó sin compilar por un `</Teleport>` faltante).

### 28.2 Contrato del backend

| Método y ruta | Quién | Envía | Responde |
|---|---|---|---|
| `GET /activity-questions/activity/:activityId` | docente de la clase | — | lista de preguntas **completas** (con `id`, `type`, `question`, `points`, `config` con la respuesta correcta). Los ejercicios creados desde la app tienen **una** pregunta |
| `GET /activity-questions/activity/:activityId/editable` | docente de la clase | — | `{ activityId, editable, submissions }`. `editable` es `false` si hay entregas **enviadas o calificadas** |
| `PATCH /activity-questions/:id` | docente de la clase | `{ question?, points?, config? }` (el `type` no cambia) | la pregunta guardada. **`409`** si ya hay entregas («…Duplícalo como variante y edita la copia.»); **`400`** si el `config` no es válido para su tipo (mismas reglas que al crear) |
| `PATCH /activities/:id` | docente de la clase | título, descripción, dificultad, puntos, tipo | ya existe y ya se usa en el diálogo |
| `POST /reuse/activities/:activityId/copy` | docente | `{ learningUnitId, variant: true }` | ya existe y ya se usa en «Duplicar como variante» |

En los ejercicios creados con `pages/docente/ejercicios/crear.vue`, **el enunciado de la actividad y el de la pregunta son
el mismo texto**, y los puntos de la pregunta son los puntos totales. Al guardar hay que mantenerlos iguales.

### 28.3 Tareas

#### T1 — Cada editor de ejercicio puede cargar un ejercicio existente

En los 7 editores de `components/docente/exercise-builders/`, agrega a `defineExpose` una función `load(config)`: la
inversa de `validateAndGetConfig`. Recibe el `config` guardado y deja el editor como si el docente lo hubiera escrito.

**Hecho cuando:** para cada tipo, `load(config)` seguido de `validateAndGetConfig(puntos)` devuelve un `config`
equivalente al original (mismas opciones, misma respuesta correcta, mismos casos, con `isPublic` intacto). Pruébalo con un
ejercicio real de cada tipo del curso ALGO-203413 en producción.

#### T2 — El diálogo «Editar ejercicio» también edita las respuestas (`components/docente/UnitExercisesPanel.vue`)

Al abrir el diálogo, pide la pregunta y si es editable (28.2).
- **Editable:** debajo de los campos actuales, una sección «Respuestas del ejercicio» con el editor de su tipo, ya cargado
  (T1). Al guardar: `PATCH /activities/:id` como hoy y, después, `PATCH /activity-questions/:id` con `question` (el mismo
  texto del enunciado), `points` (los puntos totales) y `config`. Si el editor no valida, el diálogo no se cierra y muestra
  el error junto al editor.
- **No editable:** en lugar del editor, un aviso: «Este ejercicio ya tiene N entregas: sus respuestas no se pueden cambiar
  sin alterar notas ya puestas.» y un botón «Duplicar como variante» que hace lo mismo que el botón de la lista.
  Título, enunciado, dificultad y puntos se siguen pudiendo editar, como hoy.
- **Mientras carga:** el diálogo muestra la parte de siempre; la sección de respuestas dice «Cargando respuestas…» con
  `Loader2`. Si la carga falla, se dice con `messageOf` y el resto del diálogo sigue funcionando.

#### T3 — Una variante recién duplicada invita a cambiarla

Después de «Duplicar como variante», el diálogo ya se abre (Fase 27). Ahora, además:
- el foco va a la sección «Respuestas del ejercicio», no al título;
- arriba de la sección aparece: «Esta es una copia. Cambia los datos (números, opciones, casos) para que sea un ejercicio
  distinto del original.»;
- si el docente guarda **sin cambiar el `config`**, se guarda igual pero se le avisa: «La variante quedó igual al
  original: en un reintento el estudiante verá las mismas respuestas.» No se bloquea.

#### T4 — Ver la variante como el estudiante

En la sección de respuestas, un botón «Ver como el estudiante» que muestra `components/docente/ExercisePreview.vue` con el
`config` que está en el editor en ese momento, igual que el paso 3 de `crear.vue`.

### 28.4 Verificación

Contra producción (`https://stire-unicor.duckdns.org`), con la cuenta de prueba **laura.martinez.docente@example.com**
(clave `Test123.`), en una clase suya **de prueba** (no en ALGO-203413 ni PENSAR-ALGO, que usan estudiantes):
1. Crea un ejercicio de opción múltiple, ábrelo con «Editar», cambia la respuesta correcta y guarda. Recarga: el cambio
   sigue ahí.
2. Duplícalo como variante: el foco está en las respuestas, cambia una opción, guarda, «Ver como el estudiante» muestra el
   cambio.
3. Un ejercicio con entregas (cualquiera de ALGO-203413): el diálogo muestra el aviso con el número de entregas y **no**
   el editor. **No guardes nada ahí.**
4. Repite 1 con un ejercicio de código (casos públicos y ocultos) y con uno de HTML/CSS.
5. Consola de Chrome sin errores en todo el recorrido, a 1440 px y a 375 px.

### 28.5 Entrega

Un informe corto en `docs/agentes-ia/antigravity/informes/INFORME_FASE_28.md`: qué hiciste por tarea, el commit de cada
una, lo verificado en 28.4 con capturas, y lo que no pudiste hacer. Sin ese informe la fase no se da por entregada.
