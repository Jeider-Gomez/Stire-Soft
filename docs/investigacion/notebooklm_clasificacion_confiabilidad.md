# Clasificación de confiabilidad — 97 fuentes vivas en "STIRE — Segundo Cerebro UX/Pedagogía"

**Fecha:** 2026-09-03
**Alcance:** Las 97 fuentes que quedaron tras eliminar las 26 rotas (ver `notebooklm_fuentes_sin_verificar.json`).
**Criterio:** Igual espíritu que `MATRIZ_ARTICULOS.md` — esto es una hipótesis de clasificación por dominio/tipo de fuente,
**no un reemplazo de la verificación real** (DOI en Crossref, ISBN, ERIC, etc.). Ninguna de las fuentes Tier B de aquí
debe citarse en STIRE sin pasar el mismo proceso de verificación que ya se aplicó a las 24 obras de la matriz.

Niveles:
- **Tier A** — Ya verificadas (están en `MATRIZ_ARTICULOS.md`) o son fuente primaria oficial del propio autor/proyecto.
- **Tier B** — Parecen confiables por dominio (journal indexado, arXiv, repositorio institucional, .gov, documentación
  oficial de producto/algoritmo) pero **no están verificadas** — candidatas a pasar por el proceso de verificación.
- **Tier C** — Blog corporativo/agencia, contenido SEO, foro, o sitio de marketing. Útil como contexto de industria,
  **no citable** como respaldo académico en STIRE.
- **Tier D** — Fuera de tema, editorial cuestionable/depredadora, o duplicado. Candidatas a eliminar.

---

## Tier A — Ya verificadas o fuente primaria oficial (16)

Las 14 originales (fichas + PDFs + consolidados) ya están en `MATRIZ_ARTICULOS.md`, verificadas contra
Crossref/ERIC/OpenLibrary. Se listan solo por completitud del notebook:

| Título | Tipo |
|---|---|
| 02-wozniak-1994.md, 04-roediger-2006.md, 11-douce-2005.md, 12-paiva-2022.md, 15-chandler-1992.md, 16-sorva-2013a.md, 17-sorva-2013b.md, 18-blackwell-2006.md, 21-verbert-2013.md | Fichas verificadas (MATRIZ) |
| consolidado-eje1-pedagogico.md, consolidado-eje2-arquitectura.md, consolidado-eje3-ux.md | Notas propias del equipo |
| hattie2007.pdf, knoopvancampen2020.pdf | PDFs verificados (MATRIZ #13, #20) |

Dos fuentes nuevas que, aunque no verificadas formalmente, son **fuente primaria del propio autor del algoritmo**
y merecen tratamiento distinto a un blog cualquiera:

| Título | URL | Por qué es Tier A |
|---|---|---|
| SuperMemo 2: Algorithm — Super Memory | https://super-memory.com/english/ol/sm2.htm | Sitio oficial de Piotr Woźniak (mismo autor de la ficha 02 ya verificada), explicación directa del algoritmo SM-2 |
| Teaching Every Student... — Institute of Education Sciences | https://ies.ed.gov/use-work/awards/teaching-every-student-using-intelligent-tutoring-and-universal-design-customize-mathematics | Instituto federal de EE. UU. (IES/US Dept. of Education) — fuente institucional directa |

---

## Tier B — Parecen confiables, PENDIENTES de verificación real (37)

Journals indexados, arXiv, repositorios universitarios, actas de conferencia y documentación oficial de producto/algoritmo.

### Journals/PMC/revisión por pares (candidatas fuertes a pasar a MATRIZ tras verificar DOI)
| Título | URL |
|---|---|
| A Natural Language ITS for Training Pathologists | pmc.ncbi.nlm.nih.gov/articles/PMC2753375/ |
| A Service Based Adaptive U-Learning System Using UX | pmc.ncbi.nlm.nih.gov/articles/PMC4134810/ |
| AI-powered adaptive learning interfaces (Frontiers) | frontiersin.org/.../fcomp.2025.1672081/full |
| Challenging Cognitive Load Theory (PMC) | pmc.ncbi.nlm.nih.gov/articles/PMC11852728/ |
| Factors Affecting Feeling-of-knowing... (PMC) | pmc.ncbi.nlm.nih.gov/articles/PMC2815142/ |
| Fading distributed scaffolds (PMC) | pmc.ncbi.nlm.nih.gov/articles/PMC6519686/ |
| Negotiated learner modelling (PMC) | pmc.ncbi.nlm.nih.gov/articles/PMC6302918/ |
| "Because I'm Bad at the Game!" self-regulated learning (PMC) | pmc.ncbi.nlm.nih.gov/articles/PMC8675904/ |
| Full article: OLM tool case study (Taylor & Francis) | tandfonline.com/.../23752696.2023.2237331 |
| Full article: The UX-UI continuum (Taylor & Francis) | tandfonline.com/.../2331186X.2025.2536531 |
| Open learner models... meta-synthesis (Frontiers) | frontiersin.org/.../feduc.2025.1760183/full |
| Frequency of ITS use and learning gains (Frontiers) | frontiersin.org/.../feduc.2025.1738655/full |
| Gamified AI-supported digital learning (Frontiers) | frontiersin.org/.../feduc.2026.1754080/full |
| Ontology-Based Layered Hybrid AI Knowledge Model (MDPI) | mdpi.com/2227-7390/14/5/808 |
| Journal of Visual Language and Computing (KSI Research) | ksiresearch.org/jvlc/journal/JVLC2019N2.pdf |
| Vol4No1_2022 — Intl. Journal on e-Learning and HE (UiTM) | journalined.uitm.edu.my/images/Vol41/Vol4No1_2022.pdf |
| Does Immediate Feedback While Doing Homework Improve Learning? (ERIC) | files.eric.ed.gov/fulltext/ED615325.pdf |

### arXiv (preprints — legítimos pero NO revisados por pares; verificar si hay venue final)
| Título | URL |
|---|---|
| A Comprehensive Review of AI-based ITS: Applications and Challenges | arxiv.org/html/2507.18882v1 *(+ duplicado en /pdf/, ver Tier D)* |
| A New Intelligent Tutoring Framework (Hierarchical Task Networks) | arxiv.org/html/2405.14716v2 |
| Adaptive Scaffolding for Cognitive Engagement in an ITS | arxiv.org/html/2602.07308v1 |
| An LLM-Guided Tutoring System for Social Skills Training | arxiv.org/html/2501.09870v1 |
| Brief but Impactful: Human Tutoring Interactions | arxiv.org/html/2601.09994v1 |
| Classroom Simulacra: Contextual Student Generative Agents | arxiv.org/html/2502.02780v1 |
| Less Is More: On-Device SLM Integration | arxiv.org/html/2604.24636v1 |
| StudentSim: Training LLM-based Student Simulators | arxiv.org/html/2609.01591 |
| Towards Educator-Driven Tutor Authoring | arxiv.org/html/2405.14713v1 |

### Actas de conferencia / repositorios institucionales
| Título | URL |
|---|---|
| Co-Designing a Real-Time Classroom Orchestration Tool (J. Learning Analytics) | learning-analytics.info/.../6336/7175/30946 |
| Designing DARTS (actas IACIS) | iacis.org/iis/2025/4_iis_2025_92-101.pdf |
| Designing OLMs for Reflection... (CEUR-WS, indexado DBLP) | ceur-ws.org/Vol-1009/0307.pdf |
| Targeting Design-Loop Adaptivity (actas EDM) | educationaldatamining.org/.../EDM21_paper_140.pdf |
| Enhancing learning by OLM driven data design (U. Tech. Sydney, repositorio) | opus.lib.uts.edu.au/.../main.pdf |
| University of Birmingham — OLM and Visual Learning Analytics (AIED, repositorio) | pure-oai.bham.ac.uk/.../AIED15_VLA_OLM_final.pdf |
| Evaluating Gaming Detector Model Robustness (Ryan Baker / UPenn LA group) | learninganalytics.upenn.edu/ryanbaker/... |
| Effective Personalized AI Tutors via LLM-Guided RL (Hamsa Bastani, Wharton) | hamsabastani.github.io/llmRL_doe.pdf |
| Comparative Effectiveness of Carnegie Learning's Cognitive Tutor (Empirical Education, informe independiente) | empiricaleducation.com/pdfs/CT2fr.pdf |
| Mastery Grids Interface (U. Pittsburgh PAWS Lab, página oficial del proyecto) | adapt2.sis.pitt.edu/wiki/Mastery_Grids_Interface |

### Documentación oficial de algoritmo/producto (fuente primaria técnica, no académica)
| Título | URL |
|---|---|
| What spaced repetition algorithm does Anki use? (documentación oficial Anki) | faqs.ankiweb.net/what-spaced-repetition-algorithm |
| Forgotten spaced repetition prompts... (notas de investigación de Andy Matuschak) | notes.andymatuschak.org/zWCjuY1mFfjVkj5D58Mpte8 |

---

## Tier C — Blog/marketing/SEO, no citable académicamente (38)

Útiles solo como referencia de "qué hace la industria", nunca como respaldo científico en STIRE.

| Título | URL |
|---|---|
| 25 Best UX Design Examples (Riseup Labs) | riseuplabs.com/ux-design-examples/ |
| A Comprehensive Review of AI-Based ITS (Coschool, blog de producto) | coschool.ai/feeds/blog/intelligent-tutoring-systems |
| AI Tutor and Adaptive Learning 2026 Playbook (Fora Soft, agencia) | forasoft.com/blog/article/ai-tutors-adaptive-learning-2026 |
| AI in Education: Rise of ITS (Park University, blog institucional informal) | park.edu/blog/... |
| AI in eLearning Guide (AppZoro, agencia) | appzoro.com/blog/use-of-ai-in-elearning |
| Adaptive Learning Is Not Personalisation (blog personal) | m4no5.com/insights/... |
| Agentic AI Comparison: Khanmigo vs Voyagier (directorio de marketing) | aiagentstore.ai/compare-ai-agents/... |
| Best SM-2 Algorithm Apps (VerbPal, blog) | verbpal.com/blog/... |
| Best Spaced Repetition App 2026 (Flashcard Maker, blog) | flashcard-maker.cc/blog/... |
| Carnegie Learning Pricing & Reviews (Techjockey, directorio SaaS) | techjockey.com/detail/carnegie-learning |
| Designing AI That Teaches Without Replacing Thinking (blog) | infinitestair.com/... |
| FOR GRADES 6–12 (folleto comercial MATHia, Neuron Learning) | neuronlearning.com/.../MATHia-Brochure.pdf |
| FSRS for Anki vs SM-2 (MemoForge, blog de producto) | memoforge.app/blog/... |
| How AI transforms EdTech 2026 (Meduzzen, agencia) | meduzzen.com/blog/... |
| How Generative AI Is Changing... (eLearning Industry, agregador) | elearningindustry.com/... |
| How To Develop a Khanmigo-like AI Tutoring Platform (Idea Usher, agencia) | ideausher.com/blog/... |
| How to Use Spaced Repetition for Studying (StudyCards AI, blog) | studycardsai.com/blog/spaced-repetition-for-studying |
| Spaced Repetition for ADHD (StudyCards AI, blog) | studycardsai.com/blog/spaced-repetition-for-adhd |
| Intelligent tutoring system (Wikipedia — terciaria, no citable) | en.wikipedia.org/wiki/... |
| Khanmigo vs. Read Along vs. Kubrio (SwaVid, blog) | swavid.com/blogs/... |
| Lessons from Andy Matuschak (blog personal de tercero) | antoinebuteau.com/... |
| Master the Aleks Math Placement Test (SEO/marketing educativo) | education1.com.br/... |
| Modelling, Fading, and Scaffolding (Insendi, blog corporativo) | insights.insendi.com/... |
| Spaced Repetition Algorithms: SM-2 to FSRS (Mindomax, blog) | mindomax.com/... |
| Spaced Repetition App comparison (CuFlow AI, blog) | cuflow.ai/blog/... |
| Spaced Repetition Explained (Hello Nabu, blog) | hellonabu.com/blog/... |
| Spaced Repetition Schedule (Yu-Kai Chou, consultor — autopublicado) | yukaichou.com/... |
| Spacing Effect in UX Design (UI Coach, blog) | uicoach.io/ux-laws/spacing-effect |
| Spacing Effect: Learn the Disturbed Practice (Octet Design, agencia) | octet.design/journal/spacing-effect/ |
| The SM-2 Algorithm Explained (Gnoseed, blog) | gnoseed.com/algorithms/sm2 |
| The Anki SM-2 Algorithm (RemNote, doc de producto/marketing) | help.remnote.com/... |
| UX design mistakes: 14 costly errors (Eleken, agencia) | eleken.co/blog-posts/ux-design-mistakes |
| What Research Says About Tutorial-Based Learning (SEO) | tutorialauthority.com/... |
| how spaced repetition actually works (DEV Community, blog comunitario) | dev.to/umangsinha12/... |
| GitHub - thyagoluciano/sm2 (repo de código, no es fuente académica) | github.com/thyagoluciano/sm2 |
| WI-LUX: What If Learning UX — **ver alerta Tier D** | primerascientific.com/... |

*(37 filas arriba + WI-LUX movido a D = 38 nominales; WI-LUX se cuenta una sola vez, en D)*

---

## Tier D — Fuera de tema, editorial cuestionable, o duplicado (6) → ✅ ELIMINADAS (2026-09-03)

Las 6 se eliminaron del notebook el 2026-09-03 tras confirmación del dueño del proyecto ("elimina lo que no aporta").

| Título | URL | Motivo | Estado |
|---|---|---|---|
| WI-LUX: What If Learning UX (PriMera Scientific Publications) | primerascientific.com/journals/psen/PSEN-08-260 | **PriMera Scientific figura en listas de editoriales de acceso abierto depredador/cuestionable** (sucesoras de la lista Beall). Dado el historial de citas fabricadas de este proyecto (ver `MATRIZ_ARTICULOS.md`, 15/15 fabricadas en CC-02), tratar con máxima sospecha — no verificar como si fuera un journal normal. | 🗑️ ELIMINADA (id `fc31d04f-8892-4885-bdfe-2433835fc946`) |
| Intelligent Tutoring Systems (EU-JAMRAI) | eu-jamrai.eu/intelligent-tutoring-systems/ | EU-JAMRAI es una red europea de **resistencia antimicrobiana**, no de EdTech. El título coincide por casualidad de búsqueda; el contenido real casi seguro no es relevante a STIRE. | 🗑️ ELIMINADA (id `7248bd9b-aa21-4eed-b6a3-04e8806a2e24`) |
| LeetCode Teacher · Career Agent Skill (AI UX Playground) | aiuxplayground.com/skills/leetcode-teacher/ | Página de un marketplace de "skills" de agentes IA, sin autoridad ni relevancia directa comprobada. | 🗑️ ELIMINADA (id `12337696-e27c-460a-8fd3-d4c906c912c0`) |
| r/ALEKS_Math_and_Chem (Reddit) | reddit.com/r/ALEKS_Math_and_Chem/ | Foro de usuarios, sin control editorial — no aporta evidencia, solo anécdotas. | 🗑️ ELIMINADA (id `209874e0-999f-41e0-8bc9-894e2f28d839`) |
| Riddle - Daily Riddles App (App Store) | apps.apple.com/cz/app/riddle-daily-riddles/... | **Fuera de tema** — listado de una app de acertijos diarios, sin relación aparente con tutoría inteligente, repetición espaciada o UX educativa. Falso positivo de la búsqueda automática. | 🗑️ ELIMINADA (id `110f14cd-284e-4b51-ac58-eaa61fcbc323`) |
| A Comprehensive Review of AI-based ITS — versión duplicada en /pdf/ | arxiv.org/pdf/2507.18882 | **Duplicado**: mismo paper que la versión `/html/2507.18882v1` ya listada en Tier B (esa sí se conserva). | 🗑️ ELIMINADA (id `937b7322-9fcf-471d-a87a-6ea62eb8475a`) |

---

## Resumen

| Tier | Cantidad | Estado / acción |
|---|---|---|
| A | 16 (14 ya en MATRIZ + 2 primarias oficiales) | Ninguna — ya están o son candidatas directas de alta confianza |
| B | 37 | Pasar por el proceso real de verificación (DOI/Crossref, ISBN, ERIC) antes de citar en STIRE |
| C | 37 | Mantener solo como contexto de industria; no citar académicamente |
| D | 6 | 🗑️ **Eliminadas del notebook el 2026-09-03** |

**Estado actual del notebook tras la eliminación:** 91 fuentes vivas (16 + 37 + 37), más las 26 rotas eliminadas
antes (ver `notebooklm_fuentes_sin_verificar.json`) — 123 originales → 97 tras quitar rotas → 91 tras quitar Tier D.

**97 = 16 + 37 + 37 + 6** (nota: el conteo de Tier A cuenta las 2 nuevas primarias además de las 14 ya
verificadas; las 83 fuentes nuevas de la investigación automática se reparten en 2 (Tier A) + 37 (Tier B) + 38 (Tier C, incluye WI-LUX solo en D así que son 37 aquí) + 6 (Tier D) = 83; los dos reportes de síntesis generados por la propia herramienta de research —"Theoretical, Mathematical and Architectural Foundations..." y "UX Design Patterns in ITS..."— no se clasificaron en ningún tier de fuente porque no son una fuente externa: son el resumen que la propia IA de NotebookLM generó a partir de las demás; consérvense como notas internas, nunca como cita.
