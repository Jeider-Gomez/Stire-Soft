# 🚀 Bitácora de Monitoreo y Control N.º 3 — Proyecto: STIRE-Soft
**Curso:** DDSE3 — 2026-2 | **Grupo:** [G1 / G2]
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft
**Semana reportada:** 31 de agosto – 4 de septiembre de 2026 | **Cierre:** viernes 4 de septiembre, 8:00 p.m.
**Estado del sprint:** Reestructuración de MODESEC por roles · decisión de Vue 3 + Nuxt · cierre progresivo del backend · definición del sandbox · nueva base frontend · Trello operativo.
**Tablero Kanban (Trello):** `[https://trello.com/b/Zek3mVEX]`

*STIRE-Soft es un Sistema Tutor Inteligente para la Resolución de Ejercicios: el estudiante entrega código, el sistema lo ejecuta de forma aislada, lo califica y adapta los siguientes ejercicios a su nivel de dominio.*

---

## 👥 1. Estructura del Equipo y Roles

| Integrante | Rol Principal y Responsabilidades del Sprint | Horario de Reunión Individual | GitHub User |
| :--- | :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico & Backend:** Arquitectura, cierre backend, Tutor IA, Sandbox y setup Nuxt | *[por completar]* | @Jeider-Gomez |
| **Jorge Cervantes** | **Gestión & Calidad:** Tablero Trello, QA de entregables e Investigación (15 artículos) | *[por completar]* | @*[por completar]* |
| **José López** | **UI/UX & Comunicación:** Diseño visual, wireframes de vistas y Pitch de avances | *[Miércoles 2 a 4 pm]* | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC multi-rol, flujos pedagógicos y navegación | *[por completar]* | @*[por completar]* |
| **Pedro Romero** | **Documentación & Bitácora:** Gestión de bitácoras, evidencias y actas de cierre | *Jueves 4 a 6 pm* | @pedrorm20 |

**Reunión de equipo:** viernes 8:00 – 8:40 p.m., videollamada, con los cinco integrantes.
**Reportes escritos:** martes y jueves, 8:00 p.m., en el grupo del equipo.
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint / Semana Actual

El objetivo de esta semana es **convertir el diseño MODESEC en una especificación completa y aprobada para los tres roles del sistema**, y utilizarla como fuente para iniciar de forma ordenada la nueva implementación frontend.

En paralelo, se busca cerrar los componentes fundamentales del backend que ya pueden considerarse funcionales, activar el Tutor IA real y dejar definida una estrategia viable para el sandbox de ejecución de código.

### 2.1 Resultados esperados

1. MODESEC reestructurado para cubrir **Estudiante, Docente y Administrador**.
2. Vistas, navegación y responsabilidades de cada rol definidas antes de implementar frontend.
3. Gráficos y fichas revisados, corregidos y aprobados como especificación de implementación.
4. Decisión formal: **Vue 3 + Nuxt** para el nuevo frontend.
5. Frontend experimental Next.js/React congelado como prueba histórica y sin nuevas funcionalidades.
6. Backend auditado para identificar qué módulos pueden declararse cerrados y qué endpoints faltan para las vistas aprobadas.
7. Tutor IA conectado a un proveedor LLM real, con configuración segura y pruebas.
8. Sandbox documentado con una decisión realista de infraestructura; Docker no se considera requisito del sandbox actual.
9. Tablero Trello actualizado con tareas, subtareas, responsables, dependencias y criterios de terminado.
10. Pitch de avances preparado al cierre de la semana exclusivamente con evidencia verificable.

---

## 🧩 3. Retos y Actividades del Sprint

### 🔵 RETO 1 — Reestructuración y cierre de MODESEC por roles

**Objetivo:** ampliar la especificación actual para que represente las experiencias completas de los tres tipos de usuario: **estudiante, docente y administrador**.

#### Subtareas

- [x] Inventariar las funciones reales de cada rol en el backend y documentación.
- [x] Definir el flujo principal del estudiante (`EST-V01` a `EST-V06`).
- [x] Definir el flujo principal del docente (`DOC-V01` a `DOC-V05`).
- [x] Definir el flujo principal del administrador (`ADM-V01` a `ADM-V03`).
- [x] Determinar qué ventanas actuales pertenecen al estudiante.
- [x] Determinar qué ventanas nuevas necesita el docente.
- [x] Determinar qué ventanas nuevas necesita el administrador.
- [x] Revisar la Ventana Estándar (§3.3) para verificar qué elementos son comunes y cuáles dependen del rol.
- [x] Reestructurar el mapa de navegación (§3.3.3) para incluir los tres roles.
- [x] Crear/actualizar las fichas MODESEC (§3.3.1) de las 15 ventanas multi-rol.
- [x] Revisar la guía de metáforas (§3.3.2) frente a las nuevas vistas.
- [x] Revisar el guion técnico multimedial (§3.2).
- [ ] Actualizar los gráficos SVG y sus PNG.
- [x] Hacer revisión cruzada de diseño, pedagogía y viabilidad técnica.
- [x] Aprobar la versión que servirá como especificación oficial de frontend.

**Criterio de terminado:** ningún rol queda sin flujo principal ni vistas necesarias y cada vista aprobada tiene correspondencia con navegación, ficha MODESEC y gráfico cuando aplique.

**Dependencia:** esta actividad bloquea el desarrollo de nuevas vistas frontend.

---

### 🟢 RETO 2 — Cierre progresivo del Backend

**Objetivo:** dejar de considerar el backend como una colección de pruebas y llevarlo a un estado funcional alineado con MODESEC.

#### Subtareas

- [x] Auditar módulos existentes y clasificarlos (`docs/backend-audit.md`).
- [x] Verificar autenticación JWT y RBAC para estudiante, docente y administrador.
- [x] Verificar endpoints necesarios para el flujo de estudiante.
- [x] Identificar endpoints faltantes para docente.
- [x] Identificar endpoints faltantes para administrador.
- [ ] Implementar únicamente los endpoints que correspondan a las vistas aprobadas pendientes.
- [x] Verificar persistencia de progreso/mastery.
- [x] Verificar programación SM-2.
- [x] Verificar flujo de entrega y evaluación.
- [x] Verificar actualización de progreso después de una evaluación.
- [x] Ejecutar pruebas unitarias y E2E relevantes (259/259 PASS).
- [x] Actualizar documentación de endpoints y contratos en informe de auditoría.

**Criterio de terminado:** cada función prioritaria del sprint tiene endpoint probado o queda explícitamente registrada como dependencia posterior.

---

### 🤖 RETO 3 — Tutor Inteligente funcional

**Objetivo:** pasar del placeholder/mock a una integración real del Tutor IA.

#### Subtareas

- [x] Auditar el estado real de `TutorService` y su proveedor LLM.
- [x] Configurar `OPENAI_API_KEY` y `OPENAI_MODEL` (`gemini-2.0-flash-001`).
- [x] Corregir fallback en código y en `.env`.
- [x] Corregir fallback inseguro de `studentId` en `tutor.controller.ts`.
- [x] Mantener el contexto de mastery del estudiante.
- [x] Mantener el contexto conversacional limitado y controlado.
- [x] Implementar las reglas socráticas definidas en MODESEC (9 categorías).
- [x] Impedir que el tutor entregue directamente la solución de programación.
- [x] Manejar errores, timeouts y ausencia de API key.
- [x] Aplicar límites de uso (Throttle 20/min) para evitar consumo accidental excesivo.
- [x] Crear y ejecutar pruebas del servicio y del endpoint (2 suites PASS).
- [x] Documentar el flujo y las variables necesarias.

**Criterio de terminado:** `POST /tutor/chat` produce una respuesta real del modelo, contextualizada con el estudiante, y el flujo queda probado sin exponer credenciales.

---

### 🛡️ RETO 4 — Sandbox y decisión de Docker

**Objetivo:** establecer una arquitectura de ejecución de código segura, reproducible y viable para desarrollo y futura producción.

El backend actual documenta como activo el `HardenedProcessSandboxAdapter`, basado en aislamiento por proceso del sistema operativo, y declara Docker como no implementado. Por tanto, **no se debe volver a introducir Docker como si fuera el sandbox actual**.

#### Decisión ratificada

**Docker se conservará como herramienta de infraestructura/desarrollo (MySQL y Redis), no como requisito del sandbox en runtime.**

La prioridad implementada y probada es:

`HardenedProcessSandboxAdapter` (`node --permission`, red cortada, timeout 2s, 128 MB heap) → pruebas de seguridad PASS.


#### Subtareas

- [ ] Corregir las menciones documentales que presentan Docker como tecnología activa.
- [ ] Mantener `hardened` como modo funcional por defecto.
- [ ] Verificar que el sandbox siga ejecutando código real con límites de tiempo, memoria, red y procesos.
- [ ] Evaluar Docker como segunda capa/aislamiento futuro, no como requisito inmediato.
- [ ] Documentar requisitos de CPU, RAM y almacenamiento del sandbox.
- [ ] Definir si el entorno de producción necesitará un worker independiente.
- [ ] Documentar qué partes pueden ejecutarse en Vercel y cuáles no deben depender de Vercel Functions.

**Criterio de terminado:** existe una decisión de infraestructura documentada y un flujo de ejecución que puede reproducirse sin depender de Docker.

---

### 🟣 RETO 5 — Nuevo Frontend con Vue 3 + Nuxt

**Decisión:** el frontend experimental actual basado en Next.js/React se congela y no recibe nuevas funcionalidades. Se conserva únicamente como referencia histórica hasta realizar la migración o extracción de cualquier componente que realmente tenga valor.

La guía de Semana 03 orienta el desarrollo frontend hacia **Nuxt (Vue 3)**, por lo que esta será la base de la nueva implementación. fileciteturn18file0turn18file2

#### Subtareas

- [ ] Crear la nueva aplicación Nuxt 3 + Vue 3.
- [ ] Configurar TypeScript.
- [ ] Definir estructura de carpetas.
- [ ] Definir layout general.
- [ ] Definir sistema de navegación por rol.
- [ ] Definir manejo de autenticación JWT.
- [ ] Definir cliente HTTP/API.
- [ ] Definir componentes UI reutilizables.
- [ ] Definir variables de entorno.
- [ ] Configurar linting/formateo.
- [ ] Crear únicamente la estructura base, sin implementar todas las vistas.
- [ ] Esperar la aprobación MODESEC para construir las vistas definitivas.

**Criterio de terminado:** el proyecto Nuxt inicia, compila y tiene una arquitectura base preparada para implementar las vistas aprobadas.

---

### 🟡 RETO 6 — Trello y control del sprint
**Responsable:** Jorge Cervantes (Calidad y Gestión).

#### Subtareas

- [ ] Crear/confirmar tablero.
- [ ] Listas: BACKLOG / ESTA SEMANA / EN CURSO / EN REVISIÓN / BLOQUEADO / HECHO.
- [ ] Etiquetas por área.
- [ ] Crear tarjetas desde este documento.
- [ ] Dividir cada tarjeta en checklist.
- [ ] Asignar responsable.
- [ ] Registrar dependencias.
- [ ] Aplicar Definition of Done.
- [ ] Registrar bloqueos.
- [ ] Publicar enlace en la bitácora.
- [ ] Mantener máximo una tarea activa por integrante cuando sea posible.

---

### 🟠 RETO 7 — Respaldo científico (15 artículos indexados)
**Responsable:** Jorge Cervantes (Investigación y Calidad).

La guía de Semana 03 solicita 15 artículos indexados distribuidos en tres ejes: 5 pedagógico/cognitivo, 5 arquitectura/software/frontend y 5 GUI/UX/usabilidad. fileciteturn18file1

#### Subtareas

- [ ] Crear `docs/investigacion/`.
- [ ] Diseñar matriz bibliográfica (`MATRIZ_ARTICULOS.md`).
- [ ] Registrar 5 artículos pedagógicos/cognitivos.
- [ ] Registrar 5 artículos de arquitectura/software/frontend.
- [ ] Registrar 5 artículos de GUI/UX/usabilidad.
- [ ] Verificar DOI/indexación.
- [ ] Registrar objetivo, metodología, resultados y aporte a STIRE.
- [ ] Relacionar los artículos con decisiones de diseño.

**Criterio de terminado:** 15 artículos verificables y trazables a decisiones concretas del proyecto.

---

### 🎤 RETO 8 — Pitch de avances
**Responsable:** José López (Comunicación y UI/UX).

**Actividad de cierre:** viernes 4 de septiembre.

No se desarrolla al comienzo del sprint.

#### Subtareas

- [ ] Recopilar avances reales.
- [ ] Seleccionar únicamente resultados demostrables.
- [ ] Capturar evidencia.
- [ ] Preparar guion.
- [ ] Preparar material visual.
- [ ] Ensayar.
- [ ] Cronometrar.
- [ ] Ajustar.
- [ ] Presentar.

El pitch no debe afirmar que una funcionalidad existe si solamente está documentada.

---

## 🔗 4. Dependencias del Sprint

```text
REESTRUCTURAR MODESEC POR ROLES
        │
        ├──────────────► APROBAR VISTAS Y NAVEGACIÓN
        │                         │
        │                         ▼
        │                 ARQUITECTURA FRONTEND
        │                         │
        │                         ▼
        │                 NUEVA BASE NUXT
        │                         │
        │                         ▼
        │                  PRIMERA VISTA
        │                         │
        │                         ▼
        │                    INTEGRACIÓN
        │
        ├──────────────► ENDPOINTS BACKEND NECESARIOS
        │
        └──────────────► REVISIÓN DE TUTOR / SANDBOX

TRELLO ───────────────► seguimiento de todos los bloques
INVESTIGACIÓN ────────► respaldo de decisiones
PITCH ────────────────► cierre y evidencia del sprint
```

---

## 📊 5. Priorización

### 🔥 P0 — Obligatorio

1. Reestructuración MODESEC para estudiante/docente/administrador.
2. Aprobación de vistas y navegación.
3. Decisión/documentación Vue 3 + Nuxt.
4. Cierre de inconsistencias críticas de documentación Docker.
5. Auditoría y cierre funcional prioritario del backend.
6. Tutor IA real.
7. Trello operativo.

### 🟡 P1 — Importante

8. Nueva base Nuxt compilando.
9. Primer flujo frontend basado en MODESEC aprobado.
10. Matriz de 15 artículos.
11. Definición de estrategia de despliegue.

### 🟢 P2 — Posterior

12. Editor avanzado de código.
13. Integración completa del sandbox como infraestructura independiente si llega a ser necesaria.
14. Vistas secundarias no indispensables para el primer flujo.
15. Optimización avanzada.

---

## 🗓️ 6. Plan de Trabajo — 31 de agosto al 4 de septiembre

### Lunes 31

**Objetivo:** establecer la nueva base de diseño, organizar el tablero y limpiar inconsistencias.

- **Julio y Jeider:** Inicio de la reestructuración de MODESEC por roles (flujos estudiante/docente/administrador).
- **Jeider:** Corrección de documentación Docker y verificación del Tutor IA.
- **Jorge:** Creación y configuración del tablero Trello con las tarjetas del sprint.
- **Pedro:** Apertura y publicación de la bitácora de la Semana 3.

### Martes 1

**Objetivo:** definir las vistas y la investigación bibliográfica.

- **Julio:** Definición de navegación y vistas de Docente y Administrador.
- **José:** Primeros bocetos/wireframes de las nuevas vistas.
- **Jorge:** Inicio de la búsqueda y sistematización de los 15 artículos indexados.
- **Pedro:** Verificación de consistencia documental y registro de avances.

### Miércoles 2

**Objetivo:** consolidar MODESEC, avanzar investigación y cerrar contratos técnicos.

- **Julio y José:** Redacción de fichas MODESEC de las nuevas ventanas y gráficos SVG/PNG.
- **Jorge:** Consolidación de los ejes temáticos en `docs/investigacion/MATRIZ_ARTICULOS.md`.
- **Jeider:** Diagnóstico de dependencias API por vista y preparación de la estructura base Nuxt 3.
- **Pedro:** Seguimiento de avances y actualización de compromisos.

### Jueves 3

**Objetivo:** aprobar MODESEC, estructurar pitch e iniciar arquitectura Nuxt.

- **Equipo (Julio, Jeider, Pedro, Jorge, José):** Revisión cruzada y aprobación formal de MODESEC multi-rol.
- **Jeider:** Inicialización de `frontend-nuxt/` con layout base y cliente API autenticado.
- **José:** Estructuración y redacción del guion del pitch de 60 segundos con los avances reales.
- **Jorge:** Validación final de la matriz de investigación (15 papers) y QA del tablero.

### Viernes 4

**Objetivo:** consolidar evidencias, ensayar pitch y cerrar el sprint.

- **José:** Ensayo general del pitch de 60 segundos.
- **Pedro:** Consolidación final de la bitácora, evidencias y acta de cierre.
- **Jorge:** Revisión del estado de tarjetas en Trello (Definition of Done cumplido).
- **Equipo:** Reunión de cierre de sprint (8:00 p.m.).

---

## 👤 7. Distribución del Equipo y Asignación de Roles
 
 | Integrante | Rol Principal | Responsabilidades y Subtareas del Sprint |
 |---|---|---|
 | **Jeider Gómez** | Líder Técnico & Backend | Arquitectura global, cierre y auditoría de endpoints backend, Tutor IA adaptativo (Gemini/OpenAI), Sandbox (ADR 06), setup inicial de Nuxt 3 y dirección del sprint. |
 | **Jorge Cervantes** | Calidad, Tablero & Respaldo Científico | **Tablero Trello:** creación, listas, tarjetas y enlaces. **Investigación científica:** búsqueda y sistematización de los 15 artículos indexados (`docs/investigacion/MATRIZ_ARTICULOS.md`). QA cruzado de entregables. |
 | **José López** | UI/UX & Comunicación | **Pitch de avances:** estructura, redacción del guion de 60s y presentación. Diseño visual, iconografía SVG y wireframes de las vistas MODESEC. |
 | **Julio Galvis** | Diseño Instruccional & Navegación | Reestructuración de MODESEC por roles (flujos estudiante/docente/admin), diseño pedagógico de unidades, navegación multi-rol y fichas de especificación. |
 | **Pedro Romero** | Documentación & Bitácora | Gestión y actualización de bitácoras de monitoreo (`MONITOREO_SEMANAL.md`), actas de reunión, consolidación de evidencias y apoyo documental general. |
 
 > **Coordinación del trabajo:** Las actividades troncales de diseño instruccional, ingeniería backend, documentación y arquitectura están lideradas principalmente por **Jeider, Pedro y Julio**, mientras que **Jorge** lidera la gestión operativa en Trello y la investigación bibliográfica, y **José** lidera el diseño de interfaz y la preparación del pitch de avances. Ningún integrante debe iniciar una tarea cuya dependencia técnica o de diseño esté pendiente de aprobación.

---

## 🧪 8. Definition of Done del Sprint

Una tarea solo pasa a **HECHO** cuando:

- [ ] Está implementada o documentada según corresponda.
- [ ] Tiene evidencia.
- [ ] Está en GitHub.
- [ ] Fue revisada por la persona responsable de QA cuando corresponda.
- [ ] No contradice MODESEC.
- [ ] Tiene sus dependencias resueltas.
- [ ] Está registrada en Trello.

---

## 🎤 9. Pitch de Cierre de Sprint
**Responsable:** José López.

El pitch debe demostrar la evolución real y verificable del proyecto, sin prometer funcionalidades futuras. Se prepara y ensaya el jueves 3 y viernes 4 con base en los entregables aprobados.

Estructura de 60 segundos (4 bloques):

1. **Problema (0–10s):** Enseñanza de algoritmia con retroalimentación tardía y necesidad de rigor pedagógico.
2. **Diseño MODESEC (10–25s):** Especificación completa y aprobada para los tres roles (Estudiante, Docente, Administrador) y metáforas del taller.
3. **Tecnología y Seguridad (25–45s):** Backend NestJS con 259 pruebas, Tutor IA adaptativo y Sandbox aislado por proceso sin Docker.
4. **Incremento Frontend y Cierre (45–60s):** Nueva arquitectura en Vue 3 + Nuxt lista para recibir las vistas aprobadas.

---

## 📋 10. Acta de Cierre del Sprint

> Se diligencia el viernes 4 de septiembre, 8:00 p.m.

**Asistencia:** Jeider __ · Jorge __ · José __ · Julio __ · Pedro __

**MODESEC:** ______________________________________________

**Backend:** ______________________________________________

**Tutor IA:** ______________________________________________

**Sandbox/Docker:** ________________________________________

**Frontend Nuxt:** __________________________________________

**Trello:** _________________________________________________

**Investigación:** __________________________________________

**Pitch:** __________________________________________________

**Acuerdo de retrospectiva:** ________________________________

---

## 📌 11. Compromisos para la Semana Siguiente

Esta sección se completa al cierre del viernes 4, tomando únicamente tareas que hayan quedado realmente pendientes y que estén respaldadas por la retrospectiva.

---

## 🗂️ 12. Bitácoras Anteriores

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./seguimiento/MONITOREO_SEMANAL_02.md) |

Los documentos anteriores se conservan como historial. La semana en curso siempre vive en `MONITOREO_SEMANAL.md` en la raíz.

---

*Bitácora N.º 3 · Semana del 31 de agosto al 4 de septiembre de 2026.*
*La mantiene Pedro Romero · Actualización durante la reunión de cierre.*
