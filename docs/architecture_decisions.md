# Architecture Decision Records (ADRs)

## 1. Domain-Driven Design (DDD) & Modularidad
**Decisión:** El backend se estructura utilizando principios DDD adaptados a NestJS.
**Justificación:** Plataformas educacionales masivas (LMS) tienden a convertirse en monolitos inmanejables. Al separar el sistema en dominios (`activities`, `submissions`, `learning-progress`, `evaluation-engine`), garantizamos que el motor de autograding puede evolucionar independientemente del gestor de perfiles.
**Consecuencias:** Mayor cantidad de archivos y uso intensivo de Eventos de Dominio (`EventEmitter2`) para evitar acoplamiento fuerte entre módulos.

## 2. Motor de Evaluación Desacoplado (Strategy Pattern)
**Decisión:** Uso del Patrón Estrategia para evaluar respuestas de estudiantes.
**Justificación:** Un switch-case gigante en el `SubmissionService` violaría el principio Abierto/Cerrado (Open/Closed). Al inyectar un factory con implementaciones de `IEvaluatorStrategy` (Ej. `McqEvaluator`, `FillCodeEvaluator`), podemos añadir nuevos tipos de actividades dinámicas (Ej. "Code Review AI") sin tocar el flujo principal.

## 3. Sandboxing Asíncrono para Código (Judge Engine)
**Decisión:** El código entregado por los estudiantes (`coding`) no se evalúa de forma síncrona en el hilo principal de Node.js.
**Justificación:** Ejecutar código arbitrario es un riesgo masivo de seguridad y bloquea el Event Loop. Se utiliza BullMQ y Docker para aislar, poner límite de memoria/tiempo y escalar horizontalmente el procesamiento de respuestas de programación.

## 4. RAG y Memoria Contextual para el Tutor IA
**Decisión:** El Tutor IA inyecta el Mastery y Debilidades del estudiante en el System Prompt.
**Justificación:** Un chat genérico no aporta valor pedagógico. Al recuperar métricas del `LearningProgressService` y el historial desde `TutorConversationsRepository`, el LLM puede actuar verdaderamente como un tutor adaptativo (Ej. "He notado que fallaste 3 veces en recursividad, vamos a repasar eso").

## 5. Event-Driven Architecture para Analíticas
**Decisión:** La propagación de métricas (Mastery, Spaced Repetition) ocurre reaccionando a eventos (`submission.graded`).
**Justificación:** Previene cuellos de botella en la entrega del estudiante. El request HTTP finaliza inmediatamente después de guardar el log, dejando los cálculos pesados en background listeners.
