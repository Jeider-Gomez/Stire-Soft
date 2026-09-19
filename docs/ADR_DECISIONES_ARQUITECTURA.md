# STIRE — ADR 06, ADR 07 y ADR 08

**Decisiones de arquitectura del sandbox de ejecución, la sanitización de contenido y la cola
de calificación.**

> **Nota de publicación (Reorganización Documental):** este documento reemplaza a
> `ADR-06-07_SANDBOX_SIN_DOCKER_Y_CONTENIDO.md`, que permaneció fuera del repositorio público
> (gitignorado) mientras contuvo el catálogo completo de payloads de ataque probados contra el
> sandbox y un fragmento de código de referencia que ya quedó desactualizado (no reflejaba las
> correcciones de Ola 2/Ola 3 al cortafuegos de red). Esta versión conserva la decisión de
> arquitectura, la comparativa de opciones evaluadas y los riesgos residuales — que es lo que un
> ADR necesita mostrar — sin los payloads de ataque literales ni el código obsoleto. El detalle
> completo de los vectores de ataque probados y el historial de hallazgos vive en los documentos
> de auditoría (`docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md`, `docs/REAUDITORIA_CIERRE_OLA1.md`,
> `docs/REAUDITORIA_OLA2.md`), que permanecen gitignorados por la misma política de no publicar
> detalle de vulnerabilidades mientras el repositorio sea público.

---

# ADR 06 — Aislamiento de ejecución de código sin Docker

## Contexto y restricción

El sistema necesita ejecutar código no confiable de estudiantes. Los adaptadores explorados antes de esta decisión eran inviables:

- Aislar por contexto de JavaScript (`node:vm`) aísla *scope*, no *proceso*; nunca fue una frontera de seguridad real frente a código adversarial.
- Un adaptador Docker no es viable si la infraestructura Docker no está disponible en el entorno de despliegue.

Requisito del dueño del producto: **el sandbox debe funcionar y poder demostrarse**, sin depender de Docker.

## Decisión

Se introduce `HardenedProcessSandboxAdapter`, que pasa a ser el valor por defecto de `SANDBOX_TYPE`.

Aísla mediante **proceso hijo del sistema operativo**, no mediante contexto de JavaScript. Cuatro barreras independientes:

| Barrera | Mecanismo | Neutraliza |
|---|---|---|
| Entorno vacío | `spawn(..., { env: {} })` | Robo de secretos del proceso servidor (`JWT_SECRET`, credenciales de base de datos, claves de API) — no hay nada que robar en ese proceso |
| Modelo de permisos de Node | `--permission` sin `--allow-fs-write`, `--allow-child-process`, `--allow-worker`, `--allow-addons` | Lectura/escritura de disco, ejecución de comandos del sistema, hilos y bindings nativos |
| Sin generación de código | `--disallow-code-generation-from-strings` | Escape de contexto vía construcción dinámica de funciones |
| Cortafuegos de red en preludio | Script `--require` que anula las vías de conexión saliente y, desde Ola 3, también las de escucha entrante | Exfiltración y SSRF contra servicios internos (base de datos, la propia API) |

Más los límites de recurso: límite de memoria del heap V8, watchdog con `SIGKILL` por timeout, y tope de bytes de salida.

## Comparativa de opciones evaluadas

| Opción | Pros | Contras | Esfuerzo |
|---|---|---|---|
| **A. Proceso hijo endurecido** ✅ elegida | Cero infraestructura externa; funciona en cualquier sistema operativo; aislamiento a nivel de SO; los estudiantes conservan la autocalificación | Solo JavaScript; sin cuota estricta de CPU (solo timeout); el cortafuegos de red es defensa en profundidad, no del kernel | Bajo |
| B. `node:vm` | Ya escrito | No es una frontera de seguridad real frente a código adversarial | — |
| C. `isolated-vm` | Aislamiento V8 real con cuota de memoria nativa | Módulo nativo: exige toolchain de compilación C++; compatibilidad con versiones recientes de Node no garantizada; sigue siendo un solo proceso | Medio-Alto |
| D. Docker / gVisor | Estándar de la industria; multi-lenguaje; cuotas de CPU/RAM/red del kernel | Requiere infraestructura que no siempre está disponible | Alto + infraestructura |

**Nota de trayectoria:** A y D no compiten, se encadenan. El Patrón Adaptador permite que el día que haya infraestructura Docker real, D entre detrás de la misma interfaz `SandboxAdapter.executeIsolated()` sin tocar el resto del pipeline de calificación. Esta decisión valida el patrón en lugar de contradecirlo.

## Riesgos residuales — documentados, no ocultos

1. **Sin cuota estricta de CPU.** Solo hay timeout de reloj. Un envío puede saturar un núcleo durante la ventana permitida. **Mitigación:** limitar la concurrencia de ejecución y mantener el timeout bajo.
2. **El bloqueo de red es en proceso, no del kernel.** El acceso a bindings internos de red está denegado por el modelo de permisos de Node, lo que cierra la vía conocida de acceso a sockets crudos, pero no puede afirmarse imposibilidad absoluta.
3. **Solo JavaScript.** Otros lenguajes exigen una infraestructura de ejecución distinta o un juez externo. Deben devolver un error explícito, nunca aprobarse por defecto.
4. **Higiene de temporales.** Cada ejecución escribe un archivo en el directorio temporal del sistema operativo; la limpieza va en el bloque `finally`, y debe existir además un barrido periódico.

## Implementación de referencia

`src/judge-engine/hardened-process-sandbox.adapter.ts` — código vigente, ver el archivo fuente para el mecanismo exacto (evoluciona con cada ola de remediación; este documento describe la decisión, no un snapshot del código).

Registro en `judge-engine.module.ts` — **fail-closed**: cualquier valor de `SANDBOX_TYPE` no reconocido, o los valores `docker`/`vm` (adaptadores descartados), abortan el arranque con una excepción explícita en vez de degradar silenciosamente a un adaptador inseguro.

---

# ADR 07 — Sanitización de contenido con máxima flexibilidad docente

## Contexto

El requisito es que los docentes creen sus cursos **como quieran**: tablas, imágenes, bloques de código, vídeo incrustado. Una sanitización agresiva mata esa flexibilidad; ninguna sanitización deja el sistema expuesto a XSS almacenado.

## Decisión: dos perfiles de confianza + saneamiento en dos capas

**Perfiles según quién escribe:**

| Perfil | Aplica a | Política |
|---|---|---|
| `RICH` | Contenido de autoría docente: `content.body`, `activity.description`, `activity_question.question` | Lista blanca **generosa**: encabezados, listas, tablas, `img`, `a`, `blockquote`, `pre`/`code` con `class` (resaltado de sintaxis), y `iframe` **solo** contra hosts permitidos (YouTube, Vimeo). Prohibidos `script`, `style`, atributos de evento (`on*`) y el esquema `javascript:` |
| `PLAIN` | Texto de estudiante o IA: `submission_answer.feedback`, `tutor_conversation.content` | Sin HTML. Se escapa todo. Un estudiante nunca necesita inyectar marcado |

**Dos capas, porque una no basta:**

1. **Al escribir** — sanea el `create`/`update` de cada servicio que persiste el campo. **Conserva el formato Markdown original**: no convierte a HTML, así que no hay migración de datos ni impacto en el frontend. Elimina el HTML peligroso ya incrustado en el texto fuente.
2. **Al renderizar** — único camino hacia HTML, con la configuración de lista blanca del perfil correspondiente. Esta capa es la que atrapa los vectores que nacen del propio Markdown (por ejemplo, un enlace con esquema `javascript:` en la sintaxis `[texto](...)`), invisibles para la capa de escritura porque ahí son simple texto.

Ninguna de las dos capas es redundante: cubren vectores distintos. Contrato de exposición de la capa de renderizado: `docs/CONTRATO_CONTENT_RENDERING.md`.

---

# ADR 08 — Redis opcional para el Judge Engine

## Decisión

Puerto `JudgeQueue` con dos implementaciones intercambiables: `InlineJudgeQueueAdapter` (por defecto, ejecuta la calificación en el mismo proceso vía `setImmediate`, sin necesidad de Redis) y `BullJudgeQueueAdapter` (cola real con BullMQ, cuando Redis está disponible). `BullModule` se registra condicionalmente según configuración.

## Justificación

El sistema debía poder arrancar y calificar código real sin depender de infraestructura Redis no disponible en todos los entornos de desarrollo o despliegue. El ciclo de dependencias entre el servicio de envíos y el servicio de ejecución del juez se rompe con eventos de dominio (`judge.answer-graded`/`judge.answer-failed`), no con una referencia circular forzada entre servicios.

## Consecuencia

El pipeline de calificación funciona de forma idéntica desde la perspectiva del resto del sistema, sin importar cuál de los dos adaptadores está activo — el mismo patrón de Puerto/Adaptador que ADR 06 aplica al sandbox de ejecución.

# ADR 09 — Arquitectura de despliegue: hosting del backend y continuidad del sandbox local

## Contexto

El diagnóstico de §4.7 (`docs/PLAN_MAESTRO.md`) ya había identificado que el frontend (Nuxt) puede vivir en Vercel sin problema, pero el backend no: `HardenedProcessSandboxAdapter` (ADR 06) spawnea procesos hijo reales del sistema operativo con `child_process.spawn`, y NestJS corre un proceso persistente (`app.listen()`), no handlers serverless. Ninguna función serverless típica (Vercel Functions incluidas) da permiso para spawnear procesos hijo arbitrarios ni garantiza que ese proceso siga vivo entre invocaciones — es una incompatibilidad estructural, no de configuración.

Faltaba decidir dos cosas concretas para poder ejecutar un despliegue real: dónde corre el backend, y si el sandbox de ejecución de código debía cambiar de arquitectura para encajar en esa decisión (por ejemplo, delegarlo a una API externa de terceros en vez de mantenerlo local).

## Decisión

1. **Frontend:** sin cambios — Nuxt sigue desplegado en Vercel.
2. **Backend + base de datos:** se despliegan en una plataforma que ofrezca proceso persistente real y permita `child_process.spawn` sin restricciones — no en una función serverless. Opción recomendada: Railway (soporta Node como servicio persistente, MySQL/MariaDB gestionado en la misma plataforma, y no impone las restricciones de sandboxing de FaaS sobre el proceso de la app). Alternativa sin costo si el equipo prefiere no pagar: una VM en la capa gratuita de algún proveedor cloud, corriendo el mismo `docker-compose.yml` que ya existe en el repo (MariaDB + Redis) más el proceso de NestJS — mismo resultado técnico, más trabajo operativo de configuración y mantenimiento.
3. **Sandbox de ejecución de código:** se mantiene `HardenedProcessSandboxAdapter` (child process local del propio backend) como única implementación de `SandboxAdapter`. No se sustituye por una API externa de ejecución de código de terceros (tipo Judge0 o Piston).
4. **Cola de calificación (Redis/BullMQ):** no se activa en producción. `InlineJudgeQueueAdapter` (ADR 08) sigue siendo el adaptador por defecto — el sistema no depende de Redis para funcionar.

## Justificación

El punto 2 es la única incompatibilidad real con Vercel para el backend, y una plataforma con proceso persistente la resuelve directamente sin tocar código de aplicación.

El punto 3 se decide explícitamente en contra de una API externa de ejecución de código porque el sandbox actual ya pasó varias rondas de auditoría real (el escape de `node:vm` que motivó ADR 06 en primer lugar, más los hallazgos P2-R1 de la Reauditoría de Ola 2 sobre sockets de escucha, y el endurecimiento de `dns`/`dns.promises`) — es un componente propio, ya auditado, con un modelo de amenazas conocido. Moverlo a un servicio de terceros para resolver un problema de *hosting* (no de seguridad del sandbox en sí) cambiaría ese modelo de confianza por uno externo sin auditar, agregaría latencia de red y una dependencia de disponibilidad/costo por ejecución, sin resolver ningún bloqueo real de despliegue — la plataforma elegida en el punto 2 ya permite que el sandbox actual corra tal cual está.

El soporte a lenguajes distintos de JavaScript (`docs/00_VISION_FUNCIONAL.md` §9.1 punto 4) sigue siendo una decisión aparte y sin alcance definido (`docs/PLAN_MAESTRO.md` §6.4) — no se resuelve con esta ADR. Si en el futuro el equipo decide soportar más lenguajes, ahí sí una API externa tipo Judge0 (que ya trae decenas de lenguajes sandboxeados) sería la opción más rápida frente a escribir y auditar un adaptador propio por cada lenguaje nuevo — pero es una decisión de alcance de producto, no la que resuelve esta ADR.

## Consecuencia

El despliegue real deja de estar bloqueado solo por la autorización OAuth de un conector de Vercel — esa autorización ahora solo aplica al frontend. La ejecución concreta (crear la cuenta, configurar variables de entorno, desplegar y verificar contra `npm run verify:clean` equivalente en el entorno real) queda como tarea de esta semana (`S06-J03`, ver `MONITOREO_SEMANAL.md`). Las condiciones de precio/capa gratuita de cualquier proveedor cambian con frecuencia — se verifican al momento de crear la cuenta, no se asumen fijas por esta ADR.
