# 🚀 Bitácora de Monitoreo y Control N.º 6 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 21 – 25 de septiembre de 2026  
**Cierre:** viernes 25 de septiembre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/H6uzX5Je/stire-kanban-desarrollo-semana-06-21-25-sep-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_05.md`](./docs/seguimiento/MONITOREO_SEMANAL_05.md) — cerrada el 18/09, actualizada el 19/09: el dueño del proyecto confirmó que la sustentación del Reto 2 sí se realizó (vía WhatsApp), lo que cierra 3 de los 4 pendientes (sustentación, apoyo de Pedro, material de José) — quedan 9 de 12 ítems con evidencia real. Los 2 que siguen sin evidencia (validación Figma de José, estructura de cursos de Julio) se trasladan a esta semana en la §3.

---

## 👥 1. Estructura del equipo y roles

| Integrante | Rol principal y responsabilidades del Sprint | Horario de reunión individual | GitHub User |
| :--- | :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico:** frontend Nuxt, backend, integración y Tutor IA | **Miércoles 4:00–6:00 p. m.** | @Jeider-Gomez |
| **Jorge Cervantes** | **Gestión + Calidad:** QA general funcional, backend/API, integración, correcciones y resultado ejecutable | **Jueves 10:00 a. m.–12:00 p. m.** | @IvanGoats |
| **José López** | **UI/UX + Comunicación:** pruebas de usuario real, verificación de UI/UX y documentación visual del proyecto  | **Miércoles 2:00–4:00 p. m.** | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC, navegación y contenidos | **Jueves 4:00–6:00 p. m.** | @jcg0912 |
| **Pedro Romero** | **Documentación + Bitácora:** Trello, evidencias, seguimiento y cierre documental | **Jueves 4:00–6:00 p. m.** | @pedrorm20 |

**Reunión de equipo:** viernes 8:00 – 8:40 p. m.  
**Reportes:** martes y jueves, máximo 8:00 p. m.  
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

> **Nuevo en el Reto 3 (19/09):** además de avanzar el proyecto, el equipo practica y registra "Los
> 7 Hábitos de la Gente Altamente Efectiva" (Covey) semana a semana — ver §3.1 abajo. Y se retira
> permanentemente la validación contra Figma como responsabilidad de José — su tarea de la Semana 5
> asociada (`S05-JO02`) no continúa como tal; se reemplaza por la nueva responsabilidad descrita en
> `S06-JO01`.

---

## 🎯 2. Objetivo del Sprint

Según el cronograma oficial (`docs/investigacion/fuentes-institucionales/cronograma.docx`), el Reto 3
ya se lanzó el viernes 18/09 (indicaciones entregadas al cierre de la Semana 5) y esta semana
(21–25/09) es **Semana B — trabajo autónomo**, dedicada a avanzar el Reto 3. En paralelo, el equipo
cierra el único pendiente real que la Semana 5 dejó sin evidencia (los otros 3 se confirmaron hechos
el 19/09; la validación Figma quedó retirada como responsabilidad — ver nota abajo).

### Resultados esperados

1. Avance real y verificable del Reto 3 (alcance exacto a confirmar con el docente si las
   indicaciones del 18/09 no quedaron claras para todo el equipo).
2. Verificación manual del hallazgo BOLA cerrado por Codex el 16/09 (`activity-questions`) —
   quedó explícitamente pendiente en su propio informe (`docs/codex/informes/INFORME_2026-09-16_SESION_01.md` §5).
3. Estructura de los dos cursos organizada por Julio (único pendiente real que sigue de la Semana 5
   — la validación Figma quedó retirada como responsabilidad, ver nota arriba).
4. Pitch de sustentación del Reto 3 preparado (`S06-P04`).
5. Primer registro real de los 7 Hábitos por cada integrante (`S06-H-*`, ver §3.1).
6. Tablero Trello de la Semana 6 creado y bitácora cerrada el viernes, sin retraso.

> **Actualización 19/09:** el dueño del proyecto confirmó que la sustentación del Reto 2 sí se
> realizó, vía WhatsApp — ver `docs/seguimiento/MONITOREO_SEMANAL_05.md` §7. No queda pendiente de
> esta semana.

---

## 📋 3. Plan de trabajo semanal

> Tablero: https://trello.com/b/H6uzX5Je/stire-kanban-desarrollo-semana-06-21-25-sep-2026

### Jeider Gómez — Líder Técnico

- [ ] **S06-J01 · Avanzar el Reto 3** según las indicaciones recibidas el 18/09 — confirmar alcance
  exacto si quedó ambiguo para el equipo.
- [ ] **S06-J02 · Verificación manual del fix de Fase G (Codex, `activity-questions`)** — con backend
  y frontend reales levantados: un estudiante NO matriculado en la clase debe recibir `403` al pedir
  `GET /activity-questions/activity/:activityId`; uno matriculado con actividad publicada debe recibir
  las preguntas normalmente. Pasos exactos en `docs/codex/informes/INFORME_2026-09-16_SESION_01.md` §5.

### Pedro Romero — Gestión + Documentación

- [x] **S06-P01 · Tablero Trello de la Semana 6** — creado y poblado. *(19/09.)*
- [ ] **S06-P02 · Bitácora** — mantenerla al día y cerrarla el viernes contra Trello **y Git**
  reales. Dar seguimiento a lo único que queda pendiente de la Semana 5 (estructura de cursos de
  Julio — los otros 3 ya se confirmaron hechos vía WhatsApp el 19/09, y la validación Figma quedó
  retirada como responsabilidad) es parte de esta misma tarea de mantener la bitácora al día, no una
  tarea aparte.
- [ ] **S06-P04 · Desarrollar el pitch de sustentación del Reto 3** — mismo formato que
  `docs/pitch/PITCH_SEMANA_03 Y 04.md`, actualizado con lo avanzado en las Semanas 5 y 6.

### José López — UI/UX + Comunicación

- [ ] **S06-JO01 · Probar el proyecto como usuario y documentar visualmente — Tutor IA esta semana**
  — iniciar sesión como estudiante, usar el Tutor de punta a punta (saludo proactivo, preguntas
  reales, pedir practicar, tarjeta de sugerencia), registrar hallazgos de UX y guardar capturas
  organizadas en `docs/material-visual/01-tutor-ia/`. Plan completo (Semanas 7-9: Estudiante,
  Docente, Admin) en la tarjeta de Trello.

### Julio Galvis — Diseño Instruccional

- [ ] **S06-JL01 · Organizar la estructura de los dos cursos de contenido** *(trasladada de
  `S05-JL01`, sin evidencia todavía)* — sigue siendo la tarea de mayor prioridad de Julio: bloquea
  `S05-JL05` (contenido completo) y da información real para decidir la progresión de Nivel 2 que
  Codex tiene pendiente (`docs/PLAN_MAESTRO.md` §6.2, candidato "progresión de 3 pasos para Nivel 2"
  — sigue esperando esta decisión, no es un olvido).

**En Backlog, sin cambios:**
- [ ] **S06-JL05** (antes `S05-JL05`) · Escribir el contenido completo de los dos cursos — depende de `S06-JL01`.
- [ ] **S06-JL03** · Validación pedagógica en vivo — aplazada hasta el despliegue en la nube.
- [ ] **S06-JL04** · Probar funciones de docente en creación/gestión de contenido — aplazada hasta el despliegue.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S06-JOR01 · Verificación manual del fix de Fase G** — mismo objetivo técnico que `S06-J02`,
  desde el ángulo de QA (reproducir el `403`/éxito con pasos documentados, no solo confirmar que
  "funciona").
- [ ] **S06-JOR02 · Retomar 1-2 ángulos de `docs/ReportesQA/GUIA_AUDITORIA_2026-09-16.md` que la
  auditoría del 18/09 no alcanzó a cubrir** — no es obligatorio cubrirlos todos esta semana; prioridad
  sugerida: pruebas adversariales contra el Tutor IA (intentar que dé la respuesta completa de un
  ejercicio) y accesibilidad real con lector de pantalla en al menos 2 flujos.

> **Principio, sin cambios:** los agentes desarrollan/auditan el código; Jorge valida que el
> producto resultante funcione de forma general, esté correctamente integrado y pueda demostrarse.

### 3.1 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (nuevo, Reto 3)

Además del proyecto, el Reto 3 pide que el equipo practique y registre "Los 7 Hábitos de la Gente
Altamente Efectiva" (Covey) — no leerlos, aplicarlos y dejar evidencia real:

**I. Victoria Privada** (autoconocimiento y disciplina personal): Hábito 1 · Ser Proactivo, Hábito 2
· Empezar con Fin en Mente, Hábito 3 · Poner Primero lo Primero.
**II. Victoria Pública** (cooperación efectiva): Hábito 4 · Pensar Ganar-Ganar, Hábito 5 · Primero
Entender (Luego Ser Entendido), Hábito 6 · Sinergizar.
**III. Renovación**: Hábito 7 · Afilar la Sierra (Física, Mental, Espiritual, Social/Emocional).

Cada integrante tiene su propia tarjeta de registro en Trello (una entrada real y específica por
hábito, no una definición copiada) — se repite cada semana mientras dure el Reto 3:

- [ ] **S06-H-JEIDER** · [`S06-H-JEIDER`](https://trello.com/c/cal309Mo)
- [ ] **S06-H-PEDRO** · [`S06-H-PEDRO`](https://trello.com/c/uA68ykbF)
- [ ] **S06-H-JOSE** · [`S06-H-JOSE`](https://trello.com/c/p30mm5MI)
- [ ] **S06-H-JULIO** · [`S06-H-JULIO`](https://trello.com/c/3oWs5vXe)
- [ ] **S06-H-JORGE** · [`S06-H-JORGE`](https://trello.com/c/QprA4Kd2)

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

1. **1 pendiente de la Semana 5 sin evidencia** (estructura de cursos de Julio) — se traslada como
   tarea real de esta semana (§3). Los otros 3 (sustentación, apoyo, material de José) se
   confirmaron hechos el 19/09 vía WhatsApp; la validación Figma quedó retirada como responsabilidad
   (no aplica, no es un pendiente).
2. **Progresión de Nivel 2 y backend del panel de administrador** siguen bloqueados esperando
   decisiones del equipo (instruccional y de arquitectura respectivamente) — `docs/PLAN_MAESTRO.md`
   §6.2. Ninguna de las dos se resuelve sola con más tiempo; necesitan que alguien decida.
3. **Cobertura de auditoría QA parcial:** la pasada de Jorge del 18/09 no cubrió BOLA sistemático
   manual, pruebas adversariales del Tutor/Mastery, ni accesibilidad real — parte de eso ya se cerró
   por código (Fase G de Codex), pero la verificación manual/adversarial sigue abierta (`S06-JOR02`).
4. **Sandbox:** tests intermitentes por timing bajo memoria reducida; repetir antes de declarar defecto.
5. **Contenido:** unidades de aprendizaje sin sembrar más allá del currículo de demostración —
   depende de que Julio cierre `S06-JL01`.
6. **Despliegue real:** sigue bloqueado en autorización OAuth del dueño del proyecto (conector
   Vercel) — sin cambios desde `docs/PLAN_MAESTRO.md` §6.4.

---

## 📅 6. Seguimiento

### Martes

- Qué terminó, qué está haciendo, qué falta, si hay bloqueo.

### Jueves

- Qué lleva terminado, qué puede cerrar el viernes, qué está en riesgo, qué necesita de otro.

### Viernes

- Revisar Trello y GitHub, validar evidencias, registrar riesgos nuevos, actualizar esta bitácora, preparar el siguiente sprint.

---

## 🧾 7. Resultado del Sprint — completar al cierre

### Jeider Gómez

- [ ] Avance del Reto 3 documentado.
- [ ] Fix de Fase G verificado manualmente.

### Pedro Romero

- [x] Tablero de la Semana 6 creado. *(19/09.)*
- [ ] Bitácora cerrada el viernes, sin retraso (incluye seguimiento al pendiente de la Semana 5:
  estructura de cursos de Julio).
- [ ] Pitch de sustentación del Reto 3 desarrollado.

### José López

- [ ] Tutor IA probado como usuario, con hallazgos de UX registrados.
- [ ] `docs/material-visual/01-tutor-ia/` con capturas reales, comiteado.

### Julio Galvis

- [ ] Estructura de los dos cursos organizada.

### Jorge Cervantes

- [ ] Fix de Fase G verificado manualmente (QA).
- [ ] Al menos un ángulo adicional de `GUIA_AUDITORIA_2026-09-16.md` cubierto.

### Todo el equipo

- [ ] Registro de los 7 Hábitos completado por cada integrante (`S06-H-*`, §3.1).

> **Nota:** se marca solo con resultados verificables al cierre del viernes 25/09 — mismo criterio
> que cerró las Semanas 4 y 5.

---

## 🗂️ 8. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./docs/seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./docs/seguimiento/MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./docs/seguimiento/MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | [`MONITOREO_SEMANAL_04.md`](./docs/seguimiento/MONITOREO_SEMANAL_04.md) |
| 5 | 14 – 18 de septiembre de 2026 | [`MONITOREO_SEMANAL_05.md`](./docs/seguimiento/MONITOREO_SEMANAL_05.md) |
| 6 | 21 – 25 de septiembre de 2026 | `MONITOREO_SEMANAL.md` (este documento) |

---

*Bitácora N.º 6 · Semana del 21 al 25 de septiembre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
