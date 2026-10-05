# Cómo está STIRE frente a las dos listas de chequeo del profesor

> **Revisión de seguimiento · 04/10/2026, noche · `main @ 6787d3e`, desplegada** (stire-soft.vercel.app y la API en Azure).
> Es la tercera aplicación de las listas el mismo día. El «antes» se hizo en la mañana y el «después» al mediodía.
> Desde el «después» entraron la organización académica, las plantillas por asignatura y los logros. Esta revisión
> comprueba que nada de eso bajó la nota y amplía la medición de 20 a 36 pantallas.
> Las listas son del Prof. Raúl Toscano: interfaz gráfica (Pressman y Maxim, 2019, caps. 12–14) y Sistemas Tutores
> Inteligentes (Caro Piñeres, 2015). Los formatos están en [`docs/curso-ddse3/guias/`](../../../curso-ddse3/guias/).

## 1. En resumen

| Lista | Antes (mañana) | Después (mediodía) | **Hoy (noche)** | Con el SUS del equipo (05/10) |
|---|---|---|---|---|
| **Interfaz gráfica** (16 ítems, 32 puntos) | 20/32 · 62,5 % · Básico con observaciones | 28/32 · 87,5 % · Aceptable / Competente | **28/32 · 87,5 % · Aceptable / Competente** | **29/32 · 90,6 % · Sobresaliente** |
| **Sistemas Tutores Inteligentes** (12 ítems, 24 puntos) | 14/24 · 58,3 % · Insuficiente | 24/24 · 100 % · Sobresaliente | **24/24 · 100 % · Sobresaliente** | 24/24 · 100 % |
| **Las dos juntas** (56 puntos) | 34/56 · 60,7 % | 52/56 · 92,9 % | **52/56 · 92,9 %** | 53/56 · 94,6 % |

Escala del profesor: C = 2 · CP = 1 · NC = 0. Las bandas son 90 % o más, Sobresaliente; 75 %, Aceptable / Competente;
60 %, Básico con observaciones; menos de 60 %, Insuficiente.

**Lo más importante:**
1. **El porcentaje no bajó**, aunque esta tarde entraron tres funciones grandes. Tampoco subió: los 4 puntos que faltan
   en la interfaz son los mismos del mediodía.
2. **Ahora la nota es más sólida.** Se midieron 36 pantallas, contra 20 en el «después». Las nuevas mostraron fallas que
   la revisión anterior no vio, y se corrigieron hoy mismo (§3).
   - **Contraste:** 12 textos en tres pantallas del docente.
   - **Etiqueta:** un campo sin etiqueta.
   - **Emoji:** uno que quedaba.
   - **Botones pequeños:** en el celular.
   - **Tutor:** el botón flotante tapaba un botón.
3. **El siguiente punto lo da el SUS**, que responden el lunes los cinco integrantes. Con él, la interfaz pasa de 87,5 % a
   90,6 % y entra en la banda **Sobresaliente**.
4. **Los dos riesgos para el martes no son de código:**
   - **La verificación del equipo está vacía:** 0 de 26 ítems marcados en [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md).
     Sin ella, todo esto sigue siendo una autoevaluación.
   - **El 100 % de Tutores Inteligentes depende de un acuerdo:** que el profesor acepte las 5 adaptaciones que cumplen
     la intención del criterio y no su ejemplo literal ([`PLAN_DE_MEJORA.md`](../PLAN_DE_MEJORA.md) §1).

## 2. Qué cambió desde el «después» y qué toca de cada lista

Entre `4d41b8d` (el «después») y `6787d3e` (hoy) entraron 15 commits. Ninguno bajó un ítem y varios refuerzan alguno:

| Lo nuevo | Qué hace | Ítem que refuerza | Por qué |
|---|---|---|---|
| **Organización académica** | La clase dice su asignatura, grupo y periodo. La barra superior sale de los datos: «Unicórdoba · Lic. en Informática — 3.er semestre». | **UX-01** (arquitectura de información), **MOD-01** (dominio) | El estudiante y el docente saben dónde están dentro de la institución, no solo dentro de la clase. |
| **Catálogo de asignaturas** | Al crear una clase, el docente busca su asignatura. Antes de crear otra, STIRE pregunta «¿Es alguna de estas?». El admin une las duplicadas. | **PAT-03** (formularios), **UX-03** (carga de memoria) | Es un combobox accesible con sugerencias: no hay que recordar el nombre exacto ni el código. Evita errores antes de que pasen. |
| **Plantillas por asignatura** | Al crear la clase se recomiendan primero las plantillas de la misma asignatura, con sus señales: cuántas veces se copió y el enfoque. El docente decide con quién comparte la suya. | **UX-02** (control del usuario), **UX-03** | El docente elige y decide; STIRE solo ordena. |
| **«Dónde enseño / Qué estudio»** | En el perfil, cada persona dice su programa y semestre. | **MOD-02** (modelo del estudiante) | El modelo del estudiante sabe en qué semestre y programa está. |
| **Logros y medallas** | Son 22 medallas en 6 categorías, con niveles bronce, plata y oro. Son privadas, no hay ranking y solo se ganan con aprendizaje real. El docente las activa o desactiva y elige las categorías. | **MOD-04** (interfaz afectiva), **META-01** (autorregulación), **UI-03** (andamiaje) | Motivan sin comparación social, que desanima a quien va atrás (Hanus y Fox, 2015). Además muestran una sola meta cercana con su avance. Diseño: [`docs/DISENO_LOGROS.md`](../../../DISENO_LOGROS.md). |

**Lo que empeoró un poco** (no cambia la nota, pero conviene saberlo):
- **PAT-04 («The Blob»):** dos páginas crecieron: `docente/index.vue`, de 772 a 827 líneas, y `docente/clase/[classId]/ajustes.vue`,
  de 361 a 495. Hoy son **27 de 110** componentes con más de 300 líneas; en el «después» eran 26 de 103.
- **PAT-01:** las páginas que llaman a la API desde la vista pasaron de 31 de 40 a **32 de 41**. La nueva es
  `admin/catalogo.vue`.

## 3. Lo que encontró esta revisión y cómo se corrigió

La revisión del «después» midió 20 pantallas. Esta midió **36**: las 20 de antes más Crear clase, Ajustes, Contenidos,
Notas, Mensajes, Perfil y Repasos del docente y del estudiante, en computador y celular. Las pantallas nuevas tenían
fallas que la revisión anterior no podía ver.

| Hallazgo | Dónde | Ítem | Corrección | Commit |
|---|---|---|---|---|
| **Contraste insuficiente:** 12 textos en total, de 3,9 a 4,4:1 (el mínimo es 4,5:1). El gris secundario `#64748b` sobre los fondos grises. | Crear clase (1), Ajustes (5) y Contenidos (6), en computador y celular | UX-07 | En esos textos va `slate-600`; «Publicado» va en `emerald-800` | `ccd80b9`, `b7cda28` |
| **Campo sin etiqueta:** la casilla «Requiere aprobación» (axe-core: `label`, crítico) | Crear clase | UX-07 | La casilla queda unida a su `<label>` | `ccd80b9` |
| **Emoji como ícono:** el sobre ✉️; también las flechas de texto ↻ ← y ○ | Mensajes (estudiante y docente), Mis clases, Contenidos | UX-04 | Íconos Lucide `Mail`, `RefreshCw` y `ArrowLeft`. La prueba automática de emojis ya reconoce estos caracteres. | `ccd80b9` |
| **Controles de menos de 44 px en el celular:** 18 a 39 px | Mis clases, Mensajes, Repasos, Perfil, Mi progreso, «¿Por qué veo esto?», Ajustes, Crear clase, «Hoy» de la clase | MOB-02, UX-06 | Ahora miden 44 px en el celular | `ccd80b9`, `b7cda28` |
| **El botón flotante del Tutor tapaba un botón:** «Ver contenido» quedaba debajo de «Tutor» y no se podía desplazar fuera | Mis clases, en el celular | MOB-02 | El contenido del estudiante deja abajo un margen del alto del botón | `6787d3e` |

Cada corrección tiene su prueba automática en
[`src/content-rendering/__tests__/listas-chequeo-seguimiento.frontend.spec.ts`](../../../../src/content-rendering/__tests__/listas-chequeo-seguimiento.frontend.spec.ts),
para que no vuelva a pasar. El build está en verde y la suite completa pasa: 148 suites, 1600 pruebas.

**Resultado medido en producción después de corregir** ([`evidencia-automatica.json`](evidencia-automatica.json)):

| Medida | En el «después» (20 pantallas) | Hoy, antes de corregir (36) | **Hoy, corregido (36)** |
|---|---|---|---|
| Problemas de axe-core WCAG 2.1 AA | 0 + 1 falso positivo | 26 (13 en computador y 13 en celular) + 1 falso positivo | **0 + 1 falso positivo** |
| Pantallas con desplazamiento horizontal | 0 | 0 | **0** |
| Emojis en pantalla | 0 | 2 (✉️) | **0** |
| Botones sin nombre accesible | 0 | 0 | **0** |
| Controles de menos de 44 px en el celular, pantallas del **estudiante** | 10 (progreso 6, clases 3, inicio 1) | 27 (30 con «Mostrar contraseña») | **0**, sin contar los de «Mostrar contraseña» (24 px), que están dentro del campo |
| Botones tapados por el botón flotante del Tutor | no se medía | 1 (se vio en la captura) | **0** |

El falso positivo es `scrollable-region-focusable` en el editor de código del celular. El área sí se recorre con el
teclado desde el propio editor (CodeMirror 6).

**Corrección honesta a la revisión del «después».** Esa revisión decía «controles de 44 px o más en todas las pantallas
del estudiante y del docente medidas en el celular». Era más de lo que mostraban sus propios datos: en
`evidencia-automatica.json` del «después» había 6 controles pequeños en Mi progreso, 3 en Mis clases y 9 en la clase
del docente. Hoy las pantallas del estudiante están en 0. En las del docente quedan dos cosas:
- **Contenidos:** 65 controles pequeños. Es el editor del curso, pensado para el computador (§4, MOB-02).
- **Enlaces de texto:** las migas y los nombres de estudiantes en las tablas.

## 4. Lista de interfaz gráfica (Pressman y Maxim, caps. 12–14), ítem por ítem

| ID | Criterio | Antes | Después | **Hoy** | Por qué | Para llegar a C |
|---|---|---|---|---|---|---|
| UX-01 | Planos de Garrett y arquitectura de información | C | C | **C** | Las migas llegan hasta el ejercicio. Ahora la barra superior también dice la institución, el programa y el semestre reales. | — |
| UX-02 | Regla de oro 1 (el usuario en control) | CP | C | **C** | Diálogo propio para confirmar y autoguardado con recuperación tras F5. El docente decide sus logros y con quién comparte su plantilla. | — |
| UX-03 | Regla de oro 2 (reducir la carga de memoria) | C | C | **C** | Las reglas siempre a la vista. El diagnóstico de la salida dice qué revisar. Al crear la clase, la asignatura se busca y no hay que recordarla. | — |
| UX-04 | Regla de oro 3 (consistencia) | CP | C | **C** | 0 emojis en las 36 pantallas: se quitó el último, el ✉️ de Mensajes. Títulos en estilo de oración. | — |
| UX-05 | Personas y análisis de tareas | CP | C | **C** | Dos Personas y el análisis de tareas (HTA) en [`PERSONAS_Y_TAREAS.md`](../../../modesec/usuarios/PERSONAS_Y_TAREAS.md). | — |
| UX-06 | Directrices de Tognazzini (Fitts, estado) | CP | C | **C** | «Probar» y «Entregar» miden 48 px en el celular. El estado se ve siempre: guardado, sin conexión, intentos. | — |
| UX-07 | Accesibilidad y WCAG 2.1 | CP | C | **C** | 0 problemas de axe-core en 36 pantallas, después de las correcciones del §3. Lighthouse Accesibilidad 100 en el inicio de sesión. | — |
| **UX-08** | Prototipado validado y métricas de usabilidad | CP | CP | **CP** | Prototipo en Figma, evaluación heurística y auditorías de calidad. **Falta el SUS**: ya está preparado en [`VERIFICACION_v2.0.0.md`](../VERIFICACION_v2.0.0.md) §5, pero nadie lo ha respondido. | Los 5 integrantes responden el SUS el 05/10 y se calcula el puntaje. **+1 punto** |
| MOB-01 | Pirámide de diseño móvil | C | C | **C** | Sin desplazamiento horizontal en las 36 pantallas, tampoco en horizontal. | — |
| MOB-02 | Ergonomía táctil y zona del pulgar | CP | C | **C** | Barra inferior de 48 px en el ejercicio. 0 controles pequeños en las pantallas del estudiante. El botón del Tutor ya no tapa nada. **Observación:** Contenidos, el editor del docente, sigue con controles pequeños en el celular; se prepara un curso desde el computador. | Para ser estrictos: llevar Contenidos a 44 px en el celular. No cambia la nota. |
| **MOB-03** | Sensibilidad al contexto | CP | CP | **CP** | El código de clase sale en mayúsculas y se formatea solo; la rotación funciona. **Sigue sin modo oscuro:** con el sistema en oscuro el fondo se mantiene en `rgb(247, 249, 252)`. | Modo oscuro con José: toca `tailwind.config.ts` y `main.css`, que son su territorio. **+1 punto** |
| MOB-04 | Resiliencia de red | CP | C | **C** | Aviso «Sin conexión», copia local del código y reintento al volver la red. | — |
| **PAT-01** | Patrones arquitectónicos (MVC / componentes) | CP | CP | **CP** | Lo nuevo sigue el patrón: lógica en utilidades puras con prueba (`utils/logros.ts`, `plantillas.ts`, `contextoAcademico.ts`, `organizarClases.ts`) y el composable `useContextoDocente`. Pero **32 de 41 páginas** todavía llaman a la API desde la vista. | Pasar las llamadas de las páginas grandes a composables por dominio. **+1 punto** |
| PAT-02 | Patrones de navegación | C | C | **C** | Menú con la opción activa, pestañas, migas y barra inferior en el celular. | — |
| PAT-03 | Patrones de entrada de datos | CP | C | **C** | Errores bajo el campo y formato asistido. Nuevo: el selector de asignatura es un combobox accesible con «¿Es alguna de estas?», que evita duplicados antes de crearlos. | — |
| **PAT-04** | Prevención de antipatrones | CP | CP | **CP** | Sin «Mystery Meat» (0 botones sin nombre) ni ventanas encimadas. Sigue «The Blob»: **27 de 110** componentes pasan de 300 líneas. Los más grandes son `admin/index.vue` (1532), `EditorDiagrama.vue` (1322) y `docente/contenidos.vue` (1131). | Dividir esos tres por secciones. **+1 punto** |

| Bloque | Antes | Después | **Hoy** |
|---|---|---|---|
| Cap. 12 · Experiencia de usuario (8 ítems) | 10/16 | 15/16 | **15/16 · 93,8 %** |
| Cap. 13 · Movilidad (4 ítems) | 5/8 | 7/8 | **7/8 · 87,5 %** |
| Cap. 14 · Patrones (4 ítems) | 5/8 | 6/8 | **6/8 · 75,0 %** |
| **Total** | 20/32 · 62,5 % | 28/32 · 87,5 % | **28/32 · 87,5 % · Aceptable / Competente** |

## 5. Lista de Sistemas Tutores Inteligentes (Caro Piñeres, 2015), ítem por ítem

| ID | Criterio | Antes | Después | **Hoy** | Por qué, y lo que agregó esta tarde |
|---|---|---|---|---|---|
| MOD-01 | Módulo del dominio en la interfaz | CP | C | **C** | Prerrequisitos visibles y bloqueo suave por módulo, que el docente configura. *Nuevo:* la clase pertenece a una asignatura real del plan de estudios (Fundamentos de Algoritmia, 203413, 3.er semestre). |
| MOD-02 | Módulo del estudiante (overlay y perfil) | CP | C | **C** | Reconoce 10 tipos de error en la salida y el modelo no se contradice. *Nuevo:* el estudiante dice qué estudia y en qué semestre («Qué estudio»), y los logros se calculan sobre su dominio real por lección. |
| MOD-03 | Módulo pedagógico (tácticas) | C | C | **C** | Analogía, pregunta socrática, ejemplo resuelto, «por pasos» y «otra explicación». |
| MOD-04 | Interfaz ergonómica y afectiva | C | C | **C** | Mensajes que orientan, no que regañan. *Nuevo:* medallas privadas, sin ranking y con la nueva celebrada una sola vez. Motivan sin comparación social (Hanus y Fox, 2015; Denny, 2013). |
| UI-01 | Adaptación multimodal | NC | C | **C** ⚑ | El algoritmo en 4 formatos que el estudiante elige; STIRE recuerda el preferido. |
| UI-02 | Navegación adaptativa | CP | C | **C** ⚑ | Libre dentro del módulo, ruta guiada y bloqueo suave entre módulos. El reto deja adelantarse. |
| UI-03 | Andamiaje proactivo | C | C | **C** | Tutor en 3 niveles que nunca da la solución. *Nuevo:* «Próxima medalla» muestra una sola meta cercana con su avance. |
| UI-04 | Curaduría dinámica de recursos | NC | C | **C** ⚑ | «¿Te sirvió esta explicación?», y el docente ve qué lecciones no sirvieron. *Nuevo:* las plantillas se recomiendan por asignatura, con señales de uso (veces copiada). El curso se mejora con el uso de otros docentes. |
| UI-05 | Replanificación ante bloqueos | C | C | **C** ⚑ | Pausa tras 3 fallos con aviso al docente, y «Resolverlo por pasos con el Tutor». |
| META-01 | Doble lazo de razonamiento | CP | C | **C** | «Mi autorregulación» con la reflexión de la semana. *Nuevo:* la medalla de **Constancia** premia estudiar 3 días por semana sin exigir semanas seguidas, lo que refuerza el hábito sin castigar una semana mala. |
| META-02 | Juicios metacognitivos | NC | C | **C** ⚑ | «¿Qué tan seguro estás?» en el primer envío, con calibración que usa el Tutor. |
| META-03 | Transparencia y agencia | C | C | **C** | «¿Por qué veo esto?» junto a «Tu siguiente paso». *Nuevo:* cada medalla dice exactamente qué hay que hacer para ganarla, y la ve solo su dueño. |

⚑ **Son las 5 adaptaciones.** Cumplen la intención del criterio, no el ejemplo literal. Por ejemplo, no se diagnostica el
estilo Felder-Silverman, porque no hay evidencia de que sirva (Pashler et al., 2008; Kirschner, 2017). Se presentan al
profesor el martes con su respaldo. Si alguna no se acepta, baja de C a CP: cada una vale 1 punto.

| Bloque | Antes | Después | **Hoy** |
|---|---|---|---|
| Los 4 módulos canónicos | 6/8 | 8/8 | **8/8** |
| Inteligencia del tutor en la interfaz | 5/10 | 10/10 | **10/10** |
| Metacognición | 3/6 | 6/6 | **6/6** |
| **Total** | 14/24 · 58,3 % | 24/24 · 100 % | **24/24 · 100 % · Sobresaliente** |

## 6. Qué falta para el 100 % y en qué orden

| # | Qué | Ítem | Puntos | Quién | Cuándo | Riesgo para el usuario |
|---|---|---|---|---|---|---|
| 1 | **Responder el SUS** (10 preguntas, 2 minutos por persona) y calcular el puntaje | UX-08 | +1 → **29/32 · 90,6 % · Sobresaliente** | José, Jorge, Julio, Pedro y Jeider | Lunes 05/10 | Ninguno: no cambia la aplicación |
| 2 | **Verificar los 26 ítems** como usuarios: ✅, ⚠️ o ❌ | Todos | Ninguno, pero sostiene los que ya hay | Los 4 integrantes | Lunes 05/10, antes de las 8:00 p. m. | Ninguno |
| 3 | **Modo oscuro** | MOB-03 | +1 → 30/32 | José, en su territorio de identidad visual | Después del martes | Medio: toca los colores de todo |
| 4 | **Llamadas a la API en composables** | PAT-01 | +1 → 31/32 | Jeider con Claude Code | Después del martes | Bajo, si se hace página por página con sus pruebas |
| 5 | **Dividir los tres componentes más grandes** | PAT-04 | +1 → **32/32 · 100 %** | Jeider con Claude Code | Después del martes | Bajo, con las mismas pruebas |

Los puntos 3 a 5 no cambian lo que ve el estudiante, salvo el modo oscuro. Por eso no conviene hacerlos con prisa antes
de la presentación: un cambio grande el lunes podría romper lo que el equipo está verificando. Se presentan como
compromiso con fecha.

## 7. Cómo se hizo

- **Código:** cada afirmación cita el archivo en `main @ 6787d3e`. Los tamaños de archivo y las llamadas a la API se
  contaron sobre el árbol de trabajo (`frontend-nuxt/pages`, `components`, `layouts`).
- **Aplicación desplegada:** el 04/10/2026, de noche, con las cuentas de prueba `@example.com` de estudiante y docente.
  - **Pantallas:** 36, en computador (1440×900) y celular (390×844).
  - **axe-core 4.10.2:** con las reglas WCAG 2.1 A y AA.
  - **Controles:** se midió el alto de cada uno, se contaron los botones sin nombre y los emojis, y se revisó el
    desplazamiento horizontal.
  - **Botón flotante:** se comprobó qué controles tapa el botón del Tutor al final de cada página.
  - **Modo oscuro:** se probó `prefers-color-scheme: dark`.
- **Sin tocar datos:** el recorrido no envió nada.
  - Bloqueó el aviso de «medallas vistas», para no gastar la celebración de medallas nuevas que el equipo verá el lunes.
  - No creó ninguna clase: el formulario «Crear clase» se abrió y se cerró sin enviarlo.
- **Evidencia:** [`evidencia-automatica.json`](evidencia-automatica.json), con la medición de cada pantalla, y [`capturas/`](capturas/):
  - `cel_est_inicio` y `cel_est_progreso`: logros en el inicio y «Mis logros».
  - `cel_est_clases`: el botón del Tutor ya no tapa «Ver contenido».
  - `cel_est_mensajes`: sin emoji.
  - `pc_doc_crear_clase`: asignatura y plantillas.
  - `pc_doc_ajustes` y `cel_doc_ajustes`: logros, plantilla y avance.
  - `pc_doc_inicio`: el docente por periodo.
- **Las revisiones anteriores** siguen en [`2026-10-04_antes/`](../2026-10-04_antes/) y [`2026-10-04_despues/`](../2026-10-04_despues/),
  con los Word del profesor llenados. Esta revisión no cambia ninguna nota, así que esos Word siguen valiendo. Se
  actualizan con el SUS y la verificación del equipo.
- **Límites:** es una autoevaluación con apoyo de Claude Code. Un ítem se considera cumplido de verdad solo con el ✅ de
  quien lo verifica en el equipo.

## Referencias

- Brooke, J. (1996). SUS: A «quick and dirty» usability scale. En P. W. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.
- Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using metacognition in Intelligent Tutoring Systems* (tesis doctoral). Universidad Nacional de Colombia, Medellín.
- Denny, P. (2013). The effect of virtual achievements on student engagement. *CHI '13*, 763–772. https://doi.org/10.1145/2470654.2470763
- Hanus, M. D. y Fox, J. (2015). Assessing the effects of gamification in the classroom. *Computers & Education, 80*, 152–161. https://doi.org/10.1016/j.compedu.2014.08.019
- Kirschner, P. A. (2017). Stop propagating the learning styles myth. *Computers & Education, 106*, 166–171.
- Pashler, H., McDaniel, M., Rohrer, D. y Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest, 9*(3), 105–119.
- Pressman, R. S. y Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9.ª ed.). McGraw-Hill.
