# STIRE — 04. Estándares de Desarrollo, Seguridad y Escalabilidad
**Directrices Técnicas de Código Limpio, Seguridad en Sandbox y Estrategia de Crecimiento para Escala Enterprise**

---

## 1. Convenciones de Desarrollo Backend (NestJS + TypeORM)

Para mantener la base de código coherente y mantenible, todos los desarrolladores deben adherirse a las siguientes directrices estructurales y de nomenclatura.

### 1.1 Estructura Obligatoria de Módulo
Cada Bounded Context o módulo nuevo que se integre al sistema debe contar con la siguiente estructura física interna:
```
src/nombre-modulo/
├── dto/
│   ├── create-nombre-modulo.dto.ts
│   └── update-nombre-modulo.dto.ts
├── entities/
│   └── nombre-modulo.entity.ts
├── nombre-modulo.controller.ts
├── nombre-modulo.module.ts
├── nombre-modulo.service.ts
└── nombre-modulo.repository.ts (custom repository)
```
> **REGLA DE INYECCIÓN (redactada de nuevo al cierre de Ola 2 — decisión explícita del dueño del proyecto, no una relajación silenciosa):** un Repositorio Personalizado (ej. `ActivitiesRepository`) es obligatorio solo donde hay complejidad real de consulta — `QueryBuilder`, agregaciones, optimización de índices. Para CRUD simple (buscar por id, guardar, actualizar un campo) se permite inyectar `Repository<Entity>` de TypeORM directamente en el constructor del servicio.
>
> **Motivo del cambio:** la redacción anterior ("terminantemente prohibido... siempre") no describía el código real — `AuthorizationService` ya inyectaba `Repository<Class>`/`Repository<Enrollment>` directo desde la Ola 1, y la propagación de ownership de la Ola 2 (`learning-unit`, `content`, `activity-questions`, `activities.create`) hizo lo mismo por necesidad (resolver una cadena de relaciones vía `.findOne({ relations: [...] })`, sin ningún `QueryBuilder` de por medio). Una regla documentada que el proyecto entero incumple no protege nada — hace mentir a la documentación. Se prefiere una regla que describa la práctica real y sea exigible, a una aspiracional que nadie sigue.

### 1.2 Convenciones de Nombres (Naming Conventions)
*   **Archivos Físicos:** `kebab-case` (ej. `learning-progress.service.ts`, `spaced-repetition.utils.ts`).
*   **Clases y Decoradores:** `PascalCase` (ej. `LearningProgressService`, `RolesGuard`).
*   **Campos y Métodos:** `camelCase` (ej. `recalculateMastery`, `attemptsCount`).
*   **Tablas SQL y Columnas:** `snake_case` pluralizado para las tablas y singularizado para las columnas (ej. tabla `activity_questions`, columna `activity_id`).

### 1.3 Validación de Datos (DTOs)
*   Toda solicitud que suponga una mutación del estado (`POST`, `PUT`, `PATCH`) debe tiparse con una clase DTO validada mediante el `ValidationPipe` de NestJS.
*   Se deben emplear los decoradores de `class-validator` y `class-transformer` de forma estricta. Para objetos complejos y configuraciones dinámicas JSON se exige el uso de `@ValidateNested()` junto con `@Type()` para asegurar la sanidad del payload recibido.
*   Cada campo expuesto en los DTOs debe documentarse mediante `@ApiProperty()` de OpenAPI/Swagger para mantener la documentación interactiva en tiempo real.

### 1.4 Manejo de Errores y Excepciones
*   El código de negocio no debe retornar respuestas HTTP directas ni strings crudos de error.
*   Se deben usar exclusivamente excepciones HTTP nativas de NestJS (ej. `NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`).
*   Bajo ninguna circunstancia se debe propagar un stack trace interno al cliente. El filtro global `GlobalExceptionFilter` interceptará los errores no controlados, los registrará en los archivos de logs locales y servirá una respuesta HTTP 500 genérica sanitizada para prevenir la fuga de información (Information Disclosure).

---

## 2. Directrices de Seguridad (Security Guidelines)

STIRE está diseñado para aislar los recursos académicos y proteger al servidor host de comportamientos fraudulentos o maliciosos de usuarios malintencionados.

### 2.1 Control de Acceso Real (RBAC por rol + verificación de propiedad)

> **Corrección (Ola 1, post-auditoría):** esta sección afirmaba un modelo `PermissionsGuard` + `@RequirePermissions()` global que **nunca estuvo registrado** (hallazgo de la auditoría técnica: `PermissionsGuard` existe como archivo pero no es un `APP_GUARD`). El modelo real es el descrito abajo.

*   **Autenticación global:** `JwtAuthGuard` y `RolesGuard` están registrados como `APP_GUARD` en `app.module.ts` — todo endpoint exige JWT válido salvo `@Public()`. `RolesGuard` lee el metadato `@Roles(...)` del handler; si un endpoint no lo declara, cualquier rol autenticado pasa (esto fue precisamente el vector de varios hallazgos P0/P1 cerrados en la Ola 1 — un endpoint mutante sin `@Roles` no está protegido por rol en absoluto).
*   **Test de arquitectura (Ola 2, extendido en Ola 3):** `src/common/authorization/route-role-metadata.spec.ts` recorre por filesystem TODOS los `*.controller.ts` y falla si una ruta mutante (POST/PUT/PATCH/DELETE) **o de lectura (GET, desde Ola 3)** no declara `@Roles` ni `@Public()`, con listas explícitas de excepciones justificadas — las de lectura exigen además un `testFile` que exista de verdad y pruebe el acotamiento (`JUSTIFIED_GET_EXCEPTIONS`). Las excepciones se comparan por **referencia a la clase real del controller**, no por su nombre en string (Ola 3, P1-R3 de `docs/REAUDITORIA_OLA2.md`): la comparación por string permitía que un controller nuevo con el mismo nombre de clase y de método que una excepción ya aceptada heredara su pase libre sin verificación real — demostrado con un PoC ejecutado, cerrado con esta comparación por identidad de objeto. El objetivo es que un endpoint nuevo sin protección no dependa de que alguien se acuerde de revisarlo — CI lo bloquea.
*   **Verificación de propiedad (`AuthorizationService`):** tener el rol correcto no basta para mutar (ni, desde Ola 3, leer) un recurso ajeno. `src/common/authorization/authorization.service.ts` expone tres primitivas reutilizables:
    *   `assertTeacherOwnsClass(user, classId)` — admin siempre pasa; un docente debe ser el `teacherId` real de la clase. Se usa en las mutaciones de `/activities`, `/class`, `/sections`, `/topic`, `/learning-unit`, `/content`, `/activity-questions` (Ola 1/2), y desde Ola 3 también en las **lecturas** de `/activities` (`findAll`) y `/content` (`findByUnit`/`findByUnitAll`/`findOne`) y en `activity-questions.findByActivity` — cerrando P0-R1, P0-R2 y P1-R2 de `docs/REAUDITORIA_OLA2.md`.
    *   `assertEnrolledInClass(user, classId)` — un estudiante debe tener una matrícula `active` en la clase para ver contenido de esa clase, y una actividad/bloque de contenido no publicado/visible nunca es visible para un estudiante aunque esté matriculado (se responde 404, no 403 — no existe todavía desde su perspectiva).
    *   `assertTeacherSharesClassWithStudent(user, studentId)` (nuevo en Ola 3, P1-R5) — un docente debe compartir al menos una clase activa con el estudiante objetivo antes de ver su progreso/analítica. Cierra un patrón señalado desde la reauditoría de cierre de Ola 1 (`analytics.getStudentDashboard`, `learning-progress.findByStudent(AndUnit)`) y nunca corregido hasta ahora.
    *   Los tres métodos lanzan `ForbiddenException`/`NotFoundException` — nunca devuelven un booleano que el llamador pueda ignorar por error.
    *   **Corrección de un caso roto (Ola 2):** `TopicService.create()` comparaba contra `section.class`, una relación que `SectionService.findOne()` nunca carga — la comparación era siempre `undefined !== teacherId`, siempre verdadera, así que la verificación nunca podía fallar. Corregido resolviendo `section.classId` (columna directa) y delegando en `assertTeacherOwnsClass`. Test de regresión: `src/topic/topic.service.spec.ts`.
*   **Auto-edición vs. administración de terceros:** `PATCH /users/me` (DTO `UpdateProfileDto`, solo campos no sensibles) está separado de `PATCH /users/:id` (DTO `AdminUpdateUserDto`, exclusivo de `@Roles('admin')`). Antes de esta separación, un único DTO heredado por `PartialType` exponía `role`/`isActive` también en la ruta de auto-edición — la causa raíz de un hallazgo P0 de escalada de privilegios.

### 2.2 Prevención de Inyección SQL y XSS
*   **Inyección SQL:** TypeORM previene inyecciones SQL nativas al parametrizar todas las consultas enviadas al motor MySQL a través del gestor de parámetros de consultas preparadas. Se debe evitar concatenar cadenas crudas dentro de las cláusulas `.where()` o queries nativas `.query()`.
*   **Payload Sanitization:** El parser global de validación corre con el parámetro `whitelist: true`, descartando y purgando de memoria cualquier propiedad excedente enviada en los cuerpos JSON que no se encuentre expresamente tipada en la clase DTO asociada.
*   **XSS almacenado (ADR 07, implementado en Ola 2):** `ContentRenderingService` sanea con **DOMPurify + JSDOM** en dos perfiles según quién escribe:
    *   `RICH` (autoría docente): `content.body`, `activity.description`, `activity_question.question`. Lista blanca generosa (encabezados, listas, tablas, imágenes, enlaces, `pre`/`code`) y `iframe` **solo** contra hosts embebibles permitidos (YouTube, Vimeo) — cualquier otro host se elimina del árbol.
    *   `PLAIN` (estudiante o IA): `submission_answer.feedback`, `tutor_conversation.content`. Sin HTML — ninguna etiqueta sobrevive, ni siquiera su contenido para `<script>`/`<style>`.
    *   Dos capas: al **escribir** (`sanitizeRichText`/`escapePlainText`, conserva el Markdown fuente y quita HTML peligroso ya incrustado) y al **renderizar** (`renderMarkdownToHtml`, único camino hacia HTML — atrapa vectores que nacen de la propia sintaxis Markdown, como `[texto](javascript:alert(1))`, invisibles en la capa de escritura porque ahí son texto plano).
    *   `src/content-rendering/__tests__/content-rendering.service.no-mock.spec.ts` prueba contra DOMPurify real (sin mocks): `<script>`, `onerror=`, enlace `javascript:`, `iframe` de host no permitido, y dos casos positivos (tabla y bloque de código sobreviven intactos; `iframe` de host permitido sobrevive).

### 2.3 Rate Limiting Dinámico (ThrottlerModule)
El sistema resguarda los endpoints sensibles mediante políticas restrictivas de re-intentos utilizando el token bucket de `ThrottlerModule`:

| Grupo de Endpoints | Límite Máximo | Ventana Temporal | Propósito de Seguridad |
|---|---|---|---|
| `POST /auth/login` | 5 peticiones | 1 minuto | Prevención de fuerza bruta contra contraseñas |
| `POST /tutor/chat` | 20 peticiones | 1 minuto | Control del costo de tokens financieros de APIs LLM |
| `POST /submissions/:id/submit` | 10 peticiones | 1 minuto | Mitigación de abusos en colas de Docker Sandbox |

### 2.4 Medidas de Seguridad en el Sandbox del Juez de Código

> **Corrección (Ola 1, post-auditoría):** esta sección describía un aislamiento por contenedor Docker que **no existía en el código** — el adaptador Docker era un *mock* que aprobaba cualquier envío conteniendo la palabra `"correct"` (hallazgo P0-05), y el adaptador activo por defecto usaba `node:vm`, con un escape de sandbox confirmado y reproducido en vivo (lectura de `process.env` y ejecución de comandos del sistema operativo, hallazgo P0-01). El modelo real, implementado y probado con los payloads de ataque del propio informe de auditoría, es el siguiente.

`HardenedProcessSandboxAdapter` aísla por **proceso hijo del sistema operativo**, no por contexto de JavaScript ni por contenedor — sin depender de infraestructura Docker:

```
                      +----------------------------------------------+
                      |                Servidor Host                 |
                      |                                                |
                      |   +----------------------------------------+ |
                      |   |     Proceso hijo (child_process.spawn)  | |
                      |   |                                          | |
                      |   |  - Entorno minimo (sin JWT_SECRET,       | |
                      |   |    DB_PASSWORD, TUTOR_KEY_ENCRYPTION_SECRET)          | |
                      |   |  - --permission (sin fs-write,           | |
                      |   |    child-process, worker)                | |
                      |   |  - --disallow-code-generation-from-strings| |
                      |   |  - Cortafuegos de red en el preludio     | |
                      |   |  - --max-old-space-size=128 (heap)       | |
                      |   |  - Timeout 2000ms -> SIGKILL             | |
                      |   +----------------------------------------+ |
                      +----------------------------------------------+
```

*   **Entorno mínimo declarado a mano:** el proceso hijo no hereda las variables de entorno del proceso padre. En Windows, `libuv` inyecta a la fuerza ciertas variables del sistema (`HOMEDRIVE`, `PATH`, `LOGONSERVER`, etc.) si no se declaran explícitamente — se declaran neutralizadas para que no filtren el nombre de host ni rutas de usuario.
*   **Modelo de permisos de Node (`--permission`):** sin `--allow-fs-write`, `--allow-child-process`, `--allow-worker`, `--allow-addons` — bloquea escritura en disco, ejecución de comandos anidados, hilos y bindings nativos.
*   **Sin generación de código desde strings:** `--disallow-code-generation-from-strings` bloquea específicamente el vector de escape confirmado en el informe (`this.constructor.constructor('return process')()` y variantes equivalentes).
*   **Cortafuegos de red en el preludio:** un script `--require` cargado antes del código del estudiante reemplaza `net.connect`, `http.request`, `https.request`, `fetch`, y todas las funciones de resolución DNS por funciones que lanzan `SandboxViolation` — bloquea exfiltración y SSRF contra servicios internos (MySQL, la propia API). **Corrección (Ola 2):** el parche original solo cubría `dns.lookup`/`resolve`/`resolve4`/`resolve6`. `dns.promises` y `dns.Resolver` son superficies DISTINTAS que evadían el cortafuegos — suficiente para exfiltrar datos codificados en el propio nombre de host consultado, sin necesitar que la resolución llegara a completarse. Ahora se cubren también `dns.promises.*`, `dns.Resolver.prototype` y `dns.promises.Resolver.prototype`. **Corrección (Ola 3, P2-R1):** todo lo anterior bloquea el lado que INICIA una conexión saliente; un socket de ESCUCHA (`net.createServer(...).listen()`) nunca pasaba por ninguna de esas funciones — verificado con una reproducción aislada directa (`net.connect` lanzaba `SandboxViolation`; `net.createServer().listen()` escuchaba sin error). Ahora `net.createServer`, `http.createServer`, `https.createServer` y `http2.createServer`/`createSecureServer` también lanzan `SandboxViolation`; `dgram.createSocket` ya bloqueaba UDP por completo (envío y recepción) desde antes.
*   **Límites de recurso:** `--max-old-space-size=128` acota la memoria del heap V8; un timeout de 2000ms fuerza `SIGKILL` sobre el proceso completo si no termina a tiempo; un tope de bytes de salida corta bombas de `stdout`/`stderr`.
*   **Riesgo residual documentado, no oculto:** no hay cuota estricta de CPU (solo el timeout de reloj), y el bloqueo de red opera en el propio proceso, no a nivel de kernel — mitigación: mantener baja la concurrencia del worker y el timeout corto. Solo JavaScript está soportado; otros lenguajes devuelven `runtime_error` explícito, nunca se aprueban por defecto.
*   **Verificado con los 10 vectores del informe de auditoría** (incluido un test de canario que prueba, con un secreto real inyectado en el proceso padre, que jamás aparece en la salida del hijo) más los 4 vectores de exfiltración DNS de la Ola 2 — ver `src/judge-engine/hardened-process-sandbox.adapter.spec.ts`.

---

## 3. Plan de Escalabilidad Enterprise (1,000+ Estudiantes Concurrentes)

STIRE está diseñado para soportar picos de alta concurrencia (como sesiones de exámenes simultáneas) sin degradar la experiencia de usuario y minimizando el consumo de base de datos.

### 3.1 Desacoplamiento por Cola Asíncrona (Microservicios)
*   Al separar la recepción HTTP del flujo de evaluación computacional pesado mediante BullMQ y Redis, la API no consume hilos del pool de Node para la compilación de código.
*   Técnicamente, el productor (NestJS REST API) y los consumidores (BullMQ Workers) pueden compilarse por separado y ejecutarse en servidores de hardware independientes. Esto permite escalar horizontalmente agregando servidores de ejecución de Docker (Workers) según la demanda analítica, sin afectar la disponibilidad del portal del estudiante.

```
+------------+       +-----------+       +-------------+
| NestJS API | ----> |   Redis   | ----> | JudgeWorker | ---> Docker Sandbox
| (Petición) |       |  BullMQ   |       | (Servidor B)|
+------------+       +-----------+       +-------------+
```

### 3.2 Desacoplamiento Analítico de Lectura/Escritura (Capa Eventos)
*   El cálculo del Mastery y agendamiento de repeticiones SM-2 ocurre de forma asíncrona reaccionando al evento `submission.graded` provisto por `EventEmitter2`.
*   Esto asegura que el hilo del Request del envío termine de forma exitosa y guarde la calificación en milisegundos, liberando el socket y delegando los JOINs e inserciones analíticas complejas a listeners que se ejecutan en background.

### 3.3 Estrategia de Caching Reactivo y Proactivo
*   **Lectura Teórica y Catálogos:** Endpoints como `GET /content` y `GET /class` son interceptados mediante el cacheo en memoria de Redis con TTL de 5 minutos, reduciendo la carga de lectura de base de datos MySQL en un 80% para estudiantes concurrentes consumiendo teoría.
*   **Dashboard y Mastery:** El tablero del estudiante (`GET /analytics/student/:id`) debe migrarse hacia un modelo cacheado con expiración reactiva. En lugar de ejecutar sumas y filtros de base de datos en cada refresco de pantalla, se consulta la clave `student:mastery:id` en Redis, invalidándola y recalculándola únicamente cuando el listener asíncrono de `submission.graded` complete una actualización real en base de datos.

### 3.4 Particionamiento de Datos (Estrategia de Crecimiento SQL)
Ante el crecimiento de la plataforma, el volumen de datos de las tablas `submission_answers` y `execution_results` aumentará de manera exponencial.
*   Se propone implementar **Particionamiento Horizontal de Tablas** (Partitioning) a nivel MySQL/MariaDB basándose en rangos de fechas (ej: crear particiones mensuales o semestrales).
*   Esto garantiza que los índices de tipo B-Tree se mantengan en un tamaño óptimo para almacenamiento en memoria RAM, evitando escaneos secuenciales lentos y manteniendo las búsquedas de historial en un coste algorítmico constante $O(\log N)$.
*   **Archivado de Históricos:** Mapear tareas cron automáticas que muevan registros de auditorías como `activity_logs` con más de 1 año de antigüedad hacia almacenamiento de bajo costo (como buckets S3 fríos), para mantener la base de datos de producción ágil y optimizada.
