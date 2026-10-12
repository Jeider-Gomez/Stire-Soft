# El Tutor en la Semana 8: lista de lo que dijimos y qué falta (12/10/2026)

Análisis de todo lo que Jeider y el equipo dijeron en la Semana 8 (5 – 9 oct) que tiene que ver con el Tutor. Se revisaron:
la bitácora N.º 8, los comentarios del tablero de Trello de la Semana 8, las 11 sugerencias del panel de STIRE, los hallazgos
de Jeider y de José, la lista de chequeo de Sistemas Tutores Inteligentes (v2.0.0) y los registros del servidor.

Cada punto se trata como hipótesis hasta verlo en el código (`CLAUDE.md`). La lista es para ir cerrándola: cuando algo se
arregle, se cambia su estado aquí y en la tarjeta.

## Lo que muestran los datos

- **Nadie usó el Tutor desde el reinicio del 10/10 (01:22) hasta hoy, 12/10 al mediodía.** En los 360 eventos que guarda el
  servidor (Admin → Sistema) no hay ni un «Tutor: … respondió en N ms». Es fin de semana, pero muestra que **el Tutor
  todavía no es parte del uso normal de la prueba**. Hay que mirarlo de nuevo el martes y el jueves.
- **Solo 4 cuentas de estudiante tienen guardada su clave de Google** (de 17 cuentas con rol de estudiante, contando las de
  prueba), y en las últimas 24 h ningún estudiante le escribió al Tutor (Admin → Sistema, 12/10). Sin clave no hay Tutor:
  **lo más probable es que la clave sea lo que frena su uso**, más que la velocidad.
- **Ninguna de las 11 sugerencias del panel es del Tutor.** Lo que se dijo del Tutor llegó por Trello y en las listas.
- **El tiempo de respuesta medido sigue siendo el de antes:** de 3 a 29 s, según la carga de Google (bitácora N.º 8,
  riesgo 3). El registro de cada respuesta ya está (`src/tutor/tutor.service.ts`, «respondió en N ms»), pero aún no hay
  respuestas que medir.

## La lista

Estados: ✅ hecho · 🔧 hecho hoy, falta verlo en el celular · ⏳ espera a otra persona · 📋 por decidir.

| # | Lo que se dijo | Quién y dónde | Qué hay en el código | Estado |
|---|---|---|---|---|
| TUT-01 | En el celular, al abrir el teclado se esconden los últimos mensajes del chat. | José, S08-JO02 (09/10) | El panel medía toda la pantalla y el teclado tapaba su final. Ahora toma el alto de lo que se ve y baja al último mensaje (`composables/useAreaVisible.ts`). | 🔧 `17500e4` |
| TUT-02 | En computador, las notificaciones y el Tutor abiertos a la vez se tapan. | José, S08-JO02 | Abrir uno cierra el otro; la conversación no se pierde y el foco no salta. | 🔧 `17500e4` |
| TUT-03 | El botón flotante del Tutor tapa las opciones de opción múltiple y los botones de abajo en pantallas bajas. | José, lista de interfaz MOB-02 (09/10) | En el ejercicio solo había espacio abajo en los de programar. Ahora en todos. El botón ya se encogía al bajar. | 🔧 `17500e4` |
| TUT-04 | Con el Tutor abierto en el celular, los bloques anchos obligan a mover la pantalla de lado. | José, lista de interfaz MOB-01 | **Era cierto en el chat:** a la burbuja del mensaje le faltaba `min-w-0`, así que un código largo la ensanchaba. Corregido: el código se desplaza dentro de su recuadro. Las tablas y diagramas de la **lección** son otro tema (no del Tutor). | 🔧 este commit |
| TUT-05 | La pantalla del ejercicio tiene demasiado a la vez: enunciado, editor, consola y Tutor. | José, S08-E01 (05/10) | El Tutor es un botón flotante (03/10) y el enunciado se pliega (07/10). | ✅ |
| TUT-06 | Las tarjetas de sugerencia del Tutor no parecen botones; el saludo no dice qué hacer. | José, `material-visual/01-tutor-ia/HALLAZGOS.md` | Corregido el 03/10 (`b7e979d`). | ✅ |
| TUT-07 | El indicador del nivel de ayuda (pista, pregunta guía, dónde está el error) parecía botones. | Jorge, QA-06 (S7) | Ahora es una línea de texto con tres puntos (04/10). **Jorge aún no lo verificó** (`S09-JOR01`). | ⏳ Jorge |
| TUT-08 | El degradado del encabezado del Tutor se veía mal. | José, sugerencias n.º 6, 7 y 8 | Resuelto y marcado en el panel (10/10). | ✅ |
| TUT-09 | El Tutor no sabía qué decía el ejercicio ni qué falló en la última prueba. | Jeider, 09/10 | El Tutor ve el enunciado y el resultado de la última prueba, y explica con un ejemplo a quien empieza en JavaScript. | ✅ |
| TUT-10 | Al fallar, ofrecer el Tutor (como Khanmigo). | Jeider, S08-J01 (03/10) | Se ofrece al fallar un caso o un intento (`47cce51`). | ✅ |
| TUT-11 | Medir cuánto tarda el Tutor y decidir si hace falta la respuesta «en vivo» (streaming). | Jeider, S09-J02 | El registro existe, pero **no hay uso que medir** (ver arriba). | 📋 ver TUT-14 |
| TUT-12 | Cada estudiante necesita su propia clave de Google AI Studio; sin ella no hay Tutor. | Bitácora N.º 8, riesgo 2 | Riesgo abierto. Puede ser la razón de que nadie lo use. | 📋 ver TUT-15 |
| TUT-13 | Revisión humana de los criterios del Tutor de la lista del profesor: MOD-01, MOD-03, UI-01, UI-02, UI-03, UI-05 y N-11 (Julio); MOD-02, MOD-04, UI-04 y META-01 a 03 (Pedro). | Bitácora N.º 9, `S09-V-*` | Sin comentarios aún. Fecha: **martes 13/10, 8:00 p. m.** Sin eso no se consolida la v2.0.0 (`S09-J03`) ni el pitch. | ⏳ Jorge, Julio y Pedro |
| TUT-14 | El QA de esta semana incluye «el Tutor en un ejercicio». | Bitácora N.º 9, `S09-JOR02` | Es la primera prueba del Tutor con los cambios del 09/10 hecha por otra persona. | ⏳ Jorge |
| TUT-15 | ¿Por qué casi nadie usa el Tutor? | Este análisis (12/10) | 4 estudiantes con clave y 0 mensajes en 24 h. | 📋 para decidir contigo |
| TUT-16 | En Admin → Sistema se ve «gemini-flash-latest» y otros nombres técnicos en inglés. | José, lista de interfaz UX-04 | Solo lo ve el administrador. Se puede dejar «Google Gemini (modelo rápido)» y el nombre técnico en la ayuda. | 📋 menor |

### 12/10 (tarde): Jeider probando en su celular

| # | Lo que dijo | Qué cambió | Estado |
|---|---|---|---|
| TUT-17 | En el ejercicio, el acceso al Tutor era «chiquito y apartado». | Arriba a la derecha, con su nombre, en la cabecera que siempre se ve; el botón flotante queda solo en computador. | ✅ `a1c9ed6` |
| TUT-18 | Con el teclado abierto, casi no se leen los mensajes (cabecera grande y tres franjas). | Escribiendo en el celular, la cabecera se compacta y las franjas se esconden; Enviar no cierra el teclado; en Android el teclado achica la página. | ✅ `a1c9ed6` |
| TUT-19 | Las notificaciones a pantalla completa son «muy bruscas», y se acumulan. | Una hoja bajo la cabecera con el fondo atenuado, «Sin leer / Todas» y grupos por día. Borrar una o las leídas, y el aviso de repasos de hoy borra los de días anteriores: el servidor ya está en `main` (`378fcb3`), la pantalla espera a que se despliegue. | 🔧 falta desplegar el backend |
| TUT-20 | En el celular no hay botón para la siguiente lección y elegir lección está menos desarrollado que en el PC. | Barra abajo en la lección: anterior, «Lección n de m» (abre el plan del curso con el estado de cada lección y qué abre cada módulo cerrado), siguiente y Tutor. Se esconde al bajar leyendo. | ✅ `a1c9ed6` |
| TUT-21 | José, UX-01: el inicio no dice qué abre el siguiente módulo. | El candado dice «Se abre con N % en …» con una barra hasta la meta, aunque el módulo esté plegado. | ✅ `a1c9ed6` |
| TUT-16 | José, UX-04: «gemini-flash-latest» en Administración. | Ahora dice «Gemini (modelo rápido)»; el nombre técnico queda al pasar el mouse. | ✅ `a1c9ed6` |

## Lo que propongo hacer, en orden

1. **Ver en el celular TUT-01 a TUT-04** (Vercel ya publicó el commit). Lo hace José en `S09-JO01` y, si quieres, tú antes
   con tu celular: abrir el Tutor, escribir, abrir las notificaciones, y un ejercicio de opción múltiple.
2. **TUT-15 · Que el equipo de la prueba tenga su clave.** Ya se sabe que solo 4 la tienen. Propuesta: un mensaje al
   grupo con los pasos (1 minuto en Google AI Studio) y, en STIRE, que el Tutor pida la clave **justo cuando más sirve**:
   al fallar un ejercicio, con el enlace y los pasos, en vez de solo al abrir el panel. Antes de programarlo, confirmar
   contigo.
3. **TUT-11 · Streaming, solo con datos.** Cuando haya 20 o más respuestas registradas: si la mediana pasa de unos 8 s,
   vale la pena mostrar la respuesta mientras llega; si no, basta con el «Pensando… (N s)» que ya existe.
4. **Recordar a Jorge, Julio y Pedro** sus criterios del Tutor (TUT-13) para el martes, y a Jorge que en su QA (TUT-07 y
   TUT-14) pruebe el Tutor en un ejercicio de programar fallado.

## Fuentes

- Trello, Semana 8: comentarios de José en `S08-JO02` (09/10) y `S08-V-JOSE` (09/10), `S08-E01` (05/10); de Jeider en
  `S08-J01`, `S08-J02` y `S08-J03`.
- [`MONITOREO_SEMANAL_08.md`](../../seguimiento/MONITOREO_SEMANAL_08.md) y [`MONITOREO_SEMANAL.md`](../../../MONITOREO_SEMANAL.md) (N.º 9).
- [`HALLAZGOS_JOSE_S08_2026-10-07.md`](./HALLAZGOS_JOSE_S08_2026-10-07.md), [`HALLAZGOS_JEIDER_S08_2026-10-07.md`](./HALLAZGOS_JEIDER_S08_2026-10-07.md).
- [`VERIFICACION_v2.0.0.md`](../listas-chequeo/VERIFICACION_v2.0.0.md).
- Panel de sugerencias (11) y registros del servidor, consultados el 12/10 con la cuenta de administrador de prueba.
