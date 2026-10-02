---
estado: vigente (2 de octubre de 2026, versión v1.0.0)
autor: José (propuesta y prototipo STIRE-FRONEND, 28/09) · consolidada por Claude Code a pedido de Jeider
fuente: la guía de identidad visual de referencia (paleta, tipografía y estilo) y los valores reales de frontend-nuxt/tailwind.config.ts
---

# Guía de identidad visual de STIRE

STIRE parte de una guía de identidad de referencia con estilo **minimalista, tecnológico, educativo, juvenil, de
bloques limpios y amigable**, inspirada en la interfaz de Microsoft MakeCode: bloques con esquinas redondeadas,
iconografía simple y alto contraste. Esta guía fija cómo se aplica a STIRE, que **no** es para niños: son
estudiantes universitarios que empiezan a programar y docentes. Por eso se conserva lo amigable y ordenado, pero
el tono es el de una herramienta de estudio, no el de un juego.

Esta guía describe **lo que ya está en la app** (los tokens de `frontend-nuxt/tailwind.config.ts`). Lo que aún no
cumple se lista en el §7 como pendiente, para no confundir lo hecho con lo deseado.

## 1. La idea en una frase

> Una herramienta clara y tranquila que acompaña al que empieza: azul que da confianza, morado para lo que el
> estudiante hace y turquesa para lo que sale bien o lo invita a seguir.

## 2. Paleta

### Los cuatro colores de la guía

| Color | Valor | Token en la app | Para qué se usa en STIRE |
|---|---|---|---|
| **Azul Tecnológico** (primario) | `#0B3D91` | `stire-blue`, `acento-ambar-fuerte` | Botón principal, enlaces, foco, encabezado de marca |
| **Morado Vibrante** (secundario) | `#7B2FBF` | `stire-purple` | Lo que el estudiante está haciendo: unidad en progreso, Tutor, repaso para mañana |
| **Turquesa Acción** (acento) | `#00C2A8` | `stire-teal` | Detalles, indicadores y fondos de logro; el estado del editor |
| **Gris Neutro** (fondo) | `#F7F9FC` | `stire-canvas`, `base.bg-primario` | Fondo de todas las páginas |

Apoyo: `stire-blue-dark #082A66` (hover del botón principal), `stire-purple-light #F3E8FF` (fondos suaves del
morado), `stire-teal-dark #009985`.

### Contraste: cómo se usa cada color (medido, WCAG AA pide 4.5:1 para texto)

| Combinación | Contraste | Uso |
|---|---|---|
| Azul `#0B3D91` sobre blanco | **10.0:1** | Texto, enlaces y botones con texto blanco: libre |
| Morado `#7B2FBF` sobre blanco | **7.0:1** | Texto y botones con texto blanco: libre |
| Turquesa `#00C2A8` sobre blanco (o blanco sobre turquesa) | **2.3:1** ✗ | **Nunca texto turquesa sobre blanco, ni texto blanco sobre turquesa.** Solo rellenos, iconos grandes, bordes y barras de avance |
| Texto oscuro `#0F172A` sobre turquesa | **7.9:1** | Si un botón o insignia va en turquesa, su texto va oscuro |
| Turquesa oscuro `#00705F` sobre blanco | **6.0:1** | Cuando el turquesa tiene que ser texto (p. ej. en el login) |
| Turquesa `#00C2A8` sobre el editor `#0F172A` | **7.9:1** | Libre dentro del editor de código |

La guía de referencia pone el turquesa en «llamadas a la acción». En STIRE **la acción principal va en azul**
(contraste 10:1) y el turquesa acompaña: así el botón más importante siempre se lee.

### Colores con significado (no se cambian sin revisar las pantallas que los usan)

| Significado | Valor | Contraste sobre blanco |
|---|---|---|
| Correcto / aprobado / dominado / repaso al día | `#047857` | 5.5:1 |
| Error / falla / repaso crítico | `#B91C1C` | 6.5:1 |
| Repaso vencido | `#B45309` | 5.0:1 |
| Unidad en progreso / repaso para mañana | `#7B2FBF` | 7.0:1 |
| Unidad por iniciar / información | `#0B3D91` | 10.0:1 |
| Unidad bloqueada / texto de apoyo | `#64748B` | 4.8:1 |

**Regla:** ningún estado se distingue solo por el color. Siempre lleva además un icono de lucide o una palabra
(«Dominada», «Bloqueada», «Vencido»), para quien no distingue colores y para el lector de pantalla.

### Neutros

| Token | Valor | Uso |
|---|---|---|
| `base.texto-primario` | `#1E293B` | Texto principal (13.9:1 sobre el fondo) |
| `base.texto-secundario` | `#64748B` | Texto de apoyo (4.5:1 sobre el fondo: el mínimo; no usarlo más claro) |
| `base.bg-secundario` | `#F1F5F9` | Cabeceras de tarjeta, paneles |
| `base.borde-sutil` / `base.borde-fuerte` | `#E2E8F0` / `#CBD5E1` | Divisores / bordes de campos |
| `editor.*` | fondo `#0F172A` | Editor de código oscuro, con palabras clave moradas |

## 3. Tipografía

| Rol | Fuente | Dónde |
|---|---|---|
| Encabezados | **Poppins** (`font-poppins`), 600–700 | Títulos de página, nombres de bloques, llamadas a la acción. Moderna y geométrica |
| Texto | **Inter** (`font-interfaz`), 400–600 | Párrafos, listas, formularios, notas. Muy legible en pantallas pequeñas |
| Código | **JetBrains Mono** (`font-codigo`) | Editor, fragmentos de código, códigos de clase |

La guía de referencia nombra Calibri como respaldo seguro; en la web el respaldo es `sans-serif` del sistema.

Escala: 12 · 14 · **16 (texto base)** · 18 · 20 · 24 · 32 px. El texto de lectura nunca baja de 14 px y las
explicaciones largas van en 16 px con interlineado amplio.

## 4. Forma, espacio y profundidad

- **Bloques limpios:** tarjetas blancas sobre el fondo gris neutro, borde sutil y esquinas redondeadas: 8 px en
  botones y campos, 12–16 px en tarjetas y diálogos.
- **Espaciado** en múltiplos de 4: 4 · 8 · 16 · 24 · 32 · 48 · 64 px.
- **Sombras** suaves, solo para separar capas (tarjeta, menú, diálogo); nunca como decoración.
- **Tocar con el dedo:** todo lo que se pulsa mide al menos 44 px de alto en el celular.

## 5. Iconos y marca

- **Iconos: solo `lucide-vue-next`.** Trazo simple y uniforme, como pide la guía. **Nada de emojis** en la
  interfaz: se ven distinto en cada teléfono y el lector de pantalla los lee mal.
- **Marca:** «STIRE Soft», insignia «ST» en degradado azul → morado, «Unicor · Ing. Sistemas» debajo.
- **Motivo de la cuadrícula de puntos** (azul con puntos turquesa): se puede usar como fondo de cabeceras o de la
  pantalla de inicio, nunca detrás de texto largo.

## 6. Tono de los textos

- Tuteo, frases cortas, verbos concretos: «Unirse», «Ejecutar», «Ampliar», «Entregar a tu docente».
- Decir qué pasó y qué hacer: «A la Decisión 5 le falta la flecha del «No».», no «Error de validación».
- Sin mayúsculas sostenidas en botones; las etiquetas pequeñas de sección (p. ej. «AGREGAR FIGURA») sí pueden ir
  en versalitas.
- No abrumar: lo primero que se ve es lo que hay que hacer ahora; el resto, plegado.

## 7. Pendiente (lo que la app todavía no cumple)

| Qué | Dónde | Por qué importa |
|---|---|---|
| Sombras con tono cálido heredado (`rgba(43,38,34,…)`) | `tailwind.config.ts`, `boxShadow` | Con la paleta fría deberían ir en tono pizarra (`rgba(15,23,42,…)`) |
| Algunas páginas aún tienen emojis (✓, ⚠, ⏳ en Administración; ✔ en «Mis clases») | `pages/admin/index.vue`, `pages/estudiante/clases.vue` | §5: solo iconos de lucide |
| Nombres de tokens viejos (`acento-ambar` guarda el azul) | `tailwind.config.ts` | Confunde al leer el código; renombrar cuando haya una ola de cambios visuales |
| Favicon genérico | `frontend-nuxt/public/` | La insignia «ST» como favicon |

Estos cambios son del territorio de José (README de esta carpeta): se hacen en su rama, con `npm run check:identidad`.

## 8. Cómo se comprueba

- Capturas de todas las pantallas de la versión vigente: [`../material-visual/vistas/`](../material-visual/vistas/).
- Antes de un Pull Request de diseño: `npm run check:identidad` y el recorrido de capturas (sin errores de consola,
  sin desborde a lo ancho, 375 y 1440 px).
