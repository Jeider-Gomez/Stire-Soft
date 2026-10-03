# 📊 INFORME DE AUDITORÍA Y EVALUACIÓN QA — STIRE-SOFT

> **Plataforma:** Sistema Tutor Inteligente con Repetición Espaciada (STIRE)  
> **Auditor Responsable:** Jorge Cervantes (Calidad y Pruebas QA)  
> **Fecha de Evaluación:** 12 de Septiembre de 2026  
> **Repositorio / Versión:** `Stire-Soft-main.zip` (Proyecto Comprimido)

---

## 📌 ÍNDICE DE CONTENIDOS

1. [📋 Ficha Técnica y Resumen Ejecutivo](#-1-ficha-técnica-y-resumen-ejecutivo)
2. [📈 Panel de Métricas de Calidad](#-2-panel-de-métricas-de-calidad)
3. [📑 Matriz de Cumplimiento por Módulo](#-3-matriz-de-cumplimiento-por-módulo)
4. [🔍 Auditoría Detallada por Flujo Principal](#-4-auditoría-detallada-por-flujo-principal)
   - [4.1 Flujo de Autenticación (Login / Registro)](#41-flujo-de-autenticación-login--registro)
   - [4.2 Flujo de Navegación y Estructura Académica (RBAC)](#42-flujo-de-navegación-y-estructura-académica-rbac)
   - [4.3 Flujo de Ejercicios y Sandbox de Código](#43-flujo-de-ejercicios-y-sandbox-de-código)
   - [4.4 Flujo de Tutoría Inteligente y Repetición Espaciada (SM-2)](#44-flujo-de-tutoría-inteligente-y-repetición-espaciada-sm-2)
5. [🐛 Matriz Clasificada de Hallazgos y Vulnerabilidades](#-5-matriz-clasificada-de-hallazgos-y-vulnerabilidades)
6. [🏁 Dictamen Final y Plan de Acción](#-6-dictamen-final-y-plan-de-acción)

---

## 📋 1. FICHA TÉCNICA Y RESUMEN EJECUTIVO

| Parámetro | Detalle |
| :--- | :--- |
| **Proyecto** | STIRE-Soft (NestJS + Nuxt 3 + TypeORM + SQLite/MariaDB) |
| **Documentación Base** | `docs/00_VISION_FUNCIONAL.md` · `docs/01_ARQUITECTURA_Y_DISENO.md` · `docs/02_FLUJOS_Y_OPERACIONES.md` |
| **Objetivo QA** | Validar flujos principales, motor de evaluación, RBAC, tutoría RAG y estabilidad global |
| **Resultado Pruebas Unitarias** | ✅ 41 / 41 Test Suites Pasadas (305 / 305 Pruebas backend exitosas) |
| **Resultado Compilación** | ✅ NestJS Build (Exit code 0) · Nuxt 3 Build (Exit code 0) |
| **Estado Real del Proyecto** | ⚠️ **INCOMPLETO / EN DESARROLLO PARCIAL (~65% de Avance Funcional)** |
| **Dictamen Final** | 🔴 **RECHAZADO PARA PRODUCCIÓN (NO APTO)** |

---

## 📈 2. PANEL DE MÉTRICAS DE CALIDAD

```text
===================================================================================
                       DASHBOARD DE VERIFICACIÓN TÉCNICA
===================================================================================
  [ Backend Unit Tests ]   ------------------------------ 100% PASS (305/305)
  [ Compilación NestJS ]   ------------------------------ 100% OK (0 Errores TS)
  [ Empaquetado Nuxt 3 ]   ------------------------------ 100% OK (Nitro Build)
  [ Cobertura Vistas UI]   ====================..........  60% (9 de 19 Pantallas)
  [ Integración Sandbox]   ==============................  50% (Bypass local JS)
  [ Seguridad & RBAC   ]   =================.............  75% (4 Fallas P1/P2)
===================================================================================
```

---

## 📑 3. MATRIZ DE CUMPLIMIENTO POR MÓDULO

| # | Módulo del Sistema | Estado | Avance | Componentes Operativos | Brechas Críticas Detectadas |
| :-: | :--- | :---: | :-: | :--- | :--- |
| **1** | **Autenticación (Auth)** | 🟡 Parcial | **85%** | Login JWT, Bcrypt hash, Guards RBAC (`admin`, `docente`, `estudiante`). | Sin auto-registro para docentes. Redirección intermitente en recarga de Nuxt. |
| **2** | **Estructura Académica** | 🔴 Incompleto | **60%** | MER relacional 5 niveles, Aislamiento BOLA (`assertTeacherOwnsClass`). | Sin formulario visual para crear clases. Vistas de Docente/Admin con mockups. |
| **3** | **Motor de Evaluación** | 🔴 Incompleto | **50%** | 5 evaluadores síncronos (`MCQ`, `FILL_CODE`, `DRAG_DROP`, `ORDERING`, `MATCHING`). | `workspace.ts` usa `new Function()` local. Sin polling UI para notas `CODING`. |
| **4** | **Tutor IA & SM-2** | 🟡 Parcial | **80%** | RAG Socrático, Fallback a local mock, Algoritmo SM-2 y urgencia. | Vulnerabilidad Self-XSS en chat (P2-R4). Sin integración de `activity_logs`. |

---

## 🔍 4. AUDITORÍA DETALLADA POR FLUJO PRINCIPAL

### 4.1 Flujo de Autenticación (Login / Registro)
> **Referencia:** `docs/02_FLUJOS_Y_OPERACIONES.md` §1.1 (Paso 1)

* **Componentes Evaluados:** `POST /auth/register`, `POST /auth/login`, `JwtStrategy`, `RolesGuard`.
* **Resultado:** 🟡 **PARCIALMENTE OPERATIVO**

```text
[Cliente Nuxt] ---> (POST /auth/login) ---> [AuthService NestJS] ---> [Genera JWT]
     │                                               │
     └──> Guardado de Token en Pinia Store <─────────┘
```

| Prueba Realizada | Criterio de Aceptación | Estado | Observación QA |
| :--- | :--- | :---: | :--- |
| **Registro Estudiante** | Crear usuario rol `estudiante` con hash bcrypt. | ✅ PASÓ | Funciona correctamente. |
| **Inicio de Sesión** | Generar token JWT con `userId`, `role` y `fullName`. | ✅ PASÓ | Firma y expira correctamente. |
| **Protección RBAC** | Denegar acceso no autorizado con HTTP 403. | ✅ PASÓ | `RolesGuard` intercepta peticiones. |
| **Registro Docente UI** | Permitir registro autónomo para rol `docente`. | 🔴 FALLÓ | Asigna por defecto rol `estudiante`. |
| **Persistencia Sesión** | Mantener sesión activa al recargar la ventana. | ⚠️ ALERTA | Parpadeo hacia login por carrera en Nuxt. |

---

### 4.2 Flujo de Navegación y Estructura Académica (RBAC)
> **Referencia:** `docs/00_VISION_FUNCIONAL.md` §4 & `docs/01_ARQUITECTURA_Y_DISENO.md` §6.2  
> **Jerarquía Exigida:** `Clase` → `Sección` → `Tema` → `Unidad de Aprendizaje` → `Contenido/Actividad`

* **Componentes Evaluados:** `ClassModule`, `SectionModule`, `TopicModule`, `LearningUnitModule`, `EnrollmentModule`.
* **Resultado:** 🔴 **INCOMPLETO EN FRONTEND**

```text
Jerarquía Backend (MariaDB/TypeORM):
Clase (Class) ──► Sección (Section) ──► Tema (Topic) ──► Unidad (LearningUnit)
```

| Nivel Jerárquico | Cobertura Backend API | Cobertura Frontend Nuxt | Estado de Integración |
| :--- | :---: | :---: | :---: |
| **1. Clases (`Class`)** | ✅ CRUD Completo (`/class`) | ⚠️ Vista Parcial (`/docente`) | 🔴 **ROTO:** Botón "+ Crear Nueva Clase" sin formulario modal. |
| **2. Inscripción (`Enrollment`)** | ✅ `POST /enrollment/join` | ✅ Pantalla Estudiante | ✅ Funciona con código y estado `PENDING`. |
| **3. Secciones y Temas** | ✅ Endpoints en NestJS | 🔴 Sin creador visual | 🔴 Docente no puede estructurar temas desde la web. |
| **4. Unidades de Aprendizaje** | ✅ Endpoints en NestJS | ✅ Vista Estudiante | 🟡 Estudiante navega; Docente no puede editar. |
| **5. Vistas Docente/Admin** | ✅ APIs de Analíticas | 🔴 Mockups con datos demo | 🔴 Muestran *"⚠ Ejemplo — sin backend"*. |

---

### 4.3 Flujo de Ejercicios y Sandbox de Código
> **Referencia:** `docs/01_ARQUITECTURA_Y_DISENO.md` §6.3–6.4 & `docs/02_FLUJOS_Y_OPERACIONES.md` §1.1 (Pasos 4-5)

* **Componentes Evaluados:** `EvaluationEngineService`, `HardenedProcessSandboxAdapter`, `SubmissionsService`.
* **Resultado:** 🔴 **DESCONECTADO EN CLIENTE Y CON BRECHAS**

```text
Flujo Real Backend (Sandbox):
[Estudiante] ──> (POST /submissions/:id/run) ──> [HardenedProcessSandbox] ──> [Salida Segura]

Flujo Detectado en Frontend (Actual):
[Estudiante] ──> (new Function() en Navegador) ──> ❌ BYPASS DEL SERVIDOR REAL
```

| Tipo de Pregunta | Evaluador Backend | Exec Sandbox | Componente Nuxt | Estado General |
| :--- | :---: | :---: | :---: | :---: |
| **MCQ** (Selección Múltiple) | ✅ Implementado | N/A | ✅ Interactivo | ✅ **OPERATIVO** |
| **FILL_CODE** (Completar) | ✅ Implementado | N/A | ✅ Interactivo | ✅ **OPERATIVO** |
| **DRAG_DROP** (Arrastrar) | ✅ Implementado | N/A | ✅ Interactivo | ✅ **OPERATIVO** |
| **ORDERING** (Ordenar) | ✅ Implementado | N/A | ✅ Interactivo | ✅ **OPERATIVO** |
| **MATCHING** (Emparejar) | ✅ Implementado | N/A | ✅ Interactivo | ✅ **OPERATIVO** |
| **CODING** (Programación) | ✅ Implementado | ✅ Proceso Hijo | 🔴 Usa `new Function` | 🔴 **BYPASS LOCAL** |
| **ai_evaluated** (Evaluación IA) | 🔴 Sin Evaluador | N/A | 🔴 Inexistente | 🔴 **ERROR 400 API** |

---

### 4.4 Flujo de Tutoría Inteligente y Repetición Espaciada (SM-2)
> **Referencia:** `docs/00_VISION_FUNCIONAL.md` §2.2–2.3 & `docs/01_ARQUITECTURA_Y_DISENO.md` §6.5

* **Componentes Evaluados:** `TutorService`, `ReviewSchedulesService`, `LearningProgressService`.
* **Resultado:** 🟡 **PARCIALMENTE OPERATIVO**

| Característica | Componente Backend | Estado | Evaluación QA |
| :--- | :--- | :---: | :--- |
| **RAG Socrático** | `src/tutor/tutor.service.ts` | ✅ PASÓ | Contextualiza con `mastery`, unidad y guía sin dar respuestas directas. |
| **Fallback LLM** | `OpenAI` / `Gemini` / `Mock` | ✅ PASÓ | Conmuta a mock local si falta API Key en `.env`. |
| **Algoritmo SM-2** | `src/review-schedules/` | ✅ PASÓ | Calcula `nextReviewDate`, `urgencyLevel` (0 a 3) e `intervalDays`. |
| **Sanitización UI** | `TutorChatDrawer.vue` | 🔴 FALLÓ | **Vulnerabilidad P2-R4:** Renderizado local usa `dangerouslySetInnerHTML`. |

---

## 🐛 5. MATRIZ CLASIFICADA DE HALLAZGOS Y VULNERABILIDADES

### 🔴 Prioridad 1 (P1) — Críticas / Alta Severidad

| Código | Módulo | Descripción del Hallazgo | Causa Raíz | Impacto en Producción |
| :---: | :--- | :--- | :--- | :--- |
| **P1-07** | Backend (`submissions`) | Ausencia de restricción `UNIQUE` en borradores activos. | Falta índice único condicional en DB para `(studentId, activityId)`. | Peticiones simultáneas abren entregas duplicadas y corrompen el SM-2. |
| **P1-08** | Backend (`events`) | Evento `submission.graded` desincronizado en caso de error. | Transacción de calificación no usa patrón Outbox atómico. | Inconsistencia entre la nota obtenida y el avance en `LearningProgress`. |

### 🟡 Prioridad 2 (P2) — Severidad Media / Inconsistencia Funcional

| Código | Módulo | Descripción del Hallazgo | Causa Raíz | Impacto en Producción |
| :---: | :--- | :--- | :--- | :--- |
| **P2-R3** | Backend (`auth`) | `POST /submissions/start` no valida matrícula activa (`ENROLLED`). | Omisión de `assertEnrolledInClass` en el controlador. | Estudiantes no inscritos pueden iniciar actividades conociendo su ID. |
| **P2-R4** | Frontend (`tutor`) | Uso de `dangerouslySetInnerHTML` en chat del Tutor IA. | Renderizado directo de HTML de usuario sin sanear. | Riesgo de ejecución de scripts no autorizados (Self-XSS). |
| **FE-01** | Frontend (`workspace`) | `workspace.ts` usa `new Function(...)` para "Probar código". | Bypass del servidor real NestJS en la tienda de Pinia. | Omisión del Sandbox de seguridad del servidor (`POST /submissions/:id/run`). |
| **FE-02** | Frontend (`ui-docente`) | Botón "+ Crear Nueva Clase" sin formulario en `/docente/index.vue`. | Ausencia del componente modal de creación. | El docente no puede registrar nuevos cursos desde la web. |
| **FE-03** | Frontend (`ui-async`) | Sin polling para recuperar notas `CODING` asíncronas. | Falta temporizador de consulta en el cliente. | El estudiante se queda en estado "Enviado" sin ver su nota final. |

### 🟢 Prioridad 3 (P3) — Severidad Baja / Deuda Técnica

| Código | Módulo | Descripción del Hallazgo | Causa Raíz | Impacto en Producción |
| :---: | :--- | :--- | :--- | :--- |
| **BE-01** | Backend (`evaluation`) | Tipo `ai_evaluated` no posee estrategia registrada. | `EvaluationEngineService` no mapea la estrategia. | Retorna HTTP 400 Bad Request al calificar este tipo. |

---

## 🏁 6. DICTAMEN FINAL Y PLAN DE ACCIÓN

```text
===================================================================================
                       VEREDICTO FINAL DE LA AUDITORÍA
===================================================================================
  ESTADO DEL PROYECTO : 🔴 RECHAZADO PARA DESPLIEGUE (NO APTO PARA PRODUCCIÓN)
  AVANCE FUNCIONAL    : ~65% REAL
  SUITE UNITARIA      : 100% PASADA (305 / 305 TESTS EN JEST)
  INTEGRACIÓN E2E     : INCOMPLETA CON PUNTOS ROTOS EN FRONTEND Y SEGURIDAD
===================================================================================
```

### 🛠️ Plan de Acción Priorizado para el Equipo de Desarrollo:

1. **Paso 1 — Conectar Sandbox Real (FE-01):**  
   Reemplazar `new Function(...)` en `frontend-nuxt/stores/workspace.ts` por la petición HTTP `POST /submissions/:id/run`.
2. **Paso 2 — Eliminar Vulnerabilidad Self-XSS (P2-R4):**  
   Sanitizar la renderización de mensajes en `TutorChatDrawer.vue` utilizando interpolación segura o DOMPurify.
3. **Paso 3 — Corregir Guarda de Entregas (P1-07 y P2-R3):**  
   Añadir restricción `UNIQUE` en la tabla `submissions` e inyectar la verificación de matrícula `assertEnrolledInClass` en `POST /submissions/start`.
4. **Paso 4 — Implementar Formulario de Clases (FE-02):**  
   Construir el modal interactivo en el frontend para permitir al docente crear cursos conectados a `POST /class`.
5. **Paso 5 — Habilitar Polling de Calificación Asíncrona (FE-03):**  
   Agregar consulta periódica a `GET /submissions/:id` para mostrar al alumno el resultado final del código calificado en segundo plano.

---
*Informe consolidado por Jorge Cervantes — Calidad y Pruebas QA.*
