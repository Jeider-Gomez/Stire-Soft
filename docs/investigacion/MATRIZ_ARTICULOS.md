# 📚 Matriz de Respaldo Bibliográfico e Investigación Científica — STIRE-Soft

**Norma de la Asignatura:** `DDS3-01.pdf` — Guía de Semana 03  
**Responsable:** Jorge Cervantes (Calidad e Investigación) · **Colaboradores:** Pedro Romero, Julio Galvis, Jeider Gómez  
**Estado:** ✅ Reconstruida y cerrada (FASE CC-03) · **Última actualización:** 2026-09-03

> **Propósito:** Fundamentar las decisiones pedagógicas, arquitectónicas y de experiencia de usuario de STIRE-Soft en literatura científica real y en fuentes institucionales verificables.

---

## Criterio de verificación (corregido en FASE CC-03)

La regla de CC-02 ("sin DOI no entra") era incorrecta y quedó reemplazada por esta:

> **NINGUNA CITA ENTRA SIN UN REGISTRO ESTABLE Y COMPROBABLE**, del tipo que corresponde a su naturaleza y época:
>
> | Tipo de obra | Registro exigido |
> |---|---|
> | Obra indexada moderna | DOI resuelto en Crossref, con metadatos coincidentes |
> | Obra anterior a ~1995 | Identificador ERIC, WorldCat o catálogo del editor |
> | Libro académico | ISBN verificable (catálogo de editor / OpenLibrary / Google Books) |
> | Documento institucional | Se cita como tal, en su propia categoría — no se busca en Crossref |
> | Estándar (W3C, ISO, etc.) | URL oficial y versión exacta del organismo emisor |
>
> Una obra real sin DOI **no es** una obra fabricada. Lo único prohibido es una referencia que nadie pueda localizar, o que resuelva a una obra distinta de la citada.

---

## 🧠 EJE 1: Pedagógico y Cognitivo (6 obras verificadas)
*Foco: Aprendizaje por dominio (Mastery Learning), repetición espaciada (SM-2/práctica distribuida), assistance dilemma en tutoría inteligente.*

| # | Título | Autores y Año | Fuente | Registro verificado | Nivel de Evidencia | Decisión STIRE que fundamenta |
|---|---|---|---|---|---|---|
| 1 | *Learning for Mastery* | Bloom, B. S. (1968) | Evaluation Comment, 1(2). UCLA Center for the Study of Evaluation of Instructional Programs | ERIC [ED053419](https://eric.ed.gov/?id=ED053419) | 🟡 EVIDENCIA CONTEXTUAL | Fuente original del marco de *mastery learning* por etapas. **No** fundamenta el umbral numérico del 70% — ver decisiones sin respaldo. |
| 2 | *Optimization of repetition spacing in the practice of learning* | Woźniak, P. & Gorzelańczyk, E. (1994) | Acta Neurobiologiae Experimentalis, 54(1), 59-62 | DOI [10.55782/ane-1994-1003](https://doi.org/10.55782/ane-1994-1003) | 🟢 EVIDENCIA DIRECTA | Base matemática del algoritmo SM-2 (intervalos, factor de facilidad) en `ReviewScheduleService`. |
| 3 | *Distributed practice in verbal recall tasks: A review and quantitative synthesis* | Cepeda, N. J.; Pashler, H.; Vul, E.; Wixted, J. T.; Rohrer, D. (2006) | Psychological Bulletin, 132(3), 354-380 | DOI [10.1037/0033-2909.132.3.354](https://doi.org/10.1037/0033-2909.132.3.354) | 🟢 EVIDENCIA DIRECTA (meta-análisis) | Respalda el mecanismo del espaciado como estrategia de retención. |
| 4 | *Test-Enhanced Learning* | Roediger, H. L. & Karpicke, J. D. (2006) | Psychological Science, 17(3), 249-255 | DOI [10.1111/j.1467-9280.2006.01693.x](https://doi.org/10.1111/j.1467-9280.2006.01693.x) | 🟡 EVIDENCIA CONTEXTUAL | Respalda la práctica de recuperación (repasos activos) complementaria al espaciado. |
| 5 | *The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems* | VanLehn, K. (2011) | Educational Psychologist, 46(4), 197-221 | DOI [10.1080/00461520.2011.611369](https://doi.org/10.1080/00461520.2011.611369) | 🟢 EVIDENCIA DIRECTA | El andamiaje guiado supera a la entrega directa de respuestas; base del Tutor IA socrático. |
| 6 | *Exploring the Assistance Dilemma in Experiments with Cognitive Tutors* | Koedinger, K. R. & Aleven, V. (2007) | Educational Psychology Review, 19(3), 239-264 | DOI [10.1007/s10648-007-9049-0](https://doi.org/10.1007/s10648-007-9049-0) | 🟢 EVIDENCIA DIRECTA | *Assistance dilemma*: ayuda directa destruye aprendizaje profundo, ausencia de ayuda induce abandono. Base del `TutorContextService`. |

---

## 🏗️ EJE 2: Arquitectura de Software (6 obras verificadas)
*Búsqueda reformulada en CC-03: no se busca literatura sobre "Vue vs React" (no existe), sino sobre la CLASE de sistema que STIRE es — un sistema de evaluación automática de código con sandbox seguro.*

| # | Título | Autores y Año | Fuente | Registro verificado | Nivel de Evidencia | Decisión STIRE que fundamenta |
|---|---|---|---|---|---|---|
| 7 | *CS50 sandbox: secure execution of untrusted code* | Malan, D. J. (2013) | Proc. 44th ACM SIGCSE, 141-146 | DOI [10.1145/2445196.2445242](https://doi.org/10.1145/2445196.2445242) | 🟡 EVIDENCIA CONTEXTUAL | Precedente de sandboxing pedagógico para código de estudiantes; no describe la implementación concreta (`HardenedProcessSandboxAdapter`, ADR 06). |
| 8 | *Smart Like a Fox: How Clever Students Trick Dumb Automated Programming Assignment Assessment Systems* | Kratzke, N. (2019) | Proc. 11th CSEDU, 15-26 | DOI [10.5220/0007424800150026](https://doi.org/10.5220/0007424800150026) | 🟡 EVIDENCIA CONTEXTUAL | Cataloga vectores de evasión en jueces automáticos; justifica el aislamiento real del sandbox frente a código adversarial. |
| 9 | *Review of recent systems for automatic assessment of programming assignments* | Ihantola, P.; Ahoniemi, T.; Karavirta, V.; Seppälä, O. (2010) | Proc. 10th Koli Calling, 86-93 | DOI [10.1145/1930464.1930480](https://doi.org/10.1145/1930464.1930480) | 🟢 EVIDENCIA DIRECTA (revisión) | Caracteriza la clase de sistema "juez automático de programación" a la que pertenece STIRE; respalda la arquitectura general de evaluación automatizada. |
| 10 | *A Survey of Automated Assessment Approaches for Programming Assignments* | Ala-Mutka, K. M. (2005) | Computer Science Education, 15(2), 83-102 | DOI [10.1080/08993400500150747](https://doi.org/10.1080/08993400500150747) | 🟢 EVIDENCIA DIRECTA (revisión) | Survey fundacional del campo; respalda el desacoplamiento entre entrega, ejecución y calificación. |
| 11 | *Automatic test-based assessment of programming* | Douce, C.; Livingstone, D.; Orwell, J. (2005) | Journal on Educational Resources in Computing, 5(3), Art. 4 | DOI [10.1145/1163405.1163409](https://doi.org/10.1145/1163405.1163409) | 🟢 EVIDENCIA DIRECTA (revisión) | Respalda la evaluación por casos de prueba público/privados (`EST-V03`, `DOC-V03`). |
| 12 | *Automated Assessment in Computer Science Education: A State-of-the-Art Review* | Paiva, J. C.; Leal, J. P.; Figueira, Á. (2022) | ACM Transactions on Computing Education, 22(3), 1-40 | DOI [10.1145/3513140](https://doi.org/10.1145/3513140) | 🟢 EVIDENCIA DIRECTA (revisión sistemática) | Revisión más reciente y completa del campo; respalda la clase de sistema STIRE de punta a punta. |

**Nota:** las decisiones de stack específicas de STIRE (Vue 3/Nuxt, NestJS modular, sanitización dual RICH/PLAIN, colas de eventos `submission.graded`) **no tienen** literatura académica indexada que las respalde directamente — son ingeniería de software estándar, no fenómenos estudiados. La literatura de este eje respalda la *clase* de sistema (evaluación automática de código con sandbox), no la elección de framework. Ver sección de decisiones sin respaldo.

---

## 🎨 EJE 3: GUI, UX y Usabilidad Educativa (12 obras verificadas: 9 artículos + 3 libros académicos)

### Artículos indexados

| # | Título | Autores y Año | Fuente | Registro verificado | Nivel de Evidencia | Decisión STIRE que fundamenta |
|---|---|---|---|---|---|---|
| 13 | *The Power of Feedback* | Hattie, J. & Timperley, H. (2007) | Review of Educational Research, 77(1), 81-112 | DOI [10.3102/003465430298487](https://doi.org/10.3102/003465430298487) | 🟢 EVIDENCIA DIRECTA | Feedback formativo transparente (P02); consola `EST-V03`. |
| 14 | *Cognitive Architecture and Instructional Design* | Sweller, J.; van Merriënboer, J. J. G.; Paas, F. G. W. C. (1998) | Educational Psychology Review, 10(3), 251-296 | DOI [10.1023/A:1022193728205](https://doi.org/10.1023/A:1022193728205) | 🟢 EVIDENCIA DIRECTA (revisión) | Teoría de Carga Cognitiva (P01, P08): separación "Probar código" / "Entregar solución". |
| 15 | *The Split-Attention Effect as a Factor in the Design of Instruction* | Chandler, P. & Sweller, J. (1992) | British Journal of Educational Psychology, 62(2), 233-246 | DOI [10.1111/j.2044-8279.1992.tb01017.x](https://doi.org/10.1111/j.2044-8279.1992.tb01017.x) | 🟢 EVIDENCIA DIRECTA | Fuente original del efecto de atención dividida; Drawer no bloqueante del Tutor IA (P09). |
| 16 | *Notional Machines and Introductory Programming Education* | Sorva, J. (2013) | ACM Transactions on Computing Education, 13(2), 1-31 | DOI [10.1145/2483710.2483713](https://doi.org/10.1145/2483710.2483713) | 🟢 EVIDENCIA DIRECTA | Trazado de memoria paso a paso en `EST-V02`. |
| 17 | *A Review of Generic Program Visualization Systems for Introductory Programming Education* | Sorva, J.; Karavirta, V.; Malmi, L. (2013) | ACM Transactions on Computing Education, 13(4), 1-64 | DOI [10.1145/2490822](https://doi.org/10.1145/2490822) | 🟢 EVIDENCIA DIRECTA (revisión) | Refuerza el valor de la visualización interactiva de ejecución (Codificación Dual, P07). |
| 18 | *The Reification of Metaphor as a Design Tool* | Blackwell, A. F. (2006) | ACM Transactions on Computer-Human Interaction, 13(4), 490-530 | DOI [10.1145/1188816.1188820](https://doi.org/10.1145/1188816.1188820) | 🟡 EVIDENCIA CONTEXTUAL | Guía de Metáforas STIRE (§3.3.2, "Taller del Artesano"); HCI general, no específico de programación educativa. |
| 19 | *Compiler Error Messages Considered Unhelpful* | Becker, B. A. et al. (2019) | Proc. ITiCSE-WGR '19, 177-210 | DOI [10.1145/3344429.3372508](https://doi.org/10.1145/3344429.3372508) | 🟢 EVIDENCIA DIRECTA (revisión) | Mensajes de error explicativos con diff visual (`EST-V03`, P02). |
| 20 | *How Teachers Integrate Dashboards into Their Feedback Practices* | Knoop-van Campen, C. A. N. & Molenaar, I. (2020) | Frontline Learning Research, 8(4), 37-51 | DOI [10.14786/flr.v8i4.641](https://doi.org/10.14786/flr.v8i4.641) | 🟢 EVIDENCIA DIRECTA | Dashboard docente con alertas tempranas (`DOC-V04`). |
| 21 | *Learning Analytics Dashboard Applications* | Verbert, K.; Duval, E.; Klerkx, J.; Govaerts, S.; Santos, J. L. (2013) | American Behavioral Scientist, 57(10), 1500-1509 | DOI [10.1177/0002764213479363](https://doi.org/10.1177/0002764213479363) | 🟢 EVIDENCIA DIRECTA | Métrica de progreso acompañada de interpretación accionable (`EST-V06`). |

### Libros académicos (requisito explícito del docente — Guía de Semana 03)

| # | Título | Autor y Año | Editorial | Registro verificado | Nivel de Evidencia | Decisión STIRE que fundamenta |
|---|---|---|---|---|---|---|
| 22 | *The Elements of User Interface Design* | Mandel, T. (1997) | Wiley | ISBN [9780471162674](https://openlibrary.org/isbn/9780471162674) | 🟢 EVIDENCIA DIRECTA | Las 3 Reglas de Oro de Theo Mandel (control al usuario, reducir carga de memoria, consistencia) — citadas explícitamente por Pressman & Maxim cap. 12 y exigidas por la Guía de Semana 03. |
| 23 | *Software Engineering: A Practitioner's Approach*, 9.ª ed. | Pressman, R. S. & Maxim, B. R. (2020) | McGraw-Hill | ISBN [9781259872976](https://openlibrary.org/isbn/9781259872976) | 🟢 EVIDENCIA DIRECTA | Cap. 12 (User Experience Design): fuente directa de las 3 Reglas de Oro de Mandel; cap. 13 (WebApps): pirámide de diseño web y navegación. |
| 24 | *Software Engineering*, 10.ª ed. | Sommerville, I. (2018) | Pearson | ISBN [9789332582699](https://openlibrary.org/isbn/9789332582699) | 🟢 EVIDENCIA DIRECTA | Cap. 5.2 (Interaction Models) y cap. 8.4 (User Testing), exigidos explícitamente por la Guía de Semana 03. |

---

## 📖 Fuentes institucionales y estándares

*Capa de evidencia distinta de la literatura indexada — no se buscan en Crossref, se citan por su naturaleza propia.*

| Fuente | Tipo | Autores / Emisor y Año | Registro | Uso en STIRE |
|---|---|---|---|---|
| *Modelo Pedagógico para la Educación Virtual — MOCAVI* | Documento institucional | Giraldo Cardozo, J. C. & Muñoz Vargas, I. C. (2022). Universidad de Córdoba, Facultad de Educación y Ciencias Humanas, Depto. de Informática Educativa | Copia local: [docs/investigacion/fuentes-institucionales/2023 05 01 Modelo pedagógico Educación virtual - MOCAVI.pdf](fuentes-institucionales/2023%2005%2001%20Modelo%20pedagógico%20Educación%20virtual%20-%20MOCAVI.pdf) | Marco pedagógico institucional (Sustentabilidad, Coaprendizaje, momentos Proyección/Co-creación/Aplicación/Difusión). Reemplaza la cita fabricada "Toscano Miranda et al. (2015)" de la matriz original, que resolvía a un artículo distinto. |
| *Diseño de software educativo basado en competencias* (fuente de MODESEC §3.3.1 y §3.3.3) | Artículo indexado, citado como fuente de MODESEC | Caro, M. F.; Toscano, R. E.; Hernández, F. M.; David, M. E. (2009) | Revista de Investigaciones Universidad del Quindío, 19(1), 42-53 — [ojs.uniquindio.edu.co](https://ojs.uniquindio.edu.co/ojs/index.php/riuq/article/view/772) | Fundamenta la regla de los 3 clics y el diseño de interfaces/mapa de navegación (GUI.docx, recurso oficial de la Guía de Semana 03). |
| WCAG 2.1 | Estándar (W3C Recommendation) | W3C (2018) | [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/) — versión exacta "WCAG 2.1", W3C Recommendation 05 June 2018 | Doble codificación forma+color+texto (P06, `EST-V05`). Se cita como estándar, no como artículo — no se forzó un DOI académico (Crossref solo indexa, vía catálogo BSI, las versiones 2.0 y 2.2, no la 2.1 exacta). |
| Plan de Curso FDOC-088 / Guía de Semana 03 | Documento docente (norma de la asignatura) | Toscano Miranda, R. E. (docente titular), Universidad de Córdoba, 2026-2 | Copia local: [docs/investigacion/fuentes-institucionales/Guia_Estudiante_semana_03.docx](fuentes-institucionales/Guia_Estudiante_semana_03.docx), [GUI.docx](fuentes-institucionales/GUI.docx), [cronograma.docx](fuentes-institucionales/cronograma.docx) | Norma que exige los 15 artículos, la fundamentación en Pressman/Mandel/Sommerville y la regla de los 3 clics — ver detalle en el reporte de FASE CC-03. |

---

## 📌 Decisiones de STIRE sin respaldo en literatura

| Decisión STIRE | Literatura relacionada | Clasificación |
|---|---|---|
| Umbral numérico exacto del 70% de dominio | Bloom (1968) respalda el marco de *mastery learning* por etapas, ningún estudio fija un porcentaje específico | 🔵 **HIPÓTESIS A VALIDAR** |
| Estructura de exactamente 3 niveles de andamiaje del Tutor IA | Koedinger & Aleven (2007) respaldan el *assistance dilemma* como fenómeno, no una cantidad de niveles | 🟡 **PROPUESTA STIRE** |
| Implementación del tutor socrático mediante un LLM específico | Sin literatura peer-reviewed encontrada sobre diálogo socrático generado por LLM en este dominio; la cita original ("Chen et al., 2023") era fabricada | 🔵 **DECISIÓN STIRE** |
| Vue 3 + Nuxt, NestJS modular, sanitización dual, colas de eventos | Sin literatura académica indexada específica — la Guía de Semana 03 pide justificar "por qué Nuxt/Vue 3" explícitamente; ver **CONTRADICCIÓN** en el reporte de cierre de CC-03 | 🔵 **DECISIÓN STIRE** (ingeniería estándar) |

---

## Apéndice: Registro de Verificación

### Los 15 originales — auditados completos en CC-02/CC-03, 15 de 15 fabricados

| # eje | Cita original reclamada | DOI reclamado | Resultado |
|---|---|---|---|
| E1-1 | Anderson et al. (2020), IEEE TLT | `10.1109/TLT.2020.2987654` | ❌ 404 — no existe |
| E1-2 | Wozniak & Gorzelanczyk (2018), Computers & Education | `10.1016/j.compedu.2018.04.012` | ❌ Resuelve a Molinillo et al., obra distinta |
| E1-3 | Chen, Zhang & Kumar (2023), IJAIED | `10.1007/s40593-023-00342-1` | ❌ 404 — no existe |
| E1-4 | Sweller & Robins (2019), ACM TOCE | `10.1145/3313831` | ❌ Resuelve a las actas completas de CHI 2020 |
| E1-5 | Toscano Miranda et al. (2015), Educación y Humanismo | `10.17081/eduhum.17.29.1254` | ❌ Resuelve a Feo (2015), obra distinta en la misma revista |
| E2-6 | Vasconcelos & Silva (2021), IEEE Software | `10.1109/MS.2021.3098124` | ❌ 404 — no existe |
| E2-7 | Fagerström & Larsson (2022), J. Systems and Software | `10.1016/j.jss.2022.111452` | ❌ Resuelve a Song et al., obra distinta |
| E2-8 | Gomez-Arnedo et al. (2021), ACM SIGPLAN Notices | `10.1145/3486608.3486615` | ❌ 404 — no existe |
| E2-9 | Johansson & Berg (2020), Computers & Security | `10.1016/j.cose.2020.101893` | ❌ 404 — no existe |
| E2-10 | Miller & O'Connor (2022), IEEE Access | `10.1109/ACCESS.2022.3184512` | ❌ 404 — no existe |
| E3-11 | Blackwell & Green (2019), Human-Computer Interaction | `10.1080/07370024.2019.1623541` | ❌ 404 — no existe |
| E3-12 | Becker et al. (2021), ITiCSE | `10.1145/3430665.3446382` | ❌ 404 — no existe |
| E3-13 | Sorva & Sirkiä (2020), IEEE Trans. Education | `10.1109/TE.2020.2974512` | ❌ 404 — no existe |
| E3-14 | Molenaar & Knoop-van Campen (2021), Computers in Human Behavior | `10.1016/j.chb.2021.106894` | ❌ Resuelve a Lai & Patrick Rau, obra distinta (reconocimiento facial) |
| E3-15 | Harper & Yesilada (2020), Universal Access in the Information Society | `10.1007/s10209-020-00721-3` | ❌ 404 — no existe |

**Resultado: 15 de 15 fabricados** (11 inexistentes, 4 con DOI real de otra obra). Detectado 2026-09-03.

### Las 24 obras reconstruidas — todas verificadas contra Crossref, ERIC u OpenLibrary

Ver registros enlazados en las tablas de cada eje y en la sección de fuentes institucionales arriba. Cada una fue comprobada individualmente y contrastada manualmente contra lo escrito en este documento antes de incluirla.

### Candidatos descartados sin sustituto (no se rellena)

- **Harper & Yesilada, WCAG 2.1 como artículo académico** — reemplazado por la cita correcta como estándar W3C (ver Fuentes institucionales).
