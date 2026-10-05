---
estado: vigente (04/10/2026)
criterio: UI-05 de la lista de Sistemas Tutores Inteligentes (Caro, 2015) — replanificación instruccional ante bloqueos
pedido del dueño: «prefiero no abrumar al estudiante; debe sentirse satisfactorio; propone alternativas de lo que usan las
  plataformas referentes y los STI actuales»
---

# Replanificar sin abrumar: la ayuda escalonada

## 1. Lo que pide el criterio y lo que no se copia

UI-05 pide detectar el bloqueo (fallos seguidos, tiempos largos), **no repetir la misma explicación** y **cambiar de
táctica**. Su ejemplo (atenuar la pantalla y pasar al estudiante a un modo guiado después de 3 fallos) se descarta: quita
el control justo cuando el estudiante está frustrado.

## 2. Qué hacen los referentes y qué dice la evidencia

| Referente o estudio | Qué hace o encontró | Qué tomamos |
|---|---|---|
| **Khan Academy** | Al fallar: pistas una a una, un ejemplo resuelto y el video del tema («Get help»). El docente ve quién pidió ayuda. | Varias ayudas, **una a la vez**; el docente se entera (la pausa ya le avisa) |
| **ASSISTments** (Razzaq y Heffernan, 2006) | Dividir el problema en **subpreguntas** enseñó más que una pista larga, pero **obligar** a hacerlas frustró a algunos. | «Por pasos» como opción, **nunca forzada** |
| **Help Tutor** de Carnegie Mellon (Aleven, Roll, McLaren y Koedinger, 2016) | Los estudiantes piden ayuda de más (abusan de las pistas) o de menos. Orientar **cuándo** pedirla mejora su uso. | La ayuda **escala** con los fallos: primero lo mínimo, después más |
| **Ejemplos resueltos** (Atkinson, Derry, Renkl y Wortham, 2000) | Estudiar un problema **parecido** ya resuelto, paso a paso, ayuda a los novatos más que seguir intentando a ciegas. | Cambio de táctica tras 3 fallos: **un ejemplo parecido resuelto**, no el suyo |
| **Duolingo** | Los errores vuelven después, en repasos cortos, sin castigo. | STIRE ya lo hace con la repetición espaciada |

## 3. Qué hace STIRE

Al fallar un caso, una tarjeta (no una ventana ni una pantalla atenuada) ofrece **una** acción principal, «Ahora no» y,
plegadas, «Otras formas de destrabarte». La principal cambia según los fallos seguidos en ese ejercicio, contando tanto
«Probar» como «Entregar»:

| Fallos seguidos | Mensaje | Acción principal | Plegadas |
|---|---|---|---|
| 1 | «¿No te sale lo esperado?…» | Pedir una pista al Tutor | Por pasos |
| 2 | «¿Lo dividimos en partes?…» | Resolverlo por pasos con el Tutor | Pista, volver a la explicación |
| 3 o más | «Llevas varios intentos… Probemos de otra forma» | **Ver resuelto un ejemplo parecido** | Por pasos, volver a la explicación, pista |

- **«Ejemplo parecido»:** el Tutor resuelve paso a paso un problema con otro contexto y otros datos, sin escribir la
  solución del estudiante, y termina pidiéndole que diga qué paso se parece a lo que le falta (modo cerrado en
  `src/tutor/tutor-senales.ts`).
- **Se mantiene la pausa de la lección tras 3 fallos:** avisa al docente y propone volver a la explicación.
- **Nada se impone:** el estudiante puede cerrar la tarjeta y seguir intentando.

## 4. Por qué así no abruma

Se ve una acción a la vez. El tono es «probemos de otra forma», no «fallaste». El estudiante siempre puede seguir solo.
Lo que cambia es la **táctica** (pista, después subpreguntas, después un ejemplo), que es lo que pide el criterio, sin
quitarle el control.

## 5. Dónde está

`frontend-nuxt/utils/ofertaTutor.ts` (`ayudaSegunFallos`, con prueba), `stores/workspace.ts` (`fallosSeguidos`),
`stores/tutor.ts` (`verEjemploParecido`), `pages/estudiante/evaluacion/[activityId].vue`. Base teórica: BT-33.

## Referencias

- Aleven, V., Roll, I., McLaren, B. M. y Koedinger, K. R. (2016). Help Helps, But Only So Much: Research on Help Seeking with Intelligent Tutoring Systems. *International Journal of Artificial Intelligence in Education, 26*(1), 205-223. https://doi.org/10.1007/s40593-015-0089-1
- Atkinson, R. K., Derry, S. J., Renkl, A. y Wortham, D. (2000). Learning from Examples: Instructional Principles from the Worked Examples Research. *Review of Educational Research, 70*(2), 181-214. https://doi.org/10.3102/00346543070002181
- Razzaq, L. y Heffernan, N. T. (2006). Scaffolding vs. Hints in the Assistment System. En *Intelligent Tutoring Systems (ITS 2006)*, LNCS 4053, 635-644. https://doi.org/10.1007/11774303_63
- Khan Academy, guía para familias y mentores («Need help?»: pistas y video). Guía de producto, no evidencia científica.
