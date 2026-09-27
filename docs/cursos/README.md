# Cursos pedagógicos de STIRE

Dos cursos completos de algoritmia, pensados como los diseñaría un docente de programación para
estudiantes reales. Se crean **dentro de la aplicación** con la cuenta de una docente, y un grupo de
estudiantes los resuelve con las mismas pantallas y peticiones que usaría cualquier persona. Nada se
inyecta directamente en la base de datos.

| Curso | Código de matrícula | Para quién | Lenguaje |
|---|---|---|---|
| **Fundamentos de Algoritmia (203413)** | `ALGO-203413` | III semestre de la Licenciatura en Informática, alineado con el plan de curso FDOC-088 | JavaScript, HTML5 y CSS |
| **Pensamiento algorítmico desde cero** | `PENSAR-ALGO` | Cualquier persona que empieza a programar | Ninguno: pseudocódigo (estilo PSeInt) y diagramas de flujo |

El contenido vive en [`src/seeds/cursos/`](../../src/seeds/cursos/) y las herramientas que lo cargan en
[`scripts/cursos/`](../../scripts/cursos/): cada lección y cada ejercicio, con su
solución y su error común, en archivos de datos que se pueden revisar y versionar.

## Principios de diseño

1. **Una idea por unidad.** Cada unidad de aprendizaje enseña una sola cosa, con una lección corta y
   de tres a cuatro ejercicios.
2. **La misma estructura en todas las lecciones.** Cada lección tiene cuatro partes: «La idea»,
   «Un ejemplo», «Error común» y «Pruébalo». Es la plantilla que ofrece el editor de lecciones de la app.
3. **De reconocer a producir.** Dentro de cada unidad los ejercicios van de lo más guiado a lo más
   abierto: opción múltiple → ordenar o clasificar → completar código → programar o construir la página.
4. **El error común es parte del diseño.** Cada ejercicio declara la confusión típica de un principiante,
   y los distractores de la opción múltiple la representan. La explicación que ve el estudiante al
   responder nombra esa confusión y dice cómo corregirla.
5. **Contexto cercano.** Los problemas usan situaciones de un estudiante de Montería: la escala de notas
   de 0.0 a 5.0, la escala de desempeño del Decreto 1290, las fotocopias de la papelería, la salida al río Sinú.
6. **Casos límite en las pruebas.** Los ejercicios de programar tienen casos públicos (el estudiante ve el
   formato) y ocultos (el valor exacto del límite, el cero, el caso de un solo dato).

## Curso 1 · Fundamentos de Algoritmia (203413)

Las tres secciones son las tres unidades del plan de curso. Cada unidad nombra el resultado de
aprendizaje (RA) y las evidencias del plan que trabaja.

| Sección (unidad del plan) | Temas | Unidades de aprendizaje | Evidencias del plan |
|---|---|---|---|
| **Unidad 1 · Introducción a la algoritmia** (RA-203413-U1) | ¿Qué es un algoritmo? · Variables, operadores y expresiones · La estructura de una página web | Algoritmos en la vida diaria · Pseudocódigo y diagramas de flujo · Variables y tipos de datos · Operadores y expresiones · Mi primera página HTML · Reparar una página con errores | U1-E1 (plantilla web), U1-E2 y U1-E3 (reparar una plantilla con errores) |
| **Unidad 2 · Diseño e implementación de algoritmos** (RA-203413-U2) | Analizar el problema · Condicionales · Ciclos · Funciones · JavaScript en la página web | Entradas, proceso y salidas · Decidir con if y else · Varios caminos con else if · Repetir con for y while · Contadores y acumuladores · Crear y usar funciones · El DOM y los eventos · Dar estilo con CSS | U2-E1 (presentación de tres diapositivas) |
| **Unidad 3 · Algoritmos para crear OVA y REDA** (RA-203413-U3) | OVA y REDA · Construir un OVA interactivo | ¿Qué es un OVA y qué lo hace bueno? · La lógica de un cuestionario · Estructura y navegación de un OVA | U2-E2 (módulo con navegación), U3-E1 (creación del OVA) |

**Total:** 3 secciones, 10 temas, 17 unidades y 65 ejercicios: 16 de programar, 4 de HTML y CSS, 7 de completar código y 38 de opción múltiple, ordenar, emparejar y clasificar.

## Curso 2 · Pensamiento algorítmico desde cero

| Sección | Unidades de aprendizaje |
|---|---|
| **Pensar antes de programar** | Descomponer, reconocer patrones y abstraer · El robot que sigue órdenes |
| **Representar algoritmos** | Leer, calcular y escribir (pseudocódigo) · Leer un diagrama de flujo · Seguir un algoritmo con lápiz y papel (pruebas de escritorio) |
| **Estructuras de control** | Si, SiNo y condiciones compuestas · Para, Mientras y Repetir · Contadores, acumuladores y banderas |
| **Problemas clásicos** | Mayor, menor y promedio · Buscar en una lista (lineal y binaria) |

**Total:** 4 secciones, 10 temas, 10 unidades y 40 ejercicios (8 de completar pseudocódigo), sin depender de ningún lenguaje de programación.

## Cómo se garantiza la calidad de los ejercicios

La prueba [`src/seeds/__tests__/cursos-pedagogicos.spec.ts`](../../src/seeds/__tests__/cursos-pedagogicos.spec.ts)
corre con `npm test` y revisa los dos cursos con el **motor de evaluación y el juez reales** de la app:

- La respuesta correcta de cada ejercicio obtiene todos los puntos.
- El error común **no** los obtiene: el ejercicio distingue a quien entendió de quien no.
- En los de programar, la solución modelo pasa todos los casos en el juez, el error común falla al menos
  uno y el código inicial no resuelve el ejercicio por sí solo.
- Los de HTML y CSS pasan la misma validación que hace la app al crearlos.
- Ninguna respuesta llega al estudiante.
- Cada lección tiene las cuatro partes de la plantilla y cada unidad tiene al menos tres ejercicios.

Una limitación honesta: la prueba no puede detectar una clave de opción múltiple que sea
conceptualmente incorrecta pero coherente con sus opciones. Esas claves se revisaron a mano.

## Cómo se cargan en una instalación

Las tres herramientas usan la API como lo hace la aplicación web y respetan su límite de peticiones.
Todas las cuentas usan la contraseña de pruebas del proyecto.

```bash
# 1. Cuentas: la docente se registra pidiendo el rol, un administrador lo aprueba y los estudiantes se registran
STIRE_API=https://... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
  npx ts-node -r tsconfig-paths/register scripts/cursos/preparar-cuentas.ts

# 2. La docente crea las clases, secciones, temas, unidades, lecciones y ejercicios, y los publica
STIRE_API=https://... DOCENTE_EMAIL=laura.martinez.docente@example.com DOCENTE_PASSWORD=... \
  npx ts-node -r tsconfig-paths/register scripts/cursos/crear-cursos.ts

# 3. Los estudiantes se unen con el código y resuelven los ejercicios
STIRE_API=https://... npx ts-node -r tsconfig-paths/register scripts/cursos/simular-estudiantes.ts
```

Si alguna corrida se interrumpe, se puede repetir: lo que ya existe no se duplica. Después de cambiar el
contenido en `src/seeds/cursos/`, `crear-cursos.ts --actualizar` lleva el texto nuevo de lecciones y enunciados
a la instalación, como lo haría la docente editándolos.

## Las personas de la simulación

Son ficticias y sus correos usan el dominio reservado `example.com`
([`scripts/cursos/personas.ts`](../../scripts/cursos/personas.ts)).

| Persona | Perfil | Hasta dónde llega |
|---|---|---|
| Laura Martínez Petro | Docente de ambos cursos | Crea y publica todo |
| Valentina Pérez Hoyos | Aplicada: casi siempre acierta | Todo el curso 1 y todo el curso 2 |
| Andrés Felipe Montes | Promedio: en lo intermedio necesita un segundo intento | 8 de 17 unidades del curso 1 y 7 de 10 del curso 2 |
| Camila Díaz Ortega | Le cuesta: se equivoca con frecuencia y reintenta | 5 unidades del curso 1 y 4 del curso 2 |
| Santiago Ruiz Galván | Llegó tarde al curso | 3 unidades del curso 1 y 2 del curso 2 |
| Mariana Suárez Lora | Constante, solo en el curso 1 | 9 unidades del curso 1 |

Cada intento sale del perfil: la probabilidad de acertar depende de la dificultad y sube con cada nuevo
intento, como le pasa a quien aprende de su error. Cuando falla, entrega el error común del ejercicio,
no una respuesta al azar. La simulación es reproducible: la misma persona y el mismo ejercicio producen
siempre la misma secuencia.
