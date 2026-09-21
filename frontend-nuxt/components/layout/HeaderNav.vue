<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs">
    <!-- Identidad Institucional Oficial STIRE Soft -->
    <div class="flex items-center gap-3">
      <NuxtLink :to="homeRoute" class="flex items-center gap-2.5 group">
        <!-- Isotipo [ST] -->
        <div class="w-9 h-9 rounded-lg bg-stire-blue flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-stire-blue/20 group-hover:bg-stire-blue-dark transition-colors">
          ST
        </div>
        <!-- Texto de Marca y Contexto Institucional -->
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5 leading-tight">
            <span class="font-extrabold text-base tracking-tight text-stire-blue">STIRE</span>
            <span class="text-xs font-bold text-stire-purple bg-stire-purple-light px-1.5 py-0.2 rounded">Soft</span>
          </div>
          <span class="text-[10px] text-slate-500 font-medium tracking-tight hidden sm:inline">
            Universidad de Córdoba • Facultad de Ingeniería
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Barra Central Informativa para Estudiante -->
    <div
      v-if="authStore.currentRole === 'estudiante' && studentStore.currentClassName"
      class="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-full">
      <span class="w-2 h-2 rounded-full bg-stire-teal animate-pulse"></span>
      <span class="font-semibold text-slate-800">{{ studentStore.currentClassName }}</span>
      <span class="text-slate-400">•</span>
      <span class="text-slate-500">{{ studentStore.currentTeacher }}</span>
    </div>

    <!-- Acciones Derecha: Tutor IA + Perfil de Usuario -->
    <div class="flex items-center gap-3">
      <!-- Acceso Rápido Tutor IA para Estudiante -->
      <button
        v-if="authStore.currentRole === 'estudiante'"
        @click="tutorStore.toggleDrawer()"
        type="button"
        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stire-purple/10 text-stire-purple border border-stire-purple/30 hover:bg-stire-purple hover:text-white transition-all shadow-2xs">
        <span>✨</span>
        <span>Tutor IA</span>
      </button>

      <!-- Información de Usuario y Distintivo de Rol -->
      <div class="flex items-center gap-3 pl-3 border-l border-slate-200">
        <!-- Avatar y Datos -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-stire-blue/10 text-stire-blue border border-stire-blue/20 flex items-center justify-center text-xs font-bold shadow-2xs">
            {{ userInitials }}
          </div>
          <div class="hidden md:flex flex-col text-left">
            <span class="text-xs font-bold text-slate-800 leading-tight">
              {{ authStore.user?.fullName || 'Usuario Institucional' }}
            </span>
            <span class="text-[10px] text-slate-500 truncate max-w-[180px]">
              {{ authStore.user?.email || 'unicor.edu.co' }}
            </span>
          </div>
        </div>

        <!-- Distintivo de Rol con color institucional -->
        <span
          class="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors"
          :class="roleBadgeClass">
          {{ roleLabel }}
        </span>

        <!-- Botón de Cierre de Sesión Claro y Accesible -->
        <button
          @click="handleLogout"
          type="button"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-stire-danger transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const tutorStore = useTutorStore()

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
    case 'administrador': return 'Administrador'
    default: return 'Usuario'
  }
})

const roleBadgeClass = computed(() => {
  switch (authStore.currentRole) {
    case 'docente':
      return 'bg-stire-purple/10 text-stire-purple border border-stire-purple/30'
    case 'administrador':
      return 'bg-stire-blue/10 text-stire-blue border border-stire-blue/30'
    default:
      return 'bg-stire-teal/10 text-stire-teal-dark border border-stire-teal/30'
  }
})

const userInitials = computed(() => {
  if (!authStore.user?.fullName) return 'U'
  return authStore.user.fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

function handleLogout() {
  authStore.logout()
  navigateTo('/auth/login')
}
</script>
