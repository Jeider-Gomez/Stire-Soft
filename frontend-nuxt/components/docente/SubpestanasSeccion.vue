<template>
  <!-- Una sección del menú que agrupa dos pantallas («Asistencia y notas») las separa aquí adentro, en dos pestañas,
       en lugar de abrirlas debajo en el menú lateral: plegado, ese submenú no se veía y Notas quedaba sin camino
       (Jeider, 16/11). Son enlaces (cada una es su propia página), marcados con aria-current. -->
  <nav :aria-label="`Partes de ${titulo}`" class="subpestanas inline-flex gap-1 p-1 rounded-xl">
    <NuxtLink v-for="p in partes" :key="p" :to="enlacePestana(p, classId)" :aria-current="p === activa ? 'page' : undefined"
      class="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-[9px] text-sm font-bold transition-colors"
      :class="p === activa ? 'subpestana-activa' : 'text-base-texto-secundario hover:text-base-texto-primario'">
      <component :is="ICONOS[p]" :size="16" aria-hidden="true" />{{ TEXTO_PESTANA[p] }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ClipboardCheck, GraduationCap, QrCode } from 'lucide-vue-next'
import { enlacePestana, PESTANAS_CLASE, type PestanaClase } from '~/utils/pestanasClase'

defineProps<{ classId: number; activa: PestanaClase; partes: PestanaClase[]; titulo: string }>()
const TEXTO_PESTANA = Object.fromEntries(PESTANAS_CLASE.map((p) => [p.id, p.texto])) as Record<PestanaClase, string>
const ICONOS: Partial<Record<PestanaClase, typeof QrCode>> = { asistencia: QrCode, notas: GraduationCap, refuerzos: ClipboardCheck }
</script>

<style scoped>
.subpestanas { background: rgb(var(--c-base-bg-secundario)); }
.subpestana-activa { background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario)); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12); }
</style>
