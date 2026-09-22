<template>
  <div class="relative" ref="bellMenuRef">
    <button
      @click="toggleOpen"
      class="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150"
      aria-label="Notificaciones"
      :aria-expanded="isOpen"
    >
      <Bell :size="18" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-stire-danger text-white text-[9px] font-bold flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-12 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50"
        role="dialog"
        aria-label="Panel de notificaciones"
      >
        <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <p class="text-xs font-semibold text-slate-800">Notificaciones</p>
          <span v-if="unreadCount > 0" class="text-[10px] text-slate-400">{{ unreadCount }} sin leer</span>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="isLoading" class="px-4 py-6 text-center text-[11px] text-slate-400">
            <span class="inline-block animate-spin mr-1">⏳</span> Cargando...
          </div>

          <div v-else-if="notifications.length === 0" class="px-4 py-6 text-center text-[11px] text-slate-400">
            No tienes notificaciones todavía.
          </div>

          <button
            v-else
            v-for="n in notifications"
            :key="n.id"
            @click="handleNotificationClick(n)"
            class="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            :class="!n.isRead ? 'bg-stire-blue/5' : ''"
          >
            <div class="flex items-start gap-2">
              <span
                class="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                :class="n.isRead ? 'bg-transparent' : 'bg-stire-blue'"
              />
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-slate-800 truncate">{{ n.title }}</p>
                <p class="text-slate-500 line-clamp-2 mt-0.5">{{ n.message }}</p>
                <p class="text-[10px] text-slate-400 mt-1">{{ formatDate(n.createdAt) }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const authStore = useAuthStore()

interface NotificationItem {
  id: number
  title: string
  message: string
  isRead: boolean
  type: 'grade' | 'review_schedule' | 'message' | 'info'
  createdAt: string
}

const isOpen = ref(false)
const isLoading = ref(false)
const notifications = ref<NotificationItem[]>([])
const unreadCount = ref(0)
const bellMenuRef = ref<HTMLElement | null>(null)
let pollHandle: ReturnType<typeof setInterval> | undefined

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffHrs = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  if (diffHrs < 24) {
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

async function refreshUnreadCount() {
  try {
    const unread = await api.get<NotificationItem[]>('/notifications')
    unreadCount.value = Array.isArray(unread) ? unread.length : 0
  } catch { /* silencio — el ícono simplemente no muestra contador */ }
}

async function fetchNotifications() {
  isLoading.value = true
  try {
    const all = await api.get<NotificationItem[]>('/notifications/all')
    notifications.value = Array.isArray(all) ? all.slice(0, 20) : []
    unreadCount.value = notifications.value.filter((n) => !n.isRead).length
  } catch {
    notifications.value = []
  } finally {
    isLoading.value = false
  }
}

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) fetchNotifications()
}

function targetRouteForType(type: NotificationItem['type']): string | null {
  if (type !== 'message') return null
  switch (authStore.currentRole) {
    case 'docente': return '/docente/mensajes'
    case 'estudiante': return '/estudiante/mensajes'
    default: return null
  }
}

async function handleNotificationClick(n: NotificationItem) {
  if (!n.isRead) {
    try {
      await api.patch(`/notifications/${n.id}/read`)
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch { /* si falla, se reintenta la próxima vez que se abra el panel */ }
  }

  const target = targetRouteForType(n.type)
  if (target) {
    isOpen.value = false
    navigateTo(target)
  }
}

function handleClickOutside(event: MouseEvent) {
  if (bellMenuRef.value && !bellMenuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  refreshUnreadCount()
  pollHandle = setInterval(refreshUnreadCount, 30000)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollHandle) clearInterval(pollHandle)
})
</script>
