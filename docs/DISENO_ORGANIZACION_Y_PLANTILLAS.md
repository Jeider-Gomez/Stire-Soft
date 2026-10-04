---
estado:  fase 1 hecha (04/10/2026); fases 2 y 3 propuestas
pregunta del dueño: «¿cómo organizar en STIRE la universidad o el colegio, la facultad, la carrera o el grado, el semestre y
  los cursos, para que lo que dice la barra superior sea verdad? ¿Cómo compartir plantillas con la facultad o el semestre
  sin abrumar? ¿La clase debe decir para qué asignatura, carrera y semestre es?»
amplía: DISENO_CLASES_Y_DOCENTES.md (cada docente es dueño de sus clases; las plantillas se copian, no se enlazan)
---

# Organización académica y plantillas compartidas

## 0. Lo que hay hoy (revisado en el código y en producción, 04/10/2026)

| Qué | Estado | Problema |
|---|---|---|
| Barra superior | Texto fijo: «Unicor · Ing. Sistemas» y «Universidad de Córdoba • Facultad de Ingeniería de Sistemas» (`HeaderNav.vue`) | **Era falso**: STIRE se hace para la **Licenciatura en Informática** de la **Facultad de Educación y Ciencias Humanas**. Ya se corrigió el texto (04/10); sigue siendo fijo. |
| Institución y programa | Las tablas `institutions`, `programs` y `user_affiliations` (usuario ↔ programa, rol, semestre) existen en el servidor | Ninguna pantalla las usa y en producción están **vacías**. El seed local crea «Ingeniería de Sistemas». |
| Clase | Nombre, código, descripción, fechas, cupo, aprobación, umbral | No dice **para qué asignatura, programa, semestre, grupo ni periodo** es. «Fundamentos de Algoritmia — grupo 2» lo dice solo el nombre, escrito a mano. |
| Plantillas | Un sí/no por clase (`compartidaComoPlantilla`); `GET /reuse/plantillas` devuelve **todas** las de todos los docentes | Con 2 cursos funciona. Con una facultad entera, la lista sería larga y mezclaría cursos de otras carreras y colegios. |

Los dos cursos reales por ahora, ambos de la Universidad de Córdoba: **Fundamentos de Algoritmia** (3.er semestre de la
Licenciatura en Informática, código 203413) y el curso de **Víctor Castro** sobre inteligencia artificial en la educación
(**nombre, código y semestre por confirmar**: el sitio de la universidad no respondió al consultarlo).

## 1. Cómo lo resuelven las plataformas exitosas

| Plataforma | Jerarquía | La clase sabe de qué asignatura es | Compartir contenido |
|---|---|---|---|
| **Brightspace (D2L)** | Organización → facultad → departamento → *plantilla de curso* → *oferta del curso* (un semestre) | Sí: **toda oferta cuelga de una plantilla de curso** («Introducción a la administración» → «oferta 2023-1»). | Desde la plantilla de curso y por unidad organizativa. |
| **Canvas** | Cuenta de la institución → subcuentas (facultad, departamento) → curso → secciones | Sí, por la subcuenta y el código del curso (sincronizado con el sistema académico). | **Commons** con 5 alcances: *solo yo*, *mi institución*, *grupos*, *consorcio* (varias instituciones) y *público*. |
| **Moodle** | Categorías de cursos anidadas (facultad → programa → semestre) y cohortes | Por la categoría donde se crea. | Importar de cursos propios; plantillas del gestor; MoodleNet público. |
| **Google Classroom** | Ninguna: solo la organización del dominio | Por campos libres al crear la clase: **nombre, sección, materia, aula**. | Reutilizar publicaciones de tus clases; co-docentes. |

**Lo que aprendemos:**
- **Brightspace:** separar la **asignatura** (lo que dice el plan de estudios, existe siempre) de la **clase** (un grupo,
  un periodo, unos estudiantes) es lo que hace que todo lo demás sea verdad y se pueda filtrar.
- **Canvas Commons:** compartir **por alcance** («¿con quién?») evita abrumar; nadie ve lo que no le sirve.
- **Classroom:** crear una clase es un formulario corto; la jerarquía nunca debe volverse burocracia para el docente.

## 2. Propuesta

### 2.1 El modelo: cinco niveles, solo los que hacen falta

```
Institución          Universidad de Córdoba (universidad)      ·  I. E. San José (colegio)
 └ Facultad          Educación y Ciencias Humanas               ·  (un colegio no tiene; opcional)
    └ Programa        Licenciatura en Informática (carrera, 10 semestres)  ·  Básica secundaria (grados 6.° a 9.°)
       └ Asignatura   Fundamentos de Algoritmia · 203413 · 3.er semestre    ·  Tecnología e Informática · grado 8.°
          └ Clase     Grupo 2 · 2026-2 · Prof. Laura Martínez · código ALGO-2034   ← la que ya existe
```

- **Programa** cubre carrera y grado: lleva `tipo` (carrera | nivel escolar) y cuántos periodos tiene (semestres o grados).
  Así un colegio y una universidad usan el mismo modelo, sin pantallas distintas.
- **Asignatura** (nuevo, el «curso del plan de estudios»): nombre, código opcional y, según el caso, tres formas
  (pedido de Jeider, 04/10):
  | Forma | Institución | Programa | Semestre o grado | Ejemplo | La barra dice |
  |---|---|---|---|---|---|
  | **De un programa** | sí | sí | opcional | Fundamentos de Algoritmia, Lic. en Informática | «3.er semestre · Lic. en Informática» |
  | **De una institución, sin programa** | sí | no | no | una electiva libre, un curso de extensión | «Electiva · Unicórdoba» |
  | **Libre** | no | no | no | un taller que un docente dicta por su cuenta | «Curso libre» |
- **Clase** (existe): se le agregan `asignatura`, `periodo` («2026-2») y `grupo` («Grupo 2»). El nombre se sugiere solo
  («Fundamentos de Algoritmia — Grupo 2 · 2026-2») y el docente lo puede cambiar.
- **Vínculos del docente** (existe `user_affiliations`): un docente puede estar en **varias instituciones, programas,
  grados o semestres**. El estudiante dice su programa y semestre una vez, y es opcional.
- **Todo es opcional para no estorbar:** una clase sin asignatura sigue funcionando como hoy (STIRE es una herramienta
  flexible, no una que limita). Lo que se gana con llenarla es veracidad, filtros y plantillas que se encuentran solas.

### 2.2 ¿Quién crea el catálogo? El docente, sin pedir permiso

En Canvas y Brightspace lo carga la universidad desde su sistema académico; STIRE no tiene esa conexión y no debe depender
de un administrador.

- STIRE trae precargado el plan de la **Licenciatura en Informática** (institución, facultad, programa y sus asignaturas
  por semestre, tomado del plan de estudios oficial).
- Al crear una clase, el docente **busca** su asignatura. Si no está, la agrega en el mismo campo: «Agregar “Inteligencia
  artificial en educación” al 7.° semestre». Queda disponible para los demás.
- El administrador solo **une duplicados** («Fund. de Algoritmia» = «Fundamentos de Algoritmia») y corrige nombres. Es el
  mismo papel excepcional que ya tiene con la aprobación de docentes.

### 2.2.1 Orden sin burocracia: cómo se evita el desorden (pregunta de Jeider, 04/10)

**El riesgo:** si cada docente agrega asignaturas a su manera, aparecen «Fundamentos de Algoritmia», «Fund. Algoritmia» y
«Algoritmia I» como tres cosas distintas, con sus plantillas repartidas. **La clave es separar tres capas con reglas
distintas:**

| Capa | Cuántas hay | ¿Se permiten varias «parecidas»? | Regla |
|---|---|---|---|
| **Catálogo** (instituciones, programas, asignaturas) | Pocas: cientos por universidad, y cambian una vez por plan de estudios | **No.** Una asignatura es una sola | Se previene el duplicado al escribir y se une el que se cuele |
| **Plantillas** (contenido de un curso) | Muchas | **Sí, y es bueno:** son *enfoques* de la misma asignatura. «Fundamentos de Algoritmia con JavaScript» y «Pensamiento algorítmico, solo pseudocódigo» son dos plantillas de **una** asignatura | No se unen: se **agrupan** por asignatura y se **ordenan** por calidad |
| **Clases** | Muchísimas | Sí: cada grupo y periodo es una | Privadas de su docente; no estorban a nadie |

**1. Prevenir el duplicado al escribir** (sin intervención de nadie):
- La base guarda el nombre **normalizado**: sin tildes ni mayúsculas, sin «de», «la», «y», y con las abreviaturas
  expandidas («Fund.» → «Fundamentos»). Hay un índice único por programa sobre ese nombre y otro sobre el **código**, así que
  dos asignaturas iguales no pueden existir en el mismo programa.
- Antes de «Agregar», STIRE muestra **«¿Es alguna de estas?»** con las parecidas (mismo código, o nombre a una o dos letras
  de distancia). Agregar otra exige un clic más.

**2. Oficiales y agregadas:**
- Las precargadas del plan de estudios, y las que alguien confirma, son **oficiales**: salen primero y con una marca.
- Las que agrega un docente funcionan **al instante** (nunca se espera aprobación para dictar), pero salen como «agregada
  por un docente» y después de las oficiales.

**3. Unir lo que se cuele, sin perder nada:**
- «Unir A en B» pasa las clases y plantillas de A a B, y guarda el nombre de A como **sinónimo**: quien busque «Fund.
  Algoritmia» encuentra la oficial.
- STIRE **detecta solo** los posibles duplicados (los mismos criterios del punto 1) y los lista en una pantalla «Catálogo».
  Nadie tiene que buscarlos.

**4. Plantillas sin ruido:**
- Cada plantilla compartida pertenece a una asignatura y tiene un **enfoque** de una línea.
- La lista se agrupa: «Fundamentos de Algoritmia — 2 enfoques», con las 3 mejores visibles (por cercanía, copias,
  «¿te sirvió?» y actualidad) y el resto en «ver todas».
- No se listan las plantillas vacías. Las que nadie ha copiado ni actualizado en dos periodos dejan de listarse solas
  (no se borran).

### 2.2.2 ¿Tiene que intervenir el admin?

**En el día a día, no.** Crear asignaturas, dictar clases, compartir y copiar plantillas no espera a nadie. El admin (hoy
Jeider) solo:
1. **Revisa la pantalla «Catálogo»** cuando STIRE avisa de posibles duplicados: une o descarta con un clic. Es una carga
   pequeña, porque el catálogo crece por planes de estudio, no por clases.
2. **Confirma** como oficiales las asignaturas que agregan los docentes, si quiere (no es obligatorio).
3. **Atiende lo excepcional:** una institución mal escrita o una plantilla reportada.

**Cuando haya varias carreras o colegios** (no ahora), el admin nombra un **coordinador** por programa o institución: un
docente que hace lo mismo pero solo en lo suyo. Así es como escalan Canvas (subcuentas por facultad) y Brightspace
(unidades organizativas): la curaduría se reparte, no se concentra en una persona.

**Casos reales de hoy:**
- **Fundamentos de Algoritmia** (203413, 3.er semestre, Lic. en Informática) es **una** asignatura con **dos** plantillas:
  «con JavaScript», según el plan de clase, y «Pensamiento algorítmico desde cero», otro enfoque con menos programación.
- **Uso de la Inteligencia Artificial en la Educación** (Prof. Víctor Castro) es de la Universidad de Córdoba, **sin programa**: electiva libre.

### 2.3 Plantillas: compartir por alcance, encontrarlas por cercanía

El sí/no de hoy se cambia por **«¿Con quién la compartes?»**, como en Canvas Commons, pero con los niveles de una universidad:

| Alcance | Quién la ve | Cuándo sirve |
|---|---|---|
| **Solo yo** (predeterminado) | El autor, para reusarla en sus otros grupos | Siempre |
| **Docentes de esta asignatura** | Quien dicte Fundamentos de Algoritmia, en cualquier grupo | Varios grupos de la misma materia |
| **Mi programa** | Docentes de la Licenciatura en Informática | Cursos parecidos de semestres cercanos |
| **Mi facultad** | Docentes de Educación y Ciencias Humanas | Asignaturas comunes de la facultad |
| **Mi institución** | Toda la Universidad de Córdoba | Competencias generales |
| **Todo STIRE** | Cualquier docente, también de colegios | Material abierto |

**Para no abrumar** (es lo que más importa en la experiencia):
1. **Se recomiendan solas, por cercanía.** Al crear una clase de Fundamentos de Algoritmia, el paso «Contenido» muestra
   primero las plantillas **de esa asignatura**, luego las del mismo semestre y luego las del programa. Las demás quedan
   detrás de «Buscar en más plantillas».
2. **Cada tarjeta responde «¿me sirve?» sin abrirla:** asignatura y semestre, autor, número de módulos, lecciones y
   ejercicios, última actualización, cuántos docentes la copiaron y **qué tanto les sirvió a los estudiantes** (la
   valoración «¿Te sirvió esta explicación?» que ya existe). Es una señal de calidad que ninguna de las plataformas
   anteriores tiene.
3. **Vista previa antes de copiar**, y copiar **módulos sueltos**, no todo o nada (`modulosParaCopiar` ya existe).
4. **Se sigue copiando, no enlazando**, y lo copiado llega en borrador. A futuro, si el autor actualiza, el que copió ve
   «Hay una versión nueva de esta plantilla» y decide (como Blueprint de Canvas, pero sin imponer).

### 2.4 Cómo se ve

**Crear una clase** (tres pasos cortos, cada uno con un valor sugerido):

```
┌ Nueva clase ─────────────────────────────────────────────┐
│ 1 Asignatura   2 Grupo y periodo   3 Contenido            │
│                                                           │
│ ¿Para qué asignatura es?                                  │
│ [ fundam|                                          ]      │
│   Fundamentos de Algoritmia · 203413 · 3.er sem.          │
│   Fundamentos de Programación · 4.° sem.                  │
│   + Agregar «fundam…» a la Licenciatura en Informática    │
│ Puedes dejarlo en blanco y elegirlo después.              │
│                                    [Omitir] [Siguiente →] │
└───────────────────────────────────────────────────────────┘
  2  Grupo [Grupo 2]  Periodo [2026-2 ▾]  → nombre sugerido
  3  ◉ Copiar una plantilla   ○ Empezar vacía
     Recomendadas para Fundamentos de Algoritmia
     ┌ ALGO-203413 · Laura Martínez ──────── 92 % les sirvió ┐
     │ 4 módulos · 13 lecciones · 41 ejercicios · 3 copias   │
     └ [Vista previa]  [Elegir módulos]                       ┘
```

**Barra superior: contexto real, sacado de los datos**
- Estudiante: `Fundamentos de Algoritmia · 3.er semestre · Lic. en Informática`. Lo toma de la clase activa; si tiene
  varias, el selector de clase ya existe.
- Docente: el contexto de la clase que está viendo. En su inicio, si tiene clases en varios programas o instituciones,
  aparece un filtro «Todas / Lic. en Informática / I. E. San José».
- Si una clase no tiene asignatura, solo se muestra su nombre. **Nunca se inventa un programa.**

**Inicio del docente:** clases agrupadas por periodo («2026-2») y, si tiene varios programas, por programa. Cada tarjeta
muestra la asignatura y el semestre.

**Perfil → «Dónde enseño» / «Qué estudio»:** la lista de vínculos con su institución, programa y semestre o grado. Se
agrega uno con el mismo buscador.

### 2.5 Escalabilidad

- El catálogo es pequeño (una universidad tiene cientos de asignaturas, no millones) y se busca con un índice por nombre.
- La lista de plantillas **se filtra en el servidor** por alcance y vínculos del docente (índices por `alcance`,
  `asignaturaId` y `programaId`), con paginación de 12. El docente nunca descarga lo que no puede ver.
- Los conteos de módulos, lecciones, copias y valoración se guardan al compartir o copiar. Hoy son subconsultas por fila;
  con paginación siguen siendo baratas, pero así no crecen.

## 3. Lo que el servidor tenía y nadie usaba (revisión del 04/10)

De 179 rutas del servidor, estas no las llama ninguna pantalla (se descartaron las que el frontend arma en tiempo de ejecución,
como aprobar o rechazar una matrícula):

| Qué | Para qué servía | Qué hacer |
|---|---|---|
| `GET/POST /institutions`, `/programs`, `POST /users/me/affiliations` y la tabla `user_affiliations` (programa, rol, semestre del usuario) | La organización académica | **Ya se usan** institución y programa (fase 1). Los vínculos del usuario quedan para «Dónde enseño / Qué estudio» (fase 3) |
| `startDate`, `endDate` y `maxStudents` de la clase | Fechas de matrícula y cupo: el servidor ya los hace cumplir al entrar con el código | Ninguna pantalla los deja poner. Encajan con el **periodo**: llevarlos a Ajustes (fase 2) |
| Módulo `gamification` (tabla `achievements`) | Logros | Su servicio está comentado: código muerto. Decidir si se borra o se diseña (no es prioridad pedagógica) |
| `GET /activity-log/student/:id` | Historial de actividad del estudiante | Útil para el docente en la ficha del estudiante; hoy no se muestra |
| `GET /message/conversation/:userId` | Ver una conversación | La pantalla de mensajes usa otra ruta; revisar si sobra |
| `GET /learning-unit/all`, `GET/PATCH/DELETE /activity-types/:id`, `GET /auth/profile` | Administración y pruebas | Sin pantalla; se pueden quitar o dejar solo al admin |
| `DELETE /media/images/:id` | Borrar una imagen subida | El editor no deja borrar imágenes; quedan huérfanas |

## 4. Por fases, sin poner en riesgo la v2.0.0

| Fase | Qué | Cuándo |
|---|---|---|
| **0** | Texto verdadero en la barra superior («Lic. en Informática») | **Hecho, 04/10** |
| **1** | Asignatura (tres formas), periodo y grupo en la clase; catálogo precargado (Unicórdoba, Licenciatura en Informática, Fundamentos de Algoritmia 203413); el docente agrega asignaturas, programas e instituciones (también colegios por grados); barra superior desde los datos | **Hecho, 04/10** (pedido «a la brevedad»). Falta completar las 2 clases reales en Ajustes |
| **1.5** | Orden del catálogo (§2.2.1): nombre normalizado con índice único, «¿Es alguna de estas?», oficial o agregada, «Unir» con sinónimo y pantalla «Catálogo» del admin | **Hecho, 04/10** (falta desplegar el servidor). Electiva «Uso de la Inteligencia Artificial en la Educación» (Prof. Víctor Castro) cargada como oficial |
| **2** | Plantillas por asignatura con enfoque; «¿Con quién compartes?» (nadie, asignatura, programa, facultad, institución, todos) con los nombres reales; cada docente ve lo compartido con alguien como él; recomendadas por cercanía, copias, «¿te sirvió?» (desde 5 votos) y actualidad; vacías y abandonadas ocultas; el código de ingreso ya no viaja con la plantilla | **Hecho, 04/10** (falta desplegar el servidor) |
| **3** | Varias instituciones (colegios), filtro por programa en el inicio del docente, «Hay una versión nueva» | Cuando llegue el primer colegio |

Cada fase lleva su migración (todas las columnas nuevas son opcionales, así que las clases de hoy no se tocan), sus
pruebas y su entrada en `investigacion/BASE_TEORICA.md`.

## 5. Lo que tiene que decidir Jeider

1. ~~¿El docente puede agregar asignaturas?~~ Sí (04/10), y también una electiva sin programa o un curso libre.
2. ¿El alcance **predeterminado** al compartir es «Docentes de esta asignatura» o «Solo yo»? (Recomendado: «Solo yo», y
   sugerir «esta asignatura» con una frase.)
3. El **nombre exacto, el código y el semestre** del curso de Víctor Castro.
4. ~~¿Cuándo la fase 1?~~ Hecha el 04/10: todo es opcional y las clases de antes no cambian.
5. ¿Qué hacer con la gamificación muerta y las rutas sin uso (§3)?

## Referencias de producto

- Canvas Commons, opciones para compartir: [Instructure Community](https://community.canvaslms.com/t5/Canvas-Commons/What-types-of-sharing-options-are-available-in-Commons/ta-p/1815).
- Brightspace, plantillas y ofertas de curso: [D2L Community, «About Course Templates»](https://community.d2l.com/brightspace/kb/articles/4833-about-course-templates); unidades organizativas: [UTRGV, «Brightspace Organizations»](https://support.utrgv.edu/TDClient/1849/Portal/KB/Article/163024/Brightspace-Organizations).
- Licenciatura en Informática, Universidad de Córdoba: [página del programa](https://unicordoba.edu.co/facultad-de-educacion-y-ciencias-humanas/informatica/) y [plan de estudios](https://www.unicordoba.edu.co/wp-content/uploads/2023/11/pensum-informatica.pdf) (no respondió al consultarlo el 04/10; el resumen del buscador indica 10 semestres, 165 créditos y Fundamentos de Algoritmia en 3.er semestre).
- Moodle (categorías de cursos) y Google Classroom (campos de la clase): ver `DISENO_CLASES_Y_DOCENTES.md`.
