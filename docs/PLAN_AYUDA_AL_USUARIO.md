# Plan de mejora: manual, recorrido guiado y menú de ayuda

Plan de investigación y de trabajo para que la ayuda de STIRE sea completa, didáctica y fácil de encontrar. Abarca tres
piezas que hoy existen por separado:

- el **manual** (`/ayuda` y su PDF);
- el **recorrido guiado** (Driver.js);
- el **menú**: el botón «?» de la cabecera y la barra lateral.

La meta es que funcionen como un solo sistema.

Escrito el 19/10/2026 sobre el código de `main`. Las cifras de la §1 se contaron en el repositorio.

## 1. Dónde estamos

| Pieza | Qué hay hoy | Qué le falta |
|---|---|---|
| **Manual** (`frontend-nuxt/utils/manual.ts`, `pages/ayuda.vue`) | **3 tareas** con pasos, captura y «si algo sale mal»: entrar, unirse a una clase y crear una clase. También **3 bloques** que explican cómo funciona STIRE: dominio, repasos y Tutor. Se ve sin cuenta y se descarga en PDF. | Faltan casi todas las tareas: practicar, repasar, usar el Tutor, ver el progreso, la asistencia, los contenidos, las notas, las entregas y todo el administrador. No tiene buscador, ni preguntas frecuentes, ni glosario. Ninguna pantalla lleva a su parte del manual. |
| **Recorrido** (`utils/recorridos.ts`, `composables/useRecorrido.ts`) | **12 recorridos**: 4 del estudiante, 5 del docente y 3 del administrador. Cada uno tiene de 2 a 5 pasos. Aparece la primera vez que se entra a una pantalla y se repite con «?». Se puede cerrar y respeta la opción de reducir el movimiento. | **Es pasivo**: solo se lee y se toca «Siguiente», nunca se le pide a la persona que haga algo. Además, faltan pantallas (lista abajo), no hay bienvenida por rol ni lista de primeros pasos, y no se sabe si alguien lo termina o lo cierra. |
| **Menú de ayuda** (botón «?» en `HeaderNav.vue`) | Solo repite el recorrido de la pantalla. | No lleva al manual, a las preguntas frecuentes, a los atajos ni a «Reportar un problema». En las pantallas sin recorrido, el «?» no hace nada útil. |
| **Barra lateral** (`SidebarNav.vue`) | Estudiante: Inicio, plan del curso, Repasos, Mi progreso, Mi asistencia, Mis proyectos y Mensajes. Docente: Mis clases, sus clases y Mensajes. Administrador: 6 secciones. | No tiene **Ayuda** para ningún rol: hoy el manual solo se enlaza desde el pie de página y desde la entrada. Al estudiante le faltan **Mis clases** y **Logros**, aunque las páginas existen (`estudiante/clases.vue` y `estudiante/logros.vue`). |

**Pantallas sin recorrido:**

- **Estudiante:** Mis clases, Repasos, Asistencia, Logros, Mensajes, Perfil, Proyectos, Entregas, Evaluación y Refuerzos.
- **Docente:** Entregas, Asistencia, Ajustes de la clase, Ejercicios, Refuerzos, Mensajes y Perfil.
- **Administrador:** Estado del sistema, Catálogo y Registros.

**Por qué importa:** en la encuesta SUS del equipo (81,5), la afirmación que más bajó el puntaje fue «necesitaría ayuda
de una persona técnica» (`docs/calidad/listas-chequeo/2026-10-17_revision_equipo/`). La ayuda es justo lo que responde
a esa afirmación.

## 2. Qué dicen los estándares y los referentes

### 2.1 Fuentes

**Comprobadas el 19/10/2026:**

| Fuente | Qué aporta a STIRE |
|---|---|
| **ISO/IEC/IEEE 26514:2022**, *Design and development of information for users* (https://www.iso.org/standard/77451.html) | Es la norma de la documentación para usuarios de software. Trae requisitos de estructura, contenido y formato, y pide averiguar primero qué información necesita cada usuario. Excluye la ayuda incrustada en la interfaz, así que rige el manual, no el recorrido. Solo se leyó el resumen público; el texto completo es de pago. |
| **Diátaxis**, de Daniele Procida (https://diataxis.fr) | Separa la documentación en cuatro tipos que no conviene mezclar: **tutorial** (aprender haciendo), **guía de tarea** (lograr algo concreto), **referencia** (consultar un dato) y **explicación** (entender por qué). |
| **Heurística 10 de Nielsen**, «Ayuda y documentación» (https://www.nngroup.com/articles/ten-usability-heuristics/) | La ayuda debe ser fácil de buscar, centrada en la tarea, con pasos concretos y corta. Lo ideal es que haga falta poco. |
| **WCAG 2.2** (https://www.w3.org/TR/WCAG22/) | Un recorrido no puede tapar el elemento que tiene el foco (2.4.11), debe manejarse con teclado y el contenido que aparece debe poder cerrarse (1.4.13). |

**Por verificar antes de citarlas en el artículo o la tesis** (regla del proyecto: no se cita sin comprobar la obra):

| Fuente | Qué aporta |
|---|---|
| Carroll, J. M. (1990). *The Nurnberg Funnel*. MIT Press | El **minimalismo**: la gente aprende haciendo tareas reales, no leyendo; la ayuda debe empezar por la acción y enseñar a salir de los errores. |
| Mayer, R. E., *Multimedia Learning* (Cambridge University Press; confirmar edición y año) | Principios de **segmentación** (en trozos cortos que la persona avanza), **señalización** (resaltar lo importante) y **preentrenamiento** (los nombres clave primero). Son la base didáctica del recorrido. |
| Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4 | La **carga cognitiva**: pocas cosas nuevas a la vez. Por eso cada recorrido se mantiene corto. |
| Artículos de Nielsen Norman Group sobre ayuda contextual y ayuda «pull» frente a «push» | La ayuda que aparece cuando la persona la busca suele servir más que un tutorial largo al empezar. La búsqueda solo encontró fuentes secundarias; falta leer el artículo original en nngroup.com. |

### 2.2 Referentes de producto que conviene observar

Son lecciones para aprender, no funciones que haya que copiar.

| Referente | Qué hace bien |
|---|---|
| **Centro de ayuda de Google Classroom** y **Guías de Canvas** | Organizan el manual por rol y por tarea, con una pregunta por título. El manual de STIRE ya sigue ese modelo, así que lo que falta es completarlo. |
| **Duolingo** | Se aprende haciendo: la primera lección *es* la introducción. |
| **Listas de primeros pasos** (Notion, GitHub y similares) | Unas pocas tareas iniciales con progreso visible, que se pueden ocultar. |
| **GitHub Docs** | Buscador, enlace directo a cada sección y «¿Te sirvió esta página?». |

## 3. Principios del plan

1. **Aprender haciendo.** El recorrido pide hacer la acción real cuando se pueda («Toca Probar»), no solo leer sobre ella.
2. **Corto y a tiempo.** Cada recorrido tiene de 3 a 5 pasos. Lo demás aparece cuando se necesita: un consejo en el
   momento, un estado vacío que enseña o un enlace «Ver más».
3. **Un solo vocabulario.** Manual, recorrido y pantalla usan las mismas palabras y los mismos nombres de botón. Esto ya
   es regla en `utils/manual.ts`.
4. **Todo opcional.** Nada bloquea a quien ya sabe: se puede cerrar, saltar u ocultar. Esto sigue el principio de
   herramienta flexible del proyecto.
5. **Accesible.** Se maneja con teclado, se lee con lector de pantalla y respeta la opción de reducir el movimiento.
6. **Se mide.** Cada mejora se comprueba con usuarios: con la encuesta SUS, con tareas observadas y con la prueba piloto.

## 4. Lo que se va a hacer

### Frente A: el manual (Pedro a cargo, S10-P07)

Se organiza con los cuatro tipos de Diátaxis, sobre la misma estructura de `utils/manual.ts`:

| Parte | Tipo | Contenido |
|---|---|---|
| **Primeros pasos** | Tutorial | Un recorrido de punta a punta por rol. El estudiante entra, se une a la clase, abre una lección, hace un ejercicio y le pregunta al Tutor. El docente crea la clase, comparte el código y mira «Hoy». |
| **Cómo hago…** | Guías de tarea | Unas **25 tareas**, cada una con pasos, captura, resultado y «si algo sale mal». Ver la lista abajo. |
| **Cómo funciona** | Explicación | Lo que ya existe (dominio, repasos y Tutor), más confianza, logros y para qué sirve cada dato del docente. |
| **Consulta rápida** | Referencia | Glosario, preguntas frecuentes, qué hace cada pantalla, atajos de teclado y requisitos: navegador, micrófono y clave de Gemini. |

**Tareas que faltan:**

- **Estudiante:** practicar un ejercicio, usar «Probar» y «Entregar», pedirle ayuda al Tutor (escrito y por voz), hacer
  los repasos del día, ver mi progreso y mi perfil, marcar asistencia con QR, ver mis entregas y su comentario, cambiar
  la apariencia, y enviar una sugerencia.
- **Docente:** armar los contenidos, crear un ejercicio, publicar u ocultar, revisar entregas, ver a quién ayudar
  (mapa de calor), asignar un refuerzo, tomar asistencia, llevar notas y exportarlas a Moodle, y copiar una clase.
- **Administrador:** aprobar a un docente, registrar un usuario, atender sugerencias, leer la encuesta SUS y revisar el
  estado del sistema.

**Mejoras de la página `/ayuda`:**

- Un **buscador** que filtre las tareas por palabras.
- Un **filtro por rol**.
- **Enlaces directos** a cada tarea (`/ayuda#hacer-repasos`).
- Capturas con **números sobre la imagen** que coinciden con los pasos.
- «**¿Te sirvió?**» al final de cada tarea.
- La fecha y la versión visibles.

El PDF se vuelve a generar con cada versión.

### Frente B: el recorrido guiado (Jeider)

1. **Bienvenida por rol:** 3 pasos la primera vez que alguien entra a STIRE, con qué es, dónde está lo principal y dónde
   está la ayuda.
2. **Lista de primeros pasos** en el inicio, con progreso («2 de 5») y la opción de ocultarla:
   - **Estudiante:** unirse a una clase, abrir una lección, resolver un ejercicio, preguntarle al Tutor y hacer un
     repaso.
   - **Docente:** crear la clase, compartir el código, publicar una lección y mirar «Hoy».
3. **Pasos «hazlo tú»:** el recorrido espera a que la persona haga la acción (tocar «Probar», abrir el Tutor) antes de
   seguir. Se implementa con los eventos de Driver.js y con el evento real de la pantalla. Siempre se puede tocar
   «Saltar».
4. **Cubrir las 20 pantallas que faltan** (§1), con los mismos anclajes `data-recorrido`.
5. **Cada paso enlaza a su tarea del manual** («Ver más en el manual»).
6. **Estados vacíos que enseñan.** Por ejemplo: «Aún no tienes repasos: aparecen cuando dominas tu primera lección».
7. **Saber si sirve:** contar cuántos recorridos se empiezan, se terminan o se cierran en el paso N, sin datos
   personales. **Decisión pendiente de Jeider:** hacerlo con un registro mínimo en el backend o dejarlo solo para la
   prueba piloto con observación.

### Frente C: el menú de ayuda y la barra lateral

El botón «?» pasa a ser un **menú de ayuda** con estas opciones:

| Opción | Qué hace |
|---|---|
| Recorrido de esta pantalla | Lo de hoy. Si la pantalla no tiene recorrido, la opción no aparece. |
| Ayuda sobre esta pantalla | Abre la tarea del manual que corresponde a la ruta. |
| Primeros pasos | Vuelve a mostrar la lista de primeros pasos. |
| Manual completo | `/ayuda` |
| Preguntas frecuentes | `/ayuda#preguntas` |
| Atajos de teclado | Una ventana con los atajos que existan. |
| Reportar un problema | El mismo flujo de `BotonSugerencias.vue`. |
| Novedades | Qué cambió en la última versión. |

En la barra lateral:

- **Ayuda** al final, para los tres roles.
- **Mis clases** y **Logros** para el estudiante, si la revisión con usuarios confirma que hacen falta. Hoy se llega a
  ellas desde el inicio.

Los colores y estilos del menú son territorio de José: este frente solo agrega la estructura y usa las clases que ya
existen.

## 5. Cómo se mide

| Qué | Cómo | Meta |
|---|---|---|
| La afirmación «necesitaría ayuda de una persona técnica» | Encuesta SUS dentro de STIRE, antes y después | Que suba su puntaje por afirmación |
| Tareas sin ayuda humana | Prueba piloto: 5 tareas por rol, observadas, contando si se logran solas | Al menos 4 de 5 por persona |
| Cobertura | Rutas con recorrido y tareas del manual sobre el total | Todas las pantallas principales |
| Uso del recorrido | Empezados, terminados y cerrados (si se aprueba el registro del punto B.7) | Saber en qué paso se abandona |
| Accesibilidad | axe-core más una prueba con teclado y lector de pantalla (NVDA) | Sin errores nuevos |

## 6. Orden de trabajo

| Fase | Qué | Quién | Prueba que la cierra |
|---|---|---|---|
| **0. Investigar** (1 semana) | Leer y verificar las fuentes de la §2.1. Observar 3 referentes y anotarlos en `investigacion/referentes/PATRONES_DE_INTERFAZ.md`. Preguntar a 3 personas del equipo dónde se perdieron. | Todo el equipo | Fichas de las fuentes verificadas |
| **1. Menú de ayuda y enlace en la barra** | Frente C | Jeider (estructura), José (estilo) | Prueba de `recorridoDeRuta` y del enlace pantalla → manual |
| **2. Manual completo** | Frente A: las 25 tareas, buscador, preguntas frecuentes y glosario | Pedro, con Julio en las tareas del Tutor | La prueba de `manual-usuario.frontend.spec.ts` amplía la lista de tareas que deben existir |
| **3. Recorrido didáctico** | B.1 a B.6 | Jeider | Pruebas de los nuevos recorridos y de la lista de primeros pasos |
| **4. Medir** | Prueba piloto con estudiantes y SUS antes y después | Todo el equipo | Resultados en `docs/calidad/` y, si se hace, en el artículo |

Cada fase sigue las reglas de siempre: cada cambio va con su prueba, se corren el build y las pruebas, y nada del
docente se vuelve obligatorio.

## 6b. Avance (19/10/2026)

**Hecho:**

- **Manual:** pasó de 3 a **17 tareas**, en `utils/manual.ts`:
  - **Para todos:** entrar y pedir ayuda.
  - **Estudiante:** 7 tareas (unirse, estudiar una lección, resolver un ejercicio, el Tutor, repasos, progreso y
    asistencia).
  - **Docente:** 5 tareas (crear la clase, contenidos, a quién ayudar, asistencia y notas para Moodle).
  - **Administrador:** 3 tareas (aprobar docentes, sugerencias y encuesta SUS).
- **Secciones nuevas del manual:**
  - **La repetición espaciada:** cuatro ideas y un calendario que muestra cuándo vuelve una lección según el resultado
    (Fácil, Bien, Difícil y Otra vez). Una prueba comprueba que sus días son los que calcula el motor SM-2.
  - **Preguntas frecuentes** (8) y **glosario** (8 palabras).
- **Página `/ayuda`:**
  - buscador que encuentra con o sin tildes;
  - filtro por rol, que muestra primero lo del rol de quien entró;
  - enlaces directos que llegan a su tarea aunque el filtro la oculte.

  El PDF se volvió a generar: 20 páginas.
- **Prueba nueva:** cada botón que nombra el manual entre «» existe con ese texto en la aplicación.
- **Recorrido:**
  - Bienvenida al inicio de cada rol.
  - Pasos «hazlo tú» en el ejercicio: tocar «Probar código» o el Tutor lleva al paso siguiente.
  - Enlace «Ver en el manual» en cada globo.
  - **4 pantallas nuevas:** Repasos, Mis clases, Mi asistencia y la asistencia del docente. Ya son 16 recorridos.

**Hecho el 20/10:**

- **Menú de ayuda (frente C):** el «?» de la cabecera ya está en todas las pantallas, también en el ejercicio. Reúne:
  - el recorrido de la pantalla;
  - la tarea del manual que la explica;
  - los primeros pasos (solo el estudiante);
  - el manual completo y las preguntas frecuentes;
  - «Contar un problema o una idea», que abre la ventana de sugerencias en blanco.

  Se cierra con Escape, tocando fuera o al cambiar de pantalla. Está en `components/layout/MenuAyuda.vue`.
- **Barra lateral:** «Ayuda» al final, para los tres roles.
- **Primeros pasos del estudiante (B.2):** una tarjeta en el inicio con 5 pasos y su avance («2 de 5»):
  1. unirse a la clase;
  2. abrir una lección;
  3. abrir un ejercicio;
  4. preguntarle al Tutor;
  5. mirar los repasos.

  Cada paso se marca solo cuando se hace. La tarjeta se puede ocultar, y el menú de ayuda la vuelve a mostrar.
- **Manual:** 6 tareas más, en total **23**:
  - cambiar los datos del perfil;
  - escribirle al docente;
  - crear un ejercicio;
  - recibir entregas;
  - avisar a la clase;
  - revisar el estado del sistema.
- **Recorridos:** 7 pantallas más, en total **23**. Las nuevas son mensajes del estudiante y del docente, logros,
  perfil del estudiante, entregas, crear ejercicio y estado del sistema.

**Cierre del 20/10:**

- **Pruebas en producción:** con la cuenta de prueba del estudiante, funcionan:
  - la bienvenida;
  - la lista de primeros pasos, que se completa sola y desaparece;
  - el menú de ayuda;
  - «Contar un problema o una idea»;
  - el recorrido de Repasos;
  - el «hazlo tú» del Tutor en el ejercicio.

  Se corrigieron tres detalles que se vieron ahí: los pasos ya hechos, el enlace pegado al texto y «Recorrido de el
  inicio».
- **Manual:** 4 tareas más, en total **27**. Las nuevas son proyecto propio, refuerzos y retos, ajustes de la clase y
  catálogo académico. El PDF tiene 25 páginas.
- **Recorridos:** 7 pantallas más, en total **30**. Las nuevas son proyectos, perfil del docente y del administrador,
  refuerzos, ajustes de la clase, catálogo y registros. Todas las pantallas del menú y de las pestañas de la clase tienen
  su recorrido.

**Falta:**

- **Pantallas de detalle sin recorrido:** un refuerzo o una entrega del estudiante, la revisión de una entrega, el
  detalle de un estudiante y las encuestas. Son pantallas a las que se llega desde otra que ya lo explica.
- **La medición** (§5).
- **Capturas** para las tareas que no tienen.
- **Probarlo como usuario en producción** después del despliegue.

## 7. Lo que no entra en este plan

- **Videos con narración:** cuestan mucho mantenerlos al día cuando la interfaz cambia. Si se hacen, que sean cortos
  y solo para los primeros pasos.
- **Un asistente con IA que responda sobre el manual:** el Tutor es para aprender a programar, no para soporte.
  Mezclarlos confundiría su papel.
