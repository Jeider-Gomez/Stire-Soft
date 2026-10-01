<template>
  <section class="space-y-4" aria-labelledby="mapa-calor-titulo">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
      <div>
        <h2 id="mapa-calor-titulo" class="text-sm font-bold text-base-texto-primario">¿A quién ayudo ahora?</h2>
        <p class="text-[11px] text-base-texto-secundario">
          Mapa de calor del grupo: cada fila es un estudiante y cada columna una lección. Haz clic en una celda para ver su detalle.
        </p>
      </div>
    </div>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario p-4 bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Calculando el mapa de calor…
    </p>
    <p v-else-if="error" role="alert" class="text-xs text-semantico-falla p-4 bg-base-blanco rounded-xl border border-semantico-falla/30">{{ error }}</p>

    <template v-else-if="mapa">
      <!-- Las cuatro preguntas del docente -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <article class="bg-base-blanco rounded-xl border border-semantico-falla/30 p-4 space-y-2">
          <h3 class="font-bold text-semantico-falla flex items-center gap-1.5">
            <AlertTriangle :size="14" aria-hidden="true" /> Bloqueados ({{ mapa.bloqueados.length }})
          </h3>
          <p class="text-[11px] text-base-texto-secundario">Tres o más entregas falladas seguidas en una lección, en los últimos 7 días.</p>
          <ul v-if="mapa.bloqueados.length" class="space-y-1">
            <li v-for="b in mapa.bloqueados" :key="`${b.studentId}-${b.unitId}`">
              <NuxtLink :to="`/docente/estudiante/${b.studentId}?clase=${classId}`" class="font-semibold text-base-texto-primario hover:underline">{{ b.fullName }}</NuxtLink>
              <span class="text-base-texto-secundario"> · {{ b.unitTitle }} · {{ b.fallosSeguidos }} fallos seguidos</span>
            </li>
          </ul>
          <p v-else class="text-[11px] text-base-texto-secundario">Nadie está bloqueado ahora.</p>
          <NuxtLink v-if="mapa.bloqueados.length" :to="enlaceNuevoRefuerzo(classId, 'refuerzo', mapa.bloqueados.map((b) => b.studentId), mapa.bloqueados.map((b) => b.unitId))"
            class="inline-flex items-center gap-1 font-bold text-semantico-falla hover:underline"><LifeBuoy :size="13" aria-hidden="true" /> Asignar un refuerzo</NuxtLink>
        </article>

        <article class="bg-base-blanco rounded-xl border border-acento-ambar/40 p-4 space-y-2">
          <h3 class="font-bold text-acento-ambar-fuerte flex items-center gap-1.5">
            <Flame :size="14" aria-hidden="true" /> Temas más difíciles
          </h3>
          <p class="text-[11px] text-base-texto-secundario">Menor dominio promedio entre quienes ya los trabajaron.</p>
          <ol v-if="mapa.temasDificiles.length" class="space-y-1 list-decimal pl-4">
            <li v-for="t in mapa.temasDificiles" :key="t.unitId">
              <span class="font-semibold text-base-texto-primario">{{ t.unitTitle }}</span>
              <span class="text-base-texto-secundario">
                · {{ t.dominioPromedio }} % de dominio · {{ plural(t.estudiantes, 'estudiante', 'estudiantes') }}
                <template v-if="t.entregasPorAcierto !== null"> · {{ decimal(t.entregasPorAcierto) }} {{ t.entregasPorAcierto === 1 ? 'entrega' : 'entregas' }} por acierto</template>
                <template v-else> · ningún acierto todavía</template>
              </span>
            </li>
          </ol>
          <p v-else class="text-[11px] text-base-texto-secundario">Todavía no hay entregas en esta clase.</p>
          <NuxtLink v-if="mapa.temasDificiles.length" :to="enlaceNuevoRefuerzo(classId, 'refuerzo', mapa.estudiantes.map((e) => e.id), [mapa.temasDificiles[0]!.unitId])"
            class="inline-flex items-center gap-1 font-bold text-acento-ambar-fuerte hover:underline"><LifeBuoy :size="13" aria-hidden="true" /> Reforzar «{{ mapa.temasDificiles[0]!.unitTitle }}» con todo el grupo</NuxtLink>
        </article>

        <article class="bg-base-blanco rounded-xl border border-semantico-info/30 p-4 space-y-2">
          <h3 class="font-bold text-semantico-info flex items-center gap-1.5">
            <HelpCircle :size="14" aria-hidden="true" /> Intentó saltar con un reto y falló ({{ mapa.segurosQueFallan.length }})
          </h3>
          <p class="text-[11px] text-base-texto-secundario">Puede haber una idea equivocada: son los errores que mejor se corrigen si alguien los explica.</p>
          <ul v-if="mapa.segurosQueFallan.length" class="space-y-1">
            <li v-for="s in mapa.segurosQueFallan" :key="`${s.studentId}-${s.unitId}`">
              <NuxtLink :to="`/docente/estudiante/${s.studentId}?clase=${classId}`" class="font-semibold text-base-texto-primario hover:underline">{{ s.fullName }}</NuxtLink>
              <span class="text-base-texto-secundario"> · {{ s.unitTitle }} · {{ plural(s.fallosAlPrimerIntento, 'fallo', 'fallos') }} al primer intento</span>
            </li>
          </ul>
          <p v-else class="text-[11px] text-base-texto-secundario">Nadie en esta situación.</p>
          <NuxtLink v-if="mapa.segurosQueFallan.length" :to="enlaceNuevoRefuerzo(classId, 'refuerzo', mapa.segurosQueFallan.map((s) => s.studentId), mapa.segurosQueFallan.map((s) => s.unitId))"
            class="inline-flex items-center gap-1 font-bold text-semantico-info hover:underline"><LifeBuoy :size="13" aria-hidden="true" /> Asignar un refuerzo</NuxtLink>
        </article>

        <article class="bg-base-blanco rounded-xl border border-semantico-pasa/30 p-4 space-y-2">
          <h3 class="font-bold text-semantico-pasa flex items-center gap-1.5">
            <Rocket :size="14" aria-hidden="true" /> Listos para más ({{ mapa.listosParaMas.length }})
          </h3>
          <p class="text-[11px] text-base-texto-secundario">85 % o más en todo lo que trabajaron (al menos 3 lecciones) y más del 90 % de sus ejercicios acertados al primer intento.</p>
          <ul v-if="mapa.listosParaMas.length" class="space-y-1">
            <li v-for="l in mapa.listosParaMas" :key="l.studentId">
              <NuxtLink :to="`/docente/estudiante/${l.studentId}?clase=${classId}`" class="font-semibold text-base-texto-primario hover:underline">{{ l.fullName }}</NuxtLink>
              <span class="text-base-texto-secundario"> · {{ plural(l.unidades, 'lección', 'lecciones') }}, mínimo {{ l.dominioMinimo }} %, {{ l.aciertoAlPrimerIntento }} % al primer intento</span>
            </li>
          </ul>
          <p v-else class="text-[11px] text-base-texto-secundario">Todavía nadie.</p>
          <NuxtLink v-if="mapa.listosParaMas.length" :to="enlaceNuevoRefuerzo(classId, 'reto', mapa.listosParaMas.map((l) => l.studentId))"
            class="inline-flex items-center gap-1 font-bold text-semantico-pasa hover:underline"><Rocket :size="13" aria-hidden="true" /> Asignar un reto</NuxtLink>
        </article>
      </div>

      <!-- La matriz -->
      <div v-if="mapa.estudiantes.length && mapa.unidades.length" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 space-y-3">
        <!-- relative: los textos sr-only (posición absoluta) de las celdas se posicionan aquí; sin esto escapaban del
             desplazamiento de la tabla y daban a toda la página 942 px de ancho en un teléfono. -->
        <div class="relative overflow-x-auto">
          <table class="text-[11px] border-separate" style="border-spacing: 3px">
            <caption class="sr-only">Dominio de cada estudiante en cada lección</caption>
            <thead>
              <tr>
                <th scope="col" class="sticky left-0 z-10 bg-base-blanco text-left font-semibold text-base-texto-secundario pr-2">Estudiante</th>
                <th v-for="(u, i) in mapa.unidades" :key="u.id" scope="col" :title="u.title"
                  class="w-11 min-w-[2.75rem] text-center font-mono font-semibold text-base-texto-secundario">
                  <abbr :title="u.title" class="no-underline">L{{ i + 1 }}</abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in mapa.estudiantes" :key="e.id">
                <th scope="row" class="sticky left-0 z-10 bg-base-blanco text-left font-semibold text-base-texto-primario pr-2 whitespace-nowrap max-w-[10rem] truncate">
                  {{ e.fullName }}
                </th>
                <td v-for="u in mapa.unidades" :key="u.id" class="p-0">
                  <NuxtLink
                    v-if="celda(e.id, u.id)"
                    :to="`/docente/estudiante/${e.id}?clase=${classId}`"
                    :aria-label="etiquetaCelda(e.fullName, u.title, celda(e.id, u.id)!)"
                    :title="etiquetaCelda(e.fullName, u.title, celda(e.id, u.id)!)"
                    class="flex h-8 items-center justify-center rounded font-mono font-bold focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                    :class="colorEstado(celda(e.id, u.id)!.status)">
                    {{ celda(e.id, u.id)!.mastery }}
                  </NuxtLink>
                  <span v-else class="flex h-8 items-center justify-center rounded bg-base-bg-secundario text-base-texto-secundario"
                    :title="`${e.fullName} · ${u.title}: sin empezar`">
                    <span aria-hidden="true">—</span><span class="sr-only">{{ e.fullName }}, {{ u.title }}: sin empezar</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Leyenda -->
        <ul class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-base-texto-secundario" aria-label="Leyenda de colores">
          <li v-for="l in LEYENDA" :key="l.estado" class="flex items-center gap-1.5">
            <span class="inline-block h-3 w-3 rounded" :class="colorEstado(l.estado)" aria-hidden="true"></span>{{ l.texto }}
          </li>
          <li class="flex items-center gap-1.5">
            <span class="inline-block h-3 w-3 rounded bg-base-bg-secundario" aria-hidden="true"></span>Sin empezar
          </li>
        </ul>
        <details class="text-[11px] text-base-texto-secundario">
          <summary class="cursor-pointer select-none font-semibold">Qué lección es cada columna</summary>
          <ol class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
            <li v-for="(u, i) in mapa.unidades" :key="u.id"><span class="font-mono font-semibold">L{{ i + 1 }}</span> · {{ u.title }}</li>
          </ol>
        </details>
      </div>
      <p v-else class="text-xs text-base-texto-secundario p-4 bg-base-blanco rounded-xl border border-base-borde-sutil">
        El mapa aparece cuando la clase tenga estudiantes y secciones publicadas.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AlertTriangle, Flame, HelpCircle, LifeBuoy, Loader2, Rocket } from 'lucide-vue-next'
import { enlaceNuevoRefuerzo } from '~/utils/refuerzos'
import { useApi } from '~/composables/useApi'
import { plural } from '~/utils/plural'

// Contrato de GET /analytics/class/:classId/heatmap (src/analytics/mapa-de-calor.ts).
interface Celda { studentId: number; unitId: number; mastery: number; status: string; confianza: number | null; entregas: number }
interface Mapa {
  unidades: Array<{ id: number; title: string; sectionTitle: string }>
  estudiantes: Array<{ id: number; fullName: string }>
  celdas: Celda[]
  bloqueados: Array<{ studentId: number; fullName: string; unitId: number; unitTitle: string; fallosSeguidos: number }>
  temasDificiles: Array<{ unitId: number; unitTitle: string; dominioPromedio: number; entregasPorAcierto: number | null; estudiantes: number }>
  listosParaMas: Array<{ studentId: number; fullName: string; unidades: number; dominioMinimo: number; aciertoAlPrimerIntento: number }>
  segurosQueFallan: Array<{ studentId: number; fullName: string; unitId: number; unitTitle: string; fallosAlPrimerIntento: number }>
}

const props = defineProps<{ classId: number | null }>()

const api = useApi()
const { messageOf } = useApiErrorMessage()
const mapa = ref<Mapa | null>(null)
const cargando = ref(false)
const error = ref<string | null>(null)

const porCelda = computed(() => new Map((mapa.value?.celdas ?? []).map((c) => [`${c.studentId}|${c.unitId}`, c])))
const celda = (studentId: number, unitId: number) => porCelda.value.get(`${studentId}|${unitId}`)

const NOMBRE_ESTADO: Record<string, string> = {
  dominado: 'Dominado',
  comprension_parcial: 'Comprensión parcial',
  en_practica: 'En práctica',
  explorado: 'Explorado',
  no_visto: 'Sin empezar'
}
const LEYENDA = [
  { estado: 'dominado', texto: 'Dominado (85 % o más)' },
  { estado: 'comprension_parcial', texto: 'Comprensión parcial' },
  { estado: 'en_practica', texto: 'En práctica' },
  { estado: 'explorado', texto: 'Explorado (menos de 20 %)' }
]
const CONFIANZA: Record<number, string> = { 1: 'respondió «Es nuevo para mí»', 2: 'respondió «Tengo dudas»', 3: 'intentó saltar con un reto' }

/** 1.2 → «1,2»: decimales con coma, como se escriben en español. */
const decimal = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 })

function colorEstado(estado: string): string {
  switch (estado) {
    case 'dominado': return 'bg-semantico-pasa text-base-blanco'
    case 'comprension_parcial': return 'bg-semantico-pasa/30 text-base-texto-primario'
    case 'en_practica': return 'bg-acento-ambar/40 text-base-texto-primario'
    case 'explorado': return 'bg-semantico-falla/25 text-base-texto-primario'
    default: return 'bg-base-bg-secundario text-base-texto-secundario'
  }
}

function etiquetaCelda(nombre: string, unidad: string, c: Celda): string {
  const partes = [`${nombre} · ${unidad}: ${c.mastery} % de dominio, ${NOMBRE_ESTADO[c.status] ?? c.status}`, plural(c.entregas, 'entrega', 'entregas')]
  if (c.confianza !== null && CONFIANZA[c.confianza]) partes.push(CONFIANZA[c.confianza])
  return partes.join(' · ')
}

async function cargar() {
  if (!props.classId) return
  const pedida = props.classId
  cargando.value = true
  error.value = null
  try {
    const res = await api.get<Mapa>(`/analytics/class/${pedida}/heatmap`)
    if (pedida === props.classId) mapa.value = res
  } catch (err) {
    if (pedida === props.classId) error.value = messageOf(err, 'No se pudo cargar el mapa de calor.')
  } finally {
    if (pedida === props.classId) cargando.value = false
  }
}

watch(() => props.classId, cargar, { immediate: true })
</script>
