# 🚀 Bitácora de Monitoreo y Control N.º 3 — Proyecto: STIRE-Soft
**Curso:** DDSE3 — 2026-2 | **Grupo:** [G1 / G2]
**Repositorio GitHub:** https://github.com/Jeider-Gomez/Stire-Soft
**Semana reportada:** 31 de agosto – 4 de septiembre de 2026 | **Cierre:** viernes 4 de septiembre, 8:00 p.m.
**Estado del sprint:** MODESEC multi-rol cerrado (16 ventanas, matriz de permisos corregida contra el código) · bibliografía reconstruida y verificada (15/15 + 24 obras) · Fase I de MODESEC cerrada para el alcance del MVP (D-06) · sistema visual y prototipo interactivo cableados en Figma · Nuxt sin iniciar (frontend Next.js/React sigue congelado, decisión ya tomada en Bitácora N.º 2).
**Tablero Kanban (Trello):** `https://trello.com/b/Zek3mVEX`

*STIRE-Soft es un Sistema Tutor Inteligente para la Resolución de Ejercicios: el estudiante entrega código, el sistema lo ejecuta de forma aislada, lo califica y adapta los siguientes ejercicios a su nivel de dominio.*

---

## 👥 1. Estructura del Equipo y Roles

| Integrante | Rol Principal y Responsabilidades del Sprint | Horario de Reunión Individual | GitHub User |
| :--- | :--- | :--- | :--- |
| **Jeider Gómez** | **Líder Técnico & Backend:** Arquitectura, cierre backend, Tutor IA, Sandbox y setup Nuxt | *[Miércoles 4 a 6 pm]* | @Jeider-Gomez |
| **Jorge Cervantes** | **Gestión & Calidad:** Tablero Trello, QA de entregables e Investigación (15 artículos) | *Jueves 10 a.m. a 12 p.m.* | @IvanGoats |
| **José López** | **UI/UX & Comunicación:** Diseño visual, wireframes de vistas y Pitch de avances | *[Miércoles 2 a 4 pm]* | @JoseTheGoat90 |
| **Julio Galvis** | **Diseño Instruccional:** MODESEC multi-rol, flujos pedagógicos y navegación | *Jueves 4 a 6 pm* | @jcg0912 |
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

### 3.1 Retos del Sprint — estado real al cierre (4 de septiembre, 8:00 p.m.)

> **Nota de trazabilidad:** no se localizó en el repositorio un archivo que enumere los 8 Retos con
> nombre y alcance (la Guía de Semana y el cronograma del docente están en `.docx`, no legibles por
> esta herramienta). Los Retos 1, 5 y 7 se verifican con el nombre dado por Jeider en la instrucción
> de esta fase. Los Retos 2, 3, 4, 6 y 8 se **infieren** de los "Resultados esperados" §2.1 de este
> mismo documento (ítems 6-10) y de los roles del equipo — están marcados como inferidos para que
> se corrijan si el docente usa una numeración distinta.
>
> Regla aplicada: **solo se marca `[x]` lo que tiene un commit o un archivo real detrás.** Lo demás
> queda `[ ]` con su razón.

- [x] **Reto 1 · MODESEC multi-rol — CERRADO.** 16 ventanas con códigos unificados (D-02), 32
  documentos con cabecera de estado, dos mapas de navegación resueltos (3 clics, 7±2 con hallazgos
  declarados y luego resueltos en CC-06), matriz de permisos (`04_MATRIZ_PERMISOS.md`) reescrita
  contra el código real — incluido el hallazgo de que 4 rutas no tienen `@Roles` en absoluto —,
  fundamentación Pressman/Mandel auditada con números reales. Commits: `7cb4aa2`…`451dca9` (FASE
  CC-04) y `a68af40`, `2948295` (FASE CC-05/CC-05B).

- [ ] **Reto 2 (inferido) · Backend — EN CURSO, no cerrable esta semana.** 34 módulos en `src/`, 39
  suites / 272 tests pasando de forma estable (con un flaky de timing del sandbox ya documentado en
  `CLAUDE.md`, no nuevo). No se declara "cerrado" porque el hallazgo de esta misma semana (`Reto 1`)
  encontró 4 rutas de estudiante sin restricción de rol a nivel de servicio
  (`13_BACKLOG_FUNCIONAL.md` §6) — corrección pendiente, no se infla el estado por eso.

- [ ] **Reto 3 (inferido) · Tutor IA con proveedor real — NO VERIFICABLE DESDE EL REPOSITORIO.**
  `TutorService` soporta OpenAI y Google Gemini con fallback documentado a inferencia local simulada
  si `OPENAI_API_KEY` no está configurada (`src/tutor/tutor.service.ts`). Existe un `.env` local no
  versionado con contenido no trivial (1219 bytes) — no se lee su contenido por política de
  seguridad, así que no se puede confirmar aquí si la clave configurada es real o si el sistema sigue
  cayendo al mock. Se declara **no verificable**, no "cerrado", hasta que alguien del equipo lo
  confirme con una prueba real fuera de este repositorio.

- [x] **Reto 4 (inferido) · Sandbox — CERRADO en fase de decisión documental** (ya lo cerró
  Bitácora N.º 2): `HardenedProcessSandboxAdapter`, aislamiento por proceso del sistema operativo,
  sin Docker. No hubo cambios de código al sandbox esta semana — se mantiene el estado.

- [ ] **Reto 5 · Nuxt — NO INICIADO.** No existe `frontend-nuxt/` ni ningún directorio Vue/Nuxt en
  el repositorio. Razón: se priorizó la coherencia de MODESEC (Fase I y el sistema visual en
  Figma), que es lo que debía existir *antes* de escribir la primera línea de Nuxt, para no repetir
  el error que Bitácora N.º 2 ya señaló ("no construir un frontend fragmentado sin especificación
  común"). **Hallazgo verificado, no confundir con "no iniciado" sin más:** sí existe `frontend/`
  — un experimento en **Next.js 16.2.3 + React 19.2.4**, con 4 commits reales entre el 27 de abril y
  el 25 de agosto de 2026, 24 archivos `.tsx` y rutas para estudiante/docente/admin/login/tutor.
  Esto **no es nuevo esta semana** — Bitácora N.º 2 (§2.1, ítem 5 de este documento) ya decidió
  congelarlo como "prueba histórica y sin nuevas funcionalidades". Se reafirma esa decisión: no se
  tocó ni se extendió esta semana.

- [ ] **Reto 6 (inferido) · Gestión / Trello — NO VERIFICABLE DESDE EL REPOSITORIO.** El tablero
  (`https://trello.com/b/Zek3mVEX`) no es accesible con las herramientas de esta sesión. No se marca
  cerrado sin evidencia.

- [x] **Reto 7 · 15 artículos — CERRADO, resultado más fuerte de la semana.** Las 15 referencias
  originales de la matriz resultaron **fabricadas** (11 DOI inexistentes, 4 resolviendo a una obra
  distinta a la citada) — detectado, no oculto. Reconstruidas y verificadas 15/15 tras el hallazgo,
  más 24 obras adicionales en la matriz ampliada del proyecto. Proceso completo, verificable DOI por
  DOI, en `docs/investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`. Commits de FASE CC-01 a CC-03 y
  la separación de matrices en `5424399`.

- [ ] **Reto 8 (inferido) · Pitch de avances — EN CURSO, se cierra en esta misma sesión.** Ver
  `docs/pitch/PITCH_SEMANA_03.md`, creado como parte de este cierre (Parte B).

**Fase I de MODESEC** (transversal a los retos de arriba, no es uno de los 8): **CERRADA PARA EL
ALCANCE DEL MVP** (decisión D-06). Formato 5 transcrito literalmente del Plan de Curso `203413`,
§3.1 rederivado con el alcance declarado (no oculto), tabla de trazabilidad con columna de
cobertura — 10 filas `cubierto`, 3 `pendiente` (huecos reales, declarados uno por uno), 0
`fuera de alcance` en la tabla misma. Commits `a68af40`, `2948295`.

---

## 🔗 Prototipo interactivo (FASE CC-07, Parte A)

**Archivo Figma:** `STIRE-Soft — Sistema Visual` · fileKey `1MjKiDrjU65ezO3ztO0v4m`
**Enlace de presentación:** https://www.figma.com/proto/1MjKiDrjU65ezO3ztO0v4m/STIRE-Soft?node-id=11-2&starting-point-node-id=11-2

Arranca en `COMP-V00`, recorre `EST-V01` → `EST-V02`/`EST-V03`/`EST-V05`/`EST-V06`, con el Tutor IA
(`EST-V04`) cableado como **overlay** (no como navegación) — se cierra y devuelve el ejercicio
intacto, sosteniendo la decisión de que el tutor no es un destino. Caminos cableados a los 3 estados
exigidos por la auditoría: `EST-V03` Entregar → completado, caso de prueba que falla → error;
`EST-V05` sin repasos pendientes → **declarado sin camino natural** en vez de inventar un hotspot
falso (no hay una acción de "completar todos los repasos" en el diseño actual).

**Ruta más larga a contenido formativo:** `COMP-V00 → EST-V01 → EST-V02 → EST-V03` = **3 clics**
(exigencia del docente: ≤3 — se cumple, en el límite). Rutas directas desde `EST-V01` (tarjeta
"Continuar ejercicio", menú "Mi Progreso") acortan a 2 clics desde el login.
Ninguna conexión wireada quedó rota — las 17 reacciones creadas se verificaron una por una contra
sus IDs de destino reales. El resto de los 28 frames (estados vacío/error/completado de las vistas
no cubiertas por A3) permanecen navegables desde el editor de Figma pero no desde clics del
prototipo — no se inventaron hotspots para forzar su alcance.

---

## 📖 Decisiones del sprint

| # | Decisión | Enlace |
|---|---|---|
| D-01 | La metáfora del "taller" se conserva solo como marco de ícono/paleta, nunca como texto visible en la UI | [`NAMING_STIRE.md`](docs/modesec/NAMING_STIRE.md) |
| D-02 | Códigos de ventana docente unificados: 6 ventanas exactas, resolviendo un conflicto de dos numeraciones incompatibles | [`ventanas/3.3.1_FICHAS_VENTANAS.md`](docs/modesec/ventanas/3.3.1_FICHAS_VENTANAS.md) |
| D-03 | `review-schedules` solo se construye si hay tiempo; `ADM-V01`/`ADM-V03` quedan REQUERIDO-PENDIENTE-DE-BACKEND porque su único endpoint referenciado no existe | [`13_BACKLOG_FUNCIONAL.md`](docs/modesec/13_BACKLOG_FUNCIONAL.md) |
| D-04 | La rederivación de §3.1 desde `COMP-203413` se difiere a cuando exista el Formato 5 real, no se fuerza antes | [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md`](docs/modesec/contenidos/3.1_DIAGRAMA_CONTENIDOS.md) |
| D-05 | `GamificationModule` se retira del backlog activo por decisión de producto; el código no se borra en esta fase | [`13_BACKLOG_FUNCIONAL.md` §4](docs/modesec/13_BACKLOG_FUNCIONAL.md) |
| D-06 | STIRE es una herramienta de apoyo docente, no la plataforma del curso — cubre razonamiento algorítmico y estructuras de control, no `COMP-203413` completa | [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md` §6](docs/modesec/contenidos/3.1_DIAGRAMA_CONTENIDOS.md) |

---

## ⚠️ Riesgos vivos al cierre

1. **Nuxt sin iniciar, con sustentación el 15/17 de septiembre.** El sistema visual y el prototipo
   ya existen en Figma; falta la implementación real en código. Riesgo de tiempo, no de diseño.
2. **4 rutas de estudiante sin control de rol** (`POST /submissions/start`,
   `POST /submissions/:id/submit`, `PUT /submissions/:id/autosave`, `POST /tutor/chat`) — un
   docente o admin autenticado puede usarlas como si fuera estudiante. Severidad media (no hay fuga
   entre cuentas), registrado en `13_BACKLOG_FUNCIONAL.md` §6, sin corregir.
3. **8 de 10 unidades de aprendizaje sin contenido sembrado** en `db:seed:demo` — el modelo de datos
   las soporta, no hay instancias reales. Registrado en `docs/modesec/fase1/TRAZABILIDAD.md`.
4. **Tests del sandbox intermitentes por timing**, no por defecto de código — documentado en
   `CLAUDE.md` (degradación bajo memoria reducida en sesiones largas). Repetir antes de reportar un
   hallazgo de código si `verify:clean` u otra corrida falla en el arranque.
5. **Reto 3 (Tutor IA con proveedor real) y Reto 6 (Trello) no verificables desde este repositorio**
   — no se marcan como cerrados sin evidencia, pero tampoco se puede confirmar que sigan abiertos.

---

## 📌 11. Compromisos para la Semana Siguiente

- Iniciar `frontend-nuxt/` (Vue 3 + Nuxt 3) sobre el sistema visual ya cableado en Figma — es la
  tarea que más bloquea la sustentación del 15/17 de septiembre.
- Corregir el control de rol de las 4 rutas listadas en Riesgos vivos #2.
- Sembrar contenido real para las 8 unidades de aprendizaje pendientes (Riesgo #3).
- Confirmar en persona (no en este repositorio) el estado real del Tutor IA con proveedor real y del
  tablero Trello, para poder cerrar los Retos 3 y 6 con evidencia.
- Diseñar las vistas de Docente y Administrador en Figma (CC-08) — explícitamente fuera de esta
  semana.

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
