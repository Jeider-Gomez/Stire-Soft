<template>
  <aside class="w-sidebar flex-shrink-0 bg-base-blanco border-r border-base-borde-sutil min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
    <!-- Navegación según Rol Activo -->
    <div class="space-y-4">
      <!-- 🎓 NAVEGACIÓN ESTUDIANTE (6 Ítems Persistentes - Insumo 15 §5) -->
      <nav v-if="authStore.currentRole === 'estudiante'" class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Navegación</p>

        <!-- 1. Inicio (EST-V01) -->
        <NuxtLink
          to="/estudiante"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="isCurrentRoute('/estudiante') && route.path === '/estudiante' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <House :size="18" aria-hidden="true" class="shrink-0" />
          <span>Inicio</span>
        </NuxtLink>

        <!-- 2, 3, 4: Los 3 Módulos con acordeón interno sin flyout -->
        <div class="pt-2 pb-1">
          <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Plan de Estudio</p>
          <div v-for="mod in studentStore.modules" :key="mod.id" class="mb-1">
            <button
              @click="toggleModule(mod.id)"
              class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md hover:bg-base-bg-secundario text-base-texto-primario transition-colors">
              <span class="truncate">{{ mod.title.split(':')[0] }}</span>
              <ChevronDown v-if="openModules.includes(mod.id)" :size="14" class="text-base-texto-secundario" aria-hidden="true" />
              <ChevronRight v-else :size="14" class="text-base-texto-secundario" aria-hidden="true" />
            </button>

            <!-- Unidades del Módulo -->
            <div v-if="openModules.includes(mod.id)" class="pl-3 pr-1 py-1 space-y-1">
              <NuxtLink
                v-for="unit in mod.units"
                :key="unit.id"
                :to="`/estudiante/unidad/${unit.id}`"
                class="flex items-center justify-between text-xs px-2.5 py-1.5 rounded transition-colors"
                :class="route.path === `/estudiante/unidad/${unit.id}` ? 'bg-base-bg-secundario font-semibold text-acento-ambar-fuerte' : 'text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario/60'">
                <div class="flex items-center gap-1.5 truncate">
                  <span :class="getStatusDotClass(unit.status)">●</span>
                  <span class="truncate">{{ unit.title }}</span>
                </div>
                <Check v-if="unit.status === 'dominado'" :size="14" class="text-semantico-pasa" aria-label="Dominada" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 pt-2">Consolidación</p>

        <!-- 5. Repasos (EST-V05) -->
        <NuxtLink
          to="/estudiante/repasos"
          class="flex items-center justify-between px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/repasos' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <div class="flex items-center gap-2.5">
            <Repeat :size="18" aria-hidden="true" class="shrink-0" />
            <span>Repasos</span>
          </div>
          <span
            v-if="studentStore.reviews.length > 0"
            class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-semantico-falla/15 text-semantico-falla">
            {{ studentStore.reviews.length }}
          </span>
        </NuxtLink>

        <!-- 6. Mi Progreso (EST-V06) -->
        <NuxtLink
          to="/estudiante/progreso"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/progreso' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <TrendingUp :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mi Progreso</span>
        </NuxtLink>

        <!-- 7. Mensajes -->
        <NuxtLink
          to="/estudiante/mensajes"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/mensajes' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Mail :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mensajes</span>
        </NuxtLink>
      </nav>

      <!-- 👨‍🏫 NAVEGACIÓN DOCENTE (DOC-V01..V06) -->
      <nav v-else-if="authStore.currentRole === 'docente'" class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Gestión Docente</p>

        <NuxtLink
          to="/docente"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Users :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mis Clases</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/contenidos"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente/contenidos' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <BookOpen :size="18" aria-hidden="true" class="shrink-0" />
          <span>Contenidos</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/ejercicios/crear"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente/ejercicios/crear' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <SquarePen :size="18" aria-hidden="true" class="shrink-0" />
          <span>Crear Ejercicio</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/rendimiento"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path.startsWith('/docente/rendimiento') || route.path.startsWith('/docente/estudiante') ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <BarChart3 :size="18" aria-hidden="true" class="shrink-0" />
          <span>Rendimiento</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/mensajes"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente/mensajes' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Mail :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mensajes</span>
        </NuxtLink>
      </nav>

      <!-- ⚙️ NAVEGACIÓN ADMINISTRADOR (ADM-V01..V03) -->
      <nav v-else class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Administración</p>

        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/dashboard' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Activity :size="18" aria-hidden="true" class="shrink-0" />
          <span>Estado del Sistema</span>
        </NuxtLink>

        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin' || route.path === '/admin/usuarios' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <ShieldCheck :size="18" aria-hidden="true" class="shrink-0" />
          <span>Usuarios y Roles</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/sistema"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/sistema' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Settings :size="18" aria-hidden="true" class="shrink-0" />
          <span>Logs y Mantenimiento</span>
        </NuxtLink>
      </nav>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { House, Repeat, TrendingUp, Mail, Users, BookOpen, SquarePen, BarChart3, Activity, ShieldCheck, Settings, ChevronDown, ChevronRight, Check } from 'lucide-vue-next'
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

function isCurrentRoute(path: string) {
  return route.path.startsWith(path)
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'dominado': return 'text-estado-unidad-dominado'
    case 'en-progreso': return 'text-estado-unidad-en-progreso'
    case 'por-iniciar': return 'text-estado-unidad-por-iniciar'
    case 'bloqueado': return 'text-estado-unidad-bloqueado'
    default: return 'text-base-texto-secundario'
  }
}
</script>
