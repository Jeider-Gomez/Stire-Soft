# 🚀 Bitácora de Monitoreo y Control N.º 8 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 5 – 9 de octubre de 2026  
**Entrega de las tareas:** jueves 8 de octubre, 8:00 p. m. · **Cierre de la bitácora:** viernes 9 de octubre, 8:00 p. m.  
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

### Roles en la prueba *(acordados el 02/10)*

Cada docente dicta un curso a dos estudiantes y es estudiante del curso del otro con una segunda cuenta (validación
cruzada). José y Jorge cambian de curso en la Semana 9. Detalle en `PRUEBA_DOS_SEMANAS.md` §1.

| Clase | Docente | Estudiantes en la Semana 8 | Meta de la Semana 8 |
|---|---|---|---|
| Fundamentos de Algoritmia (`ALGO-203413`) | Pedro | José y Julio (segunda cuenta) | **Unidad 1** completa (6 lecciones) |
| Pensamiento algorítmico (`PENSAR-ALGO`) | Julio | Jorge y Pedro (segunda cuenta) | **Secciones 1 y 2** completas (5 lecciones) |

Jeider entra como estudiante en las dos clases, sin obligación de terminar, y administra: vigila que el servidor esté
arriba (sin apagado automático durante la prueba), aprueba a los docentes y atiende las sugerencias.

### Resultados esperados

1. La prueba arranca el lunes con Pedro y Julio aprobados como docentes, las dos clases creadas desde las plantillas y
   los cuatro estudiantes unidos a su clase.
2. Los estudiantes alcanzan la meta de la semana: Unidad 1 de Fundamentos y secciones 1 y 2 de Pensamiento (`S08-E01`, `S08-E02`).
3. Pedro y Julio usan el rol de docente con su curso y dejan su revisión (`S08-P04`, `S08-JL01`).
4. Jorge audita las funciones nuevas en producción (`S08-JOR01`).
5. José revisa los ajustes visuales y observa a los compañeros durante la prueba (`S08-JO02`).
6. Resultados de la semana 1 de la prueba: sugerencias y las tres preguntas de cada persona (`S08-P03`).
7. Registro de los 7 Hábitos de los 5 integrantes (`S08-H-*`).
8. Bitácora cerrada el viernes, sin retraso.

---

## 📋 3. Plan de trabajo semanal

> **Fecha máxima de todas las tareas: jueves 08/10, 8:00 p. m.** Solo la bitácora se cierra el viernes 09/10. Cada
> tarjeta de Trello tiene su lista de verificación.

> Tablero: https://trello.com/b/UtgkXyv2/stire-kanban-desarrollo-semana-08-5-9-oct-2026

### Jeider Gómez — Líder Técnico

- [x] **S08-J01 · Ajustes de UI/UX según las recomendaciones de José** *(viene del reporte de José, Semana 7)*
  - Tutor como panel lateral que deja ver la lección (computador); en celular sigue como cajón.
  - Menú lateral retráctil en computador, solo íconos al colapsarlo.
  - Cajas de texto que crecen solas.
  - Registro: lo obligatorio arriba y lo opcional plegado debajo; la clave de Google solo para estudiantes; dos
    columnas en computador y el botón visible sin bajar en un portátil de 1366×768.
  - Segunda ronda (revisión propia, 03/10): todas las ventanas emergentes con scroll (al crear un curso con una
    descripción larga no se llegaba al botón); aviso en rojo cuando el admin aún no cambia el rol a docente; botón del
    menú arriba y fijo; login que cabe en un portátil, con foco y mensaje de error útiles; el Tutor se ofrece cuando
    falla un caso de prueba o un intento (como hace Khan Academy con Khanmigo).
  - Tercera ronda (03/10), con los referentes estudiados en `docs/investigacion/referentes/`: barra lateral fija al
    bajar, «ocultar el menú» como un solo ícono, encabezado semitransparente, registro en dos pasos y **acceso al Tutor
    con un botón flotante «Tutor» abajo a la derecha en todas las pantallas**, que completa la recomendación de José de
    «cambiar la ventana o el acceso al Tutor» (la ventana ya era un panel al lado).
  - Hallazgos de José sobre el chatbot (`HALLAZGOS.md`): la tarjeta «Practica esto» ahora se ve como botón y el saludo
    dice qué hacer (tocar la tarjeta o escribir la duda).
  - Pendiente: la revisión visual de José (`S08-JO02`).
- [ ] **S08-J02 · Hallazgos del QA de Jorge** *(de su reporte del 02/10)*
  - ~~QA-06: el indicador del nivel de ayuda del Tutor (Pista, Pregunta guía, Dónde está el error) parece un grupo de
    botones; rediseñarlo para que se lea como indicador.~~ Hecho el 04/10: ahora es una línea de texto con tres
    puntos, «Nivel de ayuda: pista · sube si sigues fallando el ejercicio».
  - ~~QA-07: «No se pudo autoguardar» aparece a ratos; buscar la causa y que reintente solo.~~ Hecho el 04/10. El
    código se guarda solo, 0,8 s después de dejar de escribir. Causa principal: con los intentos ya usados (Jorge iba
    en «Intentos: 3 / 3»), cada tecla pedía abrir un intento nuevo, el servidor lo negaba y salía el aviso en rojo.
    Ahora dice «Ya usaste tus intentos: lo que escribas no se guarda»; un fallo de red se reintenta solo (2, 5 y
    10 s); y al entregar o cambiar de ejercicio se cancela el guardado pendiente.
  - Falta: desplegar y que Jorge lo verifique en `S08-JOR01`.
- [x] **Listas de chequeo del profesor: el «antes»** *(pedidas por correo; hecho el 04/10)*. Se aplicaron la lista de
  interfaz (Pressman, caps. 12–14) y la de Sistemas Tutores Inteligentes (Caro, 2015) a la versión desplegada, con código,
  capturas de computador y celular, teclado, modo oscuro, conexión cortada y axe-core. Resultados: interfaz **20/32
  (62,5 %)** y Tutores **14/24 (58,3 %)**. Están en el Word del profesor y en Markdown en
  [`docs/calidad/listas-chequeo/`](docs/calidad/listas-chequeo/README.md). El «después» se mide con la v1.2.0.
  La carpeta `docs/calidad/` quedó ordenada con nombres fechados.
  - ~~Del reporte del Tutor de José (`HALLAZGOS.md`): las tarjetas de sugerencia necesitan más contraste para verse
    como botones.~~ Hecho el 03/10 (ver `S08-J01`).
- [ ] **S08-J03 · Operar la prueba** *(el servidor está encendido 24/7 durante la prueba)*
  - Comprobar cada día que la app responde; aprobar a Pedro y a Julio como docentes.
  - Revisar las sugerencias cada día (ahora con pantallazo) y corregir en el día lo de gravedad 3.
  - Revisar el consumo del crédito de Azure el martes y el jueves.
- [ ] **S08-J04 · Asistencia en el salón con cámaras reales** — probar el escáner con un celular Android, un iPhone y la
  cámara de un portátil.

### Julio Galvis — Diseño Instruccional

- [ ] **S08-JL01 · Docente de Pensamiento algorítmico: revisar el rol de docente con el curso real** *(viene de
  `S07-JL03` y `S07-JL04`)*
  - Crear su cuenta de docente (Jeider aprueba el rol) y la clase desde la plantilla `PENSAR-ALGO`; publicar las
    secciones 1 y 2 y compartir el código o el QR con Jorge y Pedro.
  - Revisar «Hoy» cada día; crear una entrega y comentar lo que llegue; asignar un refuerzo; tomar la asistencia una vez.
  - Revisión pedagógica de las 5 lecciones de la semana: coherencia, dificultad e instrucciones claras.
  - Reporte en `docs/cursos/REVISION_DOCENTE_PENSAR_S8.md`.
- [ ] **S08-E01 · Estudiante de Fundamentos** (segunda cuenta), con José — meta: Unidad 1 completa.

### José López — UI/UX + Comunicación

- [ ] **S08-E01 · Estudiante de Fundamentos**, con Julio — meta: Unidad 1 completa.
- [ ] **S08-JO02 · Revisión de UX de la plataforma: heurísticas y observación de compañeros** — para tener sugerencias
  concretas para la v2.0:
  - revisar cómo quedaron sus recomendaciones ya aplicadas (`S08-J01`);
  - recorrido con las 10 heurísticas de Nielsen, en computador y en celular (375 px). Como estudiante: Inicio, una
    lección, un ejercicio de código, el Tutor, Mi progreso, Repasos, Mis proyectos y Mi asistencia. Como docente: Hoy,
    Contenido, Notas y Asistencia;
  - observar a 2 compañeros, 10 minutos cada uno, haciendo una tarea sin ayudarles;
  - cada hallazgo con pantalla, qué pasa, por qué molesta (heurística), propuesta concreta, captura y prioridad. Meta:
    al menos 10, 3 prioritarios y 3 vistos en el celular;
  - entrega en `docs/identidad-visual/REVISION_UX_S8.md`, con capturas en `docs/identidad-visual/capturas-s8/`.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S08-E02 · Estudiante de Pensamiento**, con Pedro — meta: secciones 1 y 2 completas.
- [ ] **S08-JOR01 · QA de las funciones nuevas en producción** — con la
  [guía maestra](./docs/calidad/GUIA_AUDITORIA_MAESTRA.md): asistencia con QR, unirse a una clase escaneando el QR,
  proyectos, entregas, notas, foto de perfil, ajustes de UI/UX y una nueva prueba del Tutor. Reporte en
  `docs/calidad/reportes-qa/REPORTE_QA_S8_2026-10-08.md`.

### Pedro Romero — Documentación + Bitácora

- [x] **S08-P01 · Tablero Trello de la Semana 8** — creado el 02/10.
- [ ] **S08-P02 · Bitácora** — mantenerla al día y cerrarla el viernes 09/10 (la única tarea con fecha del viernes), contrastada con Trello y Git.
- [ ] **S08-P04 · Docente de Fundamentos de Algoritmia**
  - Crear su cuenta de docente (Jeider aprueba el rol) y la clase desde la plantilla `ALGO-203413`; publicar la Unidad 1
    y compartir el código o el QR con José y Julio.
  - Revisar «Hoy» cada día; crear una entrega y comentar lo que llegue; asignar un refuerzo; tomar la asistencia una vez.
  - Nota corta de cómo le fue como docente en `docs/cursos/REVISION_DOCENTE_FUNDAMENTOS_S8.md`.
- [ ] **S08-E02 · Estudiante de Pensamiento** (segunda cuenta), con Jorge — meta: secciones 1 y 2 completas.
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

1. **Servidor apagado:** *(mitigado el 02/10)* Jeider quitó el apagado automático de las 23:00 durante la prueba, para
   que la app esté disponible a cualquier hora. Se vuelve a activar al terminar, para cuidar el crédito de Azure.
2. **Clave del Tutor:** cada estudiante necesita su propia clave gratuita de Google AI Studio; sin ella no puede usar el
   Tutor.
3. **Tiempo de respuesta del Tutor:** entre 3 y 29 segundos según la carga de Google; se avisa en pantalla.
4. **Crédito de Azure:** 100 dólares. Con el servidor encendido 24/7 durante la prueba se gasta más rápido que con el
   apagado nocturno: Jeider lo revisa martes y jueves (alertas al 50 % y al 80 %) y reactiva el apagado al terminar.
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

## 🔭 8. Proyección de las semanas 9 y 10

**Semana 9 (12 – 16 de octubre), semana 2 de la prueba.** José pasa a Pensamiento y Jorge a Fundamentos; Julio y Pedro
siguen en el curso del otro.

| Quién | Qué |
|---|---|
| Pedro | Docente: publica la Unidad 2 de Fundamentos. Estudiante: secciones 3 y 4 de Pensamiento (termina el curso). Resultados de la semana 2. |
| Julio | Docente: publica las secciones 3 y 4 de Pensamiento y compara con la primera semana. Estudiante: Unidad 2 de Fundamentos. |
| José | Estudiante de Pensamiento: secciones 1 y 2. UX: informe de lo que más confundió y propuestas visuales para la v2.0. |
| Jorge | Estudiante de Fundamentos: Unidad 1. QA de regresión sobre lo corregido entre semanas. |
| Jeider | Antes del lunes 12, corregir lo que haya bloqueado la prueba en la semana 1. Operar la prueba. |
| Todos | Las tres preguntas del final de la semana y los 7 Hábitos. |

**Semana 10 (19 – 23 de octubre), solo si hace falta.** Pedro publica la Unidad 3 de Fundamentos y Julio (estudiante) la
termina; José y Jorge avanzan en lo que les falte. Al cierre: informe consolidado de la prueba, versión v1.2.0 con lo
corregido y decisión del alcance de la v2.0.

Se decide al cierre de la Semana 9 si hace falta la Semana 10, según cuánto del curso alcanzaron. **Al terminar la
prueba, Jeider vuelve a activar el apagado automático de las 23:00** para cuidar el crédito de Azure.

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
