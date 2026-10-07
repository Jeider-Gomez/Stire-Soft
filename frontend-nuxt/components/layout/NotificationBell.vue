<template>
  <div class="relative" ref="bellMenuRef">
    <button
      ref="botonRef"
      @click="toggleOpen"
      class="relative p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150"
      :aria-expanded="isOpen"
      aria-controls="panel-notificaciones"
    >
      <!-- Sin aria-label: el nombre sale del texto, así incluye el número que se ve (WCAG 2.5.3, control por voz). -->
      <Bell :size="18" aria-hidden="true" />
      <span class="sr-only">Notificaciones</span>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}<span class="sr-only"> sin leer</span>
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <!-- En el celular el panel ocupa el ancho de la pantalla (antes medía 320 px y cortaba el texto: hallazgo de José);
           en el computador, una columna de 384 px. Cada notificación se lee completa. -->
      <div
        v-if="isOpen"
        id="panel-notificaciones"
        class="fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96 bg-base-blanco rounded-2xl shadow-xl border border-base-borde-fuerte z-50 flex flex-col max-h-[calc(100dvh-5rem)] sm:max-h-[32rem]"
        role="dialog"
        aria-labelledby="titulo-notificaciones"
      >
        <div class="px-4 py-2.5 border-b border-base-borde-sutil flex items-center gap-2">
          <h2 id="titulo-notificaciones" class="text-sm font-semibold text-base-texto-primario flex-1">Notificaciones</h2>
          <button v-if="unreadCount > 0" type="button" class="min-h-[44px] px-2 text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="marcarTodas">
            Marcar todas como leídas
          </button>
          <button type="button" class="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md text-base-texto-primario hover:bg-base-bg-secundario sm:hidden" @click="cerrar">
            <X :size="16" aria-hidden="true" /><span class="sr-only">Cerrar las notificaciones</span>
          </button>
        </div>

        <div class="overflow-y-auto overscroll-contain">
          <p v-if="isLoading" role="status" class="px-4 py-6 text-center text-xs text-base-texto-secundario">
            <Loader2 :size="14" class="inline-block animate-spin mr-1" aria-hidden="true" /> Cargando…
          </p>

          <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center text-xs text-base-texto-secundario space-y-1">
            <p class="font-semibold text-base-texto-primario">Estás al día</p>
            <p>Aquí llegan tus notas, lo que te escribe tu docente, tus avances por módulo y los repasos del día.</p>
          </div>

          <ul v-else class="divide-y divide-base-borde-sutil">
            <li v-for="n in notifications" :key="n.id">
              <button
                type="button"
                @click="handleNotificationClick(n)"
                class="w-full text-left px-4 py-3 text-xs hover:bg-base-bg-secundario transition-colors flex items-start gap-3"
                :class="!n.isRead ? 'bg-semantico-info/5' : ''"
              >
                <span class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="ICONOS[n.type].fondo" aria-hidden="true">
                  <component :is="ICONOS[n.type].icono" :size="15" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-start gap-2">
                    <span class="font-semibold text-sm text-base-texto-primario break-words flex-1">{{ n.title }}</span>
                    <span v-if="!n.isRead" class="mt-1.5 w-2 h-2 rounded-full bg-semantico-info shrink-0" aria-hidden="true" />
                  </span>
                  <!-- Completo, sin cortar (antes se cortaba en dos líneas y no se podía leer el mensaje entero). -->
                  <span class="block text-base-texto-secundario mt-0.5 whitespace-pre-line break-words leading-relaxed">{{ n.message }}</span>
                  <span class="flex items-center gap-2 mt-1.5 text-[11px] text-base-texto-secundario">
                    <span>{{ ICONOS[n.type].nombre }} · {{ formatDate(n.createdAt) }}</span>
                    <span v-if="!n.isRead" class="sr-only">, sin leer</span>
                    <span v-if="destinoDe(n)" class="ml-auto font-semibold text-acento-ambar-fuerte inline-flex items-center gap-0.5">Abrir <ChevronRight :size="12" aria-hidden="true" /></span>
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { Bell, ChevronRight, GraduationCap, Lightbulb, Loader2, Megaphone, MessageSquare, RotateCcw, X } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const authStore = useAuthStore()

type TipoNotificacion = 'grade' | 'review_schedule' | 'message' | 'info' | 'aviso'
interface NotificationItem {
  id: number
  title: string
  message: string
  isRead: boolean
  type: TipoNotificacion
  enlace?: string | null
  createdAt: string
}

// Un ícono y un nombre por tipo: se distingue de un vistazo una nota de un repaso (y no solo por el color).
const ICONOS: Record<TipoNotificacion, { icono: typeof Bell; nombre: string; fondo: string }> = {
  grade: { icono: GraduationCap, nombre: 'Nota', fondo: 'bg-semantico-pasa/10 text-semantico-pasa' },
  review_schedule: { icono: RotateCcw, nombre: 'Repasos', fondo: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  message: { icono: MessageSquare, nombre: 'Mensaje', fondo: 'bg-semantico-info/10 text-semantico-info' },
  aviso: { icono: Megaphone, nombre: 'Aviso de la clase', fondo: 'bg-stire-purple/10 text-stire-purple' },
  info: { icono: Lightbulb, nombre: 'Tu avance', fondo: 'bg-base-bg-secundario text-base-texto-secundario' },
}

const isOpen = ref(false)
const isLoading = ref(false)
const notifications = ref<NotificationItem[]>([])
const unreadCount = ref(0)
const bellMenuRef = ref<HTMLElement | null>(null)
const botonRef = ref<HTMLButtonElement | null>(null)
let pollHandle: ReturnType<typeof setInterval> | undefined

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const minutos = Math.round((Date.now() - d.getTime()) / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  if (minutos < 24 * 60) return `hace ${Math.round(minutos / 60)} h`
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
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
    notifications.value = Array.isArray(all) ? all.slice(0, 30) : []
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

function cerrar() {
  isOpen.value = false
  nextTick(() => botonRef.value?.focus())
}

/** A dónde lleva: el enlace que trae (la lección, la entrega, los repasos) o, en las antiguas, la bandeja de mensajes. */
function destinoDe(n: NotificationItem): string | null {
  if (n.enlace) return n.enlace
  if (n.type !== 'message') return null
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
  const target = destinoDe(n)
  if (target) {
    isOpen.value = false
    navigateTo(target)
  }
}

async function marcarTodas() {
  try {
    await api.patch('/notifications/read-all')
    notifications.value.forEach((n) => { n.isRead = true })
    unreadCount.value = 0
  } catch { /* se puede volver a intentar */ }
}

function handleClickOutside(event: MouseEvent) {
  if (bellMenuRef.value && !bellMenuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

useEscapeToClose(() => isOpen.value, cerrar)

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
