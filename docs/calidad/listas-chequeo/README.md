# Listas de chequeo del profesor: antes y después

El Prof. Raúl Toscano pidió aplicar dos listas de chequeo al frontend y, de forma opcional, comparar el **antes** y el
**después** de aplicarlas:

- **Interfaz gráfica:** Pressman & Maxim (2019), capítulos 12, 13 y 14. Tiene 16 ítems y 32 puntos.
- **Sistemas Tutores Inteligentes:** Caro Piñeres (2015). Es la lista para quienes trabajan en esa línea, como STIRE. Tiene 12 ítems y 24 puntos.

Los formatos originales están en [`docs/curso-ddse3/guias/`](../../curso-ddse3/guias/). Cada revisión se guarda en una carpeta
con su fecha y la versión evaluada. Cada lista va en dos formatos:

- el **Word del profesor llenado**, con el mismo formato, para entregar;
- una página **Markdown** con la misma revisión, para leerla y compararla en GitHub.

## Revisiones

| Fecha | Versión evaluada | Interfaz (Pressman) | Sistemas Tutores Inteligentes (Caro) | Carpeta |
|---|---|---|---|---|
| **04/10/2026** · antes | `main @ 7c9977b` (v1.1.0 + ajustes de UI/UX del 02 y 03/10), desplegada | **20 / 32 · 62,5 %** · Básico con observaciones | **14 / 24 · 58,3 %** · Insuficiente | [`2026-10-04_antes/`](2026-10-04_antes/) |
| después | v1.2.0, cuando se hagan los ajustes | — | — | — |

### Antes (04/10/2026), por bloque

| Lista | Bloque | Puntos |
|---|---|---|
| Interfaz | Cap. 12 · Experiencia de usuario (8 ítems) | 10 / 16 |
| Interfaz | Cap. 13 · Movilidad (4 ítems) | 5 / 8 |
| Interfaz | Cap. 14 · Patrones (4 ítems) | 5 / 8 |
| Sistemas Tutores | Los 4 módulos canónicos | 6 / 8 |
| Sistemas Tutores | Inteligencia del tutor en la interfaz | 5 / 10 |
| Sistemas Tutores | Metacognición | 3 / 6 |

En la carpeta de cada fecha:
- `CHECKLIST_INTERFAZ_<fecha>.docx` y `.md`;
- `CHECKLIST_ITS_<fecha>.docx` y `.md`;
- `capturas/`: computador `pc_*` y celular `cel_*`, de estudiante (`est`) y docente (`doc`);
- `evidencia-automatica.json`: tamaños de los controles, desplazamiento horizontal y resultados de axe-core por pantalla.

## Cómo se hizo

1. Cada ítem se comprobó contra el **código** (archivo y línea) y contra la **aplicación desplegada**.
2. En la aplicación se usaron las cuentas de prueba de estudiante y docente. Las pruebas fueron:
   - computador (1440×900);
   - celular vertical (390×844) y horizontal (844×390);
   - navegación con el teclado;
   - modo oscuro del sistema;
   - conexión cortada;
   - axe-core 4.10 con WCAG 2.1 AA.
3. La valoración usa la escala del profesor: C = 2, CP = 1, NC = 0 y NA = excluido. Ante la duda se puso la nota más
   baja y se dijo por qué.
4. Para el **después** se aplica la misma lista, con el mismo método, sobre la versión que tenga los ajustes, y se llena
   la segunda fila de la tabla.

La revisión se hizo con apoyo de Claude Code. Cada afirmación tiene su evidencia en el código, en una captura o en las
mediciones de `evidencia-automatica.json`.
