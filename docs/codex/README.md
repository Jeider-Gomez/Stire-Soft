# docs/codex/ — Plan de implementación e informes de sesión

Todo lo relacionado con el trabajo de Codex sobre STIRE-Soft vive aquí — mismo criterio que
`docs/antigravity/`, para que el plan vigente y el historial de sesiones queden juntos y a la vista.

## El plan vigente

[`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) — **documento vivo:** las fases nuevas se
agregan al final del mismo archivo, con fecha, en vez de crear un archivo aparte por entrega — mismo
criterio que usa `docs/antigravity/PLAN_IMPLEMENTACION.md`. Fases A-C (2026-09-11) ya ejecutadas y
verificadas; Fases D-F (2026-09-14) son la entrega vigente.

## Historial de sesiones ejecutadas

Cada sesión de Codex deja un informe fechado en [`informes/`](./informes/), siguiendo
[`informes/TEMPLATE_INFORME.md`](./informes/TEMPLATE_INFORME.md). Son registros de punto en el
tiempo — como las bitácoras de `docs/seguimiento/` y los informes de `docs/antigravity/informes/` —
nunca se editan después de escritos; si algo que reportan queda desactualizado, el informe siguiente
lo señala, no se reescribe el anterior.

| # | Fecha | Documento | Resumen |
|---|---|---|---|
| 01 | 2026-09-14 | [`informes/INFORME_2026-09-14_SESION_01.md`](./informes/INFORME_2026-09-14_SESION_01.md) | Fases D-F: restricción de intento activo en MariaDB, comprobación de matrícula activa al iniciar/ensayar y aislamiento de fallos al emitir `submission.graded`. Pendientes las comprobaciones contra BD y navegador reales, además del commit autorizado. |
| 01 | 2026-09-11 | [`../antigravity/INFORME_CODEX_PENDIENTES_2026-09-11.md`](../antigravity/INFORME_CODEX_PENDIENTES_2026-09-11.md) | Fases A-C: recomendación de siguiente actividad por dominio, moderación de matrícula, currículo real para Castro y Ali. Entregado en la rama `codex-pendientes`, luego fusionado a `main`. Nota: este informe quedó archivado en `docs/antigravity/` por cómo se ejecutó esa sesión (Codex corriendo dentro de Antigravity) — las sesiones siguientes de Codex usan `docs/codex/informes/`. |

Para agregar una sesión nueva: copiar `informes/TEMPLATE_INFORME.md`, completar, renombrar como
`informes/INFORME_YYYY-MM-DD_SESION_NN.md` (`NN` reinicia en `01` cada día si hay más de una sesión)
y agregar la fila correspondiente arriba.

## Regla de edición

Codex no edita `docs/PLAN_MAESTRO.md` — reporta su avance en su propio informe (arriba) y deja que
Claude Code actualice el Checklist Maestro (`docs/PLAN_MAESTRO.md` §4) a partir de una verificación
real contra el código. Ver `docs/PLAN_MAESTRO.md` §1 y §3 para el criterio completo.
