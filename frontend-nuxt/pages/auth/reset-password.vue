<template>
  <div class="w-full max-w-md">
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md">
      <div class="text-center mb-6">
        <div class="inline-flex w-12 h-12 rounded-xl bg-acento-ambar items-center justify-center text-base-blanco font-bold text-lg mb-3 shadow-sm">
          ST
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Elige tu contraseña nueva</h1>
      </div>

      <!-- Enlace sin token -->
      <div v-if="!token" role="alert" class="p-4 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla space-y-2">
        <p class="font-bold">Este enlace no es válido.</p>
        <p>Abre el enlace completo que te llegó por correo o solicita uno nuevo.</p>
        <NuxtLink to="/auth/forgot-password" class="inline-block font-semibold underline">Solicitar un enlace nuevo</NuxtLink>
      </div>

      <!-- Listo -->
      <div v-else-if="done" role="status" class="p-4 rounded-md bg-semantico-pasa/10 border border-semantico-pasa/30 text-xs space-y-3">
        <p class="font-bold text-semantico-pasa">Tu contraseña se actualizó.</p>
        <p class="text-base-texto-primario">Ya puedes iniciar sesión con la nueva contraseña. Las sesiones abiertas en otros dispositivos se cerraron.</p>
        <NuxtLink
          to="/auth/login"
          class="block text-center py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold transition-colors shadow-sm">
          Ir a iniciar sesión
        </NuxtLink>
      </div>

      <template v-else>
        <div v-if="errorMessage" role="alert" class="mb-4 p-3 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla space-y-1">
          <p class="flex items-center gap-2"><span>⚠</span><span>{{ errorMessage }}</span></p>
          <NuxtLink v-if="linkExpired" to="/auth/forgot-password" class="inline-block font-semibold underline">
            Solicitar un enlace nuevo
          </NuxtLink>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="password" class="block text-xs font-semibold text-base-texto-primario mb-1">Contraseña nueva</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
            <p class="text-[11px] text-base-texto-secundario mt-1">
              Mínimo 6 caracteres, con mayúscula, minúscula y un número o símbolo.
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-xs font-semibold text-base-texto-primario mb-1">Repite la contraseña</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50">
            <span v-if="isLoading">Guardando...</span>
            <span v-else>Guardar contraseña</span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

const api = useApi()
const route = useRoute()
const token = computed(() => String(route.query.token || ''))
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const linkExpired = ref(false)
const done = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  linkExpired.value = false
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }
  isLoading.value = true
  try {
    await api.post('/auth/reset-password', { token: token.value, password: password.value })
    done.value = true
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    const m = err?.data?.error ?? err?.data?.message
    const text = Array.isArray(m) ? m.join(' · ') : m
    if (status === 429) {
      errorMessage.value = 'Demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.'
    } else {
      errorMessage.value = text || 'No pudimos cambiar la contraseña. Inténtalo de nuevo.'
      // 400 con enlace inválido/vencido: la acción útil es pedir otro enlace
      linkExpired.value = status === 400 && /enlace/i.test(String(text))
    }
  } finally {
    isLoading.value = false
  }
}
</script>
