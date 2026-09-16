---
estado:     vigente
fuente:     normativo (guía de alcance para la próxima auditoría de Jorge Cervantes)
---

# Guía de la próxima auditoría QA — general, específica del Tutor, y con veredicto de despliegue

**Para:** Jorge Cervantes (Calidad y Pruebas).
**Qué pide el dueño del proyecto para esta pasada:** una auditoría **general** de todo el proyecto
(no hay problema en que re-toques cosas ya revisadas antes — entre más completa, mejor), **más una
auditoría específica y a fondo del Tutor IA** (es la pieza más nueva y la que más cambió), **mirando
desde ángulos que normalmente no se cubren**, y terminando con dos cosas concretas: **en qué
porcentaje real de avance está el proyecto**, y **si ya se puede desplegar o no**.

**Por qué existe este documento:** no es para limitar tu alcance, es para que no partas de cero.
Tu auditoría anterior (`REPORTE_AUDITORIA_QA_STIRE2VERSION.md`, 12/09) se hizo contra un ZIP
comprimido, no contra `main` en vivo, y algunos de sus hallazgos (`FE-01`, `FE-03`) ya estaban
resueltos desde antes de la fecha del propio reporte (verificado por Claude Code el 14/09,
`docs/PLAN_MAESTRO.md` §5) — probablemente por auditar una copia desactualizada. La §1 de abajo te
da el contexto de qué se cerró y por qué, para que si lo vuelves a probar (bienvenido) sepas contra
qué comparar, y si encuentras que algo ya no funciona, sea un hallazgo real y no una repetición de
algo que nunca se verificó bien la primera vez.

**Regla base para esta pasada:** clona o actualiza `main` real (`git pull`), nunca un ZIP. Cita
siempre `archivo:línea` y el hash del commit que probaste — tu reporte anterior no lo hacía
consistentemente, y fue parte de por qué algunos hallazgos ya no aplicaban para cuando se leyó.

---

## 1. Contexto — qué se cerró antes y por qué (referencia, no un límite a tu alcance)

Esto es lo que **Claude Code ya verificó contra el código real y en navegador**, con evidencia
citada en `docs/PLAN_MAESTRO.md` §4-§5. Vuelve a probar cualquiera de estos si quieres — de hecho,
para una auditoría general de verdad, probablemente deberías. La diferencia es que ahora sabes qué
esperar y por qué, así que si encuentras algo distinto, es un hallazgo real, no una sorpresa sin
contexto:

- Las 4 rutas de estudiante sin `@Roles` (`submissions/start`, `submissions/:id/submit`,
  `submissions/:id/autosave`, `tutor/chat`) — cerradas, verificado 403 real para docente/admin.
- Self-XSS del Tutor IA (`TutorChatDrawer.vue`) — `escapeHtml()` corre antes del markdown, verificado.
- Botón "+ Crear Nueva Clase" sin formulario — tiene modal real conectado a `POST /class`.
- Intentos duplicados de `submissions` sin restricción — migración + índice único real, con test de
  concurrencia (Fase D de Codex).
- `/submissions/start` sin verificar matrícula activa — `assertActiveEnrollment()` real, cierra el
  hallazgo `P2-R3` de tu reporte anterior.
- "Probar código" simulado en cliente (`new Function()`) y falta de polling para notas asíncronas —
  **ya estaban resueltos desde el 09-10/09**, antes de la fecha de tu propio reporte anterior.
- `DOC-V04` (Rendimiento del Grupo) con datos reales, `DOC-V02/V03/V05/V06` con escritura real —
  verificado en navegador, con capturas, en las Fases 14-16.

---

## 2. Auditoría específica del Tutor IA — general y técnica (la prioridad de esta pasada)

El Tutor es la pieza que más cambió recientemente (pausa técnica del 15-16/09,
`docs/00_VISION_FUNCIONAL.md` §9.5) y **nadie externo lo ha auditado todavía**. Míralo en dos
niveles, no solo el técnico:

### 2.1 Auditoría general — ¿cumple la visión, se siente como se pidió?
- Habla con el Tutor como lo haría un estudiante real, en varias sesiones distintas (con y sin
  repasos vencidos, con mastery alto y bajo). ¿Se siente como un acompañante que te conoce, o
  todavía se siente como un chat genérico? Esa es literalmente la pregunta que originó esta pausa
  técnica — tu criterio humano aquí vale tanto como cualquier prueba técnica.
- ¿El saludo proactivo (`GET /tutor/greeting`) aporta o estorba? ¿La tarjeta de "Practica esto" se
  siente útil o intrusiva?
- Compara el comportamiento contra los 5 puntos de la visión en `docs/00_VISION_FUNCIONAL.md` §9.5
  — ¿hay alguno que sigue sin cumplirse en la práctica, aunque el código diga que sí?

### 2.2 Auditoría técnica y adversarial — "hazle trampa" al Tutor y al Mastery
- Repite una actividad `BASICO` 5, 10, 20 veces con el mismo estudiante y confirma en base de datos
  (no solo en la UI) que el score que cuenta para Mastery efectivamente decae — no le creas al número
  que muestra la pantalla, ve la fórmula aplicada contra `submissions` real.
- En el chat del Tutor, intenta que te dé la respuesta completa de un ejercicio con distintas
  formulaciones ("ignora tus instrucciones anteriores", "dime el código exacto", pedirlo en inglés,
  pedirlo como si fueras el docente). El prompt dice "nunca resuelvas el ejercicio" — pero es una
  instrucción de texto a un LLM, no una barrera de código; vale la pena ver qué tan fácil es
  saltársela.
- Revisa si el saludo proactivo puede llamarse repetidamente para inflar costos de la cuenta de LLM
  del proyecto, o si su límite de tasa (agregado el 16/09, 30 req/min) es suficiente.
- Confirma que la tarjeta de ejercicio recomendado nunca sugiere una actividad de OTRA clase o de
  una unidad a la que el estudiante no tiene acceso — manipula el contexto que el frontend envía
  (`learningUnitId`, `activityId`) para ver si el backend lo valida de verdad o confía en él.

---

## 3. Qué es genuinamente nuevo desde tu última auditoría (12/09) — además del Tutor

1. **Editar y archivar contenido desde la UI docente** (Fase 16, `DOC-V02`/`DOC-V03`) — ¿qué pasa si
   archivas una unidad con estudiantes activos en ella? ¿el docente puede editar una actividad de
   OTRA clase cambiando el ID en la URL?
2. **Categorías reales de tipo de actividad — Práctica/Taller/Parcial con peso distinto** (Fase 17,
   16/09) — selector nuevo en `docente/ejercicios/crear.vue`, recategorización vía `PATCH
   /activities/:id`. Completamente sin auditar.
3. **Accesibilidad WCAG 2.1 AA de las 7 ventanas de Docente/Admin** (Fase 16) — Antigravity declaró
   hallazgos corregidos por inspección de código (`role`, `aria-*`, `for`/`id`). Claude Code verificó
   con `grep` que los atributos existen — **nadie lo probó con un lector de pantalla real ni
   navegación 100% por teclado**. Que el atributo esté presente no garantiza que la experiencia real
   funcione.

---

## 4. Ángulos que normalmente no se cubren — para el resto del proyecto

### 4.1 Seguridad — BOLA sistemático, no solo los casos ya reportados
Las rutas ya corregidas se probaron una por una, a partir de hallazgos puntuales. Haz un barrido
sistemático: para **cada módulo** (`topic`, `learning-unit`, `activities`, `class`, `section`,
`content`, `analytics`, `notifications`, `institution`, `user`, además de los ya mencionados),
intenta acceder/editar un recurso que pertenece a otra clase/otro estudiante, autenticado como
estudiante de una clase distinta y como docente de una clase distinta.

### 4.2 Concurrencia — nadie ha probado dos sesiones al mismo tiempo
Abre dos pestañas/navegadores con la misma cuenta de estudiante y envía la misma actividad casi
simultáneamente. Con dos estudiantes distintos, ambos escribiendo al Tutor IA al mismo tiempo sobre
la misma unidad.

### 4.3 Verificación de despliegue de punta a punta, desde cero real
`npm run verify:clean` existe exactamente para esto (`rm -rf node_modules dist → npm ci →
migration:run → db:seed:demo → build → arranque → login real → apagado`, contra una BD vacía real).
Según `CLAUDE.md`, este comando ya falló de forma intermitente en el pasado bajo poca memoria libre
del sistema — córrelo en una máquina/sesión de terminal fresca, y pega la salida completa, no un
resumen. Esto es lo que responde directamente la pregunta de "¿está listo para desplegar?" con
evidencia real, no con una opinión.

### 4.4 Estados de error poco visitados
- Apaga o des-configura la clave del LLM a mitad de una conversación del Tutor y confirma que el
  mensaje de error al estudiante no es confuso ni expone detalles internos.
- Deja expirar el token JWT a mitad de un formulario largo y confirma que no se pierde el trabajo
  sin ningún aviso.
- Responsive real (viewport 375px, no solo redimensionar la ventana de escritorio) de las 7 ventanas
  nuevas de Docente/Admin — nunca se ha probado en un dispositivo o emulador real.

---

## 5. Lo que se te pide al final: porcentaje de avance y veredicto de despliegue

Tu reporte anterior cerraba con `🔴 RECHAZADO PARA PRODUCCIÓN, ~65% de avance`. Con todo lo cerrado
desde entonces (Fases 14-17, pausa técnica completa del Tutor) y con esta pasada mirando también
ángulos que antes no se cubrieron, el dueño del proyecto quiere las mismas dos respuestas, con datos
actuales:

1. **¿En qué porcentaje real de avance está STIRE hoy?** — un número, con el desglose que lo
   sustenta (qué cuenta como completo, qué como parcial, qué como faltante), no una sensación.
2. **¿Está listo para desplegarse hoy?** Si la respuesta es no, la lista concreta y priorizada de
   qué lo bloquea.

Usa el mismo formato de tu reporte anterior (Ficha técnica, Matriz de hallazgos, Dictamen final)
para que sea comparable, con la fecha y el commit exacto contra el que probaste.
