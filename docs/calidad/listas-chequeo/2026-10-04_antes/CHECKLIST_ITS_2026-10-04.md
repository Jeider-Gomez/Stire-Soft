# Lista de chequeo de Sistemas Tutores Inteligentes (Caro Piñeres, 2015) — revisión del 04/10/2026 (antes)

> **Formato:** el del profesor ([`../../../curso-ddse3/guias/Checklist_ITS_Caro.docx`](../../../curso-ddse3/guias/Checklist_ITS_Caro.docx)), llenado en [`CHECKLIST_ITS_2026-10-04.docx`](CHECKLIST_ITS_2026-10-04.docx). Esta página es la misma revisión para leer en GitHub.

## 1. Datos generales

| Campo | Valor |
|---|---|
| Asignatura / Curso | Diseño y Desarrollo de Software Educativo III (203457) — Semana 9 del curso (Reto 3) · 2026-2 |
| Fecha de Evaluación | 04 / 10 / 2026 (análisis del «antes») |
| Versión / Rama Git | v1.1.0 + ajustes de UI/UX del 02 y 03/10 / main @ 7c9977b (versión desplegada el 04/10/2026) |
| Integrantes del Equipo | Jeider Gómez · Pedro Romero · José López · Julio Galvis · Jorge Iván Cervantes García (códigos: completar) |
| URL Demo / Repositorio | https://stire-soft.vercel.app · https://github.com/Jeider-Gomez/Stire-Soft |
| Docente / Evaluador | Prof. Raúl Toscano Miranda · Autoevaluación del equipo STIRE-Soft (revisión con apoyo de Claude Code) |
| Nombre de la Aplicación / Frontend | STIRE-Soft — Sistema Tutor Inteligente con Repetición Espaciada (Fundamentos de Algoritmia) |
| Calificación final | **14 / 24 puntos = 58.3 / 100 · Insuficiente / Requiere rehacer** |

Escala del profesor: **C** cumple totalmente (2) · **CP** cumple parcialmente (1) · **NC** no cumple (0) · **NA** no aplica.

## 2. Bloque 1: Reflejo de los 4 Módulos Canónicos en la UI

| ID | Criterio | Valoración | Pts | Evidencia | Ajuste para la v1.2.0 |
|---|---|---|---|---|---|
| **MOD-01** | Módulo del experto / dominio en la UI | **CP** | 1 / 2 | Unidades básicas de aprendizaje: cada lección es atómica, con objetivo y evidencias («evidencias U2-E2 y U3-E1») y la misma estructura (La idea, Un ejemplo, Error común, Pruébalo). Verificación experta en tiempo real: el editor ejecuta el código contra casos visibles y ocultos en un entorno aislado y muestra cuál falla. Falta transparentar los prerrequisitos: el «Plan del curso» muestra el orden pero todas las lecciones están abiertas, sin candado ni explicación de qué se necesita antes. | Mostrar «Antes conviene: …» en las lecciones que dependen de otra. |
| **MOD-02** | Módulo del estudiante (overlay y perfil cognitivo) | **CP** | 1 / 2 | Modelo overlay visible: «Mi progreso» muestra el dominio de cada lección (barra, % y estado: Dominado en verde, No visto en gris) y el plan del curso marca las dominadas. No hay perfil cognitivo Felder-Silverman ni diagnóstico de concepciones erróneas: la retroalimentación del código dice qué salida se esperaba («se esperaba 8 y se mostró 53»), no qué idea está mal. Hallazgos de esta revisión: la racha dice «1 día» en el inicio y «0 días» en «Mi progreso»; y una lección «No vista» aparece como «Toca repasarla». | Corregir las dos inconsistencias; agregar errores frecuentes por tipo de ejercicio. |
| **MOD-03** | Módulo del tutor / pedagógico (tácticas y planes) | **C** | 2 / 2 | Tácticas formales observables: analogía o metáfora (nivel 1 del Tutor), pregunta socrática (nivel 2), localizar la falla (nivel 3), ejemplo resuelto paso a paso y explicación alternativa en los refuerzos que crea el docente, y reto para saltar lo básico. Jerarquía instruccional visible: Unidad › Tema › Lección › Ejercicios. Dificultad dinámica: el recomendador sube de nivel («Vas muy bien: pasemos al nivel intermedio») o baja tras 2 fallos («afiancemos el nivel básico») (src/learning-progress/recommendation/recomendar-siguiente.ts:71-97). | — |
| **MOD-04** | Interfaz como traductor ergonómico y afectivo | **C** | 2 / 2 | Lenguaje pedagógico y no punitivo: «Llevas varios intentos seguidos sin lograrlo. Para un momento: vuelve a la explicación o pídele una pista al tutor», notificaciones «¡En marcha!», Tutor en lenguaje sencillo en los 3 niveles. Pantalla del ejercicio despejada (enunciado, editor, casos). Observación: el mensaje del evaluador («Falla en salida: se esperaba 8 y se mostró 53») todavía es frío. | Reescribir el mensaje de falla con tono de orientación. |

## 3. Bloque 2: Características que Reflejan la Inteligencia del Tutor

| ID | Criterio | Valoración | Pts | Evidencia | Ajuste para la v1.2.0 |
|---|---|---|---|---|---|
| **UI-01** | Adaptación multimodal de contenidos (verbal / visual) | **NC** | 0 / 2 | Las lecciones combinan texto, tablas, código y recursos (videos, simulaciones PhET, Genially) y los proyectos ofrecen diagrama de flujo y pseudocódigo, pero el formato NO se adapta al estilo del estudiante ni hay un conmutador Verbal/Visual. No se modela el estilo de aprendizaje. | Conmutador «Ver como diagrama / Ver como texto» en las lecciones con algoritmo. |
| **UI-02** | Modelo de navegación adaptativo (global / secuencial) | **CP** | 1 / 2 | Conviven los dos modelos para todos: navegación libre por el menú y el plan del curso (global) y la ruta guiada de «Tu siguiente paso» (secuencial). Hay desbloqueo adaptativo parcial: el «reto» permite saltar lo básico de una lección si se resuelve al primer intento. No se adapta según el estilo Global/Secuencial. | — |
| **UI-03** | Andamiaje proactivo y asesor inteligente (advisor) | **C** | 2 / 2 | Asesor siempre presente: botón flotante «Tutor» en todas las pantallas y panel lateral. Pistas en 3 niveles que suben con los intentos fallidos en la actividad: pista, pregunta guía, dónde está el error (src/tutor/tutor-guidance.ts:27-31), nunca la solución. No invasivo: se ofrece cuando falla un caso de prueba («¿Te ayudo?») o a pedido. Nota: el orden de STIRE (pista → pregunta → error) difiere del de la lista (pregunta → error → contraejemplo); es una decisión documentada en la base teórica. | — |
| **UI-04** | Curaduría dinámica y resiliencia de recursos | **NC** | 0 / 2 | No hay valoración de la claridad de cada lección ni recomendación de recursos por pares (k-NN). Existe un buzón general de «Sugerencias» con pantallazo, pero no por lección. Los recursos externos solo se insertan desde una lista cerrada de sitios (utils/recursoSeguro.ts), pero no se verificó un reemplazo automático si el recurso falla. | «¿Te sirvió esta explicación? Sí / No» al final de la lección; con «No», ofrecer el Tutor con otra explicación. |
| **UI-05** | Replanificación instruccional ante bloqueos | **C** | 2 / 2 | Sensor de bloqueo: tras 3 fallos seguidos en una lección (FALLOS_PARA_PAUSA = 3) STIRE deja de proponer otro ejercicio y la pantalla cambia: «Volver a la explicación» y «Pedir una pista al tutor», y avisa al docente («Tu docente ya sabe que esta lección te está costando»). Tras 2 fallos baja el nivel de dificultad. Visto en producción con la cuenta de prueba (captura pc_est_unidad.png). | — |

## 4. Bloque 3: Metacognición Computacional y Prototipo FUNPRO

| ID | Criterio | Valoración | Pts | Evidencia | Ajuste para la v1.2.0 |
|---|---|---|---|---|---|
| **META-01** | Doble lazo de razonamiento en la interfaz | **CP** | 1 / 2 | El nivel objeto (lección y ejercicio) y el meta-nivel («Mi progreso»: racha, semana, dominio por lección, últimos ejercicios, «Ver más estadísticas») están en pantallas separadas, y cada recomendación dice su motivo. Pero «Mi progreso» informa números; no invita a reflexionar sobre la estrategia ni explica el porqué de los hábitos. | Panel «Mi autorregulación» con un mensaje de reflexión según los datos. |
| **META-02** | Juicios metacognitivos y metamemoria | **NC** | 0 / 2 | No hay juicio de confianza antes o después de responder. La pregunta «¿Cómo te sientes con este tema?» se reemplazó por el reto de salto (docs/DISENO_INTERVENCION_DOCENTE.md §10.2); el servidor guarda un campo de confianza que hoy solo usa el mapa de calor del docente. | «¿Qué tan seguro estás?» antes de entregar y comparación con el resultado. |
| **META-03** | Transparencia algorítmica y agencia compartida | **C** | 2 / 2 | Explicabilidad: cada recomendación muestra su motivo («Toca repasar esta lección…», «Vas muy bien: pasemos al nivel…»). Agencia: «Elegir yo el ejercicio», «Intentar otro ejercicio de todas formas», el Tutor es opcional y el docente lo configura. Evaluación formativa sin castigo: intentos, repasos espaciados y refuerzos. Falta un «¿Por qué veo esto?» explícito en el inicio. | — |

## 5. Consolidación

| Bloque | Ítems | Posibles | Logrados | % |
|---|---|---|---|---|
| Bloque 1: Reflejo de los 4 Módulos Canónicos en la UI | 4 | 8 | 6 | 75.0 % |
| Bloque 2: Características que Reflejan la Inteligencia del Tutor | 5 | 10 | 5 | 50.0 % |
| Bloque 3: Metacognición Computacional y Prototipo FUNPRO | 3 | 6 | 3 | 50.0 % |
| **Total** | | **24** | **14** | **58.3 % · Insuficiente / Requiere rehacer** |

## 6. Fortalezas

El Tutor socrático con 3 niveles de ayuda que nunca da la solución y se ofrece al fallar (UI-03); la replanificación ante bloqueos con aviso al docente (UI-05); tácticas pedagógicas reales y dificultad adaptativa (MOD-03); recomendaciones que explican su motivo y dejan decidir al estudiante (META-03); lenguaje empático (MOD-04); modelo overlay del dominio por lección (MOD-02).

## 7. Debilidades críticas y ajustes

1) Sin juicio de confianza ni calibración (META-02). 2) Sin valoración de las lecciones por el estudiante (UI-04). 3) Sin adaptación verbal/visual ni perfil de estilo (UI-01, MOD-02). 4) Prerrequisitos no visibles (MOD-01). 5) Inconsistencias del modelo del estudiante: racha 1 vs 0 y lección no vista «para repasar» (MOD-02). 6) «Mi progreso» sin invitación a la reflexión (META-01). Compromiso: 1, 2, 4, 5 y 6 en la v1.2.0; el perfil Felder-Silverman queda como trabajo posterior, documentado.

## 8. Método

- **Código:** cada afirmación cita el archivo y, cuando importa, la línea, en `main @ 7c9977b`.
- **Aplicación desplegada** (stire-soft.vercel.app), 04/10/2026, con cuentas de prueba `@example.com` (estudiante y docente): computador 1440×900, celular 390×844 y horizontal 844×390; navegación con Tab; `prefers-color-scheme: dark`; conexión cortada en el editor; medición del tamaño de cada control; **axe-core 4.10** con las reglas WCAG 2.1 A/AA.
- **Evidencia:** capturas en [`capturas/`](capturas/) y mediciones en [`evidencia-automatica.json`](evidencia-automatica.json).

- **Límites:** no se corrió Lighthouse; axe-core se aplicó en computador; la verificación de ventanas superpuestas (PAT-04) se hizo solo en los recorridos.
