# Hallazgos de Jeider en la prueba de la semana 8 (07/10/2026)

Jeider probó STIRE como estudiante y como docente mientras revisaba sus cinco criterios de la lista de interfaz
(S08-V-JEIDER). Aquí está cada hallazgo, con lo que se decidió, su estado y dónde quedó el cambio. Este documento no
contiene notas de los criterios: la nota la pone Jeider en su tarjeta, sin comparar con la evaluación de la IA.

## Corregidos el 07/10

| ID | Lo que encontró | Causa | Lo que cambió |
|---|---|---|---|
| JEIDER-S08-1 | **El dominio bajó al volver a acertar.** Falló un ejercicio, lo acertó (+20 %), lo acertó otra vez y quedó en 17 %. | La penalización por repetir un ejercicio básico (pensada para «muchos intentos hasta acertar») contaba **todos** los intentos, también los de después de acertar: 3 intentos dan un factor de 0,85, y 20 × 0,85 = 17. | Ahora cuentan solo los intentos hasta lograr la mejor nota. Volver a resolver bien algo que ya resolviste es práctica y no resta (`src/common/utils/mastery.calculator.ts`, con su prueba). |
| JEIDER-S08-2 | **«+17 %» y «+20 %» sin sentido.** El aumento que mostraba la ventana no cuadraba con lo que pasó. | El «antes» era el dominio al abrir el ejercicio, no el de la entrega anterior; y una bajada se mostraba como «se mantiene». | Se cuenta desde la entrega anterior y se dice como es: «subió de 0 % a 25 % (+25)», «bajó de 20 % a 17 % (−3)» o «sigue en 25 %». |
| JEIDER-S08-3 | **«Seguir practicando» lo dejaba en el mismo ejercicio**, aunque ya lo hubiera resuelto; y sin intentos, quedaba «una pestaña inútil». No había «continuar». | El botón solo cerraba la ventana. | La ventana ofrece **un** siguiente paso que sirve, elegido por el mismo recomendador de la lección: otro ejercicio parecido, el siguiente, uno de nivel más alto, el reto o el repaso. Si no aprobó y le quedan intentos, «Intentar de nuevo» (y cuántos quedan). Sin intentos, otro ejercicio o la lección. Al volver a abrir un ejercicio sin intentos, la página lo dice y ofrece a dónde seguir (`ResultadoEntrega.vue`, `SinIntentos.vue`, `utils/resultadoEntrega.ts`). |
| JEIDER-S08-4 | **La calibración seguía diciendo «acertaste» después de fallar**, y en una pregunta de opción múltiple hablaba de «casos» y de «tu programa». No quedaba claro para qué sirve. | El mensaje se calculaba una vez por ejercicio y se mostraba en todas las entregas; el texto era el de los ejercicios de código. | Sale solo en la entrega en la que dijo qué tan seguro estaba, con un texto para cada tipo. La pregunta antes de entregar dice para qué sirve: si estaba seguro y acierta, la lección tarda más en volver a sus repasos. |
| JEIDER-S08-5 | **«Para tus repasos: Otra vez» no se entendía** («¿pasa a mis repasos otra vez?»). | Eran los nombres de los botones de Anki, sin explicar. | En palabras: «Esta lección vuelve pronto a tus repasos, para afianzarla» (o «en pocos días», «en unos días», «tarda más»). |
| JEIDER-S08-6 | **El historial no decía cuánto subió el dominio con cada ejercicio.** | No se guardaba. | Cada entrega guarda el dominio de su lección antes y después (migración `DominioPorEntrega`); «Tus últimos ejercicios» tiene la columna «Tu dominio» («+25 % → 25 %», «igual», «−3 %»). Las entregas de antes del 07/10 muestran «—». |
| JEIDER-S08-7 | **La prueba de escritorio no se entendía** sin saber programar: «Sigue el algoritmo con una tabla» no decía qué tabla ni qué es `<-`. | El enunciado daba por sabido el método. | Los ejercicios que piden una tabla explican qué es la prueba de escritorio y que `<-` significa «guarda en»; el del descuento trae la tabla empezada. Una prueba revisa que todos lo expliquen (`src/seeds/__tests__/prueba-de-escritorio.spec.ts`). **Ojo:** cambia el contenido de los cursos, no lo que ya está cargado en producción. En la clase de Pedro hay que editarlo como docente o volver a cargar el curso. |
| JEIDER-S08-8 | **En el menú del docente plegado, todas las clases tenían el mismo ícono.** | Un ícono de libro para todas. | Cada clase lleva sus iniciales («FA», «PA»; «FA1», «FA2» si se repiten, como las tres «Fundamentos de Algoritmia» de producción), y al pasar el mouse sale el nombre y el código (`ClasesDelMenu.vue`). |
| JEIDER-S08-9 | **En el celular, al bajar por las notificaciones también bajaba la página de atrás.** | `overscroll-behavior` no alcanza si la lista es corta o en Safari de iPhone. | Con el panel abierto en el celular, la página de atrás queda quieta y se suelta al cerrarlo (`useBloqueoScrollMovil.ts`). |

Probado en local con una cuenta nueva (fallar, acertar y volver a acertar un ejercicio básico): el dominio pasó de 0 a
25 % y se quedó en 25 % con el tercer acierto; axe-core da 0 problemas en la ventana del resultado, en «Mi progreso» y en
el inicio del docente con el menú plegado; 0 errores de JavaScript.

## Para decidir

| ID | Lo que encontró | Propuesta | Estado |
|---|---|---|---|
| JEIDER-S08-10 | **El inicio del estudiante es estático:** un porcentaje solo no dice cómo vas; «tengo que calcularlo yo». Propone algo como Anki: lecciones por estado, con color, y cuánto subió el dominio en el día o la semana. | Jeider pidió «lo mejor para el usuario». Se muestra **hoy** si practicó hoy y, si no, **esta semana** (lunes a domingo), para no poner un «0 hoy» que desanima; si bajó, lo dice y cómo recuperarlo. El curso, como una barra por estados (dominadas, en práctica, sin empezar) con el número en la leyenda. Referentes: los puntos de la semana de Khan Academy y el «hoy» de Anki. | **Hecho** (08/10, `8d6d941`, `TuAvance.vue`) |
| JEIDER-S08-11 | **Al fallar, quiere saber cómo y por qué falló.** | Los ejercicios de código ya dicen qué caso no coincide y qué revisar. En opción múltiple, la ventana podría mostrar la explicación de la respuesta (los cursos ya la tienen en `explicacion`) después del último intento o al aprobar, para no regalar la respuesta antes. | **Hecho en el backend** (09/10, `ffbe1be`; falta desplegarlo). El frontend espera el despliegue. Ver UX-03 abajo. |
| JEIDER-S08-12 | **La clave del registro era más dinámica antes** (colores y una barra que se llenaba); ahora solo marca «listo». | Volver a una barra de fuerza con color **y** texto, sin quitar la lista de reglas. Es parte visual: se coordina con José. | **Hecho** (09/10, `5363ab6`). Solo usa tokens de José; falta contarle. |
| JEIDER-S08-13 | **Casi no hay ayudas al pasar el mouse** (tooltips). | Hay 74 atributos `title` en la interfaz, casi todos en botones de solo ícono. Un tooltip no sirve en el celular ni con el teclado; lo que importa es que ningún botón dependa de él (0 botones sin nombre, medido con axe-core). Agregarlos solo donde un ícono no se entiende. | **Hecho** (09/10, `a2bee90`). Una prueba revisa que ningún botón de solo ícono quede sin `title`. |
| JEIDER-S08-14 | **La encuesta SUS no se podía responder otra vez la semana siguiente** (era cada 90 días). | Jeider: cada 7 días por ahora, porque STIRE cambia seguido y así la encuesta compara la semana 1 con la 2. Admin → Usabilidad cuenta la última respuesta de cada persona: el resultado de la semana 1 se anota el viernes antes de que respondan otra vez (S08-J08). | **Hecho** (08/10, `88c08ba`) |

## UX-03 y pendientes, verificados el 09/10

Jeider probó como estudiante y como docente y dejó sus observaciones en la tarjeta S08-V-JEIDER. Cada una se trató como
hipótesis: se comprobó en el código y en la API de producción con las cuentas de prueba (Valentina como estudiante, Laura
como docente). Las capturas y el recorrido con navegador no van al repo, porque usan contraseñas.

| # | Lo que dijo | ¿Era verdad? | Evidencia | Lo que cambió | Estado |
|---|---|---|---|---|---|
| 1 | «No se ve cuáles ejercicios ya hice y no me suben el dominio» | **En parte.** La lista del 08/10 funciona, pero estaba escondida. | `mis-ejercicios` en producción respondió bien. Era un enlace pequeño que solo existía en la lección. | Botón «Ver todos: cuáles suben tu dominio». `?ejercicios=1` abre la lista. Se llega también desde el aviso del ejercicio. | **Hecho** (`e30e2e7`) |
| 2 | «Al entrar a uno ya hecho no me avisa» | **En parte.** Avisaba en el mismo ejercicio, no en sus parecidos. | El ejercicio 118 de Valentina (`cuenta-otro`) traía `yaAprobada: false` y no decía nada. | El aviso sale de la lista de la lección: «Este ejercicio ya no sube tu dominio». | **Hecho** (`e30e2e7`) |
| 3 | «Después de dos ejercicios no puedo seguir ni pasar a la siguiente lección» | **Sí.** | Nunca se ofrecía la siguiente lección. Al fallar con intentos solo había «Intentar de nuevo». Con la lección completa, el botón llevaba al inicio. Las 27 lecciones tienen 3 o 4 grupos de 2 parecidos, así que se completan rápido. | «Pasar a la siguiente lección» siempre a mano. Con la lección completa es lo principal, y practicar o repasar queda como opción. Al fallar, primero un parecido. | **Hecho** (`c83b12b`) |
| 4 | «No me dice el dominio recomendado ni cuánto falta para el módulo» | **En parte.** | Lo del módulo solo salía en el inicio, en el menú o al chocar con una lección cerrada. La meta de la lección (85 %) no salía en ningún lado. | La lección dice su meta, con una línea en la barra. Si el siguiente módulo está cerrado, la lección y el resultado dicen cuánto pide, cuánto lleva y cuánto falta. | **Hecho** (`2f602fc`) |
| 5 | Guía para el docente sobre qué debe tener cada lección | **Sí faltaba.** | Había guía para programar, no para lecciones. | «Para que sea una buena lección», opcional, sin estilos de aprendizaje (BT-42). El aviso de parecidos pide 3 en opción múltiple. | **Hecho** (`cf45fbb`) |
| 6 | Saber por qué falló en opción múltiple | **Sí.** | El formulario prometía mostrar la explicación y el servidor nunca la devolvía. | Al acertar, por qué es correcta. Al fallar, qué repasar, sin la respuesta (BT-41). | **Backend hecho** (`ffbe1be`); **frontend listo**, espera el despliegue |
| 7 | Tooltips y errores visuales | **Sí, pocos.** | Recorrido con navegador: 0 problemas graves de axe. Faltaban `title` en «⋯» y en el menú. En el celular, el título del ejercicio se salía de la pantalla. 16 medallas en un párrafo. | `title` en todos los botones de solo ícono, la cabecera del ejercicio en el celular y 3 medallas con «y N más». | **Hecho** (`a2bee90`) |
| 8 | Barra de fuerza de la clave | **Sí.** | Al cumplir las reglas, la lista se reemplazaba por «listo». | Barra con los colores de STIRE, nivel en palabras y reglas siempre visibles. | **Hecho** (`5363ab6`) |
| 9 | Intentos en opción múltiple | Decisión de Jeider: 1 intento; para volver a intentarlo, un parecido. | Con 3 intentos y 4 opciones se aprueba por descarte. | 1 intento por defecto al crear y al cargar los cursos (el docente lo cambia). | **Hecho** (`f979155`) para lo nuevo. **Falta decidir** si se cambian los ya cargados. |

### Para pensar: cómo sube y baja el dominio

Jeider: «se puede subir pero no se puede bajar; si se baja se complica la subida, y si no se baja se pierde el miedo».
Hoy, en STIRE, el dominio de una lección cuenta lo mejor de cada grupo de parecidos: un fallo después no lo baja.
Lo que se olvida lo atienden los repasos (SM-2), que vuelven antes cuando se falla.

- **Anki** no tiene un «dominio» que baje. Cuando se olvida una tarjeta, pasa por pasos de *reaprendizaje* y vuelve a
  repasarse pronto. Su historial se conserva ([manual, «Lapses»](https://docs.ankiweb.net/deck-options.html#lapses)).
  Es lo que STIRE ya hace con los repasos.
- **Khan Academy**, según su centro de ayuda, sube por niveles (Familiar, Competente, Dominado). Una pregunta fallada en
  un examen o en una evaluación mixta baja un nivel, no a cero. Es una fuente secundaria: no se pudo abrir la página
  directamente desde la sesión, así que hay que verificarla antes de citarla en la tesis.
- **Propuesta para después de la prueba:** que baje solo con evidencia de olvido, y en un escalón, no a cero. Por
  ejemplo, fallar un repaso de una lección dominada la deja «en práctica» hasta acertar el siguiente. Así el castigo es
  pequeño, se recupera con una sola respuesta correcta y no desanima. Requiere backend y una BT; queda para decidir.
