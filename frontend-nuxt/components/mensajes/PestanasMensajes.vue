<template>
  <!-- «Mensajes» (uno a uno, se responden) y «Avisos» (del docente a toda la clase). Son enlaces con ?ver=avisos: la
       notificación de un aviso lleva directo a su pestaña y el botón «Atrás» del navegador funciona. -->
  <nav aria-label="Mensajes y avisos" class="flex gap-2 mb-4 text-xs">
    <NuxtLink v-for="p in PESTANAS" :key="p.valor" :to="p.valor === 'avisos' ? { query: { ver: 'avisos' } } : { query: {} }"
      :aria-current="activa === p.valor ? 'page' : undefined"
      class="min-h-[44px] px-4 rounded-full border-2 font-semibold inline-flex items-center gap-1.5 transition-colors"
      :class="activa === p.valor ? 'border-acento-ambar-fuerte bg-acento-ambar/10 text-base-texto-primario' : 'border-base-borde-sutil text-base-texto-secundario hover:text-base-texto-primario'">
      <component :is="p.icono" :size="14" aria-hidden="true" /> {{ p.texto }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { Megaphone, MessageSquare } from 'lucide-vue-next'

defineProps<{ activa: 'mensajes' | 'avisos' }>()
const PESTANAS = [
  { valor: 'mensajes', texto: 'Mensajes', icono: MessageSquare },
  { valor: 'avisos', texto: 'Avisos de la clase', icono: Megaphone },
] as const
</script>
