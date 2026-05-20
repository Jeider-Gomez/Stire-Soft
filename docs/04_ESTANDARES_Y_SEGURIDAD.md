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
> **REGLA DE INYECCIÓN:** Está terminantemente prohibido inyectar `Repository<Entity>` de TypeORM de manera directa en los constructores de los servicios. Toda interacción con la base de datos debe ser encapsulada en una clase Repositorio Personalizada (ej: `ActivitiesRepository`) que extienda o envuelva las operaciones del ORM, con el fin de centralizar los QueryBuilders, queries nativas y optimizaciones de índices.

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

### 2.1 Control de Acceso Granular (RBAC + CBAC)
*   El sistema implementa un modelo híbrido basado en Roles (Role-Based Access Control) y Permisos (Claim-Based Access Control).
*   Los controladores deben decorarse con la combinación de `@Roles('docente')` y decoradores específicos de políticas o permisos `@RequirePermissions('create:activity')`.
*   El `PermissionsGuard` y `JwtAuthGuard` inyectados a nivel global leen e interceptan los tokens JWT en las cabeceras HTTP, validan la expiración del payload firmado con algoritmo simétrico HMAC-SHA256 y descartan peticiones no autorizadas retornando un `403 Forbidden` inmediato.

### 2.2 Prevención de Inyección SQL y XSS
*   **Inyección SQL:** TypeORM previene inyecciones SQL nativas al parametrizar todas las consultas enviadas al motor MySQL a través del gestor de parámetros de consultas preparadas. Se debe evitar concatenar cadenas crudas dentro de las cláusulas `.where()` o queries nativas `.query()`.
*   **Payload Sanitization:** El parser global de validación corre con el parámetro `whitelist: true`, descartando y purgando de memoria cualquier propiedad excedente enviada en los cuerpos JSON que no se encuentre expresamente tipada en la clase DTO asociada.

### 2.3 Rate Limiting Dinámico (ThrottlerModule)
El sistema resguarda los endpoints sensibles mediante políticas restrictivas de re-intentos utilizando el token bucket de `ThrottlerModule`:

| Grupo de Endpoints | Límite Máximo | Ventana Temporal | Propósito de Seguridad |
|---|---|---|---|
| `POST /auth/login` | 5 peticiones | 1 minuto | Prevención de fuerza bruta contra contraseñas |
| `POST /tutor/chat` | 20 peticiones | 1 minuto | Control del costo de tokens financieros de APIs LLM |
| `POST /submissions/:id/submit` | 10 peticiones | 1 minuto | Mitigación de abusos en colas de Docker Sandbox |

### 2.4 Medidas de Seguridad en el Sandbox del Juez de Código
El microservicio de evaluación asíncrona de código fuente implementa un aislamiento estricto para mitigar ataques de ejecución remota de comandos (RCE), bombas de bifurcación (fork bombs), desbordamientos de memoria RAM y accesos de red no permitidos:

```
                      +---------------------------------------+
                      |             Servidor Host             |
                      |                                       |
                      |   +-------------------------------+   |
                      |   |      Contenedor Docker        |   |
                      |   |                               |   |
                      |   |  - Sin red (--network none)   |   |
                      |   |  - Memoria max 128MB          |   |
                      |   |  - CPU max 0.5 cores          |   |
                      |   |  - Ciclo de vida efímero      |   |
                      |   |  - Timeout forzado de proceso |   |
                      |   +-------------------------------+   |
                      +---------------------------------------+
```

*   **Red Cero:** Se aplica la configuración `--network none` en la instanciación de Docker, inhabilitando las conexiones salientes y entrantes del código evaluado para impedir ataques de exfiltración de credenciales.
*   **Límites de Recursos:** Cada ejecución está forzada a consumir como máximo `128MB` de memoria RAM (`--memory=128m`) y `0.5` cores de CPU (`--cpus=0.5`), neutralizando leaks e inyecciones diseñadas para degradar el host.
*   **Timeout de Ciclo de Vida:** El `JudgeWorker` vigila activamente el ciclo del contenedor. Si un script Python o JavaScript entra en un bucle infinito, un timer de seguridad asíncrono fuerza la finalización del proceso (`docker kill`) después de transcurrido el tiempo configurado para el reactivo.

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
