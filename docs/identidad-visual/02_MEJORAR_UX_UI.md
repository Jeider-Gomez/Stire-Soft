# Mejorar la UX y la UI: más allá de la paleta

Cambiar colores es el primer paso y el más visible, pero **una interfaz que se ve bien y confunde sigue
siendo mala**. Esta guía es para lo que viene después de la paleta. No es una teoría: cada punto trae un
ejemplo real de STIRE, de errores que ya se encontraron y corrigieron.

- **UI** es cómo se ve (color, tipografía, espacio, iconos).
- **UX** es cómo se siente usarlo (¿sé qué hacer?, ¿sé qué pasó?, ¿me equivoco fácil?, ¿me cuesta?).

En STIRE la UX importa más de lo normal: quien usa el sistema está **aprendiendo a programar**, y un tropiezo
de interfaz se suma a la dificultad del tema.

---

## 1. El método: observar, detectar, cambiar, comprobar

1. **Observar.** Usa el sistema como lo haría un estudiante que no conoce nada: entra, mira la primera pantalla y
   pregúntate «¿qué se supone que hago ahora?». Anota **tareas concretas** («abrir mi primer ejercicio», «ver qué
   debo repasar», «pedirle una pista al Tutor») y cuenta cuántos pasos y dudas tuviste en cada una.
2. **Detectar.** Recorre la lista del punto 3 en cada pantalla. Cada problema se escribe con el formato
   **Problema → a quién le pasa → propuesta → prioridad** (alta si impide hacer la tarea, media si confunde, baja si es estético).
3. **Cambiar.** De a una cosa por commit. Una mejora de UX grande hecha de golpe es imposible de revisar.
4. **Comprobar.** Captura antes y después, y **pídele a otra persona que haga la misma tarea** sin explicarle nada.
   Si duda en el mismo lugar, no mejoró.

## 2. Lo que es específico de STIRE

- **El error no debe castigar.** Los mensajes hablan de qué hacer, no de qué salió mal («Revisa que la copiaste
  completa desde Google AI Studio», no «Clave inválida»). Los repasos dicen «Objetivo de retención», no «Vencido».
- **Una pantalla, una acción principal.** En la evaluación lo principal es escribir y enviar código; el Tutor y las
  pistas son secundarios y no deben competir con eso.
- **Cada estado del ejercicio y del repaso se distingue sin depender del color** (forma, icono o texto), porque el
  estudiante también es una persona con daltonismo o un proyector con mal contraste.
- **El docente quiere responder una pregunta:** «¿a quién debo ayudar hoy?». Un panel docente bonito que no
  responde eso falló, aunque tenga buena paleta.
- **El editor de código es un espacio de concentración:** poco ruido alrededor, texto legible (fuente monoespaciada
  de tamaño cómodo) y sin elementos que se muevan.

## 3. Lista de revisión por pantalla

Marca cada punto. Si uno falla, es una mejora candidata.

1. **Jerarquía:** ¿se ve cuál es la acción principal? ¿Hay solo una?
2. **Consistencia:** ¿los botones, campos y tarjetas se ven igual que en las otras pantallas?
3. **Los cinco estados:** cargando, vacío, con datos, error y éxito. Casi siempre falta el vacío y el error.
4. **El botón hace lo que dice:** al pulsarlo pasa algo visible y verdadero.
5. **Los datos son reales:** si no hay dato, se ve «—», nunca un `0` ni un ✔ inventados.
6. **Textos claros:** frases cortas, tuteo, sin jerga; un error dice qué hacer, no solo qué pasó.
7. **Acciones destructivas o irreversibles** piden confirmación y dicen **qué va a pasar de verdad**.
8. **Contraste y tamaño:** texto 4.5:1 con su fondo; nada de texto de menos de 12 px; áreas de toque de 44 px en móvil.
9. **Teclado:** se llega a todo con Tab, el foco se ve, `Escape` cierra lo que se abrió, y el foco vuelve a donde estaba.
10. **Móvil (375 px):** nada se corta, no hay desplazamiento horizontal, los botones no se apretujan.

## 4. Errores reales de este proyecto (para no repetirlos)

| Qué pasó | Qué principio rompía | Estado |
|---|---|---|
| «Iniciar Refuerzo» en repasos solo quitaba el repaso de la lista y no llevaba a ninguna parte | El botón debe hacer lo que dice (punto 4) | Pendiente (Fase 23): que lleve a la unidad y que el repaso desaparezca solo cuando el sistema lo reprograma |
| El panel docente muestra «0 estudiantes» y «0 en riesgo» sin tener ese dato | Los datos deben ser reales (punto 5) | Pendiente (lo corrige José): mostrar «—» o quitar la tarjeta |
| El diálogo de limpieza decía «datos temporales» y en realidad **ponía nota 0** a entregas | Confirmar diciendo qué pasa de verdad (punto 7) | Se reescribió el texto con lo que hace |
| La clave del Tutor daba «inténtalo de nuevo» cuando el servidor no estaba configurado | Un error debe decir qué hacer; reintentar no servía (punto 6) | El servidor distingue los dos casos y el mensaje lo dice |
| `Escape` no cerraba el panel del Tutor si no había clave guardada | Teclado (punto 9) | Se escucha `Escape` en todo el documento y se reasigna el foco |
| Una barra de estado con ✔ verdes fijos aunque la base de datos estuviera caída | Los datos deben ser reales (punto 5) | Cada insignia depende de un dato real |

## 5. Cómo proponer una mejora que necesita lógica

Muchas mejoras de UX piden algo que hoy no existe (un dato nuevo, un paso extra, una pantalla). **No las
implementes tú**; descríbelas en la sección 4 de [`PROPUESTA_IDENTIDAD.md`](./PROPUESTA_IDENTIDAD.md) con este formato:

> **Problema:** el estudiante no sabe cuánto le falta para dominar una unidad.
> **A quién:** estudiante, en `/estudiante/unidad/:id`.
> **Propuesta:** una barra de progreso con el porcentaje real de maestría.
> **Necesita:** que el backend entregue el porcentaje por unidad (hoy solo hay el global).
> **Prioridad:** media.

Con eso se convierte en una tarea del plan del equipo, con el dato que falta ya identificado.

## 6. Herramientas que sirven

- **DevTools del navegador:** el modo dispositivo (Ctrl+Shift+M) para 375 px, y la pestaña *Lighthouse* → Accesibilidad
  para una revisión automática de contraste y etiquetas.
- **Un verificador de contraste WCAG** cualquiera, para cada par de colores de la paleta.
- **Solo teclado:** desconecta el mouse un momento y recorre una pantalla con Tab, Enter y Escape.
- **Figma** si te ayuda a diseñar antes de programar; el resultado que cuenta es el de esta guía (`PROPUESTA_IDENTIDAD.md`).
