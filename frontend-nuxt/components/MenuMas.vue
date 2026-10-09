<template>
  <!-- Acciones secundarias o que conviene no tener a un clic por error (editar, archivar) detrás de un botón «Más».
       Patrón de divulgación (botón con aria-expanded que muestra una lista), no role="menu": se recorre con Tab como
       cualquier botón. Escape o un clic afuera lo cierran y el foco vuelve al botón. -->
  <div ref="raiz" class="relative" @keydown.esc.stop="cerrar(true)">
    <button
      :id="idBoton"
      ref="boton"
      type="button"
      :aria-expanded="abierto"
      :aria-controls="idLista"
      :aria-label="etiqueta"
      title="Más acciones"
      class="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center rounded border border-base-borde-fuerte bg-base-bg-secundario text-base-texto-primario hover:bg-acento-ambar/10 transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
      @click="abierto = !abierto">
      <MoreHorizontal :size="16" aria-hidden="true" />
    </button>
    <div v-if="abierto" :id="idLista"
      class="absolute right-0 top-full mt-1 z-20 min-w-[11rem] rounded-lg border border-base-borde-sutil bg-base-blanco shadow-lg py-1 text-xs"
      @click="cerrar(false)">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'

// idBoton: para que una ventana abierta desde el menú devuelva el foco a «Más» al cerrarse.
defineProps<{ etiqueta: string; idBoton?: string }>()
const abierto = ref(false)
const raiz = ref<HTMLElement | null>(null)
const boton = ref<HTMLButtonElement | null>(null)
const idLista = `menu-mas-${useId()}`

function cerrar(devolverFoco: boolean) {
  if (!abierto.value) return
  abierto.value = false
  if (devolverFoco) boton.value?.focus()
}
function alClicAfuera(e: MouseEvent) {
  if (raiz.value && e.target instanceof Node && !raiz.value.contains(e.target)) cerrar(false)
}
onMounted(() => document.addEventListener('click', alClicAfuera))
onBeforeUnmount(() => document.removeEventListener('click', alClicAfuera))
</script>
