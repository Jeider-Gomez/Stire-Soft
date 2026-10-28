# Propuesta: la parte formativa de STIRE (ejercicios, competencias y personalización)

**Origen:** la revisión del profesor Alexander Toscano del 28/10 (`docs/curso-ddse3/RETROALIMENTACION_TOSCANO_2026-10-28.md`)
y las preguntas de Jeider del mismo día: ¿el editor vacío no explica nada?, ¿qué hacemos si el estudiante no pudo?,
¿cómo usamos ecuaciones de competencias para personalizar y generar ejercicios?, ¿la forma de evaluar JavaScript nos
limita?, ¿se entiende qué debe hacer el estudiante y qué debe salir?, ¿podemos tener ejercicios breves?

**Estado:** propuesta para decidir con Jeider. Lo marcado **(ya)** se puede hacer esta semana; el resto se diseña en la
Fase 2 y se construye en la Fase 3 del plan de remodelación (`docs/PLAN_REMODELACION.md`).

---

## 1. Lo que STIRE ya tiene (para no reinventarlo)

| Pieza | Dónde | Qué hace hoy |
|---|---|---|
| «Lo que vas a usar» | `components/exercise/ConceptosEjercicio.vue` | En el panel izquierdo de cada ejercicio de programar: los conceptos que pide, con un ejemplo de otro problema y el enlace a la lección |
| Glosario | `utils/glosario.ts`, `<Termino>` | Explica palabras («dominio», «casos de prueba») donde aparecen en las lecciones |
| Errores explicados | `utils/diagnosticoSalida.ts` | Traduce la diferencia entre lo esperado y lo obtenido a palabras de estudiante («juntas los números como texto») |
| Dominio por evidencia | `src/common/utils/motor-dominio.ts` | **Ya es una ecuación:** cada casilla (tipo de pregunta × nivel) tiene una estimación de 0 a 1 que se mueve hacia la nota de cada intento, como una media móvil (Elo en sistemas adaptativos, Pelánek 2016). Aprobar a la primera llena la casilla; fallar la baja un 10 %, nunca a cero |
| Perfil de aprendizaje | `src/analytics/perfil-aprendizaje.ts` | Separa errores de concepto de descuidos, y describe si recorre en orden y qué formatos usa. **No adapta** lo que se muestra (BT-42) |
| Repetición espaciada, refuerzos, Tutor | — | Repasos con calendario; el docente asigna refuerzos; el Tutor da pistas sin dar la respuesta |

Lo que **falta** es lo que pidió el profesor: las competencias por tema, la confianza por competencia, el test inicial,
elegir el ejercicio según eso, explicar el código ahí mismo y mandar al estudiante al concepto que le falta.

## 2. ¿La forma de evaluar JavaScript nos limita?

**Cómo se evalúa hoy:** el programa del estudiante se ejecuta con una **entrada** (texto, una cosa por línea) y se
compara lo que **muestra** con `console.log` contra la salida esperada, caso por caso. La evaluación no depende de
`const`: depende de la salida.

**Lo que confunde** es la plantilla para leer la entrada:

```js
const lineas = require('fs').readFileSync(0, 'utf8').trim().split('\n');   // leer la entrada
const base = Number(lineas[0]);                                             // texto → número, posición 0
```

Son cuatro conceptos antes de empezar (constante, asignación, conversión de tipo, arreglo y posición), justo lo que vio
el profesor.

**Hallazgo (28/10): usamos arreglos antes de enseñarlos.** En Fundamentos, `lineas[0]` aparece desde la lección
«Variables y tipos de datos» (Unidad 1), con solo un comentario («primera línea»), y el ejercicio del área está en la
lección siguiente, «Operadores y expresiones». Los arreglos se explican recién en la Unidad 3 («Un cuestionario es un
algoritmo»), unas 12 lecciones después. El microcurrículo oficial del curso (FDOC-088) no menciona arreglos. Es decir:
el estudiante usa una posición de arreglo sin haberlo visto.

**Arreglo propuesto, sin cambiar el juez: leer como en PSeInt.** La plantilla trae dos funciones ya escritas y
explicadas, y el estudiante solo las llama:

```js
// STIRE lee la entrada por ti (no cambies estas líneas)
const entrada = require('fs').readFileSync(0, 'utf8').trim().split('\n'); let siguiente = 0;
function leerNumero() { return Number(entrada[siguiente++]); }
function leerTexto() { return entrada[siguiente++]; }

const base = leerNumero();     // como «Leer base» del pseudocódigo
const altura = leerNumero();
console.log(base * altura);
```

Desaparecen el arreglo, la posición y la conversión en la línea del estudiante; queda «leer, calcular, mostrar», igual
que el pseudocódigo que ya vio en la Unidad 1. `Number(...)` y `lineas[0]` se enseñan cuando toca (tipos de datos y
arreglos), con ejercicios propios. Además, se ordenan los ejercicios en una escalera:

| Peldaño | Qué escribe el estudiante | Ejemplo | ¿Necesita cambiar el juez? |
|---|---|---|---|
| 0. Sin entrada | Solo cuentas y `console.log` | «Muestra cuánto es 7 × 3» | No (caso con entrada vacía) |
| 1. Datos dados | Variables con valores fijos y la operación | `const base = 5; const altura = 3;` y mostrar el área | No |
| 2. Entrada ya leída | Solo la operación; las líneas de lectura vienen escritas y explicadas | El área con la plantilla de hoy | No |
| 2b. Leer con funciones | `leerNumero()` y la operación | El área sin arreglos | No |
| 3. Entrada completa | Lee, convierte, calcula y muestra | Los ejercicios de hoy, después de ver arreglos | No |
| (futuro) Función | `function area(base, altura) { return … }` y STIRE la llama | Como freeCodeCamp o Codewars | Sí (modo nuevo del juez) |

**Recomendación:** peldaños 0 a 2b en las Unidades 1 y 2, y el 3 después de la lección de arreglos, todo con el juez de hoy; el modo función queda para después, si la prueba con personas
muestra que leer la entrada sigue siendo la barrera.

## 3. Explicar en el panel izquierdo (aunque el editor esté vacío)

El editor a veces empieza vacío, así que la explicación va **en el panel izquierdo**, donde está el enunciado:

- **Código del enunciado y de la plantilla, tocable.** En «Así se leen los datos» (las líneas de lectura que trae la
  plantilla) y en los bloques de código del enunciado, cada pieza (`const`, `=`, `Number(…)`, `lineas[0]`,
  `console.log`) se puede tocar o pasar el mouse por encima: abre una explicación de una o dos líneas («`lineas[0]` es la
  primera línea de la entrada; las posiciones empiezan en 0») y el enlace a la lección. Teclado y celular incluidos.
- Se arma con lo que ya existe: las definiciones del glosario y los conceptos de `ConceptosEjercicio`.
- **(ya)** se puede empezar por las líneas de lectura, que son las mismas en los 29 ejercicios de programar.

## 4. Si no pudo: retroalimentación que manda a aprender, no la respuesta

Tras **dos intentos fallidos** (o al tocar «No me sale»):

1. STIRE dice **qué concepto falló**, con el diagnóstico que ya existe (por ejemplo: «juntas los números como texto»).
2. Ofrece **«Practica esto primero»**: un ejercicio breve de ese concepto (del peldaño 0 o 1) o la parte de la lección
   que lo explica, y luego **«Volver al ejercicio»** con lo que había escrito.
3. Nunca muestra la solución completa; el Tutor sigue dando pistas.

Cada diagnóstico de `diagnosticoSalida` se conecta con una competencia (sección 5), así sabemos a qué remitir.

## 5. Las competencias: un sistema aparte, pero conectado con el dominio

### 5.1 La idea pedagógica

**Resolver un ejercicio no es lo mismo que dominar la competencia.** Un estudiante puede aprobar a fuerza de intentos,
con muchas pistas del Tutor, copiando la estructura de un ejemplo o en el único contexto que practicó; y otro puede
saber algo que nunca demostró en STIRE. Por eso el profesor Toscano propone otra medida: un **test de competencias** al
inicio y una **confianza por competencia** que crece a medida que resuelve **problemas distintos** que la usan.

Los dos sistemas responden preguntas distintas y trabajan juntos:

| | Dominio (ya existe) | Competencias (nuevo) |
|---|---|---|
| Pregunta | ¿Cuánto le falta a esta lección? | ¿Qué sabe hacer, en cualquier lección? |
| Unidad | La lección | La competencia (atraviesa lecciones: la asignación se usa en todo el curso) |
| Para qué | Avanzar y abrir lo siguiente | Diagnosticar, recomendar, remitir al concepto, informar al docente |
| Evidencia | Cada intento de la lección | Solo la evidencia que **de verdad muestra** la competencia (5.3) |

Se conectan así: cada lección dice qué competencias trabaja; el intento que sube el dominio también alimenta la
competencia, pero pesado por la calidad de la evidencia; y cuando el dominio de una lección no avanza, la competencia más
baja dice **qué** practicar (sección 4).

### 5.2 De dónde salen las competencias (y por qué escala)

No las inventamos: salen del **plan de curso oficial** (FDOC-088). Fundamentos de Algoritmia tiene la competencia
COMP-203413 y un resultado de aprendizaje por unidad (RA-203413-U1: describe los conceptos fundamentales de la
algoritmia; U2: diseña e implementa algoritmos básicos con HTML5, CSS y JavaScript; U3: construye OVA). Cada RA se
descompone en **indicadores** observables, que son las competencias de STIRE. Primera versión, a revisar con los
profesores Ali y Toscano:

| RA | Indicadores (competencias en STIRE) |
|---|---|
| U1 · Describe los conceptos | Describe un algoritmo con pasos sin ambigüedad · Representa un algoritmo en pseudocódigo y diagrama · Hace la prueba de escritorio · Usa variables y tipos de datos · Arma expresiones con operadores |
| U2 · Diseña e implementa | Identifica entradas, proceso y salidas · Lee y muestra datos · Decide con condicionales · Repite con ciclos · Cuenta y acumula · Divide el problema en funciones · Responde a eventos en la página |
| U3 · Construye OVA | Guarda y recorre datos en arreglos · Programa la lógica de un cuestionario · Organiza la navegación de un recurso |

**Por qué escala:** cualquier curso de la universidad tiene su FDOC con RA. La lista vive en la **plantilla del curso**
(como hoy los contenidos de `src/seeds/cursos`); cada clase nueva la hereda al crearse, y el docente la puede ajustar.
Los ejercicios se etiquetan **una vez** en el banco y sirven para todas las clases; el Asistente genera ejercicios ya
etiquetados (competencia + nivel). Mil estudiantes no cuestan más: la confianza se calcula desde los intentos que ya se
guardan.

### 5.3 Cuándo un ejercicio cuenta como evidencia (lo que lo hace pedagógico)

Cada intento aporta **según cuánto muestra** la competencia. La confianza de la competencia *k* se mueve hacia la nota
*n* (0 a 1) de cada intento, pesada por la calidad *q* de esa evidencia:

> c<sub>k</sub> ← c<sub>k</sub> + q · α · (n − c<sub>k</sub>)

- **α**, como en el dominio: 1 si aprueba un ejercicio nuevo a la primera, 0,6 al segundo intento, 0,4 después; 0,25 si
  repite uno que ya aprobó.
- **q**, la calidad de la evidencia (de 0 a 1):
  - **Adivinó:** si antes de entregar marcó «adivino» (el juicio de confianza que ya se pregunta), vale menos
    (q = 0,3): acertar adivinando no muestra la competencia.
  - **Con ayuda del Tutor:** si pidió pistas en ese ejercicio, vale la mitad (q = 0,5). Hoy STIRE no guarda en qué
    ejercicio se pidió cada pista; hay que empezar a guardarlo (parte 5).
  - **Contexto nuevo:** aprobar la competencia en un problema distinto vale más que repetir el mismo tipo; el segundo
    ejercicio parecido seguido vale la mitad.
  - **Comprobación y repaso:** el test inicial, los ejercicios breves de comprobación y los repasos espaciados (los
    resuelve solo, días después) valen completo (q = 1).

**Niveles que ve el estudiante** (no un porcentaje que parezca nota):

| Nivel | Cuándo |
|---|---|
| Sin evidencia | Todavía no ha trabajado esa competencia |
| En desarrollo | Confianza por debajo de 0,6 |
| Lograda | Confianza de 0,6 o más **y** evidencia en al menos **2 ejercicios distintos de 2 tipos** (por ejemplo, leer código en opción múltiple y escribirlo) |
| Afianzada | Lograda **y** un repaso aprobado sin ayuda **7 días o más** después |

Así, aprobar un ejercicio con ayuda nunca da «Lograda»: hace falta mostrarlo en otro problema y sostenerlo en el tiempo
(la repetición espaciada que ya existe sirve justo para esto).

### 5.4 Para qué sirve a cada uno

- **Estudiante:** «Mis competencias», con su nivel y «practica esta» en la más baja; cuando un ejercicio no le sale, STIRE
  le dice qué competencia le falta y lo manda a practicarla (sección 4).
- **Docente:** qué competencias le cuestan a la clase y a quién; desde ahí asigna un refuerzo de esa competencia.
- **STIRE:** elige el siguiente ejercicio de la lección por la competencia más baja y su nivel (en desarrollo → básico,
  lograda → intermedio, afianzada → avanzado o reto); y el Asistente genera ejercicios de una competencia y un nivel, que
  el juez comprueba antes de mostrarlos (P15).

### 5.5 Controlable por el docente

Como todo lo del docente en STIRE, es opcional y ajustable (Ajustes de la clase):
- Encender o apagar las competencias en la clase, y si recomiendan ejercicios o solo informan.
- Editar la lista heredada del curso (agregar, quitar, renombrar) y las etiquetas de sus ejercicios.
- Marcar a mano el nivel de un estudiante («lo demostró en clase»), que cuenta como evidencia de comprobación.
- Activar o no el test inicial.

**Estilos (decidido el 28/10):** se cubren todos, en los ejercicios y en las explicaciones. Ver la sección 5b.

### 5.5b Que sirva a cualquier curso y no se imponga (revisado el 28/10)

Jeider no quiere un software que imponga su modelo, sino uno que el docente adapte y controle, y que sirva también para
cursos sin programación o de frameworks. Por eso el sistema de competencias es **genérico**:

- **Apagado por defecto.** El docente lo enciende en Ajustes de la clase y elige el modo: «solo informar» (ve el mapa,
  nadie recibe recomendaciones) o «recomendar» (STIRE sugiere el siguiente ejercicio). El dominio por lección sigue
  igual, con o sin competencias.
- **La lista la pone el docente**, partiendo de lo que prefiera:
  1. Una **plantilla** de la biblioteca (Fundamentos de Algoritmia, Pensamiento algorítmico y las que se agreguen, por
     ejemplo un curso de frameworks).
  2. **Su plan de curso** (FDOC u otro): sube el PDF o pega los resultados de aprendizaje y el Asistente propone los
     indicadores.
  3. **Copiar** la de otra clase suya o de un colega.
  4. **Escribirla** a mano, o dejarla vacía.
- **Cualquier tipo de evidencia cuenta**, no solo programar: opción múltiple, unir, ordenar, clasificar, completar,
  programar, HTML/CSS y las **entregas que el docente califica con rúbrica** (que sirven para cursos sin juez
  automático, como diseño o escritura). Lo único propio de programación es el juez, y es opcional.
- **Etiquetar es asistido, no obligatorio:** el Asistente propone las competencias de cada ejercicio y el docente
  acepta o cambia. Un ejercicio sin etiqueta simplemente no cuenta para competencias.
- **Las reglas de la ecuación son ajustables** con valores por defecto, como hoy las del dominio: desde qué confianza
  es «lograda», cuántos ejercicios distintos pide, cuántos días para «afianzada», cuánto pesa adivinar o pedir pistas.
- **El docente siempre manda:** puede marcar a mano el nivel de un estudiante, quitar una evidencia o apagar las
  recomendaciones para alguien.

### 5.6 ¿Es viable o nos estamos saturando?

**Viable, por partes y sin cargar al equipo:**

| Parte | Costo | Por qué |
|---|---|---|
| 1. Indicadores de Fundamentos (desde el FDOC) y etiquetas en los ejercicios de los cursos | Bajo | Son datos en `src/seeds/cursos`; los arma Claude y los revisan Jeider y los profesores |
| 2. Confianza y niveles calculados, solo para ver | Bajo | Una función pura sobre lo que ya se guarda (intentos, número de intento, repasos, «adivino»), como el perfil de aprendizaje: sin migración, y con historial desde el primer día |
| 3. «Mis competencias» y la vista del docente | Medio | Pantallas nuevas; se diseñan en la Fase 2 con las demás |
| 4. Recomendar el siguiente ejercicio y remitir al concepto | Medio | Necesita suficientes ejercicios breves por competencia |
| 5. Test inicial, ajustes del docente (modo, lista, plantillas, copiar, reglas), pistas por ejercicio y Asistente por competencia | Medio-alto | Ejercicios breves nuevos, validación con los profesores y migración para guardar los ajustes y en qué ejercicio se pidió cada pista |

**Lo que satura** es meterlo todo mientras el equipo hace la evaluación heurística, la prueba con personas y la
verificación. Propuesta: el equipo no recibe tareas nuevas por esto; las partes 1 y 2 desde el lunes 2/11, la 3 en el
diseño de la Fase 2, y la 4 y la 5 en la Fase 3, con lo que digan la prueba con personas y los profesores.

## 5b. Varias formas de aprender: en las explicaciones y en los ejercicios (decidido el 28/10)

Jeider quiere cubrir los distintos estilos (más visual, más lector, más de escuchar, más de hacer). Para que sea
**pedagógico y con fundamento**, no se adivina el «estilo» de nadie ni se le esconde nada: cada lección y cada ejercicio
vienen en **varias representaciones**, el estudiante **elige** la que le sirve, STIRE **recuerda su preferencia** y la
pone primero, y mide si le va mejor. Esto sí tiene evidencia: aprender con varias representaciones de la misma idea
(texto con diagrama, código con su ejecución paso a paso) ayuda a todos (principio multimedia de Mayer; codificación
dual). Así se cubre lo que pidió Toscano sin chocar con BT-42.

| Representación | En la explicación | En el ejercicio | ¿Ya existe? |
|---|---|---|---|
| Leer | El texto de la lección | El enunciado con su molde | Sí |
| Ver | Diagrama de flujo y la **ejecución paso a paso** con el valor de cada variable | Versión con diagrama o con prueba de escritorio | En parte (`AlgoritmoMultiformato`, `PasoAlgoritmo`) |
| Escuchar | «Escuchar la lección» | El enunciado leído en voz alta | En parte (`EscucharLeccion`) |
| Hacer | Ejemplo en vivo que se puede cambiar y correr | Ordenar, completar, arrastrar antes de escribir | Sí (los 7 tipos) |
| Otra forma | Explicación alternativa (analogía o paso a paso) | Un parecido más fácil | Sí (alternativas del Asistente, parecidos) |

**Cómo se ve:** arriba de la lección, «Verla como: Texto · Diagrama · Paso a paso · Escuchar». STIRE abre la última que
eligió el estudiante. El docente genera con el Asistente las que falten («haz el diagrama y el paso a paso de esta
lección») y decide cuáles publica. El perfil de aprendizaje (BT-45) ya registra qué formatos usa; se le suma si le fue
mejor con cada uno, y eso va a la tesis.

## 6. Que quede claro qué se pide y qué debe salir

Todo enunciado de programar sigue el mismo molde (el del área ya lo cumple):

- **Recibes:** qué llega y en qué línea («línea 1: la base; línea 2: la altura»).
- **Debes mostrar:** qué, en qué orden y en cuántas líneas.
- **Ejemplo:** una entrada y su salida exacta.

Una prueba revisa que los ejercicios de los cursos cumplan el molde, y el Asistente lo usa al generar. **(ya)** se puede
revisar los 29 ejercicios de programar con esa prueba.

## 7. Ejercicios breves en los cursos

Cada lección de programación con la escalera (P14), de lo breve a lo complejo:

1. 2 o 3 de **opción múltiple breves**, un concepto cada uno («¿qué muestra `console.log(2 + '3')`?»).
2. 1 de **completar** una sola línea.
3. 1 de **programar breve** (peldaño 0 o 1).
4. 1 de **programar con entrada** (peldaño 2 o 3).
5. 1 **complejo** opcional (reto).

Hoy los cursos tienen 59 de opción múltiple, 31 de completar, 31 de ordenar, 25 de clasificar, 19 de unir, 29 de
programar y 9 de HTML/CSS; faltan sobre todo los breves de los peldaños 0 y 1.

## 8. Orden propuesto

| Cuándo | Qué | Pendiente |
|---|---|---|
| Esta semana **(ya)** | Repaso sin rojo · líneas de lectura tocables · prueba del molde de enunciados | P38, P37, P35 |
| Desde el 2/11 | Leer con `leerNumero()` en las Unidades 1 y 2 · competencias etiquetadas · confianza calculada (solo ver) | P35, P39 |
| Fase 2 (diseño) | Competencias revisadas con Ali y Toscano · «Mis competencias» · «Practica esto primero» · test inicial | P36, P39 |
| Fase 3 | Elegir el siguiente por competencia · ejercicios breves en los cursos · Asistente por competencia | P14, P15, P39 |
| Después de la prueba con personas | Modo función del juez, si leer la entrada sigue siendo la barrera | nuevo |
