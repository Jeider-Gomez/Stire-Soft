# docs/claude-code/ — Informes de sesión de Claude Code

Registro cronológico de lo que Claude Code ejecuta y verifica contra el árbol de trabajo real
(backend NestJS + frontend Nuxt levantados en vivo, nunca solo lectura de código). Es el
equivalente a [`docs/antigravity/informes/`](../antigravity/informes/) pero para el trabajo de
Claude Code — mismo criterio: **son registros de punto en el tiempo, nunca se editan después de
escritos**; si algo que reportan queda desactualizado, el informe siguiente lo señala.

Los planes de implementación vigentes (qué sigue, qué está pendiente) viven en
[`docs/antigravity/PLAN_IMPLEMENTACION.md`](../antigravity/PLAN_IMPLEMENTACION.md) y en
[`docs/00_VISION_FUNCIONAL.md`](../00_VISION_FUNCIONAL.md) §9 (checkpoints de problemas conocidos
y su estado verificado) — esta carpeta no duplica esos documentos vivos, solo deja la evidencia de
qué se hizo y cuándo.

## Historial de sesiones ejecutadas

| # | Fecha | Documento | Resumen |
|---|---|---|---|
| 01 | 2026-09-10 | [`informes/INFORME_2026-09-10_SESION_01.md`](./informes/INFORME_2026-09-10_SESION_01.md) | Verificación en vivo de los problemas reportados en uso real (404 de sandbox, Tutor lento, matrícula automática, seguridad del acceso demo); 3 hallazgos nuevos no reportados antes (bug de enrutamiento FILL_CODE→CODING, calificación asíncrona que nunca llegaba al estudiante, regresión pedagógica del Tutor) — todos cerrados y verificados en vivo, no solo con tests. |
| 02 | 2026-09-10 | [`informes/INFORME_2026-09-10_SESION_02.md`](./informes/INFORME_2026-09-10_SESION_02.md) | Bug real de `passingScore` sin normalizar (ninguna actividad de bajo puntaje total podía "aprobarse"), primera UX de dominio (mastery antes/después), y redacción de `docs/codex/PLAN_IMPLEMENTACION.md` para delegar a Codex el motor de dominio, la moderación de matrícula y el currículo de Castro/Ali. |
| 03 | 2026-09-11 | [`informes/INFORME_2026-09-11_SESION_01.md`](./informes/INFORME_2026-09-11_SESION_01.md) | Auditoría (3 subagentes en paralelo) de las 3 fases que Codex entregó sobre `docs/codex/PLAN_IMPLEMENTACION.md`; Fase C cumplía la estructura pero no la intención (contenido de relleno idéntico entre clases). Los 3 hallazgos corregidos, más 2 bugs nuevos encontrados verificando en navegador real (`GET /activities?learningUnitId=` en 400, `/estudiante/unidad/[id].vue` con crash 500 y contenido fabricado). Push a `origin/main` autorizado y ejecutado. |

Para agregar una sesión nueva: crear `informes/INFORME_YYYY-MM-DD_SESION_NN.md` (`NN` reinicia en
`01` cada día si hay más de una sesión) y agregar la fila correspondiente arriba.

## Prompts que iniciaron estas sesiones

Viven en [`docs/prompts/`](../prompts/), no aquí — ese es el registro de qué se pidió; esta
carpeta es el registro de qué se ejecutó y qué resultado dio.
