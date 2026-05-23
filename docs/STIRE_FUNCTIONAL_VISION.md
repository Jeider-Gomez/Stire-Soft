# STIRE — Visión Funcional y Pedagógica del Sistema
**El "Por Qué" de la Plataforma: Problema, Solución y Propuesta de Valor Educativa**

---

## 1. El Problema Pedagógico que Resuelve STIRE

La enseñanza tradicional de Algoritmia y Programación en universidades enfrenta tres problemas estructurales que limitan el aprendizaje efectivo:

### 1.1 La Brecha de Retroalimentación
En un salón de 40 estudiantes, el docente no puede identificar en tiempo real quién está rezagado, qué conceptos generan mayor confusión o cuándo un estudiante necesita ayuda antes de que el examen parcial revele el fracaso.

### 1.2 El Olvido Acelerado (Curva de Ebbinghaus)
Sin refuerzo sistemático, los estudiantes olvidan el 60–80 % del contenido aprendido en la primera semana. Las evaluaciones únicas no combaten este fenómeno de forma estructurada.

### 1.3 La Talla Única en el Aprendizaje
Todos los estudiantes reciben el mismo contenido, al mismo ritmo y con la misma evaluación, ignorando que cada uno tiene un nivel de dominio diferente, aprende a velocidades distintas y falla en puntos conceptuales diferentes.

---

## 2. La Propuesta de Valor de STIRE

STIRE (**S**istema **T**utor **I**nteligente con **R**epetición **E**spaciada) propone una solución integral basada en tres pilares cognitivo-tecnológicos:

### 2.1 Pilar 1: Evaluación Adaptativa y Seguimiento de Dominio (Mastery)
Cada vez que el estudiante resuelve una actividad, el sistema calcula un indicador de dominio (`mastery`) ponderado por el tipo y peso de la actividad. Este indicador determina automáticamente:
- Si el estudiante puede avanzar a la siguiente unidad (umbral de 60 %).
- Qué nivel de profundidad debe usar el Tutor IA en sus explicaciones.
- Cuándo programar el próximo repaso espaciado.

### 2.2 Pilar 2: Repetición Espaciada Algorítmica (SM-2)
Inspirado en el algoritmo SuperMemo-2 (base de aplicaciones como Anki), STIRE programa automáticamente sesiones de refuerzo en intervalos crecientes. Si un estudiante domina bien un concepto, el sistema lo programa para revisión en 14 días. Si lo domina mal, el próximo repaso es mañana. Esto combate directamente la curva del olvido.

### 2.3 Pilar 3: Tutor IA Socrático y Contextualizado
En lugar de proporcionar respuestas directas, el Tutor IA actúa como un docente que guía al estudiante con preguntas y pistas, adaptando su lenguaje y profundidad según el nivel de dominio actual del alumno (principiante, intermedio, avanzado). El tutor nunca escribe el código por el estudiante; lo lleva a descubrirlo.

---

## 3. Los Actores del Sistema

| Actor | Rol | Responsabilidades Clave |
|-------|-----|------------------------|
| **Administrador** | Gestor institucional | Alta de docentes, configuración global del sistema. |
| **Docente** | Creador de contenido | Diseña el plan de estudios, sube material teórico, crea actividades y evaluaciones, monitorea el progreso de la clase. |
| **Estudiante** | Aprendiz activo | Consume contenido, resuelve actividades, interactúa con el Tutor IA, atiende sus sesiones de repaso programadas. |

---

## 4. La Jerarquía de Contenido Académico

STIRE organiza el conocimiento en una estructura curricular de 5 niveles:

```
Clase (e.g., "Fundamentos de Algoritmia — Grupo A")
└── Sección / Corte (e.g., "Primer Corte")
    └── Tema (e.g., "Variables y Tipos de Datos")
        └── Unidad de Aprendizaje (e.g., "Declaración de Variables en C++")
            ├── Contenido Teórico (PDF, Video, Markdown)
            └── Actividad (Quiz, Taller, Parcial)
                └── Preguntas (MCQ, Coding, Drag & Drop, Fill Code, Matching)
```

La **Unidad de Aprendizaje** es la unidad mínima evaluable del sistema: es el granulo al que se le asigna un `mastery`, un `review_schedule` y un historial de progreso individual por estudiante.

---

## 5. El Ciclo de Vida Cognitivo del Estudiante

```
1. EXPLORACIÓN      → El estudiante accede al material teórico de la unidad.
2. PRÁCTICA         → Resuelve actividades; el sistema califica y calcula mastery.
3. RETROALIMENTACIÓN → El Tutor IA ofrece soporte socrático si el mastery < 60 %.
4. DOMINIO          → Al superar el umbral, se desbloquea la siguiente unidad.
5. REPASO           → SM-2 programa revisiones periódicas para combatir el olvido.
6. CONSOLIDACIÓN    → Con cada repaso exitoso, el intervalo se extiende (hasta 60 días).
```

---

## 6. Métricas Clave del Sistema

| Métrica | Descripción | Dónde se persiste |
|---------|-------------|-------------------|
| `mastery` | Porcentaje de dominio ponderado (0–100 %) | `learning_progress.mastery` |
| `successRate` | % de intentos aprobados sobre el total | `learning_progress.successRate` |
| `attemptsCount` | Total de intentos realizados por el estudiante | `learning_progress.attemptsCount` |
| `nextReviewDate` | Fecha calculada por SM-2 para el próximo repaso | `review_schedules.nextReviewDate` |
| `urgencyLevel` | Prioridad de repaso (0=futuro, 1=mañana, 2=vencido, 3=crítico) | `review_schedules.urgencyLevel` |
| `easeFactor` | Factor de facilidad del algoritmo SM-2 | `review_schedules.easeFactor` |

---

## 7. Diferenciadores Técnicos de STIRE

1. **Motor de Evaluación con Strategy Pattern**: soporta 5 tipos de preguntas con arquitectura extensible para nuevos tipos sin modificar el core.
2. **Judge Engine con Docker Sandbox**: evaluación de código en contenedores aislados con límites estrictos de CPU/RAM/red para seguridad total.
3. **Arquitectura Event-Driven**: el sistema de puntos de aprendizaje, repasos y analíticas operan desacoplados mediante eventos, garantizando respuestas instantáneas al estudiante.
4. **XSS Protection**: todo contenido Markdown procesado es sanitizado con DOMPurify + JSDOM antes de ser entregado al frontend.
5. **Tutor IA con RAG conceptual**: el prompt del LLM se construye dinámicamente con el estado real del estudiante (mastery, historial, nivel).

---

## 8. Roadmap de Funcionalidades

| Fase | Funcionalidades | Estado |
|------|----------------|--------|
| **Fase 1 — Core Backend** | Auth, User, Class, LearningUnit, Submissions, EvaluationEngine, Analytics | ✅ Completado |
| **Fase 2 — Inteligencia** | TutorIA (RAG + SM-2), LearningProgress, ReviewSchedules, Notifications | ✅ Completado |
| **Fase 3 — Gamificación** | Badges, Logros, Tablas de clasificación, Puntos de experiencia | 🕐 En Pausa |
| **Fase 4 — Bancos de Preguntas** | QuestionBank reutilizable entre clases y docentes | 🕐 En Pausa |
| **Fase 5 — Frontend** | Interfaz de estudiante, docente y administrador | 🚧 Próxima Sprint |

---

*Este documento es la referencia de visión funcional de STIRE. Toda decisión técnica tomada en el backend debe poder trazarse hasta uno de los 3 pilares pedagógicos descritos en la sección 2.*
