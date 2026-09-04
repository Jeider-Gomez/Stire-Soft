---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo (bitácora)
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 📋 Insumo 13 — Backlog Funcional y Priorización

**Proyecto:** STIRE-Soft  
**Metodología de Clasificación:** MoSCoW (MVP / Importante / Futuro)  
**Fecha:** 30 de agosto de 2026  

---

## 1. Nivel MVP (Esencial para Demostración y Validación de Hipótesis)

* [x] **Autenticación JWT:** Registro, login y perfil con roles (`COMP-V00`).
* [x] **Gestión de Clases & Auto-matrícula:** Creación de clase por docente con código de acceso y matrícula de estudiantes (`DOC-V01`, `EST-V01`).
* [x] **Visor de Contenidos Teóricos:** Módulos, temas y unidades renderizados desde Markdown con diagramas SVG (`EST-V02`).
* [x] **Resolución en Sandbox Aislado:** Editor de código, ejecución segura en proceso hijo con timeout y memoria limitada, calificación automática y autoguardado (`EST-V03`).
* [x] **Tutor IA Socrático Adaptativo:** Inferencia con Google Gemini (`gemini-1.5-flash`) condicionada al mastery y nivel cognitivo del estudiante (`EST-V04`).
* [x] **Cálculo de Maestría (Mastery Learning):** Algoritmo `calculateUnitMastery()` ponderado por dificultad y estado cognitivo (`EST-V06`).
* [x] **Repetición Espaciada SM-2:** Programación de fechas de repaso y lista de unidades por vencer (`EST-V05`).
* [x] **Panel Docente de Cohorte:** Promedio de maestría grupal y ranking de estudiantes (`DOC-V04`).
* [x] **Mensajería Docente-Estudiante:** Bandeja de entrada, enviados, conversación por usuario y contador de no leídos — 6 endpoints funcionando (`DOC-V06`, recuperada en FASE CC-04, D-02; el backend ya existía y no tenía ventana asignada).

---

## 2. Nivel Importante (Versión Completa y Robusta de Producción)

* [ ] **Diseñador Visual de Casos de Prueba en UI:** Interfaz enriquecida para que el docente cree y pruebe casos sin tocar base de datos (`DOC-V03`).
* [ ] **Animación Interactiva de Trazado de Memoria:** Visor paso a paso de variables y llamadas a pila en la teoría (`EST-V02`).
* [ ] **Exportación de Reportes Académicos:** Descarga de notas en formato CSV/Excel para el sistema de calificaciones institucional (`DOC-V04`).
* [ ] **Panel Administrativo de Monitoreo en Tiempo Real:** Tacómetros visuales de uso de memoria, colas BullMQ y logs de seguridad (`ADM-V01`, `ADM-V03`).

---

## 3. Nivel Futuro (Largo Plazo / Post-Proyecto)

* [ ] **BYOK (Bring Your Own Key):** Interfaz para que estudiantes avanzados ingresen su propia clave de OpenAI/Gemini con almacenamiento cifrado AES-256 (`EST-V04`).
* [ ] **Soporte Multi-Lenguaje en Sandbox:** Incorporación de Python, C++ y Java en el motor de ejecución aislado.
* [ ] **Integración LTI con Moodle / Canvas:** Sincronización automática de notas y matrículas con el LMS institucional.

---

## 4. Retirado (D-05, FASE CC-04 — documentado, código no removido en esta fase)

* **Gamificación y Logros Pedagógicos (`GamificationModule`):** decisión de producto D-05 retira esta
  funcionalidad del backlog activo — no se construirá la UI de medallas/rachas descrita antes en este
  documento. `GamificationModule` sigue registrado en `src/app.module.ts` con `gamification.service.ts`
  y sus entidades, pero **no tiene controller ni rutas HTTP** (igual que `review-schedules` y
  `judge-engine`): es código muerto desde la perspectiva de la API, no una feature parcialmente
  construida. Esta fase (documentación pura) no toca `src/`; la retirada del código, si procede, es
  trabajo de una fase posterior explícitamente autorizada para tocar código.

---

## 5. Hallazgo operativo — timing de `verify:clean` bajo memoria reducida

No es un ítem de producto sino una nota de proceso registrada en `CLAUDE.md` (Regla de Oro): en
sesiones largas con muchos procesos Node acumulados (`npm ci` repetido, suites Jest completas), la
memoria libre del sistema puede caer a ~1 GB y el arranque de `dist/main.js` dentro de
`npm run verify:clean` puede no completar en el plazo esperado — sin que sea un defecto del script.
Se registra aquí para que quien reproduzca `verify:clean` y vea un fallo de arranque compruebe primero
la memoria libre del sistema antes de abrir un hallazgo de código.

---

## 6. Hallazgo de seguridad — sin restricción de rol en 4 rutas de estudiante (FASE CC-05, Paso 0b)

**Severidad: 🟠 MEDIA** (no es fuga de datos entre usuarios ni escalamiento de privilegios sobre
identidad ajena; sí es un defecto real de integridad de dominio y de control de acceso por rol).

**Rutas afectadas:** `POST /submissions/start`, `POST /submissions/:id/submit`,
`PUT /submissions/:id/autosave` (`submissions.controller.ts`), `POST /tutor/chat`
(`tutor.controller.ts`). Ya se habían identificado sin `@Roles(...)` en `04_MATRIZ_PERMISOS.md`
(FASE CC-04, Paso 6); este hallazgo verifica **a nivel de servicio** si algo más las restringe.

**Verificación (código real, no hipótesis):**
- `JwtAuthGuard` y `RolesGuard` están registrados globalmente (`APP_GUARD` en `app.module.ts`), así
  que las 4 rutas exigen JWT válido — pero `RolesGuard` solo bloquea cuando la ruta declara
  `@Roles(...)`; ninguna de las 4 lo declara, así que **cualquier rol autenticado pasa**.
- `SubmissionsService.startSubmission/submitAnswers/autosave` reciben `studentId` como el `user.id`
  del JWT del que llama, sin comprobar `user.role`. Un docente o admin autenticado puede iniciar,
  entregar y autoguardar un intento — bajo su propio `id`, no el de un estudiante real.
- `TutorService.sendMessage` recibe `studentId` de la misma forma, sin comprobar rol; un docente o
  admin puede consumir el Tutor IA (con costo de inferencia real, mitigado solo por el throttle de
  20 req/min, no por rol).
- **No hay fuga entre cuentas:** en ningún caso un usuario puede actuar como OTRO usuario — el
  `studentId`/`user.id` siempre es el propio del token. El riesgo es de integridad de datos
  (registros de "estudiante" generados por cuentas docente/admin, que pueden contaminar analíticas
  de cohorte en `DOC-V04` y cálculos de mastery) y de uso indebido de un recurso de costo (Tutor
  IA), no de confidencialidad.

**No se corrige en esta fase** (FASE CC-05 es documental, no toca `src/`). Queda como hallazgo
abierto para una fase de remediación de código: la corrección natural es `@Roles('estudiante')` en
las 4 rutas, análoga a como ya están protegidas otras rutas de rol único en el mismo controlador.
