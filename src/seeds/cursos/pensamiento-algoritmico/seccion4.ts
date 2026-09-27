import { Seccion } from '../tipos';

/** Problemas clásicos que aparecen en cualquier curso de algoritmia: extremos, promedios y búsqueda. */
export const seccion4: Seccion = {
  titulo: 'Problemas clásicos',
  descripcion: 'Encontrar el mayor y el menor, y buscar un dato: algoritmos que aparecen en todas partes.',
  temas: [
    {
      titulo: 'El mayor y el menor',
      descripcion: 'Recorrer datos comparando con una referencia.',
      unidades: [
        {
          titulo: 'Mayor, menor y promedio',
          descripcion: 'El algoritmo del valor de referencia y por qué no se empieza en cero.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Comparar con una referencia',
            cuerpo: `## La idea

Para encontrar el **mayor** de una serie de datos se usa una **referencia**: el mayor visto hasta ahora.

1. El **primer dato** es, por ahora, el mayor.
2. Cada dato nuevo se compara con la referencia.
3. Si el dato nuevo es mayor, pasa a ser la referencia.
4. Al terminar, la referencia es el mayor de todos.

El **menor** es igual, cambiando \`>\` por \`<\`.

## Un ejemplo

\`\`\`
Leer n
Leer x
mayor <- x
Para i <- 2 Hasta n Hacer
    Leer x
    Si x > mayor Entonces
        mayor <- x
    FinSi
FinPara
Escribir mayor
\`\`\`

Prueba de escritorio con 4 datos: 7, 12, 3, 9. La referencia pasa por 7, 12, 12, 12: escribe **12**.

## Error común

**Empezar la referencia en 0** (\`mayor <- 0\`). Funciona con datos positivos, pero falla si todos son negativos:
con las pérdidas de la tienda escolar −5000, −2000 y −8000, el algoritmo diría que la mayor es **0**, un valor que ni
siquiera está en los datos. Por eso la referencia empieza con el **primer dato**.

## Pruébalo

Modifica el ejemplo para que encuentre **a la vez** el mayor y el menor. ¿Necesitas un ciclo o dos?`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'La referencia que empieza en cero',
              enunciado: `Este algoritmo busca la **mayor** ganancia de la tienda escolar en tres días:

\`\`\`
mayor <- 0
Para i <- 1 Hasta 3 Hacer
    Leer ganancia
    Si ganancia > mayor Entonces
        mayor <- ganancia
    FinSi
FinPara
Escribir mayor
\`\`\`

Los tres días fueron de pérdidas: **−5000**, **−2000** y **−8000**. ¿Qué escribe el algoritmo?`,
              dificultad: 'intermedio',
              opciones: ['−2000', '0', '−8000', '−15000'],
              correcta: 1,
              explicacion:
                'Ninguna ganancia es mayor que 0, así que mayor nunca cambia: escribe 0, que ni siquiera está en los datos. La respuesta esperada era −2000; por eso la referencia debe empezar con el primer dato.',
              errorComun: 0,
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena: el mayor de n datos',
              enunciado: 'Ordena el algoritmo que encuentra el mayor de n datos usando el primero como referencia.',
              dificultad: 'intermedio',
              pasos: [
                'Leer n',
                'Leer x',
                'mayor <- x',
                'Para i <- 2 Hasta n Hacer',
                '    Leer x',
                '    Si x > mayor Entonces',
                '        mayor <- x',
                '    FinSi',
                'FinPara',
                'Escribir mayor',
              ],
              errorComun: [0, 2, 1, 3, 4, 5, 6, 7, 8, 9],
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: el menor',
              enunciado: 'Completa el algoritmo para que encuentre el **menor** de n datos.',
              dificultad: 'intermedio',
              lenguaje: 'text',
              plantilla: `Leer x
menor <- ___a___
Para i <- 2 Hasta n Hacer
    Leer x
    Si x ___b___ menor Entonces
        menor <- x
    FinSi
FinPara`,
              huecos: { a: 'x', b: '<' },
              errorComun: { b: '>' },
            },
            {
              tipo: 'drag_drop',
              titulo: '¿Qué patrón necesita?',
              enunciado: 'Clasifica cada tarea según el patrón de algoritmo que necesita.',
              dificultad: 'basico',
              categorias: ['Acumulador (sumar)', 'Contador (contar)', 'Mayor o menor (comparar)'],
              elementos: [
                ['Promedio de estatura del curso', 0],
                ['Cuántos estudiantes llegaron tarde', 1],
                ['El estudiante más alto', 2],
                ['Total recaudado en la rifa', 0],
                ['Cuántos días llovió en el mes', 1],
                ['La temperatura más baja de la semana', 2],
              ],
              errorComun: [1],
            },
          ],
        },
      ],
    },
    {
      titulo: 'Buscar',
      descripcion: 'Búsqueda lineal y búsqueda binaria: cuándo usar cada una y cuánto cuestan.',
      unidades: [
        {
          titulo: 'Buscar en una lista',
          descripcion: 'Recorrer uno por uno o partir a la mitad: dos formas de buscar y su costo.',
          dificultad: 'avanzado',
          leccion: {
            titulo: 'Uno por uno o partiendo a la mitad',
            cuerpo: `## La idea

Una **lista** (o arreglo) guarda varios datos en una sola variable; cada uno se consulta por su posición:
\`lista[1]\`, \`lista[2]\`… (en PSeInt, según la configuración, las posiciones empiezan en 0 o en 1; aquí usamos 1).

Hay dos formas clásicas de buscar un dato:

| Búsqueda | Cómo funciona | Requiere | Peor caso con 1000 datos |
|---|---|---|---|
| **Lineal** | Revisa uno por uno desde el principio | Nada | 1000 comparaciones |
| **Binaria** | Mira la mitad y descarta la mitad donde no puede estar | Lista **ordenada** | 10 comparaciones |

## Un ejemplo

**Adivina el número del 1 al 100** con pistas de «mayor» o «menor». Si siempre dices la mitad del rango
(50, luego 25 o 75, …) descartas la mitad en cada intento: **7 intentos** bastan siempre, porque 2⁷ = 128 ≥ 100.

Búsqueda lineal con bandera:

\`\`\`
encontrado <- Falso
i <- 1
Mientras i <= n Y NO encontrado Hacer
    Si lista[i] = buscado Entonces
        encontrado <- Verdadero
    FinSi
    i <- i + 1
FinMientras
\`\`\`

## Error común

**Usar la búsqueda binaria en una lista desordenada.** Si los datos no están ordenados, descartar una mitad puede
descartar justo el dato que buscas. Antes de partir a la mitad, pregúntate: ¿está ordenada?

## Pruébalo

Juega con un compañero a adivinar un número del 1 al 1000 usando siempre la mitad. ¿Cuántos intentos necesitaron?
¿Coincide con la tabla?`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: 'Adivina el número',
              enunciado:
                'Tu compañero pensó un número del **1 al 100** y te dice «mayor» o «menor» después de cada intento. Si siempre dices la mitad del rango que queda, ¿cuántos intentos necesitas **como máximo**?',
              dificultad: 'intermedio',
              opciones: ['7', '10', '50', '100'],
              correcta: 0,
              explicacion: 'Cada intento descarta la mitad: 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1. Con 7 intentos siempre lo encuentras, porque 2⁷ = 128 es mayor que 100.',
              errorComun: 2,
            },
            {
              tipo: 'mcq',
              titulo: 'El peor caso de la búsqueda lineal',
              enunciado: 'Buscas el nombre de un estudiante en una lista **desordenada** de 30 nombres, revisando uno por uno. En el **peor caso**, ¿cuántos nombres revisas?',
              dificultad: 'basico',
              opciones: ['1', '15', '30', '5'],
              correcta: 2,
              explicacion: 'El peor caso es que el nombre esté al final o no esté: hay que revisar los 30. En promedio se revisan unos 15, pero el peor caso son todos.',
              errorComun: 1,
            },
            {
              tipo: 'drag_drop',
              titulo: '¿Lineal o binaria?',
              enunciado: 'Clasifica cada situación según la búsqueda que conviene usar.',
              dificultad: 'intermedio',
              categorias: ['Búsqueda lineal', 'Búsqueda binaria'],
              elementos: [
                ['Buscar un nombre en una lista desordenada', 0],
                ['Buscar una palabra en el diccionario', 1],
                ['Adivinar un número del 1 al 1000 con pistas', 1],
                ['Buscar tus llaves en la maleta', 0],
                ['Buscar un código en una lista ordenada de 10 000 productos', 1],
                ['Revisar si algún estudiante sacó 5.0', 0],
              ],
              errorComun: [5],
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: búsqueda lineal con bandera',
              enunciado: 'Completa la búsqueda lineal: debe seguir **mientras** queden datos **y** no se haya encontrado el buscado.',
              dificultad: 'avanzado',
              lenguaje: 'text',
              plantilla: `encontrado <- Falso
i <- 1
Mientras i <= n ___a___ NO encontrado Hacer
    Si lista[i] = buscado Entonces
        encontrado <- ___b___
    FinSi
    i <- i + 1
FinMientras`,
              huecos: { a: { regex: 'y|&&', ejemplo: 'Y' }, b: { regex: 'verdadero', ejemplo: 'Verdadero' } },
              errorComun: { a: 'O' },
            },
          ],
        },
      ],
    },
  ],
};
