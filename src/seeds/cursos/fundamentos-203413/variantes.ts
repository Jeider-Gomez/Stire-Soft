import { Ejercicio, LEER_ENTRADA } from '../tipos';

/**
 * Ejercicios hermanos (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.2): para cada casilla (tipo × nivel) de una unidad que
 * tenía un solo ejercicio, otro del mismo tipo, nivel y concepto, con otros datos. El recomendador los usa para
 * reintentos y repasos, para que el estudiante no repita la misma respuesta memorizada. Se agregan a su unidad por el
 * título (ver `conVariantes` en ../tipos.ts); la prueba de cursos exige que ninguna casilla quede con un solo ejercicio.
 */
const prog = (cuerpo: string) => LEER_ENTRADA + cuerpo;

export const variantesFundamentos: Record<string, Ejercicio[]> = {
  'Algoritmos en la vida diaria': [
    {
      tipo: 'ordering',
      titulo: 'Ordena el algoritmo para cambiar una bombilla',
      enunciado: 'Pon los pasos en el orden en que deben ejecutarse para cambiar una bombilla dañada sin peligro.',
      dificultad: 'basico',
      pasos: [
        'Apagar el interruptor de la luz',
        'Esperar a que la bombilla se enfríe',
        'Desenroscar la bombilla dañada',
        'Enroscar la bombilla nueva',
        'Encender el interruptor para probarla',
      ],
      errorComun: [0, 2, 1, 3, 4],
    },
    {
      tipo: 'drag_drop',
      titulo: '¿Precisa o ambigua? En la cocina',
      enunciado:
        'Clasifica cada instrucción de una receta. Es **precisa** si cualquier persona (o un computador) la ejecutaría exactamente igual.',
      dificultad: 'basico',
      categorias: ['Instrucción precisa', 'Instrucción ambigua'],
      elementos: [
        ['Hierve el agua durante 3 minutos', 0],
        ['Cocina hasta que esté bien', 1],
        ['Agrega 2 tazas de arroz', 0],
        ['Echa bastante aceite', 1],
        ['Si el agua se secó, agrega media taza', 0],
        ['Revuelve de vez en cuando', 1],
      ],
      errorComun: [5],
    },
  ],

  'Pseudocódigo y diagramas de flujo': [
    {
      tipo: 'matching',
      titulo: 'Las palabras del pseudocódigo',
      enunciado: 'Une cada palabra del pseudocódigo con lo que hace.',
      dificultad: 'basico',
      parejas: [
        ['Leer', 'Recibe un dato del usuario'],
        ['Escribir', 'Muestra un resultado'],
        ['<-', 'Guarda un valor en una variable'],
        ['Si … Entonces', 'Decide entre dos caminos'],
        ['FinAlgoritmo', 'Marca el final del algoritmo'],
      ],
    },
    {
      tipo: 'ordering',
      titulo: 'Precio total en pseudocódigo',
      enunciado: 'Ordena las líneas del pseudocódigo que calcula cuánto se paga por varias unidades de un producto.',
      dificultad: 'basico',
      pasos: ['Algoritmo PrecioTotal', 'Leer precio', 'Leer cantidad', 'total <- precio * cantidad', 'Escribir total', 'FinAlgoritmo'],
      errorComun: [0, 3, 1, 2, 4, 5],
    },
    {
      tipo: 'mcq',
      titulo: 'Prueba de escritorio: el descuento',
      enunciado:
        'Haz la **prueba de escritorio**: ejecuta el algoritmo a mano, línea por línea, y anota en una tabla cuánto vale cada variable después de cada paso. La flecha `<-` quiere decir «guarda en»: calcula lo de la derecha y lo guarda en la variable de la izquierda.\n\n```\nLeer precio\ndescuento <- precio * 10 / 100\nprecio <- precio - descuento\nEscribir precio\n```\n\nEl precio leído es **2000**. Completa la tabla (en tu cuaderno o mentalmente):\n\n| Paso | precio | descuento |\n|---|---|---|\n| Leer precio | 2000 | (sin valor) |\n| descuento <- precio * 10 / 100 | 2000 | ? |\n| precio <- precio - descuento | ? | ? |\n\n¿Qué escribe al final?',
      dificultad: 'basico',
      opciones: ['1800', '200', '2000', '1990'],
      correcta: 0,
      explicacion:
        'El descuento es 2000 × 10 / 100 = 200. Luego precio <- 2000 − 200 = 1800, y eso es lo que se escribe. 200 es el descuento, no lo que se escribe.',
      errorComun: 1,
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa: área de un rectángulo',
      enunciado: 'Completa el pseudocódigo que lee la base y la altura de un rectángulo y escribe su área (base × altura).',
      dificultad: 'basico',
      lenguaje: 'text',
      plantilla:
        'Algoritmo AreaRectangulo\n    ___a___ base\n    Leer altura\n    area <- base ___b___ altura\n    ___c___ area\nFinAlgoritmo',
      huecos: {
        a: { regex: 'leer', ejemplo: 'Leer' },
        b: '*',
        c: { regex: 'escribir|imprimir|mostrar', ejemplo: 'Escribir' },
      },
      errorComun: { a: 'Escribir', b: '+' },
    },
  ],

  'Variables y tipos de datos': [
    {
      tipo: 'drag_drop',
      titulo: '¿Qué tipo de dato es?',
      enunciado: 'Ubica cada valor de JavaScript en su tipo de dato. Lo que va entre comillas siempre es texto.',
      dificultad: 'basico',
      categorias: ['Número (number)', 'Texto (string)', 'Lógico (boolean)'],
      elementos: [
        ['0', 0],
        ['-7.25', 0],
        ['"true"', 1],
        ['""', 1],
        ['false', 2],
        ['"3.14"', 1],
        ['1000', 0],
      ],
      errorComun: [2],
    },
    {
      tipo: 'mcq',
      titulo: '¿Se puede cambiar una variable con let?',
      enunciado: '¿Qué ocurre al ejecutar este código?\n\n```js\nlet ciudad = "Montería";\nciudad = "Lorica";\nconsole.log(ciudad);\n```',
      dificultad: 'basico',
      opciones: ['Escribe Montería', 'Escribe Lorica', 'Escribe MonteríaLorica', 'Da un error: no se puede cambiar una variable'],
      correcta: 1,
      explicacion:
        'Una variable declarada con let sí se puede reasignar: la segunda línea reemplaza «Montería» por «Lorica». El error aparece solo si se declara con const.',
      errorComun: 3,
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa el precio del almuerzo',
      enunciado: 'Completa el código para que escriba exactamente `El almuerzo cuesta 12000 pesos`.',
      dificultad: 'basico',
      lenguaje: 'javascript',
      plantilla: 'const plato = "almuerzo";\nlet precio = ___a___;\nconsole.log("El " + plato + " cuesta " + ___b___ + " pesos");',
      huecos: { a: '12000', b: 'precio' },
      errorComun: { b: '"precio"' },
    },
    {
      tipo: 'coding',
      titulo: '¿Dónde vive?',
      enunciado:
        'Lee un **nombre** (primera línea) y una **ciudad** (segunda línea) y escribe:\n\n```\n<nombre> vive en <ciudad>.\n```\n\n**Ejemplo:** con `Ana` y `Montería` la salida es `Ana vive en Montería.`\n\nRevisa los espacios y el punto final.',
      dificultad: 'basico',
      inicial: prog('const nombre = lineas[0];\nconst ciudad = lineas[1];\n\n// Escribe la frase con console.log\n'),
      solucion: prog('const nombre = lineas[0];\nconst ciudad = lineas[1];\nconsole.log(nombre + " vive en " + ciudad + ".");\n'),
      casos: [
        { entrada: 'Ana\nMontería', salida: 'Ana vive en Montería.', publico: true },
        { entrada: 'Luis Pérez\nCereté', salida: 'Luis Pérez vive en Cereté.', publico: false },
        { entrada: 'Sofía\nSan Pelayo', salida: 'Sofía vive en San Pelayo.', publico: false },
      ],
      errorComun: prog('const nombre = lineas[0];\nconst ciudad = lineas[1];\nconsole.log(nombre + "vive en" + ciudad);\n'),
    },
  ],

  'Operadores y expresiones': [
    {
      tipo: 'matching',
      titulo: '¿Cuánto vale? Otra ronda',
      enunciado: 'Une cada expresión de JavaScript con su resultado. Recuerda que * y / van antes que + y −.',
      dificultad: 'basico',
      parejas: [
        ['9 % 4', '1'],
        ['8 / 5', '1.6'],
        ['10 - 2 * 3', '4'],
        ['(10 - 2) * 3', '24'],
        ['Math.floor(9 / 4)', '2'],
      ],
    },
    {
      tipo: 'mcq',
      titulo: 'Operadores lógicos: ¿hay clase?',
      enunciado:
        'Hay clase si es día hábil **y** no es festivo.\n\n```js\nlet diaHabil = true;\nlet festivo = true;\nconsole.log(diaHabil && !festivo);\n```\n\n¿Qué escribe el programa?',
      dificultad: 'basico',
      opciones: ['true', 'false', 'Da un error', 'undefined'],
      correcta: 1,
      explicacion: '!festivo es false porque festivo es true. Con && (y) las dos partes deben ser verdaderas: true && false da false.',
      errorComun: 0,
    },
    {
      tipo: 'coding',
      titulo: 'Área y perímetro de un cuadrado',
      enunciado:
        'Lee el **lado** de un cuadrado y escribe en dos líneas:\n\n1. El área (lado × lado).\n2. El perímetro (4 × lado).\n\n**Ejemplo:** con `3` la salida es:\n\n```\n9\n12\n```',
      dificultad: 'basico',
      inicial: prog('const lado = Number(lineas[0]);\n\n// Calcula y escribe el área y el perímetro\n'),
      solucion: prog('const lado = Number(lineas[0]);\nconsole.log(lado * lado);\nconsole.log(4 * lado);\n'),
      casos: [
        { entrada: '3', salida: '9\n12', publico: true },
        { entrada: '5', salida: '25\n20', publico: false },
        { entrada: '2.5', salida: '6.25\n10', publico: false },
      ],
      errorComun: prog('const lado = lineas[0];\nconsole.log(lado * lado);\nconsole.log(lado + lado + lado + lado);\n'),
    },
    {
      tipo: 'coding',
      titulo: 'De segundos a minutos',
      enunciado:
        'Lee una cantidad de **segundos** y escríbela en minutos y segundos con el formato `M min S s`.\n\n**Ejemplo:** con `125` la salida es `2 min 5 s`.\n\nPista: `Math.floor` y el operador `%`.',
      dificultad: 'intermedio',
      inicial: prog('const segundos = Number(lineas[0]);\n\n// Calcula los minutos completos y los segundos que sobran\n'),
      solucion: prog(
        'const segundos = Number(lineas[0]);\nconst minutos = Math.floor(segundos / 60);\nconst resto = segundos % 60;\nconsole.log(minutos + " min " + resto + " s");\n',
      ),
      casos: [
        { entrada: '125', salida: '2 min 5 s', publico: true },
        { entrada: '60', salida: '1 min 0 s', publico: false },
        { entrada: '59', salida: '0 min 59 s', publico: false },
        { entrada: '3600', salida: '60 min 0 s', publico: false },
      ],
      errorComun: prog(
        'const segundos = Number(lineas[0]);\nconst minutos = segundos / 60;\nconst resto = segundos % 60;\nconsole.log(minutos + " min " + resto + " s");\n',
      ),
    },
  ],

  'Mi primera página HTML': [
    {
      tipo: 'ordering',
      titulo: 'Ordena el menú con un enlace',
      enunciado: 'Ordena las líneas para formar una lista con un enlace dentro de su elemento. Fíjate en qué etiqueta va dentro de cuál.',
      dificultad: 'basico',
      pasos: ['<ul>', '<li>', '<a href="#lunes">Lunes</a>', '</li>', '</ul>'],
      errorComun: [0, 2, 1, 3, 4],
    },
    {
      tipo: 'matching',
      titulo: 'Cada atributo con su uso',
      enunciado: 'Une cada atributo de HTML con lo que indica.',
      dificultad: 'basico',
      parejas: [
        ['href', 'A dónde lleva un enlace'],
        ['src', 'El archivo de una imagen'],
        ['alt', 'El texto que describe una imagen'],
        ['lang', 'El idioma de la página'],
        ['id', 'Un nombre único para un elemento'],
      ],
    },
    {
      tipo: 'mcq',
      titulo: '¿Cuál cierra bien la lista?',
      enunciado: '¿Cuál de estas líneas de HTML abre y cierra las etiquetas en el orden correcto?',
      dificultad: 'basico',
      opciones: ['<ul><li>Uno</li><li>Dos</ul></li>', '<ul><li>Uno</li><li>Dos</li></ul>', '<li><ul>Uno</ul></li>', '<ul><li>Uno<li>Dos</ul>'],
      correcta: 1,
      explicacion: 'Cada <li> se cierra antes de abrir el siguiente, y el </ul> va al final porque la lista contiene a sus elementos.',
      errorComun: 0,
    },
    {
      tipo: 'html_css',
      titulo: 'Página de mi materia favorita',
      enunciado:
        'Construye una página sobre tu materia favorita. Debe tener:\n\n- un título principal `<h1>`,\n- **al menos dos** párrafos `<p>`,\n- una lista **numerada** `<ol>` con **al menos tres** elementos `<li>` (por ejemplo, tus pasos para estudiar).\n\nMira el resultado en la vista previa mientras escribes.',
      dificultad: 'basico',
      htmlInicial: '<!-- Escribe aquí la estructura de la página -->\n',
      cssInicial: '',
      solucion: {
        html:
          '<h1>Mi materia favorita: Algoritmia</h1>\n<p>Me gusta porque aprendo a resolver problemas paso a paso.</p>\n<p>Estos son mis pasos para estudiar:</p>\n<ol>\n  <li>Leer la lección</li>\n  <li>Hacer los ejercicios</li>\n  <li>Repasar mis errores</li>\n</ol>',
        css: '',
      },
      reglas: [
        { id: 'titulo', label: 'Hay un título principal <h1>', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'h1' } },
        { id: 'parrafos', label: 'Hay al menos dos párrafos <p>', isPublic: true, weight: 1, check: { kind: 'element_count', selector: 'p', min: 2 } },
        {
          id: 'lista',
          label: 'La lista <ol> tiene al menos tres <li>',
          hint: 'Cada <li> va dentro de <ol>…</ol>.',
          isPublic: true,
          weight: 2,
          check: { kind: 'element_count', selector: 'ol > li', min: 3 },
        },
        { id: 'un-h1', label: 'Hay un solo título principal', isPublic: false, weight: 1, check: { kind: 'a11y', check: 'single_h1' } },
      ],
      errorComun: {
        html:
          '<h1>Mi materia favorita: Algoritmia</h1>\n<p>Me gusta porque aprendo a resolver problemas paso a paso.</p>\n<p>Estos son mis pasos para estudiar:</p>\n<li>Leer la lección</li>\n<li>Hacer los ejercicios</li>\n<li>Repasar mis errores</li>',
        css: '',
      },
    },
  ],

  'Reparar una página con errores': [
    {
      tipo: 'drag_drop',
      titulo: '¿Bien escrito o con error?',
      enunciado: 'Clasifica cada fragmento de HTML.',
      dificultad: 'basico',
      categorias: ['Está bien', 'Tiene un error'],
      elementos: [
        ['<h1>Mi OVA</h1>', 0],
        ['<a>Ir a MDN</a> (sin href)', 1],
        ['<p>Texto<p> (el párrafo no se cierra)', 1],
        ['<img src="logo.png" alt="Logo de la Universidad de Córdoba">', 0],
        ['<ol><li>Paso 1</li></ol>', 0],
        ['<strong><em>Clave</strong></em>', 1],
      ],
      errorComun: [1],
    },
    {
      tipo: 'mcq',
      titulo: 'Depurar: el enlace no lleva a ningún lado',
      enunciado:
        'El enlace «Guía del curso» se ve como texto normal y al hacer clic no pasa nada. Siguiendo el método de depuración, ¿qué revisas primero?',
      dificultad: 'basico',
      opciones: [
        'Si la etiqueta <a> tiene el atributo href.',
        'Cambiar el color del texto del enlace.',
        'Borrar toda la página y empezar de nuevo.',
        'Agregar más enlaces a la página.',
      ],
      correcta: 0,
      explicacion:
        'El síntoma apunta a una sola sospecha: un enlace sin href no lleva a ningún lado y se ve como texto. Se revisa eso primero, antes de cambiar otras cosas.',
      errorComun: 2,
    },
    {
      tipo: 'html_css',
      titulo: 'Repara la página de la biblioteca',
      enunciado:
        'Esta página tiene **cuatro errores**. Encuéntralos y corrígelos:\n\n1. Hay **dos** títulos `<h1>`: deja uno solo (el segundo puede ser `<h2>`).\n2. Los pasos están en `<li>` **sin** su lista numerada `<ol>`.\n3. La imagen no tiene `alt`.\n4. El enlace no tiene `href`.',
      dificultad: 'intermedio',
      htmlInicial:
        '<h1>Biblioteca de la Universidad</h1>\n<h1>Cómo pedir un libro</h1>\n<li>Busca el libro en el catálogo</li>\n<li>Anota su código</li>\n<li>Pídelo en el mostrador</li>\n<img src="biblioteca.jpg">\n<a>Catálogo en línea</a>',
      cssInicial: '',
      solucion: {
        html:
          '<h1>Biblioteca de la Universidad</h1>\n<h2>Cómo pedir un libro</h2>\n<ol>\n  <li>Busca el libro en el catálogo</li>\n  <li>Anota su código</li>\n  <li>Pídelo en el mostrador</li>\n</ol>\n<img src="biblioteca.jpg" alt="Sala de lectura de la biblioteca">\n<a href="https://www.unicordoba.edu.co">Catálogo en línea</a>',
        css: '',
      },
      reglas: [
        { id: 'un-h1', label: 'Hay un solo <h1>', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'single_h1' } },
        { id: 'lista', label: 'Los tres pasos están dentro de un <ol>', isPublic: true, weight: 1, check: { kind: 'element_count', selector: 'ol > li', min: 3 } },
        { id: 'alt', label: 'La imagen tiene texto alternativo (alt)', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'img_alt' } },
        { id: 'enlace', label: 'El enlace tiene href', isPublic: true, weight: 1, check: { kind: 'attribute', selector: 'a', name: 'href', mode: 'exists' } },
        { id: 'imagen', label: 'La imagen sigue en la página', isPublic: false, weight: 1, check: { kind: 'element_exists', selector: 'img' } },
      ],
      errorComun: {
        html:
          '<h1>Biblioteca de la Universidad</h1>\n<h2>Cómo pedir un libro</h2>\n<ol>\n  <li>Busca el libro en el catálogo</li>\n  <li>Anota su código</li>\n  <li>Pídelo en el mostrador</li>\n</ol>\n<img src="biblioteca.jpg">\n<a>Catálogo en línea</a>',
        css: '',
      },
    },
  ],

  'Entradas, proceso y salidas': [
    {
      tipo: 'drag_drop',
      titulo: 'Entradas, proceso y salida: el promedio',
      enunciado: '*«Calcula el promedio de dos notas y di si el estudiante aprobó (3.0 o más).»*\n\nClasifica cada parte del problema.',
      dificultad: 'basico',
      categorias: ['Entrada', 'Proceso', 'Salida'],
      elementos: [
        ['Primera nota', 0],
        ['Segunda nota', 0],
        ['promedio = (nota1 + nota2) / 2', 1],
        ['Comparar el promedio con 3.0', 1],
        ['Mensaje «Aprobó» o «Reprobó»', 2],
      ],
      errorComun: [2],
    },
    {
      tipo: 'mcq',
      titulo: 'Prueba de escritorio: cuatro asignaciones',
      enunciado: 'Haz la **prueba de escritorio**: ejecuta el algoritmo a mano, línea por línea, y anota en una tabla cuánto vale cada variable después de cada paso. La flecha `<-` quiere decir «guarda en»: calcula lo de la derecha y lo guarda en la variable de la izquierda. Una columna para **x** y otra para **y**:\n\n```\nx <- 2\ny <- x * 3\nx <- y - x\ny <- x + y\n```\n\n¿Cuánto valen **x** y **y** al final?',
      dificultad: 'basico',
      opciones: ['x = 4, y = 10', 'x = 2, y = 6', 'x = 4, y = 6', 'x = 6, y = 10'],
      correcta: 0,
      explicacion: 'y <- 2 × 3 = 6; luego x <- 6 − 2 = 4; al final y <- 4 + 6 = 10. Cada línea usa los valores que dejó la anterior.',
      errorComun: 2,
    },
    {
      tipo: 'ordering',
      titulo: 'Ordena el algoritmo del vuelto',
      enunciado: 'Ordena el pseudocódigo que calcula el vuelto de una compra.',
      dificultad: 'basico',
      pasos: ['Algoritmo Vuelto', 'Leer precio, pago', 'vuelto <- pago - precio', 'Escribir vuelto', 'FinAlgoritmo'],
      errorComun: [0, 2, 1, 3, 4],
    },
    {
      tipo: 'coding',
      titulo: 'Puntos en el torneo',
      enunciado:
        'En el torneo interfacultades cada partido ganado da **3 puntos** y cada empate **1 punto**.\n\nLee los partidos ganados (primera línea) y los empatados (segunda línea) y escribe los puntos del equipo.\n\n**Ejemplo:** con `2` y `1` la salida es `7`.',
      dificultad: 'basico',
      inicial: prog('const ganados = Number(lineas[0]);\nconst empatados = Number(lineas[1]);\n\n// Calcula y escribe los puntos\n'),
      solucion: prog('const ganados = Number(lineas[0]);\nconst empatados = Number(lineas[1]);\nconsole.log(3 * ganados + empatados);\n'),
      casos: [
        { entrada: '2\n1', salida: '7', publico: true },
        { entrada: '0\n0', salida: '0', publico: false },
        { entrada: '5\n3', salida: '18', publico: false },
      ],
      errorComun: prog('const ganados = lineas[0];\nconst empatados = lineas[1];\nconsole.log(3 * ganados + empatados);\n'),
    },
  ],

  'Decidir con if y else': [
    {
      tipo: 'mcq',
      titulo: 'El valor del límite: votar',
      enunciado:
        '¿Qué escribe este programa?\n\n```js\nlet edad = 18;\nif (edad > 18) {\n  console.log("Puede votar");\n} else {\n  console.log("Aún no puede votar");\n}\n```',
      dificultad: 'basico',
      opciones: ['Puede votar', 'Aún no puede votar', 'No escribe nada', 'Da un error'],
      correcta: 1,
      explicacion: '18 > 18 es falso: 18 no es mayor que 18. Por eso entra al else. Para incluir a quien tiene 18 la condición debe ser edad >= 18.',
      errorComun: 0,
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa: ¿positivo o no?',
      enunciado: 'Completa el programa para que escriba `positivo` si el número es mayor que cero, o `cero o negativo` en otro caso.',
      dificultad: 'basico',
      lenguaje: 'javascript',
      plantilla: 'const n = Number(lineas[0]);\nif (n ___a___ 0) {\n  console.log("positivo");\n} ___b___ {\n  console.log("cero o negativo");\n}',
      huecos: { a: '>', b: 'else' },
      errorComun: { a: '>=' },
    },
    {
      tipo: 'coding',
      titulo: '¿Mayor o menor de edad?',
      enunciado: 'Lee una edad y escribe `Mayor de edad` si es **18 o más**, o `Menor de edad` en otro caso.\n\n**Ejemplo:** con `18` la salida es `Mayor de edad`.',
      dificultad: 'basico',
      inicial: prog('const edad = Number(lineas[0]);\n\n// Decide si es mayor de edad\n'),
      solucion: prog('const edad = Number(lineas[0]);\nif (edad >= 18) {\n  console.log("Mayor de edad");\n} else {\n  console.log("Menor de edad");\n}\n'),
      casos: [
        { entrada: '18', salida: 'Mayor de edad', publico: true },
        { entrada: '17', salida: 'Menor de edad', publico: true },
        { entrada: '30', salida: 'Mayor de edad', publico: false },
        { entrada: '0', salida: 'Menor de edad', publico: false },
      ],
      errorComun: prog('const edad = Number(lineas[0]);\nif (edad > 18) {\n  console.log("Mayor de edad");\n} else {\n  console.log("Menor de edad");\n}\n'),
    },
    {
      tipo: 'coding',
      titulo: 'Boletas de cine en miércoles',
      enunciado:
        'Cada boleta de cine cuesta **$12000**. Los miércoles se paga **la mitad**.\n\nLee el número de boletas (primera línea) y `si` o `no` (segunda línea, ¿es miércoles?). Escribe el total a pagar.\n\n**Ejemplo:** con `2` y `si` la salida es `12000`.',
      dificultad: 'intermedio',
      inicial: prog('const boletas = Number(lineas[0]);\nconst miercoles = lineas[1].trim();\n\n// Calcula el total, con o sin el descuento del miércoles\n'),
      solucion: prog(
        'const boletas = Number(lineas[0]);\nconst miercoles = lineas[1].trim();\nlet total = boletas * 12000;\nif (miercoles === "si") {\n  total = total / 2;\n}\nconsole.log(total);\n',
      ),
      casos: [
        { entrada: '2\nsi', salida: '12000', publico: true },
        { entrada: '2\nno', salida: '24000', publico: true },
        { entrada: '3\nsi', salida: '18000', publico: false },
        { entrada: '1\nno', salida: '12000', publico: false },
      ],
      errorComun: prog('const boletas = Number(lineas[0]);\nlet total = boletas * 12000;\ntotal = total / 2;\nconsole.log(total);\n'),
    },
  ],

  'Varios caminos con else if': [
    {
      tipo: 'ordering',
      titulo: 'Ordena el clima según la temperatura',
      enunciado: 'Ordena las líneas para que el programa escriba `Calor` desde 30 °C, `Templado` desde 20 °C y `Frío` por debajo de 20 °C.',
      dificultad: 'intermedio',
      pasos: ['if (temp >= 30) {', '  console.log("Calor");', '} else if (temp >= 20) {', '  console.log("Templado");', '} else {', '  console.log("Frío");', '}'],
      errorComun: [2, 3, 0, 1, 4, 5, 6],
    },
    {
      tipo: 'mcq',
      titulo: 'Condiciones en desorden: el clima',
      enunciado:
        'Un compañero escribió:\n\n```js\nif (temp >= 20) {\n  console.log("Templado");\n} else if (temp >= 30) {\n  console.log("Calor");\n} else {\n  console.log("Frío");\n}\n```\n\n¿Qué escribe con una temperatura de **35**?',
      dificultad: 'intermedio',
      opciones: ['Calor', 'Templado', 'Frío', 'No escribe nada'],
      correcta: 1,
      explicacion:
        '35 >= 20 es verdadero, así que entra en el primer bloque y escribe «Templado»; las demás condiciones ya no se revisan. La condición más exigente (>= 30) debe ir primero.',
      errorComun: 0,
    },
    {
      tipo: 'coding',
      titulo: 'Tarifa del bus según la edad',
      enunciado:
        'Lee una edad y escribe la tarifa del bus: `Gratis` (menos de 5 años), `Estudiante` (5 a 17), `Completa` (18 a 59) o `Adulto mayor` (60 o más).\n\n**Ejemplo:** con `30` la salida es `Completa`.',
      dificultad: 'intermedio',
      inicial: prog('const edad = Number(lineas[0]);\n\n// Escribe la tarifa\n'),
      solucion: prog(
        'const edad = Number(lineas[0]);\nif (edad < 5) {\n  console.log("Gratis");\n} else if (edad < 18) {\n  console.log("Estudiante");\n} else if (edad < 60) {\n  console.log("Completa");\n} else {\n  console.log("Adulto mayor");\n}\n',
      ),
      casos: [
        { entrada: '30', salida: 'Completa', publico: true },
        { entrada: '4', salida: 'Gratis', publico: false },
        { entrada: '5', salida: 'Estudiante', publico: false },
        { entrada: '17', salida: 'Estudiante', publico: false },
        { entrada: '18', salida: 'Completa', publico: false },
        { entrada: '60', salida: 'Adulto mayor', publico: false },
      ],
      errorComun: prog(
        'const edad = Number(lineas[0]);\nif (edad < 5) {\n  console.log("Gratis");\n} else if (edad >= 5) {\n  console.log("Estudiante");\n} else if (edad >= 18) {\n  console.log("Completa");\n} else {\n  console.log("Adulto mayor");\n}\n',
      ),
    },
    {
      tipo: 'coding',
      titulo: '¿Qué triángulo es?',
      enunciado:
        'Lee las longitudes de tres lados (una por línea).\n\n- Si con ellos **no** se puede formar un triángulo (la suma de dos lados cualesquiera debe ser **mayor** que el tercero), escribe `no es triángulo`.\n- Si se puede, escribe `equilátero` (tres lados iguales), `isósceles` (exactamente dos iguales) o `escaleno` (ninguno igual).\n\n**Ejemplos:** `3 3 3` es equilátero; `3 4 5` es escaleno; `1 2 3` no es triángulo.',
      dificultad: 'avanzado',
      inicial: prog('const a = Number(lineas[0]);\nconst b = Number(lineas[1]);\nconst c = Number(lineas[2]);\n\n// Primero revisa si es un triángulo; luego clasifícalo\n'),
      solucion: prog(
        'const a = Number(lineas[0]);\nconst b = Number(lineas[1]);\nconst c = Number(lineas[2]);\nif (a + b <= c || a + c <= b || b + c <= a) {\n  console.log("no es triángulo");\n} else if (a === b && b === c) {\n  console.log("equilátero");\n} else if (a === b || b === c || a === c) {\n  console.log("isósceles");\n} else {\n  console.log("escaleno");\n}\n',
      ),
      casos: [
        { entrada: '3\n3\n3', salida: 'equilátero', publico: true },
        { entrada: '3\n4\n5', salida: 'escaleno', publico: true },
        { entrada: '5\n5\n8', salida: 'isósceles', publico: false },
        { entrada: '1\n2\n3', salida: 'no es triángulo', publico: false },
        { entrada: '8\n5\n8', salida: 'isósceles', publico: false },
        { entrada: '2\n10\n3', salida: 'no es triángulo', publico: false },
      ],
      errorComun: prog(
        'const a = Number(lineas[0]);\nconst b = Number(lineas[1]);\nconst c = Number(lineas[2]);\nif (a === b && b === c) {\n  console.log("equilátero");\n} else if (a === b || b === c || a === c) {\n  console.log("isósceles");\n} else {\n  console.log("escaleno");\n}\n',
      ),
    },
  ],

  'Repetir con for y while': [
    {
      tipo: 'mcq',
      titulo: '¿Cuántas veces se repite? Desde 1',
      enunciado: '¿Cuántas veces se escribe «Hola»?\n\n```js\nfor (let i = 1; i <= 3; i++) {\n  console.log("Hola");\n}\n```',
      dificultad: 'basico',
      opciones: ['2 veces', '3 veces', '4 veces', 'Ninguna vez'],
      correcta: 1,
      explicacion: 'i toma los valores 1, 2 y 3: son 3 valores. Cuando i llega a 4, la condición i <= 3 es falsa y el ciclo termina.',
      errorComun: 2,
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa: los pares hasta 20',
      enunciado: 'Completa el ciclo para que escriba los números pares **desde 2 hasta 20**, incluido el 20, avanzando de 2 en 2.',
      dificultad: 'basico',
      lenguaje: 'javascript',
      plantilla: 'for (let i = 2; i ___a___ 20; i ___b___ 2) {\n  console.log(i);\n}',
      huecos: { a: '<=', b: '+=' },
      errorComun: { a: '<' },
    },
  ],

  'Contadores y acumuladores': [
    {
      tipo: 'mcq',
      titulo: 'Prueba de escritorio del contador',
      enunciado:
        '¿Qué escribe este programa?\n\n```js\nlet c = 0;\nfor (let i = 1; i <= 10; i++) {\n  if (i % 3 === 0) {\n    c++;\n  }\n}\nconsole.log(c);\n```',
      dificultad: 'basico',
      opciones: ['3', '10', '18', '9'],
      correcta: 0,
      explicacion: 'c cuenta cuántos múltiplos de 3 hay entre 1 y 10: 3, 6 y 9. Son 3. 18 sería la suma de esos números, no cuántos hay.',
      errorComun: 2,
    },
    {
      tipo: 'ordering',
      titulo: 'Ordena el conteo de aprobados',
      enunciado: 'Ordena el pseudocódigo que cuenta cuántos de n estudiantes aprobaron (3.0 o más).',
      dificultad: 'intermedio',
      pasos: [
        'Leer n',
        'aprobados <- 0',
        'Para i <- 1 Hasta n Hacer',
        '    Leer nota',
        '    Si nota >= 3.0 Entonces',
        '        aprobados <- aprobados + 1',
        '    FinSi',
        'FinPara',
        'Escribir aprobados',
      ],
      errorComun: [0, 2, 1, 3, 4, 5, 6, 7, 8],
    },
    {
      tipo: 'coding',
      titulo: 'Suma de los pares hasta n',
      enunciado: 'Lee un número **n** y escribe la suma de los números **pares** entre 1 y n (incluido n si es par).\n\n**Ejemplo:** con `10` la salida es `30` (2 + 4 + 6 + 8 + 10).',
      dificultad: 'basico',
      inicial: prog('const n = Number(lineas[0]);\n\n// Usa un acumulador\n'),
      solucion: prog('const n = Number(lineas[0]);\nlet suma = 0;\nfor (let i = 1; i <= n; i++) {\n  if (i % 2 === 0) {\n    suma = suma + i;\n  }\n}\nconsole.log(suma);\n'),
      casos: [
        { entrada: '10', salida: '30', publico: true },
        { entrada: '1', salida: '0', publico: false },
        { entrada: '7', salida: '12', publico: false },
        { entrada: '0', salida: '0', publico: false },
      ],
      errorComun: prog('const n = Number(lineas[0]);\nlet suma = 0;\nfor (let i = 1; i < n; i++) {\n  if (i % 2 === 0) {\n    suma = suma + i;\n  }\n}\nconsole.log(suma);\n'),
    },
    {
      tipo: 'coding',
      titulo: 'Ventas del día',
      enunciado:
        'La primera línea trae **n**, el número de ventas de una tienda. Luego vienen n valores, uno por línea.\n\nEscribe dos líneas:\n\n```\nTotal: T\nVentas mayores a 50000: K\n```\n\ndonde T es la suma de todas las ventas y K cuántas fueron **mayores** que 50000.\n\n**Ejemplo:** con `4`, `20000`, `60000`, `50000`, `75000` la salida es `Total: 205000` y `Ventas mayores a 50000: 2`.',
      dificultad: 'intermedio',
      inicial: prog('const n = Number(lineas[0]);\n\n// Un acumulador para el total y un contador para las ventas grandes\n'),
      solucion: prog(
        'const n = Number(lineas[0]);\nlet total = 0;\nlet grandes = 0;\nfor (let i = 1; i <= n; i++) {\n  const venta = Number(lineas[i]);\n  total = total + venta;\n  if (venta > 50000) {\n    grandes++;\n  }\n}\nconsole.log("Total: " + total);\nconsole.log("Ventas mayores a 50000: " + grandes);\n',
      ),
      casos: [
        { entrada: '4\n20000\n60000\n50000\n75000', salida: 'Total: 205000\nVentas mayores a 50000: 2', publico: true },
        { entrada: '2\n10000\n5000', salida: 'Total: 15000\nVentas mayores a 50000: 0', publico: false },
        { entrada: '3\n50001\n100000\n49999', salida: 'Total: 200000\nVentas mayores a 50000: 2', publico: false },
      ],
      errorComun: prog(
        'const n = Number(lineas[0]);\nlet total = 0;\nlet grandes = 0;\nfor (let i = 1; i <= n; i++) {\n  const venta = Number(lineas[i]);\n  total = total + venta;\n  if (venta >= 50000) {\n    grandes++;\n  }\n}\nconsole.log("Total: " + total);\nconsole.log("Ventas mayores a 50000: " + grandes);\n',
      ),
    },
  ],

  'Crear y usar funciones': [
    {
      tipo: 'mcq',
      titulo: 'La función sin argumento',
      enunciado: '¿Qué escribe este programa?\n\n```js\nfunction saludo(nombre) {\n  return "Hola, " + nombre;\n}\nconsole.log(saludo());\n```',
      dificultad: 'intermedio',
      opciones: ['Hola, ', 'Hola, undefined', 'Da un error', 'undefined'],
      correcta: 1,
      explicacion:
        'La función espera un parámetro, pero se llamó sin argumento: nombre queda con el valor undefined, y "Hola, " + undefined da «Hola, undefined». JavaScript no da error por eso.',
      errorComun: 2,
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa: perímetro de un rectángulo',
      enunciado: 'Completa la función para que **devuelva** el perímetro de un rectángulo: 2 × (base + altura).',
      dificultad: 'intermedio',
      lenguaje: 'javascript',
      plantilla: 'function perimetro(base, ___a___) {\n  ___b___ 2 * (base + altura);\n}\nconsole.log(perimetro(3, 4)); // 14',
      huecos: { a: 'altura', b: 'return' },
      errorComun: { b: 'console.log' },
    },
  ],

  'El DOM y los eventos': [
    {
      tipo: 'matching',
      titulo: 'Eventos y propiedades',
      enunciado: 'Une cada evento o instrucción con lo que significa.',
      dificultad: 'basico',
      parejas: [
        ['"click"', 'Cuando hacen clic'],
        ['"input"', 'Cada vez que cambia lo escrito en un campo'],
        ['"submit"', 'Cuando se envía un formulario'],
        ['evento.preventDefault()', 'Evita la acción normal del navegador'],
        ['elemento.style.color', 'Cambia el color desde JavaScript'],
      ],
    },
    {
      tipo: 'ordering',
      titulo: 'Ordena el conversor de temperatura',
      enunciado: 'Ordena las líneas para que, al hacer clic en el botón, la página convierta los grados Celsius escritos a Fahrenheit.',
      dificultad: 'intermedio',
      pasos: [
        'const boton = document.getElementById("convertir");',
        'boton.addEventListener("click", () => {',
        '  const c = Number(campo.value);',
        '  const f = c * 9 / 5 + 32;',
        '  resultado.textContent = f + " °F";',
        '});',
      ],
      errorComun: [1, 0, 2, 3, 4, 5],
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa el botón de sumar',
      enunciado: 'Completa el código para que, al hacer clic, la página muestre la **suma** de los dos números escritos (no los pegue como texto).',
      dificultad: 'intermedio',
      lenguaje: 'javascript',
      plantilla:
        'boton.addEventListener("___a___", () => {\n  const a = Number(campoA.value);\n  const b = ___b___(campoB.value);\n  salida.textContent = a + b;\n});',
      huecos: { a: 'click', b: 'Number' },
      errorComun: { b: 'String' },
    },
    {
      tipo: 'mcq',
      titulo: '¿Qué muestra textContent?',
      enunciado: '¿Qué ve el usuario en la página?\n\n```js\nsalida.textContent = "<b>Hola</b>";\n```',
      dificultad: 'basico',
      opciones: ['Hola, en negrita', 'El texto <b>Hola</b> tal cual, con las etiquetas', 'Nada', 'Da un error'],
      correcta: 1,
      explicacion:
        'textContent pone texto, no HTML: las etiquetas se muestran tal cual. Es lo más seguro para mostrar lo que escribe un usuario.',
      errorComun: 0,
    },
  ],

  'Dar estilo con CSS': [
    {
      tipo: 'matching',
      titulo: 'Cada selector con lo que elige',
      enunciado: 'Une cada selector de CSS con los elementos a los que aplica.',
      dificultad: 'basico',
      parejas: [
        ['p', 'Todos los párrafos'],
        ['.nota', 'Los elementos con class="nota"'],
        ['#menu', 'El elemento con id="menu"'],
        ['nav a', 'Los enlaces que están dentro del nav'],
        ['h1, h2', 'Los títulos h1 y h2'],
      ],
    },
    {
      tipo: 'mcq',
      titulo: 'El selector de id',
      enunciado: 'Tienes `<nav id="menu">`. ¿Qué selector de CSS le aplica estilo?',
      dificultad: 'basico',
      opciones: ['menu { }', '.menu { }', '#menu { }', 'id.menu { }'],
      correcta: 2,
      explicacion: 'Los id se seleccionan con numeral: #menu. El punto es para clases, y sin símbolo se busca una etiqueta llamada menu.',
      errorComun: 1,
    },
    {
      tipo: 'html_css',
      titulo: 'Tarjetas de temas con estilo',
      enunciado:
        'Construye tres tarjetas de temas con:\n\n- **tres** `<article class="tarjeta">`, cada una con su título `<h3>` y un párrafo `<p>`.\n\nY dales estilo: las tarjetas deben tener `padding: 16px` y los títulos `text-align: center`.',
      dificultad: 'intermedio',
      htmlInicial: '<article class="tarjeta">\n  <h3>Variables</h3>\n  <p>Guardan datos para usarlos después.</p>\n</article>\n<!-- Agrega dos tarjetas más -->\n',
      cssInicial: '.tarjeta {\n  border: 1px solid #ccc;\n  border-radius: 8px;\n  margin-bottom: 12px;\n}\n',
      solucion: {
        html:
          '<article class="tarjeta">\n  <h3>Variables</h3>\n  <p>Guardan datos para usarlos después.</p>\n</article>\n<article class="tarjeta">\n  <h3>Condicionales</h3>\n  <p>Deciden qué camino seguir.</p>\n</article>\n<article class="tarjeta">\n  <h3>Ciclos</h3>\n  <p>Repiten un bloque de instrucciones.</p>\n</article>',
        css: '.tarjeta {\n  border: 1px solid #ccc;\n  border-radius: 8px;\n  margin-bottom: 12px;\n  padding: 16px;\n}\nh3 {\n  text-align: center;\n}',
      },
      reglas: [
        { id: 'tres', label: 'Hay tres tarjetas (article.tarjeta)', isPublic: true, weight: 2, check: { kind: 'element_count', selector: 'article.tarjeta', equals: 3 } },
        { id: 'titulos', label: 'Cada tarjeta tiene su título h3', isPublic: true, weight: 1, check: { kind: 'element_count', selector: 'article.tarjeta > h3', min: 3 } },
        { id: 'relleno', label: 'Las tarjetas tienen padding de 16px', isPublic: true, weight: 1, check: { kind: 'css_property', selector: 'article.tarjeta', property: 'padding-top', oneOf: ['16px'] } },
        { id: 'centrado', label: 'Los títulos están centrados', isPublic: true, weight: 1, check: { kind: 'css_property', selector: 'article.tarjeta > h3', property: 'text-align', oneOf: ['center'] } },
        { id: 'parrafos', label: 'Cada tarjeta tiene un párrafo', isPublic: false, weight: 1, check: { kind: 'element_count', selector: 'article.tarjeta > p', min: 3 } },
      ],
      errorComun: {
        html:
          '<article class="tarjeta">\n  <h3>Variables</h3>\n  <p>Guardan datos para usarlos después.</p>\n</article>\n<article class="tarjeta">\n  <h3>Condicionales</h3>\n  <p>Deciden qué camino seguir.</p>\n</article>\n<article class="tarjeta">\n  <h3>Ciclos</h3>\n  <p>Repiten un bloque de instrucciones.</p>\n</article>',
        css: 'tarjeta {\n  padding: 16px;\n}\nh3 {\n  text-align: center;\n}',
      },
    },
  ],

  '¿Qué es un OVA y qué lo hace bueno?': [
    {
      tipo: 'drag_drop',
      titulo: 'Las partes de un OVA sobre variables',
      enunciado: 'Un OVA sobre variables tiene estos elementos. Ubica cada uno en el componente al que pertenece.',
      dificultad: 'basico',
      categorias: ['Contenido', 'Actividad de aprendizaje', 'Contextualización y metadatos'],
      elementos: [
        ['Explicación de qué es una variable, con ejemplos', 0],
        ['Infografía sobre los tipos de datos', 0],
        ['Ejercicio de completar código con retroalimentación', 1],
        ['Cuestionario final de cinco preguntas', 1],
        ['Objetivo: «Declarar variables con let y const»', 2],
        ['Ficha con autor, licencia y palabras clave', 2],
      ],
      errorComun: [3],
    },
    {
      tipo: 'ordering',
      titulo: 'Las fases del OVA, con un ejemplo',
      enunciado: 'Un docente diseña un OVA sobre variables. Ordena lo que hace en cada fase (modelo basado en ADDIE).',
      dificultad: 'basico',
      pasos: [
        'Analizar: descubre que sus estudiantes confunden let y const',
        'Diseñar: define el objetivo, una lección corta y tres ejercicios',
        'Desarrollar: escribe el HTML, el CSS y el JavaScript del OVA',
        'Implementar: lo usa en clase con el grupo',
        'Evaluar: recoge opiniones y corrige lo que confundió',
      ],
      errorComun: [1, 0, 2, 3, 4],
    },
  ],

  'La lógica de un cuestionario': [
    {
      tipo: 'mcq',
      titulo: 'La última posición de una lista',
      enunciado: '¿Qué escribe este programa?\n\n```js\nconst notas = [4.5, 3.0, 2.8];\nconsole.log(notas[notas.length - 1]);\n```',
      dificultad: 'basico',
      opciones: ['2.8', '4.5', 'undefined', '3'],
      correcta: 0,
      explicacion: 'notas.length es 3, así que notas.length - 1 es 2: la última posición, que guarda 2.8. El 3 es el tamaño de la lista, no un elemento.',
      errorComun: 3,
    },
    {
      tipo: 'fill_code',
      titulo: 'Completa: el promedio de la lista',
      enunciado: 'Completa el ciclo que recorre **todas** las notas y las suma para calcular el promedio.',
      dificultad: 'intermedio',
      lenguaje: 'javascript',
      plantilla: 'let suma = 0;\nfor (let i = 0; i < notas.___a___; i++) {\n  suma = suma ___b___ notas[i];\n}\nconsole.log(suma / notas.length);',
      huecos: { a: 'length', b: '+' },
      errorComun: { a: 'size' },
    },
    {
      tipo: 'coding',
      titulo: 'Contar respuestas en blanco',
      enunciado:
        'La primera línea trae la **clave** del cuestionario y la segunda las **respuestas** del estudiante, separadas por espacios. Un guion `-` significa que dejó la pregunta **en blanco**.\n\nEscribe tres líneas:\n\n```\nCorrectas: X\nIncorrectas: Y\nEn blanco: Z\n```\n\nUna respuesta en blanco **no** cuenta como incorrecta.\n\n**Ejemplo:** con `a b c d` y `a - c b` la salida es `Correctas: 2`, `Incorrectas: 1` y `En blanco: 1`.',
      dificultad: 'intermedio',
      inicial: prog('const clave = lineas[0].trim().split(" ");\nconst respuestas = lineas[1].trim().split(" ");\n\n// Cuenta correctas, incorrectas y en blanco\n'),
      solucion: prog(
        'const clave = lineas[0].trim().split(" ");\nconst respuestas = lineas[1].trim().split(" ");\nlet correctas = 0;\nlet incorrectas = 0;\nlet enBlanco = 0;\nfor (let i = 0; i < clave.length; i++) {\n  if (respuestas[i] === "-") {\n    enBlanco++;\n  } else if (respuestas[i] === clave[i]) {\n    correctas++;\n  } else {\n    incorrectas++;\n  }\n}\nconsole.log("Correctas: " + correctas);\nconsole.log("Incorrectas: " + incorrectas);\nconsole.log("En blanco: " + enBlanco);\n',
      ),
      casos: [
        { entrada: 'a b c d\na - c b', salida: 'Correctas: 2\nIncorrectas: 1\nEn blanco: 1', publico: true },
        { entrada: 'a b c\n- - -', salida: 'Correctas: 0\nIncorrectas: 0\nEn blanco: 3', publico: false },
        { entrada: 'd d\nd d', salida: 'Correctas: 2\nIncorrectas: 0\nEn blanco: 0', publico: false },
      ],
      errorComun: prog(
        'const clave = lineas[0].trim().split(" ");\nconst respuestas = lineas[1].trim().split(" ");\nlet correctas = 0;\nlet incorrectas = 0;\nlet enBlanco = 0;\nfor (let i = 0; i < clave.length; i++) {\n  if (respuestas[i] === clave[i]) {\n    correctas++;\n  } else {\n    incorrectas++;\n  }\n}\nconsole.log("Correctas: " + correctas);\nconsole.log("Incorrectas: " + incorrectas);\nconsole.log("En blanco: " + enBlanco);\n',
      ),
    },
    {
      tipo: 'coding',
      titulo: 'Las preguntas que hay que repasar',
      enunciado:
        'Con la clave (primera línea) y las respuestas (segunda línea), escribe **una sola línea** con los números de las preguntas falladas, separados por coma y espacio:\n\n```\nFalladas: 2, 4\n```\n\nLas preguntas se numeran desde **1**. Si no falló ninguna, escribe `Falladas: ninguna`.\n\n**Ejemplo:** con `b a c d` y `b c c a` la salida es `Falladas: 2, 4`.',
      dificultad: 'avanzado',
      inicial: prog('const clave = lineas[0].trim().split(" ");\nconst respuestas = lineas[1].trim().split(" ");\n\n// Junta los números de las preguntas falladas\n'),
      solucion: prog(
        'const clave = lineas[0].trim().split(" ");\nconst respuestas = lineas[1].trim().split(" ");\nconst falladas = [];\nfor (let i = 0; i < clave.length; i++) {\n  if (respuestas[i] !== clave[i]) {\n    falladas.push(i + 1);\n  }\n}\nif (falladas.length === 0) {\n  console.log("Falladas: ninguna");\n} else {\n  console.log("Falladas: " + falladas.join(", "));\n}\n',
      ),
      casos: [
        { entrada: 'b a c d\nb c c a', salida: 'Falladas: 2, 4', publico: true },
        { entrada: 'a b\na b', salida: 'Falladas: ninguna', publico: false },
        { entrada: 'c\na', salida: 'Falladas: 1', publico: false },
      ],
      errorComun: prog(
        'const clave = lineas[0].trim().split(" ");\nconst respuestas = lineas[1].trim().split(" ");\nconst falladas = [];\nfor (let i = 0; i < clave.length; i++) {\n  if (respuestas[i] !== clave[i]) {\n    falladas.push(i);\n  }\n}\nif (falladas.length === 0) {\n  console.log("Falladas: ninguna");\n} else {\n  console.log("Falladas: " + falladas.join(", "));\n}\n',
      ),
    },
  ],

  'Estructura y navegación de un OVA': [
    {
      tipo: 'matching',
      titulo: 'Lo que va en la cabecera',
      enunciado: 'Une cada etiqueta de la cabecera de una página con para qué sirve.',
      dificultad: 'basico',
      parejas: [
        ['<title>', 'El nombre en la pestaña del navegador'],
        ['<meta charset="utf-8">', 'Permite escribir tildes y eñes'],
        ['<link rel="stylesheet">', 'Conecta la hoja de estilos'],
        ['<script src="app.js">', 'Carga el archivo de JavaScript'],
        ['<html lang="es">', 'Declara el idioma de la página'],
      ],
    },
    {
      tipo: 'mcq',
      titulo: 'El enlace para volver al inicio',
      enunciado: 'Al final de un OVA quieres un enlace que lleve de vuelta a `<header id="inicio">`. ¿Cuál funciona?',
      dificultad: 'basico',
      opciones: ['<a href="inicio">Volver</a>', '<a href="#inicio">Volver</a>', '<a id="#inicio">Volver</a>', '<a href=".inicio">Volver</a>'],
      correcta: 1,
      explicacion: 'Un enlace interno lleva numeral y el id del destino: href="#inicio". Sin numeral, el navegador busca otra página llamada «inicio».',
      errorComun: 0,
    },
    {
      tipo: 'html_css',
      titulo: 'El menú de un OVA de fracciones',
      enunciado:
        'Construye la página de un OVA sobre fracciones. Debe tener:\n\n- idioma declarado en `<html lang="es">` y un `<title>`;\n- un `<header>` con el título `<h1>`;\n- un `<nav>` con **al menos cuatro** enlaces internos (`href="#..."`);\n- un `<main>` con **al menos cuatro** `<section>` que tengan `id`;\n- un `<footer>`.',
      dificultad: 'intermedio',
      htmlInicial: '<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n  <!-- Construye aquí el OVA -->\n</body>\n</html>\n',
      cssInicial: '',
      solucion: {
        html:
          '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <title>OVA: Fracciones</title>\n</head>\n<body>\n  <header><h1>Aprende fracciones</h1></header>\n  <nav>\n    <a href="#que-es">¿Qué es?</a>\n    <a href="#ejemplos">Ejemplos</a>\n    <a href="#practica">Práctica</a>\n    <a href="#evaluacion">Evaluación</a>\n  </nav>\n  <main>\n    <section id="que-es"><h2>¿Qué es una fracción?</h2></section>\n    <section id="ejemplos"><h2>Ejemplos</h2></section>\n    <section id="practica"><h2>Práctica</h2></section>\n    <section id="evaluacion"><h2>Evaluación</h2></section>\n  </main>\n  <footer>Licencia CC BY-SA 4.0</footer>\n</body>\n</html>',
        css: '',
      },
      reglas: [
        { id: 'idioma', label: 'La página declara su idioma (lang)', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'html_lang' } },
        { id: 'titulo-doc', label: 'La página tiene <title>', isPublic: true, weight: 1, check: { kind: 'a11y', check: 'document_title' } },
        { id: 'encabezado', label: 'El <header> tiene el título <h1>', isPublic: true, weight: 1, check: { kind: 'element_exists', selector: 'header h1' } },
        {
          id: 'menu',
          label: 'El <nav> tiene al menos cuatro enlaces internos',
          hint: 'Los enlaces internos empiezan con #, por ejemplo href="#practica".',
          isPublic: true,
          weight: 2,
          check: { kind: 'element_count', selector: 'nav a[href^="#"]', min: 4 },
        },
        { id: 'secciones', label: 'El <main> tiene al menos cuatro <section> con id', isPublic: true, weight: 2, check: { kind: 'element_count', selector: 'main section[id]', min: 4 } },
        { id: 'pie', label: 'Hay un <footer>', isPublic: false, weight: 1, check: { kind: 'element_exists', selector: 'footer' } },
      ],
      errorComun: {
        html:
          '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <title>OVA: Fracciones</title>\n</head>\n<body>\n  <header><h1>Aprende fracciones</h1></header>\n  <nav>\n    <a href="que-es">¿Qué es?</a>\n    <a href="ejemplos">Ejemplos</a>\n    <a href="practica">Práctica</a>\n    <a href="evaluacion">Evaluación</a>\n  </nav>\n  <main>\n    <section id="que-es"><h2>¿Qué es una fracción?</h2></section>\n    <section id="ejemplos"><h2>Ejemplos</h2></section>\n    <section id="practica"><h2>Práctica</h2></section>\n    <section id="evaluacion"><h2>Evaluación</h2></section>\n  </main>\n  <footer>Licencia CC BY-SA 4.0</footer>\n</body>\n</html>',
        css: '',
      },
    },
  ],
};
