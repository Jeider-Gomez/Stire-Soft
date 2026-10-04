# Personas y análisis de tareas de STIRE

> **Para qué:** criterio UX-05 de la lista de chequeo de interfaz (Pressman & Maxim, 2019, cap. 12.4.2 y 12.4.3).
> Escrito el 04/10/2026 para la segunda versión (v2.0.0).
> **Las Personas son arquetipos de diseño, no personas reales.** Sus nombres son inventados. Sus rasgos salen del
> público del curso (Fundamentos de Algoritmia, 3.er semestre de la Licenciatura en Informática, Universidad de
> Córdoba), de la especificación por rol (`docs/modesec/usuarios/`) y de lo observado en las pruebas del equipo.

## 1. Personas

### Valentina, estudiante de 3.er semestre

| Rasgo | Descripción |
|---|---|
| Contexto | Estudia Licenciatura en Informática. Ve Fundamentos de Algoritmia y otras cuatro materias. Practica de noche o en los tiempos libres, muchas veces desde el **celular**. Tiene datos móviles limitados y a veces la señal se corta. |
| Lo que sabe | Usa redes sociales y ofimática. Nunca ha programado. Le cuesta pasar de «entiendo el ejemplo» a «escribo mi propio algoritmo». |
| Lo que quiere | Aprobar con buena nota y sentir que entiende. Ayuda en el momento en que se traba, sin que le den la respuesta: quiere aprender, no copiar. |
| Lo que la frustra | No saber por qué su programa «falla» cuando la salida le parece igual. Perder lo que escribió. Pantallas con mucho texto técnico. Que le digan que está mal sin decirle qué revisar. |
| Lo que STIRE hace por ella | «Tu siguiente paso» con un clic. Diagnóstico de la salida («se juntaron los números como texto»). Tutor que da pistas en 3 niveles. El código se guarda en el equipo aunque se vaya la red. Botones de Probar y Entregar al alcance del pulgar. |

### Profesor Andrés, docente de Fundamentos de Algoritmia

| Rasgo | Descripción |
|---|---|
| Contexto | Dicta dos grupos de unos 30 estudiantes. Tiene poco tiempo para revisar entregas una por una. Usa el computador de la universidad y su portátil. |
| Lo que sabe | Domina la algoritmia. Usa plataformas como Moodle, pero no quiere aprender una herramienta complicada. |
| Lo que quiere | Saber cada día quién se está quedando atrás y en qué tema, sin abrir 30 perfiles. Que las explicaciones funcionen, y enterarse cuando no. Decidir él cómo califica. |
| Lo que lo frustra | Funciones impuestas que no puede apagar. Datos que no le dicen qué hacer. |
| Lo que STIRE hace por él | «Hoy en tu clase» con lo urgente primero, alertas de rezago y mapa de calor. Refuerzos con un clic. «¿Les sirvieron las explicaciones?» por lección. Bloqueo por módulo configurable (o apagado). Notas opcionales. |

## 2. Análisis jerárquico de tareas (HTA)

Notación: cada tarea se divide en subtareas numeradas; el **plan** dice en qué orden y con qué condición se hacen.

### Tarea 0 · Valentina resuelve un ejercicio de código

```
0. Resolver un ejercicio de código
   1. Llegar al ejercicio
      1.1 Abrir STIRE (inicio de sesión recordado)
      1.2 Pulsar «Continuar» en «Tu siguiente paso»            → 1 clic desde el inicio
      1.3 (opcional) Leer la explicación de la lección y elegir su formato: pseudocódigo, diagrama o paso a paso
   2. Entender qué se pide
      2.1 Leer el enunciado y «Cómo se califica»
      2.2 Revisar los casos de prueba visibles
   3. Escribir la solución en el editor (se guarda sola en el equipo y en el servidor)
   4. Probar
      4.1 Pulsar «Probar código» (barra inferior en el celular)
      4.2 Comparar «Salida esperada» con «Lo que mostró tu código» y leer el diagnóstico
   5. Pedir ayuda si se traba
      5.1 «Pedir una pista al Tutor» (nivel 1 → 2 → 3 según los intentos)
      5.2 «Resolverlo por pasos con el Tutor»
   6. Entregar
      6.1 Pulsar «Entregar solución»
      6.2 Decir qué tan segura está (primera vez; se puede omitir)
      6.3 Leer la nota, el cambio de dominio y la calibración
Plan 0: 1 → 2 → 3 → 4. Si 4 falla: volver a 3, o hacer 5 y volver a 3. Si 4 pasa: 6.
        Tras 3 fallos seguidos en la lección, STIRE propone una pausa (volver a la explicación o a 5).
Plan 4: 4.1 y 4.2 siempre juntos; el diagnóstico solo aparece si un caso no coincide.
```

**Decisiones de diseño que salen de este análisis:**
- La tarea más frecuente (1 → 4) está a un clic del inicio.
- Lo que hay que recordar está a la vista: enunciado, casos y reglas de calificación.
- La ayuda aparece en el paso 4, cuando hace falta, y no antes.

### Tarea 0 · El profesor Andrés prepara y sigue una clase

```
0. Preparar y seguir una clase
   1. Crear la clase
      1.1 «Crear nueva clase» → nombre y código (sugerido)
      1.2 (opcional) Empezar desde una plantilla de curso (ALGO-203413, PENSAR-ALGO)
   2. Preparar el contenido
      2.1 Módulos → temas → lecciones (explicación con imágenes, recursos y algoritmos)
      2.2 Ejercicios por lección (7 tipos, con casos de prueba)
      2.3 Publicar
   3. Invitar a los estudiantes (código o QR)
   4. Seguir la clase cada día
      4.1 Abrir «Hoy en tu clase»: alertas de rezago, entregas por revisar, repasos atrasados
      4.2 Actuar: asignar un refuerzo, comentar una entrega, escribir un mensaje
      4.3 Revisar «¿Les sirvieron las explicaciones?» y mejorar las lecciones marcadas «Revisar»
   5. Ajustar (opcional): umbral entre módulos, aprobación de matrícula, notas, Tutor
Plan 0: 1 → 2 → 3 una vez al empezar el semestre; 4 cada día de clase; 5 cuando lo necesite.
Plan 4: 4.1 siempre primero; 4.2 y 4.3 según lo que aparezca.
```

**Decisiones de diseño:**
- El seguimiento diario (tarea 4) es la tarea frecuente del docente. Por eso «Hoy» es la pestaña inicial de la clase y ordena lo urgente primero.
- Todo lo de la tarea 5 es opcional y se puede apagar sin perder datos.

## Referencias

- Pressman, R. S., & Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9.ª ed.), cap. 12. McGraw-Hill.
- Especificación por rol: [`README.md`](README.md) de esta carpeta.
