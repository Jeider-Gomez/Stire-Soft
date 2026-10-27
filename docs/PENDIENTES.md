# Pendientes de STIRE

Lista viva de lo que falta, para que nada se olvide entre sesiones. Se actualiza al cerrar cada bloque de trabajo: lo
hecho se borra de aquí (queda en `CHANGELOG.md` y en los commits) y lo nuevo se agrega. Última actualización: 26/10/2026.

**Cómo se despliega:** el frontend sale solo a Vercel al subir a `main`. El backend solo cuando Jeider pega los comandos
(backend antes que el frontend que lo usa; las migraciones no se corren solas). Ver `docs/DESPLIEGUE.md` §8.

## 1. Se puede hacer ya (solo frontend, sin despliegue del servidor)

| # | Qué | Notas |
|---|---|---|
| F1 | Corregir lo que salga de la verificación del panel del docente (PD-01..17, PV-01..06) | Cierra el jueves 29/10, 8 p. m. `docs/calidad/VERIFICACION_PANEL_DOCENTE_S11.md` |
| F2 | Hoja de la mascota con las caras nuevas (contento, ánimo) y los gestos | `docs/identidad-visual/propuestas/mascota-stire.html` |
| F3 | Avisos de errores repetidos y «no puede avanzar» también en «Por revisar» del Inicio | Hoy salen dentro de cada clase (Resumen y «Errores que más se repiten») |
| F4 | Contenido del curso: árbol más claro y vista previa de la lección mientras se edita | Parte del rediseño v2 del docente; sin migración si se usa lo que ya guarda el servidor |
| F5 | Revisar con el equipo el logo pequeño (28 px) y el lanzador nuevo del Tutor | Es territorio de José: que lo apruebe |

## 2. Necesita el servidor (migración y comandos de despliegue)

| # | Qué | Por qué necesita servidor |
|---|---|---|
| B1 | Portada propia de cada clase (imagen o color elegido) | Columna nueva en la clase |
| B2 | Varias explicaciones por unidad que se desbloquean según el estudiante | Tabla nueva y reglas de desbloqueo |
| B3 | El Asistente del docente (IA que ayuda a armar contenido y ejercicios) | Servicio nuevo; ver `docs/PLAN_ASISTENTE_DOCENTE.md` |
| B4 | Marcar en el servidor los errores de concepto por tipo de ejercicio o reto | Hoy se agrupan solo por semana |

## 3. Del equipo o de decisión de Jeider

| # | Qué | Quién |
|---|---|---|
| E1 | Avisarle a José del logo, la mascota, el lanzador y el nombre STIRE | Jeider |
| E2 | Cargar Inter en grosor 800 para el nombre «stire_» (cambio en `main.css`, territorio de José) | José |
| E3 | Prueba de asistencia en iPhone | Equipo |
| E4 | Correcciones de ejercicios B-J02 (revisión de la semana 10) | Equipo |
| E5 | Verificar las fuentes de la investigación (tesis) | Jeider |
| E6 | Cerrar en Trello el tablero de la Semana 10 | Jeider |

## 4. Hecho recientemente (para contexto; se borra en la próxima actualización)

- 26/10: mascota del Tutor con expresiones y gestos; logo fijo con «stire_»; nombre STIRE; Inicio del docente nuevo;
  Biblioteca; manual con el menú nuevo; logo exportado en SVG y PNG (`docs/identidad-visual/logo/`); favicon en todos
  los navegadores; lanzador del Tutor rediseñado.
