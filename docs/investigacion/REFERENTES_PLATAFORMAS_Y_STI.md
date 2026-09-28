# Referentes para llevar a STIRE al nivel de las plataformas exitosas

**Qué es este documento.** La investigación de referentes que respalda la dirección de producto de STIRE:
cómo organizan y crean cursos las plataformas grandes (Moodle, Open edX, Coursera, Udemy, Platzi), cómo
enseñan programación las más usadas (Codecademy, Sololearn, Duolingo, Khan Academy, CS50), qué es un
Sistema Tutor Inteligente (STI) y qué dice la investigación sobre STI de programación y sobre la IA
generativa en educación. Al final hay una propuesta priorizada para STIRE.

**Qué no es.** No es la matriz bibliográfica de la tesis (`MATRIZ_ARTICULOS_AMPLIADA.md`) ni texto para el
informe de tesis. Si algo de aquí pasa al informe, se redacta allá con sus reglas (modo prospectivo, sin
tecnologías concretas). Cuando una obra ya está en la matriz, se cita con su número (p. ej. «matriz #5»).

**Cómo se verificó (2026-09-27).**
- Cada artículo académico de la §12 se comprobó contra la API de Crossref: el DOI existe y el título, los
  autores y la revista coinciden. Ninguno viene de NotebookLM ni de memoria sin comprobar
  (ver `INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`).
- Lo que se afirma de cada plataforma sale de su documentación o su blog oficial, o de prensa citada con
  su enlace. Las plataformas cambian: vale como «así era en septiembre de 2026».
- Lo que se afirma de STIRE se comprobó leyendo el código en esa fecha (se cita el archivo).

---

## 1. La visión: un tutor humano en formato digital

Texto del dueño del proyecto (Jeider Gómez), que es el norte de todo lo que sigue:

> STIRE no es un sistema de calificaciones; es un compañero de aprendizaje. Aprender a programar no es
> memorizar sintaxis, sino desarrollar una estructura mental lógica. El corazón de STIRE es la evolución
> cognitiva del estudiante.
>
> 1. **La paciencia infinita de un experto.** Si un alumno tiene dificultades, el tutor no le da la
>    respuesta: analiza el error, identifica el vacío conceptual y sugiere un ejercicio del banco que
>    fortalezca esa lógica, usando el método socrático.
> 2. **Un diseño intuitivo y natural (estilo Duolingo/Anki).** El estudiante siempre sabe qué sigue y
>    cuándo debe repasar un tema que está «empezando a olvidar». La repetición es estratégica.
> 3. **Justicia académica y esfuerzo.** Repetir un ejercicio que ya domina se reconoce, pero pesa menos
>    en su dominio (*mastery*). Para avanzar hay que salir de la zona de confort, con retos de
>    complejidad incremental.
> 4. **El docente en el centro.** STIRE es un sistema de rayos X: un «mapa de calor» del grupo con quién
>    está bloqueado, qué tema es el más difícil y quién está listo para un reto mayor. El docente deja
>    de calificar y pasa a mentorear.
> 5. **Simplicidad para el creador.** Crear un curso debe ser tan sencillo como organizar carpetas:
>    cargar la teoría, diseñar los retos y armar el curso con una curva de aprendizaje mínima.

**Público.** Licenciatura en Informática (Facultad de Educación, Universidad de Córdoba), pero pensado para
que cualquier docente de otra carrera o área organice su curso como quiera.

---

## 2. Cómo organizan los cursos: STIRE frente a los demás

**Pregunta de partida: ¿un tema puede tener varias unidades de aprendizaje?** Sí. En el código cada unidad
pertenece a un tema (`src/learning-unit/entities/learning-unit.entity.ts`, `@ManyToOne(() => Topic)`) y
cada tema tiene una lista de unidades. Lo mismo vale un nivel arriba: una sección tiene varios temas y una
clase tiene varias secciones.

| Plataforma | Jerarquía | Dónde está lo que el estudiante hace |
|---|---|---|
| **STIRE** | Clase → Sección → Tema → Unidad de aprendizaje → contenidos + actividades | En la unidad |
| **Open edX** (edX, MIT) | Curso → *Section* → *Subsection* → *Unit* → *Components* | En la unidad, como componentes (video, texto, problema) |
| **Moodle** | Curso → Sección (tema o semana) → Recursos y actividades | Directamente en la sección |
| **Coursera** | Curso → Módulo (normalmente una semana) → Lecciones → Ítems (video, lectura, cuestionario) | En los ítems |
| **Udemy** | Curso → Sección → Ítems (lección en video, cuestionario, ejercicio de código, tarea, examen de práctica) | En los ítems |
| **Platzi** | Escuela → Ruta → Curso → Clase | En la clase (video, recursos, comentarios) y el examen del curso |
| **Duolingo** | Curso → Sección → Unidad → Nivel → Lección | En la lección |
| **Khan Academy** | Curso → Unidad → Lección → Habilidad/ejercicio | En la habilidad, que tiene nivel de dominio |
| **MOCAVI** (modelo de la Universidad de Córdoba en Moodle) | Curso → Sección general + sección de comunicación + **una sección por unidad de aprendizaje** con 4 momentos: Proyección, Co-creación, Aplicación, Difusión | En los recursos y evidencias de cada momento |

**Qué se concluye.**

1. **STIRE tiene la jerarquía más profunda, igual que Open edX.** Open edX usa cuatro niveles como STIRE
   y resuelve la profundidad así: en la navegación se ven secciones y subsecciones, y los componentes solo
   aparecen al abrir una unidad. **Regla para STIRE: nunca mostrar más de dos niveles a la vez.** El índice
   del curso muestra secciones con sus temas; al entrar a un tema se ven sus unidades; al entrar a una
   unidad, su contenido.
2. **Los niveles deben ser opcionales en la práctica.** En Moodle la sección puede ser un tema o una semana
   («formato de curso»); en Coursera el módulo casi siempre es una semana. Un docente de otra carrera no
   piensa en «tópicos». **Propuesta:** que el docente elija el nombre de cada nivel (Módulo/Semana/Unidad…),
   y que un tema con una sola unidad no obligue al estudiante a un clic extra. Una sola unidad se abre
   directo.
3. **MOCAVI encaja con STIRE.** El modelo pedagógico de la propia Facultad de Educación
   (`fuentes-institucionales/2023 05 01 Modelo pedagógico Educación virtual - MOCAVI.pdf`, §4.7 y §5.2)
   recomienda:
   - **tres unidades de aprendizaje por curso**, cada una con un resultado de aprendizaje y al menos tres
     evidencias;
   - los momentos **Proyección → Co-creación → Aplicación → Difusión** dentro de cada unidad.

   Una **plantilla de clase «MOCAVI»** que cree esa estructura con un clic haría que STIRE hable el idioma
   institucional:
   - 3 secciones = 3 unidades de aprendizaje del FDOC-088;
   - cada momento sería un tema o una etiqueta de actividad.

   Además, MOCAVI §3.5 nombra explícitamente los «sistemas tutores inteligentes y sistemas basados en
   analítica del aprendizaje» como recursos esperados.

---

## 3. El docente: cómo crean los cursos las plataformas exitosas

### 3.1 Patrones que se repiten

| Patrón | Quién lo hace | Qué resuelve |
|---|---|---|
| **Constructor de índice** con creación en línea y arrastrar para reordenar | Udemy (página *Curriculum*), Open edX Studio (secciones que se expanden y contraen), Moodle (modo edición) | «Organizar como carpetas»: el docente ve todo el curso en una pantalla |
| **Borrador / publicado** por elemento | Udemy: hasta 1400 ítems creados, 800 publicados a la vez; Open edX; STIRE (secciones) | Preparar sin que el estudiante vea lo inacabado |
| **Vista como estudiante** | Open edX (*preview*), Moodle (cambiar rol), STIRE (enunciado en «Ver como el estudiante») | Confianza antes de publicar |
| **Liberación condicionada**: se abre al completar lo anterior, por fecha o por nota | Moodle *Restrict access*, que combinado con *Activity completion* da «una narrativa secuencial» | Orden pedagógico sin micromanejo |
| **Criterio de completado** por elemento: visto, entregado, nota mínima | Moodle *Activity completion* | Progreso real y no clics |
| **Recursos variados**: archivo, carpeta, página, URL, libro, texto y multimedia | Moodle (7 tipos de recurso estándar); Open edX (componentes) | Teoría rica sin salir de la plataforma |
| **Borrador con IA revisado por el docente** | Coursera *Course Builder* (esquemas, descripciones y objetivos generados con IA; Coursera reporta 87 % menos tiempo de creación); Moodle 4.5 (*Generate text*, *Generate image*, *Summarise*) | Bajar la curva del creador sin quitarle el control |
| **Diálogos socráticos definidos por el docente** | Coursera Coach: el instructor arma módulos de diálogo socrático con rúbricas a partir de sus materiales | La IA sigue la intención del docente |

### 3.2 Qué tiene STIRE hoy y qué le falta (código revisado el 2026-09-27)

| Ya existe | Falta o está a medias |
|---|---|
| Jerarquía completa y publicación de secciones | **Multimedia en la pantalla del docente.** El backend ya acepta contenidos `VIDEO`, `PDF`, `IMAGE` y `CODE` (`src/common/enums/content-type.enum.ts`; metadatos `{url, duration, provider}`, `{url, pages}`, `{url, alt, width, height}` en `content.entity.ts`), pero el frontend no ofrece ninguno: solo lecciones en Markdown |
| Constructores de ejercicios de 7 tipos, con vista previa | Plantillas de clase (MOCAVI, «curso de programación», «curso teórico») y **duplicar una clase** para el semestre siguiente |
| Edición del enunciado con «Ver como el estudiante» | Liberación condicionada visible para el docente. La entidad `Prerequisite` existe (`src/prerequisites/`), pero no hay una pantalla para configurarla |
| Tipos de actividad (Práctica formativa, Taller, Parcial) | Resultados de aprendizaje por unidad (lo que exige el FDOC-088 y MOCAVI) |
| — | Borrador asistido por IA **revisado** por el docente, por ejemplo proponer 3 ejercicios desde la lección |

---

## 4. El estudiante: cómo se ve y se siente aprender en las plataformas exitosas

| Patrón | Plataforma | Por qué funciona |
|---|---|---|
| **Una sola ruta con el siguiente paso evidente**: lecciones, historias y práctica personalizada en un único recorrido lineal | Duolingo (*learning path*) | «Siempre sé qué sigue» (pilar 2); no hay que navegar pestañas |
| **Práctica personalizada dentro de cada unidad** con los errores propios; práctica diaria que se renueva | Duolingo (*personalized practice*, *Practice Hub*) | Repaso donde el estudiante está, no en otra pantalla |
| **Niveles de dominio visibles**: Intentado → Familiar → Competente → Dominado (50 / 80 / 100 puntos de dominio); pueden **bajar** si se falla después | Khan Academy | El dominio es algo vivo, no una casilla marcada |
| **Retos de dominio que mezclan habilidades**: 6 preguntas de 3 habilidades, disponibles cada 12 h | Khan Academy (*Mastery Challenges*) | Práctica intercalada y espaciada integrada en el juego |
| **Pantalla dividida**: explicación a la izquierda; editor y salida a la derecha; pasos (*checkpoints*) que se marcan al cumplirse | Codecademy | Leer, probar y ver el resultado sin cambiar de pantalla (menos atención dividida, matriz #15) |
| **«Get Unstuck»**: repaso del concepto, luego la solución; ayuda graduada | Codecademy | Ayuda escalonada, no todo o nada |
| **Lecciones de bocado + práctica inmediata + comentarios de otros estudiantes** en cada lección | Sololearn | Poca carga por sesión, pensado para el celular |
| **Índice lateral del curso con marca de completado** junto al contenido | Udemy, Coursera, Open edX | Orientación: dónde estoy y cuánto falta |
| **Explicar el código resaltado**; «pato» conversacional que guía sin resolver | CS50.ai | Tutor disponible 24/7 con la personalidad de un buen TA |

**Lectura para STIRE.** Ya tiene piezas de casi todo: repasos con SM-2, estados de dominio (`NO_VISTO → EXPLORADO → EN_PRACTICA → COMPRENSION_PARCIAL → DOMINADO` en `learning-progress.service.ts`), recomendación de la siguiente actividad y tutor con ayuda graduada. Lo que falta es **coserlas en un solo recorrido**:

- una portada «**Continuar**» que proponga el siguiente paso: lección, ejercicio o repaso vencido;
- el nivel de dominio visible **en cada unidad del índice**;
- repasos que aparezcan **dentro** de la ruta, no solo en la pantalla de Repasos.

---

## 5. Multimedia: imágenes, enlaces, video y PDF

**Qué dice la evidencia.**
- **Principios de Mayer para multimedia** (Mayer y Moreno, 2003):
  - reducir la carga cognitiva segmentando el material;
  - señalar lo importante;
  - quitar lo decorativo (coherencia);
  - poner el texto junto a la imagen que explica (contigüidad).
- **Videos cortos.** En 6,9 millones de sesiones de edX, la participación cae a partir de unos 6 minutos de
  video. También funcionan mejor los videos informales («cabeza parlante» con diapositivas) y el trazo a
  mano tipo Khan que las grabaciones de clase magistral (Guo, Kim y Rubin, 2014).
- **Visualizar la ejecución** del programa ayuda al novato. Ejemplo: Python Tutor (Guo, 2013); ver
  también la matriz #16 y #17 sobre la máquina nocional.

**Propuesta para STIRE**, respetando la regla de cero cobros: no alojar video, solo enlazar.
1. **Video.** Insertar enlaces de YouTube (dominio `youtube-nocookie.com`) o Vimeo por URL, con la duración
   visible. Sugerir en el formulario «idealmente menos de 6 minutos».
2. **PDF.** Enlazado (Drive, repositorio institucional), con visor embebido y botón de descarga. Si se
   aloja, límite de tamaño.
3. **Imagen.** Con **texto alternativo obligatorio**, por accesibilidad. En las lecciones Markdown también
   se admite `![alt](url)` y el sanitizador debe permitir solo `https`.
4. **Enlace externo** como recurso con descripción («Lee esto antes de la unidad»).
5. **Bloque de código ejecutable** dentro de la lección: el contenido `CODE` ya existe en el backend. Con
   «Ejecutar» usando el juez actual se convierte en el ejemplo trabajado interactivo del §6.
6. Todo esto es **por unidad y ordenable**, como los componentes de Open edX: lección, luego video, luego
   ejercicio.

> Seguridad: al renderizar enlaces e *iframes* se mantiene la política actual (DOMPurify + segmentos de
> código protegidos). Solo se permiten *iframes* de una lista cerrada de dominios y la prueba de
> consistencia de segmentos debe cubrir el caso nuevo.

---

## 6. Cómo se enseña a programar para que parezca sencillo

Lo que hacen Sololearn o Codecademy en la pantalla tiene nombre en la investigación:

| Técnica | Evidencia | Equivalente en STIRE |
|---|---|---|
| **Ejemplos trabajados** antes de resolver solo, y **desvanecimiento**: el ejemplo va perdiendo pasos | Atkinson et al. (2000); carga cognitiva (matriz #14) | `fill_code` es un ejemplo desvanecido. Falta el ejemplo completo **ejecutable** en la lección |
| **Problemas de Parsons**: ordenar líneas dadas | Denny, Luxton-Reilly y Simon (2008); revisión de Ericson et al. (2022) | `ordering` con bloques de código |
| **PRIMM**: Predecir → Ejecutar → Investigar → Modificar → Crear | Sentance, Waite y Kallia (2019) | Serie de ejercicios por unidad: `mcq` «¿qué imprime?», luego ejecutar, luego `fill_code`, luego `coding` |
| **Usar → Modificar → Crear** | Lee et al. (2011) | Igual que arriba, con el código inicial como punto de partida |
| **Etiquetas de submetas**: nombrar los pasos del procedimiento («1. Leer la entrada, 2. …») | Margulieux, Guzdial y Catrambone (2012) | Encabezados fijos en las lecciones y comentarios guía en el código inicial |
| **Fracaso productivo**: intentar antes de la explicación, en tareas bien elegidas | Kapur (2008) | Un «reto de entrada» opcional al abrir la unidad |
| **Práctica intercalada**: mezclar tipos de problema | Kornell y Bjork (2008) | Repaso mixto de varias unidades, como el reto de dominio de Khan |
| **Mensajes de error comprensibles**, incluso mejorados con IA | Becker et al. (matriz #19); Leinonen et al. (2023) | Consola del juez y botón «Explícame este error» del tutor |
| **Retroalimentación inmediata y adaptativa** para aumentar la persistencia | Marwan et al. (2020) | Casos de prueba públicos y resultado al instante |

**Revisiones de fondo:** Robins, Rountree y Rountree (2003) y Luxton-Reilly et al. (2018) sobre lo que
cuesta aprender a programar. Sirven para justificar el orden de las unidades.

---

## 7. ¿Qué es un Sistema Tutor Inteligente (STI)?

**Definición operativa.** Un STI es un programa que enseña adaptándose a cada estudiante, porque tiene
**cuatro modelos** (Nwana, 1990):
1. **Dominio:** qué se enseña; en STIRE, el curso, las unidades y los ejercicios con sus casos.
2. **Estudiante:** qué sabe y qué no; en STIRE, el dominio por unidad y los repasos.
3. **Tutor o pedagógico:** qué hacer ahora; en STIRE, la recomendación de la siguiente actividad y los
   niveles de ayuda.
4. **Interfaz:** cómo se comunica.

**Los dos lazos** (VanLehn, 2006):
- **lazo externo:** elegir la siguiente tarea;
- **lazo interno:** ayudar *dentro* de la tarea, paso a paso, con pistas y retroalimentación.

Los tutores «por pasos» se acercan a la tutoría humana (VanLehn, 2011, matriz #5).

**¿Funcionan?** Metaanálisis:
- Ma et al. (2014) y Kulik y Fletcher (2016) encuentran efectos positivos y consistentes frente a la
  enseñanza convencional.
- Bloom (1984, matriz #30) planteó el «problema de las 2 sigmas»: la meta es acercarse a la tutoría uno a
  uno.

**STI de programación que marcaron el camino.**

| Sistema | Idea clave | Fuente |
|---|---|---|
| **LISP Tutor / Cognitive Tutors** (Carnegie Mellon) | Modelo de reglas de producción y seguimiento del modelo paso a paso | Anderson et al. (1995) |
| **Knowledge Tracing** | Probabilidad de que el estudiante domine cada habilidad, actualizada con cada respuesta (BKT) | Corbett y Anderson (1995); panorama en Pelánek (2017) |
| **SQL-Tutor y tutores por restricciones** | Evalúan si la solución viola restricciones del dominio, no si sigue un único camino; útil cuando hay muchas soluciones válidas | Mitrovic (2012) |
| **ELM-ART e hipermedia adaptativa** | Navegación y anotación de enlaces según lo que el estudiante ya sabe (listo / no listo) | Brusilovsky (2001) |
| **Ask-Elle** (Haskell) | Retroalimentación en ejercicios de programación con soluciones modelo que el docente define | Gerdes et al. (2017) |
| **ITAP** (Python) | Pistas generadas automáticamente a partir de soluciones de otros estudiantes | Rivers y Koedinger (2017) |
| Revisiones del campo | Qué tipos de retroalimentación dan los STI de programación y cuáles faltan | Crow, Luxton-Reilly y Wuensche (2018); Keuning, Jeuring y Heeren (2018) |

**Dos advertencias clásicas que el tutor de STIRE debe tener en cuenta.**
- **Abuso de la ayuda.** Los estudiantes «juegan con el sistema»: piden pistas en ráfaga hasta la última o
  adivinan. Se puede detectar (Baker, Corbett y Koedinger, 2004). STIRE ya decide el nivel de ayuda por
  intentos fallidos reales y no por clics (`src/tutor/tutor-guidance.ts`), lo cual va en esa línea.
- **La ayuda ayuda, pero solo hasta cierto punto.** Los estudiantes no siempre piden ayuda cuando la
  necesitan, y a veces la piden cuando no la necesitan (Aleven et al., 2016; *assistance dilemma*,
  matriz #6).

**Repetición espaciada, más allá de SM-2.**
- Duolingo publicó un modelo entrenable de «vida media» del recuerdo (*half-life regression*, Settles y
  Meeder, 2016).
- El algoritmo moderno de Anki (FSRS) viene de optimizar el calendario con datos reales de repaso (Ye, Su
  y Cao, 2022).

Esto responde al «empezando a olvidar» de la visión: con suficientes datos, STIRE podría estimar la
probabilidad de recordar cada unidad en vez de usar intervalos fijos.

---

## 8. La IA generativa en la enseñanza de la programación

**Qué están haciendo los referentes.**
- **CS50.ai (Harvard).** Un «pato» que guía sin dar la respuesta, «Explica el código resaltado» y
  sugerencias de estilo; los estudiantes dijeron sentir «un tutor personal» (Liu et al., 2024).
- **CodeHelp.** Asistente con **barreras (*guardrails*)** que evitan entregar soluciones; el docente
  configura el contexto de la clase (Liffiton et al., 2023).
- **CodeAid.** Desplegado con 700 estudiantes; equilibra lo que quiere el estudiante (respuestas rápidas) y
  lo que quiere el docente (que aprenda). Da pseudocódigo y explicaciones en vez de código final
  (Kazemitabaar et al., 2024).
- **Khanmigo.** Método socrático: nunca da la respuesta.
  - **Advertencia:** en un estudio reportado por *The Hechinger Report*, muchos estudiantes intentaban
    sacarle la respuesta y, cuando se negaba y hacía preguntas, **dejaban de usarlo**.
  - El diseño socrático necesita que las preguntas sean cortas, útiles y que se note el avance.
- **Coursera Coach.** Tutor en 26 idiomas con más de 34 millones de mensajes. Los instructores pueden crear
  diálogos socráticos con rúbricas a partir de sus propios materiales.
- **Moodle 4.5.** Subsistema de IA con «ubicaciones» que el administrador activa: resumir la página del
  curso, generar texto e imagen en el editor.
- **Duolingo, «Explain My Answer».** Nació en Duolingo Max y hoy es gratuito: da una explicación
  personalizada del error dentro de la lección, justo después de cometerlo. En *Roleplay*, las personas
  escriben los escenarios y la IA solo conduce la conversación.

**Qué dice la investigación (lo que más debe pesar).**
- **Sin barreras, la IA puede perjudicar el aprendizaje.** En un experimento de campo con cerca de mil
  estudiantes de secundaria:
  - quienes practicaron con un GPT-4 sin restricciones rindieron mejor durante la práctica, pero **peor**
    en el examen sin IA;
  - un tutor con barreras (pistas, sin respuesta) mitigó en gran medida ese daño (Bastani et al., 2025).

  Es el argumento más fuerte a favor del enfoque socrático de STIRE.
- **Los modelos de lenguaje responden bien a pedidos de ayuda de principiantes, pero:**
  - a veces señalan errores que no existen;
  - tienden a dar código aunque se les pida no hacerlo (Hellas et al., 2023).

  Por eso STIRE tiene un guardián de soluciones en el servidor (`src/tutor/tutor-solution-guard.ts`), y
  debe mantenerse.
- **Características deseables de un asistente de IA en programación** (Denny et al., 2024, ITiCSE):
  - que no dé la solución completa;
  - que sea preciso;
  - que esté en contexto con el curso;
  - que el docente tenga visibilidad.
- **Panoramas y agenda:** Prather et al. (2023), Denny et al. (2024, CACM) y Kasneci et al. (2023). Los
  temas son la evaluación, la integridad académica, nuevas competencias (leer y verificar código
  generado) y la equidad.

**Implicaciones concretas para el tutor de STIRE.**
1. **Pistas con contexto real.** Mandar a la IA el enunciado, el código del estudiante, los casos que
   fallan y **la lección de la unidad**, que hoy no se usa como contexto. Con la lección, el tutor
   «habla como el docente».
2. **Respuestas cortas y con salida.** Una pregunta guía, más una acción («prueba con la entrada `3`»).
   Si tras el nivel 3 sigue bloqueado, **recomendar un ejercicio más fácil del banco** sobre el mismo
   concepto (pilar 1). Así no se queda en un callejón socrático, que es la lección de Khanmigo.
3. **«Explícame este error»** junto a la consola, estilo Leinonen et al. (2023) y «Explain My Answer» de Duolingo.
4. **Visibilidad para el docente:** en el mapa de calor, cuántas veces pidió ayuda cada estudiante y en qué
   unidad, como piden Denny et al. (2024).
5. **Mantener las barreras y probarlas**, como ya exige `tutor-solution-guard.spec.ts`.

---

## 9. El docente en el centro: el mapa de calor

- **Tableros para el docente.** Funcionan cuando convierten datos en una acción concreta: a quién ayudar
  ahora (matriz #20 y #21).
- **Lumilo.** Holstein, McLaren y Aleven (2018) dieron a los docentes unas gafas de realidad mixta que
  mostraban en tiempo real qué estudiante estaba atascado o abusando de la ayuda en un aula con STI.
  **Los estudiantes aprendieron más**, porque el docente atendía primero a quien lo necesitaba.

Es exactamente el «sistema de rayos X» del pilar 4.

**Estado en STIRE.** `pages/docente/rendimiento.vue` tiene indicadores de la clase y un filtro de
estudiantes en riesgo (menos del 50 %).

**Propuesta de mapa de calor.** Una matriz de **estudiantes × unidades**:
- cada celda con el color del estado de dominio;
- tres listas encima que responden las tres preguntas de la visión:
  - **Bloqueados:** tres o más intentos fallidos seguidos, o nivel de ayuda 3, en los últimos 7 días.
  - **Tema más difícil:** la unidad con menor dominio promedio y más intentos por acierto.
  - **Listos para más:** dominio de 85 % o más en todas las unidades publicadas.

Al hacer clic en una celda se abre el historial de entregas de ese estudiante en esa unidad.

---

## 10. Gamificación, esfuerzo y justicia

- **Qué funciona.** Un metaanálisis encontró efectos pequeños pero positivos de la gamificación sobre el
  aprendizaje cognitivo, motivacional y conductual. Funciona mejor cuando hay **ficción o narrativa** y
  **competencia combinada con colaboración**, no solo puntos y medallas (Sailer y Homner, 2019). Por
  definición, la gamificación es usar elementos de diseño de juegos en contextos que no son juegos
  (Deterding et al., 2011).
- **Estado en STIRE.**
  - **Justicia académica (pilar 3).** Ya está en el cálculo del dominio: repetir un ejercicio **básico**
    más de dos veces reduce su peso un 15 % por intento extra, hasta un mínimo del 50 %. Los ejercicios
    difíciles no se penalizan (`src/common/utils/mastery.calculator.ts`).
  - **Gamificación.** El módulo está **en pausa** (`src/gamification/gamification.service.ts`).
- **Propuesta.** Antes que medallas:
  - **Racha de estudio semanal**, no diaria: en la universidad la racha diaria castiga a quien estudia
    tres días fijos.
  - Hacer visible el **esfuerzo en retos difíciles** («Resolviste 2 ejercicios avanzados esta semana»).
  - Reconocer el esfuerzo en repeticiones fáciles sin inflar el dominio: «+ práctica», no «+ dominio».

---

## 11. Los cinco pilares frente a la evidencia y a STIRE hoy

| Pilar | Qué respalda la evidencia | Qué hace STIRE hoy (código) | Brecha principal |
|---|---|---|---|
| 1. Paciencia de experto, sin dar respuestas | VanLehn 2011; Aleven 2016; Bastani 2025; CodeHelp; CS50.ai | Tutor con 3 niveles por intentos fallidos y guardián de soluciones; recomendación por repasos vencidos y dominio bajo (`tutor-recommendation.service.ts`) | Contexto de la lección para la IA; recomendar un ejercicio más fácil **del mismo concepto** al llegar al nivel 3; «Explícame este error» |
| 2. Diseño natural estilo Duolingo/Anki | Duolingo *path*; Khan (niveles de dominio); Settles 2016; Ye 2022; Kornell 2008 | SM-2, estados de dominio, pantalla de Repasos | Una ruta única con «Continuar»; repasos dentro de la ruta; repaso mixto de varias unidades |
| 3. Justicia académica | Baker 2004 (abuso del sistema); Khan (el dominio puede bajar) | Menor peso por repetir lo básico (`mastery.calculator.ts`) | Mostrarlo al estudiante («esto ya lo dominas; prueba un reto») y proponer retos de mayor dificultad |
| 4. Docente en el centro | Holstein 2018; matriz #20 y #21 | Indicadores y filtro de riesgo | Mapa de calor estudiantes × unidades con las tres listas (§9) |
| 5. Simplicidad para el creador | Constructores de Udemy, Open edX y Moodle; Coursera Course Builder; MOCAVI | 7 constructores de ejercicios, vista previa, publicación | Multimedia (backend listo); plantillas (MOCAVI); duplicar clase; borrador con IA revisado por el docente |

---

## 12. Hoja de ruta propuesta (priorizada)

Son propuestas; cada una se discute y se aprueba antes de hacerse. El orden prioriza **mucho impacto con
poco código**.

| # | Qué | Por qué primero | Tamaño |
|---|---|---|---|
| 1 | **Multimedia en la unidad:** video por enlace, PDF, imagen con texto alternativo y enlace externo, ordenables | El backend ya lo soporta; es lo que más cambia la experiencia de «plataforma de cursos» | Mediano (frontend + validación de URL + pruebas de sanitizado) |
| 2 | **«Continuar» y dominio visible en el índice** | Pilar 2 con piezas que ya existen | Pequeño |
| 3 | **Mapa de calor del docente** | Pilar 4; los datos ya están en el progreso y las entregas | Mediano |
| 4 | **Tutor con la lección como contexto**, ejercicio más fácil tras el nivel 3 y «Explícame este error» | Pilar 1; fuerte respaldo de la evidencia | Mediano |
| 5 | **Plantilla MOCAVI y duplicar clase** | Pilar 5 y alineación institucional | Pequeño-mediano |
| 6 | **Repaso mixto** (reto de 6 preguntas de 3 unidades) | Práctica intercalada y espaciada | Mediano |
| 7 | **Liberación condicionada visible** (usar `Prerequisite`) | Orden pedagógico opcional | Mediano |
| 8 | **Niveles con nombre propio** (Módulo/Semana/Unidad) y tema de una sola unidad sin clic extra | Flexibilidad para otras carreras | Pequeño |
| 9 | **Estimar el olvido con datos** (estilo FSRS) en lugar de intervalos fijos | Requiere datos de uso real; después del piloto | Grande |
| 10 | **Gamificación sobria:** racha semanal y reconocimiento del esfuerzo | Después de medir con usuarios reales | Mediano |

---

## 13. Referencias

### 13.1 Artículos académicos (verificados en Crossref el 2026-09-27)

**Nota:** los números de la matriz (#5, #6, #14…) se refieren a `MATRIZ_ARTICULOS_AMPLIADA.md` y no se repiten aquí.

**STI: definición, efectividad y modelado del estudiante**
- Nwana, H. S. (1990). Intelligent tutoring systems: an overview. *Artificial Intelligence Review, 4*(4). https://doi.org/10.1007/BF00168958
- Anderson, J. R., Corbett, A. T., Koedinger, K. R. y Pelletier, R. (1995). Cognitive Tutors: Lessons Learned. *Journal of the Learning Sciences, 4*(2), 167-207. https://doi.org/10.1207/s15327809jls0402_2
- Corbett, A. T. y Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction, 4*(4), 253-278. https://doi.org/10.1007/BF01099821
- VanLehn, K. (2006). The Behavior of Tutoring Systems. *International Journal of Artificial Intelligence in Education, 16*(3). https://doi.org/10.3233/irg-2006-16(3)02
- Ma, W., Adesope, O. O., Nesbit, J. C. y Liu, Q. (2014). Intelligent tutoring systems and learning outcomes: A meta-analysis. *Journal of Educational Psychology, 106*(4), 901-918. https://doi.org/10.1037/a0037123
- Kulik, J. A. y Fletcher, J. D. (2016). Effectiveness of Intelligent Tutoring Systems. *Review of Educational Research, 86*(1), 42-78. https://doi.org/10.3102/0034654315581420
- Pelánek, R. (2017). Bayesian knowledge tracing, logistic models, and beyond: an overview of learner modeling techniques. *User Modeling and User-Adapted Interaction, 27*(3-5), 313-350. https://doi.org/10.1007/s11257-017-9193-2
- Brusilovsky, P. (2001). Adaptive Hypermedia. *User Modeling and User-Adapted Interaction, 11*(1-2), 87-110. https://doi.org/10.1023/A:1011143116306
- Mitrovic, A. (2012). Fifteen years of constraint-based tutors: what we have achieved and where we are going. *User Modeling and User-Adapted Interaction, 22*(1-2), 39-72. https://doi.org/10.1007/s11257-011-9105-9
- Baker, R. S., Corbett, A. T. y Koedinger, K. R. (2004). Detecting Student Misuse of Intelligent Tutoring Systems. En *ITS 2004*, LNCS, 531-540. https://doi.org/10.1007/978-3-540-30139-4_50
- Aleven, V., Roll, I., McLaren, B. M. y Koedinger, K. R. (2016). Help Helps, But Only So Much: Research on Help Seeking with Intelligent Tutoring Systems. *IJAIED, 26*(1), 205-223. https://doi.org/10.1007/s40593-015-0089-1
- Holstein, K., McLaren, B. M. y Aleven, V. (2018). Student Learning Benefits of a Mixed-Reality Teacher Awareness Tool in AI-Enhanced Classrooms. En *AIED 2018*, LNCS, 154-168. https://doi.org/10.1007/978-3-319-93843-1_12

**STI y retroalimentación en programación**
- Crow, T., Luxton-Reilly, A. y Wuensche, B. (2018). Intelligent tutoring systems for programming education: a systematic review. En *Proc. 20th Australasian Computing Education Conference*, 53-62. https://doi.org/10.1145/3160489.3160492
- Keuning, H., Jeuring, J. y Heeren, B. (2018). A Systematic Literature Review of Automated Feedback Generation for Programming Exercises. *ACM TOCE, 19*(1), 1-43. https://doi.org/10.1145/3231711
- Gerdes, A., Heeren, B., Jeuring, J. y van Binsbergen, L. T. (2017). Ask-Elle: an Adaptable Programming Tutor for Haskell Giving Automated Feedback. *IJAIED, 27*(1), 65-100. https://doi.org/10.1007/s40593-015-0080-x
- Rivers, K. y Koedinger, K. R. (2017). Data-Driven Hint Generation in Vast Solution Spaces: a Self-Improving Python Programming Tutor. *IJAIED, 27*(1), 37-64. https://doi.org/10.1007/s40593-015-0070-z
- Marwan, S., Gao, G., Fisk, S., Price, T. W. et al. (2020). Adaptive Immediate Feedback Can Improve Novice Programming Engagement and Intention to Persist in Computer Science. En *Proc. ICER 2020*, 194-203. https://doi.org/10.1145/3372782.3406264

**Enseñar a programar**
- Robins, A., Rountree, J. y Rountree, N. (2003). Learning and Teaching Programming: A Review and Discussion. *Computer Science Education, 13*(2), 137-172. https://doi.org/10.1076/csed.13.2.137.14200
- Luxton-Reilly, A., Simon, Albluwi, I., Becker, B. A. et al. (2018). Introductory programming: a systematic literature review. En *Proc. ITiCSE 2018 Companion*, 55-106. https://doi.org/10.1145/3293881.3295779
- Atkinson, R. K., Derry, S. J., Renkl, A. y Wortham, D. (2000). Learning from Examples: Instructional Principles from the Worked Examples Research. *Review of Educational Research, 70*(2), 181-214. https://doi.org/10.3102/00346543070002181
- Denny, P., Luxton-Reilly, A. y Simon, B. (2008). Evaluating a new exam question: Parsons problems. En *Proc. ICER 2008*, 113-124. https://doi.org/10.1145/1404520.1404532
- Ericson, B. J., Denny, P., Prather, J., Duran, R. et al. (2022). Parsons Problems and Beyond. En *Proc. ITiCSE Working Group Reports 2022*, 191-234. https://doi.org/10.1145/3571785.3574127
- Sentance, S., Waite, J. y Kallia, M. (2019). Teaching computer programming with PRIMM: a sociocultural perspective. *Computer Science Education, 29*(2-3), 136-176. https://doi.org/10.1080/08993408.2019.1608781
- Lee, I., Martin, F., Denner, J., Coulter, B. et al. (2011). Computational thinking for youth in practice. *ACM Inroads, 2*(1), 32-37. https://doi.org/10.1145/1929887.1929902
- Margulieux, L. E., Guzdial, M. y Catrambone, R. (2012). Subgoal-labeled instructional material improves performance and transfer in learning to develop mobile applications. En *Proc. ICER 2012*, 71-78. https://doi.org/10.1145/2361276.2361291
- Morrison, B. B., Dorn, B. y Guzdial, M. (2014). Measuring cognitive load in introductory CS. En *Proc. ICER 2014*, 131-138. https://doi.org/10.1145/2632320.2632348
- Kapur, M. (2008). Productive Failure. *Cognition and Instruction, 26*(3), 379-424. https://doi.org/10.1080/07370000802212669
- Kornell, N. y Bjork, R. A. (2008). Learning Concepts and Categories: Is Spacing the "Enemy of Induction"? *Psychological Science, 19*(6), 585-592. https://doi.org/10.1111/j.1467-9280.2008.02127.x
- Guo, P. J. (2013). Online Python Tutor: embeddable web-based program visualization for CS education. En *Proc. SIGCSE 2013*, 579-584. https://doi.org/10.1145/2445196.2445368

**Multimedia, repetición y gamificación**
- Mayer, R. E. y Moreno, R. (2003). Nine Ways to Reduce Cognitive Load in Multimedia Learning. *Educational Psychologist, 38*(1), 43-52. https://doi.org/10.1207/S15326985EP3801_6
- Guo, P. J., Kim, J. y Rubin, R. (2014). How video production affects student engagement: an empirical study of MOOC videos. En *Proc. Learning @ Scale 2014*, 41-50. https://doi.org/10.1145/2556325.2566239
- Settles, B. y Meeder, B. (2016). A Trainable Spaced Repetition Model for Language Learning. En *Proc. ACL 2016*, 1848-1858. https://doi.org/10.18653/v1/P16-1174
- Ye, J., Su, J. y Cao, Y. (2022). A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling. En *Proc. KDD 2022*, 4381-4390. https://doi.org/10.1145/3534678.3539081
- Sailer, M. y Homner, L. (2020). The Gamification of Learning: a Meta-analysis. *Educational Psychology Review, 32*(1), 77-112. https://doi.org/10.1007/s10648-019-09498-w
- Deterding, S., Dixon, D., Khaled, R. y Nacke, L. (2011). From game design elements to gamefulness: defining "gamification". En *Proc. MindTrek 2011*, 9-15. https://doi.org/10.1145/2181037.2181040

**IA generativa en educación de la computación**
- Liu, R., Zenke, C., Liu, C., Holmes, A. et al. (2024). Teaching CS50 with AI: Leveraging Generative Artificial Intelligence in Computer Science Education. En *Proc. SIGCSE 2024 V.1*, 750-756. https://doi.org/10.1145/3626252.3630938
- Liffiton, M., Sheese, B., Savelka, J. y Denny, P. (2023). CodeHelp: Using Large Language Models with Guardrails for Scalable Support in Programming Classes. En *Proc. Koli Calling 2023*, 1-11. https://doi.org/10.1145/3631802.3631830
- Kazemitabaar, M., Ye, R., Wang, X., Henley, A. Z. et al. (2024). CodeAid: Evaluating a Classroom Deployment of an LLM-based Programming Assistant that Balances Student and Educator Needs. En *Proc. CHI 2024*, 1-20. https://doi.org/10.1145/3613904.3642773
- Hellas, A., Leinonen, J., Sarsa, S., Koutcheme, C. et al. (2023). Exploring the Responses of Large Language Models to Beginner Programmers' Help Requests. En *Proc. ICER 2023 V.1*, 93-105. https://doi.org/10.1145/3568813.3600139
- Leinonen, J., Hellas, A., Sarsa, S., Reeves, B. et al. (2023). Using Large Language Models to Enhance Programming Error Messages. En *Proc. SIGCSE 2023 V.1*, 563-569. https://doi.org/10.1145/3545945.3569770
- Denny, P., MacNeil, S., Savelka, J., Porter, L. et al. (2024). Desirable Characteristics for AI Teaching Assistants in Programming Education. En *Proc. ITiCSE 2024 V.1*, 408-414. https://doi.org/10.1145/3649217.3653574
- Prather, J., Denny, P., Leinonen, J., Becker, B. A. et al. (2023). The Robots Are Here: Navigating the Generative AI Revolution in Computing Education. En *Proc. ITiCSE Working Group Reports 2023*, 108-159. https://doi.org/10.1145/3623762.3633499
- Denny, P., Prather, J., Becker, B. A., Finnie-Ansley, J. et al. (2024). Computing Education in the Era of Generative AI. *Communications of the ACM, 67*(2), 56-67. https://doi.org/10.1145/3624720
- Kasneci, E., Sessler, K., Küchemann, S., Bannert, M. et al. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences, 103*, 102274. https://doi.org/10.1016/j.lindif.2023.102274
- Bastani, H., Bastani, O., Sungu, A., Ge, H. et al. (2025). Generative AI without guardrails can harm learning: Evidence from high school mathematics. *PNAS, 122*(26). https://doi.org/10.1073/pnas.2422633122

### 13.2 Plataformas: documentación oficial y prensa (consultadas el 2026-09-27)

- **Open edX.** Estructura del curso (secciones, subsecciones, unidades, componentes):
  - https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-olive.master/developing_course/course_outline.html
  - https://docs.openedx.org/en/latest/educators/quickstarts/build_a_course.html
- **Moodle.**
  - Actividades: https://docs.moodle.org/405/en/Activities
  - Recursos: https://docs.moodle.org/405/en/Resources
  - Restricción de acceso: https://docs.moodle.org/502/en/Restrict_access
  - Subsistema de IA: https://docs.moodle.org/405/en/AI_subsystem
  - Ubicaciones de IA: https://docs.moodle.org/405/en/AI_placements
- **Udemy.**
  - Secciones y lecciones: https://support.udemy.com/hc/en-us/articles/229605768-How-to-add-sections-lectures-and-video-content-to-your-course
  - Tipos de ítem: https://support.udemy.com/hc/en-us/articles/229606188-Understanding-Curriculum-Items-for-Your-Course
  - Ejercicios de código: https://teach.udemy.com/instructor-guide-coding-exercises/
- **Coursera.**
  - Coach: https://blog.coursera.org/coursera-coach-providing-essential-learner-support
  - Novedades con IA: https://blog.coursera.org/new-ai-powered-innovations-on-coursera
  - Coach para instructores (Universidad de Michigan): https://news.umich.edu/u-m-launches-ai-powered-coursera-coach-for-interactive-instruction/
  - Course Builder y Coach: https://iblnews.org/story/coursera-expands-its-ai-tools-for-learning-instructor-assistance-and-career-guidance
- **Platzi.**
  - Certificados, rutas y escuelas: https://platzi.com/blog/todo-lo-que-debes-saber-sobre-certificados-en-platzi/
  - Exámenes: https://platzi.com/blog/nuevos-examenes/
- **Khan Academy.**
  - Niveles de dominio: https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work
  - Retos de dominio: https://support.khanacademy.org/hc/en-us/articles/360037494231-What-are-Mastery-Challenges
  - Dominio del curso y la unidad: https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery
- **Khanmigo.**
  - Estudio sobre su uso: https://hechingerreport.org/proof-points-khanmigo-math-ai-tutor/
- **Duolingo.**
  - Novedades 2025: https://blog.duolingo.com/product-highlights/
  - Práctica: https://blog.duolingo.com/guide-to-duolingo-practice-hub/
  - Nueva pantalla de inicio: https://blog.duolingo.com/new-duolingo-home-screen-design
  - Duolingo Max: https://blog.duolingo.com/duolingo-max/
  - Explain My Answer: https://blog.duolingo.com/explain-my-answer-now-free/
- **Codecademy.**
  - Entorno de aprendizaje: https://help.codecademy.com/hc/en-us/articles/1260803449210-Updates-to-our-Learning-Environment
  - Lecciones y proyectos: https://help.codecademy.com/hc/en-us/articles/14298560842267-How-Lessons-and-Projects-Differ-in-Codecademy-s-Learning-Environment
- **Sololearn.**
  - Cursos: https://www.sololearn.com/en/learn
  - Descripción general: https://careerkarma.com/wiki/SoloLearn-getting-started/
- **CS50.ai.**
  - Documentación: https://cs50.readthedocs.io/cs50.ai/

### 13.3 Fuentes institucionales

- Universidad de Córdoba, Facultad de Educación (2023). *Modelo pedagógico de Educación virtual — MOCAVI*.
  `fuentes-institucionales/2023 05 01 Modelo pedagógico Educación virtual - MOCAVI.pdf`: §3.5 (recursos
  educativos y sistemas tutores), §4.7 (tres unidades por curso), §5.1 (cuatro momentos), §5.2 (estructura
  del curso en plataforma).
- Plan de curso FDOC-088, Fundamentos de Algoritmia (203413):
  `fuentes-institucionales/203413 FDOC-088 Fundamentos de Algoritmia.pdf`.
