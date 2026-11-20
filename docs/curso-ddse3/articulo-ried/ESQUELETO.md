# Artículo de implementación y evaluación de STIRE para RIED · esqueleto

**Revista:** RIED, Q1 en SCImago 2025, gratis (`../SELECCION_REVISTAS.md`). **Meta:** enviarlo antes del cierre del
**30 de mayo de 2027** (número de enero de 2028). El cierre del 30 de noviembre de 2026 no alcanza.

**Lo que pidió Toscano (último mensaje):** el abstract y los resultados de la implementación y la evaluación, con tres
pruebas: heurística de expertos, prueba con 10 usuarios finales y prueba de estrés con una batería de casos. Se
escriben **primero el resumen y los resultados**, en el formato de la revista.

**Reglas de RIED que cambian cómo se escribe** (página de envíos y «criterios de prioridad», leídas el 20/11/2026):

| Regla | Cómo la cumplimos |
|---|---|
| Tema: tecnologías digitales aplicadas a la educación, de preferencia universitaria | STIRE en un curso de la Universidad de Córdoba |
| Título de 16 palabras o menos, en español y en inglés | Por escribir |
| Resumen de 200 a 250 palabras, en español y en inglés, IMRD | Por escribir |
| 3 a 6 palabras clave del Tesauro ERIC | Por elegir |
| 5.000 a 7.000 palabras sin referencias (unas 12 a 16 hojas) | — |
| APA 7; al menos 25 referencias, el 40 % de los últimos 4 años (2023 a 2026) | Hoy el de Acta tiene menos: hay que ampliar |
| Original e inédito: **ni total ni parcialmente publicado** (se pasa Turnitin) | ⚠️ No copiar texto del artículo de Acta; escribir de nuevo y enfocar en la evaluación |
| Anónimo en el primer envío (sin nombres, institución ni autocitas) | Al final |
| ORCID y nota de 30 a 50 palabras de cada autor; no hay límite de autores | Pendiente de cada integrante |
| Traducción profesional al inglés en el mes siguiente a la aceptación | Después |
| Plantilla propia en Word | https://contenido.uned.es/educacion/teoria_educacion/plantilla_articulos_ried.docx |

## Estructura (plantilla IMRyD del profesor, ajustada a RIED)

| Sección | Palabras (aprox.) | Contenido | De dónde sale |
|---|---|---|---|
| Título, resumen y palabras clave (es/en) | 250 + 250 | Contexto, problema, objetivo, método, resultados (las 3 pruebas) y conclusión | Se escribe primero |
| 1. Introducción | 900 | Aprender a programar, tutores inteligentes, repaso espaciado; la brecha; el objetivo | `docs/investigacion/`, matriz de artículos |
| 2. Materiales y métodos | 1.100 | Diseño (desarrollo tecnológico con evaluación mixta), participantes, instrumentos (listas de chequeo, heurística, hoja de observación, SUS, batería de estrés), fases | Protocolo de observación, plan de la heurística, `docs/calidad/estres/` |
| 3. El sistema | 900 | Arquitectura, Tutor, SM-2 adaptado, nivel por competencia (con sus **fórmulas**) | Artículo de Acta (reescrito), código |
| 4. Casos de validación | 600 | Tabla de escenarios: expertos, 10 usuarios, estrés de 10 a 100 estudiantes, simulación A frente a B | Informes de simulación |
| **5. Resultados** | 1.500 | **5.1 Heurística de expertos** (4,21/5 en 33 ítems) · **5.2 Usuarios finales** (10 personas, Tabla de dificultades, SUS 63,1 con 4 respuestas) · **5.3 Estrés** (p95, cero fallas del servidor, el juez como cuello de botella; el arreglo de conexiones del 20/11) · 5.4 Simulación (r = 0,46, sesgo −0,15) | Los informes de `docs/calidad/` |
| 6. Discusión | 900 | Comparar con la literatura; por qué SUS de usuarios < SUS del equipo; límites | Por escribir |
| 7. Conclusiones y trabajo futuro | 400 | Diagnóstico de competencias, análisis de exámenes, peso a lo reciente | Propuestas del 20/11 |
| Conflictos de interés, financiamiento, uso de IA | 150 | Los evaluadores del equipo son los desarrolladores; sin financiamiento | — |

**Total:** unas 6.800 palabras, dentro del rango de RIED.

## Orden de trabajo

1. Resumen y resultados (lo que pidió Toscano).
2. Métodos y casos de validación (tablas).
3. Sistema (fórmulas).
4. Introducción y discusión, con las referencias nuevas (meta: 25 o más, 10 o más de 2023 a 2026).
5. Pasar a la plantilla de RIED, anonimizar, revisar el conteo y enviar a Toscano.
