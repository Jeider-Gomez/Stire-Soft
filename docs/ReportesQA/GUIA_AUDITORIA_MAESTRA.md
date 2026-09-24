# Guía maestra de auditoría QA — cómo auditar STIRE de verdad

**Para:** Jorge Cervantes (y quien audite después) · **Escrita:** 23/09/2026 · **Reemplaza como método** a las guías por semana
(`GUIA_AUDITORIA_2026-09-16.md`, `GUIA_AUDITORIA_2026-09-21.md`), que quedan como registro. Esas guías dicen *qué* mirar esa semana; esta dice
*cómo* se audita siempre y *qué herramientas* hacen falta para poder tocar el 100 % de las funciones.

> Una auditoría de STIRE no se hace leyendo el código ni corriendo `npm test`. Se hace **arrancando el sistema completo y usándolo como
> lo usaría un estudiante, un docente y un administrador**, y después intentando romperlo. Sin herramientas, la mitad de las funciones
> queda sin probar; esta guía te dice cuáles y cómo conseguirlas.

---

## 0. Por qué existe esta guía: lo que dejaron de lado las auditorías anteriores

La simulación del 23/09 (un usuario real en Chrome + barrido de todas las rutas por rol) contra el reporte de la misma fecha mostró siete
patrones. Cada regla de la sección 1 responde a uno.

| # | Qué pasó | Consecuencia |
|---|---|---|
| 1 | Se auditó un **commit viejo** (`ef88916`), 15+ commits atrás | El veredicto «0 P0 / APTO» no cubría roles, mensajería, notificaciones ni migraciones nuevas |
| 2 | **Leer código** se presentó como «prueba adversarial» | Nadie ejecutó el ataque; un fallo real pasó inadvertido |
| 3 | La tabla de autorización listó **solo los módulos que ya se sabían bien** | Los módulos con fallas reales (`class`, `activity-log`, `message`, `enrollment`, `user`) no aparecieron |
| 4 | Las pruebas de la guía (15 filas de roles) **no aparecen** en el reporte | No se sabe si se hicieron |
| 5 | Resultados **históricos** citados como propios (`verify:clean`, «59 suites») | No se pudieron reproducir; los números eran de otro día |
| 6 | El porcentaje final **no cuadraba** (dijo 91,5 %; sus propios ponderados sumaban 93,7 %) | Una cifra que no se puede recalcular no es evidencia |
| 7 | **Nadie usó la app como usuario**: móvil, recarga de página, ejercicio real, mensajes de punta a punta | Se escaparon textos falsos en pantalla, KPIs en 0, mensajes sin nombre, sidebar roto en celular y más |

## 1. Reglas de oro

1. **Fija el commit antes de empezar.** `git checkout main && git pull` y anota `git rev-parse --short HEAD` en la primera línea del reporte.
   Si `main` avanza mientras auditas, no lo persigas: reporta contra el commit que anotaste y di cuál es el nuevo.
2. **Solo cuenta lo que ejecutaste tú.** Cada hallazgo lleva pasos para repetirlo y evidencia (captura, respuesta HTTP, salida de terminal).
   Lo que dedujiste leyendo código se marca **«hipótesis (no ejecutada)»** y no cuenta como hallazgo confirmado ni como prueba superada.
3. **Nunca cites resultados de otro día.** El número de suites/tests, `verify:clean`, cualquier «pasó». Córrelo hoy y pega la salida.
4. **Cada fila de la matriz de cobertura (sección 4) termina en un estado:** ✅ probado · ⚠ parcial (di qué faltó) · ⛔ no probado (di por qué) ·
   🔧 no probable sin una herramienta (di cuál). **Está permitido no llegar a todo; no está permitido callar lo que no llegaste a probar.**
5. **La base de datos de la prueba es desechable** (`stire_qa`). Jamás la base de desarrollo del dueño (`basestire`) ni una de producción.
6. **Las cifras se recalculan a la vista.** Si das un porcentaje, muestra la suma. Si das «N tests», pega la línea `Tests: N passed` de Jest.
7. **Auditas, no arreglas.** No edites código de `src/` ni de `frontend-nuxt/` durante la auditoría; reporta y quien integra decide.
8. **Seguridad:** una vulnerabilidad **real y abierta** (una forma de llegar a docente/admin sin aprobación, de leer datos ajenos, de escapar del sandbox…)
   **no se escribe en el repositorio** (es público). Se entrega por mensaje privado a quien integra; el reporte dice solo «hallazgo de seguridad
   entregado en privado». Lo que ya pasó su prueba sí se documenta.
9. **Lo que dice un documento no es evidencia.** El README, `.env.example` y los reportes viejos han estado desactualizados. Si un documento afirma algo,
   compruébalo contra el sistema corriendo y, si no coincide, es un hallazgo (de documentación).

## 2. Herramientas que necesitas (y qué función desbloquea cada una)

Sin la herramienta, esas filas de la matriz quedan como 🔧: **dilo en el reporte**, no las des por buenas.

### Imprescindibles (sin esto no hay auditoría)

| Herramienta | Para qué | Cómo conseguirla |
|---|---|---|
| **Git** | Fijar el commit y clonar limpio | git-scm.com |
| **Node 24** + npm | El sandbox de código usa el modo `node --permission`, que depende de la versión de Node: usa la del proyecto (24, la del `Dockerfile`). Con otra versión el sandbox puede comportarse distinto y tus resultados no valdrían | nodejs.org (LTS) |
| **MySQL 8 o MariaDB 11** | La base de datos real. Nativa o con `docker-compose up -d` | El `docker-compose.yml` del repo levanta MySQL 8 |
| **Chrome o Edge** con DevTools | Usar la app como usuario; modo dispositivo (375 px); pestaña Network («Offline», «Slow 3G»); consola; Lighthouse | Ya instalado |
| **Un cliente HTTP** | Probar la API sin pantalla: Postman, Insomnia o `curl` / `Invoke-RestMethod` | postman.com / insomnia.rest |
| **Un cliente SQL** (DBeaver, HeidiSQL o `mysql`) | **La fuente de verdad**: comparar lo que muestra la pantalla con lo que hay en la base (KPIs, notas, progreso) | dbeaver.io |

### Para cubrir el 100 % (cada una desbloquea funciones concretas)

| Herramienta | Desbloquea | Cómo conseguirla |
|---|---|---|
| **Puppeteer-core o Playwright** | Recorridos completos automatizados por rol, con registro de errores de consola y respuestas HTTP ≥ 400 en cada pantalla (barrer 14+ pantallas a mano se salta cosas) | `npm i -D puppeteer-core` (usa tu Chrome) o `npm i -D playwright` — en una carpeta **fuera** del repo |
| **Mailpit** (servidor SMTP de prueba) | Recuperación de contraseña por correo real: llega, el enlace funciona, no se reutiliza | `docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit` → bandeja en http://localhost:8025 |
| **Docker Desktop** | Mailpit y probar la **imagen de producción** (`Dockerfile`, `docker-compose.prod.yml`) | docker.com. **Pide ≥ 8 GB de RAM**: ciérralo cuando no lo uses |
| **Clave gratuita de Google AI Studio** | Tutor IA de verdad (sin ella solo pruebas el flujo de clave inválida) | aistudio.google.com/apikey. **Nunca la pegues en un archivo, captura o reporte** |
| **NVDA** (lector de pantalla gratuito) | Accesibilidad real en ≥ 2 flujos (login y panel del Tutor) | nvaccess.org |
| **k6** o **autocannon** | Carga concurrente: ¿aguanta 30–40 estudiantes a la vez? | k6.io / `npx autocannon` |
| **Lighthouse** (dentro de Chrome) y **axe DevTools** | Contraste, foco, etiquetas, rendimiento | Pestaña Lighthouse de DevTools; extensión axe |
| **Un teléfono real** (o emulación 375×667 y 768) | Móvil: el público objetivo son estudiantes | — |
| **Segundo perfil de Chrome / ventana de incógnito** | Estudiante, docente y admin **a la vez** (mensajes, notificaciones) | Ya instalado |
| Redis | **Solo** si pruebas `QUEUE_DRIVER=redis`. Por defecto es `inline` y no hace falta (aunque `.env.example` diga «obligatorio»: ese texto está desactualizado) | `docker run -p 6379:6379 redis` |

**Sobre los recursos del equipo:** el backend + Chrome + base de datos + Docker + Jest a la vez pueden dejar el equipo sin memoria y hacer que los
arranques fallen o se «cuelguen» sin ser un defecto del código. Antes de culpar al sistema, mira la RAM libre. Corre las cosas **por fases**
(no `verify:clean`, Jest y Docker juntos). Si el repo está en OneDrive, el primer arranque es lento: clona fuera de OneDrive o usa
`VERIFY_START_TIMEOUT_MS=180000`.

## 3. Preparación del entorno (desde cero, una base desechable)

```bash
# 1. Fija el commit (sección 1, regla 1)
git checkout main && git pull && git rev-parse --short HEAD

# 2. Dependencias exactas
npm ci

# 3. Base desechable (nunca basestire)
mysql -u root -p -e "CREATE DATABASE stire_qa CHARACTER SET utf8mb4"

# 4. .env desde la plantilla y edítalo:
cp .env.example .env
#    DB_DATABASE=stire_qa
#    JWT_SECRET=<cualquier texto largo>
#    TUTOR_KEY_ENCRYPTION_SECRET=<64 hex: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
#    Correo con Mailpit:  SMTP_HOST=localhost  SMTP_PORT=1025  MAIL_FROM="STIRE <qa@stire.local>"   (sin SMTP_USER/SMTP_PASS)
#    (Sin SMTP_HOST, fuera de producción, el enlace de recuperación se imprime en la consola del backend: sirve si no tienes Mailpit.)

# 5. Esquema y datos
npm run migration:run
npm run migration:show                 # no debe quedar ninguna migración pendiente
npm run db:seed:demo
#    Admin (PowerShell):  $env:ADMIN_EMAIL='admin.qa@stire.local'; $env:ADMIN_PASSWORD='ClaveQA-12345!'; npm run admin:create-first
#    Admin (bash):        ADMIN_EMAIL=admin.qa@stire.local ADMIN_PASSWORD='ClaveQA-12345!' npm run admin:create-first

# 6. Backend (:3001)  y  frontend (:3000, en otra terminal)
npm run start:dev
cd frontend-nuxt && npm ci && npm run dev
```

Comprueba que responde **tu** commit y no un proceso viejo: `curl http://localhost:3001/health` → `{"status":"ok"}`, y `http://localhost:3001/docs`
abre el Swagger (solo fuera de producción). El contrato completo en JSON está en `http://localhost:3001/docs-json`: de ahí sale la lista de **todas** las
operaciones para el barrido de la sección 5.

**Cuentas** (las que crea `db:seed:demo`; el README trae otras del seed antiguo, no las uses):

| Rol | Correo | Clave | Notas |
|---|---|---|---|
| Docente | `docente.demo@stire.local` | `Demo1234!` | Dueño de la clase `DEMO-STIRE-01` |
| Estudiante | `estudiante1.demo@stire.local` … `estudianteN.demo@stire.local` | `Demo1234!` | Matriculados en `DEMO-STIRE-01` |
| Admin | el que crees con `admin:create-first` | el que definas | — |

Crea además **tú** un segundo docente (regístralo y apruébalo como admin), un estudiante sin clase y un estudiante «ajeno»: sin esas identidades no puedes
probar que un docente no ve la clase de otro ni que un estudiante no ve datos de otro.

**Trampas del entorno (cuestan horas si no las conoces):**
- **`429` al iniciar sesión** durante las pruebas: el límite de peticiones vive en memoria; espera 1 minuto o reinicia el backend. No es un defecto.
- El frontend en desarrollo apunta a `http://localhost:3001`; si cambiaste el puerto del backend, define `NUXT_PUBLIC_API_BASE`.
- En PowerShell, JSON con comillas y `\` se rompe: guárdalo en un `.json` y envíalo con `-d @archivo.json` / `-Body (Get-Content …)`.
- Automatizando con Puppeteer, el triple clic **no** selecciona un campo de contraseña: usa `Ctrl+A`.
- La base de desarrollo del dueño puede estar sin migraciones nuevas: otra razón para no usarla.

## 4. Matriz de cobertura (lo que hay que tocar)

Copia esta tabla al reporte y rellena el **estado** de cada fila. «BD» = compara con una consulta SQL (herramienta: cliente SQL).

### A. Sin sesión

| ID | Prueba | Esperado |
|---|---|---|
| A1 | Abrir `/` y navegar a login/registro | Carga sin errores de consola |
| A2 | Login correcto; usuario inexistente; clave errónea; campos vacíos | Errores claros; **el mismo mensaje** para usuario inexistente y clave errónea |
| A3 | Registro como estudiante | Cuenta creada, entra a su panel |
| A4 | Registro pidiendo rol docente (correo cualquiera) | Nace **estudiante** + solicitud pendiente + aviso en pantalla |
| A5 | `role:"admin"` o `requestedRole:"admin"` en el cuerpo | `400`, no se crea la cuenta |
| A6 | Registrar un correo ya usado | `409` con mensaje legible (nunca `500`) |
| A7 | «¿Olvidaste tu clave?» con correo existente e inexistente | **Idéntica** respuesta; llega 1 solo correo (Mailpit) |
| A8 | Enlace de recuperación: válido, **reutilizado**, inventado, clave débil | Válido cambia la clave; los demás `400`; la sesión anterior queda cerrada |
| A9 | Entrar sin sesión a `/estudiante`, `/docente`, `/admin` | Redirige a login |
| A10 | URL inexistente | Página 404 propia |
| A11 | Recargar (F5) en una ruta profunda (`/estudiante/unidad/1`) | Carga la pantalla, no un error |
| A12 | Superar el límite de intentos de login | `429` y la pantalla lo explica |

### B. Estudiante

| ID | Prueba | Esperado |
|---|---|---|
| B1 | Unirse a una clase: código correcto / falso / vacío / ya matriculado | Mensajes correctos; **vacío no matricula en ninguna** |
| B2 | Catálogo de clases | No expone el código de ingreso ni el correo del docente |
| B3 | Panel de inicio (BD) | Cifras iguales a las de la base |
| B4 | Unidad: lecciones con negritas, bloques de código, listas | Se ven formateadas; solo aparece lo **publicado** |
| B5 | **Cada tipo de actividad** (lista en `GET /activity-types`): bien, mal, vacío, reintento | Nota coherente; feedback comprensible |
| B6 | Ejercicio de código: «Probar código» (casos públicos), «Entregar» (casos ocultos), código incorrecto, bucle infinito, salida fija | El resultado se **ve** sin buscarlo; un timeout se explica; imprimir la salida fija **falla** la entrega; nota escalada a los puntos |
| B7 | Autoguardado y recarga en medio del ejercicio | El texto se conserva; el indicador no dice «guardado» antes de escribir |
| B8 | Progreso y maestría (BD) | Coinciden con lo entregado |
| B9 | Repasos: «Iniciar Refuerzo» | Lleva a la unidad correcta |
| B10 | Mensajes: enviar al docente, recibir respuesta, «no leídos», nombres | Nombres reales; el contador baja al leer |
| B11 | Campana de notificaciones (2 ventanas: estudiante y docente) | Aparece la notificación; marcar leída funciona |
| B12 | Tutor: sin clave / clave inválida / **clave real** | Guía de configuración / error claro / respuesta útil |
| B13 | Tutor adversarial: pedir la solución completa (directo, «ejemplo», «solo el código», por pasos) | No entrega un programa completo; **anota cada prompt probado** |
| B14 | Cerrar sesión y pulsar «Atrás» | No se ven datos de la sesión anterior |
| B15 | Sesión vencida a mitad de uso | Redirige a login sin pantalla rota |

### C. Docente

| ID | Prueba | Esperado |
|---|---|---|
| C1 | Crear/editar clase | Código único generado; validaciones |
| C2 | Panel de inicio: KPIs (BD) | Estudiantes, maestría, «en riesgo» iguales a la base; **ningún número fijo** |
| C3 | **CRUD completo desde la pantalla**: sección → tema → lección/contenido → unidad (crear, editar, borrar, publicar/despublicar) | Todo funciona; lo despublicado **no lo ve** el estudiante (verifícalo con su cuenta) |
| C4 | Crear un ejercicio de **cada tipo** desde la pantalla y resolverlo como estudiante | El creador ofrece los tipos; el ejercicio creado se resuelve |
| C5 | Detalle de un estudiante | Historial, intentos y notas correctos (un 20/20 no aparece como «20/100») |
| C6 | Mensajes al estudiante (desde su detalle y desde la bandeja) | Selector poblado; destinatario preseleccionado |
| C7 | Rendimiento de la clase | Datos coherentes (BD) |
| C8 | Apagar el Tutor de la clase / poner tope de nivel | El estudiante lo nota; se respeta el tope |
| C9 | Aislamiento: **docente B** intenta ver/editar la clase, alumnos, actividades y actividad-log del docente A | `403`/`404`, nunca datos |
| C10 | Docente con solicitud **pendiente** intenta crear clase/contenido | `403` |

### D. Administrador

| ID | Prueba | Esperado |
|---|---|---|
| D1 | `admin:create-first`: crea, es idempotente, rechaza sin variables y con clave débil | Como se indica |
| D2 | Solicitudes de docente: aprobar/rechazar con nota; decidir dos veces; decisión o nota inválida | `200` / `409` / `400`; el usuario aprobado funciona **sin volver a iniciar sesión** |
| D3 | Usuarios: listar, cambiar rol, desactivar/eliminar; sobre uno mismo | Funciona; sobre uno mismo `403` |
| D4 | Registrar usuarios / restablecer clave desde la pantalla | Marca ⛔/🔧 si la función aún no existe (está en la Fase 24) |
| D5 | Panel del sistema y endpoints de `maintenance` | Estado visible; **sin secretos** en pantalla ni logs |

### E. Transversal

| ID | Prueba | Cómo |
|---|---|---|
| E1 | **Barrido de autorización**: TODAS las operaciones del contrato × {sin sesión, estudiante, estudiante ajeno, docente dueño, docente ajeno, admin} | Sección 5 |
| E2 | Validación de entrada: cuerpo vacío, tipos erróneos, id no numérico, cadenas enormes, campos de más, cuerpo > 100 kb | **Nunca `500`**; el error es `400`/`413`/`422` legible |
| E3 | Sandbox: bucle infinito, memoria, leer/escribir archivos, `child_process` (con `require` **y** `import()`), `worker_threads`, `process.binding`, red (`net`, `http`, `dns`, `fetch`), leer el `.env` por ruta absoluta y por la carpeta padre | Todo bloqueado o cortado por tiempo/memoria; el servidor sigue vivo |
| E4 | XSS/inyección: `<script>`, `onerror`, `<svg onload>`, `<iframe srcdoc>`, `<style>`, `javascript:` en **todo texto que otro usuario verá** (contenido, enunciados, nombre de clase, nombre de usuario, mensajes) | Saneado o escapado; nada se ejecuta en la vista de otro |
| E5 | Sesión: token con `alg:none`, manipulado, vencido; cambiar la contraseña con otra sesión abierta | `401`; la sesión anterior queda cerrada |
| E6 | **Móvil 375×667 y tablet 768**, cada pantalla de cada rol | Sin scroll horizontal; el menú colapsa; botones ≥ 44 px |
| E7 | Accesibilidad: Tab con foco visible, `Escape` cierra modales, Lighthouse/axe, **NVDA en ≥ 2 flujos** | Anota lo que el lector dice y lo que no dice |
| E8 | Resiliencia: **apagar el backend** con la app abierta; DevTools «Offline»/«Slow 3G»; doble clic en «Entregar»; dos pestañas | Mensaje comprensible; sin doble entrega; sin pantalla en blanco |
| E9 | Carga: 30–40 estudiantes a la vez (login → ver unidad → «Probar código») con k6/autocannon | Sin errores `5xx`; anota p95 y la RAM del backend |
| E10 | Migraciones desde cero (`verify:clean`) y `migration:show` sin pendientes | «TODO EN VERDE», pegado literal |
| E11 | `npm run build` y `npm test` (**pega la línea `Tests: N passed`**); frontend: `npx nuxi typecheck` y `npm run generate` | 0 errores; cifras de hoy |
| E12 | Producción: construir la imagen, arrancarla con `NODE_ENV=production` contra MariaDB, `/health` responde, `/docs` da 404, **sin cuentas demo**; servir el frontend estático con la regla de reescritura | Según `docs/DESPLIEGUE.md` |
| E13 | Documentos vs sistema (README, `.env.example`, Swagger, reportes) | Cada discrepancia es un hallazgo de documentación |

## 5. Cómo hacer el barrido de autorización (E1) — lo que más se dejó de lado

1. Descarga `http://localhost:3001/docs-json` y saca **todas** las operaciones (método + ruta). No escojas: son todas (más de 100).
2. Obtén 5 tokens con `POST /auth/login`: estudiante A, estudiante B (ajeno), docente dueño, docente ajeno, admin. Más «sin token».
3. Para cada operación, ejecútala con cada identidad, con ids que **existan** (del dueño) y ids que no. Registra el código HTTP en una matriz
   `operación × identidad`. (Automatízalo: son ~600 llamadas; a mano no se hace.)
4. Compara con la regla esperada: sin token → `401` salvo lo público (`login`, `register`, `forgot/reset-password`, `health`); estudiante → solo lo suyo;
   docente → solo lo de **sus** clases; admin → lo administrativo. Cada casilla que **no** coincide es un hallazgo (un `200` donde debía ser `403` es el grave).
5. Mira sobre todo lo que expone datos por id (`/:id`, `/student/:id`, `/class/:id`, `/message`, `/activity-log`, `/users`): ahí estuvieron los defectos reales.
6. **Ninguna respuesta debe ser `500`** ni traer texto de SQL o rutas del servidor.

## 6. Lo que se compara con la base de datos (la pantalla puede mentir)

Varios defectos encontrados eran cifras o textos **fijos** que la pantalla mostraba como si fueran reales («92 % de adopción», «3 casos públicos», «Autoguardado ✔»
sin haber escrito). Regla práctica: **por cada número o estado que veas, pregúntate de dónde sale**, y compáralo con una consulta SQL o con la respuesta de la API.
Si al cambiar los datos la cifra no cambia, es fija.

## 7. Qué entregar

Un solo archivo `docs/ReportesQA/REPORTE_AUDITORIA_QA_STIRE_<fecha>.md` (rama `qa/reporte-<fecha>` o directo a `main`), con:

1. **Cabecera de entorno:** commit auditado, fecha, sistema operativo, versiones (Node, base de datos, navegador), herramientas usadas y **cuáles faltaron**.
2. **Cobertura:** la matriz de la sección 4 con el estado de **cada** fila. Al final: `probadas / total` y la lista de ⛔ y 🔧 con el motivo.
3. **Hallazgos:** `id · severidad · pantalla o endpoint · pasos para repetirlo · esperado · observado · evidencia`. Severidad:
   **Crítico** (acceso indebido, pérdida de datos, escape del sandbox) · **Alto** (función principal inutilizable o datos falsos) · **Medio** · **Bajo** (cosmético).
   Las hipótesis sin ejecutar van en una sección aparte, no en la tabla.
4. **Veredicto de despliegue** (apto / apto con condiciones / no apto) y **por qué**, en dos párrafos. **No puede ser «apto» si quedan sin probar E1, E3, E4, E5 o A5**;
   si el porcentaje de avance se calcula, se muestra la suma.
5. **Lo que no alcanzaste a probar**, explícito.
6. Hallazgos de seguridad reales: solo la frase «entregado en privado».

---

## Anexo. Prompt para un agente IA con terminal y navegador (Claude Code o Antigravity)

Pégalo tal cual en una sesión nueva abierta en la carpeta del repositorio. El agente necesita las herramientas de la sección 2; si le falta alguna, debe decirlo y no fingir.

```text
Eres el auditor QA de STIRE (backend NestJS + TypeORM en :3001, frontend Nuxt 3 en :3000, base MySQL/MariaDB). Tu trabajo es DEMOSTRAR con ejecución real qué funciona y qué no, como lo haría un estudiante, un docente y un administrador, y luego intentar romperlo. No opines leyendo código: ejecuta.

<contexto>
- Antes de empezar, lee COMPLETA la guía docs/ReportesQA/GUIA_AUDITORIA_MAESTRA.md y sigue sus secciones 1 a 7 en orden. Lee también docs/ReportesQA/README.md para no repetir reportes previos.
- Fija el commit: git pull en main y anota git rev-parse --short HEAD en la primera línea del reporte.
- Usa SOLO la base desechable stire_qa (guía, sección 3). Cuentas y comandos: sección 3.
</contexto>

<tarea>
1. Prepara el entorno desde cero (sección 3) y comprueba con /health que responde TU commit.
2. Recorre la matriz de cobertura (sección 4) fila por fila: A (sin sesión), B (estudiante), C (docente), D (admin) y E (transversal). Usa un navegador real automatizado (Puppeteer o Playwright, fuera del repositorio) y registra por pantalla: errores de consola, errores de página y respuestas HTTP >= 400. Compara toda cifra visible con una consulta SQL.
3. Haz el barrido de autorización completo de la sección 5: todas las operaciones de /docs-json contra 6 identidades, en una matriz operación x identidad.
4. Prueba móvil (375x667 y 768), recarga de página en rutas profundas, y backend caído.
5. Entrega el reporte con el formato de la sección 7.
</tarea>

<reglas>
- Solo cuenta lo que ejecutaste. Lo deducido leyendo código va como "hipótesis (no ejecutada)". Todo hallazgo es una hipótesis hasta reproducirlo.
- Nunca cites resultados de otro día: corre npm run build y npm test ahora y pega la línea "Tests: N passed". Si das un porcentaje, muestra la suma.
- Cada fila de la matriz termina en ✅ probado, ⚠ parcial, ⛔ no probado o 🔧 sin herramienta, con el motivo. No calles lo que no probaste.
- Vulnerabilidad real y abierta (acceso indebido, escape del sandbox, fuga de datos): NO la escribas en el repositorio. Descríbela en un archivo fuera del repo y avísame en el chat; el reporte solo dice "hallazgo de seguridad entregado en privado".
</reglas>

<limites_de_accion>
Permitido: crear y borrar la base stire_qa, levantar el backend y el frontend en local, crear scripts y capturas en una carpeta temporal fuera del repo, escribir el reporte en docs/ReportesQA/.
Prohibido: tocar basestire u otra base que no sea stire_qa; editar código de src/ o frontend-nuxt/ (auditas, no arreglas); hacer commit o push; pegar claves o secretos en cualquier archivo, captura o mensaje; instalar dependencias dentro del repositorio.
</limites_de_accion>

<paradas>
Detente y pregúntame si: falta una herramienta imprescindible de la sección 2; la RAM libre baja de 1,5 GB (no culpes al sistema, cierra procesos y repite); un comando borraría algo fuera de stire_qa; el backend que responde no es el de tu commit; o encuentras una vulnerabilidad real.
No repitas una fase que ya pasó salvo que el commit cambie.
</paradas>

<entrega>
Archivo docs/ReportesQA/REPORTE_AUDITORIA_QA_STIRE_<fecha>.md con: cabecera de entorno, matriz de cobertura completa con estado por fila y total probadas/total, tabla de hallazgos con pasos y evidencia, veredicto de despliegue en dos párrafos (no puede ser "apto" si quedan sin probar E1, E3, E4, E5 o A5) y la lista explícita de lo no probado. En el chat, resume en 10 líneas y di qué herramienta te faltó, si alguna.
</entrega>
```
