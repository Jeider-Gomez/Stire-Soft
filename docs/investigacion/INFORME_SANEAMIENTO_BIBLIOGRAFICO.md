# 📋 Informe de Saneamiento Bibliográfico — STIRE-Soft

**Fases cubiertas:** CC-01, CC-02, CC-03, CC-3B  
**Fecha de cierre de este informe:** 2026-09-03  
**Autor del proceso:** Claude Code, bajo dirección de Jeider Gómez

---

## 1. Resumen en tres frases

`docs/investigacion/MATRIZ_ARTICULOS.md` contenía 15 artículos científicos con DOI, y los 15
resultaron fabricados. Se reconstruyó la matriz desde cero con un criterio de verificación
corregido (DOI, ERIC, ISBN, documento institucional o estándar, según el tipo de obra), llegando
a 24 obras reales verificadas una por una contra Crossref, ERIC, PubMed Central, arXiv y
OpenLibrary. El documento quedó cerrado, con la traza completa de lo fabricado conservada en su
apéndice, y con un listado adicional de 26 fuentes verificadas verificado con código HTTP.

---

## 2. El hallazgo

Los 15 artículos originales de `MATRIZ_ARTICULOS.md` (5 por eje: Pedagógico, Arquitectura, UX)
resultaron **15 de 15 fabricados**:

- **11 con DOI inexistente** (HTTP 404 al consultar `https://api.crossref.org/works/<DOI>`):
  Anderson et al. 2020, Chen et al. 2023, Vasconcelos & Silva 2021, Gomez-Arnedo et al. 2021,
  Johansson & Berg 2020, Miller & O'Connor 2022, Blackwell & Green 2019, Becker et al. 2021,
  Sorva & Sirkiä 2020, y dos más.
- **4 con DOI real que resolvía a una obra completamente distinta**: Wozniak & Gorzelanczyk
  (2018) → resolvía a Molinillo et al. sobre presencia social; Sweller & Robins (2019) → resolvía
  a las actas completas de CHI 2020; Toscano Miranda et al. (2015) → resolvía a Feo (2015), un
  artículo distinto en la misma revista; Molenaar & Knoop-van Campen (2021) → resolvía a un
  artículo sobre reconocimiento facial, sin relación alguna con educación.

**Por qué el patrón era detectable:**

1. **Sufijos de DOI correlativos y con forma de plantilla.** DOI como
   `10.1109/TLT.2020.2987654` y `10.1109/TE.2020.2974512` siguen exactamente el patrón de
   numeración de IEEE (prefijo de revista + año + número de artículo de 7 dígitos), pero con el
   número final aparentemente generado al azar — ningún artículo real de IEEE tiene esa
   secuencia. Un DOI real termina en el número de artículo asignado por el editor, no en un
   patrón redondo.
2. **Apellidos genéricos y sin coautoría verificable.** "Miller & O'Connor", "Johansson & Berg",
   "Vasconcelos & Silva" — combinaciones de apellidos comunes en inglés/portugués sin ningún
   rastro de coautoría real conjunta en el campo, un patrón típico de nombres generados por un
   modelo de lenguaje en vez de extraídos de un registro bibliográfico real.
3. **Mapeo demasiado perfecto entre artículo y decisión.** Cada uno de los 15 artículos
   "fundamentaba" exactamente una decisión de diseño de STIRE, sin matices, sin limitaciones, sin
   los desacuerdos habituales de la literatura real — un ajuste perfecto que la investigación
   científica genuina casi nunca ofrece.

---

## 3. Cómo se detectó

**Método:** verificación directa contra el registro público de cada tipo de obra:

```
curl -s "https://api.crossref.org/works/<DOI>"
```

seguido de comparación manual de título, autores, año y publicación contra lo escrito en la
matriz. Un DOI que no responde (404) o que resuelve a metadatos distintos de los citados se
clasifica como fabricado — sin excepción, sin "quizás es un error de tipeo".

**Corrección de la regla (FASE CC-03):** la regla original de CC-02 era *"sin DOI no entra"*.
Esa regla, aplicada literalmente, habría descartado obras reales solo porque son anteriores a la
era del sistema DOI (Bloom, 1968 — el sistema DOI no existía hasta 2000) o porque son libros
académicos sin DOI asignado (Mandel, 1997). La regla vigente es:

> **Ninguna cita entra sin un registro estable y comprobable**, del tipo que corresponde a su
> naturaleza y época — DOI para obra indexada moderna, identificador ERIC/WorldCat para obra
> anterior a ~1995, ISBN verificable para libro académico, cita institucional propia para
> documento institucional, URL oficial y versión exacta para un estándar.

Una obra real sin DOI no es una obra fabricada. Lo único prohibido es una referencia que nadie
pueda localizar, o que resuelva a una obra distinta de la citada.

---

## 4. La reconstrucción

**24 obras reales verificadas**, por eje:

| Eje | Obras | Nivel de evidencia predominante |
|---|---|---|
| 1 — Pedagógico y Cognitivo | 6 | 4 EVIDENCIA DIRECTA, 2 EVIDENCIA CONTEXTUAL |
| 2 — Arquitectura de Software | 6 | 4 EVIDENCIA DIRECTA (revisión), 2 EVIDENCIA CONTEXTUAL |
| 3 — GUI, UX y Usabilidad | 12 (9 artículos + 3 libros) | 10 EVIDENCIA DIRECTA, 2 EVIDENCIA CONTEXTUAL |

**Declaración explícita — Eje 2 quedó en 6, no en el mínimo esperado de "cuantas más mejor":**
la búsqueda original de CC-02 ("Vue vs React", "NestJS vs Express") no encontró literatura
académica porque **no existe** — son decisiones de ingeniería de software estándar, no fenómenos
que la investigación académica estudie. CC-03 reformuló la búsqueda hacia la *clase* de sistema
que STIRE realmente es (un sistema de evaluación automática de código con sandbox seguro), lo
que sí tiene literatura real: Ihantola et al. (2010), Ala-Mutka (2005), Douce et al. (2005) y
Paiva et al. (2022) — los 4 candidatos propuestos por el dueño del proyecto, los 4 verificados
reales. Las decisiones específicas de stack (Vue 3/Nuxt, NestJS, sanitización dual, colas de
eventos) siguen sin respaldo académico y quedan declaradas como tales en la sección 6, no
forzadas a una cita que no les corresponde.

---

## 5. Contaminación colateral

La fabricación no se quedó en la matriz — 4 citas fabricadas habían pasado a otros documentos:

| Cita fabricada | Dónde apareció | Resolución |
|---|---|---|
| Becker et al., 2021 | `MARCO_UX_PEDAGOGICO_STIRE.md`, P02 y P09 | Sustituida por Becker et al. 2019 (P02, real, sobre mensajes de error) y por Chandler & Sweller 1992 (P09, fuente original real del split-attention effect ya mencionado en el texto) |
| Chen et al., 2023 | `MARCO_UX_PEDAGOGICO_STIRE.md`, P03; y `CUADERNO_INVESTIGACION_TUTORES_Y_REPETICION_ESPACIADA.md`, §1.3 y matriz de trazabilidad | Retirada y reformulada como DECISIÓN STIRE en ambos documentos — no se encontró sustituto real sobre diálogo socrático generado por LLM en este dominio |
| Anderson et al., 2020 | `MARCO_UX_PEDAGOGICO_STIRE.md`, P10 | Retirada y reformulada como DECISIÓN STIRE; se conservó Bloom 1968 (real, no estaba contaminada) |
| Molenaar (cita imprecisa, sin año) | `CUADERNO_INVESTIGACION...md`, tabla de trazabilidad `DOC-V04` | Marcada como imprecisa pero de tema real; se referenció el trabajo real verificado (Knoop-van Campen & Molenaar, 2020) |

El cuaderno de investigación fue **auditado completo** en FASE CC-03: de sus citas propias, 4
resultaron reales (Anderson et al. 1995, VanLehn 2011, Piech et al. 2015, y el tema de Molenaar)
y 1 fabricada (Chen et al. 2023, repetida dos veces en el documento). Se marcó inline sin
reescribir el documento.

---

## 6. Decisiones sin respaldo

Siete decisiones de STIRE quedaron reclasificadas honestamente, en dos documentos:

**En `MATRIZ_ARTICULOS.md`:**
1. Umbral numérico exacto del 70% de dominio → 🔵 HIPÓTESIS A VALIDAR
2. Estructura de exactamente 3 niveles de andamiaje del Tutor IA → 🟡 PROPUESTA STIRE
3. Implementación del tutor socrático mediante un LLM específico → 🔵 DECISIÓN STIRE
4. Vue 3 + Nuxt, NestJS modular, sanitización dual, colas de eventos → 🔵 DECISIÓN STIRE

**En `MARCO_UX_PEDAGOGICO_STIRE.md` (reformulaciones inline tras retirar la cita fabricada):**
5. La implementación concreta del tutor mediante LLM restringido a preguntas guía (P03)
6. La adaptación a los 5 estados cualitativos específicos de STIRE (P10)
7. (De CC-03, sección de decisiones institucionales) Doble codificación citando "WCAG 2.1" como
   estándar en vez de como artículo académico — no se forzó un DOI que no calzaba exactamente
   con la versión 2.1.

Esto es un activo, no una debilidad: el proyecto ahora distingue explícitamente qué está probado
por literatura real, qué es una extrapolación razonable de un fenómeno real, y qué es una
decisión de producto sin pretensión de respaldo científico — algo que la matriz fabricada
original nunca permitió ver, porque simulaba tener evidencia para todo.

---

## 7. Controles instalados

Lo que impide que esto vuelva a pasar:

1. **Ninguna cita entra sin registro comprobable del tipo correspondiente a su naturaleza**
   (regla corregida, sección 3 de este informe y encabezado de `MATRIZ_ARTICULOS.md`).
2. **El apéndice de `MATRIZ_ARTICULOS.md` conserva la traza completa** de las 15 referencias
   fabricadas originales, con su DOI reclamado y el resultado exacto de la comprobación — no se
   borran, quedan como evidencia de lo ocurrido y como advertencia de patrón.
3. **Toda obra citada lleva su registro verificable enlazado** en la tabla correspondiente, más
   un listado plano de 26 URLs verificadas con código HTTP (sección `🔗 Referencias — enlaces
   directos`, FASE CC-3B) para que la verificación no dependa de que el visor de Jeider renderice
   Markdown.
4. **NotebookLM no se usa para generar ni buscar literatura nueva** — solo para consultar fuentes
   ya verificadas (regla explícita de CC-03), precisamente porque pedirle "investigación
   profunda" sin verificación posterior reproduciría el mismo fallo con otro mecanismo (visto en
   la práctica: 123 fuentes auto-importadas sin curar en el segundo cerebro, de las cuales solo
   una fracción verificó como real tras auditoría manual — ver sección 8 de
   `notebooklm_clasificacion_confiabilidad.md`).
5. **Todo hallazgo se trata como hipótesis hasta verificarlo contra el árbol real** — incluidos
   los candidatos que el propio dueño del proyecto propuso (los 4 de Eje 2 en CC-03 resultaron
   reales, pero se verificaron exactamente igual que cualquier otro, sin trato preferencial).

---

## 8. Trazabilidad

| Fase | Qué hizo | Archivos que tocó | Commit |
|---|---|---|---|
| CC-01 | Detectó 4 DOI fabricados (muestra inicial); congeló `MATRIZ_ARTICULOS.md`; marcó 3 citas sospechosas en `MARCO_UX_PEDAGOGICO_STIRE.md` | `MATRIZ_ARTICULOS.md`, `CUADERNO_INVESTIGACION_TUTORES_Y_REPETICION_ESPACIADA.md`, `MARCO_UX_PEDAGOGICO_STIRE.md` | `9e39d62` (modesec) — parte investigación incluida en `f855d09` por no haberse comiteado antes |
| CC-02 | Auditó los 15 originales completos (15/15 fabricados); encontró 17 obras reales; limpió 4 citas de `MARCO_UX_PEDAGOGICO_STIRE.md` (regla "sin DOI no entra") | `MATRIZ_ARTICULOS.md`, `MARCO_UX_PEDAGOGICO_STIRE.md` | `9e39d62` / `f855d09` |
| CC-03 | Corrigió la regla de verificación; recuperó Bloom 1968 (ERIC), Mandel/Pressman/Sommerville (ISBN); completó Eje 2 a 6 obras; agregó fuentes institucionales; auditó el cuaderno; copió 4 docs del docente; preparó siembra del segundo cerebro | `MATRIZ_ARTICULOS.md`, `CUADERNO_INVESTIGACION...md`, `docs/investigacion/fichas/`, `docs/investigacion/pdf/`, `docs/investigacion/fuentes-institucionales/`, `SIEMBRA_SEGUNDO_CEREBRO.md` | `f855d09` |
| CC-3B | Añadió listado de 26 enlaces directos verificados por HTTP; generó este informe consolidado | `MATRIZ_ARTICULOS.md`, `INFORME_SANEAMIENTO_BIBLIOGRAFICO.md` | Pendiente de este cierre (ver Parte A / Parte B abajo) |

---

## 9. Estado de las herramientas

### `notebooklm-py` (CLI de terceros, instalada y autenticada por el dueño del proyecto)

- **Se instaló:** vía `uv tool install "notebooklm-py[browser]"`, corrido por el dueño del
  proyecto en su propia terminal — nunca ejecutado por el agente (regla de no instalar software
  de terceros no vetado, sostenida durante toda la sesión pese a solicitarse repetidamente por
  distintas vías).
- **Comandos que expone:** `create`, `use`, `source add`, `source add-research` (investigación
  web automática con auto-importación, sin verificación de calidad documentada), `ask`,
  `metadata`, `auth login`/`auth check`, entre otros.
- **Qué NO puede hacer la skill original** (`~/.claude/skills/notebooklm`, automatización de
  navegador, distinta de esta CLI): crear notebooks nuevos ni subir fuentes — solo registrar,
  listar y consultar notebooks ya creados manualmente.
- **MCP `notebooklm`:** configurado (`notebooklm mcp install claude-code`) pero **nunca llegó a
  conectar** en esta sesión — quedó en `CONNECT_TIMEOUT` de forma persistente. Requiere
  reiniciar la sesión de Claude Code para reintentar la conexión.

### Segundo cerebro — estado tras la reorganización

- Notebook original: **"STIRE — Segundo Cerebro UX/Pedagogía"**
  (`c1e1d25a-6e89-43d9-b06b-8cd6ce911102`). Empezó con 14 fuentes verificadas; 4 búsquedas de
  investigación automática lo llevaron a 123; se eliminaron 26 rotas (→97) y 6 de Tier D
  fabricadas/fuera de tema (→91 fuentes vivas).
- **Reorganizado en 3 notebooks por eje**, solo con las 24 obras ya verificadas en la matriz:
  "STIRE — Pedagogía y Cognición" (6), "STIRE — Arquitectura de Software" (6), "STIRE — UX y
  Usabilidad Educativa" (12).
- **Criterio de densificación:** de las 22 fichas individuales sin abstract, se consolidaron 13
  en 3 documentos por eje (`consolidado-eje1/2/3`) para reducir fuentes pequeñas sin perder
  información — el cuaderno pasó de 24 fuentes dispersas a una estructura de PDFs + fichas ricas
  (con abstract real donde se encontró) + bundles consolidados.
- **24 obras adicionales de la investigación automática (Tier B) verificadas** en una segunda
  ronda contra Crossref/PubMed Central/ERIC/arXiv — 24 de 26 comprobadas resultaron reales (2
  sin verificar por tamaño de archivo). Detalle en `notebooklm_tier_b_verificadas.md`. Pendiente
  de subirlas a los notebooks de área.

### Siembra: tarea manual del dueño del proyecto

Queda constancia explícita: la creación de notebooks, autenticación de NotebookLM, y la subida
de fuentes al segundo cerebro **se ejecutan manualmente por Jeider Gómez**, nunca por el agente
— por la prohibición de ejecutar software de terceros no vetado, sostenida durante toda la
sesión. El agente prepara, verifica y da instrucciones exactas; el dueño del proyecto ejecuta.
