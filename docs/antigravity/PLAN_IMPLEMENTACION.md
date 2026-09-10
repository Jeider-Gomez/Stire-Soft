---
estado:     vigente — §7.1/§7.2 resueltos del lado backend (ver §12); Fase siguiente definida en §12
verificado: 2026-09-10 contra frontend-nuxt/ y src/ reales (segunda pasada, posterior a FASE CC-09) —
            primera pasada 2026-09-09 contra el archivo Figma real (fileKey 1MjKiDrjU65ezO3ztO0v4m)
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    COMP-V00 · EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03
---

# 🚀 Insumo 15 — Plan de Implementación en Nuxt para Google Antigravity

**Propósito:** llevar a código real, con Antigravity, **exactamente lo que ya se construyó y se
verificó en Figma** esta semana — ni más, ni menos. Este documento no rediseña nada: donde el
Insumo 12 (`12_CONTRATO_FRONTEND_BACKEND.md`) y el Insumo 14 (`14_GUIA_DE_TRABAJO_FRONTEND.md`) ya
especifican rutas, componentes y payloads, este plan **no los repite ni los reinterpreta** — solo
dice en qué orden usarlos y qué verificar contra el prototipo real antes de dar un paso por cerrado.

**Este documento es un plan, no código.** No se ha escrito ni una línea de Vue en este repositorio
como parte de esta fase — eso es exactamente lo que Antigravity debe hacer a partir de aquí.

---

## 1. Alcance exacto — qué SÍ se replica y qué NO

Lo construido y cableado en Figma esta semana, y solo eso:

| Ventana | Estados diseñados | Rol |
|---|---|---|
| `COMP-V00` · Iniciar Sesión | 1 (defecto) | Común |
| `EST-V01` · Inicio | 4 (defecto, vacío, error, completado) | Estudiante |
| `EST-V02` · Lección | 4 + clon de trazado (paso 3) | Estudiante |
| `EST-V03` · Ejercicio / Sandbox | 4 | Estudiante |
| `EST-V04` · Tutor IA (overlay) | 4 | Estudiante |
| `EST-V05` · Repasos | 4 | Estudiante |
| `EST-V06` · Mi Progreso | 4 | Estudiante |
| `DOC-V01` · Mis Clases | 1 (solo defecto) | Docente |
| `ADM-V02` · Usuarios y Roles | 1 (solo defecto) | Administrador |

**Explícitamente FUERA de este plan** (no diseñadas todavía cuando se escribió esta sección, no se
inventan ahora): `DOC-V02..V05`, `ADM-V01`, `ADM-V03` — 10 ventanas restantes de Docente/Administrador.
Si Antigravity llega a necesitar una de ellas para navegar, se implementa como placeholder de
"próximamente" con la Ventana Estándar vacía en zona `[C]` — nunca inventando contenido no diseñado.

> **Actualización 2026-09-09/10:** estas 10 ventanas **ya existen en Figma** — `DOC-V02..V06` y
> `ADM-V01`/`ADM-V03`, cada una con 3 de 4 estados (defecto/vacío/error; sin completado, decisión
> declarada en `MONITOREO_SEMANAL.md`). Aun así **siguen fuera del alcance de la próxima sesión de
> Antigravity** (ver §12) — la prioridad para el 15/17 de septiembre es cerrar el flujo real de
> Estudiante, no construir Docente/Administrador en código. No es un olvido: es la misma decisión de
> priorización de antes, reafirmada con el trabajo de Figma ya disponible para cuando le toque el turno.

**No se implementa** el patrón de "flyout de módulo" del Menú (navegación a unidad específica desde
un módulo expandido) como overlay real: está documentado como comportamiento pretendido en
`contenidos/3.3.3_MAPA_NAVEGACION.md`, pero nunca se construyó como frame en Figma. Antigravity debe
resolver el clic en un módulo del Menú como una expansión/acordeón simple en el propio Menú — no como
un flyout flotante — hasta que exista una referencia visual real.

---

## 2. Lectura obligatoria antes de escribir código (no se re-deriva nada de esto)

1. [`14_GUIA_DE_TRABAJO_FRONTEND.md`](14_GUIA_DE_TRABAJO_FRONTEND.md) — stack oficial, rutas Nuxt,
   nombres de componente y endpoints por ventana. **Fuente de verdad de rutas y componentes.**
2. [`12_CONTRATO_FRONTEND_BACKEND.md`](12_CONTRATO_FRONTEND_BACKEND.md) — payloads de request/response
   reales por ventana. **Fuente de verdad de contratos de datos.**
3. [`ventanas/3.3_VENTANA_ESTANDAR.md`](ventanas/3.3_VENTANA_ESTANDAR.md) — las 5 zonas A-E y cuáles
   son invariantes.
4. [`contenidos/3.3.3_MAPA_NAVEGACION.md`](contenidos/3.3.3_MAPA_NAVEGACION.md) — mapa de navegación
   normativo (3 clics máx., 7±2 en el Menú).
5. [`NAMING_STIRE.md`](NAMING_STIRE.md) — **única fuente de etiquetas visibles.** Ningún texto de UI
   se escribe a mano sin consultar este archivo primero (esta misma semana se encontró y corrigió un
   caso: un botón etiquetado "▶ Ejecutar" en vez de "▶ Probar código").
6. Prototipo navegable en Figma:
   `https://www.figma.com/proto/1MjKiDrjU65ezO3ztO0v4m/STIRE-Soft?node-id=11-2&starting-point-node-id=11-2`
   — úsese como referencia visual y de interacción real, no solo las fichas de texto.
7. [`04_MATRIZ_PERMISOS.md`](04_MATRIZ_PERMISOS.md) — antes de cablear cualquier llamada autenticada,
   qué rol puede pegarle a qué endpoint.

---

## 3. Paso 0 — Scaffold del proyecto

- **Ubicación:** `frontend-nuxt/`, nuevo directorio en la raíz del repo, **en paralelo** a
  `frontend/` (el experimental Next.js/React, congelado por decisión de Bitácora N.º 2 — no se toca,
  no se borra, no se reutiliza código de ahí).
- **Stack** (ya decidido, Insumo 14 §"Stack Oficial"): Nuxt 3 (SSR/SSG híbrido) + Vue 3
  (`<script setup>`, Composition API) + TypeScript + Pinia + Tailwind CSS.
- Autenticación: JWT en `useCookie('auth_token')`, usuario en `useAuthStore()` (Pinia) — contrato
  exacto en Insumo 12 §`COMP-V00`.
- No copiar configuración de `frontend/` (Next.js) — son stacks distintos, un `next.config.ts` o
  `AGENTS.md` de ese proyecto no aplica aquí.

---

## 4. Paso 1 — Tokens de diseño como código (antes que cualquier componente)

**Regla que viene de Figma y debe sobrevivir a la traducción a código: cero valores literales.**
Ningún componente Vue escribe un hex, un `px` o un nombre de fuente directo — todo pasa por estos
tokens. Los valores de abajo se extrajeron en frío de las 6 colecciones de variables y los 3 estilos
de efecto reales del archivo Figma (no transcritos de memoria) el 2026-09-04.

### 4.1 Color (`tailwind.config.ts` → `theme.extend.colors`)

```ts
colors: {
  base: {
    blanco:            '#FFFFFF',
    'bg-primario':     '#F6F3EF',
    'bg-secundario':   '#EDE8E1',
    'borde-sutil':     '#C9C1B8', // decorativo — NO usar en bordes funcionales/interactivos (no llega a 3:1)
    'borde-fuerte':    '#998878', // único borde válido para affordance de clic (≥3:1)
    'texto-secundario':'#6F6761', // corregido en CC-06 tras fallar 4.32:1 contra bg-primario (necesita ≥4.5:1)
    'texto-primario':  '#2B2622',
  },
  acento: {
    ambar:        '#C87B1E', // solo superficies grandes / no-texto (pasa ≥3:1, NO pasa 4.5:1 para texto)
    'ambar-fuerte':'#A76719', // único tono de ámbar válido para texto o texto-sobre-relleno (blanco sobre este = 4.57:1)
  },
  semantico: {
    pasa:  '#2F7D4F',
    falla: '#B3261E',
    info:  '#2B5D8A',
  },
  'estado-unidad': {
    dominado:     '#2F7D4F', // = semantico.pasa (alias en Figma)
    'en-progreso':'#A76719', // = acento.ambar-fuerte (alias en Figma)
    'por-iniciar':'#2B5D8A', // = semantico.info (alias en Figma)
    bloqueado:    '#6F6761', // = base.texto-secundario (alias en Figma)
  },
  'urgencia-repaso': {
    'al-dia':  '#2F7D4F', // = semantico.pasa
    'manana':  '#A76719', // = acento.ambar-fuerte
    vencido:   '#A85A1E', // valor propio, no alias
    'critico': '#B3261E', // = semantico.falla
  },
}
```

> **Nota WCAG (no renegociable):** `texto-secundario` y `ambar-fuerte` fueron corregidos en Figma
> esta semana precisamente porque sus valores originales fallaban contraste 2.1 AA. Si Antigravity o
> cualquier iteración futura "ajusta" estos hex por estética, debe volver a medir el contraste real
> antes de aceptar el cambio — no basta con que "se vea bien".

### 4.2 Tipografía (`theme.extend.fontFamily` / `fontSize`)

```ts
fontFamily: {
  interfaz: ['Inter', 'sans-serif'],
  codigo:   ['"JetBrains Mono"', 'monospace'],
},
fontSize: {
  xs: '12px', sm: '14px', base: '16px', md: '18px', lg: '20px', xl: '24px', '2xl': '32px',
},
fontWeight: {
  regular: 400, medio: 500, semibold: 600, bold: 700,
}
```

### 4.3 Espaciado, radio, borde, ícono

```ts
spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px', '3xl': '64px' },
borderRadius: { none: '0px', sm: '4px', md: '8px', lg: '16px', full: '999px' },
borderWidth: { fino: '1px', medio: '2px', grueso: '4px' },
// tamaños de ícono: sm 20px, md 24px, lg 32px — token de utilidad, no de Tailwind core
```

**Rejilla:** 12 columnas, canal de 24px, ancho mínimo de página 1024px (`espacio/rejilla/*`) — usar
como `container`/grid config, no hardcodear un layout de ancho fijo distinto.

### 4.4 Sombras (`theme.extend.boxShadow`, sustituyen los 3 Effect Styles "Sombra/sm·md·lg")

```ts
boxShadow: {
  sm: '0 1px 2px 0 rgba(43,38,34,0.08)',
  md: '0 4px 8px -2px rgba(43,38,34,0.10)',
  lg: '0 12px 24px -4px rgba(43,38,34,0.14)',
}
```

---

## 5. Paso 2 — Ventana Estándar como layout compartido

Traducir §3.3 (`ventanas/3.3_VENTANA_ESTANDAR.md`) a `layouts/` de Nuxt, no a un componente que se
reimporta a mano en cada vista:

- **Cuatro zonas invariantes** (Header `[A]`, Menú `[B]` 260px, Acciones `[D]` máx. 1 acción
  primaria, Footer `[E]`) viven en el layout. **Solo `[C]` (Contenido) es el `<slot />`** de cada
  página.
- Un layout por variante de rol, ya nombrados en Insumo 14: `layouts/student.vue`,
  `layouts/workspace.vue` (EST-V03, pantalla completa), `layouts/auth.vue` (`COMP-V00`). Para
  Docente/Administrador, construir `layouts/teacher.vue` y `layouts/admin.vue` siguiendo la MISMA
  estructura de zonas — la "verificación de ecosistema" de Figma (EST-V01/DOC-V01/ADM-V02 leídas
  como la misma plataforma) es el criterio de aceptación visual, no una vista aparte.
- **Menú `[B]`:** exactamente 6 ítems persistentes (Inicio, 3 Módulos, Repaso de hoy, Mi Progreso)
  para Estudiante — nunca crece con el contenido del curso (resuelve 7±2, decisión de CC-06). Clic en
  un módulo expande sus unidades **en el propio Menú** (ver §1 — el flyout NO está diseñado, no se
  inventa un overlay para esto).
- **Borde de afordancia:** todo elemento con una interacción real lleva `border: 1px solid
  theme('colors.base.borde-fuerte')` (o su clase Tailwind equivalente) en estado normal, más un
  cambio de fondo/borde en `:hover` — es la traducción directa del borde de hover que se añadió en
  Figma esta semana (Parte A3, CC-08) para que "se note qué es clicable". No es opcional ni
  cosmético: sin él, la paridad con el prototipo verificado no existe.

---

## 6. Paso 3 — Orden de construcción

Seguir el mismo orden en que se construyó y se verificó en Figma — minimiza el riesgo de descubrir
tarde una inconsistencia de layout compartido:

1. `layouts/auth.vue` + `COMP-V00` (login) — sin esto nada más es alcanzable.
2. `layouts/student.vue` (zonas A/B/D/E) — una sola vez, todas las vistas de estudiante lo heredan.
3. `EST-V01` (Inicio) — primera vista real, valida que el layout funciona con datos.
4. `EST-V02` (Lección) — incluye el control de trazado (`◀ ▶`) con sus 2 estados navegables.
5. `EST-V03` (Ejercicio/Sandbox) con `layouts/workspace.vue` — **ver el bloqueo declarado en §7.1
   antes de cablear "Probar código".**
6. `EST-V04` (Tutor IA) como overlay/drawer global, nunca como ruta de página — igual que en Figma
   (`navigation: OVERLAY`, cierre con clic fuera o botón cerrar, nunca con "atrás" del navegador).
7. `EST-V05` (Repasos) y `EST-V06` (Mi Progreso).
8. `layouts/teacher.vue` + `DOC-V01`, `layouts/admin.vue` + `ADM-V02` — al final, para que los dos
   layouts de rol nuevos se validen contra los tokens y zonas ya probados en Estudiante, no al revés.

---

## 7. Paso 4 — Brechas verificadas contra el backend real (no tapar en silencio)

Estas son diferencias reales entre lo que el prototipo de Figma sugiere y lo que el backend expone
hoy — verificadas contra `src/` esta misma sesión, no supuestos:

### 7.1 "▶ Probar código" (EST-V03) no tiene endpoint propio

> **✅ RESUELTO del lado backend, 2026-09-09.** Se implementó la opción (a) de abajo:
> `POST /submissions/:id/run` existe, reutiliza el sandbox real (`HardenedProcessSandboxAdapter` vía
> `JudgeExecutionService.runPublicCases()`), ejecuta solo casos `isPublic:true`, no crea intento, no
> modifica `attemptsCount` ni `status`, no dispara `submission.graded`. Verificado en vivo: 3 llamadas
> seguidas no mueven el contador; el caso oculto nunca aparece en la respuesta; un estudiante no puede
> ejecutar sobre la submission de otro (404); un docente/admin recibe 403. Contrato exacto en
> `12_CONTRATO_FRONTEND_BACKEND.md` (EST-V03, paso 1.5). **Lo que queda pendiente es del lado
> frontend** — ver §12: `runIsolatedCode()` en `stores/workspace.ts` todavía no llama a este endpoint.
> El razonamiento original de abajo (por qué hacía falta la opción (a) y no (b)) se conserva porque
> sigue siendo la justificación de la decisión, no un hueco abierto.

En Figma, este botón es una **acción libre que no consume intento** — descrita en la instrucción de
diseño como "la decisión de diseño más importante del producto". El backend real
(`src/submissions/submissions.controller.ts`) solo expone tres rutas: `POST /submissions/start`,
`PUT /submissions/:id/autosave`, `POST /submissions/:id/submit`. **No existe una ruta de "ejecutar
sin calificar".** Antigravity no debe simular un resultado falso de casos de prueba para tapar este
hueco. Opciones reales, a decidir por el equipo backend antes de cablear este botón contra datos
reales:
  - (a) Backend agrega un endpoint nuevo, p. ej. `POST /submissions/:id/run` (ejecuta en el mismo
    sandbox aislado, no persiste intento, no califica), o
  - (b) el botón queda visualmente presente y funcional en la UI pero deshabilitado/con aviso
    explícito "función pendiente de backend" hasta que (a) exista.
  Cualquiera de las dos es aceptable como estado intermedio; lo que **no** es aceptable es que el
  botón llame a `submit` disfrazado de "probar" — eso rompería la garantía que el propio diseño
  protege (una prueba no debe consumir un intento real).

### 7.2 Cuatro rutas de estudiante sin control de rol

> **✅ RESUELTO, 2026-09-09.** Las 4 rutas listadas abajo, más `POST /submissions/:id/run` (§7.1),
> tienen `@Roles('estudiante')`. Verificado en vivo: docente y admin autenticados reciben `403` en
> las 4; estudiante no perdió acceso. Ya hay una segunda barrera real del lado servidor — el
> razonamiento de abajo explica por qué hacía falta, se conserva por eso, no porque siga abierto.

`POST /submissions/start`, `POST /submissions/:id/submit`, `PUT /submissions/:id/autosave`,
`POST /tutor/chat` no tienen `@Roles` a nivel de servicio (`13_BACKLOG_FUNCIONAL.md` §6, ya
registrado como riesgo en la bitácora). No es un problema de frontend, pero Antigravity no debe
asumir que el backend ya filtra esto — si construye una vista de Docente/Administrador que también
podría alcanzar estas rutas por error de navegación, no hay una segunda barrera del lado servidor
todavía.

### 7.3 Vistas de Docente/Administrador con backend incompleto

`ADM-V01` y `ADM-V03` no tienen endpoints reales (solo existe `POST /maintenance/cleanup`) — pero
como están fuera de este plan (§1), esto no bloquea nada esta semana. Se deja registrado para que no
se redescubra desde cero cuando llegue su turno.

> **Actualización 2026-09-09/10:** sigue sin haber endpoints reales para estas vistas — nada cambió
> del lado backend aquí. Lo que sí cambió es que las 9 ventanas de Docente/Administrador ya existen
> completas en Figma (ver nota en §1); cuando llegue su turno, ese es el punto de partida visual, no
> hay que rediseñar nada.

---

## 8. Paso 5 — Paridad de interacción (traducción de las 38 conexiones de Figma)

No es necesario reproducir el grafo completo de reacciones de Figma — Vue Router ya resuelve la
navegación entre páginas. Lo que sí debe verificarse uno a uno, porque cada uno codifica una decisión
de producto real, no solo un `<NuxtLink>` genérico:

| Interacción (origen) | Comportamiento esperado |
|---|---|
| `EST-V03` "▶ Probar código" | Ejecuta sin navegar, sin consumir intento, sin pasar por `submit` (ver §7.1) |
| `EST-V04` overlay Tutor IA | Se abre como drawer/modal superpuesto, nunca como ruta propia; clic fuera **y** botón cerrar cierran igual |
| `EST-V02` control de trazado `◀ ▶` | Cambia de estado/paso dentro de la MISMA vista, no navega a otra ruta |
| Menú lateral `[B]`, cualquier vista de Estudiante | Inicio / Repasos / Mi Progreso siempre alcanzables en 1 clic, sin excepción por vista |
| Toda tarjeta con métrica de riesgo (ej. "unidad más débil", alertas de docente) | Navega directo al recurso referenciado, no a un dashboard genérico |
| Todo elemento con interacción | Tiene el borde de afordancia + estado `:hover` (§5) — verificar visualmente, no solo funcionalmente |

**Ruta máxima aceptada:** 3 clics desde el login a cualquier estado; 2 clics a contenido formativo
real (`EST-V02`/`EST-V03`) — es la métrica que ya se verificó en Figma esta semana y la que debe
seguir siendo cierta en la app real.

---

## 9. Qué NO incluye este plan

- No incluye escribir el código Vue/Nuxt en sí — eso es el trabajo de Antigravity a partir de aquí.
- No rediseña ninguna vista ni propone un token o color nuevo — todo sale de lo ya verificado en
  Figma y en `src/` real.
- No cambia el backend — la decisión de `POST /submissions/:id/run` (§7.1) es una recomendación, no
  una implementación; la ejecuta quien corresponda cuando se decida.
- No corre `npm run verify:clean` todavía — no aplica hasta que exista código de `frontend-nuxt/`
  que arrancar. Cuando exista, la Regla de Oro del proyecto (`CLAUDE.md`) aplica igual que al
  backend: build + test tras cada bloque, contador de errores no creciente.

---

## 10. Criterio de cierre de esta fase

- `frontend-nuxt/` existe, con `npm run build` (o el equivalente Nuxt) pasando.
- Cada vista del alcance (§1) tiene una captura de pantalla real de la app corriendo, comparada
  lado a lado contra su frame de Figma — no basta con que compile.
- `grep` de valores hex/`px` literales fuera de `tailwind.config.ts` en `frontend-nuxt/` devuelve
  vacío.
- El punto §7.1 tiene una decisión tomada (a o b), no queda abierto en silencio.
- Los 38 puntos de interacción de §8 se probaron uno por uno, no solo los que "se ven".

---

## 11. Verificación en frío de este criterio de cierre (2026-09-09)

Antigravity ya construyó `frontend-nuxt/` (ver `docs/antigravity/informes/INFORME_2026-09-07_SESION_01.md`
y la Bitácora N.º 4). Antes de declarar cerrada esta fase se volvió a comprobar cada punto de §10
contra el código real y contra el archivo Figma real — no se acepta el informe de Antigravity como
evidencia por sí solo, sección 7 del `CLAUDE.md` del proyecto lo exige.

### 11.1 Reconciliación de tokens (Figma ← código) — HECHO

`tailwind.config.ts` divergía de las 6 colecciones de variables de Figma en 9 valores que no
existían del lado de diseño: la paleta `editor.*` (7 colores del panel de código en `EST-V03`, sin
equivalente diseñado — Figma nunca maquetó el editor Monaco en detalle) y dos anchos con nombre,
`spacing.sidebar` (260px, ya documentado como ancho de `[B]` en `3.3_VENTANA_ESTANDAR.md` pero nunca
capturado como variable) y `spacing.drawer` (400px, el drawer del Tutor IA). El resto — 20 colores,
13 variables de tipografía, 8 de espaciado, 5 de radio, 3 de borde — coincide exactamente, verificado
valor por valor, no por muestreo.

Se agregaron las 9 variables faltantes a las colecciones `Color` y `Espacio` del archivo Figma real
(`color/editor/bg·header·border·line·text·muted·status`, `espacio/sidebar`, `espacio/drawer`), con
`description` explicando su origen (portadas desde `frontend-nuxt/tailwind.config.ts`, sin diseño
Figma previo). Verificado por conteo: colección `Color` 20→27 variables, `Espacio` 10→12.

### 11.2 Los otros cuatro criterios de §10 — NO se cumplen todavía, declarado sin maquillar

- **Capturas lado a lado por vista contra Figma:** no se hicieron. Solo se verificaron
  funcionalmente 3 de 9 ventanas (login, sandbox, tutor — ver Bitácora N.º 4).
- **`grep` de hex/px literal fuera de `tailwind.config.ts`:** **falla.** Hoy existen en
  `frontend-nuxt/pages/estudiante/evaluacion/[activityId].vue` y
  `frontend-nuxt/pages/estudiante/unidad/[id].vue`. Una parte (`#1e1e1e`, `#252526`, `#333333`,
  `#d4d4d4`, `#858585`, `#007acc`) ya tiene token equivalente desde §11.1 y solo falta reemplazar la
  clase arbitraria de Tailwind (`bg-[#1e1e1e]` → `bg-editor-bg`, etc.) — no se hizo aquí porque
  implica editar `frontend-nuxt/`, fuera del alcance que se acordó para este cierre (Figma + MODESEC,
  no código de Antigravity). El resto (≈10 colores de resaltado de sintaxis: `#4ec9b0`, `#f14c4c`,
  `#dcdcaa`, `#9cdcfe`, `#f97583`, `#b392f0`, `#79b8ff`, `#24292e`, `#5a5a5a`, `#2d2d2d`, `#264f78`)
  no tiene token ni equivalente en Figma — es una paleta de resaltado de sintaxis de código de
  ejemplo, un dominio de diseño distinto al de la UI de producto. No se propone tokenizarla ahora:
  sería sobre-ingeniería para un bloque de código estático de un solo lugar. Queda como excepción
  aceptada, no como pendiente oculto.
- **§7.1 con decisión (a) o (b) tomada:** **no exactamente ninguna de las dos.** Antigravity
  implementó una tercera vía no prevista: `runIsolatedCode()` en `frontend-nuxt/stores/workspace.ts`
  ejecuta el código del estudiante con `new Function(...)` **en el propio navegador**, no contra el
  sandbox aislado del backend (`HardenedProcessSandboxAdapter`) — cumple la restricción real
  ("no consume intento, no llama a `submit`"), pero no es lo que el comentario del propio código dice
  ("sandbox aislado"): es evaluación JS directa en el cliente, sin aislamiento de proceso. Además los
  casos de prueba y el nombre de función esperado (`sumarPares`) están hardcodeados — solo funciona
  para un ejercicio, no para cualquier `activityId`. Esto no bloquea la demo de la sustentación (no
  rompe la garantía de "no consumir intento"), pero **no** es la opción (a) del backend real ni la
  opción (b) de botón deshabilitado — es una tercera decisión de facto que el equipo no tomó
  explícitamente y que no escala a contenido real. Queda registrado para decidir antes de sembrar las
  8 unidades de aprendizaje pendientes.
- **38 puntos de interacción probados uno por uno:** no, solo los 3 ya verificados (login real,
  submit real, tutor real).

### 11.3 Qué queda cerrado y qué no

**Cerrado:** la reconciliación de tokens de diseño entre Figma y el código real — el sistema de
variables vuelve a ser la fuente completa y única, sin drift. **No cerrado:** el resto de los
criterios de §10 — se mantienen como trabajo pendiente de Antigravity/equipo, no de esta fase
documental. Esta sección no declara la Fase de Figma "terminada"; declara con precisión qué parte de
ella sí lo está.

---

## 12. Fase siguiente — alcance real para la próxima sesión de Antigravity (2026-09-10)

Entre el 09 y el 10 de septiembre, una sesión de Claude Code cerró los dos bloqueos de backend de
§7.1/§7.2 y corrigió la autenticación. Esta sección verifica en frío qué de eso cambia el trabajo
pendiente de Antigravity, más lo que se encontró de nuevo al releer `frontend-nuxt/` completo —
contra el código real, línea por línea, no contra lo que este documento o el informe de Antigravity
decían.

### 12.1 Qué se desbloqueó

- `POST /submissions/:id/run` y las 4 rutas con `@Roles('estudiante')` — ver §7.1/§7.2 arriba.
- `GET /review-schedules/due` existe (no estaba en el alcance original de este plan, pero
  `stores/student.ts` lo necesita — ver §12.3).
- El acceso-demo (botones de login.vue, selector de HeaderNav.vue) ya está gateado y hace login real
  — **Antigravity no debe tocar `pages/auth/login.vue` ni `components/layout/HeaderNav.vue` para
  esto, ya está cerrado.**

### 12.2 Hallazgo nuevo, no buscado en el cierre original: `workspace.ts` tiene su propio "fallo
disfrazado de éxito"

`submitSolution()` (`stores/workspace.ts`, función completa) hace `$fetch` crudo (no usa
`composables/useApi.ts`, que ya existe y ya centraliza el header de autorización) contra
`/submissions/start` y `/submissions/:id/submit`, y **si esa llamada real falla, cae en un fallback
local que fabrica una calificación de 100/100** y la muestra como si el backend la hubiera dado.
`triggerAutosave()` tiene el mismo patrón de `$fetch` crudo (silencioso en error, sin fabricar datos
ahí). Es el mismo defecto que se eliminó de `stores/auth.ts` el 09/09 (login falso en vez de error
real) — aquí sigue vivo. Corregirlo es parte del alcance de abajo.

### 12.3 Alcance de la próxima sesión

**Fase A — "Probar código" real.** Reemplazar `new Function(...)` en `runIsolatedCode()` por una
llamada real a `POST /submissions/:id/run` vía `useApi()`. Deja de estar hardcodeado a `sumarPares`
— funciona para cualquier `activityId` con pregunta CODING.

**Fase B — Eliminar el fallback falso de `submitSolution()`/`triggerAutosave()`.** Migrar ambas a
`useApi()` (mismo patrón que ya usa el resto del código nuevo). Un fallo real de red o de backend se
muestra como error real al estudiante — nunca como una calificación de 100/100 inventada. Esto es
directamente análogo a lo que se hizo en `auth.ts` el 09/09; mismo criterio, mismo motivo.

**Fase C — Conectar `stores/student.ts` a datos reales.** Sigue 100% mock (`modules`, `reviews`,
`analytics` son `ref()` estáticos). Reemplazar con `useApi()` contra los endpoints reales de
`12_CONTRATO_FRONTEND_BACKEND.md` para Inicio/Mi Progreso, más `GET /review-schedules/due` (nuevo,
contrato en `07_REPETICION_ESPACIADA.md` §5) para Repasos. Donde no haya contenido sembrado, mostrar
datos de ejemplo **rotulados como tal** — nunca disimulados como reales.

**Fase D — Registro real.** No existe `pages/auth/register.vue` ni existía el frame en Figma hasta
esta semana. Claude Code ya construyó `COMP-V00 · Registro — Por defecto` en Figma (mismo layout y
tokens que Login), cableado Login↔Registro y Registro→`EST-V01` en éxito. Implementar la página
contra `POST /auth/register` (ya funciona: password hasheado, rol `estudiante` por defecto,
verificado en vivo) usando `useApi()`.

**Explícitamente fuera de esta sesión:** el gateo de acceso-demo (§12.1, ya cerrado), y las vistas de
Docente/Administrador (§1, §7.3 — siguen fuera por prioridad, no por falta de diseño).

### 12.4 Criterio de cierre de esta fase

- Las 4 fases anteriores, cada una con verificación en navegador real (Browser Subagent), no solo
  compilación.
- `grep` de `useApi` en `stores/workspace.ts` y `stores/student.ts` deja de devolver vacío.
- Ningún camino de error en `workspace.ts` fabrica un resultado exitoso — un `network offline`
  forzado debe mostrar un error real en la UI, no una calificación.
- Informe de sesión nuevo en `docs/antigravity/informes/`, siguiendo `TEMPLATE_INFORME.md`, con fila
  agregada al índice de `docs/antigravity/README.md`.
