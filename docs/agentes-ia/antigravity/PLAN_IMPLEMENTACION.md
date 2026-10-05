---
estado:     pendiente — Fase 30 (escrita el 2026-10-05)
verificado: 2026-10-05 contra src/ y frontend-nuxt/ reales (main @ 50d22c8 + cambios sin commit)
fuente:     normativo (insumo de arranque para Google Antigravity)
---

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

### 30.1 Punto de partida: hay trabajo a medias SIN commit (léelo primero)

En el árbol de trabajo hay cambios que nadie ha commiteado. **No los borres; tampoco los commitees tal cual.** Úsalos
como borrador y corrige lo que se indica:

| Archivo | Qué trae | Qué está mal |
|---|---|---|
| `frontend-nuxt/pages/docente/contenidos.vue` | Ítems «Eliminar módulo…», «Eliminar tema…» y «Eliminar lección…» en el menú «Más»; 3 ventanas de confirmación con `AdminDialogo`; botón «Publicar» (ámbar) / «Publicado» (verde, rojo al pasar el mouse) | (1) Llama a la API desde la página (`api.del`), y esta crece 206 líneas: rompe PAT-01 y PAT-04, porque contenidos.vue había quedado en 389. (2) `hover:bg-red-50`, `text-red-700`: colores crudos fuera de la identidad visual. (3) El estado solo se entiende al pasar el mouse, y en el celular no hay mouse. (4) No dice cuánto se pierde (estudiantes con avance, entregas). |
| `frontend-nuxt/pages/docente/clase/[classId]/ajustes.vue` | Aviso de éxito al aprobar, rechazar o quitar un estudiante; ventana para confirmar «Quitar de la clase»; sección «Estado y gestión de la clase» con «Archivar clase» y «Eliminar clase…» | (1) «Archivar clase» envía `isActive`, pero `UpdateClassDto` **no lo acepta**: el backend responde 400 (`forbidNonWhitelisted`). (2) El aviso de éxito es local de esta página; hace falta uno compartido. (3) También llama a la API desde la página. |
| `src/topic/topic.controller.ts`, `topic.service.ts` | `DELETE /topic/:id?permanent=true` → `deletePermanent` borra el tema y sus lecciones | **Peligroso.** `learning_progress` y `review_schedules` tienen `onDelete: 'CASCADE'` hacia la lección: borrar una lección **borra en silencio el avance de los estudiantes**. Además, `activities` hacia la lección **no** tiene cascada, así que con ejercicios el borrado falla con 500. Sin pruebas. |
| `src/learning-unit/learning-unit.controller.ts` | El docente puede hacer `DELETE /learning-unit/:id` (antes solo el admin) | El mismo problema: cascada sobre el avance y 500 si hay ejercicios. Sin pruebas. |

`DELETE /sections/:id` ya existe para el docente (`section.service.ts:152`) y tiene el mismo defecto: las lecciones no
se borran en cascada con sus temas, así que un módulo con contenido falla con 500. Esto ya se documentó en
`class.service.ts:260`. Por eso **`DELETE /class/:id` bloquea a propósito** cuando la clase tiene módulos (409, con un
mensaje claro). Ese es el patrón que hay que seguir.

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

**D4 · Toda acción del docente termina con un aviso.** Hay un solo sistema de avisos para toda la app:
`composables/useAvisos.ts` más `components/AvisosPantalla.vue`, montado en `layouts/default.vue` o en el layout del
docente.
- Cada aviso tiene: tipo (`exito` / `error` / `info`), texto y, opcionalmente, una acción «Deshacer».
- Se cierra solo a los 6 s (los de error no se cierran solos), tiene botón cerrar (`X`, `aria-label="Cerrar aviso"`) y
  se apila arriba a la derecha en el computador y abajo, encima de la barra, en el celular.
- No tapa el botón del Tutor.
- Respeta `prefers-reduced-motion`.

### 30.4 Parte A — backend (Claude Code; Antigravity solo la consume)

- **A1. Eliminar seguro.** `DELETE /sections/:id`, `DELETE /topic/:id?permanent=true` y `DELETE /learning-unit/:id`
  funcionan así:
  - En una transacción borran en orden: contenidos, preguntas, ejercicios, lecciones, temas y módulo.
  - **Responden 409** si alguna lección afectada tiene `learning_progress`, `submissions` o `review_schedules`, con el
    texto «N estudiantes tienen avance aquí: archívalo para no perderlo».
  - Las pruebas cubren tres casos: vacío borra, con avance da 409 sin borrar nada, y un docente ajeno da 403.
  - Se corrige el trabajo sin commit de 30.1.
- **A2. Archivar y restaurar módulos.**
  - Migración: columna `sections.isActive` (por defecto `true`).
  - Rutas: `PATCH /sections/:id/archivar` y `/restaurar`.
  - El estudiante no ve módulos archivados. El docente los recibe con `isActive: false`.
  - Los temas ya se archivan (`topic.isActive`); se añade `PATCH /topic/:id/restaurar`.
  - Las lecciones (`learning_units.isActive`): se añaden `archivar` y `restaurar`.
- **A3. Archivar y restaurar clases.** `PATCH /class/:id/archivar` y `/restaurar` (rutas explícitas; no se agrega
  `isActive` al DTO general).
  - Una clase archivada no aparece en el inicio del estudiante y no acepta entregas ni ingresos con el código.
  - El docente la ve en «Archivadas».
- **A4. Impacto antes de borrar.** `GET /sections/:id/impacto`, `GET /topic/:id/impacto`,
  `GET /learning-unit/:id/impacto` y `GET /class/:id/impacto` devuelven:

  ```ts
  { temas: number; lecciones: number; ejercicios: number; estudiantesConAvance: number; entregas: number; sePuedeEliminar: boolean; motivo?: string }
  ```

- **A5. Despliegue.** Claude Code avisa cuando A1 a A4 estén en `main`; Jeider despliega por SSH. Hasta entonces la
  Parte B no se une a `main`.

### 30.5 Parte B — frontend (Antigravity)

**B1. Avisos compartidos (D4).**
- Crea `useAvisos.ts` (`avisar({ tipo, texto, deshacer? })`, `cerrar(id)`, lista reactiva con como mucho 3 avisos a
  la vista) y `AvisosPantalla.vue`, y móntalo en el layout.
- Cambia el aviso local de `ajustes.vue` (`toastExito`) y el `actionFeedback` de `contenidos.vue` por `avisar(...)`.
- Prueba: el aviso aparece con `role="status"`, se va a los 6 s, «Deshacer» llama a su función y el de error tiene
  `role="alert"` y no se cierra solo.

**B2. Publicar / Ocultar (D1)** en el encabezado de cada módulo de `contenidos.vue`, con un componente
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
- Saca de `contenidos.vue` las funciones `confirmarEliminar*` y `ejecutarEliminar*` del borrador.

**B4. Clases: archivar y eliminar.**
- En `ajustes.vue` se mantiene la sección «Estado y gestión de la clase» del borrador, conectada a A3 y A4. Eliminar
  pide escribir el nombre de la clase (D3).
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
6. Archiva la clase (el estudiante ya no la ve) y restáurala. Luego elimina una clase vacía escribiendo su nombre.
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
