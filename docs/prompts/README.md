# docs/prompts/ — Registro de prompts entregados a Claude Code y Antigravity

Cada prompt sustancial generado con `/prompt-master` y realmente entregado a una herramienta
(Claude Code, Antigravity) queda archivado aquí, junto con su resultado. No es documentación de
diseño ni una bitácora de avances — es la evidencia de **qué se le pidió exactamente a cada
herramienta y qué devolvió**, en la misma línea de `docs/_archivo/`: el proceso de ingeniería es
tan parte del material de defensa del proyecto como el sistema en sí.

**Qué entra aquí:** prompts multi-bloque o multi-fase que gobiernan una sesión completa de trabajo
agéntico. **Qué NO entra:** preguntas puntuales, correcciones de una línea, o cualquier intercambio
que no dejó un plan de trabajo propio — eso vive en el historial de la conversación, no aquí.

## Convención

- Nombre de archivo: `<HERRAMIENTA>_<YYYY-MM-DD>_<ETIQUETA-CORTA>.md` — ej.
  `CLAUDE-CODE_2026-09-09_FASE-CC09.md`.
- Cada archivo lleva una cabecera con: fecha, herramienta objetivo, estado (`pendiente` /
  `ejecutado` / `ejecutado parcialmente`) y, si ya corrió, los commits o el informe de resultado.
- El prompt se archiva **tal como se entregó**, sin editar después — si quedó desactualizado en
  algún punto, el prompt siguiente lo hereda corregido, no se reescribe el anterior (misma regla
  que los informes de Antigravity).

## Índice

| Fecha | Herramienta | Archivo | Estado |
|---|---|---|---|
| 2026-08-28 | Claude Code | [`CLAUDE-CODE_2026-08-28_AVANCES-SEMANA-01.md`](./CLAUDE-CODE_2026-08-28_AVANCES-SEMANA-01.md) | ✅ Ejecutado — produjo `docs/presentacion/RECORRIDO_Y_SEMANA_01.html` (confirmado por título) |
| 2026-08-28 | Claude Code | [`CLAUDE-CODE_2026-08-28_PRESENTACION-RETO-01.md`](./CLAUDE-CODE_2026-08-28_PRESENTACION-RETO-01.md) | ❓ Sin confirmar — ningún resultado identificable en el repositorio |
| 2026-09-09 | Claude Code | [`CLAUDE-CODE_2026-09-09_PRESENTACION-AVANCES.md`](./CLAUDE-CODE_2026-09-09_PRESENTACION-AVANCES.md) | ❓ Sin confirmar — sin evidencia de ejecución |
| 2026-09-09 | Claude Code | [`CLAUDE-CODE_2026-09-09_FASE-CC09.md`](./CLAUDE-CODE_2026-09-09_FASE-CC09.md) | ✅ Ejecutado — Bloques 0 a 4, más verificación de autenticación adicional pedida en la misma sesión |
| — | Antigravity | *(pendiente de redactar la versión final — depende del cierre de FASE CC-09)* | ⏳ Pendiente |

Cuando el prompt de Antigravity quede listo para entregarse, se archiva aquí con su propia fila.

**Nota sobre los tres primeros:** reubicados el 2026-09-10 desde `docs/` y `docs/presentacion/`,
donde estaban sueltos junto a otros documentos sin relación. Dos de los tres ("Presentación Reto
01" y "Presentación Avances") no tienen un resultado confirmado en el repositorio — se registran
igual, sin inventar un resultado, porque el objetivo de esta carpeta es qué se pidió, no solo lo
que sobrevivió.
