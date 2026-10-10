# Documentación de STIRE-Soft

Todo lo que explica el proyecto, ordenado por propósito. Si llegas por primera vez, empieza por la
tabla de abajo.

## Empieza aquí

| Si quieres… | Abre |
|---|---|
| Revisar las **entregas del curso** (lo que pidió el docente y dónde está cada cosa) | [`curso-ddse3/`](curso-ddse3/README.md) |
| Ver la **semana en curso** | [`../MONITOREO_SEMANAL.md`](../MONITOREO_SEMANAL.md) |
| Saber qué está hecho y qué falta en todo el proyecto | [`PLAN_MAESTRO.md`](PLAN_MAESTRO.md) |
| Entender por qué existe STIRE | [`00_VISION_FUNCIONAL.md`](00_VISION_FUNCIONAL.md) |
| Ver la aplicación desplegada y cómo se actualiza | [`DESPLIEGUE.md`](DESPLIEGUE.md) §8 |
| Subir cambios sin pisarse (ramas, Pull Requests, versiones) | [`FLUJO_GIT.md`](FLUJO_GIT.md) |
| Entender **cómo sube y baja el dominio** y por qué siempre se puede llegar al 100 % | [`DISENO_DOMINIO.md`](DISENO_DOMINIO.md) |
| Diseñar **ejercicios de programar que enseñan** (referentes, lo hecho y lo propuesto para el docente) | [`DISENO_EJERCICIOS_PROGRAMAR.md`](DISENO_EJERCICIOS_PROGRAMAR.md) |

## 1. El sistema (leer en orden)

| # | Documento | Responde a |
|---|---|---|
| 0 | [`00_VISION_FUNCIONAL.md`](00_VISION_FUNCIONAL.md) | ¿Por qué existe? Problema pedagógico, propuesta de valor, actores y ciclo del estudiante |
| 1 | [`01_ARQUITECTURA_Y_DISENO.md`](01_ARQUITECTURA_Y_DISENO.md) | ¿Qué es técnicamente? Módulos, modelo de datos y decisiones |
| 2 | [`02_FLUJOS_Y_OPERACIONES.md`](02_FLUJOS_Y_OPERACIONES.md) | ¿Cómo lo recorre cada rol y qué pasa en el servidor? |
| 3 | [`03_MOTOR_Y_TUTOR.md`](03_MOTOR_Y_TUTOR.md) | ¿Cuál es el cerebro? Evaluación, sandbox, dominio, SM-2 y Tutor IA |
| 4 | [`04_ESTANDARES_Y_SEGURIDAD.md`](04_ESTANDARES_Y_SEGURIDAD.md) | ¿Cuáles son las reglas? Código, seguridad y deuda técnica |
| 5 | [`05_METODOLOGIA_Y_EQUIPO.md`](05_METODOLOGIA_Y_EQUIPO.md) | ¿Cómo trabaja el equipo? Sprint, reuniones, Trello y roles |

**Decisiones y contratos:** [`ADR_DECISIONES_ARQUITECTURA.md`](ADR_DECISIONES_ARQUITECTURA.md) ·
[`CONTRATO_CONTENT_RENDERING.md`](CONTRATO_CONTENT_RENDERING.md) ·
[`DESPLIEGUE.md`](DESPLIEGUE.md) ·
[`ESTADO_STIRE_HANDOFF.md`](ESTADO_STIRE_HANDOFF.md) (traspaso histórico de la Ola 2; el estado vigente está en `PLAN_MAESTRO.md`) ·
[`TRASPASO_SESION.md`](TRASPASO_SESION.md) (para retomar el trabajo en una sesión nueva de Claude Code: reglas del dueño y pendientes).

## 2. El curso y la investigación

| Carpeta | Qué contiene |
|---|---|
| [`curso-ddse3/`](curso-ddse3/README.md) | **Puerta de entrada del docente:** cada requisito de las guías y del cronograma, con el archivo que lo cumple. Incluye las guías originales |
| [`cursos/`](cursos/README.md) | Los dos cursos pedagógicos (Fundamentos de Algoritmia 203413 y Pensamiento algorítmico desde cero): diseño, alineación con el plan de curso y cómo se cargan y simulan |
| [`modesec/`](modesec/README.md) | Diseño educativo y multimedial con MODESEC (Fase I para el alcance del MVP y Fase II completa) |
| [`seguimiento/`](seguimiento/) | Bitácoras de semanas cerradas y evidencias de las reuniones |
| [`pitch/`](pitch/) | Guiones del pitch en inglés por reto y guía de pronunciación |
| [`investigacion/`](investigacion/) | Tesis de pregrado (reglas de alcance propias): contexto, matriz bibliográfica verificada, fichas y entregables. Además, [`REFERENTES_PLATAFORMAS_Y_STI.md`](investigacion/REFERENTES_PLATAFORMAS_Y_STI.md): referentes de producto (Moodle, Open edX, Coursera, Udemy, Platzi, Duolingo, Khan, Codecademy, CS50), qué es un STI, IA generativa en educación y hoja de ruta para STIRE. Desde el 03/10, [`referentes/`](investigacion/referentes/): método (pedagogía, UX y UI), catálogos de patrones con decisión y estado, fichas de enseñanza de programación, IA educativa y repetición espaciada; y [`BASE_TEORICA.md`](investigacion/BASE_TEORICA.md): por qué STIRE está diseñado así |

## 3. Diseño y experiencia de uso

| Carpeta | Qué contiene |
|---|---|
| [`material-visual/`](material-visual/README.md) | Capturas reales del sistema por versión y rol, con hallazgos de UX |
| [`identidad-visual/`](identidad-visual/README.md) | Guía para el rediseño visual (paleta, tipografía) sin romper funcionalidad |

## 4. Cómo se construye

| Carpeta | Qué contiene |
|---|---|
| [`agentes-ia/`](agentes-ia/README.md) | Trabajo con herramientas de IA: planes de implementación, informes de sesión y prompts (Antigravity, Codex, Claude Code) |
| [`calidad/`](calidad/README.md) | Reportes de QA, guías y plan de auditoría |
| [`_archivo/`](_archivo/README.md) | Documentos históricos que ya cumplieron su función. No describen el estado actual |

Algunos documentos con detalle de vulnerabilidades existen solo en la máquina de quien los generó
y están en `.gitignore` a propósito (ver [`../CLAUDE.md`](../CLAUDE.md), «Seguridad y datos»).

## Guía de lectura para una IA

1. [`../CLAUDE.md`](../CLAUDE.md) — reglas de trabajo.
2. [`PLAN_MAESTRO.md`](PLAN_MAESTRO.md) — estado real y colaboración.
3. Los documentos `00` a `04`, en orden.
4. [`../CHANGELOG.md`](../CHANGELOG.md) — qué cambió y con qué evidencia.
