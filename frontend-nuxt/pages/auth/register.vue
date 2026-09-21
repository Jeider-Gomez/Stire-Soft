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
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-3 pr-10 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-texto-secundario hover:text-base-texto-primario transition-colors p-1 rounded focus:outline-none">
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4 text-acento-ambar-fuerte" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
          <p class="text-[10px] text-base-texto-secundario mt-1">
            Mínimo 6 caracteres: al menos una mayúscula, minúscula, número y carácter especial.
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Confirmar Contraseña
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-3 pr-10 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :title="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-texto-secundario hover:text-base-texto-primario transition-colors p-1 rounded focus:outline-none">
              <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4 text-acento-ambar-fuerte" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label for="classCode" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Código de Clase <span class="text-[10px] font-normal text-base-texto-secundario">(Opcional)</span>
          </label>
          <input
            id="classCode"
            v-model="classCode"
            type="text"
            placeholder="Ej: WEB-ALGO-T01"
            class="w-full px-3 py-2 text-xs uppercase tracking-wider rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          <p class="text-[10px] text-base-texto-secundario mt-1">
            Si tu docente te suministró un código de clase, ingrésalo para matricularte de inmediato.
          </p>
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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const classCode = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas ingresadas no coinciden.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.register(
    fullName.value,
    email.value,
    password.value,
    classCode.value
  )

  isLoading.value = false

  if (result.ok) {
    navigateTo('/estudiante')
  } else {
    errorMessage.value = result.error || 'Error al procesar el registro.'
  }
}
</script>
