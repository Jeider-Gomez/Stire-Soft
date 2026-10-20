<template>
  <!-- Errores que más se repiten esta semana (MOD-02, propuesta de Pedro 19/10): los de concepto, para explicarlos en clase,
       aparte de los descuidos de escritura, que se corrigen practicando. Cada error dice quién lo tiene, con enlace a su
       ficha y un refuerzo ya armado. Siempre visible, como las valoraciones, para que el docente sepa que existe. -->
  <section v-if="datos" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" aria-labelledby="errores-semana-titulo">
    <div>
      <h2 id="errores-semana-titulo" class="text-sm font-bold text-base-texto-primario">Errores que más se repiten esta semana</h2>
      <p class="text-xs text-slate-600">
        De los ejercicios de programar de los últimos 7 días. Los de concepto conviene explicarlos en clase; los de escritura se
        corrigen practicando. Toca un error para ver quién lo tiene.
      </p>
    </div>

    <p v-if="!datos.concepto.length && !datos.escritura.length" class="text-xs text-base-texto-primario bg-base-bg-secundario rounded-md p-3">
      Esta semana ningún error se ha repetido. Aparece aquí cuando el mismo error sale en 2 ejercicios o más.
    </p>

    <div v-for="grupo in grupos" :key="grupo.clave" class="space-y-1.5">
      <p class="text-xs font-semibold text-base-texto-primario">{{ grupo.titulo }}</p>
      <details v-for="e in grupo.errores" :key="e.tipo" class="rounded-lg border text-xs" :class="grupo.borde">
        <summary class="cursor-pointer list-none flex flex-wrap items-center gap-x-2 gap-y-0.5 p-2.5 min-h-[44px] sm:min-h-0">
          <ChevronRight :size="14" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
          <span class="font-semibold text-base-texto-primario">{{ e.nombre }}</span>
          <span class="text-[11px] text-slate-600">{{ cuantosConElError(e) }}</span>
        </summary>
        <div class="px-2.5 pb-2.5 space-y-2">
          <p class="text-slate-700">{{ e.detalle }}</p>
          <ul class="flex flex-wrap gap-1.5 text-[11px]" :aria-label="`Estudiantes con este error: ${e.nombre}`">
            <li v-for="est in e.estudiantes" :key="est.studentId">
              <NuxtLink :to="`/docente/estudiante/${est.studentId}?clase=${classId}`"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-base-bg-secundario text-base-texto-primario hover:underline">
                {{ est.nombre }}<span v-if="est.veces > 1" class="text-base-texto-secundario">· {{ est.veces }} veces</span>
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink :to="enlaceRefuerzoDeError(classId, e)"
            class="inline-flex items-center min-h-[44px] sm:min-h-0 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">
            Armar un refuerzo para {{ e.estudiantes.length === 1 ? 'este estudiante' : 'estos estudiantes' }}
          </NuxtLink>
        </div>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useResumenClase } from '~/composables/useResumenClase'
import { cuantosConElError, enlaceRefuerzoDeError, type ErroresSemana } from '~/utils/erroresSemana'

const props = defineProps<{ classId: number }>()
const resumen = useResumenClase(props.classId)
const datos = ref<ErroresSemana | null>(null)

const grupos = computed(() => [
  { clave: 'concepto', titulo: 'De concepto: para explicar en clase', borde: 'border-acento-ambar-fuerte/30 bg-acento-ambar/5', errores: datos.value?.concepto ?? [] },
  { clave: 'escritura', titulo: 'De escritura: se corrigen practicando', borde: 'border-base-borde-sutil', errores: datos.value?.escritura ?? [] },
].filter((g) => g.errores.length))

// Si la ruta no responde (por ejemplo, un servidor sin actualizar), la tarjeta no aparece y «Hoy» sigue igual.
onMounted(async () => {
  try { datos.value = await resumen.errores<ErroresSemana>() } catch { datos.value = null }
})
</script>
