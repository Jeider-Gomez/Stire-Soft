---
estado: vigente (07/10/2026)
criterios: MOB-03 (modo oscuro, sensibilidad al contexto) y CON-01/accesibilidad de la lista de interfaz
pedido del dueño: «mejórale el tema de la inclusividad… el tema de contraste no era cambiar un modo oscuro o algo así»
---

# Apariencia y lectura: tema oscuro, alto contraste, tamaño del texto y espaciado

## 1. Contraste y modo oscuro no son lo mismo

- **Contraste (WCAG 1.4.3):** que cada texto se distinga de su fondo, al menos 4,5 a 1. Eso ya se había corregido
  en la revisión de seguimiento: los grises demasiado claros pasaron a `slate-600`, y axe-core da 0 problemas en las
  pantallas revisadas. Es obligatorio en cualquier tema.
- **Modo oscuro (MOB-03):** otro juego de colores, claro sobre oscuro, que cada persona elige. No reemplaza al claro.
- **Alto contraste:** una opción más, para quien necesita textos y bordes más marcados que el mínimo.

## 2. Lo que hacen los referentes

| Referente | Qué ofrece | Dónde |
|---|---|---|
| Canvas LMS | «Usar interfaz de alto contraste» y «Usar una fuente para dislexia» | Configuración de la cuenta |
| GitHub, YouTube | Tema claro, oscuro o «como el dispositivo» | Configuración o menú del usuario |
| Lector inmersivo de Microsoft | Tamaño del texto, espaciado, lectura en voz alta con resaltado | Dentro del contenido |

Guías de producto, no evidencia científica.

## 3. Lo que dice la evidencia

- El texto oscuro sobre fondo claro se lee más rápido y con menos errores (Piepenbrock et al., 2013). Por eso el tema
  claro sigue siendo el de partida y el oscuro es una opción.
- El texto más grande ayuda a leer a personas con dislexia, y las fuentes sin serifa comunes funcionan bien (Rello y
  Baeza-Yates, 2013). STIRE ya usa Inter, sin serifa.
- La fuente OpenDyslexic **no** mejoró la velocidad ni la precisión de lectura en un estudio controlado (Wery y
  Diliberto, 2017). Por eso STIRE no ofrece una «fuente para dislexia», aunque Canvas sí la tenga: ofrece lo que tiene
  respaldo, el tamaño y el espaciado.
- El espaciado de texto (interlineado 1,5 o más, espacio entre letras y palabras) es un criterio de WCAG 2.1 (1.4.12).

## 4. Lo que se hizo

En «Mi perfil», y desde el menú del usuario con «Apariencia y lectura»:

| Opción | Valores | Por defecto |
|---|---|---|
| Tema | Claro, Oscuro, Como mi dispositivo | Claro |
| Tamaño del texto | Normal, Grande (112,5 %), Muy grande (125 %) | Normal |
| Alto contraste | Sí o no | No |
| Más espacio entre líneas y letras | Sí o no | No |

Se aplica al instante y se recuerda en el navegador (`localStorage`, clave `stire.apariencia`). Si el navegador no
guarda nada (modo privado), se aplica igual sin recordarse.

### Cómo está hecho

- Los colores semánticos de `tailwind.config.ts` (`base-*`, `acento-*`, `semantico-*`, `estado-unidad-*`,
  `urgencia-repaso-*`, `stire-canvas`) leen variables CSS en `assets/css/temas.css`. **El tema claro tiene exactamente
  los valores de antes:** lo comprueba `apariencia.frontend.spec.ts`.
- Las clases grises sueltas que quedan en las pantallas (`text-slate-600`, `bg-white`…) tienen su versión oscura en
  `temas.css`. Lo que siempre es oscuro (el editor de código, la cabecera del Tutor, el fondo de las ventanas) no cambia.
- Los tamaños de letra pasan a `rem` (los mismos 12, 14, 16 px con el tamaño normal) para que crezcan con «Texto grande».
- `plugins/apariencia.client.ts` aplica la preferencia antes de mostrar la primera pantalla.

### Verificación

axe-core (WCAG 2.1 AA) en 20 pantallas de los tres roles, en tema claro y en oscuro: ver la tabla de resultados en
`docs/calidad/listas-chequeo/2026-10-04_seguimiento/ESTADO_STIRE_LISTAS_CHEQUEO.md` §9.

## 4 bis. Segunda vuelta (07/10): «todavía no está lista»

Jeider la probó y dijo que el contraste no estaba listo aunque la IA lo había dado por cumplido. Tenía razón. Se probó
de nuevo con **agent-browser** (axe-core 4.12, 20 pantallas del estudiante y el docente, en claro, oscuro, claro con alto
contraste y oscuro con alto contraste) y mirando las capturas como lo haría un usuario. Lo que axe no veía:

| Problema | Por qué importaba |
|---|---|
| «Alto contraste» apenas cambiaba un gris | Quien lo activaba no notaba la diferencia |
| La opción estaba al final del perfil, debajo de la contraseña | Quien la necesita no la encuentra |
| Con «Como mi dispositivo» en oscuro, el alto contraste no hacía nada | El CSS repetía el tema oscuro y esa copia no tenía alto contraste |
| No se respetaba lo que pide el dispositivo (más contraste, temas de contraste de Windows) | Los botones sin borde y las barras desaparecían con los colores forzados |

Y lo que axe sí encontró: el texto secundario del tema claro daba 4,3 a 1 sobre fondos grises (el mínimo es 4,5), un
botón «Desactivado» de Ajustes empeoraba con alto contraste y el número de repasos del menú daba 4,2 a 1.

### Cómo lo hacen otras plataformas

| Plataforma | Qué toma STIRE |
|---|---|
| Canvas LMS, «Interfaz de alto contraste» | Texto más oscuro, bordes marcados y **enlaces subrayados** (no depender solo del color, WCAG 1.4.1) |
| GitHub, «Aumentar contraste» | El alto contraste existe en claro **y** en oscuro; el tema se elige con una **vista previa** |
| Moodle, herramientas de accesibilidad | Las opciones están **en cada página**, no escondidas en la cuenta |
| YouTube, Duolingo | Claro, oscuro o «como el dispositivo», a un clic desde el menú de arriba |
| Microsoft y la especificación de CSS (`forced-colors`) | Respetar los «Temas de contraste» de Windows: bordes, foco y barras con los colores del sistema |

Khan Academy no tiene modo oscuro propio (la comunidad lo pide desde hace años): no todo referente educativo lo resuelve.

### Lo que se hizo

- **Botón «Apariencia» en la cabecera** (`components/layout/BotonApariencia.vue`): abre las mismas opciones sin salir de
  la pantalla. Sigue estando en el perfil y en el menú del usuario.
- **Vista previa de cada tema**, como GitHub.
- **Alto contraste de verdad** (`assets/css/temas.css`): texto casi negro (blanco en oscuro, sobre negro), bordes
  marcados, enlaces subrayados, contorno de 3 px en el foco, sin sombras y botones desactivados que no se confunden.
- **«Como mi dispositivo» se resuelve en `utils/apariencia.ts`** (`temaEfectivo`), no en el CSS: el tema oscuro ya no
  está repetido y el alto contraste funciona por los dos caminos. Si el dispositivo cambia a oscuro con STIRE abierto,
  la app lo sigue.
- **Si nunca se ha elegido nada y el dispositivo pide más contraste** (`prefers-contrast: more`), el alto contraste
  empieza activado. Se puede quitar.
- **Temas de contraste de Windows** (`@media (forced-colors: active)`): botones con borde, foco y barras visibles.
- Texto secundario del tema claro de slate-500 a slate-600; el botón «Desactivado» y los contadores del menú, con
  contraste suficiente.

Lo comprueba `apariencia.frontend.spec.ts`. Las preferencias siguen guardándose en el navegador: guardarlas en la
cuenta, para que sigan a la persona en otro computador (como Moodle y GitHub), necesita un cambio en el servidor y
queda como siguiente paso.

## 5. Territorio de identidad visual

`tailwind.config.ts` y `main.css` son el territorio de José. El cambio lo autorizó el dueño del proyecto el 04/10
(«si eso no está hecho, comienza a trabajar»), y quedó anotado en `docs/identidad-visual/BITACORA.md`. Los valores del
tema claro no cambiaron, salvo el texto secundario (07/10, por contraste): José puede seguir ajustando la paleta
editando las variables de `temas.css`.

## Referencias

- Piepenbrock, C., Mayr, S., Mund, I. y Buchner, A. (2013). Positive display polarity is advantageous for both younger and older adults. *Ergonomics, 56*(7), 1116-1124. https://doi.org/10.1080/00140139.2013.790485
- Rello, L. y Baeza-Yates, R. (2013). Good fonts for dyslexia. En *Proceedings of the 15th International ACM SIGACCESS Conference on Computers and Accessibility* (pp. 1-8). https://doi.org/10.1145/2513383.2513447
- Wery, J. J. y Diliberto, J. A. (2017). The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy. *Annals of Dyslexia, 67*(2), 114-127. https://doi.org/10.1007/s11881-016-0127-1
- W3C (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*, criterios 1.4.3 y 1.4.12.
