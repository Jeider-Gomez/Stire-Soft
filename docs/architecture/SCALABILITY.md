# Estrategia de Escalabilidad (Scalability Strategy)

STIRE está diseñado como una plataforma LMS Enterprise, preparada para cientos de estudiantes concurrentes realizando auto-evaluaciones y ejecutando código.

## 1. Separación de Responsabilidades (Capa Asíncrona)
- El **Motor de Evaluación de Código (Judge)** y el **Motor de Tutor IA** son operaciones costosas computacionalmente y dependientes de I/O externo.
- Se ha integrado **BullMQ y Redis**. La API HTTP de NestJS nunca se bloquea evaluando código; solo encola el trabajo.
- Los **Workers** se pueden separar en servidores independientes (Microservicios lógicos) que solo consumen tareas de la cola de Redis, escalando horizontalmente según demanda de Docker.

## 2. Desacoplamiento de Analíticas
- Los cálculos matemáticos complejos como recálculo de Mastery global, Repaso Espaciado SM-2 y Success Rates no ocurren durante el hilo principal de las entregas (`SubmissionsService`).
- Se utiliza `EventEmitter2` para emitir el evento `submission.graded`. Los Listeners asíncronos en background consolidan los reportes. El estudiante obtiene su "Nota" instantáneamente, mientras que el "Progreso Analítico" se procesa al milisegundo siguiente.

## 3. Caching Strategy
Para reducir el impacto en Base de Datos:
- Componentes públicos o de lectura intensiva (Listado de cursos, Catálogo de clases públicas) deben ser envueltos con el `CacheInterceptor` nativo de NestJS o usando `CacheManager` en los servicios (`ttl` de 5 minutos a 1 hora).

## 4. Particionamiento de Datos (Futuro)
Con el crecimiento masivo, la tabla `submission_answers` crecerá exponencialmente.
- Se debe planificar Particionamiento SQL basado en fechas (por mes/semestre) para evitar escaneos de tabla lentos, manteniendo los accesos B-Tree de los índices rápidos y eficientes.
