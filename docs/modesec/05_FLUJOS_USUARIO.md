---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 🚶 Insumo 05 — Flujos Principales de Usuario (User Journeys)

**Proyecto:** STIRE-Soft  
**Norma:** MODESEC §3.3.3 / Flujos Didácticos y de Gestión  
**Fecha:** 30 de agosto de 2026  

---

## 1. Journey Principal del Estudiante (Aprendizaje Adaptativo y Práctica)

```mermaid
sequenceDiagram
    autonumber
    actor E as 🎓 Estudiante
    participant UI as Vue 3 / Nuxt (Frontend)
    participant API as NestJS Backend
    participant DB as Base de Datos MySQL
    participant SBX as Hardened Sandbox
    participant AI as Tutor IA (Gemini)

    E->>UI: Ingresa a STIRE y se autentica
    UI->>API: POST /auth/login
    API-->>UI: Retorna JWT Token + Rol (estudiante)
    UI->>E: Renderiza EST-V01 (Inicio)

    opt Matrícula en Clase
        E->>UI: Ingresa código de clase en EST-V01
        UI->>API: POST /enrollment/join { code }
        API-->>UI: Matrícula confirmada
    end

    E->>UI: Selecciona Unidad Temática en menú
    UI->>API: GET /learning-unit/:id + GET /content/unit/:id
    API-->>UI: Contenido teórico, código y trazados
    UI->>E: Muestra EST-V02 (Teoría interactiva)

    E->>UI: Clic en "Comenzar Reto Práctico"
    UI->>API: POST /submissions/start { activityId }
    API-->>UI: Retorna intento (status: in_progress)
    UI->>E: Abre EST-V03 (Resolución de ejercicio en editor)

    loop Edición y Prueba Libre
        E->>UI: Escribe código en el editor
        UI->>API: PUT /submissions/:id/autosave (en segundo plano)
        opt Pide Orientación Socrática
            E->>UI: Abre EST-V04 (Tutor modal) y consulta duda
            UI->>API: POST /tutor/chat { message }
            API->>AI: Inferencia con System Prompt + Mastery + Nivel
            AI-->>API: Pregunta guía socrática
            API-->>UI: Muestra pista sin dar la respuesta
        end
    end

    E->>UI: Clic en "Entregar Solución Definitiva"
    UI->>API: POST /submissions/:id/submit
    API->>SBX: Ejecuta código contra casos de prueba aislados
    SBX-->>API: Veredicto (Accepted / Wrong Answer / Error)
    API->>DB: Actualiza LearningProgress (Mastery & SuccessRate)
    API->>DB: Calcula ReviewSchedule (Fecha SM-2)
    API-->>UI: Retorna score y retroalimentación
    UI->>E: Muestra veredicto y actualiza Mastery Bar

    opt Repaso Espaciado
        E->>UI: Abre EST-V05 (Repasos)
        UI->>API: GET /analytics/student/:id
        API-->>UI: Lista de unidades urgentes por vencer
        UI->>E: Inicia sesión de consolidación SM-2
    end
```

---

## 2. Journey Principal del Docente (Gestión Curricular y Supervisión de Cohorte)

```mermaid
sequenceDiagram
    autonumber
    actor D as 👨‍🏫 Docente
    participant UI as Vue 3 / Nuxt (Frontend)
    participant API as NestJS Backend

    D->>UI: Login con credenciales de docente
    UI->>API: POST /auth/login
    API-->>UI: JWT Token + Rol (docente)
    UI->>D: Renderiza DOC-V01 (Panel de Mis Clases)

    D->>UI: Crea nueva clase "Algoritmia 2026-2"
    UI->>API: POST /class { name, code, maxStudents }
    API-->>UI: Clase creada + Código de invitación

    D->>UI: Navega a DOC-V02 (Gestor de Contenidos)
    D->>UI: Agrega Unidad Temática "Grafos y Recorridos BFS"
    UI->>API: POST /learning-unit { title, difficulty, topicId }
    API-->>UI: Unidad creada en estado borrador

    D->>UI: Navega a DOC-V03 (Diseñador de Ejercicios)
    D->>UI: Redacta enunciado y define casos de prueba (públicos y privados)
    UI->>API: POST /activities + POST /activity-questions
    API-->>UI: Ejercicio guardado

    D->>UI: Abre DOC-V04 (Analítica de Cohorte)
    UI->>API: GET /analytics/class/:id
    API-->>UI: Métricas de maestría promedio, tasas de error y ranking
    UI->>D: Muestra cuadrante de riesgo cognitivo para intervenir en aula
```

---

## 3. Journey Principal del Administrador (Gobernanza y Salud del Entorno)

```mermaid
sequenceDiagram
    autonumber
    actor A as 🛡️ Administrador
    participant UI as Vue 3 / Nuxt (Frontend)
    participant API as NestJS Backend

    A->>UI: Login con cuenta administrativa
    UI->>API: POST /auth/login
    API-->>UI: JWT Token + Rol (admin)
    UI->>A: Renderiza ADM-V01 (Panel de Control Global)

    A->>UI: Navega a ADM-V02 (Gestión de Usuarios)
    UI->>API: GET /users
    API-->>UI: Lista paginada de usuarios con roles y estados
    A->>UI: Asigna rol "docente" a nuevo profesor
    UI->>API: PATCH /users/:id { role: "docente" }
    API-->>UI: Permisos actualizados

    A->>UI: Abre ADM-V03 (Salud y Mantenimiento)
    Note over UI,API: ⚠️ PROPUESTO — NO IMPLEMENTADO: solo existe POST /maintenance/cleanup
    UI--xAPI: GET /maintenance (no existe)
```
