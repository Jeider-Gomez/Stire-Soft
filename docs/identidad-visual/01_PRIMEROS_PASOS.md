# Primeros pasos: decidir una vez, aplicar en todas partes

Antes de tocar una sola pantalla hay que fijar las decisiones que **tienen que ser iguales en todo
el sistema**. Si se deciden primero, el cambio de identidad es casi mecánico (se cambian en un
punto y todo lo demás las hereda). Si se dejan para el final, cada pantalla queda con su propio
criterio y hay que rehacerlas.

Lo que sigue es el orden recomendado. Los pasos 1 a 3 son de mirar y decidir, sin código. El
resultado va en [`PROPUESTA_IDENTIDAD.md`](./PROPUESTA_IDENTIDAD.md).

---

## 1. Conocer lo que hay (una hora, sin código)

- Abre las 20 capturas de [`../material-visual/00-primera-version/`](../material-visual/00-primera-version/). Son las tres áreas (estudiante, docente, administrador), el Tutor y el editor de código.
- Si puedes levantar el sistema, entra con las tres cuentas y recórrelo (ver el README de esta carpeta, §3).
- Apunta, por cada pantalla, **qué es igual en todas** (barra lateral, cabecera, tarjetas, botones, insignias) y **qué es propio** de esa pantalla. Lo primero es lo que hay que decidir; lo segundo se adapta después.

Cómo está hecho hoy, para que sepas con qué trabajas:

- **Todo el estilo sale de Tailwind y de un solo archivo de configuración**, `frontend-nuxt/tailwind.config.ts`. Los componentes casi siempre dicen `bg-acento-ambar` o `text-base-texto-primario`, es decir, usan el **nombre** del color y no su valor. Cambiar el valor en la configuración cambia todo el sistema.
- De 37 archivos `.vue`, **solo 4 tienen colores escritos a mano** (32 usos en total): la evaluación (`pages/estudiante/evaluacion/[activityId].vue`, 11), el panel de sistema (`pages/admin/sistema.vue`, 7), `components/exercise/FillCodeExercise.vue` (2) y `pages/docente/ejercicios/crear.vue` (1). Esos son los únicos que no seguirán a la paleta nueva hasta que se pasen a tokens (paso 5).
- **Los iconos son emojis** (🔑, 💡, 🧹…) en 28 de los 37 archivos. `lucide-vue-next` (iconos en SVG) ya está instalado pero **no se usa en ningún lado**.
- Las fuentes (Inter y JetBrains Mono) se cargan desde Google Fonts en la primera línea de `assets/css/main.css`.

---

## 2. Las decisiones globales (lo que debe ser coherente)

Cada fila es algo que, si se decide una vez, hace que todas las pantallas se vean de la misma familia.
«Dónde vive» es el único lugar que hay que tocar.

| # | Decisión | Qué hay que resolver | Dónde vive hoy |
|---|---|---|---|
| 1 | **Paleta base** | Fondo de página, fondo de tarjetas/paneles, bordes suaves y fuertes, texto principal y secundario, blanco | `colors.base` en `tailwind.config.ts` |
| 2 | **Color de acento** | El color de marca: botones principales, enlaces, foco, selección. Hoy es ámbar (`acento.ambar` y `acento.ambar-fuerte`) | `colors.acento` |
| 3 | **Colores de estado** | Correcto/aprobado, error/falla, información. **Verde y rojo conservan su significado** | `colors.semantico` |
| 4 | **Estados de unidad** | Cuatro estados que se tienen que distinguir entre sí de un vistazo: dominado, en progreso, por iniciar, bloqueado | `colors.estado-unidad` |
| 5 | **Urgencia de repaso** | Cuatro niveles: al día, mañana, vencido, crítico | `colors.urgencia-repaso` |
| 6 | **Editor de código** | El editor es oscuro (`#1E1E1E`) aunque el resto sea claro. Decide si se queda así, si sigue la nueva paleta o si cambia a tema claro | `colors.editor` |
| 7 | **Tipografías** | Una para interfaz y una para código. Tamaños (`xs` a `2xl`) y pesos | `fontFamily`, `fontSize`, `fontWeight` y el `@import` de `main.css` |
| 8 | **Espaciado y radios** | Cuánto aire hay entre elementos y qué tan redondeadas son las esquinas (`none`, `sm`, `md`, `lg`, `full`) | `spacing`, `borderRadius` |
| 9 | **Sombras y bordes** | Cuánta profundidad hay: planas o con relieve | `boxShadow`, `borderWidth`, y `.borde-afordancia` en `main.css` |
| 10 | **Iconografía** | ¿Emojis (como hoy), iconos SVG con `lucide-vue-next` (ya instalado) o mezcla? Una sola opción para todo el sistema | Cada `.vue` (se hace en la etapa 2) |
| 11 | **Marca** | Nombre visible («STIRE-Soft»), logo, favicon, título de pestaña | `public/favicon.ico`, `app.head` en `nuxt.config.ts`, `layouts/` |
| 12 | **Componentes base** | Cómo se ven, una sola vez: botón principal, secundario y peligro; campo de texto; tarjeta; insignia; alerta; diálogo; panel lateral (el Tutor) | Las clases repetidas en cada `.vue` (ver paso 4) |
| 13 | **Movimiento** | Duración de transiciones (hoy `duration-150`) y si se respeta «reducir movimiento» | `main.css` |
| 14 | **Tono de los textos** | Tuteo, cercanía, «Tutor IA», mayúsculas en botones | Los `<template>` |

**Reglas de coherencia que se aplican a todas las decisiones anteriores:**

- **Contraste 4.5:1** entre texto y su fondo (y 3:1 para bordes de campos y componentes). Se puede medir en cualquier verificador de contraste WCAG.
- **Nada depende solo del color.** Los cuatro estados de unidad y los cuatro niveles de urgencia deben diferenciarse también por forma, icono o texto, no solo por tono.
- **Foco visible** en todo lo que se puede pulsar o escribir.
- **Un solo criterio por cosa:** si un botón principal es sólido en una pantalla, es sólido en todas.

---

## 3. Entregar la propuesta (el insumo)

Llena [`PROPUESTA_IDENTIDAD.md`](./PROPUESTA_IDENTIDAD.md) con las 14 decisiones y agrega **tres
pantallas de muestra** (imágenes de Figma o del navegador, como prefieras):

1. **Login** (la cara del sistema).
2. **Inicio del estudiante** (barra lateral, tarjetas, progreso).
3. **Evaluación con el editor y el Tutor abierto** (la pantalla más compleja: editor oscuro, panel lateral, botones de ejercicio).

Con esa propuesta, Claude Code hace tres cosas antes de que escribas código, y te las devuelve:

1. **Revisa el contraste** de cada par texto/fondo y avisa de lo que no llega a 4.5:1.
2. **Traduce tu propuesta a los tokens** (`tailwind.config.ts`), señalando qué nombre de color de hoy corresponde a qué valor tuyo.
3. **Ajusta esta guía** con lo que tu propuesta necesite (por ejemplo, si quieres iconos SVG, se acuerda cuáles).

Así, cuando empiezas a programar, ya está resuelto qué va dónde y no hay sorpresas en la revisión.

---

## 4. Consejo práctico: primero los componentes base

Hoy las clases de un botón principal se escriben a mano en cada pantalla (por ejemplo
`bg-acento-ambar-fuerte text-base-blanco font-bold text-xs rounded-md`). Con la paleta por tokens ya
cambian de color solas, pero si además cambias la **forma** del botón (más redondo, con sombra,
más grande) habría que editarlo en decenas de sitios.

Una manera práctica de evitarlo, sin tocar nada de lógica: en la etapa 1 defines en `main.css`, dentro
de `@layer components`, unas pocas clases compartidas (`.btn-primario`, `.btn-secundario`, `.campo`,
`.tarjeta`, `.insignia`) y en la etapa 2 sustituyes las clases repetidas por ellas. **Es opcional**:
si tu diseño es solo un cambio de paleta y tipografía, no hace falta.

---

## 5. Las pantallas que tienes que ver antes de dar algo por terminado

Cada una en su versión con datos, vacía, cargando y con error. Si una no llega a verse (por ejemplo
el panel de administración necesita la cuenta de administrador), avísalo en el PR.

| Rol | Pantallas |
|---|---|
| **Sin sesión** | `/` (inicio), `/auth/login`, `/auth/register` |
| **Estudiante** | `/estudiante` (inicio), `/estudiante/clases`, `/estudiante/unidad/:id`, `/estudiante/evaluacion/:id` (con los cinco tipos de ejercicio), `/estudiante/progreso`, `/estudiante/repasos`, **el Tutor abierto** (con y sin clave de Google guardada) |
| **Docente** | `/docente`, `/docente/clase/:id` y su analítica, `/docente/contenidos`, `/docente/ejercicios/crear`, `/docente/estudiante/:id`, `/docente/mensajes`, `/docente/rendimiento`, y la configuración del Tutor por clase |
| **Administrador** | `/admin`, `/admin/dashboard`, `/admin/sistema` (con su diálogo de confirmación), `/admin/usuarios` |

Y, en todas: ancho de escritorio (1440 px) y de teléfono (375 px), y navegación solo con teclado (Tab).
