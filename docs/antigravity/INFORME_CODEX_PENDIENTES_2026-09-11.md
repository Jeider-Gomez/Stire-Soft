# Informe Codex — pendientes STIRE-Soft

**Fecha:** 2026-09-11  
**Entorno:** Codex ejecutado dentro de Antigravity  
**Rama:** `codex-pendientes`

## Resultado

Se implementaron las tres fases descritas en `docs/codex/PLAN_IMPLEMENTACION.md`, en commits independientes:

| Fase | Commit | Resultado |
|---|---|---|
| A | `7284492` | Recomendación de siguiente actividad por aprobación y selector manual de sesión. |
| B | `7aa51e8` | Moderación de matrículas con `PENDING`, aprobación, rechazo, remoción, migración y pantalla docente. |
| C | `5788201` | Currículo idempotente para Castro y Ali: módulo, dos unidades y progresión MCQ → FILL_CODE → CODING por unidad. |

## Evidencia automatizada

- Fase A: `src/learning-progress/__tests__/learning-progress.service.spec.ts` — **19 pruebas pasando**.
- Fase B: `src/enrollment/enrollment.service.spec.ts` — **6 pruebas pasando**.
- `npm run build` de Nest completó y generó `dist` sin errores de TypeScript.
- `nuxi typecheck` del frontend completó sin errores reportados.
- El árbol de trabajo quedó limpio antes de agregar este informe.

## Cambios principales

### Fase A

- Nuevo endpoint `GET /learning-progress/student/:studentId/unit/:unitId/next-activity`.
- Selecciona la actividad publicada de menor `order` no aprobada.
- Reutiliza la fórmula normalizada: `(score / totalPoints) * 100 >= passingScore`.
- Devuelve la última actividad con `allCompleted: true` cuando todas fueron aprobadas.
- La pantalla de unidad incluye “Continuar donde quedaste” y “Elegir yo mismo”.

### Fase B

- Nuevo estado `EnrollmentStatus.PENDING`.
- `Class.requiresApproval` con valor por defecto `false`.
- Endpoints docentes para pendientes, aprobación, rechazo y remoción.
- Todos verifican propiedad mediante `AuthorizationService.assertTeacherOwnsClass`.
- Migración: `src/migrations/1789000000000-AddApprovalToClasses.ts`.

### Fase C

- Helper idempotente en `src/seeds/seed-runner.ts`.
- Castro recibe contenido de algoritmia y lógica computacional.
- Ali recibe contenido de desarrollo frontend interactivo.
- Cada clase recibe un módulo, dos unidades y tres actividades publicadas por unidad.

## Verificación manual pendiente

No fue posible completar el recorrido navegador ni ejecutar el seed contra MariaDB en esta máquina:

1. Docker no está disponible: el daemon `docker_engine` no está ejecutándose.
2. La instancia MariaDB accesible en `localhost:3306` rechaza el cliente `mysql2` con:
   `Server requests authentication using unknown plugin auth_gssapi_client`.
3. Por seguridad, no se ejecutó `migration:run` contra esa base ni se modificó su configuración.

Para cerrar la verificación en Antigravity, iniciar una MariaDB compatible, ejecutar la migración y correr dos veces `npm run seed`; después levantar backend y frontend y verificar los flujos de estudiante y docente en navegador real.

## Publicación

La rama de trabajo se publica en GitHub como `origin/codex-pendientes`. No se modifica `main` ni se abre un pull request automáticamente.
