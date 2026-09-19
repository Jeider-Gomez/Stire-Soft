# STIRE — 03. Motores de Evaluación y Lógica Cognitiva del Tutor IA
**Especificación Técnica del Motor de Ejecución Segura, Motor de Cuestionarios Dinámicos, Cálculo de Mastery y Lógica del Tutor IA (RAG & SM-2)**

---

## 1. El Motor de Cuestionarios Dinámicos (Activity Engine)

El "Activity Engine" es el encargado de orquestar la carga de reactivos y calificar de manera extensible las entregas de los alumnos.

### 1.1 Estructura Semi-Estructurada JSON
Para evitar migraciones constantes de la base de datos MySQL ante la inserción de nuevos tipos de preguntas (por ejemplo: emparejamiento, ordenamiento, rellenar espacios), la entidad `ActivityQuestion` implementa la columna `config` como un campo de tipo `JSON` tipado de manera dinámica. Las interfaces de tipado que controlan esta configuración son:
*   `McqConfig`: `{ options: string[], correct: string[] }`
*   `CodingConfig`: `{ language: string, starterCode: string, testCases: { input: string, expected: string, isPublic: boolean, label?: string }[] }`
*   `FillCodeConfig`: `{ template: string, blanks: { id: string, answer: string, regexMode: boolean }[] }`
*   `DragDropConfig`: `{ items: string[], correctOrder: number[] }`
*   `MatchingConfig`: `{ pairs: { source: string, target: string }[] }`

### 1.2 Flujo de Auto-Grading (Pattern Strategy)
El motor de evaluación implementa el patrón **Strategy** para desacoplar la lógica de calificación de cada tipo de pregunta.
```mermaid
classDiagram
    class EvaluationEngineService {
        -strategies: Map<QuestionType, IEvaluatorStrategy>
        +evaluateAnswer(questionType, studentAnswer, config, maxPoints) EvaluationResult
    }
    class IEvaluatorStrategy {
        <<interface>>
        +evaluate(studentAnswer, config, maxPoints) EvaluationResult
    }
    class McqEvaluator {
        +evaluate(...)
    }
    class CodingEvaluator {
        +evaluate(...)
    }
    class FillCodeEvaluator {
        +evaluate(...)
    }
    EvaluationEngineService --> IEvaluatorStrategy
    McqEvaluator ..|> IEvaluatorStrategy
    CodingEvaluator ..|> IEvaluatorStrategy
    FillCodeEvaluator ..|> IEvaluatorStrategy
```
1.  **Recepción:** `SubmissionsService.submitAnswers()` recibe la carga útil de respuestas del estudiante.
2.  **Dispatching:** Se delega cada respuesta individual al método `EvaluationEngineService.evaluateAnswer()`.
3.  **Selección de Estrategia:** El servicio resuelve del mapa de estrategias inyectado la instancia correspondiente a `QuestionType` (ej. `MCQ`, `FILL_CODE`, `MATCHING`, `DRAG_DROP`, `CODING`).
4.  **Ejecución:**
    *   **MCQ/Closed questions:** Comparan valores directos y retornan inmediatamente un `EvaluationResult` conteniendo `{ isCorrect: boolean, score: number, feedback: string }`.
    *   **Coding questions:** `CodingEvaluator` intercepta la ejecución de código fuente de programación y establece en el resultado la bandera `{ needsAsyncJudge: true, score: 0 }`.
5.  **Persistencia:** Las calificaciones e instancias de `SubmissionAnswer` se persisten en la base de datos relacional dentro de una misma transacción.

---

## 2. El Motor de Ejecución de Código (Judge Engine)

El "Judge Engine" ejecuta código fuente proveído por estudiantes bajo un sandbox seguro y aislado, mitigando vulnerabilidades de ejecución remota de comandos (RCE) y ataques de denegación de servicio (DoS).

> **Estado del Sandbox — Patrón Adaptador activo (revisado tras la auditoría de la Ola 1):**
> El sistema implementa el **Patrón Adaptador** (`SandboxAdapter`) con **fail-closed** por diseño: un valor no reconocido de `SANDBOX_TYPE` aborta el arranque con una excepción explícita, nunca degrada a un adaptador inseguro.
>
> | Modo | Configuración | Descripción | Disponibilidad |
> |---|---|---|---|
> | `hardened` | `SANDBOX_TYPE=hardened` (default) | `HardenedProcessSandboxAdapter`: aislamiento por **proceso hijo del sistema operativo**, no por contexto de JavaScript. Cuatro barreras independientes (ver §2.2). Sin Docker ni Redis. | **Activo — único modo real, probado con los payloads de ataque del informe de auditoría** |
> | `docker` | `SANDBOX_TYPE=docker` | No implementado. El adaptador anterior era un *mock* que aprobaba cualquier código que contuviera la palabra `"correct"` (hallazgo P0-05). | **Arranque abortado con excepción** |
> | `vm` / `local` | `SANDBOX_TYPE=vm` | Deshabilitado. El adaptador anterior usaba `node:vm`, que **no es una frontera de seguridad**: escape de sandbox confirmado y reproducido (lectura de `process.env` y ejecución de comandos del sistema operativo vía `this.constructor.constructor('return process')()`), hallazgo P0-01. | **Arranque abortado con excepción** |
>
> El `JudgeWorker`/`JudgeExecutionService` no conocen el adaptador concreto — solo interactúan con la interfaz `SandboxAdapter.executeIsolated()`. El día que exista infraestructura Docker real, un cuarto adaptador puede entrar detrás de la misma interfaz sin tocar el resto del pipeline.

### 2.1 Desacoplamiento del pipeline de calificación (puerto `JudgeQueue`)
La calificación asíncrona pasa por un puerto (`JudgeQueue`), configurable con `QUEUE_DRIVER`, **no** por una dependencia directa a BullMQ:

| Modo | Configuración | Descripción |
|---|---|---|
| `inline` | `QUEUE_DRIVER=inline` (default) | `InlineJudgeQueueAdapter`: el envío se despacha fuera del ciclo de la petición HTTP con `setImmediate` y se ejecuta contra el mismo `SandboxAdapter`, en el mismo proceso. Sin Redis. |
| `redis` | `QUEUE_DRIVER=redis` | `BullJudgeQueueAdapter`: el pipeline con BullMQ para producción con concurrencia alta. `BullModule` solo se registra en este modo. |

`JudgeExecutionService` contiene la lógica real de calificación (ejecutar cada test case, persistir `ExecutionResult`, calcular el puntaje) y es compartida por ambos modos — reporta el resultado emitiendo los eventos `judge.answer-graded` / `judge.answer-failed` (con `emitAsync`, para no perder el resultado en silencio si el listener falla) en vez de inyectar `SubmissionsService` directamente. Esto evita acoplar `judge-engine` al dominio `submissions` y rompe una dependencia circular real entre ambos módulos.

### 2.2 Ciclo de ejecución en el sandbox endurecido
```mermaid
flowchart LR
    A[SubmissionsService detecta pregunta CODING] -->|JudgeQueue.enqueue| B{QUEUE_DRIVER}
    B -- inline --> C[InlineJudgeQueueAdapter setImmediate]
    B -- redis --> D[(Cola Redis)] --> E[JudgeWorker @Processor]
    C --> F[JudgeExecutionService.gradeAnswer]
    E --> F
    F --> G{Itera testCases}
    G --> H[HardenedProcessSandboxAdapter: proceso hijo]
    H --> I["--permission\n--disallow-code-generation-from-strings\nentorno minimo\ncortafuegos de red"]
    I --> J{¿Ejecutó correctamente?}
    J -- Éxito --> K[Captura stdout, tiempo]
    J -- Error/timeout --> L[Captura stderr saneado, estado]
    K & L --> M[Guarda ExecutionResult en BD]
    M --> N{¿Más testCases?}
    N -- Sí --> G
    N -- No --> O[Emite judge.answer-graded]
    O --> P[JudgeGradedListener actualiza SubmissionAnswer/Submission]
```
1.  **Iteración:** se recorren los `testCases` del `config` de la pregunta (array plano; no existe distinción `publicTestCases`/`hiddenTestCases` en el dato real — ver §5).
2.  **Aislamiento por proceso, no por contexto de JS:** cada test case se ejecuta en un proceso hijo real de Node (`child_process.spawn`), con cuatro barreras independientes:
    *   **Entorno mínimo:** el proceso hijo no hereda las variables del proceso padre (`JWT_SECRET`, `DB_PASSWORD`, `TUTOR_KEY_ENCRYPTION_SECRET` no están disponibles). En Windows se declaran a mano las variables que `libuv` inyectaría igualmente si faltaran (`SystemRoot`, `TEMP`, etc.), neutralizadas.
    *   **Modelo de permisos de Node (`--permission`):** sin `--allow-fs-write`, `--allow-child-process`, `--allow-worker` — bloquea escritura en disco, RCE vía procesos hijos anidados e hilos.
    *   **Sin generación de código (`--disallow-code-generation-from-strings`):** neutraliza el vector exacto del hallazgo P0-01.
    *   **Cortafuegos de red en el preludio:** un script `--require` anula `net.connect`, `http.request`, `fetch`, y toda la resolución DNS (incluidos `dns.promises` y `dns.Resolver`, que evadían el cortafuegos original — corregido en Ola 2) antes de que el código del estudiante se ejecute.
3.  **Límites de recurso:** timeout de 2000ms (mata el proceso con `SIGKILL`), `--max-old-space-size=128` para memoria, y un tope de bytes de salida para evitar bombas de `stdout`.
4.  **Análisis de salida:** captura `stdout` y, ante error, `stderr` saneado (rutas absolutas del host eliminadas antes de mostrarlo al estudiante).
5.  **Persistencia:** cada resultado de test case se guarda en `execution_results`.
6.  **Reporte del resultado:** al terminar todos los test cases, se emite `judge.answer-graded` (o `judge.answer-failed` si algo falló de forma no recuperable), que un listener en el dominio `submissions` consume para actualizar la nota real.
7.  **WebSocket Gateway:** **no existe** en el código (era una aspiración documental, no una funcionalidad implementada). El resultado se conoce en la siguiente consulta HTTP del cliente, no en tiempo real.

---

## 3. Lógica del Tutor IA e Inteligencia Adaptativa

STIRE utiliza un ecosistema cerrado para procesar y adaptar la experiencia del estudiante combinando el cálculo de Mastery, el agendamiento del algoritmo SM-2 y la inyección contextual socrática al LLM.

### 3.1 El Tutor IA (Conversación y Prompt Dinámico)
El `TutorService` construye una conversación enriquecida mediante técnicas de RAG conceptual y límites estrictos de contexto.

```mermaid
sequenceDiagram
    participant E as Estudiante
    participant TC as TutorController
    participant TS as TutorService
    participant CS as TutorCredentialService
    participant TCS as TutorContextService
    participant CR as TutorConversationsRepo
    participant G as Google Gemini (clave del estudiante)
    participant DB as MySQL

    E->>TC: POST /tutor/chat { message, context }
    TC->>TS: sendMessage(user, message, context)
    TS->>CS: getDecryptedKey(studentId)
    CS->>DB: tutor_credentials (AES-256-GCM)
    alt Sin clave configurada
        TS-->>E: 428 — configura tu clave gratuita de Google AI Studio
    end

    TS->>TS: Verifica que el estudiante puede leer learningUnitId (misma regla que GET /learning-unit/:id)
    par Construcción de Contexto
        TS->>TCS: buildSystemPrompt(studentId, context)
        TCS-->>TS: systemPrompt (nivel + reglas pedagógicas)
    and Historial de Conversación
        TS->>CR: getRecentContext(studentId, limit=6) — ANTES de guardar el mensaje nuevo
        CR-->>TS: últimos 6 mensajes
    end

    TS->>G: POST models/{modelo}:generateContent (cabecera x-goog-api-key)
    alt Clave rechazada
        TS-->>E: 422
    else Cuota gratuita agotada
        TS-->>E: 429
    else Google no disponible
        TS-->>E: 503
    else Respuesta
        G-->>TS: aiResponseContent
        TS->>DB: save(user) + save(assistant) — solo tras una respuesta exitosa
        TS-->>E: { message, suggestedActivity }
    end
```

#### Construcción del System Prompt Adaptativo
El prompt inyectado al LLM no es plano, sino que se recalcula bajo la siguiente lógica parametrizada:
1.  **Recuperación:** Carga todos los registros de `LearningProgress` del estudiante en cuestión.
2.  **Agregación:** Calcula el promedio aritmético de dominio cognitivo:
    $$\text{avgMastery} = \frac{\sum \text{mastery}}{\text{count}(learningProgress)}$$
3.  **Clasificación de Perfil:**
    *   $\text{avgMastery} > 80$: Asigna nivel `AVANZADO`.
    *   $50 < \text{avgMastery} \le 80$: Asigna nivel `INTERMEDIO`.
    *   $\text{avgMastery} \le 50$: Asigna nivel `PRINCIPIANTE`.
4.  **Generación de Prompt:** Construye las directivas de comportamiento del LLM según el nivel asignado (por ejemplo, exigir el uso de analogías cotidianas para principiantes, o incentivar análisis avanzados de Big-O para el perfil avanzado).
5.  **Método Socrático Obligatorio:** Se instruye al tutor IA a actuar guiando al estudiante a encontrar su propia respuesta, impidiéndole deliberadamente escribir el código fuente de la solución.

#### Ventana de Contexto
El historial conversacional recuperado mediante `TutorConversationsRepository.getRecentContext()` está restringido a los últimos **6 mensajes** (3 interacciones del usuario y 3 de la IA). Esto previene la saturación del límite de tokens en los LLMs comerciales y optimiza las consultas SQL indexando las tablas por `(studentId, createdAt DESC)`.

#### Estado del LLM en el Código
El Tutor usa **Google Gemini con la clave gratuita de Google AI Studio que aporta cada estudiante** (decisión del dueño del proyecto, 2026-09-19 — ver `docs/ADR_DECISIONES_ARQUITECTURA.md`, ADR 10). No existe clave global del servidor, ni respuesta simulada de reserva: sin clave propia, el Tutor pide configurarla (`428`); si Google rechaza la clave responde `422`, si la cuota gratuita se agota `429` y si no está disponible `503`. La clave se guarda cifrada (AES-256-GCM, secreto `TUTOR_KEY_ENCRYPTION_SECRET`), nunca se devuelve completa al cliente y viaja a Google en la cabecera `x-goog-api-key`, no en la URL. Endpoints: `GET/PUT/DELETE /tutor/api-key` y `GET /tutor/history`.

**Nivel de ayuda, configuración del docente y barrera anti-solución (ADR 11).** La ayuda escala sola con los intentos fallidos del estudiante en la actividad (1 pista conceptual, 2 pregunta guía, 3 localizar la falla, nunca la solución). El docente puede activar o desactivar el Tutor, fijar un tope de ayuda y elegir un estilo cerrado por clase, unidad o actividad (`GET/PUT /tutor/settings/:scopeType/:scopeId`; el más específico manda). Dentro de una actividad, una barrera en código sustituye por un aviso los volcados de código larguísimos y los programas con forma de solución del ejercicio, sin gastar una llamada extra al LLM y sin bloquear explicaciones del propio código del estudiante.

---

### 3.2 El Algoritmo de Cálculo de Mastery (Dominio Temático)

El Mastery es una representación numérica ponderada del grado de comprensión de un estudiante sobre una unidad de aprendizaje.

#### Algoritmo Matemático
Para todas las actividades publicadas de una Unidad de Aprendizaje:
1.  Se obtiene el puntaje máximo obtenido por el estudiante en cualquiera de sus intentos (es decir, el valor más alto en la tabla `submissions` para la actividad dada).
2.  Se calcula el peso dinámico de la actividad:
    $$\text{peso} = \text{activity.adaptiveWeight} \times \text{activityType.baseWeight}$$
3.  Se computa el Mastery ponderado:
    $$\text{Mastery} = \min\left(100, \text{round}\left( \frac{\sum_{i=1}^{n} \left(\frac{\text{mejorScore}_i}{\text{puntosMaximos}_i} \times \text{peso}_i\right)}{\sum_{i=1}^{n} \text{peso}_i} \times 100 \right)\right)$$

#### Ejemplo Práctico de Cálculo
Unidad de aprendizaje con tres actividades:
*   **Actividad 1 (Quiz):** peso = $1.0$, mejor score = $80/100$.
*   **Actividad 2 (Taller Código):** peso = $1.5$, mejor score = $60/100$.
*   **Actividad 3 (Parcial):** peso = $3.0$, mejor score = $70/100$.

$$\text{Suma Contribuciones} = \left(\frac{80}{100} \times 1.0\right) + \left(\frac{60}{100} \times 1.5\right) + \left(\frac{70}{100} \times 3.0\right) = 0.8 + 0.9 + 2.1 = 3.8$$
$$\text{Suma Pesos} = 1.0 + 1.5 + 3.0 = 5.5$$
$$\text{Mastery Final} = \text{round}\left(\frac{3.8}{5.5} \times 100\right) = 69\%$$

#### Cálculo del `successRate` (Tasa de Acierto)
A diferencia del Mastery, que evalúa el mejor desempeño histórico, la tasa de efectividad mide la solidez de aprendizaje:
$$\text{successRate} = \left( \frac{\text{intentosAprobados}}{\text{intentosTotales}} \right) \times 100$$
*   Un intento aprobado es aquel con $\text{score} \ge \text{activity.passingScore}$.
*   Esto ayuda a identificar si un estudiante domina el tema por asimilación o si simplemente resolvió una prueba por ensayo y error (ej: si obtuvo Mastery de 90% pero tiene un `successRate` de sólo 20%).

---

### 3.3 Repetición Espaciada (Adaptación del Algoritmo SM-2)

STIRE implementa una variante del algoritmo clásico SuperMemo-2 para programar automáticamente las sesiones de refuerzo de los estudiantes.

#### Reglas de Agendamiento
*   **Repetición 1 (repetitions = 0):** `intervalDays = 1` (repaso inmediato al día siguiente).
*   **Repetición 2 (repetitions = 1):** `intervalDays = 3` (repaso a los 3 días).
*   **Repeticiones superiores (repetitions >= 2):**
    El factor de facilidad (`easeFactor`) se computa dinámicamente en base al Mastery:
    $$\text{easeFactor} = \max\left(1.3, 2.5 - (100 - \text{Mastery}) \times 0.02\right)$$
    Posteriormente se determina el nuevo intervalo multiplicándolo por el factor de facilidad:
    $$\text{intervalDays} = \text{round}(\text{intervaloPrevio} \times \text{easeFactor})$$
*   El intervalo está acotado a un límite superior de 60 días para asegurar que el contenido no quede en el olvido del alumno.

#### Priorización de Repaso (Urgency Level)
El campo `urgencyLevel` se actualiza para guiar al estudiante sobre qué actividades son críticas:
*   `0` (Inactiva): La fecha de repaso se encuentra planificada a futuro.
*   `1` (Baja): La sesión vencerá en menos de 24 horas.
*   `2` (Media): La sesión venció recientemente (entre 1 y 3 días atrás).
*   `3` (Crítica): La sesión tiene más de 3 días de retraso.

---

## 4. Integración y Retroalimentación de los Componentes Adaptativos

El flujo adaptativo completo funciona de manera cíclica interactuando dinámicamente entre sí:

```mermaid
graph TD
    S[Submission GRADED] --> |evento| LP[LearningProgressService]
    S --> |evento| RS[ReviewScheduleService]

    LP --> |calcula| M[mastery: 0-100]
    RS --> |lee mastery| SM2[calculateNextReview]
    SM2 --> |genera| NRD[nextReviewDate]

    M --> |alimenta| TC[TutorContextService]
    TC --> |clasifica nivel| L{PRINCIPIANTE / INTERMEDIO / AVANZADO}
    L --> |inyecta en| SP[System Prompt del LLM]

    AL[ActivityLog] --> |historial reciente| TC
    SP --> |guía respuesta| TutorIA[Tutor IA]

    M --> |si mastery >= 60| UB[Desbloqueo de siguiente LU]
    NRD --> |recordatorio en UI| REP[Sesión de Repaso]
    REP --> |nueva submission| S
```

---

## 5. Deuda Técnica y Limitaciones Identificadas en los Motores

Para llevar el sistema a un nivel productivo de escala Enterprise, se deben solventar los siguientes puntos identificados en los motores actuales:

1.  **Activación del LLM en Tutor IA:** Reemplazar el método mockeado de inferencia por una llamada asíncrona real y control de rate limits de la API externa de IA.
2.  **Persistencia del `easeFactor`:** Actualmente, el factor SM-2 se calcula en memoria en base al Mastery. Se requiere persistir este campo en la base de datos para no perder el histórico del ritmo de aprendizaje específico del estudiante si cambia su nivel de Mastery abruptamente.
3.  **Cómputo en background de `urgencyLevel`:** El cálculo del nivel de urgencia sólo se ejecuta cuando ocurre un evento `submission.graded`. Se debe implementar un script de cron nocturno (`@Cron` de NestJS) para recorrer las tablas de repasos programados y subir la prioridad de urgencia según el paso del tiempo.
4.  **Integración del `ActivityLog` en el Tutor:** El Tutor IA debe leer las acciones pedagógicas previas del alumno (ej: "ha fallado 3 veces el reto de Python", "acaba de leer la teoría") para contextualizar mejor el prompt conversacional.
5.  **Grafo de Prerrequisitos:** Integrar el middleware de validación a nivel de servicios y endpoints para restringir físicamente la descarga de contenidos de una Unidad si sus prerrequisitos no han sido completados en un 100%.
