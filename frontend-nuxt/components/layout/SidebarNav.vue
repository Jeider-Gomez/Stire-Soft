<template>
  <aside class="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex flex-shrink-0">
    <div class="space-y-6">
      <!-- 🎓 NAVEGACIÓN ESTUDIANTE -->
      <nav v-if="authStore.currentRole === 'estudiante'" class="space-y-1.5 text-xs font-medium">
        <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">Ruta Formativa</p>

        <!-- 1. Inicio / Ruta -->
        <NuxtLink
          to="/estudiante"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/estudiante' ? 'bg-stire-blue/10 text-stire-blue font-bold border border-stire-blue/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>🗺️</span>
          <span>Ruta de Aprendizaje</span>
        </NuxtLink>

        <!-- Módulos temáticos -->
        <div class="pt-2 pb-1">
          <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">Módulos Temáticos</p>
          <div v-for="mod in studentStore.modules" :key="mod.id" class="mb-1">
            <button
              @click="toggleModule(mod.id)"
              type="button"
              class="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
              <span class="truncate">{{ mod.title.split(':')[0] }}</span>
              <span class="text-slate-400 text-[10px]">{{ openModules.includes(mod.id) ? '▼' : '▶' }}</span>
            </button>

            <!-- Unidades del Módulo -->
            <div v-if="openModules.includes(mod.id)" class="pl-3 pr-1 py-1 space-y-0.5">
              <NuxtLink
                v-for="unit in mod.units"
                :key="unit.id"
                :to="`/estudiante/unidad/${unit.id}`"
                class="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-md transition-colors"
                :class="route.path === `/estudiante/unidad/${unit.id}` ? 'bg-stire-blue/10 font-bold text-stire-blue' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="text-[8px]" :class="getStatusDotClass(unit.status)">●</span>
                  <span class="truncate">{{ unit.title }}</span>
                </div>
                <span v-if="unit.status === 'dominado'" class="text-[10px] text-stire-success font-bold">✔</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 pt-2">Consolidación</p>

        <!-- Repasos -->
        <NuxtLink
          to="/estudiante/repasos"
          class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/estudiante/repasos' ? 'bg-stire-purple/10 text-stire-purple font-bold border border-stire-purple/20' : 'text-slate-700 hover:bg-slate-50'">
          <div class="flex items-center gap-2.5">
            <span>🧠</span>
            <span>Repasos Espaciados</span>
          </div>
          <span
            v-if="studentStore.reviews.length > 0"
            class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-stire-danger border border-rose-200">
            {{ studentStore.reviews.length }}
          </span>
        </NuxtLink>

        <!-- Mi Progreso -->
        <NuxtLink
          to="/estudiante/progreso"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/estudiante/progreso' ? 'bg-stire-teal/10 text-stire-teal-dark font-bold border border-stire-teal/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>📊</span>
          <span>Progreso Cognitivo</span>
        </NuxtLink>
      </nav>

      <!-- 👨‍🏫 NAVEGACIÓN DOCENTE -->
      <nav v-else-if="authStore.currentRole === 'docente'" class="space-y-1.5 text-xs font-medium">
        <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">Control Pedagógico</p>

        <NuxtLink
          to="/docente"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/docente' ? 'bg-stire-purple/10 text-stire-purple font-bold border border-stire-purple/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>👥</span>
          <span>Mis Clases (DOC-V01)</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/contenidos"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/docente/contenidos' ? 'bg-stire-purple/10 text-stire-purple font-bold border border-stire-purple/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>📚</span>
          <span>Contenidos (DOC-V02)</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/ejercicios/crear"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/docente/ejercicios/crear' ? 'bg-stire-purple/10 text-stire-purple font-bold border border-stire-purple/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>✍️</span>
          <span>Crear Ejercicio (DOC-V03)</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/rendimiento"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path.startsWith('/docente/rendimiento') || route.path.startsWith('/docente/estudiante') ? 'bg-stire-purple/10 text-stire-purple font-bold border border-stire-purple/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>📊</span>
          <span>Rendimiento Aula (DOC-V04)</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/mensajes"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/docente/mensajes' ? 'bg-stire-purple/10 text-stire-purple font-bold border border-stire-purple/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>✉️</span>
          <span>Mensajes (DOC-V06)</span>
        </NuxtLink>
      </nav>

      <!-- ⚙️ NAVEGACIÓN ADMINISTRADOR -->
      <nav v-else class="space-y-1.5 text-xs font-medium">
        <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">Gobernanza STIRE</p>

        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/admin/dashboard' ? 'bg-stire-blue/10 text-stire-blue font-bold border border-stire-blue/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>🖥️</span>
          <span>Telemetría & Nodos (ADM-V01)</span>
        </NuxtLink>

        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/admin' || route.path === '/admin/usuarios' ? 'bg-stire-blue/10 text-stire-blue font-bold border border-stire-blue/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>🛡️</span>
          <span>Usuarios & Roles (ADM-V02)</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/sistema"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
          :class="route.path === '/admin/sistema' ? 'bg-stire-blue/10 text-stire-blue font-bold border border-stire-blue/20' : 'text-slate-700 hover:bg-slate-50'">
          <span>⚙️</span>
          <span>Logs & Auditoría (ADM-V03)</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Banner Inferior Institucional -->
    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
      <div class="flex items-center gap-1.5 font-bold text-slate-800">
        <span class="w-2 h-2 rounded-full bg-stire-teal"></span>
        <span>STIRE Soft v2.4</span>
      </div>
      <p class="text-slate-500 text-[10px] leading-tight">
        Universidad de Córdoba • Sistema de Tutoría Inteligente
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const route = useRoute()

const openModules = ref<number[]>([1, 2])

function toggleModule(id: number) {
  if (openModules.value.includes(id)) {
    openModules.value = openModules.value.filter(m => m !== id)
  } else {
    openModules.value.push(id)
  }
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'dominado': return 'text-stire-success'
    case 'en-progreso': return 'text-stire-warning'
    case 'por-iniciar': return 'text-stire-blue'
    case 'bloqueado': return 'text-slate-400'
    default: return 'text-slate-400'
  }
}
</script>
