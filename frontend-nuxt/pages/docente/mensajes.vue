<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera DOC-V06 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Comunicación Directa • DOC-V06
          </span>
          <span v-if="unreadCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-semantico-falla/15 text-semantico-falla">
            {{ unreadCount }} no leídos
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Bandeja de Mensajería Docente-Estudiante
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Canal institucional de orientación y retroalimentación académica
        </p>
      </div>

      <button
        @click="openNewMessageModal"
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto cursor-pointer flex items-center gap-1.5">
        <span>✉️</span>
        <span>Redactar Mensaje</span>
      </button>
    </header>

    <!-- Pestañas de la Bandeja -->
    <div class="flex items-center gap-2 border-b border-base-borde-sutil pb-1 text-xs">
      <button
        @click="activeTab = 'inbox'"
        class="px-3 py-1.5 rounded-t font-semibold transition-colors flex items-center gap-1.5"
        :class="activeTab === 'inbox'
          ? 'border-b-2 border-acento-ambar-fuerte text-acento-ambar-fuerte font-bold bg-base-blanco'
          : 'text-base-texto-secundario hover:text-base-texto-primario'">
        <span>📥 Recibidos</span>
        <span v-if="inboxMessages.length > 0" class="px-1.5 py-0.2 rounded-full bg-base-bg-secundario text-[10px]">
          {{ inboxMessages.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'sent'"
        class="px-3 py-1.5 rounded-t font-semibold transition-colors flex items-center gap-1.5"
        :class="activeTab === 'sent'
          ? 'border-b-2 border-acento-ambar-fuerte text-acento-ambar-fuerte font-bold bg-base-blanco'
          : 'text-base-texto-secundario hover:text-base-texto-primario'">
        <span>📤 Enviados</span>
        <span v-if="sentMessages.length > 0" class="px-1.5 py-0.2 rounded-full bg-base-bg-secundario text-[10px]">
          {{ sentMessages.length }}
        </span>
      </button>
    </div>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Sincronizando mensajes...
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <span class="text-2xl">⚠</span>
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <button
        @click="fetchMessages"
        class="px-4 py-2 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Reintentar sincronización
      </button>
    </div>

    <!-- ESTADO 3: Vacío -->
    <div
      v-else-if="(activeTab === 'inbox' && inboxMessages.length === 0) || (activeTab === 'sent' && sentMessages.length === 0)"
      class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <span class="text-3xl">{{ activeTab === 'inbox' ? '📭' : '✉️' }}</span>
      <h3 class="font-bold text-base-texto-primario text-sm">
        {{ activeTab === 'inbox' ? 'Tu bandeja de entrada está vacía' : 'No has enviado mensajes aún' }}
      </h3>
      <p class="text-base-texto-secundario max-w-sm mx-auto">
        {{ activeTab === 'inbox'
          ? 'Aquí aparecerán las consultas académicas que envíen tus alumnos.'
          : 'Puedes iniciar una conversación con cualquier estudiante de tus clases.' }}
      </p>
      <button
        v-if="activeTab === 'sent'"
        @click="openNewMessageModal"
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors">
        Enviar primer mensaje
      </button>
    </div>

    <!-- ESTADO 4: Lista de Mensajes -->
    <div v-else class="space-y-3">
      <div
        v-for="msg in (activeTab === 'inbox' ? inboxMessages : sentMessages)"
        :key="msg.id"
        class="p-4 rounded-xl border bg-base-blanco shadow-xs transition-colors space-y-2 hover:border-acento-ambar-fuerte"
        :class="!msg.isRead && activeTab === 'inbox' ? 'border-acento-ambar-fuerte bg-acento-ambar/5' : 'border-base-borde-sutil'">
        <div class="flex items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-base-texto-primario">
              {{ activeTab === 'inbox' ? (msg.sender?.name || 'Estudiante') : (msg.receiver?.name || 'Destinatario') }}
            </span>
            <span class="text-[11px] text-base-texto-secundario font-mono">
              ({{ activeTab === 'inbox' ? msg.sender?.email : msg.receiver?.email }})
            </span>
            <span
              v-if="!msg.isRead && activeTab === 'inbox'"
              class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-semantico-falla/15 text-semantico-falla">
              Nuevo
            </span>
          </div>
          <span class="text-[10px] text-base-texto-secundario">
            {{ new Date(msg.createdAt).toLocaleString() }}
          </span>
        </div>

        <p class="text-xs text-base-texto-primario whitespace-pre-wrap leading-relaxed">
          {{ msg.content }}
        </p>

        <div v-if="activeTab === 'inbox'" class="pt-2 flex justify-end">
          <button
            @click="replyToUser(msg.senderId, msg.sender?.name)"
            class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1">
            <span>↩</span>
            <span>Responder</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Enviar Mensaje -->
    <div
      v-if="isComposeOpen"
      class="fixed inset-0 bg-base-texto-primario/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
          <h3 class="font-bold text-base-texto-primario flex items-center gap-1.5">
            <span>✉️</span>
            <span>Redactar Mensaje Académico</span>
          </h3>
          <button
            @click="isComposeOpen = false"
            class="text-base-texto-secundario hover:text-base-texto-primario text-sm font-bold">
            ✕
          </button>
        </div>

        <form @submit.prevent="sendMessage" class="space-y-3">
          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">
              ID del Estudiante Destinatario *
            </label>
            <input
              v-model.number="composeForm.receiverId"
              type="number"
              required
              placeholder="Ej: 29 (Pedro Estudiante)"
              class="w-full px-3 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
            <p v-if="replyName" class="text-[10px] text-semantico-pasa font-semibold mt-0.5">
              Respondiendo a: {{ replyName }}
            </p>
          </div>

          <div>
            <label class="block font-semibold text-base-texto-primario mb-1">
              Contenido del Mensaje *
            </label>
            <textarea
              v-model="composeForm.content"
              required
              rows="4"
              placeholder="Escribe aquí las orientaciones o retroalimentación..."
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none resize-none"></textarea>
          </div>

          <div v-if="composeError" class="p-2 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded text-[11px]">
            {{ composeError }}
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
            <button
              type="button"
              @click="isComposeOpen = false"
              class="px-3 py-1.5 rounded-md borde-afordancia text-base-texto-primario font-semibold hover:bg-base-bg-secundario">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSending"
              class="px-4 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-1">
              <span v-if="isSending" class="animate-spin">⚙️</span>
              <span>{{ isSending ? 'Enviando...' : 'Enviar Mensaje' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'teacher'
})

interface MessageUser {
  id: number
  name: string
  email: string
}

interface MessageItem {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  createdAt: string
  sender?: MessageUser
  receiver?: MessageUser
}

const api = useApi()

const activeTab = ref<'inbox' | 'sent'>('inbox')
const inboxMessages = ref<MessageItem[]>([])
const sentMessages = ref<MessageItem[]>([])
const unreadCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Modal de redacción
const isComposeOpen = ref(false)
const isSending = ref(false)
const composeError = ref<string | null>(null)
const replyName = ref<string | null>(null)
const composeForm = reactive({
  receiverId: 0,
  content: ''
})

function openNewMessageModal() {
  replyName.value = null
  composeForm.receiverId = 0
  composeForm.content = ''
  composeError.value = null
  isComposeOpen.value = true
}

function replyToUser(senderId: number, name?: string) {
  replyName.value = name || `Usuario #${senderId}`
  composeForm.receiverId = senderId
  composeForm.content = ''
  composeError.value = null
  isComposeOpen.value = true
}

async function fetchMessages() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [inboxRes, sentRes, countRes] = await Promise.all([
      api.get<MessageItem[]>('/message/inbox'),
      api.get<MessageItem[]>('/message/sent'),
      api.get<{ count: number }>('/message/unread-count')
    ])

    inboxMessages.value = Array.isArray(inboxRes) ? inboxRes : []
    sentMessages.value = Array.isArray(sentRes) ? sentRes : []
    unreadCount.value = countRes?.count || 0
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Error al conectar con el servidor de mensajería'
  } finally {
    isLoading.value = false
  }
}

async function sendMessage() {
  if (!composeForm.receiverId || !composeForm.content.trim()) {
    composeError.value = 'El destinatario y el mensaje son requeridos.'
    return
  }

  isSending.value = true
  composeError.value = null

  try {
    await api.post('/message', {
      receiverId: composeForm.receiverId,
      content: composeForm.content.trim()
    })
    isComposeOpen.value = false
    await fetchMessages()
    activeTab.value = 'sent'
  } catch (err: any) {
    composeError.value = err?.data?.message || 'Error al enviar el mensaje'
  } finally {
    isSending.value = false
  }
}

onMounted(() => {
  fetchMessages()
})
</script>
