<template>
  <!-- Logros en el inicio, sin abrumar: si hay medallas nuevas, se celebran una vez; si no, la última. Y UNA meta: la
       más cercana, con su avance. El resto, en «Mi progreso». Sin ranking ni comparación (Hanus y Fox, 2015). -->
  <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm space-y-2.5" aria-labelledby="logros-inicio-titulo">
    <div class="flex items-center justify-between gap-2">
      <p id="logros-inicio-titulo" class="text-[11px] text-base-texto-secundario font-medium">Logros</p>
      <p v-if="datos" class="text-[10px] text-base-texto-secundario">{{ obtenidos }} de {{ datos.logros.length }} medallas</p>
    </div>

    <p v-if="!datos" class="text-xs text-base-texto-secundario">{{ error || 'Cargando…' }}</p>
    <template v-else>
      <!-- Medalla nueva: se celebra una sola vez -->
      <div v-if="nuevos.length" role="status" class="flex items-center gap-3 rounded-lg bg-acento-ambar/10 p-2.5">
        <EstudianteMedalla :categoria="nuevos[0].categoria" :nivel="nuevos[0].nivel" :obtenida="true" :titulo="nuevos[0].titulo" grande />
        <span class="min-w-0">
          <span class="block text-sm font-bold text-base-texto-primario">{{ textoNuevos(nuevos) }}</span>
          <span class="block text-[11px] text-base-texto-secundario">{{ nuevos.length === 1 ? nuevos[0].descripcion : nuevos.map((l) => l.titulo).join(' · ') }}</span>
        </span>
      </div>
      <div v-else-if="ultimo" class="flex items-center gap-2.5">
        <EstudianteMedalla :categoria="ultimo.categoria" :nivel="ultimo.nivel" :obtenida="true" :titulo="ultimo.titulo" />
        <span class="min-w-0 text-xs">
          <span class="block font-semibold text-base-texto-primario truncate">{{ ultimo.titulo }}</span>
          <span class="block text-[11px] text-base-texto-secundario">Tu medalla más reciente</span>
        </span>
      </div>

      <!-- La meta más cercana -->
      <div v-if="datos.siguiente" class="space-y-1">
        <p class="text-[11px] text-base-texto-primario"><span class="font-semibold">Próxima:</span> {{ datos.siguiente.titulo }} <span class="text-base-texto-secundario">· {{ textoProgreso(datos.siguiente) }}</span></p>
        <div class="h-1.5 rounded-full bg-base-bg-secundario overflow-hidden" role="progressbar" :aria-valuenow="porcentajeLogro(datos.siguiente)" aria-valuemin="0" aria-valuemax="100" :aria-label="`Avance hacia ${datos.siguiente.titulo}`">
          <div class="h-full rounded-full bg-acento-ambar-fuerte" :style="{ width: `${porcentajeLogro(datos.siguiente)}%` }" />
        </div>
        <p class="text-[10px] text-base-texto-secundario">{{ datos.siguiente.descripcion }}</p>
      </div>
      <NuxtLink to="/estudiante/progreso#logros" class="inline-flex items-center min-h-[44px] text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">Ver todos mis logros</NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { porcentajeLogro, textoNuevos, textoProgreso, ultimoLogro, type RespuestaLogros } from '~/utils/logros'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const authStore = useAuthStore()
const datos = ref<RespuestaLogros | null>(null)
const error = ref('')

const nuevos = computed(() => (datos.value ? datos.value.logros.filter((l) => datos.value!.nuevos.includes(l.clave)) : []))
const ultimo = computed(() => (datos.value ? ultimoLogro(datos.value.logros) : null))
const obtenidos = computed(() => datos.value?.logros.filter((l) => l.obtenido).length ?? 0)

onMounted(async () => {
  const id = authStore.user?.id
  if (!id) return
  try {
    datos.value = await api.get<RespuestaLogros>(`/analytics/student/${id}/logros`)
    // Ya se mostraron: la próxima vez no se vuelven a celebrar (pero siguen en «Mi progreso»).
    if (datos.value.nuevos.length) void api.post('/analytics/logros/vistos', {}).catch(() => undefined)
  } catch {
    error.value = 'No se pudieron cargar tus logros.'
  }
})
</script>
