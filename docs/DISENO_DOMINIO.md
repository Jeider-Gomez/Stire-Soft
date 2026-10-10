# El dominio por evidencia: cómo sube, cómo baja y por qué siempre se puede llegar al 100 %

> 09/10/2026. Pedido de Jeider tras la prueba con el equipo: «tengo un ejercicio y no puedo seguir subiendo mi dominio».
> Que el docente no pueda diseñar una lección a la que no se llegue al 100 %. Que el dominio suba y baje, pero que el
> estudiante se sienta cómodo: un error no le cuesta la lección. Que no sienta que puede hacer trampa. Que repetir el
> mismo ejercicio suba poco. Y que quien ya sabe suba rápido.
> Código: `src/common/utils/motor-dominio.ts` (con su prueba). Base teórica: BT-43.

## 1. Lo que estaba mal (verificado en producción)

Se revisó con la API de producción y la cuenta de prueba de Valentina. El dominio se calculaba como «la mejor nota de
cada casilla» (casilla = tipo de pregunta × nivel; los ejercicios «parecidos» comparten casilla).

| # | Problema | Evidencia | Efecto |
|---|---|---|---|
| 1 | **La lista contradecía al dominio.** «Ver todos los ejercicios» calculaba «sube o no» con sus propias reglas, sin la penalización por repetir. | Lección 22: el ejercicio 85 le tomó 3 intentos y su casilla quedó en 85 %. El parecido 180 decía «Ya cuenta un parecido · no sube», pero sí subía. | Atascada en 96 %, con la pantalla diciendo que no había nada que hacer. |
| 2 | **Casillas congeladas.** Gastar los intentos de todos los ejercicios de una casilla la dejaba en su nota para siempre. | Regla de `SubmissionsService.start`. Con 1 intento en opción múltiple (decisión del 09/10) y 2 parecidos por casilla, fallar dos veces bastaba. | Imposible llegar al 100 % sin el docente. |
| 3 | **La penalización por repetir era permanente.** Un básico resuelto al 3.er intento valía 85 %, y solo se arreglaba con un parecido. | `mastery.calculator.ts` antes del 09/10. | Combinado con el 2, otra vía sin salida. |
| 4 | **Una entrega con nota baja topaba la lección.** El estudiante no puede rehacer una entrega cerrada. | `evidenciasDeEntregas`. | Lección topada por una nota del pasado. |
| 5 | **El dominio guardado no se recalcula.** Se guarda al entregar: un cambio de reglas solo llega a cada lección en su próxima entrega. | Lección 3 de Valentina: 96 % guardado, aunque con las reglas del 07/10 le daría 100. | Números viejos en pantalla. |

## 2. Qué hacen las plataformas que lo resuelven bien

| Plataforma o modelo | Cómo sube | Cómo baja | Qué tomamos |
|---|---|---|---|
| **Anki** (repetición espaciada) | Acertar alarga el intervalo hasta el próximo repaso. | Olvidar una tarjeta (un *lapse*) la manda a *reaprendizaje* y vuelve pronto; no se borra su historial ([manual, «Lapses»](https://docs.ankiweb.net/deck-options.html#lapses)). | Olvidar no es empezar de cero: los repasos de STIRE (SM-2) ya lo hacen, y un repaso fallado baja más que un fallo en práctica. |
| **Khan Academy** (niveles de dominio) | Por niveles: Familiar, Competente, Dominado. | Fallar en una prueba o evaluación mixta baja **un nivel**, no a cero. Según su centro de ayuda; es fuente secundaria, porque no se pudo abrir su página desde la sesión. | Bajar poco, en escalón, y que se recupere con un acierto. |
| **Duolingo** (half-life regression) | Cada acierto alarga la «vida media» de una palabra. | La probabilidad de recordar cae con el tiempo, y fallar acorta la vida media (Settles y Meeder, 2016). | El dominio es una **estimación** que se mueve con cada evidencia, no un máximo histórico. |
| **Math Garden** (Elo) | Ítems y estudiantes con un puntaje tipo Elo: acertar uno difícil sube más que uno fácil. | Fallar baja en proporción a lo esperado (Klinkenberg, Straatemeier y van der Maas, 2011). | Movimientos **proporcionales** y acotados: un error no derrumba la estimación. |
| **Knowledge tracing bayesiano** (BKT) | La probabilidad de dominar la habilidad sube con cada acierto. | Un error la baja según la probabilidad de «desliz» (Corbett y Anderson, 1995). | Dejar espacio al desliz: un error de quien ya sabía baja poco. |

La revisión de Pelánek (2017) compara estos modelos. Para sistemas educativos, el Elo destaca por su sencillez y su
robustez (Pelánek, 2016). Al comparar criterios de dominio, una media móvil exponencial de los resultados se comporta de
forma comparable a modelos más complejos como BKT, y el umbral elegido pesa más que el modelo (Pelánek y Řihák, 2017).
STIRE usa esa media móvil, con pasos distintos según qué tan nueva es la evidencia.

## 3. La arquitectura nueva: una estimación por casilla que se mueve con cada intento

Cada casilla tiene una estimación **p** de 0 a 1 (0 % a 100 %). Los intentos del estudiante se recorren en orden y cada
uno la mueve hacia su nota **r**:

| Intento | Cómo se mueve p | Por qué |
|---|---|---|
| Aprueba un ejercicio **nuevo** a la primera | p → r (llena la casilla de una vez) | Quien ya sabe avanza rápido: un acierto en algo que no había visto es la mejor evidencia (Elo: acertar lo inesperado mueve más). |
| Aprueba al 2.º intento del mismo ejercicio | p + 0,6 × (r − p) | Ya vio la pregunta y su error: es menos evidencia. |
| Aprueba al 3.º o más | p + 0,4 × (r − p) | Más repetición, menos sube. |
| Vuelve a aprobar uno ya aprobado | p + 0,25 × (r − p) | Es repaso: suma poco y no se puede «farmear» con el mismo ejercicio. |
| No aprueba, pero hizo una parte (p. ej., 3 de 5 casos) | p + 0,25 × (r − p) si r > p | Lo que sí sabe cuenta, poco. |
| Falla en práctica | p − 0,10 × (p − r) | Un error baja poco y nunca a cero. Tres errores seguidos desde 100 dejan la casilla en ~73 %. |
| Falla un **repaso** (lo olvidó) | p − 0,25 × (p − r) | Olvidar dice más que equivocarse practicando (Anki, Duolingo). |
| Llega a 98 % o más con nota completa | p = 1 | Sin esto, la media móvil se acercaría a 1 sin llegar nunca. |

El **dominio de la lección** es el promedio de sus casillas, ponderado por el peso de cada ejercicio
(`adaptiveWeight × baseWeight`). Las casillas de un nivel saltado con un reto, que nunca intentó, no cuentan.

**Variar es la forma de subir.** Como un parecido nuevo aprobado a la primera llena la casilla, la estrategia que más
rinde es practicar ejercicios distintos, no repetir el mismo (intercalar, Rohrer y Taylor, 2007). Eso también quita la
sensación de trampa: repetir hasta adivinar casi no suma, y adivinar de forma sistemática es «jugar con el sistema»
(Baker, Corbett y Koedinger, 2004).

**Un error no cuesta la lección.** La pérdida es proporcional y acotada. Equivocarse es parte de aprender, y la
retroalimentación tras el error es lo que hace que sirva (Metcalfe, 2017). Además, al decidir, las personas sienten una pérdida con
más fuerza que una ganancia del mismo tamaño (Kahneman y Tversky, 1979): por eso bajar es más lento que subir.

## 4. La garantía: ninguna lección queda sin salida

**Invariante:** desde cualquier historial, existe una secuencia finita de aprobados que lleva la lección al 100 %.

1. **Todo ejercicio vuelve a estar disponible.** Si el estudiante usó los intentos que fijó el docente, se reabre un
   intento a las 24 horas del último (`intentosDisponibles`). Rige al empezar un intento, en el recomendador, en la
   lista y en el detalle del ejercicio. El docente sigue fijando el límite; lo que no puede es dejar un ejercicio
   cerrado para siempre. Esperar un día además espacia la práctica.
2. **Cada aprobado completo acerca la casilla al menos un 25 % de lo que falta**, y desde 98 % cuenta como completa. Desde
   p = 0, repitiendo el mismo ejercicio, bastan como mucho 14 aprobados. Con un parecido nuevo, uno.
3. **Nada externo al estudiante la topa.** Las entregas revisadas solo pueden subir el dominio. Las actividades sin
   puntos no forman casilla.

`motor-dominio.spec.ts` lo comprueba con **500 lecciones al azar**: de 1 a 8 ejercicios, cualquier tipo, nivel,
puntaje, nota mínima y peso, y de 0 a 30 intentos al azar, con repasos fallados. En todas, el estudiante llega al 100 %.
Así es técnicamente imposible diseñar una lección a la que no se llegue, sin pedirle nada al docente. La guía de la
lección sigue recomendando 3 parecidos en opción múltiple: no para que sea posible, sino para que sea rápido y variado.

## 5. Cómo se aplica sin quitarle a nadie lo que ganó

- **Corte el 10/10/2026 (medianoche de Colombia).** Los intentos de antes se cuentan con las reglas de antes: la mejor
  nota, con la penalización suave al básico repetido, y sin bajar por fallar en práctica. Los de después, con las
  nuevas. Nadie baja por el cambio de reglas.
- **Recalcular una vez.** Después de desplegar: `node dist/scripts/recalcular-dominio.js --simular` dice qué cambiaría,
  y sin `--simular` lo guarda. No manda notificaciones ni cuenta intentos.
- **Aplicado el 10/10 sin bajarle a nadie.** El script solo guarda lo que sube. En las 8 lecciones donde el cálculo
  nuevo daba menos, guarda lo que el estudiante tenía en `learning_progress.dominioConservado`, y el dominio nunca baja
  de ahí, tampoco en sus próximas entregas. Casi siempre era una lección a la que se le agregaron ejercicios después
  de dominarla. En producción: 5 suben (3 atascadas llegan al 100 %), 8 se conservan, 93 quedan igual, 0 bajan.
- La lista y el dominio usan la **misma función**. La lista ya no puede decir «no sube» si sube, y dice cuánto: `ganancia`.

## 6. Lo que decide el docente

El motor no le quita decisiones al docente (pedido de Jeider, 09/10):

- **El peso de cada ejercicio** lo elige al crearlo, con su tipo de actividad (práctica, examen…). El motor lo respeta.
- **Los intentos de cada ejercicio, sus niveles y sus parecidos** los sigue fijando el docente.
- **El bloqueo entre módulos** es opcional y configurable (Ajustes → Avance).
- **Nuevo, en Ajustes → Avance:** cada cuántas horas se reabre un intento con el límite usado (1 a 168, por defecto 24)
  y si los niveles altos pesan más (por defecto no). Lo único que no puede elegir es dejar un ejercicio cerrado para
  siempre: es la garantía del §4.

## 7. Decisiones abiertas (para Jeider)

| Decisión | Propuesta | Cuándo |
|---|---|---|
| **Peso por nivel.** Que lo avanzado pese más (1 / 1,5 / 2). | Ya lo decide cada docente en su clase (apagado por defecto). Activarlo cambia el dominio de sus estudiantes en su próxima entrega. Recomendado: después de la prueba. | Cada docente. |
| **Olvido con el tiempo.** Hoy el dominio no baja si no se practica; lo atienden los repasos. | Opción: mostrar la «retención» de los repasos (Anki/FSRS, Ye, Su y Cao, 2022) junto al dominio, sin bajarlo. | Después de la prueba. |
| **Reabrir cada 24 horas.** | Cada docente lo cambia en su clase (1 a 168). Opción futura: reabrir antes cuando la lección tiene un repaso vencido. | Con datos de uso. |
| **Constantes** (0,6 / 0,4 / 0,25 / 0,10). | Son decisiones de diseño, no valores de la literatura. Ajustarlas con los datos de la prueba. | Con datos de uso. |

## Referencias (verificadas en Crossref)

- Baker, R. S., Corbett, A. T. y Koedinger, K. R. (2004). Detecting Student Misuse of Intelligent Tutoring Systems. En *ITS 2004*, LNCS, 531-540. https://doi.org/10.1007/978-3-540-30139-4_50
- Corbett, A. T. y Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction, 4*, 253-278. https://doi.org/10.1007/BF01099821
- Kahneman, D. y Tversky, A. (1979). Prospect Theory: An Analysis of Decision under Risk. *Econometrica, 47*(2), 263-291. https://doi.org/10.2307/1914185
- Klinkenberg, S., Straatemeier, M. y van der Maas, H. L. J. (2011). Computer adaptive practice of Maths ability using a new item response model for on the fly ability and difficulty estimation. *Computers & Education, 57*(2), 1813-1824. https://doi.org/10.1016/j.compedu.2011.02.003
- Metcalfe, J. (2017). Learning from Errors. *Annual Review of Psychology, 68*, 465-489. https://doi.org/10.1146/annurev-psych-010416-044022
- Pelánek, R. (2016). Applications of the Elo rating system in adaptive educational systems. *Computers & Education, 98*, 169-179. https://doi.org/10.1016/j.compedu.2016.03.017
- Pelánek, R. (2017). Bayesian knowledge tracing, logistic models, and beyond: an overview of learner modeling techniques. *User Modeling and User-Adapted Interaction, 27*, 313-350. https://doi.org/10.1007/s11257-017-9193-2
- Pelánek, R. y Řihák, J. (2017). Experimental Analysis of Mastery Learning Criteria. En *UMAP '17*, 156-163. https://doi.org/10.1145/3079628.3079667
- Rohrer, D. y Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*, 481-498. https://doi.org/10.1007/s11251-007-9015-8
- Settles, B. y Meeder, B. (2016). A Trainable Spaced Repetition Model for Language Learning. En *ACL 2016*, 1848-1858. https://doi.org/10.18653/v1/P16-1174
- Ye, J., Su, J. y Cao, Y. (2022). A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling. En *KDD '22*, 4381-4390. https://doi.org/10.1145/3534678.3539081
