# STIRE — Informe de Sesión Antigravity

**Código de Documento:** INF-AGY-2026-09-16-01  
**Fecha:** 2026-09-16  
**Hora de Ejecución:** 07:30–07:48 (UTC-5)  
**Agente / Asistente:** Antigravity (Google DeepMind)  
**Ambiente:** Desarrollo Local (`localhost`)  
**Stack Activo:** Nuxt 3 (Frontend `:3000`) + NestJS (Backend `:3001`) + MariaDB (`basestire`)  
**Cambios de Backend (§16.0c y §17.1):** Declarados en §3.1 y §3.2 (`src/seeds/seed-runner.ts` y `src/activities/activities.service.ts`).  

---

## 1. Resumen Ejecutivo

Esta sesión ejecutó la totalidad del **§17 de `PLAN_IMPLEMENTACION.md`** (*"Categorías reales de tipo de actividad — peso examen vs. práctica"*), implementando la ponderación diferenciada del Mastery según la naturaleza pedagógica de la actividad:

1. **Backend — Sembrado Aditivo de Tipos de Actividad (§17.1):**
   - Se agregaron las categorías **`TALLER`** (Taller de Código, `baseWeight: 1.5`) y **`PARCIAL`** (Parcial / Evaluación, `baseWeight: 3.0`) en `src/seeds/seed-runner.ts` mediante el patrón `findOrCreate`.
   - Se renombró cosméticamente el tipo base `AUTO-EVAL` (`baseWeight: 1.0`) a *"Práctica Formativa"*.
   - Se verificó contra la base de datos real que las **15 actividades sembradas previamente conservaron intacto su `activityTypeId: 10`** original, preservando la integridad del historial de cálculo de dominio.

2. **Backend — Corrección en Recategorización de Actividades (§16.0c):**
   - Al ejecutar pruebas de integración se detectó un bug en `ActivitiesService.update()`: TypeORM priorizaba la entidad relacional `activity.activityType` cargada en memoria sobre el ID modificado, impidiendo actualizar el `activityTypeId` mediante `PATCH /activities/:id`.
   - Se corrigió en `src/activities/activities.service.ts` eliminando la referencia cacheada `activity.activityType` durante la mutación.
   - Las suites de prueba `src/activities/` pasaron con **20/20 tests en verde** y `nest build` finalizó con **exit code 0**.

3. **Frontend — Selector de Categoría Pedagógica y Ponderación (§17.2):**
   - **Formulario de Creación (`DOC-V03` `crear.vue`):** Se agregó un selector `<select id="create-activity-type">` visible, enlazado reactivamente a `activityTypeId`, mostrando para cada opción el nombre y multiplicador real (ej: *"Taller de Código (peso 1.5×)"*, *"Parcial / Evaluación (peso 3×)"*).
   - Se incluyó texto de ayuda pedagógico bajo el selector: *"Los talleres y parciales pesan más en el dominio del estudiante que la práctica libre — úsalo para reflejar evaluaciones reales, no para inflar el Mastery."*
   - **Modal de Edición (`crear.vue`):** Se integró el selector para permitir a los docentes recategorizar ejercicios existentes vía `PATCH /activities/:id`.
   - **Tabla de Actividades de la Unidad (`crear.vue`):** Se incorporó la columna *"Categoría / Peso"* en la tabla de ejercicios para visualizar de un vistazo la tipología y factor de ponderación de cada actividad.

4. **Verificación de Calidad y Tipado (§17.4):**
   - `npx nuxi typecheck`: **Exit code 0** (0 errores de TypeScript).
   - `npm run build` (Backend): **Exit code 0** (0 errores de compilación NestJS).
   - `npm test src/activities/`: **20 passed, 20 total**.
   - Verificación E2E en vivo (`scratch/test-fase17.js`): Creación con `TALLER` (status 201, ID #63), recategorización a `PARCIAL` (status 200, weight 3.0 verificado en BD), e integridad de las 15 actividades preexistentes confirmada.

---

## 2. Plan de Implementación Ejecutado

**Referencia maestra:** [`docs/antigravity/PLAN_IMPLEMENTACION.md §17`](../PLAN_IMPLEMENTACION.md#L198)

| # | Módulo / Componente | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| §17.1 | `src/seeds/seed-runner.ts` | Sembrado de tipos TALLER (1.5) y PARCIAL (3.0), AUTO-EVAL intacto | ✅ Completado |
| §17.2 | `frontend-nuxt/pages/docente/ejercicios/crear.vue` | Selector de categoría y peso en creación con texto de ayuda | ✅ Completado |
| §17.2 | `frontend-nuxt/pages/docente/ejercicios/crear.vue` | Selector en modal de edición (`PATCH /activities/:id`) | ✅ Completado |
| §17.2 | `frontend-nuxt/pages/docente/ejercicios/crear.vue` | Columna "Categoría / Peso" en tabla de actividades | ✅ Completado |
| §16.0c | `src/activities/activities.service.ts` | Corrección para permitir actualización de `activityTypeId` | ✅ Completado (20/20 tests) |
| §17.4 | Integración E2E (`test-fase17.js`) | Prueba contra base de datos y endpoints reales | ✅ Completado |
| §17.4 | Tooling / QA | `npx nuxi typecheck` + `npm run build` + `npm test` | ✅ Exit code 0 en todos |

---

## 3. Cambios de Backend Realizados (§16.0c y §17.1)

### 3.1. Tipos de Actividad Aditivos en Seeder (`src/seeds/seed-runner.ts:220-255`)
- Se incluyeron los llamados `findOrCreate` para registrar `TALLER` (`baseWeight: 1.5`) y `PARCIAL` (`baseWeight: 3.0`).
- No se tocó ninguna de las relaciones de actividades existentes.

### 3.2. Corrección en `ActivitiesService.update()` (`src/activities/activities.service.ts:140-153`)
- **Síntoma:** Una petición `PATCH /activities/:id` con `{ activityTypeId: 12 }` retornaba status 200 pero la columna `activityTypeId` en base de datos no cambiaba si la actividad ya tenía una relación `activityType` cargada en memoria por TypeORM.
- **Causa Raíz:** TypeORM prioriza el objeto de relación anidado `activity.activityType` frente al campo escalar `activity.activityTypeId` al persistir con `save()`.
- **Acción Correctiva:**
  ```ts
  this.activitiesRepo.merge(activity, updateActivityDto);
  if (updateActivityDto.activityTypeId) {
    activity.activityTypeId = updateActivityDto.activityTypeId;
    delete (activity as any).activityType;
  }
  ```
- **Test de Regresión:** Verificado mediante suite Jest oficial `npm test src/activities/` (2 suites, 20 pruebas aprobadas) y script de integración en caliente `test-fase17.js`.

---

## 4. Estado de Conectividad y Endpoints Verificados

| Método | Endpoint | Payload / Parámetros | HTTP Status | Resultado Verificado |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/activity-types` | `Bearer <Toscano_JWT>` | `200 OK` | Devuelve `AUTO-EVAL` (1.0), `TALLER` (1.5), `PARCIAL` (3.0) |
| `POST` | `/activities` | `activityTypeId: 11` (`TALLER`) | `201 Created` | Actividad #63 creada con peso 1.5x |
| `POST` | `/activity-questions` | `activityId: 63`, type `coding` | `201 Created` | Pregunta técnica asociada con casos de prueba |
| `PATCH` | `/activities/63` | `{ activityTypeId: 12 }` (`PARCIAL`) | `200 OK` | Recategorizada a Parcial con peso 3.0x en BD |
| `GET` | `/activities/63` | `Bearer <Toscano_JWT>` | `200 OK` | Valida `activityTypeId: 12`, `baseWeight: 3.0` |
| `GET` | `/activities?limit=100` | `Bearer <Toscano_JWT>` | `200 OK` | Confirma que 15 actividades originales preservan ID 10 |

---

## 5. Pruebas de Calidad (QA) y Verificación

```bash
# 1. Typecheck Frontend
$ npx nuxi typecheck
[nuxt:tailwindcss] i Using default Tailwind CSS file
Exit code: 0 (0 errores)

# 2. Build Backend
$ npm run build
> stire@0.0.1 build
> nest build
Exit code: 0 (0 errores)

# 3. Tests Backend
$ npm test src/activities/
PASS src/activities/activities.service.spec.ts (9.059 s)
PASS src/activities/activities.controller.e2e-spec.ts (10.15 s)
Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
Time:        11.909 s
```

---

## 6. Próximos Pasos & Recomendaciones

1. **Monitoreo de Mastery:** El cálculo de dominio en `mastery.calculator.ts` ya consume automáticamente `activityType.baseWeight`. Con la siembra de talleres (1.5x) y parciales (3.0x), las futuras actividades creadas por docentes generarán un impacto proporcionalmente mayor y más representativo en las calificaciones de los estudiantes.
2. **Evaluaciones Sumativas:** Para la creación de exámenes formales, incentivar el uso de la categoría *"Parcial / Evaluación"* para asegurar la separación pedagógica entre práctica formativa y evaluación sumativa.
