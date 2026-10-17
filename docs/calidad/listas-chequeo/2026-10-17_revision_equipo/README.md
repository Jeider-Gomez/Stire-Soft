# Las dos listas del profesor, según el equipo · 17/10/2026

Revisión **humana** de las dos listas de chequeo del Prof. Toscano: cada integrante evaluó como usuario sus criterios,
sin ver la nota de la evaluación automática. Lo que salió «a medias» se corrigió y quien lo revisó confirmó el 17/10 que
ya se cumple. Es el documento compartido para el pitch y para la entrega.

- **Word del profesor llenado:** [`CHECKLIST_INTERFAZ_2026-10-17_EQUIPO.docx`](CHECKLIST_INTERFAZ_2026-10-17_EQUIPO.docx) y
  [`CHECKLIST_ITS_2026-10-17_EQUIPO.docx`](CHECKLIST_ITS_2026-10-17_EQUIPO.docx).
- **Comparación con la evaluación automática:** [`../VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md) §7.
- **Cómo estaba antes y los dos enlaces (antes y hoy):** [`../analisis/ANTES_DE_LAS_LISTAS.md`](../analisis/ANTES_DE_LAS_LISTAS.md).

## Resumen

| Lista | Antes (04/10) | Equipo, primera revisión | **Equipo, final (17/10)** |
|---|---|---|---|
| Interfaz (Pressman) | 20 / 32 · 62,5 % | 27 / 32 · 84,4 % | **32 / 32 · 100,0 % · Sobresaliente** |
| Sistemas Tutores Inteligentes (Caro) | 14 / 24 · 58,3 % | 20 / 24 · 83,3 % | **24 / 24 · 100,0 % · Sobresaliente** |

**SUS del equipo:** 81,5 con 5 respuestas (bueno). MOD-02 se completó el 17/10 con el perfil de aprendizaje; falta que Pedro lo
confirme como usuario, igual que los demás confirmaron sus correcciones.

## Interfaz gráfica (Pressman y Maxim, caps. 12, 13 y 14)

| ID | Revisó | Nota inicial | Nota final | Lo que vio | Qué se hizo |
|---|---|---|---|---|---|
| UX-01 | José | CP | **C** | Las migas funcionan, pero no decía cuánto dominio faltaba para abrir el siguiente módulo. | Candado del módulo con «Se abre con N % · llevas N %» y meta de cada lección. |
| UX-02 | Jorge | CP | **C** | «Antes de entregar» no se podía cancelar: tocar fuera entregaba la respuesta. | «Volver a editar» en la ventana; tocar fuera o Escape ya no entrega. |
| UX-03 | Jeider | C | **C** | La app muestra lo que se necesita; faltaba decir qué ejercicio ya no sube el dominio y cuánto pide el módulo siguiente. | Aviso «Este ejercicio ya no sube tu dominio» y meta de la lección. |
| UX-04 | José | CP | **C** | Marcó términos técnicos en inglés en el panel del administrador; el 17/10 José corrigió su nota: son términos propios de la administración del servidor, no de lo que usan estudiantes y docentes. | De todas formas, el estado del sistema quedó en español claro. |
| UX-05 | Jeider | C | **C** | Las Personas y las tareas se parecen a los estudiantes y docentes de la prueba. | — |
| UX-06 | José | C | **C** | La entrega dice «Calificando…», el resultado y el dominio; los botones se leen bien. | — |
| UX-07 | Jorge | C | **C** | El foco se ve siempre y todo se usa solo con Tab y Enter. | — |
| UX-08 | Jeider | C | **C** | La encuesta SUS está dentro de STIRE y se calcula sola. | SUS del equipo: 81,5 con 5 respuestas (bueno). |
| MOB-01 | José | CP | **C** | Diagramas, pruebas de escritorio y el chat del Tutor obligaban a moverse de lado en el celular. | Un código largo ya no mueve el chat de lado. |
| MOB-02 | José | CP | **C** | El botón del Tutor tapaba opciones y acciones del pie en pantallas bajas. | Espacio abajo para el Tutor y botón en ícono en pantallas de menos de 380 px. |
| MOB-03 | José | C | **C** | «Apariencia» se encuentra a la primera; oscuro y alto contraste funcionan. | — |
| MOB-04 | Jorge | C | **C** | Sin red avisa sin estorbar, guarda el código y el Tutor ofrece «Reintentar». | — |
| PAT-01 | Jeider | C | **C** | Las páginas no llaman a la API: lo hacen los composables. | — |
| PAT-02 | Jorge | C | **C** | Migas completas, menú con la sección activa y menú lateral en el celular. | Plan del curso compacto en la barra lateral, con un solo scroll. |
| PAT-03 | Jorge | C | **C** | El error sale en rojo al enviar incompleto; sugirió pintar también el borde del campo que falta. | El campo que falta se marca en rojo. |
| PAT-04 | Jeider | C | **C** | Pocos errores, pequeños; el código ya está dividido en componentes. | — |

## Sistemas Tutores Inteligentes (Caro, 2015)

| ID | Revisó | Nota inicial | Nota final | Lo que vio | Qué se hizo |
|---|---|---|---|---|---|
| MOD-01 | Jeider | C | **C** | Ordenado por módulos; cada lección con su meta; el candado dice cuánto falta; al entregar dice qué caso falla. | Plan del curso compacto y «Mi progreso» con las lecciones sin empezar. |
| MOD-02 | Pedro | CP | **C** | Dominio por lección e historial, pero sin perfil Visual/Verbal ni separación de errores de concepto y de escritura. | Tarjeta «Mi perfil de aprendizaje» (17/10) para el estudiante y su docente: temario dominado en verde, ámbar y gris; errores de concepto que se repiten, aparte de los descuidos de escritura; y cómo estudia (visual o verbal, secuencial o global), descriptivo y sin encasillar (BT-45). Pedro lo confirma como usuario. |
| MOD-03 | Jeider | C | **C** | El Tutor guía con preguntas; recomienda según el dominio o deja elegir; el reto sube de nivel. | Resultado de la entrega más breve y claro. |
| MOD-04 | Pedro | C | **C** | Mensajes que orientan sin regañar; el Tutor usa analogías y preguntas. | — |
| UI-01 | Jeider | CP | **C** | Los formatos funcionan, pero «No me quedó claro» ofrecía lo que ya estaba en la lección. | Caminos distintos: ejercicio sencillo, lección anterior, otro video, el docente y el Tutor. |
| UI-02 | Jeider | C | **C** | «Tu siguiente paso» guía y el plan deja abrir cualquier lección de un módulo abierto. | — |
| UI-03 | Jeider | C | **C** | El Tutor se ofrece al fallar un caso, la ayuda sube de nivel y no da la solución. | — |
| UI-04 | Pedro | CP | **C** | «¿Te sirvió?» y otra explicación funcionan; no se pudo comprobar qué pasa si un recurso falla. | Video caído con alternativas y aviso al docente para cambiar el recurso. |
| UI-05 | Jeider | CP | **C** | Cambia de táctica a los 3 fallos, pero faltaba un acompañamiento de verdad. | Modo acompañado del Tutor, con escuchar las respuestas y dictar la pregunta. |
| META-01 | Pedro | C | **C** | «Mi progreso» tiene «Mi autorregulación» y explica cómo el resultado mueve los repasos. | — |
| META-02 | Pedro | C | **C** | Pregunta la confianza antes de entregar y dice «Estabas seguro y no acertaste». | — |
| META-03 | Pedro | C | **C** | «¿Por qué veo esto?» explica las reglas y deja elegir otra lección. | — |

## Método

cada integrante evaluó como usuario sus criterios en la aplicación desplegada, en computador y en celular, sin ver la nota de la evaluación automática; dejó su nota, el porqué, dónde lo vio y un referente en su tarjeta de Trello (S08-V-* y S09-V-*). Lo que salió «a medias» se corrigió y quien lo revisó confirmó el 17/10 que ya se cumple. La comparación con la evaluación automática está en VERIFICACION_v2.0.0.md §7.
