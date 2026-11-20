# Simulación de un docente y 30 estudiantes · 20 de noviembre de 2026

**Qué es:** un docente simulado crea dos clases desde cero copiando el curso de Fundamentos de Algoritmia
(ALGO-203413), y 30 estudiantes simulados (15 en cada clase) recorren las 6 primeras lecciones haciendo lo que STIRE
les recomienda. Todo pasa por la API, como en la app. **No es una prueba con personas**: sirve para comprobar el
sistema antes de la prueba piloto, y sus números no se pueden presentar como resultados con estudiantes.

- Script: `scripts/simulacion/docente-y-estudiantes.ts` (semilla `20261121`; con la misma semilla sale lo mismo).
- Datos completos: `resultados-20261121.json` (cada estudiante, cada competencia, lo que vio el docente).
- Servidor: el compilado, contra la base de pruebas `stire_pruebas_local`, en el portátil de 8 GB. Duró 5,9 minutos.

## 1. Cómo se hizo

**El docente** (`docente.demo@stire.local`):

1. Crea la clase A (`SIM-1121-A`) y la clase B (`SIM-1121-B`) copiando su curso.
2. Publica los módulos copiados, porque la copia llega sin publicar (ver hallazgo 2).
3. Pone las competencias de la clase A en «recomendar» y las de la B en «informar» (solo ver).
4. Al final mira la pantalla de competencias de cada clase.

**Cada estudiante simulado** tiene una habilidad oculta por competencia, que el sistema no conoce:

- Al crearlo se elige qué tan fuerte llega (entre 0,2 y 0,8), y cada competencia varía alrededor de ese número.
- Probabilidad de acertar un ejercicio = la media de su habilidad en las competencias del ejercicio, menos un peso
  por dificultad (básico 0, intermedio 0,15, avanzado 0,3) y menos un descuido propio (hasta 0,08).
- Practicar enseña: tras cada intento, su habilidad sube un poco (más si acertó).
- Se registra, entra con el código, abre cada lección y hace el ejercicio que STIRE le recomienda, hasta 10 pasos por
  lección. Se detiene si STIRE dice que terminó la lección, le propone una pausa o le vuelve a dar el mismo ejercicio.
- Los mismos 15 perfiles se usan en las dos clases, para que la diferencia entre A y B venga del modo y no de los
  estudiantes.

Como se conoce la habilidad real de cada estudiante, se puede comparar con el nivel que STIRE calcula con la ecuación
de Toscano, `Nivel = (logrados + 1) / (posibles + 2)`. Esa es la razón de simular: con personas eso no se puede medir.

## 2. Hallazgos

### Hallazgo 1 (grave, ya arreglado): con 10 entregas a la vez, el servidor se colgaba

En la primera corrida (semilla `20261120`) el servidor dejó de responder después de 157 entregas. Todo pedido que
tocara la base se quedaba esperando sin respuesta, incluido el inicio de sesión del docente.

- **Causa:** al entregar, la conexión de la transacción quedaba tomada después de guardar, mientras corrían los avisos
  de «entrega calificada» (dominio, repasos, competencias) y el juez de código, que piden otras conexiones. El servidor
  tiene 10 conexiones; con 10 entregas a la vez, las 10 quedaban tomadas esperando una undécima que nunca llegaba.
- **Comprobación:** MariaDB mostraba las 10 conexiones de la base de pruebas quietas, sin ninguna transacción abierta.
- **Arreglo:** commit `9434c21`. La conexión se suelta justo después de guardar. Tiene 3 pruebas nuevas, y las 2
  principales fallan sin el arreglo.
- **Resultado:** la segunda corrida (esta) terminó sin cuelgues: 913 entregas en 5,9 minutos.
- **Por qué la prueba de estrés de noviembre no lo vio:** muy probablemente porque, al agregar las competencias, el
  aviso de «entrega calificada» pasó a hacer más trabajo en la base. Es una hipótesis, no está comprobada.
- **Pendiente:** el arreglo está en `main`, pero **el servidor de Azure no lo tiene hasta desplegarlo**. Mientras
  tanto, una clase que entregue al mismo tiempo (un quiz en el aula) podría colgarlo.

### Hallazgo 2 (arreglado): la clase copiada llega sin publicar y nadie se lo dice al docente

En la primera prueba del script los estudiantes no hicieron ninguna entrega: entraban a la clase y no veían
lecciones. La copia deja los módulos sin publicar (es lo correcto, para que el docente los revise), pero el aviso
«Clase creada» no lo decía.

- **Arreglo:** commit `83e345f`. El aviso ahora dice que lo copiado está sin publicar y que se publica en «Contenido».

### Hallazgo 3: el nivel de la ecuación va detrás de lo que el estudiante ya sabe

| Medida (270 pares estudiante y competencia con intentos) | Valor |
|---|---|
| Correlación entre el nivel calculado y la habilidad real (r de Pearson) | **0,46** (0,52 con más de 3 intentos) |
| Error medio (diferencia en valor absoluto) | **0,19** |
| Sesgo medio (calculado menos real) | **−0,15**: lo subestima en 211 de 270 casos |
| Mismo estado en los dos («En camino», «Lo hace», «Lo domina») | **43 %** |

- De los 79 casos en que el estudiante ya «lo domina» de verdad, STIRE dice «Lo domina» en 11 y «Lo hace» en 58.
- **Por qué:** la ecuación suma todos los intentos desde el principio, incluidos los fallos de cuando todavía no
  sabía. Como en la simulación los estudiantes aprenden mientras practican, el nivel queda detrás de lo que ya saben.
  Es justo lo que hace un promedio de toda la historia.
- Una parte del sesgo viene de la propia simulación: se compara con la habilidad final, la de después de aprender.
- **Qué significa para STIRE:** la ecuación es prudente. Casi nunca dice que alguien domina algo que no domina (13 de
  191 casos en que no lo domina), pero tarda en reconocer a quien mejoró.
- **Posible mejora, para decidirla con Toscano:** dar más peso a los intentos recientes, por ejemplo contar solo los
  últimos 10 intentos de cada competencia, o que el estudiante pueda «demostrar» que ya lo domina con un reto. No se
  cambió nada: la ecuación es la que pidió Toscano.

### Hallazgo 4: «recomendar» y «solo ver» casi no se diferencian en 6 lecciones

| Por estudiante (media) | A · recomendar | B · solo ver |
|---|---|---|
| Entregas | 31,1 | 29,8 |
| Aprobadas | 17,7 | 17,6 |
| Tasa de aprobación | 58 % | 60 % |
| Lecciones terminadas (de 6) | 3,8 | 3,8 |
| Lecciones donde STIRE propuso una pausa o repetir | 2,2 | 2,2 |
| Habilidad final | 0,70 | 0,69 |

- Los motivos de cada recomendación también son casi iguales (A: 275 «siguiente», 49 «hermana», 16 «sube de nivel»;
  B: 272, 45 y 19).
- **Por qué:**
  - En las primeras lecciones casi todos los ejercicios cuentan para las mismas 2 o 3 competencias, así que elegir
    «por la competencia más baja» elige casi siempre el mismo ejercicio que el orden normal.
  - El banco tiene muy pocos ejercicios intermedios y avanzados en esas competencias (ver hallazgo 5), así que no hay
    mucho entre qué elegir.
- **Para el artículo:** con esta muestra no se puede decir que recomendar por competencias mejore el aprendizaje.
  Hacen falta más lecciones, más semillas y una prueba con personas.

### Hallazgo 5: al banco le faltan ejercicios intermedios y avanzados

Lo que el docente ve por competencia (cantidad de ejercicios básicos / intermedios / avanzados en el curso copiado):

| Competencia | Banco | Competencia | Banco |
|---|---|---|---|
| Pasos precisos y en orden | 14 / 0 / 0 | Leer los datos que entran | 21 / 12 / 4 |
| Descomponer el problema | 8 / 0 / 0 | Mostrar resultados | 17 / 4 / 0 |
| Pseudocódigo y diagramas | 8 / 0 / 0 | Decidir con condicionales | 6 / 10 / 2 |
| Asignación simple | 16 / 2 / 0 | Repetir con ciclos | 10 / 6 / 0 |
| Constantes y variables | 10 / 0 / 0 | Contar y acumular | 4 / 6 / 0 |
| Tipos de datos y conversión | 10 / 1 / 0 | Funciones | 0 / 8 / 0 |
| Operadores y orden | 6 / 2 / 0 | Arreglos y posiciones | 2 / 4 / 2 |

- En 5 competencias no hay ni un ejercicio intermedio, así que «sube de nivel» no tiene a dónde llevar a nadie.
- «Funciones» no tiene ninguno básico.
- Esto apoya la recomendación 1 de Toscano (desagregar los ejercicios en una escalera de dificultad). Es justo el
  trabajo que el Asistente del docente podría proponer: «Operadores y orden solo tiene ejercicios básicos».

### Hallazgo 6: lo que ve el docente

- La pantalla de competencias de cada clase señala bien la competencia más baja: «Leer los datos que entran» en las
  dos. En la clase A hay 11 estudiantes «En camino» en ella, con sus nombres.
- Las competencias de lecciones que nadie ha empezado salen como «Sin evidencia», sin porcentaje. Es correcto; la
  ecuación daría 50 % y la pantalla no lo muestra.

## 3. Limitaciones

- El modelo del estudiante es inventado: cómo acierta y cómo aprende son supuestos razonables, no medidos en
  estudiantes de la Universidad de Córdoba. Los números dependen de esos supuestos.
- Hay una sola semilla, 15 estudiantes por clase y 6 lecciones.
- Los estudiantes simulados no usan el Tutor, no leen las explicaciones (la lectura no cambia su habilidad) y no
  vuelven a repasar otro día, así que la repetición espaciada (SM-2) no se puso a prueba aquí. Su comportamiento se
  explica aparte y se proyecta en `scripts/cursos/simular-al-azar.ts`.
- El servidor corrió en un portátil de 8 GB, no en una máquina como la de Azure (2 vCPU y 4 GB).
- La idea de usar estudiantes simulados para probar sistemas tutores tiene antecedentes en la literatura (se suele
  citar a VanLehn, Ohlsson y Nason, 1994). **Hay que verificar la referencia antes de citarla en el artículo.**

## 4. Qué sigue

1. Desplegar el arreglo del hallazgo 1 en Azure (comandos SSH en la conversación del 20/11).
2. Llevar el hallazgo 3 a Toscano: ¿la ecuación debe dar más peso a lo reciente?
3. Completar el banco con ejercicios intermedios (hallazgo 5); el Asistente rediseñado los puede proponer.
4. Repetir con 3 o 4 semillas más y 12 lecciones, y en un contenedor de 2 CPU y 4 GB, antes de llevar números al
   artículo.
