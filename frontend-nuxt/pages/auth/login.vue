<template>
  <div class="w-full flex flex-col items-center">
    <!-- Guía de Identidad Visual Desplegable en la parte superior -->
    <VisualIdentityGuide @select-account="onSelectAccount" />

    <!-- Tarjeta Principal de Login -->
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-md transition-all">
        <!-- Encabezado con Isotipo STIRE Institucional -->
        <div class="text-center mb-6">
          <div class="inline-flex w-12 h-12 rounded-xl bg-stire-blue items-center justify-center text-white font-bold text-lg mb-2 shadow-sm ring-4 ring-stire-blue/15">
            ST
          </div>
          <div class="flex items-center justify-center gap-1.5 mb-1">
            <span class="text-xl font-extrabold tracking-tight text-stire-blue">STIRE</span>
            <span class="text-sm font-bold text-stire-purple bg-stire-purple-light px-2 py-0.5 rounded">Soft</span>
          </div>
          <p class="text-xs text-slate-500 font-medium">
            Universidad de Córdoba • Facultad de Ingeniería
          </p>
          <p class="text-[11px] text-slate-400 mt-1">
            Sistema Tutor Inteligente para Resolución de Ejercicios
          </p>
        </div>

        <!-- Alerta de Error (si hay) -->
        <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-stire-danger flex items-center gap-2">
          <span class="font-bold">⚠</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Mensaje Informativo para Olvido de Clave -->
        <div v-if="showForgotInfo" class="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start justify-between gap-2">
          <div>
            <div class="font-bold text-slate-900 mb-0.5">Acceso Institucional</div>
            <div class="text-slate-500">Puedes ingresar con cualquiera de las cuentas de prueba disponibles en la guía superior, o recuperar tu acceso con el administrador del sistema.</div>
          </div>
          <button @click="showForgotInfo = false" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <!-- Formulario de Acceso -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
              Correo Institucional
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="usuario@unicor.edu.co"
              class="w-full px-3.5 py-2.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:border-stire-blue focus:bg-white outline-none transition-colors" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-xs font-semibold text-slate-700">
                Contraseña
              </label>
              <button 
                type="button" 
                @click="showForgotInfo = !showForgotInfo" 
                class="text-[11px] text-stire-blue hover:underline focus:outline-none font-medium">
                ¿Olvidaste tu clave?
              </button>
            </div>
            
            <!-- Campo de Contraseña con Botón de Ojo -->
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:border-stire-blue focus:bg-white outline-none transition-colors font-mono" />
              
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded focus:outline-none">
                <!-- Icono de Ojo Abierto -->
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Icono de Ojo Tachado -->
                <svg v-else class="w-4 h-4 text-stire-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 px-4 rounded-lg bg-stire-blue hover:bg-stire-blue-dark active:scale-[0.99] text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isLoading" class="animate-spin text-sm">↻</span>
            <span v-if="isLoading">Verificando credenciales...</span>
            <span v-else>Ingresar a la Plataforma</span>
          </button>
        </form>

        <!-- Enlace hacia Registro -->
        <div class="mt-4 text-center text-xs text-slate-500">
          <span>¿No tienes una cuenta aún?</span>
          <NuxtLink to="/auth/register" class="ml-1 text-stire-blue font-semibold hover:underline">
            Regístrate aquí
          </NuxtLink>
        </div>

        <!-- Acceso Rápido de Demostración por Rol -->
        <div class="relative my-6 text-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200"></div>
          </div>
          <span class="relative bg-white px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            O acceso rápido por rol (1 Clic)
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            @click="quickDemoLogin('estudiante')"
            type="button"
            class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:border-stire-teal hover:bg-white transition-all group shadow-2xs">
            <span class="block text-lg mb-0.5 group-hover:scale-110 transition-transform">🎓</span>
            <span class="block text-[11px] font-bold text-slate-800">Estudiante</span>
            <span class="block text-[9px] text-slate-400 truncate">Pedro Romero</span>
          </button>

          <button
            @click="quickDemoLogin('docente')"
            type="button"
            class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:border-stire-purple hover:bg-white transition-all group shadow-2xs">
            <span class="block text-lg mb-0.5 group-hover:scale-110 transition-transform">👨‍🏫</span>
            <span class="block text-[11px] font-bold text-slate-800">Docente</span>
            <span class="block text-[9px] text-slate-400 truncate">Prof. Toscano</span>
          </button>

          <button
            @click="quickDemoLogin('administrador')"
            type="button"
            class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:border-stire-blue hover:bg-white transition-all group shadow-2xs">
            <span class="block text-lg mb-0.5 group-hover:scale-110 transition-transform">⚙️</span>
            <span class="block text-[11px] font-bold text-slate-800">Admin</span>
            <span class="block text-[9px] text-slate-400 truncate">Gestión Clúster</span>
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
