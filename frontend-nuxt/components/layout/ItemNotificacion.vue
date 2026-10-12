<!-- Una notificación de la campana (NotificationBell.vue): ícono por tipo, título, texto completo y a dónde lleva. -->
<template>
  <li class="relative group">
    <button
      type="button"
      class="w-full text-left pl-4 pr-12 py-3 text-xs hover:bg-base-bg-secundario transition-colors flex items-start gap-3"
      :class="!n.isRead ? 'bg-semantico-info/5' : ''"
      @click="emit('abrir', n)">
      <span class="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="tipo.fondo" aria-hidden="true">
        <component :is="tipo.icono" :size="15" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-start gap-2">
          <span class="font-semibold text-sm text-base-texto-primario break-words flex-1">{{ n.title }}</span>
          <span v-if="!n.isRead" class="mt-1.5 w-2 h-2 rounded-full bg-semantico-info shrink-0" aria-hidden="true" />
        </span>
        <!-- Completo, sin cortar (antes se cortaba en dos líneas y no se podía leer el mensaje entero). -->
        <span class="block text-base-texto-secundario mt-0.5 whitespace-pre-line break-words leading-relaxed">{{ n.message }}</span>
        <span class="flex items-center gap-2 mt-1.5 text-[11px] text-base-texto-secundario">
          <span>{{ tipo.nombre }} · {{ haceCuanto(n.createdAt) }}</span>
          <span v-if="!n.isRead" class="sr-only">, sin leer</span>
          <span v-if="destino" class="ml-auto font-semibold text-acento-ambar-fuerte inline-flex items-center gap-0.5">Abrir <ChevronRight :size="12" aria-hidden="true" /></span>
        </span>
      </span>
    </button>
    <slot name="acciones" />
  </li>
</template>

<script setup lang="ts">
import { Bell, ChevronRight, GraduationCap, Lightbulb, Megaphone, MessageSquare, RotateCcw } from 'lucide-vue-next'
import { haceCuanto, type NotificacionCampana, type TipoNotificacion } from '~/utils/notificaciones'

const props = defineProps<{ n: NotificacionCampana; destino: string | null }>()
const emit = defineEmits<{ abrir: [n: NotificacionCampana] }>()

// Un ícono y un nombre por tipo: se distingue de un vistazo una nota de un repaso (y no solo por el color).
const TIPOS: Record<TipoNotificacion, { icono: typeof Bell; nombre: string; fondo: string }> = {
  grade: { icono: GraduationCap, nombre: 'Nota', fondo: 'bg-semantico-pasa/10 text-semantico-pasa' },
  review_schedule: { icono: RotateCcw, nombre: 'Repasos', fondo: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  message: { icono: MessageSquare, nombre: 'Mensaje', fondo: 'bg-semantico-info/10 text-semantico-info' },
  aviso: { icono: Megaphone, nombre: 'Aviso de la clase', fondo: 'bg-stire-purple/10 text-stire-purple' },
  info: { icono: Lightbulb, nombre: 'Tu avance', fondo: 'bg-base-bg-secundario text-base-texto-secundario' },
}
const tipo = computed(() => TIPOS[props.n.type] ?? TIPOS.info)
</script>
