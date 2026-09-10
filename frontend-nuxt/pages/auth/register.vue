<template>
  <div class="w-full max-w-md">
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md">
      <!-- Encabezado COMP-V00 · Registro -->
      <div class="text-center mb-6">
        <div class="inline-flex w-12 h-12 rounded-xl bg-acento-ambar items-center justify-center text-base-blanco font-bold text-lg mb-3 shadow-sm">
          ST
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Crear Cuenta de Estudiante</h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          Regístrate para acceder al entorno de tutoría inteligente de STIRE
        </p>
      </div>

      <!-- Alerta de Error (si hay) -->
      <div v-if="errorMessage" class="mb-4 p-3 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center gap-2">
        <span>⚠</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Formulario de Registro -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="fullName" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Nombre Completo
          </label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            required
            placeholder="Ej: Pedro Romero Mendoza"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

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
          <label for="password" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          <p class="text-[10px] text-base-texto-secundario mt-1">
            Mínimo 6 caracteres: al menos una mayúscula, minúscula, número y carácter especial.
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Confirmar Contraseña
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2">
          <span v-if="isLoading">Registrando cuenta...</span>
          <span v-else>Completar Registro</span>
        </button>
      </form>

      <!-- Enlace hacia Login -->
      <div class="mt-6 pt-4 border-t border-base-borde-sutil text-center text-xs text-base-texto-secundario">
        <span>¿Ya tienes una cuenta registrada?</span>
        <NuxtLink to="/auth/login" class="ml-1 text-acento-ambar-fuerte font-semibold hover:underline">
          Inicia sesión aquí
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas ingresadas no coinciden.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.register(fullName.value, email.value, password.value)

  isLoading.value = false

  if (result.ok) {
    navigateTo('/estudiante')
  } else {
    errorMessage.value = result.error || 'Error al procesar el registro.'
  }
}
</script>
