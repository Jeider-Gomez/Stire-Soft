<template>
  <!-- Mi nota en la clase (docs/DISENO_INTERVENCION_DOCENTE.md §6): solo si el docente decidió mostrarla. Primero de dónde
       sale cada parte y qué falta; la nota al final, sin compararla con la de nadie. -->
  <section v-if="datos?.visible" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-4" aria-labelledby="mi-nota-titulo">
    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
      <h2 id="mi-nota-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
        <GraduationCap :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> Tu nota en esta clase
      </h2>
      <p class="text-[11px] text-base-texto-secundario">Se aprueba con {{ notaComa(datos.notaAprobatoria) }}. Es la nota de STIRE; la oficial la sube tu docente.</p>
    </div>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
      <li v-for="c in datos.componentes" :key="c.clave" class="rounded-lg border border-base-borde-sutil p-3">
        <p class="font-semibold text-base-texto-primario">{{ c.nombre }} <span class="font-normal text-base-texto-secundario">· {{ c.peso }} %</span></p>
        <p class="text-lg font-bold mt-1" :class="c.nota === null ? 'text-base-texto-secundario' : 'text-base-texto-primario'">{{ c.nota === null ? 'Sin nota todavía' : notaComa(c.nota) }}</p>
        <p class="text-[11px] text-base-texto-secundario">{{ c.tipo === 'manual' ? (c.nota === null ? 'La pone tu docente.' : 'Puesta por tu docente.') : c.detalle }}</p>
      </li>
    </ul>
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-base-borde-sutil pt-3 text-xs">
      <span class="font-semibold text-base-texto-primario">{{ datos.ajustada ? 'Nota final (ajustada por tu docente)' : 'Nota con lo calificado hasta ahora' }}</span>
      <span class="text-2xl font-bold" :class="datos.aprueba === false ? 'text-semantico-falla' : 'text-base-texto-primario'">{{ datos.final === null ? '—' : notaComa(datos.final) }}</span>
      <span v-if="datos.faltan.length && !datos.ajustada" class="text-[11px] text-base-texto-secundario">Falta: {{ datos.faltan.join(', ') }}.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { GraduationCap } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { notaComa, type TipoComponente } from '~/utils/calificaciones'

const props = defineProps<{ classId: number | null | undefined }>()

type MiNota =
  | { visible: false }
  | {
      visible: true; notaAprobatoria: number; propuesta: number | null; faltan: string[]; ajustada: boolean; final: number | null; aprueba: boolean | null
      componentes: Array<{ clave: string; nombre: string; tipo: TipoComponente; peso: number; nota: number | null; detalle: string }>
    }

const api = useApi()
const datos = ref<MiNota | null>(null)

watch(() => props.classId, async (id) => {
  datos.value = null
  if (!id) return
  try {
    datos.value = await api.get<MiNota>(`/calificaciones/mia/${id}`)
  } catch {
    datos.value = null // sin nota visible: la sección no aparece
  }
}, { immediate: true })
</script>
