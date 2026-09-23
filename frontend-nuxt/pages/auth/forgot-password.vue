<template>
  <div class="w-full max-w-md">
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md">
      <div class="text-center mb-6">
        <div class="inline-flex w-12 h-12 rounded-xl bg-acento-ambar items-center justify-center text-base-blanco font-bold text-lg mb-3 shadow-sm">
          ST
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Recuperar contraseña</h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          Te enviaremos un enlace a tu correo para que elijas una contraseña nueva
        </p>
      </div>

      <!-- Confirmación (siempre igual, exista o no la cuenta) -->
      <div v-if="sent" role="status" class="p-4 rounded-md bg-semantico-pasa/10 border border-semantico-pasa/30 text-xs text-base-texto-primario space-y-2">
        <p class="font-bold text-semantico-pasa">Revisa tu correo</p>
        <p>{{ sentMessage }}</p>
        <p class="text-base-texto-secundario">
          El enlace vale 30 minutos. Si no llega, revisa la carpeta de spam o solicita uno nuevo.
        </p>
      </div>

      <template v-else>
        <div v-if="errorMessage" role="alert" class="mb-4 p-3 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center gap-2">
          <span>⚠</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-xs font-semibold text-base-texto-primario mb-1">
              Correo con el que te registraste
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="usuario@unicor.edu.co"
              class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50">
            <span v-if="isLoading">Enviando...</span>
            <span v-else>Enviarme el enlace</span>
          </button>
        </form>
      </template>

      <div class="mt-4 text-center text-xs text-base-texto-secundario">
        <NuxtLink to="/auth/login" class="text-acento-ambar-fuerte font-semibold hover:underline">
          ← Volver a iniciar sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

const api = useApi()
const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const sent = ref(false)
const sentMessage = ref('')

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email: email.value.trim() })
    sentMessage.value = res?.message || 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.'
    sent.value = true
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    const m = err?.data?.error ?? err?.data?.message
    errorMessage.value = status === 429
      ? 'Hiciste varias solicitudes seguidas. Espera un minuto e inténtalo de nuevo.'
      : (Array.isArray(m) ? m.join(' · ') : m) || 'No pudimos procesar la solicitud. Inténtalo de nuevo en un momento.'
  } finally {
    isLoading.value = false
  }
}
</script>
