<template>
  <!-- Primeros pasos del estudiante (utils/primerosPasos.ts): cinco cosas para la primera semana, cada una se marca sola
       cuando se hace. Sale en el inicio hasta terminarlas o hasta que se oculte; el menú de ayuda la vuelve a mostrar. -->
  <section v-if="visible" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm p-5 space-y-4" aria-labelledby="primeros-pasos-titulo">
    <header class="flex items-start justify-between gap-3">
      <div class="space-y-1 min-w-0">
        <h2 id="primeros-pasos-titulo" class="text-base font-bold text-base-texto-primario">Primeros pasos en STIRE</h2>
        <p class="text-xs text-base-texto-secundario">{{ avance.hechos }} de {{ avance.total }} hechos. Cada paso se marca solo cuando lo haces.</p>
      </div>
      <button type="button" class="min-h-[44px] px-3 rounded-md text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario shrink-0" @click="ocultar">
        Ocultar
      </button>
    </header>

    <div class="h-2 rounded-full bg-base-bg-secundario overflow-hidden" aria-hidden="true">
      <div class="h-full rounded-full bg-semantico-pasa transition-[width] duration-500" :style="{ width: `${(avance.hechos / avance.total) * 100}%` }" />
    </div>

    <ol class="space-y-2">
      <li v-for="p in PRIMEROS_PASOS" :key="p.id" class="flex items-center gap-3">
        <CircleCheck v-if="hechos.includes(p.id)" :size="22" class="shrink-0 text-semantico-pasa" aria-hidden="true" />
        <Circle v-else :size="22" class="shrink-0 text-base-borde-fuerte" aria-hidden="true" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold" :class="hechos.includes(p.id) ? 'text-base-texto-secundario line-through' : 'text-base-texto-primario'">
            <span class="sr-only">{{ hechos.includes(p.id) ? 'Hecho: ' : 'Pendiente: ' }}</span>{{ p.texto }}
          </p>
          <p class="text-xs text-base-texto-secundario">{{ p.detalle }}</p>
        </div>
        <NuxtLink v-if="!hechos.includes(p.id)" :to="p.enlace" :target="p.enlace.startsWith('/ayuda') ? '_blank' : undefined"
          class="min-h-[44px] px-3 rounded-md borde-afordancia text-xs font-semibold text-acento-ambar-fuerte inline-flex items-center shrink-0">
          {{ p.enlace.startsWith('/ayuda') ? 'Cómo' : 'Ir' }}<span class="sr-only">: {{ p.texto }}{{ p.enlace.startsWith('/ayuda') ? ' (se abre el manual en otra pestaña)' : '' }}</span>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { Circle, CircleCheck } from 'lucide-vue-next'
import { PRIMEROS_PASOS } from '~/utils/primerosPasos'

const { hechos, avance, visible, ocultar, cargar } = usePrimerosPasos()
onMounted(cargar)
</script>
