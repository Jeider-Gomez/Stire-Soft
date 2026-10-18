---
estado:     en preparación (Semana 10)
fuente:     normativo (insumo para sustentación oral)
codigos:    no aplica (pitch, no ventanas)
---

# Pitch grupal — STIRE antes y después de las listas de chequeo del profesor

Pitch del equipo sobre lo que cambió en STIRE con las dos listas de chequeo del profesor: **Interfaz gráfica**
(Pressman) y **Sistemas Tutores Inteligentes** (Caro, 2015). Se pasó de la Semana 9 a la Semana 10 (decisión de Jeider,
17/10).

## 1. Cómo se hace

Son dos cosas separadas que también funcionan juntas:

| | Pitch | Presentación de avances |
|---|---|---|
| **Qué es** | Cada uno habla **1 minuto**, sin diapositivas. Los cinco forman un solo pitch de 5 minutos. | 15 diapositivas en inglés con capturas de antes y después, para el profesor. |
| **Sola** | Sí: cada parte tiene su gancho y su cierre, y se entiende sin las demás. | Sí: se entiende sin el pitch. |
| **Juntas** | Primero el pitch y después la presentación como respaldo visual (o la diapositiva «The pitch» presenta a cada uno). | |

**Presentación de avances:** https://claude.ai/artifact/VM5P4yjDpG27rRZXYgu3Vs. Para que el equipo la abra y la edite,
Jeider la comparte desde el menú «Share». Se descarga en PowerPoint o PDF. Al final tiene los dos enlaces: el STIRE del
04/10 (https://stire-soft-b6ep923aj-lic-jeider.vercel.app) y el de hoy (https://stire-soft.vercel.app).

### La estructura de cada minuto

| Parte | Tiempo | Qué se dice |
|---|---|---|
| **1. Gancho** | 5–10 s | Una escena o una pregunta que el público reconozca. |
| **2. El problema** | 10–15 s | Cómo estaba STIRE el 04/10, en lo que tú revisaste. |
| **3. Qué hicimos** | 15–20 s | El cambio concreto, en palabras de usuario (nada de código). |
| **4. La prueba** | 10 s | Un dato o lo que comprobaste como usuario. |
| **5. Por qué importa** | 5–10 s | Qué gana el estudiante o el docente. Una frase que se recuerde. |

Unas **130 a 150 palabras** por persona en español. Se dice con calma, sin leer.

### La estructura del pitch grupal

1. **Jeider** abre con el gancho del grupo y el contexto: qué es STIRE, qué pidió el profesor y la cifra de antes.
2. **José** y **Jorge**: la interfaz (que se entienda y que proteja de errores).
3. **Julio**: cómo enseña el Tutor.
4. **Pedro**: cómo STIRE conoce al estudiante, y el cierre con la cifra de después y lo que sigue.

Cada uno termina pasando la palabra al siguiente con una frase corta (ya va en los guiones).

| Cuándo | Qué |
|---|---|
| Martes 20/10, 8:00 p. m. | Cada uno tiene su minuto listo (ajusta el guion a sus palabras). |
| Jueves 22/10, 8:00 p. m. | Ensayo por Meet con cronómetro, en los dos idiomas. Pedro dirige. |
| Por confirmar | Exposición. Si cae antes del jueves, todo se adelanta. |

## 2. Guion en español

### Jeider — gancho del grupo, contexto e información

> **Gancho.** Son las once de la noche. Tu código falla por quinta vez y tu docente no está conectado. ¿Qué haces?
>
> **Contexto.** Para eso hicimos STIRE: un tutor inteligente para aprender algoritmia. Explica, pone ejercicios, programa
> los repasos y tiene un Tutor con IA que te guía sin darte la respuesta. El profesor nos dio dos listas de chequeo,
> interfaz y tutores inteligentes, y el 4 de octubre sacamos 62 y 58 por ciento.
>
> **Lo mío.** Yo revisé si medíamos lo que importa. No sabíamos si STIRE era fácil de usar: lo suponíamos. Pusimos la
> encuesta SUS dentro de la aplicación, se responde en dos minutos y el puntaje sale solo. El equipo le dio 81,5 sobre
> 100: bueno. Y por dentro, ninguna pantalla pide sus datos directamente; una prueba automática lo vigila.
>
> **Por qué importa.** Lo que no se mide no se mejora. Ahora cada uno les cuenta qué cambió. José.

### José — la interfaz se entiende

> **Gancho.** ¿Alguna vez una aplicación les dijo «bloqueado» sin decirles por qué?
>
> **El problema.** Eso pasaba en STIRE: un módulo cerrado no explicaba qué faltaba, y en celulares pequeños el botón
> del Tutor tapaba las opciones.
>
> **Qué hicimos.** Ahora el candado dice cuánto dominio pide y cuánto llevas, y el plan del curso está siempre a la
> vista en la barra lateral. En el celular, el botón del Tutor deja espacio y se vuelve un ícono.
>
> **La prueba.** Lo comprobé como estudiante, en el celular y en el computador, mientras terminaba las secciones 1 y 2
> de Pensamiento algorítmico, y revisé que mis cinco hallazgos quedaran corregidos.
>
> **Por qué importa.** Un estudiante que sabe dónde está no se pierde, y uno que no se pierde no abandona. Jorge.

### Jorge — la interfaz protege de errores

> **Gancho.** Imaginen entregar un examen sin querer, solo por tocar fuera de la ventana.
>
> **El problema.** En STIRE pasaba: en la ventana «Antes de entregar», un toque afuera entregaba el ejercicio.
>
> **Qué hicimos.** Ahora la ventana tiene «Volver a editar» y tocar afuera ya no entrega nada. Revisé también que se
> pueda usar con teclado y que los formularios avisen antes de que algo salga mal. *[Agrega aquí tu segundo criterio:
> PAT-03 u otro de los tuyos.]*
>
> **La prueba.** Lo encontré yo haciendo QA, se corrigió y lo volví a probar en producción. Esta semana hice el QA de
> las funciones de la Semana 8 y terminé como estudiante Pensamiento, secciones 1 y 2, y Fundamentos, Unidad 1.
>
> **Por qué importa.** En una plataforma de estudio, un error del sistema no puede costarle la nota a nadie. Julio.

### Julio — cómo enseña el Tutor

> **Gancho.** ¿Qué hace un buen profesor cuando ve que no entendiste? No te repite lo mismo más fuerte.
>
> **El problema.** El Tutor de STIRE cambiaba de pista, pero no acompañaba; y «No me quedó claro» ofrecía lo mismo que
> ya estaba en la lección.
>
> **Qué hicimos.** Ahora, cuando fallas varias veces, el Tutor te acompaña paso a paso, puede leerte la respuesta en voz
> alta y le puedes dictar la pregunta. Y si una lección no se entiende, tienes cinco caminos: practicar, repasar la
> anterior, otro video, preguntarle a tu docente o el Tutor.
>
> **La prueba.** *[Completa: lo que viste al revisarlo como usuario o como docente esta semana.]*
>
> **Por qué importa.** Nadie aprende igual: lo importante es que siempre haya un siguiente paso. Pedro.

### Pedro — cómo STIRE conoce al estudiante, y cierre

> **Gancho.** Equivocarse en una coma no es lo mismo que no entender un ciclo. ¿Su plataforma sabe la diferencia?
>
> **El problema.** STIRE no la sabía: veía cada intento por separado y no tenía un perfil del estudiante.
>
> **Qué hicimos.** Con mi idea, ahora está «Mi perfil de aprendizaje»: qué parte del temario dominas, qué errores de
> concepto se repiten, aparte de los descuidos de escritura, y cómo estudias. Lo ven el estudiante y su docente. Y si un
> video falla, la lección ofrece otra salida y le avisa al docente.
>
> **La prueba.** Esta semana dicté la Unidad 2 de Fundamentos y terminé como estudiante las secciones 3 y 4 de
> Pensamiento.
>
> **Cierre del grupo.** Pasamos de 62 y 58 por ciento a 100 en las dos listas, con una usabilidad de 81,5. Lo que sigue:
> que los ejercicios de programar sean más alcanzables, un manual y un recorrido guiado. Porque a las once de la noche,
> nadie debería quedarse solo con su código. Gracias.

## 3. Guion en inglés

La pronunciación de palabras difíciles está en [`GUIA_PRONUNCIACION.md`](./GUIA_PRONUNCIACION.md).

### Jeider — group hook, context and information

> It’s 11 p.m. Your code fails for the fifth time, and your teacher is offline. What do you do?
>
> That is why we built STIRE: an intelligent tutor for learning algorithms. It explains, gives exercises, schedules
> reviews and has an AI Tutor that guides you without giving you the answer. Our professor gave us two checklists,
> interface and intelligent tutoring systems, and on October 4th we scored 62 and 58 percent.
>
> I checked whether we measured what matters. We didn’t know if STIRE was easy to use; we assumed it. We added the SUS
> survey inside the app: two minutes, scored automatically. The team gave it 81.5 out of 100: good. And inside, no screen
> requests its data directly; an automated test checks it.
>
> What isn’t measured can’t be improved. Now each of us will tell you what changed. José.

### José — an interface you understand

> Has an app ever told you “locked” without telling you why?
>
> That happened in STIRE: a locked module didn’t say what was missing, and on small phones the Tutor button covered the
> options.
>
> Now the lock shows how much mastery it needs and how much you have, and the course plan is always visible in the
> sidebar. On phones, the Tutor button leaves room and becomes an icon.
>
> I checked it as a student, on my phone and on my computer, while finishing sections 1 and 2 of Algorithmic Thinking,
> and I confirmed my five findings were fixed.
>
> A student who knows where they are doesn’t get lost, and a student who doesn’t get lost doesn’t give up. Jorge.

### Jorge — an interface that prevents mistakes

> Imagine submitting an exam by accident, just by tapping outside a window.
>
> It happened in STIRE: in the “Before you submit” window, one tap outside submitted the exercise.
>
> Now the window has “Edit again”, and tapping outside submits nothing. I also checked keyboard use and that forms warn
> you before something goes wrong. *[Add your second criterion here: PAT-03 or another of yours.]*
>
> I found it myself during QA, it was fixed, and I tested it again in production. This week I tested the Week 8 features
> and finished Algorithmic Thinking, sections 1 and 2, and Fundamentals, Unit 1, as a student.
>
> On a learning platform, a system error should never cost anyone their grade. Julio.

### Julio — how the Tutor teaches

> What does a good teacher do when you don’t understand? They don’t repeat the same thing louder.
>
> STIRE’s Tutor changed the hint, but it didn’t walk with you; and “I didn’t get it” offered what was already in the
> lesson.
>
> Now, when you fail several times, the Tutor walks you through step by step, can read the answer aloud, and you can
> speak your question. And if a lesson isn’t clear, you have five paths: practice, review the previous lesson, another
> video, ask your teacher, or the Tutor.
>
> *[Complete: what you saw when you reviewed it this week.]*
>
> Nobody learns the same way; what matters is that there is always a next step. Pedro.

### Pedro — how STIRE knows the student, and closing

> Missing a comma is not the same as not understanding a loop. Does your platform know the difference?
>
> STIRE didn’t: it saw each attempt on its own and had no student profile.
>
> Following my idea, there is now “My learning profile”: how much of the syllabus you have mastered, which concept
> errors repeat, apart from typing slips, and how you study. The student and the teacher both see it. And if a video
> fails, the lesson offers another way and tells the teacher.
>
> This week I taught Unit 2 of Fundamentals and finished sections 3 and 4 of Algorithmic Thinking as a student.
>
> We went from 62 and 58 percent to 100 on both checklists, with a usability score of 81.5. Next: more reachable coding
> exercises, a user manual and a guided tour. Because at 11 p.m., nobody should be left alone with their code. Thank you.

Glosario común: *checklist, criterion / criteria, before and after, usability, accessibility, intelligent tutoring
system, mastery, spaced repetition, feedback, learning profile, System Usability Scale (SUS).*
