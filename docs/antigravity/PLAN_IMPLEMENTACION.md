---
estado:     vigente — Fase 22 lista para ejecutar
verificado: 2026-09-20 contra frontend-nuxt/ y src/ reales, en navegador real
fuente:     normativo (insumo de arranque para Google Antigravity)
codigos:    Tutor IA (chat) · ADM-V01
---

# Plan de implementación para Antigravity — Fase 22

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 21 ya están hechas y archivadas en
[`docs/_archivo/`](../_archivo/) (`PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-15.md`: Fases 1 a 15;
`PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-20.md`: Fases 16 a 21). **No las leas para ejecutar esta
fase.** La numeración continúa en 22 para no romper citas.

---

## 22. Fase 22 — cuatro correcciones que salieron de auditar la Fase 21

### 22.0 En una línea

Cuatro tareas (T1 a T4), **solo en `frontend-nuxt/`**. Son defectos que Claude Code encontró probando
la Fase 21 en un navegador real. El backend está terminado; no lo toques.

### 22.1 Reglas

1. **No inventes datos:** un `null` se muestra «—», nunca `0` ni un estado positivo.
2. **No cambies estilos:** no edites `tailwind.config.ts` ni `assets/css/main.css`; usa las clases y
   tokens que ya existen (otra persona rediseñará la identidad visual en una rama aparte).
3. **Un commit por tarea**, en español, sin `--no-verify`.
4. **Verifica en navegador real con el backend levantado**, no solo con `npx nuxi typecheck`. Cada
   tarea trae su prueba en §22.3.
5. **En tu informe, cuenta solo lo que viste.** Cita únicamente endpoints que hayas visto en la pestaña
   Red, y no copies ejemplos de este plan como si fueran salida observada. (El informe de la Fase 21
   citó `GET /class/my-enrollments`, que no existe, y repitió un ejemplo del plan como resultado.)
6. Cuentas de prueba: solo las demo del [`README.md`](../../README.md) raíz. La cuenta
   `pedro.estudiante@unicor.edu.co` **no tiene clave de Google guardada**, y eso importa en T1.

---

### T1 — Aviso de repasos y botón «Ir al contenido» también para quien no tiene clave

**Defecto.** En `components/tutor/TutorChatDrawer.vue`, el aviso de repasos y el botón «Ir al contenido
de la unidad» están dentro de `<template v-else>` (el «chat normal», línea ~99). Mientras
`tutorStore.showKeyPanel` es `true`, ese bloque **no se dibuja**. Un estudiante sin clave (el estado
inicial de todos, porque la clave es opcional) solo ve el formulario de la clave y nunca ve sus repasos
vencidos ni el acceso al contenido, aunque ninguno de los dos necesita al LLM.

**Reprodúcelo:** entra como Pedro (sin clave), abre el Tutor en `/estudiante`: solo aparece el formulario.
La interfaz sí recibe los datos (`GET /tutor/guidance` devuelve `dueReviews.overdueCount: 7`); no se
pintan.

**Qué hacer.**
- Mueve el **aviso de repasos** fuera del `v-if`/`v-else` del panel de la clave, encima de ambos, para que se vea sobre el
  formulario de la clave y sobre el chat. Sin cambios en su texto, plural ni condiciones.
- Mueve el botón **«Ir al contenido de la unidad»** a la franja de contexto del panel (donde dice
  «Unidad activa: …», línea ~82), que no depende del campo de pregunta. Debe verse con clave y sin clave.
- Mantén la condición `tutorEnabled` en ambos: con el Tutor desactivado por el docente siguen ocultos.

### T2 — Escape y foco (panel del Tutor y diálogo de limpieza)

**Defecto.** La Fase 18 prometió «(Esc)» y foco atrapado, pero en la prueba: al abrir el panel del Tutor
y pulsar `Escape`, **el panel siguió abierto** (causa probable: el foco no se mueve dentro del panel y
el evento no le llega; no lo comprobé directamente). En el diálogo de confirmación de
`pages/admin/sistema.vue` (`role="dialog" aria-modal="true"`) sí lo comprobé: al abrirse, el foco queda en
`<body>` (no entra al diálogo) y `Escape` no lo cierra.

**Qué hacer.**
- **Panel del Tutor:** al abrirse, mueve el foco a un elemento dentro (el botón «Cerrar Tutor» o el
  campo de pregunta); `Escape` lo cierra; al cerrarse, el foco vuelve al botón «Tutor IA» que lo abrió.
- **Diálogo de `sistema.vue`:** al abrirse, foco en «Cancelar» (la opción segura); `Escape` cierra sin
  ejecutar; al cerrarse, el foco vuelve al botón «Ejecutar Limpieza de Mantenimiento». Tab no debe
  salir del diálogo mientras está abierto.

### T3 — El contenido de una actividad anterior se arrastra al inicio

**Defecto.** `stores/tutor.ts`, `fetchGuidanceLevel()`, toma `workspaceStore.currentExercise?.activityId`
como respaldo, y ese valor **sigue guardado al salir de la actividad**. Si el estudiante va de la
actividad 44 a `/estudiante` navegando dentro de la app (sin recargar) y abre el Tutor, se pide
`GET /tutor/guidance?activityId=44`: aparece el botón «Ir al contenido de la unidad» (unidad 24) y el
nivel de guía se calcula para la actividad 44, aunque ya no está en ninguna actividad.

**Qué hacer.** Usa `workspaceStore.currentExercise` solo cuando la ruta actual sea una actividad
(`/estudiante/evaluacion/:id`); en cualquier otra ruta, no envíes `activityId`. (Alternativa válida:
limpiar `currentExercise` al salir del espacio de trabajo. Elige una y déjala escrita en el commit.)

### T4 — Estados «✔» escritos a mano en ADM-V01

**Defecto.** En `pages/admin/dashboard.vue` hay insignias positivas fijas que no dependen de ningún
dato: la fila de la cola dice «✔ Listo» y «Calificación activa», la del sandbox «✔ Aislado», la del
Tutor «✔ Adaptativo». Con la base de datos caída (`database.ok: false`) siguen diciendo que todo va bien.

**Qué hacer.** Deriva cada una de datos reales, o quítala si no hay dato que la respalde. Como mínimo:
cuando `database.ok` sea `false`, las filas de la cola, el sandbox y el Tutor no muestran «✔»; muestran
«—» o «Sin datos». No inventes estados nuevos: si un subsistema no tiene un campo que diga si está
sano, deja solo su detalle (adaptador, límites, modelo) sin insignia de estado.

---

### 22.3 Cómo verificar

| Tarea | Prueba |
|---|---|
| T1 | Como Pedro (sin clave), abre el Tutor en `/estudiante`: el aviso «Tienes N repasos vencidos…» se ve **encima del formulario de la clave**. Abre una actividad (la 44) y el Tutor: se ve «Ir al contenido de la unidad» y lleva a `/estudiante/unidad/24`. Repite guardando una clave: se ve igual, sin duplicados. Como docente, desactiva el Tutor de la clase: desaparecen aviso y botón (devuélvelo). |
| T2 | Solo con teclado: abre el Tutor con Enter, pulsa `Escape` y se cierra; el foco vuelve al botón «Tutor IA». En `/admin/sistema`, abre el diálogo, comprueba que el foco está en «Cancelar», que Tab no sale y que `Escape` cierra **sin** enviar `POST /maintenance/cleanup` (míralo en la pestaña Red). |
| T3 | Como Pedro: `/estudiante` → actividad 44 → pulsa «Inicio» (sin recargar) → abre el Tutor. **No** debe haber «Ir al contenido» ni chips de nivel de la 44, y la petición debe ser `GET /tutor/guidance` sin `activityId`. |
| T4 | En `/admin/dashboard`, intercepta `GET /admin/system/status` y devuelve la respuesta real con `database: { ok: false, latencyMs: null }`: las filas de cola, sandbox y Tutor no muestran «✔». Con la respuesta real, el resto de la pantalla no cambia. |

`npx nuxi typecheck` debe terminar en código 0 tras cada tarea.

### 22.4 Criterios de cierre

- [ ] Las pruebas de §22.3 hechas en navegador real, con lo observado anotado en el informe.
- [ ] `npx nuxi typecheck` en código 0.
- [ ] Cuatro commits, uno por tarea.
- [ ] Informe en `docs/antigravity/informes/` con `TEMPLATE_INFORME.md`, **solo con lo que hiciste y viste**.

### 22.5 Fuera de alcance

Cambios en el backend · rediseño visual · nuevas pantallas · el aviso de repasos con un botón para
iniciar el repaso desde el chat.
