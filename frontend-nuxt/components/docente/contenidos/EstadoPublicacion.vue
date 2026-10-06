<template>
  <!-- D1: Chip de estado (etiqueta) + botón de acción separados.
       Publicado → chip verde + botón «Ocultar» ámbar; Borrador → chip gris + botón «Publicar» verde.
       Sin hover:bg-red-* ni clases prohibidas. -->
  <div class="flex items-center gap-2">
    <!-- Chip de estado: NO es botón, es solo etiqueta -->
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold select-none"
      :class="publicado
        ? 'bg-semantico-pasa/10 text-emerald-800 border border-semantico-pasa/30'
        : 'bg-base-texto-secundario/10 text-base-texto-secundario border border-base-borde-sutil'"
    >
      <Check v-if="publicado" :size="11" aria-hidden="true" />
      <EyeOff v-else :size="11" aria-hidden="true" />
      {{ publicado ? 'Publicado' : 'Borrador' }}
    </span>

    <!-- Botón de acción: lo que el docente HACE a continuación -->
    <button
      type="button"
      :disabled="ocupado"
      :aria-label="publicado
        ? `Ocultar el módulo «${titulo}»: los estudiantes dejarán de verlo`
        : `Publicar el módulo «${titulo}»: los estudiantes empezarán a verlo`"
      class="min-h-[44px] sm:min-h-[36px] px-2.5 py-1 rounded text-[11px] font-bold transition-colors border focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte inline-flex items-center gap-1 disabled:opacity-50"
      :class="publicado
        ? 'border-acento-ambar-fuerte/60 text-acento-ambar-fuerte bg-acento-ambar/5 hover:bg-acento-ambar/15'
        : 'bg-semantico-pasa text-base-blanco border-semantico-pasa hover:bg-semantico-pasa/80'"
      @click="$emit('accion')"
    >
      <Loader2 v-if="ocupado" :size="11" class="animate-spin" aria-hidden="true" />
      <Eye v-else-if="!publicado" :size="11" aria-hidden="true" />
      <EyeOff v-else :size="11" aria-hidden="true" />
      {{ publicado ? 'Ocultar' : 'Publicar' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

defineProps<{
  publicado: boolean
  titulo: string
  ocupado?: boolean
}>()
defineEmits<{ (e: 'accion'): void }>()
</script>
