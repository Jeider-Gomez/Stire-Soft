# docs/antigravity/ — Plan de implementación e informes de sesión

Todo lo relacionado con el trabajo de Antigravity sobre `frontend-nuxt/` vive aquí, en un solo
lugar — antes el plan estaba suelto en `docs/modesec/` (como "Insumo 15", numerado junto a los
insumos de diseño 00-14 que no cambian igual de seguido) y los informes en una carpeta hermana
separada. Reubicado el 2026-09-10 para que el plan vigente y el historial de sesiones queden
juntos y a la vista.

## El plan vigente

[`PLAN_IMPLEMENTACION.md`](./PLAN_IMPLEMENTACION.md) — sigue siendo "Insumo 15" en las citas del
resto del proyecto (el número de identificación no cambia, solo la ubicación del archivo).
**Documento vivo:** las correcciones y verificaciones en frío se agregan como secciones fechadas
en el mismo archivo — no se archivan por eso. Se archiva completo, con fecha en el nombre, en
[`docs/_archivo/`](../_archivo/) únicamente cuando se reemplaza de fondo (fases nuevas, no una
corrección más) — ver la regla exacta ahí.

## Planes independientes

Cuando una pieza de trabajo es lo bastante grande como para merecer su propio documento (no una
sección más dentro de `PLAN_IMPLEMENTACION.md`), vive aparte, en su propio archivo, referenciado
desde acá — nunca mezclado en el plan vigente ni reemplazándolo.

- [`PLAN_TIPOS_DE_ACTIVIDAD.md`](./PLAN_TIPOS_DE_ACTIVIDAD.md) (2026-09-10) — pantallas para los
  tipos de pregunta `mcq`, `fill_code`, `drag_drop`, `ordering` y `matching` (el motor de
  calificación del backend ya los soporta a todos salvo `ai_evaluated`, que queda excluido de la
  fase). Motivado por `PLAN_IMPLEMENTACION.md` §13.

## Historial de sesiones ejecutadas

Cada sesión de Antigravity deja un informe fechado en [`informes/`](./informes/), siguiendo
[`informes/TEMPLATE_INFORME.md`](./informes/TEMPLATE_INFORME.md). Son registros de punto en el
tiempo — como las bitácoras de `docs/seguimiento/` — nunca se editan después de escritos; si algo
que reportan queda desactualizado, el informe siguiente lo señala, no se reescribe el anterior.

| # | Fecha | Documento | Resumen |
|---|---|---|---|
| 01 | 2026-09-07 | [`informes/INFORME_2026-09-07_SESION_01.md`](./informes/INFORME_2026-09-07_SESION_01.md) | Auditoría de autenticación (token real, credenciales del seeder), integración real del Tutor IA con Google Gemini, verificación de los 7 pasos del plan. |
| 02 | 2026-09-10 | [`informes/INFORME_2026-09-10_SESION_01.md`](./informes/INFORME_2026-09-10_SESION_01.md) | Ejecución Fases A-F (§12 PLAN_IMPLEMENTACION): "Probar código" real en backend (`POST /submissions/:id/run`), eliminación de calificaciones falsas, conexión de matrículas/analíticas/repasos SM-2 reales, registro oficial (`COMP-V00`), auditorías UX de sandbox y Tutor IA. |

Para agregar una sesión nueva: copiar `informes/TEMPLATE_INFORME.md`, completar, renombrar como
`informes/INFORME_YYYY-MM-DD_SESION_NN.md` (`NN` reinicia en `01` cada día si hay más de una
sesión) y agregar la fila correspondiente arriba.

## Prompts usados para arrancar estas sesiones

Los prompts que se le pegaron a Antigravity (y a Claude Code, cuando el trabajo fue de backend
para desbloquearla) quedan archivados en [`docs/prompts/`](../prompts/), no aquí — ese es el
registro de qué se le pidió a cada herramienta; esta carpeta es el registro de qué se ejecutó y
qué resultado dio.
