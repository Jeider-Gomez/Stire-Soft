# STIRE — Sistema Tutor Inteligente con Repetición Espaciada

> **Repositorio IA-Friendly** · Lee los 5 documentos en `docs/` y tendrás el contexto completo del proyecto.

---

## 🎯 Resumen Ejecutivo

**STIRE** es una plataforma backend de tutoría inteligente que combina **evaluación adaptativa**, **repetición espaciada (SM-2)** y un **Tutor IA socrático** para resolver el problema del olvido acelerado y la falta de personalización en la enseñanza universitaria de Algoritmia.

Construida con **NestJS + TypeORM + MariaDB**, la arquitectura sigue principios **DDD (Domain-Driven Design)** y un modelo **event-driven** que garantiza respuestas instantáneas al estudiante mientras los motores cognitivos operan en segundo plano.

**Estado actual:** Backend v2 — Auditoría completada ✅ · 19 test suites · 103 tests en verde · Listo para Sprint de Frontend.

---

## 📖 Base de Conocimiento — Los 5 Documentos Fundamentales

> Leer en orden para contexto completo. Cada documento responde una pregunta clave.

| Pregunta | Documento |
|----------|-----------|
| **¿Por qué existe STIRE?** Visión pedagógica, problema, propuesta de valor, actores y roadmap. | 📘 [STIRE\_FUNCTIONAL\_VISION.md](./docs/STIRE_FUNCTIONAL_VISION.md) |
| **¿Qué es técnicamente?** Arquitectura DDD, decisiones ADR, esquema relacional completo y módulos. | 🏗️ [01\_ARQUITECTURA\_Y\_DISENO.md](./docs/01_ARQUITECTURA_Y_DISENO.md) |
| **¿Cómo funciona?** Flujos del estudiante y docente, happy path E2E y trazabilidad de logs. | 🔄 [02\_FLUJOS\_Y\_OPERACIONES.md](./docs/02_FLUJOS_Y_OPERACIONES.md) |
| **¿Cuál es el cerebro?** Motor de evaluación, Judge Engine (Docker), Mastery, SM-2 y Tutor IA. | 🧠 [03\_MOTOR\_Y\_TUTOR.md](./docs/03_MOTOR_Y_TUTOR.md) |
| **¿Cuáles son las reglas?** Convenciones de código, seguridad XSS/RCE, escalabilidad y deuda técnica. | 🔐 [04\_ESTANDARES\_Y\_SEGURIDAD.md](./docs/04_ESTANDARES_Y_SEGURIDAD.md) |

Para el índice completo de documentación: [`docs/README.md`](./docs/README.md)

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | NestJS 10 + TypeScript |
| ORM | TypeORM |
| Base de datos | MariaDB |
| Autenticación | JWT (RS256) |
| Cola de tareas | BullMQ + Redis |
| Sandbox de código | Docker (contenedores efímeros) |
| Sanitización XSS | DOMPurify + JSDOM |
| Eventos | EventEmitter2 |
| Tests | Jest + Supertest |

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# 3. Levantar base de datos (Docker opcional)
docker-compose up -d

# 4. Ejecutar en modo desarrollo
npm run start:dev
```

La API estará disponible en `http://localhost:3000`.  
Documentación Swagger: `http://localhost:3000/api`.

---

## 🧪 Tests

```bash
npm run test          # Suite completa (103 tests)
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Reporte de cobertura
```

**Resultado actual:** `Test Suites: 19 passed · Tests: 103 passed · Time: ~17s`

---

## 📁 Estructura del Repositorio

```
stire/
├── src/                          # Código fuente NestJS
│   ├── auth/                     # Autenticación JWT
│   ├── user/                     # Gestión de usuarios y roles
│   ├── class/                    # Clases y matrículas
│   ├── learning-unit/            # Unidades de aprendizaje
│   ├── submissions/              # Motor de entregas
│   ├── evaluation-engine/        # Motor de calificación (Strategy Pattern)
│   ├── judge-engine/             # Evaluación de código (Docker Sandbox)
│   ├── learning-progress/        # Seguimiento de mastery
│   ├── review-schedules/         # Repetición espaciada SM-2
│   ├── tutor/                    # Tutor IA (RAG + LLM)
│   ├── analytics/                # Métricas de clase y estudiante
│   ├── content-rendering/        # Markdown → HTML sanitizado (DOMPurify)
│   ├── notifications/            # Sistema de notificaciones
│   └── gamification/             # [EN PAUSA] Logros y recompensas
├── docs/                         # 📚 Documentación técnica completa
│   ├── README.md                 # Índice de navegación
│   ├── STIRE_FUNCTIONAL_VISION.md
│   ├── 01_ARQUITECTURA_Y_DISENO.md
│   ├── 02_FLUJOS_Y_OPERACIONES.md
│   ├── 03_MOTOR_Y_TUTOR.md
│   └── 04_ESTANDARES_Y_SEGURIDAD.md
├── docker-compose.yml            # Entorno local completo
├── .env.example                  # Plantilla de variables de entorno
└── README.md                     # ← Estás aquí
```

---

## 🔐 Seguridad

- **XSS**: Todo HTML generado desde Markdown pasa por `DOMPurify` (backend, con JSDOM).
- **RCE**: El código de estudiantes se ejecuta en contenedores Docker efímeros con límites de CPU, RAM y sin acceso a red.
- **Auth**: Guards y decoradores de roles (`@Roles`, `@GetUser`) en cada endpoint sensible.
- **Validación**: DTOs con `class-validator` en todas las entradas de la API.

---

## 🗺️ Roadmap

| Fase | Estado |
|------|--------|
| ✅ Fase 1 — Core Backend (Auth, User, Class, Submissions, Evaluation) | Completado |
| ✅ Fase 2 — Inteligencia (Tutor IA, SM-2, Analytics, Notifications) | Completado |
| ✅ Auditoría v2 — Seguridad, limpieza de código muerto, optimización | Completado |
| 🚧 Fase 5 — Frontend (React/Next.js) | Próximo Sprint |
| 🕐 Fase 3 — Gamificación (Badges, XP, Ranking) | En Pausa |
| 🕐 Fase 4 — Bancos de Preguntas reutilizables | En Pausa |

---

## 🤝 Contribución

1. Lee [`docs/04_ESTANDARES_Y_SEGURIDAD.md`](./docs/04_ESTANDARES_Y_SEGURIDAD.md) antes de contribuir.
2. Crea una rama descriptiva (`feature/nombre-feature` o `fix/descripcion`).
3. Escribe tests para tu cambio.
4. Asegúrate de que `npm run test` pase al 100 %.
5. Abre un Pull Request con descripción de motivación y cambios.

---

## 📄 Licencia

MIT © 2026 STIRE Team — Universidad de Córdoba.
