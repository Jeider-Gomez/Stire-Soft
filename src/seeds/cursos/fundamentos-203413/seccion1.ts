import { LEER_ENTRADA, Seccion } from '../tipos';

/**
 * Unidad 1 del plan de curso 203413: Introducción a la algoritmia (RA-203413-U1).
 * Conceptos básicos, representación (pseudocódigo y diagramas), variables y operadores, y la
 * estructura de una página web (evidencias U1-E1 y U1-E3 del plan).
 */
export const seccion1: Seccion = {
  titulo: 'Unidad 1 · Introducción a la algoritmia',
  descripcion:
    'Qué es un algoritmo, cómo se representa, cómo se guardan y combinan datos, y cómo se estructura una página web. ' +
    'Resultado de aprendizaje RA-203413-U1.',
  temas: [
    {
      titulo: '¿Qué es un algoritmo?',
      descripcion: 'La idea central del curso: pasos precisos, ordenados y finitos que resuelven un problema.',
      unidades: [
        {
          titulo: 'Algoritmos en la vida diaria',
          descripcion: 'Reconocer un algoritmo y sus características: preciso, definido y finito.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Un algoritmo es una receta que no deja dudas',
            cuerpo: `## La idea

Un **algoritmo** es una secuencia **ordenada** y **finita** de pasos **precisos** que resuelve un problema.
Lo usas todos los días sin llamarlo así: cuando explicas cómo llegar a tu casa, cuando sigues una receta o cuando
repites un procedimiento en el colegio.

Para que una lista de pasos sea un algoritmo debe cumplir tres características:

| Característica | Qué significa | Pregunta para revisarla |
|---|---|---|
| **Preciso** | Cada paso dice exactamente qué hacer. | ¿Dos personas harían lo mismo con este paso? |
| **Definido** | Con los mismos datos, siempre da el mismo resultado. | ¿Si lo repito, obtengo lo mismo? |
| **Finito** | Termina después de un número de pasos. | ¿Tiene un final claro? |

## Un ejemplo

Algoritmo para preparar un tinto:

1. Poner agua en la olla.
2. Encender la estufa y esperar a que el agua hierva.
3. Agregar dos cucharadas de café.
4. Dejar reposar dos minutos.
5. Colar y servir en el pocillo.

Fíjate en que el **orden importa**: si cuelas antes de agregar el café, sirves agua caliente.

## Error común

Escribir pasos **ambiguos**: «echa un poquito de azúcar», «espera un rato», «camina hasta que te canses».
Una persona los interpreta a su manera, pero un computador no puede adivinar: necesita cantidades, condiciones y
un final claro. Cambia «un rato» por «dos minutos» y «hasta que te canses» por «20 pasos».

## Pruébalo

Escribe en tu cuaderno el algoritmo para **enviar un mensaje de WhatsApp**. Luego pídele a un compañero que lo siga
**al pie de la letra**, sin completar lo que falte. ¿Llegó al mismo resultado? Si no, ¿qué paso era impreciso?`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: '¿Cuál instrucción no sirve en un algoritmo?',
              enunciado:
                'Un algoritmo solo puede tener instrucciones **precisas**. ¿Cuál de estas instrucciones **no** podría seguir un computador?',
              dificultad: 'basico',
              opciones: [
                'Suma 5 al número anterior.',
                'Repite el paso 2 hasta que el vaso esté lleno.',
                'Echa un poquito de sal, al gusto.',
                'Si el número es negativo, escribe «negativo».',
              ],
              correcta: 2,
              explicacion:
                '«Un poquito» y «al gusto» dependen de quien lo lea: no es preciso. Repetir hasta que el vaso esté lleno sí es válido, porque tiene una condición clara para terminar.',
              errorComun: 1,
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena el algoritmo del tinto',
              enunciado: 'Pon los pasos en el orden en que deben ejecutarse para preparar un tinto.',
              dificultad: 'basico',
              pasos: [
                'Poner agua en la olla',
                'Encender la estufa y esperar a que el agua hierva',
                'Agregar dos cucharadas de café',
                'Dejar reposar dos minutos',
                'Colar y servir en el pocillo',
              ],
              errorComun: [0, 2, 1, 3, 4],
            },
            {
              tipo: 'drag_drop',
              titulo: '¿Precisa o ambigua?',
              enunciado:
                'Clasifica cada instrucción. Una instrucción es **precisa** si cualquier persona (o un computador) la ejecutaría exactamente igual.',
              dificultad: 'basico',
              categorias: ['Instrucción precisa', 'Instrucción ambigua'],
              elementos: [
                ['Camina 20 pasos hacia la puerta', 0],
                ['Camina un rato', 1],
                ['Multiplica el precio por 3', 0],
                ['Calcula más o menos el total', 1],
                ['Si está lloviendo, lleva el paraguas', 0],
                ['Espera un momentico', 1],
              ],
              errorComun: [4],
            },
            {
              tipo: 'mcq',
              titulo: '¿Qué le falta a este algoritmo?',
              enunciado: `Lee este algoritmo:

1. Escribe el número 1.
2. Súmale 2 al número y escríbelo.
3. Vuelve al paso 2.

¿Qué característica de un algoritmo **no** cumple?`,
              dificultad: 'basico',
              opciones: ['Precisión', 'Finitud', 'Orden', 'Tener un propósito'],
              correcta: 1,
              explicacion:
                'Cada paso es preciso y está en orden, pero el paso 3 lo devuelve al 2 para siempre: nunca termina. Le falta una condición de parada, por ejemplo «si el número pasa de 20, termina».',
              errorComun: 0,
            },
          ],
        },
        {
          titulo: 'Pseudocódigo y diagramas de flujo',
          descripcion: 'Representar un algoritmo antes de programarlo y comprobarlo con una prueba de escritorio.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Escribir el algoritmo antes de programarlo',
            cuerpo: `## La idea

Antes de escribir código, los programadores **representan** el algoritmo de una forma que cualquiera pueda leer.
Las dos más usadas son:

- **Pseudocódigo:** instrucciones en español, con palabras clave como \`Leer\`, \`Escribir\` y \`<-\` (asignar).
- **Diagrama de flujo:** figuras unidas por flechas.

| Figura | Significado |
|---|---|
| Óvalo | Inicio o fin |
| Paralelogramo | Entrada o salida de datos |
| Rectángulo | Proceso: un cálculo o una asignación |
| Rombo | Decisión: una pregunta de sí o no |

## Un ejemplo

Promedio de tres notas, en pseudocódigo (el estilo de PSeInt):

\`\`\`
Algoritmo Promedio
    Leer nota1, nota2, nota3
    promedio <- (nota1 + nota2 + nota3) / 3
    Escribir promedio
FinAlgoritmo
\`\`\`

Para saber si funciona hacemos una **prueba de escritorio**: seguimos el algoritmo con datos inventados y anotamos
cada valor en una tabla.

| nota1 | nota2 | nota3 | promedio |
|---|---|---|---|
| 3.0 | 4.0 | 5.0 | 4.0 |

## Error común

Olvidar los paréntesis: \`nota1 + nota2 + nota3 / 3\`. La división se hace **antes** que la suma, así que con 3, 4 y 5
el resultado es 3 + 4 + 1.67 = **8.67**, no 4. Si la prueba de escritorio da un promedio mayor que la nota más alta,
algo anda mal.

## Pruébalo

Escribe en pseudocódigo el algoritmo que lee la **base** y la **altura** de un rectángulo y escribe su **área**.
Haz la prueba de escritorio con base 5 y altura 3. ¿Te dio 15?`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: 'Las figuras del diagrama de flujo',
              enunciado: 'Une cada figura del diagrama de flujo con lo que representa.',
              dificultad: 'basico',
              parejas: [
                ['Óvalo', 'Inicio o fin del algoritmo'],
                ['Paralelogramo', 'Entrada o salida de datos'],
                ['Rectángulo', 'Proceso: un cálculo o una asignación'],
                ['Rombo', 'Decisión: una pregunta de sí o no'],
                ['Flecha', 'El orden en que se sigue el algoritmo'],
              ],
            },
            {
              tipo: 'ordering',
              titulo: 'Área de un triángulo en pseudocódigo',
              enunciado: 'Ordena las líneas del pseudocódigo que calcula el área de un triángulo.',
              dificultad: 'basico',
              pasos: [
                'Algoritmo AreaTriangulo',
                'Leer base',
                'Leer altura',
                'area <- base * altura / 2',
                'Escribir area',
                'FinAlgoritmo',
              ],
              errorComun: [0, 3, 1, 2, 4, 5],
            },
            {
              tipo: 'mcq',
              titulo: 'Prueba de escritorio: el promedio sin paréntesis',
              enunciado: `Un estudiante escribió este algoritmo:

\`\`\`
Leer nota1, nota2, nota3
promedio <- nota1 + nota2 + nota3 / 3
Escribir promedio
\`\`\`

Si las notas son **3**, **4** y **5**, ¿qué escribe?`,
              dificultad: 'basico',
              opciones: ['4', '8.67 (aproximadamente)', '12', '4.67 (aproximadamente)'],
              correcta: 1,
              explicacion:
                'La división va primero: 5 / 3 = 1.67. Luego 3 + 4 + 1.67 = 8.67. Para obtener 4 hay que escribir (nota1 + nota2 + nota3) / 3.',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: de Celsius a Fahrenheit',
              enunciado:
                'Completa el pseudocódigo que convierte una temperatura de grados Celsius a Fahrenheit. La fórmula es F = C × 9 / 5 + 32.',
              dificultad: 'basico',
              lenguaje: 'text',
              plantilla: `Algoritmo CelsiusAFahrenheit
    ___a___ celsius
    fahrenheit <- celsius * 9 / 5 + ___b___
    ___c___ fahrenheit
FinAlgoritmo`,
              huecos: {
                a: { regex: 'leer', ejemplo: 'Leer' },
                b: '32',
                c: { regex: 'escribir|imprimir|mostrar', ejemplo: 'Escribir' },
              },
              errorComun: { a: 'Escribir', c: 'Leer' },
            },
          ],
        },
      ],
    },
    {
      titulo: 'Variables, operadores y expresiones',
      descripcion: 'Guardar datos con nombre y combinarlos con operaciones. Primeros programas en JavaScript.',
      unidades: [
        {
          titulo: 'Variables y tipos de datos',
          descripcion: 'Declarar variables con let y const, reconocer números, textos y valores lógicos.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Una variable es una caja con nombre',
            cuerpo: `## La idea

Una **variable** es un espacio de la memoria con un **nombre**, donde guardas un dato para usarlo después.
En JavaScript se crean así:

\`\`\`js
let edad = 19;          // let: el valor puede cambiar
const ciudad = "Montería"; // const: el valor no cambia
\`\`\`

Cada dato tiene un **tipo**:

| Tipo | Ejemplos | Para qué sirve |
|---|---|---|
| \`number\` (número) | \`19\`, \`3.5\`, \`-2\` | Hacer cuentas |
| \`string\` (texto) | \`"Montería"\`, \`'hola'\`, \`"42"\` | Nombres, mensajes |
| \`boolean\` (lógico) | \`true\`, \`false\` | Responder sí o no |

Para mostrar un resultado usamos \`console.log(...)\`.

## Un ejemplo

En los ejercicios de programar, el programa **lee** los datos de entrada. Cada línea llega como **texto**, por eso
se convierte a número con \`Number(...)\`:

\`\`\`js
const lineas = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nombre = lineas[0];           // primera línea: un texto
const edad = Number(lineas[1]);     // segunda línea: convertida a número
console.log(nombre + " tiene " + edad + " años");
\`\`\`

Si la entrada es \`Luisa\` y \`19\`, el programa escribe \`Luisa tiene 19 años\`.

## Error común

Olvidar que \`"42"\` (con comillas) es **texto**, no número. Con textos, el \`+\` **pega** en vez de sumar:
\`"5" + 3\` da \`"53"\`. Por eso siempre convertimos con \`Number(...)\` lo que viene de la entrada.

## Pruébalo

Escribe un programa que lea tu nombre y tu ciudad (dos líneas) y escriba: \`Soy Ana y vivo en Montería\`.`,
          },
          ejercicios: [
            {
              tipo: 'drag_drop',
              titulo: 'Clasifica los tipos de datos',
              enunciado: 'Ubica cada valor de JavaScript en su tipo de dato. Fíjate bien en las comillas.',
              dificultad: 'basico',
              categorias: ['Número (number)', 'Texto (string)', 'Lógico (boolean)'],
              elementos: [
                ['42', 0],
                ['3.5', 0],
                ['"Montería"', 1],
                ['"42"', 1],
                ['true', 2],
                ['false', 2],
                ["'hola'", 1],
              ],
              errorComun: [3],
            },
            {
              tipo: 'mcq',
              titulo: '¿Qué pasa si cambias una constante?',
              enunciado: `¿Qué ocurre al ejecutar este código?

\`\`\`js
const pi = 3.14;
pi = 3.1416;
console.log(pi);
\`\`\``,
              dificultad: 'basico',
              opciones: [
                'Escribe 3.1416',
                'Da un error: no se puede cambiar el valor de una constante',
                'Escribe 3.14 y no da error',
                'Escribe 3.143.1416',
              ],
              correcta: 1,
              explicacion:
                'Una variable declarada con const no se puede reasignar: JavaScript lanza «Assignment to constant variable». Si el valor debe cambiar, se declara con let.',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa la presentación',
              enunciado:
                'Completa el código para que escriba exactamente `Luisa tiene 19 años`. El nombre no cambia durante el programa.',
              dificultad: 'basico',
              lenguaje: 'javascript',
              plantilla: `___a___ nombre = "Luisa";
let edad = ___b___;
console.log(nombre + " tiene " + edad + " años");`,
              huecos: {
                a: { regex: 'const|let', ejemplo: 'const' },
                b: '19',
              },
              errorComun: { b: '"19 años"' },
            },
            {
              tipo: 'coding',
              titulo: 'Saludo personalizado',
              enunciado: `Escribe un programa que lea un **nombre** y escriba el saludo:

\`\`\`
Hola, <nombre>. Bienvenido a Algoritmia.
\`\`\`

**Ejemplo:** si la entrada es \`Ana\`, la salida es \`Hola, Ana. Bienvenido a Algoritmia.\`

Revisa los espacios y los puntos: la salida debe ser exactamente igual.`,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}const nombre = lineas[0];

// Escribe el saludo con console.log
`,
              solucion: `${LEER_ENTRADA}const nombre = lineas[0];
console.log("Hola, " + nombre + ". Bienvenido a Algoritmia.");
`,
              casos: [
                { entrada: 'Ana', salida: 'Hola, Ana. Bienvenido a Algoritmia.', publico: true },
                { entrada: 'Juan Carlos', salida: 'Hola, Juan Carlos. Bienvenido a Algoritmia.', publico: false },
                { entrada: 'María José', salida: 'Hola, María José. Bienvenido a Algoritmia.', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const nombre = lineas[0];
console.log("Hola," + nombre + " Bienvenido a Algoritmia.");
`,
            },
          ],
        },
        {
          titulo: 'Operadores y expresiones',
          descripcion: 'Hacer cuentas, comparar y combinar condiciones respetando la precedencia.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Operadores: las cuentas que hace el programa',
            cuerpo: `## La idea

Una **expresión** combina valores y operadores para producir un resultado.

| Operador | Qué hace | Ejemplo | Resultado |
|---|---|---|---|
| \`+ - * /\` | Suma, resta, multiplicación, división | \`10 / 4\` | \`2.5\` |
| \`%\` | Residuo de la división | \`7 % 2\` | \`1\` |
| \`**\` | Potencia | \`2 ** 3\` | \`8\` |
| \`=== !==\` | Igual, diferente | \`5 === 5\` | \`true\` |
| \`> < >= <=\` | Mayor, menor… | \`3 >= 3\` | \`true\` |
| \`&& || !\` | Y, o, no | \`true && false\` | \`false\` |

**Precedencia:** primero paréntesis, luego \`**\`, luego \`* / %\`, y al final \`+ -\`.
\`Math.floor(x)\` quita los decimales hacia abajo: \`Math.floor(7 / 2)\` es \`3\`.

## Un ejemplo

Convertir 135 minutos a horas y minutos:

\`\`\`js
const minutos = 135;
const horas = Math.floor(minutos / 60); // 2
const resto = minutos % 60;             // 15
console.log(horas + " h " + resto + " min"); // 2 h 15 min
\`\`\`

## Error común

Sumar sin convertir la entrada. Si \`base\` y \`altura\` son los textos \`"3"\` y \`"4"\`, entonces
\`2 * (base + altura)\` calcula \`2 * "34"\` = **68**, no 14. Convierte primero: \`Number(lineas[0])\`.

## Pruébalo

¿Cuánto vale \`2 + 3 * 4\`? ¿Y \`(2 + 3) * 4\`? Escríbelo en papel antes de comprobarlo con \`console.log\`.`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: '¿Cuánto vale cada expresión?',
              enunciado: 'Une cada expresión de JavaScript con su resultado. Recuerda la precedencia de los operadores.',
              dificultad: 'basico',
              parejas: [
                ['7 % 2', '1'],
                ['10 / 4', '2.5'],
                ['2 + 3 * 4', '14'],
                ['(2 + 3) * 4', '20'],
                ['Math.floor(7 / 2)', '3'],
              ],
            },
            {
              tipo: 'mcq',
              titulo: 'Operadores lógicos: ¿puede entrar?',
              enunciado: `Para entrar a una actividad hay que ser mayor de edad **o** tener permiso firmado.

\`\`\`js
let edad = 16;
let conPermiso = true;
console.log(edad >= 18 || conPermiso);
\`\`\`

¿Qué escribe el programa?`,
              dificultad: 'basico',
              opciones: ['true', 'false', '16', 'Da un error'],
              correcta: 0,
              explicacion:
                'edad >= 18 es false, pero conPermiso es true. Con || (o) basta con que una de las dos sea verdadera: false || true da true.',
              errorComun: 1,
            },
            {
              tipo: 'coding',
              titulo: 'Área y perímetro de un rectángulo',
              enunciado: `Lee la **base** (primera línea) y la **altura** (segunda línea) de un rectángulo. Escribe en dos líneas:

1. El área (base × altura).
2. El perímetro (2 × (base + altura)).

**Ejemplo:** con \`3\` y \`4\` la salida es:

\`\`\`
12
14
\`\`\``,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}const base = Number(lineas[0]);
const altura = Number(lineas[1]);

// Calcula y escribe el área y el perímetro
`,
              solucion: `${LEER_ENTRADA}const base = Number(lineas[0]);
const altura = Number(lineas[1]);
console.log(base * altura);
console.log(2 * (base + altura));
`,
              casos: [
                { entrada: '3\n4', salida: '12\n14', publico: true },
                { entrada: '5\n5', salida: '25\n20', publico: false },
                { entrada: '2.5\n4', salida: '10\n13', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const base = lineas[0];
const altura = lineas[1];
console.log(base * altura);
console.log(2 * (base + altura));
`,
            },
            {
              tipo: 'coding',
              titulo: 'De minutos a horas',
              enunciado: `Lee una cantidad de **minutos** y escríbela en horas y minutos con el formato \`H h M min\`.

**Ejemplo:** con \`135\` la salida es \`2 h 15 min\`.

Pista: \`Math.floor\` y el operador \`%\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}const minutos = Number(lineas[0]);

// Calcula las horas completas y los minutos que sobran
`,
              solucion: `${LEER_ENTRADA}const minutos = Number(lineas[0]);
const horas = Math.floor(minutos / 60);
const resto = minutos % 60;
console.log(horas + " h " + resto + " min");
`,
              casos: [
                { entrada: '135', salida: '2 h 15 min', publico: true },
                { entrada: '60', salida: '1 h 0 min', publico: false },
                { entrada: '45', salida: '0 h 45 min', publico: false },
                { entrada: '1440', salida: '24 h 0 min', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const minutos = Number(lineas[0]);
const horas = minutos / 60;
const resto = minutos % 60;
console.log(horas + " h " + resto + " min");
`,
            },
          ],
        },
      ],
    },
    {
      titulo: 'La estructura de una página web',
      descripcion: 'HTML como la estructura ordenada de una página: la primera aplicación de la algoritmia al desarrollo web.',
      unidades: [
        {
          titulo: 'Mi primera página HTML',
          descripcion: 'Construir una plantilla web básica con encabezados, párrafos, listas y enlaces (evidencia U1-E1).',
          dificultad: 'basico',
          leccion: {
            titulo: 'HTML: la estructura de la página',
            cuerpo: `## La idea

**HTML** describe la **estructura** de una página: qué es un título, qué es un párrafo, qué es una lista.
Cada elemento se escribe con una etiqueta de apertura y otra de cierre:

\`\`\`html
<p>Esto es un párrafo.</p>
\`\`\`

Toda página tiene el mismo esqueleto, y su orden importa tanto como el de un algoritmo:

\`\`\`html
<!DOCTYPE html>
<html lang="es">
  <head>
    <title>Mi clase</title>
  </head>
  <body>
    <h1>Bienvenidos</h1>
  </body>
</html>
\`\`\`

- \`<head>\` guarda información **sobre** la página (el título de la pestaña).
- \`<body>\` guarda lo que **se ve**.

## Un ejemplo

\`\`\`html
<h1>Fundamentos de Algoritmia</h1>
<p>En este curso aprenderás a resolver problemas paso a paso.</p>
<ul>
  <li>Algoritmos</li>
  <li>Variables</li>
  <li>Condicionales</li>
</ul>
<a href="https://developer.mozilla.org/es/docs/Learn">Aprende más en MDN</a>
\`\`\`

## Error común

Poner \`<li>\` sin su lista \`<ul>\` alrededor, o cerrar las etiquetas en desorden:
\`<p><strong>Hola</p></strong>\`. Las etiquetas se cierran en orden inverso al que se abrieron, como cajas dentro de cajas:
\`<p><strong>Hola</strong></p>\`.

## Pruébalo

Arma la página de presentación de tu curso favorito: un título, un párrafo que diga de qué trata, una lista con tres temas
y un enlace a una página donde aprender más.`,
          },
          ejercicios: [
            {
              tipo: 'ordering',
              titulo: 'Ordena el esqueleto de la página',
              enunciado: 'Ordena las líneas para formar el esqueleto correcto de una página HTML.',
              dificultad: 'basico',
              pasos: [
                '<!DOCTYPE html>',
                '<html lang="es">',
                '<head>',
                '<title>Mi clase</title>',
                '</head>',
                '<body>',
                '<h1>Bienvenidos</h1>',
                '</body>',
                '</html>',
              ],
              errorComun: [0, 1, 2, 4, 5, 3, 6, 7, 8],
            },
            {
              tipo: 'matching',
              titulo: 'Cada etiqueta con su uso',
              enunciado: 'Une cada etiqueta HTML con lo que representa.',
              dificultad: 'basico',
              parejas: [
                ['<h1>', 'El título principal de la página'],
                ['<p>', 'Un párrafo de texto'],
                ['<ul>', 'Una lista con viñetas'],
                ['<a>', 'Un enlace a otra página'],
                ['<img>', 'Una imagen'],
              ],
            },
            {
              tipo: 'mcq',
              titulo: '¿Cuál está bien anidado?',
              enunciado: '¿Cuál de estas líneas de HTML cierra las etiquetas en el orden correcto?',
              dificultad: 'basico',
              opciones: [
                '<p><strong>Hola</p></strong>',
                '<p><strong>Hola</strong></p>',
                '<strong><p>Hola</strong></p>',
                '<p>Hola<strong></p></strong>',
              ],
              correcta: 1,
              explicacion:
                'La última etiqueta que se abre es la primera que se cierra: strong se abrió dentro de p, así que se cierra antes que p.',
              errorComun: 0,
            },
            {
              tipo: 'html_css',
              titulo: 'Plantilla web de mi curso',
              enunciado: `Construye la plantilla básica de la página de un curso (evidencia **U1-E1** del plan). Debe tener:

- un título principal \`<h1>\`,
- al menos un párrafo \`<p>\`,
- una lista \`<ul>\` con **al menos tres** elementos \`<li>\`,
- un enlace \`<a>\` con su atributo \`href\`.

Mira el resultado en la vista previa mientras escribes.`,
              dificultad: 'basico',
              htmlInicial: `<!-- Escribe aquí la estructura de la página -->
`,
              cssInicial: '',
              solucion: {
                html: `<h1>Fundamentos de Algoritmia</h1>
<p>En este curso aprenderás a resolver problemas paso a paso.</p>
<ul>
  <li>Algoritmos</li>
  <li>Variables</li>
  <li>Condicionales</li>
</ul>
<a href="https://developer.mozilla.org/es/docs/Learn">Aprende más en MDN</a>`,
                css: '',
              },
              reglas: [
                { id: 'titulo', label: 'Hay un título principal <h1>', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'h1' } },
                { id: 'parrafo', label: 'Hay al menos un párrafo <p>', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'p' } },
                {
                  id: 'lista',
                  label: 'La lista <ul> tiene al menos tres <li>',
                  hint: 'Cada <li> va dentro de <ul>…</ul>.',
                  isPublic: true,
                  weight: 2,
                  check: { kind: 'element_count', selector: 'ul > li', min: 3 },
                },
                { id: 'enlace', label: 'El enlace tiene su atributo href', isPublic: true, weight: 1, check: { kind: 'attribute', selector: 'a', name: 'href', mode: 'exists' } },
                { id: 'un-h1', label: 'Hay un solo título principal', isPublic: false, weight: 1, check: { kind: 'a11y', check: 'single_h1' } },
              ],
              errorComun: {
                html: `<h1>Fundamentos de Algoritmia</h1>
<p>En este curso aprenderás a resolver problemas paso a paso.</p>
<li>Algoritmos</li>
<li>Variables</li>
<li>Condicionales</li>
<a>Aprende más en MDN</a>`,
                css: '',
              },
            },
          ],
        },
        {
          titulo: 'Reparar una página con errores',
          descripcion: 'Encontrar y corregir errores de estructura con lógica y buenas prácticas (evidencias U1-E2 y U1-E3).',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Depurar: encontrar el error con método',
            cuerpo: `## La idea

**Depurar** es encontrar y corregir errores. No se hace cambiando cosas al azar, sino con un método:

1. **Observa** qué se ve y compáralo con lo que debería verse.
2. **Formula una sospecha**: «la lista no tiene viñetas porque falta el \`<ul>\`».
3. **Cambia una sola cosa** y vuelve a mirar.
4. Si no se arregló, **deshaz** el cambio y prueba la siguiente sospecha.

Es el mismo razonamiento que usarás al programar: un algoritmo para encontrar errores.

## Un ejemplo

Errores frecuentes en HTML y cómo se corrigen:

| Síntoma | Causa | Corrección |
|---|---|---|
| Hay dos títulos gigantes | Dos \`<h1>\` | Deja un \`<h1>\` y usa \`<h2>\` para los subtítulos |
| La lista sale sin viñetas | \`<li>\` sin \`<ul>\` | Envuelve los \`<li>\` en \`<ul>\` |
| El enlace no lleva a ningún lado | \`<a>\` sin \`href\` | Agrega \`href="..."\` |
| Un lector de pantalla no describe la imagen | \`<img>\` sin \`alt\` | Agrega \`alt="descripción"\` |

Sin usar CSS también se mejora la presentación: los elementos \`<header>\`, \`<main>\` y \`<footer>\` ordenan la página,
y \`<strong>\` y \`<em>\` resaltan lo importante.

## Error común

Usar \`<h1>\` para que un texto «se vea grande». Los títulos marcan **jerarquía**, no tamaño: una página tiene
un solo \`<h1>\`. Si quieres cambiar el tamaño, eso es trabajo de CSS.

## Pruébalo

Abre cualquier página que hayas hecho y revísala con la tabla de arriba. ¿Cuántos errores encontraste?`,
          },
          ejercicios: [
            {
              tipo: 'drag_drop',
              titulo: '¿Está bien o tiene un error?',
              enunciado: 'Clasifica cada fragmento de HTML.',
              dificultad: 'basico',
              categorias: ['Está bien', 'Tiene un error'],
              elementos: [
                ['<a href="https://developer.mozilla.org">MDN</a>', 0],
                ['<img src="mapa.png">', 1],
                ['<ul><li>Uno</li><li>Dos</li></ul>', 0],
                ['<li>Suelto</li> (sin <ul> alrededor)', 1],
                ['<img src="rio-sinu.jpg" alt="El río Sinú al atardecer">', 0],
                ['<p><em>Hola</p></em>', 1],
              ],
              errorComun: [1],
            },
            {
              tipo: 'mcq',
              titulo: 'Depurar con método',
              enunciado: 'La lista de temas de tu página aparece **sin viñetas**. Siguiendo el método de depuración, ¿qué haces primero?',
              dificultad: 'basico',
              opciones: [
                'Borrar la lista y escribirla otra vez desde cero.',
                'Revisar si los <li> están dentro de un <ul>.',
                'Cambiar todas las etiquetas de la página hasta que funcione.',
                'Agregar más <li> a la lista.',
              ],
              correcta: 1,
              explicacion:
                'Primero se formula una sospecha concreta según el síntoma y se revisa una sola cosa. Sin viñetas suele significar que falta el <ul> alrededor de los <li>.',
              errorComun: 2,
            },
            {
              tipo: 'html_css',
              titulo: 'Repara la página del curso',
              enunciado: `Esta página tiene **cuatro errores** (evidencia **U1-E3** del plan). Encuéntralos y corrígelos:

1. Hay **dos** títulos \`<h1>\`: deja uno solo (el segundo puede ser \`<h2>\`).
2. Los temas están en \`<li>\` **sin** su \`<ul>\`.
3. La imagen no tiene \`alt\`.
4. El enlace no tiene \`href\`.`,
              dificultad: 'intermedio',
              htmlInicial: `<h1>Fundamentos de Algoritmia</h1>
<h1>Temas del curso</h1>
<li>Algoritmos</li>
<li>Variables</li>
<li>Ciclos</li>
<img src="diagrama-de-flujo.png">
<a>Guía del curso</a>`,
              cssInicial: '',
              solucion: {
                html: `<h1>Fundamentos de Algoritmia</h1>
<h2>Temas del curso</h2>
<ul>
  <li>Algoritmos</li>
  <li>Variables</li>
  <li>Ciclos</li>
</ul>
<img src="diagrama-de-flujo.png" alt="Diagrama de flujo del algoritmo del tinto">
<a href="https://developer.mozilla.org/es/docs/Learn">Guía del curso</a>`,
                css: '',
              },
              reglas: [
                { id: 'un-h1', label: 'Hay un solo <h1>', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'single_h1' } },
                { id: 'lista', label: 'Los tres temas están dentro de un <ul>', isPublic: true, weight: 1, check: { kind: 'element_count', selector: 'ul > li', min: 3 } },
                { id: 'alt', label: 'La imagen tiene texto alternativo (alt)', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'img_alt' } },
                { id: 'enlace', label: 'El enlace tiene href', isPublic: true, weight: 1, check: { kind: 'attribute', selector: 'a', name: 'href', mode: 'exists' } },
                { id: 'imagen', label: 'La imagen sigue en la página', isPublic: false, weight: 1, check: { kind: 'element_exists', selector: 'img' } },
              ],
              errorComun: {
                html: `<h1>Fundamentos de Algoritmia</h1>
<h2>Temas del curso</h2>
<ul>
  <li>Algoritmos</li>
  <li>Variables</li>
  <li>Ciclos</li>
</ul>
<img src="diagrama-de-flujo.png">
<a>Guía del curso</a>`,
                css: '',
              },
            },
          ],
        },
      ],
    },
  ],
};
