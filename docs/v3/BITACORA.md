# Bitácora de la construcción de la v3

Archivo **compartido entre todos los chats** que trabajan en la v3, en esta misma carpeta: dónde estamos, quién toca
qué y qué sigue. El plan completo está en [`PLAN_CONSTRUCCION_V3.md`](PLAN_CONSTRUCCION_V3.md); lo que ya se hizo, paso
a paso y con sus commits, en [`BITACORA_HECHO.md`](BITACORA_HECHO.md).

## Reglas

1. Al empezar, lee esta bitácora y `git status`. No toques cambios sin guardar de otro chat.
2. Antes de editar, anótate en «Trabajando ahora»; al terminar, commit (uno por punto), borra tu fila y deja una línea en
   «Hecho hoy». Al cerrar el día, esas líneas pasan a `BITACORA_HECHO.md`.
3. Lo que encuentres y no arregles va a «Pendiente», con dónde está.
4. Nada se sube a GitHub sin que Jeider lo pida. Siempre en español. **Sin tareas extra**: no se abren tarjetas en
   Trello ni documentos nuevos si no hacen falta para lo que sigue.

## Dónde estamos (semana del 16/11)

- **La v3 está publicada** para todos (Azure con sus migraciones y Vercel desde `main`). No está marcada como v3.0.0:
  eso lo hace Jeider cuando la revise.
- **Fase G cerrada.** La prueba con 10 personas que pidió el profesor se hizo y se recogió la semana pasada. Ya estamos
  en cosas nuevas.

## Prueba con 10 personas: cerrada

| Qué | Estado |
|---|---|
| Las 10 sesiones (5 observadores × 2 personas, protocolo de [`PROTOCOLO_OBSERVACION.md`](../calidad/PROTOCOLO_OBSERVACION.md)) | Hechas y recogidas la semana pasada. Hojas en [`docs/calidad/prueba-personas/`](../calidad/prueba-personas/) |
| Encuesta SUS al final | Opcional: los participantes no la respondieron. Por eso el SUS no entra en el informe de la prueba |
| Arreglar los problemas de gravedad 3 y 2 | **No se hace** (decisión de Jeider, 16/11). Lo que salga de las hojas va a `PENDIENTES.md` si hace falta |
| Seguir midiendo el SUS | El admin ya elige el periodo en «Encuesta de usabilidad»: últimos 7, 30 o 90 días, o entre dos fechas (`905f902`) |

Las cifras de la prueba salen **solo de lo que está escrito en las hojas**. No se inventan ni se completan.

### Lo que realmente hicimos (aparte de la prueba)

Para el informe al profesor, separado de la prueba con personas:
- **Evaluación heurística** de la v3, hecha por el equipo antes de publicar.
- **Revisión con `verify:clean`** y despliegue de la v3 el 16/11 (servidor con migraciones, luego Vercel).
- **Ajustes de la semana del 16/11**, uno por commit (tabla de abajo): Entrar sin bajar y con la mascota del diseño,
  temas de contraste en la mascota y el logo, cambio de tema con círculo, menús sin scroll, barra de arriba con íconos,
  «Mi asistencia» fija, y el SUS por periodo.

## Trabajando ahora

| Desde | Quién | Qué | Archivos |
|---|---|---|---|

## Hecho hoy (16 y 17/11)

- 17/11 · **Activar el Tutor sin cortar el aprendizaje** (audio de Pedro; recomendado, no obligatorio, por decisión de Jeider). Medido a 360×640: el campo y «Guardar» quedaban fuera de la pantalla. Ahora: la guía arriba y el campo, «Pegar» y «Guardar y activar el Tutor» fijos abajo; al volver de Google dice «¿Ya la copiaste? Pégala aquí.»; letra de 16 px en el campo, toques de 44 px, sin emojis; privacidad plegada. En el inicio, «Activa tu Tutor antes de empezar» (solo si el servidor confirmó que no hay clave; «Ahora no» la oculta). El primer paso «Activa tu Tutor» se cumple al tener la clave. Con el Tutor abierto entre 1024 y 1439 px el menú pasa a íconos: a la página le quedaban 285 px, ahora 525. **Sin probar:** guardar una clave real (no se escribe una clave real) ni en un celular de verdad. **Queda del equipo:** el video que propuso Pedro (hay que grabarlo con una cuenta de Google). La idea de un Tutor que funcione sin clave es P46, descartada el 12/11. **Visto y no tocado:** el aviso «Tienes N repasos vencidos» sale encima de la guía de la clave (`TutorChatDrawer.vue`, de otra sesión)
- 17/11 · **Lo que quedaba del Tutor y del celular**, uno por commit: el aviso de repasos ya no tapa la guía de la clave (`0f18659`); contraste revisado en 34 pantallas con los 6 modos de contraste y arreglado lo que fallaba (`3816383`); en el registro del estudiante el paso 2 es «Activa tu Tutor», con la guía y el video abiertos, y seguir sin clave se confirma (`f4cdd3e`, `4d569bd`); celular a 412 px sin nada que se salga (`cc6ec05`); sonidos al entregar (acierto, cerca, aún no) y botón de sonido arriba (`aa077e4`); barra de la lección con «Practicar» (`a9e36e9`); claro/oscuro y contraste siempre arriba en el celular (`e01da74`); video «Activa tu Tutor» de 1 min con la voz de Will, en `docs/material-visual/video-clave/` (`253242f`, `129aff0`); «generado con IA» en el Tutor y el Asistente, la hora del chat legible y en Privacidad dónde se guardan los datos (`b10185e`). **Sin probar:** guardar una clave real y un celular de verdad.

| Qué | Commit |
|---|---|
| Revisión antes de desplegar y despliegue de la v3 (servidor con migraciones, luego Vercel); claves «AQ.» de Google AI Studio | `e44ec1d`, `5d0a1e4` |
| Entrar cabe sin bajar en 1363×647; mascota y logo con los colores de los temas de contraste; la mascota de Entrar como el diseño (persiana con candado, ✓ y @ del correo, Mayúsculas, se duerme) | `891e827`, `4b8f2b7`, `e32fa7c` |
| Cambio de tema con un círculo (como remotion.dev); Apariencia como acceso rápido de dos íconos (claro/oscuro y contraste), lo demás en el perfil | `a1f735c`, `9b812d6` |
| Menú del docente sin scroll (abierto y plegado); «Asistencia y notas» una sola entrada con sus dos pestañas dentro | `2b2496c`, `bf5a39e`, `37da8d1` |
| El SUS por periodo: el admin elige desde qué fecha hasta cuál mira los resultados | `905f902` |
| Barra de arriba solo con íconos; «Mi asistencia» como entrada fija del estudiante y el plan del curso fuera del menú; íconos más grandes y responsive | `9b812d6`, `ecb88e8`, `ce538c4` |

## Pendiente

**Por decidir con Jeider**
- «El pliegue del contenido más intuitivo»: falta saber si es el panel «Contenido del curso» de la lección o los
  módulos de «Aprender» (pedir una captura).
- P-14: si la consola compara cada línea con el ejemplo (v9) o se queda la regla del 02/11.

**Necesitan servidor** (cada uno con migración y tests; se despliega antes que su pantalla)

| # | Qué | Dónde |
|---|---|---|
| P-19 | Crear una clase con el Asistente a partir del microcurrículo | `src/asistente/`, `VentanaCrearClase.vue` |
| P-18 | Inicio del docente: «practicaron esta semana», «asistencia abierta», «próxima sesión», sugerencia del Asistente | `src/class/`, `src/asistencia/` |
| P-17 | Laboratorio: «Reto de la semana» y pantalla del docente para lo reportado | `src/proyectos/laboratorio*` |
| P-16 | Mi clase y Mi cuenta: próxima sesión con horario, historial de notas, avisos por tipo, memoria del Tutor visible, eliminar la cuenta (30 días) | `src/asistencia/`, `src/users/`, `src/tutor/` |
| P-15 | Competencias en Mi progreso y «Este mes recordaste…» en Repasos (no se muestran hasta tener el dato) | `src/analytics/`, `src/review-schedules/` |
| P-14 | Ejercicios de respuesta abierta y por bloques | `src/activities/` |
| P-13 | Ver la clase (nombre y docente) antes de unirse con un código | `src/class/`, `login.vue` |
| P-12 | «Recordarme en este equipo» (sesión larga). Lo demás de la mascota ya se hizo el 16/11; faltan los detalles finos (contar qué hace cada enlace, reaccionar al tocarla, «{…}» al cargar) | `login.vue`, `MascotaEntrar.vue` |
| P-2 / P-4 | «Sigue donde ibas» y «Asistencia abierta» en el menú del estudiante; cuentas de pendientes en el del administrador | `SidebarNav.vue` |

**Del video de lanzamiento (16/11, lista de 35 puntos; no es asesoría legal)**: queda **descargar y borrar mis datos**
(necesita servidor; va con P-16). Hecho el 17/11: «generado con IA», proveedores (Google, Azure, Vercel), cuánto se guardan y
por dónde reclamar, en Privacidad.

**Por decidir con Jeider (17/11)**: la demo «Solo mirar» en el sitio publicado. Hoy está apagada en producción a propósito:
encenderla así dejaría las contraseñas de las cuentas demo en la página. Hace falta servidor: cuentas demo que no cambien su
clave ni sus datos, con una clase de muestra y que se reinicien cada noche.

**Solo frontend**
- P-6: bajar los 180–250 pedidos por página y volver a medir (`scripts/v3/medir-partida.mjs`).
- P-8: el ☰ del estudiante en el celular.
- P-1: el cuadro D3-Clase del lienzo aún pone la Biblioteca al final (solo el dibujo).
