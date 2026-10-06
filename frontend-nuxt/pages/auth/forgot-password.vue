<template>
  <div class="w-full max-w-md">
    <div class="relative bg-base-blanco/95 rounded-3xl border border-slate-200/90 p-8 shadow-xl shadow-stire-blue/10 backdrop-blur-2xl overflow-hidden animar-entrada">
      <div class="absolute top-0 inset-x-0 h-[3px] linea-marca" aria-hidden="true" />
      <div class="text-center mb-6">
        <LayoutMarcaST tamano="grande" class="mx-auto mb-3.5" />
        <h1 class="text-2xl font-bold tracking-tight font-poppins text-slate-900">Recuperar contraseña</h1>
        <p class="text-sm text-slate-600 mt-1">
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
        <div v-if="errorMessage" role="alert" class="mb-4 flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm border-2 bg-red-50 border-red-300 text-red-700 font-semibold">
          <AlertCircle :size="18" class="shrink-0 mt-px text-red-600" aria-hidden="true" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Correo con el que te registraste
            </label>
            <div class="relative">
              <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="usuario@unicor.edu.co"
                class="campo-auth pl-10 pr-3" />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 rounded-xl font-bold text-sm font-poppins text-[#070e24] bg-stire-teal hover:bg-[#14e2c8] focus:outline-none focus-visible:ring-4 focus-visible:ring-stire-teal/40 shadow-lg shadow-stire-teal/20 transition-colors disabled:opacity-60 disabled:cursor-wait">
            <span v-if="isLoading">Enviando…</span>
            <span v-else>Enviarme el enlace</span>
          </button>
        </form>
      </template>

      <!-- Antes estaba en el inicio de sesión; aquí es donde se necesita. -->
      <p class="mt-4 text-xs text-slate-600 text-center leading-relaxed">
        ¿No te llega el correo? Pídele a tu docente o al administrador que restablezca tu contraseña desde STIRE.
      </p>

      <div class="mt-4 text-center text-sm">
        <NuxtLink to="/auth/login" class="inline-flex items-center gap-1 text-stire-blue font-semibold hover:underline">
          <ArrowLeft :size="14" aria-hidden="true" /> Volver a iniciar sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft, Mail } from 'lucide-vue-next'
import { useCuentaPublica } from '~/composables/useCuentaPublica'

definePageMeta({ layout: 'auth' })

const cuentaPublica = useCuentaPublica()
const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const sent = ref(false)
const sentMessage = ref('')

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await cuentaPublica.solicitarRestablecimiento(email.value.trim())
    sentMessage.value = res?.message || 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.'
    sent.value = true
  } catch (err) {
    // El código y el motivo del servidor, leídos sin «any» (composables/useApiErrorMessage.ts).
    const { status, detail: m } = useApiErrorMessage().extract(err)
    errorMessage.value = status === 429
      ? 'Hiciste varias solicitudes seguidas. Espera un minuto e inténtalo de nuevo.'
      : m || 'No pudimos procesar la solicitud. Inténtalo de nuevo en un momento.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* El mismo campo que el inicio de sesión (prototipo de José). */
.campo-auth {
  @apply w-full py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 transition-all
         focus:outline-none focus:border-stire-blue focus:ring-2 focus:ring-stire-blue/15;
}
</style>
