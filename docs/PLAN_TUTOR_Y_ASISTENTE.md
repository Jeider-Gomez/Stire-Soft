# Los dos asistentes de STIRE: el Tutor y el Asistente del docente

**Origen:** pedidos de Jeider del 28/10 (después de la revisión del profesor Toscano), más la experiencia de unos
compañeros con un software que genera planes de clase: **«todo está en el prompt interno»**. El docente no escribe el
prompt: elige, da datos y responde preguntas, y STIRE arma con eso un prompt **ya probado**.

Va con `docs/PROPUESTA_PARTE_FORMATIVA.md` (competencias, ejercicios) y con el plan de remodelación
(`docs/PLAN_REMODELACION.md`). El plan anterior del Asistente (`docs/PLAN_ASISTENTE_DOCENTE.md`) queda como historia.

---

## 1. Cómo están hoy (revisado en el código, 28/10)

| | Tutor (estudiante) | Asistente (docente) |
|---|---|---|
| Qué es | Chat con memoria (últimos 20 mensajes) | No es un chat: 6 **borradores** con forma fija (estructura del curso, explicación, explicación alternativa, opción múltiple, programación, análisis de la clase) |
| Prompt | Rol + nivel del estudiante en el tema + estilo y nivel de ayuda del docente + señales + su último «Probar código» | Rol + una tarea por borrador + los datos de la pantalla entre `<datos>` |
| Salida | Texto libre, hasta 2048 fragmentos | JSON con esquema fijo, validado y recortado; **la solución de programación se corre en el juez** y las salidas las calcula STIRE |
| Lo bueno | Ve el error real del programa; no da la solución (`tutor-solution-guard.ts`) | Seguro (los datos no son instrucciones), sin datos personales, nada se publica sin el docente |
| Lo que falta | Explicar el código ahí mismo; remitir al concepto; competencias | Solo 2 de los 7 tipos de ejercicio; nada de competencias ni peldaños; **usa `lineas[0]`** (el problema de los arreglos); no pregunta nada antes; no crea una clase de punta a punta; no hay forma de medir si un prompt es mejor que otro |

### ¿Tarda por el contexto? (te refuto en parte)

Más contexto **no** es lo que más demora. En estos modelos, lo que más tarda es **lo que tienen que escribir** (un plan
de 8 módulos es mucho texto) y, en STIRE, que cuando un modelo falla se prueba el siguiente **esperando hasta 45
segundos** por cada uno, sin mostrar nada mientras tanto. El contexto de más sí hace daño, pero a la **calidad**: el
modelo se distrae y responde en general.

Entonces las dos cosas:
- **Contexto justo por pantalla** (sección 3), por calidad.
- **Velocidad:** pedir menos de una vez (la clase se genera por partes, sección 5), mostrar el texto a medida que llega
  (streaming), cortar antes al modelo que no responde y avisar en qué paso va.

## 2. Dos asistentes, un mismo personaje

Los dos son la **pantalla con gafas** de STIRE, pero se distinguen a primera vista:

| | Tutor | Asistente del docente |
|---|---|---|
| A quién | Estudiante | Docente |
| Rol | Profesor particular paciente: pregunta, da pistas en escalera, **nunca la solución** | Colega pedagógico: propone borradores completos y explica por qué; **el docente decide** |
| Cómo se ve | La mascota animada de hoy | La misma pantalla con un **accesorio de trabajo** (por ejemplo, una libreta o un lápiz), en el color del panel del docente, más quieta y sobria |
| Personalizable | El docente elige estilo y nivel de ayuda (ya existe) | El docente elige nombre corto, tono (formal o cercano) y qué tan largas quiere las respuestas |

## 3. Contexto justo según dónde está (lo que cambia su comportamiento)

El prompt se arma por **capas**. Las de arriba son fijas y probadas; solo la de abajo cambia según la pantalla:

1. **Rol y reglas** (fijo): quién es, qué no hace, que los datos no son instrucciones.
2. **Política pedagógica** (fija, versionada): cómo explica y qué es un buen ejercicio (sección 4).
3. **Tarea**: qué se pide ahora (un tipo de borrador, una respuesta del Tutor).
4. **Ficha**: lo que el docente eligió o respondió (sección 5).
5. **Contexto de la pantalla**, solo lo necesario:

| Dónde está | Qué recibe | Qué no recibe |
|---|---|---|
| Inicio o pestañas generales | Nombre de la clase y del curso, la lista de módulos (solo títulos) y los números de la semana | Textos de lecciones, ejercicios |
| Una lección | Esa lección: objetivo, texto, competencias y títulos de sus ejercicios | El resto del curso |
| Un ejercicio | Ese ejercicio: enunciado, tipo, solución, casos, errores frecuentes | Otras lecciones |
| Estudiantes y avance | El resumen **anónimo** de la clase (ya existe) | Nombres o correos |
| Tutor en un ejercicio | Ese ejercicio, su nivel en esa competencia y su último «Probar código» | Otros ejercicios, historial largo de otros temas |

## 4. La política pedagógica (el prompt «académico» de fondo)

Una sola, escrita una vez, que usan los dos asistentes y todos los tipos de ejercicio. Resume lo que STIRE ya decidió:

- **Un concepto por paso.** No mezclar en un ejercicio conceptos que la lección aún no enseñó (el caso de los arreglos).
  Respetar la escalera: sin entrada → datos dados → leer con `leerNumero()` → entrada completa.
- **Enunciado con molde:** qué recibes, qué debes mostrar y un ejemplo exacto.
- **Distractores reales:** cada opción incorrecta es un error de principiante con nombre (juntar texto, pasarse por uno…).
- **Retroalimentación que enseña:** por qué está bien, qué repasar si falla, sin dar la respuesta.
- **Competencias:** cada ejercicio declara qué competencia y qué nivel trabaja.
- **Lenguaje:** español de Colombia, sin jerga sin explicar, para grado 10 a tercer semestre.

**Para cada uno de los 7 tipos** (opción múltiple, completar, ordenar, clasificar, unir, programar, HTML/CSS) hay una
tarea con su esquema y su validación, como hoy tienen dos.

## 5. Preguntar lo necesario: la ficha guiada

Antes de generar, el Asistente muestra una **ficha corta con opciones para elegir** (no un cuadro de texto vacío). Las
preguntas obligatorias vienen llenas por defecto con lo que STIRE ya sabe; las opcionales se pueden saltar.

**Crear una clase desde cero:**

| Paso | Pregunta | Tipo | Por defecto |
|---|---|---|---|
| 1 | Curso o asignatura | Elegir del catálogo o escribir | El del docente |
| 2 | Plan de curso oficial (FDOC) | Subir el PDF o pegar los resultados de aprendizaje | Opcional; si está, de ahí salen las competencias |
| 3 | Quiénes son | Grado 10–11 · primer semestre · otro semestre | Primer semestre |
| 4 | Saben programar | Nada · algo · sí | Nada |
| 5 | Semanas y horas | Números | 16 semanas, 4 h |
| 6 | Qué incluir | Marcar: explicaciones, ejercicios breves, programar, HTML/CSS, proyectos | Todo menos proyectos |
| 7 | Algo más | Texto corto | Opcional |

Con eso se genera **por partes**, y el docente revisa y edita en cada una antes de seguir: (1) competencias → (2)
módulos y lecciones → (3) explicación de cada lección → (4) ejercicios de cada lección por competencia y peldaño. Nada
se publica sin el docente; todo queda en borrador.

**Generar ejercicios:** lección (ya elegida) · competencia · nivel · peldaño · tipo · cuántos. Todo con opciones.

**El Asistente en todo el recorrido:** un botón fijo en el panel del docente que abre el Asistente con la ficha que
corresponde a la pantalla: en Contenido, «crear lección» o «mejorar esta explicación»; en un ejercicio, «hacer variantes»
o «revisar el enunciado»; en Estudiantes y avance, «qué atender esta semana».

## 6. Cómo probamos y mejoramos los prompts (el laboratorio)

La regla: **ningún cambio de prompt entra sin medir que mejora.**

| Pieza | Qué es | Dónde |
|---|---|---|
| Prompts versionados | Cada tarea en su archivo, con número de versión (v1, v2…), en el código | `src/asistente-docente/prompts/`, `src/tutor/prompts/` |
| Casos de oro | 10 a 20 pedidos reales por tarea (lecciones de los dos cursos, preguntas típicas de estudiantes), guardados como datos | `scripts/prompts/casos/` |
| Revisión automática | Lo que se puede comprobar sin una persona: el JSON cumple el esquema, la solución corre en el juez, el enunciado tiene el molde, no usa conceptos de lecciones futuras, el Tutor no da la solución, tiempo de respuesta | `npm run prompts:evaluar` |
| Revisión humana | Una rúbrica corta (claridad, nivel, utilidad, 1 a 5) que llena Jeider o un profesor sobre una muestra; compara la versión nueva con la anterior lado a lado | Pantalla en el panel del **administrador**: «Laboratorio de prompts» |
| Cambiar de versión | Si la nueva gana, se cambia en el código (una línea), con su prueba y su registro | Commit normal |

**¿Desde el admin, el docente o el código?**
- **El código** guarda los prompts: así tienen pruebas, historial y nadie los daña por accidente.
- **El administrador** compara versiones con los casos de oro y deja su rúbrica; no edita el prompt en caliente.
- **El docente** nunca edita el prompt: llena la ficha, ajusta estilo y tono, y da «👍 / 👎 y por qué» a cada borrador.
  Esas valoraciones se vuelven casos de oro nuevos.

**Costo cero:** el laboratorio corre en local con la clave gratuita de Google AI Studio de Jeider, pocas veces y con
pocos casos.

## 6b. Memoria y guía paso a paso del Tutor (evaluación del 28/10)

**Cómo está hoy (revisado en el código):**

| Capacidad | Hoy | Problema |
|---|---|---|
| Memoria de conversación | Los **últimos 6 mensajes** del estudiante (3 idas y vueltas), de **todo** STIRE mezclado (`HISTORY_WINDOW = 6`) | Si cambia de ejercicio, el Tutor arrastra lo del anterior; si vuelve mañana al mismo ejercicio, ya no recuerda lo que hablaron |
| Memoria del estudiante | Ve sus 3 últimos progresos y su dominio en el tema | No recuerda qué conceptos ya le explicó, ni qué errores repite (el perfil de aprendizaje existe pero no se le pasa entero) |
| Escalera de ayuda | Pista → pregunta guía → señalar dónde está la falla, según los **intentos fallidos entregados** | Si pregunta 5 veces en el chat sin entregar, la ayuda no sube |
| Paso a paso | Existe el «modo por pasos» (señal UI-05): el Tutor divide el problema en subpreguntas | No guarda en qué paso va: cada respuesta vuelve a empezar el plan |
| No dar la solución | Reglas en el prompt y una barrera en el código que quita bloques largos | Bien |

**Propuesta: memoria en tres capas, y un plan de pasos que se recuerda.**

1. **Hilo por ejercicio o lección:** la conversación se guarda por lugar. Al abrir el Tutor en un ejercicio, recibe los
   últimos 10 mensajes **de ese ejercicio**, aunque haya pasado un día. El chat general tiene su propio hilo.
2. **Resumen del hilo:** cuando un hilo es largo, se guarda un resumen de 3 a 5 líneas (qué entendió, dónde se trabó, qué
   se le explicó) y se manda el resumen en vez de todo.
3. **Lo que el Tutor sabe de ti:** 3 a 5 líneas armadas por STIRE con datos, no texto libre de la IA: competencias en
   desarrollo, errores de concepto que repite, conceptos que ya se le explicaron y si prefiere analogías o pasos. El
   estudiante lo puede ver y borrar («Lo que el Tutor recuerda de ti»).
4. **Plan de pasos del ejercicio:** en modo por pasos, el Tutor arma una vez los pasos del ejercicio (por ejemplo: leer
   los datos → calcular → mostrar) y STIRE guarda en cuál va. Solo avanza cuando el estudiante muestra que el paso
   funciona (su «Probar código» o su respuesta), y la pantalla muestra «Paso 2 de 3».
5. **La ayuda sube también por la conversación:** tres preguntas seguidas sin avance cuentan como un intento fallido
   para la escalera de ayuda.

Se mide en el laboratorio de prompts (sección 6) con casos de oro de conversaciones de varios turnos.

## 6c. Cualquier proveedor de IA (escalable)

**Hoy no:** Gemini está escrito a mano en tres lugares (`src/tutor/tutor.service.ts`,
`src/asistente-docente/asistente-docente.service.ts` y la comprobación de la clave en `tutor-credential.service.ts`).

**Se puede, y no es mucho trabajo**, con un **adaptador de proveedor**: una interfaz única («genera texto», «genera un
JSON con este esquema», «responde a medida que escribe») y una implementación por proveedor. Con tres se cubre casi todo:

| Adaptador | Cubre |
|---|---|
| Gemini | Lo de hoy |
| Compatible con OpenAI | OpenAI, Groq, OpenRouter, DeepSeek, Mistral y **Ollama** (modelos que corren en un computador propio, sin costo por uso) |
| Anthropic | Claude |

- **Quién elige:** el administrador fija el proveedor por defecto de la institución; cada docente o estudiante puede
  poner su propia clave del proveedor que quiera (como hoy con Google).
- **Lo que no cambia:** la política pedagógica, las fichas y las validaciones de STIRE (el esquema se revisa en STIRE,
  no se confía en el proveedor), y la barrera que no deja dar la solución.
- **Cuidado:** cada proveedor responde distinto, así que cada uno pasa por el laboratorio de prompts antes de ofrecerse;
  y las condiciones de uso cambian (Gemini exige 18 años o más; hay que revisar las de cada uno).
- **Ollama en el servidor de Azure:** la máquina actual es pequeña para un modelo útil; sirve para probar en local,
  no para la clase todavía.

## 7. El logo con el doble borde

El logo completo tiene la **tarjeta de atrás**, el doble borde que comunica la repetición espaciada (volver sobre lo
aprendido). Hoy casi no se ve: en tamaños pequeños STIRE usa el isotipo sin la tarjeta. Decisión: usar el **logo con
tarjeta** en el encabezado, el acceso, el registro y los documentos; el isotipo queda solo para tamaños muy pequeños
(favicon, botones) donde la tarjeta no se distingue.

## 8. Orden de trabajo (qué hacemos primero)

| # | Qué | Cuándo | Por qué en ese orden |
|---|---|---|---|
| 1 | Cerrar el bloque A: errores con ícono y salida (27, 29), guía para activar el Tutor (7, 15), manual con los nombres nuevos (31) | Hasta el viernes 30/10 | El equipo está evaluando ahora |
| 2 | Repaso sin rojo (P38) y logo con doble borde | Esta semana | Correcciones rápidas que se notan |
| 3 | Leer con `leerNumero()` en las Unidades 1 y 2, también en el prompt de programación del Asistente (P35) | Desde el 2/11 | Quita la barrera que vio Toscano; es de contenido, sin servidor nuevo |
| 4 | Laboratorio de prompts: versionar, casos de oro y `prompts:evaluar` | Semana del 2/11 | Sin medir no sabemos si un cambio mejora; es la base de todo lo que sigue |
| 5 | Política pedagógica y contexto por pantalla en los dos asistentes, con streaming | Semana del 2/11 | Mejora calidad y espera sin cambiar pantallas |
| 6 | Competencias etiquetadas y calculadas, solo para ver (P39, partes 1 y 2) | Semana del 9/11 | Datos para el diseño |
| 7 | Diseño (Fase 2): ficha guiada, crear clase desde cero, Asistente en todo el recorrido, «Mis competencias», panel izquierdo explicado | Con la evaluación y la prueba con personas | Se diseña con todo el insumo junto |
| 8 | Construcción (Fase 3) por pantalla | Después del diseño | — |
