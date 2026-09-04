---
estado:     vigente
verificado: 2026-09-04 contra commit HEAD (FASE CC-05B)
fuente:     normativo (bitácora de brechas)
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 🔍 Qué le falta a nuestro MODESEC — diagnóstico y plan

**Fecha del diagnóstico:** 28 de agosto de 2026 · **Responsable del diagnóstico:** CTO / Líder Técnico
**Alcance:** las 5 fases del modelo, con foco en lo exigible para la entrega de la Semana B.

---

## 1. Resumen en tres frases

1. **La Fase II ya está completa** (§3.1 a §3.3.3, con sus 5 formatos y 10 gráficos): era lo exigido
   para esta entrega y es lo que se presenta.
2. **La Fase I queda CERRADA PARA EL ALCANCE DEL MVP** (FASE CC-05B, decisión D-06): STIRE es una
   herramienta de apoyo docente con alcance declarado — razonamiento algorítmico y estructuras de
   control, no `COMP-203413` completa. Formato 5 (competencias), Formato 6 (contenidos, rederivado
   con el alcance MVP explícito) y la tabla de trazabilidad completa
   `COMP-203413 → RA → contenido → ventana → endpoint` existen y son verificables, con exactamente
   3 huecos reales declarados. Los Formatos 1, 4, 7, 8 y 9 quedan **deliberadamente diferidos** —
   no alimentan esa cadena — y se declaran como tal, no como huecos accidentales.
3. **La Fase III existe pero no está rotulada como MODESEC**, y las Fases IV y V están abiertas
   (falta juicio de expertos y prueba modelo). Eso es normal a esta altura del semestre, pero debe
   quedar declarado, no omitido.

---

## 2. Semáforo completo del modelo

Leyenda: ✅ completo · 🟡 existe pero no en formato MODESEC / incompleto · 🔴 no iniciado ·
⏸️ **PENDIENTE — ALCANCE DIFERIDO** (decisión explícita de producto, no negligencia — ver FASE
CC-05, Paso 4)

### FASE I — Diseño educativo

> ✅ **CERRADA PARA EL ALCANCE DEL MVP (D-06, FASE CC-05B).** STIRE es una herramienta de apoyo al
> docente, no la plataforma del curso completo. Cubre razonamiento algorítmico y estructuras de
> control (`RA-203413-U1` + parte algorítmica de `U2`); el resto de `COMP-203413` (HTML5/CSS/DOM,
> Unidad 3 OVA/REDA) se dicta por otros medios del curso — alcance declarado, no hueco. Ver
> `contenidos/3.1_DIAGRAMA_CONTENIDOS.md` §6 y `fase1/TRAZABILIDAD.md`.

| § | Pieza | Formato | Estado | Dónde está hoy |
|---|---|---|---|---|
| 2.1 | Análisis de la necesidad educativa | 1 | ⏸️ PENDIENTE — ALCANCE DIFERIDO | Decisión de Jeider (FASE CC-05): de los 5 formatos de Fase I solo se formalizan los que alimentan la cadena competencia → contenido → ventana. El Formato 1 no la alimenta. No se escribe en esta fase. |
| 2.2 | Planeación del proceso de producción | 2, 3 | 🟡 | `MONITOREO_SEMANAL.md`, `TABLERO.md`, `DISPONIBILIDAD_EQUIPO.md` cubren cronograma y roles; falta el registro de tiempos |
| 2.3 | Diseño de fines educativos | 4 | ⏸️ PENDIENTE — ALCANCE DIFERIDO | Mismo criterio que 2.1: no alimenta la cadena competencia → contenido → ventana. No se escribe en esta fase. |
| 2.4 | **Diseño del sistema de competencias** | 5 | ✅ | [`fase1/2.4_SISTEMA_COMPETENCIAS.md`](fase1/2.4_SISTEMA_COMPETENCIAS.md) (FASE CC-05, Paso 1) — transcripción literal de `COMP-203413`, `RA-203413-U1/U2/U3` y las tres unidades del Plan de Curso `FDOC-088`, con página citada, más su desagregación en objetivos/norma de desempeño/conceptos/habilidades. |
| 2.5 | Diseño de contenidos | 6 | ✅ | [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md`](contenidos/3.1_DIAGRAMA_CONTENIDOS.md), rederivado del Formato 5 en FASE CC-05, Paso 2 — reconcilia lo que STIRE cubre de `COMP-203413` (parte de algoritmia de U1, diseño modular de U2) y declara explícitamente lo que no cubre (HTML/CSS/DOM, Unidad 3 completa, arreglos sin respaldo curricular). Trazabilidad completa en [`fase1/TRAZABILIDAD.md`](fase1/TRAZABILIDAD.md). |
| 2.6 | Diseño pedagógico | 7 | ⏸️ PENDIENTE — ALCANCE DIFERIDO | Mismo criterio: no alimenta la cadena competencia → contenido → ventana. MOCAVI sigue declarado como marco (ver `MARCO_UX_PEDAGOGICO_STIRE.md`), pero el Formato 7 formal no se escribe en esta fase. |
| 2.7 | Diseño de aprendizaje y proceso evaluativo | 8, 9 | ⏸️ PENDIENTE — ALCANCE DIFERIDO | Mismo criterio: no alimenta la cadena competencia → contenido → ventana. No se escribe en esta fase. |

### FASE II — Diseño multimedial

| § | Pieza | Formato | Estado |
|---|---|---|---|
| 3.1 | Diagrama de contenidos | Gráfico 1 | ✅ |
| 3.2 | Guión didáctico | 10 | ✅ |
| 3.2 | Guión técnico | 11 | ✅ |
| 3.2.3 | Selección y producción de recursos multimedia | — | 🟡 inventario hecho; **producción de video y animación pendiente** |
| 3.3 | Ventana estándar | 12 | ✅ |
| 3.3.1 | Descripción de ventanas (7 categorías) | 13 | ✅ 6 ventanas |
| 3.3.2 | Guía de metáforas | 14 | ✅ 12 iconos |
| 3.3.3 | Mapa de navegación | Gráfico 2 | ✅ |

### FASE III — Diseño computacional

| § | Pieza | Formato | Estado | Dónde está hoy |
|---|---|---|---|---|
| 4.1 | Proceso de desarrollo y descripción funcional | 15 | 🟡 | `docs/01_ARQUITECTURA_Y_DISENO.md` — falta el rótulo MODESEC |
| 4.2 | Requerimientos formalizados | 16 | 🟡 | RF-01…RF-27 en el documento maestro, en otro formato |
| 4.3 | Casos de uso | 17 | 🟡 | Existen diagramas; falta el formato tabular de MODESEC |
| 4.4–4.6 | Clases, objetos, secuencia | — | 🟡 | Existen clases, componentes, despliegue, actividad y estados |
| 4.7 | MER, relacional y diccionario de datos | — | 🟡 | Base de datos operativa; **falta diccionario de datos** |

### FASE IV — Producción

| § | Pieza | Estado |
|---|---|---|
| 5.1 | Selección de herramienta y lenguaje | 🟡 decidido (NestJS/TS) pero sin la justificación formal del formato |
| 5.2 | Codificación (legibilidad, documentación, integración) | 🟡 en curso |
| 5.3 | **Evaluación por expertos y ajustes** | 🔴 no realizada |
| 5.4–5.5 | **Prueba modelo con estudiantes y su evaluación** | 🔴 no realizada |
| 5.6 | Manual de usuario | 🔴 no existe |

### FASE V — Aplicación

| § | Pieza | Estado |
|---|---|---|
| 6.1 | Utilización del software (condiciones y usuarios) | 🔴 no iniciada |
| 6.2 | Verificación, validación y pertinencia | 🔴 no iniciada |
| 6.3 | Mantenimiento | 🔴 no iniciada |

---

## 3. Lo que faltaba para *esta* entrega y ya quedó resuelto

| Faltante detectado | Por qué era bloqueante | Resuelto en |
|---|---|---|
| §3.2 Guión técnico multimedial (Formatos 10 y 11) | La guía del estudiante lo lista explícitamente en el marco MODESEC de la Clase 02 y no existía | `guiones/3.2_GUION_TECNICO_MULTIMEDIAL.md` |
| §3.3.3 Mapa de navegación | Entregable exigido en la Semana B; sin él, las ventanas quedan sin sistema | `contenidos/3.3.3_MAPA_NAVEGACION.md` + gráfico |
| **Los gráficos** | MODESEC §3.1 y §3.3 son gráficos por definición: un diagrama de contenidos "en texto" no cumple el formato | 10 figuras en `assets/` (SVG + PNG) |
| Iconografía de la guía de metáforas | El Formato 14 tiene una columna **Imagen** que no se puede llenar con texto | `assets/3.3.2_guia_metaforas.svg` (12 iconos dibujados) |
| Fichas de ventana sin maqueta | Describir una ventana sin mostrarla deja el Formato 13 a medias | 6 wireframes `assets/3.3.1_v0*.svg` |
| Organización en Git | Los archivos de la Fase II no existían en el repositorio: solo la plantilla vacía | Estructura descrita en `README.md` |
| Formato 5 — Sistema de competencias | Sin él no hay transcripción autorizada de `COMP-203413` ni de los `RA-203413-U1/U2/U3`; era la pieza más crítica del semáforo | `fase1/2.4_SISTEMA_COMPETENCIAS.md` (FASE CC-05, Paso 1) |
| §3.1 sin rederivar desde el Formato 5 | El diagrama de contenidos cubría pseudocódigo/arreglos/modularidad sin trazar contra ninguna competencia oficial | `contenidos/3.1_DIAGRAMA_CONTENIDOS.md`, rederivado (FASE CC-05, Paso 2) — con lo no cubierto declarado explícitamente en su §6 |
| Trazabilidad `competencia → contenido → ventana → endpoint` no demostrable | Era exactamente el riesgo #1 de este documento | `fase1/TRAZABILIDAD.md` (FASE CC-05 Paso 3, columna de cobertura en CC-05B Paso 2) — 10 filas `cubierto` + 3 `pendiente` (huecos reales), 0 `fuera de alcance` en la tabla |

---

## 4. Plan de cierre — qué sigue, en orden

El orden **no es negociable**: MODESEC es secuencial y la Fase I alimenta a la II. Estamos
trabajando "hacia atrás" porque el curso lo pidió así, y eso hay que corregirlo antes del siguiente
reto o la trazabilidad no se sostiene.

**Decisión de alcance (Jeider, FASE CC-05):** de los 5 formatos de Fase I, solo se formalizan los
que alimentan la cadena `competencia → contenido → ventana`. Las tareas 2 y 4 (Formatos 1, 4, 7, 8,
9) quedan **PENDIENTES — ALCANCE DIFERIDO** por esa razón, no reprogramadas por falta de tiempo.

| # | Tarea | Entregable | Dueño sugerido | Esfuerzo | Prioridad |
|---|---|---|---|---|---|
| 1 | ~~Formalizar el sistema de competencias~~ (Formato 5) | `fase1/2.4_SISTEMA_COMPETENCIAS.md` | — | — | ✅ **HECHO** (FASE CC-05, Paso 1) |
| 2 | Análisis de la necesidad educativa (Formato 1) | `fase1/2.1_NECESIDAD_EDUCATIVA.md` | — | — | ⏸️ **DIFERIDO** — no alimenta la cadena competencia → contenido → ventana |
| 3 | ~~Rederivar §3.1 desde el Formato 5~~ | `3.1_DIAGRAMA_CONTENIDOS.md` | — | — | ✅ **HECHO** (FASE CC-05, Paso 2) — con lo no cubierto declarado en su §6 |
| 3b | Tabla de trazabilidad `competencia → RA → contenido → ventana → endpoint` | `fase1/TRAZABILIDAD.md` | — | — | ✅ **HECHO** (FASE CC-05, Paso 3) |
| 4 | Diseño de fines educativos (Formato 4) y diseño pedagógico (Formato 7) | `fase1/2.3_FINES.md`, `fase1/2.6_PEDAGOGICO.md` | — | — | ⏸️ **DIFERIDO** — mismo criterio que tarea 2 |
| 5 | Diseño de aprendizaje y proceso evaluativo (Formatos 8 y 9) | `fase1/2.7_APRENDIZAJE.md` | — | — | ⏸️ **DIFERIDO** — mismo criterio que tarea 2 |
| 6 | **Verificar los endpoints citados en las fichas** contra el código real | corrección en `3.3.1_FICHAS_VENTANAS.md` | Jeider | 1 h | ✅ **HECHO** (FASE CC-04, Paso 5) |
| 7 | Rotular la Fase III existente como MODESEC (Formatos 15, 16, 17) y añadir diccionario de datos | `fase3/` | Jeider | 4 h | P2 |
| 8 | Producir el video de unidad y la animación de trazado (§3.2.3) | `assets/media/` | Por asignar | 8 h+ | P2 |
| 9 | Diseñar el instrumento de **juicio de expertos** (Formato 17 de la Fase IV) | `fase4/5.3_JUICIO_EXPERTOS.md` | Líder | 2 h | P2 |
| 10 | Manual de usuario (§5.6) | `fase4/5.6_MANUAL_USUARIO.md` | Equipo | 4 h | P3 |

---

## 5. Riesgos declarados (no ocultar en la sustentación)

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| 1 | ~~Fase I no formalizada~~ — **mitigado en FASE CC-05:** Formato 5, §3.1 rederivado y la tabla de trazabilidad ya demuestran la cadena `competencia → contenido → ventana → endpoint`, ahora con columna de cobertura y exactamente 3 huecos reales | Bajo (era Alto) | Resuelto — ver `fase1/2.4_SISTEMA_COMPETENCIAS.md`, `fase1/TRAZABILIDAD.md` |
| 1b | ~~STIRE no cubre la mayoría de la competencia oficial~~ — **resuelto por decisión de producto D-06 (FASE CC-05B):** ya no es un hallazgo abierto, es alcance MVP declarado. STIRE cubre razonamiento algorítmico y estructuras de control; HTML5/CSS/DOM y la Unidad 3 (OVA/REDA) se dictan por otros medios del curso, por decisión explícita, no por limitación descubierta | Bajo (era Alto) | Resuelto — ver `contenidos/3.1_DIAGRAMA_CONTENIDOS.md` §6 y `fase1/TRAZABILIDAD.md` (nota de sustentación) |
| 1c | **8 de 10 unidades de aprendizaje sin contenido/actividad sembrados** en `db:seed:demo` — el modelo de datos las soporta, no hay instancias | Medio | Declarado en `fase1/TRAZABILIDAD.md` como Hueco #1 (de 3); trabajo de contenido, no de arquitectura — no se puebla en esta fase (documental) |
| 1d | **Contradicción interna del propio Plan de Curso** entre §5 y §6 en el texto de `RA-203413-U2` y `RA-203413-U3` (nombres de unidad y wording del RA no coinciden) | Bajo | Declarado en `fase1/2.4_SISTEMA_COMPETENCIAS.md` §3.2-3.3 y como Hueco #3 (de 3) en `fase1/TRAZABILIDAD.md`; no es corregible por STIRE — es un documento institucional de la Universidad, se pregunta al docente titular |
| 1e | **Rol sin restricción en `POST /submissions/start`, `POST /submissions/:id/submit`, `PUT /submissions/:id/autosave`, `POST /tutor/chat`** — un docente o admin puede usarlas como si fuera estudiante | Medio | Registrado en `13_BACKLOG_FUNCIONAL.md` §6 (FASE CC-05, Paso 0b); no se corrige en esta fase (documental) |
| 2 | Endpoints de las fichas **no verificados** contra el código | Resuelto | Tarea 6 (FASE CC-04, Paso 5) |
| 3 | Video y animación **declarados pero no producidos** | Medio | Si no se producen, degradar a trazado estático tabulado y **declararlo**, nunca eliminarlo en silencio |
| 4 | Accesibilidad WCAG 2.1 AA declarada **sin auditoría ejecutada** | Medio | No reportarla como cumplida hasta pasar una herramienta de verificación |
| 5 | Los umbrales de dominio (70 % / 85 % / 60 %) son **propuesta de diseño**, no validados con el docente titular | Bajo | Validar en la próxima sesión presencial |
| 6 | Fases IV y V sin evaluación de expertos ni prueba modelo | Bajo hoy, alto al cierre | Programar la prueba modelo antes de la última entrega del semestre |
| 7 | Formatos 1, 4, 7, 8 y 9 de Fase I **diferidos por decisión de alcance**, no escritos | Bajo (decisión deliberada) | Retomar si una fase futura los necesita; no bloquean la cadena competencia → contenido → ventana |

> **Criterio de honestidad del equipo:** una pieza pendiente se declara pendiente. Un "no aplica"
> sin justificación y un formato lleno con texto genérico valen menos que un vacío reconocido, y
> ante un jurado se detectan igual de rápido.
