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

    <!-- En el celular, una hoja bajo la cabecera con el fondo atenuado: ni un menú pegado a la campana ni toda la pantalla
         (12/10, Jeider: «muy brusco»; José, 09/10: el menú tapaba sin dejar leer). Va al <body>: dentro del encabezado, que
         tiene desenfoque (backdrop-filter), «fixed» se mediría desde el encabezado. En computador, una columna de 384 px. -->
    <Teleport to="body" :disabled="!esCelular">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
      <div v-if="isOpen && esCelular" class="fixed inset-0 z-[59] bg-base-texto-primario/30" aria-hidden="true" @click="cerrar" />
    </Transition>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        id="panel-notificaciones"
        ref="panelRef"
        class="fixed inset-x-2 top-[4.25rem] z-[60] max-h-[min(75dvh,36rem)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96 sm:z-50 sm:max-h-[32rem] bg-base-blanco rounded-2xl shadow-xl border border-base-borde-fuerte flex flex-col"
        role="dialog"
        :aria-modal="esCelular ? 'true' : undefined"
        aria-labelledby="titulo-notificaciones"
      >
        <div class="px-4 pt-2.5 pb-2 border-b border-base-borde-sutil shrink-0 space-y-2">
          <div class="flex items-center gap-2">
            <h2 id="titulo-notificaciones" class="text-sm font-semibold text-base-texto-primario flex-1">Notificaciones</h2>
            <button title="Cerrar las notificaciones" ref="cerrarRef" type="button" class="min-w-[44px] min-h-[44px] -my-2 -mr-2 inline-flex items-center justify-center rounded-md text-base-texto-primario hover:bg-base-bg-secundario sm:hidden" @click="cerrar">
              <X :size="16" aria-hidden="true" /><span class="sr-only">Cerrar las notificaciones</span>
            </button>
          </div>
          <!-- Filtro como en GitHub o LinkedIn: lo nuevo primero, lo leído a un toque. -->
          <div class="flex gap-1.5" role="group" aria-label="Qué notificaciones ver">
            <button v-for="f in FILTROS" :key="f.id" type="button" :aria-pressed="filtro === f.id"
              class="min-h-[36px] px-3 rounded-full text-xs font-semibold border transition-colors"
              :class="filtro === f.id ? 'bg-base-texto-primario text-base-blanco border-base-texto-primario' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'"
              @click="filtro = f.id">
              {{ f.texto }}<template v-if="f.id === 'sin-leer' && unreadCount"> ({{ unreadCount }})</template>
            </button>
          </div>
        </div>

        <div class="overflow-y-auto overscroll-contain flex-1 min-h-0">
          <p v-if="isLoading" role="status" class="px-4 py-6 text-center text-xs text-base-texto-secundario">
            <Loader2 :size="14" class="inline-block animate-spin mr-1" aria-hidden="true" /> Cargando…
          </p>
          <div v-else-if="!grupos.length" class="px-4 py-8 text-center text-xs text-base-texto-secundario space-y-1">
            <p class="font-semibold text-base-texto-primario">{{ textoVacio(filtro === 'sin-leer', notifications.length > 0) }}</p>
            <p>Aquí llegan tus notas, lo que te escribe tu docente, tus avances por módulo y los repasos del día.</p>
          </div>
          <template v-else>
            <section v-for="g in grupos" :key="g.grupo" :aria-label="g.grupo">
              <h3 class="sticky top-0 z-10 px-4 py-1 bg-base-bg-secundario text-[11px] font-bold text-base-texto-primario">{{ g.grupo }}</h3>
              <ul class="divide-y divide-base-borde-sutil">
                <LayoutItemNotificacion v-for="n in g.items" :key="n.id" :n="n" :destino="destinoDe(n)" @abrir="handleNotificationClick" />
              </ul>
            </section>
          </template>
        </div>

        <div v-if="unreadCount > 0" class="px-3 py-1.5 border-t border-base-borde-sutil shrink-0 flex justify-end">
          <button type="button" class="min-h-[44px] px-2 text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="marcarTodas">
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { Bell, Loader2, X } from 'lucide-vue-next'
import { agruparNotificaciones, textoVacio, type NotificacionCampana } from '~/utils/notificaciones'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { useTutorStore } from '~/stores/tutor'

const api = useApi()
const authStore = useAuthStore()

type NotificationItem = NotificacionCampana
const FILTROS = [{ id: 'sin-leer', texto: 'Sin leer' }, { id: 'todas', texto: 'Todas' }] as const
const filtro = ref<'sin-leer' | 'todas'>('todas')
const grupos = computed(() => agruparNotificaciones(notifications.value, filtro.value === 'sin-leer'))

const isOpen = ref(false)
const isLoading = ref(false)
const notifications = ref<NotificationItem[]>([])
const unreadCount = ref(0)
const bellMenuRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const cerrarRef = ref<HTMLButtonElement | null>(null)
const tutorStore = useTutorStore()
const botonRef = ref<HTMLButtonElement | null>(null)
let pollHandle: ReturnType<typeof setInterval> | undefined

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

// Notificaciones y Tutor no se abren a la vez (hallazgo de José, 09/10: en el computador los dos paneles se tapaban).
// Abrir uno cierra el otro; la conversación del Tutor no se pierde.
function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    if (tutorStore.isOpen) tutorStore.closeDrawer()
    // Abre en «Sin leer» si hay algo nuevo; si no, en «Todas».
    filtro.value = unreadCount.value > 0 ? 'sin-leer' : 'todas'
    fetchNotifications()
    // A pantalla completa, el foco entra al panel (si no, quedaría en la campana, tapada).
    if (esCelular.value) nextTick(() => cerrarRef.value?.focus())
  }
}
watch(() => tutorStore.isOpen, (abierto) => { if (abierto) isOpen.value = false })

// En el celular (< 640 px) el panel va a pantalla completa.
const esCelular = ref(false)

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
  const objetivo = event.target as Node
  if (panelRef.value?.contains(objetivo)) return
  if (bellMenuRef.value && !bellMenuRef.value.contains(objetivo)) {
    isOpen.value = false
  }
}

useEscapeToClose(() => isOpen.value, cerrar)
useBloqueoScrollMovil(() => isOpen.value)

let consultaCelular: MediaQueryList | null = null
const actualizarCelular = () => { esCelular.value = !!consultaCelular?.matches }

onMounted(() => {
  consultaCelular = window.matchMedia('(max-width: 639px)')
  actualizarCelular()
  consultaCelular.addEventListener('change', actualizarCelular)
  document.addEventListener('click', handleClickOutside)
  refreshUnreadCount()
  pollHandle = setInterval(refreshUnreadCount, 30000)
})
onUnmounted(() => {
  consultaCelular?.removeEventListener('change', actualizarCelular)
  document.removeEventListener('click', handleClickOutside)
  if (pollHandle) clearInterval(pollHandle)
})
</script>
