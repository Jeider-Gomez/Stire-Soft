import { LEER_ENTRADA, Seccion } from '../tipos';

/**
 * Unidad 3 del plan de curso 203413: Algoritmos para la creación de OVA y REDA (RA-203413-U3).
 * Qué son y qué los hace buenos, la lógica algorítmica detrás de un recurso interactivo y la estructura
 * accesible de sus páginas (evidencias U2-E2, U2-E3 y U3-E1).
 */
export const seccion3: Seccion = {
  titulo: 'Unidad 3 · Algoritmos para crear OVA y REDA',
  descripcion:
    'Llevar la algoritmia y el desarrollo web a recursos educativos: qué es un OVA y un REDA, la lógica de un cuestionario ' +
    'interactivo y la estructura accesible de sus páginas. Resultado de aprendizaje RA-203413-U3.',
  temas: [
    {
      titulo: 'OVA y REDA',
      descripcion: 'Qué son, en qué se diferencian, de qué partes se componen y cómo se diseñan.',
      unidades: [
        {
          titulo: '¿Qué es un OVA y qué lo hace bueno?',
          descripcion: 'Definición, componentes, criterios de calidad y fases de diseño de un objeto virtual de aprendizaje.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Recursos digitales con intención pedagógica',
            cuerpo: `## La idea

Un **OVA (Objeto Virtual de Aprendizaje)** es un recurso digital **autocontenido** y **reutilizable**, con un propósito
educativo claro. Según los lineamientos del Ministerio de Educación Nacional, se compone de:

- **Contenidos:** lo que se enseña (explicaciones, ejemplos, videos).
- **Actividades de aprendizaje:** lo que hace el estudiante (ejercicios, cuestionarios, simulaciones).
- **Elementos de contextualización:** objetivo, instrucciones y a quién va dirigido.
- **Metadatos:** una ficha que lo describe (autor, nivel, tema, palabras clave) para encontrarlo y reutilizarlo.

Un **REDA (Recurso Educativo Digital Abierto)** es un recurso educativo digital publicado con una **licencia abierta**
(por ejemplo, Creative Commons) que permite usarlo, adaptarlo y compartirlo. Un OVA puede ser un REDA si se publica
con esa licencia.

## Un ejemplo

Un OVA sobre ciclos para grado noveno podría tener: el objetivo «Usar un ciclo para repetir una tarea», una explicación
con la tabla de multiplicar, un cuestionario de cinco preguntas **con retroalimentación inmediata** y una ficha de metadatos.

¿Dónde está la algoritmia? En la **lógica** del recurso: el cuestionario recorre las preguntas con un ciclo, compara
cada respuesta con la clave y cuenta los aciertos. Es lo que construirás en el siguiente tema.

## Error común

Pensar que un OVA es «subir un PDF o un video». Sin **actividades** ni **retroalimentación**, el estudiante solo mira:
no hay aprendizaje activo. Tampoco es un buen OVA si no es **accesible**: imágenes sin texto alternativo o textos
sin contraste dejan por fuera a parte de los estudiantes.

## Pruébalo

Busca un OVA en un repositorio abierto (por ejemplo, Colombia Aprende) y ubica sus cuatro componentes. ¿Qué le falta?`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'OVA o REDA',
              enunciado: '¿Qué convierte a un recurso educativo digital en un **REDA**?',
              dificultad: 'basico',
              opciones: [
                'Que tenga videos y animaciones.',
                'Que esté publicado con una licencia abierta que permite usarlo, adaptarlo y compartirlo.',
                'Que tenga un cuestionario al final.',
                'Que esté hecho con HTML, CSS y JavaScript.',
              ],
              correcta: 1,
              explicacion:
                'La A de REDA es «Abierto»: lo que lo define es la licencia que permite reutilizarlo y adaptarlo. Puede estar hecho con cualquier herramienta y tener o no videos.',
              errorComun: 3,
            },
            {
              tipo: 'drag_drop',
              titulo: 'Las partes de un OVA',
              enunciado: 'Un OVA sobre ciclos tiene estos elementos. Ubica cada uno en el componente al que pertenece.',
              dificultad: 'basico',
              categorias: ['Contenido', 'Actividad de aprendizaje', 'Contextualización y metadatos'],
              elementos: [
                ['Explicación de la tabla de multiplicar con un ciclo for', 0],
                ['Video corto con un ejemplo de while', 0],
                ['Cuestionario de cinco preguntas con retroalimentación', 1],
                ['Ejercicio de ordenar las líneas de un ciclo', 1],
                ['Objetivo: «Usar un ciclo para repetir una tarea»', 2],
                ['Ficha con autor, grado y palabras clave', 2],
              ],
              errorComun: [4],
            },
            {
              tipo: 'ordering',
              titulo: 'Las fases para diseñar un OVA',
              enunciado: 'Ordena las fases del diseño de un OVA (un modelo basado en ADDIE).',
              dificultad: 'basico',
              pasos: [
                'Analizar: a quién va dirigido y qué necesita aprender',
                'Diseñar: objetivo, contenidos y actividades',
                'Desarrollar: construir las páginas con HTML, CSS y JavaScript',
                'Implementar: publicarlo y usarlo con estudiantes',
                'Evaluar: pruebas de usabilidad y mejoras',
              ],
              errorComun: [0, 2, 1, 3, 4],
            },
            {
              tipo: 'mcq',
              titulo: 'Un OVA accesible',
              enunciado: 'Un estudiante con discapacidad visual usa un lector de pantalla. ¿Qué cambio en el OVA le ayuda **más**?',
              dificultad: 'basico',
              opciones: [
                'Agregar más animaciones.',
                'Escribir un texto alternativo (alt) que describa cada imagen importante.',
                'Usar letras de colores distintos en cada párrafo.',
                'Poner la información importante dentro de imágenes.',
              ],
              correcta: 1,
              explicacion:
                'El lector de pantalla lee el atributo alt en voz alta. Sin él, la imagen no existe para ese estudiante. Poner texto dentro de imágenes empeora el problema.',
              errorComun: 3,
            },
          ],
        },
      ],
    },
    {
      titulo: 'Construir un OVA interactivo',
      descripcion: 'La lógica de un cuestionario con listas, ciclos y condicionales, y la estructura accesible de sus páginas.',
      unidades: [
        {
          titulo: 'La lógica de un cuestionario',
          descripcion: 'Guardar datos en listas, recorrerlas con un ciclo y calificar comparando con una clave.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Un cuestionario es un algoritmo',
            cuerpo: `## La idea

Un cuestionario interactivo se resuelve con lo que ya sabes, más una estructura nueva: la **lista** (en JavaScript,
un **arreglo**). Una lista guarda varios valores en una sola variable, y cada uno tiene una **posición** que empieza
en **0**:

\`\`\`js
const clave = ["b", "a", "c"];
console.log(clave[0]);      // "b"  (la primera)
console.log(clave.length);  // 3    (cuántos hay)
\`\`\`

Con \`texto.split(" ")\` un texto se convierte en lista: \`"b a c".split(" ")\` da \`["b", "a", "c"]\`.

## Un ejemplo

El algoritmo para calificar:

1. Recorrer las posiciones de 0 a \`clave.length - 1\`.
2. En cada posición, **comparar** la respuesta del estudiante con la clave.
3. Si coinciden, **sumar un acierto** (un contador).
4. Al final, calcular la nota: aciertos ÷ total × 5.

\`\`\`js
let aciertos = 0;
for (let i = 0; i < clave.length; i++) {
  if (respuestas[i] === clave[i]) {
    aciertos++;
  }
}
const nota = aciertos / clave.length * 5;
\`\`\`

## Error común

**Recorrer una posición de más:** \`i <= clave.length\`. La última posición es \`length - 1\`; en la posición
\`length\` no hay nada (\`undefined\`) y, como \`undefined === undefined\`, ¡el programa cuenta un acierto que no existe!

## Pruébalo

¿Qué nota saca un estudiante que acierta 4 de 5 preguntas? Calcúlalo con la fórmula y luego agrega a tu programa un
mensaje: «¡Excelente!» si la nota es 4.6 o más.`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'Las posiciones de una lista',
              enunciado: `¿Qué escribe este programa?

\`\`\`js
const colores = ["rojo", "verde", "azul"];
console.log(colores[1]);
\`\`\``,
              dificultad: 'basico',
              opciones: ['rojo', 'verde', 'azul', 'undefined'],
              correcta: 1,
              explicacion: 'Las posiciones empiezan en 0: colores[0] es "rojo" y colores[1] es "verde".',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: contar aciertos',
              enunciado: 'Completa el ciclo que recorre **todas** las preguntas y cuenta los aciertos.',
              dificultad: 'intermedio',
              lenguaje: 'javascript',
              plantilla: `let aciertos = 0;
for (let i = 0; i < clave.___a___; i++) {
  if (respuestas[i] ___b___ clave[i]) {
    aciertos++;
  }
}`,
              huecos: { a: 'length', b: { regex: '===|==', ejemplo: '===' } },
              errorComun: { b: '=' },
            },
            {
              tipo: 'coding',
              titulo: 'Calificar un cuestionario',
              enunciado: `La primera línea trae la **clave** del cuestionario y la segunda las **respuestas** del estudiante, separadas por espacios.

Escribe dos líneas:

\`\`\`
Aciertos: X de N
Nota: Y
\`\`\`

donde la nota es aciertos ÷ N × 5, con un decimal.

**Ejemplo:** con \`b a c d a\` y \`b a d d a\` la salida es \`Aciertos: 4 de 5\` y \`Nota: 4.0\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}const clave = lineas[0].trim().split(" ");
const respuestas = lineas[1].trim().split(" ");

// Cuenta los aciertos y calcula la nota
`,
              solucion: `${LEER_ENTRADA}const clave = lineas[0].trim().split(" ");
const respuestas = lineas[1].trim().split(" ");
let aciertos = 0;
for (let i = 0; i < clave.length; i++) {
  if (respuestas[i] === clave[i]) {
    aciertos++;
  }
}
console.log("Aciertos: " + aciertos + " de " + clave.length);
console.log("Nota: " + (aciertos / clave.length * 5).toFixed(1));
`,
              casos: [
                { entrada: 'b a c d a\nb a d d a', salida: 'Aciertos: 4 de 5\nNota: 4.0', publico: true },
                { entrada: 'a b c\nc b a', salida: 'Aciertos: 1 de 3\nNota: 1.7', publico: false },
                { entrada: 'a a a a\na a a a', salida: 'Aciertos: 4 de 4\nNota: 5.0', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const clave = lineas[0].trim().split(" ");
const respuestas = lineas[1].trim().split(" ");
let aciertos = 0;
for (let i = 0; i <= clave.length; i++) {
  if (respuestas[i] === clave[i]) {
    aciertos++;
  }
}
console.log("Aciertos: " + aciertos + " de " + clave.length);
console.log("Nota: " + (aciertos / clave.length * 5).toFixed(1));
`,
            },
            {
              tipo: 'coding',
              titulo: 'Retroalimentación para cada respuesta',
              enunciado: `Un buen OVA no solo califica: le dice al estudiante **qué** hizo bien y qué no.

Con la misma entrada (clave y respuestas), escribe una línea por pregunta:

- \`Pregunta 1: correcta\` si acertó,
- \`Pregunta 1: incorrecta, era b\` si no acertó (con la respuesta correcta).

**Ejemplo:** con \`b a c\` y \`b c c\` la salida es:

\`\`\`
Pregunta 1: correcta
Pregunta 2: incorrecta, era a
Pregunta 3: correcta
\`\`\``,
              dificultad: 'avanzado',
              inicial: `${LEER_ENTRADA}const clave = lineas[0].trim().split(" ");
const respuestas = lineas[1].trim().split(" ");

// Recorre las preguntas y escribe la retroalimentación
`,
              solucion: `${LEER_ENTRADA}const clave = lineas[0].trim().split(" ");
const respuestas = lineas[1].trim().split(" ");
for (let i = 0; i < clave.length; i++) {
  if (respuestas[i] === clave[i]) {
    console.log("Pregunta " + (i + 1) + ": correcta");
  } else {
    console.log("Pregunta " + (i + 1) + ": incorrecta, era " + clave[i]);
  }
}
`,
              casos: [
                { entrada: 'b a c\nb c c', salida: 'Pregunta 1: correcta\nPregunta 2: incorrecta, era a\nPregunta 3: correcta', publico: true },
                { entrada: 'a b\nb a', salida: 'Pregunta 1: incorrecta, era a\nPregunta 2: incorrecta, era b', publico: false },
                { entrada: 'd\nd', salida: 'Pregunta 1: correcta', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const clave = lineas[0].trim().split(" ");
const respuestas = lineas[1].trim().split(" ");
for (let i = 0; i < clave.length; i++) {
  if (respuestas[i] === clave[i]) {
    console.log("Pregunta " + i + ": correcta");
  } else {
    console.log("Pregunta " + i + ": incorrecta, era " + respuestas[i]);
  }
}
`,
            },
          ],
        },
        {
          titulo: 'Estructura y navegación de un OVA',
          descripcion: 'Páginas semánticas, navegación interna y accesibilidad básica (evidencias U2-E2 y U3-E1).',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Una página que se entiende y se recorre fácil',
            cuerpo: `## La idea

Un OVA suele tener varias partes (presentación, contenido, actividad, créditos). HTML tiene elementos **semánticos**
que dicen qué es cada parte, y eso ayuda a los lectores de pantalla y a quien mantenga el código:

| Elemento | Para qué |
|---|---|
| \`<header>\` | Encabezado: el título del OVA |
| \`<nav>\` | Menú de navegación |
| \`<main>\` | El contenido principal (uno por página) |
| \`<section>\` | Una parte del contenido con su propio tema |
| \`<footer>\` | Pie: autor, licencia, créditos |

Un menú puede llevar a cada parte de la **misma página** con enlaces internos: \`<a href="#actividad">\` lleva a
\`<section id="actividad">\`.

## Un ejemplo

\`\`\`html
<!DOCTYPE html>
<html lang="es">
<head><title>OVA: Ciclos</title></head>
<body>
  <header><h1>Aprende ciclos</h1></header>
  <nav>
    <a href="#objetivo">Objetivo</a>
    <a href="#contenido">Contenido</a>
    <a href="#actividad">Actividad</a>
  </nav>
  <main>
    <section id="objetivo">…</section>
    <section id="contenido">…</section>
    <section id="actividad">…</section>
  </main>
  <footer>Licencia CC BY-SA 4.0</footer>
</body>
</html>
\`\`\`

**Lista mínima de accesibilidad:** idioma declarado (\`lang="es"\`), título de la página (\`<title>\`), un solo \`<h1>\`,
\`alt\` en las imágenes y una etiqueta (\`<label>\`) para cada campo de formulario.

## Error común

Escribir el enlace sin el numeral: \`href="actividad"\` busca **otra página** llamada «actividad». Para ir a una
sección de la misma página es \`href="#actividad"\`, y la sección debe tener \`id="actividad"\`.

## Pruébalo

Toma la página del ejemplo y agrega una sección «Créditos» con su enlace en el menú. ¿El enlace te lleva a ella?`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: 'Los elementos semánticos',
              enunciado: 'Une cada elemento semántico de HTML con la parte del OVA que representa.',
              dificultad: 'basico',
              parejas: [
                ['<header>', 'El encabezado con el título del OVA'],
                ['<nav>', 'El menú para moverse entre partes'],
                ['<main>', 'El contenido principal de la página'],
                ['<section>', 'Una parte del contenido con su propio tema'],
                ['<footer>', 'Autor, licencia y créditos'],
              ],
            },
            {
              tipo: 'mcq',
              titulo: 'El enlace interno',
              enunciado: 'Quieres que el menú lleve a `<section id="actividad">` en la misma página. ¿Qué enlace funciona?',
              dificultad: 'basico',
              opciones: [
                '<a href="actividad">Actividad</a>',
                '<a href="#actividad">Actividad</a>',
                '<a id="actividad">Actividad</a>',
                '<a href=".actividad">Actividad</a>',
              ],
              correcta: 1,
              explicacion: 'El numeral indica una parte de la misma página: href="#actividad" lleva al elemento con id="actividad". Sin numeral, el navegador busca otra página.',
              errorComun: 0,
            },
            {
              tipo: 'html_css',
              titulo: 'La portada de un OVA',
              enunciado: `Construye la página principal de un OVA sobre el tema que prefieras (evidencias **U2-E2** y **U3-E1**). Debe tener:

- idioma declarado en \`<html lang="es">\` y un \`<title>\`;
- un \`<header>\` con el título \`<h1>\`;
- un \`<nav>\` con **al menos tres** enlaces internos (\`href="#..."\`);
- un \`<main>\` con **al menos tres** \`<section>\` que tengan \`id\`;
- un \`<footer>\` con la licencia.`,
              dificultad: 'intermedio',
              htmlInicial: `<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <!-- Construye aquí el OVA -->
</body>
</html>
`,
              cssInicial: '',
              solucion: {
                html: `<!DOCTYPE html>
<html lang="es">
<head>
  <title>OVA: Ciclos</title>
</head>
<body>
  <header><h1>Aprende ciclos</h1></header>
  <nav>
    <a href="#objetivo">Objetivo</a>
    <a href="#contenido">Contenido</a>
    <a href="#actividad">Actividad</a>
  </nav>
  <main>
    <section id="objetivo"><h2>Objetivo</h2><p>Usar un ciclo para repetir una tarea.</p></section>
    <section id="contenido"><h2>Contenido</h2><p>El ciclo for repite un bloque un número de veces.</p></section>
    <section id="actividad"><h2>Actividad</h2><p>Escribe la tabla del 7 con un ciclo.</p></section>
  </main>
  <footer>Licencia CC BY-SA 4.0</footer>
</body>
</html>`,
                css: '',
              },
              reglas: [
                { id: 'idioma', label: 'La página declara su idioma (lang)', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'html_lang' } },
                { id: 'titulo-doc', label: 'La página tiene <title>', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'document_title' } },
                { id: 'encabezado', label: 'El <header> tiene el título <h1>', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'header h1' } },
                {
                  id: 'menu',
                  label: 'El <nav> tiene al menos tres enlaces internos',
                  hint: 'Los enlaces internos empiezan con #, por ejemplo href="#actividad".',
                  isPublic: true,
                  weight: 2,
                  check: { kind: 'element_count', selector: 'nav a[href^="#"]', min: 3 },
                },
                { id: 'secciones', label: 'El <main> tiene al menos tres <section> con id', isPublic: true, weight: 2, check: { kind: 'element_count', selector: 'main section[id]', min: 3 } },
                { id: 'pie', label: 'Hay un <footer>', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'footer' } },
                { id: 'un-h1', label: 'Un solo título principal', isPublic: false, weight: 1, check: { kind: 'a11y', check: 'single_h1' } },
              ],
              errorComun: {
                html: `<!DOCTYPE html>
<html>
<head>
  <title>OVA: Ciclos</title>
</head>
<body>
  <header><h1>Aprende ciclos</h1></header>
  <nav>
    <a href="objetivo">Objetivo</a>
    <a href="contenido">Contenido</a>
    <a href="actividad">Actividad</a>
  </nav>
  <main>
    <section id="objetivo"><h2>Objetivo</h2></section>
    <section id="contenido"><h2>Contenido</h2></section>
    <section id="actividad"><h2>Actividad</h2></section>
  </main>
  <footer>Licencia CC BY-SA 4.0</footer>
</body>
</html>`,
                css: '',
              },
            },
          ],
        },
      ],
    },
  ],
};
