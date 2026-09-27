import { LEER_ENTRADA, Seccion } from '../tipos';

/**
 * Unidad 2 del plan de curso 203413: Diseño e implementación de algoritmos con HTML5, CSS y JavaScript
 * (RA-203413-U2). Análisis del problema, estructuras de control, diseño modular, pruebas de escritorio,
 * DOM, eventos, validación de formularios y maquetación con CSS (evidencia U2-E1).
 */
export const seccion2: Seccion = {
  titulo: 'Unidad 2 · Diseño e implementación de algoritmos',
  descripcion:
    'Analizar un problema, decidir, repetir, dividir en funciones y llevarlo a una página web con JavaScript y CSS. ' +
    'Resultado de aprendizaje RA-203413-U2.',
  temas: [
    {
      titulo: 'Analizar el problema antes de programar',
      descripcion: 'Identificar entradas, proceso y salidas, y comprobar la lógica con pruebas de escritorio.',
      unidades: [
        {
          titulo: 'Entradas, proceso y salidas',
          descripcion: 'Descomponer un problema en lo que se tiene, lo que se busca y cómo llegar de uno a otro.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Tres preguntas antes de escribir código',
            cuerpo: `## La idea

El error más frecuente al programar es **empezar a escribir código sin entender el problema**.
Antes de programar, responde tres preguntas:

1. **Entradas:** ¿qué datos tengo?
2. **Salidas:** ¿qué debo producir?
3. **Proceso:** ¿qué pasos convierten las entradas en la salida?

Luego diseñas el algoritmo, haces una **prueba de escritorio** y solo al final escribes el código.

## Un ejemplo

*«En la papelería del colegio cada fotocopia cuesta $150. Calcula cuánto paga un estudiante.»*

| Entradas | Proceso | Salida |
|---|---|---|
| Número de fotocopias | total = fotocopias × 150 | Total a pagar |

Prueba de escritorio con 12 fotocopias: 12 × 150 = **1800**. Con 0 fotocopias: **0** (un caso límite que conviene probar).

## Error común

Confundir la **salida** con un dato de **entrada**. El total a pagar no lo da el usuario: lo **calcula** el programa.
Si una «entrada» se puede calcular con las demás, en realidad es parte del proceso o de la salida.

## Pruébalo

Analiza este problema: *«Calcular el promedio de tres notas de un estudiante»*. Escribe sus entradas, su proceso y su salida,
y haz la prueba de escritorio con 3.5, 4.0 y 2.5. ¿Te dio 3.33?`,
          },
          ejercicios: [
            {
              tipo: 'drag_drop',
              titulo: 'Entradas, proceso y salida',
              enunciado:
                '*«Calcula cuánto paga un estudiante por sus fotocopias: cada una cuesta $150 y, si presenta el carné, tiene 10 % de descuento.»*\n\nClasifica cada parte del problema.',
              dificultad: 'basico',
              categorias: ['Entrada', 'Proceso', 'Salida'],
              elementos: [
                ['Número de fotocopias', 0],
                ['¿Presenta el carné? (sí o no)', 0],
                ['subtotal = fotocopias × 150', 1],
                ['Si presenta el carné, restar el 10 %', 1],
                ['Total a pagar', 2],
              ],
              errorComun: [4],
            },
            {
              tipo: 'mcq',
              titulo: 'Prueba de escritorio: el intercambio',
              enunciado: `Sigue el algoritmo paso a paso con una tabla:

\`\`\`
a <- 5
b <- 3
a <- a + b
b <- a - b
a <- a - b
\`\`\`

¿Cuánto valen **a** y **b** al final?`,
              dificultad: 'basico',
              opciones: ['a = 5, b = 3', 'a = 3, b = 5', 'a = 8, b = 5', 'a = 8, b = 3'],
              correcta: 1,
              explicacion:
                'Tras a <- a + b, a vale 8. Luego b <- 8 - 3 = 5 y a <- 8 - 5 = 3. El algoritmo intercambia los valores sin usar una tercera variable.',
              errorComun: 2,
            },
            {
              tipo: 'ordering',
              titulo: 'El método para resolver problemas',
              enunciado: 'Ordena los pasos del método para resolver un problema con un programa.',
              dificultad: 'basico',
              pasos: [
                'Leer y entender el enunciado',
                'Identificar entradas y salidas',
                'Diseñar el algoritmo en pseudocódigo o diagrama',
                'Hacer la prueba de escritorio',
                'Escribir el código',
                'Probar con varios casos, incluidos los casos límite',
              ],
              errorComun: [0, 4, 5, 1, 2, 3],
            },
            {
              tipo: 'coding',
              titulo: 'Promedio de tres notas',
              enunciado: `Lee tres notas (una por línea, escala de 0.0 a 5.0) y escribe su promedio con **un decimal**.

**Ejemplo:** con \`3\`, \`4\` y \`5\` la salida es \`4.0\`.

Para mostrar un decimal usa \`.toFixed(1)\`, por ejemplo \`(3.25).toFixed(1)\` da \`3.3\`.`,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}const nota1 = Number(lineas[0]);
const nota2 = Number(lineas[1]);
const nota3 = Number(lineas[2]);

// Calcula el promedio y escríbelo con un decimal
`,
              solucion: `${LEER_ENTRADA}const nota1 = Number(lineas[0]);
const nota2 = Number(lineas[1]);
const nota3 = Number(lineas[2]);
const promedio = (nota1 + nota2 + nota3) / 3;
console.log(promedio.toFixed(1));
`,
              casos: [
                { entrada: '3\n4\n5', salida: '4.0', publico: true },
                { entrada: '2.5\n3.0\n4.2', salida: '3.2', publico: false },
                { entrada: '5\n5\n4', salida: '4.7', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const nota1 = Number(lineas[0]);
const nota2 = Number(lineas[1]);
const nota3 = Number(lineas[2]);
const promedio = nota1 + nota2 + nota3 / 3;
console.log(promedio.toFixed(1));
`,
            },
          ],
        },
      ],
    },
    {
      titulo: 'Condicionales: tomar decisiones',
      descripcion: 'if, else y else if: el programa elige un camino según una condición.',
      unidades: [
        {
          titulo: 'Decidir con if y else',
          descripcion: 'Escribir condiciones correctas y cuidar los valores del límite.',
          dificultad: 'basico',
          leccion: {
            titulo: 'if / else: dos caminos',
            cuerpo: `## La idea

Un **condicional** permite que el programa elija entre dos caminos según una **condición** (algo que es
\`true\` o \`false\`):

\`\`\`js
if (condición) {
  // se ejecuta si la condición es verdadera
} else {
  // se ejecuta si es falsa
}
\`\`\`

En pseudocódigo se escribe \`Si ... Entonces ... SiNo ... FinSi\`, y en el diagrama de flujo es el **rombo**.

## Un ejemplo

En Colombia se aprueba con **3.0** o más (escala de 0.0 a 5.0):

\`\`\`js
const nota = Number(lineas[0]);
if (nota >= 3.0) {
  console.log("Aprobó");
} else {
  console.log("Reprobó");
}
\`\`\`

Prueba de escritorio: con 4.2 escribe «Aprobó»; con 2.9, «Reprobó»; y con **3.0**, «Aprobó».

## Error común

1. **El límite:** escribir \`nota > 3\` deja por fuera al que sacó exactamente 3.0. Prueba siempre el valor del límite.
2. **Asignar en vez de comparar:** \`=\` guarda un valor; \`===\` compara. \`if (nota = 3)\` es un error.

## Pruébalo

Escribe un programa que lea la edad de una persona y diga «Puede votar» si tiene 18 o más, o «Aún no puede votar».
Pruébalo con 17, 18 y 19.`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'El valor del límite',
              enunciado: `¿Qué escribe este programa?

\`\`\`js
let nota = 3.0;
if (nota > 3) {
  console.log("Aprobó");
} else {
  console.log("Reprobó");
}
\`\`\``,
              dificultad: 'basico',
              opciones: ['Aprobó', 'Reprobó', 'No escribe nada', 'Da un error'],
              correcta: 1,
              explicacion:
                '3.0 > 3 es falso: 3 no es mayor que 3. Por eso entra al else. Para aprobar con 3.0 la condición debe ser nota >= 3.',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: ¿par o impar?',
              enunciado:
                'Completa el programa para que escriba `par` si el número es par, o `impar` si no lo es. Un número es par si el residuo de dividirlo entre 2 es 0.',
              dificultad: 'basico',
              lenguaje: 'javascript',
              plantilla: `const n = Number(lineas[0]);
if (n ___a___ 2 === 0) {
  console.log("par");
} ___b___ {
  console.log("impar");
}`,
              huecos: { a: '%', b: 'else' },
              errorComun: { a: '/' },
            },
            {
              tipo: 'coding',
              titulo: '¿Aprobó o reprobó?',
              enunciado: `Lee una nota (de 0.0 a 5.0) y escribe \`Aprobó\` si es **3.0 o más**, o \`Reprobó\` en otro caso.

**Ejemplo:** con \`3.0\` la salida es \`Aprobó\`.`,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}const nota = Number(lineas[0]);

// Decide si aprobó
`,
              solucion: `${LEER_ENTRADA}const nota = Number(lineas[0]);
if (nota >= 3.0) {
  console.log("Aprobó");
} else {
  console.log("Reprobó");
}
`,
              casos: [
                { entrada: '3.0', salida: 'Aprobó', publico: true },
                { entrada: '2.9', salida: 'Reprobó', publico: true },
                { entrada: '4.5', salida: 'Aprobó', publico: false },
                { entrada: '0', salida: 'Reprobó', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const nota = Number(lineas[0]);
if (nota > 3) {
  console.log("Aprobó");
} else {
  console.log("Reprobó");
}
`,
            },
            {
              tipo: 'coding',
              titulo: 'Fotocopias con descuento',
              enunciado: `Cada fotocopia cuesta **$150**. Si el estudiante presenta el carné, tiene **10 % de descuento** sobre el total.

Lee el número de fotocopias (primera línea) y \`si\` o \`no\` (segunda línea, ¿presenta el carné?). Escribe el total a pagar.

**Ejemplo:** con \`10\` y \`si\` la salida es \`1350\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}const fotocopias = Number(lineas[0]);
const carne = lineas[1].trim();

// Calcula el total con o sin descuento
`,
              solucion: `${LEER_ENTRADA}const fotocopias = Number(lineas[0]);
const carne = lineas[1].trim();
let total = fotocopias * 150;
if (carne === "si") {
  total = total - total * 10 / 100;
}
console.log(total);
`,
              casos: [
                { entrada: '10\nsi', salida: '1350', publico: true },
                { entrada: '10\nno', salida: '1500', publico: true },
                { entrada: '20\nsi', salida: '2700', publico: false },
                { entrada: '3\nno', salida: '450', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const fotocopias = Number(lineas[0]);
let total = fotocopias * 150;
total = total * 0.9;
console.log(total);
`,
            },
          ],
        },
        {
          titulo: 'Varios caminos con else if',
          descripcion: 'Encadenar condiciones en el orden correcto y combinar condiciones con && y ||.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'else if: cuando hay más de dos caminos',
            cuerpo: `## La idea

Cuando hay más de dos casos, se encadenan condiciones con \`else if\`. El programa revisa **de arriba hacia abajo**
y entra **solo en la primera** condición verdadera; las demás ya no se revisan.

## Un ejemplo

La escala nacional de desempeño (Decreto 1290) en notas de 0.0 a 5.0:

| Nota | Desempeño |
|---|---|
| 4.6 a 5.0 | Superior |
| 4.0 a 4.5 | Alto |
| 3.0 a 3.9 | Básico |
| menos de 3.0 | Bajo |

\`\`\`js
if (nota >= 4.6) {
  console.log("Superior");
} else if (nota >= 4.0) {
  console.log("Alto");
} else if (nota >= 3.0) {
  console.log("Básico");
} else {
  console.log("Bajo");
}
\`\`\`

Para combinar condiciones: \`&&\` (y) exige que ambas se cumplan; \`||\` (o) exige que al menos una se cumpla.

## Error común

**Poner las condiciones en desorden.** Si la primera pregunta es \`nota >= 3.0\`, un 4.8 entra ahí y el programa
dice «Básico»: nunca llega a revisar si era Superior. Ordena de la condición **más exigente** a la menos exigente.

## Pruébalo

Haz la prueba de escritorio del código de arriba con 4.6, 4.5, 3.0 y 2.9. ¿Cada una cae en el desempeño correcto?`,
          },
          ejercicios: [
            {
              tipo: 'ordering',
              titulo: 'Ordena la escala de desempeño',
              enunciado: 'Ordena las líneas para que el programa escriba el desempeño correcto para cualquier nota.',
              dificultad: 'intermedio',
              pasos: [
                'if (nota >= 4.6) {',
                '  console.log("Superior");',
                '} else if (nota >= 4.0) {',
                '  console.log("Alto");',
                '} else if (nota >= 3.0) {',
                '  console.log("Básico");',
                '} else {',
                '  console.log("Bajo");',
                '}',
              ],
              errorComun: [4, 5, 2, 3, 0, 1, 6, 7, 8],
            },
            {
              tipo: 'mcq',
              titulo: 'Condiciones en desorden',
              enunciado: `Un compañero escribió:

\`\`\`js
if (nota >= 3.0) {
  console.log("Básico");
} else if (nota >= 4.0) {
  console.log("Alto");
} else if (nota >= 4.6) {
  console.log("Superior");
} else {
  console.log("Bajo");
}
\`\`\`

¿Qué escribe con una nota de **4.8**?`,
              dificultad: 'intermedio',
              opciones: ['Superior', 'Alto', 'Básico', 'Bajo'],
              correcta: 2,
              explicacion:
                '4.8 >= 3.0 es verdadero, así que entra en el primer bloque y escribe «Básico». Las demás condiciones ya no se revisan. Hay que ordenar de la más exigente a la menos exigente.',
              errorComun: 0,
            },
            {
              tipo: 'coding',
              titulo: 'Desempeño según la escala nacional',
              enunciado: `Lee una nota de 0.0 a 5.0 y escribe su desempeño: \`Superior\` (4.6 a 5.0), \`Alto\` (4.0 a 4.5), \`Básico\` (3.0 a 3.9) o \`Bajo\` (menos de 3.0).

**Ejemplo:** con \`4.2\` la salida es \`Alto\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}const nota = Number(lineas[0]);

// Escribe el desempeño
`,
              solucion: `${LEER_ENTRADA}const nota = Number(lineas[0]);
if (nota >= 4.6) {
  console.log("Superior");
} else if (nota >= 4.0) {
  console.log("Alto");
} else if (nota >= 3.0) {
  console.log("Básico");
} else {
  console.log("Bajo");
}
`,
              casos: [
                { entrada: '4.2', salida: 'Alto', publico: true },
                { entrada: '4.6', salida: 'Superior', publico: false },
                { entrada: '3.0', salida: 'Básico', publico: false },
                { entrada: '2.9', salida: 'Bajo', publico: false },
                { entrada: '5.0', salida: 'Superior', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const nota = Number(lineas[0]);
if (nota >= 3.0) {
  console.log("Básico");
} else if (nota >= 4.0) {
  console.log("Alto");
} else if (nota >= 4.6) {
  console.log("Superior");
} else {
  console.log("Bajo");
}
`,
            },
            {
              tipo: 'coding',
              titulo: '¿El año es bisiesto?',
              enunciado: `Un año es **bisiesto** si es divisible entre 4 pero **no** entre 100, **o** si es divisible entre 400.

Lee un año y escribe \`bisiesto\` o \`no bisiesto\`.

**Ejemplos:** 2024 es bisiesto; 1900 no lo es; 2000 sí lo es.`,
              dificultad: 'avanzado',
              inicial: `${LEER_ENTRADA}const anio = Number(lineas[0]);

// Combina condiciones con && y ||
`,
              solucion: `${LEER_ENTRADA}const anio = Number(lineas[0]);
if ((anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0) {
  console.log("bisiesto");
} else {
  console.log("no bisiesto");
}
`,
              casos: [
                { entrada: '2024', salida: 'bisiesto', publico: true },
                { entrada: '1900', salida: 'no bisiesto', publico: true },
                { entrada: '2000', salida: 'bisiesto', publico: false },
                { entrada: '2023', salida: 'no bisiesto', publico: false },
                { entrada: '2100', salida: 'no bisiesto', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const anio = Number(lineas[0]);
if (anio % 4 === 0) {
  console.log("bisiesto");
} else {
  console.log("no bisiesto");
}
`,
            },
          ],
        },
      ],
    },
    {
      titulo: 'Ciclos: repetir sin copiar y pegar',
      descripcion: 'for y while, contadores y acumuladores.',
      unidades: [
        {
          titulo: 'Repetir con for y while',
          descripcion: 'Elegir el ciclo adecuado, controlar cuántas veces se repite y evitar ciclos infinitos.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Ciclos: la computadora no se cansa',
            cuerpo: `## La idea

Un **ciclo** repite un bloque de instrucciones. Hay dos formas principales:

- **for:** cuando sabes **cuántas veces** repetir.
- **while:** cuando repites **mientras** se cumpla una condición.

\`\`\`js
for (let i = 1; i <= 5; i++) {   // inicio; condición; cambio
  console.log(i);                // escribe 1, 2, 3, 4, 5
}

let n = 3;
while (n > 0) {                  // mientras n sea mayor que 0
  console.log(n);                // escribe 3, 2, 1
  n = n - 1;                     // ¡sin esto el ciclo no termina!
}
\`\`\`

## Un ejemplo

Prueba de escritorio de \`for (let i = 0; i < 3; i++)\`:

| i | ¿i < 3? | ¿Se ejecuta? |
|---|---|---|
| 0 | sí | sí |
| 1 | sí | sí |
| 2 | sí | sí |
| 3 | no | termina |

Se repite **3 veces** (con i = 0, 1 y 2).

## Error común

1. **Uno de más o uno de menos:** \`i < 10\` llega hasta 9; \`i <= 10\` llega hasta 10. Revisa el primero y el último valor.
2. **Ciclo infinito:** en un \`while\`, olvidar cambiar la variable de la condición. El ciclo nunca termina.

## Pruébalo

Escribe un ciclo que muestre los números pares del 2 al 20. ¿Lo hiciste con \`i += 2\` o con un \`if\`? Las dos sirven.`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: '¿Cuántas veces se repite?',
              enunciado: `¿Cuántas veces se escribe «Hola»?

\`\`\`js
for (let i = 0; i < 5; i++) {
  console.log("Hola");
}
\`\`\``,
              dificultad: 'basico',
              opciones: ['4 veces', '5 veces', '6 veces', 'Infinitas veces'],
              correcta: 1,
              explicacion: 'i toma los valores 0, 1, 2, 3 y 4: son 5 valores. Cuando i llega a 5, la condición i < 5 es falsa y el ciclo termina.',
              errorComun: 2,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa la tabla de multiplicar',
              enunciado: 'Completa el ciclo para que escriba la tabla del número leído, **del 1 al 10**.',
              dificultad: 'basico',
              lenguaje: 'javascript',
              plantilla: `const n = Number(lineas[0]);
for (let i = 1; i ___a___ 10; i___b___) {
  console.log(n + " x " + i + " = " + (n * i));
}`,
              huecos: { a: '<=', b: { regex: '\\+\\+|\\s*\\+=\\s*1', ejemplo: '++' } },
              errorComun: { a: '<' },
            },
            {
              tipo: 'coding',
              titulo: 'Tabla de multiplicar',
              enunciado: `Lee un número **n** y escribe su tabla de multiplicar del 1 al 10, una línea por resultado, con el formato \`n x i = resultado\`.

**Ejemplo:** con \`7\` las primeras líneas son:

\`\`\`
7 x 1 = 7
7 x 2 = 14
\`\`\``,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}const n = Number(lineas[0]);

// Escribe la tabla con un ciclo for
`,
              solucion: `${LEER_ENTRADA}const n = Number(lineas[0]);
for (let i = 1; i <= 10; i++) {
  console.log(n + " x " + i + " = " + (n * i));
}
`,
              casos: [
                {
                  entrada: '7',
                  salida: Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join('\n'),
                  publico: true,
                },
                {
                  entrada: '1',
                  salida: Array.from({ length: 10 }, (_, i) => `1 x ${i + 1} = ${i + 1}`).join('\n'),
                  publico: false,
                },
                {
                  entrada: '12',
                  salida: Array.from({ length: 10 }, (_, i) => `12 x ${i + 1} = ${12 * (i + 1)}`).join('\n'),
                  publico: false,
                },
              ],
              errorComun: `${LEER_ENTRADA}const n = Number(lineas[0]);
for (let i = 1; i < 10; i++) {
  console.log(n + " x " + i + " = " + (n * i));
}
`,
            },
            {
              tipo: 'coding',
              titulo: 'Cuenta regresiva',
              enunciado: `Lee un número **n** y, con un ciclo \`while\`, escribe la cuenta regresiva desde n hasta 1, una por línea. Al final escribe \`¡Despegue!\`.

**Ejemplo:** con \`3\` la salida es:

\`\`\`
3
2
1
¡Despegue!
\`\`\``,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}let n = Number(lineas[0]);

// Usa while y no olvides cambiar n en cada vuelta
`,
              solucion: `${LEER_ENTRADA}let n = Number(lineas[0]);
while (n >= 1) {
  console.log(n);
  n = n - 1;
}
console.log("¡Despegue!");
`,
              casos: [
                { entrada: '3', salida: '3\n2\n1\n¡Despegue!', publico: true },
                { entrada: '1', salida: '1\n¡Despegue!', publico: false },
                { entrada: '5', salida: '5\n4\n3\n2\n1\n¡Despegue!', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}let n = Number(lineas[0]);
while (n > 1) {
  console.log(n);
  n = n - 1;
}
console.log("¡Despegue!");
`,
            },
          ],
        },
        {
          titulo: 'Contadores y acumuladores',
          descripcion: 'Contar y sumar dentro de un ciclo: promedio de n notas y cuántos aprobaron.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Contar y acumular mientras se repite',
            cuerpo: `## La idea

Dentro de un ciclo casi siempre necesitamos **llevar la cuenta** de algo:

- Un **contador** aumenta de 1 en 1: \`aprobados = aprobados + 1\` (o \`aprobados++\`).
- Un **acumulador** suma valores: \`suma = suma + nota\` (o \`suma += nota\`).

Los dos se **inicializan antes del ciclo**, casi siempre en 0.

## Un ejemplo

Promedio de n notas: la primera línea dice cuántas notas vienen, y luego llega una nota por línea.

\`\`\`js
const n = Number(lineas[0]);
let suma = 0;                         // acumulador, ANTES del ciclo
for (let i = 1; i <= n; i++) {
  const nota = Number(lineas[i]);
  suma = suma + nota;
}
console.log((suma / n).toFixed(1));
\`\`\`

Prueba de escritorio con \`3\`, \`4.0\`, \`3.0\`, \`5.0\`:

| i | nota | suma |
|---|---|---|
| — | — | 0 |
| 1 | 4.0 | 4.0 |
| 2 | 3.0 | 7.0 |
| 3 | 5.0 | 12.0 |

Promedio: 12.0 / 3 = **4.0**.

## Error común

**Inicializar dentro del ciclo.** Si \`let suma = 0\` va dentro del \`for\`, en cada vuelta la suma vuelve a 0 y al
final solo queda la última nota.

## Pruébalo

Modifica el ejemplo para que también diga **cuál fue la nota más alta**. Pista: una variable \`mayor\` que empieza
con la primera nota.`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'Prueba de escritorio del acumulador',
              enunciado: `¿Qué escribe este programa?

\`\`\`js
let suma = 0;
for (let i = 1; i <= 4; i++) {
  suma = suma + i;
}
console.log(suma);
\`\`\``,
              dificultad: 'basico',
              opciones: ['4', '10', '5', '0'],
              correcta: 1,
              explicacion: 'suma va tomando 1, 3, 6 y 10: acumula 1 + 2 + 3 + 4 = 10. El 4 es el último valor de i, no la suma.',
              errorComun: 0,
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena el promedio de n notas',
              enunciado: 'Ordena el pseudocódigo que calcula el promedio de n notas.',
              dificultad: 'intermedio',
              pasos: [
                'Leer n',
                'suma <- 0',
                'Para i <- 1 Hasta n Hacer',
                '    Leer nota',
                '    suma <- suma + nota',
                'FinPara',
                'Escribir suma / n',
              ],
              errorComun: [0, 2, 1, 3, 4, 5, 6],
            },
            {
              tipo: 'coding',
              titulo: 'Suma del 1 al n',
              enunciado: `Lee un número **n** y escribe la suma 1 + 2 + … + n.

**Ejemplo:** con \`5\` la salida es \`15\`. Con \`0\` la suma es \`0\`.`,
              dificultad: 'basico',
              inicial: `${LEER_ENTRADA}const n = Number(lineas[0]);

// Usa un acumulador
`,
              solucion: `${LEER_ENTRADA}const n = Number(lineas[0]);
let suma = 0;
for (let i = 1; i <= n; i++) {
  suma = suma + i;
}
console.log(suma);
`,
              casos: [
                { entrada: '5', salida: '15', publico: true },
                { entrada: '1', salida: '1', publico: false },
                { entrada: '100', salida: '5050', publico: false },
                { entrada: '0', salida: '0', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const n = Number(lineas[0]);
let suma = 0;
for (let i = 1; i < n; i++) {
  suma = suma + i;
}
console.log(suma);
`,
            },
            {
              tipo: 'coding',
              titulo: '¿Cuántos aprobaron?',
              enunciado: `La primera línea trae **n**, el número de estudiantes. Luego vienen n notas, una por línea.

Escribe dos líneas:

\`\`\`
Aprobaron: X de n
Promedio: P
\`\`\`

donde X es cuántos sacaron **3.0 o más**, y P es el promedio del grupo con un decimal.

**Ejemplo:** con \`4\`, \`3.5\`, \`2.0\`, \`3.0\`, \`4.5\` la salida es \`Aprobaron: 3 de 4\` y \`Promedio: 3.3\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}const n = Number(lineas[0]);

// Un contador para los aprobados y un acumulador para la suma
`,
              solucion: `${LEER_ENTRADA}const n = Number(lineas[0]);
let aprobados = 0;
let suma = 0;
for (let i = 1; i <= n; i++) {
  const nota = Number(lineas[i]);
  suma = suma + nota;
  if (nota >= 3.0) {
    aprobados++;
  }
}
console.log("Aprobaron: " + aprobados + " de " + n);
console.log("Promedio: " + (suma / n).toFixed(1));
`,
              casos: [
                { entrada: '4\n3.5\n2.0\n3.0\n4.5', salida: 'Aprobaron: 3 de 4\nPromedio: 3.3', publico: true },
                { entrada: '3\n1.0\n2.5\n2.9', salida: 'Aprobaron: 0 de 3\nPromedio: 2.1', publico: false },
                { entrada: '5\n5.0\n4.0\n3.0\n3.0\n4.8', salida: 'Aprobaron: 5 de 5\nPromedio: 4.0', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}const n = Number(lineas[0]);
let aprobados = 0;
let suma = 0;
for (let i = 1; i <= n; i++) {
  const nota = Number(lineas[i]);
  suma = suma + nota;
  if (nota > 3.0) {
    aprobados++;
  }
}
console.log("Aprobaron: " + aprobados + " de " + n);
console.log("Promedio: " + (suma / n).toFixed(1));
`,
            },
          ],
        },
      ],
    },
    {
      titulo: 'Funciones: dividir el problema',
      descripcion: 'Diseño modular: cada función resuelve una parte del problema y devuelve un resultado.',
      unidades: [
        {
          titulo: 'Crear y usar funciones',
          descripcion: 'Declarar funciones con parámetros, devolver valores con return y reutilizarlas.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Funciones: un algoritmo con nombre',
            cuerpo: `## La idea

Una **función** es un algoritmo pequeño con nombre, que recibe datos (**parámetros**) y **devuelve** un resultado con
\`return\`. Sirve para **dividir** un problema grande en partes y para **no repetir** código.

\`\`\`js
function areaRectangulo(base, altura) {
  return base * altura;
}

console.log(areaRectangulo(3, 4)); // 12
console.log(areaRectangulo(5, 2)); // 10
\`\`\`

## Un ejemplo

Una función que decide si una nota aprueba, usada dentro de un ciclo:

\`\`\`js
function aprueba(nota) {
  return nota >= 3.0;
}

const notas = [4.0, 2.5, 3.0];
for (const nota of notas) {
  console.log(nota + ": " + (aprueba(nota) ? "aprueba" : "no aprueba"));
}
\`\`\`

## Error común

**Confundir \`return\` con \`console.log\`.** \`console.log\` solo **muestra** un valor en pantalla; \`return\` lo
**entrega** a quien llamó la función. Una función sin \`return\` devuelve \`undefined\`.

## Pruébalo

Escribe la función \`perimetroCuadrado(lado)\` y úsala para mostrar el perímetro de cuadrados de lado 1, 2 y 3.`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'La función sin return',
              enunciado: `¿Qué escribe este programa?

\`\`\`js
function doble(x) {
  x * 2;
}
console.log(doble(4));
\`\`\``,
              dificultad: 'intermedio',
              opciones: ['8', '4', 'undefined', 'Da un error'],
              correcta: 2,
              explicacion: 'La función calcula x * 2 pero no lo devuelve: le falta return. Una función sin return devuelve undefined.',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: área de un círculo',
              enunciado: 'Completa la función para que **devuelva** el área de un círculo (π × radio²).',
              dificultad: 'intermedio',
              lenguaje: 'javascript',
              plantilla: `function areaCirculo(___a___) {
  ___b___ Math.PI * radio ** 2;
}
console.log(areaCirculo(2).toFixed(2)); // 12.57`,
              huecos: { a: 'radio', b: 'return' },
              errorComun: { b: 'console.log' },
            },
            {
              tipo: 'coding',
              titulo: 'El mayor de tres números',
              enunciado: `Completa la función \`mayor(a, b, c)\` para que **devuelva** el mayor de los tres números. El resto del programa ya lee los números y escribe el resultado.

**Ejemplo:** con \`4\`, \`9\` y \`2\` la salida es \`9\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}
function mayor(a, b, c) {
  // Devuelve el mayor de los tres
}

const a = Number(lineas[0]);
const b = Number(lineas[1]);
const c = Number(lineas[2]);
console.log(mayor(a, b, c));
`,
              solucion: `${LEER_ENTRADA}
function mayor(a, b, c) {
  let m = a;
  if (b > m) m = b;
  if (c > m) m = c;
  return m;
}

const a = Number(lineas[0]);
const b = Number(lineas[1]);
const c = Number(lineas[2]);
console.log(mayor(a, b, c));
`,
              casos: [
                { entrada: '4\n9\n2', salida: '9', publico: true },
                { entrada: '1\n2\n30', salida: '30', publico: false },
                { entrada: '7\n7\n3', salida: '7', publico: false },
                { entrada: '-5\n-2\n-9', salida: '-2', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}
function mayor(a, b, c) {
  if (a > b) return a;
  return b;
}

const a = Number(lineas[0]);
const b = Number(lineas[1]);
const c = Number(lineas[2]);
console.log(mayor(a, b, c));
`,
            },
            {
              tipo: 'coding',
              titulo: 'Precios con IVA',
              enunciado: `Escribe la función \`conIva(precio)\` que devuelve el precio con el **19 % de IVA**, redondeado al peso con \`Math.round\`.

La primera línea trae **n**, la cantidad de productos, y luego vienen n precios. Escribe cada precio con IVA en una línea.

**Ejemplo:** con \`2\`, \`1000\`, \`2500\` la salida es \`1190\` y \`2975\`.`,
              dificultad: 'intermedio',
              inicial: `${LEER_ENTRADA}
function conIva(precio) {
  // Devuelve el precio con IVA, redondeado
}

const n = Number(lineas[0]);
// Recorre los n precios y escribe cada uno con IVA
`,
              solucion: `${LEER_ENTRADA}
function conIva(precio) {
  return Math.round(precio * 119 / 100);
}

const n = Number(lineas[0]);
for (let i = 1; i <= n; i++) {
  console.log(conIva(Number(lineas[i])));
}
`,
              casos: [
                { entrada: '2\n1000\n2500', salida: '1190\n2975', publico: true },
                { entrada: '3\n3500\n150\n99', salida: '4165\n179\n118', publico: false },
                { entrada: '1\n0', salida: '0', publico: false },
              ],
              errorComun: `${LEER_ENTRADA}
function conIva(precio) {
  return precio + 19;
}

const n = Number(lineas[0]);
for (let i = 1; i <= n; i++) {
  console.log(conIva(Number(lineas[i])));
}
`,
            },
          ],
        },
      ],
    },
    {
      titulo: 'JavaScript en la página web',
      descripcion: 'El DOM, los eventos y la validación de formularios; estilos con CSS.',
      unidades: [
        {
          titulo: 'El DOM y los eventos',
          descripcion: 'Leer y cambiar elementos de la página, reaccionar a clics y validar lo que escribe el usuario.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Cuando el algoritmo vive en la página',
            cuerpo: `## La idea

El navegador convierte el HTML en un árbol de objetos llamado **DOM**. Con JavaScript podemos **buscar** un elemento,
**cambiar** lo que muestra y **reaccionar** a lo que hace el usuario (un **evento**, como un clic).

| Instrucción | Qué hace |
|---|---|
| \`document.getElementById("total")\` | Busca el elemento con \`id="total"\` |
| \`elemento.textContent = "Hola"\` | Cambia el texto que se ve |
| \`boton.addEventListener("click", f)\` | Ejecuta la función \`f\` cada vez que hacen clic |
| \`campo.value\` | Lo que el usuario escribió en un campo (**siempre es texto**) |

## Un ejemplo

Un contador de clics, la base de muchos juegos educativos:

\`\`\`html
<button id="sumar">Sumar</button>
<p id="total">Clics: 0</p>
<script>
  let clics = 0;
  const boton = document.getElementById("sumar");
  const salida = document.getElementById("total");
  boton.addEventListener("click", () => {
    clics = clics + 1;
    salida.textContent = "Clics: " + clics;
  });
</script>
\`\`\`

**Validar un formulario** es un algoritmo con condicionales: si el dato no es válido, se detiene el envío con
\`evento.preventDefault()\` y se muestra un aviso.

## Error común

1. **Olvidar convertir:** \`campo.value\` es texto; \`"5" + 3\` da \`"53"\`. Usa \`Number(campo.value)\`.
2. **Declarar el contador dentro del evento:** si \`let clics = 0\` va dentro de la función del clic, vuelve a 0 en cada clic y el contador nunca pasa de 1.

## Pruébalo

Copia el ejemplo en un archivo \`contador.html\`, ábrelo en el navegador y agrega un botón «Reiniciar» que vuelva
el contador a 0.`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: 'Instrucciones del DOM',
              enunciado: 'Une cada instrucción de JavaScript con lo que hace en la página.',
              dificultad: 'basico',
              parejas: [
                ['document.getElementById("x")', 'Busca el elemento con id x'],
                ['elemento.textContent = "Hola"', 'Cambia el texto que se ve'],
                ['boton.addEventListener("click", f)', 'Ejecuta f cada vez que hacen clic'],
                ['campo.value', 'Lo que el usuario escribió, como texto'],
                ['Number(campo.value)', 'Convierte lo escrito en número'],
              ],
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena el contador de clics',
              enunciado: 'Ordena las líneas para que el contador aumente con cada clic.',
              dificultad: 'intermedio',
              pasos: [
                'let clics = 0;',
                'const boton = document.getElementById("sumar");',
                'const salida = document.getElementById("total");',
                'boton.addEventListener("click", () => {',
                '  clics = clics + 1;',
                '  salida.textContent = "Clics: " + clics;',
                '});',
              ],
              errorComun: [1, 2, 3, 0, 4, 5, 6],
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa la validación del formulario',
              enunciado:
                'El formulario de inscripción solo acepta edades **entre 14 y 99**. Completa la validación: convierte lo escrito en número y detén el envío si la edad está **por fuera** del rango.',
              dificultad: 'intermedio',
              lenguaje: 'javascript',
              plantilla: `formulario.addEventListener("submit", (evento) => {
  const edad = ___a___(campoEdad.value);
  if (edad < 14 ___b___ edad > 99) {
    evento.preventDefault();
    aviso.textContent = "Escribe una edad entre 14 y 99";
  }
});`,
              huecos: { a: 'Number', b: '||' },
              errorComun: { b: '&&' },
            },
            {
              tipo: 'mcq',
              titulo: 'Lo que escribe el usuario es texto',
              enunciado: `El usuario escribió **5** en el campo. ¿Qué muestra la página?

\`\`\`js
const cantidad = campo.value;
salida.textContent = cantidad + 3;
\`\`\``,
              dificultad: 'basico',
              opciones: ['8', '53', 'NaN', 'Da un error'],
              correcta: 1,
              explicacion: 'campo.value es el texto "5", y texto + número pega en vez de sumar: "53". Con Number(campo.value) + 3 el resultado sería 8.',
              errorComun: 0,
            },
          ],
        },
        {
          titulo: 'Dar estilo con CSS',
          descripcion: 'Selectores, propiedades y el modelo de caja; una presentación interactiva (evidencia U2-E1).',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'CSS: la presentación de la página',
            cuerpo: `## La idea

HTML dice **qué es** cada cosa; **CSS** dice **cómo se ve**. Una regla de CSS tiene un **selector** y una lista de
**propiedades**:

\`\`\`css
.diapositiva {                 /* selector: los elementos con class="diapositiva" */
  background-color: #fdf6e3;   /* color de fondo */
  padding: 24px;               /* espacio interior */
  margin-bottom: 16px;         /* espacio exterior */
  border-radius: 12px;         /* esquinas redondeadas */
}
h2 {
  color: #b35900;              /* color del texto */
  text-align: center;          /* centrado */
}
\`\`\`

**Modelo de caja:** todo elemento es una caja. Adentro está el contenido, luego el **padding** (relleno), luego el
**borde** y afuera el **margin** (margen).

## Un ejemplo

Una presentación sencilla: cada diapositiva es una \`<section class="diapositiva">\`:

\`\`\`html
<section class="diapositiva">
  <h2>¿Qué es un algoritmo?</h2>
  <p>Una secuencia finita de pasos precisos.</p>
</section>
\`\`\`

## Error común

Olvidar el **punto** en el selector de clase: \`diapositiva { ... }\` busca una etiqueta \`<diapositiva>\`, que no existe.
Para una clase es \`.diapositiva\`; para un id es \`#portada\`.

## Pruébalo

Cambia el \`padding\` del ejemplo a 48px y luego el \`margin-bottom\` a 0. ¿Qué cambió en cada caso?`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: 'Cada propiedad con su efecto',
              enunciado: 'Une cada propiedad de CSS con lo que cambia.',
              dificultad: 'basico',
              parejas: [
                ['color', 'El color del texto'],
                ['background-color', 'El color de fondo'],
                ['padding', 'El espacio entre el contenido y el borde'],
                ['margin', 'El espacio por fuera del borde'],
                ['font-size', 'El tamaño de la letra'],
              ],
            },
            {
              tipo: 'mcq',
              titulo: 'El selector de clase',
              enunciado: 'Tienes `<section class="diapositiva">`. ¿Qué selector de CSS le aplica estilo?',
              dificultad: 'basico',
              opciones: ['diapositiva { }', '.diapositiva { }', '#diapositiva { }', 'section.class { }'],
              correcta: 1,
              explicacion: 'Las clases se seleccionan con punto: .diapositiva. El numeral # es para id, y sin símbolo se busca una etiqueta con ese nombre.',
              errorComun: 0,
            },
            {
              tipo: 'html_css',
              titulo: 'Presentación de tres diapositivas',
              enunciado: `Construye una presentación (evidencia **U2-E1** del plan) con:

- **tres** \`<section class="diapositiva">\`, cada una con su título \`<h2>\`;
- una imagen con \`alt\`;
- un enlace con \`href\`.

Y dale estilo: las diapositivas deben tener \`padding: 24px\` y los títulos \`text-align: center\`.`,
              dificultad: 'intermedio',
              htmlInicial: `<section class="diapositiva">
  <h2>¿Qué es un algoritmo?</h2>
  <p>Una secuencia finita de pasos precisos.</p>
</section>
<!-- Agrega dos diapositivas más -->
`,
              cssInicial: `.diapositiva {
  background-color: #fdf6e3;
  border-radius: 12px;
  margin-bottom: 16px;
}
`,
              solucion: {
                html: `<section class="diapositiva">
  <h2>¿Qué es un algoritmo?</h2>
  <p>Una secuencia finita de pasos precisos.</p>
</section>
<section class="diapositiva">
  <h2>¿Cómo se representa?</h2>
  <img src="diagrama.png" alt="Diagrama de flujo de un algoritmo">
</section>
<section class="diapositiva">
  <h2>Para aprender más</h2>
  <a href="https://developer.mozilla.org/es/docs/Learn">MDN en español</a>
</section>`,
                css: `.diapositiva {
  background-color: #fdf6e3;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 24px;
}
h2 {
  text-align: center;
}`,
              },
              reglas: [
                { id: 'tres', label: 'Hay tres diapositivas (section.diapositiva)', isPublic: true, weight: 2, check: { kind: 'element_count', selector: 'section.diapositiva', equals: 3 } },
                { id: 'titulos', label: 'Cada diapositiva tiene su título h2', isPublic: true, weight: 1, check: { kind: 'element_count', selector: 'section.diapositiva > h2', min: 3 } },
                { id: 'alt', label: 'La imagen tiene alt', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'img[alt]' } },
                { id: 'enlace', label: 'Hay un enlace con href', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'a[href]' } },
                { id: 'relleno', label: 'Las diapositivas tienen padding de 24px', isPublic: true, weight: 1, check: { kind: 'css_property', selector: 'section.diapositiva', property: 'padding-top', oneOf: ['24px'] } },
                { id: 'centrado', label: 'Los títulos están centrados', isPublic: true, weight: 1, check: { kind: 'css_property', selector: 'section.diapositiva > h2', property: 'text-align', oneOf: ['center'] } },
                { id: 'img-alt-todas', label: 'Todas las imágenes tienen alt', isPublic: false, weight: 1, check: { kind: 'a11y', check: 'img_alt' } },
              ],
              errorComun: {
                html: `<section class="diapositiva">
  <h2>¿Qué es un algoritmo?</h2>
  <p>Una secuencia finita de pasos precisos.</p>
</section>
<section class="diapositiva">
  <h2>¿Cómo se representa?</h2>
  <img src="diagrama.png">
</section>
<section class="diapositiva">
  <h2>Para aprender más</h2>
  <a href="https://developer.mozilla.org/es/docs/Learn">MDN en español</a>
</section>`,
                css: `diapositiva {
  padding: 24px;
}
h2 {
  text-align: center;
}`,
              },
            },
          ],
        },
      ],
    },
  ],
};
