# Pendientes de STIRE

Lista viva de lo que falta, para que nada se olvide entre sesiones. Se actualiza al cerrar cada bloque de trabajo: lo
hecho se borra de aquí (queda en `CHANGELOG.md` y en los commits) y lo nuevo se agrega. Última actualización: 27/10/2026.

**Cómo se despliega:** el frontend sale solo a Vercel al subir a `main`. El backend solo cuando Jeider pega los comandos
(backend antes que el frontend que lo usa; las migraciones no se corren solas). Ver `docs/DESPLIEGUE.md` §8.

## 1. Se puede hacer ya (solo frontend, sin despliegue del servidor)

| # | Qué | Notas |
|---|---|---|
| F1 | Corregir lo que salga de la verificación del panel del docente (PD-01..17, PV-01..06) | Cierra el jueves 29/10, 8 p. m. `docs/calidad/VERIFICACION_PANEL_DOCENTE_S11.md` |
| F2 | Hoja de la mascota con las caras nuevas (contento, ánimo) y los gestos | `docs/identidad-visual/propuestas/mascota-stire.html` |
| F4 | Contenido del curso como en el prototipo: **hecho** (árbol, mapa, lección con pestañas, reordenar, crear sin ventanas, duplicar tema, mover lección a otro tema, módulo siempre abierto, «Ver como estudiante») | Falta en el Asistente: «Analizar mi clase» y ejercicios de programación revisados por el juez |
| F5 | Revisar en el celular el logo pequeño (28 px), el pie y el lanzador nuevo del Tutor | Jeider decide; José lo verá después con lo demás |

## 2. Necesita el servidor (migración y comandos de despliegue)

| # | Qué | Por qué necesita servidor |
|---|---|---|
| B1 | Portada de cada clase: color y presentación con bienvenida **hechos**; falta subir una imagen | La imagen necesita guardar archivos |
| B2 | Varias explicaciones por unidad que se desbloquean según el estudiante | Tabla nueva y reglas de desbloqueo |
| B4 | Marcar en el servidor los errores de concepto por tipo de ejercicio o reto | Hoy se agrupan solo por semana |

## 3. Del equipo o de decisión de Jeider

| # | Qué | Quién |
|---|---|---|
| E1 | José revisa todas las decisiones de identidad juntas más adelante (logo, mascota, letra, pie, lanzador) | Cuando Jeider decida; no bloquea |
| E3 | Prueba de asistencia en iPhone | Equipo |
| E4 | Correcciones de ejercicios B-J02 (revisión de la semana 10) | Equipo |
| E5 | Verificar las fuentes de la investigación (tesis) | Jeider |
| E6 | Cerrar en Trello el tablero de la Semana 10 | Jeider |

## 4. Hecho recientemente (para contexto; se borra en la próxima actualización)

- 27/10: panel de contenidos dinámico (reordenar, crear sin ventanas, la dirección guarda lo abierto, duplicar tema, mover lección, módulo siempre abierto, «Ver como estudiante»); corregir avisos y ejercicios publicados; borrador del Asistente editable con enlaces a lo creado; anchos del docente unificados; presentación de la clase; alertas de cada clase en «Por revisar».

- 26/10: mascota del Tutor con expresiones y gestos; logo fijo con «stire_»; nombre STIRE; Inicio del docente nuevo;
  Biblioteca; manual con el menú nuevo; logo exportado en SVG y PNG (`docs/identidad-visual/logo/`); favicon en todos
  los navegadores; lanzador del Tutor rediseñado.
