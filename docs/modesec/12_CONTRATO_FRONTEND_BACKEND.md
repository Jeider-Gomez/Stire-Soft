---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
fuente:     normativo
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 🤝 Insumo 12 — Contrato Técnico Frontend ↔ Backend

**Proyecto:** STIRE-Soft  
**Propósito:** Especificar el flujo de datos exacto por cada ventana: Componente Vue -> Endpoint -> Payload -> Respuesta -> Mapeo UI.  
**Fecha:** 30 de agosto de 2026  

---

## 1. Contrato por Ventana MODESEC

### `COMP-V00` · Ingreso y Autenticación
* **Componente:** `views/auth/LoginView.vue`
* **Trigger:** Submit del formulario.
* **Request:** `POST /auth/login` `{ email: "est@unicor.edu.co", password: "rawPassword" }`
* **Response `200 OK`:**
  ```json
  {
    "user": { "id": 12, "email": "est@unicor.edu.co", "fullName": "Pedro Estudiante", "role": "estudiante" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Manejo UI:** Guardar token en `useCookie('auth_token', { httpOnly: false })`, guardar `user` en Pinia `useAuthStore()`, navegar a `/estudiante/dashboard`.
* **Mapeo de Errores:** `401 Unauthorized` -> `ErrorAlert` con "Credenciales inválidas o cuenta inactiva".

---

### `EST-V01` · Inicio
* **Componente:** `views/estudiante/DashboardView.vue`
* **Trigger:** Carga inicial (`onMounted`).
* **Request 1:** `GET /enrollment/my` (Header: `Authorization: Bearer <token>`)
  * **Response `200 OK`:** `Enrollment[]` con objetos `{ class: { id, name, code, teacher: { fullName } } }`.
* **Request 2:** `GET /analytics/student/:studentId`
  * **Response `200 OK`:**
    ```json
    {
      "summary": { "avgMastery": 72.5, "avgSuccessRate": 80.0, "reviewStats": { "pending": 2, "total": 5 } },
      "recentSubmissions": [ ... ],
      "masteryByUnit": [ { "unitId": 3, "unitTitle": "Ciclos While", "mastery": 65 } ]
    }
    ```
* **Manejo UI:** Almacenar en `useProgressStore()`. Si `enrollments.length === 0`, renderizar `EmptyState`.

---

### `EST-V03` · Resolución de Ejercicio en Sandbox
* **Componente:** `views/estudiante/ExerciseView.vue`
* **Paso 1 (Inicio):** `POST /submissions/start` `{ activityId: 5 }`
  * **Response `201 Created`:** `{ id: "uuid-sub-1", attemptNumber: 2, status: "in_progress" }`
* **Paso 2 (Autosave en vivo):** `PUT /submissions/:id/autosave` `{ answers: [ { questionId: 10, answer: { code: "let x = 0;" } } ] }`
  * **Response `200 OK`:** Actualiza indicador en footer: "Autoguardado a las 16:30 ✔".
* **Paso 3 (Entrega definitiva):** `POST /submissions/:id/submit` `{ answers: [ { questionId: 10, answer: { code: "function sol()..." } } ] }`
  * **Response `200 OK`:**
    ```json
    {
      "submissionId": "uuid-sub-1",
      "totalScore": 100,
      "status": "graded"
    }
    ```
* **Manejo UI:** Disparar animación de éxito, actualizar `MasteryProgressBar` y mostrar desglose de casos de prueba superados.

---

### `EST-V04` · Tutor IA
* **Componente:** `components/tutor/TutorChatDrawer.vue`
* **Trigger:** Clic en "Enviar" o `Ctrl+Enter`.
* **Request:** `POST /tutor/chat` `{ message: "¿Por qué mi ciclo no se detiene cuando el arreglo termina?" }`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Veo que estás recorriendo el arreglo. ¿Qué valor toma tu índice en la última iteración y cómo se compara con longitud - 1?"
  }
  ```
* **Manejo UI:** Agregar respuesta a la línea de tiempo del chat, reproducir scroll suave al final, habilitar input.

---

### `DOC-V04` · Analítica de Cohorte y Alertas
* **Componente:** `views/docente/ClassAnalyticsView.vue`
* **Trigger:** `GET /analytics/class/:classId`
* **Response `200 OK`:**
  ```json
  {
    "classId": 4,
    "className": "Algoritmia I - G1",
    "metrics": { "totalStudents": 28, "avgClassMastery": 68.4, "totalSubmissions": 142 },
    "studentRankings": [
      { "studentId": 12, "fullName": "Ana Gómez", "avgMastery": 92.0, "successRate": 95.0, "submissionsCount": 8 },
      { "studentId": 15, "fullName": "Carlos Ruíz", "avgMastery": 38.0, "successRate": 40.0, "submissionsCount": 3 }
    ]
  }
  ```
* **Manejo UI:** Los estudiantes con `avgMastery < 50` se marcan automáticamente con `RiskIndicatorBadge` ("Alerta Cognitiva / Rezago") para intervención docente.
