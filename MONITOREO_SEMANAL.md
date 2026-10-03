# 🚀 Bitácora de Monitoreo y Control N.º 8 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 5 – 9 de octubre de 2026  
**Cierre:** viernes 9 de octubre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/UtgkXyv2/stire-kanban-desarrollo-semana-08-5-9-oct-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_07.md`](./docs/seguimiento/MONITOREO_SEMANAL_07.md), cerrada el
> 02/10 con 14 de 15 ítems cumplidos. STIRE quedó en internet en su versión 1.1, con los dos cursos cargados. Jorge hizo la
> primera auditoría sobre el entorno desplegado. Pasan a esta semana la revisión del rol de docente de Julio, los
> ajustes de UI/UX que propuso José y dos hallazgos de Jorge.

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

**Empezar la prueba de STIRE con el equipo** (semana 1 de 2), según
[`docs/calidad/PRUEBA_DOS_SEMANAS.md`](./docs/calidad/PRUEBA_DOS_SEMANAS.md): dos cursos y dos grupos que se cruzan la
semana siguiente. Todos usan la app como docente o como estudiante y envían sugerencias con el botón «Sugerencias».
Lo que bloquee el uso se corrige en el día.

### Roles en la prueba *(propuesta; se confirma el lunes 05/10)*

| Rol | Quién | Semana 8 | Semana 9 |
|---|---|---|---|
| Docente A · Fundamentos de Algoritmia | Julio | Dicta al grupo 1 | Dicta al grupo 2 |
| Docente B · Pensamiento algorítmico | Pedro | Dicta al grupo 2 | Dicta al grupo 1 |
| Estudiantes · grupo 1 | Jorge, José | Fundamentos de Algoritmia | Pensamiento algorítmico |
| Estudiantes · grupo 2 | Jeider (cuenta de estudiante) | Pensamiento algorítmico | Fundamentos de Algoritmia |

Jeider además administra: enciende el servidor cada mañana, aprueba a los docentes y atiende las sugerencias.

### Resultados esperados

1. La prueba arranca el lunes con los dos docentes aprobados y las dos clases creadas desde las plantillas.
2. Julio revisa el rol de docente con los cursos reales y deja su reporte (`S08-JL01`).
3. Jorge audita las funciones nuevas en producción (`S08-JOR01`).
4. José revisa los ajustes visuales y observa a los compañeros durante la prueba (`S08-JO02`).
5. Resultados de la semana 1 de la prueba: sugerencias y las tres preguntas de cada persona (`S08-P03`).
6. Registro de los 7 Hábitos de los 5 integrantes (`S08-H-*`).
7. Bitácora cerrada el viernes, sin retraso.

---

## 📋 3. Plan de trabajo semanal

> Tablero: https://trello.com/b/UtgkXyv2/stire-kanban-desarrollo-semana-08-5-9-oct-2026

### Jeider Gómez — Líder Técnico

- [x] **S08-J01 · Ajustes de UI/UX según las recomendaciones de José** *(viene del reporte de José, Semana 7)*
  - Tutor como panel lateral que deja ver la lección (computador); en celular sigue como cajón.
  - Menú lateral retráctil en computador, solo íconos al colapsarlo.
  - Cajas de texto que crecen solas.
  - Registro: lo obligatorio arriba y lo opcional plegado debajo; la clave de Google solo para estudiantes; dos
    columnas en computador y el botón visible sin bajar en un portátil de 1366×768.
  - Pendiente: la revisión visual de José (`S08-JO02`).
- [ ] **S08-J02 · Hallazgos del QA de Jorge** *(de su reporte del 02/10)*
  - QA-06: el indicador del nivel de ayuda del Tutor (Pista, Pregunta guía, Dónde está el error) parece un grupo de
    botones; rediseñarlo para que se lea como indicador.
  - QA-07: «No se pudo autoguardar» aparece a ratos; buscar la causa y que reintente solo.
  - Del reporte del Tutor de José (`HALLAZGOS.md`): las tarjetas de sugerencia necesitan más contraste para verse como
    botones.
- [ ] **S08-J03 · Operar la prueba**
  - Encender el servidor cada mañana (se apaga solo a las 23:00).
  - Aprobar a los docentes y revisar las sugerencias cada día.
  - Corregir en el día lo de gravedad 3 («no me dejó seguir»).
- [ ] **S08-J04 · Asistencia en el salón con cámaras reales** — probar el escáner con un celular Android, un iPhone y la
  cámara de un portátil.

### Julio Galvis — Diseño Instruccional

- [ ] **S08-JL01 · Revisar el rol de docente con los cursos reales** *(viene de `S07-JL03` y `S07-JL04`)*. Como
  docente A de la prueba:
  - crear su clase desde la plantilla de Fundamentos de Algoritmia y publicar el módulo 1;
  - revisar pedagógicamente las lecciones y ejercicios: coherencia, dificultad, instrucciones claras (en el QA de la
    Semana 7, un enunciado no se entendió);
  - crear una lección y un ejercicio propios, asignar un refuerzo y tomar la asistencia una vez;
  - reporte de hallazgos en `docs/cursos/REVISION_DOCENTE_S8.md`.

### José López — UI/UX + Comunicación

- [ ] **S08-JO02 · Revisión visual de los ajustes de UI/UX y observación durante la prueba** — revisar `S08-J01` y anotar
  en [`docs/identidad-visual/BITACORA.md`](./docs/identidad-visual/BITACORA.md) lo que vea en los compañeros mientras usan la app.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S08-JOR01 · QA de las funciones nuevas en producción** — con la
  [guía maestra](./docs/calidad/GUIA_AUDITORIA_MAESTRA.md): asistencia con QR, unirse a una clase escaneando el QR,
  proyectos, entregas, notas, foto de perfil, ajustes de UI/UX y una nueva prueba del Tutor. Reporte en
  `docs/calidad/reportes-qa/REPORTE_QA_S8_2026-10-09.md`.

### Pedro Romero — Documentación + Bitácora

- [x] **S08-P01 · Tablero Trello de la Semana 8** — creado el 02/10.
- [ ] **S08-P02 · Bitácora** — mantenerla al día y cerrarla el viernes 09/10, contrastada con Trello y Git.
- [ ] **S08-P03 · Resultados de la semana 1 de la prueba** — descargar el CSV de sugerencias y juntar las respuestas de
  las tres preguntas en `docs/calidad/resultados-prueba/PRUEBA_SEMANA_1_RESULTADOS.md`.

### 3.1 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (Reto 3)

Registro libre y semanal en un comentario de su tarjeta, con la situación real de cada hábito.

- [ ] **S08-H-JEIDER** · **S08-H-PEDRO** · **S08-H-JOSE** · **S08-H-JULIO** · **S08-H-JORGE**

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana` (sin contar la de los 7 Hábitos).
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Una tarjeta bloqueada permanece en `En curso` con etiqueta roja + `🚧 BLOQUEADA`.
4. Una tarea no pasa a `Hecho` sin evidencia; el código terminado tiene respaldo en GitHub.
5. Al cerrar la semana, el tablero se cierra en Trello para que quede como registro sin cambios.

---

## ⚠️ 5. Riesgos vivos

1. **Servidor apagado:** se apaga solo a las 23:00 y no se enciende solo. Si nadie lo enciende en la mañana, la prueba
   se detiene ese día.
2. **Clave del Tutor:** cada estudiante necesita su propia clave gratuita de Google AI Studio; sin ella no puede usar el
   Tutor.
3. **Tiempo de respuesta del Tutor:** entre 3 y 29 segundos según la carga de Google; se avisa en pantalla.
4. **Crédito de Azure:** 100 dólares; con el apagado nocturno alcanza para el semestre. Hay alertas al 50 % y al 80 %.
5. **Pocas personas:** con 5 integrantes la prueba encuentra la mayoría de problemas de uso, pero cada ausencia pesa.

---

## 📅 6. Seguimiento

- **Martes:** qué terminó, qué está haciendo, qué falta, si hay bloqueo. Sugerencias de gravedad 3 de lunes y martes.
- **Jueves:** qué puede cerrar el viernes, qué está en riesgo, qué necesita de otro.
- **Viernes:** revisar Trello y GitHub, validar evidencias, resultados de la semana 1, preparar la Semana 9.

---

## 🧾 7. Resultado del Sprint — completar al cierre

*(Se marca solo con resultados verificables al cierre del viernes 09/10.)*

---

## 🔭 8. Proyección de la Semana 9 (12 – 16 de octubre) — semana 2 de la prueba

Los grupos se cruzan: cada estudiante pasa al otro curso y cada docente dicta su curso al otro grupo.

| Quién | Qué |
|---|---|
| Jeider | Antes del lunes 12, corregir lo de gravedad 3 de la semana 1. Operar la prueba. Al final, versión **v1.2.0** con lo corregido y una propuesta de qué entra en la v2.0, a partir de los resultados. |
| Julio | Dictar su curso por segunda vez, al otro grupo, y comparar con la primera; completar la revisión pedagógica de los dos cursos. |
| José | Informe de UX de la prueba: lo que más confundió y propuestas visuales para la v2.0. |
| Jorge | QA de regresión sobre lo corregido entre semanas y verificación de que nada se rompió. |
| Pedro | Resultados de la semana 2 y el informe consolidado de la prueba (`docs/calidad/resultados-prueba/`). |
| Todos | Las tres preguntas del final de la semana y los 7 Hábitos. |

**Al cierre de la Semana 9:** resultados de las dos semanas comparados (qué cambió de un curso a otro y si la segunda vez
fue más fácil), decisión del alcance de la v2.0 y tablero de la Semana 10.

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
| 8 | 5 – 9 de octubre de 2026 | `MONITOREO_SEMANAL.md` (este documento) |

---

*Bitácora N.º 8 · Semana del 5 al 9 de octubre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
