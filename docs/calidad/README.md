# Calidad: pruebas, auditorías y reportes QA

Todo lo de calidad del proyecto. Arriba lo que se usa hoy; abajo, cada carpeta con su historial. Los reportes son
registros de un momento: no se editan después de escritos. Las correcciones quedan en la bitácora de la semana
(`MONITOREO_SEMANAL.md`) y en `CHANGELOG.md`.

## Vigente

| Documento | Para qué |
|---|---|
| [`PRUEBA_DOS_SEMANAS.md`](PRUEBA_DOS_SEMANAS.md) | **La prueba con el equipo (5 – 16 de octubre):** dos cursos, dos grupos que se cruzan, quién hace qué, qué probar y cómo enviar sugerencias. |
| [`GUIA_AUDITORIA_MAESTRA.md`](GUIA_AUDITORIA_MAESTRA.md) | **El método de toda auditoría QA:** reglas, herramientas, matriz de cobertura por rol, barrido de autorización y formato del reporte. |
| [`listas-chequeo/`](listas-chequeo/README.md) | **Las listas de chequeo del profesor** (interfaz según Pressman y Sistemas Tutores Inteligentes según Caro), en su formato Word y en Markdown, con el antes y el después. Antes (04/10/2026): interfaz 62,5 %, Tutores 58,3 %. |

Los resultados de cada semana de la prueba van en `resultados-prueba/PRUEBA_SEMANA_N_RESULTADOS.md` (la carpeta se crea
con el primero).

## Carpetas

```
calidad/
├── README.md                    este índice
├── GUIA_AUDITORIA_MAESTRA.md    método de las auditorías QA
├── PRUEBA_DOS_SEMANAS.md        prueba con el equipo (5 – 16 oct)
├── listas-chequeo/              listas del profesor: una carpeta por revisión (fecha + antes/después)
├── reportes-qa/                 reportes de Jorge: REPORTE_QA_S<semana>_<AAAA-MM-DD>.md
├── auditorias/                  auditorías internas (Claude Code, Antigravity), con su fecha en el nombre
└── guias-anteriores/            guías ya reemplazadas, como registro
```

Todos los nombres llevan la fecha en formato `AAAA-MM-DD`, para que se ordenen solos. El 04/10/2026 se renombraron los
reportes viejos a ese formato (por ejemplo `REPORTE_AUDITORIA_QA_STIRE_18-09.md` → `REPORTE_QA_S5_2026-09-18.md`) y se
actualizaron los enlaces que los citaban.

### [`listas-chequeo/`](listas-chequeo/README.md) — listas de chequeo del profesor

| Fecha | Revisión | Interfaz (Pressman) | Tutores Inteligentes (Caro) |
|---|---|---|---|
| 2026-10-04 | [Antes](listas-chequeo/2026-10-04_antes/) · `main @ 7c9977b` | [20/32 · 62,5 %](listas-chequeo/2026-10-04_antes/CHECKLIST_INTERFAZ_2026-10-04.md) | [14/24 · 58,3 %](listas-chequeo/2026-10-04_antes/CHECKLIST_ITS_2026-10-04.md) |

### [`reportes-qa/`](reportes-qa/) — auditorías de Jorge Cervantes (Gestión + Calidad)

| Fecha | Documento | Qué es |
|---|---|---|
| 2026-09-12 | [`REPORTE_QA_S4_2026-09-12_v1.md`](reportes-qa/REPORTE_QA_S4_2026-09-12_v1.md) | Primera versión de la auditoría QA integral. |
| 2026-09-12 | [`REPORTE_QA_S4_2026-09-12_v2.md`](reportes-qa/REPORTE_QA_S4_2026-09-12_v2.md) | Segunda versión de la misma auditoría. |
| 2026-09-18 | [`REPORTE_QA_S5_2026-09-18.md`](reportes-qa/REPORTE_QA_S5_2026-09-18.md) | Auditoría de la Semana 5 (331/331 pruebas, «apto con condiciones»). Precisiones en la bitácora 05 §7. |
| 2026-09-23 | [`REPORTE_QA_S6_2026-09-23.md`](reportes-qa/REPORTE_QA_S6_2026-09-23.md) | Auditoría integral, adversarial y de despliegue de la Semana 6. |
| 2026-10-02 | [`REPORTE_QA_S7_2026-10-02.md`](reportes-qa/REPORTE_QA_S7_2026-10-02.md) | **Primera auditoría sobre el entorno desplegado** (stire-soft.vercel.app): registro, clases, ejercicios de JavaScript y HTML/CSS, teclado, notificaciones, Tutor y recuperación de contraseña. 8 hallazgos; análisis y respuesta en la bitácora 07 §7. |

### [`auditorias/`](auditorias/) — auditorías internas (Claude Code y Antigravity)

| Fecha | Documento | Qué es |
|---|---|---|
| 2026-08-30 | [`AUDITORIA_BACKEND_2026-08-30.md`](auditorias/AUDITORIA_BACKEND_2026-08-30.md) | Validación del backend antes de construir el frontend (Antigravity). |
| 2026-09-23 | [`REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md`](auditorias/REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md) | Fase 24 con el método de la guía maestra: 10 hallazgos (1 crítico, 3 altos); 6 corregidos en la misma rama. |
| 2026-09-25 | [`REPORTE_AUDITORIA_QA_FASE25B_2026-09-25.md`](auditorias/REPORTE_AUDITORIA_QA_FASE25B_2026-09-25.md) | Ejercicios de HTML y CSS: seguridad de la vista previa, flujos y móvil. 7 hallazgos; corregidos los dos reales. |
| 2026-09-30 | [`EVALUACION_HEURISTICA_2026-09-30.md`](auditorias/EVALUACION_HEURISTICA_2026-09-30.md) | Evaluación heurística (Nielsen) y recorrido cognitivo sobre la web real. |
| 2026-10-07 | [`ACCESIBILIDAD_E_INCLUSION_2026-10-07.md`](auditorias/ACCESIBILIDAD_E_INCLUSION_2026-10-07.md) | Accesibilidad e inclusión con WCAG 2.2 en 39 pantallas (computador y celular) y los cuatro temas de contraste de Windows: de 196 elementos con fallas a 0. |

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
- **Nueva aplicación de las listas de chequeo:** `listas-chequeo/<AAAA-MM-DD>_<antes|despues>/`, con los dos Word llenados,
  sus `.md`, `capturas/` y la evidencia; y una fila más en `listas-chequeo/README.md`.

Las auditorías de seguridad con detalle de vulnerabilidades abiertas no se versionan (ver `CLAUDE.md`, «Seguridad y
datos»): viven solo de forma local y están en `.gitignore`.
