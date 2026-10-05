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

## 4. Lo que queda, con criterio

| Archivo | Líneas | ¿Dividir? |
|---|---|---|
| `components/proyectos/EditorDiagrama.vue` | 1322 | **Con cuidado:** el lienzo y su estado van juntos. Se puede extraer el panel de propiedades y la barra de herramientas, no el lienzo. |
| `pages/docente/contenidos.vue` | 1131 | **Sí:** mezcla el árbol del curso, la edición de temas y lecciones y las publicaciones. Mismo patrón que el admin (composable `useContenidosCurso` y componentes por sección). |
| `components/docente/UnitExercisesPanel.vue`, `pages/docente/index.vue` | 852, 827 | Sí, por secciones, después de contenidos. |
| Los demás de 300 a 650 líneas | — | Revisar uno por uno con el criterio de arriba. |

**PAT-01:** 32 de 44 páginas todavía llaman a la API desde la vista. El panel de usuarios ya no lo hace, pero se agregaron 3 páginas (la encuesta del estudiante y la del docente, que no la llaman, y los resultados del admin, que sí). El patrón ya está probado en el panel del
admin. Se aplica página por página, empezando por las que comparten lógica, como las dos de Mensajes, casi iguales entre
estudiante y docente.

Hecho así, sin prisa y con pruebas, no cambia lo que ve el usuario ni arriesga la prueba del equipo.

## Referencias

- Brown, W. J., Malveau, R. C., McCormick, H. W. y Mowbray, T. J. (1998). *AntiPatterns: Refactoring Software, Architectures, and Projects in Crisis*. Wiley (citado en Pressman y Maxim, 2019, cap. 14).
- Nuxt, «Data Fetching» (documentación oficial, v4) y guías de arquitectura de Nuxt 3. Guías de producto, no evidencia científica.
- Pressman, R. S. y Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9.ª ed.). McGraw-Hill.
