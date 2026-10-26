# Verificación humana del panel del docente — Semana 11 (26 – 30 de octubre de 2026)

Lo nuevo del panel del docente desde el 20/10 y la propuesta del panel v2, repartido para que cada uno lo pruebe
**como usuario**. Plazo: **jueves 29 de octubre, 8:00 p. m.**

## Cómo se verifica

- Se prueba en **https://stire-soft.vercel.app** con una cuenta de docente (la tuya de la prueba, o
  `laura.martinez.docente@example.com`). Si un criterio habla del estudiante, se usa también una cuenta de estudiante.
- Cada uno decide **por lo que ve y hace**, no por lo que dice el código ni por lo que dijo otra persona o una IA.
  Si dudas, compara con cómo lo hace Moodle, Google Classroom o Canvas.
- Llena tu fila: **Resultado** (Cumple · Parcial · No cumple), **Qué viste** (una frase) y, si algo falla, una
  captura en `docs/calidad/evidencias/s11/` con el código del criterio en el nombre (por ejemplo `PD-06.png`).
- Al final, cada uno escribe **una sugerencia** para el panel del docente.

---

## Parte A · Lo que ya está publicado en STIRE

### José — Apariencia (UI/UX)

| Código | Qué se verifica | Cómo | Resultado | Qué viste |
|---|---|---|---|---|
| PD-01 | El panel del docente usa la letra del sistema, un fondo gris neutro y sombras suaves; **el del estudiante no cambió** | Abre el docente y luego el estudiante, en claro, y compáralos | | |
| PD-02 | En **tema oscuro** y en **alto contraste**, todo el panel del docente se lee y nada desaparece | Perfil › Apariencia: prueba los dos temas en Inicio, Contenido y Estudiantes | | |
| PD-03 | Con **«Reducir el movimiento»** el panel del docente no anima nada | Activa la opción y abre el selector de clase | | |
| PD-04 | En el **celular** (o la ventana a 390 px) y con el **menú plegado**, el selector de clase se usa sin problema y las siglas distinguen las clases | Celular real si puedes | | |

### Jorge — Barra lateral nueva (QA funcional)

| Código | Qué se verifica | Cómo | Resultado | Qué viste |
|---|---|---|---|---|
| PD-05 | El **selector de clase** abre, se cierra al tocar fuera o con Escape y lista todas tus clases | Tócalo varias veces | | |
| PD-06 | **Al cambiar de clase te quedas en la misma sección** | Estando en Entregas de una clase, elige otra: debe abrir Entregas de la otra | | |
| PD-07 | En Inicio y en Mensajes el menú muestra **la última clase que usaste**, también después de recargar | Entra a una clase, ve a Inicio, recarga | | |
| PD-08 | **«Crear clase»** del selector abre la ventana de Inicio y la clase se crea | Crea una clase de prueba y luego archívala | | |
| PD-09 | **Cinco secciones**: «Estudiantes y avance» muestra Estudiantes y Refuerzos; «Asistencia y notas», las dos. **Ninguna pantalla se perdió** y ya no aparece el selector «Clase:» repetido dentro de las pantallas | Recorre las ocho pantallas de una clase | | |
| PD-10 | **Con el teclado** (Tab, Enter, Escape) se llega al selector y a las secciones, y el foco se ve | Sin usar el mouse | | |

### Julio — Docente de Pensamiento Algorítmico

| Código | Qué se verifica | Cómo | Resultado | Qué viste |
|---|---|---|---|---|
| PD-11 | La **asistencia activa** queda en un panel flotante mientras el docente usa otras pantallas | Abre la asistencia de hoy y navega a Contenido | | |
| PD-12 | **«Errores que más se repiten esta semana»** en el Resumen de la clase tiene sentido con lo que hicieron tus estudiantes | Compáralo con lo que viste en sus entregas | | |

### Pedro — Docente de Fundamentos de Algoritmia

| Código | Qué se verifica | Cómo | Resultado | Qué viste |
|---|---|---|---|---|
| PD-13 | El **recorrido guiado** del docente se puede saltar y «No volver a mostrar» funciona; el **manual** (`/ayuda`) usa los nombres nuevos del menú (Inicio, Resumen, Contenido del curso…) | Anota qué tarea del manual hay que actualizar | | |
| PD-14 | **Flujo completo** sin perderse: entrar, elegir la clase, publicar una lección, revisar una entrega y volver a Inicio | Anota cuánto tardaste y dónde dudaste | | |

### Jeider — Lo demás del 20 al 23/10

| Código | Qué se verifica | Cómo | Resultado | Qué viste |
|---|---|---|---|---|
| PD-15 | Registro **solo para mayores de 18** con términos y política de datos visibles | Crea una cuenta de prueba | | |
| PD-16 | Mejoras de la evaluación heurística: detener la prueba, atajos, sonidos y glosario en línea | Como estudiante | | |
| PD-17 | «No volver a preguntarme» en la pregunta de seguridad del estudiante | Como estudiante | | |

---

## Parte B · Revisión del prototipo del panel v2 (propuesta, todavía no está en STIRE)

Es un prototipo interactivo con datos de ejemplo: **no guarda nada**. Jeider comparte el enlace en el grupo. Tiene dos
pantallas: **Docente** y **Estudiante** (se pasa de una a otra con «Ver como estudiante»).

Para tu parte responde tres cosas: **¿se entiende sin explicación?**, **¿qué falta o sobra?** y **¿lo usarías en tu
clase?** Compáralo con el panel que hay hoy en STIRE.

| Código | Parte del prototipo | Revisa | ¿Se entiende? | ¿Qué falta o sobra? | ¿Lo usarías? |
|---|---|---|---|---|---|
| PV-01 | **Inicio** con todas las clases («Por revisar», tarjetas o lista, crear clase) y la **Biblioteca** de plantillas (revisar en un vistazo, recorrer como estudiante, elegir qué traer) | Pedro | | | |
| PV-02 | **Contenido del curso**: el árbol módulo › tema › unidad, el mapa del curso y la lección con **varias explicaciones que se desbloquean** (y el simulador «así lo ve un estudiante que…») | Julio | | | |
| PV-03 | El **diseñador de ejercicios**: la galería de los 7 tipos y el constructor de cada uno, comparado con el panel de hoy | Jorge | | | |
| PV-04 | La **pantalla del estudiante**: presentación del curso, plan de hoy, lección con «No me quedó claro», práctica con «¿qué tan seguro estás?», repasos, progreso y Tutor | José | | | |
| PV-05 | **Estudiantes y avance**: alertas de errores repetidos, mapa de calor, errores de concepto, opinión de los estudiantes («¿te sirvió?», sugerencias) y recomendaciones | Julio | | | |
| PV-06 | **Ajustes de la clase** y el **Asistente** del docente (qué te pregunta, los borradores y «Aplicar») | Jeider | | | |

---

## Sugerencias sobre el panel del docente

| Persona | Sugerencia |
|---|---|
| José | |
| Jorge | |
| Julio | |
| Pedro | |
| Jeider | |

## Resultado (se llena al cierre)

| Parte | Cumple | Parcial | No cumple |
|---|---|---|---|
| A · Publicado (17 criterios) | | | |
| B · Prototipo (6 partes) | — | — | — |
