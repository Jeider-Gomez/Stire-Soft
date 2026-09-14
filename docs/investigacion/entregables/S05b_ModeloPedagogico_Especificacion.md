---
estado:     borrador — pendiente de verificación contra fuente original antes de incorporar al informe
verificado: 2026-09-14
fuente:     entregable 02 de docs/investigacion/PLAN_ENTREGABLES_INFORME.md
codigos:    no aplica (investigación, no ventanas)
---

# S05b — Especificación del modelo pedagógico preliminar

> **Versión legible (Google Doc, con tablas reales, los Gráficos A y B embebidos y el Producto 2
> ya ampliado a ≈1010 palabras — actualizada 2026-09-14):**
> https://docs.google.com/document/d/1kcyjU9BjkEoLBaKZehBn86fHM9fVgFVAko8bMUhqtfc/edit
> — en la misma carpeta de Drive que `Análisis y diseño actual.docx`. Ver
> `PLAN_ENTREGABLES_INFORME.md` §7 para qué copiar de ahí y dónde pegarlo en el informe.

> Desarrolla `Sesion5_PlantillaDiseno.docx` (8 mayo 2026), que ya tiene las tres etapas pero no la
> regla de decisión. Va en **§5.4.2**, reemplazando/ampliando el texto que hoy describe las tres
> etapas sin criterio de salida ni mecanismo explícito de repetición espaciada (confirmado contra
> el documento real el 2026-09-14 — ver `PLAN_ENTREGABLES_INFORME.md` §2).
>
> **Antes de pegar esto en el informe:** contrastar cada dato del diagnóstico citado aquí contra
> `SESIÓN 2.docx`, y cada cita bibliográfica contra `MATRIZ_ARTICULOS_AMPLIADA.md`.

---

## Producto 1 — Especificación en siete apartados

### 1. Fundamento teórico

El modelo se apoyaría en tres cuerpos teóricos convergentes, cada uno pertinente a un hallazgo
distinto del diagnóstico. El **aprendizaje por dominio** (*mastery learning*), formulado
originalmente por Bloom (1968), sostendría que un estudiante debería demostrar un nivel suficiente
de comprensión de un concepto antes de avanzar al siguiente, en lugar de avanzar por tiempo fijo
de instrucción — principio directamente pertinente al hallazgo de que el 35% de la muestra ingresó
sin conocimiento previo de programación y once estudiantes con autopercepción de nivel medio
obtuvieron en el test STIRE un promedio de apenas 5.27/7: avanzar por calendario, sin verificar
dominio real, dejaría a esa parte de la cohorte sin la base necesaria para las unidades
siguientes. El **efecto de espaciamiento**, cuya base matemática para el cálculo de intervalos
crecientes fue propuesta por Woźniak y Gorzelańczyk (1994) y cuya evidencia como fenómeno de
memoria fue consolidada en el metaanálisis de Cepeda et al. (2006), respondería directamente al
hallazgo de que los conceptos de secuenciación, ciclos y acumuladores concentraron el mayor número
de fallas del diagnóstico, y de que solo una fracción menor de esos errores se debió a un olvido
puro del concepto: el espaciamiento actuaría precisamente sobre el aprendizaje ya practicado pero
todavía frágil, no sobre el desconocimiento inicial. Finalmente, la **práctica de recuperación**
(Roediger y Karpicke, 2006) respaldaría por qué cada repaso programado debería consistir en que el
estudiante resuelva de nuevo una actividad, y no en que relea una explicación: recuperar la
información desde la memoria, y no solo revisarla, sería lo que consolidaría el aprendizaje a
largo plazo.

### 2. Objetivos de aprendizaje del tutor

El tutor buscaría que el estudiante llegara a:

1. Reconocer los componentes de una secuencia algorítmica (entrada, proceso, salida) sin omitir
   pasos por asumirlos implícitos.
2. Aplicar correctamente las estructuras de control condicionales y repetitivas en problemas de
   complejidad creciente.
3. Trazar mentalmente la transformación de una variable a través de las iteraciones de un ciclo.
4. Transferir una estructura de control ya practicada a un contexto de problema distinto al
   original.
5. Sostener en el tiempo el dominio de los conceptos ya practicados, mediante la participación en
   las revisiones programadas.
6. Regular de manera progresivamente más autónoma su propio proceso de resolución, apoyándose cada
   vez menos en los niveles de ayuda del tutor.

### 3. Las tres etapas, con criterio de salida

| Etapa | Propósito | Actividades del estudiante | Rol del tutor | Criterio de salida |
|---|---|---|---|---|
| **1. Exploración** | Presentar o reactivar el contenido teórico de un concepto antes de la práctica. | Revisar el contenido teórico y los ejemplos asociados al concepto; opcionalmente, autoevaluar su nivel de partida. | Priorizar y organizar los contenidos según el nivel de dominio previo registrado para ese concepto, si existiera. | El estudiante habría accedido al contenido mínimo asociado al concepto, evento que el sistema registraría, habilitando el acceso a las actividades de práctica de esa unidad. |
| **2. Práctica y retroalimentación** | Aplicar el concepto mediante actividades, con retroalimentación y pistas progresivas. | Resolver actividades de la unidad; solicitar ayuda cuando encuentre dificultad. | Evaluar cada intento, generar retroalimentación explicativa y escalar el nivel de ayuda si el error persiste (ver apartado 5). | El nivel de dominio calculado para el concepto alcanzaría el umbral de avance (60%, ya definido en la propuesta), momento en el que el sistema decidiría el paso a la etapa de dominio y revisión. |
| **3. Dominio y revisión** | Verificar el dominio alcanzado y programar los repasos espaciados necesarios. | Participar en las sesiones de repaso cuando el sistema las presente. | Calcular el intervalo del próximo repaso según la regla del apartado 4, y decidir si el estudiante permanece en el ciclo de repasos, retorna a práctica o retorna a exploración. | No habría una salida definitiva mientras el concepto siga activo en la agenda de repaso: el ciclo se sostendría con intervalos crecientes hasta alcanzar el tope máximo sin fallar, lo que se interpretaría como consolidación a largo plazo. |

Las tres etapas no representarían una secuencia estrictamente lineal: desde la etapa de dominio y
revisión existiría un camino de retorno hacia la práctica cuando un repaso mostrara un dominio
insuficiente, y un camino de retorno hacia la exploración cuando el desempeño en el repaso
sugiriera que el concepto se habría olvidado de manera sustancial, no solo debilitado (ver
especificación del Gráfico A, Producto 3).

### 4. Especificación de la repetición espaciada

**Variables que se registrarían** por cada concepto y estudiante: nivel de dominio actual,
número de repasos completados, fecha e intervalo del último repaso, resultado del último repaso
(aprobado o no aprobado) y fecha programada del próximo repaso.

**Regla de cálculo del intervalo** (decisión ya adoptada, ver `CONTEXTO_STIRE.md` §5): el primer
repaso se programaría un día después de alcanzado el dominio; el segundo, tres días después del
primero; a partir del tercero, el intervalo anterior se multiplicaría por un factor dependiente
del nivel de dominio alcanzado en ese repaso, con un tope máximo de 60 días.

`[DATO PENDIENTE: los tres niveles de dominio y sus factores multiplicadores que siguen son una
propuesta de diseño para esta especificación, no un valor medido ni validado empíricamente —
señalado explícitamente como supuesto en el apartado 7]`. Se proponen tres bandas, ancladas al
umbral de avance ya definido (60%): dominio bajo (por debajo de 60%, aunque en ese caso el
estudiante permanecería en práctica y no llegaría a esta etapa salvo que el dominio cayera después
de un repaso), dominio medio (60% a 84%) y dominio alto (85% o más), con factores propuestos de
1.3, 1.8 y 2.5 respectivamente — a mayor dominio, mayor factor y por tanto intervalos más largos.

Tabla de progresión para tres niveles de dominio, seis repasos consecutivos, redondeando cada
intervalo al día entero antes de aplicar el siguiente factor:

| Repaso | Dominio bajo (factor 1.3) | Dominio medio (factor 1.8) | Dominio alto (factor 2.5) |
|---|---|---|---|
| 1 | 1 día | 1 día | 1 día |
| 2 | 3 días | 3 días | 3 días |
| 3 | 4 días | 5 días | 8 días |
| 4 | 5 días | 9 días | 20 días |
| 5 | 7 días | 16 días | 50 días |
| 6 | 9 días | 29 días | 60 días *(tope aplicado)* |

**Condiciones que dispararían un repaso anticipado**, independientemente del intervalo calculado:
que el estudiante solicite voluntariamente repasar un concepto (mecanismo de autopercepción ya
contemplado en la propuesta de interfaz), o que un intento reciente en una actividad relacionada
muestre una caída relevante de desempeño respecto al dominio registrado para ese concepto.

**Tope máximo (60 días) y su justificación pedagógica:** más allá de ese plazo, un intervalo mayor
raramente llegaría a aplicarse dentro de la duración de un semestre académico, y extenderlo further
arriesgaría dejar un concepto sin ningún refuerzo durante un período demasiado extenso frente al
beneficio adicional que la literatura del espaciamiento reportaría (Cepeda et al., 2006).

### 5. Escalamiento de la ayuda

Cuatro niveles, en orden creciente de explicitud:

1. **Pregunta orientadora** — el tutor formularía una pregunta que dirigiera la atención del
   estudiante hacia el paso omitido o el error, sin señalarlo directamente.
2. **Pista parcial** — el tutor indicaría la sección del procedimiento donde probablemente se
   encuentra el error, sin señalar la corrección exacta.
3. **Ejemplo análogo resuelto** — el tutor presentaría un problema similar ya resuelto paso a
   paso, sin resolver directamente el ejercicio del estudiante.
4. **Explicación completa** — el tutor explicaría la solución del ejercicio, marcando el punto de
   aprendizaje.

El paso de un nivel al siguiente se activaría cuando el estudiante, tras un intento adicional, no
lograra corregir su procedimiento o solicitara explícitamente más ayuda. Este escalamiento
respondería al *assistance dilemma* descrito por Koedinger y Aleven (2007) y a los hallazgos de
VanLehn (2011): entregar la solución de inmediato reduciría el aprendizaje profundo, mientras que
no ofrecer ninguna ayuda ante una dificultad persistente favorecería el abandono de la actividad;
el escalamiento gradual evitaría ambos extremos.

### 6. Indicadores de seguimiento

| Indicador | Decisión pedagógica que habilitaría |
|---|---|
| Nivel de dominio por concepto | Si el estudiante avanzaría a un nuevo concepto o permanecería en práctica. |
| Repasos completados frente a programados | Si el estudiante estaría al día o atrasado en su agenda de repetición espaciada. |
| Nivel de ayuda promedio alcanzado por actividad | Si un concepto requeriría revisar el contenido de exploración, y no solo más práctica, cuando el promedio se acercara sistemáticamente al nivel 4. |
| Tiempo transcurrido desde el repaso vencido | La urgencia que se mostraría al estudiante (al día, mañana, vencido, crítico). |
| Frecuencia de repasos anticipados solicitados por el propio estudiante | Si la autopercepción del estudiante se ajustaría o no a su desempeño real — dato vinculado directamente al hallazgo diagnóstico de contraste entre autopercepción y desempeño. |

### 7. Supuestos y limitaciones

**Supuestos.** Se asumiría que el estudiante interactuaría con el tutor con una frecuencia mínima
suficiente para que el mecanismo de repetición espaciada tuviera oportunidad de aplicarse. Se
asumiría que el desempeño registrado en cada intento reflejaría razonablemente su nivel de
comprensión, y no respondería de manera sistemática a factores externos no observables por el
sistema. Se asumiría, además, que los cuatro niveles de ayuda cubrirían el rango de dificultad de
las actividades de fundamentos de algoritmia del curso, sin requerir niveles adicionales.

**Limitaciones.** El modelo no habría sido aplicado ni evaluado empíricamente con estudiantes
reales dentro del alcance de esta investigación; los factores multiplicadores y las bandas de
dominio propuestos en el apartado 4 corresponderían a una decisión de diseño, no al resultado de
una medición. El modelo tampoco contemplaría diferencias individuales más allá del dominio y el
historial de repasos —como el estilo de aprendizaje o la carga académica simultánea de otras
asignaturas—, que podrían influir igualmente en el ritmo apropiado de repaso. Finalmente, la regla
de cálculo del intervalo dependería de contar con al menos un intento previo por concepto, de modo
que un concepto completamente nuevo no tendría todavía datos de dominio sobre los cuales calcular
un intervalo hasta completar su primer ciclo de exploración y práctica.

---

## Producto 2 — Texto para el informe (§5.4.2)

A partir de las necesidades identificadas durante el diagnóstico y del análisis de tutores
inteligentes existentes, se estructuraría un modelo pedagógico preliminar orientado a organizar el
aprendizaje de los fundamentos de algoritmia mediante tres mecanismos convergentes: la adaptación
al nivel del estudiante, la retroalimentación explicativa y la repetición espaciada. A diferencia
de una descripción general de buenas prácticas, el modelo precisaría el umbral de dominio que
habilitaría el avance, la regla exacta de cálculo de los intervalos de repaso y las condiciones
que activarían cada transición, de modo que cada decisión del tutor pudiera trazarse hasta una
regla explícita y no a un criterio implícito.

El fundamento del modelo se apoyaría en tres cuerpos teóricos. Primero, el aprendizaje por dominio
propuesto por Bloom (1968), según el cual un estudiante debería demostrar comprensión suficiente
de un concepto antes de avanzar, respondería al hallazgo de que una parte relevante de la cohorte
ingresó sin experiencia previa en programación y mostró, en el test diagnóstico, una brecha entre
su autopercepción y su desempeño real. Segundo, el efecto de espaciamiento, cuya base matemática
para calcular intervalos crecientes fue propuesta por Woźniak y Gorzelańczyk (1994) y cuya
evidencia como fenómeno de retención fue sintetizada por Cepeda et al. (2006), respondería a que
los conceptos con más fallas del diagnóstico —secuenciación, ciclos y acumuladores— reflejarían un
aprendizaje inicial frágil más que un desconocimiento total, y por tanto requerirían consolidación
en el tiempo antes que una única explicación adicional. Tercero, la práctica de recuperación
descrita por Roediger y Karpicke (2006) justificaría que cada repaso consistiera en resolver de
nuevo una actividad, en lugar de releer contenido ya visto.

El modelo se organizaría en tres etapas no estrictamente lineales. La etapa de exploración
presentaría el contenido teórico de un concepto y concluiría cuando el estudiante lo hubiera
revisado, habilitando el acceso a la práctica. La etapa de práctica y retroalimentación permitiría
resolver actividades con retroalimentación inmediata y pistas progresivas, y concluiría cuando el
dominio calculado alcanzara el umbral de avance del 60%. La etapa de dominio y revisión no tendría
una salida definitiva mientras el concepto permaneciera activo en la agenda de repaso: en ella se
calcularía el intervalo del siguiente repaso y, cuando el desempeño en un repaso resultara
insuficiente, el estudiante retornaría a la etapa de práctica; si el desempeño sugiriera que el
concepto se habría olvidado de manera sustancial, el retorno sería hacia la exploración.

El mecanismo de repetición espaciada seguiría una progresión multiplicativa y no bandas fijas de
clasificación, por corresponder de manera más directa al efecto de espaciamiento —intervalos
crecientes— documentado en la literatura. El primer repaso se programaría un día después de
alcanzado el dominio; el segundo, tres días después; a partir del tercero, el intervalo anterior
se multiplicaría por un factor dependiente del nivel de dominio alcanzado, con un tope máximo de
60 días, de modo que un estudiante con menor dominio repasaría con mayor frecuencia que uno con
mayor dominio. La tabla de progresión y la figura correspondiente, presentadas a continuación,
mostrarían esta diferencia de manera concreta para tres niveles de dominio a lo largo de seis
repasos.

Complementariamente, el tutor escalaría su nivel de ayuda en cuatro pasos —pregunta orientadora,
pista parcial, ejemplo análogo resuelto y explicación completa— ante una dificultad persistente,
en lugar de ofrecer de inmediato la solución completa o dejar al estudiante sin ninguna
orientación. Esta decisión respondería al *assistance dilemma* descrito por Koedinger y Aleven
(2007): la ayuda entregada demasiado pronto reduciría el aprendizaje profundo, mientras que su
ausencia ante una dificultad sostenida favorecería el abandono de la actividad.

Para que estas decisiones fueran verificables y no solo declaradas, el modelo especificaría cinco
indicadores de seguimiento. El nivel de dominio por concepto habilitaría la decisión de avanzar o
permanecer en práctica; la proporción de repasos completados frente a los programados indicaría si
el estudiante estaría al día o atrasado en su agenda de repetición espaciada; el nivel de ayuda
promedio alcanzado por actividad señalaría si un concepto requeriría revisar el contenido de
exploración y no solo más práctica, cuando ese promedio se acercara de manera sistemática al nivel
más explícito de ayuda; el tiempo transcurrido desde un repaso vencido determinaría la urgencia
mostrada al estudiante; y la frecuencia con que el propio estudiante solicitara repasos anticipados
permitiría contrastar su autopercepción con su desempeño real, dato vinculado de manera directa al
hallazgo diagnóstico de esa misma brecha. Ninguno de estos indicadores sustituiría el registro de
las variables base del apartado 4 —dominio actual, repasos completados, fecha e intervalo del
último repaso, resultado del último repaso y fecha del próximo—; los complementaría al traducirlas
en decisiones concretas.

El modelo, en su conjunto, constituiría una propuesta preliminar de organización pedagógica, sin
que ninguno de sus componentes hubiera sido desarrollado ni evaluado técnicamente dentro del
alcance de esta investigación. Esta limitación no sería incidental: los factores multiplicadores y
las bandas de dominio bajo, medio y alto que gobernarían la progresión de los intervalos
corresponderían a una decisión de diseño de esta especificación, no al resultado de una medición
con estudiantes reales, y el modelo tampoco contemplaría diferencias individuales —como el estilo
de aprendizaje o la carga académica simultánea de otras asignaturas— que podrían influir igualmente
en el ritmo apropiado de repaso. Declarar esta limitación de manera explícita respondería al mismo
deslinde de alcance que rige el resto de la propuesta: lo que el modelo ofrecería no sería una
regla validada empíricamente, sino una organización pedagógica trazable, cuya especificación
completa —variables registradas, indicadores de seguimiento y supuestos declarados— serviría como
base para la arquitectura funcional preliminar presentada en el apartado siguiente.

*(≈1010 palabras del cuerpo continuo, sin contar los encabezados de figura/tabla; ajustar con los
pies de las dos figuras si se requiere llegar al límite superior del rango de 900-1200 palabras
solicitado.)*

---

## Producto 3 — Especificación de los dos gráficos

> **Producidos 2026-09-14.** Ambos gráficos ya existen como imagen
> (`docs/investigacion/figuras/S05b_grafico2_ciclo.png` y `S05b_grafico3_progresion.png`) y ya
> están embebidos en el Google Doc de este entregable (enlace arriba). La especificación que
> sigue documenta cómo se construyeron, para trazabilidad.

### Gráfico A — El ciclo de las tres etapas

**Tipo:** diagrama de flujo cíclico, tres nodos principales dispuestos en triángulo o en línea con
retorno.

**Nodos:** "1. Exploración", "2. Práctica y retroalimentación", "3. Dominio y revisión" — mismo
tamaño y tratamiento visual entre sí.

**Flechas de avance** (línea continua, en el sentido 1→2→3): rotuladas con el criterio de salida
de cada etapa — de Exploración a Práctica: "contenido revisado"; de Práctica a Dominio y revisión:
"dominio ≥ 60%".

**Flechas de retorno** (línea discontinua, explícitas, no omitir): de "3. Dominio y revisión" de
vuelta a "2. Práctica y retroalimentación", rotulada "dominio insuficiente en el repaso"; de "3.
Dominio y revisión" de vuelta a "1. Exploración", rotulada "concepto olvidado de forma sustancial".

**Restricción:** sin iconos decorativos; las tres flechas de retorno y avance deben distinguirse
por el trazo (continuo/discontinuo), no solo por el color, para mantenerse legibles en escala de
grises.

### Gráfico B — Progresión de intervalos de repaso

**Tipo:** gráfico de líneas.

**Eje horizontal:** número de repaso (1 a 6).

**Eje vertical:** días hasta el siguiente repaso (escala que llegue al menos a 60).

**Series:** tres, una por nivel de dominio (bajo, medio, alto), con los valores exactos de la
tabla del Producto 1, apartado 4. Distinguir las series por trazo (sólido, discontinuo, punteado)
además de color, para legibilidad en escala de grises.

**Lo que el lector debería concluir en cinco segundos:** que las tres series parten del mismo
punto (repasos 1 y 2 coinciden para los tres niveles) y luego se separan de forma creciente, con
la serie de dominio alto llegando primero al tope de 60 días — es decir, que el mecanismo repasa
con más frecuencia a quien domina menos, y no al revés.

---

## Pendientes de este entregable

- `[DATO PENDIENTE: validar o ajustar los factores 1.3/1.8/2.5 y las bandas de dominio bajo/medio/alto propuestos en el apartado 4]` — son una decisión de diseño de esta especificación, declarada como tal en el apartado 7 de supuestos y limitaciones, no un valor medido. Esto no es un pendiente de redacción: queda así intencionalmente, y solo se "resolvería" si el dueño del proyecto decidiera medir o cambiar esos valores.
- ~~Ajustar la extensión del Producto 2 al rango de 900-1200 palabras solicitado.~~ **Resuelto 2026-09-14** — ≈1010 palabras.
- ~~Verificar que el criterio de salida de la etapa 2 (dominio ≥ 60%) no entre en conflicto con el resto del informe.~~ **Verificado 2026-09-14** contra `Análisis y diseño actual.docx` real: el término "umbral" y la cifra "60%" no aparecen en ningún otro punto del documento todavía, así que no hay ningún valor en conflicto que resolver antes de insertar esta especificación.
