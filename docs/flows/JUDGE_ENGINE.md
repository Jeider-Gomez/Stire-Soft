# Flujo del Motor de Ejecución (Judge Engine)

El "Judge Engine" evalúa código fuente de forma segura, evitando RCE (Remote Code Execution) y DoS (Denial of Service) en la plataforma STIRE.

## 1. Arquitectura Base
- **Delegación:** Cuando el `EvaluationEngine` detecta una pregunta tipo `CODING`, retorna `needsAsyncJudge: true` al servicio de submissions.
- **Encolamiento:** El sistema inyecta un payload en una cola de Redis (`bullmq`). Payload incluye: `code`, `language`, y `testCases`.
- **Desacoplamiento:** NestJS actúa como productor. Los Workers de BullMQ actúan como consumidores (pueden vivir en instancias de servidor separadas).

## 2. Ciclo de Ejecución en Sandbox
1. El `JudgeWorker` extrae un trabajo de la cola.
2. Itera sobre los `coding_test_cases` (públicos y ocultos) asociados a la pregunta.
3. Invoca a `DockerSandboxService`.
4. Instancia un contenedor efímero (`docker run --rm --memory=128m --cpus=0.5`).
5. El código se inyecta y ejecuta contra el caso de prueba.
6. Se captura el `stdout`, `stderr` y métricas.
7. El contenedor se destruye automáticamente.

## 3. Persistencia y Streaming
- Se graba un `ExecutionResult` en la base de datos por cada caso de prueba evaluado, almacenando el `status` (`accepted`, `wrong_answer`, `time_limit`, `memory_limit`, etc.).
- Si el código no compila, se corta la ejecución temprana (early exit).
- A medida que se resuelven los test cases, se emite el estado a través del WebSocket Gateway, permitiendo que la UI muestre animaciones en tiempo real de "Test pasados" al estilo LeetCode.
