<template>
  <div class="w-full max-w-md">
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md">
      <!-- Título de la Tarjeta COMP-V00 -->
      <div class="text-center mb-6">
        <div class="inline-flex w-12 h-12 rounded-xl bg-acento-ambar items-center justify-center text-base-blanco font-bold text-lg mb-3 shadow-sm">
          ST
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Iniciar Sesión</h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          Ingresa a tu entorno de aprendizaje y tutoría inteligente
        </p>
      </div>

      <!-- Alerta de Error (si hay) -->
      <div v-if="errorMessage" class="mb-4 p-3 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center gap-2">
        <span>⚠</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Formulario de Acceso -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Correo Institucional
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="usuario@unicor.edu.co"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="password" class="block text-xs font-semibold text-base-texto-primario">
              Contraseña
            </label>
            <a href="#" class="text-[11px] text-acento-ambar-fuerte hover:underline">¿Olvidaste tu clave?</a>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2">
          <span v-if="isLoading">Verificando credenciales...</span>
          <span v-else>Ingresar a la plataforma</span>
        </button>
      </form>

      <!-- Divisor Demo -->
      <div class="relative my-6 text-center">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-base-borde-sutil"></div>
        </div>
        <span class="relative bg-base-blanco px-3 text-[11px] text-base-texto-secundario uppercase tracking-wider">
          O acceso rápido de demostración
        </span>
      </div>

      <!-- Botones de Acceso Rápido por Rol -->
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="quickDemoLogin('estudiante')"
          type="button"
          class="borde-afordancia p-2 rounded-md bg-base-bg-secundario text-center hover:border-acento-ambar-fuerte">
          <span class="block text-base mb-0.5">🎓</span>
          <span class="block text-[11px] font-bold text-base-texto-primario">Estudiante</span>
          <span class="block text-[9px] text-base-texto-secundario">Pedro Romero</span>
        </button>

        <button
          @click="quickDemoLogin('docente')"
          type="button"
          class="borde-afordancia p-2 rounded-md bg-base-bg-secundario text-center hover:border-acento-ambar-fuerte">
          <span class="block text-base mb-0.5">👨‍🏫</span>
          <span class="block text-[11px] font-bold text-base-texto-primario">Docente</span>
          <span class="block text-[9px] text-base-texto-secundario">Prof. Toscano</span>
        </button>

        <button
          @click="quickDemoLogin('administrador')"
          type="button"
          class="borde-afordancia p-2 rounded-md bg-base-bg-secundario text-center hover:border-acento-ambar-fuerte">
          <span class="block text-base mb-0.5">⚙️</span>
          <span class="block text-[11px] font-bold text-base-texto-primario">Admin</span>
          <span class="block text-[9px] text-base-texto-secundario">Gestión</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Role } from '~/types'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
// Credenciales reales del seeder — facilita pruebas
const email = ref('pedro.estudiante@unicor.edu.co')
const password = ref('Test1234!')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.login(email.value, password.value)

  isLoading.value = false

  if (result.ok) {
    // Redirigir al dashboard según el rol que devolvió el backend
    const role = authStore.currentRole
    if (role === 'docente') navigateTo('/docente')
    else if (role === 'administrador') navigateTo('/admin')
    else navigateTo('/estudiante')
  } else {
    errorMessage.value = result.error || 'Error al iniciar sesión. Verifica tus credenciales.'
  }
}

async function quickDemoLogin(role: Role) {
  isLoading.value = true
  const result = await authStore.login(role)
  isLoading.value = false

  if (result.ok) {
    if (role === 'docente') navigateTo('/docente')
    else if (role === 'administrador') navigateTo('/admin')
    else navigateTo('/estudiante')
  }
}
</script>

