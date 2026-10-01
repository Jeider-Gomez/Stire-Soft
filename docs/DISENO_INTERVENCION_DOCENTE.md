---
estado:     propuesta para el dueño del proyecto (decisiones en §8)
fecha:      2026-09-30
---

# El docente que interviene: espacios de entrega, intervención y formas de calificar

**Pedido del dueño (30/09).** Que el docente cree «espacios de proyectos» dentro de su clase, con límite de versiones y la
hora de cada envío y de cada cambio de nota; que intervenga a nivel general e individual, por ejemplo asignando una
actividad personalizada que suba el dominio si él la considera bien hecha; y pensar a futuro en formas de calificar. STIRE
debe ser una herramienta que trabaje **con** el docente, no aislada. Pidió también investigar de verdad cómo lo hacen otras
plataformas (pantallas, flujos, qué destaca), cuestionar la aplicación y cuestionarlo a él.

**Cómo se hizo.**
- Documentación oficial de Google Classroom, Canvas, Moodle, Khan Academy, IXL, ASSISTments, MATHia LiveLab, Brightspace,
  Gradescope, Codio y Khanmigo, con capturas de sus guías.
- Recorrido de STIRE en producción como Laura (docente) y Luisa (estudiante), con capturas a 1440 px.
- Artículos comprobados en Crossref (§9).

---

## 1. Lo que encontré en STIRE (y no me gusta)

Recorrido del 30/09 en `stire-soft.vercel.app`. Son hipótesis de diseño; se discuten.

1. **El dominio engaña.** Inicio del docente: «Dominio promedio **98 %**». Inicio de Luisa: «Dominio **100 %** — Ya
   dominas lo que llevas». Pero el curso tiene 17 unidades y el grupo ha trabajado **5**. El número es cierto («de lo que
   llevas») y aun así comunica lo contrario: que el curso está casi terminado.
   - Khan Academy separa el **dominio del curso** (sobre todas las habilidades) del avance.
   - **Propuesta:** mostrar siempre dos cosas: «**Avance: 5 de 17 unidades**» y «**Dominio en lo trabajado: 98 %**». Es lo
     primero que arreglaría, porque toda intervención del docente se apoya en esos números.
2. **«Unidad» significa dos cosas.** El estudiante ve «Unidad 1 · Introducción a la algoritmia — **6 Unidades**». El
   docente ve «Unidad 1» con botones «Nuevo tema» y «+ Nueva unidad» dentro. Para un estudiante nuevo, eso es confuso.
   - El problema viene de usar los nombres del plan de curso (FDOC-088) para el primer nivel.
   - **Propuesta:** el primer nivel se llama como el docente quiera (ya estaba en la hoja de ruta, punto 8) y por defecto
     «Módulo»; «unidad» queda solo para la unidad de aprendizaje.
3. **El panel detecta pero no deja actuar.** «¿A quién ayudo ahora?» dice quién está bloqueado, qué tema es el más difícil y
   quién está listo para más. Para hacer algo, el docente tiene que irse a Mensajes o a Contenidos y volver.
   - IXL pone «Suggest this skill» **dentro** del informe de dificultades.
   - Canvas pone «Message Students Who…» **en la columna de la tarea** del libro de notas.
4. **La navegación es por herramienta, no por clase.** El menú del docente es Mis Clases, Contenidos, Crear Ejercicio,
   Rendimiento, Proyectos, Mensajes. Cada página tiene su propio selector de clase.
   - Classroom (Tablón, Trabajo de clase, Personas, Calificaciones) y Canvas (Inicio, Módulos, Personas, Calificaciones)
     entran a **una clase** y ahí está todo.
   - Con 3 clases, Laura cambia el selector en cada pantalla.
5. **Las tarjetas de cifras no llevan a ninguna acción.** «13 estudiantes», «98 %», «0 mensajes», «0 en rezago» ocupan la
   primera pantalla del docente. No le dicen qué hacer hoy.
   - Lo que falta es una lista de **pendientes**: por revisar, bloqueados, sin actividad esta semana.
6. **La ruta del estudiante es una lista larga de botones iguales.** 17 filas, cada una con «Practicar», y 5 avisos de «Se
   está olvidando» a la vez.
   - Duolingo enseña **un** siguiente paso evidente.
   - STIRE ya tiene «Continúa con…» arriba, pero abajo todo pesa lo mismo: lo dominado, lo que toca y lo que falta.
7. **Repetición visual en Contenidos.** Cada tema lleva «Nueva unidad», «Editar» y «Archivar» (este último en rojo), aunque
   el docente no vaya a usarlos. No se ve cuántos ejercicios tiene cada unidad ni si les faltan hermanas.

Los puntos 1, 3 y 5 tocan directamente el pedido: un docente que interviene necesita números honestos y la acción junto al
dato.

---

## 2. Cómo lo hacen otros: lo que conviene copiar

### 2.1 Entregas, versiones y el historial

| Plataforma | Qué hace | Qué aprender |
|---|---|---|
| **Google Classroom** | La tarea tiene una página «Trabajo de los alumnos» con estados *Asignado*, *Entregado*, *Calificado* y *Devuelto*. Con «Devolver», el alumno puede reenviar. «**Ver historial**» muestra cómo cambió la nota y cuántas veces entregó. Los comentarios privados no se pueden editar ni borrar | El ciclo **entregar → devolver → reentregar** y un historial visible |
| **Canvas SpeedGrader** | Desplegable «Submission to view»: cada intento con fecha y hora y aviso si llegó tarde. El docente puede comparar intentos | Corregir de seguido, con el intento elegido junto a la nota |
| **Moodle (Tarea)** | «Intentos permitidos»: reabrir **manualmente** o **automáticamente** hasta aprobar, con un máximo. Cada intento guarda su nota y su retroalimentación. Guías universitarias recomiendan **1 intento** en lo sumativo | El límite de versiones lo pone el docente **por tarea**, y además puede **reabrir** a un estudiante |
| **Gradescope (programación)** | Autocalificación y rúbrica manual en la misma tarea. Historial completo de envíos, con una versión «activa» que es la que cuenta | En programación conviven la prueba automática y el juicio del docente |

**El orden de los elementos en las pantallas** (de las capturas de las guías):
- **Classroom:** lista de estudiantes a la izquierda, agrupada por estado; la nota se escribe en la misma fila; el trabajo
  se abre a la derecha.
- **SpeedGrader:** el trabajo ocupa el centro; la columna derecha tiene el intento, la nota, la rúbrica y el comentario;
  arriba, flechas para pasar al siguiente estudiante sin volver a la lista.

**Para STIRE:** la revisión de hoy (`/docente/proyectos/:id`) ya tiene el código y la vista previa al centro y el formulario
debajo. Le faltan el **siguiente/anterior** y el **historial**.

### 2.2 Intervenir: del dato a la acción

| Plataforma | Qué hace | Qué aprender |
|---|---|---|
| **Canvas Mastery Paths** | Tras calificar una tarea «fuente», el estudiante recibe automáticamente un contenido según **tres rangos de nota** (p. ej., <60 % refuerzo, 60–90 % práctica, >90 % reto). Cada rango puede ofrecer opciones «o». La guía lo resume así: no requiere trabajo extra aparte de calificar | **Refuerzo y reto como reglas** que el docente define una vez |
| **Canvas «Message Students Who…»** | Desde la columna de una tarea: escribir a quienes no han entregado, no han sido calificados o sacaron menos (o más) de X | La intervención de grupo es **un clic** desde el dato |
| **IXL «Trouble Spots»** | Un estudiante con 3 o más fallos en un nivel de una habilidad aparece en un grupo automático. Botón «Suggest this skill» para asignársela a ese grupo | Grupos **automáticos** por dificultad común, con acción en la misma tarjeta |
| **Khan Academy** | El docente asigna contenido a estudiantes concretos y pone **metas de dominio** del curso o de la unidad. Su estudio: con metas de dominio del curso, los estudiantes avanzan más y rinden mejor en una prueba externa, **con menos tiempo del docente**. Las tareas suplementarias funcionan mejor **usadas con moderación**, para cerrar brechas o para adelantados | Pocas asignaciones bien dirigidas, no muchas |
| **ASSISTments** | Práctica de destreza: dominio = **3 seguidas** correctas; si no lo logra en 10, el sistema **para y avisa al docente**. Un ensayo aleatorio con 2 850 estudiantes mostró mejores resultados; **los de bajo rendimiento previo fueron los que más ganaron** (Roschelle et al., 2016) | Un **tope** que convierte el atasco en aviso al docente, en vez de práctica infinita |
| **MATHia LiveLab** | Distingue el error **productivo** (se equivoca pero avanza) del **improductivo** (no va a avanzar sin ayuda). Marca a este último con un salvavidas en el tablero de clase | No toda dificultad pide intervención; avisar solo de la que sí |
| **Brightspace (agentes inteligentes)** | Reglas que revisan el curso en un horario («sin entrar en 7 días», «nota < 70») y envían un correo | Útil, pero con riesgo de mensajes automáticos fríos |
| **Codio** | Tablero por unidad con tiempo dedicado en dos semanas y un gráfico de nota frente a tiempo: quién necesita ayuda, quién un reto y quién está en su zona de desarrollo próximo | Ver nota **y esfuerzo** juntos |
| **Khanmigo (docente)** | «Class Snapshot»: resumen de los últimos 7 días (tiempo, tareas completadas, avance de dominio) | Un **resumen semanal** en vez de un tablero que hay que interpretar |

### 2.3 Lo que dice la investigación

- **Las correcciones del aprendizaje para el dominio.** Es lo que pide el dueño. Bloom propuso que, tras una evaluación
  formativa, quien no alcanza el criterio reciba **correctivos** (otra explicación, otra actividad) y una **segunda
  evaluación paralela**, y quien sí lo alcanza, **actividades de profundización** (Guskey, 2007).
  - Un metaanálisis de programas de aprendizaje para el dominio encontró efectos positivos sobre el rendimiento (Kulik,
    Kulik y Bangert-Drowns, 1990).
  - STIRE ya tiene la mitad automática (hermanas del mismo nivel, retos). Falta la mitad **humana**: que el docente elija o
    cree el correctivo.
- **La retroalimentación puede empeorar el desempeño.** En el metaanálisis de Kluger y DeNisi (1996), una parte importante
  de las intervenciones de retroalimentación **bajó** el desempeño: funciona cuando apunta a la tarea, no a la persona
  (Hattie y Timperley, 2007; Shute, 2008).
- **Nota y comentario juntos.** Butler (1988), con estudiantes de 5.º y 6.º: los que recibieron **solo comentarios**
  mostraron más interés y mejor desempeño. **Nota + comentario tuvo el mismo efecto que solo nota**, porque la nota se come
  el comentario.
  - Es con niños, no con universitarios, y es un estudio. Pero contradice directamente la idea de que «las dos es mejor»
    (ver §7).
- **Los tableros cambian la práctica cuando se usan seguido.** En 38 clases, los docentes consultaron el tablero 8,3 veces
  por clase. Las acciones más comunes fueron retroalimentación de la tarea y del proceso, y quienes lo consultaban más daban
  retroalimentación más variada (Molenaar y Knoop-van Campen, 2019).
  - La intervención tiene que estar **en el camino** del docente, no en una pantalla aparte.
- **Docente e IA se complementan.** Con un aviso en tiempo real de quién estaba atascado o abusando de la ayuda, los
  docentes atendieron primero a quien lo necesitaba y **los estudiantes aprendieron más** (Holstein, McLaren y Aleven,
  2018). El diseño se hizo **con** los docentes (Holstein et al., 2019).
- **Una intervención tiene que cerrar el ciclo.** Wise (2014) propone que la intervención basada en analítica diga qué se
  espera que haga el estudiante y que luego se revise si funcionó. Casi ningún tablero muestra **si la ayuda sirvió**.
- **Tres niveles de intervención**, como pide el dueño: general, por grupo e individual. Es la lógica de respuesta a la
  intervención (RTI): todos, luego los grupos que no responden y luego el caso individual (Fuchs y Fuchs, 2006).

---

## 3. Espacios de entrega: Proyectos reorganizado

Hoy un estudiante envía su proyecto a «una clase» si el docente activó «recibir proyectos». Eso no tiene enunciado,
fecha, ni lugar en el curso. El dueño tiene razón: el docente debe **crear el espacio**.

### 3.1 Qué es un espacio de entrega

Un **nuevo tipo de actividad** de la unidad, «**Entrega**», junto a los 7 tipos de ejercicio. Así hereda lo que ya
existe:
- el orden dentro de la unidad;
- borrador y publicado;
- la dificultad, es decir, su casilla;
- y que su nota cuente para el dominio (§5).

El docente lo crea en Contenidos, dentro de la unidad, con:

| Campo | Valor por defecto | Nota |
|---|---|---|
| Título y consigna (Markdown) | — | Qué hay que hacer y cómo se valora |
| Qué se entrega | Un proyecto de STIRE (web o JavaScript) | Después: pseudocódigo o diagrama (fase 4 de Proyectos) |
| Código inicial | Ninguno | Opcional: «Empezar desde esta plantilla» crea el proyecto del estudiante con esos archivos |
| Abre / cierra | Sin fechas | Si cierra, se puede aceptar tarde (y queda marcado «tarde») |
| **Máximo de versiones** | **3** | De 1 a 10. El docente puede **reabrir** a un estudiante concreto (+1 versión), como Moodle |
| Calificación | **Comentario y, si quiere, nota de 0,0 a 5,0** | Ver §7: nota opcional |
| Cuenta para el dominio de la unidad | Sí | Como una casilla más, de la dificultad elegida (§5) |
| Para quién | Toda la clase | O estudiantes elegidos (§4) |

### 3.2 Lo que ve el estudiante

- En la unidad aparece como una actividad más: «**Entrega:** Calculadora con funciones · cierra el 15 oct · 0 de 3
  versiones».
- En su inicio, en «Pendientes», si tiene fecha.
- Al abrirla: la consigna, el botón «**Entregar uno de mis proyectos**» (o «Empezar desde la plantilla») y su
  **historial**:

```
Calculadora con funciones                         2 de 3 versiones · cierra 15 oct 23:59
───────────────────────────────────────────────────────────────────────────────
● Versión 2   enviada 1 oct, 08:02 (tarde)          Sin revisar todavía
● Versión 1   enviada 30 sep, 19:35                 Revisada 30 sep, 20:10 · nota 4,0
               «Bien separadas las funciones. Falta validar la división por cero.»
               Nota cambiada 30 sep, 20:31: 4,0 → 4,5 (Laura Martínez)
```

### 3.3 Lo que ve el docente

- **Página de la entrega**: lista de estudiantes por estado (*Sin entregar*, *Por revisar*, *Revisado*, *Tarde*) como
  Classroom, y «Escribir a los que no han entregado» como Canvas.
- **Revisión**: la de hoy, más:
  - selector de versión con fecha y hora;
  - «siguiente sin revisar» sin volver a la lista;
  - el historial completo;
  - «Reabrir: +1 versión».
- **Bandeja «Por revisar»** de la clase, que junta todas las entregas pendientes.

### 3.4 El historial que se pide

Una tabla de **eventos** de cada entrega: enviada, revisada, nota cambiada (con el valor anterior), comentario editado,
reabierta, cada uno con **fecha, hora y quién lo hizo**. Nada se sobrescribe sin dejar rastro. Es lo que hace «Ver
historial» en Classroom y lo que da confianza si un estudiante reclama una nota.

### 3.5 Qué pasa con lo de hoy

- «Recibir proyectos» por clase desaparece.
- «Mis proyectos» sigue siendo el espacio libre del estudiante: ahí crea y prueba. Desde una **entrega** elige qué proyecto
  enviar.
- Los 2 envíos de prueba en producción se borran.

---

## 4. Intervenir: general, por grupo, individual

La regla: **la acción va donde aparece el dato**, y cada intervención **se cierra** mostrando si funcionó.

### 4.1 Asignar a estudiantes concretos

Cualquier actividad (un ejercicio o una entrega) puede ser «para toda la clase» o «para estos estudiantes», como «Assign to»
de Classroom.
- Para los demás no existe: no la ven y **no cuenta en su dominio**. Si contara, les bajaría el dominio por algo que no
  les tocaba.
- Hoy toda actividad es de toda la unidad.

### 4.2 Las tres puertas

| Nivel | Dónde nace | Acción con un clic |
|---|---|---|
| **General** (toda la clase) | «Tema más difícil» del mapa de calor | «Reforzar con el grupo»: publicar una lección o un recurso más en esa unidad, programar un repaso para todos, o escribir a la clase |
| **Por grupo** | «Bloqueados», «Dijo me siento seguro y falló», «Listos para más» y una columna del mapa | «**Asignar refuerzo**» o «**Asignar reto**» a los marcados. STIRE **propone** la actividad (una hermana más fácil de la misma casilla, o una del nivel siguiente para el reto) y el docente la acepta, la cambia o crea una |
| **Individual** | La ficha del estudiante | Un **plan para ese estudiante**: asignarle una actividad o una entrega personalizada, reabrir una versión, escribirle, y una **nota privada del docente** («Hablamos el martes; le cuesta el else if») que solo ve él |

### 4.3 Cerrar el ciclo (lo que casi nadie hace)

Cada asignación de refuerzo queda registrada con su fecha. En la ficha y en el mapa se ve:

```
Refuerzo «Varios caminos con else if» · asignado 2 oct a 3 estudiantes
  Daniela   42 % → 78 %   ✓ hecho
  Sebastián 35 % → 35 %   sin empezar  [Escribirle]
  Camila    50 % → 66 %   en curso
```

Así el docente aprende qué intervenciones le funcionan, y STIRE tiene datos reales para mejorar sus propuestas.

### 4.4 Avisos: que propongan, no que manden solos

- Un **tope estilo ASSISTments**: si un estudiante falla N actividades seguidas de la misma casilla, el tutor deja de
  proponerle más de lo mismo y el docente recibe un aviso. Sin tope, el estudiante practica en círculo y nadie se entera.
- **No** enviar correos automáticos a estudiantes como los agentes de Brightspace. STIRE **redacta** el mensaje («Hola
  Sebastián, vi que el else if…») y el docente lo envía o lo cambia. Un mensaje automático frío es lo contrario del
  «tutor humano».
- Un **resumen semanal** para el docente, estilo Class Snapshot: qué avanzó el grupo, quién se quedó sin actividad, qué
  quedó por revisar.

---

## 5. ¿Puede el docente subir el dominio? Sí, con evidencia

El dueño propone: «asignar una actividad personalizada que suba su dominio si él considera que la hizo bien». Estoy de
acuerdo con el fondo y en desacuerdo con una forma de hacerlo.

- **Sí:** que la nota del docente en una entrega o actividad asignada sea **evidencia** en el dominio. Técnicamente, la
  entrega es una actividad de la unidad con su casilla. La nota (por ejemplo 4,5 de 5 = 90 %) entra al cálculo de
  `calculateUnitMastery` como cualquier entrega. No hace falta un motor nuevo.
- **No:** un botón «poner el dominio en 85 %».
  - El dominio es una **medida** de lo que el estudiante hizo; si el docente lo edita, deja de medir y el mapa de calor
    pierde confianza.
  - Si el docente cree que el estudiante ya domina algo, la forma honesta es **pedirle la evidencia**: una actividad o
    entrega corta. Así queda registrado por qué subió.
- La evidencia del docente **se ve distinta** («valorado por la docente»), y los **repasos** siguen vivos: si después falla
  el repaso, el dominio baja igual que hoy.

---

## 6. Formas de calificar: hacia dónde ir sin volvernos Moodle

**Cuestiono la dirección.** La Universidad ya tiene Moodle y el modelo MOCAVI, con libro de calificaciones, y las notas
oficiales van a su sistema. Si STIRE construye su propio libro de notas completo, duplica Moodle y compite con él, y pierde.

Lo que STIRE puede hacer y Moodle no es **proponer una nota con fundamento**: dominio por unidad, entregas revisadas,
esfuerzo en retos.

Propuesta por pasos:
1. **Esquema de la clase, opcional.** El docente dice qué pesa qué: «Práctica (dominio de las unidades) 40 %, Entregas
   30 %, Parciales 30 %». La escala es 0,0 a 5,0. Los cortes los define el docente; hay que confirmar con el reglamento de
   la Universidad, no lo supongo.
2. **Nota propuesta por estudiante**, con el desglose. El docente la ajusta si quiere, y el ajuste queda en el historial
   con su motivo.
3. **Exportar** a CSV/Excel con las columnas que pida Moodle para importar. Es la integración más barata y no depende de
   permisos de la Universidad.
4. **Después, rúbricas** en las entregas (criterios con niveles), como Canvas, Gradescope y Moodle. Solo si los docentes
   las piden.

Lo que **no** haría ahora: curvas, recuperaciones automáticas, ponderaciones por categoría anidadas ni periodos múltiples.
Es un trabajo universitario: lo mínimo que un docente use de verdad.

---

## 7. Donde no estoy de acuerdo contigo (y por qué)

1. **«Nota y comentario, mejor las dos».** La evidencia dice que la nota tapa el comentario (Butler, 1988).
   - **Propuesta:** en las entregas formativas, el **comentario va primero** y la nota es **opcional** por espacio.
   - Si hay nota, el estudiante ve primero el comentario y luego la nota.
   - En las sumativas (un parcial), nota sí.
2. **Límite de versiones alto para todos.** Muchas versiones invitan a «enviar a ver qué pasa».
   - **Propuesta:** 3 por defecto, decidido **por espacio**, y «reabrir» para el caso individual. Es más justo y le da
     control al docente.
3. **Más tablero no es más intervención.**
   - Khan encontró mejores resultados con metas de dominio del curso y **pocas** asignaciones extra.
   - El tablero sirve cuando el docente lo usa seguido y en el camino (Molenaar y Knoop-van Campen, 2019).
   - **Propuesta:** antes de añadir gráficas, hacer que cada lista que ya existe tenga su botón de acción y su «¿funcionó?».
4. **Construir un sistema de calificación completo.** Ver §6: integrarse con Moodle, no reemplazarlo.
5. **«No me parece agradable».** Coincido, y no es solo color, que es territorio de José. Son tres cosas de estructura que
   se pueden arreglar sin tocar su identidad visual:
   - números que engañan (§1, punto 1);
   - nombres que chocan (§1, punto 2);
   - pantallas de cifras sin acción (§1, punto 5).

---

## 8. Plan por fases y lo que necesito que decidas

| Fase | Qué | Tamaño |
|---|---|---|
| **A** | Dominio honesto: «Avance x de N unidades» y «Dominio en lo trabajado», en el inicio del docente y del estudiante | Pequeño |
| **B** | **Espacios de entrega** (§3): tipo de actividad «Entrega», máximo de versiones, fechas, reabrir, historial de eventos, página de la entrega y bandeja «Por revisar». Reemplaza «recibir proyectos» | Mediano-grande |
| **C** | **Asignar a estudiantes concretos** y las tres puertas (§4.1, §4.2): refuerzo y reto propuestos por STIRE, aceptados por el docente, y nota privada del docente | Mediano |
| **D** | **Cerrar el ciclo** (§4.3), tope estilo ASSISTments con aviso, mensajes redactados por STIRE y resumen semanal | Mediano |
| **E** | **Página de la clase con pestañas** (Hoy · Contenido · Estudiantes · Entregas · Ajustes) en lugar del menú por herramienta. Necesita a José | Grande |
| **F** | **Formas de calificar** (§6): esquema, nota propuesta y exportar a Moodle | Mediano |

**Decisiones del dueño:**
1. ¿Quitamos «recibir proyectos» por clase y lo reemplazamos por **espacios de entrega** dentro de la unidad (§3)?
2. ¿Nota **opcional** y comentario primero en las entregas formativas (§7.1), o nota siempre?
3. ¿La nota del docente cuenta como **evidencia** en el dominio, y **no** hay botón para editar el dominio (§5)?
4. ¿Las calificaciones oficiales se quedan en Moodle y STIRE **propone y exporta** (§6)?
5. Orden: propongo **A → B → C → D**, y E y F después, con José y con un docente real mirando.

---

## 9. Referencias

### Artículos (verificados en Crossref el 2026-09-30)

- Black, P. y Wiliam, D. (1998). Assessment and Classroom Learning. *Assessment in Education: Principles, Policy & Practice, 5*(1), 7-74. https://doi.org/10.1080/0969595980050102
- Butler, R. (1988). Enhancing and undermining intrinsic motivation: the effects of task-involving and ego-involving evaluation on interest and performance. *British Journal of Educational Psychology, 58*(1), 1-14. https://doi.org/10.1111/j.2044-8279.1988.tb00874.x
- Fuchs, D. y Fuchs, L. S. (2006). Introduction to response to intervention: What, why, and how valid is it? *Reading Research Quarterly, 41*(1). https://doi.org/10.1598/rrq.41.1.4
- Guskey, T. R. (2007). Closing Achievement Gaps: Revisiting Benjamin S. Bloom's "Learning for Mastery". *Journal of Advanced Academics, 19*(1). https://doi.org/10.4219/jaa-2007-704
- Hattie, J. y Timperley, H. (2007). The Power of Feedback. *Review of Educational Research, 77*(1), 81-112. https://doi.org/10.3102/003465430298487
- Heffernan, N. T. y Heffernan, C. L. (2014). The ASSISTments Ecosystem. *International Journal of Artificial Intelligence in Education, 24*(4). https://doi.org/10.1007/s40593-014-0024-x
- Holstein, K., McLaren, B. M. y Aleven, V. (2018). Student Learning Benefits of a Mixed-Reality Teacher Awareness Tool in AI-Enhanced Classrooms. *AIED 2018*, LNCS, 154-168. https://doi.org/10.1007/978-3-319-93843-1_12
- Holstein, K., McLaren, B. M. y Aleven, V. (2019). Co-Designing a Real-Time Classroom Orchestration Tool to Support Teacher–AI Complementarity. *Journal of Learning Analytics, 6*(2). https://doi.org/10.18608/jla.2019.62.3
- Kluger, A. N. y DeNisi, A. (1996). The effects of feedback interventions on performance: A historical review, a meta-analysis, and a preliminary feedback intervention theory. *Psychological Bulletin, 119*(2), 254-284. https://doi.org/10.1037/0033-2909.119.2.254
- Kulik, C.-L. C., Kulik, J. A. y Bangert-Drowns, R. L. (1990). Effectiveness of Mastery Learning Programs: A Meta-Analysis. *Review of Educational Research, 60*(2). https://doi.org/10.2307/1170612
- Molenaar, I. y Knoop-van Campen, C. A. N. (2019). How Teachers Make Dashboard Information Actionable. *IEEE Transactions on Learning Technologies, 12*(3). https://doi.org/10.1109/tlt.2018.2851585
- Nicol, D. J. y Macfarlane-Dick, D. (2006). Formative assessment and self-regulated learning: a model and seven principles of good feedback practice. *Studies in Higher Education, 31*(2). https://doi.org/10.1080/03075070600572090
- Roschelle, J., Feng, M., Murphy, R. F. y Mason, C. A. (2016). Online Mathematics Homework Increases Student Achievement. *AERA Open, 2*(4). https://doi.org/10.1177/2332858416673968
- Shute, V. J. (2008). Focus on Formative Feedback. *Review of Educational Research, 78*(1), 153-189. https://doi.org/10.3102/0034654307313795
- Verbert, K., Duval, E., Klerkx, J., Govaerts, S. y Santos, J. L. (2013). Learning Analytics Dashboard Applications. *American Behavioral Scientist, 57*(10). https://doi.org/10.1177/0002764213479363
- Wise, A. F. (2014). Designing pedagogical interventions to support student use of learning analytics. *LAK '14*, 203-211. https://doi.org/10.1145/2567574.2567588

### Plataformas (documentación oficial y guías, consultadas el 2026-09-30)

- Google Classroom. Calificar y devolver: https://support.google.com/edu/classroom/answer/6020294 · Grupos de estudiantes: https://support.google.com/edu/classroom/answer/15263790 · Conjuntos de práctica: https://support.google.com/edu/classroom/answer/13457851
- Canvas. Mastery Paths: https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-add-conditional-content-to-a-Mastery-Path-source-item/ta-p/854 · Varios intentos en SpeedGrader: https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-view-multiple-submissions-for-an-assignment-in/ta-p/971 · «Message Students Who»: https://ready.msudenver.edu/self-help-tutorials/canvas-tools/use-the-gradebook-option-email-students-who/
- Moodle. Intentos permitidos (guía de UCL): https://ucldata.atlassian.net/wiki/spaces/MoodleResourceCentre/pages/429654048/M09a9+-+Moodle+Assignment+Allowed+Attempts+Setting
- Khan Academy. Metas de dominio: https://support.khanacademy.org/hc/en-us/articles/360030694212 · Estrategias con evidencia: https://blog.khanacademy.org/three-research-backed-strategies-teachers-can-implement-on-khan-academy-to-boost-student-learning-outcomes · Khanmigo para docentes: https://support.khanacademy.org/hc/en-us/articles/14799047733645
- IXL. Analítica para docentes (Trouble Spots): https://www.ixl.com/materials/us/IXL_Teacher_Analytics.pdf · Novedades 2021: https://blog.ixl.com/2021/08/23/whats-new-on-ixl-back-to-school-2021/
- ASSISTments. Skill Builders: https://www.assistments.org/individual-resource/what-are-skill-builders-and-how-are-they-different-from-the-other-content-within-assistments
- Carnegie Learning. Alerta de riesgo en LiveLab: https://support.carnegielearning.com/help-center/math/livelab/article/live-lab-at-risk-alert/
- Brightspace. Agentes inteligentes: https://community.d2l.com/brightspace/kb/articles/3499-about-intelligent-agents
- Gradescope. Configuración de tareas: https://guides.gradescope.com/hc/en-us/articles/22242992536205-Assignment-Settings-Overview
- Codio. Learning Insights: https://www.codio.com/features/learning-insights
