<template>
  <!-- META-02 (Caro, 2015: juicios metacognitivos): lo que el estudiante dijo antes de entregar («¿Qué tan seguro
       estás?») contra lo que obtuvo, con el tiempo. Ver la propia calibración, con una lectura y UNA acción, mejora la
       precisión del monitoreo (Nietfeld, Cao y Osborne, 2006). docs/DISENO_CONFIANZA.md. -->
  <section class="bg-base-blanco rounded-lg border border-base-borde-sutil p-5 shadow-sm space-y-3" aria-labelledby="calibracion-titulo">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="calibracion-titulo" class="text-sm font-bold text-base-texto-primario inline-flex items-center gap-1.5">
        <Gauge :size="15" class="text-semantico-info" aria-hidden="true" />
        {{ docente ? 'Calibración: ¿sabe cuándo sabe?' : 'Mi calibración: ¿sé cuándo sé?' }}
      </h2>
      <p v-if="datos && datos.total" class="text-[11px] text-slate-600">{{ datos.total }} {{ datos.total === 1 ? 'juicio' : 'juicios' }} antes de entregar</p>
    </div>
    <p v-if="!datos" class="text-xs text-slate-600">{{ error || 'Cargando…' }}</p>
    <template v-else>
      <ul v-if="datos.total" class="space-y-2">
        <li v-for="n in NIVELES" :key="n" class="grid grid-cols-[8.5rem_1fr_auto] items-center gap-2 text-xs">
          <span class="text-base-texto-primario">«{{ NOMBRE_NIVEL_CONFIANZA[n] }}»</span>
          <span class="h-2 rounded-full bg-base-bg-secundario overflow-hidden" role="progressbar" :aria-valuenow="pct(n)" aria-valuemin="0" aria-valuemax="100"
            :aria-label="`${NOMBRE_NIVEL_CONFIANZA[n]}: ${textoNivel(n)}`">
            <span class="block h-full rounded-full bg-semantico-info" :style="{ width: `${pct(n)}%` }" />
          </span>
          <span class="text-[11px] text-slate-600 whitespace-nowrap">{{ textoNivel(n) }}</span>
        </li>
      </ul>
      <div class="rounded-lg bg-semantico-info/5 border border-semantico-info/25 p-3 space-y-1">
        <p class="text-xs font-semibold text-base-texto-primario">{{ lectura.titulo }}</p>
        <p class="text-[11px] text-slate-700">{{ lectura.consejo }}</p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Gauge } from 'lucide-vue-next'
import { lecturaCalibracion, lecturaParaDocente, NOMBRE_NIVEL_CONFIANZA, type Confianza, type ResumenCalibracion } from '~/utils/confianza'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ studentId?: number; docente?: boolean }>()
const api = useApi()
const authStore = useAuthStore()
const datos = ref<ResumenCalibracion | null>(null)
const error = ref('')
const NIVELES: Confianza[] = ['seguro', 'dudo', 'adivino']

const lectura = computed(() => (props.docente ? lecturaParaDocente : lecturaCalibracion)(datos.value?.sesgo ?? 'pocos-datos'))
const pct = (n: Confianza) => {
  const v = datos.value?.porNivel[n]
  return v && v.total ? Math.round((v.aciertos / v.total) * 100) : 0
}
const textoNivel = (n: Confianza) => {
  const v = datos.value?.porNivel[n]
  return v && v.total ? `${props.docente ? 'acertó' : 'acertaste'} ${v.aciertos} de ${v.total}` : 'sin datos'
}

onMounted(async () => {
  const id = props.studentId ?? authStore.user?.id
  if (!id) return
  try {
    datos.value = await api.get<ResumenCalibracion>(`/analytics/student/${id}/calibracion`)
  } catch {
    error.value = 'No se pudo cargar la calibración.'
  }
})
</script>
