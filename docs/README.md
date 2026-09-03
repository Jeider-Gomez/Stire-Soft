# STIRE — Índice de Documentación Técnica
**Base de Conocimiento Oficial del Proyecto · Lectura recomendada en orden**

> Este directorio `docs/` contiene toda la documentación técnica y funcional de STIRE.
> Cualquier IA o desarrollador que lea estos archivos en orden tendrá el contexto completo
> para entender, mantener y extender el sistema sin necesidad de preguntas adicionales.

---

## 📚 Mapa de Documentos

| # | Archivo | Responde a | Audiencia |
|---|---------|-----------|-----------|
| 0 | [00_VISION_FUNCIONAL.md](./00_VISION_FUNCIONAL.md) | **¿Por qué existe STIRE?** Problema pedagógico, propuesta de valor, actores, ciclo cognitivo del estudiante y roadmap. | Todos |
| 1 | [01_ARQUITECTURA_Y_DISENO.md](./01_ARQUITECTURA_Y_DISENO.md) | **¿Qué es STIRE técnicamente?** Arquitectura DDD, decisiones ADR, esquema relacional completo, módulos activos. | Backend devs, Arquitectos |
| 2 | [02_FLUJOS_Y_OPERACIONES.md](./02_FLUJOS_Y_OPERACIONES.md) | **¿Cómo funciona STIRE?** Happy path del estudiante, del docente, smoke test E2E y trazabilidad de logs. | Todos los devs |
| 3 | [03_MOTOR_Y_TUTOR.md](./03_MOTOR_Y_TUTOR.md) | **¿Cuál es el cerebro de STIRE?** Motor de evaluación (Strategy), Judge Engine (Docker Sandbox), Mastery, SM-2 y Tutor IA. | Backend devs, Investigadores |
| 4 | [04_ESTANDARES_Y_SEGURIDAD.md](./04_ESTANDARES_Y_SEGURIDAD.md) | **¿Cuáles son las reglas del juego?** Convenciones de código, seguridad XSS/RCE, escalabilidad y deuda técnica. | Todos los devs |

---

## 🗂️ Otros archivos en esta carpeta

| Archivo | Descripción |
|---------|-------------|
| [05_METODOLOGIA_Y_EQUIPO.md](./05_METODOLOGIA_Y_EQUIPO.md) | **Cómo trabaja el equipo:** sprint semanal, reunión del viernes, reportes de martes y jueves, tablero en Trello, roles y los 3 entregables. |
| [modesec/MARCO_UX_PEDAGOGICO_STIRE.md](./modesec/MARCO_UX_PEDAGOGICO_STIRE.md) | **Marco UX + Pedagógico Oficial (v1.0):** 10 Principios Rectores (P01–P10), trazabilidad científica y flujo coherente. |
| [modesec/NAMING_STIRE.md](./modesec/NAMING_STIRE.md) | **Guía Oficial de Naming y Lenguaje de Producto:** Vocabulario, microcopy de acciones y separación en 3 capas. |
| [modesec/usuarios/](./modesec/usuarios/) | **Insumos por Rol:** Especificación completa para Estudiante, Docente y Administrador. |
| [modesec/](./modesec/) | **MODESEC completo.** Fase II cerrada (§3.1 a §3.3.3, Formatos 10 a 14), gráficos en `assets/`, diagnóstico de lo que falta en `01_GAP_Y_PLAN.md`. Empieza por [`modesec/README.md`](./modesec/README.md). |
| [`../MONITOREO_SEMANAL.md`](../MONITOREO_SEMANAL.md) | Bitácora oficial del curso (vive en la raíz del repositorio). |
| [investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md](./investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md) | **Saneamiento de la bibliografía:** los 15 artículos originales resultaron fabricados; cómo se detectó, cómo se reconstruyó (24 obras reales) y qué controles quedaron instalados. |
| [investigacion/MATRIZ_ARTICULOS.md](./investigacion/MATRIZ_ARTICULOS.md) | Matriz bibliográfica vigente de STIRE — 24 obras verificadas por eje, con registro comprobable de cada una. |
| [seguimiento/](./seguimiento/) | Bitácoras de semanas ya cerradas, numeradas. La semana en curso vive en `MONITOREO_SEMANAL.md`, en la raíz. |
| [pitch/](./pitch/) | Guiones del pitch en inglés por reto. |
| [CHANGELOG.md](../CHANGELOG.md) | Historial de versiones y cambios principales por sprint. |
| [`_archivo/`](./_archivo/) | Documentos históricos o deprecados. No forman parte de la documentación activa. |
| `testing/` | Guías y artefactos relacionados con la estrategia de pruebas. |

---

## 🧭 Guía de Lectura para una IA

Si eres una IA analizando este repositorio, te recomendamos leer en este orden:

1. **`00_VISION_FUNCIONAL.md`** → Entiende el problema y la solución pedagógica.
2. **`01_ARQUITECTURA_Y_DISENO.md`** → Comprende la estructura de módulos y la base de datos.
3. **`02_FLUJOS_Y_OPERACIONES.md`** → Visualiza los flujos de usuario con diagramas Mermaid.
4. **`03_MOTOR_Y_TUTOR.md`** → Profundiza en los algoritmos: Mastery, SM-2, Judge Engine y Tutor IA.
5. **`04_ESTANDARES_Y_SEGURIDAD.md`** → Conoce las reglas de contribución, seguridad y escalabilidad.

Con estos 5 archivos tendrás el 100 % del contexto del proyecto sin necesidad de leer código fuente.

---

*Para el índice ejecutivo del proyecto, ver el [README.md raíz](../README.md).*
