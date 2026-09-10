<template>
  <div class="space-y-6">
    <!-- BARRA SUPERIOR: Contexto de Asignatura y Selector de Clases -->
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">🏛️</span>
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-acento-ambar-fuerte">
            Asignatura Activa
          </span>
          <h2 class="text-xs sm:text-sm font-bold text-base-texto-primario">
            {{ studentStore.currentClassName || 'Sin clase activa seleccionada' }}
          </h2>
          <p v-if="studentStore.currentTeacher" class="text-[11px] text-base-texto-secundario">
            Docente: {{ studentStore.currentTeacher }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <NuxtLink
          to="/estudiante/clases"
          class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold text-base-texto-primario bg-base-blanco hover:bg-base-bg-secundario transition-colors flex items-center gap-1.5 shadow-sm">
          <span>📚</span>
          <span>Mis Clases ({{ studentStore.enrolledClasses.length }})</span>
        </NuxtLink>
      </div>
    </div>

    <!-- ESTADO VACÍO SI NO ESTÁ MATRICULADO -->
    <section v-if="!studentStore.isSyncing && studentStore.enrolledClasses.length === 0" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 text-center space-y-4 shadow-sm">
      <div class="w-16 h-16 bg-acento-ambar/15 text-acento-ambar-fuerte rounded-full flex items-center justify-center text-3xl mx-auto">
        🎓
      </div>
      <div class="max-w-md mx-auto space-y-1">
        <h2 class="text-base font-bold text-base-texto-primario">¡Bienvenido a STIRE!</h2>
        <p class="text-xs text-base-texto-secundario">
          Aún no estás matriculado en ninguna clase. Para comenzar tu ruta de aprendizaje adaptativo, ingresa el código de clase suministrado por tu docente.
        </p>
      </div>
      <NuxtLink
        to="/estudiante/clases"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm">
        <span>🔑</span>
        <span>Ingresar Código de Clase</span>
      </NuxtLink>
    </section>

    <template v-else>
      <!-- 1. TARJETA HERO DE ACCIÓN INMEDIATA (P01 — Orientación y Jerarquía) -->
      <section v-if="studentStore.activeUnit" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
            v-if="studentStore.activeUnit.exerciseActivityId"
            :to="`/estudiante/evaluacion/${studentStore.activeUnit.exerciseActivityId}`"
            class="px-5 py-3 rounded-lg bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-2">
            <span>🚀</span>
            <span>Continuar Ejercicio</span>
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
          <p class="text-[11px] text-base-texto-secundario font-medium">Ejercicios Completados</p>
          <p class="text-xl font-bold text-semantico-info mt-1">{{ studentStore.analytics.completedExercises }}</p>
          <span class="text-[10px] text-base-texto-secundario">En el período activo</span>
        </div>
      </section>

      <!-- 3. PLAN CURRICULAR POR MÓDULOS -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-base-texto-primario flex items-center gap-2">
            <span>🗺️</span> Plan Curricular de la Asignatura
          </h2>
          <span class="text-xs text-base-texto-secundario">
            {{ studentStore.modules.length }} Módulos disponibles
          </span>
        </div>

        <div v-if="studentStore.modules.length === 0" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-sutil text-xs text-base-texto-secundario">
          No hay módulos publicados para esta asignatura en este momento.
        </div>

        <div v-else class="space-y-4">
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
                class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-base-bg-primario/50 transition-colors">
                <div class="space-y-2 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="getStatusBadgeClass(unit.status)">
                      {{ getStatusLabel(unit.status) }}
                    </span>
                    <h4 class="text-xs font-bold text-base-texto-primario">
                      {{ unit.title }}
                    </h4>
                    <span class="text-[11px] font-semibold text-acento-ambar-fuerte">
                      ({{ unit.masteryPercentage }}% dominio)
                    </span>
                  </div>

                  <p class="text-xs text-base-texto-secundario">
                    {{ unit.description }}
                  </p>

                  <!-- Desglose de actividades con pesos -->
                  <div v-if="unit.activities && unit.activities.length > 0" class="flex items-center gap-1.5 flex-wrap pt-1">
                    <span class="text-[10px] text-base-texto-secundario font-medium mr-1">Actividades ponderadas:</span>
                    <NuxtLink
                      v-for="act in unit.activities"
                      :key="act.id"
                      :to="`/estudiante/evaluacion/${act.id}`"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-base-borde-fuerte bg-base-blanco hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors">
                      <span>{{ getActivityIcon(act.title) }}</span>
                      <span class="font-semibold">{{ act.title }}</span>
                      <span class="text-acento-ambar-fuerte font-bold">({{ Math.round((act.adaptiveWeight || 1) * 100) }}%)</span>
                    </NuxtLink>
                  </div>
                </div>

                <!-- Acciones de Unidad -->
                <div class="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <NuxtLink
                    v-if="unit.exerciseActivityId"
                    :to="`/estudiante/evaluacion/${unit.exerciseActivityId}`"
                    class="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar shadow-sm transition-colors flex items-center gap-1">
                    <span>▶</span>
                    <span>Practicar</span>
                  </NuxtLink>

                  <span v-else class="text-xs text-base-texto-secundario px-2 py-1 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Próximamente</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
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

function getActivityIcon(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('quiz') || t.includes('mcq')) return '📝'
  if (t.includes('completar') || t.includes('fill')) return '🧩'
  if (t.includes('código') || t.includes('desafío') || t.includes('coding')) return '💻'
  return '⚡'
}
</script>
