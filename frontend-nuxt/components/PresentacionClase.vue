<template>
  <!-- Presentación de la clase (prototipo del panel v2): la franja con el color de portada que eligió el docente, el nombre,
       quién la dicta y su texto de bienvenida (la descripción de la clase). La ve el estudiante en su Inicio y el docente
       en Ajustes, como vista previa. -->
  <section class="rounded-xl border border-base-borde-fuerte bg-base-blanco shadow-sm overflow-hidden" :aria-label="`Presentación de ${nombre}`">
    <div class="relative h-20 sm:h-24 px-5 flex items-end pb-3" :style="{ backgroundColor: color }">
      <!-- Una trama suave sobre el color, para que la franja no sea un bloque plano. -->
      <svg class="absolute inset-0 w-full h-full opacity-[0.14]" aria-hidden="true" preserveAspectRatio="none">
        <defs><pattern :id="`trama-${uid}`" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" /></pattern></defs>
        <rect width="100%" height="100%" :fill="`url(#trama-${uid})`" />
      </svg>
      <span v-if="etiqueta" class="relative text-[10px] font-bold uppercase tracking-wider text-white/90">{{ etiqueta }}</span>
      <span v-if="codigo" class="relative ml-auto px-2 py-0.5 rounded bg-black/20 text-[10px] font-mono font-bold text-white">{{ codigo }}</span>
    </div>
    <div class="p-5 space-y-2">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 class="text-base sm:text-lg font-bold text-base-texto-primario">{{ nombre }}</h2>
        <slot name="accion" />
      </div>
      <p v-if="docente" class="text-xs text-base-texto-secundario">Con {{ docente }}</p>
      <p v-if="bienvenida" class="text-sm text-base-texto-primario whitespace-pre-line leading-relaxed">{{ bienvenida }}</p>
      <p v-else-if="vacio" class="text-xs text-base-texto-secundario italic">{{ vacio }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{
  nombre: string
  color: string
  bienvenida?: string | null
  docente?: string | null
  codigo?: string | null
  etiqueta?: string | null
  /** Qué decir si no hay bienvenida (solo en la vista previa del docente). */
  vacio?: string | null
}>(), { bienvenida: null, docente: null, codigo: null, etiqueta: null, vacio: null })
const uid = useId()
</script>
