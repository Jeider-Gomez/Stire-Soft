<template>
  <!-- «¿Te sirvió esta explicación?» (UI-04, Caro 2015: curaduría con la valoración del estudiante). Con «No», el Tutor la
       explica de otra forma y el docente ve qué lecciones no se entienden: el curso se mejora con el uso. -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" aria-labelledby="valorar-titulo">
    <div class="flex flex-wrap items-center gap-3">
      <h2 id="valorar-titulo" class="text-sm font-bold text-base-texto-primario flex-1 min-w-[12rem]">¿Te sirvió esta explicación?</h2>
      <div class="flex gap-2" role="group" aria-labelledby="valorar-titulo">
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-md border text-xs font-bold inline-flex items-center gap-1.5"
          :class="voto === true ? 'bg-semantico-pasa/10 border-semantico-pasa text-semantico-pasa' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'"
          :aria-pressed="voto === true"
          :disabled="guardando"
          @click="valorar(true)">
          <ThumbsUp :size="15" aria-hidden="true" /> Sí, me sirvió
        </button>
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-md border text-xs font-bold inline-flex items-center gap-1.5"
          :class="voto === false ? 'bg-red-50 border-red-300 text-red-700' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'"
          :aria-pressed="voto === false"
          :disabled="guardando"
          @click="valorar(false)">
          <ThumbsDown :size="15" aria-hidden="true" /> No me quedó claro
        </button>
      </div>
    </div>

    <p v-if="voto === true" role="status" class="text-xs text-slate-600">¡Gracias! Tu respuesta ayuda a tu docente a mejorar el curso.</p>

    <div v-if="voto === false" class="space-y-2">
      <label for="valorar-comentario" class="block text-xs font-semibold text-base-texto-primario">¿Qué no quedó claro? <span class="font-normal text-slate-600">(opcional; tu docente lo ve sin tu nombre)</span></label>
      <textarea id="valorar-comentario" v-model="comentario" v-crece rows="2" maxlength="300" class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-fuerte bg-base-blanco" placeholder="Por ejemplo: no entendí para qué sirve el contador" />
      <!-- UI-01 (Jeider 17/10): caminos distintos para no quedarse estancado, no solo el Tutor ni lo que ya está en la
           misma lección (utils/ayudaLeccion.ts). Siempre hay al menos tres: otro video, el docente y el Tutor. -->
      <p class="text-xs font-semibold text-base-texto-primario">Elige cómo seguir:</p>
      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <li v-for="op in opciones" :key="op.tipo">
          <button type="button" class="w-full h-full min-h-[44px] p-3 rounded-lg text-left text-xs flex items-start gap-2.5 transition-colors"
            :class="op.tipo === 'tutor' ? 'bg-stire-purple/10 border border-stire-purple/30 hover:bg-stire-purple/15' : 'borde-afordancia bg-base-blanco hover:bg-base-bg-secundario'"
            @click="elegir(op)">
            <component :is="ICONO[op.tipo]" :size="16" class="shrink-0 mt-0.5" :class="op.tipo === 'tutor' ? 'text-stire-purple' : 'text-acento-ambar-fuerte'" aria-hidden="true" />
            <span>
              <span class="block font-bold text-base-texto-primario">{{ op.titulo }}<span v-if="op.tipo === 'video'" class="sr-only"> (se abre en otra pestaña)</span></span>
              <span class="block text-slate-700">{{ op.detalle }}</span>
            </span>
          </button>
        </li>
      </ul>
      <button type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" :disabled="guardando" @click="valorar(false)">
        Solo avisar a mi docente que no quedó claro
      </button>
      <p v-if="enviado" role="status" class="text-xs text-slate-600">Enviado. Gracias: así tu docente sabe qué explicar mejor.</p>
    </div>
    <p v-if="error" role="alert" class="text-xs font-semibold text-red-700">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { formasDisponibles } from '~/utils/formasLeccion'
import { ejercicioSencillo, leccionAnterior, opcionesDeAyuda, type EjercicioParaAyuda, type OpcionAyuda, type TipoAyuda } from '~/utils/ayudaLeccion'
import { BookOpenCheck, Hammer, MessageCircle, MousePointerClick, CirclePlay, Sparkles, ThumbsDown, ThumbsUp, Video } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'
import { useStudentStore } from '~/stores/student'

const props = defineProps<{ unitId: number }>()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const tutorStore = useTutorStore()

const voto = ref<boolean | null>(null)
const comentario = ref('')
const guardando = ref(false)
const enviado = ref(false)
const error = ref<string | null>(null)
const studentStore = useStudentStore()
const { misEjercicios } = useUnidadEstudiante()
const ICONO: Record<TipoAyuda, typeof Sparkles> = { practicar: Hammer, anterior: BookOpenCheck, vivo: MousePointerClick, recurso: CirclePlay, video: Video, docente: MessageCircle, tutor: Sparkles }

// Al marcar «No me quedó claro» se miran las formas que la lección trae en la página y el ejercicio más sencillo.
const formas = ref<string[]>([])
const ejercicios = ref<EjercicioParaAyuda[]>([])
watch(voto, async (v) => {
  if (v !== false) return
  await nextTick()
  formas.value = formasDisponibles((sel) => !!document.querySelector(sel)).map((f) => f.selector)
  if (!ejercicios.value.length) ejercicios.value = await misEjercicios(props.unitId).catch(() => [])
}, { immediate: true })

const tituloLeccion = computed(() => studentStore.modules.flatMap((m) => m.units).find((u) => u.id === props.unitId)?.title ?? '')
const opciones = computed(() => opcionesDeAyuda({
  tituloLeccion: tituloLeccion.value,
  sencillo: ejercicioSencillo(ejercicios.value),
  anterior: leccionAnterior(studentStore.modules, props.unitId),
  hayVivo: formas.value.includes('[data-forma="vivo"]'),
  hayRecurso: formas.value.includes('[data-forma="recurso"]'),
}))

/** Cada camino guarda primero el «No» con el comentario, para que el docente lo vea aunque el estudiante se vaya. */
async function elegir(op: OpcionAyuda) {
  if (comentario.value.trim()) await valorar(false)
  if (op.tipo === 'tutor') return otraExplicacion()
  if (op.tipo === 'video') return void window.open(op.destino, '_blank', 'noopener')
  if (op.destino.startsWith('[')) return irA(op.destino)
  if (op.tipo === 'docente') {
    const duda = comentario.value.trim()
    return navigateTo({ path: '/estudiante/mensajes', query: { redactar: '1', texto: `No me quedó clara la lección «${tituloLeccion.value}».${duda ? ` ${duda}` : ''}` } })
  }
  return navigateTo(op.destino)
}

/** Lleva a esa parte de la lección y deja el foco ahí (el botón «Escuchar» se enfoca él mismo). */
function irA(selector: string) {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.focus({ preventScroll: true })
}

onMounted(async () => {
  try {
    const mia = await api.get<{ util: boolean; comentario: string | null } | null>(`/valoraciones/leccion/${props.unitId}/mia`)
    if (mia) { voto.value = mia.util; comentario.value = mia.comentario ?? '' }
  } catch { /* sin voto previo o sin conexión: se puede votar igual */ }
})

async function valorar(util: boolean) {
  guardando.value = true
  error.value = null
  enviado.value = false
  try {
    await api.put(`/valoraciones/leccion/${props.unitId}`, util ? { util } : { util, comentario: comentario.value.trim() || undefined })
    const yaEraNo = voto.value === false
    voto.value = util
    if (!util && yaEraNo) enviado.value = true
  } catch (e) {
    error.value = messageOf(e, 'No se pudo guardar tu respuesta. Intenta de nuevo.')
  } finally {
    guardando.value = false
  }
}

async function otraExplicacion() {
  if (voto.value !== false || comentario.value.trim()) await valorar(false)
  await tutorStore.pedirOtraExplicacion(comentario.value)
}
</script>
