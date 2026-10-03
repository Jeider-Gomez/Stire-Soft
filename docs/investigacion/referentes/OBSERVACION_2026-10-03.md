# Observación del 03/10/2026: qué se midió y cómo

Las afirmaciones marcadas **[obs]** en esta carpeta salen de aquí.

## Cómo se midió

- **Herramienta:** Chrome sin interfaz controlado con Puppeteer, desde el computador del equipo.
- **Pantallas:** dos tamaños.
  - Computador: 1440×900 para los referentes y 1366×657 (portátil) para STIRE.
  - Celular: 390×844.
- **Datos por página, arriba y después de bajar 1200 a 1500 px:**
  - posición y estilo calculado (`position`, `top`, alto, fondo, `backdrop-filter`) de los elementos `header`,
    `aside` y de los que son `fixed` o `sticky`;
  - si el botón del Tutor seguía en pantalla;
  - una captura.
- **Capturas de terceros:** no se suben al repositorio, que es público. Las de STIRE están en el registro de la
  sesión.
- **Límites:**
  - Solo páginas públicas, sin iniciar sesión. La experiencia de clase de Platzi y el editor ejecutable de
    LeetCode piden cuenta.
  - La página de curso de Platzi no cargó en 60 s; lo de Platzi viene de su documentación y de la descripción del
    dueño del proyecto, que es usuario.

## Referentes

| Página | Encabezado | Panel lateral | Asistente de IA |
|---|---|---|---|
| Coursera, curso (`/learn/python`), computador | `sticky`, 105 px; al bajar sube 40 px y deja la fila del buscador | *Coach* `fixed` a la derecha, 416 px; alto 795 → 900 al bajar | Destello en el encabezado; se abre solo con 3 preguntas sugeridas y aviso de privacidad |
| Coursera, curso, celular | `sticky`, 65 px; no se mueve al bajar | — | — |
| Coursera, inicio | igual que el curso | — | — |
| Platzi, inicio, computador y celular | `static`, 80 / 60 px, oscuro; se va al bajar | — | — |
| Platzi, curso | no cargó (60 s) | — | — |
| LeetCode, problema (`two-sum`), computador | barra de 48 px con «Run» y «Submit» al centro | enunciado / editor / casos de prueba en paneles | Destello al lado de «Submit» |
| LeetCode, problema, celular | logo y menú; pestañas *Description*, *Solutions* y *Submissions* | una columna | — |

## STIRE antes de los cambios

Cuenta de prueba de estudiante, en producción.

| Pantalla | Encabezado al bajar | Barra lateral al bajar | Tutor al bajar |
|---|---|---|---|
| Inicio, lección y progreso (computador) | fijo, blanco al 95 % | **se va** (sube 787 a 1136 px) | visible en el encabezado |
| Ejercicio (computador) | la pantalla no se desplaza | — | visible |
| Inicio, lección y progreso (celular) | fijo | cajón | ícono sin nombre en el encabezado |
| Ejercicio (celular) | **se va** (−267 px) | — | **desaparece**, junto con «Probar» y «Entregar» |

## STIRE después de los cambios

Commits `f785dd7` y `455cb12`.

| Pantalla | Encabezado | Barra lateral al bajar | Tutor |
|---|---|---|---|
| Inicio, lección y progreso (computador) | fijo, blanco al 80 % con desenfoque | **se queda** (top 64 px); al llegar al pie de página sube lo que mide el pie | en el encabezado |
| Ejercicio (celular) | **fijo**, 90 % con desenfoque; «Probar» y «Entregar» a la vista | — | **lanzador «Tutor» abajo a la derecha**, visible arriba y abajo |
| Inicio, lección y progreso (celular) | fijo | cajón | lanzador «Tutor» abajo a la derecha |
