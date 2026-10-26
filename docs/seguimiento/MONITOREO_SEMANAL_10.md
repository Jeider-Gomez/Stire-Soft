# 🚀 Bitácora de Monitoreo y Control N.º 10 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 19 – 23 de octubre de 2026  
**Partes del pitch:** lunes 19 de octubre, 6:00 p. m. · **Ensayo:** lunes 19 de octubre, 8:00 p. m. · **Ejercicios:** viernes 23 de octubre · **Cierre de la bitácora:** viernes 23 de octubre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/5zzc2oki/stire-kanban-desarrollo-semana-10-19-23-oct-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_09.md`](./MONITOREO_SEMANAL_09.md), cerrada el
> 17/10 con 23 de 36 ítems cumplidos. Se cerró la v2.0.0 y la revisión humana de las dos listas quedó en 32 / 32 y
> 24 / 24 (MOD-02 lo confirma Pedro), con un SUS del equipo de 81,5. El pitch pasa a esta semana; lo demás, al backlog.

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
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](../05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint

**Semana del pitch y de los ejercicios de programar** (decisiones de Jeider, 17/10): presentar STIRE antes y después de
las listas de chequeo del profesor, revisar la mitad de los ejercicios de programar, empezar el recorrido guiado y el
manual de usuario, y cerrar el QA de la Semana 9.

### Resultados esperados

1. Cada uno tiene su minuto del pitch, en español y en inglés, a más tardar el **lunes 19/10, 6:00 p. m.**
2. **Ensayo del pitch el lunes 19/10, 8:00 p. m.**, por Meet, con cronómetro y en los dos idiomas. Exposición: fecha por
   confirmar.
3. Los 20 ejercicios de programar de las lecciones revisados, 4 por persona, a más tardar el **viernes 23/10**.
4. El recorrido guiado dentro de STIRE (Jeider a cargo) y el manual de usuario (Pedro a cargo), avanzados y probados por
   el equipo.
5. Pedro confirma MOD-02 como usuario: la lista de Tutores queda en 24 / 24.
6. Jorge entrega el QA de regresión de la Semana 9.
7. Después de la exposición, Jeider reactiva el apagado automático de las 23:00. La encuesta SUS se queda cada 7 días.
8. Registro de los 7 Hábitos de los 5 integrantes (`S10-H-*`) y bitácora cerrada el viernes 23/10, sin retraso.

---

## 📋 3. Plan de trabajo semanal

> 🔁 = viene de la Semana 9. ⏩ = está en el backlog, pero se puede adelantar. Cada persona tiene sus tarjetas por
> separado y cada tarjeta de Trello tiene su lista de verificación.

### 3.1 El pitch y la presentación de avances

Guiones de cada uno en [`docs/pitch/PITCH_LISTAS_CHEQUEO.md`](../pitch/PITCH_LISTAS_CHEQUEO.md).

- **Pitch, sin diapositivas:** cada uno habla **1 minuto**, en español y en inglés, con la estructura de los pitch
  anteriores ([HOOK], [PROBLEM], [SOLUTION] y [CIERRE]) sobre los criterios de su lista y lo que hizo la semana. Los
  cinco forman un pitch grupal de 5 minutos. Orden: Jeider (contexto del grupo) → José → Jorge → Julio → Pedro (cierra).
- **Presentación de avances (aparte):** 15 diapositivas en inglés para el profesor, con capturas de antes y después:
  https://claude.ai/artifact/VM5P4yjDpG27rRZXYgu3Vs. Se entiende sola y también después del pitch.
- **Cifras:** antes 62,5 % y 58,3 %; hoy, según el equipo, 100 % y 100 %; SUS 81,5 (bueno).
- **Antes del ensayo:** Julio prueba «Escuchar» y el micrófono del Tutor; Pedro confirma MOD-02.

| Cuándo | Qué |
|---|---|
| Lunes 19/10, 6:00 p. m. | Cada uno tiene su minuto listo; Pedro revisa quién falta |
| **Lunes 19/10, 8:00 p. m.** | **Ensayo por Meet con cronómetro, en los dos idiomas (Pedro dirige)** |
| Por confirmar | Exposición |

### 3.2 Los ejercicios de programar

Son 36, todos de Fundamentos de Algoritmia: 20 dentro de las lecciones y 16 variantes. Se revisan como estudiante
(¿se entiende?, ¿se sabe qué recibe y qué muestra?, ¿es alcanzable con la lección?, tiempo y qué cambiarías) en
[`docs/cursos/REVISION_EJERCICIOS_PROGRAMAR_S10.md`](../cursos/REVISION_EJERCICIOS_PROGRAMAR_S10.md).

| Persona | Semana 10 · 4 de las lecciones (tarjeta `S10-EJ-*`) | ⏩ Semana 11 · variantes y uno creado como docente |
|---|---|---|
| José | Plantilla web de mi curso · Repara la página del curso · Presentación de tres diapositivas · La portada de un OVA | 4 variantes de HTML/CSS (`B-JO01`) |
| Jorge | Saludo personalizado · Área y perímetro de un rectángulo · De minutos a horas · Promedio de tres notas | 4 variantes secuenciales (`B-JOR01`) |
| Julio | ¿Aprobó o reprobó? · Fotocopias con descuento · Desempeño según la escala nacional · ¿El año es bisiesto? | 4 variantes de condicionales (`B-JL01`) |
| Pedro | Tabla de multiplicar · Cuenta regresiva · Suma del 1 al n · ¿Cuántos aprobaron? | 2 variantes de ciclos (`B-P03`) |
| Jeider | El mayor de tres números · Precios con IVA · Calificar un cuestionario · Retroalimentación para cada respuesta | 2 variantes del cuestionario (`B-J05`) |

**⏩ La otra mitad está en el backlog, pero se puede adelantar:** quien termine sus 4 puede pasar su tarjeta de la
Semana 11 a «En curso» desde ya. Ahí también está crear un ejercicio como docente y dejar una sugerencia sobre el panel.
Lo que salga de la revisión lo corrige Jeider (`B-J02`).

### Jeider Gómez — Líder Técnico

- [ ] **S10-J04 · Recorrido guiado dentro de STIRE — a cargo** *(viernes 23/10; publicado el 18/10 para el estudiante y el docente (`0690ccb`), y para contenidos, estudiantes y notas del docente y las pantallas del administrador (`2e9d2c8`); falta probarlo con teclado y lector de pantalla)* — señala cada parte de la pantalla con
  una explicación corta la primera vez que se entra, y se repite desde un botón «?». Estudiante: inicio, lección,
  ejercicio, Tutor y progreso. Docente: «Hoy», contenidos, estudiantes y notas. Driver.js (licencia MIT). Todos lo
  prueban cuando esté publicado.
- [ ] **S10-EJ-JEIDER · Sus 4 ejercicios de programar** *(viernes 23/10)*.
- [x] **Entrar por `/login`** ya no termina en «No encontramos esa página» (`ff81570`, 18/10).
- [ ] **S10-J02 · Operar el servidor** — arriba en el ensayo y en la exposición; después, el apagado de las 23:00.
- [x] **Su parte del pitch** — contexto del grupo, UX-08 y PAT-01, en los dos idiomas.
- [x] **Presentación de avances** y guiones del pitch para cada uno. *(17/10.)*
- [x] **Encuesta SUS cada 7 días**, ya sin volver a 90. *(17/10.)*
- [x] **S10-J03 · Hablarle al Tutor con la voz en cualquier navegador** *(17/10)* — primero el dictado del navegador (no
  gasta tokens); si no lo soporta (Brave en el computador), graba la voz y Gemini la pasa a texto con la clave del
  estudiante. STIRE no guarda los audios. El campo del chat quedó como el de los chats de IA: un botón que es micrófono
  sin texto y enviar con texto, y ya no se sale en el celular (`a6d40ee`, `fe57dbe`, `c33d1ce`). Probado por Jeider en
  Chrome y en el celular.

### Pedro Romero — Documentación + Bitácora

- [x] **S10-P01 · Tablero de la Semana 10** — creado el 17/10.
- [ ] 🔁 **S10-PITCH-PEDRO · Su minuto y el cierre** *(lunes 19/10)* — guion con MOD-02 y UI-04.
- [ ] 🔁 **S10-P05 · Coordinar el pitch** — que todos tengan su parte, dirigir el ensayo del lunes 19/10 y mostrar la
  presentación al profesor.
- [ ] **S10-P06 · Confirmar MOD-02 como usuario** *(lunes 19/10)*.
- [ ] **S10-P07 · Manual de usuario — a cargo** *(viernes 23/10)* — por tareas y por rol, como las guías de Canvas,
  Classroom y Open edX: 6 tareas del estudiante y 6 del docente, cada una con pasos, una captura y «si algo sale mal».
  **Cambio del 18/10 (Jeider):** el manual vive en la aplicación, en https://stire-soft.vercel.app/ayuda (se abre sin
  cuenta y se descarga en PDF). Ya están la plantilla con la identidad de STIRE, los primeros pasos, «unirme a una
  clase», «crear una clase» y «cómo funciona STIRE». Pedro completa las demás tareas en `frontend-nuxt/utils/manual.ts`
  (copiar una tarea y cambiar sus textos) y sus capturas en `frontend-nuxt/public/manual/capturas/`. Mismas palabras
  que el recorrido guiado.
- [ ] **S10-EJ-PEDRO · Sus 4 ejercicios de programar** *(viernes 23/10)*.
- [ ] **S10-P02 · Bitácora** — al día y cerrada el viernes 23/10.

### José López — UI/UX + Comunicación

- [ ] 🔁 **S10-PITCH-JOSE · Su minuto** *(lunes 19/10)* — guion con UX-01 y MOB-02.
- [ ] **S10-EJ-JOSE · Sus 4 ejercicios de programar** *(viernes 23/10)*.

### Jorge Cervantes — Gestión + Calidad

- [ ] 🔁 **S10-PITCH-JORGE · Su minuto** *(lunes 19/10)* — guion con UX-02; le falta su segundo criterio.
- [ ] 🔁 **S10-JOR02 · QA de regresión de la Semana 9** *(jueves 22/10)* — avisos y notificaciones, «Apariencia», el
  ejercicio de programar, la retroalimentación de opción múltiple, el Tutor, los 5 hallazgos de José y lo nuevo del 17/10.
  Reporte en `docs/calidad/reportes-qa/REPORTE_QA_S9.md`.
- [ ] **S10-EJ-JORGE · Sus 4 ejercicios de programar** *(viernes 23/10)*.

### Julio Galvis — Diseño Instruccional

- [ ] 🔁 **S10-PITCH-JULIO · Su minuto** *(lunes 19/10)* — guion con UI-05 y UI-01; le falta su [CIERRE].
- [ ] **S10-EJ-JULIO · Sus 4 ejercicios de programar** *(viernes 23/10)*.

### 3.3 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (Reto 3)

Registro libre y semanal en un comentario de su tarjeta, con la situación real de cada hábito.

- [ ] **S10-H-JEIDER** · **S10-H-PEDRO** · **S10-H-JOSE** · **S10-H-JORGE** · **S10-H-JULIO**

### 3.4 En el backlog

| Persona | Tarjetas |
|---|---|
| Jeider | ⏩ `B-J05` 2 variantes y un ejercicio creado · `B-J02` corregir los ejercicios según la revisión · 🔁 `B-J03` asistencia con un iPhone |
| Pedro | ⏩ `B-P03` 2 variantes y un ejercicio creado · 🔁 `B-P01` resultados de la prueba |
| José | ⏩ `B-JO01` 4 variantes y un ejercicio creado |
| Jorge | ⏩ `B-JOR01` 4 variantes y un ejercicio creado |
| Julio | ⏩ `B-JL01` 4 variantes y un ejercicio creado · 🔁 `B-JL02` docente de Pensamiento · 🔁 `B-JL03` estudiante de Fundamentos |

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

1. **Partes del pitch que no llegan:** en la Semana 9 quedaron sin entregar las de José, Jorge, Julio y Pedro.
   Mitigación: cada uno ya tiene su guion; plazo el lunes 19/10 a las 6:00 p. m. y Pedro revisa antes del ensayo quién
   falta.
2. **Fecha de la exposición sin confirmar:** si cae antes del lunes, todo se adelanta.
3. **Carga de la semana:** pitch, 4 ejercicios por persona y, para Jeider y Pedro, el recorrido guiado y el manual.
   Mitigación: los ejercicios son cortos (unos 10 a 15 minutos cada uno) y las variantes quedan para la Semana 11.
4. **Crédito de Azure:** el servidor sigue encendido 24/7 hasta la exposición; después se reactiva el apagado.

---

## 📅 6. Seguimiento

- **Lunes 19/10:** partes del pitch listas (6:00 p. m.), MOD-02 confirmado y **ensayo a las 8:00 p. m.**
- **Martes 20/10 y jueves 22/10:** cómo van los ejercicios, el recorrido guiado, el manual y el QA de Jorge.
- **Viernes 23/10:** revisar Trello y GitHub, validar evidencias y decidir qué entra a la Semana 11.

---

## 🧾 7. Resultado del Sprint — cierre

*(Se marca solo con lo verificable en Trello y Git. El cierre debía ser el viernes 23/10 y se hizo el lunes 26/10 con
el tablero tal como quedó. Lo que pasó fuera del repositorio (pitch, servidor, coordinación, hábitos) lo confirmó
Jeider.)*

**Resultado: 23 de 27 ítems cumplidos.** Se ensayó y se expuso el pitch con los cinco; el recorrido guiado y el manual
quedaron publicados dentro de STIRE; José y Jorge revisaron sus 4 ejercicios de programar.

### Jeider Gómez

- [x] Recorrido guiado dentro de STIRE (`S10-J04`): publicado el 18/10 para el estudiante y el docente, con todas las
  pantallas del menú y de la clase el 20/10, y «Saltar recorrido» y «No volver a mostrar» el 23/10. Queda probarlo con
  lector de pantalla (pasa a la verificación de la Semana 11).
- [x] Operar el servidor en la semana del pitch (`S10-J02`), con el apagado de las 23:00 reactivado después.
- [x] Su parte del pitch, la presentación de avances, la encuesta SUS cada 7 días, la voz del Tutor en cualquier
  navegador (`S10-J03`) y la entrada por `/login`.
- [ ] 🔁 Sus 4 ejercicios de programar (`S10-EJ-JEIDER`): sin llenar en `REVISION_EJERCICIOS_PROGRAMAR_S10.md`. **Pasa a
  la Semana 11.**

Además, fuera del plan: el panel flotante de asistencia, «Errores que más se repiten esta semana» en «Hoy», el registro
solo para mayores de 18 con términos y política de datos, las mejoras de la evaluación heurística y el inicio del
rediseño del panel del docente (aspecto propio y barra lateral nueva, 24/10).

### Pedro Romero

- [x] Tablero de la Semana 10 (`S10-P01`), su minuto y el cierre del pitch, la coordinación del pitch y el ensayo
  (`S10-P05`), MOD-02 confirmado (`S10-P06`), el manual en `/ayuda` (`S10-P07`) y esta bitácora (`S10-P02`).
- [ ] 🔁 Sus 4 ejercicios de programar (`S10-EJ-PEDRO`). **Pasa a la Semana 11.**

### José López

- [x] Su minuto del pitch y sus 4 ejercicios de programar (`S10-EJ-JOSE`), con las filas llenas el 23/10.

### Jorge Cervantes

- [x] Su minuto del pitch y sus 4 ejercicios de programar (`S10-EJ-JORGE`), con las filas llenas el 25/10.
- [ ] 🔁 QA de regresión de la Semana 9 (`S10-JOR02`): no está `REPORTE_QA_S9.md`. **Pasa a la Semana 11.**

### Julio Galvis

- [x] Su minuto del pitch.
- [ ] 🔁 Sus 4 ejercicios de programar (`S10-EJ-JULIO`). **Pasa a la Semana 11.**

### Los 7 Hábitos

- [x] Los cinco registraron su semana (`S10-H-*`).

---

## 🔭 8. Proyección

**Semana 11 (26 – 30 de octubre):** las 16 variantes de los ejercicios y un ejercicio creado como docente por cada uno
(si no se adelantaron), las correcciones que salgan de la revisión, el recorrido guiado y el manual terminados y probados
por todo el equipo.

---

## 🗂️ 9. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | [`MONITOREO_SEMANAL_04.md`](./MONITOREO_SEMANAL_04.md) |
| 5 | 14 – 18 de septiembre de 2026 | [`MONITOREO_SEMANAL_05.md`](./MONITOREO_SEMANAL_05.md) |
| 6 | 21 – 25 de septiembre de 2026 | [`MONITOREO_SEMANAL_06.md`](./MONITOREO_SEMANAL_06.md) |
| 7 | 28 de septiembre – 2 de octubre de 2026 | [`MONITOREO_SEMANAL_07.md`](./MONITOREO_SEMANAL_07.md) |
| 8 | 5 – 9 de octubre de 2026 | [`MONITOREO_SEMANAL_08.md`](./MONITOREO_SEMANAL_08.md) |
| 9 | 12 – 16 de octubre de 2026 | [`MONITOREO_SEMANAL_09.md`](./MONITOREO_SEMANAL_09.md) |
| 10 | 19 – 23 de octubre de 2026 | [`MONITOREO_SEMANAL_10.md`](./MONITOREO_SEMANAL_10.md) |

---

*Bitácora N.º 10 · Semana del 19 al 23 de octubre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
