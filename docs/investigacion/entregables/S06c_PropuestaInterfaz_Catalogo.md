---
estado:     borrador — pendiente de verificación contra fuente original antes de incorporar al informe
verificado: 2026-09-14
fuente:     entregable 04 de docs/investigacion/PLAN_ENTREGABLES_INFORME.md
codigos:    no aplica (investigación, no ventanas)
---

# S06c — Catálogo de la propuesta de interfaz

> **Versión legible (Google Doc, con tablas reales; actualizada 2026-09-14 tras resolver la
> trazabilidad EST-V03 ↔ Ejercicio 1):**
> https://docs.google.com/document/d/1aTuyUiuH56t0SuH97NL9OTSOrioprdp1QUihlt24pjU/edit — en la
> misma carpeta de Drive que `Análisis y diseño actual.docx`. Ver `PLAN_ENTREGABLES_INFORME.md`
> §7 para qué copiar de ahí y dónde pegarlo en el informe.

> Parte del archivo de Figma *STIRE Soft — Sistema Visual* (clave `1MjKiDrjU65ezO3ztO0v4m`),
> inventariado en `CONTEXTO_STIRE.md` §5. Va en **§5.4.4**, apartado nuevo del informe (no existe
> hoy). **Límite estricto (ver `CONTEXTO_STIRE.md` §2):** esto es una propuesta de interfaz —
> "prototipo no funcional de media fidelidad", "maqueta" — nunca "el sistema desarrollado" ni
> "la plataforma". Las 9 vistas de administrador quedan fuera del cuerpo del informe (no
> corresponden a ninguna unidad de análisis) y solo se listan en el anexo por completitud.
>
> **Antes de pegar esto en el informe:** contrastar el enunciado del ejercicio y cualquier cifra
> del diagnóstico reutilizada aquí contra `Sesion2 recurso ejercicios.docx` y `SESIÓN 2.docx`.

---

## Producto 1 — Catálogo de pantallas, argumento de los tokens y estado del recorrido

### 1. Corrección de alcance aplicada antes de fichar (2026-09-14)

Al revisar el archivo para producir este entregable se encontraron tres nombres de persona con
apariencia real, además de los dos ya señalados en `CONTEXTO_STIRE.md` §5 (Carlos Ruiz / Ana
Martínez con correo institucional, en DOC-V04 y DOC-V05): la misma pareja de nombres, sin correo
esta vez, reaparecía en **DOC-V06 · Mensajes**, junto con «Prof. Roberto Toscano (Coordinación)»
— un apellido idéntico al del director de esta investigación, en un rol ficticio dentro de la
maqueta. Como esta vista también entraría al catálogo del anexo, se corrigieron los cinco casos
directamente en Figma, no solo los dos ya documentados:

| Pantalla | Antes | Después |
|---|---|---|
| DOC-V04 · Rendimiento del Grupo | «Carlos Ruiz — carlos.ruiz@unicor.edu.co» | «Estudiante 01» |
| DOC-V04 · Rendimiento del Grupo | «Ana Martínez — ana.martinez@unicor.edu.co» | «Estudiante 02» |
| DOC-V05 · Detalle de Estudiante | «Carlos Ruiz — carlos.ruiz@unicor.edu.co» | «Estudiante 01» |
| DOC-V06 · Mensajes | «Carlos Ruiz» | «Estudiante 01» |
| DOC-V06 · Mensajes | «Ana Martínez» | «Estudiante 02» |
| DOC-V06 · Mensajes | «Prof. Roberto Toscano (Coordinación)» | «Coordinación Académica» |

Se reutilizó el mismo identificador («Estudiante 01», «Estudiante 02») para la misma persona
ficticia en las distintas pantallas donde aparece, y se añadió en el pie de DOC-V04, DOC-V05 y
DOC-V06 el texto «Datos simulados con fines ilustrativos.», siguiendo la instrucción ya registrada
en `PLAN_ENTREGABLES_INFORME.md` §5. Ninguna otra pantalla ni dato numérico fue alterado.

### 2. Ficha por pantalla (vistas base; estudiante y docente)

Cada vista existe además en los estados vacío, error y —las de estudiante— completado; esta
tabla ficha únicamente el estado por defecto de cada una de las doce vistas pedagógicamente
relevantes, que es el estado seleccionado para figurar en el cuerpo del informe. El catálogo
completo con los cuatro estados de cada vista (57 marcos en total, ver `CONTEXTO_STIRE.md` §5)
queda para el anexo, no para el cuerpo.

| ID | Actor | Propósito | Característica(s) que materializaría | Elementos clave |
|---|---|---|---|---|
| **EST-V01 · Inicio** | Estudiante | Punto de entrada; retomar la unidad en curso y ver un resumen del propio estado. | CAR-01 (retomar según el nivel de dominio propio), CAR-06 (recomendación y estímulo de progreso) | Tarjeta "Continuar donde ibas" con la última unidad; tarjeta "Repasos de hoy" con contador; tarjeta "Dominio del módulo" con porcentaje; menú lateral con cada módulo marcado como dominado, en progreso o bloqueado. |
| **EST-V02 · Lección** (con su variante "trazado paso 3 de 5", seleccionada como figura) | Estudiante | Presentar el contenido teórico de la unidad y el trazado paso a paso de su ejecución, antes de la práctica. | CAR-01 (contenido priorizado al nivel de entrada), CAR-03 (el trazado paso a paso operacionaliza la orientación progresiva antes de llegar al ejercicio) | Explicación del ciclo `while`, bloque de código de referencia, control "Paso N de 5" con navegación anterior/siguiente, acción "Consultar Tutor IA" disponible desde la propia lección. |
| **EST-V03 · Ejercicio** | Estudiante | Resolver una actividad de práctica y recibir un veredicto inmediato por caso de prueba. | CAR-02 (veredicto ✔/✖ inmediato por caso, no solo un resultado final), CAR-04 (mismo destino al reingresar desde un ítem de repaso, ver S05a fila CAR-02/CAR-04) | Enunciado "Suma de dos números"; editor de código; casos de prueba con resultado individual; acciones probar, entregar, pedir pista y reiniciar. |
| **EST-V04 · Tutor IA** (ventana modal) | Estudiante | Orientar ante una dificultad sin entregar la solución directa. | CAR-03 (pregunta que descompone el problema en vez de resolverlo) | Advertencia "Respuestas generadas por IA: verifícalas ejecutando tu algoritmo"; intercambio de pregunta y respuesta socrática; campo de pregunta; acción "Cerrar (conserva el código)". |
| **EST-V05 · Repasos** | Estudiante | Presentar la agenda de repetición espaciada con su urgencia y el razonamiento del intervalo. | CAR-04 (los cuatro niveles de urgencia y la justificación visible del intervalo) | Cuatro ítems con nivel de urgencia (al día, vence pronto, vencido, crítico) y razón en texto; aviso "Recomendaciones: backend pendiente"; acciones iniciar repaso (propuesto), posponer con justificación, ver historial. |
| **EST-V06 · Mi Progreso** | Estudiante | Mostrar el avance real del estudiante con métricas interpretables, no solo una nota. | CAR-05 (mastery general, efectividad y unidad más débil, con umbral de avance visible) | Mastery general con umbral de desbloqueo (70%); efectividad expresada como proporción de aciertos al primer intento; unidad más débil señalada con recomendación explícita; acciones filtrar por módulo, abrir unidad más débil, exportar resumen. |
| **DOC-V01 · Mis Clases** | Docente | Punto de entrada docente; listar los cursos asignados con alertas de atención. | No correspondería de manera directa a ninguna de las seis características — es una vista de administración docente del curso, complementaria a la propuesta pero no una materialización de ella. | Tarjeta por clase con matriculados, módulo en curso y alerta (estudiantes rezagados / entregas sin revisar); acciones guardar borrador, exportar reporte, crear clase. |
| **DOC-V02 · Contenidos y Temas** | Docente | Administrar las unidades de contenido del curso y su estado de publicación. | No correspondería de manera directa a ninguna de las seis características (administración de contenido, no del tutor). | Lista de unidades con módulo, orden, dificultad y estado (publicado / borrador); una unidad señalada "sin ejercicio asociado"; acciones descartar cambios, vista previa, nueva unidad. |
| **DOC-V03 · Crear Ejercicio** | Docente | Definir un ejercicio y sus casos de prueba, incluidos los ocultos y su peso. | No correspondería de manera directa a ninguna de las seis características (herramienta de autoría docente). | Metadatos del ejercicio (unidad, dificultad, puntaje, intentos permitidos); casos de prueba públicos y ocultos con su peso; acción "Ejecutar verificación en Sandbox". |
| **DOC-V04 · Rendimiento del Grupo** | Docente | Ofrecer al docente una vista agregada del dominio y la actividad de su grupo. | CAR-05, desde la perspectiva docente — la misma noción de dominio y progreso que el estudiante vería en EST-V06, agregada por cohorte. | Resumen de cohorte (dominio promedio, tasa de aprobación, matriculados); filas por estudiante con alerta ("Alerta Cognitiva"), dominio individual y última actividad; acciones filtrar por dominio, exportar CSV, ver detalle. |
| **DOC-V05 · Detalle de Estudiante** | Docente | Mostrar al docente el estado individual de un estudiante, incluida su agenda de repaso. | CAR-05 (dominio individual comparado con el promedio del grupo) y CAR-04 (estado de la repetición espaciada — factor de facilidad, próximo repaso y nivel de urgencia — visible también para el docente). | Cabecera con alerta y dominio individual; último envío con resultado por caso; bloque "Estado de repetición espaciada" con factor de facilidad y urgencia del próximo repaso; acción enviar mensaje al estudiante. |
| **DOC-V06 · Mensajes** | Docente | Canal de comunicación docente-estudiante dentro del tutor. | No correspondería de manera directa a ninguna de las seis características (canal de comunicación general, no una función del tutor sobre el aprendizaje). | Bandeja con remitente, estado de lectura y fragmento del mensaje; acciones marcar todo como leído, ver enviados, nuevo mensaje. |

**Sobre las filas sin CAR-0X.** Cuatro de las doce vistas (DOC-V01, DOC-V02, DOC-V03, DOC-V06) no
se forzaron a una característica porque, en rigor, las seis características definidas en el
apartado 5.4.1 describen lo que el tutor haría **por y para el estudiante**; esas cuatro vistas
son superficies de administración docente del curso, necesarias para que el resto funcione pero
no una materialización directa de ninguna característica. Marcarlas de todos modos habría sido
forzar una correspondencia inexistente — el mismo criterio de rigor que en el resto de este
informe evita inventar datos, aplicado aquí a evitar inventar trazabilidad.

### 3. Argumento sobre los tokens visuales (≈230 palabras)

El sistema visual elaborado para la propuesta define dos conjuntos de estados que operarían como
la traducción directa del modelo pedagógico preliminar a la interfaz. El primero, el token
`estado-unidad`, distinguiría entre contenido dominado, en progreso, por iniciar y bloqueado; esta
distinción representaría visualmente el aprendizaje por dominio con prerrequisitos que estructura
la etapa de exploración del modelo pedagógico preliminar, de modo que el estudiante no avanzaría a
una unidad para la que no estuviera preparado. El segundo, el token `urgencia-repaso`, distinguiría
entre un concepto al día, uno que vence pronto, uno vencido y uno en estado crítico; esta escala
representaría visualmente la lógica de la repetición espaciada —el mismo intervalo creciente
especificado en S05b, apartado 4— de forma que la urgencia mostrada en pantalla correspondería
siempre al cálculo del intervalo, no a una apreciación arbitraria del diseño.

Ambos tokens compartirían, además, una misma decisión de accesibilidad: cada estado combinaría
color con un indicador de forma (un símbolo o un ícono distinto por estado), de modo que la
interfaz seguiría siendo legible en escala de grises o para una persona con una condición de visión
cromática atípica. Esta doble codificación —color más forma— sería, en sí misma, evidencia de que
la propuesta no se limitaría a decorar el modelo pedagógico, sino que lo operacionalizaría de forma
verificable en cada pantalla donde estos tokens aparecieran, desde el resumen del estudiante en
EST-V01 hasta la vista agregada del docente en DOC-V04.

### 4. Estado del recorrido de navegación (actualizado 2026-09-14 — ya no es un pendiente)

La versión original de este entregable pedía especificar un recorrido de 5-6 pantallas para la
página "Prototipo" del archivo, entonces vacía. Esa página **ya fue construida** durante el
trabajo de esta sesión y quedó renombrada **"🎓 Recorrido de investigación — STIRE"**, con siete
diapositivas de tamaño fijo (1600×900): una de presentación y seis, una por cada característica
CAR-01 a CAR-06, cada una con la pantalla real correspondiente (Inicio, Lección/trazado, Ejercicio,
Tutor IA, Repasos, Mi Progreso) junto a su explicación. Ninguna pantalla original del archivo fue
alterada; el recorrido usa duplicados reescalados de las pantallas reales. La cita de este archivo
en el informe sigue la regla ya fijada en `PLAN_ENTREGABLES_INFORME.md` §6.1: entrada en
Referencias, nunca hipervínculo en el cuerpo.

### 5. Capturas — producidas (2026-09-14)

Los cuatro PNG de las figuras seleccionadas ya se capturaron directamente desde los marcos reales
(vía la API de captura de Figma, no una reconstrucción) y quedaron guardados en
`docs/investigacion/figuras/`:

| Figura | Archivo | Resolución nativa |
|---|---|---|
| EST-V02, trazado paso 3 de 5 (nodo `63:2`) | `S06c_fig1_EST-V02_trazado.png` | 1280×850 |
| EST-V04, Tutor IA (nodo `23:55`) | `S06c_fig2_EST-V04_tutorIA.png` | 1280×850 |
| EST-V05, Repasos (nodo `27:55`) | `S06c_fig3_EST-V05_repasos.png` | 1280×850 |
| DOC-V04, Rendimiento del Grupo (nodo `104:118`) | `S06c_fig4_DOC-V04_rendimiento.png` | 1280×850 |

**Nota sobre la resolución.** Esta captura es el render nativo de Figma a través de la API del
conector, no un multiplicador de exportación (no es literalmente el resultado de `Exportar → PNG,
2x` desde la interfaz de Figma, que sí permite forzar el doble de densidad de píxel). Para la
mayoría de usos en un documento de Word a tamaño de página esta resolución (1280×850, ~150 dpi a
un ancho de figura de ~8.5") es suficientemente nítida; si al maquetar el informe una figura se ve
borrosa a su tamaño final, ese es el único caso en el que valdría la pena repetir la exportación
manual a 2× desde Figma directamente. La captura de DOC-V04 ya incluye la corrección de privacidad
(«Estudiante 01/02», sin correos, con el aviso de datos simulados en el pie).

---

## Producto 2 — Texto para el informe (§5.4.4) y pies de figura

### Texto (≈650 palabras)

Como resultado del proceso de diseño, se propondría una interfaz preliminar que materializaría, en
un conjunto de pantallas elaboradas en el archivo de diseño del proyecto, las seis características
definidas en el apartado 5.4.1 y las etapas del modelo pedagógico preliminar descrito en el
apartado 5.4.2. Esta propuesta correspondería a un prototipo no funcional de media fidelidad: una
representación visual de la interacción esperada entre el estudiante, el docente y el tutor
inteligente, sin implicar que alguno de sus componentes hubiera sido desarrollado o evaluado
técnicamente dentro del alcance de esta investigación.

La interfaz del estudiante organizaría la experiencia alrededor de un menú persistente que
indicaría, para cada módulo, si estuviera dominado, en progreso o bloqueado por un prerrequisito
pendiente —operacionalización visual directa del aprendizaje por dominio que estructura la etapa
de exploración—. Desde la pantalla de inicio, el estudiante retomaría la unidad en curso y vería un
resumen de su dominio y de sus repasos pendientes, en coherencia con CAR-01 y CAR-06. Al avanzar a
una lección, la interfaz mostraría el contenido teórico junto con un trazado paso a paso de su
ejecución —recurso que respondería de manera directa al hallazgo del diagnóstico según el cual una
parte relevante de la muestra declaró dificultad para seguir el rastro mental de cómo se transforma
una variable en cada iteración—, antes de que el estudiante llegara al ejercicio de práctica
correspondiente.

En el ejercicio, cada caso de prueba mostraría de inmediato si habría sido resuelto correctamente,
en vez de esperar a un resultado final único, en coherencia con CAR-02. Si el estudiante solicitara
ayuda, el Tutor IA respondería mediante una ventana modal con una pregunta que descompondría el
problema —por ejemplo, orientando sobre las tres condiciones necesarias de un ciclo `while`— en
lugar de entregar la solución directa, materializando CAR-03; la propia interfaz advertiría, en
ese mismo punto, que las respuestas serían generadas automáticamente y deberían verificarse
ejecutando el algoritmo propio, consideración ética que se retomaría en el apartado correspondiente
del informe. La agenda de repasos distinguiría cuatro niveles de urgencia con su razón visible
—por ejemplo, un concepto dominado hacía diez días para el cual un repaso corto consolidaría la
memoria—, operacionalizando la regla de intervalos crecientes especificada en el modelo pedagógico
preliminar (CAR-04); y una vista de progreso reuniría el dominio general, la efectividad y la
unidad más débil del estudiante, con su recomendación explícita, en coherencia con CAR-05.

La interfaz docente replicaría, desde una perspectiva distinta, el mismo seguimiento de dominio y
progreso: una vista agregada mostraría el dominio promedio y la tasa de aprobación del grupo, con
alertas sobre los estudiantes en mayor riesgo, mientras que una vista de detalle individual haría
visible, también para el docente, el estado de la repetición espaciada de un estudiante particular
—su factor de facilidad y la urgencia de su próximo repaso—. Ambas vistas compartirían con CAR-05
el mismo argumento de fondo, aplicado ahora al rol de acompañamiento del docente antes que al del
propio estudiante.

Dos decisiones de diseño transversales respaldarían la coherencia de esta propuesta con el
deslinde de alcance declarado para toda la investigación. Primero, cada estado visual combinaría
color con un indicador de forma, de modo que la interfaz seguiría siendo legible en escala de
grises o para una persona con una condición de visión cromática atípica. Segundo, la propia
interfaz distinguiría lo propuesto de lo construido: acciones como iniciar un repaso llevarían el
rótulo explícito "(propuesto)", y una de las vistas advertiría directamente que su funcionalidad de
recomendaciones dependería de un componente aún no construido, de modo que el diseño mismo
reforzaría, en cada pantalla, la cláusula de deslinde de esta investigación.

*(Ampliar con la introducción de las cuatro figuras seleccionadas en el punto exacto del texto
donde correspondan, y verificar el conteo final de palabras tras insertar los pies de figura.)*

### Pies de figura APA (7.ª ed.) para las cuatro figuras seleccionadas

> Referencia completa a incluir en el capítulo de Referencias (ver `PLAN_ENTREGABLES_INFORME.md`
> §6.1): `STIRE (2026). STIRE Soft — Sistema Visual [Archivo de diseño]. Figma.
> https://www.figma.com/design/1MjKiDrjU65ezO3ztO0v4m/STIRE-Soft-%E2%80%94-Sistema-Visual?m=auto&t=sehRLC79tLkTXYx3-1`.
> El número de figura exacto depende de
> resolver primero el arreglo 5 de `CONTEXTO_STIRE.md` §7 (numeración de figuras) — se deja
> `[N]` como marcador.

1. *Figura [N].* Trazado paso a paso de un ciclo `while` (EST-V02, paso 3 de 5, nodo `63:2`).
   Nota. Elaboración propia a partir de STIRE (2026).
2. *Figura [N+1].* Ventana modal del Tutor IA con orientación mediante una pregunta (EST-V04,
   nodo `23:55`). Nota. Elaboración propia a partir de STIRE (2026).
3. *Figura [N+2].* Vista de repasos con niveles de urgencia y razonamiento visible del intervalo
   (EST-V05, nodo `27:55`). Nota. Elaboración propia a partir de STIRE (2026).
4. *Figura [N+3].* Vista docente de rendimiento del grupo (DOC-V04, nodo `104:118`). Nota.
   Elaboración propia a partir de STIRE (2026). Los nombres de estudiante mostrados son datos
   simulados con fines ilustrativos.

### Párrafo de trazabilidad — EST-V03 ↔ Ejercicio 1 de sesión 2 (≈100 palabras)

El enunciado mostrado en la pantalla de ejercicio de la propuesta —"Suma de dos números", con
entrada "5 7" y salida esperada "12"— correspondería directamente al Ejercicio 1 del recurso
utilizado en la sesión 2 del proceso de recolección (`Sesion2 recurso ejercicios.docx`), no a un
ejemplo genérico creado para la maqueta. Esta correspondencia sería intencional: buscaría mostrar
que la propuesta de interfaz no ilustraría una interacción hipotética cualquiera, sino un caso ya
usado con la población real de estudiantes de la asignatura, de modo que la trazabilidad se
extendiera desde el instrumento diagnóstico hasta la pantalla que representaría, en la propuesta,
el momento de práctica del estudiante.

**Verificado 2026-09-14 contra la fuente real.** `Sesion2 recurso ejercicios.docx` (Google Drive,
ID `1aybEaqfOOqFERBN0qciBefhMU45Dkyko`, carpeta "Sesion 2") contiene, textualmente, "EJERCICIO 1:
SUMA DE DOS NÚMEROS — ENUNCIADO: Diseña un algoritmo que solicite al usuario dos números enteros y
muestre la suma de ambos." Coincide con el enunciado de EST-V03. El marcador `[CITA PENDIENTE]`
que tenía este párrafo queda resuelto: la trazabilidad es real, no una coincidencia asumida.

---

## Pendientes de este entregable

- ~~Verificar contra `Sesion2 recurso ejercicios.docx` la trazabilidad EST-V03 ↔ Ejercicio 1.~~ **Resuelto 2026-09-14** — ver apartado de trazabilidad arriba.
- Resolver la numeración de figuras (arreglo 5, `CONTEXTO_STIRE.md` §7) antes de fijar los números `[N]` de los pies de figura.
- ~~Exportar los cuatro PNG desde los marcos reales listados.~~ **Resuelto 2026-09-14** — ver apartado 5 arriba (`docs/investigacion/figuras/`); repetir a 2× manual desde Figma solo si la nitidez no basta al maquetar el documento final.
- ~~Publicar la versión Google Doc de este entregable.~~ **Resuelto.**
- Decidir si el catálogo completo de las doce vistas en sus cuatro estados (57 marcos) se transcribe como tabla de anexo o se referencia solo por el archivo de Figma.
