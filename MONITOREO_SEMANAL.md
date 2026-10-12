# 🚀 Bitácora de Monitoreo y Control N.º 9 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 12 – 16 de octubre de 2026  
**Entrega de las tareas:** jueves 15 de octubre, 8:00 p. m. · **Pendientes de la Semana 8:** martes 13 de octubre, 8:00 p. m. · **Cierre de la bitácora:** viernes 16 de octubre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/eFKisFRU/stire-kanban-desarrollo-semana-09-12-16-oct-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_08.md`](./docs/seguimiento/MONITOREO_SEMANAL_08.md), cerrada el
> 12/10 con 18 de 27 ítems cumplidos. La prueba funcionó en Fundamentos (Pedro dictó y José terminó la Unidad 1) y Pedro
> terminó las secciones 1 y 2 de Pensamiento. **Julio y Jorge no dejaron registro de su semana**: sus lecciones, el
> reporte docente, el QA, sus criterios de las listas y sus hábitos pasan a esta semana.

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
**ponerse al día con lo que no se hizo en la Semana 8** y cerrar la revisión humana de las dos listas del profesor.

### Roles en la prueba, ajustados *(12/10)*

Solo cruza de curso quien terminó el suyo en la semana 1. Jorge y Julio no empezaron, así que hacen esta semana su
primer curso.

| Clase | Docente | Estudiantes en la Semana 9 | Meta de la Semana 9 |
|---|---|---|---|
| Fundamentos de Algoritmia (`ALGO-203413`) | Pedro (publica la **Unidad 2**) | Julio (segunda cuenta): **Unidad 1** *(pendiente)* | Unidad 1 completa (6 lecciones) |
| Pensamiento algorítmico (`PENSAR-ALGO`) | Julio (publica las **secciones 3 y 4**) | José: **secciones 1 y 2** · Jorge: **secciones 1 y 2** *(pendiente)* · Pedro (segunda cuenta): **secciones 3 y 4** | 5 lecciones cada uno |

José se une a la clase de Julio (un estudiante puede estar en varias clases y cambia de clase arriba). Jeider sigue como
administrador y estudiante en las dos clases, sin obligación de terminar.

### Resultados esperados

1. **Lo pendiente de la Semana 8, a más tardar el martes 13/10:** los criterios de las listas de Jorge, Julio y Pedro
   (`S09-V-*`) y los resultados de la semana 1 (`S09-P03`).
2. Julio usa el rol de docente con su curso y deja su reporte (`S09-JL01`).
3. Jorge entrega el QA en producción (`S09-JOR01`).
4. Los estudiantes alcanzan su meta (`S09-E01`, `S09-E02`, `S09-E03`).
5. Jeider corrige los 5 hallazgos de José (`S09-J01`), consolida las dos listas y el SUS y cierra la v2.0.0 (`S09-J03`).
6. Resultados de las dos semanas de la prueba (`S09-P03`) y decisión sobre la Semana 10.
7. Registro de los 7 Hábitos de los 5 integrantes (`S09-H-*`).
8. Bitácora cerrada el viernes 16/10, sin retraso.

---

## 📋 3. Plan de trabajo semanal

> **Fecha máxima de las tareas: jueves 15/10, 8:00 p. m.** Lo que viene de la Semana 8 marcado con ⏪ tiene fecha del
> **martes 13/10, 8:00 p. m.** Solo la bitácora se cierra el viernes 16/10. Cada tarjeta de Trello tiene su lista de
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
- [ ] **S09-J03 · Cerrar la v2.0.0 con las dos listas** *(viene de `S08-J06`, `S08-J07` y `S08-J08`)*
  - Cuando estén los criterios de todos (`S09-V-*`): la tabla «nota de la IA vs. nota humana» de los 28 criterios en
    `VERIFICACION_v2.0.0.md`, con el porqué de cada diferencia.
  - SUS del equipo con las cinco respuestas (Mi perfil → «Responder la encuesta de usabilidad»).
  - Etiqueta `v2.0.0` en Git y su entrada en `CHANGELOG.md`.
- [ ] **S09-J04 · Asistencia en el salón con cámaras reales** ⏪ *(viene de `S08-J04`; fecha límite 16/10)* — un celular
  Android, un iPhone (de un compañero, en el encuentro presencial) y la cámara de un portátil.

### Julio Galvis — Diseño Instruccional

- [ ] **S09-V-JULIO · Lista de TUTOR INTELIGENTE: 6 criterios como usuario** ⏪ *(martes 13/10)* — MOD-01, MOD-03, UI-01,
  UI-02, UI-03 y UI-05, un comentario por criterio sin mirar la nota de la IA.
- [ ] **S09-JL01 · Docente de Pensamiento algorítmico** ⏪ *(viene de `S08-JL01`)*
  - Publicar las secciones 3 y 4 y unir a José a la clase.
  - Revisar «Hoy» cada día; crear una entrega y comentar lo que llegue; asignar un refuerzo; tomar la asistencia una vez.
  - Revisión pedagógica de las lecciones: coherencia, dificultad e instrucciones claras.
  - Reporte en `docs/cursos/REVISION_DOCENTE_PENSAR.md`, con las dos semanas.
- [ ] **S09-E03 · Estudiante de Fundamentos, Unidad 1** ⏪ (segunda cuenta).

### José López — UI/UX + Comunicación

- [ ] **S09-E01 · Estudiante de Pensamiento, secciones 1 y 2**, con Jorge.
- [ ] **S09-JO01 · Revisar los 5 hallazgos corregidos y lo que más confundió en la prueba**
  - Comprobar en el celular y en el computador cómo quedaron sus 5 hallazgos (`S09-J01`).
  - Observar a un compañero 10 minutos haciendo una lección de Pensamiento, sin ayudarle.
  - Lo que más confundió en las dos semanas y su propuesta para la v2.0, en un comentario de la tarjeta con capturas.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S09-V-JORGE · Lista de INTERFAZ: 5 criterios como usuario** ⏪ *(martes 13/10)* — UX-02, UX-07, MOB-04, PAT-02 y
  PAT-03.
- [ ] **S09-JOR01 · QA de las funciones nuevas en producción** ⏪ *(viene de `S08-JOR01`)* — lo de la Semana 8 (asistencia
  con QR, unirse con QR, proyectos, entregas, foto de perfil, ajustes de UI/UX, Tutor) y lo nuevo de la Semana 8 (avisos
  del docente, notificaciones, temas de contraste, archivar contenidos, ejercicios de programar). Reporte en
  `docs/calidad/reportes-qa/REPORTE_QA_S9_2026-10-15.md`.
- [ ] **S09-E01 · Estudiante de Pensamiento, secciones 1 y 2** ⏪, con José.

### Pedro Romero — Documentación + Bitácora

- [x] **S09-P01 · Tablero Trello de la Semana 9** — creado el 12/10.
- [ ] **S09-V-PEDRO · Lista de TUTOR INTELIGENTE: 6 criterios como usuario** ⏪ *(martes 13/10)* — MOD-02, MOD-04, UI-04,
  META-01, META-02 y META-03.
- [ ] **S09-P03 · Resultados de la prueba, semanas 1 y 2** ⏪ — el Excel de sugerencias, las tres preguntas de cada persona
  y el avance frente a la meta, en `docs/calidad/resultados-prueba/PRUEBA_RESULTADOS.md`. La semana 1 el martes 13/10; la
  semana 2 el viernes 16/10.
- [ ] **S09-P04 · Docente de Fundamentos (Unidad 2) y estudiante de Pensamiento (secciones 3 y 4)** — publicar la Unidad 2
  y comentar las entregas; terminar el curso de Pensamiento con la segunda cuenta (`S09-E02`).
- [ ] **S09-P02 · Bitácora** — mantenerla al día y cerrarla el viernes 16/10, contrastada con Trello y Git.

### 3.1 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (Reto 3)

Registro libre y semanal en un comentario de su tarjeta, con la situación real de cada hábito.

- [ ] **S09-H-JEIDER** · **S09-H-PEDRO** · **S09-H-JOSE** · **S09-H-JULIO** · **S09-H-JORGE**

### 3.2 En el backlog

- **S09-J05 · Revisar los ejercicios de programar de los cursos** *(viene de `S08-J09`)*. La pantalla del ejercicio ya
  cambió el 10/10 (`docs/DISENO_EJERCICIOS_PROGRAMAR.md`); falta revisar los 28 ejercicios de Fundamentos uno por uno.
- **S09-P05 · Sustentación en inglés: cómo cumple STIRE las dos listas** *(viene de `S08-P05`)*. Depende de `S09-J03`.

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana` (sin contar la de los 7 Hábitos). Pedro tiene una más
   porque la bitácora es de todas las semanas.
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Una tarjeta bloqueada permanece en `En curso` con etiqueta roja + `🚧 BLOQUEADA`.
4. Una tarea no pasa a `Hecho` sin evidencia; el código terminado tiene respaldo en GitHub.
5. Al cerrar la semana, el tablero se cierra en Trello para que quede como registro sin cambios.

---

## ⚠️ 5. Riesgos vivos

1. **Participación desigual:** *(nuevo, 12/10)* en la Semana 8, dos de cinco integrantes no dejaron registro. Si se
   repite, la prueba no tendrá los dos estudiantes por curso ni la revisión humana completa de las listas. Mitigación:
   los pendientes tienen fecha del martes 13/10 y se revisan en el reporte de ese día.
2. **La revisión humana de las listas bloquea otras tareas:** sin los criterios de Jorge, Julio y Pedro no se consolidan
   las listas (`S09-J03`) ni se prepara la sustentación en inglés (`S09-P05`).
3. **Clave del Tutor:** cada estudiante necesita su propia clave gratuita de Google AI Studio.
4. **Crédito de Azure:** el servidor sigue encendido 24/7 durante la prueba; Jeider lo revisa martes y jueves y reactiva
   el apagado al terminar.
5. **Semana 10:** si Julio y Jorge no terminan su primer curso, la prueba se alarga hasta el 23/10.

---

## 📅 6. Seguimiento

- **Martes 13/10:** los pendientes ⏪ de la Semana 8 entregados; qué terminó cada uno y si hay bloqueo.
- **Jueves 15/10:** qué puede cerrar el viernes, qué está en riesgo, qué necesita de otro.
- **Viernes 16/10:** revisar Trello y GitHub, validar evidencias, resultados de las dos semanas y decidir la Semana 10.

---

## 🧾 7. Resultado del Sprint — completar al cierre

*(Se marca solo con resultados verificables al cierre del viernes 16/10.)*

---

## 🔭 8. Proyección

**Semana 10 (19 – 23 de octubre), solo si hace falta.** Julio y Jorge cruzan de curso (Julio a la Unidad 2 de
Fundamentos, Jorge a la Unidad 1); Pedro publica la Unidad 3. Al cierre: informe consolidado de la prueba, versión con lo
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
