# Flujo del Tutor IA (RAG)

STIRE implementa un Tutor Educativo que utiliza Retrieval-Augmented Generation (RAG) dinámico, logrando respuestas adaptativas que superan al simple modelo conversacional estático.

## 1. Construcción del Prompt de Sistema
El `TutorContextService` extrae métricas analíticas del usuario antes de instanciar la llamada a la IA:
- Promedio Global de Mastery.
- Nivel clasificado (Principiante, Intermedio, Avanzado).
- *Futuro*: Temas específicos (tags) con bajo performance.

Este contexto forma el **System Prompt**, inyectando reglas pedagógicas estrictas al LLM (Ej. el "Método Socrático").

## 2. Ventana de Contexto (Historial)
El `TutorConversationsRepository` obtiene los últimos N mensajes (índice SQL optimizado por `studentId` y `createdAt DESC`) para garantizar coherencia en la conversación sin exceder los límites de tokens del LLM y manteniendo costos bajos.

## 3. Orquestación e Inferencia
1. El usuario envía el mensaje a `POST /tutor/chat`.
2. Se registra el mensaje `role: user` en DB.
3. Se fusiona el System Prompt + Historial + Mensaje Actual.
4. Se despacha a OpenAI / Anthropic API (o un modelo local open source como Llama 3).
5. Se registra la respuesta `role: assistant` en DB.
6. Se devuelve al usuario para renderizar en UI.

## 4. Limitaciones de Seguridad (Hardening)
- Se debe implementar Rate Limiting agresivo sobre este endpoint específico (`@nestjs/throttler`) para evitar agotamiento de créditos en APIs externas de Inteligencia Artificial.
