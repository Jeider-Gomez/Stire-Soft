# STIRE — Informe de Auditoría Técnica e Integración LLM

**Código de Documento:** INF-AGY-2026-09-07-01  
**Fecha:** 2026-09-07  
**Hora de Ejecución:** 17:28 (UTC-5)  
**Agente / Asistente:** Antigravity (Google DeepMind)  
**Ambiente:** Desarrollo Local  
**Servicios Activos:**
- **Frontend Nuxt 3:** `http://localhost:3000` (Daemon Activo)
- **Backend NestJS:** `http://localhost:3001` (Daemon Activo, PID 21016)
- **Base de Datos:** MariaDB / MySQL 3306 (`basestire`)
- **Motor LLM:** Google Gemini AI Studio (`gemini-flash-latest` / `gemini-3.8-flash`)

---

## 1. Resumen Ejecutivo

Durante la presente sesión se atendió la solicitud del usuario para auditar integralmente el flujo de autenticación, la comunicación frontend-backend y la conexión del Tutor Inteligente con un modelo de lenguaje real (LLM).

Como resultado de la auditoría técnica profunda, se identificaron cuatro problemas raíz críticos que impedían el funcionamiento de la autenticación y del Tutor con IA. Tras la aplicación de los parches correspondientes, se logró:
1. **Autenticación 100% Funcional contra el Backend:** Login real mediante JWT firmado por NestJS con sincronización de credenciales de demostración.
2. **Tutor Inteligente Conectado a Google Gemini LLM Real:** Generación pedagógica adaptativa basada en el método socrático con respuestas completas (hasta 2048 tokens con thinking budget) y fallback inteligente entre modelos flash.
3. **Estandarización Documental:** Creación del repositorio de informes en `docs/informes-antigravity/` con plantilla reutilizable.

---

## 2. Auditoría Técnica Detallada

### 2.1. Auditoría de Autenticación y Conectividad
- **Síntoma Reportado:** Al intentar iniciar sesión desde la UI de Nuxt, el sistema no conectaba con el backend o caía silenciosamente en modo offline sin persistir la sesión real.
- **Hallazgos Técnicos (Causas Raíz):**
  1. **Discrepancia en la Carga Útil del Token:** El backend (`AuthService.login` y `register`) retornaba `{ user, token }`. Sin embargo, el frontend (`stores/auth.ts`) evaluaba estrictamente `if (response?.access_token)`. Al ser `access_token` indefinido, la autenticación fallaba sistemáticamente.
  2. **Servidor Backend Apagado por Bloqueo de OneDrive:** El proceso NestJS no podía iniciar con `nest start --watch` debido a un error de tipo `UNKNOWN: unknown error, unlink ...analytics.module.d.ts` causado por `"deleteOutDir": true` en `nest-cli.json` sobre el sistema de archivos sincronizado de OneDrive.
  3. **Discrepancia en Credenciales del Seeder:** La base de datos tenía usuarios sembrados con el dominio `@stire.edu.co` y contraseñas `STIRE2024!`, mientras que la pantalla de inicio de sesión esperaba los usuarios institucionales `pedro.estudiante@unicor.edu.co` con contraseña `Test1234!`.
  4. **Normalización de Roles:** El backend devuelve en la entidad `users` el rol `admin`, mientras que el frontend Nuxt tipaba `administrador`.

- **Acciones Correctivas Implementadas:**
  - **`nest-cli.json`:** Se configuró `"deleteOutDir": false`, eliminando las colisiones de `unlink` en OneDrive y permitiendo builds y arranques limpios.
  - **`src/auth/auth.service.ts`:** Se adaptó la respuesta de `login()` y `register()` para devolver tanto `token` como `access_token`, garantizando interoperabilidad total.
  - **`frontend-nuxt/stores/auth.ts`:** Se actualizó para procesar `response?.token || response?.access_token` y normalizar automáticamente roles de `admin` a `administrador`.
  - **Sincronización de Base de Datos:** Se ejecutó un script de migración segura (`scratch/seed-auth-users.js`) que insertó y actualizó los usuarios institucionales oficiales:
    - **Estudiante:** `pedro.estudiante@unicor.edu.co` / `Test1234!` (Pedro Romero)
    - **Docente:** `roberto.toscano@unicor.edu.co` / `Test1234!` (Prof. Roberto Toscano)
    - **Administrador:** `admin.sistema@unicor.edu.co` / `Admin1234!` (Administrador STIRE)

---

### 2.2. Auditoría del Tutor Inteligente (LLM Real)
- **Síntoma Reportado:** El tutor en el frontend mostraba respuestas fijas simuladas (mock) en lugar de consultar al LLM.
- **Hallazgos Técnicos (Causas Raíz):**
  1. **Token Invalido al Backend:** Al fallar el login en el frontend, se utilizaba un token ficticio `demo-jwt-offline`, el cual era rechazado por el `JwtAuthGuard` del backend con código `401 Unauthorized`.
  2. **Modelo Gemini 1.5 Obsoleto (Error 404):** En `.env` estaba definido `OPENAI_MODEL=gemini-1.5-flash`. La API v1beta de Google Gemini arrojaba `404 Not Found` informando que dicho modelo está descontinuado para usuarios nuevos y recomendando migrar a las familias recientes.
  3. **Sobrecarga Temporal de Modelos Específicos (Error 503):** El modelo `gemini-3.6-flash` presentó picos de demanda `503 Service Unavailable`.
  4. **Límite de Tokens por Razonamiento Interno (Thinking Tokens):** En los modelos de la generación Gemini 3, el razonamiento interno ("thoughts") consumía la totalidad de los 600 tokens configurados originalmente en `maxOutputTokens`, truncando la respuesta visible.

- **Acciones Correctivas Implementadas:**
  - **`src/tutor/tutor.service.ts` (Resiliencia Multi-Modelo):** Se rediseñó el método `callGeminiApi()` con un arreglo dinámico de modelos candidatos: `['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash-lite']`. Si el modelo primario experimenta error 503 o 404, el sistema conmuta de forma automática e imperceptible al siguiente modelo activo.
  - **Aumento de Budget de Tokens:** Se incrementó `maxOutputTokens` a `2048`, garantizando que los tokens de pensamiento del LLM no interrumpan la respuesta pedagógica final.
  - **`.env`:** Se actualizó `OPENAI_MODEL=gemini-flash-latest`.

---

## 3. Matriz de Verificación de Endpoints

Todas las pruebas se ejecutaron contra los servidores en ejecución local (`localhost`):

| Método | Endpoint | Credenciales / Parámetros | Código HTTP | Resultado Verificado |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/auth/login` | `pedro.estudiante@unicor.edu.co` / `Test1234!` | `200 OK` | Devuelve JWT firmado válido y entidad `User` completa. |
| `POST` | `/auth/login` | `roberto.toscano@unicor.edu.co` / `Test1234!` | `200 OK` | Login de docente verificado con rol `docente`. |
| `POST` | `/auth/login` | `admin.sistema@unicor.edu.co` / `Admin1234!` | `200 OK` | Login de administrador verificado con rol `admin`. |
| `GET` | `/auth/profile` | Header `Authorization: Bearer <JWT>` | `200 OK` | Perfil de usuario hidratado correctamente. |
| `POST` | `/tutor/chat` | Header `Authorization: Bearer <JWT>`, Mensaje Socrático | `200 OK` | **Google Gemini responde en vivo** con analogías pedagógicas y método socrático real. |

---

## 4. Evidencia de la Inferencia Real del Tutor IA

**Consulta del Estudiante:**
> *"¿Qué diferencia hay entre un ciclo while y un do-while en programación? Dame una pista conceptual."*

**Respuesta Generada por Google Gemini (vía NestJS Backend):**
> *«¡Vas por excelente camino! Esta duda es clásica y muy importante.*  
>  
> *Imagina dos situaciones de la vida real:*  
> *1. **El cine:** Te piden el boleto **antes** de entrar a la sala. Si no tienes boleto, no entras ni una sola vez.*  
> *2. **Un restaurante:** Primero te sientas y comes, y te cobran la cuenta **al final**, cuando ya comiste.*  
>  
> *Piénsalo así: uno revisa la condición **antes** de hacer la acción, y el otro la revisa **después**.*  
>  
> *Con esta metáfora en mente: si la condición fuera falsa desde el principio, **¿cuál de los dos ciclos crees que se ejecutaría al menos una vez obligatoriamente?**»*

---

## 5. Resumen del Plan de Implementación (Insumo 15)

El frontend en Nuxt 3 (`frontend-nuxt/`) cuenta con la totalidad de los 7 pasos del plan de implementación ejecutados:
- **Paso 0:** Tooling, TypeScript estricto, Tailwind CSS y Pinia configurados.
- **Paso 1:** Sistema de diseño con tokens semánticos completos (`tailwind.config.ts` y `main.css`).
- **Paso 2:** 5 Layouts implementados (`auth`, `student`, `workspace`, `teacher`, `admin`).
- **Paso 3:** 4 Stores Pinia reactivos (`auth`, `student`, `workspace`, `tutor`).
- **Paso 4:** 9 Pantallas operativas según especificación de contratos (Insumo 12).
- **Paso 5:** Drawer lateral del Tutor Socrático con selector de andamiaje de 3 niveles y llamada real al LLM.
- **Paso 6:** Typecheck limpio con 0 errores TypeScript (`npx nuxi typecheck`).

---

## 6. Conclusiones y Estado del Proyecto

- **Autenticación:** Completamente integrada y conectada con la base de datos real.
- **Tutor IA:** Conectado con la API oficial de Google Gemini, con alta disponibilidad multi-modelo.
- **Ambos servidores (Frontend `:3000` y Backend `:3001`):** Corriendo activamente y sincronizados.
