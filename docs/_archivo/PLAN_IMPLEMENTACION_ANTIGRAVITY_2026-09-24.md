> **ARCHIVADO el 2026-09-24 — Fase 24 ejecutada por Antigravity, auditada por Claude Code y corregida (24b).**
> Es un documento histórico; el plan vigente es `docs/antigravity/PLAN_IMPLEMENTACION.md` (Fase 25).
> **Resultado de la auditoría** (`docs/ReportesQA/REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md`): T1 a T5 entregadas. Cuatro fallos impedían fusionar la rama y se
> corrigieron el mismo día: (1) el creador de ejercicios no enviaba ningún tipo (campos `required` ocultos), (2) reordenar lecciones no funcionaba,
> (3) los errores del servidor no se veían (leían `data.message`; el backend responde en `error`), (4) el login había perdido «¿Olvidaste tu clave?» —
> **defecto de este plan (§T3, «texto fijo bajo el botón»), escrito antes de construir la recuperación por correo**; no repetirlo. Escape en 14 diálogos y la
> vista previa de lecciones también se corrigieron.
> **Lecciones para los planes siguientes:** una función que ya existe no se quita por decisión de un plan sin comprobarlo contra el código; un formulario con
> constructores ocultos no lleva `required`; los errores del servidor se leen con `useApiErrorMessage().messageOf`; los diálogos cierran con
> `useEscapeToClose`; «verificado» significa probado en Chrome real, no «el endpoint responde 200».

---

---
estado:     pendiente — Fase 24 (sin ejecutar)
verificado: 2026-09-23 contra src/ y frontend-nuxt/ reales, con el backend en marcha (/docs-json)
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    DOC-V01 (clase) · DOC-V02 (contenidos) · DOC-V03 (ejercicios) · ADM-V02 (usuarios) · perfil
---

# Plan de implementación para Antigravity — Fase 24

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 23 ya están hechas y archivadas en
[`docs/_archivo/`](../_archivo/). **No las leas para ejecutar esta fase.** La numeración continúa en 24.

---

## 24. Fase 24 — que un docente pueda armar un curso de cero, y las funciones de cuenta que faltan

### 24.0 En una línea

Cinco tareas (T1 a T5), **solo en `frontend-nuxt/`**. Hoy un docente que crea una clase desde la interfaz la deja
**vacía para siempre** (no puede crear módulos, temas, unidades ni lecciones), solo puede crear ejercicios de
código, y ni el admin ni ningún usuario tienen pantallas de cuenta. El backend de las cinco tareas **ya existe**
y está probado; no lo toques. José rediseña la identidad visual en ramas aparte: **no edites
`tailwind.config.ts` ni `assets/css/main.css`** y usa clases y tokens que ya existen.

### 24.1 Reglas

1. **No inventes datos:** un dato que no llega se muestra «—», nunca `0` ni un estado positivo. Un texto que
   describe el sistema («3 casos privados», «guardado») sale de un dato real o no se escribe.
2. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-24`; no subas a `main` hasta terminar;
   se une con Pull Request.
3. **Cambios mínimos en cada archivo:** José también toca `pages/` y `components/`. Cambia solo lo que la tarea
   pide; no reformatees ni reordenes lo demás. Reutiliza el patrón de diálogo que ya usan `contenidos.vue`,
   `crear.vue` y `admin/index.vue` (`role="dialog"`, `aria-modal`, foco inicial, `Escape` cierra sin enviar nada,
   botón deshabilitado mientras la petición está en curso, mensaje real del servidor si falla).
4. **En las actualizaciones (`PATCH`) envía solo los campos que el usuario cambió.** Nunca reenvíes el objeto
   completo ni campos de relación (`classId`, `sectionId`, `topicId`, `learningUnitId`): el servidor los acepta en
   el cuerpo, pero moverlos de padre no es una función de esta fase.
5. **Verifica en navegador real con el backend levantado**, no solo con `npx nuxi typecheck`. Cada tarea trae su
   prueba en §24.3.
6. **En tu informe cuenta solo lo que viste.** Cita únicamente endpoints que hayas visto en la pestaña Red.
7. Cuentas de prueba: las demo del [`README.md`](../../README.md) raíz. Las pruebas de T3 y T4 crean usuarios
   nuevos: usa correos con un sufijo tuyo (por ejemplo `prueba-agy-24a@unicor.edu.co`). Antes de empezar, la base
   debe tener todas las migraciones (`npm run migration:run`).
8. **Orden recomendado:** T1 → T2 → T5 → T4 → T3. La prueba de T2 necesita una unidad donde publicar, que T1 permite
   crear.

### 24.2 Lo que ya existe y NO debes rehacer

- `pages/docente/contenidos.vue`: modales de **editar/archivar tema** (`PATCH`/`DELETE /topic/:id`), de **editar
  unidad** (`PATCH /learning-unit/:id`, con `DocenteTutorSettingsPanel`) y el interruptor de **publicar módulo**
  (`PATCH /sections/:id/publish`). T1 se suma a esto, no lo sustituye.
- `pages/docente/ejercicios/crear.vue`: lista de actividades de la unidad, **editar / publicar / archivar** actividad
  y el formulario de ejercicio de **código** (T2 lo extiende).
- `pages/admin/index.vue`: cambio de rol con diálogo y bloqueo de la propia fila, y las solicitudes de rol docente.
- `pages/docente/clase/[classId].vue`: matrículas pendientes/activas, aprobar/rechazar/remover y el interruptor
  «exigir aprobación».
- `components/exercise/*` (`McqExercise`, `FillCodeExercise`, `DragDropExercise`, `MatchingExercise`,
  `OrderingExercise`): **lo que ve y responde el estudiante ya funciona** para esos cinco tipos; T2 solo crea el
  contenido que esos componentes ya saben mostrar.

---

### T1 — Constructor del curso: crear módulos, temas, unidades y lecciones

**Defecto.** En `/docente/contenidos` el docente solo puede editar, archivar y publicar lo que ya existe; no hay
ningún botón para **crear** un módulo, un tema, una unidad ni una lección, ni para editar el texto de una lección.
Una clase creada desde `/docente` aparece con «Sin módulos curriculares» y no hay salida desde la interfaz (además
`crear.vue` necesita una unidad existente).

**Contrato del backend (ya hecho).** Todas las rutas exigen rol `docente` (o `admin`) y que la clase sea del
docente; en otro caso `403`. Los ids son números.

| Acción | Endpoint | Cuerpo | Notas |
|---|---|---|---|
| Crear módulo | `POST /sections` | `{ classId, title, description?, order? }` | `title` obligatorio, `order` entero ≥ 0. **Nace despublicado** (`isPublished:false`). Devuelve la sección con su `id`. |
| Editar módulo | `PATCH /sections/:id` | `{ title?, description?, order? }` | |
| Publicar / despublicar | `PATCH /sections/:id/publish` | sin cuerpo | Alterna; ya usado en `contenidos.vue`. |
| Crear tema | `POST /topic` | `{ sectionId, title, description?, order? }` | `title` obligatorio. |
| Crear unidad | `POST /learning-unit` | `{ title, description?, difficulty?, order?, topicId }` | `difficulty`: `basico` \| `intermedio` \| `avanzado`. **Envía siempre `topicId`**: el servidor lo trata como opcional, pero una unidad sin tema queda huérfana e invisible. |
| Listar lecciones (docente) | `GET /content/unit/:unitId/all` | — | Incluye las ocultas. |
| Crear lección | `POST /content` | `{ learningUnitId, title, type:"markdown", body, order?, isVisible? }` | `title` y `type` obligatorios; `order` entero ≥ 0; `isVisible` por defecto `true`. |
| Editar lección | `PATCH /content/:id` | `{ title?, body?, order? }` | Un `body` vacío **no** borra el texto: exige cuerpo no vacío en el formulario. |
| Ocultar / mostrar | `PATCH /content/:id/visibility` | sin cuerpo | Alterna. |
| Reordenar | `POST /content/reorder` | **arreglo** `[{ id, order }, …]` | Todas las lecciones del arreglo deben ser de una clase del docente. |
| Borrar lección | `DELETE /content/:id` | — | Borrado definitivo. |

- El servidor **sanea el HTML del cuerpo al guardar** (quita `<script>`, manejadores `on…`, iframes, etc.): tras
  guardar, muestra lo que devuelve el servidor, no lo que se escribió.
- El visor del estudiante (`pages/estudiante/unidad/[id].vue`, `formatMarkdown`) muestra **solo el `body`** de cada
  bloque (no el título ni el tipo) y entiende: `#`, `##`, `**negrita**`, `*cursiva*`, `` `código` ``, bloques
  ```` ``` ````, y listas con `- `. Por eso la interfaz **solo ofrece el tipo `markdown`** (video/pdf/imagen/código
  no se ven en el visor).
- Un módulo nuevo **no lo debe ver el estudiante** hasta publicarlo, y un tema/unidad archivados (`isActive:false`)
  tampoco. Hoy `GET /sections/class/:id` devuelve todo y `stores/student.ts` no filtra.
- **Ningún borrado definitivo de módulo, tema o unidad se expone** (`DELETE /sections/:id` es definitivo y arrastra
  a sus temas; `DELETE /learning-unit/:id` es solo de admin). Para retirar un tema o una unidad se usa
  «archivar» (`isActive:false`), que ya existe para temas y unidades.

**Qué hacer** en `pages/docente/contenidos.vue`:
- Botón **«Nuevo módulo»** en la cabecera y en el estado vacío. Diálogo con título (obligatorio), descripción
  opcional. `order` = mayor `order` existente + 1 (no lo pidas al usuario). Al crear muestra el módulo con la marca
  «Borrador» y el aviso «Los estudiantes no lo verán hasta que lo publiques», junto al interruptor de publicar que ya
  existe.
- En cada módulo, **«Nuevo tema»**; en cada tema, **«Nueva unidad»** (título obligatorio, dificultad, descripción).
  Mismo cálculo de `order`. Al crear se actualiza el árbol sin recargar la página.
- En cada unidad, un panel/diálogo **«Lecciones»** que lista los bloques (`GET /content/unit/:id/all`) con: crear,
  editar (título + cuerpo en un `textarea`, con vista previa opcional usando la misma función de formato del
  estudiante), ocultar/mostrar, subir/bajar (`POST /content/reorder`) y borrar con confirmación.
- En `stores/student.ts`, al armar los módulos, **omite** las secciones con `isPublished === false`, los temas y
  unidades con `isActive === false` y las actividades cuyo `status` no sea `published`. Es un filtro de una línea por
  nivel; si el dueño ya corrigió el backend para que `GET /sections/class/:id` filtre por rol, omite este punto.
- En `pages/estudiante/unidad/[id].vue` muestra el `title` del bloque como encabezado sobre su texto (hoy no se ve).
- **No** ofrezcas borrar módulos/temas/unidades, cambiar de padre un elemento, ni tipos distintos de `markdown`.

**Riesgo:** medio (mucha interfaz nueva en un archivo que José también toca). Trabaja en componentes nuevos bajo
`components/docente/` y deja en `contenidos.vue` solo los botones, los `ref` y las llamadas.

---

### T2 — Creador de ejercicios con todos los tipos

**Defecto.** `pages/docente/ejercicios/crear.vue` solo crea ejercicios de **código**; el backend califica además
opción múltiple, completar código, arrastrar y soltar, emparejar y ordenar, y los cinco componentes del estudiante
ya existen, pero sin una pantalla que los cree el docente no puede usarlos. Además: el botón dice «Guardar y
Publicar» pero solo guarda un **borrador** (el estudiante no lo ve), los casos de código no llevan `weight` (el juez
suma `weight || 10` por caso: con otro total de puntos la nota máxima no coincide con el puntaje de la actividad), y
si falla la creación de la pregunta queda una actividad huérfana.

**Contrato del backend (ya hecho).**
- `POST /activities`: `{ learningUnitId, activityTypeId, title, description?, difficulty?, totalPoints?, passingScore?,
  attemptsAllowed?, order?, isRequired?, adaptiveWeight? }`. Nace en **borrador**. `passingScore` es un
  **porcentaje** (defecto 60) del `totalPoints`. Dueño de la clase o `403`.
- `POST /activity-questions`: `{ activityId, type, question, points?, order?, config }`. `type` ∈ `mcq`, `coding`,
  `fill_code`, `drag_drop`, `matching`, `ordering`. **No ofrezcas `ai_evaluated`** (el servidor lo rechaza con 400:
  no tiene evaluador). `question` y `description` se sanean como texto enriquecido.
- `PATCH /activities/:id/publish` (borrador → publicada); `DELETE /activities/:id` (retira la actividad).
- **El estudiante solo renderiza UNA pregunta por actividad** (`stores/workspace.ts` toma la de tipo `coding` o, si
  no hay, la primera). Crea siempre **una sola pregunta** y con **`points` = `totalPoints`** de la actividad
  (si difieren, la nota máxima alcanzable no coincide con lo que se muestra y se puede quedar sin poder aprobar).
- `config` por tipo (forma exacta que leen los evaluadores y los componentes del estudiante):

| Tipo | `config` | Respuesta del estudiante | Nota |
|---|---|---|---|
| `mcq` | `{ options:[{id,text}…], correctAnswerId:"<id>", isMultipleChoice:false, explanation? }` | `{ selectedId }` | Todo o nada. **Solo respuesta única**: el componente del estudiante es de una sola opción; no ofrezcas «varias correctas». Mínimo 2 opciones con texto, exactamente 1 correcta. |
| `fill_code` | `{ codeTemplate:"…___b1___…", blanks:[{id:"b1", answer:"…", regexMode?}…] }` | `{ blanks:{ b1:"…" } }` | Cada hueco se marca en la plantilla como `___<id>___` (id con letras, números, `_` o `-`). Cada marcador debe tener su entrada en `blanks` y viceversa. Compara texto exacto (sin espacios de los extremos). Proporcional: `round(aciertos/huecos × points)`. `regexMode` déjalo apagado. |
| `drag_drop` | `{ items:[{id,content}…], targets:[{id,label}…], mappings:{ "<itemId>":"<targetId>" } }` | `{ mappings:{…} }` | `mappings` cubre **todos** los ítems. Proporcional. El servidor baraja `items` y `targets` al servirlos. |
| `matching` | `{ leftColumn:[{id,content}…], rightColumn:[{id,content}…], pairs:{ "<leftId>":"<rightId>" } }` | `{ pairs:{…} }` | Formulario natural: filas «izquierda ↔ derecha»; cada fila crea un `left_i`, un `right_i` y su par. Mínimo 2 filas. Proporcional. El servidor baraja `rightColumn`. |
| `ordering` | `{ blocks:[{id,content}…], correctOrder:["<id>",…] }` | `{ order:[ids…] }` | El docente los escribe **en el orden correcto** (`correctOrder` = esos ids en ese orden; `blocks` la misma lista). Mínimo 2. Todo o nada. El servidor baraja `blocks` al servirlos. |
| `coding` | `{ language:"javascript", starterCode, testCases:[{label,input,expected,isPublic,weight}…] }` | `{ code }` | Al menos **un caso con `isPublic:true`** (el servidor lo exige). Envía además **`weight`** por caso de modo que la **suma sea igual a `points`** (reparte `points / n` y deja el resto en el último). El estudiante ve los casos públicos y solo cuántos hay ocultos. |

Genera los `id` en el cliente (`a`, `b`, `c`… o `opt1`, `b1`, `left1`…), únicos dentro de la pregunta.

**Qué hacer** en `crear.vue` (y componentes nuevos bajo `components/docente/exercise-builders/`, uno por tipo):
- Un selector **«Tipo de ejercicio»** con los seis tipos; al cambiar, se muestra el formulario mínimo de ese tipo
  (tabla de arriba) y se conservan clase, unidad, título, dificultad, puntos, intentos y enunciado.
- Validación en el cliente **antes** de enviar, con mensajes concretos («Marca cuál es la opción correcta», «El
  hueco b2 no aparece en el código», «Une todos los ítems con un destino»).
- Envío en este orden: `POST /activities` → `POST /activity-questions` (con `points` = `totalPoints`). Si la segunda
  falla, **`DELETE /activities/:id`** para no dejar un borrador huérfano y muestra el error real. Solo si ambas
  salen bien, y con la casilla **«Publicar ahora» (activada por defecto)**, `PATCH /activities/:id/publish`. El botón
  debe decir lo que hace («Guardar borrador» / «Guardar y publicar»).
- Tras crear, la lista de actividades de la unidad se recarga (ya existe) y el formulario vuelve a su estado inicial.
- **No** edites preguntas de actividades ya creadas ni ofrezcas varias preguntas por actividad.

**Riesgo:** medio-alto (seis formularios y una regla de puntaje). Mantén cada formulario como componente aparte y
cubre con la prueba de §24.3 los seis tipos.

---

### T3 — Administración de usuarios: registrar, desactivar y restablecer contraseña

**Defecto.** En `/admin` el botón **«+ Registrar Usuario»** no tiene acción; no hay forma de **desactivar o
reactivar** una cuenta ni de **restablecer una contraseña**. No existe «olvidé mi contraseña» (el sistema no envía
correos): el camino es que el admin la restablezca.

**Contrato del backend (ya hecho).** Todo con rol `admin`.
- `POST /users` `{ email, password, fullName }` → crea la cuenta **siempre como estudiante**, activa. Contraseña:
  mínimo 6 caracteres con mayúscula, minúscula y número o símbolo (mismo mensaje del registro). Correo repetido →
  `409`. Para otro rol, después `PATCH /users/:id/role` `{ role }` (ya integrado en el panel).
- `PATCH /users/:id` `{ isActive?, password?, fullName?, email?, role? }` (parcial). En esta tarea usa **solo
  `isActive` y `password`**. La contraseña nueva se guarda cifrada. `isActive:false` cierra las sesiones de esa
  cuenta **de inmediato** (se revalida en cada petición) y el login responde «Usuario inactivo».
- **Autoprotección:** un admin **no** puede desactivar su propia cuenta ni cambiar su propio rol (`403`, mensaje
  «No puedes cambiar tu propio rol ni desactivar o eliminar tu propia cuenta»).
- `GET /users` ya devuelve `isActive` por usuario (la columna «Estado» existe).
- **No expongas `DELETE /users/:id`**: para retirar a alguien se desactiva.

**Qué hacer** en `pages/admin/index.vue` (pestaña «Gestión de Usuarios»):
- **«+ Registrar Usuario»** abre un diálogo (nombre, correo, contraseña con ver/ocultar) y opcionalmente el rol
  inicial: crear con `POST /users` y, si eligió docente o admin, `PATCH /users/:id/role`. Cuenta nueva aparece en la
  lista sin recargar. Muestra los errores reales (`409`, contraseña débil).
- Por fila: **«Desactivar» / «Reactivar»** con diálogo de confirmación que diga qué pasa («X no podrá iniciar
  sesión»). En la fila del propio admin, el control va deshabilitado con explicación visible.
- Por fila: **«Restablecer contraseña»**: diálogo con campo de contraseña nueva y botón «Generar» (aleatoria que
  cumpla la política). Tras el `200`, **muestra la contraseña una sola vez** con botón «Copiar» y el aviso
  «Entrégasela por un canal seguro; la persona debe cambiarla en Mi perfil». No la guardes en el estado tras cerrar.
- En `pages/auth/login.vue`, bajo el botón de entrar, el texto fijo «¿Olvidaste tu contraseña? Pídele a tu docente o
  al administrador que la restablezca.» (sin enlace ni formulario).

**Riesgo:** bajo-medio. **No** muestres nunca contraseñas existentes ni prometas correos.

---

### T4 — «Mi perfil» para los tres roles

**Defecto.** Ningún usuario puede cambiar su nombre ni su contraseña: no hay pantalla.

**Contrato del backend (ya hecho).** Cualquier usuario autenticado; el id sale del token, nunca de la URL.
- `PATCH /users/me` `{ fullName }` (texto no vacío, máx. 150). Solo `fullName`: correo, rol y estado no se editan.
- `PATCH /users/me/password` `{ currentPassword, newPassword }` → `{ message }`. `newPassword`: mínimo 6 con
  mayúscula, minúscula y número o símbolo. Contraseña actual incorrecta → `401` («La contraseña actual es
  incorrecta»). No cierra otras sesiones abiertas.

**Qué hacer:**
- Un componente compartido `components/perfil/Form.vue` (se usa como `<PerfilForm />`) con dos tarjetas: **Datos**
  (nombre editable; correo y rol solo lectura) y **Cambiar contraseña** (actual, nueva, confirmar; coincidencia
  validada en el cliente; ver/ocultar).
- Tres páginas delgadas que solo eligen el layout: `pages/estudiante/perfil.vue` (`layout: 'student'`),
  `pages/docente/perfil.vue` (`'teacher'`) y `pages/admin/perfil.vue` (`'admin'`). Así **`middleware/auth.global.ts`
  no cambia** (ya deja pasar `/<rol>/…` a su rol).
- En `components/layout/HeaderNav.vue`, dentro del menú del avatar y antes de «Cerrar sesión», un enlace **«Mi
  perfil»** a `` `${homeRoute}/perfil` `` (`homeRoute` ya existe en el componente).
- Tras guardar el nombre, actualiza el usuario del store de sesión (`authStore.user.fullName`, o `hydrateUser()`)
  para que el encabezado muestre el nombre nuevo sin recargar. Tras cambiar la contraseña, limpia los tres campos y
  muestra confirmación persistente (no un `alert`).

**Riesgo:** bajo.

---

### T5 — Gestión de la clase por el docente

**Defecto.** En `/docente/clase/:id` solo hay «exigir aprobación» y las matrículas; el docente no puede corregir el
nombre ni la descripción de su clase.

**Contrato del backend (ya hecho).**
- `PATCH /class/:id` con cualquiera de `{ name?, description?, code?, requiresApproval? }`. **No acepta** `isActive`,
  fechas ni cupo (el servidor responde `400` por campo no permitido): esta fase no puede archivar una clase ni
  fijarle cupo. Solo la dueña; si no, `409` («No tienes permiso para modificar esta clase»).
- `DELETE /class/:id` es un **borrado definitivo** que arrastra módulos, temas y matrículas: **no lo expongas**.

**Qué hacer** en `pages/docente/clase/[classId].vue`:
- Una tarjeta **«Datos de la clase»** con nombre y descripción editables (envía solo lo cambiado; nombre no vacío),
  botón «Guardar» deshabilitado sin cambios o en curso, y confirmación visible.
- El **código de ingreso** se muestra de solo lectura con botón «Copiar» (cambiarlo dejaría inservible el código que
  el docente ya repartió, y el servidor no comprueba que siga siendo único).
- Al volver a `/docente` la lista debe mostrar el nombre nuevo (vuelve a pedir `GET /class/my-classes`).

**Riesgo:** bajo.

---

### 24.3 Cómo verificar

| Tarea | Prueba |
|---|---|
| T1 | Como docente con una clase **nueva** (créala en `/docente`): en `/docente/contenidos` aparece «Nuevo módulo»; crea módulo → tema → unidad → dos lecciones (una con `**negrita**` y un bloque ```` ``` ````). El módulo sale como «Borrador»; como estudiante matriculado en esa clase **no aparece** en el menú. Publica el módulo: aparece; abre la unidad y se ve el título y el texto formateado. Oculta una lección: el estudiante ya no la ve. Sube/baja una lección y recarga: el orden se conserva. Pega `<script>alert(1)</script>` en una lección: al guardar desaparece del texto devuelto y no se ejecuta. En Red: `POST /sections`, `/topic`, `/learning-unit`, `/content`, `PATCH /content/:id`, `POST /content/reorder`. |
| T2 | Para **cada uno de los seis tipos**: como docente crea el ejercicio (marca «Publicar ahora») y como estudiante matriculado ábrelo en `/estudiante/evaluacion/<id>`; entrega **correcto** y **incorrecto** (usa dos intentos). Esperado con 20 puntos: `mcq` correcto **20/20** aprobado, incorrecto **0/20**; `fill_code` con 2 huecos, ambos bien **20/20**, uno bien **10/20**; `drag_drop` y `matching` con 4 elementos, 3 bien **15/20**; `ordering` exacto **20/20**, cualquier otro **0/20**; `coding` con 2 casos de peso 10, correcto **20/20**. Con `coding`, el estudiante ve solo los casos públicos y «N caso(s) privado(s)». Fuerza un fallo de `POST /activity-questions` (por ejemplo un `mcq` sin opción correcta saltando la validación desde la consola): la actividad no queda en la lista (hubo `DELETE /activities/:id`). Sin marcar «Publicar ahora»: el ejercicio queda en borrador y el estudiante no lo ve. |
| T3 | Como admin: «Registrar Usuario» crea una cuenta y aparece en la lista; el mismo correo otra vez muestra el `409`. Desactívala: en otra ventana esa persona ya no entra («Usuario inactivo»); reactívala: entra. En la fila del propio admin, desactivar está deshabilitado. Restablece su contraseña: se muestra una vez, la persona entra con ella y tras cerrar el diálogo ya no se puede ver de nuevo. |
| T4 | Con un usuario de cada rol: «Mi perfil» en el menú del avatar. Cambia el nombre: el encabezado lo muestra sin recargar. Contraseña actual equivocada → mensaje del servidor (`401`); contraseña nueva débil → mensaje de política; correcta → confirmación y, al cerrar sesión, entra con la nueva. Las tres rutas `/estudiante/perfil`, `/docente/perfil`, `/admin/perfil` cargan con su layout; una ruta ajena (`/docente/perfil` como estudiante) redirige a su inicio. |
| T5 | Como docente dueño: cambia nombre y descripción de la clase, guarda y recarga: se conservan; en `/docente` se ve el nombre nuevo. El código no se puede editar y «Copiar» funciona. En Red solo viaja lo que cambió (`PATCH /class/:id` con un campo). |

`npx nuxi typecheck` debe terminar en código 0 tras cada tarea.

### 24.4 Criterios de cierre

- [ ] Las pruebas de §24.3 hechas en navegador real, con lo observado anotado en el informe (incluida la nota
      obtenida en cada uno de los seis tipos de T2).
- [ ] `npx nuxi typecheck` en código 0.
- [ ] Cinco commits, uno por tarea, en la rama `feat/fase-24`, y Pull Request abierto.
- [ ] Informe en `docs/antigravity/informes/` con `TEMPLATE_INFORME.md`, **solo con lo que hiciste y viste**.

### 24.5 Fuera de alcance

Cambios en el backend · rediseño visual · tipo `ai_evaluated` · varias preguntas por actividad · editar preguntas de
actividades ya creadas · lecciones de video, PDF o imagen · borrar módulos, temas, unidades, clases o usuarios ·
archivar una clase, fijarle cupo o fechas · cambiar de padre un módulo, tema, unidad o lección · «olvidé mi
contraseña» por correo · edición del correo o del rol desde «Mi perfil» · la página `docente/clase/:id/analitica`.
