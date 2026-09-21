<template>
  <div class="w-full flex flex-col items-center">
    <!-- Guía de Identidad Visual Desplegable en la parte superior -->
    <VisualIdentityGuide @select-account="onSelectAccount" />

    <!-- Tarjeta Principal de Login -->
    <div class="w-full max-w-md">
      <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md transition-all">
        <!-- Encabezado con Isotipo STIRE -->
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

        <!-- Mensaje Informativo para Olvido de Clave -->
        <div v-if="showForgotInfo" class="mb-4 p-3 rounded-md bg-semantico-info/10 border border-semantico-info/30 text-xs text-semantico-info flex items-start justify-between gap-2">
          <div>
            <div class="font-bold mb-0.5">Acceso sin base de datos</div>
            <div>Puedes ingresar con cualquiera de las cuentas de prueba disponibles en la guía superior, o recuperar tu acceso con el administrador institucional.</div>
          </div>
          <button @click="showForgotInfo = false" class="text-semantico-info hover:opacity-80 font-bold">✕</button>
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
              class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none transition-colors" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-xs font-semibold text-base-texto-primario">
                Contraseña
              </label>
              <button 
                type="button" 
                @click="showForgotInfo = !showForgotInfo" 
                class="text-[11px] text-acento-ambar-fuerte hover:underline focus:outline-none">
                ¿Olvidaste tu clave?
              </button>
            </div>
            
            <!-- Campo de Contraseña con Botón de Ojo (Eye Toggle) -->
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full pl-3 pr-10 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none transition-colors font-mono" />
              
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-texto-secundario hover:text-base-texto-primario transition-colors p-1 rounded focus:outline-none">
                <!-- Icono de Ojo Abierto (cuando está oculta, para verla) -->
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Icono de Ojo Tachado (cuando está visible, para ocultarla) -->
                <svg v-else class="w-4 h-4 text-acento-ambar-fuerte" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
            <span v-if="isLoading" class="animate-spin text-sm">↻</span>
            <span v-if="isLoading">Verificando credenciales...</span>
            <span v-else>Ingresar a la plataforma</span>
          </button>
        </form>

        <!-- Enlace hacia Registro -->
        <div class="mt-4 text-center text-xs text-base-texto-secundario">
          <span>¿No tienes una cuenta aún?</span>
          <NuxtLink to="/auth/register" class="ml-1 text-acento-ambar-fuerte font-semibold hover:underline">
            Regístrate aquí
          </NuxtLink>
        </div>

        <!-- Acceso Rápido de Demostración por Rol -->
        <div class="relative my-6 text-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-base-borde-sutil"></div>
          </div>
          <span class="relative bg-base-blanco px-3 text-[11px] text-base-texto-secundario uppercase tracking-wider font-semibold">
            O acceso rápido por rol (1 Clic)
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            @click="quickDemoLogin('estudiante')"
            type="button"
            class="borde-afordancia p-2.5 rounded-lg bg-base-bg-secundario text-center hover:border-acento-ambar-fuerte hover:bg-base-blanco transition-all group">
            <span class="block text-lg mb-0.5 group-hover:scale-110 transition-transform">🎓</span>
            <span class="block text-[11px] font-bold text-base-texto-primario">Estudiante</span>
            <span class="block text-[9px] text-base-texto-secundario truncate">Pedro Romero</span>
          </button>

          <button
            @click="quickDemoLogin('docente')"
            type="button"
            class="borde-afordancia p-2.5 rounded-lg bg-base-bg-secundario text-center hover:border-acento-ambar-fuerte hover:bg-base-blanco transition-all group">
            <span class="block text-lg mb-0.5 group-hover:scale-110 transition-transform">👨‍🏫</span>
            <span class="block text-[11px] font-bold text-base-texto-primario">Docente</span>
            <span class="block text-[9px] text-base-texto-secundario truncate">Prof. Toscano</span>
          </button>

          <button
            @click="quickDemoLogin('administrador')"
            type="button"
            class="borde-afordancia p-2.5 rounded-lg bg-base-bg-secundario text-center hover:border-acento-ambar-fuerte hover:bg-base-blanco transition-all group">
            <span class="block text-lg mb-0.5 group-hover:scale-110 transition-transform">⚙️</span>
            <span class="block text-[11px] font-bold text-base-texto-primario">Admin</span>
            <span class="block text-[9px] text-base-texto-secundario truncate">Gestión</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import VisualIdentityGuide from '~/components/VisualIdentityGuide.vue'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const email = ref('pedro.estudiante@unicor.edu.co')
const password = ref('Test1234!')
const showPassword = ref(false)
const showForgotInfo = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

function onSelectAccount(account: { email: string; password: string; role: 'estudiante' | 'docente' | 'administrador' }) {
  email.value = account.email
  password.value = account.password
  errorMessage.value = ''
}

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.login(email.value, password.value)

  isLoading.value = false

  if (result.ok) {
    const role = authStore.currentRole
    if (role === 'docente') {
      await navigateTo('/docente')
    } else if (role === 'administrador' || role === 'admin') {
      await navigateTo('/admin')
    } else {
      await navigateTo('/estudiante')
    }
  } else {
    errorMessage.value = result.error || 'Error al iniciar sesión. Verifica tus credenciales.'
  }
}

async function quickDemoLogin(role: 'estudiante' | 'docente' | 'administrador') {
  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.switchRoleForDemo(role)
  isLoading.value = false

  if (result.ok) {
    if (role === 'docente') {
      await navigateTo('/docente')
    } else if (role === 'administrador') {
      await navigateTo('/admin')
    } else {
      await navigateTo('/estudiante')
    }
  } else {
    errorMessage.value = result.error || 'No se pudo iniciar la cuenta de demostración.'
  }
}
</script>
