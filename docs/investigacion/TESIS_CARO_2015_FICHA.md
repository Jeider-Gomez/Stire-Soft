---
estado: ficha de lectura (23/10/2026), hecha leyendo el capítulo 1, el 2.2, el 3 (índice), el 6, el 7 y el 8 del archivo que subió Jeider
fuente: Caro Piñeres, M. F. (2015). *Metamodel for personalized adaptation of pedagogical strategies using metacognition in Intelligent Tutoring Systems*. Tesis doctoral, Universidad Nacional de Colombia, Medellín. Tutor: Jovani A. Jiménez Builes
archivo: `C:\Users\gomez\.claude\uploads\3d69e6e4-49c7-4701-87a0-da96808c5d4b\2a62dce3-tesis_manuel_caro_780290952015.md` (9.474 líneas; convertido a Markdown **sin figuras** y sin encabezados `#`). No está en el repositorio: es una obra ajena y larga, así que aquí solo hay esta ficha con números de línea
---

# Ficha: la tesis de Caro (2015) y qué le sirve a STIRE

## 1. De qué trata, en diez puntos

1. Propone **MPPSM**, un metamodelo (UML, estándar MOF) para diseñar la **adaptación personalizada de estrategias
   pedagógicas** en un tutor inteligente, integrando **metamemoria** y **autorregulación** (líneas 745 a 880).
2. Se sintetizó a partir de 40 modelos metacognitivos y 45 modelos de tutores de la literatura (líneas 555 y 7341).
3. La **metacognición** de la tesis es la **del sistema**: el tutor vigila y controla su propio razonamiento al
   planificar la instrucción. **No es la calibración de confianza del estudiante** (lo que STIRE llama «seguridad»).
4. Construyó **FUNPRO** (*FUNdamentos de PROgramación*), un tutor para introducción a la programación, escrito en
   SWI-Prolog, con cinco unidades: algoritmos, variables y constantes, SI-ENTONCES, ciclo PARA y ciclo MIENTRAS
   (línea 5218 en adelante).
5. Su modelo pedagógico tiene **cinco niveles**: teoría (conductismo o constructivismo), método de enseñanza, táctica
   (19 tácticas), actividad y recurso (líneas 5341 a 5480).
6. La lección tiene **seis secciones**: introducción, definición, explicación, ejemplo, actividad y evaluación
   (línea 5444).
7. **Personaliza** con 8 reglas lógicas a partir del **estilo de aprendizaje de Felder** (se mide con un test en el
   primer ingreso) y del **desempeño por lección** (0 a 2 deficiente, 2 a 3 bajo, 3 a 4 medio, 4 a 5 alto)
   (líneas 5481 a 5842).
8. **El estudiante califica cada recurso de 1 a 5** y el sistema ordena de mayor a menor y elige el mejor (línea 5469
   y la regla 7). Cuando el estudiante cambia el recurso recomendado, el sistema actualiza su perfil (regla 8).
9. Validación (líneas 6663 a 6900): un **cuasiexperimento** con 22 estudiantes con el módulo metacognitivo activado y
   22 con él desactivado, en un curso de cinco lecciones básicas. La ganancia entre prueba inicial y final fue
   **0,97** en el grupo experimental y **0,42** en el de control, en una escala de 0 a 5, con t = 3,92 y p = 0,000134.
10. Aparte, una simulación con **50 perfiles de estudiante generados** y 400 recursos, en ocho sesiones, para
    probar la metamemoria: la tasa de recursos disponibles pasó de 71 % a 98 % (líneas 6857 a 6937).

## 2. Mapa del archivo

| Capítulo | Líneas | Qué hay |
|---|---|---|
| 1 Introducción | 618 a 1012 | Motivación, problema, pregunta de investigación, objetivos, metodología |
| 2 Marco teórico | 1013 a 2410 | Estrategias pedagógicas, conductismo y constructivismo, módulos de un tutor (2.2), **personalización en tutores (2.2.6, línea 1534)**, metacognición |
| 3 Metamodelo del módulo pedagógico (METAGOGIC) | 2411 a 3029 | Paquetes Planner, Advisor, Assessment y User |
| 4 Metamodelo de metacognición (MISM) | 3030 a 3766 | Autorregulación, metamemoria, metacomprensión |
| 5 MPPSM | 3767 a 5217 | El metamodelo, el lenguaje M++ y la herramienta MetaThink |
| 6 **FUNPRO** | 5218 a 6937 | **El capítulo más útil para STIRE** |
| 7 Evaluación | 6938 a 7326 | Respuestas a las preguntas de investigación |
| 8 Conclusiones y trabajo futuro | 7327 a 7480 | Incluye lo que queda abierto |
| 9 Referencias | 7481 en adelante | |

**Se perdieron las figuras** en la conversión (modelo de cinco niveles, ontologías, pantallas de FUNPRO, gráficos de
resultados 6.18 y 6.19). El texto las describe lo suficiente para este análisis, pero si hace falta ver una pantalla
de FUNPRO o un gráfico, hay que pedir el PDF.

## 3. Lo que STIRE ya comparte con la tesis y lo que puede tomar

| Idea de la tesis | Qué tiene STIRE hoy | Qué se puede tomar |
|---|---|---|
| El **modelo del estudiante** mezcla conocimiento, habilidades, preferencias y progreso (2.2.2, línea 1226) | Perfil de aprendizaje (`src/analytics/perfil-aprendizaje.ts`), dominio por lección, calibración de confianza | Definir el «perfil» para los ejercicios personalizados con **dominio, errores de concepto, nivel y calibración** |
| El tutor decide objetivos y tareas **para cada estudiante**; no hay un conjunto fijo de tareas (línea 1296) | Los mismos ejercicios para todos, salvo repasos | **Es el argumento de Jeider para los ejercicios generados**: sin tareas distintas no hay personalización |
| Lección en seis secciones (5444) | Cuatro secciones propuestas: «La idea», «Un ejemplo», «Error común», «Pruébalo» | Comparar: la tesis separa *definición* de *explicación* y agrega *evaluación*. Sirve para la plantilla del Asistente |
| El estudiante califica los recursos de 1 a 5 (5469) | «Valorar la lección» y «No me quedó claro» | Usar esas valoraciones como **señal para elegir qué explicación alternativa mostrar** |
| Cuando el estudiante cambia de recurso, el sistema aprende su preferencia (regla 8) | Uso de formatos (descriptivo, sin efecto) | Opción: usar la elección **real y repetida** del formato como señal, no un test de estilo |
| Simulación con 50 perfiles generados (6858) | Idea de baterías de usuarios sintéticos (PLAN_MEJORAS) | Tiene **precedente académico en el mismo grupo de trabajo**: se puede citar |
| Cuasiexperimento con grupo de control (6679) | Prueba con unos 10 usuarios, sin control | Si se quiere comparar, hace falta un grupo con la función apagada: **el interruptor de los ejercicios generados lo permite** |
| El sistema avisa al administrador de los recursos con fallas (6.2.2.2) | Error de IA y de juez sin cola de revisión | La cola «Hechos con IA» del docente cumple ese papel |

## 4. Tensiones y cautelas (se dicen aquí para no repetirlas mal en el artículo)

1. **Estilos de aprendizaje.** FUNPRO personaliza con los cuatro ejes de Felder, y la propia tesis cita a Pashler et al.
   (2009) al definirlos (línea 5293). STIRE decidió **no** adaptar por estilos (BT-42 y BT-45 de `BASE_TEORICA.md`)
   porque esa literatura no respalda emparejar la enseñanza con el estilo. No hay contradicción que esconder:
   STIRE cita la tesis como **antecedente** y explica que cambia la señal de personalización. Además, el efecto que
   midió la tesis (ganancia de 0,97 frente a 0,42) es el de **tener o no el módulo metacognitivo**, no el de
   emparejar estilos; la tesis no aísla el efecto de los estilos.
2. **Calidad del cuasiexperimento.** Grupos de 22, **sin asignación al azar** (se eligieron «por su contacto previo con
   el grupo de investigación y el interés de sus profesores», líneas 6694 y 6695), cinco lecciones básicas y
   un solo contraste. Sirve como indicio, no como prueba. Hay que citarlo con esa descripción.
3. **Dos significados de «metacognición».** En la tesis, el sistema se monitorea a sí mismo. En STIRE, el estudiante
   juzga su propia seguridad. Conviene separar los términos en el artículo para que un revisor no los confunda.
4. **FUNPRO es un prototipo en Prolog** con cinco lecciones y sin seguridad para uso en la web (la propia tesis lo
   dice en el trabajo futuro, línea 7472). STIRE es una aplicación web completa con dos cursos reales.
5. **El trabajo futuro que la tesis deja abierto** (líneas 7443 a 7480) coincide con lo que STIRE ya hace: versión para
   celular, seguridad para la web y estudiar el efecto del tutor en la **metacognición del estudiante**. Esto último
   es justo lo que mide la calibración de confianza de STIRE, y es un buen argumento de contribución.

## 5. Qué hacer con esto

| Acción | Dónde |
|---|---|
| Agregar la tesis como obra de referencia y una entrada BT nueva («el perfil de personalización se construye con dominio, errores de concepto y calibración, no con estilos», con la nota de la tensión) | `BASE_TEORICA.md` y `MATRIZ_ARTICULOS_AMPLIADA.md`, **verificando antes la referencia en Crossref o el repositorio de la Universidad Nacional** |
| Usar el perfil de la sección 3 como definición para los ejercicios personalizados | `docs/PLAN_ASISTENTE_DOCENTE.md` §5 |
| Preguntar al profesor si Caro es quien propuso la idea de los perfiles, para citarla bien | Jeider |
| Si el artículo la cita, pedir el PDF para ver las figuras 6.2, 6.18 y 6.19 | Jeider |

## 6. Lo que no revisé

Leí con detalle los capítulos 1, 2.2, 6, 7 (parcial) y 8, y vi el índice del 3. No leí los capítulos 4 y 5 (el
metamodelo formal, UML y las transformaciones), ni 2.3 (metacognición en general), ni las referencias. Si el
artículo va a apoyarse en el metamodelo, hay que leerlos antes.
