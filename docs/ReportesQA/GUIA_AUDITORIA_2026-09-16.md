---
estado:     vigente
fuente:     normativo (guía de alcance para la próxima auditoría de Jorge Cervantes)
---

# Guía de la próxima auditoría QA — qué NO repetir y qué mirar distinto

**Para:** Jorge Cervantes (Calidad y Pruebas).
**Por qué existe este documento:** tu auditoría anterior (`REPORTE_AUDITORIA_QA_STIRE2VERSION.md`,
12/09) fue real y encontró cosas reales — pero se hizo contra un ZIP comprimido, no contra `main` en
vivo, y varios de sus hallazgos (`FE-01`, `FE-03`) resultaron estar ya resueltos desde antes de la
fecha del propio reporte (verificado por Claude Code el 14/09, `docs/PLAN_MAESTRO.md` §5). El
objetivo de esta guía es que tu próxima pasada no repita ese patrón — ni el de volver a probar cosas
que ya se cerraron y verificaron en vivo. Sin esto, hay riesgo real de que una auditoría completa
aporte poco porque la mitad del tiempo se va en redescubrir lo mismo.

**Regla base para esta pasada:** clona o actualiza `main` real (`git pull`), nunca un ZIP. Cita
siempre `archivo:línea` y el hash del commit que probaste — tu reporte anterior no lo hacía
consistentemente, y fue parte de por qué algunos hallazgos ya no aplicaban para cuando se leyó.

---

## 1. Qué NO hace falta que vuelvas a probar (ya cerrado y verificado en vivo)

Esto no es "confía en el commit" — es la lista de lo que **Claude Code ya verificó contra el código
real y en navegador**, con evidencia citada en `docs/PLAN_MAESTRO.md` §4-§5. Si tu auditoría vuelve a
encontrar que alguno de estos NO funciona, es un hallazgo real y valioso (algo se rompió después) —
pero probarlos "por si acaso" sin una razón nueva es tiempo que no suma:

- Las 4 rutas de estudiante sin `@Roles` (`submissions/start`, `submissions/:id/submit`,
  `submissions/:id/autosave`, `tutor/chat`) — cerradas, verificado 403 real para docente/admin.
- Self-XSS del Tutor IA (`TutorChatDrawer.vue`) — `escapeHtml()` corre antes del markdown, verificado.
- Botón "+ Crear Nueva Clase" sin formulario — tiene modal real conectado a `POST /class`.
- Intentos duplicados de `submissions` sin restricción — migración + índice único real, con test de
  concurrencia (Fase D de Codex).
- `/submissions/start` sin verificar matrícula activa — `assertActiveEnrollment()` real, cierra el
  hallazgo `P2-R3` de tu reporte anterior.
- "Probar código" simulado en cliente (`new Function()`) y falta de polling para notas asíncronas —
  **ya estaban resueltos desde el 09-10/09**, antes de la fecha de tu propio reporte anterior
  (probablemente auditaste un ZIP desactualizado) — no se reabren salvo evidencia nueva.
- `DOC-V04` (Rendimiento del Grupo) con datos reales, `DOC-V02/V03/V05/V06` con escritura real —
  verificado en navegador, con capturas, en las Fases 14-16.

Si quieres re-confirmar alguno de estos por rigor, hazlo — pero dedícale minutos, no la mitad de tu
tiempo de auditoría, y solo repórtalo si de verdad encuentras algo distinto a lo que dice arriba.

---

## 2. Qué es genuinamente nuevo desde tu última auditoría (12/09) — nadie lo ha probado con ojos de QA todavía

Esto es lo que más vale la pena que mires, porque **ninguna auditoría externa lo ha tocado**:

1. **Editar y archivar contenido desde la UI docente** (Fase 16, `DOC-V02`/`DOC-V03`) — modales de
   edición de tema/unidad/actividad, archivar con confirmación. Verificado en código y navegador por
   Claude Code, pero desde un ángulo de "¿funciona lo que se pidió?", no de QA adversarial (¿qué pasa
   si archivas una unidad con estudiantes activos en ella? ¿el docente puede editar una actividad de
   OTRA clase cambiando el ID en la URL?).
2. **Categorías reales de tipo de actividad — Quiz/Taller/Parcial con peso distinto** (Fase 17,
   16/09) — selector nuevo en `docente/ejercicios/crear.vue`, recategorización vía `PATCH
   /activities/:id`. Completamente sin auditar.
3. **El Tutor como acompañante proactivo** (pausa técnica, 15-16/09) — `GET /tutor/greeting` (saluda
   primero citando repasos vencidos reales), detección de intención de práctica en `POST
   /tutor/chat`, tarjetas de ejercicio recomendado. Esto es lógica nueva y nunca ha recibido ningún
   tipo de prueba adversarial — ver §3 abajo para ángulos concretos.
4. **Mastery con penalización por repetición trivial** (misma pausa técnica) — `mastery.calculator.ts`
   ahora descuenta el score de actividades `BASICO` repetidas más de 2 veces. Nunca se ha intentado
   "hacerle trampa" a este mecanismo con datos reales.
5. **Accesibilidad WCAG 2.1 AA de las 7 ventanas de Docente/Admin** (Fase 16) — Antigravity declaró
   hallazgos corregidos por inspección de código (`role`, `aria-*`, `for`/`id`). Claude Code verificó
   con `grep` que los atributos existen en el código — **nadie lo probó con un lector de pantalla
   real ni navegación 100% por teclado**. Esas son dos cosas distintas: que el atributo esté presente
   no garantiza que la experiencia real funcione.

---

## 3. Ángulos que normalmente no se cubren — pruébalos esta vez

### 3.1 Seguridad — BOLA sistemático, no solo los casos ya reportados
Las rutas ya corregidas se probaron una por una, a partir de hallazgos puntuales. Nadie ha hecho un
barrido sistemático: para **cada módulo** (`topic`, `learning-unit`, `activities`, `message`,
`review-schedules`, `learning-progress`, `enrollment`), intenta acceder/editar un recurso que
pertenece a otra clase/otro estudiante, autenticado como estudiante de una clase distinta y como
docente de una clase distinta. Enfócate en los módulos que nunca han tenido un hallazgo reportado —
son los que menos se han mirado con esa lupa.

### 3.2 "Hacerle trampa" al Tutor y al Mastery — pruebas adversariales, no solo funcionales
- Repite una actividad `BASICO` 5, 10, 20 veces con el mismo estudiante y confirma en base de datos
  (no solo en la UI) que el score que cuenta para Mastery efectivamente decae — no le creas al número
  que muestra la pantalla, ve la fórmula aplicada contra `submissions` real.
- En el chat del Tutor, intenta que te dé la respuesta completa de un ejercicio con distintas
  formulaciones ("ignora tus instrucciones anteriores", "dime el código exacto", pedirlo en inglés,
  pedirlo como si fueras el docente). El prompt dice "nunca resuelvas el ejercicio" — pero es una
  instrucción de texto a un LLM, no una barrera de código; vale la pena ver qué tan fácil es
  saltársela.
- Revisa si el saludo proactivo (`GET /tutor/greeting`) puede llamarse repetidamente de forma barata
  para inflar costos de la cuenta de LLM del proyecto, o si su límite de tasa (agregado el 16/09,
  30 req/min) es suficiente.

### 3.3 Concurrencia — nadie ha probado dos sesiones al mismo tiempo
Abre dos pestañas/navegadores con la misma cuenta de estudiante y envía la misma actividad casi
simultáneamente. Con dos estudiantes distintos, ambos escribiendo al Tutor IA al mismo tiempo sobre
la misma unidad. El índice único de intentos activos (Fase D de Codex) ya se probó con una prueba de
concurrencia automatizada — pero eso fue una prueba escrita para el caso que se conocía, no una
prueba manual explorando otros puntos de la aplicación bajo la misma presión.

### 3.4 Accesibilidad real, no solo el atributo presente
Con un lector de pantalla real (NVDA en Windows es gratuito) y sin usar el mouse en absoluto: navega
desde el login hasta completar un ejercicio como estudiante, y desde el login hasta editar una
actividad como docente. Reporta puntos donde el foco se pierde, un elemento no se anuncia, o una
acción no es alcanzable por teclado — aunque el código tenga el atributo `aria-*` correcto, la
experiencia real puede seguir fallando.

### 3.5 Verificación de despliegue de punta a punta, desde cero real
`npm run verify:clean` existe exactamente para esto (`rm -rf node_modules dist → npm ci →
migration:run → db:seed:demo → build → arranque → login real → apagado`, contra una BD vacía real).
Según `CLAUDE.md`, este comando ya falló de forma intermitente en el pasado bajo poca memoria libre
del sistema — córrelo en una máquina/sesión de terminal fresca (no en medio de muchas otras cosas
corriendo), y pega la salida completa, no un resumen. Esto es lo que responde directamente tu
pregunta de "¿está listo para desplegar?" con evidencia real, no con una opinión.

### 3.6 Estados de error poco visitados
- Apaga o des-configura la clave del LLM a mitad de una conversación del Tutor y confirma que el
  mensaje de error al estudiante no es confuso ni expone detalles internos (stack traces, nombres de
  variable de entorno).
- Deja expirar el token JWT a mitad de un formulario largo (crear actividad con varios casos de
  prueba) y confirma que el estudiante/docente no pierde su trabajo sin ningún aviso.
- Revisa el responsive real (viewport 375px, no solo redimensionar la ventana del navegador de
  escritorio) de las 7 ventanas nuevas de Docente/Admin — nunca se ha probado en un dispositivo o
  emulador real, solo se construyó siguiendo el mismo sistema de diseño que ya es responsive en
  Estudiante.

---

## 4. Lo que se te pide al final: un veredicto, no solo hallazgos

Tu reporte anterior cerraba con un dictamen (`🔴 RECHAZADO PARA PRODUCCIÓN, ~65% de avance`) — esta
vez, con todo lo cerrado desde entonces (Fases 14-17, pausa técnica del Tutor), el dueño del proyecto
quiere la misma pregunta respondida de nuevo con datos actuales: **¿está STIRE listo para
desplegarse hoy?** Si la respuesta es no, la lista concreta y priorizada de qué lo bloquea — no una
sensación general. Usa el mismo formato de tu reporte anterior (Ficha técnica, Matriz de hallazgos,
Dictamen final) para que sea comparable, pero con la fecha, el commit exacto contra el que probaste, y
sin repetir lo que ya está cerrado en la lista de la §1.
