<template>
  <section class="space-y-4" aria-labelledby="estadisticas-titulo">
    <h2 id="estadisticas-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
      <BarChart3 :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> {{ titulo }}
    </h2>
    <p v-if="cargando" class="text-xs text-base-texto-secundario">Cargando estadísticas…</p>
    <p v-else-if="error" class="text-xs text-base-texto-secundario">{{ error }}</p>

    <template v-else-if="e">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Calendario de actividad: ¿soy constante? -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2 text-xs">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="font-bold text-base-texto-primario">Constancia</h3>
            <span class="text-[11px] text-base-texto-secundario">{{ e.diasActivos }} {{ e.diasActivos === 1 ? 'día' : 'días' }} con práctica en 16 semanas</span>
          </div>
          <div class="overflow-x-auto">
            <div class="grid grid-flow-col grid-rows-7 gap-[3px] w-max" role="img" :aria-label="`Calendario de práctica: ${e.diasActivos} días con ejercicios en las últimas 16 semanas`">
              <span v-for="c in e.calendario" :key="c.dia" class="w-3 h-3 rounded-[2px]" :class="nivelCalendario(c.ejercicios)"
                :title="`${fechaDia(c.dia)}: ${c.ejercicios} ${c.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`"></span>
            </div>
          </div>
          <p class="flex items-center gap-1 text-[10px] text-base-texto-secundario" aria-hidden="true">
            Menos <span class="w-2.5 h-2.5 rounded-[2px] bg-base-bg-secundario border border-base-borde-sutil"></span><span class="w-2.5 h-2.5 rounded-[2px] bg-semantico-pasa/30"></span><span class="w-2.5 h-2.5 rounded-[2px] bg-semantico-pasa/60"></span><span class="w-2.5 h-2.5 rounded-[2px] bg-semantico-pasa"></span> Más
          </p>
        </div>

        <!-- Próximos repasos: ¿qué me viene? -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-2 text-xs">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="font-bold text-base-texto-primario">Próximos repasos</h3>
            <span class="text-[11px]" :class="e.vencidos ? 'text-semantico-falla font-semibold' : 'text-base-texto-secundario'">
              {{ e.vencidos ? `${e.vencidos} ${e.vencidos === 1 ? 'vencido' : 'vencidos'}, sumados a hoy` : 'Nada vencido' }}
            </span>
          </div>
          <div class="flex items-end gap-1 h-24" role="img" :aria-label="textoPronostico">
            <div v-for="(p, i) in e.pronostico" :key="p.dia" class="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
              <span v-if="p.repasos" class="text-[9px] font-semibold text-base-texto-secundario">{{ p.repasos }}</span>
              <span class="w-full rounded-t" :class="i === 0 ? 'bg-acento-ambar-fuerte' : 'bg-semantico-info/60'" :style="{ height: `${alturaBarra(p.repasos)}%` }"></span>
            </div>
          </div>
          <div class="flex gap-1 text-[9px] text-base-texto-secundario" aria-hidden="true">
            <span v-for="(p, i) in e.pronostico" :key="p.dia" class="flex-1 text-center">{{ i === 0 ? 'hoy' : Number(p.dia.slice(8)) }}</span>
          </div>
        </div>

        <!-- Estado de las lecciones: cuánto sé y cuánto está firme -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-3 text-xs">
          <h3 class="font-bold text-base-texto-primario">Tus lecciones</h3>
          <div v-if="e.lecciones.total" class="flex h-3 rounded-full overflow-hidden bg-base-bg-secundario" aria-hidden="true">
            <span v-for="s in segmentos" :key="s.clave" :class="s.color" :style="{ width: `${(s.valor / e.lecciones.total) * 100}%` }"></span>
          </div>
          <ul class="grid grid-cols-2 gap-x-3 gap-y-1">
            <li v-for="s in segmentos" :key="s.clave" class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-sm shrink-0" :class="s.color" aria-hidden="true"></span>
              <span class="text-base-texto-primario"><strong>{{ s.valor }}</strong> {{ s.texto }}</span>
            </li>
          </ul>
          <p class="text-[11px] text-base-texto-secundario">«Firme»: dominada y con el repaso a 21 días o más, como las tarjetas maduras de Anki.</p>
        </div>

        <!-- Retención: ¿recuerdo lo que dominé? -->
        <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-1 text-xs">
          <h3 class="font-bold text-base-texto-primario">Lo que recuerdas</h3>
          <p class="text-2xl font-bold" :class="e.retencion.porcentaje === null ? 'text-base-texto-secundario' : e.retencion.porcentaje >= 80 ? 'text-semantico-pasa' : 'text-acento-ambar-fuerte'">
            {{ e.retencion.porcentaje === null ? '—' : `${e.retencion.porcentaje} %` }}
          </p>
          <p class="text-[11px] text-base-texto-secundario">
            {{ e.retencion.repasos ? `Aprobaste ${e.retencion.aprobados} de ${e.retencion.repasos} repasos en los últimos 30 días.` : 'Aún no tienes repasos en los últimos 30 días.' }}
          </p>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
// Estadísticas al estilo de Anki (docs/DISENO_INTERVENCION_DOCENTE.md §10.3). Las ve el estudiante en «Mi progreso» y el
// docente en la ficha de cada estudiante.
import { computed, ref, watch } from 'vue'
import { BarChart3 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

const props = withDefaults(defineProps<{ studentId: number | null | undefined; classId: number | null | undefined; titulo?: string }>(), {
  titulo: 'Tus estadísticas',
})

interface Estadisticas {
  hoy: string
  calendario: Array<{ dia: string; ejercicios: number }>
  diasActivos: number
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

const maxPronostico = computed(() => Math.max(1, ...(e.value?.pronostico ?? []).map((p) => p.repasos)))
const alturaBarra = (n: number) => (n ? Math.max(8, Math.round((n / maxPronostico.value) * 100)) : 2)
const textoPronostico = computed(() => {
  const p = e.value?.pronostico ?? []
  const total = p.reduce((s, x) => s + x.repasos, 0)
  return `Próximos 14 días: ${total} repasos; hoy ${p[0]?.repasos ?? 0}.`
})

function nivelCalendario(n: number) {
  if (n === 0) return 'bg-base-bg-secundario border border-base-borde-sutil'
  if (n <= 2) return 'bg-semantico-pasa/30'
  if (n <= 5) return 'bg-semantico-pasa/60'
  return 'bg-semantico-pasa'
}

const fechaDia = (dia: string) => new Date(`${dia}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
</script>
