# STIRE — Visión Funcional y Pedagógica del Sistema
**El "Por Qué" de la Plataforma: Problema, Solución y Propuesta de Valor Educativa**

---

## 1. El Problema Pedagógico que Resuelve STIRE

La enseñanza tradicional de Algoritmia y Programación en universidades enfrenta tres problemas estructurales que limitan el aprendizaje efectivo:

### 1.1 La Brecha de Retroalimentación
En un salón de 40 estudiantes, el docente no puede identificar en tiempo real quién está rezagado, qué conceptos generan mayor confusión o cuándo un estudiante necesita ayuda antes de que el examen parcial revele el fracaso.

### 1.2 El Olvido Acelerado (Curva de Ebbinghaus)
Sin refuerzo sistemático, los estudiantes olvidan el 60–80 % del contenido aprendido en la primera semana. Las evaluaciones únicas no combaten este fenómeno de forma estructurada.

### 1.3 La Talla Única en el Aprendizaje
Todos los estudiantes reciben el mismo contenido, al mismo ritmo y con la misma evaluación, ignorando que cada uno tiene un nivel de dominio diferente, aprende a velocidades distintas y falla en puntos conceptuales diferentes.

---

## 2. La Propuesta de Valor de STIRE

STIRE (**S**istema **T**utor **I**nteligente con **R**epetición **E**spaciada) propone una solución integral basada en tres pilares cognitivo-tecnológicos:

### 2.1 Pilar 1: Evaluación Adaptativa y Seguimiento de Dominio (Mastery)
Cada vez que el estudiante resuelve una actividad, el sistema calcula un indicador de dominio (`mastery`) ponderado por el tipo y peso de la actividad. Este indicador determina automáticamente:
- Si el estudiante puede avanzar a la siguiente unidad (umbral de 60 %).
- Qué nivel de profundidad debe usar el Tutor IA en sus explicaciones.
- Cuándo programar el próximo repaso espaciado.

### 2.2 Pilar 2: Repetición Espaciada Algorítmica (SM-2)
Inspirado en el algoritmo SuperMemo-2 (base de aplicaciones como Anki), STIRE programa automáticamente sesiones de refuerzo en intervalos crecientes. Si un estudiante domina bien un concepto, el sistema lo programa para revisión en 14 días. Si lo domina mal, el próximo repaso es mañana. Esto combate directamente la curva del olvido.

### 2.3 Pilar 3: Tutor IA Socrático y Contextualizado
En lugar de proporcionar respuestas directas, el Tutor IA actúa como un docente que guía al estudiante con preguntas y pistas, adaptando su lenguaje y profundidad según el nivel de dominio actual del alumno (principiante, intermedio, avanzado). El tutor nunca escribe el código por el estudiante; lo lleva a descubrirlo.

---

## 3. Los Actores del Sistema

| Actor | Rol | Responsabilidades Clave |
|-------|-----|------------------------|
| **Administrador** | Gestor institucional | Alta de docentes, configuración global del sistema. |
| **Docente** | Creador de contenido | Diseña el plan de estudios, sube material teórico, crea actividades y evaluaciones, monitorea el progreso de la clase. |
| **Estudiante** | Aprendiz activo | Consume contenido, resuelve actividades, interactúa con el Tutor IA, atiende sus sesiones de repaso programadas. |

---

## 4. La Jerarquía de Contenido Académico

STIRE organiza el conocimiento en una estructura curricular de 5 niveles:

```
Clase (e.g., "Fundamentos de Algoritmia — Grupo A")
└── Sección / Corte (e.g., "Primer Corte")
    └── Tema (e.g., "Variables y Tipos de Datos")
        └── Unidad de Aprendizaje (e.g., "Declaración de Variables en C++")
            ├── Contenido Teórico (PDF, Video, Markdown)
            └── Actividad (Quiz, Taller, Parcial)
                └── Preguntas (MCQ, Coding, Drag & Drop, Fill Code, Matching)
```

La **Unidad de Aprendizaje** es la unidad mínima evaluable del sistema: es el granulo al que se le asigna un `mastery`, un `review_schedule` y un historial de progreso individual por estudiante.

---

## 5. El Ciclo de Vida Cognitivo del Estudiante

```
1. EXPLORACIÓN      → El estudiante accede al material teórico de la unidad.
2. PRÁCTICA         → Resuelve actividades; el sistema califica y calcula mastery.
3. RETROALIMENTACIÓN → El Tutor IA ofrece soporte socrático si el mastery < 60 %.
4. DOMINIO          → Al superar el umbral, se desbloquea la siguiente unidad.
5. REPASO           → SM-2 programa revisiones periódicas para combatir el olvido.
6. CONSOLIDACIÓN    → Con cada repaso exitoso, el intervalo se extiende (hasta 60 días).
```

---

## 6. Métricas Clave del Sistema

| Métrica | Descripción | Dónde se persiste |
|---------|-------------|-------------------|
| `mastery` | Porcentaje de dominio ponderado (0–100 %) | `learning_progress.mastery` |
| `successRate` | % de intentos aprobados sobre el total | `learning_progress.successRate` |
| `attemptsCount` | Total de intentos realizados por el estudiante | `learning_progress.attemptsCount` |
| `nextReviewDate` | Fecha calculada por SM-2 para el próximo repaso | `review_schedules.nextReviewDate` |
| `urgencyLevel` | Prioridad de repaso (0=futuro, 1=mañana, 2=vencido, 3=crítico) | `review_schedules.urgencyLevel` |
| `easeFactor` | Factor de facilidad del algoritmo SM-2 | `review_schedules.easeFactor` |

---

## 7. Diferenciadores Técnicos de STIRE

1. **Motor de Evaluación con Strategy Pattern**: soporta 5 tipos de preguntas con arquitectura extensible para nuevos tipos sin modificar el core.
2. **Judge Engine con Docker Sandbox**: evaluación de código en contenedores aislados con límites estrictos de CPU/RAM/red para seguridad total.
3. **Arquitectura Event-Driven**: el sistema de puntos de aprendizaje, repasos y analíticas operan desacoplados mediante eventos, garantizando respuestas instantáneas al estudiante.
4. **XSS Protection**: todo contenido Markdown procesado es sanitizado con DOMPurify + JSDOM antes de ser entregado al frontend.
5. **Tutor IA con RAG conceptual**: el prompt del LLM se construye dinámicamente con el estado real del estudiante (mastery, historial, nivel).

---

## 8. Roadmap de Funcionalidades

| Fase | Funcionalidades | Estado |
|------|----------------|--------|
| **Fase 1 — Core Backend** | Auth, User, Class, LearningUnit, Submissions, EvaluationEngine, Analytics | ✅ Completado |
| **Fase 2 — Inteligencia** | TutorIA (RAG + SM-2), LearningProgress, ReviewSchedules, Notifications | ✅ Completado |
| **Fase 3 — Gamificación** | Badges, Logros, Tablas de clasificación, Puntos de experiencia | 🕐 En Pausa |
| **Fase 4 — Bancos de Preguntas** | QuestionBank reutilizable entre clases y docentes | 🕐 En Pausa |
| **Fase 5 — Frontend** | Interfaz de estudiante, docente y administrador | 🚧 En construcción activa — estudiante casi cerrado, docente/admin parciales |

---

## 9. Problemas Conocidos y Decisiones Pendientes (checkpoint 2026-09-10)

Esta sección registra, con fecha, los problemas reales reportados por el dueño del proyecto al usar la
plataforma y el estado verificado contra el código (no contra lo que dice un informe) el mismo día. Se
actualiza por checkpoints fechados, sin borrar los anteriores — mismo criterio que
`docs/antigravity/PLAN_IMPLEMENTACION.md`.

### 9.1 Reportado por el dueño del proyecto, 2026-09-10 (uso real de la plataforma)

1. Error 404 en `POST /submissions/start` al usar "Probar código" — perdió el sentido de continuidad de
   una racha (`streakDays`) de 4 días de uso real.
2. Los ejercicios se sienten muy difíciles y la jerarquía Clase → Sección → Tema → Unidad de Aprendizaje
   → Actividad no se explica por sí sola en la interfaz.
3. El Tutor IA tarda respondiendo y, al preguntar algo del ejercicio actual, pide "las instrucciones" en
   vez de detectar automáticamente en qué unidad/actividad está el estudiante.
4. El sandbox asume que el estudiante ya sabe JavaScript — falta un enfoque más didáctico para principiantes.
5. El panel de administrador no mostraba el usuario recién registrado.
6. El registro matriculó automáticamente al estudiante en la clase del Prof. Toscano, sin posibilidad real
   de elegir — pero el sistema va a tener varios docentes con contenido distinto cada uno.
7. Faltan credenciales documentadas para probar el sistema con datos reales, y un criterio simple de
   contraseña (mayúscula + minúscula + número) para las cuentas demo.
8. El registro debería tener un código de clase opcional; falta un flujo de "unirse a una clase con
   código" para el estudiante y de "crear clase con código" para el docente.
9. El docente debería poder aceptar/rechazar el ingreso de un estudiante a su clase (no solo matricularlo
   automáticamente al usar el código), cerrar/dar por terminado un curso, y quitar a un estudiante de su
   clase.
10. Cada Unidad de Aprendizaje puede tener varios tipos de evaluación, cada uno con un peso distinto; la
    idea es poder calcular (o dejar elegir al estudiante) qué actividad le corresponde según su dominio —
    si se siente experto, una actividad de mayor peso.
11. El docente debe poder crear esas actividades y organizar su propia clase (secciones, temas, unidades) —
    aunque primero se siembran datos demo para poder probar la aplicación.
12. Los roles no deberían poder cambiarse "así como así" en producción — el cambio rápido de rol
    (estudiante/docente/administrador) debe existir solo en la vista de demostración, junto a la
    nomenclatura MODESEC; en autenticación real el usuario entra como lo que es, sin selector de rol.
    Pidió verificar explícitamente si la autenticación real está implementada de forma segura.

### 9.2 Estado verificado contra el árbol de trabajo real, 2026-09-10 (commit `c989c15`)

Verificación hecha leyendo el código fuente directamente (backend y frontend), no los informes de
Antigravity — que para varios de estos puntos habían quedado desactualizados por un commit posterior al
que describían.

| # (ver 9.1) | Estado | Evidencia |
|---|---|---|
| 1 — 404 en sandbox | ✅ **Resuelto** en el código actual | `frontend-nuxt/stores/workspace.ts` ya no tiene ningún `activityId` fijo; `ensureActiveSubmission()` usa el id real que llegó del backend (`GET /activities/:id`). `src/submissions/submissions.service.ts` solo devuelve 404 si el id no existe en BD. El reporte del dueño del proyecto es de las 7:57 a.m.; el fix llegó en el commit de las 9:36 a.m. del mismo día — hay que volver a probar. |
| 2 — dificultad / jerarquía poco clara | ⚠️ No es un bug — el modelo Clase→Sección→Tema→Unidad→Actividad existe tal cual en el backend (`src/class`, `src/section`, `src/topic`, `src/learning-unit`). Pendiente: hacerlo más legible en la UI y calibrar dificultad del contenido sembrado. |
| 3 — Tutor sin contexto | ✅ **Resuelto** en el código actual | `src/tutor/dto/chat.dto.ts` (`ChatContextDto`) + `tutor-context.service.ts` ya reciben y usan `learningUnitId`, `activityId`, `currentRoute`, `currentCode`; el frontend (`stores/tutor.ts`) ya los envía en cada mensaje. Falta feedback progresivo durante la espera del LLM (DIS-03 del informe de Antigravity). |
| 4 — solo JavaScript | ❌ **No resuelto** | El editor está fijo a "JS"/"JavaScript" en `pages/estudiante/evaluacion/[activityId].vue`, y el único sandbox de ejecución real (`src/judge-engine/hardened-process-sandbox.adapter.ts`) rechaza explícitamente cualquier lenguaje que no sea `javascript`. El campo `language` existe en el modelo de datos pero no se usa. |
| 5 — admin sin datos reales | ✅ **Resuelto** | `pages/admin/index.vue` ya llama `GET /users` real. |
| 6 — auto-matrícula fija | ⚠️ **Parcialmente resuelto** | El registro ya NO matricula a nadie automáticamente (`src/auth/auth.service.ts` no toca enrollment); existe `POST /enrollment/join` con código real y el campo opcional en `register.vue`. Pero el seed solo pobló contenido curricular para la clase del Prof. Toscano — las clases del Prof. Castro y del Prof. Ali existen pero están vacías, así que la "coherencia multi-docente" todavía no se puede demostrar con datos reales. |
| 7 — credenciales de prueba documentadas | ✅ **Resuelto** | Tabla de credenciales demo ya está en el `README.md` raíz (creadas por `npm run seed` / `src/seeds/seed-runner.ts`), contraseñas con mayúscula+minúscula+número. |
| 8 — código de clase en registro / unirse / crear | ⚠️ **Parcialmente resuelto** | Backend y campo de registro ya existen. Falta confirmar/crear la pantalla del lado docente que muestre el código de su clase de forma clara para poder compartirlo. |
| 9 — aceptar/rechazar, cerrar curso, quitar estudiante | ❌ **No resuelto**, salvo cerrar curso | `POST /enrollment/join` matricula de inmediato, sin estado "pendiente de aprobación" (el enum `EnrollmentStatus` no tiene ese estado). No existe ningún endpoint para que un docente expulse a un estudiante puntual. Cerrar/terminar un curso sí es posible hoy vía `PATCH` de clase (`isActive: false`). |
| 10 — evaluación ponderada por unidad / elección según dominio | ⚠️ **Parcialmente resuelto** | `Activity.adaptiveWeight` (`src/activities/entities/activity.entity.ts:64`) ya existe y se usa de verdad en `src/common/utils/mastery.calculator.ts:14` para ponderar el `mastery` según el peso de cada actividad — eso es real, no decorativo. Lo que NO existe todavía: ningún mecanismo que, ANTES de resolver una actividad, recomiende o deje elegir al estudiante cuál actividad le corresponde según su dominio actual o su autopercepción ("me siento experto"). Es decir: el peso ya afecta el cálculo posterior, pero no hay motor de selección/recomendación previo. |
| 11 — docente crea actividades y organiza su clase | ✅ **Resuelto** | `src/activities/activities.controller.ts:20-26` ya expone `POST /activities` con `@Roles('docente', 'admin')`; `src/class`, `src/section`, `src/topic` ya tienen CRUD completo. El docente puede crear actividades y estructura vía API hoy — falta la interfaz gráfica para hacerlo sin Postman/Swagger, que es trabajo de frontend. |
| 12 — selector de rol solo en demo / seguridad de auth real | ✅ **Resuelto** (commit `4692ea0`) | `switchRoleForDemo()` ahora valida `config.public.demoMode` dentro de la propia función, no solo en el `v-if` del botón — ya no es invocable desde la consola del navegador si el modo demo está apagado. Verificado en vivo que el acceso demo real sigue funcionando igual con el modo activo. |

### 9.3 Segundo checkpoint, mismo día — verificación en vivo contra backend + frontend reales

Se levantaron ambos servidores (backend `:3001`, frontend `:3000`, ver `.claude/launch.json`) y se
reprodujo el flujo exacto del punto 1 de la §9.1 con el navegador, no solo leyendo código.

- **Punto 1 (404 en sandbox) — confirmado resuelto**, pero se encontró un bug relacionado y distinto:
  `POST /submissions/start` ya responde `201`, pero al presionar "Probar código" sobre "Completar
  Código: Validador de Formulario de Registro" el backend respondía `400`: *"Esta actividad no tiene
  una pregunta de código para ensayar"*. Causa real: esa actividad es de tipo `fill_code`
  (`src/seeds/seed-runner.ts:538-578`), no `coding` — pero `workspace.ts` trataba cualquier pregunta
  como si fuera código libre. **Corregido en el commit `29575e6`**: el store ahora registra el tipo
  real de la pregunta y solo arma el sandbox de código cuando es `coding`; para otros tipos, el botón
  queda deshabilitado con un aviso explícito en vez de dejar que el estudiante choque con un error
  confuso o pierda un intento real. Verificado en vivo contra ambos casos: la actividad `fill_code`
  (id 19) queda bloqueada correctamente; la actividad `coding` real (id 20, "Validador de Acceso por
  Edad") sigue funcionando de punta a punta — `POST /submissions/:id/run` responde `201` con 2/2 casos
  superados.
- **De paso**, se encontró y corrigió que el modal de "Entrega Exitosa" en
  `pages/estudiante/evaluacion/[activityId].vue` mostraba siempre "100/100 pts" y "85% de dominio"
  fabricados, sin mirar el resultado real — mismo patrón de "fallo/resultado disfrazado" que ya se
  había cerrado en `auth.ts` y `workspace.ts` en sesiones anteriores. Ahora usa
  `totalScore`/`passedCount`/`totalCount` de la respuesta real y solo felicita cuando de verdad se
  superaron todos los casos.
- **Hallazgo nuevo, NO resuelto todavía** (encontrado al probar "Entregar solución" de punta a punta
  sobre la actividad `coding` real): `POST /submissions/:id/submit` respondió
  `{"totalScore":0,"status":"submitted"}` — sin `totalScore` real ni conteo de casos — a pesar de que
  el mismo código ya había superado 2/2 casos con "Probar código" segundos antes. Causa raíz
  (`src/submissions/submissions.service.ts:64-158`): la calificación de preguntas `coding` es
  asíncrona a propósito (`evalResult.needsAsyncJudge`, arquitectura event-driven — ver §7.3), así que
  la respuesta inmediata del `submit` nunca trae la nota final; el resultado real solo se conoce
  después, vía el evento `submission.graded`. **El frontend no tiene ningún mecanismo (polling,
  websocket o notificación) para recoger ese resultado una vez calificado** — hoy, para una actividad
  de código real, el estudiante nunca ve su nota verdadera en esta pantalla. Pendiente de decidir el
  mecanismo (encuesta periódica a `GET /submissions/:id`, canal de notificaciones ya existente, o
  ambos) antes de implementarlo.

---

*Este documento es la referencia de visión funcional de STIRE. Toda decisión técnica tomada en el backend debe poder trazarse hasta uno de los 3 pilares pedagógicos descritos en la sección 2.*
