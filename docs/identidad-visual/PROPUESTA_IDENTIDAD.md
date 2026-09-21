---
estado: por llenar (plantilla)
autor: José
fuente: propuesta de diseño — insumo para afinar la guía de trabajo
---

# Propuesta de identidad visual

Llena una fila por decisión (ver la explicación de cada una en
[`01_PRIMEROS_PASOS.md`](./01_PRIMEROS_PASOS.md) §2). Donde dice «hoy» está lo que hay ahora, para
que compares; escribe tu valor al lado. Lo que no vayas a cambiar, márcalo «se queda».

## 1. Idea general

En dos o tres frases: qué sensación debe transmitir STIRE (¿cercana, seria, juguetona, técnica?) y por qué eso le sirve a un estudiante que aprende a programar.

> _…_

Referencias que te inspiran (enlaces o imágenes, opcional):

- _…_

## 2. Decisiones globales

### Color

| Token actual (`tailwind.config.ts`) | Valor hoy | Valor nuevo | Para qué se usa |
|---|---|---|---|
| `base.bg-primario` | `#F6F3EF` | | Fondo de la página |
| `base.bg-secundario` | `#EDE8E1` | | Fondo de paneles, cabeceras de tarjeta |
| `base.blanco` | `#FFFFFF` | | Tarjetas, campos |
| `base.borde-sutil` | `#C9C1B8` | | Divisores |
| `base.borde-fuerte` | `#998878` | | Bordes de campos y botones |
| `base.texto-primario` | `#2B2622` | | Texto principal |
| `base.texto-secundario` | `#6F6761` | | Texto de apoyo |
| `acento.ambar` | `#C87B1E` | | Acento de marca (fondos suaves, detalles) |
| `acento.ambar-fuerte` | `#A76719` | | Botón principal, enlaces, foco |
| `semantico.pasa` | `#2F7D4F` | | Correcto / aprobado |
| `semantico.falla` | `#B3261E` | | Error / falla |
| `semantico.info` | `#2B5D8A` | | Información |
| `estado-unidad.dominado` | `#2F7D4F` | | Unidad dominada |
| `estado-unidad.en-progreso` | `#A76719` | | Unidad en progreso |
| `estado-unidad.por-iniciar` | `#2B5D8A` | | Unidad por iniciar |
| `estado-unidad.bloqueado` | `#6F6761` | | Unidad bloqueada |
| `urgencia-repaso.al-dia` | `#2F7D4F` | | Repaso al día |
| `urgencia-repaso.manana` | `#A76719` | | Repaso para mañana |
| `urgencia-repaso.vencido` | `#A85A1E` | | Repaso vencido |
| `urgencia-repaso.critico` | `#B3261E` | | Repaso crítico |
| `editor.*` (fondo, cabecera, texto…) | oscuro (`#1E1E1E`) | | Editor de código |

**¿Cómo se distinguen los estados sin depender solo del color?** (forma, icono, texto):

> _…_

### Tipografía

| | Hoy | Nuevo |
|---|---|---|
| Interfaz | Inter | |
| Código | JetBrains Mono | |
| Escala (`xs` … `2xl`) | 12 / 14 / 16 / 18 / 20 / 24 / 32 px | |
| Pesos usados | 400 / 500 / 600 / 700 | |

### Forma y profundidad

| | Hoy | Nuevo |
|---|---|---|
| Radios (`sm` / `md` / `lg`) | 4 / 8 / 16 px | |
| Sombras (`sm` / `md` / `lg`) | suaves, tono cálido | |
| Borde de botones y campos | 1 px, `borde-fuerte`; al pasar el mouse cambia a acento | |
| Espaciado base | 4 / 8 / 16 / 24 / 32 / 48 / 64 px | |

### Iconos, marca y movimiento

| | Hoy | Nuevo |
|---|---|---|
| Iconos | Emojis (🔑 💡 🧹…) | |
| Nombre y logo | «STIRE-Soft», con una insignia de texto «ST» en lugar de logo | |
| Favicon | `favicon.ico` genérico | |
| Transiciones | 150 ms | |

### Componentes base (cómo se ven, una vez)

Describe o adjunta una imagen de cada uno. Si no cambia respecto a hoy, escribe «se queda».

| Componente | Descripción o imagen |
|---|---|
| Botón principal | |
| Botón secundario | |
| Botón peligroso (borrar, quitar) | |
| Campo de texto y su estado de error | |
| Tarjeta | |
| Insignia / etiqueta de estado | |
| Alerta / aviso (éxito, error, información) | |
| Diálogo de confirmación | |
| Panel lateral del Tutor | |
| Barra lateral y cabecera | |

### Tono de los textos

> _…_ (por ejemplo: tuteo, frases cortas, sin mayúsculas en botones…)

## 3. Pantallas de muestra

Adjunta o enlaza las tres (ver `01_PRIMEROS_PASOS.md` §3):

1. Login: _…_
2. Inicio del estudiante: _…_
3. Evaluación con editor y Tutor abierto: _…_

## 4. Cosas que tu diseño necesita y hoy no existen

Anota aquí, sin implementarlas, las que dependan de lógica o de datos que no están: un dato que hoy no llega a la pantalla, una pantalla nueva, un comportamiento distinto. Se resuelven aparte, con Pedro.

- _…_

## 5. Decisiones que quieres consultar

- _…_
