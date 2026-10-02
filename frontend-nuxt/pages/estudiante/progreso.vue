<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera de Mi Progreso (EST-V06) -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
        Mi progreso
      </h1>
      <p class="text-xs text-base-texto-secundario mt-0.5">
        Cómo vas en cada lección que has trabajado
      </p>
    </header>

    <!-- Resumen de Métricas Clave -->
    <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Avance honesto (docs/DISENO_INTERVENCION_DOCENTE.md §10.2): antes mostraba un dominio general de 99 % con 5 de 17. -->
      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Avance del curso</span>
        <span class="text-2xl font-bold mt-1 block text-base-texto-primario">{{ studentStore.hasLoaded ? `${studentStore.avanceCurso.dominadas} de ${studentStore.avanceCurso.total}` : '—' }}</span>
        <span class="text-[10px] text-base-texto-secundario">
          {{ !studentStore.hasLoaded ? 'Cargando…' : studentStore.avanceCurso.trabajadas ? `lecciones dominadas · ${studentStore.avanceCurso.dominioTrabajado} % de dominio en lo trabajado` : 'lecciones dominadas' }}
        </span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center flex flex-col items-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Repasos para hoy</span>
        <span class="text-2xl font-bold text-acento-ambar-fuerte mt-1 block">{{ studentStore.hasLoaded ? studentStore.reviewsDueToday.length : '—' }}</span>
        <NuxtLink v-if="studentStore.hasLoaded && studentStore.reviewsDueToday.length" to="/estudiante/repasos"
          class="mt-1 px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold inline-flex items-center gap-1 min-h-[36px]">
          Repasar ahora <ArrowRight :size="13" aria-hidden="true" />
        </NuxtLink>
        <span v-else class="text-[10px] text-base-texto-secundario">{{ studentStore.hasLoaded ? 'Al día. Nada que repasar hoy.' : 'Cargando…' }}</span>
      </div>
    </section>

    <!-- Racha y semana a la vista; el resto de estadísticas, plegado (BT-21) -->
    <EstadisticasEstudiante :student-id="authStore.user?.id" :class-id="studentStore.currentClassId" />

    <!-- Su nota y de dónde sale, si el docente la hizo visible (§6) -->
    <MiNota :class-id="studentStore.currentClassId" />

    <!-- Dominio por lección, con acceso a reforzar cada una -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-base-borde-sutil pb-3">
        <div>
          <h2 class="text-sm font-bold text-base-texto-primario">
            Cómo vas en cada lección
          </h2>
          <p class="text-[11px] text-base-texto-secundario">
            Dominada desde 85 %. Las dominadas vuelven a repasarse para no olvidarlas.
          </p>
        </div>

      </div>

      <div class="pt-1">
        <p v-if="studentStore.analytics.masteryByUnit.length === 0" class="text-xs text-base-texto-secundario italic">
          Todavía no has practicado ninguna lección. Empieza por la primera desde el
          <NuxtLink to="/estudiante" class="underline">inicio</NuxtLink>: aquí verás cómo avanzas.
        </p>
        <ul class="divide-y divide-base-borde-sutil">
          <li v-for="item in studentStore.analytics.masteryByUnit" :key="item.unitId" class="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div class="min-w-0 sm:w-1/2">
              <NuxtLink :to="`/estudiante/unidad/${item.unitId}`" class="text-xs font-bold text-base-texto-primario hover:underline">{{ item.unitTitle }}</NuxtLink>
              <p class="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span class="px-1.5 py-0.5 rounded font-bold" :class="claseEstado(item.mastery)">{{ getMasteryLevelName(item.mastery) }}</span>
                <span v-if="forgettingUnitIds.has(item.unitId)" class="inline-flex items-center gap-1 font-semibold text-acento-ambar-fuerte">
                  <RotateCcw :size="10" aria-hidden="true" /> Toca repasarla
                </span>
              </p>
            </div>
            <div class="flex items-center gap-3 flex-1">
              <div class="flex-1 h-2 bg-base-bg-secundario rounded-full overflow-hidden" role="img" :aria-label="`${item.mastery} % de dominio`">
                <div class="h-full rounded-full" :class="colorBarra(item.mastery)" :style="{ width: `${item.mastery}%` }"></div>
              </div>
              <span class="w-10 text-right text-[11px] font-bold text-base-texto-primario">{{ item.mastery }} %</span>
              <!-- Una acción solo donde hace falta: repasar lo que se olvida o seguir lo que no está dominado. -->
              <NuxtLink v-if="forgettingUnitIds.has(item.unitId) || item.mastery < 85" :to="`/estudiante/unidad/${item.unitId}`"
                class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-semibold bg-base-blanco text-acento-ambar-fuerte hover:bg-acento-ambar/10 whitespace-nowrap min-h-[32px] inline-flex items-center">
                {{ forgettingUnitIds.has(item.unitId) ? 'Repasar' : 'Practicar' }}
              </NuxtLink>
              <span v-else class="w-[4.5rem]" aria-hidden="true"></span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Historial Reciente de Evaluaciones -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-3">
      <h2 class="text-sm font-bold text-base-texto-primario">
        Tus últimos ejercicios
      </h2>

      <p v-if="studentStore.analytics.recentSubmissions.length === 0" class="text-xs text-base-texto-secundario italic py-2">
        Todavía no has entregado ejercicios.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil">
            <tr>
              <th class="p-2.5 font-semibold">Ejercicio</th>
              <th class="p-2.5 font-semibold hidden sm:table-cell">Fecha</th>
              <th class="p-2.5 font-semibold">Puntaje</th>
              <th class="p-2.5 font-semibold">Resultado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr v-for="sub in studentStore.analytics.recentSubmissions" :key="sub.id">
              <td class="p-2.5 font-medium text-base-texto-primario">{{ sub.activityTitle }}</td>
              <td class="p-2.5 text-base-texto-secundario hidden sm:table-cell">{{ new Date(sub.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) }}</td>
              <td
                class="p-2.5 font-bold"
                :class="sub.passed === true ? 'text-semantico-pasa' : sub.passed === false ? 'text-semantico-falla' : 'text-base-texto-secundario'">
                <template v-if="sub.status === 'graded'">{{ sub.score }} / {{ sub.maxScore ?? '—' }}</template>
                <template v-else>—</template>
              </td>
              <td class="p-2.5">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
                  :class="sub.passed === true ? 'bg-semantico-pasa/15 text-semantico-pasa' : sub.passed === false ? 'bg-semantico-falla/15 text-semantico-falla' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                  {{ resultLabel(sub) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ArrowRight, RotateCcw } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()
const authStore = useAuthStore()

// Unidades con repaso vencido o crítico para «Se está olvidando» (T2)
const forgettingUnitIds = computed(() => {
  const ids = new Set<number>()
  for (const r of studentStore.reviews) {
    if (r.urgency === 'vencido' || r.urgency === 'critico') {
      ids.add(r.learningUnitId)
    }
  }
  return ids
})

onMounted(() => {
  studentStore.fetchStudentData()
})

function resultLabel(sub: { status: string; passed: boolean | null }) {
  if (sub.status !== 'graded') return 'En curso'
  if (sub.passed === true) return 'Aprobado'
  if (sub.passed === false) return 'No aprobado'
  return 'Calificado'
}

// Mismos cortes que el servidor (learning-progress.service.ts: <20 explorado, <60 en práctica, <85 comprensión
// parcial, si no dominado). Antes esta pantalla usaba 70 y 40 y podía nombrar distinto el estado de una unidad.
/** El color sale del mismo estado que el nombre (antes usaba otros cortes y un 70 % salía verde y «En práctica»). */
function claseEstado(m: number) {
  if (m >= 85) return 'bg-semantico-pasa/15 text-semantico-pasa'
  if (m >= 20) return 'bg-acento-ambar-fuerte/15 text-acento-ambar-fuerte'
  return 'bg-base-bg-secundario text-base-texto-secundario'
}
const colorBarra = (m: number) => (m >= 85 ? 'bg-semantico-pasa' : m >= 20 ? 'bg-acento-ambar-fuerte' : 'bg-base-borde-fuerte')

function getMasteryLevelName(percentage: number) {
  if (percentage >= 85) return 'Dominado'
  if (percentage >= 60) return 'Comprensión parcial'
  if (percentage >= 20) return 'En práctica'
  if (percentage > 0) return 'Explorado'
  return 'No visto'
}
</script>

