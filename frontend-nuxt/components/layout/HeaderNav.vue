<template>
  <header class="h-16 bg-base-blanco border-b border-base-borde-sutil flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
    <!-- Logo y Nombre del Sistema -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/estudiante" class="flex items-center gap-2 font-bold text-lg text-base-texto-primario hover:opacity-90">
        <div class="w-8 h-8 rounded-md bg-acento-ambar flex items-center justify-center text-base-blanco font-bold text-sm shadow-sm">
          ST
        </div>
        <span class="tracking-tight">STIRE<span class="text-acento-ambar-fuerte font-semibold text-sm ml-1">Soft</span></span>
      </NuxtLink>

      <span class="text-xs px-2 py-0.5 rounded-full font-medium"
        :class="{
          'bg-acento-ambar/10 text-acento-ambar-fuerte': authStore.currentRole === 'estudiante',
          'bg-semantico-info/10 text-semantico-info': authStore.currentRole === 'docente',
          'bg-semantico-pasa/10 text-semantico-pasa': authStore.currentRole === 'administrador'
        }">
        Rol: {{ roleLabel }}
      </span>
    </div>

    <!-- Barra Central Informativa / Curso: solo tiene sentido para el estudiante,
         que siempre está dentro del contexto de una clase concreta. Docente y
         administrador navegan entre varias clases o no tienen una "clase actual". -->
    <div
      v-if="authStore.currentRole === 'estudiante'"
      class="hidden md:flex items-center gap-2 text-xs text-base-texto-secundario bg-base-bg-secundario px-3 py-1.5 rounded-md">
      <span class="font-medium text-base-texto-primario">{{ studentStore.currentClassName }}</span>
      <span>•</span>
      <span>{{ studentStore.currentTeacher }}</span>
    </div>

    <!-- Acciones Derecha: Tutor IA + Perfil -->
    <div class="flex items-center gap-3">
      <!-- Botón Tutor IA (EST-V04 Trigger) -->
      <button
        v-if="authStore.currentRole === 'estudiante'"
        @click="tutorStore.toggleDrawer()"
        class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 bg-base-blanco text-acento-ambar-fuerte hover:bg-acento-ambar/10">
        <span>✨</span>
        <span>Tutor IA</span>
      </button>

      <!-- Usuario y Salir -->
      <div class="flex items-center gap-2 pl-2 border-l border-base-borde-sutil">
        <div class="w-7 h-7 rounded-full bg-base-bg-secundario border border-base-borde-fuerte flex items-center justify-center text-xs font-bold text-base-texto-primario">
          {{ userInitials }}
        </div>
        <button
          @click="handleLogout"
          title="Cerrar sesión"
          class="text-xs text-base-texto-secundario hover:text-semantico-falla p-1">
          Salir
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const tutorStore = useTutorStore()

const roleLabel = computed(() => {
  switch (authStore.currentRole) {
    case 'estudiante': return 'Estudiante'
    case 'docente': return 'Docente'
    case 'administrador': return 'Administrador'
    default: return 'Usuario'
  }
})

const userInitials = computed(() => {
  if (!authStore.user?.fullName) return 'U'
  return authStore.user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

function handleLogout() {
  authStore.logout()
  navigateTo('/auth/login')
}
</script>
