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

    <div v-if="unreadCount > 0" class="flex justify-end -mb-3">
      <button
        @click="markAllAsRead"
        class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">
        Marcar todos como leídos
      </button>
    </div>

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
        Reintentar
      </button>
    </div>

    <!-- ESTADO 3: Vacío -->
    <div
      v-else-if="activeMessages.length === 0"
      class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <span class="text-3xl">📭</span>
      <h3 class="font-bold text-base-texto-primario text-sm">
        {{ activeTab === 'inbox' ? 'Bandeja de entrada vacía' : 'Sin mensajes enviados' }}
      </h3>
      <p class="text-base-texto-secundario max-w-md mx-auto">
        {{ activeTab === 'inbox'
          ? 'No has recibido mensajes todavía. Los estudiantes pueden escribirte desde su panel.'
          : 'Aún no has enviado ningún mensaje. Usa "Redactar Mensaje" para iniciar una conversación.' }}
      </p>
    </div>

    <!-- ESTADO 4: Lista de mensajes -->
    <div v-else class="space-y-2">
      <div
        v-for="msg in activeMessages"
        :key="msg.id"
        @click="markAsRead(msg)"
        class="bg-base-blanco rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-start gap-3 text-xs transition-colors hover:bg-base-bg-secundario/30"
        :class="activeTab === 'inbox' && !msg.isRead ? 'border-acento-ambar/50 bg-acento-ambar/5 cursor-pointer' : 'border-base-borde-sutil'">

        <!-- Avatar inicial -->
        <div class="flex-shrink-0 w-9 h-9 rounded-full bg-acento-ambar/15 flex items-center justify-center font-bold text-acento-ambar-fuerte text-sm">
          {{ getInitial(activeTab === 'inbox' ? msg.sender?.fullName : msg.receiver?.fullName) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-base-texto-primario truncate">
              {{ activeTab === 'inbox'
                ? (msg.sender?.fullName || `Usuario #${msg.senderId}`)
                : (msg.receiver?.fullName || `Usuario #${msg.receiverId}`) }}
            </span>
            <span v-if="activeTab === 'inbox' && !msg.isRead" class="px-1.5 py-0.5 rounded-full bg-semantico-info/15 text-semantico-info text-[10px] font-bold flex-shrink-0">
              Nuevo
            </span>
            <span class="ml-auto text-[10px] text-base-texto-secundario flex-shrink-0">
              {{ formatDate(msg.createdAt) }}
            </span>
          </div>
          <p class="text-base-texto-secundario line-clamp-2">{{ msg.content }}</p>
        </div>

        <!-- Botón responder (solo en inbox) -->
        <button
          v-if="activeTab === 'inbox'"
          @click="replyToUser(msg.senderId, msg.sender?.fullName)"
          class="borde-afordancia px-3 py-1.5 rounded text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 whitespace-nowrap self-start">
          ↩ Responder
        </button>
      </div>
    </div>

    <!-- Modal para Redactar Mensaje -->
    <div
      v-if="isComposeOpen"
      class="fixed inset-0 bg-base-texto-primario/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-modal-title">
      <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
          <h3 id="compose-modal-title" class="font-bold text-base-texto-primario flex items-center gap-1.5">
            <span>✉️</span>
            <span>Redactar Mensaje Académico</span>
          </h3>
          <button
            @click="isComposeOpen = false"
            aria-label="Cerrar modal de redacción"
            class="text-base-texto-secundario hover:text-base-texto-primario text-sm font-bold focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded">
            ✕
          </button>
        </div>

        <form @submit.prevent="sendMessage" class="space-y-3">
          <!-- Selector de Clase (para filtrar estudiantes) -->
          <div>
            <label for="compose-class" class="block font-semibold text-base-texto-primario mb-1">
              Clase
            </label>
            <select
              id="compose-class"
              v-model="composeClassId"
              @change="loadStudentsForClass"
              class="w-full px-3 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30">
              <option value="" disabled>Selecciona una clase</option>
              <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.code }})
              </option>
            </select>
          </div>

          <!-- Selector de Estudiante (poblado dinámicamente) -->
          <div>
            <label for="compose-student" class="block font-semibold text-base-texto-primario mb-1">
              Estudiante Destinatario *
            </label>
            <div v-if="isLoadingStudents" class="text-base-texto-secundario py-1.5 text-[11px]">
              <span class="animate-spin inline-block mr-1">⏳</span> Cargando estudiantes...
            </div>
            <select
              v-else
              id="compose-student"
              v-model="composeForm.receiverId"
              required
              :disabled="enrolledStudents.length === 0"
              class="w-full px-3 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-50 focus:ring-2 focus:ring-acento-ambar-fuerte/30">
              <option :value="0" disabled>
                {{ enrolledStudents.length === 0
                  ? (composeClassId ? 'Sin estudiantes en esta clase' : 'Selecciona una clase primero')
                  : 'Elige un estudiante' }}
              </option>
              <option v-for="s in enrolledStudents" :key="s.studentId" :value="s.studentId">
                {{ s.fullName }} — {{ s.email }}
              </option>
            </select>
            <p v-if="replyName" class="text-[10px] text-semantico-pasa font-semibold mt-0.5">
              Respondiendo a: {{ replyName }}
            </p>
          </div>

          <!-- Contenido del Mensaje -->
          <div>
            <label for="compose-content" class="block font-semibold text-base-texto-primario mb-1">
              Contenido del Mensaje *
            </label>
            <textarea
              id="compose-content"
              v-model="composeForm.content"
              required
              rows="4"
              placeholder="Escribe aquí las orientaciones o retroalimentación..."
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none resize-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
          </div>

          <div v-if="composeError" role="alert" aria-live="assertive" class="p-2 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded text-[11px]">
            {{ composeError }}
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
            <button
              type="button"
              @click="isComposeOpen = false"
              class="px-3 py-1.5 rounded-md borde-afordancia text-base-texto-primario font-semibold hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSending"
              class="px-4 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
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
const { messageOf } = useApiErrorMessage()

definePageMeta({
  layout: 'teacher'
})

interface TeacherClass {
  id: number
  code: string
  name: string
}

interface EnrolledStudent {
  studentId: number
  fullName: string
  email: string
}

interface EnrollmentRow {
  studentId: number
  status: string
  student?: { fullName?: string; email?: string }
}

interface MessageUser {
  id: number
  fullName: string
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

// Clases del docente (para filtrar destinatarios)
const teacherClasses = ref<TeacherClass[]>([])
const composeClassId = ref<number | ''>('')
const enrolledStudents = ref<EnrolledStudent[]>([])
const isLoadingStudents = ref(false)

// Modal de redacción
const isComposeOpen = ref(false)
const isSending = ref(false)
const composeError = ref<string | null>(null)
const replyName = ref<string | null>(null)
const composeForm = reactive({
  receiverId: 0,
  content: ''
})

const activeMessages = computed(() =>
  activeTab.value === 'inbox' ? inboxMessages.value : sentMessages.value
)

function getInitial(name?: string): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)
  if (diffHrs < 24) {
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

async function openNewMessageModal() {
  replyName.value = null
  composeForm.receiverId = 0
  composeForm.content = ''
  composeError.value = null
  enrolledStudents.value = []

  // Cargar clases del docente si no están cargadas aún
  if (teacherClasses.value.length === 0) {
    try {
      const classes = await api.get<TeacherClass[]>('/class/my-classes')
      teacherClasses.value = Array.isArray(classes) ? classes : []
    } catch { /* silencio — el usuario verá el select vacío */ }
  }

  // Pre-seleccionar primera clase y cargar sus alumnos
  if (teacherClasses.value.length > 0) {
    composeClassId.value = teacherClasses.value[0].id
    await loadStudentsForClass()
  }

  isComposeOpen.value = true
}

async function replyToUser(senderId: number, name?: string) {
  replyName.value = name || `Usuario #${senderId}`
  composeForm.receiverId = senderId
  composeForm.content = ''
  composeError.value = null
  isComposeOpen.value = true
}

async function loadStudentsForClass() {
  if (!composeClassId.value) return
  isLoadingStudents.value = true
  enrolledStudents.value = []
  composeForm.receiverId = 0

  try {
    // GET /enrollment/class/:classId — mismo endpoint que DOC-V04. Devuelve
    // matrículas (Enrollment[]), no estudiantes planos: el nombre y el correo
    // viven en `student.fullName`/`student.email`, no en el nivel superior.
    const res = await api.get<EnrollmentRow[]>(`/enrollment/class/${composeClassId.value}`)
    enrolledStudents.value = Array.isArray(res)
      ? res
          .filter((e) => e.status === 'active' && e.student)
          .map((e) => ({
            studentId: e.studentId,
            fullName: e.student?.fullName || `Estudiante #${e.studentId}`,
            email: e.student?.email || ''
          }))
      : []
  } catch {
    enrolledStudents.value = []
  } finally {
    isLoadingStudents.value = false
  }
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
    errorMessage.value = messageOf(err, 'Error al conectar con el servidor de mensajería')
  } finally {
    isLoading.value = false
  }
}

async function markAsRead(msg: MessageItem) {
  if (activeTab.value !== 'inbox' || msg.isRead) return
  try {
    await api.patch(`/message/${msg.id}/read`)
    msg.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch { /* se reintenta al volver a tocar el mensaje */ }
}

async function markAllAsRead() {
  await Promise.all(inboxMessages.value.filter((m) => !m.isRead).map((m) => markAsRead(m)))
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
    composeError.value = messageOf(err, 'Error al enviar el mensaje')
  } finally {
    isSending.value = false
  }
}

onMounted(() => {
  fetchMessages()
})
</script>
