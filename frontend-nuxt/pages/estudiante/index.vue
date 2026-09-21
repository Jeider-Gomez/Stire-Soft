<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- BARRA SUPERIOR: Contexto de Asignatura y Selector de Clases -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-stire-blue/10 text-stire-blue flex items-center justify-center text-lg font-bold border border-stire-blue/20">
          🏛️
        </div>
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-stire-blue font-mono">
            Asignatura Activa • Universidad de Córdoba
          </span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900">
            {{ studentStore.currentClassName || 'Algoritmos Básicos con HTML5, CSS y JavaScript' }}
          </h2>
          <p class="text-xs text-slate-500">
            Docente a Cargo: <span class="font-medium text-slate-700">{{ studentStore.currentTeacher || 'Prof. Roberto Toscano' }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <NuxtLink
          to="/estudiante/clases"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:border-stire-blue hover:text-stire-blue transition-colors flex items-center gap-1.5 shadow-2xs">
          <span>📚</span>
          <span>Mis Clases ({{ studentStore.enrolledClasses.length || 1 }})</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 1. MÉTRICAS PERSONALES DE DOMINIO COGNITIVO (Grid de 4 Tarjetas) -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Dominio Global -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dominio Global</span>
          <span class="text-sm font-bold text-stire-success">🎯</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono text-slate-900">82%</span>
          <span class="text-xs font-bold text-stire-success">+6% este mes</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-stire-teal h-full rounded-full" style="width: 82%"></div>
        </div>
        <span class="text-[10px] text-slate-500 block">Nivel de asimilación conceptual óptimo</span>
      </div>

      <!-- Racha Cognitiva -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Racha Cognitiva</span>
          <span class="text-sm">🔥</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono text-amber-600">5 Días</span>
          <span class="text-xs text-slate-500">consecutivos</span>
        </div>
        <div class="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
          <span>Constancia de práctica espaciada</span>
        </div>
      </div>

      <!-- Conceptos Asimilados -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Competencias</span>
          <span class="text-sm">🧠</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono text-slate-900">14 / 18</span>
          <span class="text-xs font-semibold text-stire-blue">78% metas</span>
        </div>
        <div class="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
          <span>Objetivos de aprendizaje superados</span>
        </div>
      </div>

      <!-- Repasos Pendientes -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repasos Espaciados</span>
          <span class="text-sm">⏳</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono text-stire-purple">{{ studentStore.reviews.length || 2 }}</span>
          <span class="text-xs text-slate-500">ejercicios</span>
        </div>
        <div class="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Curva del olvido Ebbinghaus</span>
          <NuxtLink to="/estudiante/repasos" class="text-stire-purple font-bold hover:underline">
            Repasar →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 2. INTERACCIÓN SOCRÁTICA CON EL TUTOR IA -->
    <section class="bg-gradient-to-r from-stire-purple/5 to-stire-blue/5 rounded-2xl border border-stire-purple/20 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="space-y-2 max-w-2xl">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stire-purple/15 text-stire-purple border border-stire-purple/30 uppercase tracking-wider">
            Tutor Inteligente Socrático • STIRE Soft
          </span>
          <span class="text-xs text-slate-500">Asistencia Cognitiva 24/7</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          ¿Dudas al resolver un algoritmo o estructurar código?
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Tu Tutor IA formula preguntas reflexivas para guiar tu razonamiento paso a paso, sin darte la solución directa. Te ayuda a detectar fallos de lógica y fortalecer tu autonomía pedagógica.
        </p>
      </div>

      <button
        @click="tutorStore.toggleDrawer()"
        type="button"
        class="px-5 py-2.5 rounded-xl bg-stire-purple text-white font-bold text-xs hover:bg-purple-900 active:scale-[0.98] transition-all shadow-md flex items-center gap-2 cursor-pointer flex-shrink-0">
        <span>✨</span>
        <span>Abrir Consulta Socrática</span>
      </button>
    </section>

    <!-- 3. ÁRBOL DE COMPETENCIAS & RUTA PEDAGÓGICA -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🌳</span>
            <span>Árbol de Competencias & Ruta de Aprendizaje</span>
          </h2>
          <p class="text-xs text-slate-500">Progresión estructurada con evaluación formativa y nivel de asimilación</p>
        </div>
      </div>

      <!-- Módulos y Unidades -->
      <div class="space-y-4">
        <div
          v-for="mod in studentStore.modules"
          :key="mod.id"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <!-- Cabecera del Módulo -->
          <div class="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg bg-stire-blue/10 text-stire-blue font-bold flex items-center justify-center text-xs">
                M{{ mod.id }}
              </span>
              <div>
                <h3 class="text-sm font-bold text-slate-900">{{ mod.title }}</h3>
                <span class="text-[11px] text-slate-500">{{ mod.units?.length || 0 }} unidades temáticas</span>
              </div>
            </div>

            <!-- Progreso del Módulo -->
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-stire-blue hidden sm:inline">
                {{ calculateModuleMastery(mod) }}% Dominado
              </span>
              <div class="w-20 sm:w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-stire-teal h-full rounded-full transition-all duration-300"
                  :style="{ width: `${calculateModuleMastery(mod)}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Lista de Unidades del Módulo -->
          <div class="divide-y divide-slate-100">
            <div
              v-for="unit in mod.units"
              :key="unit.id"
              class="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <!-- Datos de Unidad -->
              <div class="space-y-1.5 max-w-2xl">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    :class="getStatusBadgeClass(unit.status)">
                    {{ getStatusLabel(unit.status) }}
                  </span>
                  <NuxtLink
                    :to="`/estudiante/unidad/${unit.id}`"
                    class="text-xs sm:text-sm font-bold text-slate-900 hover:text-stire-blue transition-colors">
                    {{ unit.title }}
                  </NuxtLink>
                  <span class="text-xs font-mono font-bold text-slate-600">
                    ({{ unit.masteryPercentage }}% dominio)
                  </span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                  {{ unit.description }}
                </p>

                <!-- Actividades y Ejercicios Prácticos -->
                <div v-if="unit.activities && unit.activities.length > 0" class="flex items-center gap-1.5 flex-wrap pt-1">
                  <span class="text-[10px] text-slate-400 font-medium mr-1">Ejercicios:</span>
                  <NuxtLink
                    v-for="act in unit.activities"
                    :key="act.id"
                    :to="`/estudiante/evaluacion/${act.id}`"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-200 bg-white hover:border-stire-blue hover:text-stire-blue transition-colors shadow-2xs">
                    <span>{{ getActivityIcon(act.title) }}</span>
                    <span>{{ act.title }}</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Botón de Práctica Ergonómico -->
              <div class="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                <NuxtLink
                  v-if="unit.exerciseActivityId"
                  :to="`/estudiante/evaluacion/${unit.exerciseActivityId}`"
                  class="px-4 py-2 rounded-lg text-xs font-bold bg-stire-blue text-white hover:bg-stire-blue-dark active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5">
                  <span>▶</span>
                  <span>Practicar Ejercicio</span>
                </NuxtLink>
                <NuxtLink
                  :to="`/estudiante/unidad/${unit.id}`"
                  class="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors">
                  Ver Unidad
                </NuxtLink>
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
import { useTutorStore } from '~/stores/tutor'
import type { UnitStatus } from '~/types'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()
const tutorStore = useTutorStore()

onMounted(() => {
  studentStore.fetchStudentData()
})

function calculateModuleMastery(mod: any) {
  if (!mod.units || mod.units.length === 0) return 0
  const total = mod.units.reduce((acc: number, u: any) => acc + (u.masteryPercentage || 0), 0)
  return Math.round(total / mod.units.length)
}

function getStatusBadgeClass(status: UnitStatus) {
  switch (status) {
    case 'dominado':
      return 'bg-emerald-50 text-stire-success border-emerald-200'
    case 'en-progreso':
      return 'bg-amber-50 text-stire-warning border-amber-200'
    case 'por-iniciar':
      return 'bg-slate-100 text-stire-blue border-slate-200'
    case 'bloqueado':
      return 'bg-slate-100 text-slate-400 border-slate-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

function getStatusLabel(status: UnitStatus) {
  switch (status) {
    case 'dominado': return 'Dominado ✔'
    case 'en-progreso': return 'En Progreso ⏳'
    case 'por-iniciar': return 'Por Iniciar'
    case 'bloqueado': return 'Bloqueado 🔒'
    default: return status
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
