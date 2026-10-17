# Propuesta para la Semana 10 (19 – 23 de octubre de 2026)

Propuesta para que Jeider elija antes de armar la Bitácora N.º 10 y el tablero de Trello. Cuando se decida, este archivo
pasa a la bitácora y se archiva.

## 1. Dónde quedamos (17/10)

- **v2.0.0 cerrada y etiquetada.** Revisión humana completa de las dos listas, con las correcciones confirmadas por todos:
  interfaz **31 / 32 · 96,9 %** y Tutores Inteligentes **23 / 24 · 95,8 %**. Quedan en CP **UX-04** (identidad visual) y
  **MOD-02** (errores de concepto). Archivo para entregar: `docs/calidad/listas-chequeo/2026-10-17_revision_equipo/`.
- **SUS del equipo:** 81,5 con 5 respuestas. Lo que más baja el puntaje: «innecesariamente complejo» y «necesitaría ayuda
  de una persona técnica». El manual y el tutorial apuntan justo a eso.
- **Las 16 sugerencias de la prueba**, atendidas.
- **Ejercicios de programar (dato de producción, 05 al 17/10, sin cuentas de prueba):** los estudiantes entregaron **7**
  ejercicios de programar, de 2 personas, contra 50 de opción múltiple, 32 de ordenar y 27 de completar código. Los que
  los entregaron, los aprobaron. No es que los fallen: **casi no los intentan.**

## 2. El pitch grupal (pasa a esta semana)

**Formato que propongo:** diapositivas con capturas de antes y después, y una demostración corta en vivo.

| | Qué es | A favor | En contra |
|---|---|---|---|
| **A. Diapositivas + 30 s en vivo (recomendada)** | 7 diapositivas: apertura, una por persona con sus 2 criterios (captura antes · captura después) y cierre con los totales. En medio, 30 s en vivo de una sola cosa que impresiona: el Tutor que acompaña paso a paso. | Claro y medible; la demostración en vivo muestra que funciona. | Si falla internet, la demo se cae: se lleva un video de respaldo de esos 30 s. |
| B. Solo diapositivas | Lo mismo, sin demostración. | Cero riesgo. | Menos convincente: el profesor no ve la app funcionando. |
| C. Video grabado | Cada uno graba su parte y se edita un video de 3 min. | Se puede repetir hasta que quede bien. | Más trabajo de edición y menos interacción. |

**Cómo se reparte** (igual que en `docs/pitch/PITCH_LISTAS_CHEQUEO.md`):
- **Jeider:** apertura (20 s), UX-08 y PAT-01 (ya escritos).
- **José, Jorge, Julio y Pedro:** 30 s cada uno, con 2 de sus criterios.
- **Pedro:** cierre (20 s): antes 62 % y 58 %, el equipo hoy 97 % y 96 %, SUS 81,5 y lo que falta.

Cada persona entrega su parte en español y en inglés, con sus dos capturas, a más tardar el **martes 20/10**. Ensayo con
cronómetro **antes de la exposición**.

## 3. Lo que se puede hacer esta semana

### 3.1 Ejercicios de programar más alcanzables (el más crítico)

El estudiante pasa de leer una lección a escribir un programa entero. La propuesta es una **escalera** con escalones
pequeños antes de escribir desde cero:

1. **Ver** un ejemplo resuelto, línea por línea, de un problema parecido.
2. **Ordenar** las líneas de un programa ya escrito (como un ejercicio de ordenar).
3. **Completar** el programa: faltan solo una o dos líneas (completar código).
4. **Escribir** el programa con una plantilla que ya lee la entrada.

STIRE ya tiene los tres tipos de ejercicio (ordenar, completar y programar); lo que falta es usarlos **en ese orden y con
el mismo problema**. Además: enunciados más cortos, un ejemplo de entrada y salida siempre visible, y que el Tutor ofrezca
el acompañamiento paso a paso desde el primer ejercicio de programar, no solo al tercer fallo.

- **Alcance de la semana:** las lecciones de Fundamentos que tienen ejercicios de programar en las Unidades 1 y 2. La
  Unidad 3 queda para después.
- **Quiénes:** Julio (criterio pedagógico: qué escalón hace falta en cada ejercicio), Pedro (como docente: los revisa en
  su clase) y Jeider (los construye en los cursos y en STIRE).
- **Base teórica:** se agrega una entrada BT con las fuentes verificadas antes de citarlas.

### 3.2 Inclusión: hablar con el Tutor

Jeider intentó hablarle al Tutor y no pudo. El micrófono ya está publicado, así que hay que saber qué pasó (navegador,
permiso del micrófono o que no se vio el botón). Propuesta:

1. Diagnosticar con Jeider y Jorge en Chrome, Edge, Firefox y el celular.
2. Si el navegador no tiene reconocimiento de voz (Firefox, algunos celulares), **grabar el audio y que Gemini lo
   transcriba** con la clave del estudiante: funciona en cualquier navegador y no cuesta.
3. Una opción para que el Tutor **lea en voz alta** cada respuesta sola, sin tocar «Escuchar».
4. Probar el Tutor con un lector de pantalla (NVDA en Windows y TalkBack en Android).

- **Quiénes:** Jeider (lo construye) y Jorge (QA de accesibilidad).

### 3.3 Manual de usuario

Como las guías de Canvas, Google Classroom y Open edX: **organizado por tareas y por rol**, no por pantallas. Ejemplos:
«Unirme a una clase», «Resolver un ejercicio», «Pedir ayuda al Tutor», «Crear una clase», «Publicar una lección»,
«Revisar entregas».

- **Formato:** una sección **Ayuda** dentro de STIRE (siempre a mano y siempre al día) y la misma información en PDF
  para entregar al profesor.
- **Cada tarea:** para qué sirve, pasos numerados con una captura y «si algo sale mal».
- **Alcance de la semana:** las 6 tareas del estudiante y las 6 del docente más usadas.
- **Quiénes:** Pedro (redacción, es su rol de documentación) y José (capturas y diseño).

### 3.4 Tutorial dentro de STIRE (recorrido guiado)

Un recorrido que señala cada parte de la pantalla con una explicación corta, la primera vez que se entra a cada
apartado (inicio, lección, ejercicio, Tutor, progreso, repasos y, en el docente, «Hoy», contenido, estudiantes y notas).
Se puede repetir desde un botón «?» en la cabecera. También sirve para **presentar STIRE** a alguien.

- **Herramienta:** Driver.js, que es libre (licencia MIT), liviana y funciona con Nuxt. Shepherd e Intro.js tienen
  licencias más restrictivas. La accesibilidad (teclado y lector de pantalla) se prueba antes de adoptarla.
- **Alcance de la semana:** los recorridos del estudiante (inicio, lección, ejercicio y Tutor). Los del docente, la
  Semana 11.
- **Quiénes:** Jeider (lo construye), Julio (los textos, en lenguaje de estudiante) y José (que se vea bien).

### 3.5 Lo que queda de las listas

- **UX-04 · José:** proponer cómo unificar las mayúsculas de las etiquetas y el estilo del botón principal en su identidad
  visual.
- **MOD-02 · Pedro y Jeider:** con la idea de Pedro, la tarjeta «Errores que más se repiten esta semana» en «Hoy» del
  docente.

## 4. Tres alternativas de semana

| | A. Completa | **B. Enfocada (recomendada)** | C. Mínima |
|---|---|---|---|
| Pitch grupal | ✅ | ✅ | ✅ |
| Ejercicios de programar (Unidades 1 y 2) | ✅ | ✅ | Solo el diagnóstico y la escalera en 2 lecciones |
| Voz con el Tutor | ✅ | ✅ diagnóstico y grabación de audio | Diagnóstico |
| Manual de usuario | ✅ estudiante y docente | ✅ estudiante | — |
| Tutorial guiado | ✅ estudiante y docente | ✅ estudiante | — |
| UX-04 y MOD-02 | ✅ | ✅ | ✅ |
| Riesgo | Alto: es mucho para una semana con el pitch | Medio | Bajo |

## 5. Reparto propuesto (alternativa B)

| Persona | Tareas |
|---|---|
| **Jeider** | Escalera de los ejercicios de programar (construcción) · voz con el Tutor · recorridos guiados del estudiante · MOD-02 con la idea de Pedro · operar el servidor y, después de la exposición, reactivar el apagado de las 23:00 y el SUS cada 90 días. |
| **Pedro** | 🔁 Resultados de la prueba (`PRUEBA_RESULTADOS.md`) · 🔁 coordinar el pitch, su parte y el cierre · su idea para MOD-02 · manual del estudiante (redacción) · bitácora N.º 10 y tablero. |
| **José** | 🔁 Su parte del pitch · UX-04 en su identidad visual · capturas y diseño del manual · que los recorridos guiados se vean bien. |
| **Jorge** | 🔁 QA de la Semana 9 (`REPORTE_QA_S9`) · 🔁 su parte del pitch · QA de accesibilidad de la voz con el Tutor y de los recorridos guiados (teclado y lector de pantalla). |
| **Julio** | 🔁 Docente de Pensamiento (reportes de las semanas 1 y 2) · 🔁 sus lecciones de estudiante de Fundamentos · 🔁 su parte del pitch · revisión pedagógica de la escalera de los ejercicios · textos de los recorridos guiados. |
| **Todos** | Ensayo y exposición del pitch · 7 Hábitos. |

## 6. Lo que falta decidir

1. **¿Qué alternativa?** (A, B o C).
2. **¿Qué día es la exposición del pitch?** De eso dependen los plazos de las partes y el ensayo.
3. **¿En qué navegador y en qué aparato intentaste hablarle al Tutor, y qué pasó?** (no salió el botón del micrófono, el
   navegador no pidió permiso, o escuchó pero no escribió nada).

## Fuentes

- Open edX, *Educator's Docs UX/UI* (ayuda organizada por tareas y con un «Primeros pasos»):
  https://openedx.atlassian.net/wiki/spaces/COMM/pages/4570742799/Open+edX+Educator+s+Docs+UX+UI
- Inline Manual, *Driver.js vs Intro.js vs Shepherd.js vs Reactour* (licencias):
  https://inlinemanual.com/blog/driverjs-vs-introjs-vs-shepherdjs-vs-reactour
- Chameleon, *The Best JavaScript Product Tour Libraries in 2026*: https://www.chameleon.io/blog/javascript-product-tours
- XWiki, *Library choice for the new Guided Tour Extension* (licencias AGPL):
  https://forum.xwiki.org/t/library-choice-for-the-new-guided-tour-extension/18191
