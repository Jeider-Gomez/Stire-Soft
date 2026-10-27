# 🚀 Bitácora de Monitoreo y Control N.º 11 — Proyecto: STIRE

**Curso:** DDSE3 — 2026-2
**Grupo:** [G1 / G2]
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft
**Semana:** 26 – 30 de octubre de 2026
**Verificación del panel del docente:** jueves 29 de octubre, 8:00 p. m. · **Ejercicios:** viernes 30 de octubre · **Cierre de la bitácora:** viernes 30 de octubre, 8:00 p. m.
**Tablero Kanban:** https://trello.com/b/HKakzG7r/stire-kanban-desarrollo-semana-11-26-30-oct-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_10.md`](./docs/seguimiento/MONITOREO_SEMANAL_10.md), cerrada el
> 26/10 con 23 de 27 ítems cumplidos. Se ensayó y se expuso el pitch con los cinco, y el recorrido guiado y el manual
> quedaron dentro de STIRE. Los ejercicios de Julio, Pedro y Jeider y el QA de la Semana 9 de Jorge se suman a esta
> semana (los hábitos no: cada semana tiene su propio registro).

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

**Semana de la verificación del panel del docente** (decisión de Jeider, 26/10): que el equipo pruebe como usuario lo
nuevo del panel del docente y revise la propuesta del panel v2 antes de seguir programándola, y terminar la revisión de
los ejercicios de programar.

### Resultados esperados

1. **Verificación humana del panel del docente** en
   [`docs/calidad/VERIFICACION_PANEL_DOCENTE_S11.md`](./docs/calidad/VERIFICACION_PANEL_DOCENTE_S11.md): 17 criterios de
   lo que ya está publicado (Parte A) y 6 partes del prototipo del panel v2 (Parte B), repartidos por persona, a más
   tardar el **jueves 29/10, 8:00 p. m.**
2. Los ejercicios de programar que faltan (los 4 de Julio, Pedro y Jeider), las 16 variantes y un ejercicio creado como
   docente por cada uno, en `docs/cursos/REVISION_EJERCICIOS_PROGRAMAR_S10.md`, a más tardar el **viernes 30/10**.
3. Jorge entrega el QA de regresión de la Semana 9.
4. Jeider corrige lo que salga de la verificación y sigue con la siguiente parte del panel v2 (el Inicio del docente).
5. Registro de los 7 Hábitos de los 5 integrantes (`S11-H-*`) y bitácora cerrada el viernes 30/10.

---

## 📋 3. Plan de trabajo semanal

> 🔁 = viene de la Semana 10. Cada persona tiene sus tarjetas por separado y cada tarjeta de Trello tiene su lista de
> verificación.

### 3.1 La verificación del panel del docente

Cada uno prueba su parte **como usuario** en https://stire-soft.vercel.app y llena su fila (Cumple · Parcial · No
cumple, y qué vio). Se decide por lo que se ve y se hace, no por lo que dice el código ni una IA. El prototipo del panel
v2 es aparte: no guarda nada y Jeider comparte el enlace en el grupo.

| Persona | Parte A · lo publicado | Parte B · el prototipo |
|---|---|---|
| José | PD-01 a PD-04: el aspecto del docente, los temas oscuro y de alto contraste, «Reducir el movimiento», el celular y el menú plegado | PV-04: la pantalla del estudiante |
| Jorge | PD-05 a PD-10: el selector de clase, quedarse en la sección al cambiar de clase, recordar la última clase, «Crear clase», las cinco secciones y el teclado | PV-03: el diseñador de los 7 tipos de ejercicio |
| Julio | PD-11 y PD-12: la asistencia en panel flotante y «Errores que más se repiten esta semana» | PV-02 y PV-05: el contenido del curso con explicaciones que se desbloquean, y Estudiantes y avance con alertas y opinión |
| Pedro | PD-13 y PD-14: el recorrido guiado y el manual con los nombres nuevos, y el flujo completo del docente | PV-01: Inicio y Biblioteca de plantillas |
| Jeider | PD-15 a PD-17: el registro para mayores de 18, las mejoras heurísticas y «No volver a preguntarme» | PV-06: Ajustes de la clase y el Asistente |

### 3.2 Los ejercicios de programar

En [`docs/cursos/REVISION_EJERCICIOS_PROGRAMAR_S10.md`](./docs/cursos/REVISION_EJERCICIOS_PROGRAMAR_S10.md), como en la
Semana 10. Al final, cada uno crea un ejercicio de programar como docente y anota qué le costó y una sugerencia.

| Persona | 🔁 De la Semana 10 | Variantes | Ejercicio creado como docente |
|---|---|---|---|
| José | — | 21 a 24 (HTML/CSS) | Sí |
| Jorge | — | 25 a 28 (secuenciales) | Sí |
| Julio | 9 a 12 (condicionales) | 29 a 32 (condicionales) | Sí |
| Pedro | 13 a 16 (ciclos) | 33 y 34 (ciclos) | Sí |
| Jeider | 17 a 20 (funciones y OVA) | 35 y 36 (cuestionario) | Sí |

### Jeider Gómez — Líder Técnico

- [ ] **S11-RV-JEIDER · Su parte de la verificación** *(jueves 29/10)* — PD-15 a PD-17 y PV-06. Compartir el enlace del
  prototipo con el equipo el lunes 26/10.
- [ ] 🔁 **S11-EJ-JEIDER · Ejercicios** *(viernes 30/10)* — los 4 de la Semana 10, sus 2 variantes y uno creado como
  docente.
- [ ] **S11-J01 · Panel del docente v2, siguiente parte** *(viernes 30/10)* — corregir lo que salga de PD-01 a PD-10 y
  publicar el Inicio nuevo del docente (por revisar de todas las clases y las clases en tarjetas o lista).

### Pedro Romero — Documentación + Bitácora

- [x] **S11-P01 · Tablero de la Semana 11** — creado el 26/10.
- [ ] **S11-RV-PEDRO · Su parte de la verificación** *(jueves 29/10)* — PD-13, PD-14 y PV-01. Lo que haya que cambiar en
  el manual por los nombres nuevos del menú, anotado.
- [ ] 🔁 **S11-EJ-PEDRO · Ejercicios** *(viernes 30/10)* — los 4 de la Semana 10, sus 2 variantes y uno creado como
  docente.
- [ ] **S11-P02 · Bitácora** — al día y cerrada el viernes 30/10.

### José López — UI/UX + Comunicación

- [ ] **S11-RV-JOSE · Su parte de la verificación** *(jueves 29/10)* — PD-01 a PD-04 y PV-04.
- [ ] **S11-EJ-JOSE · Ejercicios** *(viernes 30/10)* — sus 4 variantes y uno creado como docente.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S11-RV-JORGE · Su parte de la verificación** *(jueves 29/10)* — PD-05 a PD-10 y PV-03.
- [ ] 🔁 **S11-JOR02 · QA de regresión de la Semana 9** *(miércoles 28/10)* — reporte en
  `docs/calidad/reportes-qa/REPORTE_QA_S9.md`.
- [ ] **S11-EJ-JORGE · Ejercicios** *(viernes 30/10)* — sus 4 variantes y uno creado como docente.

### Julio Galvis — Diseño Instruccional

- [ ] **S11-RV-JULIO · Su parte de la verificación** *(jueves 29/10)* — PD-11, PD-12, PV-02 y PV-05.
- [ ] 🔁 **S11-EJ-JULIO · Ejercicios de la Semana 10** *(miércoles 28/10)* — los 4 de condicionales.
- [ ] **S11-EJ2-JULIO · Variantes y ejercicio creado** *(viernes 30/10)* — sus 4 variantes y uno creado como docente.

### 3.3 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (Reto 3)

Registro libre y semanal en un comentario de su tarjeta, con la situación real de cada hábito.

- [ ] **S11-H-JEIDER** · **S11-H-PEDRO** · **S11-H-JOSE** · **S11-H-JORGE** · **S11-H-JULIO**

### 3.4 En el backlog

| Persona | Tarjetas |
|---|---|
| Jeider | `B-J02` corregir los ejercicios según la revisión · `B-J03` asistencia con un iPhone · el resto del panel v2 (Biblioteca, Contenido del curso, y lo que necesita servidor: varias explicaciones por unidad, portada, alertas y el Asistente) |
| Pedro | `B-P01` resultados de la prueba, semanas 1 y 2 |
| Julio | `B-JL02` docente de Pensamiento, semanas 1 y 2 · `B-JL03` estudiante de Fundamentos, Unidades 1 y 2 |

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana` (sin contar la de los 7 Hábitos).
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Una tarjeta bloqueada permanece en `En curso` con etiqueta roja + `🚧 BLOQUEADA`.
4. Una tarea no pasa a `Hecho` sin evidencia; el código terminado tiene respaldo en GitHub.
5. Una tarjeta del backlog marcada ⏩ se puede pasar a `En curso` cuando la persona termina sus tareas de la semana.
6. Al cerrar la semana, el tablero se cierra en Trello para que quede como registro sin cambios.

---

## ⚠️ 5. Riesgos vivos

1. **El prototipo no es STIRE:** la Parte B se revisa sobre una propuesta con datos de ejemplo. Mitigación: la tabla
   pide comparar con el panel de hoy y anotar qué falta, no si «funciona».
2. **Ejercicios acumulados:** Julio, Pedro y Jeider llevan 4 de la Semana 10 más las variantes. Mitigación: los de la
   Semana 10 primero (Julio, miércoles 28/10) y las variantes hasta el viernes.
3. **El QA de la Semana 9 lleva dos semanas abierto.** Mitigación: plazo propio el miércoles 28/10.
4. **Cambios en el panel mientras se verifica:** si Jeider publica el Inicio nuevo antes del jueves, se avisa en el grupo
   qué criterio cambió.

---

## 📅 6. Seguimiento

- **Lunes 26/10:** tablero creado, el enlace del prototipo compartido y la verificación repartida.
- **Martes 27/10:** cómo va la verificación y los ejercicios.
- **Miércoles 28/10:** ejercicios de Julio de la Semana 10 y QA de la Semana 9.
- **Jueves 29/10, 8:00 p. m.:** verificación del panel del docente completa.
- **Viernes 30/10:** revisar Trello y GitHub, validar evidencias y decidir qué entra a la Semana 12.

---

## 🧾 7. Resultado del Sprint — completar al cierre

*(Se marca solo con resultados verificables al cierre del viernes 30/10.)*

---

## 🔭 8. Proyección

**Semana 12 (2 – 6 de noviembre):** corregir lo que salga de la verificación, seguir con el panel v2 (Biblioteca y
Contenido del curso) y decidir con el equipo qué partes que necesitan servidor van primero (varias explicaciones por
unidad, alertas, portada y el Asistente).

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
| 11 | 26 – 30 de octubre de 2026 | `MONITOREO_SEMANAL.md` (este documento) |

---

*Bitácora N.º 11 · Semana del 26 al 30 de octubre de 2026.*
*Responsable de seguimiento y cierre documental: Pedro Romero.*
