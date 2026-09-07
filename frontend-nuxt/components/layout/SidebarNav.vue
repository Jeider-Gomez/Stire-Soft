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
          <span>🏠</span>
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
              <span class="text-base-texto-secundario text-[10px]">{{ openModules.includes(mod.id) ? '▼' : '▶' }}</span>
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
                <span v-if="unit.status === 'dominado'" class="text-[10px] text-semantico-pasa font-bold">✔</span>
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
            <span>🧠</span>
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
          <span>📊</span>
          <span>Mi Progreso</span>
        </NuxtLink>
      </nav>

      <!-- 👨‍🏫 NAVEGACIÓN DOCENTE -->
      <nav v-else-if="authStore.currentRole === 'docente'" class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Gestión Docente</p>
        <NuxtLink
          to="/docente"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <span>👥</span>
          <span>Mis Clases (DOC-V01)</span>
        </NuxtLink>
        <div class="px-3 py-2 text-xs text-base-texto-secundario">
          <span class="block font-medium text-base-texto-primario mb-1">Módulos Próximos:</span>
          <span class="block">· Contenidos y Temas</span>
          <span class="block">· Diseñador Ejercicios</span>
          <span class="block">· Analítica Cohorte</span>
        </div>
      </nav>

      <!-- ⚙️ NAVEGACIÓN ADMINISTRADOR -->
      <nav v-else class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Administración</p>
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <span>🛡️</span>
          <span>Usuarios y Roles (ADM-V02)</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Banner Inferior de Ayuda Rápida -->
    <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil text-xs space-y-1">
      <div class="flex items-center gap-1.5 font-semibold text-base-texto-primario">
        <span>📌</span>
        <span>Atajo Rápido</span>
      </div>
      <p class="text-base-texto-secundario">
        Regla de los 3 clics: todo el contenido clave está a 1 clic de distancia.
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
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
