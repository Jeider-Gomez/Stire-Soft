# RELEASE NOTES

Fecha: 21 de mayo de 2026
Versión: v0.1.0-READY

## Resumen ejecutivo
STIRE ha completado una transición de auditoría crítica hacia un estado de operación mucho más sólido. El sistema ya no depende de un Tutor IA simulado; la integración con OpenAI es resiliente, configurable y validada por pruebas.

## Cambios principales

### 1. Tutor IA resiliente
- La implementación del `TutorService` ahora utiliza `OPENAI_MODEL` desde configuración.
- Soporte para `OPENAI_API_URL` configurable.
- Implementación de reintentos automáticos con backoff exponencial para errores transitorios (429, 503, timeouts, etc.).
- En caso de fallo no recuperable, el sistema mantiene un fallback local controlado.

### 2. Calidad de pruebas
- Añadido `src/tutor/tutor.e2e-spec.ts` para verificar:
  - construcción de prompt RAG
  - uso de contexto de progreso de estudiante
  - selección de modelo configurable
  - retry sobre 429
- Nuevo script NPM: `npm run test:tutor-e2e`.
- Mantenido el test unitario existente en `src/tutor/tutor.service.spec.ts`.

### 3. Configuración y documentación
- Actualizado `.env.example` con variables de entorno LLM:
  - `OPENAI_API_KEY`
  - `OPENAI_API_URL`
  - `OPENAI_MODEL`
  - `OPENAI_RETRY_COUNT`
- Creada configuración de Jest en `jest.config.js` para admitir `*.e2e-spec.ts`.

### 4. Estado de auditoría actual
| Dimensión | Estado anterior | Estado actual |
| --- | --- | --- |
| Seguridad | Endpoints expuestos | Guardias globales + CORS estricto |
| Integridad BD | Hard deletes | Soft delete y migraciones |
| Portabilidad | Rígido | Docker + local adaptativo |
| Tutor IA | Mock | OpenAI real + RAG |
| Cobertura de tests | Muy baja | Test E2E funcional |

## Resultado
El proyecto se encuentra en una condición significativamente mejor que al inicio de la auditoría. El flujo de Tutor IA ahora es apto para revisión y pilotaje, y la arquitectura de pruebas permite seguir expandiendo cobertura de forma incremental.

## Recomendaciones para despliegue
1. Usar `data-source.ts` y las migraciones generadas para inicializar la base de datos.
2. Validar `OPENAI_API_KEY` y `OPENAI_MODEL` en el entorno de producción.
3. Ejecutar `npm run test:tutor` y `npm run test:tutor-e2e` como parte de la verificación previa a despliegue.

## Archivos clave
- `src/tutor/tutor.service.ts`
- `src/tutor/tutor.e2e-spec.ts`
- `jest.config.js`
- `.env.example`
- `package.json`
