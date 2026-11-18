<template>
  <!-- Competencias de la clase (P39; profesor Toscano, 28/10; cuadro «D3-Competencias»): el modo (apagadas, solo ver o
       elegir ejercicios), la ecuación a la vista, cómo va la clase en cada competencia, a quién le cuesta y qué ejercicios
       hay en el banco. Opcional, como toda función del docente: apagadas por defecto. -->
  <div class="max-w-7xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="competencias" :nombre="clase?.name" :codigo="clase?.code" />

    <header class="cabecera-docente">
      <div class="min-w-0">
        <h1 class="titulo-docente">Competencias</h1>
        <p class="detalle-docente">Qué sabe hacer cada uno: asignar, convertir tipos, usar arreglos… Tú decides si se usan.</p>
      </div>
      <div role="radiogroup" aria-label="Competencias en la clase" class="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-base-bg-secundario self-start">
        <button v-for="m in MODOS" :key="m.valor" type="button" role="radio" :aria-checked="datos?.modo === m.valor" :disabled="guardando"
          class="min-h-[40px] px-3.5 rounded-lg text-[13px] font-semibold"
          :class="datos?.modo === m.valor ? 'bg-base-texto-primario text-base-blanco' : 'text-base-texto-primario hover:bg-base-borde-sutil'"
          @click="cambiar(m.valor)">{{ m.texto }}</button>
      </div>
    </header>
    <p v-if="modoActual" class="-mt-3 text-[13px] text-base-texto-secundario" role="status">{{ modoActual.ayuda }}</p>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Calculando las competencias…
    </p>
    <MensajeError v-if="error" class="text-xs">{{ error }}</MensajeError>

    <template v-if="datos && datos.modo !== 'apagado'">
      <CompetenciasEcuacionNivel />

      <section class="tarjeta-competencias overflow-x-auto" aria-labelledby="tabla-competencias">
        <h2 id="tabla-competencias" class="sr-only">Cómo va la clase en cada competencia</h2>
        <p v-if="!datos.competencias.length" class="m-0 text-sm text-base-texto-secundario">Esta clase todavía no tiene ejercicios publicados con competencias.</p>
        <table v-else class="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr class="text-[11px] uppercase tracking-wide text-base-texto-secundario">
              <th scope="col" class="py-2 pr-3 font-bold">Competencia</th>
              <th scope="col" class="py-2 pr-3 font-bold">Nivel de la clase</th>
              <th scope="col" class="py-2 pr-3 font-bold">Quiénes</th>
              <th scope="col" class="py-2 font-bold">Ejercicios en el banco</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in datos.competencias" :key="c.id" class="border-t border-base-borde-sutil align-top" :class="CLASE_ESTADO[c.estado]">
              <td class="py-3 pr-3">
                <span class="block text-sm font-bold text-base-texto-primario">{{ c.nombre }}</span>
                <span class="block text-xs text-base-texto-secundario">{{ c.ejemplo }}</span>
              </td>
              <td class="py-3 pr-3"><span class="pastilla-nivel">{{ etiquetaNivel(c) }}</span></td>
              <td class="py-3 pr-3">
                <details v-if="c.enCamino.length">
                  <summary class="cursor-pointer min-h-[32px] font-semibold text-acento-ambar-fuerte">{{ c.enCamino.length }} en camino</summary>
                  <ul class="m-0 mt-1 p-0 list-none flex flex-wrap gap-1">
                    <li v-for="e in c.enCamino" :key="e.studentId">
                      <NuxtLink :to="`/docente/estudiante/${e.studentId}?clase=${classId}`" class="inline-flex px-2 py-1 rounded-full bg-base-bg-secundario hover:underline">
                        {{ e.nombre }} · {{ Math.round(e.nivel * 100) }} %
                      </NuxtLink>
                    </li>
                  </ul>
                </details>
                <span v-else class="text-base-texto-secundario">{{ resumenQuienes(c) }}</span>
              </td>
              <td class="py-3">
                <span v-if="c.banco.basico + c.banco.intermedio + c.banco.avanzado" class="flex flex-wrap gap-1">
                  <span class="pastilla-dificultad dif-basico">Básico {{ c.banco.basico }}</span>
                  <span class="pastilla-dificultad dif-intermedio">Interm. {{ c.banco.intermedio }}</span>
                  <span class="pastilla-dificultad dif-avanzado">Avanz. {{ c.banco.avanzado }}</span>
                </span>
                <span v-else class="text-base-texto-secundario">Sin ejercicios</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="datos.competencias.length" class="m-0 mt-3 text-xs text-base-texto-secundario">
          {{ datos.estudiantes }} {{ datos.estudiantes === 1 ? 'estudiante' : 'estudiantes' }}.
          <template v-if="datos.masBaja">La más baja de la clase: «{{ datos.masBaja }}».</template>
          Toca «en camino» para ver quiénes y abrir su ficha.
        </p>
      </section>

      <section class="tarjeta-competencias space-y-2" aria-labelledby="que-sigue-titulo">
        <h2 id="que-sigue-titulo" class="m-0 text-sm font-bold text-base-texto-primario">Qué ejercicio sigue {{ datos.modo === 'recomendar' ? '' : '(con «Elegir ejercicios»)' }}</h2>
        <ul class="m-0 p-0 list-none grid gap-2 sm:grid-cols-3 text-[13px]">
          <li class="estado-camino"><span class="pastilla-nivel">En camino</span> <span class="block mt-1">Uno básico de esa competencia y el enlace a la explicación.</span></li>
          <li class="estado-hace"><span class="pastilla-nivel">Lo hace</span> <span class="block mt-1">Uno intermedio, en un problema distinto.</span></li>
          <li class="estado-domina"><span class="pastilla-nivel">Lo domina</span> <span class="block mt-1">Uno avanzado o un reto; esta competencia deja de pedirse.</span></li>
        </ul>
        <p class="m-0 text-xs text-base-texto-secundario">
          El nivel se calcula desde los intentos; la autoevaluación del estudiante no entra. El dominio de cada lección sigue
          con su motor de siempre: no se mezclan.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { CLASE_ESTADO, MODOS, etiquetaNivel, type CompetenciaDeLaClase, type CompetenciasDeLaClase, type ModoCompetencias } from '~/utils/competencias'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const classId = Number(route.params.classId)
const competencias = useCompetencias()
const resumen = useResumenClase(classId)
const { messageOf } = useApiErrorMessage()

const clase = ref<{ name: string; code?: string } | null>(null)
const datos = ref<CompetenciasDeLaClase | null>(null)
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')

const modoActual = computed(() => MODOS.find((m) => m.valor === datos.value?.modo) ?? null)

function resumenQuienes(c: CompetenciaDeLaClase): string {
  const conEvidencia = c.porEstado['lo-hace'] + c.porEstado['lo-domina']
  if (conEvidencia === 0) return 'Nadie ha empezado'
  return `${conEvidencia} ya ${conEvidencia === 1 ? 'la hace' : 'la hacen'}`
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    datos.value = await competencias.deLaClase(classId)
  } catch (e: unknown) {
    error.value = messageOf(e, 'No se pudieron calcular las competencias.')
  } finally {
    cargando.value = false
  }
}

async function cambiar(modo: ModoCompetencias) {
  if (datos.value?.modo === modo) return
  guardando.value = true
  error.value = ''
  try {
    await competencias.cambiarModo(classId, modo)
    await cargar()
  } catch (e: unknown) {
    error.value = messageOf(e, 'No se pudo cambiar. Intenta de nuevo.')
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  resumen.clase<{ name: string; code?: string }>().then((c) => { clase.value = c }).catch(() => {})
  await cargar()
})
</script>
