# Plan: STIRE con menores de edad, el Tutor con IA dentro de la ley y el camino a otras materias

**Fecha:** 22/10/2026 · **Versión de partida:** `v2.1.0` (commit `577a7fb`)
**De dónde sale:** la evaluación heurística del 22/10 (`docs/investigacion/EVALUACION_HEURISTICA_STIRE_2026-10-22.md`),
que encontró un solo problema grave: la privacidad de menores. Y la pregunta de Jeider: si STIRE se usa con jóvenes de
colegio, ¿qué pide la ley, cómo se maneja el consentimiento (como en Empower-peque-chef) y cómo seguimos usando Gemini?

> Esto es una lectura técnica de normas y términos de servicio, no una asesoría jurídica. Antes de usar STIRE con
> menores, el plan se revisa con el comité de ética de la Universidad y, si es posible, con alguien de derecho.

---

## 1. Lo que dicen las fuentes (verificado el 22/10/2026)

### 1.1 Datos personales de menores en Colombia

**Decreto 1377 de 2013, art. 12** (texto del Diario Oficial 48.834): el tratamiento de datos de niños, niñas y
adolescentes está prohibido salvo que «responda y respete el interés superior» y «se asegure el respeto de sus derechos
fundamentales». Cumplido eso, **«el representante legal del niño, niña o adolescente otorgará la autorización previo
ejercicio del menor de su derecho a ser escuchado, opinión que será valorada teniendo en cuenta la madurez, autonomía y
capacidad para entender el asunto»**.

Para STIRE significa dos cosas: firma el acudiente **y** se le pregunta al estudiante.

Otros artículos del mismo decreto que aplican:

| Artículo | Qué pide | Qué implica para STIRE |
|---|---|---|
| 6 | Datos sensibles: avisar que no es obligatorio autorizarlos; «ninguna actividad podrá condicionarse» a darlos | Foto y voz deben ser opcionales y aparte |
| 7 | La autorización puede ser escrita, oral o por «conductas inequívocas», incluso por «medios técnicos que faciliten al Titular su manifestación automatizada»; «en ningún caso el silencio» cuenta | **Se puede pedir dentro de STIRE**, con casillas y botón, no solo en papel |
| 8 | Conservar prueba de la autorización | Guardar quién, cuándo, qué texto aceptó y su versión |
| 9 | Se puede revocar y pedir que se borren los datos | Botón para retirar la autorización y borrar |
| 13 | Política de tratamiento por escrito, en lenguaje claro: responsable, finalidad, derechos, a quién reclamar, vigencia | **Hoy STIRE no la tiene, ni siquiera para adultos** |
| 14 y 15 | Aviso de privacidad al recoger los datos | El aviso del registro solo habla de la clave del Tutor |
| 16 | Conservar el modelo del aviso; se puede guardar en medio electrónico (Ley 527 de 1999) | Guardar cada versión del texto |

### 1.2 Investigación con menores

La **Resolución 8430 de 1993** (Ministerio de Salud) regula la investigación en salud. Muchas universidades la usan
como referencia para cualquier investigación con personas:

- **Art. 11:** clasifica el riesgo de la investigación.
  - Es «sin riesgo» cuando no se interviene en los participantes. Incluye «entrevistas, cuestionarios y otros en los que
    no se le identifique ni se traten aspectos sensitivos de su conducta».
  - STIRE sí identifica a cada estudiante. Por eso habría que tratar la investigación como de riesgo mínimo o
    anonimizar los datos.
- **Art. 16:** pide un consentimiento informado escrito, revisado por el comité de ética, con dos testigos.
  - Su parágrafo permite que el comité lo dispense en las investigaciones sin riesgo.
- **Art. 25:** con menores, además del consentimiento de quien tenga la patria potestad, pide una «certificación de un
  neurólogo, siquiatra o sicólogo» sobre la capacidad de entendimiento del menor.
- **Art. 26:** cuando la madurez del menor lo permita, también se obtiene «su aceptación para ser sujeto de
  investigación después de explicarle lo que se pretende hacer». Eso es el **asentimiento**.

**Qué hacer:** preguntarle al comité de ética de la Universidad de Córdoba qué norma aplica a una investigación
educativa y si exige el art. 25. La autorización de datos de la Ley 1581 se necesita de todos modos.

### 1.3 La API de Gemini y los menores: el vacío

| Fuente | Qué dice | Consecuencia |
|---|---|---|
| [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) (vigentes desde el 23/03/2026) | «You must be 18 years of age or older to use the APIs» y no se puede usar en un servicio «directed towards or is likely to be accessed by individuals under the age of 18» | Prohíbe usarla con menores, **sin importar de quién sea la clave**: del estudiante, del docente o de la Universidad |
| Los mismos términos, «Use Restrictions» | «for developers building with Google AI models for professional or business purposes, not for consumer use» | Que cada estudiante tenga su propia clave lo vuelve «desarrollador» ante Google. Es una zona gris también con adultos |
| Los mismos términos, servicios gratuitos | Google usa lo enviado para «improve, and develop Google products»; «human reviewers may read» y «Do not submit sensitive, confidential, or personal information to the Unpaid Services» | Las conversaciones de los estudiantes las puede leer Google. En la cuota pagada no se usan para mejorar productos |
| [Google Cloud Service Specific Terms](https://cloud.google.com/terms/service-terms), §20(d), aplicables a Vertex AI | La misma restricción de menores de 18 para los servicios de IA generativa | Pagar Vertex AI no resuelve el problema de los menores |
| [Workspace for Education: acceso por edad](https://knowledge.workspace.google.com/admin/getting-started/editions/control-access-to-google-services-by-age) | La app Gemini sí está disponible para estudiantes de todas las edades si el administrador del colegio la activa, con funciones limitadas para menores de 18 | Es la app de Google, no la API: STIRE no puede usarla por dentro |
| [Anthropic, guía para organizaciones que atienden a menores](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors) | Permite productos con menores si se implementan salvaguardas: verificación de edad, moderación, monitoreo, prompt de seguridad infantil, aviso de que se habla con una IA y cumplir la ley local | Es legal con menores, pero cuesta dinero (choca con «cero cobros») |
| [Gemma, términos de uso](https://ai.google.dev/gemma/terms) y [licencia Apache 2.0 de Gemma 4](https://ai.google.dev/gemma/apache_2) | Sin cláusula de edad; Gemma 4 se publica con licencia Apache 2.0; corre en un servidor propio | **Legal con menores y sin costo**, y los datos no salen de nuestro servidor. Responde peor y más lento que Gemini |

**El vacío, dicho en corto:**
1. STIRE no pregunta la edad. Algunos estudiantes de primer semestre tienen 16 o 17 años, así que el problema existe
   también en la universidad.
2. Con menores, usar la API de Gemini incumple los términos de Google. Incumplir un contrato no es infringir una ley,
   pero Google puede cerrar la cuenta.
3. Enviar los datos de un menor a Google sin la autorización de su acudiente sí puede incumplir la Ley 1581 y el
   Decreto 1377. Eso incluye sus preguntas al Tutor y su voz.
4. Para la investigación: si las conversaciones con el Tutor se analizan, son datos personales con una finalidad de
   investigación, y la autorización debe decirlo.
5. **Por verificar:** si enviar datos a servidores de Google en otro país cuenta como transferencia internacional (Ley
   1581, art. 26) y si basta con la autorización.

### 1.4 El caso Empower-peque-chef como antecedente

En Peque-chef se pidió el consentimiento firmado de los padres porque se analizaban datos de los niños y se tomaban
fotos y videos. STIRE tiene datos parecidos:

- el registro de aprendizaje: intentos, errores, dominio y tiempos;
- las conversaciones con el Tutor;
- la voz, cuando se le habla al Tutor;
- la foto de perfil, que es opcional;
- los pantallazos del formulario de sugerencias.

Por eso aplica lo mismo, con una ventaja: STIRE puede recoger y guardar el consentimiento él mismo, porque el art. 7
del Decreto 1377 lo permite por medios técnicos.

---

## 2. Decisiones que propone el plan

1. **Público:** primero de **noveno a undécimo** (14–17 años) y primer semestre.
   - Octavo queda para después del piloto: su vocabulario y su autorregulación todavía piden más andamiaje del que hoy
     da STIRE.
   - La repetición espaciada funciona si el estudiante se autorregula: planea, cumple sus repasos y se autoevalúa con
     información fiel (Zimmerman, 2002; Cepeda et al., 2006, ver `BASE_TEORICA.md`).
2. **El Tutor con IA no se apaga, se elige el proveedor según la edad:**
   - **18 años o más:** Gemini, como hoy. Se agrega un aviso claro: Google puede leer las conversaciones en la capa
     gratuita, y no se envían el nombre ni el correo.
   - **Menores con autorización del acudiente:** un modelo propio (Gemma en nuestro servidor) o un proveedor que permita
     menores con salvaguardas. Nunca la API de Gemini.
   - **Menores sin autorización:** STIRE funciona completo, sin el Tutor y sin usar sus datos para investigación.
3. **Consentimiento dentro de STIRE, con el papel como respaldo:** el docente puede subir el acta firmada si el colegio
   la exige en papel.
4. **Investigación con datos anonimizados:** la exportación para el artículo usa seudónimos; nadie fuera del docente
   ve nombres.

---

## 3. Plan de mejora

### Fase A · Antes de cualquier uso con menores (obligatoria)

| # | Qué | Dónde | Por qué |
|---|---|---|---|
| A1 | **Política de tratamiento de datos** en `/privacidad`, en lenguaje claro: responsable, finalidad (enseñar, mejorar STIRE, investigar), qué datos, quién más los recibe (Google con el Tutor), derechos, a quién reclamar, vigencia | página pública, enlazada desde el registro y el pie | Decreto 1377, art. 13; hoy falta también para adultos |
| A2 | **Aviso de privacidad en el registro** con casilla de aceptación y la versión del texto | `pages/auth/register.vue`, tabla de autorizaciones | Arts. 14, 15 y 8 |
| A3 | **Preguntar si es menor de 18** al registrarse (solo «sí/no» o año de nacimiento, lo mínimo) | registro y perfil | Saber a quién aplica todo lo demás |
| A4 | **Cuenta de menor en espera:** puede estudiar, pero no usa el Tutor ni se registran datos para investigación hasta la autorización | backend: estado de la cuenta | Art. 12; ninguna actividad condicionada a datos sensibles (art. 6) |
| A5 | **Autorización del acudiente:** correo con enlace; página con la explicación en lenguaje claro y casillas separadas: (1) usar STIRE, (2) usar sus datos en la investigación, (3) Tutor con IA y qué proveedor, (4) voz y foto, opcionales; se guarda quién, cuándo, IP y versión del texto | página `/autorizacion/:token` | Arts. 7, 8 y 12 |
| A6 | **Asentimiento del estudiante:** antes de activar la cuenta, el propio estudiante lee una versión corta y marca si quiere participar en la investigación | primera entrada | «derecho a ser escuchado» (art. 12); Res. 8430, art. 26 |
| A7 | **Revocar y borrar:** el acudiente o el estudiante retiran la autorización desde su enlace o su perfil | perfil y enlace del acudiente | Art. 9 |
| A8 | **Panel del docente:** quién tiene autorización, quién no, reenviar el correo, subir el acta en papel | ficha de la clase | Respaldo del proceso en papel, como en Peque-chef |
| A9 | **Voz y foto apagadas para menores sin autorización explícita** de ese punto | Tutor (dictado) y perfil | La voz y la imagen son datos sensibles (Ley 1581, art. 5; por verificar el alcance) |
| A10 | **Consultar al comité de ética** con el plan y el modelo de autorización | fuera del código | Res. 8430 y normas de la Universidad |

### Fase B · El Tutor con IA, legal para cada edad

| # | Qué |
|---|---|
| B1 | **El proveedor del Tutor queda detrás de una interfaz:** `ProveedorTutor` con Gemini como primera implementación. Hoy está acoplado en `src/tutor/` |
| B2 | Regla en el servidor: si el estudiante es menor, **nunca** se llama a la API de Gemini, aunque tenga una clave guardada. Con su prueba |
| B3 | **Prueba técnica de Gemma en el servidor propio:** <ul><li>medir la calidad de las pistas con los ejercicios de los dos cursos (la misma prueba que ya califica el motor);</li><li>medir el tiempo de respuesta y cuántos estudiantes a la vez soporta la máquina gratuita.</li></ul> Si no alcanza, documentar la opción de un proveedor de pago que permita menores, para cuando haya financiación |
| B4 | **Para adultos con Gemini:** <ul><li>no enviar nombre, correo ni datos del perfil en el contexto, solo el ejercicio y el código;</li><li>un aviso visible en el chat («Estás hablando con una IA; en la capa gratuita, Google puede leer esta conversación»).</li></ul> |
| B5 | En la investigación, **reportar el vacío** de la sección 1.3 como limitación y como hallazgo. Es aporte: muestra qué le falta a la normativa colombiana para tutores con IA en colegios |

### Fase C · Lenguaje y autorregulación para colegio

| # | Qué |
|---|---|
| C1 | **Glosario en línea:** las palabras difíciles («dominio», «casos de prueba», «repasos») llevan una explicación corta al pasar el dedo o el ratón. Reutiliza el glosario del manual |
| C2 | Revisar los textos del estudiante con una meta de lectura de noveno grado; el docente no se toca |
| C3 | **Andamiaje para la autorregulación:** <ul><li>al empezar la semana, «¿cuántos repasos vas a hacer?»;</li><li>al terminar, «¿cumpliste?»;</li><li>la calibración de confianza que ya existe (BT-30), a la vista.</li></ul> Todo opcional para el docente |
| C4 | Más contenido visual en los cursos: videos cortos y la ejecución paso a paso del algoritmo, que ya existe para el pseudocódigo |

### Fase D · Transversalidad (después de A y B)

Calculo que unas **2/3 partes de STIRE ya sirven para cualquier materia**: clases, lecciones con video y PDF, opción
múltiple, emparejar, ordenar, arrastrar, repetición espaciada, dominio, asistencia, notas, mensajes, refuerzos y
catálogo por asignatura. Lo que falta es justo lo que hace a STIRE un tutor:

| # | Qué falta | Hoy |
|---|---|---|
| D1 | **Tutor configurable por asignatura:** sus instrucciones, su vocabulario y qué temas acepta salen de la asignatura de la clase | Las instrucciones dicen «cursos de algoritmos y programación» y rechazan otros temas (`src/tutor/tutor-context.service.ts`) |
| D2 | **Respuesta abierta calificada con IA** en la pantalla del estudiante | El tipo `ai_evaluated` existe en el servidor, pero no tiene pantalla |
| D3 | **Notación matemática** en lecciones y preguntas | No hay |
| D4 | **Diagnóstico de errores por materia:** el de programación se vuelve un caso de una interfaz común | Solo programación (`diagnosticoSalida.ts`, `errores-de-la-clase.ts`) |
| D5 | Un curso piloto de otra materia cargado con los tipos que ya existen, para medir qué falta de verdad | — |

### Orden y criterio de cierre

1. **Fase A completa** antes de abrir STIRE a menores.
   - Se cierra cuando un acudiente de prueba autoriza desde el correo, un estudiante de prueba asiente, y el panel del
     docente muestra ambos.
   - Cada paso con su prueba automática.
2. **B1 y B2** antes de cualquier piloto en colegio. **B3** decide el proveedor para menores.
3. **C** durante el piloto, según lo que digan los estudiantes.
4. **D** cuando el piloto de algoritmia esté cerrado.

Cada decisión de diseño que salga de aquí lleva su entrada BT en `docs/investigacion/BASE_TEORICA.md`.
