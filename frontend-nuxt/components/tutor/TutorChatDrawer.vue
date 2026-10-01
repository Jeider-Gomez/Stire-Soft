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
        <div class="p-4 flex items-center justify-between bg-gradient-to-r from-stire-blue via-[#0e48a8] to-stire-purple text-white select-none">
          <div class="flex items-center gap-3">
            <div class="relative" aria-hidden="true">
              <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Bot :size="24" :stroke-width="2.2" class="text-stire-teal" />
              </div>
              <span v-if="tutorStore.tutorEnabled" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-stire-teal border-2 border-stire-blue rounded-full" />
            </div>
            <div>
              <h3 class="font-bold text-sm font-poppins tracking-tight">Tutor IA STIRE</h3>
              <p class="text-[11px] text-slate-200">Te guía con preguntas y pistas; no te da la solución</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Enlace discreto "Mi clave" (§19.2 — solo cuando ya tiene clave) -->
            <button
              v-if="tutorStore.hasKey"
              @click="tutorStore.showKeyPanel = !tutorStore.showKeyPanel"
              class="text-[10px] text-slate-200 hover:text-white underline transition-colors"
              :aria-label="tutorStore.showKeyPanel ? 'Ocultar panel de clave' : 'Gestionar mi clave de Google AI Studio'"
            >
              Mi clave
            </button>

            <button
              ref="closeButtonRef"
              @click="tutorStore.closeDrawer()"
              class="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar Tutor"
            >
              <X :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Indicador de Nivel de Guía real del backend (§18.4) — oculto si guidanceLevel es null -->
        <div
          v-if="tutorStore.guidanceLevel !== null"
          class="px-4 py-2 bg-stire-teal/10 border-b border-stire-teal/25 flex items-center justify-between text-xs"
          role="status"
          :aria-label="`Nivel de ayuda actual: ${tutorStore.guidanceLevel} de 3 — ${guidanceLevelLabel}`"
        >
          <span class="text-acento-ambar-fuerte font-medium">Ayuda:</span>
          <div class="flex items-center gap-1" aria-hidden="true">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.guidanceLevel === 1 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'"
            >Pista</span>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.guidanceLevel === 2 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'"
            >Pregunta guía</span>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.guidanceLevel === 3 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'"
            >Dónde está el error</span>
          </div>
        </div>
        <!-- En un refuerzo la ayuda empieza un nivel más arriba (docs/DISENO_INTERVENCION_DOCENTE.md §10.4): se le dice
             al estudiante por qué, para que no lo tome como que el Tutor «se rindió». -->
        <p
          v-if="tutorStore.guidanceLevel !== null && tutorStore.refuerzo"
          class="px-4 py-1.5 bg-semantico-info/10 border-b border-semantico-info/20 text-[11px] text-base-texto-primario"
        >
          Ayuda ampliada: este ejercicio es parte de tu refuerzo «{{ tutorStore.refuerzo }}».
        </p>

        <!-- Indicador de Contexto Activo de Aprendizaje -->
        <div v-if="activeContextLabel" class="px-4 py-2 bg-stire-canvas border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div class="flex items-center gap-1.5 truncate">
            <BookOpen :size="14" class="text-stire-teal shrink-0" aria-hidden="true" />
            <span class="truncate font-medium font-poppins text-stire-blue">{{ activeContextLabel }}</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Botón Ir al contenido de la unidad (§22 T1 — visible con clave y sin clave) -->
            <button
              v-if="tutorStore.tutorEnabled && tutorStore.contentLink"
              @click="navigateWithAutosaveCheck(`/estudiante/unidad/${tutorStore.contentLink.learningUnitId}`)"
              class="borde-afordancia px-2 py-0.5 rounded bg-base-blanco text-[10px] font-medium text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1 border border-acento-ambar/30"
              :aria-label="`Ir a la explicación de la lección: ${tutorStore.contentLink.title}`"
            >
              <BookOpen :size="12" aria-hidden="true" /> Ver la lección
            </button>
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
            <Clock :size="16" class="shrink-0 text-stire-blue" aria-hidden="true" />
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
            <Ban :size="14" class="inline -mt-0.5 mr-1" aria-hidden="true" />
            Tu docente desactivó el Tutor en esta parte del curso.
          </div>

          <!-- Mensajes del Chat (§18.2 — scroll automático) -->
          <div
            class="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-stire-canvas/70 to-white"
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
              <!-- Burbuja de mensaje (con el robot al lado cuando habla el Tutor) -->
              <div class="flex items-end gap-1.5 max-w-[88%] mensaje-entrada">
                <span v-if="msg.sender !== 'student'" class="w-6 h-6 mb-1 rounded-lg bg-stire-blue flex items-center justify-center shrink-0" aria-hidden="true">
                  <Bot :size="16" :stroke-width="2.2" class="text-stire-teal" />
                </span>
                <div
                  class="rounded-2xl p-3 text-xs leading-relaxed shadow-sm"
                  :class="msg.isError
                    ? 'bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-bl-none'
                    : msg.sender === 'student'
                      ? 'bg-stire-teal text-[#070e24] font-medium rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'"
                  :role="msg.isError ? 'alert' : undefined"
                >
                  <div class="prose prose-xs" v-html="formatTutorMessage(msg.text)"></div>
                </div>
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
                <RotateCcw :size="12" class="inline -mt-0.5 mr-1" aria-hidden="true" />Reintentar
              </button>

              <!-- Sugerencia de ejercicio del banco -->
              <button
                v-if="msg.suggestedActivity"
                @click="tutorStore.goToSuggestedActivity(msg.suggestedActivity)"
                class="borde-afordancia mt-1.5 max-w-[85%] text-left px-3 py-2 rounded-xl bg-stire-teal/10 border border-stire-teal/40 hover:bg-stire-teal/20 transition-colors"
              >
                <span class="flex items-center gap-1 text-[10px] font-semibold text-stire-blue uppercase tracking-wide"><Target :size="12" aria-hidden="true" /> Practica esto</span>
                <span class="block text-xs font-medium text-base-texto-primario mt-0.5">{{ msg.suggestedActivity.activityTitle }}</span>
                <span class="block text-[11px] text-base-texto-secundario mt-0.5">{{ msg.suggestedActivity.learningUnitTitle }}</span>
              </button>
            </div>

            <!-- Indicador de pensamiento IA (§18.6 — texto escalado) -->
            <div v-if="tutorStore.isThinking" class="flex items-center gap-2 text-xs text-slate-500 py-1" role="status">
              <span class="w-6 h-6 rounded-lg bg-stire-blue flex items-center justify-center shrink-0" aria-hidden="true">
                <Bot :size="14" class="text-stire-teal animate-pulse" />
              </span>
              <span class="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-stire-teal animate-bounce" aria-hidden="true" />
                <span class="w-1.5 h-1.5 rounded-full bg-stire-purple animate-bounce [animation-delay:0.2s]" aria-hidden="true" />
                <span class="w-1.5 h-1.5 rounded-full bg-stire-blue animate-bounce [animation-delay:0.4s]" aria-hidden="true" />
                <span class="text-[11px] text-slate-500 ml-1">{{ thinkingText }}</span>
              </span>
            </div>
          </div>

          <!-- Atajos y campo de pregunta -->
          <div class="p-3 border-t border-slate-200 bg-stire-canvas space-y-2">
            <!-- Atajos de texto (§18.4 — ya no cambian el nivel) -->
            <p class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Lightbulb :size="12" class="text-amber-500" aria-hidden="true" /> Atajos
            </p>
            <div class="flex flex-wrap gap-1.5">
              <button
                @click="tutorStore.requestQuickHint('conceptual')"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:text-stire-blue hover:border-stire-teal/60 hover:bg-stire-teal/10 transition-colors shadow-sm disabled:opacity-40"
                aria-label="Pedir pista conceptual al Tutor"
              >
                <Lightbulb :size="12" class="inline -mt-0.5" aria-hidden="true" /> Pista conceptual
              </button>
              <button
                @click="tutorStore.requestQuickHint('borde')"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:text-stire-blue hover:border-stire-teal/60 hover:bg-stire-teal/10 transition-colors shadow-sm disabled:opacity-40"
                aria-label="Preguntar sobre casos de borde"
              >
                <Compass :size="12" class="inline -mt-0.5" aria-hidden="true" /> Revisar caso borde
              </button>
              <button
                @click="tutorStore.requestQuickHint('parada')"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:text-stire-blue hover:border-stire-teal/60 hover:bg-stire-teal/10 transition-colors shadow-sm disabled:opacity-40"
                aria-label="Preguntar sobre condición de parada"
              >
                <Search :size="12" class="inline -mt-0.5" aria-hidden="true" /> Ubicar condición de parada
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
                class="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-stire-teal focus:ring-2 focus:ring-stire-teal/20 text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:opacity-50" />
              <button
                @click="handleSend"
                :disabled="!inputQuery.trim() || tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="w-11 h-11 rounded-xl bg-stire-teal hover:bg-[#14e2c8] text-[#070e24] flex items-center justify-center shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Enviar pregunta"
              >
                <Send :size="16" aria-hidden="true" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Ban, BookOpen, Bot, Clock, Compass, Lightbulb, RotateCcw, Search, Send, Target, X } from 'lucide-vue-next'
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
    return `Lección actual: ${studentStore.activeUnit.title}`
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
.mensaje-entrada {
  animation: mensaje-entrada 0.25s ease-out both;
}
@keyframes mensaje-entrada {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
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
