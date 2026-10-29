<!-- La ventana del resultado de una entrega (07/10, prueba de Jeider como estudiante): dice qué pasó en palabras, cuánto
     se movió el dominio (también si bajó), cuándo vuelve la lección a los repasos y UN siguiente paso que sirve: otro
     ejercicio que elige el recomendador, intentar de nuevo si quedan intentos, o la lección. utils/resultadoEntrega.ts. -->
<template>
  <div class="fixed inset-0 bg-base-texto-primario/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div ref="ventana" role="dialog" aria-modal="true" aria-labelledby="resultado-titulo" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 max-w-md w-full shadow-2xl space-y-3 text-center max-h-[90dvh] overflow-y-auto overscroll-contain">
      <!-- MOD-03 (Jeider 17/10: «estamos saturando al estudiante»): arriba solo lo que importa en una mirada — cómo le
           fue, el puntaje y cuánto se movió el dominio —, luego lo que enseña (la retroalimentación) y el siguiente paso.
           Lo demás (casos, cuándo vuelve a los repasos, la meta del módulo) queda en «Más detalles», como Duolingo o Khan. -->
      <div class="flex items-center gap-3 text-left">
        <!-- El Tutor da la retroalimentación (26/10): celebra al aprobar y anima al fallar, nunca regaña. -->
        <TutorMascota :expresion="exito ? 'acierto' : 'animo'" :tamano="44" aria-hidden="true" />
        <div class="min-w-0">
          <h3 id="resultado-titulo" class="text-base font-bold text-base-texto-primario">{{ paso.titulo }}</h3>
          <p class="text-sm">
            <span class="font-bold" :class="exito ? 'text-semantico-pasa' : 'text-semantico-falla'">{{ r.totalScore ?? 0 }} / {{ maxScore }} pts</span>
            <span v-if="cambio" class="text-base-texto-secundario"> · {{ dominioCorto(ws.masteryBefore, ws.masteryAfter) }}</span>
          </p>
        </div>
      </div>

      <!-- Lo que dice el Tutor: qué pasó y lo que enseña el ejercicio (su retroalimentación), en su globo. -->
      <TutorGlobo cola="arriba" class="text-xs">
        <p>{{ paso.mensaje }}</p>
        <p v-if="r.feedback" class="mt-1.5">{{ r.feedback }}</p>
      </TutorGlobo>
      <!-- Opción múltiple (JEIDER-S08-11): al acertar, por qué; al fallar, qué repasar, sin la respuesta. -->
      <p v-for="x in retro" :key="x.tipo + x.texto" class="flex items-start gap-2 p-3 rounded-lg border text-xs text-left text-base-texto-primario"
        :class="x.tipo === 'porque' ? 'border-semantico-pasa/30 bg-semantico-pasa/5' : 'border-semantico-info/30 bg-semantico-info/5'">
        <component :is="x.tipo === 'porque' ? Lightbulb : BookOpen" :size="15" class="shrink-0 mt-0.5" :class="x.tipo === 'porque' ? 'text-semantico-pasa' : 'text-semantico-info'" aria-hidden="true" />
        <span><strong>{{ x.tipo === 'porque' ? 'Por qué es correcta:' : 'Qué repasar:' }}</strong> {{ x.texto }}</span>
      </p>
      <!-- META-02: lo que dijo antes de entregar contra lo que obtuvo. Solo en la entrega en la que lo dijo: en las
           siguientes ya no corresponde (07/10: seguía diciendo «acertaste» después de fallar). -->
      <p
        v-if="calibracion"
        class="flex items-start gap-2 p-2.5 rounded-lg border text-xs text-left text-base-texto-primario"
        :class="calibracion.tono === 'bien' ? 'border-semantico-pasa/30 bg-semantico-pasa/5' : 'border-acento-ambar-fuerte/30 bg-acento-ambar/5'">
        <Scale :size="15" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" />
        <span>{{ calibracion.texto }}</span>
      </p>

      <button
        v-if="!exito"
        id="oferta-tutor-resultado"
        type="button"
        class="w-full min-h-[44px] py-2 rounded-md bg-stire-purple text-white text-xs font-bold hover:opacity-90 inline-flex items-center justify-center gap-1.5"
        @click="$emit('tutor')">
        <Sparkles :size="14" aria-hidden="true" /> Que el Tutor me explique qué falló
      </button>

      <div class="flex flex-col-reverse sm:flex-row items-stretch gap-2">
        <button type="button" class="flex-1 min-h-[44px] py-2 rounded-md borde-afordancia text-xs font-semibold bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario" @click="hacer(paso.secundaria)">
          {{ paso.secundaria.texto }}
        </button>
        <button type="button" data-foco-inicial class="flex-1 min-h-[44px] py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco text-xs font-bold inline-flex items-center justify-center gap-1.5" @click="hacer(paso.primaria)">
          {{ paso.primaria.texto }} <ArrowRight :size="14" aria-hidden="true" />
        </button>
      </div>
      <!-- Pasar a la siguiente lección siempre es una opción (09/10); si su módulo está cerrado, se dice qué falta. -->
      <button v-if="paso.siguienteLeccion" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1.5" @click="hacer(paso.siguienteLeccion)">
        {{ paso.siguienteLeccion.texto }} <ArrowRight :size="14" aria-hidden="true" />
      </button>

      <details v-if="hayDetalles" class="text-left text-xs border-t border-base-borde-sutil pt-2">
        <summary class="min-h-[44px] flex items-center cursor-pointer font-semibold text-base-texto-secundario hover:text-base-texto-primario">Más detalles</summary>
        <div class="space-y-2 pt-1 text-base-texto-primario">
          <!-- Se cuentan preguntas (respuestas correctas), no casos de prueba; con 0 preguntas contadas no se muestra «0 de 0». -->
          <p v-if="esCodigo && (r.totalCount ?? 0) > 0">
            Resolviste bien {{ r.passedCount ?? 0 }} de {{ r.totalCount }} {{ r.totalCount === 1 ? 'ejercicio' : 'ejercicios' }} (con todos sus casos de prueba, también los ocultos).
          </p>
          <p v-if="cambio">{{ cambio.texto }}.</p>
          <p v-if="calidad" class="flex items-start gap-2">
            <ListChecks :size="15" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" />
            <span>{{ CUANDO_VUELVE[calidad] }}</span>
          </p>
          <EstudianteMetaDeLaLeccion v-if="ej.learningUnitId" :unit-id="ej.learningUnitId" solo-modulo class="text-left" />
          <p v-if="paso.nota" class="flex items-start gap-1.5 text-[11px] text-base-texto-secundario"><Lock :size="13" class="shrink-0 mt-0.5" aria-hidden="true" /> {{ paso.nota }}</p>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, BookOpen, Lightbulb, ListChecks, Lock, Scale, Sparkles } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspace'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { siguienteLeccion } from '~/utils/siguienteLeccion'
import { mensajeCalibracion } from '~/utils/confianza'
import { calidadDelResultado } from '~/utils/escalaResultados'
import { recordarFoco } from '~/utils/devolverFoco'
import { CUANDO_VUELVE, dominioCorto, intentosQueQuedan, pasoSiguiente, retroParaMostrar, textoCambioDominio, type AccionResultado, type RecomendacionSiguiente } from '~/utils/resultadoEntrega'

const props = defineProps<{ exito: boolean; reto: boolean }>()
defineEmits<{ tutor: [] }>()

const ws = useWorkspaceStore()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const { siguienteActividad } = useUnidadEstudiante()

const r = computed(() => ws.submissionResult!)
const ej = computed(() => ws.currentExercise)
const esCodigo = computed(() => ej.value.questionType === 'coding')
const maxScore = computed(() => r.value.maxScore ?? ej.value.maxScore)
const quedanIntentos = computed(() => intentosQueQuedan(ej.value))

const recomendacion = ref<RecomendacionSiguiente | null>(null)
// Ítem 11: el foco entra en el botón principal y vuelve al ejercicio al cerrar; Escape cierra y deja revisar el código.
const ventana = ref<HTMLElement | null>(null)
const devolver = recordarFoco()
onBeforeUnmount(devolver)
useEscapeToClose(() => ws.submissionResult !== null, () => { ws.submissionResult = null })
onMounted(async () => {
  nextTick(() => ventana.value?.querySelector<HTMLElement>('[data-foco-inicial]')?.focus())
  // El ejercicio usa otro layout: si se abrió directo (sin pasar por el plan), el plan se carga para saber qué lección sigue.
  if (!studentStore.hasLoaded) studentStore.fetchStudentData().catch(() => undefined)
  const sid = authStore.user?.id
  if (!sid || !ej.value.learningUnitId) return
  try {
    recomendacion.value = await siguienteActividad(sid, ej.value.learningUnitId)
  } catch {
    recomendacion.value = null // sin recomendación se ofrece la lección
  }
})

const sigLeccion = computed(() => siguienteLeccion(studentStore.modules, studentStore.estadosModulos, ej.value.learningUnitId))
const paso = computed(() => pasoSiguiente({ aprobado: props.exito, quedanIntentos: quedanIntentos.value, actividadActual: ej.value.activityId, recomendacion: recomendacion.value, siguienteLeccion: sigLeccion.value }))
const cambio = computed(() => textoCambioDominio(ws.masteryBefore, ws.masteryAfter))
const retro = computed(() => retroParaMostrar(r.value.retroalimentacion))
const calibracion = computed(() => (ws.calibracion && ej.value.usedAttempts === 1 ? mensajeCalibracion(ws.calibracion, esCodigo.value) : null))
/** Otra vez, Difícil, Bien o Fácil, con la misma regla que el servidor usa para sus repasos (calidadDeRepaso). */
const calidad = computed(() => r.value.status === 'graded'
  ? calidadDelResultado({ aprobado: props.exito, primerIntento: ej.value.usedAttempts === 1, seguro: ws.juicioConfianza === 'seguro' || props.reto })
  : null)

/** «Más detalles» solo si hay algo que poner dentro. */
const hayDetalles = computed(() => (esCodigo.value && (r.value.totalCount ?? 0) > 0) || !!cambio.value || !!calidad.value || !!ej.value.learningUnitId || !!paso.value.nota)

function hacer(a: AccionResultado) {
  ws.submissionResult = null
  if (a.tipo === 'ejercicio') return navigateTo(`/estudiante/evaluacion/${a.activityId}${a.reto ? '?reto=1' : ''}`)
  if (a.tipo === 'leccion') return navigateTo(`/estudiante/unidad/${ej.value.learningUnitId}`)
  if (a.tipo === 'siguiente-leccion') return navigateTo(`/estudiante/unidad/${a.unitId}`)
  if (a.tipo === 'inicio') return navigateTo('/estudiante')
}
</script>
