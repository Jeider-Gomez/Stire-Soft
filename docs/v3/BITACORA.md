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
| — | — | (nadie) | — |

> Si dejas cambios sin guardar al irte, anótalo aquí con los archivos, para que el siguiente sepa de quién son.

## Pendiente (para quien lo tome)

| # | Qué | Dónde | Fase |
|---|---|---|---|
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
