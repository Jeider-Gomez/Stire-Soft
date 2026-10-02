import { Seccion } from '../tipos';

/** Representar algoritmos: pseudocódigo, diagramas de flujo y pruebas de escritorio. */
export const seccion2: Seccion = {
  titulo: 'Representar algoritmos',
  descripcion: 'Escribir un algoritmo en pseudocódigo, leerlo en un diagrama de flujo y comprobarlo con una prueba de escritorio.',
  temas: [
    {
      titulo: 'Pseudocódigo',
      descripcion: 'Un lenguaje a mitad de camino entre el español y un lenguaje de programación.',
      unidades: [
        {
          titulo: 'Leer, calcular y escribir',
          descripcion: 'La estructura secuencial: entrada, asignación, operadores y salida.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Pseudocódigo: español con reglas',
            cuerpo: `## La idea

El **pseudocódigo** describe un algoritmo con palabras en español y unas pocas reglas. Aquí usamos el estilo de
**PSeInt**, una herramienta gratuita muy usada para aprender:

| Instrucción | Qué hace |
|---|---|
| \`Leer edad\` | Pide un dato y lo guarda en la variable \`edad\` |
| \`Escribir "Hola ", nombre\` | Muestra un texto y el valor de una variable |
| \`total <- precio * 2\` | Calcula lo de la derecha y lo **guarda** en \`total\` |
| \`17 MOD 5\` | Residuo de la división: 2 |
| \`trunc(17 / 5)\` | Parte entera de la división: 3 |

Todo algoritmo va entre \`Algoritmo Nombre\` y \`FinAlgoritmo\`, y se ejecuta **de arriba hacia abajo**: es la
**estructura secuencial**.

## Un ejemplo

Las vueltas de una compra en la tienda:

\`\`\`
Algoritmo Vueltas
    Leer precio
    Leer pago
    vueltas <- pago - precio
    Escribir "Sus vueltas son: ", vueltas
FinAlgoritmo
\`\`\`

Si el precio es 3500 y pagas con 5000, escribe \`Sus vueltas son: 1500\`.

## Error común

Leer \`x <- x + 1\` como una ecuación («¡x no puede ser igual a x + 1!»). La flecha **no** es un igual: significa
«calcula \`x + 1\` con el valor que x tiene **ahora** y guarda el resultado en x». Si x valía 4, ahora vale 5.

## Pruébalo

Escribe el algoritmo que lee una cantidad de días y escribe cuántas **semanas completas** y cuántos **días sobrantes**
son. Pista: \`trunc\` y \`MOD\`. Con 17 días: 2 semanas y 3 días.`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'La flecha no es un igual',
              enunciado: `¿Cuánto vale **x** al final?

\`\`\`
x <- 5
x <- x + 2
x <- x * 3
\`\`\``,
              dificultad: 'basico',
              opciones: ['21', '17', '15', 'Nada: x no puede ser igual a x + 2'],
              correcta: 0,
              explicacion: 'x empieza en 5; x <- x + 2 guarda 7; x <- x * 3 guarda 21. La flecha significa «guardar», no «es igual a».',
              errorComun: 3,
            },
            {
              tipo: 'matching',
              titulo: 'Qué hace cada instrucción',
              enunciado: 'Une cada instrucción de pseudocódigo con lo que hace.',
              dificultad: 'basico',
              parejas: [
                ['Leer edad', 'Pide un dato y lo guarda en edad'],
                ['Escribir edad', 'Muestra el valor de edad'],
                ['edad <- 18', 'Guarda el valor 18 en edad'],
                ['17 MOD 5', 'El residuo de dividir 17 entre 5, que es 2'],
                ['trunc(17 / 5)', 'La parte entera de 17 entre 5, que es 3'],
              ],
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: las vueltas',
              enunciado: 'Completa el algoritmo para que calcule bien las vueltas de una compra.',
              dificultad: 'basico',
              lenguaje: 'text',
              plantilla: `Algoritmo Vueltas
    Leer precio
    Leer pago
    vueltas <- ___a___ - ___b___
    Escribir "Sus vueltas son: ", vueltas
FinAlgoritmo`,
              huecos: { a: 'pago', b: 'precio' },
              errorComun: { a: 'precio', b: 'pago' },
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena: billetes de $10.000',
              enunciado: 'Ordena el algoritmo que dice cuántos billetes de $10.000 caben en un monto y cuánto sobra.',
              dificultad: 'basico',
              pasos: [
                'Algoritmo Billetes',
                'Leer monto',
                'billetes <- trunc(monto / 10000)',
                'resto <- monto MOD 10000',
                'Escribir "Billetes: ", billetes',
                'Escribir "Sobran: ", resto',
                'FinAlgoritmo',
              ],
              errorComun: [0, 1, 4, 2, 3, 5, 6],
            },
          ],
        },
      ],
    },
    {
      titulo: 'Diagramas de flujo',
      descripcion: 'Leer un algoritmo dibujado con figuras y flechas.',
      unidades: [
        {
          titulo: 'Leer un diagrama de flujo',
          descripcion: 'Reconocer las figuras, seguir las flechas y pasar un diagrama a pseudocódigo.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Figuras y flechas',
            cuerpo: `## La idea

Un **diagrama de flujo** dibuja el algoritmo. Cada figura tiene un significado y las **flechas** marcan el camino:

| Figura | Significado | Ejemplo |
|---|---|---|
| Óvalo | Inicio o fin | Inicio |
| Paralelogramo | Entrada o salida | \`Leer edad\` |
| Rectángulo | Proceso | \`total <- precio * 2\` |
| Rombo | Decisión (sí o no) | \`¿edad >= 18?\` |

Del rombo salen **dos** flechas: una para «sí» y otra para «no». Una flecha que **regresa** a un paso anterior
indica que algo se **repite**.

## Un ejemplo

\`\`\`
        ( Inicio )
            |
      / Leer edad /
            |
     < ¿edad >= 18? >
       sí /     \\ no
         /       \\
/ Escribir      / Escribir
 "Puede votar"/  "Aún no" /
         \\       /
          ( Fin )
\`\`\`

El mismo algoritmo en pseudocódigo:

\`\`\`
Algoritmo Votar
    Leer edad
    Si edad >= 18 Entonces
        Escribir "Puede votar"
    SiNo
        Escribir "Aún no"
    FinSi
FinAlgoritmo
\`\`\`

## Un diagrama de verdad

Este diagrama calcula el factorial de N. Sigue las flechas con N = 3: ¿cuántas veces pasa por el rombo?

![Diagrama de flujo del factorial de N: inicio, leer N, dos procesos, una decisión «¿Es M = N?» y escribir F](https://upload.wikimedia.org/wikipedia/commons/7/71/Diagrama_de_flujo_de_factorial.png "Factorial de N. Imagen: Kuco, Wikimedia Commons, dominio público.")

@[Ejemplo de diagrama de flujo en 3 minutos (GestionPro)](https://www.youtube.com/watch?v=xOOvgSpH8hM)

En **Mis proyectos → Diagrama de flujo** puedes dibujar el tuyo arrastrando figuras y ejecutarlo.

## Error común

Confundir el **paralelogramo** con el **rectángulo**. Si el paso **pide** o **muestra** un dato, es entrada o salida
(paralelogramo). Si **calcula** o **guarda** algo, es un proceso (rectángulo).

## Pruébalo

Dibuja en tu cuaderno el diagrama de flujo del algoritmo de las vueltas de la unidad anterior. ¿Cuántas figuras de
cada tipo usaste?`,
          },
          ejercicios: [
            {
              tipo: 'drag_drop',
              titulo: '¿Qué figura le corresponde?',
              enunciado: 'Ubica cada paso del algoritmo en la figura del diagrama de flujo que le corresponde.',
              dificultad: 'basico',
              categorias: ['Óvalo (inicio o fin)', 'Paralelogramo (entrada o salida)', 'Rectángulo (proceso)', 'Rombo (decisión)'],
              elementos: [
                ['Inicio', 0],
                ['Leer precio', 1],
                ['total <- precio * 2', 2],
                ['¿total > 50000?', 3],
                ['Escribir total', 1],
                ['Fin', 0],
              ],
              errorComun: [2],
            },
            {
              tipo: 'mcq',
              titulo: 'Sigue el diagrama',
              enunciado: `Sigue el diagrama con **edad = 18**:

\`\`\`
     < ¿edad >= 18? >
       sí /     \\ no
/ Escribir      / Escribir
 "Puede votar"/  "Aún no" /
\`\`\`

¿Qué escribe?`,
              dificultad: 'basico',
              opciones: ['Puede votar', 'Aún no', 'Las dos cosas', 'Nada'],
              correcta: 0,
              explicacion: '18 >= 18 es verdadero (mayor O IGUAL), así que sigue la flecha del «sí». Del rombo solo se sigue un camino.',
              errorComun: 1,
            },
            {
              tipo: 'mcq',
              titulo: 'La flecha que regresa',
              enunciado: 'En un diagrama de flujo, una flecha sale de un rombo y **regresa** a un paso que ya se había hecho. ¿Qué significa?',
              dificultad: 'basico',
              opciones: [
                'Que el algoritmo tiene un error.',
                'Que esos pasos se repiten mientras se cumpla la condición.',
                'Que el algoritmo termina ahí.',
                'Que hay que leer el diagrama de abajo hacia arriba.',
              ],
              correcta: 1,
              explicacion: 'Una flecha de regreso forma un ciclo: los pasos se repiten hasta que la condición del rombo cambie y se tome la otra salida.',
              errorComun: 0,
            },
            {
              tipo: 'ordering',
              titulo: 'Del diagrama al pseudocódigo',
              enunciado: 'Ordena el pseudocódigo que corresponde al diagrama de «¿puede votar?».',
              dificultad: 'basico',
              pasos: [
                'Algoritmo Votar',
                'Leer edad',
                'Si edad >= 18 Entonces',
                '    Escribir "Puede votar"',
                'SiNo',
                '    Escribir "Aún no"',
                'FinSi',
                'FinAlgoritmo',
              ],
              errorComun: [0, 1, 2, 5, 4, 3, 6, 7],
            },
          ],
        },
      ],
    },
    {
      titulo: 'Pruebas de escritorio',
      descripcion: 'Comprobar un algoritmo con lápiz y papel antes de ejecutarlo.',
      unidades: [
        {
          titulo: 'Seguir un algoritmo con lápiz y papel',
          descripcion: 'Construir la tabla de una prueba de escritorio y encontrar errores con ella.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'La tabla que encuentra errores',
            cuerpo: `## La idea

Una **prueba de escritorio** es ejecutar el algoritmo **tú mismo**, con datos de ejemplo, anotando cada valor en una
tabla:

- Una **columna** por cada variable (y una para lo que se escribe).
- Una **fila** cada vez que una variable cambia.
- Al final comparas el resultado con el que **esperabas**.

Es la forma más barata de encontrar errores: antes de escribir una sola línea de código.

## Un ejemplo

\`\`\`
suma <- 0
Para i <- 1 Hasta 3 Hacer
    suma <- suma + i * 2
FinPara
Escribir suma
\`\`\`

| i | suma | Se escribe |
|---|---|---|
| — | 0 | |
| 1 | 2 | |
| 2 | 6 | |
| 3 | 12 | |
| | | 12 |

## Error común

Hacer la prueba «de memoria», saltándose filas. Los errores aparecen justamente en el paso que te saltas.
Otro error es probar **solo** con datos cómodos: incluye siempre un **caso límite** (0, el valor exacto de una
condición, un solo dato).

## Pruébalo

Haz la prueba de escritorio del ejemplo cambiando \`Hasta 3\` por \`Hasta 5\`. ¿Qué escribe? ¿Ves el patrón?`,
          },
          ejercicios: [
            {
              tipo: 'fill_code',
              titulo: 'Completa la tabla',
              enunciado: 'Completa la prueba de escritorio: escribe el valor que queda en cada variable después de cada línea.',
              dificultad: 'intermedio',
              lenguaje: 'text',
              plantilla: `Algoritmo            Valor después de la línea
a <- 2               a = 2
b <- a * 3           b = ___v1___
a <- b - a           a = ___v2___
b <- a + b           b = ___v3___`,
              huecos: { v1: '6', v2: '4', v3: '10' },
              errorComun: { v2: '-4' },
            },
            {
              tipo: 'mcq',
              titulo: 'Prueba de escritorio con Mientras',
              enunciado: `¿Qué escribe este algoritmo?

\`\`\`
x <- 1
Mientras x < 20 Hacer
    x <- x * 3
FinMientras
Escribir x
\`\`\``,
              dificultad: 'intermedio',
              opciones: ['27', '9', '20', '81'],
              correcta: 0,
              explicacion: 'x toma 1, 3, 9 y 27. Con x = 9 la condición 9 < 20 es verdadera y se multiplica otra vez: 27. Con 27 la condición es falsa y termina.',
              errorComun: 1,
            },
            {
              tipo: 'mcq',
              titulo: 'La prueba que destapa el error',
              enunciado: `Este algoritmo debería calcular el promedio de n números:

\`\`\`
Leer n
suma <- 0
Para i <- 1 Hasta n Hacer
    Leer x
    suma <- suma + x
FinPara
Escribir suma / (n - 1)
\`\`\`

Haz la prueba de escritorio con **n = 2** y los números **4** y **6**. ¿Qué pasa?`,
              dificultad: 'intermedio',
              opciones: [
                'Escribe 5: el algoritmo está bien.',
                'Escribe 10: divide entre n - 1 y debería dividir entre n.',
                'Escribe 3.33: divide entre 3.',
                'No escribe nada.',
              ],
              correcta: 1,
              explicacion: 'suma queda en 10 y se divide entre n - 1 = 1: escribe 10. El promedio de 4 y 6 es 5, así que la prueba de escritorio muestra que la última línea debe dividir entre n.',
              errorComun: 0,
            },
            {
              tipo: 'ordering',
              titulo: 'Cómo se hace una prueba de escritorio',
              enunciado: 'Ordena los pasos para hacer una prueba de escritorio.',
              dificultad: 'basico',
              pasos: [
                'Elegir datos de prueba, incluido un caso límite',
                'Hacer una columna por cada variable',
                'Seguir el algoritmo línea por línea',
                'Anotar cada valor nuevo en su columna',
                'Comparar el resultado con el que se esperaba',
              ],
              errorComun: [2, 1, 0, 3, 4],
            },
          ],
        },
      ],
    },
  ],
};
