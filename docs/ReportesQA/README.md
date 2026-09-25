# Reportes y guías de QA / auditoría

Todo lo relacionado con calidad y auditoría del proyecto, en orden cronológico. Los reportes son
registros de punto en el tiempo: no se editan después de escritos (las correcciones y precisiones
quedan en `docs/PLAN_MAESTRO.md` §5 y en la bitácora de la semana correspondiente).

| Fecha | Documento | Autor | Qué es |
|---|---|---|---|
| 2026-08-30 | [`backend-audit.md`](backend-audit.md) | Antigravity | Informe de validación del backend previo a construir el frontend. |
| 2026-09-12 | [`REPORTE_AUDITORIA_QA_STIRE.md`](REPORTE_AUDITORIA_QA_STIRE.md) | Jorge Cervantes | Primera versión de la auditoría QA integral. |
| 2026-09-12 | [`REPORTE_AUDITORIA_QA_STIRE2VERSION.md`](REPORTE_AUDITORIA_QA_STIRE2VERSION.md) | Jorge Cervantes | Segunda versión de la misma auditoría del 12/09. |
| 2026-09-14 | [`PLAN_IMPLEMENTACION_JORGE_QA.md`](PLAN_IMPLEMENTACION_JORGE_QA.md) | Claude Code | Plan de QA general de la Semana 5 para Jorge. |
| 2026-09-16 | [`GUIA_AUDITORIA_2026-09-16.md`](GUIA_AUDITORIA_2026-09-16.md) | Claude Code | Guía de la auditoría general + específica del Tutor IA, con veredicto de despliegue. |
| 2026-09-21 | [`GUIA_AUDITORIA_2026-09-21.md`](GUIA_AUDITORIA_2026-09-21.md) | Claude Code | Guía de la auditoría de la Semana 6 (21–25/09): roles y registro con solicitud de docente, fallas conocidas pendientes de la Fase 23, Tutor con clave real, regresiones visuales y despliegue desde cero. |
| 2026-09-23 | [`GUIA_AUDITORIA_MAESTRA.md`](GUIA_AUDITORIA_MAESTRA.md) | Claude Code | **Método vigente de toda auditoría:** reglas de oro, herramientas necesarias para probar el 100 % de las funciones, entorno desde cero, matriz de cobertura por rol, barrido de autorización, formato del reporte y prompt para un agente IA. Sustituye como método a las guías por semana. |
| 2026-09-23 | [`REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md`](REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md) | Claude Code | Auditoría de la Fase 24 de Antigravity con el método de la guía maestra: Chrome real, base desechable, 10 hallazgos (1 crítico, 3 altos). Corregidos 6 en la misma rama (24b). |
| 2026-09-18 | [`REPORTE_AUDITORIA_QA_STIRE_18-09.md`](REPORTE_AUDITORIA_QA_STIRE_18-09.md) | Jorge Cervantes | Auditoría entregada contra la guía anterior (331/331 tests, "apto con condiciones"). Sus precisiones están en `docs/seguimiento/MONITOREO_SEMANAL_05.md` §7. |

Las auditorías de seguridad con detalle de vulnerabilidades abiertas no se versionan (ver
`CLAUDE.md`, sección "Seguridad y datos"): viven solo de forma local y están en `.gitignore`.
