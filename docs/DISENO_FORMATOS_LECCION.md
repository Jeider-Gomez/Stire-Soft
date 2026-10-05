---
estado: vigente (04/10/2026)
criterio: UI-01 de la lista de Sistemas Tutores Inteligentes (Caro, 2015) — adaptación multimodal (verbal / visual)
pedido del dueño: «hacer una encuesta y poner al estudiante contenido de su estilo me parece excesivo; tener el material
  en distintos tipos (visual, auditivo, práctico) para no limitarlo a lo textual; busca la base teórica»
---

# La lección en varios formatos, sin «estilos de aprendizaje»

## 1. Lo que pide el criterio y por qué no se copia el ejemplo

UI-01 propone diagnosticar el estilo de cada estudiante (Felder-Silverman: visual o verbal) y mostrarle «su» formato. Eso
es la **hipótesis del emparejamiento** (*meshing*): que se aprende mejor si la enseñanza coincide con el estilo preferido.

## 2. Qué dice la evidencia

| Hallazgo | Fuente |
|---|---|
| Revisión de la literatura: **no hay evidencia adecuada** para basar la enseñanza en los estilos de aprendizaje; los pocos estudios con el diseño correcto contradicen el emparejamiento. | Pashler, McDaniel, Rohrer y Bjork (2008) |
| Experimento con 121 adultos (audiolibro o texto, según su preferencia auditiva o visual): la preferencia **no** predijo la comprensión, ni inmediata ni a las 2 semanas. | Rogowsky, Calhoun y Tallal (2015) |
| «Dejen de propagar el mito»: clasificar al estudiante lo encasilla y no mejora su aprendizaje. | Kirschner (2017) |
| Lo que sí funciona para **todos**: palabras **y** imágenes juntas (principio multimedia); palabras **habladas** junto a una imagen mejor que texto en pantalla junto a la imagen (principio de modalidad); no repetir el mismo texto escrito y hablado a la vez (redundancia). | Mayer (2017) |
| La información codificada en dos canales, verbal y visual, se recuerda mejor (codificación dual). La lista de Caro cita a Paivio para este criterio. | Clark y Paivio (1991) |

**Conclusión:** tu intuición es la correcta. No hay que adivinar el estilo de cada uno; hay que **darle a todos varias
formas** de entrar a la misma idea, y que cada uno use la que le sirve en ese momento. Eso es también el principio de
«múltiples formas de representación» del Diseño Universal para el Aprendizaje (DUA, de CAST). Hay que decir que su
evidencia experimental todavía es limitada: los meta-análisis encuentran pocos estudios que midan ganancias de
aprendizaje.

## 3. Los formatos de cada lección en STIRE

| Vía | Qué trae | Desde |
|---|---|---|
| **Leer** | La explicación del docente | Siempre |
| **Ver** | El algoritmo en **diagrama de flujo**, en **pseudocódigo** y **paso a paso** (STIRE recuerda el que el estudiante prefiere); imágenes y videos insertados | v2.0.0 |
| **Escuchar** | **«Escuchar la lección»**: la explicación en voz alta, con pausar, seguir, detener y velocidad | **Nuevo** |
| **Practicar** | Ejemplos en vivo que se pueden tocar y ejercicios con el Tutor | v1 |

- **Escuchar** usa la voz del navegador (Web Speech API): no tiene costo y no envía el texto a ningún servicio.
  - Lee por frases cortas, porque Chrome corta las lecturas largas, y así también sabe por dónde va.
  - El código y las imágenes **se anuncian** («Aquí está el algoritmo: míralo como diagrama de flujo mientras escuchas»), no
    se leen símbolo por símbolo.
  - Si el navegador no tiene voz en español, el botón no aparece.
- **Arriba de cada lección**, «También en esta lección» dice qué más trae: el diagrama, imágenes, videos, el ejemplo en
  vivo y los ejercicios. Son **opciones**, no una etiqueta del estudiante.
- **No se lee en voz alta mientras el mismo texto está en pantalla, por defecto**, para respetar el principio de
  redundancia. Escuchar es una opción que cada uno activa: con los ojos cansados, en el celular, con baja visión, o para
  mirar el diagrama mientras escucha, que es el caso del principio de modalidad.

## 4. Cómo se presenta al profesor

UI-01 se cumple en su **intención**: el contenido llega en modalidad verbal (texto, voz y pseudocódigo comentado) y visual
(diagramas, imágenes y paso a paso), con el mismo rigor y los mismos objetivos. **No** se diagnostica un estilo, por la
evidencia de arriba. La adaptación existe, pero según lo que **elige** el estudiante, no según una etiqueta.

## 5. Dónde está

`frontend-nuxt/utils/escucharLeccion.ts` (con prueba), `components/EscucharLeccion.vue`, `components/AlgoritmoMultiformato.vue`,
`utils/algoritmoMultiformato.ts`. Base teórica: BT-32.

## Referencias

- Clark, J. M. y Paivio, A. (1991). Dual coding theory and education. *Educational Psychology Review, 3*(3), 149-210. https://doi.org/10.1007/BF01320076
- Kirschner, P. A. (2017). Stop propagating the learning styles myth. *Computers & Education, 106*, 166-171. https://doi.org/10.1016/j.compedu.2016.12.006
- Mayer, R. E. (2017). Using multimedia for e-learning. *Journal of Computer Assisted Learning, 33*(5), 403-423. https://doi.org/10.1111/jcal.12197
- Pashler, H., McDaniel, M., Rohrer, D. y Bjork, R. (2008). Learning Styles: Concepts and Evidence. *Psychological Science in the Public Interest, 9*(3), 105-119. https://doi.org/10.1111/j.1539-6053.2009.01038.x
- Rogowsky, B. A., Calhoun, B. M. y Tallal, P. (2015). Matching learning style to instructional method: Effects on comprehension. *Journal of Educational Psychology, 107*(1), 64-78. https://doi.org/10.1037/a0037478
