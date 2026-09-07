<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera de Mi Progreso (EST-V06) -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <div class="flex items-center gap-2 mb-1">
        <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
          Analítica Formativa • Metacognición Accionable
        </span>
      </div>
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
        Mi Progreso y Nivel de Dominio Cognitivo
      </h1>
      <p class="text-xs text-base-texto-secundario mt-0.5">
        Diagnóstico en tiempo real sobre las 6 unidades del curso
      </p>
    </header>

    <!-- Resumen de Métricas Clave -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Dominio General Ponderado</span>
        <span class="text-2xl font-bold text-semantico-pasa mt-1 block">{{ studentStore.analytics.avgMastery }}%</span>
        <span class="text-[10px] text-base-texto-secundario">Nivel Competente</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Ejercicios Aprobados</span>
        <span class="text-2xl font-bold text-base-texto-primario mt-1 block">8 / 10</span>
        <span class="text-[10px] text-base-texto-secundario">80% de cobertura práctica</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm text-center">
        <span class="text-xs text-base-texto-secundario block font-medium">Repasos Pendientes</span>
        <span class="text-2xl font-bold text-acento-ambar-fuerte mt-1 block">{{ studentStore.reviews.length }}</span>
        <span class="text-[10px] text-base-texto-secundario">Listos para consolidar</span>
      </div>
    </section>

    <!-- 📊 DOMINIO POR UNIDAD CON BOTONES DE REFUERZO ACCIONABLES (P05 & P10) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-base-borde-sutil pb-3">
        <div>
          <h2 class="text-sm font-bold text-base-texto-primario">
            Estado de Dominio Cualitativo por Unidad
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
            </div>

            <!-- Botón de Refuerzo Directo Accionable (P05 — Insumo 15 §8) -->
            <NuxtLink
              :to="`/estudiante/unidad/${item.unitId}`"
              class="borde-afordancia px-3 py-1 rounded text-xs font-semibold bg-base-blanco text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1.5 self-start sm:self-auto">
              <span>🚀</span>
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
        Historial Reciente de Envíos en Sandbox
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil">
            <tr>
              <th class="p-2.5 font-semibold">Ejercicio</th>
              <th class="p-2.5 font-semibold">Fecha y Hora</th>
              <th class="p-2.5 font-semibold">Puntaje</th>
              <th class="p-2.5 font-semibold">Veredicto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr>
              <td class="p-2.5 font-medium text-base-texto-primario">Sumatoria de Pares</td>
              <td class="p-2.5 text-base-texto-secundario">Hoy, 15:45</td>
              <td class="p-2.5 font-bold text-semantico-pasa">100 / 100</td>
              <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa">Accepted ✔</span></td>
            </tr>
            <tr>
              <td class="p-2.5 font-medium text-base-texto-primario">Condicionales Anidados</td>
              <td class="p-2.5 text-base-texto-secundario">Ayer, 11:20</td>
              <td class="p-2.5 font-bold text-semantico-pasa">90 / 100</td>
              <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa">Accepted ✔</span></td>
            </tr>
            <tr>
              <td class="p-2.5 font-medium text-base-texto-primario">Declaración de Variables</td>
              <td class="p-2.5 text-base-texto-secundario">Hace 3 días</td>
              <td class="p-2.5 font-bold text-semantico-pasa">100 / 100</td>
              <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa">Accepted ✔</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()

function getMasteryLevelName(percentage: number) {
  if (percentage >= 85) return 'Dominado'
  if (percentage >= 70) return 'Comprensión Parcial'
  if (percentage >= 40) return 'En Práctica'
  if (percentage > 0) return 'Explorado'
  return 'No Visto'
}
</script>
