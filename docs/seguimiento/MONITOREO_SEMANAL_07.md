# 🚀 Bitácora de Monitoreo y Control N.º 7 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 28 de septiembre – 2 de octubre de 2026  
**Cierre:** viernes 2 de octubre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/C7WLINGc/stire-kanban-desarrollo-semana-07-28-sep-2-oct-2026

> **Bitácora archivada (02/10).** Esta semana ya terminó; la bitácora vigente es la N.º 8, en `MONITOREO_SEMANAL.md`
> en la raíz del repositorio. El cierre se verificó contra Trello y Git; el tablero de la Semana 7 se cierra en Trello.

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_06.md`](./MONITOREO_SEMANAL_06.md), cerrada el 25/09 y
> archivada el 26/09 con 11 de 13 ítems cumplidos. Pasan a esta semana: el despliegue (ya decidido, sin ejecutar),
> la estructura de cursos de Julio y la prueba del Tutor IA de José. Los 7 Hábitos los registraron los 5 integrantes
> (Julio marcó sus hábitos sin explicar la situación de cada uno).

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

**Poner STIRE en internet.** La forma de desplegar ya está decidida. El código está listo y verificado: la Fase 26,
con el editor de código nuevo, se auditó y unió a `main` el 26/09. Esta semana se ejecuta el despliegue y, con la
aplicación en una URL pública, se desbloquean las pruebas en vivo que venían esperando.

### Resultados esperados

1. STIRE desplegado y funcionando por una URL pública (`S07-J01`).
2. Estructura de los dos cursos organizada (`S07-JL01`).
3. Tutor IA probado como usuario, con capturas y hallazgos (`S07-JO01`).
4. Pitch del Reto 3 subido al repositorio (`S07-P03`).
5. QA sobre el entorno desplegado, si Jorge lo confirma (`S07-JOR01`).
6. Registro de los 7 Hábitos de los 5 integrantes (`S07-H-*`).
7. Bitácora cerrada el viernes, sin retraso.

---

## 📋 3. Plan de trabajo semanal

> Tablero: https://trello.com/b/C7WLINGc/stire-kanban-desarrollo-semana-07-28-sep-2-oct-2026

### Jeider Gómez — Líder Técnico

- [x] **S07-J01 · Desplegar STIRE en Azure** *(viene de `S06-J03`)*
  - Backend y MariaDB: máquina de Azure for Students (B2als v2, 2 vCPU / 4 GB, North Central US, Ubuntu 24.04), con el mismo
    `docker-compose.prod.yml`.
  - Frontend: Vercel (decisión del 26/09). Dominio: DuckDNS, con HTTPS de Caddy.
  - Costo para el equipo: $0. El crédito de estudiante no tiene tarjeta, y la máquina se apaga cuando no se usa para
    estirar el crédito.
  - El reintento automático de Oracle (máquina gratuita sin límite de tiempo) sigue corriendo. Si la consigue, se
    evalúa pasar ahí.
  - Guía: `docs/DESPLIEGUE.md`, a la que se le agrega la sección de Azure.

### Pedro Romero — Documentación + Bitácora

- [x] **S07-P01 · Tablero Trello de la Semana 7** — creado y poblado el 26/09.
- [ ] **S07-P02 · Bitácora** — mantenerla al día y cerrarla el viernes 02/10, contrastada con Trello y Git.
- [ ] **S07-P03 · Subir el pitch del Reto 3 a `docs/pitch/`** — se desarrolló después del cierre de la Semana 6
  (`S06-P04`); falta el archivo en el repositorio.

### José López — UI/UX + Comunicación

- [x] **S07-JO01 · Probar el Tutor IA como usuario y documentarlo visualmente** *(viene de la Semana 6)* — José
  revisó el Tutor dentro de un recorrido completo por la interfaz y entregó el 02/10, en la tarjeta, su reporte de uso
  con 4 recomendaciones de UX/UI, entre ellas reubicar el Tutor para poder leer y conversar a la vez (detalle y
  respuesta en §7).

### Julio Galvis — Diseño Instruccional

- [x] **S07-JL01 · Organizar la estructura de los dos cursos de contenido** *(viene de `S06-JL01`)* — Curso 1
  (complejo, plan oficial HTML/CSS/JS) y Curso 2 (general, según la plataforma). Trabajo conjunto con Jeider.
- [x] **S07-JL05 · Escribir el contenido completo de los dos cursos** — trabajo conjunto con Jeider; cargados en la
  plataforma.

**Pasan a la Semana 8 (una sola tarea de Julio):**
- [ ] **S07-JL03 · Validación pedagógica en vivo** y **S07-JL04 · Probar las funciones de docente** → revisar el rol
  de docente con los cursos reales: coherencia entre lecciones, ejercicios e instrucciones; crear una lección y un
  ejercicio; asignar un refuerzo; reporte de hallazgos en el repositorio.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S07-JOR01 · QA del entorno desplegado** *(propuesta, se confirma con Jorge en la reunión)* — probar por la URL
  pública, no en local:
  - registro, login y unirse a una clase;
  - ejercicio de código con el editor nuevo (Tab, Esc + Tab, probar y entregar) y ejercicio de HTML/CSS;
  - recuperación de contraseña por correo;
  - Tutor IA con una clave propia.

  Resultado en un reporte en `docs/calidad/`.

### 3.1 Todo el equipo — Los 7 Hábitos de la Gente Altamente Efectiva (Reto 3)

Registro libre y semanal: en un comentario de su tarjeta, cada integrante dice qué hábitos vivió y cuenta la situación
real. No hace falta cubrir los 7.

- [ ] **S07-H-JEIDER** · [`S07-H-JEIDER`](https://trello.com/c/OHRa7ycm)
- [ ] **S07-H-PEDRO** · [`S07-H-PEDRO`](https://trello.com/c/sYxeSTAQ)
- [ ] **S07-H-JOSE** · [`S07-H-JOSE`](https://trello.com/c/BTjgtpG9)
- [ ] **S07-H-JULIO** · [`S07-H-JULIO`](https://trello.com/c/e3IWN3gj) — en la Semana 6 marcó sus hábitos pero no contó la historia; esta vez, con su comentario.
- [ ] **S07-H-JORGE** · [`S07-H-JORGE`](https://trello.com/c/JqsVAkIy)

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

### Reglas del tablero

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana` (sin contar la de los 7 Hábitos).
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Las dependencias se escriben dentro de la tarjeta.
4. Una tarjeta bloqueada permanece en `En curso` y se marca con etiqueta roja + `🚧 BLOQUEADA`.
5. Una tarea no pasa a `Hecho` sin evidencia.
6. El código terminado debe tener respaldo en GitHub.
7. Las tareas operativas permanecen en Trello; la bitácora no copia sus checklists.
8. Al cerrar la semana, el tablero se cierra en Trello para que quede como registro sin cambios.

---

## ⚠️ 5. Riesgos vivos

1. **Despliegue:** *(resuelto el 26/09)* STIRE está en internet y se actualizó varias veces en la semana sin caídas.
2. **Crédito de Azure:** 100 dólares; unos 3 meses si la máquina queda encendida todo el tiempo, bastante más si se
   apaga cuando no se usa. Hay una alerta de presupuesto al 50 % y al 80 %, y copias de la base fuera de la máquina.
3. **Oracle gratuito:** sin capacidad en Bogotá. El reintento automático sigue; no depende de nosotros.
4. **Contenido:** *(resuelto)* los dos cursos están estructurados, escritos y cargados en la plataforma.
5. **Borrador del ejercicio:** al recargar la página, el ejercicio de código vuelve al código inicial (el autoguardado
   llega al servidor, pero la pantalla no lo restaura). Ya ocurría antes de la Fase 26; queda como mejora.

---

## 📅 6. Seguimiento

### Martes

- Qué terminó, qué está haciendo, qué falta, si hay bloqueo.

### Jueves

- Qué lleva terminado, qué puede cerrar el viernes, qué está en riesgo, qué necesita de otro.

### Viernes

- Revisar Trello y GitHub, validar evidencias, registrar riesgos nuevos, actualizar esta bitácora, preparar el siguiente sprint.

---

## 🧾 7. Resultado del Sprint — cierre del viernes 02/10

### Jeider Gómez

- [x] STIRE desplegado: `/health` por la URL pública, frontend abierto, login real y un ejercicio de código resuelto.
  *(26/09, antes de empezar la semana. Página https://stire-soft.vercel.app y backend https://stire-unicor.duckdns.org
  (Azure for Students). Simulación de punta a punta en producción: un estudiante de prueba, en un navegador real, se
  registró, se unió a la clase con su código, resolvió un ejercicio de código en el editor nuevo y obtuvo 20/20. Los 2 casos,
  uno de ellos oculto, se ejecutaron en el sandbox del servidor. En el camino se corrigieron dos fallos: la tabla de tipos
  de actividad estaba vacía en producción y ningún docente podía crear ejercicios (`b139b27`), y un texto del resultado
  (`4f08edf`). Detalle en `CHANGELOG.md` y `docs/DESPLIEGUE.md` §8.)*
- [x] Versiones **v1.0.0** (la que usará el equipo en la prueba) y **v1.1.0**, con su entrada en `CHANGELOG.md` y sus
  capturas en `docs/material-visual/vistas/`. *(Incluyen el registro de cambios de rol, el código de clase único con
  QR para unirse, la foto de perfil opcional y videos, imágenes y ejemplos en vivo dentro de las lecciones.)*
- [x] Tutor IA probado de punta a punta con una clave real: ahora sabe qué lección está leyendo el estudiante, no
  muestra datos internos, no contesta fuera de tema y respeta el pseudocódigo.
- [x] Asistencia con QR: el estudiante muestra un código que cambia cada 20 segundos, el docente lo escanea y ve su
  nombre y su foto; alerta si un mismo celular marca a dos cuentas; marcas a mano, «Llamar a 3 al azar» y planilla.
  Probada en producción (22 de 22 comprobaciones).
- [x] Hallazgos del QA de Jorge corregidos el mismo día: restablecer la contraseña desde el admin daba error aunque la
  cambiaba, y la contraseña generada no se podía copiar bien. También el saludo del Tutor (hora de Colombia, sin
  repetirse). *(`1ef445f`, `b65cd67`.)*
- [x] Laboratorio visual `stire-lab` actualizado a la v1.1.0, con datos de ejemplo que se guardan.

### Pedro Romero

- [x] Tablero de la Semana 7 creado. *(26/09.)*
- [x] Bitácora cerrada el viernes 02/10, contrastada con Trello y Git. *(El cierre y el tablero de la Semana 8 los
  hizo Jeider con Claude Code esa noche.)*
- [x] Pitch del Reto 3 en `docs/pitch/PITCH_RETO_03.md`. *(Subido el 02/10.)*
- [x] 7 Hábitos registrados (1, 2, 3 y 5).

### José López

- [x] Tutor IA revisado como usuario, con reporte de uso y recomendaciones de UX/UI. *(02/10, en `S07-JO01`. Revisó
  el Tutor en el contexto de toda la interfaz; su hallazgo sobre el Tutor —que el panel tapa la lección mientras se
  conversa— es la mejora de mayor impacto de la lista y pasa a la Semana 8.)*
- [x] 11 capturas de la interfaz en `docs/material-visual/01-tutor-ia/` (registro, panel del admin, panel docente,
  crear clase, módulo y lección, y «Mis clases» del estudiante). *(Subidas el 02/10.)*
- [x] 7 Hábitos registrados (hábitos 1, 2, 3 y 5, con la situación de cada uno). *(02/10, `S07-H-JOSE`.)*

**Respuesta a sus 4 recomendaciones** (revisadas contra el código el 02/10):

| Recomendación | Qué hay hoy | Decisión |
|---|---|---|
| Reubicar el Tutor | Se abre como un panel a la derecha que oscurece la pantalla: mientras se usa no se puede leer la lección. | **Se adopta** (`S08-J01`): en computador, panel lateral sin oscurecer que deja ver la lección; en celular sigue igual. |
| Menú lateral retráctil | En celular ya se oculta; en computador ocupa siempre 260 px. | **Se adopta** (`S08-J01`): botón para dejarlo solo con íconos, recordado por usuario. |
| Cajas de texto expandibles | 19 cajas de texto; se estiran desde la esquina, pero no crecen solas. | **Se adopta** (`S08-J01`): crecen solas mientras se escribe. |
| Registro en dos columnas o en pasos | 8 campos, ya con partes en dos columnas, 490 px de ancho. | **En parte** (`S08-J01`): no se harán pasos (más clics, más abandono); lo obligatorio arriba y lo opcional agrupado debajo (idea de Jeider, 02/10), y el botón «Crear cuenta» visible sin bajar en 1366×768. |

### Julio Galvis

- [x] Estructura de los dos cursos organizada, y contenido completo escrito y cargado en la plataforma: Fundamentos de
  Algoritmia (`ALGO-203413`) y Pensamiento algorítmico (`PENSAR-ALGO`). *(Trabajo conjunto de Julio y Jeider; evidencia en
  `docs/cursos/` y `src/seeds/cursos/`; cerradas en Trello el 02/10.)*
- [x] 7 Hábitos registrados (2, 3 y 6), esta vez con la situación de cada uno.
- [ ] Validación pedagógica en vivo y funciones de docente (`S07-JL03`, `S07-JL04`): pasan a la Semana 8 como una sola
  tarea, revisar el rol de docente con los cursos reales.

### Jorge Cervantes

- [x] QA del entorno desplegado, por la URL pública. *(Reporte en `docs/calidad/reportes-qa/REPORTE_QA_S7_2026-10-02.md`: registro y
  sesión, unirse a una clase, ejercicios de JavaScript y de HTML/CSS, teclado, notificaciones, Tutor con clave propia y
  recuperación de contraseña por correo; 8 hallazgos.)*
- [x] 7 Hábitos registrados (los 7, con la situación de cada uno).

**Análisis de sus hallazgos** (revisados contra el código el 02/10):

| Hallazgo | Qué es | Qué se hace |
|---|---|---|
| Admin: restablecer contraseña da «server error» aunque la cambia | Fallo real: el registro de cambios de rol recibía un rol vacío | **Corregido el 02/10** (`1ef445f`), con prueba |
| QA-06 · Los «botones» Pista, Pregunta guía y Dónde está el error del Tutor no hacen nada | No son botones: es el indicador del nivel de ayuda, pero parece un grupo de botones | `S08-J02`: rediseñarlo para que se lea como indicador |
| QA-07 · «No se pudo autoguardar» aparece a ratos | El autoguardado falla y no reintenta | `S08-J02`: buscar la causa y reintentar solo |
| QA-01 · `console.log(8)` aprueba el caso visible y saca 10/20 | No es un fallo: el caso oculto detecta la respuesta copiada | Muestra que el enunciado del ejercicio de prueba no se entendía; cuidar la redacción en los cursos (`S08-JL01`) |
| QA-02 a QA-05 y QA-08 | Funcionan bien: evaluación, vista previa en vivo, teclado, notificaciones, Tutor y recuperación | — |

### Todo el equipo

- [x] Registro de los 7 Hábitos de los 5 integrantes (`S07-H-*`, §3.1). *(5 de 5, todos con su historia: Jeider
  (1 a 6), Pedro (1, 2, 3 y 5), José (1, 2, 3 y 5), Julio (2, 3 y 6) y Jorge (los 7).)*

**Resumen de cierre:** 14 de 15 ítems cerrados. STIRE está en internet, en su versión 1.1, con los dos cursos cargados
y listo para que el equipo lo pruebe. Jorge hizo la primera auditoría completa sobre el entorno desplegado y sus hallazgos
se corrigieron o quedaron planeados. La revisión del rol de docente de Julio pasa a la Semana 8. Los 5 integrantes
registraron sus hábitos con la historia de cada uno, Julio incluido por primera vez.

> **Nota:** se marca solo con resultados verificables al cierre del viernes 02/10, con el mismo criterio de las
> semanas anteriores.

---

## ➡️ Pasa a la Semana 8 (5 – 9 de octubre)

Empieza la prueba de dos semanas con el equipo (`docs/calidad/PRUEBA_DOS_SEMANAS.md`). Pasan:
- **Julio:** revisar el rol de docente con los cursos reales (`S07-JL03` y `S07-JL04`, unidas en `S08-JL01`).
- **Jeider:** los ajustes de UI/UX que propuso José (`S08-J01`) y los hallazgos QA-06 y QA-07 de Jorge (`S08-J02`).
- **José:** probar el Tutor como chatbot (saludo, preguntas sobre un ejercicio, «quiero practicar»).

Plan completo: bitácora N.º 8.

---

## 🗂️ 8. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | [`MONITOREO_SEMANAL_04.md`](./MONITOREO_SEMANAL_04.md) |
| 5 | 14 – 18 de septiembre de 2026 | [`MONITOREO_SEMANAL_05.md`](./MONITOREO_SEMANAL_05.md) |
| 6 | 21 – 25 de septiembre de 2026 | [`MONITOREO_SEMANAL_06.md`](./MONITOREO_SEMANAL_06.md) |
| 7 | 28 de septiembre – 2 de octubre de 2026 | [`MONITOREO_SEMANAL_07.md`](./MONITOREO_SEMANAL_07.md) |

---

*Bitácora N.º 7 · Semana del 28 de septiembre al 2 de octubre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*  
*Cerrada el 2 de octubre de 2026, con verificación cruzada contra Trello y Git.*
