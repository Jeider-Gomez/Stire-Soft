<template>
  <!-- Logros en «Mi progreso», en una línea: las medallas ganadas y la meta más cercana. La lista completa está en su
       propia pantalla (/estudiante/logros), como el perfil de Duolingo o Khan Academy: antes las 26 medallas, con sus
       barras, llenaban «Mi progreso» y tapaban lo importante (el dominio por lección). -->
  <section v-if="!datos || datos.activos" class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm space-y-3" aria-labelledby="resumen-logros-titulo">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 id="resumen-logros-titulo" class="text-sm font-bold text-base-texto-primario">Mis logros</h2>
      <NuxtLink to="/estudiante/logros" class="inline-flex items-center gap-1 min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline">
        Ver todos<span v-if="datos"> ({{ ganados.length }} de {{ datos.logros.length }})</span> <ArrowRight :size="13" aria-hidden="true" />
      </NuxtLink>
    </div>
    <p v-if="!datos" class="text-xs text-base-texto-secundario">{{ error || 'Cargando…' }}</p>
    <template v-else>
      <ul v-if="ganados.length" class="flex flex-wrap items-center gap-1.5" aria-label="Medallas que ya ganaste">
        <li v-for="l in visibles" :key="l.clave">
          <EstudianteMedalla :categoria="l.categoria" :nivel="l.nivel" :obtenida="true" :titulo="l.titulo" />
        </li>
        <li v-if="ganados.length > visibles.length" class="text-[11px] font-semibold text-base-texto-secundario pl-1">+{{ ganados.length - visibles.length }}</li>
      </ul>
      <p v-else class="text-xs text-base-texto-secundario">Todavía no tienes medallas. Se ganan practicando y repasando a tiempo.</p>
      <div v-if="datos.siguiente" class="flex items-center gap-3 text-[11px]">
        <span class="text-base-texto-primario min-w-0"><span class="font-semibold">Próxima:</span> {{ datos.siguiente.titulo }}</span>
        <span class="h-1.5 w-24 shrink-0 rounded-full bg-base-bg-secundario overflow-hidden" role="progressbar" :aria-valuenow="porcentajeLogro(datos.siguiente)" aria-valuemin="0" aria-valuemax="100" :aria-label="`Avance hacia ${datos.siguiente.titulo}: ${textoProgreso(datos.siguiente)}`">
          <span class="block h-full rounded-full bg-acento-ambar-fuerte" :style="{ width: `${porcentajeLogro(datos.siguiente)}%` }" />
        </span>
        <span class="text-base-texto-secundario whitespace-nowrap">{{ textoProgreso(datos.siguiente) }}</span>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { medallasGanadas, porcentajeLogro, textoProgreso, type RespuestaLogros } from '~/utils/logros'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const authStore = useAuthStore()
const datos = ref<RespuestaLogros | null>(null)
const error = ref('')
const ganados = computed(() => (datos.value ? medallasGanadas(datos.value.logros) : []))
// Una fila: en un celular caben unas ocho medallas sin partir la línea.
const visibles = computed(() => ganados.value.slice(0, 8))

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
