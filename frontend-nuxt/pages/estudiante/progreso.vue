<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera de Mi Progreso (EST-V06) -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
        Mi progreso
      </h1>
      <p class="text-xs text-base-texto-secundario mt-0.5">
        Cómo vas en cada unidad que has trabajado
      </p>
    </header>

    <!-- Resumen de Métricas Clave -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Dominio general</span>
        <span class="text-2xl font-bold mt-1 block" :class="masteryColor(studentStore.analytics.avgMastery)">{{ studentStore.analytics.avgMastery }}%</span>
        <span class="text-[10px] text-base-texto-secundario">{{ getMasteryLevelName(studentStore.analytics.avgMastery) }}</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Ejercicios Completados</span>
        <span class="text-2xl font-bold text-base-texto-primario mt-1 block">{{ studentStore.analytics.completedExercises }}</span>
        <span class="text-[10px] text-base-texto-secundario">{{ Math.round(studentStore.analytics.avgSuccessRate) }}% de éxito en tus envíos</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Repasos Pendientes</span>
        <span class="text-2xl font-bold text-acento-ambar-fuerte mt-1 block">{{ studentStore.reviews.length }}</span>
        <span class="text-[10px] text-base-texto-secundario">Para hoy</span>
      </div>
    </section>

    <!-- 📊 DOMINIO POR UNIDAD CON BOTONES DE REFUERZO ACCIONABLES (P05 & P10) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-base-borde-sutil pb-3">
        <div>
          <h2 class="text-sm font-bold text-base-texto-primario">
            Cómo vas en cada unidad
          </h2>
          <p class="text-[11px] text-base-texto-secundario">
            Estados: No visto → Explorado → En práctica → Comprensión parcial → Dominado
          </p>
        </div>

        <span class="text-xs text-base-texto-secundario font-medium">
          Umbral de maestría: 70%
        </span>
      </div>

      <div class="space-y-4 pt-2">
        <p v-if="studentStore.analytics.masteryByUnit.length === 0" class="text-xs text-base-texto-secundario italic">
          Todavía no has practicado ninguna unidad. Empieza por la primera desde el
          <NuxtLink to="/estudiante" class="underline">inicio</NuxtLink>: aquí verás cómo avanzas.
        </p>
        <div
          v-for="item in studentStore.analytics.masteryByUnit"
          :key="item.unitId"
          class="p-4 rounded-lg bg-base-bg-secundario/40 border border-base-borde-sutil space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="item.mastery >= 70 ? 'bg-semantico-pasa/15 text-semantico-pasa' : item.mastery >= 40 ? 'bg-acento-ambar-fuerte/15 text-acento-ambar-fuerte' : 'bg-semantico-falla/15 text-semantico-falla'">
                {{ getMasteryLevelName(item.mastery) }}
              </span>
              <h3 class="text-xs font-bold text-base-texto-primario">
                {{ item.unitTitle }}
              </h3>
              <!-- Memoria: Se está olvidando (T2) -->
              <span
                v-if="forgettingUnitIds.has(item.unitId)"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-estado-unidad-bloqueado/15 text-estado-unidad-bloqueado"
              >
                <AlertTriangle :size="10" />
                Se está olvidando
              </span>
            </div>

            <!-- Botón de Refuerzo Directo Accionable (P05 — Insumo 15 §8) -->
            <NuxtLink
              :to="`/estudiante/unidad/${item.unitId}`"
              class="borde-afordancia px-3 py-1 rounded text-xs font-semibold bg-base-blanco text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1.5 self-start sm:self-auto">
              <span>Reforzar este tema</span>
            </NuxtLink>
          </div>

          <!-- Barra de Progreso Visual -->
          <div class="space-y-1">
            <div class="w-full h-2.5 bg-base-bg-secundario rounded-full overflow-hidden border border-base-borde-sutil">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="item.mastery >= 70 ? 'bg-semantico-pasa' : item.mastery >= 40 ? 'bg-acento-ambar-fuerte' : 'bg-semantico-falla'"
                :style="{ width: `${item.mastery}%` }"></div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-base-texto-secundario">
              <span>0%</span>
              <span class="font-bold text-base-texto-primario">{{ item.mastery }}% alcanzado</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Historial Reciente de Evaluaciones -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-3">
      <h2 class="text-sm font-bold text-base-texto-primario">
        Tus Últimas Entregas
      </h2>

      <p v-if="studentStore.analytics.recentSubmissions.length === 0" class="text-xs text-base-texto-secundario italic py-2">
        Todavía no has entregado ejercicios.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil">
            <tr>
              <th class="p-2.5 font-semibold">Ejercicio</th>
              <th class="p-2.5 font-semibold">Fecha y Hora</th>
              <th class="p-2.5 font-semibold">Puntaje</th>
              <th class="p-2.5 font-semibold">Resultado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr v-for="sub in studentStore.analytics.recentSubmissions" :key="sub.id">
              <td class="p-2.5 font-medium text-base-texto-primario">{{ sub.activityTitle }}</td>
              <td class="p-2.5 text-base-texto-secundario">{{ new Date(sub.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) }}</td>
              <td
                class="p-2.5 font-bold"
                :class="sub.passed === true ? 'text-semantico-pasa' : sub.passed === false ? 'text-semantico-falla' : 'text-base-texto-secundario'">
                <template v-if="sub.status === 'graded'">{{ sub.score }} / {{ sub.maxScore ?? '—' }}</template>
                <template v-else>—</template>
              </td>
              <td class="p-2.5">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
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
import { AlertTriangle } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()

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

function masteryColor(p: number) {
  if (p >= 70) return 'text-semantico-pasa'
  if (p >= 40) return 'text-acento-ambar-fuerte'
  return 'text-base-texto-primario'
}

function getMasteryLevelName(percentage: number) {
  if (percentage >= 85) return 'Dominado'
  if (percentage >= 70) return 'Comprensión Parcial'
  if (percentage >= 40) return 'En Práctica'
  if (percentage > 0) return 'Explorado'
  return 'No Visto'
}
</script>

