---
fecha: 07/10/2026
pedido del dueño: «así se ve el modo de contraste en Windows (Acuático, Anochecer…): siento que todavía no ha cumplido;
  investiga a fondo el alto contraste y qué más nos falta en inclusividad y accesibilidad, en teléfono y en computador,
  arréglalo y haz una prueba exhaustiva»
herramientas: axe-core 4.14 (WCAG 2.0, 2.1 y 2.2 A y AA + buenas prácticas), Chrome sin interfaz controlado por script,
  agent-browser, emulación de «forced-colors», «prefers-contrast» y «prefers-color-scheme»
---

# Accesibilidad e inclusión de STIRE: investigación, prueba exhaustiva y correcciones

## 1. Lo que hacen otros y lo que pide la norma

### Los «Temas de contraste» de Windows 11

Windows trae cuatro: **Acuático, Desierto, Anochecer y Cielo nocturno**. Según Microsoft, un tema de contraste **no es
un tema oscuro más**: es una paleta reducida de ocho colores con significado, con 7 a 1 o más entre cada par.

| Color de sistema | Para qué | Acuático | Desierto | Anochecer | Cielo nocturno |
|---|---|---|---|---|---|
| Window | Fondo de todo | `#202020` | `#FFFAEF` | `#2D3236` | `#000000` |
| WindowText | Texto, títulos, bordes | `#FFFFFF` | `#3D3D3D` | `#FFFFFF` | `#FFFFFF` |
| Hotlight | Solo enlaces | `#75E9FC` | `#1C5E75` | `#70EBDE` | `#8080FF` |
| GrayText | Solo lo deshabilitado | `#A6A6A6` | `#676767` | `#A6A6A6` | `#A6A6A6` |
| Highlight / HighlightText | Lo seleccionado o en curso | `#8EE3F0` / `#263B50` | `#903909` / `#FFF5E3` | `#A6D8FF` / `#212D3B` | `#D6B4FD` / `#2B2B2B` |
| ButtonText | Botones y controles | `#FFFFFF` | `#202020` | `#B6F6F0` | `#FFEE32` |

Reglas de Microsoft que STIRE no cumplía con su «alto contraste»:
- el texto secundario es el mismo texto: el gris es **solo** para lo deshabilitado;
- un solo fondo: los paneles se separan con **bordes** (2 px en ventanas y menús);
- nada de colores fijos: si el diseño fija un color, en un tema de contraste puede quedar texto claro sobre fondo claro.

Además, quien ya tiene un tema de contraste puesto en Windows ve STIRE con los colores de Windows (`forced-colors`):
eso ya se respetaba desde el 07/10 (bordes en los botones, foco y barras visibles).

### Plataformas educativas

| Plataforma | Qué ofrece | Qué toma STIRE |
|---|---|---|
| Canvas LMS | Interfaz de alto contraste, enlaces subrayados, fuente para dislexia, lector inmersivo, atajos de teclado; probado con JAWS, NVDA, VoiceOver y TalkBack | Contraste aumentado con enlaces subrayados; «Escuchar la lección» ya existía. La fuente para dislexia no: no mejoró la lectura en un estudio controlado (Wery y Diliberto, 2017) |
| Khan Academy | WCAG 2.1 AA como base, lector de pantalla, teclado, **«Reducir movimiento y animaciones»**, texto a voz | «Reducir el movimiento», que además respeta lo que pida el dispositivo |
| Moodle | Herramientas de accesibilidad en cada página: tamaño de letra y esquemas de color (incluido negro con amarillo) | Botón «Apariencia» en la cabecera de cada pantalla; Cielo nocturno es ese negro con amarillo |
| GitHub | Temas con vista previa; «Aumentar contraste» en claro y en oscuro | Vista previa de cada tema |

### WCAG 2.2: lo nuevo que se revisó

2.4.11 Foco no tapado · 2.5.7 Movimientos de arrastre · 2.5.8 Tamaño del objetivo (24 px) · 3.2.6 Ayuda constante ·
3.3.7 Entrada redundante · 3.3.8 Autenticación accesible.

## 2. Cómo se probó

Un script recorre cada pantalla de los cuatro tipos de usuario (público, estudiante, docente y administrador) en
**computador (1366 × 900) y celular (375 × 812, táctil)**. Solo lee: bloquea todo envío salvo el inicio de sesión.

| Prueba | Criterio WCAG | Cómo |
|---|---|---|
| axe-core con WCAG 2.0, 2.1 y 2.2 A y AA + buenas prácticas | Todos los automatizables | En cada pantalla y dispositivo |
| Título de la página | 2.4.2 | Que cada pantalla tenga el suyo |
| Recorrido con Tab (45 pasos) | 2.1.1, 2.1.2, 2.4.7, 2.4.11 | Que el foco se vea, que no quede tapado y que no haya trampas |
| Ancho de 320 px | 1.4.10 (equivale a un zoom de 400 %) | Que nada se salga de lado |
| Espaciado de texto | 1.4.12 | Interlineado 1,5, letras 0,12 y palabras 0,16: que nada se corte |
| Desborde en el celular | 1.4.10 | Que no haya que moverse de lado |
| Temas de contraste | 1.4.3, 1.4.6, 1.4.11 | axe con cada uno de los cuatro temas |
| Colores forzados de Windows | — | Emulación de `forced-colors: active` |

Lo que no se automatiza y queda para personas: el lector de pantalla real (NVDA en Windows, TalkBack en Android) y el
control por voz. Va en la revisión del equipo (Jorge: teclado y accesibilidad).

## 3. Resultados y correcciones

39 pantallas (4 del público, 12 del estudiante, 15 del docente y 8 del administrador), cada una en computador y en
celular: 78 vistas.

| Criterio | Antes | Después |
|---|---:|---:|
| 2.5.3 Etiqueta en el nombre (el nombre para el lector no contiene el texto que se ve: rompe el control por voz) | 130 elementos en 68 vistas | 0 |
| 2.5.8 Tamaño del objetivo (menos de 24 px) | 53 en 11 vistas | 0 |
| 4.1.2 Listas sin nombre (ejercicio de emparejar) | 8 en 2 vistas | 0 |
| 2.1.1 Zonas desplazables a las que no se llega con el teclado | 3 en 3 vistas | 0 |
| 1.3.1 Títulos que saltan de nivel («Mi progreso») | 2 en 2 vistas | 0 |
| 2.4.2 Páginas sin título propio (asistencia; lección y ejercicio no decían cuál) | 3 pantallas | 0 |
| Foco visible, foco tapado y trampas de teclado | 0 | 0 |
| Zoom al 400 % (320 px) y desborde en el celular | 0 | 0 |
| Espaciado de texto | 0 | 0 |
| **Total de axe (WCAG 2.2 AA + buenas prácticas)** | **196 elementos** | **0** |

Lo que ya se cumplía y se comprobó: el ejercicio de arrastrar se puede hacer tocando (2.5.7), el editor de código deja
salir con Esc y Tab (2.1.2), el inicio de sesión acepta el gestor de contraseñas y pegar (3.3.8), la ayuda (Tutor y
Sugerencias) está siempre en el mismo lugar (3.2.6), las imágenes de las lecciones exigen descripción y la página no
impide hacer zoom.

### Qué se corrigió

| Hallazgo | Corrección |
|---|---|
| «Sugerencias», «Apariencia», la campana y el menú de la cuenta tenían un `aria-label` distinto de lo que se ve: con control por voz, decir «Sugerencias» no funcionaba | Sin `aria-label`: el nombre empieza por el texto visible y el resto va como texto solo para el lector |
| Las lecciones del plan y «Traer de otra clase», lo mismo | Igual |
| Casillas de 13 px en «Asignar refuerzo o reto»; nombre de la clase de 21 px; migas del ejercicio tapadas por el título | Casillas de 20 px en filas de 32 px; 28 px y 24 px |
| Tabla del panel del admin y registro del servidor: no se llegaba con el teclado | Se enfocan y se desplazan con las flechas |
| Títulos de página | «Mi asistencia», «Asistencia de la clase» y el nombre de la lección o del ejercicio en la pestaña |
| Videos sin subtítulos | Aviso al docente al insertar un recurso: mejor con subtítulos y con lo importante contado en la lección |

### Temas de contraste

Se agregaron los cuatro temas de Windows (sección 1) al panel «Apariencia», con «Ninguno» para volver. La paleta está
en `utils/apariencia.ts` y una prueba calcula el contraste de cada par: 7 a 1 o más en texto, botones, selección y
estados; los enlaces de Desierto (6,9) y Cielo nocturno (6,4) son los de Windows y pasan AA. Único cambio frente a
Windows: el texto sobre lo seleccionado en Desierto (`#FFF5E3` daba 6,98 a 1; se usa el crema del fondo, 7,3).

La prueba con los temas puestos encontró fallas **en los propios temas**, que se corrigieron antes de darlos por buenos:

| Pasada | Encontró | Causa | Corrección |
|---|---|---|---|
| 1.ª | 222 fallas de contraste en 24 vistas | Colores escritos a mano en las clases (`text-[#4ec9b0]`) en el registro del servidor y en el registro de cuenta; la pestaña activa de la clase con color de enlace sobre el resalte | Las reglas cubren también `text-[#…]`, `bg-[#…]` y `border-[#…]`; los enlaces activos usan el texto de selección |
| A ojo | En Desierto, los tres botones de tamaño de texto se veían elegidos; «Guardar nombre» deshabilitado se veía activo | La regla del botón principal atrapaba `peer-checked:bg-…`; la de deshabilitado pesaba menos | La del botón solo con la clase entera (`~=`); la de deshabilitado, con más peso |
| 2.ª | 10 fallas en 6 vistas | La regla de «texto blanco» pesaba más que la del botón principal (por su variante `:hover`) | Mismo peso y en orden; el botón elegido de los grupos de opciones usa la selección |
| Final | 1 falla en 2 vistas (Desierto): «Ver hoy en la clase» del docente, blanco sobre crema | La clase `btn-stire-teal` de `main.css` fija el texto blanco | Los botones `btn-stire-primary` y `btn-stire-teal` usan la selección, como el botón principal |
| Cierre | **0 fallas** | | |

La pasada final cubrió 90 vistas con tema de contraste: el estudiante con los cuatro temas (12 pantallas cada uno), el
docente con Acuático y Desierto (15 cada uno), el administrador con Anochecer (8) y el público con Cielo nocturno (4),
en computador y celular, más la repetición de lo corregido. Foco visible, foco tapado, zoom a 320 px y espaciado también
dieron 0 con los temas puestos.

Además, quien tenga un tema de contraste puesto en Windows ve un aviso en el panel: STIRE usa los colores de Windows.

### Opciones nuevas para leer y moverse

- **Reducir el movimiento** (como Khan Academy, WCAG 2.3.3): quita animaciones y desplazamientos suaves. También se
  respeta si el dispositivo lo pide, aunque no se marque.
- La opción de antes se llama ahora **«Aumentar el contraste»** (como GitHub) y refuerza el tema claro u oscuro.

## 4. Lo que queda para personas

Una prueba automática no reemplaza a una persona que usa la tecnología de apoyo todos los días. Para la revisión del equipo
(tarjetas S08-V en Trello), sin decirles qué esperar:

- **Lector de pantalla**: NVDA (gratis) en Windows y TalkBack en Android: entrar, abrir una lección, resolver un
  ejercicio y preguntarle al Tutor.
- **Control por voz**: Acceso por voz de Windows 11 («haz clic en Sugerencias»).
- **Temas de contraste de Windows**: Alt izquierdo + Mayús izquierda + Impr Pant, y recorrer STIRE.
- **Zoom del navegador al 200 % y al 400 %**, y el celular con letra grande del sistema.
- **Editor de código con un tema de contraste**: la cuenta de prueba no tiene ejercicios de código en su clase y no se
  pudo ver en esta prueba.

## Referencias

- Microsoft (2026). *Contrast themes — Windows apps*. https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
- Future Horizon Design. *High Contrast Windows 11 Themes* (valores de los cuatro temas). https://futurehorizondesign.net.au/docs/highcontrastwindows11themes/README.html
- Khan Academy. *Accessibility statement* y *Khan Academy's accessibility settings*. https://khanacademy.org/about/accessibility-statement
- Instructure. *What are the Canvas accessibility standards?* https://community.canvaslms.com/docs/2061
- Moodle. *Accessibility block*. https://moodle.org/plugins/block_accessibility
- Deque. *WCAG 2.2 Updates*. https://dequeuniversity.com/resources/wcag-2.2
- W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*.
- Wery, J. J. y Diliberto, J. A. (2017). The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy. *Annals of Dyslexia, 67*(2), 114-127.
