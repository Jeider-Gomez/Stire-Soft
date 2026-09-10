---
estado:     hecho
verificado: 2026-09-10 contra commit HEAD (FASE CC-08)
fuente:     normativo (insumo para sustentación oral)
codigos:    no aplica (pitch, no ventanas)
---

# Pitch — Bitácora N.º 3 (31 ago – 4 sep 2026)

**Regla de este documento:** ninguna afirmación sin un commit o un archivo real detrás. Si algo
solo está documentado y no implementado, se dice así en el guion, no se disimula.

---

## Guion de 60 segundos Español

**[HOOK — 0:00–0:12]**

Durante estas dos semanas, nuestro trabajo se enfocó en llevar STIRE de una idea organizada a una propuesta cada vez más preparada para funcionar. Diseñamos, investigamos, revisamos y comenzamos a comprobar cómo se comporta el sistema.

**[PROBLEM — 0:12–0:32]**

Uno de nuestros principales retos fue asegurarnos de que lo que estábamos construyendo realmente tuviera una base sólida. Al revisar las 15 referencias científicas que teníamos, encontramos problemas importantes: algunas no existían y otras no correspondían con los artículos citados. En lugar de mantener información dudosa, revisamos cada fuente y reconstruimos nuestra bibliografía.

También revisamos la organización del sistema y encontramos algunos problemas que debían corregirse antes de continuar.

**[SOLUTION & VALUE PROP — 0:32–0:52]**

Como resultado, logramos verificar 15 artículos científicos y reunir 24 fuentes adicionales. También diseñamos las pantallas y el mapa de navegación de STIRE, desarrollamos el diseño visual en Figma y creamos un prototipo que permite recorrer el sistema, realizar actividades, solicitar ayuda al tutor y acceder al contenido de aprendizaje.

Durante la Semana 4 continuamos con la validación de la navegación, la preparación de contenidos, las pruebas del sistema y la revisión de la parte visual.

**[TECH STACK & CTA — 0:52–1:00]**

Además, dejamos organizados los guiones de nuestros pitches y revisamos el proyecto para identificar nuevos ajustes. Aunque todavía quedan etapas por desarrollar, estas dos semanas nos permitieron construir una base más organizada, comprobar nuestros avances y preparar STIRE para continuar su desarrollo.

## Guion de 60 segundos Inglés

**[HOOK — 0:00–0:12]**

During these two weeks, our work focused on taking STIRE from an organized idea to a project that is becoming ready to work. We designed, researched, reviewed, and started testing how the system works.

**[PROBLEM — 0:12–0:32]**

One of our main challenges was making sure that what we were building had a strong foundation.
When we reviewed the 15 scientific references we had, we found important problems. Some did not exist, and others did not match the articles that were cited.
Instead of keeping unreliable information, we checked every source and rebuilt our bibliography.
We also reviewed the organization of the system and found some problems that needed to be fixed before moving forward.

**[SOLUTION & VALUE PROP — 0:32–0:52]**

As a result, we verified 15 scientific articles and collected 24 additional sources.
We also designed the screens and the navigation map for STIRE, created the visual design in Figma, and developed a prototype that allows users to move through the system, complete activities, ask the tutor for help, and access learning content.

During Week 4, we continued by validating the navigation, preparing the content, testing the system, and reviewing the visual part.

**[TECH STACK & CTA — 0:52–1:00]**

We also organized the scripts for our presentations and reviewed the project to identify new improvements.
There is still work to do, but these two weeks helped us build a stronger foundation, check our progress, and prepare STIRE for its next stage of development.


---

## Estructura de respaldo (para preguntas del jurado)

### Qué encontramos
- 15/15 referencias originales de `MATRIZ_ARTICULOS.md` fabricadas (11 DOI inexistentes, 4
  resolviendo a obra distinta). Ver `docs/investigacion/INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`.
- 4 rutas del backend (`submissions/start`, `submissions/:id/submit`, `submissions/:id/autosave`,
  `tutor/chat`) sin `@Roles` y sin chequeo de rol a nivel de servicio. Ver
  `docs/modesec/13_BACKLOG_FUNCIONAL.md` §6.
- Zona `[B] Menú` de la ventana estándar en el límite exacto de 7±2 (9 elementos con 2 módulos
  expandidos simultáneamente) y una transición de navegación sin documentar. Ambos ya resueltos en
  FASE CC-06 — ver más abajo.

### Qué hicimos
- Reconstrucción bibliográfica verificada obra por obra: 15/15 + 24 adicionales, con registro
  completo de qué se descartó y por qué (`docs/investigacion/MATRIZ_ARTICULOS_AMPLIADA.md`).
- Rediseño del Menú: 6 elementos persistentes fijos (nunca crece con el contenido), navegación a
  unidad específica vía flyout de módulo — resuelve el 7±2 y registra la transición que faltaba
  (`docs/modesec/contenidos/3.3.3_MAPA_NAVEGACION.md`, filas 23-25).
- Matriz de permisos (`docs/modesec/04_MATRIZ_PERMISOS.md`) reescrita desde cero contra el código
  real, no contra lo que decía la documentación anterior.

### Qué se puede ver funcionando hoy
- Prototipo interactivo en Figma: `https://www.figma.com/proto/1MjKiDrjU65ezO3ztO0v4m/STIRE-Soft?node-id=11-2&starting-point-node-id=11-2`
  — 38 conexiones, 0 rotas, borde de afordancia en todo elemento clicable.
- Fundaciones de diseño: 6 colecciones de variables (Color, Tipo, Espacio, Radio, Borde, Icono),
  contraste WCAG 2.1 AA medido y corregido donde fallaba — no declarado sin más.
- 7 vistas del estudiante × 4 estados (por defecto, vacío, error, completado) = 28 pantallas reales,
  más `DOC-V01 · Mis Clases` y `ADM-V02 · Usuarios y Roles` demostrando que las 3 variantes de rol
  del componente Ventana Estándar leen como la misma plataforma.
- Backend: 39 suites / 272 tests pasando de forma estable.

### Qué NO está (dicho sin maquillar)
- Frontend Nuxt/Vue: **no iniciado.** El experimental en Next.js/React sigue congelado por decisión
  ya tomada en Bitácora N.º 2 — no se retomó ni se extendió esta semana.
- Tutor IA con proveedor LLM real: **no verificable desde el repositorio** — la arquitectura soporta
  OpenAI y Gemini con fallback a mock, pero confirmar cuál está activo en producción requiere una
  prueba fuera de este repositorio.
- Las 10 vistas restantes de Docente y Administrador en Figma: solo se demostró una por rol esta
  semana, por decisión explícita de alcance.
