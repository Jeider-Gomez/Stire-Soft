# Identidad visual — guía de trabajo para José

Esta carpeta es tuya. Aquí está lo necesario para rediseñar la cara de STIRE **sin romper lo que ya
funciona**. No es un plan de implementación: las decisiones de diseño (colores, tipografías,
composición, sensación general) son tuyas. Esta guía solo fija **dónde puedes moverte con libertad,
qué debes dejar quieto y cómo entregar** para que nadie tenga que deshacer nada.

| Archivo | Para qué |
|---|---|
| **este README** | Reglas del juego: territorio, ramas, cómo probar y cómo entregar |
| [`01_PRIMEROS_PASOS.md`](./01_PRIMEROS_PASOS.md) | Lo que hay que decidir **antes de tocar código**, para que toda la página quede coherente |
| [`PROPUESTA_IDENTIDAD.md`](./PROPUESTA_IDENTIDAD.md) | Plantilla que llenas con tus decisiones. Es el insumo con el que se afina el resto |

Cómo se ve el sistema hoy (antes de tu cambio): [`../material-visual/00-primera-version/`](../material-visual/00-primera-version/)
(20 capturas de estudiante, docente, admin y Tutor). Está marcado en git con la etiqueta
`v1.0.0-beta.1`, así que siempre puedes volver a verlo.

---

## 1. Qué puedes hacer y qué no

Tienes libertad total sobre **cómo se ve**. Lo que no cambia es **lo que hace**.

### Libre — es tu territorio

| Qué | Dónde |
|---|---|
| Colores, tipografías, espaciados, radios, sombras | `frontend-nuxt/tailwind.config.ts` |
| Estilos globales, fuentes, utilidades | `frontend-nuxt/assets/css/main.css` |
| Logo, favicon, imágenes | `frontend-nuxt/public/` |
| La parte visible de cada pantalla: el bloque `<template>` (clases, estructura, iconos, disposición) | `frontend-nuxt/layouts/`, `components/`, `pages/` |
| Tu propuesta, referencias y capturas | `docs/identidad-visual/` |

### Con cuidado — avísale a Pedro antes

- **`nuxt.config.ts`**: mezcla marca (título, `<head>`) con configuración de conexión al backend. Toca solo lo de marca.
- **Dependencias nuevas** (`package.json` de `frontend-nuxt`): pregunta antes. Ya tienes instalado **`lucide-vue-next`** (iconos) y Tailwind 3; con eso se puede hacer casi todo.
- **Textos de la interfaz**: puedes mejorarlos, pero mantén el tuteo y el significado. Si cambia lo que un botón *hace* (no cómo se llama), es funcionalidad.

### No tocar — es funcionalidad

| Qué | Por qué |
|---|---|
| `src/`, `test/`, `scripts/`, `.env*`, migraciones | Es el backend y su verificación |
| El bloque `<script>` de cualquier `.vue`, y `stores/`, `composables/`, `middleware/`, `plugins/`, `types/`, `utils/` | Es la lógica: sesión, Tutor, calificación, permisos |
| Lo que hace cada botón y formulario: `v-if`, `v-for`, `v-model`, `@click`, `@submit`… | Quitar un `v-if` puede mostrarle al estudiante algo que no debe ver |
| `docs/PLAN_MAESTRO.md` y demás documentación fuera de esta carpeta | Solo la edita quien integra |

Si para tu diseño **necesitas** cambiar algo de esa lista (por ejemplo, un dato que hoy no llega a
la pantalla), no lo hagas tú: descríbelo en tu propuesta o avísale a Pedro y se resuelve aparte.
Eso es más rápido que arreglar una funcionalidad rota después.

### Cosas que parecen de estilo pero no lo son

Mantenlas aunque muevas todo lo demás:

- **`id`, `role`, `aria-label`** de los elementos (por ejemplo `id="email"`, `id="password"`, `role="dialog"`): las pruebas automáticas y los lectores de pantalla los usan.
- **Foco visible y navegación con teclado.** Si rediseñas los botones, el contorno de foco tiene que seguir viéndose (hay una utilidad `borde-afordancia-focus` en `main.css`).
- **El significado de los colores de estado.** Verde = correcto/aprobado, rojo = error/falla, y los cuatro estados de una unidad (dominado, en progreso, por iniciar, bloqueado) y los cuatro niveles de urgencia de un repaso deben seguir siendo **distinguibles entre sí**, y no solo por color.
- **Contraste mínimo 4.5:1** entre texto y fondo (WCAG AA). El estudiante lee código y explicaciones largas.

---

## 2. Ramas: solo las necesarias

Es un trabajo universitario: no hace falta más ceremonia que esta.

**Una rama por etapa, no una rama gigante.** Así Pedro puede aprobar por partes y `main` nunca queda
a medias.

| Etapa | Rama | Qué entra | Se aprueba mirando |
|---|---|---|---|
| 1. Tokens | `feat/identidad-tokens` | Solo `tailwind.config.ts`, `main.css`, `public/` | Que todo el sistema cambió de color/tipografía y **nada se ve roto** |
| 2. Componentes y layouts | `feat/identidad-componentes` | `layouts/` y `components/` | Barra lateral, cabecera, Tutor, ejercicios |
| 3. Páginas | `feat/identidad-paginas` | `pages/` | Estudiante, docente, admin, login |

Ciclo de cada etapa (los comandos completos están en [`../FLUJO_GIT.md`](../FLUJO_GIT.md)):

```bash
git checkout main && git pull
git checkout -b feat/identidad-tokens
# ...trabajar, guardar seguido...
git add <archivos> && git commit -m "feat(identidad): paleta y tipografia nuevas"
git push -u origin feat/identidad-tokens
```

Al terminar la etapa: **antes de abrir el Pull Request**, corre la verificación de territorio (abajo),
adjunta las capturas y abre el PR hacia `main`. Se une con **Squash and merge** y se borra la rama.
Si tardas más de un día en una etapa, trae lo nuevo con `git fetch origin && git merge origin/main`
para que no se acumulen diferencias.

Si prefieres **una sola rama** para todo, también sirve, con dos condiciones: `git merge origin/main`
cada día, y no la abras como Pull Request hasta que las tres etapas estén listas.

---

## 3. Cómo probar lo que haces

Necesitas el sistema corriendo (backend, base de datos y frontend). Los pasos están en el
[`README.md` raíz](../../README.md) (sección de arranque); para el día a día:

```bash
# En la raíz: backend con recarga automática (requiere la base de datos y el .env)
npm run start:dev

# En otra terminal: el frontend
cd frontend-nuxt
npm run dev            # http://localhost:3000
```

Cuentas de demostración (contraseñas en el README raíz): **estudiante** `pedro.estudiante@unicor.edu.co`,
**docente** `roberto.toscano@unicor.edu.co`, **administrador** `admin.sistema@unicor.edu.co`.

Si no logras levantar el backend, no pasa nada: avisa y alguien te lo deja corriendo. **No lo
modifiques para que arranque.**

### Antes de pedir la unión

1. **Verificación de territorio** — dice si te saliste de lo permitido:
   ```bash
   npm run check:identidad
   ```
   - `✖ FUERA de tu territorio`: hay archivos que no deberían ir en tu rama. Sácalos (`git restore <archivo>`) o pregunta.
   - `⚠ Para mirar`: no es un error. Te avisa si cambió el `<script>` de un `.vue`, si desapareció una directiva de comportamiento (`v-if`, `@click`…) o un `id`/`aria-label`. Casi siempre es porque reorganizaste algo; confírmalo con Pedro.
2. **Que compile:** `cd frontend-nuxt && npx nuxi typecheck` debe terminar sin errores.
3. **Recorrido rápido con las tres cuentas.** Abre, en cada rol, lo que sale en la lista de pantallas de [`01_PRIMEROS_PASOS.md`](./01_PRIMEROS_PASOS.md) §5, y mira **estos estados** en cada una (son los que casi siempre se olvidan): cargando, vacío, error, botón deshabilitado, foco con teclado (Tab) y ancho de teléfono (375 px).
4. **Capturas de antes y después** de las pantallas que cambiaste, en `docs/identidad-visual/capturas/etapa-N/` con nombres como `01_login_antes.png` / `01_login_despues.png`.

### Quién aprueba

- **Pedro** decide si el resultado le gusta (es el dueño del producto).
- **Claude Code** hace la revisión técnica del PR: territorio, que `typecheck` pase, que lo funcional siga funcionando en navegador real y que el contraste cumpla. Si algo funcional se rompe, se devuelve con el detalle exacto; no hace falta que lo descubras tú.

Si algo sale mal después de unir, se deshace con `git revert` del merge, y la versión original sigue
en la etiqueta `v1.0.0-beta.1`.

---

## 4. Cuando hay dudas

| Situación | Qué hacer |
|---|---|
| «Esto se vería mejor si el botón hiciera X» | Es una funcionalidad: anótala en tu propuesta, no la implementes |
| «Falta un dato en la pantalla para mi diseño» | Igual: anótala; se agrega en el backend aparte |
| «`check:identidad` me marca un archivo que no toqué» | Probablemente tu rama está desactualizada: `git fetch origin && git merge origin/main` y vuelve a correrlo |
| «Se ve roto y no sé por qué» | No sigas encima: `git stash` o `git restore .` y pregunta; con la etiqueta `v1.0.0-beta.1` se compara |
| «Quiero cambiar mucho más de lo previsto» | Perfecto en `<template>` y estilos; solo avisa si afecta el flujo (por ejemplo, mover el Tutor a otra pantalla) |
