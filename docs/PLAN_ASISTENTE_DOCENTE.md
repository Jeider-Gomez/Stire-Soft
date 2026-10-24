---
estado: propuesta (23/10/2026) con decisiones pendientes de Jeider (sección 6)
origen: pedidos de Jeider del 23/10 (y la tesis de Caro, 2015, que subió el mismo día): nombre y logo de STIRE, identidad distinta para el Tutor (estudiante) y el Asistente
  (docente), plan del Asistente, y control del docente sobre los ejercicios que la IA genera para cada estudiante
complementa: docs/PLAN_REDISENO_DOCENTE.md (§4, el asistente en el panel), docs/PLAN_DOCENTE_CON_IA.md (fases A a E) y
  docs/PLAN_MEJORAS_2026-10-23.md (punto 4, ejercicios personalizados)
propuestas visuales: docs/identidad-visual/propuestas/tutor-y-asistente.html
---

# El Asistente del docente, la identidad del Tutor y los ejercicios generados

## 1. Lo que Jeider decidió hoy

| Tema | Decisión |
|---|---|
| Nombre del producto | **STIRE**, sin «Soft». El repositorio y los dominios actuales no cambian. |
| Nombre del Tutor | **Tutor STIRE**. No lleva un nombre de persona aparte. |
| Nombre del Asistente | **Asistente STIRE**: el mismo personaje, con otro rol en el panel del docente. |
| Pronunciación | Sin decidir. Ver §2. |
| Aspecto | El Tutor se ve distinto en el panel del estudiante y el Asistente en el del docente. Ver §3. |
| Ejercicios generados por IA | El docente los administra y puede desactivar la generación. Ver §5. |

## 2. El nombre y cómo se dice

STIRE son las siglas de *Sistema Tutor Inteligente con Repetición Espaciada*. Sus usuarios hablan español, y en español
una palabra que empieza con «st» se dice con una e delante («estilo», «estrés»). Así que lo natural es decirlo
**«ES-ti-re»**.

Dos cosas para pensar antes de fijarlo:
- **«Estire» ya es una palabra:** es una forma del verbo *estirar*. No es un problema, pero alguien lo notará en la
  primera clase. Se puede aprovechar como chiste interno («estira tu memoria») o ignorar.
- **La idea de que suene a «stair» (escalera) es buena.** Una escalera es una imagen justa de lo que hace STIRE: pasos
  que suben (los niveles de dominio) y que se espacian (los repasos a 1, 3, 8, 20 días). En inglés, «STIRE» se lee
  como «estáir» y no como «stair», así que mantener esa lectura exigiría escribir otra palabra. No vale la pena: el
  nombre se queda como está y **la escalera pasa al dibujo del logo** (ver §3). Así se conserva la idea sin cambiar el
  nombre.

**Recomendación:** pronunciación oficial «ES-ti-re», anotada una sola vez en la ayuda y en el README. La frase que lo
acompaña: *Sistema tutor inteligente con repetición espaciada*.

**Dónde cambia «STIRE-Soft» por «STIRE»** (al menos 6 sitios visibles): título de la pestaña (`nuxt.config.ts`), pie
(`FooterBar.vue`), pantalla de acceso (`layouts/auth.vue`), redirección (`pages/index.vue`), ayuda (`pages/ayuda.vue`)
y el encabezado (`HeaderNav.vue`, donde «Soft» va en un `<span>` aparte). Antes de cambiarlos se busca también en el
manual (`utils/manual.ts`) y en las pruebas que leen esos textos. Los 132 archivos de documentos históricos que lo
mencionan no se tocan.

## 3. Un personaje, dos caras

Son **un solo personaje con dos funciones**. Comparten el dibujo (la escalera de pasos que se espacian) y cambian el
envase, el color y el movimiento. Se ve en `docs/identidad-visual/propuestas/tutor-y-asistente.html`.

| | Tutor STIRE (estudiante) | Asistente STIRE (docente) |
|---|---|---|
| Qué hace | Guía con preguntas y pistas. **No da la respuesta.** | Propone borradores de contenido. **El docente decide.** |
| Forma | Burbuja de conversación (círculo con cola) | Hoja o panel (cuadrado redondeado con una chispa) |
| Color | Morado `#7B2FBF`, el color de «lo que haces tú» en la guía de José | Azul `#0B3D91`, el único acento del panel del docente |
| Dónde vive | Botón flotante y panel al costado, en las pantallas del estudiante | Inspector a la derecha, que se abre desde la barra de herramientas |
| Entra con | Aparece desde abajo a la derecha | Se desliza desde la derecha |
| Primera frase | «Soy el Tutor de STIRE, una IA. Te hago preguntas para que lo resuelvas tú.» | «Soy el Asistente de STIRE, una IA. Te propongo borradores; tú decides qué queda.» |
| Voz | Cercana, paciente, frases cortas | De colega: directa y con el porqué pedagógico |

**Por qué dos rótulos y no uno.** Las reglas son opuestas: el Tutor tiene prohibido dar la solución y el Asistente sí
escribe contenido. Si los dos se llamaran igual, un estudiante podría esperar del Tutor lo que su docente obtiene del
Asistente. El mismo dibujo da familia, y el rótulo y el color dejan claro con quién se habla.

**Honestidad:** tiene personalidad, pero no rostro humano ni nombre de persona. La etiqueta «IA» se queda siempre
visible, en el botón, en el encabezado y en cada mensaje.

**En el código:** un solo componente `AvatarAsistente` con las propiedades `rol` («tutor» o «asistente») y `estado`
(«reposo», «pensando» o «escribiendo»), que reemplaza los tres sitios donde hoy aparece el robot genérico de lucide
(`TutorChatDrawer.vue`, `LanzadorTutor.vue` y el registro). Va en un solo color (`currentColor`) para que funcione en
el tema oscuro y en los de contraste, y sus animaciones usan solo opacidad y escala y respetan «reducir el movimiento».

## 4. El Asistente del docente

> Cómo se escriben, se llenan y se prueban los prompts del Asistente: [`DISENO_PROMPTS_ASISTENTE.md`](DISENO_PROMPTS_ASISTENTE.md).

### 4.1 Qué es y qué no es

Es el colega con quien el docente piensa y prepara la clase. Sabe de pedagogía lo que le pasa el proyecto y lo
explica; **el docente sabe más** y lo dice. Por eso la IA propone y el docente decide. Todo lo que genera es un
borrador.

**Lo que no hace nunca:**
- publicar o cambiar algo sin que el docente lo aplique;
- ver nombres, correos ni notas individuales de estudiantes (solo cifras de la clase, sin nombres);
- usar una clave que no sea la del propio docente;
- calificar a estudiantes;
- afirmar fuentes que no estén verificadas en `docs/investigacion/BASE_TEORICA.md`.

### 4.2 Dónde vive

Un **inspector a la derecha**, igual en todas las pantallas del docente. Se abre con «✦ Asistente» en la barra de
herramientas o con `Ctrl+.`, y se cierra con `Esc`. En el celular sube como una hoja. No es un botón flotante, porque
abajo a la derecha ya vive el panel de asistencia activa.

### 4.3 Qué sabe en cada momento

- la pantalla y el objeto abiertos (la lección, el ejercicio, el refuerzo);
- el texto de ese objeto y su lugar en el curso (módulo, tema, lección anterior y siguiente);
- el microcurrículo de la clase, si el docente lo cargó;
- cifras agregadas de la clase, sin nombres: los errores de concepto más repetidos, las lecciones donde más se traban;
- los principios pedagógicos del proyecto (BASE_TEORICA), solo los verificados.

### 4.4 Qué ofrece, por pantalla

| Pantalla | Acciones sugeridas (chips) |
|---|---|
| Crear clase | «Armar los módulos desde el microcurrículo», «Proponer cuántas semanas dedicar a cada módulo» |
| Contenido, esquema | «Revisar si el orden tiene sentido», «¿Qué lección falta entre estas dos?» |
| Lección, Explicación | «Escribir la explicación», «Hacerla más sencilla», «Agregar un error común», «Cambiar el ejemplo» |
| Lección, Ejercicios | «Generar 5 ejercicios en escalera», «Uno más fácil que este», «¿Estos ejercicios cubren el objetivo?» |
| Refuerzos | «Proponer un refuerzo para el error que más se repite», «Explicarlo de otra manera» |
| Hoy | «¿A quién ayudo primero y por qué?», «Resumen de la semana» |
| Entregas | «Proponer una rúbrica», «Redactar el enunciado» |

Además hay una **caja libre** para pedir cualquier cosa del contexto abierto («hazlo más corto», «para principiantes»).

### 4.5 Cómo responde

1. **Siempre un borrador, nunca un cambio directo.** Aparece como una tarjeta con «Aplicar», «Descartar» y «Ver
   cambios», que muestra lo que se agrega y lo que se quita.
2. **Se puede deshacer.** «Aplicar» crea un estado al que se vuelve con un clic.
3. **Se afina con la conversación.** «Más corto», «con un ejemplo de fútbol», «para quien ya sabe variables».
4. **Explica el porqué** en una o dos frases («lo puse antes del ejercicio porque un ejemplo resuelto reduce la carga
   para quien empieza»). Esas razones solo citan entradas verificadas de BASE_TEORICA; si no hay una, dice «criterio
   general» y no inventa una cita.
5. **Los ejercicios de programar se validan solos:** la solución de referencia corre en el juez y el ejercicio que no
   pasa sus propios casos de prueba no llega al docente.
6. **Marca «Hecho con IA»** hasta que el docente lo revise y lo edite.

### 4.6 El «asesor pedagógico»: lo que revisa sin que se lo pidan

Una revisión opcional, que el docente enciende y apaga, sobre la lección abierta:
- **Alineación:** ¿el ejercicio mide lo que dice el objetivo?
- **Escalera:** ¿hay ejercicios fáciles antes de los difíciles?
- **Ejemplo antes del ejercicio:** ¿hay un ejemplo resuelto?
- **Carga:** ¿la explicación mezcla demasiadas ideas nuevas?
- **Error común:** ¿se anticipa alguno de los que la clase ya comete?

Son **sugerencias** con su razón, nunca bloqueos. Si el docente no está de acuerdo, las descarta y el Asistente no
insiste.

### 4.7 Seguridad y privacidad

- Un módulo `asistente-docente` en el backend, que reutiliza el cifrado de claves del Tutor
  (`src/tutor/tutor-credential.service.ts`). Solo el rol docente.
- Gemini responde con un esquema JSON fijo y el servidor valida cada respuesta con DTO antes de devolverla.
- El contenido del curso se trata como **datos**, no como instrucciones (defensa contra inyección de prompt).
- Límite de uso por docente, para cuidar la cuota gratuita.
- Nunca viajan a la IA datos personales de estudiantes.

### 4.8 Estados que se diseñan

Sin clave de Gemini (con el paso a paso para crearla, gratis), cuota agotada, respuesta inválida (se reintenta una vez
y luego se explica), sin conexión, y «pensando» con un esqueleto y no un círculo que gira.

### 4.9 Qué se mide (para el artículo)

Cuántos borradores se generan, cuántos se aplican tal cual, cuántos se editan y cuántos se descartan, y cuántos
ejercicios generados no pasaron el juez. Solo conteos, sin el contenido ni datos de personas.

## 5. Ejercicios generados por la IA, administrados por el docente

### 5.1 Una corrección a la idea

La idea era personalizar según el «perfil cognitivo». El Perfil de aprendizaje que existe
(`src/analytics/perfil-aprendizaje.ts`) tiene tres partes, y **solo una sirve para esto**:

| Parte del perfil | ¿Sirve para personalizar? |
|---|---|
| Errores que se repiten (de **concepto**, no de escritura) | **Sí.** Es lo que más se puede ayudar con un ejercicio dirigido. |
| Nivel y lecciones dominadas | **Sí.** Define qué tan difícil y sobre qué. |
| Cómo recorre el curso (secuencial o global) y qué formato usa (visual o verbal) | **No.** El propio código lo declara descriptivo: los estilos de aprendizaje no tienen respaldo para adaptar la enseñanza (BT-42). |

Así que se personaliza por **el error de concepto que el estudiante repite, su nivel y la lección**, nunca por «estilo».
Esto además sostiene mejor el artículo.

### 5.2 Cómo funciona: se genera solo, y un ejercicio sirve a muchos

Jeider lo planteó así: si todos reciben los mismos ejercicios no hay personalización, así que **la generación tiene
que ser automática**, a partir de lo que el estudiante sabe y no sabe. Los sistemas que revisé (ALEKS, Duolingo,
Khanmigo; ver `docs/investigacion/PERSONALIZACION_Y_ASISTENTE_ESTADO_DEL_ARTE.md`) perfilan por **lo que el estudiante
responde y con qué resultado**, no por su estilo.

**El perfil es una celda, no una persona:**

> celda de perfil = (lección, error de concepto que repite, banda de nivel)

Como varios estudiantes caen en la misma celda, **un ejercicio generado para una celda sirve a todos los de esa
celda**. Eso ahorra generación (y cuota de Gemini) a medida que hay más estudiantes.

1. **Cuándo aparece:** cuando el estudiante repite el mismo error de concepto en dos ejercicios seguidos de una
   lección, o cuando un repaso vencido sigue fallando. (Las condiciones exactas se afinan con datos reales: es una
   regla de STIRE, no del prompt.)
2. **Antes de generar, se busca en el banco** un ejercicio de esa celda que ese estudiante no haya visto.
3. Si no hay, se genera con **la clave de Gemini del propio estudiante**. El modelo recibe la celda y el texto de la
   lección, **sin nombre ni correo**.
4. **El error de concepto lo diagnostican las reglas de STIRE, no el modelo.** El modelo solo escribe el ejercicio.
   Esto importa: en un estudio sobre tutores, GPT-4 a veces inventó una concepción errónea que el estudiante no tenía
   (sin verificar en el texto completo).
5. La solución de referencia corre en el juez. Si no pasa sus casos, se descarta.
6. Se guarda en el banco con la marca «hecho con IA» y esa celda, y llega al estudiante.

### 5.3 Lo que controla el docente

Por clase (y, si quiere, por unidad), con el patrón «Heredar / elegir» que ya usa el Tutor (`tutor-settings.ts`):

| Modo | Qué pasa |
|---|---|
| **Solo mis ejercicios** | No se genera nada. El estudiante ve únicamente los ejercicios que el docente creó. Es el valor para quien no quiere IA |
| **Personalizados, con mi aprobación** | Se generan solos, pero **no llegan al estudiante hasta que el docente los aprueba** (modo revisión: una cola de tarjetas para aceptar, editar o descartar) |
| **Personalizados, directos** | Se generan y llegan al estudiante. El docente los ve después y puede archivarlos |

Y dos ajustes más, cuando hay generación:
- **Límite:** máximo de ejercicios generados por estudiante a la semana.
- **Qué tipos:** por ejemplo, solo ejercicios de programar, o también de opción múltiple.

**Valor inicial recomendado: «Solo mis ejercicios»,** porque el principio del proyecto es que las funciones del docente
sean opcionales. **Para la prueba con los 10 usuarios,** conviene una clase con generación activada y otra con ella
apagada: es la comparación con grupo de control que la tesis de Caro hizo con 22 y 22 estudiantes (ver
`docs/investigacion/TESIS_CARO_2015_FICHA.md`), y el interruptor la permite sin código nuevo.

**El estudiante también puede decir que no.** Sin clave de Gemini, o si no quiere ejercicios hechos por IA, no se le
generan; es su cuenta y su cuota.

**Si el docente desea que «apenas se muestren sus ejercicios»,** elige el primer modo y nada más cambia.

### 5.4 El panel del docente

Dentro de «Ejercicios» de la lección (y como lista de toda la clase), una vista **«Hechos con IA»**:
- una lista con la lección, el error de concepto que atiende («Junta números como texto»), el nivel y el estado
  (pendiente, aprobado, archivado);
- acciones: **Aprobar**, **Editar** (se abre el editor de siempre), **Archivar**, **Pasar al banco de la clase** (lo
  ofrece a todos) y **Reportar un problema**;
- los contadores de arriba: generados, aprobados, descartados y cuántos estudiantes lo resolvieron.

**Privacidad:** la lista muestra *a qué error y nivel* atiende cada ejercicio, no a quién. Quién lo recibió se ve en la
ficha del estudiante, que el docente ya puede abrir hoy. Así el panel nuevo no abre una vista de datos personales que
no existiera.

### 5.5 Qué pasa al desactivar

- Dejan de generarse ejercicios nuevos de inmediato.
- Los **ya aprobados** quedan en el banco, y el docente puede archivarlos.
- Los pendientes de aprobación quedan en espera y no llegan a nadie.
- La pantalla lo dice con esas tres frases, sin tecnicismos.

### 5.6 Datos

Cambios previstos en el backend, con **migración** (no corre sola: se ejecuta con `migration:run` en el despliegue):
- en los ejercicios: `origen` («manual», «ia_docente» o «ia_personalizado»), `estadoRevision` y el error de concepto y
  el nivel para los que se generó;
- en los ajustes por ámbito: un campo nuevo para el interruptor de generación, el modo y el límite.

## 6. Decisiones pendientes

| # | Decisión | Recomiendo |
|---|---|---|
| E1 | Pronunciación oficial | «ES-ti-re», anotada en la ayuda |
| E2 | Elegir el logo (tres direcciones en la página de propuestas) | La escalera: conecta el nombre, los pasos y los repasos |
| E3 | Valor inicial de los ejercicios personalizados | «Solo mis ejercicios» hasta que el docente elija otro modo; en la prueba, una clase con generación y otra sin ella |
| E4 | Modo al activar la generación | «Con mi aprobación» durante la prueba con los 10 usuarios; luego «Directo» |
| E5 | Personalizar solo por error de concepto, nivel y lección (sin estilos) | Sí, por BT-42 |
| E6 | ¿El asesor pedagógico (§4.6) viene apagado o encendido? | Apagado: el docente lo enciende |
| E7 | ¿Uso del escudo de la Universidad de Córdoba en la marca? | Preguntar a la universidad antes de usarlo |

## 7. Orden de trabajo

| Paso | Qué | Depende de |
|---|---|---|
| 1 | Quitar «Soft» de los sitios visibles y componente `AvatarAsistente` con el logo elegido | E1 y E2 |
| 2 | R2: «Contenido» en tres columnas con editor por secciones (sin IA) | — |
| 3 | R4: inspector del Asistente, clave del docente y acciones de la explicación | 1 y 2 |
| 4 | Ejercicios con IA para el docente, validados en el juez (fase C de PLAN_DOCENTE_CON_IA) | 3 |
| 5 | Ejercicios personalizados con el panel del docente y el interruptor (§5) | 4, E3 y E4 |
| 6 | Asesor pedagógico y refuerzos con IA | 3 |

El paso 5 conviene hacerlo **después** de la prueba con los 10 usuarios: es la mejora más grande y la que más aporta al
artículo, pero también la que más datos nuevos mueve.
