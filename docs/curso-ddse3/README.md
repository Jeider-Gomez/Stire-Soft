# Entregas del curso DDSE3 · 2026-2

**Diseño y Desarrollo de Software Educativo III (203457)** · Universidad de Córdoba · Departamento de
Informática Educativa · Docente: Dr. Raúl Emiro Toscano Miranda

**Proyecto:** STIRE-Soft — Sistema Tutor Inteligente con Repetición Espaciada para Fundamentos de Algoritmia
**Equipo:** Jeider Gómez (líder técnico) · Pedro Romero · José López · Julio Galvis · Jorge Cervantes

| Aplicación en vivo | Bitácora de la semana | Tablero Kanban | Guías originales |
|---|---|---|---|
| https://stire-soft.vercel.app | [`MONITOREO_SEMANAL.md`](../../MONITOREO_SEMANAL.md) | [Trello — Semana 7](https://trello.com/b/C7WLINGc/stire-kanban-desarrollo-semana-07-28-sep-2-oct-2026) | [`guias/`](guias/) |

Esta página reúne **cada cosa que pidió el docente** en sus guías y en el cronograma, con el archivo
que la cumple y su estado. Leyenda: ✅ entregado · 🔄 en curso · 📅 según cronograma.

---

## 1. Retos del semestre (cronograma §4)

| Reto | Sustentación | Qué pide | Evidencia | Estado |
|---|---|---|---|---|
| **1 · Concepción y necesidad educativa** | Semana 3 (25/27 ago) | Diagnóstico pedagógico y objetivos del software | [`00_VISION_FUNCIONAL.md`](../00_VISION_FUNCIONAL.md) · [Sistema de competencias (MODESEC Fase I)](../modesec/fase1/2.4_SISTEMA_COMPETENCIAS.md) · [Pitch Reto 1](../pitch/PITCH_RETO_01_EN.md) | ✅ |
| **2 · Diseño de arquitectura y guion** | Semana 6 (15/17 sep) | Guion educativo, UI/UX y modelo pedagógico | [MODESEC Fase II completa](../modesec/README.md) · [Marco UX-pedagógico](../modesec/MARCO_UX_PEDAGOGICO_STIRE.md) · [Presentación](../modesec/entregables/) · [Pitch Reto 2](../pitch/PITCH_RETO_02.md) | ✅ |
| **3 · Prototipado e interacción base** | Semana 9 (6/8 oct) | Prototipo interactivo funcional y componentes principales | **Aplicación desplegada** con los 3 roles y 7 tipos de ejercicio · [capturas de la versión 1](../material-visual/05-primera-version-desplegada/README.md) · [recorridos verificados](../../CHANGELOG.md) · pitch del Reto 3 (S07-P03) | 🔄 prototipo listo; falta el pitch |
| **4 · Integración de medios y evaluación** | Semana 11 (20/22 oct) | Módulos interactivos, multimedia y mecanismos de evaluación | Los mecanismos de evaluación ya funcionan (7 evaluadores); falta la producción multimedia (MODESEC §3.2.3) | 📅 |
| **5 · Pruebas piloto y correcciones** | Semana 13 (3/5 nov) | Pruebas con usuarios y reporte de validación | Plan: dos cursos reales cargados desde la aplicación y prueba con estudiantes | 📅 |
| **Proyecto integrador final** | Semana 16 (24/26 nov) | Software completo desplegado + reporte técnico | El despliegue ya existe ([`DESPLIEGUE.md`](../DESPLIEGUE.md) §8) | 📅 |

## 2. Guía de la Clase 02 — Monitoreo, control e ingeniería de prompts

| Lo que pide la guía | Dónde está | Estado |
|---|---|---|
| Bitácora `MONITOREO_SEMANAL.md` en la **raíz** del repositorio, con la plantilla oficial | [`MONITOREO_SEMANAL.md`](../../MONITOREO_SEMANAL.md) (semana en curso) y las semanas cerradas en §4 de esta página | ✅ cada semana |
| Evidencia de ingeniería de prompts (ROCAS + MOCAVI / MODESEC) | [Bitácora N.º 1 §2.2](../seguimiento/MONITOREO_SEMANAL_01.md#22-evidencia-de-ingeniería-de-prompts-rocas--mocavi--modesec): prompt ROCAS del pitch con sus iteraciones · [prompts completos enviados a las IA](../agentes-ia/prompts/README.md) | ✅ |
| Avance MODESEC Fase II: diagrama de contenidos | [`3.1_DIAGRAMA_CONTENIDOS.md`](../modesec/contenidos/3.1_DIAGRAMA_CONTENIDOS.md) | ✅ |
| Guion técnico multimedial | [`3.2_GUION_TECNICO_MULTIMEDIAL.md`](../modesec/guiones/3.2_GUION_TECNICO_MULTIMEDIAL.md) | ✅ |
| Ventana estándar por secciones | [`3.3_VENTANA_ESTANDAR.md`](../modesec/ventanas/3.3_VENTANA_ESTANDAR.md) | ✅ |
| Descripción de ventanas en las 7 categorías (imagen, nombre, texto, audio, video, animación, acciones) | [`3.3.1_FICHAS_VENTANAS.md`](../modesec/ventanas/3.3.1_FICHAS_VENTANAS.md) | ✅ |
| Guía de metáforas | [`3.3.2_GUIA_METAFORAS.md`](../modesec/contenidos/3.3.2_GUIA_METAFORAS.md) | ✅ |
| Mapa de navegación | [`3.3.3_MAPA_NAVEGACION.md`](../modesec/contenidos/3.3.3_MAPA_NAVEGACION.md) | ✅ |
| Documento consolidado de la Fase II | [`FASE_II_DISENO_MULTIMEDIAL.md`](../modesec/FASE_II_DISENO_MULTIMEDIAL.md) · [presentación .pptx / .pdf](../modesec/entregables/) | ✅ |
| Pitch en inglés de 1 minuto: guion (Hook · Problem · Solution · Tech Stack & CTA) | [`PITCH_RETO_01_EN.md`](../pitch/PITCH_RETO_01_EN.md) · [guía de pronunciación](../pitch/GUIA_PRONUNCIACION.md) | ✅ |
| Pitch: prompt ROCAS utilizado | [Bitácora N.º 1 §2.2](../seguimiento/MONITOREO_SEMANAL_01.md) · versión entregada con su sección de evidencia ROCAS: [`_archivo/pitch/`](../_archivo/pitch/README.md) | ✅ |
| Pitch progresivo (+30 s por reto) | Reto 1: 60 s · [Reto 2](../pitch/PITCH_RETO_02.md) · Reto 3: pendiente (Pedro, S07-P03) | 🔄 |

## 3. Guía de la Semana 03 — Interfaces, frontend en Nuxt y respaldo científico

| Lo que pide la guía | Dónde está | Estado |
|---|---|---|
| Mockups de alta fidelidad fundamentados en Pressman y MODESEC | [`semana-03/GUI_MOCKUPS_Y_NAVEGACION.md`](semana-03/GUI_MOCKUPS_Y_NAVEGACION.md) §1 (Figma + pantallas reales) | ✅ |
| Las 3 Reglas de Oro de Theo Mandel aplicadas | [`GUI_MOCKUPS_Y_NAVEGACION.md`](semana-03/GUI_MOCKUPS_Y_NAVEGACION.md) §2, con lo que aún no cumple | ✅ |
| Mapa de navegación y regla de los 3 clics | [`GUI_MOCKUPS_Y_NAVEGACION.md`](semana-03/GUI_MOCKUPS_Y_NAVEGACION.md) §3: mapa de las rutas reales y clics medidos | ✅ |
| Pruebas con usuarios (Sommerville §8.4) | [`GUI_MOCKUPS_Y_NAVEGACION.md`](semana-03/GUI_MOCKUPS_Y_NAVEGACION.md) §4 · [reportes de QA](../calidad/README.md) | 🔄 falta la prueba con estudiantes reales (Reto 5) |
| **15 artículos científicos (5 pedagógicos + 5 de arquitectura/frontend + 5 de GUI/UX)** | [`semana-03/15_ARTICULOS_CIENTIFICOS.md`](semana-03/15_ARTICULOS_CIENTIFICOS.md): los 15 con DOI verificado y la decisión de STIRE que respalda cada uno | ✅ |
| Sección de la GUI para el artículo (IMRyD, figura compuesta) | [`semana-03/SECCION_GUI_ARTICULO.md`](semana-03/SECCION_GUI_ARTICULO.md): Figura 2 (a)(b)(c) y texto en inglés | ✅ |
| Frontend en Nuxt (Vue 3) con Google Antigravity | [`frontend-nuxt/`](../../frontend-nuxt/) · [planes e informes de Antigravity](../agentes-ia/antigravity/README.md) · desplegado en https://stire-soft.vercel.app | ✅ |

## 4. Bitácoras semanales

| Semana del curso | Fechas | Bitácora |
|---|---|---|
| 2 | 17 – 21 ago | [N.º 1](../seguimiento/MONITOREO_SEMANAL_01.md) |
| 3 | 24 – 28 ago | [N.º 2](../seguimiento/MONITOREO_SEMANAL_02.md) |
| 4 | 31 ago – 4 sep | [N.º 3](../seguimiento/MONITOREO_SEMANAL_03.md) |
| 5 | 7 – 11 sep | [N.º 4](../seguimiento/MONITOREO_SEMANAL_04.md) |
| 6 | 14 – 18 sep | [N.º 5](../seguimiento/MONITOREO_SEMANAL_05.md) |
| 7 | 21 – 25 sep | [N.º 6](../seguimiento/MONITOREO_SEMANAL_06.md) |
| 8 | 28 sep – 2 oct | [N.º 7 — en curso](../../MONITOREO_SEMANAL.md) |

Evidencias de las reuniones (capturas con fecha): [`seguimiento/evidencias/`](../seguimiento/evidencias/).

## 5. Guías originales del docente

| Archivo | Contenido |
|---|---|
| [`Guia_Estudiante_Clase_02.docx`](guias/Guia_Estudiante_Clase_02.docx) | Monitoreo y control, ROCAS + MOCAVI + MODESEC, pitch de 1 minuto |
| [`DDS3-01_Guia_MODESEC_Fase_II.pdf`](guias/DDS3-01_Guia_MODESEC_Fase_II.pdf) | MODESEC Fase II: diseño multimedial |
| [`Guia_Estudiante_Semana_03.docx`](guias/Guia_Estudiante_Semana_03.docx) | Interfaces, Nuxt con Antigravity y los 15 artículos |
| [`Guia_Semana_03_GUI_Mockups.docx`](guias/Guia_Semana_03_GUI_Mockups.docx) | Mockups y mapa de navegación |
| [`Cronograma_DDSE3_2026-2.docx`](guias/Cronograma_DDSE3_2026-2.docx) | Cronograma de 16 semanas y plan de retos |

Referencia base de MODESEC: Caro, M., Toscano, R., Hernández, F., & David, M. (2009). MODESEC: Modelo
para el desarrollo de software educativo basado en competencias. *Nuevas Ideas en Informática
Educativa, 5*, 188–200.
