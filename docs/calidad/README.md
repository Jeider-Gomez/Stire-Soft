# Calidad: pruebas, auditorías y reportes QA

Todo lo de calidad del proyecto. Arriba lo que se usa hoy; abajo, cada carpeta con su historial. Los reportes son
registros de un momento: no se editan después de escritos. Las correcciones quedan en la bitácora de la semana
(`MONITOREO_SEMANAL.md`) y en `CHANGELOG.md`.

## Vigente

| Documento | Para qué |
|---|---|
| [`PRUEBA_DOS_SEMANAS.md`](PRUEBA_DOS_SEMANAS.md) | **La prueba con el equipo (5 – 16 de octubre):** dos cursos, dos grupos que se cruzan, quién hace qué, qué probar y cómo enviar sugerencias. |
| [`GUIA_AUDITORIA_MAESTRA.md`](GUIA_AUDITORIA_MAESTRA.md) | **El método de toda auditoría QA:** reglas, herramientas, matriz de cobertura por rol, barrido de autorización y formato del reporte. |

Los resultados de cada semana de la prueba van en `resultados-prueba/PRUEBA_SEMANA_N_RESULTADOS.md` (la carpeta se crea
con el primero).

## Carpetas

### [`reportes-qa/`](reportes-qa/) — auditorías de Jorge Cervantes (Gestión + Calidad)

| Fecha | Documento | Qué es |
|---|---|---|
| 2026-09-12 | [`REPORTE_AUDITORIA_QA_STIRE.md`](reportes-qa/REPORTE_AUDITORIA_QA_STIRE.md) | Primera versión de la auditoría QA integral. |
| 2026-09-12 | [`REPORTE_AUDITORIA_QA_STIRE2VERSION.md`](reportes-qa/REPORTE_AUDITORIA_QA_STIRE2VERSION.md) | Segunda versión de la misma auditoría. |
| 2026-09-18 | [`REPORTE_AUDITORIA_QA_STIRE_18-09.md`](reportes-qa/REPORTE_AUDITORIA_QA_STIRE_18-09.md) | Auditoría de la Semana 5 (331/331 pruebas, «apto con condiciones»). Precisiones en la bitácora 05 §7. |
| 2026-09-23 | [`REPORTE_AUDITORIA_QA_STIRE_23-09.md`](reportes-qa/REPORTE_AUDITORIA_QA_STIRE_23-09.md) | Auditoría integral, adversarial y de despliegue de la Semana 6. |
| 2026-10-02 | [`REPORTE_QA_S7_2026-10-02.md`](reportes-qa/REPORTE_QA_S7_2026-10-02.md) | **Primera auditoría sobre el entorno desplegado** (stire-soft.vercel.app): registro, clases, ejercicios de JavaScript y HTML/CSS, teclado, notificaciones, Tutor y recuperación de contraseña. 8 hallazgos; análisis y respuesta en la bitácora 07 §7. |

### [`auditorias/`](auditorias/) — auditorías internas (Claude Code y Antigravity)

| Fecha | Documento | Qué es |
|---|---|---|
| 2026-08-30 | [`backend-audit.md`](auditorias/backend-audit.md) | Validación del backend antes de construir el frontend (Antigravity). |
| 2026-09-23 | [`REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md`](auditorias/REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md) | Fase 24 con el método de la guía maestra: 10 hallazgos (1 crítico, 3 altos); 6 corregidos en la misma rama. |
| 2026-09-25 | [`REPORTE_AUDITORIA_QA_FASE25B_2026-09-25.md`](auditorias/REPORTE_AUDITORIA_QA_FASE25B_2026-09-25.md) | Ejercicios de HTML y CSS: seguridad de la vista previa, flujos y móvil. 7 hallazgos; corregidos los dos reales. |
| 2026-09-30 | [`EVALUACION_HEURISTICA_2026-09-30.md`](auditorias/EVALUACION_HEURISTICA_2026-09-30.md) | Evaluación heurística (Nielsen) y recorrido cognitivo sobre la web real. |

### [`guias-anteriores/`](guias-anteriores/) — guías ya reemplazadas

Se conservan como registro. El método vigente es la guía maestra y la prueba vigente es la de dos semanas.

| Fecha | Documento | Reemplazada por |
|---|---|---|
| 2026-09-14 | [`PLAN_IMPLEMENTACION_JORGE_QA.md`](guias-anteriores/PLAN_IMPLEMENTACION_JORGE_QA.md) | Guía maestra |
| 2026-09-16 | [`GUIA_AUDITORIA_2026-09-16.md`](guias-anteriores/GUIA_AUDITORIA_2026-09-16.md) | Guía maestra |
| 2026-09-21 | [`GUIA_AUDITORIA_2026-09-21.md`](guias-anteriores/GUIA_AUDITORIA_2026-09-21.md) | Guía maestra |
| 2026-09-30 | [`GUIA_RONDA_1_EQUIPO.md`](guias-anteriores/GUIA_RONDA_1_EQUIPO.md) | `PRUEBA_DOS_SEMANAS.md` |

## Dónde subir un reporte nuevo

- **Reporte QA de Jorge:** `reportes-qa/REPORTE_QA_S<semana>_<AAAA-MM-DD>.md`, sin espacios en el nombre.
- **Resultados de la prueba con el equipo:** `resultados-prueba/PRUEBA_SEMANA_<N>_RESULTADOS.md`.

Las auditorías de seguridad con detalle de vulnerabilidades abiertas no se versionan (ver `CLAUDE.md`, «Seguridad y
datos»): viven solo de forma local y están en `.gitignore`.
