---
estado:     vigente
verificado: 2026-09-04 contra commit HEAD (FASE CC-07)
fuente:     normativo (insumo para sustentación oral)
codigos:    no aplica (pitch, no ventanas)
---

# Pitch — Bitácora N.º 3 (31 ago – 4 sep 2026)

**Regla de este documento:** ninguna afirmación sin un commit o un archivo real detrás. Si algo
solo está documentado y no implementado, se dice así en el guion, no se disimula.

---

## Guion de 60 segundos

> **[0:00–0:15] Qué encontramos**
> Al abrir esta semana la matriz de bibliografía del proyecto, verificamos DOI por DOI las 15
> referencias que ya estaban citadas — y las 15 resultaron fabricadas. Once no existían. Cuatro
> resolvían a un artículo completamente distinto del que decíamos citar. No era un error de
> formato: era literatura que nadie había verificado nunca.
>
> **[0:15–0:35] Qué hicimos**
> No lo escondimos ni lo reemplazamos en silencio. Documentamos el hallazgo completo — qué DOI
> fallaba y por qué — y reconstruimos la bibliografía desde cero, verificando cada obra nueva
> contra Crossref, ERIC o el catálogo del editor antes de aceptarla. Hoy tenemos 15 de 15
> verificadas, más 24 obras adicionales que sí sostienen las decisiones reales del proyecto —
> mastery learning, repetición espaciada, el *assistance dilemma* en tutoría inteligente. Aplicamos
> el mismo estándar hacia adentro: reescribimos la matriz de permisos del backend contra el código
> real, no contra lo que decía la documentación — y encontramos 4 rutas sin control de rol que
> nadie había señalado antes.
>
> **[0:35–0:55] Qué se puede ver funcionando hoy**
> El sistema MODESEC completo para las 16 ventanas del estudiante, docente y administrador, con
> matriz de permisos corregida contra el código. Un sistema visual completo en Figma — variables de
> color verificadas con contraste real WCAG AA, no declarado — con las 7 vistas del estudiante
> dibujadas en sus 4 estados, y un prototipo navegable: entra por el login, resuelve un ejercicio,
> pide una pista al tutor sin perder su código, y llega a cualquier contenido formativo en máximo 3
> clics. Lo que no está — el frontend en Nuxt — lo decimos con esa misma franqueza: no ha empezado,
> y la razón está en la bitácora.
>
> **[0:55–1:00] Cierre**
> El proceso es el resultado. Una auditoría que encuentra su propia bibliografía fabricada y la
> reconstruye verificando fuente por fuente es algo que casi ningún trabajo académico se atreve a
> mostrar. Nosotros lo mostramos completo.

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
- Fundaciones de diseño: 6 colecciones de variables (Color, Tipo, Espacio, Radio, Borde, Icono),
  contraste WCAG 2.1 AA medido y corregido donde fallaba — no declarado sin más.
- 7 vistas del estudiante × 4 estados (por defecto, vacío, error, completado) = 28 pantallas reales.
- Backend: 39 suites / 272 tests pasando de forma estable.

### Qué NO está (dicho sin maquillar)
- Frontend Nuxt/Vue: **no iniciado.** El experimental en Next.js/React sigue congelado por decisión
  ya tomada en Bitácora N.º 2 — no se retomó ni se extendió esta semana.
- Tutor IA con proveedor LLM real: **no verificable desde el repositorio** — la arquitectura soporta
  OpenAI y Gemini con fallback a mock, pero confirmar cuál está activo en producción requiere una
  prueba fuera de este repositorio.
- Vistas de Docente y Administrador en Figma: explícitamente fuera de esta semana (CC-08).
