<template>
  <div class="space-y-6">
    <!-- 1. TARJETA HERO DE ACCIÓN INMEDIATA (P01 — Orientación y Jerarquía) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="space-y-2 max-w-2xl">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-acento-ambar/15 text-acento-ambar-fuerte uppercase tracking-wider">
            Recomendación del Tutor
          </span>
          <span class="text-xs text-base-texto-secundario">Sesión Activa</span>
        </div>

        <h1 class="text-lg md:text-xl font-bold text-base-texto-primario tracking-tight">
          Continúa con: {{ studentStore.activeUnit.title }}
        </h1>
        <p class="text-xs text-base-texto-secundario leading-relaxed">
          {{ studentStore.activeUnit.description }}
        </p>

        <!-- Barra de Progreso de la Unidad -->
        <div class="flex items-center gap-3 pt-1">
          <div class="w-48 h-2 bg-base-bg-secundario rounded-full overflow-hidden border border-base-borde-sutil">
            <div
              class="h-full bg-acento-ambar-fuerte rounded-full transition-all duration-500"
              :style="{ width: `${studentStore.activeUnit.masteryPercentage}%` }"></div>
          </div>
          <span class="text-xs font-semibold text-base-texto-primario">
            {{ studentStore.activeUnit.masteryPercentage }}% de Dominio
          </span>
        </div>
      </div>

      <!-- Botón de Gran Jerarquía Visual (P01) -->
      <div class="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
        <NuxtLink
          :to="`/estudiante/unidad/${studentStore.activeUnit.id}`"
          class="px-5 py-3 rounded-lg bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-2">
          <span>🚀</span>
          <span>Continuar Lección</span>
        </NuxtLink>

        <NuxtLink
          to="/estudiante/repasos"
          class="borde-afordancia px-4 py-2.5 rounded-lg bg-base-bg-secundario text-center text-xs font-semibold text-base-texto-primario flex items-center justify-center gap-1.5">
          <span>🧠</span>
          <span>Repasar conceptos ({{ studentStore.reviews.length }})</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 2. MÉTRICAS RÁPIDAS DE ESTADO -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
        <p class="text-[11px] text-base-texto-secundario font-medium">Dominio Promedio</p>
        <p class="text-xl font-bold text-semantico-pasa mt-1">{{ studentStore.analytics.avgMastery }}%</p>
        <span class="text-[10px] text-base-texto-secundario">Supera umbral de 70%</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
        <p class="text-[11px] text-base-texto-secundario font-medium">Tasa de Éxito en Envíos</p>
        <p class="text-xl font-bold text-base-texto-primario mt-1">{{ studentStore.analytics.avgSuccessRate }}%</p>
        <span class="text-[10px] text-base-texto-secundario">Casos de prueba superados</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
        <p class="text-[11px] text-base-texto-secundario font-medium">Racha de Aprendizaje</p>
        <p class="text-xl font-bold text-acento-ambar-fuerte mt-1">🔥 {{ studentStore.analytics.streakDays }} días</p>
        <span class="text-[10px] text-base-texto-secundario">Constancia formativa</span>
      </div>

      <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
        <p class="text-[11px] text-base-texto-secundario font-medium">Ejercicios Resueltos</p>
        <p class="text-xl font-bold text-semantico-info mt-1">{{ studentStore.analytics.completedExercises }}</p>
        <span class="text-[10px] text-base-texto-secundario">En el período activo</span>
      </div>
    </section>

    <!-- 3. PLAN CURRICULAR POR MÓDULOS -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-base-texto-primario">
          Plan de Aprendizaje por Módulos
        </h2>
        <span class="text-xs text-base-texto-secundario">
          3 Módulos • 6 Unidades Temáticas
        </span>
      </div>

      <div class="space-y-4">
        <div
          v-for="mod in studentStore.modules"
          :key="mod.id"
          class="bg-base-blanco rounded-xl border border-base-borde-sutil overflow-hidden shadow-sm">
          <!-- Cabecera del Módulo -->
          <div class="bg-base-bg-secundario/60 px-5 py-3 border-b border-base-borde-sutil flex items-center justify-between">
            <h3 class="font-bold text-xs text-base-texto-primario">
              {{ mod.title }}
            </h3>
            <span class="text-[11px] text-base-texto-secundario">
              {{ mod.units.length }} {{ mod.units.length === 1 ? 'Unidad' : 'Unidades' }}
            </span>
          </div>

          <!-- Lista de Unidades del Módulo -->
          <div class="divide-y divide-base-borde-sutil">
            <div
              v-for="unit in mod.units"
              :key="unit.id"
              class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base-bg-primario/50 transition-colors">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="getStatusBadgeClass(unit.status)">
                    {{ getStatusLabel(unit.status) }}
                  </span>
                  <h4 class="text-xs font-bold text-base-texto-primario">
                    {{ unit.title }}
                  </h4>
                </div>
                <p class="text-xs text-base-texto-secundario">
                  {{ unit.description }}
                </p>
              </div>

              <!-- Acciones de Unidad -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <NuxtLink
                  v-if="unit.status !== 'bloqueado'"
                  :to="`/estudiante/unidad/${unit.id}`"
                  class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario">
                  Estudiar Lección
                </NuxtLink>

                <NuxtLink
                  v-if="unit.status !== 'bloqueado'"
                  :to="`/estudiante/evaluacion/${unit.exerciseActivityId}`"
                  class="px-3 py-1.5 rounded-md text-xs font-semibold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar">
                  Practicar Ejercicio
                </NuxtLink>

                <span v-else class="text-xs text-base-texto-secundario px-2 py-1 flex items-center gap-1">
                  <span>🔒</span>
                  <span>Requiere módulo anterior</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStudentStore } from '~/stores/student'
import type { UnitStatus } from '~/types'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()

onMounted(() => {
  studentStore.fetchStudentData()
})

function getStatusBadgeClass(status: UnitStatus) {
  switch (status) {
    case 'dominado': return 'bg-estado-unidad-dominado/15 text-estado-unidad-dominado'
    case 'en-progreso': return 'bg-estado-unidad-en-progreso/15 text-estado-unidad-en-progreso'
    case 'por-iniciar': return 'bg-estado-unidad-por-iniciar/15 text-estado-unidad-por-iniciar'
    case 'bloqueado': return 'bg-estado-unidad-bloqueado/15 text-estado-unidad-bloqueado'
  }
}

function getStatusLabel(status: UnitStatus) {
  switch (status) {
    case 'dominado': return 'Dominado ✔'
    case 'en-progreso': return 'En Progreso ⏳'
    case 'por-iniciar': return 'Por Iniciar'
    case 'bloqueado': return 'Bloqueado 🔒'
  }
}
</script>

