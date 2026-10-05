---
estado:     pendiente — Fase H (escrita el 2026-10-05)
verificado: 2026-10-05 contra frontend-nuxt/ real (main @ 46b75eb)
fuente:     normativo (insumo de arranque para Codex)
---

# Plan de implementación para Codex — Fase H: las páginas no hablan con la API y ningún componente hace de todo

**Este archivo solo dice qué hay que hacer.** Las Fases A a G están hechas y archivadas en
[`docs/_archivo/PLAN_IMPLEMENTACION_CODEX_2026-10-05.md`](../../_archivo/PLAN_IMPLEMENTACION_CODEX_2026-10-05.md).
**No las leas para ejecutar esta fase.** Antes de tocar código, lee `CLAUDE.md` en la raíz (reglas del proyecto) y
[`docs/DISENO_ARQUITECTURA_FRONTEND.md`](../../DISENO_ARQUITECTURA_FRONTEND.md) (el criterio de esta fase).

## H.0 En una línea

El profesor evalúa STIRE con la lista de interfaz de Pressman. Dos criterios están a medias (CP):
- **PAT-01** (MVC / componentes): 27 de 45 páginas todavía llaman a la API desde la vista.
- **PAT-04** (antipatrón «The Blob»): 22 archivos `.vue` pasan de 300 líneas, y algunos mezclan datos, varias
  pantallas y varias ventanas.

Esta fase **mueve las llamadas a la API a composables por dominio** y **divide los componentes que mezclan
responsabilidades**, **sin cambiar nada de lo que ve o hace el usuario**. Es una refactorización pura.

## H.1 Reglas

1. **Cero cambios visibles.** Los mismos textos, clases CSS, orden, rutas, mensajes de error y comportamiento. Si
   encuentras un defecto, **anótalo en el informe y no lo arregles** en esta fase, salvo que la refactorización lo
   exija. En ese caso, haz un commit aparte con su prueba.
2. **No toques los archivos de otra fase en curso.** Antigravity hace la Fase 30
   (`docs/agentes-ia/antigravity/PLAN_IMPLEMENTACION.md`) sobre:
   - `pages/docente/contenidos.vue`;
   - `pages/docente/clase/[classId]/ajustes.vue`;
   - `pages/docente/index.vue`;
   - `composables/useContenidosCurso.ts` y `useClasesDocente.ts`;
   - `components/docente/contenidos/**`;
   - un `useAvisos.ts` nuevo.

   **Esos archivos no son tuyos.** Tampoco toques `components/proyectos/EditorDiagrama.vue` (ya dividido, 1322 → 791).
3. **No edites** `tailwind.config.ts`, `assets/css/main.css` ni `assets/css/temas.css` (identidad visual de José).
4. **Sin `any`, `as any` ni `@ts-ignore`.** `sin-any.frontend.spec.ts` tiene un techo de 35 que solo puede bajar.
   Sin dependencias nuevas.
5. **Errores:** los composables dejan pasar el error (`throw`) o devuelven un resultado tipado; la página decide qué
   mostrar con `useApiErrorMessage().messageOf(err, '…')`, como hoy. Nunca muestres el texto crudo de ofetch.
6. **Un commit por página o por componente**, en español, con su prueba, sin `--no-verify`. Rama
   `refactor/fase-h`; se une a `main` con Pull Request. Antes de cada commit:
   - `npm run build` y `npm test` (raíz);
   - `npx nuxi typecheck` (exit 0) y `npm run generate` (`frontend-nuxt/`).
7. **Para y escribe el informe** si pasa cualquiera de estas cosas:
   - una página no se puede mover sin cambiar su comportamiento;
   - el build o las pruebas fallan dos veces por la misma causa;
   - un cambio exige tocar un archivo de la regla 2 o 3.

## H.2 El patrón (ya probado en el proyecto; cópialo, no lo reinventes)

Ejemplos que ya funcionan (léelos antes de empezar):

| Ejemplo | Página (organiza) | Composable (habla con la API) | Componentes |
|---|---|---|---|
| Notas | `pages/docente/clase/[classId]/notas.vue` (102 líneas) | `composables/useNotasClase.ts` | `components/docente/notas/FormularioEsquema.vue`, `TablaNotas.vue` |
| Crear ejercicio | `pages/docente/ejercicios/crear.vue` | `composables/useCrearEjercicio.ts` (pedidos en paralelo con `Promise.all`) | — |
| Mensajes | `pages/estudiante/mensajes.vue`, `pages/docente/mensajes.vue` | `composables/useMensajes.ts` | `components/mensajes/*` |
| Panel del admin | `pages/admin/index.vue` (93) | `composables/useGestionUsuarios.ts` (`provide`/`inject`) | `components/admin/*` |

Forma de un composable:

```ts
// composables/useAsistenciaClase.ts
export interface SesionAsistencia { id: number; fecha: string; /* … los campos que la página ya usa */ }

/** Las llamadas de «Asistencia» de una clase (PAT-01: la página no habla con la API). */
export function useAsistenciaClase(classId: number) {
  const api = useApi()
  const sesiones = () => api.get<SesionAsistencia[]>(`/asistencia/clase/${classId}/sesiones`)
  // … una función por endpoint, tipada; lo que hoy se pide en serie y es independiente, en paralelo
  return { sesiones /* , … */ }
}
```

- La página conserva su estado (`ref`), sus `computed` y su plantilla. Solo cambia `api.get(...)` por la función del
  composable.
- Si una página repite la misma llamada que otra (por ejemplo, `/class/my-classes` aparece en 5 páginas), crea **una**
  función compartida en un composable común (`useMisClases`). No la copies cinco veces.
- Reglas puras (cálculos sin API) van en `utils/*.ts` con su prueba, como `utils/contenidosCurso.ts`.

## H.3 Las pruebas-trinquete (primer commit, antes de mover nada)

Crea dos pruebas en `src/content-rendering/__tests__/`, con el mismo estilo que `sin-any.frontend.spec.ts` (leer los
archivos y contar):

**`pat01-paginas-sin-api.frontend.spec.ts`**
- `PAGINAS_CON_API`: la lista exacta de páginas que hoy contienen `useApi()` (las 27 de H.4 y H.5). La prueba falla si
  una página que **no** está en la lista empieza a usar `useApi()` o `$fetch(`.
- Una segunda prueba falla si una página de la lista ya **no** lo usa y sigue en la lista. Así la lista solo baja: cada
  commit de H.4 quita su página.
- Una tercera prueba comprueba que ningún componente de `components/**` llama a `useApi()`, salvo los que ya lo hacen
  hoy (lístalos igual, con un techo).

**`pat04-componentes-grandes.frontend.spec.ts`**
- `GRANDES`: mapa `archivo → { lineas: número de hoy, motivo: string }` para los `.vue` de más de 300 líneas.
- Falla si aparece un archivo nuevo de más de 300 líneas que no está en el mapa, o si uno del mapa crece por encima de
  su número.
- Cada vez que se divide uno, se baja su número o sale del mapa.
- El `motivo` es obligatorio para los que se quedan grandes (por ejemplo, «lienzo y estado van juntos»).

## H.4 PAT-01 — páginas a mover, por dominio (en este orden)

Medido el 05/10 con `grep -rlF "useApi()" frontend-nuxt/pages`: 27 de 45. De esas, 2 son de Antigravity (regla 2), así
que **te tocan 25**. Las llamadas de cada página ya están listadas: no tienes que buscarlas.

**H4.1 Lo común (primero, porque lo usan varios):** `composables/useMisClases.ts` con `misClases()`, es decir
`GET /class/my-classes`, que hoy se repite en `docente/entregas/index`, `docente/refuerzos/index`,
`docente/refuerzos/nuevo`, `docente/rendimiento` y `composables/useCrearEjercicio.ts`. Usa también
`GET /sections/class/:id`, que se repite en `docente/entregas/index` y `refuerzos/nuevo`.

**H4.2 Estudiante → composables `useUnidadEstudiante`, `useInicioEstudiante`, `useEntregasEstudiante`,
`useProyectos`, `useAsistenciaEstudiante`, `useRefuerzosEstudiante`, `useClasesEstudiante`**

| Página | Líneas | Llamadas |
|---|---|---|
| `estudiante/unidad/[id].vue` | 396 | `GET /learning-unit/:id`, `/content/unit/:id`, `/activities?learningUnitId=`, `/entregas/mias?classId=`, `/learning-progress/student/:sid/unit/:id/next-activity?reto=1`, `PUT /learning-progress/unit/:id/confidence` (+1 `api.get(` multilínea: búscalo) |
| `estudiante/index.vue` | 462 | `GET /refuerzos/mios`, `/role-requests/me`, `/entregas/mias?classId=` (+1 multilínea) |
| `estudiante/entregas/[id].vue` | 198 | `GET /entregas/:id`, `/proyectos`, `/proyecto-envios/:id`, `POST /entregas/:id/empezar`, `/entregas/:id/enviar` |
| `estudiante/proyectos/index.vue` | 148 | `GET /proyectos`, `/proyectos/estado`, `POST /proyectos`, `DELETE /proyectos/:id` |
| `estudiante/proyectos/[id].vue` | 212 | `GET /proyectos/:id`, `PATCH /proyectos/:id` |
| `estudiante/clases.vue` | 281 | `GET /enrollment/my`, `POST /enrollment/join` |
| `estudiante/asistencia.vue` | 133 | `GET /asistencia/mia`, `/asistencia/mi-codigo?dispositivo=` |
| `estudiante/refuerzos/[id].vue` | 106 | `GET /refuerzos/:id`, `POST /refuerzos/:id/pasos/:i/hecho` |

⚠️ `estudiante/unidad/[id].vue` e `index.vue` tienen reglas sensibles: bloqueo suave por módulo, «Tu siguiente paso»,
«¿Qué tan seguro estás?» y el reto. Muévelas con más cuidado que las demás y conserva el orden de las llamadas cuando
una depende de otra.

**H4.3 Docente → `useAsistenciaClase`, `useResumenClase`, `useEntregasDocente`, `useRefuerzosDocente`,
`useRendimiento`**

| Página | Líneas | Llamadas |
|---|---|---|
| `docente/clase/[classId]/asistencia.vue` | 294 | `GET /class/:id`, `/asistencia/clase/:id/resumen`, `/asistencia/clase/:id/sesiones`, `/asistencia/sesiones/:id`, `POST /asistencia/clase/:id/sesiones` (+1 `api.post(` multilínea), `PATCH /asistencia/sesiones/:id`, `PUT /asistencia/sesiones/:id/estudiantes/:uid`, `DELETE /asistencia/sesiones/:id` |
| `docente/clase/[classId]/index.vue` | 174 | `GET /class/:id`, `/analytics/class/:id/heatmap`, `/analytics/class/:id/semana`, `/enrollment/class/:id/pending`, `/entregas/clase/:id`, `/refuerzos/clase/:id`. Son independientes: **en paralelo** |
| `docente/entregas/index.vue` | 131 | `my-classes` (H4.1), `GET /entregas/clase/:id`, `/sections/class/:id` |
| `docente/entregas/[id].vue` | 173 | `GET /entregas/:id`, `PATCH /entregas/:id`, `POST /entregas/:id/reabrir` |
| `docente/entregas/revision/[envioId].vue` | 226 | `GET /proyecto-envios/:id`, `PATCH` (multilínea) |
| `docente/refuerzos/index.vue` | 134 | `my-classes`, `GET /refuerzos/clase/:id`, `PATCH /refuerzos/:id/archivar` |
| `docente/refuerzos/nuevo.vue` | 277 | `my-classes`, `GET /enrollment/class/:id`, `/sections/class/:id`, `/refuerzos/clase/:id/sugerencias?lecciones=`, `POST /refuerzos` |
| `docente/rendimiento.vue` | 362 | `my-classes`, `GET /analytics/class/:id` |
| `docente/estudiante/[studentId].vue` | 298 | `GET /analytics/student/:id` |

**H4.4 Admin → `useAdminSistema`, `useCatalogoAsignaturas`, `useSugerencias`, `useResultadosSus`**

| Página | Líneas | Llamadas |
|---|---|---|
| `admin/sistema.vue` | 394 | `GET /admin/system/status`, `/admin/system/logs?level=&limit=100`, `POST /maintenance/cleanup` |
| `admin/dashboard.vue` | 393 | `GET /admin/system/status` (la misma función que sistema) |
| `admin/catalogo.vue` | 126 | `GET /asignaturas/revision`, `PATCH /asignaturas/:id`, `POST /asignaturas/distintas`, `POST /asignaturas/:id/unir` |
| `admin/sugerencias.vue` | 152 | `GET /reportes[?estado=]`, `PATCH /reportes/:id` |
| `admin/usabilidad.vue` | 105 | `GET /usabilidad/sus/resultados` |

**H4.5 Cuentas → `useCuentaPublica`** (o funciones en `stores/auth.ts` si ya existe algo parecido: revisa antes)

| Página | Llamadas |
|---|---|
| `auth/register.vue` (423) | `PUT /tutor/api-key` |
| `auth/forgot-password.vue` | `POST /auth/forgot-password` |
| `auth/reset-password.vue` | `POST /auth/reset-password` |

**Meta de H.4:** 2 de 45 páginas con `useApi()` (las 2 de Antigravity, que salen al cerrar su Fase 30). En
`DISENO_ARQUITECTURA_FRONTEND.md` §4 se actualiza la cifra.

## H.5 PAT-04 — componentes a revisar (después de H.4)

Criterio de `DISENO_ARQUITECTURA_FRONTEND.md` §1: **se divide lo que mezcla responsabilidades separables, no lo que solo
es largo.** Para cada archivo, primero escribe en el informe qué responsabilidades tiene. Divide solo si son dos o más
separables; si no, déjalo con su `motivo` en el mapa de H.3.

| Archivo | Líneas | Qué mirar (hipótesis; verifícala leyendo el archivo) |
|---|---|---|
| `components/docente/exercise-builders/HtmlCssExerciseBuilder.vue` | 645 | Editor de reglas + vista previa + formulario: probablemente 2–3 componentes |
| `components/tutor/TutorChatDrawer.vue` | 572 | Cajón, lista de mensajes, entrada, panel de clave: separar la lógica en `useTutorChat` (o en el store `tutor`) y la lista |
| `pages/estudiante/evaluacion/[activityId].vue` | 528 | Ya no llama a `useApi()` (usa stores). Ver si mezcla tipos de ejercicio que deberían ser componentes |
| `pages/estudiante/index.vue` | 462 | Después de H4.2: tarjetas del inicio («Tu siguiente paso», clases, refuerzos) como componentes |
| `components/CodeEditor.vue` | 438 | Editor CodeMirror: probablemente coherente, **dejar** con motivo salvo que veas dos cosas |
| `components/docente/CurriculumBuilderModals.vue` | 429 | Varias ventanas en un archivo: una ventana por componente sobre `AdminDialogo` |
| `pages/auth/register.vue` | 423 | Paso 1 / paso 2 del registro como componentes |
| `pages/docente/ejercicios/crear.vue` | 411 | Formulario + selector de tipo + configuración por tipo |
| `pages/estudiante/unidad/[id].vue` | 396 | Después de H4.2: bloques de la lección |
| `pages/admin/sistema.vue`, `pages/admin/dashboard.vue` | 394, 393 | Después de H4.4: estado del sistema compartido entre las dos |
| `components/docente/UnitLessonsModal.vue` | 385 | Revisar |
| `pages/docente/rendimiento.vue` | 362 | Después de H4.3 |
| `components/perfil/Form.vue` | 362 | Secciones del perfil (datos, clave del Tutor, apariencia) |
| `components/docente/LessonEditor.vue`, `components/layout/SidebarNav.vue`, `components/exercise/HtmlCssExercise.vue`, `components/docente/SelectorAsignatura.vue` | 336–324 | Revisar; probablemente se quedan con motivo |

Fuera de tu alcance (regla 2): `EditorDiagrama.vue` (791), `contenidos.vue` y `ajustes.vue` (Antigravity).

**Las ventanas nuevas** que salgan de una división se montan sobre `components/admin/AdminDialogo.vue` (foco inicial,
Tab atrapado, Escape, foco de vuelta), igual que las del admin y Contenidos.

## H.6 Verificación

Por cada página o componente movido:
- las pruebas de H.3 actualizadas;
- `npm test` en verde;
- `nuxi typecheck` 0;
- `generate` sin error.

Al final, una lista en el informe con **cada pantalla tocada y qué abrir para probarla**. Claude Code la recorre en
Chrome contra producción antes de unir (Vercel bloquea navegadores automáticos; se verifica con el build local).

Si puedes abrir un navegador, recorre tú las pantallas del estudiante con `sebastian.vargas@example.com`, las del
docente con `laura.martinez.docente@example.com` y las del admin con `admin.simulacion@example.com`. La clave te la da
Jeider; **nunca la escribas en el repositorio, que es público**. No crees ni borres datos en las clases reales de la
prueba del equipo (ALGO-203413 y PENSAR-ALGO).

## H.7 Hecho cuando

- [ ] Las dos pruebas-trinquete de H.3, en el primer commit.
- [ ] H.4: 25 páginas movidas, un commit cada una (o uno por dominio si son pequeñas), y `PAGINAS_CON_API` con 2.
- [ ] H.5: cada archivo de la tabla dividido, o con su `motivo` en `GRANDES`.
- [ ] Ningún cambio visible: los mismos textos y clases (el diff de cada plantilla `.vue` solo mueve bloques a
      componentes).
- [ ] `DISENO_ARQUITECTURA_FRONTEND.md` §4 con las cifras nuevas (PAT-01 x/45, PAT-04 y/145).
- [ ] Informe `docs/agentes-ia/codex/informes/INFORME_FASE_H.md` (plantilla `TEMPLATE_INFORME.md`): qué se movió, qué
      se dejó y por qué, los defectos vistos y no arreglados (regla 1) y la lista de pantallas para probar.
- [ ] Pull Request a `main`. Claude Code lo audita antes de unir.
