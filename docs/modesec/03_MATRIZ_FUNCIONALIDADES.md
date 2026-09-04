# 🎯 Insumo 03 — Matriz de Funcionalidades por Rol

**Proyecto:** STIRE-Soft  
**Norma:** MODESEC Multi-Rol (Estudiante, Docente, Administrador)  
**Fecha:** 30 de agosto de 2026  

---

## Matriz Maestra de Funcionalidades

| Dominio Funcional | Funcionalidad Específica | Estudiante | Docente | Administrador | Endpoint Principal | Entidad Principal | Ventana MODESEC |
|---|---|:---:|:---:|:---:|---|---|---|
| **Autenticación** | Registro de cuenta | ✅ | ⚠️ (Vía Admin) | ✅ (Vía Admin) | `POST /auth/register` | `User` | `COMP-V00` |
| | Inicio de sesión (JWT) | ✅ | ✅ | ✅ | `POST /auth/login` | `User` | `COMP-V00` |
| | Consulta de perfil propio | ✅ | ✅ | ✅ | `GET /auth/profile` | `User` | Header común |
| **Clases & Aula** | Crear y editar aula/clase | ❌ | ✅ | ✅ | `POST /class`, `PATCH /class/:id` | `Class` | `DOC-V01` |
| | Matricularse mediante código | ✅ | ❌ | ❌ | `POST /enrollment/join` | `Enrollment` | `EST-V01` |
| | Listar mis clases inscritas | ✅ | ❌ | ❌ | `GET /enrollment/my` | `Enrollment` | `EST-V01` |
| | Listar mis clases dictadas | ❌ | ✅ | ❌ | `GET /class/my-classes` | `Class` | `DOC-V01` |
| | Ver estudiantes de una clase | ❌ | ✅ (Su clase) | ✅ | `GET /enrollment/class/:id` | `Enrollment` | `DOC-V01`, `DOC-V04` |
| **Contenidos** | Crear Módulos / Temas | ❌ | ✅ | ✅ | `POST /topic` | `Topic` | `DOC-V02` |
| | Crear Unidades de Aprendizaje | ❌ | ✅ | ✅ | `POST /learning-unit` | `LearningUnit` | `DOC-V02` |
| | Publicar/Ocultar unidades | ❌ | ✅ | ✅ | `PATCH /learning-unit/:id` | `LearningUnit` | `DOC-V02` |
| | Ver contenido teórico y trazados | ✅ | ✅ | ✅ | `GET /content/unit/:id` | `Content` | `EST-V02` |
| **Evaluaciones** | Diseñar ejercicios y casos | ❌ | ✅ | ✅ | `POST /activities`, `POST /activity-questions` | `Activity`, `ActivityQuestion` | `DOC-V03` |
| | Iniciar intento de evaluación | ✅ | ❌ | ❌ | `POST /submissions/start` | `Submission` | `EST-V03` |
| | Autoguardado en tiempo real | ✅ | ❌ | ❌ | `PUT /submissions/:id/autosave` | `Submission` | `EST-V03` |
| | Entregar solución y evaluar | ✅ | ❌ | ❌ | `POST /submissions/:id/submit` | `Submission`, `SubmissionAnswer` | `EST-V03` |
| **Dominio & SM-2**| Ver Mastery por unidad | ✅ (Propio) | ✅ (Cohorte) | ✅ | `GET /learning-progress/student/:id` | `LearningProgress` | `EST-V06`, `DOC-V05` |
| | Consultar repasos SM-2 | ✅ | ❌ | ❌ | `GET /analytics/student/:id` | `ReviewSchedule` | `EST-V05` |
| **Tutoría IA** | Chat socrático adaptativo | ✅ | ❌ | ❌ | `POST /tutor/chat` | `TutorConversation` | `EST-V04` |
| **Mensajería** | Enviar mensaje | ✅ | ✅ | ✅ | `POST /message` | `Message` | `DOC-V06` (docente); sin ventana asignada en estudiante — ver nota |
| | Ver bandeja de entrada / enviados | ✅ | ✅ | ✅ | `GET /message/inbox`, `GET /message/sent` | `Message` | `DOC-V06` (docente); sin ventana asignada en estudiante — ver nota |
| | Ver conversación con un usuario | ✅ | ✅ | ✅ | `GET /message/conversation/:userId` | `Message` | `DOC-V06` (docente); sin ventana asignada en estudiante — ver nota |
| **Analítica** | Dashboard de cohorte y alertas| ❌ | ✅ | ✅ | `GET /analytics/class/:id` | `LearningProgress`, `Enrollment` | `DOC-V04` |
| | Dashboard de salud global | ❌ | ❌ | ✅ | ⚠️ PROPUESTO — NO IMPLEMENTADO (solo existe `POST /maintenance/cleanup`) | `ActivityLog` | `ADM-V01`, `ADM-V03` |
| **Gobernanza** | Gestión de usuarios y roles | ❌ | ❌ | ✅ | `GET /users`, `PATCH /users/:id` | `User` | `ADM-V02` |

---

> **Nota (FASE CC-04, D-02):** el backend de mensajería (`MessageController`) no restringe por rol
> — cualquier usuario autenticado puede enviar y leer mensajes. D-02 asignó ventana solo al lado
> docente (`DOC-V06 · Mensajes`); el lado estudiante no tiene una ventana `EST-V0x` asignada en
> `NAMING_STIRE.md` todavía. No se inventa una aquí — queda como hallazgo para una decisión de
> producto futura.
