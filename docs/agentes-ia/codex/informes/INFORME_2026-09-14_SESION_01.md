# STIRE — Informe de sesión Codex

**Código de Documento:** INF-CDX-2026-09-14-01  
**Fecha:** 2026-09-14  
**Entorno:** Codex CLI  
**Rama de trabajo:** main (árbol sin commit)

---

## 1. Resultado

| Fase | Commit | Resultado |
| :--- | :--- | :--- |
| D | Pendiente de mensaje de commit aprobado | Migración MariaDB con clave generada e índice único; ante `ER_DUP_ENTRY`/`23000` el servicio relee y devuelve el intento activo. |
| E | Pendiente de mensaje de commit aprobado | `POST /submissions/start` y `POST /submissions/:id/run` exigen matrícula `ACTIVE` en la clase propietaria. |
| F | Pendiente de mensaje de commit aprobado | Un fallo de listeners de `submission.graded` se registra y no convierte una calificación persistida en error para el estudiante. |

---

## 2. Evidencia automatizada

```
> stire@0.0.1 build
> nest build
```

Prueba focalizada ejecutada con `--forceExit` porque Jest mantiene handles abiertos preexistentes:

```
Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        6.199 s, estimated 7 s
Ran all test suites matching src/submissions/__tests__/submissions.service.spec.ts.
EXIT=0
```

Se inició `npm test -- --runInBand --forceExit`; la sesión de terminal no devolvió su código de salida final antes de cerrarse, por lo que no se declara como evidencia de cierre de la suite completa.

La migración fue aplicada en la BD de desarrollo. `npm run migration:show` devolvió:

```
[X] 9 AddActiveSubmissionConstraint1789100000000
```

La restricción se comprobó también contra MariaDB dentro de una transacción revertida: la primera inserción `IN_PROGRESS` para una pareja estudiante/actividad válida fue aceptada y la segunda fue rechazada como `ER_DUP_ENTRY` con estado SQL `23000`.

---

## 3. Cambios principales por fase

### Fase D

- `src/migrations/1789100000000-AddActiveSubmissionConstraint.ts`: columna generada que vale `1` solo para `in_progress` e índice único sobre estudiante, actividad y esa columna. Los intentos finalizados producen `NULL`, por lo que no colisionan entre sí.
- `src/submissions/submissions.service.ts`: captura de violación única de MariaDB y relectura del intento concurrente.
- `src/submissions/__tests__/submissions.service.spec.ts`: regresión para duplicado de inserción.

### Fase E

- `src/submissions/submissions.module.ts`: registro del repositorio `Enrollment`.
- `src/submissions/submissions.service.ts`: resolución de la jerarquía actividad→unidad→tema→sección→clase y consulta de matrícula activa antes de iniciar o ensayar código.
- `src/submissions/__tests__/submissions.service.spec.ts`: regresiones de 403 para inicio y ensayo sin matrícula activa.

### Fase F

- `src/submissions/submissions.service.ts`: emisión encapsulada en `try/catch`, con contexto de submission, estudiante y actividad. Se preserva el orden correcto commit→emit y se documenta que un outbox es el siguiente paso si el problema se vuelve frecuente.
- `src/submissions/__tests__/submissions.service.spec.ts`: el servicio devuelve la calificación `GRADED` incluso si falla un listener.

---

## 4. Verificación en navegador real

No ejecutada en esta sesión.

---

## 5. Verificación manual pendiente

- Ejecutar la suite completa `npm test`, `cd frontend-nuxt && npx nuxi typecheck` y conservar sus salidas completas.
- En navegador real, confirmar que un estudiante matriculado puede iniciar normalmente y que `pedro.estudiante@unicor.edu.co` recibe 403 al usar una actividad de una clase ajena, también con `POST /submissions/:id/run`.

---

## 6. Publicación

No se realizó commit, push ni PR: `CLAUDE.md` exige un mensaje de commit aprobado antes de crear commits y confirmación explícita antes de publicar.
