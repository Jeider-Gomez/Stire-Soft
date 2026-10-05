<template>
  <!-- Ventana modal del panel del admin: una sola base para las cinco (antes cada una repetía todo esto).
       - El foco entra al control marcado con data-foco-inicial y, al cerrar, vuelve a `devolverFoco` (WCAG 2.4.3).
       - Tab no se sale de la ventana; Escape la cierra (si no está ocupada).
       - El fondo la cierra solo si el clic EMPEZÓ en el fondo: al seleccionar texto arrastrando y soltar fuera, el
         navegador lo contaba como clic en el fondo y la cerraba (reporte de Jorge, 02/10). -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    @mousedown="inicioClic = $event.target" @click.self="inicioClic === $event.currentTarget && cierraConFondo && cerrar()">
    <div
      ref="dialogo"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="idTitulo"
      :aria-describedby="idDescripcion"
      tabindex="-1"
      class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-xl space-y-4 outline-none max-h-[90dvh] overflow-y-auto"
      @keydown="atraparFoco($event, dialogo)">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :class="claseIcono">
          <slot name="icono" />
        </div>
        <div>
          <h3 :id="idTitulo" class="font-bold text-sm text-base-texto-primario">{{ titulo }}</h3>
          <p class="text-xs text-slate-600">{{ subtitulo }}</p>
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { atraparFoco } from '~/utils/trampaDeFoco'

const props = withDefaults(defineProps<{
  idTitulo: string
  titulo: string
  subtitulo: string
  idDescripcion?: string
  claseIcono?: string
  /** Id del botón que abrió la ventana: el foco vuelve ahí al cerrar. */
  devolverFoco?: string | null
  /** Mientras guarda, no se cierra (ni con Escape ni con el fondo). */
  ocupado?: boolean
  /** Si el fondo la cierra (no, cuando muestra algo que hay que copiar antes). */
  cierraConFondo?: boolean
}>(), { claseIcono: 'bg-acento-ambar/15 text-acento-ambar-fuerte', devolverFoco: null, ocupado: false, cierraConFondo: true, idDescripcion: undefined })

const emit = defineEmits<{ cerrar: [] }>()
const dialogo = ref<HTMLElement | null>(null)
const inicioClic = ref<EventTarget | null>(null)

function cerrar() {
  if (!props.ocupado) emit('cerrar')
}

onMounted(() => nextTick(() => (dialogo.value?.querySelector<HTMLElement>('[data-foco-inicial]') ?? dialogo.value)?.focus()))
onBeforeUnmount(() => {
  const id = props.devolverFoco
  if (id) nextTick(() => document.getElementById(id)?.focus())
})
// Escape cierra aunque el foco se haya perdido (p. ej. tras un error al enviar).
useEscapeToClose(() => true, cerrar)
</script>
