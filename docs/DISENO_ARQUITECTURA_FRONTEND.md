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

## 4. Estado tras la Fase H (05/10/2026)

| Criterio | Estado medido | Qué significa |
|---|---:|---|
| PAT-01 | 44/45 páginas sin llamadas directas a la API | 25/25 páginas previstas en H.4 migradas a composables. `pages/docente/clase/[classId]/ajustes.vue` sigue pendiente por ser archivo protegido de Antigravity. `pages/docente/contenidos.vue` también quedó sin llamadas tras una excepción autorizada para corregir la prueba trinquete. |
| PAT-04 | 120/142 archivos Vue de `pages/` y `components/` tienen 300 líneas o menos | Los otros 22 superan 300 líneas; cada uno tiene un motivo revisado en `pat04-componentes-grandes.frontend.spec.ts`. Se extrajeron el árbol curricular a `ArbolContenidos.vue` y el aviso de solicitud de rol a `AvisoSolicitudRol.vue`. |

La cifra inicial de 145 archivos Vue no coincide con el inventario actual de `pages/` y `components/`, que suma 142. El criterio sigue siendo separar responsabilidades distintas, no recortar líneas por sí mismas. El trinquete PAT-04 registra tamaños máximos y razones para que una modificación futura no introduzca archivos grandes sin revisión.

PAT-01 no queda en la meta inicial de 2 páginas pendientes: solo resta `pages/docente/clase/[classId]/ajustes.vue`, que no se tocó porque pertenece a Antigravity. No se corrigieron advertencias ni otros defectos encontrados durante las verificaciones.

## 5. Estado al 07/10/2026 (Fase 30 y cierre de PAT-04)

| Criterio | Estado medido | Qué cambió |
|---|---:|---|
| PAT-01 | **0 de 45 páginas** llaman a la API | La Fase 30 llevó Ajustes de la clase a `useAjustesClase`. Quedan componentes que llaman a la API; siguen el mismo camino. |
| PAT-04 | **139 de 159** archivos Vue con 300 líneas o menos; los 20 restantes, con su motivo | Se dividieron los archivos que mezclaban responsabilidades: Ajustes de la clase (604 → 153, una sección por componente en `components/docente/ajustes/`), las tres ventanas de crear contenido (`CurriculumBuilderModals.vue`, 429 → una sola `VentanaCrear.vue` sobre `AdminDialogo`) y el constructor HTML/CSS (645 → 174, con la lógica en `utils/reglasHtmlCss.ts` y su prueba). |
| `any` | 27 (eran 35) | Techo bajado en `sin-any.frontend.spec.ts`. |

Con esto PAT-01 y PAT-04 pasan a **C** en la evaluación de la IA
([`docs/calidad/listas-chequeo/2026-10-06_v2.0.0/`](calidad/listas-chequeo/2026-10-06_v2.0.0/)). Cada división se recorrió en el
navegador contra el backend local antes de subirla.

## Referencias

- Brown, W. J., Malveau, R. C., McCormick, H. W. y Mowbray, T. J. (1998). *AntiPatterns: Refactoring Software, Architectures, and Projects in Crisis*. Wiley (citado en Pressman y Maxim, 2019, cap. 14).
- Nuxt, «Data Fetching» (documentación oficial, v4) y guías de arquitectura de Nuxt 3. Guías de producto, no evidencia científica.
- Pressman, R. S. y Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9.ª ed.). McGraw-Hill.
