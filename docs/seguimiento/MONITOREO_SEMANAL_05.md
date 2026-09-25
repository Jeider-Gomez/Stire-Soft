# 🚀 Bitácora de Monitoreo y Control N.º 5 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 14 – 18 de septiembre de 2026  
**Cierre:** viernes 18 de septiembre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/sdy0VdLm/stire-kanban-desarrollo-semana-05-14-18-sep-2026

> **Bitácora archivada.** Esta semana ya terminó. El documento de trabajo de la semana siguiente
> vive en `MONITOREO_SEMANAL.md` en la raíz cuando el equipo defina el alcance de la Semana 6 — no
> se generó automáticamente al cerrar esta, para no fijar objetivos de otra persona sin que el
> equipo los decida. Cierre verificado el 18/09 contra Trello real y contra el código/informes
> reales del repositorio, no solo contra lo que esta bitácora ya declaraba.

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_04.md`](./MONITOREO_SEMANAL_04.md) — ahí queda el cierre completo de la Semana 4.

---

## 👥 1. Estructura del equipo y roles

| Integrante | Rol principal y responsabilidades del Sprint | Horario de reunión individual | GitHub User |
| :--- | :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico:** frontend Nuxt, backend, integración y Tutor IA | **Miércoles 4:00–6:00 p. m.** | @Jeider-Gomez |
| **Jorge Cervantes** | **Gestión + Calidad:** QA general funcional, backend/API, integración, correcciones y resultado ejecutable | **Jueves 10:00 a. m.–12:00 p. m.** | @IvanGoats |
| **José López** | **UI/UX + Comunicación:** validación visual y material de apoyo para sustentación | **Miércoles 2:00–4:00 p. m.** | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC, navegación y contenidos | **Jueves 4:00–6:00 p. m.** | @jcg0912 |
| **Pedro Romero** | **Documentación + Bitácora:** Trello, evidencias, seguimiento y cierre documental | **Jueves 4:00–6:00 p. m.** | @pedrorm20 |

> **Horarios mantenidos de la estructura de equipo definida en la Semana 3.** Esta semana se conservan para dar continuidad y evitar cambios innecesarios en la coordinación.

**Reunión de equipo:** viernes 8:00 – 8:40 p. m.  
**Reportes:** martes y jueves, máximo 8:00 p. m.  
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](../05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint

Esta semana está dominada por la **sustentación del Reto 2 oficial** (15–17 de septiembre). Todo lo demás se organiza alrededor de llegar a esa sustentación con evidencia real.

En paralelo, el QA previo de Jorge dejó una lista de brechas concretas. Dos ya se verificaron contra el código real y quedan para corregir esta semana (`P2-R4` Self-XSS, `FE-02` botón sin formulario); las otras ya fueron revisadas por Claude Code y no deben repetirse como auditoría de código.

### Resultados esperados

1. Sustentación del Reto 2 realizada con evidencia real.
2. Self-XSS del Tutor IA (`P2-R4`) y botón "Crear Nueva Clase" (`FE-02`) corregidos.
3. Jorge realiza **QA general del proyecto sobre el resultado ejecutable**, cubriendo los flujos funcionales principales, backend/API, integración y correcciones entregadas por los agentes.
4. Bitácora cerrada el viernes, sin retraso.

> **Alcance actualizado de Jorge:** esta semana se prioriza el QA general del proyecto. **No incluye MODESEC ni comparación con Figma.** Tampoco incluye repetir auditorías de código ya realizadas por Claude Code, Antigravity o Codex.

---

## 📋 3. Plan de trabajo semanal

> Tablero: https://trello.com/b/sdy0VdLm/stire-kanban-desarrollo-semana-05-14-18-sep-2026

### Jeider Gómez — Líder Técnico

- [ ] **S05-J01 · Preparar y ejecutar la sustentación del Reto 2** (15–17/09).
- [ ] **S05-J02 · Corregir el Self-XSS del Tutor IA (`P2-R4`)** — `TutorChatDrawer.vue`, reemplazar `v-html` sin sanitizar. Ejecutado vía Antigravity (`docs/antigravity/PLAN_IMPLEMENTACION.md` §14.3).
- [ ] **S05-J03 · Conectar "Crear Nueva Clase" a `POST /class` (`FE-02`)**. Ejecutado vía Antigravity (§14.4), junto con las 7 ventanas de Docente/Administrador que faltan en código (§14.2).

### Pedro Romero — Gestión + Documentación

- [x] **S05-P01 · Tablero Trello de la Semana 5** — hecho, 14/09.
- [ ] **S05-P02 · Apoyar la sustentación** — evidencias y orden de la presentación.
- [ ] **S05-P03 · Bitácora** — mantenerla al día y cerrarla el viernes.

### José López — UI/UX + Comunicación

- [ ] **S05-JO01 · Material de apoyo para la sustentación** — coordinado con Jeider.
- [ ] **S05-JO02 · Validar las 9 vistas reales de Nuxt contra Figma.**

### Julio Galvis — Diseño Instruccional

**Esta semana:**
- [ ] **S05-JL01 · Organizar la estructura de dos cursos de contenido**, siguiendo el formato de STIRE (unidades de aprendizaje, ejercicios, actividades) — no escribir el contenido completo todavía, solo la estructura:
  - **Curso 1 — complejo:** sigue el plan oficial de 3er semestre de Fundamentos de Algoritmia, que ya trabaja HTML5, CSS y JavaScript.
  - **Curso 2 — general:** para la enseñanza de algoritmia en general, pensado según la plataforma STIRE, sus funciones y su propia organización.

**En Backlog** (no se pueden terminar esta semana; sin fecha fija):
- [ ] **S05-JL05 · Escribir el contenido completo de los dos cursos y probarlos en el programa** — depende de que `S05-JL01` (la estructura) esté lista primero.
- [ ] **S05-JL03 · Validación pedagógica en vivo** — aplazada hasta que el proyecto se despliegue en la nube.
- [ ] **S05-JL04 · Probar las funciones de docente en la creación/gestión de contenido de unidades** — también aplazada hasta el despliegue; Julio queda a cargo.

### Jorge Cervantes — Gestión + Calidad

- [x] **S05-JOR01 · Re-verificar hallazgos propios sin confirmar.** Hecho por Claude Code el 14/09 para evitar duplicar una auditoría de código; el resultado quedó documentado en `docs/PLAN_MAESTRO.md` §5.
- [ ] **S05-JOR02 · QA general del proyecto** — validar el sistema ejecutable de extremo a extremo, sin repetir auditorías de código de los agentes.

**Qué debe hacer Jorge:**

1. **Arrancar el proyecto:** backend y frontend actuales, sin modificar el frontend solo para probarlo.
2. **QA funcional general:** login, logout, navegación, dashboard y flujos principales disponibles.
3. **Recorrer el flujo del estudiante:** contenido/unidades, actividades o evaluaciones, envío, resultados/progreso y Tutor IA, según lo que esté disponible.
4. **QA backend/API desde el uso real:** comprobar las operaciones de Auth, Classes, Enrollments, Learning Units, Evaluations, Submissions, Learning State y Tutor que intervengan en los flujos probados.
5. **QA de integración:** verificar que frontend, backend, base de datos y servicios necesarios intercambien correctamente los datos.
6. **QA de las correcciones de agentes:** probar en ejecución real Self-XSS, "Crear Nueva Clase" y demás correcciones entregadas por Antigravity/Codex cuando estén disponibles.
7. **Manejo de errores:** comprobar estados de error, datos vacíos, respuestas inválidas y fallos visibles para el usuario cuando aplique.
8. **Evidencia:** registrar capturas, pasos para reproducir, errores de consola/API cuando sean relevantes y conclusión.

> **Fuera del alcance de Jorge esta semana:** MODESEC, Figma, rediseño visual, auditoría profunda de código, Trello, bitácora y corrección directa de errores.

> **Principio:** los agentes desarrollan/auditan el código; Jorge valida que el producto resultante **funcione de forma general, esté correctamente integrado y pueda demostrarse**.

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

### Reglas del tablero

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana`.
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Las dependencias se escriben dentro de la tarjeta.
4. Una tarjeta bloqueada permanece en `En curso` y se marca con etiqueta roja + `🚧 BLOQUEADA`.
5. Una tarea no pasa a `Hecho` sin evidencia.
6. El código terminado debe tener respaldo en GitHub.
7. No se crean columnas adicionales para revisión, QA o bloqueos.
8. Las tareas operativas permanecen en Trello; la bitácora no copia sus checklists.

### Etiquetas visuales

- 🔵 **Azul:** desarrollo / frontend.
- 🔴 **Rojo:** riesgo, bloqueo o QA crítico.
- 🟣 **Morado:** diseño, contenidos y UI/UX.
- 🟠 **Naranja:** gestión y seguimiento.
- 🟢 **Verde:** trabajo estable.
- 🟡 **Amarillo:** trabajo en riesgo.

---

## ⚠️ 5. Riesgos vivos

1. **Sustentación del Reto 2 esta semana (15–17/09)** — sin margen para moverla.
2. **Cobertura real de frontend baja:** 9 de 19 pantallas con integración real (QA previo de Jorge, 12/09).
3. **Self-XSS confirmado en el chat del Tutor IA (`P2-R4`)**, pendiente de corrección y posterior QA general.
4. **Botón "Crear Nueva Clase" sin formulario (`FE-02`)**, confirmado, pendiente de corrección y posterior QA general.
5. **Hallazgos verificados el 14/09 contra el código real:** `P1-07` y `P2-R3` confirmados reales; `P1-08` matizado; `BE-01` ya conocido. Estos no se vuelven a auditar por Jorge como trabajo de código.
6. **Contenido:** unidades de aprendizaje sin sembrar en `db:seed:demo`.
7. **Sandbox:** tests intermitentes por timing bajo memoria reducida; repetir antes de declarar defecto.
8. **Decisión de contenido (14/09):** el contenido real de Fundamentos de Algoritmia incluye HTML5/CSS/JavaScript — más complejo que algoritmia "pura" para público general. Se decide organizar dos cursos con la estructura de STIRE (unidades, ejercicios, actividades): uno complejo (plan oficial, HTML/CSS/JS) y uno general (pensado para la plataforma), y probar cuál es más útil. Organizar la estructura es tarea de esta semana (`S05-JL01`); escribir el contenido completo y probarlo va a Backlog (`S05-JL05`).

---

## 📅 6. Seguimiento

### Martes

- Qué terminó, qué está haciendo, qué falta, si hay bloqueo.

### Jueves

- Qué lleva terminado, qué puede cerrar el viernes, qué está en riesgo, qué necesita de otro.

### Viernes

- Revisar Trello y GitHub, validar evidencias, registrar riesgos nuevos, actualizar esta bitácora, preparar el siguiente sprint.

---

## 🧾 7. Resultado del Sprint — verificado contra Trello y el repositorio real el 18/09/2026

> Regla aplicada, misma que cerró la Semana 4: **solo se marca `[x]` lo que tiene una tarjeta
> `✅ Hecho` en Trello o un archivo/commit real detrás.** Lo demás queda `[ ]` con su razón — no se
> asume que algo se hizo solo porque venció la fecha.

> **Corrección (19/09):** el dueño del proyecto confirmó que la sustentación del Reto 2 sí se
> realizó — vía WhatsApp, no como demo en vivo presencial. Con esa confirmación explícita (no
> evidencia de repositorio, pero sí del dueño del proyecto, mismo criterio de "confirmado por quien
> estuvo presente" que esta bitácora ya pedía), se cierran `S05-J01`, `S05-P02` y `S05-JO01`.

### Jeider Gómez

- [x] Sustentación realizada. *(Vía WhatsApp — confirmado por el dueño del proyecto el 19/09.
  Tarjeta `S05-J01` movida a `✅ Hecho`.)*
- [x] Self-XSS del Tutor IA corregido (`P2-R4`). *(Ya estaba resuelto desde la Fase 14, commit
  `71360b7` — `escapeHtml()` en `TutorChatDrawer.vue` antes del markdown. Tarjeta `S05-J02` movida a
  `✅ Hecho` el 18/09 por Claude Code, verificado contra el código real, no solo contra el commit.)*
- [x] Formulario de "Crear Nueva Clase" conectado (`FE-02`). *(Mismo commit `71360b7` — modal real
  conectado a `POST /class`. Tarjeta `S05-J03` movida a `✅ Hecho` el 18/09, mismo criterio.)*

### Pedro Romero

- [x] Tablero de la Semana 5 creado. *(14/09.)*
- [x] Apoyo a la sustentación. *(La sustentación se realizó vía WhatsApp — confirmado por el dueño
  del proyecto el 19/09. Tarjeta `S05-P02` movida a `✅ Hecho`.)*
- [x] Bitácora cerrada el viernes 18/09, verificada contra Trello real.

### José López

- [x] Material de la sustentación listo. *(Usado en la sustentación vía WhatsApp — confirmado por
  el dueño del proyecto el 19/09. Tarjeta `S05-JO01` movida a `✅ Hecho`.)*
- [ ] 9 vistas validadas contra Figma. *(Sin evidencia en este repositorio — la tarjeta `S05-JO02`
  sigue en `Esta semana`, no se movió a `Hecho`. Trasladada a la Semana 6 como `S06-JO01`.)*

### Julio Galvis

- [ ] Estructura de los dos cursos organizada (`S05-JL01`). *(Sin evidencia en este repositorio —
  no hay archivos de estructura de curso nuevos; la tarjeta sigue en `Esta semana`.)*
- [ ] *(Escribir el contenido completo, la validación en vivo y las funciones de docente quedan en Backlog — no aplican esta semana, ver §3.)*

### Jorge Cervantes

- [x] Hallazgos re-verificados por Claude Code, sin duplicación de trabajo. *(14/09, ver
  `docs/PLAN_MAESTRO.md` §5.)*
- [x] QA general del sistema entregado. *(`docs/ReportesQA/REPORTE_AUDITORIA_QA_STIRE_18-09.md`, 18/09
  — commit `83593cb` auditado, 331/331 tests, build backend/frontend en verde, `P2-R4`/`FE-02`
  re-confirmados, veredicto **"APTO CON CONDICIONES", 80.0% de avance**. Cubre los 12 pasos de la
  tarjeta `S05-JOR02` (login, navegación, flujo de estudiante, Tutor IA, API, integración, estados
  de error, correcciones de agentes, conclusión) — tarjeta movida a `✅ Hecho`.)*

**Nota de verificación (18/09, Claude Code):** el reporte de Jorge se tomó como hallazgo a
verificar, no como hecho consumado — regla vigente de este proyecto. Dos precisiones reales:
1. `VERIFY-01` ("`verify:clean` falla, requiere MySQL en :3306") no es un defecto de código — es el
   comportamiento **esperado** del script: `verify:clean` existe exactamente para exigir una base de
   datos real, no para pasar con SQLite en memoria (`CLAUDE.md`, sección `verify:clean`). El hallazgo
   real es "no había un MySQL corriendo en la máquina donde se auditó", no un problema de STIRE.
2. El reporte no cubrió los puntos específicos pedidos en
   `docs/ReportesQA/GUIA_AUDITORIA_2026-09-16.md` (barrido sistemático de BOLA, pruebas
   adversariales contra el Tutor/Mastery nuevos, auditoría de las Fases 16/17, accesibilidad con
   lector de pantalla, concurrencia) — cubre en cambio el checklist base de la tarjeta `S05-JOR02`,
   que sí completa. La guía queda vigente para una próxima pasada si el equipo la considera
   necesaria; no bloquea el cierre de esta bitácora.

**Resumen real de cierre (actualizado 19/09):** 9 de 12 ítems de sprint cerrados con evidencia
verificable — la sustentación, su apoyo y el material de José cerraron tras confirmación explícita
del dueño del proyecto (se realizó vía WhatsApp). Los 3 que no cierran son: la validación de las 9
vistas contra Figma y la estructura de los dos cursos de Julio — sin evidencia real en Trello/GitHub
a la fecha de cierre, trasladados a la Semana 6 (`S06-JO01`, `S06-JL01`). No se marcan como
fallidos, quedan como pendientes reales para que el equipo los retome.

### Evidencia de la reunión de cierre (viernes 18/09, Google Meet) — agregada el 25/09

Esta reunión cerró la Semana 5 y arrancó la Semana 6.
- **8:28 p. m.:** revisión del Trello de la Semana 5 →
  [`2026-09-18_reunion_2028_revision_trello_semana5.webp`](./evidencias/2026-09-18_reunion_2028_revision_trello_semana5.webp)
- **8:38 p. m.:** revisión de la bitácora y de sus capturas en GitHub →
  [`2026-09-18_reunion_2038_revision_bitacora_y_evidencias.webp`](./evidencias/2026-09-18_reunion_2038_revision_bitacora_y_evidencias.webp)

---

## 🗂️ 8. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | [`MONITOREO_SEMANAL_04.md`](./MONITOREO_SEMANAL_04.md) |
| 5 | 14 – 18 de septiembre de 2026 | [`MONITOREO_SEMANAL_05.md`](./MONITOREO_SEMANAL_05.md) |

---

*Bitácora N.º 5 · Semana del 14 al 18 de septiembre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*  
*Cerrada y archivada el 18 de septiembre de 2026, con verificación cruzada contra Trello real.*
