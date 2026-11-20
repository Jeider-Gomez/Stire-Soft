# Artículo de STIRE: lo que falta

El artículo (`STIRE_Articulo.docx` y `.pdf`) solo dice lo que ya está hecho y comprobado. Lo que falta se lleva aquí,
no en el documento. Cuando algo se haga, se agrega al texto (`scripts/articulo/generar_articulo.py`), se vuelve a
generar el Word y se marca aquí.

Estados: ⬜ falta · 🔄 en curso · ✅ hecho e incluido en el artículo.

## Datos de los autores

| | Qué falta | Quién |
|---|---|---|
| ⬜ | Nombres completos de José, Julio y Jorge | Cada uno |
| ⬜ | Correo institucional de cada autor (la plantilla lo enlaza) | Cada uno |
| ⬜ | ORCID de cada autor: se crea gratis en https://orcid.org | Cada uno |
| ⬜ | Orden de los autores y si el profesor va como coautor | Jeider |

## Datos y pruebas

| | Qué falta | Qué se agrega al artículo cuando esté |
|---|---|---|
| ⬜ | **El décimo usuario de la prueba con usuarios finales** (Toscano pidió «unas 10 personas»; van 9). Mismo protocolo (`docs/calidad/PROTOCOLO_OBSERVACION.md`), y que responda la escala SUS: solo 4 de los 9 la respondieron | En la sección E: «Participaron 10 personas…», la Tabla 3 y la media de SUS con 5 respuestas |
| ⬜ | Dato local de pérdida o repitencia de Fundamentos de Algoritmia, con su fuente | Una frase en la introducción |
| ⬜ | Confirmación de MOD-02 (Pedro) | La Tabla 2 pasaría de 23 a 24 puntos en tutores |
| ⬜ | Uso actual del Tutor (mensajes, cuentas con clave y tiempos de respuesta, desde el 12/10) | Actualizar la subsección «Usabilidad y uso del tutor» |
| ⬜ | Leer el PDF de Woźniak y Gorzelańczyk (1994) para saber qué formula | Hoy SM-2 se cita a Woźniak (1990) |

## Lo que haría más fuerte el artículo (revisión del 20/11)

Sale de cruzar la retroalimentación de Toscano (`../RETROALIMENTACION_TOSCANO_2026-10-28.md`) con lo que el
artículo ya dice. Ordenado de más a menos útil para el artículo.

| | Qué falta | Por qué sirve | Qué se agrega al artículo |
|---|---|---|---|
| 🔄 | **Simulación de docente y estudiantes** (`docs/calidad/simulacion/`): un docente crea dos clases desde cero, una con las competencias en «recomendar» y otra en «informar», y 15 estudiantes simulados con habilidad conocida recorren cada una | Es la única forma de comprobar si la ecuación de Toscano estima bien lo que el estudiante sabe (se conoce su habilidad real) y si recomendar cambia el recorrido | Un párrafo en «Evaluación» con la correlación entre el nivel estimado y la habilidad real, y la comparación entre las dos clases, dicho como simulación, no como prueba con personas |
| ⬜ | **Repetir la prueba de estrés en una máquina como la de Azure** (contenedor de 2 CPU y 4 GB) | La de noviembre corrió en un portátil de 8 GB; un evaluador puede preguntar si el servidor real aguanta lo mismo | Cambiar la sección F para que los números sean los de la máquina real |
| ⬜ | **Diagnóstico de competencias, opcional para el docente** (Toscano, recomendación 5): hoy solo hay reto de entrada por lección. Propuesta en `../PROPUESTA_DIAGNOSTICO_COMPETENCIAS.md` | El docente ve el primer día qué trae flojo su grupo; con uno de cierre, el artículo tendría un antes y un después por competencia, el único dato de aprendizaje | Una subsección con la ganancia por competencia, o una línea de trabajo futuro si no alcanza el semestre |
| ⬜ | **Banco etiquetado por perfil, visual o lector** (Toscano, recomendación 6; P45) | Es la segunda mitad de lo que pidió sobre el banco de ejercicios | Una frase en competencias y una limitación menos |
| ⬜ | **Explicar el código en el editor** (Toscano, recomendación 3; P37) | Toscano lo propuso para quien se pierde en el código | Una línea en la descripción del Tutor |
| ⬜ | **Evaluar los prompts con casos de oro** (P41): hoy solo hay instantáneas y versiones | Dar un número de calidad de las respuestas del Tutor (por ejemplo, cuántas veces dio la solución cuando no debía) | Un dato en la evaluación del Tutor |
| ⬜ | **El décimo usuario** (ya en «Datos y pruebas») | Cierra la muestra que pidió Toscano | La sección E con 10 personas |

## Del propio artículo

| | Qué falta |
|---|---|
| ⬜ | Revisar ejemplos de artículos de desarrollo de aplicaciones educativas para mejorar la estructura |
| ⬜ | Que el equipo lea el artículo completo y confirme la declaración de uso de IA (sección II.F) |
| ⬜ | Confirmar con el catálogo del editor el año de Pressman y Maxim (2019 en el artículo, 2020 en la matriz) |

## Ya incluido (18/10/2026)

- ✅ Tabla 2 con 16 y 12 criterios, la escala de puntos y los cuatro momentos (IA frente a revisión humana).
- ✅ SM-2 citado a Woźniak (1990), con la adaptación de STIRE (3 días en vez de 6).
- ✅ Citas de VanLehn, Cepeda y Hattie y Timperley ajustadas a lo que dicen.
- ✅ Accesibilidad: «auditado con axe-core», no «cumple WCAG».
- ✅ Declaración de uso de IA y limitaciones.
- ✅ Figuras nuevas de la versión actual, en el curso Fundamentos de Algoritmia y legibles sin zoom.
- ✅ Referencia de la lista de tutores inteligentes: Caro Piñeres (2015), verificada en el repositorio de la UNAL.
