---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    EST-V04
---

# 🤖 Insumo 08 — Especificación y Diseño Seguro del Tutor IA

**Proyecto:** STIRE-Soft  
**Módulo:** `src/tutor/`  
**Proveedor LLM:** Google Gemini API vía Backend Proxy  
**Fecha:** 30 de agosto de 2026  

---

## 1. Misión Pedagógica: Método Socrático vs "Generador de Código"

El Tutor IA de STIRE **NO es un chatbot de propósito general ni un asistente de autocompletado de código** (tipo Copilot). Su función pedagógica es actuar como un **Maestro de Taller de Algoritmia**:

1. **Nunca entrega código resuelto ni soluciones directas.**
2. **Descompone el problema en partes conceptuales simples.**
3. **Hace preguntas reflexivas para que el estudiante detecte su propio error de lógica.**
4. **Modula su nivel de complejidad según el estado cognitivo real del estudiante.**

---

## 2. Inyección de Contexto Dinámico (`TutorContextService`)

Cada petición que llega a `POST /tutor/chat` ejecuta una consulta en tiempo real al repositorio `LearningProgressRepository` para construir un **System Prompt** enriquecido:

```typescript
// System Prompt generado dinámicamente en backend:
`
Eres el Tutor IA de STIRE (Smart Tutor for Interactive & Responsive Education).
Actualmente estás hablando con un estudiante de nivel ${level} (Mastery Global: ${Math.round(avgMastery)}%).

ÚLTIMOS PROGRESOS DEL ESTUDIANTE:
- Unidad 3: Grafos BFS, mastery 45%, successRate 40%, intentos 5
- Unidad 2: Ciclos While, mastery 85%, successRate 90%, intentos 2

REGLAS ESTRÍCTAS:
1. NUNCA resuelvas el problema directamente ni des el código completo.
2. Como el estudiante es nivel ${level}, ajusta tu complejidad:
   - Si es PRINCIPIANTE: Usa metáforas del mundo real y sé muy motivador.
   - Si es AVANZADO: Enfócate en eficiencia, Big O Notation y trazado de memoria.
3. Utiliza el Método Socrático: haz preguntas para que el estudiante descubra la respuesta.
4. Mantén tus respuestas concisas (< 150 palabras).
`
```

---

## 3. Clasificación de Niveles Cognitivos

| Nivel Cognitivo | Criterio de Mastery Global | Estrategia de Respuesta del Tutor |
|---|---|---|
| **PRINCIPIANTE** | Mastery $\le 50\%$ | Guía paso a paso, refuerzo de sintaxis básica, analogías cotidianas (cajas, filas, recetas). |
| **INTERMEDIO** | $50\% <$ Mastery $\le 80\%$ | Pistas sobre condiciones de borde, inicialización de punteros, depuración de bucles. |
| **AVANZADO** | Mastery $> 80\%$ | Discusión sobre invariantes de ciclo, optimización de complejidad algorítmica ($O(N)$ vs $O(N^2)$). |

---

## 4. Actualización del Modelo Google Gemini (2026)

* **Antecedente:** Tras la auditoría técnica y de acuerdo con el boletín oficial de Google AI, los modelos `gemini-2.0-flash` y `gemini-2.0-flash-001` fueron discontinuados en junio de 2026.
* **Modelo Activo Oficial:** **`gemini-1.5-flash`** (o `gemini-1.5-pro` según latencia/cuota).
* **Configuración en Backend:**
  * Variable: `OPENAI_MODEL=gemini-1.5-flash` en `.env`.
  * Fallback seguro en código: `gemini-1.5-flash` en `src/tutor/tutor.service.ts`.
  * Endpoint REST directo: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}`.

---

## 5. Diseño de Arquitectura de API Keys: Sistema vs BYOK

Google AI for Developers exige expresamente que las API Keys deben tratarse como contraseñas confidenciales y nunca exponerse en clientes frontend.

STIRE establece una arquitectura de dos modos:

```mermaid
graph TD
    subgraph Modo_A["Modo A (MVP Actual - Clave del Sistema)"]
        UI1["Vue 3 / Nuxt Frontend"] -->|POST /tutor/chat\n(Bearer JWT)| BE1["NestJS Backend"]
        BE1 -->|Lee OPENAI_API_KEY\ndesde .env en servidor| GEMINI1["Google Gemini AI"]
    end

    subgraph Modo_B["Modo B (Fase Futura - BYOK Seguro) - PROPUESTO, NO IMPLEMENTADO"]
        UI2["Estudiante en Perfil"] -->|POST /users/api-key\n(no existe aun)| BE2["NestJS Backend Proxy"]
        BE2 -->|Cifra con AES-256-GCM\nGuarda en DB| DB2[("MySQL Encriptada")]
        BE2 -->|Descifra en memoria\nsolo durante inferencia| GEMINI2["Google Gemini AI"]
    end
```

### 5.1 Modo A (MVP Actual - Recomendado)
* La clave reside exclusivamente en el archivo `.env` del servidor NestJS.
* El frontend solo envía `{ message: "..." }` con su token de sesión JWT.
* El backend aplica limitación de tasa (Throttle: 20 peticiones/minuto por usuario) para evitar abusos o costos no controlados.

### 5.2 Modo B (Futuro — BYOK Bring Your Own Key)
* Para permitir que estudiantes avanzados o instituciones usen sus propios cupos:
  1. El estudiante ingresa su clave en un formulario seguro de perfil.
  2. El backend valida la clave mediante un ping rápido a Gemini.
  3. Si es válida, se almacena en base de datos cifrada con **AES-256-GCM** vinculada al `userId`.
  4. El estudiante puede probar, desactivar o eliminar su clave en cualquier momento.
  5. Ningún log del sistema imprime la clave en texto plano.
