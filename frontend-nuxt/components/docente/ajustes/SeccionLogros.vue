<template>
  <!-- Logros y medallas (docs/DISENO_LOGROS.md §6): activados por defecto; un interruptor y, si quiere, qué categorías.
       Los niveles (bronce, plata, oro) son fijos: el docente no tiene que pensar en números. -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="logros-titulo">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 id="logros-titulo" class="text-sm font-bold text-base-texto-primario">Logros y medallas</h2>
        <p class="text-[11px] text-base-texto-secundario mt-0.5">
          Cada estudiante gana medallas por aprender: dominar lecciones y módulos, resolver avanzados, no rendirse,
          repasar. Son privadas y sin ranking. Ya vienen listas; no tienes que configurar nada.
        </p>
      </div>
      <button type="button" :disabled="guardandoLogros" :aria-pressed="logrosActivos"
        class="min-h-[44px] px-3 rounded-md text-xs font-bold flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
        :class="logrosActivos ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario border border-base-borde-fuerte text-base-texto-primario'"
        @click="guardarLogros({ logrosActivos: !logrosActivos })">
        <Check v-if="logrosActivos" :size="12" aria-hidden="true" />
        {{ logrosActivos ? 'Activados' : 'Desactivados' }}
      </button>
    </div>
    <details v-if="logrosActivos" class="rounded-lg border border-base-borde-sutil">
      <summary class="min-h-[44px] flex items-center px-3 text-xs font-semibold text-base-texto-primario cursor-pointer">
        Elegir categorías <span class="ml-1 font-normal text-base-texto-secundario">({{ categoriasLogro.length === CATEGORIAS.length ? 'todas' : `${categoriasLogro.length} de ${CATEGORIAS.length}` }})</span>
      </summary>
      <div class="px-3 pb-3 space-y-1.5">
        <label v-for="c in CATEGORIAS" :key="c" class="flex items-start gap-2 min-h-[44px] py-1 text-xs cursor-pointer">
          <input type="checkbox" :checked="categoriasLogro.includes(c)" :disabled="guardandoLogros || (categoriasLogro.length === 1 && categoriasLogro.includes(c))" class="mt-0.5" @change="alternarCategoria(c)" />
          <span><span class="font-semibold text-base-texto-primario">{{ CATEGORIAS_LOGRO[c].nombre }}</span> <span class="text-base-texto-secundario">· {{ CATEGORIAS_LOGRO[c].sentido }}</span></span>
        </label>
        <p class="text-[11px] text-base-texto-secundario">Debe quedar al menos una. Para no usar logros, desactívalos arriba.</p>
      </div>
    </details>
    <p v-if="avisoLogros" role="status" class="text-xs" :class="avisoLogros.error ? 'text-semantico-falla' : 'text-semantico-pasa'">{{ avisoLogros.texto }}</p>
  </section>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { CATEGORIAS_LOGRO, categoriasElegidas, type CategoriaLogro } from '~/utils/logros'
import type { EstadoAjustesClase } from '~/composables/useAjustesClase'

/** «Logros y medallas» de Ajustes de la clase: activados por defecto; el docente solo los apaga o elige categorías. */
const props = defineProps<{ ajustes: EstadoAjustesClase }>()
const { classInfo } = props.ajustes
const { messageOf } = useApiErrorMessage()

const CATEGORIAS = Object.keys(CATEGORIAS_LOGRO) as CategoriaLogro[]
const logrosActivos = computed(() => classInfo.value?.logrosActivos ?? true)
const categoriasLogro = computed(() => categoriasElegidas(classInfo.value?.categoriasLogro))
const guardandoLogros = ref(false)
const avisoLogros = ref<{ texto: string; error: boolean } | null>(null)

async function guardarLogros(cambio: { logrosActivos?: boolean; categoriasLogro?: CategoriaLogro[] }) {
  guardandoLogros.value = true
  avisoLogros.value = null
  try {
    await props.ajustes.guardarLogros(cambio)
    avisoLogros.value = { texto: cambio.logrosActivos === false ? 'Guardado: esta clase no usa logros.' : 'Guardado.', error: false }
  } catch (err: unknown) {
    avisoLogros.value = { texto: messageOf(err, 'No se pudo guardar.'), error: true }
  } finally {
    guardandoLogros.value = false
  }
}

function alternarCategoria(c: CategoriaLogro) {
  const actuales = categoriasLogro.value
  const nuevas = actuales.includes(c) ? actuales.filter((x) => x !== c) : [...actuales, c]
  if (nuevas.length) void guardarLogros({ categoriasLogro: nuevas })
}
</script>
