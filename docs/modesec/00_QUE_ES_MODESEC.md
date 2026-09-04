---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    no aplica (documento conceptual)
---

# 🧭 ¿Qué es MODESEC? — el modelo explicado, fase por fase

> Documento de referencia del equipo. Explica **qué es** MODESEC, **qué se produce** en cada fase y
> **por qué** tomamos cada decisión en STIRE. Si vas a trabajar en cualquier archivo de esta
> carpeta, lee primero este documento.

---

## 1. Qué es MODESEC en una frase

**MODESEC es un modelo para desarrollar software educativo en el que la decisión pedagógica manda
sobre la decisión técnica.** Su nombre completo es *Modelo para el Desarrollo de Software Educativo
basado en Competencias*, y su versión formal es **MODESEC-ISO/IEC 12207**, porque cada fase del
modelo está mapeada contra un proceso de la norma internacional de ciclo de vida del software
(ISO/IEC 12207: adquisición, suministro, desarrollo, operación y mantenimiento).

Fue formulado por **Manuel Caro, Raúl Toscano, Filadelfia Hernández y María David** en la
Universidad de Córdoba (artículo de 2009, libro de 2012).

### Por qué existe: el problema que resuelve

Los modelos de ingeniería de software clásicos (cascada, espiral, RUP) son excelentes para construir
*un sistema que funcione*, pero no tienen ningún apartado que responda a la pregunta educativa:
¿qué debe aprender el estudiante, cómo se sabe que lo aprendió y qué actividad lo produce? Los
autores de MODESEC identificaron exactamente eso: **los modelos vigentes no presentan una sección
que brinde la información pedagógica del producto**, y por eso el software educativo terminaba
siendo software correcto con pedagogía improvisada.

MODESEC lo corrige poniendo el **sistema de competencias como eje integrador**: todo lo que se
diseña después —contenidos, ventanas, base de datos, código— debe poder trazarse hasta una
competencia declarada. Si un botón no sirve a una competencia, ese botón sobra.

### La consecuencia práctica para nosotros

En STIRE esto significa que **no se codifica una pantalla que no esté justificada pedagógicamente**.
Cuando en la Fase II explicamos la función de cada sección de la ventana, no estamos rellenando un
formato: estamos cumpliendo el eje del modelo.

---

## 2. Las cinco fases

```
FASE I    Diseño educativo      →  ¿Qué problema educativo resolvemos y con qué competencias?
FASE II   Diseño multimedial    →  ¿Cómo se ve, se navega y se comunica eso en pantalla?
FASE III  Diseño computacional  →  ¿Qué requisitos, clases, datos y diagramas lo sostienen?
FASE IV   Producción            →  ¿Cómo se construye, se prueba con expertos y se documenta?
FASE V    Aplicación            →  ¿Cómo se usa con estudiantes reales, se valida y se mantiene?
```

Cada fase produce **formatos** (plantillas tabulares numeradas del 1 al 17 en el libro). El formato
no es burocracia: es el contrato que permite que la fase siguiente empiece sin adivinar nada.

---

## 3. FASE I — Diseño educativo

Es el punto de partida y la fase de la que dependen todas las demás. Aquí no se habla de software
todavía: se estudia el problema educativo.

| § | Etapa | Qué se produce | Formato |
|---|---|---|---|
| 2.1 | **Análisis de la necesidad educativa** | La necesidad entendida como *discrepancia entre el estado educativo ideal y el real* (Kaufman): ideal de aprendizaje, población, diagnóstico actual, falencias, causas, soluciones posibles, tipo de software elegido y justificación | Formato 1 |
| 2.2 | **Planeación del proceso de producción** | Cronograma, registro de tiempos y definición de roles del equipo | Formatos 2 y 3 |
| 2.3 | **Diseño de fines educativos** | Objetivos de aprendizaje, dimensiones (cognitiva, procedimental, actitudinal) y valores | Formato 4 |
| 2.4 | **Diseño del sistema de competencias** | La competencia desagregada en objetivos, norma, conceptos y habilidades requeridas — **el eje del modelo** | Formato 5 |
| 2.5 | **Diseño de contenidos** | Cada concepto extraído de las competencias, con su definición y características | Formato 6 |
| 2.6 | **Diseño pedagógico** | El modelo pedagógico elegido y **cuáles de sus aspectos se materializan** en el software (MODESEC no impone modelo: exige justificar el elegido) | Formato 7 |
| 2.7 | **Diseño de aprendizaje** | Guión de aprendizaje (secuencia de actividades por competencia) y proceso evaluativo | Formatos 8 y 9 |

**Punto crítico que suele fallar:** el contenido del software **se obtiene del listado de conceptos
del formato de competencias**, no de un temario copiado del programa de la asignatura. Si el
contenido no sale de la competencia, la trazabilidad del modelo se rompe en la primera fase.

**En STIRE:** el modelo pedagógico es **MOCAVI** (co-aprendizaje virtual, trabajo por proyectos y
resultados de aprendizaje) y la competencia es la de resolución de problemas mediante algoritmos.
Buena parte de esta fase existe en el proyecto —documento maestro de requisitos, visión funcional—
pero **redactada como ingeniería, no en los formatos de MODESEC**. Ver el gap en `01_GAP_Y_PLAN.md`.

---

## 4. FASE II — Diseño multimedial  ← *donde estamos*

Traduce el diseño educativo a **estructura visible**: qué contenidos hay, cómo se ven las pantallas,
qué recursos multimedia se usan y cómo se navega.

| § | Etapa | Qué se produce | Formato |
|---|---|---|---|
| 3.1 | **Diagrama de contenidos** | Representación gráfica de los contenidos: mentefacto, mapa conceptual o **mapa mental** | Gráfico 1 |
| 3.2 | **Guión técnico multimedial** | **Guión didáctico** (para qué, para quién, con qué finalidad) + **guión técnico** (qué texto, imagen y sonido hay en cada ventana, con formato/fuente, acción y evento) + selección y producción de recursos | Formatos 10 y 11 |
| 3.3 | **Ventana estándar** | La ventana modelo, **explicada por secciones** | Formato 12 |
| 3.3.1 | **Descripción de las ventanas** | Cada ventana en **7 categorías**: imagen, nombre, texto, audio, video, animación y acciones | Formato 13 |
| 3.3.2 | **Guía de metáforas** | Nombre, imagen y descripción de cada icono/metáfora de la interfaz | Formato 14 |
| 3.3.3 | **Mapa de navegación** | Esquema gráfico de cómo se enlazan todas las ventanas | Gráfico 2 |

### Por qué hicimos lo que hicimos en cada punto

**§3.1 — Elegimos mapa mental, tres módulos y verbos observables.**
MODESEC admite tres representaciones (mentefacto, mapa conceptual, mapa mental). Escogimos **mapa
mental radial** porque el contenido de algoritmia es jerárquico y acumulativo, y el mapa mental
muestra de un vistazo qué depende de qué. Los tres módulos siguen la secuencia natural de la
disciplina: *representar → controlar el flujo → estructurar datos*. Cada tema declara un
**resultado de aprendizaje con verbo observable** (construye, traza, depura) y no con verbos
inverificables (conocer, entender), porque un resultado que no se puede medir con un ejercicio no
se puede evaluar con el motor de dominio de STIRE.

**§3.2 — El guión didáctico se llenó con la población real, no con una genérica.**
El guión didáctico exige rango de edades, características psicológicas y nivel académico. Los
completamos con nuestra población concreta (3.er semestre de Licenciatura en Informática, 18–22
años, sin experiencia previa de programación formal) porque de ahí salen decisiones duras: bloques
de teoría de ≤150 palabras, enunciados de ≤200 palabras y aviso permanente de que el tutor es IA.

**§3.3 — Dividimos la ventana en cinco secciones invariantes.**
Header, Menú, Contenido, Acciones y Footer se quedan siempre en el mismo lugar y **solo cambia la
zona de contenido**. La razón es de carga cognitiva: si el estudiante tiene que reaprender dónde
están los controles al cambiar de pantalla, gasta en la interfaz el esfuerzo mental que debería
gastar en el algoritmo. Además separamos **Ejecutar** (gratis, ilimitado) de **Entregar** (consume
intento): esa separación visible es lo que convierte el error en herramienta y no en castigo.

**§3.3.1 — Ninguna de las 7 categorías quedó en blanco.**
Donde el audio o el video no aplican, escribimos *por qué* no aplican. Un "no aplica" sin
justificación es indistinguible de un olvido, y el modelo pide describir la ventana completa. Dos
decisiones deliberadas que conviene defender en clase: **no hay locución en el tutor IA** (sintetizar
voz sobre texto generado por IA aumenta la percepción de autoridad de una fuente falible) y **no hay
video en el repaso** (el repaso es recuperación activa; ver un video lo convierte en reconocimiento
pasivo y anula el efecto del método).

**§3.3.2 — Una sola metáfora rectora, no un catálogo de iconos sueltos.**
El modelo pide que la metáfora esté *asociada al contexto de la población y al ambiente de
aprendizaje*. Elegimos **"el taller del algoritmista"**: se aprende un oficio produciendo piezas,
con un maestro que corrige el procedimiento, y el error es una prueba de banco, no una sanción. Esa
metáfora sostiene además el repaso espaciado, que en un taller real es mantenimiento del herramental
y no castigo. De ahí se derivan la paleta, la iconografía y hasta el vocabulario de la interfaz
(*ensayar, ajustar, verificar, entregar*, nunca *puntos* ni *vidas*).

**§3.3.3 — El mapa se validó contra cuatro reglas, no se dibujó "bonito".**
Ninguna ventana sin ruta de entrada, ninguna huérfana, retorno al panel en un clic y condiciones de
transición explícitas. Un mapa de navegación que no se puede auditar con reglas es un dibujo.

---

## 5. FASE III — Diseño computacional

Aquí sí aparece la ingeniería: se elige el paradigma, se formalizan requisitos y se modela.

| § | Etapa | Qué se produce | Formato |
|---|---|---|---|
| 4.1 | Selección y descripción del proceso de desarrollo | Paradigma (POO) y descripción funcional del sistema | Formato 15 |
| 4.2 | Análisis de requerimientos | Requerimientos formalizados | Formato 16 |
| 4.3 | Casos de uso | Actores, procesos y diagramas | Formato 17 |
| 4.4–4.6 | Diagramas de clases, objetos y secuencia | Modelo estructural y de comportamiento | — |
| 4.7 | Modelado del sistema de conocimiento / base de datos | MER, modelo relacional y **diccionario de datos** | — |

**En STIRE:** esta fase es la más avanzada del proyecto (requisitos RF-01 a RF-27, diagramas de
clases, componentes, despliegue, actividad y estados, y una base de datos en operación). Lo que
falta no es contenido sino **rótulo**: los artefactos existen pero no están referenciados como
Fase III de MODESEC.

---

## 6. FASE IV — Producción

| § | Etapa | Qué se produce |
|---|---|---|
| 5.1 | Selección de herramienta de desarrollo | Lenguaje y justificación de la elección |
| 5.2 | Codificación | Código legible, documentado e integrado |
| 5.3 | Evaluación de la versión inicial | **Juicio de expertos** y ajustes derivados |
| 5.4–5.5 | Prueba modelo | Aplicación con usuarios, análisis de resultados y ajustes |
| 5.6 | Manual de usuario | Especificaciones, instalación y descripción de interfaces |

**En STIRE:** hay código, tests y notas de versión; **no hay evaluación por expertos ni prueba
modelo con estudiantes**, que son justamente las dos actividades que MODESEC considera obligatorias
antes de declarar una versión válida.

---

## 7. FASE V — Aplicación

| § | Etapa | Qué se produce |
|---|---|---|
| 6.1 | Utilización del software | Condiciones físicas, lógicas y de usuarios para el uso real |
| 6.2 | Obtención de resultados | **Verificación** (¿está bien construido?), **validación** (¿cumple los requisitos?) y **pertinencia** (¿sirve educativamente?) |
| 6.3 | Mantenimiento | Implementación del proceso, análisis de modificaciones, migración y retirada |

**En STIRE:** fase no iniciada. Es esperable en un proyecto de curso, pero debe declararse como no
iniciada en lugar de omitirse.

---

## 8. Cómo se relaciona MODESEC con lo demás que usamos

| Marco | Qué aporta | Dónde se ve en STIRE |
|---|---|---|
| **MODESEC** | El **proceso**: qué se diseña, en qué orden y con qué formato | Esta carpeta completa |
| **MOCAVI** | El **modelo pedagógico**: co-aprendizaje virtual, proyectos, resultados de aprendizaje | Fase I §2.6 y la justificación de la metáfora rectora |
| **ROCAS** (Jucagi) | La **técnica de prompts**: Rol, Objetivo, Contexto, Acción, Salida | Evidencia de prompts en `MONITOREO_SEMANAL.md` |
| **ISO/IEC 12207** | La **norma** de ciclo de vida contra la que MODESEC se mapea | Justifica que el modelo sea auditable, no artesanal |

Los tres primeros no compiten: MODESEC dice *qué documento producir*, MOCAVI dice *con qué
pedagogía*, y ROCAS es *cómo se le pide a la IA que ayude a producirlo*.

---

## 9. Fuentes

- Caro, M., Toscano, R., Hernández, F. y David, M. (2012). *MODESEC: Modelo para el desarrollo de software educativo basado en competencias* — libro completo (108 pp.), fases I a V y formatos 1 a 17.
- Caro, M. et al. (2009). *MODESEC*. Nuevas Ideas en Informática Educativa, 5, 188–200.
- Presentación de la asignatura `DDS3-01.pdf` (2024) — §3 Fase II.
- Guía de trabajo del estudiante, Clase 02 — DDSE3, Universidad de Córdoba.
- *Modelo pedagógico Educación virtual — MOCAVI* (2023).
- Giraldo, J. C. (2004). *Metodología SEMLI*. Montería.
