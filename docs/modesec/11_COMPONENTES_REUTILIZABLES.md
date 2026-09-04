---
estado:     vigente
verificado: 2026-09-03 contra commit HEAD (FASE CC-04)
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
