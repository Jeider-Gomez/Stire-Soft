<template>
  <!-- v3 (Fase C; cuadro «Entrar-estados» › «¿Olvidaste tu contraseña?»): el mismo marco que Entrar. La respuesta es
       siempre la misma, exista o no la cuenta (seguridad). -->
  <AuthMarcoEntrar compacto :mascota="{ campo: enFoco ? 'email' : null, verClave: false, error: !!errorMessage, listo: false, pestana: 'cuenta' }">
    <!-- Enviado: la mascota y lo que pasa ahora -->
    <div v-if="sent" role="status" class="flex flex-col items-center gap-3 text-center py-2">
      <TutorMascota expresion="contento" :tamano="72" aria-hidden="true" />
      <h1 class="m-0 font-poppins font-bold text-[22px]">Te escribimos al correo</h1>
      <p class="m-0 text-[15px] leading-relaxed text-base-texto-secundario">{{ sentMessage }} El enlace vence en 30 minutos.</p>
      <p class="m-0 text-sm text-base-texto-secundario">Si no llega, revisa la carpeta de spam o pide uno nuevo.</p>
      <NuxtLink to="/auth/login" class="boton-secundario w-full mt-1">Volver a entrar</NuxtLink>
    </div>

    <template v-else>
      <div>
        <h1 class="m-0 font-poppins font-bold text-[24px] sm:text-[28px]">¿Olvidaste tu contraseña?</h1>
        <p class="mt-1 mb-0 text-[15px] text-base-texto-secundario">Te enviamos un enlace para crear una nueva.</p>
      </div>

      <div v-if="errorMessage" role="alert" class="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold aviso-error">
        <AlertCircle :size="18" class="shrink-0 mt-px" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>

      <form novalidate class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-[15px] font-semibold">Correo con el que te registraste</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="tu@correo.com" class="campo-entrar"
            :class="{ 'campo-con-error': falta }" :aria-invalid="!!falta || undefined" :aria-describedby="falta ? 'correo-falta' : undefined"
            @focus="enFoco = true" @blur="enFoco = false" @input="falta = ''" />
          <p v-if="falta" id="correo-falta" class="m-0 text-xs font-semibold text-semantico-falla">{{ falta }}</p>
        </div>
        <button type="submit" :disabled="isLoading" class="boton-entrar disabled:cursor-wait">
          <span v-if="isLoading">Enviando…</span>
          <span v-else>Enviarme el enlace</span>
        </button>
      </form>

      <!-- Antes estaba en el inicio de sesión; aquí es donde se necesita. -->
      <p class="m-0 text-sm text-base-texto-secundario text-center leading-relaxed">
        ¿No te llega el correo? Pídele a tu docente o al administrador que restablezca tu contraseña desde STIRE.
      </p>
      <p class="m-0 pt-3 border-t border-base-borde-sutil text-center text-sm">
        <NuxtLink to="/auth/login" class="inline-flex items-center gap-1 min-h-[44px] font-semibold underline">
          <ArrowLeft :size="15" aria-hidden="true" /> Volver a entrar
        </NuxtLink>
      </p>
    </template>
  </AuthMarcoEntrar>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft } from 'lucide-vue-next'
import { useCuentaPublica } from '~/composables/useCuentaPublica'
import { faltantesDelIngreso } from '~/utils/registro'

definePageMeta({ layout: 'auth' })

const cuentaPublica = useCuentaPublica()
const email = ref('')
const enFoco = ref(false)
const falta = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const sent = ref(false)
const sentMessage = ref('')

async function handleSubmit() {
  // El error se ve bajo el campo y dice cómo arreglarlo (PAT-03), con las mismas reglas que Entrar.
  falta.value = faltantesDelIngreso(email.value, 'x').email ?? ''
  if (falta.value) { document.getElementById('email')?.focus(); return }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await cuentaPublica.solicitarRestablecimiento(email.value.trim())
    sentMessage.value = res?.message || 'Si el correo está registrado, te llega un enlace para crear una contraseña nueva.'
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
