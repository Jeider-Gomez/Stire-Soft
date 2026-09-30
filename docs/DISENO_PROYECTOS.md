---
estado:     aprobado por el dueño del proyecto el 2026-09-30 (decisiones en §9)
fecha:      2026-09-30
---

# Proyectos — el espacio de programación propio del estudiante

## 1. Qué es

Un espacio **libre** donde cada estudiante crea, guarda y prueba sus propios proyectos, fuera de los ejercicios calificados. **Los
proyectos son del estudiante**, no de una clase ni del docente: el estudiante los crea, los edita y los borra.

El docente **no ve** ese espacio. Recibe lo que el estudiante decide **enviarle**, como una **copia congelada** que no cambia ni se
borra aunque el estudiante siga editando o borre el proyecto.

## 2. Qué puede crear

| Curso | Tipo de proyecto | Cómo se ve |
|---|---|---|
| Con código (Fundamentos de Algoritmia) | **Página web** (HTML, CSS y JavaScript) | Vista previa en vivo en un `iframe` aislado, como la de los ejercicios HTML/CSS |
| Con código | **Programa JavaScript** | «Ejecutar» con una entrada, **en el navegador del estudiante** (Web Worker con límite de tiempo): no ocupa el servidor |
| Sin tanto código (Pensamiento algorítmico) | **Algoritmo en pseudocódigo** | Texto paso a paso con resaltado |
| Sin tanto código | **Diagrama de flujo** | Editor de diagramas (fase posterior: es lo más trabajoso) |

El editor es el mismo de toda la aplicación (CodeMirror 6).

## 3. Enviar al docente

1. El estudiante pulsa **«Enviar al docente»** y elige una de sus clases (solo las que aceptan envíos).
2. STIRE guarda una **copia congelada** del proyecto con fecha y hora. Cada reenvío es una versión nueva y queda el historial.
3. El docente la abre en modo lectura, la ejecuta en su vista previa y deja un **comentario**, una **nota** o ambos.
4. Estudiante y docente pueden **descargar** cualquier versión: `.zip` con los archivos (o `.html` si es una página).

## 4. Límites

| Límite | Valor | Por qué |
|---|---|---|
| Proyectos por estudiante | 20 | Espacio y orden |
| Archivos por proyecto | 10 (texto: HTML, CSS, JS, pseudocódigo) | Sin imágenes ni binarios: el código pesa muy poco |
| Tamaño por proyecto | 200 KB | 100 estudiantes × 20 proyectos llenos = 0,4 GB, en un disco de 61 GB con 13 % usado |
| Versiones enviadas | 5 por proyecto y clase | Historial sin crecer sin límite |
| Ejecución | En el navegador, con tiempo límite | No se califica: no hace falta el juez del servidor, y así Proyectos no suma carga sin importar cuántos lo usen |
| Guardado automático | Cada pocos segundos al dejar de escribir | No saturar el servidor |

## 5. Control del docente

- **Por clase:** si la clase **acepta envíos** de Proyectos (apagado por defecto).
- **Tutor IA en Proyectos:** encendido o no y hasta qué nivel de ayuda, con los mismos controles que ya tiene el tutor. En un proyecto
  la IA **guía** (pregunta, señala problemas); no escribe el proyecto por el estudiante.
- **Tipo de curso:** una clase «sin tanto código» ofrece solo pseudocódigo y diagramas.
- El docente **no puede** borrar ni editar el proyecto de un estudiante: solo comentar las copias que recibió.

## 6. Fase de prueba

Un interruptor global del administrador: mientras esté en «prueba», Proyectos solo aparece a las **cuentas y clases piloto** (el equipo
y las clases de prueba de Laura). Siempre disponible para probarlo; nadie más lo ve.

## 7. Datos y privacidad

- Los proyectos son datos personales del estudiante: aviso de privacidad y consentimiento antes de usarlo con estudiantes reales (Ley 1581
  de 2012).
- El estudiante puede descargar y borrar todo lo suyo. Las copias enviadas se conservan para el docente mientras exista la clase.
- Entran en la copia diaria de la base de datos.

## 8. Por fases

1. **Versión mínima:** proyectos web y JavaScript propios, guardado, descarga, límites, interruptor de prueba. **✅ En producción el 30/09.** El interruptor es de configuración del servidor (`PROYECTOS_MODO` = piloto | todos | apagado y `PROYECTOS_CLASES_PILOTO`), no una pantalla del administrador.
2. **Enviar al docente:** copia congelada, versiones, comentario, activación por clase.
3. **Tutor IA en Proyectos**, en modo guía.
4. **Pseudocódigo y diagramas de flujo** para el curso sin código.

## 9. Decisiones del dueño (2026-09-30)

1. **Límites de §4:** aprobados; la idea es que sean prácticos para los estudiantes.
2. **Nota y comentario:** el docente puede poner una nota, un comentario o ambos a cada envío.
3. **Sin compartir entre compañeros:** un proyecto solo se envía al docente. Compartirlo con compañeros facilitaría copiarlo.
4. **Ejecución en el navegador** para los programas de JavaScript: lo más práctico y escalable (medido el 30/09: el juez del servidor
   atiende ~17 ejecuciones por segundo y queda para los ejercicios calificados).
