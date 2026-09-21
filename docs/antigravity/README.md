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

**Archivado el 2026-09-21:** la Fase 22 (cuatro correcciones que salieron de auditar la Fase 21) se movió a
[`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-21.md`](../_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-21.md),
con la nota de la auditoría de Claude Code. **El archivo vigente no tiene ninguna fase pendiente**; cuando haya
trabajo nuevo, la numeración sigue en 23. Regla que se aplicó: un plan vigente lista únicamente trabajo
pendiente, y lo ejecutado se archiva.

**Archivado el 2026-09-20:** las Fases 16-21 se movieron completas a
[`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md`](../_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md)
(la Fase 21 lleva al inicio la nota de la auditoría de Claude Code).

**Archivado el 2026-09-15:** las Fases 1-15 (todo el trabajo hasta y con la Fase 15) se movieron
completas a
[`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md`](../_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md) —
el archivo vigente ahora contiene solo la Fase 16 en adelante, para que quede corto y accionable en
vez de un historial que hay que scrollear para encontrar qué sigue. La numeración de fases no se
reinició (sigue en §16), para no romper citas ya hechas en `docs/PLAN_MAESTRO.md` e informes.

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
| 03 | 2026-09-10 | [`informes/INFORME_2026-09-10_SESION_02.md`](./informes/INFORME_2026-09-10_SESION_02.md) | Implementación completa de pantallas de tipos de actividad (`PLAN_TIPOS_DE_ACTIVIDAD.md`): `mcq`, `fill_code`, `drag_drop`, `ordering` y `matching`. Siembra en BD de Nivel 2 y verificación E2E de calificación formal contra backend NestJS. |
| 04 | 2026-09-14 | [`informes/INFORME_2026-09-14_SESION_01.md`](./informes/INFORME_2026-09-14_SESION_01.md) | Fase 14 (§14 `PLAN_IMPLEMENTACION.md`): corrección Self-XSS en Tutor IA (`escapeHtml`), formulario "+ Crear Nueva Clase" (`POST /class`), y 7 vistas Docente/Admin ausentes en Nuxt: `DOC-V02..V06`, `ADM-V01`, `ADM-V03`. Typecheck: exit code 0. Commit `71360b7`. |
| 05 | 2026-09-14 | [`informes/INFORME_2026-09-14_SESION_02.md`](./informes/INFORME_2026-09-14_SESION_02.md) | Fase 15 (§15 `PLAN_IMPLEMENTACION.md`): corrección de contrato y datos reales en `DOC-V04` (verificado en navegador con captura), auditoría de escritura real en `DOC-V03` (`POST /activities` + `/activity-questions` 201) y `ADM-V03` (`POST /maintenance/cleanup` x2 201), selector real de estudiantes en `DOC-V06`, y limpieza de clases QA de Toscano. |
| 06 | 2026-09-15 | [`informes/INFORME_2026-09-15_SESION_03.md`](./informes/INFORME_2026-09-15_SESION_03.md) | Fase 16 (§16 `PLAN_IMPLEMENTACION.md`): modales de edición/archivo en `DOC-V02` (Topics y LearningUnits) y `DOC-V03` (actividades existentes), verificación E2E `DOC-V04` → `DOC-V05`, auditoría WCAG 2.1 AA en 7 vistas y verificación en navegador real con grabación. |
| 07 | 2026-09-16 | [`informes/INFORME_2026-09-16_SESION_01.md`](./informes/INFORME_2026-09-16_SESION_01.md) | Fase 17 (§17 `PLAN_IMPLEMENTACION.md`): categorías reales de tipo de actividad (`AUTO-EVAL` 1.0x, `TALLER` 1.5x, `PARCIAL` 3.0x), selectores con pesos reales y textos de ayuda en `crear.vue` (creación y edición), columna "Categoría / Peso" en tabla de actividades, fix backend en `ActivitiesService.update()`, y verificación de preservación de actividades previas. |

| 08 | 2026-09-19 | [`informes/INFORME_2026-09-19_SESION_01.md`](./informes/INFORME_2026-09-19_SESION_01.md) | Fases 18, 19 y 20: experiencia de chat del Tutor, panel de la clave de Google AI Studio y configuración del Tutor por el docente. |
| 09 | 2026-09-20 | [`informes/INFORME_2026-09-20_SESION_01.md`](./informes/INFORME_2026-09-20_SESION_01.md) | Fase 21: datos reales en `ADM-V01`/`ADM-V03`, «Ir al contenido» y repasos vencidos en el chat. Auditada por Claude Code (imprecisiones anotadas en `PLAN_MAESTRO.md` §6.1). |
| 10 | 2026-09-21 | [`informes/INFORME_2026-09-21_SESION_01.md`](./informes/INFORME_2026-09-21_SESION_01.md) | Fase 22: aviso de repasos sin clave, foco y Escape, contexto de actividad y estados de `ADM-V01`. Auditada por Claude Code (defecto de foco en el Tutor sin clave, ya corregido). |

Para agregar una sesión nueva: copiar `informes/TEMPLATE_INFORME.md`, completar, renombrar como
`informes/INFORME_YYYY-MM-DD_SESION_NN.md` (`NN` reinicia en `01` cada día si hay más de una
sesión) y agregar la fila correspondiente arriba.

## Prompts usados para arrancar estas sesiones

Los prompts que se le pegaron a Antigravity (y a Claude Code, cuando el trabajo fue de backend
para desbloquearla) quedan archivados en [`docs/prompts/`](../prompts/), no aquí — ese es el
registro de qué se le pidió a cada herramienta; esta carpeta es el registro de qué se ejecutó y
qué resultado dio.
