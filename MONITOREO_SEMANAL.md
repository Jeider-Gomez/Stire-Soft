# 🚀 Bitácora de Monitoreo y Control N.º 9 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 12 – 16 de octubre de 2026  
**Entrega de las tareas:** jueves 15 de octubre, 8:00 p. m. · **Pendientes de la Semana 8:** martes 13 de octubre, 8:00 p. m. · **Cierre de la bitácora:** viernes 16 de octubre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/eFKisFRU/stire-kanban-desarrollo-semana-09-12-16-oct-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_08.md`](./docs/seguimiento/MONITOREO_SEMANAL_08.md), cerrada el
> 12/10 con 19 de 27 ítems cumplidos. La prueba funcionó en Fundamentos (Pedro dictó y José terminó la Unidad 1) y Pedro
> terminó las secciones 1 y 2 de Pensamiento. Las tareas de Julio y Jorge que quedaron abiertas se suman a las de esta
> semana (las de los hábitos no: cada semana tiene su propio registro).

---

## 👥 1. Estructura del equipo y roles

| Integrante | Rol principal y responsabilidades del Sprint | Horario de reunión individual | GitHub User |
| :--- | :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico:** frontend Nuxt, backend, integración, Tutor IA y despliegue | **Miércoles 4:00–6:00 p. m.** | @Jeider-Gomez |
| **Jorge Cervantes** | **Gestión + Calidad:** QA general funcional, backend/API, integración y resultado ejecutable | **Jueves 10:00 a. m.–12:00 p. m.** | @IvanGoats |
| **José López** | **UI/UX + Comunicación:** identidad visual, pruebas de usuario real y documentación visual | **Miércoles 2:00–4:00 p. m.** | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC, navegación y contenidos | **Jueves 4:00–6:00 p. m.** | @jcg0912 |
| **Pedro Romero** | **Documentación + Bitácora:** Trello, evidencias, seguimiento y cierre documental | **Jueves 4:00–6:00 p. m.** | @pedrorm20 |

**Reunión de equipo:** viernes 8:00 – 8:40 p. m.  
**Reportes:** martes y jueves, máximo 8:00 p. m.  
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint

**Semana 2 de la prueba con el equipo** ([`docs/calidad/PRUEBA_DOS_SEMANAS.md`](./docs/calidad/PRUEBA_DOS_SEMANAS.md)),
**completar lo que quedó abierto de la Semana 8** y cerrar la revisión humana de las dos listas del profesor.

### Roles en la prueba *(12/10)*

Se mantiene el cruce previsto en `PRUEBA_DOS_SEMANAS.md`. A Julio y a Jorge, lo que quedó abierto de la semana 1 (🔁) se
les suma a lo de la semana 2; no se les quita nada del plan.

| Persona | Semana 9 | Lecciones |
|---|---|---|
| José | Pensamiento, secciones 1 y 2 | 5 |
| Pedro (segunda cuenta) | Pensamiento, secciones 3 y 4 | 5 |
| Jorge | 🔁 Pensamiento, secciones 1 y 2 · Fundamentos, Unidad 1 | 5 + 6 |
| Julio (segunda cuenta) | 🔁 Fundamentos, Unidad 1 · Fundamentos, Unidad 2 | 6 + 8 |

Docentes: Pedro publica la **Unidad 2** de Fundamentos y Julio las **secciones 3 y 4** de Pensamiento. José se une a la
clase de Julio y Jorge a la de Pedro (un estudiante puede estar en varias clases y cambia de clase arriba). Jeider sigue
como administrador y estudiante en las dos clases, sin obligación de terminar.

### Resultados esperados

1. **A más tardar el martes 13/10:** la encuesta SUS de los cinco (`S09-SUS-*`), los criterios de las listas de Jorge,
   Julio y Pedro (`S09-V-*`) y los resultados de la semana 1 (`S09-P03`).
2. Julio usa el rol de docente con su curso y deja el reporte de las dos semanas (`S09-JL01`, `S09-JL02`).
3. Jorge entrega el QA de las dos semanas (`S09-JOR01`, `S09-JOR02`).
4. Los estudiantes alcanzan su meta (`S09-E01` a `S09-E06`).
5. Jeider corrige los 5 hallazgos de José (`S09-J01`), consolida las dos listas y el SUS y cierra la v2.0.0 (`S09-J03`).
6. Resultados de las dos semanas de la prueba (`S09-P03`) y decisión sobre la Semana 10.
7. **Pitch grupal** de STIRE antes y después de las listas del profesor, en español y en inglés, ensayado el viernes
   (`S09-P05`, `S09-PITCH-*`).
8. Registro de los 7 Hábitos de los 5 integrantes (`S09-H-*`).
9. Bitácora cerrada el viernes 16/10, sin retraso.

---

## 📋 3. Plan de trabajo semanal

> **Fecha máxima de las tareas: jueves 15/10, 8:00 p. m.** Los criterios de las listas y los resultados de la semana 1
> tienen fecha del **martes 13/10, 8:00 p. m.** Solo la bitácora se cierra el viernes 16/10. 🔁 = tarea de la Semana 8
> que se suma a las de esta semana. Cada persona tiene sus tarjetas por separado. Cada tarjeta de Trello tiene su lista de
> verificación.

> Tablero: https://trello.com/b/eFKisFRU/stire-kanban-desarrollo-semana-09-12-16-oct-2026

### Jeider Gómez — Líder Técnico

- [ ] **S09-J01 · Los 5 hallazgos de UX de José** *(de `S08-JO02`, 09/10)*
  - En el celular, al abrir el teclado el chat del Tutor baja hasta el último mensaje.
  - Notificaciones a pantalla completa en el celular.
  - El tiempo que le queda al QR de «Mi asistencia» se ve claro (ya hay una barra; revisar con José por qué no se nota).
  - En computador, abrir las notificaciones cierra u oculta el Tutor, y al revés.
  - En arrastrar y soltar, la zona de destino se resalta mientras la pieza está encima.
- [ ] **S09-J02 · Operar la semana 2 de la prueba**
  - Comprobar cada día que la app responde; aprobar a Julio como docente si aún no lo está.
  - Revisar las sugerencias cada día y corregir en el día lo de gravedad 3; marcar las n.º 9 y 10 de Pedro.
  - Revisar el crédito de Azure el martes y el jueves.
  - Medir cuánto tarda el Tutor con el registro nuevo y decidir si hace falta la respuesta en streaming.
  - **Al terminar la prueba** (16/10, o 23/10 si hay Semana 10): reactivar el apagado automático de las 23:00 y volver
    a poner la encuesta SUS cada 90 días.
- [ ] 🔁 **S09-J03 · Cerrar la v2.0.0 con las dos listas** *(viene de `S08-J06`, `S08-J07` y `S08-J08`)*
  - Cuando estén los criterios de todos (`S09-V-*`): la tabla «nota de la IA vs. nota humana» de los 28 criterios en
    `VERIFICACION_v2.0.0.md`, con el porqué de cada diferencia.
  - SUS del equipo con las cinco respuestas (`S09-SUS-*`, §3.1).
  - Etiqueta `v2.0.0` en Git y su entrada en `CHANGELOG.md`.
- [ ] 🔁 **S09-J04 · Asistencia en el salón con cámaras reales** *(viene de `S08-J04`; fecha límite 16/10)* — un celular
  Android, un iPhone (de un compañero, en el encuentro presencial) y la cámara de un portátil.

### Julio Galvis — Diseño Instruccional

**Lo de esta semana (Semana 9)**

- [ ] **S09-JL02 · Docente de Pensamiento, semana 2** — publicar las secciones 3 y 4, revisar «Hoy» y comentar
  entregas, revisión pedagógica de las secciones 3 y 4 y reporte en `docs/cursos/REVISION_DOCENTE_PENSAR_S9.md`.
- [ ] **S09-E04 · Estudiante de Fundamentos, Unidad 2** (segunda cuenta, 8 lecciones).

**Lo que quedó abierto de la Semana 8 (se suma a lo anterior)**

- [ ] **S09-V-JULIO · Lista de TUTOR INTELIGENTE: 6 criterios como usuario** *(martes 13/10)* — MOD-01, MOD-03,
  UI-01, UI-02, UI-03 y UI-05, un comentario por criterio sin mirar la nota de la IA.
- [ ] **S09-JL01 · Docente de Pensamiento, semana 1** *(de `S08-JL01`)* — cuentas, clase y secciones 1 y 2 publicadas
  (marcar lo que ya esté), una entrega, un refuerzo, una asistencia con QR, revisión pedagógica de las secciones 1 y 2
  y reporte en `docs/cursos/REVISION_DOCENTE_PENSAR_S8.md`.
- [ ] **S09-E03 · Estudiante de Fundamentos, Unidad 1** (segunda cuenta, 6 lecciones).

### José López — UI/UX + Comunicación

- [ ] **S09-E01 · Estudiante de Pensamiento, secciones 1 y 2** (5 lecciones).
- [ ] **S09-JO01 · Revisar los 5 hallazgos corregidos y lo que más confundió en la prueba**
  - Comprobar en el celular y en el computador cómo quedaron sus 5 hallazgos (`S09-J01`).
  - Lo que más le confundió en las dos semanas como estudiante y su propuesta para la v2.0, en un comentario de la
    tarjeta con capturas.

### Jorge Cervantes — Gestión + Calidad

**Lo de esta semana (Semana 9)**

- [ ] **S09-JOR02 · QA de regresión de la Semana 9** — avisos y notificaciones, «Apariencia», el ejercicio de programar
  nuevo, la retroalimentación de opción múltiple, el Tutor en un ejercicio y los 5 hallazgos de José corregidos. Reporte
  en `docs/calidad/reportes-qa/REPORTE_QA_S9_2026-10-15.md`.
- [ ] **S09-E06 · Estudiante de Fundamentos, Unidad 1** (6 lecciones).

**Lo que quedó abierto de la Semana 8 (se suma a lo anterior)**

- [ ] **S09-V-JORGE · Lista de INTERFAZ: 5 criterios como usuario** *(martes 13/10)* — UX-02, UX-07, MOB-04, PAT-02 y
  PAT-03.
- [ ] **S09-JOR01 · QA de las funciones de la Semana 8** *(de `S08-JOR01`)* — asistencia con QR, unirse con QR,
  proyectos, entregas, foto de perfil, ajustes de UI/UX, lo corregido de su reporte anterior y el Tutor. Reporte en
  `docs/calidad/reportes-qa/REPORTE_QA_S8_2026-10-08.md`.
- [ ] **S09-E05 · Estudiante de Pensamiento, secciones 1 y 2** (5 lecciones).

### Pedro Romero — Documentación + Bitácora

- [x] **S09-P01 · Tablero Trello de la Semana 9** — creado el 12/10.
- [ ] 🔁 **S09-V-PEDRO · Lista de TUTOR INTELIGENTE: 6 criterios como usuario** *(martes 13/10)* — MOD-02, MOD-04, UI-04,
  META-01, META-02 y META-03.
- [ ] **S09-P03 · Resultados de la prueba, semanas 1 y 2** — el Excel de sugerencias, las tres preguntas de cada persona
  y el avance frente a la meta, en `docs/calidad/resultados-prueba/PRUEBA_RESULTADOS.md`. La semana 1 el martes 13/10; la
  semana 2 el viernes 16/10.
- [ ] **S09-P04 · Docente de Fundamentos (Unidad 2)** — publicar la Unidad 2, compartir la clase con Jorge, comentar las
  entregas y nota en `docs/cursos/REVISION_DOCENTE_FUNDAMENTOS_S9.md`.
- [ ] **S09-E02 · Estudiante de Pensamiento, secciones 3 y 4** (segunda cuenta, 5 lecciones).
- [ ] **S09-P02 · Bitácora** — mantenerla al día y cerrarla el viernes 16/10, contrastada con Trello y Git.

### 3.1 Todo el equipo — Encuesta de usabilidad (SUS)

Cada uno responde en STIRE la encuesta de usabilidad (Mi perfil → «Responder la encuesta de usabilidad», unos 2 minutos)
a más tardar el **martes 13/10, 8:00 p. m.** Con las cinco respuestas sale el puntaje SUS del equipo (`S09-J03`).

- [ ] **S09-SUS-JEIDER** · **S09-SUS-PEDRO** · **S09-SUS-JOSE** · **S09-SUS-JULIO** · **S09-SUS-JORGE**

### 3.2 Todo el equipo — Pitch grupal: STIRE antes y después de las listas del profesor

Unos 5 minutos, en español y en inglés. Estructura, tiempos y reparto en
[`docs/pitch/PITCH_LISTAS_CHEQUEO.md`](./docs/pitch/PITCH_LISTAS_CHEQUEO.md). Jeider abre, cada uno presenta 2 o 3 de
los criterios que revisó como usuario (antes → qué cambiamos → después, con capturas) y Pedro cierra con los totales, el
SUS y lo que falta. Las notas se escriben después de consolidar la revisión humana (`S09-J03`).

- [ ] **S09-P05 · Pitch grupal** — Pedro coordina: junta las partes, arma las 7 diapositivas y dirige el ensayo del
  viernes 16/10.
- [ ] **S09-PITCH-JEIDER** (apertura; UX-03, UX-05, UX-08, PAT-01, PAT-04) · **S09-PITCH-JOSE** (UX-01, UX-04, UX-06,
  MOB-01 a 03) · **S09-PITCH-JORGE** (UX-02, UX-07, MOB-04, PAT-02, PAT-03) · **S09-PITCH-JULIO** (MOD-01, MOD-03,
  UI-01 a 03, UI-05) · **S09-PITCH-PEDRO** (MOD-02, MOD-04, UI-04, META-01 a 03; cierre) — cada parte, el jueves 15/10.

### 3.3 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (Reto 3)

Registro libre y semanal en un comentario de su tarjeta, con la situación real de cada hábito.

- [ ] **S09-H-JEIDER** · **S09-H-PEDRO** · **S09-H-JOSE** · **S09-H-JULIO** · **S09-H-JORGE**

### 3.4 En el backlog

- **S09-J05 · Revisar los ejercicios de programar de los cursos** *(viene de `S08-J09`)*. La pantalla del ejercicio ya
  cambió el 10/10 (`docs/DISENO_EJERCICIOS_PROGRAMAR.md`); falta revisar los 28 ejercicios de Fundamentos uno por uno.

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana` (sin contar la de los 7 Hábitos). Esta semana hay
   excepciones: las tarjetas 🔁 de la Semana 8 se suman a las de la semana, y Pedro tiene la bitácora.
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Una tarjeta bloqueada permanece en `En curso` con etiqueta roja + `🚧 BLOQUEADA`.
4. Una tarea no pasa a `Hecho` sin evidencia; el código terminado tiene respaldo en GitHub.
5. Al cerrar la semana, el tablero se cierra en Trello para que quede como registro sin cambios.

---

## ⚠️ 5. Riesgos vivos

1. **Carga de Julio y Jorge:** *(nuevo, 12/10)* esta semana tienen lo suyo y lo que quedó abierto de la Semana 8. Si no
   alcanzan, la prueba no tendrá los dos estudiantes por curso ni la revisión humana completa de las listas. Mitigación:
   lo más urgente (los criterios) va el martes 13/10, y el reporte de ese día muestra cómo van.
2. **La revisión humana de las listas bloquea otras tareas:** sin los criterios de Jorge, Julio y Pedro no se consolidan
   las listas (`S09-J03`) ni se llenan las notas del pitch (`S09-P05`).
3. **Clave del Tutor:** cada estudiante necesita su propia clave gratuita de Google AI Studio.
4. **Crédito de Azure:** el servidor sigue encendido 24/7 durante la prueba; Jeider lo revisa martes y jueves y reactiva
   el apagado al terminar.
5. **Semana 10:** si alguien no termina sus lecciones, la prueba se alarga hasta el 23/10.

---

## 📅 6. Seguimiento

- **Martes 13/10:** los criterios de las listas y los resultados de la semana 1 entregados; cómo van las tarjetas 🔁;
  si hay bloqueo.
- **Jueves 15/10:** qué puede cerrar el viernes, qué está en riesgo, qué necesita de otro.
- **Viernes 16/10:** revisar Trello y GitHub, validar evidencias, resultados de las dos semanas y decidir la Semana 10.

---

## 🧾 7. Resultado del Sprint — completar al cierre

*(Se marca solo con resultados verificables al cierre del viernes 16/10.)*

---

## 🔭 8. Proyección

**Semana 10 (19 – 23 de octubre), solo si hace falta.** Cada uno termina las lecciones que le falten y Pedro publica la
Unidad 3 de Fundamentos. Al cierre: informe consolidado de la prueba, versión con lo
corregido y decisión del alcance de la v2.0. Se decide el viernes 16/10.

**Al terminar la prueba, Jeider reactiva el apagado automático de las 23:00 y pone la encuesta SUS cada 90 días.**

---

## 🗂️ 9. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./docs/seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./docs/seguimiento/MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./docs/seguimiento/MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | [`MONITOREO_SEMANAL_04.md`](./docs/seguimiento/MONITOREO_SEMANAL_04.md) |
| 5 | 14 – 18 de septiembre de 2026 | [`MONITOREO_SEMANAL_05.md`](./docs/seguimiento/MONITOREO_SEMANAL_05.md) |
| 6 | 21 – 25 de septiembre de 2026 | [`MONITOREO_SEMANAL_06.md`](./docs/seguimiento/MONITOREO_SEMANAL_06.md) |
| 7 | 28 de septiembre – 2 de octubre de 2026 | [`MONITOREO_SEMANAL_07.md`](./docs/seguimiento/MONITOREO_SEMANAL_07.md) |
| 8 | 5 – 9 de octubre de 2026 | [`MONITOREO_SEMANAL_08.md`](./docs/seguimiento/MONITOREO_SEMANAL_08.md) |
| 9 | 12 – 16 de octubre de 2026 | `MONITOREO_SEMANAL.md` (este documento) |

---

*Bitácora N.º 9 · Semana del 12 al 16 de octubre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
