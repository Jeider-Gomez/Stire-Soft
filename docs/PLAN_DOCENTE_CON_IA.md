---
estado: propuesta (23/10/2026), con decisiones pendientes de Jeider (sección 3)
origen: pedido de Jeider del 23/10 («la parte del docente todavía no es intuitiva; que todo lo pueda crear con IA,
  editarlo a mano o seguir con la IA») y revisión con capturas en producción (cuenta de prueba de Laura)
complementa: docs/PLAN_MEJORAS_2026-10-23.md (ejercicios personalizados para el estudiante, punto 4)
---

# El docente con IA: crear, editar a mano y seguir con la IA

## 1. Lo que vi al usar STIRE como docente (23/10)

Revisé el flujo con la cuenta de prueba de Laura, en producción:
- crear una clase;
- «Contenido» de la clase;
- abrir una lección y editar su explicación;
- «Nuevo ejercicio»;
- «Asignar un refuerzo».

| # | Hallazgo | Por qué confunde |
|---|---|---|
| H1 | Las palabras no coinciden. Dentro de una **lección** aparece «LECCIONES (1)» con el botón «Explicación», y la ventana que se abre se titula «Lecciones» pero lista **explicaciones**. | El docente no sabe si está creando una lección o una explicación. |
| H2 | El lápiz de la lección solo cambia el título, la descripción, el nivel y la posición. El contenido está dos clics más adentro: desplegar la lección, abrir la ventana «Lecciones» y tocar el lápiz de la explicación. | Lo más importante es lo más escondido. |
| H3 | El editor de la explicación es **Markdown crudo** (`##`, `**`, tres comillas invertidas). La vista previa ayuda, pero el docente escribe símbolos. | Un docente de otra área no conoce Markdown. |
| H4 | Todo pasa en ventanas encima de ventanas, dentro de un árbol largo de módulos, temas y lecciones. | Se pierde el contexto y cuesta volver. |
| H5 | «Nuevo ejercicio» está bien guiado: tipo, contenido, revisar y publicar. Pero hay que llenar cada campo a mano, incluidos los casos de prueba de «Programar». | Es el paso más lento de todo el curso. |
| H6 | En los ejemplos para leer la entrada, el estudiante ve `require('fs').readFileSync(0, 'utf8').trim().split('\n')`. | Es parte de por qué los ejercicios se sienten difíciles: el estudiante se traba antes de llegar al problema. |
| H7 | «Asignar un refuerzo» es claro, y «Proponer un mensaje» ya ayuda. Pero los pasos (explicación, recurso, ejercicio) se arman desde cero. | El refuerzo llega tarde porque cuesta prepararlo. |

## 2. La idea

En cada lugar donde el docente crea algo, tres caminos que se pueden mezclar:

1. **Crear con la IA.** Escribe qué quiere en una frase («una lección de condicionales con un ejemplo de notas»), o la IA
   parte de lo que ya existe en la lección.
2. **Editar a mano**, en el mismo editor de siempre.
3. **Seguir con la IA** sobre lo que ya hay: «hazlo más sencillo», «agrega un error común», «cambia el ejemplo a algo de
   fútbol». La IA propone el cambio, el docente ve la diferencia y lo acepta o no.

**Reglas:**
- Nada de lo que hace la IA se publica solo. Llega como **borrador** y el docente decide. Es la regla de siempre: las
  funciones del docente son opcionales y las sugerencias se pueden editar.
- Lo generado lleva la marca «Hecho con IA»; después pasa a «revisado por el docente». Eso sirve para la transparencia
  y es un dato para el artículo: cuánto se generó, cuánto se editó y cuánto se descartó.
- A la IA nunca se le mandan datos personales de estudiantes, solo contenido del curso y cifras de la clase sin nombres.

## 3. Decisiones que tienes que tomar

| # | Decisión | Opciones | Recomiendo |
|---|---|---|---|
| D1 | ¿Con qué clave trabaja la IA del docente? | a) La clave gratuita de Gemini del propio docente, como hace el estudiante con el Tutor. b) Una clave de STIRE en el servidor. | **a.** Cero cobros. El docente es mayor de edad y usa la IA para su trabajo, así que se ajusta a los términos de Gemini. Con b), STIRE pagaría o se quedaría sin cupo. |
| D2 | ¿Dónde empezamos? | Estructura del curso, explicación de la lección, ejercicios o refuerzos. | **Explicación y ejercicios de una lección.** Es lo que más tiempo le quita al docente, y los ejercicios se validan solos en el juez. |
| D3 | ¿Cómo se escribe una explicación? | a) Editor visual (negrita con un botón, sin símbolos). b) **Secciones con nombre**: «La idea», «Un ejemplo», «Error común» y «Pruébalo», cada una con su cuadro de texto visual. c) Dejar el Markdown. | **b.** La plantilla de lección ya usa esas secciones. Guía al docente que no sabe por dónde empezar, y la IA puede llenar o rehacer una sola sección. |
| D4 | ¿Cómo se organiza la pantalla? | a) Mantener ventanas sobre el árbol. b) **Una página por lección** con pestañas: Explicación, Ejercicios y Ajustes. | **b.** El árbol queda como índice: tocar una lección abre su página. Se acaban las ventanas encima de ventanas (H2, H4). |
| D5 | ¿Cómo se llaman las cosas? | Hoy: módulo → tema → lección → explicaciones y ejercicios. | Mantener la jerarquía y **cambiar las palabras de la interfaz** (H1): dentro de una lección, «Explicaciones» y «Ejercicios», nunca «Lecciones». |
| D6 | ¿La IA genera ejercicios de «Programar»? | a) Sí, con la solución y los casos de prueba validados en el juez antes de guardarlos. b) Solo los tipos que no ejecutan código. | **a.** Si la solución de la IA no pasa sus propios casos, el ejercicio no se guarda. |
| D7 | ¿Leer la entrada sin `require('fs')`? (H6) | a) Una función `leer()` ya escrita en el editor del estudiante. b) Dejarlo. | **a.** Baja la dificultad de todos los ejercicios de programar sin cambiar el juez. Los ejercicios existentes se pueden migrar con un script. |
| D8 | ¿Crear la clase con IA desde el microcurrículo? | Subir el PDF (por ejemplo el FDOC-088 de Fundamentos) y que la IA proponga módulos, temas y lecciones. | Sí, pero en una fase posterior. Las plantillas ya cubren lo básico. |

## 4. Cómo se ve cada parte

### 4.1 La página de la lección (D3, D4, D5)

- **Pestaña «Explicación».** Las cuatro secciones, una debajo de otra, cada una con su cuadro de texto visual, y la
  vista previa al lado como hoy. Arriba, «Escribir con IA». En cada sección, «Pedirle un cambio a la IA».
- **Pestaña «Ejercicios».**
  - la lista de ejercicios, con la guía «Para que sea una buena lección» que ya existe;
  - «Nuevo ejercicio», que sigue igual;
  - «Generar ejercicios con IA»: el docente elige cuántos, de qué tipos y de qué niveles, y los revisa en una lista
    donde puede aceptar, editar o descartar cada uno.
- **Pestaña «Ajustes».** Título, descripción, nivel, posición y cómo ayuda el Tutor: lo que hoy está en el lápiz.

### 4.2 Ejercicios con IA (D6)

1. La IA recibe la explicación de la lección, el nivel y los tipos pedidos.
2. Devuelve un JSON con el mismo formato que usan hoy los constructores de ejercicios, que el servidor valida.
3. Para «Programar» y «Completar código», STIRE ejecuta la solución de referencia en el juez y descarta lo que no pasa.
4. Los aceptados quedan en el banco de la clase marcados como «Hecho con IA». Este mismo motor sirve después para los
   ejercicios personalizados del estudiante (PLAN_MEJORAS, punto 4).

### 4.3 Refuerzos con IA

En «Asignar un refuerzo», «Proponer los pasos con IA» toma el error de concepto que más se repite en esa lección (sin
nombres) y propone:
- una explicación distinta;
- un ejemplo resuelto;
- dos ejercicios más fáciles.

Cada paso se edita o se quita, igual que hoy.

### 4.4 Estructura del curso con IA (D8, después)

El docente describe la asignatura o sube el microcurrículo. La IA propone módulos, temas y lecciones con sus resultados
de aprendizaje. Todo queda **oculto** hasta que el docente lo publique: «Ocultar» y «Publicado» ya existen.

## 5. Cómo se construye

- **Backend:** un módulo `asistente-docente` que reutiliza el cifrado de claves del Tutor
  (`src/tutor/tutor-credential.service.ts`). Las rutas son solo para el rol docente:

  | Ruta | Para qué |
  |---|---|
  | `POST /asistente/explicacion` | Generar la explicación |
  | `POST /asistente/ajustar` | Aplicar una instrucción a lo que ya hay |
  | `POST /asistente/ejercicios` | Generar ejercicios |
  | `POST /asistente/refuerzo` | Proponer un refuerzo |

  - Gemini responde con un esquema JSON fijo (`responseSchema`), y el servidor valida cada respuesta con DTOs antes de
    devolverla.
  - Los ejercicios de código pasan por el juez.
  - Las rutas devuelven el borrador; guardar sigue siendo lo de siempre.
- **Frontend:**
  - la página de lección con pestañas;
  - el editor por secciones, en un editor visual con licencia libre (TipTap, MIT);
  - la vista de diferencias para «Pedirle un cambio a la IA»;
  - la lista de revisión de ejercicios generados.
- **Pruebas:** respuestas de Gemini simuladas (sin llamar a Google), validación de esquemas, ejercicios cuya solución no
  pasa (deben descartarse) y que nunca viajen datos de estudiantes.

## 6. Fases

| Fase | Qué | Necesita IA | Tamaño |
|---|---|---|---|
| A | Palabras (D5), página de la lección con pestañas (D4) y editor por secciones (D3) | No | Medio |
| B | Clave del docente (D1) y «Escribir con IA» / «Pedirle un cambio a la IA» en la explicación | Sí | Medio |
| C | «Generar ejercicios con IA» con validación en el juez (D6) y `leer()` para la entrada (D7) | Sí | Grande |
| D | Refuerzos con IA (4.3) | Sí | Medio |
| E | Estructura del curso desde el microcurrículo (D8) | Sí | Medio |

La fase A no depende de la IA y arregla lo que más confunde hoy. Conviene hacerla primero para que la IA llegue a un
editor que ya se entiende.
