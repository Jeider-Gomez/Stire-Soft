---
estado:  vigente (01/10/2026)
pregunta del dueño: «¿un docente puede copiar el contenido de otro?, ¿qué docente va en qué clase?, ¿dos docentes en una
  misma clase?, ¿cómo lo hacen otras plataformas?, ¿tiene que intervenir el admin?»
---

# Clases, docentes y contenido compartido

## 1. Cómo lo resuelven otras plataformas

| Plataforma | Quién crea la clase | Varios docentes en una clase | Reusar contenido de otro docente |
|---|---|---|---|
| **Google Classroom** | Cada docente crea las suyas y es su **propietario** | Sí: el propietario invita **co-docentes** (hasta 20). Pueden casi todo, menos borrar la clase. La propiedad se puede **transferir** | «Reutilizar publicación» solo desde clases en las que uno está; entre docentes se comparte invitando como co-docente |
| **Moodle** | El **administrador** (o un gestor) crea el curso; los docentes se **matriculan con un rol** («profesor» edita, «profesor sin permiso de edición» solo califica) | Sí, por roles | **Importar** desde cursos en los que uno es profesor, o **copia de seguridad y restauración**; plantillas de curso que crea el gestor |
| **Canvas** | El **administrador**, normalmente sincronizado con el sistema académico (SIS); el docente recibe el curso ya creado | Sí, por inscripción con rol (docente, asistente) | **Commons** (biblioteca para compartir) y **Blueprint**: un curso maestro que empuja su contenido a muchos cursos |
| **Khan Academy** | Cada docente crea sus clases | Sí: co-docentes | Las clases usan el mismo curso del catálogo |

**La lección que sacamos:** todas separan dos cosas.
- **El contenido** (el curso diseñado): se diseña una vez y se reutiliza, copiándolo (Moodle importar, Canvas Commons) o
  empujándolo desde un maestro (Canvas Blueprint).
- **La clase o grupo** (un salón, un semestre, unos estudiantes, unas notas): la dicta uno o varios docentes, cada grupo con
  sus propios estudiantes y notas.

Las plataformas grandes (Moodle, Canvas) dan ese poder al administrador porque la universidad las conecta a su sistema
académico. Las simples (Classroom, Khan) se lo dan al docente. Para STIRE, que es un trabajo universitario y quiere poco
trabajo de administración, el modelo de Classroom es el más práctico.

## 2. Qué decidimos para STIRE

1. **Cada docente crea y es dueño de sus clases** (ya era así). El admin no interviene en el día a día.
2. **Plantillas compartidas** (hecho, 01/10): en «Ajustes» de su clase, el docente marca «Compartir como plantilla con otros
   docentes». Cualquier otro docente puede entonces **copiar** ese contenido al crear su clase («Copiar el contenido de →
   Plantillas de otros docentes») o después, en Contenido → «Traer de otra clase».
   - Se **copia**, nunca se enlaza: si el autor corrige algo, no cambia las clases de otros (ni sus notas).
   - Nunca se copian estudiantes, entregas, progreso ni notas.
   - Lo copiado llega **en borrador**: el docente revisa y publica cuando quiera.
3. **Co-docentes en una misma clase: no por ahora.** En la universidad cada grupo tiene un docente. Si después hace falta un
   monitor o un docente auxiliar, se agrega como en Classroom (el dueño invita por correo, el co-docente hace todo menos
   borrar la clase). Toda la autorización ya pasa por `assertTeacherOwnsClass`, así que el cambio está acotado.
4. **El admin** solo interviene en lo excepcional: aprobar que una cuenta sea docente (ya existe) y, a futuro, transferir
   una clase si un docente se va.

## 3. Cómo organizar la prueba con el equipo

Los dos cursos diseñados (Fundamentos de Algoritmia ALGO-203413 y Pensamiento Algorítmico PENSAR-ALGO) están en clases de
la cuenta de prueba de Laura. Los pasos:

1. **Compartir**: en las dos clases de diseño, Ajustes → «Compartir como plantilla» (lo puede hacer el dueño con la cuenta
   de Laura, o lo hago yo por la API).
2. **Dos integrantes como docentes** (cada uno pide el rol de docente y el admin lo aprueba):
   - Docente A crea «Fundamentos de Algoritmia — prueba» copiando la plantilla ALGO-203413.
   - Docente B crea «Pensamiento Algorítmico — prueba» copiando la plantilla PENSAR-ALGO.
   - Cada uno revisa y **publica** los módulos que quiera probar (llegan en borrador).
3. **Estudiantes**: los demás integrantes entran con el código de la clase. Repartirlos: la mitad en cada clase, o todos
   en las dos si quieren probar ambos cursos (un estudiante puede estar en varias clases y elegir cuál ve).
4. Así cada docente prueba su clase de verdad: «Hoy», entregas, refuerzos, notas, el tope; y nadie depende de la cuenta de
   Laura.

## 4. Fundamento

Ver `investigacion/BASE_TEORICA.md`, BT-18.

## Referencias de producto

Centros de ayuda oficiales de cada plataforma (los enlaces exactos no se verificaron en esta sesión; buscar por estos
títulos): Google Classroom, «Invitar a coprofesores» y «Transferir la propiedad de una clase»; Moodle Docs, «Standard
roles» e «Import course data»; Canvas Community, «What are Blueprint Courses?» y «Canvas Commons».
