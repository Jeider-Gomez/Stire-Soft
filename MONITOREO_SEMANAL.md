# 🚀 Bitácora de Monitoreo y Control N.º 4 — Proyecto: STIRE-Soft
**Curso:** DDSE3 — 2026-2 | **Grupo:** [G1 / G2]
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft
**Semana reportada:** 7 – 11 de septiembre de 2026 | **Cierre:** viernes 11 de septiembre, 8:00 p.m.
**Estado del sprint:** 🟡 en construcción — inicio de semana. Prioridad única: arrancar la implementación
real del frontend en Nuxt (Objetivo 3 de la Bitácora N.º 3, aún NO INICIADO) guiada por Google
Antigravity, sobre el sistema visual y el prototipo ya cableado en Figma (38 conexiones, 0 rotas).
El plan de implementación paso a paso vive en
[`docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md`](docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md).
Ningún punto de esta bitácora se marca `[x]` hasta que exista un commit real detrás — igual que en
las bitácoras anteriores.
**Tablero Kanban (Trello):** `https://trello.com/b/Zek3mVEX`

*STIRE-Soft es un Sistema Tutor Inteligente para la Resolución de Ejercicios: el estudiante entrega código, el sistema lo ejecuta de forma aislada, lo califica y adapta los siguientes ejercicios a su nivel de dominio.*

---

## 👥 1. Estructura del Equipo y Roles

| Integrante | Rol Principal y Responsabilidades del Sprint | Horario de Reunión Individual | GitHub User |
| :--- | :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico & Backend:** Arquitectura, cierre backend, Tutor IA, Sandbox y setup Nuxt | *[Miércoles 4 a 6 pm]* | @Jeider-Gomez |
| **Jorge Cervantes** | **Gestión & Calidad:** Tablero Trello, QA de entregables e Investigación (15 artículos) | *Jueves 10 a.m. a 12 p.m.* | @IvanGoats |
| **José López** | **UI/UX & Comunicación:** Diseño visual, wireframes de vistas y Pitch de avances | *[Miércoles 2 a 4 pm]* | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC multi-rol, flujos pedagógicos y navegación | *Jueves 4 a 6 pm* | @jcg0912 |
| **Pedro Romero** | **Documentación & Bitácora:** Gestión de bitácoras, evidencias y actas de cierre | *Jueves 4 a 6 pm* | @pedrorm20 |

**Reunión de equipo:** viernes 8:00 – 8:40 p.m., videollamada, con los cinco integrantes.
**Reportes escritos:** martes y jueves, 8:00 p.m., en el grupo del equipo.
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint / Semana Actual

Convertir el sistema visual y el prototipo interactivo ya verificados en Figma (Bitácora N.º 3) en
código real de Nuxt 3, siguiendo el plan de implementación entregado a Antigravity —
sin rediseñar, sin ampliar el alcance de vistas más allá de lo ya construido en Figma
(`COMP-V00`, `EST-V01..V06`, `DOC-V01`, `ADM-V02`).

### 2.1 Resultados esperados (heredados de los "Compromisos para la Semana Siguiente" de la Bitácora N.º 3)

1. `frontend-nuxt/` creado y funcionando (Vue 3 + Nuxt 3 + TypeScript + Pinia + Tailwind), en paralelo
   al `frontend/` (Next.js) congelado, sin tocarlo.
2. Tokens de diseño (las 6 colecciones de variables de Figma) traducidos a `tailwind.config` / CSS,
   sin valores literales — ver el plan en `docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md`.
3. La Ventana Estándar (5 zonas) construida como layout compartido, con las vistas del estudiante
   como primer bloque de paridad contra Figma.
4. Corregir el control de rol de las 4 rutas sin `@Roles` (`13_BACKLOG_FUNCIONAL.md` §6).
5. Sembrar contenido real para las 8 unidades de aprendizaje pendientes.
6. Confirmar en persona (fuera del repositorio) el estado real del Tutor IA con proveedor LLM real.
7. Avanzar en las 10 vistas restantes de Docente y Administrador en Figma, si el tiempo lo permite —
   sin que eso bloquee el arranque de Nuxt.

> **Sección en construcción.** El resto de las secciones de esta bitácora (Retos internos, riesgos,
> decisiones nuevas) se completan durante la semana, a medida que exista trabajo real verificable —
> no se rellenan por adelantado. La última fotografía cerrada del proyecto es
> [`docs/seguimiento/MONITOREO_SEMANAL_03.md`](docs/seguimiento/MONITOREO_SEMANAL_03.md).

---

## 📖 Decisiones del sprint (registro acumulado, vigente)

| # | Decisión | Enlace |
|---|---|---|
| D-01 | La metáfora del "taller" se conserva solo como marco de ícono/paleta, nunca como texto visible en la UI | [`NAMING_STIRE.md`](docs/modesec/NAMING_STIRE.md) |
| D-02 | Códigos de ventana docente unificados: 6 ventanas exactas, resolviendo un conflicto de dos numeraciones incompatibles | [`ventanas/3.3.1_FICHAS_VENTANAS.md`](docs/modesec/ventanas/3.3.1_FICHAS_VENTANAS.md) |
| D-03 | `review-schedules` solo se construye si hay tiempo; `ADM-V01`/`ADM-V03` quedan REQUERIDO-PENDIENTE-DE-BACKEND porque su único endpoint referenciado no existe | [`13_BACKLOG_FUNCIONAL.md`](docs/modesec/13_BACKLOG_FUNCIONAL.md) |
| D-04 | La rederivación de §3.1 desde `COMP-203413` se difiere a cuando exista el Formato 5 real, no se fuerza antes | [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md`](docs/modesec/contenidos/3.1_DIAGRAMA_CONTENIDOS.md) |
| D-05 | `GamificationModule` se retira del backlog activo por decisión de producto; el código no se borra en esta fase | [`13_BACKLOG_FUNCIONAL.md` §4](docs/modesec/13_BACKLOG_FUNCIONAL.md) |
| D-06 | STIRE es una herramienta de apoyo docente, no la plataforma del curso — cubre razonamiento algorítmico y estructuras de control, no `COMP-203413` completa | [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md` §6](docs/modesec/contenidos/3.1_DIAGRAMA_CONTENIDOS.md) |

---

## ⚠️ Riesgos vivos (heredados de la Bitácora N.º 3, sin cambios verificados aún esta semana)

1. **Nuxt sin iniciar, con sustentación el 15/17 de septiembre.** Es el riesgo que abre esta semana —
   ver el plan de implementación.
2. **4 rutas de estudiante sin control de rol** (`POST /submissions/start`,
   `POST /submissions/:id/submit`, `PUT /submissions/:id/autosave`, `POST /tutor/chat`).
3. **8 de 10 unidades de aprendizaje sin contenido sembrado** en `db:seed:demo`.
4. **Tests del sandbox intermitentes por timing**, no por defecto de código — ver `CLAUDE.md`.
5. **Tutor IA con proveedor real no verificable desde el repositorio.**

---

## 🗂️ 12. Bitácoras Anteriores

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./seguimiento/MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./seguimiento/MONITOREO_SEMANAL_03.md) |

Los documentos anteriores se conservan como historial. La semana en curso siempre vive en `MONITOREO_SEMANAL.md` en la raíz.

---

*Bitácora N.º 4 · Semana del 7 al 11 de septiembre de 2026.*
*La mantiene Pedro Romero · Actualización durante la reunión de cierre.*
