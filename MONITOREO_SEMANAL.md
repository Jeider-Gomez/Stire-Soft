# 🚀 Bitácora de Monitoreo y Control N.º 7 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 28 de septiembre – 2 de octubre de 2026  
**Cierre:** viernes 2 de octubre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/C7WLINGc/stire-kanban-desarrollo-semana-07-28-sep-2-oct-2026

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

> **Bitácora anterior:** [`docs/seguimiento/MONITOREO_SEMANAL_06.md`](./docs/seguimiento/MONITOREO_SEMANAL_06.md), cerrada el 25/09 y
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
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

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

- [ ] **S07-J01 · Desplegar STIRE en Azure** *(viene de `S06-J03`)*
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

- [ ] **S07-JO01 · Probar el Tutor IA como usuario y documentarlo visualmente** *(viene de la Semana 6)* — capturas y
  una nota con los hallazgos en `docs/material-visual/01-tutor-ia/`. Si el despliegue ya está listo, sobre la URL
  pública.

### Julio Galvis — Diseño Instruccional

- [ ] **S07-JL01 · Organizar la estructura de los dos cursos de contenido** *(viene de `S06-JL01`)* — Curso 1
  (complejo, plan oficial HTML/CSS/JS) y Curso 2 (general, según la plataforma).

**En Backlog:**
- [ ] **S07-JL03 · Validación pedagógica en vivo** — se desbloquea en cuanto `S07-J01` tenga la URL pública.
- [ ] **S07-JL04 · Probar las funciones de docente en la creación de contenido** — igual, depende del despliegue.
- [ ] **S07-JL05 · Escribir el contenido completo de los dos cursos** — depende de `S07-JL01`.

### Jorge Cervantes — Gestión + Calidad

- [ ] **S07-JOR01 · QA del entorno desplegado** *(propuesta, se confirma con Jorge en la reunión)* — probar por la URL
  pública, no en local:
  - registro, login y unirse a una clase;
  - ejercicio de código con el editor nuevo (Tab, Esc + Tab, probar y entregar) y ejercicio de HTML/CSS;
  - recuperación de contraseña por correo;
  - Tutor IA con una clave propia.

  Resultado en un reporte en `docs/ReportesQA/`.

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

1. **Despliegue:** es la primera vez que el equipo despliega. La guía está escrita y la imagen de Docker se verificó,
   pero Azure se hace por primera vez. Hay que dejar margen antes del viernes.
2. **Crédito de Azure:** 100 dólares; unos 3 meses si la máquina queda encendida todo el tiempo, bastante más si se
   apaga cuando no se usa. Hay una alerta de presupuesto al 50 % y al 80 %, y copias de la base fuera de la máquina.
3. **Oracle gratuito:** sin capacidad en Bogotá. El reintento automático sigue; no depende de nosotros.
4. **Contenido:** la estructura de cursos lleva dos semanas pendiente y bloquea el contenido completo y la decisión de
   la progresión de Nivel 2.
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

## 🧾 7. Resultado del Sprint — completar al cierre

### Jeider Gómez

- [ ] STIRE desplegado: `/health` por la URL pública, frontend abierto, login real y un ejercicio de código resuelto.
  *(Avance del 26/09, antes de empezar la semana: desplegado en https://stire-soft.vercel.app con backend en
  https://stire-unicor.duckdns.org (Azure for Students). `/health` responde con HTTPS válido, el login real del administrador
  llega a su panel y el correo de recuperación funciona. **Falta el último criterio:** que un estudiante resuelva un ejercicio de
  código en el entorno desplegado. Detalle en `docs/DESPLIEGUE.md` §8 y `CHANGELOG.md`.)*

### Pedro Romero

- [x] Tablero de la Semana 7 creado. *(26/09.)*
- [ ] Bitácora cerrada el viernes, sin retraso.
- [ ] Pitch del Reto 3 en `docs/pitch/`.

### José López

- [ ] Tutor IA probado como usuario, con capturas y hallazgos en `docs/material-visual/01-tutor-ia/`.

### Julio Galvis

- [ ] Estructura de los dos cursos organizada.

### Jorge Cervantes

- [ ] QA del entorno desplegado (si se confirma).

### Todo el equipo

- [ ] Registro de los 7 Hábitos de los 5 integrantes (`S07-H-*`, §3.1).

> **Nota:** se marca solo con resultados verificables al cierre del viernes 02/10, con el mismo criterio de las
> semanas anteriores.

---

## 🗂️ 8. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./docs/seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./docs/seguimiento/MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./docs/seguimiento/MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | [`MONITOREO_SEMANAL_04.md`](./docs/seguimiento/MONITOREO_SEMANAL_04.md) |
| 5 | 14 – 18 de septiembre de 2026 | [`MONITOREO_SEMANAL_05.md`](./docs/seguimiento/MONITOREO_SEMANAL_05.md) |
| 6 | 21 – 25 de septiembre de 2026 | [`MONITOREO_SEMANAL_06.md`](./docs/seguimiento/MONITOREO_SEMANAL_06.md) |
| 7 | 28 de septiembre – 2 de octubre de 2026 | `MONITOREO_SEMANAL.md` (este documento) |

---

*Bitácora N.º 7 · Semana del 28 de septiembre al 2 de octubre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
