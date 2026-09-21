# Primera versión — identidad visual original

Capturas de STIRE-Soft tal como está hoy, antes de cualquier cambio de identidad visual. Sirven
para comparar cuando se rediseñe, y como evidencia de qué había en la primera versión.

| | |
|---|---|
| **Fecha** | 20 de septiembre de 2026 |
| **Versión** | Tag `v1.0.0-beta.1` (ver [`../../FLUJO_GIT.md`](../../FLUJO_GIT.md)) |
| **Cómo se tomaron** | Sistema real: backend compilado (`dist/main.js`) contra MariaDB con los datos de demostración, y frontend Nuxt en modo desarrollo. Chrome sin ventana, 1440 × 900. Las capturas se sacaron con un script, no a mano |
| **Cuentas usadas** | Solo las cuentas demo del [`README.md`](../../../README.md) raíz |

## Las capturas

### Acceso

| Captura | Muestra |
|---|---|
| [`01_login.png`](./01_login.png) | Inicio de sesión |
| [`02_registro.png`](./02_registro.png) | Registro |
| [`03_registro-clave-google-opcional.png`](./03_registro-clave-google-opcional.png) | Registro con el campo opcional de la clave de Google AI Studio abierto |

### Estudiante

| Captura | Muestra |
|---|---|
| [`04_estudiante-inicio.png`](./04_estudiante-inicio.png) | Inicio: recomendación del Tutor, indicadores y plan curricular |
| [`05_estudiante-mis-clases.png`](./05_estudiante-mis-clases.png) | Mis clases y matrícula por código |
| [`06_estudiante-unidad.png`](./06_estudiante-unidad.png) | Unidad de aprendizaje con "Tu siguiente paso" |
| [`07_estudiante-actividad-editor.png`](./07_estudiante-actividad-editor.png) | Actividad de código: enunciado, editor y sandbox |
| [`08_tutor-sin-clave-pasos-para-obtenerla.png`](./08_tutor-sin-clave-pasos-para-obtenerla.png) | Tutor sin clave: explica cómo conseguir la de Google AI Studio |
| [`09_tutor-clave-rechazada-por-google.png`](./09_tutor-clave-rechazada-por-google.png) | Con una clave inventada, Google la rechaza y el sistema lo dice con claridad |
| [`10_estudiante-progreso.png`](./10_estudiante-progreso.png) | Progreso |
| [`11_estudiante-repasos.png`](./11_estudiante-repasos.png) | Repasos diarios (repetición espaciada) |

### Docente

| Captura | Muestra |
|---|---|
| [`12_docente-inicio.png`](./12_docente-inicio.png) | Mis clases |
| [`13_docente-configuracion-tutor.png`](./13_docente-configuracion-tutor.png) | Configuración del Tutor por clase: activar, tope de ayuda y estilo |
| [`14_docente-clase.png`](./14_docente-clase.png) | Matrícula: aprobación y estudiantes activos |
| [`15_docente-contenidos.png`](./15_docente-contenidos.png) | Módulos, temas y unidades |
| [`16_docente-crear-ejercicio.png`](./16_docente-crear-ejercicio.png) | Crear ejercicio |
| [`17_docente-rendimiento.png`](./17_docente-rendimiento.png) | Rendimiento del grupo y alertas tempranas |

### Administrador

| Captura | Muestra |
|---|---|
| [`18_admin-usuarios.png`](./18_admin-usuarios.png) | Gestión de usuarios y roles |
| [`19_admin-estado-sistema-maqueta.png`](./19_admin-estado-sistema-maqueta.png) | Estado del sistema (**maqueta**) |
| [`20_admin-logs-mantenimiento-maqueta.png`](./20_admin-logs-mantenimiento-maqueta.png) | Logs y mantenimiento (**maqueta**) |

## Qué se vio (hallazgos de esta pasada)

- **Las dos vistas de administración de sistema son maquetas.** Ambas traen su propio aviso
  ("Ejemplo — sin backend"), pero muestran cifras que no salen del sistema: 99,98 % de
  disponibilidad, "Worker BullMQ", y "Gemini 1.5 Flash" como modelo del Tutor. Nada de eso es real
  (la cola es en línea, ADR 08, y el modelo lo fija `GEMINI_MODEL`). Conviene retirarlas o
  conectarlas antes de mostrar el sistema desplegado.
- **Píldora vacía en la cabecera.** En "Mis clases" y en la unidad, el centro de la barra
  superior muestra un punto "•" sin nombre de clase ni docente; en el inicio sí aparecen.
- **Texto pendiente de corregir:** en "Mis clases" cada tarjeta dice "Inscrito el fecha reciente".
- **Tutor sin clave:** no muestra el chat, solo los pasos y el campo para pegarla. Es lo
  esperado; la conversación con una clave real de Google **no se capturó** porque no se tenía una.

## Datos personales

El repositorio es público. En las capturas 14 y 17 apareció el nombre y el correo de una persona
real que se había matriculado en la base de pruebas; se sustituyeron por "Estudiante de prueba" y
`estudiante.prueba@unicor.edu.co` antes de guardarlas. El resto de los datos son de las cuentas demo
y de cuentas de prueba generadas por los tests.
