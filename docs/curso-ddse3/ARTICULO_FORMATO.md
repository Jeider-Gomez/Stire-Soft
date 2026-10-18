# Artículo científico del curso: formato IMRyD y APA 7

La Unidad 3 del plan de curso (FDOC-088, `guias/FDOC-088_Plan_de_Curso_DDSE3_2026-2.pdf`) es la **divulgación**: un
artículo científico sobre STIRE, en formato **IMRyD** y con **normas APA 7**. Este documento reúne de dónde sale el
formato y el esqueleto del artículo con el material que ya tenemos.

## 1. Qué pide el plan de curso

- **Estructura:** introducción, metodología, resultados, discusión, conclusiones y referencias.
- **Redacción:** clara, precisa, concisa, objetiva y con lenguaje académico. Normas APA 7: formato, citas y
  referencias.
- **Ética:** plagio, autoría y conflicto de intereses. El uso de asistentes de IA para buscar bibliografía,
  estructurar el manuscrito y revisar la redacción debe ser ético.
- **Evidencias con rúbrica:**

  | Evidencia | Qué se entrega |
  |---|---|
  | U3-E1 | **Esquema** del artículo, **incluyendo la documentación del software educativo** |
  | U3-E2 | Primer avance de la escritura |
  | U3-E3 | Segundo avance |
  | Cierre | Presentarlo en clase, como en un congreso |

## 2. De dónde se saca el formato

| Fuente | Qué da | Dónde |
|---|---|---|
| **APA 7 (oficial)** | Plantillas Word de trabajo de estudiante, entre ellas una de estudio cuantitativo, y las reglas de citas y referencias | https://apastyle.apa.org/style-grammar-guidelines/paper-format/sample-papers |
| **Acta Scientiæ Informaticæ** (revista de Informática de la Universidad de Córdoba; el plan cita dos artículos suyos) | Pautas para «artículo de trabajo de investigación» | https://revistas.unicordoba.edu.co/index.php/asinf/about/submissions |
| **Guía del Estudiante, Semana 03** | Cómo van las figuras de la interfaz: figura compuesta (a), (b), (c) con su texto | `guias/Guia_Estudiante_Semana_03.docx` §3 · ya hecho en `semana-03/SECCION_GUI_ARTICULO.md` |

### Pautas de Acta Scientiæ Informaticæ (leídas el 18/10/2026)

- Máximo **6 páginas**, Times New Roman 12, interlineado sencillo.
- **Resumen** de máximo 200 palabras, **abstract en cursiva** y palabras clave.
- **Apartados:**
  - **Introducción:** problema, objetivos, justificación y estado de la investigación.
  - **Materiales y métodos:** diseño metodológico, herramientas, etapas, y delimitación en el tiempo y el espacio.
  - **Resultados:** responden a los objetivos.
  - **Conclusiones.**
  - **Referentes.**
- Títulos numerados con números arábigos, en negrita.
- **Referencias numeradas entre corchetes, [1]**. Mínimo 8, mínimo 2 en inglés y, si se puede, 1 de las bases de
  datos de la Universidad.
- Figuras y tablas en su lugar dentro del texto, no al final. Envío en Word.
- La página dice «seguir el formato del archivo de ejemplo», pero no tiene enlace a ese archivo.

**Ojo, hay un choque:** el plan pide APA 7 (autor y año: «Woźniak y Gorzelańczyk, 1994»), y la revista usa números
entre corchetes. **Mientras el profesor no diga otra cosa, se escribe en APA 7**, porque es lo que evalúa la rúbrica.
Pasar a [1] después es mecánico.

## 3. Preguntas para el profesor

1. ¿Las citas van en APA 7 o en el formato numérico de Acta Scientiæ Informaticæ?
2. ¿Hay plantilla (el «archivo de ejemplo»)? ¿Cuántas páginas?
3. ¿El manual de usuario es una entrega aparte o es «la documentación del software» del esquema (U3-E1)?
4. ¿Fechas de E1, E2 y E3?

## 4. Esqueleto IMRyD de STIRE y con qué se llena

| Sección | Qué va | Material que ya existe |
|---|---|---|
| **Título, resumen y abstract** | STIRE: un sistema tutor inteligente con repetición espaciada para Fundamentos de Algoritmia | — |
| **1. Introducción** | El problema (pérdida en Algoritmia, olvido de lo aprendido), los objetivos y el estado del arte | `semana-03/15_ARTICULOS_CIENTIFICOS.md` (15 con DOI) · `investigacion/BASE_TEORICA.md` |
| **2. Metodología** | MODESEC (Caro et al., 2009), Scrum, el desarrollo por iteraciones, y cómo se evaluó: dos listas de chequeo y la encuesta SUS | `modesec/` · `calidad/listas-chequeo/` · `DISENO_ENCUESTA_USABILIDAD.md` |
| **2.x Documentación del software** (lo que pide U3-E1) | Arquitectura (Nuxt 3 + Pinia, NestJS, MariaDB, despliegue), los cuatro módulos del tutor, el Tutor con IA, la repetición espaciada (SM-2) y el manual de usuario resumido | `DISENO_ARQUITECTURA_FRONTEND.md` · `DESPLIEGUE.md` · `investigacion/REVISION_DOSSIER_REPETICION_ESPACIADA.md` · el manual |
| **3. Resultados** | Las listas de chequeo antes y después; el SUS; la prueba con estudiantes (Reto 5); la Figura 2 de la interfaz | `calidad/listas-chequeo/` · `semana-03/SECCION_GUI_ARTICULO.md` |
| **4. Discusión** | Qué se logró frente a otros tutores y plataformas, y los límites (pocos usuarios, un semestre) | `investigacion/REFERENTES_PLATAFORMAS_Y_STI.md` |
| **5. Conclusiones** | Balance y trabajo futuro | — |
| **Referencias (APA 7)** | Solo obras verificadas (DOI o registro comprobado) | Matriz de artículos |

**Regla del proyecto:** ninguna referencia entra sin comprobar la obra, y si la cita es textual, la página. Lo que
no se pudo verificar del dossier de repetición espaciada está en
`investigacion/REVISION_DOSSIER_REPETICION_ESPACIADA.md` §5.
