<template>
  <div>
    <!-- Backdrop oscuro tenue (cierre con clic fuera) -->
    <Transition name="fade">
      <div
        v-if="tutorStore.isOpen"
        @click="tutorStore.closeDrawer()"
        class="fixed inset-0 bg-base-texto-primario/30 backdrop-blur-[1px] z-40 transition-opacity"></div>
    </Transition>

    <!-- Drawer Lateral 400px -->
    <Transition name="slide-right">
      <div
        v-if="tutorStore.isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-drawer bg-base-blanco border-l border-base-borde-sutil shadow-2xl z-50 flex flex-col justify-between">
        <!-- Header del Tutor IA -->
        <div class="p-4 border-b border-base-borde-sutil flex items-center justify-between bg-base-bg-secundario">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-acento-ambar-fuerte text-base-blanco flex items-center justify-center font-bold text-sm shadow-sm">
              ✨
            </div>
            <div>
              <h3 class="font-bold text-sm text-base-texto-primario">Tutor Socrático Adaptativo</h3>
              <p class="text-[11px] text-base-texto-secundario">Andamiaje progresivo sin soluciones directas</p>
            </div>
          </div>

          <button
            @click="tutorStore.closeDrawer()"
            class="p-1.5 rounded-md hover:bg-base-borde-sutil text-base-texto-secundario hover:text-base-texto-primario transition-colors"
            title="Cerrar Tutor (Esc)">
            ✕
          </button>
        </div>

        <!-- Indicador de Nivel de Andamiaje Activo -->
        <div class="px-4 py-2 bg-acento-ambar/10 border-b border-acento-ambar/20 flex items-center justify-between text-xs">
          <span class="text-acento-ambar-fuerte font-medium">Nivel de Guía:</span>
          <div class="flex items-center gap-1">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.activeScaffoldingLevel === 1 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'">
              1. Pista
            </span>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.activeScaffoldingLevel === 2 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'">
              2. Pregunta
            </span>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold"
              :class="tutorStore.activeScaffoldingLevel === 3 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-blanco text-base-texto-secundario border border-base-borde-sutil'">
              3. Falla
            </span>
          </div>
        </div>

        <!-- Mensajes del Chat -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3.5" ref="messagesContainer">
          <div
            v-for="msg in tutorStore.messages"
            :key="msg.id"
            class="flex flex-col"
            :class="msg.sender === 'student' ? 'items-end' : 'items-start'">
            <div
              class="max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm"
              :class="msg.sender === 'student'
                ? 'bg-acento-ambar text-base-blanco rounded-br-none'
                : 'bg-base-bg-secundario border border-base-borde-sutil text-base-texto-primario rounded-bl-none'">
              <div class="prose prose-xs" v-html="formatMessage(msg.text)"></div>
            </div>
            <span class="text-[10px] text-base-texto-secundario mt-1 px-1">
              {{ msg.sender === 'student' ? 'Tú' : 'Tutor IA' }} • {{ msg.timestamp }}
            </span>
          </div>

          <!-- Indicador de pensamiento IA -->
          <div v-if="tutorStore.isThinking" class="flex items-center gap-2 text-xs text-base-texto-secundario p-2">
            <span class="animate-spin text-acento-ambar">⚙️</span>
            <span>El tutor está analizando tu contexto de código...</span>
          </div>
        </div>

        <!-- Botones de Intención Rápida (Pistas Socráticas) -->
        <div class="p-3 border-t border-base-borde-sutil bg-base-bg-secundario/50 space-y-2">
          <p class="text-[11px] font-semibold text-base-texto-secundario">Solicitudes rápidas de andamiaje:</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="tutorStore.requestQuickHint('conceptual')"
              class="borde-afordancia px-2.5 py-1 rounded bg-base-blanco text-[11px] font-medium text-base-texto-primario hover:text-acento-ambar-fuerte">
              💡 Pista conceptual
            </button>
            <button
              @click="tutorStore.requestQuickHint('borde')"
              class="borde-afordancia px-2.5 py-1 rounded bg-base-blanco text-[11px] font-medium text-base-texto-primario hover:text-acento-ambar-fuerte">
              🧭 Revisar caso borde
            </button>
            <button
              @click="tutorStore.requestQuickHint('parada')"
              class="borde-afordancia px-2.5 py-1 rounded bg-base-blanco text-[11px] font-medium text-base-texto-primario hover:text-acento-ambar-fuerte">
              🔍 Ubicar condición de parada
            </button>
          </div>

          <!-- Input de Pregunta Libre -->
          <div class="flex items-center gap-2 pt-1">
            <input
              v-model="inputQuery"
              @keydown.enter="handleSend"
              type="text"
              placeholder="Haz una pregunta sobre tu lógica..."
              class="flex-1 text-xs px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
            <button
              @click="handleSend"
              :disabled="!inputQuery.trim() || tutorStore.isThinking"
              class="px-3 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-semibold text-xs disabled:opacity-50 hover:bg-acento-ambar transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTutorStore } from '~/stores/tutor'

const tutorStore = useTutorStore()
const inputQuery = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

function handleSend() {
  if (!inputQuery.value.trim()) return
  const text = inputQuery.value
  inputQuery.value = ''
  tutorStore.sendMessage(text)
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatMessage(rawText: string) {
  // Conversión básica de markdown simple a HTML seguro
  return rawText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-base-blanco px-1 py-0.5 rounded text-acento-ambar-fuerte font-codigo text-[11px]">$1</code>')
    .replace(/\n/g, '<br/>')
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
