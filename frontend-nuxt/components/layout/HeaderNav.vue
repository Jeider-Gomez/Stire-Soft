<template>
  <!-- ===== HEADER INSTITUCIONAL STIRE SOFT ===== -->
  <header
    class="h-16 bg-white/95 glass-header border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm"
  >
    <!-- ── IZQUIERDA: Isotipo + Logotipo + Contexto Institucional ── -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Botón colapsar sidebar (mobile) -->
      <button
        @click="$emit('toggle-sidebar')"
        class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150 flex-shrink-0 md:hidden"
        aria-label="Abrir menú lateral"
      >
        <Menu :size="18" />
      </button>

      <!-- Isotipo + Logotipo -->
      <NuxtLink
        :to="homeRoute"
        class="flex items-center gap-2.5 group flex-shrink-0"
      >
        <!-- Isotipo [ST] con gradiente institucional -->
        <div
          class="w-9 h-9 rounded-xl gradient-stire flex items-center justify-center text-white font-poppins font-bold text-sm shadow-md
                 group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 flex-shrink-0"
        >
          ST
        </div>

        <!-- Logotipo tipográfico -->
        <div class="hidden sm:block leading-none">
          <span class="font-poppins font-bold text-base text-slate-800 tracking-tight">
            STIRE <span class="text-stire-blue">Soft</span>
          </span>
          <p class="text-[10px] text-slate-400 font-interfaz tracking-wide leading-tight mt-0.5">
            Unicor · Ing. Sistemas
          </p>
        </div>
      </NuxtLink>

      <!-- Separador + Contexto de clase (solo estudiante) -->
      <div
        v-if="authStore.currentRole === 'estudiante' && studentStore.currentClassName"
        class="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 min-w-0"
      >
        <GraduationCap :size="13" class="text-slate-400 flex-shrink-0" />
        <span class="text-xs text-slate-600 font-medium truncate max-w-[220px]">
          {{ studentStore.currentClassName }}
        </span>
        <span class="text-slate-300">•</span>
        <span class="text-xs text-slate-400 truncate max-w-[160px]">
          {{ studentStore.currentTeacher }}
        </span>
      </div>

      <!-- Contexto institucional docente/admin -->
      <div
        v-else-if="authStore.currentRole !== 'estudiante'"
        class="hidden lg:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200 text-xs text-slate-400"
      >
        <span>Universidad de Córdoba</span>
        <span class="text-slate-300">•</span>
        <span>Facultad de Ingeniería de Sistemas</span>
      </div>
    </div>

    <!-- ── DERECHA: Badge de rol + Avatar + Salir ── -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Botón Tutor IA (solo estudiante) -->
      <button
        v-if="authStore.currentRole === 'estudiante'"
        @click="tutorStore.toggleDrawer()"
        class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
               bg-stire-purple/10 text-stire-purple border border-stire-purple/25
               hover:bg-stire-purple/15 hover:-translate-y-0.5 hover:shadow-md
               active:scale-95 transition-all duration-200 text-xs font-semibold whitespace-nowrap"
      >
        <Sparkles :size="13" />
        <span>Tutor IA</span>
        <span class="pulse-dot ml-0.5" />
      </button>

      <!-- Badge de Rol -->
      <span :class="roleBadgeClass" class="hidden sm:inline-flex items-center gap-1.5">
        <span class="pulse-dot" v-if="authStore.currentRole === 'docente' || authStore.currentRole === 'administrador'" />
        {{ roleLabel }}
      </span>

      <!-- Notificaciones -->
      <LayoutNotificationBell />

      <!-- Separador -->
      <div class="w-px h-6 bg-slate-200 mx-1" />

      <!-- Avatar + menú usuario -->
      <div class="relative" ref="avatarMenuRef">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors duration-150 group"
          :aria-label="`Menú de ${authStore.user?.fullName || 'usuario'}`"
        >
          <div
            class="w-8 h-8 rounded-xl gradient-stire flex items-center justify-center
                   text-white font-bold text-xs shadow-sm group-hover:shadow-md transition-shadow"
          >
            {{ userInitials }}
          </div>
          <span class="hidden md:block text-xs font-medium text-slate-700 max-w-[120px] truncate">
            {{ authStore.user?.fullName?.split(' ')[0] }}
          </span>
        </button>

        <!-- Dropdown de usuario -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="showUserMenu"
            class="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50"
          >
            <!-- Info usuario -->
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-xs font-semibold text-slate-800">{{ authStore.user?.fullName }}</p>
              <p class="text-[11px] text-slate-400 mt-0.5">{{ authStore.user?.email }}</p>
            </div>

            <!-- Opción cerrar sesión -->
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-stire-danger
                     hover:bg-stire-danger/5 transition-colors duration-150 font-medium"
            >
              <LogOut :size="14" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Sparkles, LogOut, GraduationCap } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const studentStore = useStudentStore()
const tutorStore = useTutorStore()

const showUserMenu = ref(false)
const avatarMenuRef = ref<HTMLElement | null>(null)

// Cerrar el dropdown al hacer click fuera
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
function handleClickOutside(event: MouseEvent) {
  if (avatarMenuRef.value && !avatarMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

const homeRoute = computed(() => {
  switch (authStore.currentRole) {
    case 'docente': return '/docente'
    case 'administrador': return '/admin'
    default: return '/estudiante'
  }
})

const roleLabel = computed(() => {
  switch (authStore.currentRole) {
    case 'estudiante': return 'Estudiante'
    case 'docente': return 'Docente'
    case 'administrador': return 'Admin'
    default: return 'Usuario'
  }
})

const roleBadgeClass = computed(() => {
  switch (authStore.currentRole) {
    case 'docente':
      return 'badge-docente'
    case 'administrador':
      return 'badge-admin'
    default:
      return 'badge-estudiante'
  }
})

const userInitials = computed(() => {
  if (!authStore.user?.fullName) return 'U'
  return authStore.user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

function handleLogout() {
  showUserMenu.value = false
  authStore.logout()
  navigateTo('/auth/login')
}
</script>
