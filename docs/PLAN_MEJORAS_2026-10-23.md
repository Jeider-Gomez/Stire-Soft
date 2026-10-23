---
estado: propuesta (23/10/2026), pendiente de que Jeider elija el orden
origen: audio del profesor (20/10), conversación con el profesor Ali y pedidos de Jeider del 23/10
---

# Plan de mejoras después del despliegue del 23/10

Lo que sigue sale de tres fuentes: el audio del profesor del 20/10 (transcrito en local), lo que Jeider habló con el
profesor Ali y lo que Jeider pidió el 23/10. Cada frente dice qué hay hoy, qué se propone y cuánto cuesta. Las citas
marcadas «por verificar» no se usan en el artículo hasta leerlas.

## 0. Lo que pidió el profesor en el audio (20/10)

1. **Batería de casos con usuarios simulados.** Que la IA genere perfiles de usuario distintos, los explique en una tabla
   (qué caso es y por qué), y con eso cree 100, 200 o 300 usuarios **marcados como de prueba**, para borrarlos después.
   Dos modos:
   - uno que inyecta todo por la API y revisa los resultados;
   - otro en el que un agente usa la aplicación como una persona, haciendo clic.
2. **Prueba con usuarios finales reales:** unas 10 personas (amigos, primos; no tiene que ser en un colegio), observando
   qué hacen con la herramienta. No es exhaustiva, pero alcanza para sacar conclusiones en el artículo.
3. Él probó el mismo algoritmo de repetición espaciada en otro software y quiere **comparar resultados**.
4. **Dos artículos:** el de la revista del proyecto y otro de implementación y evaluación, en una revista que él elegirá
   de una base de datos. Se empieza por los resultados, el resumen y los borradores con el formato de esa revista.

## 1. Borrar cuentas del todo (pedido del 23/10)

**Hoy:** «Eliminar» en el panel del admin hace un borrado lógico (`softRemove`, `src/user/user.service.ts`): la cuenta
deja de entrar, pero los datos quedan.

**Propuesta:**

- **Borrado definitivo** desde el panel del admin, con confirmación escribiendo el correo. Borra la cuenta y lo que es
  solo suyo:
  - entregas, progreso, repasos, mensajes, clave del Tutor y foto;
  - en lo compartido (clases que creó un docente, avisos), o se transfiere o se impide el borrado con un mensaje claro.
- **«Eliminar mi cuenta»** en el perfil. Es el derecho de supresión de la Ley 1581 y la política de datos ya lo promete.
- **«Borrar usuarios de prueba»** de una vez, para los usuarios simulados del punto 0.1. Necesita una marca `esPrueba`.

**Costo:** medio. Hay unas 25 tablas que apuntan al usuario: hay que revisar cada llave foránea y probarlo contra una
base real antes de desplegar.

## 2. Términos e investigación: ¿estamos exagerando?

**En parte sí:** tres casillas son más de lo necesario. Lo que la ley exige y lo que se puede quitar:

| Qué | ¿Obligatorio? | Por qué |
|---|---|---|
| Autorizar el uso de datos personales (nombre, correo, progreso) | **Sí** | Ley 1581 de 2012 y Decreto 1377 de 2013: autorización previa, expresa e informada. Una casilla marcada de antemano o el silencio no cuentan (art. 7 del decreto). |
| Confirmar que es mayor de 18 | Sí, mientras el Tutor use Gemini | Los términos de la API de Gemini prohíben servicios dirigidos a menores. |
| Consentimiento para la investigación | Sí, pero puede ser **una pregunta corta** | Res. 8430 de 1993: la investigación sin riesgo, como esta, puede tener un consentimiento simplificado, y el comité de ética puede eximir el escrito (art. 16, parágrafo). |
| Un documento de términos largo | **No** | Basta una política de datos clara y un enlace. |

**Por qué otras investigaciones no piden nada:** suelen ser encuestas anónimas, sin nombre ni correo. Sin datos
personales, la Ley 1581 no aplica. STIRE sí guarda cuentas con nombre y correo, así que necesita la autorización.

**Propuesta:**

- Unir edad y datos en **una sola casilla** obligatoria: «Soy mayor de 18 años y acepto la política de datos».
- La investigación como una **pregunta Sí/No obligatoria** durante la prueba, sin respuesta marcada de antemano. Así
  todos los participantes responden y nadie queda adentro por omisión. Esto es lo que entiendo por «temporalmente vamos
  a colocar eso»; **confirmar con Jeider**.
- No volver obligatorio participar en la investigación para usar STIRE. Si la clase exige STIRE, obligar a participar
  quitaría la voluntariedad.

**Costo:** bajo, solo frontend y textos.

## 3. Ejercicios más fáciles y otros tipos de ejercicio

**Hoy:** el juez solo ejecuta JavaScript (`src/judge-engine/hardened-process-sandbox.adapter.ts`). Hay ocho tipos de
ejercicio:
- opción múltiple;
- programar;
- arrastrar;
- emparejar;
- completar código;
- ordenar;
- evaluado por IA;
- HTML/CSS.

En los dos cursos son 59 de opción múltiple, 29 de programar, 31 de completar y 31 de ordenar. El problema que vio
Jeider es el salto: programar en JavaScript desde cero es mucho para quien empieza.

**Propuesta, de menor a mayor costo:**

1. **Escalera dentro de cada lección**, con los tipos que ya existen:
   - ejemplo resuelto → completar → ordenar líneas → escribir;
   - el recomendador ya maneja niveles: es ordenar el contenido y agregar ejercicios intermedios.
2. **Ordenar líneas con distractores** (problemas de Parsons): mezclar líneas correctas con líneas parecidas que sobran.
   Se basa en el tipo `ordering`. Base teórica por verificar: Parsons y Haden (2006); Ericson et al. (2017).
3. **Bloques de código** con Blockly (licencia Apache 2.0):
   - el estudiante arma con bloques en español y STIRE muestra el JavaScript que generan;
   - se califica con el mismo juez;
   - es el puente de Scratch al código.
4. **Pseudocódigo como en PSeInt** que se traduce a JavaScript para calificarlo. Encaja con Fundamentos de Algoritmia,
   pero es lo más costoso: un traductor y sus pruebas.

Python en el servidor no se recomienda ahora: requiere otro entorno aislado en un servidor de 4 GB.

## 4. Ejercicios personalizados con la IA (idea del profesor Ali)

**Se puede, con la clave de cada estudiante.** El Tutor ya llama a Gemini con ella.

**Cómo funcionaría:**

1. **El perfil cognitivo ya existe:** «Mi perfil de aprendizaje» (MOD-02) guarda las lecciones dominadas, los errores
   de concepto que se repiten, el nivel y el formato que prefiere. No se usa «estilos de aprendizaje», que no tienen
   respaldo (Pashler et al., 2008, ya en el código).
2. **Antes de generar, buscar en el banco.** Si hay un ejercicio de esa lección para ese perfil (mismo error de concepto
   y mismo nivel) que el estudiante no ha visto, se usa. Solo si falta, se genera uno.
3. **Generar con control:** Gemini devuelve el enunciado, una solución de referencia y los casos de prueba. STIRE corre
   la solución en el juez y solo guarda el ejercicio si pasa todos los casos. Un ejercicio que no se puede resolver
   nunca llega al estudiante.
4. **Guardar en el banco** como «generado por IA», con la lección, el perfil y el nivel. Lo ve primero quien lo generó.
   A los demás les llega cuando el docente lo aprueba, si quiere (función opcional), o cuando ya lo resolvieron varios
   estudiantes sin quejas.
5. **Privacidad:** a Gemini se le manda el perfil sin nombre ni correo. Con la cuenta gratuita Google puede usar lo que
   se envía, y un ejercicio no es un dato personal.

**Costo:** alto: generación, validación en el juez, banco con perfiles y revisión del docente. Es la mejora con más
peso para el artículo.

## 5. Varias explicaciones por lección

**Hoy:**
- el algoritmo de cada lección se ve en tres formatos (pseudocódigo, diagrama de flujo y paso a paso);
- «No me quedó claro» ofrece otros caminos: un ejercicio sencillo, otro video o preguntarle al docente.

**Propuesta:** que una lección tenga explicaciones alternativas además de la principal:
- una analogía;
- un ejemplo resuelto paso a paso;
- un video.

Las escribe el docente si quiere, o las genera la IA y se guardan como en el punto 4. Se ofrecen cuando el estudiante
toca «No me quedó claro» o falla dos veces. La idea es una explicación distinta, no un estilo de aprendizaje.

**Costo:** medio.

## 6. Explicar qué es STIRE de forma intuitiva

**Propuesta:**
- **«¿Qué es STIRE?»:** cinco diapositivas cortas con imagen la primera vez que se entra, antes del recorrido de la
  pantalla. Se pueden saltar y se vuelven a ver desde «?».
- **Un video de 1 a 2 minutos,** en una de dos formas:
  - generado gratis con NotebookLM (resumen en video) a partir del manual;
  - una grabación de pantalla real con narración.

  El video también sirve para presentar el proyecto.

**Costo:** bajo a medio.

## 7. «Mi progreso» satura

**Hoy, en una sola columna:**
- las cifras;
- las lecciones;
- «Mi perfil de aprendizaje»;
- «Cómo avanzas», con la calibración;
- los logros.

**Propuesta:**
- arriba, una frase y **una** acción: «Vas en 4 de 12 lecciones; hoy te toca repasar 2»;
- después, las lecciones;
- lo demás en secciones plegables («Cómo aprendo», «Mis logros»), cerradas por defecto.

Antes de tocar nada, revisar la pantalla con capturas en el celular y en el computador.

**Costo:** bajo.

## 8. El chat con el Tutor

**Hoy:** `TutorChatDrawer.vue` tiene 540 líneas. Antes de proponer cambios concretos hay que usarlo: revisión con capturas
y una sesión de prueba (escribir, voz, pistas, cambio de táctica, errores de clave). Lo que suele mejorar la experiencia:
- respuestas cortas que se leen por partes;
- botones de respuesta rápida («Dame una pista», «No entiendo», «Muéstrame un ejemplo»);
- el código del estudiante citado en el chat;
- poder volver a la pista anterior.

## 9. Probar «hacer ejercicios»

Jeider quiere probarlo él mismo. Propuesta: un guion corto de prueba (cuenta de estudiante de prueba, una lección, cada
tipo de ejercicio, probar, entregar, fallar a propósito, pedir ayuda al Tutor). Se anota lo que confunde, y eso alimenta
los puntos 3 y 8.

## Orden sugerido

| Paso | Qué | Por qué primero |
|---|---|---|
| 1 | Términos simplificados y pregunta de investigación Sí/No (2) | Bajo costo; hace falta antes de la prueba con 10 usuarios |
| 2 | Borrar cuentas y usuarios de prueba (1) | Lo necesita la batería de usuarios simulados |
| 3 | Batería de perfiles y usuarios simulados (0.1) | La pidió el profesor para el artículo |
| 4 | «Mi progreso» y el chat, tras la prueba de ejercicios (7, 8, 9) | Experiencia de usuario antes de la prueba con 10 usuarios |
| 5 | Escalera de ejercicios y Parsons con distractores (3.1, 3.2) | Ejercicios más fáciles sin código nuevo grande |
| 6 | Prueba con 10 usuarios finales (0.2) | Datos para el artículo |
| 7 | Ejercicios personalizados con IA (4) y explicaciones alternativas (5) | Lo más grande; mejor después de la prueba |
| 8 | Bloques (3.3), «¿Qué es STIRE?» y video (6) | Valor alto, sin urgencia |
