<template>
  <div>
    <!-- Backdrop oscuro tenue (cierre con clic fuera) -->
    <Transition name="fade">
      <div
        v-if="tutorStore.isOpen"
        @click="tutorStore.closeDrawer()"
        class="fixed inset-0 bg-base-texto-primario/30 backdrop-blur-[1px] z-40 transition-opacity"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Drawer Lateral 400px (§18.3 — role dialog, aria-modal, trampa de foco) -->
    <Transition name="slide-right">
      <div
        v-if="tutorStore.isOpen"
        ref="drawerRef"
        role="dialog"
        aria-modal="true"
        aria-label="Tutor IA"
        tabindex="-1"
        class="fixed top-0 right-0 h-full w-full max-w-drawer bg-base-blanco border-l border-base-borde-sutil shadow-2xl z-50 flex flex-col justify-between focus:outline-none"
        @keydown="handleKeydown"
      >
        <!-- Header del Tutor IA -->
        <div class="p-4 border-b border-base-borde-sutil flex items-center justify-between bg-base-bg-secundario">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-acento-ambar-fuerte text-base-blanco flex items-center justify-center font-bold text-sm shadow-sm" aria-hidden="true">
              ✨
            </div>
            <div>
              <h3 class="font-bold text-sm text-base-texto-primario">Tutor Socrático Adaptativo</h3>
              <p class="text-[11px] text-base-texto-secundario">Andamiaje progresivo sin soluciones directas</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Enlace discreto "Mi clave" (§19.2 — solo cuando ya tiene clave) -->
            <button
              v-if="tutorStore.hasKey"
              @click="tutorStore.showKeyPanel = !tutorStore.showKeyPanel"
              class="text-[10px] text-base-texto-secundario hover:text-acento-ambar-fuerte underline transition-colors"
              :aria-label="tutorStore.showKeyPanel ? 'Ocultar panel de clave' : 'Gestionar mi clave de Google AI Studio'"
            >
              Mi clave
            </button>

            <button
              ref="closeButtonRef"
              @click="tutorStore.closeDrawer()"
              class="p-1.5 rounded-md hover:bg-base-borde-sutil text-base-texto-secundario hover:text-base-texto-primario transition-colors"
              aria-label="Cerrar Tutor"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>

        <!-- Indicador de Nivel de Guía real del backend (§18.4) — oculto si guidanceLevel es null -->
        <div
          v-if="tutorStore.guidanceLevel !== null"
          class="px-4 py-2 bg-acento-ambar/10 border-b border-acento-ambar/20 flex items-center justify-between text-xs"
          role="status"
          :aria-label="`Nivel de ayuda actual: ${tutorStore.guidanceLevel} de 3 — ${guidanceLevelLabel}`"
        >
          <span class="text-acento-ambar-fuerte font-medium">Nivel de Guía:</span>
          <div class="flex items-center gap-1" aria-hidden="true">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.guidanceLevel === 1 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'"
            >1. Pista</span>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.guidanceLevel === 2 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'"
            >2. Pregunta</span>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.guidanceLevel === 3 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'"
            >3. Falla</span>
          </div>
        </div>

        <!-- Indicador de Contexto Activo de Aprendizaje -->
        <div v-if="activeContextLabel" class="px-4 py-1.5 bg-base-bg-secundario border-b border-base-borde-sutil flex items-center justify-between text-[11px] text-base-texto-secundario">
          <div class="flex items-center gap-1.5 truncate">
            <span aria-hidden="true">📍</span>
            <span class="truncate font-medium text-base-texto-primario">{{ activeContextLabel }}</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Botón Ir al contenido de la unidad (§22 T1 — visible con clave y sin clave) -->
            <button
              v-if="tutorStore.tutorEnabled && tutorStore.contentLink"
              @click="navigateWithAutosaveCheck(`/estudiante/unidad/${tutorStore.contentLink.learningUnitId}`)"
              class="borde-afordancia px-2 py-0.5 rounded bg-base-blanco text-[10px] font-medium text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1 border border-acento-ambar/30"
              :aria-label="`Ir al contenido de la unidad: ${tutorStore.contentLink.title}`"
            >
              <span aria-hidden="true">📖</span> Ver unidad
            </button>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-semantico-pasa/15 text-semantico-pasa font-semibold">
              Contexto en vivo
            </span>
          </div>
        </div>

        <!-- Aviso de repasos vencidos (§22 T1 — fuera del v-else, visible con clave y sin clave) -->
        <div
          v-if="tutorStore.tutorEnabled && overdueNotice"
          class="mx-4 mt-3 p-3 rounded-lg bg-acento-ambar/10 border border-acento-ambar/30 text-xs text-base-texto-primario flex items-center justify-between gap-2 shadow-xs shrink-0"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-start gap-2">
            <span class="text-base leading-none" aria-hidden="true">⏰</span>
            <p class="text-[11px] leading-relaxed">
              {{ overdueNotice }}
            </p>
          </div>
          <button
            @click="navigateWithAutosaveCheck('/estudiante/repasos')"
            class="px-2.5 py-1 rounded bg-acento-ambar-fuerte text-base-blanco font-bold text-[11px] hover:bg-acento-ambar transition-colors shrink-0 shadow-xs"
            aria-label="Ir a mis repasos pendientes"
          >
            Ir a mis repasos
          </button>
        </div>

        <!-- Panel de clave de API (§19.2) -->
        <div v-if="tutorStore.showKeyPanel" class="flex-1 overflow-y-auto">
          <TutorKeyPanel ref="keyPanelRef" />
        </div>

        <!-- Chat normal (cuando no se muestra el panel de clave) -->
        <template v-else>
          <!-- Aviso: Tutor desactivado por docente (§20.3) -->
          <div
            v-if="!tutorStore.tutorEnabled"
            class="mx-4 mt-4 p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs text-base-texto-secundario"
            role="status"
          >
            <span aria-hidden="true">🚫</span>
            Tu docente desactivó el Tutor en esta parte del curso.
          </div>

          <!-- Mensajes del Chat (§18.2 — scroll automático) -->
          <div
            class="flex-1 overflow-y-auto p-4 space-y-3.5"
            ref="messagesContainer"
            aria-live="polite"
            aria-label="Mensajes del Tutor"
          >
            <div
              v-for="msg in tutorStore.messages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.sender === 'student' ? 'items-end' : 'items-start'"
            >
              <!-- Burbuja de mensaje -->
              <div
                class="max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm"
                :class="msg.isError
                  ? 'bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-bl-none'
                  : msg.sender === 'student'
                    ? 'bg-acento-ambar text-base-blanco rounded-br-none'
                    : 'bg-base-bg-secundario border border-base-borde-sutil text-base-texto-primario rounded-bl-none'"
                :role="msg.isError ? 'alert' : undefined"
              >
                <div class="prose prose-xs" v-html="formatTutorMessage(msg.text)"></div>
              </div>

              <!-- Timestamp -->
              <span class="text-[10px] text-base-texto-secundario mt-1 px-1">
                {{ msg.sender === 'student' ? 'Tú' : 'Tutor IA' }} • {{ msg.timestamp }}
              </span>

              <!-- Botón Reintentar (§18.1 — solo en errores que no sean 403) -->
              <button
                v-if="msg.isError && !msg.is403"
                @click="tutorStore.retryLastMessage()"
                :disabled="tutorStore.isThinking"
                class="borde-afordancia mt-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 transition-colors disabled:opacity-50"
              >
                🔄 Reintentar
              </button>

              <!-- Sugerencia de ejercicio del banco -->
              <button
                v-if="msg.suggestedActivity"
                @click="tutorStore.goToSuggestedActivity(msg.suggestedActivity)"
                class="borde-afordancia mt-1.5 max-w-[85%] text-left px-3 py-2 rounded-lg bg-acento-ambar/10 border border-acento-ambar/30 hover:bg-acento-ambar/20 transition-colors"
              >
                <span class="block text-[10px] font-semibold text-acento-ambar-fuerte uppercase tracking-wide" aria-hidden="true">🎯 Practica esto</span>
                <span class="block text-xs font-medium text-base-texto-primario mt-0.5">{{ msg.suggestedActivity.activityTitle }}</span>
                <span class="block text-[11px] text-base-texto-secundario mt-0.5">{{ msg.suggestedActivity.learningUnitTitle }}</span>
              </button>
            </div>

            <!-- Indicador de pensamiento IA (§18.6 — texto escalado) -->
            <div v-if="tutorStore.isThinking" class="flex items-center gap-2 text-xs text-base-texto-secundario p-2" role="status">
              <span class="animate-spin text-acento-ambar" aria-hidden="true">⚙️</span>
              <span>{{ thinkingText }}</span>
            </div>
          </div>

          <!-- Atajos y campo de pregunta -->
          <div class="p-3 border-t border-base-borde-sutil bg-base-bg-secundario/50 space-y-2">
            <!-- Atajos de texto (§18.4 — ya no cambian el nivel) -->
            <p class="text-[11px] font-semibold text-base-texto-secundario">Atajos:</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                @click="tutorStore.requestQuickHint('conceptual')"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="borde-afordancia px-2.5 py-1 rounded bg-base-blanco text-[11px] font-medium text-base-texto-primario hover:text-acento-ambar-fuerte disabled:opacity-40"
                aria-label="Pedir pista conceptual al Tutor"
              >
                <span aria-hidden="true">💡</span> Pista conceptual
              </button>
              <button
                @click="tutorStore.requestQuickHint('borde')"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="borde-afordancia px-2.5 py-1 rounded bg-base-blanco text-[11px] font-medium text-base-texto-primario hover:text-acento-ambar-fuerte disabled:opacity-40"
                aria-label="Preguntar sobre casos de borde"
              >
                <span aria-hidden="true">🧭</span> Revisar caso borde
              </button>
              <button
                @click="tutorStore.requestQuickHint('parada')"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="borde-afordancia px-2.5 py-1 rounded bg-base-blanco text-[11px] font-medium text-base-texto-primario hover:text-acento-ambar-fuerte disabled:opacity-40"
                aria-label="Preguntar sobre condición de parada"
              >
                <span aria-hidden="true">🔍</span> Ubicar condición de parada
              </button>

              <!-- Botón Ir al contenido eliminado de aquí (§22 T1 — movido al bloque de contexto) -->
            </div>

            <!-- Input de Pregunta Libre (§18.6 — font-size ≥16px para evitar zoom iOS) -->
            <div class="flex items-center gap-2 pt-1">
              <input
                ref="inputRef"
                v-model="inputQuery"
                @keydown.enter="handleSend"
                type="text"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                placeholder="Haz una pregunta sobre tu lógica..."
                aria-label="Pregunta al Tutor IA"
                style="font-size: 16px;"
                class="flex-1 px-3 py-2.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-50" />
              <button
                @click="handleSend"
                :disabled="!inputQuery.trim() || tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="px-3 py-2.5 min-h-[44px] rounded-md bg-acento-ambar-fuerte text-base-blanco font-semibold text-xs disabled:opacity-50 hover:bg-acento-ambar transition-colors"
                aria-label="Enviar pregunta"
              >
                Enviar
              </button>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTutorStore } from '~/stores/tutor'
import { useWorkspaceStore } from '~/stores/workspace'
import { useStudentStore } from '~/stores/student'
import { formatTutorMessage } from '~/utils/formatTutorMessage'

const tutorStore = useTutorStore()
const workspaceStore = useWorkspaceStore()
const studentStore = useStudentStore()

const inputQuery = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const drawerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const keyPanelRef = ref<HTMLElement | null>(null)

// ─── Contexto de aprendizaje activo ─────────────────────────────────────────
const activeContextLabel = computed(() => {
  if (workspaceStore.currentExercise?.title && workspaceStore.currentExercise?.activityId) {
    const unitPrefix = workspaceStore.currentExercise.unitTitle
      ? `${workspaceStore.currentExercise.unitTitle} • `
      : ''
    return `${unitPrefix}${workspaceStore.currentExercise.title}`
  }
  if (studentStore.activeUnit?.title) {
    return `Unidad activa: ${studentStore.activeUnit.title}`
  }
  return null
})

// ─── Aviso de repasos vencidos (§21.2 T4c) ──────────────────────────────────
const overdueNotice = computed(() => {
  const reviews = tutorStore.dueReviews
  if (!reviews || reviews.overdueCount <= 0) return null

  const countText = reviews.overdueCount === 1
    ? 'Tienes 1 repaso vencido.'
    : `Tienes ${reviews.overdueCount} repasos vencidos.`

  let oldestText = ''
  if (reviews.oldest) {
    const days = reviews.oldest.daysOverdue
    const timeText = days === 0 ? 'toca hoy' : `hace ${days} ${days === 1 ? 'día' : 'días'}`
    if (reviews.oldest.learningUnitTitle) {
      oldestText = ` El más atrasado: «${reviews.oldest.learningUnitTitle}» (${timeText}).`
    } else {
      oldestText = ` El más atrasado: ${timeText}.`
    }
  }

  return `${countText}${oldestText}`
})

// ─── Navegación segura con verificación de autoguardado (§21.2 T4c) ─────────
function navigateWithAutosaveCheck(url: string) {
  if (workspaceStore.currentExercise?.activityId) {
    if (workspaceStore.hasUnsavedChanges) {
      const ok = confirm('Tienes cambios en el código que podrían no haberse sincronizado aún. ¿Deseas salir de todas formas?')
      if (!ok) return
    }
  }
  tutorStore.closeDrawer()
  navigateTo(url)
}

// ─── Texto del indicador de pensamiento escalado (§18.6) ────────────────────
const thinkingText = computed(() => {
  const s = tutorStore.thinkingSeconds
  if (s >= 20) return 'Está tardando más de lo normal. Puedes seguir esperando.'
  if (s >= 8) return 'Sigo trabajando en tu respuesta…'
  return 'El tutor está analizando tu contexto de código...'
})

// ─── Texto accesible del nivel de guía ──────────────────────────────────────
const guidanceLevelLabel = computed(() => {
  const labels: Record<number, string> = {
    1: 'pista conceptual',
    2: 'pregunta guía',
    3: 'localizar la falla'
  }
  return labels[tutorStore.guidanceLevel ?? 0] || ''
})

// ─── Scroll automático (§18.2) ───────────────────────────────────────────────
watch(
  () => [tutorStore.messages.length, tutorStore.isThinking],
  () => scrollToBottom()
)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// ─── Foco al abrir / devolver foco al cerrar (§18.3 + §22 T2) ───────────────
// El openerElement se guarda ANTES de nextTick: en ese instante
// document.activeElement todavía es el botón que disparó la apertura.
let openerElement: HTMLElement | null = null

// El foco debe quedar SIEMPRE dentro del panel. Al abrir, el estado de la clave aún no llegó: se
// enfoca el campo del chat, y cuando llega (sin clave) ese campo se desmonta y el foco caería al
// <body>. Por eso se vuelve a llamar cuando cambia showKeyPanel.
function focusInsideDrawer() {
  nextTick(() => {
    const drawer = drawerRef.value
    if (!drawer) return
    if (drawer.contains(document.activeElement) && document.activeElement !== drawer) return
    const target = tutorStore.showKeyPanel
      ? (drawer.querySelector('#tutor-api-key') as HTMLElement | null)
      : inputRef.value
    ;(target ?? closeButtonRef.value ?? drawer).focus()
  })
}

watch(
  () => tutorStore.isOpen,
  (open) => {
    if (open) {
      openerElement = document.activeElement as HTMLElement | null
      focusInsideDrawer()
    } else {
      nextTick(() => openerElement?.focus())
    }
  }
)

watch(
  () => tutorStore.showKeyPanel,
  () => {
    if (tutorStore.isOpen) focusInsideDrawer()
  }
)

// ─── Escape cierra el drawer (§18.3) ─────────────────────────────────────────
// Va en el documento y no en el panel: si el foco cae fuera del panel, un @keydown del panel
// nunca recibiría la tecla y Escape parecería no hacer nada.
function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && tutorStore.isOpen) {
    tutorStore.closeDrawer()
  }
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleDocumentKeydown))

// Trampa de foco dentro del panel (Tab / Shift+Tab)
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

function trapFocus(event: KeyboardEvent) {
  if (!drawerRef.value) return
  const focusable = Array.from(
    drawerRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.closest('[aria-hidden="true"]'))

  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// ─── Enviar mensaje ──────────────────────────────────────────────────────────
function handleSend() {
  if (!inputQuery.value.trim() || tutorStore.isThinking) return
  const text = inputQuery.value
  inputQuery.value = ''
  tutorStore.sendMessage(text)
}
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease-out;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
