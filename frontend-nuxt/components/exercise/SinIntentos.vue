<!-- Un ejercicio sin intentos ya no se puede entregar: en vez de dejar una pantalla que no sirve (07/10, Jeider), se dice
     y se ofrece a dónde seguir con el mismo recomendador de la ventana del resultado (utils/resultadoEntrega.ts).
     08/10: también al volver a un ejercicio YA APROBADO, para que se sepa que repetirlo es práctica.
     09/10: también en un «parecido» de uno ya resuelto, que no sube el dominio. Con motivo «revisar», el aviso sale de la
     lista de ejercicios de la lección (sirve también justo después de aprobarlo). -->
<template>
  <div v-if="aviso">
    <div role="status" class="rounded-lg border border-semantico-info/30 bg-semantico-info/5 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <p v-if="aviso === 'parecido'" class="flex-1 text-xs text-base-texto-primario">
        <strong>Este ejercicio ya no sube tu dominio.</strong> Ya resolviste uno parecido (mismo tipo y nivel) y cuenta el
        mejor. Sirve para repasar; para seguir subiendo, prueba uno que todavía sume.
      </p>
      <p v-else-if="aviso === 'completado'" class="flex-1 text-xs text-base-texto-primario">
        <strong>Ya completaste este ejercicio.</strong> Tu mejor resultado ya cuenta en tu dominio: repetirlo solo lo sube si
        ahora lo haces mejor, y si te equivocas, la lección vuelve antes a tus repasos. Para seguir subiendo, prueba otro.
      </p>
      <p v-else class="flex-1 text-xs text-base-texto-primario">
        <strong>Ya usaste los intentos de este ejercicio.</strong> Puedes leerlo cuanto quieras; para seguir sumando a tu dominio, practica con otro.
      </p>
      <div class="flex gap-2 shrink-0">
        <button type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia text-xs font-semibold bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario" @click="ir(acciones[1])">{{ acciones[1].texto }}</button>
        <button type="button" class="min-h-[44px] px-3 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco text-xs font-bold inline-flex items-center gap-1.5" @click="ir(acciones[0])">
          {{ acciones[0].texto }} <ArrowRight :size="14" aria-hidden="true" />
        </button>
      </div>
    </div>
    <!-- 09/10: pasar a la siguiente lección siempre es una opción (o qué falta, si su módulo está cerrado). -->
    <button v-if="aSiguiente" type="button" class="mt-1 min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1.5" @click="ir(aSiguiente)">
      {{ aSiguiente.texto }} <ArrowRight :size="14" aria-hidden="true" />
    </button>
    <p v-else-if="nota" class="mt-1 text-[11px] text-base-texto-secundario">{{ nota }}</p>
    <NuxtLink :to="`/estudiante/unidad/${learningUnitId}?ejercicios=1`" class="ml-3 min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1.5">
      <ListChecks :size="14" aria-hidden="true" /> Ver cuáles todavía suben tu dominio
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, ListChecks } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { accionesSinIntentos, avisoPorEstado, irASiguienteLeccion, notaModuloCerrado, type AccionResultado, type MotivoAviso, type RecomendacionSiguiente } from '~/utils/resultadoEntrega'
import { siguienteLeccion } from '~/utils/siguienteLeccion'

const props = defineProps<{ activityId: number; learningUnitId: number; motivo: MotivoAviso | 'revisar' }>()
const authStore = useAuthStore()
const { siguienteActividad, misEjercicios } = useUnidadEstudiante()
const desdeLista = ref<MotivoAviso | null>(null)
const aviso = computed(() => (props.motivo === 'revisar' ? desdeLista.value : props.motivo))

const recomendacion = ref<RecomendacionSiguiente | null>(null)
const acciones = computed(() => accionesSinIntentos(recomendacion.value, props.activityId))
const studentStore = useStudentStore()
const sig = computed(() => siguienteLeccion(studentStore.modules, studentStore.estadosModulos, props.learningUnitId))
const aSiguiente = computed(() => irASiguienteLeccion(sig.value))
const nota = computed(() => notaModuloCerrado(sig.value))

onMounted(async () => {
  const sid = authStore.user?.id
  if (!sid || !props.learningUnitId) return
  if (props.motivo === 'revisar') {
    try {
      desdeLista.value = avisoPorEstado((await misEjercicios(props.learningUnitId)).find((e) => e.id === props.activityId)?.estado)
    } catch {
      desdeLista.value = null // sin la lista no se avisa: el ejercicio funciona igual
    }
    if (!desdeLista.value) return
  }
  try {
    recomendacion.value = await siguienteActividad(sid, props.learningUnitId)
  } catch {
    recomendacion.value = null // sin recomendación se ofrece la lección
  }
})

function ir(a: AccionResultado) {
  if (a.tipo === 'ejercicio') return navigateTo(`/estudiante/evaluacion/${a.activityId}${a.reto ? '?reto=1' : ''}`)
  if (a.tipo === 'leccion') return navigateTo(`/estudiante/unidad/${props.learningUnitId}`)
  if (a.tipo === 'siguiente-leccion') return navigateTo(`/estudiante/unidad/${a.unitId}`)
  return navigateTo('/estudiante')
}
</script>
