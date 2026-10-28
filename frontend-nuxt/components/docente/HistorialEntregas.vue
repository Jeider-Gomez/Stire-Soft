<template>
  <!-- Todas las entregas del estudiante, de la más nueva a la más antigua, de 20 en 20 (sugerencia n.º 12, Julio 16/10:
       la ficha solo mostraba las 5 más recientes). -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider">
        Historial de soluciones y entregas
      </h2>
      <p v-if="total" class="text-[11px] text-base-texto-secundario">{{ textoConteo(entregas.length, total) }}</p>
    </div>

    <MensajeError v-if="error" class="text-xs">{{ error }}</MensajeError>
    <p v-else-if="cargando && !entregas.length" class="text-xs text-base-texto-secundario">Cargando…</p>
    <div v-else-if="!entregas.length" class="text-xs text-base-texto-secundario italic py-4">
      El estudiante no ha enviado soluciones aún.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead class="bg-base-bg-secundario text-slate-600 border-b border-base-borde-sutil font-semibold">
          <tr>
            <th class="p-2.5">Actividad</th>
            <th class="p-2.5 hidden sm:table-cell">Fecha</th>
            <th class="p-2.5 text-center hidden sm:table-cell">Estado</th>
            <th class="p-2.5 text-right">Puntaje</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-base-borde-sutil">
          <tr v-for="sub in entregas" :key="sub.id" class="hover:bg-base-bg-secundario/40">
            <td class="p-2.5 font-semibold text-base-texto-primario">
              {{ sub.activityTitle }}
              <span class="block sm:hidden text-[11px] font-normal text-base-texto-secundario">{{ new Date(sub.createdAt).toLocaleString() }}</span>
            </td>
            <td class="p-2.5 text-[11px] text-base-texto-secundario hidden sm:table-cell">
              {{ new Date(sub.createdAt).toLocaleString() }}
            </td>
            <td class="p-2.5 text-center hidden sm:table-cell">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="sub.status === 'graded' ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                {{ estadoEntrega(sub.status) }}
              </span>
            </td>
            <td
              class="p-2.5 text-right font-bold"
              :class="sub.passed === true ? 'text-semantico-pasa' : sub.passed === false ? 'text-semantico-falla' : 'text-base-texto-secundario'">
              <template v-if="sub.status === 'graded'">{{ sub.score }} / {{ sub.maxScore ?? '—' }}</template>
              <template v-else>—</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      v-if="entregas.length < total"
      type="button"
      :disabled="cargando"
      class="w-full sm:w-auto min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50"
      @click="cargar(pagina + 1)">
      {{ cargando ? 'Cargando…' : 'Ver entregas anteriores' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { useRendimiento } from '~/composables/useRendimiento'
import { estadoEntrega, textoConteo, type EntregaFicha, type PaginaEntregas } from '~/utils/historialEntregas'

const props = defineProps<{ studentId: number }>()
const datos = useRendimiento()
const { messageOf } = useApiErrorMessage()

const entregas = ref<EntregaFicha[]>([])
const total = ref(0)
const pagina = ref(0)
const cargando = ref(false)
const error = ref<string | null>(null)

async function cargar(siguiente: number) {
  cargando.value = true
  error.value = null
  try {
    const res = await datos.entregas<PaginaEntregas>(props.studentId, siguiente)
    entregas.value = siguiente === 1 ? res.items : [...entregas.value, ...res.items]
    total.value = res.total
    pagina.value = res.pagina
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar el historial de entregas.')
  } finally {
    cargando.value = false
  }
}

watch(() => props.studentId, () => cargar(1), { immediate: true })
</script>
