---
estado: plan vigente (01/10/2026). Reemplaza a GUIA_RONDA_1_EQUIPO.md, que era de una versión anterior.
---

# Prueba de STIRE con el equipo: dos semanas, dos cursos, cruzados

**Decisión del dueño (01/10):** en vez de que todos hagan el mismo curso a la vez, el equipo se parte en dos grupos. Cada
grupo empieza con un curso distinto y **en la segunda semana se cruzan**. Así cada semana hay resultados de los dos cursos
(el doble de sugerencias) y cada persona termina habiendo probado los dos.

Es un diseño **cruzado y contrabalanceado**: como la mitad empieza por cada curso, lo que cambia por *ya conocer la app*
la segunda semana no se confunde con lo que cambia *por el curso*.

## 1. Quién hace qué

| Persona | Rol | Semana 1 | Semana 2 |
|---|---|---|---|
| Integrante 1 | **Docente A** de Fundamentos de Algoritmia | Dicta a su grupo | Dicta al otro grupo |
| Integrante 2 | **Docente B** de Pensamiento algorítmico | Dicta a su grupo | Dicta al otro grupo |
| Integrantes 3 y 4 | Estudiantes, **grupo 1** | Fundamentos de Algoritmia | Pensamiento algorítmico |
| Integrante 5 (y quien quiera más) | Estudiantes, **grupo 2** | Pensamiento algorítmico | Fundamentos de Algoritmia |

- Cada docente dicta su mismo curso las dos semanas, a un grupo distinto: así prueba la segunda vez con la experiencia de la
  primera (por ejemplo, si «Hoy» le sirvió o si cambia cómo arma las notas).
- Si un docente también quiere vivir el curso del otro como estudiante, usa **una segunda cuenta** con otro correo (una
  cuenta es de docente o de estudiante).
- Si son menos personas, el grupo 2 puede ser una sola persona más uno de los docentes con su segunda cuenta.

## 2. Antes de empezar (una vez)

| Quién | Qué |
|---|---|
| Jeider | Encender el servidor y comprobar https://stire-soft.vercel.app. Las dos plantillas ya están compartidas (ALGO-203413 y PENSAR-ALGO). **El servidor se apaga solo a las 23:00 y no se enciende solo:** encenderlo cada mañana de la prueba (Azure → `stire-servidor` → Iniciar, también desde la app del celular) y avisar al grupo si se cae. |
| Docentes A y B | Crear su cuenta y pedir el rol de **docente**; el admin lo aprueba en «Usuarios y Roles». |
| Docente A | «Crear Nueva Clase» → «Copiar el contenido de» → **Fundamentos de Algoritmia (ALGO-203413)**. En Contenido, publicar el **módulo 1**. |
| Docente B | Lo mismo con **Pensamiento algorítmico (PENSAR-ALGO)**. Publicar el **módulo 1**. |
| Estudiantes | Crear su cuenta con un correo propio. Semana 1: entrar **solo** a la clase de su grupo. Semana 2: entrar a la otra (un estudiante puede estar en varias y cambia de clase arriba). |

Consejo: cada docente publica un módulo por semana o cada pocos días, como en un curso real. Así se prueban también «Hoy»,
los avisos y el resumen de la semana.

## 3. Qué probar (las dos semanas, en el curso que toque)

**Estudiantes** (unos 20 minutos al día, desde el celular al menos una vez):
1. Entrar (escaneando el QR que proyecta el docente o escribiendo el código), leer la explicación de la lección que
   propone «Tu siguiente paso» y practicar. Algunas lecciones traen videos, diagramas y **ejemplos en vivo** que se
   pueden modificar: probarlos. Opcional: poner una foto en «Mi perfil».
2. Equivocarse a propósito tres veces seguidas en una lección: ¿qué propone la app? ¿Llega a entender por qué?
3. Probar «¿Ya lo sabes? Demuéstralo con un reto» en una lección que ya conozca.
4. Pedirle una pista al tutor (con clave de Google AI Studio).
5. Mirar «Mi progreso»: avance, repasos, estadísticas. ¿Se entiende qué significa cada cosa?
6. Si el docente crea una entrega, enviarla y leer el comentario.
7. En **Proyectos**, crear uno y ejecutarlo; abrir **«Ampliar»** para verlo en grande (celular, tableta, completo).
   Pensamiento algorítmico: un **diagrama de flujo** (arrastrar figuras, unirlas con flechas) o un algoritmo en
   **pseudocódigo**. Fundamentos de Algoritmia: un programa de **JavaScript** o una **página web** de varias páginas.
8. Cuando el docente tome asistencia, abrir **«Mi asistencia»** en el celular y mostrarle el código (cambia cada 20 s).

**Docente** (unos 15 minutos al día):
1. Abrir la clase y revisar «Hoy» todos los días: ¿lo que muestra le dice qué hacer?
2. Crear una **entrega** (un diagrama de flujo en Pensamiento algorítmico, un programa en Fundamentos) y revisar lo que
   llegue: ejecutarlo, comentario primero, nota opcional.
3. Asignar un **refuerzo** a quien aparezca bloqueado y un **reto** a quien esté listo para más; ver si «funcionó».
4. Armar las **notas** a su manera (una sola nota, por módulo, con o sin porcentajes) y probar «Descargar para Moodle».
5. Escribir mensajes a quien lleve días sin practicar.
6. Editar una lección y, con **«Insertar»**, poner dentro del texto una imagen o un **ejemplo en vivo** (HTML, CSS y
   JavaScript) que el estudiante pueda modificar.
7. Ver la ficha de un estudiante: avance, racha y repasos.
8. Tomar **asistencia** en la pestaña «Asistencia» de la clase: «Tomar asistencia de hoy», «Escanear códigos» con la
   cámara del celular o del computador (los estudiantes muestran su QR desde «Mi asistencia»), corregir a mano,
   «Llamar a 3 al azar», cerrar y descargar la planilla. Probar a propósito: que alguien marque a un compañero desde
   su propio celular (debe aparecer la alerta «Mismo celular que…»).

**En la semana 2**, fijarse además en lo que **cambia** de un curso a otro (más fácil, más difícil, más claro) y en si la
segunda vez se sienten más cómodos con la app.

## 4. Cómo enviar sugerencias

- **Con el botón «Sugerencias»** (arriba, en cualquier pantalla): elegir *Un problema*, *Algo confuso* o *Una idea*, decir
  qué tanto afectó y contar qué pasó y qué esperaba. La app guarda sola la pantalla y el tamaño del dispositivo.
- **Al final de cada semana**, cada persona responde tres preguntas (en el grupo o en un documento):
  1. ¿Qué fue lo más confuso?
  2. ¿Qué cambiarías primero?
  3. ¿Lo usarías para estudiar (estudiante) o para tu clase (docente)? De 1 a 5, y por qué.

Jeider ve todas las sugerencias en **Administración → Sugerencias**, los marca (visto, resuelto, descartado) y deja una nota que
quien la envió puede leer en «Ver lo que he enviado». El botón «Descargar CSV» los pasa a una tabla para el informe.

## 5. Después de cada semana

1. Descargar el CSV de sugerencias (dice quién, en qué **clase** y en qué pantalla, así se separan los dos cursos) y juntar las respuestas de las tres preguntas en `docs/calidad/PRUEBA_SEMANA_N_RESULTADOS.md`.
2. Lo de gravedad 3 («No me dejó seguir») se corrige antes de la semana siguiente.
3. Lo que se repite entre personas pesa más que lo que dice una sola.

Con 4 o 5 personas aparece la mayoría de los problemas de uso (Nielsen); por eso es mejor dos rondas cortas corrigiendo
entre una y otra que una sola larga.
