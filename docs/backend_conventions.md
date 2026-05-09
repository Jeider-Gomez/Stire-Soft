# Convenciones de Desarrollo Backend (NestJS + TypeORM)

## 1. Reglas Estructurales
- Todo módulo nuevo debe contener: `module`, `controller`, `service`, `repository` (custom), `dto` folder, `entities` folder.
- **NO** inyectar `Repository<Entity>` directamente en los servicios. Usar el Patrón Repositorio (`Ej: ActivitiesRepository`) para centralizar QueryBuilders y lógica de persistencia.
- **NO** usar ManyToMany automático con `@JoinTable`. Usar siempre una entidad intermedia explícita (Ej. `SubmissionAnswer` en lugar de relacionar `Submission` y `ActivityQuestion` directamente) para permitir auditoría y metadatos.

## 2. Naming Conventions
- Archivos: `kebab-case` (ej: `learning-progress.service.ts`).
- Clases: `PascalCase` (ej: `LearningProgressService`).
- Tablas SQL: `snake_case`, preferiblemente en plural (ej: `activity_questions`).
- Variables y Métodos: `camelCase`.

## 3. Manejo de Errores
- Utilizar exclusivamente Excepciones HTTP de NestJS (`NotFoundException`, `BadRequestException`, `ConflictException`).
- Nunca retornar errores genéricos 500 al cliente. El `GlobalExceptionFilter` se encarga de interceptarlos y sanitizarlos.

## 4. DTOs y Validación
- Todo endpoint de mutación (`POST`, `PUT`, `PATCH`) debe tipar su payload con un DTO.
- Usar siempre `@ApiProperty` en DTOs para mantener el Swagger actualizado.
- Usar `@ValidateNested()` y `@Type()` de `class-transformer` para validar objetos anidados (Ej. configuraciones JSON de preguntas).

## 5. Transacciones y Concurrencia
- Mutaciones complejas (que involucran múltiples tablas, como `submitAnswers`) DEBEN usar `queryRunner` para garantizar propiedades ACID, evitando estados huérfanos si ocurre un error de red.

## 6. Integridad de Datos
- Usar el enum `PublicationStatus` para el ciclo de vida de los datos (`draft` -> `review` -> `published` -> `archived`).
- El borrado físico de entidades core está prohibido. Utilizar siempre Soft Delete (`@DeleteDateColumn`).
