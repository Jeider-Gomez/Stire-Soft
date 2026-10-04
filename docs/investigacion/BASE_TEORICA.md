---
estado:     vivo (se agrega una entrada por cada decisión de diseño que tenga fundamento)
creado:     2026-09-30
uso:        anexo de la tesis «Fundamentos de las decisiones de diseño de STIRE»
---

# Base teórica de las decisiones de diseño de STIRE

**Para qué sirve.** Reúne en un solo lugar **por qué** STIRE se diseñó de cierta forma y **en qué se apoya** cada decisión,
para poder anexarlo a la tesis sin rehacer la búsqueda. Lo pidió el dueño del proyecto el 30/09/2026: «un documento que
diga por qué hicimos esto y en qué nos estamos basando».

**Qué no es.**
- No es la matriz bibliográfica (`MATRIZ_ARTICULOS_AMPLIADA.md`). Cuando una obra ya está allí, se cita con su número
  («matriz #13»).
- Tampoco es texto del cuerpo de la tesis.

**Cómo pasarlo a la tesis** (reglas de `CONTEXTO_STIRE.md` y `PLAN_ENTREGABLES_INFORME.md`):
- En el cuerpo del informe, cada decisión se redacta como **requerimiento o característica de diseño, en modo
  condicional** («el tutor deberá…», «el docente podría…»).
- La columna «Trazabilidad» de cada entrada (archivos, pantallas, tecnología) **no** va al cuerpo. Puede ir a un anexo
  rotulado «exploración técnica preliminar».
- Solo se citan obras **verificadas** (DOI comprobado en Crossref). Lo que es práctica de otras plataformas se cita como
  referente de producto, no como evidencia científica.

**Formato de cada entrada:** problema observado → decisión → fundamento → cómo se materializa (en términos funcionales) →
trazabilidad (solo para el anexo técnico).

---

## BT-01. El comentario va primero y la nota es opcional

| | |
|---|---|
| **Problema observado** | Una primera versión del envío de proyectos pedía «nota y comentario, las dos». El dueño lo propuso así por defecto. |
| **Decisión** | En las entregas formativas, la nota es **opcional** (por defecto, solo comentario). Si hay nota, el estudiante ve **primero el comentario y después la nota**. |
| **Fundamento** | - Butler (1988): con estudiantes de 5.º y 6.º grado, los comentarios solos mejoraron el interés y el desempeño; nota más comentario tuvo el mismo efecto que la nota sola. La nota desplaza la atención del comentario hacia la comparación. Es un estudio con niños: se usa como advertencia, no como ley.<br>- La retroalimentación eficaz informa sobre la tarea y el proceso, no sobre la persona (Hattie y Timperley, 2007, matriz #13; Shute, 2008).<br>- Una parte importante de las intervenciones de retroalimentación empeora el desempeño cuando desvía la atención hacia el yo (Kluger y DeNisi, 1996).<br>- La evaluación formativa mejora el aprendizaje cuando su información se usa para ajustar la enseñanza y el trabajo del estudiante (Black y Wiliam, 1998). |
| **Cómo se materializa** | El docente decide por entrega si lleva nota. La pantalla de revisión pide primero el comentario. |
| **Trazabilidad** | `src/proyectos/entrega-reglas.ts` (`conNota: false` por defecto); `pages/docente/entregas/revision/[envioId].vue`; `pages/estudiante/entregas/[id].vue`. |

## BT-02. Practicar es evaluar: la evaluación es implícita

| | |
|---|---|
| **Problema observado** | Antes de practicar, la lección preguntaba «¿Cómo te sientes con este tema?». El dueño señaló que el estudiante ya sabe que lo evalúan siempre, y que esa pregunta no le dice que viene un ejercicio para probar lo que sabe. |
| **Decisión** | Se quita la pregunta de autoevaluación. Cada ejercicio de práctica mide el dominio, y el estudiante lo ve subir. Quien cree que ya sabe el tema puede **demostrarlo con un reto** y saltar lo básico. |
| **Fundamento** | - Recuperar información en una prueba mejora la retención más que volver a estudiar (*testing effect*; Roediger y Karpicke, 2006, matriz #4). La práctica con ejercicios es a la vez aprendizaje y evaluación.<br>- La evaluación es formativa cuando la evidencia se usa para decidir el siguiente paso (Black y Wiliam, 1998; Wiliam, 2011).<br>- El aprendizaje para el dominio exige demostrar el criterio antes de avanzar (Bloom, 1968, matriz #1). Un reto superado es esa demostración; una autoevaluación no lo es. |
| **Cómo se materializa** | La lección ofrece «Practicar» y, debajo, «¿Ya lo sabes? Demuéstralo con un reto». El docente ve «Intentó saltar con un reto y falló», un dato más fiable que «dijo sentirse seguro». |
| **Trazabilidad** | `pages/estudiante/unidad/[id].vue`; reto de salto en `src/learning-progress/recommendation/recomendar-siguiente.ts`; `components/docente/MapaDeCalor.vue`. |

## BT-03. La explicación antes del ejercicio, y un solo siguiente paso

| | |
|---|---|
| **Problema observado** | Los botones «Practicar» y «Continuar ejercicio» llevaban directo al ejercicio y se saltaban la explicación de la lección, el material que, según el dueño, el estudiante muchas veces no revisa. El plan del curso mostraba 17 filas con el mismo botón. |
| **Decisión** | Una lección sin empezar abre su **explicación** y luego la práctica. El inicio destaca **un solo siguiente paso**. Las lecciones dominadas se ven completas y tenues. |
| **Fundamento** | - La memoria de trabajo es limitada. El diseño instruccional debe reducir la carga que no aporta al aprendizaje: elegir entre muchas opciones iguales es carga ajena a la tarea (Sweller, van Merriënboer y Paas, 1998, matriz #14).<br>- Estudiar ejemplos resueltos antes de resolver solo favorece a los principiantes (Atkinson, Derry, Renkl y Wortham, 2000).<br>- Referente de producto: Duolingo y Khan Academy presentan un camino con un siguiente paso evidente. |
| **Cómo se materializa** | «Tu siguiente paso» en el inicio: «Empezar la lección» si no la ha empezado, «Seguir practicando» si ya la empezó. |
| **Trazabilidad** | `pages/estudiante/index.vue`. |

## BT-04. Avance honesto: separar «cuánto del curso» de «qué tan bien»

| | |
|---|---|
| **Problema observado** | El inicio mostraba «Dominio 100 %» a una estudiante que había trabajado 5 de 17 lecciones, y el docente veía «Dominio promedio 98 %». La cifra era cierta («de lo que llevas»), pero se leía como «ya casi termino». |
| **Decisión** | Se muestran siempre dos cifras: «**x de N lecciones dominadas**» (avance) y «**dominio en lo que has trabajado**». |
| **Fundamento** | - La autorregulación depende de que el estudiante se autoevalúe con información fiel sobre su avance (Zimmerman, 2002, matriz #31).<br>- Uno de los siete principios de la buena retroalimentación es facilitar la autoevaluación y aclarar qué es un buen desempeño (Nicol y Macfarlane-Dick, 2006).<br>- Un indicador que induce a error en el tablero del docente lo lleva a no intervenir (ver BT-08). |
| **Cómo se materializa** | Tarjetas «Avance del curso» y «Dominio en lo que has trabajado» en el inicio y en «Mi progreso». |
| **Trazabilidad** | `frontend-nuxt/utils/avanceCurso.ts`; `pages/estudiante/index.vue`; `pages/estudiante/progreso.vue`. |

## BT-05. El dominio se mide con evidencia; el docente aporta evidencia, no edita la cifra

| | |
|---|---|
| **Problema observado** | El dueño propuso que una actividad personalizada «suba el dominio si el docente considera que la hizo bien». |
| **Decisión** | La valoración del docente (la nota de una entrega o de un refuerzo) **entra como evidencia** en el dominio de la lección, igual que un ejercicio. **No existe** un control para escribir el dominio a mano. |
| **Fundamento** | - En el aprendizaje para el dominio, el avance se basa en demostrar el criterio con evidencia (Bloom, 1968, matriz #1; Guskey, 2007).<br>- Si la cifra se edita a mano deja de medir. Un tablero que no mide pierde la confianza del docente y su utilidad para decidir (Verbert et al., 2013, matriz #21). |
| **Cómo se materializa** | Una entrega que «cuenta para el dominio» exige una lección y nota. Su nota (por ejemplo, 4,5 de 5) se suma como un ejercicio más. Verificado el 30/09: una entrega de 4,5 llevó una lección de 100 % a 96 %. |
| **Trazabilidad** | `evidenciasDeEntregas` en `src/learning-progress/learning-progress.service.ts`; `src/learning-progress/listeners/entrega-revisada.listener.ts`. |

## BT-06. Entregas con versiones, historial y reapertura

| | |
|---|---|
| **Problema observado** | El dueño pidió que el docente cree el espacio de entrega dentro de su clase, con límite de versiones y la hora de cada envío y de cada cambio de nota. |
| **Decisión** | Cada entrega admite **varias versiones** (3 por defecto, editable de 1 a 10). El docente puede **reabrir** a un estudiante (+1 versión). Un **historial** registra quién hizo qué y cuándo: envío, revisión, cambio de nota con el valor anterior, comentario editado. |
| **Fundamento** | - La retroalimentación cumple su función cuando el estudiante tiene ocasión de usarla para cerrar la brecha entre su desempeño y el esperado; de ahí la reentrega (Nicol y Macfarlane-Dick, 2006; Shute, 2008).<br>- El límite de versiones es una decisión práctica tomada de los referentes de producto, no una conclusión de investigación. Moodle permite reabrir intentos con un máximo y las guías universitarias recomiendan un solo intento en lo sumativo; Classroom permite devolver y reentregar.<br>- El historial da transparencia ante un reclamo de nota (práctica de Classroom, «Ver historial»). |
| **Cómo se materializa** | Pantallas «Entregas», detalle por estudiante y revisión con selector de versión e historial. |
| **Trazabilidad** | `src/proyectos/entrega-reglas.ts`, `entregas.service.ts`, `entities/entrega-evento.entity.ts`; migración 1790400000000. |

## BT-07. Refuerzos que presentan el concepto de otra forma, y retos para quien va adelante

| | |
|---|---|
| **Problema observado** | El dueño: «si el estudiante está fallando es porque la actividad normal no le está funcionando o no está entendiendo el contenido; hay que dar más flexibilidad a estas actividades». |
| **Decisión** | Un **refuerzo** es una secuencia corta (1 a 5 pasos) que el docente arma. Puede incluir otra explicación, un recurso (video, presentación), un ejercicio del banco o creado a la medida, o una entrega, y cuenta en una o varias lecciones. Un **reto** usa la misma estructura con mayor nivel. |
| **Fundamento** | - En el aprendizaje para el dominio de Bloom, tras una evaluación formativa, quien no alcanza el criterio recibe **correctivos** que presentan el concepto de una manera distinta a la enseñanza inicial, y quien lo alcanza recibe actividades de **profundización** (Bloom, 1968, matriz #1; Guskey, 2007).<br>- Los programas de aprendizaje para el dominio muestran efectos positivos sobre el rendimiento (Kulik, Kulik y Bangert-Drowns, 1990).<br>- La tutoría individual es la meta que estos métodos buscan acercar al aula: el «problema de las 2 sigmas» (Bloom, 1984, matriz #30).<br>- Estudiar un ejemplo resuelto antes de practicar ayuda al principiante (Atkinson et al., 2000). Por eso existen los pasos de explicación y de ejemplo. |
| **Cómo se materializa** | Formulario de refuerzo o reto, con ejercicios sugeridos. Un ejercicio en borrador sumado a un refuerzo se publica solo para esos estudiantes. |
| **Trazabilidad** | `src/refuerzos/`; `src/activities/visibilidad.ts`; migración 1790500000000. |

## BT-08. La acción junto al dato, en tres niveles, y el ciclo cerrado

| | |
|---|---|
| **Problema observado** | El panel del docente detectaba (bloqueados, tema más difícil, listos para más), pero para actuar había que ir a otra pantalla. Ninguna pantalla mostraba si una ayuda había funcionado. |
| **Decisión** | 1. Cada lista del tablero tiene su acción («Asignar un refuerzo», «Reforzar con todo el grupo», «Asignar un reto»).<br>2. La intervención tiene **tres niveles**: toda la clase, un grupo y un estudiante.<br>3. Cada refuerzo muestra «¿funcionó?»: pasos hechos y dominio antes → ahora. |
| **Fundamento** | - En 38 clases observadas, los docentes consultaron el tablero 8,3 veces por clase. Las acciones más comunes fueron retroalimentación de la tarea y del proceso, y quienes lo consultaban más daban retroalimentación más variada (Molenaar y Knoop-van Campen, 2019; ver también Knoop-van Campen y Molenaar, 2020, matriz #20).<br>- Un aviso en tiempo real de quién estaba atascado llevó a los docentes a atender primero a quien lo necesitaba, y los estudiantes aprendieron más (Holstein, McLaren y Aleven, 2018). La herramienta se diseñó **con** los docentes (Holstein, McLaren y Aleven, 2019).<br>- Una intervención basada en analítica debe decir qué se espera que haga el estudiante, y revisarse después (Wise, 2014).<br>- Los tres niveles siguen la lógica de respuesta a la intervención: primero toda la clase, luego los grupos que no responden y luego el caso individual (Fuchs y Fuchs, 2006). |
| **Cómo se materializa** | Botones en el mapa de calor y en la ficha del estudiante; pantalla «Refuerzos» con antes → ahora. |
| **Trazabilidad** | `components/docente/MapaDeCalor.vue`; `pages/docente/estudiante/[studentId].vue`; `pages/docente/refuerzos/index.vue`. |

## BT-09. STIRE propone; el docente decide y envía

| | |
|---|---|
| **Problema observado** | Las plataformas con mensajes automáticos (por ejemplo, los «agentes inteligentes» de Brightspace) envían correos sin que el docente los vea. Eso contradice la visión de «tutor humano digital». |
| **Decisión** | STIRE **redacta** el mensaje del refuerzo (corto, sobre la tarea, con lo que se espera que el estudiante haga). El docente lo edita y lo envía. No se envía nada automáticamente. |
| **Fundamento** | - La retroalimentación centrada en la tarea, y no en la persona, es la que mejora el desempeño (Kluger y DeNisi, 1996; Hattie y Timperley, 2007, matriz #13).<br>- La complementariedad entre el docente y el sistema funciona cuando el sistema informa y el docente decide (Holstein, McLaren y Aleven, 2019). |
| **Cómo se materializa** | «Proponer un mensaje» en el formulario de refuerzo, editable antes de enviar. |
| **Trazabilidad** | `frontend-nuxt/utils/refuerzos.ts` (`mensajeSugerido`). |

## BT-10. Estadísticas al estilo de la repetición espaciada

| | |
|---|---|
| **Problema observado** | El dueño pidió mostrar el dominio «como hace Anki con sus gráficas». |
| **Decisión** | «Mi progreso» y la ficha del estudiante muestran: constancia (16 semanas), próximos repasos (14 días), lecciones dominadas «firmes» (repaso a 21 días o más) y retención de los repasos de 30 días. Los días se cuentan en la hora de Colombia. |
| **Fundamento** | - Espaciar la práctica mejora la retención frente a la práctica concentrada (Cepeda et al., 2006, matriz #3).<br>- Los intervalos crecientes de repaso son la base de los algoritmos de repetición espaciada (Woźniak y Gorzelańczyk, 1994, matriz #2), y hoy se ajustan con datos (Settles y Meeder, 2016; Ye, Su y Cao, 2022).<br>- Ver su constancia y su retención apoya el autocontrol del estudiante (Zimmerman, 2002, matriz #31).<br>- El umbral de 21 días para «firme» se toma de Anki («tarjetas maduras»). Es una convención de producto, no un resultado de investigación. |
| **Cómo se materializa** | Cuatro gráficas en «Mi progreso» y en la ficha. |
| **Trazabilidad** | `src/learning-progress/estadisticas.ts`; `components/EstadisticasEstudiante.vue`; `src/common/utils/dia-colombia.ts`. |

## BT-11. Una actividad asignada a algunos no cuenta para los demás

| | |
|---|---|
| **Problema observado** | Si un ejercicio creado para un estudiante contara en el dominio de toda la clase, bajaría el dominio de quienes no lo tenían asignado. |
| **Decisión** | Una actividad asignada a algunos estudiantes **no existe** para los demás: no la ven, no la pueden intentar y no entra en su dominio. |
| **Fundamento** | Validez de la medida. El dominio debe reflejar la evidencia de lo que a cada estudiante se le pidió (Bloom, 1968, matriz #1). Es una decisión de ingeniería derivada de ese principio, sin un estudio específico. |
| **Cómo se materializa** | El docente asigna desde un refuerzo; el estudiante solo ve lo suyo. |
| **Trazabilidad** | `src/activities/visibilidad.ts` y sus usos (lista, ficha, preguntas, árbol del curso, intentos, dominio y recomendador). |

## BT-12. Nombres de la estructura: módulo → tema → lección

| | |
|---|---|
| **Problema observado** | El estudiante veía «Unidad 1 · … 6 Unidades»: la palabra «unidad» nombraba dos niveles distintos. |
| **Decisión** | Módulo (renombrable: corte, semana, unidad) → tema (visible solo si agrupa varias lecciones) → **lección**. |
| **Fundamento** | - La consistencia y el lenguaje del usuario son principios de diseño de interfaces (Mandel, 1997, matriz #22).<br>- Referentes de producto: Moodle, Coursera y Open edX usan «módulo»; Duolingo y Khan Academy, «lección». |
| **Cómo se materializa** | Los nombres viven en un solo archivo y cambian sin tocar la base de datos. |
| **Trazabilidad** | `frontend-nuxt/utils/terminos.ts`. |

## BT-13. La clase como lugar, y «Hoy»: lo pendiente en orden de urgencia, cada cosa con su acción

| | |
|---|---|
| **Problema observado** | El menú del docente estaba organizado por herramienta (Contenidos, Rendimiento, Entregas, Refuerzos), y cada pantalla volvía a preguntar «¿de qué clase?». Para saber qué hacer hoy, el docente tenía que recorrer cuatro pantallas y armar la lista él mismo. |
| **Decisión** | 1. El docente entra a **su clase** y ahí encuentra todo, en pestañas: Hoy · Contenido · Estudiantes · Entregas · Refuerzos · Ajustes.<br>2. La pestaña **Hoy** es una lista corta y ordenada: solicitudes para entrar, estudiantes bloqueados (agrupados por lección), entregas por revisar, quien falló un reto de salto, refuerzos sin empezar o vencidos, entregas que cierran pronto con estudiantes sin entregar y, al final, quienes están listos para un reto.<br>3. Cada elemento trae **su acción** (aprobar, asignar refuerzo, revisar, escribir). A quien ya tiene un refuerzo en curso en esa lección no se le propone otro: se muestra «ya tiene un refuerzo».<br>4. Si no hay nada, dice «Todo al día» y no inventa tareas. |
| **Fundamento** | - Los docentes usan el tablero cuando lo que muestra se convierte en una acción concreta (Molenaar y Knoop-van Campen, 2019).<br>- Avisar quién está atascado ahora hizo que los docentes atendieran primero a quien más lo necesitaba, con mejor aprendizaje (Holstein, McLaren y Aleven, 2018). Por eso los bloqueados van arriba y los listos para más al final, sin dejarlos fuera.<br>- Una intervención basada en analítica se revisa después (Wise, 2014): los refuerzos sin empezar o vencidos vuelven a la lista.<br>- Repetir la elección de la clase en cada pantalla es carga que no aporta a la tarea (Sweller, van Merriënboer y Paas, 1998, matriz #14).<br>- Referentes de producto: Canvas (navegación dentro del curso) y Google Classroom (pestañas de la clase y lista «Por revisar»). |
| **Cómo se materializa** | «Abrir la clase» desde «Mis clases»; el menú lateral lista las clases del docente. Las pestañas aparecen en todas las pantallas de la clase, también en la ficha del estudiante. |
| **Trazabilidad** | `frontend-nuxt/utils/pestanasClase.ts`, `utils/hoyClase.ts` (`pendientesDeHoy`), `components/docente/PestanasClase.vue`, `pages/docente/clase/[classId]/index.vue` y `ajustes.vue`; prueba `src/content-rendering/__tests__/clase-pestanas.frontend.spec.ts`. |

## BT-14. STIRE propone la nota con evidencia; el docente decide y Moodle guarda la oficial

| | |
|---|---|
| **Problema observado** | El dueño: «STIRE es un Moodle mejorado» y debe llevar las notas de la materia, pero la Universidad ya tiene Moodle para las notas oficiales. Un libro de calificaciones completo duplicaría Moodle; ninguno de los dos sabía, además, cuánto domina cada estudiante. |
| **Decisión** | 1. **Opcional y a la manera del docente** (el dueño, 01/10: «una herramienta flexible que ayuda al profe, no que lo limita… la idea es que él haga las cosas a su manera»). Una clase puede no llevar notas en STIRE. Si las lleva: cada nota sale del dominio de unas lecciones, de unas entregas o la pone él (también actividades presenciales, que STIRE no ve); cada nota es **del curso entero o de un módulo**, y cada módulo con notas tiene su nota de módulo; en cada nivel decide si usa **porcentajes** (no tienen que sumar 100: se reparten en proporción; 0 % = se registra pero no cuenta) o **promedia**; y puede **no calcular nota final** y solo registrar. Las formas de empezar (una sola nota, una por módulo, práctica + entregas + parcial) son solo un punto de partida, y puede dejar de usar notas sin perder lo puesto. Escala 0,0 a 5,0; la aprobatoria (3,0 por defecto) la fija el docente.<br>2. **Nota propuesta** por estudiante, con el desglose y lo que falta («Falta: Parcial»). Se calcula con lo ya calificado, sin inventar lo que no hay.<br>3. **El docente decide**: ajusta la final con un **motivo obligatorio**; cada cambio queda en un historial con antes → después, quién y cuándo.<br>4. **Moodle guarda la oficial**: se exporta un CSV que se sube con «Importar calificaciones», identificado por correo.<br>5. **Transparencia opcional**: si el docente lo activa, el estudiante ve su nota y de dónde sale cada parte; no ve el motivo de un ajuste. |
| **Fundamento** | - En el aprendizaje para el dominio, la nota refleja el logro de los objetivos, no el tiempo ni la comparación con otros (Bloom, 1968, matriz #1; Guskey, 2007). Por eso la parte de práctica sale del dominio y no del número de ejercicios hechos.<br>- Un buen principio de retroalimentación es dejar claro qué es un buen desempeño: metas, criterios y estándares (Nicol y Macfarlane-Dick, 2006). Mostrar el desglose al estudiante sigue ese principio.<br>- La complementariedad docente–sistema: el sistema informa y el docente decide (Holstein, McLaren y Aleven, 2019). La propuesta nunca reemplaza el juicio del docente, pero el ajuste deja rastro.<br>- Decisiones de ingeniería sin un estudio específico: una entrega cerrada sin entregar cuenta 0 solo si no acepta envíos tarde (el docente puede ajustar con motivo); lo que está por revisar o abierto no cuenta todavía. |
| **Cómo se materializa** | Pestaña «Notas» de la clase: si la clase no lleva notas, tres formas de empezar (una sola nota, una por módulo, práctica + entregas + parcial); esquema editable con o sin porcentajes y lecciones elegibles por módulo entero, resumen de la clase, tabla con las notas, ajuste con historial y «Descargar para Moodle (CSV)». En «Mi progreso», la tarjeta «Tu nota en esta clase» si el docente la hizo visible. |
| **Trazabilidad** | `src/calificaciones/` (`calificacion-reglas.ts`: `validarEsquema`, `construirLibro`, `notaPropuesta`); migración 1790600000000; `frontend-nuxt/utils/calificaciones.ts` (`csvParaMoodle`); `pages/docente/clase/[classId]/notas.vue`; `components/MiNota.vue`; pruebas `calificaciones.service.spec.ts` y `calificaciones.frontend.spec.ts`. |

## BT-15. En un refuerzo, el Tutor amplía la ayuda (sin dar la solución)

| | |
|---|---|
| **Problema observado** | El Tutor sube la ayuda solo con los intentos fallidos de la actividad (pista → pregunta guía → dónde está el error). En un refuerzo, el estudiante empezaba otra vez desde la pista mínima, aunque el docente ya había visto que la práctica de siempre no le funcionaba. |
| **Decisión** | Si el ejercicio es parte de un **refuerzo** en curso para ese estudiante, la ayuda empieza **un nivel más arriba** (pregunta guía desde el primer intento; dónde está el error desde el segundo fallo) y el Tutor recibe la instrucción de explicar la idea **de otra forma** y en pasos más pequeños. El tope que fija el docente sigue mandando y la solución nunca se da. Un **reto** no amplía la ayuda. El chat le dice al estudiante por qué: «Ayuda ampliada: este ejercicio es parte de tu refuerzo». |
| **Fundamento** | - El «dilema de la asistencia»: dar poca ayuda obliga a pensar, pero retenerla de más hace perder tiempo y frustra; el equilibrio depende del estudiante y de la evidencia que hay sobre él (Koedinger y Aleven, 2007, matriz #6). Un refuerzo es esa evidencia: el docente ya la vio.<br>- El correctivo del aprendizaje para el dominio presenta el concepto de otra forma (Bloom, 1968, matriz #1; Guskey, 2007).<br>- Sin barreras, la IA mejora la práctica y empeora el examen; un tutor con pistas mitiga el daño (Bastani et al., 2025). Por eso se amplía la ayuda, no se quita la barrera. |
| **Cómo se materializa** | En el chat del Tutor, dentro de un ejercicio del refuerzo: nivel de ayuda más alto y el aviso de por qué. |
| **Trazabilidad** | `src/tutor/tutor-guidance.ts` (`guidanceLevelForFailedAttempts(fallidos, ampliada)`), `tutor-settings.service.ts` (`refuerzoConLaActividad`), `tutor-context.service.ts`; `frontend-nuxt/components/tutor/TutorChatDrawer.vue`. |

## BT-16. Tope: tras varios fallos seguidos, parar, volver a la explicación y avisar al docente

| | |
|---|---|
| **Problema observado** | Después de cada fallo, el recomendador proponía otro ejercicio hermano o un reintento. Un estudiante podía encadenar fallos en la misma lección sin que nada cambiara, y el docente solo se enteraba si abría el mapa de calor. |
| **Decisión** | Con **3 fallos seguidos** en una lección (el mismo umbral con que el docente ve a alguien «bloqueado»), la recomendación se vuelve una **pausa**: lo primero que se propone es **volver a la explicación** o **pedir una pista al tutor**; el ejercicio sigue disponible como opción secundaria («Intentar otro de todas formas»). En ese momento el docente recibe **un aviso**, uno por racha, que lo lleva a «Hoy» para asignar un refuerzo o escribir. Un ejercicio aprobado corta la racha. |
| **Fundamento** | - ASSISTments: la práctica se detiene cuando el estudiante no alcanza el criterio tras varios intentos, y el caso pasa al docente; en un ensayo aleatorio con estudiantes de 7.º grado, la tarea en esa plataforma mejoró el rendimiento, más en quienes partían con bajo rendimiento (Roschelle, Feng, Murphy y Mason, 2016; Heffernan y Heffernan, 2014).<br>- Repetir más de lo mismo no corrige: el correctivo presenta la idea de otra forma (Bloom, 1968, matriz #1; Guskey, 2007).<br>- El aviso a tiempo de quién está atascado hace que el docente atienda primero a quien lo necesita (Holstein, McLaren y Aleven, 2018).<br>- El umbral de 3 es una decisión de diseño a validar con datos de uso, no un valor de la literatura. |
| **Cómo se materializa** | En la lección y en el inicio del estudiante: «Volver a la explicación» y «Pedir una pista al tutor». Para el docente: la campana con «Luisa se atascó» y la lista de «Hoy». |
| **Trazabilidad** | `src/learning-progress/recommendation/recomendar-siguiente.ts` (`FALLOS_PARA_PAUSA`, `fallosSeguidos`, motivo `pausa`); `src/notifications/listeners/atasco.listener.ts`; `pages/estudiante/unidad/[id].vue`, `pages/estudiante/index.vue`; pruebas `tope.spec.ts` y `tope.frontend.spec.ts`. |

## BT-17. Resumen de la semana y quién dejó de practicar, en «Hoy», sin correos automáticos

| | |
|---|---|
| **Problema observado** | «Hoy» mostraba a quien se atasca, pero no a quien dejó de entrar: un estudiante que no practica no falla, así que no aparecía en ninguna lista. Y el docente no tenía con qué comparar si la semana fue mejor o peor que la anterior. |
| **Decisión** | 1. En «Hoy», un **resumen de la semana**: cuántos practicaron, ejercicios entregados y aprobados, cada uno junto a la semana anterior.<br>2. Un pendiente nuevo: **quien lleva 7 días o más sin practicar** (o nunca ha practicado), con los días de cada uno y la acción «Escribirles».<br>3. Nada se envía solo: STIRE muestra y el docente decide si escribe (ver BT-09). Los días se cuentan en la hora de Colombia. |
| **Fundamento** | - Una intervención basada en analítica debe llevar a que alguien actúe y decir qué se espera (Wise, 2014). Un estudiante que deja de entrar no falla ejercicios, así que solo la inactividad lo hace visible.<br>- Los tableros sirven cuando su información se vuelve acción (Molenaar y Knoop-van Campen, 2019): por eso cada número del resumen va acompañado de la lista con su botón.<br>- Comparar con la semana anterior da una referencia propia del grupo, en vez de una cifra suelta.<br>- Referente de producto: «Class Snapshot» y los resúmenes semanales de Khan Academy y Google Classroom. El umbral de 7 días es una decisión de diseño. |
| **Cómo se materializa** | Tres cifras bajo «Hoy en tu clase» y el pendiente «N estudiantes llevan una semana o más sin practicar». |
| **Trazabilidad** | `src/analytics/resumen-semanal.ts` (`construirResumenSemanal`, `DIAS_SIN_ACTIVIDAD`), `GET /analytics/class/:id/semana`; `frontend-nuxt/utils/hoyClase.ts`; `pages/docente/clase/[classId]/index.vue`; pruebas `resumen-semanal.spec.ts` y `clase-pestanas.frontend.spec.ts`. |

## BT-18. El contenido se comparte como plantilla y se copia; cada clase es de su docente

| | |
|---|---|
| **Problema observado** | Para probar STIRE, dos integrantes del equipo debían ser docentes con los cursos ya diseñados. Un docente solo podía copiar contenido de sus propias clases, así que nadie más podía usar los cursos diseñados sin rehacerlos. |
| **Decisión** | 1. Cada docente crea y es dueño de sus clases; el admin no interviene en el día a día.<br>2. Un docente puede **compartir el contenido de su clase como plantilla**; otros docentes lo **copian** al crear su clase o después. Llega en borrador y nunca incluye estudiantes, entregas, progreso ni notas.<br>3. Se **copia, no se enlaza**: si el autor cambia algo, no altera las clases (ni las notas) de los demás.<br>4. **Co-docentes** en una misma clase quedan para después, si la universidad los necesita (monitores, auxiliares). |
| **Fundamento** | - Referentes de producto: todas las plataformas estudiadas separan el **contenido** (se diseña una vez y se reutiliza: «Importar» de Moodle, Commons y Blueprint de Canvas) de la **clase** (un grupo con su docente, sus estudiantes y sus notas). Google Classroom y Khan Academy dejan que cada docente cree sus clases; Moodle y Canvas lo hacen desde la administración porque se conectan al sistema académico.<br>- Para un trabajo universitario con poca administración, el modelo de Classroom (el docente crea, comparte y copia) es el más práctico; el de Moodle exigiría que el admin intervenga en cada curso.<br>- Copiar en vez de enlazar protege la validez de las notas de cada grupo (misma razón que en BT-11). |
| **Cómo se materializa** | Ajustes → «Compartir como plantilla con otros docentes»; al crear una clase, «Copiar el contenido de → Plantillas de otros docentes»; en Contenido, «Traer de otra clase». |
| **Trazabilidad** | `classes.compartidaComoPlantilla` (migración 1790800000000); `src/reuse/reuse.service.ts` (`plantillas`, `modulosParaCopiar`, `assertPuedeCopiarDe`); `frontend-nuxt/utils/plantillas.ts`; `docs/DISENO_CLASES_Y_DOCENTES.md`. |

## BT-19. En un proyecto propio, el Tutor guía y no escribe el proyecto

| | |
|---|---|
| **Problema observado** | En «Mis proyectos» el Tutor no sabía qué proyecto tenía abierto el estudiante ni veía su código, y fuera de un ejercicio no tenía la barrera contra entregar código completo: podía terminar escribiendo el proyecto. |
| **Decisión** | En un proyecto, el Tutor recibe el título, el tipo y todos los archivos. Su instrucción es guiar: preguntar qué quiere lograr el estudiante, señalar dónde está un problema y por qué, y proponer el siguiente paso pequeño. Un bloque de código largo en su respuesta se sustituye por un aviso, igual que en los ejercicios. |
| **Fundamento** | - Sin barreras, la IA mejora el desempeño mientras está disponible y lo empeora cuando se retira; un tutor diseñado para dar pistas mitiga ese daño (Bastani et al., 2025).<br>- El proyecto es práctica libre: el aprendizaje está en construirlo, y el andamiaje debe dar la ayuda mínima necesaria (Koedinger y Aleven, 2007, matriz #6). |
| **Cómo se materializa** | El chat del Tutor en la página de un proyecto. |
| **Trazabilidad** | `frontend-nuxt/stores/tutor.ts` (`proyectoAbierto`), `pages/estudiante/proyectos/[id].vue`; `src/tutor/tutor-context.service.ts` (sección de proyecto), `tutor.service.ts` (barrera también en proyectos); pruebas `tutor-proyectos.frontend.spec.ts`, `tutor.service.spec.ts`, `tutor-guidance.spec.ts`. |

## BT-20. El pseudocódigo se ejecuta: el estudiante ve qué hace su algoritmo

| | |
|---|---|
| **Problema observado** | El curso «Pensamiento algorítmico» enseña con pseudocódigo al estilo PSeInt, pero en STIRE el pseudocódigo solo aparecía en ejercicios de ordenar o completar. En Proyectos solo había páginas web y JavaScript: quien está en el curso sin tanto código no tenía dónde escribir sus propios algoritmos ni forma de comprobar si hacen lo que cree. |
| **Decisión** | Un tipo de proyecto «Pseudocódigo»: un archivo `algoritmo.psc` con colores para las palabras clave, y «Ejecutar» con una Entrada en la que cada `Leer` toma la siguiente línea. El algoritmo se traduce a JavaScript y corre en el navegador con el mismo límite de 3 segundos que los programas. Si algo no se entiende, o una variable se usa sin valor, el error dice la línea y qué pasó, en palabras del estudiante. Es un subconjunto de PSeInt: lo que usa el curso (Leer, Escribir, `<-`, Si, Mientras, Repetir, Para, Segun, Definir, arreglos y funciones comunes). También sirve de tipo para las Entregas y su código inicial. |
| **Fundamento** | - Una dificultad central al aprender a programar es no tener un modelo de la «máquina» que ejecuta el programa: qué hace cada instrucción y en qué orden (du Boulay, 1986). Ejecutar el algoritmo hace visible ese comportamiento.<br>- La retroalimentación informa sobre la tarea y el proceso (Hattie y Timperley, 2007, matriz #13; Shute, 2008): un error con su línea y su causa señala qué revisar sin dar la solución. |
| **Cómo se materializa** | En «Mis proyectos», el tipo «Pseudocódigo»; en las Entregas, «Algoritmo en pseudocódigo». |
| **Trazabilidad** | `frontend-nuxt/utils/pseudocodigo.ts` (traducción), `components/proyectos/ResultadoProyecto.vue` (Ejecutar), `components/CodeEditor.vue` (colores); `src/proyectos/proyecto-reglas.ts` (tipo `pseudocodigo`); pruebas `pseudocodigo.frontend.spec.ts`, `proyecto-reglas.spec.ts`, `proyectos-navegador.frontend.spec.ts`. |

## BT-21. Estadísticas sin abrumar: la racha a la vista, el resto plegado

| | |
|---|---|
| **Problema observado** | «Mi progreso» y la ficha del estudiante mostraban a la vez tres indicadores, cuatro tarjetas de estadísticas (un calendario de 16 semanas casi vacío para quien empieza, un gráfico de repasos que repetía «Repasos para hoy», el estado de las lecciones y una retención vacía con un «—»), una tarjeta por lección con su propio botón y una tabla. El dueño lo resumió: «otra vez volvemos a un panel de avión». Había además incoherencias: el color de una lección usaba otros cortes que su nombre, la racha del docente contaba días en UTC y sus «repasos pendientes» decían 0 cuando el estudiante veía 5 para hoy. |
| **Decisión** | A la vista, solo lo que motiva y orienta: avance del curso, repasos para hoy con «Repasar ahora», y la **racha** con los siete días de la semana. Lo demás (calendario, pronóstico, estado de las lecciones, retención) queda en «Ver más estadísticas», plegado; cada tarjeta vacía explica cuándo aparecerá. Cada lección es una fila con su estado, su barra y una sola acción cuando hace falta («Repasar» o «Practicar»). La racha y los repasos pendientes se cuentan por día en hora de Colombia, iguales para el estudiante y el docente; si hoy aún no practicó, la racha de ayer sigue viva y se avisa sin regañar. |
| **Fundamento** | - Cada elemento en pantalla consume memoria de trabajo; lo que no ayuda a la tarea es carga extraña (Sweller, van Merriënboer y Paas, 1998, matriz #14).<br>- La retroalimentación que mejora el desempeño informa sobre la tarea, no compara ni juzga a la persona (Kluger y DeNisi, 1996; Hattie y Timperley, 2007, matriz #13): por eso el aviso de la racha anima en vez de culpar.<br>- La racha y la semana en siete puntos son una decisión de producto tomada de los referentes (Duolingo, Anki), no una conclusión de investigación. |
| **Cómo se materializa** | «Mi progreso» del estudiante y la ficha del estudiante del docente. |
| **Trazabilidad** | `frontend-nuxt/components/EstadisticasEstudiante.vue`, `utils/racha.ts`, `pages/estudiante/progreso.vue`, `pages/docente/estudiante/[studentId].vue`; `src/learning-progress/estadisticas.ts` (racha), `src/analytics/racha-y-repasos.ts`; pruebas `racha.frontend.spec.ts`, `estadisticas.spec.ts`, `racha-y-repasos.spec.ts`. |

## BT-22. Imágenes, recursos y ejemplos en vivo dentro del texto de la lección

| | |
|---|---|
| **Problema observado** | Una imagen o un video de la lección era un bloque aparte, con su propio título, que se ordenaba arriba o abajo del texto. El docente no podía poner la imagen junto al párrafo que la explica, ni un ejemplo de HTML, CSS y JavaScript que el estudiante viera funcionar ahí mismo. |
| **Decisión** | En el editor de la lección, «Insertar aquí»: **Imagen** (subida o enlace, con descripción obligatoria), **Video o recurso** (YouTube, Genially, Canva, Drive, Scratch, PhET…) y **Ejemplo en vivo** (HTML, CSS y JavaScript que corre en un marco aislado, con «Ver el código»). Cada uno queda en su propia línea del texto, donde está el cursor, y la vista previa lo muestra igual que lo verá el estudiante. El servidor valida cada enlace con las mismas reglas de los recursos sueltos y arma él mismo la dirección de inserción. |
| **Fundamento** | - Separar una figura del texto que la explica obliga a integrarlos mentalmente (efecto de atención dividida); integrarlos reduce la carga extraña (Sweller, van Merriënboer y Paas, 1998, matriz #14).<br>- Un ejemplo que se ejecuta deja ver qué hace el código (du Boulay, 1986), igual que el pseudocódigo ejecutable (BT-20). |
| **Cómo se materializa** | El editor de lecciones del docente y la lección del estudiante. |
| **Trazabilidad** | `src/content/recursos/insertados.ts`, `content.service.ts` (`metadata.insertados`, vista previa); `frontend-nuxt/utils/contenidoLeccion.ts`, `components/ContenidoLeccion.vue`, `EjemploEnVivo.vue`, `docente/LessonEditor.vue`; pruebas `insertados.spec.ts`, `content.service.spec.ts`, `contenido-leccion.frontend.spec.ts`. |

---

## BT-23. La navegación y el tutor siempre a la vista

| | |
|---|---|
| **Problema observado** | Medido en producción el 03/10/2026:<br>- En computador, la barra lateral se iba con el scroll (subía más de 1100 px).<br>- En el celular, dentro de un ejercicio, el encabezado desaparecía al bajar y con él «Probar», «Entregar» y el botón del Tutor.<br>- En el celular, el Tutor era un ícono sin nombre.<br>El dueño del proyecto lo resumió: «a veces no se encuentra ese botón». |
| **Decisión** | - Encabezado fijo y semitransparente.<br>- Barra lateral fija con su propio scroll, que se contrae con un solo ícono.<br>- En el ejercicio, las acciones principales fijas también en el celular.<br>- El Tutor siempre a la vista con un solo acceso: un botón flotante «Tutor», con su nombre, abajo a la derecha en todas las pantallas. Responde a la recomendación de José: «cambiar la ventana o el acceso al tutor […] hacia una zona más natural y cómoda para la interacción constante». |
| **Fundamento** | - Reconocer es más fácil que recordar, y el estado del sistema debe estar a la vista (Nielsen, 1994). Una herramienta que hay que buscar exige recordar dónde estaba.<br>- Cada búsqueda de un control es carga extraña que compite con la tarea de aprender (Sweller, van Merriënboer y Paas, 1998, matriz #14; Mandel, 1997, matriz #22: «reducir la carga de memoria»).<br>- Referentes de producto (no evidencia científica): Coursera y LeetCode ponen el asistente en la barra superior; Platzi y Coursera dejan fija la navegación del curso; la esquina inferior derecha es donde la mayoría espera un chat. Khanmigo casi no se usaba cuando había que buscarlo en una esquina. Detalle en `referentes/PATRONES_DE_INTERFAZ.md` (P-UI-01 a P-UI-05). |
| **Cómo se materializa** | Todas las pantallas del estudiante y el espacio de ejercicios. |
| **Trazabilidad** | `frontend-nuxt/composables/useMobileSidebar.ts`, `components/layout/SidebarNav.vue`, `components/layout/HeaderNav.vue`, `components/tutor/LanzadorTutor.vue`, `layouts/workspace.vue`; commits `f785dd7`, `455cb12`; mediciones en `referentes/OBSERVACION_2026-10-03.md`. |

## BT-24. El tutor habla al nivel del estudiante en el tema que tiene abierto

| | |
|---|---|
| **Problema observado** | En la prueba con Gemini real (03/10/2026), un estudiante con dos lecciones del principio dominadas quedó «avanzado» por el promedio de sus unidades. En un ejercicio básico, el Tutor le habló de «deserializar» y «stdout» y le dijo «dado tu perfil avanzado». La instrucción para el nivel avanzado pedía hablar de eficiencia y Big O. |
| **Decisión** | - El nivel se mide en la unidad abierta; una unidad sin empezar cuenta como principiante.<br>- Todos los niveles reciben lenguaje sencillo, y un término técnico se explica en la misma frase.<br>- Al avanzado se le propone un reto, no jerga.<br>- El Tutor nunca menciona el perfil ni el nivel del estudiante. |
| **Fundamento** | - **Efecto de reversión de la experticia:** la guía que ayuda al novato estorba al experto y al revés. La experticia es por dominio, no global (Kalyuga, Ayres, Chandler y Sweller, 2003).<br>- **El diseño socrático puro tiene costo:** con Khanmigo, los estudiantes de bajo desempeño se confundían más y muchos abandonaban (referente de producto, reportado por prensa). |
| **Cómo se materializa** | El Tutor de IA del estudiante. |
| **Trazabilidad** | `src/tutor/tutor-context.service.ts` (`nivelDelEstudiante`, reglas 3 y 7); pruebas `tutor-context.service.spec.ts`, `validate-pre-frontend.spec.ts`; commit `386ef8d`. |

## BT-25. El tutor se ofrece cuando el estudiante falla, sin imponerse

| | |
|---|---|
| **Problema observado** | El Tutor solo se abría desde un botón. Khan Academy encontró que los estudiantes casi no abrían a Khanmigo desde un ícono en la esquina. |
| **Decisión** | - Al fallar un caso de prueba aparece «¿No te sale lo esperado?», con «Pedir una pista al Tutor» y «Ahora no».<br>- Al no aprobar un intento, «Repasar lo que falló con el Tutor».<br>- La pista se pide con el código del estudiante como contexto.<br>- La oferta se puede cerrar y vuelve en la siguiente prueba fallida. |
| **Fundamento** | - **El dilema de la asistencia:** la ayuda sirve cuando hay evidencia de dificultad y a pedido; dada antes de tiempo reemplaza el esfuerzo que produce el aprendizaje (Koedinger y Aleven, 2007, matriz #6).<br>- **Diseño frente a acceso libre:** un tutor de IA con diseño pedagógico explícito superó a una clase activa (Kestin et al., 2025); sin barreras, la IA empeora el examen (Bastani et al., 2025).<br>- **Referentes de producto:** Duolingo Max explica la respuesta tras el error; Codecademy explica el error del código. Ver `referentes/IA_EDUCATIVA.md`. |
| **Cómo se materializa** | El espacio de ejercicios. |
| **Trazabilidad** | `frontend-nuxt/utils/ofertaTutor.ts`, `pages/estudiante/evaluacion/[activityId].vue`; commit `47cce51`. |

## BT-26. Las sugerencias para el tutor aparecen al empezar, no siempre

| | |
|---|---|
| **Problema observado** | Tres atajos con título ocupaban dos líneas fijas debajo del chat del Tutor, también en lecciones donde dos de ellos («caso borde», «condición de parada») no tenían sentido. El dueño del proyecto: «estorban». |
| **Decisión** | - En un ejercicio, los atajos se ven solos hasta la primera pregunta.<br>- Después quedan detrás de un bombillo junto al campo de escribir.<br>- Los de código solo aparecen en ejercicios de código. |
| **Fundamento** | - **Carga extraña:** lo que no sirve para la tarea en ese momento compite por la memoria de trabajo (Sweller et al., 1998, matriz #14).<br>- **Quitar lo accesorio:** una de las formas de reducir la carga en el aprendizaje multimedia (Mayer y Moreno, 2003).<br>- **Referentes de producto:** Coursera Coach, ChatGPT y Gemini muestran sugerencias solo al iniciar la conversación. |
| **Cómo se materializa** | El panel del Tutor. |
| **Trazabilidad** | `frontend-nuxt/utils/atajosTutor.ts`, `components/tutor/TutorChatDrawer.vue`; commit `84fbf44`. |

## BT-27. Registro en dos pasos: lo obligatorio primero, lo opcional aparte

| | |
|---|---|
| **Problema observado** | Para registrarse había que bajar. Lo opcional (código de clase, clave del Tutor) se mezclaba con lo obligatorio y había un campo «confirmar contraseña». |
| **Decisión** | - **Paso 1:** tipo de cuenta, nombre, correo y una contraseña con el botón para verla; «Crear cuenta» a la vista sin bajar.<br>- **Paso 2, opcional:** al que se llega con un botón aparte.<br>- **Errores:** un mensaje por campo y el cursor en el primero que falta. |
| **Fundamento** | - **Divulgación progresiva:** mostrar al principio solo lo necesario reduce la carga (Sweller et al., 1998, matriz #14; Mayer y Moreno, 2003).<br>- **Prevención de errores** y mensajes que digan cómo recuperarse (Nielsen, 1994).<br>- **Guías de UX (no evidencia científica):** para pocos campos, una página; lo largo, en pasos (NN/g). Quitar «confirmar contraseña» y dar el ojo para verla reduce errores y abandono. |
| **Cómo se materializa** | El registro. |
| **Trazabilidad** | `frontend-nuxt/pages/auth/register.vue`, `utils/registro.ts`; commit `00e383b`. |

---

## BT-28. La clase dice para qué asignatura es; el catálogo lo amplía el docente

| | |
|---|---|
| **Problema observado** | La barra superior decía «Facultad de Ingeniería de Sistemas», un texto fijo y falso: STIRE se hace para la Licenciatura en Informática (Facultad de Educación y Ciencias Humanas). La clase no guardaba su asignatura, semestre, grupo ni periodo. |
| **Decisión** | - **Cinco niveles opcionales:** institución → (facultad) → programa (carrera o grado) → asignatura → clase.<br>- **Tres formas de asignatura:** de un programa; de una institución sin programa (electiva libre); o libre, sin institución.<br>- **Catálogo abierto:** el docente agrega asignaturas, programas e instituciones al crear su clase; repetir devuelve lo existente.<br>- **La barra superior sale de los datos;** sin datos no muestra nada. |
| **Fundamento** | - **Correspondencia con el mundo real y prevención de errores** (Nielsen, 1994): el sistema usa las categorías del usuario (asignatura, semestre, grupo) y no afirma lo que no sabe.<br>- **Guías de producto (no evidencia científica):** Brightspace separa la plantilla del curso de cada oferta por periodo; Canvas Commons comparte por alcance (solo yo, institución, consorcio, público). Detalle en `docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md`.<br>- **Herramienta flexible:** todo es opcional y no hace falta un administrador (BT-18). |
| **Cómo se materializa** | «Nueva clase» y Ajustes (asignatura, grupo, periodo); barra superior. |
| **Trazabilidad** | `src/institution/`, `src/migrations/1791600000000-AddOrganizacionAcademica.ts`, `frontend-nuxt/components/docente/SelectorAsignatura.vue`, `utils/contextoAcademico.ts`. |

---

## BT-29. Gamificación sobria: racha de semanas y esfuerzo de la semana, sin medallas ni ranking

| | |
|---|---|
| **Problema observado** | El inicio mostraba una racha de **días**: quien estudia martes y jueves la perdía cada semana. Había un módulo de medallas en pausa, con un diseño que no servía (un solo «desbloqueado por» por medalla). |
| **Decisión** | - **Racha de semanas** seguidas con práctica; si esta semana aún no practica, la de la semana pasada sigue viva.<br>- **Esfuerzo de la semana** en una línea: días de estudio, ejercicios **avanzados** aprobados y repasos hechos. Repetir lo fácil suma días, no ejercicios avanzados ni dominio.<br>- Sin puntos, medallas ni ranking. Sin práctica, una invitación sin regaño.<br>- Se quitó el módulo de medallas y su tabla. |
| **Fundamento** | - **Efectos pequeños** de la gamificación sobre el aprendizaje; funciona mejor con narrativa y con competencia combinada con colaboración, no solo con puntos y medallas (Sailer y Homner, 2020). Por eso lo que se muestra es el **esfuerzo propio**, no una comparación.<br>- **Justicia académica** (pilar 3): no premiar la repetición de lo fácil (ver BT del dominio y Baker, Corbett y Koedinger, 2004).<br>- La propuesta concreta viene de `REFERENTES_PLATAFORMAS_Y_STI.md` §10. |
| **Cómo se materializa** | Tarjeta «Racha de estudio» del inicio del estudiante. «Mi progreso» conserva la racha de días al estilo Anki (BT-21). |
| **Trazabilidad** | `src/analytics/racha-y-repasos.ts` (`rachaDeSemanas`, `esfuerzoDeLaSemana`), `frontend-nuxt/utils/racha.ts`, `src/migrations/1791900000000-QuitarGamificacion.ts`. |

---

## Decisiones anteriores que también tienen fundamento (resumen; ampliar si se anexan)

| Decisión | Fundamento | Dónde se detalla |
|---|---|---|
| El tutor IA guía con preguntas y no da la solución | Sin barreras, la IA mejora la práctica y **empeora** el examen sin IA; un tutor con pistas mitiga ese daño (Bastani et al., 2025). Ayuda graduada (Koedinger y Aleven, 2007, matriz #6). | `REFERENTES_PLATAFORMAS_Y_STI.md` §8 |
| Repetir un ejercicio fácil pesa menos en el dominio | Evitar que se «juegue con el sistema» (Baker, Corbett y Koedinger, 2004). | `REFERENTES_PLATAFORMAS_Y_STI.md` §10 |
| Mapa de calor del docente | Tableros que convierten datos en acción (Verbert et al., 2013, matriz #21; Holstein et al., 2018). | `REFERENTES_PLATAFORMAS_Y_STI.md` §9 |
| Repasos con repetición espaciada (SM-2) | Woźniak y Gorzelańczyk (1994, matriz #2); Cepeda et al. (2006, matriz #3). | `DISENO_PRACTICA_ADAPTATIVA.md` |
| Tutoría como meta | Efectividad de la tutoría humana y de los STI por pasos (VanLehn, 2011, matriz #5); problema de las 2 sigmas (Bloom, 1984, matriz #30). | `REFERENTES_PLATAFORMAS_Y_STI.md` §7 |

---

## Referencias (verificadas en Crossref; las de la matriz, con su número)

- Atkinson, R. K., Derry, S. J., Renkl, A. y Wortham, D. (2000). Learning from Examples: Instructional Principles from the Worked Examples Research. *Review of Educational Research, 70*(2), 181-214. https://doi.org/10.3102/00346543070002181
- Baker, R. S., Corbett, A. T. y Koedinger, K. R. (2004). Detecting Student Misuse of Intelligent Tutoring Systems. En *ITS 2004*, LNCS, 531-540. https://doi.org/10.1007/978-3-540-30139-4_50
- Bastani, H., Bastani, O., Sungu, A., Ge, H. et al. (2025). Generative AI without guardrails can harm learning: Evidence from high school mathematics. *PNAS, 122*(26). https://doi.org/10.1073/pnas.2422633122
- Sailer, M. y Homner, L. (2020). The Gamification of Learning: a Meta-analysis. *Educational Psychology Review, 32*(1), 77-112. https://doi.org/10.1007/s10648-019-09498-w
- Black, P. y Wiliam, D. (1998). Assessment and Classroom Learning. *Assessment in Education: Principles, Policy & Practice, 5*(1), 7-74. https://doi.org/10.1080/0969595980050102
- Bloom, B. S. (1968). Learning for Mastery. *Evaluation Comment, 1*(2). — matriz #1
- Bloom, B. S. (1984). The 2 Sigma Problem. *Educational Researcher, 13*(6), 4-16. — matriz #30
- Butler, R. (1988). Enhancing and undermining intrinsic motivation: the effects of task-involving and ego-involving evaluation on interest and performance. *British Journal of Educational Psychology, 58*(1), 1-14. https://doi.org/10.1111/j.2044-8279.1988.tb00874.x
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T. y Rohrer, D. (2006). Distributed practice in verbal recall tasks. *Psychological Bulletin, 132*(3), 354-380. — matriz #3
- du Boulay, B. (1986). Some Difficulties of Learning to Program. *Journal of Educational Computing Research, 2*(1), 57-73. https://doi.org/10.2190/3lfx-9rrf-67t8-uvk9
- Fuchs, D. y Fuchs, L. S. (2006). Introduction to response to intervention: What, why, and how valid is it? *Reading Research Quarterly, 41*(1). https://doi.org/10.1598/rrq.41.1.4
- Guskey, T. R. (2007). Closing Achievement Gaps: Revisiting Benjamin S. Bloom's "Learning for Mastery". *Journal of Advanced Academics, 19*(1). https://doi.org/10.4219/jaa-2007-704
- Heffernan, N. T. y Heffernan, C. L. (2014). The ASSISTments Ecosystem. *International Journal of Artificial Intelligence in Education, 24*(4). https://doi.org/10.1007/s40593-014-0024-x
- Hattie, J. y Timperley, H. (2007). The Power of Feedback. *Review of Educational Research, 77*(1), 81-112. — matriz #13
- Holstein, K., McLaren, B. M. y Aleven, V. (2018). Student Learning Benefits of a Mixed-Reality Teacher Awareness Tool in AI-Enhanced Classrooms. En *AIED 2018*, LNCS, 154-168. https://doi.org/10.1007/978-3-319-93843-1_12
- Holstein, K., McLaren, B. M. y Aleven, V. (2019). Co-Designing a Real-Time Classroom Orchestration Tool to Support Teacher–AI Complementarity. *Journal of Learning Analytics, 6*(2). https://doi.org/10.18608/jla.2019.62.3
- Kalyuga, S., Ayres, P., Chandler, P. y Sweller, J. (2003). The Expertise Reversal Effect. *Educational Psychologist, 38*(1), 23-31. https://doi.org/10.1207/S15326985EP3801_4
- Kestin, G., Miller, K., Klales, A., Milbourne, T. y Ponti, G. (2025). AI tutoring outperforms in-class active learning: an RCT introducing a novel research-based design in an authentic educational setting. *Scientific Reports, 15*, 17458. https://doi.org/10.1038/s41598-025-97652-6
- Kluger, A. N. y DeNisi, A. (1996). The effects of feedback interventions on performance. *Psychological Bulletin, 119*(2), 254-284. https://doi.org/10.1037/0033-2909.119.2.254
- Knoop-van Campen, C. A. N. y Molenaar, I. (2020). How Teachers Integrate Dashboards into Their Feedback Practices. *Frontline Learning Research, 8*(4), 37-51. — matriz #20
- Koedinger, K. R. y Aleven, V. (2007). Exploring the Assistance Dilemma in Experiments with Cognitive Tutors. *Educational Psychology Review, 19*(3), 239-264. — matriz #6
- Kulik, C.-L. C., Kulik, J. A. y Bangert-Drowns, R. L. (1990). Effectiveness of Mastery Learning Programs: A Meta-Analysis. *Review of Educational Research, 60*(2). https://doi.org/10.2307/1170612
- Liu, R., Zenke, C., Liu, C., Holmes, A., Thornton, P. y Malan, D. J. (2024). Teaching CS50 with AI: Leveraging Generative Artificial Intelligence in Computer Science Education. En *Proc. SIGCSE 2024*, 750-756. https://doi.org/10.1145/3626252.3630938
- Mandel, T. (1997). *The Elements of User Interface Design*. Wiley. — matriz #22
- Mayer, R. E. y Moreno, R. (2003). Nine Ways to Reduce Cognitive Load in Multimedia Learning. *Educational Psychologist, 38*(1), 43-52. https://doi.org/10.1207/S15326985EP3801_6
- Molenaar, I. y Knoop-van Campen, C. A. N. (2019). How Teachers Make Dashboard Information Actionable. *IEEE Transactions on Learning Technologies, 12*(3). https://doi.org/10.1109/tlt.2018.2851585
- Nicol, D. J. y Macfarlane-Dick, D. (2006). Formative assessment and self-regulated learning: a model and seven principles of good feedback practice. *Studies in Higher Education, 31*(2). https://doi.org/10.1080/03075070600572090
- Nielsen, J. (1994). Enhancing the explanatory power of usability heuristics. En *Proc. CHI '94*, 152-158. https://doi.org/10.1145/191666.191729
- Roschelle, J., Feng, M., Murphy, R. F. y Mason, C. A. (2016). Online Mathematics Homework Increases Student Achievement. *AERA Open, 2*(4). https://doi.org/10.1177/2332858416673968
- Roediger, H. L. y Karpicke, J. D. (2006). Test-Enhanced Learning. *Psychological Science, 17*(3), 249-255. — matriz #4
- Settles, B. y Meeder, B. (2016). A Trainable Spaced Repetition Model for Language Learning. En *Proc. ACL 2016*, 1848-1858. https://doi.org/10.18653/v1/P16-1174
- Shute, V. J. (2008). Focus on Formative Feedback. *Review of Educational Research, 78*(1), 153-189. https://doi.org/10.3102/0034654307313795
- Sweller, J., van Merriënboer, J. J. G. y Paas, F. G. W. C. (1998). Cognitive Architecture and Instructional Design. *Educational Psychology Review, 10*(3), 251-296. — matriz #14
- VanLehn, K. (2011). The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems. *Educational Psychologist, 46*(4), 197-221. — matriz #5
- Verbert, K., Duval, E., Klerkx, J., Govaerts, S. y Santos, J. L. (2013). Learning Analytics Dashboard Applications. *American Behavioral Scientist, 57*(10), 1500-1509. — matriz #21
- Wiliam, D. (2011). What is assessment for learning? *Studies in Educational Evaluation, 37*(1). https://doi.org/10.1016/j.stueduc.2011.03.001
- Wise, A. F. (2014). Designing pedagogical interventions to support student use of learning analytics. En *LAK '14*, 203-211. https://doi.org/10.1145/2567574.2567588
- Woźniak, P. y Gorzelańczyk, E. (1994). Optimization of repetition spacing in the practice of learning. *Acta Neurobiologiae Experimentalis, 54*(1), 59-62. — matriz #2
- Ye, J., Su, J. y Cao, Y. (2022). A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling. En *Proc. KDD 2022*, 4381-4390. https://doi.org/10.1145/3534678.3539081
- Zimmerman, B. J. (2002). Becoming a Self-Regulated Learner: An Overview. *Theory Into Practice, 41*(2), 64-70. — matriz #31

**Referentes de producto** (no son evidencia científica). Desde el 03/10/2026 se estudian con un método propio
(pedagogía, UX y UI; cada hallazgo con decisión y estado) en `referentes/`: Coursera, Platzi, LeetCode, Codecademy,
freeCodeCamp, Exercism, Khan Academy, CS50, Brilliant, Khanmigo, Coursera Coach, Duolingo Max, el modo de estudio de
ChatGPT, Guided Learning de Gemini, Anki (SM-2 y FSRS), Duolingo y Quizlet. Los anteriores (documentación oficial consultada el 30/09/2026): Google Classroom,
Canvas (SpeedGrader, Mastery Paths, «Message Students Who»), Moodle (Tarea, intentos), Khan Academy (metas de dominio),
IXL (Trouble Spots), ASSISTments (Skill Builders), MATHia LiveLab, Brightspace (agentes inteligentes), Gradescope, Codio,
Khanmigo, Duolingo y Anki. Enlaces en `docs/DISENO_INTERVENCION_DOCENTE.md` §9.

---

## Cómo mantener este documento

- Cada decisión de diseño nueva con fundamento agrega una entrada **BT-nn** con el mismo formato.
- Una obra nueva se verifica en Crossref antes de citarla. **No se usan fuentes de NotebookLM sin verificar** (ver
  `INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`).
- Si una obra pasa a ser central para la tesis, se agrega a `MATRIZ_ARTICULOS_AMPLIADA.md` con su número y aquí se cita
  con ese número.
