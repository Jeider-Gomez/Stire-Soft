# Informe de Auditoría — STIRE Consolidación v2

**Fecha:** 2026-09-10  
**Agente:** Antigravity (Opus 4.6)  
**Commit base:** `715b43b`  

---

## Contexto

Auditoría solicitada por el usuario tras detectar errores en sandbox (404), auto-matrícula incorrecta, admin sin datos reales, y tutor que no detecta la ubicación del estudiante.

## Hallazgos

### Bugs Críticos

1. **BUG-01 — Sandbox 404:** `POST /submissions/start` falla porque `activityId: 103` no existe en BD. El store `workspace.ts` tiene actividades hardcodeadas.
2. **BUG-02 — Admin hardcodeado:** `pages/admin/index.vue` usa array estático en vez de `GET /user`.
3. **BUG-03 — Auto-matrícula:** `student.ts` tiene `currentClassName` = `'Algoritmia y Programación I — Grupo 01'` hardcodeado. No hay flujo de selección de clase.
4. **BUG-04 — Streak falso:** `streakDays: 4` hardcodeado en `student.ts:182`.
5. **BUG-05 — Módulos estáticos:** Los módulos y unidades del dashboard están hardcodeados (no vienen de BD).

### Problemas de Diseño

1. **DIS-01 — Sin código de clase:** El registro no pide código de clase. No hay página para unirse a clases.
2. **DIS-02 — Tutor sin contexto:** `tutor-context.service.ts` solo dice nivel global, no la unidad/actividad actual.
3. **DIS-03 — Tutor lento:** No hay feedback progresivo durante la llamada al LLM.
4. **DIS-04 — Solo JavaScript:** Todo el workspace asume JS, no es didáctico para principiantes.
5. **DIS-05 — Sin seeder documentado:** `src/seeds/` vacío, credenciales no documentadas en README.

## Plan Propuesto

4 olas de implementación:

| Ola | Meta | Archivos |
|-----|------|----------|
| 1 | Sistema de clases con código + registro corregido | 5 archivos |
| 2 | Admin real + seeder con usuarios documentados | 4 archivos |
| 3 | Sandbox funcional + currículo dinámico desde BD | 4 archivos |
| 4 | Tutor inteligente con auto-detección de contexto | 4 archivos |

## Estado

⏳ **Pendiente de aprobación del usuario**
