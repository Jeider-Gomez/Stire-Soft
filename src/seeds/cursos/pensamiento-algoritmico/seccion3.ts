import { Seccion } from '../tipos';

/** Estructuras de control en pseudocódigo: decisiones, repeticiones y variables que llevan la cuenta. */
export const seccion3: Seccion = {
  titulo: 'Estructuras de control',
  descripcion: 'Decidir con Si, repetir con Para y Mientras, y llevar la cuenta con contadores, acumuladores y banderas.',
  temas: [
    {
      titulo: 'Decisiones',
      descripcion: 'La estructura condicional y las condiciones compuestas con Y, O y NO.',
      unidades: [
        {
          titulo: 'Si, SiNo y condiciones compuestas',
          descripcion: 'Escribir y evaluar condiciones simples y compuestas.',
          dificultad: 'basico',
          leccion: {
            titulo: 'Decidir: Si… Entonces… SiNo',
            cuerpo: `## La idea

La **estructura condicional** elige un camino según una condición que es **Verdadera** o **Falsa**:

\`\`\`
Si condición Entonces
    ... (si es verdadera)
SiNo
    ... (si es falsa)
FinSi
\`\`\`

Para comparar: \`=\` (igual), \`<>\` (diferente), \`<\`, \`>\`, \`<=\`, \`>=\`.
Para combinar condiciones:

| A | B | A **Y** B | A **O** B |
|---|---|---|---|
| V | V | V | V |
| V | F | F | V |
| F | V | F | V |
| F | F | F | F |

**NO** invierte: \`NO Verdadero\` es Falso.

## Un ejemplo

En el cine, los niños de hasta 12 años **o** los adultos de 60 o más pagan $6000; los demás, $12 000:

\`\`\`
Leer edad
Si edad <= 12 O edad >= 60 Entonces
    precio <- 6000
SiNo
    precio <- 12000
FinSi
Escribir precio
\`\`\`

## Una decisión en la vida real

Así decide una aplicación si te deja entrar. Cada rombo es una pregunta de sí o no; fíjate qué pasa con el «No».

![Diagrama de flujo del inicio de sesión: ingresar usuario y contraseña, «¿Datos correctos?» y «¿Olvidó contraseña?»](https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Diagrama_de_flujo_sobre_inicio_de_sesi%C3%B3n.png/960px-Diagrama_de_flujo_sobre_inicio_de_sesi%C3%B3n.png "Inicio de sesión en una aplicación. Imagen: FerLez, Wikimedia Commons, CC0.")

## Error común

**Confundir Y con O.** \`edad <= 12 Y edad >= 60\` nunca es verdadero: nadie tiene a la vez 12 años o menos y 60 o más.
Pregúntate: ¿deben cumplirse **las dos** condiciones (Y) o **basta una** (O)?

## Pruébalo

Haz la prueba de escritorio del ejemplo con 12, 13, 59 y 60. ¿Los casos límite dan el precio correcto?`,
          },
          ejercicios: [
            {
              tipo: 'drag_drop',
              titulo: '¿Verdadera o falsa?',
              enunciado: 'Con **edad = 15**, **tieneCarne = Verdadero** y **dia = "martes"**, clasifica cada condición.',
              dificultad: 'basico',
              categorias: ['Verdadera', 'Falsa'],
              elementos: [
                ['edad >= 14 Y tieneCarne', 0],
                ['edad >= 18 O tieneCarne', 0],
                ['edad >= 18 Y tieneCarne', 1],
                ['NO tieneCarne', 1],
                ['dia = "martes" O dia = "jueves"', 0],
                ['edad > 15', 1],
              ],
              errorComun: [5],
            },
            {
              tipo: 'mcq',
              titulo: 'La tabla de verdad de Y',
              enunciado: 'Si **A** es Verdadero y **B** es Falso, ¿cuánto vale **A Y B**?',
              dificultad: 'basico',
              opciones: ['Verdadero', 'Falso', 'Depende de A', 'No se puede saber'],
              correcta: 1,
              explicacion: 'Con Y, las dos condiciones deben ser verdaderas. Basta con que una sea falsa para que el resultado sea Falso.',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: la tarifa del cine',
              enunciado: 'Los niños de hasta 12 años **o** los adultos de 60 o más pagan $6000; los demás, $12 000. Completa la condición.',
              dificultad: 'basico',
              lenguaje: 'text',
              plantilla: `Leer edad
Si edad <= 12 ___a___ edad >= 60 Entonces
    precio <- 6000
SiNo
    precio <- 12000
FinSi`,
              huecos: { a: { regex: 'o|\\|\\|', ejemplo: 'O' } },
              errorComun: { a: 'Y' },
            },
            {
              tipo: 'mcq',
              titulo: 'Decisiones anidadas',
              enunciado: `¿Qué escribe este algoritmo si la temperatura es **30**?

\`\`\`
Leer temperatura
Si temperatura > 30 Entonces
    Escribir "Hace calor"
SiNo
    Si temperatura < 18 Entonces
        Escribir "Hace frío"
    SiNo
        Escribir "Clima agradable"
    FinSi
FinSi
\`\`\``,
              dificultad: 'intermedio',
              opciones: ['Hace calor', 'Hace frío', 'Clima agradable', '«Hace calor» y «Clima agradable»'],
              correcta: 2,
              explicacion: '30 > 30 es falso, así que va al SiNo. Allí 30 < 18 también es falso: escribe «Clima agradable». Solo se escribe una cosa.',
              errorComun: 0,
            },
          ],
        },
      ],
    },
    {
      titulo: 'Repeticiones',
      descripcion: 'Para, Mientras y Repetir: repetir un número conocido o desconocido de veces.',
      unidades: [
        {
          titulo: 'Para, Mientras y Repetir',
          descripcion: 'Elegir la estructura repetitiva adecuada y evitar ciclos infinitos.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Tres formas de repetir',
            cuerpo: `## La idea

| Estructura | Cuándo usarla | Ejemplo |
|---|---|---|
| \`Para i <- 1 Hasta n Hacer\` | Sabes **cuántas veces** repetir | Escribir la lista de 30 estudiantes |
| \`Mientras condición Hacer\` | Repites **mientras** algo se cumpla (puede ser 0 veces) | Leer números hasta que escriban 0 |
| \`Repetir ... Hasta Que condición\` | Repites **al menos una vez** hasta que algo se cumpla | Pedir la contraseña hasta que sea correcta |

\`Con Paso 2\` hace que el Para avance de 2 en 2.

## Un ejemplo

\`\`\`
Repetir
    Escribir "Escribe la contraseña"
    Leer clave
Hasta Que clave = "sinu2026"
Escribir "Bienvenido"
\`\`\`

Se pide al menos una vez; si la clave es incorrecta, se vuelve a pedir.

## Error común

**El ciclo infinito:** en un Mientras, si nada dentro del ciclo cambia la condición, nunca termina.

\`\`\`
contador <- 1
Mientras contador <= 5 Hacer
    Escribir contador
FinMientras        // ¡contador nunca cambia!
\`\`\`

Revisa siempre: ¿qué línea dentro del ciclo acerca la condición a ser falsa?

## Pruébalo

Escribe con Para el algoritmo que muestra los múltiplos de 5 hasta 50. Luego escríbelo con Mientras. ¿Cuál quedó más claro?`,
          },
          ejercicios: [
            {
              tipo: 'drag_drop',
              titulo: '¿Para o Mientras?',
              enunciado: 'Clasifica cada situación según la estructura más adecuada.',
              dificultad: 'basico',
              categorias: ['Para (sé cuántas veces)', 'Mientras o Repetir (no sé cuántas veces)'],
              elementos: [
                ['Escribir la lista de los 30 estudiantes', 0],
                ['Pedir la contraseña hasta que sea correcta', 1],
                ['Sumar las notas de los 3 cortes', 0],
                ['Lanzar un dado hasta que salga 6', 1],
                ['Escribir la tabla del 9', 0],
                ['Leer números hasta que escriban 0', 1],
              ],
              errorComun: [5],
            },
            {
              tipo: 'mcq',
              titulo: '¿Cuántas veces con Paso 2?',
              enunciado: `¿Cuántos números escribe?

\`\`\`
Para i <- 2 Hasta 10 Con Paso 2 Hacer
    Escribir i
FinPara
\`\`\``,
              dificultad: 'intermedio',
              opciones: ['4', '5', '9', '10'],
              correcta: 1,
              explicacion: 'i toma 2, 4, 6, 8 y 10: cinco valores. El 10 también se escribe porque la condición incluye el límite («Hasta 10»).',
              errorComun: 0,
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: del 1 al 5 sin ciclo infinito',
              enunciado: 'Completa el algoritmo para que escriba 1, 2, 3, 4 y 5, y **termine**.',
              dificultad: 'intermedio',
              lenguaje: 'text',
              plantilla: `contador <- 1
Mientras contador ___a___ 5 Hacer
    Escribir contador
    contador <- contador ___b___ 1
FinMientras`,
              huecos: { a: '<=', b: '+' },
              errorComun: { b: '-' },
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena: pedir la contraseña',
              enunciado: 'Ordena el algoritmo que pide la contraseña hasta que sea correcta y luego da la bienvenida.',
              dificultad: 'basico',
              pasos: [
                'Repetir',
                '    Escribir "Escribe la contraseña"',
                '    Leer clave',
                'Hasta Que clave = "sinu2026"',
                'Escribir "Bienvenido"',
              ],
              errorComun: [0, 2, 1, 3, 4],
            },
          ],
        },
      ],
    },
    {
      titulo: 'Llevar la cuenta',
      descripcion: 'Contadores, acumuladores y banderas: las variables que trabajan dentro de un ciclo.',
      unidades: [
        {
          titulo: 'Contadores, acumuladores y banderas',
          descripcion: 'Inicializar antes del ciclo, actualizar dentro y usar el resultado después.',
          dificultad: 'intermedio',
          leccion: {
            titulo: 'Las variables que llevan la cuenta',
            cuerpo: `## La idea

Dentro de un ciclo hay tres tipos de variables que usarás siempre:

| Tipo | Para qué | Cómo cambia |
|---|---|---|
| **Contador** | Contar cuántas veces pasa algo | \`aprobados <- aprobados + 1\` |
| **Acumulador** | Sumar valores | \`suma <- suma + nota\` |
| **Bandera** | Recordar si algo ocurrió (Verdadero o Falso) | \`hayReprobados <- Verdadero\` |

Las tres siguen la misma regla: **se inicializan antes del ciclo**, se actualizan dentro y se usan después.

## Un ejemplo

\`\`\`
aprobados <- 0
suma <- 0
hayReprobados <- Falso
Para i <- 1 Hasta 5 Hacer
    Leer nota
    suma <- suma + nota
    Si nota >= 3 Entonces
        aprobados <- aprobados + 1
    SiNo
        hayReprobados <- Verdadero
    FinSi
FinPara
Escribir "Aprobados: ", aprobados
Escribir "Promedio: ", suma / 5
Si hayReprobados Entonces
    Escribir "Hay estudiantes para plan de mejoramiento"
FinSi
\`\`\`

## Error común

1. **Inicializar dentro del ciclo:** en cada vuelta la variable vuelve a empezar y se pierde lo contado.
2. **Confundir contador y acumulador:** \`suma <- suma + 1\` cuenta notas, no las suma.

## Pruébalo

Haz la prueba de escritorio del ejemplo con las notas 4.0, 2.5, 3.0, 4.5 y 1.8. ¿Cuántos aprobados, qué promedio
y qué valor final tiene la bandera?`,
          },
          ejercicios: [
            {
              tipo: 'matching',
              titulo: 'Cada instrucción con su papel',
              enunciado: 'Une cada instrucción con el papel que cumple en el algoritmo.',
              dificultad: 'basico',
              parejas: [
                ['contador <- contador + 1', 'Cuenta cuántas veces pasa algo'],
                ['suma <- suma + nota', 'Acumula (suma) valores'],
                ['encontrado <- Verdadero', 'Bandera: recuerda que algo ocurrió'],
                ['contador <- 0 (antes del ciclo)', 'Inicializa: da el valor de partida'],
                ['promedio <- suma / n (después del ciclo)', 'Usa el resultado del acumulador'],
              ],
            },
            {
              tipo: 'fill_code',
              titulo: 'Completa: contar y sumar',
              enunciado: 'Completa el algoritmo para que cuente los aprobados (nota de 3 o más) y sume todas las notas.',
              dificultad: 'intermedio',
              lenguaje: 'text',
              plantilla: `aprobados <- ___a___
suma <- 0
Para i <- 1 Hasta 5 Hacer
    Leer nota
    suma <- suma + ___b___
    Si nota >= 3 Entonces
        aprobados <- aprobados + ___c___
    FinSi
FinPara`,
              huecos: { a: '0', b: 'nota', c: '1' },
              errorComun: { b: '1' },
            },
            {
              tipo: 'mcq',
              titulo: 'La bandera que se reinicia',
              enunciado: `Las notas son **4.0**, **3.5**, **2.8** y **4.2**, en ese orden. ¿Qué valor queda en *hayReprobados*?

\`\`\`
Para i <- 1 Hasta 4 Hacer
    Leer nota
    hayReprobados <- Falso
    Si nota < 3 Entonces
        hayReprobados <- Verdadero
    FinSi
FinPara
\`\`\``,
              dificultad: 'intermedio',
              opciones: ['Verdadero', 'Falso', '2.8', 'Da un error'],
              correcta: 1,
              explicacion:
                'Con 2.8 la bandera se levanta, pero en la vuelta siguiente la línea hayReprobados <- Falso la vuelve a bajar. La bandera debe inicializarse ANTES del ciclo.',
              errorComun: 0,
            },
            {
              tipo: 'ordering',
              titulo: 'Ordena: ¿alguien sacó 5.0?',
              enunciado: 'Ordena el algoritmo que averigua si algún estudiante sacó 5.0.',
              dificultad: 'intermedio',
              pasos: [
                'encontrado <- Falso',
                'Para i <- 1 Hasta n Hacer',
                '    Leer nota',
                '    Si nota = 5 Entonces',
                '        encontrado <- Verdadero',
                '    FinSi',
                'FinPara',
                'Escribir encontrado',
              ],
              errorComun: [1, 0, 2, 3, 4, 5, 6, 7],
            },
          ],
        },
      ],
    },
  ],
};
