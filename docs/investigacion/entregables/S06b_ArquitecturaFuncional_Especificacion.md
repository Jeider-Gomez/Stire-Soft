---
estado:     borrador — pendiente de verificación contra fuente original antes de incorporar al informe
verificado: 2026-09-14
fuente:     entregable 03 de docs/investigacion/PLAN_ENTREGABLES_INFORME.md
codigos:    no aplica (investigación, no ventanas)
---

# S06b — Especificación de la arquitectura funcional preliminar

> **Versión legible (Google Doc, con tablas reales, los Gráficos A y B embebidos y el Producto 2
> ya ampliado a ≈870 palabras — actualizada 2026-09-14):**
> https://docs.google.com/document/d/1Wu56sMScdB67JzVSd6Y89p55c3ABXRIsktD7w-adsUU/edit
> — en la misma carpeta de Drive que `Análisis y diseño actual.docx`. Ver
> `PLAN_ENTREGABLES_INFORME.md` §7 para qué copiar de ahí y dónde pegarlo en el informe.

> Desarrolla `Sesion6_GuiaTecnica.docx` (11 mayo 2026); su sección 6 "Diagrama de arquitectura"
> está vacía. Va en **§5.4.3**, reemplazando/ampliando el texto que hoy describe los cuatro
> componentes sin tablas de entradas/salidas, sin flujo numerado y sin la correspondencia con las
> características del entregable 01.
>
> **Límite estricto (ver `CONTEXTO_STIRE.md` §2):** arquitectura *funcional*, no técnica. Nada de
> lenguajes, frameworks, motores de base de datos ni infraestructura.
>
> **Antes de pegar esto en el informe:** contrastar contra `SESIÓN 2.docx` y
> `MATRIZ_ARTICULOS_AMPLIADA.md` cualquier dato o cita que se reutilice de allí.

---

## Producto 1 — Especificación en ocho apartados

### 1. Propósito y alcance

La arquitectura funcional preliminar tendría el propósito de representar, a nivel conceptual, los
componentes que estructurarían el funcionamiento del tutor inteligente y la información que
circularía entre ellos, sin describir cómo se implementarían técnicamente. Su alcance se
limitaría a servir de base conceptual para una posible construcción futura del sistema; ninguno de
sus componentes habría sido desarrollado ni evaluado técnicamente dentro de esta investigación.

### 2. Los cuatro componentes

| Componente | Responsabilidad | Qué recibiría | Qué entregaría |
|---|---|---|---|
| **Entrada de información** | Recopilar los datos generados por la interacción del estudiante con el tutor. | Respuestas a actividades, tiempo empleado, solicitudes de ayuda, resultados de repasos, autopercepción declarada. | Un registro estructurado de esa interacción, disponible para el componente de procesamiento. |
| **Procesamiento y adaptación** | Analizar la información recibida para determinar el dominio, decidir el nivel de ayuda a escalar y calcular los intervalos de repetición espaciada. | El registro de interacción (de Entrada) y el historial de dominio/repasos previos (de Seguimiento). | Una decisión pedagógica (qué actividad recomendar, qué nivel de ayuda entregar, cuándo programar el próximo repaso) hacia Generación de respuestas, y una actualización de estado hacia Seguimiento. |
| **Generación de respuestas** | Traducir la decisión pedagógica en la respuesta concreta que recibiría el estudiante. | La decisión pedagógica de Procesamiento y adaptación. | Retroalimentación explicativa, pistas progresivas, recomendaciones o agenda de repaso, presentadas al estudiante mediante la interfaz. |
| **Seguimiento del aprendizaje** | Registrar y mantener el historial de dominio, repasos y desempeño de cada estudiante en el tiempo. | Las actualizaciones de estado generadas por Procesamiento y adaptación tras cada interacción. | El historial consultable (dominio, repasos pendientes, indicadores), tanto para alimentar futuras decisiones de Procesamiento como para mostrarse en la interfaz. |

### 3. Tabla de entradas

| Dato | Origen | Decisión que informaría |
|---|---|---|
| Respuesta a una actividad | El estudiante, al resolver un ejercicio | Determinar si la actividad se aprobaría y actualizar el dominio del concepto correspondiente |
| Tiempo empleado en la actividad | Registrado durante la interacción | Contribuir a distinguir un error operacional (lectura apresurada) de una dificultad conceptual (CAR-02) |
| Solicitud de ayuda | Acción explícita del estudiante durante una actividad | Activar el escalamiento del nivel de ayuda (S05b, apartado 5) |
| Resultado de un repaso programado | El estudiante, al completar una sesión de revisión | Recalcular el intervalo del siguiente repaso y decidir el retorno a práctica o exploración |
| Autopercepción declarada del nivel | El estudiante, de forma opcional en la etapa de exploración | Contrastarse con el desempeño real y ajustar la prioridad de contenidos sugeridos |

### 4. Tabla de salidas

| Respuesta | Condición que la dispararía | Necesidad diagnosticada que atendería |
|---|---|---|
| Retroalimentación explicativa | Tras cada intento de actividad | CAR-02 |
| Pista progresiva (uno de cuatro niveles) | El estudiante no resolvería correctamente tras un intento adicional, o solicitaría ayuda | CAR-03 |
| Recordatorio o agenda de repaso | Al alcanzarse la fecha programada de un repaso | CAR-04 |
| Indicador de dominio y progreso | De forma continua, disponible en la interfaz | CAR-05 |
| Recomendación personalizada de contenido o actividad | Al concluir una actividad o al iniciar una sesión | CAR-06 |
| Contenido priorizado según nivel de entrada | Al iniciar la etapa de exploración de una unidad | CAR-01 |

### 5. Flujo principal

1. El estudiante enviaría una respuesta a una actividad, o solicitaría iniciar un repaso programado.
2. El componente de entrada de información registraría la respuesta, el tiempo empleado y cualquier solicitud de ayuda asociada.
3. El componente de procesamiento y adaptación evaluaría la respuesta y, con el historial del componente de seguimiento, calcularía el nivel de dominio actualizado del concepto.
4. Si el dominio alcanzara el umbral de avance, el procesamiento decidiría el paso a la etapa siguiente; si no, decidiría si escalar el nivel de ayuda.
5. El componente de procesamiento calcularía, cuando correspondiera, el intervalo del próximo repaso según la regla de repetición espaciada (S05b, apartado 4).
6. El componente de generación de respuestas traduciría estas decisiones en retroalimentación, pista, recomendación o agenda de repaso concreta.
7. El componente de seguimiento del aprendizaje actualizaría el historial del estudiante con el nuevo estado de dominio y la fecha del próximo repaso.
8. La interfaz presentaría al estudiante la respuesta generada y el estado actualizado de su progreso.

### 6. Modelo de información conceptual

Entidades que el sistema necesitaría registrar, descritas en lenguaje natural (sin tipos de dato ni claves):

- **Estudiante** — su identificación dentro del curso, la autopercepción de nivel que hubiera declarado, y su historial general de progreso.
- **Unidad de aprendizaje** — el concepto o tema al que pertenecerían las actividades (por ejemplo, ciclos o acumuladores), su contenido teórico asociado y sus prerrequisitos.
- **Actividad** — el ejercicio o pregunta asociada a una unidad de aprendizaje, con su enunciado y el criterio para considerarla aprobada.
- **Intento** — cada vez que un estudiante resolviera una actividad: la respuesta dada, el resultado obtenido, el tiempo empleado y el nivel de ayuda alcanzado, si lo hubiera.
- **Progreso por concepto** — el nivel de dominio actual del estudiante sobre una unidad de aprendizaje, y la fecha del último cálculo.
- **Agenda de revisión** — los repasos programados para un estudiante y un concepto: la fecha prevista, el intervalo aplicado y el resultado del repaso más reciente.

### 7. Correspondencia característica → componente

| Característica | Componente principal | Componente de apoyo |
|---|---|---|
| CAR-01 Adaptación al nivel y ritmo | Procesamiento y adaptación | Entrada de información (provee los datos de partida) |
| CAR-02 Retroalimentación inmediata y explicativa | Generación de respuestas | Procesamiento y adaptación (decide el contenido) |
| CAR-03 Orientación mediante pistas progresivas | Generación de respuestas | Procesamiento y adaptación (decide el nivel de escalamiento) |
| CAR-04 Repetición espaciada | Procesamiento y adaptación (calcula el intervalo) | Seguimiento del aprendizaje (mantiene la agenda) |
| CAR-05 Seguimiento del dominio y del progreso | Seguimiento del aprendizaje | — |
| CAR-06 Recomendaciones personalizadas y motivación | Generación de respuestas | Procesamiento y adaptación (decide la recomendación) |

**Nota:** el componente "Entrada de información" no aparece como principal en ninguna fila porque
su función sería transversal — alimentaría de datos a los otros tres componentes en todos los
casos, sin "realizar" por sí sola ninguna característica específica.

### 8. Supuestos, restricciones y fuera de alcance

**Supuestos.** Se asumiría que el sistema tendría acceso continuo al historial de cada estudiante
entre sesiones, sin lo cual el componente de seguimiento no podría calcular el dominio acumulado
ni la agenda de repasos. Se asumiría que cada actividad tendría un criterio objetivo de aprobación,
verificable por el componente de procesamiento sin intervención humana adicional. Se asumiría que
la interfaz sería capaz de presentar al estudiante, de manera oportuna, tanto la respuesta generada
como el estado actualizado de su progreso.

**Restricciones.** La arquitectura no especificaría mecanismos de almacenamiento, comunicación
entre componentes, ni ningún aspecto de implementación técnica — se limitaría a lo funcional.
Ninguno de los cuatro componentes habría sido desarrollado ni evaluado técnicamente dentro del
alcance de esta investigación. Tampoco contemplaría escenarios de múltiples estudiantes
interactuando de forma simultánea ni cuestiones de desempeño a escala.

**Fuera de alcance.** Quedarían fuera de esta especificación: los mecanismos de autenticación y
seguridad, el diseño detallado de la interfaz gráfica (tratado en el entregable 04), la evaluación
automática de código en más de un lenguaje de programación, y cualquier componente de
gamificación o banco de preguntas reutilizable, por no derivarse de ninguna de las seis
características definidas en el entregable 01.

---

## Producto 2 — Texto para el informe (§5.4.3)

Como resultado del proceso de diseño, se propondría una arquitectura funcional preliminar
orientada a organizar los componentes que sostendrían el funcionamiento del tutor inteligente. Esta
arquitectura respondería directamente al objetivo específico 4 de la investigación —proponer la
arquitectura funcional del tutor como base para un posible prototipo en fases futuras— y se
limitaría a describir qué haría cada componente y qué información circularía entre ellos, sin
implicar que alguno de ellos hubiera sido desarrollado o evaluado técnicamente dentro del alcance
de esta investigación.

La arquitectura se organizaría en cuatro componentes. El componente de entrada de información
recopilaría los datos generados por la interacción del estudiante —respuestas, tiempo empleado,
solicitudes de ayuda y resultados de repasos— y los pondría a disposición del componente de
procesamiento y adaptación. Este último constituiría el núcleo de la propuesta: analizaría la
información recibida para determinar el nivel de dominio del estudiante en cada concepto,
decidiría cuándo escalar el nivel de ayuda ante una dificultad persistente, y calcularía el
intervalo del siguiente repaso según la regla de repetición espaciada especificada en el modelo
pedagógico preliminar. El componente de generación de respuestas traduciría esas decisiones en la
respuesta concreta que recibiría el estudiante —retroalimentación explicativa, una pista,
una recomendación o un aviso de repaso—, mientras que el componente de seguimiento del aprendizaje
mantendría el historial de dominio y de repasos de cada estudiante en el tiempo, alimentando tanto
las decisiones futuras de procesamiento como la información que se mostraría en la interfaz.

El flujo principal de esta arquitectura comenzaría cuando el estudiante enviara una respuesta a una
actividad o solicitara un repaso programado. Esa acción sería registrada por el componente de
entrada, evaluada por el componente de procesamiento —que recalcularía el dominio y decidiría,
según correspondiera, un ascenso de etapa, un escalamiento de ayuda o la programación de un
repaso—, traducida en una respuesta concreta por el componente de generación, y finalmente
reflejada en el historial del estudiante por el componente de seguimiento, que actualizaría el
estado presentado en la interfaz.

A nivel conceptual, la arquitectura contemplaría el registro de seis entidades: el estudiante, la
unidad de aprendizaje, la actividad, el intento de resolución, el progreso por concepto y la
agenda de revisión, descritas en términos de la información que contendrían y no de su
implementación. La Tabla correspondiente y la Figura del diagrama de componentes, presentadas a
continuación, mostrarían con mayor detalle esta organización, así como las tablas de entradas y
salidas del sistema.

Sostener este flujo requeriría registrar, a nivel conceptual, seis entidades. El estudiante
concentraría su identificación dentro del curso, la autopercepción de nivel que hubiera declarado
y su historial general de progreso. La unidad de aprendizaje representaría el concepto o tema al
que pertenecerían las actividades —por ejemplo, ciclos o acumuladores—, con su contenido teórico
asociado y sus prerrequisitos, en coherencia con el aprendizaje por dominio que estructura la etapa
de exploración del modelo pedagógico. La actividad correspondería al ejercicio o pregunta asociado
a una unidad, con su enunciado y el criterio para considerarla aprobada, mientras que el intento
registraría cada vez que un estudiante la resolviera: la respuesta dada, el resultado obtenido, el
tiempo empleado y el nivel de ayuda alcanzado, si lo hubiera. El progreso por concepto mantendría
el nivel de dominio actual del estudiante sobre una unidad y la fecha de su último cálculo, y la
agenda de revisión reuniría los repasos programados para un estudiante y un concepto —fecha
prevista, intervalo aplicado y resultado del repaso más reciente—, siendo esta última entidad la
que permitiría a Seguimiento del aprendizaje sostener en el tiempo la lógica de la repetición
espaciada especificada en el modelo pedagógico preliminar.

Finalmente, la arquitectura cerraría el círculo trazado desde el entregable de características: la
Tabla de correspondencia mostraría, para cada una de las seis características definidas en el
apartado 5.4.1, qué componente o componentes la soportarían, evidenciando que cada elemento de la
propuesta —desde el hallazgo diagnóstico hasta el componente funcional— permanecería trazable de
principio a fin.

Esta especificación, sin embargo, se sostendría sobre supuestos que valdría la pena declarar de
manera explícita. Se asumiría que el sistema tendría acceso continuo al historial de cada
estudiante entre sesiones, sin lo cual el componente de seguimiento no podría calcular el dominio
acumulado ni la agenda de repasos; que cada actividad tendría un criterio objetivo de aprobación,
verificable por el componente de procesamiento sin intervención humana adicional; y que la interfaz
sería capaz de presentar oportunamente tanto la respuesta generada como el estado actualizado del
progreso del estudiante. En consecuencia, quedarían fuera de esta especificación los mecanismos de
autenticación y seguridad, el diseño detallado de la interfaz gráfica —tratado en el entregable
siguiente—, la evaluación automática de código en más de un lenguaje de programación, y cualquier
componente de gamificación o banco de preguntas reutilizable, por no derivarse de ninguna de las
seis características ya definidas. Ninguno de los cuatro componentes aquí descritos, en suma,
habría sido desarrollado ni evaluado técnicamente dentro del alcance de esta investigación: lo que
esta arquitectura ofrecería sería una organización conceptual trazable, no una implementación.

*(≈870 palabras del cuerpo continuo, sin contar el pie de la figura del diagrama de componentes.)*

---

## Producto 3 — Especificación de los dos gráficos

> **Ambos gráficos producidos 2026-09-14** — Gráfico A en
> `docs/investigacion/figuras/S06b_grafico4_componentes.png`, Gráfico B (diagrama de secuencia)
> en `docs/investigacion/figuras/S06b_grafico5_secuencia.png`, ambos ya embebidos en el Google
> Doc de este entregable (enlace arriba). El paso 6 original ("Generación de respuestas →
> Interfaz → Estudiante") se dibujó como dos mensajes consecutivos (6 y 7) — notación estándar
> para un mensaje que pasa por un intermediario.

### Gráfico A — Diagrama de componentes y flujo

**Tipo:** diagrama de bloques con flechas rotuladas, cinco elementos: los cuatro componentes más la
interfaz de usuario (como quinto elemento, sin tratarlo como un componente funcional adicional).

**Disposición espacial recomendada:** interfaz de usuario arriba (punto de contacto con el
estudiante); debajo, en fila, Entrada de información → Procesamiento y adaptación → Generación de
respuestas; Seguimiento del aprendizaje debajo de Procesamiento y adaptación, con flechas
bidireccionales hacia él (le entrega historial, recibe actualizaciones).

**Flechas y su rótulo:** Interfaz → Entrada ("respuesta del estudiante"); Entrada → Procesamiento
("registro de interacción"); Procesamiento ↔ Seguimiento ("historial de dominio" / "actualización
de estado"); Procesamiento → Generación ("decisión pedagógica"); Generación → Interfaz
("retroalimentación, pista, recomendación o agenda").

**Restricción:** sin iconos de servidores, bases de datos ni ningún elemento que sugiera
infraestructura técnica.

### Gráfico B — Diagrama de secuencia simplificado (opcional)

**Participantes (en orden):** Estudiante, Interfaz, Entrada de información, Procesamiento y
adaptación, Seguimiento del aprendizaje, Generación de respuestas.

**Mensajes (seis pasos):**
1. Estudiante → Interfaz: envía respuesta a la actividad.
2. Interfaz → Entrada de información: registra el intento.
3. Entrada de información → Procesamiento y adaptación: transmite el registro.
4. Procesamiento y adaptación → Seguimiento del aprendizaje: consulta historial y actualiza dominio.
5. Procesamiento y adaptación → Generación de respuestas: transmite la decisión pedagógica.
6. Generación de respuestas → Interfaz → Estudiante: entrega la retroalimentación.

---

## Cómo esto actualiza el entregable 01

La tabla del apartado 7 (arriba) resuelve la columna 7, pendiente en
`S05a_MatrizTrazabilidad_Caracteristicas` — ver esa actualización aplicada en ese archivo y en su
Google Doc correspondiente.

## Pendientes de este entregable

- ~~Ampliar el Producto 2 al rango de 800-1000 palabras solicitado.~~ **Resuelto 2026-09-14** — ≈870 palabras.
- ~~Construir el Gráfico B.~~ **Resuelto 2026-09-14** — ver Producto 3.
- **Decisión pendiente del dueño del proyecto (no un pendiente de redacción):** incluir el Gráfico B en el cuerpo del informe, o dejarlo solo como evidencia de este entregable. Recomendación: dejarlo fuera del cuerpo — el Gráfico A ya cubre el flujo principal, y el diagrama de secuencia repite la misma información en otra notación sin sustentar una característica nueva.
