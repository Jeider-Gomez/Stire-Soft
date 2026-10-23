---
version: alpha
name: STIRE
description: Sistema tutor inteligente para aprender algoritmia y programación. Interfaz sobria, legible y accesible, en español, para estudiantes y docentes de la Universidad de Córdoba.
colors:
  primary: "#0B3D91"
  primary-hover: "#082A66"
  secondary: "#7B2FBF"
  tertiary: "#00C2A8"
  tertiary-dark: "#009985"
  neutral: "#F7F9FC"
  surface: "#FFFFFF"
  surface-muted: "#F1F5F9"
  border: "#E2E8F0"
  border-strong: "#CBD5E1"
  text: "#1E293B"
  text-muted: "#475569"
  success: "#047857"
  danger: "#B91C1C"
  warning: "#B45309"
  editor-bg: "#0F172A"
  editor-text: "#E2E8F0"
  dark-canvas: "#0B1220"
  dark-surface: "#131C2E"
  dark-text: "#E6ECF5"
  dark-primary: "#93C5FD"
typography:
  display:
    fontFamily: Poppins
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: Poppins
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.3
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  sidebar: 260px
  drawer: 400px
  touch-target: 44px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 8px 16px
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 8px 16px
    height: 44px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: 24px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 10px 12px
    height: 44px
  badge-docente:
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
  badge-estudiante:
    textColor: "{colors.tertiary-dark}"
    rounded: "{rounded.full}"
  code-editor:
    backgroundColor: "{colors.editor-bg}"
    textColor: "{colors.editor-text}"
    typography: "{typography.code}"
    rounded: "{rounded.lg}"
---

# STIRE — Sistema de diseño

> Fuente de verdad visual para las personas y para los agentes de IA que tocan la interfaz. Se lee junto con
> `PRODUCT.md` (quién usa STIRE y por qué) y `docs/identidad-visual/` (la identidad de José). Los valores salen de
> `frontend-nuxt/tailwind.config.ts` y `frontend-nuxt/assets/css/temas.css`; si el código cambia, este archivo cambia
> en el mismo commit.

## Overview

STIRE enseña a programar a personas de 18 años o más y le dice al docente a quién ayudar. La interfaz es una
**herramienta de trabajo**, no una página de venta: tiene que verse tranquila, ordenada y confiable, y dejar que el
contenido (la explicación, el ejercicio, el código) sea lo más importante de la pantalla.

Personalidad: sobria, cercana y clara. Habla en segunda persona, con frases cortas y sin jerga técnica; los botones
dicen lo que hacen («Cerrar la asistencia», no «Aceptar»). El color se usa con medida: un azul institucional para la
acción principal y colores de estado que significan algo (dominado, vencido, falla).

**Dirección vigente (decidida el 23/10/2026, en ejecución):** el panel del docente se rediseña con una gramática
«tipo Apple»: una sola barra lateral como índice, títulos grandes, una acción principal por pantalla, hojas que suben
desde abajo en vez de ventanas encima de ventanas, translucidez solo en la barra lateral y la barra de herramientas, y
movimiento corto que explica de dónde viene cada cosa. Detalle y fases en `docs/PLAN_REDISENO_DOCENTE.md`. El panel
del estudiante no se rediseña todavía: lo que sigue describe el sistema actual, que los dos paneles comparten.

## Colors

La paleta es la de la identidad de José: azules tecnológicos sobre blancos fríos, con un morado y un verde azulado
como acentos de rol.

- **Primary (#0B3D91):** azul institucional. Botón principal, enlaces y foco. Su tono de hover es #082A66.
- **Secondary (#7B2FBF):** morado. Identifica al docente (insignia) y el estado «en progreso» de una unidad.
- **Tertiary (#00C2A8, texto #009985):** verde azulado. Identifica al estudiante y el estado de éxito del editor.
- **Neutral (#F7F9FC):** fondo de la página. Las tarjetas son blancas (#FFFFFF) sobre él; #F1F5F9 separa zonas dentro
  de una tarjeta.
- **Texto:** #1E293B (principal) y #475569 (secundario). Ambos pasan WCAG AA (4.5:1) sobre blanco y sobre el fondo.
- **Estado:** éxito #047857, falla #B91C1C, advertencia o repaso vencido #B45309. El color nunca va solo: siempre lo
  acompaña un icono o un texto.

**Temas.** Todo color se lee de variables CSS (`--c-*` en `temas.css`), así que las pantallas no cambian de código:
- *Claro* (por defecto), con los valores de arriba.
- *Oscuro*: lienzo #0B1220, tarjetas #131C2E, texto #E6ECF5, y el azul de acento se aclara a #93C5FD.
- *Alto contraste* y los temas de contraste como los de Windows. Cualquier rediseño debe sobrevivir a los cuatro.

Los colores del editor de código (#0F172A, texto #E2E8F0) son fijos: el editor es siempre oscuro.

## Typography

- **Inter** para la interfaz y los párrafos. Sin ligaduras (`calt` apagado): quien aprende debe ver `<-` y `>=` tal
  como los escribe.
- **Poppins** (600 y 700) solo para títulos grandes.
- **JetBrains Mono** para código, sin ligaduras (`===` no se convierte en `≡`).
- Los tamaños están en `rem`, no en `px`, porque la preferencia «Texto grande» los escala. Escala: 12, 14, 16, 18, 20,
  24 y 32 px con el tamaño normal. El cuerpo es de 16 px con interlineado 1,6.
- Los pesos se llaman `regular`, `medio`, `semibold` y `bold`.

## Layout

Cuadrícula de 8 px con medio paso de 4 px (`xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 48, `3xl` 64). La barra
lateral mide 260 px y el cajón lateral 400 px. Las tarjetas llevan 24 px de relleno.

Todo objetivo táctil mide **al menos 44 px**. Se usa en celular y en computador, en salón y en casa, con conexión
regular: nada debe depender del hover ni de un ancho de pantalla grande.

## Elevation & Depth

La profundidad es discreta: sombras suaves que solo suben un poco al pasar el cursor (`sm`, `md`, `lg`) y bordes de 1 px
(`border` #E2E8F0, `border-strong` #CBD5E1) para separar. En el rediseño del docente, las sombras quedan solo para
capas que flotan (hojas, menús, el asistente) y la translucidez solo para la barra lateral y la barra de herramientas.

## Shapes

Esquinas redondeadas: botones e inputs de 12 px, tarjetas de 16 px, insignias circulares (`full`). El rediseño del
docente usa 10 a 12 px en filas y controles y 16 px en tarjetas.

## Components

- **Botón primario:** azul institucional, texto blanco, 44 px de alto, 12 px de radio. Uno solo por pantalla.
- **Botón secundario:** fondo blanco, borde fino, texto principal.
- **Tarjeta:** blanca, 16 px de radio, borde fino y sombra `sm`.
- **Input:** 44 px de alto, borde fino; al enfocarse, borde azul y anillo azul suave de 2 px.
- **Insignias de rol:** docente en morado, estudiante en verde azulado, admin en azul. Redondas.
- **Editor de código:** fondo pizarra, texto claro, tipografía mono sin ligaduras.

## Motion

- Duración de 150 a 250 ms. Salidas más rápidas que entradas. Nada en la interfaz pasa de 300 ms.
- Curva de entrada ya usada en el proyecto: `cubic-bezier(0.16, 1, 0.3, 1)`. Sin `ease-in`, sin escalas desde 0.
- Se anima solo `transform` y `opacity`. Cada movimiento explica algo: de dónde viene la hoja, qué fila se abrió.
- **Respeta «reducir el movimiento»**, también el del sistema operativo: con esa preferencia no hay animación.
- Sin coreografía al cargar la página.

## Do's and Don'ts

**Sí**
- Una acción principal por pantalla; lo demás, secundario.
- Todo color sale de un token (`base-*`, `acento-*`, `semantico-*`), nunca de un hex suelto en el componente.
- Tiene que verse bien en los cuatro temas, con teclado completo y con lector de pantalla.
- Textos cortos, en segunda persona, en español.

**No**
- No usar ventanas encima de ventanas ni cajas dentro de cajas.
- No dar nombres distintos a la misma cosa, ni el mismo nombre a cosas distintas («lección» y «explicación» no son lo mismo).
- No depender solo del color para dar un estado.
- No poner animaciones decorativas, brillos ni degradados de relleno.
- No mostrar a una IA datos personales de estudiantes.

## Deuda conocida (para el rediseño)

Cosas que hoy no coinciden entre sí y que conviene arreglar, no copiar:
1. Los tokens se llaman `acento-ambar` y `acento-ambar-fuerte`, pero ya son azules (se conservaron por las cientos de
   clases que los usan). Un nombre honesto sería `acento` y `acento-hover`.
2. Las sombras usan un tono cálido (`rgba(43,38,34,…)`) sobre una paleta de azules fríos.
3. `borderRadius.lg` está definido en 16 px, pero los botones usan `rounded-xl` (12 px) y las tarjetas `rounded-2xl`
   (16 px): el nombre del token y el uso real no coinciden.
4. Los botones suben 2 px al pasar el cursor y los de color (`btn-stire-teal`) tienen otro hover: no hay una regla única.
5. El tema oscuro se logra con unas 25 reglas de sobreescritura sobre clases de Tailwind (`temas.css`), en vez de tokens
   para todo: cada clase nueva que no esté en la lista se ve mal de noche.
