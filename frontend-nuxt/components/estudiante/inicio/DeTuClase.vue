<!-- «De tu clase» (v3, Fase D; cuadro «E-Inicio»): lo que llega del docente y no es práctica: mensajes sin leer y
     entregas, primero las que faltan. Cada fila lleva a su pantalla. «Ver todo» llega con «Mi clase» (Fase D, paso 5). -->
<template>
  <section class="tarjeta-inicio" style="--acento: var(--c-sec-menta); --acento2: var(--c-sec-cielo)" aria-labelledby="titulo-de-tu-clase">
    <div class="flex items-center gap-2.5 mb-3">
      <h2 id="titulo-de-tu-clase" class="titulo-tarjeta">De tu clase</h2>
      <span v-if="entregas.length > 3" class="text-sm font-semibold text-base-texto-secundario">{{ entregas.length }} entregas</span>
    </div>

    <NuxtLink v-if="mensajes > 0" to="/estudiante/mensajes" class="fila-inicio">
      <span class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 icono-mensaje"><Mail :size="15" aria-hidden="true" /></span>
      <span class="flex-1">Tu docente te escribió</span>
      <span class="pastilla-inicio pastilla-tinta">{{ mensajes }} {{ mensajes === 1 ? 'nuevo' : 'nuevos' }}</span>
    </NuxtLink>

    <NuxtLink v-for="e in visibles" :key="e.id" :to="`/estudiante/entregas/${e.id}`" class="fila-inicio">
      <span class="flex-1 min-w-0">Entrega «{{ e.titulo }}»</span>
      <span class="pastilla-inicio" :class="PASTILLA[e.estado]">{{ estadoTexto(e) }}</span>
    </NuxtLink>

    <p v-if="!mensajes && !visibles.length" class="m-0 py-2 text-sm text-base-texto-secundario leading-relaxed">
      Aquí verás los mensajes y las entregas que te deje tu docente. Por ahora no hay nada nuevo.
    </p>
  </section>
</template>

<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
import { calificacionTexto, type EstadoEntrega } from '~/utils/entregas'
import type { EntregaInicioEstudiante } from '~/composables/useInicioEstudiante'

const props = defineProps<{ entregas: EntregaInicioEstudiante[]; mensajes: number }>()

/** Tres como mucho; arriba dice cuántas hay en total. */
const visibles = computed(() => props.entregas.slice(0, 3))
const PASTILLA: Record<EstadoEntrega, string> = { sin_entregar: 'pastilla-sol', revisada: 'pastilla-menta', por_revisar: 'pastilla-gris' }

function estadoTexto(e: EntregaInicioEstudiante): string {
  if (e.estado === 'revisada') return calificacionTexto(e.ultima) ? `Revisada · ${calificacionTexto(e.ultima)}` : 'Revisada'
  if (e.estado === 'por_revisar') return 'Entregada'
  if (!e.cierraAt) return 'Por entregar'
  const dias = Math.ceil((new Date(e.cierraAt).getTime() - Date.now()) / 86_400_000)
  if (dias < 0) return 'Cerrada'
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return `Vence el ${new Date(e.cierraAt).toLocaleDateString('es-CO', { weekday: 'long' })}`
}
</script>

<style scoped>
.icono-mensaje { background: rgb(var(--c-sec-lila-fondo)); color: rgb(var(--c-sec-lila-icono)); }
</style>
