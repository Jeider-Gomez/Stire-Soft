# Guías de Seguridad (Security Guidelines)

## 1. Role-Based Access Control (RBAC) Granular
El sistema deja de depender de roles genéricos.
- Controladores y Rutas: Decorados con `@RequirePermissions('create:activity', 'delete:unit')`.
- El `PermissionsGuard` inyectado globalmente interceptará la petición, leerá los permisos desencriptados del JWT Payload, y rechazará la petición (`403 Forbidden`) si el usuario no tiene los scopes.

## 2. Inyección SQL y XSS
- TypeORM previene Inyecciones SQL por defecto usando consultas preparadas.
- **Payload Validation**: Todos los controladores usan el `ValidationPipe` global con `whitelist: true`. Cualquier propiedad extra enviada por un atacante será rechazada automáticamente.

## 3. Protección Rate Limiting
Endpoints críticos deben usar el módulo `ThrottlerModule`:
- `/auth/login`: Límite hiper-estricto (ej. 5 intentos por minuto).
- `/tutor/chat`: Límite intermedio (ej. 20 peticiones por minuto) por costos financieros.
- `/judge/execute`: Límite intermedio (ej. 15 peticiones por minuto) por uso intensivo de CPU.

## 4. Sandboxing (Judge Engine)
- No permitir acceso a la red de internet dentro de los contenedores Docker efímeros (`--network none`).
- Límite de memoria (`--memory=128m`) y CPU (`--cpus=0.5`) para evitar "Fork Bombs" y memory leaks intencionales generados por estudiantes.
- Límite de tiempo absoluto (timeout) gestionado a nivel worker para matar el contenedor si hay ciclos infinitos (`while(true)`).

## 5. Auditoría Activa
Todas las mutaciones críticas quedan registradas usando el `AuditInterceptor`. Este graba el `userId`, IP, tipo de mutación (`method`, `url`) y `payload` en una colección o tabla aislada para trazabilidad y auditoría de seguridad.
