<template>
  <!-- «Cómo avanzas en STIRE» (pedido del dueño, 04/10: «que el estudiante sea consciente de cómo funciona STIRE y de cómo
       puede mejorar»). Reemplaza la tarjeta «Mi calibración», que no se entendía. Tres cosas, en palabras, con sus
       datos: qué hace subir el dominio, cómo quedó cada resultado (como los botones de Anki, pero los decide el
       ejercicio) y cómo avanzar más rápido con un reto. Al final, si su seguridad antes de entregar coincide con sus
       resultados (META-02; Nietfeld, Cao y Osborne, 2006), en una frase. -->
  <section class="bg-base-blanco rounded-lg border border-base-borde-sutil p-5 shadow-sm space-y-4" aria-labelledby="como-avanzas-titulo">
    <div>
      <h2 id="como-avanzas-titulo" class="text-sm font-bold text-base-texto-primario">Cómo avanzas en STIRE</h2>
      <p class="text-[11px] text-base-texto-secundario">Lo que sube tu dominio, cuándo vuelve cada lección y cómo ir más rápido.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
      <div class="rounded-lg bg-base-bg-secundario p-3 space-y-1">
        <p class="font-semibold text-base-texto-primario inline-flex items-center gap-1.5"><TrendingUp :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" /> Tu dominio sube practicando</p>
        <p class="text-slate-700">Cada ejercicio que apruebas suma a su lección. Desde 85 % la lección queda dominada, y vuelve de vez en cuando como repaso para que no se te olvide.</p>
      </div>

      <div class="rounded-lg bg-base-bg-secundario p-3 space-y-2">
        <p class="font-semibold text-base-texto-primario inline-flex items-center gap-1.5"><ListChecks :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" /> Cada resultado cuenta, como en Anki</p>
        <ul class="grid grid-cols-2 gap-1.5" aria-label="Tus resultados de los últimos 30 días">
          <li v-for="c in ORDEN_CALIDADES" :key="c" class="rounded-md bg-base-blanco border border-base-borde-sutil px-2 py-1">
            <span class="block font-bold text-base-texto-primario">{{ CALIDADES[c].texto }} <span class="tabular-nums">{{ datos?.escala?.[c] ?? '—' }}</span></span>
            <span class="block text-[10px] text-base-texto-secundario">{{ CALIDADES[c].significa }}</span>
          </li>
        </ul>
        <p class="text-[11px] text-slate-700">Últimos 30 días. {{ EFECTO_EN_REPASOS }}</p>
      </div>

      <div class="rounded-lg bg-base-bg-secundario p-3 space-y-1">
        <p class="font-semibold text-base-texto-primario inline-flex items-center gap-1.5"><Zap :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" /> ¿Te sientes seguro? Toma un reto</p>
        <p class="text-slate-700">En cada lección, «Tomar un reto» te da un ejercicio del nivel siguiente. Si lo resuelves a la primera, lo de abajo deja de exigirse y tu dominio sube más rápido. Si no, no pierdes nada: sigues donde ibas.</p>
      </div>
    </div>

    <!-- META-02, en una frase -->
    <div class="rounded-lg border border-semantico-info/25 bg-semantico-info/5 p-3 text-xs space-y-1" aria-labelledby="calibracion-titulo">
      <p id="calibracion-titulo" class="font-semibold text-base-texto-primario inline-flex items-center gap-1.5"><Gauge :size="14" class="text-semantico-info" aria-hidden="true" /> ¿Tu seguridad acierta?</p>
      <p v-if="!datos" class="text-slate-700">{{ error || 'Cargando…' }}</p>
      <template v-else>
        <p class="text-slate-700">{{ fraseSeguridad }}</p>
        <p class="text-slate-700">{{ lectura.consejo }}</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Gauge, ListChecks, TrendingUp, Zap } from 'lucide-vue-next'
import { lecturaCalibracion, type ResumenCalibracion } from '~/utils/confianza'
import { CALIDADES, EFECTO_EN_REPASOS, ORDEN_CALIDADES, type NombreCalidad } from '~/utils/escalaResultados'
import { useAuthStore } from '~/stores/auth'

const api = useApi()
const authStore = useAuthStore()
/** `escala` falta en un servidor de antes de este cambio: entonces se muestra «—». */
const datos = ref<(ResumenCalibracion & { escala?: Record<NombreCalidad, number> }) | null>(null)
const error = ref('')

const lectura = computed(() => lecturaCalibracion(datos.value?.sesgo ?? 'pocos-datos'))
/** Lo que pasó cuando dijo «Estoy seguro», contado; si aún no hay datos, cómo se llenan. */
const fraseSeguridad = computed(() => {
  const s = datos.value?.porNivel.seguro
  if (!datos.value || datos.value.sesgo === 'pocos-datos' || !s?.total) return lectura.value.titulo
  return `${lectura.value.titulo} Cuando dijiste «Estoy seguro», acertaste ${s.aciertos} de ${s.total}.`
})

onMounted(async () => {
  const id = authStore.user?.id
  if (!id) return
  try {
    datos.value = await api.get<ResumenCalibracion & { escala?: Record<NombreCalidad, number> }>(`/analytics/student/${id}/calibracion`)
  } catch {
    error.value = 'No se pudo cargar.'
  }
})
</script>
