# docs/_archivo/ — Documentos históricos

Esta carpeta contiene documentación que **ya no es vigente**, pero que se conserva
deliberadamente como evidencia del proceso de ingeniería del proyecto: planes de trabajo ya
ejecutados, decisiones de un bloque ya cerrado, revisiones puntuales ya superadas, y una línea
de gestión de proyecto (`gestion-v3-descartada/`) que se evaluó y se descartó a favor de otra
metodología.

**No se borra porque el proceso — auditorías adversariales, planes de remediación ejecutados
punto por punto con evidencia, decisiones tomadas y luego revisadas — es, para este proyecto,
tan parte del material de defensa como el sistema en sí.** Un documento archivado demuestra
que hubo un plan, que se ejecutó, y qué cambió respecto a lo planeado — borrarlo solo deja el
resultado final, sin el rastro de cómo se llegó ahí.

Cada archivo aquí lleva, al inicio, una cabecera que indica que es histórico y remite al
documento vigente (`docs/ESTADO_STIRE_HANDOFF.md`) para el estado real y actual del proyecto.
**Ningún documento de esta carpeta debe citarse como fuente de verdad del estado presente del
sistema** — para eso está `docs/ESTADO_STIRE_HANDOFF.md`, siempre.

## Qué hay aquí

| Archivo/carpeta | Qué es |
|---|---|
| `PLAN_OLA1_BLOQUE1_BUILD.md` | Plan de trabajo del primer bloque de la Ola 1 de remediación (reparación del build). Ejecutado. |
| `DECISIONES_BLOQUE2_Y_ADDENDA.md` | Decisiones de arquitectura del Bloque 2 de la Ola 1. Ejecutado. |
| `REVISION_2.1_Y_AMPLIACION_2.2.md` | Revisión puntual 2.1 y su ampliación 2.2. Superada por olas posteriores. |
| `REVISION_2.2_Y_SEGURIDAD_DEL_REPO.md` | Revisión de seguridad del repositorio en el punto 2.2. Superada. |
| `REPORTE_FINAL_ESTABILIDAD.md` | Reporte de estabilidad de una versión anterior del sistema. Los datos que reporta ya no reflejan el estado actual — ver `docs/ESTADO_STIRE_HANDOFF.md` para las cifras vigentes. |
| `gestion-v3-descartada/` | Una tercera línea de metodología de gestión de proyecto (tablero Kanban, disponibilidad de equipo, formatos de reporte/ceremonia, entregables del Reto 1) que se evaluó y no se adoptó — la metodología vigente está en `docs/05_METODOLOGIA_Y_EQUIPO.md`. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md` | Fases 1-15 del plan de Antigravity (Insumo 15): scaffold, tokens de diseño, 9 ventanas de Estudiante, Fases A-F de estabilización, MCQ/FILL_CODE, y las 7 ventanas de Docente/Administrador. Todas ejecutadas y verificadas. El plan vigente (`docs/antigravity/PLAN_IMPLEMENTACION.md`) sigue desde la Fase 16. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md` | Fases 16-21 del plan de Antigravity: editar/archivar contenido y accesibilidad (16), categorías de peso examen/práctica (17), experiencia de chat del Tutor (18), clave de Google AI Studio (19), configuración del Tutor por el docente (20) y datos reales en administración, «Ir al contenido» y repasos en el chat (21, con la nota de la auditoría de Claude Code). Todas ejecutadas; el plan vigente es la Fase 23. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-21.md` | Fase 22 del plan de Antigravity: cuatro correcciones que salieron de auditar la Fase 21 (aviso de repasos sin clave, foco y Escape, contexto de actividad, estados de `ADM-V01`). Ejecutada y auditada; incluye la nota de la auditoría. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-24.md` | Fase 24 del plan de Antigravity: constructor del curso (módulos, temas, unidades, lecciones), creador de los 6 tipos de ejercicio, gestión de la clase, «Mi perfil» y administración de usuarios. Ejecutada, auditada y corregida (24b); lleva al inicio la nota de la auditoría y las lecciones para los planes siguientes. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-25.md` | Fase 25 del plan de Antigravity: ejercicios de HTML y CSS calificados por reglas (`html_css`; Parte A backend de Claude Code, Parte B frontend de Antigravity, A7 saneado de código). Ejecutada, auditada y corregida; lleva al inicio la nota de la auditoría. El plan vigente es la Fase 26. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-26.md` | Fase 26 del plan de Antigravity: editor de código con CodeMirror 6, resaltado y selector de lenguaje (Parte A backend de Claude Code, Parte B frontend de Antigravity). Ejecutada, auditada y corregida; lleva al inicio la nota de la auditoría. No hay fase vigente. |
| `PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-22.md` | Fase 23 del plan de Antigravity: «Iniciar Refuerzo» navega a la unidad, el admin cambia roles de usuario, el registro deja elegir estudiante/docente (sin restricción de dominio de correo) y el admin resuelve las solicitudes de rol docente. Ejecutada, auditada contra código real y fusionada a `main` (`0397d02`, 22/09); `docs/antigravity/PLAN_IMPLEMENTACION.md` queda sin fase pendiente. |

## Regla para archivar versiones del plan de Antigravity

`docs/antigravity/PLAN_IMPLEMENTACION.md` (Insumo 15 — reubicado desde `docs/modesec/` el
2026-09-10, el número de cita no cambió) es un documento **vivo**: las correcciones y
verificaciones en frío se agregan como secciones fechadas en el mismo archivo (así quedó §11, por
ejemplo) — eso NO se archiva, es el historial natural de un documento vigente.

Se archiva completo, con nombre `PLAN_IMPLEMENTACION_ANTIGRAVITY_YYYY-MM-DD.md`, únicamente cuando
el plan se **reemplaza de fondo** — fases nuevas que ya no son una corrección sino un plan
distinto (ej. cuando cierre esta ola de FASE CC-09 y arranque la siguiente ronda de fases de
Antigravity). En ese momento: copiar la versión saliente aquí con esa fecha, añadir la cabecera
histórica estándar de esta carpeta, y dejar en `docs/antigravity/README.md` la referencia a dónde
quedó. Los informes de sesión (`docs/antigravity/informes/`) nunca se archivan aquí — son
registros de punto en el tiempo, no un documento vigente que se pueda superar.

## Nota sobre archivos que NO están aquí

Algunos documentos de auditoría con detalle de hallazgos de seguridad todavía abiertos, o con
payloads de ataque funcionales, permanecen **fuera del control de versiones** (gitignorados) en
`docs/` directamente — no se mueven a esta carpeta porque el criterio de exclusión no es "es
viejo", es "documenta una vulnerabilidad mientras el repositorio es público". Ver `.gitignore`
y `CLAUDE.md` (sección "Seguridad y datos") para la política completa.
