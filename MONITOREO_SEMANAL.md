# 🚀 Bitácora de Monitoreo y Control N.º 13 — Proyecto: STIRE

**Curso:** DDSE3 — 2026-2
**Grupo:** [G1 / G2]
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft
**Semana:** 9 – 13 de noviembre de 2026
**Evaluación heurística completa:** martes 10 de noviembre, 8:00 p. m. · **Prueba con 2 personas:** viernes 13 de noviembre · **Cierre de la bitácora:** viernes 13 de noviembre, 8:00 p. m. · **Informe y artículo:** domingo 15 de noviembre
**Tablero Kanban:** *(enlace del tablero de la Semana 13)*

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_12.md`](./docs/seguimiento/MONITOREO_SEMANAL_12.md), cerrada el
> 9/11 con 1 de 11 tarjetas terminadas: solo avanzó Jeider (P60 y P61, el diseño de la tercera versión y su pestaña de
> la evaluación). Las pestañas que faltan de la evaluación heurística se suman a esta semana con 🔁. Las verificaciones
> del panel, las políticas y los ejercicios pasan al backlog como objetivos personales.

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

**Tres frentes, solo lo que pide el profesor.** Sus requisitos están en
[`docs/curso-ddse3/README.md`](./docs/curso-ddse3/README.md) §4c (guías del 9/11 y su audio del 20/10). Todo lo demás es
objetivo personal y está en el backlog.

1. **Evaluación heurística de expertos:** las cinco pestañas completas el **martes 10/11**, juntas en una tabla por ítem
   y las mejoras de lo más grave.
2. **Prueba de usuario final con 10 personas** (2 por integrante) con el protocolo de observación de
   [`docs/calidad/PRUEBA_CON_PERSONAS.md`](./docs/calidad/PRUEBA_CON_PERSONAS.md), a más tardar el **viernes 13/11**.
3. **Artículo de implementación y evaluación:** elegir la revista de la lista del profesor y escribir el **Resumen y los
   Resultados** como los pide esa revista, con las tres evaluaciones: la heurística, la de usuarios y la prueba de
   estrés. Para el **domingo 15/11**.

---

## 📋 3. Plan de trabajo semanal

> 🔁 = viene de la Semana 12 y se suma a esta semana. Si ya lo hiciste, márcalo. Cada persona tiene sus tarjetas por
> separado.

### Frente 1 · Evaluación heurística

- [x] 🔁 **Jorge** *(martes 10/11)*: los ítems 28, 29, 33 y 34 y las filas 35 a 39. **Jeider lo está esperando.**
- [x] 🔁 **José** *(martes 10/11)*: la frecuencia y el impacto de sus 7 ítems; sin eso no hay severidad. *(Los calificó
  todos con 5, así que van en 0.)*
- [ ] 🔁 **Julio** *(martes 10/11)*: la calificación del ítem 9 y las filas 35 a 39.
- [x] 🔁 **Jeider** *(jueves 12/11)*: juntarla en una tabla por ítem
  ([resultados](./docs/calidad/EVALUACION_HEURISTICA_HUMANA_S11.md#resultados-tabla-por-ítem-1011)). Promedio 4,21 de 5.
- [ ] **Jeider** *(jueves 12/11)*: la mejora de severidad 4, el ítem 6 (los números del avance se contradicen). El
  ítem 33 (solo mayores de 18) es una decisión tomada y queda registrado como trabajo futuro.

### Frente 2 · Prueba de usuario final (10 personas)

- [ ] 🔁 **Los cinco** *(viernes 13/11)*: 2 personas cada uno, mayores de 18 y que no hayan usado STIRE (un amigo, un
  primo: no tiene que ser en un colegio). Se sigue el protocolo de observación de
  [`PRUEBA_CON_PERSONAS.md`](./docs/calidad/PRUEBA_CON_PERSONAS.md): la persona hace 8 tareas diciendo lo que piensa, el
  observador no ayuda y anota dónde duda; al final, la encuesta SUS y tres preguntas. Una hoja por persona.
- [ ] **Jeider** *(domingo 15/11)*: el informe de las 10.

### Frente 3 · Artículo de implementación y evaluación

- [ ] **Pedro** *(miércoles 11/11)*: elegir la revista (y dos de respaldo) de la lista del profesor, con su categoría
  vigente en Publindex o Scimago, y bajar 2 o 3 artículos de ejemplo de ella.
- [ ] **Jorge con Jeider** *(jueves 12/11)*: la **prueba de estrés** como la pidió el profesor: una batería de casos con
  distintos perfiles de estudiante (una tabla con cada perfil y por qué), y con ellos 100 a 300 usuarios de prueba
  marcados para borrarlos después, que entran y usan STIRE solos. Se corre en local, no en el servidor gratuito.
- [ ] **Jeider** *(domingo 15/11)*: el Resumen y los Resultados con las tres evaluaciones, en el formato de la revista
  elegida.
- [ ] **Pedro** *(viernes 13/11)*: la bitácora N.º 13 al día y cerrada.

### En el backlog: objetivos personales

No los pide el profesor; cada uno los hace si le queda tiempo.

| Persona | Tarjetas |
|---|---|
| Jeider | Rediseño de la tercera versión · `B-J02` corregir los ejercicios según la revisión · `B-J04` el resto del panel v2 · `B-J05` ejercicios de función (P57) y tiempos (P59) |
| Pedro | Verificación PD-13, PD-14 y PV-01 · `S11-P03` políticas · `EJ-PEDRO` ejercicios 13 a 16 · `B-P01` resultados de la prueba, semanas 1 y 2 |
| Jorge | Verificación PD-05 a PD-10 y PV-03 |
| Julio | Verificación PD-11, PD-12, PV-02 y PV-05 · `EJ-JULIO` ejercicios 9 a 12 |

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

1. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
2. Una tarjeta bloqueada permanece en `En curso` con etiqueta roja + `🚧 BLOQUEADA`.
3. Una tarea no pasa a `Hecho` sin evidencia; el código terminado tiene respaldo en GitHub.
4. Al cerrar la semana, el tablero queda como registro sin cambios.

---

## ⚠️ 5. Riesgos vivos

1. **La evaluación heurística sigue incompleta desde el 5/11** y las mejoras esperan por Jorge. Mitigación: plazo el
   martes 10/11; el miércoles se junta con lo que haya y se dice qué faltó.
2. **Prueba con 10 personas:** depende de que cada uno consiga 2 personas y les pida su consentimiento. Mitigación:
   buscarlas desde hoy, no el viernes.
3. **Prueba de estrés:** en el despliegue podría tumbar el servidor gratuito durante la prueba con personas.
   Mitigación: se corre en local.

---

## 📅 6. Seguimiento

- **Lunes 9/11:** cierre de la Semana 12 y tablero de la Semana 13.
- **Martes 10/11, 8:00 p. m.:** las cinco pestañas de la evaluación heurística completas.
- **Miércoles 11/11:** la revista elegida y sus artículos de ejemplo.
- **Jueves 12/11:** las mejoras de la evaluación y la prueba de estrés.
- **Viernes 13/11:** prueba con 2 personas de cada integrante y cierre de la bitácora.
- **Domingo 15/11:** informe de las 10, Resumen y Resultados del artículo.

---

## 🧾 7. Resultado del Sprint — completar al cierre

*(Se marca solo con resultados verificables al cierre del viernes 13/11.)*

---

## 🔭 8. Proyección

**Semana 14 (16 – 20 de noviembre):** los ajustes que salgan de las pruebas, el siguiente avance del artículo y su
envío a una de las 3 revistas. El proyecto integrador final se sustenta en la Semana 16 (24 y 26 de noviembre).

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
| 9 | 12 – 16 de octubre de 2026 | [`MONITOREO_SEMANAL_09.md`](./docs/seguimiento/MONITOREO_SEMANAL_09.md) |
| 10 | 19 – 23 de octubre de 2026 | [`MONITOREO_SEMANAL_10.md`](./docs/seguimiento/MONITOREO_SEMANAL_10.md) |
| 11 | 26 – 30 de octubre de 2026 | [`MONITOREO_SEMANAL_11.md`](./docs/seguimiento/MONITOREO_SEMANAL_11.md) |
| 12 | 2 – 6 de noviembre de 2026 | [`MONITOREO_SEMANAL_12.md`](./docs/seguimiento/MONITOREO_SEMANAL_12.md) |
| 13 | 9 – 13 de noviembre de 2026 | `MONITOREO_SEMANAL.md` (este documento) |

---

*Bitácora N.º 13 · Semana del 9 al 13 de noviembre de 2026.*
*Responsable de seguimiento y cierre documental: Pedro Romero.*
