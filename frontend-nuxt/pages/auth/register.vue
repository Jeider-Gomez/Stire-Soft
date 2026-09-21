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

      <!-- Alerta de Error -->
      <div v-if="errorMessage" role="alert" class="mb-4 p-3 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center gap-2">
        <span aria-hidden="true">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Aviso no bloqueante de clave no guardada (§19.1) -->
      <div v-if="tutorKeyWarning" role="status" class="mb-4 p-3 rounded-md bg-acento-ambar/10 border border-acento-ambar/30 text-xs text-acento-ambar-fuerte flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>{{ tutorKeyWarning }}</span>
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

        <!-- Clave de Google AI Studio (opcional, §19.1) -->
        <div class="border border-base-borde-sutil rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-base-texto-primario">
              Clave de Google AI Studio
              <span class="text-[10px] font-normal text-base-texto-secundario ml-1">(para usar el Tutor)</span>
            </span>
            <button
              type="button"
              @click="skipApiKey = !skipApiKey"
              class="text-[10px] text-base-texto-secundario underline hover:text-acento-ambar-fuerte transition-colors"
            >
              {{ skipApiKey ? 'Configurar ahora' : 'Omitir por ahora' }}
            </button>
          </div>

          <template v-if="!skipApiKey">
            <p class="text-[10px] text-base-texto-secundario">
              El Tutor usa tu cuenta gratuita de Google — sin costo para ti ni para el proyecto.
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                class="text-acento-ambar-fuerte underline ml-1"
              >Conseguir clave gratuita ↗</a>
            </p>
            <div class="relative">
              <label for="apiKey" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Tu clave de Google AI Studio</label>
              <input
                id="apiKey"
                v-model="apiKey"
                :type="showApiKey ? 'text' : 'password'"
                autocomplete="off"
                placeholder="AIzaSy…"
                class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none pr-10" />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                :aria-label="showApiKey ? 'Ocultar clave' : 'Mostrar clave'"
                class="absolute right-2 bottom-2 text-base-texto-secundario hover:text-base-texto-primario text-[11px]"
              >{{ showApiKey ? '🙈' : '👁️' }}</button>
            </div>
            <!-- Aviso de privacidad §19.3 -->
            <p class="text-[10px] text-base-texto-secundario">
              🔒 Tu clave se guarda cifrada y solo sirve para hablar con el Tutor; nadie del equipo puede verla.
              Las preguntas que le haces al Tutor se envían a Google usando <strong>tu</strong> cuenta.
              En la capa gratuita, Google puede usar ese contenido para mejorar sus productos: no escribas
              datos personales ni contraseñas en el chat.
            </p>
          </template>

          <p v-if="skipApiKey" class="text-[10px] text-base-texto-secundario italic">
            Podrás configurarla en cualquier momento desde el Tutor.
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
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const api = useApi()
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const classCode = ref('')
const apiKey = ref('')
const skipApiKey = ref(true)
const showApiKey = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const tutorKeyWarning = ref('')

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas ingresadas no coinciden.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  tutorKeyWarning.value = ''

  const result = await authStore.register(
    fullName.value,
    email.value,
    password.value,
    classCode.value
  )

  isLoading.value = false

  if (result.ok) {
    // Si el estudiante ingresó una clave, guardarla (no bloqueante — §19.1)
    if (!skipApiKey.value && apiKey.value.trim()) {
      try {
        await api.put('/tutor/api-key', { apiKey: apiKey.value.trim() })
      } catch {
        // Error no bloqueante: el registro ya fue exitoso
        tutorKeyWarning.value = 'Tu cuenta se creó, pero no pude guardar tu clave: puedes configurarla luego desde el Tutor.'
        // Dar un momento para que el usuario vea el aviso antes de navegar
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    navigateTo('/estudiante')
  } else {
    errorMessage.value = result.error || 'Error al procesar el registro.'
  }
}
</script>
