# Informe — Fase 28: editar las respuestas de un ejercicio

**Rama:** `feat/fase-28` · **Quién la ejecutó:** Claude Code (no Antigravity), el 30/09/2026 · **Plan:** `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-30.md`

## Qué se hizo, por tarea

| Tarea | Qué queda | Commit |
|---|---|---|
| **T1** | Los 7 editores de `components/docente/exercise-builders/` exponen `load(config)`, la inversa de `validateAndGetConfig`. La lectura del `config` guardado es defensiva (`utils/exerciseConfig.ts`): un ejercicio raro no rompe el diálogo. | `2a9c924` |
| **T2** | El diálogo «Editar ejercicio» de `UnitExercisesPanel.vue` tiene la sección «Respuestas del ejercicio» con el editor de su tipo ya cargado. Editable: guarda `PATCH /activities/:id` y después `PATCH /activity-questions/:id` (mismo enunciado y mismos puntos). Con entregas: aviso con el número y «Duplicar como variante», sin editor. Mientras carga: `Loader2`. Si la carga falla: `messageOf`. | `3560a5a` |
| **T3** | Tras «Duplicar como variante» el foco va a la sección de respuestas, que trae la invitación «Esta es una copia…». Si se guarda sin cambiar el `config`, se guarda igual y avisa «La variante quedó igual al original…». | `3560a5a` |
| **T4** | «Ver como el estudiante» en la sección usa `DocenteExercisePreview` con el `config` que está en el editor. | `3560a5a` |
| Corrección | Solo se monta el editor del tipo del ejercicio; el foco vuelve al botón que abrió el diálogo. | `231f42d` |

T2, T3 y T4 comparten el mismo diálogo y van en un solo commit, no en tres: separarlos habría dejado commits intermedios
con el diálogo a medias.

## Un error que encontré y corregí

Los editores de los otros seis tipos, ocultos con `v-show`, tenían campos `required` vacíos. Chrome no puede enfocarlos
(`An invalid form control with name='' is not focusable`) y bloqueaba el envío del formulario: **«Guardar» no hacía
nada**. Mi primera prueba no lo detectó porque abrir y guardar sin cambios deja el `config` igual haya guardado o no.
Por eso la prueba final comprueba que se envía `PATCH /activity-questions/:id` y que responde 200.

## Lo verificado (28.4)

Build local de `feat/fase-28` contra el **backend real de producción** (`stire-unicor.duckdns.org`), en Chrome real, con
`docente.simulacion` en su clase de prueba `SIM-6V738W` y con Laura para el caso con entregas. **40/40 comprobaciones a
1440 px y 40/40 a 375 px; la consola de Chrome sin errores y sin respuestas de error del servidor.**

1. Los 7 tipos (opción múltiple, código, HTML/CSS, ordenar, emparejar, arrastrar, completar): «Editar» carga el editor con
   sus datos, «Guardar» sin tocar nada envía el `PATCH` y deja el `config` equivalente (mismas opciones, misma respuesta
   correcta, mismos casos públicos y ocultos, mismas reglas).
2. Opción múltiple: cambiar la respuesta correcta y guardar queda en el servidor.
3. Duplicar como variante: el foco va a «Respuestas del ejercicio», aparece la invitación, «Ver como el estudiante»
   muestra la vista previa, guardar sin cambios avisa que quedó igual, y cambiar una opción guarda el cambio sin aviso.
4. Ejercicio de ALGO-203413 con entregas (8): el diálogo muestra «Este ejercicio ya tiene 8 entregas…» y «Duplicar como
   variante», sin editor. El servidor responde 409 a un `PATCH` directo a esa pregunta. No se guardó nada ahí.
5. HTML/CSS con una regla sin ID: el diálogo no se cierra, muestra el error y no guarda nada. Escape cierra el diálogo.

Capturas en `informes/fase-28/`: `1440_variante.png`, `1440_variante_vista.png`, `1440_aviso_igual.png`,
`1440_bloqueado.png` y `375_variante.png`.

`npx nuxi typecheck` exit 0, `npm run generate` sin error, `npm run build` exit 0 y `npm test` 89 suites / 875 pruebas.

## Lo que no se pudo hacer o queda pendiente

- **No hay prueba automática de `load(config)` de cada editor:** los editores son componentes `.vue` y Jest no compila
  `frontend-nuxt/`. Se prueba la lectura defensiva (`exercise-config.frontend.spec.ts`, 5 casos) y el recorrido completo
  en Chrome, que repite los 7 tipos.
- **Las pruebas en Chrome no se ejecutaron sobre Vercel** sino sobre el build local de la rama contra producción (la rama
  aún no estaba desplegada). Conviene repetir una pasada corta sobre `stire-soft.vercel.app` tras la unión a `main`.
- **En 375 px la «✕» de eliminar opción queda pegada al borde** de la tarjeta (estilo del editor de opción múltiple, ya
  existía en «Crear ejercicio»); no se tocó.
- **La comparación «variante igual al original» ignora el reparto de pesos** si se cambian los puntos en un ejercicio de
  código: en ese caso nunca avisa. Es un falso negativo aceptado.
- En la clase de prueba `SIM-6V738W` quedaron los ejercicios `F28 …` y varias variantes de prueba (borrables).
