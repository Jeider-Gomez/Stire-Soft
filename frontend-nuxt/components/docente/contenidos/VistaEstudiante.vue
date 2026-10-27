<template>
  <!-- «Ver como estudiante» (prototipo del panel v2): la lección tal como la ve el estudiante, solo con lo visible: las
       explicaciones publicadas en orden y la práctica publicada por grupo. Lo oculto o en borrador no aparece, y se dice. -->
  <section aria-labelledby="vista-estudiante-titulo" class="rounded-2xl border border-base-borde-sutil bg-base-blanco overflow-hidden">
    <div class="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-base-borde-sutil bg-stire-blue/5">
      <Eye :size="15" class="text-stire-blue" aria-hidden="true" />
      <h3 id="vista-estudiante-titulo" class="text-xs font-semibold text-stire-blue">Así la ve tu estudiante</h3>
      <span v-if="ocultas" class="text-[11px] text-base-texto-secundario">· {{ ocultas === 1 ? '1 explicación oculta no aparece' : `${ocultas} explicaciones ocultas no aparecen` }}</span>
    </div>
    <!-- Explicaciones alternativas: qué ve un estudiante según cómo le va. -->
    <div v-if="hayAlternativas" class="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-base-borde-sutil text-[11px]" role="radiogroup" aria-label="Situación del estudiante">
      <span class="text-base-texto-secundario">Un estudiante que</span>
      <button v-for="s in SITUACIONES" :key="s.valor" type="button" role="radio" :aria-checked="situacion === s.valor"
        class="min-h-[28px] px-2.5 rounded-full border font-semibold" :class="situacion === s.valor ? 'border-stire-blue bg-stire-blue text-base-blanco' : 'border-base-borde-sutil text-base-texto-primario hover:bg-base-bg-secundario'"
        @click="situacion = s.valor">{{ s.texto }}</button>
    </div>
    <div class="p-5 space-y-6">
      <h2 class="text-xl font-bold text-base-texto-primario">{{ titulo }}</h2>
      <p v-if="cargando" role="status" class="text-sm text-base-texto-secundario">Cargando…</p>
      <template v-else>
        <article v-for="x in visibles" :key="x.id" class="space-y-2" :class="esAlternativa(x.cuando) ? 'rounded-lg border-l-4 border-stire-blue bg-stire-blue/5 p-4' : ''">
          <p v-if="esAlternativa(x.cuando)" class="text-[11px] font-bold uppercase tracking-wider text-stire-blue">Otra forma de verlo · {{ textoCuando(x.cuando).toLowerCase() }}</p>
          <h3 class="text-sm font-semibold text-base-texto-primario">{{ x.title }}</h3>
          <!-- El mismo componente que la lección del estudiante (pages/estudiante/unidad/[id].vue), con sus insertados. -->
          <ContenidoLeccion :texto="x.body ?? ''" :insertados="insertadosDe(x.metadata)" class="text-sm text-base-texto-primario" />
        </article>
        <p v-if="!visibles.length" class="text-sm text-base-texto-secundario rounded-xl border border-dashed border-base-borde-fuerte px-3.5 py-3">
          Tu estudiante todavía no ve ninguna explicación en esta lección.
        </p>
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-base-texto-primario">Para practicar</h3>
          <ul v-if="practica.length" class="divide-y divide-base-borde-sutil rounded-xl border border-base-borde-sutil">
            <li v-for="a in practica" :key="a.id" class="flex items-center gap-3 px-3.5 py-2.5 text-sm">
              <PlayCircle :size="16" class="shrink-0 text-stire-blue" aria-hidden="true" />
              <span class="flex-1 min-w-0 truncate text-base-texto-primario">{{ a.title }}</span>
              <span class="text-[11px] text-base-texto-secundario">{{ a.activityType?.name || 'Práctica' }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-base-texto-secundario">No hay ejercicios publicados: tu estudiante no tiene con qué practicar aquí.</p>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { Eye, PlayCircle } from 'lucide-vue-next'
import { CLAVE_CONTENIDOS } from '~/composables/useContenidosCurso'
import { insertadosDe } from '~/utils/contenidoLeccion'
import { SITUACIONES, esAlternativa, laVe, textoCuando, type SituacionEstudiante } from '~/utils/explicacionesAlternativas'

const props = defineProps<{
  leccionId: number
  titulo: string
  actividades?: Array<{ id?: number; title?: string; status?: string | null; activityType?: { name?: string | null } | null }>
}>()
const estado = inject(CLAVE_CONTENIDOS)
const cargando = ref(true)
const todas = computed(() => estado?.explicaciones[props.leccionId] ?? [])
const situacion = ref<SituacionEstudiante>('entendio')
const hayAlternativas = computed(() => todas.value.some((x) => x.isVisible !== false && esAlternativa(x.cuando)))
const visibles = computed(() => todas.value.filter((x) => x.isVisible !== false && laVe(x.cuando, situacion.value)))
const ocultas = computed(() => todas.value.filter((x) => x.isVisible === false).length)
const practica = computed(() => (props.actividades ?? []).filter((a): a is { id: number; title: string; status: string; activityType?: { name?: string | null } | null } =>
  typeof a.id === 'number' && typeof a.title === 'string' && a.status === 'published'))
onMounted(async () => {
  if (estado) await estado.cargarExplicaciones(props.leccionId)
  cargando.value = false
})
</script>
