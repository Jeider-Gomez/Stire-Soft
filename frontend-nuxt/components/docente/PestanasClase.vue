<template>
  <!-- Las pestañas de la clase (utils/pestanasClase.ts): el mismo encabezado en cada pantalla de la clase. -->
  <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm">
    <div v-if="nombre" class="px-4 pt-3 flex items-center gap-2 min-w-0 text-xs">
      <NuxtLink :to="enlacePestana('hoy', classId)" class="font-bold text-sm text-base-texto-primario truncate hover:underline">{{ nombre }}</NuxtLink>
      <span v-if="codigo" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-acento-ambar/15 text-acento-ambar-fuerte shrink-0">{{ codigo }}</span>
    </div>
    <!-- El nombre va fuera del <nav>: en «Hoy» también enlaza a la página actual, y la navegación debe tener una sola. -->
    <nav aria-label="Secciones de la clase">
      <!-- En el celular no caben las 8: el borde derecho se desvanece para mostrar que hay más, y la activa queda a la vista. -->
      <ul ref="lista" class="flex overflow-x-auto px-2 text-xs font-semibold pestanas-desvanecidas">
        <li v-for="p in PESTANAS_CLASE" :key="p.id" class="shrink-0">
          <NuxtLink
            :to="enlacePestana(p.id, classId)"
            :aria-current="p.id === activa ? 'page' : undefined"
            class="flex items-center gap-1.5 px-3 min-h-[44px] border-b-2 whitespace-nowrap transition-colors"
            :class="p.id === activa
              ? 'border-acento-ambar-fuerte text-acento-ambar-fuerte'
              : 'border-transparent text-base-texto-secundario hover:text-base-texto-primario'">
            <component :is="ICONOS[p.id]" :size="14" aria-hidden="true" />
            {{ p.texto }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BookOpen, CalendarCheck, ClipboardCheck, GraduationCap, Inbox, LifeBuoy, Settings, Users } from 'lucide-vue-next'
import { PESTANAS_CLASE, enlacePestana, type PestanaClase } from '~/utils/pestanasClase'

defineProps<{ classId: number; activa: PestanaClase; nombre?: string; codigo?: string }>()

const lista = ref<HTMLElement | null>(null)
onMounted(() => lista.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest' }))

const ICONOS = { hoy: CalendarCheck, contenido: BookOpen, estudiantes: Users, asistencia: ClipboardCheck, entregas: Inbox, refuerzos: LifeBuoy, notas: GraduationCap, ajustes: Settings }
</script>

<style scoped>
@media (max-width: 767px) {
  .pestanas-desvanecidas { mask-image: linear-gradient(to right, #000 85%, transparent); }
}
</style>
