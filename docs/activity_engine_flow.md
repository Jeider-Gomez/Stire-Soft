# Flujo del Motor de Actividades (Activity Engine)

El motor de actividades evalúa respuestas dinámicamente y orquesta el progreso del estudiante.

## 1. Estructura de Datos Dinámica
Las preguntas (`ActivityQuestion`) no tienen un esquema relacional estricto para las opciones. En su lugar, utilizan el campo `config` (JSON) gobernado por Interfaces Tipadas (`QuestionConfig`).
- Ventaja: Escalabilidad para agregar nuevos tipos de juegos/ejercicios sin migraciones SQL masivas.
- Implementación: `DragDropConfig`, `McqConfig`, `CodingConfig`.

## 2. Flujo de Auto-Grading
1. **Petición Inicial:** El cliente envía un `SubmitAnswersDto` con un array de `{ questionId, answer: JSON }`.
2. **Iteración y Carga de Contexto:** `SubmissionsService` recupera las preguntas correspondientes y sus configuraciones.
3. **Dispatch a Estrategias:** Por cada respuesta, el servicio delega a `EvaluationEngineService`.
4. **Evaluación de la Estrategia:** El Engine usa la interfaz `IEvaluatorStrategy` para despachar al evaluador correcto.
   - Si es MCQ: Valida array contra array.
   - Si es Drag & Drop: Compara el mapeo del JSON del estudiante con el mapping oficial.
5. **Score Parcial y Feedback:** Cada evaluador retorna `isCorrect`, `score` y un `feedback` dinámico.
6. **Persistencia y Total:** Se guardan en batch las `SubmissionAnswer`, se suman los puntajes para la `Submission` maestra, y se actualiza a estado `GRADED`.

## 3. Emisión de Eventos
El flujo sincrónico termina aquí. Para no bloquear el cliente, se emite el evento asíncrono `submission.graded` que dispara los cálculos pesados descritos en la arquitectura del progreso del usuario.
