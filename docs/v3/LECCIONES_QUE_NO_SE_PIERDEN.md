# Lo que STIRE aprendió y la v3 no puede perder

Revisión del 11/11/2026, antes de empezar a construir la v3. STIRE mejoró paso a paso, probándolo con el equipo y con
los profesores; esta lista existe para que ese aprendizaje pase entero a la versión nueva.

**Qué se comparó:**

- las 46 decisiones con fundamento (`docs/investigacion/BASE_TEORICA.md`, BT-01 a BT-46);
- los 61 pendientes (`docs/PENDIENTES.md`);
- unos 190 arreglos que salieron de probar la app (`git log`, commits `fix`);
- los 174 componentes y las páginas reales de `frontend-nuxt`;

contra el texto de los 209 cuadros del lienzo de diseño v3
(<https://claude.ai/artifact/WA3ChLaQQXfCMorKgYkfsB>).

**Resultado:** casi todo está en el diseño. Quedan:

- 9 funciones que existen en la app pero no se dibujaron (§B): al construir **se conservan tal cual**;
- 4 contradicciones (§C): una ya se corrigió y una necesita tu decisión;
- 24 reglas que no se ven en ninguna pantalla porque viven en el código (§D): toda pantalla nueva las debe cumplir.

---

## A. Lo que ya está en el diseño v3

| Lo aprendido | Dónde se ve en la v3 |
|---|---|
| El Tutor explica el concepto, comprueba y guía con pistas; no da la solución (BT-15, BT-24, BT-33, prompts v13 a v17) | E-Tutor, E-Ejercicio-Error |
| Avance del curso separado del dominio (BT-04 y el arreglo «Avance del curso» en vez de «Dominio general 99,2 %») | E-Progreso: «19 % del curso» aparte del dominio |
| Sin rachas: la semana de estudio, «3 días, no seguidos» (arreglo que reemplazó a BT-21) | E-Inicio y E-Progreso: «Tu semana · Sin rachas» |
| El repaso no va en rojo (P38) y orienta en vez de alarmar | E-Repasos, colores por sección |
| Probar no gasta intentos; probar con mis datos (P48, P49) | E-Ejercicio: «pruébalo con tus datos · no cuenta», «no gasta intentos» |
| Casos con nombre y resultado «Pasaron 1 de 2» (P54); etiqueta del lenguaje (P55) | E-Ejercicio-Casos, E-Ejercicio |
| Escalera de práctica y pasos (P14, P51) | E-Ejercicio: «Paso 4 de 5 · Escribirlo tú» |
| La lección: meta, anterior y siguiente, «Lección 2 de 2» (BT-40, SaltosLeccion) | E-Leccion |
| Varias formas de ver la lección, escuchar con la frase resaltada (BT-32, BT-36, P45) | E-Leccion-Otra, E-Leccion-Lectura |
| ¿Sabes cuándo sabes? (calibración, BT-30) | E-Progreso, E-Progreso-Competencias |
| Logros privados, sin ranking (BT-29) | E-Progreso: «Nada se compara con tus compañeros» |
| Apariencia: tema, tamaño del texto, contraste, espaciado (BT-35) | E-Cuenta · Apariencia y lectura |
| Encuesta SUS dentro de STIRE, sin interrumpir (BT-31, BT-38) | E-Encuesta-Invitacion, A-Opiniones-SUS |
| La acción junto al dato; STIRE propone y el docente decide (BT-08, BT-09) | D3-Clase: «Necesitan algo», cada uno con su porqué y su acción |
| Lo que le cuesta a la clase (BT-46, en parte) | D3-Clase: «Olvidan los paréntesis 14 de 28» |
| Cuándo se muestra cada explicación (CuandoExplicacion) | D3-Contenido: «Si no entendió · Si falla dos veces» |
| ¿Les sirvieron las explicaciones? (ValoracionesClase) | D3-Estudiantes |
| Entregas con versiones y escala del docente (BT-06, BT-37); asignar solo a algunos (BT-11) | D3-Entregas, D3-Entregas-Lista |
| La clase copiada de la Biblioteca o de otra clase (BT-18, ElegirPlantilla) | D3-Nueva-Clase, D3-Biblioteca |
| La asistencia sigue abierta mientras el docente navega (P32) | D3-Asistencia, D3-Cel-Asistencia |
| El Tutor de la clase: activado y hasta dónde ayuda (TutorSettingsPanel) | D3-Ajustes: «Cómo ayuda el Tutor» |
| Registro en dos pasos (BT-27); errores debajo de cada campo; «correo o contraseña» sin decir cuál falló; mayores de 18 | Entrar, Entrar-estados |
| El QR une a la clase sin pulsar más, con o sin sesión (sugerencia n.º 14) | Entrar-QR, E-Clases-QR |
| La clave de IA no se pide al registrarse (Pedro, ítem 31); cada uno usa su clave; cero cobros | D3-Cuenta, A-IA |
| Eliminar mi cuenta y borrado con 30 días de gracia (Ley 1581, P12) | A-Perfil, A-Usuario-Borrar |
| Palabras humanas: «necesita ayuda», «va más lento», nunca «trabado», «rezago» ni «bloqueado» | Todo el lienzo; «atrasados» se cambió el 11/11 en D3-Recuerda |

## B. Existía en la app y no estaba dibujado

En el diseño no aparecían porque son detalles dentro de otra pantalla, pero el equipo los pidió o salieron de probar.
Al construir la pantalla indicada **se conserva el componente actual**, solo con el estilo nuevo. No se borra ninguno
sin decidirlo antes.

**Cómo quedó el 12/11:**

- **Ya dibujados en el lienzo:** B1 (D3-Clase), B2 (D3-Contenido), B3 (D3-Traer), B4 (D3-Banco, práctico: sugeridos
  para la lección, filtros, «Agregar aquí»), B5 (dentro de Ayuda, discreto: pendiente P63), B8 (D3-Notas) y B9
  («¿Cómo sube mi dominio?», plegado en Mi progreso y en Ayuda).
- **Nuevo, a pedido de Jeider:** el administrador revisa lo que se comparte en la Biblioteca (A-Biblioteca,
  «Contenido compartido»).
- **Queda pendiente:** B7 («Te acompaño paso a paso», P62).
- **No se dibuja porque no hace falta:** B6, un aviso que se conserva tal cual en el ejercicio.

| # | Qué hace | Componente actual | Pantalla v3 donde va | De dónde salió |
|---|---|---|---|---|
| B1 | Separa los errores de concepto (para explicarlos en clase) de los descuidos de escritura (se corrigen practicando), con quién los tiene y un refuerzo armado | `docente/ErroresSemana.vue` | D3-Clase, dentro de «Lo que le cuesta a la clase» | Pedro, 19/10 (MOD-02); BT-45, BT-46 |
| B2 | «Para que sea una buena lección»: una guía opcional mientras el docente arma la lección | `docente/GuiaLeccion.vue` | D3-Contenido, al editar una lección | BT-42 |
| B3 | Traer contenido de otra clase propia o de una plantilla, sin publicar y sin estudiantes ni notas | `docente/contenidos/VentanaImportar.vue` | D3-Contenido, en «Más» | Diseño de plantillas (T3) |
| B4 | Mi banco de ejercicios: reutilizar un ejercicio propio en otra lección | `docente/ejercicios/VentanaBancoEjercicios.vue` | D3-Contenido y D3-Ejercicio | T4 |
| B5 | Primeros pasos del estudiante: cinco cosas para la primera semana que se marcan solas | `estudiante/PrimerosPasos.vue` | E-Inicio, solo la primera semana; vuelve desde Ayuda | Recorrido guiado |
| B6 | «Este ejercicio ya no sube tu dominio»: explica que repetir algo ya completo es repaso | `exercise/SinIntentos.vue` | E-Ejercicio, al abrir uno ya completo | Arreglos del dominio que nunca baja |
| B7 | «Te acompaño paso a paso hasta que te salga», con «Terminar acompañamiento» | `tutor/AvisoAcompanado.vue` | E-Tutor, cuando la ayuda escala | BT-33, P52 |
| B8 | La nota que STIRE propone con evidencia; la oficial queda en Moodle | `pages/docente/clase/[classId]/notas.vue` | D3-Notas | BT-14 |
| B9 | «Cómo avanzas en STIRE»: qué hace subir el dominio y cómo quedó cada resultado | `estudiante/ComoAvanzas.vue` | E-Progreso, pestaña «Dominio» | Jeider, 04/10 (reemplazó a «Mi calibración») |

## C. Contradicciones encontradas

| # | Qué | Estado |
|---|---|---|
| C1 | D3-Entregas ponía la nota antes que el comentario; BT-01 dice que el comentario va primero y la nota es opcional | **Corregido el 11/11** en el lienzo |
| C2 | Nombres de la estructura: el prototipo decía «Unidad 1 · Tema 2 · Lección 2 de 2» | **Decidido el 12/11:** en pantalla, **Módulo → Tema → Lección**, y cada lección tiene su explicación y sus ejercicios. En el servidor sigue siendo sección → tema → unidad de aprendizaje (`utils/terminos.ts`). Cambiado en todo el lienzo; coincide con BT-12 |
| C3 | Cuadros de decisión anteriores que el prototipo ya superó (más abajo). **Al construir manda el prototipo navegable**, no estos cuadros | Marcar como «superado» |
| C4 | BT-13 y BT-17 hablan de la sección «Hoy», y BT-21 de «la racha a la vista». Después se decidió sin «Hoy» y sin rachas | Agregar una nota de cambio en `BASE_TEORICA.md` (lo decide la pista de investigación) |

Cuadros superados (C3):

- **Admin-funciones:** dice «6 entradas del menú quedan en 3» y propone «Ver como un usuario». El administrador
  final tiene el menú por secciones (Personas, Académico, Opiniones, Sistema) y quitó «Ver como él».
- **Del-diseno-al-codigo:** sigue siendo útil como mapa de componentes, pero menciona «Racha y logros», «Menú de 4
  destinos» y «Administrador · Resumen». Su orden de construcción se reemplaza por `PLAN_CONSTRUCCION_V3.md`.

## D. Reglas que no se ven en el diseño y salieron de probar

No son pantallas: son arreglos que costaron rondas de prueba. Toda pantalla nueva las cumple.

1. **Fechas y horas en hora de Colombia**, no en la del servidor: repasos, saludo y «vuelve el…» con la fecha real.
2. **Números como se escriben en español:**
   - coma decimal en las notas (4,5);
   - espacio antes del porcentaje (97 %);
   - «la semana pasada», no comparaciones crípticas;
   - «menos de 1 KB», no «0 KB».
3. **Las cifras concuerdan en número:** «Pasó 1 de 3 casos», «0 de 1 caso».
4. **Una lección dominada dice «Dominada ✓»**, nunca «Atrasado». La insignia de Repasos del menú cuenta solo los de hoy.
5. **El dominio nunca baja por repetir algo ya ganado**, y practicar y fallar en una casilla completa no lo baja.
6. **Las métricas de una clase solo cuentan sus propias unidades.** Un estudiante retirado no aparece en
   «Estudiantes». Un ejercicio de un refuerzo tiene su propio intento.
7. **El botón del Tutor nunca tapa otro botón**, ni en el celular ni al final de la página. Al bajar se reduce al ícono.
8. **El chat del Tutor:**
   - un código largo no lo mueve de lado;
   - los símbolos se ven bien (`<-`, no `&lt;-`);
   - el fondo de los mensajes no se aclara en el tema oscuro.
9. **El Tutor dentro de un ejercicio:**
   - no abre con el saludo de repasos;
   - ve lo que está en pantalla: la plantilla, cada hueco y lo que escribió el estudiante;
   - los prompts van versionados en `docs/prompts/`. Hoy rige la v17 y no se cambia sin el laboratorio de prompts (P41).
10. **El primer mensaje del Tutor tras un despliegue no espera 30 s:** el modelo rápido va primero.
11. **Objetivos táctiles de 44 px**, incluido el ojo de la contraseña y los controles de Contenido en el celular.
12. **Botones de solo ícono con nombre y descripción emergente**, y rótulos en estilo de oración, sin ✏ ni ↩.
13. **Las ventanas:**
    - el foco entra al primer campo, Tab no se sale, Escape cierra y el foco vuelve al botón que la abrió;
    - si hay que bajar, se puede.
14. **Borrar o archivar dice qué se pierde.** Si no lo sabe, no ofrece borrar. Archivar se puede deshacer y lo
    archivado tiene su lugar («Temas archivados»).
15. **Un error se ve en pantalla y dice qué hacer:**
    - una entrega que falla (P60);
    - un video que no carga;
    - el dictado por voz;
    - «No encontramos esa página»;
    - un intento cerrado no deja atascada la entrega.
16. **Tras iniciar sesión se vuelve solo a una sección de la app;** si no, al inicio del rol. El QR guardado sigue
    esperando hasta que la persona entra.
17. **Lo que se oculta sigue oculto al recargar**, como el aviso de repasos.
18. **Los textos con tildes escritas**, no como entidades HTML.
19. **Animaciones de 5 s o menos y nada se mueve con «Reducir el movimiento».** El logo queda fijo y nítido; solo se
    mueve la mascota.
20. **El menú distingue dos grupos de la misma materia** por su código o iniciales, y la barra nombra el programa real
    (Licenciatura en Informática).
21. **Contenido del docente:**
    - publicar u ocultar se puede deshacer;
    - ocultar pide confirmación;
    - en el celular el selector de clase no se sale de la pantalla.
22. **El catálogo de tipos de actividad llega por migración.** Un despliegue sin él dejó sin poder crear ejercicios.
23. **El plan del curso se pliega por módulo:** el inicio en el celular bajó de 3208 a 2358 px.
24. **La ayuda abre en la misma pantalla:** «Ver en el manual» va en su renglón, y los primeros pasos van según el
    avance real.
