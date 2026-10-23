---
estado: brief para confirmar (23/10/2026). Sin código todavía.
decisiones de Jeider (23/10):
  - el rediseño puede cambiar también los tokens y el CSS global; Jeider se lo comunica a José;
  - asistente pedagógico: un panel lateral que sabe qué tiene abierto el docente, más acciones de IA en cada editor;
  - preparar la clase y dictarla pesan lo mismo.
relacionado: PRODUCT.md, docs/PLAN_DOCENTE_CON_IA.md (decisiones D1 a D8)
---

# Rediseño del panel del docente y su asistente pedagógico

## 1. Para quién y para qué

- **Quién llega:** un docente de la Licenciatura, con experiencia en pedagogía, que no tiene por qué saber Markdown ni
  pensar como programador.
- **Dos escenas con el mismo peso:**
  - **Preparar** en el computador: armar el curso, escribir explicaciones, crear ejercicios, decidir a quién ayudar.
  - **Dictar** proyectando o con el celular en la mano: asistencia, mostrar la lección, ver quién se trabó.
- **Modo:** Operate. El éxito es terminar la tarea sin pensar en la herramienta.

## 2. Qué hace que hoy se sienta «como manejar un barco»

Visto en producción el 23/10 con la cuenta de Laura:

1. **Tres navegaciones a la vez:** la barra lateral (clases), las pestañas de la clase (Hoy, Contenido, Estudiantes…) y,
   dentro de «Contenido», otro selector «Clase:» que repite lo que ya dice la barra.
2. **Cajas dentro de cajas:** tarjeta de la clase, tarjeta del encabezado, tarjeta del módulo, tarjeta del tema y
   tarjeta de la lección. Cada nivel agrega borde y margen, y el contenido real queda pequeño y lejos.
3. **Ventanas sobre ventanas:** para escribir una explicación hay que desplegar la lección, abrir «Lecciones» y abrir el
   editor, que tapa la pantalla.
4. **Palabras cruzadas:** «Lecciones» dentro de una lección (H1 en PLAN_DOCENTE_CON_IA).
5. **Editor de símbolos:** Markdown crudo.
6. **Todo pesa lo mismo:** muchos botones con el mismo tamaño y peso («Ocultar», «Nuevo tema», «⋯», «Nueva lección»),
   así que no hay un camino evidente.

## 3. La dirección: sobria, como una aplicación de Apple

Dirección pedida por el dueño: «tipo Apple». No se trata de copiar la marca de Apple. Se adopta su gramática de
aplicaciones de trabajo (Notas, Pages, Keynote, Configuración del Sistema):
- una barra lateral como índice;
- títulos grandes;
- listas agrupadas;
- un inspector a la derecha;
- hojas que suben desde abajo para crear algo;
- movimiento corto que explica de dónde viene y a dónde va cada cosa.

### Cómo se navega

- **Una barra lateral como índice de fuentes**, translúcida y del color del sistema. Cada clase se despliega ahí mismo
  en sus secciones: Hoy, Contenido, Estudiantes, Asistencia, Entregas, Refuerzos, Notas y Ajustes. Desaparecen la barra
  de pestañas horizontal y el selector «Clase:» repetido. Arriba quedan «Mis clases» y «Mensajes»; abajo, «Ayuda».
- **Título grande por pantalla** («Contenido», «Hoy») con sus acciones a la derecha, en una barra de herramientas.
  Hay una sola acción principal con color, y las demás van en gris.
- **En el celular,** navegación por pila como en iOS: lista → detalle, con «‹ Atrás».

### «Contenido» en tres columnas, como Notas o Mail

```
┌──────────────┬───────────────────────────┬──────────────────────────────────────┐
│ Clases       │ Contenido          [+ ▾]  │ Variables y tipos de datos   Básico  │
│ ▾ Fund. Alg. │ ▾ Unidad 1 · Introducción │ [ Explicación | Ejercicios | Ajustes ]│
│   Hoy        │   ▾ ¿Qué es un algoritmo? │                                      │
│ › Contenido  │       Algoritmos en la…   │  La idea                             │
│   Estudiantes│       Pseudocódigo y…     │  Una variable es un espacio…         │
│   Asistencia │   ▾ Variables, operadores │  Un ejemplo                          │
│   …          │     ● Variables y tipos   │  ```let edad = 19```                 │
│ › Pensar Alg.│       Operadores y expr.  │  Error común  ·  Pruébalo            │
│              │ ▸ Unidad 2 · Diseño…      │                     [✦ Asistente]    │
└──────────────┴───────────────────────────┴──────────────────────────────────────┘
```

- **Columna central:** el esquema del curso en filas compactas, con sangría por nivel. Se despliega, se reordena
  arrastrando y tiene un menú «+» para módulo, tema o lección. Al lado de cada lección, su estado (publicada u oculta)
  y una marca discreta de lo que le falta.
- **Columna derecha: la lección abierta,** con un control segmentado «Explicación | Ejercicios | Ajustes». Reemplaza las
  ventanas de hoy. La explicación se escribe en el lugar, con las cuatro secciones con nombre («La idea», «Un
  ejemplo», «Error común», «Pruébalo»), en un editor visual sin símbolos, con «Ver como estudiante» en vez de la vista
  previa partida.
- **Crear algo nuevo** (clase, módulo, ejercicio) abre una **hoja** que sube desde abajo y deja ver detrás de dónde
  viene. Ya no es un modal centrado que tapa todo.

### «Hoy»: lo que conviene hacer ahora

- Una tarjeta principal con **una** acción: «3 estudiantes no pueden avanzar en Ciclos · Ver quiénes».
- Debajo, listas agrupadas: lo que espera comentario, los errores de la semana y la asistencia de hoy.
- Sin cifras decorativas.

### Modo clase (para dictar)

Un interruptor «Modo clase» en la barra de herramientas:
- letra más grande y menos controles;
- la lección para proyectar;
- la asistencia activa (el panel flotante que ya existe);
- un panel de «quién se trabó» que se actualiza solo.

En el celular, el docente entra directo a este modo.

### Color, letra y materiales (tokens, ahora en el alcance)

- **Color contenido:** neutros y un solo acento para la acción principal, la selección y los estados. Los colores
  semánticos (aprobado, falla, vence) se mantienen.
- **Letra del sistema** (la de Apple en sus equipos y la del sistema en los demás), con una escala de pasos cortos.
  Sin letras decorativas en etiquetas ni botones.
- **Listas agrupadas** con separadores finos, esquinas de unos 10 a 12 px, y sombras solo en lo que flota (hojas,
  inspector, menús).
- **Translucidez solo en la barra lateral y la barra de herramientas,** nunca en el contenido.
- Tema oscuro equivalente. **Los cuatro temas de contraste y el contraste aumentado deben seguir funcionando**: los
  tokens nuevos se definen con las mismas variables que ya reemplazan esos temas.

### Movimiento

- Entre 150 y 250 ms, con curvas suaves de salida.
- **Lista → detalle con View Transitions:** la fila de la lección se expande hasta el título de la columna derecha.
  Nuxt lo trae como función experimental.
- Las hojas suben con un leve rebote. El inspector entra desde la derecha. Los cambios que propone la IA aparecen
  resaltados un instante.
- **Nada de animaciones al cargar la página ni de movimiento decorativo.** Con «reducir el movimiento» todo pasa a un
  fundido simple o a nada.

## 4. El asistente pedagógico

Es un **inspector a la derecha** («✦ Asistente», con Ctrl+. o desde la barra de herramientas) que existe en todas las
pantallas del docente y sabe qué tiene abierto: la clase, la lección, el ejercicio o el refuerzo. No es un chat genérico.

### Qué ofrece en cada pantalla

Se muestran como acciones sugeridas arriba del campo de texto:

| Pantalla | Acciones sugeridas |
|---|---|
| Lección / Explicación | «Escribir la explicación», «Hacerla más sencilla», «Otro ejemplo», «Agregar un error común», «Revisar si se entiende» |
| Lección / Ejercicios | «Generar 5 ejercicios en escalera» (completar → ordenar → programar), «Un ejercicio más fácil que este», «Revisar los casos de prueba» |
| Refuerzos | «Proponer un refuerzo para el error que más se repite» |
| Hoy / Estudiantes | «¿A quién ayudo primero y cómo?», a partir de las cifras de la clase sin nombres |
| Crear clase | «Armar los módulos desde el microcurrículo» (pegar el texto o subir el PDF) |

### Cómo responde

- **Siempre un borrador aplicable**, no un texto para copiar: «Aplicar a la sección "Un ejemplo"», «Agregar estos 5
  ejercicios a la lección». Antes de aplicar se ve la diferencia.
- El docente puede responder «más corto», «para principiantes» o «con un ejemplo de fútbol» y el asistente rehace el
  borrador.
- **Pedagogía como asesor, no como jefe:** puede decir por qué propone algo («un error común ayuda a…») y citar la base
  teórica del proyecto (BASE_TEORICA.md). El docente decide.
- Los ejercicios de código se validan en el juez antes de mostrarse.
- Todo lo aplicado lleva «Hecho con IA» hasta que el docente lo edite o lo marque como revisado.

### Lo que no hace

- Publicar solo.
- Ver nombres ni correos de estudiantes.
- Usar una clave que no sea la del docente.
- Calificar entregas por su cuenta.

## 5. Estados que se diseñan

- **Primera vez:** clase vacía, con «Empezar desde una plantilla», «Armar con el asistente» o «Empezar vacía».
- **Sin clave de IA:** el inspector explica en dos pasos cómo crear la clave gratuita. Todo lo demás funciona sin ella.
- **Cargando:** esqueletos en las listas, no círculos girando.
- **Error de la IA** (cupo agotado, clave inválida): un mensaje que dice qué hacer, y lo escrito por el docente no se
  pierde.
- **Rangos:** de 1 a 3 clases por docente; cursos de 3 a 10 módulos y 20 a 60 lecciones; de 0 a 40 ejercicios por
  lección; de 5 a 60 estudiantes por clase.
- **Celular:** pila de navegación y modo clase. El editor de explicaciones también funciona, aunque está pensado para el
  computador.

## 6. Alcance y límites

- **Entra:** todo el panel del docente: Mis clases, la clase (Hoy, Contenido, Estudiantes, Asistencia, Entregas,
  Refuerzos, Notas, Ajustes), crear ejercicio, refuerzos, mensajes y perfil. También el asistente y los tokens.
- **Se mantiene:**
  - el comportamiento y los datos;
  - las rutas, o se redirigen las viejas;
  - las funciones opcionales;
  - la accesibilidad actual, los temas de contraste y las pruebas que protegen todo eso.
- **El panel del estudiante** no se rediseña en esta fase. Si los tokens globales cambian, se revisa con capturas que
  no se rompa. Se recomienda entrar con los tokens nuevos detrás de un atributo del layout del docente, y llevarlos al
  estudiante después de la prueba con 10 usuarios.
- **Anti-objetivos:**
  - cristal y desenfoque en todas partes;
  - animación decorativa;
  - modales como primera opción;
  - imitar la marca de Apple (logos, nombres, iconos propios);
  - perder funciones al «limpiar»;
  - un panel bonito que tarda más en terminar las tareas.

## 7. Fases

| Fase | Qué | Tamaño |
|---|---|---|
| R0 | Tokens nuevos (color contenido, letra del sistema, radios, sombras, movimiento) detrás del layout del docente, con los cuatro temas de contraste y el oscuro verificados | Medio |
| R1 | Barra lateral como índice de fuentes con las secciones de la clase, títulos grandes y barra de herramientas. Se quitan las pestañas horizontales y el selector repetido | Medio |
| R2 | «Contenido» en tres columnas, página de lección con control segmentado y editor por secciones (fases A de PLAN_DOCENTE_CON_IA) | Grande |
| R3 | Hojas para crear, View Transitions y el resto del movimiento | Medio |
| R4 | Asistente: inspector, clave del docente y acciones de la explicación (fase B) | Medio |
| R5 | Asistente: ejercicios validados en el juez, refuerzos y estructura desde el microcurrículo (fases C, D y E) | Grande |
| R6 | «Hoy» y modo clase | Medio |

Cada fase se cierra con capturas en computador y celular, en claro, oscuro y un tema de contraste, más las pruebas y
`check:identidad` actualizado a la decisión del 23/10.

## 8. Decisiones abiertas

1. ¿Los tokens nuevos entran solo en el docente primero (recomendado) o en toda la app de una vez?
2. ¿Movemos el panel del estudiante al mismo estilo después de la prueba con 10 usuarios?
3. ¿Por cuál fase empezamos? Recomiendo R0 + R1 + R2: son las que quitan la sensación de «barco».
4. Antes de construir corre la elección de dirección del método de diseño (tres variantes de composición dentro de la
   línea «tipo Apple»), para escoger una antes de escribir código.
