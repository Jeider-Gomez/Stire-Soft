<template>
  <!-- «Mi clase» › Refuerzos y retos (v3, Fase D, paso 5; cuadro «E-Clase-Refuerzos»): lo que el profe dejó para ti. Un refuerzo
       es otra explicación con un ejercicio parecido; un reto, algo más difícil y opcional. Los terminados, aparte. Cada uno
       se abre en su pantalla (pages/estudiante/refuerzos/[id].vue). -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <EstudianteClaseCabecera />

    <p v-if="cargando" role="status" class="m-0 text-sm text-base-texto-secundario">Cargando…</p>
    <MensajeError v-else-if="error" class="text-sm" :reintentar="cargar">{{ error }}</MensajeError>

    <section v-else-if="!grupos.pendientes.length && !grupos.terminados.length" class="tarjeta-inicio text-center space-y-2" style="--acento: 255 201 77; --acento2: 0 194 168">
      <span class="flex justify-center" aria-hidden="true"><TutorMascota expresion="contento" :tamano="64" /></span>
      <h2 class="titulo-tarjeta">Nada pendiente de tu profe</h2>
      <p class="m-0 text-[15px] text-base-texto-secundario max-w-md mx-auto">Cuando tu profe te deje un refuerzo (otra explicación y un ejercicio parecido) o un reto, aparece aquí.</p>
    </section>

    <template v-else>
      <div class="grid gap-[18px] md:grid-cols-2 items-start">
        <NuxtLink v-for="r in grupos.pendientes" :key="r.id" :to="`/estudiante/refuerzos/${r.id}`" class="tarjeta-inicio tarjeta-refuerzo block"
          :style="r.tipo === 'reto' ? '--acento: 124 58 237; --acento2: 92 203 255' : '--acento: 255 201 77; --acento2: 0 194 168'">
          <span class="flex items-center gap-2 mb-1.5">
            <span class="pastilla-inicio" :class="r.tipo === 'reto' ? 'pastilla-lila' : 'pastilla-sol'">{{ r.tipo === 'reto' ? 'Reto' : 'Refuerzo' }}</span>
            <span class="text-[13px] text-base-texto-secundario">{{ cuando(r) }}</span>
          </span>
          <span class="block font-poppins font-bold text-[19px] leading-snug">{{ r.titulo }}</span>
          <span v-if="r.mensaje" class="globo-profe block mt-2.5 text-[15px] leading-relaxed">«{{ r.mensaje }}»</span>
          <span class="flex items-center gap-3 mt-3.5">
            <span class="flex-1 h-2 rounded-full bg-base-bg-secundario overflow-hidden" aria-hidden="true">
              <span class="block h-full rounded-full bg-[#00c2a8]" :style="{ width: `${r.totalPasos ? (r.pasosHechos / r.totalPasos) * 100 : 0}%` }" />
            </span>
            <span class="text-[13px] font-semibold">{{ r.pasosHechos }} de {{ r.totalPasos }} {{ r.totalPasos === 1 ? 'paso' : 'pasos' }}</span>
          </span>
          <span class="boton-practicar inline-flex mt-3.5 min-h-[44px]">
            {{ r.pasosHechos ? 'Seguir' : r.tipo === 'reto' ? 'Aceptar el reto' : 'Empezar' }} <ChevronRight :size="16" aria-hidden="true" />
          </span>
        </NuxtLink>
      </div>

      <section v-if="grupos.terminados.length" class="tarjeta-inicio" style="--acento: 0 194 168; --acento2: 92 203 255" aria-labelledby="titulo-terminados">
        <h2 id="titulo-terminados" class="m-0 mb-1.5 text-xs font-bold tracking-[0.06em] uppercase text-base-texto-secundario">Terminados</h2>
        <ul class="m-0 p-0 list-none">
          <li v-for="r in grupos.terminados" :key="r.id" class="border-t border-base-borde-sutil first:border-t-0">
            <NuxtLink :to="`/estudiante/refuerzos/${r.id}`" class="flex items-center gap-2.5 min-h-[44px] py-2 text-[15px]">
              <CheckCircle2 :size="17" class="shrink-0 texto-menta" aria-hidden="true" />
              <span class="flex-1 min-w-0 font-semibold truncate">{{ r.titulo }}</span>
              <span class="text-[13px] text-base-texto-secundario">{{ r.totalPasos }} de {{ r.totalPasos }} pasos</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronRight } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useInicioEstudiante, type RefuerzoInicioEstudiante } from '~/composables/useInicioEstudiante'
import { fechaCorta } from '~/utils/entregas'
import { ordenarRefuerzos } from '~/utils/miClase'

definePageMeta({ layout: 'student' })

const studentStore = useStudentStore()
const inicio = useInicioEstudiante()
const { messageOf } = useApiErrorMessage()
const todos = ref<RefuerzoInicioEstudiante[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const grupos = computed(() => ordenarRefuerzos(todos.value.filter((r) => r.classId === studentStore.currentClassId)))
const cuando = (r: RefuerzoInicioEstudiante) => (r.fechaLimite ? `Hasta el ${fechaCorta(r.fechaLimite)}` : r.tipo === 'reto' ? 'Opcional · sin fecha' : 'Sin fecha')

async function cargar() {
  error.value = null
  cargando.value = true
  try {
    todos.value = await inicio.refuerzos()
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar los refuerzos.')
  } finally {
    cargando.value = false
  }
}
onMounted(() => {
  if (!studentStore.hasLoaded) studentStore.fetchStudentData()
  cargar()
})
</script>

<style scoped>
.globo-profe { padding: 10px 14px; border-radius: 14px 14px 14px 4px; background: rgb(var(--c-sec-cielo-fondo)); }
.tarjeta-refuerzo { color: rgb(var(--c-base-texto-primario)); }
</style>
