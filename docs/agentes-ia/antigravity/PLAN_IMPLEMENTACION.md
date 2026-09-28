---
estado:     pendiente — Fase 27 (solo frontend; el backend ya está en producción)
verificado: 2026-09-27 contra src/ y frontend-nuxt/ reales, y contra la API en producción
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    EST-V02 (unidad) · EST-V01 (inicio) · DOC-V02 (contenidos) · DOC-V03 (ejercicios) · DOC-V01 (clases)
---

# Plan de implementación para Antigravity — Fase 27

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 26 están hechas y archivadas en
[`docs/_archivo/`](../../_archivo/). **No las leas para ejecutar esta fase.**

**Contexto que sí debes leer (corto):**
- [`docs/DISENO_PRACTICA_ADAPTATIVA.md`](../../DISENO_PRACTICA_ADAPTATIVA.md), §3.0, §3.1 y §3.5: el porqué de cada pantalla.
- En el plan maestro, §6.00: qué está hecho.

---

## 27. Fase 27 — la práctica adaptativa y la reutilización, en pantalla

### 27.0 En una línea

El backend ya **recomienda** el siguiente ejercicio con su motivo, **guarda** cómo se siente el estudiante con cada tema,
**copia** contenido entre clases, ofrece el **banco** del docente y **duplica** ejercicios como variante. Todo está en
producción, pero **nada de eso tiene pantalla**, salvo el motivo de la recomendación en la unidad. Esta fase lo pone en
pantalla. **Solo `frontend-nuxt/`.**

### 27.1 Reglas

1. **Libre, pero con un camino claro (como Duolingo).**
   - Nada bloquea al estudiante: ninguna ventana obliga a responder, y el botón principal «Continuar» funciona siempre.
   - Hay como máximo **una** pregunta de confianza por unidad.
2. **No inventes datos:** un dato que no llega se muestra «—», nunca `0` ni un estado positivo.
3. **Errores del servidor:** `const { messageOf } = useApiErrorMessage()`. El backend responde el motivo en `error`,
   no en `message`. Muestra ese texto al usuario.
4. **Diálogos:** cierran con `useEscapeToClose`, el foco entra al abrirlos y vuelve al botón que los abrió.
5. **Sin `v-html`** con datos del usuario. Los títulos y enunciados del banco se pintan como texto.
6. **No edites `tailwind.config.ts` ni `assets/css/main.css`** (identidad visual de José). Usa las clases de color que ya
   existen (`acento-ambar-fuerte`, `semantico-pasa`, `semantico-falla`, `base-texto-secundario`…).
7. **Sin emojis como iconos:** usa `lucide-vue-next`, como el resto de la aplicación.
8. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-27`; se une a `main` con Pull Request.
9. **«Verificado» = probado en Chrome real** contra el backend (27.4). Antes de cada commit corre `npx nuxi typecheck`
   (exit 0) y `npm run generate`.
10. **Sin dependencias nuevas.**

### 27.2 Contrato del backend (en producción desde el 27/09; compruébalo en `/docs-json`)

| Método y ruta | Quién | Envía | Responde |
|---|---|---|---|
| `GET /learning-progress/student/:studentId/unit/:unitId/next-activity` | estudiante matriculado | — | `{ activityId, title, questionType, order, allCompleted, level, reason, reasonMessage }`. `reason` ∈ `repaso`, `reto`, `sube_nivel`, `baja_nivel`, `hermana`, `reintento`, `siguiente`, `practica_extra`, `completada`, `sin_intentos`. `403` si no está matriculado |
| `GET /learning-progress/student/:studentId/unit/:unitId` | estudiante | — | progreso de la unidad o `null`; incluye `entryConfidence` (`1`, `2`, `3` o `null`) y `mastery` |
| `PUT /learning-progress/unit/:unitId/confidence` | estudiante matriculado | `{ "confianza": 1 \| 2 \| 3 }` | `{ learningUnitId, entryConfidence }`; `400` si el valor no es 1, 2 o 3; `403` si no está matriculado |
| `GET /review-schedules/due` | estudiante | — | sus repasos, cada uno con `learningUnitId` y `urgency` (`al-dia`, `manana`, `vencido`, `critico`) |
| `POST /reuse/classes/:classId/import` | docente de las dos clases | `{ "sourceClassId": n, "sectionIds"?: [n…] }` | `{ sections, topics, learningUnits, contents, activities, questions }`. Las secciones llegan **sin publicar**; no copia estudiantes ni notas. `400` si es la misma clase o hay secciones ajenas; `403` si no dicta alguna |
| `GET /reuse/bank?type=&difficulty=&q=` | docente | filtros opcionales: `type` ∈ tipos de pregunta, `difficulty` ∈ `basico`, `intermedio`, `avanzado`, `q` texto (≤100) | `[{ activityId, title, difficulty, questionType, status, questionPreview, learningUnitId, learningUnitTitle, classId, className }]` (máximo 300) |
| `POST /reuse/activities/:activityId/copy` | docente de las dos clases | `{ "learningUnitId": n, "variant"?: true }` | `{ id, title, status: "draft" }`. Con `variant`, el título termina en «(variante)» |

Los significados de `confianza`: **1 = «Es nuevo para mí», 2 = «Tengo dudas», 3 = «Me siento seguro»**.

### 27.3 Tareas

#### T1 — Estudiante: «¿Cómo te sientes con este tema?» (`pages/estudiante/unidad/[id].vue`)

- **Cuándo aparece:** si el progreso de la unidad no tiene `entryConfidence` (es `null` o no hay progreso), muestra una
  tarjeta **encima** de la sección «Tu siguiente paso».
- **Qué tiene la tarjeta:**
  - el título «¿Cómo te sientes con «{título de la unidad}»?»;
  - tres botones: `Es nuevo para mí`, `Tengo dudas` y `Me siento seguro`;
  - una línea pequeña: «Nos ayuda a proponerte por dónde empezar. Puedes saltarla».
- **Al elegir:** `PUT …/confidence`, luego se oculta la tarjeta y **se vuelve a pedir** la recomendación. Con «Me siento
  seguro» cambia a un reto; el motivo se ve al instante.
- **Si no responde:** «Continuar» funciona igual.
- **Error:** si el PUT falla, muestra `messageOf(error)` en la tarjeta y la deja visible.
- **Accesibilidad:** los tres botones forman un `role="group"` con `aria-labelledby` apuntando al título.

#### T2 — Estudiante: el motivo y la memoria (`pages/estudiante/unidad/[id].vue`, `pages/estudiante/index.vue`)

- **Unidad:** el motivo (`reasonMessage`) ya se muestra. Agrega, junto al título del ejercicio recomendado, una etiqueta
  pequeña con el nivel (`básico`, `intermedio`, `avanzado`).
  - Si `reason === 'repaso'`, un icono de repaso (`RotateCcw`).
  - Si `reason === 'reto'` o `sube_nivel`, un icono de subir (`TrendingUp`).
- **Inicio:** donde hoy se recomienda un ejercicio, muestra también su `reasonMessage`, que ya viene en la respuesta.
- **Memoria:** donde se listan las unidades con su dominio (inicio y `progreso.vue`), agrega «Se está olvidando» cuando
  `GET /review-schedules/due` trae esa unidad con urgencia `vencido` o `critico`.
  - Muestra el dominio y la memoria **por separado**; no los mezcles en un solo número.

#### T3 — Docente: «Traer de otra clase» (`pages/docente/contenidos.vue`) y «Copiar el contenido de…» al crear (`pages/docente/index.vue`)

- **En Contenidos:** con una clase elegida, un botón «Traer de otra clase» (icono `CopyPlus`) abre un diálogo.
  - **Qué muestra el diálogo:**
    1. un selector con **las otras clases del docente** (`GET /class/my-classes`, sin la actual);
    2. las secciones de la clase elegida (`GET /sections/class/:id`), todas marcadas, con casillas para desmarcar;
    3. el texto «Se copian lecciones y ejercicios **sin publicar**. No se copian estudiantes ni notas».
  - **Botón «Traer»:** hace `POST /reuse/classes/:classId/import` con `sectionIds`. Si todas están marcadas, puedes omitir
    `sectionIds`.
  - **Al terminar:** muestra el resumen («Se trajeron 3 secciones, 17 unidades y 65 ejercicios. Revísalas y
    publícalas cuando quieras») y recarga el árbol.
  - Mientras copia, el botón dice «Copiando…» y queda deshabilitado.
- **Al crear una clase** (el modal «Crear Nueva Clase» de `pages/docente/index.vue`): un campo opcional «Copiar el
  contenido de» con `Empezar vacía` (por defecto) y las clases del docente.
  - Si elige una, después del `POST /class` que ya existe llama a `POST /reuse/classes/:nuevaId/import` con
    `{ sourceClassId }`.
  - Si la importación falla, la clase ya quedó creada: dilo con `messageOf(error)` y sugiere usar «Traer de otra
    clase» desde Contenidos.

#### T4 — Docente: «Mi banco» (`components/docente/UnitExercisesPanel.vue`)

- **Dónde:** en el panel de ejercicios de una unidad, un botón «Agregar desde mi banco» (icono `Library`) abre un diálogo.
- **Filtros:** tipo, nivel y un buscador de texto. El texto espera 300 ms antes de buscar.
- **Lista de ejercicios** (`GET /reuse/bank`): cada uno muestra
  - título;
  - tipo en español (usa las etiquetas que ya existen para los tipos);
  - nivel;
  - «{clase} · {unidad}»;
  - `questionPreview` en una línea recortada.
- **Botón «Agregar a esta unidad» en cada ejercicio:** hace `POST /reuse/activities/:id/copy` con la unidad actual,
  recarga la lista del panel y avisa «Agregado como borrador. Revísalo y publícalo».
- **Lista vacía:** «Todavía no tienes ejercicios en otras unidades» o «Ningún ejercicio coincide con los filtros».

#### T5 — Docente: «Duplicar como variante» (`components/docente/UnitExercisesPanel.vue`)

- **Dónde:** en cada fila de ejercicio, junto a Editar y Archivar, un botón «Duplicar como variante» (icono `Copy`, con
  `aria-label` que incluya el título).
- **Al pulsarlo:** `POST /reuse/activities/:id/copy` con `{ learningUnitId: unidad actual, variant: true }`. Luego
  recarga la lista y **abre el editor** del ejercicio nuevo, para que el docente cambie los datos.
- **Texto de ayuda** en el panel, una sola vez: «Las variantes son otro ejercicio del mismo tipo y nivel. STIRE las usa
  para reintentos y repasos, para que el estudiante no repita la misma respuesta».

#### T6 — Docente: aviso de casillas con un solo ejercicio (`components/docente/UnitExercisesPanel.vue`)

- **De dónde salen los datos:** con `GET /reuse/bank`, filtrando por `learningUnitId` de la unidad actual (así tienes
  `questionType` y `difficulty`), agrupa los ejercicios **publicados** por (tipo, nivel).
- **Qué mostrar:** si algún grupo tiene **un solo** ejercicio, un aviso discreto, no un error: «El nivel {nivel} de
  {tipo} tiene 1 ejercicio; una variante ayuda en los repasos». Al lado, un botón que dispara T5 sobre ese ejercicio.
- **Si todos los grupos tienen 2 o más,** no se muestra nada.

### 27.4 Cómo se verifica (Chrome real, backend real)

**Cuentas de prueba:** docente `laura.martinez.docente@example.com`; estudiantes `mariana.suarez@example.com` y
`camila.diaz@example.com`. Todas con la contraseña `Test123.`. No uses cuentas personales.

1. **T1:**
   - Mariana abre una unidad de «Fundamentos de Algoritmia (203413)» que no ha empezado: aparece la tarjeta.
   - Elige «Me siento seguro»: el motivo cambia a «Dijiste que te sientes seguro: prueba este reto…».
   - Recarga la página: la tarjeta ya no aparece.
   - En otra unidad, pulsa «Continuar» sin responder: entra al ejercicio.
2. **T2:** el inicio muestra el motivo, la unidad muestra el nivel, y una unidad con repaso vencido dice «Se está
   olvidando».
3. **T3:**
   - Laura crea «Algoritmia — Grupo 2» copiando el contenido de «Fundamentos de Algoritmia (203413)»: aparecen 3
     secciones **sin publicar** y 0 estudiantes.
   - Otra prueba: trae solo una sección a una clase existente.
   - Muestra el error de traer la clase sobre sí misma, si se puede provocar desde la pantalla.
4. **T4:** filtra por «Ordenar» y «básico», agrega uno a otra unidad y comprueba que aparece como borrador.
5. **T5 y T6:** duplica un ejercicio: se abre su editor, y el aviso de T6 desaparece de esa casilla.
6. **Teclado y pantalla:**
   - todo se puede hacer con teclado: Tab, Enter y Esc, con el foco visible;
   - en 375 px de ancho nada se sale de la pantalla.
7. **En tu informe:** incluye la consola del navegador sin errores y capturas de cada tarea.

**Limpieza:** deja las clases y copias de prueba **en borrador** y di en tu informe cuáles creaste. Claude Code decide
si se borran.

### 27.5 Informe

Escribe tu informe en `docs/agentes-ia/antigravity/informes/INFORME_<fecha>_SESION_<n>.md`:
- qué hiciste por tarea, con commit y capturas;
- lo que **no** pudiste verificar.

Cuenta solo lo que viste en pantalla, no lo que dice este plan. No edites `docs/PLAN_MAESTRO.md`: lo actualiza Claude
Code después de auditar.
