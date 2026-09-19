# STIRE — ADR 06 a ADR 11

**Decisiones de arquitectura del sandbox de ejecución, la sanitización de contenido, la cola
de calificación, el despliegue y el Tutor IA (clave por estudiante, configuración del docente y barrera anti-solución).**

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


# ADR 10 — El Tutor IA usa la clave gratuita de Google AI Studio de cada estudiante

## Contexto

El Tutor funcionaba con una clave global del servidor (`OPENAI_API_KEY`, que en la práctica era una clave de Gemini) y, si el LLM fallaba o no había clave, respondía en silencio con un texto pre-armado (`mockLlmInference`) sin que el estudiante lo supiera. Eso tenía tres problemas: el costo y la cuota de todos los estudiantes recaían en una sola clave (no escala gratis), el estudiante podía recibir una respuesta inventada creyendo que era del Tutor, y había dos proveedores (OpenAI y Gemini) para mantener.

`docs/modesec/insumos/08_TUTOR_IA.md` §5 ya había descrito este camino como "Modo B — BYOK seguro", propuesto y sin implementar, y `13_BACKLOG_FUNCIONAL.md` lo dejaba en "Nivel Futuro".

## Decisión (dueño del proyecto, 2026-09-19)

1. **Un solo proveedor: Google Gemini.** Se retira OpenAI del Tutor.
2. **Cada estudiante aporta su propia clave gratuita de Google AI Studio.** No hay clave global del servidor. Se pide en el registro (después de la contraseña, con opción de omitir) y, si el estudiante la omitió y quiere usar el Tutor, se le pide en ese momento con los pasos para conseguirla.
3. **Sin clave propia, el Tutor no responde:** `428` pidiendo configurarla. Se elimina la respuesta simulada de reserva: el Tutor nunca hace pasar un texto pre-armado por una respuesta real.
4. **Los fallos de Google se traducen a un código con sentido:** `422` clave inválida o revocada, `429` cuota gratuita agotada, `503` servicio no disponible.

## Implementación (backend, 2026-09-19)

- Tabla `tutor_credentials` (migración `1789200000000-CreateTutorCredentials`): una fila por estudiante, clave cifrada con **AES-256-GCM** (IV aleatorio por cifrado) y solo los últimos 4 caracteres en claro para mostrarlos.
- Secreto de cifrado: `TUTOR_KEY_ENCRYPTION_SECRET` (64 caracteres hexadecimales). **Falla cerrado:** sin él no se guarda ni se lee ninguna clave. Es obligatorio en cualquier entorno donde se use el Tutor, incluido el despliegue de ADR 09.
- Al guardar una clave se **verifica contra Google** (`GET /v1beta/models`) antes de aceptarla; una clave válida con la cuota agotada (`429`) se acepta.
- La clave nunca se devuelve completa al cliente ni se escribe en logs, y viaja a Google en la cabecera `x-goog-api-key`, no en la URL (antes iba en la query string).
- Endpoints, solo rol estudiante y con límite de peticiones: `GET /tutor/api-key`, `PUT /tutor/api-key`, `DELETE /tutor/api-key`, `GET /tutor/history`.
- Correcciones que se hicieron en la misma pasada porque tocaban el mismo flujo: el mensaje nuevo ya no llega duplicado al LLM (el historial se lee antes de guardarlo); la sugerencia de ejercicio ya no confía en el `learningUnitId` del cliente (se comprueba matrícula con la misma regla de `GET /learning-unit/:id`); el mensaje del estudiante y la respuesta solo se guardan si Gemini respondió, así "Reintentar" no deja mensajes huérfanos.

## Consecuencias y riesgos declarados

- **Privacidad:** la capa gratuita de Google AI Studio puede usar el contenido enviado para mejorar sus productos (verificado en fuentes públicas el 2026-09-19; las condiciones cambian). La interfaz debe decírselo al estudiante antes de que pegue su clave, y el código del estudiante que viaja en el contexto del chat sale hacia Google bajo la cuenta del propio estudiante.
- **Cuota:** la capa gratuita está limitada por minuto y por día; con muchos estudiantes cada uno consume la suya, pero un estudiante activo puede toparse con `429`. La interfaz debe explicarlo, no mostrarlo como una falla del sistema.
- **Demos:** ya no hay Tutor "de fábrica" para una demostración; las cuentas de demo necesitan una clave configurada antes de presentar.
- **Pendiente de limpieza:** la dependencia `openai` sigue en `package.json` sin usarse. Quitarla modifica `package-lock.json`, así que debe hacerse al cierre de una ola, seguida de `npm run verify:clean` (regla de `CLAUDE.md`).
- **Interfaz:** registro con opción de omitir, panel de la clave en el chat, y estados de error — `docs/antigravity/PLAN_IMPLEMENTACION.md` §19.


# ADR 11 — Configuración del Tutor por el docente, nivel de ayuda automático y barrera anti-solución

## Contexto

Con el Tutor funcionando sobre la clave de cada estudiante (ADR 10) faltaban tres piezas de la visión (`docs/00_VISION_FUNCIONAL.md` §9.6): que el docente pueda decidir qué quiere lograr con el Tutor en cada parte de su curso, que la ayuda escale de forma progresiva según lo que le cuesta al estudiante (principio P03), y que la regla "nunca des la solución" no dependa solo de una instrucción en el prompt.

## Decisión (dueño del proyecto, 2026-09-19)

1. **Nivel de ayuda automático y visible.** El sistema, no el estudiante, decide cuánta ayuda da el Tutor con los intentos fallidos propios en la actividad: 0–1 → nivel 1 (pista conceptual), 2–3 → nivel 2 (pregunta guía), 4 o más → nivel 3 (localizar la falla, sin escribir la corrección). Se le indica al LLM en el prompt y se devuelve a la interfaz (`guidanceLevel`). Los umbrales son una propuesta inicial ajustable.
2. **Configuración por el docente en tres ámbitos** — clase, unidad y actividad — y el más específico manda, campo por campo (`null` = hereda): **activar o desactivar** el Tutor, **tope de ayuda** (nivel máximo, 1 a 3) y **estilo** entre cuatro opciones fijas (equilibrado, motivador, técnico, breve). **No hay texto libre**: un texto del docente inyectado al prompt sería una vía de inyección de prompt. El motivo de que sea por unidad y actividad y no solo por clase es que cada docente decide qué busca en cada unidad y cómo necesita que el estudiante desarrolle cada actividad; cada clase tiene sus propias unidades, así que la configuración de una nunca afecta a otra.
3. **Chat general (fuera de una unidad o actividad):** se aplica lo más estricto entre las clases activas del estudiante (desactivado si alguna lo desactivó a nivel de clase; el tope más bajo). Dentro de una unidad o actividad manda solo la configuración de su propia clase.
4. **Barrera anti-solución en código, sin llamadas extra al LLM** (para cuidar la cuota gratuita del estudiante). Solo actúa dentro de una actividad; fuera de ella el estudiante estudia teoría y recibe cualquier ejemplo. Un bloque de código se sustituye por un aviso únicamente si (a) es un volcado larguísimo (más de 20 líneas útiles) o (b) tiene la forma de la solución de un ejercicio de STIRE — un programa de 5 o más líneas que lee la entrada estándar **y** la imprime, que es la forma de todas las actividades de código — salvo que sea mayoritariamente el propio código del estudiante (se le está explicando lo suyo) o que el estudiante haya pegado código en su mensaje. Ejemplos cortos, fragmentos y explicaciones pasan sin problema. Esta redacción sale de la observación del dueño de que un tope fijo de pocas líneas bloquearía explicaciones legítimas de quien quiere aprender.

## Implementación (backend, 2026-09-19)

- Tabla `tutor_settings` (migración `1789300000000-CreateTutorSettings`, índice único por ámbito). Solo columnas cerradas: `enabled`, `maxGuideLevel`, `style` — el estilo se valida contra una lista fija y el tope contra 1–3.
- `GET/PUT /tutor/settings/:scopeType/:scopeId` (`class` | `unit` | `activity`), roles docente y administrador; el docente debe dictar la clase del ámbito (se resuelve actividad → unidad → clase en el servidor). Enviar `null` vuelve a heredar; si todo queda en `null` se borra la fila. La respuesta trae los valores propios y los efectivos.
- `POST /tutor/chat`: si el Tutor está desactivado responde `403` **antes** de pedir la clave o llamar a Google; `guidanceLevel` sale limitado por el tope del docente. `GET /tutor/guidance?activityId=N` devuelve `guidanceLevel`, `tutorEnabled` y `maxGuideLevel`.
- La unidad de una actividad la decide el servidor, no el cliente; si el estudiante no está matriculado en la clase de ese contexto, se ignora y se aplica el criterio del chat general.

## Consecuencias y riesgos declarados

- **La barrera es una heurística, no una garantía.** No detecta una solución dada en prosa, ni en un lenguaje o forma distintos a un programa de entrada y salida estándar, y puede omitir un ejemplo legítimo que se parezca a una solución (el aviso le indica al estudiante cómo pedir algo más corto). La instrucción del prompt sigue siendo la primera línea de defensa.
- **Los umbrales de nivel de ayuda (2 y 4 intentos fallidos) y los 20 renglones** se fijaron sin datos de uso real; conviene revisarlos con la primera prueba en clase.
- **Desactivar el Tutor a nivel de unidad no bloquea el chat general** mientras las demás clases del estudiante lo permitan (es lo esperado: el chat general no pertenece a una unidad).
- **Interfaz del docente y del estudiante:** `docs/antigravity/PLAN_IMPLEMENTACION.md` §18.4 y §20.
