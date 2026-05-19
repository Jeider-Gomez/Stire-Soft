# 🧪 FINAL STIRE TEST FLOW (Happy Path)
**Arquitectura de Pruebas · Prueba de Integración End-to-End**

Este documento guía el proceso de validación del "Happy Path" del motor de evaluación asíncrono y la infraestructura central de STIRE. Sigue los pasos secuencialmente en Postman, ThunderClient o tu terminal.

---

## 🗺️ El Flujo del Happy Path
1. **Crear cuenta de Estudiante:** Registramos un usuario en la BD en blanco.
2. **Autenticación (Login):** Obtenemos el JWT Token.
3. **Poblar la estructura base:** (Mock) Ya que la BD está vacía, creamos una Actividad de tipo `CODING` para poder evaluarla.
4. **Iniciar Submission:** El estudiante indica que empezará a resolver la actividad.
5. **Enviar Código:** El estudiante envía el código fuente.
6. **Validación Asíncrona (BullMQ + Docker):** El motor lo procesa por detrás.

---

## 📡 Peticiones HTTP (Listas para usar)

### Paso 1: Crear la Cuenta del Estudiante
**POST** `http://localhost:3000/auth/register`
```json
{
  "email": "estudiante@stire.app",
  "password": "Password123!",
  "fullName": "Estudiante de Prueba"
}
```

### Paso 2: Iniciar Sesión (Obtener JWT)
**POST** `http://localhost:3000/auth/login`
```json
{
  "email": "estudiante@stire.app",
  "password": "Password123!"
}
```
> 🔑 **IMPORTANTE:** Copia el campo `access_token` de la respuesta. Necesitarás incluirlo en el header `Authorization: Bearer <token>` de aquí en adelante (aunque nuestros controladores actuales tienen un mock de studentId=1, es la práctica correcta).

### Paso 3: Crear la Actividad de Programación
**POST** `http://localhost:3000/activities`
```json
{
  "learningUnitId": 1,
  "activityTypeId": 1,
  "title": "Reto: Hola Mundo en Python",
  "description": "Imprime 'Hola Mundo'",
  "difficultyLevel": 1,
  "points": 100
}
```

### Paso 4: Iniciar la Entrega (Start Submission)
**POST** `http://localhost:3000/submissions/start`
```json
{
  "activityId": 1
}
```
> 💾 **Guarda el `id`** (UUID) de la submission que te retorna este paso.

### Paso 5: Enviar el Código a Evaluar (Submit Answers)
**POST** `http://localhost:3000/submissions/<AQUI_EL_UUID_DEL_PASO_4>/submit`
```json
{
  "timeSpentSeconds": 120,
  "answers": [
    {
      "questionId": 1,
      "answer": {
        "code": "print('Hola Mundo')"
      }
    }
  ]
}
```

---

## 🎯 Puntos de Control: Qué mirar en la consola de NestJS

Una vez lances el **Paso 5**, no mires Postman, **mira inmediatamente la consola donde está corriendo `npm run start:dev`**. Debes presenciar esta cadena de eventos en tiempo real:

### 1. El Productor (SubmissionsService)
Verás que el request HTTP responde casi de inmediato (200 OK) porque la evaluación es asíncrona.

### 2. El Consumidor (BullMQ)
Debes ver el log del `JudgeWorker` despertando:
```
[JudgeWorker] Procesando Test Case ...
```
*Si no ves esto, Redis no está conectado o el Worker no está leyendo la cola 'judge'.*

### 3. El Motor de Docker (SandboxService)
El Worker llamará al Sandbox:
```
[DockerSandboxService] [DOCKER MOCK] Ejecutando código en python
```
*Esto confirma que la inyección de dependencias funcionó.*

### 4. Event-Driven Architecture (EventEmitter)
Segundos después, deberías ver logs relacionados con el listener del evento `submission.graded` (probablemente en `LearningProgressService` o `AnalyticsService` cuando escuchen el evento).

### 5. Verificación Final en Base de Datos (PostgreSQL)
Abre tu cliente SQL (DBeaver/PgAdmin) y verifica:
- Tabla `execution_results`: Debe haber un registro con el status `accepted` (o el que haya retornado el mock del sandbox).
- Tabla `learning_progress`: Debe haberse creado/actualizado una fila calculando el `mastery` del estudiante en la unidad 1.
