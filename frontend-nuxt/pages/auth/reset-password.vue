<template>
  <!-- v3 (Fase C): crear la contraseña nueva con el mismo marco que Entrar. Como en el registro (BT-27), sin «repite la
       contraseña»: el ojo para verla y la barra de fuerza evitan el mismo error con la mitad del trabajo. -->
  <AuthMarcoEntrar compacto :mascota="{ campo: enFoco ? 'password' : null, verClave, error: !!errorMessage, listo: done, pestana: 'cuenta' }">
    <!-- Enlace sin token -->
    <div v-if="!token" role="alert" class="flex flex-col gap-3">
      <h1 class="m-0 font-poppins font-bold text-[24px]">Este enlace no sirve</h1>
      <p class="m-0 text-[15px] text-base-texto-secundario">Abre el enlace completo que te llegó por correo o pide uno nuevo.</p>
      <NuxtLink to="/auth/forgot-password" class="boton-entrar">Pedir un enlace nuevo</NuxtLink>
    </div>

    <!-- Listo -->
    <div v-else-if="done" role="status" class="flex flex-col items-center gap-3 text-center py-2">
      <TutorMascota expresion="acierto" :tamano="72" aria-hidden="true" />
      <h1 class="m-0 font-poppins font-bold text-[22px]">Tu contraseña está lista</h1>
      <p class="m-0 text-[15px] leading-relaxed text-base-texto-secundario">Ya puedes entrar con ella. Las sesiones abiertas en otros dispositivos se cerraron.</p>
      <NuxtLink to="/auth/login" class="boton-entrar w-full mt-1">Entrar</NuxtLink>
    </div>

    <template v-else>
      <div>
        <h1 class="m-0 font-poppins font-bold text-[24px] sm:text-[28px]">Crea tu contraseña nueva</h1>
        <p class="mt-1 mb-0 text-[15px] text-base-texto-secundario">La usarás desde ahora para entrar a STIRE.</p>
      </div>

      <div v-if="errorMessage" role="alert" class="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold aviso-error">
        <AlertCircle :size="18" class="shrink-0 mt-px" aria-hidden="true" />
        <span>{{ errorMessage }}
          <NuxtLink v-if="linkExpired" to="/auth/forgot-password" class="underline">Pide un enlace nuevo</NuxtLink></span>
      </div>

      <form novalidate class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-[15px] font-semibold">Contraseña nueva</label>
          <div class="relative">
            <input id="password" v-model="password" :type="verClave ? 'text' : 'password'" required autocomplete="new-password"
              placeholder="Crea una contraseña" aria-describedby="reglas-clave" class="campo-entrar pr-12"
              :class="{ 'campo-con-error': falta }" :aria-invalid="falta || undefined"
              @focus="enFoco = true" @blur="enFoco = false" @input="falta = false" />
            <button type="button" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg text-base-texto-secundario hover:text-base-texto-primario"
              :aria-label="verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'" :title="verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'"
              :aria-pressed="verClave" @click="verClave = !verClave">
              <EyeOff v-if="verClave" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
          <AuthFuerzaClave id="reglas-clave" :clave="password" :falta="falta" />
        </div>
        <button type="submit" :disabled="isLoading" class="boton-entrar disabled:cursor-wait">
          <span v-if="isLoading">Guardando…</span>
          <span v-else>Guardar mi contraseña</span>
        </button>
      </form>
    </template>
  </AuthMarcoEntrar>
</template>

<script setup lang="ts">
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next'
import { useCuentaPublica } from '~/composables/useCuentaPublica'
import { reglasDeClave } from '~/utils/fuerzaClave'

definePageMeta({ layout: 'auth' })

const cuentaPublica = useCuentaPublica()
const route = useRoute()
const token = computed(() => String(route.query.token || ''))
const password = ref('')
const verClave = ref(false)
const enFoco = ref(false)
const falta = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const linkExpired = ref(false)
const done = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  linkExpired.value = false
  // Las mismas reglas del servidor que se ven debajo del campo: si falta alguna, se marca en rojo y no se envía.
  falta.value = !reglasDeClave(password.value).every((r) => r.cumple)
  if (falta.value) { document.getElementById('password')?.focus(); return }
  isLoading.value = true
  try {
    await cuentaPublica.restablecerContrasena(token.value, password.value)
    done.value = true
  } catch (err) {
    // El código y el motivo del servidor, leídos sin «any» (composables/useApiErrorMessage.ts).
    const { status, detail: text } = useApiErrorMessage().extract(err)
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
