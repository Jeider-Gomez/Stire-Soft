---
estado:     vigente
fuente:     normativo (índice)
---

# Insumos técnicos y funcionales de STIRE (00–14)

Los 15 documentos de esta carpeta son las **especificaciones de trabajo** que alimentan el diseño
MODESEC y la implementación: qué hace el sistema, con qué datos, con qué permisos y con qué
pantallas. No son los formatos oficiales de MODESEC (esos viven en `../contenidos/`, `../guiones/`,
`../ventanas/` y en el consolidado [`../FASE_II_DISENO_MULTIMEDIAL.md`](../FASE_II_DISENO_MULTIMEDIAL.md)) —
son la base sobre la que esos formatos se construyeron y se verifican.

> **Por qué están en una subcarpeta:** hasta el 2026-09-19 estos archivos vivían sueltos en la raíz de
> `docs/modesec/` y su numeración (`00_`, `01_`) chocaba con la de `00_QUE_ES_MODESEC.md` y
> `01_GAP_Y_PLAN.md`. Agruparlos elimina la ambigüedad sin cambiar sus nombres ni su numeración:
> "Insumo 12" sigue siendo `12_CONTRATO_FRONTEND_BACKEND.md`, como lo citan los planes y los informes.

| # | Documento | Qué responde |
|---|---|---|
| 00 | [`00_MAPA_FUNCIONAL_STIRE.md`](00_MAPA_FUNCIONAL_STIRE.md) | Mapa funcional del sistema: pilares, actores y ciclo conceptual. |
| 01 | [`01_MODELO_ENTIDAD_RELACION.md`](01_MODELO_ENTIDAD_RELACION.md) | Modelo entidad-relación y catálogo de datos. |
| 02 | [`02_CATALOGO_ENDPOINTS.md`](02_CATALOGO_ENDPOINTS.md) | Catálogo maestro de endpoints de la API (rutas, métodos, parámetros). |
| 03 | [`03_MATRIZ_FUNCIONALIDADES.md`](03_MATRIZ_FUNCIONALIDADES.md) | Qué puede hacer cada rol. |
| 04 | [`04_MATRIZ_PERMISOS.md`](04_MATRIZ_PERMISOS.md) | Permisos y control de acceso (RBAC + BOLA). |
| 05 | [`05_FLUJOS_USUARIO.md`](05_FLUJOS_USUARIO.md) | Flujos principales de usuario (user journeys). |
| 06 | [`06_ARQUITECTURA_VENTANAS.md`](06_ARQUITECTURA_VENTANAS.md) | Arquitectura funcional de ventanas MODESEC. |
| 07 | [`07_REPETICION_ESPACIADA.md`](07_REPETICION_ESPACIADA.md) | Mecanismo y visualización de la repetición espaciada (SM-2). |
| 08 | [`08_TUTOR_IA.md`](08_TUTOR_IA.md) | Especificación y diseño seguro del Tutor IA. |
| 09 | [`09_MAPA_NAVEGACION.md`](09_MAPA_NAVEGACION.md) | Mapa de navegación completo y sitemap de Nuxt (derivado de `../contenidos/3.3.3_MAPA_NAVEGACION.md`). |
| 10 | [`10_REFERENTES_UX_EDTECH.md`](10_REFERENTES_UX_EDTECH.md) | Comparativo con referentes EdTech. |
| 11 | [`11_COMPONENTES_REUTILIZABLES.md`](11_COMPONENTES_REUTILIZABLES.md) | Catálogo de componentes Vue 3 reutilizables. |
| 12 | [`12_CONTRATO_FRONTEND_BACKEND.md`](12_CONTRATO_FRONTEND_BACKEND.md) | Contrato técnico entre frontend y backend. |
| 13 | [`13_BACKLOG_FUNCIONAL.md`](13_BACKLOG_FUNCIONAL.md) | Backlog funcional y priorización. |
| 14 | [`14_GUIA_DE_TRABAJO_FRONTEND.md`](14_GUIA_DE_TRABAJO_FRONTEND.md) | Guía maestra de implementación del frontend (Vue 3 + Nuxt 3). |

> El "Insumo 15" (plan de implementación para Antigravity) no vive aquí: es un documento operativo que
> cambia seguido, así que está en [`../../antigravity/PLAN_IMPLEMENTACION.md`](../../antigravity/PLAN_IMPLEMENTACION.md).
