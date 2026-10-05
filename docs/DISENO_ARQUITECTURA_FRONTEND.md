---
estado: vigente (04/10/2026)
criterios: PAT-01 (patrones MVC / componentes) y PAT-04 (antipatrones, «The Blob») de la lista de interfaz (Pressman y Maxim, cap. 14)
pedido del dueño: «investiga si es necesario, cuáles son las buenas prácticas, refuta; si se puede solucionar sin dañar el
  proyecto, lo hacemos; el panel»
---

# Arquitectura del frontend: composables por dominio y componentes con una responsabilidad

## 1. ¿Es necesario? Lo que sí y lo que no

**Sí es necesario, pero no por la cifra.** El ejemplo de PAT-04 dice «ningún componente supera las 300 líneas». Esa es
una **señal**, no la regla. El antipatrón «The Blob» (Brown et al., 1998, citado por Pressman) es un componente que
**concentra responsabilidades** que no le tocan: datos, varias pantallas y varias ventanas en un solo archivo. Hay
archivos largos que son coherentes, como un editor de diagramas con su lienzo, sus figuras y sus atajos. Partirlos solo
para bajar de 300 líneas los vuelve más difíciles de seguir.

**Criterio de STIRE:** se divide cuando un archivo mezcla responsabilidades separables (cada parte se podría probar o
cambiar sola), no cuando solo es largo.

## 2. Lo que recomiendan los referentes

- **Nuxt** (documentación oficial y guías de arquitectura): para aplicaciones grandes, la obtención de datos va en
  **composables por dominio**, no en las páginas. La página decide **cuándo** cargar; el composable, **cómo**.
- **Vue:** la lógica que se reutiliza va en composables; los componentes reciben datos y emiten eventos.
- **Patrón de base común:** si cinco ventanas repiten lo mismo (foco, Escape, cierre), se extrae una base y cada ventana
  pone solo su contenido.

## 3. Lo que se hizo: el panel de usuarios del admin

Antes: `pages/admin/index.vue`, de **1532 líneas**. Tenía las llamadas a la API, dos tablas, el menú de acciones y cinco
ventanas, cada una con su propia copia de la trampa de foco.

| Ahora | Responsabilidad | Líneas |
|---|---|---|
| `pages/admin/index.vue` | Organiza: pestañas, avisos y qué ventana está abierta (una sola a la vez) | 93 |
| `composables/useGestionUsuarios.ts` | Datos y acciones contra la API; se comparte con `provide`/`inject` | 138 |
| `components/admin/AdminDialogo.vue` | Base de las ventanas: foco inicial y de vuelta, Tab atrapado, Escape, cierre por el fondo solo si el clic empezó ahí | 66 |
| `AdminModalCambioRol`, `AdminModalDecision`, `AdminModalRegistrar`, `AdminModalActivar`, `AdminModalClave` | Una ventana cada uno, con su formulario | 38–125 |
| `AdminTablaUsuarios`, `AdminSolicitudesDocente` | Una pestaña cada uno | 84–126 |
| `utils/adminUsuarios.ts`, `utils/trampaDeFoco.ts` | Reglas puras, con prueba | — |

Resultados:
- Ni la página ni sus componentes llaman a la API.
- Ningún archivo del panel pasa de 300 líneas.
- `nuxi typecheck` da **0 errores** en todo el frontend. Al correrlo encontró, de paso, un error de tipos de la ayuda
  escalonada, que se corrigió.
- Se quitaron los emojis de las ventanas (➕ ✓ ✕ ⏸ ▶) y los glifos del tablero.

Lo comprueba `src/content-rendering/__tests__/admin-dividido.frontend.spec.ts`.

## 3 bis. Lo que se dividió después (05/10)

| Pantalla | Antes | Ahora |
|---|---|---|
| Mensajes (estudiante y docente) | Dos páginas casi iguales, de 413 y 453 líneas, que llamaban a la API | `composables/useMensajes.ts` + `components/mensajes/BandejaMensajes.vue` y `VentanaRedactar.vue`; cada página unas 70–100 líneas |
| `pages/docente/contenidos.vue` | 1131 líneas, cuatro ventanas y sus llamadas a la API | 389 líneas: el árbol. `composables/useContenidosCurso.ts`, `utils/contenidosCurso.ts` (reglas con prueba) y una ventana por componente en `components/docente/contenidos/` |
| `pages/docente/index.vue` (inicio del docente) | 826 líneas con «Crear clase» y el QR dentro; el QR no era un diálogo para el lector de pantalla | 408 líneas. `composables/useClasesDocente.ts`, `components/docente/VentanaCrearClase.vue` y `VentanaQrClase.vue` |

Las ventanas nuevas usan la misma base que las del admin (`AdminDialogo`): foco inicial, Tab atrapado, Escape y foco de
vuelta. Lo comprueban `mensajes.frontend.spec.ts` y `contenidos-dividido.frontend.spec.ts`, y una prueba en el
navegador abrió y cerró cada ventana sin errores.

## 4. Lo que queda, con criterio

| Archivo | Líneas | ¿Dividir? |
|---|---|---|
| `components/proyectos/EditorDiagrama.vue` | 1322 | **Con cuidado:** el lienzo y su estado van juntos. Se puede extraer el panel de propiedades y la barra de herramientas, no el lienzo. |
| `components/docente/UnitExercisesPanel.vue`, `pages/docente/index.vue` | 852, 827 | Sí, por secciones, después de contenidos. |
| Los demás de 300 a 650 líneas | — | Revisar uno por uno con el criterio de arriba. |

**PAT-01:** 26 de 45 páginas todavía usan `useApi()` desde la vista (eran 28 el 05/10 por la mañana y 32 de 44 antes). El patrón ya está probado en el panel del admin, Mensajes, Contenidos, Notas y Crear ejercicio; también se dividieron dos componentes grandes: los ejercicios de una lección (852 → 162 líneas, `useEjerciciosUnidad`) y el editor de diagramas (1322 → 791, geometría en `utils/geometriaDiagrama.ts`). Se sigue página por página, empezando por las más grandes que quedan (`auth/register`, `estudiante/unidad/[id]`, `docente/clase/[classId]/asistencia`).

Hecho así, sin prisa y con pruebas, no cambia lo que ve el usuario ni arriesga la prueba del equipo.

## Referencias

- Brown, W. J., Malveau, R. C., McCormick, H. W. y Mowbray, T. J. (1998). *AntiPatterns: Refactoring Software, Architectures, and Projects in Crisis*. Wiley (citado en Pressman y Maxim, 2019, cap. 14).
- Nuxt, «Data Fetching» (documentación oficial, v4) y guías de arquitectura de Nuxt 3. Guías de producto, no evidencia científica.
- Pressman, R. S. y Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9.ª ed.). McGraw-Hill.
