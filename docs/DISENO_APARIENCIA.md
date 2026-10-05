---
estado: vigente (04/10/2026)
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

## 5. Territorio de identidad visual

`tailwind.config.ts` y `main.css` son el territorio de José. El cambio lo autorizó el dueño del proyecto el 04/10
(«si eso no está hecho, comienza a trabajar»), y quedó anotado en `docs/identidad-visual/BITACORA.md`. Los valores del
tema claro no cambiaron: José puede seguir ajustando la paleta editando las variables de `temas.css`.

## Referencias

- Piepenbrock, C., Mayr, S., Mund, I. y Buchner, A. (2013). Positive display polarity is advantageous for both younger and older adults. *Ergonomics, 56*(7), 1116-1124. https://doi.org/10.1080/00140139.2013.790485
- Rello, L. y Baeza-Yates, R. (2013). Good fonts for dyslexia. En *Proceedings of the 15th International ACM SIGACCESS Conference on Computers and Accessibility* (pp. 1-8). https://doi.org/10.1145/2513383.2513447
- Wery, J. J. y Diliberto, J. A. (2017). The effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy. *Annals of Dyslexia, 67*(2), 114-127. https://doi.org/10.1007/s11881-016-0127-1
- W3C (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*, criterios 1.4.3 y 1.4.12.
