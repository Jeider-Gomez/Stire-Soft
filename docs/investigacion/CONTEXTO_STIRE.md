---
estado:     vigente
verificado: 2026-09-14
fuente:     bloque de contexto reutilizable para el informe de investigación (no el software STIRE-Soft)
codigos:    no aplica (investigación, no ventanas)
---

# Bloque de contexto reutilizable — Proyecto de investigación STIRE

> **Qué es este documento.** Sirve para dos cosas: (1) contexto de arranque de cualquier sesión
> nueva sobre el informe de investigación (distinto del software STIRE-Soft que vive en el resto
> del repositorio), y (2) bloque de instrucciones que se pega al inicio de cualquier prompt
> dirigido a otra IA para producir un entregable del informe. **No modificar ni ampliar estos
> datos** sin verificarlos contra la fuente original — ver §8.

Última verificación de datos: 14 de septiembre de 2026.

---

## 1. Identificación

**Título.** Análisis y diseño de un tutor inteligente con repetición espaciada para el aprendizaje de fundamentos de algoritmia en educación superior.

**Autores.** Jeider Jair Gomez Oviedo y Pedro Gabriel Romero Mendivil.
**Director.** Raúl Emiro Toscano Miranda. **Codirectora.** Glenis Bibiana Álvarez Quiroz.
**Institución.** Licenciatura en Informática, Facultad de Educación y Ciencias Humanas, Universidad de Córdoba, Montería, Colombia.
**Grupo.** EduTLAN. **Línea.** Tecnología Educativa.

**Pregunta de investigación.** ¿De qué manera el análisis y diseño de un tutor inteligente basado en la técnica de repetición espaciada puede favorecer el aprendizaje de los fundamentos de algoritmia en educación superior, como estrategia de personalización y diagnóstico continuo del proceso formativo de los estudiantes?

**Objetivo general.** Diseñar un modelo de tutor inteligente basado en la técnica de repetición espaciada para apoyar el aprendizaje de los fundamentos de algoritmia en estudiantes de educación superior.

**Objetivos específicos.**

1. Diagnosticar las dificultades cognitivas, metodológicas y motivacionales en el aprendizaje de los fundamentos de algoritmia.
2. Analizar características, componentes y estrategias de tutores inteligentes existentes que integren técnicas adaptativas o de repetición espaciada.
3. Estructurar un modelo pedagógico del tutor inteligente que incorpore la repetición espaciada.
4. Proponer la arquitectura técnica y funcional del tutor inteligente como base para un posible prototipo en fases futuras.

**Enfoque y diseño.** Cualitativo, alcance descriptivo y propositivo. Diseño basado en Design Science Research (Hevner et al., 2004; Peffers et al., 2007).

**Población.** Veinte estudiantes de tercer semestre de la asignatura Fundamentos de Algoritmia y un docente de la misma asignatura. Muestreo intencional.

---

## 2. Restricción de alcance

Esta es la decisión metodológica que gobierna todo lo demás y no es negociable.

El informe declara de manera explícita que la propuesta corresponde a requerimientos y características de diseño, y que ningún componente fue desarrollado ni evaluado técnicamente dentro del alcance de la investigación. Las dos cláusulas literales, incorporadas en la revisión del 13 de septiembre de 2026, son:

> «Estas no representan funcionalidades implementadas, sino requerimientos y características de diseño derivados de los resultados de la investigación.»

> «…sin implicar que dichos componentes hayan sido desarrollados o evaluados técnicamente dentro del alcance de la presente investigación.»

En consecuencia, todo texto que se produzca para el informe debe cumplir cuatro condiciones. Primero, emplear modo condicional o prospectivo: el tutor deberá, el sistema podría, la información sería analizada. Segundo, usar el rótulo *preliminar* o *propuesto* al nombrar el modelo o la arquitectura. Tercero, no afirmar que algo está implementado, probado, validado o evaluado. Cuarto, no mencionar tecnologías concretas de implementación —lenguajes, marcos de trabajo, motores de base de datos, servicios de infraestructura—, porque la arquitectura del informe es funcional, no técnica.

Existe documentación técnica real del backend de STIRE-Soft en el resto de este repositorio (y en una carpeta de Drive titulada «Google AI Studio»). Ese material es real y valioso para el producto de software, pero su lugar no es el cuerpo del informe de investigación: contradice el deslinde anterior. Corresponde, si acaso, a un anexo rotulado como exploración técnica preliminar, o a un producto académico aparte (ponencia, artículo técnico).

---

## 3. Hallazgos del diagnóstico

Estas son las únicas cifras autorizadas. No deben generarse otras ni redondearse las existentes.

### Test Digital de Diagnóstico Algorítmico (STIRE)

Aplicado el 11 de mayo de 2026 a veinte estudiantes, sobre siete puntos. Fuente: `SESIÓN 2.docx`, en Instrumentos/Sesion 2.

| Métrica | Valor |
| --- | --- |
| Puntaje promedio | 5.25 / 7 |
| Mediana | 5.5 / 7 |
| Desviación estándar | 1.58 |
| Puntaje mínimo | 2 / 7 |
| Puntaje máximo | 7 / 7 |

Conceptos con más fallas: secuenciación (8 menciones), ciclos o bucles (7 menciones), acumuladores (5 menciones).

Hallazgos cualitativos del mismo instrumento. El treinta por ciento de la muestra declaró textualmente dificultad para seguir el rastro mental de cómo se transforma una variable en cada iteración. El cincuenta por ciento atribuyó sus fallas a lectura apresurada, distracción o decisiones impulsivas, no a desconocimiento del concepto. El treinta y cinco por ciento ingresó a tercer semestre declarando ningún conocimiento previo de lenguajes de programación. Solo alrededor del quince por ciento de los errores se debió a no recordar el concepto; el resto ocurrió al operacionalizarlo.

Contraste entre autopercepción y desempeño. Once estudiantes se ubicaron en nivel medio y obtuvieron en promedio 5.27 sobre 7. Cinco estudiantes, el veinticinco por ciento, se ubicaron en nivel bajo y obtuvieron en promedio 4.2 sobre 7.

### Encuesta diagnóstica

Más de la mitad inició el curso sin experiencia previa en programación. La menor confianza declarada corresponde a los ciclos de tipo Mientras y a la traducción de un algoritmo a código escrito; la mayor, al análisis del problema y la organización secuencial de la solución. La mayoría dedica entre una y dos horas semanales a práctica autónoma fuera de clase. La disposición al uso de un tutor inteligente con retroalimentación inmediata y actividades adaptadas fue favorable de manera unánime.

### Entrevista semiestructurada al docente

Dificultad de los estudiantes para identificar entradas, procesos y salidas antes de resolver. Omisión de pasos en la secuencia por asumirlos implícitos. Dificultades con variables, asignación de valores, estructuras condicionales y ciclos repetitivos. Dificultad para decidir cuándo usar cada estructura de control y transferirla a contextos nuevos. Metodologías que emplea: aprendizaje situado y aprendizaje basado en problemas. Necesidades que identifica para un tutor: acompañamiento personalizado, retroalimentación inmediata, seguimiento continuo del progreso, identificación temprana de dificultades y fortalecimiento de hábitos de estudio.

---

## 4. Análisis de referentes

Fuente: `Sesion3 FichaAnalisis.docx`, en Instrumentos/Sesión 3.

**Khan Academy / Khanmigo.** Tutoría socrática mediante preguntas orientadoras, retroalimentación inmediata y contextualizada, personalización del nivel de ayuda según desempeño, apoyo en depuración de código. No se evidenció repetición espaciada explícita ni especialización en algoritmia universitaria.

**Duolingo.** Repetición espaciada como componente central, con estimación de la fuerza de memoria para programar repasos en intervalos crecientes. Práctica personalizada según historial y probabilidad de olvido, sesiones breves, progreso visible. Enfocado en idiomas, no en razonamiento algorítmico complejo.

**MATHia.** Retroalimentación centrada en el paso exacto del procedimiento donde aparece la dificultad, descomposición de problemas en subhabilidades, seguimiento continuo del dominio por competencia, visualización del progreso. No se evidenció repetición espaciada explícita; su foco es matemático.

---

## 5. La propuesta, tal como está definida

### Características (§5.4.1)

| ID | Característica |
| --- | --- |
| CAR-01 | Adaptación al nivel y ritmo de aprendizaje del estudiante |
| CAR-02 | Retroalimentación inmediata y explicativa |
| CAR-03 | Orientación mediante pistas progresivas |
| CAR-04 | Repetición espaciada para reforzar conceptos con dificultades |
| CAR-05 | Seguimiento del dominio de los conceptos y del progreso |
| CAR-06 | Recomendaciones personalizadas y elementos de motivación |

### Modelo pedagógico (§5.4.2)

Tres etapas no estrictamente lineales: exploración; práctica y retroalimentación; dominio y revisión.

**Decisión sobre los intervalos de repaso.** Existía una discrepancia entre dos documentos del proyecto. La `Sesion5_PlantillaDiseno` proponía bandas fijas de un día, tres a siete días y catorce a sesenta días. La documentación técnica de STIRE implementa una progresión multiplicativa. La decisión adoptada es la progresión multiplicativa, porque corresponde al efecto de espaciamiento —intervalos crecientes— mientras las bandas fijas son solo una clasificación.

Regla: primer repaso al día siguiente; segundo repaso tres días después; a partir del tercero, el intervalo anterior se multiplica por un factor dependiente del nivel de dominio alcanzado, con tope máximo de sesenta días. A mayor dominio, mayor factor e intervalos más largos. Umbral de dominio suficiente para habilitar el avance: sesenta por ciento.

### Arquitectura funcional (§5.4.3)

Cuatro componentes: entrada de información; procesamiento y adaptación; generación de respuestas; seguimiento del aprendizaje.

### Propuesta de interfaz (§5.4.4, apartado nuevo)

Archivo de Figma *STIRE Soft — Sistema Visual*, clave `1MjKiDrjU65ezO3ztO0v4m`. Inventario verificado por consulta programática: **siete páginas y cincuenta y siete marcos de pantalla**.

| Página | Contenido | Marcos |
| --- | --- | --- |
| 🎨 Fundaciones | Sistema de color con tokens, anotado «WCAG 2.1 AA verificado» | 1 |
| 🔤 Iconos | Librería de doce iconos | 1 |
| 🧩 Ventana Estándar | Cabecera y un conjunto de componentes con tres variantes | 2 |
| 📱 Vistas — Estudiante | Seis vistas × cuatro estados, más inicio de sesión, registro y vista de trazado | 30 |
| 📋 Vistas — Docente | Seis vistas × tres estados | 18 |
| ⚙️ Vistas — Administrador | Tres vistas × tres estados | 9 |
| 🔗 Prototipo | Vacía | 0 |

Advertencia operativa: el listado automático de páginas del conector de Figma devuelve solo la primera página. Para obtener el inventario real hay que consultar `figma.root.children` mediante ejecución de código en el archivo.

**Vistas de estudiante.** EST-V01 Inicio, EST-V02 Lección, EST-V03 Ejercicio, EST-V04 Tutor IA en ventana modal, EST-V05 Repasos y EST-V06 Mi Progreso, cada una en cuatro estados: por defecto, vacío, error y completado. Existen además COMP-V00 Iniciar Sesión en cuatro estados, COMP-V00 Registro y un marco especial EST-V02 Lección — trazado paso 3.

**Contenido verificado de las cuatro vistas pedagógicamente decisivas.**

*EST-V02 — trazado paso 3.* Contenido teórico del ciclo `while`, bloque de código y trazado paso a paso con navegación «Paso 3 de 5». Responde de manera directa al hallazgo de que el treinta por ciento de la muestra no puede seguir el rastro mental de cómo se transforma una variable en cada iteración. Es el vínculo más fuerte entre diagnóstico y diseño en todo el trabajo.

*EST-V03 Ejercicio.* Enunciado «Suma de dos números», que corresponde al Ejercicio 1 de `Sesion2 recurso ejercicios.docx`; editor de código, casos de prueba con resultado individual aprobado o fallido, y acciones probar, entregar, pedir pista y reiniciar. Establece trazabilidad verificable entre el recurso del diagnóstico y la interfaz.

*EST-V04 Tutor IA.* Advertencia «Respuestas generadas por IA: verifícalas ejecutando tu algoritmo». Intercambio socrático: el estudiante pregunta «¿Cómo evito que mi while nunca termine?» y el tutor responde «Un ciclo while requiere: inicio, condición de parada y un paso. ¿Cuál de esos tres crees que falta en tu código?». Descompone en lugar de resolver, en coherencia con el acuerdo registrado en el diario del facilitador de la sesión 4.

*EST-V05 Repasos.* Los cuatro niveles de urgencia con razonamiento visible. Uno de los ítems dice «2.1 Decisión simple — Vence mañana — dominado hace 10 días, un repaso corto ahora consolida la memoria». Acciones: iniciar repaso, posponer con justificación y ver historial.

**Elementos transversales.** Encabezado con módulo actual, porcentaje de dominio y contador de repasos pendientes. Barra lateral con los módulos marcados como dominado, en progreso o bloqueado con candado, lo que confirma el aprendizaje por dominio con prerrequisitos. Pie con versión, autoguardado, accesibilidad y créditos.

**Tres decisiones de diseño destacables para el informe.** Primero, los estados combinan color con indicadores de forma, lo que hace la interfaz legible en escala de grises y para visión cromática atípica. Segundo, las acciones no implementadas llevan el rótulo «(propuesto)» y una vista advierte «Recomendaciones: backend pendiente», de modo que el propio diseño distingue lo propuesto de lo construido y refuerza el deslinde de alcance. Tercero, la advertencia sobre respuestas generadas por inteligencia artificial es material directo para el apartado de consideraciones éticas.

**Argumento central.** Los tokens `estado-unidad` (dominado, en progreso, por iniciar, bloqueado) y `urgencia-repaso` (al día, mañana, vencido, crítico) son la operacionalización visual del modelo pedagógico: el primero representa el aprendizaje por dominio con prerrequisitos, el segundo la agenda de repetición espaciada. El sistema visual es, por tanto, evidencia de que el modelo llegó a ser operacionalizado y no solo descrito.

**Pendientes del material visual.** Primero, las vistas DOC-V04 y DOC-V05 usan nombres de personas con correos institucionales —«Carlos Ruiz — carlos.ruiz@unicor.edu.co · Dominio 38%»—, lo que plantea un problema ético de aparente exposición de datos reales; deben sustituirse por identificadores genéricos antes de exportar. Las vistas de estudiante no presentan este problema. Segundo, las nueve vistas de administrador no corresponden a ninguna unidad de análisis de la investigación y no deben sustentar argumento en el cuerpo del informe.

**Corrección importante (verificado 2026-09-14 por inspección directa del archivo, no solo por conteo de páginas):** la afirmación anterior de que «la página Prototipo está vacía, sin flujo de navegación» era engañosa. Es cierto que esa página en particular no contiene nodos, pero el archivo ya tiene **139 interacciones de clic reales** (*reactions* de la API de Figma) conectando las pantallas entre sí: 43 en las vistas de estudiante (login/registro, navegación entre Inicio/Lección/Ejercicio/Tutor IA/Repasos/Progreso, apertura y cierre del modal del Tutor IA, transición al trazado paso a paso) y 96 en las de docente (menú lateral funcional entre las 6 vistas, presente también en sus estados vacío y error, más botones de reintento en cada estado de error). El prototipo interactivo ya existe y es navegable con el modo Presentar de Figma directamente sobre esas pantallas — lo que falta no es "el flujo", sino una figura/documento que lo muestre de forma legible para el informe, y opcionalmente organizar el subconjunto pedagógicamente relevante en la página "Prototipo" a modo de resumen visual, sin duplicar ni alterar las pantallas reales.

**Figuras seleccionadas para el cuerpo del §5.4.4.** En orden: EST-V02 con trazado paso a paso, EST-V04 Tutor IA, EST-V05 Repasos y DOC-V04 Rendimiento del Grupo. El catálogo completo va a un anexo. Las fundaciones de color van como tabla de correspondencia entre token y significado pedagógico, no como figura.

---

## 6. Reglas de redacción

Español académico formal, en tercera persona o impersonal; nunca primera persona del singular. Normas APA séptima edición, sin hipervínculos en el cuerpo del texto. Cada párrafo o idea nueva inicia con un conector textual que organice la lectura. Prosa continua; las viñetas se reservan para enumerar componentes o características.

Está prohibido inventar datos, cifras, porcentajes, citas textuales, autores, años, títulos, revistas o identificadores de objeto digital. Cuando se requiera respaldo teórico ausente de este documento, debe escribirse el marcador `[CITA PENDIENTE: tema]` y continuar. Cuando falte un dato, `[DATO PENDIENTE: qué falta]`. Esos marcadores existen para que las ausencias queden visibles en lugar de rellenarse con material verosímil pero falso, y deben buscarse y resolverse uno por uno antes de cualquier entrega.

**Nota añadida al organizar este bloque en el repositorio (2026-09-14):** antes de dejar un `[CITA PENDIENTE]` en cualquier entregable de este informe, revisar primero
[`docs/investigacion/MATRIZ_ARTICULOS_AMPLIADA.md`](MATRIZ_ARTICULOS_AMPLIADA.md) — contiene 27
obras reales, verificadas una por una contra Crossref/ERIC/OpenLibrary (no la matriz de 15 de
`MATRIZ_ARTICULOS.md`, que es un entregable de curso distinto). Varias son directamente
pertinentes al informe de investigación: Bloom (1968) para aprendizaje por dominio, Woźniak y
Gorzelańczyk (1994) y Cepeda et al. (2006) para el efecto de espaciamiento, Roediger y Karpicke
(2006) para práctica de recuperación, VanLehn (2011) y Koedinger y Aleven (2007) para el andamiaje
progresivo del tutor, Sorva (2013) para el trazado de memoria paso a paso, y Hattie y Timperley
(2007) para retroalimentación formativa. Usar esa matriz agota la posibilidad de respaldo real
antes de marcar una cita como pendiente.

---

## 7. Estado estructural del informe

Verificado sobre la versión modificada el 13 de septiembre de 2026. Cinco problemas pendientes de corrección (detalle completo de cada uno en `PLAN_ENTREGABLES_INFORME.md`, sección de arreglos):

1. Los apartados 5.4.1, 5.4.2 y 5.4.3 están duplicados. Las versiones nuevas quedaron escritas a continuación de las anteriores. Deben eliminarse las antiguas, que son las redactadas en indicativo.
2. El título «5.4.2 Modelo pedagógico preliminar propuesto» quedó como texto normal, no como encabezado, y por tanto no entra en la tabla de contenido.
3. No existe el numeral padre 5.4. Los tres subapartados cuelgan sin agrupador.
4. El numeral 5.3 está marcado al mismo nivel jerárquico que sus propios subapartados.
5. La numeración de figuras salta de la 4 a la 9. Además, las figuras 9, 10 y 11 se anuncian en el capítulo 4 pero el capítulo 5 no declara figuras para el 5.4, que es donde el modelo y la arquitectura deben mostrarse como resultado.

---

## 8. Ubicación de los archivos fuente

| Documento | Ubicación |
| --- | --- |
| Informe vigente | Raíz del proyecto (Drive), `Análisis y diseño actual.docx` |
| Plan de Intervención calificado | Raíz del proyecto y carpeta de contexto (Drive) |
| Análisis del test diagnóstico | Instrumentos/Sesion 2, `SESIÓN 2.docx` (Drive) |
| Ficha comparativa de plataformas | Instrumentos/Sesión 3 (Drive) |
| Diario del facilitador, sesión 4 | Sin carpeta, accesible solo por enlace (Drive) |
| Plantilla de diseño, sesión 5 | Sin carpeta, accesible solo por enlace (Drive) |
| Guía técnica, sesión 6 | Sin carpeta, accesible solo por enlace (Drive) |
| Formatos en blanco, sesiones 7 a 10 | Sin carpeta, accesibles solo por enlace (Drive) |
| Documentación técnica del backend | Carpeta «Google AI Studio», cuenta personal (Drive); también este repositorio |
| Sistema visual | Figma, *STIRE Soft — Sistema Visual*, clave `1MjKiDrjU65ezO3ztO0v4m` |
| Matriz bibliográfica canónica del proyecto (24-27 obras reales) | `docs/investigacion/MATRIZ_ARTICULOS_AMPLIADA.md` (este repositorio) |
| Fichas de lectura por obra | `docs/investigacion/fichas/` (este repositorio) |

Advertencia operativa: el buscador de Google Drive no indexa los archivos compartidos únicamente por enlace. Una carpeta que aparece vacía en una búsqueda puede no estarlo. Los instrumentos de las sesiones 4 a 10 existen pero no están archivados en ninguna carpeta del proyecto, y su única pista de localización es la hoja de cálculo `Plan de acción Mod 2026`.

---

*Verifica en la fuente original cualquier cita, dato o estadística de este documento antes de incorporarla de manera definitiva al informe final.*
