# 🚀 Bitácora de Monitoreo y Control N.º 4 — Proyecto: STIRE-Soft

**Curso:** DDSE3 — 2026-2  
**Grupo:** [G1 / G2]  
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft  
**Semana:** 7 – 11 de septiembre de 2026  
**Cierre:** viernes 11 de septiembre, 8:00 p. m.  
**Tablero Kanban:** https://trello.com/b/WW9nWXQ5/stire-kanban-desarrollo-semana-04

> **Regla de trabajo:** Trello contiene el flujo operativo y los checklists. GitHub contiene el código y las evidencias técnicas. Esta bitácora registra el resultado real de la semana y no duplica el detalle de las tarjetas.

---

## 👥 1. Estructura del equipo y roles

| Integrante | Rol principal y responsabilidades del Sprint | GitHub User |
| :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico:** frontend Nuxt, backend, integración y Tutor IA | @Jeider-Gomez |
| **Pedro Romero** | **Gestión + Documentación + Apoyo Técnico:** Trello, bitácora, evidencias y componentes frontend | @pedrorm20 |
| **José López** | **UI/UX + Comunicación:** validación visual y Pitch de avances | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC, navegación y contenidos | @jcg0912 |
| **Jorge Cervantes** | **Calidad y Pruebas:** validación funcional y revisión de entregables | @IvanGoats |

**Reunión de equipo:** viernes 8:00 – 8:40 p. m.  
**Reportes:** martes y jueves, máximo 8:00 p. m.  
**Metodología:** [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)

---

## 🎯 2. Objetivo del Sprint

Durante esta semana el equipo debe **iniciar la implementación real del frontend en Nuxt 3**, tomando como fuente de verdad el sistema visual y el prototipo de Figma ya verificados, mientras se atienden las brechas críticas del backend y se preparan los contenidos y evidencias necesarios para la siguiente sustentación.

El alcance inicial de frontend se mantiene limitado a las vistas ya diseñadas: `COMP-V00`, `EST-V01..V06`, `DOC-V01` y `ADM-V02`. No se rediseñan ni inventan vistas nuevas durante este sprint.

### Resultados esperados

1. `frontend-nuxt/` creado y funcionando con Nuxt 3, Vue 3, TypeScript, Pinia y Tailwind.
2. Tokens visuales y Ventana Estándar traducidos a código reutilizable.
3. Primera vista de estudiante funcionando y validada contra Figma.
4. Corrección de las cuatro rutas críticas sin control de rol.
5. Verificación real del Tutor IA con proveedor LLM.
6. Contenidos pendientes organizados para las unidades de aprendizaje.
7. Validación de navegación y flujo pedagógico.
8. Pitch de avances preparado con evidencias reales.
9. Bitácora actualizada y cerrada con resultados verificables.

---

## 📋 3. Plan de trabajo semanal

### Jeider Gómez — Líder Técnico

- [x] **S04-J01 · Preparar frontend Nuxt** — objetivo 08/09. *(Completado anticipadamente 07/09: Nuxt 3, Vue 3, Pinia, Tailwind y TS)*
- [x] **S04-J02 · Ventana Estándar** — objetivo 10/09. *(Completado anticipadamente 07/09: COMP-V00, EST-V01..V06, DOC-V01, ADM-V02)*
- [x] **S04-J03 · Backend + Tutor IA** — objetivo 11/09. *(Completado anticipadamente 07/09: Auditoría auth, token JWT real y Google Gemini LLM activo)*

**Dependencias:** S04-J02 depende de S04-J01. S04-J03 puede ejecutarse en paralelo.  
**Evidencias:** Ver informe oficial [`docs/informes-antigravity/INFORME_2026-09-07_SESION_01.md`](./docs/informes-antigravity/INFORME_2026-09-07_SESION_01.md).  
**Verificación en frío (09/09):** los tokens de `tailwind.config.ts` se compararon variable por
variable contra el Figma real — coincidían todos salvo 9 (paleta del editor de código y dos anchos
con nombre), ya agregados a Figma para que quede completo. El resto de los criterios de cierre del
[Insumo 15 §10](docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md#10-criterio-de-cierre-de-esta-fase)
**no** se cumplen todavía (capturas contra Figma, valores literales fuera del token system en 2
archivos, y el punto de "Probar código" — ver riesgo #6 abajo). Detalle completo en
[Insumo 15 §11](docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md#11-verificación-en-frío-de-este-criterio-de-cierre-2026-09-09).
"Ventana Estándar implementada" (arriba) es cierto para las 9 vistas construidas — no significa que
las 10 restantes de Docente/Administrador existan.

**Actualización (09/09, Figma):** las 10 vistas restantes de Docente y Administrador ya no faltan
en Figma — se construyeron `DOC-V02..V06` y `ADM-V01`/`ADM-V03` (7 ventanas nuevas, estado por
defecto únicamente, ensambladas a partir de `DOC-V01`/`ADM-V02` existentes) más 36 conexiones nuevas
de menú (30 docente + 6 admin), 0 rotas, mismo borde de afordancia que el resto del prototipo. De
paso se corrigió un defecto real: el menú de `DOC-V01` tenía dos ítems ("Banco de Ejercicios",
"Tareas por Calificar") y el de `ADM-V02` dos ítems ("Instituciones", "Logs de Auditoría") que no
correspondían a ningún código `DOC-V0x`/`ADM-V0x` real de `NAMING_STIRE.md` — quedaron reemplazados
por los 6 y 3 ítems canónicos respectivamente, en el orden documentado. **Lo que sigue sin existir:**
los 4 estados (vacío/error/completado) de las 7 vistas nuevas — solo tienen el estado por defecto,
igual que ya era el caso de `DOC-V01`/`ADM-V02`; y el contenido de cada vista nueva usa datos de
ejemplo, no una consulta real (no aplica de todos modos: estas vistas no se conectan a datos reales
esta semana, ver Insumo 15 §1). `ADM-V01` y `ADM-V03` llevan explícito "⚠ Ejemplo — sin backend
(D-03)" en su encabezado para no disimular que no hay endpoint de consulta real detrás.

**Cierre de Figma (09/09, segunda pasada):** se completaron los estados **vacío** y **error** de las
9 vistas de Docente/Administrador (18 frames más, mismo patrón que Estudiante: título + tarjeta de
mensaje; el estado error incluye un botón "Reintentar" cableado de vuelta al estado por defecto).
Total de conexiones ahora: **96 en el grupo Docente, 21 en el grupo Administrador** (defecto+vacío+
error heredan el menú lateral completo; 0 rotas, verificado). También se completó la página
**"🧩 Ventana Estándar"**: las variantes `Rol=Docente` y `Rol=Administrador` del componente maestro
eran un texto placeholder ("NO DISEÑADO EN ESTA FASE") desde FASE CC-06/07 — ahora contienen el
contenido real de `DOC-V01`/`ADM-V02`, igual que la variante `Rol=Estudiante`.

**Lo único que falta a propósito, declarado:** el estado **completado** no se construyó para
Docente/Administrador. A diferencia de las vistas de estudiante (que tienen un flujo de tarea con un
final claro: ejercicio entregado, repaso hecho), las vistas de Docente/Administrador son paneles de
gestión persistentes sin un momento de "completado" natural — forzar ese estado en las 9 vistas
habría sido inventar contenido sin respaldo, no completar un diseño real. Con esto, **Figma queda
completo para el alcance decidido esta semana** (D-06 + Insumo 15 §1): las 9 ventanas de Estudiante
en sus 4 estados, y las 9 de Docente/Administrador en 3 de 4 estados, todas cableadas.

### Pedro Romero — Gestión + Documentación + Apoyo Técnico

- [ ] **S04-P01 · Gestionar Trello** — objetivo 07/09.
- [ ] **S04-P02 · Apoyar frontend** — objetivo 10/09.
- [ ] **S04-P03 · Bitácora y evidencias** — objetivo 11/09.

**Dependencias:** S04-P02 depende de S04-J01. S04-P03 depende de las evidencias y resultados del equipo.

### José López — UI/UX + Comunicación

- [ ] **S04-JO01 · Validar UI contra Figma** — objetivo 10/09.
- [ ] **S04-JO02 · Pitch de avances** — objetivo 11/09.
- [ ] **S04-JO03 · Material visual** — objetivo 11/09.

**Dependencias:** S04-JO01 depende de S04-J02. S04-JO02 y S04-JO03 dependen de los avances y evidencias reales del equipo.

### Julio Galvis — Diseño Instruccional

- [ ] **S04-JL01 · Validar navegación** — objetivo 09/09.
- [ ] **S04-JL02 · Preparar contenidos** — objetivo 10/09.
- [ ] **S04-JL03 · Validación pedagógica** — objetivo 11/09.

**Dependencias:** S04-JL01 y S04-JL02 pueden ejecutarse en paralelo. S04-JL03 depende de que exista una vista funcional.

### Jorge Cervantes — Calidad y Pruebas

- [ ] **S04-JOR01 · Pruebas funcionales** — objetivo 11/09.
- [ ] **S04-JOR02 · Calidad frontend** — objetivo 11/09.
- [ ] **S04-JOR03 · Revisión final** — objetivo 11/09.

**Dependencias:** S04-JOR01 depende de las correcciones críticas del backend. S04-JOR02 depende de S04-J02. S04-JOR03 depende de los entregables del equipo.

---

## 🔄 4. Flujo Kanban del Sprint

```text
📥 BACKLOG → 📋 ESTA SEMANA → ⚙️ EN CURSO → ✅ HECHO
```

### Reglas del tablero

1. Máximo **3 tarjetas comprometidas por persona** en `Esta semana`.
2. Máximo **2 tarjetas simultáneas por persona** en `En curso`.
3. Las dependencias se escriben dentro de la tarjeta.
4. Una tarjeta bloqueada permanece en `En curso` y se marca con etiqueta roja + `🚧 BLOQUEADA`.
5. Una tarea no pasa a `Hecho` sin evidencia.
6. El código terminado debe tener respaldo en GitHub.
7. No se crean columnas adicionales para revisión, QA o bloqueos.
8. Las tareas operativas permanecen en Trello; la bitácora no copia sus checklists.

### Etiquetas visuales

- 🔵 **Azul:** desarrollo / frontend.
- 🔴 **Rojo:** riesgo, bloqueo o QA crítico.
- 🟣 **Morado:** diseño, contenidos y UI/UX.
- 🟠 **Naranja:** gestión y seguimiento.
- 🟢 **Verde:** trabajo estable.
- 🟡 **Amarillo:** trabajo en riesgo.

---

## ⚠️ 5. Riesgos y pendientes heredados

1. **Nuxt:** principal prioridad técnica de la Semana 4.
2. **Control de roles:** permanecen como prioridad las cuatro rutas identificadas previamente: `POST /submissions/start`, `POST /submissions/:id/submit`, `PUT /submissions/:id/autosave` y `POST /tutor/chat`.
3. **Contenido:** permanecen unidades de aprendizaje sin contenido sembrado en `db:seed:demo`.
4. **Sandbox:** los tests pueden presentar intermitencia por timing; cualquier fallo debe repetirse antes de declararlo defecto de código.
5. **Tutor IA:** su funcionamiento con proveedor real debe verificarse con evidencia externa al repositorio.
6. **"Probar código" no usa el sandbox del backend.** `frontend-nuxt/stores/workspace.ts` ejecuta el
   código del estudiante con `new Function(...)` en el propio navegador, no contra
   `HardenedProcessSandboxAdapter`. Cumple la regla de "no consumir intento", pero no es aislamiento
   real y los casos de prueba están hardcodeados a un solo ejercicio (`sumarPares`) — no escala a las
   unidades reales que faltan por sembrar. Ver [Insumo 15 §11.2](docs/modesec/15_PLAN_IMPLEMENTACION_ANTIGRAVITY.md#112-los-otros-cuatro-criterios-de-10-no-se-cumplen-todavía-declarado-sin-maquillar).

---

## 📅 6. Seguimiento

### Martes

Cada integrante reporta:

- Qué terminó.
- Qué está haciendo.
- Qué falta.
- Si tiene algún bloqueo.

### Jueves

Cada integrante reporta:

- Qué lleva terminado.
- Qué puede cerrar el viernes.
- Qué está en riesgo.
- Qué necesita de otro integrante.

### Viernes

Se realiza el cierre del sprint:

- Revisar Trello.
- Validar evidencias.
- Revisar GitHub.
- Separar terminado y pendiente.
- Registrar riesgos nuevos.
- Actualizar esta bitácora.
- Preparar el siguiente sprint.

---

## 🧾 7. Resultado del Sprint — completar al cierre

### Jeider Gómez

- [x] Nuxt iniciado y funcionando.
- [x] Ventana Estándar implementada.
- [x] Backend y Tutor IA verificados.

### Pedro Romero

- [ ] Trello gestionado durante el sprint.
- [ ] Apoyo técnico realizado.
- [ ] Bitácora y evidencias consolidadas.

### José López

- [ ] UI validada contra Figma.
- [ ] Pitch preparado.
- [ ] Material visual organizado.

### Julio Galvis

- [ ] Navegación validada.
- [ ] Contenidos pendientes preparados.
- [ ] Flujo pedagógico revisado.

### Jorge Cervantes

- [ ] Pruebas funcionales realizadas.
- [ ] Calidad del frontend revisada.
- [ ] Entregables revisados.

> **Nota:** esta sección se marca únicamente con base en resultados verificables al cierre del viernes 11 de septiembre.

---

## 🗂️ 8. Historial de bitácoras

| N.º | Semana | Documento |
|---|---|---|
| 1 | 17 – 21 de agosto de 2026 | [`MONITOREO_SEMANAL_01.md`](./docs/seguimiento/MONITOREO_SEMANAL_01.md) |
| 2 | 24 – 28 de agosto de 2026 | [`MONITOREO_SEMANAL_02.md`](./docs/seguimiento/MONITOREO_SEMANAL_02.md) |
| 3 | 31 de agosto – 4 de septiembre de 2026 | [`MONITOREO_SEMANAL_03.md`](./docs/seguimiento/MONITOREO_SEMANAL_03.md) |
| 4 | 7 – 11 de septiembre de 2026 | `MONITOREO_SEMANAL.md` |

---

*Bitácora N.º 4 · Semana del 7 al 11 de septiembre de 2026.*  
*Responsable de seguimiento y cierre documental: Pedro Romero.*
