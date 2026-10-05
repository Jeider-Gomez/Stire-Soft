<template>
  <!-- Repasos (EST-V05; crítica de diseño del 05/10). Antes todo salía en rojo como «crítico», con seis botones
       iguales, un párrafo técnico repetido en cada tarjeta y un tiempo fijo. Ahora: uno para empezar, el resto en
       lista, el tiempo calculado y la razón dicha una sola vez, en palabras. -->
  <div class="max-w-3xl mx-auto space-y-5">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-1">
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Repasos de hoy</h1>
      <p v-if="lista.length" class="text-sm font-semibold text-base-texto-primario">
        {{ lista.length }} {{ lista.length === 1 ? 'repaso' : 'repasos' }} · {{ tiempoTotal(lista) }}
      </p>
      <p class="text-xs text-base-texto-secundario">
        Repasar justo cuando empiezas a olvidar hace que lo recuerdes por más tiempo. Cada repaso es un ejercicio corto de una lección que ya practicaste.
      </p>
    </header>

    <template v-if="lista.length">
      <!-- Por dónde empezar: una sola acción principal -->
      <section class="rounded-xl border border-acento-ambar-fuerte/40 bg-acento-ambar/5 p-5 space-y-3" aria-labelledby="empezar-titulo">
        <p id="empezar-titulo" class="text-[11px] font-bold uppercase tracking-wider text-acento-ambar-fuerte">Empieza por aquí</p>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1 min-w-0">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold" :class="ESTILO_URGENCIA[primero.urgency]">
              <component :is="ICONO[primero.urgency]" :size="12" aria-hidden="true" /> {{ primero.urgencyLabel }}
            </span>
            <h2 class="text-base font-bold text-base-texto-primario">{{ primero.conceptTitle }}</h2>
          </div>
          <NuxtLink :to="`/estudiante/unidad/${primero.learningUnitId}`"
            class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-sm inline-flex items-center justify-center gap-1.5 shrink-0">
            Repasar ahora <ArrowRight :size="15" aria-hidden="true" />
          </NuxtLink>
        </div>
      </section>

      <section v-if="resto.length" class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm" aria-labelledby="despues-titulo">
        <h2 id="despues-titulo" class="px-5 pt-4 text-sm font-bold text-base-texto-primario">Después</h2>
        <ul class="divide-y divide-base-borde-sutil">
          <li v-for="item in resto" :key="item.id" class="px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="min-w-0 flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold shrink-0" :class="ESTILO_URGENCIA[item.urgency]">
                <component :is="ICONO[item.urgency]" :size="12" aria-hidden="true" /> {{ item.urgencyLabel }}
              </span>
              <span class="font-semibold text-base-texto-primario truncate">{{ item.conceptTitle }}</span>
            </span>
            <NuxtLink :to="`/estudiante/unidad/${item.learningUnitId}`" :aria-label="`Repasar ${item.conceptTitle}`"
              class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold text-acento-ambar-fuerte inline-flex items-center">
              Repasar
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>

    <div v-else class="bg-base-blanco rounded-xl border border-semantico-pasa/40 p-8 text-center space-y-3 shadow-sm">
      <CircleCheck :size="40" class="mx-auto text-semantico-pasa" aria-hidden="true" />
      <h2 class="font-bold text-base text-base-texto-primario">Estás al día con tus repasos</h2>
      <p class="text-xs text-base-texto-secundario max-w-md mx-auto">
        Lo que ya practicaste volverá aquí cuando toque repasarlo. Mientras tanto, sigue con la lección que tienes en curso.
      </p>
      <NuxtLink to="/estudiante" class="inline-flex items-center min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs">
        Ir a mi siguiente paso
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ArrowRight, CalendarCheck, CalendarClock, CircleCheck, Clock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { ESTILO_URGENCIA, ordenarRepasos, tiempoTotal } from '~/utils/repasos'

definePageMeta({ layout: 'student' })

const studentStore = useStudentStore()
const lista = computed(() => ordenarRepasos(studentStore.reviews))
const primero = computed(() => lista.value[0])
const resto = computed(() => lista.value.slice(1))
// La urgencia se lee por la forma del ícono, el color y el texto a la vez (P06).
const ICONO = { critico: Clock, vencido: CalendarCheck, manana: CalendarClock, 'al-dia': CircleCheck }

onMounted(() => {
  studentStore.fetchStudentData()
})
</script>
