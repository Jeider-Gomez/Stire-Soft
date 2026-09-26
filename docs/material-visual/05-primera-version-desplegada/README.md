# Versión 1 — primera versión desplegada

Así se ve STIRE-Soft en internet, en su **primera versión desplegada**: frontend en Vercel y
backend en la máquina de Azure for Students. Este es el punto de partida de la **versión 2**, que se
va a enfocar en **UX y UI** (experiencia de uso y diseño visual). Al final de esta página hay una
lista de lo que se vio en esta pasada para trabajar en esa versión 2.

| | |
|---|---|
| **Fecha** | 26 de septiembre de 2026 |
| **Dónde** | https://stire-soft.vercel.app (backend en `stire-unicor.duckdns.org`), ver [`../../DESPLIEGUE.md`](../../DESPLIEGUE.md) §8 |
| **Identidad visual** | La paleta nueva de José (semana 6) |
| **Cómo se tomaron** | Sitio real en producción, con un script en Chrome sin ventana, no a mano. Escritorio 1440 × 900; celular 390 × 844 |
| **Cuentas usadas** | Las cuentas de prueba del despliegue (`*.simulacion.*@example.com`), con la clase de ejemplo «Algoritmia — prueba de docente (Claude)» y sus 7 tipos de ejercicio |
| **Administrador** | Jeider inició sesión él mismo en una ventana de Chrome y el script tomó las capturas; la contraseña no pasó por el script. Falta «Estado del Sistema» (`/admin/dashboard`): el script no pasó por esa ruta |

## Las capturas

### Acceso

| Captura | Muestra |
|---|---|
| [`01_login.png`](./01_login.png) | Inicio de sesión (también es lo primero que se ve al abrir el sitio) |
| [`02_registro.png`](./02_registro.png) | Registro |
| [`03_recuperar-contrasena.png`](./03_recuperar-contrasena.png) | Recuperar la contraseña por correo |

### Estudiante

| Captura | Muestra |
|---|---|
| [`04_estudiante-inicio.png`](./04_estudiante-inicio.png) | Inicio: recomendación del Tutor, indicadores y plan curricular |
| [`05_estudiante-mis-clases.png`](./05_estudiante-mis-clases.png) | Mis clases y unirse con un código |
| [`06_estudiante-unidad-leccion.png`](./06_estudiante-unidad-leccion.png) | Unidad con la lección escrita por el docente (Markdown con código) |
| [`07_estudiante-ejercicio-codigo.png`](./07_estudiante-ejercicio-codigo.png) | Ejercicio de código: enunciado, editor y botones Probar / Entregar |
| [`08_ejercicio-opcion-multiple.png`](./08_ejercicio-opcion-multiple.png) | Opción múltiple |
| [`09_ejercicio-completar-codigo.png`](./09_ejercicio-completar-codigo.png) | Completar código |
| [`10_ejercicio-arrastrar-y-soltar.png`](./10_ejercicio-arrastrar-y-soltar.png) | Arrastrar y soltar |
| [`11_ejercicio-emparejar.png`](./11_ejercicio-emparejar.png) | Emparejar |
| [`12_ejercicio-ordenar-bloques.png`](./12_ejercicio-ordenar-bloques.png) | Ordenar bloques |
| [`13_ejercicio-html-css.png`](./13_ejercicio-html-css.png) | HTML y CSS con vista previa y reglas |
| [`14_estudiante-progreso.png`](./14_estudiante-progreso.png) | Mi progreso |
| [`15_estudiante-repasos.png`](./15_estudiante-repasos.png) | Repasos diarios |
| [`16_estudiante-mensajes.png`](./16_estudiante-mensajes.png) | Mensajes |
| [`17_estudiante-perfil.png`](./17_estudiante-perfil.png) | Perfil |

### Docente

| Captura | Muestra |
|---|---|
| [`18_docente-inicio.png`](./18_docente-inicio.png) | Mis clases e indicadores |
| [`19_docente-gestion-clase.png`](./19_docente-gestion-clase.png) | Gestión de una clase y sus estudiantes |
| [`20_docente-contenidos.png`](./20_docente-contenidos.png) | Módulos, temas y unidades |
| [`21_docente-crear-ejercicio.png`](./21_docente-crear-ejercicio.png) | Crear ejercicio |
| [`22_docente-rendimiento.png`](./22_docente-rendimiento.png) | Rendimiento del grupo |
| [`23_docente-detalle-estudiante.png`](./23_docente-detalle-estudiante.png) | Detalle de un estudiante |
| [`24_docente-mensajes.png`](./24_docente-mensajes.png) | Mensajes |
| [`25_docente-perfil.png`](./25_docente-perfil.png) | Perfil |

### Celular

| Captura | Muestra |
|---|---|
| [`26_movil-estudiante-inicio.png`](./26_movil-estudiante-inicio.png) | Inicio del estudiante |
| [`27_movil-ejercicio-codigo.png`](./27_movil-ejercicio-codigo.png) | Ejercicio de código |
| [`28_movil-docente-inicio.png`](./28_movil-docente-inicio.png) | Inicio del docente |

### Administrador

| Captura | Muestra |
|---|---|
| [`29_admin-usuarios-y-roles.png`](./29_admin-usuarios-y-roles.png) | Usuarios y roles (es también la página de entrada del admin): cambiar rol, «Clave» para dar una contraseña nueva, desactivar, y la pestaña de solicitudes de docente |
| [`30_admin-logs-y-mantenimiento.png`](./30_admin-logs-y-mantenimiento.png) | Parámetros del sandbox, modelo del Tutor y registro de eventos del servidor |
| [`31_admin-perfil.png`](./31_admin-perfil.png) | Perfil y cambio de contraseña |

## Para la versión 2 (UX y UI): qué se vio

Lo que se notó mirando las capturas. Las marcadas **(confirmado en el código)** se revisaron en el
repositorio; las demás son observaciones de pantalla y hay que comprobarlas antes de corregirlas.

**Textos y datos que no son reales**
- **Mi progreso muestra datos de ejemplo** (14) **(confirmado en el código)**: el subtítulo dice
  «las 6 unidades del curso» y el historial trae una fila fija, «Sumatoria de Pares 100/100, Hoy
  15:45», que el estudiante nunca hizo (`pages/estudiante/progreso.vue`).
- **Códigos internos a la vista del docente** (18–25) **(confirmado en el código)**: el menú dice
  «Mis Clases (DOC-V01)», «Contenidos (DOC-V02)», etc., y los encabezados «PANEL DOCENTE · DOC-V01».
  Son códigos de diseño internos, no le dicen nada al usuario.
- **El detalle del estudiante dice «ID: #4»** en vez de su nombre (23).
- «Racha: 1 días» (04): falta el singular.
- La lección dice «UNIDAD 2» en la etiqueta y «Unidad 1» en el título (06): la etiqueta usa el
  número interno de la base de datos.
- En Repasos (15) el tiempo total dice ~13 minutos con dos repasos de ~5; y el repaso de «Suma de
  dos números» aparece bajo el nombre de otra clase.
- El contador «Intentos: 0 / 3» del ejercicio de código (07) sigue en 0 aunque ese ejercicio ya se
  entregó (20/20). Revisar si cuenta bien.

**Diseño visual**
- **Iconos mezclados**: el menú del estudiante usa emojis (🏠 🧠 📊) y las tarjetas del docente usan
  iconos de línea. En la versión 2 conviene un solo juego de iconos (de línea, SVG).
- **Mucho espacio vacío en los ejercicios** (08–13): el enunciado ocupa un tercio de la pantalla y
  queda casi en blanco; en los ejercicios que no son de código, el editor se reemplaza por un panel
  con pocas opciones y mucho blanco.
- **«Probar código» aparece deshabilitado** en los ejercicios que no son de código (08–12). Mejor
  ocultarlo que mostrarlo apagado.
- **«Arrastrar y soltar» no se arrastra** (10): son listas desplegables. O se cambia el nombre, o se
  hace de verdad con arrastre (con alternativa por teclado).
- La barra superior corta el nombre de la clase y del docente («Algoritmia — prueba de docente (Cl…»).
- El recuadro «Atajo rápido: regla de los 3 clics» del menú es una nota de diseño, no algo útil para
  el usuario.
- Varias etiquetas técnicas en los encabezados («MOTOR SM-2», «METACOGNICIÓN ACCIONABLE», «Sandbox
  endurecido»): suenan a documento técnico, no a una plataforma para estudiantes.

**Administrador** (29–31)
- Los mismos códigos internos en el menú: «Estado del Sistema (ADM-V01)», «Usuarios y Roles
  (ADM-V02)», «Logs y Mantenimiento (ADM-V03)».
- La tabla de usuarios titula la columna «Correo Institucional», pero acepta cualquier correo.
- Cada fila apila tres botones y un desplegable (rol, «Rol», «Clave», «Desactivar»): se ve cargado.
  En la versión 2 se puede agrupar en un menú de acciones.
- El registro de eventos muestra mensajes técnicos («SubmissionGradedListener», «estudiante 4»): útil
  para el equipo, pero se podría traducir a frases con nombres.

**Celular** (26–28)
- El ejercicio de código en celular apila el enunciado arriba y el editor abajo; el código se sale
  por la derecha y los botones de arriba ocupan mucho espacio. Programar en celular es incómodo de
  por sí, pero al menos debería leerse completo.
- El inicio se ve bien, aunque los indicadores ocupan casi toda la pantalla antes de llegar al
  contenido.

**Acceso**
- **No hay página de presentación**: al abrir el sitio se va directo al login. Para la versión 2 se
  puede pensar en una portada corta que explique qué es STIRE.

## Datos personales

El repositorio es público. Solo aparecen cuentas de prueba con correos `@example.com` y la clase de
prueba creada para verificar el despliegue; no aparece ningún dato de una persona real.
