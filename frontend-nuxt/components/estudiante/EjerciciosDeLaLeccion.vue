<!-- «Ver todos los ejercicios» de una lección. 08/10: cuáles suben el dominio. 09/10 (Jeider: «tengo un ejercicio y no
     puedo seguir subiendo mi dominio»; «métele más UX y UI»): con el motor del dominio del servidor, por nivel y por
     grupo de parecidos; cada grupo dice cuánto lleva y cada ejercicio CUÁNTO sube si lo resuelves, o cuándo se reabre.
     El que más sube va marcado como recomendado. Color + ícono + texto: nada depende solo del color (WCAG 1.4.1).
     utils/ejerciciosPorGrupo.ts; GET /learning-progress/unit/:id/mis-ejercicios. -->
<template>
  <div class="space-y-3">
    <p v-if="cargando" class="text-xs text-slate-700">Cargando ejercicios…</p>
    <p v-else-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <template v-else-if="ejercicios.length">
      <!-- A dónde ir: cuántos suben y el que más -->
      <div class="rounded-lg bg-base-blanco border border-base-borde-sutil p-3 space-y-1.5">
        <p class="text-xs font-semibold text-base-texto-primario flex items-center gap-1.5">
          <TrendingUp :size="15" class="text-acento-ambar-fuerte shrink-0" aria-hidden="true" /> {{ resumen }}
        </p>
        <NuxtLink v-if="mejor" :to="`/estudiante/evaluacion/${mejor.id}`"
          class="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco text-xs font-bold">
          El que más sube: {{ mejor.titulo }} (+{{ mejor.ganancia ?? 0 }} %) <ArrowRight :size="14" aria-hidden="true" />
        </NuxtLink>
        <p class="text-[11px] text-base-texto-secundario">
          Un ejercicio nuevo resuelto a la primera llena su grupo. Repetir el mismo suma poco y equivocarte baja un poco: variar es lo que más sube.
        </p>
      </div>

      <section v-for="n in niveles" :key="n.nivel" :aria-labelledby="`nivel-${n.nivel}`" class="space-y-2">
        <h3 :id="`nivel-${n.nivel}`" class="text-[11px] font-bold uppercase tracking-wide text-base-texto-secundario">Nivel {{ NIVEL[n.nivel] ?? n.nivel }}</h3>
        <div v-for="g in n.grupos" :key="g.clave" class="rounded-lg border border-base-borde-sutil bg-base-blanco overflow-hidden">
          <!-- El grupo: sus parecidos cuentan juntos -->
          <div class="flex items-center gap-2.5 px-3 py-2 bg-base-bg-secundario/60">
            <DocenteExerciseTypeIcon :type="g.tipo ?? ''" :size="15" />
            <span class="text-xs font-semibold text-base-texto-primario flex-1 min-w-0 truncate">{{ tipoDe(g.tipo) }}<span v-if="g.ejercicios.length > 1" class="font-normal text-base-texto-secundario"> · {{ g.ejercicios.length }} parecidos</span></span>
            <div class="w-20 h-1.5 rounded-full bg-base-blanco border border-base-borde-sutil overflow-hidden" role="progressbar" :aria-valuenow="g.casillaPct" aria-valuemin="0" aria-valuemax="100" :aria-label="`Grupo ${tipoDe(g.tipo)}: ${g.casillaPct} %`">
              <div class="h-full rounded-full transition-all duration-500" :class="g.casillaPct >= 100 ? 'bg-semantico-pasa' : 'bg-acento-ambar-fuerte'" :style="{ width: `${g.casillaPct}%` }" />
            </div>
            <span class="w-9 text-right text-[11px] font-bold tabular-nums" :class="g.casillaPct >= 100 ? 'text-semantico-pasa' : 'text-base-texto-primario'">{{ g.casillaPct }} %</span>
          </div>
          <ul class="divide-y divide-base-borde-sutil">
            <li v-for="e in g.ejercicios" :key="e.id">
              <NuxtLink :to="`/estudiante/evaluacion/${e.id}`"
                class="flex items-center gap-2.5 min-h-[48px] px-3 py-2 hover:bg-base-bg-secundario transition-colors"
                :class="mejor?.id === e.id ? 'ring-2 ring-inset ring-acento-ambar-fuerte/50' : ''">
                <component :is="ICONO[etiqueta(e).tipo]" :size="16" class="shrink-0" :class="COLOR[etiqueta(e).tipo]" aria-hidden="true" />
                <span class="flex-1 min-w-0">
                  <span class="block text-xs font-semibold text-base-texto-primario break-words">{{ e.titulo }}</span>
                  <span class="block text-[11px] text-base-texto-secundario">
                    <template v-if="mejor?.id === e.id">Recomendado · </template>{{ textoIntentos(e) }}
                  </span>
                </span>
                <span class="shrink-0 px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap tabular-nums" :class="CHIP[etiqueta(e).tipo]">{{ etiqueta(e).texto }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </section>
    </template>
    <p v-else class="text-xs text-slate-700">Todavía no hay ejercicios publicados para esta lección.</p>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, CheckCircle2, Clock, Copy, RotateCcw, TrendingUp } from 'lucide-vue-next'
import { exerciseTypeInfo } from '~/utils/exerciseTypes'
import { textoReabre } from '~/utils/resultadoEntrega'
import { agruparEjercicios, etiquetaDe, recomendado, resumenEjercicios, type EjercicioParaGrupo, type Etiqueta } from '~/utils/ejerciciosPorGrupo'
import type { EjercicioLeccionEstudiante } from '~/composables/useUnidadEstudiante'

const props = defineProps<{ unitId: number }>()
const { misEjercicios } = useUnidadEstudiante()

const ejercicios = ref<EjercicioLeccionEstudiante[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)

const NIVEL: Record<string, string> = { basico: 'básico', intermedio: 'intermedio', avanzado: 'avanzado' }
const ICONO: Record<Etiqueta['tipo'], typeof TrendingUp> = { sube: TrendingUp, repaso: RotateCcw, hecho: CheckCircle2, completo: Copy, reabre: Clock }
const COLOR: Record<Etiqueta['tipo'], string> = {
  sube: 'text-acento-ambar-fuerte', repaso: 'text-semantico-info', hecho: 'text-semantico-pasa', completo: 'text-base-texto-secundario', reabre: 'text-base-texto-secundario',
}
const CHIP: Record<Etiqueta['tipo'], string> = {
  sube: 'bg-acento-ambar/15 text-acento-ambar-fuerte',
  repaso: 'bg-semantico-info/10 text-semantico-info',
  hecho: 'bg-semantico-pasa/10 text-semantico-pasa',
  completo: 'bg-base-bg-secundario text-base-texto-primario',
  reabre: 'bg-base-bg-secundario text-base-texto-primario',
}

const tipoDe = (t: string | null) => (t ? exerciseTypeInfo(t)?.name ?? t : 'Ejercicio')
const etiqueta = (e: EjercicioParaGrupo) => etiquetaDe(e, textoReabre)
const textoIntentos = (e: EjercicioParaGrupo) =>
  e.intentosUsados === 0 ? 'Sin intentar' : e.intentosPermitidos ? `${e.intentosUsados} de ${e.intentosPermitidos} intentos` : `${e.intentosUsados} intentos`
const niveles = computed(() => agruparEjercicios(ejercicios.value))
const mejor = computed(() => recomendado(ejercicios.value))
const resumen = computed(() => resumenEjercicios(ejercicios.value, textoReabre))

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
