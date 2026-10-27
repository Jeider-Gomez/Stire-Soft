---
estado: propuesta (27/10/2026), para que Jeider la apruebe o la cambie
origen: pausa de planeación pedida por Jeider el 27/10
---

# Plan de remodelación de STIRE

STIRE creció rápido. Entre el 20 y el 27/10 salieron cuatro versiones con funciones que se sumaron una encima de otra,
y el panel del docente se diseñó sin tener a la vista todas las funciones que debía contener. Este plan detiene las
funciones nuevas hasta tener tres cosas: un **inventario** de lo que hay (`docs/INVENTARIO_STIRE.md`), una **lista
numerada** de lo que falta (`docs/PENDIENTES.md`, P01 a P30) y una **auditoría** de lo que falla. Con eso se rediseña
de una vez, en vez de remendar pantalla por pantalla.

## 1. Versiones: cómo lo hacen los profesionales

Casi todo el software usa **Versionado Semántico** (semver.org): `MAYOR.MENOR.CORRECCIÓN`.

- **Cada número puede pasar de 9.** Después de `2.4.9` viene `2.4.10`, y es una versión normal (Node, Vue y Nest tienen
  versiones así). No hay que saltar a la `2.5` ni a la `3.0` por falta de números.
- **No se escriben ceros a la izquierda.** La norma lo prohíbe: `2.4.01` no es válida. La idea de «01, 02, 03» sí
  sirve para **numerar pendientes** (P01, P02…), no para versiones.
- **Lo que no tiene versión todavía** va en una sección «Sin publicar» al principio del registro de cambios. Es la
  costumbre de *Keep a Changelog*, y es lo mismo que nuestra entrada «En curso».

**Propuesta para STIRE:**

| Qué pasa | Qué número sube | Ejemplo |
|---|---|---|
| Se corrigen errores, sin funciones nuevas | CORRECCIÓN | `2.4.1`, `2.4.2` … `2.4.12` |
| Cierra la semana con funciones nuevas | MENOR (una vez por semana como máximo) | `2.5.0` |
| La remodelación terminada y aprobada por la evaluación heurística humana | MAYOR | `3.0.0` |

Durante la Fase 1 casi todo serán correcciones (`2.4.1`, `2.4.2`…). La v3.0.0 queda reservada para la remodelación
completa, después de que el equipo la evalúe. Así cada número dice algo y no avanzamos más rápido que los cambios.

## 2. Lo que preguntaste, respondido sin maquillaje

### ¿Se hizo lo que pidió el profesor en el audio (20/10)?

**En parte.** El audio pedía cuatro cosas (`docs/PLAN_MEJORAS_2026-10-23.md` §0):

| Pedido | Estado real |
|---|---|
| Perfiles de usuario explicados en una tabla y 100 a 300 usuarios de prueba, en dos modos (por la API y un agente que hace clic) | **Parcial.** Hay 9 estudiantes simulados con perfil descrito (`scripts/cursos/personas.ts`) y una simulación por la API. Faltan la tabla para el artículo, los 100 a 300 usuarios, la marca «de prueba» con borrado y el modo del agente que hace clic → P16 |
| Prueba con unas 10 personas reales | **No hecha** → P17 |
| Comparar la repetición espaciada con otro software | **No hecha** → P18 |
| Dos artículos | **No empezados** → P20 |

El «perfil cognitivo» sí existe: «Mi perfil de aprendizaje» (MOD-02) guarda lo que domina, los errores de concepto que
repite, el nivel y el formato que prefiere. **Lo que no existe es que ese perfil cambie los ejercicios.** Hoy todos los
estudiantes de una lección ven los mismos ejercicios. El recomendador cambia el orden y los repasos, pero no el
ejercicio.

### Los dos profesores

- **Raúl Toscano** dirige Diseño y Desarrollo de Software III, el curso donde nace STIRE. El audio del 20/10 es suyo.
- **Ali** es el profesor de Fundamentos que asesora a Jeider. Suyas son las ideas de personalizar los ejercicios por
  perfil y de llevar al estudiante con bloques antes del código.

### La personalización que pidió el profesor Ali

Tiene razón: si todos hacen los mismos ejercicios, la personalización se queda corta. Lo que lo resuelve es P15:

1. El perfil dice qué le cuesta («confunde asignación con comparación», «no entiende los ciclos»).
2. STIRE busca en el banco un ejercicio de esa lección para ese error y ese nivel que el estudiante no haya visto.
3. Si no hay, la IA genera uno **con la clave del estudiante**, y el juez corre la solución antes de mostrarlo. Esa
   parte ya existe para el docente desde la v2.4.0, así que el camino está probado.
4. El ejercicio queda en el banco para los siguientes; el docente puede revisarlo si quiere (función opcional).

**Para confirmar con el profesor Ali:** **la fecha en que quiere probar STIRE en su clase.** Esa fecha decide si la
Fase 5 se adelanta.

**Frameworks (NestJS y otros): futuro posible, no pendiente** (Jeider, 27/10). Si se retoma: el juez no puede levantar
una aplicación completa, pero sí correr TypeScript traducido a JavaScript, probar la lógica de un servicio con casos y
enseñar los conceptos con ordenar, emparejar y completar código.

### Los ejercicios se sienten difíciles

Que tú no sepas JavaScript es **una ventaja para el diseño**: eres el estudiante novato que STIRE dice atender. El
problema no es solo la dificultad, es el salto de leer una explicación a escribir un programa entero. La propuesta
(P04 y P14):

1. Haces una lección de programar como estudiante y dices en voz alta qué no entiendes. Lo anoto todo.
2. Con eso armamos la **escalera** en cada lección: ejemplo resuelto → completar → ordenar líneas con distractores →
   escribir. Los tipos ya existen; falta ordenarlos y llenar los escalones.
3. **Bloques antes del código** (P31, pedido del profesor Ali): el estudiante arma el programa con bloques en español,
   ve el JavaScript que generan y el juez lo califica igual. Antes de construirlo va una **investigación del proceso
   formativo en programación** (cómo se pasa de los bloques al texto, qué dice la evidencia, qué hacen otras
   plataformas), con fuentes verificadas para la tesis.

### ¿Cumplimos WCAG 2.1 AA?

**No se puede afirmar hoy.** La auditoría del 07/10 (`docs/calidad/auditorias/ACCESIBILIDAD_E_INCLUSION_2026-10-07.md`)
fue seria, con axe-core en cada pantalla, teclado y 320 px. Pero es **anterior** al rediseño del 23 al 27/10, y nadie
auditó después el panel nuevo del docente, la mascota, el Asistente ni el arrastrar. Además, las herramientas
automáticas encuentran solo una parte de los problemas, y la prueba con lector de pantalla (NVDA, TalkBack) quedó
propuesta en la Semana 10 sin evidencia de que se hiciera.

**Lo que sospecho, para comprobar en P03:**
- La mascota animada y el saludo: las animaciones que duran más de 5 segundos deben poder pausarse (2.2.2).
- Los avisos que aparecen y se van solos («Guardado», el avance del Asistente): un lector de pantalla tiene que oírlos
  (4.1.3), y no deben irse antes de poder leerse (2.2.1).
- El estado de cada lección en el árbol (lista, le falta algo, oculta): si solo lo dice el color, no cumple (1.4.1).
- El foco al crear un módulo o una lección sin ventana: tiene que quedar en lo que se creó (2.4.3).
- El contraste de los grises nuevos del panel del docente (1.4.3).

### El Asistente del docente «no tiene la cara de STIRE»

**En parte.** La mascota sí está en la cabecera del panel, pero a 34 px. El botón que lo abre es solo texto y el panel
habla distinto que el Tutor. La propuesta (P10): el mismo personaje, con el mismo globo y las mismas expresiones que
el Tutor del estudiante, y un lugar fijo en el Inicio del docente («¿Qué preparamos hoy?»), no un botón más en el
encabezado.

### ¿Estamos saturando el logo?

**Sí, un poco.** En una pantalla del estudiante se ven el logo de la barra, el logo del pie y la mascota del lanzador.
La regla que propongo (P05) separa dos cosas:
- **El logo** es la marca: uno por vista, en la barra. El pie queda solo con texto.
- **La mascota** es un personaje: aparece cuando tiene algo que decir (el Tutor, el Asistente, un logro, el saludo del
  día), nunca como adorno.

### Saludos y felicitaciones del Tutor

Buena idea si tiene límites, porque cinco avisos al entrar es justo la saturación que quieres evitar. Propuesta (P07):
- **Un saludo al día**, con la mascota animada, y que diga algo útil: «Buenos días, Ana. Hoy te tocan 2 repasos».
- **Felicitación en el momento** de ganar un logro, una vez, que se cierra sola y queda en «Logros».
- Nada más por iniciativa del Tutor. Respeta «Reducir el movimiento».
- **Todo se controla** (Jeider, 27/10): en el perfil se apagan el saludo, las felicitaciones y cada tipo de aviso
  (logros, avance del módulo, repasos). Hoy ganar un logro no avisa en el momento: eso se construye junto con el
  interruptor. El inventario (§6) tiene todos los logros y avisos para que las maquetas no dejen ninguno por fuera.

## 3. Fases

| Fase | Cuándo | Qué | Versión |
|---|---|---|---|
| **0. Pausa y orden** | Hoy al jueves 29/10 | Este plan, el inventario y la lista numerada. Cerrar la verificación S11 (P01). Responder las preguntas de §7. **Sin funciones nuevas** | |
| **1. Auditoría** | 29/10 al 3/11 | Recorrido de los 4 roles con errores de consola y red (P02), WCAG de nuevo (P03), tú como novato (P04), preguntarle al profesor (P19). Se corrigen los errores graves, uno por commit | `2.4.1`, `2.4.2`… |
| **2. Diseño en papel** | 3/11 al 6/11 | Con el inventario y la auditoría: qué va primero en cada pantalla, qué se pliega y qué se quita. Prototipos en HTML de Inicio del estudiante, Inicio del docente, el Asistente y el saludo del Tutor. Reglas de logo y mascota (P05). Tú apruebas antes de construir | |
| **3. Construcción** | 9/11 al 20/11 | Pantalla por pantalla, en este orden: estudiante (Inicio, lección, progreso), docente (Inicio y Asistente, contenidos), administrador (P12). La escalera de ejercicios (P14) | `2.5.0`, `2.6.0` |
| **4. Evaluación humana** | Al terminar la 3 | Evaluación heurística del equipo (P13) y WCAG otra vez. Se corrige lo grave | **`3.0.0`** |
| **5. Investigación** | Después, o antes si el profesor tiene fecha | Ejercicios personalizados (P15), perfiles simulados (P16), prueba con 10 personas (P17), comparación (P18), artículos (P20) | `3.1.0`… |

**¿Pausar las funciones nuevas o hacerlas ya?** Recomiendo **diseñarlas ya y construirlas en la remodelación**. Las
funciones pendientes (saludo del Tutor, bloques, asistencia flotante, controles de avisos) entran al inventario y a las
maquetas de la Fase 2. Así encajan desde el principio, en vez de sumarse encima como pasó con el panel del docente. Las
únicas excepciones son las correcciones y lo que el profesor Ali necesite con fecha.

**Por qué este orden:** rediseñar sin auditar repite el error del panel del docente. Auditar sin pausar las funciones
nuevas deja la auditoría vieja el mismo día. La personalización (Fase 5) es lo más valioso para el artículo, pero
construida sobre una interfaz desordenada se prueba mal con usuarios.

**Cómo se hace la evaluación heurística, como la hacen los profesionales (P13):**
- **De 3 a 5 evaluadores.** Con uno solo se escapa la mayoría de los problemas; con cinco se encuentra la mayor parte
  y sumar más rinde poco.
- Cada uno evalúa **por separado**, sin ver lo que anotaron los demás ni lo que dice la IA, con las 10 heurísticas de
  Nielsen y tareas concretas por rol.
- Al final se juntan, se quitan los repetidos y cada problema recibe una **severidad de 0 a 4** (0 no es problema,
  4 es una catástrofe que hay que arreglar antes de publicar).

## 4. Reparto de la Fase 1 (para Trello)

| Persona | Tareas |
|---|---|
Los cinco hacen la **evaluación heurística de línea base** hasta el martes 3/11
(`docs/calidad/EVALUACION_HEURISTICA_HUMANA_S11.md`): todos recorren el panel del docente y el del estudiante, y cada uno
responde por dos heurísticas.

| Persona | Heurísticas | Además |
|---|---|---|
| **Jeider** | H1 estado del sistema, H6 reconocer antes que recordar | Sus 4 ejercicios de programar como novato (P04); la fecha del profesor Ali (P19) |
| **Pedro** | H2 lenguaje del usuario, H10 ayuda | Sus 4 ejercicios de programar |
| **Julio** | H3 control y libertad, H7 eficiencia | Sus 4 ejercicios de programar |
| **José** | H4 consistencia, H8 diseño minimalista | Los cambios de identidad y el aspecto del panel del docente, en general |
| **Jorge** | H5 prevención de errores, H9 recuperarse de errores | QA libre: un poco de cada cosa, como decida |
| **Claude** | | P02 (auditoría de consola y red), P03 (axe), P31 (investigación de bloques), P24 |

## 5. Lo que critico de STIRE (y que tú no me has pedido)

1. **Hay más funciones de las que se usan.** Proyectos, refuerzos, retos, notas, encuesta, valoraciones, asistencia,
   mensajes, logros, autorregulación… Antes de rediseñar, hay que preguntar qué usaría de verdad un docente de
   Fundamentos en su primera semana. Lo que nadie usa no se borra, pero se esconde detrás de «Más».
2. **Dos caminos para lo mismo.** Por ejemplo, «Por revisar» del Inicio y «Rendimiento»; o crear un ejercicio desde el
   panel de contenidos y desde «Nuevo ejercicio». Cada tarea debería tener un camino principal.
3. **Componentes demasiado grandes:** el chat del Tutor (535 líneas) y el editor de diagramas (791) son difíciles de
   cambiar sin romper algo. Se dividen cuando se toquen en la Fase 3, no antes.
4. **La documentación se volvió un cajón.** 44 archivos sueltos en `docs/`, con planes ya ejecutados al lado de los
   vigentes (P24). Cuesta saber cuál manda.
5. **Desplegamos más rápido de lo que se prueba.** La verificación humana del panel cierra el jueves, y el panel ya
   cambió dos veces desde que se escribió. La Fase 0 corrige eso.
6. **El Tutor es lo mejor de STIRE y está escondido** en un botón flotante. En la remodelación debería tener más
   presencia en la lección, no en más pantallas.

## 6. Manual técnico: qué lleva

Un manual técnico explica cómo está hecho el software y cómo se instala, se opera y se mantiene. Lo lee quien hereda el
proyecto, no el usuario. Mucho ya existe disperso; el manual lo reúne y llena lo que falta:

| Capítulo | Qué contiene | De dónde sale |
|---|---|---|
| 1. Introducción | Qué es STIRE, alcance, público, tecnologías | `00_VISION_FUNCIONAL.md`, `README.md` |
| 2. Arquitectura | Diagrama de componentes (Nuxt, NestJS, MariaDB, juez, Gemini), decisiones | `01_ARQUITECTURA_Y_DISENO.md`, `ADR_DECISIONES_ARQUITECTURA.md` |
| 3. Modelo de datos | Diagrama entidad-relación de las 49 tablas, migraciones | **Falta** (se genera de las entidades) |
| 4. API | Rutas, permisos por rol, ejemplos | Swagger (ya existe) + una tabla de permisos (**falta**) |
| 5. Motor adaptativo, juez y Tutor | Cómo recomienda, cómo califica, cómo usa la IA | `03_MOTOR_Y_TUTOR.md` |
| 6. Instalación local | Requisitos, `.env`, migraciones, semilla, arranque | `README.md`, `verify:clean` |
| 7. Despliegue y operación | Azure, Vercel, copias de la base, actualización, salud | `DESPLIEGUE.md` |
| 8. Seguridad | Autenticación, roles, aislamiento del juez, datos personales | `04_ESTANDARES_Y_SEGURIDAD.md`, `docs/legal/` |
| 9. Pruebas y calidad | Cómo correr las pruebas, qué cubren, auditorías | `jest.config.js`, `docs/calidad/` |
| 10. Mantenimiento | Versionado, flujo de git, cómo agregar un tipo de ejercicio, problemas frecuentes | `FLUJO_GIT.md`, **falta la guía de extensión** |

Se escribe en la Fase 3 o la 4, cuando la estructura ya no cambie.

## 7. Preguntas abiertas para Jeider

1. ¿**Cuándo** quiere el profesor Ali probar STIRE en su clase?
2. ¿Qué es exactamente lo que te limita de la asistencia flotante de hoy? ¿Se apaga la cámara al plegarla o al cambiar
   de pantalla?

Respondidas el 27/10: los evaluadores son los 5 integrantes; todo aviso del Tutor se puede apagar; frameworks quedan
para el futuro; Raúl es el profesor de DDSE3 y Ali el de Fundamentos.
