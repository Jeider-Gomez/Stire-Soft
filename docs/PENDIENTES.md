# Pendientes de STIRE

Lista viva de lo que falta, para que nada se olvide entre sesiones. Se actualiza al cerrar cada bloque de trabajo: lo
hecho se borra de aquí (queda en `CHANGELOG.md` y en los commits) y lo nuevo se agrega. Última actualización: 26/10/2026 (noche).

**Cómo se despliega:** el frontend sale solo a Vercel al subir a `main`. El backend solo cuando Jeider pega los comandos
(backend antes que el frontend que lo usa; las migraciones no se corren solas). Ver `docs/DESPLIEGUE.md` §8.

## 1. Se puede hacer ya (solo frontend, sin despliegue del servidor)

| # | Qué | Notas |
|---|---|---|
| F1 | Corregir lo que salga de la verificación del panel del docente (PD-01..17, PV-01..06) | Cierra el jueves 29/10, 8 p. m. `docs/calidad/VERIFICACION_PANEL_DOCENTE_S11.md` |
| F2 | Hoja de la mascota con las caras nuevas (contento, ánimo) y los gestos | `docs/identidad-visual/propuestas/mascota-stire.html` |
| F3 | Avisos de errores repetidos y «no puede avanzar» también en «Por revisar» del Inicio | Hoy salen dentro de cada clase (Resumen y «Errores que más se repiten») |
| F4 | **Contenido del curso como en el prototipo**: hecho el árbol con estado, el mapa «Para completar», la lección con pestañas Lección / Actividades / Ajustes, el módulo y el tema editables en la página, buscar y plegar el árbol (27/10) | Hecho también: Actividades en tres grupos; reordenar arrastrando o con flechas (árbol y panel del módulo o tema); crear sin ventanas; la dirección guarda lo abierto y otros paneles llevan a la lección y pestaña justas; corregir avisos y ejercicios ya publicados. Falta: el árbol como hoja en el celular y «Ver la lección como estudiante». Prototipo: https://claude.ai/artifact/61bFSBKYLHEvho5RfF3HKv |
| F6 | Presentación de la clase para los estudiantes (franja de portada y texto de bienvenida) | Usa la portada (B1) |
| F5 | Revisar en el celular el logo pequeño (28 px), el pie y el lanzador nuevo del Tutor | Jeider decide; José lo verá después con lo demás |

## 2. Necesita el servidor (migración y comandos de despliegue)

| # | Qué | Por qué necesita servidor |
|---|---|---|
| B1 | Portada de cada clase: **color ya hecho** (falta desplegar: commit 0c05bb7c y migración PortadaClase); falta subir una imagen | La imagen necesita guardar archivos |
| B2 | Varias explicaciones por unidad que se desbloquean según el estudiante | Tabla nueva y reglas de desbloqueo |
| B3 | El Asistente del docente (IA que ayuda a armar contenido y ejercicios) | Servicio nuevo; ver `docs/PLAN_ASISTENTE_DOCENTE.md` |
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

- 26/10: mascota del Tutor con expresiones y gestos; logo fijo con «stire_»; nombre STIRE; Inicio del docente nuevo;
  Biblioteca; manual con el menú nuevo; logo exportado en SVG y PNG (`docs/identidad-visual/logo/`); favicon en todos
  los navegadores; lanzador del Tutor rediseñado.
