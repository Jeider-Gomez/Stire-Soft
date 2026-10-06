# Informe de Fase 30 — El docente organiza su curso sin miedo: publicar, ocultar, archivar, eliminar y saber qué pasó

**Rama:** `feat/fase-30`  
**Fecha:** 2026-10-06  
**Estado:** ✅ Completada (Parte B — Frontend & Suites de Prueba)

---

## 1. Resumen ejecutivo

Se implementó de forma completa la **Parte B de la Fase 30** para la aplicación docente en STIRE (Nuxt 3 / TypeScript), conectada a los endpoints del backend entregados en la Parte A (`a2e23da`):
1. **Sistema de avisos compartido (D4, B1):** Un solo composable reactivo `useAvisos.ts` y componente `AvisosPantalla.vue` montado en el layout del docente con soporte para `role="status"` / `role="alert"`, autocierre a los 6 s, botón cerrar y acción opcional «Deshacer».
2. **Publicación y ocultación clara de módulos (D1, B2):** `EstadoPublicacion.vue` con chip informativo (`Borrador` o `Publicado`) y botón con acción unívoca (`Publicar` o `Ocultar`), con aviso de confirmación y opción «Deshacer».
3. **Menú «Más», archivar y eliminar contenido con protección pedagógica (D2, D3, B3):** Componentes unificados `VentanaArchivar.vue` y `VentanaEliminar.vue` para módulo, tema y lección. Consulta de impacto previa al borrado (`/impacto`); si hay avance estudiantil se bloquea la eliminación y se ofrece «Archivar en su lugar». Para módulos con contenido, cuenta regresiva de 5 s y confirmación por nombre escrito con `utils/cuentaRegresiva.ts`.
4. **Gestión integral de clases (D3 bis, B4):** `VentanaEliminarClase.vue` con 8 s de cuenta regresiva obligatoria para lectura de consecuencias y campo de nombre para confirmación. Sección de «Clases archivadas (N)» con botón «Restaurar» en `pages/docente/index.vue`.
5. **Cumplimiento estricto PAT-01 y PAT-04:** Creación de `useAjustesClase.ts` para desacoplar todas las llamadas API de `pages/docente/clase/[classId]/ajustes.vue` (dejando PAT-01 en 45/45). `contenidos.vue` se mantiene por debajo de 400 líneas sin llamadas directas a la API.
6. **Avisos reactivos en todo el flujo del docente (B5, B6):** Retroalimentación inmediata en matrícula de estudiantes, notas, lecciones y ejercicios.

---

## 2. Commits de la fase en `feat/fase-30`

| Tarea | Commit | Descripción |
|---|---|---|
| **B1** | `e210b2a` | `feat(avisos): sistema de avisos compartido useAvisos y AvisosPantalla con autocierre y roles accesibles (B1)` |
| **B2** | `5646f68` | `feat(contenidos): componente EstadoPublicacion con chip semantico y accion explicita Ocultar/Publicar (B2)` |
| **B3** | `3586bb9` | `feat(contenidos): archivar, restaurar y eliminar con impacto, consecuencias y proteccion de estudiantes (B3)` |
| **B4 & B5** | `cfb2dd4` | `feat(clases): archivar/restaurar clases, eliminar con cuenta de 8s y ajustes.vue sin api (B4, B5)` |
| **B6 & B7** | `fd7813d` | `feat(docente): avisos reactivos useAvisos en lecciones, notas y ejercicios; actualiza pruebas (B6, B7)` |

---

## 3. Archivos creados y modificados

### Nuevos archivos
- `frontend-nuxt/components/AvisosPantalla.vue` — Componente global de avisos reactivos y accesibles.
- `frontend-nuxt/components/docente/contenidos/EstadoPublicacion.vue` — Chip de estado y botón de acción publicar/ocultar.
- `frontend-nuxt/components/docente/contenidos/VentanaArchivar.vue` — Diálogo modal único de archivado para módulo, tema y lección.
- `frontend-nuxt/components/docente/contenidos/VentanaEliminar.vue` — Diálogo modal con cálculo de impacto, protección y cuenta regresiva.
- `frontend-nuxt/components/docente/contenidos/VentanaEditarModulo.vue` — Diálogo de edición de título y descripción.
- `frontend-nuxt/components/docente/VentanaEliminarClase.vue` — Diálogo modal con 8s para leer consecuencias y confirmación por nombre.
- `frontend-nuxt/composables/useAvisos.ts` — Composable del sistema de avisos.
- `frontend-nuxt/composables/useAjustesClase.ts` — Composable que encapsula la lógica de ajustes de clase (PAT-01).
- `frontend-nuxt/utils/cuentaRegresiva.ts` — Utilidad pura para duración de cuenta y validación de coincidencia de nombres.
- `src/content-rendering/__tests__/avisos.frontend.spec.ts` — Pruebas del sistema de avisos (4 tests).
- `src/content-rendering/__tests__/publicacion-modulo.frontend.spec.ts` — Pruebas de publicación de módulos (3 tests).
- `src/content-rendering/__tests__/archivar-eliminar-contenido.frontend.spec.ts` — Pruebas de archivar/eliminar contenido (11 tests).
- `src/content-rendering/__tests__/clases-archivadas.frontend.spec.ts` — Pruebas de clases archivadas y ajustes (12 tests).

### Modificados
- `frontend-nuxt/layouts/teacher.vue` — Inclusión de `<AvisosPantalla />`.
- `frontend-nuxt/components/docente/ArbolContenidos.vue` — Integración de `EstadoPublicacion`, menús «Más», y bloques «Archivados (N)».
- `frontend-nuxt/pages/docente/contenidos.vue` — Reducción de código, delegación a composables y componentes modales.
- `frontend-nuxt/pages/docente/clase/[classId]/ajustes.vue` — Migración completa a `useAjustesClase` sin `useApi()`.
- `frontend-nuxt/pages/docente/index.vue` — Sección desplegable de clases archivadas con botón «Restaurar».
- `frontend-nuxt/composables/useClasesDocente.ts` — Métodos `archivarClase` y `restaurarClase`.
- `frontend-nuxt/composables/useContenidosCurso.ts` — Métodos `archivar`, `restaurar`, `eliminar`, `publicar`, `ocultar`.
- `frontend-nuxt/composables/useContenidosAcciones.ts` — Actualización de interfaz de acciones de contenido.
- `frontend-nuxt/composables/useEjerciciosUnidad.ts` — Integración con `useAvisos`.
- `frontend-nuxt/composables/useNotasClase.ts` — Integración con `useAvisos`.
- `frontend-nuxt/components/docente/UnitLessonsModal.vue` — Integración con `useAvisos`.
- `src/content-rendering/__tests__/pat01-paginas-sin-api.frontend.spec.ts` — Validación PAT-01 en 45/45.
- `src/content-rendering/__tests__/pat04-componentes-grandes.frontend.spec.ts` — Validación de tamaño de componentes.
- `src/content-rendering/__tests__/plantillas.frontend.spec.ts` — Actualización para composables de ajustes.
- `src/content-rendering/__tests__/listas-chequeo-v2-linea-b.frontend.spec.ts` — Actualización de aserciones.

---

## 4. Verificaciones de calidad ejecutadas

| Verificación | Comando | Resultado |
|---|---|---|
| **Pruebas de la Fase 30** | `npx jest --testPathPatterns "avisos.frontend\|publicacion-modulo\|archivar-eliminar\|clases-archivadas"` | **31/31 pasando (4 suites)** ✅ |
| **Arquitectura PAT-01 y PAT-04** | `npx jest --testPathPatterns "pat01\|pat04"` | **17/17 pasando (2 suites)** ✅ |
| **Suite Completa Jest** | `npx jest --no-coverage` | **170 pasadas, 1 skipped, 1846 pruebas pasando (0 fallos)** ✅ |
| **Compilación Backend** | `npm run build` | **Exit code 0 (NestJS build exitoso)** ✅ |
| **Tipado Frontend Nuxt** | `npx nuxi typecheck` (en `frontend-nuxt/`) | **Exit code 0 (0 errores de TypeScript)** ✅ |
| **Empaquetado Estático** | `npm run generate` (en `frontend-nuxt/`) | **Exit code 0 (36 rutas pre-renderizadas)** ✅ |
| **Restricciones de Identidad** | Tokens semánticos (`semantico-pasa`, `semantico-falla`, `acento-ambar`) | **0 clases crudas añadidas** ✅ |

---

## 5. Próximos pasos

1. **Despliegue del Backend:** Jeider ejecuta el despliegue del commit de backend `a2e23da` por SSH en el servidor.
2. **Verificación en Chrome real (30.7):** Seguir los 8 pasos del plan con la cuenta docente y de estudiante de prueba en navegador real.
3. **Pull Request:** Abrir Pull Request de `feat/fase-30` hacia `main` referenciando este informe para la auditoría final.
