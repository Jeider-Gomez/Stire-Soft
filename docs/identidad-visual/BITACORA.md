# Bitácora de cambios visuales

Aquí anota José **cada cambio que hace**, en una línea por cambio. Sirve para tres cosas: que el resto del
equipo sepa qué se tocó y por qué, que se pueda **volver atrás con precisión** (cada fila apunta a su commit)
y que no haya conflictos con quien trabaja en lo funcional.

Es un archivo **solo de José**. Así no choca con `MONITOREO_SEMANAL.md`, que edita todo el equipo. Al cerrar la
semana, quien lleva la bitácora general copia de aquí un resumen de tres líneas.

## Cómo se usa

1. Al **empezar** una rama o una pantalla: agrega la fila en «Cambios» con estado `en curso` y anota los
   archivos en «Archivos en obra».
2. Al **terminar** (commit hecho): completa el commit y cambia el estado a `listo para revisar`.
3. Cuando el dueño del proyecto lo apruebe (o lo pida revertir): estado `aprobado` o `revertido`, con la fecha.
4. Al unir la rama a `main`, quita sus archivos de «Archivos en obra».

Estados: `en curso` · `listo para revisar` · `aprobado` · `revertido`.

## Archivos en obra

Lo que José está reestilando ahora mismo. **Quien vaya a hacer un cambio funcional en uno de estos archivos
avisa primero** (o lo hace en una rama corta y lo une antes de que José avance); así los dos trabajos no
editan las mismas líneas. Ver «Trabajar en paralelo» en el [`README`](./README.md) §6.

| Archivo | Quién | Desde | Rama |
|---|---|---|---|
| _(ninguno por ahora)_ | | | |

## Cambios

| Fecha | Rama | Commit | Qué cambió | Pantallas | Por qué | Estado |
|---|---|---|---|---|---|---|
| 21/09 | `main` (directo) | `7e9f314` | Paleta `stire-*` en `tailwind.config.ts`; encabezado (`HeaderNav.vue`, con botón «Tutor IA» y menú de usuario) y panel docente `DOC-V01` | Encabezado de todos los roles; `/docente` | Primer avance de la identidad institucional | `listo para revisar` (observaciones en el README §5; el dueño indicó que algunos cambios en la parte del Tutor no le gustaron, probablemente el botón «Tutor IA» del encabezado: por confirmar) |
| 23/09 | `main` (dueño, funcional) | _(ver commit «menu lateral movil»)_ | **Cambio funcional en archivos de tu territorio, para que lo tengas al hacer `git merge origin/main`:** los tres `layouts/*.vue` ahora usan `composables/useMobileSidebar.ts` (menú lateral como cajón en pantallas < 768 px, con fondo, Escape y cierre al navegar); `FooterBar.vue` se parte en dos líneas en móvil; en `HeaderNav.vue` el botón «Tutor IA» queda visible en móvil (solo el icono). No se tocaron colores ni tokens. | Todos los roles en móvil | El menú del estudiante ocupaba ~60 % de un celular de 375 px y la pantalla se desbordaba | `aprobado` (hecho por el dueño; conserva el cajón al rediseñar) |
| 23/09 | `main` (dueño, despliegue) | _(ver commit «frontend estatico»)_ | `nuxt.config.ts`: `ssr: false` (la app pasa a sitio estático); nuevos `public/_redirects` y `vercel.json`. **Consecuencia para ti:** sin SSR el HTML llega vacío hasta que carga el JavaScript, así que evita depender de contenido renderizado en servidor; los estilos no cambian. Ninguna pantalla se tocó. | Todas (solo cómo se publica) | Alojarlo gratis en Cloudflare Pages/Vercel sin funciones de servidor | `aprobado` |
| 28/09 | `feat/identidad-prototipo-jose` (dueño, con Claude Code) | _(ver commit «identidad: prototipo de José»)_ | **Se llevó a la app lo mejor del prototipo `JoseTheGoat90/STIRE-FRONEND`** (React), por pedido del dueño: fondo animado con los tres resplandores y la retícula (`components/layout/FondoTecnologico.vue`, solo CSS); distintivo «ST» con degradado que cambia a escudo al escribir la clave (`MarcaST.vue`); login y registro con la tarjeta de línea tricolor, íconos en los campos, ver la clave, aviso de Bloq Mayús, medidor de fuerza con los colores de la marca y botón turquesa con barrido de luz; Tutor con cabecera azul→morado, robot, burbujas y «escribiendo» con los tres puntos; editor de código con fondo pizarra y la sintaxis del prototipo. **Tokens:** `base-*`, `acento-*`, `semantico-*`, `estado-unidad-*`, `urgencia-repaso-*` y `editor-*` de `tailwind.config.ts` pasan a la paleta de la guía (antes `main.css` los reasignaba uno por uno y los `hover:` y las transparencias seguían en ámbar). Todos los textos pasan AA; el turquesa lleva texto azul noche, nunca blanco. Con «reducir movimiento» no hay animaciones. **No se trajo** la tarjeta oscura ni el selector de paleta del prototipo (son de demostración). | Autenticación, Tutor, editor, colores de toda la app | Que el proyecto se vea como la propuesta de José | `aprobado` por el dueño el 28/09 tras verlo en la vista previa de Vercel; unido a `main` (`85ed8b6`). José: si algo no quedó como lo imaginaste, propón el ajuste en una rama |
| 04/10 | `main` (dueño, con Claude Code) | _(ver commit «tema oscuro y preferencias de lectura»)_ | **Cambio en tu territorio, autorizado por el dueño («si eso no está hecho, comienza a trabajar»):** los tokens semánticos de `tailwind.config.ts` (`base-*`, `acento-*`, `semantico-*`, `estado-unidad-*`, `urgencia-repaso-*`, `stire-canvas`) ahora leen variables CSS del nuevo `assets/css/temas.css`, que define el tema claro (con **exactamente los mismos valores de antes**), el oscuro, el del sistema y el alto contraste. Los tamaños de letra pasan de px a rem (mismos tamaños). En `main.css`, `bg-white`/`border-slate-200`/`text-slate-800` de las clases de componentes pasan a sus tokens equivalentes. **Para ti:** para cambiar un color de la paleta, cambia su variable en `temas.css` (en claro y en oscuro). | Todas (solo con tema oscuro, alto contraste o texto grande) | MOB-03 (modo oscuro) e inclusividad; docs/DISENO_APARIENCIA.md | `aprobado` por el dueño |
| 07/10 | `main` (dueño, con Claude Code) | _(ver commit «apariencia: alto contraste de verdad»)_ | **Cambio en tu territorio (`temas.css`), pedido por el dueño («el contraste todavía no está listo»):** el alto contraste ahora cambia de verdad (texto casi negro o blanco, bordes marcados, enlaces subrayados, foco de 3 px) en claro y en oscuro; «Como mi dispositivo» ya no repite el tema oscuro en el CSS; se respetan los «Temas de contraste» de Windows (`forced-colors`). **Único cambio en el tema claro normal:** `--c-base-texto-secundario` pasa de slate-500 a slate-600, porque daba 4,3 a 1 sobre los fondos grises. | Todas | MOB-03 e inclusividad; docs/DISENO_APARIENCIA.md §4 bis | `aprobado` por el dueño |
| 07/10 (tarde) | `main` (dueño, con Claude Code) | _(ver commit «temas de contraste como los de Windows»)_ | **Cambio en tu territorio (`temas.css`), pedido por el dueño tras comparar con Windows:** cuatro temas de contraste (Acuático, Desierto, Anochecer y Cielo nocturno) que reducen toda la interfaz a la paleta de Windows; los colores fijos (`text-slate-*`, `bg-stire-*`, `text-[#…]`, `.gradient-stire`, el editor) se reemplazan solo con un tema de contraste activo. **El tema claro y el oscuro no cambian.** Si agregas colores fijos nuevos, la prueba con los temas los detecta. | Todas (solo con un tema de contraste) | MOB-03 e inclusión; docs/calidad/auditorias/ACCESIBILIDAD_E_INCLUSION_2026-10-07.md | `aprobado` por el dueño |
| | | | | | | |

### Modelo para una fila nueva

```
| 22/09 | feat/identidad-tokens | a1b2c3d | Fondo y texto de la página con la paleta nueva | todas | Base de la etapa 1 | en curso |
```

Un commit por pantalla o componente, con el nombre de la pieza en el mensaje (`feat(identidad): panel del Tutor`),
para que cada fila de esta tabla tenga **su propio commit** y se pueda deshacer sola:

```bash
git checkout <commit-anterior> -- ruta/del/archivo.vue    # recupera solo ese archivo
git revert <commit>                                       # o cancela el commit entero
```
