<template>
  <!-- Estadísticas al estilo de Anki, sin abrumar (BT-21): a la vista solo la racha y la semana; lo demás, plegado en
       «Ver más estadísticas» para quien quiera mirar. Las ve el estudiante en «Mi progreso» y el docente en la ficha. -->
  <section class="space-y-3" aria-label="Constancia y estadísticas">
    <p v-if="cargando" class="text-xs text-base-texto-secundario">Cargando estadísticas…</p>
    <p v-else-if="error" class="text-xs text-base-texto-secundario">{{ error }}</p>

    <template v-else-if="e">
      <!-- Racha: lo que más motiva a volver, y la semana en siete puntos -->
      <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex items-center gap-3 sm:min-w-[14rem]">
          <span class="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            :class="e.racha > 0 ? 'bg-acento-ambar/15 text-acento-ambar-fuerte' : 'bg-base-bg-secundario text-base-texto-secundario'">
            <Flame :size="22" aria-hidden="true" />
          </span>
          <div>
            <p class="text-xl font-bold text-base-texto-primario leading-tight">
              {{ e.racha }} {{ e.racha === 1 ? 'día' : 'días' }} <span class="text-sm font-semibold">de racha</span>
            </p>
            <p class="text-[11px]" :class="avisoRacha.urgente ? 'text-acento-ambar-fuerte font-semibold' : 'text-base-texto-secundario'">{{ avisoRacha.texto }}</p>
          </div>
        </div>
        <ol class="flex items-end gap-2 sm:ml-auto" :aria-label="`Últimos 7 días: ${semana.filter((d) => d.practico).length} con práctica`">
          <li v-for="d in semana" :key="d.dia" class="flex flex-col items-center gap-1 w-7">
            <span class="w-6 h-6 rounded-full flex items-center justify-center border"
              :class="d.practico ? 'bg-semantico-pasa border-semantico-pasa text-base-blanco' : d.esHoy ? 'border-acento-ambar-fuerte border-dashed' : 'border-base-borde-fuerte'">
              <Check v-if="d.practico" :size="13" aria-hidden="true" />
            </span>
            <span class="text-[10px]" :class="d.esHoy ? 'font-bold text-base-texto-primario' : 'text-base-texto-secundario'">{{ d.esHoy ? 'Hoy' : d.letra }}</span>
            <span class="sr-only">{{ d.practico ? 'con práctica' : 'sin práctica' }}</span>
          </li>
        </ol>
        <p v-if="e.rachaMaxima > e.racha" class="text-[11px] text-base-texto-secundario sm:border-l sm:border-base-borde-sutil sm:pl-4">
          Mejor racha<br class="hidden sm:block" /> <strong class="text-base-texto-primario">{{ e.rachaMaxima }} días</strong>
        </p>
      </div>

      <!-- Lo demás, para quien quiera mirar -->
      <details class="group bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm">
        <summary class="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-base-texto-primario flex items-center gap-2 min-h-[44px]">
          <BarChart3 :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Ver más estadísticas
          <ChevronDown :size="14" class="ml-auto transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 pt-0 text-xs">
          <!-- Constancia: 16 semanas -->
          <div class="rounded-lg border border-base-borde-sutil p-3 space-y-2">
            <div class="flex items-baseline justify-between gap-2">
              <h3 class="font-bold text-base-texto-primario">Últimos 4 meses</h3>
              <span class="text-[11px] text-base-texto-secundario">{{ e.diasActivos }} {{ e.diasActivos === 1 ? 'día' : 'días' }} con práctica</span>
            </div>
            <div class="overflow-x-auto">
              <div class="grid grid-flow-col grid-rows-7 gap-[3px] w-max" role="img" :aria-label="`Calendario de práctica: ${e.diasActivos} días con ejercicios en las últimas 16 semanas`">
                <span v-for="c in e.calendario" :key="c.dia" class="w-3 h-3 rounded-[2px]" :class="nivelCalendario(c.ejercicios)"
                  :title="`${fechaDia(c.dia)}: ${c.ejercicios} ${c.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`"></span>
              </div>
            </div>
          </div>

          <!-- Próximos repasos -->
          <div class="rounded-lg border border-base-borde-sutil p-3 space-y-2">
            <div class="flex items-baseline justify-between gap-2">
              <h3 class="font-bold text-base-texto-primario">Próximos repasos</h3>
              <span v-if="e.vencidos" class="text-[11px] text-semantico-falla font-semibold">{{ e.vencidos }} {{ e.vencidos === 1 ? 'vencido' : 'vencidos' }}, sumados a hoy</span>
            </div>
            <p v-if="totalPronostico === 0" class="text-[11px] text-base-texto-secundario">
              {{ docente ? 'No tiene repasos en las próximas dos semanas.' : 'No tienes repasos en las próximas dos semanas. Aparecen cuando dominas una lección.' }}
            </p>
            <template v-else>
              <div class="flex items-end gap-1 h-20" role="img" :aria-label="textoPronostico">
                <div v-for="(p, i) in e.pronostico" :key="p.dia" class="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                  <span v-if="p.repasos" class="text-[9px] font-semibold text-base-texto-secundario">{{ p.repasos }}</span>
                  <span class="w-full rounded-t" :class="i === 0 ? 'bg-acento-ambar-fuerte' : 'bg-semantico-info/60'" :style="{ height: `${alturaBarra(p.repasos)}%` }"></span>
                </div>
              </div>
              <div class="flex gap-1 text-[9px] text-base-texto-secundario" aria-hidden="true">
                <span v-for="(p, i) in e.pronostico" :key="p.dia" class="flex-1 text-center">{{ i === 0 ? 'hoy' : Number(p.dia.slice(8)) }}</span>
              </div>
            </template>
          </div>

          <!-- Estado de las lecciones -->
          <div class="rounded-lg border border-base-borde-sutil p-3 space-y-2">
            <h3 class="font-bold text-base-texto-primario">{{ docente ? 'Sus lecciones' : 'Tus lecciones' }}</h3>
            <div v-if="e.lecciones.total" class="flex h-2.5 rounded-full overflow-hidden bg-base-bg-secundario" aria-hidden="true">
              <span v-for="s in segmentos" :key="s.clave" :class="s.color" :style="{ width: `${(s.valor / e.lecciones.total) * 100}%` }"></span>
            </div>
            <ul class="grid grid-cols-2 gap-x-3 gap-y-1">
              <li v-for="s in segmentos" :key="s.clave" class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm shrink-0" :class="s.color" aria-hidden="true"></span>
                <span class="text-base-texto-primario"><strong>{{ s.valor }}</strong> {{ s.texto }}</span>
              </li>
            </ul>
            <p class="text-[11px] text-base-texto-secundario">«Firme»: dominada y repasada a 21 días o más; ya no se olvida fácil.</p>
          </div>

          <!-- Retención -->
          <div class="rounded-lg border border-base-borde-sutil p-3 space-y-1">
            <h3 class="font-bold text-base-texto-primario">{{ docente ? 'Lo que recuerda' : 'Lo que recuerdas' }}</h3>
            <template v-if="e.retencion.porcentaje !== null">
              <p class="text-xl font-bold" :class="e.retencion.porcentaje >= 80 ? 'text-semantico-pasa' : 'text-acento-ambar-fuerte'">{{ e.retencion.porcentaje }} %</p>
              <p class="text-[11px] text-base-texto-secundario">{{ docente ? 'Aprobó' : 'Aprobaste' }} {{ e.retencion.aprobados }} de {{ e.retencion.repasos }} repasos en los últimos 30 días.</p>
            </template>
            <p v-else class="text-[11px] text-base-texto-secundario">
              {{ docente ? 'Aparece cuando haga sus primeros repasos.' : 'Aparece cuando hagas tus primeros repasos: dice cuánto recuerdas de lo que ya dominaste.' }}
            </p>
          </div>
        </div>
      </details>
    </template>
  </section>
</template>

<script setup lang="ts">
// Estadísticas al estilo de Anki (docs/DISENO_INTERVENCION_DOCENTE.md §10.3), simplificadas (BT-21): racha y semana a
// la vista, el resto plegado.
import { computed, ref, watch } from 'vue'
import { BarChart3, Check, ChevronDown, Flame } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { avisoDeRacha, ultimaSemana } from '~/utils/racha'

const props = withDefaults(defineProps<{ studentId: number | null | undefined; classId: number | null | undefined; vista?: 'estudiante' | 'docente' }>(), {
  vista: 'estudiante',
})
const docente = computed(() => props.vista === 'docente')

interface Estadisticas {
  hoy: string
  calendario: Array<{ dia: string; ejercicios: number }>
  diasActivos: number
  racha: number
  rachaMaxima: number
  practicoHoy: boolean
  pronostico: Array<{ dia: string; repasos: number }>
  vencidos: number
  lecciones: { total: number; sinEmpezar: number; enPractica: number; dominadaReciente: number; dominadaFirme: number }
  retencion: { repasos: number; aprobados: number; porcentaje: number | null }
}

const api = useApi()
const e = ref<Estadisticas | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)

watch(() => [props.studentId, props.classId], async ([sid, cid]) => {
  if (!sid) return
  cargando.value = true
  error.value = null
  try {
    e.value = await api.get<Estadisticas>(`/learning-progress/student/${sid}/estadisticas${cid ? `?classId=${cid}` : ''}`)
  } catch {
    error.value = 'Las estadísticas no están disponibles por ahora.'
  } finally {
    cargando.value = false
  }
}, { immediate: true })

const semana = computed(() => (e.value ? ultimaSemana(e.value.calendario) : []))
const avisoRacha = computed(() => (e.value ? avisoDeRacha(e.value.racha, e.value.practicoHoy, docente.value) : { texto: '', urgente: false }))

const segmentos = computed(() => {
  const l = e.value?.lecciones
  if (!l) return []
  return [
    { clave: 'firme', valor: l.dominadaFirme, texto: 'dominadas firmes', color: 'bg-semantico-pasa' },
    { clave: 'reciente', valor: l.dominadaReciente, texto: 'dominadas recientes', color: 'bg-semantico-pasa/50' },
    { clave: 'practica', valor: l.enPractica, texto: 'en práctica', color: 'bg-acento-ambar-fuerte' },
    { clave: 'sin', valor: l.sinEmpezar, texto: 'sin empezar', color: 'bg-base-borde-fuerte' },
  ]
})

const totalPronostico = computed(() => (e.value?.pronostico ?? []).reduce((s, x) => s + x.repasos, 0))
const maxPronostico = computed(() => Math.max(1, ...(e.value?.pronostico ?? []).map((p) => p.repasos)))
const alturaBarra = (n: number) => (n ? Math.max(8, Math.round((n / maxPronostico.value) * 100)) : 2)
const textoPronostico = computed(() => `Próximos 14 días: ${totalPronostico.value} repasos; hoy ${e.value?.pronostico[0]?.repasos ?? 0}.`)

function nivelCalendario(n: number) {
  if (n === 0) return 'bg-base-bg-secundario border border-base-borde-sutil'
  if (n <= 2) return 'bg-semantico-pasa/30'
  if (n <= 5) return 'bg-semantico-pasa/60'
  return 'bg-semantico-pasa'
}

const fechaDia = (dia: string) => new Date(`${dia}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
</script>
