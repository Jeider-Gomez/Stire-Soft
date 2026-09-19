# STIRE — Informe de sesión Codex

**Código de documento:** INF-CDX-2026-09-16-01  
**Fecha:** 2026-09-16  
**Entorno:** Codex CLI / PowerShell  
**Rama de trabajo:** `main` (sin commit ni push)

---

## 1. Resultado

| Fase | Commit | Resultado |
| :--- | :--- | :--- |
| G | Sin commit — pendiente de mensaje aprobado | Auditoría BOLA y rate-limiting ejecutada. Un hallazgo BOLA corregido y límites específicos añadidos. |

---

## 2. Evidencia automatizada

La política local bloqueó `npm.ps1`; se usó `npm.cmd` sin modificar la política de ejecución.

```text
> stire@0.0.1 test
> jest --runInBand
```

La suite finalizó correctamente (exit code 0).

```text
> stire@0.0.1 build
> nest build
```

El build finalizó correctamente (exit code 0).

Además, antes de la suite completa se ejecutó la regresión dirigida:

```text
> stire@0.0.1 test
> jest --runInBand src/activity-questions/activity-questions.service.spec.ts

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        20.015 s
```

---

## 3. Cambios principales — Fase G

- `src/activity-questions/activity-questions.service.ts`: `findByActivity` ahora verifica matrícula
  activa para estudiantes y rechaza actividades no publicadas antes de consultar preguntas. La
  redacción de `StudentQuestionDto` se mantiene como defensa adicional, no como sustituto de BOLA.
- `src/activity-questions/activity-questions.service.spec.ts`: regresiones para estudiante
  matriculado, estudiante ajeno (`403`) y actividad borrador (`404`).
- `src/common/authorization/route-role-metadata.spec.ts`: la excepción arquitectónica de esta ruta
  ahora declara el acotamiento real de estudiante y publicación.
- Límites de tasa específicos añadidos a registro, matrícula por código, envío de mensajes, inicio
  de intento, ejecución de sandbox y limpieza administrativa.

### Resultado del barrido BOLA

| Módulo | Resultado |
|---|---|
| activities | Sin hallazgo nuevo; filtra por rol, matrícula y propiedad. |
| activity-questions | Hallazgo corregido: faltaba matrícula del estudiante en lectura. |
| activity-types | Catálogo de referencia; exclusión deliberada del plan. |
| analytics | Sin hallazgo nuevo; valida docente-clase o docente-estudiante compartido. |
| class, section, topic | Catálogos estructurales deliberadamente autenticados; mutaciones con propiedad. |
| content | Sin hallazgo nuevo; valida propiedad, matrícula y visibilidad. |
| institution | Catálogo de referencia; escrituras solo admin. |
| notifications | Sin hallazgo nuevo; consultas y mutación acotadas al `user.id` del JWT. |
| user | Sin hallazgo nuevo; perfil propio o administración por rol. |

---

## 4. Verificación en navegador real

No ejecutada en esta sesión: no había backend, MariaDB y navegador con datos de prueba levantados.

---

## 5. Verificación manual pendiente

Con el entorno real levantado, iniciar sesión como estudiante no matriculado en una clase objetivo y
solicitar `GET /activity-questions/activity/:activityId`: debe devolver `403`. Repetir con un
estudiante matriculado y actividad publicada: debe recibir las preguntas redactadas. Confirmar
también `429` al superar el límite de `POST /submissions/:id/run` y de
`POST /maintenance/cleanup`.

---

## 6. Publicación

No se creó commit ni se hizo push: `CLAUDE.md` exige mensaje de commit aprobado y confirmación
explícita antes de publicar.
