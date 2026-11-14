# Bitácora de la construcción de la v3

Archivo **compartido entre todos los chats** (sesiones de Claude u otras IA) que trabajan en la v3, en esta misma
carpeta. Sirve para no pisarse: quién está tocando qué, qué se terminó y qué queda. El plan completo está en
[`PLAN_CONSTRUCCION_V3.md`](PLAN_CONSTRUCCION_V3.md); aquí va el día a día.

## Reglas para quien trabaje aquí

1. **Al empezar, lee esta bitácora** y `git status`. Si hay cambios sin guardar de otro chat en un archivo, no lo
   toques sin anotarlo en «Trabajando ahora».
2. **Antes de editar, anótate** en «Trabajando ahora» con la fecha, qué haces y qué archivos vas a tocar.
3. **Al terminar**, haz el commit de lo tuyo (un commit por punto, como dice `CLAUDE.md`), borra tu fila de «Trabajando
   ahora» y deja una línea en «Hecho», con el commit.
4. **Si encuentras algo y no lo vas a arreglar tú**, déjalo en «Pendiente» con lo suficiente para que otro lo retome.
5. Nada se sube a GitHub sin que Jeider lo pida. Responder siempre en español.
6. Lo más nuevo va arriba en cada sección.

## Trabajando ahora

| Desde | Quién | Qué | Archivos |
|---|---|---|---|

> Si dejas cambios sin guardar al irte, anótalo aquí con los archivos, para que el siguiente sepa de quién son.

## Pendiente (para quien lo tome)

| # | Qué | Dónde | Fase |
|---|---|---|---|
| P-14 | Ejercicio: «Respuesta abierta» (E-Tipo-Abierta) y «Bloques» (E-Ejercicio-Bloques) no existen en la app: necesitan servidor (tipo nuevo y su calificación). Y decidir si la consola compara cada línea con el ejemplo (v9) o se mantiene la regla del 02/11 | `src/activities/`, `components/exercise/` | D |
| P-13 | «Unirme con un código»: al escribirlo, ver la clase (nombre y docente) antes de unirse, como el cuadro «Entrar-estados». Necesita un punto público del servidor que diga solo el nombre de la clase y del docente por su código, con límite de intentos | `src/class/`, `pages/auth/login.vue` | C |
| P-12 | Entrar: falta «Recordarme en este equipo» (necesita servidor: sesión larga); las reacciones finas de la mascota (persiana, @ que falta, se duerme) van con `useMascotaEntrar` | `pages/auth/login.vue`, `components/auth/MascotaEntrar.vue` | C |
| P-1 | El cuadro D3-Clase del lienzo aún pone la Biblioteca al final; en la app ya va debajo de «Mis clases» | `scripts/diseno-v3/generador/proto_est2.mjs` (`lateralD`) | B |
| P-2 | «Sigue donde ibas» y «Asistencia abierta» en el menú del estudiante: falta el dato (pasado a la Fase D) | backend + `SidebarNav.vue` | D |
| P-4 | Cuentas de pendientes en el menú del administrador (pasado a la Fase F) | backend + `SidebarNav.vue` | F |
| P-6 | P59: bajar los 180–250 pedidos por página (agrupar el JavaScript) y volver a medir con `scripts/v3/medir-partida.mjs` | `nuxt.config.ts` | — |
| P-8 | El ☰ del estudiante en el celular sigue (el diseño E-Cel-Inicio no lo tiene): sale cuando «Mi clase» y «Mis proyectos» tengan su lugar (Fase D) | `HeaderNav.vue`, `BarraInferior.vue` | D |
| P-9 | `pages/docente/refuerzos/index.vue` dice «Bloqueados» (regla de palabras humanas: «necesita ayuda») | esa página | E |
| P-10 | La libreta del Asistente ya existe (`docente/asistente/Libreta.vue`) y va en la barra de abajo del docente; falta ponerla en la cabecera del panel, que aún usa la mascota del Tutor | `docente/asistente/Panel.vue` | E |
| P-11 | La cabecera del Tutor dice «Te guía con preguntas…»; el diseño (E-Tutor) dice «Estás en: lección · %» y «Plegar» | `TutorChatDrawer.vue` | D |
| P-7 | En oscuro, el código de la clase junto al título del Resumen casi no se ve; la tarjeta del menú dice el código y el diseño, «28 estudiantes» | `pages/docente/clase/[classId]/index.vue`, `ClasesDelMenu.vue` | E |

## Hecho

| Fecha | Qué | Commit |
|---|---|---|
| 14/11 | Fase D, paso 3 (cierre): los demás tipos revisados contra su cuadro (pista con el Tutor, emparejar con color y línea por pareja, ordenar compacto) y la **mesa de trabajo** del ejercicio: el enunciado empieza en 32 %, divisores que se arrastran (también con teclado, doble clic vuelve, se recuerdan), vista previa plegable a una franja y distribuciones de la página web: Clásica, Reglas a la izquierda, Código y vista previa, Solo código (`utils/mesaEjercicio.ts`) | «feat(v3): ejercicio como el cuadro «E-Ejercicio» v9, los demás tipos y la mesa de trabajo» |
| 13/11 | Fase D, paso 3 (primera parte del ejercicio de programar, sobre el v9): el camino Escribe → Ejecuta → Prueba casos → Entrega bajo la cabecera (guía, no candado; «Prueba casos» queda hecho cuando pasan los casos), «Tu misión» con Recibes / Muestras sacados del ejemplo del docente, pestañas «Lo que pide el profe» y «Prueba de casos», y «Entregar» en tinta. Segunda parte: «Hazlo en N pasos» antes que «Lo que necesitas saber (ya lo viste)», que dice lo que se escribe (`leerNumero()`, `console.log()`…) y lleva a la explicación de la lección; el Tutor queda como último recurso; la pestaña se nombra «Prueba de casos» en todos los textos. Los demás tipos (una columna): fondo suave, tarjeta más grande y «Pedir una pista» junto a «Entregar respuesta» en amarillo, como los cuadros E-Tipo-*. Emparejar tocando (E-Tipo-Emparejar): se toca el elemento y luego su pareja de las fichas de abajo; tocar una pareja puesta la devuelve; la respuesta sigue igual (`{ pairs }`). Opción múltiple con su letra (A, B, C…) y la elegida en tinta sobre celeste (E-Tipo-Opcion); ordenar arrastrando o con flechas que dicen qué suben o bajan (E-Tipo-Ordenar); completar código con los espacios marcados y «Llevas 1 de 3» (E-Tipo-Completar); clasificar ya era como el cuadro. Página web con su camino Escribe → Mira → Probar → Entrega (E-Tipo-Html). «Prueba de casos» como E-Ejercicio-Casos: «Cumples 2 de 4 casos» con barra, cada caso «Cumple» o «Todavía no coincide» y, en el que falla, «Lo que pasa» y qué repasar. La ventana del resultado con la mascota grande y el siguiente paso en tinta (E-Logrado, sin sacar nada de «Más detalles»: MOD-03), y la consola que compara cada línea con el ejemplo (contradice la regla del 02/11, «la consola no compara»: decide Jeider) y los demás tipos (E-Tipos) | ver `git log` («camino del ejercicio») |
| 13/11 | Fase D, paso 2 (lección completa) como «E-Leccion»: portada celeste con «Módulo · Tema · Lección n de N», lección principal y Escuchar; «Otras formas de verla» al lado (solo las que la lección trae y las explicaciones extra del docente; se recoge y se recuerda) o bajo el título en pantallas angostas; «¿Te sirvió?» dentro de la lección; «Practica esta lección» (dominio con la meta, siguiente ejercicio con su porqué, reto y lista) como su propia pieza (`leccion/Practica.vue`); anillo de la meta y «Practicar» en la barra. Arreglo: en el estudiante, `<main>` ya no corta lo fijo arriba (`overflow-x-clip`): la barra de la lección vuelve a quedarse arriba al bajar | ver `git log` («lección completa») |
| 13/11 | Encuesta SUS para usuarios nuevos: se invita a los 3 días o, antes, apenas entregó un ejercicio (estudiante) o creó una clase (docente); **desplegar el backend**. Tutor: «Estás en: lección · %» como «E-Tutor», y una prueba (`tutor-v3`) que protege el prompt v17, el nivel de ayuda y el contexto. Arreglo: con el Tutor abierto, «Contenido del curso» cede su sitio a la lección | ver `git log` («encuesta SUS») |
| 13/11 | Fase D, paso 2 (navegación de estudio): en la lección, el menú en íconos y «Contenido del curso» al lado (módulo, temas, estado de cada lección y «Sigue»; se recoge y se recuerda) y «Anterior / Siguiente» con nombres, como «E-Leccion» y «E-Leccion-Cerrado». Arreglo: plegado, el ícono de «Aprender» y «Mi clase» ya no se aplasta. Falta: el anillo de la meta y «Practicar» en la barra | ver `git log` («navegación de estudio») |
| 13/11 | Fase D, paso 1: Inicio del estudiante como «E-Inicio» y «E-Cel-Inicio» (siguiente paso, camino del módulo, de tu clase, te lo dejó el profe, tu semana sin rachas) y «Aprender» como «E-Aprender» (filtros, módulos, temas). Servidor: los días de práctica de la semana en los logros (**desplegar el backend antes**). La franja de bienvenida de la clase sale del Inicio (sigue en «Mis clases») | ver `git log` («Inicio del estudiante») |
| 13/11 | Cierre de las Fases B y C: `verify:clean` en verde, 2858 de 2858 pruebas, fotos de después de las pantallas públicas (`vistas/00`–`03`) y la evidencia en `CHANGELOG.md`. Falta el visto bueno de Jeider | ver `git log` («Cierre de las Fases B y C») |
| 13/11 | Fase C, paso 3: Crear cuenta, ¿Olvidaste tu contraseña? y Nueva contraseña con el marco de Entrar (`AuthMarcoEntrar`) y los estados del cuadro «Entrar-estados»: «Abriendo tu inicio…» con la mascota, error con salida, código con «Unirme a la clase», fuerza de la clave en menta y reglas como pastillas. «Crear mi cuenta» se ve sin bajar en 1366×657 y 390×844 | ver `git log` («Crear cuenta») |
| 13/11 | Fase C, paso 2: página de inicio pública como los cuadros «Pagina-inicio» (video, cómo funciona, cómo enseña, repasos, docentes, accesibilidad y el código de la clase); `/` sin sesión ya no salta a Entrar | `75c340f5` |
| 13/11 | Fase C, paso 1: Entrar como el cuadro «Entrar» (tarjeta con la turquesa detrás, mascota que reacciona, «Tengo un código» que guarda la clase como el QR, «Solo mirar» sutil, 44 px) y el video «¿Qué es STIRE?» con subtítulos y transcripción | ver `git log` (dos commits del 13/11) |
| 12/11 | La libreta del Asistente (dibujo del lienzo) en la barra de abajo del docente, como el Tutor en la del estudiante (pedido de Jeider) | ver `git log` («la libreta del Asistente») |
| 12/11 | Cierre de la Fase B (falta el visto bueno de Jeider y `verify:clean`): enlaces del texto subrayados en todos los temas; Buscar (Ctrl K) para docente y administrador (pantallas, clases y ayuda); barra de abajo del docente en el celular; el Asistente deja su espacio a la página como el Tutor; la barra de arriba se compacta con un panel abierto; cabecera del Tutor blanca, no morada | ver `git log` (cuatro commits del 12/11 de la tarde) |
| 12/11 | Arreglos de coherencia del marco 1 a 6 (abajo) y Biblioteca debajo de «Mis clases» (pedido de Jeider). Van en el mismo commit que «Dónde estás» del otro chat, que estaba sin guardar en los mismos archivos | ver `git log` («fix(v3): coherencia del marco») |
| 12/11 | Evaluación del marco contra los cuadros E-Inicio, D3-Clase, A-Usuarios y E-Cel-Inicio, en claro, oscuro y celular: coherente en estructura, nombres y colores; 6 incoherencias (abajo) | — |
| 12/11 | Marco de la Fase B: menú por secciones de los tres roles, barra de arriba, Ctrl+., barra del celular del estudiante | `21940fd1` (otro chat) |
| 12/11 | Logo blanco en oscuro y mascota en alto contraste | `d939cf4f` (otro chat) |
| 12/11 | Fase A cerrada: colores, logo y mascota, `DESIGN.md`, medición de partida (`docs/v3/medicion/`) y arreglos de contraste | `b53327be` … `776ad6d6` |

### Incoherencias del marco encontradas el 12/11 (✅ arregladas el mismo día)

1. En el celular, la campana de Avisos queda encima del logo y la barra de arriba tiene 6 cosas; el diseño
   (E-Cel-Inicio) pone solo logo, campana y cuenta.
2. «Ayuda» sale dos veces: al pie del menú y en la barra de arriba; el diseño solo la pone arriba.
3. El docente ve el título «Hoy en tu clase» y «Dónde estás» dice «Resumen de la clase»; además, la regla es no usar «Hoy».
4. El administrador ve «Sugerencias» en la barra de arriba; el diseño (A-Usuarios) no la tiene.
5. «Dónde estás» del administrador empieza por «Personas»; el diseño dice «Administración».
6. El logo del menú mide 20 px; en el diseño, cerca de 34.

Cómo quedó: en el celular la barra lleva ☰, logo, Avisos, Ayuda y la cuenta (Apariencia está en el menú de la cuenta y
«Enviar una sugerencia», en el de Ayuda); el ☰ se queda porque «Mi clase» y «Mis proyectos» aún no tienen otro acceso
en el celular. «Ayuda» queda solo arriba. El docente ve «Resumen de tu clase». El administrador no ve Sugerencias.
«Dónde estás» del administrador empieza por «Administración». El logo del menú mide 34 px (tamaño `menu` de `Logo.vue`).
