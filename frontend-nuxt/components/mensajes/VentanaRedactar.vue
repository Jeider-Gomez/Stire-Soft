<template>
  <!-- Ventana para escribir un mensaje: la base de ventanas (foco, Tab atrapado, Escape, fondo) y el texto; quien la usa
       pone cómo se elige el destinatario. Antes no atrapaba el foco ni se cerraba con Escape. -->
  <AdminDialogo id-titulo="redactar-titulo" :titulo="titulo" :subtitulo="subtitulo" devolver-foco="redactar-mensaje" :ocupado="enviando" @cerrar="emit('cerrar')">
    <template #icono><PenLine :size="18" aria-hidden="true" /></template>
    <form class="space-y-3 text-xs" novalidate @submit.prevent="emit('enviar')">
      <p v-if="respondiendoA" class="font-semibold text-base-texto-primario">Respondiendo a {{ respondiendoA }}</p>
      <slot v-else name="destinatario" />
      <div>
        <label for="redactar-contenido" class="block font-semibold text-base-texto-primario mb-1">{{ etiquetaMensaje }}</label>
        <textarea id="redactar-contenido" v-crece :value="contenido" :data-foco-inicial="respondiendoA ? '' : undefined" rows="4" maxlength="2000" :placeholder="placeholder"
          class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"
          :aria-invalid="!!error" :aria-describedby="error ? 'redactar-error' : undefined"
          @input="emit('update:contenido', ($event.target as HTMLTextAreaElement).value)" />
      </div>
      <p v-if="error" id="redactar-error" role="alert" class="p-2 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded text-[11px]">{{ error }}</p>
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
        <button type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold" :disabled="enviando" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" :disabled="enviando" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar disabled:opacity-50 inline-flex items-center gap-1.5">
          <Loader2 v-if="enviando" :size="14" class="animate-spin" aria-hidden="true" /><Send v-else :size="14" aria-hidden="true" />
          {{ enviando ? 'Enviando…' : 'Enviar mensaje' }}
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { Loader2, PenLine, Send } from 'lucide-vue-next'

defineProps<{
  titulo: string
  subtitulo: string
  etiquetaMensaje: string
  placeholder: string
  contenido: string
  respondiendoA: string | null
  enviando: boolean
  error: string | null
}>()
const emit = defineEmits<{ cerrar: []; enviar: []; 'update:contenido': [valor: string] }>()
</script>
