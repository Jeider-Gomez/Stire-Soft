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

            <!-- Lecciones del módulo; el tema se muestra solo si agrupa más de una lección -->
            <div v-if="openModules.includes(mod.id)" class="pl-3 pr-1 py-1 space-y-1">
              <template v-for="tema in mod.topics" :key="tema.id">
                <p v-if="tema.units.length > 1" class="px-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-base-texto-secundario truncate">{{ tema.title }}</p>
                <NuxtLink
                  v-for="unit in tema.units"
                  :key="unit.id"
                  :to="`/estudiante/unidad/${unit.id}`"
                  class="flex items-center justify-between text-xs px-2.5 py-1.5 rounded transition-colors"
                  :class="route.path === `/estudiante/unidad/${unit.id}` ? 'bg-base-bg-secundario font-semibold text-acento-ambar-fuerte' : 'text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario/60'">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="inline-block w-1.5 h-1.5 rounded-full shrink-0" :class="getStatusDotClass(unit.status)" aria-hidden="true"></span>
                    <span class="truncate">{{ unit.title }}</span>
                  </div>
                  <Check v-if="unit.status === 'dominado'" :size="14" class="text-semantico-pasa" aria-label="Dominada" />
                </NuxtLink>
              </template>
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
          <!-- Insignia roja = repasos que tocan HOY (vencidos o críticos); los de mañana no son urgentes. -->
          <span
            v-if="studentStore.reviewsDueToday.length > 0"
            class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-semantico-falla/15 text-semantico-falla"
            :aria-label="`${studentStore.reviewsDueToday.length} para hoy`">
            {{ studentStore.reviewsDueToday.length }}
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

        <!-- Proyectos (docs/DISENO_PROYECTOS.md): solo si está disponible para esta cuenta (fase de prueba) -->
        <NuxtLink
          v-if="proyectosDisponible"
          to="/estudiante/proyectos"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path.startsWith('/estudiante/proyectos') ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <FolderCode :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mis proyectos</span>
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

        <!-- La clase como lugar (utils/pestanasClase.ts): cada clase abre su «Hoy», y adentro están sus pestañas
             (Contenido, Estudiantes, Entregas, Refuerzos, Ajustes). Antes el menú era por herramienta y cada pantalla
             volvía a preguntar de qué clase. -->
        <div v-if="clasesDocente.length" class="pt-2 pb-1">
          <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Tus clases</p>
          <NuxtLink
            v-for="c in clasesDocente"
            :key="c.id"
            :to="`/docente/clase/${c.id}`"
            :title="c.name"
            class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
            :class="claseActiva === c.id ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
            <BookOpen :size="18" aria-hidden="true" class="shrink-0" />
            <!-- Dos grupos de la misma materia se cortan igual: el código los distingue. -->
            <span class="min-w-0">
              <span class="block truncate">{{ c.name }}</span>
              <span v-if="c.code" class="block truncate font-mono text-[10px] font-normal text-base-texto-secundario">{{ c.code }}</span>
            </span>
          </NuxtLink>
        </div>

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
          to="/admin/sugerencias"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/sugerencias' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <MessageSquarePlus :size="18" aria-hidden="true" class="shrink-0" />
          <span>Sugerencias</span>
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
import { FolderCode, House, MessageSquarePlus, Repeat, TrendingUp, Mail, Users, BookOpen, Activity, ShieldCheck, Settings, ChevronDown, ChevronRight, Check } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { claseDeLaRuta } from '~/utils/pestanasClase'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const route = useRoute()

// Proyectos está en prueba: el menú solo lo muestra si el servidor dice que esta cuenta puede usarlo.
const proyectosDisponible = ref(false)
onMounted(async () => {
  if (authStore.currentRole !== 'estudiante') return
  try {
    proyectosDisponible.value = (await useApi().get<{ disponible: boolean }>('/proyectos/estado')).disponible
  } catch {
    proyectosDisponible.value = false
  }
})

// Las clases del docente para el menú; la activa sale de la dirección (ruta o consulta).
const clasesDocente = ref<Array<{ id: number; name: string; code?: string }>>([])
const claseActiva = computed(() => claseDeLaRuta(route.path, route.query))
onMounted(async () => {
  if (authStore.currentRole !== 'docente') return
  try {
    clasesDocente.value = await useApi().get<Array<{ id: number; name: string; code?: string }>>('/class/my-classes')
  } catch {
    clasesDocente.value = []
  }
})

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
    case 'dominado': return 'bg-estado-unidad-dominado'
    case 'en-progreso': return 'bg-estado-unidad-en-progreso'
    case 'por-iniciar': return 'bg-estado-unidad-por-iniciar'
    case 'bloqueado': return 'bg-estado-unidad-bloqueado'
    default: return 'bg-base-texto-secundario'
  }
}
</script>
