<template>
  <!-- Todas las medallas, por categoría: las obtenidas a color con su fecha; las que faltan en gris, con lo que hay que
       hacer y cuánto falta. Ver la meta y el camino motiva más que una sorpresa (criterios claros, como Moodle). Vive en
       su propia pantalla (/estudiante/logros); en «Mi progreso» solo va el resumen (ResumenLogros.vue). -->
  <section v-if="!datos || datos.activos" id="logros" class="bg-base-blanco rounded-lg border border-base-borde-sutil p-5 shadow-sm space-y-4 scroll-mt-20" aria-labelledby="mis-logros-titulo">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 id="mis-logros-titulo" class="text-xl font-bold text-base-texto-primario tracking-tight">Mis logros</h1>
        <p v-if="datos" class="text-xs text-base-texto-secundario">{{ obtenidos }} de {{ datos.logros.length }} medallas · solo las ves tú</p>
      </div>
      <!-- Filtro: un grupo de opciones, no pestañas (no cambia de panel, solo filtra la lista). -->
      <fieldset v-if="datos" class="flex rounded-md border border-base-borde-fuerte overflow-hidden text-xs">
        <legend class="sr-only">Mostrar</legend>
        <label v-for="o in FILTROS" :key="o.valor" class="cursor-pointer">
          <input v-model="filtro" type="radio" name="filtro-logros" :value="o.valor" class="peer sr-only" />
          <span class="inline-flex items-center min-h-[44px] px-3 font-semibold text-slate-700 peer-checked:bg-acento-ambar-fuerte peer-checked:text-base-blanco peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-acento-ambar-fuerte">{{ o.texto }}</span>
        </label>
      </fieldset>
    </div>
    <p v-if="!datos" class="text-xs text-base-texto-secundario">{{ error || 'Cargando…' }}</p>
    <p v-else-if="!grupos.length" class="text-xs text-base-texto-secundario">{{ filtro === 'ganados' ? 'Todavía no tienes medallas. Se ganan practicando y repasando a tiempo.' : '¡Ya tienes todas las medallas!' }}</p>

    <div v-for="g in grupos" :key="g.categoria" class="space-y-2">
      <h2 class="text-xs font-semibold text-base-texto-primario">{{ g.nombre }} <span class="font-normal text-base-texto-secundario">· {{ g.sentido }}</span></h2>
      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <li v-for="l in g.logros" :key="l.clave" class="flex items-start gap-2.5 rounded-lg border p-2.5" :class="l.obtenido ? 'border-base-borde-sutil' : 'border-dashed border-base-borde-sutil'">
          <EstudianteMedalla :categoria="l.categoria" :nivel="l.nivel" :obtenida="!!l.obtenido" :titulo="l.titulo" />
          <span class="min-w-0 text-xs">
            <span class="block font-semibold" :class="l.obtenido ? 'text-base-texto-primario' : 'text-slate-600'">
              {{ l.titulo }}<span v-if="l.nivel" class="font-normal text-base-texto-secundario"> · {{ NOMBRE_NIVEL[l.nivel] }}</span>
            </span>
            <span class="block text-[11px] text-base-texto-secundario">{{ l.descripcion }}</span>
            <span v-if="l.obtenido" class="block text-[10px] text-semantico-pasa font-semibold mt-0.5">Obtenida el {{ fecha(l.obtenido) }}</span>
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
import { agruparLogros, filtrarLogros, NOMBRE_NIVEL, porcentajeLogro, textoProgreso, type FiltroLogros, type RespuestaLogros } from '~/utils/logros'
import { useAuthStore } from '~/stores/auth'

const FILTROS: Array<{ valor: FiltroLogros; texto: string }> = [
  { valor: 'todos', texto: 'Todas' },
  { valor: 'ganados', texto: 'Ganadas' },
  { valor: 'faltan', texto: 'Por ganar' },
]

const api = useApi()
const authStore = useAuthStore()
const datos = ref<RespuestaLogros | null>(null)
const error = ref('')
const filtro = ref<FiltroLogros>('todos')
const grupos = computed(() => (datos.value ? agruparLogros(filtrarLogros(datos.value.logros, filtro.value)) : []))
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
