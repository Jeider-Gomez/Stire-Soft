<template>
  <!-- Todas las medallas, por categoría: las obtenidas a color con su fecha; las que faltan en gris, con lo que hay que
       hacer y cuánto falta. Ver la meta y el camino motiva más que una sorpresa (criterios claros, como Moodle). -->
  <section v-if="!datos || datos.activos" id="logros" class="bg-base-blanco rounded-lg border border-base-borde-sutil p-5 shadow-sm space-y-4 scroll-mt-20" aria-labelledby="mis-logros-titulo">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="mis-logros-titulo" class="text-sm font-bold text-base-texto-primario">Mis logros</h2>
      <p v-if="datos" class="text-[11px] text-base-texto-secundario">{{ obtenidos }} de {{ datos.logros.length }} medallas · solo las ves tú</p>
    </div>
    <p v-if="!datos" class="text-xs text-base-texto-secundario">{{ error || 'Cargando…' }}</p>

    <div v-for="g in grupos" :key="g.categoria" class="space-y-2">
      <p class="text-xs font-semibold text-base-texto-primario">{{ g.nombre }} <span class="font-normal text-base-texto-secundario">· {{ g.sentido }}</span></p>
      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <li v-for="l in g.logros" :key="l.clave" class="flex items-start gap-2.5 rounded-lg border p-2.5" :class="l.obtenido ? 'border-base-borde-sutil' : 'border-dashed border-base-borde-sutil'">
          <EstudianteMedalla :categoria="l.categoria" :nivel="l.nivel" :obtenida="!!l.obtenido" :titulo="l.titulo" />
          <span class="min-w-0 text-xs">
            <span class="block font-semibold" :class="l.obtenido ? 'text-base-texto-primario' : 'text-slate-600'">
              {{ l.titulo }}<span v-if="l.nivel" class="font-normal text-base-texto-secundario"> · {{ NOMBRE_NIVEL[l.nivel] }}</span>
            </span>
            <span class="block text-[11px] text-base-texto-secundario">{{ l.descripcion }}</span>
            <span v-if="l.obtenido" class="block text-[10px] text-semantico-exito font-semibold mt-0.5">Obtenida el {{ fecha(l.obtenido) }}</span>
            <span v-else class="mt-1 flex items-center gap-1.5">
              <span class="h-1 flex-1 rounded-full bg-base-bg-secundario overflow-hidden" role="progressbar" :aria-valuenow="porcentajeLogro(l)" aria-valuemin="0" aria-valuemax="100" :aria-label="`Avance: ${textoProgreso(l)}`">
                <span class="block h-full rounded-full bg-acento-ambar-fuerte" :style="{ width: `${porcentajeLogro(l)}%` }" />
              </span>
              <span class="text-[10px] text-base-texto-secundario">{{ textoProgreso(l) }}</span>
            </span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { agruparLogros, NOMBRE_NIVEL, porcentajeLogro, textoProgreso, type RespuestaLogros } from '~/utils/logros'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const authStore = useAuthStore()
const datos = ref<RespuestaLogros | null>(null)
const error = ref('')
const grupos = computed(() => (datos.value ? agruparLogros(datos.value.logros) : []))
const obtenidos = computed(() => datos.value?.logros.filter((l) => l.obtenido).length ?? 0)
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })

onMounted(async () => {
  const id = authStore.user?.id
  if (!id) return
  try {
    datos.value = await api.get<RespuestaLogros>(`/analytics/student/${id}/logros`)
  } catch {
    error.value = 'No se pudieron cargar tus logros.'
  }
})
</script>
