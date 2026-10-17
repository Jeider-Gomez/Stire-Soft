# Los 28 criterios de las dos listas y lo que dijo el equipo

Documento compartido del equipo con todos los criterios de las dos listas del Prof. Toscano, en un solo lugar:

- **Interfaz gráfica** (Pressman y Maxim, 2019, caps. 12, 13 y 14): 16 criterios, 32 puntos.
- **Sistemas Tutores Inteligentes** (Caro Piñeres, 2015): 12 criterios, 24 puntos.

De cada criterio dice qué pide en palabras simples, cómo estaba STIRE **antes** (04/10), la **nota del equipo** como
usuarios (revisión humana en Trello, tarjetas `S08-V-*` y `S09-V-*`), lo que se corrigió después de esa revisión y cómo
está **hoy** (17/10).

> **Escala del profesor:** C = cumple (2) · CP = cumple en parte (1) · NC = no cumple (0).
> **La nota de la evaluación automática no va aquí.** Julio todavía no entrega sus 6 criterios y no debe verla antes. La
> comparación «nota automática contra nota del equipo» la hace Jeider al consolidar (`S09-J03`), en
> [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md).

## Resumen

| Lista | Antes (04/10) | Nota del equipo | Criterios revisados |
|---|---|---|---|
| Interfaz | 20 / 32 · 62,5 % | **27 / 32 · 84,4 %** | 16 de 16 (José, Jorge y Jeider) |
| Tutores Inteligentes | 14 / 24 · 58,3 % | **10 / 12** en los 6 de Pedro | 6 de 12 (faltan los 6 de Julio) |

Lo que el equipo marcó «a medias» (CP) y ya se corrigió después: UX-01, UX-02, MOB-01, MOB-02 y UI-04. Quedan abiertos
UX-04 y MOD-02 (ver la última columna).

## 1. Interfaz gráfica (Pressman)

### Bloque 1 · Experiencia de usuario (cap. 12)

| ID | Qué pide | Antes (04/10) | Revisó | Nota del equipo | Lo que vio quien revisó | Después de la revisión | Hoy |
|---|---|---|---|---|---|---|---|
| UX-01 | Que el usuario sepa dónde está y cómo se organiza el curso | C | José (09/10) | **CP** | Las migas funcionan, pero el inicio no dice cuánto dominio falta para abrir el siguiente módulo. | El candado del módulo dice «Se abre con N % en «módulo» · llevas N %» y cada lección dice su meta (`2f602fc`, `a1c9ed6`). | Corregido |
| UX-02 | Que el usuario tenga el control (deshacer, cancelar) | CP | Jorge (14/10) | **CP** | «Antes de entregar» no se podía cancelar: tocar fuera de la ventana entregaba la respuesta. | «Volver a editar», y tocar fuera o Escape ya no entrega (`6929b1c`). | Corregido |
| UX-03 | Que no haya que memorizar (todo a la vista) | C | Jeider (09/10) | **C** | Cumple. Faltaba decir qué ejercicio ya no sube el dominio y cuánto pide el módulo siguiente. | La lección dice su meta y lo que pide el módulo (`2f602fc`); estado en `resultados-prueba/HALLAZGOS_JEIDER_S08_2026-10-07.md`. | Cumple |
| UX-04 | Consistencia (mismos nombres, estilos y botones) | CP | José (09/10) | **CP** | Términos técnicos en inglés en el panel del admin, «PSEUDOCÓDIGO» en mayúsculas y botones principales con estilos distintos. | Pendiente: va con la identidad visual de José. | **Abierto** |
| UX-05 | Personas y análisis de tareas | CP | Jeider (09/10) | **C** | Las Personas se parecen a los estudiantes y docentes de la prueba. | — | Cumple |
| UX-06 | Respuesta inmediata y estado visible | CP | José (09/10) | **C** | La entrega dice «Calificando…», el resultado y el dominio; los botones se leen bien. | — | Cumple |
| UX-07 | Accesibilidad y teclado (WCAG) | CP | Jorge (14/10) | **C** | El foco se ve siempre; todo se usa solo con Tab y Enter. | — | Cumple |
| UX-08 | Prototipo y medición de la usabilidad (SUS) | CP | Jeider (09/10) | **C** | La encuesta SUS está dentro de STIRE; falta que respondan todos. | 3 de 5 respuestas: SUS 83,3 (ver [`FALTA_PARA_V2.md`](FALTA_PARA_V2.md)). | Cumple, faltan 2 respuestas |

### Bloque 2 · Diseño para la movilidad (cap. 13)

| ID | Qué pide | Antes (04/10) | Revisó | Nota del equipo | Lo que vio quien revisó | Después de la revisión | Hoy |
|---|---|---|---|---|---|---|---|
| MOB-01 | Que se adapte al celular sin moverse de lado | C | José (09/10) | **CP** | Diagramas, pruebas de escritorio y el chat del Tutor obligaban a moverse de lado. | Un código largo ya no mueve el chat (`ebf2931`). | Corregido |
| MOB-02 | Botones al alcance del pulgar | CP | José (09/10) | **CP** | El botón del Tutor tapaba opciones y acciones del pie en pantallas bajas. | Espacio abajo para el Tutor (`17500e4`) y botón siempre en ícono en pantallas de menos de 380 px (`d0985ee`). | Corregido |
| MOB-03 | Adaptarse al contexto (tema oscuro, contraste, rotación) | CP | José (09/10) | **C** | «Apariencia» se encuentra a la primera; oscuro y alto contraste funcionan. | — | Cumple |
| MOB-04 | Seguir trabajando sin internet | CP | Jorge (14/10) | **C** | Sin red avisa sin estorbar, guarda el código y el Tutor ofrece «Reintentar». | — | Cumple |

### Bloque 3 · Diseño basado en patrones (cap. 14)

| ID | Qué pide | Antes (04/10) | Revisó | Nota del equipo | Lo que vio quien revisó | Después de la revisión | Hoy |
|---|---|---|---|---|---|---|---|
| PAT-01 | Separar la vista de los datos (componentes) | CP | Jeider (09/10) | **C** | Las páginas no llaman a la API: lo hacen los composables. | — | Cumple |
| PAT-02 | Navegación clara (menú, migas, pestañas) | C | Jorge (14/10) | **C** | Migas completas, menú con la sección activa y menú lateral en el celular. Sugiere que las migas no se corten en pantallas muy angostas. | — | Cumple |
| PAT-03 | Formularios que guían y validan | CP | Jorge (14/10) | **C** | El error sale en rojo al enviar incompleto. Sugiere pintar también el borde del campo que falta. | — | Cumple |
| PAT-04 | Evitar antipatrones (botones sin nombre, archivos gigantes) | CP | Jeider (09/10) | **C** | Pocos errores, pequeños; el código ya está dividido en componentes. | — | Cumple |

**Total de la interfaz según el equipo:** 11 criterios en C (22 puntos) y 5 en CP (5 puntos) = **27 / 32 · 84,4 %**. Con
lo corregido después de la revisión (UX-01, UX-02, MOB-01 y MOB-02), si quien lo revisó lo confirma, queda en 31 / 32;
solo UX-04 seguiría en CP.

## 2. Sistemas Tutores Inteligentes (Caro, 2015)

### Los 4 módulos

| ID | Qué pide | Antes (04/10) | Revisó | Nota del equipo | Lo que vio quien revisó | Después de la revisión | Hoy |
|---|---|---|---|---|---|---|---|
| MOD-01 | El conocimiento del curso, ordenado y con prerrequisitos | CP | Julio | *pendiente* | — | — | Falta su revisión |
| MOD-02 | Lo que STIRE sabe del estudiante (dominio, errores) | CP | Pedro (16/10) | **CP** | Hay dominio por lección, estados e historial. No hay perfil Visual/Verbal ni se separan los errores de concepto de los de escritura. | Perfil Visual/Verbal: decidido no hacerlo, los estilos de aprendizaje no tienen evidencia (Pashler y otros, 2008; Kirschner, 2017; BT-42). Errores de concepto: propuesta a Pedro de una tarjeta en «Hoy» del docente (`S09-J08`). | **Abierto**, espera ideas de Pedro |
| MOD-03 | Cómo enseña el Tutor (tácticas, planes) | C | Julio | *pendiente* | — | — | Falta su revisión |
| MOD-04 | Que la interfaz hable con amabilidad y oriente | C | Pedro (16/10) | **C** | Mensajes que orientan sin regañar; el Tutor usa analogías y preguntas. | — | Cumple |

### La inteligencia del tutor en la interfaz

| ID | Qué pide | Antes (04/10) | Revisó | Nota del equipo | Lo que vio quien revisó | Después de la revisión | Hoy |
|---|---|---|---|---|---|---|---|
| UI-01 | La lección en varias formas (texto, diagrama, paso a paso) | NC | Julio | *pendiente* | — | — | Falta su revisión |
| UI-02 | Elegir entre ir paso a paso o navegar libre | CP | Julio | *pendiente* | — | — | Falta su revisión |
| UI-03 | Ayuda que aparece cuando se necesita, sin dar la respuesta | C | Julio | *pendiente* | — | — | Falta su revisión |
| UI-04 | Valorar la lección y alternativas si un recurso falla | NC | Pedro (16/10) | **CP** | «¿Te sirvió?» y «explícalo de otra forma» funcionan. No se probó qué pasa si un recurso falla ni si un «No» ofrece otro recurso. | «No me quedó claro» ofrece las otras formas de la lección (`907c4d6`); un video caído dice qué hacer (`a986ee5`) y avisa al docente (`784afed`, `c3a0147`). | Corregido |
| UI-05 | Cambiar el plan cuando el estudiante se atasca | C | Julio | *pendiente* | — | — | Falta su revisión |

### Metacognición

| ID | Qué pide | Antes (04/10) | Revisó | Nota del equipo | Lo que vio quien revisó | Después de la revisión | Hoy |
|---|---|---|---|---|---|---|---|
| META-01 | Separar «resolver» de «pensar en cómo estudio» | CP | Pedro (16/10) | **C** | «Mi progreso» tiene «Mi autorregulación» y explica cómo el resultado mueve los repasos. | — | Cumple |
| META-02 | Preguntar qué tan seguro está y compararlo con el resultado | NC | Pedro (16/10) | **C** | Pregunta la confianza antes de entregar y dice «Estabas seguro y no acertaste». | — | Cumple |
| META-03 | Explicar por qué recomienda algo y dejar elegir | C | Pedro (16/10) | **C** | «¿Por qué veo esto?» explica las reglas; se puede elegir otra lección. | — | Cumple |

**Tutores Inteligentes según el equipo:** 4 en C y 2 en CP en los criterios de Pedro = **10 / 12**. Los 6 de Julio
(MOD-01, MOD-03, UI-01, UI-02, UI-03, UI-05) faltan para el total sobre 24.

## 3. Dónde está cada revisión

| Quién | Lista | Criterios | Tarjeta |
|---|---|---|---|
| José | Interfaz | UX-01, UX-04, UX-06, MOB-01, MOB-02, MOB-03 | [`S08-V-JOSE`](https://trello.com/c/6fL5GOVO) |
| Jorge | Interfaz | UX-02, UX-07, MOB-04, PAT-02, PAT-03 | [`S09-V-JORGE`](https://trello.com/c/51pn0RBy) |
| Jeider | Interfaz | UX-03, UX-05, UX-08, PAT-01, PAT-04 | [`S08-V-JEIDER`](https://trello.com/c/IRWFeW8K) |
| Pedro | Tutores Inteligentes | MOD-02, MOD-04, UI-04, META-01, META-02, META-03 | [`S09-V-PEDRO`](https://trello.com/c/kDMivXDw) |
| Julio | Tutores Inteligentes | MOD-01, MOD-03, UI-01, UI-02, UI-03, UI-05 | [`S09-V-JULIO`](https://trello.com/c/98oTw69c) · *sin entregar* |

Las capturas que adjuntó cada uno están en su tarjeta.
