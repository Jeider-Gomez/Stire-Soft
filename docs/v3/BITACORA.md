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

## Hecho hoy (16/11)

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

**Del video de lanzamiento (16/11, lista de 35 puntos; no es asesoría legal)**: descargar y borrar mis datos, etiqueta
«Generado con IA» visible en el Tutor y el Asistente, publicar qué proveedores procesan datos (Google, Azure, Vercel) y
cuánto se guardan, y un contacto visible para reclamos.

**Solo frontend**
- P-6: bajar los 180–250 pedidos por página y volver a medir (`scripts/v3/medir-partida.mjs`).
- P-8: el ☰ del estudiante en el celular.
- P-1: el cuadro D3-Clase del lienzo aún pone la Biblioteca al final (solo el dibujo).
