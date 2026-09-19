# STIRE — Índice de Documentación Técnica
**Base de Conocimiento Oficial del Proyecto · Lectura recomendada en orden**

> Este directorio `docs/` contiene toda la documentación técnica, funcional y de seguimiento de STIRE.
> Cualquier IA o desarrollador que lea los documentos canónicos en orden tendrá el contexto completo
> para entender, mantener y extender el sistema sin necesidad de preguntas adicionales.

---

## 🗺️ Empieza aquí

| Si quieres… | Abre |
|---|---|
| Saber qué está hecho, a medias o pendiente en todo el proyecto, y cómo colaboran las IA | [`PLAN_MAESTRO.md`](./PLAN_MAESTRO.md) — solo Claude Code edita su checklist (§4) y checkpoints (§5), tras verificar contra el código real |
| Entender por qué existe STIRE | [`00_VISION_FUNCIONAL.md`](./00_VISION_FUNCIONAL.md) |
| Ver la semana en curso | [`../MONITOREO_SEMANAL.md`](../MONITOREO_SEMANAL.md) (bitácora vigente, en la raíz del repositorio) |
| Ver el entregable de MODESEC | [`modesec/README.md`](./modesec/README.md) |
| Ver las reglas de ingeniería | [`../CLAUDE.md`](../CLAUDE.md) y [`04_ESTANDARES_Y_SEGURIDAD.md`](./04_ESTANDARES_Y_SEGURIDAD.md) |

---

## 📚 1. Documentación canónica (leer en orden)

| # | Archivo | Responde a | Audiencia |
|---|---------|-----------|-----------|
| 0 | [00_VISION_FUNCIONAL.md](./00_VISION_FUNCIONAL.md) | **¿Por qué existe STIRE?** Problema pedagógico, propuesta de valor, actores, ciclo cognitivo del estudiante, roadmap y registro de hallazgos (§9). | Todos |
| 1 | [01_ARQUITECTURA_Y_DISENO.md](./01_ARQUITECTURA_Y_DISENO.md) | **¿Qué es STIRE técnicamente?** Arquitectura DDD, decisiones ADR, esquema relacional completo, módulos activos. | Backend devs, Arquitectos |
| 2 | [02_FLUJOS_Y_OPERACIONES.md](./02_FLUJOS_Y_OPERACIONES.md) | **¿Cómo funciona STIRE?** Happy path del estudiante y del docente, smoke test E2E, trazabilidad de logs. | Todos los devs |
| 3 | [03_MOTOR_Y_TUTOR.md](./03_MOTOR_Y_TUTOR.md) | **¿Cuál es el cerebro de STIRE?** Motor de evaluación (Strategy), Judge Engine, Mastery, SM-2 y Tutor IA. | Backend devs, Investigadores |
| 4 | [04_ESTANDARES_Y_SEGURIDAD.md](./04_ESTANDARES_Y_SEGURIDAD.md) | **¿Cuáles son las reglas del juego?** Convenciones de código, seguridad XSS/RCE, escalabilidad y deuda técnica. | Todos los devs |
| 5 | [05_METODOLOGIA_Y_EQUIPO.md](./05_METODOLOGIA_Y_EQUIPO.md) | **¿Cómo trabaja el equipo?** Sprint semanal, reunión del viernes, reportes, Trello, roles y entregables. | Todo el equipo |

## 🧭 2. Decisiones, estado y contratos

| Archivo | Descripción |
|---------|-------------|
| [ADR_DECISIONES_ARQUITECTURA.md](./ADR_DECISIONES_ARQUITECTURA.md) | Registro de decisiones de arquitectura (ADR 06 sandbox sin Docker, 07 sanitización, 08 Redis opcional, 09 despliegue, 10 Tutor con la clave de Google AI Studio de cada estudiante, 11 configuración del docente y barrera anti-solución). |
| [ESTADO_STIRE_HANDOFF.md](./ESTADO_STIRE_HANDOFF.md) | Documento de traspaso de la Ola 2 (agosto). Para el estado vigente, ver `PLAN_MAESTRO.md`. |
| [CONTRATO_CONTENT_RENDERING.md](./CONTRATO_CONTENT_RENDERING.md) | Contrato de renderizado y sanitización de contenido (citado desde `src/content/`). |

## 🎓 3. Entregables del curso

| Carpeta / archivo | Descripción |
|---------|-------------|
| [modesec/](./modesec/) | **MODESEC** — entregable de diseño educativo y multimedial para el docente. Fase II cerrada; Fase I cerrada para el alcance del MVP. Empieza por [`modesec/README.md`](./modesec/README.md). Las especificaciones de base (mapa funcional, ER, endpoints, permisos, contrato front-back…) están en [`modesec/insumos/`](./modesec/insumos/). |
| [seguimiento/](./seguimiento/) | Bitácoras de las semanas ya cerradas (`MONITOREO_SEMANAL_01…05.md`) y evidencias. La semana en curso vive en [`../MONITOREO_SEMANAL.md`](../MONITOREO_SEMANAL.md). |
| [pitch/](./pitch/) | Guiones del pitch por reto. |
| [presentacion/](./presentacion/) | Documentos de presentación de avances ya generados (HTML). |
| [material-visual/](./material-visual/) | Material gráfico del proyecto probado como usuario real (capturas y hallazgos de UX), organizado por módulo. |
| [investigacion/](./investigacion/) | **Pista de tesis** (reglas de alcance propias, distintas del software): contexto, matriz bibliográfica verificada, fichas y borradores de entregables. Ver [`investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`](./investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md) y [`investigacion/MATRIZ_ARTICULOS.md`](./investigacion/MATRIZ_ARTICULOS.md). |

## 🤖 4. Colaboración con las IA

| Carpeta | Descripción |
|---------|-------------|
| [antigravity/](./antigravity/) | Plan de implementación vigente para Antigravity (frontend), y su historial de informes de sesión. Empieza por [`antigravity/README.md`](./antigravity/README.md). |
| [codex/](./codex/) | Plan de implementación vigente para Codex (fases delegadas de backend + frontend) e informes. Empieza por [`codex/README.md`](./codex/README.md). |
| [claude-code/](./claude-code/) | Historial de informes de sesión de Claude Code — verificación en vivo, hallazgos y commits. |
| [prompts/](./prompts/) | Prompts multi-fase entregados a las herramientas, archivados tal como se enviaron. |

## ✅ 5. Calidad y auditoría

| Carpeta | Descripción |
|---------|-------------|
| [ReportesQA/](./ReportesQA/) | Reportes de QA de Jorge, informe de validación del backend, plan y guía de auditoría. Índice cronológico en [`ReportesQA/README.md`](./ReportesQA/README.md). |

## 🗄️ 6. Archivo y material local

| Carpeta / archivo | Descripción |
|---------|-------------|
| [_archivo/](./_archivo/) | Documentos históricos o deprecados. No forman parte de la documentación activa. |
| [CHANGELOG.md](../CHANGELOG.md) | Historial de olas de remediación y cambios por sprint. |
| *(solo local)* | `AUDITORIA_TECNICA_ALTA_INTENSIDAD.md`, `REAUDITORIA_CIERRE_OLA1.md`, `REAUDITORIA_OLA2.md`, `testing/` y parte de `_archivo/` están en `.gitignore` a propósito (detalle de vulnerabilidades y pruebas de concepto): existen en la máquina de quien los generó, no en GitHub. |

---

## 🧭 Guía de lectura para una IA

Si eres una IA analizando este repositorio, lee en este orden:

1. **`PLAN_MAESTRO.md`** → estado real y modelo de colaboración.
2. **`00_VISION_FUNCIONAL.md`** → el problema y la solución pedagógica.
3. **`01_ARQUITECTURA_Y_DISENO.md`** → estructura de módulos y base de datos.
4. **`02_FLUJOS_Y_OPERACIONES.md`** → flujos de usuario con diagramas Mermaid.
5. **`03_MOTOR_Y_TUTOR.md`** → algoritmos: Mastery, SM-2, Judge Engine y Tutor IA.
6. **`04_ESTANDARES_Y_SEGURIDAD.md`** → reglas de contribución, seguridad y escalabilidad.

---

*Para el índice ejecutivo del proyecto, ver el [README.md raíz](../README.md).*
