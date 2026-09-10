# STIRE — Sistema Tutor Inteligente con Repetición Espaciada

> **Repositorio IA-Friendly** · Lee los 5 documentos en `docs/` y tendrás el contexto completo del proyecto.

---

## 🎯 Resumen Ejecutivo

**STIRE** es una plataforma backend de tutoría inteligente que combina **evaluación adaptativa**, **repetición espaciada (SM-2)** y un **Tutor IA socrático** para resolver el problema del olvido acelerado y la falta de personalización en la enseñanza universitaria de Algoritmia.

Construida con **NestJS + TypeORM + MariaDB**, la arquitectura sigue principios **DDD (Domain-Driven Design)** y un modelo **event-driven** que garantiza respuestas instantáneas al estudiante mientras los motores cognitivos operan en segundo plano.

**Estado actual:** Ola 2 de remediación cerrada · 36/36 suites · 215/215 tests en verde · sistema reproducible desde cero (`npm ci → migration:run → db:seed:demo → build → start`, verificado). Sin veredicto de aptitud autoasignado — ver `docs/ESTADO_STIRE_HANDOFF.md` y `CHANGELOG.md`.

---

## 📖 Base de Conocimiento — Los 5 Documentos Fundamentales

> Leer en orden para contexto completo. Cada documento responde una pregunta clave.

| Pregunta | Documento |
|----------|-----------|
| **¿Por qué existe STIRE?** Visión pedagógica, problema, propuesta de valor, actores y roadmap. | 📘 [00\_VISION\_FUNCIONAL.md](./docs/00_VISION_FUNCIONAL.md) |
| **¿Qué es técnicamente?** Arquitectura DDD, decisiones ADR, esquema relacional completo y módulos. | 🏗️ [01\_ARQUITECTURA\_Y\_DISENO.md](./docs/01_ARQUITECTURA_Y_DISENO.md) |
| **¿Cómo funciona?** Flujos del estudiante y docente, happy path E2E y trazabilidad de logs. | 🔄 [02\_FLUJOS\_Y\_OPERACIONES.md](./docs/02_FLUJOS_Y_OPERACIONES.md) |
| **¿Cuál es el cerebro?** Motor de evaluación, Judge Engine (Docker), Mastery, SM-2 y Tutor IA. | 🧠 [03\_MOTOR\_Y\_TUTOR.md](./docs/03_MOTOR_Y_TUTOR.md) |
| **¿Cuáles son las reglas?** Convenciones de código, seguridad XSS/RCE, escalabilidad y deuda técnica. | 🔐 [04\_ESTANDARES\_Y\_SEGURIDAD.md](./docs/04_ESTANDARES_Y_SEGURIDAD.md) |

Para el índice completo de documentación: [`docs/README.md`](./docs/README.md)

---

## 👥 Gestión del Proyecto

El equipo trabaja con **Sprint Semanal y Kanban en Trello**. Hay solo dos documentos de gestión:

| Documento | Contenido |
|-----------|-----------|
| [`MONITOREO_SEMANAL.md`](./MONITOREO_SEMANAL.md) | Bitácora oficial del curso: avances, cuellos de botella y compromisos de la semana. |
| [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md) | Cómo trabaja el equipo: cadencia semanal, roles, tablero de Trello y entregables. |

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

## 🚀 Inicio Rápido (de cero, verificado)

Esta secuencia exacta se probó de punta a punta contra una base de datos **vacía** (Ola 2, Punto 5):
`npm ci` → `migration:run` → `db:seed:demo` → `npm run build` → `npm start`.

```bash
# 1. Instalar dependencias (usa package-lock.json tal cual — reproducible)
npm ci

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE, JWT_SECRET

# 3. Levantar MySQL (Docker opcional) — la base de datos debe existir y estar VACÍA
docker-compose up -d

# 4. Crear el esquema completo desde cero (26 tablas, línea base congelada)
npm run migration:run

# 5. Sembrar datos de demo (idempotente: se puede correr más de una vez sin duplicar nada)
npm run db:seed:demo

# 6. Compilar y arrancar
npm run build
npm start
```

La API estará disponible en `http://localhost:3001`.  
Documentación Swagger: `http://localhost:3001/docs`.

**Credenciales de demostración oficiales** (creadas por `npm run seed`, ver `src/seeds/seed-runner.ts`):

| Rol | Nombre | Email | Contraseña | Clases / Acceso |
|---|---|---|---|---|
| **Administrador** | Administrador del Sistema | `admin.sistema@unicor.edu.co` | `Admin1234!` | Panel Global de Usuarios (`/admin`) |
| **Docente 1** | Prof. Roberto Toscano Miranda | `roberto.toscano@unicor.edu.co` | `Test1234!` | `ALGO-WEB-T01` |
| **Docente 2** | Prof. Victor Castro | `victor.castro@unicor.edu.co` | `Test1234!` | `ALGO-WEB-V02` |
| **Docente 3** | Prof. Ali Pérez | `ali.docente@unicor.edu.co` | `Test1234!` | `ALGO-WEB-A03` |
| **Estudiante** | Pedro Romero Mendoza | `pedro.estudiante@unicor.edu.co` | `Test1234!` | Matriculado en `ALGO-WEB-T01` y `ALGO-WEB-V02` |

**Códigos de Clase para Matrícula e Inscripción:**
- `ALGO-WEB-T01` — *Algoritmos Básicos con HTML5, CSS y JavaScript* (Prof. Roberto Toscano).
- `ALGO-WEB-V02` — *Algoritmia y Lógica Computacional para la Web* (Prof. Victor Castro).
- `ALGO-WEB-A03` — *Desarrollo Frontend Interactivo y Algoritmos Web* (Prof. Ali Pérez).

La clase principal (`ALGO-WEB-T01`) contiene el currículo completo:
- **Módulo 1:** Fundamentos y Estructuras de Control (Variables, Operadores, Condicionales).
- **Módulo 2:** Bucles, Iteraciones y Manipulación de Colecciones (for/while, Arreglos).
- **Módulo 3:** Funciones y Modularidad en Desarrollo Web (Funciones puras, slugs).
Cada unidad cuenta con múltiples actividades ponderadas (MCQ, FILL_CODE y CODING en JavaScript) y repetición espaciada real (SM-2).
FILL_CODE) — suficiente para probar el flujo completo estudiante → docente sin capturas ni datos
inventados a mano.

> Para desarrollo con recarga en caliente, usar `npm run start:dev` en el paso 6 en vez de
> `build` + `start`.

---

## 🧪 Tests

```bash
npm run test                # Suite completa (requiere MySQL activo)
npm run test:judge          # Tests del JudgeWorker + Sandbox (SQLite in-memory)
npm run test:tutor          # Tests del TutorService (mock LLM)
npm run test:e2e            # Tests end-to-end
npm run test:cov            # Reporte de cobertura
```

**Resultado verificado (tests críticos sin infraestructura):**
```
Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
Time:        ~17 s · Exit Code: 0 ✅
```
> Los tests de integración completos requieren MySQL activo. Para CI/CD local, los suites de `judge-engine` y `tutor` corren de forma aislada con SQLite in-memory y mocks.

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
│   ├── 00_VISION_FUNCIONAL.md
│   ├── 01_ARQUITECTURA_Y_DISENO.md
│   ├── 02_FLUJOS_Y_OPERACIONES.md
│   ├── 03_MOTOR_Y_TUTOR.md
│   ├── 04_ESTANDARES_Y_SEGURIDAD.md
│   ├── 05_METODOLOGIA_Y_EQUIPO.md
│   ├── ADR_DECISIONES_ARQUITECTURA.md   # ADR 06/07/08
│   ├── CONTRATO_CONTENT_RENDERING.md
│   ├── ESTADO_STIRE_HANDOFF.md   # Estado del proyecto (traspaso)
│   ├── modesec/                  # Diseño multimedial MODESEC Fase II
│   ├── pitch/                    # Guión de pitch vigente + guía fonética
│   ├── testing/                  # Artefactos de estrategia de pruebas
│   └── _archivo/                 # Documentos históricos, no vigentes
├── scripts/                       # verify-clean.js y verify-clean-server-check.js
├── docker-compose.yml            # Entorno local completo
├── .env.example                  # Plantilla de variables de entorno
├── CHANGELOG.md                   # Historial de versiones y olas de remediación
├── MONITOREO_SEMANAL.md          # Bitácora oficial del curso
├── CLAUDE.md                      # Reglas de ingeniería del proyecto
└── README.md                     # ← Estás aquí
```

---

## 🔐 Seguridad

STIRE implementa un modelo de **seguridad por defecto** (secure-by-default) validado en auditoría técnica (calificación: 8.4/10):

- **Autenticación global:** `JwtAuthGuard` y `RolesGuard` registrados como `APP_GUARD` — todo endpoint protegido por defecto. Rutas públicas marcadas con `@Public()`.
- **CORS estricto:** Política configurable vía `CORS_ORIGIN` en `.env`. Solo orígenes en lista blanca son aceptados.
- **Validación de entradas:** `ValidationPipe` con `whitelist: true` y `forbidNonWhitelisted: true` en todas las rutas — payloads no tipados son descartados.
- **Rate Limiting:** `ThrottlerModule` activo (100 req/min global; endpoints sensibles con políticas específicas).
- **Errores sanitizados:** `HttpExceptionFilter` global previene el *information disclosure* de stack traces en producción.
- **XSS:** Todo HTML generado desde Markdown pasa por `DOMPurify` (backend, con JSDOM).
- **RCE:** El código de estudiantes se ejecuta en el `LocalProcessSandboxAdapter` (`node:vm`, timeout 1500ms) o en contenedores Docker efímeros con límites de CPU, RAM y sin acceso a red (`SANDBOX_TYPE=docker`).
- **Integridad de BD:** `synchronize: false` en TypeORM — todo cambio de schema gestionado por migraciones versionadas.
- **Soft Deletes:** Ningún registro de usuario se elimina físicamente; se usa `@DeleteDateColumn()`.

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
2. Escribe tests para tu cambio y asegúrate de que `npm run test` pase al 100 %.
3. Sube el archivo al repositorio antes del cierre semanal del viernes — sin reglas estrictas de ramas, revisiones cruzadas o convenciones de commits (ver [`docs/05_METODOLOGIA_Y_EQUIPO.md`](./docs/05_METODOLOGIA_Y_EQUIPO.md)).

---

## 📄 Licencia

MIT © 2026 STIRE Team — Universidad de Córdoba.
