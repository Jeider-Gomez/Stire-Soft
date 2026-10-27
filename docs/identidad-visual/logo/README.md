# Logo de STIRE

La pantalla con gafas: el logo y la mascota del Tutor son el mismo personaje. El logo es **fijo** (no se anima); la que
tiene vida es la mascota del Tutor dentro de la aplicación (`frontend-nuxt/components/tutor/Mascota.vue`).

Se generan con dos órdenes, desde la raíz del repositorio:

```bash
node scripts/identidad/generar-logos.js   # los SVG de esta carpeta
node scripts/identidad/exportar-png.js    # los PNG (necesita Google Chrome) y los íconos de frontend-nuxt/public
```

| Archivo | Para qué |
|---|---|
| `stire-logo.svg` / `png/stire-logo-*.png` | El logo completo, sobre fondo claro (1024, 512, 256, 128 px) |
| `stire-logo-sobre-oscuro.svg` | El mismo, separado del fondo oscuro |
| `stire-logo-nombre.svg` / `png/stire-logo-nombre-1200.png` | Logo con el nombre «stire_» (presentaciones, documentos) |
| `stire-logo-nombre-blanco.svg` | Con el nombre en blanco, para fondos de color |
| `stire-isotipo.svg` | Sin la tarjeta de atrás (botones, encabezados) |
| `stire-circular.svg` / `png/stire-circular-*.png` | Foto de perfil y recortes redondos (WhatsApp, Teams, Google) |
| `stire-favicon.svg` / `png/stire-favicon-*.png` | Dibujo simplificado para tamaños pequeños (pestaña, ícono de app) |
| `stire-un-color-oscuro.svg`, `stire-un-color-blanco.svg` | Un solo color, para impresos y sellos |
| `stire-alto-contraste.svg`, `stire-alto-contraste-oscuro.svg` | Alto contraste: pantalla negra, gafas amarillas |

Colores: morado `#7B2FBF` (marco y ojos), turquesa `#00C2A8` (gafas, punto de la i, cursor), azul pantalla `#082B6B`,
azul STIRE `#0B3D91` (nombre). El SVG del logo con nombre usa Inter Bold: si quien lo abre no tiene esa letra, usar el PNG.
