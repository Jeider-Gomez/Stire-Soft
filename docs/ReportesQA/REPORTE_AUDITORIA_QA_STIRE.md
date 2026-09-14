# 📊 REPORTE DE AUDITORÍA DE CALIDAD Y PRUEBAS QA — STIRE-SOFT

> **Sistema Tutor Inteligente con Repetición Espaciada (STIRE)**  
> **Evaluación End-to-End, Análisis Forense de Código y Validación de Arquitectura**

---

| Campo | Información de Auditoría |
| :--- | :--- |
| **👤 Responsable de QA** | Jorge Cervantes |
| **📅 Fecha de Ejecución** | 12 de Septiembre de 2026 |
| **🏷️ Tipo de Reporte** | Auditoría Integral de QA, Cobertura E2E y Análisis de Brechas |
| **📦 Fuente Evaluada** | `Stire-Soft-main.zip` (Proyecto Comprimido Descomprimido) |
| **🔗 Archivo de Referencia** | `docs/00_VISION_FUNCIONAL.md` · `docs/01_ARQUITECTURA_Y_DISENO.md` · `docs/02_FLUJOS_Y_OPERACIONES.md` |
| **🏁 Estado del Proyecto** | ⚠️ **INCOMPLETO / EN DESARROLLO PARCIAL (~65% de Avance Real)** |
| **🚨 Dictamen de Calidad** | 🔴 **NO APTO PARA PRODUCCIÓN (RECHAZADO PARA DESPLIEGUE)** |

---

## 📈 1. Panel Principal de Métricas (Dashboard QA)

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ESTADO GLOBAL DEL PROYECTO                           │
├──────────────────────────┬───────────────────────────┬───────────────────────────┤
│   PRUEBAS UNITARIAS JEST │   COMPILACIÓN BACKEND TS  │   BUILD FRONTEND NUXT 3   │
│   ✅ 305 / 305 PASADAS   │   ✅ EXIT CODE 0 (NEST)   │   ✅ EXIT CODE 0 (NITRO)  │
├──────────────────────────┼───────────────────────────┼───────────────────────────┤
│   COBERTURA DE VISTAS UI │   INTEGRACIÓN SANDBOX     │   SEGURIDAD & RBAC        │
│   ⚠️ 9 / 19 IMPLEMENTADAS │   🔴 MOCK LOCAL EN CLIENTE│   ⚠️ P1/P2 VULNERABILIDADES │
└──────────────────────────┴───────────────────────────┴───────────────────────────┘
```

---

## 📑 2. Matriz General de Evaluación por Módulo y Capa

| Módulo del Sistema | Estado Metodológico | Avance Real | Puntos Fuertes (Verificados) | Brechas Críticas y Fallas Abiertas |
| :--- | :---: | :---: | :--- | :--- |
| **1. Autenticación & Usuarios** | 🟡 PARCIAL | **85%** | Password hashing (`bcrypt`), JWT firmado y guards RBAC (`admin`, `docente`, `estudiante`). | Falta flujo de auto-registro docente. Parpadeo en recarga por carrera en middleware de Nuxt. |
| **2. Jerarquía Académica & RBAC** | 🔴 INCOMPLETO | **60%** | MER relacional de 5 niveles cumplido en DB. Aislamiento BOLA en NestJS (`AuthorizationService`). | Sin formulario visual para crear clases en `/docente/index.vue`. Vistas `DOC-V02..V06` y `ADM` sin backend real. |
| **3. Ejercicio, Envío & Sandbox** | 🔴 INCOMPLETO | **50%** | Evaluadores síncronos (`MCQ`, `FILL_CODE`, `DRAG_DROP`, `ORDERING`, `MATCHING`) y Sandbox endurecido en NestJS. | `workspace.ts` usa `new Function(...)` local. Sin polling UI para notas `CODING` asíncronas. Vulnerabilidades P1-07 y P2-R3. |
| **4. Tutor IA & Repetición (SM-2)** | 🟡 PARCIAL | **80%** | Prompt socrático RAG con contexto de estudiante y unidad. Algoritmo SM-2 calcula intervalos y `easeFactor`. | Vulnerabilidad Self-XSS (P2-R4) en el chat del tutor. Falta trazabilidad RAG con `activity_logs`. |

---

## 🔍 3. Auditoría Detallada de los 4 Flujos Principales

---

### 🔑 Flujo 1: Autenticación y Registro (`Login`)
> **Especificación:** `docs/02_FLUJOS_Y_OPERACIONES.md` §1.1 (Paso 1) & `docs/01_ARQUITECTURA_Y_DISENO.md` §6.1

#### Matriz de Verificación de Componentes:

| Componente / Endpoint | Estado | Resultado Obtenido | Observación Técnica |
| :--- | :---: | :--- | :--- |
| `POST /auth/register` | ✅ PASÓ | Registra usuario en tabla `users`. | Hashing seguro con bcrypt. Asigna rol `estudiante` por defecto. |
| `POST /auth/login` | ✅ PASÓ | Retorna token JWT firmado. | Payload contiene `userId`, `role` y `fullName`. |
| `JwtStrategy` & `RolesGuard` | ✅ PASÓ | Protege rutas autenticadas. | Retorna `401 Unauthorized` / `403 Forbidden` según corresponda. |
| `frontend-nuxt/pages/login.vue` | ⚠️ PARCIAL | Renderiza formulario de acceso. | Parpadeo hacia login al recargar por hidratación tardía del token en Pinia. |

---

### 🏫 Flujo 2: Jerarquía Académica y Roles (`Navegación & RBAC`)
> **Especificación:** `docs/00_VISION_FUNCIONAL.md` §4 & `docs/01_ARQUITECTURA_Y_DISENO.md` §6.2  
> **Jerarquía Exigida:** `Clase` → `Sección (Corte)` → `Tema (Topic)` → `Unidad de Aprendizaje` → `Contenido` / `Actividad`

#### Matriz de Cobertura de Vistas e Interfaces (Frontend vs Backend):

| Nivel Jerárquico / Vista | Disponibilidad Backend API | Disponibilidad Frontend Nuxt 3 | Estado de Integración |
| :--- | :---: | :---: | :---: |
| **Gestión de Clases (`Class`)** | ✅ CRUD Completo (`/class`) | ⚠️ Vista parcial (`/docente/index.vue`) | 🔴 **ROTO**: Botón "+ Crear Nueva Clase" no tiene modal ni formulario. |
| **Inscripción (`Enrollment`)** | ✅ `POST /enrollment/join` | ✅ Pantalla Estudiante (`/estudiante`) | ✅ Unirse por código y aprobación `PENDING` funcionan en API. |
| **Secciones y Temas (`Section`/`Topic`)** | ✅ Endpoints creados | 🔴 Sin creador visual UI | 🔴 El docente no puede estructurar su currículo desde la web. |
| **Unidades de Aprendizaje (`LU`)** | ✅ Endpoints creados | ✅ Vista Estudiante (`/unidad/[id]`) | 🟡 Funcional para estudiante; inaccesible para edición docente. |
| **Vistas Docente (`DOC-V02..V06`)** | ✅ APIs de Analítica listas | 🔴 Mockup con datos de ejemplo | 🔴 Muestra la leyenda *"⚠ Ejemplo — sin backend"*. |
| **Vistas Admin (`ADM-V01..V03`)** | ✅ `GET /users` funcional | 🔴 Mockup con datos de ejemplo | 🔴 Incompleto en interfaz de usuario. |

---

### 🧪 Flujo 3: Evaluación y Sandbox (`Ejercicio y Envío`)
> **Especificación:** `docs/01_ARQUITECTURA_Y_DISENO.md` §6.3–6.4 & `docs/02_FLUJOS_Y_OPERACIONES.md` §1.1 (Pasos 4 y 5)

#### Matriz de Estrategias del Motor de Evaluación:

| Tipo de Pregunta | Evaluador Backend | Ejecución Sandbox | Integración Frontend Nuxt | Estado General |
| :--- | :---: | :---: | :---: | :---: |
| `MCQ` (Opción Múltiple) | ✅ Implementado | N/A (Síncrono) | ✅ Componente interactivo | ✅ **OPERATIVO** |
| `FILL_CODE` (Completar) | ✅ Implementado | N/A (Síncrono) | ✅ Componente interactivo | ✅ **OPERATIVO** |
| `DRAG_DROP` (Arrastrar) | ✅ Implementado | N/A (Síncrono) | ✅ Componente interactivo | ✅ **OPERATIVO** |
| `ORDERING` (Ordenar) | ✅ Implementado | N/A (Síncrono) | ✅ Componente interactivo | ✅ **OPERATIVO** |
| `MATCHING` (Emparejar) | ✅ Implementado | N/A (Síncrono) | ✅ Componente interactivo | ✅ **OPERATIVO** |
| `CODING` (Programación) | ✅ Implementado | ✅ Proceso hijo aislado | 🔴 `workspace.ts` usa `new Function` local | 🔴 **DESCONECTADO EN UI** |
| `ai_evaluated` (Evaluación IA) | 🔴 Sin Registrador | N/A | 🔴 Sin componente | 🔴 **ERROR 400 EN API** |

---

### 🤖 Flujo 4: Tutoría Inteligente y Repetición (`Tutor IA & SM-2`)
> **Especificación:** `docs/00_VISION_FUNCIONAL.md` §2.2–2.3 & `docs/01_ARQUITECTURA_Y_DISENO.md` §6.5

#### Matriz de Capacidades Adaptativas:

| Característica | Componente Backend | Estado | Evaluación y Hallazgos |
| :--- | :--- | :---: | :--- |
| **Prompt Socrático RAG** | `src/tutor/tutor.service.ts` | ✅ PASÓ | Inyecta dominio (`mastery`), nivel del alumno y prompt pedagógico que guía sin dar la solución directa. |
| **Fallback LLM Provider** | `OpenAI` / `Gemini` / `Local Mock` | ✅ PASÓ | Si la API Key no está presente en `.env`, conmuta automáticamente al mock local sin romper la ejecución. |
| **Algoritmo SM-2** | `src/review-schedules/` | ✅ PASÓ | Calcula `nextReviewDate`, `urgencyLevel` (0 a 3) e `intervalDays`. Persiste el `easeFactor`. |
| **Sanitización Chat Client** | `TutorChatDrawer.vue` | 🔴 FALLÓ | **Vulnerabilidad P2-R4**: Renderizado local utiliza `dangerouslySetInnerHTML` sin escapar HTML de usuario. |

---

## 🐛 4. Registro Consolidado de Vulnerabilidades y Errores (Findings Report)

| ID | Severidad | Módulo Afectado | Resumen del Defecto / Hallazgo | Impacto en Negocio / Seguridad | Solución Técnica Requerida |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **P1-07** | 🔴 ALTA | Backend (`submissions`) | Ausencia de restricción `UNIQUE` en tabla `submissions` para borradores activos. | Peticiones simultáneas abren múltiples intentos activos y alteran el motor SM-2. | Agregar índice único condicional para `(studentId, activityId)` donde `status='IN_PROGRESS'`. |
| **P1-08** | 🔴 ALTA | Backend (`events`) | Pérdida de eventos `submission.graded` si la transacción principal falla. | Desincronización entre la nota real del código y el progreso acumulado en `LearningProgress`. | Implementar patrón Outbox / transacción atómica para despacho de eventos de dominio. |
| **P2-R3** | 🟡 MEDIA | Backend (`authorization`) | `POST /submissions/start` no verifica si el alumno está matriculado (`ENROLLED`). | Acceso no autorizado a ejercicios por estudiantes no inscritos en el curso. | Inyectar `assertEnrolledInClass` en el controlador de inicio de entregas. |
| **P2-R4** | 🟡 MEDIA | Frontend (`tutor`) | Uso de `dangerouslySetInnerHTML` en mensajes del chat del Tutor IA. | Ejecución de scripts en el navegador del estudiante (Vulnerabilidad Self-XSS). | Reemplazar por interpolación segura de texto `{{ msg.content }}` o sanitizar con DOMPurify. |
| **FE-01** | 🟡 MEDIA | Frontend (`workspace`) | `stores/workspace.ts` usa `new Function(...)` en el cliente para "Probar código". | Bypass del Sandbox real del servidor NestJS (`POST /submissions/:id/run`). | Conectar la tienda de Pinia con la API real `POST /submissions/:id/run`. |
| **FE-02** | 🟡 MEDIA | Frontend (`ui-docente`) | Botón "+ Crear Nueva Clase" sin modal/formulario en `/docente/index.vue`. | El docente queda imposibilitado de crear cursos desde la interfaz web. | Construir el formulario modal conectado a `POST /class`. |
| **FE-03** | 🟡 MEDIA | Frontend (`ui-async`) | Ausencia de polling/websockets para visualizar nota de entregas `CODING` asíncronas. | El estudiante se queda en estado "Enviado" sin ver su nota final en pantalla. | Implementar polling a `GET /submissions/:id` en la pantalla de resultado. |
| **BE-01** | 🟢 BAJA | Backend (`evaluation`) | Tipo de actividad `ai_evaluated` no posee evaluador registrado. | Lanza `BadRequestException` ("Tipo no soportado") al calificar. | Registrar una estrategia para `ai_evaluated` o remover el tipo del catálogo activo. |

---

## 🏁 5. Conclusión, Dictamen y Recomendaciones

```text
===================================================================================
                       DICTAMEN FINAL DE LA AUDITORÍA QA
===================================================================================
  VEREDICTO: 🔴 RECHAZADO PARA DESPLIEGUE (NO APTO PARA PRODUCCIÓN)
  PORCENTAJE DE CUMPLIMIENTO REAL: 65%
  SUITE UNITARIA (BACKEND): 100% PASADA (305/305 TESTS)
  ESTADO DE INTEGRACIÓN E2E: INCOMPLETO Y CON BRECHAS DE SEGURIDAD
===================================================================================
```

### 📋 Hoja de Ruta Prioritaria para Desarrollo (Next Steps):

1. 🛠️ **Conexión del Sandbox Real:** Reemplazar el `new Function(...)` en `frontend-nuxt/stores/workspace.ts` por la llamada HTTP `POST /submissions/:id/run`.
2. 🎨 **Construcción de UI Docente:** Diseñar e integrar el formulario modal de creación de clases (`POST /class`) y el constructor de contenido.
3. 🔒 **Resolución de Vulnerabilidades:**
   - Aplicar restricción `UNIQUE` en la base de datos para `submissions` (Fix P1-07).
   - Sanitizar la renderización del chat del Tutor IA para erradicar el Self-XSS (Fix P2-R4).
   - Validar la matrícula previa en el inicio de entregas (Fix P2-R3).
4. 🔄 **Calificación Asíncrona:** Agregar un temporizador de polling en la vista de entregas para recuperar la calificación diferida de ejercicios de programación.

---
*Reporte generado por Jorge Cervantes — Área de Calidad y Pruebas QA.*
