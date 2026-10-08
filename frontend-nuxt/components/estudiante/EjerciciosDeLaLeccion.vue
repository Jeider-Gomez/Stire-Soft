<!-- «Ver todos los ejercicios» de una lección (08/10, Jeider): antes, una lista de nombres. Ahora, por nivel y de
     reconocer a crear, cada ejercicio dice con color, ícono Y texto si todavía sube tu dominio, su tipo, su nivel y cuánto
     pesa en la lección (GET /learning-progress/unit/:id/mis-ejercicios, src/learning-progress/ejercicios-leccion.ts). -->
<template>
  <div class="space-y-3">
    <p v-if="cargando" class="text-xs text-slate-700">Cargando ejercicios…</p>
    <p v-else-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <template v-else-if="ejercicios.length">
      <p class="text-[11px] text-base-texto-primario">
        <strong>{{ conteo.suben }}</strong> {{ conteo.suben === 1 ? 'ejercicio todavía sube' : 'ejercicios todavía suben' }} tu dominio ·
        {{ conteo.hechos }} {{ conteo.hechos === 1 ? 'hecho' : 'hechos' }}. Los «parecidos» (mismo tipo y nivel) cuentan como uno: vale el mejor.
      </p>
      <section v-for="g in grupos" :key="g.nivel" :aria-labelledby="`nivel-${g.nivel}`" class="space-y-1.5">
        <h3 :id="`nivel-${g.nivel}`" class="text-[11px] font-bold uppercase tracking-wide text-base-texto-secundario">Nivel {{ NIVEL[g.nivel] ?? g.nivel }}</h3>
        <ul class="space-y-1.5">
          <li v-for="e in g.ejercicios" :key="e.id">
            <NuxtLink
              :to="`/estudiante/evaluacion/${e.id}`"
              class="flex items-start gap-2.5 min-h-[44px] p-2.5 rounded-lg border bg-base-blanco hover:bg-base-bg-secundario"
              :class="e.subeDominio ? 'border-acento-ambar-fuerte/40' : 'border-base-borde-sutil'">
              <component :is="ESTADO[e.estado].icono" :size="16" class="shrink-0 mt-0.5" :class="ESTADO[e.estado].color" aria-hidden="true" />
              <span class="flex-1 min-w-0">
                <span class="block text-xs font-semibold text-base-texto-primario">{{ e.titulo }}</span>
                <span class="block text-[11px] text-base-texto-secundario">
                  {{ tipoDe(e.tipo) }} · pesa {{ e.pesoPct }} % de la lección<template v-if="e.parecidos > 1"> (con {{ e.parecidos - 1 }} {{ e.parecidos === 2 ? 'parecido' : 'parecidos' }})</template>
                  <template v-if="e.intentosUsados"> · {{ e.intentosPermitidos ? `${e.intentosUsados} de ${e.intentosPermitidos} intentos` : `${e.intentosUsados} intentos` }}</template>
                  <template v-if="e.mejorPct !== null"> · mejor nota {{ e.mejorPct }} %</template>
                </span>
              </span>
              <span class="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap" :class="ESTADO[e.estado].chip">{{ ESTADO[e.estado].texto }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
    <p v-else class="text-xs text-slate-700">Todavía no hay ejercicios publicados para esta lección.</p>
  </div>
</template>

<script setup lang="ts">
import { Ban, CheckCircle2, CircleDot, Copy, TrendingUp } from 'lucide-vue-next'
import { exerciseTypeInfo } from '~/utils/exerciseTypes'
import type { EjercicioLeccionEstudiante, EstadoEjercicioEstudiante } from '~/composables/useUnidadEstudiante'

const props = defineProps<{ unitId: number }>()
const { misEjercicios } = useUnidadEstudiante()

const ejercicios = ref<EjercicioLeccionEstudiante[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)

const NIVEL: Record<string, string> = { basico: 'básico', intermedio: 'intermedio', avanzado: 'avanzado' }
const ESTADO: Record<EstadoEjercicioEstudiante, { texto: string; icono: typeof TrendingUp; color: string; chip: string }> = {
  'por-hacer': { texto: 'Sube tu dominio', icono: TrendingUp, color: 'text-acento-ambar-fuerte', chip: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  'en-curso': { texto: 'Intentado: aún sube', icono: CircleDot, color: 'text-acento-ambar-fuerte', chip: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  hecho: { texto: 'Hecho', icono: CheckCircle2, color: 'text-semantico-pasa', chip: 'bg-semantico-pasa/10 text-semantico-pasa' },
  'cuenta-otro': { texto: 'Ya cuenta un parecido', icono: Copy, color: 'text-base-texto-secundario', chip: 'bg-base-bg-secundario text-base-texto-primario' },
  'sin-intentos': { texto: 'Sin intentos', icono: Ban, color: 'text-base-texto-secundario', chip: 'bg-base-bg-secundario text-base-texto-primario' },
}

const tipoDe = (t: string | null) => (t ? exerciseTypeInfo(t)?.name ?? t : 'Ejercicio')
const conteo = computed(() => ({ suben: ejercicios.value.filter((e) => e.subeDominio).length, hechos: ejercicios.value.filter((e) => e.estado === 'hecho').length }))
/** Ya vienen ordenados del servidor (nivel, y de reconocer a crear); aquí solo se agrupan por nivel. */
const grupos = computed(() => {
  const out: Array<{ nivel: string; ejercicios: EjercicioLeccionEstudiante[] }> = []
  for (const e of ejercicios.value) {
    const g = out.find((x) => x.nivel === e.nivel)
    if (g) g.ejercicios.push(e)
    else out.push({ nivel: e.nivel, ejercicios: [e] })
  }
  return out
})

onMounted(async () => {
  try {
    ejercicios.value = await misEjercicios(props.unitId)
  } catch {
    error.value = 'No se pudo cargar la lista de ejercicios. Prueba de nuevo en un momento.'
  } finally {
    cargando.value = false
  }
})
</script>
