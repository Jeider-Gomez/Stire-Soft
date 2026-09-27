# Reto: 15 artículos científicos que respaldan STIRE

**Guía:** [Guía del Estudiante — Semana 03](../guias/Guia_Estudiante_Semana_03.docx), §2 · **Distribución exigida:** 5 + 5 + 5

Los 15 son artículos de revista o de congreso con **DOI verificado** (Crossref / ERIC). Salen de la
matriz bibliográfica del proyecto, [`investigacion/MATRIZ_ARTICULOS_AMPLIADA.md`](../../investigacion/MATRIZ_ARTICULOS_AMPLIADA.md),
donde está el registro de verificación de cada uno. Cada fila dice qué decisión **real** de STIRE
respalda, con el lugar del código o de la aplicación donde se puede comprobar.

> **Por qué este cuidado:** la primera matriz del proyecto tenía 15 referencias generadas con IA y
> las 15 resultaron inexistentes o equivocadas al verificarlas (ver
> [`investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`](../../investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md)).
> Desde entonces ninguna obra entra sin DOI o registro comprobado.

## 1. Fundamentación pedagógica y cognitiva

*¿Qué modelos pedagógicos justifican el diseño educativo?*

| # | Referencia | Qué respalda en STIRE |
|---|---|---|
| 1 | Woźniak, P. A., & Gorzelańczyk, E. J. (1994). Optimization of repetition spacing in the practice of learning. *Acta Neurobiologiae Experimentalis, 54*(1), 59–62. https://doi.org/10.55782/ane-1994-1003 | El algoritmo **SM-2** que programa los repasos de cada unidad (`src/review-schedules/`, pantalla «Repasos») |
| 2 | Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354 | Repartir la práctica en el tiempo en vez de concentrarla: los repasos llegan días después, no el mismo día |
| 3 | Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x | Repasar **resolviendo** (práctica de recuperación), no releyendo: «Iniciar refuerzo» lleva de vuelta a la unidad para practicar |
| 4 | VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. *Educational Psychologist, 46*(4), 197–221. https://doi.org/10.1080/00461520.2011.611369 | Un tutor que guía paso a paso en lugar de dar la respuesta: el **Tutor IA** socrático (`src/tutor/`) |
| 5 | Koedinger, K. R., & Aleven, V. (2007). Exploring the assistance dilemma in experiments with cognitive tutors. *Educational Psychology Review, 19*(3), 239–264. https://doi.org/10.1007/s10648-007-9049-0 | El **dilema de la ayuda**: ni demasiada ni ninguna. El docente decide hasta qué nivel puede ayudar el Tutor en su clase (configuración del Tutor, ADR 11) |

## 2. Arquitectura de software y frontend

*¿Por qué estas tecnologías y esta arquitectura mejoran el rendimiento y la mantenibilidad?*

| # | Referencia | Qué respalda en STIRE |
|---|---|---|
| 6 | Ala-Mutka, K. M. (2005). A survey of automated assessment approaches for programming assignments. *Computer Science Education, 15*(2), 83–102. https://doi.org/10.1080/08993400500150747 | Separar entrega, ejecución y calificación: el motor de evaluación por estrategias (`src/evaluation-engine/`) |
| 7 | Douce, C., Livingstone, D., & Orwell, J. (2005). Automatic test-based assessment of programming. *Journal on Educational Resources in Computing, 5*(3), Art. 4. https://doi.org/10.1145/1163405.1163409 | Calificar código con **casos de prueba públicos y ocultos**: «Probar código» usa los públicos y «Entregar» todos |
| 8 | Ihantola, P., Ahoniemi, T., Karavirta, V., & Seppälä, O. (2010). Review of recent systems for automatic assessment of programming assignments. En *Proceedings of the 10th Koli Calling* (pp. 86–93). ACM. https://doi.org/10.1145/1930464.1930480 | Ubica a STIRE en la clase de sistemas «juez automático de programación» y sus componentes esperados (sandbox, límites, retroalimentación) |
| 9 | Paiva, J. C., Leal, J. P., & Figueira, Á. (2022). Automated assessment in computer science education: A state-of-the-art review. *ACM Transactions on Computing Education, 22*(3), 1–40. https://doi.org/10.1145/3513140 | Revisión más reciente del campo: respalda el diseño completo, desde la ejecución aislada hasta la retroalimentación inmediata |
| 10 | Bogner, J., & Merkel, M. (2022). To type or not to type? A systematic comparison of the software quality of JavaScript and TypeScript applications on GitHub. En *Proceedings of the 19th International Conference on Mining Software Repositories (MSR '22)*. ACM. https://doi.org/10.1145/3524842.3528454 | Usar **TypeScript** en todo el proyecto (backend NestJS y frontend Nuxt) |

**Sobre Nuxt / Vue 3:** la literatura no compara frameworks de interfaz entre sí (no hay estudios
concluyentes de «Vue contra React»), así que no lo afirmamos. Nuxt 3 se usa porque la guía de la
Semana 03 lo prescribe; los artículos 6 a 10 respaldan la arquitectura y el tipado, no la marca del
framework.

## 3. Diseño de interfaces (GUI / UX) y usabilidad

*¿Qué principios de interacción humano-computador sustentan las vistas?*

| # | Referencia | Qué respalda en STIRE |
|---|---|---|
| 11 | Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112. https://doi.org/10.3102/003465430298487 | Retroalimentación inmediata y específica: resultado por caso de prueba y por regla (HTML/CSS) al probar y al entregar |
| 12 | Sweller, J., van Merriënboer, J. J. G., & Paas, F. G. W. C. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251–296. https://doi.org/10.1023/A:1022193728205 | Reducir la carga cognitiva: «Probar código» (sin costo) separado de «Entregar solución» (con intento), una tarea por pantalla |
| 13 | Chandler, P., & Sweller, J. (1992). The split-attention effect as a factor in the design of instruction. *British Journal of Educational Psychology, 62*(2), 233–246. https://doi.org/10.1111/j.2044-8279.1992.tb01017.x | Enunciado y editor **lado a lado** en la misma pantalla; el Tutor abre como panel lateral sin tapar el ejercicio |
| 14 | Verbert, K., Duval, E., Klerkx, J., Govaerts, S., & Santos, J. L. (2013). Learning analytics dashboard applications. *American Behavioral Scientist, 57*(10), 1500–1509. https://doi.org/10.1177/0002764213479363 | «Mi progreso»: dominio por unidad con su estado y una acción concreta («Reforzar este tema») |
| 15 | Knoop-van Campen, C. A. N., & Molenaar, I. (2020). How teachers integrate dashboards into their feedback practices. *Frontline Learning Research, 8*(4), 37–51. https://doi.org/10.14786/flr.v8i4.641 | Panel del docente con **alumnos en rezago** y detalle por estudiante para intervenir a tiempo |

## Libros exigidos por la guía (complementan, no cuentan entre los 15)

- Mandel, T. (1997). *The elements of user interface design*. Wiley. — Las 3 Reglas de Oro.
- Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill. — Cap. 12 (UX) y cap. 13 (navegación web).
- Sommerville, I. (2018). *Software engineering* (10.ª ed.). Pearson. — §5.2 (modelos de interacción) y §8.4 (pruebas con usuarios).
- Caro, M., Toscano, R., Hernández, F., & David, M. (2009). MODESEC: Modelo para el desarrollo de software educativo basado en competencias. *Nuevas Ideas en Informática Educativa, 5*, 188–200.

Cómo se aplican los libros a las pantallas: [`GUI_MOCKUPS_Y_NAVEGACION.md`](GUI_MOCKUPS_Y_NAVEGACION.md).
