# Evaluación heurística humana — línea base antes de la remodelación (Semana 11)

**Objetivo:** encontrar los problemas de uso de STIRE **tal como está hoy** (v2.4.0), sobre todo en el panel del
docente, para que el rediseño de la Fase 2 (`docs/PLAN_REMODELACION.md`) los resuelva. Después de la remodelación se
repite con las mismas reglas, y esa segunda evaluación abre la v3.0.0.

**Resultado esperado:** cada uno entrega su tabla llena (abajo) con **al menos 8 problemas**, cada uno con la
heurística, la pantalla, la severidad y una captura. **Plazo: martes 3 de noviembre, 8:00 p. m.**

**Quiénes:** los 5 integrantes. Cada uno es responsable de **dos heurísticas** y las busca en todas las pantallas;
si ve un problema de otra heurística, también lo anota.

## Reglas

1. **Evalúa solo.** Llena tu sección antes de leer las de los demás. Lo valioso es lo que ve cada uno.
2. **Como usuario**, por lo que ves y haces; no por el código ni por lo que diga otra persona. Si dudas, compara con
   Moodle, Google Classroom, Canvas o Khan Academy.
3. En **https://stire-soft.vercel.app**, con tu cuenta de docente de la prueba (o `laura.martinez.docente@example.com`)
   y tu cuenta de estudiante.
4. En el computador y, si puedes, una pasada en el celular.
5. Capturas en `docs/calidad/evidencias/he-s11/` con tu código en el nombre (por ejemplo `HE-JOSE-03.png`).

## Las tareas (las hacen todos)

**Panel del docente (unos 30 minutos):**
1. Entra al Inicio y lee «Por revisar». Abre una clase.
2. Cambia de clase con el selector de la barra lateral.
3. En Contenido del curso: crea un tema y una lección, escribe una explicación corta, reordena la lección, muévela a
   otro tema y mírala con «Ver como estudiante».
4. Crea un ejercicio de opción múltiple y uno de programar.
5. Abre el Asistente y pide ejercicios para tu lección (si no tienes clave de Google AI Studio, evalúa lo que te dice).
6. Publica un aviso a la clase y corrígelo.
7. Abre la asistencia, déjala activa y sigue trabajando en otra pantalla.
8. Abre la ficha de un estudiante y mira su avance.

**Panel del estudiante (unos 15 minutos):** Inicio, una lección completa, un ejercicio (falla una vez a propósito),
pregúntale algo al Tutor, Mi progreso y Logros.

## Las 10 heurísticas y quién responde por cada una

| # | Heurística | Qué buscar en STIRE | Responsable |
|---|---|---|---|
| H1 | **Visibilidad del estado del sistema** | ¿Sé siempre dónde estoy, qué se guardó, qué está cargando, qué quedó publicado u oculto? | Jeider |
| H2 | **Coincidencia con el mundo real** | ¿Las palabras son las de un docente o un estudiante (lección, tema, nota), no las del programador? | Pedro |
| H3 | **Control y libertad** | ¿Puedo deshacer, cancelar, volver atrás o salir sin perder lo que hice? | Julio |
| H4 | **Consistencia y estándares** | ¿Lo mismo se llama, se ve y se comporta igual en todas partes? ¿Funciona como en otras plataformas? | José |
| H5 | **Prevención de errores** | ¿STIRE evita que me equivoque (borrar sin querer, publicar algo vacío, salir sin guardar)? | Jorge |
| H6 | **Reconocer antes que recordar** | ¿Veo las opciones a la mano, o tengo que acordarme de dónde estaba algo? | Jeider |
| H7 | **Flexibilidad y eficiencia** | ¿Lo frecuente se hace rápido? ¿Hay atajos para quien ya sabe, sin estorbar a quien empieza? | Julio |
| H8 | **Estética y diseño minimalista** | ¿Cada pantalla muestra solo lo necesario? ¿Algo satura, se repite o distrae (logo, mascota, avisos)? | José |
| H9 | **Reconocer y recuperarse de errores** | Cuando algo sale mal, ¿el mensaje dice qué pasó y cómo arreglarlo, en palabras simples? | Jorge |
| H10 | **Ayuda y documentación** | ¿Encuentro ayuda cuando la necesito (manual, «?», recorridos) y me sirve para la tarea? | Pedro |

**Además de sus dos heurísticas:**
- **José** evalúa en general los cambios de identidad (el logo, la mascota, la letra, el pie, el lanzador del Tutor) y
  el aspecto del panel del docente: ¿se ve como una sola aplicación? ¿qué cambiarías?
- **Jorge** tiene libertad: además de H5 y H9, prueba un poco de cada cosa desde QA (casos raros, doble clic, recargar
  a mitad de algo, celular, teclado) y anota lo que encuentre como mejor le parezca.

## Severidad

| Nivel | Significa |
|---|---|
| 0 | No es un problema de uso |
| 1 | Cosmético: se arregla si sobra tiempo |
| 2 | Menor: molesta, pero se puede seguir |
| 3 | Mayor: cuesta mucho o confunde; hay que arreglarlo antes de la v3.0.0 |
| 4 | Catástrofe: impide terminar la tarea; se arregla ya |

## Tablas (cada uno la suya)

Columnas: **ID** (`HE-NOMBRE-01`…) · **H** (H1 a H10) · **Pantalla** · **Qué pasa** (una o dos frases) · **Sev.** (0 a 4)
· **Sugerencia** · **Captura**.

### Jeider (H1, H6)

| ID | H | Pantalla | Qué pasa | Sev. | Sugerencia | Captura |
|---|---|---|---|---|---|---|
| HE-JEIDER-01 | | | | | | |

### Pedro (H2, H10)

| ID | H | Pantalla | Qué pasa | Sev. | Sugerencia | Captura |
|---|---|---|---|---|---|---|
| HE-PEDRO-01 | | | | | | |

### Julio (H3, H7)

| ID | H | Pantalla | Qué pasa | Sev. | Sugerencia | Captura |
|---|---|---|---|---|---|---|
| HE-JULIO-01 | | | | | | |

### José (H4, H8, identidad y aspecto del docente)

| ID | H | Pantalla | Qué pasa | Sev. | Sugerencia | Captura |
|---|---|---|---|---|---|---|
| HE-JOSE-01 | | | | | | |

### Jorge (H5, H9 y QA libre)

| ID | H | Pantalla | Qué pasa | Sev. | Sugerencia | Captura |
|---|---|---|---|---|---|---|
| HE-JORGE-01 | | | | | | |

## Después de entregar

Jeider junta las cinco tablas, une los problemas repetidos y ordena por severidad. Los de severidad 4 se corrigen de
inmediato; los de 3 y 2 entran al diseño de la Fase 2.
