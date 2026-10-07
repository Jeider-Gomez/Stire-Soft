# Listas de chequeo del profesor: antes y después

El Prof. Raúl Toscano pidió aplicar dos listas de chequeo al frontend y, de forma opcional, comparar el **antes** y el
**después** de aplicarlas:

- **Interfaz gráfica:** Pressman & Maxim (2019), capítulos 12, 13 y 14. Tiene 16 ítems y 32 puntos.
- **Sistemas Tutores Inteligentes:** Caro Piñeres (2015). Es la lista para quienes trabajan en esa línea, como STIRE. Tiene 12 ítems y 24 puntos.

Los formatos originales están en [`docs/curso-ddse3/guias/`](../../curso-ddse3/guias/). Cada revisión se guarda en una carpeta
con su fecha y la versión evaluada. Cada lista va en dos formatos:

- el **Word del profesor llenado**, con el mismo formato, para entregar;
- una página **Markdown** con la misma revisión, para leerla y compararla en GitHub.

## Plan de mejora

[`PLAN_DE_MEJORA.md`](PLAN_DE_MEJORA.md) explica cómo se pasa del «antes» al 100 %. La regla es cumplir la intención de cada criterio sin limitar
al Tutor. Tiene dos líneas de trabajo (interfaz y Tutores Inteligentes), una sola versión nueva (v2.0.0, para el martes 06/10) y la verificación de cada
ítem por un integrante del equipo.

## Dónde estamos hoy

**La evaluación de la IA más reciente es la del 06/10:** [`2026-10-06_v2.0.0/`](2026-10-06_v2.0.0/), con las dos listas en Word (formato del
profesor) y en Markdown. Interfaz **31/32 · 96,9 % · Sobresaliente** y Tutores Inteligentes **24/24 · 100 %**. Respecto al 04/10 subieron
MOB-03 (modo oscuro y opciones de lectura), PAT-01 (ninguna página llama a la API) y, el 07/10, PAT-04 (se dividieron los archivos que
mezclaban responsabilidades). Solo queda en CP UX-08: falta el SUS del equipo.

El razonamiento ítem por ítem de las rondas del 04/10 sigue en
[`2026-10-04_seguimiento/ESTADO_STIRE_LISTAS_CHEQUEO.md`](2026-10-04_seguimiento/ESTADO_STIRE_LISTAS_CHEQUEO.md).

## Verificación del equipo

[`VERIFICACION_v2.0.0.md`](VERIFICACION_v2.0.0.md): cada integrante prueba como usuario los ítems que le tocan y marca ✅, ⚠️ o ❌, y
todos responden la encuesta SUS. Un ítem cuenta como cumplido solo con el ✅ de quien lo verifica.

## Revisiones

| Fecha | Versión evaluada | Interfaz (Pressman) | Sistemas Tutores Inteligentes (Caro) | Carpeta |
|---|---|---|---|---|
| **04/10/2026** · antes | `main @ 7c9977b` (v1.1.0 + ajustes de UI/UX del 02 y 03/10), desplegada | **20 / 32 · 62,5 %** · Básico con observaciones | **14 / 24 · 58,3 %** · Insuficiente | [`2026-10-04_antes/`](2026-10-04_antes/) |
| **04/10/2026** · después | `main @ 4d41b8d` (v2.0.0 candidata), desplegada · **falta el visto bueno del equipo (05/10)** | **28 / 32 · 87,5 %** · Aceptable / Competente | **24 / 24 · 100 %** · Sobresaliente | [`2026-10-04_despues/`](2026-10-04_despues/) |
| **04/10/2026** · seguimiento | `main @ 6787d3e` (con organización académica, plantillas y logros), desplegada · 36 pantallas medidas | **28 / 32 · 87,5 %** · Aceptable / Competente (29/32 · 90,6 % · Sobresaliente con el SUS) | **24 / 24 · 100 %** · Sobresaliente | [`2026-10-04_seguimiento/`](2026-10-04_seguimiento/) |
| **06/10/2026** · v2.0.0 (IA, actualizada) | `main @ 80f63d6` (con la Fase H de Codex y la Fase 30: el docente publica, oculta, archiva y elimina con confianza), desplegada · se reevaluaron UX-02, UX-06, UX-08, MOB-03, PAT-01 y PAT-04 | **31 / 32 · 96,9 %** · Sobresaliente (32/32 con el SUS; PAT-04 pasó a C el 07/10) | **24 / 24 · 100 %** · Sobresaliente | [`2026-10-06_v2.0.0/`](2026-10-06_v2.0.0/) |
| 09/10/2026 · revisión humana | v2.0.0 (etiqueta), con la nota de cada integrante y el SUS | — | — | se consolida en [`VERIFICACION_v2.0.0.md`](VERIFICACION_v2.0.0.md) |

### Antes y después (04/10/2026), por bloque

| Lista | Bloque | Antes | Después |
|---|---|---|---|
| Interfaz | Cap. 12 · Experiencia de usuario (8 ítems) | 10 / 16 | 15 / 16 |
| Interfaz | Cap. 13 · Movilidad (4 ítems) | 5 / 8 | 7 / 8 |
| Interfaz | Cap. 14 · Patrones (4 ítems) | 5 / 8 | 6 / 8 |
| Sistemas Tutores | Los 4 módulos canónicos | 6 / 8 | 8 / 8 |
| Sistemas Tutores | Inteligencia del tutor en la interfaz | 5 / 10 | 10 / 10 |
| Sistemas Tutores | Metacognición | 3 / 6 | 6 / 6 |

Lo que falta en la interfaz: el SUS del equipo (UX-08, pasa a C el 05/10 → 29/32 · 90,6 %), el modo oscuro de la identidad visual de José (MOB-03) y dos arreglos internos sin efecto para el usuario (PAT-01 y PAT-04). En Tutores Inteligentes, el 100 % incluye cinco adaptaciones que cumplen la intención del criterio y no su ejemplo literal; se presentan al profesor con su respaldo ([`PLAN_DE_MEJORA.md`](PLAN_DE_MEJORA.md) §1).

En la carpeta de cada fecha:
- `CHECKLIST_INTERFAZ_<fecha>.docx` y `.md` (en el «después», con el sufijo `_DESPUES` y la columna «Antes»);
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
   - axe-core 4.10 con WCAG 2.1 AA (en el «después», también en el celular);
   - Lighthouse 12 en el inicio de sesión (solo en el «después»).
3. La valoración usa la escala del profesor: C = 2, CP = 1, NC = 0 y NA = excluido. Ante la duda se puso la nota más
   baja y se dijo por qué.
4. Para el **después** se aplica la misma lista, con el mismo método, sobre la versión que tenga los ajustes. Después lo
   verifica el equipo, cada ítem una persona distinta de quien lo hizo.

La revisión se hizo con apoyo de Claude Code. Cada afirmación tiene su evidencia en el código, en una captura o en las
mediciones de `evidencia-automatica.json`.
