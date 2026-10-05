# Verificación del equipo · STIRE v2.0.0

> **Qué es:** el visto bueno humano de la segunda versión, antes de presentarla al profesor el **martes 06/10/2026**.
> Cada integrante prueba **como usuario** los ítems que le tocan, en https://stire-soft.vercel.app, en computador y en
> celular. **Fecha límite: lunes 05/10, 8:00 p. m.**
> **Cómo marcar:** en la columna «Resultado» escribe ✅ (de acuerdo), ⚠️ (de acuerdo, con una observación) o ❌ (no se
> cumple). Agrega una frase en «Observación» y, si algo falla, una captura en `docs/calidad/listas-chequeo/2026-10-04_despues/capturas-equipo/`.
> Un ítem cuenta como cumplido **solo con tu ✅**.
> **Actualizado el 05/10:** cada integrante tiene además los ítems «N-» de lo que se agregó el 04 y 05/10 (modo oscuro,
> «Escuchar», escalas de calificación, Notas, etc.), y Jeider tiene su propia parte (§4b). Las tarjetas S08-V-… de
> Trello tienen los mismos pasos como lista de chequeo.
> Al terminar, responde la **encuesta SUS** (§5): son 2 minutos.

Si no tienes una clase para probar, usa tu curso de la prueba de dos semanas (Fundamentos o Pensamiento). Para el
docente: Pedro en Fundamentos y Julio en Pensamiento.

---

## 1. José López — interfaz, celular y consistencia

| Ítem | Qué probar | Resultado | Observación |
|---|---|---|---|
| UX-01 | Abre un ejercicio: arriba se ve «Inicio › lección › Ejercicio», y los enlaces llevan a su sitio. | | |
| UX-02 | Como docente, en Asistencia, borra una sesión de prueba: sale un diálogo de STIRE (no el del navegador), con «Cancelar» seleccionado. Escape lo cierra. | | |
| UX-04 | Recorre inicio, clases, mensajes y perfil: no quedan emojis como íconos; los títulos van en estilo de oración («Mis clases», «Mi perfil»). | | |
| MOB-01 | En el celular, ninguna pantalla se desplaza de lado. | | |
| MOB-02 | En el celular, en un ejercicio de código: Probar y Entregar están abajo, se tocan fácil con el pulgar y el botón «Tutor» no los tapa. | | |
| MOB-03 | En el celular, al escribir el código de una clase el teclado sale en mayúsculas; los espacios se vuelven guiones. Gira el celular en un ejercicio: el enunciado y el editor quedan lado a lado. | | |
| PAT-02 | El menú lateral marca la página donde estás; las pestañas de la clase del docente funcionan. | | |
| N-01 | Perfil → «Apariencia y lectura»: prueba Tema oscuro, Alto contraste y Tamaño del texto. Recorre inicio, una lección, un ejercicio y el panel del docente: todo se lee, nada queda blanco sobre blanco. Recarga: se mantiene lo elegido. | | |
| N-02 | Como docente, en Contenido: cada tema tiene «Nueva lección» y un botón «···» con «Editar tema» y «Archivar tema…». En el celular el selector de clase no se sale del recuadro. | | |
| N-03 | Como docente, en el inicio: cada clase muestra «N estudiantes · dominio del grupo» (lleva a Estudiantes), «Contenidos» y «Ver hoy en la clase»; si alguien va atrasado dice «N necesitan apoyo». | | |
| N-04 | En Mis proyectos, un proyecto de diagrama de flujo en tema oscuro: las figuras y su texto se leen; al tocar una flecha, el panel dice «De: Inicio · A: Entrada: …» (no códigos como «f3»). | | |

## 2. Jorge Cervantes — accesibilidad, conexión y Tutor

| Ítem | Qué probar | Resultado | Observación |
|---|---|---|---|
| UX-06 | En un ejercicio de código escribe algo, **recarga la página (F5)**: aparece «Recuperamos el código que estabas escribiendo» con tu código. «Volver a la plantilla» lo borra (pide confirmación). | | |
| UX-07 | Al entrar, pulsa Tab una vez: aparece «Saltar al contenido» y Enter lleva al contenido. Recorre con Tab: siempre se ve dónde está el foco. | | |
| MOB-04 | En un ejercicio, quita el wifi o los datos y escribe: arriba sale «Sin conexión…» y el estado dice que el código queda en el equipo. Vuelve a conectar: el aviso se va y se guarda. | | |
| PAT-03 | En el inicio de sesión, pulsa «Ingresar a la plataforma» con el correo vacío o mal escrito: el error sale debajo del campo, en rojo, y el cursor va a ese campo. | | |
| UI-03 | En un ejercicio que fallas, pide una pista al Tutor: no te da la solución; si sigues fallando, el nivel sube (pista → pregunta guía → dónde está el error). | | |
| UI-05 | Falla un caso y pulsa «Resolverlo por pasos con el Tutor»: el Tutor divide el problema en pasos y plantea solo el primero. | | |
| QA-07 | Usa todos los intentos de un ejercicio y escribe: el estado dice «Ya usaste tus intentos: tu código queda solo en este equipo», no un error en rojo. | | |
| N-05 | En una lección, el botón «Escuchar» (arriba, junto al título): abre un reproductor pequeño, lee la explicación resaltando la frase, se pausa y se cambia la voz. No tapa la lección. | | |
| N-06 | Como docente, en Contenido abre una lección → «Mi banco», editar y archivar un ejercicio: con Tab el foco no se sale de la ventana, Escape la cierra y el foco vuelve al botón que la abrió. | | |
| N-07 | Solo con teclado (sin mouse): en Contenido, abre el menú «···» de un tema con Enter, recórrelo con Tab y ciérralo con Escape. | | |

## 3. Julio Galvis — lo pedagógico del curso y del Tutor

| Ítem | Qué probar | Resultado | Observación |
|---|---|---|---|
| MOD-01 | Con un estudiante nuevo: el módulo 2 aparece con candado y dice cuánto dominio falta en el módulo 1. Al llegar al 50 % se abre. Lo que ya empezaste nunca se cierra. | | |
| MOD-01 (docente) | En Ajustes de tu clase, cambia «Dominio del módulo anterior para abrir el siguiente» (por ejemplo a 0 %): el estudiante ve todos los módulos abiertos. | | |
| MOD-02 | En «Mi progreso», una lección empezada con 0 % dice «Empezada» y no «Toca repasarla»; la racha del inicio y la de Mi progreso coinciden. | | |
| MOD-02 | En un ejercicio que suma dos números, imprime los dos juntos sin convertirlos: debajo del caso sale «Los números se juntaron como texto…». | | |
| UI-01 | En una lección con pseudocódigo («Algoritmo …»), cambia entre Pseudocódigo, Diagrama de flujo y Paso a paso: los tres dicen lo mismo. Recarga: se queda el formato que elegiste. | | |
| META-02 | En un ejercicio nuevo, al entregar la primera vez te pregunta qué tan seguro estás (se puede omitir); al calificar te dice si tu juicio coincidió. En el segundo intento ya no pregunta. | | |
| N-08 | Al entregar un ejercicio, abajo del resultado sale «Para tus repasos: …» y qué significa. En «Mi progreso», «Cómo avanzas en STIRE» explica la escala sin palabras técnicas. | | |
| N-09 | En una lección que no has dominado: «¿Te sientes seguro? Toma un reto» te da un ejercicio de nivel más alto; si ya no hay uno más alto, lo dice claro. | | |
| N-10 | En Repasos: hay un «Empieza por aquí», el resto en lista, el tiempo estimado («Unos 30 minutos») y ningún rojo de alarma. | | |
| N-11 | Falla varias veces seguidas un ejercicio: lo primero que ofrece es «Pedir una pista al Tutor» y el mensaje suena a apoyo, no a vigilancia. | | |

## 4. Pedro Romero — metacognición, mensajes y transparencia

| Ítem | Qué probar | Resultado | Observación |
|---|---|---|---|
| MOD-04 | Falla un caso: el mensaje orienta («Todavía no coincide» y qué revisar), no regaña. | | |
| UI-02 | En el inicio, «Tu siguiente paso» guía; el plan del curso deja abrir cualquier lección de un módulo abierto. | | |
| UI-04 | Al final de una lección, «¿Te sirvió esta explicación?»: con «No» puedes escribir qué no quedó claro y pedir que el Tutor lo explique de otra forma. Como docente, en «Hoy» de tu clase, ves el resultado por lección sin nombres. | | |
| META-01 | En «Mi progreso» aparece «Mi autorregulación» con una observación de tu semana y una pregunta. | | |
| META-03 | En el inicio, «¿Por qué veo esto?» explica cómo elige STIRE tu siguiente paso y que puedes elegir otra cosa. | | |
| UX-05 | Lee `docs/modesec/usuarios/PERSONAS_Y_TAREAS.md`: ¿las Personas y las tareas se parecen a lo que vive un estudiante y un docente de verdad? | | |
| N-12 | Como docente, crea una entrega y elige «Cómo se califica»: Solo comentario, Aprobado o no aprobado, Desempeño (Superior/Alto/Básico/Bajo) o Nota de 0,0 a 5,0. Al revisar, la casilla corresponde a la escala; el estudiante ve lo mismo. | | |
| N-13 | Como docente, en la pestaña Notas: arma las notas con una de las formas de empezar, pon una nota a mano, ajusta la final con motivo y mira el historial; «Descargar para Moodle (CSV)» abre bien en Excel. | | |
| N-14 | El número de estudiantes que «necesitan apoyo» es el mismo en el inicio del docente y en Rendimiento de esa clase. | | |
| N-15 | Como estudiante, en el inicio solo sale una fila de logros y «Ver todos mis logros» lleva a su página, con filtro Todas / Ganadas / Por ganar. | | |

## 4b. Jeider Gómez — encuesta por rol, mensajes, progreso y cierre

Jeider pidió estos cambios pero no los programó; los prueba como usuario igual que los demás.

| Ítem | Qué probar | Resultado | Observación |
|---|---|---|---|
| N-16 | La encuesta de usabilidad: la segunda parte cambia según el rol (estudiante o docente) con preguntas de 1 a 7 sobre tareas reales; al terminar no vuelve a salir. En Administración → Usabilidad se ven los resultados por rol. | | |
| N-17 | Mensajes como estudiante y como docente: la bandeja y «Redactar» son iguales en los dos; un mensaje largo se lee completo. | | |
| N-18 | En «Mi progreso» del estudiante: arriba dice «N de 3 días esta semana» (no una racha en 0), y «Tus últimos ejercicios» está plegado. | | |
| N-19 | Como docente, en Estudiantes (Rendimiento) en el celular: se ve en tarjetas y dice «Necesita apoyo»; el mapa de calor muestra el nombre de cada lección y no «L1… L17». | | |
| N-20 | En el celular, el inicio del estudiante: el plan del curso se pliega por módulo y el botón del Tutor se hace pequeño al bajar. | | |
| CIERRE | Reúne las marcas de todos en §6, corrige o explica cada ❌ y pone la etiqueta v2.0.0 (después de `npm run verify:clean`). | | |

---

## 5. Encuesta SUS (todos, incluido Jeider)

Escala de usabilidad de sistemas (Brooke, 1996). Marca de **1 (muy en desacuerdo)** a **5 (muy de acuerdo)**. Puedes
copiar la tabla en un comentario de tu tarjeta de Trello.

| # | Afirmación | José | Jorge | Julio | Pedro | Jeider |
|---|---|---|---|---|---|---|
| 1 | Creo que me gustaría usar STIRE con frecuencia. | | | | | |
| 2 | Encontré STIRE innecesariamente complejo. | | | | | |
| 3 | Pensé que STIRE era fácil de usar. | | | | | |
| 4 | Creo que necesitaría ayuda de una persona técnica para poder usar STIRE. | | | | | |
| 5 | Encontré que las funciones de STIRE están bien integradas. | | | | | |
| 6 | Pensé que había demasiada inconsistencia en STIRE. | | | | | |
| 7 | Imagino que la mayoría de las personas aprendería a usar STIRE muy rápido. | | | | | |
| 8 | Encontré STIRE muy engorroso de usar. | | | | | |
| 9 | Me sentí muy seguro usando STIRE. | | | | | |
| 10 | Necesité aprender muchas cosas antes de poder empezar con STIRE. | | | | | |

**Cómo se calcula** (lo hace Jeider): en las preguntas impares se resta 1 a la respuesta; en las pares, a 5 se le resta
la respuesta. Se suman los 10 valores y se multiplica por 2,5: queda un puntaje de 0 a 100. Más de 68 es aceptable y
más de 80 es bueno.

---

## 6. Resultado

| Integrante | Ítems | ✅ | ⚠️ | ❌ | SUS |
|---|---|---|---|---|---|
| José | 7 + 4 | | | | |
| Jorge | 7 + 3 | | | | |
| Julio | 6 + 4 | | | | |
| Pedro | 6 + 4 | | | | |
| Jeider | 5 + cierre | | | | |
| **Promedio SUS** | | | | | |
