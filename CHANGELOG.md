# Changelog

All notable changes to this project are documented in this file, from the most recent
entry to the oldest.

> **Nota de fusión (Reorganización Documental):** este archivo fusiona el `CHANGELOG.md` de
> la raíz (formato breve, estilo [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)) con
> `docs/RELEASE_NOTES.md` (formato narrativo, con evidencia por hallazgo). Las entradas v0.1.0
> y v0.2.0 existían en ambos documentos; se conservó la versión de `RELEASE_NOTES.md` por ser
> un superconjunto estricto de la del `CHANGELOG.md` original — cada afirmación de la versión
> breve está cubierta, con más detalle, en la versión narrativa. Nada se perdió en la fusión.

---

## Ola del 20 de Septiembre — endurecimiento previo al despliegue y datos reales de administracion (posterior a v1.0.0-beta.1) · 20 de Septiembre de 2026

El tag `v1.0.0-beta.1` (commit `83b4a49`) marca la primera version con la identidad visual original. Esta ola es **posterior** a ese tag: cierra lo que impedia mostrar el sistema desplegado. **Este documento tampoco declara un veredicto de aptitud para produccion**: el despliegue en si (`S06-J03`) no se ha ejecutado.

### Puntos

| Punto | Commit | Resumen |
|---|---|---|
| Cabeceras de seguridad y Swagger | `0ab0f0f` | `helmet` y `/docs` apagado con `NODE_ENV=production` (`SWAGGER_ENABLED` lo fuerza). Verificado en vivo con el backend en modo produccion: `/docs` 404, cabeceras presentes, CORS intacto. 6 tests. |
| Dependencia `openai` | `5c464fc` | Retirada (14 paquetes); el Tutor usa solo Gemini (ADR 10). |
| Estado real del sistema para administracion | `4627e65` | `GET /admin/system/status` y `GET /admin/system/logs` (solo admin, 30/min): latencia p50/p95 de las ultimas 500 peticiones, ping a la BD, limites reales del sandbox, cola, Tutor, usuarios; ventana de 500 eventos con secretos redactados. Reemplaza las cifras inventadas de `ADM-V01`/`ADM-V03`. 27 tests. En vivo: 401 sin token, 403 a estudiante y docente, 200 con datos reales. |
| Repasos vencidos y enlace al contenido en el Tutor | `df840bb` | `GET /tutor/guidance` devuelve `dueReviews` y `contentLink` (unidad decidida en el servidor y solo si el estudiante puede leerla). 10 tests. En vivo: unidad ajena, ids basura y Tutor desactivado devuelven `null` sin error. |
| Tiempo de espera del arranque en `verify:clean` | `e79d4db` | `VERIFY_START_TIMEOUT_MS` (por defecto 60000, sin cambio). Ver la nota siguiente. |

Build limpio. **57 suites, 478 tests, todos en verde** (antes: 52 y 432).

### Nota de transparencia: la primera corrida de `verify:clean` de esta ola FALLO

La primera corrida completa termino en la fase de arranque: `el servidor no respondio en http://localhost:3097/docs dentro de 60000ms`, con el proceso del servidor sin escribir nada. **No se acepto como "problema del entorno" sin medirlo**, porque en esta ola se cambio justo `/docs`. Se comprobo:

- `waitForServer` acepta cualquier respuesta HTTP (`status !== null`), incluido un 404: apagar Swagger no puede provocar ese timeout.
- El mismo `dist/main.js`, recien reconstruido, abrio el puerto a los **73,9 s** en su primer arranque y a los **8,1 s** en el segundo, con la cache caliente (el rango de 8-13 s que `CLAUDE.md` ya documentaba como sano). El primer log de Nest aparece recien a los 73,7 s: el tiempo se va cargando modulos, antes de que Nest escriba nada.
- Causa mas respaldada: el repositorio vive dentro de OneDrive y `npm ci` acababa de recrear ~955 paquetes, que OneDrive y el antivirus escanean. No es un defecto del codigo, pero **una corrida que fallo no cierra la ola**.

Como `scripts/verify-clean-server-check.js` es un script de arranque, se hizo configurable el tiempo de espera (`e79d4db`) y `verify:clean` se repitio **completo** despues de ese commit, con `VERIFY_START_TIMEOUT_MS=180000`. Resultado literal de esa corrida (exit code 0). Se omitieron unicamente las 198 lineas `query:` de la traza SQL de TypeORM de `migration:run` y `db:seed:demo`; todo lo demas esta tal cual:

```

> stire@0.0.1 verify:clean
> node scripts/verify-clean.js && node scripts/verify-clean-server-check.js


[verify:clean 1] rm -rf node_modules dist

[verify:clean 2] npm ci (instalacion exacta desde package-lock.json)

added 955 packages, and audited 956 packages in 1m

186 packages are looking for funding
  run `npm fund` for details

25 vulnerabilities (2 low, 3 moderate, 19 high, 1 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

[verify:clean 3] crear base de datos vacia de verificacion: stire_verify_clean

[verify:clean 4] migration:run contra la base de datos vacia

> stire@0.0.1 migration:run
> npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts

◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
0 migrations are already loaded in the database.
6 migrations were found in the source code.
6 migrations are new migrations must be executed.
Migration InitialSchema1779000000000 has been executed successfully.
Migration AddEaseFactorToReviewSchedules1788999128282 has been executed successfully.
Migration AddApprovalToClasses1789000000000 has been executed successfully.
Migration AddActiveSubmissionConstraint1789100000000 has been executed successfully.
Migration CreateTutorCredentials1789200000000 has been executed successfully.
Migration CreateTutorSettings1789300000000 has been executed successfully.

[verify:clean 5] db:seed:demo contra la base de datos vacia

> stire@0.0.1 db:seed:demo
> ts-node -r tsconfig-paths/register stire-seeder-demo.ts

◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
Conectado a la base de datos. Sembrando datos de demo (idempotente)...

Institución y programa
  + creado: Universidad de Córdoba (Demo)
  + creado: Ingeniería de Sistemas (Demo)

Usuarios
  + creado: docente.demo@stire.local
  + creado: estudiante1.demo@stire.local
  + creado: estudiante2.demo@stire.local
  + creado: estudiante3.demo@stire.local

Clase y matrículas
  + creado: Fundamentos de Algoritmia — Demo (DEMO-STIRE-01)
  + creado: estudiante1.demo@stire.local matriculado en DEMO-STIRE-01
  + creado: estudiante2.demo@stire.local matriculado en DEMO-STIRE-01
  + creado: estudiante3.demo@stire.local matriculado en DEMO-STIRE-01

Sección, topic y unidades de aprendizaje (con prerrequisito)
  + creado: Módulo 1: Fundamentos
  + creado: Tema 1: Bases de la programación
  + creado: Unidad 1: Variables y tipos de datos
  + creado: Unidad 2: Estructuras de control
  + creado: Unidad 2 requiere Unidad 1 (mastery ≥ 60%)

Contenido teórico
  + creado: Introducción a las variables (Unidad 1)
  + creado: Condicionales if/else (Unidad 2)

Tipo de actividad y actividades (MCQ, CODING, FILL_CODE)
  + creado: Ejercicio Autocalificable (Demo)
  + creado: Quiz: ¿Qué es una variable? (MCQ)
  + creado: pregunta MCQ de la actividad
  + creado: Ejercicio: Suma de dos números (CODING)
  + creado: pregunta CODING de la actividad (con testCase público)
  + creado: Completa el condicional (FILL_CODE)
  + creado: pregunta FILL_CODE de la actividad

✅ Seed de demo completo. Credenciales:
   docente.demo@stire.local       / Demo1234!
   estudiante1.demo@stire.local   / Demo1234!
   estudiante2.demo@stire.local   / Demo1234!
   estudiante3.demo@stire.local   / Demo1234!
   Clase: Fundamentos de Algoritmia — Demo (código DEMO-STIRE-01)

[verify:clean 6] npm run build

> stire@0.0.1 build
> nest build


[verify:clean] setup completo. Base de datos de verificacion: stire_verify_clean (puerto 3097). Continua scripts/verify-clean-server-check.js.
◇ injected env (19) from .env // tip: ⌁ auth for agents [www.vestauth.com]
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor

[verify:clean:server-check] limpieza: eliminar base de datos de verificacion stire_verify_clean

[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.
CODIGO_SALIDA=0
```

En una maquina donde el arranque en frio cabe en 60 s no hace falta la variable.

---

## v0.5.0 — Cierre de Ola 3 de Remediacion · 26 de Agosto de 2026

Base: `docs/REAUDITORIA_OLA2.md` (reauditoria independiente sobre el commit final de Ola 2, `6fc50b3`) — la primera reauditoria de este proyecto que **bajo** la calificacion (5.1/10 -> ~4.4/10) en vez de subirla, por un build roto en checkout limpio y dos P0 nuevos de autorizacion en lectura. Ejecutado en 7 puntos.

**Este documento tampoco declara un veredicto de aptitud para produccion.** Esa determinacion sigue correspondiendo a una reauditoria independiente — misma regla que Ola 1 y Ola 2.

### Punto 1 — El hallazgo principal: build roto en checkout limpio

`npm ci && npm run build` fallaba de forma deterministica (TS2345 en `content-rendering.service.ts:48`). La hipotesis de trabajo (que el `npm audit fix` del Punto 7 de Ola 2 desincronizo el lockfile) se **verifico y se REFUTO**: con un `git worktree` en el commit `133d92d` (el propio commit de ADR 07, anterior al audit fix) se confirmo que el build ya fallaba ahi. La causa real: ese commit agrego un cast innecesario (`window as unknown as Window`) que el codigo anterior no tenia y que no compilaba con `typescript>=5.9` + `dompurify>=3.4.5` — nunca se verifico con un `npm ci` real antes de declararse "verificado". Se quito el cast (no se agrego uno nuevo).

Hallazgo adicional durante la verificacion de arranque: `require('dockerode')` tardaba ~18-20s en este entorno — codigo muerto desde ADR 06 (Docker ya no es un adaptador real; `SANDBOX_TYPE=docker` aborta el arranque). Se elimino `SandboxWatchdogService`/`WorkersModule` y la dependencia — cada arranque real es ahora ~20s mas rapido.

Se agrego `npm run verify:clean` (`scripts/verify-clean.js` + `scripts/verify-clean-server-check.js`): `rm -rf node_modules dist -> npm ci -> migration:run -> db:seed:demo -> build -> arranque -> login real -> apagado`, exit code distinto de cero si cualquier paso falla. Regla nueva en `CLAUDE.md`: este comando es el ULTIMO paso de cada ola, nunca uno intermedio.

**Nota de transparencia sobre este mismo comando:** en la sesion de trabajo que cerro esta ola, `npm run verify:clean` fallo de forma intermitente en su fase de arranque tras muchas horas de actividad intensiva (multiples `npm ci`, suites completas de Jest, decenas de procesos Node) que redujeron la memoria libre del sistema a ~1 GB de 8 GB totales. Investigado a fondo (arquitectura de procesos, `stdio`, anidamiento, uso de `&&`) sin encontrar una causa en el codigo; la explicacion mas respaldada por la evidencia es presion de memoria del propio entorno de esa sesion, no un defecto de `verify-clean.js`. Evidencia a favor: multiples corridas AISLADAS mas tempranas en la misma sesion, con mas memoria libre, completaron el arranque y el login real correctamente en 8-13 segundos (ver `scripts/verify-clean-server-check.js`, probado de forma directa con `node scripts/verify-clean-server-check.js` contra una base de datos migrada y sembrada, resultado literal):
```
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor
```
Detalle completo del diagnostico (incluida la evidencia descartada: causa por `shell`/`stdio`/anidamiento de procesos) en `CLAUDE.md`, seccion `npm run verify:clean`. Recomendacion registrada ahi: repetir la verificacion en una sesion de terminal nueva antes de tratar un fallo de arranque como un hallazgo de codigo.

### Punto 2 — El test de arquitectura solo cubria mutaciones

`route-role-metadata.spec.ts` exigia `@Roles`/`@Public` en POST/PUT/PATCH/DELETE, nunca en GET — por eso los dos P0 de la reauditoria (lecturas de `activities`/`content`) pasaron desapercibidos. Extendido a GET con `JUSTIFIED_GET_EXCEPTIONS` (requiere ademas un `testFile` real que exista). Primera corrida, con la lista vacia: **31 rutas GET sin ningun control** — registradas en `docs/REAUDITORIA_OLA2.md` antes de tocar nada.

### Punto 3 — Los dos P0 (y dos P1 que la misma corrida saco a la luz)

Mismo patron `AuthorizationService` que ya existia para mutaciones, aplicado a lectura:

- `GET /activities` (P0-R1) y `GET /content/*` (P0-R2): admin sin filtro; docente solo sus clases; estudiante solo contenido publicado/visible de clases matriculadas; 403 explicito si se pide un recurso de una clase ajena.
- `ActivityQuestionsService.findByActivity` (P1-R2): docente ajeno ya no lee el `config` crudo (respuesta correcta) de actividades de otro docente.
- `AuthorizationService.assertTeacherSharesClassWithStudent`, nuevo (P1-R5): cierra el patron — senalado ya en la reauditoria de cierre de Ola 1 (P2-N6) y nunca cerrado hasta ahora — de un docente viendo el progreso de cualquier estudiante sin relacion pedagogica, en `AnalyticsService.getStudentDashboard` y `LearningProgressController`.
- Catalogos sin dueno (`activity-types`, `institutions`, `class`, `section`, `topic`, `learning-unit`, `/`) declaran `@Roles`/`@Public` explicito.

### Punto 4 — El test de arquitectura era evadible por colision de nombres

`JUSTIFIED_EXCEPTIONS`/`JUSTIFIED_GET_EXCEPTIONS` comparaban por nombre de clase (string) — un controller nuevo con el mismo nombre y metodo que una excepcion aceptada heredaba su pase libre, demostrado con un PoC en la reauditoria. Se cambio a comparar por **referencia de clase** (la clase real importada, no su nombre) — se reprodujo el PoC exacto y se confirmo que ahora falla (antes quedaba en verde). Se evaluo la reescritura completa con `NestFactory`+`DiscoveryService` pedida originalmente y se descarto: exige una app Nest completa con conexion MySQL real solo para leer la misma metadata ya accesible sin arrancar nada — el propio test original ya documentaba ese costo. El fix de identidad cierra la vulnerabilidad real sin pagarlo.

### Punto 5 — La capa de saneamiento al renderizar era codigo muerto

`renderMarkdownToHtml` (unica funcion que neutraliza `[texto](javascript:...)`) existia desde Ola 2 pero ningun endpoint la invocaba. Ahora `GET /content/:id?format=html` es un camino real hacia ella; sin `format` (comportamiento por defecto, sin cambios) se sigue devolviendo Markdown. Contrato completo en `docs/CONTRATO_CONTENT_RENDERING.md`. Probado con `ContentRenderingService` real (DOMPurify+JSDOM reales, sin mocks).

### Punto 6 — El cortafuegos del sandbox bloqueaba salida, no escucha

`NETWORK_GUARD` parcheaba solo las funciones que INICIAN una conexion; un socket de escucha (`net.createServer(...).listen()`) nunca pasaba por ahi. Extendido a `net`/`http`/`https`/`http2` `createServer` (+ `createSecureServer`). 4 tests nuevos con proceso hijo real.

### Hallazgos que SIGUEN abiertos

| Hallazgo | Estado |
|---|---|
| P1-07 — condicion de carrera en el limite de intentos | Sin tocar |
| P1-08 — perdida de eventos si el proceso de negocio falla | Sin tocar |
| P2-R2 — `data:image/svg+xml` sin verificacion de MIME en perfil RICH | Sin tocar (impacto acotado, origen opaco) |
| P2-R3 — `POST /submissions/start` sin matricula ni estado de publicacion | Sin tocar |
| P2-R4 — self-XSS en el chat del tutor (frontend) | Sin tocar |

### Proximo paso obligatorio

Reauditoria independiente sobre el commit final de esta ola, con el mismo prompt y la misma vara que las tres anteriores.

---

## v0.4.0 — Cierre de Ola 2 de Remediacion · 26 de Agosto de 2026

Base: reauditoria independiente sobre el commit final de la Ola 1 (`0600783`), que ademas de confirmar los hallazgos cerrados encontro cuatro cosas nuevas que la primera pasada no vio. Ejecutado en 8 puntos, cada uno con build + test en verde y commit propio. Igual que en la Ola 1: **este documento no declara un veredicto de aptitud para produccion** — eso lo determina una reauditoria, no el autor del cambio.

### Hallazgos cerrados en esta ola

| Hallazgo | Descripcion | Evidencia |
|---|---|---|
| — | Sin test que lo impida, el patron de autorizacion por rol se puede volver a olvidar en el proximo modulo nuevo | `src/common/authorization/route-role-metadata.spec.ts` — recorre TODOS los controllers por filesystem, sin lista escrita a mano. Fallo el primer dia contra 3 rutas reales (`activity-types` sin ningun `@Roles`/`@Public`), ya corregidas |
| — | `AuthorizationService` no se habia propagado a `topic`/`learning-unit`/`content`/`activity-questions`, ni a `activities.create()` | Los cinco quedan con el mismo patron que `activities`/`class`/`section`/`enrollment` |
| — | `topic.service.ts`: verificacion de propiedad que nunca podia fallar (comparaba contra una relacion — `section.class` — que nunca se carga) | Corregido; `src/topic/topic.service.spec.ts` reproduce el escenario exacto (docente ajeno crea/edita/borra un topic de otro) |
| — | Exfiltracion por DNS en el sandbox: `dns.promises` y `dns.Resolver` evadian el cortafuegos original | 4 tests nuevos con el payload real, `src/judge-engine/hardened-process-sandbox.adapter.spec.ts` |
| P1-09 | 25 de 26 tablas sin `CREATE TABLE` propio en migraciones — el esquema no era reproducible desde cero | `src/migrations/1779000000000-InitialSchema.ts`, linea base unica generada y verificada contra una BD vacia real |
| — | No existia forma reproducible de dejar el sistema en un estado utilizable de demo | `stire-seeder-demo.ts` (`npm run db:seed:demo`), idempotente |
| — | `npm start`/`npm run start:prod` fallaban en un checkout limpio (MODULE_NOT_FOUND) | Dos bugs de `tsconfig.json` corregidos (`rootDir`/`include` ausentes; `incremental` incompatible con `deleteOutDir` de Nest CLI) — ver mas abajo, es el hallazgo mas importante de esta ola |
| P1-04 | XSS: `ContentRenderingService` existia pero no se invocaba en ningun flujo de guardado | Implementado (perfiles RICH/PLAIN, ADR 07) y cableado en los 5 puntos de escritura reales. Suite sin mocks: `content-rendering.service.no-mock.spec.ts` |
| P1-05 (parcial) | Dependencias con 1 critica + 18 altas | `npm audit fix` (sin `--force`, dos pasadas): 39 -> 7 vulnerabilidades. Las 7 restantes se aceptan como riesgo — ver "Riesgos aceptados" abajo |

### El hallazgo mas importante: reproducibilidad real, verificada de punta a punta

La verificacion obligatoria (`npm ci` -> `migration:run` -> `db:seed:demo` -> `npm run build` -> `npm start`, sobre una base de datos MySQL real y vacia) **fallo la primera vez**, y la segunda, antes de pasar limpia. Dos bugs reales, ninguno relacionado con datos:

1. `tsconfig.json` no declaraba `rootDir` ni `include`. Como el proyecto compila tanto `src/**` como los scripts `stire-*.ts` de la raiz, TypeScript inferia el rootDir implicito como la raiz del proyecto y `nest build` emitia `dist/src/main.js` en vez de `dist/main.js` — `node dist/main` (`npm start`/`start:prod`) fallaba con `MODULE_NOT_FOUND` en cualquier checkout limpio.
2. `"incremental": true` en `tsconfig.json` es incompatible con `"deleteOutDir": true` en `nest-cli.json`: `deleteOutDir` borra los `.js` pero no el `.tsbuildinfo`, asi que la siguiente compilacion cree que no hay nada que emitir y no escribe NINGUN archivo — build a `EXIT 0` sin generar `dist/`, silenciosamente.

Con ambos corregidos, la secuencia completa se verifico con `curl` real (no solo con el log de arranque): el docente y los 3 estudiantes de demo inician sesion, y `GET /enrollment/my`/`GET /class` devuelven los datos sembrados.

### Hallazgos que SIGUEN abiertos

| Hallazgo | Estado | Nota |
|---|---|---|
| P1-07 | Condicion de carrera en el limite de intentos (`startSubmission`, sin `UNIQUE` constraint) | Sin tocar |
| P1-08 | Perdida de eventos si el proceso de negocio falla | Sin tocar |
| — | `unit_2.3.3`/`fill-code` y otros evaluadores devuelven `feedback` estatico; no hay indicio de que el saneamiento PLAIN cambie el comportamiento observable salvo ante un intento real de inyeccion | Sin verificar contra trafico real |

### Riesgos aceptados — decision explicita del dueno del proyecto (cierre de Ola 2)

Estos dos items no estan pendientes: se revisaron y el dueno decidio conscientemente no actuar sobre el codigo. No deben reabrirse como hallazgos en la proxima reauditoria sin que cambie el hecho que los sostiene.

| Item | Decision | Motivo |
|---|---|---|
| P1-05 (7 vulnerabilidades restantes, todas en el arbol de `sqlite3`) | No se hace el bump mayor de `sqlite3` | `sqlite3` es devDependency, usada solo para bases de datos en memoria en tests (`src/test-data-source.ts`) — nunca corre en produccion. Sin impacto en ejecucion real |
| Regla de inyeccion de repositorios (`docs/04_ESTANDARES_Y_SEGURIDAD.md` §1.1) | Se cambia la REGLA, no el codigo: repositorio personalizado obligatorio solo con complejidad real de consulta (QueryBuilder, agregaciones, indices); `Repository<Entity>` directo permitido en CRUD simple | La redaccion anterior ("terminantemente prohibido") no describia el codigo real desde la Ola 1 (`AuthorizationService`). Una regla documentada que el proyecto entero incumple hace mentir a la documentacion |

### Proximo paso obligatorio

Igual que al cierre de la Ola 1: reauditoria independiente sobre el commit final de esta ola. El resultado de esa reauditoria — no esta nota — es lo que determina si la calificacion cambia y en cuanto.

---

## v0.3.0 — Cierre de Ola 1 de Remediacion · 25 de Agosto de 2026

Base: `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md` (auditoria tecnica de alta intensidad sobre el commit `c7aac0e`, veredicto original: NO APTO, 3.05/10). Ejecutado en 4 bloques (build, autorizacion de usuarios, sandbox/cola/preguntas, cierre), cada uno con build + test en verde y commit propio.

**Este documento NO declara un veredicto de aptitud para produccion.** Esa determinacion corresponde a una reauditoria independiente sobre el commit final de esta ola, no al autor de los cambios que se auditan a si mismo. Lo que sigue es un registro objetivo de que se cerro y que sigue abierto, con evidencia verificable.

### Hallazgos cerrados en esta ola

| Hallazgo | Descripcion | Commit |
|---|---|---|
| P1-01 | Build roto (6 errores de TypeScript) impedia compilar y arrancar | `44ad1ee` |
| P0-02 | Escalada de privilegios via `PATCH /users/:id` (mass assignment de `role`/`isActive`) | `98c12c3` |
| P1-10 a P1-13 | `POST /users` sin rol, politica de contrasena inconsistente, `GET /users` sin control, `addAffiliation` sin DTO validado, `validateToken()` sin chequeo de `isActive` | `ad6be2b` |
| P0-01 | Escape de sandbox confirmado en `node:vm` (lectura de secretos + ejecucion de comandos) — reemplazado por aislamiento de proceso hijo | `6fb1842` |
| P0-05 | Adaptador Docker mock que aprobaba codigo conteniendo `"correct"`, activo por defecto | `6fb1842` |
| P0-03 | `ActivityQuestion` servida cruda a estudiantes, exponiendo respuestas correctas (y orden revelador en DRAG_DROP/MATCHING/ORDERING) | `6fb1842` |
| P0-04 | `/activities` (update/publish/archive/remove) sin control de rol ni de propiedad de la clase | `0558f80` |
| P1-06 | Misma falta de verificacion de `teacherId` en `class.remove`, `section.update/togglePublish/remove` y `enrollment.findByClass` | `3559af6` |
| P1-03 | `ThrottlerGuard` declarado pero nunca registrado — sin rate limiting funcional en ningun endpoint | `e18ce4e` |
| P1-02 | `auth.service.ts`/`auth.controller.ts` al 0% de cobertura | `f2d5519` |
| — | Preguntas CODING sin ningun `testCase` publico dejaban al estudiante sin saber el formato esperado | `c15effb` |

### Verificacion end-to-end (no solo unitaria)

Con `SANDBOX_TYPE=hardened` y `QUEUE_DRIVER=inline` (ambos default), el servidor arranca completo **sin Docker y sin Redis** (`"Nest application successfully started"`, `GET /docs` -> 200) y califica codigo real: una entrega correcta obtiene 100/100 con `stdout` real capturado en `execution_results`; una entrega incorrecta obtiene 0/100. El sandbox fue atacado con los 10 payloads del informe de auditoria (incluido un test de canario con un secreto real inyectado en el proceso padre) y ninguno tuvo exito.

### Hallazgos que SIGUEN abiertos — no se declaran cerrados sin evidencia

| Hallazgo | Estado | Nota |
|---|---|---|
| P1-04 | XSS almacenado (sanitizador `ContentRenderingService` existe pero no se invoca en ningun flujo de guardado) | Sin tocar en esta ola |
| P1-05 | Dependencias de produccion con 1 vulnerabilidad critica y 18 altas (`npm audit`) | Sin tocar |
| P1-07 | Condicion de carrera en el limite de intentos (`startSubmission`, sin `UNIQUE` constraint) | Sin tocar |
| P1-08 | Perdida de eventos si el proceso de negocio falla — parcialmente mitigado en el pipeline del judge (`emitAsync`), no revisado en `submission.graded` original | Parcial |
| P1-09 | 25 de 26 tablas sin `CREATE TABLE` en migraciones — el esquema no es reproducible desde cero | Sin tocar |
| — | Deuda arquitectonica menor: `UserService`/otros servicios siguen inyectando `Repository<Entity>` directamente | Sin tocar, deuda conocida |
| — | `GET /users` sigue con `@Roles('admin','docente')` — un docente ve el padron completo de la institucion, no solo sus estudiantes. Senalado como diseno amplio, no corregido en esta ola | Decision pendiente |

### Proximo paso obligatorio

Reauditoria independiente con el mismo prompt de alta intensidad de `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md`, sobre el commit final de esta ola, con la misma vara de medir que produjo el veredicto original (NO APTO, 3.05/10). El resultado de esa reauditoria — y no esta nota — es lo que determina si la calificacion cambio y en cuanto.

---

## v0.2.1 — Ola 1 · Bloque 1: Reparacion del Build · 25 de Agosto de 2026

Base: `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md` (hallazgo P1-01), commit `c7aac0e`.
Alcance exclusivo de este bloque: dejar `npm run build` en 0 errores, sin tocar seguridad ni logica de negocio. Ejecutado siguiendo `docs/_archivo/PLAN_OLA1_BLOQUE1_BUILD.md`.

### Correcciones aplicadas (contador de errores estrictamente decreciente: 6 -> 0)

| # | Archivo:linea | Codigo TS | Cambio aplicado | Errores tras el cambio |
|---|---|---|---|---|
| 1 | `src/judge-engine/judge.worker.ts:14` | TS1272 | Separada la importacion de la interfaz `SandboxAdapter` (`import type`) del token `SANDBOX_ADAPTER` (import normal) | 5 |
| 2 | `src/test-data-source.ts:10` | TS2322 | Firma cambiada a `(entities: (Function \| string \| EntitySchema)[])`, importando `EntitySchema` de `typeorm` | 4 |
| 3 | `src/content-rendering/content-rendering.service.ts:8` | TS2724 | Anotacion cambiada a `ReturnType<typeof createDOMPurify>` (agnostica de version); eliminada la dependencia obsoleta `@types/dompurify` (`npm rm @types/dompurify`) | 3 |
| 4 | `src/tutor/tutor.service.ts:50` | TS2532 | Capturada la referencia ya estrechada en `const client = this.openai;` dentro del bloque `else`, usada en el closure de `callWithRetry` | 3 (fix junto con #5) |
| 5 | `src/tutor/tutor.service.ts:52` | TS2769 | Tipado el retorno de `buildMessages()` como `ChatCompletionMessageParam[]`; anadido `normalizeRole()` que mapea cualquier valor de `role` proveniente de BD a la union literal `'system'\|'user'\|'assistant'` (default `'user'`) | 1 |
| 6 | `src/tutor/tutor.service.ts:59` | TS2339 | Sin cambio adicional: el error desaparecio solo al corregir #5, tal como preveia el plan. No se aplico el fallback `stream: false` porque no fue necesario | **0** |

Sin `as any`, `@ts-ignore`, `@ts-expect-error` ni relajacion de `strict` en ningun punto (Regla de Oro del plan, punto 4).

### Resultado literal

```
$ npm run build
> stire@0.0.1 build
> nest build
EXIT_CODE=0

$ npm test
Test Suites: 19 passed, 19 total
Tests:       105 passed, 105 total
Time:        16.501 s

$ npx jest --coverage --coverageReporters=text-summary
Statements   : 26.92% ( 981/3643 )
Branches     : 35.47% ( 542/1528 )
Functions    : 16.92% ( 76/449 )
Lines        : 26.36% ( 872/3308 )
```

Linea base de tests preservada exactamente (19 suites / 105 tests, sin regresiones). Cobertura estable respecto a la auditoria (26.88% -> 26.92%, variacion atribuible a la nueva funcion `normalizeRole`).

### Verificacion de arranque real (PASO 5) — hallazgo nuevo, fuera de alcance de este bloque

Con `SANDBOX_TYPE=local` (solo para esta prueba puntual, **no** fijado como default: la Objecion 2 del plan sigue pendiente de decision), se ejecuto `node dist/src/main.js` de forma directa. La aplicacion inicializo todos los modulos, conecto correctamente contra el MySQL nativo del entorno y mapeo todas las rutas HTTP — confirmando que la correccion del build es funcionalmente valida. Sin embargo, **el proceso completo termino con una excepcion no capturada** al no encontrar Redis disponible:

```
Error: Worker requires a connection
    at new Worker (node_modules/bullmq/dist/cjs/classes/worker.js:45:19)
    at BullExplorer.handleProcessor (node_modules/@nestjs/bullmq/dist/bull.explorer.js:135:24)
```

Esto es una version mas severa de lo ya documentado en la Fase 2 de la auditoria (dependencia dura de BullMQ/Redis): no se trata solo de que el pipeline de calificacion quede en limbo sin Redis, sino de que **el arranque completo del servidor falla de forma fatal** si `BullModule.registerQueue`/`@Processor('judge')` no logran conectar. No se pudo confirmar la escucha efectiva en el puerto 3001 en este entorno por falta de Redis (Docker Desktop no disponible de forma estable durante esta sesion). Se anade como candidato a Ola 2, junto a P1-08 y P1-09.

### Estado de seguridad — sin cambios en este bloque

**P0-01 a P0-05 de la auditoria tecnica SIGUEN ABIERTOS.** Este bloque unicamente corrige errores de tipado que impedian compilar; no se toco autorizacion, sandbox, ni el adaptador de calificacion por defecto. Ningun hallazgo de seguridad se considera remediado por esta entrada.

---

## v0.2.0 — Auditoria de Cierre · 24 de Agosto de 2026

### Resumen Ejecutivo

STIRE alcanza una madurez tecnica de **8.4/10** tras la auditoria de cierre de proyecto (nota autoasignada por el propio equipo en ese momento — no verificada por una reauditoria independiente; la auditoria adversarial posterior, `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md`, la refutaria con evidencia). El sistema paso de una calificacion inicial de 6.1/10 (Auditoria v0.0.1) a un estado declarado **APTO PARA PRODUCCION ACADEMICA**, con todos los bloqueadores de seguridad declarados resueltos y una arquitectura preparada para escalar.

### Cambios Principales

#### 1. Hardening de Seguridad (Bloqueadores P0 Resueltos)

- **Autenticacion global por defecto:** `JwtAuthGuard` y `RolesGuard` configurados como `APP_GUARD` en `app.module.ts`. Todo endpoint requiere JWT valido; las rutas publicas se eximen con `@Public()`.
- **CORS estricto:** Reemplazado `app.enableCors()` permisivo por politica configurable via `CORS_ORIGIN` en `.env`.
- **`synchronize: false`:** TypeORM ya no sincroniza schema automaticamente. Todo cambio estructural pasa por migraciones versionadas.
- **Rate Limiting:** `ThrottlerModule` activo con 100 req/60s global.
- **Errores sanitizados:** `HttpExceptionFilter` global previene fuga de stack traces en produccion.

#### 2. Patron Adaptador en Judge Engine (Portabilidad Total)

El `JudgeEngine` implementa el **Patron Adaptador** completo:

- `SANDBOX_TYPE=local` (default): `LocalProcessSandboxAdapter` — usa `node:vm`, sin Docker ni Redis. Validado en tests. OK
- `SANDBOX_TYPE=docker`: `DockerSandboxAdapter` — diseno listo; integracion Dockerode en sprint siguiente.

> **Nota retrospectiva:** ambos adaptadores de esta entrada fueron reemplazados en Ola 1. `node:vm` tenia un escape de sandbox confirmado (P0-01) y `DockerSandboxAdapter` era un mock (P0-05). El adaptador real y vigente desde Ola 1 es `HardenedProcessSandboxAdapter` (ver ADR 06 en `docs/ADR_DECISIONES_ARQUITECTURA.md`).

#### 3. Integridad de Datos

- `@DeleteDateColumn()` anadido a la entidad `User` — soft delete activo en toda la plataforma.
- Migraciones TypeORM CLI configuradas: `migration:generate`, `migration:run`, `migration:revert`.

#### 4. Validacion de Tests — Resultado Oficial

Ejecutados sin MySQL, Docker ni Redis:

  Test Suites: 3 passed, 3 total
  Tests:       8 passed, 8 total
  Time:        16.998 s · Exit Code: 0 OK

Suites validadas:
- `local-process-sandbox.adapter.spec.ts` — 5 tests
- `tutor.service.spec.ts` — 2 tests
- `judge.worker.spec.ts` — 1 test (SQLite in-memory, ciclo completo)

#### 5. Correcciones de Documentacion

- `README.md`: Puerto corregido 3000 a 3001; Swagger URL /api a /docs; seccion Seguridad actualizada; Tests con comandos correctos.
- `docs/03_MOTOR_Y_TUTOR.md`: Tabla del Adapter Pattern anadida al inicio del Judge Engine.
- `CHANGELOG.md`: Entrada v0.2.0 anadida.

### Added
- `LocalProcessSandboxAdapter`: ejecucion de JavaScript aislada con `node:vm` (timeout 1500ms), sin dependencia de Docker. Activable via `SANDBOX_TYPE=local`.
- `SandboxAdapter` interface y factory en `JudgeEngineModule` — Patron Adaptador completo.
- `@DeleteDateColumn()` en `User` entity — soft delete habilitado en toda la plataforma.
- `HttpExceptionFilter` global para sanitizar errores en produccion.

### Fixed
- Puerto en README.md corregido de 3000 a 3001.
- Endpoint Swagger corregido de `/api` a `/docs`.
- Inconsistencia entre documentacion del Docker Sandbox y estado real de implementacion clarificada.

---

### Estado del Sistema — Matriz de Funcionalidad

VERDE (Production-Ready): Auth + JWT global, Evaluation Engine 6 estrategias, Mastery/SM-2, Sandbox local (node:vm), Notificaciones + Cron, Migraciones, Tutor mock socratico.

AMARILLO (Stub funcional): Docker Sandbox (mock avanzado), LLM real (requiere API Key), QuestionBanks (entidades sin modulo activo).

ROJO (Pendiente): Gamificacion (fase 3 en pausa), WebSocket Gateway en tiempo real.

### Recomendaciones para Entrega

1. Ejecutar `npm run build` — verificar sin errores TypeScript.
2. Ejecutar `npm run start` — validar Swagger en http://localhost:3001/docs.
3. Ejecutar `npm run test:judge` y `npm run test:tutor` — confirmar tests criticos.
4. Asegurarse que `.env` tiene `SANDBOX_TYPE=local` para entorno sin Docker.

---

## v0.1.0 — Remediacion de Auditoria · 21 de Mayo de 2026

### Resumen ejecutivo
STIRE completo la transicion de auditoria critica hacia un estado de operacion solido. La integracion con OpenAI es resiliente, configurable y validada por pruebas.

### Cambios principales

- `TutorService` usa `OPENAI_MODEL` desde configuracion; soporte `OPENAI_API_URL` configurable.
- Reintentos automaticos con backoff exponencial para errores transitorios (429, 503, timeouts).
- Fallback local controlado en caso de fallo no recuperable.
- `src/tutor/tutor.e2e-spec.ts`: verifica construccion de prompt RAG, contexto de progreso, retry sobre 429.
- `.env.example` actualizado con variables LLM.
- Soporte de multiples entornos de ejecucion via `SANDBOX_TYPE`.
- Soporte de migraciones TypeORM y flujo de inicializacion de base de datos endurecido.

### Estado al cierre de v0.1.0

| Dimension          | Estado anterior     | Estado v0.1.0              |
|--------------------|---------------------|-----------------------------|
| Seguridad          | Endpoints expuestos | Guardias globales + CORS    |
| Integridad BD      | Hard deletes        | Soft delete y migraciones   |
| Portabilidad       | Rigido              | Docker + local adaptativo   |
| Tutor IA           | Mock simple         | OpenAI real + RAG + retry   |
| Cobertura de tests | Muy baja            | Test E2E funcional          |
