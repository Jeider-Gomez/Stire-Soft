import { Seccion } from '../tipos';

/** Pensamiento computacional: pensar el problema antes de pensar en un lenguaje. */
export const seccion1: Seccion = {
  titulo: 'Pensar antes de programar',
  descripcion: 'Los pilares del pensamiento computacional y las instrucciones precisas, sin necesidad de un computador.',
  temas: [
    {
      titulo: 'Los cuatro pilares del pensamiento computacional',
      descripcion: 'Descomponer, reconocer patrones, abstraer y diseñar el algoritmo.',
      unidades: [
        {
          titulo: 'Descomponer, reconocer patrones y abstraer',
          descripcion: 'Las cuatro habilidades que usa quien resuelve problemas como un programador.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Pensar como un programador, sin computador',
            cuerpo: `## La idea

El **pensamiento computacional** es una forma de resolver problemas que se puede usar con o sin computador.
Tiene cuatro pilares:

| Pilar | Qué haces | Pregunta guía |
|---|---|---|
| **Descomponer** | Partes el problema grande en problemas pequeños. | ¿En qué partes lo puedo dividir? |
| **Reconocer patrones** | Encuentras lo que se repite o se parece a algo que ya resolviste. | ¿Esto se parece a algo que ya sé hacer? |
| **Abstraer** | Te quedas con lo importante e ignoras los detalles que no afectan. | ¿Qué datos necesito de verdad? |
| **Diseñar el algoritmo** | Escribes los pasos precisos para resolverlo. | ¿Qué hago primero, después y al final? |

## Un ejemplo

*Problema: organizar la salida pedagógica del curso al río Sinú.*

- **Descomponer:** transporte, permisos de los acudientes, refrigerios, horario.
- **Reconocer patrones:** recoger los permisos es igual que recoger cualquier tarea: una lista y marcar quién entregó.
- **Abstraer:** para el bus importa **cuántos** estudiantes van, no el color de su maleta.
- **Algoritmo:** 1) contar estudiantes con permiso, 2) calcular cuántos buses se necesitan, 3) reservar, 4) confirmar la hora.

## En video

Dos videos cortos sobre los pilares: partir un problema grande en partes pequeñas y encontrar lo que se repite.

@[Descomposición de problemas (Educatic Uruguay)](https://www.youtube.com/watch?v=KAXaLZimk5Q)

@[Pensamiento computacional: reconocer patrones (Rutatec)](https://www.youtube.com/watch?v=0FcBoRLkZ40)

## Error común

Saltar directo al algoritmo sin descomponer. Los problemas grandes abruman; los pequeños se resuelven uno por uno.
Otro error es **no abstraer**: llenar el análisis de detalles que no cambian la solución.

## Pruébalo

Aplica los cuatro pilares al problema *«preparar el horario de estudio de la semana de parciales»*. Escribe al menos
dos subproblemas, un patrón, un detalle que ignorarías y los primeros tres pasos de tu algoritmo.`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: 'Cada pilar con su ejemplo',
              enunciado: 'Une cada pilar del pensamiento computacional con el ejemplo que lo muestra.',
              dificultad: 'basico',
              parejas: [
                ['Descomponer', 'Dividir la salida pedagógica en transporte, permisos y refrigerios'],
                ['Reconocer patrones', 'Notar que recoger permisos es igual que recoger tareas'],
                ['Abstraer', 'Para el bus importa cuántos van, no el color de su maleta'],
                ['Diseñar el algoritmo', 'Escribir los pasos: contar, calcular buses, reservar, confirmar'],
              ],
            },
            {
              tipo: 'drag_drop',
              titulo: '¿Importa o se puede ignorar?',
              enunciado:
                '*Problema: calcular cuántos buses de 40 puestos se necesitan para la salida pedagógica.*\n\nAbstrae: clasifica cada dato.',
              dificultad: 'basico',
              categorias: ['Importa para resolverlo', 'Se puede ignorar'],
              elementos: [
                ['Número de estudiantes que van', 0],
                ['Puestos de cada bus (40)', 0],
                ['Número de docentes acompañantes', 0],
                ['El color de los buses', 1],
                ['El nombre del conductor', 1],
                ['Lo que cada estudiante lleva de refrigerio', 1],
              ],
              errorComun: [2],
            },
            {
              tipo: 'mcq',
              titulo: 'El patrón escondido',
              enunciado:
                'Calcular el promedio de notas del curso, el promedio de goles de un equipo y el promedio de lluvia de la semana. ¿Qué patrón comparten?',
              dificultad: 'basico',
              opciones: [
                'Todos usan números decimales.',
                'Todos suman varios valores y dividen entre cuántos son.',
                'Todos son problemas de matemáticas del colegio.',
                'No tienen nada en común: son temas distintos.',
              ],
              correcta: 1,
              explicacion:
                'Reconocer patrones es ver que tres problemas de temas distintos se resuelven con el MISMO algoritmo: sumar y dividir entre la cantidad. Resuelves uno y ya tienes los tres.',
              errorComun: 3,
            },
            {
              tipo: 'ordering',
              titulo: 'El orden de los pilares',
              enunciado: 'Ordena cómo se aplican los pilares para resolver *«organizar las monitorías de la semana»*.',
              dificultad: 'basico',
              pasos: [
                'Descomponer: horarios, salones, monitores y temas',
                'Reconocer patrones: asignar salón es como asignar pupitres',
                'Abstraer: importa la hora libre de cada monitor, no su dirección',
                'Diseñar el algoritmo: los pasos para armar el horario',
              ],
              errorComun: [3, 0, 1, 2],
            },
          ],
        },
      ],
    },
    {
      titulo: 'Instrucciones precisas',
      descripcion: 'Un robot solo hace lo que le dices, exactamente como se lo dices.',
      unidades: [
        {
          titulo: 'El robot que sigue órdenes',
          descripcion: 'Dar instrucciones precisas, seguirlas paso a paso y usar la repetición.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Un robot no adivina',
            cuerpo: `## La idea

Imagina un robot en una cuadrícula. Solo entiende tres órdenes:

| Orden | Qué hace |
|---|---|
| \`AVANZAR\` | Se mueve **una** casilla hacia donde está mirando. |
| \`GIRAR_DERECHA\` | Gira 90° a su derecha **sin moverse**. |
| \`GIRAR_IZQUIERDA\` | Gira 90° a su izquierda **sin moverse**. |

Y una forma de repetir: \`Repetir 3 veces: AVANZAR\` es lo mismo que escribir \`AVANZAR\` tres veces.

El robot empieza en la casilla **(0, 0)** mirando **hacia arriba**. La primera coordenada crece hacia la derecha y
la segunda hacia arriba.

## Un ejemplo

\`\`\`
AVANZAR
AVANZAR
GIRAR_DERECHA
AVANZAR
\`\`\`

Paso a paso: (0, 1) → (0, 2) → gira y queda mirando a la derecha → (1, 2). Termina en **(1, 2) mirando a la derecha**.

## Error común

1. **Confundir derecha e izquierda** cuando el robot no mira hacia arriba. Si mira hacia abajo, su derecha es tu izquierda.
   Truco: gira tu cuerpo como el robot.
2. **Creer que girar también avanza.** Girar solo cambia la dirección.

## Pruébalo

Dibuja una cuadrícula de 4 × 4, pon una estrella en (3, 2) y escribe el programa más corto que lleve al robot hasta ella.
¿Cuántas órdenes usaste? ¿Se puede con menos usando \`Repetir\`?`,
          },
          ejercicios: [
            {
              tipo: 'mcq',
              titulo: '¿Dónde termina el robot?',
              enunciado: `El robot empieza en (0, 0) mirando hacia arriba. Sigue el programa:

\`\`\`
AVANZAR
AVANZAR
GIRAR_DERECHA
AVANZAR
GIRAR_DERECHA
AVANZAR
\`\`\`

¿Dónde termina y hacia dónde mira?`,
              dificultad: 'basico',
              opciones: [
                '(1, 1) mirando hacia abajo',
                '(−1, 1) mirando hacia abajo',
                '(1, 3) mirando hacia arriba',
                '(1, 2) mirando a la derecha',
              ],
              correcta: 0,
              explicacion:
                'Avanza a (0, 2); gira a la derecha y mira a la derecha; avanza a (1, 2); gira a la derecha otra vez y mira hacia abajo; avanza a (1, 1).',
              errorComun: 1,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: llegar a la estrella',
              enunciado:
                'El robot empieza en (0, 0) mirando hacia arriba y la estrella está en **(2, 1)**. Completa el programa para que llegue.',
              dificultad: 'basico',
              lenguaje: 'text',
              plantilla: `AVANZAR
___a___
Repetir ___b___ veces:
    AVANZAR`,
              huecos: { a: { regex: 'girar[_ ]?derecha', ejemplo: 'GIRAR_DERECHA' }, b: '2' },
              errorComun: { a: 'GIRAR_IZQUIERDA' },
            },
            {
              tipo: 'drag_drop',
              titulo: '¿El robot entiende la orden?',
              enunciado: 'El robot solo entiende AVANZAR, GIRAR_DERECHA, GIRAR_IZQUIERDA y Repetir. Clasifica cada orden.',
              dificultad: 'basico',
              categorias: ['El robot la entiende', 'Es ambigua o no la entiende'],
              elementos: [
                ['Repetir 4 veces: AVANZAR', 0],
                ['GIRAR_IZQUIERDA', 0],
                ['Avanza un poquito', 1],
                ['Ve hasta la estrella', 1],
                ['Repetir 2 veces: GIRAR_DERECHA', 0],
                ['Da la vuelta', 1],
              ],
              errorComun: [3],
            },
            {
              tipo: 'mcq',
              titulo: 'El programa más corto',
              enunciado:
                'El robot empieza en (0, 0) mirando hacia arriba. ¿Cuál de estos programas lo deja en **(0, 3)**?',
              dificultad: 'basico',
              opciones: [
                'Repetir 3 veces: AVANZAR',
                'GIRAR_DERECHA y luego Repetir 3 veces: AVANZAR',
                'Repetir 3 veces: GIRAR_DERECHA',
                'AVANZAR y luego GIRAR_IZQUIERDA',
              ],
              correcta: 0,
              explicacion: 'Mirando hacia arriba, cada AVANZAR suma 1 a la segunda coordenada: (0, 1), (0, 2), (0, 3). Si gira antes, avanza hacia otro lado.',
              errorComun: 1,
            },
          ],
        },
      ],
    },
  ],
};
