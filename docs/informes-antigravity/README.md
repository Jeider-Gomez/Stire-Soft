# docs/informes-antigravity/ — Informes de sesión de Antigravity

Cada vez que Antigravity cierra una sesión de trabajo sobre `frontend-nuxt/` (o sobre backend,
cuando aplique), deja un informe fechado en esta carpeta siguiendo `TEMPLATE_INFORME.md`. Son
registros de punto en el tiempo — como las bitácoras de `docs/seguimiento/` — nunca se editan
después de escritos; si algo que reportan queda desactualizado, el informe siguiente lo señala,
no se reescribe el anterior.

**El plan que estas sesiones ejecutan vive aparte, no aquí:**
[`docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md`](../modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md)
(Insumo 15) — ese sí es un documento vivo que se actualiza en el sitio a medida que avanza el
plan. Cuando se vuelve a escribir de fondo (no una nota fechada, sino un reemplazo real de fases),
la versión anterior se archiva completa en [`docs/_archivo/`](../_archivo/) — ver la regla ahí.

## Historial de sesiones

| # | Fecha | Documento | Resumen |
|---|---|---|---|
| 01 | 2026-09-07 | [`INFORME_2026-09-07_SESION_01.md`](./INFORME_2026-09-07_SESION_01.md) | Auditoría de autenticación (token real, credenciales del seeder), integración real del Tutor IA con Google Gemini, verificación de los 7 pasos del Insumo 15. |

## Plantilla

[`TEMPLATE_INFORME.md`](./TEMPLATE_INFORME.md) — copiar para cada sesión nueva, completar y
renombrar como `INFORME_YYYY-MM-DD_SESION_NN.md` (`NN` reinicia en `01` cada día si hay más de
una sesión). Agregar la fila correspondiente a la tabla de arriba al cerrar.
