---
estado: plan vigente (01/10/2026). Reemplaza a GUIA_RONDA_1_EQUIPO.md, que era de una versión anterior.
---

# Prueba de STIRE con el equipo: dos semanas, dos cursos

**Idea del dueño:** una semana con un curso y la siguiente con el otro. Quienes hacen de estudiantes pasan por **los dos
cursos**. Dos integrantes hacen de **docentes**, uno por curso.

## 1. Antes de empezar (una vez)

| Quién | Qué |
|---|---|
| Jeider | Encender el servidor y comprobar https://stire-soft.vercel.app. Las dos plantillas ya están compartidas (ALGO-203413 y PENSAR-ALGO). |
| Docente A y docente B | Crear su cuenta y pedir el rol de **docente**; el admin lo aprueba en «Usuarios y Roles». |
| Docente A | «Crear Nueva Clase» → «Copiar el contenido de» → **Fundamentos de Algoritmia (ALGO-203413)**. En Contenido, publicar el **módulo 1**. |
| Docente B | Lo mismo con **Pensamiento algorítmico (PENSAR-ALGO)**. Publicar el **módulo 1**. |
| Estudiantes | Crear su cuenta con un correo propio y entrar a las **dos** clases con sus códigos (un estudiante puede estar en varias y cambia de clase arriba). |

Consejo: cada docente publica un módulo por semana o por cada pocos días, como en un curso real. Así se prueba también el
«Hoy», los avisos y el resumen de la semana.

## 2. Semana 1: Fundamentos de Algoritmia (docente A)

**Estudiantes** (unos 20 minutos al día, desde el celular al menos una vez):
1. Entrar, leer la explicación de la lección que propone «Tu siguiente paso» y practicar.
2. Equivocarse a propósito tres veces seguidas en una lección: ¿qué propone la app? ¿Llega a entender por qué?
3. Probar «¿Ya lo sabes? Demuéstralo con un reto» en una lección que ya conozca.
4. Pedirle una pista al tutor (con clave de Google AI Studio).
5. Mirar «Mi progreso»: avance, repasos, estadísticas. ¿Se entiende qué significa cada cosa?
6. Si el docente crea una entrega, enviarla y leer el comentario.

**Docente A** (unos 15 minutos al día):
1. Abrir la clase y revisar «Hoy» todos los días: ¿lo que muestra le dice qué hacer?
2. Crear una **entrega** (por ejemplo, un pequeño proyecto) y revisar lo que llegue: comentario primero, nota opcional.
3. Asignar un **refuerzo** a quien aparezca bloqueado y un **reto** a quien esté listo para más; ver si «funcionó».
4. Armar las **notas** a su manera (una sola nota, por módulo, con o sin porcentajes) y probar «Descargar para Moodle».
5. Escribir mensajes a quien lleve días sin practicar.

## 3. Semana 2: Pensamiento algorítmico (docente B)

Lo mismo, con el otro curso. Los estudiantes ya conocen la app: fijarse en lo que **cambia** de un curso a otro (más
fácil, más difícil, más claro) y en si la segunda vez se sienten más cómodos. El docente A puede seguir con su clase o
hacer de estudiante en esta.

## 4. Cómo reportar

- **Con el botón «Reportar»** (arriba, en cualquier pantalla): elegir *Un problema*, *Algo confuso* o *Una idea*, decir
  qué tanto afectó y contar qué pasó y qué esperaba. La app guarda sola la pantalla y el tamaño del dispositivo.
- **Al final de cada semana**, cada persona responde tres preguntas (en el grupo o en un documento):
  1. ¿Qué fue lo más confuso?
  2. ¿Qué cambiarías primero?
  3. ¿Lo usarías para estudiar (estudiante) o para tu clase (docente)? De 1 a 5, y por qué.

Jeider ve todos los reportes en **Administración → Reportes**, los marca (visto, resuelto, descartado) y deja una nota que
quien reportó puede leer en «Ver lo que he reportado». El botón «Descargar CSV» los pasa a una tabla para el informe.

## 5. Después de cada semana

1. Descargar el CSV de reportes y juntar las respuestas de las tres preguntas en `docs/calidad/PRUEBA_SEMANA_N_RESULTADOS.md`.
2. Lo de gravedad 3 («No me dejó seguir») se corrige antes de la semana siguiente.
3. Lo que se repite entre personas pesa más que lo que dice una sola.

Con 4 o 5 personas aparece la mayoría de los problemas de uso (Nielsen); por eso es mejor dos rondas cortas corrigiendo
entre una y otra que una sola larga.
