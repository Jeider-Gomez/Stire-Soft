---
estado:     vigente
verificado: 2026-09-04 contra commit HEAD (FASE CC-06)
fuente:     normativo
codigos:    EST-V01..V06 · DOC-V01..V06 · ADM-V01..V03 · COMP-V00
---

# 🧩 Insumo 11 — Catálogo de Componentes Vue 3 Reutilizables

**Proyecto:** STIRE-Soft Frontend (Nuxt 3 + Tailwind/Vanilla CSS + TypeScript)  
**Fecha:** 30 de agosto de 2026  

---

## 1. Componentes de Estructura y Navegación

### `AppSidebar.vue`
* **Propósito:** Menú lateral reactivo que colapsa en móviles (< 768 px).
* **Props:** `role: 'estudiante' | 'docente' | 'admin'`, `currentRoute: string`.
* **Slots:** `#header` (logo del taller), `#footer` (usuario actual y cerrar sesión).
* **Ventanas:** Presente en todas las vistas autenticadas (`EST-*`, `DOC-*`, `ADM-*`).

### `AppHeader.vue`
* **Propósito:** Barra superior invariable con selector de clase/aula, barra de dominio y notificaciones.
* **Props:** `title: string`, `breadcrumbs: Array<{ label: string, to?: string }>`, `user: User`.
* **Ventanas:** Todas las vistas autenticadas.

---

## 2. Componentes Pedagógicos y de Dominio

### `MasteryProgressBar.vue`
* **Propósito:** Barra de dominio visual con cambio de color semántico según el estado cognitivo.
* **Props:** `mastery: number` (0 a 100), `status?: LearningStatus`, `showLabel?: boolean`.
* **Eventos:** `@threshold-reached` (emite cuando supera el 85% de maestría).
* **Ventanas:** `EST-V01`, `EST-V02`, `EST-V06`, `DOC-V04`, `DOC-V05`.

### `SpacedRepetitionCard.vue`
* **Propósito:** Tarjeta de unidad con badge de urgencia SM-2 y botón de acción de repaso.
* **Props:** `unitTitle: string`, `urgency: 'critical' | 'today' | 'upcoming'`, `dueDate: string`.
* **Eventos:** `@start-review`, `@postpone`.
* **Ventanas:** `EST-V01`, `EST-V05`.

### `CodeEditorMonaco.vue`
* **Propósito:** Editor de código integrado con resaltado de sintaxis JavaScript/Pseudocódigo, autocompletado básico y atajos.
* **Props:** `modelValue: string`, `language?: string`, `readOnly?: boolean`.
* **Eventos:** `@update:modelValue`, `@run-code` (`Ctrl+Enter`), `@submit-code`.
* **Ventanas:** `EST-V03`, `DOC-V03`.

### `TestCasesViewer.vue`
* **Propósito:** Panel de pestañas para inspeccionar casos de prueba públicos y el estado de los privados.
* **Props:** `testCases: Array<{ id: number, input: string, expected: string, actual?: string, passed?: boolean, isPrivate: boolean }>`.
* **Ventanas:** `EST-V03`, `DOC-V03`.

### `TutorChatDrawer.vue`
* **Propósito:** Panel modal lateral deslizable para interactuar con el Tutor IA sin abandonar el editor.
* **Props:** `isOpen: boolean`, `currentCodeSnippet?: string`, `studentLevel: string`.
* **Eventos:** `@close`, `@send-message`.
* **Ventanas:** `EST-V01`, `EST-V02`, `EST-V03`, `EST-V04`.

---

## 3. Componentes de Estado de Interfaz (UI States)

### `EmptyState.vue`
* **Props:** `icon: string`, `title: string`, `description: string`, `actionText?: string`.
* **Eventos:** `@action-click`.
* **Uso:** Aulas vacías, sin repasos pendientes, sin entregas aún.

### `LoadingSkeleton.vue`
* **Props:** `type: 'card' | 'table' | 'text' | 'editor'`, `count?: number`.
* **Uso:** Durante llamadas asíncronas de la API.

### `ErrorAlert.vue`
* **Props:** `title: string`, `message: string`, `retryable?: boolean`.
* **Eventos:** `@retry`.

---

## 6. Componentes construidos en Figma (FASE CC-06) — mapeo a nombre Vue

**Archivo Figma:** `STIRE-Soft — Sistema Visual` (fileKey `1MjKiDrjU65ezO3ztO0v4m`). Todos enlazados a
variables (`Color`, `Tipo`, `Espacio`, `Radio`, `Borde`, `Icono`) — cero valores literales.

| Nombre en Figma | Nombre Vue (Pascal Case) | Notas |
|---|---|---|
| `Ventana Estándar` (component set, variante `Rol`) | `VentanaEstandar.vue` | Formato 12. Solo la variante `Rol=Estudiante` está diseñada en CC-06; `Rol=Docente` y `Rol=Administrador` son placeholders reservados para CC-07/CC-08. Zonas A/B/D/E como slots fijos, `[C]` como `<slot name="contenido" />`. |
| `icono/inicio`, `icono/tutor_ia`, `icono/repasos`, `icono/progreso`, `icono/casos_prueba`, `icono/dominio`, `icono/ejercicio`, `icono/unidad_bloqueada`, `icono/probar_codigo`, `icono/entregar`, `icono/pedir_pista`, `icono/cerrar_sesion` | `IconoInicio.vue`, `IconoTutorIa.vue`, `IconoRepasos.vue`, `IconoProgreso.vue`, `IconoCasosPrueba.vue`, `IconoDominio.vue`, `IconoEjercicio.vue`, `IconoUnidadBloqueada.vue`, `IconoProbarCodigo.vue`, `IconoEntregar.vue`, `IconoPedirPista.vue`, `IconoCerrarSesion.vue` | 12 iconos de función (D-01), stroke enlazado a `color/acento/ambar`, tamaño a `icono/tamano/*`. Nombres de FUNCIÓN, no de metáfora. |
| Tarjeta de módulo en `[B] Menú` (fila `menu-item-*`) | `MenuModuloItem.vue` | Prop `estado: 'dominado' \| 'en-progreso' \| 'por-iniciar' \| 'bloqueado'` enlazada a `color/estado-unidad/*`. Al hacer clic abre el flyout de unidades (no navega directo) — ver `contenidos/3.3.3_MAPA_NAVEGACION.md` filas 23-25. |
| Flyout de unidades del Menú (diseñado como patrón, no como frame propio en CC-06) | `MenuModuloFlyout.vue` | Resuelve el hallazgo 7±2 de CC-04: el Menú nunca crece más allá de 6 ítems persistentes. **Pendiente de maquetarse como frame en CC-07/CC-08** — aquí solo queda definido el comportamiento. |
| Tarjeta de repaso urgencia (forma + color + etiqueta) | `RepasoUrgenciaCard.vue` | Prop `urgencia: 'al-dia' \| 'manana' \| 'vencido' \| 'critico'`, enlazada a `color/urgencia-repaso/*`. Reemplaza/extiende `SpacedRepetitionCard.vue` de la sección 2 con los 4 niveles reales en vez de 3. |
| Modal del Tutor IA (`EST-V04`) | `TutorModal.vue` | Overlay sobre la ventana activa, `layoutPositioning: ABSOLUTE` en Figma — en Vue, modal con `<Teleport>` y foco atrapado. Cierra conservando el código (no navega). |
| Botón primario/secundario/terciario (`btn-*`) | `AppButton.vue` | Prop `variant: 'primaria' \| 'secundaria' \| 'terciaria'`. Regla: nunca más de una `primaria` visible por vista — ver §4 de `ventanas/3.3_VENTANA_ESTANDAR.md`. |
| Tarjeta base (`card`) | `AppCard.vue` | Contenedor blanco con borde sutil y radio `radio/md`, usado en todas las vistas para agrupar contenido dentro de `[C]`. |

**No exportado como componente Figma en esta fase** (documentado como patrón, no como frame): flyout
de módulo (ver fila de arriba) y las variantes Docente/Administrador de `VentanaEstandar.vue` —
ambos son trabajo explícito de CC-07/CC-08, no de esta fase.
