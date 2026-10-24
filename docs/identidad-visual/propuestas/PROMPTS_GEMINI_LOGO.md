---
estado: listos para pegar (23/10/2026)
para: Gemini (gemini.google.com), con la opción de crear imágenes; sirve la cuenta gratuita
uso: son para **ver ideas**, no para entregar el logo. Un modelo de imágenes entrega píxeles (PNG), no SVG limpio: cuando se elija una dirección, se redibuja como SVG (la página `tutor-y-asistente.html` ya tiene tres en SVG)
---

# Prompts para que Gemini dibuje propuestas de logo de STIRE

## Cómo usarlos

1. Abre Gemini, elige crear imagen y pega **un prompt a la vez**.
2. Pide **4 variantes** si la herramienta lo permite; si no, repite el prompt dos o tres veces.
3. Guarda las que te gusten en una carpeta y súbelas a la conversación para que las compare con las SVG.
4. Si ninguna convence, cambia solo **una** palabra del prompt (la forma o el color) y repite.

**Qué no hay que pedirle:** que escriba «STIRE» dentro de la imagen. Los modelos de imágenes suelen deformar las
letras. El nombre se agrega después con la tipografía real (Poppins). Por eso los prompts piden el **símbolo solo**.

## Datos de marca que van en todos

- Nombre: **STIRE**, *Sistema tutor inteligente con repetición espaciada*, para estudiantes universitarios y docentes de programación.
- Colores: azul `#0B3D91`, morado `#7B2FBF`, turquesa `#00C2A8`, fondo `#F7F9FC`.
- Tono: sobrio, amable, tecnológico; **no** infantil ni de videojuego.
- Idea: **una escalera de pasos que suben y se separan** (los niveles de dominio y los repasos a 1, 3, 8 y 20 días).

## Prompt 1 · Escalera (la recomendada)

```text
Logo mark only, no text. A minimalist symbol made of four rounded vertical bars of increasing height,
forming an ascending staircase, with the gaps between the bars growing wider from left to right.
Flat vector style, solid color #0B3D91, rounded corners, perfectly geometric, centered on a clean white
background with generous empty space. Modern educational technology feel, calm and trustworthy, not childish.
No gradient, no shadow, no 3D, no letters, no extra decoration.
```

## Prompt 2 · Burbuja de puntos

```text
Logo mark only, no text. A minimalist speech bubble with rounded corners and a small tail, containing
three white dots that grow larger and farther apart from left to right. Flat vector style, solid color
#0B3D91, geometric, centered on a clean white background with generous empty space. Friendly yet
professional, suitable for a university programming tutor. No gradient, no shadow, no 3D, no letters.
```

## Prompt 3 · Corchetes con punto

```text
Logo mark only, no text. A minimalist pair of square brackets [ ] with thick rounded strokes and one
solid round dot centered between them, like a value inside code. Flat vector style, solid color #0B3D91,
geometric, centered on a clean white background with generous empty space. Clean, technical and calm.
No gradient, no shadow, no 3D, no letters.
```

## Prompt 4 · Tutor STIRE (avatar del estudiante)

```text
App avatar icon, square canvas, no text. A circular speech-bubble shape with a small tail at the bottom
left, solid purple #7B2FBF, containing a white symbol of four rounded vertical bars forming an ascending
staircase. Flat vector style, geometric, friendly and calm, readable at very small sizes (32 px).
It must clearly be a symbol of an AI assistant and NOT a human face or a cartoon character.
No gradient, no shadow, no 3D, no letters.
```

## Prompt 5 · Asistente STIRE (avatar del docente)

```text
App avatar icon, square canvas, no text. A rounded square (like a sheet or panel) in solid blue #0B3D91
containing a white symbol of four rounded vertical bars forming an ascending staircase, with a small
four-point sparkle in turquoise #00C2A8 at the top right corner. Flat vector style, geometric, professional
and calm, readable at very small sizes (32 px). Must clearly be a symbol of an AI assistant and NOT a
human face or a cartoon character. No gradient, no shadow, no 3D, no letters.
```

## Variantes para probar si no convence

- **Más cálido:** cambia «calm and trustworthy» por «warm and encouraging».
- **Más técnico:** agrega «inspired by a terminal cursor and code blocks».
- **Menos genérico:** agrega «avoid the common AI sparkle cliché and avoid a robot head».
- **Otro color:** pide la misma forma en turquesa `#00C2A8` sobre fondo `#0B1220` para ver la versión oscura.

## Al elegir una dirección

1. Se redibuja como **SVG** a una sola tinta con `currentColor`, sobre una cuadrícula de 48 px (la página de
   propuestas ya trae la construcción de la escalera).
2. Se prueba a 16, 32 y 64 px, en claro, en oscuro y en los temas de contraste.
3. Se agrega el nombre con Poppins convertida a trazos.
4. Se genera el kit: favicon, icono de iPhone, iconos de 192 y 512 px, imagen para compartir.
