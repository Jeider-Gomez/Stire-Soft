---
estado:     completada — Fase 30 (2026-10-06)
verificado: 2026-10-06 contra src/ y frontend-nuxt/ reales (main @ a2e23da: Fase H de Codex y Parte A ya en main)
fuente:     normativo (insumo de arranque para Google Antigravity)
---

> **Archivado el 2026-10-06 — nota de la auditoría de Claude Code.** Parte A (backend) de Claude Code (`a2e23da`,
> `6efbda0`). Parte B de Antigravity (`e210b2a`…`4b13d08`), auditada con el código y recorriendo la fase en el navegador
> contra el backend y la base locales (14 pasos, 0 errores de JavaScript). Se corrigieron 9 defectos:
> - Contenido pedía los temas a `/topic/section/:id` (solo los activos): un tema archivado desaparecía y no se podía
>   restaurar.
> - Si fallaba el cálculo del impacto, las ventanas asumían «se puede eliminar» (la de clase, además, una clase vacía).
> - El error al eliminar se guardaba y no se mostraba; archivar desde «Eliminar» quitaba el ítem del árbol.
> - «Ocultar» sin confirmación y sin «Deshacer»; eliminar clase sin «Cancelar» visible durante la cuenta.
> - Tres ventanas llamaban a la API (PAT-01); `dark:` sin configurar en los avisos; botón de 36 px en el celular,
>   «Pub.»/«Bor.» y concordancia de género.
> Las pruebas están en `src/content-rendering/__tests__/fase30-auditoria.frontend.spec.ts`.


# Plan de implementación para Antigravity — Fase 30

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 29 están hechas y archivadas en
[`docs/_archivo/`](../../_archivo/). **No las leas para ejecutar esta fase.**

## 30. Fase 30 — el docente organiza su curso sin miedo: publicar, ocultar, archivar, eliminar y saber qué pasó

### 30.0 En una línea

Jeider probó STIRE como docente (05/10) y encontró cuatro problemas:
- no puede eliminar un módulo, un tema ni una clase;
- el botón «Publicado / Borrador» no se entiende: no dice si es un estado o una acción;
- al quitar un estudiante no aparece nada que diga «listo»;
- no hay forma de archivar módulos ni clases para guardarlos sin borrarlos.

Esta fase deja al docente **organizar su curso con confianza**:
- cada acción dice qué va a pasar antes de hacerla;
- lo que borra datos de estudiantes se protege;
- lo que se puede deshacer se puede deshacer;
- cada acción confirma que salió bien.

### 30.1 Punto de partida (06/10): qué hay ya en `main`

Tres cosas pasaron antes de que empieces. Léelas, porque cambian dónde trabajas:

1. **Borrador `949c06e`** (05/10, sin pruebas ni revisión): los ítems «Eliminar módulo… / tema… / lección…» en el menú
   «Más», tres ventanas de confirmación y el botón «Publicar» (ámbar) / «Publicado» (verde, rojo al pasar el mouse) en
   Contenido; en Ajustes de la clase, el aviso de éxito local (`toastExito`), la confirmación de «Quitar de la clase» y la
   sección «Estado y gestión de la clase». **Es el punto de partida, no lo deshagas a ciegas.** Lo que está mal:
   - colores crudos fuera de la identidad (`hover:bg-red-50`, `text-red-700`);
   - el estado de publicación solo se entiende al pasar el mouse (en el celular no hay mouse);
   - las ventanas no dicen cuánto se pierde;
   - «Archivar clase» envía `isActive` al `PATCH /class/:id` y recibe **400**;
   - hay tres ventanas casi iguales en vez de una.
2. **Fase H de Codex** (06/10, PAT-01/PAT-04): `contenidos.vue` ya **no llama a la API** y el árbol pasó a un
   componente. Trabaja sobre estos archivos, no sobre una versión vieja:
   - `components/docente/ArbolContenidos.vue`: el árbol (módulos, temas y lecciones, el botón de publicación y los
     menús «Más»), 226 líneas. Recibe el estado y las funciones de la página por props.
   - `composables/useContenidosAcciones.ts`: hoy solo `eliminarModulo`, `eliminarTema` y `eliminarLeccion`. Agrégale
     `impacto`, `archivar` y `restaurar`, o muévelas a `useContenidosCurso`, sin duplicar.
   - `pages/docente/contenidos.vue`: 407 líneas. Con las ventanas nuevas en componentes debe bajar de 400.
   - **Única página que sigue llamando a la API:** `pages/docente/clase/[classId]/ajustes.vue`. Muévela a un
     composable `useAjustesClase.ts` y quítala de `PAGINAS_CON_API` en
     `src/content-rendering/__tests__/pat01-paginas-sin-api.frontend.spec.ts`: PAT-01 queda en 45/45.
   - Hay dos pruebas-trinquete que no pueden empeorar:
     - `pat01-paginas-sin-api`;
     - `pat04-componentes-grandes` (ningún `.vue` nuevo de más de 300 líneas sin motivo).
3. **Parte A del backend** (06/10, commit `a2e23da`): hecha y probada (30.4). **Usa esas rutas; no inventes otras.**

### 30.2 Reglas

1. **Parte A (backend) va primero y es de Claude Code.** Antigravity empieza la Parte B cuando la Parte A esté en
   `main` y **desplegada** en el servidor: el `ValidationPipe` rechaza campos nuevos si el backend no está actualizado.
   Si Jeider te pide hacer también la Parte A, cada punto lleva su prueba en `src/**/*.spec.ts` y migración probada
   con run → revert → run.
2. **No edites `tailwind.config.ts`, `assets/css/main.css` ni `assets/css/temas.css`** (identidad visual de José).
   Usa solo los tokens existentes:
   - `semantico-pasa` (verde, éxito o publicado);
   - `semantico-falla` (rojo, solo eliminar);
   - `semantico-info` (azul);
   - `acento-ambar` y `acento-ambar-fuerte` (advertencia: ocultar o archivar);
   - `base-*`.

   **Prohibido** `red-*`, `green-*`, `amber-*` y hex sueltos. `npm run check:identidad` debe pasar.
3. **La página no habla con la API** (PAT-01): las llamadas van en composables (`useContenidosCurso`,
   `useClasesDocente`, o uno nuevo `useAjustesClase`). **`contenidos.vue` no pasa de 400 líneas** (PAT-04): las
   ventanas nuevas van en `components/docente/contenidos/`.
4. **Iconos con `lucide-vue-next`**, nunca emojis. **Sin dependencias nuevas.** Sin `any`, `as any` ni `@ts-ignore`.
   La prueba `sin-any.frontend.spec.ts` tiene un techo de 35 `any` que no puede subir.
5. **Textos en español, en estilo de oración**, que digan la consecuencia en términos del docente. Por ejemplo, «Tus 12
   estudiantes dejarán de ver este módulo», no «Se cambiará isPublished».
6. **Accesible:**
   - las ventanas sobre `AdminDialogo`, con el foco inicial en «Cancelar» y Escape para cerrar, devolviendo el foco
     al botón que la abrió;
   - controles de 44 px en el celular;
   - nada que se entienda solo por el color o solo al pasar el mouse;
   - los avisos con `role="status"` (o `role="alert"` si es un error).
7. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-30`; se une a `main` con Pull Request.
   Antes de cada commit:
   - `npm run build` y `npm test` en la raíz;
   - `npx nuxi typecheck` (exit 0) y `npm run generate` en `frontend-nuxt/`.
8. **«Verificado» = probado en Chrome real** (30.7), a 1440 y 375 px, en tema claro y oscuro (Perfil → «Apariencia y
   lectura»). Usa la cuenta `laura.martinez.docente@example.com` y **una clase de prueba creada para esto**. **Nunca**
   pruebes eliminar en las clases reales de la prueba del equipo: ALGO-203413 (Pedro) y PENSAR-ALGO (Julio).
9. **Para.** No sigas acumulando cambios y escribe el informe si pasa cualquiera de estas cosas:
   - el build o las pruebas fallan dos veces seguidas por la misma causa;
   - una tarea exige tocar un archivo prohibido;
   - el backend no tiene un endpoint que este plan da por hecho.

### 30.3 Decisiones de diseño (ya tomadas; no las cambies sin avisar)

**D1 · Publicar es un estado más una acción, nunca un interruptor ambiguo.** Cada módulo muestra, en este orden:

| Estado | Etiqueta (no es botón) | Acción visible (botón) |
|---|---|---|
| Borrador | Chip gris `base-*` con ícono `EyeOff`: «Borrador · los estudiantes no lo ven» | Botón **«Publicar»**, verde `semantico-pasa` relleno, ícono `Eye` |
| Publicado | Chip verde `semantico-pasa/10` con ícono `Check`: «Publicado» | Botón **«Ocultar»**, borde `acento-ambar-fuerte` y texto oscuro (advertencia), ícono `EyeOff` |

- «Publicar» se hace sin confirmación y da el aviso «Módulo publicado: tus estudiantes ya lo ven» con «Deshacer».
- «Ocultar» pide una confirmación corta: «Tus N estudiantes dejarán de ver este módulo. Su avance no se pierde».
- En el celular el chip y el botón van en una sola fila; si no caben, el texto del chip se acorta a «Borrador» o
  «Publicado».
- Comprueba el contraste del texto blanco sobre `semantico-pasa`. Si axe marca menos de 4.5:1, usa
  `semantico-pasa/15` con texto oscuro.

**D2 · Archivar es lo normal; eliminar es la excepción.** Archivar guarda todo (contenido, notas, avance) y se puede
restaurar. Eliminar es permanente y **solo se permite si nadie ha trabajado ahí**. En el menú «Más» de módulo, tema,
lección y clase el orden es siempre el mismo:
1. «Editar…»;
2. «Archivar…» (ícono `Archive`, texto normal);
3. un separador;
4. «Eliminar…» (ícono `Trash2`, `semantico-falla`).

- Si el backend dice que no se puede eliminar (409), la ventana no muestra «Sí, eliminar». Explica por qué («3
  estudiantes tienen avance en este módulo») y ofrece **«Archivar en su lugar»**.
- Lo archivado se ve al final de su nivel, en un bloque plegado «Archivados (N)», con «Restaurar» en cada uno.

**D3 · Antes de eliminar, la ventana dice exactamente qué se pierde.** Por ejemplo: «Se eliminarán 4 temas, 11
lecciones y 23 ejercicios». Los números vienen del backend (A4), no se calculan en el navegador.
- Para eliminar una **clase** o un **módulo con contenido**, el docente escribe el nombre para confirmar (patrón de
  GitHub); el botón se habilita solo cuando coincide.
- Para un tema o una lección basta el botón.

**D3 bis · Tiempo para leer antes de eliminar una clase** (pedido de Jeider, 06/10: una clase creada por error se
puede eliminar, pero quien la elimina tiene que leer primero las consecuencias). La ventana de **eliminar clase**:
1. **Muestra las consecuencias en una lista corta, con los números del backend** (`GET /class/:id/impacto`). Por
   ejemplo:
   - «Se eliminarán 3 módulos, 10 temas, 17 lecciones y 122 ejercicios.»
   - «2 estudiantes matriculados perderán el acceso a la clase» (campo `matriculados`; si es 0, no se muestra).
   - «Esto no se puede deshacer. Si solo quieres guardarla, archívala.»
   Debajo, el botón **«Archivar en su lugar»**, siempre visible.
2. **Cuenta regresiva de 8 segundos** (la mitad si el impacto da 0 módulos y 0 matriculados: clase vacía) antes de
   habilitar «Sí, eliminar la clase»:
   - Se muestra como una barra o anillo que se vacía y el número de segundos que faltan. El botón dice «Lee antes de
     continuar (8)» → «(7)» … y al llegar a 0 cambia a «Sí, eliminar la clase».
   - El botón se habilita solo cuando terminó la cuenta **y** el nombre escrito coincide. Las dos condiciones se ven
     (por ejemplo: «Escribe el nombre de la clase para confirmar»).
   - **«Cancelar» y Escape funcionan siempre**, también durante la cuenta. Si se cierra y se vuelve a abrir, la cuenta
     empieza de nuevo.
   - La cuenta empieza cuando llega el impacto, no al abrir la ventana: mientras dice «Calculando…» no corre.
   - **Accesible:** el número no se anuncia cada segundo. Hay un `aria-live="polite"` que dice una vez «Podrás eliminar
     en 8 segundos» y otra vez «Ya puedes eliminar». El botón deshabilitado lleva `aria-disabled` y el motivo en
     `aria-describedby`. Con `prefers-reduced-motion`, sin animación: solo el número.
   - La lógica va en una utilidad pura con prueba, `utils/cuentaRegresiva.ts`: segundos según el impacto, y
     «¿se puede confirmar?» = cuenta en 0 y nombre igual, sin distinguir mayúsculas ni espacios de los bordes. La
     ventana solo la usa.
3. **Si `sePuedeEliminar` es falso** (ya hay trabajo de estudiantes), no hay cuenta ni campo de nombre: se muestra el
   `motivo` y el único botón principal es «Archivar la clase».

Para **eliminar un módulo con contenido** se usa el mismo componente, con 5 segundos.

**D4 · Toda acción del docente termina con un aviso.** Hay un solo sistema de avisos para toda la app:
`composables/useAvisos.ts` más `components/AvisosPantalla.vue`, montado en `layouts/default.vue` o en el layout del
docente.
- Cada aviso tiene: tipo (`exito` / `error` / `info`), texto y, opcionalmente, una acción «Deshacer».
- Se cierra solo a los 6 s (los de error no se cierran solos), tiene botón cerrar (`X`, `aria-label="Cerrar aviso"`) y
  se apila arriba a la derecha en el computador y abajo, encima de la barra, en el celular.
- No tapa el botón del Tutor.
- Respeta `prefers-reduced-motion`.

### 30.4 Parte A — backend: HECHA (commit `a2e23da`, 06/10)

Claude Code la hizo con 19 pruebas nuevas, la migración probada (run → revert → run) y el SQL real comprobado en
MariaDB. **Antigravity solo la consume.** Rutas, todas solo para el docente dueño o el admin:

| Qué | Ruta | Respuesta |
|---|---|---|
| Impacto antes de borrar | `GET /sections/:id/impacto`, `GET /topic/:id/impacto`, `GET /learning-unit/:id/impacto`, `GET /class/:id/impacto` | `{ modulos, temas, lecciones, ejercicios, estudiantesConAvance, entregas, sePuedeEliminar, motivo? }` |
| Eliminar | `DELETE /sections/:id`, `DELETE /topic/:id?permanent=true`, `DELETE /learning-unit/:id`, `DELETE /class/:id` | 204/200; **409** con `motivo` si hay trabajo de estudiantes (en la clase cuentan también proyectos, notas, asistencia, refuerzos y entregas) |
| Archivar | `PATCH /sections/:id/archivar`, `PATCH /topic/:id/archivar`, `PATCH /learning-unit/:id/archivar`, `PATCH /class/:id/archivar` | El objeto con `isActive: false`. El módulo archivado también queda `isPublished: false` |
| Restaurar | `PATCH /sections/:id/restaurar`, `PATCH /topic/:id/restaurar`, `PATCH /learning-unit/:id/restaurar`, `PATCH /class/:id/restaurar` | `isActive: true`. El módulo vuelve **como borrador** (el docente lo publica cuando quiera) |
| Publicar u ocultar | `PATCH /sections/:id/publish` (ya existía, alterna) | **409** si el módulo está archivado: «restáuralo antes de publicarlo» |

Reglas que ya cumple el backend y que la interfaz debe reflejar:
- **Qué cuenta como trabajo de estudiantes:** avance con intentos o dominio, envíos, repasos y valoraciones. Abrir una
  lección no cuenta.
- **El `motivo` del 409** viene listo para mostrarlo tal cual. Por ejemplo: «3 estudiantes tienen avance aquí.
  Archívalo para no perder su trabajo.» En la clase: «3 estudiantes tienen avance aquí. Archiva la clase para no perder su
  trabajo.»
- **Una clase creada por error se puede eliminar** aunque tenga módulos, si nadie trabajó en ella (06/10). El impacto
  de la clase trae además `matriculados`: los estudiantes que perderán el acceso. La ventana debe advertirlo (D3 bis).
- **Una clase archivada** sale del inicio del estudiante y el estudiante ya no entra a su contenido (403 «Tu docente
  archivó esta clase.»). El docente la sigue recibiendo en `GET /class/my-classes` con `isActive: false`.
- **El docente recibe los módulos, temas y lecciones archivados** con `isActive: false` en `GET /sections/class/:id`.
  El bloque «Archivados (N)» se arma con eso.
- **Despliegue:** Jeider despliega el backend por SSH. **No unas la Parte B a `main` hasta que Jeider confirme el
  despliegue.**

### 30.5 Parte B — frontend (Antigravity)

**B1. Avisos compartidos (D4).**
- Crea `useAvisos.ts` (`avisar({ tipo, texto, deshacer? })`, `cerrar(id)`, lista reactiva con como mucho 3 avisos a
  la vista) y `AvisosPantalla.vue`, y móntalo en el layout.
- Cambia el aviso local de `ajustes.vue` (`toastExito`) y el `actionFeedback` de `contenidos.vue` por `avisar(...)`.
- Prueba: el aviso aparece con `role="status"`, se va a los 6 s, «Deshacer» llama a su función y el de error tiene
  `role="alert"` y no se cierra solo.

**B2. Publicar / Ocultar (D1)** en el encabezado de cada módulo (`components/docente/ArbolContenidos.vue`), con un componente
`components/docente/contenidos/EstadoPublicacion.vue`.
- La acción va en `useContenidosCurso` (ya existe `alternarPublicacion`: sepárala en `publicar` y `ocultar`).
- Quita el `hover:bg-red-*` del borrador.
- Prueba: con `isPublished: false` se ve el chip «Borrador» y el botón «Publicar»; con `true`, el chip «Publicado» y
  el botón «Ocultar»; no hay clases `red-`, `green-` ni `amber-`.

**B3. Menú «Más» completo (D2)** en módulo, tema y lección, con el orden fijo.
- Las ventanas van en `components/docente/contenidos/VentanaArchivar.vue` y `VentanaEliminar.vue`: **una sola de
  cada una**, que recibe `nivel: 'modulo' | 'tema' | 'leccion'`. No hagas tres copias como el borrador.
- `VentanaEliminar`:
  - pide el impacto (A4) al abrirse;
  - muestra «Calculando…» y luego los números;
  - si `sePuedeEliminar` es falso, muestra el motivo y «Archivar en su lugar».
- Bloque «Archivados (N)» plegado, con «Restaurar».
- Las llamadas van en `useContenidosCurso`: `archivar(nivel, id)`, `restaurar`, `impacto`, `eliminar`.
- Saca de `contenidos.vue` las funciones `confirmarEliminar*` y `ejecutarEliminar*` del borrador `949c06e`.

**B4. Clases: archivar y eliminar.**
- En `ajustes.vue` se mantiene la sección «Estado y gestión de la clase» del borrador, conectada a A3 y A4. Eliminar
  usa la ventana de D3 bis: consecuencias, nombre escrito y cuenta regresiva de 8 s, en
  `components/docente/VentanaEliminarClase.vue`. Quita del borrador el texto «Solo se puede eliminar si la clase no
  contiene módulos», que ya no es cierto.
- En `pages/docente/index.vue`:
  - las tarjetas de clases activas como hoy;
  - debajo, «Clases archivadas (N)» plegado, con «Restaurar»;
  - el chip «Inactiva» pasa a decir «Archivada».
- Las llamadas van en `useClasesDocente` o en un `useAjustesClase` nuevo, no en la página.
- Al eliminar, se vuelve a `/docente` con el aviso «Clase eliminada».

**B5. Estudiantes de la clase.** Se mantiene la confirmación de «Quitar de la clase» del borrador:
- aviso «Quitaste a Nombre de la clase» con «Deshacer», que vuelve a matricularlo si el backend lo permite;
- si no lo permite, sin «Deshacer»;
- «Aprobar» y «Rechazar» también dan su aviso.

**B6. Avisos en el resto del docente.** Donde hoy se guarda algo sin confirmación visible, se agrega `avisar`:
- crear o editar tema y lección;
- guardar ajustes de la clase;
- guardar notas;
- publicar o archivar un ejercicio;
- copiar del banco.

Busca cada `await api.` o llamada a composable en `pages/docente/**` y `components/docente/**` que no termine en un
mensaje.

**B7. Pruebas.** En `src/content-rendering/__tests__/`, con el patrón `*.frontend.spec.ts` que ya existe (leer el
`.vue` o transpilar el `.ts` y comprobar propiedades). Como mínimo:
- `avisos.frontend.spec.ts`;
- `publicacion-modulo.frontend.spec.ts`;
- `archivar-eliminar-contenido.frontend.spec.ts` (contenidos.vue sin `api.` y con 400 líneas o menos; las ventanas
  con foco inicial en «Cancelar»; «Eliminar» siempre al final y en `semantico-falla`);
- `clases-archivadas.frontend.spec.ts`.

Actualiza, sin debilitarlas, las que hoy leen `contenidos.vue`:
- `contenidos-dividido`;
- `clase-pestanas`;
- `listas-chequeo-seguimiento`;
- `plantillas`.

### 30.6 Fuera de esta fase

- Arrastrar para reordenar.
- Papelera con recuperación de lo eliminado.
- Eliminar cuentas de estudiantes.
- Archivar por lotes.
- Cambiar los colores o tokens de la identidad, que son de José.

Si te parecen necesarios, anótalos en el informe.

### 30.7 Verificación en Chrome (obligatoria, con capturas)

Contra el backend desplegado, cuenta `laura.martinez.docente@example.com` (la clave te la da Jeider; nunca la escribas en el repositorio, que es público), en una **clase de prueba nueva** («Prueba Fase 30»):

1. Crea 2 módulos, con 2 temas y 2 lecciones cada uno. Publica uno: chip «Publicado» y aviso. Ocúltalo: confirmación,
   chip «Borrador» y aviso. Tiene que verse igual de claro a 375 px, sin mouse.
2. Archiva un tema: desaparece, aparece en «Archivados (1)», se restaura y vuelve igual.
3. Elimina una lección vacía: la ventana dice «0 estudiantes con avance»; se elimina con aviso.
4. Con `sebastian.vargas@example.com` (estudiante) entra a la clase de prueba y avanza una lección. Como docente,
   intenta eliminar ese módulo: **no deja**, dice por qué y ofrece «Archivar en su lugar».
5. Quita al estudiante de la clase: confirmación, aviso «Quitaste a…» y «Deshacer».
6. Archiva la clase (el estudiante ya no la ve) y restáurala. Crea otra clase «Creada por error» con un módulo y una
   lección, y elimínala: la ventana lista las consecuencias y el botón no se habilita hasta que pasan los 8 segundos
   **y** escribes el nombre. Con la clase de prueba donde avanzó el estudiante: no deja eliminar y ofrece archivar.
7. Todo lo anterior solo con el teclado (Tab, Enter, Escape) y en tema oscuro: nada blanco sobre blanco y el foco
   siempre visible.
8. axe DevTools en Contenido y Ajustes: 0 problemas nuevos.

Guarda las capturas en `docs/agentes-ia/antigravity/informes/fase-30/` (1440 y 375 px, claro y oscuro).

### 30.8 Hecho cuando

- [ ] B1 a B7 commiteados en `feat/fase-30`, cada uno con su prueba, y `npm test` en verde.
- [ ] `contenidos.vue` con 400 líneas o menos y sin `api.`; `ajustes.vue` sin `api.`; ningún `any` nuevo;
      `check:identidad` en verde.
- [ ] Los 8 pasos de 30.7 hechos, con capturas.
- [ ] Informe `informes/INFORME_FASE_30.md` (plantilla `TEMPLATE_INFORME.md`): qué se hizo, qué no y por qué, los
      defectos encontrados y los commits.
- [ ] Pull Request a `main` con el informe enlazado. Claude Code lo audita antes de unir.
