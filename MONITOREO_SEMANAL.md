# 🚀 Bitácora de Monitoreo y Control N.º 4 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 7 – 11 de septiembre de 2026  
**Cierre:** viernes 11 de septiembre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/WW9nWXQ5/stire-kanban-desarrollo-semana-04

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

---

## 👥 1. Estructura del equipo y roles

| Integrante | Rol principal y responsabilidades del Sprint | GitHub User |
| :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico:** frontend Nuxt, backend, integración y Tutor IA | @Jeider-Gomez |
| **Pedro Romero** | **Gestión + Documentación + Apoyo Técnico:** Trello, bitácora, evidencias y componentes frontend | @pedrorm20 |
| **José López** | **UI/UX + Comunicación:** validación visual y Pitch de avances | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC, navegación y contenidos | @jcg0912 |
| **Jorge Cervantes** | **Calidad y Pruebas:** validación funcional y revisión de entregables | @IvanGoats |

**Reunión de equipo:** viernes 8:00 – 8:40 p. m.  
**Reportes:** martes y jueves, máximo 8:00 p. m.  
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint

Durante esta semana el equipo debe **iniciar la implementación real del frontend en Nuxt 3**, tomando como fuente de verdad el sistema visual y el prototipo de Figma ya verificados, mientras se atienden las brechas críticas del backend y se preparan los contenidos y evidencias necesarios para la siguiente sustentación.

El alcance inicial de frontend se mantiene limitado a las vistas ya diseñadas: `COMP-V00`, `EST-V01..V06`, `DOC-V01` y `ADM-V02`. No se rediseñan ni inventan vistas nuevas durante este sprint.

### Resultados esperados

1. `frontend-nuxt/` creado y funcionando con Nuxt 3, Vue 3, TypeScript, Pinia y Tailwind.
2. Tokens visuales y Ventana Estándar traducidos a código reutilizable.
3. Primera vista de estudiante funcionando y validada contra Figma.
4. Corrección de las cuatro rutas críticas sin control de rol.
5. Verificación real del Tutor IA con proveedor LLM.
6. Contenidos pendientes organizados para las unidades de aprendizaje.
7. Validación de navegación y flujo pedagógico.
8. Pitch de avances preparado con evidencias reales.
9. Bitácora actualizada y cerrada con resultados verificables.

---

## 📋 3. Plan de trabajo semanal

### Jeider Gómez — Líder Técnico

- [x] **S04-J01 · Preparar frontend Nuxt** — objetivo 08/09. *(Completado anticipadamente 07/09: Nuxt 3, Vue 3, Pinia, Tailwind y TS)*
- [x] **S04-J02 · Ventana Estándar** — objetivo 10/09. *(Completado anticipadamente 07/09: COMP-V00, EST-V01..V06, DOC-V01, ADM-V02)*
- [x] **S04-J03 · Backend + Tutor IA** — objetivo 11/09. *(Completado anticipadamente 07/09: Auditoría auth, token JWT real y Google Gemini LLM activo)*

**Dependencias:** S04-J02 depende de S04-J01. S04-J03 puede ejecutarse en paralelo.  
**Evidencias:** Ver informe oficial [`docs/informes-antigravity/INFORME_2026-09-07_SESION_01.md`](./docs/informes-antigravity/INFORME_2026-09-07_SESION_01.md).

### Pedro Romero — Gestión + Documentación + Apoyo Técnico

- [ ] **S04-P01 · Gestionar Trello** — objetivo 07/09.
- [ ] **S04-P02 · Apoyar frontend** — objetivo 10/09.
- [ ] **S04-P03 · Bitácora y evidencias** — objetivo 11/09.

**Dependencias:** S04-P02 depende de S04-J01. S04-P03 depende de las evidencias y resultados del equipo.

### José López — UI/UX + Comunicación

- [ ] **S04-JO01 · Validar UI contra Figma** — objetivo 10/09.
- [ ] **S04-JO02 · Pitch de avances** — objetivo 11/09.
- [ ] **S04-JO03 · Material visual** — objetivo 11/09.

**Dependencias:** S04-JO01 depende de S04-J02. S04-JO02 y S04-JO03 dependen de los avances y evidencias reales del equipo.

### Julio Galvis — Diseño Instruccional

- [ ] **S04-JL01 · Validar navegación** — objetivo 09/09.
- [ ] **S04-JL02 · Preparar contenidos** — objetivo 10/09.
- [ ] **S04-JL03 · Validación pedagógica** — objetivo 11/09.

**Dependencias:** S04-JL01 y S04-JL02 pueden ejecutarse en paralelo. S04-JL03 depende de que exista una vista funcional.

### Jorge Cervantes — Calidad y Pruebas

- [ ] **S04-JOR01 · Pruebas funcionales** — objetivo 11/09.
- [ ] **S04-JOR02 · Calidad frontend** — objetivo 11/09.
- [ ] **S04-JOR03 · Revisión final** — objetivo 11/09.

**Dependencias:** S04-JOR01 depende de las correcciones críticas del backend. S04-JOR02 depende de S04-J02. S04-JOR03 depende de los entregables del equipo.

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

## ⚠️ 5. Riesgos y pendientes heredados

1. **Nuxt:** principal prioridad técnica de la Semana 4.
2. **Control de roles:** permanecen como prioridad las cuatro rutas identificadas previamente: `POST /submissions/start`, `POST /submissions/:id/submit`, `PUT /submissions/:id/autosave` y `POST /tutor/chat`.
3. **Contenido:** permanecen unidades de aprendizaje sin contenido sembrado en `db:seed:demo`.
4. **Sandbox:** los tests pueden presentar intermitencia por timing; cualquier fallo debe repetirse antes de declararlo defecto de código.
5. **Tutor IA:** su funcionamiento con proveedor real debe verificarse con evidencia externa al repositorio.

---

## 📅 6. Seguimiento

### Martes

Cada integrante reporta:

- Qué terminó.
- Qué está haciendo.
- Qué falta.
- Si tiene algún bloqueo.

### Jueves

Cada integrante reporta:

- Qué lleva terminado.
- Qué puede cerrar el viernes.
- Qué está en riesgo.
- Qué necesita de otro integrante.

### Viernes

Se realiza el cierre del sprint:

- Revisar Trello.
- Validar evidencias.
- Revisar GitHub.
- Separar terminado y pendiente.
- Registrar riesgos nuevos.
- Actualizar esta bitácora.
- Preparar el siguiente sprint.

---

## 🧾 7. Resultado del Sprint — completar al cierre

### Jeider Gómez

- [x] Nuxt iniciado y funcionando.
- [x] Ventana Estándar implementada.
- [x] Backend y Tutor IA verificados.

### Pedro Romero

- [ ] Trello gestionado durante el sprint.
- [ ] Apoyo técnico realizado.
- [ ] Bitácora y evidencias consolidadas.

### José López

- [ ] UI validada contra Figma.
- [ ] Pitch preparado.
- [ ] Material visual organizado.

### Julio Galvis

- [ ] Navegación validada.
- [ ] Contenidos pendientes preparados.
- [ ] Flujo pedagógico revisado.

### Jorge Cervantes

- [ ] Pruebas funcionales realizadas.
- [ ] Calidad del frontend revisada.
- [ ] Entregables revisados.

> **Nota:** esta sección se marca únicamente con base en resultados verificables al cierre del viernes 11 de septiembre.

---

## 🗂️ 8. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./docs/seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./docs/seguimiento/MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./docs/seguimiento/MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | `MONITOREO_SEMANAL.md` |

---

*Bitácora N.º 4 · Semana del 7 al 11 de septiembre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
